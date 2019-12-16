import { engineNow } from "../../../melon_runtime/Timer.js";
import { BitmapData, MaxRectsBinPack } from "../../core/BitmapData.js";
import { context3D } from "../stage3D/Stage3D.js";
import { ImageSource } from "./ImageSource.js";
import { CubeSource } from "./CubeSource.js";
import { getTextureData } from "../stage3D/Context3D.js";

export interface IBitmapSourceVO extends IUVFrame {
    source: BitmapSource;

    scale: number;

    name: string;
    used: number;
    time: number;

    //真实大小
    rw: number;
    rh: number;

}


export class BitmapSource extends ImageSource {

    width = 0;
    height = 0;
    frames: { [key: string]: IBitmapSourceVO } = {};

    origin: number[];

    autopack: boolean;
    maxRect: MaxRectsBinPack;


    // textures: { [key: string]: Texture } = {};
    // texture: Texture;
    textureData: ITextureData;

    constructor(name: string, autopack = false) {
        super();
        this.name = name;
        this.autopack = autopack;
    }


    create(bmd: BitmapData | HTMLImageElement) {
        super.create(bmd);

        let { width, height } = bmd;
        this.width = width;
        this.height = height;

        if (this.autopack) {
            this.maxRect = new MaxRectsBinPack(width, height);
        }

        return this;

    }

    setSourceVO(name: string, x: number, y: number, w: number, h: number) {
        let vo = { name, x, y, w, h, rw: w, rh: h } as IBitmapSourceVO;
        vo.source = this;

        refreshUV(vo, this.width, this.height);

        this.frames[name] = vo;
        return vo;
    }

    getEmptySourceVO(name: string, w: number, h: number) {
        let rect = this.maxRect.insert(w, h);
        let vo: IBitmapSourceVO;
        if (rect.w != 0) {
            vo = this.setSourceVO(name, rect.x, rect.y, w, h);
        } else {
            vo = this.getUnusedArea(name, w, h);
        }
        if (vo) {
            this.frames[name] = vo;
        }
        return vo;
    }

    getUnusedArea(name: string, sw: number, sh: number): IBitmapSourceVO {
        let frames = this.frames;
        let vo: IBitmapSourceVO;
        let now = engineNow;

        vo = frames[name];
        if (!vo) {
            for (let dname in frames) {
                vo = frames[dname];
                if (!vo) continue;
                if (vo.time < now && 0 >= vo.used && sw <= vo.rw && sh <= vo.rh) {
                    frames[vo.name] = undefined;
                    vo.name = name;
                    vo.w = sw;
                    vo.h = sh;
                    vo.time = now;
                    frames[name] = vo;
                    break;
                } else {
                    vo = undefined;
                }
            }
        }

        if (vo) {
            this.clearBitmap(vo.x, vo.y, vo.w, vo.h);
            return vo;
        }

        return undefined;
    }


    drawimg(img: HTMLImageElement | HTMLCanvasElement | BitmapData, x: number, y: number, w?: number, h?: number) {//可能需要其他的处理

        let bmd = this.bmd as BitmapData;

        if (img instanceof BitmapData) {
            img = img.canvas;
        }

        if (w == undefined && h == undefined) {
            bmd.context.drawImage(img, x, y);
        } else {
            bmd.context.drawImage(img, x, y, w, h);
        }

        context3D.refreshTextureObj(this.name);
    }

    clearBitmap(x: number, y: number, w: number, h: number) {
        let bmd = this.bmd as BitmapData;
        if (w && h) {
            let context = bmd.context;
            context.globalCompositeOperation = "destination-out";
            context.fillStyle = `rgb(255,255,255)`;
            context.fillRect(x, y, w, h);
            context.globalCompositeOperation = "source-over";
        }
    }
}



export function createBitmapSource(name: string, w: number, h: number, origin?: boolean) {
    console.log(`createBitmapSource ${name} ${w} x ${h}`);
    let source = bitmapSources[name] as BitmapSource;
    if (source) {
        return source;
    }

    let bmd = new BitmapData(w, h, true);
    source = new BitmapSource(name, true).create(bmd);

    source.textureData = getTextureData(name,false);
    
    if (origin) {
        let vo = source.getEmptySourceVO("origin", 1, 1);
        //"#FFFFFF"
        bmd.fillRect(vo.x, vo.y, vo.w, vo.h, "#FFFFFF");
        source.origin = [vo.ul, vo.vt];
    }

    bitmapSources[name] = source;

    return source;
}


export function loadBitmapSource(prefix: string, url: string, complete?: Function) {
    let source = bitmapSources[url] as BitmapSource;

    if (!source) {
        bitmapSources[url] = source = new BitmapSource(url, false);
        source.load(prefix, url);
    } else if (source.status == LoadStates.WAIT) {
        source.load(prefix, url);
    }

    if (complete && source.status == LoadStates.COMPLETE) {
        complete(source);
        return source;
    }

    if (complete) {
        let completes = source.completeFuncs;

        if (!completes) {
            source.completeFuncs = completes = [];
        }

        if (completes.indexOf(complete) == -1) {
            completes.push(complete);
        }
    }

    return source;
}



export function loadCubeSource(prefix: string, url: string, complete?: Function, type = ".jpg") {
    let source = bitmapSources[url] as CubeSource;

    if (!source) {
        bitmapSources[url] = source = new CubeSource();
        source.load(prefix, url, type);
    } else if (source.status == LoadStates.WAIT) {
        source.load(prefix, url, type);
    }

    if (complete && source.status == LoadStates.COMPLETE) {
        complete(source);
        return source;
    }

    if (complete) {
        let completes = source.completeFuncs;

        if (!completes) {
            source.completeFuncs = completes = [];
        }

        if (completes.indexOf(complete) == -1) {
            completes.push(complete);
        }
    }

    return source;
}



export function refreshUV(vo: IUVFrame, mw: number, mh: number) {
    const { x, y, w, h } = vo;
    vo.ul = x / mw;
    vo.ur = (x + w) / mw;
    vo.vt = y / mh;
    vo.vb = (y + h) / mh;
}



export var bitmapSources: { [key: string]: ImageSource } = {};
export var componentSource = createBitmapSource("component", 1024, 1024, true);
export var textSource = createBitmapSource("textsource", 1024, 1024, true);