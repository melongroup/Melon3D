import { RecycleObjType, foreach } from "../../../melon_runtime/Attibute.js";
import { recyclable, Recyclable } from "../../../melon_runtime/ClassUtils.js";
import { Link } from "../../../melon_runtime/Link.js";
import { engineNow } from "../../../melon_runtime/Timer.js";
import { BitmapData } from "../../core/BitmapData.js";
import { TEMP_RECT } from "../../core/CONFIG.js";
import { size_intersection, TEMP_VECTOR3D } from "../../core/Geom.js";
import { newMatrix3D } from "../../core/Matrix3D.js";
import { BitmapSource, bitmapSources } from "../source/BitmapSource.js";
import { IndexBuffer3D } from "./buffer/IndexBuffer3D.js";
import { Program3D } from "./buffer/Program3D.js";
import { CubeTexture, RTTexture, Texture } from "./buffer/Texture.js";
import { VertexBuffer3D } from "./buffer/VertexBuffer3D.js";
import { VertexInfo } from "./Geometry.js";
import { gl } from "./Stage3D.js";


export var scissorRect: Size;
export var contextMatrix3D = newMatrix3D();
export var contextMatrix2D = newMatrix3D();
export var contextInvMatrix = newMatrix3D();

// export const enum Context3DCompareMode {
// 	ALWAYS = 'always',
// 	EQUAL = 'equal',
// 	GREATER = 'greater',
// 	GREATER_EQUAL = 'greaterEqual',
// 	LESS = 'less',
// 	LESS_EQUAL = 'lessEqual',
// 	NEVER = 'never',
// 	NOT_EQUAL = 'notEqual'
// }

export const enum Context3DTextureFormat {
	BGRA = 'bgra'
}

// export class Context3DBlendFactor {
// 	static ONE: number;
// 	static ZERO: number;

// 	static SOURCE_COLOR: number;
// 	static DESTINATION_COLOR: number;

// 	static SOURCE_ALPHA: number;
// 	static DESTINATION_ALPHA: number;

// 	static ONE_MINUS_SOURCE_COLOR: number;
// 	static ONE_MINUS_DESTINATION_COLOR: number;

// 	static ONE_MINUS_SOURCE_ALPHA: number;
// 	static ONE_MINUS_DESTINATION_ALPHA: number;

// 	static init(): void {
// 		Context3DBlendFactor.ONE = GL.ONE;
// 		Context3DBlendFactor.ZERO = GL.ZERO;
// 		Context3DBlendFactor.SOURCE_COLOR = GL.SRC_COLOR;
// 		Context3DBlendFactor.DESTINATION_COLOR = GL.DST_COLOR;
// 		Context3DBlendFactor.SOURCE_ALPHA = GL.SRC_ALPHA;
// 		Context3DBlendFactor.DESTINATION_ALPHA = GL.DST_ALPHA;
// 		Context3DBlendFactor.ONE_MINUS_SOURCE_COLOR = GL.ONE_MINUS_SRC_COLOR;
// 		Context3DBlendFactor.ONE_MINUS_DESTINATION_COLOR = GL.ONE_MINUS_DST_COLOR;
// 		Context3DBlendFactor.ONE_MINUS_SOURCE_ALPHA = GL.ONE_MINUS_SRC_ALPHA;
// 		Context3DBlendFactor.ONE_MINUS_DESTINATION_ALPHA = GL.ONE_MINUS_DST_ALPHA;
// 		//CONSTANT_COLOR
// 		//ONE_MINUS_CONSTANT_COLOR
// 		//ONE_MINUS_CONSTANT_ALPHA
// 	}
// }

export const enum Context3DVertexBufferFormat {
	BYTES_4 = 4,
	FLOAT_1 = 1,
	FLOAT_2 = 2,
	FLOAT_3 = 3,
	FLOAT_4 = 4
}

// export const enum Context3DTriangleFace {
// 	BACK = 'back', //CCW
// 	FRONT = 'front', //CW
// 	FRONT_AND_BACK = 'frontAndBack',
// 	NONE = 'none'
// }

// export const enum Context3DConst{
// 	CULL = 0b1,
// 	DEEP = CULL<<1,
// 	FACTOR = DEEP<<1
// }

export interface IContext3DSetting {
	cull: number;
	depth: boolean;
	logarithmicDepthBuffer: boolean;
	use_logdepth_ext: boolean;
	depthMode: number;
	src: number;
	dst: number;
}


interface IAttrib {
	loc: number;
	name: string;
	buffer: VertexBuffer3D;
	texture: Texture;
	enabled: boolean;
	locused: boolean
	preusetime: number;
}

export class Context3D {
	//todo:enableErrorChecking https://www.khronos.org/webgl/wiki/Debugging
	recyleObj: RecycleObjType;
	bufferLink: Link;
	triangles: number;
	dc: number;
	logarithmicDepthBuffer: boolean = true;
	use_logdepth_ext: boolean = false;
	// change:number;

	webglParamsInfo = webGLSimpleReport();

	setting: IContext3DSetting;


	_clearBit: number;
	render_setting: IContext3DSetting;

	createEmptyContext3DSetting() {
		let setting = {} as IContext3DSetting;
		setting.cull = WebGLConst.NONE;
		setting.depth = true;
		setting.depthMode = WebGLConst.LEQUAL;
		setting.src = WebGLConst.SRC_ALPHA;
		setting.dst = WebGLConst.ONE_MINUS_SRC_ALPHA;
		return setting;
	}

	constructor() {
		this.bufferLink = new Link();
		this.bufferLink.warningMax = 3000;
		// this.bufferLink.checkSameData = false;
		// this.change = 0;
		// ROOT.on(EngineEvent.FPS_CHANGE,this.gc,this)
	}

	backBufferWidth: number;
	backBufferHeight: number;
	antiAlias: number;
	texIndex: number = 0;
	configureBackBuffer(width: number, height: number, antiAlias: number = 0, enableDepthAndStencil: boolean = true): void {


		console.log("configureBackBuffer:" + width + "  " + height);

		let g = gl;
		g.canvas.width = width;
		g.canvas.height = height;

		this.backBufferWidth = width;
		this.backBufferHeight = height;
		g.viewport(0, 0, width, height);

		this._clearBit = WebGLConst.COLOR_BUFFER_BIT | WebGLConst.DEPTH_BUFFER_BIT | WebGLConst.STENCIL_BUFFER_BIT;

		g.disable(WebGLConst.DEPTH_TEST);
		g.disable(WebGLConst.CULL_FACE);
		// this._clearBit = 
		g.enable(WebGLConst.BLEND);
		g.colorMask(true, true, true, true);

		this.setting = this.createEmptyContext3DSetting();
		this.render_setting = {} as IContext3DSetting;

		// g.activeTexture(WebGLConst.TEXTURE0);
		// g.activeTexture(WebGLConst.TEXTURE1);
		// g.frontFace(WebGLConst.CW);
		// g.enable(WebGLConst.BLEND);
	}


	lossScissor(rect: Size) {
		let current = scissorRect;
		let g = gl;
		if (current && !rect) {
			g.disable(WebGLConst.SCISSOR_TEST);
		}
		scissorRect = rect;
		if (rect) {
			let { y, h } = rect;
			y = Math.max(this.backBufferHeight - y - h, 0);
			gl.scissor(rect.x, y, rect.w, h);
		}
	}




	setScissor(rect: Size, sceneX: number, sceneY: number) {

		let current = scissorRect;

		let temp_rect = TEMP_RECT;

		let x: number;
		let y: number;
		let w: number;
		let h: number;

		if (!rect) {
			if (current) {
				let g = gl;
				g.disable(WebGLConst.SCISSOR_TEST);
			}
		} else {

			x = rect.x;
			y = rect.y;
			w = rect.w;
			h = rect.h;

			let v = TEMP_VECTOR3D;
			v.x = sceneX - x;		//todo  这里应该是加号（+）才对
			v.y = sceneY - y;		//todo  这里应该是加号（+）才对
			v.z = 0;
			v.w = 1;
			contextMatrix2D.m3_transformVector(v, v);
			x = v.x;
			y = v.y;

			v.x = sceneX - rect.x + w;		//todo  这里应该是加号（+）才对
			v.y = sceneY - rect.y + h;		//todo  这里应该是加号（+）才对
			contextMatrix2D.m3_transformVector(v, v);
			w = v.x - x;
			h = v.y - y;

			if (!current) {
				let g = gl;
				g.enable(WebGLConst.SCISSOR_TEST);
				temp_rect.x = x;
				temp_rect.y = y;
				temp_rect.w = w;
				temp_rect.h = h;

			} else {
				temp_rect.x = x;
				temp_rect.y = y;
				temp_rect.w = w;
				temp_rect.h = h;
				size_intersection(current, temp_rect, temp_rect);
				x = temp_rect.x;
				y = temp_rect.y;
				w = temp_rect.w;
				h = temp_rect.h;
			}

			scissorRect = { x, y, w, h };


		}

		y = Math.max(this.backBufferHeight - y - h, 0);
		gl.scissor(x, y, w, h);

		if (current) {
			return { x: current.x, y: current.y, w: current.w, h: current.h };
		} else {
			return undefined;
		}


	}



	clear(red: number = 0.0, green: number = 0.0, blue: number = 0.0, alpha: number = 1.0, depth: number = 1.0, stencil: number /*uint*/ = 0, mask: number /* uint */ = 0xffffffff): void {
		let g = gl;
		// g.clearColor(red, green, blue, alpha);
		// g.clearDepth(depth); // TODO:dont need to call this every time
		// g.clearStencil(stencil); //stencil buffer
		g.clear(this._clearBit);
	}


	updateSetting(render_setting: IContext3DSetting) {
		let g = gl;
		const { cull, depth, depthMode, src, dst } = this.setting;


		//剔除这个 暂时不用
		if (cull != render_setting.cull) {
			if (cull == 0) {
				g.disable(WebGLConst.CULL_FACE);
			} else {
				g.enable(WebGLConst.CULL_FACE);
				g.cullFace(cull);
			}
			render_setting.cull = cull;
		}


		if (depth != render_setting.depth || depthMode != render_setting.depthMode) {
			// depthMode:
			// WebGLConst.NEVER（永不通过）
			// WebGLConst.LESS（如果传入值小于深度缓冲值，则通过）
			// WebGLConst.EQUAL（如果传入值等于深度缓冲区值，则通过）
			// WebGLConst.LEQUAL（如果传入值小于或等于深度缓冲区值，则通过）
			// WebGLConst.GREATER（如果传入值大于深度缓冲区值，则通过）
			// WebGLConst.NOTEQUAL（如果传入的值不等于深度缓冲区值，则通过）
			// WebGLConst.GEQUAL（如果传入值大于或等于深度缓冲区值，则通过）
			// WebGLConst.ALWAYS（总是通过）
			render_setting.depth = depth;
			render_setting.depthMode = depthMode;
			if (depth == false && render_setting.depthMode == WebGLConst.ALWAYS) {
				g.disable(WebGLConst.DEPTH_TEST);
				g.depthMask(depth);
				g.depthFunc(depthMode);
			} else {
				g.enable(WebGLConst.DEPTH_TEST);
				g.depthMask(depth);
				g.depthFunc(depthMode);
			}
		}

		if (src != render_setting.src || dst != render_setting.dst) {
			render_setting.src = src;
			render_setting.dst = dst;
			g.blendFunc(src, dst);
		}
	}



	createVertexBuffer(data: number[] | Float32Array | VertexInfo, data32PerVertex: number = -1, startVertex: number = 0, numVertices: number = -1, CLS?: { new(): VertexBuffer3D }) {
		if (!CLS) {
			CLS = VertexBuffer3D;
		}
		let buffer = recyclable(CLS);
		if (data instanceof VertexInfo) {
			buffer.data32PerVertex = data.data32PerVertex;
		} else {
			if (data32PerVertex == -1) {
				console.log("mast set data32PerVertex")
				return null;
			}
			buffer.data32PerVertex = data32PerVertex;
		}
		buffer.uploadFromVector(data, startVertex, numVertices);
		return buffer;
	}

	// private indexs: { [key: number]: IndexBuffer3D };
	indexByte: IndexBuffer3D;

	getIndexByQuad(): IndexBuffer3D {

		// if (undefined == this.indexs) {
		// 	this.indexs = {};
		// }
		// let buffer = this.indexs[quadCount];
		// let length = quadCount * 6;
		// if (undefined == buffer) {

		// let array = new Uint16Array(length)

		if (undefined == this.indexByte) {
			let count = 10000;
			let byte = new Uint16Array(count * 6);
			count *= 4;
			let j = 0;
			for (var i: number = 0; i < count; i += 4) {
				byte[j++] = i;
				byte[j++] = i + 1;
				byte[j++] = i + 3;
				byte[j++] = i + 1;
				byte[j++] = i + 2;
				byte[j++] = i + 3;
			}
			this.indexByte = this.createIndexBuffer(byte);
		}

		return this.indexByte;
		// array.set(this.indexByte.slice(0, length));
		// this.indexs[quadCount] = buffer = this.createIndexBuffer(array);
		// }
		// return buffer;
	}

	createIndexBuffer(data: number[] | Uint16Array | ArrayBuffer): IndexBuffer3D {
		let buffer = recyclable(IndexBuffer3D);
		if (data instanceof ArrayBuffer) {
			buffer.uploadFromVector(new Uint16Array(data));
		} else {
			buffer.uploadFromVector(data);
		}
		return buffer
	}

	defauleMag: number = WebGLConst.NEAREST

	getTextureData(url: string, mipmap?: boolean, mag?: number, min?: number, repeat?: number, y?: boolean) {
		let { defauleMag } = this;
		let data = {} as ITextureData;
		data.url = url;
		data.mipmap = undefined != mipmap ? mipmap : false;
		data.mag = undefined != mag ? mag : defauleMag;
		data.min = undefined != min ? min : defauleMag;
		data.wrapT = data.wrapS = undefined != repeat ? repeat : WebGLConst.CLAMP_TO_EDGE;
		data.key = `${url}_${mag}_${min}_${data.wrapS}_${data.wrapT}`
		return data;
	}



	textureObj: { [key: string]: Texture } = {};

	refreshTextureObj(url: string) {
		foreach(this.textureObj, v => {
			if (v.data.url == name) {
				v.readly = false;
			}
			return true;
		})
	}

	createTexture(key: ITextureData, pixels?: ImageBitmap | ImageData | HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | BitmapData): Texture {
		let texture = recyclable(Texture);
		texture.key = key.key ? key.key : (key.key = `${key.url}_${key.mag}_${key.min}_${key.wrapS}_${key.wrapT}`);
		texture.data = key;
		texture.pixels = pixels;

		if (pixels) {
			texture.width = pixels.width;
			texture.height = pixels.height;
		}

		this.textureObj[key.key] = texture;
		return texture;
	}

	createEmptyTexture(key: ITextureData, width: number, height: number): Texture {
		let texture = recyclable(Texture);
		texture.key = key.key ? key.key : (key.key = `${key.url}_${key.mag}_${key.min}_${key.wrapS}_${key.wrapT}`);
		texture.data = key;
		texture.width = width;
		texture.height = height;
		this.textureObj[key.key] = texture;
		return texture;
	}


	createRttTexture(key: ITextureData, width: number, height: number): RTTexture {
		let texture = new RTTexture();
		texture.key = key.key ? key.key : (key.key = `${key.url}_${key.mag}_${key.min}_${key.wrapS}_${key.wrapT}`);
		texture.data = key;
		texture.width = width;
		texture.height = height;
		this.textureObj[key.key] = texture;
		return texture;
	}

	createCubeTexture(key: ITextureData): CubeTexture {
		let texture = new CubeTexture();
		texture.key = key.key ? key.key : (key.key = `${key.url}_${key.mag}_${key.min}_${key.wrapS}_${key.wrapT}`);
		texture.data = key;
		// texture.width = width;
		// texture.height = height;
		this.textureObj[key.key] = texture;
		return texture;
	}



	rttTextures: RTTexture[] = [];

	setRenderToTexture(texture: RTTexture, enableDepthAndStencil: boolean = true, antiAlias: number = 0, surfaceSelector: number /*int*/ = 0, colorOutputIndex: number /*int*/ = 0) {
		let g = gl;

		this.rttTextures.push(texture);

		if (!texture.readly) {
			if (false == texture.awaken()) {
				return;
			}
		}

		let { frameBuffer, renderBuffer, texture: textureObj, width, height, cleanColor } = texture;
		g.viewport(0, 0, width, height);
		g.bindFramebuffer(WebGLConst.FRAMEBUFFER, frameBuffer);

		if (enableDepthAndStencil) {
			texture.cleanBit = WebGLConst.COLOR_BUFFER_BIT | WebGLConst.DEPTH_BUFFER_BIT | WebGLConst.STENCIL_BUFFER_BIT;
		} else {
			texture.cleanBit = WebGLConst.COLOR_BUFFER_BIT | WebGLConst.DEPTH_BUFFER_BIT | WebGLConst.STENCIL_BUFFER_BIT;
		}

		texture.setting.src = -1;

		if (cleanColor) {
			g.clearColor(cleanColor.x, cleanColor.y, cleanColor.z, cleanColor.w);
		} else {
			g.clearColor(0, 0, 0, 0);
		}

		texture.preusetime = engineNow;


		g.clear(texture.cleanBit);


	}

	setRenderToBackBuffer(): void {
		let g = gl;
		let { rttTextures, render_setting } = this;
		rttTextures.pop();

		let texture = rttTextures[rttTextures.length - 1];
		if (texture) {
			let { frameBuffer, width, height } = texture;
			g.bindFramebuffer(WebGLConst.FRAMEBUFFER, frameBuffer);
			g.viewport(0, 0, width, height);
		} else {
			let { backBufferWidth, backBufferHeight } = this;
			g.bindFramebuffer(WebGLConst.FRAMEBUFFER, null);
			g.viewport(0, 0, backBufferWidth, backBufferHeight);
		}



		render_setting.cull = 0;
		render_setting.depth = false;
		render_setting.depthMode = 0;
		render_setting.src = 0;
		render_setting.dst = 0;

	}

	programs: { [key: string]: Recyclable<Program3D> } = {};

	createProgram(vertexCode: string, fragmentCode: string, key?: string): Recyclable<Program3D> {
		var program: Recyclable<Program3D>
		if (undefined != key) {
			program = this.programs[key];
			if (undefined == program) {
				this.programs[key] = program = recyclable(Program3D);
			}
		} else {
			program = recyclable(Program3D);
		}
		program.vertexCode = vertexCode;
		program.fragmentCode = fragmentCode;
		return program;
	}



	cProgram: Program3D;
	setProgram(program: Program3D) {
		if (!program) return

		program.preusetime = engineNow;

		if (false == program.readly) {
			if (false == program.awaken()) {
				console.log("program create error!");
				return -1;
			}
		} else {
			if (program == this.cProgram) return 1;
		}

		this.cProgram = program;
		gl.useProgram(program.program);
		return 0;
	}



	currentIndexBuffer: IndexBuffer3D;

	drawTriangles(indexBuffer: IndexBuffer3D, numTriangles: number, setting?: IContext3DSetting, offset = 0): void {
		let g = gl;
		this.updateSetting(setting || this.render_setting);
		if (undefined != indexBuffer) {
			if (false == indexBuffer.readly) {
				if (false == indexBuffer.awaken()) {
					throw new Error("create indexBuffer error!");
				}
				this.currentIndexBuffer = undefined
			}
			indexBuffer.preusetime = engineNow;

			if (this.currentIndexBuffer != indexBuffer) {
				g.bindBuffer(WebGLConst.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
				this.currentIndexBuffer = indexBuffer;
			}
			// g.drawArrays(WebGLConst.TRIANGLES,0,numTriangles)
			g.drawElements(WebGLConst.TRIANGLES, numTriangles * 3, WebGLConst.UNSIGNED_SHORT, offset * 6);
		} else {
			g.drawArrays(WebGLConst.TRIANGLES, 0, numTriangles * 3);
		}

		this.triangles += numTriangles;
		this.dc++;

		// while(this.texIndex > 1){
		// 	this.texIndex -- ;
		// 	gl.texture
		// }
		// g.activeTexture(WebGLConst.TEXTURE0);

		this.texIndex = 0;
	}



	gc(now: number) {
		let link = this.bufferLink;
		let vo = link.getFrist();
		var hasChange = false
		while (vo) {
			if (false == vo.close) {
				let buffer: Recyclable<Buffer3D> = vo.data;
				if (now - buffer.preusetime > buffer.gctime) {
					buffer.recycle();
					vo.close = true;
					hasChange = true;
				}
			}
			vo = vo.next;
		}
		if (hasChange) link.clean();
	}


	toString(): string {
		let link = this.bufferLink;
		let vo = link.getFrist();
		let v = 0, t = 0, p = 0, i = 0;
		while (vo) {
			if (false == vo.close) {
				let buffer: Recyclable<Buffer3D> = vo.data;
				if (buffer instanceof VertexBuffer3D) {
					v++;
				} else if (buffer instanceof IndexBuffer3D) {
					i++;
				} else if (buffer instanceof Texture) {
					t++;
				} else if (buffer instanceof Program3D) {
					p++;
				}
			}
			vo = vo.next;
		}
		return `p:${p} i:${i} v:${v} t:${t}`;
	}






	private attribs: { [key: number]: IAttrib } = {};
	private textures: { [key: number]: IAttrib } = {};

	// @RecyclePro(undefined)
	currentBuffer: VertexBuffer3D;

	updateVertexAttribPointer(info: IWebglActiveInfo, buffer: VertexBuffer3D, variable: IVariable, data32PerVertex: number) {

		let g = gl;

		let { attribs, currentBuffer } = this;

		if (currentBuffer != buffer || !buffer.readly) {
			this.currentBuffer = buffer;
			if (!buffer.readly) {
				buffer.awaken();
			} else {
				g.bindBuffer(WebGLConst.ARRAY_BUFFER, buffer.buffer);
			}
		}



		let { name, loc } = info;

		let attrib = attribs[loc];
		if (!attrib) {
			attribs[loc] = attrib = { name, loc, buffer, enabled: false } as IAttrib;
		}

		if (attrib.buffer != buffer) {
			attrib.buffer = buffer;
			attrib.name = name;
			attrib.enabled = false;
		}

		if (!attrib.enabled) {
			g.vertexAttribPointer(loc, variable.size, WebGLConst.FLOAT, false, data32PerVertex * 4, variable.offset * 4);
			attrib.enabled = true;
			if (!attrib.locused) {
				g.enableVertexAttribArray(loc);
				attrib.locused = true;
			}
		}

	}


	uniform1f(loc: WebGLUniformLocation, data: number) {
		gl.uniform1f(loc, data);
	}

	uniform2f(loc: WebGLUniformLocation, data: Float32Array) {
		gl.uniform2f(loc, data[0], data[1]);
	}

	uniform3f(loc: WebGLUniformLocation, data: Float32Array) {
		gl.uniform3f(loc, data[0], data[1], data[2]);
	}

	// uniform4f(loc:WebGLUniformLocation, data: Float32Array) {
	// 	gl.uniform4fv(loc, data);
	// }

	/*
	*	
	*/
	updateUniformData(info: IWebglActiveInfo, data: any) {
		let { module } = info;
		let f = this[module];
		if (!f) {
			gl[module](info.loc, data);
		} else {
			f(info.loc, data);
		}

	}


	/**
	 * 
	 * @param info 
	 * @param data 
	 */
	updateUniformMatrixData(info: IWebglActiveInfo, data: IMatrix3D) {
		gl.uniformMatrix4fv(info.loc, false, data as Float32Array);
	}


	updateTextureData(info: IWebglActiveInfo, data: ITextureData) {

		let { url, key } = data;
		let texture = this.textureObj[key];
		if (!texture) {
			let source = bitmapSources[url];
			this.textureObj[key] = texture = this.createTexture(data, source.bmd);
		}

		if (!texture.readly) {
			texture.awaken();
		}

		let { textures, webglParamsInfo } = this;

		let att: IAttrib;

		for (let index = 0; index < webglParamsInfo.texture; index++) {
			let element = textures[index];
			if (!element) {
				textures[index] = att = element = { loc: index, texture, preusetime: 0, enabled: true } as IAttrib
				break;
			} else {
				if (element.texture == texture) {
					att = element;
					break;
				}
			}
		}

		if (att) {
			att.texture = texture;
			att.enabled = true;
			att.preusetime = engineNow;
			let g = gl;
			g.activeTexture(g["TEXTURE" + att.loc]);
			g.uniform1i(info.loc, att.loc);
			g.bindTexture(g.TEXTURE_2D, texture.texture);
		}





	}

}

/**
 * todo
 */
export function webGLSimpleReport() {
	//http://webglreport.com/

	// Vertex Shader
	// Max Vertex Attributes:
	// Max Vertex Uniform Vectors:
	// Max Vertex Texture Image Units:
	// Max Varying Vectors:

	let g = gl;

	let o = {} as IWebglParameterInfo

	o.attribute = g.getParameter(WebGLConst.MAX_VERTEX_ATTRIBS);
	o.vertuniform = g.getParameter(WebGLConst.MAX_VERTEX_UNIFORM_VECTORS);
	o.fraguniform = g.getParameter(WebGLConst.MAX_FRAGMENT_UNIFORM_VECTORS);
	o.texture = g.getParameter(WebGLConst.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
	var high = g.getShaderPrecisionFormat(WebGLConst.FRAGMENT_SHADER, WebGLConst.HIGH_FLOAT);
	o.precision = (high.precision !== 0) ? 'highp' : 'mediump'

	// Fragment Shader
	// Max Fragment Uniform Vectors:
	// Max Texture Image Units:
	// float/int precision:highp/highp



	return o;
}







