import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { API_KEY_HEADER, auth } from "@crm/auth";
import { db } from "@crm/db";
import { demOkrCuaDonVi } from "@crm/db/okr-don-vi";
import {
	dieuKienXemMucTieu,
	type NguCanhXem,
	nguCanhXemOkr,
} from "@crm/db/okr-hien-thi";
import { KHONG_XEM_DUOC, xepViecTroLy } from "@crm/db/okr-tro-ly";
import {
	LOI_KHUON_HIEN_THI,
	xemDuocMucTieu,
} from "@crm/validation/okr-hien-thi";
import { parseOkrVet } from "@crm/validation/okr-vet";
import { ForbiddenException } from "@nestjs/common";
import request from "supertest";
import { xoaBoOkrMau } from "../scripts/okr-mau/nap";
import { OkrAccessService } from "../src/okr/okr-access.service";
import { OKR } from "../src/okr/okr-config";
import type {
	HopTuanOutput,
	SucKhoeOutput,
	ToanCanhOutput,
} from "../src/okr/okr-xem.contracts";
import { donSanCanhKr, roiKhoi, vaoLai } from "./okr-canh-kr-san";
import {
	type AnhHienThi,
	anhHienThi,
	datMuc,
	gieoGhiKe,
	gieoHienThi,
	gieoHienThiGhi,
	gieoSoGop,
	gieoTruongBiLoai,
	MUC_TIEU_SAN,
	type MucTieuSan,
	mucTieuDeXemCua,
	mucTieuPhongBan,
	type SanGhiKe,
	type SanHienThi,
	type SanHienThiGhi,
	type SanSoGop,
	VAI_XEM,
	type VaiXem,
} from "./okr-hien-thi-san";
import { donSanKhep, gieoKyQuy, sangPha } from "./okr-khep-san";
import { congTy, lamSachOkr, napMau, nguoiMau } from "./okr-mau-san";
import {
	datViTri,
	doc,
	dungSan,
	goi,
	goiQuery,
	type Json,
	ma,
	ok,
	phienCua,
	TIEN_TO,
	type TraLoi,
	ungDung,
} from "./okr-san";

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
	sucKhoe: { tongKr: 2 },
} as const;

const DEM_DON_VI_THEO_NGUOI_XEM = { t: 3, m: 2 } as const;

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
			const { countByUnit: demT, ...gopT } = t;
			const { countByUnit: demM, ...gopM } = m;
			expect(gopM).toEqual(gopT);
			expect({ t: demT, m: demM }).toEqual(DEM_DON_VI_THEO_NGUOI_XEM);
			expect({
				toanCanh: t.toanCanh,
				hopTuan: t.hopTuan,
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
			const chuaCanChinh = async (thuTuc: string) =>
				(
					await doc<{ chuaCanChinh: { objectiveId: string }[] }>(
						thuTuc,
						s.t.cookie,
						{ cycleId: s.ky },
					)
				).chuaCanChinh.map((n) => n.objectiveId);
			const cay = await chuaCanChinh("okr.cayCanChinh");
			const cayGoc = await chuaCanChinh("okr.alignmentTree");
			expect({
				cay: {
					coG: cay.includes(s.mucTieu.g),
					coC1: cay.includes(s.mucTieu.c1),
				},
				cayGoc: {
					coG: cayGoc.includes(s.mucTieu.g),
					coC1: cayGoc.includes(s.mucTieu.c1),
				},
			}).toEqual({
				cay: { coG: false, coC1: true },
				cayGoc: { coG: false, coC1: true },
			});
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
					await doc<{
						objectives: { id: string }[];
						dangTheoDoi: { id: string }[];
					}>("okr.mine", cookie, { cycleId: s.ky }).then((r) => [
						...r.objectives,
						...r.dangTheoDoi,
					]),
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

const KY_KE = { tu: "2027-01-01", den: "2027-03-31" } as const;

async function denChamDiem(ky: string): Promise<void> {
	const c = await db.okrCycle.findUniqueOrThrow({
		where: { id: ky },
		select: { phase: true },
	});
	if (c.phase === "dang-chay") ok(await sangPha(ky, "cham-diem"), "cham diem");
}

describe("hien-thi-ghi", () => {
	let s: SanHienThiGhi;

	beforeAll(async () => {
		s = await gieoHienThiGhi();
	}, CHO_GIEO_MS);
	afterAll(async () => {
		setSystemTime();
		await donSanKhep();
		await donSanCanhKr();
	}, CHO_MS);

	test(
		"đặt giới hạn hai người xem, đổi người xem, đặt lại công khai: bảng và vết đúng từng bước",
		async () => {
			const { g, t, x, y, z } = s;
			const cap = (a: string, b: string) => [a, b].sort();
			const buoc = [
				{ hienThi: "gioi-han", nguoiXem: [x.id, y.id] },
				{ hienThi: "gioi-han", nguoiXem: [y.id, z.id] },
				{ hienThi: "cong-khai", nguoiXem: [] },
			];
			const ket: { tra: unknown; bang: AnhHienThi }[] = [];
			let docX: TraLoi | null = null;
			let docT: TraLoi | null = null;
			for (const [i, b] of buoc.entries()) {
				const tra = ok<unknown>(
					await datMuc(g, b.hienThi, b.nguoiXem, t.cookie),
					`buoc ${i + 1}`,
				);
				ket.push({ tra, bang: await anhHienThi(g) });
				if (i === 0) {
					docX = await goiQuery("okr.objective", x.cookie, { id: g });
					docT = await goiQuery("okr.objective", t.cookie, { id: g });
				}
			}
			expect(ket.map((k) => ({ ...k, bang: { ...k.bang, vet: 0 } }))).toEqual([
				{
					tra: { id: g, hienThi: "gioi-han", nguoiXem: cap(x.id, y.id) },
					bang: { hienThi: "gioi-han", nguoiXem: cap(x.id, y.id), vet: 0 },
				},
				{
					tra: { id: g, hienThi: "gioi-han", nguoiXem: cap(y.id, z.id) },
					bang: { hienThi: "gioi-han", nguoiXem: cap(y.id, z.id), vet: 0 },
				},
				{
					tra: { id: g, hienThi: "cong-khai", nguoiXem: [] },
					bang: { hienThi: "cong-khai", nguoiXem: [], vet: 0 },
				},
			]);
			const vet = await db.okrTrail.findMany({
				where: { objectiveId: g, action: "doi-hien-thi" },
				orderBy: [{ at: "asc" }, { id: "asc" }],
			});
			expect(
				vet.map((v) => ({
					actor: v.actorUserId,
					before: parseOkrVet(v.before),
					after: parseOkrVet(v.after),
				})),
			).toEqual([
				{
					actor: t.id,
					before: { hienThi: "cong-khai", nguoiXem: [] },
					after: { hienThi: "gioi-han", nguoiXem: cap(x.id, y.id) },
				},
				{
					actor: t.id,
					before: { hienThi: "gioi-han", nguoiXem: cap(x.id, y.id) },
					after: { hienThi: "gioi-han", nguoiXem: cap(y.id, z.id) },
				},
				{
					actor: t.id,
					before: { hienThi: "gioi-han", nguoiXem: cap(y.id, z.id) },
					after: { hienThi: "cong-khai", nguoiXem: [] },
				},
			]);
			const doc = (tra: TraLoi | null) =>
				tra?.data as
					| {
							hienThi: string;
							nguoiXem: { id: string }[];
							quyen: { datHienThi: boolean };
					  }
					| undefined;
			expect({
				x: {
					status: docX?.status,
					hienThi: doc(docX)?.hienThi,
					nguoiXem: doc(docX)
						?.nguoiXem.map((n) => n.id)
						.sort(),
					datHienThi: doc(docX)?.quyen.datHienThi,
				},
				t: { status: docT?.status, datHienThi: doc(docT)?.quyen.datHienThi },
			}).toEqual({
				x: {
					status: 200,
					hienThi: "gioi-han",
					nguoiXem: cap(x.id, y.id),
					datHienThi: false,
				},
				t: { status: 200, datHienThi: true },
			});
		},
		CHO_MS,
	);

	test(
		"tạo mục tiêu với mức giới hạn: hàng tạo đã mang gioi-han",
		async () => {
			const tra = ok<{ id: string }>(
				await goi(
					"okr.createObjective",
					{
						cycleId: s.ky,
						unit: { level: "phong-ban", departmentId: s.p1 },
						title: ma("hg tao gioi han"),
						kind: "cam-ket",
						ownerUserId: s.t.id,
						participantIds: [],
						whyNow: "",
						hienThi: "gioi-han",
					},
					s.t.cookie,
				),
				"tao gioi han",
			);
			const hang = await db.okrObjective.findUniqueOrThrow({
				where: { id: tra.id },
				select: { hienThi: true },
			});
			const tao = await db.okrTrail.findFirstOrThrow({
				where: { objectiveId: tra.id, action: "tao" },
			});
			expect({
				hang: hang.hienThi,
				vet: parseOkrVet(tao.after)?.hienThi,
				m: (await goiQuery("okr.objective", s.m.cookie, { id: tra.id })).status,
			}).toEqual({ hang: "gioi-han", vet: "gioi-han", m: 404 });
		},
		CHO_MS,
	);

	test(
		"người xem có tên bị gỡ khỏi không gian làm việc rồi vào lại: vẫn trong danh sách và thấy lại mục tiêu",
		async () => {
			const g3 = (await mucTieuPhongBan(s.ky, s.p1, s.t, "hg G3", null)).id;
			ok(await datMuc(g3, "gioi-han", [s.z.id], s.t.cookie), "G3 gioi han");
			const xem = async (cookie: string) =>
				(await goiQuery("okr.objective", cookie, { id: g3 })).status;
			const truoc = await xem(s.z.cookie);
			await roiKhoi(s.z.id);
			const khiRoi = (await anhHienThi(g3)).nguoiXem;
			await vaoLai(s.z.id);
			const cookieMoi = await phienCua(s.z.id);
			const sau = await xem(cookieMoi);
			const docT = await doc<{ nguoiXem: { id: string }[] }>(
				"okr.objective",
				s.t.cookie,
				{ id: g3 },
			);
			expect({
				truoc,
				khiRoi,
				sau,
				nguoiXemSau: (await anhHienThi(g3)).nguoiXem,
				trenKhung: docT.nguoiXem.map((n) => n.id),
				m: await xem(s.m.cookie),
			}).toEqual({
				truoc: 200,
				khiRoi: [s.z.id],
				sau: 200,
				nguoiXemSau: [s.z.id],
				trenKhung: [s.z.id],
				m: 404,
			});
		},
		CHO_MS,
	);

	test(
		"bảng từ chối viết trước: 7 ca, mỗi ca câu ghim, bảng người xem, mức và vết không đổi",
		async () => {
			const { g, gc, t, m, x, k } = s;
			const noi: string[] = [];
			const gcCongKhai = async () => {
				if ((await anhHienThi(gc.id)).hienThi !== "cong-khai")
					ok(
						await datMuc(gc.id, "cong-khai", [], t.cookie),
						"tra Gc cong khai",
					);
			};
			const canChinh = async (
				vao: Json,
				ai: string,
				nhan: string,
			): Promise<string> => {
				const id = ok<{ id: string }>(
					await goi("okr.addAlignment", vao, ai),
					nhan,
				).id;
				noi.push(id);
				return id;
			};
			const hai = [x.id, ...Array.from({ length: 20 }, () => ma("hg-x"))];
			type Ca = {
				ten: string;
				mt: string;
				vao: [string, string[]];
				ai: string;
				cho: string;
				truoc?: () => Promise<void>;
				sau?: () => Promise<void>;
			};
			const CA: Ca[] = [
				{
					ten: "M khong sua duoc G",
					mt: g,
					vao: ["gioi-han", [x.id]],
					ai: m.cookie,
					cho: `403 ${OKR.thongDiep.khongSuaDuocDonVi}`,
				},
				{
					ten: "nguoi xem khong phai thanh vien",
					mt: g,
					vao: ["gioi-han", [x.id, s.ngoai]],
					ai: t.cookie,
					cho: `400 ${OKR.thongDiep.hienThi.nguoiXemKhongConThanhVien}`,
				},
				{
					ten: "21 nguoi xem",
					mt: g,
					vao: ["gioi-han", hai],
					ai: t.cookie,
					cho: `400 ${LOI_KHUON_HIEN_THI.quaNguoiXem}`,
				},
				{
					ten: "can chinh di va toi",
					mt: gc.id,
					vao: ["gioi-han", []],
					ai: t.cookie,
					cho: `400 ${OKR.thongDiep.hienThi.conCanChinh(2)}`,
					truoc: async () => {
						await canChinh(
							{
								objectiveId: gc.id,
								targetObjectiveId: s.bp,
								targetKeyResultId: null,
							},
							t.cookie,
							"Gc vao BP",
						);
						await canChinh(
							{
								objectiveId: s.cn1,
								targetObjectiveId: gc.id,
								targetKeyResultId: null,
							},
							k.cookie,
							"CN1 vao Gc",
						);
					},
					sau: async () => {
						await gcCongKhai();
						ok(
							await goi("okr.removeAlignment", { id: noi[0] }, t.cookie),
							"go Gc vao BP",
						);
						ok(
							await goi("okr.removeAlignment", { id: noi[1] }, k.cookie),
							"go CN1 vao Gc",
						);
					},
				},
				{
					ten: "chi can chinh toi KR cua Gc",
					mt: gc.id,
					vao: ["gioi-han", []],
					ai: t.cookie,
					cho: `400 ${OKR.thongDiep.hienThi.conCanChinh(1)}`,
					truoc: async () => {
						await gcCongKhai();
						await canChinh(
							{
								objectiveId: s.cn2,
								targetObjectiveId: null,
								targetKeyResultId: gc.kr,
							},
							k.cookie,
							"CN2 vao KR Gc",
						);
					},
				},
				{
					ten: "G dang cho duyet",
					mt: g,
					vao: ["gioi-han", [x.id]],
					ai: t.cookie,
					cho: `400 ${OKR.thongDiep.dangChoDuyet}`,
					truoc: async () => {
						await db.okrObjective.update({
							where: { id: g },
							data: { status: "cho-duyet" },
						});
					},
					sau: async () => {
						await db.okrObjective.update({
							where: { id: g },
							data: { status: "nhap" },
						});
					},
				},
				{
					ten: "G da bo",
					mt: g,
					vao: ["gioi-han", [x.id]],
					ai: t.cookie,
					cho: `400 ${OKR.thongDiep.daBo}`,
					truoc: async () => {
						await db.okrObjective.update({
							where: { id: g },
							data: { status: "da-bo" },
						});
					},
					sau: async () => {
						await db.okrObjective.update({
							where: { id: g },
							data: { status: "nhap" },
						});
					},
				},
				{
					ten: "chu ky cham diem",
					mt: g,
					vao: ["gioi-han", [x.id]],
					ai: t.cookie,
					cho: `400 ${OKR.thongDiep.kyDaKhoa}`,
					truoc: () => denChamDiem(s.ky),
				},
			];
			const ket: Record<string, { tra: string; bang: AnhHienThi }> = {};
			const cho: Record<string, { tra: string; bang: AnhHienThi }> = {};
			for (const ca of CA) {
				await ca.truoc?.();
				const truoc = await anhHienThi(ca.mt);
				const tra = await datMuc(ca.mt, ca.vao[0], ca.vao[1], ca.ai);
				ket[ca.ten] = {
					tra: `${tra.status} ${tra.loi}`,
					bang: await anhHienThi(ca.mt),
				};
				cho[ca.ten] = { tra: ca.cho, bang: truoc };
				await ca.sau?.();
			}
			console.log(
				`hien-thi-ghi bang tu choi: ${CA.length} ca\n${CA.map((ca) => `${ca.ten}: ${ket[ca.ten]?.tra}`).join("\n")}`,
			);
			expect(CA.length).toBe(8);
			expect(ket).toEqual(cho);
		},
		CHO_GIEO_MS,
	);

	test(
		"mang sang G2 giới hạn: bản nháp giới hạn với người xem cũ trừ người đã rời; M không thấy bản nháp",
		async () => {
			await denChamDiem(s.ky);
			const ke = await gieoKyQuy({ ...KY_KE, pha: "lap-ke-hoach" });
			await roiKhoi(s.y.id);
			const ra = ok<{ id: string; cycleId: string }>(
				await goi("okr.mangSang", { objectiveId: s.g2 }, s.t.cookie),
				"mang sang G2",
			);
			const byUnit = async (cookie: string) =>
				(
					await doc<{ objectives: { id: string }[] }>("okr.byUnit", cookie, {
						cycleId: ke,
						unit: { loai: "pb", id: s.p1 },
					})
				).objectives.some((o) => o.id === ra.id);
			const { vet: _vet, ...nhap } = await anhHienThi(ra.id);
			expect({
				cycleId: ra.cycleId,
				nhap,
				t: await byUnit(s.t.cookie),
				m: await byUnit(s.m.cookie),
			}).toEqual({
				cycleId: ke,
				nhap: { hienThi: "gioi-han", nguoiXem: [s.x.id] },
				t: true,
				m: false,
			});
		},
		CHO_GIEO_MS,
	);
});

describe("ghi-ke", () => {
	let s: SanGhiKe;

	beforeAll(async () => {
		s = await gieoGhiKe();
	}, CHO_GIEO_MS);
	afterAll(async () => {
		setSystemTime();
		await db.agentTask.deleteMany({
			where: {
				kind: "okr-de-xuat",
				payload: { path: ["objectiveId"], equals: s.g },
			},
		});
		await db.okrFollow.deleteMany({ where: { objectiveId: s.g } });
		await donSanKhep();
		await donSanCanhKr();
	}, CHO_MS);

	const demHang = async () => ({
		okrFollow: await db.okrFollow.count({ where: { objectiveId: s.g } }),
		okrComment: await db.okrComment.count({ where: { objectiveId: s.g } }),
		okrGhiNhan: await db.okrGhiNhan.count({ where: { objectiveId: s.g } }),
		okrObjective: await db.okrObjective.count({
			where: { cycle: { name: { startsWith: TIEN_TO } } },
		}),
		okrSoChup: await db.okrSoChup.count({ where: { keyResultId: s.krG } }),
		agentTask: await db.agentTask.count({ where: { kind: "okr-de-xuat" } }),
	});

	test(
		"người xem được A: nhắc tên M và ghi nhận tới M bị từ chối nêu tên M; nhắc B và ghi nhận tới B được",
		async () => {
			const tenM = (
				await db.user.findUniqueOrThrow({
					where: { id: s.m.id },
					select: { name: true },
				})
			).name;
			const truoc = await demHang();
			const nhacM = await goi(
				"okr.addComment",
				{ objectiveId: s.g, body: "Nhờ xem giúp", mentionUserIds: [s.m.id] },
				s.a.cookie,
			);
			const ghiNhanM = await goi(
				"okr.guiGhiNhan",
				{
					objectiveId: s.g,
					keyResultId: null,
					nguoiNhan: [s.m.id],
					loiNhan: "Cảm ơn đã hỗ trợ",
				},
				s.a.cookie,
			);
			const giua = await demHang();
			const nhacB = await goi(
				"okr.addComment",
				{ objectiveId: s.g, body: "Nhờ B xem", mentionUserIds: [s.b.id] },
				s.a.cookie,
			);
			const ghiNhanB = await goi(
				"okr.guiGhiNhan",
				{
					objectiveId: s.g,
					keyResultId: null,
					nguoiNhan: [s.b.id],
					loiNhan: "Cảm ơn B",
				},
				s.a.cookie,
			);
			const sau = await demHang();
			expect({
				nhacM: `${nhacM.status} ${nhacM.loi}`,
				ghiNhanM: `${ghiNhanM.status} ${ghiNhanM.loi}`,
				giua,
				nhacB: nhacB.status,
				ghiNhanB: ghiNhanB.status,
				sau: { binhLuan: sau.okrComment, ghiNhan: sau.okrGhiNhan },
			}).toEqual({
				nhacM: `400 ${OKR.thongDiep.traoDoi.nhacKhongXemDuoc(tenM)}`,
				ghiNhanM: `400 ${OKR.thongDiep.canhKr.nguoiNhanKhongXemDuoc(tenM)}`,
				giua: truoc,
				nhacB: 200,
				ghiNhanB: 200,
				sau: {
					binhLuan: truoc.okrComment + 1,
					ghiNhan: truoc.okrGhiNhan + 1,
				},
			});
		},
		CHO_MS,
	);

	test(
		"bảng viết trước 6 thao tác của M không xem được G: 404 hay từ chối có tên, không hàng nào ghi",
		async () => {
			const khoaM = (
				await auth.api.createApiKey({
					body: { name: ma("gk-khoa"), userId: s.m.id },
				})
			).key;
			const bangKhoa = async (thuTuc: string, vao: Json) => {
				const res = await request(ungDung().getHttpServer())
					.post(`/api/trpc/${thuTuc}`)
					.set(API_KEY_HEADER, khoaM)
					.set("content-type", "application/json")
					.send(JSON.stringify(vao));
				return `${res.status} ${String(res.body?.error?.message ?? "")}`;
			};
			const http = async (thuTuc: string, vao: Json) => {
				const tra = await goi(thuTuc, vao, s.m.cookie);
				return `${tra.status} ${tra.loi}`;
			};
			const xep = async (nguoiYeuCau: string) => {
				const kq = await xepViecTroLy(db, {
					viec: "de-xuat",
					objectiveId: s.g,
					keyResultId: null,
					nguoiYeuCau,
					nac: "bat",
				});
				return kq.bat ? `xep ${kq.taskId}` : `tu choi ${kq.lyDo}`;
			};
			const truoc = await demHang();
			const dangChay = {
				follow: await http("okr.follow", { objectiveId: s.g, on: true }),
				addComment: await http("okr.addComment", {
					objectiveId: s.g,
					body: "Bình luận của M",
					mentionUserIds: [],
				}),
				guiGhiNhan: await http("okr.guiGhiNhan", {
					objectiveId: s.g,
					keyResultId: null,
					nguoiNhan: [s.a.id],
					loiNhan: "Cảm ơn A",
				}),
				ghiSoKr: await bangKhoa("okr.ghiSoKr", { id: s.krG, giaTri: 12 }),
				xepViecTroLy: await xep(s.m.id),
			};
			await denChamDiem(s.ky);
			const ket = {
				...dangChay,
				mangSang: await http("okr.mangSang", { objectiveId: s.g }),
			};
			const sau = await demHang();
			const khong = `404 ${OKR.thongDiep.khongThayMucTieu}`;
			console.log(
				`ghi-ke bang M: ${Object.keys(ket).length} ca\n${Object.entries(ket)
					.map(([k, v]) => `${k}: ${v}`)
					.join(
						"\n",
					)}\nhang truoc ${JSON.stringify(truoc)} sau ${JSON.stringify(sau)}`,
			);
			expect({ ket, sau }).toEqual({
				ket: {
					follow: khong,
					addComment: khong,
					guiGhiNhan: khong,
					ghiSoKr: khong,
					xepViecTroLy: `tu choi ${KHONG_XEM_DUOC}`,
					mangSang: khong,
				},
				sau: truoc,
			});
			expect({
				a: await xep(s.a.id),
				b: (await goi("okr.follow", { objectiveId: s.g, on: true }, s.b.cookie))
					.status,
			}).toEqual({ a: "tu choi tat", b: 200 });
		},
		CHO_GIEO_MS,
	);
});
