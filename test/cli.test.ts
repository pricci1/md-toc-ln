import { expect, test } from "bun:test";
import { spawnSync } from "bun";

test("cli prints Hello, World!", () => {
	const result = spawnSync(["bun", "src/cli.ts"]);
	expect(result.stdout.toString().trim()).toBe("Hello, World!");
});
