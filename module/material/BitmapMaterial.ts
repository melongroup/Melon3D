import { Material } from "../../display/stage3D/Material.js";

export class BitmapMaterial extends Material {

    // source: BitmapSource;

    // @UniformFunc("diffTexutre", "ambientTexutre", "specularTexutre", "specularEnvMapTexutre")
    // texture(option: IStageRenderOption, info: IWebglActiveInfo): void {
    //     let { context } = option;
    //     let texture = option[info.name];
    //     if (!texture) {
    //         console.error(`${info.name} not set`);
    //     }else{
    //         context.updateTextureData(info, texture);
    //     }
    // }


    // @UniformFunc("diffColor", "ambientColor", "specularColor")
    // color(option: IStageRenderOption, info: IWebglActiveInfo) {
    //     let { context } = option;
    //     let color = option[info.name]
    //     if (undefined === color) {
    //         console.error(`${info.name} not set`);
    //     }else{
    //         context.updateUniformData(info, color);
    //     }
    // }
}