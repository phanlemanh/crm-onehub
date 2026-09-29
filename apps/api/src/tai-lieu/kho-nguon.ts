import { type KhoNguon, khoNguonVercel } from "@crm/db/blob-nguon";

export const KHO_NGUON = Symbol("KHO_NGUON");

export const khoNguonProvider = {
	provide: KHO_NGUON,
	useFactory: (): KhoNguon => khoNguonVercel(),
};

const PK = [0x50, 0x4b, 0x03, 0x04];
const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d];
const DOCX_PHAN = new TextEncoder().encode("word/document.xml");

function batDau(byte: Uint8Array, dau: readonly number[]): boolean {
	return dau.every((b, i) => byte[i] === b);
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

export function nhanKieu(byte: Uint8Array): "docx" | "pdf" | null {
	if (batDau(byte, PDF)) return "pdf";
	if (batDau(byte, PK) && chua(byte, DOCX_PHAN)) return "docx";
	return null;
}
