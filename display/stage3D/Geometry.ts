import { IRecyclable } from "../../../melon_runtime/ClassUtils.js";
import { DEGREES_TO_RADIANS } from "../../core/CONFIG.js";
import { TEMP_VECTOR3D, X_AXIS, Y_AXIS } from "../../core/Geom.js";
import { newMatrix3D, newVector3D } from "../../core/Matrix3D.js";
import { VA } from "./buffer/Buffer3D.js";
import { IndexBuffer3D } from "./buffer/IndexBuffer3D.js";
import { VertexBuffer3D } from "./buffer/VertexBuffer3D.js";
import { context3D, gl } from "./Stage3D.js";
import { Camera } from "./camera/Camera.js";
import { ShaderParamTarget, ProgramInfoType } from "./ShaderParamTarget.js";
import { foreach } from "../../../melon_runtime/Attibute.js";
import { IStageRenderOption } from "./Renderer.js";

export let vertex_ui_variable: IVariables = {
    //x,y,z,u,v,index,r,g,b,a
    "pos": { size: 3, offset: 0 },
    "uv": { size: 4, offset: 3 }, //xy uv ~~ z index
    "color": { size: 4, offset: 7 },
    "data32PerVertex": { size: 11, offset: 0 }
}

export let vertex_mesh_variable: IVariables = {
    "pos": { size: 3, offset: 0 },
    "normal": { size: 3, offset: 3 },
    "uv": { size: 2, offset: 6 },
    "data32PerVertex": { size: 8, offset: 0 }
}

export let skybox_variable: IVariables = {
    "pos": { size: 3, offset: 0 },
    "data32PerVertex": { size: 3, offset: 0 }
}


export let vertex_mesh_full_variable: IVariables = {
    "pos": { size: 3, offset: 0 },
    "normal": { size: 3, offset: 3 },
    "uv": { size: 2, offset: 6 },
    "color": { size: 4, offset: 8 },
    "data32PerVertex": { size: 12, offset: 0 }
}


export let vertex_skeleton_variable: IVariables = {
    "index": { size: 4, offset: 0 },
    "weight": { size: 4, offset: 4 },
    "data32PerVertex": { size: 8, offset: 0 }
}

export const EMPTY_MAX_NUMVERTICES = Math.pow(2, 14);
export let empty_float32_pos = new Float32Array(3 * EMPTY_MAX_NUMVERTICES);
export let empty_float32_normal = new Float32Array(3 * EMPTY_MAX_NUMVERTICES);
export let empty_float32_tangent = new Float32Array(3 * EMPTY_MAX_NUMVERTICES);
export let empty_float32_uv = new Float32Array(2 * EMPTY_MAX_NUMVERTICES);
export let empty_float32_color = new Float32Array(4 * EMPTY_MAX_NUMVERTICES);

//2000面应该很多了吧
export let empty_uint16_indexs = new Uint16Array(3 * EMPTY_MAX_NUMVERTICES);

export let empty_float32_object: { [key: string]: Float32Array } = {
    "pos": empty_float32_pos,
    "normal": empty_float32_normal,
    "uv": empty_float32_uv,
    "color": empty_float32_color
}

export let empty_number_object: { [key: string]: number[] } = {
    "pos": new Array<number>(3),
    "normal": new Array<number>(3),
    "uv": new Array<number>(4),
    "color": new Array<number>(4)
}

/**
 * pos:Float32Array
 * noraml:Float32Array
 * uv:Float32Array
 * color:Float32Array
 */
export function createGeometryVertex(data: { [key: string]: Float32Array }, variables: IVariables, numVertices: number, result?: Float32Array): Float32Array {
    let data32PerVertex = variables["data32PerVertex"].size;
    if (undefined == result) {
        result = new Float32Array(data32PerVertex * numVertices);
    }
    let offset = 0;
    let offsetIndex = 0;
    let offsetData = 0;
    let key = "";
    let index = 0;
    for (let i = 0; i < numVertices; i++) {
        offset = data32PerVertex * i;
        for (key in data) {
            let variable = variables[key];
            if (undefined == variable) {
                continue;
            }
            let array = data[key];
            offsetData = i * variable.size;
            offsetIndex = offset + variable.offset;
            for (index = 0; index < variable.size; index++) {
                result[offsetIndex + index] = array[offsetData + index];
            }
        }
    }
    return result;
}


export function geometry_getVariableValue(key: string) {
    let arr = empty_number_object[key];
    if (!arr) {
        empty_number_object[key] = new Array<number>(4);
    }
    return arr;
}

export function geometry_addpoint(geometry: IGeometry, value: { [key: string]: number[] }) {
    let { numVertices, variables } = geometry;

    function set(variable: IVariable, array: Float32Array, data: number[]) {
        if (undefined == data || undefined == variable) {
            return;
        }
        let size = variable.size;
        let offset = numVertices * size
        if (data.length <= size) {
            array.set(data, offset)
        } else {
            array.set(data.slice(0, size), offset);
        }
    }

    for (const key in variables) {
        if (key == "data32PerVertex") continue;
        let data = value[key];
        const variable = variables[key];
        if (data && data.length >= variable.size) {
            let array = empty_float32_object[key];
            if (!array) {
                empty_float32_object[key] = array = new Float32Array(variable.size * EMPTY_MAX_NUMVERTICES);
            }
            set(variable, array, data);
        }
    }

    geometry.numVertices++;
}


export class VertexInfo implements IGeometry {
    vertex: Float32Array;
    numVertices = 0;
    data32PerVertex = 0;
    variables: IVariables;

    constructor(value: number[] | Float32Array, data32PerVertex: number, variables?: IVariables) {
        if (value instanceof Float32Array) {
            this.vertex = value
        } else {
            this.vertex = new Float32Array(value);
        }
        this.data32PerVertex = data32PerVertex;
        this.numVertices = this.vertex.length / data32PerVertex;
        this.variables = variables;
    }

    regVariable(variable: string, offset: number, size: number): void {
        if (undefined == this.variables) {
            this.variables = {};
        }
        this.variables[variable] = { size: size, offset: offset };
    }


    get debug() {

        let { variables, vertex } = this;

        let o = {};

        let data32PerVertex = variables.data32PerVertex.size;

        for (let i = 0; i < vertex.length; i += data32PerVertex) {
            for (let key in variables) {
                if (key == "data32PerVertex") {
                    continue;
                }

                let arr = o[key];
                if (!arr) {
                    o[key] = arr = []
                }

                let variable = variables[key];
                let { size, offset } = variable;

                if (size == 1) {
                    arr.push(vertex[i + offset]);
                } else {
                    let temp = [];
                    for (let j = 0; j < size; j++) {
                        temp.push(vertex[i + offset + j])
                    }
                    arr.push(temp);
                }

            }

        }

        return o;
    }
}

// export interface IBounding{
//     vertex:Float32Array;
//     index:Uint16Array;
// }

// export class Sphere{

//     copyFrom(sphere:Sphere){
//         this.center.set(sphere.center);
//         this.radius = sphere.radius;
//         this.change = false;
//     }

//     change:boolean = true;
//     radius:number = 0;
//     center:IVector3D = newVector3D();


//     applyMatrix4( matrix:IMatrix3D, result?:Sphere):Sphere{
//         result = result || this;

//         result.copyFrom(this);
//         matrix.m3_transformVector(result.center, result.center);
//         result.radius = this.radius * matrix.m3_getMaxScaleOnAxis(); 
//         return result;
//     }
// }

// export class OBB implements IBounding, IBox{
//     constructor(bounding?:ArrayLike<number> | ArrayBuffer |number, maxx?:number, miny?:number, maxy?:number, minz?:number, maxz?:number)
//     {
//         this.vertex = new Float32Array(24);
//         this.index = OBB.index;

//         if(bounding != undefined){
//             if (bounding instanceof ArrayBuffer)
//             {
//                 this.minx = bounding[0]; this.maxx = bounding[1];
//                 this.miny = bounding[2]; this.maxy = bounding[3];
//                 this.minz = bounding[4]; this.maxz = bounding[5];
//             }else{
//                 this.minx = Number(bounding); this.maxx = maxx;
//                 this.miny = miny; this.maxy = maxy;
//                 this.minz = minz; this.maxz = maxz;
//             }
//             this.updateTriangle();
//             this.change = false;
//         }
//     }

//    /*
//         7——————————4
//        /|         /|
//       6-|————————5 |
//       | 0--------|-3
//       |/         |/
//       1——————————2
//     */
//     vertex:Float32Array;
//     index:Uint16Array;
//     ////索引
//     // 0,1,2,3;   1,6,5,2;  2,5,4,3;    3,4,7,0;    4,5,6,7;    0,7,6,1;
//     static index:Uint16Array = new Uint16Array([
//         0,1,2,0,2,3,
//         1,6,5,1,5,2,
//         2,5,4,2,4,3,
//         3,4,7,3,7,0,
//         4,5,6,4,6,7,
//         0,7,6,0,6,1
//     ]);

//     change:boolean = true;

//     minx:number;
//     maxx:number;

//     miny:number;
//     maxy:number;

//     minz:number;
//     maxz:number;

//     updateTriangle(){
//         this.vertex[0] = this.minx; this.vertex[1] = this.miny; this.vertex[2] = this.minz;//0
//         this.vertex[3] = this.minx; this.vertex[4] = this.maxy; this.vertex[5] = this.minz;//1
//         this.vertex[6] = this.maxx; this.vertex[7] = this.maxy; this.vertex[8] = this.minz;//2
//         this.vertex[9] = this.maxx; this.vertex[10] = this.miny; this.vertex[11] = this.minz;//3

//         this.vertex[12] = this.maxx; this.vertex[13] = this.miny; this.vertex[14] = this.maxz;//4
//         this.vertex[15] = this.maxx; this.vertex[16] = this.maxy; this.vertex[17] = this.maxz;//5
//         this.vertex[18] = this.minx; this.vertex[19] = this.maxy; this.vertex[20] = this.maxz;//6
//         this.vertex[21] = this.minx; this.vertex[22] = this.miny; this.vertex[23] = this.maxz;//7
//     }
//     static updateOBBByGeometry(mesh:GeometryBase, out?:OBB):OBB{
//         let obb = out || new OBB();

//         const{numVertices,vertex,data32PerVertex,variables}=mesh.vertex.data;

//         let pos = variables['pos'];

//         obb.maxx = obb.minx = vertex[pos.offset];
//         obb.maxy = obb.miny = vertex[pos.offset+1];
//         obb.maxz = obb.minz = vertex[pos.offset+2];

//         for(let i = 1;i<numVertices;i++){
//             let p = i * data32PerVertex + pos.offset;
//             let x = vertex[p];
//             let y = vertex[p+1];
//             let z = vertex[p+2];

//             if(x < obb.minx)obb.minx = x;
//             else if(x > obb.maxx)obb.maxx = x;

//             if(y < obb.miny)obb.miny = y;
//             else if(y > obb.maxy)obb.maxy = y;

//             if(z < obb.minz)obb.minz = z;
//             else if(z > obb.maxz)obb.maxz = z;
//         }
//         obb.updateTriangle();
//         obb.change = false;
//         return obb;
//     }
// }

export interface IGeometryItem {
    vertex: VertexBuffer3D;
    index?: IndexBuffer3D;
}


export class Temp_Float32Byte implements IRecyclable {
    constructor() {
        this.data = new Float32Array(2048); //先无脑申请个8KB内存
    }
    data: Float32Array;
    data32PerVertex: number = 1;
    numVertices: number = 0;
    position: number = 0;
    onSpawn() {
        this.data32PerVertex = 1;
        this.numVertices = 0;
        this.position = 0;
    }


    set(array: ArrayLike<number>, offset?: number): void {
        if (undefined == offset) {
            offset = this.position;
        }
        this.data.set(array, offset);
        this.position = offset + array.length;
    }


    toArray(): Float32Array {
        let len = this.data32PerVertex * this.numVertices
        let arr = new Float32Array(len);
        arr.set(this.data.subarray(0, len));
        return arr;
    }
}


export function geometry_plane(width: number, height: number, position: number, variables: IVariables, matrix3D?: IMatrix3D) {

    let width_half = width * 0.5;
    let height_half = height * 0.5;

    let points = [
        width_half, height_half, 0, 0, 0,
        -width_half, height_half, 0, 1, 0,
        -width_half, -height_half, 0, 1, 1,
        width_half, -height_half, 0, 0, 1
    ];
    let v: IVector3D = TEMP_VECTOR3D;

    let variable = variables[VA.pos];
    let pos = variable ? variable.size * 4 : -1;

    variable = variables[VA.normal];
    let normal = variable ? variable.size * 4 : -1;

    variable = variables[VA.uv];
    let uv = variable ? variable.size * 4 : -1;

    variable = variables[VA.color];
    let color = variable ? variable.size * 4 : -1;


    for (let i = 0; i < 4; i++) {
        let p = i * 5;

        if (-1 != pos) {
            v.x = points[p];
            v.y = points[p + 1];
            v.z = points[p + 2];
            v.w = 1.0;
            if (undefined != matrix3D) {
                matrix3D.m3_transformVector(v, v);
            }
            empty_float32_pos.wPoint3(position * pos + (i * 3), v.x, v.y, v.z);
        }

        if (-1 != normal) {
            v.x = 0;
            v.y = 0;
            v.z = 1;
            if (undefined != matrix3D) {
                matrix3D.m3_transformRotation(v, v);
            }
            empty_float32_normal.wPoint3(position * normal + (i * 3), -v.x, -v.y, v.z);
        }

        if (-1 != uv) {
            // empty_float32_uv.wPoint2(position * uv + (i * 2), points[p + 3], points[p + 4]);
            empty_float32_uv.wPoint2(position * uv + (i * 2), 0, 0);
        }


        if (-1 != color) {
            empty_float32_color.wPoint4(position * color + (i * 4), 1, 1, 1, 1);
        }

    }
}

export class Geometry extends ShaderParamTarget implements IGeometryItem {



    // variables: IVariables;
    vertex: VertexBuffer3D;
    index: IndexBuffer3D;
    data: IGeometry;

    // data32PerVertex = 0;
    // numVertices = 0;
    numTriangles = 0;

    setData(data: IGeometry) {

        this.data = data;

        let { vertex, index, data32PerVertex, variables, numTriangles } = data;

        // data.data32PerVertex = this.data32PerVertex = variables["data32PerVertex"].size;

        let c = context3D;

        if (vertex) {
            this.vertex = c.createVertexBuffer(new VertexInfo(vertex, data32PerVertex, variables));
        }

        if (index) {
            this.index = c.createIndexBuffer(index);
            this.numTriangles = numTriangles
        }

        return this;
    }

    updateShaderProperty(option: IStageRenderOption, program: ProgramInfoType): boolean {
        let { vertex, data } = this;
        let { variables, data32PerVertex } = data;
        let { context } = option;
        let { paramsInfo } = program;

        foreach(variables, (variable, k) => {
            let info = paramsInfo[k];
            if (info) {
                info.used = true;
                context.updateVertexAttribPointer(info, vertex, variable, data32PerVertex);
            }
            return true;
        });


        return true;
    }



    // get pos() {
    //     const { numVertices, vertex, data32PerVertex } = this.vertex.data;
    //     let pos = [];
    //     for (let i = 0; i < numVertices; i++) {
    //         let p = i * data32PerVertex;
    //         pos.push([vertex[p], vertex[p + 1], vertex[p + 2]])
    //     }
    //     return pos;
    // }

    // get uv() {
    //     const { numVertices, vertex, data32PerVertex, variables } = this.vertex.data;
    //     let uv = variables["uv"];
    //     let uvs = [];
    //     for (let i = 0; i < numVertices; i++) {
    //         let p = i * data32PerVertex + uv.offset;
    //         uvs.push([vertex[p], vertex[p + 1]])
    //     }
    //     return uvs;
    // }

    // get triangles() {
    //     const { numTriangles } = this;
    //     const { data } = this.index;
    //     let triangles = [];
    //     for (let i = 0; i < numTriangles; i++) {
    //         let p = i * 3;
    //         triangles.push([data[p], data[p + 1], data[p + 2]])
    //     }

    //     return triangles;
    // }

    // calculateBoundingSphere(center:IVector3D, out?:Sphere):Sphere{
    //     let sphere:Sphere = out || new Sphere();

    //     const{numVertices,vertex,data32PerVertex,variables}=this.vertex.data;
    //     let minR = 0;
    //     let pos = variables['pos'];
    //     for(let i=0;i<numVertices;i++){
    //         let p = i * data32PerVertex + pos.offset;
    //         let x = vertex[p];
    //         let y = vertex[p+1];
    //         let z = vertex[p+2];

    //         x -= center.x;
    //         x *= x;

    //         y -= center.y;
    //         y *= y;

    //         z -= center.z;
    //         z *= z;
    //         let dis = Math.sqrt( x + y + z);
    //         if(dis > minR){
    //             minR = dis;
    //         }
    //     }
    //     sphere.center.set(center);
    //     sphere.radius = minR;
    //     sphere.change = false;
    //     return sphere;
    // }



    // uploadContext(camera: Camera, mesh: DisplayObject, program: Program3D, now: number, interval: number) {
    //     let c = context3D;
    //     this.vertex.uploadContext(program);
    //     let { worldMatrix: sceneMatrix, invSceneMatrix } = mesh;
    //     let worldTranform = TEMP_MATRIX3D;
    //     worldTranform.m3_append(camera.worldTranform, false, sceneMatrix);
    //     c.setProgramConstantsFromMatrix(VC.mvp, worldTranform);
    //     c.setProgramConstantsFromMatrix(VC.invm, invSceneMatrix);
    //     return worldTranform;
    // }

}

export interface ISkeletonJoint {
    index: number;
    name: string;
    inv: Float32Array;
    chind: ISkeletonJoint[];
    parent: ISkeletonJoint;
}

export class SkeletonGeometry extends Geometry {
    skVertex: VertexBuffer3D;
    joints: { [key: string]: ISkeletonJoint };
    jointroot: ISkeletonJoint;
}


export class PlaneGeometry extends Geometry {
    create(width: number = 1, height: number = 1, variables = vertex_mesh_full_variable) {
        let numVertices = 0;
        let quad = 0;
        // let matrix3D = newMatrix3D();

        geometry_plane(width, height, 0, variables);
        numVertices += 4;
        quad++;


        // matrix3D.m3_rotation(180*DEGREES_TO_RADIANS,Y_AXIS);
        // geometry_plane(width,height,1,variables,matrix3D);
        // numVertices += 4;
        // quad ++;


        let vertex = createGeometryVertex(empty_float32_object, variables, numVertices);


        let data32PerVertex = variables.data32PerVertex.size;

        let data = { vertex, numVertices, data32PerVertex, variables } as IGeometry;

        this.setData(data);

        return this;
    }
}



export class BoxGeometry extends Geometry {
    create(width: number, height: number, depth: number, variables = vertex_mesh_full_variable) {
        let matrix3D = newMatrix3D();
        let numVertices = 0;
        let quad = 0;

        matrix3D.m3_translation(0, 0, depth * 0.5);
        geometry_plane(width, height, quad, variables, matrix3D);
        numVertices += 4;
        quad++;

        matrix3D.m3_identity();
        matrix3D.m3_rotation(180 * DEGREES_TO_RADIANS, Y_AXIS);
        matrix3D.m3_translation(0, 0, -depth * 0.5);
        geometry_plane(width, height, quad, variables, matrix3D);
        numVertices += 4;
        quad++;


        matrix3D.m3_identity();
        matrix3D.m3_rotation(-90 * DEGREES_TO_RADIANS, Y_AXIS);
        matrix3D.m3_translation(width * 0.5, 0, 0);
        geometry_plane(depth, height, quad, variables, matrix3D);
        numVertices += 4;
        quad++;

        matrix3D.m3_identity();
        matrix3D.m3_rotation(90 * DEGREES_TO_RADIANS, Y_AXIS);
        matrix3D.m3_translation(-width * 0.5, 0, 0);
        geometry_plane(depth, height, quad, variables, matrix3D);
        numVertices += 4;
        quad++;


        matrix3D.m3_identity();
        matrix3D.m3_rotation(90 * DEGREES_TO_RADIANS, X_AXIS);
        matrix3D.m3_translation(0, height * 0.5, 0);
        geometry_plane(width, depth, quad, variables, matrix3D);
        numVertices += 4;
        quad++;


        matrix3D.m3_identity();
        matrix3D.m3_rotation(-90 * DEGREES_TO_RADIANS, X_AXIS);
        matrix3D.m3_translation(0, -height * 0.5, 0);
        geometry_plane(width, depth, quad, variables, matrix3D);
        numVertices += 4;
        quad++;


        let vertex = createGeometryVertex(empty_float32_object, variables, numVertices);
        let data32PerVertex = variables.data32PerVertex.size;


        let geometry = { vertex, data32PerVertex, numVertices, variables } as IGeometry

        this.setData(geometry);

        return this;
    }
}

// export class SkyBoxGeometry extends BoxGeometry {
//     create() {
//         return super.create(500., 500., 500.);
//     }

//     // uploadContext(camera: Camera, mesh: DisplayObject, program: Program3D, now: number, interval: number) {
//     //     let c = context3D;
//     //     this.vertex.uploadContext(program);
//     //     let { worldMatrix: sceneMatrix, invSceneMatrix } = mesh;
//     //     let worldTranform = TEMP_MATRIX3D;
//     //     sceneMatrix[12] = camera.pos[0];
//     //     sceneMatrix[13] = camera.pos[1];
//     //     sceneMatrix[14] = camera.pos[2];
//     //     worldTranform.m3_append(camera.worldTranform, false, sceneMatrix);
//     //     c.setProgramConstantsFromMatrix(VC.mvp, worldTranform);
//     //     c.setProgramConstantsFromMatrix(VC.invm, invSceneMatrix);
//     //     return worldTranform;
//     // }
// }

export function hsva(h: number, s: number, v: number, a: number) {
    if (s > 1 || v > 1 || a > 1) { return; }
    var th = h % 360;
    var i = Math.floor(th / 60);
    var f = th / 60 - i;
    var m = v * (1 - s);
    var n = v * (1 - s * f);
    var k = v * (1 - s * (1 - f));
    var color = [];
    var r = [v, n, m, m, k, v];
    var g = [k, v, v, n, m, m];
    var b = [m, m, k, v, v, n];
    color.push(r[i], g[i], b[i], a);
    return color;
}


export class SphereGeometry extends Geometry {
    create(row: number, column: number, rad: number, color?: number[]) {
        let numVertices = 0;
        for (let i = 0; i <= row; i++) {
            let r = Math.PI / row * i;
            let ry = Math.cos(r);
            let rr = Math.sin(r);
            for (let ii = 0; ii <= column; ii++) {
                let tr = Math.PI * 2 / column * ii;
                let tx = rr * rad * Math.cos(tr);
                let ty = ry * rad;
                let tz = rr * rad * Math.sin(tr);
                let rx = rr * Math.cos(tr);
                let rz = rr * Math.sin(tr);
                let tc = color;
                if (undefined == tc) {
                    tc = hsva(360 / row * i, 1, 1, 1);
                }
                empty_float32_pos.wPoint3(numVertices * 3, tx, ty, tz);
                empty_float32_normal.wPoint3(numVertices * 3, rx, ry, rz);
                // empty_float32_uv.wPoint2(numVertices * 2, 1 - 1 / column * ii, 1 / row * i);
                empty_float32_uv.wPoint2(numVertices * 2, 0, 0);
                empty_float32_color.wPoint4(numVertices * 4, tc[0], tc[1], tc[2], tc[3]);
                numVertices++;
            }
        }

        let position = 0;
        for (let i = 0; i < row; i++) {
            for (let ii = 0; ii < column; ii++) {
                let r = (column + 1) * i + ii;
                empty_uint16_indexs.set([r, r + 1, r + column + 2, r, r + column + 2, r + column + 1], position);
                position += 6;
            }
        }


        let variables = vertex_mesh_full_variable;
        let data32PerVertex = variables.data32PerVertex.size;

        let vertex = createGeometryVertex(empty_float32_object, variables, numVertices);
        let index = empty_uint16_indexs.slice(0, position);
        let numTriangles = position / 3;
        this.setData({ variables, vertex, index, data32PerVertex, numVertices, numTriangles });

        return this;
    }
}

// export class TorusGeomerty extends Geometry {

//     create(row: number, column: number, irad: number, orad: number) {
//         let numVertices = 0;
//         for (var i = 0; i <= row; i++) {
//             var r = Math.PI * 2 / row * i;
//             var rr = Math.cos(r);
//             var ry = Math.sin(r);
//             for (var ii = 0; ii <= column; ii++) {
//                 var tr = Math.PI * 2 / column * ii;
//                 var tx = (rr * irad + orad) * Math.cos(tr);
//                 var ty = ry * irad;
//                 var tz = (rr * irad + orad) * Math.sin(tr);
//                 var rx = rr * Math.cos(tr);
//                 var rz = rr * Math.sin(tr);
//                 // if(color){
//                 //     var tc = color;
//                 // }else{
//                 //     tc = hsva(360 / column * ii, 1, 1, 1);
//                 // }
//                 var rs = 1 / column * ii;
//                 var rt = 1 / row * i + 0.5;
//                 if (rt > 1.0) { rt -= 1.0; }
//                 rt = 1.0 - rt;

//                 empty_float32_pos.wPoint3(numVertices * 3, tx, ty, tz);
//                 empty_float32_normal.wPoint3(numVertices * 3, rx, ry, rz);
//                 empty_float32_uv.wPoint2(numVertices * 2, rs, rt);
//                 // empty_float32_color.wPoint4(numVertices * 4 , tc[0], tc[1], tc[2], tc[3]);
//                 numVertices++;
//             }
//         }

//         let position = 0;
//         for (i = 0; i < row; i++) {
//             for (ii = 0; ii < column; ii++) {
//                 r = (column + 1) * i + ii;
//                 empty_uint16_indexs.set([r, r + column + 1, r + 1, r + column + 1, r + column + 2, r + 1], position);
//                 position += 6;
//             }
//         }


//         let variables = this.variables;
//         let c = context3D;
//         let arr = createGeometry(empty_float32_object, variables, numVertices);
//         this.vertex = c.createVertexBuffer(new VertexInfo(arr, this.data32PerVertex, variables));
//         this.index = c.createIndexBuffer(empty_uint16_indexs.slice(0, position));

//         this.numVertices = numVertices;
//         this.numTriangles = position / 3;

//         return this;
//     }
// }

export class SkyBoxGeometry extends Geometry {

    create(size = 100, variables = skybox_variable) {
        const vertices = [
            // front face
            -size, size, size,
            -size, -size, size,
            size, -size, size,
            size, size, size,

            // back face
            size, size, -size,
            size, -size, -size,
            -size, -size, -size,
            -size, size, -size,

            // left face
            -size, size, -size,
            -size, -size, -size,
            -size, -size, size,
            -size, size, size,

            // right face
            size, size, size,
            size, -size, size,
            size, -size, -size,
            size, size, -size,

            // top face
            -size, size, -size,
            -size, size, size,
            size, size, size,
            size, size, -size,

            // bottom face
            -size, -size, size,
            -size, -size, -size,
            size, -size, -size,
            size, -size, size,
        ];

        empty_float32_pos.set(vertices);

        let numVertices = 24;
        let data32PerVertex = variables.data32PerVertex.size;
        let vertex = createGeometryVertex(empty_float32_object, variables, numVertices);

        this.setData({ variables, vertex, data32PerVertex, numVertices });

        return this;

    }
}