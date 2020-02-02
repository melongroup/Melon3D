import { forarr, foreach } from "../../../melon_runtime/Attibute.js";
import { TEMP_MATRIX3D } from "../../core/Geom.js";
import { Sprite } from "../Sprite.js";
import { UniformFunc } from "./Attibute.js";
import { Program3D } from "./buffer/Program3D.js";
import { Camera } from "./camera/Camera.js";
import { Context3D } from "./Context3D.js";
import { Geometry } from "./Geometry.js";
import { Material } from "./Material.js";
import { IShaderParamTarget, ShaderParamTarget } from "./ShaderParamTarget.js";
import { context3D } from "./Stage3D.js";


export interface IStageRenderOption extends IRenderOption {
    camera: Camera;
    gl: WebGLRenderingContext;
    context: Context3D;
    program: Program3D;
    shaderParmas: IShaderParamTarget[];

    renderer: Renderer;

    cameraPos: IVector3D;
    lightDirection: IVector3D;

    uivc: Float32Array;

    [key: string]: any;



    // ambientTexutre: BitmapSource;
    // diffTexutre: BitmapSource;
    // specularTexutre: BitmapSource;
    // specularEnvMapTexutre: BitmapSource;

    // ambientColor: IVector3D;
    // diffColor: IVector3D;
    // specularColor: IVector3D;



}

export class Renderer extends ShaderParamTarget {

    /**
     * 渲染对象
     */
    target: Sprite;


    /**
     * 模型
     */
    geometry: Geometry;

    /**
     * 材质
     */
    material: Material;



    /**
     * 
     */
    programKey: string;

    /**
     * 
     */
    program: Program3D;


    depth = false;
    depthMode = WebGLConst.ALWAYS;

    srcFactor = WebGLConst.SRC_ALPHA;
    dstFactor = WebGLConst.ONE_MINUS_SRC_ALPHA;

    constructor(target: Sprite) {
        super();
        this.target = target;
        target.renderer = this;
    }


    setDepth(depth: boolean, depthMode: number) {
        this.depth = depth;
        this.depthMode = depthMode;
    }

    setBlend(src: number, dst: number) {
        this.srcFactor = src;
        this.dstFactor = dst;
    }


    updateRenderSetting(c: Context3D) {
        let setting = c.setting;
        let { depth, depthMode, srcFactor, dstFactor } = this;
        setting.depth = depth;
        setting.depthMode = depthMode;
        setting.src = srcFactor;
        setting.dst = dstFactor;
    }



    createProgram(option: IStageRenderOption, material: Material) {

        let key = material.getKey(option);
        let c = option.context;

        let program = c.programs[key];
        if (undefined === program) {
            let vertexCode = material.replaceVertexCode(option);
            let fargmentCode = material.replaceFargementCode(option);
            program = c.createProgram(vertexCode, fargmentCode, key);
        }
        
        this.program = program;
        return program;
    }

    createPrgramByTarget(c: Context3D, target: Sprite, key?: string) {

    }



    render(option: IStageRenderOption) {

        let { target, geometry, material } = this;

        if (!target || !geometry || !material) {
            return true;
        }

        option.renderer = this;
        let list = option.shaderParmas;
        list[0] = geometry;
        list[1] = material;
        list[2] = target;
        list[3] = this;



        let c = context3D;
        let { program } = this;
        if (!program) {
            program = this.createProgram(option, material)
        }

        c.setProgram(program);

        // updateUniforms
        option.program = program;
        this.updateShaderParam(option);

        //设置渲染模式
        this.updateRenderSetting(c);

        //draw call
        let { index, numTriangles } = geometry;
        c.drawTriangles(index, numTriangles);


        return true;

    }

    updateShaderParam(option: IStageRenderOption) {

        let { program } = option;

        forarr(option.shaderParmas, v => {
            v.updateShaderProperty(option, program);
            return true;
        });




        // if (!program.runed) {
        //     foreach(program.paramsInfo, v => {
        //         if (!v.used) {
        //             console.error(`${v.tag} ${v.name} not used`);

        //         }
        //         return true;
        //     });

        //     program.runed = true;
        // }




    }







    updateShaderUniform(option: IStageRenderOption, info: IWebglActiveInfo) {
        let name = info.name;

        let data = this[name] ? this[name] : option[name];

        let flag = true;

        if (data === undefined) {
            console.error(`${name} not set`);
            flag = false;
        } else {
            let context = option.context;
            if (info.len > 0) {
                context.updateUniformData(info, data);
            } else {
                flag = context.updateTextureData(info, data);
            }
        }

        return flag;
    }


    setMaterial(data: IMaterialData) {
        foreach(data as any, (v, k) => {
            this[k] = v;
            return true;
        })
    }




    @UniformFunc("mvp")
    mvp(option: IStageRenderOption, info: IWebglActiveInfo): void {
        let { camera, context, renderer } = option;
        let { target } = renderer;
        let matrix = TEMP_MATRIX3D;
        matrix.m3_append(camera.worldTranform, false, target.worldMatrix);
        context.updateUniformMatrixData(info, matrix);
    }


    @UniformFunc("mv")
    mv(option: IStageRenderOption, info: IWebglActiveInfo): void {
        let { camera, context, renderer } = option;
        let { target } = renderer;
        let matrix = TEMP_MATRIX3D;
        matrix.m3_append(camera.worldMatrix, false, target.worldMatrix);
        context.updateUniformMatrixData(info, matrix);
    }

    @UniformFunc()
    vp(option: IStageRenderOption, info: IWebglActiveInfo): void {
        let { camera, context } = option;
        context.updateUniformMatrixData(info, camera.worldTranform);
    }


    @UniformFunc("m")
    m(option: IStageRenderOption, info: IWebglActiveInfo): void {
        let { context, renderer } = option;
        let { target } = renderer;
        // let matrix = TEMP_MATRIX3D;
        // matrix.m3_append(camera.worldTranform, false, target.worldMatrix);
        context.updateUniformMatrixData(info, target.worldMatrix);
    }

    @UniformFunc("v")
    v(option: IStageRenderOption, info: IWebglActiveInfo): void {
        let { context, camera } = option;
        // let { target } = this;
        // let matrix = TEMP_MATRIX3D;
        // matrix.m3_append(camera.worldTranform, false, target.worldMatrix);
        context.updateUniformMatrixData(info, camera.worldMatrix);
    }


    @UniformFunc("p")
    p(option: IStageRenderOption, info: IWebglActiveInfo): void {
        let { context, camera } = option;
        // let { target } = this;
        // let matrix = TEMP_MATRIX3D;
        // matrix.m3_append(camera.worldTranform, false, target.worldMatrix);
        context.updateUniformMatrixData(info, camera.len);
    }

    @UniformFunc()
    originFar(option: IStageRenderOption, info: IWebglActiveInfo): void {
        let { context, camera } = option;
        context.updateUniformData(info, camera.originFar);
    }
}