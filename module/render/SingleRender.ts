import { singleton } from "../../../melon_runtime/ClassUtils.js";
import { Geometry } from "../../display/stage3D/Geometry.js";
import { IStageRenderOption } from "../../display/stage3D/Renderer.js";
import { context3D } from "../../display/stage3D/Stage3D.js";
import { BitmapMaterial } from "../material/BitmapMaterial.js";
import { BitmapRender } from "./BitmapRender.js";

export class SingleRender extends BitmapRender {

    render(option: IStageRenderOption) {

        let { target, geometry, material } = this;

        if (!geometry) {
            let { graphics } = target;
            let geodata = graphics.geometry;
            if (geodata && geodata.numVertices) {
                geodata.batched = true;
                this.geometry = geometry = new Geometry().setData(target.graphics.geometry);
            }
        }

        if (!material) {
            this.material = material = singleton(BitmapMaterial);
        }

        if (geometry && !geometry.index) {
            geometry.index = context3D.getIndexByQuad();
            geometry.numTriangles = geometry.data.numVertices / 2;
        }

        return super.render(option);

    }
}