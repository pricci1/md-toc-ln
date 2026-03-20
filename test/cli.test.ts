import { expect, test } from "bun:test"
import { Readable } from "node:stream"
import { parseArgs, readStdin } from "../src/cli"

// --- parseArgs ---

test("parseArgs: extracts file path", () => {
	expect(parseArgs(["file.md"])).toMatchObject({ filePath: "file.md" })
})

test("parseArgs: extracts --format value", () => {
	expect(parseArgs(["--format", "{title}"])).toMatchObject({ format: "{title}" })
})

test("parseArgs: --help sets showHelp", () => {
	expect(parseArgs(["--help"])).toMatchObject({ showHelp: true })
})

test("parseArgs: -h sets showHelp", () => {
	expect(parseArgs(["-h"])).toMatchObject({ showHelp: true })
})

test("parseArgs: defaults when no args", () => {
	const result = parseArgs([])
	expect(result.filePath).toBeNull()
	expect(result.showHelp).toBe(false)
	expect(typeof result.format).toBe("string")
})

test("parseArgs: file path and format together", () => {
	expect(parseArgs(["doc.md", "--format", "{hashes} {title}"])).toMatchObject({
		filePath: "doc.md",
		format: "{hashes} {title}",
	})
})

// --- readStdin ---

test("readStdin: reads from a readable stream", async () => {
	const original = process.stdin
	// @ts-expect-error — replacing stdin with a mock stream for testing
	process.stdin = Readable.from(["hello ", "world"])
	try {
		const result = await readStdin()
		expect(result).toBe("hello world")
	} finally {
		// @ts-expect-error
		process.stdin = original
	}
})
