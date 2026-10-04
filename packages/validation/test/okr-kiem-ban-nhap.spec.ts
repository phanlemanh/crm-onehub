import { describe, expect, test } from "bun:test";
import {
	type DongKiemSoan,
	type GoiKiemSoan,
	giaTriViPham,
	kiemBanNhap,
	kiemDongBanNhap,
	MA_LOAI_BAN_NHAP,
	type MaLoaiBanNhap,
} from "../src/okr-kiem-ban-nhap";
import { khoaDong } from "../src/okr-kiem-de-xuat";

const GOI: GoiKiemSoan = {
	soTrongGoi: new Set(["82", "11", "14000000000", "25", "85"]),
	soDich: new Set(["85", "25"]),
	soKhoiDiem: new Set(["82", "11", "25"]),
	soNguoiGo: new Set(["30"]),
	tenThanhVien: ["Nguyễn Thị Hồng Nhung", "Trần Văn Bình"],
	tuCam: ["thưởng", "xếp hạng", "KPI", "deal"],
	tenCapTren: ["Giữ chân đối tác lớn qua mùa Tết"],
	idCanChinh: new Set(["mt-nam-1", "kr-nam-1"]),
	khoaDaBac: new Set(["muc-tieu-moi:mở rộng kênh đại lý miền trung"]),
};

type Kr = Extract<DongKiemSoan, { loai: "kr-moi" }>;
type Mt = Extract<DongKiemSoan, { loai: "muc-tieu-moi" }>;
type Cc = Extract<DongKiemSoan, { loai: "can-chinh-moi" }>;

const CUOC = "cuoc-1";

const kr = (p: Partial<Kr> = {}): DongKiemSoan => ({
	loai: "kr-moi",
	khoa: "k1",
	chaKhoa: "m1",
	ten: "Tỷ lệ đối tác gia hạn hợp đồng",
	viSao: "Đo kết quả giữ chân",
	kieu: "tang-toi",
	donVi: "%",
	khoiDiemGoiY: 82,
	dich: null,
	cuocSoanId: CUOC,
	...p,
});
const mt = (p: Partial<Mt> = {}): DongKiemSoan => ({
	loai: "muc-tieu-moi",
	khoa: "m1",
	ten: "Đối tác miền Bắc gắn bó lâu dài",
	viSao: "Kỳ trước trượt gia hạn",
	viSaoLucNay: "Mùa Tết là lúc đối tác cân nhắc đổi nhà vận chuyển",
	loaiMucTieu: "cam-ket",
	canChinhId: null,
	dich: null,
	cuocSoanId: CUOC,
	...p,
});
const cc = (p: Partial<Cc> = {}): DongKiemSoan => ({
	loai: "can-chinh-moi",
	khoa: "m1:cc",
	chaKhoa: "m1",
	targetObjectiveId: "mt-nam-1",
	targetKeyResultId: null,
	viSao: "Góp vào mục tiêu năm",
	dich: null,
	cuocSoanId: CUOC,
	...p,
});

type Ca = {
	ma: MaLoaiBanNhap;
	do: DongKiemSoan;
	lanh: DongKiemSoan;
	giaTri: string[];
};

const BANG: Ca[] = [
	{
		ma: "so-moi",
		do: kr({ ten: "Đạt 100 % đối tác gia hạn" }),
		lanh: kr({ ten: "Đối tác gia hạn đạt 82 %" }),
		giaTri: ["100"],
	},
	{
		ma: "so-moi",
		do: mt({ ten: "Doanh thu đại lý lên 20 tỷ" }),
		lanh: mt({ ten: "Doanh thu đại lý giữ mức 14 tỷ" }),
		giaTri: ["20000000000"],
	},
	{
		ma: "so-moi",
		do: kr({ viSao: "Cần tăng 99 % trong quý" }),
		lanh: kr({ viSao: "Người gõ muốn 30 đối tác mới" }),
		giaTri: ["99"],
	},
	{
		ma: "dich-khong-trong",
		do: kr({ dich: 95 }),
		lanh: kr({ dich: null }),
		giaTri: ["95"],
	},
	{
		ma: "noi-ve-nguoi",
		do: kr({ viSao: "Giao Trần Văn Bình theo dõi" }),
		lanh: kr({ viSao: "Giao trưởng nhóm theo dõi" }),
		giaTri: [],
	},
	{
		ma: "tu-cam",
		do: kr({ ten: "KPI gia hạn của phòng" }),
		lanh: kr({ ten: "Số hợp đồng gia hạn của phòng" }),
		giaTri: ["KPI"],
	},
	{
		ma: "chep-cap-tren",
		do: mt({ ten: "Giữ chân đối tác lớn qua mùa Tết" }),
		lanh: mt(),
		giaTri: [],
	},
	{
		ma: "id-ngoai-goi",
		do: cc({ targetObjectiveId: "mt-la" }),
		lanh: cc(),
		giaTri: ["mt-la"],
	},
	{
		ma: "da-bac",
		do: mt({ ten: "Mở rộng kênh đại lý miền Trung" }),
		lanh: mt(),
		giaTri: [],
	},
	{
		ma: "moc-co-dich-so",
		do: kr({
			kieu: "moc",
			ten: "Ra mắt bảng giá mới, đích: 1",
			donVi: "mốc",
			khoiDiemGoiY: null,
		}),
		lanh: kr({
			kieu: "moc",
			ten: "Bảng giá mới được ban hành",
			donVi: "mốc",
			khoiDiemGoiY: null,
		}),
		giaTri: ["đích: 1"],
	},
	{
		ma: "khong-don-vi",
		do: kr({ donVi: "" }),
		lanh: kr({ donVi: "đối tác" }),
		giaTri: [],
	},
	{
		ma: "khoi-diem-la-dich",
		do: kr({ khoiDiemGoiY: 85 }),
		lanh: kr({ khoiDiemGoiY: 82 }),
		giaTri: ["85"],
	},
];

describe("kiem-ban-nhap", () => {
	test("bảng có mỗi mã ít nhất một ca và so-moi ba biến thể (tên KR, tên Mục tiêu, vì sao)", () => {
		for (const ma of MA_LOAI_BAN_NHAP)
			expect(
				BANG.some((c) => c.ma === ma),
				`thieu ca: ${ma}`,
			).toBe(true);
		expect(BANG.filter((c) => c.ma === "so-moi").length).toBe(3);
		expect(BANG.length * 2).toBe(2 * MA_LOAI_BAN_NHAP.length + 4);
	});

	test.each(BANG)(
		"mã $ma: dòng đỏ bị loại đúng mã, dòng lành cùng gói qua",
		({ ma, do: d, lanh }) => {
			expect(kiemDongBanNhap(d, GOI)).toEqual({ qua: false, maLoai: ma });
			expect(kiemDongBanNhap(lanh, GOI)).toEqual({ qua: true });
		},
	);

	test.each(BANG)(
		"mã $ma: dòng đỏ trả đúng giá trị vi phạm, không bao giờ tên người; dòng lành không có",
		({ ma, do: d, lanh, giaTri }) => {
			expect(giaTriViPham(d, GOI, ma)).toEqual(giaTri);
			expect(giaTriViPham(lanh, GOI, ma)).toEqual([]);
		},
	);

	test("so-moi: số trong tên KR lạ với gói và chữ người gõ bị loại (đối chứng cho chiều đỏ 'so trong ten kr lot')", () => {
		const kq = kiemDongBanNhap(kr({ ten: "Có 57 đối tác gia hạn" }), GOI);
		if (kq.qua) throw new Error("so trong ten kr lot");
		expect(kq.maLoai).toBe("so-moi");
	});

	test("so-moi: khởi điểm gợi ý ngoài gói bị loại, số viết bằng chữ và hậu tố tỷ được đọc", () => {
		expect(kiemDongBanNhap(kr({ khoiDiemGoiY: 63 }), GOI)).toEqual({
			qua: false,
			maLoai: "so-moi",
		});
		expect(
			kiemDongBanNhap(kr({ ten: "Đạt chín mươi đối tác gia hạn" }), GOI),
		).toEqual({ qua: false, maLoai: "so-moi" });
		expect(
			kiemDongBanNhap(mt({ viSaoLucNay: "Thu mười bốn tỷ từ đại lý" }), GOI),
		).toEqual({ qua: true });
	});

	test("khoi-diem-la-dich: số vừa là đích vừa là số đo thật, hay do người gõ, thì qua; khởi điểm ngoài gói vẫn là so-moi", () => {
		expect(kiemDongBanNhap(kr({ khoiDiemGoiY: 25 }), GOI)).toEqual({
			qua: true,
		});
		expect(
			kiemDongBanNhap(kr({ khoiDiemGoiY: 85 }), {
				...GOI,
				soNguoiGo: new Set(["85"]),
			}),
		).toEqual({ qua: true });
		expect(kiemDongBanNhap(kr({ khoiDiemGoiY: 63 }), GOI)).toEqual({
			qua: false,
			maLoai: "so-moi",
		});
		expect(
			kiemDongBanNhap(kr({ kieu: "moc", donVi: "mốc", khoiDiemGoiY: 85 }), GOI),
		).toEqual({ qua: false, maLoai: "moc-co-dich-so" });
	});

	test("id-ngoai-goi: căn chỉnh tới KR cấp trên trong gói qua, tới KR lạ bị loại", () => {
		expect(
			kiemDongBanNhap(
				cc({ targetObjectiveId: null, targetKeyResultId: "kr-nam-1" }),
				GOI,
			),
		).toEqual({ qua: true });
		expect(
			kiemDongBanNhap(
				cc({ targetObjectiveId: null, targetKeyResultId: "kr-la" }),
				GOI,
			),
		).toEqual({ qua: false, maLoai: "id-ngoai-goi" });
	});

	test("da-bac: khoá bác của căn chỉnh là can-chinh-moi:chaKhoa:dích và khoá KR theo tên", () => {
		const goi: GoiKiemSoan = {
			...GOI,
			khoaDaBac: new Set([
				khoaDong({ ...(cc() as Cc), dich: null }),
				"kr-moi:tỷ lệ đối tác gia hạn hợp đồng",
			]),
		};
		expect(kiemDongBanNhap(cc(), goi)).toEqual({
			qua: false,
			maLoai: "da-bac",
		});
		expect(kiemDongBanNhap(cc({ chaKhoa: "m2" }), goi)).toEqual({ qua: true });
		expect(kiemDongBanNhap(kr(), goi)).toEqual({
			qua: false,
			maLoai: "da-bac",
		});
		expect(kiemDongBanNhap(kr({ dich: 95 }), goi)).toEqual({
			qua: false,
			maLoai: "da-bac",
		});
	});

	test("thứ tự luật: KR mốc mang đích ra dich-khong-trong; tên có chữ Hoa dấu vẫn khớp từ cấm và cấp trên", () => {
		expect(
			kiemDongBanNhap(
				kr({ kieu: "moc", donVi: "mốc", khoiDiemGoiY: null, dich: 1 }),
				GOI,
			),
		).toEqual({ qua: false, maLoai: "dich-khong-trong" });
		expect(kiemDongBanNhap(kr({ ten: "Tổng DEAL gia hạn" }), GOI)).toEqual({
			qua: false,
			maLoai: "tu-cam",
		});
		expect(
			kiemDongBanNhap(mt({ ten: "  giữ chân đối tác lớn, qua mùa tết " }), GOI),
		).toEqual({ qua: false, maLoai: "chep-cap-tren" });
	});

	test("noi-ve-nguoi: tên một chữ hay không dấu; họ tên đủ không dấu vẫn bị bắt", () => {
		expect(kiemDongBanNhap(kr({ viSao: "Giao Bình theo dõi" }), GOI)).toEqual({
			qua: true,
		});
		expect(
			kiemDongBanNhap(kr({ viSao: "giao tran van binh theo doi" }), GOI),
		).toEqual({ qua: false, maLoai: "noi-ve-nguoi" });
	});

	test("kiemBanNhap giữ thứ tự dòng và trả kq từng dòng, chỉ dòng có khoá đã bác bị loại", () => {
		const dongs = [
			mt({ khoa: "a", ten: "Đối tác miền Bắc gắn bó lâu dài" }),
			kr({ khoa: "a1", chaKhoa: "a" }),
			cc({ khoa: "a:cc", chaKhoa: "a" }),
			mt({ khoa: "b", ten: "Mở rộng kênh đại lý miền Trung" }),
			kr({ khoa: "b1", chaKhoa: "b", donVi: "" }),
		];
		const kq = kiemBanNhap(dongs, GOI);
		expect(kq.map((x) => x.dong.khoa)).toEqual(["a", "a1", "a:cc", "b", "b1"]);
		expect(kq.map((x) => (x.kq.qua ? "qua" : x.kq.maLoai))).toEqual([
			"qua",
			"qua",
			"qua",
			"da-bac",
			"khong-don-vi",
		]);
	});
});
