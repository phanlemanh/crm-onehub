import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "duong-ly-do-muc-tieu";
const NHANH_CHINH = "origin/onehub";
const CHI_THEM = ["_acceptance/config.yaml", "apps/app/lib/messages/okr.ts"];
const XOA_DUOC = {
	"apps/app/lib/messages/okr.ts": [
		'\t\tkhuGopVao: "Góp vào",',
		'\t\tkhuGopVao: "Contributes to",',
	],
};
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
	for (const [tep, dong] of Object.entries(dongXoa)) {
		if (!CHI_THEM.includes(tep)) continue;
		const duoc = XOA_DUOC[tep] ?? [];
		const thua = dong.filter((d) => !duoc.includes(d));
		if (thua.length > 0) loi.push(`sua dong co san: ${tep}`);
	}
	return loi;
}

function dongXoaThat({ tu, den }) {
	const ra = {};
	for (const tep of CHI_THEM) {
		const diff = git("diff", "--unified=0", tu, den, "--", tep);
		ra[tep] = diff
			.split("\n")
			.filter((l) => l.startsWith("-") && !l.startsWith("---"))
			.map((l) => l.slice(1));
	}
	return ra;
}

function doiChung(ranhGioi) {
	const gia1 = kiem(["apps/api/src/okr/okr.service.ts"], {}, ranhGioi);
	if (!gia1.includes("ngoai ranh gioi: apps/api/src/okr/okr.service.ts"))
		throw new Error(`doi chung 1 khong do: ${JSON.stringify(gia1)}`);
	const gia2 = kiem([], { "apps/app/lib/messages/okr.ts": ['\t\ttabKr: "KR",'] }, ranhGioi);
	if (!gia2.includes("sua dong co san: apps/app/lib/messages/okr.ts"))
		throw new Error(`doi chung 2 khong do: ${JSON.stringify(gia2)}`);
	const lanh = kiem(
		["apps/app/lib/messages/okr.ts"],
		{ "apps/app/lib/messages/okr.ts": XOA_DUOC["apps/app/lib/messages/okr.ts"] },
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
