import { DisplayObject } from "./DisplayObject.js";
import { Graphics } from "./Graphics.js";
import { BitmapSource, componentSource } from "./source/BitmapSource.js";
import { vertex_ui_variable } from "./stage3D/Geometry.js";
import { IStageRenderOption, Renderer } from "./stage3D/Renderer.js";
import { ProgramInfoType } from "./stage3D/ShaderParamTarget.js";
import { forarr } from "../../melon_runtime/Attibute.js";

export class Sprite extends DisplayObject {

    parent: Sprite;
    stage: Sprite;
    childrens: Sprite[];

    mouseEnabled = true;
    mouseChildren = true;

    bounds: IBounds;
    nativeRender: boolean;

    $graphics: Graphics;
    variables: IVariables;

    source: BitmapSource;

    batchSetting: IBatchRendererSetting;

    renderer: Renderer;

    constructor(variables?: IVariables) {
        super();
        this.variables = variables || vertex_ui_variable;
        this.source = componentSource;
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
        if (value & DChange.trasnform) {
            statues |= DChange.CHILD_TRANSFROM;
        }

        if (value & DChange.HIT_AREA) {
            statues |= DChange.CHILD_HITAREA;
        }

        if (value & DChange.alpha) {
            statues |= DChange.CHILD_ALPHA;
        }

        if (value & DChange.vertex) {
            statues |= DChange.vertex;
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




    _data: {};
    set data(value: {}) { this._data = value; this.doData(); }
    get data(): {} { return this._data; }
    doData() { }
    refreshData() { this.doData(); }
}