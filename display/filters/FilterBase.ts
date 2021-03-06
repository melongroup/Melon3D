import { STweenBase } from "../../core/Tween.js";
import { IStageRenderOption } from "../stage3D/Renderer.js";

export class FilterBase extends STweenBase implements IShaderSetting {
    constructor(type: string) {
        super();
        this.type = type;
        this.skey = type;
        this.readly = true;
    }
    readly: boolean;
    disable: boolean;

    skey: string;

    vertex: IShaderCode;

    fragment: IShaderCode;


    createCode() {

    }

    setProgramConstants(option: IStageRenderOption) {

    }
}