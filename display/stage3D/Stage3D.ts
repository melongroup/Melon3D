import { singleton } from "../../../melon_runtime/ClassUtils.js";
import { EventT } from "../../../melon_runtime/MiniDispatcher.js";
import { Setting } from "../../core/CONFIG.js";
import { Sprite } from "../Sprite.js";
import { Camera, CameraUIResize } from "./camera/Camera.js";
import { Context3D } from "./Context3D.js";
import { IStageRenderOption } from "./Renderer.js";
import { gameTick } from "../../../melon_runtime/Timer.js";
import { DisplayObject } from "../DisplayObject.js";


export var context3D: Context3D;
export var gl:WebGLRenderingContext;
export var ROOT : Stage3D;

export var cameraUI : Camera;
export var camera:Camera;

export function setCamera(c:Camera){
    camera = c;
    globalThis.camera = c;
}

export class Stage3D extends Sprite{
    canvas: HTMLCanvasElement;

    constructor(){
        super();
        ROOT = this;
    }

    names = [  "webgl", "experimental-webgl","webkit-3d", "moz-webgl"];
    requestContext3D(canvas: HTMLCanvasElement): boolean {
        this.canvas = canvas;
        let contextAttributes:any = {};
        if(Setting.isMobile){
            contextAttributes.antialias = false;
        }else{
            contextAttributes.antialias = true;
        }

        contextAttributes.stencil = false;
        contextAttributes.depth = true;

        let {names} = this;
        for (let i = 0; i < names.length; i++) {
            try {
                gl = this.canvas.getContext(names[i],contextAttributes) as WebGLRenderingContext;
            } catch (e) {

            }
            if (gl) {
                break;
            }
        }

        if (undefined == gl) {
            this.simpleDispatch(EventT.ERROR, "webgl is not available");
            return false;
        }
        context3D = singleton(Context3D);
        
        // Capabilities.init();
        // mainKey.init();
        // KeyManagerV2.resetDefaultMainKey();

        cameraUI = camera = new Camera(CameraUIResize);


        this.simpleDispatch(EventT.CONTEXT3D_CREATE, gl);
        return true;
    }



    getObjectByPoint(dx: number, dy: number, scale: number): DisplayObject {
        return this;
    }



    render(option: IStageRenderOption): void {
        
        if (this.status) {
            this.updateWorldMatrix();
        }

        if(camera.status){
            camera.updateWorldMatrix()
        }

        let c = context3D;
        c.dc = 0;
        c.triangles = 0;
        c.clear(0, 0, 0, 1);

        option.camera = camera;
        option.context = c
        option.gl = gl;
        option.cameraPos = camera.pos;
        super.render(option);
    }


}