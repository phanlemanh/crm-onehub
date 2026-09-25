import type { ViecOkr } from "@crm/db/okr-nhac";
import {
	NHAC,
	THU_TU_NHAC,
	type ViecKeHoach,
	type ViecNhac,
} from "@crm/db/onboarding-nhac";

type LoaiTin = ViecNhac["loai"];

const TIEU_DE = {
	"buoc-qua-han": "Quá hạn",
	"buoc-sap-han": "Sắp hạn",
	"ke-hoach-im": "Kế hoạch im",
	"moc-ngay": "Mốc ngày",
	"okr-cap-nhat": "Cập nhật tuần",
	"okr-kr-im": "KR im",
	"okr-duoc-giao": "Được giao",
	"okr-nhac-ten": "Nhắc tên",
	"okr-theo-doi": "Đang theo dõi",
} as const satisfies { [K in LoaiTin]: string };

function thoat(chu: string): string {
	return chu
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

function ngayThang(han: string): string {
	const [, thang, ngay] = han.split("-");
	return `${ngay}/${thang}`;
}

function phanDau(v: ViecKeHoach): string {
	if (v.loai === "ke-hoach-im") return `im ${v.soNgay} ngày · `;
	if (v.loai === "moc-ngay") return `ngày thứ ${v.soNgay} · `;
	return "";
}

export type KhuonTin = "slack" | "tron";

export type LienKet = (v: ViecNhac) => string | null;

function dongKeHoach(v: ViecKeHoach, url: string | null, khuon: KhuonTin) {
	const han = v.han ? `, hạn ${ngayThang(v.han)}` : "";
	if (khuon === "tron") {
		const mo = url ? ` — ${url}` : "";
		return `• ${v.companyName} · ${phanDau(v)}${v.goiY}${han}${mo}`;
	}
	const mo = url ? ` — <${url}|mở kế hoạch>` : "";
	return `• ${thoat(v.companyName)} · ${phanDau(v)}${thoat(v.goiY)}${han}${mo}`;
}

function noiDungOkr(v: ViecOkr, chu: (s: string) => string): string {
	switch (v.loai) {
		case "okr-cap-nhat":
			return `${v.soKr} KR chờ cập nhật tuần này`;
		case "okr-kr-im":
			return v.chuTen === null
				? `KR «${chu(v.nhan)}» im ${v.soNgay} ngày`
				: `KR «${chu(v.nhan)}» của ${chu(v.chuTen)} im ${v.soNgay} ngày`;
		case "okr-duoc-giao":
			return v.keyResultId
				? `Bạn phụ trách KR «${chu(v.nhan)}»`
				: `Bạn phụ trách mục tiêu «${chu(v.nhan)}»`;
		case "okr-nhac-ten":
			return `${chu(v.nguoiTen)} nhắc tên bạn ở «${chu(v.nhan)}»`;
		case "okr-theo-doi":
			return `«${chu(v.nhan)}» có ${v.capNhat} cập nhật, ${v.binhLuan} bình luận mới`;
	}
}

function dongOkr(v: ViecOkr, url: string | null, khuon: KhuonTin): string {
	if (khuon === "tron") {
		const mo = url ? ` — ${url}` : "";
		return `• ${noiDungOkr(v, (s) => s)}${mo}`;
	}
	const nhan = v.loai === "okr-cap-nhat" ? "mở cập nhật tuần" : "mở mục tiêu";
	const mo = url ? ` — <${url}|${nhan}>` : "";
	return `• ${noiDungOkr(v, thoat)}${mo}`;
}

function dong(v: ViecNhac, lienKet: LienKet, khuon: KhuonTin): string {
	const url = lienKet(v);
	return "planId" in v ? dongKeHoach(v, url, khuon) : dongOkr(v, url, khuon);
}

export type TinNhac = { text: string; daGui: ViecNhac[] };

export function dungTin(
	ten: string,
	viec: ViecNhac[],
	lienKet: LienKet,
	khuon: KhuonTin = "slack",
	tranKyTu: number = Number.POSITIVE_INFINITY,
): TinNhac {
	const theoThuTu = THU_TU_NHAC.flatMap((loai) =>
		viec.filter((v) => v.loai === loai),
	);
	const tieuDe = (loai: LoaiTin) =>
		khuon === "tron" ? TIEU_DE[loai] : `*${TIEU_DE[loai]}*`;
	const tenHien = khuon === "tron" ? ten : thoat(ten);
	const coOkr = theoThuTu.some((v) => !("planId" in v));
	const chao = coOkr
		? `Chào ${tenHien}, sáng nay có ${theoThuTu.length} việc cần bạn để ý.`
		: `Chào ${tenHien}, sáng nay có ${theoThuTu.length} việc 30 ngày đầu cần bạn để ý.`;
	const ve = (daGui: ViecNhac[]) => {
		const nhom = THU_TU_NHAC.flatMap((loai) => {
			const ds = daGui.filter((v) => v.loai === loai);
			if (ds.length === 0) return [];
			return ["", tieuDe(loai), ...ds.map((v) => dong(v, lienKet, khuon))];
		});
		const conLai = theoThuTu.length - daGui.length;
		const cuoi = conLai > 0 ? ["", `và ${conLai} việc nữa — mở tổng quan`] : [];
		return [chao, ...nhom, ...cuoi].join("\n");
	};
	let daGui = theoThuTu.slice(0, NHAC.tran);
	while (daGui.length > 0 && ve(daGui).length > tranKyTu) {
		daGui = daGui.slice(0, -1);
	}
	return { text: ve(daGui), daGui };
}
