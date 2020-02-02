import { Sprite } from "./Sprite.js";
import { getFullUrl, loadRes, Loader } from "../core/Http.js";
import { EventX } from "../../melon_runtime/MiniDispatcher.js";
import { componentSource, IBitmapSourceVO, bitmapSources, BitmapSource } from "./source/BitmapSource.js";

export class Image extends Sprite {

    load(perfix: string, url: string) {

        let { source:sourceData } = this;

        let source = bitmapSources[sourceData.url] as BitmapSource;

        let vo = source.frames[url];

        console.log("bitmapsource frames", source.frames);

        if (!vo) {
            loadRes(perfix, url, this.bitmapLoadCompelte, this, ResType.image);
        } else {
            this.draw(vo);
        }

    }

    bitmapLoadCompelte(e: EventX) {

        let loader = e.currentTarget as Loader;
        let img = e.data as HTMLImageElement;

        let { source:sourceData } = this;

        let source = bitmapSources[sourceData.url] as BitmapSource;

        let { url } = loader;

        let vo = source.frames[url];
        if (!vo) {
            let { width, height } = img;
            vo = source.getEmptySourceVO(loader.url, width, height);
            if (vo) {
                source.drawimg(img, vo.x, vo.y, vo.w, vo.h);
            }
        }

        this.draw(vo);
    }

    draw(vo: IBitmapSourceVO) {
        let { graphics: g } = this;
        g.clear();
        g.drawBitmap(0, 0, vo);
        g.end();
    }
} 