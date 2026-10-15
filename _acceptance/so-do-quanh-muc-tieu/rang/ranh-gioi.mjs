import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "so-do-quanh-muc-tieu";
const NHANH_CHINH = "origin/onehub";
const NHANH_DUNG_TREN = "feat/so-do-can-chinh-don-vi";
const MAU_CHUNG = [
	`_acceptance/${SLUG}/**`,
	"docs/**",
	"PRODUCT-MAP.md",
	"LO-TRINH.html",
];
const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], {
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});

export function ranhGioiHopDong(hd) {
	const dau = hd.indexOf("- Ranh giới");
	if (dau < 0) throw new Error("hop dong khong co muc Ranh gioi");
	const het = hd.indexOf("\n- ", dau + 1);
	const doan = hd.slice(dau, het < 0 ? undefined : het).replace(/\n\s+/g, " ");
	const duoc = [];
	const chiThem = [];
	for (const m of doan.matchAll(
		/`([^`]+)`(\s*\((chỉ thêm|mới|xoá)[^)]*\))?/g,
	)) {
		const tep = m[1];
		if (!tep.includes("/") && !tep.endsWith(".json")) continue;
		duoc.push(tep);
		if (m[3] === "chỉ thêm") chiThem.push(tep);
	}
	return { duoc, chiThem };
}

export function neo() {
	const daLen = git(
		"log",
		NHANH_CHINH,
		"--merges",
		"--format=%H %P",
		"--grep",
		SLUG,
		"-n",
		"1",
	).trim();
	if (daLen) {
		const [, cha1, cha2] = daLen.split(" ");
		return { tu: git("merge-base", cha1, cha2).trim(), den: cha2 };
	}
	const moc = [git("merge-base", "HEAD", NHANH_CHINH).trim()];
	const coNhanh = spawnSync("git", ["-C", GOC, "rev-parse", "--verify", "-q", NHANH_DUNG_TREN]).status === 0;
	if (coNhanh) moc.push(git("merge-base", "HEAD", NHANH_DUNG_TREN).trim());
	const moiNhat = moc.reduce((a, b) =>
		spawnSync("git", ["-C", GOC, "merge-base", "--is-ancestor", a, b]).status === 0 ? b : a,
	);
	return { tu: moiNhat, den: "HEAD" };
}

const khop = (mau, tep) =>
	mau.endsWith("/**") ? tep.startsWith(mau.slice(0, -2)) : mau === tep;

export function kiem({ tepDoi, dong, ranhGioi }) {
	const loi = [];
	for (const tep of tepDoi) {
		if (![...ranhGioi.duoc, ...MAU_CHUNG].some((m) => khop(m, tep)))
			loi.push(`tep ngoai ranh gioi: ${tep}`);
	}
	for (const tep of ranhGioi.chiThem) {
		const d = dong[tep];
		if (d && d.xoa.length > 0) loi.push(`xoa dong o tep chi-them: ${tep}`);
	}
	return loi;
}

function dongDoi(n, tep) {
	const ra = { them: [], xoa: [] };
	for (const d of git("diff", "-U0", n.tu, n.den, "--", tep).split("\n")) {
		if (d.startsWith("+++") || d.startsWith("---")) continue;
		if (d.startsWith("+")) ra.them.push(d.slice(1));
		else if (d.startsWith("-")) ra.xoa.push(d.slice(1));
	}
	return ra;
}

function doiChung(ranhGioi) {
	const lanh = kiem({ tepDoi: [ranhGioi.duoc[0]], dong: {}, ranhGioi });
	if (lanh.length !== 0)
		throw new Error(`doi chung duong do: ${lanh.join("; ")}`);
	const la = kiem({ tepDoi: ["apps/app/la.ts"], dong: {}, ranhGioi });
	if (la[0] !== "tep ngoai ranh gioi: apps/app/la.ts")
		throw new Error(`doi chung do khong dung thong diep: ${la.join("; ")}`);
	const xoa = kiem({
		tepDoi: [],
		dong: { [ranhGioi.chiThem[0]]: { them: [], xoa: ["x"] } },
		ranhGioi,
	});
	if (xoa[0] !== `xoa dong o tep chi-them: ${ranhGioi.chiThem[0]}`)
		throw new Error(`doi chung chi-them khong do: ${xoa.join("; ")}`);
}

if (import.meta.main ?? process.argv[1] === fileURLToPath(import.meta.url)) {
	const ranhGioi = ranhGioiHopDong(
		readFileSync(join(GOC, `_acceptance/${SLUG}/contract.md`), "utf8"),
	);
	if (ranhGioi.chiThem.length === 0)
		throw new Error("hop dong khong khai tep chi them nao");
	doiChung(ranhGioi);
	const n = neo();
	const tepDoi = git("diff", "--name-only", n.tu, n.den)
		.split("\n")
		.filter(Boolean);
	const dong = {};
	for (const tep of ranhGioi.chiThem)
		if (tepDoi.includes(tep)) dong[tep] = dongDoi(n, tep);
	const loi = kiem({ tepDoi, dong, ranhGioi });
	console.log(
		`neo ${n.tu.slice(0, 9)}..${n.den === "HEAD" ? "HEAD" : n.den.slice(0, 9)} · ${tepDoi.length} tep doi · ${ranhGioi.duoc.length} tep duoc khai · ${ranhGioi.chiThem.length} tep chi them`,
	);
	for (const l of loi) console.error(l);
	if (loi.length > 0) process.exit(1);
	console.log("DUNG ranh gioi");
}
