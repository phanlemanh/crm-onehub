import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
	docCaiDatNhieuNguoi,
	docCaiDatThongBao,
	luuCaiDatThongBao,
	type MacDinhDayRa,
} from "../src/cai-dat-thong-bao";
import { db } from "../src/client";

const MA = `ccd${Date.now().toString(36)}`;
const A = `${MA}-a`;
const B = `${MA}-b`;

const MAC_DINH = new Map([
	["okr-duoc-giao", true],
	["tac-nhan-xong", false],
]);
const macDinh: MacDinhDayRa = (l) => MAC_DINH.get(l) ?? null;

beforeAll(async () => {
	for (const id of [A, B]) {
		await db.user.create({ data: { id, name: id, email: `${id}@thu.test` } });
	}
});

afterAll(async () => {
	await db.user.deleteMany({ where: { id: { in: [A, B] } } });
});

describe("ccd-doc", () => {
	test("ccd-doc: khong hang thi moi loai theo mac dinh", async () => {
		const doc = await docCaiDatThongBao(db, A, macDinh);
		expect(doc("okr-duoc-giao")).toEqual({
			dayRa: true,
			macDinh: true,
			doiLuc: null,
		});
		expect(doc("tac-nhan-xong").dayRa).toBe(false);
	});

	test("ccd-doc: luu khac mac dinh thi doc lai thay, nguoi khac khong doi", async () => {
		const luu = await luuCaiDatThongBao(db, A, "okr-duoc-giao", false, macDinh);
		expect(luu.macDinh).toBe(false);
		const doc = await docCaiDatThongBao(db, A, macDinh);
		expect(doc("okr-duoc-giao").dayRa).toBe(false);
		expect(doc("okr-duoc-giao").doiLuc).not.toBeNull();
		const docB = await docCaiDatThongBao(db, B, macDinh);
		expect(docB("okr-duoc-giao").macDinh, "luu doi cai dat nguoi khac").toBe(
			true,
		);
	});

	test("ccd-doc: luu trung mac dinh thi xoa hang", async () => {
		await luuCaiDatThongBao(db, A, "okr-duoc-giao", true, macDinh);
		const dem = await db.caiDatThongBao.count({
			where: { userId: A, loai: "okr-duoc-giao" },
		});
		expect(dem, "hang mac dinh con trong kho").toBe(0);
	});

	test("ccd-doc: hang loai la khong lam hong doc", async () => {
		await db.caiDatThongBao.create({
			data: { userId: A, loai: "loai-da-bo", dayRa: true },
		});
		const doc = await docCaiDatThongBao(db, A, macDinh);
		expect(doc("tac-nhan-xong").dayRa).toBe(false);
		const nhieu = await docCaiDatNhieuNguoi(db, [A, B], macDinh);
		expect(nhieu.get(B)?.("okr-duoc-giao").macDinh).toBe(true);
	});

	test("ccd-doc: luu loai khong ton tai bi tu choi", async () => {
		await expect(
			luuCaiDatThongBao(db, A, "khong-co", true, macDinh),
		).rejects.toThrow("loai thong bao khong ton tai");
	});
});
