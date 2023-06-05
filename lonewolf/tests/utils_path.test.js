import { expect, test } from 'vitest'
import { Path } from "@/utils/path"


test('parse/platfrom', () => {
    expect(Path.parse("")).toBeNull()
    expect(Path.parse("c:\\Users").platform).toBe("windows")
    expect(Path.parse("C:\\Users").platform).toBe("windows")
    expect(Path.parse("z:\\Users").platform).toBe("windows")
    expect(Path.parse("/home/").platform).toBe("posix")
    expect(Path.parse("~/.ssh/config").platform).toBe("posix")
    expect(Path.parse(".ssh/config").platform).toBe("posix")
    expect(Path.parse("Downloads/cats.png").platform).toBe("posix")
    expect(Path.parse("Cars\\/Trucks/data-001.png").platform).toBe("posix")
})


test('parse/root', () => {
    expect(Path.parse("c:\\Users").root).toBe("c:\\")
    expect(Path.parse("C:\\Users").root).toBe("C:\\")
    expect(Path.parse("z:\\Users").root).toBe("z:\\")
    expect(Path.parse("/home/").root).toBe("/")
    expect(Path.parse("~/.ssh/config").root).toBeNull()
    expect(Path.parse(".ssh/config").root).toBeNull()
    expect(Path.parse("Downloads/cats.png").root).toBeNull()
    expect(Path.parse("Cars\\/Trucks/data-001.png").root).toBeNull()

})

test('parse/path', () => {
    expect(Path.parse("c:\\").path).toStrictEqual([])
    expect(Path.parse("c:\\Users").path).toStrictEqual(["Users"])
    expect(Path.parse("C:\\Users\\foo").path).toStrictEqual(["Users", "foo"])
    expect(Path.parse("z:\\Users\\foo\\data.csv").path).toStrictEqual(["Users", "foo", "data.csv"])
    expect(Path.parse("z:\\\\Users\\\\\\foo").path).toStrictEqual(["Users", "foo"])

    expect(Path.parse("/").path).toStrictEqual([])
    expect(Path.parse("/home").path).toStrictEqual(["home"])
    expect(Path.parse("/home/").path).toStrictEqual(["home"])
    expect(Path.parse("/home/foo").path).toStrictEqual(["home", "foo"])
    expect(Path.parse("/home/foo/data.csv").path).toStrictEqual(["home", "foo", "data.csv"])
    expect(Path.parse("~/.ssh/config").path).toStrictEqual(["~", ".ssh", "config"])
    expect(Path.parse(".").path).toStrictEqual(["."])
    expect(Path.parse("/.").path).toStrictEqual(["."])
    expect(Path.parse("./").path).toStrictEqual(["."])
    expect(Path.parse("/./").path).toStrictEqual(["."])
    expect(Path.parse("..").path).toStrictEqual([".."])
    expect(Path.parse("Downloads/cats.png").path).toStrictEqual(["Downloads", "cats.png"])
    expect(Path.parse("Cars\\/Trucks/data-001.png").path).toStrictEqual(["Cars/Trucks", "data-001.png"])
    expect(Path.parse("/home//foo///data.csv").path).toStrictEqual(["home", "foo", "data.csv"])

})

test('parse/toString', () => {
    expect(Path.parse("c:\\").toString()).toBe("c:\\")
    expect(Path.parse("c:\\Users").toString()).toBe("c:\\Users")
    expect(Path.parse("C:\\Users\\foo").toString()).toBe("C:\\Users\\foo")
    expect(Path.parse("z:\\Users\\foo\\data.csv").toString()).toBe("z:\\Users\\foo\\data.csv")
    expect(Path.parse("z:\\\\Users\\\\\\foo").toString()).toBe("z:\\Users\\foo")

    expect(Path.parse("/").toString()).toBe("/")
    expect(Path.parse("/home").toString()).toBe("/home")
    expect(Path.parse("/home/").toString()).toBe("/home")
    expect(Path.parse("/home/foo").toString()).toBe("/home/foo")
    expect(Path.parse("/home/foo/data.csv").toString()).toBe("/home/foo/data.csv")
    expect(Path.parse("~/.ssh/config").toString()).toBe("~/.ssh/config")
    expect(Path.parse(".").toString()).toBe(".")
    expect(Path.parse("/.").toString()).toBe("/.")
    expect(Path.parse("./").toString()).toBe(".")
    expect(Path.parse("/./").toString()).toBe("/.")
    expect(Path.parse("..").toString()).toBe("..")
    expect(Path.parse("Downloads/cats.png").toString()).toBe("Downloads/cats.png")
    expect(Path.parse("Cars\\/Trucks/data-001.png").toString()).toBe("Cars\\/Trucks/data-001.png")
    expect(Path.parse("/home//foo///data.csv").toString()).toBe("/home/foo/data.csv")
    expect(Path.parse("/home//foo/.././data.csv").toString()).toBe("/home/foo/.././data.csv")

})

test('parse/join', () => {

    const newPath = Path.parse("Downloads/data.csv")

    expect(Path.parse("C:\\Users\\foo").join(newPath).path).toStrictEqual(["Users", "foo", "Downloads", "data.csv"])

    expect(Path.parse("/home/foo").join(newPath).path).toStrictEqual(["home", "foo", "Downloads", "data.csv"])
})

test('parse/concat', () => {

    expect(Path.parse("C:\\Users\\foo").concat("Downloads\\data.csv").path).toStrictEqual(["Users", "foo", "Downloads", "data.csv"])

    expect(Path.parse("/home/foo").concat("Downloads/data.csv").path).toStrictEqual(["home", "foo", "Downloads", "data.csv"])
})

test('parse/dirname', () => {

    expect(Path.parse("C:\\Users\\").dirname().path).toStrictEqual([])
    expect(Path.parse("C:\\Users\\foo").dirname().path).toStrictEqual(["Users"])

    expect(Path.parse("/").dirname().path).toStrictEqual([])
    expect(Path.parse("/home").dirname().path).toStrictEqual([])
    expect(Path.parse("/home/foo").dirname().path).toStrictEqual(["home"])
    expect(Path.parse("home").dirname().path).toStrictEqual(["."])
    expect(Path.parse("home/foo").dirname().path).toStrictEqual(["home"])
    expect(Path.parse(".").dirname().path).toStrictEqual(["."])
    expect(Path.parse("./").dirname().path).toStrictEqual(["."])
    expect(Path.parse("./bar").dirname().path).toStrictEqual(["."])
    expect(Path.parse("../bar").dirname().path).toStrictEqual([".."])
    expect(Path.parse("..").dirname().path).toStrictEqual(["."])

})

test('parse/basename', () => {

    expect(Path.parse("C:\\").basename()).toBe("C:\\")
    expect(Path.parse("C:\\Users").basename()).toBe("Users")
    expect(Path.parse("C:\\Users\\").basename()).toBe("Users")
    expect(Path.parse("C:\\Users\\foo").basename()).toBe("foo")

    expect(Path.parse("/").basename()).toBe("/")
    expect(Path.parse("/.").basename()).toBe(".")
    expect(Path.parse("/..").basename()).toBe("..")
    expect(Path.parse("home").basename()).toBe("home")
    expect(Path.parse("/home").basename()).toBe("home")
    expect(Path.parse("/home/").basename()).toBe("home")
    expect(Path.parse("/home/foo").basename()).toBe("foo")

})

test('parse/toPosix', () => {

    expect(Path.parse("Users\\foo").toPosix().root).toBeNull()
    expect(Path.parse("C:\\Users\\foo").toPosix().root).toBe("/")
    expect(Path.parse("C:\\Users\\foo").toPosix().path).toStrictEqual(["Users", "foo"])

    expect(Path.parse("Users\\foo").toPosix().platform).toBe("posix")
    expect(Path.parse("C:\\Users\\foo").toPosix().platform).toBe("posix")
    expect(Path.parse("C:\\Users\\foo").toPosix().platform).toBe("posix")

})

test('parse/normalize', () => {

    expect(Path.parse(".").normalize().toString()).toBe("")
    expect(Path.parse("..").normalize().toString()).toBe("")
    expect(Path.parse("../").normalize().toString()).toBe("")

    expect(Path.parse("/.").normalize().toString()).toBe("/")
    expect(Path.parse("/..").normalize().toString()).toBe("/")
    expect(Path.parse("/../").normalize().toString()).toBe("/")

    expect(Path.parse("c:\\.").normalize().toString()).toBe("c:\\")
    expect(Path.parse("c:\\..").normalize().toString()).toBe("c:\\")
    expect(Path.parse("c:\\.\\").normalize().toString()).toBe("c:\\")

    expect(Path.parse("/home/foo").normalize().toString()).toBe("/home/foo")
    expect(Path.parse("/home/foo/.").normalize().toString()).toBe("/home/foo")
    expect(Path.parse("/home/foo/./").normalize().toString()).toBe("/home/foo")
    expect(Path.parse("/home/foo/..").normalize().toString()).toBe("/home")
    expect(Path.parse("/home/foo/../").normalize().toString()).toBe("/home")
    expect(Path.parse("/home/foo/../bar").normalize().toString()).toBe("/home/bar")

})

test('parse/relativeTo', () => {


    expect(Path.parse("/home/foo/Downloads/pictures/test.png").relativeTo(Path.parse("/home/foo/")).toString()).toBe("Downloads/pictures/test.png")
    expect(Path.parse("/home/foo/Downloads/pictures/test.png").relativeTo(Path.parse("/home/foo/Pictures")).toString()).toBe("../Downloads/pictures/test.png")
    expect(Path.parse("/home/foo/Downloads/pictures/test.png").relativeTo(Path.parse("/home/foo/Pictures/png")).toString()).toBe("../../Downloads/pictures/test.png")

})

test('parse/toAbsolute', () => {

    expect(Path.parse("Downloads/pictures/test.png").toAbsolute(Path.parse("/home/foo/")).toString()).toBe("/home/foo/Downloads/pictures/test.png")
    expect(Path.parse("../Downloads/pictures/test.png").toAbsolute(Path.parse("/home/foo/Pictures")).toString()).toBe("/home/foo/Downloads/pictures/test.png")
    expect(Path.parse("../../Downloads/pictures/test.png").toAbsolute(Path.parse("/home/foo/Pictures/png")).toString()).toBe("/home/foo/Downloads/pictures/test.png")

})
