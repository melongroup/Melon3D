import { Material } from "../../../display/stage3D/Material.js";

export class LineMaterial extends Material{


    vertexCode = `

    attribute vec3 posX;
    attribute vec3 posY;
    attribute float len;
    attribute vec4 color;

    uniform mat4 mv;
    uniform mat4 p;
    varying vec4 vColor;
    uniform float originFar;

    void main(void){
        vec4 pos = mv * vec4(posX,1.0); 
        vec4 t = pos - mv * vec4(posY,1.0);
        vec3 v = cross(t.xyz,vec3(0,0,1));
        v = normalize(v);
        float t2 = pos.z / originFar;
        if(t2 == 0.0){
            v.xyz *= len;
        }else{
            v.xyz *= len * t2;
        }
        // v.xyz *= len * t2;
        // pos.xyz += v.xyz;
        pos.xy += v.xy;
        pos = p * pos;
        
        gl_Position = pos;
        
        vColor = color;
    }
    
    `

    fargmentCode = `
   
    precision mediump float;
    varying vec4 vColor;
    void main(void){
        gl_FragColor = vColor;
        // gl_FragColor = vec4(1.0);
    }

    `

    constructor(){
        super();
        
    }
}