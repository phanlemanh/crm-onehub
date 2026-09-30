import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "../src/client";
import {
	capNhatPhien,
	cuocDang,
	cuocTuHang,
	daCat,
	demCuocTrongKy,
	dieuKienDonVi,
	docCuoc,
	docCuocTheoDonVi,
	donViCuoc,
	LOAI_DONG_NHAP,
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
	v: {
		cycleId?: string;
		level?: "phong-ban" | "bo-phan";
		departmentId?: string | null;
	} = {},
) =>
	moCuoc(db, {
		cycleId: v.cycleId ?? id("ky"),
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
	await db.okrCycle.create({
		data: {
			id: id("ky2"),
			kind: "quy",
			name: `Quý hai ${T}`,
			startsOn: new Date("2032-04-01"),
			endsOn: new Date("2032-06-30"),
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

	test("LOAI_DONG_NHAP: ba loại dòng nháp theo đúng thứ tự", () => {
		expect(LOAI_DONG_NHAP).toEqual(["muc-tieu-moi", "kr-moi", "can-chinh-moi"]);
	});
});

const hang = {
	id: "c1",
	cycleId: "ky",
	level: "phong-ban",
	divisionId: null,
	departmentId: "pb",
	nguoiMoUserId: "u1",
	sessionId: "s1",
	cacPhien: ["s1"],
	nac: "bat",
	trangThai: "dang",
	soLuot: 0,
	streamIndex: 0,
	continuationToken: null,
	daCat: null,
	duaVaoLuc: null,
	createdAt: new Date("2032-01-02T08:00:00Z"),
};

describe("okr-cuoc-soan: hàm thuần", () => {
	test("cuocTuHang parse ba cột chuỗi thành enum, giữ nguyên các cột khác", () => {
		expect(cuocTuHang(hang)).toEqual({
			...hang,
			level: "phong-ban",
			nac: "bat",
			trangThai: "dang",
		});
	});

	test("cuocTuHang ném khi từng cột chuỗi lạ, gọi tên cột", () => {
		expect(() => cuocTuHang({ ...hang, level: "toan-cau" })).toThrow(
			"okrCuocSoan.level",
		);
		expect(() => cuocTuHang({ ...hang, nac: "nua" })).toThrow(
			"okrCuocSoan.nac",
		);
		expect(() => cuocTuHang({ ...hang, trangThai: "xong" })).toThrow(
			"okrCuocSoan.trangThai",
		);
	});

	test("dieuKienDonVi: mỗi cấp chỉ mang cột của cấp đó, cột cấp khác bị bỏ", () => {
		expect(
			dieuKienDonVi({
				cycleId: "ky",
				level: "onehub",
				divisionId: "bp",
				departmentId: "pb",
			}),
		).toEqual({ cycleId: "ky", level: "onehub" });
		expect(
			dieuKienDonVi({
				cycleId: "ky",
				level: "bo-phan",
				divisionId: "bp",
				departmentId: "pb",
			}),
		).toEqual({ cycleId: "ky", level: "bo-phan", divisionId: "bp" });
		expect(
			dieuKienDonVi({
				cycleId: "ky",
				level: "phong-ban",
				divisionId: "bp",
				departmentId: "pb",
			}),
		).toEqual({ cycleId: "ky", level: "phong-ban", departmentId: "pb" });
	});

	test("donViCuoc: lấy đúng bốn trường đơn vị từ một cuộc", () => {
		expect(donViCuoc(cuocTuHang(hang))).toEqual({
			cycleId: "ky",
			level: "phong-ban",
			divisionId: null,
			departmentId: "pb",
		});
	});
});

describe("okr-cuoc-soan: cuocDang và demCuocTrongKy", () => {
	const dv = (departmentId: string, cycleId = id("ky")) => ({
		cycleId,
		level: "phong-ban" as const,
		divisionId: null,
		departmentId,
	});
	const doi = (cuocId: string, trangThai: string) =>
		db.okrCuocSoan.update({ where: { id: cuocId }, data: { trangThai } });

	test("cuocDang: null khi đơn vị chưa có cuộc nào", async () => {
		expect(await cuocDang(db, dv(id("pb-trong")))).toBeNull();
	});

	test("cuocDang: null khi chỉ có cuộc đã đưa vào hoặc bỏ", async () => {
		const a = await mo("cd-a", { departmentId: id("pb-cd1") });
		const b = await mo("cd-b", { departmentId: id("pb-cd1") });
		await doi(a.id, "da-dua-vao");
		await doi(b.id, "bo");
		expect(await cuocDang(db, dv(id("pb-cd1")))).toBeNull();
	});

	test("cuocDang: trả đúng cuộc dang của đơn vị, không lẫn đơn vị hay kỳ khác", async () => {
		await mo("cd-x", { departmentId: id("pb-cd2x") });
		await mo("cd-k", { departmentId: id("pb-cd2"), cycleId: id("ky2") });
		const cu = await mo("cd-cu", { departmentId: id("pb-cd2") });
		await doi(cu.id, "da-dua-vao");
		const dang = await mo("cd-dang", { departmentId: id("pb-cd2") });
		const kq = await cuocDang(db, dv(id("pb-cd2")));
		expect(kq?.id).toBe(dang.id);
		expect(kq?.trangThai).toBe("dang");
	});

	test("demCuocTrongKy: 0 khi chưa có; đếm mọi trạng thái của đúng đơn vị và đúng kỳ", async () => {
		expect(await demCuocTrongKy(db, dv(id("pb-dem")))).toBe(0);
		const a = await mo("dem-a", { departmentId: id("pb-dem") });
		const b = await mo("dem-b", { departmentId: id("pb-dem") });
		await mo("dem-c", { departmentId: id("pb-dem") });
		await doi(a.id, "da-dua-vao");
		await doi(b.id, "bo");
		await mo("dem-khac-dv", { departmentId: id("pb-dem-khac") });
		await mo("dem-khac-ky", {
			departmentId: id("pb-dem"),
			cycleId: id("ky2"),
		});
		expect(await demCuocTrongKy(db, dv(id("pb-dem")))).toBe(3);
		expect(await demCuocTrongKy(db, dv(id("pb-dem"), id("ky2")))).toBe(1);
	});

	test("docCuocTheoDonVi và cuocDang cùng một điều kiện đơn vị: cuộc có divisionId thừa vẫn được thấy", async () => {
		const c = await moCuoc(db, {
			cycleId: id("ky"),
			level: "phong-ban",
			divisionId: id("bp-thua"),
			departmentId: id("pb-thua"),
			nguoiMoUserId: id("u"),
			sessionId: id("thua"),
			nac: "bat",
		});
		const tim = dv(id("pb-thua"));
		expect((await cuocDang(db, tim))?.id).toBe(c.id);
		expect((await docCuocTheoDonVi(db, tim)).map((x) => x.id)).toEqual([c.id]);
		expect(await demCuocTrongKy(db, tim)).toBe(1);
	});
});
