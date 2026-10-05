import { createHash } from "node:crypto";
import { db } from "@crm/db";
import type { KhoNguon } from "@crm/db/blob-nguon";
import {
	parseKieuNguon,
	parseSoanTuNguonPayload,
} from "@crm/validation/tai-lieu-nguon";
import { TAI_LIEU_AGENT } from "./tai-lieu-config";
import { docChu } from "./tai-lieu-doc-chu";
import { completeTask, type LeasedTask } from "./tasks";

const LY_DO = TAI_LIEU_AGENT.lyDo;
const KHONG_BAT = "Chưa soạn được — chưa bật lưu tệp nguồn.";

async function ketThuc(
	taskId: string,
	nguonId: string,
	trangThai: "CAN_GO_TAY" | "LOI",
	lyDo: string,
): Promise<void> {
	await db.taiLieuNguon.update({
		where: { id: nguonId },
		data: { trangThai, lyDo },
	});
	await completeTask(taskId, lyDo);
}

export async function coQuyTacViet(): Promise<boolean> {
	const trang = await db.taiLieuTrang.findUnique({
		where: { slug: TAI_LIEU_AGENT.soan.slugQuyTacViet },
		select: { banDangDungId: true },
	});
	return Boolean(trang?.banDangDungId);
}

export async function chaySoanTuNguon(
	task: LeasedTask,
	kho: KhoNguon,
): Promise<void> {
	const { nguonId } = parseSoanTuNguonPayload(task.payload);
	const nguon = await db.taiLieuNguon.findUnique({
		where: { id: nguonId },
		select: { id: true, sha256: true, blobPathname: true, kieu: true },
	});
	if (!nguon) {
		await completeTask(task.id, "The source this names is gone.");
		return;
	}
	await db.taiLieuNguon.update({
		where: { id: nguon.id },
		data: { trangThai: "CHO_DOC", lyDo: null },
	});
	try {
		await docVaChuyen(task.id, nguon, kho);
	} catch (loi) {
		console.error("soan-tu-nguon: doc nguon loi", { nguonId: nguon.id, loi });
		await ketThuc(task.id, nguon.id, "LOI", LY_DO.docLoi);
	}
}

type NguonDoc = {
	id: string;
	sha256: string;
	blobPathname: string;
	kieu: string;
};

async function docVaChuyen(
	taskId: string,
	nguon: NguonDoc,
	kho: KhoNguon,
): Promise<void> {
	if (!kho.bat()) return ketThuc(taskId, nguon.id, "LOI", KHONG_BAT);
	const byte = await kho.doc(nguon.blobPathname);
	if (!byte) return ketThuc(taskId, nguon.id, "LOI", LY_DO.khongTai);
	const bam = createHash("sha256").update(byte).digest("hex");
	if (bam !== nguon.sha256) {
		return ketThuc(taskId, nguon.id, "LOI", LY_DO.bamLech);
	}
	const doc = await docChu(byte, parseKieuNguon(nguon.kieu));
	if (doc.loai === "can-go-tay") {
		return ketThuc(taskId, nguon.id, "CAN_GO_TAY", doc.lyDo);
	}
	if (doc.loai === "loi") return ketThuc(taskId, nguon.id, "LOI", doc.lyDo);
	await db.taiLieuNguon.update({
		where: { id: nguon.id },
		data: { chu: doc.chu, soTrang: doc.soTrang },
	});
	if (!(await coQuyTacViet())) {
		return ketThuc(taskId, nguon.id, "LOI", LY_DO.thieuQuyTac);
	}
	await db.taiLieuNguon.update({
		where: { id: nguon.id },
		data: { trangThai: "CHO_SOAN" },
	});
	await completeTask(taskId, LY_DO.choSoan);
}
