import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { demOkrCuaDonVi } from "@crm/db/okr-don-vi";
import {
	dieuKienXemMucTieu,
	type NguCanhXem,
	nguCanhXemOkr,
} from "@crm/db/okr-hien-thi";
import { xemDuocMucTieu } from "@crm/validation/okr-hien-thi";
import { ForbiddenException } from "@nestjs/common";
import { xoaBoOkrMau } from "../scripts/okr-mau/nap";
import { OkrAccessService } from "../src/okr/okr-access.service";
import { donSanCanhKr } from "./okr-canh-kr-san";
import {
	gieoHienThi,
	gieoTruongBiLoai,
	MUC_TIEU_SAN,
	type MucTieuSan,
	mucTieuDeXemCua,
	type SanHienThi,
	VAI_XEM,
	type VaiXem,
} from "./okr-hien-thi-san";
import { congTy, lamSachOkr, napMau, nguoiMau } from "./okr-mau-san";
import { dungSan, goi, ok, ungDung } from "./okr-san";

dungSan();

const CHO_GIEO_MS = 180_000;
const CHO_MS = 60_000;
const MOC_MAU = new Date("2026-11-12T15:00:00+07:00");

const KY_VONG_SAN = {
	quanTri: MUC_TIEU_SAN,
	chu: MUC_TIEU_SAN,
	nguoiCaNhan: ["phongBanCongKhai", "caNhanGioiHan"],
	thamGia: ["phongBanCongKhai", "phongBanGioiHan"],
	phuTrachKr: ["phongBanCongKhai", "phongBanGioiHan"],
	nguoiLamViec: ["phongBanCongKhai", "phongBanGioiHan"],
	nguoiXemCoTen: ["phongBanCongKhai", "phongBanGioiHan", "nhapGioiHan"],
	truongPhongBan: ["phongBanCongKhai", "phongBanGioiHan"],
	truongBoPhan: ["phongBanCongKhai", "phongBanGioiHan", "boPhanGioiHan"],
	truongCuaNguoiCaNhan: ["phongBanCongKhai", "caNhanGioiHan", "nhapGioiHan"],
	nguoiNgoai: ["phongBanCongKhai"],
} satisfies Record<VaiXem, readonly MucTieuSan[]>;

const quyenOkr = () => ungDung().get(OkrAccessService);

async function nguCanhApi(userId: string): Promise<NguCanhXem> {
	const svc = quyenOkr();
	return svc.nguCanhXem(await svc.quyen(userId), userId);
}

describe("ma-tran-xem", () => {
	let san: SanHienThi;

	beforeAll(async () => {
		san = await gieoHienThi();
	}, CHO_GIEO_MS);
	afterAll(donSanCanhKr, CHO_MS);

	test(
		"dieuKienXemMucTieu và xemDuocMucTieu khớp bảng viết trước cho 11 người trên 6 mục tiêu",
		async () => {
			const tenCua = new Map(
				MUC_TIEU_SAN.map((ten) => [san.mucTieu[ten], ten]),
			);
			const ten = (id: string) => tenCua.get(id) ?? id;
			const mucTieu = await mucTieuDeXemCua(Object.values(san.mucTieu));
			expect(mucTieu.size).toBe(MUC_TIEU_SAN.length);
			const lech: string[] = [];
			let soSanh = 0;
			for (const vai of VAI_XEM) {
				const userId = san.nguoi[vai].id;
				const nc = await nguCanhApi(userId);
				const [ncDb] = (await nguCanhXemOkr(db, [userId])).values();
				expect({ vai, nc: ncDb }).toEqual({ vai, nc });
				const quaDieuKien = (
					await db.okrObjective.findMany({
						where: { AND: [{ cycleId: san.ky }, dieuKienXemMucTieu(nc)] },
						select: { id: true },
					})
				)
					.map((r) => ten(r.id))
					.sort();
				const quaHam = [...mucTieu]
					.filter(([, mt]) => xemDuocMucTieu(nc, mt))
					.map(([id]) => ten(id))
					.sort();
				const choSan = [...KY_VONG_SAN[vai]].sort();
				soSanh += 1;
				const thieu = quaHam.filter((id) => !quaDieuKien.includes(id));
				const thua = quaDieuKien.filter((id) => !quaHam.includes(id));
				if (thieu.length > 0 || thua.length > 0)
					lech.push(
						`${vai}: dieuKienXemMucTieu thiếu [${thieu.join(", ")}], thừa [${thua.join(", ")}]`,
					);
				if (quaHam.join() !== choSan.join())
					lech.push(
						`${vai}: xemDuocMucTieu [${quaHam.join(", ")}], bảng khai [${choSan.join(", ")}]`,
					);
			}
			console.log(`ma-tran-xem: ${soSanh} so sánh tập trên kho gieo`);
			expect(soSanh).toBe(VAI_XEM.length);
			expect(lech).toEqual([]);
		},
		CHO_MS,
	);

	test(
		"trưởng không hiệu lực: chuyển đi, rời workspace, đơn vị lưu trữ — hai bên khớp nhau và khớp bảng khai",
		async () => {
			const { donVi, nguoi } = await gieoTruongBiLoai();
			const trong = (userId: string): NguCanhXem => ({
				userId,
				quanTri: false,
				boPhanTruong: [],
				phongBanTruong: [],
				phongBanDuoiBoPhanTruong: [],
				nguoiDuoiQuyen: [],
			});
			const kyVong = [
				trong(nguoi.daChuyenDi),
				{ ...trong(nguoi.truongQuaPhu), phongBanTruong: [donVi.pbPhu] },
				trong(nguoi.truongPbLuu),
				trong(nguoi.truongBpLuu),
				trong(nguoi.truongBpLuuCoCon),
				{
					...trong(nguoi.truongPbDuoiBpLuu),
					phongBanTruong: [donVi.pbDuoiBpLuu],
					nguoiDuoiQuyen: [
						nguoi.nguoiPbDuoiBpLuu,
						nguoi.truongPbDuoiBpLuu,
					].sort(),
				},
				trong(nguoi.nguoiPbDuoiBpLuu),
			];
			const tuDb = await nguCanhXemOkr(db, [
				...kyVong.map((k) => k.userId),
				nguoi.daRoiWorkspace,
			]);
			const lech: string[] = [];
			let soSanh = 0;
			for (const cho of kyVong) {
				const api = await nguCanhApi(cho.userId);
				const moi = tuDb.get(cho.userId);
				soSanh += 1;
				if (JSON.stringify(api) !== JSON.stringify(cho))
					lech.push(`quyen ${cho.userId}: ${JSON.stringify(api)}`);
				if (JSON.stringify(moi) !== JSON.stringify(cho))
					lech.push(`nguCanhXemOkr ${cho.userId}: ${JSON.stringify(moi)}`);
			}
			if (
				JSON.stringify(tuDb.get(nguoi.daRoiWorkspace)) !==
				JSON.stringify(trong(nguoi.daRoiWorkspace))
			)
				lech.push(
					`nguCanhXemOkr ${nguoi.daRoiWorkspace}: ${JSON.stringify(tuDb.get(nguoi.daRoiWorkspace))}`,
				);
			console.log(
				`trưởng không hiệu lực: ${soSanh} người so ba chiều, thêm người rời workspace`,
			);
			expect(soSanh).toBe(7);
			await expect(nguCanhApi(nguoi.daRoiWorkspace)).rejects.toBeInstanceOf(
				ForbiddenException,
			);
			expect(lech).toEqual([]);
		},
		CHO_GIEO_MS,
	);

	test(
		"bộ OKR mẫu: tập trưởng của nguCanhXemOkr khớp OkrAccessService.quyen với mọi người mẫu",
		async () => {
			await lamSachOkr();
			await napMau(MOC_MAU);
			try {
				const ids = congTy().nguoi.map((n) => nguoiMau(n.ma));
				const tuDb = await nguCanhXemOkr(db, ids);
				const lech: string[] = [];
				let soSanh = 0;
				let soTruongBoPhan = 0;
				let soTruongPhongBan = 0;
				for (const id of ids) {
					const q = await quyenOkr().quyen(id);
					const apiTruong = {
						boPhan: [...q.truongBoPhan].sort(),
						phongBan: [...q.truongPhongBan].sort(),
					};
					const nc = tuDb.get(id);
					const dbTruong = {
						boPhan: nc?.boPhanTruong ?? [],
						phongBan: nc?.phongBanTruong ?? [],
					};
					soSanh += 1;
					soTruongBoPhan += apiTruong.boPhan.length;
					soTruongPhongBan += apiTruong.phongBan.length;
					if (JSON.stringify(apiTruong) !== JSON.stringify(dbTruong))
						lech.push(
							`${id}: quyen ${JSON.stringify(apiTruong)}, nguCanhXemOkr ${JSON.stringify(dbTruong)}`,
						);
					const ncApi = quyenOkr().nguCanhXem(q, id);
					if (JSON.stringify(ncApi) !== JSON.stringify(nc))
						lech.push(`${id}: ngữ cảnh đầy đủ lệch`);
				}
				console.log(
					`bộ mẫu: ${soSanh} so sánh tập trưởng, ${soTruongBoPhan} trưởng bộ phận, ${soTruongPhongBan} trưởng phòng ban`,
				);
				expect(soSanh).toBe(congTy().nguoi.length);
				expect({ boPhan: soTruongBoPhan, phongBan: soTruongPhongBan }).toEqual({
					boPhan: congTy().boPhan.length,
					phongBan: congTy().phongBan.length,
				});
				expect(lech).toEqual([]);
			} finally {
				await xoaBoOkrMau(db);
			}
		},
		CHO_MS,
	);
});

describe("dem-don-vi", () => {
	let san: SanHienThi;

	beforeAll(async () => {
		san = await gieoHienThi();
	}, CHO_GIEO_MS);
	afterAll(donSanCanhKr, CHO_MS);

	test(
		"demOkrCuaDonVi đếm mục tiêu mở và lịch sử theo đơn vị",
		async () => {
			const dem = await Promise.all([
				demOkrCuaDonVi(db, { departmentId: san.p1 }),
				demOkrCuaDonVi(db, { departmentId: san.p2 }),
				demOkrCuaDonVi(db, { divisionId: san.b1 }),
				demOkrCuaDonVi(db, {}),
			]);
			expect(dem).toEqual([
				{ mo: 2, lichSu: 2 },
				{ mo: 1, lichSu: 1 },
				{ mo: 1, lichSu: 1 },
				{ mo: 0, lichSu: 0 },
			]);
			ok(
				await goi(
					"okr.dropObjective",
					{ id: san.mucTieu.phongBanCongKhai },
					san.nguoi.truongPhongBan.cookie,
				),
				"bo muc tieu cong khai",
			);
			const theoPha = async (phase: string) => {
				await db.okrCycle.update({ where: { id: san.ky }, data: { phase } });
				return Promise.all([
					demOkrCuaDonVi(db, { departmentId: san.p1 }),
					demOkrCuaDonVi(db, { divisionId: san.b1 }),
				]);
			};
			expect({
				chamDiem: await theoPha("cham-diem"),
				daDong: await theoPha("da-dong"),
			}).toEqual({
				chamDiem: [
					{ mo: 1, lichSu: 2 },
					{ mo: 1, lichSu: 1 },
				],
				daDong: [
					{ mo: 0, lichSu: 2 },
					{ mo: 0, lichSu: 1 },
				],
			});
		},
		CHO_MS,
	);
});
