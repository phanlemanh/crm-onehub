import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import type {
	OkrProgram,
	OkrProgramSua,
} from "@crm/validation/okr-chuong-trinh";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { idMau } from "../scripts/okr-mau/nap";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	goi,
	goiRest,
	ketThucMau,
	ok,
	phienMau,
	tienDongHo,
} from "./tro-ly-okr-san";

const MIGRATION = join(
	import.meta.dir,
	"../../../packages/db/prisma/migrations/20261007010000_tro_ly_okr_de_xuat/migration.sql",
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
	/^CREATE (UNIQUE )?INDEX "[A-Za-z_]+" ON "[A-Za-z]+"\s*\([^;]*\)$/s,
];

function cauLech(sql: string): string[] {
	const cau = sql
		.split("\n")
		.filter((d) => !d.trim().startsWith("--"))
		.join("\n")
		.split(";")
		.map((c) => c.trim())
		.filter((c) => c.length > 0);
	return cau.filter(
		(c) => CAM.some((r) => r.test(c)) || !CHO_PHEP.some((r) => r.test(c)),
	);
}

let app: NestExpressApplication;
let cookieQuanTri = "";
let cookieThanhVien = "";
let cookieOkr = "";

const soPhienBan = () => db.okrProgramConfig.count();

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

describe("nac-luu", () => {
	test(
		"quản trị lưu Bật cho [onehub] và Chế độ ẩn toàn công ty: phiên bản mới mang đúng bốn cột ẩn, program đọc lại bằng",
		async () => {
			const phong = idMau("pb", "marketing");
			const sua: OkrProgramSua = {
				aiOn: true,
				aiDeXuatPhamVi: "danh-sach",
				aiDeXuatDonVi: ["onehub"],
				aiDeXuatAnPhamVi: "toan-cong-ty",
				aiDeXuatAnDonVi: [],
				aiTomTatAnPhamVi: "danh-sach",
				aiTomTatAnDonVi: [phong],
			};
			const truoc = await db.okrProgramConfig.findFirst({
				orderBy: { version: "desc" },
				select: { version: true },
			});
			tienDongHo();
			ok(
				await goi(app, "okr.setProgram", "mutation", sua, cookieQuanTri),
				"setProgram",
			);
			const moi = await db.okrProgramConfig.findFirstOrThrow({
				orderBy: { version: "desc" },
			});
			expect(moi.version).toBe((truoc?.version ?? 0) + 1);
			expect({
				aiDeXuatAnPhamVi: moi.aiDeXuatAnPhamVi,
				aiDeXuatAnDonVi: moi.aiDeXuatAnDonVi,
				aiTomTatAnPhamVi: moi.aiTomTatAnPhamVi,
				aiTomTatAnDonVi: moi.aiTomTatAnDonVi,
				aiDeXuatPhamVi: moi.aiDeXuatPhamVi,
				aiDeXuatDonVi: moi.aiDeXuatDonVi,
			}).toEqual({
				aiDeXuatAnPhamVi: "toan-cong-ty",
				aiDeXuatAnDonVi: [],
				aiTomTatAnPhamVi: "danh-sach",
				aiTomTatAnDonVi: [phong],
				aiDeXuatPhamVi: "danh-sach",
				aiDeXuatDonVi: ["onehub"],
			});
			const docLai = ok<OkrProgram & { version: number }>(
				await goi(app, "okr.program", "query", undefined, cookieQuanTri),
				"program",
			);
			expect(docLai).toMatchObject({ ...sua, version: moi.version });
		},
		CHO_DB,
	);

	test(
		"thành viên và vai okr gọi setProgram qua tRPC và REST → 403, không phiên bản mới",
		async () => {
			const truoc = await soPhienBan();
			const vao = { aiDeXuatAnPhamVi: "tat" } as const;
			for (const [ai, c] of [
				["thanh-vien", cookieThanhVien],
				["vai-okr", cookieOkr],
			] as const) {
				const trpc = await goi(app, "okr.setProgram", "mutation", vao, c);
				const rest = await goiRest(app, "PUT", "/okr/program", vao, c);
				expect([ai, trpc.status, rest.status]).toEqual([ai, 403, 403]);
			}
			expect(await soPhienBan()).toBe(truoc);
		},
		CHO_DB,
	);

	test("migration của lượt chỉ thêm: không DROP, không đổi kiểu cột cũ", () => {
		const sql = readFileSync(MIGRATION, "utf8");
		expect(sql.length).toBeGreaterThan(0);
		expect(cauLech(sql), "migration khong chi them").toEqual([]);
	});
});
