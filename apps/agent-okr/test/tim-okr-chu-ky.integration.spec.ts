import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { dieuKienXemMucTieu, nguCanhXemOkr } from "@crm/db/okr-hien-thi";
import { TRO_LY_OKR_HOI } from "../agent/lib/config";
import { docOkr, timOkr } from "../agent/lib/hoi-doc";
import { boMau } from "./support/bo-mau";
import { moXuong } from "./support/gieo";

const { idMau, lamSachOkr, napMau, xoaBoOkrMau } = await boMau();

const MOC_MAU = new Date("2026-11-12T15:00:00+07:00");
const QUAN_TRI = idMau("nguoi", "le-hai-dang");
const CHU_KY_Q4 = idMau("chu-ky", "quy4");
const TINH_TRANG = [
	"dung-nhip",
	"cham-nhip",
	"truot",
	"chua-co-ky-vong",
] as const;

async function demThay(userId: string, cycleIds: string[]): Promise<number> {
	const nc = (await nguCanhXemOkr(db, [userId])).get(userId);
	if (!nc) throw new Error(`thieu ngu canh xem cua ${userId}`);
	return db.okrObjective.count({
		where: {
			AND: [
				dieuKienXemMucTieu(nc),
				{ status: "cong-bo" },
				{ cycleId: { in: cycleIds } },
			],
		},
	});
}

beforeAll(async () => {
	setSystemTime();
	await moXuong();
	await lamSachOkr();
	await xoaBoOkrMau(db);
	await napMau(MOC_MAU);
	setSystemTime(MOC_MAU);
}, 120_000);

afterAll(async () => {
	setSystemTime();
	await lamSachOkr();
	await xoaBoOkrMau(db);
});

describe("hdo tim_okr chu ky", () => {
	test("khong ghi cycleId thi chi tra quy hien tai, va liet ke chu ky xem duoc kem id", async () => {
		const kq = await timOkr(QUAN_TRI, {}, MOC_MAU);
		expect(kq.mucTieu.length).toBeGreaterThan(0);
		expect(kq.mucTieu.every((m) => m.chuKyId === CHU_KY_Q4)).toBe(true);
		expect(kq.chuKy.filter((c) => c.hienTai).map((c) => c.id)).toEqual([
			CHU_KY_Q4,
		]);
		const khac = kq.chuKy.find((c) => !c.hienTai);
		if (!khac) throw new Error("bo mau chi co mot chu ky");
		const theoKy = await timOkr(QUAN_TRI, { cycleId: khac.id }, MOC_MAU);
		expect(theoKy.mucTieu.every((m) => m.chuKyId === khac.id)).toBe(true);
	});

	test("loc tinh trang truoc khi cat, conThem noi dung khi bi cat", async () => {
		const tong = await demThay(QUAN_TRI, [CHU_KY_Q4]);
		const kq = await timOkr(QUAN_TRI, {}, MOC_MAU);
		expect(kq.conThem).toBe(tong > TRO_LY_OKR_HOI.tranKetQua.mucTieu);
		let cong = 0;
		for (const tinhTrang of TINH_TRANG) {
			const r = await timOkr(QUAN_TRI, { tinhTrang }, MOC_MAU);
			expect(r.mucTieu.every((m) => m.tinhTrang === tinhTrang)).toBe(true);
			cong += r.conThem
				? TRO_LY_OKR_HOI.tranKetQua.mucTieu + 1
				: r.mucTieu.length;
		}
		expect(cong).toBeGreaterThanOrEqual(tong);
	});

	test("moi Muc tieu va KR mang co cuaBan dung voi nguoi phu trach trong kho", async () => {
		for (const ma of ["ngo-van-toan", "thai-minh-chau", "nguyen-thi-lan"]) {
			const uid = idMau("nguoi", ma);
			const kq = await timOkr(uid, { cuaToi: true }, MOC_MAU);
			expect(kq.mucTieu.length, ma).toBeGreaterThan(0);
			const that = await db.okrObjective.findMany({
				where: { id: { in: kq.mucTieu.map((m) => m.id) } },
				select: {
					id: true,
					ownerUserId: true,
					personUserId: true,
					keyResults: { select: { id: true, ownerUserId: true } },
				},
			});
			const mong = that.flatMap((m) => [
				`${m.id}:${m.ownerUserId === uid || m.personUserId === uid}`,
				...m.keyResults.map((k) => `${k.id}:${k.ownerUserId === uid}`),
			]);
			const ra = kq.mucTieu.flatMap((m) => [
				`${m.id}:${m.cuaBan}`,
				...m.kr.map((k) => `${k.id}:${k.cuaBan}`),
			]);
			expect(ra.sort(), ma).toEqual(mong.sort());
			expect(
				ra.some((x) => x.endsWith(":true")),
				ma,
			).toBe(true);
		}
		const doc = await docOkr(
			idMau("nguoi", "ngo-van-toan"),
			{ loai: "objective", id: idMau("mt", "q4-kd-bac-1") },
			MOC_MAU,
		);
		if (!doc.ok) throw new Error("ngo-van-toan khong doc duoc q4-kd-bac-1");
		expect(doc.mucTieu.kr.filter((k) => k.cuaBan).map((k) => k.id)).toEqual([
			idMau("kr", "q4-kd-bac-1-k3"),
		]);
	});
});
