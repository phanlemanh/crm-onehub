import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { db } from "@crm/db";
import { chupKrCrm } from "@crm/db/okr-chi-so";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import {
	readReportingCurrency,
	writeReportingCurrency,
} from "@crm/db/settings";
import { parseDocSheetPayload, parseOkrNguon } from "@crm/validation/okr-nguon";
import { parseOkrVet } from "@crm/validation/okr-vet";
import { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { ConversionService } from "../src/currency/conversion.service";
import { DealsService } from "../src/deals/deals.service";
import { OkrService } from "../src/okr/okr.service";
import { OkrAccessService } from "../src/okr/okr-access.service";
import { OkrSoService } from "../src/okr/okr-so.service";
import {
	type AiHoacCookie,
	datViTri,
	dungSan,
	goi,
	goiQuery,
	type Json,
	ma,
	nguoiMoi,
	phien,
	phienCua,
	type TraLoi,
	ungDung,
} from "./okr-san";

dungSan();

const NGAY = { D: "2026-06-10", D1: "2026-06-09", D2: "2026-06-08" } as const;
const KY_TU = new Date("2026-04-01T00:00:00Z");
const KY_DEN = new Date("2026-06-30T00:00:00Z");
const CHOT_SOM = new Date("2026-05-15T03:00:00Z");
const CHOT_D1 = new Date("2026-06-09T03:00:00Z");
const CHOT_D = new Date("2026-06-10T03:00:00Z");
const SO_CHOT_SOM = 55;
const SO_P1 = 57;
const SO_P2 = 3;
const CO_TRANG = 50;
const SHEET_ID = "1AbCdEfGh_ij-KL";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=0`;
const SHEET_O = "Trang1!B2";
const EMAIL_SHEETS = "okr-doc@du-an-thu.iam.gserviceaccount.com";

const CAU = {
	donVi: "Đơn vị không có hoặc đã lưu trữ.",
	thanhVien: "Người này không phải thành viên của không gian làm việc.",
	url: "Đường dẫn phải là một bảng tính Google (docs.google.com/spreadsheets)",
	o: "Ô phải có dạng A1 hoặc Trang!A1",
	sheetsTat: "Quản trị chưa cắm khoá Google Sheets.",
	kyKhoa: "Chu kỳ này ở pha chấm điểm hoặc đã đóng — không ghi được nữa.",
	khongSua:
		"Chỉ người phụ trách KR hoặc người sửa được mục tiêu mới sửa KR này.",
	nguonKhoa: "Nguồn đã khoá khi công bố",
	hienTaiMay: "Số hiện tại của KR này do máy ghi",
	daCoSoChup: "KR đã có lịch sử số — sửa được, không xoá được.",
	doiTac: "Danh sách bản ghi thuộc dữ liệu đối tác",
	crmKhongHopKieu:
		"Chỉ số CRM là số đếm — KR mốc hay phần trăm không lấy số từ đây.",
} as const;

type Pha = "lap-ke-hoach" | "dang-chay" | "cham-diem" | "da-dong";
type TrangThai = "nhap" | "cong-bo";
type Nguon = "tay" | "crm";

type DongBanGhi = {
	loai: string;
	id: string;
	ten: string;
	ngay: string;
};
type BanGhiRa = {
	loai: string;
	dinhNghia: {
		chiSo: string;
		phamVi: { kieu: string; id?: string };
		bac?: string;
	} | null;
	tu: string | null;
	den: string | null;
	ngay: string | null;
	soDaChup: number | null;
	soTinhLai: number | null;
	lech: boolean;
	tong: number;
	dong: DongBanGhi[];
	lanGhi: { ngay: string; giaTri: number; nguoi: string | null }[];
};
type LichSuRa = {
	dong: {
		ngay: string;
		giaTri: number;
		nguon: string;
		tacGia: string | null;
	}[];
};
type KrRa = {
	id: string;
	source: string;
	doCanh: boolean;
	soMay: { giaTri: number; ngay: string; nguon: string } | null;
	nguonMay: {
		loai: string;
		chiSo: string | null;
		phamVi: { kieu: string; id?: string } | null;
		bac: string | null;
		sheetId: string | null;
		sheetO: string | null;
		docLuc: string | null;
		docGiaTri: number | null;
		docLoi: string | null;
	} | null;
};
type MucTieuRa = { keyResults: KrRa[] };
type ChiSoRa = {
	chiSo: string[];
	bac: string[];
	sheetsBat: boolean;
	emailSheets: string | null;
};

const s = {
	phuTrach: "",
	truongP1: "",
	nguoiP2: "",
	cookiePhuTrach: "",
	cookieTruongP1: "",
	B1: "",
	P1: "",
	P2: "",
	Pluu: "",
	cty: "",
	dealP1: [] as string[],
	dealKhac: [] as string[],
	ky: {} as Record<Pha, string>,
	kr: [] as string[],
};

const envGoc = {
	email: process.env.GOOGLE_SHEETS_EMAIL,
	khoa: process.env.GOOGLE_SHEETS_KHOA,
};

function camSheets() {
	process.env.GOOGLE_SHEETS_EMAIL = EMAIL_SHEETS;
	process.env.GOOGLE_SHEETS_KHOA = "khoa-rieng-thu";
}

function rutSheets() {
	delete process.env.GOOGLE_SHEETS_EMAIL;
	delete process.env.GOOGLE_SHEETS_KHOA;
}

function traEnv() {
	if (envGoc.email === undefined) delete process.env.GOOGLE_SHEETS_EMAIL;
	else process.env.GOOGLE_SHEETS_EMAIL = envGoc.email;
	if (envGoc.khoa === undefined) delete process.env.GOOGLE_SHEETS_KHOA;
	else process.env.GOOGLE_SHEETS_KHOA = envGoc.khoa;
}

async function mucTieu(pha: Pha, trangThai: TrangThai): Promise<string> {
	const r = await db.okrObjective.create({
		data: {
			cycleId: s.ky[pha],
			level: "phong-ban",
			departmentId: s.P1,
			ownerUserId: s.phuTrach,
			kind: "cam-ket",
			status: trangThai,
			publishedAt: trangThai === "cong-bo" ? new Date() : null,
			title: ma("muc-tieu"),
		},
	});
	return r.id;
}

async function kr(
	objectiveId: string,
	nguon: Nguon,
	kieu?: "moc" | "phan-tram",
): Promise<string> {
	const r = await db.okrKeyResult.create({
		data: {
			objectiveId,
			title: ma("kr"),
			kind: kieu ?? "tang-toi",
			ownerUserId: s.phuTrach,
			startValue: 0,
			targetValue: 100,
			currentValue: 0,
			source: nguon,
		},
	});
	s.kr.push(r.id);
	if (nguon === "crm") {
		await db.okrNguonKr.create({
			data: {
				keyResultId: r.id,
				loai: "crm",
				chiSo: "thoa-thuan-chot-duoc",
				phamVi: { kieu: "phong-ban", id: s.P1 },
				taoBoiUserId: s.phuTrach,
			},
		});
	}
	return r.id;
}

const chup = (keyResultId: string, ngay: string) =>
	chupKrCrm(db, keyResultId, ngay, parseOkrNguon);

const crmP1 = (keyResultId: string): Json => ({
	keyResultId,
	loai: "crm",
	chiSo: "thoa-thuan-chot-duoc",
	phamVi: { kieu: "phong-ban", id: s.P1 },
});

const cookieCua = (ai: "phuTrach" | "truongP1"): AiHoacCookie =>
	ai === "phuTrach" ? s.cookiePhuTrach : s.cookieTruongP1;

const datNguon = (vao: Json, ai: AiHoacCookie = s.cookiePhuTrach) =>
	goi("okr.datNguonKr", vao, ai);

const banGhi = (vao: Json, ai: AiHoacCookie = s.cookiePhuTrach) =>
	goiQuery("okr.banGhiChiSo", ai, vao);

function thanhCong<T>(tra: TraLoi, nhan: string): T {
	expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(`${nhan}: HTTP 200 `);
	return tra.data as T;
}

async function anhKr(id: string) {
	const k = await db.okrKeyResult.findUniqueOrThrow({
		where: { id },
		select: { source: true, currentValue: true },
	});
	const nguon = await db.okrNguonKr.findUnique({ where: { keyResultId: id } });
	const vet = await db.okrTrail.count({
		where: { keyResultId: id, action: "doi-nguon" },
	});
	const soChup = await db.okrSoChup.count({ where: { keyResultId: id } });
	return {
		source: k.source,
		currentValue: Number(k.currentValue),
		nguon,
		vet,
		soChup,
	};
}

async function cauHinh(id: string) {
	const n = await db.okrNguonKr.findUnique({ where: { keyResultId: id } });
	return n
		? {
				loai: n.loai,
				chiSo: n.chiSo,
				phamVi: n.phamVi,
				bac: n.bac,
				sheetId: n.sheetId,
				sheetO: n.sheetO,
			}
		: null;
}

async function vetDoiNguon(id: string) {
	const rows = await db.okrTrail.findMany({
		where: { keyResultId: id, action: "doi-nguon" },
		orderBy: [{ at: "asc" }, { id: "asc" }],
	});
	return rows.map((r) => ({
		before: parseOkrVet(r.before),
		after: parseOkrVet(r.after),
		note: r.note,
	}));
}

async function mucTieuCua(krId: string, ai: AiHoacCookie): Promise<KrRa> {
	const k = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: krId },
		select: { objectiveId: true },
	});
	const mt = thanhCong<MucTieuRa>(
		await goiQuery("okr.objective", ai, { id: k.objectiveId }),
		"okr.objective",
	);
	const ra = mt.keyResults.find((x) => x.id === krId);
	if (!ra) throw new Error(`okr.objective không trả KR ${krId}`);
	return ra;
}

async function nguonMayTrongObjective() {
	camSheets();
	const trigger = ungDung().get(AgentTriggerService);
	const poke = spyOn(
		trigger as unknown as { poke: () => void },
		"poke",
	).mockImplementation(() => undefined);
	try {
		const mt = await mucTieu("dang-chay", "nhap");
		const kCrm = await kr(mt, "crm");
		const kSheet = await kr(mt, "tay");
		const kTay = await kr(mt, "tay");
		thanhCong(
			await datNguon({
				keyResultId: kSheet,
				loai: "bang-tinh",
				url: SHEET_URL,
				o: SHEET_O,
			}),
			"bang-tinh",
		);
		expect((await mucTieuCua(kCrm, s.cookiePhuTrach)).nguonMay).toEqual({
			loai: "crm",
			chiSo: "thoa-thuan-chot-duoc",
			phamVi: { kieu: "phong-ban", id: s.P1 },
			bac: null,
			sheetId: null,
			sheetO: null,
			docLuc: null,
			docGiaTri: null,
			docLoi: null,
		});
		const cho = await mucTieuCua(kSheet, s.cookiePhuTrach);
		expect(cho.nguonMay).toEqual({
			loai: "bang-tinh",
			chiSo: null,
			phamVi: null,
			bac: null,
			sheetId: SHEET_ID,
			sheetO: SHEET_O,
			docLuc: null,
			docGiaTri: null,
			docLoi: null,
		});
		const hong = new Date("2026-06-10T02:12:00Z");
		await db.okrNguonKr.update({
			where: { keyResultId: kSheet },
			data: { docLuc: hong, docLoi: "chua-chia-se", thuLuc: hong },
		});
		const docHong = await mucTieuCua(kSheet, s.cookiePhuTrach);
		expect(docHong.nguonMay?.docLoi).toBe("chua-chia-se");
		expect(docHong.nguonMay?.docLuc).toBe(hong.toISOString());
		expect(docHong.nguonMay?.docGiaTri).toBeNull();
		const duoc = new Date("2026-06-10T02:15:00Z");
		await db.okrNguonKr.update({
			where: { keyResultId: kSheet },
			data: { docLuc: duoc, docGiaTri: 1240, docLoi: null },
		});
		const docDuoc = await mucTieuCua(kSheet, s.cookiePhuTrach);
		expect(docDuoc.nguonMay?.docLoi).toBeNull();
		expect(docDuoc.nguonMay?.docLuc).toBe(duoc.toISOString());
		expect(docDuoc.nguonMay?.docGiaTri).toBe(1240);
		expect((await mucTieuCua(kTay, s.cookiePhuTrach)).nguonMay).toBeNull();
	} finally {
		poke.mockRestore();
	}
}

const TU_VN = dauNgayVN(KY_TU);
const cuoiNgayVN = (ngay: string) => new Date(`${ngay}T17:00:00Z`);

async function demDocLap(phongBanId: string, ngay: string) {
	const nguoi = await db.orgPlacement.findMany({
		where: { primaryDepartmentId: phongBanId },
		select: { userId: true },
	});
	return db.deal.count({
		where: {
			stage: "CLOSED_WON",
			archivedAt: null,
			ownerId: { in: nguoi.map((n) => n.userId) },
			closedAt: { gte: TU_VN, lt: cuoiNgayVN(ngay) },
		},
	});
}

async function dongNgay(keyResultId: string, ngay: string) {
	const rows = await db.okrSoChup.findMany({
		where: { keyResultId, ngay: new Date(`${ngay}T00:00:00Z`) },
		select: { giaTri: true, nguon: true },
	});
	return rows.map((r) => ({ giaTri: Number(r.giaTri), nguon: r.nguon }));
}

async function lichSuKhongDoiApi() {
	const phong = async (ten: string) =>
		(
			await db.department.create({
				data: { name: ma(ten), position: 0, divisionId: s.B1 },
			})
		).id;
	const P1 = await phong("ls-P1");
	const P2 = await phong("ls-P2");
	const P3 = await phong("ls-P3");
	const a = await nguoiMoi("ls-a");
	const b = await nguoiMoi("ls-b");
	const c = await nguoiMoi("ls-c");
	await db.orgPlacement.createMany({
		data: [
			{ userId: a, primaryDepartmentId: P1 },
			{ userId: b, primaryDepartmentId: P1 },
			{ userId: c, primaryDepartmentId: P2 },
		],
	});
	const thoaThuan = async (ownerId: string) => {
		const d = await db.deal.create({
			data: {
				name: ma("ls-thoa-thuan"),
				companyId: s.cty,
				ownerId,
				stage: "CLOSED_WON",
				closedAt: CHOT_SOM,
			},
		});
		s.dealKhac.push(d.id);
		return d.id;
	};
	const moLai = await thoaThuan(b);
	const luuTru = await thoaThuan(b);
	await thoaThuan(a);
	await thoaThuan(c);

	const mt = await mucTieu("dang-chay", "nhap");
	const chinh = await kr(mt, "tay");
	const doiChung = await kr(mt, "tay");
	for (const [id, P] of [
		[chinh, P1],
		[doiChung, P2],
	] as const) {
		thanhCong(
			await datNguon({
				keyResultId: id,
				loai: "crm",
				chiSo: "thoa-thuan-chot-duoc",
				phamVi: { kieu: "phong-ban", id: P },
			}),
			`dat nguon ${id === chinh ? "chinh" : "doi chung"}`,
		);
		expect((await chup(id, NGAY.D)).ghi, "chupKrCrm ngay D").toBe(1);
	}
	expect({
		chinh: await dongNgay(chinh, NGAY.D),
		doiChung: await dongNgay(doiChung, NGAY.D),
	}).toEqual({
		chinh: [{ giaTri: 3, nguon: "crm" }],
		doiChung: [{ giaTri: 1, nguon: "crm" }],
	});
	const hienTaiTruoc = Number(
		(
			await db.okrKeyResult.findUniqueOrThrow({
				where: { id: chinh },
				select: { currentValue: true },
			})
		).currentValue,
	);
	expect(hienTaiTruoc).toBe(3);

	const deals = ungDung().get(DealsService);
	await deals.archive(luuTru);
	await deals.setStage({ id: moLai, stage: "QUALIFIED_TO_BUY" }, s.phuTrach);
	thanhCong(await datViTri(a, P3), "chuyen a sang P3");
	const conversion = ungDung().get(ConversionService);
	const tienCu = await readReportingCurrency(db);
	try {
		await writeReportingCurrency(db, tienCu === "VND" ? "USD" : "VND");
		await conversion.rerateAll();
	} finally {
		await writeReportingCurrency(db, tienCu);
		await conversion.rerateAll();
	}
	const moLaiSau = await db.deal.findUniqueOrThrow({
		where: { id: moLai },
		select: { stage: true, closedAt: true },
	});
	expect(moLaiSau).toEqual({ stage: "QUALIFIED_TO_BUY", closedAt: null });

	const lichSu = thanhCong<LichSuRa>(
		await goiQuery("okr.lichSuSo", s.cookiePhuTrach, {
			keyResultId: chinh,
		}),
		"lichSuSo chinh",
	);
	const banGhiD = thanhCong<BanGhiRa>(
		await banGhi({ keyResultId: chinh, ngay: NGAY.D, trang: 1 }),
		"banGhiChiSo chinh ngay D",
	);
	const banGhiDoiChung = thanhCong<BanGhiRa>(
		await banGhi({ keyResultId: doiChung, ngay: NGAY.D, trang: 1 }),
		"banGhiChiSo doi chung ngay D",
	);
	const docLap = {
		chinh: await demDocLap(P1, NGAY.D),
		doiChung: await demDocLap(P2, NGAY.D),
	};
	console.log(
		`lich-su-khong-doi-api: lichSuSo ${JSON.stringify(lichSu.dong.map((d) => [d.ngay, d.giaTri, d.nguon]))}; banGhiChiSo ngay D chinh soDaChup ${banGhiD.soDaChup} soTinhLai ${banGhiD.soTinhLai} lech ${banGhiD.lech}; doi chung soDaChup ${banGhiDoiChung.soDaChup} soTinhLai ${banGhiDoiChung.soTinhLai} lech ${banGhiDoiChung.lech}; dem doc lap ${JSON.stringify(docLap)}`,
	);
	expect(await dongNgay(chinh, NGAY.D)).toEqual([{ giaTri: 3, nguon: "crm" }]);
	expect(lichSu.dong.map((d) => [d.ngay, d.giaTri, d.nguon])).toEqual([
		[NGAY.D, 3, "crm"],
	]);
	expect(docLap).toEqual({ chinh: 0, doiChung: 1 });
	expect({
		ngay: banGhiD.ngay,
		soDaChup: banGhiD.soDaChup,
		soTinhLai: banGhiD.soTinhLai,
		lech: banGhiD.lech,
	}).toEqual({
		ngay: NGAY.D,
		soDaChup: 3,
		soTinhLai: docLap.chinh,
		lech: true,
	});
	expect({
		soDaChup: banGhiDoiChung.soDaChup,
		soTinhLai: banGhiDoiChung.soTinhLai,
		lech: banGhiDoiChung.lech,
	}).toEqual({ soDaChup: 1, soTinhLai: docLap.doiChung, lech: false });
	const hienTaiSau = Number(
		(
			await db.okrKeyResult.findUniqueOrThrow({
				where: { id: chinh },
				select: { currentValue: true },
			})
		).currentValue,
	);
	expect(hienTaiSau).toBe(hienTaiTruoc);
	await db.agentTask.deleteMany({
		where: { dealId: { in: [moLai, luuTru] } },
	});
}

async function kieuKhongLayCrm() {
	const mtNhap = await mucTieu("dang-chay", "nhap");
	const kMoc = await kr(mtNhap, "tay", "moc");
	const kPhanTram = await kr(mtNhap, "tay", "phan-tram");
	const kMocCongBo = await kr(
		await mucTieu("dang-chay", "cong-bo"),
		"tay",
		"moc",
	);
	for (const [ten, id] of [
		["moc", kMoc],
		["phan-tram", kPhanTram],
		["moc-do-canh", kMocCongBo],
	] as const) {
		const truoc = await anhKr(id);
		const tra = await datNguon(crmP1(id));
		expect(`${ten}: HTTP ${tra.status} ${tra.loi}`).toBe(
			`${ten}: HTTP 400 ${CAU.crmKhongHopKieu}`,
		);
		expect({ ca: ten, ...(await anhKr(id)) }).toEqual({
			ca: ten,
			...truoc,
		});
	}
	const kTang = await kr(mtNhap, "tay");
	thanhCong(await datNguon(crmP1(kTang)), "doi chung tang-toi");
	expect((await anhKr(kTang)).source).toBe("crm");
	thanhCong(await datNguon({ keyResultId: kMoc, loai: "api" }), "moc lay api");
	expect((await anhKr(kMoc)).source).toBe("api");
}

async function doCanhDoiLoai() {
	const T = await kr(await mucTieu("dang-chay", "cong-bo"), "tay");
	thanhCong(await datNguon(crmP1(T)), "T do canh crm");
	expect((await chup(T, NGAY.D)).ghi).toBe(1);
	const crm = await mucTieuCua(T, s.cookiePhuTrach);
	expect({ soMay: crm.soMay, loai: crm.nguonMay?.loai }).toEqual({
		soMay: { giaTri: SO_P1, ngay: NGAY.D, nguon: "crm" },
		loai: "crm",
	});
	thanhCong(await datNguon({ keyResultId: T, loai: "api" }), "T do canh api");
	const api = await mucTieuCua(T, s.cookiePhuTrach);
	expect({
		doCanh: api.doCanh,
		soMay: api.soMay,
		loai: api.nguonMay?.loai,
	}).toEqual({ doCanh: true, soMay: null, loai: "api" });
	const so = ungDung().get(OkrSoService);
	await so.ghiSoKr(s.phuTrach, { id: T, giaTri: 4 }, CHOT_D);
	expect((await mucTieuCua(T, s.cookiePhuTrach)).soMay).toEqual({
		giaTri: 4,
		ngay: NGAY.D,
		nguon: "api",
	});
}

async function banGhiMotLanDem(kB: string) {
	let lanDem = 0;
	const deal = new Proxy(db.deal, {
		get(dich, khoa) {
			if (khoa !== "count") return Reflect.get(dich, khoa);
			return (...doiSo: Parameters<typeof db.deal.count>) => {
				lanDem += 1;
				return dich.count(...doiSo);
			};
		},
	});
	const dbDem = new Proxy(db, {
		get(dich, khoa) {
			return khoa === "deal" ? deal : Reflect.get(dich, khoa);
		},
	});
	const goc = ungDung().get(OkrSoService);
	const so = new OkrSoService(
		dbDem,
		ungDung().get(OkrAccessService),
		ungDung().get(OkrService),
		ungDung().get(AgentTriggerService),
	);
	const r = await so.banGhiChiSo(s.phuTrach, {
		keyResultId: kB,
		ngay: NGAY.D,
		trang: 1,
	});
	const doiChung = await goc.banGhiChiSo(s.phuTrach, {
		keyResultId: kB,
		ngay: NGAY.D,
		trang: 1,
	});
	expect(`soTinhLai ${r.soTinhLai} tong ${r.tong} lan dem deal ${lanDem}`).toBe(
		`soTinhLai ${SO_P1} tong ${SO_P1} lan dem deal 1`,
	);
	expect(r).toEqual(doiChung);
}

async function doiKieuKrCrm() {
	const mtNhap = await mucTieu("dang-chay", "nhap");
	const kCrm = await kr(mtNhap, "crm");
	const kDoCanh = await kr(await mucTieu("dang-chay", "cong-bo"), "tay");
	thanhCong(await datNguon(crmP1(kDoCanh)), "do canh crm");
	const kApi = await kr(mtNhap, "tay");
	thanhCong(await datNguon({ keyResultId: kApi, loai: "api" }), "nguon api");
	const anh = async (id: string) => {
		const k = await db.okrKeyResult.findUniqueOrThrow({
			where: { id },
			select: { kind: true, targetValue: true, source: true },
		});
		return {
			kind: k.kind,
			targetValue: Number(k.targetValue),
			source: k.source,
			nguon: await cauHinh(id),
			vet: await db.okrTrail.count({ where: { keyResultId: id } }),
		};
	};
	const doiKieu = (vao: Json) =>
		goi("okr.updateKeyResult", vao, s.cookieTruongP1);
	for (const [ten, id, kind] of [
		["crm-moc", kCrm, "moc"],
		["crm-phan-tram", kCrm, "phan-tram"],
		["do-canh-moc", kDoCanh, "moc"],
	] as const) {
		const truoc = await anh(id);
		const tra = await doiKieu({ id, kind, targetValue: 1 });
		expect(`${ten}: HTTP ${tra.status} ${tra.loi}`).toBe(
			`${ten}: HTTP 400 ${CAU.crmKhongHopKieu}`,
		);
		expect({ ca: ten, ...(await anh(id)) }).toEqual({ ca: ten, ...truoc });
	}
	thanhCong(
		await doiKieu({ id: kCrm, kind: "tang-toi", targetValue: 50 }),
		"crm tang-toi khac dich",
	);
	expect((await anh(kCrm)).targetValue).toBe(50);
	thanhCong(
		await doiKieu({ id: kApi, kind: "moc", targetValue: 1 }),
		"api sang moc",
	);
	expect((await anh(kApi)).kind).toBe("moc");
}

describe("okr-nguon", () => {
	beforeAll(async () => {
		s.phuTrach = await nguoiMoi("phu-trach");
		s.truongP1 = await nguoiMoi("truong-p1");
		s.nguoiP2 = await nguoiMoi("nguoi-p2");
		s.cookiePhuTrach = await phienCua(s.phuTrach);
		s.cookieTruongP1 = await phienCua(s.truongP1);
		s.B1 = (
			await db.division.create({ data: { name: ma("B1"), position: 0 } })
		).id;
		const phong = async (ten: string, luuTru: boolean) =>
			(
				await db.department.create({
					data: {
						name: ma(ten),
						position: 0,
						divisionId: s.B1,
						archivedAt: luuTru ? new Date() : null,
					},
				})
			).id;
		s.P1 = await phong("P1", false);
		s.P2 = await phong("P2", false);
		s.Pluu = await phong("P-luu", true);
		await db.department.update({
			where: { id: s.P1 },
			data: { headUserId: s.truongP1 },
		});
		await db.orgPlacement.createMany({
			data: [
				{ userId: s.phuTrach, primaryDepartmentId: s.P1 },
				{ userId: s.truongP1, primaryDepartmentId: s.P1 },
				{ userId: s.nguoiP2, primaryDepartmentId: s.P2 },
			],
		});
		s.cty = (await db.company.create({ data: { name: ma("cty") } })).id;
		const chot = (ownerId: string, closedAt: Date, luuTru = false) => ({
			name: ma("thoa-thuan"),
			companyId: s.cty,
			ownerId,
			stage: "CLOSED_WON" as const,
			closedAt,
			archivedAt: luuTru ? new Date("2026-05-20T03:00:00Z") : null,
		});
		const p1 = await db.deal.createManyAndReturn({
			data: [
				...Array.from({ length: SO_CHOT_SOM }, (_, i) =>
					chot(i % 2 === 0 ? s.phuTrach : s.truongP1, CHOT_SOM),
				),
				chot(s.phuTrach, CHOT_D1),
				chot(s.truongP1, CHOT_D),
			],
			select: { id: true },
		});
		s.dealP1 = p1.map((d) => d.id);
		const khac = await db.deal.createManyAndReturn({
			data: [
				chot(s.phuTrach, CHOT_SOM, true),
				...Array.from({ length: SO_P2 }, () => chot(s.nguoiP2, CHOT_SOM)),
			],
			select: { id: true },
		});
		s.dealKhac = khac.map((d) => d.id);
		for (const pha of [
			"lap-ke-hoach",
			"dang-chay",
			"cham-diem",
			"da-dong",
		] as const) {
			const c = await db.okrCycle.create({
				data: {
					kind: "quy",
					name: ma(`ky-${pha}`),
					startsOn: KY_TU,
					endsOn: KY_DEN,
					phase: pha,
				},
			});
			s.ky[pha] = c.id;
		}
	});

	afterAll(async () => {
		traEnv();
		await db.okrSoChup.deleteMany({ where: { keyResultId: { in: s.kr } } });
		await db.agentTask.deleteMany({
			where: {
				kind: "okr-doc-sheet",
				OR: s.kr.map((id) => ({
					payload: { path: ["keyResultId"], equals: id },
				})),
			},
		});
		await db.deal.deleteMany({
			where: { id: { in: [...s.dealP1, ...s.dealKhac] } },
		});
		await db.company.deleteMany({ where: { id: s.cty } });
	});

	describe("dat-nguon", () => {
		test("bon lan dat nguon tren muc tieu nhap: DB va vet dung bang viet truoc", async () => {
			camSheets();
			const mt = await mucTieu("dang-chay", "nhap");
			const k = await kr(mt, "tay");
			const pv = `phong-ban:${s.P1}`;

			thanhCong(await datNguon(crmP1(k)), "crm");
			expect((await anhKr(k)).source).toBe("crm");
			expect(await cauHinh(k)).toEqual({
				loai: "crm",
				chiSo: "thoa-thuan-chot-duoc",
				phamVi: { kieu: "phong-ban", id: s.P1 },
				bac: null,
				sheetId: null,
				sheetO: null,
			});
			expect((await chup(k, NGAY.D)).ghi).toBe(1);
			const soChupGieo = (await anhKr(k)).soChup;
			expect(soChupGieo).toBe(1);

			thanhCong(await datNguon({ keyResultId: k, loai: "api" }), "api");
			expect((await anhKr(k)).source).toBe("api");
			expect(await cauHinh(k)).toEqual({
				loai: "api",
				chiSo: null,
				phamVi: null,
				bac: null,
				sheetId: null,
				sheetO: null,
			});

			thanhCong(
				await datNguon({
					keyResultId: k,
					loai: "bang-tinh",
					url: SHEET_URL,
					o: SHEET_O,
				}),
				"bang-tinh",
			);
			expect((await anhKr(k)).source).toBe("bang-tinh");
			expect(await cauHinh(k)).toEqual({
				loai: "bang-tinh",
				chiSo: null,
				phamVi: null,
				bac: null,
				sheetId: SHEET_ID,
				sheetO: SHEET_O,
			});

			thanhCong(await datNguon({ keyResultId: k, loai: "tay" }), "tay");
			const sau = await anhKr(k);
			expect(sau.source).toBe("tay");
			expect(sau.nguon).toBeNull();
			expect(sau.soChup).toBe(soChupGieo);

			expect(await vetDoiNguon(k)).toEqual([
				{
					before: { nguon: "tay" },
					after: {
						nguon: "crm",
						nguonMay: "crm",
						chiSo: "thoa-thuan-chot-duoc",
						phamVi: pv,
					},
					note: null,
				},
				{
					before: {
						nguon: "crm",
						nguonMay: "crm",
						chiSo: "thoa-thuan-chot-duoc",
						phamVi: pv,
					},
					after: { nguon: "api", nguonMay: "api" },
					note: null,
				},
				{
					before: { nguon: "api", nguonMay: "api" },
					after: {
						nguon: "bang-tinh",
						nguonMay: "bang-tinh",
						sheetId: SHEET_ID,
						sheetO: SHEET_O,
					},
					note: null,
				},
				{
					before: {
						nguon: "bang-tinh",
						nguonMay: "bang-tinh",
						sheetId: SHEET_ID,
						sheetO: SHEET_O,
					},
					after: { nguon: "tay" },
					note: null,
				},
			]);
		});

		test("ma tran tu choi chin ca: cau ghim, khong dong nao doi; doi chung duong ghi duoc", async () => {
			const mt = await mucTieu("dang-chay", "nhap");
			const kMa = await kr(mt, "tay");
			const kCham = await kr(await mucTieu("cham-diem", "nhap"), "tay");
			const kDong = await kr(await mucTieu("da-dong", "nhap"), "tay");
			const sheet = (o: string, url = SHEET_URL): Json => ({
				keyResultId: kMa,
				loai: "bang-tinh",
				url,
				o,
			});
			const phamVi = (kieu: string, id: string): Json => ({
				keyResultId: kMa,
				loai: "crm",
				chiSo: "thoa-thuan-chot-duoc",
				phamVi: { kieu, id },
			});
			const MA_TRAN: {
				ten: string;
				kr: string;
				vao: () => Json;
				ai: () => AiHoacCookie;
				sheets: boolean;
				status: number;
				cau: string;
			}[] = [
				{
					ten: "don-vi-khong-ton-tai",
					kr: kMa,
					vao: () => phamVi("phong-ban", "khong-co-phong-ban"),
					ai: () => s.cookiePhuTrach,
					sheets: true,
					status: 400,
					cau: CAU.donVi,
				},
				{
					ten: "phong-ban-da-luu-tru",
					kr: kMa,
					vao: () => phamVi("phong-ban", s.Pluu),
					ai: () => s.cookiePhuTrach,
					sheets: true,
					status: 400,
					cau: CAU.donVi,
				},
				{
					ten: "nguoi-khong-phai-thanh-vien",
					kr: kMa,
					vao: () => phamVi("nguoi", "khong-co-nguoi"),
					ai: () => s.cookiePhuTrach,
					sheets: true,
					status: 400,
					cau: CAU.thanhVien,
				},
				{
					ten: "url-ngoai-google-sheets",
					kr: kMa,
					vao: () => sheet("B2", "https://example.com/spreadsheets/d/abc"),
					ai: () => s.cookiePhuTrach,
					sheets: true,
					status: 400,
					cau: CAU.url,
				},
				{
					ten: "o-sai-khuon",
					kr: kMa,
					vao: () => sheet("B"),
					ai: () => s.cookiePhuTrach,
					sheets: true,
					status: 400,
					cau: CAU.o,
				},
				{
					ten: "sheets-khi-hai-bien-vang",
					kr: kMa,
					vao: () => sheet(SHEET_O),
					ai: () => s.cookiePhuTrach,
					sheets: false,
					status: 400,
					cau: CAU.sheetsTat,
				},
				{
					ten: "pha-cham-diem",
					kr: kCham,
					vao: () => crmP1(kCham),
					ai: () => s.cookiePhuTrach,
					sheets: true,
					status: 400,
					cau: CAU.kyKhoa,
				},
				{
					ten: "pha-da-dong",
					kr: kDong,
					vao: () => crmP1(kDong),
					ai: () => s.cookiePhuTrach,
					sheets: true,
					status: 400,
					cau: CAU.kyKhoa,
				},
				{
					ten: "nguoi-goi-khong-sua-duoc-kr",
					kr: kMa,
					vao: () => crmP1(kMa),
					ai: () => phien.thuong.cookie,
					sheets: true,
					status: 403,
					cau: CAU.khongSua,
				},
			];
			for (const ca of MA_TRAN) {
				if (ca.sheets) camSheets();
				else rutSheets();
				const truoc = await anhKr(ca.kr);
				const tra = await datNguon(ca.vao(), ca.ai());
				expect(`${ca.ten}: HTTP ${tra.status}`).toBe(
					`${ca.ten}: HTTP ${ca.status}`,
				);
				expect(`${ca.ten}: ${tra.loi}`).toContain(ca.cau);
				expect({ ca: ca.ten, ...(await anhKr(ca.kr)) }).toEqual({
					ca: ca.ten,
					...truoc,
				});
			}
			camSheets();
			thanhCong(await datNguon(crmP1(kMa)), "doi chung duong");
			expect((await anhKr(kMa)).source).toBe("crm");
			expect((await cauHinh(kMa))?.phamVi).toEqual({
				kieu: "phong-ban",
				id: s.P1,
			});
		});

		test("doi kieu KR dang lay crm sang moc hay phan-tram: cau ghim, khong dong nao doi; doi chung crm tang-toi khac dich va api sang moc ghi duoc", async () => {
			await doiKieuKrCrm();
		});

		test("KR moc va phan-tram khong lay nguon crm: cau ghim, khong dong nao doi; doi chung tang-toi va api cho moc dat duoc", async () => {
			await kieuKhongLayCrm();
		});
	});

	describe("khoa-cong-bo", () => {
		test("KR crm cua muc tieu cong bo: doi hay go nguon bi tu choi, khong dong nao doi", async () => {
			const mt = await mucTieu("dang-chay", "cong-bo");
			const C = await kr(mt, "crm");
			for (const vao of [
				{ keyResultId: C, loai: "api" },
				{ keyResultId: C, loai: "tay" },
			]) {
				const truoc = await anhKr(C);
				const tra = await datNguon(vao);
				const sau = await anhKr(C);
				expect(`C->${vao.loai}: HTTP ${tra.status} source ${sau.source}`).toBe(
					`C->${vao.loai}: HTTP 400 source crm`,
				);
				expect(`C->${vao.loai}: ${tra.loi}`).toContain(CAU.nguonKhoa);
				expect(sau).toEqual(truoc);
			}
		});

		test("KR tay cua muc tieu cong bo them so do canh, source van tay", async () => {
			const mt = await mucTieu("dang-chay", "cong-bo");
			const T = await kr(mt, "tay");
			const doCanh = thanhCong<{ id: string; doCanh: boolean }>(
				await datNguon(crmP1(T)),
				"T do canh",
			);
			expect(doCanh.doCanh).toBe(true);
			const sauT = await anhKr(T);
			expect(sauT.source).toBe("tay");
			expect(sauT.nguon?.loai).toBe("crm");
			expect(await vetDoiNguon(T)).toEqual([
				{
					before: { nguon: "tay" },
					after: {
						nguon: "tay",
						nguonMay: "crm",
						chiSo: "thoa-thuan-chot-duoc",
						phamVi: `phong-ban:${s.P1}`,
					},
					note: "đo cạnh",
				},
			]);
			expect((await mucTieuCua(T, s.cookiePhuTrach)).doCanh).toBe(true);
		});

		test("KR tay do canh doi tu crm sang api: soMay khong mang so crm cu, nguonMay theo cau hinh", async () => {
			await doCanhDoiLoai();
		});

		test("currentValue cua KR may bi tu choi o moi pha, KR co ban chup khong xoa duoc", async () => {
			const C = await kr(await mucTieu("dang-chay", "cong-bo"), "crm");
			const chayC = await goi(
				"okr.updateKeyResult",
				{ id: C, currentValue: 5 },
				s.cookiePhuTrach,
			);
			expect(`${chayC.status} ${chayC.loi}`).toContain(`400 ${CAU.hienTaiMay}`);

			const mtLap = await mucTieu("lap-ke-hoach", "nhap");
			const C2 = await kr(mtLap, "crm");
			const T2 = await kr(mtLap, "tay");
			const lapC = await goi(
				"okr.updateKeyResult",
				{ id: C2, currentValue: 5 },
				s.cookiePhuTrach,
			);
			expect(`${lapC.status} ${lapC.loi}`).toContain(`400 ${CAU.hienTaiMay}`);
			expect((await anhKr(C2)).currentValue).toBe(0);

			const C3 = await kr(await mucTieu("cham-diem", "nhap"), "crm");
			const chamC = await goi(
				"okr.updateKeyResult",
				{ id: C3, currentValue: 5 },
				s.cookiePhuTrach,
			);
			expect(`${chamC.status} ${chamC.loi}`).toContain(`400 ${CAU.kyKhoa}`);

			thanhCong(
				await goi(
					"okr.updateKeyResult",
					{ id: T2, currentValue: 5 },
					s.cookiePhuTrach,
				),
				"doi chung T2",
			);
			expect((await anhKr(T2)).currentValue).toBe(5);

			expect((await chup(C2, NGAY.D)).ghi).toBe(1);
			const xoa = await goi(
				"okr.removeKeyResult",
				{ id: C2 },
				s.cookieTruongP1,
			);
			expect(`${xoa.status} ${xoa.loi}`).toContain(`400 ${CAU.daCoSoChup}`);
			expect(
				await db.okrKeyResult.count({ where: { id: C2 } }),
				"KR C2 con",
			).toBe(1);
		});
	});

	describe("ban-ghi", () => {
		const b = { kB: "", kApi: "" };

		beforeAll(async () => {
			const mt = await mucTieu("dang-chay", "nhap");
			b.kB = await kr(mt, "tay");
			thanhCong(await datNguon(crmP1(b.kB)), "dat nguon kB");
			for (const ngay of [NGAY.D, NGAY.D1, NGAY.D2]) {
				expect((await chup(b.kB, ngay)).ghi, `chup ${ngay}`).toBe(1);
			}
			b.kApi = await kr(mt, "tay");
			thanhCong(
				await datNguon({ keyResultId: b.kApi, loai: "api" }),
				"dat nguon api",
			);
			const so = ungDung().get(OkrSoService);
			await so.ghiSoKr(s.phuTrach, { id: b.kApi, giaTri: 7 }, CHOT_D1);
			await so.ghiSoKr(s.truongP1, { id: b.kApi, giaTri: 9 }, CHOT_D);
		});

		test("khong ngay: ngay moi nhat, hai trang cong bang soTinhLai bang soDaChup", async () => {
			const t1 = thanhCong<BanGhiRa>(
				await banGhi({ keyResultId: b.kB, trang: 1 }),
				"trang 1",
			);
			const t2 = thanhCong<BanGhiRa>(
				await banGhi({ keyResultId: b.kB, trang: 2 }),
				"trang 2",
			);
			expect(t1.ngay).toBe(NGAY.D);
			expect(t1.loai).toBe("crm");
			expect(t1.dinhNghia).toEqual({
				chiSo: "thoa-thuan-chot-duoc",
				phamVi: { kieu: "phong-ban", id: s.P1 },
			});
			expect(t1.tu).toBe("2026-04-01");
			expect(t1.den).toBe(NGAY.D);
			const tongDong = t1.dong.length + t2.dong.length;
			expect(
				`tong dong ${tongDong} soTinhLai ${t1.soTinhLai} soDaChup ${t1.soDaChup} tong ${t1.tong}`,
			).toBe(
				`tong dong ${SO_P1} soTinhLai ${SO_P1} soDaChup ${SO_P1} tong ${SO_P1}`,
			);
			expect(t1.dong).toHaveLength(CO_TRANG);
			expect(t2.dong).toHaveLength(SO_P1 - CO_TRANG);
			expect(t1.lech).toBe(false);
			for (const d of [...t1.dong, ...t2.dong]) {
				expect(d.loai).toBe("deal");
				expect(d.ten.length).toBeGreaterThan(0);
				expect(d.ngay).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			}
			expect(new Set([...t1.dong, ...t2.dong].map((d) => d.id))).toEqual(
				new Set(s.dealP1),
			);
			expect(t1.lanGhi).toEqual([]);
		});

		test("KR crm: ban ghi dem bang mot lan dem, khong dem lai rieng cho soTinhLai", async () => {
			await banGhiMotLanDem(b.kB);
		});

		test("ngay cu nhat: khoang ngay va soDaChup cua ngay do", async () => {
			const r = thanhCong<BanGhiRa>(
				await banGhi({ keyResultId: b.kB, ngay: NGAY.D2, trang: 1 }),
				"ngay cu",
			);
			expect({
				ngay: r.ngay,
				tu: r.tu,
				den: r.den,
				soDaChup: r.soDaChup,
				soTinhLai: r.soTinhLai,
				tong: r.tong,
				lech: r.lech,
			}).toEqual({
				ngay: NGAY.D2,
				tu: "2026-04-01",
				den: NGAY.D2,
				soDaChup: SO_CHOT_SOM,
				soTinhLai: SO_CHOT_SOM,
				tong: SO_CHOT_SOM,
				lech: false,
			});
		});

		test("ma tran vai: ba vai doc duoc, vai okr bi tu choi nhung doc duoc so", async () => {
			const DOC_DUOC: [string, () => AiHoacCookie][] = [
				["owner", () => phien.chu.cookie],
				["admin", () => phien.quan.cookie],
				["truong-p1", () => cookieCua("truongP1")],
				["thanh-vien-thuong", () => phien.thuong.cookie],
			];
			for (const [ten, ai] of DOC_DUOC) {
				const tra = await banGhi({ keyResultId: b.kB, trang: 1 }, ai());
				expect(`${ten}: HTTP ${tra.status} ${tra.loi}`).toBe(
					`${ten}: HTTP 200 `,
				);
				expect((tra.data as BanGhiRa).soTinhLai).toBe(SO_P1);
			}
			const okr = await banGhi(
				{ keyResultId: b.kB, trang: 1 },
				phien.okr.cookie,
			);
			expect(`okr: HTTP ${okr.status} ${okr.loi}`).toContain(
				`okr: HTTP 403 ${CAU.doiTac}`,
			);
			const lichSu = thanhCong<LichSuRa>(
				await goiQuery("okr.lichSuSo", phien.okr.cookie, {
					keyResultId: b.kB,
				}),
				"okr lichSuSo",
			);
			expect(lichSu.dong.map((d) => [d.ngay, d.giaTri, d.nguon])).toEqual([
				[NGAY.D, SO_P1, "crm"],
				[NGAY.D1, SO_P1 - 1, "crm"],
				[NGAY.D2, SO_CHOT_SOM, "crm"],
			]);
			const krOkr = await mucTieuCua(b.kB, phien.okr.cookie);
			expect(krOkr.soMay).toEqual({
				giaTri: SO_P1,
				ngay: NGAY.D,
				nguon: "crm",
			});
			expect(krOkr.doCanh).toBe(false);
		});

		test("doi pham vi sau khi chup: ngay da chup giu dinh nghia cua dong chup", async () => {
			thanhCong(
				await datNguon({
					keyResultId: b.kB,
					loai: "crm",
					chiSo: "thoa-thuan-chot-duoc",
					phamVi: { kieu: "bo-phan", id: s.B1 },
				}),
				"doi pham vi",
			);
			const t1 = thanhCong<BanGhiRa>(
				await banGhi({ keyResultId: b.kB, ngay: NGAY.D, trang: 1 }),
				"ngay D trang 1",
			);
			const t2 = thanhCong<BanGhiRa>(
				await banGhi({ keyResultId: b.kB, ngay: NGAY.D, trang: 2 }),
				"ngay D trang 2",
			);
			expect(
				`phamVi ${JSON.stringify(t1.dinhNghia?.phamVi)} lech ${t1.lech}`,
			).toBe(
				`phamVi ${JSON.stringify({ kieu: "phong-ban", id: s.P1 })} lech false`,
			);
			expect(t1.soTinhLai).toBe(SO_P1);
			expect(t1.soDaChup).toBe(SO_P1);
			const ids = [...t1.dong, ...t2.dong].map((d) => d.id);
			expect(ids.filter((id) => !s.dealP1.includes(id))).toEqual([]);
			expect(ids).toHaveLength(SO_P1);
		});

		test("KR nguon api: lanGhi moi truoc, khong danh sach ban ghi", async () => {
			const r = thanhCong<BanGhiRa>(
				await banGhi({ keyResultId: b.kApi, trang: 1 }),
				"api",
			);
			expect(r.loai).toBe("api");
			expect(r.lanGhi).toEqual([
				{ ngay: NGAY.D, giaTri: 9, nguoi: s.truongP1 },
				{ ngay: NGAY.D1, giaTri: 7, nguoi: s.phuTrach },
			]);
			expect(r.dong).toEqual([]);
			expect(r.tong).toBe(2);
		});

		test("ngay da chup giu loai nguon cua dong chup sau khi doi sang api", async () => {
			const k = await kr(await mucTieu("dang-chay", "nhap"), "tay");
			thanhCong(await datNguon(crmP1(k)), "dat crm");
			expect((await chup(k, NGAY.D)).ghi).toBe(1);
			thanhCong(await datNguon({ keyResultId: k, loai: "api" }), "doi api");
			const r = thanhCong<BanGhiRa>(
				await banGhi({ keyResultId: k, ngay: NGAY.D, trang: 1 }),
				"ngay D sau doi api",
			);
			expect(
				`loai ${r.loai} phamVi ${JSON.stringify(r.dinhNghia?.phamVi)} tong ${r.tong} soDaChup ${r.soDaChup}`,
			).toBe(
				`loai crm phamVi ${JSON.stringify({ kieu: "phong-ban", id: s.P1 })} tong ${SO_P1} soDaChup ${SO_P1}`,
			);
			expect(r.dinhNghia?.chiSo).toBe("thoa-thuan-chot-duoc");
			expect(r.lech).toBe(false);
			expect(r.lanGhi).toEqual([]);
		});
	});

	describe("xem-truoc", () => {
		test("xemTruocChiSo dem toi luc nay, khong ghi gi", async () => {
			const truoc = await db.okrSoChup.count();
			const r = thanhCong<{ giaTri: number; tu: string; den: string }>(
				await goiQuery("okr.xemTruocChiSo", s.cookiePhuTrach, {
					chiSo: "thoa-thuan-chot-duoc",
					phamVi: { kieu: "bo-phan", id: s.B1 },
					cycleId: s.ky["dang-chay"],
				}),
				"xem truoc",
			);
			expect(r).toEqual({
				giaTri: SO_P1 + SO_P2,
				tu: "2026-04-01",
				den: "2026-06-30",
			});
			expect(await db.okrSoChup.count()).toBe(truoc);
		});
	});

	describe("sheets", () => {
		test("bang-tinh xep viec okr-doc-sheet, doc lai them viec, API khong goi Google", async () => {
			camSheets();
			const bay: string[] = [];
			const fetchGoc = globalThis.fetch;
			const bayFetch = (
				vao: Parameters<typeof fetch>[0],
				init?: RequestInit,
			) => {
				const url = vao instanceof Request ? vao.url : String(vao);
				if (url.includes("googleapis.com")) {
					bay.push(url);
					return Promise.reject(new Error(`bay googleapis: ${url}`));
				}
				return fetchGoc(vao, init);
			};
			globalThis.fetch = Object.assign(bayFetch, {
				preconnect: fetchGoc.preconnect,
			});
			const trigger = ungDung().get(AgentTriggerService);
			const poke = spyOn(
				trigger as unknown as { poke: () => void },
				"poke",
			).mockImplementation(() => undefined);
			try {
				const k = await kr(await mucTieu("dang-chay", "nhap"), "tay");
				const viec = async () =>
					(
						await db.agentTask.findMany({
							where: {
								kind: "okr-doc-sheet",
								payload: { path: ["keyResultId"], equals: k },
							},
							orderBy: { createdAt: "asc" },
						})
					).map((v) => parseDocSheetPayload(v.payload));
				const vao = {
					keyResultId: k,
					loai: "bang-tinh",
					url: SHEET_URL,
					o: SHEET_O,
				};
				thanhCong(await datNguon(vao), "bang-tinh lan 1");
				expect(bay, `goi googleapis: ${bay.join(", ")}`).toEqual([]);
				expect(await viec()).toEqual([{ keyResultId: k }]);
				expect(poke).toHaveBeenCalledTimes(1);
				const nguon1 = await db.okrNguonKr.findUniqueOrThrow({
					where: { keyResultId: k },
				});
				const vet1 = (await anhKr(k)).vet;

				thanhCong(await datNguon(vao), "bang-tinh doc lai");
				expect(bay, `goi googleapis: ${bay.join(", ")}`).toEqual([]);
				expect(await viec()).toEqual([{ keyResultId: k }, { keyResultId: k }]);
				expect(poke).toHaveBeenCalledTimes(2);
				expect(
					await db.okrNguonKr.findUniqueOrThrow({ where: { keyResultId: k } }),
				).toEqual(nguon1);
				expect((await anhKr(k)).vet).toBe(vet1);
			} finally {
				poke.mockRestore();
				globalThis.fetch = fetchGoc;
			}
		});

		test("xep viec doc Sheets hong sau khi luu: loi goi van thanh cong, cau hinh da ghi", async () => {
			camSheets();
			const trigger = ungDung().get(AgentTriggerService);
			const hong = spyOn(trigger, "okrDocSheet").mockRejectedValue(
				new Error("agentTask khong ghi duoc"),
			);
			try {
				const k = await kr(await mucTieu("dang-chay", "nhap"), "tay");
				const tra = await datNguon({
					keyResultId: k,
					loai: "bang-tinh",
					url: SHEET_URL,
					o: SHEET_O,
				});
				expect(`HTTP ${tra.status} ${tra.loi}`).toBe("HTTP 200 ");
				expect(hong).toHaveBeenCalledTimes(1);
				expect(await cauHinh(k)).toEqual({
					loai: "bang-tinh",
					chiSo: null,
					phamVi: null,
					bac: null,
					sheetId: SHEET_ID,
					sheetO: SHEET_O,
				});
				expect((await anhKr(k)).source).toBe("bang-tinh");
			} finally {
				hong.mockRestore();
			}
		});

		test(
			"okr.objective tra nguonMay: crm, bang-tinh doc hong roi doc duoc, tay null",
			nguonMayTrongObjective,
		);

		test("okr.chiSo: bien cam thi bat va co email, vang thi tat va null", async () => {
			camSheets();
			const cam = thanhCong<ChiSoRa>(
				await goiQuery("okr.chiSo", s.cookiePhuTrach),
				"chiSo cam",
			);
			expect(cam.sheetsBat).toBe(true);
			expect(cam.emailSheets).toBe(EMAIL_SHEETS);
			expect(cam.chiSo).toContain("thoa-thuan-chot-duoc");
			expect(cam.bac).toContain("tai-khoan");
			rutSheets();
			const vang = thanhCong<ChiSoRa>(
				await goiQuery("okr.chiSo", s.cookiePhuTrach),
				"chiSo vang",
			);
			expect(vang.sheetsBat).toBe(false);
			expect(vang.emailSheets).toBeNull();
		});
	});

	describe("lich-su-khong-doi-api", () => {
		test(
			"ngay D da chup giu nguyen qua lichSuSo va banGhiChiSo sau luu tru, mo lai, chuyen phong, doi tien; doi chung khong lech",
			lichSuKhongDoiApi,
		);
	});
});
