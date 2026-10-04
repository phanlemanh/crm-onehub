import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { WORKSPACE_ID } from "@crm/auth";
import { db } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { OKR_KHEP } from "@crm/validation/okr-khep";
import type { KieuKr } from "@crm/validation/okr-kr";
import { chupSoOkr } from "../../agent/agent/lib/okr-chup";
import { kiemDongKy } from "../src/okr/khep";
import { OKR } from "../src/okr/okr-config";
import {
	chamHetBangGoiY,
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
	type AiHoacCookie,
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
	thieuSoNgayCuoi: (n: number) =>
		`Còn ${n} KR lấy số từ chỉ số chưa có số ngày cuối`,
	tungBuoc: "Pha đi từng bước",
	conKrChuaCham: (n: number) => `Còn ${n} KR chưa chấm`,
	krCoDoiDich: "KR đã có lần đổi đích — sửa được, không xoá được.",
	krCoDiem: "KR đã có điểm cuối kỳ — không xoá được.",
	chiChamKhiChamDiem: "Chỉ chấm KR khi chu kỳ ở pha chấm điểm.",
	ngoaiLuoi: "Điểm ngoài lưới",
	canLyDoCham: "Điểm khác gợi ý cần lý do",
	khongSuaDuocKr:
		"Chỉ người phụ trách KR hoặc người sửa được mục tiêu mới sửa KR này.",
	khongSuaDuocDonVi: "Bạn không sửa được OKR của đơn vị này",
	nhinLaiChiKhi: "Điều học được ghi ở pha đang chạy hoặc chấm điểm.",
	kyDaKhoa: "Chu kỳ này ở pha chấm điểm hoặc đã đóng — không ghi được nữa.",
	kyKhongChay: "Chỉ cập nhật được KR trong chu kỳ đang chạy.",
	kyDaDong:
		"Chu kỳ đã đóng — quản trị mở lại kỳ thì mới sửa được điểm hay điều học được.",
	chiMoLaiKhiDong: "Chỉ mở lại được chu kỳ đã đóng.",
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

type Thang = "0-1" | "0-100";

type KrCham = {
	id: string;
	soChot: number;
	diemGoiY: number;
	diem: number | null;
	lyDo: string | null;
	suaDuoc: boolean;
	doiDichNgoaiRa: { luc: string; truoc: number; sau: number; lyDo: string }[];
};

type MucTieuCham = {
	id: string;
	kind: string;
	suaDuoc: boolean;
	diem: number | null;
	cachDoc: string | null;
	dieuHocDuoc: string;
	mangSangToi?: LienKet;
	krs: KrCham[];
};

type BangCham = {
	thang: Thang | null;
	conLai: number;
	chuaCham: { khoa: string; ten: string; conLai: number }[];
	mucTieu: MucTieuCham[];
};

const LY_DO_15 = "khach doi ke ho";
const CHU_40 = "Demo tre nen chot cham; quy sau hen som.";

const LUC_CHAM = {
	k1: "2027-01-02T04:00:00.000Z",
	k2: "2027-01-02T05:00:00.000Z",
	k3: "2027-01-02T06:00:00.000Z",
	k1Lai: "2027-01-02T07:00:00.000Z",
	k2Lai: "2027-01-02T08:00:00.000Z",
} as const;

const theoThang = (thang: Thang, d: number) =>
	thang === "0-100" ? Math.round(d * 100) : d;

const chamKr = (
	keyResultId: string,
	diem: number,
	ai: AiHoacCookie,
	lyDo?: string,
) =>
	goi(
		"okr.chamKr",
		lyDo === undefined ? { keyResultId, diem } : { keyResultId, diem, lyDo },
		ai,
	);

const dongDiemKr = async (keyResultId: string) => {
	const d = await db.okrDiemKr.findUnique({ where: { keyResultId } });
	return d === null
		? null
		: {
				diem: d.diem === null ? null : Number(d.diem),
				lyDo: d.lyDo,
				chamBoiUserId: d.chamBoiUserId,
				chamLuc: d.chamLuc?.toISOString() ?? null,
			};
};

const vetCham = async (keyResultId: string) =>
	(
		await db.okrTrail.findMany({
			where: { keyResultId, action: "cham-kr" },
			orderBy: { at: "asc" },
		})
	).map((v) => ({ actor: v.actorUserId, before: v.before, after: v.after }));

const bangCham = (cycleId: string, ai: AiHoacCookie = "quan") =>
	doc<BangCham>("okr.bangCham", ai, { cycleId });

async function datChuongTrinh(thang: Thang, weightsOn: boolean) {
	ok(
		await goi("okr.setProgram", {
			...CHUONG_TRINH_RONG,
			scoreScale: thang,
			weightsOn,
		}),
		`chuong trinh ${thang} ${weightsOn}`,
	);
}

async function gieoBaKy(thang: Thang) {
	luc(LUC.gieo);
	const pb = await pbMoi("cham-pb");
	const truong = await truongMoi("department", pb, "cham-truong");
	await keoDaiPhien();
	await datChuongTrinh(thang, false);
	const quy = await gieoKyQuy(KY);
	const chay = await gieoKyQuy(KY);
	const dong = await gieoKyQuy(KY);
	const phong = await gieoMucTieuCongBo(
		quy,
		[
			{
				startValue: 0,
				targetValue: 100,
				currentValue: 50,
				ownerUserId: phien.thuong.nguoi,
			},
			{
				startValue: 0,
				targetValue: 100,
				currentValue: 70,
				ownerUserId: truong.nguoi,
			},
		],
		{
			unit: { level: "phong-ban", departmentId: pb },
			ownerUserId: truong.nguoi,
			ai: truong.cookie,
		},
	);
	const goc = await gieoMucTieuCongBo(quy, [
		{
			startValue: 0,
			targetValue: 100,
			currentValue: 100,
			ownerUserId: truong.nguoi,
		},
	]);
	const mtChay = await gieoMucTieuCongBo(chay, kr1());
	const mtDong = await gieoMucTieuCongBo(dong, kr1());
	luc(LUC.sauKy);
	ok(await sangCham(quy), "sang cham quy");
	ok(await sangCham(dong), "sang cham ky se dong");
	ok(
		await chamKr(mtDong.krIds[0] ?? "", theoThang(thang, 0), "quan"),
		"cham ky se dong",
	);
	ok(await goi("okr.setCyclePhase", { id: dong, phase: "da-dong" }), "dong ky");
	return { quy, truong, phong, goc, mtChay, mtDong };
}

type CaTuChoi = {
	ten: string;
	kr: string;
	diem: number;
	ai: AiHoacCookie;
	lyDo?: string;
	status: number;
	cau: string;
};

async function tuChoiCham(thang: Thang, ds: readonly CaTuChoi[]) {
	for (const ca of ds) {
		const ten = `${thang} ${ca.ten}`;
		const truoc = {
			ca: ten,
			dong: await dongDiemKr(ca.kr),
			soVet: await db.okrTrail.count(),
		};
		const tra = await chamKr(ca.kr, ca.diem, ca.ai, ca.lyDo);
		expect({
			ca: ten,
			dong: await dongDiemKr(ca.kr),
			soVet: await db.okrTrail.count(),
		}).toEqual(truoc);
		expect(`${ten}: ${tra.status}`).toBe(`${ten}: ${ca.status}`);
		expect(tra.loi, ten).toContain(ca.cau);
	}
}

async function chayMaTranCham(thang: Thang) {
	const d = (x: number) => theoThang(thang, x);
	const { quy, truong, phong, goc, mtChay, mtDong } = await gieoBaKy(thang);
	const [k1 = "", k2 = ""] = phong.krIds;
	const [k3 = ""] = goc.krIds;
	const thuong = phien.thuong.nguoi;

	const hopLe = [
		{
			nhan: "phu trach K1 bang goi y",
			kr: k1,
			diem: d(0.5),
			lyDo: undefined,
			ai: "thuong",
			nguoi: thuong,
			luc: LUC_CHAM.k1,
			mong: { diem: 0.5, lyDo: null },
		},
		{
			nhan: "truong don vi K2 khac goi y, ly do 15 ky tu",
			kr: k2,
			diem: d(0.9),
			lyDo: LY_DO_15,
			ai: truong.cookie,
			nguoi: truong.nguoi,
			luc: LUC_CHAM.k2,
			mong: { diem: 0.9, lyDo: LY_DO_15 },
		},
		{
			nhan: "quan tri K3 bang goi y",
			kr: k3,
			diem: d(1),
			lyDo: undefined,
			ai: "quan",
			nguoi: phien.quan.nguoi,
			luc: LUC_CHAM.k3,
			mong: { diem: 1, lyDo: null },
		},
		{
			nhan: "phu trach cham lai K1",
			kr: k1,
			diem: d(0.6),
			lyDo: LY_DO_15,
			ai: "thuong",
			nguoi: thuong,
			luc: LUC_CHAM.k1Lai,
			mong: { diem: 0.6, lyDo: LY_DO_15 },
		},
	] satisfies {
		nhan: string;
		kr: string;
		diem: number;
		lyDo: string | undefined;
		ai: AiHoacCookie;
		nguoi: string;
		luc: string;
		mong: { diem: number; lyDo: string | null };
	}[];
	const krCham = { keyResultId: { in: [k1, k2, k3] }, action: "cham-kr" };
	for (const [i, l] of hopLe.entries()) {
		const ca = `${thang} ${l.nhan}`;
		luc(l.luc);
		ok(await chamKr(l.kr, l.diem, l.ai, l.lyDo), ca);
		expect({
			ca,
			dong: await dongDiemKr(l.kr),
			vet: await db.okrTrail.count({ where: krCham }),
		}).toEqual({
			ca,
			dong: { ...l.mong, chamBoiUserId: l.nguoi, chamLuc: l.luc },
			vet: i + 1,
		});
	}
	expect(await db.okrDiemKr.count({ where: { keyResultId: k1 } })).toBe(1);
	expect(await vetCham(k1)).toEqual([
		{
			actor: thuong,
			before: { diem: null, lyDo: null },
			after: { diem: 0.5, lyDo: null },
		},
		{
			actor: thuong,
			before: { diem: 0.5, lyDo: null },
			after: { diem: 0.6, lyDo: LY_DO_15 },
		},
	]);

	const tuChoi: readonly CaTuChoi[] = [
		{
			ten: "khac goi y khong ly do",
			kr: k1,
			diem: d(0.8),
			ai: "thuong",
			status: 400,
			cau: CAU.canLyDoCham,
		},
		{
			ten: "diem 0.75 ngoai luoi",
			kr: k1,
			diem: d(0.75),
			ai: "thuong",
			lyDo: LY_DO_15,
			status: 400,
			cau: CAU.ngoaiLuoi,
		},
		{
			ten: "diem 1.1 ngoai luoi",
			kr: k1,
			diem: d(1.1),
			ai: "thuong",
			lyDo: LY_DO_15,
			status: 400,
			cau: CAU.ngoaiLuoi,
		},
		{
			ten: "thanh vien khong sua duoc KR",
			kr: k3,
			diem: d(1),
			ai: "thuong",
			status: 403,
			cau: CAU.khongSuaDuocKr,
		},
		{
			ten: "vai okr khong phu trach KR",
			kr: k3,
			diem: d(1),
			ai: "okr",
			status: 403,
			cau: CAU.khongSuaDuocKr,
		},
		{
			ten: "pha dang-chay",
			kr: mtChay.krIds[0] ?? "",
			diem: d(0),
			ai: "quan",
			status: 400,
			cau: CAU.chiChamKhiChamDiem,
		},
		{
			ten: "pha da-dong",
			kr: mtDong.krIds[0] ?? "",
			diem: d(0),
			ai: "quan",
			status: 400,
			cau: CAU.kyDaDong,
		},
	];
	expect(tuChoi).toHaveLength(7);
	await tuChoiCham(thang, tuChoi);

	luc(LUC_CHAM.k2Lai);
	const gui08 = `${thang} gui ${d(0.8)}`;
	ok(await chamKr(k2, d(0.8), truong.cookie, LY_DO_15), gui08);
	expect({ ca: gui08, dong: await dongDiemKr(k2) }).toEqual({
		ca: gui08,
		dong: {
			diem: 0.8,
			lyDo: LY_DO_15,
			chamBoiUserId: truong.nguoi,
			chamLuc: LUC_CHAM.k2Lai,
		},
	});
	if (thang === "0-100")
		await tuChoiCham(thang, [
			{
				ten: "gui 85 ngoai luoi",
				kr: k2,
				diem: 85,
				ai: truong.cookie,
				lyDo: LY_DO_15,
				status: 400,
				cau: CAU.ngoaiLuoi,
			},
			{
				ten: "gui 0.8 ngoai luoi",
				kr: k2,
				diem: 0.8,
				ai: truong.cookie,
				lyDo: LY_DO_15,
				status: 400,
				cau: CAU.ngoaiLuoi,
			},
		]);

	const gon = (m: MucTieuCham | undefined) =>
		m && {
			diem: m.diem,
			cachDoc: m.cachDoc,
			suaDuoc: m.suaDuoc,
			krs: m.krs.map((k) => ({
				id: k.id,
				soChot: k.soChot,
				diemGoiY: k.diemGoiY,
				diem: k.diem,
				lyDo: k.lyDo,
				suaDuoc: k.suaDuoc,
			})),
		};
	const bang = await bangCham(quy, truong.cookie);
	expect({
		thang: bang.thang,
		conLai: bang.conLai,
		chuaCham: bang.chuaCham,
		phong: gon(bang.mucTieu.find((m) => m.id === phong.objectiveId)),
		goc: gon(bang.mucTieu.find((m) => m.id === goc.objectiveId)),
	}).toEqual({
		thang,
		conLai: 0,
		chuaCham: [],
		phong: {
			diem: d(0.7),
			cachDoc: "chua-tron",
			suaDuoc: true,
			krs: [
				{
					id: k1,
					soChot: 50,
					diemGoiY: d(0.5),
					diem: d(0.6),
					lyDo: LY_DO_15,
					suaDuoc: true,
				},
				{
					id: k2,
					soChot: 70,
					diemGoiY: d(0.7),
					diem: d(0.8),
					lyDo: LY_DO_15,
					suaDuoc: true,
				},
			],
		},
		goc: {
			diem: d(1),
			cachDoc: "dat",
			suaDuoc: false,
			krs: [
				{
					id: k3,
					soChot: 100,
					diemGoiY: d(1),
					diem: d(1),
					lyDo: null,
					suaDuoc: true,
				},
			],
		},
	});
	const ten = new Map([
		[k1, "K1"],
		[k2, "K2"],
		[k3, "K3"],
	]);
	expect(
		(await bangCham(quy, "thuong")).mucTieu
			.flatMap((m) => m.krs.map((k) => `${ten.get(k.id)} ${k.suaDuoc}`))
			.sort(),
	).toEqual(["K1 true", "K2 false", "K3 false"]);
}

describe("cham-va-nhin-lai", () => {
	beforeAll(keoDaiPhien);
	afterAll(async () => {
		setSystemTime();
		await datChuongTrinh(CHUONG_TRINH_RONG.scoreScale, false);
		await donSanKhep();
	});

	test(
		"cham-va-nhin-lai: thang 0-1 — ba nguoi cham, cham lai, bay ca tu choi viet truoc, bangCham theo thang cua dong",
		() => chayMaTranCham("0-1"),
		60_000,
	);

	test(
		"cham-va-nhin-lai: lap tren thang 0-100 — gui 80 luu 0.8 chuan, bangCham tra 80; 85 va 0.8 ngoai luoi",
		() => chayMaTranCham("0-100"),
		60_000,
	);

	test("cham-va-nhin-lai: ghiDieuHocDuoc nam ca — chu 40 ky tu, rong, qua tran, pha da-dong, nguoi khong sua duoc; moi lan hop le mot vet nhin-lai", async () => {
		const { quy, truong, phong, mtChay, mtDong } = await gieoBaKy("0-1");
		expect(CHU_40).toHaveLength(40);
		const ghi = (objectiveId: string, noiDung: string, ai: AiHoacCookie) =>
			goi("okr.ghiDieuHocDuoc", { objectiveId, noiDung }, ai);
		const nhinLai = async (objectiveId: string) => {
			const r = await db.okrNhinLai.findUnique({ where: { objectiveId } });
			return r && { dieuHocDuoc: r.dieuHocDuoc, suaBoiUserId: r.suaBoiUserId };
		};
		const vetNhinLai = async (objectiveId: string) =>
			(
				await db.okrTrail.findMany({
					where: { objectiveId, action: "nhin-lai" },
					orderBy: { at: "asc" },
				})
			).map((v) => ({ actor: v.actorUserId, after: v.after }));

		luc(LUC_CHAM.k1);
		ok(await ghi(phong.objectiveId, CHU_40, truong.cookie), "ghi 40 ky tu");
		expect(await nhinLai(phong.objectiveId)).toEqual({
			dieuHocDuoc: CHU_40,
			suaBoiUserId: truong.nguoi,
		});
		expect(
			(await bangCham(quy)).mucTieu.find((m) => m.id === phong.objectiveId)
				?.dieuHocDuoc,
		).toBe(CHU_40);

		luc(LUC_CHAM.k2);
		ok(await ghi(phong.objectiveId, "", truong.cookie), "ghi rong");
		expect(await nhinLai(phong.objectiveId)).toEqual({
			dieuHocDuoc: "",
			suaBoiUserId: truong.nguoi,
		});

		const caTuChoi = [
			{
				ten: `${OKR_KHEP.dieuHocDuoc.toiDa + 1} ky tu`,
				obj: phong.objectiveId,
				noiDung: "a".repeat(OKR_KHEP.dieuHocDuoc.toiDa + 1),
				ai: truong.cookie,
				status: 400,
				cau: "",
			},
			{
				ten: "pha da-dong",
				obj: mtDong.objectiveId,
				noiDung: CHU_40,
				ai: "quan",
				status: 400,
				cau: CAU.kyDaDong,
			},
			{
				ten: "nguoi khong sua duoc muc tieu",
				obj: phong.objectiveId,
				noiDung: CHU_40,
				ai: "thuong",
				status: 403,
				cau: CAU.khongSuaDuocDonVi,
			},
		] as const;
		for (const ca of caTuChoi) {
			const truoc = {
				ca: ca.ten,
				dong: await nhinLai(ca.obj),
				soVet: await db.okrTrail.count(),
			};
			const tra = await ghi(ca.obj, ca.noiDung, ca.ai);
			expect({
				ca: ca.ten,
				dong: await nhinLai(ca.obj),
				soVet: await db.okrTrail.count(),
			}).toEqual(truoc);
			expect(`${ca.ten}: ${tra.status}`).toBe(`${ca.ten}: ${ca.status}`);
			expect(tra.loi, ca.ten).toContain(ca.cau);
		}

		expect(await vetNhinLai(phong.objectiveId)).toEqual([
			{ actor: truong.nguoi, after: { dieuHocDuoc: CHU_40 } },
			{ actor: truong.nguoi, after: { dieuHocDuoc: "" } },
		]);

		ok(await ghi(mtChay.objectiveId, CHU_40, "quan"), "doi chung dang-chay");
		expect(await nhinLai(mtChay.objectiveId)).toEqual({
			dieuHocDuoc: CHU_40,
			suaBoiUserId: phien.quan.nguoi,
		});
	}, 60_000);

	test("cham-va-nhin-lai: bangCham — diem muc tieu va cau doc so bang viet truoc 6 ca, trong so va thang doc tu dong diem, doi dich ngoai ra dung mot dong", async () => {
		luc("2026-12-05T03:00:00Z");
		await keoDaiPhien();
		await datChuongTrinh("0-1", false);
		const quy = await gieoKyQuy(KY);
		const mt = (kind: "cam-ket" | "tham-vong", krs: [number, number][]) =>
			gieoMucTieuCongBo(
				quy,
				krs.map(([currentValue, weight]) => ({
					startValue: 0,
					targetValue: 100,
					currentValue,
					weight,
				})),
				{ kind },
			);
		const tot = await mt("tham-vong", [[70, 1]]);
		const duoiTot = await mt("tham-vong", [
			[60, 3],
			[70, 1],
		]);
		const dat = await mt("cam-ket", [[100, 1]]);
		const chuaTron = await mt("cam-ket", [[90, 1]]);
		const chuaHet = await mt("cam-ket", [
			[100, 1],
			[50, 1],
		]);
		const quyTrongSo = await gieoKyQuy(KY);
		const coTrongSo = await gieoMucTieuCongBo(
			quyTrongSo,
			[
				{ startValue: 0, targetValue: 100, currentValue: 100, weight: 3 },
				{ startValue: 0, targetValue: 100, currentValue: 20, weight: 1 },
			],
			{ kind: "cam-ket" },
		);

		const krDoi = dat.krIds[0] ?? "";
		idCua(await moRa(quy, "2026-12-01", "2026-12-10"), "mo ra bang cham");
		ok(await doiDichKr(krDoi, { targetValue: 120 }), "doi dich trong ra");
		luc(LUC.gieo);
		ok(
			await doiDichKr(krDoi, { targetValue: 100, lyDoDoiDich: LY_DO_15 }),
			"doi dich ngoai ra",
		);
		expect((await dongDoiDich(krDoi)).map((x) => x.ngoaiRa)).toEqual([
			false,
			true,
		]);

		luc(LUC.sauKy);
		await keoDaiPhien();
		ok(await sangCham(quy), "sang cham trong so tat");
		await datChuongTrinh("0-1", true);
		ok(await sangCham(quyTrongSo), "sang cham trong so bat");
		await datChuongTrinh("0-100", true);

		const chuaChamId = chuaHet.krIds[1] ?? "";
		const canCham = [
			...tot.krIds,
			...duoiTot.krIds,
			...dat.krIds,
			...chuaTron.krIds,
			...chuaHet.krIds.filter((id) => id !== chuaChamId),
			...coTrongSo.krIds,
		];
		for (const id of canCham) {
			const d = await db.okrDiemKr.findUniqueOrThrow({
				where: { keyResultId: id },
			});
			ok(await chamKr(id, Number(d.diemGoiY), "quan"), "cham bang goi y");
		}

		const bang = await bangCham(quy);
		const bangTrongSo = await bangCham(quyTrongSo);
		const moi = [...bang.mucTieu, ...bangTrongSo.mucTieu];
		const BANG = [
			{ ca: "tham vong 0.7", id: tot.objectiveId, diem: 0.7, doc: "tot" },
			{
				ca: "tham vong 0.6 va 0.7 (trong so 3/1, dong diem tat trong so)",
				id: duoiTot.objectiveId,
				diem: 0.65,
				doc: "duoi-muc-tot",
			},
			{ ca: "cam ket 1", id: dat.objectiveId, diem: 1, doc: "dat" },
			{
				ca: "cam ket 0.9",
				id: chuaTron.objectiveId,
				diem: 0.9,
				doc: "chua-tron",
			},
			{
				ca: "chua cham het",
				id: chuaHet.objectiveId,
				diem: null,
				doc: null,
			},
			{
				ca: "trong so bat 3/1: 1 va 0.2",
				id: coTrongSo.objectiveId,
				diem: 0.8,
				doc: "chua-tron",
			},
		] as const;
		expect(
			BANG.map((b) => {
				const m = moi.find((x) => x.id === b.id);
				return { ca: b.ca, diem: m?.diem, doc: m?.cachDoc };
			}),
		).toEqual(BANG.map((b) => ({ ca: b.ca, diem: b.diem, doc: b.doc })));
		expect({
			thang: [bang.thang, bangTrongSo.thang],
			conLai: bang.conLai,
			chuaCham: bang.chuaCham,
		}).toEqual({
			thang: ["0-1", "0-1"],
			conLai: 1,
			chuaCham: [{ khoa: "goc", ten: OKR.tenGoc, conLai: 1 }],
		});
		const doiDich = moi
			.flatMap((m) => m.krs)
			.filter((k) => k.doiDichNgoaiRa.length > 0)
			.map((k) => ({ id: k.id, doiDich: k.doiDichNgoaiRa }));
		expect(doiDich).toEqual([
			{
				id: krDoi,
				doiDich: [
					{ luc: expect.any(String), truoc: 120, sau: 100, lyDo: LY_DO_15 },
				],
			},
		]);
	}, 60_000);
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

const LY_DO_20 = "khach bao sai so q4.";
const LY_DO_9 = "sai so q4";
const NGAY_SAU_KY_0005 = LUC.homSau0005;

type ThuTucDong = [
	ten: string,
	vao: Json,
	docDich: () => Promise<unknown>,
	cau: string,
	ai: AiHoacCookie,
];

async function gieoKyDong() {
	luc(LUC.gieo);
	await keoDaiPhien();
	await datChuongTrinh("0-1", false);
	const p1 = await pbMoi("dong-p1");
	const p2 = await pbMoi("dong-p2");
	const t1 = await truongMoi("department", p1, "dong-t1");
	const t2 = await truongMoi("department", p2, "dong-t2");
	const quy = await gieoKyQuy(KY);
	const donVi = (departmentId: string) => ({
		level: "phong-ban",
		departmentId,
	});
	const phong1 = await gieoMucTieuCongBo(quy, [...kr1(), ...kr1()], {
		unit: donVi(p1),
		ownerUserId: t1.nguoi,
		ai: t1.cookie,
	});
	await gieoMucTieuCongBo(quy, kr1(), {
		unit: donVi(p2),
		ownerUserId: t2.nguoi,
		ai: t2.cookie,
	});
	const goc = await gieoMucTieuCongBo(quy, [
		{
			startValue: 0,
			targetValue: 100,
			currentValue: 0,
			nguon: { loai: "api" },
		},
		{ startValue: 0, targetValue: 100, currentValue: 0 },
	]);
	const [krApi = "", krBang = ""] = goc.krIds;
	await db.okrKeyResult.update({
		where: { id: krBang },
		data: { source: "bang-tinh" },
	});
	await db.okrNguonKr.create({
		data: {
			keyResultId: krBang,
			loai: "bang-tinh",
			sheetId: "sheet-dong",
			sheetO: "A1",
			taoBoiUserId: phien.quan.nguoi,
		},
	});
	const nhapVao = () => ({
		cycleId: quy,
		unit: donVi(p1),
		title: ma("dong nhap"),
		kind: "cam-ket",
		ownerUserId: t1.nguoi,
		participantIds: [],
		whyNow: "",
	});
	const krVao = (objectiveId: string) => ({
		objectiveId,
		title: ma("kr dong"),
		kind: "tang-toi",
		ownerUserId: t1.nguoi,
		startValue: 0,
		targetValue: 100,
		currentValue: 0,
		unit: "",
		dueOn: null,
		weight: 1,
	});
	const a = idCua(
		await goi("okr.createObjective", nhapVao(), t1.cookie),
		"nhap a",
	);
	const b = idCua(
		await goi("okr.createObjective", nhapVao(), t1.cookie),
		"nhap b",
	);
	const c = idCua(
		await goi("okr.createObjective", nhapVao(), t1.cookie),
		"nhap c",
	);
	const nguon = idCua(
		await goi("okr.createObjective", nhapVao(), t1.cookie),
		"nhap nguon",
	);
	const krSua = idCua(
		await goi("okr.createKeyResult", krVao(a), t1.cookie),
		"kr sua",
	);
	const krXoa = idCua(
		await goi("okr.createKeyResult", krVao(a), t1.cookie),
		"kr xoa",
	);
	idCua(await goi("okr.createKeyResult", krVao(b), t1.cookie), "kr b");
	const gopXoa = idCua(
		await goi(
			"okr.addAlignment",
			{
				objectiveId: a,
				targetObjectiveId: goc.objectiveId,
				targetKeyResultId: null,
			},
			t1.cookie,
		),
		"gan a",
	);
	const raId = idCua(await moRa(quy, LUC.gieo.slice(0, 10), KY.den), "mo ra");
	return {
		quy,
		p1,
		p2,
		t1,
		phong1,
		goc,
		krApi,
		krBang,
		a,
		b,
		c,
		nguon,
		krSua,
		krXoa,
		gopXoa,
		raId,
		nhapVao,
		krVao,
	};
}

const dongDiemCuaKy = async (cycleId: string) =>
	(
		await db.okrDiemKr.findMany({
			where: { cycleId },
			orderBy: { keyResultId: "asc" },
		})
	).map((d) => ({
		keyResultId: d.keyResultId,
		soChot: Number(d.soChot),
		diemGoiY: Number(d.diemGoiY),
		diem: d.diem === null ? null : Number(d.diem),
		lyDo: d.lyDo,
		chamBoiUserId: d.chamBoiUserId,
		chamLuc: d.chamLuc?.toISOString() ?? null,
	}));

const vetMoLai = async (cycleId: string) =>
	(
		await db.okrTrail.findMany({
			where: { cycleId, action: "mo-lai-ky" },
			orderBy: { at: "asc" },
		})
	).map((v) => ({
		actor: v.actorUserId,
		note: v.note,
		before: v.before,
		after: v.after,
	}));

describe("dong-mo-lai", () => {
	beforeAll(keoDaiPhien);
	afterAll(async () => {
		setSystemTime();
		await datChuongTrinh(CHUONG_TRINH_RONG.scoreScale, false);
		await donSanKhep();
	});

	test("dong-mo-lai: dong khi con KR chua cham tu choi va bangCham dem theo don vi; ma tran muoi bay thu tuc ghi o da-dong tu choi, ban ghi khong doi; chupSoOkr sau ngay cuoi 0 dong; moLaiKy nam ca; dong lai", async () => {
		const f = await gieoKyDong();
		const { quy } = f;
		const loNhap = {
			cycleId: quy,
			unit: { loai: "goc" },
			text: [
				ma("nhap dong"),
				"KR dong",
				"mốc",
				"",
				"",
				"",
				`${phien.quan.nguoi}@thu.test`,
			].join("\t"),
		};

		luc(LUC.sauKy);
		await keoDaiPhien();
		ok(await sangCham(quy), "sang cham");
		for (const k of f.goc.krIds)
			ok(await chamKr(k, 0, "quan"), `cham goc ${k}`);
		const tenPb = async (id: string) =>
			(await db.department.findUniqueOrThrow({ where: { id } })).name;
		const tenP1 = await tenPb(f.p1);
		const tenP2 = await tenPb(f.p2);

		const lan1 = await goi("okr.setCyclePhase", { id: quy, phase: "da-dong" });
		expect({
			tra: tuChoi(lan1).includes(CAU.conKrChuaCham(3))
				? "cau ghim"
				: tuChoi(lan1),
			status: lan1.status,
			pha: await phaCua(quy),
		}).toEqual({ tra: "cau ghim", status: 400, pha: "cham-diem" });
		const bang = await bangCham(quy);
		expect(
			[...bang.chuaCham].sort((x, y) => x.khoa.localeCompare(y.khoa)),
		).toEqual(
			[
				{ khoa: `pb:${f.p1}`, ten: tenP1, conLai: 2 },
				{ khoa: `pb:${f.p2}`, ten: tenP2, conLai: 1 },
			].sort((x, y) => x.khoa.localeCompare(y.khoa)),
		);
		expect(bang.conLai).toBe(3);

		setSystemTime();
		await chamHetBangGoiY(quy);
		luc(LUC.sauKy);
		await keoDaiPhien();
		ok(await goi("okr.setCyclePhase", { id: quy, phase: "da-dong" }), "dong");
		expect(await phaCua(quy)).toBe("da-dong");
		const diemKhiDong = await dongDiemCuaKy(quy);
		expect(diemKhiDong).toHaveLength(5);

		const sessionId = ok<{ sessionId: string }>(
			await goi("okr.moCapNhat", { entry: "tab" }, f.t1.cookie),
			"mo phien o da-dong",
		).sessionId;
		const [krP1 = ""] = f.phong1.krIds;
		const mucTieuCuaKy = () =>
			db.okrObjective.findMany({
				where: { cycleId: quy },
				orderBy: { id: "asc" },
			});
		const mucTieu = (id: string) =>
			db.okrObjective.findUnique({ where: { id } });
		const kr = (id: string) => db.okrKeyResult.findUnique({ where: { id } });
		const quan: AiHoacCookie = "quan";
		const t1 = f.t1.cookie;

		const MA_TRAN: ThuTucDong[] = [
			["createObjective", f.nhapVao(), mucTieuCuaKy, CAU.kyDaKhoa, t1],
			[
				"updateObjective",
				{ id: f.a, title: ma("ten sua") },
				() => mucTieu(f.a),
				CAU.kyDaKhoa,
				t1,
			],
			["publishObjective", { id: f.b }, () => mucTieu(f.b), CAU.kyDaKhoa, t1],
			["dropObjective", { id: f.c }, () => mucTieu(f.c), CAU.kyDaKhoa, t1],
			[
				"createKeyResult",
				f.krVao(f.a),
				() =>
					db.okrKeyResult.findMany({
						where: { objectiveId: f.a },
						orderBy: { id: "asc" },
					}),
				CAU.kyDaKhoa,
				t1,
			],
			[
				"updateKeyResult",
				{ id: f.krSua, currentValue: 33 },
				() => kr(f.krSua),
				CAU.kyDaKhoa,
				t1,
			],
			["removeKeyResult", { id: f.krXoa }, () => kr(f.krXoa), CAU.kyDaKhoa, t1],
			[
				"addAlignment",
				{
					objectiveId: f.nguon,
					targetObjectiveId: null,
					targetKeyResultId: f.krApi,
				},
				() =>
					db.okrAlignment.findMany({
						where: { objectiveId: f.nguon },
						orderBy: { id: "asc" },
					}),
				CAU.kyDaKhoa,
				t1,
			],
			[
				"removeAlignment",
				{ id: f.gopXoa },
				() => db.okrAlignment.findUnique({ where: { id: f.gopXoa } }),
				CAU.kyDaKhoa,
				t1,
			],
			["previewImport", loNhap, mucTieuCuaKy, CAU.kyDaKhoa, quan],
			[
				"applyImport",
				{ ...loNhap, congBo: false },
				mucTieuCuaKy,
				CAU.kyDaKhoa,
				quan,
			],
			[
				"guiCapNhat",
				{
					sessionId,
					items: [
						{ keyResultId: krP1, value: 50, confidence: "vua", note: "" },
					],
				},
				async () => ({
					kr: await kr(krP1),
					lan: await db.okrCheckIn.findMany({
						where: { keyResultId: krP1 },
					}),
					phien: await db.okrCheckInSession.findUnique({
						where: { id: sessionId },
					}),
				}),
				CAU.kyKhongChay,
				t1,
			],
			[
				"ghiSoKr",
				{ id: f.krApi, giaTri: 95 },
				async () => ({
					kr: await kr(f.krApi),
					chup: await db.okrSoChup.findMany({
						where: { keyResultId: f.krApi },
					}),
				}),
				CAU.kyDaKhoa,
				quan,
			],
			[
				"chamKr",
				{ keyResultId: krP1, diem: 0.5, lyDo: LY_DO_15 },
				() => db.okrDiemKr.findUnique({ where: { keyResultId: krP1 } }),
				CAU.kyDaDong,
				t1,
			],
			[
				"ghiDieuHocDuoc",
				{ objectiveId: f.phong1.objectiveId, noiDung: CHU_40 },
				() =>
					db.okrNhinLai.findUnique({
						where: { objectiveId: f.phong1.objectiveId },
					}),
				CAU.kyDaDong,
				t1,
			],
			[
				"moRa",
				{ cycleId: quy, tuNgay: "2026-12-01", denNgay: "2026-12-10" },
				() =>
					db.okrCuaSoRa.findMany({
						where: { cycleId: quy },
						orderBy: { id: "asc" },
					}),
				CAU.kyDaKhoa,
				quan,
			],
			[
				"dongRa",
				{ id: f.raId },
				() => db.okrCuaSoRa.findUnique({ where: { id: f.raId } }),
				CAU.kyDaKhoa,
				quan,
			],
		];
		expect(MA_TRAN).toHaveLength(17);

		const soVet = await db.okrTrail.count();
		const thay: Json[] = [];
		const mong: Json[] = [];
		for (const [ten, vao, docDich, cau, ai] of MA_TRAN) {
			const truoc = JSON.stringify(await docDich());
			const tra = await goi(`okr.${ten}`, vao, ai);
			const sau = JSON.stringify(await docDich());
			thay.push({
				ten,
				tra: `${tra.status} ${tra.loi.includes(cau) ? "cau ghim" : tra.loi}`,
				dich: sau,
			});
			mong.push({ ten, tra: "400 cau ghim", dich: truoc });
		}
		expect(thay).toEqual(mong);
		expect(await db.okrTrail.count()).toBe(soVet);
		expect(await phaCua(quy)).toBe("da-dong");

		const chupCuaKy = () =>
			db.okrSoChup.count({
				where: { keyResult: { objective: { cycleId: quy } } },
			});
		const chupTruoc = await chupCuaKy();
		await chupSoOkr(new Date(NGAY_SAU_KY_0005), {
			docO: async () => ({ giaTri: 7 }),
		});
		expect({
			ca: "chupSoOkr sau ngay cuoi o da-dong",
			moi: (await chupCuaKy()) - chupTruoc,
			bangTinhNgayCuoi: await db.okrSoChup.count({
				where: {
					keyResultId: f.krBang,
					ngay: new Date(`${KY.den}T00:00:00Z`),
				},
			}),
		}).toEqual({
			ca: "chupSoOkr sau ngay cuoi o da-dong",
			moi: 0,
			bangTinhNgayCuoi: 0,
		});

		expect(LY_DO_20).toHaveLength(20);
		expect(LY_DO_9).toHaveLength(9);
		const caTuChoi = [
			{ ten: "khong ly do", vao: { id: quy }, ai: quan, status: 400, cau: "" },
			{
				ten: "ly do 9 ky tu",
				vao: { id: quy, lyDo: LY_DO_9 },
				ai: quan,
				status: 400,
				cau: "",
			},
			{
				ten: "thanh vien thuong",
				vao: { id: quy, lyDo: LY_DO_20 },
				ai: "thuong",
				status: 403,
				cau: CAU.quanTri,
			},
		] as const;
		for (const ca of caTuChoi) {
			const tra = await goi("okr.moLaiKy", ca.vao, ca.ai);
			expect({
				ca: ca.ten,
				status: tra.status,
				cau: tra.loi.includes(ca.cau),
				pha: await phaCua(quy),
				vet: await vetMoLai(quy),
			}).toEqual({
				ca: ca.ten,
				status: ca.status,
				cau: true,
				pha: "da-dong",
				vet: [],
			});
		}

		ok(await goi("okr.moLaiKy", { id: quy, lyDo: LY_DO_20 }), "mo lai ky");
		expect(await phaCua(quy)).toBe("cham-diem");
		expect(await vetMoLai(quy)).toEqual([
			{
				actor: phien.quan.nguoi,
				note: LY_DO_20,
				before: { phase: "da-dong" },
				after: { phase: "cham-diem" },
			},
		]);
		expect(await dongDiemCuaKy(quy)).toEqual(diemKhiDong);

		const moLaiLan2 = await goi("okr.moLaiKy", { id: quy, lyDo: LY_DO_20 });
		expect({
			tra: tuChoi(moLaiLan2).includes(CAU.chiMoLaiKhiDong)
				? "cau ghim"
				: tuChoi(moLaiLan2),
			status: moLaiLan2.status,
			pha: await phaCua(quy),
			soVet: (await vetMoLai(quy)).length,
		}).toEqual({ tra: "cau ghim", status: 400, pha: "cham-diem", soVet: 1 });

		ok(
			await goi("okr.setCyclePhase", { id: quy, phase: "da-dong" }),
			"dong lai",
		);
		expect(await phaCua(quy)).toBe("da-dong");
		expect(await dongDiemCuaKy(quy)).toEqual(diemKhiDong);
	}, 90_000);
});

const CAU_MANG = {
	chuaCoKyKe: "Chưa có chu kỳ kế để mang sang — quản trị mở chu kỳ trước.",
	daMangSang: "Mục tiêu này đã mang sang chu kỳ kế rồi.",
	vuotTran: "Đơn vị này đã có 1 mục tiêu — vượt trần chương trình.",
	khongSuaDuocDonVi: CAU.khongSuaDuocDonVi,
	khongPhaiThanhVien: (id: string) =>
		`Người ${id} không phải thành viên đang hoạt động.`,
} as const;
const KY_KE = { tu: "2027-01-01", den: "2027-03-31" } as const;
const WHY_NOW = "Quý sau đối tác mới đổ về nhiều.";

type LienKet = { objectiveId: string; cycleName: string } | null;
type MangSangRa = {
	id: string;
	cycleId: string;
	chep: string[];
	khongChep: { keyResultId: string; lyDo: string }[];
	boThamGia: string[];
	doiPhuTrachKr: string[];
	canhBao: string | null;
};
type MucTieuDoc = { mangSangToi: LienKet; mangSangTu: LienKet };

const demDong = async () => ({
	mucTieu: await db.okrObjective.count(),
	kr: await db.okrKeyResult.count(),
	mangSang: await db.okrMangSang.count(),
});

const anhNguon = async (objectiveId: string) =>
	JSON.stringify({
		mt: await db.okrObjective.findUniqueOrThrow({
			where: { id: objectiveId },
			include: { participants: { orderBy: { userId: "asc" } } },
		}),
		krs: await db.okrKeyResult.findMany({
			where: { objectiveId },
			orderBy: { id: "asc" },
		}),
		diem: await db.okrDiemKr.findMany({
			where: { keyResult: { objectiveId } },
			orderBy: { keyResultId: "asc" },
		}),
	});

const tenKy = async (id: string) =>
	(await db.okrCycle.findUniqueOrThrow({ where: { id } })).name;

async function gieoMangSang(
	chuM2: "truong" | "tg2" = "truong",
	chuKr: { b?: "tg1" | "tg2"; c?: "tg1" | "tg2" } = {},
) {
	luc(LUC.gieo);
	await keoDaiPhien();
	await datChuongTrinh("0-1", true);
	const pb = await pbMoi("ms-pb");
	const truong = await truongMoi("department", pb, "ms-truong");
	const tg1 = await nguoiMoi("ms-tg1");
	const tg2 = await nguoiMoi("ms-tg2");
	const q4 = await gieoKyQuy(KY);
	const q4Dong = await gieoKyQuy(KY);
	const goc = await gieoMucTieuCongBo(q4, kr1());
	const unit = { level: "phong-ban", departmentId: pb };
	const m = idCua(
		await goi(
			"okr.createObjective",
			{
				cycleId: q4,
				unit,
				title: ma("ms muc tieu"),
				kind: "cam-ket",
				ownerUserId: truong.nguoi,
				participantIds: [tg1, tg2],
				whyNow: WHY_NOW,
			},
			truong.cookie,
		),
		"tao M",
	);
	const taoKr = async (
		nhan: string,
		kind: KieuKr,
		startValue: number,
		targetValue: number,
		currentValue: number,
		weight = 1,
		chu: "truong" | "tg1" | "tg2" = "truong",
	) =>
		idCua(
			await goi(
				"okr.createKeyResult",
				{
					objectiveId: m,
					title: ma(`ms kr ${nhan}`),
					kind,
					ownerUserId: chu === "tg1" ? tg1 : chu === "tg2" ? tg2 : truong.nguoi,
					startValue,
					targetValue,
					currentValue,
					unit: "đối tác",
					dueOn: "2026-12-15",
					weight,
				},
				truong.cookie,
			),
			`kr ${nhan}`,
		);
	const a = await taoKr("A", "giu-tren", 80, 90, 95);
	const b = await taoKr("B", "tang-toi", 60, 80, 78, 3, chuKr.b);
	const c = await taoKr("C", "moc", 0, 1, 0, 1, chuKr.c);
	const d = await taoKr("D", "tang-toi", 10, 20, 25);
	ok(
		await goi(
			"okr.addAlignment",
			{
				objectiveId: m,
				targetObjectiveId: goc.objectiveId,
				targetKeyResultId: null,
			},
			truong.cookie,
		),
		"can chinh M",
	);
	ok(await goi("okr.publishObjective", { id: m }, truong.cookie), "cong bo M");
	const m2 = await gieoMucTieuCongBo(
		q4Dong,
		[{ startValue: 0, targetValue: 100, currentValue: 50 }],
		{
			unit,
			ownerUserId: chuM2 === "tg2" ? tg2 : truong.nguoi,
			ai: truong.cookie,
		},
	);
	luc(LUC.sauKy);
	await keoDaiPhien();
	ok(await sangCham(q4), "sang cham q4");
	ok(await sangCham(q4Dong), "sang cham q4 se dong");
	ok(await chamKr(a, 1, truong.cookie), "cham A");
	ok(await chamKr(b, 0.9, truong.cookie), "cham B");
	ok(await chamKr(c, 0, truong.cookie), "cham C");
	ok(await chamKr(d, 0.8, truong.cookie, LY_DO_15), "cham D");
	await chamHetBangGoiY(q4Dong);
	ok(
		await goi("okr.setCyclePhase", { id: q4Dong, phase: "da-dong" }),
		"dong q4",
	);
	return { pb, truong, tg1, tg2, q4, q4Dong, m, m2, kr: { a, b, c, d } };
}

async function tuChoiMangSang(
	ca: string,
	objectiveId: string,
	ai: AiHoacCookie,
	status: number,
	cau: string,
) {
	const truoc = await demDong();
	const tra = await goi("okr.mangSang", { objectiveId }, ai);
	expect({
		ca,
		tra: `${tra.status} ${tra.loi.includes(cau) ? "cau ghim" : tra.loi}`,
		dem: await demDong(),
	}).toEqual({ ca, tra: `${status} cau ghim`, dem: truoc });
}

describe("mang-sang", () => {
	beforeAll(keoDaiPhien);
	afterAll(async () => {
		setSystemTime();
		await datChuongTrinh(CHUONG_TRINH_RONG.scoreScale, false);
		await donSanKhep();
	});

	test("mang-sang: chep KR diem duoi 1 voi khoi diem bang so chot, bo KR diem tron va KR hong luat kieu; giu trong so khi ky ke tat trong so; lien ket hai phia; nguon khong doi; lan hai va bon ca tu choi; mang sang tu ky da dong", async () => {
		const f = await gieoMangSang();
		const nguonTruoc = await anhNguon(f.m);

		await tuChoiMangSang(
			"khong co chu ky ke",
			f.m,
			f.truong.cookie,
			400,
			CAU_MANG.chuaCoKyKe,
		);

		const q1Dong = await gieoKyQuy(KY_KE);
		luc("2027-04-02T03:00:00Z");
		await keoDaiPhien();
		ok(await sangCham(q1Dong), "sang cham q1 dong");
		ok(
			await goi("okr.setCyclePhase", { id: q1Dong, phase: "da-dong" }),
			"dong q1",
		);
		luc(LUC.sauKy);
		await tuChoiMangSang(
			"chu ky ke da dong",
			f.m,
			f.truong.cookie,
			400,
			CAU_MANG.chuaCoKyKe,
		);

		const q1 = await gieoKyQuy({ ...KY_KE, pha: "lap-ke-hoach" });
		await tuChoiMangSang(
			"nguoi khong sua duoc M",
			f.m,
			"thuong",
			403,
			CAU_MANG.khongSuaDuocDonVi,
		);

		await datChuongTrinh("0-1", false);
		const soVetTruoc = await db.okrTrail.count({
			where: { objectiveId: f.m, action: "mang-sang" },
		});
		const ra = ok<MangSangRa>(
			await goi("okr.mangSang", { objectiveId: f.m }, f.truong.cookie),
			"mang sang M",
		);
		expect({ ...ra, chep: [...ra.chep].sort() }).toEqual({
			id: ra.id,
			cycleId: q1,
			chep: [f.kr.b, f.kr.c].sort(),
			khongChep: [{ keyResultId: f.kr.d, lyDo: "dich-phai-lon-hon-khoi-diem" }],
			boThamGia: [],
			doiPhuTrachKr: [],
			canhBao: null,
		});

		const nguon = await db.okrObjective.findUniqueOrThrow({
			where: { id: f.m },
			include: { participants: true },
		});
		const nhapQ1 = await db.okrObjective.findMany({
			where: { cycleId: q1 },
			include: { participants: true },
		});
		expect(
			nhapQ1.map((x) => ({
				id: x.id,
				status: x.status,
				level: x.level,
				divisionId: x.divisionId,
				departmentId: x.departmentId,
				personUserId: x.personUserId,
				kind: x.kind,
				ownerUserId: x.ownerUserId,
				thamGia: x.participants.map((p) => p.userId).sort(),
				title: x.title,
				whyNow: x.whyNow,
			})),
		).toEqual([
			{
				id: ra.id,
				status: "nhap",
				level: nguon.level,
				divisionId: nguon.divisionId,
				departmentId: nguon.departmentId,
				personUserId: nguon.personUserId,
				kind: nguon.kind,
				ownerUserId: nguon.ownerUserId,
				thamGia: [f.tg1, f.tg2].sort(),
				title: nguon.title,
				whyNow: WHY_NOW,
			},
		]);
		expect(await db.okrAlignment.count({ where: { objectiveId: ra.id } })).toBe(
			0,
		);

		const krNguon = async (id: string) =>
			db.okrKeyResult.findUniqueOrThrow({ where: { id } });
		const kb = await krNguon(f.kr.b);
		const kc = await krNguon(f.kr.c);
		const krMoi = await db.okrKeyResult.findMany({
			where: { objectiveId: ra.id },
			orderBy: { position: "asc" },
		});
		expect(
			krMoi.map((k) => ({
				title: k.title,
				kind: k.kind,
				ownerUserId: k.ownerUserId,
				unit: k.unit,
				startValue: Number(k.startValue),
				targetValue: Number(k.targetValue),
				currentValue: Number(k.currentValue),
				source: k.source,
				dueOn: k.dueOn,
				weight: Number(k.weight),
				startLockedAt: k.startLockedAt,
			})),
		).toEqual([
			{
				title: kb.title,
				kind: "tang-toi",
				ownerUserId: f.truong.nguoi,
				unit: "đối tác",
				startValue: 78,
				targetValue: 80,
				currentValue: 78,
				source: "tay",
				dueOn: null,
				weight: 3,
				startLockedAt: null,
			},
			{
				title: kc.title,
				kind: "moc",
				ownerUserId: f.truong.nguoi,
				unit: "đối tác",
				startValue: 0,
				targetValue: 1,
				currentValue: 0,
				source: "tay",
				dueOn: null,
				weight: 1,
				startLockedAt: null,
			},
		]);

		const noi = await db.okrMangSang.findMany({
			where: { tuObjectiveId: f.m },
		});
		expect(
			noi.map((n) => ({
				tu: n.tuObjectiveId,
				sang: n.sangObjectiveId,
				ky: n.sangCycleId,
				boi: n.boiUserId,
			})),
		).toEqual([{ tu: f.m, sang: ra.id, ky: q1, boi: f.truong.nguoi }]);

		const tenQ4 = await tenKy(f.q4);
		const tenQ1 = await tenKy(q1);
		const bang = await bangCham(f.q4);
		const dongM = bang.mucTieu.find((x) => x.id === f.m);
		expect(dongM?.mangSangToi).toEqual({
			objectiveId: ra.id,
			cycleName: tenQ1,
		});
		const docM = await doc<MucTieuDoc>("okr.objective", "quan", { id: f.m });
		const docMoi = await doc<MucTieuDoc>("okr.objective", "quan", {
			id: ra.id,
		});
		expect({
			nguon: { toi: docM.mangSangToi, tu: docM.mangSangTu },
			moi: { toi: docMoi.mangSangToi, tu: docMoi.mangSangTu },
		}).toEqual({
			nguon: { toi: { objectiveId: ra.id, cycleName: tenQ1 }, tu: null },
			moi: { toi: null, tu: { objectiveId: f.m, cycleName: tenQ4 } },
		});

		expect(await anhNguon(f.m)).toBe(nguonTruoc);
		expect(
			(await db.okrTrail.count({
				where: { objectiveId: f.m, action: "mang-sang" },
			})) - soVetTruoc,
		).toBe(1);
		expect(
			await db.okrTrail.count({
				where: { objectiveId: ra.id, action: "tao" },
			}),
		).toBe(1);

		const soQ1 = await db.okrObjective.count({ where: { cycleId: q1 } });
		await tuChoiMangSang(
			"lan hai",
			f.m,
			f.truong.cookie,
			400,
			CAU_MANG.daMangSang,
		);
		expect(await db.okrObjective.count({ where: { cycleId: q1 } })).toBe(soQ1);

		ok(
			await goi("okr.setProgram", {
				...CHUONG_TRINH_RONG,
				scoreScale: "0-1",
				weightsOn: false,
				objectiveCap: 1,
				capMode: "chan",
			}),
			"tran chan 1",
		);
		await tuChoiMangSang(
			"tran chan da day",
			f.m2.objectiveId,
			f.truong.cookie,
			400,
			CAU_MANG.vuotTran,
		);

		await datChuongTrinh("0-1", false);
		const doiChung = ok<MangSangRa>(
			await goi(
				"okr.mangSang",
				{ objectiveId: f.m2.objectiveId },
				f.truong.cookie,
			),
			"mang sang tu ky da dong",
		);
		expect({
			cycleId: doiChung.cycleId,
			chep: doiChung.chep,
			khongChep: doiChung.khongChep,
			phaNguon: await phaCua(f.q4Dong),
		}).toEqual({
			cycleId: q1,
			chep: f.m2.krIds,
			khongChep: [],
			phaNguon: "da-dong",
		});
	}, 90_000);
	test("mang-sang: nguoi tham gia da roi workspace bi bo khoi ban nhap, dau ra liet id; nguoi phu trach da roi van bi chan bang cau ghim", async () => {
		const f = await gieoMangSang("tg2");
		await gieoKyQuy({ ...KY_KE, pha: "lap-ke-hoach" });
		await datChuongTrinh("0-1", false);
		const roi = (userId: string) =>
			db.member.deleteMany({
				where: { organizationId: WORKSPACE_ID, userId },
			});

		await roi(f.tg1);
		const ra = ok<MangSangRa>(
			await goi("okr.mangSang", { objectiveId: f.m }, f.truong.cookie),
			"mang sang khi tg1 da roi",
		);
		const nhap = await db.okrObjective.findUniqueOrThrow({
			where: { id: ra.id },
			include: { participants: true },
		});
		expect({
			boThamGia: ra.boThamGia,
			thamGia: nhap.participants.map((p) => p.userId).sort(),
			nguonThamGia: (
				await db.okrParticipant.findMany({ where: { objectiveId: f.m } })
			)
				.map((p) => p.userId)
				.sort(),
		}).toEqual({
			boThamGia: [f.tg1],
			thamGia: [f.tg2],
			nguonThamGia: [f.tg1, f.tg2].sort(),
		});

		await roi(f.tg2);
		await tuChoiMangSang(
			"nguoi phu trach da roi",
			f.m2.objectiveId,
			f.truong.cookie,
			400,
			CAU_MANG.khongPhaiThanhVien(f.tg2),
		);
	}, 90_000);
	test("mang-sang: nguoi phu trach KR da roi workspace — ban chep giao cho nguoi phu trach muc tieu, dau ra va vet liet KR; KR co nguoi phu trach con hoat dong giu nguyen", async () => {
		const f = await gieoMangSang("truong", { b: "tg1", c: "tg2" });
		await gieoKyQuy({ ...KY_KE, pha: "lap-ke-hoach" });
		await datChuongTrinh("0-1", false);
		await db.member.deleteMany({
			where: { organizationId: WORKSPACE_ID, userId: f.tg1 },
		});

		const ra = ok<MangSangRa>(
			await goi("okr.mangSang", { objectiveId: f.m }, f.truong.cookie),
			"mang sang khi chu KR B da roi",
		);
		const tieuDe = async (id: string) =>
			(await db.okrKeyResult.findUniqueOrThrow({ where: { id } })).title;
		const chuBanChep = async (id: string) =>
			(
				await db.okrKeyResult.findFirstOrThrow({
					where: { objectiveId: ra.id, title: await tieuDe(id) },
				})
			).ownerUserId;
		const vet = await db.okrTrail.findFirstOrThrow({
			where: { objectiveId: f.m, action: "mang-sang" },
		});
		expect({
			chep: [...ra.chep].sort(),
			boThamGia: ra.boThamGia,
			doiPhuTrachKr: ra.doiPhuTrachKr,
			chuB: await chuBanChep(f.kr.b),
			chuC: await chuBanChep(f.kr.c),
			chuNguonB: (
				await db.okrKeyResult.findUniqueOrThrow({ where: { id: f.kr.b } })
			).ownerUserId,
			vet: vet.after,
		}).toEqual({
			chep: [f.kr.b, f.kr.c].sort(),
			boThamGia: [f.tg1],
			doiPhuTrachKr: [f.kr.b],
			chuB: f.truong.nguoi,
			chuC: f.tg2,
			chuNguonB: f.tg1,
			vet: expect.objectContaining({
				boThamGia: [f.tg1],
				doiPhuTrachKr: [f.kr.b],
			}),
		});
	}, 90_000);
});
