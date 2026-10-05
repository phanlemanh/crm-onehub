import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import {
	ketQuaKhoiPhuc,
	lyDoChanLuuTru,
} from "@crm/validation/to-chuc-luu-tru";
import { TO_CHUC } from "../src/to-chuc/to-chuc-config";
import { gieoKyQuy } from "./okr-khep-san";
import {
	bpMoi,
	CHUONG_TRINH_RONG,
	datViTri,
	dungSan,
	goi,
	goiQuery,
	type Json,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	TIEN_TO,
} from "./okr-san";

dungSan();

const CHO_MS = 120_000;
const T = TO_CHUC.thongDiep;

const luuTru = async (
	thuTuc: "org.archiveDepartment" | "org.archiveDivision",
	id: string,
) => ok(await goi(thuTuc, { id }), `luu tru ${id}`);

const khoiPhuc = async (
	thuTuc: "org.restoreDepartment" | "org.restoreDivision",
	id: string,
) => ketQuaKhoiPhuc.parse(ok(await goi(thuTuc, { id }), `khoi phuc ${id}`));

describe("ly-do", () => {
	const KHUON = `${TIEN_TO}-khuon-r1d`;
	let pb = "";
	beforeAll(async () => {
		ok(await goi("okr.setProgram", CHUONG_TRINH_RONG), "dat chuong trinh");
		pb = await pbMoi("r1d-ly-do");
		for (const ten of ["r1d-ld-1", "r1d-ld-2"])
			ok(await datViTri(await nguoiMoi(ten), pb), `xep ${ten}`);
		await db.onboardingTemplate.create({
			data: {
				id: KHUON,
				name: "Khuôn Bán hàng",
				steps: [
					{ label: "Bước r1d", departmentId: pb, position: 0, offsetDays: 0 },
				],
			},
		});
		const ky = await gieoKyQuy({
			tu: "2027-07-01",
			den: "2027-09-30",
			pha: "lap-ke-hoach",
		});
		const chu = await nguoiMoi("r1d-ld-chu");
		for (const i of [1, 2, 3])
			ok(
				await goi("okr.createObjective", {
					cycleId: ky,
					unit: { level: "phong-ban", departmentId: pb },
					title: ma(`muc tieu ly do ${i}`),
					kind: "cam-ket",
					ownerUserId: chu,
					participantIds: [],
					whyNow: "",
					hienThi: "cong-khai",
				}),
				`muc tieu ${i}`,
			);
	}, CHO_MS);
	afterAll(async () => {
		await db.onboardingTemplate.deleteMany({ where: { id: KHUON } });
	}, CHO_MS);

	test(
		"ly-do: luuTruXemTruoc tra ba ly do co du lieu (khuon, nguoi, okr); archiveDepartment van tu choi bang cau cu",
		async () => {
			const tra = ok<{ lyDo: Json[] }>(
				await goiQuery("org.luuTruXemTruoc", "quan", { id: pb }),
				"xem truoc",
			);
			const lyDo = tra.lyDo.map((l) => lyDoChanLuuTru.parse(l));
			const theoLoai = Object.fromEntries(lyDo.map((l) => [l.loai, l]));
			expect(
				theoLoai.nguoi && "so" in theoLoai.nguoi ? theoLoai.nguoi.so : null,
				"ly do khong co so: nguoi",
			).toBe(2);
			expect(
				theoLoai.okr && "so" in theoLoai.okr ? theoLoai.okr.so : null,
				"ly do khong co so: okr",
			).toBe(3);
			expect(
				theoLoai.khuon && "khuon" in theoLoai.khuon
					? theoLoai.khuon.khuon
					: null,
				"ly do khong co ten khuon",
			).toEqual(["Khuôn Bán hàng"]);
			const cam = await goi("org.archiveDepartment", { id: pb });
			expect(`${cam.status} ${cam.loi}`, "luu tru khong bi chan").toBe(
				`400 ${T.phongBanTrongKhuon(["Khuôn Bán hàng"])}`,
			);
			console.log(`so ly do: ${lyDo.length}`);
		},
		CHO_MS,
	);
});

describe("khoi-phuc", () => {
	test(
		"khoi-phuc: phong ban duoi bo phan da luu tru bi chan, khong doi du lieu; khoi phuc bo phan truoc thi ve dung cho",
		async () => {
			let soCa = 0;
			const bp = await bpMoi("r1d-kp-bp");
			const tenBp = (
				await db.division.findUniqueOrThrow({
					where: { id: bp },
					select: { name: true },
				})
			).name;
			const pb = await pbMoi("r1d-kp-pb", bp);
			await luuTru("org.archiveDepartment", pb);
			await luuTru("org.archiveDivision", bp);
			const a = await khoiPhuc("org.restoreDepartment", pb);
			expect(a, "khoi phuc vao bo phan da luu tru").toEqual({
				chan: { loai: "cha-luu-tru", ten: tenBp },
			});
			const sauA = await db.department.findUniqueOrThrow({
				where: { id: pb },
				select: { archivedAt: true },
			});
			expect(sauA.archivedAt !== null, "phong ban bi go luu tru").toBe(true);
			soCa += 1;
			expect(
				await khoiPhuc("org.restoreDivision", bp),
				"khoi phuc bo phan",
			).toEqual({
				id: bp,
			});
			expect(
				await khoiPhuc("org.restoreDepartment", pb),
				"khoi phuc phong ban",
			).toEqual({
				id: pb,
			});
			const sauB = await db.department.findUniqueOrThrow({
				where: { id: pb },
				select: { archivedAt: true, divisionId: true },
			});
			expect(sauB, "phong ban khong ve dung cho").toEqual({
				archivedAt: null,
				divisionId: bp,
			});
			soCa += 1;
			const leLoi = await pbMoi("r1d-kp-le");
			await luuTru("org.archiveDepartment", leLoi);
			expect(
				await khoiPhuc("org.restoreDepartment", leLoi),
				"phong ban le",
			).toEqual({
				id: leLoi,
			});
			soCa += 1;
			const bpSong = await bpMoi("r1d-kp-bp-song");
			const pbSong = await pbMoi("r1d-kp-pb-song", bpSong);
			await luuTru("org.archiveDepartment", pbSong);
			expect(
				await khoiPhuc("org.restoreDepartment", pbSong),
				"phong ban duoi bo phan song",
			).toEqual({ id: pbSong });
			soCa += 1;
			console.log(`so ca: ${soCa}`);
		},
		CHO_MS,
	);
});

describe("trung-ten", () => {
	const CA = [
		{
			bang: "department",
			thuTuc: "org.restoreDepartment",
			tao: "org.createDepartment",
			luu: "org.archiveDepartment",
		},
		{
			bang: "division",
			thuTuc: "org.restoreDivision",
			tao: "org.createDivision",
			luu: "org.archiveDivision",
		},
	] as const;

	const taoTen = async (tao: string, name: string) =>
		ok<{ id: string }>(
			await goi(
				tao,
				tao === "org.createDepartment" ? { name, divisionId: null } : { name },
			),
			`tao ${name}`,
		).id;

	const demSong = (bang: "department" | "division", ten: string) =>
		bang === "department"
			? db.department.count({
					where: {
						archivedAt: null,
						name: { equals: ten, mode: "insensitive" },
					},
				})
			: db.division.count({
					where: {
						archivedAt: null,
						name: { equals: ten, mode: "insensitive" },
					},
				});

	test(
		"trung-ten: khoi phuc don vi trung ten (ke ca khac hoa thuong) voi don vi dang hoat dong bi chan; khong trung thi khoi phuc duoc",
		async () => {
			let soCa = 0;
			for (const ca of CA)
				for (const hoaThuong of [false, true]) {
					const goc = `${TIEN_TO} Kinh doanh ${ca.bang} ${hoaThuong ? "ht" : "dc"}`;
					const cu = await taoTen(ca.tao, goc);
					await luuTru(
						ca.luu as "org.archiveDepartment" | "org.archiveDivision",
						cu,
					);
					const tenSong = hoaThuong ? goc.toUpperCase() : goc;
					await taoTen(ca.tao, tenSong);
					const kq = await khoiPhuc(ca.thuTuc, cu);
					const nhan = ca.bang === "division" ? "bo-phan" : "phong-ban";
					expect(kq, `hai don vi cung ten: ${nhan}`).toEqual({
						chan: { loai: "trung-ten", ten: tenSong },
					});
					expect(await demSong(ca.bang, goc), `dem song sai: ${nhan}`).toBe(1);
					soCa += 1;
				}
			const khac = await taoTen(
				"org.createDepartment",
				`${TIEN_TO} Kinh doanh 2 r1d`,
			);
			await luuTru("org.archiveDepartment", khac);
			expect(
				await khoiPhuc("org.restoreDepartment", khac),
				"doi chung khoi phuc",
			).toEqual({
				id: khac,
			});
			console.log(`so ca: ${soCa}`);
		},
		CHO_MS,
	);
});
