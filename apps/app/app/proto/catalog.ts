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
