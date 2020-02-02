import { Material } from "../../display/stage3D/Material.js";
import { IStageRenderOption } from "../../display/stage3D/Renderer.js";

export class BitmapMaterial extends Material {

}

export class PhongMaterial extends BitmapMaterial {


}

export class PBRMaterial extends BitmapMaterial {
    constructor() {
        super();

        let { farg_def } = this;
        farg_def.emissiveTexture = "#define EMISSIVE_TEXTURE 1";
        farg_def.occlusionTexture = "#define OCCLUSION_TEXTURE 1";
        farg_def.normalTexture = "#define NORMAL_TEXTURE 1";
    }
}

