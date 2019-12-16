import { MiniDispatcher, EventT, EventX } from "../../../melon_runtime/MiniDispatcher.js";
import { ImageLoader, loadRes } from "../../core/Http.js";
import { forarr } from "../../../melon_runtime/Attibute.js";
import { BitmapData } from "../../core/BitmapData.js";

export class ImageSource extends MiniDispatcher {
    name: string;
    bmd: BitmapData | HTMLImageElement;
    status = LoadStates.WAIT;
    completeFuncs: Function[];
    load(prefix: string, url: string) {
        this.name = url;
        this.status = LoadStates.LOADING;
        loadRes(prefix, url, this.loadImageComplete, this, ImageLoader);
    }

    loadImageComplete(event: EventX) {

        if (event.type != EventT.COMPLETE) {
            this.status = LoadStates.FAILED;
            return;
        }

        this.create(event.data);

        this.complete();
    }

    complete() {
        forarr(this.completeFuncs, v => {
            v(this);
            return true;
        })
        this.completeFuncs = undefined;
        this.simpleDispatch(EventT.COMPLETE, this);
    }

    create(bmd: BitmapData | HTMLImageElement) {
        this.status = LoadStates.COMPLETE;
        this.bmd = bmd;
        return this;
    }
}