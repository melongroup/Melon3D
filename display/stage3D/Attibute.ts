import { IShaderParamTarget } from "./ShaderParamTarget.js";

export function UniformFunc(...evt: (string | number)[]) {
    return function (classPrototype: IShaderParamTarget, propertyKey: string, descriptor: PropertyDescriptor) {
        let map = classPrototype.uniforms;
        if (!map) {
            classPrototype.uniforms = map = {};
        }

        let v = descriptor.value;
        if(!evt.length){
            evt[0] = propertyKey;
        }

        for (let i = 0; i < evt.length; i++) {
            map[evt[i]] = v;
        }

    };
}

export function AttribFunc(...evt: (string | number)[]) {
    return function (classPrototype: IShaderParamTarget, propertyKey: string, descriptor: PropertyDescriptor) {
        let map = classPrototype.attribs;
        if (!map) {
            classPrototype.attribs = map = {};
        }

        let v = descriptor.value;

        for (let i = 0; i < evt.length; i++) {
            map[evt[i]] = v;
        }

    };
}


export function UniformProperty() {
    return function (target: IShaderParamTarget, property: string) {
        let map = target.uniforms;
        if (!map) {
            target.uniforms = map = {};
        }
        map[property] = target.updateShaderUniform;
    }
}