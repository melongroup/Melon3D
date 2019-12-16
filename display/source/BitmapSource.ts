import { MiniDispatcher, EventX, EventT } from "../../../melon_runtime/MiniDispatcher.js";
import { BitmapData, MaxRectsBinPack } from "../../core/BitmapData.js";
import { Texture } from "../stage3D/buffer/Texture.js";
import { ImageLoader, loadRes } from "../../core/Http.js";
import { engineNow } from "../../../melon_runtime/Timer.js";
import { forarr, foreach } from "../../../melon_runtime/Attibute.js";
import { context3D } from "../stage3D/Stage3D.js";

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

export class BitmapSource extends MiniDispatcher {
    name: string;

    width = 0;
    height = 0;
    bmd: BitmapData | HTMLImageElement;
    frames: { [key: string]: IBitmapSourceVO } = {};

    origin: number[];

    autopack: boolean;
    maxRect: MaxRectsBinPack;

    status = LoadStates.WAIT;

    // textures: { [key: string]: Texture } = {};
    // texture: Texture;
    // textureData: ITextureData;

    completeFuncs: Function[];

    constructor(name: string, autopack = false) {
        super();
        this.name = name;
        this.autopack = autopack;
    }

    load(prefix: string, url: string) {
        this.name = url;
        this.autopack = false;
        this.status = LoadStates.LOADING;
        loadRes(prefix, url, this.loadImageComplete, this, ImageLoader);
    }

    loadImageComplete(event: EventX) {

        if (event.type != EventT.COMPLETE) {
            this.status = LoadStates.FAILED;
            return;
        }

        this.create(event.data);

        forarr(this.completeFuncs, v => {
            v(this);
            return true;
        })

        this.simpleDispatch(EventT.COMPLETE, this);


    }

    create(bmd: BitmapData | HTMLImageElement) {
        this.status = LoadStates.COMPLETE;

        this.bmd = bmd;
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
    let source = bitmapSources[name];
    if (source) {
        return source;
    }

    let bmd = new BitmapData(w, h, true);
    source = new BitmapSource(name, true).create(bmd);

    if (origin) {
        let vo = source.getEmptySourceVO("origin", 1, 1);
        //"#FFFFFF"
        bmd.fillRect(vo.x, vo.y, vo.w, vo.h, "#FFFFFF");
        source.origin = [vo.ul, vo.vt];
    }

    return source;
}


export function loadBitmapSource(prefix: string, url: string, complete?: Function) {
    let source = bitmapSources[url];

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


export function refreshUV(vo: IUVFrame, mw: number, mh: number) {
    const { x, y, w, h } = vo;
    vo.ul = x / mw;
    vo.ur = (x + w) / mw;
    vo.vt = y / mh;
    vo.vb = (y + h) / mh;
}



export var bitmapSources: { [key: string]: BitmapSource } = {};
export var componentSource = createBitmapSource("component", 1024, 1024, true);
export var textSource = createBitmapSource("textsource", 1024, 1024, true);