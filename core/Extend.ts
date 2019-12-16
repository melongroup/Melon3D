

/**
 * 对数字进行补0操作
 * @param value 要补0的数值
 * @param length 要补的总长度
 * @return 补0之后的字符串
 */
export function zeroize(value: number | string, length: number = 2): string {
    let str = "" + value;
    let zeros = "";
    for (let i = 0, len = length - str.length; i < len; i++) {
        zeros += "0";
    }
    return zeros + str;
}


export function extend_init(){



    
    /**
     * 获取完整的 PropertyDescriptor
     * 
     * @param {Partial<PropertyDescriptor>} descriptor 
     * @param {boolean} [enumerable=false] 
     * @param {boolean} [writable]
     * @param {boolean} [configurable=true] 
     * @returns 
     */
    function getDescriptor(descriptor: PropertyDescriptor, enumerable = false, writable = true, configurable = true) {
        if (!descriptor.set && !descriptor.get) {
            descriptor.writable = writable;
        }
        descriptor.configurable = configurable;
        descriptor.enumerable = enumerable;
        return descriptor;
    }

    function makeDefDescriptors(descriptors: object, enumerable = false, writable = true, configurable = true) {
        for (let key in descriptors) {
            let desc: PropertyDescriptor = descriptors[key];
            let enumer = desc.enumerable == undefined ? enumerable : desc.enumerable;
            let write = desc.writable == undefined ? writable : desc.writable;
            let config = desc.configurable == undefined ? configurable : desc.configurable;
            descriptors[key] = getDescriptor(desc, enumer, write, config);
        }
        return descriptors as PropertyDescriptorMap;
    }



    Object.defineProperties(Float32Array.prototype, makeDefDescriptors({
        x:{
            get(){
                return this[0];
            },
            set(value){
                this[0]=value;
            }
        },

        y:{
            get(){
                return this[1];
            },
            set(value){
                this[1]=value;
            }
        },


        z:{
            get(){
                return this[2];
            },
            set(value){
                this[2]=value;
            }
        },

        w:{
            get(){
                return this[3];
            },
            set(value){
                this[3]=value;
            }
        },

        update: {
            value : function(data32PerVertex: number, offset: number, v: number){
                let len = this.length;
                for (let i = 0; i < len; i += data32PerVertex) {
                    this[i + offset] = v;
                }
            }
        },

        wPoint1 : {
            value : function(position: number, x: number, y?: number, z?: number, w?: number): void{
                this[position] = x;
            }
        },

        wPoint2: {
        value : function(position: number, x: number, y: number, z?: number, w?: number): void{
                this[position] = x;
                this[position+1] = y;
            }
        },

        wPoint3: {
            value : function(position: number, x: number, y: number, z: number, w?: number): void{
                this[position] = x;
                this[position+1] = y;
                this[position+2] = z;
            }
        },

        wPoint4 :{
            value:function(position: number, x: number, y: number, z: number, w: number): void{
                this[position] = x;
                this[position+1] = y;
                this[position+2] = z;
                this[position+3] = w;
            }
        },
        clone :{
            value:function(){
                return new Float32Array(this);
            }
        }
    }))



    Object.defineProperties(Object.prototype, makeDefDescriptors({
        clone: {
            value: function () {
                let o = {};
                for (let n in this) {
                    o[n] = this[n];
                }
                return o;
            }
        },
        getPropertyDescriptor: {
            value: function (property: string): any {
                var data = Object.getOwnPropertyDescriptor(this, property);
                if (data) {
                    return data;
                }
                var prototype = Object.getPrototypeOf(this);
                if (prototype) {
                    return prototype.getPropertyDescriptor(property);
                }
            }
        },
        copyto: {
            value: function (to: Object) {
                for (let p in this) {
                    var data: PropertyDescriptor = to.getPropertyDescriptor(p);
                    if (!data || (data.set || data.writable)) {// 可进行赋值，防止将属性中的方法给重写
                        to[p] = this[p];
                    }
                }
            }
        },
        equals: {
            value: function (checker: Object, ...args: string[]) {
                if (!args.length) {
                    args = Object.getOwnPropertyNames(checker);
                }
                for (let i = 0; i < args.length; i++) {
                    let key = args[i];
                    if (this[key] != checker[key]) {
                        return false;
                    }
                }
                return true;
            }
        },
        copyWith: {
            value: function (to: object, ...proNames: string[]) {
                for (let i = 0; i < proNames.length; i++) {
                    const p = proNames[i];
                    if (p in this) {
                        to[p] = this[p];
                    }
                }
            }
        },
        getSpecObject: {
            value: function (...proNames: string[]) {
                let obj = {};
                for (let i = 0; i < proNames.length; i++) {
                    const p = proNames[i];
                    if (p in this) {
                        if (this[p] != null) {
                            obj[p] = this[p];
                        }
                    }
                }
                return obj;
            }
        }
    }));


    Object.defineProperties(Function.prototype, makeDefDescriptors({
        isSubClass: {
            value: function (testBase: Function) {
                if (typeof testBase !== "function") {
                    return false;
                }
                let base = this.prototype;
                let flag = false;
                while (base !== null && base !== Object) {
                    if (base === testBase) {
                        flag = true;
                        break;
                    }
                    base = base.prototype;
                }
                return true;
            }
        }
    }));



    Math.DEG_TO_RAD = Math.PI / 180;

    Math.RAD_TO_DEG = 180 / Math.PI;

    Math.PI2 = 2 * Math.PI;

    Math.PI_1_2 = Math.PI * .5;

    Math.clamp = (value, min, max) => {
        if (value < min) {
            value = min;
        }
        if (value > max) {
            value = max;
        }
        return value;
    }

    Math.random2 = (min, max) => {
        return min + Math.random() * (max - min);
    }

    Math.random3 = (center, delta) => {
        return center - delta + Math.random() * 2 * delta;
    }


    if (!Number.isSafeInteger) {//防止低版本浏览器没有此方法
        Number.isSafeInteger = (value: number) => value < 9007199254740991/*Number.MAX_SAFE_INTEGER*/ && value >= -9007199254740991/*Number.MIN_SAFE_INTEGER*/
    }


    Object.defineProperties(Number.prototype, makeDefDescriptors({
        zeroize: getDescriptor({
            value: function (this: number, length: number) { return zeroize(this, length) }
        }),
        between: getDescriptor({
            value: function (this: number, min: number, max: number) { return min <= this && max >= this }
        })
    }));


    Object.defineProperties(String.prototype, makeDefDescriptors({
        zeroize: {
            value: function (length) { return zeroize(this, length) },
        },
        trim:{
            value: function (this: string) {
                return this.replace(/(^[\s\t\f\r\n\u3000\ue79c ]*)|([\s\t\f\r\n\u3000\ue79c ]*$)/g,"");
            }
        },
        substitute: {
            value: function (this: string) {
                let len = arguments.length;
                if (len > 0) {
                    let obj;
                    if (len == 1) {
                        obj = arguments[0];
                        if (typeof obj !== "object") {
                            obj = arguments;
                        }
                    } else {
                        obj = arguments;
                    }
                    if ((obj instanceof Object) && !(obj instanceof RegExp)) {
                        return this.replace(/\{(?:%([^{}]+)%)?([^{}]+)\}/g, function (match: string, handler: string, key: string) {
                            //检查key中，是否为%开头，如果是，则尝试按方法处理                        
                            let value = obj[key];
                            if (handler) {//如果有处理器，拆分处理器
                                let func = String.subHandler[handler];
                                if (func) {
                                    value = func(value);
                                }
                            }
                            return (value !== undefined) ? '' + value : match;
                        });
                    }
                }
                return this.toString();//防止生成String对象，ios反射String对象会当成一个NSDictionary处理
            }
        },
        hash: {
            value: function () {
                var len = this.length;
                var hash = 5381;
                for (var i = 0; i < len; i++) {
                    hash += (hash << 5) + this.charCodeAt(i);
                }
                return hash & 0xffffffff;
            }
        },
        trueLength: {
            value: function () {
                let arr: string[] = this.match(/[\u2E80-\u9FBF]/ig);
                return this.length + (arr ? arr.length : 0);
            }
        }
    }));



    String.zeroize = zeroize;
    String.subHandler = {};

    String.regSubHandler = function (key, handler) {
        // if (DEBUG) {
        //     if (handler.length != 1) {
        //         rf.ThrowError(`String.regSubHandler注册的函数，参数数量必须为一个，堆栈：\n${new Error().stack}\n函数内容：${handler.toString()}`);
        //     }
        //     if (key in this.subHandler) {
        //         rf.ThrowError(`String.regSubHandler注册的函数，注册了重复的key[${key}]，堆栈：\n${new Error().stack}`);
        //     }
        // }
        this.subHandler[key] = handler;
    }


    Object.defineProperties(Date.prototype, makeDefDescriptors({
        format: {
            value: function (mask, local?: boolean) {
                let d: Date = this;
                return mask.replace(/"[^"]*"|'[^']*'|(?:d{1,2}|m{1,2}|yy(?:yy)?|([hHMs])\1?)/g, function ($0) {
                    switch ($0) {
                        case "d": return gd();
                        case "dd": return zeroize(gd());
                        case "M": return gM() + 1;
                        case "MM": return zeroize(gM() + 1);
                        case "yy": return (gy() + "").substr(2);
                        case "yyyy": return gy();
                        case "h": return gH() % 12 || 12;
                        case "hh": return zeroize(gH() % 12 || 12);
                        case "H": return gH();
                        case "HH": return zeroize(gH());
                        case "m": return gm();
                        case "mm": return zeroize(gm());
                        case "s": return gs();
                        case "ss": return zeroize(gs());
                        default: return $0.substr(1, $0.length - 2);
                    }
                });
                function gd() { return local ? d.getDate() : d.getUTCDate() }
                function gM() { return local ? d.getMonth() : d.getUTCMonth() }
                function gy() { return local ? d.getFullYear() : d.getUTCFullYear() }
                function gH() { return local ? d.getHours() : d.getUTCHours() }
                function gm() { return local ? d.getMinutes() : d.getUTCMinutes() }
                function gs() { return local ? d.getSeconds() : d.getUTCSeconds() }
            }
        }
    }));



    Array.binaryInsert = <T>(partArr: T[], item: T, filter: { (tester: T, ...args): boolean }, ...args) => {
        //根据物品战力进行插入
        let right = partArr.length - 1;
        let left = 0;
        while (left <= right) {
            let middle = (left + right) >> 1;
            let test = partArr[middle];
            if (filter(test, ...args as any)) {
                right = middle - 1;
            } else {
                left = middle + 1;
            }
        }
        partArr.splice(left, 0, item);
    }

    Array.SORT_DEFAULT = {
        number: 0,
        string: "",
        boolean: false
    }

    Object.freeze(Array.SORT_DEFAULT);


    Object.defineProperties(Array.prototype, makeDefDescriptors({
        cloneTo: {
            value: function <T>(this: T[], b: any[]) {
                b.length = this.length;
                let len = this.length;
                b.length = len;
                for (let i = 0; i < len; i++) {
                    b[i] = this[i];
                }
            }
        },
        appendTo: {
            value: function <T>(this: T[], b: any[]) {
                let len = this.length;
                for (let i = 0; i < len; i++) {
                    b.push(this[i]);
                }
            }
        },
        pushOnce: {
            value: function <T>(this: T[], t: T) {
                let idx = this.indexOf(t);
                if (!~idx) {
                    idx = this.length;
                    this[idx] = t;
                }
                return idx;
            }
        },
        remove: {
            value: function <T>(this: T[], t: T) {
                let idx = this.indexOf(t);
                if (~idx) {
                    this.splice(idx, 1);
                    return true;
                }
                return false;
            },
            writable: true
        },
        doSort: {
            value: function () {
                let key: string, descend: boolean;
                let len = arguments.length;
                // if (DEBUG && len > 2) {
                //     rf.ThrowError(`doSort参数不能超过2`);
                // }
                for (let i = 0; i < len; i++) {
                    let arg = arguments[i];
                    let t = typeof arg;
                    if (t === "string") {
                        key = arg;
                    } else {
                        descend = !!arg;
                    }
                }
                if (key) {
                    return this.sort((a: any, b: any) => descend ? b[key] - a[key] : a[key] - b[key]);
                } else {
                    return this.sort((a: any, b: any) => descend ? b - a : a - b);
                }
            }
        },
        multiSort: {
            value: function (kArr: string[], dArr?: boolean[] | boolean) {
                let isArr = Array.isArray(dArr);
                return this.sort((a: any, b: any): number => {
                    const def = Array.SORT_DEFAULT;
                    for (let idx = 0, len = kArr.length; idx < len; idx++) {
                        let key = kArr[idx];
                        let mode = isArr ? !!dArr[idx] : !!dArr;
                        let av = a[key];
                        let bv = b[key];
                        let typea = typeof av;
                        let typeb = typeof bv;
                        if (typea == "object" || typeb == "object") {
                            // if (DEBUG) {
                            //     rf.ThrowError(`multiSort 比较的类型不应为object,${typea}    ${typeb}`);
                            // }
                            return 0;
                        }
                        else if (typea != typeb) {
                            if (typea == "undefined") {
                                bv = def[typeb];
                            } else if (typeb == "undefined") {
                                av = def[typea];
                            }
                            else {
                                // if (DEBUG) {
                                //     rf.ThrowError(`multiSort 比较的类型不一致,${typea}    ${typeb}`);
                                // }
                                return 0;
                            }
                        }
                        if (av < bv) {
                            return mode ? 1 : -1;
                        } else if (av > bv) {
                            return mode ? -1 : 1;
                        } else {
                            continue;
                        }
                    }
                    return 0;
                });
            }
        }
    }));
    
}