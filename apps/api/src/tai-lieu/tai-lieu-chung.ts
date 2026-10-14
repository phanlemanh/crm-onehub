import { createHash } from "node:crypto";
import {
	chuanNfc,
	coChuHaySo,
	type DangCho,
	slugTuDuongDan,
	TAI_LIEU,
} from "@crm/validation/tai-lieu";
import { chuanHoa, rutLienKet } from "@crm/validation/tai-lieu-markdown";
import type { TrangThaiNguon } from "@crm/validation/tai-lieu-nguon";
import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from "@nestjs/common";
import { NGUON_CHO, TAI_LIEU_API } from "./tai-lieu-config";

const T = TAI_LIEU_API.thongDiep;

export function kiemTen(ten: string): string {
	const sach = chuanNfc(ten).trim();
	if (sach.length < TAI_LIEU.ten.min) throw new BadRequestException(T.tenTrong);
	if (sach.length > TAI_LIEU.ten.max)
		throw new BadRequestException(T.tenDai(TAI_LIEU.ten.max));
	if (!coChuHaySo(sach)) throw new BadRequestException(T.tenKhongChu);
	return sach;
}

export function kiemNoiDung(noiDung: string): string {
	const sach = chuanHoa(noiDung);
	if (sach.length > TAI_LIEU.noiDung.max)
		throw new BadRequestException(T.noiDungDai(TAI_LIEU.noiDung.max));
	return sach;
}

export function khongCo(): NotFoundException {
	return new NotFoundException(T.khongCo);
}

export function bam(noiDung: string): string {
	return createHash("sha256").update(noiDung).digest("hex");
}

export function laCu(
	dx: { trangThai: string; loai: string; banGocId: string | null },
	banDangDungId: string | null,
): boolean {
	return (
		dx.trangThai === "CU" ||
		(dx.trangThai === "CHO_DUYET" &&
			dx.loai === "NOI_DUNG" &&
			dx.banGocId !== banDangDungId)
	);
}

export function lienKetTrang(noiDung: string) {
	return rutLienKet(noiDung).flatMap((l) => {
		const denSlug = slugTuDuongDan(l.den);
		return denSlug ? [{ denSlug, vanBan: l.vanBan }] : [];
	});
}

export function tuChoiTrangThai(trangThai: string): ConflictException {
	return new ConflictException(trangThai === "CU" ? T.cu : T.daXuLy);
}

export function dangChoCua(v: {
	coCho: boolean;
	coTraLai: boolean;
	nguonMoi: TrangThaiNguon | null;
}): DangCho {
	if (v.coCho) return "duyet";
	const tuNguon = v.nguonMoi ? NGUON_CHO[v.nguonMoi] : null;
	if (tuNguon) return tuNguon;
	return v.coTraLai ? "tra-lai" : "chua-co-ban";
}
