import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const RA = join(GOC, ".acceptance-runs/ban-gieo-gop-y-sau-nop");
const BANG = join(
	GOC,
	"_acceptance/ban-gieo-gop-y-sau-nop/evidence/ba-ban-do.txt",
);
const KHOA = ["gy_man_that", "r1a_man_chip", "r1d_man_okr"];
const BANG_CHUNG = [
	"_acceptance/gop-y-dung-cho/evidence",
	"_acceptance/khung-okr-truoc-r1/evidence",
	"_acceptance/okr-to-chuc-va/evidence",
];
const DAU_HIEU = /^gieo-gop-y: xong/m;
const KET = /^(KET LUAN\b|KHONG DO DUOC\b|so o: \d+).*$/gm;

export function phanLoai(text) {
	const ket = [...text.matchAll(KET)].map((m) => m[0]);
	return { qua: DAU_HIEU.test(text), ket: ket.at(-1) ?? null };
}

const argv = process.argv.slice(2);
const iPl = argv.indexOf("--phan-loai");
if (iPl >= 0) {
	const tep = argv[iPl + 1];
	if (!tep || !existsSync(tep)) {
		console.log(`KHONG DO DUOC: khong co tep ${tep ?? ""}`);
		process.exit(2);
	}
	const { qua } = phanLoai(readFileSync(tep, "utf8"));
	console.log(qua ? "qua buoc gieo" : "khong qua buoc gieo");
	process.exit(qua ? 0 : 1);
}

const cfg = Bun.YAML.parse(
	readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"),
);
const lenh = KHOA.map((k) => [k, cfg.executors?.script?.[k]]);
const thieu = lenh.filter(([, l]) => !l).map(([k]) => k);
if (thieu.length) {
	console.log(`KHONG DO DUOC: thieu executors.script.${thieu.join(", ")}`);
	process.exit(2);
}

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	process.exit(2);
}

function trangThaiBangChung() {
	const r = spawnSync(
		"git",
		["status", "--porcelain", "--untracked-files=all", "--", ...BANG_CHUNG],
		{ cwd: GOC, encoding: "utf8" },
	);
	if (r.error || r.status !== 0)
		khongDo(
			`git status cua bang chung ba ho so hong (ma ${r.status}): ${(r.stderr || String(r.error ?? "")).trim()}`,
		);
	const dong = new Set(r.stdout.split("\n").filter(Boolean));
	dong.ban = chupBanTruoc(dong);
	return dong;
}

function chupBanTruoc(truoc) {
	const ban = new Map();
	for (const d of truoc) {
		const tep = d.slice(3);
		const duong = join(GOC, tep);
		ban.set(tep, existsSync(duong) ? readFileSync(duong) : null);
	}
	return ban;
}

function giongBan(duong, goc) {
	const co = existsSync(duong);
	if (goc === null) return !co;
	return co && Buffer.compare(readFileSync(duong), goc) === 0;
}

function traBangChung(truoc) {
	const ban = truoc.ban;
	let traBan = 0;
	for (const [tep, goc] of ban) {
		const duong = join(GOC, tep);
		if (giongBan(duong, goc)) continue;
		if (goc === null) rmSync(duong, { force: true });
		else writeFileSync(duong, goc);
		traBan++;
	}
	const moi = [...trangThaiBangChung()].filter(
		(d) => !truoc.has(d) && !ban.has(d.slice(3)),
	);
	const sua = moi.filter((d) => !d.startsWith("??")).map((d) => d.slice(3));
	const them = moi.filter((d) => d.startsWith("??")).map((d) => d.slice(3));
	if (sua.length) {
		const r = spawnSync("git", ["checkout", "--", ...sua], {
			cwd: GOC,
			encoding: "utf8",
		});
		if (r.error || r.status !== 0)
			khongDo(
				`khong tra lai duoc ${sua.length} tep bang chung (ma ${r.status}): ${(r.stderr || String(r.error ?? "")).trim()}`,
			);
	}
	for (const t of them) rmSync(join(GOC, t), { force: true });
	const sau = trangThaiBangChung();
	const con = [...sau].filter((d) => !truoc.has(d));
	if (con.length)
		khongDo(`bang chung con lech sau khi tra lai: ${con.join(", ")}`);
	const lechBan = [...ban].filter(
		([tep, goc]) => !giongBan(join(GOC, tep), goc),
	);
	if (lechBan.length)
		khongDo(
			`tep da ban tu truoc khong ve dung ban truoc lenh: ${lechBan.map(([t]) => t).join(", ")}`,
		);
	return sua.length + them.length + traBan;
}

const iThu = argv.indexOf("--thu-tra");
if (iThu >= 0) {
	const truoc = trangThaiBangChung();
	spawnSync("bash", ["-c", argv[iThu + 1] ?? "true"], { cwd: GOC });
	console.log(`tra lai ${traBangChung(truoc)} tep bang chung`);
	process.exit(0);
}

mkdirSync(RA, { recursive: true });
const dong = [];
const loi = [];
for (const [k, l] of lenh) {
	const truoc = trangThaiBangChung();
	const r = spawnSync("bash", ["-c", l], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 256 << 20,
	});
	const ra = `${r.stdout ?? ""}${r.stderr ?? ""}`;
	writeFileSync(join(RA, `ban-do-${k}.txt`), ra);
	console.log(`tra lai ${traBangChung(truoc)} tep bang chung`);
	const { qua, ket } = phanLoai(ra);
	const d = `${k}: ma ${r.status} · ${ket ?? "(khong co KET LUAN, KHONG DO DUOC hay so o)"}`;
	dong.push(d);
	console.log(d);
	if (ket === null) loi.push(`thieu ket luan: ${k}`);
	if (!qua) loi.push(`khong qua buoc gieo: ${k}`);
}
mkdirSync(dirname(BANG), { recursive: true });
writeFileSync(BANG, `${dong.join("\n")}\n`);
if (loi.length) {
	for (const l of loi) console.log(l);
	process.exit(1);
}
console.log(`ba-ban-do: ${KHOA.length}/${KHOA.length} lenh qua buoc gieo`);
