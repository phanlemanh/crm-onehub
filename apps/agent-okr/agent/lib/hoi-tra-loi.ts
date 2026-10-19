import {
	type CauTraLoiDung,
	type GiaTriTrich,
	giaTriTrichKr,
	giaTriTrichMucTieu,
	type KetQuaNopTraLoi,
	ketQuaNopTraLoi,
	kiemSoCau,
	type NopTraLoiInput,
	type TrichOkr,
} from "@crm/validation/okr-tra-loi";
import { TRO_LY_OKR_HOI } from "./config";
import { docOkr, type MucTieuDay } from "./hoi-doc";

export const ketQuaTraLoi = ketQuaNopTraLoi;

export type KetQuaTraLoi = KetQuaNopTraLoi;

const LOI = TRO_LY_OKR_HOI.loiNop;

type TrichDoc = { gia: GiaTriTrich; ten: string };

function giaTriCua(t: TrichOkr, mt: MucTieuDay): TrichDoc | null {
	if (t.loai === "objective") {
		return { gia: giaTriTrichMucTieu(mt.id, mt), ten: mt.ten };
	}
	const k = mt.kr.find((x) => x.id === t.id);
	if (!k) return null;
	return { gia: giaTriTrichKr(k.id, k), ten: k.ten };
}

export async function nopTraLoi(
	userId: string,
	input: NopTraLoiInput,
	homNay = new Date(),
): Promise<KetQuaTraLoi> {
	const cau: CauTraLoiDung["cau"] = [];
	const daDoc = new Map<string, MucTieuDay | null>();
	for (const [i, c] of (input.cau ?? []).entries()) {
		if (input.loai === "tra-loi" && c.trich.length === 0)
			return { ok: false, reason: LOI.cauKhongTrich(i + 1) };
		const doc: TrichDoc[] = [];
		for (const t of c.trich) {
			const khoa = `${t.loai}:${t.id}`;
			if (!daDoc.has(khoa)) {
				const kq = await docOkr(userId, t, homNay);
				daDoc.set(khoa, kq.ok ? kq.mucTieu : null);
			}
			const mt = daDoc.get(khoa);
			const g = mt ? giaTriCua(t, mt) : null;
			if (!g) return { ok: false, reason: LOI.trichNgoaiQuyen(t.id), ma: t.id };
			doc.push(g);
		}
		const so = kiemSoCau(
			c.chu,
			doc.map((d) => d.gia),
		);
		if (!so.ok)
			return { ok: false, reason: LOI.soLech(so.so, so.lop), so: so.so };
		cau.push({
			chu: c.chu,
			trich: doc.map((d) => ({ loai: d.gia.loai, id: d.gia.id, ten: d.ten })),
		});
	}
	if (input.loai === "tra-loi" && cau.length === 0)
		return { ok: false, reason: LOI.traLoiRong };
	if (input.loai === "ngoai-pham-vi" && cau.length === 0)
		return { ok: false, reason: LOI.ngoaiPhamViRong };
	return { ok: true, traLoi: { loai: input.loai, cau } };
}
