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
import { timOkr } from "../agent/lib/hoi-doc";
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
});
