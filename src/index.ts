export type TocEntry = {
	hashes: string;
	title: string;
	line: number;
	depth: number;
	indent: string;
};

const DEFAULT_FORMAT = "{hashes} {title} :{line}";

export function extractToc(markdown: string, format: string = DEFAULT_FORMAT): string {
	const lines = markdown.split("\n");
	const entries: string[] = [];
	let inFence = false;
	let fenceMarker: string | null = null;
	// Tracks the last plain-text line for setext heading detection
	let previousText: string | null = null;
	let previousLineIndex = -1;

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index]!;

		const fenceMatch = line.match(/^(\s*)(```+|~~~+)/);
		if (fenceMatch) {
			const marker = fenceMatch[2]!;
			if (!inFence) {
				inFence = true;
				fenceMarker = marker;
			} else if (fenceMarker && marker.startsWith(fenceMarker)) {
				inFence = false;
				fenceMarker = null;
			}
			previousText = null;
			continue;
		}

		if (inFence) continue;

		// Setext underline: one or more `=` → h1, one or more `-` → h2
		if (previousText !== null) {
			const isH1 = /^=+\s*$/.test(line);
			const isH2 = /^-+\s*$/.test(line);
			if (isH1 || isH2) {
				const depth = isH1 ? 1 : 2;
				const hashes = "#".repeat(depth);
				const entry: TocEntry = {
					hashes,
					title: previousText.trim(),
					line: previousLineIndex + 1,
					depth,
					indent: " ".repeat((depth - 1) * 2),
				};
				entries.push(applyFormat(format, entry));
				previousText = null;
				continue;
			}
		}

		const headingMatch = line.match(/^(\s*)(#{1,6})\s+(.+?)\s*$/);
		if (headingMatch) {
			const hashes = headingMatch[2]!;
			const title = headingMatch[3]!.trim();
			const depth = hashes.length;
			const entry: TocEntry = {
				hashes,
				title,
				line: index + 1,
				depth,
				indent: " ".repeat((depth - 1) * 2),
			};
			entries.push(applyFormat(format, entry));
			previousText = null;
			continue;
		}

		// Blank lines break a potential setext heading
		previousText = line.trim().length > 0 ? line : null;
		previousLineIndex = index;
	}

	return entries.join("\n");
}

function applyFormat(format: string, entry: TocEntry): string {
	return format
		.replaceAll("{hashes}", entry.hashes)
		.replaceAll("{title}", entry.title)
		.replaceAll("{line}", entry.line.toString())
		.replaceAll("{depth}", entry.depth.toString())
		.replaceAll("{indent}", entry.indent);
}
