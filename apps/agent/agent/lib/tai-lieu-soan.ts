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

export type PhienMaySoanVao = {
	nguonId: string;
	trangId: string;
	taiBoiId: string;
	chuNguon: string;
};

export type KetQuaPhien = { ok: true } | { ok: false; lyDo: string };

export type MoPhienMaySoan = (vao: PhienMaySoanVao) => Promise<KetQuaPhien>;

export type PhuThuocSoan = { kho: KhoNguon; moPhien: MoPhienMaySoan };

async function ketThuc(
	taskId: string,
	nguonId: string,
	trangThai: "CAN_GO_TAY" | "LOI" | "DA_SOAN",
	lyDo: string | null,
): Promise<void> {
	await db.taiLieuNguon.update({
		where: { id: nguonId },
		data: { trangThai, lyDo },
	});
	await completeTask(taskId, lyDo ?? "Đã soạn bản đề xuất.");
}

export async function chaySoanTuNguon(
	task: LeasedTask,
	deps: PhuThuocSoan,
): Promise<void> {
	const { nguonId } = parseSoanTuNguonPayload(task.payload);
	const nguon = await db.taiLieuNguon.findUnique({
		where: { id: nguonId },
		select: {
			id: true,
			sha256: true,
			blobPathname: true,
			kieu: true,
			trangId: true,
			taiBoiId: true,
		},
	});
	if (!nguon) {
		await completeTask(task.id, "The source this names is gone.");
		return;
	}
	await db.taiLieuNguon.update({
		where: { id: nguon.id },
		data: { trangThai: "DANG_SOAN", lyDo: null },
	});
	if (!deps.kho.bat()) return ketThuc(task.id, nguon.id, "LOI", KHONG_BAT);
	const byte = await deps.kho.doc(nguon.blobPathname);
	if (!byte) return ketThuc(task.id, nguon.id, "LOI", LY_DO.khongTai);
	const bam = createHash("sha256").update(byte).digest("hex");
	if (bam !== nguon.sha256) {
		return ketThuc(task.id, nguon.id, "LOI", LY_DO.bamLech);
	}
	const doc = await docChu(byte, parseKieuNguon(nguon.kieu));
	if (doc.loai === "can-go-tay") {
		return ketThuc(task.id, nguon.id, "CAN_GO_TAY", doc.lyDo);
	}
	if (doc.loai === "loi") return ketThuc(task.id, nguon.id, "LOI", doc.lyDo);
	await db.taiLieuNguon.update({
		where: { id: nguon.id },
		data: { chu: doc.chu, soTrang: doc.soTrang },
	});
	const phien = await deps.moPhien({
		nguonId: nguon.id,
		trangId: nguon.trangId,
		taiBoiId: nguon.taiBoiId,
		chuNguon: doc.chu,
	});
	if (phien.ok) return ketThuc(task.id, nguon.id, "DA_SOAN", null);
	return ketThuc(task.id, nguon.id, "LOI", phien.lyDo);
}
