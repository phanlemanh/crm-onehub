import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const LIB = join(DAY, "../../agent/lib");
const CHEP = join(DAY, "agent/_chep");

const TEP = [
	[join(LIB, "builder-delegation.ts"), "builder-delegation.ts"],
	[join(LIB, "builder-delegation-state.ts"), "builder-delegation-state.ts"],
	[join(LIB, "builder-delivery.ts"), "builder-delivery.ts"],
	[
		join(DAY, "../fixtures/goi-bo-dung-kem-khuon-that.json"),
		"goi-bo-dung-kem-khuon-that.json",
	],
] as const;

rmSync(CHEP, { recursive: true, force: true });
mkdirSync(CHEP, { recursive: true });
for (const [nguon, dich] of TEP) copyFileSync(nguon, join(CHEP, dich));

const eve = Bun.spawn(
	[join(DAY, "../../node_modules/.bin/eve"), "eval", ...process.argv.slice(2)],
	{ cwd: DAY, stdio: ["inherit", "inherit", "inherit"] },
);
process.exit(await eve.exited);
