import { forarr } from "../../../melon_runtime/Attibute.js";
import { singleton } from "../../../melon_runtime/ClassUtils.js";
import { Sprite } from "../../display/Sprite.js";
import { Geometry } from "../../display/stage3D/Geometry.js";
import { IStageRenderOption, Renderer } from "../../display/stage3D/Renderer.js";
import { context3D } from "../../display/stage3D/Stage3D.js";
import { BitmapMaterial } from "../material/BitmapMaterial.js";
import { BitmapRender } from "./BitmapRender.js";
export class BatchRender extends BitmapRender {
    
    render(option: IStageRenderOption) {

        let { target, geometry, material } = this;

        if (!geometry) {
            this.geometry = geometry = this.batch(target);
        }

        if(geometry){

            this.diffTexture = target.source.textureData;

            if (!material) {
                this.material = material = singleton(BitmapMaterial);
            }

            if (geometry && !geometry.index) {
                geometry.index = context3D.getIndexByQuad();
                geometry.numTriangles = geometry.data.numVertices / 2;
            }

            super.render(option);
        }

        // let { childrens } = target;

        // forarr(childrens, v => {
        //     v.render(option);
        //     return true;
        // })
        
        return false;


    }


    batch(sprite: Sprite) {

        let renderList = [] as Sprite[];
        let numVertices = 0;
        //1 獲得所有需要渲染的子節點

        function getAllRenderTarget(sprite:Sprite){

            let{$graphics,childrens} = sprite;
            if($graphics && $graphics.geometry){
                renderList.push(sprite);
                numVertices += $graphics.geometry.numVertices;
            }
            forarr(childrens,getAllRenderTarget);
            return true;
        }

        getAllRenderTarget(sprite);


        if(numVertices > 0){
            let { variables } = sprite;

            let data32PerVertex = variables.data32PerVertex.size;
    
    
            let rvertex = new Float32Array(numVertices * data32PerVertex);
    
            let offset = 0;
    
            forarr(renderList,v=>{
                let {vertex,numVertices} = v.$graphics.geometry;
                rvertex.set(vertex,offset);
                offset += numVertices * data32PerVertex;
                return true;
            })
            return new Geometry().setData({variables,data32PerVertex,numVertices,vertex: rvertex} as IGeometry);
        }


        return undefined;


        
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

