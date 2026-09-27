import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const LIB = join(DAY, "../../agent/lib");
const LUOT = join(DAY, ".chay", crypto.randomUUID());
const CHEP = join(LUOT, "agent/_chep");

const TEP = [
	[join(LIB, "builder-delegation.ts"), "builder-delegation.ts"],
	[join(LIB, "builder-delegation-state.ts"), "builder-delegation-state.ts"],
	[join(LIB, "builder-delivery.ts"), "builder-delivery.ts"],
	[
		join(DAY, "../fixtures/goi-bo-dung-kem-khuon-that.json"),
		"goi-bo-dung-kem-khuon-that.json",
	],
] as const;

mkdirSync(LUOT, { recursive: true });
for (const phan of ["agent", "evals", "package.json"]) {
	cpSync(join(DAY, phan), join(LUOT, phan), {
		recursive: true,
		filter: (nguon) => !nguon.includes("/_chep"),
	});
}
mkdirSync(CHEP, { recursive: true });
for (const [nguon, dich] of TEP) cpSync(nguon, join(CHEP, dich));

let ma = 1;
try {
	const eve = Bun.spawn(
		[
			join(DAY, "../../node_modules/.bin/eve"),
			"eval",
			...process.argv.slice(2),
		],
		{ cwd: LUOT, stdio: ["inherit", "inherit", "inherit"] },
	);
	ma = await eve.exited;
} finally {
	rmSync(LUOT, { recursive: true, force: true });
}
process.exit(ma);
