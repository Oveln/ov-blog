import { describe, it, expect } from "vitest"
import { calculateReadingTime } from "$lib/content/transforms/reading-time"
import { parseToMdast } from "$lib/content/parser"

describe("calculateReadingTime", () => {
  it("空内容最少 1 分钟", async () => {
    const tree = await parseToMdast("")
    const time = calculateReadingTime(tree)
    expect(time).toBe(1)
  })

  it("短内容为 1 分钟", async () => {
    const md = "这是一篇短文。"
    const tree = await parseToMdast(md)
    const time = calculateReadingTime(tree)
    expect(time).toBe(1)
  })

  it("纯中文按 300 字/分钟计算", async () => {
    const text = "我".repeat(600)
    const tree = await parseToMdast(text)
    const time = calculateReadingTime(tree)
    expect(time).toBe(2)
  })

  it("纯英文按 200 词/分钟计算", async () => {
    const words = Array(400).fill("word").join(" ")
    const tree = await parseToMdast(words)
    const time = calculateReadingTime(tree)
    expect(time).toBe(2)
  })

  it("中英混合内容分别计算", async () => {
    const text = "我".repeat(300) + " " + Array(200).fill("word").join(" ")
    const tree = await parseToMdast(text)
    const time = calculateReadingTime(tree)
    expect(time).toBe(2) // 300/300 + 200/200 = 2
  })

  it("结果向上取整", async () => {
    const text = "我".repeat(150) // 150/300 = 0.5 → ceil → 1
    const tree = await parseToMdast(text)
    const time = calculateReadingTime(tree)
    expect(time).toBe(1)
  })

  it("大量内容计算正确", async () => {
    const text = "我".repeat(900) // 900/300 = 3
    const tree = await parseToMdast(text)
    const time = calculateReadingTime(tree)
    expect(time).toBe(3)
  })
})
