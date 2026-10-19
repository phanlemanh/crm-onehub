import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "lam-moi-chuyen-viec-qua-loi-chung";
const DA_KY = new Set(["signed-off", "machine-cleared"]);
const DIALOG =
	"apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx";
const CACHE = "apps/app/lib/trpc/cache.ts";
const TEP_VONG = [DIALOG, CACHE, "apps/app/test/lam-moi-chuyen-viec.dom.tsx"];
const DOI_CHUNG = [
	{ tep: DIALOG, eval: "moi-phia-deu-thay-ke-hoach:E3" },
	{ tep: CACHE, eval: "thanh-vien-hai-khoi-cung-khuon:E19" },
];
const TRAN_MOT_LENH_MS = 15 * 60_000;
const DONG_DUOI = 6;
const DAU_QUET_LONG = ["worktree", "repin-lane"];
const CAP = Object.freeze({
	goc: "b79513410ffef268b6a45655972f5847cdbd0bda",
	dinh: "100847e8a747d474b79bc10adb82a94e06313f82",
});

function dung(ma, loi) {
	console.log(loi);
	process.exit(ma);
}

const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();

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

function napKit() {
	const r = spawnSync(
		"node",
		[
			join(GOC, "scripts", "resolve-plugin.mjs"),
			"--plugin",
			"acceptance-gate",
			"--require",
			"lib/evidence-core.cjs",
			"--require",
			"lib/eval-yaml.cjs",
		],
		{ cwd: GOC, encoding: "utf8" },
	);
	if (r.status !== 0)
		dung(
			2,
			`KHONG DO DUOC: khong giai duoc goi acceptance-gate — ${(r.stderr ?? "").trim()}`,
		);
	const goc = r.stdout.trim();
	const nap = createRequire(import.meta.url);
	return {
		core: nap(join(goc, "lib", "evidence-core.cjs")),
		Y: nap(join(goc, "lib", "eval-yaml.cjs")),
	};
}

const { core, Y } = napKit();

function docTep(tep) {
	try {
		return readFileSync(tep, "utf8");
	} catch (loi) {
		return dung(2, `KHONG DO DUOC: khong doc duoc ${tep} — ${loi.message}`);
	}
}

const cauHinh = docTep(join(GOC, "_acceptance", "config.yaml"));
const t1 = core
	.resolveConfigList(cauHinh, "risk_tiers.t1_skip_globs")
	.map(khuon);

function giai(ref) {
	const lenh = ref.startsWith("config:")
		? core.resolveConfigKey(cauHinh, ref.slice("config:".length))
		: null;
	return (
		lenh ??
		dung(
			2,
			`KHONG DO DUOC: ref ${ref} khong giai duoc trong _acceptance/config.yaml`,
		)
	);
}

const boNhay = (v) => Y.stripComment(v).replace(/^(["'])(.*)\1$/, "$2");

function docEvals(tep) {
	const chu = docTep(tep);
	return Y.parseEvals(chu, ["executor", "status", "cmd"], boNhay).map((e) => ({
		...e,
		paths: core.evalPathsOf(chu, e.id) ?? [],
	}));
}

const hoSo = [];
for (const ten of readdirSync(join(GOC, "_acceptance"))) {
	const hopDong = join(GOC, "_acceptance", ten, "contract.md");
	const evals = join(GOC, "_acceptance", ten, "evals.yaml");
	if (ten === SLUG || !existsSync(hopDong) || !existsSync(evals)) continue;
	const trangThai =
		/^status:\s*(\S+)/m.exec(readFileSync(hopDong, "utf8"))?.[1] ?? "";
	hoSo.push({ ten, daKy: DA_KY.has(trangThai), evals });
}

const evalsDaKy = hoSo
	.filter((h) => h.daKy)
	.flatMap((h) =>
		docEvals(h.evals)
			.filter((e) => core.isRepinMachineEval(e))
			.map((e) => ({
				id: `${h.ten}:${e.id}`,
				cmd: e.cmd,
				khuon: e.paths.map(khuon),
			})),
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

for (const sha of [CAP.goc, CAP.dinh]) {
	if (
		spawnSync("git", ["-C", GOC, "cat-file", "-e", `${sha}^{commit}`])
			.status !== 0
	)
		dung(2, `KHONG DO DUOC: khong giai duoc cap gop ${sha}`);
}
const coSo = CAP.goc;
const B8 = coSo.slice(0, 8);
const D8 = CAP.dinh.slice(0, 8);

const dThat = git("diff", "--name-only", `${coSo}..${CAP.dinh}`)
	.split("\n")
	.filter(
		(t) => t && !t.startsWith("_acceptance/") && !t1.some((k) => k.test(t)),
	);
console.log(`cap gop ${coSo}..${CAP.dinh} · tep ma doi: ${dThat.join(", ")}`);
const ngoai = dThat.filter((t) => !TEP_VONG.includes(t));
if (ngoai.length > 0) dung(1, `tep ngoai vong: ${ngoai.join(", ")}`);

function laQuetLong(lenh) {
	return [
		...lenh.matchAll(/_acceptance\/[^\s"']+\/rang\/[^\s"']+\.m?[jt]s/g),
	].some((m) => {
		const tep = join(GOC, m[0]);
		if (!existsSync(tep)) return false;
		const nguon = readFileSync(tep, "utf8");
		return DAU_QUET_LONG.some((dau) => nguon.includes(dau));
	});
}

const tap = [...rut(TEP_VONG)].map(([ref, ids]) => ({
	ref,
	ids,
	lenh: giai(ref),
}));
const loai = tap.filter((l) => laQuetLong(l.lenh));
const chay = tap.filter((l) => !laQuetLong(l.lenh));
for (const l of loai)
	console.log(`LOAI quet long: ${l.ref} (${l.ids.join(" ")})`);
console.log(
	`da quet ${hoSo.length} ho so (${hoSo.filter((h) => h.daKy).length} da ky), ${tap.reduce((n, l) => n + l.ids.length, 0)} eval, ${chay.length} lenh chay, ${loai.length} lenh loai`,
);

const conNgoai = spawnSync(
	"git",
	["-C", GOC, "rev-list", "-n", "1", CAP.dinh, "--not", "HEAD"],
	{ encoding: "utf8" },
);
if (conNgoai.status === 0 && conNgoai.stdout.trim() === "")
	dung(
		0,
		`vong da len onehub o ${D8} — ve chay lai lenh cua ho so khac do luot kiem cheo dem kiem-cheo-sau-gop tra loi; ma 0`,
	);

function thi(lenh, cwd) {
	const batDau = Date.now();
	const r = spawnSync("bash", ["-c", lenh], {
		cwd,
		encoding: "utf8",
		maxBuffer: 256 * 1024 * 1024,
		timeout: TRAN_MOT_LENH_MS,
	});
	const duoi = `${r.stdout ?? ""}${r.stderr ?? ""}`
		.trim()
		.split("\n")
		.slice(-DONG_DUOI)
		.join("\n    ");
	return {
		ma: r.status ?? -1,
		giay: Math.round((Date.now() - batDau) / 1000),
		duoi,
	};
}

const doHead = [];
for (const l of chay) {
	const kq = thi(l.lenh, GOC);
	console.log(
		`HEAD ${kq.ma === 0 ? "xanh" : `do ${kq.ma}`} ${kq.giay}s ${l.ref} (${l.ids.join(" ")})`,
	);
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
		(buoc) =>
			spawnSync("bun", buoc, { cwd: cayGoc, encoding: "utf8" }).status !== 0,
	);
	if (buocHong) {
		ket = {
			ma: 2,
			cau: `KHONG DO DUOC: khong dung duoc cay goc — bun ${buocHong.join(" ")}`,
		};
	} else {
		const moi = [];
		for (const l of doHead) {
			const kq = thi(l.lenh, cayGoc);
			console.log(
				`${B8} ${kq.ma === 0 ? "xanh" : `do ${kq.ma}`} ${kq.giay}s ${l.ref} (HEAD do ${l.ma})`,
			);
			if (kq.ma === 0) moi.push(`${l.ref} (${l.ids.join(" ")})`);
		}
		ket =
			moi.length > 0
				? {
						ma: 1,
						cau: `vong nay lam do them ${moi.length} lenh: ${moi.join(", ")}`,
					}
				: {
						ma: 0,
						cau: `khong lenh nao do them so voi ${B8} — ${doHead.length} lenh do san o ca hai cay`,
					};
	}
} finally {
	spawnSync("git", ["-C", GOC, "worktree", "remove", "--force", cayGoc]);
}
dung(ket.ma, ket.cau);
