export const KIEU_TEP = {
	pdf: { mime: "application/pdf", duoi: [".pdf"] },
	docx: {
		mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		duoi: [".docx"],
	},
	png: { mime: "image/png", duoi: [".png"] },
	jpeg: { mime: "image/jpeg", duoi: [".jpg", ".jpeg"] },
} as const;

export type KieuTep = keyof typeof KIEU_TEP;

export const CAC_KIEU_TEP = Object.keys(KIEU_TEP) as KieuTep[];

export type NhanKieuTep = { kieu: KieuTep } | { loi: "khong-nhan" | "macro" };

const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff];
const ZIP = [0x50, 0x4b, 0x03, 0x04];
const DOCX_PHAN = new TextEncoder().encode("word/document.xml");
const MACRO_PHAN = new TextEncoder().encode("vbaProject.bin");

function batDau(byte: Uint8Array, dau: readonly number[]): boolean {
	return byte.length >= dau.length && dau.every((b, i) => byte[i] === b);
}

function chua(byte: Uint8Array, kim: Uint8Array): boolean {
	const cuoi = byte.length - kim.length;
	for (let i = 0; i <= cuoi; i += 1) {
		let khop = true;
		for (let j = 0; j < kim.length; j += 1) {
			if (byte[i + j] !== kim[j]) {
				khop = false;
				break;
			}
		}
		if (khop) return true;
	}
	return false;
}

export function nhanKieuTep(byte: Uint8Array): NhanKieuTep {
	if (batDau(byte, PDF)) return { kieu: "pdf" };
	if (batDau(byte, PNG)) return { kieu: "png" };
	if (batDau(byte, JPEG)) return { kieu: "jpeg" };
	if (batDau(byte, ZIP) && chua(byte, DOCX_PHAN)) {
		return chua(byte, MACRO_PHAN) ? { loi: "macro" } : { kieu: "docx" };
	}
	return { loi: "khong-nhan" };
}

export function kieuTheoTen(tenTep: string): KieuTep | null {
	const thuong = tenTep.toLowerCase();
	for (const kieu of CAC_KIEU_TEP) {
		if (KIEU_TEP[kieu].duoi.some((duoi) => thuong.endsWith(duoi))) return kieu;
	}
	return null;
}
