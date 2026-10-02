import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	appendFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
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
const GOC = process.env.GOC_KHO ?? GOC_THAT;
const nap = createRequire(import.meta.url);
const { parseEvals } = nap(join(GOC_THAT, "lib/eval-yaml.cjs"));
const { parseFlowValue } = nap(join(GOC_THAT, "lib/evidence-core.cjs"));

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
		"khung-tao-okr-nhu-deal": ["E2", "E11", "E12", "E18", "E22"],
		"hop-thoai-giu-cho-dang-nhap": ["E8", "E9"],
		"okr-soat-anh-luot-3": ["E1", "E2", "E12", "E13"],
		"thanh-vien-hai-khoi-cung-khuon": ["E17"],
	},
	phaThu: {
		tep: "apps/app/app/(app)/[slug]/okr/khoi-muc-tieu.tsx",
		tu: "<div data-muc-tieu={mucTieu.id}>",
		thanh: "<div>",
	},
	mien: {
		"cap-nhat-tuan-okr/E25": {
			tep: ["packages/ui/src/components/simple-table.tsx"],
			lyDo: "luat rieng cua vong cap-nhat-tuan-okr (diff vong do khong sua packages/ui); vong nay sua simple-table.tsx theo AC-8",
		},
		"doi-ten-onehub-center/E14": {
			tep: ["apps/app/app/proto/_modules/muc-tieu-va-kr"],
			lyDo: "luat rieng cua vong doi-ten-onehub-center (diff vong do khong cham proto khac); docs/proto.md: ban mau o lai kho vinh vien, vong nay them proto muc-tieu-va-kr cho design-pass",
		},
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
	process.exit(ma);
}

function dung(ma, loi) {
	console.error(loi);
	ket(ma);
}

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

function duongCua(khoi) {
	const motDong = khoi.match(/^\s*paths:\s*(\[.*\])\s*$/m);
	if (motDong) {
		const pv = parseFlowValue(motDong[1]);
		if (pv.kind !== "seq") dung(2, `khong doc duoc paths: ${motDong[1].slice(0, 80)}`);
		return pv.items;
	}
	const ra = [];
	let thut = -1;
	for (const dong of khoi.split("\n")) {
		const mo = dong.match(/^(\s*)paths:\s*$/);
		if (mo) {
			thut = mo[1].length;
			continue;
		}
		if (thut < 0) continue;
		const muc = dong.match(/^(\s*)-\s+(.+?)\s*$/);
		if (muc && muc[1].length >= thut) ra.push(parseFlowValue(muc[2]).value);
		else thut = -1;
	}
	return ra;
}

function khoiEval(text) {
	const ra = new Map();
	const phan = text.split(/\n(?=\s*-\s+id:)/);
	for (const p of phan) {
		const id = p.match(/^\s*-\s+id:\s*(\S+)/m)?.[1];
		if (id) ra.set(id, p);
	}
	return ra;
}

const CAU_HINH = readFileSync(
	join(GOC_THAT, "_acceptance/config.yaml"),
	"utf8",
);

function giaiLenh(ref) {
	const m = ref.match(/^config:executors\.([\w-]+)\.([\w-]+)$/);
	if (!m) return ref;
	const dong = CAU_HINH.split("\n");
	const dau = dong.findIndex((d) => d === "  " + m[1] + ":");
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
const doi = git(GOC_THAT, "diff", "--name-only", `${coSo}..HEAD`)
	.split("\n")
	.filter((t) => t && !t.startsWith("_acceptance/"));
console.log(
	`merge-base ${coSo.slice(0, 8)}, ${doi.length} tep doi ngoai _acceptance`,
);

const can = new Map();
const them = (slug, id) => {
	const k = `${slug}/${id}`;
	if (!can.has(k)) can.set(k, { slug, id });
};
for (const [slug, ids] of Object.entries(HSC.danhSach)) {
	if (!HSC.daKy.has(trangThai(slug) ?? ""))
		dung(1, `danh sach viet truoc co ho so chua ky: ${slug}`);
	for (const id of ids) them(slug, id);
}
const soVietTruoc = can.size;
const congThem = [];
for (const slug of readdirSync(join(GOC_THAT, "_acceptance"))) {
	if (slug === HSC.slug || !HSC.daKy.has(trangThai(slug) ?? "")) continue;
	const p = join(GOC_THAT, "_acceptance", slug, "evals.yaml");
	if (!existsSync(p)) continue;
	for (const [id, khoi] of khoiEval(readFileSync(p, "utf8"))) {
		const ks = duongCua(khoi).map(khuon);
		if (ks.length > 0 && doi.some((t) => ks.some((k) => k.test(t)))) {
			if (!can.has(`${slug}/${id}`)) congThem.push(`${slug}/${id}`);
			them(slug, id);
		}
	}
}
console.log(
	`danh sach viet truoc: ${soVietTruoc} eval; cong them theo paths: ${congThem.length}`,
);
for (const k of congThem) console.log(`cong them: ${k}`);

const theoLenh = new Map();
const boQua = [];
for (const { slug, id } of can.values()) {
	const ev = parseEvals(
		readFileSync(join(GOC_THAT, "_acceptance", slug, "evals.yaml"), "utf8"),
		["cmd", "executor", "status"],
	).find((e) => e.id === id);
	if (!ev) dung(1, `khong thay eval ${slug}/${id}`);
	if (!HSC.chayDuoc.has(ev.executor) || ev.status === "not-run") {
		boQua.push(
			`${slug}/${id} (${ev.executor}${ev.status ? `, ${ev.status}` : ""})`,
		);
		continue;
	}
	const lenh = giaiLenh(ev.cmd);
	if (!lenh) dung(1, `khong giai duoc lenh ${ev.cmd} cua ${slug}/${id}`);
	if (!theoLenh.has(lenh)) theoLenh.set(lenh, []);
	theoLenh.get(lenh).push(`${slug}/${id}`);
}
for (const b of boQua) console.log(`khong chay duoc trong lan may: ${b}`);
const soEval = [...theoLenh.values()].reduce((s, d) => s + d.length, 0);
console.log(
	`danh sach ${can.size} eval = se chay ${soEval} (qua ${theoLenh.size} lenh rieng) + khong chay duoc ${boQua.length}`,
);
if (soEval + boQua.length !== can.size)
	dung(2, `lech dem: ${soEval} + ${boQua.length} != ${can.size}`);
for (const e of Object.keys(HSC.mien))
	if (!can.has(e)) dung(2, `mien khai cho eval ngoai danh sach: ${e}`);
if (process.argv.includes("--chi-liet")) {
	for (const [lenh, evs] of theoLenh) console.log(`- ${evs.join(", ")} :: ${lenh.slice(0, 140)}`);
	ket(0);
}
const thuMucRa = join(GOC_THAT, HSC.ra);
mkdirSync(thuMucRa, { recursive: true });
const sha = git(GOC_THAT, "rev-parse", "HEAD").trim();
const luot = process.env.HSC_LUOT ?? "mac-dinh";
const soKetQua = join(thuMucRa, `ket-qua-${sha.slice(0, 12)}-${luot}.jsonl`);
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
const daCo = new Map();
if (!kiemDoDo && existsSync(soKetQua))
	for (const dong of readFileSync(soKetQua, "utf8").split("\n"))
		if (dong.trim()) {
			const d = JSON.parse(dong);
			daCo.set(d.khoa, d.ma);
		}
console.log(
	`dinh ${sha.slice(0, 12)} · luot ${luot} · ${daCo.size} ket qua da co trong ${HSC.ra}`,
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

function lamSach(cay) {
	git(cay, "checkout", "-q", "--", ".");
	git(cay, "clean", "-fdq");
}

function chayGhi(lenh, layCay, loai) {
	const khoa = `${loai}-${bam(lenh)}`;
	if (daCo.has(khoa)) return { ma: daCo.get(khoa), cu: true };
	const cwd = layCay();
	lamSach(cwd);
	const ma = chay(lenh, cwd, khoa);
	daCo.set(khoa, ma);
	if (!kiemDoDo) appendFileSync(soKetQua, `${JSON.stringify({ khoa, ma })}\n`);
	return { ma, cu: false };
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
		if (r.status !== 0)
			dung(2, `khong dung duoc cay ${ten}: bun ${buoc.join(" ")}`);
	}
	return cay;
}

const vietTruoc = (evs) =>
	evs.some((e) => HSC.danhSach[e.split("/")[0]]?.includes(e.split("/")[1]));
const hang = ([lenh, evs]) =>
	Number(lenh.includes("tien-de")) * 2 + Number(!vietTruoc(evs));
const lenhXep = [...theoLenh.entries()].sort((a, b) => hang(a) - hang(b));

let cayHeadDung = null;
const cayHead = () => {
	if (!cayHeadDung) {
		cayHeadDung = datCay("head", sha);
		console.log(`cay dong bang o ${sha.slice(0, 12)}: ${cayHeadDung}`);
	}
	return cayHeadDung;
};

if (kiemDoDo) {
	const cayPha = datCay("pha-thu", sha);
	const tep = join(cayPha, HSC.phaThu.tep);
	const goc = readFileSync(tep, "utf8");
	if (!goc.includes(HSC.phaThu.tu))
		dung(2, `khong thay cho pha thu trong ${HSC.phaThu.tep}`);
	const pha = () => {
		lamSach(cayPha);
		writeFileSync(tep, goc.replace(HSC.phaThu.tu, HSC.phaThu.thanh));
	};
	console.log(`kiem do do: xoa data-muc-tieu khoi ${HSC.phaThu.tep} trong ban sao truoc moi lenh`);
	let k = 0;
	for (const [lenh, evs] of lenhXep.filter(([, evs]) => vietTruoc(evs))) {
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
for (const [lenh, evs] of lenhXep) {
	i += 1;
	const { ma, cu } = chayGhi(lenh, cayHead, "head");
	daChay += evs.length;
	console.log(`[${i}/${theoLenh.size}] HEAD exit ${ma}${cu ? " (da co)" : ""}: ${evs.join(", ")}`);
	if (ma !== 0) doHead.push({ lenh, evs, ma });
}
console.log(`da chay ${daChay}/${soEval} eval; do o HEAD: ${doHead.length} lenh`);
if (daChay !== soEval) dung(2, `lech dem: da chay ${daChay} != ${soEval}`);

const dem = { hoiQuy: 0, doSan: 0, chapChon: 0, mien: 0 };
const hoiQuy = [];
let cayB = null;
let cayMien = null;
for (const d of doHead) {
	const lai = chayGhi(d.lenh, cayHead, "head-lai").ma;
	if (lai === 0) {
		dem.chapChon += d.evs.length;
		console.log(`chap chon: ${d.evs.join(", ")}`);
		continue;
	}
	const maB = chayGhi(
		d.lenh,
		() => {
			cayB ??= datCay("goc", coSo);
			return cayB;
		},
		"goc",
	).ma;
	console.log(`HEAD ${d.ma} · HEAD chay lai ${lai} · merge-base ${maB}: ${d.evs.join(", ")}`);
	for (const e of d.evs) {
		if (maB !== 0) {
			dem.doSan += 1;
			console.log(`do san o B: ${e}`);
			continue;
		}
		const m = HSC.mien[e];
		if (!m) {
			dem.hoiQuy += 1;
			hoiQuy.push(e);
			console.log(`hoi quy: ${e}`);
			continue;
		}
		cayMien ??= datCay("mien", sha);
		lamSach(cayMien);
		for (const t of m.tep) {
			rmSync(join(cayMien, t), { recursive: true, force: true });
			const coO = spawnSync("git", ["-C", cayMien, "cat-file", "-e", `${coSo}:${t}`]).status === 0;
			if (coO) git(cayMien, "checkout", coSo, "--", t);
		}
		const maMien = chay(d.lenh, cayMien, `mien-${bam(d.lenh)}`);
		if (maMien === 0) {
			dem.mien += 1;
			console.log(`mien: ${e} — ${m.lyDo} (xanh khi tra ${m.tep.join(", ")} ve ${coSo.slice(0, 8)})`);
		} else {
			dem.hoiQuy += 1;
			hoiQuy.push(e);
			console.log(`hoi quy: ${e} (mien khong du: van do ma ${maMien} khi tra ${m.tep.join(", ")} ve ${coSo.slice(0, 8)})`);
		}
	}
}
console.log(
	`tong ${soEval} eval: xanh o HEAD ${soEval - doHead.reduce((s, d) => s + d.evs.length, 0)} · chap chon ${dem.chapChon} · do san o B ${dem.doSan} · mien ${dem.mien} · hoi quy ${dem.hoiQuy}`,
);
if (hoiQuy.length > 0) ket(1);
console.log(`khong eval nao do o HEAD ma xanh o ${coSo.slice(0, 8)} ngoai muc mien`);
ket(0);
