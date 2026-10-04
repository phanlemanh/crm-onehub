import type { Locale } from "@crm/ui/lib/locale";

const en = {
	trang: {
		tieuDeTab: "Members",
		tieuDe: "Members",
		moTa: "Everyone who has access to OneHub Center.",
	},
	vaiTro: {
		owner: "Owner",
		admin: "Admin",
		member: "Member",
		okr: "OKR only",
	},
	dem: (tieuDe: string, n: number) => `${tieuDe} · ${n}`,
	bang: {
		tieuDe: "Signed in",
		moTa: "People who have signed in at least once.",
		ten: "Name",
		ban: "You",
		email: "Email",
		vaiTro: "Role",
		thamGia: "Joined",
		thamGiaDayDu: "Joined date",
		hanhDong: "Actions",
		doiVaiTro: (ten: string) => `Change ${ten}'s role`,
		daDoi: "Role changed.",
		tim: "Search by name or email…",
		trong: "Nobody matches this view.",
	},
	duocPhepVao: {
		tieuDe: "Allowed in",
		moTa: "Addresses that may sign in but have not yet.",
		diaChi: "Address",
		vaiTro: "Role on arrival",
		nguoiChoPhep: "Allowed by",
		luc: "Allowed",
		hanhDong: "Actions",
		rut: "Withdraw",
		menu: (diaChi: string) => `Actions for ${diaChi}`,
		trong:
			"Only the people above can sign in. Allow an address to let someone else in.",
		nutThem: "Allow an address",
	},
	hopThoaiChoPhep: {
		tieuDe: "Allow an address",
		than: "They sign in with Google using this address, and arrive with the role you pick.",
		nhan: "Email address",
		choDoi: "name@company.com",
		vaiTro: "Role on arrival",
		gui: "Allow",
		thoi: "Cancel",
		xong: "Address allowed.",
	},
	xacNhan: {
		go: {
			tieuDe: "Remove this person?",
			than: "They lose access now. Signing in again will not bring them back.",
			nut: "Remove",
			xong: "Person removed.",
			dangDoc: "Checking what this person still owns in OKR…",
			loiDoc: "Could not read this person's OKR.",
			coOkr:
				"This person owns {kr} key results and {mucTieu} objectives in open cycles — move their OKR first so it does not become orphaned.",
		},
		rut: {
			tieuDe: "Withdraw this allowance?",
			than: "This only stops someone who has not signed in yet. Anyone already in stays in.",
			nut: "Withdraw",
			xong: "Allowance withdrawn.",
		},
		thoi: "Cancel",
	},
	hetQuyen: {
		tieuDe: "This account is not in the workspace",
		than: "Someone removed it. Ask an owner or an admin to allow your address again.",
		dangXuat: "Sign out",
	},
	go: "Remove from workspace",
	phatChia: {
		nut: "Issue link",
		dangPhat: "Issuing",
		canQuyen: "Only an owner or an admin can issue this",
		tieuDe: "Password link",
		moTa: (ten: string) =>
			`Send to ${ten}. The link works once and expires in one hour.`,
		nhanLienKet: "Link",
		giaiThich:
			"The recipient opens the link and sets their own password. You never see their password.",
		chep: "Copy link",
		daChep: (ten: string) => `Copied. Paste it into Zalo for ${ten}.`,
		dong: "Close",
		loi: "Could not issue the link. Try again in a few minutes.",
		vet: (ten: string, luc: string) => `${ten} issued a link · ${luc}`,
	},
	tenMienNoiBo: {
		tieuDe: "Staff email domains",
		moTa: "Addresses on these domains are our own people: Tracking does not file them as visitors, and the inbox does not treat them as contacts.",
		nhan: "Domains",
		goiY: "onehub.center, onehub.vn",
		huongDan:
			"Separate with commas. Public mail domains such as gmail.com are not accepted.",
		rong: "No staff domains yet — Tracking and the inbox cannot tell our own people apart.",
		khoa: "Only an owner or an admin can change the staff email domains.",
		luu: "Save",
		daLuu: "Staff email domains saved",
		loiTai: "Could not load the staff email domains.",
		thuLai: "Try again",
	},
};

export type ThanhVienMessages = typeof en;

const vi = {
	trang: {
		tieuDeTab: "Thành viên",
		tieuDe: "Thành viên",
		moTa: "Những người vào được OneHub Center.",
	},
	vaiTro: {
		owner: "Chủ sở hữu",
		admin: "Quản trị",
		member: "Thành viên",
		okr: "Chỉ OKR",
	},
	dem: (tieuDe: string, n: number) => `${tieuDe} · ${n}`,
	bang: {
		tieuDe: "Đã vào",
		moTa: "Những người đã vào ít nhất một lần.",
		ten: "Tên",
		ban: "Bạn",
		email: "Địa chỉ email",
		vaiTro: "Vai trò",
		thamGia: "Ngày vào",
		thamGiaDayDu: "Ngày tham gia",
		hanhDong: "Hành động",
		doiVaiTro: (ten: string) => `Đổi vai trò của ${ten}`,
		daDoi: "Đã đổi vai trò.",
		tim: "Tìm theo tên hoặc email…",
		trong: "Không ai khớp với bộ lọc này.",
	},
	duocPhepVao: {
		tieuDe: "Được phép vào",
		moTa: "Những địa chỉ vào được nhưng chưa vào lần nào.",
		diaChi: "Địa chỉ",
		vaiTro: "Vai trò khi vào",
		nguoiChoPhep: "Người cho phép",
		luc: "Cho phép lúc",
		hanhDong: "Hành động",
		rut: "Rút",
		menu: (diaChi: string) => `Hành động với ${diaChi}`,
		trong:
			"Chỉ những người ở bảng trên vào được. Cho phép một địa chỉ để thêm người.",
		nutThem: "Cho phép một địa chỉ",
	},
	hopThoaiChoPhep: {
		tieuDe: "Cho phép một địa chỉ",
		than: "Họ đăng nhập bằng Google với địa chỉ này, và vào với vai trò bạn chọn.",
		nhan: "Địa chỉ email",
		choDoi: "ten@congty.com",
		vaiTro: "Vai trò khi vào",
		gui: "Cho phép",
		thoi: "Thôi",
		xong: "Đã cho phép địa chỉ này.",
	},
	xacNhan: {
		go: {
			tieuDe: "Gỡ người này?",
			than: "Họ mất quyền ngay bây giờ. Đăng nhập lại cũng không vào được nữa.",
			nut: "Gỡ",
			xong: "Đã gỡ.",
			dangDoc: "Đang đọc OKR của người này…",
			loiDoc: "Chưa đọc được OKR của người này.",
			coOkr:
				"Người này đang phụ trách {kr} KR và {mucTieu} mục tiêu ở kỳ đang mở — chuyển OKR trước để chúng không thành OKR mồ côi.",
		},
		rut: {
			tieuDe: "Rút lời cho phép này?",
			than: "Việc này chỉ chặn người chưa đăng nhập lần nào. Ai đã vào rồi thì vẫn ở trong.",
			nut: "Rút",
			xong: "Đã rút lời cho phép.",
		},
		thoi: "Thôi",
	},
	hetQuyen: {
		tieuDe: "Tài khoản này không còn trong không gian làm việc",
		than: "Ai đó đã gỡ nó. Nhờ chủ sở hữu hoặc quản trị cho phép lại địa chỉ của bạn.",
		dangXuat: "Đăng xuất",
	},
	go: "Gỡ khỏi không gian làm việc",
	phatChia: {
		nut: "Phát liên kết",
		dangPhat: "Đang phát",
		canQuyen: "Cần quyền quản trị mới phát được",
		tieuDe: "Liên kết đặt mật khẩu",
		moTa: (ten: string) =>
			`Gửi cho ${ten}. Liên kết dùng được một lần, hết hạn sau một giờ.`,
		nhanLienKet: "Liên kết",
		giaiThich:
			"Người nhận mở liên kết rồi tự đặt mật khẩu. Bạn không thấy mật khẩu của họ.",
		chep: "Chép liên kết",
		daChep: (ten: string) => `Đã chép. Dán vào Zalo gửi cho ${ten}.`,
		dong: "Đóng",
		loi: "Chưa phát được liên kết. Thử lại sau ít phút.",
		vet: (ten: string, luc: string) => `${ten} đã phát liên kết · ${luc}`,
	},
	tenMienNoiBo: {
		tieuDe: "Tên miền nội bộ",
		moTa: "Địa chỉ thư thuộc các tên miền này là người của công ty: Theo dõi không lập hồ sơ khách cho họ, hộp thư không coi họ là đối tác.",
		nhan: "Tên miền",
		goiY: "onehub.center, onehub.vn",
		huongDan:
			"Ngăn bằng dấu phẩy. Không nhận tên miền thư công cộng như gmail.com.",
		rong: "Chưa có tên miền nội bộ — máy chưa nhận ra người nhà ở Theo dõi và hộp thư.",
		khoa: "Chỉ chủ sở hữu hoặc quản trị đổi được tên miền nội bộ.",
		luu: "Lưu",
		daLuu: "Đã lưu tên miền nội bộ",
		loiTai: "Không tải được tên miền nội bộ.",
		thuLai: "Thử lại",
	},
} satisfies ThanhVienMessages;

const BANG = { en, vi } satisfies Record<Locale, ThanhVienMessages>;

export function thanhVienMessages(locale: Locale): ThanhVienMessages {
	return BANG[locale];
}
