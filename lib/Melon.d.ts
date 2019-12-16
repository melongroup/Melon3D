/**
* 资源类型
*/
declare const enum ResType {
    /**
     * 二进制
     */
    bin,

    amf,

    amf_inflate,
    /**
     * 文本
     */
    text,
    /**
     * 音乐
     */
    sound,
    /**
     * 图片
     */
    image
}

declare const enum LoadPriority {
    low,
    middle,
    high,
    max,
}

declare const enum LoadStates {
    WAIT,
    LOADING,
    COMPLETE,
    FAILED
}


declare module Zlib {
    class Inflate {
        constructor(byte: Uint8Array);
        decompress(): Uint8Array;
    }
}

declare const enum DChange {
    trasnform = 0b1,
    HIT_AREA = trasnform << 1,
    alpha = HIT_AREA << 1,

    vertex = alpha << 1,

    //底层transfrom改变 child transform = ct;
    CHILD_TRANSFROM = vertex << 1,
    //底层htiArea改变
    CHILD_HITAREA = CHILD_TRANSFROM << 1,
    //底层Alpha变化
    CHILD_ALPHA = CHILD_HITAREA << 1,

    CHILD_ALL = (CHILD_TRANSFROM | CHILD_ALPHA),
    // ac = (area | ca),
    // ta = (trasnform | alpha),
    // batch = vertex,
    // base = (trasnform | alpha | area | ct),
    /**
     *  自己有transform变化 或者 下层有transform变化
     */
    // t_all = (trasnform | alpha | ct),
}



declare interface IPANEL_TWEEN_DATA {
    type: string;
    time: number;
    duration?: number;
    lifetime?: number;

    offsetDegree?: number | number[];
    ease?: string;

    from?: number | number[];
    to?: number | number[];

    len?: number | number[];
    degree?: number | number[];

    so?: { [key: string]: number };
    eo?: { [key: string]: number };

    ef?: string;
    p?: any;
    t?: any;
    sp?: number;

    rt?: boolean
}



declare type PosKey = "x" | "y";
declare type SizeKey = "width" | "height";

/**
 * 包含 x,y两个点的结构
 * 
 * @export
 * @interface Point2D
 */
declare interface Point2D {
    x: number;
    y: number;
}
/**
 * 包含 x,y,z 三个点的结构
 * 
 * @export
 * @interface Point3D
 * @extends {Point2D}
 */
declare interface Point3D extends Point2D {
    z: number;
}
/**
 * 包含 x,y,z,w 四个点的结构
 * 
 * @export
 * @interface Point3DW
 * @extends {Point3D}
 */
declare interface Point3DW extends Point3D {
    w: number;
}

declare interface Size extends Point2D {
    w: number;
    h: number;
}


declare interface IFrame extends Size {
    ix: number;
    iy: number;
}

declare interface IUVFrame extends IFrame {
    ul: number;
    ur: number;
    vt: number;
    vb: number;
}


declare const enum Align {
    TOP_LEFT,
    TOP_CENTER,
    TOP_RIGHT,
    MIDDLE_LEFT,
    MIDDLE_CENTER,
    MIDDLE_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_CENTER,
    BOTTOM_RIGHT,
}


declare const enum ExtensionDefine {
    JPG = ".jpg",
    PNG = ".png",
    KM = ".km",
    DAT = ".dat",
    P3D = ".p3d",
    PARTICLE = ".pa",
    SKILL = ".sk",
    KF = ".kf",
    ANI = ".ha",
    PAK = ".hp"
}

declare const enum Orientation3D {
    EULER_ANGLES,// = "eulerAngles",
    AXIS_ANGLE,// = "axisAngle",
    QUATERNION,// = "quaternion",
}

declare interface IOffsetResize {
    stageWidth: number;//实际舞台尺寸
    stageHeight: number;
    ox: number;//偏移值
    oy: number;
    sx: number;//缩放
    sy: number;
}


declare interface IArrayBase {
    clone<T>(): T | Object;
    buffer: ArrayBuffer;
    set(array: ArrayLike<number> | IArrayBase, offset?: number): void;
    readonly length: number;
    [n: number]: number;
}

declare interface IVector3D extends IArrayBase {
    x: number;
    y: number;
    z: number;
    w: number;
    v3_lengthSquared: number;
    v2_length: number;
    v3_length: number;
    v3_add(v: IVector3D | ArrayLike<number>, out?: IVector3D): IVector3D;
    v3_sub(v: IVector3D | ArrayLike<number>, out?: IVector3D): IVector3D;
    v3_scale(v: number);
    v4_scale(v: number);
    v3_normalize(from?: ArrayLike<number>);
    v3_dotProduct(t: ArrayLike<number>);
    v3_crossProduct(t: ArrayLike<number>, out?: IVector3D | number[]);
    v3_applyMatrix4(e: ArrayLike<number>, out?: IVector3D | number[])
}

declare interface IMatrixComposeData {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotaiton: number;
}

declare interface IMatrix extends IArrayBase {
    m2_identity(): void;
    m2_append(m2: ArrayLike<number> | IArrayBase, prepend?: boolean, from?: ArrayLike<number>): IMatrix;
    m2_scale(scalex: number, scaley: number): void;
    m2_rotate(angle: number): void;
    m2_transformVector(v: IVector3D | number[], result?: IVector3D | number[]);
    m2_decompose(result?: IMatrixComposeData): IMatrixComposeData;
    m2_recompose(value: IMatrixComposeData): IMatrix;
    m2_clone(): IMatrix;
}

declare interface IMatrix3D extends IArrayBase {
    m3_identity(from?: ArrayLike<number>): IMatrix3D;
    m3_append(m3: ArrayLike<number> | IArrayBase, prepend?: boolean, from?: ArrayLike<number>): IMatrix3D;
    m3_rotation(degrees: number, axis: IVector3D | number[], prepend?: boolean, from?: ArrayLike<number>): IMatrix3D;
    m3_scale(x: number, y: number, z: number, prepend?: boolean, from?: ArrayLike<number>): IMatrix3D;
    m3_translation(x: number, y: number, z: number, prepend?: boolean, from?: ArrayLike<number>): IMatrix3D;
    m3_invert(from?: ArrayLike<number>, pos?: boolean): IMatrix3D;
    m3_decompose(pos: IVector3D | number[], rot: IVector3D | number[], sca: IVector3D | number[], orientationStyle?: Orientation3D): void;
    m3_recompose(pos: IVector3D | number[], rot: IVector3D | number[], sca: IVector3D | number[], orientationStyle?: Orientation3D): IMatrix3D;
    m3_copyColumnFrom(column: number, vector3D: IVector3D | number[]): void;
    m3_copyColumnTo(column: number, vector3D: IVector3D | number[]): void;
    m3_transformVector(v: IVector3D | number[], result?: IVector3D | number[]): void;
    m3_transformVectors(vin: ArrayLike<number>, vout: Float32Array | number[]): void;
    m3_transformRotation(v: IVector3D | number[], result?: IVector3D | number[]): void;
    m3_getMaxScaleOnAxis(): number;
    m3_toString(scale: number): void;
}


declare interface Float32Array extends IMatrix3D, IVector3D, IMatrix {
    x: number;
    y: number;
    z: number;
    w: number;
    update(data32PerVertex: number, offset: number, v: number): void;
    wPoint1(position: number, x: number, y?: number, z?: number, w?: number): void
    wPoint2(position: number, x: number, y: number, z?: number, w?: number): void
    wPoint3(position: number, x: number, y: number, z: number, w?: number): void
    wPoint4(position: number, x: number, y: number, z: number, w: number): void
}

declare interface Object {
    /**
     * 返回一个浅副本的对象
     * 此对象会拷贝key value
     * 
     * @memberOf Object
     */
    clone(): Object;
    /**
     * 将数据拷贝到 to
     * @param to 目标
     */
    copyto(to: Object);
    /**
     * 获取指定属性的描述，会查找当前数据和原型数据
     * @param property 指定的属性名字
     */
    getPropertyDescriptor(property: string): PropertyDescriptor;

    /**
     * 检查两个对象是否相等，只检查一层
     * 
     * @param {object} checker 
     * @param {...(keyof this)[]} args  如果不设置key列表，则使用checker可遍历的key进行检查
     * 
     * @memberOf Object
     */
    equals(checker: object, ...args: (keyof this)[]);

    /**
     * 
     * 拷贝指定的属性到目标对象
     * @param {object} to           目标对象
     * @param {...string[]} proNames   指定的属性
     */
    copyWith<T>(this: T, to: object, ...proNames: (keyof T)[]): void;
    /**
     * 
     * 获取指定的属性的Object
     * @param {...string[]} proNames 指定的属性
     * @returns {object}
     */
    getSpecObject<T>(this: T, ...proNames: (keyof T)[]): object;
}


declare interface Function {

    /**
     * 检查当前类型是否是测试的类型的子类
     * 
     * @param {Function} testBase
     * @returns {boolean}
     * 
     * @memberOf Object
     */
    isSubClass(testBase: Function): boolean;
}


declare interface Math {
    /**
     * 让数值处于指定的最大值和最小值之间，低于最小值取最小值，高于最大值取最大值
     * @param value 要处理的数值
     * @param min   最小值
     * @param max   最大值
     */
    clamp(value: number, min: number, max: number): number;

    /**
     * 从最小值到最大值之间随机[min,max)
     */
    random2(min: number, max: number): number;

    /**
     * 从中间值的正负差值 之间随机 [center-delta,center+delta) 
     * 
     * @param {number} center 
     * @param {number} delta 
     * @returns {number} 
     * @memberof Math
     */
    random3(center: number, delta: number): number;
    /**
     * 角度转弧度的乘数  
     * Math.PI / 180
     * @type {number}
     * @memberOf Math
     */
    DEG_TO_RAD: number;
    /**
     * 弧度转角度的乘数  
     * 180 / Math.PI
     */
    RAD_TO_DEG: number;
    /**
     * 整圆的弧度
     */
    PI2: number;
    /**
     * 90°的弧度
     * 
     * @type {number}
     * @memberOf Math
     */
    PI_1_2: number;
}

declare interface NumberConstructor {
    /**
     * 是否为安全整数
     * 
     * @param {number} value 
     * @returns {boolean} 
     * 
     * @memberOf Number
     */
    isSafeInteger(value: number): boolean;
}



declare interface Number {
    /**
     * 对数字进行补0操作
     * @param length 要补的总长度
     * @return 补0之后的字符串
     */
    zeroize(length: number): string;

    /**
     * 数值介于，`min` `max`直接，包含min，max  
     * 即：[min,max]
     * 
     * @param {number} min 
     * @param {number} max 
     * @returns {boolean} 
     * @memberof Number
     */
    between(min: number, max: number): boolean;
}


declare interface String {
    /**
     * 替换字符串中{0}{1}{2}{a} {b}这样的数据，用obj对应key替换，或者是数组中对应key的数据替换
     */
    trim(): string;
    substitute(...args): string;
    substitute(args: any[]): string;
    /**
     * 对数字进行补0操作
     * @param length 要补的总长度
     * @return 补0之后的字符串
     */
    zeroize(length: number): string;
    /**
     * 将一个字符串转换成一个很小几率重复的数值  
     * <font color="#ff0000">此方法hash的字符串并不一定唯一，慎用</font>
     */
    hash(): number;

    /**
     * 获取字符串长度，中文方块字符算两个长度
     */
    trueLength(): number;
}


declare interface StringConstructor {
    /**
     * 对数字进行补0操作
     * @param value 要补0的数值
     * @param length 要补的总长度
     * @return 补0之后的字符串
     */
    zeroize: (value: number, length: number) => string;
    /**
     * 注册substitute的回调
     * 
     * @param {string} key
     * @param {{ (input: any): string }} handler
     * 
     * @memberOf StringConstructor
     */
    regSubHandler(key: string, handler: { (input: any): string });

    /**
     * substitute的回调函数
     * 
     * @type {Readonly<{ [index: string]: { (input: any): string } }>}
     * @memberOf StringConstructor
     */
    subHandler: Readonly<{ [index: string]: { (input: any): string } }>;
}


declare const enum ArraySort {
    /**
     * 升序
     */
    ASC = 0,
    /**
     * 降序
     */
    DESC = 1
}




declare interface ArrayConstructor {
    binaryInsert<T>(partArr: T[], item: T, filter: { (tester: T, ...args): boolean }, ...args);
    SORT_DEFAULT: { number: 0, string: "", boolean: false };
}

declare interface Date {

    /**
     * 格式化日期
     * 
     * @param {string} mask 时间字符串
     * @param {boolean} [local] 是否基于本地时间显示，目前项目，除了报错信息，其他时间都用UTC时间显示
     * @returns {string} 格式化后的时间
     */
    format(mask: string, local?: boolean): string;
}



declare interface Array<T> {
    /**
     * 如果数组中没有要放入的对象，则将对象放入数组
     * 
     * @param {T} t 要放入的对象
     * @returns {number} 放入的对象，在数组中的索引
     * 
     * @memberof Array
     */
    pushOnce(t: T): number;

    /**
    * 
    * 删除某个数据
    * @param {T} t
    * @returns {boolean}   true 有这个数据并且删除成功
    *                      false 没有这个数据
    */
    remove(t: T): boolean;

    /**
     * 排序 支持多重排序
     * 降序, 升序
     * @param {(keyof T)[]} kArr              参数属性列表
     * @param {(boolean[] | ArraySort[])} [dArr] 是否降序，默认升序
     * @returns {this}
     * 
     * @memberOf Array
     */
    multiSort(kArr: (keyof T)[], dArr?: boolean[] | ArraySort[]): this;

    /**
     * 默认排序
     * 
     * @param {string} [key]
     * @param {boolean} [descend]
     * 
     * @memberOf Array
     */
    doSort(key?: keyof T, descend?: boolean | ArraySort): this;
    doSort(descend?: boolean | ArraySort, key?: keyof T): this;

    /**
     * 将数组克隆到to  
     * to的数组长度会和当前数组一致
     * 
     * @template T
     * @param {Array<T>} to
     */
    cloneTo<T>(to: Array<T>);

    /**
     * 将数组附加到to中
     * 
     * @template T
     * @param {Array<T>} to
     * 
     * @memberOf ArrayConstructor
     */
    appendTo<T>(to: Array<T>);
}

declare interface IShaderSetting {
    skey: string;
    useEye?: boolean;
    usePos?: boolean;
    useQua2mat?: boolean;
    useNormal?: boolean;
    useColor?: boolean;
    useShadow?: boolean;
    useInvm?: boolean;
}

declare interface IBounds {
    max: IVector3D;
    min: IVector3D;
    center: IVector3D;
}

declare interface IVariable {
    size: number;
    offset: number;
}

declare interface IVariables {
    [key: string]: IVariable
}


declare interface Buffer3D {
    preusetime: number
    gctime: number
    readly: boolean;
    awaken(): void;
    sleep(): void
}

declare interface ITextureData {
    key: string;
    url: string;

    mipmap: boolean;

    mag: number;
    min: number;
    wrapS: number;
    wrapT: number;

    y: boolean;
}

declare interface IMaterialData {

    /*
        pbr
        phong
        base
    */
    type: string;

    srcFactor: number;
    dstFactor: number;
    depth: boolean;
    depthMode: number;
    cull: number;

    alphaTest: number;



    diffColor: IVector3D;
    diffTexture: ITextureData;

    metallic: number;
    roughness: number;
    metallicRoughnessAoTexture: ITextureData;

    emissiveColor: IVector3D;
    emissiveTexture: ITextureData;
    normalTexture: ITextureData;

    occlusionTexture: ITextureData;

}

declare interface IMeshData {
    material: IMaterialData;
    geometry: IGeometry;
    geometryInstance : any;
}


declare interface IUnitData {
    name: string;
    meshes: IMeshData[];
}



declare interface IGeometry {
    numVertices: number
    vertex: Float32Array;
    data32PerVertex: number;
    variables: IVariables;
    index?: Uint16Array;
    numTriangles?: number;
}

declare interface IGraphicsGeometry extends IGeometry {
    preNumVertices?: number;
    batched?: boolean;
}


declare interface IBatchRendererSetting {
    vc: number;
    source: number;
}


declare interface IRenderOption {
    now: number;
    interval: number;
    rect: Size;
}


declare interface IWebglActiveInfo {
    /**
     * 0 attribute
     * 1 uniform
     */
    tag: number;
    name: string;
    type: number;
    loc: any;

    len?: number;
    f?: string;
    v?: string;

    module?: string;
    used: boolean;
}



declare interface IWebglParameterInfo {
    attribute: number;
    vertuniform: number;
    fraguniform: number;
    texture: number;
    precision: string;

}