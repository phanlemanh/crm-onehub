import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { tangLuot } from "@crm/db/okr-cuoc-soan";
import { docTrangChienLuocDangDung } from "@crm/db/tai-lieu-chien-luoc";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { idMau } from "../scripts/okr-mau/nap";
import type {
	SoanDanhSachCuocOutput,
	SoanMoOutput,
	SoanSanSangOutput,
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
	PB,
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
} from "./tro-ly-okr-san";

const TRUONG = "nguyen-thi-lan";
const QUAN_TRI = "le-hai-dang";
const CHO_GIU =
	/^cho-eve:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

let app: NestExpressApplication;
let cTruong = "";
let cQuanTri = "";

const sanSang = async (duong: "trpc" | "rest" = "trpc") =>
	ok<SoanSanSangOutput>(
		await goiSoan(
			app,
			"soanSanSang",
			duong,
			vaoDonVi(DON_VI.kdBac, duong),
			cTruong,
		),
		"soanSanSang",
	);

const mo = async (
	them: { thuLaiCuocId?: string; boCuocDangId?: string } = {},
) =>
	ok<SoanMoOutput>(
		await goiSoan(
			app,
			"soanMo",
			"trpc",
			{ ...vaoDonVi(DON_VI.kdBac, "trpc"), ...them },
			cTruong,
		),
		"soanMo",
	);

beforeAll(async () => {
	await batDauMau();
	await donSoan();
	await datPhaQuy4("lap-ke-hoach");
	app = await dungUngDung();
	cTruong = await phienMau(TRUONG);
	cQuanTri = await phienMau(QUAN_TRI);
	await ghiCauHinh(app, cQuanTri, NAC_SOAN.bat);
}, CHO_DB);

afterAll(async () => {
	await donSoan();
	await ketThucMau(app);
}, CHO_DB);

beforeEach(async () => {
	await donSoan();
	await datPhaQuy4("lap-ke-hoach");
});

describe("soan-mo", () => {
	test(
		"san-sang: đơn vị bật, chưa có cuộc → bat, tranCuoc 3, thieuBoiCanh đúng kho tài liệu",
		async () => {
			const thieu = (await docTrangChienLuocDangDung(db)).length === 0;
			for (const duong of ["trpc", "rest"] as const)
				expect(await sanSang(duong)).toEqual({
					bat: true,
					nac: "bat",
					cuocDang: null,
					soCuocDaDung: 0,
					tranCuoc: 3,
					thieuBoiCanh: thieu,
				});
		},
		CHO_DB,
	);

	test(
		"mo: trả cuộc đủ trường theo khuôn D, phiên do API đúc; mở lần hai → con-cuoc-dang kèm cuộc đó",
		async () => {
			const kq = await mo();
			if (!kq.ok) throw new Error(`mo: ${kq.lyDo}`);
			const ky = await db.okrCycle.findUniqueOrThrow({
				where: { id: CHU_KY_Q4 },
				select: { name: true },
			});
			expect(kq.cuoc).toMatchObject({
				cycleId: CHU_KY_Q4,
				level: "phong-ban",
				divisionId: null,
				departmentId: DON_VI.kdBac.departmentId,
				tenDonVi: "Kinh doanh miền Bắc",
				tenChuKy: ky.name,
				nguoiMo: { id: idMau("nguoi", TRUONG), name: "Nguyễn Thị Lan" },
				nac: "bat",
				trangThai: "dang",
				soLuot: 0,
				tranLuot: 12,
				duaVaoLuc: null,
				soDongNhan: 0,
				soDongTong: 0,
			});
			expect(kq.cuoc.sessionId).toMatch(CHO_GIU);
			expect(Number.isNaN(Date.parse(kq.cuoc.moLuc))).toBe(false);
			const lai = await mo();
			expect(lai).toMatchObject({
				ok: false,
				lyDo: "con-cuoc-dang",
				cuocDang: { id: kq.cuoc.id },
			});
			expect(await sanSang()).toMatchObject({
				bat: true,
				cuocDang: { id: kq.cuoc.id },
				soCuocDaDung: 0,
			});
			await tangLuot(db, kq.cuoc.id);
			expect(await sanSang()).toMatchObject({
				cuocDang: { id: kq.cuoc.id },
				soCuocDaDung: 1,
			});
		},
		CHO_DB,
	);

	test(
		"bam-dup: hai lần mở cùng lúc cho cùng đơn vị → đúng một cuộc, lần kia con-cuoc-dang kèm cuộc đó",
		async () => {
			const [a, b] = await Promise.all([mo(), mo()]);
			const thanh = [a, b].filter((k) => k.ok);
			const hong = [a, b].filter((k) => !k.ok);
			expect(thanh).toHaveLength(1);
			const cuoc = thanh[0]?.ok ? thanh[0].cuoc : null;
			expect(hong).toEqual([
				expect.objectContaining({
					ok: false,
					lyDo: "con-cuoc-dang",
					cuocDang: expect.objectContaining({ id: cuoc?.id }),
				}),
			]);
			expect(
				await db.okrCuocSoan.count({
					where: {
						cycleId: CHU_KY_Q4,
						departmentId: DON_VI.kdBac.departmentId,
					},
				}),
			).toBe(1);
		},
		CHO_DB,
	);

	test(
		"thu-lai-cuoc-an: trưởng phòng thử lại cuộc ẩn quản trị mở → 404 cùng câu với mã không có, phiên không đổi",
		async () => {
			const an = await gieoCuoc({
				donVi: DON_VI.kdBac,
				nguoiMo: QUAN_TRI,
				nac: "an",
			});
			for (const duong of ["trpc", "rest"] as const) {
				const tra = await goiSoan(
					app,
					"soanMo",
					duong,
					{ ...vaoDonVi(DON_VI.kdBac, duong), thuLaiCuocId: an.id },
					cTruong,
				);
				const khongCo = await goiSoan(
					app,
					"soanMo",
					duong,
					{ ...vaoDonVi(DON_VI.kdBac, duong), thuLaiCuocId: "khong-co" },
					cTruong,
				);
				expect([tra.status, khongCo.status], duong).toEqual([404, 404]);
				expect(tra.loi).toBe(OKR.thongDiep.soan.khongCoCuoc);
				expect(tra.loi).toBe(khongCo.loi);
			}
			expect(
				await db.okrCuocSoan.findUniqueOrThrow({
					where: { id: an.id },
					select: { sessionId: true, cacPhien: true },
				}),
			).toEqual({ sessionId: an.sessionId, cacPhien: [an.sessionId] });
		},
		CHO_DB,
	);

	test(
		"het-cuoc-ky: ba cuộc trong kỳ (mọi trạng thái) → sẵn sàng và mở đều từ chối",
		async () => {
			for (const trangThai of ["bo", "da-dua-vao", "bo"] as const) {
				const c = await gieoCuoc({ donVi: DON_VI.kdBac, nguoiMo: TRUONG });
				await db.okrCuocSoan.update({
					where: { id: c.id },
					data: { trangThai, soLuot: 1 },
				});
			}
			expect(await sanSang()).toEqual({ bat: false, lyDo: "het-cuoc-ky" });
			expect(await mo()).toEqual({
				ok: false,
				lyDo: "het-cuoc-ky",
				cuocDang: null,
			});
		},
		CHO_DB,
	);

	test(
		"ky-khong-lap-ke-hoach: chu kỳ đang chạy → 400 có tên ở sẵn sàng và mở",
		async () => {
			await datPhaQuy4("dang-chay");
			for (const ten of ["soanSanSang", "soanMo"] as const) {
				const tra = await goiSoan(
					app,
					ten,
					"trpc",
					vaoDonVi(DON_VI.kdBac, "trpc"),
					cTruong,
				);
				expect(tra.status, ten).toBe(400);
				expect(tra.loi).toBe(OKR.thongDiep.soan.kyKhongLapKeHoach);
			}
			expect(await db.okrCuocSoan.count()).toBe(0);
		},
		CHO_DB,
	);

	test(
		"ky-an: chu kỳ lập kế hoạch đã ẩn → 400 có tên ở sẵn sàng và mở, không cuộc; hiện lại thì sẵn sàng bật",
		async () => {
			await db.okrCycle.update({
				where: { id: CHU_KY_Q4 },
				data: { anLuc: new Date() },
			});
			try {
				for (const ten of ["soanSanSang", "soanMo"] as const) {
					const tra = await goiSoan(
						app,
						ten,
						"trpc",
						vaoDonVi(DON_VI.kdBac, "trpc"),
						cTruong,
					);
					expect({ ten, status: tra.status, loi: tra.loi }).toEqual({
						ten,
						status: 400,
						loi: OKR.thongDiep.chuKy.kyDaAn,
					});
				}
				expect(await db.okrCuocSoan.count()).toBe(0);
			} finally {
				await db.okrCycle.update({
					where: { id: CHU_KY_Q4 },
					data: { anLuc: null },
				});
			}
			expect((await sanSang()).bat).toBe(true);
		},
		CHO_DB,
	);

	test(
		"don-vi-thieu-id: phòng ban không kèm departmentId → 400 có tên",
		async () => {
			const tra = await goiSoan(
				app,
				"soanSanSang",
				"trpc",
				{
					cycleId: CHU_KY_Q4,
					level: "phong-ban",
					divisionId: null,
					departmentId: null,
				},
				cTruong,
			);
			expect(tra.status).toBe(400);
			expect(tra.loi).toBe(OKR.thongDiep.soan.donViThieuId);
		},
		CHO_DB,
	);

	test(
		"bo-cuoc-dang: người mở bỏ cuộc đang và mở cuộc mới trong một lần gọi (trpc và rest); cuộc bỏ vẫn đếm vào trần",
		async () => {
			const dau = await mo();
			if (!dau.ok) throw new Error(`mo: ${dau.lyDo}`);
			await tangLuot(db, dau.cuoc.id);
			const moi = await mo({ boCuocDangId: dau.cuoc.id });
			if (!moi.ok) throw new Error(`bo roi mo: ${moi.lyDo}`);
			await tangLuot(db, moi.cuoc.id);
			expect(moi.cuoc.id).not.toBe(dau.cuoc.id);
			expect(moi.cuoc.sessionId).toMatch(CHO_GIU);
			const rest = ok<SoanMoOutput>(
				await goiSoan(
					app,
					"soanMo",
					"rest",
					{ ...vaoDonVi(DON_VI.kdBac, "rest"), boCuocDangId: moi.cuoc.id },
					cTruong,
				),
				"soanMo rest",
			);
			if (!rest.ok) throw new Error(`rest: ${rest.lyDo}`);
			await tangLuot(db, rest.cuoc.id);
			const hang = await db.okrCuocSoan.findMany({
				where: { id: { in: [dau.cuoc.id, moi.cuoc.id, rest.cuoc.id] } },
				select: { id: true, trangThai: true },
			});
			expect(new Map(hang.map((h) => [h.id, h.trangThai]))).toEqual(
				new Map([
					[dau.cuoc.id, "bo"],
					[moi.cuoc.id, "bo"],
					[rest.cuoc.id, "dang"],
				]),
			);
			expect(await sanSang()).toMatchObject({ soCuocDaDung: 3 });
			expect(await mo({ boCuocDangId: rest.cuoc.id })).toEqual({
				ok: false,
				lyDo: "het-cuoc-ky",
				cuocDang: null,
			});
			expect(
				(
					await db.okrCuocSoan.findUniqueOrThrow({
						where: { id: rest.cuoc.id },
						select: { trangThai: true },
					})
				).trangThai,
			).toBe("dang");
		},
		CHO_DB,
	);

	test(
		"bo-cuoc-dang tu choi: sai cuộc, cuộc đã bỏ, cuộc người khác mở (không quản trị), kèm cả thử lại → 400 có tên, không cuộc nào đổi; quản trị bỏ được cuộc của trưởng phòng",
		async () => {
			const cuaQuanTri = await gieoCuoc({
				donVi: DON_VI.kdBac,
				nguoiMo: QUAN_TRI,
			});
			const daBo = await gieoCuoc({ donVi: DON_VI.kdBac, nguoiMo: TRUONG });
			await db.okrCuocSoan.update({
				where: { id: daBo.id },
				data: { trangThai: "bo" },
			});
			const khacDonVi = await gieoCuoc({
				donVi: DON_VI.kdNam,
				nguoiMo: TRUONG,
			});
			for (const [ten, them, loi] of [
				[
					"khong-co",
					{ boCuocDangId: "khong-co" },
					OKR.thongDiep.soan.khongBoDuocCuoc,
				],
				[
					"da-bo",
					{ boCuocDangId: daBo.id },
					OKR.thongDiep.soan.khongBoDuocCuoc,
				],
				[
					"khac-don-vi",
					{ boCuocDangId: khacDonVi.id },
					OKR.thongDiep.soan.khongBoDuocCuoc,
				],
				[
					"nguoi-khac",
					{ boCuocDangId: cuaQuanTri.id },
					OKR.thongDiep.soan.khongBoDuocCuoc,
				],
				[
					"ca-hai",
					{ boCuocDangId: cuaQuanTri.id, thuLaiCuocId: cuaQuanTri.id },
					OKR.thongDiep.soan.thuLaiHayBo,
				],
			] as const) {
				const tra = await goiSoan(
					app,
					"soanMo",
					"trpc",
					{ ...vaoDonVi(DON_VI.kdBac, "trpc"), ...them },
					cTruong,
				);
				expect({ ten, status: tra.status, loi: tra.loi }).toEqual({
					ten,
					status: 400,
					loi,
				});
			}
			const sauTuChoi = await db.okrCuocSoan.findMany({
				where: { cycleId: CHU_KY_Q4 },
				select: { id: true, trangThai: true },
			});
			expect(new Map(sauTuChoi.map((h) => [h.id, h.trangThai]))).toEqual(
				new Map([
					[cuaQuanTri.id, "dang"],
					[daBo.id, "bo"],
					[khacDonVi.id, "dang"],
				]),
			);
			await db.okrCuocSoan.delete({ where: { id: daBo.id } });
			const cuaTruong = await gieoCuoc({
				donVi: DON_VI.kdBac,
				nguoiMo: TRUONG,
			});
			await db.okrCuocSoan.update({
				where: { id: cuaQuanTri.id },
				data: { trangThai: "bo" },
			});
			const quanTri = ok<SoanMoOutput>(
				await goiSoan(
					app,
					"soanMo",
					"trpc",
					{ ...vaoDonVi(DON_VI.kdBac, "trpc"), boCuocDangId: cuaTruong.id },
					cQuanTri,
				),
				"soanMo quan tri",
			);
			expect(quanTri.ok).toBe(true);
			expect(
				(
					await db.okrCuocSoan.findUniqueOrThrow({
						where: { id: cuaTruong.id },
						select: { trangThai: true },
					})
				).trangThai,
			).toBe("bo");
		},
		CHO_DB,
	);

	test(
		"bo-cuoc-dang sai-ma: chính người mở cuộc đang gửi mã cuộc khác (đã bỏ, khác đơn vị) → 400 có tên, cuộc đang không đổi, không mở thêm",
		async () => {
			const dang = await mo();
			if (!dang.ok) throw new Error(`mo: ${dang.lyDo}`);
			const daBo = await gieoCuoc({ donVi: DON_VI.kdBac, nguoiMo: TRUONG });
			await db.okrCuocSoan.update({
				where: { id: daBo.id },
				data: { trangThai: "bo" },
			});
			const khacDonVi = await gieoCuoc({
				donVi: DON_VI.kdNam,
				nguoiMo: TRUONG,
			});
			for (const [ten, boCuocDangId] of [
				["da-bo", daBo.id],
				["khac-don-vi", khacDonVi.id],
			] as const) {
				const tra = await goiSoan(
					app,
					"soanMo",
					"trpc",
					{ ...vaoDonVi(DON_VI.kdBac, "trpc"), boCuocDangId },
					cTruong,
				);
				expect({ ten, status: tra.status, loi: tra.loi }).toEqual({
					ten,
					status: 400,
					loi: OKR.thongDiep.soan.khongBoDuocCuoc,
				});
			}
			const hang = await db.okrCuocSoan.findMany({
				where: { cycleId: CHU_KY_Q4 },
				select: { id: true, trangThai: true },
			});
			expect(new Map(hang.map((h) => [h.id, h.trangThai]))).toEqual(
				new Map([
					[dang.cuoc.id, "dang"],
					[daBo.id, "bo"],
					[khacDonVi.id, "dang"],
				]),
			);
		},
		CHO_DB,
	);

	test(
		"thu-lai: đổi phiên trên cùng cuộc, nối cacPhien; cuộc khác đơn vị → 400; cuộc đã bỏ → 409",
		async () => {
			const dau = await mo();
			if (!dau.ok) throw new Error(`mo: ${dau.lyDo}`);
			const lai = await mo({ thuLaiCuocId: dau.cuoc.id });
			if (!lai.ok) throw new Error(`thu lai: ${lai.lyDo}`);
			expect(lai.cuoc.id).toBe(dau.cuoc.id);
			expect(lai.cuoc.sessionId).toMatch(CHO_GIU);
			expect(lai.cuoc.sessionId).not.toBe(dau.cuoc.sessionId);
			const hang = await db.okrCuocSoan.findUniqueOrThrow({
				where: { id: dau.cuoc.id },
				select: { sessionId: true, cacPhien: true },
			});
			expect(hang.sessionId).toBe(lai.cuoc.sessionId);
			expect(hang.cacPhien).toEqual([dau.cuoc.sessionId, lai.cuoc.sessionId]);
			const khac = await gieoCuoc({ donVi: DON_VI.kdNam, nguoiMo: QUAN_TRI });
			const traKhac = await goiSoan(
				app,
				"soanMo",
				"trpc",
				{ ...vaoDonVi(DON_VI.kdBac, "trpc"), thuLaiCuocId: khac.id },
				cQuanTri,
			);
			expect(traKhac.status).toBe(400);
			expect(traKhac.loi).toBe(OKR.thongDiep.soan.cuocKhacDonVi);
			await db.okrCuocSoan.update({
				where: { id: dau.cuoc.id },
				data: { trangThai: "bo" },
			});
			const traBo = await goiSoan(
				app,
				"soanMo",
				"trpc",
				{ ...vaoDonVi(DON_VI.kdBac, "trpc"), thuLaiCuocId: dau.cuoc.id },
				cTruong,
			);
			expect(traBo.status).toBe(409);
			expect(traBo.loi).toBe(OKR.thongDiep.soan.cuocKhongDang);
		},
		CHO_DB,
	);

	test(
		"don-vi-luu-tru: quản trị hỏi sẵn sàng và mở cho phòng ban hay bộ phận đã lưu trữ → từ chối don-vi-luu-tru, không tạo cuộc; đơn vị sống cùng lúc vẫn mở",
		async () => {
			const boPhanLuuTru = await db.division.create({
				data: {
					name: "Bộ phận đã gộp",
					position: 90,
					archivedAt: new Date(),
				},
			});
			const luuTru = {
				phongBan: {
					level: "phong-ban",
					divisionId: null,
					departmentId: PB("kho-lanh"),
				},
				boPhan: {
					level: "bo-phan",
					divisionId: boPhanLuuTru.id,
					departmentId: null,
				},
			} as const;
			try {
				expect(
					(
						await db.department.findUniqueOrThrow({
							where: { id: PB("kho-lanh") },
							select: { archivedAt: true },
						})
					).archivedAt,
					"bo mau thieu phong ban luu tru",
				).not.toBeNull();
				for (const dv of Object.values(luuTru))
					for (const duong of ["trpc", "rest"] as const) {
						expect(
							ok<SoanSanSangOutput>(
								await goiSoan(
									app,
									"soanSanSang",
									duong,
									vaoDonVi(dv, duong),
									cQuanTri,
								),
								`san sang ${dv.level} ${duong}`,
							),
						).toEqual({ bat: false, lyDo: "don-vi-luu-tru" });
						expect(
							ok<SoanMoOutput>(
								await goiSoan(
									app,
									"soanMo",
									duong,
									vaoDonVi(dv, duong),
									cQuanTri,
								),
								`mo ${dv.level} ${duong}`,
							),
						).toEqual({ ok: false, lyDo: "don-vi-luu-tru", cuocDang: null });
					}
				expect(
					await db.okrCuocSoan.count({
						where: {
							OR: [
								{ departmentId: PB("kho-lanh") },
								{ divisionId: boPhanLuuTru.id },
							],
						},
					}),
				).toBe(0);
				const song = ok<SoanMoOutput>(
					await goiSoan(
						app,
						"soanMo",
						"trpc",
						vaoDonVi(DON_VI.kdNam, "trpc"),
						cQuanTri,
					),
					"mo don vi song",
				);
				expect(song.ok).toBe(true);
			} finally {
				await donSoan();
				await db.division.delete({ where: { id: boPhanLuuTru.id } });
			}
		},
		CHO_DB,
	);

	test(
		"don-vi-luu-tru-cuoc: cuộc đang của phòng ban vừa lưu trữ → đọc bảng, đếm lượt, quyết, đưa vào đều trả don-vi-luu-tru, dòng giữ nguyên; bỏ lưu trữ thì bảng mở lại",
		async () => {
			const cuoc = await gieoCuoc({ donVi: DON_VI.kdNam, nguoiMo: QUAN_TRI });
			const [mt] = await gieoDongNhap(cuoc, [
				{ loai: "muc-tieu-moi", khoa: "m", ten: "Mục tiêu phòng sắp lưu trữ" },
			]);
			const phong = { id: DON_VI.kdNam.departmentId };
			const lyDo = async () => {
				const vao = { cuocSoanId: cuoc.id };
				const tra = await Promise.all([
					goiSoan(app, "soanDanhSach", "trpc", vao, cQuanTri),
					goiSoan(app, "soanTangLuot", "trpc", vao, cQuanTri),
					goiSoan(
						app,
						"soanQuyet",
						"trpc",
						{ deXuatId: mt ?? "", quyet: "bac" },
						cQuanTri,
					),
					goiSoan(
						app,
						"soanDuaVao",
						"trpc",
						{ ...vao, kr: [] } as never,
						cQuanTri,
					),
				]);
				return tra.map((t) =>
					t.status === 200
						? String((t.data as { lyDo?: string | null }).lyDo ?? null)
						: `http ${t.status}`,
				);
			};
			await db.department.update({
				where: phong,
				data: { archivedAt: new Date() },
			});
			let luuTru: string[];
			try {
				luuTru = await lyDo();
			} finally {
				await db.department.update({
					where: phong,
					data: { archivedAt: null },
				});
			}
			const dong = await db.okrDeXuat.findUniqueOrThrow({
				where: { id: mt ?? "" },
				select: { trangThai: true },
			});
			const bang = ok<{ lyDo: string | null }>(
				await goiSoan(
					app,
					"soanDanhSach",
					"trpc",
					{ cuocSoanId: cuoc.id },
					cQuanTri,
				),
				"danh sach sau bo luu tru",
			);
			expect({ luuTru, dong: dong.trangThai, sau: bang.lyDo }).toEqual({
				luuTru: Array(4).fill("don-vi-luu-tru"),
				dong: "cho",
				sau: null,
			});
			await donSoan();
		},
		CHO_DB,
	);

	test(
		"danh-sach-cuoc: người không quản trị không thấy cuộc ẩn; đếm dòng nhận và dòng tổng bỏ bi-loai",
		async () => {
			const thay = await gieoCuoc({ donVi: DON_VI.kdBac, nguoiMo: TRUONG });
			await db.okrCuocSoan.update({
				where: { id: thay.id },
				data: { trangThai: "da-dua-vao" },
			});
			const an = await gieoCuoc({
				donVi: DON_VI.kdBac,
				nguoiMo: QUAN_TRI,
				nac: "an",
			});
			const mtMau = {
				loai: "muc-tieu-moi",
				khoa: "m",
				ten: "Mục tiêu mẫu",
			} as const;
			await gieoDongNhap(thay, [mtMau], "nhan");
			await gieoDongNhap(
				thay,
				[{ ...mtMau, khoa: "m2", ten: "Mục tiêu mẫu hai" }],
				"sua",
			);
			await gieoDongNhap(
				thay,
				[{ ...mtMau, khoa: "m3", ten: "Mục tiêu mẫu ba" }],
				"bac",
			);
			await gieoDongNhap(
				thay,
				[{ ...mtMau, khoa: "m4", ten: "Mục tiêu mẫu bốn" }],
				"bi-loai",
			);
			const vao = vaoDonVi(DON_VI.kdBac, "rest");
			const truong = ok<SoanDanhSachCuocOutput>(
				await goiSoan(app, "soanDanhSachCuoc", "rest", vao, cTruong),
				"danh sach truong",
			);
			expect(truong.tranCuoc).toBe(3);
			expect(truong.cuoc.map((c) => c.id)).toEqual([thay.id]);
			expect(truong.cuoc[0]).toMatchObject({
				trangThai: "da-dua-vao",
				soDongNhan: 2,
				soDongTong: 3,
			});
			const quanTri = ok<SoanDanhSachCuocOutput>(
				await goiSoan(app, "soanDanhSachCuoc", "rest", vao, cQuanTri),
				"danh sach quan tri",
			);
			expect(quanTri.cuoc.map((c) => c.id).sort()).toEqual(
				[thay.id, an.id].sort(),
			);
		},
		CHO_DB,
	);
});
