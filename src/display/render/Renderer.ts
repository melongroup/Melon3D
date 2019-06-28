import { Sprite } from "../Sprite";
import { Camera } from "../stage3D/camera/Camera";

export class Renderer {

    target:Sprite;

    constructor(target:Sprite){
        this.target = target;
    }

    render(camera:Camera,option:IRenderOption):void{

    }
}