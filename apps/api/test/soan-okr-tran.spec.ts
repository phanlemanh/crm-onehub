import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type {
	SoanMoOutput,
	SoanSanSangOutput,
	SoanTangLuotOutput,
} from "../src/okr/okr.contracts";
import {
	DON_VI,
	datPhaNamKe,
	datPhaQuy4,
	donSoan,
	gieoCuoc,
	goiSoan,
	NAC_SOAN,
	vaoDonVi,
} from "./soan-okr-san";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	ghiCauHinh,
	gieoChiPhi,
	ketThucMau,
	ok,
	phienMau,
	tienDongHo,
} from "./tro-ly-okr-san";

let app: NestExpressApplication;
let cTruong = "";
let cNam = "";
let cQuanTri = "";
let demChi = 0;

async function sanSang(c = cTruong, dv = DON_VI.kdBac) {
	tienDongHo();
	return ok<SoanSanSangOutput>(
		await goiSoan(app, "soanSanSang", "trpc", vaoDonVi(dv, "trpc"), c),
		"san sang",
	);
}

async function mo(c = cTruong, dv = DON_VI.kdBac) {
	tienDongHo();
	return ok<SoanMoOutput>(
		await goiSoan(app, "soanMo", "trpc", vaoDonVi(dv, "trpc"), c),
		"mo",
	);
}

async function luot(
	cuocSoanId: string,
	nhan: string,
	duong: "trpc" | "rest" = "trpc",
	c = cTruong,
) {
	tienDongHo();
	return ok<SoanTangLuotOutput>(
		await goiSoan(app, "soanTangLuot", duong, { cuocSoanId }, c),
		nhan,
	);
}

async function soLuotTrongDb(id: string) {
	return (await db.okrCuocSoan.findUniqueOrThrow({ where: { id } })).soLuot;
}

async function tienSoan(usd: string) {
	demChi += 1;
	await gieoChiPhi({
		id: `soan-${demChi}`,
		taskId: null,
		usd,
		tinhNang: "okr.soan",
		sessionId: `phien-tien-${demChi}`,
	});
}

beforeAll(async () => {
	await batDauMau();
	await donSoan();
	await datPhaQuy4("lap-ke-hoach");
	app = await dungUngDung();
	cTruong = await phienMau("nguyen-thi-lan");
	cNam = await phienMau("ly-thanh-tam");
	cQuanTri = await phienMau("le-hai-dang");
	await ghiCauHinh(app, cQuanTri, {
		...NAC_SOAN.bat,
		aiTranThangUsd: 9,
		aiTranThangDatOkrUsd: null,
	});
}, CHO_DB);

afterAll(async () => {
	await db.aiChiPhi.deleteMany({ where: { tinhNang: "okr.soan" } });
	await datPhaQuy4("lap-ke-hoach");
	await datPhaNamKe("lap-ke-hoach");
	await donSoan();
	await ketThucMau(app);
}, CHO_DB);

describe("tran-soan", () => {
	test(
		"luot: luot thu luotMoiCuoc+1 bi tu choi het-luot-cuoc; so rut tu TRO_LY_OKR_TRAN.soan",
		async () => {
			const m = await mo();
			expect(m.ok).toBe(true);
			const id = m.ok ? m.cuoc.id : "";
			const tran = TRO_LY_OKR_TRAN.soan.luotMoiCuoc;
			for (let i = 1; i <= tran; i += 1) {
				expect(await luot(id, `luot ${i}`)).toEqual({ ok: true, soLuot: i });
			}
			expect(await luot(id, "luot qua tran", "rest")).toEqual({
				ok: false,
				lyDo: "het-luot-cuoc",
			});
			expect(await luot(id, "luot qua tran trpc")).toEqual({
				ok: false,
				lyDo: "het-luot-cuoc",
			});
			expect(await soLuotTrongDb(id)).toBe(tran);
			await db.okrCuocSoan.update({
				where: { id },
				data: { trangThai: "bo" },
			});
		},
		CHO_DB,
	);

	test(
		"cuoc-khong-dang: cuoc da-dua-vao hay bo khong nhan luot va khong dem luot",
		async () => {
			for (const trangThai of ["da-dua-vao", "bo"] as const) {
				const cuoc = await gieoCuoc({
					donVi: DON_VI.kdNam,
					nguoiMo: "ly-thanh-tam",
				});
				await db.okrCuocSoan.update({
					where: { id: cuoc.id },
					data: { trangThai },
				});
				expect(await luot(cuoc.id, `luot ${trangThai}`, "trpc", cNam)).toEqual({
					ok: false,
					lyDo: "cuoc-khong-dang",
				});
				expect(await soLuotTrongDb(cuoc.id)).toBe(0);
			}
			await db.okrCuocSoan.deleteMany({
				where: { departmentId: DON_VI.kdNam.departmentId },
			});
		},
		CHO_DB,
	);

	test(
		"cuoc-ky: lan mo thu cuocMoiDonViMoiKy+1 cung don vi cung chu ky -> het-cuoc-ky; don vi khac van mo",
		async () => {
			const tran = TRO_LY_OKR_TRAN.soan.cuocMoiDonViMoiKy;
			const da = await db.okrCuocSoan.count({
				where: { departmentId: DON_VI.kdBac.departmentId },
			});
			for (let i = da; i < tran; i += 1) {
				const m = await mo();
				expect(m.ok, `mo lan ${i + 1}`).toBe(true);
				await db.okrCuocSoan.update({
					where: { id: m.ok ? m.cuoc.id : "" },
					data: { trangThai: "bo" },
				});
			}
			expect(await mo()).toEqual({
				ok: false,
				lyDo: "het-cuoc-ky",
				cuocDang: null,
			});
			expect(await sanSang()).toMatchObject({
				bat: false,
				lyDo: "het-cuoc-ky",
			});
			const khac = await mo(cNam, DON_VI.kdNam);
			expect(khac.ok).toBe(true);
			await db.okrCuocSoan.update({
				where: { id: khac.ok ? khac.cuoc.id : "" },
				data: { trangThai: "bo" },
			});
			await db.okrCuocSoan.deleteMany({
				where: { departmentId: DON_VI.kdBac.departmentId },
			});
			await db.okrCuocSoan.deleteMany({
				where: { departmentId: DON_VI.kdNam.departmentId },
			});
		},
		CHO_DB,
	);

	test(
		"thang dat OKR: co chu ky lap-ke-hoach -> dung aiTranThangDatOkrUsd khi dat, bang aiTranThangUsd khi null",
		async () => {
			await ghiCauHinh(app, cQuanTri, {
				aiTranThangUsd: 9,
				aiTranThangDatOkrUsd: 2,
			});
			await tienSoan("2.00");
			expect(await sanSang(), "tran thang dat okr khong ap").toMatchObject({
				bat: false,
				lyDo: "het-tran-thang",
			});
			expect(await mo()).toMatchObject({ ok: false, lyDo: "het-tran-thang" });
			await ghiCauHinh(app, cQuanTri, { aiTranThangDatOkrUsd: null });
			const s = await sanSang();
			expect(s.bat, "tran rieng trong van bi ap").toBe(true);
			await ghiCauHinh(app, cQuanTri, { aiTranThangDatOkrUsd: 2 });
			expect(await sanSang()).toMatchObject({
				bat: false,
				lyDo: "het-tran-thang",
			});
		},
		CHO_DB,
	);

	test(
		"thang thuong: khong co chu ky lap-ke-hoach -> tran thuong; cham 9 USD moi het-tran-thang, ca soanTangLuot o cua cung tu choi",
		async () => {
			await datPhaQuy4("dang-chay");
			await datPhaNamKe("dang-chay");
			tienDongHo();
			const chuaChamTran = await goiSoan(
				app,
				"soanSanSang",
				"trpc",
				vaoDonVi(DON_VI.kdBac, "trpc"),
				cTruong,
			);
			expect(
				chuaChamTran.status,
				`thang thuong dung tran rieng: ${chuaChamTran.loi}`,
			).toBe(400);
			await tienSoan("7.00");
			expect(await sanSang()).toMatchObject({
				bat: false,
				lyDo: "het-tran-thang",
			});
			await datPhaQuy4("lap-ke-hoach");
			await datPhaNamKe("lap-ke-hoach");
			const cuoc = await gieoCuoc({
				donVi: DON_VI.kdBac,
				nguoiMo: "nguyen-thi-lan",
			});
			expect(await luot(cuoc.id, "luot khi het tran")).toEqual({
				ok: false,
				lyDo: "het-tran-thang",
			});
			expect(await soLuotTrongDb(cuoc.id)).toBe(0);
			const daBo = await gieoCuoc({
				donVi: DON_VI.kdNam,
				nguoiMo: "ly-thanh-tam",
			});
			await db.okrCuocSoan.update({
				where: { id: daBo.id },
				data: { trangThai: "bo" },
			});
			expect(
				await luot(daBo.id, "cuoc bo khi het tran", "trpc", cNam),
				"tran thang phai thang trang thai cuoc",
			).toEqual({ ok: false, lyDo: "het-tran-thang" });
			await db.aiChiPhi.deleteMany({ where: { tinhNang: "okr.soan" } });
			await ghiCauHinh(app, cQuanTri, { aiTranThangDatOkrUsd: null });
			expect(await luot(daBo.id, "cuoc bo khi con tran", "trpc", cNam)).toEqual(
				{
					ok: false,
					lyDo: "cuoc-khong-dang",
				},
			);
			expect(await luot(cuoc.id, "luot khi con tran")).toEqual({
				ok: true,
				soLuot: 1,
			});
		},
		CHO_DB,
	);

	test(
		"cua: trần tháng đặt OKR chặn lượt ở tháng có chu kỳ lập kế hoạch, và trần trống thì lượt qua",
		async () => {
			const cuoc = await gieoCuoc({
				donVi: DON_VI.kdNam,
				nguoiMo: "ly-thanh-tam",
			});
			await ghiCauHinh(app, cQuanTri, {
				aiTranThangUsd: 9,
				aiTranThangDatOkrUsd: 3,
			});
			await tienSoan("3.00");
			expect(
				await luot(cuoc.id, "luot khi cham tran rieng", "trpc", cNam),
			).toEqual({ ok: false, lyDo: "het-tran-thang" });
			await ghiCauHinh(app, cQuanTri, { aiTranThangDatOkrUsd: null });
			expect(
				await luot(cuoc.id, "luot khi tran rieng trong", "trpc", cNam),
			).toEqual({ ok: true, soLuot: 1 });
			await db.aiChiPhi.deleteMany({ where: { tinhNang: "okr.soan" } });
		},
		CHO_DB,
	);

	test(
		"cong: cuoc khong co -> 404; cuoc an cua nguoi khac voi nguoi khong quan tri -> 403; nguoi quan tri van dem luot",
		async () => {
			tienDongHo();
			const khongCo = await goiSoan(
				app,
				"soanTangLuot",
				"trpc",
				{ cuocSoanId: "khong-co" },
				cTruong,
			);
			expect(khongCo.status).toBe(404);
			expect(khongCo.loi).toContain("Không có cuộc soạn");
			const an = await gieoCuoc({
				donVi: DON_VI.kdBac,
				nguoiMo: "le-hai-dang",
				nac: "an",
			});
			tienDongHo();
			const cam = await goiSoan(
				app,
				"soanTangLuot",
				"rest",
				{ cuocSoanId: an.id },
				cTruong,
			);
			expect(cam.status).toBe(403);
			expect(await soLuotTrongDb(an.id)).toBe(0);
			expect(await luot(an.id, "quan tri dem luot", "trpc", cQuanTri)).toEqual({
				ok: true,
				soLuot: 1,
			});
		},
		CHO_DB,
	);

	test(
		"nac tat giua chung -> don-vi-chua-bat; thieu khoa mo hinh chan luot -> chua-co-khoa-mo-hinh; nac tat thang khoa thieu",
		async () => {
			const cuoc = await gieoCuoc({
				donVi: DON_VI.kdBac,
				nguoiMo: "nguyen-thi-lan",
			});
			const kiemLuc = async () => {
				tienDongHo();
				const luc = new Date();
				return db.agentTask.create({
					data: {
						kind: "okr-kiem-san-sang",
						reason: "okr-kiem-san-sang",
						subject: "soan-tran-khoa",
						dueAt: luc,
						finishedAt: luc,
						outcome: "chua-co-khoa-mo-hinh",
					},
				});
			};
			await ghiCauHinh(app, cQuanTri, NAC_SOAN.tat);
			expect(await luot(cuoc.id, "luot khi nac tat", "trpc", cTruong)).toEqual({
				ok: false,
				lyDo: "don-vi-chua-bat",
			});
			expect(
				await luot(cuoc.id, "luot khi nac tat rest", "rest", cTruong),
			).toEqual({
				ok: false,
				lyDo: "don-vi-chua-bat",
			});
			expect(await soLuotTrongDb(cuoc.id)).toBe(0);
			const kiem = await kiemLuc();
			try {
				expect(
					await luot(cuoc.id, "nac tat thang khoa thieu", "trpc", cTruong),
				).toEqual({ ok: false, lyDo: "don-vi-chua-bat" });
				await ghiCauHinh(app, cQuanTri, NAC_SOAN.bat);
				expect(await sanSang()).toMatchObject({
					bat: false,
					lyDo: "chua-co-khoa-mo-hinh",
				});
				expect(
					await luot(cuoc.id, "luot khi thieu khoa", "trpc", cTruong),
				).toEqual({ ok: false, lyDo: "chua-co-khoa-mo-hinh" });
				expect(await soLuotTrongDb(cuoc.id)).toBe(0);
			} finally {
				await db.agentTask.delete({ where: { id: kiem.id } });
			}
			expect(await luot(cuoc.id, "luot khi co khoa", "trpc", cTruong)).toEqual({
				ok: true,
				soLuot: 1,
			});
		},
		CHO_DB,
	);
});
