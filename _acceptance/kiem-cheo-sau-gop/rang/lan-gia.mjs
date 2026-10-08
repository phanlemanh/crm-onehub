import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const GOC_KHO = resolve(import.meta.dirname, "..", "..", "..");
const MAU = readFileSync(
	join(GOC_KHO, "scripts", "kiem-cheo", "fixtures", "lan-that.txt"),
	"utf8",
).split("\n");
const MAU_SUITE = MAU.find((d) => d.startsWith("[lane] suite "));
const MAU_EVAL = MAU.find(
	(d) => /^\[lane\] \S+ E\w+: /.test(d) && !d.includes("(đã chạy)"),
);

function dongSuite(lenh, ma) {
	const [dau, sau] = MAU_SUITE.split(": ");
	const duoi = sau.slice(sau.indexOf(" → exit "));
	return `${dau.replace(/\d+\/\d+$/, "1/1")}: ${lenh}${duoi.replace(/exit \d+/, `exit ${ma}`)}`;
}

function dongEval(slug, id, lenh, ma) {
	const [dau, ...sau] = MAU_EVAL.split(": ");
	const conLai = sau.join(": ");
	const duoi = conLai.slice(conLai.indexOf(" → exit "));
	const [, slugMau, idMau] = dau.split(" ");
	return `${dau.replace(slugMau, slug).replace(idMau, id)}: ${lenh}${duoi.replace(/exit \d+/, `exit ${ma}`)}`;
}

function evalsCua(root, slug) {
	const text = readFileSync(
		join(root, "_acceptance", slug, "evals.yaml"),
		"utf8",
	);
	const ra = [];
	let hienTai = null;
	for (const dong of text.split("\n")) {
		const id = /^\s*- id: (\S+)/.exec(dong);
		if (id) {
			hienTai = { id: id[1], cmd: null };
			ra.push(hienTai);
		}
		const cmd = /^\s+cmd: (.+)$/.exec(dong);
		if (cmd && hienTai) hienTai.cmd = cmd[1];
	}
	return ra.filter((e) => e.cmd);
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
console.log(dongSuite("bun run test", suiteMa));
let doBatKy = suiteMa !== 0;
for (const slug of slugs) {
	for (const e of evalsCua(root, slug)) {
		const r = spawnSync("bash", ["-c", e.cmd], { cwd: root, encoding: "utf8" });
		const ma = r.status ?? 1;
		if (ma !== 0) doBatKy = true;
		console.log(dongEval(slug, e.id, e.cmd, ma));
	}
}
process.exit(doBatKy ? 1 : 0);
