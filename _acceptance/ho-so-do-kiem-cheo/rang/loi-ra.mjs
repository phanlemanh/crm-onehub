import { fileURLToPath } from "node:url";
import { DANH_SACH, DO_LAI_NEN, docDanhSach, docJson, MA_QUYET_DINH, MA_TIN_HIEU, quyetDinhCuaNguoi, tapDo } from "./chung.mjs";

const TEP_SAN_PHAM = /(^|[\s(«])(apps|packages)\//;

export function kiemLoiRa(ds, doLai, quyetDinh = quyetDinhCuaNguoi()) {
	const loi = [];
	const theoHoSo = new Map(ds.hoan_lai.map((h) => [h.ho_so, h]));
	const doTheoHoSo = new Map();
	for (const d of tapDo(doLai)) doTheoHoSo.set(d.ho_so, [...(doTheoHoSo.get(d.ho_so) ?? []), d.eval]);
	for (const d of ds.dong) if (d.xu_ly === "san-pham-hong") loi.push(`SAN_PHAM_HONG_NGOAI_HOAN_LAI ${d.ho_so}:${d.eval}`);
	const dongRa = [];
	const maDaGap = new Set();
	for (const h of ds.hoan_lai) {
		if (h.giao_lan_rieng) {
			const g = h.giao_lan_rieng;
			if (!MA_QUYET_DINH.test(String(g.quyet_dinh ?? "")) || !String(g.ly_do ?? "").trim() || !quyetDinh.has(g.quyet_dinh) || (h.san_pham_hong ?? []).length)
				loi.push(`GIAO_LAN_RIENG_THIEU ${h.ho_so}`);
			const daSuaG = new Set((h.sua_san ?? []).filter((s) => s.xu_ly && s.sua).map((s) => s.eval));
			for (const ev of doTheoHoSo.get(h.ho_so) ?? []) if (!daSuaG.has(ev)) loi.push(`CHUA_TRA ${h.ho_so}:${ev}`);
			dongRa.push(`${h.ho_so}: ${(doTheoHoSo.get(h.ho_so) ?? []).length} eval đỏ · giao làn riêng theo ${g.quyet_dinh} · ${daSuaG.size} ô có sửa răng ghi sẵn`);
			continue;
		}
		const th = Array.isArray(h.tin_hieu) ? h.tin_hieu : [];
		const hongTH =
			!th.length ||
			th.some(
				(t) => !MA_TIN_HIEU.test(String(t.ma ?? "")) || maDaGap.has(t.ma) || !String(t.tieu_de ?? "").includes(h.ho_so) || !TEP_SAN_PHAM.test(String(t.noi_dung ?? "")),
			) ||
			(h.san_pham_hong ?? []).some((s) => !th.some((t) => new RegExp(`\\b${s.eval}\\b`).test(t.tieu_de ?? "")));
		for (const t of th) maDaGap.add(t.ma);
		if (hongTH) loi.push(`TIN_HIEU_VANG ${h.ho_so}`);
		if (!(h.san_pham_hong ?? []).length) loi.push(`HOAN_LAI_KHONG_SAN_PHAM_HONG ${h.ho_so}`);
		const daSua = new Set((h.sua_san ?? []).filter((s) => s.xu_ly && s.sua).map((s) => s.eval));
		const spHong = new Set((h.san_pham_hong ?? []).map((s) => s.eval));
		for (const ev of doTheoHoSo.get(h.ho_so) ?? []) if (!spHong.has(ev) && !daSua.has(ev)) loi.push(`CHUA_TRA ${h.ho_so}:${ev}`);
		dongRa.push(`${h.ho_so}: ${(doTheoHoSo.get(h.ho_so) ?? []).length} eval đỏ · tín hiệu ${th.map((t) => t.ma).join(", ")} · ${daSua.size} ô có sửa răng ghi sẵn`);
	}
	return { loi, dongRa, theoHoSo };
}

function tuKiem(ds, doLai) {
	const sai = [];
	const a = structuredClone(ds);
	a.hoan_lai[0].tin_hieu = [];
	if (!kiemLoiRa(a, doLai).loi.includes(`TIN_HIEU_VANG ${a.hoan_lai[0].ho_so}`)) sai.push("bo tin_hieu khong ra TIN_HIEU_VANG");
	const b = structuredClone(ds);
	const h = b.hoan_lai.find((x) => (x.sua_san ?? []).length);
	if (h) {
		const ev = h.sua_san.shift().eval;
		if (!kiemLoiRa(b, doLai).loi.includes(`CHUA_TRA ${h.ho_so}:${ev}`)) sai.push("bo sua_san khong ra CHUA_TRA");
	}
	const c = structuredClone(ds);
	const g = c.hoan_lai.find((x) => x.giao_lan_rieng);
	if (g) {
		if (kiemLoiRa(c, doLai).loi.some((l) => l.startsWith(`GIAO_LAN_RIENG_THIEU ${g.ho_so}`))) sai.push("giao lan rieng nguyen ven ma ra GIAO_LAN_RIENG_THIEU");
		g.giao_lan_rieng.quyet_dinh = "d-20000101T000000Z-1";
		if (!kiemLoiRa(c, doLai).loi.includes(`GIAO_LAN_RIENG_THIEU ${g.ho_so}`)) sai.push("quyet dinh bia khong ra GIAO_LAN_RIENG_THIEU");
		const e = structuredClone(ds);
		e.hoan_lai.find((x) => x.giao_lan_rieng).giao_lan_rieng.ly_do = "";
		if (!kiemLoiRa(e, doLai).loi.includes(`GIAO_LAN_RIENG_THIEU ${g.ho_so}`)) sai.push("bo ly_do khong ra GIAO_LAN_RIENG_THIEU");
	}
	return sai;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const ds = docDanhSach(DANH_SACH);
	const doLai = docJson(DO_LAI_NEN);
	const sai = tuKiem(ds, doLai);
	if (sai.length) {
		console.error(`HONG tu kiem: ${sai.join("; ")}`);
		process.exit(1);
	}
	const { loi, dongRa } = kiemLoiRa(ds, doLai);
	for (const d of dongRa) console.log(d);
	for (const l of loi) console.log(l);
	console.log(`loi-ra: ${ds.hoan_lai.length} hồ sơ hoàn lại, ${loi.length} lỗi`);
	process.exit(loi.length ? 1 : 0);
}
