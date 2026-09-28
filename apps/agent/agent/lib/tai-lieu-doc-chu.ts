import { TAI_LIEU_AGENT } from "./tai-lieu-config";

export type KetQuaDocChu =
	| { loai: "chu"; chu: string; soTrang: number }
	| { loai: "can-go-tay"; lyDo: string }
	| { loai: "loi"; lyDo: string };

const CFG = TAI_LIEU_AGENT.docChu;
const LY_DO = TAI_LIEU_AGENT.lyDo;
const KY_TU_HONG = /[�-]|\(cid:\d+\)/gu;

function demKyTu(chu: string): number {
	return chu.replace(/\s+/g, "").length;
}

function tiLeHong(chu: string): number {
	const tong = demKyTu(chu);
	if (tong === 0) return 0;
	return (chu.match(KY_TU_HONG)?.length ?? 0) / tong;
}

function kiemChu(trang: readonly string[]): KetQuaDocChu {
	const tong = trang.length;
	const quet = trang.filter((t) => demKyTu(t) < CFG.toiThieuKyTuMoiTrang);
	const chu = trang.join("\n\n").normalize("NFC");
	if (demKyTu(chu) === 0 && tong === 0)
		return { loai: "loi", lyDo: LY_DO.rong };
	if (quet.length > 0) {
		return { loai: "can-go-tay", lyDo: LY_DO.banQuet(quet.length, tong) };
	}
	if (tiLeHong(chu) > CFG.tiLeKyTuHongToiDa) {
		return { loai: "can-go-tay", lyDo: LY_DO.chuHong };
	}
	if (chu.length > CFG.toiDaKyTu) return { loai: "loi", lyDo: LY_DO.quaDai };
	return { loai: "chu", chu, soTrang: tong };
}

function laMatKhau(loi: Error): boolean {
	return loi.name === "PasswordException" || /password/i.test(loi.message);
}

async function docPdf(byte: Uint8Array): Promise<KetQuaDocChu> {
	const { extractText, getDocumentProxy } = await import("unpdf");
	try {
		const pdf = await getDocumentProxy(new Uint8Array(byte));
		const { text } = await extractText(pdf, { mergePages: false });
		return kiemChu(text);
	} catch (loi) {
		if (loi instanceof Error && laMatKhau(loi)) {
			return { loai: "loi", lyDo: LY_DO.matKhau };
		}
		return { loai: "loi", lyDo: LY_DO.tepHong };
	}
}

async function docDocx(byte: Uint8Array): Promise<KetQuaDocChu> {
	const { default: mammoth } = await import("mammoth");
	try {
		const { value } = await mammoth.extractRawText({
			buffer: Buffer.from(byte),
		});
		const chu = value.normalize("NFC").trim();
		if (demKyTu(chu) === 0) return { loai: "loi", lyDo: LY_DO.rong };
		if (tiLeHong(chu) > CFG.tiLeKyTuHongToiDa) {
			return { loai: "can-go-tay", lyDo: LY_DO.chuHong };
		}
		if (chu.length > CFG.toiDaKyTu) return { loai: "loi", lyDo: LY_DO.quaDai };
		return { loai: "chu", chu, soTrang: 1 };
	} catch {
		return { loai: "loi", lyDo: LY_DO.tepHong };
	}
}

export function docChu(
	byte: Uint8Array,
	kieu: "docx" | "pdf",
): Promise<KetQuaDocChu> {
	return kieu === "pdf" ? docPdf(byte) : docDocx(byte);
}
