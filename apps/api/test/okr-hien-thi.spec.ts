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
import { OKR } from "../src/okr/okr-config";
import type {
	HopTuanOutput,
	SucKhoeOutput,
	ToanCanhOutput,
} from "../src/okr/okr-xem.contracts";
import { donSanCanhKr } from "./okr-canh-kr-san";
import {
	gieoHienThi,
	gieoSoGop,
	gieoTruongBiLoai,
	MUC_TIEU_SAN,
	type MucTieuSan,
	mucTieuDeXemCua,
	type SanHienThi,
	type SanSoGop,
	VAI_XEM,
	type VaiXem,
} from "./okr-hien-thi-san";
import { donSanKhep, sangPha } from "./okr-khep-san";
import { congTy, lamSachOkr, napMau, nguoiMau } from "./okr-mau-san";
import { datViTri, doc, dungSan, goi, goiQuery, ok, ungDung } from "./okr-san";

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

const SO_GOP_VIET_TRUOC = {
	toanCanh: { soMucTieu: 2, tienDo: 30 },
	hopTuan: { tongKr: 2, soKr: 2 },
	countByUnit: 2,
	sucKhoe: { tongKr: 2 },
} as const;

describe("so-gop", () => {
	let s: SanSoGop;

	beforeAll(async () => {
		s = await gieoSoGop();
	}, CHO_GIEO_MS);
	afterAll(async () => {
		await donSanKhep();
		await donSanCanhKr();
	}, CHO_MS);

	test(
		"số gộp bỏ mục tiêu giới hạn với mọi người: T xem được G và M không xem được thấy cùng số viết trước",
		async () => {
			const soCua = async (cookie: string) => {
				const tc = await doc<ToanCanhOutput>("okr.toanCanh", cookie, {
					cycleId: s.ky,
				});
				const hang = tc.hang.find((h) => h.key === `pb:${s.p1}`);
				const ht = await doc<HopTuanOutput>("okr.hopTuan", cookie, {
					cycleId: s.ky,
					unit: { loai: "pb", id: s.p1 },
				});
				const krHop = [...ht.dangBan, ...ht.conLai]
					.map((d) => d.keyResultId)
					.sort();
				const dem = await doc<Record<string, number>>(
					"okr.countByUnit",
					cookie,
					{ cycleId: s.ky },
				);
				return {
					toanCanh: { soMucTieu: hang?.soMucTieu, tienDo: hang?.tienDo },
					hopTuan: { tongKr: ht.tongKr, soKr: krHop.length },
					krHop,
					countByUnit: dem[`pb:${s.p1}`],
				};
			};
			const t = await soCua(s.t.cookie);
			const m = await soCua(s.m.cookie);
			const sk = await doc<SucKhoeOutput>("okr.sucKhoe", "quan", {
				cycleId: s.ky,
			});
			const skP1 = sk.hang.find((h) => h.key === `pb:${s.p1}`);
			console.log(
				`so-gop T: ${JSON.stringify(t)}\nso-gop M: ${JSON.stringify(m)}\nsucKhoe quản trị P1: ${skP1?.tongKr}`,
			);
			expect(m).toEqual(t);
			expect({
				toanCanh: t.toanCanh,
				hopTuan: t.hopTuan,
				countByUnit: t.countByUnit,
				sucKhoe: { tongKr: skP1?.tongKr },
			}).toEqual(SO_GOP_VIET_TRUOC);
			expect(t.krHop).toEqual([s.kr.c1, s.kr.c2].sort());
		},
		CHO_MS,
	);

	test(
		"căn chỉnh: G không là đích với cả T; C1 → G và G → mục tiêu bộ phận 400 câu ghim, không hàng nào",
		async () => {
			const dich = await doc<{ targets: { objectiveId: string }[] }>(
				"okr.alignmentTargets",
				s.t.cookie,
				{ objectiveId: s.mucTieu.cn },
			);
			const dichIds = [...new Set(dich.targets.map((d) => d.objectiveId))];
			expect({
				coC1: dichIds.includes(s.mucTieu.c1),
				coG: dichIds.includes(s.mucTieu.g),
			}).toEqual({ coC1: true, coG: false });
			const ghi = async (objectiveId: string, targetObjectiveId: string) => {
				const tra = await goi(
					"okr.addAlignment",
					{ objectiveId, targetObjectiveId, targetKeyResultId: null },
					s.t.cookie,
				);
				return `${tra.status} ${tra.loi}`;
			};
			const cau = `400 ${OKR.thongDiep.canChinh.gioiHanKhongCanChinh}`;
			expect({
				c1VaoG: await ghi(s.mucTieu.c1, s.mucTieu.g),
				gVaoBp: await ghi(s.mucTieu.g, s.mucTieu.bp),
			}).toEqual({ c1VaoG: cau, gVaoBp: cau });
			expect(
				await db.okrAlignment.count({
					where: { objectiveId: { in: [s.mucTieu.c1, s.mucTieu.g] } },
				}),
			).toBe(0);
		},
		CHO_MS,
	);

	test(
		"danh sách: byUnit, mine, danhSach, bangCham, xuatKy — T có G, M không có G, tổng của M kém T đúng một",
		async () => {
			const ids = (xs: { id: string }[]) => xs.map((x) => x.id).sort();
			const cua = async (cookie: string) => ({
				byUnit: ids(
					(
						await doc<{ objectives: { id: string }[] }>("okr.byUnit", cookie, {
							cycleId: s.ky,
							unit: { loai: "pb", id: s.p1 },
						})
					).objectives,
				),
				mine: ids(
					(
						await doc<{ objectives: { id: string }[] }>("okr.mine", cookie, {
							cycleId: s.ky,
						})
					).objectives,
				).filter((x) => x !== s.mucTieu.cn),
				danhSach: await doc<{ rows: { id: string }[]; total: number }>(
					"okr.danhSach",
					cookie,
					{
						cycleId: s.ky,
						unit: { loai: "pb", id: s.p1 },
						loc: { phuTrach: [], loai: [], trangThai: [], tuTin: [] },
					},
				),
			});
			const t = await cua(s.t.cookie);
			const m = await cua(s.m.cookie);
			const { g, c1, c2 } = s.mucTieu;
			const ba = [g, c1, c2].sort();
			const hai = [c1, c2].sort();
			console.log(
				`danh sách: danhSach total T ${t.danhSach.total}, M ${m.danhSach.total}`,
			);
			expect({
				byUnit: [t.byUnit, m.byUnit],
				mine: [t.mine, m.mine],
				danhSach: [ids(t.danhSach.rows), ids(m.danhSach.rows)],
				total: [t.danhSach.total, m.danhSach.total],
			}).toEqual({
				byUnit: [ba, hai],
				mine: [ba, hai],
				danhSach: [ba, hai],
				total: [3, 2],
			});
			ok(await sangPha(s.ky, "cham-diem"), "sang cham diem");
			const bang = async (cookie: string) =>
				ids(
					(
						await doc<{ mucTieu: { id: string }[] }>("okr.bangCham", cookie, {
							cycleId: s.ky,
						})
					).mucTieu,
				).filter((x) => ba.includes(x));
			const bangT = await bang(s.t.cookie);
			const bangM = await bang(s.m.cookie);
			ok(await sangPha(s.ky, "da-dong"), "sang da dong");
			const csv = async (cookie: string) =>
				(
					await doc<{ noiDung: string }>("okr.xuatKy", cookie, {
						cycleId: s.ky,
					})
				).noiDung;
			const csvT = await csv(s.t.cookie);
			const csvM = await csv(s.m.cookie);
			expect({
				bangCham: [bangT, bangM],
				xuatKyCoG: [csvT.includes(s.tieuDe.g), csvM.includes(s.tieuDe.g)],
				xuatKyCoC1: [csvT.includes(s.tieuDe.c1), csvM.includes(s.tieuDe.c1)],
			}).toEqual({
				bangCham: [ba, hai],
				xuatKyCoG: [true, false],
				xuatKyCoC1: [true, true],
			});
		},
		CHO_GIEO_MS,
	);
});

describe("xem-theo-ma", () => {
	let san: SanHienThi;

	beforeAll(async () => {
		san = await gieoHienThi();
	}, CHO_GIEO_MS);
	afterAll(donSanCanhKr, CHO_MS);

	const khongCo = async (cookie: string) =>
		(await goiQuery("okr.objective", cookie, { id: "khong-co-ma-nay" })).loi;

	test(
		"bỏ người xem có tên X: objective(G) bởi X từ 200 sang 404 cùng câu với mã không có",
		async () => {
			const g = san.mucTieu.phongBanGioiHan;
			const x = san.nguoi.nguoiXemCoTen;
			const truoc = await goiQuery("okr.objective", x.cookie, { id: g });
			await db.okrNguoiXem.deleteMany({ where: { objectiveId: g } });
			const sau = await goiQuery("okr.objective", x.cookie, { id: g });
			expect({
				truoc: truoc.status,
				sau: `${sau.status} ${sau.loi}`,
			}).toEqual({
				truoc: 200,
				sau: `404 ${await khongCo(x.cookie)}`,
			});
			expect(sau.loi).toBe(OKR.thongDiep.khongThayMucTieu);
		},
		CHO_MS,
	);

	test(
		"mục tiêu cá nhân giới hạn: người đổi phòng ban chính — trưởng mới thấy, trưởng cũ 404",
		async () => {
			const mt = san.mucTieu.caNhanGioiHan;
			const cu = san.nguoi.truongCuaNguoiCaNhan;
			const moi = san.nguoi.truongPhongBan;
			const trangThai = async () => ({
				cu: (await goiQuery("okr.objective", cu.cookie, { id: mt })).status,
				moi: (await goiQuery("okr.objective", moi.cookie, { id: mt })).status,
			});
			const truoc = await trangThai();
			ok(await datViTri(san.nguoi.nguoiCaNhan.id, san.p1), "doi phong ban");
			const sau = await trangThai();
			expect({ truoc, sau }).toEqual({
				truoc: { cu: 200, moi: 404 },
				sau: { cu: 404, moi: 200 },
			});
		},
		CHO_MS,
	);
});
