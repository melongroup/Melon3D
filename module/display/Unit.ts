import { Sprite } from "../../display/Sprite.js";
import { forarr } from "../../../melon_runtime/Attibute.js";
import { Mesh } from "./Mesh.js";

export class Unit extends Sprite {
    data: IUnitData;
    doData() {
        let { meshes } = this.data;
        forarr(meshes, v => {
            let mesh = new Mesh();
            mesh.data = v;
            this.addChild(mesh);
            return true;
        })
    }


}