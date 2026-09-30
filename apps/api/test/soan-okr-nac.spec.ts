import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { thangVN } from "@crm/db/ai-chi-phi";
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
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
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
	"../../../packages/db/prisma/migrations/20261009010000_okr_soan/migration.sql",
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

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	cookieQuanTri = await phienMau("le-hai-dang");
	cookieThanhVien = await phienMau("bui-quang-huy");
	cookieOkr = await phienMau("giang-hai-yen");
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
});
