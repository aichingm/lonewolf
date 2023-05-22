

class Animator{

    private static instance: Animator | null
    private _animationFrameRequested = false

    public static getInstance(): Animator{
        if(Animator.instance == null){
            Animator.instance = new Animator()
        }
        return Animator.instance
    }

    public static run(overtime: Overtime<unknown>) {
        if(Animator.instance == null){
            Animator.instance = new Animator()
        }
        if(!Animator.getInstance()._animationFrameRequested) {
            Animator.getInstance()._overtimes.push(overtime)
            window.requestAnimationFrame((time)=>Animator.getInstance().onRaf(time))
            Animator.getInstance()._animationFrameRequested = true
        }
    }

    public static cancel(overtime: Overtime<unknown>) {
        const index = Animator.getInstance()._overtimes.indexOf(overtime)
        if(0 <= index && index < Animator.getInstance()._overtimes.length){
            Animator.getInstance()._overtimes.splice(index, 1);
        }
    }


    private _overtimes: Overtime<unknown>[] = []

    public onRaf (time: number) {
        for (let overtimeIndex = 0; overtimeIndex <  this._overtimes.length; overtimeIndex++) {
            const overtime = this._overtimes[overtimeIndex]
            if (overtime.onRaf(time)) {
                this._overtimes.splice(overtimeIndex, 1);
                overtime.done()
            }
        }
        if (this._overtimes.length > 0) {
            window.requestAnimationFrame((time)=>Animator.getInstance().onRaf(time))
        } else {
            Animator.getInstance()._animationFrameRequested = false
        }
    }

}

type OvertimeState = "running" | "ready"


export default class Overtime<T> {


    private _duration = 0;
    private _from = 0;
    private _to = 0;
    private _tick: (value: number, progress: number, data: T|null) => boolean = (_0,_1,_2) => false;
    private _via: (progress: number) => number = (x) => x;
    private _with: T | null  = null;

    private _startTime = 0;
    private _state: OvertimeState = "ready";

    private progress = 0;

    public duration(duration: number): Overtime<T>{this._duration = duration; return this;}
    public from(from: number): Overtime<T>{this._from = from; return this;}
    public to(to: number): Overtime<T>{this._to = to; return this;}
    public via(via: (progress: number) => number): Overtime<T>{this._via = via; return this;}
    public tick(tick: (value: number, progress: number, data: T|null) => boolean): Overtime<T>{this._tick = tick; return this;}
    public with(w: T): Overtime<T>{this._with = w; return this;}


    public run (delay?: number) {
        if(this._state != "ready"){
            return
        }

        this._state = "running"
        if (delay != undefined) {
            setTimeout(()=>{
                if(this._state == "running"){ // only run if state still is running, would be better to also cancel the timeout
                    this._startTime = performance.now();
                    Animator.run(this as Overtime<unknown>)
                }
            }, delay);
            return
        }

        this._startTime = performance.now();
        Animator.run(this as Overtime<unknown>)
    }

    public cancel() {
        if (this._state == "running") {
            // TODO cancel setTimeout too
            Animator.cancel(this as Overtime<unknown>)
            this._state = "ready"
        }
    }

    public done() {
        this._state = "ready"
    }


    public onRaf(time: number) {
        const actTime = Math.min(time, this._startTime + this._duration)
        const timeProgress = actTime - this._startTime
        const progress = (1/this._duration)*timeProgress
        const value = (this._to - this._from) * this._via(progress) + this._from
        this._tick(value, progress, this._with)
        return progress == 1
    }


}

export function viaLinear (x: number): number {return x}

function linear(p0x: number, p0y: number, p1x: number, p1y: number, t: number): number[]{
    return [p0x + (p1x - p0x) * t, p0y + (p1y - p0y) * t];
}

export function  viaQuadratic (p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number, t: number): number[] {
    return linear(p0x + (p1x - p0x) * t, p0y + (p1y - p0y) * t,
        p1x + (p2x - p1x) * t, p1y + (p2y - p1y) * t, t);
}

export function viaCubic (p0x: number, p0y: number, p1x: number, p1y: number, p2x: number, p2y: number, p3x: number, p3y: number, t: number): number[] {
    return viaQuadratic(p0x + (p1x - p0x) * t,
        p0y + (p1y - p0y) * t,
        p1x + (p2x - p1x) * t,
        p1y + (p2y - p1y) * t,
        p2x + (p3x - p2x) * t,
        p2y + (p3y - p2y) * t,
        t);
}

export function viaCubicUnit(p1x: number, p1y: number, p2x: number, p2y: number, t: number): number[] {
    return viaQuadratic(0 + (p1x - 0) * t,
        0 + (p1y - 0) * t,
        p1x + (p2x - p1x) * t,
        p1y + (p2y - p1y) * t,
        p2x + (1 - p2x) * t,
        p2y + (1 - p2y) * t,
        t);
}




export function viaEaseInSine (progress: number): number {
    return viaCubicUnit(0.47, 0, 0.745, 0.715, progress)[1];
}

export function viaEaseOutSine (progress: number): number {
    return viaCubicUnit(0.39, 0.575, 0.565, 1, progress)[1];
}

export function viaEaseInOutSine (progress: number): number {
    return viaCubicUnit(0.445, 0.05, 0.55, 0.95, progress)[1];
}

export function viaEaseInQuad (progress: number): number {
    return viaCubicUnit(0.55, 0.085, 0.68, 0.53, progress)[1];
}

export function viaEaseOutQuad (progress: number): number {
    return viaCubicUnit(0.25, 0.46, 0.45, 0.94, progress)[1];
}

export function viaEaseInOutQuad (progress: number): number {
    return viaCubicUnit(0.455, 0.03, 0.515, 0.955, progress)[1];
}

export function viaBezierCurve (p0x: number, p0y: number, p1x: number, p1y: number): (progress: number)=>number{
    return function (progress: number) {
        return viaCubicUnit(p0x, p0y, p1x, p1y, progress)[1];
    };
}

