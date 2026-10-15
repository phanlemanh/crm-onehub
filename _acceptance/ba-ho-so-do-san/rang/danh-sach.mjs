import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
	DO_KHI_GHIM,
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
		...DO_KHI_GHIM.map((p) => khoaDong({ ...p, muc: null })),
	];
}

const hoanLaiCua = (d) => new Set((d.hoan_lai?.ho_so ?? []).map((h) => h.ho_so));

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
	const hl = hoanLaiCua(d);
	const tapN = new Set(nen.filter((k) => !hl.has(k.split(":")[0])));
	for (const k of tapN) if (!coSan.has(k)) loi.push(`THIEU ${k}`);
	for (const k of coSan.keys()) if (!tapN.has(k)) loi.push(`THUA ${k}`);
	if (d.moc_nen !== MOC_NEN) loi.push(`MOC_NEN_LECH ${d.moc_nen}`);
	for (const k of coSan.keys()) if (hl.has(k.split(":")[0])) loi.push(`HOAN_LAI_CON_DONG ${k}`);
	if (d.hoan_lai) {
		if (!/^P7-\d+$/.test(String(d.hoan_lai.yeu_cau ?? "")) || !String(d.hoan_lai.hang ?? "").trim()) loi.push("HOAN_LAI_KHONG_MA");
		for (const h of d.hoan_lai.ho_so ?? []) {
			const khai = new Set((h.muc_chet ?? []).map((m) => `${h.ho_so}:${m.eval}:${m.muc}`));
			const quet = nen.filter((k) => k.startsWith(`${h.ho_so}:`) && !k.endsWith(":-"));
			for (const k of quet) if (!khai.has(k)) loi.push(`HOAN_LAI_THIEU ${k}`);
			for (const k of khai) if (!quet.includes(k)) loi.push(`HOAN_LAI_THUA ${k}`);
			if (!Array.isArray(h.eval_do) || h.eval_do.length === 0) loi.push(`HOAN_LAI_KHONG_EVAL_DO ${h.ho_so}`);
		}
	}
	if (loi.length === 0) dat.push(`danh-sach: ${coSan.size} dong tren ${new Set(d.dong.map((x) => x.ho_so)).size} ho so, khop tap quet o moc nen ${MOC_NEN}; hoan lai ${hl.size} ho so sang ${d.hoan_lai?.hang ?? "-"}`);

	const nv = d.ngoai_vong;
	if (!nv || !Array.isArray(nv.ngay) || nv.ngay.length === 0) {
		loi.push("NGOAI_VONG_THIEU_MUC");
		return { loi, dat };
	}
	if (!/^P7-\d+$/.test(String(nv.yeu_cau ?? ""))) loi.push("NGOAI_VONG_KHONG_MA");
	const trong = new Set([...d.dong.map((x) => x.ho_so), ...hoanLaiCua(d)]);
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
	const dauHL = d.hoan_lai?.ho_so?.[0];
	if (dauHL?.muc_chet?.length) {
		const thieuHL = { ...d, hoan_lai: { ...d.hoan_lai, ho_so: [{ ...dauHL, muc_chet: dauHL.muc_chet.slice(1) }, ...d.hoan_lai.ho_so.slice(1)] } };
		const m = dauHL.muc_chet[0];
		bat("hoan lai thieu muc chet", thieuHL, `HOAN_LAI_THIEU ${dauHL.ho_so}:${m.eval}:${m.muc}`);
		const conDong = { ...d, dong: [...d.dong, { ho_so: dauHL.ho_so, eval: m.eval, muc: m.muc, xu_ly: "bo-paths" }] };
		bat("hoan lai van con dong", conDong, `HOAN_LAI_CON_DONG ${dauHL.ho_so}`);
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
