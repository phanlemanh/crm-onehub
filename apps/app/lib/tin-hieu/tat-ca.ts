import { demNguongSong, dongDemTuTatCa, idTep } from "@crm/validation/tin-hieu";
import type { TinHieuMessages } from "@/lib/messages/tin-hieu";
import type { BaSo } from "@/lib/tin-hieu/loc-tat-ca";
import {
	docTrangThaiTuNguon,
	type NguonTrangThai,
	nguonTuHtml,
	type TrangThaiDu,
} from "@/lib/tin-hieu/trang-thai";

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

export type NenTatCa = {
	banVeDocDuoc: boolean;
	trangThai: Record<string, TrangThaiDu>;
	coCho: string[];
};

export function docNenTatCa(
	vao: { rows: HangTatCa[]; m: TinHieuMessages } & (
		| { html: string | null }
		| { nguon: NguonTrangThai }
	),
): NenTatCa {
	const { rows, m } = vao;
	const du = docTrangThaiTuNguon(
		"nguon" in vao ? vao.nguon : nguonTuHtml(vao.html),
		rows.map((r) => ({ ma: idTep(r.so), daKeoVe: r.daKeoVe })),
		m,
	);
	return {
		banVeDocDuoc: du.banVe === "co",
		trangThai: du.trangThai,
		coCho: [...du.coCho],
	};
}

export function demBaSo({
	rows,
	coCho,
	banVeDocDuoc,
	now,
}: {
	rows: HangTatCa[];
	coCho: readonly string[];
	banVeDocDuoc: boolean;
	now: Date;
}): BaSo {
	const so = demNguongSong(
		dongDemTuTatCa(rows.map((r) => ({ ...r, ma: idTep(r.so) }))),
		now,
		new Set(coCho),
	);
	return {
		trongKy: so.trongKy,
		soPhong: so.soPhong,
		khongPhong: so.khongPhong,
		quaHan: so.quaHan,
		chuaCoCho: banVeDocDuoc ? so.chuaCoCho : null,
	};
}

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
	const nen = docNenTatCa({ rows, html, m });
	return {
		banVeDocDuoc: nen.banVeDocDuoc,
		trangThai: nen.trangThai,
		baSo: demBaSo({
			rows,
			coCho: nen.coCho,
			banVeDocDuoc: nen.banVeDocDuoc,
			now,
		}),
	};
}
