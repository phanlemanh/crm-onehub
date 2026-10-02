import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
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

function ket(ma) {
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
	const motDong = khoi.match(/^\s*paths:\s*\[(.*)\]\s*$/m);
	if (motDong)
		return [...motDong[1].matchAll(/"([^"]+)"|'([^']+)'/g)].map(
			(m) => m[1] ?? m[2],
		);
	const ra = [];
	let thut = -1;
	for (const dong of khoi.split("\n")) {
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
console.log(`se chay ${soEval} eval qua ${theoLenh.size} lenh rieng`);
if (process.argv.includes("--chi-liet")) {
	for (const [lenh, evs] of theoLenh) console.log(`- ${evs.join(", ")} :: ${lenh.slice(0, 140)}`);
	ket(0);
}

const thuMucRa = join(GOC_THAT, HSC.ra);
mkdirSync(thuMucRa, { recursive: true });

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

function datCay(ten, sha) {
	const cay = join(GOC_THAT, ".acceptance-runs", HSC.slug, ten);
	spawnSync("git", ["-C", GOC_THAT, "worktree", "remove", "--force", cay]);
	git(GOC_THAT, "worktree", "add", "--detach", cay, sha);
	spawnSync("ln", ["-s", join(GOC_THAT, ".env"), join(cay, ".env")]);
	for (const buoc of [["install"], ["run", "db:generate"]]) {
		const r = spawnSync("bun", buoc, { cwd: cay, encoding: "utf8" });
		if (r.status !== 0)
			dung(2, `khong dung duoc cay ${ten}: bun ${buoc.join(" ")}`);
	}
	return cay;
}

let cayHead = GOC;
if (kiemDoDo) {
	cayHead = datCay("pha-thu", "HEAD");
	caySao.push(cayHead);
	const tep = join(cayHead, HSC.phaThu.tep);
	const goc = readFileSync(tep, "utf8");
	if (!goc.includes(HSC.phaThu.tu))
		dung(2, `khong thay cho pha thu trong ${HSC.phaThu.tep}`);
	writeFileSync(tep, goc.replace(HSC.phaThu.tu, HSC.phaThu.thanh));
	console.log(
		`kiem do do: da xoa data-muc-tieu khoi ${HSC.phaThu.tep} trong ban sao`,
	);
}
const doHead = [];
let i = 0;
const vietTruoc = (evs) =>
	evs.some((e) => HSC.danhSach[e.split("/")[0]]?.includes(e.split("/")[1]));
const hang = ([lenh, evs]) =>
	Number(lenh.includes("tien-de")) * 2 + Number(!vietTruoc(evs));
const lenhXep = [...theoLenh.entries()].sort((a, b) => hang(a) - hang(b));
for (const [lenh, evs] of lenhXep) {
	i += 1;
	const ma = chay(lenh, cayHead, `head-${i}`);
	console.log(`[${i}/${theoLenh.size}] HEAD exit ${ma}: ${evs.join(", ")}`);
	if (ma !== 0) doHead.push({ lenh, evs, ma, i });
	if (kiemDoDo && doHead.length > 0) break;
}
console.log(
	`da chay ${kiemDoDo ? "(dung som)" : soEval} eval; do o HEAD: ${doHead.length} lenh`,
);
if (doHead.length === 0) {
	if (kiemDoDo)
		dung(
			1,
			"kiem do do: ban sao bi pha van xanh — thuoc khong bat duoc hoi quy",
		);
	console.log("khong eval nao do o HEAD");
	ket(0);
}
const cayB = datCay("goc", coSo);
caySao.push(cayB);
const hoiQuy = [];
for (const d of doHead) {
	const lai = kiemDoDo ? d.ma : chay(d.lenh, cayHead, `head-lai-${d.i}`);
	const maB = chay(d.lenh, cayB, `goc-${d.i}`);
	console.log(
		`lenh ${d.i}: HEAD ${d.ma} · HEAD chay lai ${lai} · merge-base ${maB}`,
	);
	if (lai === 0) {
		console.log(`chap chon: ${d.evs.join(", ")}`);
		continue;
	}
	for (const e of d.evs) {
		if (maB === 0) {
			hoiQuy.push(e);
			console.log(`hoi quy: ${e}`);
		} else console.log(`do san o B: ${e}`);
	}
}
if (hoiQuy.length > 0) ket(1);
console.log(`khong eval nao do o HEAD ma xanh o ${coSo.slice(0, 8)}`);
ket(0);
