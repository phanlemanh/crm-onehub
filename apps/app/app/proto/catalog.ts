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
		slug: "cau-truc-to-chuc",
		ten: "Cấu trúc tổ chức hai cấp",
		states: [
			{ id: "ST-hientai", nhan: "Hôm nay — danh sách phẳng" },
			{ id: "ST-cay", nhan: "Cây hai cấp" },
			{ id: "ST-cay-tim", nhan: "Cây — đang tìm" },
			{ id: "ST-cay-nguoi", nhan: "Cây — có thành viên và trưởng" },
			{ id: "ST-so-do", nhan: "Sơ đồ tổ chức" },
			{ id: "ST-giao-buoc", nhan: "Giao bước kế hoạch" },
			{ id: "ST-rong", nhan: "Chưa có bộ phận nào" },
			{ id: "ST-tochuc-cay", nhan: "Tổ chức — quản trị" },
			{ id: "ST-tochuc-chidoc", nhan: "Tổ chức — chỉ đọc" },
			{ id: "ST-vitri-theotruong", nhan: "Vị trí — quản lý theo trưởng" },
			{ id: "ST-vitri-ghide", nhan: "Vị trí — quản lý chọn tay" },
			{ id: "ST-nhap-trong", nhan: "Nhập — chưa dán" },
			{ id: "ST-nhap-xemtruoc", nhan: "Nhập — xem trước" },
			{ id: "ST-nhap-honghet", nhan: "Nhập — mọi dòng hỏng" },
			{ id: "ST-dieuphoi-locbophan", nhan: "Điều phối — lọc bộ phận" },
		],
	},
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
	{
		slug: "may-nhac-truoc-nguoi",
		ten: "Máy nhắc trước người",
		states: [
			{ id: "tasks-co-im", nhan: "Thẻ Tasks — có kế hoạch im và mốc ngày" },
			{ id: "tasks-rong", nhan: "Thẻ Tasks — rỗng" },
			{ id: "theo-doi-chua", nhan: "Nút theo dõi — chưa theo dõi" },
			{ id: "theo-doi-dang", nhan: "Nút theo dõi — đang theo dõi" },
			{ id: "theo-doi-loi", nhan: "Nút theo dõi — không lưu được" },
			{ id: "slack-du", nhan: "Tin Slack — đủ bốn nhóm" },
			{ id: "slack-tran", nhan: "Tin Slack — tràn quá 10 dòng" },
		],
	},
	{
		slug: "keo-tha-thoa-thuan",
		ten: "Kéo thả thoả thuận giữa các giai đoạn",
		states: [
			{ id: "ST-bangcot-coduLieu", nhan: "Bảng cột — có dữ liệu" },
			{ id: "ST-bangcot-cotrong", nhan: "Bảng cột — cột Contract sent rỗng" },
			{ id: "ST-bangcot-qua50", nhan: "Bảng cột — cột quá 50 thoả thuận" },
			{ id: "ST-bangcot-dangtai", nhan: "Bảng cột — đang tải" },
			{ id: "ST-bangcot-loitai", nhan: "Bảng cột — lỗi tải" },
			{ id: "ST-bangcot-tuchoi", nhan: "Bảng cột — máy chủ từ chối khi thả" },
			{ id: "ST-lydo-mo", nhan: "Hộp thoại lý do khi thả vào cột thua" },
		],
	},
	{
		slug: "nhac-qua-zalo",
		ten: "Nhắc qua Zalo",
		states: [
			{ id: "ST-thong-bao-chua-noi", nhan: "Thông báo — chưa nối" },
			{ id: "ST-thong-bao-ma-cho", nhan: "Thông báo — mã đang chờ" },
			{ id: "ST-thong-bao-ma-het-han", nhan: "Thông báo — mã hết hạn" },
			{ id: "ST-thong-bao-da-noi", nhan: "Thông báo — đã nối" },
			{ id: "ST-thong-bao-lech", nhan: "Thông báo — lệch kênh" },
			{ id: "ST-thong-bao-zalo-tat", nhan: "Thông báo — Zalo chưa bật" },
			{ id: "ST-thong-bao-luu-loi", nhan: "Thông báo — lưu lỗi" },
			{ id: "ST-thong-bao-dang-tai", nhan: "Thông báo — đang tải" },
			{ id: "ST-ket-noi-zalo-song", nhan: "Kết nối — bot sống" },
			{ id: "ST-ket-noi-zalo-im", nhan: "Kết nối — bot im" },
			{ id: "ST-ket-noi-zalo-tat", nhan: "Kết nối — chưa bật" },
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
