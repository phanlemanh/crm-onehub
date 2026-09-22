export type ProtoState = {
	id: string;
	nhan: string;
};

export type ProtoCatalogEntry = {
	slug: string;
	ten: string;
	states: ProtoState[];
};

export const PROTO_CATALOG: readonly ProtoCatalogEntry[] = [
	{
		slug: "duong-proto-cho-design-pass",
		ten: "Bản mẫu đường proto",
		states: [
			{ id: "mac-dinh", nhan: "Mặc định" },
			{ id: "rong", nhan: "Rỗng" },
			{ id: "dang-tai", nhan: "Đang tải" },
			{ id: "loi", nhan: "Lỗi" },
			{ id: "tran-dai", nhan: "Tràn dài" },
		],
	},
	{
		slug: "vao-bang-email-va-mat-khau",
		ten: "Vào bằng email và mật khẩu",
		states: [
			{ id: "ST-dangnhap-hailoi", nhan: "Đăng nhập — hai lối" },
			{ id: "ST-dangnhap-sai", nhan: "Đăng nhập — sai" },
			{ id: "ST-datmk-nhap", nhan: "Đặt mật khẩu — nhập" },
			{ id: "ST-datmk-mkyeu", nhan: "Đặt mật khẩu — mật khẩu yếu" },
			{ id: "ST-datmk-chiaxau", nhan: "Đặt mật khẩu — liên kết hỏng" },
			{ id: "ST-datmk-xong", nhan: "Đặt mật khẩu — xong" },
			{ id: "ST-hopthoai-colienket", nhan: "Hộp thoại — có liên kết" },
			{ id: "ST-hopthoai-dachep", nhan: "Hộp thoại — đã chép" },
			{ id: "ST-hopthoai-loi", nhan: "Hộp thoại — lỗi" },
			{ id: "ST-thanhvien-nutat", nhan: "Thành viên — nút tắt" },
			{ id: "ST-thanhvien-dangphat", nhan: "Thành viên — đang phát" },
			{ id: "ST-thanhvien-covet", nhan: "Thành viên — có vết" },
		],
	},
	{
		slug: "dieu-phoi-30-ngay-dau",
		ten: "Điều phối 30 ngày đầu",
		states: [
			{ id: "ST-danhmuc-codulieu", nhan: "Danh mục — có dữ liệu" },
			{ id: "ST-danhmuc-loading", nhan: "Danh mục — đang tải" },
			{ id: "ST-danhmuc-empty", nhan: "Danh mục — chưa kế hoạch nào" },
			{ id: "ST-danhmuc-chuacokhuon", nhan: "Danh mục — chưa có khuôn nào" },
			{ id: "ST-danhmuc-loi", nhan: "Danh mục — lỗi" },
			{ id: "ST-hoso-codulieu", nhan: "Hồ sơ — có dữ liệu" },
			{ id: "ST-hoso-phieurong", nhan: "Hồ sơ — phễu rỗng" },
			{ id: "ST-hoso-khongkhuon", nhan: "Hồ sơ — không từ khuôn" },
			{ id: "ST-khuon-empty", nhan: "Khuôn — chưa có khuôn nào" },
		],
	},
	{
		slug: "ke-hoach-la-mot-ban-ghi",
		ten: "Kế hoạch là một bản ghi",
		states: [
			{ id: "ST-kehoach-codulieu", nhan: "Sheet — có dữ liệu" },
			{ id: "ST-kehoach-quahan", nhan: "Sheet — có bước quá hạn" },
			{ id: "ST-kehoach-dangghi", nhan: "Sheet — đang ghi một bước" },
			{ id: "ST-kehoach-khongbuoc", nhan: "Sheet — chưa có bước" },
			{ id: "ST-kehoach-dadong", nhan: "Sheet — kế hoạch đã đóng" },
			{ id: "ST-kehoach-dangtai", nhan: "Sheet — đang tải" },
			{ id: "ST-kehoach-loi", nhan: "Sheet — lỗi" },
			{ id: "ST-kehoach-phieurong", nhan: "Môi giới — phễu rỗng" },
			{ id: "ST-kehoach-phieu80", nhan: "Môi giới — 80 người" },
			{ id: "ST-kehoach-hoatdong", nhan: "Hoạt động — có vết" },
		],
	},
	{
		slug: "moi-phia-deu-thay-ke-hoach",
		ten: "Mọi phía đều thấy kế hoạch",
		states: [
			{
				id: "ST-congty-codulieu",
				nhan: "Sheet Công ty — tab 30 ngày đầu có dữ liệu",
			},
			{ id: "ST-congty-rong", nhan: "Sheet Công ty — tab rỗng" },
			{ id: "ST-congty-dangtai", nhan: "Sheet Công ty — tab đang tải" },
			{ id: "ST-congty-loi", nhan: "Sheet Công ty — tab lỗi" },
			{ id: "ST-congty-lechsua", nhan: "Sheet Công ty — ba lệch đã sửa" },
			{ id: "ST-canhan-coghidanh", nhan: "Sheet Cá nhân — mục 30 ngày đầu" },
			{ id: "ST-tongquan-cobuoc", nhan: "Tổng quan — thẻ Tasks có bước" },
			{ id: "ST-tongquan-saphan", nhan: "Tổng quan — chỉ có bước sắp hạn" },
			{
				id: "ST-danhmuc-cotnguoigiao",
				nhan: "Danh mục — cột theo người được giao",
			},
			{ id: "ST-chuyen-hoi", nhan: "Chuyển việc — có việc" },
			{ id: "ST-chuyen-khongviec", nhan: "Chuyển việc — không có việc" },
		],
	},
];

export function timProto(slug: string): ProtoCatalogEntry | undefined {
	return PROTO_CATALOG.find((muc) => muc.slug === slug);
}

export function timState(
	muc: ProtoCatalogEntry,
	state: string | undefined,
): ProtoState | undefined {
	if (state === undefined) return muc.states[0];
	return muc.states.find((s) => s.id === state);
}
