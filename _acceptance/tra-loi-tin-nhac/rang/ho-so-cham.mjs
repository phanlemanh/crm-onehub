import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "tra-loi-tin-nhac";
const DA_KY = new Set(["signed-off", "machine-cleared"]);
const SPEC_DA_KY = [
	"nhac-qua-zalo",
	"nhac-ke-hoach",
	"zalo-qua-webhook",
	"noi-zalo-cho-nguoi-moi",
	"zalo-webhook-doc-khuon-that",
].map((t) => `apps/agent/test/${t}.integration.spec.ts`);
const DOI_CHUNG = "nhac-qua-zalo";

const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" });

function khuon(glob) {
	const tho = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
	const re = tho
		.replace(/\*\*\//g, "\u0000")
		.replace(/\*\*/g, "\u0001")
		.replace(/\*/g, "[^/]*")
		.replace(/\u0000/g, "(?:.*/)?")
		.replace(/\u0001/g, ".*");
	return new RegExp(`^${re}$`);
}

function duongCua(text) {
	const ra = [];
	let thut = -1;
	for (const dong of text.split("\n")) {
		const mo = dong.match(/^(\s*)paths:\s*$/);
		if (mo) {
			thut = mo[1].length;
			continue;
		}
		if (thut < 0) continue;
		const muc = dong.match(/^(\s*)-\s+"?([^"#]+?)"?\s*$/);
		if (muc && muc[1].length >= thut) ra.push(muc[2]);
		else thut = -1;
	}
	return ra;
}

function dung(ma, loi) {
	console.error(loi);
	process.exit(ma);
}

const coSo = git("merge-base", "HEAD", "origin/onehub").trim();
const doi = git("diff", "--name-only", `${coSo}..HEAD`)
	.split("\n")
	.filter((t) => t && !t.startsWith("_acceptance/"));

for (const f of SPEC_DA_KY) {
	const r = spawnSync("git", ["-C", GOC, "diff", "--quiet", coSo, "--", f]);
	if (r.status !== 0) dung(1, `spec da ky bi sua: ${f}`);
}

const thuMuc = join(GOC, "_acceptance");
let daQuet = 0;
const tap = [];
for (const ten of readdirSync(thuMuc)) {
	const hopDong = join(thuMuc, ten, "contract.md");
	const evals = join(thuMuc, ten, "evals.yaml");
	if (ten === SLUG || !existsSync(hopDong) || !existsSync(evals)) continue;
	daQuet += 1;
	const trangThai = readFileSync(hopDong, "utf8").match(
		/^status:\s*(\S+)/m,
	)?.[1];
	if (!DA_KY.has(trangThai ?? "")) continue;
	const khuonDs = duongCua(readFileSync(evals, "utf8")).map(khuon);
	const khop = doi.filter((t) => khuonDs.some((k) => k.test(t)));
	if (khop.length > 0) tap.push({ ten, so: khop.length });
}
console.log(
	`da quet ${daQuet} ho so, ${doi.length} tep doi so voi ${coSo.slice(0, 8)}`,
);
for (const h of tap) console.log(`cham: ${h.ten} (${h.so} tep)`);
if (daQuet === 0 || !tap.some((h) => h.ten === DOI_CHUNG)) {
	dung(1, `bo rut tap hong: tap khong chua ${DOI_CHUNG}`);
}

const fl = execFileSync(
	"node",
	[
		join(GOC, "scripts/resolve-plugin.mjs"),
		"--plugin",
		"feature-loop",
		"--require",
		"scripts/repin-lane.mjs",
	],
	{ encoding: "utf8" },
).trim();
const lan = spawnSync(
	"node",
	[
		join(fl, "scripts/repin-lane.mjs"),
		"--root",
		GOC,
		...tap.flatMap((h) => ["--slug", h.ten]),
		"--reason",
		`${SLUG}: kiem ho so da ky bi cham`,
	],
	{ stdio: "inherit" },
);
process.exit(lan.status ?? 1);
