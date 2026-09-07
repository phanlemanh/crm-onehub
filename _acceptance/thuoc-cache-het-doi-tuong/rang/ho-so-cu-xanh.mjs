import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GOC } from "./cau-hinh-turbo.mjs";

const HO_SO = "lenh-chung-khong-an-cache-doi";
const GHIM = ["E1", "E2", "E5", "E6", "E7", "E8"];

const ev = readFileSync(join(GOC, "_acceptance", HO_SO, "evals.yaml"), "utf8");
const cfg = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");

const khoi = [...ev.matchAll(/- id: (\w+)\n\s+criterion: [\w-]+\n\s+executor: (\w+)\n\s+cmd: (\S+)/g)];
const script = khoi.filter((m) => m[2] === "script");
if (script.length === 0) {
	console.error(`KHONG DO DUOC: ho so ${HO_SO} khong con eval script nao.`);
	process.exit(2);
}

const ten = khoi.map((m) => m[1]).sort();
console.log(`ho so ${HO_SO}: ${khoi.length} eval · ${script.length} eval script`);
console.log(`  da chay: ${ten.join(" ")}`);
console.log(`  ghim   : ${[...GHIM].sort().join(" ")}`);

const thua = ten.filter((t) => !GHIM.includes(t));
const thieu = GHIM.filter((g) => !ten.includes(g));
if (thua.length > 0 || thieu.length > 0) {
	console.error(
		`DO: danh sach ma eval lech danh sach ghim — thua: ${thua.join(" ") || "khong"} · thieu: ${thieu.join(" ") || "khong"}`,
	);
	process.exit(1);
}

const do_ = [];
for (const [, id, , ref] of script) {
	const khoa = ref.replace("config:executors.script.", "");
	const m = cfg.match(new RegExp(`^\\s+${khoa}: "?(.+?)"?$`, "m"));
	if (m === null) {
		do_.push(`${id}: o cam ${khoa} khong ton tai trong config`);
		continue;
	}
	let ma = 0;
	try {
		execSync(m[1], { cwd: GOC, stdio: "pipe", maxBuffer: 40e6 });
	} catch (e) {
		ma = e.status ?? 1;
	}
	console.log(`  ${id} ${khoa} exit=${ma}`);
	if (ma !== 0) do_.push(`${id} (${khoa}) tra ma ${ma}`);
}

if (do_.length > 0) {
	for (const d of do_) console.error(`DO: eval cua ho so cu khong dung lai duoc — ${d}`);
	process.exit(1);
}
console.log(
	`XANH: ca ${script.length} eval script cua ${HO_SO} dung lai duoc tren cay hom nay, va danh sach ma khop dung ghim.`,
);
