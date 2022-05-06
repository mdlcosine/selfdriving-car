import {Car} from "./Car";
import {getIntersection, lerp} from "./utils";
import {Coordinate} from "./Coordinate";

type myType = Coordinate & { offset: number }

export class Sensor {
    private car: Car;
    rayCount: number;
    private rayLength: number;
    private raySpread: number;

    private rays: Coordinate[][] = []

    readings: (myType | null | undefined) [] = []

    constructor(car: Car) {
        this.car = car
        this.rayCount = 5
        this.rayLength = 200
        this.raySpread = Math.PI / 2

        this.rays = []
        this.readings = []
    }

    update(roadBoarders: Coordinate[][], traffic: Car[]) {
        this.castRays();

        this.readings = []
        this.rays.forEach(item => {
            this.readings.push(
                this.getReading(
                    item,
                    roadBoarders,
                    traffic)
            )
        });
    }

    private getReading(ray: Coordinate[], roadBoarders: Coordinate[][], traffic:Car[]) {
        let touches = []

        for (const border of roadBoarders) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                border[0],
                border[1]
            )
            if (touch) {
                touches.push(touch)
            }
        }

        for(const car of traffic) {
            const poly = car.polygon

            for(let j = 0; j<poly.length;j++){
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length])
                if(value){
                    touches.push(value)
                }
            }
        }

        if (touches.length === 0) {
            return null
        } else {
            const offsets = touches.map(e => e.offset)
            const minOffset = Math.min(...offsets)
            return touches.find(e => e.offset === minOffset)
        }
    }

    private castRays() {
        this.rays = []
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.car.angle

            const {x: carX, y: carY} = this.car.coordinate

            const start: Coordinate = {x: carX, y: carY}
            const end: Coordinate = {
                x: carX - Math.sin(rayAngle) * this.rayLength,
                y: carY - Math.cos(rayAngle) * this.rayLength,
            }

            this.rays.push([start, end])
        }
    }

    draw(ctx: CanvasRenderingContext2D) {

        ctx.lineWidth = 2

        for (let i = 0; i < this.rayCount; i++) {
            let end: Coordinate = this.rays[i][1]
            if (this.readings[i]) {
                end = {
                    x: this.readings[i]!.x,
                    y: this.readings[i]!.y
                }
            }

            ctx.strokeStyle = "yellow"
            ctx.beginPath()
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            )
            ctx.lineTo(
                end.x,
                end.y
            )
            ctx.stroke()


            ctx.beginPath()
            ctx.strokeStyle = "black"
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            )
            ctx.lineTo(
                end.x,
                end.y
            )
            ctx.stroke()
        }

    }
}
