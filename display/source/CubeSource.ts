import { ImageSource } from "./ImageSource.js";
import { recyclable } from "../../../melon_runtime/ClassUtils.js";
import { LoadTask, loadRes, ImageLoader } from "../../core/Http.js";
import { EventT, EventX } from "../../../melon_runtime/MiniDispatcher.js";

export class CubeSource extends ImageSource {

    static files = ["nx", 'ny', 'nz', 'px', 'py', 'pz'];

    load(prefix: string, url: string, type = ".jpg") {

        let task = recyclable(LoadTask);

        task.on(EventT.COMPLETE, (e: EventX) => {

            this.complete();

            task.recycle();
        },this);

        this.status = LoadStates.LOADING;
        let files = CubeSource.files;
        for (let i = 0; i < files.length; i++) {
            const face = files[i];
            let loader = loadRes(prefix, url + face + type, undefined, this, ImageLoader);
            task.addTask(loader);
        }

    }


}