import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "lam-moi-chuyen-viec-qua-loi-chung";
const DA_KY = new Set(["signed-off", "machine-cleared"]);
const MAY = new Set(["test", "script"]);
const DIALOG = "apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx";
const CACHE = "apps/app/lib/trpc/cache.ts";
const TEP_VONG = [DIALOG, CACHE, "apps/app/test/lam-moi-chuyen-viec.dom.tsx"];
const DOI_CHUNG = [
	{ tep: DIALOG, eval: "moi-phia-deu-thay-ke-hoach:E3" },
	{ tep: CACHE, eval: "thanh-vien-hai-khoi-cung-khuon:E19" },
];
const TRAN_MOT_LENH_MS = 15 * 60_000;
const DONG_DUOI = 6;

function dung(ma, loi) {
	console.log(loi);
	process.exit(ma);
}

const git = (...a) => execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();

function khuon(glob) {
	let re = "";
	for (let i = 0; i < glob.length; i++) {
		const c = glob[i];
		if (c === "*") {
			if (glob[i + 1] === "*") {
				re += ".*";
				i++;
				if (glob[i + 1] === "/") i++;
			} else re += "[^/]*";
		} else if (c === "?") re += "[^/]";
		else if (".+^$()[]{}|\\".includes(c)) re += `\\${c}`;
		else re += c;
	}
	return new RegExp(`^${re}$`);
}

function docYaml(tep) {
	try {
		return Bun.YAML.parse(readFileSync(tep, "utf8"));
	} catch (loi) {
		return dung(2, `KHONG DO DUOC: khong doc duoc ${tep} — ${loi.message}`);
	}
}

const cauHinh = docYaml(join(GOC, "_acceptance", "config.yaml"));
const t1 = (cauHinh.risk_tiers?.t1_skip_globs ?? []).map(khuon);

function giai(ref) {
	const duong = ref.replace(/^config:/, "").split(".");
	const lenh = duong.reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), cauHinh);
	if (typeof lenh !== "string") dung(2, `KHONG DO DUOC: ref ${ref} khong giai duoc trong _acceptance/config.yaml`);
	return lenh;
}

const hoSo = [];
for (const ten of readdirSync(join(GOC, "_acceptance"))) {
	const hopDong = join(GOC, "_acceptance", ten, "contract.md");
	const evals = join(GOC, "_acceptance", ten, "evals.yaml");
	if (ten === SLUG || !existsSync(hopDong) || !existsSync(evals)) continue;
	const trangThai = /^status:\s*(\S+)/m.exec(readFileSync(hopDong, "utf8"))?.[1] ?? "";
	hoSo.push({ ten, daKy: DA_KY.has(trangThai), evals });
}

const evalsDaKy = hoSo
	.filter((h) => h.daKy)
	.flatMap((h) =>
		(docYaml(h.evals).evals ?? [])
			.filter((e) => MAY.has(e.executor) && e.status !== "not-run")
			.map((e) => ({ id: `${h.ten}:${e.id}`, cmd: e.cmd, khuon: (e.paths ?? []).map(khuon) })),
	);

function rut(tep) {
	const tap = new Map();
	for (const e of evalsDaKy) {
		if (!e.khuon.some((k) => tep.some((t) => k.test(t)))) continue;
		const cu = tap.get(e.cmd) ?? [];
		tap.set(e.cmd, [...cu, e.id]);
	}
	return tap;
}

for (const { tep, eval: id } of DOI_CHUNG) {
	const co = [...rut([tep]).values()].some((ids) => ids.includes(id));
	if (!co) dung(1, `bo rut tap hong: rut([${tep}]) khong chua ${id}`);
	console.log(`DOI CHUNG DUONG rut([${tep}]) chua ${id}`);
}

const coSo = git("merge-base", "HEAD", "origin/onehub");
const B8 = coSo.slice(0, 8);
const khongDoi = spawnSync("git", ["-C", GOC, "diff", "--quiet", coSo, "HEAD", "--", ...TEP_VONG]);
if (khongDoi.status === 0) dung(0, `vong nay khong con khac biet so voi ${B8} o ${TEP_VONG.length} tep cua vong — khong co gi de so, ma 0`);

const dThat = git("diff", "--name-only", `${coSo}..HEAD`)
	.split("\n")
	.filter((t) => t && !t.startsWith("_acceptance/") && !t1.some((k) => k.test(t)));
console.log(`B ${B8} · tep ma doi: ${dThat.join(", ")}`);
const ngoai = dThat.filter((t) => !TEP_VONG.includes(t));
if (ngoai.length > 0) dung(1, `tep ngoai vong: ${ngoai.join(", ")}`);

function laQuetLong(lenh) {
	return [...lenh.matchAll(/_acceptance\/[^\s"']+\/rang\/[^\s"']+\.m?[jt]s/g)].some((m) => {
		const tep = join(GOC, m[0]);
		return existsSync(tep) && readFileSync(tep, "utf8").includes("worktree");
	});
}

const tap = [...rut(TEP_VONG)].map(([ref, ids]) => ({ ref, ids, lenh: giai(ref) }));
const loai = tap.filter((l) => laQuetLong(l.lenh));
const chay = tap.filter((l) => !laQuetLong(l.lenh));
for (const l of loai) console.log(`LOAI quet long: ${l.ref} (${l.ids.join(" ")})`);
console.log(
	`da quet ${hoSo.length} ho so (${hoSo.filter((h) => h.daKy).length} da ky), ${tap.reduce((n, l) => n + l.ids.length, 0)} eval, ${chay.length} lenh chay, ${loai.length} lenh loai`,
);

function thi(lenh, cwd) {
	const batDau = Date.now();
	const r = spawnSync("bash", ["-c", lenh], {
		cwd,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
		timeout: TRAN_MOT_LENH_MS,
	});
	const duoi = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n").slice(-DONG_DUOI).join("\n    ");
	return { ma: r.status ?? -1, giay: Math.round((Date.now() - batDau) / 1000), duoi };
}

const doHead = [];
for (const l of chay) {
	const kq = thi(l.lenh, GOC);
	console.log(`HEAD ${kq.ma === 0 ? "xanh" : `do ${kq.ma}`} ${kq.giay}s ${l.ref} (${l.ids.join(" ")})`);
	if (kq.ma === 0) continue;
	const lai = thi(l.lenh, GOC);
	if (lai.ma === 0) {
		console.log(`  chap chon: xanh khi chay lai o HEAD`);
		continue;
	}
	console.log(`  van do ${lai.ma} khi chay lai:\n    ${lai.duoi}`);
	doHead.push({ ...l, ma: lai.ma });
}
console.log(`do o HEAD sau chay lai: ${doHead.length} lenh`);
if (doHead.length === 0) dung(0, `khong lenh nao do them so voi ${B8}`);

const cayGoc = join(GOC, ".acceptance-runs", SLUG, "goc");
spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cayGoc]);
git("worktree", "add", "--detach", cayGoc, coSo);
let ket = { ma: 2, cau: "KHONG DO DUOC: luot so cay goc dung giua chung" };
try {
	spawnSync("ln", ["-s", join(GOC, ".env"), join(cayGoc, ".env")]);
	const buocHong = [["install"], ["run", "db:generate"]].find(
		(buoc) => spawnSync("bun", buoc, { cwd: cayGoc, encoding: "utf8" }).status !== 0,
	);
	if (buocHong) {
		ket = { ma: 2, cau: `KHONG DO DUOC: khong dung duoc cay goc — bun ${buocHong.join(" ")}` };
	} else {
		const moi = [];
		for (const l of doHead) {
			const kq = thi(l.lenh, cayGoc);
			console.log(`${B8} ${kq.ma === 0 ? "xanh" : `do ${kq.ma}`} ${kq.giay}s ${l.ref} (HEAD do ${l.ma})`);
			if (kq.ma === 0) moi.push(`${l.ref} (${l.ids.join(" ")})`);
		}
		ket =
			moi.length > 0
				? { ma: 1, cau: `vong nay lam do them ${moi.length} lenh: ${moi.join(", ")}` }
				: { ma: 0, cau: `khong lenh nao do them so voi ${B8} — ${doHead.length} lenh do san o ca hai cay` };
	}
} finally {
	spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cayGoc]);
}
dung(ket.ma, ket.cau);
