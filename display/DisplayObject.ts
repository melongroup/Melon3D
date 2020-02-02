import { Transform } from "./Transform.js";
import { FilterBase } from "./filters/FilterBase.js";

export class DisplayObject extends Transform {

    parent: DisplayObject;

    _alpha = 1.0;
    worldAlpha = 1.0;

    // invSceneMatrix: IMatrix3D;

    filters: { [key: string]: FilterBase } = {}

    constructor() {
        super();
    }


    updateWorldMatrix(updateStatus = 0, parentSceneTransform?: IMatrix3D) {

        let { status, parent } = this;
        if (status & DChange.ALPHA) {
            updateStatus |= DChange.ALPHA;
            this.status &= ~DChange.ALPHA;
        }

        if (updateStatus & DChange.ALPHA) {
            if (parent) {
                this.worldAlpha = parent.worldAlpha * this._alpha;
            } else {
                this.worldAlpha = this._alpha;
            }
        }

        updateStatus |= super.updateWorldMatrix(updateStatus, parentSceneTransform);

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