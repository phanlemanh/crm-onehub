import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { chiTieuThang, thangVN } from "@crm/db/ai-chi-phi";
import { viecAiCanNhac } from "@crm/db/ai-nhac";
import { docCuoc, tangLuot } from "@crm/db/okr-cuoc-soan";
import {
	cauHinhAiLuc,
	coChuKyLapKeHoachTrongThang,
	tranThangCuaThang,
} from "@crm/db/okr-tro-ly";
import { type NacCuaDonVi, nacCuaDonVi } from "@crm/db/okr-tro-ly-danh-muc";
import type {
	OkrProgram,
	OkrProgramSua,
} from "@crm/validation/okr-chuong-trinh";
import { AI_PHAM_VI } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { idMau } from "../scripts/okr-mau/nap";
import type {
	SoanAnOutput,
	SoanDanhSachCuocOutput,
	SoanMoOutput,
	SoanSanSangOutput,
	SoanSoDoOutput,
} from "../src/okr/okr.contracts";
import { OKR } from "../src/okr/okr-config";
import {
	CHU_KY_Q4,
	DON_VI,
	datPhaQuy4,
	donSoan,
	gieoCuoc,
	gieoDongNhap,
	goiSoan,
	NAC_SOAN,
	vaoDonVi,
} from "./soan-okr-san";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	ghiCauHinh,
	goi,
	goiRest,
	ketThucMau,
	MOC_MAU,
	ok,
	phienMau,
	tienDongHo,
} from "./tro-ly-okr-san";

const MIGRATION = join(
	import.meta.dir,
	"../../../packages/db/prisma/migrations/20261010010000_okr_soan/migration.sql",
);

const CAM = [
	/\bDROP\b/i,
	/\bALTER\s+COLUMN\b/i,
	/\bRENAME\b/i,
	/\bSET\s+DATA\s+TYPE\b/i,
	/\bTRUNCATE\b/i,
	/\bDELETE\s+FROM\b/i,
	/\bUPDATE\s+"/i,
];

const CHO_PHEP = [
	/^ALTER TABLE "[A-Za-z]+" ADD COLUMN\s+"[A-Za-z]+"[^;]*(,\s*ADD COLUMN\s+"[A-Za-z]+"[^;,]*)*$/s,
	/^CREATE TABLE "[A-Za-z]+" \([^;]*\)$/s,
	/^CREATE (UNIQUE )?INDEX "[A-Za-z_]+" ON "[A-Za-z]+"\s*\([^;]*\)$/s,
];

function themCotBatBuocKhongMacDinh(cau: string): boolean {
	if (!/^ALTER TABLE\b/.test(cau)) return false;
	return cau
		.split(/,\s*(?=ADD COLUMN)/)
		.some((cot) => /\bNOT NULL\b/i.test(cot) && !/\bDEFAULT\b/i.test(cot));
}

export function cauLech(sql: string): string[] {
	const cau = sql
		.split("\n")
		.filter((d) => !d.trim().startsWith("--"))
		.join("\n")
		.split(";")
		.map((c) => c.trim())
		.filter((c) => c.length > 0);
	return cau.filter(
		(c) =>
			CAM.some((r) => r.test(c)) ||
			!CHO_PHEP.some((r) => r.test(c)) ||
			themCotBatBuocKhongMacDinh(c),
	);
}

describe("migration", () => {
	test("migration okr_soan chỉ thêm: cột có mặc định rỗng, bảng mới, chỉ mục — không DROP, không ALTER COLUMN", () => {
		const sql = readFileSync(MIGRATION, "utf8");
		expect(sql.length).toBeGreaterThan(0);
		expect(cauLech(sql), "migration khong chi them").toEqual([]);
		for (const cot of [
			'"division" ADD COLUMN     "moTa" TEXT NOT NULL DEFAULT \'\'',
			'"department" ADD COLUMN     "moTa" TEXT NOT NULL DEFAULT \'\'',
			'"orgPlacement" ADD COLUMN     "chucDanh" TEXT NOT NULL DEFAULT \'\'',
			'"aiTranThangDatOkrUsd" DECIMAL(8,2)',
			'"cuocSoanId" TEXT',
			'"noiDung" JSONB',
			'"taoRaId" TEXT',
			'CREATE TABLE "okrCuocSoan"',
			'CREATE UNIQUE INDEX "okrCuocSoan_sessionId_key"',
		])
			expect(sql, `thieu: ${cot}`).toContain(cot);
	});

	test("cauLech bắt DROP COLUMN", () => {
		const lech = cauLech('ALTER TABLE "a" DROP COLUMN "b";');
		expect(lech).toHaveLength(1);
		expect(lech[0]).toContain("DROP COLUMN");
	});

	test("cauLech bắt ALTER COLUMN ... SET DATA TYPE", () => {
		expect(
			cauLech('ALTER TABLE "a" ALTER COLUMN "b" SET DATA TYPE integer;'),
		).toHaveLength(1);
	});

	test("cauLech cho qua ADD COLUMN có DEFAULT", () => {
		expect(
			cauLech('ALTER TABLE "a" ADD COLUMN     "b" TEXT NOT NULL DEFAULT \'\';'),
		).toEqual([]);
	});

	test("cauLech bắt ADD COLUMN NOT NULL không DEFAULT, kể cả cột thứ hai trong một câu", () => {
		expect(
			cauLech('ALTER TABLE "a" ADD COLUMN     "b" TEXT NOT NULL;'),
		).toHaveLength(1);
		expect(
			cauLech(
				'ALTER TABLE "a" ADD COLUMN     "b" TEXT,\nADD COLUMN     "c" INTEGER NOT NULL;',
			),
		).toHaveLength(1);
	});
});

let app: NestExpressApplication;
let cookieQuanTri = "";
let cookieThanhVien = "";
let cookieOkr = "";
let cookieTruong = "";

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	cookieQuanTri = await phienMau("le-hai-dang");
	cookieThanhVien = await phienMau("bui-quang-huy");
	cookieOkr = await phienMau("giang-hai-yen");
	cookieTruong = await phienMau("nguyen-thi-lan");
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

const docProgram = async () =>
	ok<OkrProgram & { version: number }>(
		await goi(app, "okr.program", "query", undefined, cookieQuanTri),
		"program",
	);

describe("nac-luu", () => {
	test(
		"setProgram với mọi tổ hợp aiSoanPhamVi × aiSoanAnPhamVi ∈ {tat, toan-cong-ty, danh-sach} × trần đặt ∈ {null, 15}: hàng mới mang đúng năm cột, program đọc lại bằng",
		async () => {
			const phong = idMau("pb", "marketing");
			let so = 0;
			for (const bat of AI_PHAM_VI) {
				for (const an of AI_PHAM_VI) {
					for (const tran of [null, 15] as const) {
						const sua: OkrProgramSua = {
							aiOn: true,
							aiSoanPhamVi: bat,
							aiSoanDonVi: bat === "danh-sach" ? ["onehub"] : [],
							aiSoanAnPhamVi: an,
							aiSoanAnDonVi: an === "danh-sach" ? [phong] : [],
							aiTranThangDatOkrUsd: tran,
						};
						tienDongHo();
						ok(
							await goi(app, "okr.setProgram", "mutation", sua, cookieQuanTri),
							`setProgram ${bat}/${an}/${tran}`,
						);
						const moi = await db.okrProgramConfig.findFirstOrThrow({
							orderBy: { version: "desc" },
						});
						expect(
							{
								aiSoanPhamVi: moi.aiSoanPhamVi,
								aiSoanDonVi: moi.aiSoanDonVi,
								aiSoanAnPhamVi: moi.aiSoanAnPhamVi,
								aiSoanAnDonVi: moi.aiSoanAnDonVi,
								aiTranThangDatOkrUsd:
									moi.aiTranThangDatOkrUsd?.toNumber() ?? null,
							},
							`o ${bat}/${an}/${tran}`,
						).toEqual({
							aiSoanPhamVi: bat,
							aiSoanDonVi: bat === "danh-sach" ? ["onehub"] : [],
							aiSoanAnPhamVi: an,
							aiSoanAnDonVi: an === "danh-sach" ? [phong] : [],
							aiTranThangDatOkrUsd: tran,
						});
						expect(await docProgram()).toMatchObject({
							...sua,
							version: moi.version,
						});
						so += 1;
					}
				}
			}
			expect(so).toBe(AI_PHAM_VI.length * AI_PHAM_VI.length * 2);
		},
		CHO_DB,
	);

	test(
		"nacCuaDonVi(soan) từ cấu hình đã lưu: OneHub, bộ phận, phòng ban trong bộ phận → bảng viết trước; bật thắng ẩn",
		async () => {
			const bp = idMau("bp", "kinh-doanh");
			const pb = idMau("pb", "kd-bac");
			const donVi = {
				onehub: { onehub: true, boPhanId: null, phongBanId: null },
				boPhan: { onehub: false, boPhanId: bp, phongBanId: null },
				phong: { onehub: false, boPhanId: bp, phongBanId: pb },
			};
			const bang: [
				string,
				OkrProgramSua,
				[NacCuaDonVi, NacCuaDonVi, NacCuaDonVi],
			][] = [
				[
					"tat",
					{
						aiOn: true,
						aiSoanPhamVi: "tat",
						aiSoanDonVi: [],
						aiSoanAnPhamVi: "tat",
						aiSoanAnDonVi: [],
					},
					["viec-tat", "viec-tat", "viec-tat"],
				],
				[
					"bat bo phan keo phong",
					{
						aiOn: true,
						aiSoanPhamVi: "danh-sach",
						aiSoanDonVi: [bp],
						aiSoanAnPhamVi: "tat",
						aiSoanAnDonVi: [],
					},
					["don-vi-chua-bat", "bat", "bat"],
				],
				[
					"an onehub",
					{
						aiOn: true,
						aiSoanPhamVi: "tat",
						aiSoanDonVi: [],
						aiSoanAnPhamVi: "danh-sach",
						aiSoanAnDonVi: ["onehub"],
					},
					["an", "don-vi-chua-bat", "don-vi-chua-bat"],
				],
				[
					"bat toan + an danh sach",
					{
						aiOn: true,
						aiSoanPhamVi: "toan-cong-ty",
						aiSoanDonVi: [],
						aiSoanAnPhamVi: "danh-sach",
						aiSoanAnDonVi: [pb],
					},
					["bat", "bat", "bat"],
				],
				[
					"ai tat",
					{ aiOn: false, aiSoanPhamVi: "toan-cong-ty" },
					["tat", "tat", "tat"],
				],
			];
			for (const [ten, sua, mong] of bang) {
				tienDongHo();
				ok(
					await goi(app, "okr.setProgram", "mutation", sua, cookieQuanTri),
					ten,
				);
				const ct = await cauHinhAiLuc(db, tienDongHo());
				expect(
					[
						nacCuaDonVi(ct, "soan", donVi.onehub),
						nacCuaDonVi(ct, "soan", donVi.boPhan),
						nacCuaDonVi(ct, "soan", donVi.phong),
					],
					ten === "bat toan + an danh sach" ? "an thang bat" : ten,
				).toEqual(mong);
			}
		},
		CHO_DB,
	);

	test(
		"hàng cấu hình cũ (INSERT không có năm cột) đọc lên soạn tắt và trần đặt null",
		async () => {
			const cuoi = await db.okrProgramConfig.findFirst({
				orderBy: { version: "desc" },
				select: { version: true },
			});
			const version = (cuoi?.version ?? 0) + 1;
			await db.$executeRaw`
				INSERT INTO "okrProgramConfig" ("id", "version", "objectiveCap", "krCap", "capMode", "scoreScale", "weightsOn", "personalOn", "aiOn", "createdById", "createdAt")
				VALUES (${`mau-okr-ct-cu-${version}`}, ${version}, 5, 5, 'canh-bao', '0-1', false, false, true, ${idMau("nguoi", "le-hai-dang")}, ${tienDongHo()})
			`;
			const p = await docProgram();
			expect(p, "hang cu doc len soan tat").toMatchObject({
				version,
				aiSoanPhamVi: "tat",
				aiSoanDonVi: [],
				aiSoanAnPhamVi: "tat",
				aiSoanAnDonVi: [],
				aiTranThangDatOkrUsd: null,
			});
			const ct = await cauHinhAiLuc(db, tienDongHo());
			expect(
				nacCuaDonVi(ct, "soan", {
					onehub: true,
					boPhanId: null,
					phongBanId: null,
				}),
			).toBe("viec-tat");
		},
		CHO_DB,
	);

	test(
		"thành viên và vai okr setProgram trường soạn qua tRPC và REST → 403, không phiên bản mới",
		async () => {
			const truoc = await db.okrProgramConfig.count();
			const vao = {
				aiSoanPhamVi: "toan-cong-ty",
				aiTranThangDatOkrUsd: 15,
			} as const;
			for (const [ai, c] of [
				["thanh-vien", cookieThanhVien],
				["vai-okr", cookieOkr],
			] as const) {
				const trpc = await goi(app, "okr.setProgram", "mutation", vao, c);
				const rest = await goiRest(app, "PUT", "/okr/program", vao, c);
				expect([ai, trpc.status, rest.status]).toEqual([ai, 403, 403]);
			}
			expect(await db.okrProgramConfig.count()).toBe(truoc);
		},
		CHO_DB,
	);
});

describe("tran-thang", () => {
	test(
		"tranThangCuaThang: tháng có chu kỳ lap-ke-hoach và cột đặt → 15; cột null → trần thường; không chu kỳ pha đó → trần thường",
		async () => {
			const thang = thangVN(MOC_MAU);
			const kyMoi = idMau("chu-ky", "q1-27");
			await db.okrCycle.create({
				data: {
					id: kyMoi,
					kind: "quy",
					name: "Quý 1 · 2027 mẫu",
					startsOn: new Date("2027-01-04T00:00:00.000Z"),
					endsOn: new Date("2027-04-04T00:00:00.000Z"),
					phase: "lap-ke-hoach",
				},
			});
			expect(await coChuKyLapKeHoachTrongThang(db, thang)).toBe(true);
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.setProgram",
					"mutation",
					{ aiOn: true, aiTranThangUsd: 9, aiTranThangDatOkrUsd: 15 },
					cookieQuanTri,
				),
				"dat 15",
			);
			let ct = await cauHinhAiLuc(db, tienDongHo());
			expect(
				await tranThangCuaThang(db, ct, thang),
				"tran thang dat okr khong ap",
			).toBe(15);
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.setProgram",
					"mutation",
					{ aiTranThangDatOkrUsd: null },
					cookieQuanTri,
				),
				"bo tran dat",
			);
			ct = await cauHinhAiLuc(db, tienDongHo());
			expect(await tranThangCuaThang(db, ct, thang)).toBe(9);
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.setProgram",
					"mutation",
					{ aiTranThangDatOkrUsd: 15 },
					cookieQuanTri,
				),
				"dat lai 15",
			);
			await db.okrCycle.update({
				where: { id: kyMoi },
				data: { phase: "dang-chay" },
			});
			await db.okrCycle.update({
				where: { id: idMau("chu-ky", "nam-ke") },
				data: { phase: "dang-chay" },
			});
			ct = await cauHinhAiLuc(db, tienDongHo());
			expect(await coChuKyLapKeHoachTrongThang(db, thang)).toBe(false);
			expect(await tranThangCuaThang(db, ct, thang)).toBe(9);
			const so = ok<{ troLyOkr: { tranUsd: number } }>(
				await goi(app, "okr.aiChiTieu", "query", undefined, cookieQuanTri),
				"aiChiTieu",
			);
			expect(so.troLyOkr.tranUsd).toBe(9);
			await db.okrCycle.update({
				where: { id: kyMoi },
				data: { phase: "lap-ke-hoach" },
			});
			await db.okrCycle.update({
				where: { id: idMau("chu-ky", "nam-ke") },
				data: { phase: "lap-ke-hoach" },
			});
			const so2 = ok<{ troLyOkr: { tranUsd: number } }>(
				await goi(app, "okr.aiChiTieu", "query", undefined, cookieQuanTri),
				"aiChiTieu dat okr",
			);
			expect(so2.troLyOkr.tranUsd, "so chi phi khong doi tran dat okr").toBe(
				15,
			);
		},
		CHO_DB,
	);

	test(
		"coChuKyLapKeHoachTrongThang: chu kỳ lap-ke-hoach đã ẩn không nâng trần; chu kỳ bắt đầu ngoài cửa lập kế hoạch không nâng trần tháng này",
		async () => {
			const thang = thangVN(MOC_MAU);
			const keHoach = await db.okrCycle.findMany({
				where: { phase: "lap-ke-hoach" },
				select: { id: true },
			});
			const ids = keHoach.map((k) => k.id);
			const kyThu = idMau("chu-ky", "ke-hoach-thu");
			await db.okrCycle.updateMany({
				where: { id: { in: ids } },
				data: { phase: "dang-chay" },
			});
			try {
				await db.okrCycle.create({
					data: {
						id: kyThu,
						kind: "quy",
						name: "Quý kế hoạch thử",
						startsOn: new Date("2027-01-04T00:00:00.000Z"),
						endsOn: new Date("2027-04-04T00:00:00.000Z"),
						phase: "lap-ke-hoach",
					},
				});
				const ct = await cauHinhAiLuc(db, tienDongHo());
				const doi = async (data: {
					anLuc?: Date | null;
					startsOn?: Date;
					endsOn?: Date;
				}) => {
					await db.okrCycle.update({ where: { id: kyThu }, data });
					return {
						co: await coChuKyLapKeHoachTrongThang(db, thang),
						tran: await tranThangCuaThang(db, ct, thang),
					};
				};
				const hien = await doi({});
				const an = await doi({ anLuc: MOC_MAU });
				const hienLai = await doi({ anLuc: null });
				const xa = await doi({
					startsOn: new Date("2028-01-03T00:00:00.000Z"),
					endsOn: new Date("2028-04-02T00:00:00.000Z"),
				});
				const bienTrong = await doi({
					startsOn: new Date("2027-02-28T00:00:00.000Z"),
					endsOn: new Date("2027-05-30T00:00:00.000Z"),
				});
				const bienNgoai = await doi({
					startsOn: new Date("2027-03-01T00:00:00.000Z"),
					endsOn: new Date("2027-05-31T00:00:00.000Z"),
				});
				const daQua = await doi({
					startsOn: new Date("2026-08-01T00:00:00.000Z"),
					endsOn: new Date("2026-10-31T00:00:00.000Z"),
				});
				expect({
					thang,
					thuong: ct.aiTranThangUsd,
					datOkr: ct.aiTranThangDatOkrUsd,
					hien,
					an,
					hienLai,
					xa,
					bienTrong,
					bienNgoai,
					daQua,
				}).toEqual({
					thang: "2026-11",
					thuong: 9,
					datOkr: 15,
					hien: { co: true, tran: 15 },
					an: { co: false, tran: 9 },
					hienLai: { co: true, tran: 15 },
					xa: { co: false, tran: 9 },
					bienTrong: { co: true, tran: 15 },
					bienNgoai: { co: false, tran: 9 },
					daQua: { co: false, tran: 9 },
				});
			} finally {
				await db.okrCycle.deleteMany({ where: { id: kyThu } });
				await db.okrCycle.updateMany({
					where: { id: { in: ids } },
					data: { phase: "lap-ke-hoach" },
				});
			}
		},
		CHO_DB,
	);
});

describe("nhac-tran-thang", () => {
	test(
		"viecAiCanNhac so chi tiêu với trần của tháng: tháng có chu kỳ lập kế hoạch dùng trần đặt OKR (15) nên 11 USD chưa báo; hết chu kỳ lập kế hoạch thì trần thường (9) báo 100",
		async () => {
			const now = tienDongHo();
			const thang = thangVN(now);
			const tong = 11;
			const daChi = (await chiTieuThang(db, thang, now)).troLyOkrUsd;
			expect(daChi, "so chi san trong thang qua lon").toBeLessThan(tong);
			const chi = await db.aiChiPhi.create({
				data: {
					id: "nhac-tran-thang-thu",
					at: new Date(now.getTime() - 1),
					sessionId: "nhac-tran-thang-thu",
					tinhNang: "okr.soan",
					costUsd: tong - daChi,
				},
			});
			const keHoach = await db.okrCycle.findMany({
				where: { phase: "lap-ke-hoach" },
				select: { id: true },
			});
			const baoTran = async () => {
				const ds = [...(await viecAiCanNhac(db, { now })).values()]
					.flat()
					.flatMap((v) => (v.loai === "ai-tran" ? [[v.muc, v.tranUsd]] : []));
				return [...new Set(ds.map((v) => JSON.stringify(v)))];
			};
			try {
				const ct = await cauHinhAiLuc(db, now);
				const coKy = {
					ky: await coChuKyLapKeHoachTrongThang(db, thang),
					bao: await baoTran(),
				};
				await db.okrCycle.updateMany({
					where: { id: { in: keHoach.map((k) => k.id) } },
					data: { phase: "dang-chay" },
				});
				const hetKy = {
					ky: await coChuKyLapKeHoachTrongThang(db, thang),
					bao: await baoTran(),
				};
				expect({
					tran: [ct.aiTranThangUsd, ct.aiTranThangDatOkrUsd],
					coKy,
					hetKy,
				}).toEqual({
					tran: [9, 15],
					coKy: { ky: true, bao: [] },
					hetKy: { ky: false, bao: [JSON.stringify([100, 9])] },
				});
			} finally {
				await db.okrCycle.updateMany({
					where: { id: { in: keHoach.map((k) => k.id) } },
					data: { phase: "lap-ke-hoach" },
				});
				await db.aiChiPhi.delete({ where: { id: chi.id } });
			}
		},
		CHO_DB,
	);
});

describe("nac-an-cuoc", () => {
	const QUAN_TRI = "le-hai-dang";
	const TRUONG = "nguyen-thi-lan";
	const DUONG = ["trpc", "rest"] as const;

	const sanSang = async (duong: (typeof DUONG)[number], cookie: string) =>
		ok<SoanSanSangOutput>(
			await goiSoan(
				app,
				"soanSanSang",
				duong,
				vaoDonVi(DON_VI.kdBac, duong),
				cookie,
			),
			`san sang ${duong}`,
		);
	const mo = async (duong: (typeof DUONG)[number], cookie: string) =>
		ok<SoanMoOutput>(
			await goiSoan(
				app,
				"soanMo",
				duong,
				vaoDonVi(DON_VI.kdBac, duong),
				cookie,
			),
			`mo ${duong}`,
		);
	const danhSachCuoc = async (duong: (typeof DUONG)[number], cookie: string) =>
		ok<SoanDanhSachCuocOutput>(
			await goiSoan(
				app,
				"soanDanhSachCuoc",
				duong,
				vaoDonVi(DON_VI.kdBac, duong),
				cookie,
			),
			`danh sach cuoc ${duong}`,
		);
	const idCuoc = (d: SoanDanhSachCuocOutput) =>
		new Set(d.cuoc.map((c) => c.id));

	beforeEach(async () => {
		await donSoan();
		await datPhaQuy4("lap-ke-hoach");
	});

	afterAll(async () => {
		await donSoan();
	}, CHO_DB);

	test(
		"nấc ẩn: quản trị mở được cuộc ẩn, trưởng phòng bị từ chối don-vi-che-do-an; danh sách cuộc của trưởng phòng không có cuộc ẩn, của quản trị có",
		async () => {
			await ghiCauHinh(app, cookieQuanTri, NAC_SOAN.an);
			const daBo = await gieoCuoc({
				donVi: DON_VI.kdBac,
				nguoiMo: TRUONG,
				nac: "bat",
			});
			await db.okrCuocSoan.update({
				where: { id: daBo.id },
				data: { trangThai: "bo" },
			});
			for (const duong of DUONG) {
				expect(await sanSang(duong, cookieTruong)).toEqual({
					bat: false,
					lyDo: "don-vi-che-do-an",
				});
				expect(await mo(duong, cookieTruong)).toEqual({
					ok: false,
					lyDo: "don-vi-che-do-an",
					cuocDang: null,
				});
			}
			expect(await db.okrCuocSoan.count({ where: { nac: "an" } })).toBe(0);
			tienDongHo();
			const m = await mo("trpc", cookieQuanTri);
			if (!m.ok) throw new Error(`quan tri mo: ${m.lyDo}`);
			expect(m.cuoc).toMatchObject({
				nac: "an",
				trangThai: "dang",
				nguoiMo: { id: idMau("nguoi", QUAN_TRI) },
			});
			for (const duong of DUONG) {
				expect(
					idCuoc(await danhSachCuoc(duong, cookieTruong)),
					"lo cuoc an cho truong phong",
				).toEqual(new Set([daBo.id]));
				expect(idCuoc(await danhSachCuoc(duong, cookieQuanTri))).toEqual(
					new Set([daBo.id, m.cuoc.id]),
				);
			}
		},
		CHO_DB,
	);

	test(
		"nấc đã bật mà còn cuộc ẩn đang chạy: trưởng phòng nhận cuoc-an-dang-mo có tên (không phải bat kèm cuocDang null), quản trị vẫn thấy cuộc; cuộc ẩn đã bỏ thì trưởng phòng mở được",
		async () => {
			await ghiCauHinh(app, cookieQuanTri, NAC_SOAN.an);
			tienDongHo();
			const m = await mo("trpc", cookieQuanTri);
			if (!m.ok) throw new Error(`quan tri mo: ${m.lyDo}`);
			await ghiCauHinh(app, cookieQuanTri, NAC_SOAN.bat);
			for (const duong of DUONG) {
				expect(await sanSang(duong, cookieTruong), "ngo cut").toEqual({
					bat: false,
					lyDo: "cuoc-an-dang-mo",
				});
				expect(await mo(duong, cookieTruong)).toEqual({
					ok: false,
					lyDo: "cuoc-an-dang-mo",
					cuocDang: null,
				});
				expect(await sanSang(duong, cookieQuanTri)).toMatchObject({
					bat: true,
					nac: "bat",
					cuocDang: { id: m.cuoc.id, nac: "an" },
				});
				expect(await mo(duong, cookieQuanTri)).toMatchObject({
					ok: false,
					lyDo: "con-cuoc-dang",
					cuocDang: { id: m.cuoc.id },
				});
			}
			expect(await db.okrCuocSoan.count()).toBe(1);
			await tangLuot(db, m.cuoc.id);
			await db.okrCuocSoan.update({
				where: { id: m.cuoc.id },
				data: { trangThai: "bo" },
			});
			for (const duong of DUONG)
				expect(await sanSang(duong, cookieTruong)).toMatchObject({
					bat: true,
					cuocDang: null,
					soCuocDaDung: 1,
				});
			const moi = await mo("trpc", cookieTruong);
			expect(moi).toMatchObject({ ok: true, cuoc: { nac: "bat" } });
		},
		CHO_DB,
	);

	test(
		"cuộc ẩn quản trị mở xuất hiện ở ngăn quản trị: soanAn trả cuộc nấc an và dòng nháp, soanSoDo đếm nó ở cột an; trưởng phòng nhận 403 ở cả hai",
		async () => {
			await ghiCauHinh(app, cookieQuanTri, NAC_SOAN.an);
			tienDongHo();
			const m = await mo("trpc", cookieQuanTri);
			if (!m.ok) throw new Error(`quan tri mo: ${m.lyDo}`);
			const cuocAn = await docCuoc(db, m.cuoc.id);
			if (!cuocAn) throw new Error("khong doc lai duoc cuoc an");
			const [dong] = await gieoDongNhap(cuocAn, [
				{ loai: "muc-tieu-moi", khoa: "m1", ten: "Mục tiêu soạn ở chế độ ẩn" },
			]);
			for (const duong of DUONG) {
				const an = ok<SoanAnOutput>(
					await goiSoan(
						app,
						"soanAn",
						duong,
						{ cuocSoanId: m.cuoc.id },
						cookieQuanTri,
					),
					`an ${duong}`,
				);
				expect(an.cuoc).toMatchObject({ id: m.cuoc.id, nac: "an" });
				expect(an.dong.map((d) => d.id)).toEqual([dong ?? ""]);
				const tra = await goiSoan(
					app,
					"soanAn",
					duong,
					{ cuocSoanId: m.cuoc.id },
					cookieTruong,
				);
				expect([tra.status, tra.loi]).toEqual([
					403,
					OKR.thongDiep.canQuyenQuanTri,
				]);
			}
			const soDo = ok<SoanSoDoOutput>(
				await goiSoan(
					app,
					"soanSoDo",
					"trpc",
					{ cycleId: CHU_KY_Q4 },
					cookieQuanTri,
				),
				"so do",
			);
			expect([soDo.an.cuocMo, soDo.bat.cuocMo]).toEqual([1, 0]);
			expect(soDo.cuocGanDay.map((c) => c.id)).toEqual([m.cuoc.id]);
		},
		CHO_DB,
	);
});
