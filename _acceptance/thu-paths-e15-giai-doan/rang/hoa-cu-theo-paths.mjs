import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC =
	process.env.GOC_KHO ??
	join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const L = createRequire(import.meta.url)(join(GOC, "lib", "evidence-core.cjs"));
const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], { maxBuffer: 1 << 30 }).toString();

const THU_MUC_MAN = [
	"apps/app/app/(app)/[slug]/settings/giai-doan/",
	"apps/app/app/(app)/[slug]/deals/",
];
const THU_MUC_CHU = "apps/app/lib/messages/";
const SAN_MA_TRAN = 20;

function khongDo(ly) {
	console.log(`KHONG DO DUOC: ${ly}`);
	process.exit(2);
}

function globT1() {
	const dong = readFileSync(
		join(GOC, "_acceptance", "config.yaml"),
		"utf8",
	).split("\n");
	const kq = [];
	let trong = false;
	for (const d of dong) {
		if (/^\s*t1_skip_globs:/.test(d)) {
			trong = true;
			continue;
		}
		if (!trong) continue;
		const m = d.match(/^\s*-\s*["']?([^"'#]+?)["']?\s*$/);
		if (m) kq.push(L.pathGlobToRe(m[1]));
		else if (d.trim()) break;
	}
	if (!kq.length) khongDo("khong doc duoc risk_tiers.t1_skip_globs");
	return kq;
}

function docTep(slug, ten) {
	const p = join(GOC, "_acceptance", slug, ten);
	return existsSync(p) ? readFileSync(p, "utf8") : null;
}

let cayNho = null;
export function cayHead() {
	cayNho ??= L.dungCayPaths(git("ls-files", "-z").split("\0").filter(Boolean));
	return cayNho;
}

let t1Nho = null;
export function tepDoiTuPin(vc) {
	t1Nho ??= globT1();
	return git("diff", "--name-only", vc, "--")
		.split("\n")
		.filter(
			(f) =>
				f && !f.startsWith("_acceptance/") && !t1Nho.some((r) => r.test(f)),
		);
}

export function verifiedCommit(slug) {
	const bc = docTep(slug, "evidence-report.md");
	return (bc && (bc.match(/^verified_commit:\s*(\S+)/m) ?? [])[1]) || null;
}

export function hoaCuHoSo(slug, evalsText = null) {
	const evals = evalsText ?? docTep(slug, "evals.yaml");
	if (evals == null) khongDo(`${slug} khong co evals.yaml`);
	const vc = verifiedCommit(slug);
	if (!vc)
		return {
			slug,
			vc: null,
			apply: false,
			reason: "chua-ghim",
			kept: [],
			files: [],
		};
	const files = tepDoiTuPin(vc);
	const r = L.staleByPaths(files, evals, { cay: cayHead() });
	return {
		slug,
		vc,
		apply: r.apply,
		reason: r.reason,
		kept: r.apply ? r.kept : files,
		files,
	};
}

export function docDanhSach(gia) {
	if (gia.startsWith("@")) {
		const p = join(GOC, gia.slice(1));
		if (!existsSync(p)) khongDo(`khong co tep danh sach ${gia.slice(1)}`);
		return readFileSync(p, "utf8")
			.split("\n")
			.map((x) => x.trim())
			.filter((x) => x && !x.startsWith("#"));
	}
	return gia
		.split(",")
		.map((x) => x.trim())
		.filter(Boolean);
}

function idCuaEvals(evals) {
	return [...evals.matchAll(/^\s*-\s+id:\s*["']?([^"'\s]+)/gm)].map(
		(m) => m[1],
	);
}

function giuBoi(evals, ids, tep) {
	const kq = [];
	for (const id of ids)
		for (const g of L.evalPathsOf(evals, id) ?? [])
			if (L.pathGlobToRe(g).test(tep)) kq.push(`${id}:${g}`);
	return kq;
}

function kiemHoSo(dsSlug) {
	let hong = 0;
	for (const slug of dsSlug) {
		const r = hoaCuHoSo(slug);
		if (!r.vc) console.log(`CHUA_GHIM ${slug}`);
		else if (!r.apply) {
			hong += 1;
			console.log(`KHONG_AP ${slug}: ${r.reason}`);
		} else if (r.kept.length) {
			hong += 1;
			console.log(
				`CON_HOA_CU ${slug}: ${r.kept.slice(0, 5).join(" ")}${r.kept.length > 5 ? ` (+${r.kept.length - 5})` : ""}`,
			);
		} else
			console.log(
				`SACH ${slug}: ${r.files.length} tep doi tu ${r.vc.slice(0, 9)}, bo qua het theo paths`,
			);
	}
	console.log(`ho so: ${dsSlug.length} · hong: ${hong}`);
	return hong;
}

function phanLoai(evals, ids, tep, chiEval) {
	if (chiEval)
		return giuBoi(evals, ids, tep).length > 0 ? { giu: true } : { giu: false };
	const r = L.staleByPaths([tep], evals, { cay: cayHead() });
	if (!r.apply) return { loi: r.reason };
	return { giu: r.kept.includes(tep) };
}

function kiemGiaDinh(slug, dsGiaDinh, chiEval) {
	const evals = docTep(slug, "evals.yaml");
	if (evals == null) khongDo(`${slug} khong co evals.yaml`);
	const ids = chiEval ? [chiEval] : idCuaEvals(evals);
	if (chiEval && !idCuaEvals(evals).includes(chiEval))
		khongDo(`${slug} khong co eval ${chiEval}`);
	let hong = 0;
	for (const muc of dsGiaDinh) {
		const [tep, mong] = muc.split("=");
		if (!tep || !["bo", "giu"].includes(mong))
			khongDo(`--gia-dinh can <tep>=bo|giu, nhan «${muc}»`);
		if (!cayHead().tep.has(tep))
			khongDo(`tep gia dinh khong co trong cay: ${tep}`);
		const k = phanLoai(evals, ids, tep, chiEval);
		if (k.loi) {
			hong += 1;
			console.log(`KHONG_AP ${slug} ${tep}: ${k.loi}`);
		} else if (mong === "bo" && k.giu) {
			hong += 1;
			console.log(
				`VAN_GIU ${slug} ${tep}: ${giuBoi(evals, ids, tep).join(" ")}`,
			);
		} else if (mong === "giu" && !k.giu) {
			hong += 1;
			console.log(`LOT ${slug} ${tep}: khong glob nao giu tep nay`);
		} else
			console.log(
				`${mong === "bo" ? "BO_QUA" : "GIU"} ${slug} ${tep}${k.giu ? `: ${giuBoi(evals, ids, tep).join(" ")}` : ""}`,
			);
	}
	return hong;
}

export function tapChuCuaMan() {
	const tep = git("ls-files", "-z", "--", ...THU_MUC_MAN)
		.split("\0")
		.filter(Boolean);
	const tap = new Set();
	for (const t of tep) {
		const chu = readFileSync(join(GOC, t), "utf8");
		for (const m of chu.matchAll(/["']@\/lib\/messages\/([a-z0-9-]+)["']/g))
			tap.add(`${THU_MUC_CHU}${m[1]}.ts`);
	}
	return tap;
}

function kiemMaTranChu(slug, chiEval) {
	if (!chiEval) khongDo("--ma-tran-chu can --chi-eval <id>");
	const evals = docTep(slug, "evals.yaml");
	if (evals == null) khongDo(`${slug} khong co evals.yaml`);
	if (!idCuaEvals(evals).includes(chiEval))
		khongDo(`${slug} khong co eval ${chiEval}`);
	const giuMong = tapChuCuaMan();
	const tatCa = git("ls-files", "-z", "--", THU_MUC_CHU)
		.split("\0")
		.filter((t) => /^apps\/app\/lib\/messages\/[^/]+\.ts$/.test(t));
	if (!giuMong.size) khongDo("tap tep chu suy tu ma cua man rong");
	if (tatCa.length < SAN_MA_TRAN)
		khongDo(`chi co ${tatCa.length} tep chu (< ${SAN_MA_TRAN})`);
	const vang = [...giuMong].filter((t) => !tatCa.includes(t));
	if (vang.length)
		khongDo(`ma cua man nhap tep chu khong co trong cay: ${vang.join(" ")}`);
	let sai = 0;
	let giu = 0;
	for (const tep of tatCa) {
		const boi = giuBoi(evals, [chiEval], tep);
		const thay = boi.length ? "giu" : "bo";
		const mong = giuMong.has(tep) ? "giu" : "bo";
		if (thay === "giu") giu += 1;
		if (thay !== mong) {
			sai += 1;
			console.log(`SAI_LOP ${tep}: mong ${mong}, thay ${thay}`);
		} else
			console.log(
				thay === "giu" ? `GIU ${tep}: ${boi.join(" ")}` : `BO_QUA ${tep}`,
			);
	}
	console.log(
		`ma tran: ${tatCa.length} tep · giu ${giu} · bo ${tatCa.length - giu} · sai ${sai} · tap suy ${giuMong.size}`,
	);
	return sai;
}

function doiSo(ten) {
	const i = process.argv.indexOf(ten);
	return i === -1 ? null : (process.argv[i + 1] ?? "");
}

function chay() {
	const hoSo = doiSo("--ho-so");
	const giaDinh = doiSo("--gia-dinh");
	const chiEval = doiSo("--chi-eval");
	if (hoSo == null)
		khongDo(
			"can --ho-so <slug,...|@tep> [--gia-dinh <tep>=bo|giu,...] [--chi-eval <id>] [--ma-tran-chu]",
		);
	const dsSlug = docDanhSach(hoSo);
	if (!dsSlug.length) khongDo("--ho-so rong");
	let hong;
	if (process.argv.includes("--ma-tran-chu")) {
		if (dsSlug.length !== 1) khongDo("--ma-tran-chu chi nhan mot ho so");
		hong = kiemMaTranChu(dsSlug[0], chiEval);
	} else if (giaDinh != null) {
		if (dsSlug.length !== 1) khongDo("--gia-dinh chi nhan mot ho so");
		hong = kiemGiaDinh(dsSlug[0], giaDinh.split(",").filter(Boolean), chiEval);
	} else hong = kiemHoSo(dsSlug);
	process.exit(hong ? 1 : 0);
}

if (
	process.argv[1] &&
	realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
)
	chay();
