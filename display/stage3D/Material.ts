import { EventT, EventX } from "../../../melon_runtime/MiniDispatcher.js";
import { loadResaAsync } from "../../core/Http.js";
import { ShaderParamTarget } from "./ShaderParamTarget.js";

export class Material extends ShaderParamTarget {



    vertexCode: string;
    fargmentCode: string;
    key: string;

    readly = false;


    constructor() {
        super();
        let { vertexCode, fargmentCode } = this;
        if (vertexCode && fargmentCode) {
            this.setShaderCode(vertexCode, fargmentCode);
        }
    }


    async load(prefix: string, vert: string, frag: string) {
        this.key = vert + "_" + frag;
        let event = await loadResaAsync(prefix, vert, ResType.text) as EventX;
        if (event.type == EventT.COMPLETE) {
            this.vertexCode = event.data;
        }

        event = await loadResaAsync(prefix, frag, ResType.text) as EventX;
        if (event.type == EventT.COMPLETE) {
            this.fargmentCode = event.data;
        }


    }

    setShaderCode(vertexCode: string, fargmentCode: string) {
        this.vertexCode = vertexCode;
        this.fargmentCode = fargmentCode;
        this.readly = true;
    }
}