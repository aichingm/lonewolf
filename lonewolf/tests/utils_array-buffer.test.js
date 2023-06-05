import { expect, test } from 'vitest'
import { toBase64, fromBase64 } from "@/utils/array-buffer"


test('from', () => {
    expect(fromBase64("").byteLength).toBe(0)
    expect(fromBase64("dGhpcyBpcyBhIHRlc3QKw4R+")).toStrictEqual(new TextEncoder().encode("this is a test\nÄ~").buffer)
})


test('to', () => {
    expect(toBase64(new TextEncoder().encode("").buffer)).toBe("")
    expect(toBase64(new TextEncoder().encode("this is a test\nÄ~").buffer)).toBe("dGhpcyBpcyBhIHRlc3QKw4R+")
})
