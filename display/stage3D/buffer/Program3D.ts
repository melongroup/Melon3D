import { context3D, gl } from "../Stage3D.js";
import { Buffer3D } from "./Buffer3D.js";

export class Program3D extends Buffer3D {
    program: WebGLProgram;

    private vShader: WebGLShader;

    private fShader: WebGLShader

    vertexCode: string;
    fragmentCode: string;

    paramsInfo: { [key: string]: IWebglActiveInfo } = {};
    // attribs: { [key: string]: IWebglActiveInfo } = {};

    setting: IShaderSetting;

    runed: boolean;

    constructor() {
        super();
        this.gctime = 60000;
    }


    numberTypes = [WebGLConst.FLOAT, WebGLConst.FLOAT_VEC2, WebGLConst.FLOAT_VEC3, WebGLConst.FLOAT_VEC4, WebGLConst.INT, WebGLConst.INT_VEC2, WebGLConst.INT_VEC3, WebGLConst.INT_VEC4];

    awaken(): boolean {
        if (undefined != this.program) {
            return true;
        }

        if (!this.vertexCode || !this.fragmentCode) {
            console.log("vertexCode or fragmentCode is empty")
            return false;
        }


        //创建 vertexShader
        this.vShader = this.createShader(this.vertexCode, WebGLConst.VERTEX_SHADER);
        this.fShader = this.createShader(this.fragmentCode, WebGLConst.FRAGMENT_SHADER);
        let program = gl.createProgram();
        this.program = program;

        gl.attachShader(program, this.vShader);
        gl.attachShader(program, this.fShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, WebGLConst.LINK_STATUS)) {
            this.dispose();
            console.log(`create program error:${gl.getProgramInfoLog(program)}`);
            return false;
        }


        let { paramsInfo, numberTypes } = this;


        function toParamsInfo(info: WebGLActiveInfo, loc: any, tag: number) {
            let infoname = info.name;
            let type = info.type;
            let i = infoname.indexOf("[");
            let name = i != -1 ? infoname.slice(0, i) : infoname;
            let f: string;
            let len = numberTypes.indexOf(type);
            // let v = "name == infoname ? "" : "v";"
            
            if (len != -1) {
                f = len < 4 ? "f" : "i";
                len = (len % 4) + 1;
            } else {
                len = 0;
            }

            let v: string;
            if (len == 4) {
                v = "v";
            }

            let module: string;
            if (tag == 1) {
                module = `uniform${len}${f ? "f" : "i"}${v ? "v" : ""}`;
            }


            return { name, type, loc, tag, used: false, len, v, f, module } as IWebglActiveInfo
        }



        let tag = 0;
        const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < numAttribs; ++i) {
            const info = gl.getActiveAttrib(program, i);
            const loc = gl.getAttribLocation(program, info.name);
            paramsInfo[info.name] = toParamsInfo(info, loc, tag);
            console.log(paramsInfo[info.name])
        }

        tag = 1;
        const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; ++i) {
            const info = gl.getActiveUniform(program, i);
            const loc = gl.getUniformLocation(program, info.name);
            paramsInfo[info.name] = toParamsInfo(info, loc, tag);
            console.log(paramsInfo[info.name])
        }

        //加入资源管理
        context3D.bufferLink.add(this, this, undefined);
        this.runed = false;
        this.readly = true;
        return true;
    }







    dispose(): void {
        if (this.vShader) {
            gl.detachShader(this.program, this.vShader);
            gl.deleteShader(this.vShader);
            this.vShader = null;
        }

        if (this.fShader) {
            gl.detachShader(this.program, this.fShader);
            gl.deleteShader(this.fShader);
            this.fShader = null;
        }

        if (this.program) {
            gl.deleteProgram(this.program);
            this.program = null;
        }
    }

    recycle(): void {
        this.dispose();
        // this.vertexCode = undefined;
        // this.fragmentCode = undefined;
        this.preusetime = 0;
        this.readly = false;

        this.paramsInfo = {};
        // context3D.bufferLink.remove(this);
    }
    /*
        * load shader from html file by document.getElementById
        */
    private createShader(code: string, type: number) {
        let g = gl;
        var shader = g.createShader(type);
        g.shaderSource(shader, code);
        g.compileShader(shader);
        // Check the result of compilation
        if (!g.getShaderParameter(shader, WebGLConst.COMPILE_STATUS)) {
            let error: string = g.getShaderInfoLog(shader);
            g.deleteShader(shader);
            console.log(error);
            throw new Error(error);
        }
        return shader;
    }
}