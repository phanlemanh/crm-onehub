import { describe, expect, test } from "bun:test";
import {
	chuyenDonViInput,
	datHienThiInput,
	type MucTieuDeXem,
	type NguCanhXem,
	OKR_HIEN_THI,
	traLaiInput,
	xemDuocMucTieu,
} from "../src/okr-hien-thi";

const trong: NguCanhXem = {
	userId: "",
	quanTri: false,
	boPhanTruong: [],
	phongBanTruong: [],
	phongBanDuoiBoPhanTruong: [],
	nguoiDuoiQuyen: [],
};

const ngu = (userId: string, them: Partial<NguCanhXem> = {}): NguCanhXem => ({
	...trong,
	userId,
	...them,
});

const NGUOI = {
	quanTri: ngu("quan-tri", { quanTri: true }),
	chu: ngu("chu"),
	nguoiCaNhan: ngu("nguoi-ca-nhan"),
	thamGia: ngu("tham-gia"),
	phuTrachKr: ngu("phu-trach-kr"),
	nguoiLamViec: ngu("nguoi-lam-viec"),
	nguoiXemCoTen: ngu("nguoi-xem-co-ten"),
	truongPhongBan: ngu("truong-phong-ban", { phongBanTruong: ["pb1"] }),
	truongBoPhan: ngu("truong-bo-phan", {
		boPhanTruong: ["bp1"],
		phongBanDuoiBoPhanTruong: ["pb1"],
	}),
	truongCuaNguoiCaNhan: ngu("truong-cua-nguoi-ca-nhan", {
		nguoiDuoiQuyen: ["nguoi-ca-nhan"],
	}),
	nguoiNgoai: ngu("nguoi-ngoai"),
} satisfies Record<string, NguCanhXem>;

const khungMucTieu: MucTieuDeXem = {
	hienThi: "gioi-han",
	level: "phong-ban",
	divisionId: null,
	departmentId: "pb1",
	personUserId: null,
	ownerUserId: "chu",
	thamGia: [],
	phuTrachKr: [],
	nguoiLamViec: [],
	nguoiXem: [],
};

const MUC_TIEU = {
	"phong-ban-cong-khai": { ...khungMucTieu, hienThi: "cong-khai" },
	"phong-ban-gioi-han": {
		...khungMucTieu,
		thamGia: ["tham-gia"],
		phuTrachKr: ["phu-trach-kr"],
		nguoiLamViec: ["nguoi-lam-viec"],
		nguoiXem: ["nguoi-xem-co-ten"],
	},
	"ca-nhan-gioi-han": {
		...khungMucTieu,
		level: "ca-nhan",
		departmentId: null,
		personUserId: "nguoi-ca-nhan",
	},
} as const satisfies Record<string, MucTieuDeXem>;

const COT = [
	"phong-ban-cong-khai",
	"phong-ban-gioi-han",
	"ca-nhan-gioi-han",
] as const;

type DongKyVong = readonly [NguCanhXem, readonly [boolean, boolean, boolean]];

const KY_VONG = [
	[NGUOI.quanTri, [true, true, true]],
	[NGUOI.chu, [true, true, true]],
	[NGUOI.nguoiCaNhan, [true, false, true]],
	[NGUOI.thamGia, [true, true, false]],
	[NGUOI.phuTrachKr, [true, true, false]],
	[NGUOI.nguoiLamViec, [true, true, false]],
	[NGUOI.nguoiXemCoTen, [true, true, false]],
	[NGUOI.truongPhongBan, [true, true, false]],
	[NGUOI.truongBoPhan, [true, true, false]],
	[NGUOI.truongCuaNguoiCaNhan, [true, false, true]],
	[NGUOI.nguoiNgoai, [true, false, false]],
] satisfies DongKyVong[];

const TAT_CA_NGUOI: NguCanhXem[] = Object.values(NGUOI);

describe("xemDuocMucTieu", () => {
	test("ma trận 11 người × 3 mục tiêu", () => {
		const lech: string[] = [];
		let dem = 0;
		for (const [nc, ky] of KY_VONG) {
			COT.forEach((cot, i) => {
				dem += 1;
				const co = xemDuocMucTieu(nc, MUC_TIEU[cot]);
				const cho = ky[i];
				if (co !== cho)
					lech.push(`${nc.userId} × ${cot}: có ${co}, chờ ${cho}`);
			});
		}
		console.log(`ma trận xemDuocMucTieu: ${dem} ô`);
		expect(dem).toBe(33);
		expect(KY_VONG.map(([nc]) => nc.userId).sort()).toEqual(
			TAT_CA_NGUOI.map((nc) => nc.userId).sort(),
		);
		expect(lech).toEqual([]);
	});

	test("bộ phận giới hạn: chỉ trưởng bộ phận và các vế người", () => {
		const bp: MucTieuDeXem = {
			...khungMucTieu,
			level: "bo-phan",
			divisionId: "bp1",
			departmentId: null,
		};
		const nguoiTa = TAT_CA_NGUOI.filter((nc) => xemDuocMucTieu(nc, bp))
			.map((nc) => nc.userId)
			.sort();
		expect(nguoiTa).toEqual(["chu", "quan-tri", "truong-bo-phan"]);
	});

	test("onehub giới hạn: chỉ các vế người, không vế đơn vị", () => {
		const oh: MucTieuDeXem = {
			...khungMucTieu,
			level: "onehub",
			departmentId: null,
		};
		const nguoiTa = TAT_CA_NGUOI.filter((nc) => xemDuocMucTieu(nc, oh))
			.map((nc) => nc.userId)
			.sort();
		expect(nguoiTa).toEqual(["chu", "quan-tri"]);
	});

	test("người ở phòng ban khác không thấy phòng ban giới hạn", () => {
		const khac: NguCanhXem = {
			...trong,
			userId: "khac",
			phongBanTruong: ["pb2"],
			phongBanDuoiBoPhanTruong: ["pb3"],
			boPhanTruong: ["bp2"],
		};
		expect(xemDuocMucTieu(khac, MUC_TIEU["phong-ban-gioi-han"])).toBe(false);
	});
});

describe("khuôn hiển thị", () => {
	const nguoi = (n: number) => Array.from({ length: n }, (_, i) => `u${i}`);
	const datOk = (n: number) =>
		datHienThiInput.safeParse({
			objectiveId: "o",
			hienThi: "gioi-han",
			nguoiXem: nguoi(n),
		}).success;

	test("số người xem: mức trần nhận, quá một từ chối", () => {
		expect([
			datOk(OKR_HIEN_THI.nguoiXemToiDa),
			datOk(OKR_HIEN_THI.nguoiXemToiDa + 1),
			datOk(0),
		]).toEqual([true, false, true]);
	});

	test("mức hiển thị lạ bị từ chối", () => {
		expect(
			datHienThiInput.safeParse({
				objectiveId: "o",
				hienThi: "rieng-tu",
				nguoiXem: [],
			}).success,
		).toBe(false);
	});

	test("lý do trả lại: thiếu một ký tự và thừa một ký tự bị từ chối", () => {
		const co = (n: number) =>
			traLaiInput.safeParse({ objectiveId: "o", lyDo: "x".repeat(n) }).success;
		const { toiThieu, toiDa } = OKR_HIEN_THI.lyDoTraLai;
		expect([co(toiThieu - 1), co(toiThieu), co(toiDa), co(toiDa + 1)]).toEqual([
			false,
			true,
			true,
			false,
		]);
	});

	test("lý do toàn khoảng trắng bị từ chối", () => {
		expect(
			traLaiInput.safeParse({
				objectiveId: "o",
				lyDo: " ".repeat(OKR_HIEN_THI.lyDoTraLai.toiThieu + 5),
			}).success,
		).toBe(false);
	});

	test("lô chuyển: mức trần nhận, quá một và rỗng từ chối", () => {
		const co = (n: number) =>
			chuyenDonViInput.safeParse({
				objectiveIds: nguoi(n),
				denDonVi: { level: "phong-ban", id: "pb" },
			}).success;
		expect([
			co(OKR_HIEN_THI.chuyenToiDa),
			co(OKR_HIEN_THI.chuyenToiDa + 1),
			co(0),
		]).toEqual([true, false, false]);
	});

	test("đích chuyển: cá nhân và onehub bị từ chối, bộ phận và phòng ban nhận", () => {
		const co = (denDonVi: { level: string; id?: string }) =>
			chuyenDonViInput.safeParse({ objectiveIds: ["o"], denDonVi }).success;
		expect([
			co({ level: "ca-nhan", id: "u" }),
			co({ level: "onehub" }),
			co({ level: "bo-phan", id: "bp" }),
			co({ level: "phong-ban", id: "pb" }),
		]).toEqual([false, false, true, true]);
	});
});
