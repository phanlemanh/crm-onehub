import { CHEP_CU } from "./luat.mjs";
import { GOC, docKho, docTai, git } from "./kit.mjs";
import { ungVien } from "./ung-vien.mjs";

export const DOT_DOI_TEN = [
	"dot-ban-do-khuon-3010",
	"dot-cap-nhat-trong-ngan",
	"dot-lo-trinh-tin-hieu",
	"dot-r2",
	"dot-truong-hop-dong",
	"dot-viec-du-an-kho-tai-lieu",
	"dot-vo-khu-muc-tieu",
];

export const TEP_RIENG = [
	"scripts/resolve-plugin.mjs",
	".oxlintrc.json",
	"_acceptance/config.yaml",
	".github/workflows/tin-hieu-gom.yml",
	"scripts/tin-hieu/gom-cau-hinh.ts",
	"scripts/tin-hieu/test/gom-gia-co.test.ts",
	"scripts/tin-hieu/test/gom-lich.test.ts",
	"scripts/kiem-cheo/cau-hinh.mjs",
	"scripts/kiem-cheo/test/dem.test.mjs",
	"docs/setup.md",
	".claude/settings.json",
	"apps/agent/test/mau/lo-trinh-kit.html",
	"CLAUDE.md",
	"PRODUCT-MAP.md",
	"LO-TRINH.html",
	...DOT_DOI_TEN.map((d) => `docs/plan/${d}/README.md`),
];

export function docMucGhim(hopDong) {
	const m = /^## Ghim lại — kết quả\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(hopDong);
	if (!m) throw new Error("hợp đồng không có mục «Ghim lại — kết quả»");
	const ghim = [...m[1].matchAll(/^- ghim: `([^`]+)`/gm)].map((x) => x[1]);
	const gioiHan = [...m[1].matchAll(/^- gioi-han: `([^`]+)`/gm)].map((x) => x[1]);
	return { ghim, gioiHan };
}

export function kiemDiff(doi, ds, muc, slug) {
	const duoc = new Set([...ds.map((x) => x.dich), ...CHEP_CU, ...TEP_RIENG]);
	for (const g of muc.ghim) {
		duoc.add(`_acceptance/${g}/run-log.jsonl`);
		duoc.add(`_acceptance/${g}/evidence-report.md`);
	}
	const hop = (t) =>
		duoc.has(t) ||
		t.startsWith(`_acceptance/${slug}/`) ||
		new RegExp(`^docs/superpowers/(specs|plans)/\\d{4}-\\d{2}-\\d{2}-${slug}(-design)?\\.md$`).test(t);
	return doi.filter((t) => !hop(t)).map((t) => `tệp ngoài danh sách: ${t}`);
}

function truong(txt, ten) {
	return new RegExp(`^${ten}: (.*)$`, "m").exec(txt)?.[1]?.trim() ?? null;
}

export function kiemGhim({ muc, doi, mb, slug, docTru = {} }) {
	const loi = [];
	const doc = (d) => (docTru[d] ? docTru[d](docKho(d)) : docKho(d));
	const coRunLog = new Set(
		doi.filter((t) => /^_acceptance\/[^/]+\/run-log\.jsonl$/.test(t)).map((t) => t.split("/")[1]).filter((s) => s !== slug),
	);
	for (const s of coRunLog) if (!muc.ghim.includes(s)) loi.push(`${s}: PR chạm run-log.jsonl mà hợp đồng không liệt «ghim»`);
	for (const s of muc.ghim) {
		if (!coRunLog.has(s)) {
			loi.push(`${s}: hợp đồng nói ghim mà PR không chạm run-log.jsonl`);
			continue;
		}
		const bao = doc(`_acceptance/${s}/evidence-report.md`);
		const dong = doc(`_acceptance/${s}/run-log.jsonl`)
			.split("\n")
			.filter(Boolean)
			.map((d) => {
				try {
					return JSON.parse(d);
				} catch {
					return null;
				}
			})
			.filter((d) => d?.kind === "repin");
		const cuoi = dong.at(-1);
		const vc = truong(bao, "verified_commit");
		if (!cuoi || cuoi.sha !== vc) loi.push(`${s}: dòng ghim cuối không khớp verified_commit`);
		else {
			const ma = Object.values(cuoi.evals_exit ?? {});
			if (!ma.length) loi.push(`${s}: dòng ghim cuối thiếu evals_exit`);
			if ((cuoi.suites_exit ?? []).some((x) => x !== 0)) loi.push(`${s}: suite của dòng ghim cuối có mã khác 0`);
			if (!bao.includes(cuoi.run_id)) loi.push(`${s}: báo cáo không nêu run_id ${cuoi.run_id}`);
		}
		const cu = docTai(mb, `_acceptance/${s}/evidence-report.md`);
		if (truong(bao, "human_signoff") !== truong(cu, "human_signoff")) loi.push(`${s}: human_signoff đổi so với nhánh chính`);
		if (vc === truong(cu, "verified_commit")) loi.push(`${s}: verified_commit không đổi so với nhánh chính`);
	}
	return { loi, so: muc.ghim.length };
}

export function kiemPhanLoai({ pl, muc, doi, mb, slug }) {
	const loi = [];
	const tep = git(GOC, "diff", "--name-only", pl.sha_tip, "HEAD").split("\n").filter(Boolean);
	const sauTip = (t) =>
		t.startsWith(`_acceptance/${slug}/`) ||
		["PRODUCT-MAP.md", "LO-TRINH.html"].includes(t) ||
		muc.ghim.some((g) => t === `_acceptance/${g}/run-log.jsonl` || t === `_acceptance/${g}/evidence-report.md`);
	if (tep.some((t) => !sauTip(t))) loi.push("phân loại không chạy trên cây HEAD");
	if (pl.sha_nhanh_chinh !== mb) loi.push("nhánh chính của phân loại không phải merge-base");
	const uv = ungVien(GOC, doi, slug).ungVien.map((r) => `${r.ho_so}/${r.eval}`).sort();
	if (JSON.stringify(uv) !== JSON.stringify(pl.ung_vien)) loi.push("ứng viên của tệp khác ứng viên suy lại từ evals.yaml và diff");
	for (const [e, x] of Object.entries(pl.tip)) {
		if (x.dat) continue;
		const l = pl.lop[e];
		if (l === "do-ca-hai" && pl.nhanh_chinh[e]?.dat !== false) loi.push(`${e}: xếp đỏ cả hai bên mà nhánh chính xanh`);
		else if (l === "doi-nhanh" && pl.gop_gia[e]?.dat !== true) loi.push(`${e}: xếp đo diff của nhánh mà bản sau gộp giả không xanh`);
		else if (l === "do-vi-vong" && !(muc.gioiHan ?? []).includes(e)) loi.push(`${e}: đỏ vì vòng mà hợp đồng không khai «gioi-han»`);
		else if (!["do-ca-hai", "doi-nhanh", "do-vi-vong"].includes(l)) loi.push(`${e}: đỏ trên tip mà không có lớp`);
	}
	for (const e of muc.gioiHan ?? []) if (pl.lop[e] !== "do-vi-vong") loi.push(`${e}: hợp đồng khai «gioi-han» mà eval không đỏ vì vòng`);
	for (const g of pl.ghim) {
		for (const [e, x] of Object.entries(pl.tip)) if (e.startsWith(`${g}/`) && !x.dat) loi.push(`${e}: hồ sơ ghim lại còn đỏ trên tip`);
	}
	const coRunLog = new Set(doi.filter((t) => /^_acceptance\/[^/]+\/run-log\.jsonl$/.test(t)).map((t) => t.split("/")[1]).filter((s) => s !== slug));
	const a = JSON.stringify([...pl.ghim].sort());
	if (a !== JSON.stringify([...muc.ghim].sort()) || a !== JSON.stringify([...coRunLog].sort())) loi.push("ba tập ghim (tệp phân loại, hợp đồng, run-log đổi) không bằng nhau");
	return loi;
}
