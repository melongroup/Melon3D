import { Sprite } from "../../../display/Sprite.js";
import { SingleRender } from "../../render/SingleRender.js";
import { singleton } from "../../../../melon_runtime/ClassUtils.js";
import { SkyBoxMaterial } from "./SkyBoxMaterial.js";
import { SkyBoxGeometry } from "../../../display/stage3D/Geometry.js";
import { loadCubeSource } from "../../../display/source/BitmapSource.js";

export class SkyBox extends Sprite {

    constructor(prefix: string, url: string, size = 1, type = ".jpg") {
        super();
        this.create(size);
        this.load(prefix, url, type);
        
    }

    load(prefix: string, url: string, type = ".jpg") {

        loadCubeSource(prefix, url, undefined, type);

    }

    create(size = 1) {
        let renderer = this.renderer;
        if (!renderer) {
            this.renderer = renderer = new SingleRender(this);
            renderer.material = singleton(SkyBoxMaterial);
        }
        renderer.geometry = new SkyBoxGeometry().create(size);
        return this;
    }



}