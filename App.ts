import { singleton } from "../melon_runtime/ClassUtils.js";
import { addTick } from "../melon_runtime/Timer.js";
import { Setting } from "./core/CONFIG.js";
import { extend_init } from "./core/Extend.js";
import { newVector3D } from "./core/Matrix3D.js";
import { tweenUpdate } from "./core/Tween.js";
import { Mouse } from "./display/Mouse.js";
import { Sprite } from "./display/Sprite.js";
import { IStageRenderOption } from "./display/stage3D/Renderer.js";
import { context3D, ROOT, Stage3D, camera } from "./display/stage3D/Stage3D.js";
import { addResize, Engine } from "./Engine.js";



export var renderOption = { now: 0, interval: 0, shaderParmas: [], lightDirection: newVector3D(1, 1, -1, 1) } as IStageRenderOption;

export class App extends Sprite {

    init(canvas: HTMLCanvasElement) {

        extend_init();

        if (!Setting.isWeixin) {
            wx.no_maincanvas = canvas;
        }

        singleton(Engine).start();

        //创建webgl
        let stage3d = singleton(Stage3D);
        if (false == stage3d.requestContext3D(canvas)) {
            console.log("GL create fail");
            return;
        }





        singleton(Mouse).init();


        addResize(this.resize, this);
        addTick(this.update, this);



        //初始化所有需求的属性

        // this.initCanvas(canvas);
        // this.initContainer(ROOT.camera2D,true);


        // Engine.addResize(this);
        // Engine.addTick(this);

        // let c = context3D;

        // pass_init_mesh();

        // ROOT.addEventListener(EngineEvent.FPS_CHANGE,this.gcChangeHandler,this);
        // this.nextGCTime = engineNow + this.gcDelay;


    }

    resize(width: number, height: number) {
        let c = context3D;
        c.configureBackBuffer(innerWidth, innerHeight, 0);
    }



    update(now: number, interval: number) {

        tweenUpdate();

        renderOption.now = now;
        renderOption.interval = interval;

        let lightDirection = renderOption.lightDirection;
        lightDirection[0] = camera.x;
        lightDirection[1] = camera.y;
        lightDirection[2] = camera.z;

        lightDirection.v3_normalize();
        // lightDirection[1] += 1.0;
        // lightDirection.v3_normalize();


        ROOT.render(renderOption);
    }


}