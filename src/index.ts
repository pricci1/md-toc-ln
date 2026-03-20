export type TocEntry = {
	hashes: string
	title: string
	line: number
	depth: number
	indent: string
}

const DEFAULT_FORMAT = "{hashes} {title} :{line}"

export function extractToc(markdown: string, format: string = DEFAULT_FORMAT): string {
	const lines = markdown.split("\n")
	const entries: string[] = []
	let inFence = false
	let fenceMarker: string | null = null

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index]!
		const fenceMatch = line.match(/^(\s*)(```+|~~~+)/)
		if (fenceMatch) {
			const marker = fenceMatch[2]!
			if (!inFence) {
				inFence = true
				fenceMarker = marker
			} else if (fenceMarker && marker.startsWith(fenceMarker)) {
				inFence = false
				fenceMarker = null
			}
			continue
		}

		if (inFence) continue

		const headingMatch = line.match(/^(\s*)(#{1,6})\s+(.+?)\s*$/)
		if (!headingMatch) continue

		const hashes = headingMatch[2]!
		const title = headingMatch[3]!.trim()
		const depth = hashes.length
		const entry: TocEntry = {
			hashes,
			title,
			line: index + 1,
			depth,
			indent: " ".repeat((depth - 1) * 2),
		}
		entries.push(applyFormat(format, entry))
	}

	return entries.join("\n")
}

function applyFormat(format: string, entry: TocEntry): string {
	return format
		.replaceAll("{hashes}", entry.hashes)
		.replaceAll("{title}", entry.title)
		.replaceAll("{line}", entry.line.toString())
		.replaceAll("{depth}", entry.depth.toString())
		.replaceAll("{indent}", entry.indent)
}
