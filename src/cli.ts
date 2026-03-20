import { readFile } from "node:fs/promises";
import { extractToc } from "./index";

const DEFAULT_FORMAT = "{hashes} {title} :{line}";
const HELP_TEXT = `md-toc-ln — print a table of contents with line numbers for a markdown file

Usage:
  md-toc-ln [file] [options]
  cat file.md | md-toc-ln [options]

Options:
  --format <template>   Output format for each entry (default: "{hashes} {title} :{line}")
  -h, --help            Show this help

Template variables:
  {hashes}   Heading marker (#, ##, ###, …)
  {title}    Heading text
  {line}     Line number in the source file
  {depth}    Heading depth (1–6)
  {indent}   Two spaces per depth level minus one (empty for h1)

Examples:
  md-toc-ln README.md
  md-toc-ln README.md --format "{indent}{hashes} {title} :{line}"
  cat README.md | md-toc-ln --format "{line}: {title}"`;

export function parseArgs(args: string[]): {
	filePath: string | null;
	format: string;
	showHelp: boolean;
} {
	let filePath: string | null = null;
	let format = DEFAULT_FORMAT;
	let showHelp = false;

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index]!;
		if (arg === "--help" || arg === "-h") {
			showHelp = true;
			continue;
		}
		if (arg === "--format") {
			const value = args[index + 1];
			if (value) {
				format = value;
				index += 1;
			}
			continue;
		}
		if (!filePath && !arg.startsWith("-")) {
			filePath = arg;
		}
	}

	return { filePath, format, showHelp };
}

export function readStdin(): Promise<string> {
	return new Promise((resolve, reject) => {
		let data = "";
		process.stdin.setEncoding("utf8");
		process.stdin.on("data", (chunk) => {
			data += chunk;
		});
		process.stdin.on("end", () => resolve(data));
		process.stdin.on("error", reject);
	});
}

export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
	const { filePath, format, showHelp } = parseArgs(args);
	if (showHelp) {
		process.stdout.write(`${HELP_TEXT}\n`);
		return;
	}
	const input = filePath ? await readFile(filePath, "utf-8") : await readStdin();
	const output = extractToc(input, format);
	process.stdout.write(output);
	if (output.length > 0 && !output.endsWith("\n")) {
		process.stdout.write("\n");
	}
}

main();
