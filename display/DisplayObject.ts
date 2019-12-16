import { Transform } from "./Transform.js";
import { FilterBase } from "./filters/FilterBase.js";

export class DisplayObject extends Transform {

    parent: DisplayObject;

    _alpha = 1.0;
    sceneAlpha = 1.0;

    invSceneMatrix: IMatrix3D;

    filters: { [key: string]: FilterBase } = {}

    constructor() {
        super();
    }


    updateWorldMatrix(updateStatus = 0, parentSceneTransform?: IMatrix3D) {

        let { status, parent } = this;
        if (status & DChange.alpha) {
            updateStatus |= DChange.alpha;
            this.status &= ~DChange.alpha;
        }

        if (updateStatus & DChange.alpha) {
            if (parent) {
                this.sceneAlpha = parent.sceneAlpha * this._alpha;
            } else {
                this.sceneAlpha = this._alpha;
            }
        }

        super.updateWorldMatrix(updateStatus, parentSceneTransform);

        return updateStatus;
    }


    addFilter(filter: FilterBase) {
        let { filters } = this;
        if (!filters) {
            this.filters = filters = {};
        }
        filters[filter.type] = filter;
        filter.disable = false;
    }

    removeFilter(type: string) {
        let { filters } = this;
        if (!filters) return;
        filters[type] = undefined;
    }

    get shaderKey() {
        let { filters } = this;
        let key = "";
        for (let filterKey in filters) {
            let filter = filters[filterKey];
            if (filter && filter.readly) {
                key += filter.skey;
            }
        }
        return key;
    }


}