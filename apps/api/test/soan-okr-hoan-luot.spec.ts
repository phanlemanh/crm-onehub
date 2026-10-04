import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { hoanLuot, tangLuot } from "@crm/db/okr-cuoc-soan";
import { TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { SoanMoOutput, SoanSanSangOutput } from "../src/okr/okr.contracts";
import {
	DON_VI,
	datPhaNamKe,
	datPhaQuy4,
	donSoan,
	goiSoan,
	NAC_SOAN,
	vaoDonVi,
} from "./soan-okr-san";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	ghiCauHinh,
	ketThucMau,
	ok,
	phienMau,
	tienDongHo,
} from "./tro-ly-okr-san";

const TRAN = TRO_LY_OKR_TRAN.soan.cuocMoiDonViMoiKy;
const PB = DON_VI.kdBac.departmentId;
const SO_LUOT_HONG = [1, 3] as const;

let app: NestExpressApplication;
let cTruong = "";

async function sanSang() {
	tienDongHo();
	return ok<SoanSanSangOutput>(
		await goiSoan(
			app,
			"soanSanSang",
			"trpc",
			vaoDonVi(DON_VI.kdBac, "trpc"),
			cTruong,
		),
		"san sang",
	);
}

async function mo(boCuocDangId?: string) {
	tienDongHo();
	const vao = vaoDonVi(DON_VI.kdBac, "trpc");
	return ok<SoanMoOutput>(
		await goiSoan(
			app,
			"soanMo",
			"trpc",
			boCuocDangId ? { ...vao, boCuocDangId } : vao,
			cTruong,
		),
		"mo",
	);
}

async function moCuocMoi(): Promise<string> {
	const m = await mo();
	if (!m.ok) throw new Error(`gieo mo cuoc: ${JSON.stringify(m)}`);
	return m.cuoc.id;
}

async function gieoDaDung(soCuoc: number) {
	await db.okrCuocSoan.deleteMany({ where: { departmentId: PB } });
	for (let i = 0; i < soCuoc; i += 1) {
		const id = await moCuocMoi();
		await tangLuot(db, id);
		await db.okrCuocSoan.update({
			where: { id },
			data: { trangThai: i % 2 === 0 ? "da-dua-vao" : "bo" },
		});
	}
}

beforeAll(async () => {
	await batDauMau();
	await donSoan();
	await datPhaQuy4("lap-ke-hoach");
	app = await dungUngDung();
	cTruong = await phienMau("nguyen-thi-lan");
	const cQuanTri = await phienMau("le-hai-dang");
	await ghiCauHinh(app, cQuanTri, {
		...NAC_SOAN.bat,
		aiTranThangUsd: 9,
		aiTranThangDatOkrUsd: null,
	});
}, CHO_DB);

afterAll(async () => {
	await datPhaQuy4("lap-ke-hoach");
	await datPhaNamKe("lap-ke-hoach");
	await donSoan();
	await ketThucMau(app);
}, CHO_DB);

describe("cuoc-hong-khong-an-tran", () => {
	for (const k of SO_LUOT_HONG) {
		test(
			`cuoc-hong-khong-an-tran: ${k} luot hong`,
			async () => {
				await gieoDaDung(TRAN - 1);
				const hong = await moCuocMoi();
				for (let i = 0; i < k; i += 1) {
					await tangLuot(db, hong);
					await hoanLuot(db, hong);
				}
				const s = await sanSang();
				expect(s.bat ? s.soCuocDaDung : -1, `cuoc-hong-an-tran k=${k}`).toBe(
					TRAN - 1,
				);
				const moi = await mo(hong);
				expect(moi.ok, `cuoc-hong-an-tran k=${k}`).toBe(true);
				expect(moi.ok ? moi.cuoc.id : "").not.toBe(hong);
			},
			CHO_DB,
		);
	}

	test(
		"cuoc-hong-khong-an-tran: doi chung — cuoc co mot luot thanh cong thi bi tinh",
		async () => {
			await gieoDaDung(TRAN - 1);
			const coLuot = await moCuocMoi();
			await tangLuot(db, coLuot);
			const s = await sanSang();
			expect(s.bat ? s.soCuocDaDung : -1).toBe(TRAN);
			const kq = await mo(coLuot);
			expect(kq.ok ? "ok" : kq.lyDo).toBe("het-cuoc-ky");
		},
		CHO_DB,
	);
});
