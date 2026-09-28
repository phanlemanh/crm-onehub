import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { khoNguonGia } from "@crm/db/test/blob-nguon-gia";
import { TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import { guiMaySoan } from "../agent/lib/tai-lieu-phien";
import { chaySoanTuNguon } from "../agent/lib/tai-lieu-soan";
import { sendGia } from "./support/may-soan-gia";
import {
	datQuyTacViet,
	donTaiLieu,
	gieoNguoi,
	gieoNguon,
	gieoTrang,
	gieoViec,
} from "./support/tai-lieu-gieo";

const LY_DO = TAI_LIEU_AGENT.lyDo;

const gia = khoNguonGia();
const model = sendGia();
let nguoiId = "";
let trangId = "";

async function chay(tep: string, bamKhai?: string) {
	const nguon = await gieoNguon({ tep, trangId, taiBoiId: nguoiId, bamKhai });
	gia.daPut.set(nguon.pathname, nguon.byte);
	const task = await gieoViec(nguon.id);
	const truoc = model.goi.length;
	await chaySoanTuNguon(task, gia);
	const sauDoc = await db.taiLieuNguon.findUniqueOrThrow({
		where: { id: nguon.id },
		select: { trangThai: true },
	});
	if (sauDoc.trangThai === "CHO_SOAN") await guiMaySoan(nguon.id, model.send);
	const hang = await db.taiLieuNguon.findUniqueOrThrow({
		where: { id: nguon.id },
	});
	const xong = await db.agentTask.findUniqueOrThrow({ where: { id: task.id } });
	const deXuat = await db.taiLieuDeXuat.count({ where: { nguonId: nguon.id } });
	return {
		hang,
		goiModel: model.goi.length - truoc,
		lucGoi: model.goi.at(-1)?.trangThaiLucGoi,
		xong: xong.finishedAt !== null,
		deXuat,
	};
}

beforeAll(async () => {
	nguoiId = await gieoNguoi();
	trangId = await gieoTrang(nguoiId);
	await datQuyTacViet(nguoiId, "## Quy tắc\n\nViết ngắn.");
});

afterAll(async () => {
	await donTaiLieu([nguoiId]);
});

describe("doc-chu", () => {
	test("doc-chu: ma tran 9 ca viet truoc", async () => {
		const dong: string[] = [];
		const ghi = (ca: string, dat: boolean) => {
			dong.push(`${ca}: ${dat ? "dat" : "SAI"}`);
			expect(`${ca}: ${dat}`).toBe(`${ca}: true`);
		};
		for (const [tep, moc] of [
			["quyet-dinh.docx", ["1,5%", "01/10/2026", "Tầng hai", "1,8%"]],
			["quy-trinh.pdf", ["48 giờ", "01/10/2026", "Ngoại lệ"]],
		] as const) {
			const r = await chay(tep);
			const chu = r.hang.chu ?? "";
			ghi(
				tep,
				moc.every((m) => chu.includes(m)) &&
					chu === chu.normalize("NFC") &&
					r.goiModel === 1 &&
					r.lucGoi === "DANG_SOAN" &&
					r.xong,
			);
		}
		const theoDoi = await chay("theo-doi.docx");
		ghi(
			"theo-doi.docx",
			(theoDoi.hang.chu ?? "").includes("1,8%") &&
				!(theoDoi.hang.chu ?? "").includes("1,6%"),
		);
		for (const tep of ["ban-quet.pdf", "cid.pdf", "fffd.pdf"]) {
			const r = await chay(tep);
			const lot =
				tep === "cid.pdf" && r.goiModel > 0
					? " ban loi ma lot qua: cid.pdf"
					: "";
			ghi(
				`${tep}${lot}`,
				r.hang.trangThai === "CAN_GO_TAY" &&
					r.goiModel === 0 &&
					r.deXuat === 0 &&
					r.xong,
			);
		}
		for (const [tep, lyDo] of [
			["hong.docx", LY_DO.tepHong],
			["mat-khau.pdf", LY_DO.matKhau],
		] as const) {
			const r = await chay(tep);
			ghi(
				tep,
				r.hang.trangThai === "LOI" && r.hang.lyDo === lyDo && r.goiModel === 0,
			);
		}
		const lech = await chay("quyet-dinh.docx", "0".repeat(64));
		ghi(
			"bam-lech",
			lech.hang.trangThai === "LOI" &&
				lech.hang.lyDo === LY_DO.bamLech &&
				lech.goiModel === 0,
		);
		for (const d of dong) console.log(d);
		expect(dong.length).toBe(9);
	});
});
