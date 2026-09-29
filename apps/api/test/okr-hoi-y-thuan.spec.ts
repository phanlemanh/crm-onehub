import { describe, expect, test } from "bun:test";
import type { TrangThaiHoiY } from "@crm/validation/okr-hoi-y";
import { thuTuXao } from "@crm/validation/okr-hoi-y";
import {
	bangChungChuDe,
	chieuYChoNguoiXem,
	docBanTruoc,
	doPhu,
	ketQuaBanTruoc,
	lyDoChuaCongBo,
	type MaThieu,
	type YTho,
} from "../src/okr/hoi-y";

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
