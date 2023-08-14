import { expect, test } from 'vitest'
import { taskStats } from "@/utils/markdown"


test('task-list', () => {
    expect(taskStats("* [ ] 1\n* 2\n")).toStrictEqual([0,1])
    expect(taskStats("* [x] 1\n* 2\n")).toStrictEqual([1,1])
})
