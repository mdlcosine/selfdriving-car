import {Controls} from "./Controls";
import {Coordinate} from "./Coordinate";
import {Sensor} from "./Sensor";
import {polysIntersect} from "./utils";
import {NeuralNetwork} from "./network";

export class Car {

    coordinate: Coordinate

    private width: number;
    private height: number;

    private speed = 0
    private acceleration = 0.2
    private maxSpeed
    private friction = 0.07

    polygon: Coordinate[] = []

    private damaged = false

    angle = 0


    controls: Controls
    private sensor?: Sensor;
    brain?: NeuralNetwork;
    private useBrain: boolean;

    constructor(coordinate: Coordinate, width: number, height: number, controlType: string, maxSpeed: number = 3) {
        this.coordinate = coordinate
        this.width = width;
        this.height = height;
        this.maxSpeed = maxSpeed

        this.useBrain = controlType==="AI"

        if (controlType !== "DUMMY") {
            this.sensor = new Sensor(this)
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 4]
            )
        }

        this.controls = new Controls(controlType)
    }

    update(roadBoarders: Coordinate[][], traffic: Car[]) {
        if (!this.damaged) {
            this.move();
            this.polygon = this.createPolygon()
            this.damaged = this.assessDamage(roadBoarders, traffic)
        }

        if (this.sensor && this.brain) {
            this.sensor.update(roadBoarders, traffic)
            const offsets = this.sensor.readings.map(
                s => s ?  1 - s.offset : 0
            )

            const outputs = NeuralNetwork.feedForward(offsets, this.brain)
            if(this.useBrain){
                this.controls.forward = outputs[0]
                this.controls.left = outputs[1]
                this.controls.right = outputs[2]
                this.controls.reverse = outputs[3]
            }
        }

    }

    assessDamage(roadBoarders: Coordinate[][], traffic: Car[]) {
        for (const border of roadBoarders) {
            if (polysIntersect(this.polygon, border)) {
                return true
            }
        }

        for (const car of traffic) {
            if (polysIntersect(this.polygon, car.polygon)) {
                return true
            }
        }

        return false
    }

    createPolygon() {
        const points: Coordinate[] = [];
        const radius = Math.hypot(this.width, this.height) / 2
        const alpha = Math.atan2(this.width, this.height)

        points.push(
            //topRight
            {
                x: this.coordinate.x - Math.sin(this.angle - alpha) * radius,
                y: this.coordinate.y - Math.cos(this.angle - alpha) * radius
            },
            //topLeft
            {
                x: this.coordinate.x - Math.sin(this.angle + alpha) * radius,
                y: this.coordinate.y - Math.cos(this.angle + alpha) * radius
            },
            //bottomLeft
            {
                x: this.coordinate.x - Math.sin(Math.PI + this.angle - alpha) * radius,
                y: this.coordinate.y - Math.cos(Math.PI + this.angle - alpha) * radius
            },
            //bottomRight
            {
                x: this.coordinate.x - Math.sin(Math.PI + this.angle + alpha) * radius,
                y: this.coordinate.y - Math.cos(Math.PI + this.angle + alpha) * radius
            },
        )
        return points
    }

    private move() {
        if (this.controls.forward) {
            this.speed += this.acceleration
        }

        if (this.controls.reverse) {
            this.speed -= this.acceleration
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed
        }

        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2
        }

        if (this.speed > 0) {
            this.speed -= this.friction
        }

        if (this.speed < 0) {
            this.speed += this.friction
        }

        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0
        }


        if (this.speed !== 0) {
            const flip = this.speed > 0 ? 1 : -1
            if (this.controls.left) {
                this.angle += 0.03 * flip
            }

            if (this.controls.right) {
                this.angle -= 0.03 * flip
            }
        }


        this.coordinate.x -= Math.sin(this.angle) * this.speed
        this.coordinate.y -= Math.cos(this.angle) * this.speed
    }

    draw(ctx: CanvasRenderingContext2D, color: string, drawSensor:boolean = false) {
        if (this.damaged) {
            ctx.fillStyle = "darkGrey"
        } else {
            ctx.fillStyle = color
        }
        ctx.beginPath()
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y)

        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
        }
        ctx.fill()

        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx)
        }
    }

}
