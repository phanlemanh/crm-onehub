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
import {
	donSanKhep,
	gieoKyQuy,
	gieoMucTieuCongBo,
	keoDaiPhien,
	luc,
} from "./okr-khep-san";
import {
	type Ai,
	doc,
	dungSan,
	goi,
	type Json,
	ma,
	ok,
	phien,
	type TraLoi,
} from "./okr-san";

dungSan();

const CAU = {
	quanTri: "Cần quyền quản trị để mở chu kỳ hay đổi cấu hình chương trình.",
	chiKhiDangChay: "Chỉ mở rà giữa kỳ khi chu kỳ đang chạy.",
	ngoaiKy: "Khoảng rà phải nằm trong ngày đầu và ngày cuối của chu kỳ.",
	chong: "Khoảng rà chồng ngày với một cửa sổ rà đang mở của chu kỳ này.",
	daDong: "Cửa sổ rà này đã đóng.",
	nguocNgay: "tuNgay <= denNgay",
	lyDoDoiDich: "Đổi đích ngoài rà giữa kỳ cần lý do",
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

const doiDichKr = (id: string, vao: Record<string, Json> = {}) =>
	goi("okr.updateKeyResult", { id, ...vao });

const dongDoiDich = async (keyResultId: string) =>
	(
		await db.okrDoiDich.findMany({
			where: { keyResultId },
			orderBy: { luc: "asc" },
		})
	).map((d) => ({
		truoc: Number(d.truoc),
		sau: Number(d.sau),
		lyDo: d.lyDo,
		ngoaiRa: d.ngoaiRa,
		cuaSoRaId: d.cuaSoRaId,
		tacGiaUserId: d.tacGiaUserId,
	}));

const dichKr = async (id: string) =>
	Number(
		(await db.okrKeyResult.findUniqueOrThrow({ where: { id } })).targetValue,
	);

const vetKr = async (keyResultId: string, action: string) =>
	(
		await db.okrTrail.findMany({
			where: { keyResultId, action },
			orderBy: { at: "asc" },
		})
	).map((v) => ({ before: v.before, after: v.after, note: v.note }));

async function tuChoiDoiDich(
	ca: string,
	krId: string,
	vao: Record<string, Json>,
	cau: string,
) {
	const truoc = {
		ca,
		dich: await dichKr(krId),
		soDoiDich: await db.okrDoiDich.count(),
		soVet: await db.okrTrail.count(),
	};
	const tra = await doiDichKr(krId, vao);
	expect({
		ca,
		dich: await dichKr(krId),
		soDoiDich: await db.okrDoiDich.count(),
		soVet: await db.okrTrail.count(),
	}).toEqual(truoc);
	expect(`${ca}: ${tra.status}`).toBe(`${ca}: 400`);
	expect(tra.loi, ca).toContain(cau);
}

async function mucTieuNhap(cycleId: string): Promise<string> {
	const objectiveId = ok<{ id: string }>(
		await goi("okr.createObjective", {
			cycleId,
			unit: { level: "onehub" },
			title: ma("muc tieu nhap khep"),
			kind: "cam-ket",
			ownerUserId: phien.quan.nguoi,
			participantIds: [],
			whyNow: "",
		}),
		"tao muc tieu nhap",
	).id;
	return ok<{ id: string }>(
		await goi("okr.createKeyResult", {
			objectiveId,
			title: ma("kr nhap khep"),
			kind: "tang-toi",
			ownerUserId: phien.quan.nguoi,
			startValue: 60,
			targetValue: 80,
			currentValue: 60,
			unit: "",
			dueOn: null,
			weight: 1,
		}),
		"tao kr nhap",
	).id;
}

const TRONG_RA = "2026-11-18T03:00:00Z";
const NGOAI_RA = "2026-11-25T03:00:00Z";
const LY_DO_12 = "khach doi ke";

describe("doi-dich", () => {
	beforeAll(keoDaiPhien);
	afterAll(async () => {
		setSystemTime();
		await donSanKhep();
	});

	test("doi-dich: (a) trong ra khong ly do ghi duoc; (b) ngoai ra khong ly do tu choi; (c) ly do 9 ky tu tu choi, 12 ky tu ghi duoc", async () => {
		luc(TRONG_RA);
		const quy = await gieoKyQuy(KY);
		const {
			krIds: [k = ""],
		} = await gieoMucTieuCongBo(quy, [
			{ startValue: 60, targetValue: 80, currentValue: 60 },
		]);
		const ra = idCua(await moRa(quy, RA.tu, RA.den), "mo ra doi dich");
		const quan = phien.quan.nguoi;

		ok(await doiDichKr(k, { targetValue: 85 }), "(a) trong ra");
		expect(await dichKr(k)).toBe(85);
		expect(await dongDoiDich(k)).toEqual([
			{
				truoc: 80,
				sau: 85,
				lyDo: "",
				ngoaiRa: false,
				cuaSoRaId: ra,
				tacGiaUserId: quan,
			},
		]);
		expect(await vetKr(k, "doi-dich")).toEqual([
			{
				before: { targetValue: 80 },
				after: { targetValue: 85, ngoaiRa: false },
				note: null,
			},
		]);

		luc(NGOAI_RA);
		await tuChoiDoiDich(
			"(b) ngoai ra khong ly do",
			k,
			{ targetValue: 80 },
			CAU.lyDoDoiDich,
		);
		await tuChoiDoiDich(
			"(c) ngoai ra ly do 9 ky tu",
			k,
			{ targetValue: 80, lyDoDoiDich: "123456789" },
			"lyDoDoiDich",
		);

		ok(
			await doiDichKr(k, { targetValue: 80, lyDoDoiDich: LY_DO_12 }),
			"(c) ly do 12 ky tu",
		);
		expect(await dichKr(k)).toBe(80);
		expect((await dongDoiDich(k))[1]).toEqual({
			truoc: 85,
			sau: 80,
			lyDo: LY_DO_12,
			ngoaiRa: true,
			cuaSoRaId: null,
			tacGiaUserId: quan,
		});
		expect((await vetKr(k, "doi-dich"))[1]).toEqual({
			before: { targetValue: 85 },
			after: { targetValue: 80, ngoaiRa: true },
			note: LY_DO_12,
		});
	});

	test("doi-dich: (d) KR cua muc tieu nhap doi dich ngoai ra — khong dong okrDoiDich, vet sua-kr nhu cu", async () => {
		luc(NGOAI_RA);
		const quy = await gieoKyQuy(KY);
		const k = await mucTieuNhap(quy);
		ok(await doiDichKr(k, { targetValue: 90 }), "(d) nhap doi dich");
		expect(await dichKr(k)).toBe(90);
		expect(await dongDoiDich(k)).toEqual([]);
		expect(await vetKr(k, "doi-dich")).toEqual([]);
		expect(await vetKr(k, "sua-kr")).toEqual([
			{
				before: { targetValue: 80 },
				after: { targetValue: 90 },
				note: null,
			},
		]);
	});

	test("doi-dich: chi doi ten, don vi (dich giu nguyen) ngoai ra khong doi ly do, khong dong okrDoiDich", async () => {
		luc(NGOAI_RA);
		const quy = await gieoKyQuy(KY);
		const {
			krIds: [k = ""],
		} = await gieoMucTieuCongBo(quy, [
			{ startValue: 60, targetValue: 80, currentValue: 60 },
		]);
		const ten = ma("ten moi ngoai ra");
		ok(
			await doiDichKr(k, { title: ten, unit: "hop dong", targetValue: 80 }),
			"doi ten ngoai ra",
		);
		const sau = await db.okrKeyResult.findUniqueOrThrow({ where: { id: k } });
		expect([sau.title, sau.unit, Number(sau.targetValue)]).toEqual([
			ten,
			"hop dong",
			80,
		]);
		expect(await dongDoiDich(k)).toEqual([]);
		expect(await vetKr(k, "doi-dich")).toEqual([]);
	});

	test("doi-dich: bien gio VN — 23:59 VN hom truoc ngay dau ngoai, 00:00 VN ngay dau trong, 23:59 VN ngay cuoi trong, 00:00 VN hom sau ngay cuoi ngoai", async () => {
		luc(TRONG_RA);
		const quy = await gieoKyQuy(KY);
		const {
			krIds: [k = ""],
		} = await gieoMucTieuCongBo(quy, [
			{ startValue: 0, targetValue: 100, currentValue: 0 },
		]);
		const ra = idCua(await moRa(quy, RA.tu, RA.den), "mo ra bien doi dich");
		const bien = [
			{
				nhan: "2026-11-15 23:59 VN",
				iso: "2026-11-15T16:59:00Z",
				trong: false,
			},
			{ nhan: "2026-11-16 00:00 VN", iso: "2026-11-15T17:00:00Z", trong: true },
			{ nhan: "2026-11-22 23:59 VN", iso: "2026-11-22T16:59:00Z", trong: true },
			{
				nhan: "2026-11-23 00:00 VN",
				iso: "2026-11-22T17:00:00Z",
				trong: false,
			},
		];
		const thay: string[] = [];
		const mong: string[] = [];
		for (const [i, ca] of bien.entries()) {
			luc(ca.iso);
			const truoc = await dichKr(k);
			const moi = 101 + i;
			const soDong = (await dongDoiDich(k)).length;
			const soVet = await db.okrTrail.count();
			const tra = await doiDichKr(k, { targetValue: moi });
			const dong = await dongDoiDich(k);
			const cuoi = dong.length > soDong ? dong.at(-1) : undefined;
			thay.push(
				[
					`${ca.nhan}: ${tra.status}`,
					tra.loi.includes(CAU.lyDoDoiDich) ? "cau ghim" : "khong cau ghim",
					`dich ${truoc}→${await dichKr(k)}`,
					`okrDoiDich +${dong.length - soDong}`,
					`vet +${(await db.okrTrail.count()) - soVet}`,
					cuoi
						? `truoc ${cuoi.truoc} sau ${cuoi.sau} ngoaiRa ${cuoi.ngoaiRa} cuaSoRa ${cuoi.cuaSoRaId === ra} lyDo "${cuoi.lyDo}" tacGia ${cuoi.tacGiaUserId === phien.quan.nguoi}`
						: "-",
				].join(" · "),
			);
			mong.push(
				ca.trong
					? [
							`${ca.nhan}: 200`,
							"khong cau ghim",
							`dich ${truoc}→${moi}`,
							"okrDoiDich +1",
							"vet +2",
							`truoc ${truoc} sau ${moi} ngoaiRa false cuaSoRa true lyDo "" tacGia true`,
						].join(" · ")
					: [
							`${ca.nhan}: 400`,
							"cau ghim",
							`dich ${truoc}→${truoc}`,
							"okrDoiDich +0",
							"vet +0",
							"-",
						].join(" · "),
			);
		}
		expect(thay).toEqual(mong);
	});
});
