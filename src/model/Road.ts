import {lerp} from "./utils";
import {Coordinate} from "./Coordinate";

export class Road {
    private x: number;
    private width: number;
    private laneCount: number;
    private left: number;
    private right: number;
    private top: number;
    private bottom: number;
     borders: Coordinate[][];

    constructor(x: number, width: number, laneCount: number = 3) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        this.left = x - width / 2
        this.right = x + width / 2

        const infinity = 100000
        this.top = -infinity
        this.bottom = infinity

        const topLeft: Coordinate = {x: this.left, y: this.top}
        const topRight: Coordinate = {x: this.right, y: this.top}
        const bottomLeft: Coordinate = {x: this.left, y: this.bottom}
        const bottomRight: Coordinate = {x: this.right, y: this.bottom}
        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight],
        ]

    }

    getLaneCenter(laneIndex: number) {
        const laneWidth = this.width / this.laneCount
        return this.left + laneWidth / 2 + Math.min(laneIndex, this.laneCount - 1) * laneWidth
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = 5
        ctx.strokeStyle = "white"

        ctx.setLineDash([20, 20])
        for (let lane = 0; lane <= this.laneCount; lane++) {
            const x = lerp(
                this.left,
                this.right,
                lane / this.laneCount
            )

            ctx.beginPath()
            ctx.moveTo(x, this.top)
            ctx.lineTo(x, this.bottom)
            ctx.stroke()

        }


        ctx.setLineDash([])
        this.borders.forEach(border => {
            ctx.beginPath()
            ctx.moveTo(border[0].x, border[0].y)
            ctx.lineTo(border[1].x, border[1].y)
            ctx.stroke()
        })

    }
}
