import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "../src/client";
import {
	capNhatPhien,
	daCat,
	docCuoc,
	docCuocTheoDonVi,
	moCuoc,
	tangLuot,
} from "../src/okr-cuoc-soan";
import { TRO_LY_OKR_TRAN } from "../src/okr-tro-ly-danh-muc";

const T = `cuoc${(process.env.TEST_RUN_ID ?? "x").slice(0, 8)}`;
const id = (phan: string) => `${T}-${phan}`;

async function don() {
	await db.okrCuocSoan.deleteMany({ where: { sessionId: { startsWith: T } } });
	await db.okrCycle.deleteMany({ where: { id: { startsWith: T } } });
	await db.user.deleteMany({ where: { id: { startsWith: T } } });
}

const mo = (
	phan: string,
	v: { level?: "phong-ban" | "bo-phan"; departmentId?: string | null } = {},
) =>
	moCuoc(db, {
		cycleId: id("ky"),
		level: v.level ?? "phong-ban",
		divisionId: null,
		departmentId: v.departmentId === undefined ? id("pb") : v.departmentId,
		nguoiMoUserId: id("u"),
		sessionId: id(phan),
		nac: "bat",
	});

beforeAll(async () => {
	await don();
	await db.user.create({
		data: {
			id: id("u"),
			name: "Người Mở",
			email: `${id("u")}@thu.test`,
			emailVerified: true,
		},
	});
	await db.okrCycle.create({
		data: {
			id: id("ky"),
			kind: "quy",
			name: `Quý ${T}`,
			startsOn: new Date("2032-01-01"),
			endsOn: new Date("2032-03-31"),
		},
	});
});

afterAll(don);

describe("okr-cuoc-soan", () => {
	test("moCuoc: phiên mở đầu nằm trong cacPhien; docCuoc đọc lại đúng kiểu đã parse", async () => {
		const c = await mo("a");
		expect(c).toMatchObject({
			sessionId: id("a"),
			cacPhien: [id("a")],
			trangThai: "dang",
			soLuot: 0,
			streamIndex: 0,
			continuationToken: null,
			daCat: null,
			duaVaoLuc: null,
			level: "phong-ban",
			nac: "bat",
		});
		expect(await docCuoc(db, c.id)).toEqual(c);
		expect(await docCuoc(db, "khong-co")).toBeNull();
	});

	test("docCuoc: giá trị ngoài bảng enum là lỗi thật, không lọt qua", async () => {
		const c = await mo("b");
		await db.okrCuocSoan.update({
			where: { id: c.id },
			data: { trangThai: "la" },
		});
		await expect(docCuoc(db, c.id)).rejects.toThrow("okrCuocSoan.trangThai");
	});

	test("docCuocTheoDonVi: đúng chu kỳ, cấp và đơn vị; mới nhất trước", async () => {
		const cu = await mo("c1", { departmentId: id("pbx") });
		const moi = await mo("c2", { departmentId: id("pbx") });
		await mo("c3", { departmentId: id("pby") });
		const ds = await docCuocTheoDonVi(db, {
			cycleId: id("ky"),
			level: "phong-ban",
			divisionId: null,
			departmentId: id("pbx"),
		});
		expect(ds.map((c) => c.id)).toEqual([moi.id, cu.id]);
	});

	test("capNhatPhien: đổi phiên, nối phiên cũ vào cacPhien, đặt lại luồng; gọi lại cùng phiên không đổi", async () => {
		const c = await mo("d");
		await db.okrCuocSoan.update({
			where: { id: c.id },
			data: { streamIndex: 5, continuationToken: "tok" },
		});
		expect(await capNhatPhien(db, c.id, id("d2"))).toEqual({ doi: true });
		const sau = await docCuoc(db, c.id);
		expect(sau).toMatchObject({
			sessionId: id("d2"),
			cacPhien: [id("d"), id("d2")],
			streamIndex: 0,
			continuationToken: null,
		});
		expect(await capNhatPhien(db, c.id, id("d2"))).toEqual({ doi: false });
		expect((await docCuoc(db, c.id))?.cacPhien).toEqual([id("d"), id("d2")]);
		expect(await capNhatPhien(db, c.id, id("d3"))).toEqual({ doi: true });
		expect((await docCuoc(db, c.id))?.cacPhien).toEqual([
			id("d"),
			id("d2"),
			id("d3"),
		]);
	});

	test("capNhatPhien: cuộc không còn dang thì không đổi; cuộc không có thì không đổi", async () => {
		for (const trangThai of ["da-dua-vao", "bo"]) {
			const c = await mo(`e-${trangThai}`);
			await db.okrCuocSoan.update({ where: { id: c.id }, data: { trangThai } });
			expect(
				await capNhatPhien(db, c.id, id(`e2-${trangThai}`)),
				`doi phien cuoc ${trangThai}`,
			).toEqual({ doi: false });
			const sau = await docCuoc(db, c.id);
			expect(sau?.sessionId).toBe(id(`e-${trangThai}`));
			expect(sau?.cacPhien).toEqual([id(`e-${trangThai}`)]);
		}
		expect(await capNhatPhien(db, "khong-co", id("z"))).toEqual({ doi: false });
	});

	test("tangLuot: đếm từng lượt tới trần rồi từ chối het-luot-cuoc, số không vượt trần", async () => {
		const c = await mo("f");
		const tran = TRO_LY_OKR_TRAN.soan.luotMoiCuoc;
		for (let i = 1; i <= tran; i += 1)
			expect(await tangLuot(db, c.id)).toEqual({ ok: true, soLuot: i });
		expect(await tangLuot(db, c.id), "luot qua tran").toEqual({
			ok: false,
			lyDo: "het-luot-cuoc",
		});
		expect((await docCuoc(db, c.id))?.soLuot).toBe(tran);
	});

	test("tangLuot: trần truyền vào thắng trần mặc định; cuộc không còn dang là cuoc-khong-dang", async () => {
		const c = await mo("g");
		expect(await tangLuot(db, c.id, 1)).toEqual({ ok: true, soLuot: 1 });
		expect(await tangLuot(db, c.id, 1)).toEqual({
			ok: false,
			lyDo: "het-luot-cuoc",
		});
		const bo = await mo("g2");
		await db.okrCuocSoan.update({
			where: { id: bo.id },
			data: { trangThai: "bo" },
		});
		expect(await tangLuot(db, bo.id)).toEqual({
			ok: false,
			lyDo: "cuoc-khong-dang",
		});
		expect((await docCuoc(db, bo.id))?.soLuot).toBe(0);
	});

	test("daCat: ghi bảng cắt và đọc lại y nguyên", async () => {
		const c = await mo("h");
		await daCat(db, c.id, { lop: ["ky-truoc"], soKyTu: 1234 });
		expect((await docCuoc(db, c.id))?.daCat).toEqual({
			lop: ["ky-truoc"],
			soKyTu: 1234,
		});
	});
});
