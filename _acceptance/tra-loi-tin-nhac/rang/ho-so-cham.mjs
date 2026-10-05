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
const THUOC_DO_NHANH = [
	{
		hoSo: "ha-tran-thang-hoi-zalo",
		id: "E7",
		vi: "chay pre-merge-check tren nhanh dang xet, nen do vi chinh cac ho so ma lan ghim nay dang ghim lai",
	},
	{
		hoSo: "slack-thieu-quyen-email",
		id: "E10",
		vi: "doi moi commit rieng cua nhanh dang xet mang ten ho so slack-thieu-quyen-email",
	},
];

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

for (const t of THUOC_DO_NHANH) {
	const tep = join(GOC, "_acceptance", t.hoSo, "evals.yaml");
	const coId =
		existsSync(tep) &&
		new RegExp(`^\\s*- id: ${t.id}\\s*$`, "m").test(readFileSync(tep, "utf8"));
	if (!coId) dung(2, `thuoc do nhanh khong con: ${t.hoSo} ${t.id}`);
}
const laThuocDoNhanh = (ten, id) =>
	THUOC_DO_NHANH.some((t) => t.hoSo === ten && t.id === id);

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
	{ encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
);
const loLan = `${lan.stdout ?? ""}${lan.stderr ?? ""}`;
process.stdout.write(loLan);

if (lan.status === 0) {
	console.log("lan ghim lai xanh tron");
	process.exit(0);
}
const SUITE = /suite \[([\d,]*)\]/;
const suite = SUITE.exec(loLan)?.[1]?.split(",").map(Number) ?? [];
if (suite.length === 0 || suite.some((m) => m !== 0)) {
	dung(1, `suite khong xanh o HEAD: [${suite.join(",")}]`);
}
const DONG = /^\[lane\] (\S+) (E\w+): (.*) → exit (\d+) \(/;
const doHead = loLan
	.split("\n")
	.map((d) => DONG.exec(d))
	.filter((m) => m !== null && m[4] !== "0")
	.map((m) => ({ ten: m[1], id: m[2], lenh: m[3], ma: Number(m[4]) }))
	.filter((d) => {
		if (!laThuocDoNhanh(d.ten, d.id)) return true;
		const t = THUOC_DO_NHANH.find((x) => x.hoSo === d.ten && x.id === d.id);
		console.log(`bo qua thuoc do nhanh: ${d.ten} ${d.id} — ${t?.vi ?? ""}`);
		return false;
	});
console.log(`do o HEAD: ${doHead.length} eval`);
if (doHead.length === 0) process.exit(0);

const cayGoc = join(GOC, ".acceptance-runs", SLUG, "goc");
spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cayGoc]);
git("worktree", "add", "--detach", cayGoc, coSo);
try {
	spawnSync("ln", ["-s", join(GOC, ".env"), join(cayGoc, ".env")]);
	for (const buoc of [["install"], ["run", "db:generate"]]) {
		const r = spawnSync("bun", buoc, { cwd: cayGoc, encoding: "utf8" });
		if (r.status !== 0)
			dung(2, `khong dung duoc cay goc: bun ${buoc.join(" ")}`);
	}
	const moi = [];
	const chapChon = [];
	for (const d of doHead) {
		const lai = spawnSync("bash", ["-c", d.lenh], {
			cwd: GOC,
			encoding: "utf8",
		});
		const maLai = lai.status ?? -1;
		const r = spawnSync("bash", ["-c", d.lenh], {
			cwd: cayGoc,
			encoding: "utf8",
		});
		const maGoc = r.status ?? -1;
		console.log(
			`${d.ten} ${d.id}: HEAD ${d.ma} · HEAD chay lai ${maLai} · merge-base ${maGoc}`,
		);
		if (maLai === 0) chapChon.push(`${d.ten} ${d.id}`);
		else if (maGoc === 0) moi.push(`${d.ten} ${d.id}`);
	}
	if (chapChon.length > 0) {
		console.log(
			`chap chon (xanh khi chay lai tuan tu o HEAD): ${chapChon.join(", ")}`,
		);
	}
	if (moi.length > 0) {
		dung(1, `vong nay lam do them ${moi.length} eval: ${moi.join(", ")}`);
	}
	console.log(`khong eval nao do them so voi ${coSo.slice(0, 8)}`);
} finally {
	spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cayGoc]);
}
