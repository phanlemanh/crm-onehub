import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const TEP_NAY = fileURLToPath(import.meta.url);
if (!globalThis.Bun) {
	const kq = spawnSync("bun", [TEP_NAY, ...process.argv.slice(2)], {
		stdio: "inherit",
	});
	process.exit(kq.status ?? 1);
}

const HERE = dirname(TEP_NAY);
const GOC = join(HERE, "..", "..", "..");
const HO_SO_NAY = "gop-y-dung-cho";
const DESIGN = "docs/superpowers/specs/2026-10-03-gop-y-dung-cho-design.md";
const DA_KY = new Set(["signed-off", "machine-cleared", "da-cham-boi-thuc-te"]);
const MOC_TRUOC = "8d5e174a";
const KHEP_KY =
	"chạy chung rang/man-khep-ky.mjs với khep-ky-okr/E3 — cảnh báo khi Kara không bật vẫn đúng";
const MIEN = new Map([
	["khep-ky-okr/E3", "đo cảnh báo đối trọng khi Kara không bật — vẫn đúng"],
	...["E4", "E7", "E13", "E14", "E15", "E22"].map((e) => [
		`khep-ky-okr/${e}`,
		KHEP_KY,
	]),
	[
		"khung-tao-okr-nhu-deal/E23",
		"đo cảnh báo đối trọng khi Kara không bật — vẫn đúng",
	],
	[
		"the-gop-y-okr/E2",
		"dựng thẻ qua the-gop-y-props.ts — tệp giữ lại, bài packages/ui xanh",
	],
	[
		"nen-kara/E8",
		"chạy khối tom-tat của nen-kara-man-cu.dom.tsx — khối giữ nguyên",
	],
	[
		"muc-tieu-va-kr/E14",
		"chỉ nêu tên thuoc-cu.mjs trong mẫu cấm thước chạy thước, không chạy nó",
	],
]);
const LA_TEP_DO = /(^|\/)(test|_acceptance|scripts)\//;
const HAT_GIONG = ["the-gop-y-cot-cuon-rieng", "the-gop-y-sua-nhanh"];
const DUOI_ANH = /\.(png|jpe?g|webp)$/i;
const DUOI_TEP =
	/[\w./()[\]-]+\.(?:dom\.tsx|spec\.ts|test\.ts|tsx|ts|mjs|js|sh)\b/g;

const lam = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MOC = [
	...[
		"cot-gop-y",
		"CotGopY",
		"NutGopY",
		"useGopY",
		"the-gop-y.tsx",
		"TheGopY",
		"data-cot-gop-y",
		"data-nut-gop-y",
		"chiO",
		"oDuocChi",
		"data-duoc-chi",
		"data-canh-bao-doi-trong",
		"tro-ly-okr-gop-y.dom.tsx",
		"tro-ly-okr-vet.dom.tsx",
		"man-the-gop-y.mjs",
		"tro-ly-okr-de-xuat/rang/man-gop-y.mjs",
		"khung-tao-okr-nhu-deal/rang/man-khung.mjs",
		"va-tro-ly-okr-sau-thu/rang/luat-kho.mjs",
		"nen-kara-man-cu.dom.tsx",
		"thuoc-cu.mjs",
	].map((m) => ({ ten: m, re: new RegExp(`(?<![\\w])${lam(m)}(?![\\w])`) })),
	...[
		"khung-tao-okr.dom.tsx -t co-ngan",
		"khung-tao-okr.dom.tsx -t mo-kr-url",
	].map((m) => ({ ten: m, re: new RegExp(lam(m).replace(/ /g, "\\s+")) })),
];

function doiSo(ten) {
	const ra = [];
	process.argv.forEach((a, i) => {
		if (a === ten && process.argv[i + 1]) ra.push(process.argv[i + 1]);
	});
	return ra;
}

function doc(rel) {
	return readFileSync(join(GOC, rel), "utf8");
}

function trangThai(hoSo) {
	const tep = join(GOC, "_acceptance", hoSo, "contract.md");
	if (!existsSync(tep)) return null;
	const dau = readFileSync(tep, "utf8").split(/^---$/m)[1] ?? "";
	return /^status:\s*(\S+)/m.exec(dau)?.[1] ?? null;
}

function giaiRef(cauHinh, ref) {
	if (!ref?.startsWith("config:")) return ref ?? null;
	let nut = cauHinh;
	for (const k of ref.slice("config:".length).split(".")) nut = nut?.[k];
	if (nut === undefined || nut === null || nut instanceof Object)
		throw new Error(`khong giai duoc ${ref}`);
	return String(nut);
}

function docTaiMoc(rel) {
	const kq = spawnSync("git", ["-C", GOC, "show", `${MOC_TRUOC}:${rel}`], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	return kq.status === 0 ? kq.stdout : null;
}

const TEN_KHOI = /\b(?:describe|test|it)\(\s*(["'`])((?:(?!\1).)*)\1/g;

function khoiKhop(chu, khoi) {
	const re = new RegExp(khoi);
	return [...chu.matchAll(TEN_KHOI)].filter((m) => re.test(m[2]));
}

function phanKhoi(chu, khoi) {
	if (!khoi) return chu;
	return khoiKhop(chu, khoi)
		.map((m) => {
			const sau = chu.indexOf("\ndescribe(", (m.index ?? 0) + 1);
			return chu.slice(m.index, sau === -1 ? undefined : sau);
		})
		.join("\n");
}

function donViChay(lenh) {
	const ra = [];
	let thuMuc = GOC;
	for (const doan of lenh.split(/&&|;|\|\|/)) {
		const sach = doan
			.trim()
			.replace(/^["']+/, "")
			.replace(/--preload[=\s]+\S+/g, "");
		const cd = /^cd\s+(\S+)/.exec(sach);
		if (cd) thuMuc = join(GOC, cd[1].replace(/["']/g, ""));
		const khoi = /\s-t\s+(["']?)([^"'\s]+)\1/.exec(sach)?.[2] ?? null;
		for (const m of sach.matchAll(DUOI_TEP)) {
			const ung = [join(thuMuc, m[0]), join(GOC, m[0])].map((p) =>
				relative(GOC, p),
			);
			const rel = ung.find(
				(p) => existsSync(join(GOC, p)) || docTaiMoc(p) !== null,
			);
			if (rel && LA_TEP_DO.test(rel)) ra.push({ rel, khoi });
		}
	}
	return ra;
}

function mocCuaDonVi({ rel, khoi }) {
	const nay = existsSync(join(GOC, rel))
		? readFileSync(join(GOC, rel), "utf8")
		: null;
	const truoc = docTaiMoc(rel) ?? nay ?? "";
	const moc = mocTrong(phanKhoi(truoc, khoi));
	if (nay === null) moc.push(`da xoa ${rel}`);
	else if (khoi && khoiKhop(nay, khoi).length === 0)
		moc.push(`da go khoi ${basename(rel)} -t ${khoi}`);
	return moc;
}

function mocTrong(chu) {
	return MOC.filter((m) => m.re.test(chu)).map((m) => m.ten);
}

function mocTho(cauHinh, tho) {
	const lenhs = [...tho.matchAll(/config:[\w.]+/g)].map((m) =>
		giaiRef(cauHinh, m[0].replace(/\.$/, "")),
	);
	return [
		...mocTrong([tho, ...lenhs].join("\n")),
		...lenhs.flatMap(donViChay).flatMap(mocCuaDonVi),
	];
}

function rutHoSo(cauHinh) {
	const lenh = new Map();
	const judgment = new Map();
	const tatCa = new Map();
	const hong = [];
	for (const hoSo of readdirSync(join(GOC, "_acceptance"))) {
		if (hoSo === HO_SO_NAY || !DA_KY.has(trangThai(hoSo) ?? "")) continue;
		const tepEval = join(GOC, "_acceptance", hoSo, "evals.yaml");
		if (!existsSync(tepEval)) continue;
		const tho = readFileSync(tepEval, "utf8");
		let evals;
		try {
			evals = Bun.YAML.parse(tho)?.evals ?? [];
		} catch {
			hong.push({ hoSo, moc: mocTho(cauHinh, tho) });
			continue;
		}
		const bi = new Set();
		for (const ev of evals) {
			tatCa.set(`${hoSo}/${ev.id}`, ev.cmd ? "lenh" : "judgment");
			if (!ev.cmd) continue;
			const cmd = giaiRef(cauHinh, ev.cmd);
			const moc = [
				...mocTrong(`${ev.expected ?? ""}\n${cmd}`),
				...donViChay(cmd).flatMap(mocCuaDonVi),
			];
			const khoa = `${hoSo}/${ev.id}`;
			if (moc.length > 0 && !MIEN.has(khoa)) {
				lenh.set(khoa, moc);
				bi.add(ev.id);
			}
		}
		for (const ev of evals) {
			if (ev.cmd || !Array.isArray(ev.inputs)) continue;
			const nguon = ev.inputs
				.filter((p) => DUOI_ANH.test(p))
				.map((p) => /^(E\d+)(?!\d)/.exec(basename(p))?.[1])
				.filter((id) => id && bi.has(id));
			if (nguon.length > 0) judgment.set(`${hoSo}/${ev.id}`, nguon);
		}
	}
	return { lenh, judgment, tatCa, hong };
}

function rutBang(boDong) {
	const chu = doc(DESIGN);
	const khoi = chu
		.split("<!-- <<<BANG-THAY-THE -->")[1]
		?.split("<!-- BANG-THAY-THE>>> -->")[0];
	if (!khoi) throw new Error("khong thay cap marker BANG-THAY-THE");
	const dong = [];
	for (const hang of khoi.split("\n")) {
		const o = hang.split("|").map((x) => x.trim());
		if (!/^[\w-]+\/E\d+$/.test(o[1] ?? "")) continue;
		if (boDong.includes(o[1])) continue;
		dong.push({ khoa: o[1], ac: o[4] ?? "" });
	}
	return dong;
}

function soTap(ten, thucTe, bang, chuThieu, chuThua) {
	const loi = [];
	for (const k of thucTe) if (!bang.has(k)) loi.push(`${chuThieu}: ${k}`);
	for (const k of bang) if (!thucTe.has(k)) loi.push(`${chuThua}: ${k}`);
	console.log(`${ten}: thuc te ${thucTe.size}, bang ${bang.size}`);
	return loi;
}

const cauHinh = Bun.YAML.parse(doc("_acceptance/config.yaml"));
const { lenh, judgment, tatCa, hong } = rutHoSo(cauHinh);
const bang = rutBang(doiSo("--bo-dong"));
const acCo = new Set(
	[...doc(`_acceptance/${HO_SO_NAY}/contract.md`).matchAll(/\bAC-\d+\b/g)].map(
		(m) => m[0],
	),
);
const loi = [];
for (const [k, lyDo] of MIEN) console.log(`mien: ${k} — ${lyDo}`);
for (const h of hong) {
	if (h.moc.length > 0)
		loi.push(
			`evals.yaml khong doc duoc ma co moc: ${h.hoSo} (${h.moc.join(", ")})`,
		);
	else
		console.log(`bo qua (evals.yaml khong doc duoc, khong co moc): ${h.hoSo}`);
}
for (const d of bang) {
	if (!tatCa.has(d.khoa)) loi.push(`dong bang tro eval khong co: ${d.khoa}`);
	if (!/^AC-\d+$/.test(d.ac) || !acCo.has(d.ac))
		loi.push(`dong bang neu AC khong co: ${d.khoa} ${d.ac}`);
}
const bangLenh = new Set(
	bang.filter((d) => tatCa.get(d.khoa) === "lenh").map((d) => d.khoa),
);
const bangJudgment = new Set(
	bang.filter((d) => tatCa.get(d.khoa) === "judgment").map((d) => d.khoa),
);
loi.push(
	...soTap(
		"(a) eval co lenh",
		new Set(lenh.keys()),
		bangLenh,
		"eval bi thay chua khai",
		"dong bang khong bi thay",
	),
	...soTap(
		"(b) eval judgment",
		new Set(judgment.keys()),
		bangJudgment,
		"judgment bi thay chua khai",
		"dong judgment khong bi thay",
	),
);
for (const hat of HAT_GIONG) {
	const tep = `_acceptance/${hat}/opportunity.md`;
	if (
		!existsSync(join(GOC, tep)) ||
		!doc(tep).includes(`Gộp vào: ${HO_SO_NAY}`)
	)
		loi.push(`hat giong chua ghi gop vao: ${hat}`);
}
for (const l of loi) console.log(l);
if (loi.length > 0 && process.argv.includes("--chi-tiet"))
	for (const [k, moc] of lenh) console.log(`  ${k}: ${moc.join(", ")}`);
process.exit(loi.length > 0 ? 1 : 0);
