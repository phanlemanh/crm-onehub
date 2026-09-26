import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db, setPrismaLogSink } from "@crm/db";
import { DIRECT_KINDS, PRIORITY } from "@crm/db/agent-tasks";
import { OKR_SO } from "@crm/db/okr-so-config";
import type { KieuKr } from "@crm/validation/okr-kr";
import { z } from "zod";
import { capabilitiesFrom, markdownFor } from "../agent/lib/capabilities";
import { runDirect } from "../agent/lib/dispatch";
import {
	chayDocSheet,
	docOSheet,
	kySheetsJwt,
	layTokenSheets,
} from "../agent/lib/okr-sheets";
import type { LeasedTask } from "../agent/lib/tasks";
import {
	type CapKhoa,
	datBienSheets,
	demValues,
	EMAIL_SHEETS,
	googleGia,
	googleTheoO,
	oGia,
	sinhKhoa,
	TOKEN_GIA,
	tokenGia,
} from "./support/google-gia";
import { gieoNguoi, moXuong } from "./support/nhac-gieo";
import {
	donOkr,
	gieoChuKy,
	gieoKr,
	gieoMucTieu,
	gieoNguonKr,
} from "./support/okr-gieo";

const SHEET_BI_MAT = "1BiMatSheetOkr_x9Zq";

const dauJwt = z.object({ alg: z.string(), typ: z.string() });
const thanJwt = z.object({
	iss: z.string(),
	scope: z.string(),
	aud: z.string(),
	iat: z.number(),
	exp: z.number(),
});

type JwtDoc = {
	dau: z.infer<typeof dauJwt>;
	than: z.infer<typeof thanJwt>;
	kyDung: boolean;
};

async function docJwt(jwt: string, congKhai: CryptoKey): Promise<JwtDoc> {
	const [dau = "", than = "", ky = ""] = jwt.split(".");
	const giai = (phan: string) =>
		JSON.parse(Buffer.from(phan, "base64url").toString("utf8"));
	const kyDung = await crypto.subtle.verify(
		"RSASSA-PKCS1-v1_5",
		congKhai,
		Buffer.from(ky, "base64url"),
		new TextEncoder().encode(`${dau}.${than}`),
	);
	return {
		dau: dauJwt.parse(giai(dau)),
		than: thanJwt.parse(giai(than)),
		kyDung,
	};
}

const nhatKy: string[] = [];
const consoleCu = {
	log: console.log,
	warn: console.warn,
	error: console.error,
};

let khoa: CapKhoa;
let traBien: () => void = () => {};

beforeAll(async () => {
	for (const muc of ["log", "warn", "error"] as const) {
		console[muc] = (...dong: Parameters<typeof console.log>) => {
			nhatKy.push(dong.map(String).join(" "));
			consoleCu[muc](...dong);
		};
	}
	khoa = await sinhKhoa();
	traBien = datBienSheets({ email: EMAIL_SHEETS, khoa: khoa.pemEnv });
	await donOkr();
	await moXuong();
});

afterAll(async () => {
	traBien();
	await db.agentTask.deleteMany({
		where: { kind: "okr-doc-sheet", reason: "sheets-thu" },
	});
	await donOkr();
	console.log = consoleCu.log;
	console.warn = consoleCu.warn;
	console.error = consoleCu.error;
});

describe("sheets (a) JWT tài khoản dịch vụ", () => {
	test("ký RS256, claim đúng, chữ ký kiểm được bằng khoá công khai", async () => {
		const nowS = 1_790_000_000;
		const jwt = await kySheetsJwt(EMAIL_SHEETS, khoa.pemEnv, nowS);
		const doc = await docJwt(jwt, khoa.congKhai);
		expect(`alg ${doc.dau.alg}, typ ${doc.dau.typ}`).toBe("alg RS256, typ JWT");
		expect(doc.than).toEqual({
			iss: EMAIL_SHEETS,
			scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
			aud: "https://oauth2.googleapis.com/token",
			iat: nowS,
			exp: nowS + OKR_SO.sheets.tokenGiayHieuLuc,
		});
		expect(doc.than.exp - doc.than.iat <= 3600).toBe(true);
		expect(`chữ ký kiểm được: ${doc.kyDung}`).toBe("chữ ký kiểm được: true");
	});

	test("khoá PEM có xuống dòng thật cũng ký được", async () => {
		const jwt = await kySheetsJwt(EMAIL_SHEETS, khoa.pem, 1_790_000_000);
		expect((await docJwt(jwt, khoa.congKhai)).kyDung).toBe(true);
	});

	test("layTokenSheets gửi JWT tới oauth2.googleapis.com/token và trả access_token", async () => {
		const g = googleGia(() => tokenGia());
		const now = new Date("2026-10-20T01:00:00Z");
		const token = await layTokenSheets(g.f, now);
		expect(token).toBe(TOKEN_GIA);
		const [goi] = g.goi;
		if (goi?.loai !== "token") throw new Error("không có lời gọi token");
		const than = new URLSearchParams(goi.than);
		expect(than.get("grant_type")).toBe(
			"urn:ietf:params:oauth:grant-type:jwt-bearer",
		);
		const doc = await docJwt(than.get("assertion") ?? "", khoa.congKhai);
		expect(`alg ${doc.dau.alg}`).toBe("alg RS256");
		expect(doc.kyDung).toBe(true);
		expect({ iss: doc.than.iss, iat: doc.than.iat }).toEqual({
			iss: EMAIL_SHEETS,
			iat: Math.floor(now.getTime() / 1000),
		});
		expect(doc.than.exp - doc.than.iat <= 3600).toBe(true);
	});
});

describe("sheets đọc ô", () => {
	test("gọi values với UNFORMATTED_VALUE, token Bearer, ô đã mã hoá; token dùng lại trong hạn", async () => {
		const g = googleTheoO(() => oGia(1240));
		const doc = docOSheet(g.f);
		expect(await doc(SHEET_BI_MAT, "Trang 1!B2")).toEqual({ giaTri: 1240 });
		expect(await doc(SHEET_BI_MAT, "C3")).toEqual({ giaTri: 1240 });
		const values = g.goi.filter((x) => x.loai === "values");
		expect(values.map((v) => v.o)).toEqual(["Trang 1!B2", "C3"]);
		const [dau] = values;
		expect(dau?.url.href).toBe(
			`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_BI_MAT}/values/Trang%201!B2?valueRenderOption=UNFORMATTED_VALUE`,
		);
		expect(dau?.auth).toBe(`Bearer ${TOKEN_GIA}`);
		expect(g.goi.filter((x) => x.loai === "token").length).toBe(1);
	});

	const MA_TRAN: [string, () => Response, unknown][] = [
		["số 1240", () => oGia(1240), { giaTri: 1240 }],
		["chữ '1.240' có dấu chấm nghìn", () => oGia("1.240"), { giaTri: 1240 }],
		["chữ '12,5'", () => oGia("12,5"), { giaTri: 12.5 }],
		["lỗi công thức #REF!", () => oGia("#REF!"), { loi: "khong-phai-so" }],
		["lỗi công thức #N/A", () => oGia("#N/A"), { loi: "khong-phai-so" }],
		["chữ 'abc'", () => oGia("abc"), { loi: "khong-phai-so" }],
		["đúng/sai", () => oGia(true), { loi: "khong-phai-so" }],
		["số quá lớn", () => oGia(1e15), { loi: "khong-phai-so" }],
		["ô vắng", () => oGia(null), { loi: "o-trong" }],
		["chuỗi rỗng", () => oGia(""), { loi: "o-trong" }],
		["403", () => new Response(null, { status: 403 }), { loi: "chua-chia-se" }],
		["404", () => new Response(null, { status: 404 }), { loi: "khong-thay" }],
		["500", () => new Response(null, { status: 500 }), { loi: "google-loi" }],
		["400", () => new Response(null, { status: 400 }), { loi: "google-loi" }],
		[
			"thân không phải khuôn values",
			() => Response.json({ values: "x" }),
			{ loi: "google-loi" },
		],
	];

	for (const [ten, traLoi, mong] of MA_TRAN) {
		test(`ô ${ten}`, async () => {
			const g = googleTheoO(traLoi);
			expect(await docOSheet(g.f)(SHEET_BI_MAT, "A1")).toEqual(mong);
		});
	}

	test("một lần đọc gọi fetch không quá OKR_SO.sheets.soLanThu lần, kể cả lời xin token", async () => {
		const loi500 = googleTheoO(() => new Response(null, { status: 500 }));
		await docOSheet(loi500.f)(SHEET_BI_MAT, "A1");
		expect(loi500.goi.map((x) => x.loai)).toEqual(
			["token", "values", "values"].slice(0, OKR_SO.sheets.soLanThu),
		);
	});

	test("token còn hạn: 500 thì thử lại đủ OKR_SO.sheets.soLanThu lần; 403 và 404 không thử lại", async () => {
		const loi500 = googleTheoO(() => new Response(null, { status: 500 }));
		await layTokenSheets(loi500.f, new Date());
		await docOSheet(loi500.f)(SHEET_BI_MAT, "A1");
		expect(demValues(loi500)).toBe(OKR_SO.sheets.soLanThu);
		for (const status of [403, 404]) {
			const g = googleTheoO(() => new Response(null, { status }));
			await layTokenSheets(g.f, new Date());
			await docOSheet(g.f)(SHEET_BI_MAT, "A1");
			expect(`${status}: ${demValues(g)} lời gọi values`).toBe(
				`${status}: 1 lời gọi values`,
			);
		}
	});

	test("token còn hạn, 503 rồi được: lần thử thứ hai trả số", async () => {
		let lan = 0;
		const g = googleTheoO(() => {
			lan += 1;
			return lan === 1 ? new Response(null, { status: 503 }) : oGia(7);
		});
		await layTokenSheets(g.f, new Date());
		expect(await docOSheet(g.f)(SHEET_BI_MAT, "A1")).toEqual({ giaTri: 7 });
	});

	test("Google treo: google-loi trong OKR_SO.sheets.tranMs, không quá soLanThu lời gọi", async () => {
		const g = googleGia(() => "treo");
		const bat = performance.now();
		const kq = await docOSheet(g.f)(SHEET_BI_MAT, "A1");
		const ms = performance.now() - bat;
		expect(kq).toEqual({ loi: "google-loi" });
		expect(`${g.goi.length} lời gọi`).toBe(`${OKR_SO.sheets.soLanThu} lời gọi`);
		expect(`trong trần: ${ms < OKR_SO.sheets.tranMs + 500}`).toBe(
			"trong trần: true",
		);
	}, 20_000);

	test("token bị từ chối 400: google-loi, không gọi values", async () => {
		const g = googleGia((x) =>
			x.loai === "token" ? new Response(null, { status: 400 }) : oGia(1),
		);
		expect(await docOSheet(g.f)(SHEET_BI_MAT, "A1")).toEqual({
			loi: "google-loi",
		});
		expect(demValues(g)).toBe(0);
	});

	test("lỗi không tạm thời không thử lại: khoá hỏng, thân không phải JSON, token sai khuôn", async () => {
		const tra = datBienSheets({ email: EMAIL_SHEETS, khoa: "khong-phai-khoa" });
		const khoaHong = googleTheoO(() => oGia(1));
		const tu = nhatKy.length;
		try {
			expect(await docOSheet(khoaHong.f)(SHEET_BI_MAT, "A1")).toEqual({
				loi: "google-loi",
			});
		} finally {
			tra();
		}
		const thanHong = googleTheoO(
			() => new Response("<html>1240</html>", { status: 200 }),
		);
		await layTokenSheets(thanHong.f, new Date());
		expect(await docOSheet(thanHong.f)(SHEET_BI_MAT, "A1")).toEqual({
			loi: "google-loi",
		});
		const tokenHong = googleGia((x) =>
			x.loai === "token" ? Response.json({ sai: 1 }) : oGia(1),
		);
		expect(await docOSheet(tokenHong.f)(SHEET_BI_MAT, "A1")).toEqual({
			loi: "google-loi",
		});
		const log = nhatKy.slice(tu).filter((d) => d.startsWith("[okr-sheets]"));
		expect({
			khoaHong: khoaHong.goi.length,
			thanHong: demValues(thanHong),
			tokenHong: tokenHong.goi.length,
			log,
		}).toEqual({
			khoaHong: 0,
			thanHong: 1,
			tokenHong: 1,
			log: [
				"[okr-sheets] đọc ô không được: DataError",
				"[okr-sheets] đọc ô không được: SyntaxError",
				"[okr-sheets] đọc ô không được: ZodError",
			],
		});
	});

	test("thiếu một trong hai biến: tat, không gọi mạng", async () => {
		for (const bien of [
			{ email: EMAIL_SHEETS, khoa: null },
			{ email: null, khoa: khoa.pemEnv },
		]) {
			const tra = datBienSheets(bien);
			const g = googleTheoO(() => oGia(1));
			try {
				expect(await docOSheet(g.f)(SHEET_BI_MAT, "A1")).toEqual({
					loi: "tat",
				});
			} finally {
				tra();
			}
			expect(g.goi.length).toBe(0);
		}
	});
});

async function gieoKrBangTinh(o = "B2", kieu?: KieuKr): Promise<string> {
	const chu = (await gieoNguoi("Sheets")).id;
	const ky = await gieoChuKy("dang-chay");
	const muc = await gieoMucTieu({ cycleId: ky, chu, congBo: new Date() });
	const kr = await gieoKr({
		objectiveId: muc,
		chu,
		khoa: new Date(),
		nguon: "bang-tinh",
		kieu,
	});
	await gieoNguonKr(kr, chu, { loai: "bang-tinh", sheetId: SHEET_BI_MAT, o });
	return kr;
}

async function xepViec(keyResultId: string): Promise<LeasedTask> {
	return db.agentTask.create({
		data: {
			kind: "okr-doc-sheet",
			reason: "sheets-thu",
			payload: { keyResultId },
			priority: PRIORITY.okrSheet,
			dueAt: new Date(),
		},
	});
}

async function trangThai(keyResultId: string) {
	const n = await db.okrNguonKr.findUniqueOrThrow({ where: { keyResultId } });
	return {
		docGiaTri: n.docGiaTri === null ? null : Number(n.docGiaTri),
		coDocLuc: n.docLuc !== null,
		docLoi: n.docLoi,
	};
}

async function ketViec(taskId: string) {
	const t = await db.agentTask.findUniqueOrThrow({ where: { id: taskId } });
	return { xong: t.finishedAt !== null, outcome: t.outcome };
}

describe("sheets (b) việc okr-doc-sheet", () => {
	test("ô 1240: ghi docGiaTri, docLuc, xoá docLoi; không thêm dòng lịch sử", async () => {
		const kr = await gieoKrBangTinh();
		await db.okrNguonKr.update({
			where: { keyResultId: kr },
			data: { docLoi: "chua-chia-se" },
		});
		const task = await xepViec(kr);
		const truoc = await db.okrSoChup.count({ where: { keyResultId: kr } });
		const g = googleTheoO(() => oGia(1240));
		await chayDocSheet(task, g.f);
		const sau = await db.okrSoChup.count({ where: { keyResultId: kr } });
		expect(`dòng lịch sử trước ${truoc}, sau ${sau}`).toBe(
			"dòng lịch sử trước 0, sau 0",
		);
		expect(await trangThai(kr)).toEqual({
			docGiaTri: 1240,
			coDocLuc: true,
			docLoi: null,
		});
		expect(await ketViec(task.id)).toEqual({
			xong: true,
			outcome: "đọc ô: được",
		});
		expect(g.goi.filter((x) => x.loai === "values").map((x) => x.o)).toEqual([
			"B2",
		]);
	});

	test("kiểu KR: ô 0.85 cho KR phần trăm đọc được; ô 150 cho KR phần trăm và ô 2 cho KR mốc ghi khong-hop-kieu, không dòng lịch sử", async () => {
		const ca = [
			["phan-tram", 0.85, { docGiaTri: 0.85, docLoi: null }, "đọc ô: được"],
			[
				"phan-tram",
				150,
				{ docGiaTri: null, docLoi: "khong-hop-kieu" },
				"đọc ô: khong-hop-kieu",
			],
			[
				"moc",
				2,
				{ docGiaTri: null, docLoi: "khong-hop-kieu" },
				"đọc ô: khong-hop-kieu",
			],
		] as const;
		for (const [kieu, o, mong, outcome] of ca) {
			const kr = await gieoKrBangTinh("B2", kieu);
			const task = await xepViec(kr);
			const g = googleTheoO(() => oGia(o));
			await chayDocSheet(task, g.f);
			expect({ ca: `${kieu} ${o}`, ...(await trangThai(kr)) }).toEqual({
				ca: `${kieu} ${o}`,
				...mong,
				coDocLuc: true,
			});
			expect(await ketViec(task.id)).toEqual({ xong: true, outcome });
			expect(await db.okrSoChup.count({ where: { keyResultId: kr } })).toBe(0);
		}
	});

	test("403: ghi docLoi chua-chia-se, outcome có lý do, không có giá trị", async () => {
		const kr = await gieoKrBangTinh();
		const task = await xepViec(kr);
		const g = googleTheoO(() => new Response(null, { status: 403 }));
		await chayDocSheet(task, g.f);
		expect(await trangThai(kr)).toEqual({
			docGiaTri: null,
			coDocLuc: true,
			docLoi: "chua-chia-se",
		});
		expect(await ketViec(task.id)).toEqual({
			xong: true,
			outcome: "đọc ô: chua-chia-se",
		});
		expect(await db.okrSoChup.count({ where: { keyResultId: kr } })).toBe(0);
	});

	test("payload hỏng: đóng việc bằng tên lỗi, không có thông điệp lỗi", async () => {
		const task = await db.agentTask.create({
			data: {
				kind: "okr-doc-sheet",
				reason: "sheets-thu",
				payload: { sai: "1240" },
				priority: PRIORITY.okrSheet,
				dueAt: new Date(),
			},
		});
		const g = googleTheoO(() => oGia(1));
		await chayDocSheet(task, g.f);
		expect(await ketViec(task.id)).toEqual({
			xong: true,
			outcome: "đọc ô: lỗi Error",
		});
		expect(g.goi.length).toBe(0);
	});

	test("lỗi cơ sở dữ liệu mang giá trị ô: lý do việc chỉ có mã lỗi", async () => {
		const kr = await gieoKrBangTinh();
		const task = await xepViec(kr);
		await db.$executeRawUnsafe(
			`CREATE OR REPLACE FUNCTION okr_thu_doc_hong() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'docGiaTri % hong', NEW."docGiaTri"; END $$ LANGUAGE plpgsql`,
		);
		await db.$executeRawUnsafe(
			`CREATE TRIGGER okr_thu_doc_hong BEFORE UPDATE ON "okrNguonKr" FOR EACH ROW WHEN (NEW."keyResultId" = '${kr}') EXECUTE FUNCTION okr_thu_doc_hong()`,
		);
		let loiPrisma = 0;
		setPrismaLogSink((r) => {
			if (r.level === "error") loiPrisma += 1;
		});
		try {
			await chayDocSheet(task, googleTheoO(() => oGia(1240)).f);
		} finally {
			setPrismaLogSink(null);
			await db.$executeRawUnsafe(
				`DROP TRIGGER IF EXISTS okr_thu_doc_hong ON "okrNguonKr"`,
			);
			await db.$executeRawUnsafe("DROP FUNCTION IF EXISTS okr_thu_doc_hong()");
		}
		const ket = await ketViec(task.id);
		expect(ket.xong).toBe(true);
		expect(ket.outcome ?? "").not.toContain("1240");
		expect(ket.outcome ?? "").toMatch(/^đọc ô: lỗi [A-Za-z0-9]+$/);
		expect((await trangThai(kr)).docGiaTri).toBeNull();
		expect(`bộ ghi lỗi của Prisma nhận ${loiPrisma} lỗi`).toBe(
			"bộ ghi lỗi của Prisma nhận 1 lỗi",
		);
	});

	test("KR không còn nguồn bảng tính: đóng việc, không gọi Google", async () => {
		const kr = await gieoKrBangTinh();
		await db.okrNguonKr.update({
			where: { keyResultId: kr },
			data: { loai: "api", sheetId: null, sheetO: null },
		});
		const task = await xepViec(kr);
		const g = googleTheoO(() => oGia(1));
		await chayDocSheet(task, g.f);
		expect((await ketViec(task.id)).xong).toBe(true);
		expect(g.goi.length).toBe(0);
	});

	test("okr-doc-sheet là việc làn trực tiếp và handleDirect gọi chayDocSheet", async () => {
		expect(DIRECT_KINDS).toContain("okr-doc-sheet");
		const kr = await gieoKrBangTinh();
		const task = await xepViec(kr);
		const g = googleTheoO(() => oGia(1240));
		const fetchCu = globalThis.fetch;
		globalThis.fetch = g.f;
		try {
			await runDirect(task);
		} finally {
			globalThis.fetch = fetchCu;
		}
		expect(await ketViec(task.id)).toEqual({
			xong: true,
			outcome: "đọc ô: được",
		});
		expect((await trangThai(kr)).docGiaTri).toBe(1240);
	});
});

describe("sheets (d) năng lực", () => {
	const sheets = () =>
		capabilitiesFrom(null).find((c) => c.id === "GOOGLE_SHEETS_KHOA");

	test("đủ hai biến thì bật; thiếu khoá hay thiếu email thì tắt", () => {
		expect(sheets()?.enabled).toBe(true);
		const tra = datBienSheets({ email: EMAIL_SHEETS, khoa: null });
		try {
			expect(sheets()?.enabled).toBe(false);
			const nguonKhacBat = capabilitiesFrom(null).map((c) =>
				c.id === "GOOGLE_SHEETS_KHOA" ? c : { ...c, enabled: true },
			);
			expect(markdownFor(nguonKhacBat)).toContain(`- ${sheets()?.label}`);
		} finally {
			tra();
		}
		const tra2 = datBienSheets({ email: null, khoa: khoa.pemEnv });
		try {
			expect(sheets()?.enabled).toBe(false);
		} finally {
			tra2();
		}
	});
});

describe("sheets (e) nhật ký", () => {
	test("không dòng log nào chứa giá trị ô, khoá hay sheetId", () => {
		const phanKhoa = khoa.pem.split("\n")[1] ?? "khoa";
		const lo = nhatKy.filter(
			(d) =>
				d.includes("1240") ||
				d.includes(phanKhoa) ||
				d.includes(SHEET_BI_MAT) ||
				d.includes(TOKEN_GIA),
		);
		expect(`đã ghi ${nhatKy.length} dòng log, lộ: ${JSON.stringify(lo)}`).toBe(
			`đã ghi ${nhatKy.length} dòng log, lộ: []`,
		);
		expect(nhatKy.some((d) => d.includes("[okr-sheets]"))).toBe(true);
	});
});
