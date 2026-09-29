import { describe, expect, test } from "bun:test";
import type { TrangThaiHoiY } from "@crm/validation/okr-hoi-y";
import {
	ganYInput,
	ketLuanInput,
	NOI_BAN_TRUOC,
	NOI_MOI,
	noiTuSoCau,
	OKR_HOI_Y,
	soCauCuaNoi,
	suaChuDeInput,
	taoChuDeInput,
	thuTuXao,
} from "@crm/validation/okr-hoi-y";
import {
	bangChungChuDe,
	type ChuDeTho,
	chieuChuDeChoNguoiXem,
	chieuYChoNguoiXem,
	chieuYCuaToi,
	docBanTruoc,
	doPhu,
	ketQuaBanTruoc,
	ketQuaCongBo,
	lyDoChuaCongBo,
	type MaThieu,
	tenYLa,
	tinhTrangCongBo,
	type YTho,
} from "../src/okr/hoi-y";

type VaoThu = {
	[khoa: string]: string | number | boolean | null | readonly string[];
};

const luc = (phut: number) => new Date(Date.UTC(2026, 9, 1, 3, phut));

const yBang = (
	id: string,
	tacGiaUserId: string,
	phongBanId: string | null,
	soDongY: number,
	phut: number,
) => ({
	id,
	noiDung: `nội dung ${id}`,
	tacGiaUserId,
	phongBanId,
	soDongY,
	createdAt: luc(phut),
});

describe("bang-chung", () => {
	test("E7: năm ý, bốn người, ba phòng ban thuộc hai bộ phận, sáu lượt đồng ý", () => {
		const y = [
			yBang("y1", "u1", "A/pb1", 3, 1),
			yBang("y2", "u2", "A/pb2", 0, 2),
			yBang("y3", "u3", "B/pb1", 2, 3),
			yBang("y4", "u4", "B/pb1", 1, 4),
			yBang("y5", "u1", "A/pb1", 0, 5),
		];
		expect(bangChungChuDe(y)).toEqual({
			soNguoi: 4,
			soDonVi: 3,
			soDongY: 6,
			trich: ["nội dung y1", "nội dung y3"],
		});
	});

	test("một ý cho một trích", () => {
		expect(bangChungChuDe([yBang("y1", "u1", "A/pb1", 4, 1)])).toEqual({
			soNguoi: 1,
			soDonVi: 1,
			soDongY: 4,
			trich: ["nội dung y1"],
		});
	});

	test("hoà số đồng ý thì ý cũ trước", () => {
		const y = [
			yBang("moi", "u1", "A/pb1", 2, 9),
			yBang("cu", "u2", "A/pb1", 2, 1),
			yBang("giua", "u3", "A/pb1", 2, 5),
		];
		expect(bangChungChuDe(y).trich).toEqual(["nội dung cu", "nội dung giua"]);
	});

	test("người chưa xếp phòng ban chung một đơn vị «chưa xếp»", () => {
		const y = [
			yBang("y1", "u1", null, 0, 1),
			yBang("y2", "u2", null, 0, 2),
			yBang("y3", "u3", "A/pb1", 0, 3),
		];
		expect(bangChungChuDe(y)).toMatchObject({ soNguoi: 3, soDonVi: 2 });
	});

	test("không có ý nào", () => {
		expect(bangChungChuDe([])).toEqual({
			soNguoi: 0,
			soDonVi: 0,
			soDongY: 0,
			trich: [],
		});
	});
});

describe("giu-them-bo", () => {
	const ban = {
		cau: [
			"Tăng doanh thu",
			"Giảm chi phí vận hành",
			"Mở rộng thị trường mới",
			"Nâng cao trải nghiệm khách hàng",
		],
		boQua: false,
	};

	test("E9: giữ, bỏ, đổi, bỏ và một chủ đề thêm", () => {
		const r = ketQuaBanTruoc(ban, [
			{ noiBanTruoc: "cau-1", cauMucTieu: "  tăng   DOANH thu " },
			{ noiBanTruoc: "cau-3", cauMucTieu: "Vào thêm hai thị trường khu vực" },
			{ noiBanTruoc: "moi", cauMucTieu: "Chuẩn hoá dữ liệu khách hàng" },
		]);
		expect(r).toEqual({
			cau: ["giu", "bo", "doi", "bo"],
			doi: 1,
			them: 1,
			boQua: false,
		});
	});

	test("khai không viết trước: mọi chủ đề chọn là thêm", () => {
		const r = ketQuaBanTruoc({ cau: [], boQua: true }, [
			{ noiBanTruoc: "moi", cauMucTieu: "a" },
			{ noiBanTruoc: "moi", cauMucTieu: "b" },
			{ noiBanTruoc: "moi", cauMucTieu: "c" },
		]);
		expect(r).toEqual({ cau: [], doi: 0, them: 3, boQua: true });
	});

	test("hai chủ đề nối cùng một câu: một cái trùng chữ thì giữ", () => {
		const r = ketQuaBanTruoc(ban, [
			{ noiBanTruoc: "cau-2", cauMucTieu: "Cắt giảm chi phí" },
			{ noiBanTruoc: "cau-2", cauMucTieu: "giảm chi phí vận hành" },
		]);
		expect(r.cau).toEqual(["bo", "giu", "bo", "bo"]);
		expect(r.doi).toBe(0);
	});

	test("hai chủ đề nối cùng một câu, đều khác chữ: đổi một lần", () => {
		const r = ketQuaBanTruoc(ban, [
			{ noiBanTruoc: "cau-4", cauMucTieu: "Khách hàng hài lòng hơn" },
			{ noiBanTruoc: "cau-4", cauMucTieu: "Giảm khiếu nại" },
		]);
		expect(r.cau).toEqual(["bo", "bo", "bo", "doi"]);
		expect(r.doi).toBe(1);
	});

	test("không chủ đề nào: mọi câu bị bỏ", () => {
		expect(ketQuaBanTruoc(ban, [])).toEqual({
			cau: ["bo", "bo", "bo", "bo"],
			doi: 0,
			them: 0,
			boQua: false,
		});
	});
});

describe("do-phu", () => {
	const donVi = [
		{ id: "goc", loai: "goc" as const, cha: null },
		{ id: "bpA", loai: "bo-phan" as const, cha: "goc" },
		{ id: "bpB", loai: "bo-phan" as const, cha: "goc" },
		{ id: "pb1", loai: "phong-ban" as const, cha: "bpA" },
		{ id: "pb2", loai: "phong-ban" as const, cha: "bpA" },
		{ id: "pb3", loai: "phong-ban" as const, cha: "bpB" },
		{ id: "pb4", loai: "phong-ban" as const, cha: "bpB" },
		{ id: "pb5", loai: "phong-ban" as const, cha: "bpB" },
		{ id: "cx", loai: "chua-xep" as const, cha: "goc" },
	];
	const nguoi = [
		...["a1", "a2", "a3", "a4"].map((id) => ({ id, phongBanChinh: "pb1" })),
		...["b1", "b2", "b3"].map((id) => ({ id, phongBanChinh: "pb2" })),
		...["c1", "c2", "c3", "c4", "c5"].map((id) => ({
			id,
			phongBanChinh: "pb3",
		})),
		...["d1", "d2", "d3", "d4"].map((id) => ({ id, phongBanChinh: "pb4" })),
		...["e1", "e2"].map((id) => ({ id, phongBanChinh: "pb5" })),
		...["x1", "x2", "x3"].map((id) => ({ id, phongBanChinh: null })),
	];
	const g = (tacGiaUserId: string, ngayVN: string) => ({
		tacGiaUserId,
		ngayVN,
	});
	const gop = [
		g("a1", "2026-10-01"),
		g("a2", "2026-10-01"),
		g("c1", "2026-10-01"),
		g("x1", "2026-10-01"),
		g("R", "2026-10-01"),
		g("ceo", "2026-10-01"),
		g("a1", "2026-10-02"),
		g("a3", "2026-10-02"),
		g("b1", "2026-10-02"),
		g("b2", "2026-10-02"),
		g("c2", "2026-10-02"),
		g("d1", "2026-10-02"),
		g("d2", "2026-10-02"),
		g("e1", "2026-10-02"),
		g("x2", "2026-10-02"),
	];
	const ngay = ["2026-10-01", "2026-10-02"];

	test("E11: chín hàng, hai ngày, cộng dồn, một chữ số thập phân", () => {
		expect(doPhu({ ngay, donVi, nguoi, gop })).toEqual({
			hang: [
				{ id: "goc", giaTri: [19, 57.1] },
				{ id: "bpA", giaTri: [28.6, 71.4] },
				{ id: "bpB", giaTri: [9.1, 45.5] },
				{ id: "pb1", giaTri: [50, 75] },
				{ id: "pb2", giaTri: [0, 66.7] },
				{ id: "pb3", giaTri: [20, 40] },
				{ id: "pb4", giaTri: [0, 50] },
				{ id: "pb5", giaTri: [0, 50] },
				{ id: "cx", giaTri: [33.3, 66.7] },
			],
		});
	});

	test("người đã rời (R) và người chọn (ceo) không vào tử số", () => {
		const r = doPhu({
			ngay,
			donVi,
			nguoi,
			gop: [g("R", "2026-10-01"), g("ceo", "2026-10-02")],
		});
		expect(r.hang.every((h) => h.giaTri.every((v) => v === 0))).toBe(true);
	});

	test("ý góp sau ngày cuối không vào cột nào", () => {
		const r = doPhu({ ngay, donVi, nguoi, gop: [g("a1", "2026-10-03")] });
		expect(r.hang[0]?.giaTri).toEqual([0, 0]);
	});

	test("đơn vị không có ai: mọi ô là 0", () => {
		const r = doPhu({
			ngay,
			donVi: [{ id: "goc", loai: "goc", cha: null }],
			nguoi: [],
			gop,
		});
		expect(r).toEqual({ hang: [{ id: "goc", giaTri: [0, 0] }] });
	});
});

describe("ly-do-chua-cong-bo", () => {
	type CauChuDe = {
		id: string;
		loai: "chu-de" | "y-la";
		ten: string;
		soY: number;
		ketLuan: string | null;
		lyDo: string;
		cauMucTieu: string;
		noiBanTruoc: string | null;
	};
	const chuDe = (id: string, rieng: Partial<CauChuDe> = {}): CauChuDe => ({
		id,
		loai: "chu-de",
		ten: `Chủ đề ${id}`,
		soY: 2,
		ketLuan: "chon",
		lyDo: "Lý do đủ dài để qua",
		cauMucTieu: "Tăng doanh thu",
		noiBanTruoc: "cau-1",
		...rieng,
	});
	type Vao = Parameters<typeof lyDoChuaCongBo>[0];
	const tot = (): Vao => ({
		coBanTruoc: true,
		boQua: false,
		yChuaGom: 0,
		chuDe: [chuDe("c1"), chuDe("c2", { ketLuan: "de-sau", noiBanTruoc: null })],
		tongOneHubSau: 3,
		objectiveCap: 5,
		capMode: "chan",
	});
	const dong = (ma: MaThieu, chuDeId: string | null) => ({ ma, chuDeId });

	test("bản lành: không điều thiếu", () => {
		expect(lyDoChuaCongBo(tot())).toEqual([]);
	});

	const ca: [string, Vao, ReturnType<typeof lyDoChuaCongBo>][] = [
		[
			"chưa niêm phong",
			{ ...tot(), coBanTruoc: false },
			[dong("chua-niem-phong", null)],
		],
		["còn ý chưa gom", { ...tot(), yChuaGom: 2 }, [dong("y-chua-gom", null)]],
		[
			"chủ đề rỗng",
			{
				...tot(),
				chuDe: [chuDe("c1"), chuDe("c2", { soY: 0, ketLuan: "de-sau" })],
			},
			[dong("chu-de-rong", "c2")],
		],
		[
			"thiếu kết luận",
			{ ...tot(), chuDe: [chuDe("c1"), chuDe("c2", { ketLuan: null })] },
			[dong("thieu-ket-luan", "c2")],
		],
		[
			"thiếu lý do",
			{
				...tot(),
				chuDe: [chuDe("c1"), chuDe("c2", { ketLuan: "de-sau", lyDo: "ngắn" })],
			},
			[dong("thieu-ly-do", "c2")],
		],
		[
			"thiếu câu mục tiêu",
			{ ...tot(), chuDe: [chuDe("c1", { cauMucTieu: "" })] },
			[dong("thieu-cau-muc-tieu", "c1")],
		],
		[
			"chưa nối câu viết trước",
			{ ...tot(), chuDe: [chuDe("c1", { noiBanTruoc: null })] },
			[dong("thieu-noi-ban-truoc", "c1")],
		],
		[
			"không chủ đề nào chọn",
			{ ...tot(), chuDe: [chuDe("c1", { ketLuan: "de-sau" })] },
			[dong("khong-chon", null)],
		],
		[
			"vượt trần ở chế độ chặn",
			{ ...tot(), tongOneHubSau: 6 },
			[dong("vuot-tran", null)],
		],
	];
	for (const [ten, s, mong] of ca) {
		test(ten, () => {
			expect(lyDoChuaCongBo(s)).toEqual(mong);
		});
	}

	test("vượt trần ở chế độ cảnh báo vẫn công bố được", () => {
		expect(
			lyDoChuaCongBo({ ...tot(), tongOneHubSau: 6, capMode: "canh-bao" }),
		).toEqual([]);
	});

	test("đúng bằng trần thì qua", () => {
		expect(lyDoChuaCongBo({ ...tot(), tongOneHubSau: 5 })).toEqual([]);
	});

	test("khai không viết trước thì không cần nối câu viết trước", () => {
		expect(
			lyDoChuaCongBo({
				...tot(),
				coBanTruoc: false,
				boQua: true,
				chuDe: [chuDe("c1", { noiBanTruoc: null })],
			}),
		).toEqual([]);
	});

	test("câu mục tiêu ngắn hơn khuôn tên mục tiêu là thiếu", () => {
		expect(
			lyDoChuaCongBo({ ...tot(), chuDe: [chuDe("c1", { cauMucTieu: "ab" })] }),
		).toEqual([dong("thieu-cau-muc-tieu", "c1")]);
	});

	test("lý do toàn khoảng trắng là thiếu", () => {
		expect(
			lyDoChuaCongBo({
				...tot(),
				chuDe: [chuDe("c1", { lyDo: "                  " })],
			}),
		).toEqual([dong("thieu-ly-do", "c1")]);
	});

	test("mọi điều cùng thiếu: theo thứ tự cố định", () => {
		const r = lyDoChuaCongBo({
			coBanTruoc: false,
			boQua: false,
			yChuaGom: 1,
			chuDe: [
				chuDe("c1", {
					soY: 0,
					ketLuan: null,
					lyDo: "",
					cauMucTieu: "",
					noiBanTruoc: null,
				}),
			],
			tongOneHubSau: 9,
			objectiveCap: 5,
			capMode: "chan",
		});
		expect(r.map((x) => x.ma)).toEqual([
			"chua-niem-phong",
			"y-chua-gom",
			"chu-de-rong",
			"thieu-ket-luan",
			"thieu-ly-do",
			"khong-chon",
			"vuot-tran",
		]);
	});

	test("ý lạ chưa có kết luận: thiếu kết luận, gắn đúng chủ đề", () => {
		expect(
			lyDoChuaCongBo({
				...tot(),
				chuDe: [
					chuDe("c1"),
					chuDe("l1", { loai: "y-la", soY: 1, ketLuan: null }),
				],
			}),
		).toEqual([dong("thieu-ket-luan", "l1")]);
	});

	test("ý lạ không làm: lý do 9 ký tự là thiếu lý do", () => {
		expect(
			lyDoChuaCongBo({
				...tot(),
				chuDe: [
					chuDe("c1"),
					chuDe("l1", {
						loai: "y-la",
						soY: 1,
						ketLuan: "khong-lam",
						lyDo: "chín ký t",
						noiBanTruoc: null,
					}),
				],
			}),
		).toEqual([dong("thieu-ly-do", "l1")]);
	});

	test("ý lạ được chọn: thiếu câu mục tiêu và thiếu nối câu viết trước", () => {
		expect(
			lyDoChuaCongBo({
				...tot(),
				chuDe: [
					chuDe("c1"),
					chuDe("l1", {
						loai: "y-la",
						soY: 1,
						cauMucTieu: "",
						noiBanTruoc: null,
					}),
				],
			}),
		).toEqual([
			dong("thieu-cau-muc-tieu", "l1"),
			dong("thieu-noi-ban-truoc", "l1"),
		]);
	});

	test("ý lạ được chọn đủ điều kiện thì tính là chủ đề chọn", () => {
		expect(
			lyDoChuaCongBo({
				...tot(),
				chuDe: [
					chuDe("l1", { loai: "y-la", soY: 1, noiBanTruoc: "moi" }),
					chuDe("c2", { ketLuan: "de-sau" }),
				],
			}),
		).toEqual([]);
	});

	test("nhiều chủ đề thiếu cùng một điều: mỗi chủ đề một dòng theo thứ tự chủ đề", () => {
		const r = lyDoChuaCongBo({
			...tot(),
			chuDe: [
				chuDe("c1", { cauMucTieu: "" }),
				chuDe("c2"),
				chuDe("c3", { cauMucTieu: "" }),
			],
		});
		expect(r).toEqual([
			dong("thieu-cau-muc-tieu", "c1"),
			dong("thieu-cau-muc-tieu", "c3"),
		]);
	});
});

describe("chieu-y", () => {
	const yTho = (
		id: string,
		tacGiaUserId: string,
		soDongY: number,
		phut: number,
		daDongY = false,
	): YTho => ({
		id,
		noiDung: `nội dung ${id}`,
		viSao: `vì sao ${id}`,
		doBangGi: `đo ${id}`,
		chuDeId: null,
		tacGiaUserId,
		tacGiaTen: `Tên ${tacGiaUserId}`,
		phongBanId: null,
		soDongY,
		daDongY,
		createdAt: luc(phut),
	});
	const ds: YTho[] = [
		yTho("y1", "me", 2, 1),
		yTho("y2", "u2", 3, 2, true),
		yTho("y3", "u3", 0, 3),
		yTho("y4", "u4", 1, 4),
		yTho("y5", "u5", 0, 5),
	];
	const trangThai: TrangThaiHoiY[] = ["dang-mo", "dang-gom", "da-cong-bo"];
	const xem = (
		userId: string,
		laQuanTri: boolean,
		laNguoiChon: boolean,
		daNiemPhong: boolean,
		tt: TrangThaiHoiY,
	) => ({
		userId,
		laQuanTri,
		laNguoiChon,
		daNiemPhong,
		hoiYId: "hy1",
		trangThai: tt,
	});

	const KHOA_AN = ["chuDeId", "daDongY", "doBangGi", "id", "noiDung", "viSao"];
	const KHOA_DAY_DU = [
		"chuDeId",
		"createdAt",
		"daDongY",
		"doBangGi",
		"id",
		"noiDung",
		"soDongY",
		"tacGia",
		"viSao",
	];

	for (const tt of trangThai) {
		test(`thành viên (${tt}): không tên, không số, có daDongY, không thấy ý của mình`, () => {
			const r = chieuYChoNguoiXem(ds, xem("me", false, false, false, tt));
			expect(r.khoa).toBe(false);
			expect(r.y.map((y) => y.id).sort()).toEqual(["y2", "y3", "y4", "y5"]);
			for (const y of r.y) {
				expect(Object.keys(y).sort()).toEqual(KHOA_AN);
			}
			expect(r.y.find((y) => y.id === "y2")?.daDongY).toBe(true);
			expect(r.y.find((y) => y.id === "y3")?.daDongY).toBe(false);
		});

		test(`quản trị (${tt}): tên và số, theo thời điểm tạo`, () => {
			const r = chieuYChoNguoiXem(ds, xem("qt", true, false, false, tt));
			expect(r.khoa).toBe(false);
			expect(r.y.map((y) => y.id)).toEqual(["y1", "y2", "y3", "y4", "y5"]);
			for (const y of r.y) {
				expect(Object.keys(y).sort()).toEqual(KHOA_DAY_DU);
			}
			expect(r.y[1]).toMatchObject({
				tacGia: { id: "u2", ten: "Tên u2" },
				soDongY: 3,
			});
		});

		test(`người chọn đã niêm phong (${tt}): tên và số, theo thời điểm tạo`, () => {
			const r = chieuYChoNguoiXem(ds, xem("ceo", true, true, true, tt));
			expect(r.khoa).toBe(false);
			expect(r.y.map((y) => y.id)).toEqual(["y1", "y2", "y3", "y4", "y5"]);
			for (const y of r.y) {
				expect(Object.keys(y).sort()).toEqual(KHOA_DAY_DU);
			}
		});

		test(`người chọn chưa niêm phong (${tt}): khoá, không ý nào`, () => {
			expect(chieuYChoNguoiXem(ds, xem("ceo", true, true, false, tt))).toEqual({
				khoa: true,
				y: [],
			});
		});
	}

	const nhieu = Array.from({ length: 12 }, (_, i) =>
		yTho(`k${i}`, `t${i}`, i, i),
	);

	test("thứ tự của thành viên: cùng người thì cùng thứ tự, khác người thì khác", () => {
		const a1 = chieuYChoNguoiXem(
			nhieu,
			xem("ua", false, false, false, "dang-mo"),
		);
		const a2 = chieuYChoNguoiXem(
			[...nhieu].reverse(),
			xem("ua", false, false, false, "dang-mo"),
		);
		const b = chieuYChoNguoiXem(
			nhieu,
			xem("ub", false, false, false, "dang-mo"),
		);
		const ids = (r: typeof a1) => r.y.map((y) => y.id);
		expect(ids(a1)).toEqual(ids(a2));
		expect(ids(a1)).not.toEqual(ids(b));
		expect([...ids(a1)].sort()).toEqual([...ids(b)].sort());
	});

	test("thứ tự của thành viên không theo thời điểm tạo", () => {
		const r = chieuYChoNguoiXem(
			nhieu,
			xem("ua", false, false, false, "dang-mo"),
		);
		expect(r.y.map((y) => y.id)).not.toEqual(nhieu.map((y) => y.id));
	});

	test("hạt xáo là hoiYId:userId của người xem", () => {
		const r = chieuYChoNguoiXem(
			nhieu,
			xem("ua", false, false, false, "dang-mo"),
		);
		expect(r.y.map((y) => y.id)).toEqual(
			thuTuXao(
				nhieu.map((y) => y.id),
				"hy1:ua",
			),
		);
	});

	test("cùng người xem, khác lần hỏi ý thì khác thứ tự", () => {
		const theo = (hoiYId: string) =>
			chieuYChoNguoiXem(nhieu, {
				...xem("ua", false, false, false, "dang-mo"),
				hoiYId,
			}).y.map((y) => y.id);
		expect(theo("hy1")).not.toEqual(theo("hy2"));
		expect(theo("hy2")).toEqual(
			thuTuXao(
				nhieu.map((y) => y.id),
				"hy2:ua",
			),
		);
	});
});

describe("doc-ban-truoc", () => {
	const ban = {
		cau: ["Câu một dài đủ", "Câu hai dài đủ", "Câu ba dài đủ"],
		boQua: false,
		vietBoi: "Nguyễn A",
	};
	const xem = (laNguoiChon: boolean, trangThai: TrangThaiHoiY) => ({
		laNguoiChon,
		trangThai,
	});

	test("người chọn đọc được ở mọi trạng thái", () => {
		for (const tt of ["dang-mo", "dang-gom", "da-cong-bo"] as const) {
			expect(docBanTruoc(ban, xem(true, tt))).toEqual(ban);
		}
	});

	test("sau công bố mọi người đọc được", () => {
		expect(docBanTruoc(ban, xem(false, "da-cong-bo"))).toEqual(ban);
	});

	test("trước công bố người khác, kể cả quản trị, không đọc được", () => {
		expect(docBanTruoc(ban, xem(false, "dang-mo"))).toBeNull();
		expect(docBanTruoc(ban, xem(false, "dang-gom"))).toBeNull();
	});

	test("chưa có bản viết trước thì null", () => {
		expect(docBanTruoc(null, xem(true, "da-cong-bo"))).toBeNull();
	});

	test("khai không viết trước vẫn trả để màn nói rõ", () => {
		const boQua = { cau: [], boQua: true, vietBoi: "Nguyễn A" };
		expect(docBanTruoc(boQua, xem(false, "da-cong-bo"))).toEqual(boQua);
	});
});

describe("chieu-chu-de", () => {
	const luc2 = (phut: number) => new Date(Date.UTC(2026, 9, 1, 3, phut));
	const yTho = (
		id: string,
		tacGiaUserId: string,
		chuDeId: string | null,
		soDongY: number,
		phut: number,
		phongBanId: string | null,
	): YTho => ({
		id,
		noiDung: `nội dung ${id}`,
		viSao: `vì sao ${id}`,
		doBangGi: `đo ${id}`,
		chuDeId,
		tacGiaUserId,
		tacGiaTen: `Tên ${tacGiaUserId}`,
		phongBanId,
		soDongY,
		daDongY: false,
		createdAt: luc2(phut),
	});
	const chuDe = (
		id: string,
		viTri: number,
		phan: Partial<ChuDeTho> = {},
	): ChuDeTho => ({
		id,
		loai: "chu-de",
		ten: `Chủ đề ${id}`,
		ketLuan: null,
		lyDo: "",
		cauMucTieu: "",
		noiBanTruoc: null,
		objectiveId: null,
		viTri,
		...phan,
	});
	const ds: YTho[] = [
		yTho("y1", "u1", "c1", 3, 1, "pb1"),
		yTho("y2", "u2", "c1", 0, 2, "pb2"),
		yTho("y3", "u3", "c1", 2, 3, "pb2"),
		yTho("y4", "u4", "c2", 1, 4, null),
		yTho("y5", "u1", null, 0, 5, "pb1"),
	];
	const cd: ChuDeTho[] = [
		chuDe("c2", 1, { ketLuan: "de-sau", lyDo: "Để kỳ sau khi đủ người." }),
		chuDe("c1", 0, {
			ketLuan: "chon",
			lyDo: "Đúng hướng năm tới.",
			cauMucTieu: "Giao lạnh có lãi",
			noiBanTruoc: "cau-1",
		}),
	];
	const xem = (
		userId: string,
		laQuanTri: boolean,
		laNguoiChon: boolean,
		daNiemPhong: boolean,
		tt: TrangThaiHoiY,
	) => ({
		userId,
		laQuanTri,
		laNguoiChon,
		daNiemPhong,
		hoiYId: "hy1",
		trangThai: tt,
	});

	test("dang-mo: không ai thấy chủ đề", () => {
		for (const [qt, nc, np] of [
			[false, false, false],
			[true, false, false],
			[true, true, true],
		] as const)
			expect(
				chieuChuDeChoNguoiXem(cd, ds, xem("me", qt, nc, np, "dang-mo")),
			).toBeNull();
	});

	test("dang-gom: quản trị và người chọn đã niêm phong thấy; thành viên và người chọn chưa niêm phong không", () => {
		expect(
			chieuChuDeChoNguoiXem(cd, ds, xem("me", false, false, false, "dang-gom")),
		).toBeNull();
		expect(
			chieuChuDeChoNguoiXem(cd, ds, xem("ceo", true, true, false, "dang-gom")),
		).toBeNull();
		expect(
			chieuChuDeChoNguoiXem(cd, ds, xem("qt", true, false, false, "dang-gom"))
				?.length,
		).toBe(2);
		expect(
			chieuChuDeChoNguoiXem(cd, ds, xem("ceo", true, true, true, "dang-gom"))
				?.length,
		).toBe(2);
	});

	test("da-cong-bo: mọi vai thấy chủ đề", () => {
		for (const [qt, nc] of [
			[false, false],
			[true, false],
			[true, true],
		] as const)
			expect(
				chieuChuDeChoNguoiXem(cd, ds, xem("me", qt, nc, true, "da-cong-bo"))
					?.length,
			).toBe(2);
	});

	test("thứ tự theo viTri, mỗi chủ đề mang đúng các khoá", () => {
		const r = chieuChuDeChoNguoiXem(
			cd,
			ds,
			xem("ceo", true, true, true, "dang-gom"),
		);
		expect(r?.map((c) => c.id)).toEqual(["c1", "c2"]);
		expect(Object.keys(r?.[0] ?? {}).sort()).toEqual([
			"bangChung",
			"cauMucTieu",
			"id",
			"ketLuan",
			"loai",
			"lyDo",
			"noiBanTruoc",
			"objectiveId",
			"ten",
			"y",
		]);
		expect(r?.[0]?.noiBanTruoc).toBe("cau-1");
	});

	test("quản trị dang-gom: bằng chứng đủ bốn khoá, ý kèm tên và số, theo thời điểm tạo", () => {
		const r = chieuChuDeChoNguoiXem(
			cd,
			ds,
			xem("qt", true, false, false, "dang-gom"),
		);
		expect(r?.[0]?.bangChung).toEqual({
			soNguoi: 3,
			soDonVi: 2,
			soDongY: 5,
			trich: ["nội dung y1", "nội dung y3"],
		});
		expect(r?.[0]?.y.map((y) => y.id)).toEqual(["y1", "y2", "y3"]);
		expect(r?.[0]?.y[0]).toMatchObject({
			tacGia: { id: "u1", ten: "Tên u1" },
			soDongY: 3,
			chuDeId: "c1",
		});
		expect(r?.[1]?.bangChung.soDonVi).toBe(1);
	});

	test("thành viên sau công bố: ý không tên, không số, bằng chứng không có soDongY, chuDeId giữ", () => {
		const r = chieuChuDeChoNguoiXem(
			cd,
			ds,
			xem("me", false, false, false, "da-cong-bo"),
		);
		expect(r?.[0]?.bangChung).toEqual({
			soNguoi: 3,
			soDonVi: 2,
			trich: ["nội dung y1", "nội dung y3"],
		});
		const chu = JSON.stringify(r);
		for (const cam of ["Tên u", '"soDongY"', '"tacGia"', '"createdAt"'])
			expect(chu.includes(cam), cam).toBe(false);
		expect(r?.[0]?.y.every((y) => y.chuDeId === "c1")).toBe(true);
	});

	test("thành viên không thấy ý của chính mình trong chủ đề nhưng bằng chứng vẫn đếm", () => {
		const r = chieuChuDeChoNguoiXem(
			cd,
			ds,
			xem("u2", false, false, false, "da-cong-bo"),
		);
		expect(r?.[0]?.y.map((y) => y.id).sort()).toEqual(["y1", "y3"]);
		expect(r?.[0]?.bangChung.soNguoi).toBe(3);
	});

	test("chủ đề rỗng: bằng chứng 0, trích rỗng, không ý", () => {
		const r = chieuChuDeChoNguoiXem(
			[chuDe("rong", 0)],
			ds,
			xem("ceo", true, true, true, "dang-gom"),
		);
		expect(r).toEqual([
			{
				id: "rong",
				loai: "chu-de",
				ten: "Chủ đề rong",
				ketLuan: null,
				lyDo: "",
				cauMucTieu: "",
				noiBanTruoc: null,
				objectiveId: null,
				bangChung: { soNguoi: 0, soDonVi: 0, soDongY: 0, trich: [] },
				y: [],
			},
		]);
	});

	test("trước công bố quản trị không phải người chọn không thấy câu mục tiêu và chỗ nối; người chọn và mọi người sau công bố thấy thật", () => {
		const cua = (qt: boolean, nc: boolean, np: boolean, tt: TrangThaiHoiY) =>
			chieuChuDeChoNguoiXem(cd, ds, xem("me", qt, nc, np, tt))?.map((c) => ({
				id: c.id,
				cau: c.cauMucTieu,
				noi: c.noiBanTruoc,
				ketLuan: c.ketLuan,
				lyDo: c.lyDo,
			}));
		expect(cua(true, false, false, "dang-gom")).toEqual([
			{
				id: "c1",
				cau: null,
				noi: null,
				ketLuan: "chon",
				lyDo: "Đúng hướng năm tới.",
			},
			{
				id: "c2",
				cau: null,
				noi: null,
				ketLuan: "de-sau",
				lyDo: "Để kỳ sau khi đủ người.",
			},
		]);
		const that: NonNullable<ReturnType<typeof cua>> = [
			{
				id: "c1",
				cau: "Giao lạnh có lãi",
				noi: "cau-1",
				ketLuan: "chon",
				lyDo: "Đúng hướng năm tới.",
			},
			{
				id: "c2",
				cau: "",
				noi: null,
				ketLuan: "de-sau",
				lyDo: "Để kỳ sau khi đủ người.",
			},
		];
		expect(cua(true, true, true, "dang-gom")).toEqual(that);
		expect(cua(true, false, true, "da-cong-bo")).toEqual(that);
		expect(cua(false, false, true, "da-cong-bo")).toEqual(that);
	});

	test("chưa kết luận: lý do và câu mục tiêu là chuỗi rỗng", () => {
		const r = chieuChuDeChoNguoiXem(
			[chuDe("c1", 0)],
			ds,
			xem("ceo", true, true, true, "dang-gom"),
		);
		expect({ lyDo: r?.[0]?.lyDo, cau: r?.[0]?.cauMucTieu }).toEqual({
			lyDo: "",
			cau: "",
		});
	});
});

describe("chieu-y-chu-de-id", () => {
	const yTho = (id: string, tacGiaUserId: string, chuDeId: string): YTho => ({
		id,
		noiDung: `nội dung ${id}`,
		viSao: "",
		doBangGi: "",
		chuDeId,
		tacGiaUserId,
		tacGiaTen: `Tên ${tacGiaUserId}`,
		phongBanId: null,
		soDongY: 1,
		daDongY: false,
		createdAt: luc(1),
	});
	const ds = [yTho("y1", "u1", "c1"), yTho("y2", "u2", "c1")];
	const xem = (
		laQuanTri: boolean,
		laNguoiChon: boolean,
		daNiemPhong: boolean,
		trangThai: TrangThaiHoiY,
	) => ({
		userId: "me",
		laQuanTri,
		laNguoiChon,
		daNiemPhong,
		hoiYId: "hy1",
		trangThai,
	});
	const chuDeId = (r: ReturnType<typeof chieuYChoNguoiXem>) =>
		r.y.map((y) => y.chuDeId);

	test("thành viên trước công bố: mọi chuDeId null", () => {
		expect(
			chuDeId(chieuYChoNguoiXem(ds, xem(false, false, false, "dang-mo"))),
		).toEqual([null, null]);
		expect(
			chuDeId(chieuYChoNguoiXem(ds, xem(false, false, false, "dang-gom"))),
		).toEqual([null, null]);
	});

	test("thành viên sau công bố: chuDeId thật", () => {
		expect(
			chuDeId(chieuYChoNguoiXem(ds, xem(false, false, false, "da-cong-bo"))),
		).toEqual(["c1", "c1"]);
	});

	test("quản trị và người chọn đã niêm phong: chuDeId thật ở mọi trạng thái", () => {
		for (const tt of ["dang-mo", "dang-gom", "da-cong-bo"] as const) {
			expect(
				chuDeId(chieuYChoNguoiXem(ds, xem(true, false, false, tt))),
			).toEqual(["c1", "c1"]);
			expect(chuDeId(chieuYChoNguoiXem(ds, xem(true, true, true, tt)))).toEqual(
				["c1", "c1"],
			);
		}
	});
});

describe("gan-y-khuon", () => {
	const gop = { yIds: ["y1", "y2"], chuDeId: "c1" };
	const cauLoi = (v: VaoThu) => {
		const r = ganYInput.safeParse(v);
		return r.success ? null : r.error.issues.map((i) => i.message);
	};

	test("nhận: nhiều ý vào một chủ đề; đúng một ý là ý lạ", () => {
		expect(ganYInput.safeParse(gop).success).toBe(true);
		expect(ganYInput.safeParse({ yIds: ["y1"], chuDeId: "c1" }).success).toBe(
			true,
		);
		expect(ganYInput.safeParse({ yIds: ["y1"], yLa: true }).success).toBe(true);
		const nam = Array.from({ length: OKR_HOI_Y.ganToiDa }, (_, i) => `y${i}`);
		expect(ganYInput.safeParse({ yIds: nam, chuDeId: "c1" }).success).toBe(
			true,
		);
	});

	test("từ chối: hai đích, không đích, yLa false, yLa nhiều ý, khoá lạ, rỗng, quá trần", () => {
		const nam = Array.from(
			{ length: OKR_HOI_Y.ganToiDa + 1 },
			(_, i) => `y${i}`,
		);
		expect(cauLoi({ yIds: ["y1"], chuDeId: "c1", yLa: true })).toEqual([
			OKR_HOI_Y.gan.motTrongHai,
		]);
		expect(cauLoi({ yIds: ["y1"] })).toEqual([OKR_HOI_Y.gan.motTrongHai]);
		expect(cauLoi({ yIds: ["y1"], yLa: false })).not.toBeNull();
		expect(cauLoi({ yIds: ["y1", "y2"], yLa: true })).toEqual([
			OKR_HOI_Y.gan.yLaMotY,
		]);
		expect(cauLoi({ ...gop, thua: 1 })).not.toBeNull();
		expect(cauLoi({ yIds: [], chuDeId: "c1" })).not.toBeNull();
		expect(cauLoi({ yIds: nam, chuDeId: "c1" })).not.toBeNull();
	});
});

describe("ket-luan-khuon", () => {
	const vao = {
		chuDeId: "c1",
		ketLuan: "chon",
		lyDo: "Đúng hướng năm tới của công ty.",
		cauMucTieu: "Giao lạnh có lãi",
		noiBanTruoc: "cau-1",
	};
	const loi = (v: VaoThu) => {
		const r = ketLuanInput.safeParse(v);
		return r.success ? null : r.error.issues.map((i) => i.message);
	};

	test("nhận chọn có câu mục tiêu; để sau không cần câu mục tiêu", () => {
		expect(loi(vao)).toBeNull();
		expect(
			loi({ ...vao, ketLuan: "de-sau", cauMucTieu: "", noiBanTruoc: null }),
		).toBeNull();
	});

	test("từ chối: chọn thiếu câu mục tiêu, lý do 9 ký tự, nối tới mã lạ", () => {
		expect(loi({ ...vao, cauMucTieu: "" })).toEqual([
			OKR_HOI_Y.ketLuan.canCauMucTieu,
		]);
		expect(
			loi({ ...vao, lyDo: "ý".repeat(OKR_HOI_Y.lyDo.min - 1) }),
		).not.toBeNull();
		expect(loi({ ...vao, noiBanTruoc: "cau-6" })).not.toBeNull();
	});
});

describe("noi-ban-truoc-khuon", () => {
	test("số câu và mã nối là hai chiều của cùng một danh mục", () => {
		expect(NOI_BAN_TRUOC.map((n) => soCauCuaNoi(n))).toEqual([
			1,
			2,
			3,
			4,
			5,
			null,
		]);
		expect(soCauCuaNoi(NOI_MOI)).toBeNull();
		expect([1, 2, 3, 4, 5].map(noiTuSoCau)).toEqual([
			"cau-1",
			"cau-2",
			"cau-3",
			"cau-4",
			"cau-5",
		]);
		expect(noiTuSoCau(0)).toBeNull();
		expect(noiTuSoCau(6)).toBeNull();
	});
});

describe("ten-y-la", () => {
	test("ngắn hơn trần giữ nguyên", () => {
		expect(tenYLa("Mở tuyến giao lạnh")).toBe("Mở tuyến giao lạnh");
	});

	test("chữ thường dài hơn trần: cắt đúng trần của tên chủ đề", () => {
		const y = "a".repeat(OKR_HOI_Y.tenChuDe.max + 30);
		expect(tenYLa(y)).toBe("a".repeat(OKR_HOI_Y.tenChuDe.max));
	});

	test("ký tự hai đơn vị ở ranh giới không bị cắt đôi và không làm tên vượt trần", () => {
		const dau = "a".repeat(OKR_HOI_Y.tenChuDe.max - 1);
		const ten = tenYLa(`${dau}😀 đuôi còn lại`);
		expect(ten).toBe(dau);
		expect(ten.length).toBeLessThanOrEqual(OKR_HOI_Y.tenChuDe.max);
	});

	test("nhiều ký tự hai đơn vị: tên có đúng số ký tự vừa trần", () => {
		const ten = tenYLa("😀".repeat(OKR_HOI_Y.tenChuDe.max));
		expect(ten.length).toBe(OKR_HOI_Y.tenChuDe.max);
		expect(Array.from(ten).length).toBe(OKR_HOI_Y.tenChuDe.max / 2);
	});

	test("tên ý lạ qua được khuôn tạo và đổi tên chủ đề", () => {
		const dau = "a".repeat(OKR_HOI_Y.tenChuDe.max - 1);
		for (const y of [`${dau}😀 đuôi`, "😀".repeat(300), "a".repeat(300)]) {
			const ten = tenYLa(y);
			expect(taoChuDeInput.safeParse({ hoiYId: "h1", ten }).success).toBe(true);
			expect(suaChuDeInput.safeParse({ chuDeId: "c1", ten }).success).toBe(
				true,
			);
		}
	});
});

describe("tinh-trang-cong-bo", () => {
	const chuDe = (id: string, ketLuan: string | null) => ({
		id,
		loai: "chu-de" as const,
		ten: `Chủ đề ${id}`,
		soY: 1,
		ketLuan,
		lyDo: "Lý do đủ dài để qua",
		cauMucTieu: "Tăng doanh thu",
		noiBanTruoc: "moi",
	});
	const vao = {
		ban: { boQua: false },
		yChuaGom: 0,
		chuDe: [chuDe("c1", "chon"), chuDe("c2", "chon"), chuDe("c3", "de-sau")],
		soMucTieuHienCo: 4,
		objectiveCap: 5,
		capMode: "chan" as const,
	};

	test("có bản viết trước: coBanTruoc đúng, tổng cấp OneHub sau công bố = hiện có + số chủ đề chọn", () => {
		const tt = tinhTrangCongBo(vao);
		expect({
			coBanTruoc: tt.coBanTruoc,
			boQua: tt.boQua,
			tongOneHubSau: tt.tongOneHubSau,
		}).toEqual({ coBanTruoc: true, boQua: false, tongOneHubSau: 6 });
		expect(lyDoChuaCongBo(tt)).toEqual([{ ma: "vuot-tran", chuDeId: null }]);
	});

	test("khai không viết trước: không phải chưa niêm phong", () => {
		const tt = tinhTrangCongBo({ ...vao, ban: { boQua: true } });
		expect({ coBanTruoc: tt.coBanTruoc, boQua: tt.boQua }).toEqual({
			coBanTruoc: false,
			boQua: true,
		});
		expect(lyDoChuaCongBo(tt).map((l) => l.ma)).not.toContain(
			"chua-niem-phong",
		);
	});

	test("không có hàng viết trước: chưa niêm phong", () => {
		expect(
			lyDoChuaCongBo(tinhTrangCongBo({ ...vao, ban: null })).map((l) => l.ma),
		).toContain("chua-niem-phong");
	});
});

describe("ket-qua-cong-bo", () => {
	const chu = (
		id: string,
		viTri: number,
		rieng: Partial<ChuDeTho> = {},
	): ChuDeTho => ({
		id,
		loai: "chu-de",
		ten: `Chủ đề ${id}`,
		ketLuan: "chon",
		lyDo: "Lý do đủ dài",
		cauMucTieu: `Câu ${id}`,
		noiBanTruoc: "moi",
		objectiveId: `mt-${id}`,
		viTri,
		...rieng,
	});
	const ban = { cau: ["Câu c2", "Câu khác"], boQua: false, vietBoi: "Phan P" };

	test("chưa công bố thì không có kết quả, kể cả người chọn", () => {
		for (const t of ["dang-mo", "dang-gom"] as const)
			expect(ketQuaCongBo(ban, [chu("c1", 0)], t)).toBeNull();
	});

	test("không có bản viết trước để đọc thì không có kết quả", () => {
		expect(ketQuaCongBo(null, [chu("c1", 0)], "da-cong-bo")).toBeNull();
	});

	test("chỉ chủ đề chọn, xếp theo viTri, kèm vietBoi và mục tiêu; giữ-đổi-thêm-bỏ từ ketQuaBanTruoc", () => {
		const r = ketQuaCongBo(
			ban,
			[
				chu("c3", 2, { noiBanTruoc: "moi" }),
				chu("c9", 5, { ketLuan: "de-sau", objectiveId: null }),
				chu("c2", 1, { noiBanTruoc: "cau-1", cauMucTieu: "câu  C2 " }),
			],
			"da-cong-bo",
		);
		expect(r).toEqual({
			cau: ["giu", "bo"],
			doi: 0,
			them: 1,
			boQua: false,
			vietBoi: "Phan P",
			chon: [
				{
					chuDeId: "c2",
					ten: "Chủ đề c2",
					cauMucTieu: "câu  C2 ",
					noiBanTruoc: "cau-1",
					objectiveId: "mt-c2",
				},
				{
					chuDeId: "c3",
					ten: "Chủ đề c3",
					cauMucTieu: "Câu c3",
					noiBanTruoc: "moi",
					objectiveId: "mt-c3",
				},
			],
		});
	});

	test("khai không viết trước: chủ đề chọn chưa khai nối được tính là mới", () => {
		const r = ketQuaCongBo(
			{ cau: [], boQua: true, vietBoi: "Phan P" },
			[
				chu("c1", 0, { noiBanTruoc: null }),
				chu("c2", 1, { noiBanTruoc: null }),
			],
			"da-cong-bo",
		);
		expect(r?.cau).toEqual([]);
		expect(r?.them).toBe(2);
		expect(r?.boQua).toBe(true);
		expect(r?.chon.map((c) => c.noiBanTruoc)).toEqual(["moi", "moi"]);
	});
});

describe("chieu-y-cua-toi", () => {
	const y = (id: string, chuDeId: string | null, ganPhut: number | null) => ({
		id,
		noiDung: `ý ${id}`,
		viSao: "",
		doBangGi: "",
		chuDeId,
		createdAt: luc(1),
		ganLuc: ganPhut === null ? null : luc(ganPhut),
	});
	const chuDe: ChuDeTho[] = [
		{
			id: "c1",
			loai: "chu-de",
			ten: "Giao lạnh",
			ketLuan: "chon",
			lyDo: "Đúng hướng",
			cauMucTieu: "Giao lạnh có lãi",
			noiBanTruoc: "moi",
			objectiveId: "mt1",
			viTri: 0,
		},
	];
	const ra = (t: TrangThaiHoiY) =>
		chieuYCuaToi([y("y1", "c1", 5), y("y2", null, null)], chuDe, {
			trangThai: t,
			congBoLuc: t === "da-cong-bo" ? luc(9) : null,
		});

	test("trước công bố: chủ đề, kết luận, lý do, mục tiêu và mốc vào chủ đề, mốc kết luận đều null", () => {
		for (const t of ["dang-mo", "dang-gom"] as const)
			expect(
				ra(t).map((x) => [
					x.chuDe,
					x.ketLuan,
					x.lyDo,
					x.objectiveId,
					x.hanhTrinh.vaoChuDeLuc,
					x.hanhTrinh.ketLuanLuc,
					x.hanhTrinh.gopLuc,
				]),
			).toEqual([
				[null, null, null, null, null, null, luc(1).toISOString()],
				[null, null, null, null, null, null, luc(1).toISOString()],
			]);
	});

	test("sau công bố: ý trong chủ đề có đủ hành trình; ý không có chủ đề vẫn null", () => {
		const [a, b] = ra("da-cong-bo");
		expect(a).toEqual({
			id: "y1",
			noiDung: "ý y1",
			viSao: "",
			doBangGi: "",
			createdAt: luc(1).toISOString(),
			chuDe: { id: "c1", ten: "Giao lạnh" },
			ketLuan: "chon",
			lyDo: "Đúng hướng",
			objectiveId: "mt1",
			hanhTrinh: {
				gopLuc: luc(1).toISOString(),
				vaoChuDeLuc: luc(5).toISOString(),
				ketLuanLuc: luc(9).toISOString(),
			},
		});
		expect(b?.chuDe).toBeNull();
		expect(b?.hanhTrinh.ketLuanLuc).toBeNull();
	});
});
