import { readFile } from "node:fs/promises";
import { extractToc } from "./index";

const DEFAULT_FORMAT = "{hashes} {title} :{line}";
const HELP_TEXT = `md-toc-ln [file] [--format "<template>"]
cat file.md | md-toc-ln [--format "<template>"]

Template variables:
  {hashes} {title} {line} {depth} {indent}
`;

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
