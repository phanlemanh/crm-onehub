import type { NhipOkr } from "@crm/ui/components/okr-status";
import {
	CAY_DON_VI,
	type DonViMau,
	type KrMau,
	KY,
	MT_CSKH_1,
	MT_CSKH_2,
	MUC_TIEU_CUA_DON_VI,
	type MucTieuMau,
	NGUOI,
} from "../ban-mau-okr/du-lieu";

export const DUONG = "/proto/vo-khu-muc-tieu";

export const STATE = {
	cuaToi: "ST-vkm-cua-toi",
	donVi: "ST-vkm-don-vi",
	trangDonVi: "ST-vkm-trang-don-vi",
	hopTuan: "ST-vkm-hop-tuan",
	viec: "ST-vkm-viec",
	soDoDonVi: "ST-vkm-so-do-don-vi",
	nganMucTieu: "ST-vkm-ngan-muc-tieu",
	nganKr: "ST-vkm-ngan-kr",
	sucKhoe: "ST-vkm-suc-khoe",
	moiKr: "ST-vkm-moi-kr",
	soDo: "ST-vkm-so-do",
	toanMan: "ST-vkm-toan-man",
	capNhat: "ST-vkm-cap-nhat",
	layYKien: "ST-vkm-lay-y-kien",
} as const;

export type StateVo = (typeof STATE)[keyof typeof STATE];

export function duong(state: StateVo): string {
	return `${DUONG}?state=${state}`;
}

export const TOI = NGUOI.thao;

export const DON_VI_TOI_DAN = "cskh";

export const MUC_TIEU_DON_VI: MucTieuMau[] = [MT_CSKH_1, MT_CSKH_2];

function layKr(mt: MucTieuMau, id: string): KrMau {
	const kr = mt.kr.find((k) => k.id === id);
	if (!kr) throw new Error(`Không có KR ${id} trong dữ liệu mẫu.`);
	return kr;
}

export const KR_DANG_MO: KrMau = layKr(MT_CSKH_1, "c1k2");

export function phanTram(kr: KrMau): number {
	if (kr.kieu === "moc") return kr.hienTai >= 1 ? 100 : 0;
	const tam = kr.dich - kr.khoiDiem;
	if (tam === 0) return 0;
	const p = Math.round(((kr.hienTai - kr.khoiDiem) / tam) * 100);
	return Math.max(0, Math.min(100, p));
}

export function nhip(kr: KrMau): NhipOkr {
	if (kr.kieu === "moc") return kr.hienTai >= 1 ? "moc-xong" : "moc-chua";
	const p = phanTram(kr);
	if (p >= KY.kyVong) return "dung-nhip";
	if (p >= KY.kyVong * 0.7) return "cham-nhip";
	return "truot";
}

export function tienDoMucTieu(mt: MucTieuMau): number {
	if (mt.kr.length === 0) return 0;
	return Math.round(mt.kr.reduce((s, k) => s + phanTram(k), 0) / mt.kr.length);
}

export function giaTri(kr: KrMau): string {
	if (kr.kieu === "moc") return kr.hienTai >= 1 ? "Xong" : "Chưa xong";
	return `${kr.hienTai}${kr.donVi ? ` ${kr.donVi}` : ""}`;
}

export type HangDonVi = {
	id: string;
	ten: string;
	cap: DonViMau["cap"];
	sau: number;
	truong: string | null;
	soMucTieu: number;
	tienDo: number;
	krThap: number;
};

function hangCua(d: DonViMau, sau: number): HangDonVi[] {
	const mt = MUC_TIEU_CUA_DON_VI.get(d.id) ?? [];
	const kr = mt.flatMap((m) => m.kr);
	const tienDo =
		kr.length === 0
			? 0
			: Math.round(kr.reduce((s, k) => s + phanTram(k), 0) / kr.length);
	const ban: HangDonVi = {
		id: d.id,
		ten: d.ten,
		cap: d.cap,
		sau,
		truong: d.truong?.ten ?? null,
		soMucTieu: mt.length,
		tienDo,
		krThap: kr.filter((k) => k.tuTin === "thap").length,
	};
	return [ban, ...d.con.flatMap((c) => hangCua(c, sau + 1))];
}

export const HANG_DON_VI: HangDonVi[] = hangCua(CAY_DON_VI, 0);

export const MOI_KR = [...MUC_TIEU_CUA_DON_VI.entries()].flatMap(
	([donVi, mts]) =>
		mts.flatMap((mt) =>
			mt.kr.map((kr) => ({
				donVi,
				tenDonVi: mt.donVi,
				mucTieu: mt.ten,
				kr,
			})),
		),
);

export const DONG_TIN = MOI_KR.filter((h) => h.kr.ghiChu !== null)
	.slice(0, 6)
	.map((h) => ({
		id: h.kr.id,
		nguoi: h.kr.phuTrach.ten,
		kr: h.kr.ten,
		donVi: h.tenDonVi,
		giaTri: giaTri(h.kr),
		ghiChu: h.kr.ghiChu ?? "",
		luc: h.kr.capNhatLuc ?? "",
	}));
