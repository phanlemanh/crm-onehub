import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "cay-can-chinh-co-ly-do";
const NHANH_TREN = "origin/feat/duong-ly-do-muc-tieu";
const NHANH_CHINH = "origin/onehub";
const CHI_THEM = [
	"_acceptance/config.yaml",
	"apps/app/lib/search-param-keys.ts",
	"apps/app/lib/messages/okr-toan-canh.ts",
	"apps/app/test/okr-theo-don-vi.dom.tsx",
];
const THEM_CANH = "apps/app/test/okr-theo-don-vi.dom.tsx";
const MAU_CHUNG = [
	`_acceptance/${SLUG}/**`,
	"docs/**",
	"PRODUCT-MAP.md",
	"LO-TRINH.html",
	...CHI_THEM,
];

const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8", maxBuffer: 64 << 20 });

export function ranhGioiHopDong() {
	const hd = readFileSync(join(GOC, `_acceptance/${SLUG}/contract.md`), "utf8");
	const dau = hd.indexOf("- Ranh giới");
	if (dau < 0) throw new Error("hop dong khong co muc Ranh gioi");
	const het = hd.indexOf("\n- ", dau + 1);
	const doan = hd.slice(dau, het < 0 ? undefined : het);
	return [...doan.matchAll(/`([^`]+)`/g)].map((m) => m[1]).filter((p) => p.includes("/"));
}

export function neo() {
	const l2DaLen =
		spawnSync("git", ["-C", GOC, "merge-base", "--is-ancestor", NHANH_TREN, NHANH_CHINH]).status === 0;
	if (!l2DaLen) return { tu: git("merge-base", "HEAD", NHANH_TREN).trim(), den: "HEAD" };
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
	return { tu: git("merge-base", "HEAD", NHANH_CHINH).trim(), den: "HEAD" };
}

const khop = (mau, tep) => {
	if (mau.endsWith("/**")) return tep.startsWith(mau.slice(0, -2));
	return mau === tep;
};

export function kiem(tepDoi, dongXoa, ranhGioi) {
	const loi = [];
	for (const tep of tepDoi) {
		if (![...ranhGioi, ...MAU_CHUNG].some((m) => khop(m, tep)))
			loi.push(`ngoai ranh gioi: ${tep}`);
	}
	for (const [tep, { xoa, them }] of Object.entries(dongXoa)) {
		if (!CHI_THEM.includes(tep)) continue;
		const duoc =
			tep === THEM_CANH
				? (d) => them.includes(d.replace(/ \}/, ", canh: [] }"))
				: () => false;
		if (xoa.some((d) => !duoc(d))) loi.push(`sua dong co san: ${tep}`);
	}
	return loi;
}

function dongXoaThat({ tu, den }) {
	const ra = {};
	for (const tep of CHI_THEM) {
		const diff = git("diff", "--unified=0", tu, den, "--", tep);
		const dong = diff.split("\n");
		ra[tep] = {
			xoa: dong.filter((l) => l.startsWith("-") && !l.startsWith("---")).map((l) => l.slice(1)),
			them: dong.filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1)),
		};
	}
	return ra;
}

function doiChung(ranhGioi) {
	const gia1 = kiem(["apps/api/src/okr/okr.service.ts"], {}, ranhGioi);
	if (!gia1.includes("ngoai ranh gioi: apps/api/src/okr/okr.service.ts"))
		throw new Error(`doi chung 1 khong do: ${JSON.stringify(gia1)}`);
	const tep = "apps/app/lib/search-param-keys.ts";
	const gia2 = kiem([], { [tep]: { xoa: ['\t\tky: THAM_SO_OKR.ky,'], them: [] } }, ranhGioi);
	if (!gia2.includes(`sua dong co san: ${tep}`))
		throw new Error(`doi chung 2 khong do: ${JSON.stringify(gia2)}`);
	const lanh = kiem(
		[THEM_CANH],
		{ [THEM_CANH]: { xoa: ["\tcayCanChinh = { roots: [], chuaCanChinh: [] };"], them: ["\tcayCanChinh = { roots: [], chuaCanChinh: [], canh: [] };"] } },
		ranhGioi,
	);
	if (lanh.length > 0) throw new Error(`doi chung duong do: ${JSON.stringify(lanh)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const ranhGioi = ranhGioiHopDong();
	if (ranhGioi.length === 0) {
		console.error("ranh gioi rong");
		process.exit(2);
	}
	doiChung(ranhGioi);
	const n = neo();
	const tepDoi = git("diff", "--name-only", n.tu, n.den).split("\n").filter(Boolean);
	const loi = kiem(tepDoi, dongXoaThat(n), ranhGioi);
	console.log(`neo ${n.tu.slice(0, 9)}..${n.den} · ${tepDoi.length} tep doi · ranh gioi ${ranhGioi.length} muc`);
	for (const l of loi) console.error(l);
	if (loi.length > 0) process.exit(1);
	console.log("ranh gioi dat");
}
