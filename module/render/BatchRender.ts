import { forarr, foreach } from "../../../melon_runtime/Attibute.js";
import { Sprite } from "../../display/Sprite.js";
import { Geometry } from "../../display/stage3D/Geometry.js";
import { IStageRenderOption } from "../../display/stage3D/Renderer.js";
import { context3D } from "../../display/stage3D/Stage3D.js";
import { BitmapRender } from "./BitmapRender.js";
import { singleton, recyclable } from "../../../melon_runtime/ClassUtils.js";
import { BitmapMaterial } from "../material/BitmapMaterial.js";
import { newMatrix3D } from "../../core/Matrix3D.js";
import { BatchMaterial } from "../material/BatchMaterial.js";
import { componentSource } from "../../display/source/BitmapSource.js";
import { UniformFunc } from "../../display/stage3D/Attibute.js";

export interface IBatchRenderer extends IRenderer {

    root: IRenderer;

    // status: number;

    current: IRenderer;

    sources: { [key: string]: { data: ITextureData, index: number, name: string } };

    source: number;

    target: number;

    numVertices: number;

    offset?: number
    triangles?: number;

    vc?: Float32Array;

    geometry?: Geometry;
}

export class BatchRender extends BitmapRender {

    status = DChange.VERTEX;
    invWorldMatrix: IMatrix3D;
    materials = [] as BatchMaterial[];

    constructor(target: Sprite) {
        super(target);
        target.invWorldMatrix = this.invWorldMatrix = newMatrix3D();
    }


    render(option: IStageRenderOption) {

        let { target, firstRenderer, status } = this;


        if (status & DChange.VERTEX) {
            this.status &= DChange.VERTEX_OR;

            this.batch(target);
            firstRenderer = this.firstRenderer
        }

        for (let renderer = firstRenderer; renderer; renderer = renderer.__renderNext) {
            if (undefined != renderer.render) {
                renderer.render(option);
            } else {
                this.dc(option, renderer as IBatchRenderer);
            }
        }

        return false;
    }

    firstRenderer: IRenderer;

    currentRenderer: IBatchRenderer;

    newRenderInfo(sprite: Sprite, first = false) {
        let { currentRenderer, target } = this;


        let info = { source: 0, target: 0, numVertices: 0, offset: 0, triangles: 0, sources: {} } as IBatchRenderer;

        if (first) {
            this.firstRenderer = info;
        } else if (currentRenderer) {
            currentRenderer.__renderNext = sprite;
        }

        this.currentRenderer = info;

        return info;

    }

    cleanBatch() {

    }


    batch(sprite: Sprite) {

        // let renderList = [] as Sprite[];
        // let numVertices = 0;
        //1 獲得所有需要渲染的子節點

        this.newRenderInfo(sprite, true);

        let { vertuniform, texture } = context3D.webglParamsInfo;
        vertuniform = vertuniform >> 1;

        let { currentRenderer } = this;

        let { sources, current } = currentRenderer;
        let thisobj = this;
        function getAllRenderTarget(sprite: Sprite) {
            let { _visible, $graphics, childrens, source, renderInfo, renderer } = sprite;

            if (renderer && renderer != thisobj) {
                currentRenderer = thisobj.newRenderInfo(sprite);
                sources = currentRenderer.sources;
                current = undefined;
            } else {
                if (!renderInfo) {
                    sprite.renderInfo = renderInfo = { renderer: currentRenderer, vc: -1, source: -1, batch: thisobj, enabled: false } as IRendererInfo;
                } else {
                    renderInfo.renderer = currentRenderer;
                    renderInfo.batch = thisobj;
                }

                if (_visible && $graphics && $graphics.geometry) {
                    renderInfo.enabled = true;
                    if (!current) {
                        currentRenderer.root = currentRenderer.current = current = sprite;
                    } else {
                        current.renderInfo.graphicsnext = current = sprite;
                    }

                    currentRenderer.numVertices += $graphics.geometry.numVertices;
                    renderInfo.vc = currentRenderer.target++;

                    let sd = sources[source.key];

                    if (sd === undefined) {
                        sources[source.key] = sd = { index: currentRenderer.source, data: source, name: "diff" + currentRenderer.source };
                        currentRenderer.source++;
                    }

                    renderInfo.source = sd.index;

                    if (currentRenderer.target >= vertuniform || currentRenderer.source >= texture) {
                        currentRenderer = thisobj.newRenderInfo(sprite);
                        sources = currentRenderer.sources;
                        current = undefined;
                    }
                } else {
                    renderInfo.enabled = false;
                }
            }

            if (childrens.length) {
                forarr(childrens, getAllRenderTarget);
            }

            return true;
        }

        getAllRenderTarget.call(this, sprite);


        // if (numVertices > 0) {
        //     let { variables } = sprite;

        //     let data32PerVertex = variables.data32PerVertex.size;


        //     let rvertex = new Float32Array(numVertices * data32PerVertex);

        //     let offset = 0;

        //     forarr(renderList, v => {
        //         let { vertex, numVertices } = v.$graphics.geometry;
        //         rvertex.set(vertex, offset);
        //         offset += numVertices * data32PerVertex;
        //         return true;
        //     })
        //     return new Geometry().setData({ variables, data32PerVertex, numVertices, vertex: rvertex } as IGeometry);
        // }


        return undefined;



    }


    updateVS(vertex: Float32Array, vc: number, source: number, data32PerVertex: number, offset: number) {
        let len = vertex.length;
        for (let i = 0; i < len; i += data32PerVertex) {
            vertex[offset] = vc;
            vertex[offset + 1] = source;
            offset += data32PerVertex;
        }
    }


    dc(option: IStageRenderOption, renderer: IBatchRenderer) {

        let { geometry, vc, numVertices, sources,source } = renderer;

        if (numVertices) {
            if (!geometry) {
                renderer.geometry = geometry = recyclable(Geometry);
                let { variables } = this.target;
                let data32PerVertex = variables.data32PerVertex.size;
                let vsoffset = variables.uv.offset + 2;
                let vx = new Float32Array(numVertices * data32PerVertex);
                renderer.vc = vc = new Float32Array(renderer.target * 8);
                let offset = 0;
                for (let sp = renderer.root as Sprite; sp; sp = sp.renderInfo.graphicsnext as Sprite) {
                    let { vc, source } = sp.renderInfo;
                    let g = sp.$graphics.geometry;
                    let { vertex, numVertices: count } = g;
                    this.updateVS(vertex, vc, source, data32PerVertex, vsoffset);
                    g.offset = offset;
                    vx.set(vertex, offset);
                    offset += count * data32PerVertex;
                    sp.updateBatchVCData();
                }


                geometry.setData({ variables, data32PerVertex, numVertices, vertex: vx } as IGeometry);
                geometry.index = context3D.getIndexByQuad();
                geometry.numTriangles = numVertices / 2;

            }
            //  else if (status & DChange.VC_DATA) {
            //     for (let sp = renderer.root as Sprite; sp; sp = sp.renderInfo.graphicsnext as Sprite) {
            //         sp.updateBatchVCData();
            //     }
            //     renderer.status &= DChange.VC_DATA_OR;
            // }



            this.geometry = geometry;

            option.uivc = vc;


            let { materials } = this;


            let material = materials[source];
            if(!material){
                materials[source] = material = new BatchMaterial().create(source);
            }

            this.material = material;

            foreach(sources, v => {
                option[v.name] = v.data;
                return true;
            })

            // componentSource.textureData;w
            super.render(option);
        }
    }

    updateShaderUniform(option: IStageRenderOption, info: IWebglActiveInfo) {
        let name = info.name;

        let data = this[name] ? this[name] : option[name];

        let flag = true;

        if (data === undefined) {
            console.error(`${name} not set`);
            flag = false;
        } else {
            let context = option.context;
            if (info.len > 0) {
                context.updateUniformData(info, data);
            } else {
                flag = context.updateTextureData(info, data);
            }
        }

        return flag;
    }
}
// function batch(ROOT: Sprite):IGeometry {
//     //目的：合成 vertex, data32PerVertex, variables, numTriangles  重新setData
//     let geometryNew : IGeometry;
//     let { childrens } = ROOT;
//     if (childrens.length == 0) {
//         return ROOT.graphics.geometry;
//     }
//     //获取子节点
//     let geometrys = childrens.map(batch);
//     //let { target, geometry, material } = this;
//     //this.setData({ variables, vertex, index, data32PerVertex, numVertices, numTriangles });
//     let totaLength = ROOT.graphics.geometry.vertex.length;
//     ROOT.childrens.reduce((acc, child) => {
//         let vertex = child.graphics.geometry.vertex;
//         return vertex? vertex.length + acc : acc;
//         }, totaLength);
//     let newVertex = new Float32Array(totaLength);
//     let newNumTriangles  = ROOT.graphics.geometry.numTriangles;
//     newVertex.set( ROOT.graphics.geometry.vertex, 0);
//     let offset = ROOT.graphics.geometry.vertex.length;
//     let newNumVertices = ROOT.graphics.geometry.numVertices;
//     for(let i = 0;i < geometrys.length;i++) {
//         let { vertex, index, numTriangles ,numVertices} = geometrys[i];
//         if(vertex) {
//             newVertex.set(vertex, offset);
//             offset += vertex.length; 
//         }

//         newNumTriangles += numTriangles;
//         newNumVertices += numVertices;
//     }
//    geometryNew.numVertices = newNumVertices;
//    geometryNew.numTriangles = newNumTriangles;
//    geometryNew.vertex = newVertex;
//    return  geometryNew;
// }

