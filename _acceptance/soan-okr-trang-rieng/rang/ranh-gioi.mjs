import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const NHANH_CHINH = "origin/onehub";
const MA_HANG = "K2";
const PHIEN = "P1";
const DOT = ".acceptance-runs/dieu-phoi-sau-14-10";

const RANH_GIOI_CHEP = [
	"apps/app/app/(app)/[slug]/okr/soan/**",
	"apps/app/lib/okr-soan-record.ts",
	"apps/app/lib/messages/okr-soan.ts",
	"apps/app/app/proto/_modules/soan-okr-trang-rieng/**",
	"apps/app/test/soan-okr*",
	"apps/app/test/khung-soan-okr.tsx",
	"apps/api/src/okr/soan*.ts",
	"packages/validation/src/okr-cuoc-soan.ts",
	"packages/validation/src/okr-phien-soan.ts",
	"packages/validation/src/okr-kiem-ban-nhap.ts",
	"packages/ui/src/components/kara/artifact.tsx",
	"packages/ui/src/components/kara/busy.tsx",
	"packages/ui/src/components/kara/proposal.tsx",
	"_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs",
	"_acceptance/soan-okr-trang-rieng/**",
];
const CHUNG_CHI_THEM_CHEP = [
	"apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx",
	"apps/app/app/(app)/[slug]/okr/thanh-tab.tsx",
	"apps/app/app/proto/registry.ts",
	"apps/app/app/proto/catalog.ts",
];
const DA_DUYET = {
	"P1-3": [
		"apps/api/src/okr/okr.contracts.ts",
		"packages/ui/package.json",
		"bun.lock",
		"packages/ui/src/components/resizable.tsx",
	],
	"P1-4": [
		"_acceptance/config.yaml",
		"apps/api/test/soan-okr-hoan-tac.spec.ts",
		"docs/chat-ui.md",
		"docs/ai-ux.md",
		"apps/app/test/messages-guard.spec.ts",
	],
	"P1-6": [
		"packages/ui/src/components/proposed-change.tsx",
		"packages/ui/src/components/kara/transcript.tsx",
		"packages/ui/src/lib/messages.ts",
	],
	"P1-7": ["apps/app/app/(app)/[slug]/okr/layout.tsx"],
	"P1-8": ["packages/ui/src/components/kara/composer.tsx"],
	"P1-9": [
		"docs/superpowers/specs/2026-10-07-soan-okr-trang-rieng-design.md",
		"docs/superpowers/plans/2026-10-07-soan-okr-trang-rieng.md",
	],
};
const CHI_THEM_DUYET = [
	"_acceptance/config.yaml",
	"apps/app/test/messages-guard.spec.ts",
	"packages/ui/src/lib/messages.ts",
];
const HOP_DONG = "apps/api/src/okr/okr.contracts.ts";
const KHOI_HOP_DONG = ["LY_DO_QUYET", "soanQuyetInput", "soanQuyetOutput"];
const NHAP_HOP_DONG = 'from "@crm/validation/okr-cuoc-soan"';
const RESIZABLE = "packages/ui/src/components/resizable.tsx";
const NHAP_RESIZABLE = "@crm/ui/components/resizable";
const MAT_SOAN = "apps/app/app/(app)/[slug]/okr/soan/";

function git(...thamSo) {
	return execFileSync("git", thamSo, { cwd: GOC, encoding: "utf8" });
}

function boCuoc(loi) {
	console.log(`KHONG DO DUOC: ${loi}`);
	process.exit(2);
}

function mauKhop(mau) {
	let ra = "";
	for (let i = 0; i < mau.length; i += 1) {
		const c = mau[i];
		if (c === "*" && mau[i + 1] === "*") {
			ra += ".*";
			i += 1;
		} else if (c === "*") ra += "[^/]*";
		else ra += c.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
	}
	return new RegExp(`^${ra}$`);
}

function docDot() {
	try {
		const chung = git("rev-parse", "--path-format=absolute", "--git-common-dir").trim();
		const thuMuc = join(dirname(chung), DOT);
		const hang = join(thuMuc, "hang-viec.json");
		if (!existsSync(hang)) return null;
		const viec = JSON.parse(readFileSync(hang, "utf8"));
		const muc = viec.hang?.find((h) => h.ma === MA_HANG);
		if (!muc) return null;
		const themTep = join(thuMuc, "ranh-gioi-them.json");
		const them = existsSync(themTep)
			? (JSON.parse(readFileSync(themTep, "utf8"))[PHIEN] ?? [])
			: [];
		return { ranhGioi: muc.ranh_gioi, chung: muc.chung_chi_them ?? [], them };
	} catch {
		return null;
	}
}

function khoiHopDong(dong) {
	const vung = [];
	for (const ten of KHOI_HOP_DONG) {
		const dau = dong.findIndex((l) => l.startsWith(`export const ${ten} `));
		if (dau < 0) continue;
		let cuoi = dau;
		while (cuoi + 1 < dong.length && !/^(\]|\}\)|\]\))/.test(dong[cuoi])) cuoi += 1;
		vung.push([dau + 1, cuoi + 1]);
	}
	return vung;
}

function hunkMoi(diff) {
	return [...diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)].map(
		(m) => {
			const dau = Number(m[1]);
			const so = m[2] === undefined ? 1 : Number(m[2]);
			return [dau, Math.max(dau, dau + so - 1)];
		},
	);
}

function xet({ tep, xoa, hunk, dongHopDong, coNhapResizable }, nguon) {
	const loi = [];
	const ranhGioi = nguon.ranhGioi.map(mauKhop);
	const chung = new Set(nguon.chung);
	const daDuyet = new Set([...Object.values(DA_DUYET).flat(), ...nguon.them]);
	for (const t of tep) {
		const trong =
			ranhGioi.some((r) => r.test(t)) || chung.has(t) || daDuyet.has(t);
		if (!trong) loi.push(`ngoai ranh gioi: ${t}`);
	}
	for (const t of [...chung, ...CHI_THEM_DUYET]) {
		if ((xoa.get(t) ?? 0) > 0)
			loi.push(`xoa dong o tep chung: ${t.split("/").pop()}`);
	}
	if (tep.includes(HOP_DONG)) {
		const vung = khoiHopDong(dongHopDong);
		for (const [dau, cuoi] of hunk) {
			const trongKhoi = vung.some(([a, b]) => dau >= a && cuoi <= b);
			const laNhap =
				dau === cuoi && dongHopDong[dau - 1]?.includes(NHAP_HOP_DONG);
			if (!trongKhoi && !laNhap)
				loi.push(`hunk ngoai khoi quyet: okr.contracts.ts dong ${dau}-${cuoi}`);
		}
	}
	if (tep.includes(RESIZABLE) && !coNhapResizable)
		loi.push(`resizable.tsx khong duoc tep nao duoi ${MAT_SOAN} nhap`);
	return loi;
}

function docThat(mb) {
	const tep = git("diff", "--name-only", mb).split("\n").filter(Boolean);
	const xoa = new Map(
		git("diff", "--numstat", mb)
			.split("\n")
			.filter(Boolean)
			.map((l) => l.split("\t"))
			.map(([, x, t]) => [t, Number(x) || 0]),
	);
	const hunk = tep.includes(HOP_DONG)
		? hunkMoi(git("diff", "-U0", mb, "--", HOP_DONG))
		: [];
	const dongHopDong = readFileSync(join(GOC, HOP_DONG), "utf8").split("\n");
	const coNhapResizable = git("grep", "-l", NHAP_RESIZABLE, "--", MAT_SOAN)
		.split("\n")
		.some(Boolean);
	return { tep, xoa, hunk, dongHopDong, coNhapResizable };
}

const nguonDot = docDot();
const nguon = nguonDot ?? {
	ranhGioi: RANH_GIOI_CHEP,
	chung: CHUNG_CHI_THEM_CHEP,
	them: [],
};
console.log(
	nguonDot
		? `ranh gioi ${MA_HANG} doc tu hang-viec.json cua dot (${nguon.ranhGioi.length} mau, ${nguon.chung.length} tep chung, ${nguon.them.length} tep duyet them)`
		: `khong thay hang-viec.json cua dot — dung ranh gioi chep o dau script (${nguon.ranhGioi.length} mau)`,
);

if (process.argv.includes("--kiem-do-do")) {
	const gia = {
		tep: ["apps/app/x.tsx", "apps/app/app/(app)/[slug]/okr/thanh-tab.tsx"],
		xoa: new Map([["apps/app/app/(app)/[slug]/okr/thanh-tab.tsx", 1]]),
		hunk: [],
		dongHopDong: [],
		coNhapResizable: true,
	};
	const loi = xet(gia, nguon);
	for (const l of loi) console.log(`   ${l}`);
	const can = [
		"ngoai ranh gioi: apps/app/x.tsx",
		"xoa dong o tep chung: thanh-tab.tsx",
	];
	const thieu = can.filter((c) => !loi.includes(c));
	if (thieu.length > 0) {
		console.log(`CHIEU DO HONG: khong in ${thieu.join(" / ")}`);
		process.exit(3);
	}
	console.log("DO (chieu do ghim): danh sach gia bi bat dung hai loi");
	process.exit(1);
}

let mb;
try {
	mb = git("merge-base", "HEAD", NHANH_CHINH).trim();
} catch {
	boCuoc(`khong co ref ${NHANH_CHINH} — chay git fetch origin onehub`);
}
const that = docThat(mb);
if (that.tep.length === 0) {
	console.log(`RONG: khong co tep nao doi so voi ${NHANH_CHINH} (${mb.slice(0, 9)}) — da gop`);
	process.exit(0);
}
console.log(`so voi ${NHANH_CHINH} tai ${mb.slice(0, 9)}: ${that.tep.length} tep doi`);
const loi = xet(that, nguon);
if (loi.length > 0) {
	for (const l of loi) console.log(`   ${l}`);
	console.log(`DO: ${loi.length} vi pham ranh gioi`);
	process.exit(1);
}
console.log(
	`XANH: ${that.tep.length} tep deu trong ranh gioi ${MA_HANG} hoac da duyet; tep chung chi them; okr.contracts.ts chi trong khoi quyet; resizable.tsx duoc trang soan nhap`,
);
