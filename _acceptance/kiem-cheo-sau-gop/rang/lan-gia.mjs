import { spawn, spawnSync } from "node:child_process";
import {
	appendFileSync,
	existsSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { lech } from "../../../scripts/kiem-cheo/phan-xu.mjs";
import { maKyVong } from "../../../scripts/kiem-cheo/tap-cham.mjs";

const GOC_KHO = resolve(import.meta.dirname, "..", "..", "..");
const require = createRequire(import.meta.url);
const { resolveConfigKey, isRepinMachineEval } = require(
	join(GOC_KHO, "lib", "evidence-core.cjs"),
);
const { parseEvals } = require(join(GOC_KHO, "lib", "eval-yaml.cjs"));

function evalsCua(root, slug) {
	const text = readFileSync(
		join(root, "_acceptance", slug, "evals.yaml"),
		"utf8",
	);
	const cauHinh = join(root, "_acceptance", "config.yaml");
	const configText = existsSync(cauHinh) ? readFileSync(cauHinh, "utf8") : "";
	const kyVong = maKyVong(text);
	return parseEvals(text, ["executor", "cmd", "status", "criterion"])
		.filter((e) => isRepinMachineEval(e))
		.map((e) => {
			let cmd = String(e.cmd || "").trim();
			if (cmd.startsWith("config:")) {
				cmd = resolveConfigKey(configText, cmd.slice("config:".length)) ?? cmd;
			}
			return { id: e.id, cmd, expected: kyVong.get(e.id) ?? 0 };
		});
}

const argv = process.argv.slice(2);
if (process.env.KCS_ARGV) {
	appendFileSync(
		process.env.KCS_ARGV,
		`${JSON.stringify({ argv, cwd: process.cwd() })}\n`,
	);
}
const root = argv[argv.indexOf("--root") + 1];
const slugs = argv.flatMap((a, i) => (a === "--slug" ? [argv[i + 1]] : []));

if (process.env.KCS_NGU) {
	const ngu = spawn("sleep", [process.env.KCS_NGU], { stdio: "ignore" });
	if (process.env.KCS_PID) writeFileSync(process.env.KCS_PID, String(ngu.pid));
	await new Promise((r) => ngu.on("close", r));
}

const suiteMa = Number(process.env.KCS_SUITE_MA ?? 0);
const out = {
	run_id: "lan-gia",
	suites: [{ cmd: "bun run test", exit: suiteMa }],
	slugs: {},
};
let red = suiteMa !== 0;
for (const slug of slugs) {
	const evalsExit = {};
	const ds = [];
	for (const e of evalsCua(root, slug)) {
		const exit = process.env.KCS_XANH_HET
			? 0
			: (spawnSync("bash", ["-c", e.cmd], { cwd: root, encoding: "utf8" })
					.status ?? 1);
		evalsExit[e.id] = exit;
		process.stderr.write(`[lane] ${slug} ${e.id}: ${e.cmd} → exit ${exit}\n`);
		if (lech(exit, e.expected)) {
			red = true;
			ds.push({ ...e, exit });
		}
	}
	out.slugs[slug] = { evals_exit: evalsExit, lech: ds };
}
process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
process.exit(
	process.env.KCS_LAN_MA ? Number(process.env.KCS_LAN_MA) : red ? 1 : 0,
);
