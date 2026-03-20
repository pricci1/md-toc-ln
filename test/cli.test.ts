import { expect, test } from "bun:test"
import { spawnSync } from "bun"
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

// --- integration (spawn the CLI via Bun) ---

const CLI = new URL("../src/cli.ts", import.meta.url).pathname

test("integration: file argument prints TOC", () => {
	const result = spawnSync(["bun", CLI, "README.md"], {
		cwd: "/var/home/toor/Projects/md-toc-ln-v2",
	})
	expect(result.exitCode).toBe(0)
	// README has headings — just verify the output is non-empty and contains a heading marker
	expect(result.stdout.toString()).toMatch(/^#+ .+ :\d+/m)
})

test("integration: stdin pipe prints TOC", () => {
	const result = spawnSync(["bun", CLI], {
		stdin: new TextEncoder().encode("# Hello\n## World"),
	})
	expect(result.exitCode).toBe(0)
	expect(result.stdout.toString().trim()).toBe("# Hello :1\n## World :2")
})

test("integration: --format flag is applied", () => {
	const result = spawnSync(["bun", CLI, "--format", "{title} ({line})"], {
		stdin: new TextEncoder().encode("# My Heading"),
	})
	expect(result.exitCode).toBe(0)
	expect(result.stdout.toString().trim()).toBe("My Heading (1)")
})

test("integration: --help prints usage", () => {
	const result = spawnSync(["bun", CLI, "--help"])
	expect(result.exitCode).toBe(0)
	expect(result.stdout.toString()).toContain("md-toc-ln")
	expect(result.stdout.toString()).toContain("--format")
})

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
