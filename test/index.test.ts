import { expect, test } from "bun:test"
import { extractToc } from "../src/index"

test("single heading produces correct output with line number", () => {
	expect(extractToc("# Hello")).toBe("# Hello :1")
})

test("multiple headings at different depths produce correct lines and line numbers", () => {
	const md = `# Title
## Section
### Sub`
	expect(extractToc(md)).toBe(
		`# Title :1
## Section :2
### Sub :3`,
	)
})

test("headings inside backtick fenced code blocks are skipped", () => {
	const md = `# Real
\`\`\`
# Fake
\`\`\`
# Also Real`
	expect(extractToc(md)).toBe("# Real :1\n# Also Real :5")
})

test("headings inside tilde fenced code blocks are skipped", () => {
	const md = `# Real
~~~
# Fake
~~~
# Also Real`
	expect(extractToc(md)).toBe("# Real :1\n# Also Real :5")
})

test("custom format template with all variables", () => {
	const md = `## My Section`
	expect(extractToc(md, "{indent}{hashes} {title} (line {line}, depth {depth})")).toBe(
		"  ## My Section (line 1, depth 2)",
	)
})

test("no headings returns empty string", () => {
	expect(extractToc("just some text\nno headings here")).toBe("")
})

test("all template variables render correctly", () => {
	const md = `### Deep`
	expect(extractToc(md, "{hashes}|{title}|{line}|{depth}|{indent}")).toBe(
		"###|Deep|1|3|    ",
	)
})
