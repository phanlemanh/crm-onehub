import { describe, expect, test } from "bun:test";
import type { DongSoan } from "@/app/(app)/[slug]/okr/soan/kieu";
import { lyDoTuChoiLuot } from "@/app/(app)/[slug]/okr/soan/loi-cua";
import {
	cayNhap,
	demDong,
	demDuaVao,
	duongTheoDonVi,
	krDuaVao,
	krThieuSo,
	soBanNhap,
} from "@/app/(app)/[slug]/okr/soan/luat-ban-nhap";
import {
	tachCauHoi,
	tachLuotTroLy,
} from "@/app/(app)/[slug]/okr/soan/tach-cau-hoi";

type TrangThai = DongSoan["trangThai"];

const goc = {
	viSao: "vì",
	trangThai: "cho" as TrangThai,
	maLoai: null,
	giaTriCuoi: null,
	taoRaId: null,
};

const mt = (
	id: string,
	ten: string,
	trangThai: TrangThai = "cho",
	khoaDong = `mt-${id}`,
): DongSoan => ({
	...goc,
	id,
	khoa: `mt:${id}`,
	khoaDong,
	loai: "muc-tieu-moi",
	ten,
	viSaoLucNay: "vì lúc này",
	loaiMucTieu: "cam-ket",
	trangThai,
});

const kr = (
	id: string,
	cha: string,
	ten: string,
	trangThai: TrangThai = "cho",
	kieu: "tang-toi" | "moc" = "tang-toi",
): DongSoan => ({
	...goc,
	id,
	khoa: `kr:${id}`,
	khoaDong: `kr-${id}`,
	chaKhoa: `mt:${cha}`,
	loai: "kr-moi",
	ten,
	kieu,
	donVi: "khách",
	khoiDiemGoiY: 3,
	trangThai,
});

const cc = (id: string, cha: string): DongSoan => ({
	...goc,
	id,
	khoa: `cc:${id}`,
	khoaDong: `cc-${id}`,
	chaKhoa: `mt:${cha}`,
	loai: "can-chinh-moi",
	dichId: "dich-1",
	tenDich: "Mục tiêu cấp trên",
});

describe("luat-ban-nhap", () => {
	test("cayNhap gom KR và căn chỉnh dưới Mục tiêu theo chaKhoa, bỏ dòng mồ côi", () => {
		const cay = cayNhap([
			mt("1", "A"),
			kr("11", "1", "K"),
			cc("12", "1"),
			kr("99", "x", "mồ côi"),
		]);
		expect(
			cay.map((k) => [
				k.mucTieu.id,
				k.kr.map((x) => x.id),
				k.canChinh.map((x) => x.id),
			]),
		).toEqual([["1", ["11"], ["12"]]]);
	});

	test("soBanNhap so theo khoaDong: vừa thêm · vừa sửa · vừa chuyển · đã bỏ", () => {
		const truoc = [
			mt("1", "A"),
			mt("2", "B"),
			kr("11", "1", "K1"),
			kr("21", "2", "K2"),
		];
		const sau = [
			mt("1", "A đổi"),
			kr("11", "1", "K1"),
			kr("21", "1", "K2"),
			mt("3", "C"),
		];
		const { dong, nhan } = soBanNhap(truoc, sau);
		expect(Object.fromEntries(nhan)).toEqual({
			"mt-1": "vua-sua",
			"kr-21": "vua-chuyen",
			"mt-3": "vua-them",
			"mt-2": "da-bo",
		});
		expect(dong.find((d) => d.id === "2")?.trangThai).toBe("bac");
		expect(dong.filter((d) => d.khoaDong === "mt-2")).toHaveLength(1);
	});

	test("soBanNhap: đổi tên đổi khoaDong thì là dòng mới và dòng cũ đã bỏ", () => {
		const { nhan } = soBanNhap(
			[mt("1", "A", "cho", "muc-tieu-moi:a")],
			[mt("7", "B", "cho", "muc-tieu-moi:b")],
		);
		expect(Object.fromEntries(nhan)).toEqual({
			"muc-tieu-moi:b": "vua-them",
			"muc-tieu-moi:a": "da-bo",
		});
	});

	test("soBanNhap: dòng đã quyết biến mất không thành «đã bỏ», dòng không đổi không có nhãn", () => {
		const { dong, nhan } = soBanNhap(
			[mt("1", "A", "nhan"), mt("2", "B")],
			[mt("2", "B")],
		);
		expect(nhan.size).toBe(0);
		expect(dong.map((d) => d.id)).toEqual(["2"]);
	});

	test("soBanNhap lần đọc đầu (truoc rỗng) không gắn nhãn", () => {
		expect(soBanNhap([], [mt("1", "A")]).nhan.size).toBe(0);
	});

	test("krThieuSo: chỉ KR đã nhận/sửa dưới Mục tiêu đã nhận mà thiếu khởi điểm hay đích; mốc không cần số", () => {
		const cay = cayNhap([
			mt("1", "A", "nhan"),
			kr("11", "1", "K1", "nhan"),
			kr("12", "1", "K2", "nhan", "moc"),
			kr("13", "1", "K3"),
			mt("2", "B"),
			kr("21", "2", "K4", "nhan"),
		]);
		expect(krThieuSo(cay, { "11": { khoiDiem: "3", dich: "" } })).toEqual([
			"11",
		]);
		expect(krThieuSo(cay, { "11": { khoiDiem: "3", dich: "9" } })).toEqual([]);
		expect(krThieuSo(cay, { "11": { khoiDiem: "abc", dich: "9" } })).toEqual([
			"11",
		]);
		expect(krThieuSo(cay, {})).toEqual(["11"]);
	});

	test("demDong đếm Mục tiêu và dòng con đang hiện, bỏ mồ côi", () => {
		expect(
			demDong(
				cayNhap([
					mt("1", "A"),
					kr("11", "1", "K"),
					cc("12", "1"),
					mt("2", "B"),
					kr("99", "x", "mồ côi"),
				]),
			),
		).toBe(4);
	});

	test("demDuaVao đếm Mục tiêu và KR đã nhận/sửa, không đếm bác", () => {
		const cay = cayNhap([
			mt("1", "A", "nhan"),
			kr("11", "1", "K", "sua"),
			kr("12", "1", "K", "bac"),
			mt("2", "B", "bac"),
			kr("21", "2", "K", "nhan"),
		]);
		expect(demDuaVao(cay)).toEqual({ soMucTieu: 1, soKr: 1 });
	});

	test("krDuaVao gửi số người gõ cho KR đã nhận, không gửi gì cho mốc", () => {
		const cay = cayNhap([
			mt("1", "A", "nhan"),
			kr("11", "1", "K1", "nhan"),
			kr("12", "1", "K2", "sua", "moc"),
			kr("13", "1", "K3", "bac"),
		]);
		expect(
			krDuaVao(cay, {
				"11": { khoiDiem: " 3,5 ", dich: "10" },
				"12": { khoiDiem: "0", dich: "1" },
			}),
		).toEqual([{ deXuatId: "11", khoiDiem: 3.5, dich: 10 }]);
	});

	test("duongTheoDonVi dựng đường Theo đơn vị cho ba cấp", () => {
		const goc = { cycleId: "q1", divisionId: null, departmentId: null };
		expect(duongTheoDonVi("ws", { ...goc, level: "onehub" })).toBe(
			"/ws/okr/theo-don-vi?kyOkr=q1&donOkr=goc",
		);
		expect(
			duongTheoDonVi("ws", { ...goc, level: "bo-phan", divisionId: "bp-1" }),
		).toBe("/ws/okr/theo-don-vi?kyOkr=q1&donOkr=bp%3Abp-1");
		expect(
			duongTheoDonVi("ws", {
				...goc,
				level: "phong-ban",
				departmentId: "pb-1",
			}),
		).toBe("/ws/okr/theo-don-vi?kyOkr=q1&donOkr=pb%3Apb-1");
	});
});

describe("tach-cau-hoi", () => {
	const chu =
		"Kỳ trước phòng đạt 91%.\n\n1. Quý này ưu tiên giữ khách hay mở tuyến?\n   - gợi ý: Giữ khách · Mở tuyến\n2. Có số nào phải báo cáo?\n- gợi ý: Có, doanh thu | Không\nCâu không hỏi.";

	test("đọc câu hỏi đánh số và dòng gợi ý", () => {
		expect(tachCauHoi(chu)).toEqual([
			{
				hoi: "Quý này ưu tiên giữ khách hay mở tuyến?",
				goiY: ["Giữ khách", "Mở tuyến"],
			},
			{ hoi: "Có số nào phải báo cáo?", goiY: ["Có, doanh thu", "Không"] },
		]);
	});

	test("khuôn lời dặn tĩnh của Trợ lý đọc ra đủ câu và gợi ý", () => {
		const khuon =
			"1. Quý này đơn vị muốn ưu tiên điều gì nhất?\n- gợi ý: Giữ nhịp đang có · Mở một hướng mới\n2. Có con số nào đơn vị đã cam kết với cấp trên?\n- gợi ý: Có, tôi sẽ gõ số · Chưa có";
		expect(tachCauHoi(khuon).map((c) => c.goiY.length)).toEqual([2, 2]);
	});

	test("không có câu hỏi → mảng rỗng", () => {
		expect(tachCauHoi("Đã tạo bản nháp.")).toEqual([]);
	});

	test("tachLuotTroLy tách lời dẫn khỏi các dòng câu hỏi và gợi ý", () => {
		const luot = tachLuotTroLy(chu);
		expect(luot.loiDan).toBe("Kỳ trước phòng đạt 91%.\n\nCâu không hỏi.");
		expect(luot.cauHoi).toHaveLength(2);
		expect(tachLuotTroLy("Đã tạo bản nháp.")).toEqual({
			loiDan: "Đã tạo bản nháp.",
			cauHoi: [],
		});
	});
});

describe("loi-cua", () => {
	const loi = (status: number, body: string) =>
		Object.assign(new Error("x"), { status, body });

	test("đọc lý do từ chối lượt khi mã và trạng thái khớp cửa", () => {
		expect(lyDoTuChoiLuot(loi(429, '{"error":"het-luot-cuoc"}'))).toBe(
			"het-luot-cuoc",
		);
		expect(lyDoTuChoiLuot(loi(503, '{"error":"chua-co-khoa-mo-hinh"}'))).toBe(
			"chua-co-khoa-mo-hinh",
		);
	});

	test("không phải từ chối lượt thì null", () => {
		expect(lyDoTuChoiLuot(loi(403, '{"error":"het-luot-cuoc"}'))).toBeNull();
		expect(lyDoTuChoiLuot(loi(429, '{"error":"la"}'))).toBeNull();
		expect(lyDoTuChoiLuot(loi(429, "khong phai json"))).toBeNull();
		expect(lyDoTuChoiLuot(new Error("mat mang"))).toBeNull();
		expect(lyDoTuChoiLuot(undefined)).toBeNull();
	});
});
