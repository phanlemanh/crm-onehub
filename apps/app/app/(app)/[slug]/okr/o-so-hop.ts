import { homNayVN } from "@crm/validation/ngay-vn";
import type { RouterOutputs } from "@/lib/trpc/types";

type HopTuanDuLieu = RouterOutputs["okr"]["hopTuan"];

export type OSo = {
	khoa: "da-cap-nhat" | "dang-ban" | "tu-tin-thap" | "ngay-con";
	giaTri: string;
	moTa: {
		loai:
			| "tuan"
			| "can-ban"
			| "moi-nhat"
			| "ket-thuc"
			| "bat-dau"
			| "da-ket-thuc";
		ngay: string | null;
	};
};

export const CHUA_BAT_DAU = "—";

const NGAY_MS = 86_400_000;

function ngayThang(ngay: string): string {
	const [, thang, ngayTrongThang] = ngay.split("-");
	return `${ngayTrongThang}/${thang}`;
}

function soNgayLich(ngay: string): number {
	const [nam, thang, ngayTrongThang] = ngay.split("-").map(Number);
	return Date.UTC(nam ?? 0, (thang ?? 1) - 1, ngayTrongThang ?? 1) / NGAY_MS;
}

export function ngayConLai(
	chuKy: { startsOn: string; endsOn: string },
	homNay: Date,
): Pick<OSo, "giaTri" | "moTa"> {
	const hom = homNayVN(homNay);
	if (hom < chuKy.startsOn)
		return {
			giaTri: CHUA_BAT_DAU,
			moTa: { loai: "bat-dau", ngay: ngayThang(chuKy.startsOn) },
		};
	if (hom > chuKy.endsOn)
		return {
			giaTri: "0",
			moTa: { loai: "da-ket-thuc", ngay: ngayThang(chuKy.endsOn) },
		};
	return {
		giaTri: String(soNgayLich(chuKy.endsOn) - soNgayLich(hom) + 1),
		moTa: { loai: "ket-thuc", ngay: ngayThang(chuKy.endsOn) },
	};
}

export function oSoHop(
	d: HopTuanDuLieu,
	chuKy: { startsOn: string; endsOn: string },
	homNay: Date,
): OSo[] {
	const tuTinThap = [...d.dangBan, ...d.conLai].filter(
		(dong) => dong.tuTin === "thap",
	).length;
	return [
		{
			khoa: "da-cap-nhat",
			giaTri: `${d.daCapNhat}/${d.tongKr}`,
			moTa: { loai: "tuan", ngay: ngayThang(d.tuan) },
		},
		{
			khoa: "dang-ban",
			giaTri: String(d.dangBan.length),
			moTa: { loai: "can-ban", ngay: null },
		},
		{
			khoa: "tu-tin-thap",
			giaTri: String(tuTinThap),
			moTa: { loai: "moi-nhat", ngay: null },
		},
		{ khoa: "ngay-con", ...ngayConLai(chuKy, homNay) },
	];
}
