import { singleton } from "../../../melon_runtime/ClassUtils.js";
import { Sprite } from "../../display/Sprite.js";
import { Geometry } from "../../display/stage3D/Geometry.js";
import { SingleRender } from "../render/SingleRender.js";
import { PBRMaterial } from "../material/BitmapMaterial.js";

export class Mesh extends Sprite {

    data: IMeshData;
    doData() {
        let { material, geometryInstance } = this.data;
        let renderer = new SingleRender(this);
        renderer.setMaterial(material);
        if (!geometryInstance) {
            this.data.geometryInstance = geometryInstance = new Geometry().setData(this.data.geometry);
        }
        renderer.geometry = geometryInstance;
        renderer.material = singleton(PBRMaterial)
    }


}