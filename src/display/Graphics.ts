import { Sprite } from "./Sprite.js";
import { empty_number_object, geometry_addpoint } from "./stage3D/Geometry.js";

export class Graphics {

    target: Sprite;
    geometry: IGeometry;

    constructor(target:Sprite){
        this.target = target;
        this.geometry = {numVertices:0,variables:target.variables} as IGeometry;
    }


    drawRect(x: number, y: number, width: number, height: number, color: number, alpha = 1,z = 0) {
        let{geometry,target} = this;
        let{variables,source,batchSetting} = target;
        let data32PerVertex = variables["data32PerVertex"].size;
        const [originU,originV] = source.origin;
        const rgba = [
            ((color & 0x00ff0000) >>> 16) / 0xFF,
            ((color & 0x0000ff00) >>> 8) / 0xFF,
            (color & 0x000000ff) / 0xFF,
            alpha
        ]
        const uv = [originU,originV,~~batchSetting.vc,~~batchSetting.source];
        // const noraml = [0,0,1]

        // let geometry = newGraphicsGeometry();
        // this.grometrys.push(geometry);

        let r = x + width;
        let b = y + height;



        // let f = m2dTransform;
        let p = [0,0,0];

        let points = [x,y,r,y,r,b,x,b];
        for(let i=0;i<8;i+=2){
            p[0] = points[i];
            p[1] = points[i+1];
            p[2] = z;
        //     if(undefined != matrix){
        //         f(matrix,p,p);
        //     }
            geometry_addpoint(geometry,empty_number_object);
            // this.addPoint(geometry,p,noraml,uv,rgba,locksize);
        }

        // geometry.base = createGeometry(empty_float32_object,variables,geometry.numVertices);
        // this.numVertices += geometry.numVertices;
        // return geometry;
    }


    clear(){
        let{geometry} = this;
        geometry.preNumVertices = geometry.numVertices;
        geometry.numVertices = 0;
    }



    end(){
        
    }



}