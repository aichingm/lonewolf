
import { expect, test } from 'vitest'
import FSStore, { FSDescriptor } from "@/common/attachments/FileSystemStore"
import { Attachment } from "@/common/attachments/Store"
import { arrayBuffer } from '@/utils/array-buffer'
import { Path } from '@/utils/path'



test('recalculatePaths', async () => {

    const descriptor = new FSDescriptor(null)

    const store = new FSStore(descriptor)

    const location = await store.createLocation(new Attachment("picture.png", "image/png"))

    store.pushData(location, arrayBuffer("/app/lonewolf/pictures/picture.png"))

    // test initial add file
    expect(descriptor.attachments.get(location).name).toBe("picture.png")
    expect(descriptor.filesystemLocations.get(location)).toBe("/app/lonewolf/pictures/picture.png")

    // test recalculate absolute path with no current project path
    store.recalculatePaths(null, Path.parse("/app/lonewolf/Board.lwp"))
    expect(descriptor.filesystemLocations.get(location)).toBe("pictures/picture.png")

    // test recalculate relative path with current project path
    store.recalculatePaths(Path.parse("/app/lonewolf/Board.lwp"), Path.parse("/app/lonewolf/boards/Board.lwp"))
    expect(descriptor.filesystemLocations.get(location)).toBe("../pictures/picture.png")

})

test('recalculatePaths/bad-call', async () => {

    const descriptor = new FSDescriptor(null)

    const store = new FSStore(descriptor)

    const location = await store.createLocation(new Attachment("picture.png", "image/png"))

    store.pushData(location, arrayBuffer("/app/lonewolf/pictures/picture.png"))

    // add file
    expect(descriptor.attachments.get(location).name).toBe("picture.png")
    expect(descriptor.filesystemLocations.get(location)).toBe("/app/lonewolf/pictures/picture.png")

    // make file relative
    store.recalculatePaths(null, Path.parse("/app/lonewolf/Board.lwp"))
    expect(descriptor.filesystemLocations.get(location)).toBe("pictures/picture.png")


    // test bad call
    expect(()=>store.recalculatePaths(null, Path.parse("/app/lonewolf/boards/Board.lwp"))).toThrow(new Error('Old path is null but store contains relative paths'))


})
