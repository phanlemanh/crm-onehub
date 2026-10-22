import { fileURLToPath } from "node:url";
import { DANH_SACH, DO_LAI_NEN, docDanhSach, docJson, MA_TIN_HIEU, tapDo } from "./chung.mjs";

const TEP_SAN_PHAM = /(^|[\s(«])(apps|packages)\//;

export function kiemLoiRa(ds, doLai) {
	const loi = [];
	const theoHoSo = new Map(ds.hoan_lai.map((h) => [h.ho_so, h]));
	const doTheoHoSo = new Map();
	for (const d of tapDo(doLai)) doTheoHoSo.set(d.ho_so, [...(doTheoHoSo.get(d.ho_so) ?? []), d.eval]);
	for (const d of ds.dong) if (d.xu_ly === "san-pham-hong") loi.push(`SAN_PHAM_HONG_NGOAI_HOAN_LAI ${d.ho_so}:${d.eval}`);
	const dongRa = [];
	const maDaGap = new Set();
	for (const h of ds.hoan_lai) {
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
