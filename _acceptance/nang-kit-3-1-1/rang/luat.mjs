import { SLUG, THE, THE_CU } from "./kit.mjs";

export const TEP_VIET_TRUOC = [
	".claude/settings.json",
	".github/workflows/tin-hieu-gom.yml",
	"lib/workspace-record.cjs",
	"scripts/product-map.mjs",
	"scripts/can-cu-s1.cjs",
	"scripts/hop-thu/hinh-dang.mjs",
	"scripts/tro-ly-quyet-dinh.cjs",
	"_acceptance/config.yaml",
	"PRODUCT-MAP.md",
	"LO-TRINH.html",
	`docs/superpowers/specs/2026-11-24-${SLUG}-design.md`,
	`docs/superpowers/plans/2026-11-24-${SLUG}.md`,
];

export function kiemLopChep(ds, docKhoFn, docKitFn) {
	const loi = [];
	for (const { nguon, dich } of ds) {
		let kho;
		try {
			kho = docKhoFn(dich);
		} catch {
			loi.push(`thiếu: ${dich}`);
			continue;
		}
		if (kho !== docKitFn(nguon)) loi.push(`lệch bản ${THE}: ${dich}`);
	}
	return loi;
}

export function docT1(config) {
	const dong = config.split("\n");
	const i = dong.findIndex((d) => /^ {2}t1_skip_globs:\s*$/.test(d));
	if (i < 0) throw new Error("config.yaml không có risk_tiers.t1_skip_globs");
	const ra = [];
	for (let j = i + 1; j < dong.length; j++) {
		const d = dong[j];
		if (/^ {0,2}\S/.test(d)) break;
		const m = /^ {4}- "([^"]+)"/.exec(d);
		if (m) ra.push(m[1]);
	}
	return ra;
}

export function kiemT1(globs, ds) {
	const co = new Set(globs);
	return ds.filter(({ dich }) => !co.has(dich)).map(({ dich }) => `t1_skip_globs thiếu: ${dich}`);
}

const KIT_REF = /^\s*KIT_REF:\s*(\S+)\s*$/;

export function kiemLuongGom(moi, cu) {
	const loi = [];
	const the = moi.split("\n").map((d) => KIT_REF.exec(d)?.[1]).filter(Boolean);
	if (the.length !== 1 || the[0] !== THE) loi.push(`KIT_REF phải đúng một dòng ${THE} (thấy ${the.join(",") || "0"})`);
	const boRef = (t) => t.split("\n").filter((d) => !KIT_REF.test(d)).join("\n");
	if (boRef(moi) !== boRef(cu)) loi.push("tin-hieu-gom.yml đổi ngoài dòng KIT_REF");
	return loi;
}

export function kiemPhien(moi, cu) {
	const loi = [];
	const ref = moi.extraKnownMarketplaces?.["delivery-loop"]?.source?.ref;
	if (ref !== THE) loi.push(`ref của chợ delivery-loop phải là ${THE} (thấy ${ref ?? "vắng"})`);
	const ban = structuredClone(moi);
	if (ban.extraKnownMarketplaces?.["delivery-loop"]?.source) ban.extraKnownMarketplaces["delivery-loop"].source.ref = THE_CU;
	for (const k of [...new Set([...Object.keys(ban), ...Object.keys(cu)])]) {
		if (JSON.stringify(ban[k]) !== JSON.stringify(cu[k])) loi.push(`settings đổi ngoài ref chợ: ${k}`);
	}
	if (JSON.stringify(Object.keys(ban)) !== JSON.stringify(Object.keys(cu))) loi.push("settings đổi thứ tự khoá");
	return loi;
}

export function kiemCho(mk, tenBat) {
	const loi = [];
	if (mk.name !== "delivery-loop") loi.push(`tên chợ ở marketplace.json của thẻ là ${mk.name}, không phải delivery-loop`);
	const co = new Set((mk.plugins ?? []).map((p) => p.name));
	for (const t of tenBat) if (!co.has(t)) loi.push(`chợ của thẻ không có plugin ${t}`);
	return loi;
}

export function laSoKeLai(tep) {
	return (
		/^_acceptance\/[^/]+\//.test(tep) ||
		tep.startsWith("docs/superpowers/") ||
		tep.startsWith("docs/findings/") ||
		tep === "PRODUCT-MAP.md"
	);
}

export function kiemTenSong(tepCoChu) {
	return tepCoChu.filter((t) => !laSoKeLai(t)).map((t) => `tệp sống còn ${THE_CU}: ${t}`);
}

export function kiemDiff(doi, slug = SLUG) {
	const cho = new Set(TEP_VIET_TRUOC);
	return doi.filter((t) => !cho.has(t) && !t.startsWith(`_acceptance/${slug}/`)).map((t) => `tệp ngoài danh sách: ${t}`);
}

export function docGioiHan(hopDong) {
	const m = /^## Làn khô — kết quả\s*$([\s\S]*?)(?=^## )/m.exec(hopDong);
	if (!m) throw new Error("hợp đồng không có mục «Làn khô — kết quả»");
	return [...m[1].matchAll(/^- gioi-han: `([^`]+)`/gm)].map((x) => x[1]).sort();
}

export function kiemPhanLoai({ pl, ungVienSuy, gioiHan, cayTip, cayDau, nen }) {
	const loi = [];
	if (cayTip !== cayDau) loi.push("làn khô không chạy trên cây HEAD");
	if (pl.sha_nhanh_chinh !== nen) loi.push("làn khô so với nhánh chính khác merge-base");
	const a = [...pl.ung_vien].sort();
	const b = [...ungVienSuy].sort();
	if (JSON.stringify(a) !== JSON.stringify(b)) loi.push("ứng viên lệch tập suy từ diff");
	const doViVong = [];
	for (const [e, x] of Object.entries(pl.tip)) {
		if (x.dat) continue;
		const lop = pl.lop[e];
		const chinh = pl.nhanh_chinh[e];
		if (!lop) loi.push(`${e}: đỏ trên tip mà chưa xếp lớp`);
		else if (lop === "do-ca-hai" && !(chinh && !chinh.dat)) loi.push(`${e}: xếp đỏ cả hai bên mà nhánh chính xanh`);
		else if (lop === "do-vi-vong" && !(chinh && chinh.dat)) loi.push(`${e}: xếp đỏ vì vòng mà nhánh chính không xanh`);
		else if (!["do-ca-hai", "do-vi-vong"].includes(lop)) loi.push(`${e}: lớp lạ ${lop}`);
		if (lop === "do-vi-vong") doViVong.push(e);
	}
	for (const e of Object.keys(pl.lop)) if (pl.tip[e]?.dat !== false) loi.push(`${e}: xếp lớp mà tip không đỏ`);
	if (JSON.stringify(doViVong.sort()) !== JSON.stringify([...gioiHan].sort())) loi.push("gioi-han không khớp đỏ vì vòng");
	return loi;
}

export function soDoiChung({ nenCu, nenMoi, dau }) {
	const loi = [];
	const ok = (t) => [...t.matchAll(/^OK \[([^\]]+)\]/gm)].map((m) => m[1]).sort();
	const vio = (t) => t.split("\n").filter((d) => d.startsWith("VIOLATION"));
	const chay = (t) => /rules ran=(\d+) declared-off=0 expected=\1/.test(t);
	for (const [ten, t] of [["lớp chép nhánh chính", nenCu], [`lớp chép ${THE}`, nenMoi], ["HEAD", dau.van]]) {
		if (!chay(t)) loi.push(`${ten}: lưới không chạy đủ luật`);
	}
	if (vio(nenCu).length || vio(nenMoi).length) loi.push("merge-base có VIOLATION");
	const a = ok(nenCu);
	const b = ok(nenMoi);
	if (JSON.stringify(a) !== JSON.stringify(b)) loi.push("tập OK của hai lớp chép trên merge-base lệch");
	if (a.length === 0) loi.push("merge-base không có hồ sơ OK nào");
	const okDau = new Set(ok(dau.van));
	const mat = a.filter((s) => !okDau.has(s) && s !== dau.slug);
	if (mat.length) loi.push(`hồ sơ thôi OK trên HEAD: ${mat.slice(0, 5).join(",")}`);
	const ngoai = vio(dau.van).filter((d) => !d.startsWith(`VIOLATION [${dau.slug}]`));
	if (ngoai.length) loi.push(`VIOLATION ngoài vòng trên HEAD: ${ngoai.length}`);
	return { loi, ok: a.length, okDau: okDau.size, vongCuaVong: vio(dau.van).length - ngoai.length };
}

export function xetLuoiPr(van, slug = SLUG) {
	const vio = van.split("\n").filter((d) => d.startsWith("VIOLATION"));
	const khac = [...new Set(vio.map((d) => /^VIOLATION \[([^\]]+)\]/.exec(d)?.[1] ?? "?").filter((s) => s !== slug))];
	return { loi: khac.map((s) => `lưới PR báo hồ sơ khác vòng: ${s}`), cuaVong: vio.length - vio.filter((d) => !d.startsWith(`VIOLATION [${slug}]`)).length };
}
