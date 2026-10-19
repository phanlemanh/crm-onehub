import { demNguongSong, dongDemTuTatCa, idTep } from "@crm/validation/tin-hieu";
import type { TinHieuMessages } from "@/lib/messages/tin-hieu";
import type { BaSo } from "@/lib/tin-hieu/loc-tat-ca";
import { docTrangThaiDu, type TrangThaiDu } from "@/lib/tin-hieu/trang-thai";

export type HangTatCa = {
	so: number;
	guiLuc: Date | string;
	daKeoVe: boolean;
	phongBan: { id: string; ten: string } | null;
};

export type KetQuaTatCa = {
	banVeDocDuoc: boolean;
	trangThai: Record<string, TrangThaiDu>;
	baSo: BaSo;
};

export function ghepTatCa({
	rows,
	html,
	now,
	m,
}: {
	rows: HangTatCa[];
	html: string | null;
	now: Date;
	m: TinHieuMessages;
}): KetQuaTatCa {
	const coMa = rows.map((r) => ({ ...r, ma: idTep(r.so) }));
	const du = docTrangThaiDu(
		html,
		coMa.map((r) => ({ ma: r.ma, daKeoVe: r.daKeoVe })),
		m,
	);
	const docDuoc = du.banVe === "co";
	const so = demNguongSong(dongDemTuTatCa(coMa), now, du.coCho);
	return {
		banVeDocDuoc: docDuoc,
		trangThai: du.trangThai,
		baSo: {
			trongKy: so.trongKy,
			soPhong: so.soPhong,
			khongPhong: so.khongPhong,
			quaHan: so.quaHan,
			chuaCoCho: docDuoc ? so.chuaCoCho : null,
		},
	};
}
