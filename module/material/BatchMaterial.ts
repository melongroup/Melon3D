import { BitmapMaterial } from "./BitmapMaterial.js";
import { singleton } from "../../../melon_runtime/ClassUtils.js";

export class BatchMaterial extends BitmapMaterial {


    create(count: number) {
        let { vertexCode, fargmentCode } = singleton(BatchMaterial);
        let sampler2D = "", sampler2DCode = "";

        for (let i = 0; i < count; i++) {
            sampler2D += `uniform sampler2D diff${i};`
            sampler2DCode += `if(vUV.z < ${i}.5){  color = texture2D(diff${i}, vUV.xy); } else `
        }

        sampler2DCode += "{color = vec4(1.0);}"
        this.fargmentCode = fargmentCode.replace(/{sampler2D}/g, sampler2D).replace(/{sampler2DCode}/g, sampler2DCode);
        this.vertexCode = vertexCode;
        return this;
    }

}