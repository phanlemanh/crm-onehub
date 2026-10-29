import { describe, expect, test } from "bun:test";
import type { KieuKr } from "@crm/validation/okr-kr";
import type { CapMucTieu } from "@crm/validation/okr-muc-tieu";
import type { DonChonOkr } from "@crm/validation/okr-tham-so";
import {
	chonMucTieuBo,
	type DongKrNhap,
	demCongBo,
	kiemDongKr,
	nguoiPhuTrachMacDinh,
	suyKieuKr,
	type TrangThaiDongKr,
} from "@/app/(app)/[slug]/okr/soan-bo/du-lieu-bo";
import { mucTieuOutput } from "../../api/src/okr/okr.contracts";
import { danhSachOutput } from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

const LAN = { id: "lan", name: "Nguyễn Thị Lan", email: "lan@onehub.vn" };
const HUNG = { id: "hung", name: "Trần Văn Hùng", email: "hung@onehub.vn" };
const SOAN = "nguoi-soan";

type DongMau = { id: string; level: CapMucTieu; unitId: string | null };

function dongMau(d: DongMau) {
	return {
		...mucTieuOutput.parse({
			id: d.id,
			cycleId: "q4",
			level: d.level,
			unitId: d.unitId,
			unitName: "Đơn vị",
			title: `Mục tiêu ${d.id}`,
			kind: "cam-ket",
			status: "nhap",
			owner: LAN,
			participants: [],
			whyNow: "",
			publishedAt: null,
			droppedAt: null,
			progress: 0,
			expected: null,
			keyResults: [],
			alignments: [],
			canEdit: true,
			following: false,
			followerCount: 0,
			theoDoi: false,
			hienThi: "cong-khai",
			soNguoiXem: 0,
			soGopYCho: 0,
		}),
		krKhop: [],
	};
}

function danhSachMau(rows: DongMau[], daBo: DongMau[] = []) {
	return danhSachOutput.parse({
		rows: rows.map(dongMau),
		daBo: daBo.map(dongMau),
		total: rows.length,
		facetCounts: {
			phuTrach: [],
			loai: [],
			trangThai: [],
			tuTin: [],
			gopY: [],
		},
		canEdit: true,
		canCreate: true,
	});
}

function phongBan(
	id: string,
	divisionId: string | null,
	head: typeof LAN | null,
) {
	return {
		id,
		name: `Phòng ${id}`,
		moTa: "",
		position: 0,
		divisionId,
		head,
		stepCount: 0,
		okrMo: 0,
		people: head ? [{ ...head, primary: true }] : [],
	};
}

function cayMau() {
	return orgTreeOutput.parse({
		divisions: [
			{
				id: "B1",
				name: "Khối Vận hành",
				moTa: "",
				position: 0,
				head: HUNG,
				okrMo: 0,
				departments: [phongBan("P1", "B1", LAN), phongBan("P2", "B1", null)],
			},
			{
				id: "B2",
				name: "Khối Kinh doanh",
				moTa: "",
				position: 1,
				head: null,
				okrMo: 0,
				departments: [],
			},
		],
		chuaXep: [phongBan("P9", null, HUNG)],
		chuaCoPhongBan: [],
		people: [],
		archived: { divisions: [], departments: [] },
		coverage: { members: 2, withPrimary: 2, departmentsWithoutHead: 1 },
	});
}

const BO_TRON = danhSachMau(
	[
		{ id: "g1", level: "onehub", unitId: null },
		{ id: "b1", level: "bo-phan", unitId: "B1" },
		{ id: "p1-con", level: "phong-ban", unitId: "P1" },
		{ id: "b2", level: "bo-phan", unitId: "B2" },
		{ id: "p1-b", level: "phong-ban", unitId: "P1" },
		{ id: "p2", level: "phong-ban", unitId: "P2" },
		{ id: "cn", level: "ca-nhan", unitId: "lan" },
		{ id: "g2", level: "onehub", unitId: null },
	],
	[
		{ id: "b1-bo", level: "bo-phan", unitId: "B1" },
		{ id: "g-bo", level: "onehub", unitId: null },
	],
);

const ids = (ds: { id: string }[]) => ds.map((d) => d.id);

describe("vk10-du-lieu chonMucTieuBo", () => {
	const CA: { ten: string; don: DonChonOkr; mong: string[] }[] = [
		{ ten: "goc", don: { loai: "goc" }, mong: ["g1", "g2"] },
		{ ten: "bp B1", don: { loai: "bp", id: "B1" }, mong: ["b1"] },
		{ ten: "bp B2", don: { loai: "bp", id: "B2" }, mong: ["b2"] },
		{ ten: "pb P1", don: { loai: "pb", id: "P1" }, mong: ["p1-con", "p1-b"] },
		{ ten: "pb P3 rong", don: { loai: "pb", id: "P3" }, mong: [] },
		{ ten: "nguoi", don: { loai: "nguoi", id: "lan" }, mong: [] },
	];
	for (const ca of CA) {
		test(ca.ten, () => {
			expect(
				ids(chonMucTieuBo(BO_TRON, ca.don)),
				`vk10-du-lieu: chonMucTieuBo ${ca.ten} lech`,
			).toEqual(ca.mong);
		});
	}

	test("bo cua khoi bo qua phong ban con va dong da bo", () => {
		const ds = danhSachMau(
			[
				{ id: "pb-con", level: "phong-ban", unitId: "P1" },
				{ id: "khoi", level: "bo-phan", unitId: "B1" },
			],
			[{ id: "khoi-bo", level: "bo-phan", unitId: "B1" }],
		);
		expect(
			ids(chonMucTieuBo(ds, { loai: "bp", id: "B1" })),
			"vk10-du-lieu: chonMucTieuBo bp lay ca phong ban con hay daBo",
		).toEqual(["khoi"]);
	});

	test("khong tra dong da bo khi rows rong", () => {
		const ds = danhSachMau([], [{ id: "g-bo", level: "onehub", unitId: null }]);
		expect(
			chonMucTieuBo(ds, { loai: "goc" }),
			"vk10-du-lieu: chonMucTieuBo lay daBo",
		).toEqual([]);
	});
});

describe("vk10-du-lieu suyKieuKr", () => {
	const CA: {
		khoi: number | null;
		dich: number | null;
		mong: KieuKr | null;
	}[] = [
		{ khoi: null, dich: null, mong: "moc" },
		{ khoi: 0, dich: 10, mong: "tang-toi" },
		{ khoi: 10, dich: 2, mong: "giam-xuong" },
		{ khoi: -5, dich: -1, mong: "tang-toi" },
		{ khoi: 4, dich: 4, mong: null },
		{ khoi: 4, dich: null, mong: null },
		{ khoi: null, dich: 4, mong: null },
	];
	for (const ca of CA) {
		test(`${ca.khoi} -> ${ca.dich}`, () => {
			expect(
				suyKieuKr(ca.khoi, ca.dich),
				`vk10-du-lieu: suyKieuKr ${ca.khoi} ${ca.dich} lech`,
			).toBe(ca.mong);
		});
	}
});

describe("vk10-du-lieu kiemDongKr", () => {
	const dong = (d: Partial<DongKrNhap>): DongKrNhap => ({
		ten: "Doanh thu",
		khoi: "",
		dich: "",
		donVi: "",
		kieu: null,
		nguoi: null,
		...d,
	});
	const CA: { ten: string; vao: Partial<DongKrNhap>; mong: TrangThaiDongKr }[] =
		[
			{
				ten: "so thap phan kieu Viet",
				vao: { khoi: "2", dich: "3,5" },
				mong: { loai: "du", kieu: "tang-toi", khoi: 2, dich: 3.5 },
			},
			{
				ten: "nhom nghin",
				vao: { khoi: "1.000", dich: "250" },
				mong: { loai: "du", kieu: "giam-xuong", khoi: 1000, dich: 250 },
			},
			{
				ten: "ten ngan",
				vao: { ten: " ab ", khoi: "0", dich: "10" },
				mong: { loai: "chua-luu", ly: "thieu-ten" },
			},
			{
				ten: "ten ngan truoc so sai",
				vao: { ten: "", khoi: "abc" },
				mong: { loai: "chua-luu", ly: "thieu-ten" },
			},
			{
				ten: "khoi diem sai",
				vao: { khoi: "abc", dich: "10" },
				mong: { loai: "chua-luu", ly: "so-sai" },
			},
			{
				ten: "dich sai",
				vao: { khoi: "1", dich: "1,2,3" },
				mong: { loai: "chua-luu", ly: "so-sai" },
			},
			{
				ten: "thieu dich",
				vao: { khoi: "5" },
				mong: { loai: "chua-luu", ly: "thieu-dich" },
			},
			{
				ten: "thieu khoi diem",
				vao: { dich: "5" },
				mong: { loai: "chua-luu", ly: "thieu-khoi-diem" },
			},
			{
				ten: "dich bang khoi",
				vao: { khoi: "5", dich: "5" },
				mong: { loai: "chua-luu", ly: "dich-bang-khoi" },
			},
			{
				ten: "bang nhau nhung kieu chon tay",
				vao: { khoi: "5", dich: "5", kieu: "giu-tren" },
				mong: { loai: "du", kieu: "giu-tren", khoi: 5, dich: 5 },
			},
			{
				ten: "moc khi hai o trong",
				vao: { khoi: " ", dich: "" },
				mong: { loai: "du", kieu: "moc", khoi: 0, dich: 1 },
			},
			{
				ten: "moc chon tay bo qua so",
				vao: { khoi: "3", dich: "9", kieu: "moc" },
				mong: { loai: "du", kieu: "moc", khoi: 0, dich: 1 },
			},
			{
				ten: "kieu chon tay thang suy kieu",
				vao: { khoi: "0", dich: "10", kieu: "giu-duoi" },
				mong: { loai: "du", kieu: "giu-duoi", khoi: 0, dich: 10 },
			},
			{
				ten: "kieu chon tay van can dich",
				vao: { khoi: "3", kieu: "phan-tram" },
				mong: { loai: "chua-luu", ly: "thieu-dich" },
			},
		];
	for (const ca of CA) {
		test(ca.ten, () => {
			expect(
				kiemDongKr(dong(ca.vao)),
				`vk10-du-lieu: kiemDongKr ${ca.ten} lech`,
			).toEqual(ca.mong);
		});
	}
});

describe("vk10-du-lieu nguoiPhuTrachMacDinh", () => {
	const cay = cayMau();
	const CA: { ten: string; don: DonChonOkr; mong: string }[] = [
		{ ten: "bp co truong", don: { loai: "bp", id: "B1" }, mong: "hung" },
		{ ten: "bp khong truong", don: { loai: "bp", id: "B2" }, mong: SOAN },
		{ ten: "bp khong co", don: { loai: "bp", id: "B9" }, mong: SOAN },
		{ ten: "pb co truong", don: { loai: "pb", id: "P1" }, mong: "lan" },
		{ ten: "pb khong truong", don: { loai: "pb", id: "P2" }, mong: SOAN },
		{ ten: "pb chua xep", don: { loai: "pb", id: "P9" }, mong: "hung" },
		{ ten: "goc", don: { loai: "goc" }, mong: SOAN },
	];
	for (const ca of CA) {
		test(ca.ten, () => {
			expect(
				nguoiPhuTrachMacDinh(ca.don, cay, SOAN),
				`vk10-du-lieu: nguoiPhuTrachMacDinh ${ca.ten} lech`,
			).toBe(ca.mong);
		});
	}
});

describe("vk10-du-lieu demCongBo", () => {
	test("chi dem nhap co it nhat mot KR da luu", () => {
		expect(
			demCongBo([
				{ status: "nhap", soKrDaLuu: 2 },
				{ status: "nhap", soKrDaLuu: 1 },
				{ status: "nhap", soKrDaLuu: 0 },
				{ status: "cong-bo", soKrDaLuu: 3 },
				{ status: "cho-duyet", soKrDaLuu: 2 },
			]),
			"vk10-du-lieu: demCongBo lech",
		).toBe(2);
	});

	test("bo rong", () => {
		expect(demCongBo([]), "vk10-du-lieu: demCongBo rong lech").toBe(0);
	});
});
