import { LineGraphics } from "./LineGraphics.js";
import { Sprite } from "../../../display/Sprite.js";
import { SingleRender } from "../../render/SingleRender.js";
import { singleton } from "../../../../melon_runtime/ClassUtils.js";
import { LineMaterial } from "./LineMaterial.js";


export let line_variable: { [key: string]: IVariable } = {
    "posX": { size: 3, offset: 0 },
    "posY": { size: 3, offset: 3 },
    "len": { size: 1, offset: 6 },
    "color": { size: 4, offset: 7 },
    "data32PerVertex": { size: 11, offset: 0 }
}


export class Line extends Sprite {

    $graphics: LineGraphics;

    constructor() {
        super(line_variable);
        let renderer = new SingleRender(this);
        renderer.material = singleton(LineMaterial);
        renderer.setDepth(true,WebGLConst.LEQUAL);
    }


    get graphics() {
        let { $graphics } = this;
        if (!$graphics) {
            this.$graphics = $graphics = new LineGraphics(this);
        }
        return $graphics;
    }

}