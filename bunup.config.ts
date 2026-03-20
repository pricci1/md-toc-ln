import { defineConfig } from "bunup";

export default defineConfig([
	{
		entry: ["src/index.ts"],
		format: ["esm"],
		dts: true,
	},
	{
		entry: ["src/cli.ts"],
		format: ["esm"],
		banner: "#!/usr/bin/env node",
	},
]);
