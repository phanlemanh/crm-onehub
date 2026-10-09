import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "..", "..", "..");
const r = spawnSync(
	"bash",
	[
		"_acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh",
		"bun _acceptance/tro-ly-okr-nen/rang/cach-ly-dau-cuoi.mjs --lan 3",
	],
	{ cwd: GOC, stdio: "inherit" },
);
process.exit(r.status ?? 2);
