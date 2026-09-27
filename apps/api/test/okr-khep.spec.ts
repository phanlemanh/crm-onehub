import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { donSanKhep, gieoKyQuy, keoDaiPhien, luc } from "./okr-khep-san";
import { type Ai, doc, dungSan, goi, ok, phien, type TraLoi } from "./okr-san";

dungSan();

const CAU = {
	quanTri: "Cần quyền quản trị để mở chu kỳ hay đổi cấu hình chương trình.",
	chiKhiDangChay: "Chỉ mở rà giữa kỳ khi chu kỳ đang chạy.",
	ngoaiKy: "Khoảng rà phải nằm trong ngày đầu và ngày cuối của chu kỳ.",
	chong: "Khoảng rà chồng ngày với một cửa sổ rà đang mở của chu kỳ này.",
	daDong: "Cửa sổ rà này đã đóng.",
	nguocNgay: "tuNgay <= denNgay",
} as const;

const KY = { tu: "2026-10-01", den: "2026-12-31" } as const;
const RA = { tu: "2026-11-16", den: "2026-11-22" } as const;

type CuaSoDoc = { id: string; tuNgay: string; denNgay: string } | null;
type ChuKyDoc = { id: string; cuaSoRa: CuaSoDoc };

const cuaSoTrenCycles = async (
	cycleId: string,
): Promise<CuaSoDoc | undefined> =>
	(await doc<{ cycles: ChuKyDoc[] }>("okr.cycles")).cycles.find(
		(c) => c.id === cycleId,
	)?.cuaSoRa;

const cuaSoTrongKho = async (cycleId: string) =>
	(
		await db.okrCuaSoRa.findMany({
			where: { cycleId },
			orderBy: { tuNgay: "asc" },
		})
	).map((r) => ({
		tuNgay: ngayVN(r.tuNgay),
		denNgay: ngayVN(r.denNgay),
		mo: r.dongLuc === null,
	}));

const moRa = (
	cycleId: string,
	tuNgay: string,
	denNgay: string,
	ai: Ai = "quan",
) => goi("okr.moRa", { cycleId, tuNgay, denNgay }, ai);

const idCua = (tra: TraLoi, nhan: string) => ok<{ id: string }>(tra, nhan).id;

describe("cua-so-ra", () => {
	beforeAll(keoDaiPhien);
	afterAll(async () => {
		setSystemTime();
		await donSanKhep();
	});

	test("cua-so-ra: mo 16/11–22/11 roi dong — dong okrCuaSoRa, okr.cycles, hai vet mo-ra dong-ra", async () => {
		const quy = await gieoKyQuy(KY);
		luc("2026-11-18T03:00:00Z");

		const id = idCua(await moRa(quy, RA.tu, RA.den), "mo ra");
		const moi = await db.okrCuaSoRa.findUniqueOrThrow({ where: { id } });
		expect({
			cycleId: moi.cycleId,
			tuNgay: ngayVN(moi.tuNgay),
			denNgay: ngayVN(moi.denNgay),
			moBoiUserId: moi.moBoiUserId,
			dongLuc: moi.dongLuc,
			dongBoiUserId: moi.dongBoiUserId,
		}).toEqual({
			cycleId: quy,
			tuNgay: RA.tu,
			denNgay: RA.den,
			moBoiUserId: phien.quan.nguoi,
			dongLuc: null,
			dongBoiUserId: null,
		});
		expect(await cuaSoTrenCycles(quy)).toEqual({
			id,
			tuNgay: RA.tu,
			denNgay: RA.den,
		});

		ok(await goi("okr.dongRa", { id }), "dong ra");
		const dong = await db.okrCuaSoRa.findUniqueOrThrow({ where: { id } });
		expect(dong.dongLuc).toBeInstanceOf(Date);
		expect(dong.dongBoiUserId).toBe(phien.quan.nguoi);
		expect(await cuaSoTrenCycles(quy)).toBeNull();

		const vet = await db.okrTrail.findMany({
			where: { cycleId: quy, action: { in: ["mo-ra", "dong-ra"] } },
		});
		expect(
			vet
				.map((v) => ({
					action: v.action,
					actor: v.actorUserId,
					after: v.after,
				}))
				.sort((a, b) => a.action.localeCompare(b.action)),
		).toEqual([
			{ action: "dong-ra", actor: phien.quan.nguoi, after: expect.anything() },
			{
				action: "mo-ra",
				actor: phien.quan.nguoi,
				after: { tuNgay: RA.tu, denNgay: RA.den },
			},
		]);

		const soVet = await db.okrTrail.count();
		const lai = await goi("okr.dongRa", { id });
		expect(`${lai.status} ${lai.loi}`).toBe(`400 ${CAU.daDong}`);
		expect(await db.okrTrail.count()).toBe(soVet);
	});

	test("cua-so-ra: bien gio VN — 23:59 VN ngay cuoi con trong, 00:00 VN hom sau ngoai; 23:59 VN hom truoc ngay dau ngoai, 00:00 VN ngay dau trong", async () => {
		const quy = await gieoKyQuy(KY);
		luc("2026-11-18T03:00:00Z");
		const id = idCua(await moRa(quy, RA.tu, RA.den), "mo ra bien");
		const trong = { id, tuNgay: RA.tu, denNgay: RA.den };
		const bien = [
			{ nhan: "2026-11-22 23:59 VN", iso: "2026-11-22T16:59:00Z", ky: trong },
			{ nhan: "2026-11-23 00:00 VN", iso: "2026-11-22T17:00:00Z", ky: null },
			{ nhan: "2026-11-15 23:59 VN", iso: "2026-11-15T16:59:00Z", ky: null },
			{ nhan: "2026-11-16 00:00 VN", iso: "2026-11-15T17:00:00Z", ky: trong },
		];
		for (const ca of bien) {
			luc(ca.iso);
			expect({ luc: ca.nhan, cuaSoRa: await cuaSoTrenCycles(quy) }).toEqual({
				luc: ca.nhan,
				cuaSoRa: ca.ky,
			});
		}
	});

	test("cua-so-ra: bay ca tu choi viet truoc — cau ghim, okrCuaSoRa va okrTrail khong doi; doi chung duong ghi duoc", async () => {
		luc("2026-11-18T03:00:00Z");
		const quy = await gieoKyQuy(KY);
		const keHoach = await gieoKyQuy({ ...KY, pha: "lap-ke-hoach" });
		const dangMo = idCua(
			await moRa(quy, "2026-11-01", "2026-11-10"),
			"mo cua so dang mo",
		);
		const CHONG = { tu: "2026-11-10", den: "2026-11-15" } as const;

		const caTuChoi = [
			{
				ten: "ngay truoc startsOn",
				cycle: quy,
				tu: "2026-09-30",
				den: "2026-10-05",
				ai: "quan",
				status: 400,
				cau: CAU.ngoaiKy,
			},
			{
				ten: "ngay sau endsOn",
				cycle: quy,
				tu: "2026-12-25",
				den: "2027-01-02",
				ai: "quan",
				status: 400,
				cau: CAU.ngoaiKy,
			},
			{
				ten: "tuNgay > denNgay",
				cycle: quy,
				tu: RA.den,
				den: RA.tu,
				ai: "quan",
				status: 400,
				cau: CAU.nguocNgay,
			},
			{
				ten: "chong cua so con hieu luc",
				cycle: quy,
				tu: CHONG.tu,
				den: CHONG.den,
				ai: "quan",
				status: 400,
				cau: CAU.chong,
			},
			{
				ten: "pha lap-ke-hoach",
				cycle: keHoach,
				tu: RA.tu,
				den: RA.den,
				ai: "quan",
				status: 400,
				cau: CAU.chiKhiDangChay,
			},
			{
				ten: "thanh vien thuong",
				cycle: quy,
				tu: "2026-11-20",
				den: "2026-11-25",
				ai: "thuong",
				status: 403,
				cau: CAU.quanTri,
			},
			{
				ten: "vai okr",
				cycle: quy,
				tu: "2026-11-20",
				den: "2026-11-25",
				ai: "okr",
				status: 403,
				cau: CAU.quanTri,
			},
		] as const;
		expect(caTuChoi).toHaveLength(7);

		for (const ca of caTuChoi) {
			const truoc = {
				ca: ca.ten,
				cuaSo: await cuaSoTrongKho(ca.cycle),
				soCuaSo: await db.okrCuaSoRa.count(),
				soVet: await db.okrTrail.count(),
			};
			const tra = await moRa(ca.cycle, ca.tu, ca.den, ca.ai);
			expect({
				ca: ca.ten,
				cuaSo: await cuaSoTrongKho(ca.cycle),
				soCuaSo: await db.okrCuaSoRa.count(),
				soVet: await db.okrTrail.count(),
			}).toEqual(truoc);
			expect(`${ca.ten}: ${tra.status}`).toBe(`${ca.ten}: ${ca.status}`);
			expect(tra.loi, ca.ten).toContain(ca.cau);
		}

		ok(await goi("okr.dongRa", { id: dangMo }), "dong cua so dang mo");
		const soCuaSo = await db.okrCuaSoRa.count();
		const soVet = await db.okrTrail.count();
		const duong = idCua(
			await moRa(quy, CHONG.tu, CHONG.den),
			"doi chung duong",
		);
		expect(await db.okrCuaSoRa.count()).toBe(soCuaSo + 1);
		expect(await db.okrTrail.count()).toBe(soVet + 1);
		expect(await cuaSoTrongKho(quy)).toEqual([
			{ tuNgay: "2026-11-01", denNgay: "2026-11-10", mo: false },
			{ tuNgay: CHONG.tu, denNgay: CHONG.den, mo: true },
		]);
		luc("2026-11-12T03:00:00Z");
		expect(await cuaSoTrenCycles(quy)).toEqual({
			id: duong,
			tuNgay: CHONG.tu,
			denNgay: CHONG.den,
		});
	});
});
