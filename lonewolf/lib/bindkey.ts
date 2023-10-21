export class Combination{

    private shift = false
    private ctrl = false
    private alt = false
    private meta = false
    private char: string

    private static UNICODE_MAP = new Map([
        ["ArrowUp","\u2191"],
        ["ArrowDown","\u2193"],
        ["ArrowLeft","\u2190"],
        ["ArrowRight","\u2192"],
        ["Home","\u21E4"],
        ["End","\u21E5"],
        ["PageUp","\u2912"],
        ["PageDown","\u2913"],
        ["Escape","\u241B"],
        ["Delete","\u2410"],
        ["Backspace","\u2408"],
        ["Tab","\u21B9"],
    ])
 

    public constructor(shift: boolean, ctrl: boolean, alt: boolean, meta: boolean, char: string) {
        this.shift = shift
        this.ctrl = ctrl
        this.alt = alt
        this.meta = meta
        this.char = char
    }

    public toString() {
        const keys = []
        if(this.shift){keys.push("Shift")}    
        if(this.ctrl){keys.push("Ctrl")}    
        if(this.alt){keys.push("Alt")}    
        if(this.meta){keys.push("Meta")}    
        keys.push(this.char)
        return keys.join("+")
    }

    public toDisplay(){
        const keys = []
        if(this.shift){keys.push("Shift")}    
        if(this.ctrl){keys.push("Ctrl")}    
        if(this.alt){keys.push("Alt")}    
        if(this.meta){keys.push("Meta")}    
        keys.push(Combination.UNICODE_MAP.has(this.char)?Combination.UNICODE_MAP.get(this.char) as string:this.char)
        return keys.join("+")
    }

    public static fromString(s: string): Combination {

        const mapEntries = Array.from(Combination.UNICODE_MAP.entries())
        const reverseMap = new Map(mapEntries.map(kv=>[kv[1], kv[0].toLowerCase()]))
        const lowerCaseKeyMap = new Map(mapEntries.map(kv=>[kv[0].toLowerCase(), kv[0]]))
        
        const ps = s.toLowerCase().split("+")

        if (s.includes("++")) ps.push("+")

        const char = (reverseMap.has(ps[ps.length-1]) ? 
            reverseMap.get(ps[ps.length-1])
            :
            (lowerCaseKeyMap.has(ps[ps.length-1]) ? 
                lowerCaseKeyMap.get(ps[ps.length-1])
                :
                ps[ps.length-1])) as string // as string since ts does not know that .has() has checked the existance already 

        return new Combination(ps.includes("shift"), ps.includes("ctrl"), ps.includes("alt"), ps.includes("meta"), char)

    }

    public static fromEvent(e: KeyboardEvent): Combination {

        let char = ""
        if (e.code.startsWith("Digit")){
            char = e.code.substring(5)
        } else if (e.charCode > 0) {
            char = String.fromCharCode(e.charCode).toLowerCase()
        } else {
            char = e.key.length == 1 ? e.key.toLowerCase() : e.key
        }
        return new Combination(e.shiftKey, e.ctrlKey, e.altKey, e.metaKey, char)
    }

    public toInt(){
        const int = (b:boolean):number => b ? 1 : 0
        return int(this.shift) | (int(this.ctrl) << 1) | (int(this.alt) << 2) | (int(this.meta) << 3) | (this.char.charCodeAt(0) << 4)
    }


}

type Action = ()=>void

export class Bindkey{

    private bindings: Map<string, Action> = new Map()
    private eventTarget: EventTarget | null = null
    private isPaused = false
    private handler = (e: Event): void => { this.onEvent(e as KeyboardEvent) }

    public attach(et: EventTarget){
        this.detach()
        this.eventTarget = et
        this.eventTarget.addEventListener("keydown", this.handler)
        this.eventTarget.addEventListener("keypress", this.handler)
        this.eventTarget.addEventListener("keyup", this.handler)
    }

    public detach() {
        if(this.eventTarget != null) {
            this.eventTarget.removeEventListener("keydown", this.handler)
            this.eventTarget.removeEventListener("keypress", this.handler)
            this.eventTarget.removeEventListener("keyup", this.handler)
        }
    }

    public pause(){
        this.isPaused = true 
    }
    public unpause(){
        this.isPaused = false
    }

    public bind(s: string, a: Action) {
        this.bindings.set(Combination.fromString(s).toString(), a)
    }

    public unbind(s: string) {
        this.bindings.delete(Combination.fromString(s).toString())
    }

    public unbindAll() {
        this.bindings.clear()
    }

    public trigger(c: Combination) {
        if(this.bindings.has(c.toString())) this.exec(c)
    }

    private exec(c: Combination) {
        if(!this.isPaused){
            const action = this.bindings.get(c.toString()) as Action
            if(action){
                action()
            }
        }
    }

    private onEvent(e: KeyboardEvent): void {
        if([16, 17, 18, 91, 225].includes(e.keyCode)){return}

        const combo = Combination.fromEvent(e)
        if(this.bindings.has(combo.toString())) {
            e.preventDefault()
            e.stopPropagation()
            if(e.type == "keyup") {
                this.exec(combo)
            }
            return 
        }

    }


}

export function record(et: EventTarget, timeout: number): Promise<Combination>{

    return new Promise<Combination>((res, rej)=>{

        const timer = setTimeout(()=>{off();rej()}, timeout);

        const preventListener = (e: Event)=>e.preventDefault()

        const off = ()=>{
            et.removeEventListener("keydown", preventListener)
            et.removeEventListener("keypress", preventListener)
            et.removeEventListener("keyup", l as (e: Event)=>void)
            clearTimeout(timer)
        }

        const l = (e: KeyboardEvent) => {
            if([16, 17, 18, 91, 225].includes(e.keyCode)){return}
            e.preventDefault()
            e.stopPropagation()
            off()
            res(Combination.fromEvent(e))

        }

        et.addEventListener("keydown", preventListener)
        et.addEventListener("keypress", preventListener)
        et.addEventListener("keyup", l as (e: Event)=>void)


    })

}


