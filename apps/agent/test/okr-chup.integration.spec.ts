import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	spyOn,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { demChiSo } from "@crm/db/okr-chi-so";
import { OKR_SO } from "@crm/db/okr-so-config";
import {
	readReportingCurrency,
	writeReportingCurrency,
} from "@crm/db/settings";
import type { PhamViChiSo } from "@crm/validation/okr-chi-so";
import { ConversionService } from "../../api/src/currency/conversion.service";
import { chupSoOkr, type DocO } from "../agent/lib/okr-chup";
import { docOSheet } from "../agent/lib/okr-sheets";
import {
	datBienSheets,
	demValues,
	EMAIL_SHEETS,
	googleTheoO,
	oGia,
	sinhKhoa,
	type TraLoiGoogle,
} from "./support/google-gia";
import { gieoNguoi, ma, moXuong } from "./support/nhac-gieo";
import {
	donOkr,
	gieoBoPhan,
	gieoChuKy,
	gieoKr,
	gieoMucTieu,
	gieoNguonKr,
	gieoPhongBan,
	type NguonGieo,
} from "./support/okr-gieo";

function vn(luc: string): Date {
	return new Date(`${luc}+07:00`);
}

const NHIP_20_10_0005 = new Date("2026-10-19T17:05:00Z");

const CONG_BO = vn("2026-09-28T09:00:00");

async function sanThoaThuan() {
	const a = (await gieoNguoi("An")).id;
	const b = (await gieoNguoi("Binh")).id;
	const c = (await gieoNguoi("Cuc")).id;
	const B1 = await gieoBoPhan(null);
	const P1 = await gieoPhongBan(null, B1);
	const P2 = await gieoPhongBan(null, B1);
	const P3 = await gieoPhongBan(null, B1);
	for (const [userId, pb] of [
		[a, P1],
		[b, P1],
		[c, P2],
	] as const) {
		await db.orgPlacement.create({
			data: { userId, primaryDepartmentId: pb },
		});
	}
	const cty = await db.company.create({ data: { name: ma() } });
	const thoaThuan = async (
		chu: string,
		closedAt: string,
		them: { luuTru?: boolean; thua?: boolean } = {},
	) => {
		const d = await db.deal.create({
			data: {
				name: ma(),
				companyId: cty.id,
				ownerId: chu,
				stage: them.thua ? "CLOSED_LOST" : "CLOSED_WON",
				closedAt: vn(closedAt),
				createdAt: vn("2026-09-01T09:00:00"),
				amount: 1000,
				currency: "USD",
				archivedAt: them.luuTru ? vn("2026-10-06T09:00:00") : null,
			},
		});
		return d.id;
	};
	const d1 = await thoaThuan(a, "2026-10-05T10:00:00");
	const d2 = await thoaThuan(b, "2026-10-10T10:00:00");
	const d3 = await thoaThuan(a, "2026-10-19T23:30:00");
	await thoaThuan(a, "2026-10-20T00:01:00");
	await thoaThuan(a, "2026-09-30T23:59:00");
	await thoaThuan(c, "2026-10-05T10:00:00");
	await thoaThuan(a, "2026-10-06T10:00:00", { luuTru: true });
	await thoaThuan(a, "2026-10-06T10:00:00", { thua: true });
	return { a, b, c, P1, P2, P3, d1, d2, d3 };
}

type San = Awaited<ReturnType<typeof sanThoaThuan>>;

const phongBan = (id: string): PhamViChiSo => ({ kieu: "phong-ban", id });

const chotDuoc = (phamVi: PhamViChiSo): NguonGieo => ({
	loai: "crm",
	chiSo: "thoa-thuan-chot-duoc",
	phamVi,
});

async function krCo(v: {
	cycleId: string;
	chu: string;
	nguon: NguonGieo;
	source: "tay" | "crm" | "bang-tinh";
	giaTri?: number;
	daBo?: boolean;
}): Promise<string> {
	const objectiveId = await gieoMucTieu({
		cycleId: v.cycleId,
		chu: v.chu,
		congBo: CONG_BO,
	});
	if (v.daBo) {
		await db.okrObjective.update({
			where: { id: objectiveId },
			data: { status: "da-bo", droppedAt: CONG_BO },
		});
	}
	const kr = await gieoKr({
		objectiveId,
		chu: v.chu,
		khoa: CONG_BO,
		nguon: v.source,
		giaTri: v.giaTri,
	});
	await gieoNguonKr(kr, v.chu, v.nguon);
	return kr;
}

type Dong = { kr: string; ngay: string; giaTri: number; nguon: string };

async function dongCua(ten: Record<string, string>): Promise<Dong[]> {
	const rows = await db.okrSoChup.findMany({
		where: { keyResultId: { in: Object.keys(ten) } },
		orderBy: [{ ngay: "asc" }, { keyResultId: "asc" }],
	});
	return rows
		.map((r) => ({
			kr: ten[r.keyResultId] ?? r.keyResultId,
			ngay: r.ngay.toISOString().slice(0, 10),
			giaTri: Number(r.giaTri),
			nguon: r.nguon,
		}))
		.sort((x, y) => `${x.ngay}${x.kr}`.localeCompare(`${y.ngay}${y.kr}`));
}

async function soHienTai(id: string): Promise<number> {
	const kr = await db.okrKeyResult.findUniqueOrThrow({
		where: { id },
		select: { currentValue: true },
	});
	return Number(kr.currentValue);
}

function docGia(ketQua: Awaited<ReturnType<DocO>>) {
	const goi: string[] = [];
	const docO: DocO = async (sheetId, o) => {
		goi.push(`${sheetId}!${o}`);
		return ketQua;
	};
	return { docO, goi };
}

beforeEach(async () => {
	await donOkr();
	await moXuong();
});

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await donOkr();
});

describe("chup-moi-ngay", () => {
	test("sáu KR: ba dòng ngày 19/10, ba lượt cùng nhịp không thêm dòng, KR đo cạnh giữ số tay", async () => {
		setSystemTime(NHIP_20_10_0005);
		const s = await sanThoaThuan();
		const q4 = await gieoChuKy("dang-chay");
		const dong = await gieoChuKy("da-dong");
		const chuaToi = await gieoChuKy("dang-chay", 1, {
			tu: "2026-10-25",
			den: "2026-12-31",
		});
		const K1 = await krCo({
			cycleId: q4,
			chu: s.a,
			nguon: chotDuoc(phongBan(s.P1)),
			source: "crm",
		});
		const K2 = await krCo({
			cycleId: q4,
			chu: s.a,
			nguon: chotDuoc({ kieu: "nguoi", id: s.a }),
			source: "tay",
			giaTri: 7,
		});
		const K3 = await krCo({
			cycleId: q4,
			chu: s.a,
			nguon: { loai: "bang-tinh", sheetId: "sheet-k3", o: "Tong!B2" },
			source: "bang-tinh",
		});
		const K4 = await krCo({
			cycleId: q4,
			chu: s.a,
			nguon: chotDuoc(phongBan(s.P1)),
			source: "crm",
			daBo: true,
		});
		const K5 = await krCo({
			cycleId: dong,
			chu: s.a,
			nguon: chotDuoc(phongBan(s.P1)),
			source: "crm",
		});
		const K6 = await krCo({
			cycleId: chuaToi,
			chu: s.a,
			nguon: chotDuoc(phongBan(s.P1)),
			source: "crm",
		});
		const ten = {
			[K1]: "K1",
			[K2]: "K2",
			[K3]: "K3",
			[K4]: "K4",
			[K5]: "K5",
			[K6]: "K6",
		};
		const khoang = {
			tu: vn("2026-10-01T00:00:00"),
			den: vn("2026-10-20T00:00:00"),
		};
		const soK1 = await demChiSo(
			db,
			{ chiSo: "thoa-thuan-chot-duoc", phamVi: phongBan(s.P1) },
			khoang,
		);
		const soK2 = await demChiSo(
			db,
			{ chiSo: "thoa-thuan-chot-duoc", phamVi: { kieu: "nguoi", id: s.a } },
			khoang,
		);
		expect(`đếm độc lập: K1 ${soK1}, K2 ${soK2}`).toBe(
			"đếm độc lập: K1 3, K2 2",
		);
		const sheet = docGia({ giaTri: 1240 });

		const luot1 = await chupSoOkr(NHIP_20_10_0005, { docO: sheet.docO });

		const ky = [
			{ kr: "K1", ngay: "2026-10-19", giaTri: soK1, nguon: "crm" },
			{ kr: "K2", ngay: "2026-10-19", giaTri: soK2, nguon: "crm" },
			{ kr: "K3", ngay: "2026-10-19", giaTri: 1240, nguon: "bang-tinh" },
		];
		expect(await dongCua(ten)).toEqual(ky);
		expect(luot1.ghi).toBeGreaterThanOrEqual(3);
		expect({
			K1: await soHienTai(K1),
			K2: await soHienTai(K2),
			K3: await soHienTai(K3),
		}).toEqual({ K1: soK1, K2: 7, K3: 1240 });
		const nguonK3 = await db.okrNguonKr.findUniqueOrThrow({
			where: { keyResultId: K3 },
		});
		expect({
			docGiaTri: Number(nguonK3.docGiaTri),
			docLoi: nguonK3.docLoi,
			docLuc: nguonK3.docLuc?.toISOString(),
		}).toEqual({
			docGiaTri: 1240,
			docLoi: null,
			docLuc: NHIP_20_10_0005.toISOString(),
		});
		expect(sheet.goi).toEqual(["sheet-k3!Tong!B2"]);

		for (const lan of [2, 3]) {
			const luot = await chupSoOkr(NHIP_20_10_0005, { docO: sheet.docO });
			const tong = (await dongCua(ten)).length;
			console.log(`chup-moi-ngay: sau lượt ${lan} có ${tong} dòng`);
			expect(
				`lượt ${lan}: ghi ${luot.ghi}, bỏ qua ${luot.boQua}, tổng ${tong} dòng`,
			).toBe(`lượt ${lan}: ghi 0, bỏ qua 0, tổng 3 dòng`);
		}
		expect(await dongCua(ten)).toEqual(ky);
		expect(`K2 sau ba lượt: ${await soHienTai(K2)}`).toBe("K2 sau ba lượt: 7");
		expect(sheet.goi.length).toBe(1);
	});

	test("nhịp dispatch thật gọi chupSoOkr trong cùng Promise.all với nhắc buổi sáng", async () => {
		const nguon = await Bun.file(
			new URL("../agent/schedules/dispatch.ts", import.meta.url),
		).text();
		expect(nguon).toContain('import { chupSoOkr } from "../lib/okr-chup";');
		const mang = nguon.slice(
			nguon.indexOf("Promise.all(["),
			nguon.indexOf("(async () =>"),
		);
		const luot = [...mang.matchAll(/(\w+)\(\),/g)].map((m) => m[1]);
		expect(luot).toContain("lenLichNhac");
		expect(luot).toContain("chupSoOkr");
	});

	test("nhịp 00:02 giờ VN ghi ngày hôm qua theo giờ VN, không theo UTC", async () => {
		const s = await sanThoaThuan();
		const q4 = await gieoChuKy("dang-chay");
		const kr = await krCo({
			cycleId: q4,
			chu: s.a,
			nguon: chotDuoc(phongBan(s.P1)),
			source: "crm",
		});
		const truocNuaDem = new Date("2026-10-19T16:58:00Z");
		const sauNuaDem = new Date("2026-10-19T17:02:00Z");
		setSystemTime(truocNuaDem);
		await chupSoOkr(truocNuaDem, docGia({ giaTri: 0 }));
		setSystemTime(sauNuaDem);
		await chupSoOkr(sauNuaDem, docGia({ giaTri: 0 }));
		expect(await dongCua({ [kr]: "K" })).toEqual([
			{ kr: "K", ngay: "2026-10-18", giaTri: 2, nguon: "crm" },
			{ kr: "K", ngay: "2026-10-19", giaTri: 3, nguon: "crm" },
		]);
	});

	test("phòng ban lưu trữ sau khi đặt nguồn: lượt chụp kế vẫn đếm người đang ở đó", async () => {
		setSystemTime(NHIP_20_10_0005);
		const s = await sanThoaThuan();
		const q4 = await gieoChuKy("dang-chay");
		const kr = await krCo({
			cycleId: q4,
			chu: s.a,
			nguon: chotDuoc(phongBan(s.P1)),
			source: "crm",
		});
		await db.department.update({
			where: { id: s.P1 },
			data: { archivedAt: vn("2026-10-12T09:00:00") },
		});
		await chupSoOkr(NHIP_20_10_0005, docGia({ giaTri: 0 }));
		expect(await dongCua({ [kr]: "K" })).toEqual([
			{ kr: "K", ngay: "2026-10-19", giaTri: 3, nguon: "crm" },
		]);
		expect(await soHienTai(kr)).toBe(3);
	});
});

describe("chup-bang-tinh", () => {
	test("đọc ô lỗi: không dòng, ghi lý do, không đọc lại trước khi hết thời gian chờ", async () => {
		const s = await sanThoaThuan();
		const q4 = await gieoChuKy("dang-chay");
		const kr = await krCo({
			cycleId: q4,
			chu: s.a,
			nguon: { loai: "bang-tinh", sheetId: "sheet-loi", o: "A1" },
			source: "bang-tinh",
			giaTri: 5,
		});
		const loi = docGia({ loi: "chua-chia-se" });
		const r1 = await chupSoOkr(NHIP_20_10_0005, { docO: loi.docO });
		const nguon = await db.okrNguonKr.findUniqueOrThrow({
			where: { keyResultId: kr },
		});
		expect({
			docLoi: nguon.docLoi,
			thuLuc: nguon.thuLuc?.toISOString(),
			boQua: r1.boQua >= 1,
		}).toEqual({
			docLoi: "chua-chia-se",
			thuLuc: NHIP_20_10_0005.toISOString(),
			boQua: true,
		});
		const motPhutSau = new Date(NHIP_20_10_0005.getTime() + 60_000);
		await chupSoOkr(motPhutSau, { docO: loi.docO });
		expect(loi.goi.length).toBe(1);
		const quaCho = new Date(
			NHIP_20_10_0005.getTime() + OKR_SO.sheets.thuLaiMs + 60_000,
		);
		const tot = docGia({ giaTri: 42 });
		await chupSoOkr(quaCho, { docO: tot.docO });
		expect(tot.goi.length).toBe(1);
		expect(await dongCua({ [kr]: "K" })).toEqual([
			{ kr: "K", ngay: "2026-10-19", giaTri: 42, nguon: "bang-tinh" },
		]);
		expect(await soHienTai(kr)).toBe(42);
		const sau = await db.okrNguonKr.findUniqueOrThrow({
			where: { keyResultId: kr },
		});
		expect(sau.docLoi).toBeNull();
	});

	test("chưa cắm khoá Google Sheets: lý do tat, không gọi mạng", async () => {
		const s = await sanThoaThuan();
		const q4 = await gieoChuKy("dang-chay");
		const kr = await krCo({
			cycleId: q4,
			chu: s.a,
			nguon: { loai: "bang-tinh", sheetId: "sheet-tat", o: "A1" },
			source: "bang-tinh",
		});
		const cu = {
			email: process.env.GOOGLE_SHEETS_EMAIL,
			khoa: process.env.GOOGLE_SHEETS_KHOA,
			fetch: globalThis.fetch,
		};
		let goiMang = 0;
		delete process.env.GOOGLE_SHEETS_EMAIL;
		delete process.env.GOOGLE_SHEETS_KHOA;
		globalThis.fetch = Object.assign(
			async () => {
				goiMang += 1;
				return new Response(null, { status: 500 });
			},
			{ preconnect: cu.fetch.preconnect },
		);
		try {
			await chupSoOkr(NHIP_20_10_0005);
		} finally {
			globalThis.fetch = cu.fetch;
			if (cu.email !== undefined) process.env.GOOGLE_SHEETS_EMAIL = cu.email;
			if (cu.khoa !== undefined) process.env.GOOGLE_SHEETS_KHOA = cu.khoa;
		}
		const nguon = await db.okrNguonKr.findUniqueOrThrow({
			where: { keyResultId: kr },
		});
		expect(`lý do ${nguon.docLoi}, gọi mạng ${goiMang}`).toBe(
			"lý do tat, gọi mạng 0",
		);
		expect(await dongCua({ [kr]: "K" })).toEqual([]);
	});
});

describe("sheets: chụp bảng tính qua bộ đọc thật", () => {
	let traBien: () => void = () => {};
	let pemEnv = "";

	beforeAll(async () => {
		pemEnv = (await sinhKhoa()).pemEnv;
	});

	beforeEach(() => {
		traBien = datBienSheets({ email: EMAIL_SHEETS, khoa: pemEnv });
	});

	afterEach(() => {
		traBien();
	});

	async function krBangTinh(
		s: San,
		cycleId: string,
		sheetId: string,
	): Promise<string> {
		return krCo({
			cycleId,
			chu: s.a,
			nguon: { loai: "bang-tinh", sheetId, o: "A1" },
			source: "bang-tinh",
			giaTri: 5,
		});
	}

	function batLog(muc: "log" | "error") {
		const dong: string[] = [];
		const spy = spyOn(console, muc).mockImplementation(
			(...a: Parameters<typeof console.log>) => {
				dong.push(a.map(String).join(" "));
			},
		);
		return { dong, tra: () => spy.mockRestore() };
	}

	test("(c) ma trận lỗi: 403 404 abc rỗng 500 → docLoi, 0 dòng; nhịp kế trong thuLaiMs không gọi Google, qua đó gọi lại", async () => {
		const s = await sanThoaThuan();
		const q4 = await gieoChuKy("dang-chay");
		const MA_TRAN: [string, () => Response, string][] = [
			["s403", () => new Response(null, { status: 403 }), "chua-chia-se"],
			["s404", () => new Response(null, { status: 404 }), "khong-thay"],
			["sabc", () => oGia("abc"), "khong-phai-so"],
			["srong", () => oGia(null), "o-trong"],
			["s500", () => new Response(null, { status: 500 }), "google-loi"],
		];
		const kr: Record<string, string> = {};
		for (const [sheetId] of MA_TRAN) {
			kr[sheetId] = await krBangTinh(s, q4, sheetId);
		}
		const theoSheet = new Map(MA_TRAN.map(([id, tra]) => [id, tra]));
		const g = googleTheoO(
			(sheetId): TraLoiGoogle =>
				theoSheet.get(sheetId)?.() ?? new Response(null, { status: 404 }),
		);
		const docO = docOSheet(g.f);

		await chupSoOkr(NHIP_20_10_0005, { docO });
		const loi: Record<string, string | null> = {};
		for (const [sheetId, id] of Object.entries(kr)) {
			const n = await db.okrNguonKr.findUniqueOrThrow({
				where: { keyResultId: id },
			});
			loi[sheetId] = n.docLoi;
		}
		expect(loi).toEqual(
			Object.fromEntries(MA_TRAN.map(([id, , lyDo]) => [id, lyDo])),
		);
		const dong = await db.okrSoChup.count({
			where: { keyResultId: { in: Object.values(kr) } },
		});
		expect(`dòng lịch sử sau lượt lỗi: ${dong}`).toBe(
			"dòng lịch sử sau lượt lỗi: 0",
		);

		const truoc = demValues(g);
		await chupSoOkr(new Date(NHIP_20_10_0005.getTime() + 60_000), { docO });
		expect(
			`nhịp kế trong thuLaiMs gọi Google ${demValues(g) - truoc} lần`,
		).toBe("nhịp kế trong thuLaiMs gọi Google 0 lần");

		const truoc2 = demValues(g);
		await chupSoOkr(
			new Date(NHIP_20_10_0005.getTime() + OKR_SO.sheets.thuLaiMs + 60_000),
			{ docO },
		);
		const goiLai = new Set(
			g.goi
				.slice(truoc2)
				.flatMap((x) => (x.loai === "values" ? [x.sheetId] : [])),
		);
		expect([...goiLai].sort()).toEqual(MA_TRAN.map(([id]) => id).sort());
	});

	test("(d) vắng GOOGLE_SHEETS_KHOA: chupSoOkr bỏ KR bảng tính, không gọi fetch, không ném", async () => {
		const s = await sanThoaThuan();
		const q4 = await gieoChuKy("dang-chay");
		const kr = await krBangTinh(s, q4, "sheet-khong-khoa");
		const tra = datBienSheets({ email: EMAIL_SHEETS, khoa: null });
		const g = googleTheoO(() => oGia(1));
		const fetchCu = globalThis.fetch;
		globalThis.fetch = g.f;
		try {
			await chupSoOkr(NHIP_20_10_0005);
		} finally {
			globalThis.fetch = fetchCu;
			tra();
		}
		const n = await db.okrNguonKr.findUniqueOrThrow({
			where: { keyResultId: kr },
		});
		expect(`lý do ${n.docLoi}, gọi fetch ${g.goi.length}`).toBe(
			"lý do tat, gọi fetch 0",
		);
		expect(await dongCua({ [kr]: "K" })).toEqual([]);
	});

	test("đủ hai biến: nhịp thật đọc Google qua fetch toàn cục và ghi dòng", async () => {
		const s = await sanThoaThuan();
		const q4 = await gieoChuKy("dang-chay");
		const kr = await krBangTinh(s, q4, "sheet-that");
		const g = googleTheoO(() => oGia("1.240"));
		const fetchCu = globalThis.fetch;
		globalThis.fetch = g.f;
		try {
			await chupSoOkr(NHIP_20_10_0005);
		} finally {
			globalThis.fetch = fetchCu;
		}
		expect(await dongCua({ [kr]: "K" })).toEqual([
			{ kr: "K", ngay: "2026-10-19", giaTri: 1240, nguon: "bang-tinh" },
		]);
		expect(demValues(g)).toBe(1);
	});

	test("bộ đọc trả số không hữu hạn: khong-phai-so, không ghi dòng", async () => {
		const s = await sanThoaThuan();
		const q4 = await gieoChuKy("dang-chay");
		const nan = await krBangTinh(s, q4, "sheet-nan");
		const vc = await krBangTinh(s, q4, "sheet-vo-cuc");
		const docO: DocO = async (sheetId) => ({
			giaTri: sheetId === "sheet-nan" ? Number.NaN : Number.POSITIVE_INFINITY,
		});
		await chupSoOkr(NHIP_20_10_0005, { docO });
		const loi = await db.okrNguonKr.findMany({
			where: { keyResultId: { in: [nan, vc] } },
			select: { docLoi: true },
		});
		expect(loi.map((l) => l.docLoi)).toEqual([
			"khong-phai-so",
			"khong-phai-so",
		]);
		expect(await dongCua({ [nan]: "N", [vc]: "V" })).toEqual([]);
	});

	test("lỗi ghi của một KR: log chỉ có tên lỗi và mã KR, không có thông điệp", async () => {
		const s = await sanThoaThuan();
		const q4 = await gieoChuKy("dang-chay");
		const kr = await krBangTinh(s, q4, "sheet-ghi-hong");
		const docO: DocO = async () => ({ giaTri: 1240 });
		await db.$executeRawUnsafe(
			`CREATE OR REPLACE FUNCTION okr_thu_ghi_hong() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'giaTri % hong', NEW."giaTri"; END $$ LANGUAGE plpgsql`,
		);
		await db.$executeRawUnsafe(
			`CREATE TRIGGER okr_thu_ghi_hong BEFORE INSERT ON "okrSoChup" FOR EACH ROW WHEN (NEW."keyResultId" = '${kr}') EXECUTE FUNCTION okr_thu_ghi_hong()`,
		);
		const log = batLog("error");
		try {
			await chupSoOkr(NHIP_20_10_0005, { docO });
		} finally {
			log.tra();
			await db.$executeRawUnsafe(
				`DROP TRIGGER IF EXISTS okr_thu_ghi_hong ON "okrSoChup"`,
			);
			await db.$executeRawUnsafe("DROP FUNCTION IF EXISTS okr_thu_ghi_hong()");
		}
		const dongKr = log.dong.filter((d) => d.includes(kr));
		expect(dongKr.length).toBe(1);
		expect(dongKr.join("\n")).not.toContain("1240");
		expect(dongKr.join("\n")).toMatch(/không chụp được: [A-Za-z0-9]+$/);
		expect(await dongCua({ [kr]: "K" })).toEqual([]);
	});

	test("hạn nhịp: đã trôi gần OKR_SO.chup.hanNhipMs thì bỏ KR bảng tính cho nhịp sau, không đọc, không ghi thuLuc", async () => {
		expect(OKR_SO.chup.hanNhipMs < 60_000).toBe(true);
		const s = await sanThoaThuan();
		const q4 = await gieoChuKy("dang-chay");
		const kr = await krBangTinh(s, q4, "sheet-het-han");
		const g = docGia({ giaTri: 9 });
		let lan = 0;
		const dongHo = () => {
			lan += 1;
			return lan === 1 ? 0 : OKR_SO.chup.hanNhipMs - OKR_SO.sheets.tranMs + 1;
		};
		const r = await chupSoOkr(NHIP_20_10_0005, { docO: g.docO, dongHo });
		const n = await db.okrNguonKr.findUniqueOrThrow({
			where: { keyResultId: kr },
		});
		expect({
			goi: g.goi.length,
			boQua: r.boQua,
			thuLuc: n.thuLuc,
			docLoi: n.docLoi,
		}).toEqual({ goi: 0, boQua: 1, thuLuc: null, docLoi: null });
		await chupSoOkr(NHIP_20_10_0005, { docO: g.docO });
		expect(await dongCua({ [kr]: "K" })).toEqual([
			{ kr: "K", ngay: "2026-10-19", giaTri: 9, nguon: "bang-tinh" },
		]);
	});

	test("KR bảng tính thiếu sheetId hay ô: ghi docLoi khong-thay, không đọc; lượt không có gì thì không in dòng tổng", async () => {
		const s = await sanThoaThuan();
		const q4 = await gieoChuKy("dang-chay");
		const kr = await krBangTinh(s, q4, "sheet-mat");
		await db.okrNguonKr.update({
			where: { keyResultId: kr },
			data: { sheetO: null },
		});
		const g = docGia({ giaTri: 1 });
		const log1 = batLog("log");
		try {
			await chupSoOkr(NHIP_20_10_0005, { docO: g.docO });
		} finally {
			log1.tra();
		}
		const n = await db.okrNguonKr.findUniqueOrThrow({
			where: { keyResultId: kr },
		});
		expect({ docLoi: n.docLoi, goi: g.goi.length }).toEqual({
			docLoi: "khong-thay",
			goi: 0,
		});
		expect(
			log1.dong.filter((d) => d.startsWith("[okr-chup] ngày")).length,
		).toBe(1);
		const log2 = batLog("log");
		try {
			await chupSoOkr(new Date(NHIP_20_10_0005.getTime() + 60_000), {
				docO: g.docO,
			});
		} finally {
			log2.tra();
		}
		expect(log2.dong.filter((d) => d.startsWith("[okr-chup]"))).toEqual([]);
	});
});

describe("lich-su-khong-doi", () => {
	const conversion = new ConversionService(db);

	async function doiDuLieu(s: San) {
		await db.deal.update({
			where: { id: s.d2 },
			data: { archivedAt: vn("2026-10-20T09:00:00") },
		});
		await db.deal.update({
			where: { id: s.d1 },
			data: { stage: "QUALIFIED_TO_BUY", closedAt: null },
		});
		await db.orgPlacement.update({
			where: { userId: s.a },
			data: { primaryDepartmentId: s.P3 },
		});
	}

	test("ngày D đã chụp giữ nguyên sau lưu trữ, mở lại, chuyển phòng, đổi tiền; KR chu kỳ đã qua đứng yên", async () => {
		const s = await sanThoaThuan();
		const q4 = await gieoChuKy("dang-chay");
		const daQua = await gieoChuKy("dang-chay", 1, {
			tu: "2026-10-01",
			den: "2026-10-19",
		});
		const chinh = await krCo({
			cycleId: q4,
			chu: s.a,
			nguon: chotDuoc(phongBan(s.P1)),
			source: "crm",
		});
		const kyCu = await krCo({
			cycleId: daQua,
			chu: s.a,
			nguon: chotDuoc(phongBan(s.P1)),
			source: "crm",
		});
		const doiChung = await krCo({
			cycleId: q4,
			chu: s.c,
			nguon: chotDuoc(phongBan(s.P2)),
			source: "crm",
		});
		const ten = { [chinh]: "chinh", [kyCu]: "ky-cu", [doiChung]: "doi-chung" };
		setSystemTime(NHIP_20_10_0005);
		await chupSoOkr(NHIP_20_10_0005, docGia({ giaTri: 0 }));
		expect(await dongCua(ten)).toEqual([
			{ kr: "chinh", ngay: "2026-10-19", giaTri: 3, nguon: "crm" },
			{ kr: "doi-chung", ngay: "2026-10-19", giaTri: 1, nguon: "crm" },
			{ kr: "ky-cu", ngay: "2026-10-19", giaTri: 3, nguon: "crm" },
		]);
		expect(await soHienTai(kyCu)).toBe(3);

		await doiDuLieu(s);
		const tienCu = await readReportingCurrency(db);
		try {
			await writeReportingCurrency(db, tienCu === "VND" ? "USD" : "VND");
			await conversion.rerateAll();
			for (const luc of ["2026-10-21T00:05:00", "2026-10-22T00:05:00"]) {
				setSystemTime(vn(luc));
				await chupSoOkr(vn(luc), docGia({ giaTri: 0 }));
			}
		} finally {
			await writeReportingCurrency(db, tienCu);
			await conversion.rerateAll();
		}

		const tinhLaiD = await demChiSo(
			db,
			{ chiSo: "thoa-thuan-chot-duoc", phamVi: phongBan(s.P1) },
			{ tu: vn("2026-10-01T00:00:00"), den: vn("2026-10-20T00:00:00") },
		);
		const sau = await dongCua(ten);
		const ngayD = sau.filter((d) => d.ngay === "2026-10-19");
		console.log(
			`lich-su-khong-doi: dòng ngày D ${JSON.stringify(ngayD)}; tính lại D bây giờ ${tinhLaiD}`,
		);
		expect(tinhLaiD).toBe(0);
		expect(sau).toEqual([
			{ kr: "chinh", ngay: "2026-10-19", giaTri: 3, nguon: "crm" },
			{ kr: "doi-chung", ngay: "2026-10-19", giaTri: 1, nguon: "crm" },
			{ kr: "ky-cu", ngay: "2026-10-19", giaTri: 3, nguon: "crm" },
			{ kr: "chinh", ngay: "2026-10-20", giaTri: 0, nguon: "crm" },
			{ kr: "doi-chung", ngay: "2026-10-20", giaTri: 1, nguon: "crm" },
			{ kr: "chinh", ngay: "2026-10-21", giaTri: 0, nguon: "crm" },
			{ kr: "doi-chung", ngay: "2026-10-21", giaTri: 1, nguon: "crm" },
		]);
		expect({
			chinh: await soHienTai(chinh),
			kyCu: await soHienTai(kyCu),
		}).toEqual({ chinh: 0, kyCu: 3 });
	});
});
