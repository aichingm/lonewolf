

export class Path {
    private platform: "posix"|"windows"
    private root: string|null
    private path: string[]

    constructor(platform: "posix"|"windows", root: string|null, path: string[]){
        this.platform = platform
        this.root = root
        this.path = path
    }

    dirname(): Path{

        if(this.path.length == 0){
            if(this.root != null){
                return new Path(this.platform, this.root, [])
            }else{
                return new Path(this.platform, this.root, ["."])
            }
        }

        if(this.path.length == 1){
            if(this.root != null){
                return new Path(this.platform, this.root, [])
            }else{
                return new Path(this.platform, this.root, ["."])
            }
        }

        return new Path(this.platform, this.root, this.path.slice(0, this.path.length -1))
    }

    basename(): string{
        if(this.path.length == 0){
            return this.root || "" // "" if path is relative and has no path/file
        }
        return this.path[this.path.length - 1]
    }

    concat(path: string): Path{
        const parsedPath = this.platform == "windows" ? Path.splitWindows(path) : Path.splitPosix(path)
        return new Path(this.platform, this.root, [...this.path, ...parsedPath])
    }

    join(path: Path): Path{
        return new Path(this.platform, this.root, [...this.path, ...path.path])
    }

    normalize(): Path{
        const path = []
        for (const p of this.path) {
            if(p == ".."){
                path.pop()
                continue
            }
            if(p == "."){
                continue
            }
            path.push(p)
        }

        return new Path(this.platform, this.root, path)
    }

    isAbsolute(): boolean {
        return this.root != null
    }

    relativeTo(path: Path): Path{
        const t = this.normalize()
        const p = path.normalize()

        if(!t.isAbsolute()|| !p.isAbsolute()){
            return t
        }

        let i = 0
        for(i = 0; i < Math.min(t.path.length, p.path.length); i++){
            if(t.path[i] != p.path[i]){
                break
            }
        }

        return new Path(t.platform, null, [...(new  Array(p.path.length - i)).fill("..", 0, p.path.length - i), ...t.path.slice(i)])

    }

    toAbsolute(path: Path): Path{
        return new Path(path.platform, path.root, [...path.path, ...this.path]).normalize()
    }

    toPosix(): Path{
        return new Path("posix", this.root!=null ? "/" : null, [...this.path])
    }

    toString(): string{
        const root = this.root != null ? this.root : ""
        if(this.platform == "windows"){
            return root + this.path.join("\\")
        }else{
            return root + this.path.map(p=>p.replaceAll('/', '\\/')).join("/")
        }
    }

    private static splitPosix(path: string): string[]{
        const parts = []
        let part = []
        for(let i = 0; i < path.length; i++){
            const c = path[i]
            if(c == "/") {
                parts.push(part.join(""))
                part = []
                continue
            }

            if(c == "\\") {
                if (++i < path.length) {
                    part.push(path[i])
                }
                continue
            } else {
                part.push(c)
            }
        }

        parts.push(part.join(""))
        return parts.filter(p=>p != "")
    }

    private static parsePosix(path: string): Path {
        const root = path[0] == "/"? "/": null
        return new Path("posix", root, Path.splitPosix(path))
    }

    private static splitWindows(path: string): string[]{
        const parts = []
        let part = []
        for(let i = 0; i < path.length; i++){
            const c = path[i]
            if(c == "\\") {
                parts.push(part.join(""))
                part = []
                continue
            }
            part.push(c)
        }
        parts.push(part.join(""))
        return parts.filter(p=>p != "")
    }

    private static parseWindows(path: string): Path {
        const rootMatch = path.match(/(^\\\\[^\\])|(^[a-zA-Z]:\\)/)
        const root = rootMatch != null ? rootMatch[0] : null
        if (root != null) {
            path = path.substring(root.length)
        }
        return new Path("windows", root, Path.splitWindows(path))
    }

    private static forbiddenInWindows(path: string): boolean{
        // https://en.wikipedia.org/wiki/Filename#Comparison_of_filename_limitations
        return path.indexOf("*") != -1 ||
            //path.indexOf(":") || allowed as part of absolute root
            //path.indexOf("\\") || allowed as path seperator
            path.indexOf("<") != -1 ||
            path.indexOf(">") != -1  ||
            path.indexOf("?") != -1  ||
            path.indexOf("|") != -1  ||
            path.length > 255
    }

    static parse(path: string): Path|null{
        if(path == ""){
            return null
        }
        if(/(^\\\\[^\\])|(^[a-zA-Z]:\\)/.test(path) && !this.forbiddenInWindows(path)) {
            return Path.parseWindows(path)
        } else {
            return Path.parsePosix(path)
        }
    }
}


