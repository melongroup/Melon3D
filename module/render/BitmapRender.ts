import { UniformProperty } from "../../display/stage3D/Attibute.js";
import { Renderer } from "../../display/stage3D/Renderer.js";
import { foreach } from "../../../melon_runtime/Attibute.js";

export class BitmapRender extends Renderer {


    @UniformProperty()
    diffColor: IVector3D;


    @UniformProperty()
    diffTexture: ITextureData;


    @UniformProperty()
    normalTexture: ITextureData;


    @UniformProperty()
    emissiveColor: IVector3D;


    @UniformProperty()
    emissiveTexture: ITextureData;


    @UniformProperty()
    metallicRoughnessAoTexture: ITextureData;


    metallic: number;
    roughness: number;

    alphaTest: number;

}