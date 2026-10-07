import { describe, expect, test } from "bun:test";
import { chuanHoa } from "@crm/validation/okr-kiem";
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
import { khoaSo } from "@/app/(app)/[slug]/okr/soan/so-theo-khoa";
import {
	tachCauHoi,
	tachLuotTroLy,
} from "@/app/(app)/[slug]/okr/soan/tach-cau-hoi";

const ks = (id: string, cha: string) =>
	khoaSo({ khoa: `kr:${id}`, chaKhoa: `mt:${cha}` });

type TrangThai = DongSoan["trangThai"];

const goc = {
	viSao: "vì",
	trangThai: "cho" as TrangThai,
	maLoai: null,
	giaTriCuoi: null,
	taoRaId: null,
};

const kdMt = (ten: string) => `muc-tieu-moi:${chuanHoa(ten)}`;
const kdKr = (ten: string) => `kr-moi:${chuanHoa(ten)}`;

const mt = (
	id: string,
	ten: string,
	trangThai: TrangThai = "cho",
	loaiMucTieu: "cam-ket" | "tham-vong" = "cam-ket",
): DongSoan => ({
	...goc,
	id,
	khoa: `mt:${id}`,
	khoaDong: kdMt(ten),
	loai: "muc-tieu-moi",
	ten,
	viSaoLucNay: "vì lúc này",
	loaiMucTieu,
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
	khoaDong: kdKr(ten),
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
	khoaDong: `can-chinh-moi:mt:${cha}:dich-1`,
	chaKhoa: `mt:${cha}`,
	loai: "can-chinh-moi",
	dichId: "dich-1",
	tenDich: "Mục tiêu cấp trên",
});

describe("luat-ban-nhap", () => {
	test("cayNhap gom KR và căn chỉnh dưới Mục tiêu theo chaKhoa, bỏ dòng mồ côi", () => {
		const cay = cayNhap([
			mt("1", "A"),
			kr("11", "1", "K1"),
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

	test("cayNhap: hai dòng Mục tiêu cùng khoá — dòng đã quyết giữ chỗ, KR của nó còn nguyên, dù dòng chưa quyết đến trước hay sau", () => {
		const doiTen = { ...mt("9", "A đổi tên qua chat"), khoa: "mt:1" };
		const hinh = (dong: DongSoan[]) =>
			cayNhap(dong).map((k) => [k.mucTieu.id, k.kr.map((x) => x.id)]);
		const daNhan = mt("1", "A", "nhan");
		const krNhan = kr("11", "1", "K1", "nhan");
		expect({
			sau: hinh([daNhan, krNhan, doiTen]),
			truoc: hinh([doiTen, daNhan, krNhan]),
		}).toEqual({ sau: [["1", ["11"]]], truoc: [["1", ["11"]]] });
	});

	test("soBanNhap so theo khoaDong: vừa thêm · vừa sửa · vừa chuyển · đã bỏ", () => {
		const truoc = [
			mt("1", "Giữ khách"),
			mt("2", "Mở tuyến"),
			mt("4", "Tăng biên"),
			kr("11", "1", "Ký lại hợp đồng"),
			kr("21", "2", "Chuyến đúng hẹn"),
		];
		const sau = [
			mt("1", "Giữ khách", "cho", "tham-vong"),
			mt("2", "Mở tuyến"),
			kr("11", "1", "Ký lại hợp đồng"),
			kr("21", "1", "Chuyến đúng hẹn"),
			mt("3", "Giảm chi phí"),
		];
		const { dong, nhan } = soBanNhap(truoc, sau);
		expect(Object.fromEntries(nhan)).toEqual({
			[kdMt("Giữ khách")]: "vua-sua",
			[kdKr("Chuyến đúng hẹn")]: "vua-chuyen",
			[kdMt("Giảm chi phí")]: "vua-them",
			[kdMt("Tăng biên")]: "da-bo",
		});
		expect(dong.find((d) => d.id === "4")?.trangThai).toBe("bac");
		expect(dong.filter((d) => d.khoaDong === kdMt("Tăng biên"))).toHaveLength(
			1,
		);
	});

	test("soBanNhap: đổi tên Mục tiêu là dòng mới + đã bỏ, KR con không thành «vừa chuyển»", () => {
		const { nhan } = soBanNhap(
			[mt("1", "Giữ khách"), kr("11", "1", "Ký lại hợp đồng")],
			[mt("7", "Giữ khách lớn"), kr("11", "7", "Ký lại hợp đồng")],
		);
		expect(Object.fromEntries(nhan)).toEqual({
			[kdMt("Giữ khách lớn")]: "vua-them",
			[kdMt("Giữ khách")]: "da-bo",
		});
	});

	test("soBanNhap: Kara giữ khoá mà đổi tên thì là «vừa sửa» kèm chữ cũ, không thành dòng mới + đã bỏ", () => {
		const { nhan, truocTen, dong } = soBanNhap(
			[mt("1", "Giữ khách"), kr("11", "1", "Ký lại hợp đồng")],
			[mt("1", "Giữ khách lớn"), kr("11", "1", "Ký lại hợp đồng")],
		);
		expect(Object.fromEntries(nhan)).toEqual({
			[kdMt("Giữ khách lớn")]: "vua-sua",
		});
		expect(Object.fromEntries(truocTen)).toEqual({
			[kdMt("Giữ khách lớn")]: "Giữ khách",
		});
		expect(dong).toHaveLength(2);
	});

	test("soBanNhap: bỏ một Mục tiêu làm KR chạy sang Mục tiêu đã có thì KR «vừa chuyển»", () => {
		const { nhan } = soBanNhap(
			[
				mt("1", "Giữ khách"),
				kr("11", "1", "Ký lại hợp đồng"),
				mt("2", "Mở tuyến"),
				kr("21", "2", "Chuyến đúng hẹn"),
			],
			[
				mt("5", "Giữ khách"),
				kr("51", "5", "Ký lại hợp đồng"),
				kr("52", "5", "Chuyến đúng hẹn"),
			],
		);
		expect(Object.fromEntries(nhan)).toEqual({
			[kdKr("Chuyến đúng hẹn")]: "vua-chuyen",
			[kdMt("Mở tuyến")]: "da-bo",
		});
	});

	test("soBanNhap: model đánh lại khoá mà cha vẫn là cha cũ thì không «vừa chuyển»", () => {
		const { nhan } = soBanNhap(
			[mt("1", "Giữ khách"), kr("11", "1", "Ký lại hợp đồng")],
			[mt("9", "Giữ khách"), kr("11", "9", "Ký lại hợp đồng")],
		);
		expect(nhan.size).toBe(0);
	});

	test("soBanNhap: dòng đã quyết biến mất không thành «đã bỏ», dòng không đổi không có nhãn", () => {
		const { dong, nhan } = soBanNhap(
			[mt("1", "Giữ khách", "nhan"), mt("2", "Mở tuyến")],
			[mt("2", "Mở tuyến")],
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
		expect(
			krThieuSo(cay, { [ks("11", "1")]: { khoiDiem: "3", dich: "" } }),
		).toEqual(["11"]);
		expect(
			krThieuSo(cay, { [ks("11", "1")]: { khoiDiem: "3", dich: "9" } }),
		).toEqual([]);
		expect(
			krThieuSo(cay, { [ks("11", "1")]: { khoiDiem: "abc", dich: "9" } }),
		).toEqual(["11"]);
		expect(krThieuSo(cay, {})).toEqual(["11"]);
	});

	test("demDong đếm Mục tiêu và dòng con đang hiện, bỏ mồ côi", () => {
		expect(
			demDong(
				cayNhap([
					mt("1", "A"),
					kr("11", "1", "K1"),
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
			kr("11", "1", "K1", "sua"),
			kr("12", "1", "K2", "bac"),
			mt("2", "B", "bac"),
			kr("21", "2", "K3", "nhan"),
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
				[ks("11", "1")]: { khoiDiem: " 3,5 ", dich: "10" },
				[ks("12", "1")]: { khoiDiem: "0", dich: "1" },
			}),
		).toEqual([{ deXuatId: "11", khoiDiem: 3.5, dich: 10 }]);
	});

	test("krDuaVao đọc số kiểu Việt và chặn ngoài ±1e12", () => {
		const cay = cayNhap([
			mt("1", "A", "nhan"),
			kr("11", "1", "K1", "nhan"),
			kr("12", "1", "K2", "nhan"),
		]);
		const so = {
			[ks("11", "1")]: { khoiDiem: "5.000", dich: "1.250.000" },
			[ks("12", "1")]: { khoiDiem: "0", dich: "1000000000001" },
		};
		expect(krDuaVao(cay, so)).toEqual([
			{ deXuatId: "11", khoiDiem: 5000, dich: 1_250_000 },
		]);
		expect(krThieuSo(cay, so)).toEqual(["12"]);
	});

	test("số giữ theo khoá dòng: Kara nộp lại với id mới vẫn thấy số; KR chuyển Mục tiêu khớp lùi theo khoaDong", () => {
		const so = {
			[ks("11", "1")]: { khoiDiem: "4", dich: "9", khoaDong: kdKr("K1") },
		};
		const lanMoi = cayNhap([
			mt("1", "A", "nhan"),
			{ ...kr("11", "1", "K1", "nhan"), id: "11b" },
		]);
		expect(krDuaVao(lanMoi, so)).toEqual([
			{ deXuatId: "11b", khoiDiem: 4, dich: 9 },
		]);
		const daChuyen = cayNhap([
			mt("2", "B", "nhan"),
			{ ...kr("11", "2", "K1", "nhan"), id: "11c" },
		]);
		expect(krDuaVao(daChuyen, so)).toEqual([
			{ deXuatId: "11c", khoiDiem: 4, dich: 9 },
		]);
		expect(
			krDuaVao(
				cayNhap([mt("2", "B", "nhan"), kr("21", "2", "K9", "nhan")]),
				so,
			),
		).toEqual([]);
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
