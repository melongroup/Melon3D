import { foreach, RecycleObjType } from "../../../melon_runtime/Attibute.js";
import { MiniDispatcher } from "../../../melon_runtime/MiniDispatcher.js";


export type UniformFunction = (option: IRenderOption, info: IWebglActiveInfo) => boolean;
export type ProgramInfoType = { paramsInfo: { [key: string]: IWebglActiveInfo } };

export interface IShaderParamTarget {
    uniforms: { [key: string]: UniformFunction };
    attribs: { [key: string]: UniformFunction };
    updateShaderProperty(option: IRenderOption, program: ProgramInfoType): boolean;
    updateShaderUniform(option: IRenderOption, info: IWebglActiveInfo):boolean;
}

export class ShaderParamTarget extends MiniDispatcher implements IShaderParamTarget {
    recyleObj: RecycleObjType;
    uniforms: { [key: string]: UniformFunction };
    attribs: { [key: string]: UniformFunction };

    updateShaderAttrib(option: IRenderOption, info: IWebglActiveInfo) {
        return false;
    }

    updateShaderUniform(option: IRenderOption, info: IWebglActiveInfo) {
        return false;
    }





    updateShaderProperty(option: IRenderOption, program: ProgramInfoType): boolean {

        let { attribs, uniforms } = this;
        let { paramsInfo } = program;
        let flag = true;
        foreach(paramsInfo, (info, name) => {

            let tag = info.tag;

            if (tag != 0) {
                let func = uniforms ? uniforms[name] : undefined;
                if (func) {
                    func.call(this, option, info);
                    info.used = true;
                } else {
                    flag = this.updateShaderUniform(option, info);
                    info.used = info.used || flag;
                }
            } else {
                let func = attribs ? attribs[name] : undefined;
                if (func) {
                    func.call(this, option, info);
                } else {
                    flag = this.updateShaderAttrib(option, info);
                }
            }

            return true;
        })


        return flag;
    }
}