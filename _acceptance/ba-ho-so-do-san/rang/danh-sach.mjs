import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
	docDanhSach,
	hong,
	khoaDong,
	MOC_NEN,
	P8_4,
	quetMucChet,
	thuMucChung,
	XU_LY,
} from "./chung.mjs";

export function tapNen() {
	return [
		...quetMucChet(MOC_NEN).map((d) => khoaDong(d)),
		...P8_4.map((p) => khoaDong({ ...p, muc: null })),
	];
}

export function docKiemCheo(ngay) {
	const ra = new Map();
	for (const n of ngay) {
		const tep = join(thuMucChung(), ".acceptance-runs", "kiem-cheo", `${n}.json`);
		if (!existsSync(tep)) return { loiTep: tep };
		for (const r of JSON.parse(readFileSync(tep, "utf8")).do ?? []) {
			if (!ra.has(r.ho_so)) ra.set(r.ho_so, new Map());
			ra.get(r.ho_so).set(r.eval, r.loai);
		}
	}
	return { kiemCheo: ra };
}

export function kiemDanhSach(d, nen, kiemCheo) {
	const loi = [];
	const dat = [];
	const coSan = new Map();
	for (const x of d.dong) {
		const k = khoaDong(x);
		if (coSan.has(k)) loi.push(`TRUNG ${k}`);
		coSan.set(k, x);
		if (!XU_LY.includes(x.xu_ly)) loi.push(`XU_LY_LA ${k}: ${x.xu_ly}`);
	}
	const tapN = new Set(nen);
	for (const k of tapN) if (!coSan.has(k)) loi.push(`THIEU ${k}`);
	for (const k of coSan.keys()) if (!tapN.has(k)) loi.push(`THUA ${k}`);
	if (d.moc_nen !== MOC_NEN) loi.push(`MOC_NEN_LECH ${d.moc_nen}`);
	if (loi.length === 0) dat.push(`danh-sach: ${coSan.size} dong, khop tap quet o moc nen ${MOC_NEN}`);

	const nv = d.ngoai_vong;
	if (!nv || !Array.isArray(nv.ngay) || nv.ngay.length === 0) {
		loi.push("NGOAI_VONG_THIEU_MUC");
		return { loi, dat };
	}
	if (!/^P7-\d+$/.test(String(nv.yeu_cau ?? ""))) loi.push("NGOAI_VONG_KHONG_MA");
	const trong = new Set(d.dong.map((x) => x.ho_so));
	const daGhi = new Map((nv.ho_so ?? []).map((h) => [h.ho_so, h]));
	for (const [hoSo, evals] of kiemCheo) {
		if (trong.has(hoSo)) continue;
		const h = daGhi.get(hoSo);
		if (!h) {
			loi.push(`NGOAI_VONG_THIEU ${hoSo}`);
			continue;
		}
		const ghi = new Map((h.eval ?? []).map((e) => [e.eval, e.loai]));
		for (const [ev, loai] of evals)
			if (ghi.get(ev) !== loai) loi.push(`NGOAI_VONG_LECH ${hoSo}:${ev} (${loai})`);
	}
	if (!loi.some((l) => l.startsWith("NGOAI_VONG")))
		dat.push(
			`ngoai_vong: ${daGhi.size} ho so tu kiem-cheo/${nv.ngay.join(",")}.json, yeu cau ${nv.yeu_cau}`,
		);
	return { loi, dat };
}

function tuKiem(d, nen, kiemCheo) {
	const ra = [];
	const bat = (ten, ban, can) => {
		const { loi } = kiemDanhSach(ban, nen, kiemCheo);
		ra.push(
			loi.some((l) => l.startsWith(can))
				? `OK tu kiem ${ten}: bat "${can}"`
				: `HONG tu kiem ${ten}: khong bat "${can}"`,
		);
	};
	const boDong = { ...d, dong: d.dong.slice(1) };
	bat("bo mot dong", boDong, `THIEU ${khoaDong(d.dong[0])}`);
	const bia = { ...d, dong: [...d.dong, { ho_so: "khong-co", eval: "E0", muc: "x", xu_ly: "bo-paths" }] };
	bat("dong bia", bia, "THUA khong-co:E0:x");
	const la = { ...d, dong: d.dong.map((x, i) => (i === 0 ? { ...x, xu_ly: "sua-dai" } : x)) };
	bat("xu_ly la", la, "XU_LY_LA");
	const dauNV = d.ngoai_vong?.ho_so?.[0]?.ho_so;
	if (dauNV) {
		const boNV = { ...d, ngoai_vong: { ...d.ngoai_vong, ho_so: d.ngoai_vong.ho_so.slice(1) } };
		bat("bo ngoai vong", boNV, `NGOAI_VONG_THIEU ${dauNV}`);
	}
	const khongMa = { ...d, ngoai_vong: { ...d.ngoai_vong, yeu_cau: null } };
	bat("ngoai vong khong ma", khongMa, "NGOAI_VONG_KHONG_MA");
	return ra;
}

if (import.meta.main) {
	const d = docDanhSach();
	const ngay = d.ngoai_vong?.ngay ?? [];
	const { kiemCheo, loiTep } = docKiemCheo(ngay);
	if (loiTep) hong(2, `MA 2: khong co tep kiem cheo ${loiTep}`);
	const nen = tapNen();
	const { loi, dat } = kiemDanhSach(d, nen, kiemCheo);
	const tk = tuKiem(d, nen, kiemCheo);
	for (const x of loi) console.log(`HONG ${x}`);
	for (const x of tk) console.log(x);
	for (const x of dat) console.log(x);
	const hongTk = tk.filter((x) => x.startsWith("HONG")).length;
	process.exit(loi.length || hongTk ? 1 : 0);
}
