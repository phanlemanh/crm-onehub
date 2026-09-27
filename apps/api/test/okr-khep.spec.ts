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
import type { KieuKr } from "@crm/validation/okr-kr";
import { chupSoOkr } from "../../agent/agent/lib/okr-chup";
import { kiemDongKy } from "../src/okr/khep";
import { OKR } from "../src/okr/okr-config";
import {
	donSanKhep,
	gieoKyQuy,
	gieoMucTieuCongBo,
	guiSo,
	type KrGieo,
	keoDaiPhien,
	luc,
} from "./okr-khep-san";
import {
	type Ai,
	CHUONG_TRINH_RONG,
	doc,
	dungSan,
	goi,
	type Json,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phien,
	type TraLoi,
	truongMoi,
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
	chamTuNgaySau: "Sang chấm điểm từ ngày sau ngày cuối của chu kỳ",
	thieuSoNgayCuoi: (n: number) => `Còn ${n} KR nguồn CRM chưa có số ngày cuối`,
	tungBuoc: "Pha đi từng bước",
	conKrChuaCham: (n: number) => `Còn ${n} KR chưa chấm`,
	krCoDoiDich: "KR đã có lần đổi đích — sửa được, không xoá được.",
	krCoDiem: "KR đã có điểm cuối kỳ — không xoá được.",
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

type O = {
	nhan: string;
	kind: KieuKr;
	startValue: number;
	targetValue: number;
	chot: number;
	goiY: number;
	nguon?: "crm" | "api";
};

const SO_CHOT_CRM = 2;

const BANG_20: readonly O[] = [
	{
		nhan: "tang-toi 60→80 chot 70",
		kind: "tang-toi",
		startValue: 60,
		targetValue: 80,
		chot: 70,
		goiY: 0.5,
	},
	{
		nhan: "tang-toi 60→80 chot 80",
		kind: "tang-toi",
		startValue: 60,
		targetValue: 80,
		chot: 80,
		goiY: 1,
	},
	{
		nhan: "tang-toi 60→80 chot 90",
		kind: "tang-toi",
		startValue: 60,
		targetValue: 80,
		chot: 90,
		goiY: 1,
	},
	{
		nhan: "tang-toi 0→100 chot 84",
		kind: "tang-toi",
		startValue: 0,
		targetValue: 100,
		chot: 84,
		goiY: 0.8,
	},
	{
		nhan: "tang-toi 0→100 chot 85",
		kind: "tang-toi",
		startValue: 0,
		targetValue: 100,
		chot: 85,
		goiY: 0.9,
	},
	{
		nhan: "tang-toi 0→100 chot 86",
		kind: "tang-toi",
		startValue: 0,
		targetValue: 100,
		chot: 86,
		goiY: 0.9,
	},
	{
		nhan: "giam-xuong 8→2 chot 5",
		kind: "giam-xuong",
		startValue: 8,
		targetValue: 2,
		chot: 5,
		goiY: 0.5,
	},
	{
		nhan: "giam-xuong 8→2 chot 2 (nguon crm)",
		kind: "giam-xuong",
		startValue: 8,
		targetValue: 2,
		chot: SO_CHOT_CRM,
		goiY: 1,
		nguon: "crm",
	},
	{
		nhan: "giam-xuong 8→2 chot 1",
		kind: "giam-xuong",
		startValue: 8,
		targetValue: 2,
		chot: 1,
		goiY: 1,
	},
	{
		nhan: "giu-tren 90 chot 85",
		kind: "giu-tren",
		startValue: 80,
		targetValue: 90,
		chot: 85,
		goiY: 0,
	},
	{
		nhan: "giu-tren 90 chot 90",
		kind: "giu-tren",
		startValue: 80,
		targetValue: 90,
		chot: 90,
		goiY: 1,
	},
	{
		nhan: "giu-tren 90 chot 95 (nguon api)",
		kind: "giu-tren",
		startValue: 80,
		targetValue: 90,
		chot: 95,
		goiY: 1,
		nguon: "api",
	},
	{
		nhan: "giu-duoi 5 chot 6",
		kind: "giu-duoi",
		startValue: 7,
		targetValue: 5,
		chot: 6,
		goiY: 0,
	},
	{
		nhan: "giu-duoi 5 chot 5",
		kind: "giu-duoi",
		startValue: 7,
		targetValue: 5,
		chot: 5,
		goiY: 1,
	},
	{
		nhan: "giu-duoi 5 chot 4",
		kind: "giu-duoi",
		startValue: 7,
		targetValue: 5,
		chot: 4,
		goiY: 1,
	},
	{
		nhan: "moc chot 0",
		kind: "moc",
		startValue: 0,
		targetValue: 1,
		chot: 0,
		goiY: 0,
	},
	{
		nhan: "moc chot 1",
		kind: "moc",
		startValue: 0,
		targetValue: 1,
		chot: 1,
		goiY: 1,
	},
	{
		nhan: "phan-tram 20→80 chot 50",
		kind: "phan-tram",
		startValue: 20,
		targetValue: 80,
		chot: 50,
		goiY: 0.5,
	},
	{
		nhan: "phan-tram 20→80 chot 80",
		kind: "phan-tram",
		startValue: 20,
		targetValue: 80,
		chot: 80,
		goiY: 0.8,
	},
	{
		nhan: "phan-tram 20→80 chot 100",
		kind: "phan-tram",
		startValue: 20,
		targetValue: 80,
		chot: 100,
		goiY: 1,
	},
];

const LUC = {
	gieo: "2026-12-20T03:00:00Z",
	ngayCuoi2300: "2026-12-31T16:00:00Z",
	homSau0002: "2026-12-31T17:02:00Z",
	homSau0005: "2026-12-31T17:05:00Z",
	homSau0010: "2026-12-31T17:10:00Z",
	sauKy: "2027-01-02T03:00:00Z",
} as const;

const sangCham = (id: string, ai: Ai = "quan") =>
	goi("okr.setCyclePhase", { id, phase: "cham-diem" }, ai);

const phaCua = async (id: string) =>
	(await db.okrCycle.findUniqueOrThrow({ where: { id } })).phase;

const soDongDiem = (cycleId: string) =>
	db.okrDiemKr.count({ where: { cycleId } });

const tuChoi = (tra: TraLoi) => `${tra.status} ${tra.loi}`;

const kr1 = (): KrGieo[] => [
	{ startValue: 0, targetValue: 100, currentValue: 0 },
];

const san = { nguoiBan: "" };

async function gieoThoaThuan(): Promise<void> {
	san.nguoiBan = await nguoiMoi("khep-ban");
	const cty = await db.company.create({ data: { name: ma("khep-cty") } });
	await db.deal.createMany({
		data: Array.from({ length: SO_CHOT_CRM }, () => ({
			name: ma("khep-thoa-thuan"),
			companyId: cty.id,
			ownerId: san.nguoiBan,
			stage: "CLOSED_WON" as const,
			closedAt: new Date("2026-11-10T03:00:00Z"),
		})),
	});
}

function nguonGieo(o: O): KrGieo["nguon"] {
	if (o.nguon === "crm")
		return {
			loai: "crm",
			chiSo: "thoa-thuan-chot-duoc",
			phamVi: { kieu: "nguoi", id: san.nguoiBan },
		};
	if (o.nguon === "api") return { loai: "api" };
	return undefined;
}

function krGieo(o: O): KrGieo {
	const kr: KrGieo = {
		kind: o.kind,
		startValue: o.startValue,
		targetValue: o.targetValue,
		currentValue: o.startValue,
	};
	const nguon = nguonGieo(o);
	if (nguon) kr.nguon = nguon;
	return kr;
}

async function chayBoSangCham(thang: "0-1" | "0-100") {
	luc(LUC.gieo);
	await keoDaiPhien();
	const weightsOn = thang === "0-100";
	const version = ok<{ version: number }>(
		await goi("okr.setProgram", {
			...CHUONG_TRINH_RONG,
			scoreScale: thang,
			weightsOn,
		}),
		`chuong trinh ${thang}`,
	).version;
	const quy = await gieoKyQuy(KY);
	const camKet = await gieoMucTieuCongBo(
		quy,
		BANG_20.slice(0, 10).map(krGieo),
		{
			kind: "cam-ket",
		},
	);
	const thamVong = await gieoMucTieuCongBo(quy, BANG_20.slice(10).map(krGieo), {
		kind: "tham-vong",
	});
	const ids = [...camKet.krIds, ...thamVong.krIds];
	const theoId = new Map(BANG_20.map((o, i) => [ids[i] ?? "", o]));
	const krCrm = ids[BANG_20.findIndex((o) => o.nguon === "crm")] ?? "";
	const krApi = ids[BANG_20.findIndex((o) => o.nguon === "api")] ?? "";

	const krNhap = await mucTieuNhap(quy);
	const bo = await gieoMucTieuCongBo(quy, kr1());
	ok(await goi("okr.dropObjective", { id: bo.objectiveId }), "bo muc tieu");
	idCua(await moRa(quy, "2026-12-20", KY.den), "mo ra truoc cham");

	await guiSo(
		BANG_20.flatMap((o, i) =>
			o.nguon ? [] : [{ keyResultId: ids[i] ?? "", value: o.chot }],
		),
	);
	ok(await goi("okr.ghiSoKr", { id: krApi, giaTri: 95 }), "ghi so api");

	luc(LUC.ngayCuoi2300);
	const truocNgay = await sangCham(quy);
	expect({
		ca: `${thang} 23:00 VN ngay cuoi`,
		tra: tuChoi(truocNgay).includes(CAU.chamTuNgaySau)
			? "cau ghim"
			: tuChoi(truocNgay),
		status: truocNgay.status,
		pha: await phaCua(quy),
		dongDiem: await soDongDiem(quy),
	}).toEqual({
		ca: `${thang} 23:00 VN ngay cuoi`,
		tra: "cau ghim",
		status: 400,
		pha: "dang-chay",
		dongDiem: 0,
	});

	luc(LUC.homSau0002);
	const thieuChup = await sangCham(quy);
	expect({
		ca: `${thang} 00:02 VN thieu ban chup`,
		tra: tuChoi(thieuChup).includes(CAU.thieuSoNgayCuoi(1))
			? "cau ghim"
			: tuChoi(thieuChup),
		status: thieuChup.status,
		pha: await phaCua(quy),
		dongDiem: await soDongDiem(quy),
		apiCoChupNgayCuoi: await db.okrSoChup.count({
			where: { keyResultId: krApi, ngay: new Date(`${KY.den}T00:00:00Z`) },
		}),
	}).toEqual({
		ca: `${thang} 00:02 VN thieu ban chup`,
		tra: "cau ghim",
		status: 400,
		pha: "dang-chay",
		dongDiem: 0,
		apiCoChupNgayCuoi: 0,
	});

	await chupSoOkr(new Date(LUC.homSau0005), {
		docO: async () => ({ loi: "tat" }),
	});
	expect(
		await db.okrSoChup.count({
			where: { keyResultId: krCrm, ngay: new Date(`${KY.den}T00:00:00Z`) },
		}),
	).toBe(1);

	luc(LUC.homSau0010);
	const truoc = new Map(
		(
			await db.okrKeyResult.findMany({
				where: { id: { in: ids } },
				select: { id: true, currentValue: true },
			})
		).map((k) => [k.id, Number(k.currentValue)]),
	);
	ok(await sangCham(quy), `${thang} sang cham 00:10 VN`);

	expect(await phaCua(quy)).toBe("cham-diem");
	expect(
		(await db.okrCuaSoRa.findMany({ where: { cycleId: quy } })).map(
			(r) => r.dongLuc !== null,
		),
	).toEqual([true]);
	const dong = await db.okrDiemKr.findMany({ where: { cycleId: quy } });
	expect(dong.map((d) => d.keyResultId).sort()).toEqual([...ids].sort());
	expect(dong.some((d) => d.keyResultId === krNhap)).toBe(false);
	const thay = dong
		.map((d) => ({
			o: theoId.get(d.keyResultId)?.nhan ?? d.keyResultId,
			soChot: Number(d.soChot),
			diemGoiY: Number(d.diemGoiY),
			diem: d.diem,
			thang: d.thang,
			trongSoBat: d.trongSoBat,
			phienBanChuongTrinh: d.phienBanChuongTrinh,
		}))
		.sort((a, b) => a.o.localeCompare(b.o));
	const mong = ids
		.map((id) => {
			const o = theoId.get(id) as O;
			return {
				o: o.nhan,
				soChot: truoc.get(id) ?? Number.NaN,
				diemGoiY: o.goiY,
				diem: null,
				thang,
				trongSoBat: weightsOn,
				phienBanChuongTrinh: version,
			};
		})
		.sort((a, b) => a.o.localeCompare(b.o));
	expect(thay).toEqual(mong);
	expect(
		BANG_20.map((o, i) => `${o.nhan}: ${truoc.get(ids[i] ?? "")}`),
	).toEqual(BANG_20.map((o) => `${o.nhan}: ${o.chot}`));
	const vetPha = await db.okrTrail.findMany({
		where: { cycleId: quy, action: "doi-pha" },
		orderBy: { at: "asc" },
	});
	expect(vetPha.map((v) => v.after)).toEqual([
		{ phase: "dang-chay" },
		{ phase: "cham-diem" },
	]);
}

describe("sang-cham", () => {
	beforeAll(async () => {
		await keoDaiPhien();
		await gieoThoaThuan();
	});
	afterAll(async () => {
		setSystemTime();
		await donSanKhep();
	});

	test(
		"sang-cham: thang 0-1 — 23:00 VN ngay cuoi tu choi, 00:02 VN thieu ban chup CRM tu choi, chupSoOkr roi 00:10 VN sinh dung 20 dong diem theo bang viet truoc",
		() => chayBoSangCham("0-1"),
		60_000,
	);

	test(
		"sang-cham: lap ca bo tren thang 0-100 — cung diemGoiY chuan 0-1, thang 0-100",
		() => chayBoSangCham("0-100"),
		60_000,
	);

	test("sang-cham: ba ca nhay pha tu choi «Pha đi từng bước», pha va vet khong doi", async () => {
		luc(LUC.gieo);
		const keHoach = await gieoKyQuy({ ...KY, pha: "lap-ke-hoach" });
		const chay = await gieoKyQuy(KY);
		luc(LUC.sauKy);
		const ca = [
			{
				ten: "lap-ke-hoach → cham-diem",
				id: keHoach,
				phase: "cham-diem",
				pha: "lap-ke-hoach",
			},
			{
				ten: "dang-chay → da-dong",
				id: chay,
				phase: "da-dong",
				pha: "dang-chay",
			},
			{
				ten: "lap-ke-hoach → da-dong",
				id: keHoach,
				phase: "da-dong",
				pha: "lap-ke-hoach",
			},
		] as const;
		const soVet = await db.okrTrail.count();
		const thay: string[] = [];
		for (const c of ca) {
			const tra = await goi("okr.setCyclePhase", { id: c.id, phase: c.phase });
			thay.push(
				`${c.ten}: ${tra.status} ${tra.loi.includes(CAU.tungBuoc) ? "cau ghim" : tra.loi} · pha ${await phaCua(c.id)} · dong diem ${await soDongDiem(c.id)}`,
			);
		}
		expect(thay).toEqual(
			ca.map((c) => `${c.ten}: 400 cau ghim · pha ${c.pha} · dong diem 0`),
		);
		expect(await db.okrTrail.count()).toBe(soVet);
	}, 30_000);

	test("sang-cham: hai quan tri bam sang cham cung luc — mot thanh cong, mot «Pha đi từng bước», dung 20 dong diem", async () => {
		luc(LUC.gieo);
		const quy = await gieoKyQuy(KY);
		await gieoMucTieuCongBo(
			quy,
			Array.from({ length: 10 }, (_, i) => ({
				startValue: 0,
				targetValue: 100,
				currentValue: i,
			})),
		);
		await gieoMucTieuCongBo(
			quy,
			Array.from({ length: 10 }, (_, i) => ({
				startValue: 0,
				targetValue: 100,
				currentValue: 10 + i,
			})),
			{ kind: "tham-vong" },
		);
		luc(LUC.sauKy);
		const hai = await Promise.all([
			sangCham(quy, "quan"),
			sangCham(quy, "chu"),
		]);
		expect(
			hai
				.map((t) =>
					t.status === 200
						? "200"
						: `${t.status} ${t.loi.includes(CAU.tungBuoc) ? "cau ghim" : t.loi}`,
				)
				.sort(),
		).toEqual(["200", "400 cau ghim"]);
		expect(await soDongDiem(quy)).toBe(20);
		expect(await phaCua(quy)).toBe("cham-diem");
		expect(
			await db.okrTrail.count({
				where: {
					cycleId: quy,
					action: "doi-pha",
					after: { equals: { phase: "cham-diem" } },
				},
			}),
		).toBe(1);
	}, 30_000);

	test("sang-cham: da-dong chi khi moi dong diem co diem — «Còn N KR chưa chấm», kiemDongKy dem theo don vi", async () => {
		luc(LUC.gieo);
		const quy = await gieoKyQuy(KY);
		const pb = await pbMoi("khep-pb");
		const truong = await truongMoi("department", pb, "khep-truong");
		const goc = await gieoMucTieuCongBo(quy, [
			{ startValue: 0, targetValue: 100, currentValue: 0 },
			{ startValue: 0, targetValue: 100, currentValue: 0 },
		]);
		const phong = await gieoMucTieuCongBo(
			quy,
			[
				{
					startValue: 0,
					targetValue: 100,
					currentValue: 0,
					ownerUserId: truong.nguoi,
				},
			],
			{
				unit: { level: "phong-ban", departmentId: pb },
				ownerUserId: truong.nguoi,
				ai: truong.cookie,
			},
		);
		luc(LUC.sauKy);
		await keoDaiPhien();
		ok(await sangCham(quy), "sang cham");
		const tenPb = (await db.department.findUniqueOrThrow({ where: { id: pb } }))
			.name;

		const lan1 = await goi("okr.setCyclePhase", { id: quy, phase: "da-dong" });
		expect(
			`${lan1.status} ${lan1.loi.includes(CAU.conKrChuaCham(3)) ? "cau ghim" : lan1.loi}`,
		).toBe("400 cau ghim");
		expect(await phaCua(quy)).toBe("cham-diem");
		const dem = await kiemDongKy(db, quy);
		expect({
			conLai: dem.conLai,
			theoDonVi: [...dem.theoDonVi].sort((a, b) =>
				a.khoa.localeCompare(b.khoa),
			),
		}).toEqual({
			conLai: 3,
			theoDonVi: [
				{ khoa: "goc", ten: OKR.tenGoc, conLai: 2 },
				{ khoa: `pb:${pb}`, ten: tenPb, conLai: 1 },
			].sort((a, b) => a.khoa.localeCompare(b.khoa)),
		});

		await db.okrDiemKr.updateMany({
			where: { keyResultId: { in: [...goc.krIds] } },
			data: { diem: 1 },
		});
		const lan2 = await goi("okr.setCyclePhase", { id: quy, phase: "da-dong" });
		expect(
			`${lan2.status} ${lan2.loi.includes(CAU.conKrChuaCham(1)) ? "cau ghim" : lan2.loi}`,
		).toBe("400 cau ghim");
		expect(await phaCua(quy)).toBe("cham-diem");

		await db.okrDiemKr.updateMany({
			where: { keyResultId: { in: [...phong.krIds] } },
			data: { diem: 0.5 },
		});
		ok(
			await goi("okr.setCyclePhase", { id: quy, phase: "da-dong" }),
			"dong ky",
		);
		expect(await phaCua(quy)).toBe("da-dong");
	}, 30_000);
});

describe("xoa-kr-khep", () => {
	beforeAll(keoDaiPhien);
	afterAll(async () => {
		setSystemTime();
		await donSanKhep();
	});

	async function tuChoiXoa(ca: string, k: string, cau: string) {
		const soVet = await db.okrTrail.count();
		const tra = await goi("okr.removeKeyResult", { id: k });
		expect({
			ca,
			tra: `${tra.status} ${tra.loi}`,
			con: await db.okrKeyResult.count({ where: { id: k } }),
			soVet: await db.okrTrail.count(),
		}).toEqual({ ca, tra: `400 ${cau}`, con: 1, soVet });
	}

	test("xoa-kr-khep: KR da co dong okrDoiDich — tu choi bang cau ghim, khong loi 500", async () => {
		luc(TRONG_RA);
		const quy = await gieoKyQuy(KY);
		const {
			krIds: [k = ""],
		} = await gieoMucTieuCongBo(quy, [
			{ startValue: 60, targetValue: 80, currentValue: 60 },
			{ startValue: 0, targetValue: 100, currentValue: 0 },
		]);
		idCua(await moRa(quy, RA.tu, RA.den), "mo ra xoa kr");
		ok(await doiDichKr(k, { targetValue: 85 }), "doi dich trong ra");
		expect(await db.okrDoiDich.count({ where: { keyResultId: k } })).toBe(1);
		await tuChoiXoa("co doi dich", k, CAU.krCoDoiDich);
	});

	test("xoa-kr-khep: KR da co dong okrDiemKr — tu choi bang cau ghim, khong loi 500", async () => {
		luc(LUC.gieo);
		const quy = await gieoKyQuy(KY);
		const {
			krIds: [k = ""],
		} = await gieoMucTieuCongBo(quy, [
			{ startValue: 0, targetValue: 100, currentValue: 0 },
			{ startValue: 0, targetValue: 100, currentValue: 0 },
		]);
		luc(LUC.sauKy);
		ok(await sangCham(quy), "sang cham xoa kr");
		expect(await db.okrDiemKr.count({ where: { keyResultId: k } })).toBe(1);
		await db.okrCycle.update({
			where: { id: quy },
			data: { phase: "dang-chay" },
		});
		await tuChoiXoa("co diem", k, CAU.krCoDiem);
	});
});
