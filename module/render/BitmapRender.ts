import { UniformProperty } from "../../display/stage3D/Attibute.js";
import { Renderer } from "../../display/stage3D/Renderer.js";

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
    

    @UniformProperty()
    skyboxTexture: ITextureData;


    metallic: number;
    roughness: number;

    alphaTest: number;

}