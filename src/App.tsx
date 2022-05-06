import React from 'react';
import './App.css';
import {Car} from "./model/Car";
import {Road} from "./model/Road";
import {Visualizer} from "./model/Visualizer";

class App extends React.Component<any, any> {

    private carCanvasWidth = 250
    private networkCanvasWidth = 300

    carCtx: CanvasRenderingContext2D | undefined | null
    networkCtx: CanvasRenderingContext2D | undefined | null
    road: Road = new Road(this.carCanvasWidth / 2, this.carCanvasWidth * 0.9)

    cars: Car[] = this.generateCars(100)
    bestCar = this.cars[0]

    traffic: Car[] = [
        new Car({x: this.road.getLaneCenter(1), y: -100}, 30, 50, "DUMMY", 2),
        new Car({x: this.road.getLaneCenter(0), y: -300}, 30, 50, "DUMMY", 2),
        new Car({x: this.road.getLaneCenter(2), y: -300}, 30, 50, "DUMMY", 2),
    ]

    init() {
        const carCanvas = document.getElementById("carCanvas") as HTMLCanvasElement
        this.carCtx = carCanvas.getContext('2d')

        const networkCanvas = document.getElementById("networkCanvas") as HTMLCanvasElement
        this.networkCtx = networkCanvas.getContext('2d')

        let storedCar = localStorage.getItem("bestBrain");
        if(storedCar){
            this.bestCar.brain = JSON.parse(storedCar)
        }
    }

    resizeCanvas() {
        const carCanvas = this.carCtx!.canvas
        carCanvas.height = window.innerHeight;
        carCanvas.width = this.carCanvasWidth;

        const networkCanvas = this.networkCtx!.canvas
        networkCanvas.height = window.innerHeight;
        networkCanvas.width = this.networkCanvasWidth;
    }

    generateCars(wanted: number) {
        const cars: Car[] = []
        for (let i = 1; i < wanted; i++) {
            cars.push(new Car({x: this.road.getLaneCenter(1), y: 100}, 30, 50, "AI"))
        }

        return cars
    }

    save(){
        localStorage.setItem("bestBrain", JSON.stringify(this.bestCar.brain))
    }

    discard(){
        localStorage.removeItem("bestBrain")
    }

    animate(time: number) {
        for (const car of this.traffic) {
            car.update(this.road.borders, [])
        }

        this.resizeCanvas();
        for (const element of this.cars) {
            element.update(this.road.borders, this.traffic)
        }

        const bestCar = this.cars.find(
            car=>car.coordinate.y === Math.min(
                ...this.cars.map(c=>c.coordinate.y)
            )
        )


        this.carCtx?.save()
        this.carCtx?.translate(0, -bestCar!.coordinate.y + this.carCtx?.canvas.height * .7)
        this.road.draw(this.carCtx!)

        for (const element of this.traffic) {
            element.draw(this.carCtx!, "red")
        }

        this.carCtx!.globalAlpha = 0.2
        for (const car of this.cars) {
            car.draw(this.carCtx!, "blue")
        }
        this.carCtx!.globalAlpha = 1

        bestCar!.draw(this.carCtx!, "blue", true)


        this.carCtx?.restore()

        this.networkCtx!.lineDashOffset = -time / 50
        Visualizer.drawNetwork(this.networkCtx!, bestCar!.brain!)
        requestAnimationFrame(this.animate.bind(this))
    }

    componentDidMount() {
        this.init()
        this.animate(1)

    }

    render() {
        return (
            <div id="wrapper">
                <canvas id="carCanvas"/>
                <div id="verticalButtons">
                    <button onClick={()=>this.save()}>S</button>
                    <button onClick={()=>this.discard()}>D</button>
                </div>
                <canvas id="networkCanvas"/>
            </div>
        );
    }
}

export default App;
