import { DisplayObject } from "./DisplayObject.js";
import { Graphics } from "./Graphics.js";
import { BitmapSource, componentSource } from "./source/BitmapSource.js";
import { vertex_ui_variable } from "./stage3D/Geometry.js";
import { IStageRenderOption, Renderer } from "./stage3D/Renderer.js";
import { ProgramInfoType } from "./stage3D/ShaderParamTarget.js";
import { forarr } from "../../melon_runtime/Attibute.js";
import { IBatchRenderer } from "../module/render/BatchRender.js";
import { TEMP_MATRIX3D } from "../core/Geom.js";

export class Sprite extends DisplayObject implements IRenderer {


    renderInfo: IRendererInfo;
    __renderNext: IRenderer;

    parent: Sprite;
    stage: Sprite;
    childrens: Sprite[];

    mouseEnabled = true;
    mouseChildren = true;

    bounds: IBounds;
    nativeRender: boolean;

    $graphics: Graphics;
    variables: IVariables;

    source: ITextureData;

    batchSetting: IBatchRendererSetting;

    renderer: Renderer;
    

    constructor(variables?: IVariables) {
        super();
        this.variables = variables || vertex_ui_variable;
        this.source = componentSource.textureData;
    }

    get graphics() {
        let { $graphics } = this;
        if (!$graphics) {
            this.$graphics = $graphics = new Graphics(this);
        }
        return $graphics;
    }

    setChange(value: number) {
        this.status |= value;
        let { parent } = this;
        if (!parent) return;

        let statues = parent.status;
        if (value & DChange.TRANSFORM) {
            statues |= DChange.CHILD_TRANSFROM;
        }

        if (value & DChange.HIT_AREA) {
            statues |= DChange.CHILD_HITAREA;
        }

        if (value & DChange.ALPHA) {
            statues |= DChange.CHILD_ALPHA;
        }

        if (value & DChange.BATCH_DATA) {
            let { renderInfo } = this;
            if (renderInfo && renderInfo.enabled) {
                renderInfo.batch.status |= (value & DChange.BATCH_DATA);
            }
            value &= DChange.BATCH_DATA_OR
        }

        value = (value &= DChange.CHILD_ALL);

        parent.setChange(statues | value);
    }


    getObjectByPoint(dx: number, dy: number, scale: number): DisplayObject {
        return undefined;
    }


    render(option: IStageRenderOption): void {
        let { renderer } = this;
        let childrender = true;
        if (renderer) {
            childrender = renderer.render(option);
        }

        if (childrender) {
            forarr(this.childrens, v => {
                v.render(option);
                return true;
            });
        }
    }

    updateShaderProperty(option: IRenderOption, program: ProgramInfoType): boolean {

        return false;
    }



    updateWorldMatrix(updateStatus = 0, parentSceneTransform?: IMatrix3D) {
        let status = super.updateWorldMatrix(updateStatus, parentSceneTransform);

        if (status & DChange.TRANSFORM) {
            let { renderInfo } = this;
            if (renderInfo && renderInfo.enabled) {
                this.updateBatchVCData();
            }
        }



        return status;
    }



    updateBatchVCData() {
        let { renderInfo, _visible } = this;

        if (_visible && renderInfo && renderInfo.enabled) {

            let { vc } = renderInfo.renderer as IBatchRenderer;

            let { vc: index, batch } = renderInfo;
            let { invWorldMatrix } = batch;
            let { worldAlpha, worldMatrix } = this;

            let temp = TEMP_MATRIX3D;
            temp.m3_append(invWorldMatrix, false, worldMatrix);

            // [sin,cos,scax,scay]
            // [x,y,z,alpha]

            index *= 8;
            vc[index] = temp[0];
            vc[index + 1] = temp[1];
            vc[index + 2] = temp[4] //scale会有问题  但是我已经不知道是什么问题了。
            vc[index + 3] = temp[5];

            vc[index + 4] = temp[12];
            vc[index + 5] = temp[13];
            vc[index + 6] = temp[14];
            vc[index + 7] = worldAlpha;

            // console.log(vcData);
        }

        // if (refresh) {
        //     for (let i = 0; i < childrens.length; i++) {
        //         (childrens[i] as Sprite).updateBatchVCData();
        //     }
        // }
    }

    _data: {};
    set data(value: {}) { this._data = value; this.doData(); }
    get data(): {} { return this._data; }
    doData() { }
    refreshData() { this.doData(); }
}