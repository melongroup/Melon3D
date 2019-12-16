import { m2dTransform } from "../core/Geom.js";
import { Sprite } from "./Sprite.js";
import { empty_number_object, geometry_addpoint, createGeometryVertex, empty_float32_object } from "./stage3D/Geometry.js";
import { IBitmapSourceVO } from "./source/BitmapSource.js";

export class Graphics {

    target: Sprite;
    geometry: IGraphicsGeometry;

    constructor(target: Sprite) {
        this.target = target;
        let { variables } = target;
        let data32PerVertex = variables["data32PerVertex"].size;
        this.geometry = { numVertices: 0, variables, data32PerVertex } as IGeometry;
    }



    drawQuad(poses: number[][], uvs?: number[][], colors = 0xFFFFFF, alpha = 1, matrix?: IMatrix) {
        let { geometry, target } = this;
        let { batchSetting } = target;

        let { uv, pos, color } = empty_number_object;
        color[0] = ((colors & 0x00ff0000) >>> 16) / 0xFF;
        color[1] = ((colors & 0x0000ff00) >>> 8) / 0xFF;
        color[2] = (colors & 0x000000ff) / 0xFF;
        color[3] = alpha;


        if (batchSetting) {
            uv[2] = ~~batchSetting.vc;
            uv[3] = ~~batchSetting.source;
        } else {
            uv[2] = 0;
            uv[3] = 0;
        }



        // empty_number_object["uv"] = [originU, originV, ~~batchSetting.vc, ~~batchSetting.source];
        // empty_number_object["color"] = rgba;

        // const uv = [originU,originV,~~batchSetting.vc,~~batchSetting.source];

        let len = ((poses.length / 4) >> 0) * 4;
        for (let i = 0; i < len; i++) {

            let p = poses[i];
            let u = uvs[i];

            if (matrix) {
                m2dTransform(matrix, p, pos);
            } else {
                pos[0] = p[0];
                pos[1] = p[1];
            }

            uv[0] = u[0];
            uv[1] = u[1];

            pos[2] = ~~p[2];
            geometry_addpoint(geometry, empty_number_object);
        }

    }







    drawRect(x: number, y: number, width: number, height: number, color: number, alpha = 1, z = 0, matrix?: IMatrix) {
        const [originU, originV] = this.target.source.origin;

        console.log("drawImg UV", originU, originV);

        let uv = [originU, originV];

        let r = x + width;
        let b = y + height;

        this.drawQuad(
            [
                [x, y, z],
                [r, y, z],
                [r, b, z],
                [x, b, z]
            ]
            ,
            [
                uv,
                uv,
                uv,
                uv
            ]
            , color, alpha, matrix
        )
    }

    drawBitmap(x: number, y: number, vo: IBitmapSourceVO, matrix?: IMatrix, z: number = 0, z2 = undefined, color: number = 0xFFFFFF, alpha: number = 1) {

        let { w, h, ul, ur, vt, vb, ix, iy, scale } = vo;

        if (z2 == undefined) {
            z2 = z;
        }

        if (scale) {
            w /= scale;
            h /= scale;
        }

        x += ix ? ix : 0;
        y += iy ? iy : 0;

        let r = x + w;
        let b = y + h

        this.drawQuad(
            [
                [x, y, z],
                [r, y, z2],
                [r, b, z2],
                [x, b, z]
            ]
            ,
            [
                [ul,vt],
                [ur,vt],
                [ur,vb],
                [ul,vb]
            ]
            , color, alpha, matrix
        )

    }


    clear() {
        let { geometry } = this;
        geometry.preNumVertices = geometry.numVertices;
        geometry.numVertices = 0;
    }



    end() {
        let { geometry } = this;

        let { numVertices, variables } = geometry;

        if (numVertices > 0) {
            geometry.vertex = createGeometryVertex(empty_float32_object, variables, numVertices);
            geometry.batched = false;
        }
    }



}