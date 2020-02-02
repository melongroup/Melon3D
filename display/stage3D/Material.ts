import { EventT, EventX } from "../../../melon_runtime/MiniDispatcher.js";
import { loadResaAsync } from "../../core/Http.js";
import { ShaderParamTarget } from "./ShaderParamTarget.js";
import { context3D } from "./Stage3D.js";
import { foreach } from "../../../melon_runtime/Attibute.js";

export class Material extends ShaderParamTarget {


    vert_def: { [key: string]: string } = {};
    farg_def: { [key: string]: string } = {};

    vertexCode: string;
    fargmentCode: string;
    key: string;

    readly = false;


    constructor() {
        super();
        let { vertexCode, fargmentCode, farg_def, vert_def } = this;
        if (vertexCode && fargmentCode) {
            this.setShaderCode(vertexCode, fargmentCode);
        }
        
        farg_def.osd = "#extension GL_OES_standard_derivatives : enable";
        vert_def.diffTexture = farg_def.diffTexture = "#define DIFF_TEXTURE 1";
    }


    async load(prefix: string, vert: string, frag: string) {
        this.key = vert + "_" + frag;

        if (vert != undefined) {
            let event = await loadResaAsync(prefix, vert, ResType.text) as EventX;
            if (event.type == EventT.COMPLETE) {
                this.vertexCode = event.data;
            }
        }

        if (undefined != frag) {
            let event = await loadResaAsync(prefix, frag, ResType.text) as EventX;
            if (event.type == EventT.COMPLETE) {
                this.fargmentCode = event.data;
            }
        }

    }

    setShaderCode(vertexCode: string, fargmentCode: string) {
        this.vertexCode = vertexCode;
        this.fargmentCode = fargmentCode;
        this.readly = true;
    }

    replaceVertexCode(option: IRenderOption, define?: string) {
        let { vertexCode, vert_def } = this;

        let def = "";
        foreach(vert_def, (v, k) => {
            if (option[k]) {
                def += v + "\n";
            }
            return true;
        })

        define = def + (define || "");

        vertexCode = vertexCode.replace("{define}", define);
        return vertexCode;
    }

    replaceFargementCode(option: IRenderOption, define?: string) {
        let { fargmentCode, farg_def } = this;
        let def = `precision ${context3D.webglParamsInfo.precision} float;\n`;
        foreach(farg_def, (v, k) => {
            if (option[k]) {
                def += v + "\n";
            }
            return true;
        })
        define = def + (define || "");
        fargmentCode = fargmentCode.replace("{define}", define || "");
        return fargmentCode;
    }


    getKey(option: IRenderOption) {
        let { vert_def, farg_def } = this;
        let def = "";
        foreach(vert_def, (v, k) => {
            if (option[k]) {
                def += "_" + k;
            }
            return true;
        })
        foreach(farg_def, (v, k) => {
            if (option[k]) {
                def += "_" + k;
            }
            return true;
        })

        return this.key + def;
    }
}