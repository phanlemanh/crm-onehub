import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	appendFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC_THAT = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
);
const { parseEvals } = createRequire(import.meta.url)(
	join(GOC_THAT, "lib/eval-yaml.cjs"),
);

const HSC = {
	slug: "muc-tieu-va-kr",
	nhanhChinh: "origin/onehub",
	daKy: new Set(["signed-off", "machine-cleared"]),
	chayDuoc: new Set(["test", "script", "ui-check"]),
	danhSach: {
		"dat-okr-trong-crm": ["E11", "E12", "E13", "E20"],
		"so-okr-tu-chay": ["E11", "E12", "E13"],
		"canh-kr-okr": ["E11", "E12", "E13"],
		"khep-ky-okr": ["E3", "E4", "E7"],
		"cap-nhat-tuan-okr": ["E18", "E29"],
		"gioi-han-duyet-cay-okr": ["E15", "E17"],
		"ux-lai-thu-8c-okr": ["E2", "E3", "E5", "E6", "E9", "E13", "E14", "E15"],
		"toan-canh-okr": ["E2", "E3", "E7", "E14", "E23"],
		"no-sau-luot-5-okr": ["E10"],
		"no-sau-luot-4-okr": ["E8"],
		"khung-tao-okr-nhu-deal": ["E2", "E11", "E12", "E22"],
		"hop-thoai-giu-cho-dang-nhap": ["E8", "E9"],
		"okr-soat-anh-luot-3": ["E1", "E2"],
		"thanh-vien-hai-khoi-cung-khuon": ["E17"],
	},
	boRa: {
		"khung-tao-okr-nhu-deal/E18":
			"thuoc chay thuoc: rang/thuoc-cu.mjs tu chay eval cua ba ho so khac",
		"okr-soat-anh-luot-3/E12":
			"luat pham vi vong: rang/san-thiet-ke.mjs do diff merge-base cua vong do",
		"okr-soat-anh-luot-3/E13":
			"luat pham vi vong: rang/soi-ma.mjs do dong moi trong diff merge-base cua vong do",
	},
	cam: /ho-so-cham\.mjs|khong-hoi-quy\.mjs|repin-lane\.mjs|thuoc-cu\.mjs/,
	phaThu: {
		tep: "apps/app/app/(app)/[slug]/okr/khoi-muc-tieu.tsx",
		tu: "<div data-muc-tieu={mucTieu.id}>",
		thanh: "<div>",
	},
	ra: ".acceptance-runs/muc-tieu-va-kr/ho-so-cham",
	tranMs: 40 * 60 * 1000,
};

const kiemDoDo = process.argv.includes("--kiem-do-do");
for (const tinHieu of ["SIGINT", "SIGTERM", "SIGHUP"])
	process.on(tinHieu, () => {
		console.error(`bi ngat: ${tinHieu}`);
		ket(130);
	});
const git = (cwd, ...a) =>
	execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8" });

const caySao = [];
const viecDon = [];

function ket(ma) {
	for (const v of viecDon) v();
	for (const c of caySao)
		spawnSync("git", ["-C", GOC_THAT, "worktree", "remove", "--force", c]);
	if (process.env.HSC_DONG_KET) appendFileSync(process.env.HSC_DONG_KET, `EXIT ${ma}\n`);
	process.exit(ma);
}

function dung(ma, loi) {
	console.error(loi);
	ket(ma);
}

const CAU_HINH = readFileSync(
	join(GOC_THAT, "_acceptance/config.yaml"),
	"utf8",
);

function giaiLenh(ref) {
	const m = ref.match(/^config:executors\.([\w-]+)\.([\w-]+)$/);
	if (!m) return ref;
	const dong = CAU_HINH.split("\n");
	const dau = dong.findIndex((d) => d === `  ${m[1]}:`);
	if (dau < 0) return null;
	for (let i = dau + 1; i < dong.length; i += 1) {
		if (/^ {0,2}\S/.test(dong[i])) break;
		const k = dong[i].match(/^ {4}([\w-]+):\s*(.*)$/);
		if (!k || k[1] !== m[2]) continue;
		const gia = k[2].trim();
		if (gia.startsWith("'") && gia.endsWith("'"))
			return gia.slice(1, -1).replace(/''/g, "'");
		if (gia.startsWith('"') && gia.endsWith('"')) return JSON.parse(gia);
		return gia;
	}
	return null;
}

function trangThai(slug) {
	const p = join(GOC_THAT, "_acceptance", slug, "contract.md");
	if (!existsSync(p)) return null;
	return readFileSync(p, "utf8").match(/^status:\s*(\S+)/m)?.[1] ?? null;
}

const coSo = git(GOC_THAT, "merge-base", "HEAD", HSC.nhanhChinh).trim();
const sha = git(GOC_THAT, "rev-parse", "HEAD").trim();

const can = [];
for (const [slug, ids] of Object.entries(HSC.danhSach)) {
	if (!HSC.daKy.has(trangThai(slug) ?? ""))
		dung(2, `danh sach viet truoc co ho so chua ky: ${slug}`);
	for (const id of ids) {
		if (HSC.boRa[`${slug}/${id}`])
			dung(2, `eval vua o danh sach vua o boRa: ${slug}/${id}`);
		can.push({ slug, id });
	}
}
for (const [e, lyDo] of Object.entries(HSC.boRa)) console.log(`bo ra: ${e} — ${lyDo}`);

const theoLenh = new Map();
const boQua = [];
for (const { slug, id } of can) {
	const ev = parseEvals(
		readFileSync(join(GOC_THAT, "_acceptance", slug, "evals.yaml"), "utf8"),
		["cmd", "executor", "status"],
	).find((e) => e.id === id);
	if (!ev) dung(2, `khong thay eval ${slug}/${id}`);
	if (!HSC.chayDuoc.has(ev.executor) || ev.status === "not-run") {
		boQua.push(`${slug}/${id} (${ev.executor}${ev.status ? `, ${ev.status}` : ""})`);
		continue;
	}
	const lenh = giaiLenh(ev.cmd);
	if (!lenh) dung(2, `khong giai duoc lenh ${ev.cmd} cua ${slug}/${id}`);
	if (HSC.cam.test(lenh))
		dung(2, `thuoc chay thuoc trong danh sach: ${slug}/${id} :: ${lenh.slice(0, 120)}`);
	if (!theoLenh.has(lenh)) theoLenh.set(lenh, []);
	theoLenh.get(lenh).push(`${slug}/${id}`);
}
for (const b of boQua) console.log(`khong chay duoc trong lan may: ${b}`);
const soEval = [...theoLenh.values()].reduce((s, d) => s + d.length, 0);
console.log(
	`merge-base ${coSo.slice(0, 8)} · dinh ${sha.slice(0, 12)} · danh sach ${can.length} eval = se chay ${soEval} (qua ${theoLenh.size} lenh rieng) + khong chay duoc ${boQua.length} · bo ra ${Object.keys(HSC.boRa).length}`,
);
if (soEval + boQua.length !== can.length)
	dung(2, `lech dem: ${soEval} + ${boQua.length} != ${can.length}`);
if (process.argv.includes("--chi-liet")) {
	for (const [lenh, evs] of theoLenh)
		console.log(`- ${evs.join(", ")} :: ${lenh.slice(0, 140)}`);
	ket(0);
}

const thuMucRa = join(GOC_THAT, HSC.ra);
mkdirSync(thuMucRa, { recursive: true });
const luot = process.env.HSC_LUOT ?? "mac-dinh";
const soHead = join(thuMucRa, `ket-qua-${sha.slice(0, 12)}-${luot}.jsonl`);
const soGoc = join(thuMucRa, `ket-qua-goc-${coSo.slice(0, 12)}.jsonl`);
const khoaChay = join(thuMucRa, `dang-chay-${sha.slice(0, 12)}-${luot}.pid`);
const conSong = (pid) => {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
};
if (!kiemDoDo) {
	while (existsSync(khoaChay)) {
		const pid = Number(readFileSync(khoaChay, "utf8").trim());
		if (!conSong(pid) || pid === process.pid) break;
		console.log(`dang co luot khac chay (pid ${pid}) cung dinh va luot — cho no xong roi doc so`);
		spawnSync("sleep", ["30"]);
	}
	writeFileSync(khoaChay, String(process.pid));
	viecDon.push(() => rmSync(khoaChay, { force: true }));
}
const docSo = (p) => {
	const m = new Map();
	if (!kiemDoDo && existsSync(p))
		for (const dong of readFileSync(p, "utf8").split("\n"))
			if (dong.trim()) {
				const d = JSON.parse(dong);
				m.set(d.khoa, d.ma);
			}
	return m;
};
const daCoHead = docSo(soHead);
const daCoGoc = docSo(soGoc);
console.log(
	`so ket qua: ${daCoHead.size} lenh o dinh (${soHead.split("/").pop()}), ${daCoGoc.size} lenh o merge-base (${soGoc.split("/").pop()})`,
);

const bam = (lenh) => createHash("sha256").update(lenh).digest("hex").slice(0, 10);

function chay(lenh, cwd, nhan) {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd,
		env: { ...process.env, PHIEN_DO_TEN_CAY: `hsc-${nhan}` },
		encoding: "utf8",
		timeout: HSC.tranMs,
		maxBuffer: 256 * 1024 * 1024,
	});
	const ma = r.status ?? (r.signal ? 124 : -1);
	writeFileSync(
		join(thuMucRa, `${nhan}.log`),
		`$ ${lenh}\n${r.stdout ?? ""}${r.stderr ?? ""}\nEXIT ${ma}\n`,
	);
	return ma;
}

function datCay(ten, moc) {
	const cay = join(GOC_THAT, ".acceptance-runs", HSC.slug, ten);
	spawnSync("git", ["-C", GOC_THAT, "worktree", "remove", "--force", cay]);
	rmSync(cay, { recursive: true, force: true });
	git(GOC_THAT, "worktree", "add", "--detach", cay, moc);
	caySao.push(cay);
	spawnSync("ln", ["-s", join(GOC_THAT, ".env"), join(cay, ".env")]);
	for (const buoc of [["install"], ["run", "db:generate"]]) {
		const r = spawnSync("bun", buoc, { cwd: cay, encoding: "utf8" });
		if (r.status !== 0) dung(2, `khong dung duoc cay ${ten}: bun ${buoc.join(" ")}`);
	}
	return cay;
}

function lamSach(cay) {
	git(cay, "checkout", "-q", "--", ".");
	git(cay, "clean", "-fdq");
}

function luoiCay(ten, moc) {
	let cay = null;
	return () => {
		if (!cay) {
			cay = datCay(ten, moc);
			console.log(`cay dong bang ${ten} o ${moc.slice(0, 12)}: ${cay}`);
		}
		return cay;
	};
}
const cayHead = luoiCay("head", sha);
const cayB = luoiCay("goc", coSo);

function chayGhi(lenh, layCay, loai, so, daCo) {
	const khoa = `${loai}-${bam(lenh)}`;
	if (daCo.has(khoa)) return { ma: daCo.get(khoa), cu: true };
	const cwd = layCay();
	lamSach(cwd);
	const ma = chay(lenh, cwd, khoa);
	daCo.set(khoa, ma);
	if (!kiemDoDo) appendFileSync(so, `${JSON.stringify({ khoa, ma })}\n`);
	return { ma, cu: false };
}

const vietTruoc = [...theoLenh.entries()].sort(
	(a, b) => Number(a[0].includes("tien-de")) - Number(b[0].includes("tien-de")),
);

if (kiemDoDo) {
	const cayPha = datCay("pha-thu", sha);
	const tep = join(cayPha, HSC.phaThu.tep);
	const goc = readFileSync(tep, "utf8");
	if (!goc.includes(HSC.phaThu.tu)) dung(2, `khong thay cho pha thu trong ${HSC.phaThu.tep}`);
	const pha = () => {
		lamSach(cayPha);
		writeFileSync(tep, goc.replace(HSC.phaThu.tu, HSC.phaThu.thanh));
	};
	console.log(`kiem do do: xoa data-muc-tieu khoi ${HSC.phaThu.tep} trong ban sao truoc moi lenh`);
	let k = 0;
	for (const [lenh, evs] of vietTruoc) {
		k += 1;
		pha();
		const maPha = chay(lenh, cayPha, `pha-${k}`);
		console.log(`[pha ${k}] ban pha exit ${maPha}: ${evs.join(", ")}`);
		if (maPha === 0) continue;
		lamSach(cayHead());
		const maNguyen = chay(lenh, cayHead(), `nguyen-${k}`);
		console.log(`[pha ${k}] HEAD nguyen exit ${maNguyen}`);
		if (maNguyen !== 0) {
			console.log(`khong quy duoc cho phan bi pha (do ca tren HEAD nguyen): ${evs.join(", ")}`);
			continue;
		}
		for (const e of evs) console.log(`hoi quy: ${e}`);
		console.log("kiem do do: thuoc bat duoc hoi quy, quy dung cho phan bi pha");
		ket(1);
	}
	dung(3, "kiem do do: khong eval viet truoc nao do vi phan bi pha — thuoc khong bat duoc hoi quy");
}

const doHead = [];
let daChay = 0;
let i = 0;
for (const [lenh, evs] of vietTruoc) {
	i += 1;
	const { ma, cu } = chayGhi(lenh, cayHead, "head", soHead, daCoHead);
	daChay += evs.length;
	console.log(`[${i}/${theoLenh.size}] HEAD exit ${ma}${cu ? " (da co)" : ""}: ${evs.join(", ")}`);
	if (ma !== 0) doHead.push({ lenh, evs, ma });
}
console.log(`da chay ${daChay}/${soEval} eval; do o HEAD: ${doHead.length} lenh`);
if (daChay !== soEval) dung(2, `lech dem: da chay ${daChay} != ${soEval}`);

const dem = { hoiQuy: 0, doSan: 0, chapChon: 0 };
const hoiQuy = [];
for (const d of doHead) {
	const { ma: maB, cu: cuB } = chayGhi(d.lenh, cayB, "goc", soGoc, daCoGoc);
	if (maB !== 0) {
		console.log(`HEAD ${d.ma} · merge-base ${maB}${cuB ? " (so goc)" : ""}: ${d.evs.join(", ")}`);
		for (const e of d.evs) {
			dem.doSan += 1;
			console.log(`do san o B: ${e}`);
		}
		continue;
	}
	const lai = chayGhi(d.lenh, cayHead, "head-lai", soHead, daCoHead).ma;
	console.log(`HEAD ${d.ma} · merge-base 0 · HEAD chay lai ${lai}: ${d.evs.join(", ")}`);
	for (const e of d.evs) {
		if (lai === 0) {
			dem.chapChon += 1;
			console.log(`chap chon: ${e}`);
		} else {
			dem.hoiQuy += 1;
			hoiQuy.push(e);
			console.log(`hoi quy: ${e}`);
		}
	}
}
console.log(
	`tong ${soEval} eval: xanh o HEAD ${soEval - doHead.reduce((s, d) => s + d.evs.length, 0)} · chap chon ${dem.chapChon} · do san o B ${dem.doSan} · hoi quy ${dem.hoiQuy}`,
);
if (hoiQuy.length > 0) ket(1);
console.log(`khong eval nao do o HEAD ma xanh o ${coSo.slice(0, 8)}`);
ket(0);
