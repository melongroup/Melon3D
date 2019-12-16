import { Graphics } from "../../../display/Graphics.js";
import { Recyclable, recyclable } from "../../../../melon_runtime/ClassUtils.js";
import { Temp_Float32Byte } from "../../../display/stage3D/Geometry.js";
import { Sprite } from "../../../display/Sprite.js";


export class Line3DPoint {
    x: number = 0;
    y: number = 0;
    z: number = 0;
    r: number = 1;
    g: number = 1;
    b: number = 1;
    a: number = 1;
    t: number = 1;

    clear() {
        this.x = this.y = this.z = 0;
        this.r = this.g = this.b = this.a = this.t = 1;
    }

    clone(): Line3DPoint {
        let vo = new Line3DPoint();
        vo.x = this.x;
        vo.y = this.y;
        vo.z = this.z;
        vo.r = this.r;
        vo.g = this.g;
        vo.b = this.b;
        vo.a = this.a;
        vo.t = this.t;
        return vo;
    }


    toRGB(color: number) {
        this.r = ((color & 0x00ff0000) >>> 16) / 0xFF;
        this.g = ((color & 0x0000ff00) >>> 8) / 0xFF;
        this.b = (color & 0x000000ff) / 0xFF;
    }
}

export class LineGraphics extends Graphics {

    origin: Recyclable<Line3DPoint>;
    tempVertex: Recyclable<Temp_Float32Byte>;
    points: Line3DPoint[] = [];

    data32PerVertex: number;



    constructor(target: Sprite) {
        super(target);
        this.data32PerVertex = this.geometry.data32PerVertex;
    }


    clear() {
        let tempVertex = this.tempVertex
        if (undefined == tempVertex) {
            this.tempVertex = tempVertex = recyclable(Temp_Float32Byte);
        }

        tempVertex.data32PerVertex = this.data32PerVertex;
        tempVertex.numVertices = 0;

        let origin = this.origin;
        if (undefined == origin) {
            this.origin = origin = recyclable(Line3DPoint);
        }
    }



    moveTo(x: number, y: number, z: number, thickness: number = 1, color: number = 0xFFFFFF, alpha: number = 1) {
        const { origin, points } = this;
        if (points.length) {
            this.build();
        }

        origin.x = x;
        origin.y = y;
        origin.z = z;

        origin.t = thickness;
        origin.toRGB(color);
        origin.a = alpha;

        points.push(origin.clone());
    }

    lineTo(x: number, y: number, z: number, thickness: number = 1, color: number = 0xFFFFFF, alpha: number = 1) {
        const { origin: vo, points } = this;
        vo.x = x;
        vo.y = y;
        vo.z = z;
        vo.a = alpha;
        vo.t = thickness;
        vo.toRGB(color);
        points.push(vo.clone());
    }

    private build() {
        const { points, tempVertex } = this;
        let j = 0;
        let m = points.length - 1;
        for (j = 0; j < m; j++) {
            let p1 = points[j];
            let p2 = points[j + 1];
            tempVertex.set([p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, -p1.t * 0.5, p1.r, p1.g, p1.b, p1.a]);
            tempVertex.set([p2.x, p2.y, p2.z, p1.x, p1.y, p1.z, p2.t * 0.5, p2.r, p2.g, p2.b, p2.a]);
            tempVertex.set([p2.x, p2.y, p2.z, p1.x, p1.y, p1.z, -p2.t * 0.5, p2.r, p2.g, p2.b, p2.a]);
            tempVertex.set([p1.x, p1.y, p1.z, p2.x, p2.y, p2.z, p1.t * 0.5, p1.r, p1.g, p1.b, p1.a]);
            tempVertex.numVertices += 4;
        }
        points.length = 0;
    }

    end() {
        const { origin, points, tempVertex, geometry } = this;
        if (points.length) {
            this.build();
        }

        let vertex = tempVertex.toArray();


        let numVertices = vertex.length / geometry.data32PerVertex;

        geometry.vertex = vertex;
        geometry.numVertices = numVertices;

        tempVertex.recycle();
        origin.recycle();
        this.tempVertex = this.origin = undefined;

    }
}
