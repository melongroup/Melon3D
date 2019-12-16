import { engineNow, Timer } from "../melon_runtime/Timer.js";
import { DEGREES_TO_RADIANS, Setting } from "./core/CONFIG.js";
import { Z_AXIS } from "./core/Geom.js";
import { Link } from "../melon_runtime/Link.js";
import { newMatrix3D } from "./core/Matrix3D.js";


export var pixelRatio = 1;

//显示屏宽高
export var sceneWidth: number = 0;
export var sceneHeight: number = 0;

//可显示区域宽高
export var windowWidth: number = 0;
export var windowHeight: number = 0;

//context3d宽高
export var innerWidth: number = 0;
export var innerHeight: number = 0;


//需求显示宽高 支持外部传参
export var stageWidth: number = 0;
export var stageHeight: number = 0;

export var pixelFont = 1;


export var startTime = Date.now();

export var isWindowResized = false;

export function getTimer() {
    return Date.now() - startTime;
}


export function addResize(tick: ResizeHandler, thisObj: object): void {
    Engine.resizeLink.add(tick, thisObj);

    tick.call(thisObj,stageWidth,stageHeight)
}

export function removeResize(tick: ResizeHandler, thisObj: object): void {
    Engine.resizeLink.remove(tick, thisObj);
}


export class Engine {
    static resizeLink = new Link();
    static resize(width: number, height: number) {
        let link = this.resizeLink;
        for (let vo = link.getFrist(); vo; vo = vo.next) {
            if (false == vo.close) {
                let tick: ResizeHandler = vo.data;
                tick.call(vo.thisObj, width, height);
            }
        }
    }


    frameRate = 60;
    frameInterval = 0;

    _fpsCount = 0;
    _codeTime = 0;

    fps = 0;
    code = 0;

    nextProfileTime = 0;


    constructor() {
        resizeStageSizeFunction = this.appResize;
    }

    start() {
        let lastUpdateTime = 0;
        let nextUpdateTime = 0;
        let animationRequest = requestAnimationFrame;

        let thisobj = this;

        function onAnimationChange(time: number): void {
            animationRequest(onAnimationChange);


            let interval = time - lastUpdateTime;
            let now: number;
            if (interval < 0) {
                //时间重置了
                now = Date.now() - startTime;
                interval = now - engineNow;
                nextUpdateTime = now;
            } else {
                now = interval + engineNow;
            }

            if (now < nextUpdateTime) {
                return;
            }

            lastUpdateTime = time;

            if(isWindowResized){
                isWindowResized = false;
                resizeStageSizeFunction(windowWidth,windowHeight);
            }

            // lastUpdateDate = Date.now();
            Timer.update(now, interval);

            thisobj.profile();
        }


        animationRequest(onAnimationChange);


        //resize
        wx.onWindowResize((res: wx.IWindowResizeData) => {
            let { windowWidth: width, windowHeight: height } = res;
            if (windowWidth != width || windowHeight != height) {
                windowWidth = width;
                windowHeight = height;
                isWindowResized = true;
            }
        })


        windowWidth = Setting.info.windowWidth;
        windowHeight = Setting.info.windowHeight;

        resizeStageSizeFunction(windowWidth, windowHeight);

    }

    appResize(width: number, height: number) {
        windowWidth = width;
        windowHeight = height;

        innerWidth = width * pixelRatio;
        innerHeight = height * pixelRatio;

        let dy = 0

        if (!lockStageArea) {

            if (deviceOrientation == IDeviceOrientation.LANDSCAPE) {
                if (currentOrientation == IDeviceOrientation.PORTRAIT) {
                    stageWidth = innerHeight;
                    stageHeight = innerWidth;
                    setContextMatrix(height, width, 0, dy);
                } else {
                    stageWidth = innerWidth;
                    stageHeight = innerHeight;
                    setContextMatrix(width, height, 0, dy);
                }
            } else {
                if (currentOrientation == IDeviceOrientation.PORTRAIT) {
                    stageWidth = innerWidth;
                    stageHeight = innerHeight;
                    setContextMatrix(width, height, 0, dy);
                } else {
                    stageWidth = innerHeight;
                    stageHeight = innerWidth;
                    setContextMatrix(height, width, 0, dy);
                }
            }
        } else {

            if (deviceOrientation == IDeviceOrientation.LANDSCAPE) {
                if (currentOrientation == IDeviceOrientation.PORTRAIT) {
                    setContextMatrix(height, width, 0, dy);
                } else {
                    setContextMatrix(width, height, 0, dy);
                }
            } else {
                if (currentOrientation == IDeviceOrientation.PORTRAIT) {
                    setContextMatrix(width, height, 0, dy);
                } else {
                    setContextMatrix(height, width, 0, dy);
                }
            }
        }

        width = stageWidth;
        height = stageHeight;
        Engine.resize(width,height);
    }


    profile() {
        let { nextProfileTime, _fpsCount, _codeTime } = this;
        let now = getTimer();
        let interval = now - nextProfileTime;
        _fpsCount++;
        _codeTime += now - engineNow;
        if (interval > 0) {
            if (interval > 2000) {
                nextProfileTime = now + 1000;
            } else {
                nextProfileTime += 1000;
            }
            this.nextProfileTime = nextProfileTime;
            this.fps = _fpsCount;
            this.code = _codeTime;
            this._fpsCount = 0;
            this._codeTime = 0;
        } else {
            this._fpsCount = _fpsCount;
            this._codeTime = _codeTime;
        }
    }
}



export type ResizeHandler = (width: number, height: number) => void

export let resizeStageSizeFunction: ResizeHandler;



export function setDisplayArea(width: number, height: number) {
    lockStageArea = true;
    lockWidth = width;
    lockHeight = height;
}

export var contextMatrix2D = newMatrix3D();
export var contextInvMatrix = newMatrix3D();
export var lockWidth = 0;
export var lockHeight = 0;
export var lockStageArea: boolean;
export var contextWidth = 0;
export var contextHeight = 0;
export function setContextMatrix(width: number, height: number, x: number, y: number) {
    contextWidth = width;
    contextHeight = height;

    width *= pixelRatio;
    height *= pixelRatio;

    // console.log("setContextMatrix", width, height, x, y);
    // console.log("lock", lockWidth, lockHeight);
    // let p = lockHeight / lockWidth;


    let scale = 1;

    if (lockStageArea) {
        let sx = width / lockWidth;
        let sy = height / lockHeight;

        console.log(sx.toFixed(2), sy.toFixed(2))

        if (sx < sy) {
            stageWidth = lockWidth;
            stageHeight = ((lockWidth / contextWidth) * contextHeight >> 0);
            scale = sx;
        } else {
            stageWidth = ((lockHeight / contextHeight) * contextWidth >> 0);
            stageHeight = lockHeight;
            scale = sy;
        }
    }





    // console.log("scale", scale);
    // console.log("stage", stageWidth, stageHeight);




    // pixelFont = 1.025;//h / stageHeight * pixelRatio;
    let m = contextMatrix2D;
    m.m3_identity();

    if (deviceOrientation == IDeviceOrientation.LANDSCAPE) {

        if (currentOrientation == IDeviceOrientation.PORTRAIT) {
            m.m3_rotation(90 * DEGREES_TO_RADIANS, Z_AXIS);
            m.m3_translation(stageHeight, 0, 0);
        }

    } else if (deviceOrientation == IDeviceOrientation.PORTRAIT) {
        if (currentOrientation == IDeviceOrientation.LANDSCAPE) {
            m.m3_rotation(-90 * DEGREES_TO_RADIANS, Z_AXIS);
            m.m3_translation(0, stageWidth, 0)
        } else if (currentOrientation == IDeviceOrientation.LANDSCAPE_REVERSE) {
            m.m3_rotation(90 * DEGREES_TO_RADIANS, Z_AXIS);
            m.m3_translation(stageHeight, 0, 0)
        }
    }



    pixelFont = Setting.isMobile ? scale : 1;
    m.m3_scale(scale, scale, 1);//固定的缩放比例 y会有偏差





    // m.m3_translation((sceneWidth - stageWidth) >> 1,(sceneHeight - stageHeight)>>1,0);

    // m.m3_rotation(90 * DEGREES_TO_RADIANS,Z_AXIS);
    // m.m3_translation(width,0,0);
    // m.m3_translation(Math.round(((width - w) >> 1) * pixelRatio),0,0);//全屏显示不做y偏移
    // m.m3_translation(x,y,0);
    contextInvMatrix.m3_invert(m);

    // m = contextMatrix3D;
    // m.m3_identity();
    // m.m3_scale(s,s,1);

    if (!Setting.isWeixin) {
        let container2d: { [key: string]: string } = {};
        container2d.transform = `matrix3d(${contextMatrix2D.m3_toString(pixelRatio)})`;
        wx.resetCssStyle({ container2d });
    }

}




export const enum IDeviceOrientation {
    PORTRAIT = "portrait",	//竖屏
    LANDSCAPE = "landscape", //横屏正方向，以 HOME 键在屏幕右侧为正方向
    LANDSCAPE_REVERSE = "landscapeReverse", // 横屏反方向，以 HOME 键在屏幕左侧为反方向
}

export var deviceOrientation = IDeviceOrientation.PORTRAIT;
export var currentOrientation = IDeviceOrientation.PORTRAIT;
export function debugDeviceOrientation(orientation: any) {
    switch (orientation) {
        case 1:
            orientation = IDeviceOrientation.LANDSCAPE;
            break;
        case 2:
            orientation = IDeviceOrientation.LANDSCAPE_REVERSE;
            break;
        case 0:
        default:
            orientation = IDeviceOrientation.PORTRAIT;
    }

    deviceOrientation = orientation;
    Engine.resize(windowWidth, windowHeight);
}