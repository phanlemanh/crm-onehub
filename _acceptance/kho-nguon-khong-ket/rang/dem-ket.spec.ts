import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
	dongNguonMoCoi,
	guiMaySoan,
} from "../../../apps/agent/agent/lib/tai-lieu-phien.ts";
import { chaySoanTuNguon } from "../../../apps/agent/agent/lib/tai-lieu-soan.ts";
import { completeTask } from "../../../apps/agent/agent/lib/tasks.ts";
import { sendGia } from "../../../apps/agent/test/support/may-soan-gia.ts";
import {
	DOAN_QUYET_DINH,
	datQuyTacViet,
	docMau,
	docxTu,
	donTaiLieu,
	gieoNguoi,
	gieoNguon,
	gieoTrang,
	gieoViec,
} from "../../../apps/agent/test/support/tai-lieu-gieo.ts";
import { db } from "../../../packages/db/src/index.ts";
import { khoNguonGia } from "../../../packages/db/test/blob-nguon-gia.ts";
import { CAU, demKet } from "./dem-ket.ts";

const PHUT_MS = 60_000;
const BAY_GIO = new Date();
const truoc = (phut: number) => new Date(BAY_GIO.getTime() - phut * PHUT_MS);

let nguoiId = "";

beforeAll(async () => {
	nguoiId = await gieoNguoi();
	await datQuyTacViet(nguoiId, "## Quy tắc viết\n\nViết ngắn.");
});

afterAll(async () => {
	await donTaiLieu([nguoiId]);
});

async function moi(ten: string, tep = "quyet-dinh.docx", muc?: string) {
	const trangId = await gieoTrang(nguoiId);
	const byte = tep.endsWith(".pdf")
		? docMau(tep)
		: docxTu([...DOAN_QUYET_DINH, ten]);
	const nguon = await gieoNguon({
		tep,
		trangId,
		taiBoiId: nguoiId,
		byte,
		trangThai: muc,
	});
	const kho = khoNguonGia();
	kho.daPut.set(nguon.pathname, nguon.byte);
	const viec = await gieoViec(nguon.id);
	return { nguon, viec, kho };
}

async function luiViec(taskId: string, phut: number) {
	await db.agentTask.update({
		where: { id: taskId },
		data: { createdAt: truoc(phut) },
	});
}

async function chupAnh() {
	const [nguon, viec] = await Promise.all([
		db.taiLieuNguon.findMany({
			select: { id: true, trangThai: true, lyDo: true },
			orderBy: { id: "asc" },
		}),
		db.agentTask.findMany({
			select: { id: true, finishedAt: true, attempts: true },
			orderBy: { id: "asc" },
		}),
	]);
	return JSON.stringify({ nguon, viec });
}

describe("kn-dem-ket", () => {
	test("kn-dem-ket: bang viet truoc 10 nguon, chi doc", async () => {
		const model = sendGia();
		const doc40 = await moi("doc40");
		await luiViec(doc40.viec.id, 40);
		const doc10 = await moi("doc10");
		await luiViec(doc10.viec.id, 10);
		const doc29 = await moi("doc29");
		await luiViec(doc29.viec.id, 29);
		const soan45 = await moi("soan45");
		await chaySoanTuNguon(soan45.viec, soan45.kho);
		await luiViec(soan45.viec.id, 45);
		const dang31 = await moi("dang31");
		await chaySoanTuNguon(dang31.viec, dang31.kho);
		await guiMaySoan(dang31.nguon.id, model.send);
		await luiViec(dang31.viec.id, 5);
		await db.taiLieuNguon.update({
			where: { id: dang31.nguon.id },
			data: { soanLuc: truoc(31) },
		});
		const dang5 = await moi("dang5");
		await chaySoanTuNguon(dang5.viec, dang5.kho);
		await guiMaySoan(dang5.nguon.id, model.send);
		await luiViec(dang5.viec.id, 60);
		await db.taiLieuNguon.update({
			where: { id: dang5.nguon.id },
			data: { soanLuc: truoc(5) },
		});
		const daSoan = await moi("daSoan", "quyet-dinh.docx", "DA_SOAN");
		await completeTask(daSoan.viec.id, "thu");
		await luiViec(daSoan.viec.id, 60);
		const goTay = await moi("goTay", "ban-quet.pdf");
		await chaySoanTuNguon(goTay.viec, goTay.kho);
		await luiViec(goTay.viec.id, 60);
		const docLoi = await moi("docLoi");
		docLoi.kho.doc = async () => {
			throw new Error("loi tam thoi");
		};
		await chaySoanTuNguon(docLoi.viec, docLoi.kho);
		const moCoi = await moi("moCoi");
		await completeTask(moCoi.viec.id, "thu");
		await dongNguonMoCoi();

		const muc = await db.taiLieuNguon.findMany({
			where: { taiBoiId: nguoiId },
			select: { trangThai: true },
		});
		expect(muc.map((m) => m.trangThai).sort()).toEqual([
			"CAN_GO_TAY",
			"CHO_DOC",
			"CHO_DOC",
			"CHO_DOC",
			"CHO_SOAN",
			"DANG_SOAN",
			"DANG_SOAN",
			"DA_SOAN",
			"LOI",
			"LOI",
		]);
		const anhTruoc = await chupAnh();
		const kq = await demKet(db, BAY_GIO);
		const anhSau = await chupAnh();
		const sai: string[] = [];
		if (kq.ket30.CHO_DOC !== 1)
			sai.push(`kn-dem-ket: ket30 sai o CHO_DOC (${kq.ket30.CHO_DOC})`);
		if (kq.ket30.DANG_SOAN !== 1 || !kq.nguonKet.includes(dang31.nguon.id)) {
			sai.push(`kn-dem-ket: ket30 sai o DANG_SOAN (${kq.ket30.DANG_SOAN})`);
		}
		expect(sai).toEqual([]);
		expect(kq.ket30).toEqual({ CHO_DOC: 1, CHO_SOAN: 1, DANG_SOAN: 1 });
		expect([...kq.nguonKet].sort()).toEqual(
			[doc40.nguon.id, soan45.nguon.id, dang31.nguon.id].sort(),
		);
		expect(kq.loi).toEqual({ docLoi: 1, moCoi: 1 });
		expect(CAU.moCoi).toBe(
			"Kara dừng giữa chừng — bấm Soạn lại để thử lần nữa.",
		);
		expect(CAU.moCoiCu).toBe(
			"Máy soạn dừng giữa chừng — bấm Soạn lại để thử lần nữa.",
		);
		expect(anhSau).toBe(anhTruoc);
	});
});
