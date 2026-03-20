# md-toc-ln

Print a table of contents with line numbers for a markdown file or stdin.

## Installation

```bash
npm install -g md-toc-ln
bun add -g md-toc-ln
bunx md-toc-ln
```

## Usage

```
md-toc-ln [file] [options]
cat file.md | md-toc-ln [options]
```

### Options

| Option                | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `--format <template>` | Output format for each entry (default: `{hashes} {title} :{line}`) |
| `-h, --help`          | Show help                                                          |

### Template variables

| Variable   | Description                                         |
| ---------- | --------------------------------------------------- |
| `{hashes}` | Heading marker (`#`, `##`, `###`, …)                |
| `{title}`  | Heading text                                        |
| `{line}`   | Line number in the source file                      |
| `{depth}`  | Heading depth (1–6)                                 |
| `{indent}` | Two spaces per depth level minus one (empty for h1) |

### Examples

```bash
# TOC from a file
md-toc-ln README.md

# TOC from stdin
cat README.md | md-toc-ln

# Indented tree with line numbers
md-toc-ln README.md --format "{indent}{hashes} {title} :{line}"

# Just title and line
cat README.md | md-toc-ln --format "{line}: {title}"
```

## Node.js API

```typescript
import { extractToc } from "md-toc-ln";

const markdown = `# Hello\n## World`;
console.log(extractToc(markdown));
// # Hello :1
// ## World :2

// Custom format
console.log(extractToc(markdown, "{indent}{hashes} {title} :{line}"));
// # Hello :1
//   ## World :2
```

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

MIT
