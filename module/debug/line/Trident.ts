import { Line } from "./Line.js";

export class Trident extends Line {
    constructor(len: number = 200, think: number = 2) {
        super();

        var line: number;
        if (len * 0.1 > 60) {
            line = len - 60;
        } else {
            line = len * 0.9
        }

        let g = this.graphics;

        g.clear();
        let color = 0xFF0000;
        g.moveTo(0, 0, 0, think, color);
        g.lineTo(line, 0, 0, think, color);
        g.moveTo(line, 0, 0, think * 5, color);
        g.lineTo(len, 0, 0, 0, color);

        color = 0x00FF00;
        g.moveTo(0, 0, 0, think, color);
        g.lineTo(0, line, 0, think, color);
        g.moveTo(0, line, 0, think * 5, color);
        g.lineTo(0, len, 0, 0, color);

        color = 0x0000FF;
        g.moveTo(0, 0, 0, think, color);
        g.lineTo(0, 0, line, think, color);
        g.moveTo(0, 0, line, think * 5, color);
        g.lineTo(0, 0, len, 0, color);

        g.end();

    }
}