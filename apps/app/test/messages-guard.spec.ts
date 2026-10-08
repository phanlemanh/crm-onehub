import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "@crm/ui/lib/locale";
import { authMessages } from "@/lib/messages/auth";
import { docDuongGoi, taoSong } from "./duong-goi";

const DAU_TIENG_VIET =
	/[ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ]/;

type GiaTri = string | ((...doiSo: string[]) => string);
type Nhanh = { readonly [khoa: string]: GiaTri | Nhanh };

const THU_MUC_KHO = join(import.meta.dir, "..", "lib", "messages");

const TEN_KHO = readdirSync(THU_MUC_KHO)
	.filter((t) => t.endsWith(".ts"))
	.map((t) => t.replace(/\.ts$/, ""))
	.sort();

const MODULE: readonly (readonly [string, (locale: Locale) => Nhanh])[] =
	await Promise.all(
		TEN_KHO.map(async (ten) => {
			const ns: unknown = await import(`@/lib/messages/${ten}`);
			const lay = Object.values(ns as object).find(
				(v): v is (locale: Locale) => Nhanh => v instanceof Function,
			);
			if (!lay) throw new Error(`kho chuoi ${ten} khong xuat mot ham lay`);
			return [ten, lay] as const;
		}),
	);

function phang(o: Nhanh, tien = ""): [string, GiaTri][] {
	return Object.entries(o).flatMap(([k, v]): [string, GiaTri][] =>
		v instanceof Function
			? [[`${tien}${k}`, v]]
			: v instanceof Map
				? phang(Object.fromEntries(v) as Nhanh, `${tien}${k}.`)
				: v instanceof Object
					? phang(v, `${tien}${k}.`)
					: [[`${tien}${k}`, v]],
	);
}

const KHONG_DAU = new Set([
	"dong.soKr",
	"chuyen.dongMoTa",
	"hopThoaiChoPhep.choDoi",
	"tenMienNoiBo.goiY",
	"chiaSe.xong",
	"tep.kiloByte",
	"tep.megaByte",
	"dung.xong",
	"luot.thanhCong",
	"luot.model",
	"trangThai.SUCCEEDED",
	"ma.xong",
	"kenh.tenViDu",
	"headers.email",
	"tabs.emails",
	"tab.trang",
	"cot.trang",
	"contact.emails",
	"type.email",
	"type.url",
	"create.email",
	"contactColumns.email",
	"fields.website",
	"fields.email",
	"fields.linkedin",
	"fields.x",
	"fields.github",
	"contactColumns.title",
	"create.domainPlaceholder",
	"standard.email",
	"standard.website",
	"standard.linkedin",
	"standard.github",
	"timeline.viaGmail",
	"composer.log",
	"namePlaceholder",
	"company.domainPlaceholder",
	"deal.namePlaceholder",
	"company.websitePlaceholder",
	"shell.eyebrow",
	"onboarding.website",
	"thanhBen.sso",
	"thanhBen.chung",
	"tieuDeTab.chung",
	"chung.tieuDe",
	"congTy.tenGoiY",
	"congTy.website",
	"congTy.websiteTienTo",
	"congTy.websiteGoiY",
	"model.nhan",
	"doanMa.siteIdNhan",
	"kiemTra.trangGoiY",
	"tenMien.tenGoiY",
	"cookie.tieuDe",
	"ten.google",
	"ten.googleWorkspace",
	"ten.gmail",
	"ten.slack",
	"ten.zalo",
	"kenh.zalo",
	"kenh.slack",
	"ketNoi.nhanToken",
	"ketNoi.goiYToken",
	"ten.microsoft",
	"ten.microsoft365",
	"ten.outlook",
	"ten.stripe",
	"ten.docusign",
	"header.otherLocale",
	"datMatKhau.xong.title",
	"sheet.tabKr",
	"sheet.quaKr",
	"khoiMucTieu.soKr",
	"cot.kr",
	"cot.pha",
	"moc.xong",
	"mucTuTin.cao",
	"dem",
	"donVi.dem",
	"bangTinh.nhan",
	"dau.crm",
	"dau.api",
	"dau.bangTinh",
	"cham.mangSang",
	"mangSang.xacNhan",
	"hop.onehub",
	"vietTruoc.tenChuDe",
	"banNhap.kr",
	"loaiDong.kr-moi",
	"cuoc.xem",
	"dong.nguCanh",
	"moc.themKr",
	"loai.kr",
	"tabs.agent",
]);

function mienDau(khoa: string): boolean {
	const phan = khoa.split(".");
	return KHONG_DAU.has(khoa) || KHONG_DAU.has(phan.slice(-2).join("."));
}

const DOI_SO_HIEN = ["X", "Y", "Z", "W"];
const DOI_SO_GHIM = [
	["1", "A", "B", "C"],
	["12", "A", "B", "C"],
] as const;

function hienRa(v: GiaTri): string {
	return v instanceof Function ? v(...DOI_SO_HIEN.slice(0, v.length)) : v;
}

const CHUA_NOI_KHAI: readonly string[] = [
	"record-sheet.tabs.details",
	"record-sheet.company.archived",
	"record-sheet.company.restored",
	"record-sheet.company.purged",
	"record-sheet.contact.noCompany",
	"record-sheet.deal.remove",
	"crm.companyPicker.none",
	"crm.owner.label",
	"crm.standard.name",
	"crm.standard.domain",
	"crm.standard.website",
	"crm.standard.industry",
	"crm.standard.city",
	"crm.standard.country",
	"crm.standard.firstName",
	"crm.standard.lastName",
	"crm.standard.title",
	"crm.standard.email",
	"crm.standard.phone",
	"crm.standard.linkedin",
	"crm.standard.github",
	"crm.standard.owner",
	"crm.standard.amount",
	"crm.standard.currency",
	"crm.standard.closeDate",
	"crm.standard.stage",
	"okr.sheet.tabVet",
	"okr.sheet.tienDoTu",
];

const GHIM_TRO_LY_OKR = {
	"tro-ly-okr:so.doiSoat.khongDuoc": [
		"Đối soát tháng 1: chưa đối soát được — A.",
		"Đối soát tháng 12: chưa đối soát được — A.",
	],
	"tro-ly-okr:so.doiSoat.khop": [
		"Đối soát tháng 1 với AI Gateway: khớp (lệch A%).",
		"Đối soát tháng 12 với AI Gateway: khớp (lệch A%).",
	],
	"tro-ly-okr:so.doiSoat.lech": [
		"Đối soát tháng 1 với AI Gateway: lệch A%.",
		"Đối soát tháng 12 với AI Gateway: lệch A%.",
	],
	"tro-ly-okr:so.doiSoat.loiGateway": [
		"AI Gateway trả lỗi 1",
		"AI Gateway trả lỗi 12",
	],
	"tro-ly-okr:so.rongMoTa": [
		"Trần của Trợ lý OKR: 1.",
		"Trần của Trợ lý OKR: 12.",
	],
	"tro-ly-okr:soDo.biLoaiMa": ["Bị loại · 1", "Bị loại · 12"],
	"tro-ly-okr:soDo.dongBiLoai": ["(+1 bị loại)", "(+12 bị loại)"],
	"tro-ly-okr:soDo.hang.hoanTac": [
		"Hoàn tác trong 1 ngày",
		"Hoàn tác trong 12 ngày",
	],
	"tro-ly-okr:troLy.donViCua": ["Đơn vị 1 a", "Đơn vị 12 a"],
	"tro-ly-okr:troLy.hop.goiYPhongBan": ["Phòng ban · 1", "Phòng ban · 12"],
	"tro-ly-okr:troLy.hop.tieuDe": ["Đơn vị 1 «A»", "Đơn vị 12 «A»"],
	"tro-ly-okr:troLy.hop.xacNhan": ["Chọn 1 đơn vị", "Chọn 12 đơn vị"],
	"tro-ly-okr:troLy.sanSang.chuaSanSang": [
		"Chưa sẵn sàng — 1",
		"Chưa sẵn sàng — 12",
	],
	"tro-ly-okr:troLy.sanSang.hetTran": [
		"Đã chạm trần tháng — tạm nghỉ tới 1",
		"Đã chạm trần tháng — tạm nghỉ tới 12",
	],
	"tro-ly-okr:troLy.sanSang.thieuKhoaMoTa": [
		"Cắm 1 (hoặc A) vào dự án tác tử, hoặc bật OIDC của dự án đó trên Vercel. Tác tử tự kiểm lại trong khoảng B phút.",
		"Cắm 12 (hoặc A) vào dự án tác tử, hoặc bật OIDC của dự án đó trên Vercel. Tác tử tự kiểm lại trong khoảng B phút.",
	],
} satisfies Record<string, [string, string]>;

const GHIM_OKR_GOP_Y = {
	"okr-gop-y:vung.soCho": ["1 góp ý chờ", "12 góp ý chờ"],
	"okr-gop-y:vung.lyDo": [
		"Kara đọc tên, «vì sao lúc này» và 1 KR của Mục tiêu này. Kara chỉ đọc dữ liệu OKR.",
		"Kara đọc tên, «vì sao lúc này» và 12 KR của Mục tiêu này. Kara chỉ đọc dữ liệu OKR.",
	],
	"okr-gop-y:vung.rongMoTa": [
		"Tên, «vì sao lúc này» và các KR đã đọc ổn lúc 1. Sửa xong thì nhờ Kara đọc lại.",
		"Tên, «vì sao lúc này» và các KR đã đọc ổn lúc 12. Sửa xong thì nhờ Kara đọc lại.",
	],
	"okr-gop-y:vung.tamNghi": ["Kara tạm nghỉ tới 1.", "Kara tạm nghỉ tới 12."],
	"okr-gop-y:bienNhan.hoanTacKr": [
		"Đã hoàn tác — tên KR trở lại «1»",
		"Đã hoàn tác — tên KR trở lại «12»",
	],
	"okr-gop-y:bienNhan.hoanTacMucTieu": [
		"Đã hoàn tác — tên Mục tiêu trở lại «1»",
		"Đã hoàn tác — tên Mục tiêu trở lại «12»",
	],
	"okr-gop-y:bienNhan.boQuaTen": [
		"Đã bỏ qua tên Kara đề xuất: «1»",
		"Đã bỏ qua tên Kara đề xuất: «12»",
	],
	"okr-gop-y:bienNhan.boQuaCau": [
		"Đã bỏ qua câu Kara đề xuất: «1»",
		"Đã bỏ qua câu Kara đề xuất: «12»",
	],
	"okr-gop-y:bienNhan.boQuaCanChinh": [
		"Đã bỏ qua góp ý góp vào «1»",
		"Đã bỏ qua góp ý góp vào «12»",
	],
	"okr-gop-y:bienNhan.boQuaHoi": [
		"Đã bỏ qua câu hỏi của Kara: 1",
		"Đã bỏ qua câu hỏi của Kara: 12",
	],
	"okr-gop-y:chip": ["1 góp ý", "12 góp ý"],
	"okr-gop-y:chipAria": [
		"Kara có 1 góp ý chờ cho «A», mở khung chi tiết",
		"Kara có 12 góp ý chờ cho «A», mở khung chi tiết",
	],
	"okr-gop-y:loc.coCho": ["Có góp ý chờ · 1", "Có góp ý chờ · 12"],
	"okr-gop-y:xuHuong": [
		"Theo các lần cập nhật gần nhất (1/tuần), cuối kỳ ước khoảng A B",
		"Theo các lần cập nhật gần nhất (12/tuần), cuối kỳ ước khoảng A B",
	],
	"okr-gop-y:vet.suaTruong": ["Sửa 1", "Sửa 12"],
	"okr-gop-y:dong.gopVao": ["Góp vào «1»", "Góp vào «12»"],
} satisfies Record<string, [string, string]>;

const GHIM_OKR_SOAN = {
	"okr-soan:nut.tiepMoTa": [
		"Mở 1 · A lượt · B dòng chưa quyết",
		"Mở 12 · A lượt · B dòng chưa quyết",
	],
	"okr-soan:nut.hetCuoc": [
		"Đã dùng hết 1 cuộc soạn kỳ này",
		"Đã dùng hết 12 cuộc soạn kỳ này",
	],
	"okr-soan:nut.tamNghi": [
		"Trợ lý OKR tạm nghỉ tới 1",
		"Trợ lý OKR tạm nghỉ tới 12",
	],
	"okr-soan:nut.dsCuoc": ["1/A cuộc", "12/A cuộc"],
	"okr-soan:man.luot": ["lượt 1/A", "lượt 12/A"],
	"okr-soan:man.tabBanNhap": ["Bản nháp (1)", "Bản nháp (12)"],
	"okr-soan:man.soDong": ["1 dòng", "12 dòng"],
	"okr-soan:hoiThoai.goiY": ["Gợi ý trả lời: 1", "Gợi ý trả lời: 12"],
	"okr-soan:hoiThoai.daThuLai": ["Đã thử lại 1 lần", "Đã thử lại 12 lần"],
	"okr-soan:hoiThoai.hetLuot": [
		"Đã dùng hết 1 lượt của cuộc này — đưa vào bộ OKR hoặc mở cuộc mới",
		"Đã dùng hết 12 lượt của cuộc này — đưa vào bộ OKR hoặc mở cuộc mới",
	],
	"okr-soan:banNhap.mucTieu": ["Mục tiêu 1", "Mục tiêu 12"],
	"okr-soan:banNhap.viSaoLucNay": ["Vì sao lúc này: 1", "Vì sao lúc này: 12"],
	"okr-soan:banNhap.canChinh": ["Góp vào «1»", "Góp vào «12»"],
	"okr-soan:banNhap.doBang": ["đo bằng 1", "đo bằng 12"],
	"okr-soan:banNhap.goiYKhoiDiem": ["khởi điểm gợi ý 1", "khởi điểm gợi ý 12"],
	"okr-soan:banNhap.bacCon": ["1 dòng con thu gọn", "12 dòng con thu gọn"],
	"okr-soan:banNhap.duaVao": [
		"Đưa vào bộ OKR · 1 Mục tiêu, A KR",
		"Đưa vào bộ OKR · 12 Mục tiêu, A KR",
	],
	"okr-soan:banNhap.thieuDich": [
		"Điền khởi điểm và đích cho 1 KR đã nhận trước khi đưa vào",
		"Điền khởi điểm và đích cho 12 KR đã nhận trước khi đưa vào",
	],
	"okr-soan:banNhap.duaVaoMoTa": [
		"Tạo ở trạng thái nháp cho 1, A. Dòng đã bác không đưa vào; đích do bạn đặt.",
		"Tạo ở trạng thái nháp cho 12, A. Dòng đã bác không đưa vào; đích do bạn đặt.",
	],
	"okr-soan:banNhap.xacNhan.than": [
		"Tạo 1 Mục tiêu và A KR, đích do bạn đặt, ở trạng thái nháp cho B, C?",
		"Tạo 12 Mục tiêu và A KR, đích do bạn đặt, ở trạng thái nháp cho B, C?",
	],
	"okr-soan:banNhap.daTao": [
		"Đã tạo 1 Mục tiêu nháp",
		"Đã tạo 12 Mục tiêu nháp",
	],
	"okr-soan:banNhap.daTaoMoTa": [
		"1 KR đi kèm; đích bạn đã điền được giữ. Công bố như mọi OKR ở Theo đơn vị.",
		"12 KR đi kèm; đích bạn đã điền được giữ. Công bố như mọi OKR ở Theo đơn vị.",
	],
	"okr-soan:cuoc.tieuDe": [
		"Cuộc soạn cùng Trợ lý · 1",
		"Cuộc soạn cùng Trợ lý · 12",
	],
	"okr-soan:cuoc.dem": ["1/A cuộc", "12/A cuộc"],
	"okr-soan:cuoc.nutCuoc": ["1 cuộc A", "12 cuộc A"],
	"okr-soan:cuoc.dongNhan": ["1/A dòng nhận", "12/A dòng nhận"],
	"okr-soan:cuoc.rongMoTa": [
		"Mỗi chu kỳ có 1 cuộc; cuộc đã đưa vào bộ OKR vẫn xem lại được ở đây.",
		"Mỗi chu kỳ có 12 cuộc; cuộc đã đưa vào bộ OKR vẫn xem lại được ở đây.",
	],
	"okr-soan:soDo.luot": ["1 lượt", "12 lượt"],
	"okr-soan:soDo.biLoaiMa": ["Bị loại · 1", "Bị loại · 12"],
	"okr-soan:dong.meta": ["1 dòng · sửa lúc A", "12 dòng · sửa lúc A"],
	"okr-soan:dong.themNhom": [
		"Thêm cả Mục tiêu và 1 KR đã đủ số",
		"Thêm cả Mục tiêu và 12 KR đã đủ số",
	],
	"okr-soan:dong.daThemNhom": [
		"Đã thêm Mục tiêu 1 và A KR",
		"Đã thêm Mục tiêu 12 và A KR",
	],
	"okr-soan:dong.kemKr": [" · hoàn tác kèm 1 KR", " · hoàn tác kèm 12 KR"],
	"okr-soan:dong.nguCanh": ["1 · A", "12 · A"],
	"okr-soan:moc.dau": ["1 Mục tiêu · A KR", "12 Mục tiêu · A KR"],
	"okr-soan:moc.themMucTieu": ["+1 Mục tiêu", "+12 Mục tiêu"],
	"okr-soan:moc.themKr": ["+1 KR", "+12 KR"],
	"okr-soan:moc.sua": ["sửa 1", "sửa 12"],
	"okr-soan:moc.chuyen": ["chuyển 1", "chuyển 12"],
	"okr-soan:moc.bo": ["bỏ 1", "bỏ 12"],
	"okr-soan:heThong.seGui": [
		"Sẽ gửi kèm lượt sau: 1",
		"Sẽ gửi kèm lượt sau: 12",
	],
	"okr-soan:heThong.cach.nhan": ["Bạn đã thêm 1 «A»", "Bạn đã thêm 12 «A»"],
	"okr-soan:heThong.cach.sua": [
		"Bạn đã sửa rồi thêm 1 «A»",
		"Bạn đã sửa rồi thêm 12 «A»",
	],
	"okr-soan:heThong.cach.bac": ["Bạn đã bỏ qua 1 «A»", "Bạn đã bỏ qua 12 «A»"],
	"okr-soan:heThong.cach.hoan": [
		"Bạn đã hoàn tác 1 «A»",
		"Bạn đã hoàn tác 12 «A»",
	],
} satisfies Record<string, [string, string]>;

const GHIM = {
	...GHIM_TRO_LY_OKR,
	...GHIM_OKR_GOP_Y,
	...GHIM_OKR_SOAN,
	"campaigns:create.segmentSize": ["1 cá nhân", "12 cá nhân"],
	"crm:views.inUse": ["Đang là phân khúc của 1", "Đang là phân khúc của 12"],
	"auth:signIn.continueWith": ["Tiếp tục với 1", "Tiếp tục với 12"],
	"auth:grantAccess.grant": ["Cấp quyền 1", "Cấp quyền 12"],
	"auth:datMatKhau.description": [
		"Liên kết này dùng được một lần, còn hạn 1 phút.",
		"Liên kết này dùng được một lần, còn hạn 12 phút.",
	],
	"auth:datMatKhau.loi.quaNgan": [
		"Mật khẩu phải có ít nhất 1 ký tự.",
		"Mật khẩu phải có ít nhất 12 ký tự.",
	],
	"auth:quenMatKhau.quaLuot": [
		"Bạn đã xin quá nhiều lần. Chờ 1 phút rồi thử lại.",
		"Bạn đã xin quá nhiều lần. Chờ 12 phút rồi thử lại.",
	],
	"auth:quenMatKhau.xong.description": [
		"Nếu địa chỉ này vào được OneHub Center, liên kết đang trên đường tới. Liên kết dùng được một lần và còn hạn 1 phút. Chưa mở thì mật khẩu hiện tại vẫn nguyên.",
		"Nếu địa chỉ này vào được OneHub Center, liên kết đang trên đường tới. Liên kết dùng được một lần và còn hạn 12 phút. Chưa mở thì mật khẩu hiện tại vẫn nguyên.",
	],
	"auth:datMatKhau.toiThieu": [
		"Ít nhất 1 ký tự. Không cần chữ hoa hay ký tự đặc biệt.",
		"Ít nhất 12 ký tự. Không cần chữ hoa hay ký tự đặc biệt.",
	],
	"companies:created": ["Đã thêm 1.", "Đã thêm 12."],
	"companies:bulk.reassigned": [
		"Đã đổi người phụ trách cho 1.",
		"Đã đổi người phụ trách cho 12.",
	],
	"companies:bulk.enriching": [
		"Đang tra cứu 1 — bảng sẽ tự cập nhật.",
		"Đang tra cứu 12 — bảng sẽ tự cập nhật.",
	],
	"companies:bulk.archived": ["Đã lưu trữ 1.", "Đã lưu trữ 12."],
	"companies:bulk.restored": ["Đã khôi phục 1.", "Đã khôi phục 12."],
	"companies:bulk.deleted": ["Đã xoá vĩnh viễn 1.", "Đã xoá vĩnh viễn 12."],
	"companies:bulk.confirmDelete": ["Xoá vĩnh viễn 1?", "Xoá vĩnh viễn 12?"],
	"crm:views.remove": ["Xoá 1", "Xoá 12"],
	"crm:bulkMenu.leftAlone": ["1 A bị bỏ quaB", "12 A bị bỏ quaB"],
	"record-sheet:company.manyDeals": [
		"Cả 1 thoả thuận của công ty",
		"Cả 12 thoả thuận của công ty",
	],
	"record-sheet:company.manyPeople": ["1 người", "12 người"],
	"crm:sheet.confirmDelete": ["Xoá vĩnh viễn 1?", "Xoá vĩnh viễn 12?"],
	"contacts:created": ["Đã thêm 1.", "Đã thêm 12."],
	"contacts:bulk.reassigned": [
		"Đã đổi người phụ trách cho 1.",
		"Đã đổi người phụ trách cho 12.",
	],
	"contacts:bulk.moved": [
		"Đã chuyển 1 sang công ty khác.",
		"Đã chuyển 12 sang công ty khác.",
	],
	"contacts:bulk.enriching": [
		"Đang tra cứu 1 — bảng sẽ tự cập nhật.",
		"Đang tra cứu 12 — bảng sẽ tự cập nhật.",
	],
	"contacts:bulk.archived": ["Đã lưu trữ 1.", "Đã lưu trữ 12."],
	"contacts:bulk.restored": ["Đã khôi phục 1.", "Đã khôi phục 12."],
	"contacts:bulk.deleted": ["Đã xoá vĩnh viễn 1.", "Đã xoá vĩnh viễn 12."],
	"contacts:bulk.confirmDelete": ["Xoá vĩnh viễn 1?", "Xoá vĩnh viễn 12?"],
	"deals:meta.count": ["1 thoả thuận", "12 thoả thuận"],
	"deals:meta.notCounted": [
		"1 chưa tính (thiếu tỉ giá A)",
		"12 chưa tính (thiếu tỉ giá A)",
	],
	"deals:created": ["Đã thêm 1.", "Đã thêm 12."],
	"deals:board.pickedUp": ["Đã nhấc 1.", "Đã nhấc 12."],
	"deals:board.over": ["Đang ở trên 1.", "Đang ở trên 12."],
	"deals:board.dropped": ["Đã thả vào 1.", "Đã thả vào 12."],
	"deals:bulk.reassigned": [
		"Đã đổi người phụ trách cho 1.",
		"Đã đổi người phụ trách cho 12.",
	],
	"deals:bulk.moved": [
		"Đã chuyển 1 sang công ty khác.",
		"Đã chuyển 12 sang công ty khác.",
	],
	"deals:bulk.archived": ["Đã lưu trữ 1.", "Đã lưu trữ 12."],
	"deals:bulk.restored": ["Đã khôi phục 1.", "Đã khôi phục 12."],
	"deals:bulk.deleted": ["Đã xoá vĩnh viễn 1.", "Đã xoá vĩnh viễn 12."],
	"deals:bulk.confirmDelete": ["Xoá vĩnh viễn 1?", "Xoá vĩnh viễn 12?"],
	"deals:bulk.closeLost": ["Chốt 1 là không thành", "Chốt 12 là không thành"],
	"record-sheet:company.noContactsBody": [
		"Mọi người bạn trao đổi ở 1 nằm ở đây — thêm người đầu tiên, rồi cuộc gọi, email và ghi chú của họ gắn theo.",
		"Mọi người bạn trao đổi ở 12 nằm ở đây — thêm người đầu tiên, rồi cuộc gọi, email và ghi chú của họ gắn theo.",
	],
	"record-sheet:company.noDealsBody": [
		"Chưa có thoả thuận hợp tác nào với 1. Mở một thoả thuận thì nó vào phần đang theo dõi và vào dự báo.",
		"Chưa có thoả thuận hợp tác nào với 12. Mở một thoả thuận thì nó vào phần đang theo dõi và vào dự báo.",
	],
	"record-sheet:company.deleteDeals": [
		"1 và mọi thứ gắn với công ty này mất theo.",
		"12 và mọi thứ gắn với công ty này mất theo.",
	],
	"record-sheet:company.deleteContacts": [
		"1 làm việc ở đó vẫn ở lại OneHub Center, nhưng không thuộc công ty nào.",
		"12 làm việc ở đó vẫn ở lại OneHub Center, nhưng không thuộc công ty nào.",
	],
	"record-sheet:company.archived": ["Đã lưu trữ 1.", "Đã lưu trữ 12."],
	"record-sheet:company.restored": ["Đã khôi phục 1.", "Đã khôi phục 12."],
	"record-sheet:company.purged": [
		"Đã xoá vĩnh viễn 1.",
		"Đã xoá vĩnh viễn 12.",
	],
	"record-sheet:contact.primaryAt": ["Đầu mối chính ở 1", "Đầu mối chính ở 12"],
	"record-sheet:contact.roles": ["1 vị trí", "12 vị trí"],
	"record-sheet:contact.neverReplied": [
		"1 chưa trả lời lần nào",
		"12 chưa trả lời lần nào",
	],
	"record-sheet:contact.notOnDealsBody": [
		"1 chưa gắn với thoả thuận nào. Thoả thuận mở trên công ty trước, rồi mới thêm người vào.",
		"12 chưa gắn với thoả thuận nào. Thoả thuận mở trên công ty trước, rồi mới thêm người vào.",
	],
	"record-sheet:contact.added": ["Đã thêm 1.", "Đã thêm 12."],
	"record-sheet:deal.inCurrency": ["Quy đổi 1", "Quy đổi 12"],
	"record-sheet:deal.currencyGone": [
		"1 — không còn hỗ trợ",
		"12 — không còn hỗ trợ",
	],
	"record-sheet:deal.descriptionHint": [
		"1 đang cần gì, vì sao là lúc này, và còn vướng gì.",
		"12 đang cần gì, vì sao là lúc này, và còn vướng gì.",
	],
	"record-sheet:deal.roleOnDeal": [
		"Vai trò của 1 trong thoả thuận này",
		"Vai trò của 12 trong thoả thuận này",
	],
	"record-sheet:deal.noContactsBody": [
		"Chưa ai từ 1 được gắn vào. Thêm những người bạn đang trao đổi vào thoả thuận thì biết cần theo ai.",
		"Chưa ai từ 12 được gắn vào. Thêm những người bạn đang trao đổi vào thoả thuận thì biết cần theo ai.",
	],
	"record-sheet:deal.onDeal": ["1 đã vào thoả thuận.", "12 đã vào thoả thuận."],
	"record-sheet:deal.everybodyOn": [
		"Mọi người ở 1 đã ở trong rồi",
		"Mọi người ở 12 đã ở trong rồi",
	],
	"record-sheet:deal.created": ["Đã tạo 1.", "Đã tạo 12."],
	"record-sheet:deal.deleteWarning": [
		"Lịch sử giai đoạn, ghi chú và hội thoại với tác nhân đều mất theo. 1 và A trong đó vẫn ở lại OneHub Center.",
		"Lịch sử giai đoạn, ghi chú và hội thoại với tác nhân đều mất theo. 12 và A trong đó vẫn ở lại OneHub Center.",
	],
	"crm:timeline.composer.log": ["Ghi 1", "Ghi 12"],
	"crm:timeline.messages": ["1 thư", "12 thư"],
	"crm:time.minutes": ["1 phút", "12 phút"],
	"crm:time.hours": ["1 giờ", "12 giờ"],
	"crm:time.days": ["1 ngày", "12 ngày"],
	"crm:time.ahead": ["sau 1 nữa", "sau 12 nữa"],
	"crm:time.ago": ["1 trước", "12 trước"],
	"crm:fields.stillToGo": ["Còn 1 nữa", "Còn 12 nữa"],
	"crm:fields.optionCount": ["1 lựa chọn", "12 lựa chọn"],
	"crm:fields.option": ["Lựa chọn 1", "Lựa chọn 12"],
	"crm:fields.filledOn": ["Đã điền cho 1 trên A B", "Đã điền cho 12 trên A B"],
	"crm:sheet.restore": ["Khôi phục 1", "Khôi phục 12"],
	"crm:sheet.archive": ["Lưu trữ 1", "Lưu trữ 12"],
	"crm:sheet.deleteForever": ["Xoá vĩnh viễn 1", "Xoá vĩnh viễn 12"],
	"crm:sheet.fallbackName": ["1 này", "12 này"],
	"crm:sheet.archived": ["Đã lưu trữ 1.", "Đã lưu trữ 12."],
	"crm:sheet.restored": ["Đã khôi phục 1.", "Đã khôi phục 12."],
	"crm:sheet.deletedForever": ["Đã xoá vĩnh viễn 1.", "Đã xoá vĩnh viễn 12."],
	"crm:web.views": ["1 lượt xem", "12 lượt xem"],
	"crm:fields.removeOption": ["Bỏ 1", "Bỏ 12"],
	"crm:fields.moreFor": ["Thêm hành động cho 1", "Thêm hành động cho 12"],
	"crm:fields.archiveTitle": ["Lưu trữ 1?", "Lưu trữ 12?"],
	"crm:fields.filledOf": ["1 · đã điền A/B", "12 · đã điền A/B"],
	"record-sheet:company.unconverted": ["+1 chưa quy đổi", "+12 chưa quy đổi"],
	"record-sheet:deal.nobodyAttached": [
		"Chưa ai từ 1 được gắn vào.",
		"Chưa ai từ 12 được gắn vào.",
	],
	"record-sheet:deal.noRate": [
		"Không có tỷ giá 1 — không tính vào tổng",
		"Không có tỷ giá 12 — không tính vào tổng",
	],
	"crm:timeline.openIn": ["Mở trong 1", "Mở trong 12"],
	"record-sheet:deal.takeOffNamed": [
		"Gỡ 1 khỏi thoả thuận này",
		"Gỡ 12 khỏi thoả thuận này",
	],
	"record-sheet:deal.namePlaceholder": ["1 — OneHub", "12 — OneHub"],
	"settings:chep.hong": [
		"Không chép được 1. Bôi đen rồi chép tay.",
		"Không chép được 12. Bôi đen rồi chép tay.",
	],
	"settings:model.gia": [
		"1 vào · A ra trên 1 triệu token",
		"12 vào · A ra trên 1 triệu token",
	],
	"settings:model.nguCanhTrieu": [
		"ngữ cảnh 1 triệu token",
		"ngữ cảnh 12 triệu token",
	],
	"settings:model.nguCanhNghin": [
		"ngữ cảnh 1 nghìn token",
		"ngữ cảnh 12 nghìn token",
	],
	"settings:model.khongVoiToi": [
		"Không với tới AI Gateway để lấy danh sách model. Tác nhân vẫn đang chạy 1.",
		"Không với tới AI Gateway để lấy danh sách model. Tác nhân vẫn đang chạy 12.",
	],
	"settings:tienTe.daDoi": [
		"Từ giờ mọi tổng báo cáo bằng 1.",
		"Từ giờ mọi tổng báo cáo bằng 12.",
	],
	"settings:tienTe.khongQuyDoiDuoc": [
		"1 thoả thuận không quy đổi được, nên chúng nằm ngoài mọi tổng.",
		"12 thoả thuận không quy đổi được, nên chúng nằm ngoài mọi tổng.",
	],
	"settings-theo-doi:kiemTra.khongCoScriptMoTa": [
		"Trang trả lời trong 1 ms, nhưng thẻ không nằm trong HTML. Kiểm lại xem thẻ có nằm trong head, phía trên mọi thứ viết lại trang, hay không.",
		"Trang trả lời trong 12 ms, nhưng thẻ không nằm trong HTML. Kiểm lại xem thẻ có nằm trong head, phía trên mọi thứ viết lại trang, hay không.",
	],
	"settings-theo-doi:kiemTra.cungDocContainer": [
		" Đã đọc cả container Tag Manager 1, và thẻ cũng không có trong đó.",
		" Đã đọc cả container Tag Manager 12, và thẻ cũng không có trong đó.",
	],
	"settings-theo-doi:kiemTra.gtmRoiSiteIdMoTa": [
		"Container 1 có mang thẻ, nhưng site ID không nằm trong URL của script. Tag Manager chỉ giữ lại URL khi chèn script, nên thuộc tính data-site không bao giờ tới được trang và bộ theo dõi không khởi động. Chép đoạn mã Tag Manager ở trên rồi thay phần HTML của thẻ.",
		"Container 12 có mang thẻ, nhưng site ID không nằm trong URL của script. Tag Manager chỉ giữ lại URL khi chèn script, nên thuộc tính data-site không bao giờ tới được trang và bộ theo dõi không khởi động. Chép đoạn mã Tag Manager ở trên rồi thay phần HTML của thẻ.",
	],
	"settings-theo-doi:kiemTra.thayMoTaDau": [
		"Trả lời trong 1 ms. Site ID",
		"Trả lời trong 12 ms. Site ID",
	],
	"settings-ket-noi:chung.daXoa": [
		"Đã xoá 1 mục đã kéo về.",
		"Đã xoá 12 mục đã kéo về.",
	],
	"settings-ket-noi:danhSach.daCamVoi": ["Đã cắm vào 1", "Đã cắm vào 12"],
	"nhac-qua-zalo:khoiZalo.nhanMaCho": [
		"Nhắn mã này cho 1 trên Zalo.",
		"Nhắn mã này cho 12 trên Zalo.",
	],
	"nhac-qua-zalo:khoiZalo.hetHanLuc": ["Hết hạn lúc 1", "Hết hạn lúc 12"],
	"nhac-qua-zalo:ketNoi.daLuu": ["Đã bật 1.", "Đã bật 12."],
	"nhac-qua-zalo:ketNoi.daLuuChuaNhanTin": [
		"Đã lưu 1, nhưng Zalo chưa gọi thử được địa chỉ nhận tin. Bấm “Đăng ký lại” sau ít phút.",
		"Đã lưu 12, nhưng Zalo chưa gọi thử được địa chỉ nhận tin. Bấm “Đăng ký lại” sau ít phút.",
	],
	"nhac-qua-zalo:ketNoi.traLoiLanCuoi": [
		"trả lời lần cuối lúc 1",
		"trả lời lần cuối lúc 12",
	],
	"nhac-qua-zalo:ketNoi.imTieuDe": [
		"Bot không trả lời từ 1",
		"Bot không trả lời từ 12",
	],
	"nhac-qua-zalo:ketNoi.daNoiSo": [
		"1/A người đã nối Zalo",
		"12/A người đã nối Zalo",
	],
	"settings-ket-noi:them.daCamRoi": ["1 đã cắm rồi.", "12 đã cắm rồi."],
	"settings-ket-noi:google.dongBoHong": ["Đồng bộ hỏng: 1", "Đồng bộ hỏng: 12"],
	"settings-ket-noi:slack.daKhopNguoi": [
		"Đã khớp 1 trên A người đã soát.",
		"Đã khớp 12 trên A người đã soát.",
	],
	"settings-ket-noi:slack.thieuQuyen": [
		"Slack giữ lại 1 quyền",
		"Slack giữ lại 12 quyền",
	],
	"settings-ket-noi:slack.camHongMac": [
		"Không cắm được Slack (1).",
		"Không cắm được Slack (12).",
	],
	"settings-ket-noi:slack.goHoi": ["Gỡ 1?", "Gỡ 12?"],
	"settings-ket-noi:quyen.dem": ["1 rộng trên A", "12 rộng trên A"],
	"settings-ket-noi:kenh.chonKenh": ["Chọn kênh #1", "Chọn kênh #12"],
	"settings-ket-noi:kenh.soNguoi": [" · 1 người", " · 12 người"],
	"khung-ung-dung:enrichment.enrichingCount": [
		"Đang tra cứu 1",
		"Đang tra cứu 12",
	],
	"khung-ung-dung:enrichment.bookedMany": [
		"1 bản ghi hẹn tra cứu sau",
		"12 bản ghi hẹn tra cứu sau",
	],
	"khung-ung-dung:enrichment.bookedMore": [
		"Còn 1 bản ghi nữa chưa liệt kê ở đây",
		"Còn 12 bản ghi nữa chưa liệt kê ở đây",
	],
	"khung-ung-dung:enrichment.moreQueued": [
		"Còn 1 đang xếp hàng",
		"Còn 12 đang xếp hàng",
	],
	"tong-quan:stats.closedWonDesc": ["1 · A tháng trước", "12 · A tháng trước"],
	"tong-quan:stats.openPipelineDesc": [
		"1 đang mở · A hạn chốt tháng này",
		"12 đang mở · A hạn chốt tháng này",
	],
	"tong-quan:stats.winRate": ["Tỷ lệ chốt (1 ngày)", "Tỷ lệ chốt (12 ngày)"],
	"tong-quan:stats.wonLost": [
		"1 chốt được · A không thành",
		"12 chốt được · A không thành",
	],
	"tong-quan:stats.avgDeal": [
		"Trung bình mỗi thoả thuận (1 ngày)",
		"Trung bình mỗi thoả thuận (12 ngày)",
	],
	"tong-quan:stats.avgCycle": [
		"Chu kỳ trung bình 1 ngày",
		"Chu kỳ trung bình 12 ngày",
	],
	"tong-quan:unconverted.sentence": [
		"Mọi con số trên đây tính bằng B. 1 bằng A không được tính vì chưa có tỷ giá để quy đổi.",
		"Mọi con số trên đây tính bằng B. 12 bằng A không được tính vì chưa có tỷ giá để quy đổi.",
	],
	"tong-quan:tasks.pastDue": ["1 quá hạn", "12 quá hạn"],
	"settings-ket-noi:kenh.khongKhop": [
		"Không kênh nào khớp “1”.",
		"Không kênh nào khớp “12”.",
	],
	"settings-ket-noi:kenh.themHoi": [
		"Thêm OneHub vào #1?",
		"Thêm OneHub vào #12?",
	],
	"settings-ket-noi:kenh.nhoThemMoTa": [
		"Chưa thêm OneHub vào kênh riêng tư được. Một người đã ở trong #1 phải chạy lệnh này.",
		"Chưa thêm OneHub vào kênh riêng tư được. Một người đã ở trong #12 phải chạy lệnh này.",
	],
	"settings-ket-noi:nguoi.demKhop": ["Đã khớp 1 trên A", "Đã khớp 12 trên A"],
	"settings-khoa-api:thuHoi.choKhoa": ["Thu hồi 1", "Thu hồi 12"],
	"settings-sso:bang.maClient": [" · mã client …1", " · mã client …12"],
	"settings-sso:go.choNha": ["Gỡ 1", "Gỡ 12"],
	"settings-sso:them.daLuu": ["Đã lưu 1.", "Đã lưu 12."],
	"settings-thanh-vien:bang.doiVaiTro": [
		"Đổi vai trò của 1",
		"Đổi vai trò của 12",
	],
	"settings-thanh-vien:phatChia.moTa": [
		"Gửi cho 1. Liên kết dùng được một lần, hết hạn sau một giờ.",
		"Gửi cho 12. Liên kết dùng được một lần, hết hạn sau một giờ.",
	],
	"settings-thanh-vien:phatChia.daChep": [
		"Đã chép. Dán vào Zalo gửi cho 1.",
		"Đã chép. Dán vào Zalo gửi cho 12.",
	],
	"settings-thanh-vien:dem": ["1 · A", "12 · A"],
	"settings-thanh-vien:duocPhepVao.menu": [
		"Hành động với 1",
		"Hành động với 12",
	],
	"settings-thanh-vien:phatChia.vet": [
		"1 đã phát liên kết · A",
		"12 đã phát liên kết · A",
	],
	"agent-builder-khung:doi.soLuotChay": ["1 lượt chạy", "12 lượt chạy"],
	"agent-builder-khung:nha.chaoHoi": [
		"1 cần gì hôm nay?",
		"12 cần gì hôm nay?",
	],
	"agent-builder-tac-nhan:chiTiet.daXoa": ["Đã xoá 1.", "Đã xoá 12."],
	"agent-builder-tac-nhan:chiTiet.xoaHoi": ["Xoá 1?", "Xoá 12?"],
	"agent-builder-tac-nhan:kenh.slackGoiLa": [
		"Slack sẽ gọi nó là #1.",
		"Slack sẽ gọi nó là #12.",
	],
	"agent-builder-tac-nhan:moi.daOTrong": [
		"OneHub đã ở trong #1 rồi.",
		"OneHub đã ở trong #12 rồi.",
	],
	"agent-builder-tac-nhan:moi.seVao": [
		"OneHub chưa ở trong #1. Nó vào khi bạn tạo cái này.",
		"OneHub chưa ở trong #12. Nó vào khi bạn tạo cái này.",
	],
	"agent-builder-tac-nhan:viec.chuyenKenh": [
		"Chuyển từ #1 sang #A",
		"Chuyển từ #12 sang #A",
	],
	"agent-builder-tac-nhan:viec.go": ["Gỡ 1", "Gỡ 12"],
	"agent-builder-tac-nhan:viec.vaoKenh": [
		"OneHub vào #1 và ở lại #1 cho tới khi bạn gỡ.",
		"OneHub vào #12 và ở lại #12 cho tới khi bạn gỡ.",
	],
	"agent-builder-ket-qua:ma.soTep": ["1 tệp", "12 tệp"],
	"agent-builder-ket-qua:ma.soTepDoi": [
		"1 tệp đã đổi. Lưu là ghi thành một bản mới.",
		"12 tệp đã đổi. Lưu là ghi thành một bản mới.",
	],
	"agent-builder-ket-qua:thoaThuan.duongOng": ["1 đang mở", "12 đang mở"],
	"agent-builder-ket-qua:thoaThuan.tongGiaTri": ["tổng 1", "tổng 12"],
	"agent-builder-ket-qua:thoaThuan.ngayNamIm": [
		"nằm im từ 1 ngày",
		"nằm im từ 12 ngày",
	],
	"agent-builder-ket-qua:thoaThuan.soThoaThuan": [
		"1 thoả thuận",
		"12 thoả thuận",
	],
	"agent-builder-tro-chuyen:luot.soHieu": ["Lượt #1", "Lượt #12"],
	"agent-builder-tro-chuyen:luot.banSo": ["· Bản 1", "· Bản 12"],
	"agent-builder-tro-chuyen:luot.soViecNgoai": [
		"1 việc ra ngoài",
		"12 việc ra ngoài",
	],
	"agent-builder-tro-chuyen:luot.catBot": [
		"Đang hiện 1 bước đầu trong A. Lượt chạy này dài quá nên không hiện hết được.",
		"Đang hiện 12 bước đầu trong A. Lượt chạy này dài quá nên không hiện hết được.",
	],
	"agent-builder-tro-chuyen:dung.dangGhi": ["Đang ghi 1", "Đang ghi 12"],
	"agent-builder-tro-chuyen:dung.tienDo": ["1 trên 4", "12 trên 4"],
	"agent-builder-tro-chuyen:man.chiaSeBoi": ["1 chia sẻ", "12 chia sẻ"],
	"agent-builder-tro-chuyen:tacNhanSong.daSong": [
		"1 đã vào chạy.",
		"12 đã vào chạy.",
	],
	"agent-builder-o-soan:tep.rong": ["1 rỗng.", "12 rỗng."],
	"agent-builder-o-soan:tep.quaLon": ["1 lớn hơn 2 MB.", "12 lớn hơn 2 MB."],
	"agent-builder-o-soan:tep.loaiKhongNhan": [
		"1 thuộc loại tệp không nhận được.",
		"12 thuộc loại tệp không nhận được.",
	],
	"agent-builder-o-soan:tep.khongDocDuoc": [
		"1 đọc không được.",
		"12 đọc không được.",
	],
	"agent-builder-o-soan:tep.kiloByte": ["1 KB", "12 KB"],
	"agent-builder-o-soan:tep.megaByte": ["1 MB", "12 MB"],
	"agent-builder-o-soan:the.go": ["Gỡ 1", "Gỡ 12"],
	"agent-builder-hoi-thoai-thao-tac:xoa.xoaMot": ["Xoá 1", "Xoá 12"],
	"agent-builder-hoi-thoai-thao-tac:xoa.xoaHoi": ["Xoá 1?", "Xoá 12?"],
	"okr:demMucTieu": ["1 mục tiêu", "12 mục tiêu"],
	"okr:demDonVi": ["1 mục tiêu · A KR", "12 mục tiêu · A KR"],
	"okr:gopVao": ["góp vào 1 chỗ", "góp vào 12 chỗ"],
	"okr:sheet.tienDoTuSo": [
		"Tiến độ mục tiêu 1% tính từ A KR.",
		"Tiến độ mục tiêu 12% tính từ A KR.",
	],
	"okr:tienDoCua": ["Tiến độ 1: A%", "Tiến độ 12: A%"],
	"okr:khoiMucTieu.tinhTu": ["Tính từ 1 KR", "Tính từ 12 KR"],
	"okr:khoiMucTieu.thuGon": ["Thu gọn KR của «1»", "Thu gọn KR của «12»"],
	"okr:khoiMucTieu.moRa": ["Mở KR của «1»", "Mở KR của «12»"],
	"okr:khoiMucTieu.soKr": ["1 KR", "12 KR"],
	"okr:khoiMucTieu.nhomDaBo": ["Đã bỏ (1)", "Đã bỏ (12)"],
	"okr:khoiMucTieu.nhomDangTheoDoi": [
		"Đang theo dõi (1)",
		"Đang theo dõi (12)",
	],
	"okr:sheet.hoiXoa.body": [
		"Mục tiêu và 1 KR của nó mất hẳn. Vết vẫn ghi lại việc xoá.",
		"Mục tiêu và 12 KR của nó mất hẳn. Vết vẫn ghi lại việc xoá.",
	],
	"okr:khoiMucTieu.soKrCham": ["1 KR chậm", "12 KR chậm"],
	"okr:khoiMucTieu.tuKhoiDiem": ["1 · từ A", "12 · từ A"],
	"okr:caiDat.chuKy.chuyenSang": ["Chuyển sang 1", "Chuyển sang 12"],
	"okr:caiDat.chuKy.daChuyen": ["1 đã sang A.", "12 đã sang A."],
	"okr:caiDat.chuKy.hoi.title": ["Chuyển 1 sang A?", "Chuyển 12 sang A?"],
	"okr:caiDat.mo.daMo": ["Đã mở 1.", "Đã mở 12."],
	"okr:caiDat.chuKy.dongAn": ["Ẩn 1 lúc pha A", "Ẩn 12 lúc pha A"],
	"okr:caiDat.chuKy.anKhoa": [
		"Còn 1 quý đang hiện — ẩn hoặc gỡ quý trước",
		"Còn 12 quý đang hiện — ẩn hoặc gỡ quý trước",
	],
	"okr:caiDat.chuKy.go.tieuDe": ["Gỡ 1?", "Gỡ 12?"],
	"okr:caiDat.chuKy.go.than": [
		"1 chưa có mục tiêu, lần hỏi ý hay quý nào. Gỡ xong chu kỳ biến khỏi bảng; vết tạo và gỡ vẫn còn trong sổ vết.",
		"12 chưa có mục tiêu, lần hỏi ý hay quý nào. Gỡ xong chu kỳ biến khỏi bảng; vết tạo và gỡ vẫn còn trong sổ vết.",
	],
	"okr:caiDat.chuKy.go.xong": ["Đã gỡ 1.", "Đã gỡ 12."],
	"okr:caiDat.chuKy.an.tieuDe": ["Ẩn 1?", "Ẩn 12?"],
	"okr:caiDat.chuKy.an.xong": ["Đã ẩn 1.", "Đã ẩn 12."],
	"okr:caiDat.chuKy.hienLai.tieuDe": ["Hiện lại 1?", "Hiện lại 12?"],
	"okr:caiDat.chuKy.hienLai.than": [
		"Chu kỳ quay lại ô chọn kỳ với pha như lúc ẩn (1), nhận ghi và nhắc lại.",
		"Chu kỳ quay lại ô chọn kỳ với pha như lúc ẩn (12), nhận ghi và nhắc lại.",
	],
	"okr:caiDat.chuKy.hienLai.xong": ["Đã hiện lại 1.", "Đã hiện lại 12."],
	"okr:caiDat.sua.tieuDe": ["Sửa 1", "Sửa 12"],
	"okr:caiDat.sua.moTaMoiO": [
		"1 chưa có dữ liệu — sửa được mọi ô trừ loại và năm.",
		"12 chưa có dữ liệu — sửa được mọi ô trừ loại và năm.",
	],
	"okr:caiDat.sua.moTaCoDuLieu": [
		"1 đã có dữ liệu — chỉ sửa được tên. Ngày, khoảng nghỉ và ngày cập nhật tuần giữ nguyên để số đã tính không lệch.",
		"12 đã có dữ liệu — chỉ sửa được tên. Ngày, khoảng nghỉ và ngày cập nhật tuần giữ nguyên để số đã tính không lệch.",
	],
	"okr:caiDat.sua.moTaRoiKeHoach": [
		"1 đã rời pha Lập kế hoạch — chỉ sửa được tên.",
		"12 đã rời pha Lập kế hoạch — chỉ sửa được tên.",
	],
	"okr:caiDat.sua.xong": ["Đã sửa 1.", "Đã sửa 12."],
	"cua-vao:buoc.choPhep.moTa": ["Ở 1.", "Ở 12."],
	"cua-vao:buoc.nutNgoai.tieuDe": [
		"Đăng nhập bằng 1, đúng địa chỉ đó",
		"Đăng nhập bằng 12, đúng địa chỉ đó",
	],
	"cua-vao:buoc.matKhauPhu.moTa": [
		"Quản trị viên phát liên kết ở 1. Liên kết dùng một lần, hết hạn sau A phút.",
		"Quản trị viên phát liên kết ở 12. Liên kết dùng một lần, hết hạn sau A phút.",
	],
	"okr:capNhat.dauTrang": [
		"1 KR bạn phụ trách · hạn hết Chủ nhật A. Số đã điền sẵn từ lần cập nhật gần nhất — chỉ sửa chỗ đã đổi, rồi chọn mức tự tin.",
		"12 KR bạn phụ trách · hạn hết Chủ nhật A. Số đã điền sẵn từ lần cập nhật gần nhất — chỉ sửa chỗ đã đổi, rồi chọn mức tự tin.",
	],
	"okr:capNhat.soVoi": ["1 so với a", "12 so với a"],
	"okr:capNhat.loiSo": ["Nhập một số, ví dụ 1", "Nhập một số, ví dụ 12"],
	"okr:capNhat.thanh.loiSo": [
		"1 KR có số chưa hợp lệ — sửa rồi gửi.",
		"12 KR có số chưa hợp lệ — sửa rồi gửi.",
	],
	"okr:capNhat.thanh.du": ["Đủ 1/A KR.", "Đủ 12/A KR."],
	"okr:capNhat.thanh.chon": [
		"Đã chọn mức tự tin 1/A KR. KR chưa chọn sẽ chờ lần gửi sau.",
		"Đã chọn mức tự tin 12/A KR. KR chưa chọn sẽ chờ lần gửi sau.",
	],
	"okr:capNhat.gui": ["Gửi 1 cập nhật", "Gửi 12 cập nhật"],
	"okr:capNhat.guiLai": ["Gửi lại 1 cập nhật", "Gửi lại 12 cập nhật"],
	"okr:capNhat.daGui.title": [
		"Đã gửi 1 cập nhật lúc A · mất B giây",
		"Đã gửi 12 cập nhật lúc A · mất B giây",
	],
	"okr:capNhat.daGui.keTiep": [
		"Lần kế tiếp: thứ Hai 1 — tin nhắc buổi sáng sẽ dẫn thẳng về đây.",
		"Lần kế tiếp: thứ Hai 12 — tin nhắc buổi sáng sẽ dẫn thẳng về đây.",
	],
	"okr:capNhat.daGui.conCho": [
		"1 KR chưa chọn mức tự tin vẫn chờ lần gửi sau.",
		"12 KR chưa chọn mức tự tin vẫn chờ lần gửi sau.",
	],
	"okr:capNhat.tuTinNhan": ["Tự tin 1", "Tự tin 12"],
	"okr:capNhat.daXong.luc": [
		"Lần gửi mới nhất 1 lúc A.",
		"Lần gửi mới nhất 12 lúc A.",
	],
	"okr:capNhat.daGuiMotPhan": [
		"Đã gửi 1/A KR tuần này",
		"Đã gửi 12/A KR tuần này",
	],
	"okr:caiDat.mo.tenGoiY.nam": ["Năm 1", "Năm 12"],
	"okr:caiDat.mo.tenGoiY.quy": ["Quý 1/A", "Quý 12/A"],
	"okr-toan-canh:toanCanh.leRa": ["Lẽ ra đã tới 1%", "Lẽ ra đã tới 12%"],
	"okr-toan-canh:tienDoLeRa": [
		"Tiến độ 1: A%, lẽ ra đã tới B%",
		"Tiến độ 12: A%, lẽ ra đã tới B%",
	],
	"okr-toan-canh:hopTuan.tuan": ["Tuần 1", "Tuần 12"],
	"okr-toan-canh:hopTuan.daCapNhat": [
		"đã cập nhật 1/A KR",
		"đã cập nhật 12/A KR",
	],
	"okr-toan-canh:hopTuan.phuTrach": ["Phụ trách 1", "Phụ trách 12"],
	"okr-toan-canh:hopTuan.tut": ["Tụt từ 1 xuống A", "Tụt từ 12 xuống A"],
	"okr-toan-canh:hopTuan.im": ["Im 1 ngày", "Im 12 ngày"],
	"okr-toan-canh:hopTuan.conLai": [
		"Còn lại 1 KR — không có gì mới",
		"Còn lại 12 KR — không có gì mới",
	],
	"okr-toan-canh:toanCanh.soTuanTruoc": ["Tuần trước 1", "Tuần trước 12"],
	"okr-toan-canh:toanCanh.banTut": [
		"1 KR tụt mức tự tin",
		"12 KR tụt mức tự tin",
	],
	"okr-toan-canh:toanCanh.banIm": ["1 KR im lâu", "12 KR im lâu"],
	"okr-toan-canh:toanCanh.banGhiChu": [
		"1 KR có ghi chú mới",
		"12 KR có ghi chú mới",
	],
	"okr-toan-canh:dienBien.bieuDo": [
		"Diễn biến của 1 theo tuần",
		"Diễn biến của 12 theo tuần",
	],
	"okr-toan-canh:dienBien.dich": ["Đích 1", "Đích 12"],
	"okr-toan-canh:dienBien.chuaCoMoTa": [
		"Đường giá trị và mức tự tin hiện ở đây từ lần cập nhật đầu tiên, tuần bắt đầu Thứ Hai 1.",
		"Đường giá trị và mức tự tin hiện ở đây từ lần cập nhật đầu tiên, tuần bắt đầu Thứ Hai 12.",
	],
	"okr-toan-canh:khoiCuaToi.conNua": ["và 1 KR khác", "và 12 KR khác"],
	"okr-toan-canh:tomTat.dongNguon": [
		"Trợ lý OKR tóm tắt từ 1 lần cập nhật · tuần A",
		"Trợ lý OKR tóm tắt từ 12 lần cập nhật · tuần A",
	],
	"okr-toan-canh:tomTat.nhanTrichDan": ["Cập nhật 1", "Cập nhật 12"],
	"okr-toan-canh:tomTat.nhanTrichDanThem": ["Cập nhật 1 +A", "Cập nhật 12 +A"],
	"okr-toan-canh:quanTri.moTa": [
		"Tuần 1 · mọi phòng ban có việc tóm tắt, cả nấc bật và chế độ ẩn. Bấm một phòng để xem câu còn lại và câu bị bỏ.",
		"Tuần 12 · mọi phòng ban có việc tóm tắt, cả nấc bật và chế độ ẩn. Bấm một phòng để xem câu còn lại và câu bị bỏ.",
	],
	"okr-toan-canh:quanTri.boNgan": ["bỏ 1", "bỏ 12"],
	"okr-toan-canh:quanTri.tuanNgan": ["tuần 1", "tuần 12"],
	"okr-toan-canh:quanTri.boTrenTong": ["bỏ 1/A câu", "bỏ 12/A câu"],
	"okr-toan-canh:quanTri.cauCon": ["Câu còn lại · 1", "Câu còn lại · 12"],
	"okr-toan-canh:quanTri.cauBo": ["Câu bị bỏ · 1", "Câu bị bỏ · 12"],
	"agent-builder-tro-chuyen:tacNhanSong.chuLaDoi": [
		"Cả đội · 1",
		"Cả đội · 12",
	],
	"okr-so:donVi.buoc": ["1 bước", "12 bước"],
	"okr-so:donVi.ca-nhan": ["1 cá nhân", "12 cá nhân"],
	"okr-so:donVi.cuoc-goi": ["1 cuộc gọi", "12 cuộc gọi"],
	"okr-so:donVi.thoa-thuan": ["1 thoả thuận", "12 thoả thuận"],
	"okr-so:donVi.thu": ["1 thư", "12 thư"],
	"okr-so:trangThai.hopThoai.xemTruoc.toiHomNay": [
		"Tới hôm nay: 1",
		"Tới hôm nay: 12",
	],
	"okr-so:trangThai.hopThoai.sheets.chiaSe": [
		"Chia sẻ bảng tính cho 1",
		"Chia sẻ bảng tính cho 12",
	],
	"okr-so:trangThai.hopThoai.sheets.docDuoc": [
		"Đọc được 1 lúc A",
		"Đọc được 12 lúc A",
	],
	"okr-so:trangThai.bangKr.doCanh": ["1 tay · A máy", "12 tay · A máy"],
	"okr-so:trangThai.bangKr.moSo": [
		"Xem bản ghi làm nên số của 1",
		"Xem bản ghi làm nên số của 12",
	],
	"okr-so:trangThai.so.khoang": ["Từ 1 đến A", "Từ 12 đến A"],
	"okr-so:trangThai.so.daChup": ["Đã chụp 1 ngày A", "Đã chụp 12 ngày A"],
	"okr-so:trangThai.so.lech": [
		"Đã chụp 1 · tính lại lúc này A — dữ liệu đã đổi sau khi chụp",
		"Đã chụp 12 · tính lại lúc này A — dữ liệu đã đổi sau khi chụp",
	],
	"okr-so:trangThai.capNhat.soTu": ["Số từ 1 · A", "Số từ 12 · A"],
	"okr-so:trangThai.capNhat.soMay": ["Số máy: 1 · A", "Số máy: 12 · A"],
	"okr-khep:dai.ra": [
		"Đang rà giữa kỳ tới hết 1",
		"Đang rà giữa kỳ tới hết 12",
	],
	"okr-khep:cham.daCham": ["Đã chấm 1/A KR", "Đã chấm 12/A KR"],
	"okr-khep:cham.daChamHet": [
		"Đã chấm cả 1 KR của đơn vị. Quản trị đóng kỳ khi mọi đơn vị xong.",
		"Đã chấm cả 12 KR của đơn vị. Quản trị đóng kỳ khi mọi đơn vị xong.",
	],
	"okr-khep:mangSang.moTa": [
		"Tạo một mục tiêu nháp ở 1, cùng đơn vị, loại và người phụ trách. Mục tiêu và điểm ở A giữ nguyên.",
		"Tạo một mục tiêu nháp ở 12, cùng đơn vị, loại và người phụ trách. Mục tiêu và điểm ở A giữ nguyên.",
	],
	"okr-khep:mangSang.chep": ["Chép 1 KR chưa trọn", "Chép 12 KR chưa trọn"],
	"okr-khep:mangSang.khoiDiemMoi": [
		"Khởi điểm mới 1 (số chốt) · đích A",
		"Khởi điểm mới 12 (số chốt) · đích A",
	],
	"okr-khep:caiDat.dongPhu": ["Rà giữa kỳ: 1 – A", "Rà giữa kỳ: 12 – A"],
	"okr-khep:caiDat.daDongRa": [
		"Đã đóng rà giữa kỳ của 1.",
		"Đã đóng rà giữa kỳ của 12.",
	],
	"okr-khep:caiDat.sangCham.tieuDe": [
		"Sang chấm điểm 1?",
		"Sang chấm điểm 12?",
	],
	"okr-khep:caiDat.sangCham.daSang": [
		"1 đã sang chấm điểm.",
		"12 đã sang chấm điểm.",
	],
	"okr-khep:caiDat.ra.tieuDe": ["Mở rà giữa kỳ · 1", "Mở rà giữa kỳ · 12"],
	"okr-khep:caiDat.ra.moTaNgay": [
		"Hai ngày nằm trong chu kỳ, từ 1 đến A. Đóng sớm được từ menu của dòng.",
		"Hai ngày nằm trong chu kỳ, từ 12 đến A. Đóng sớm được từ menu của dòng.",
	],
	"okr-khep:caiDat.ra.loiNgoaiKy": [
		"Khoảng rà phải nằm trong chu kỳ, từ 1 đến A.",
		"Khoảng rà phải nằm trong chu kỳ, từ 12 đến A.",
	],
	"okr-khep:caiDat.ra.daMo": [
		"Đã mở rà giữa kỳ của 1.",
		"Đã mở rà giữa kỳ của 12.",
	],
	"okr-khep:caiDat.dong.chanTieuDe": ["Chưa đóng được 1", "Chưa đóng được 12"],
	"okr-khep:caiDat.dong.chanMoTa": [
		"Kỳ chỉ đóng khi mọi KR của mục tiêu đã công bố có điểm. Còn 1 KR chưa chấm:",
		"Kỳ chỉ đóng khi mọi KR của mục tiêu đã công bố có điểm. Còn 12 KR chưa chấm:",
	],
	"okr-khep:caiDat.dong.soKr": ["1 KR", "12 KR"],
	"okr-khep:caiDat.dong.hoiTieuDe": ["Đóng 1?", "Đóng 12?"],
	"okr-khep:caiDat.dong.hoiThan": [
		"Mọi KR đã chấm. Sau khi đóng, số, điểm và điều học được của 1 chỉ còn để đọc; mở lại cần lý do và để vết.",
		"Mọi KR đã chấm. Sau khi đóng, số, điểm và điều học được của 12 chỉ còn để đọc; mở lại cần lý do và để vết.",
	],
	"okr-khep:caiDat.dong.daDong": ["Đã đóng 1.", "Đã đóng 12."],
	"okr-khep:caiDat.moLai.tieuDe": ["Mở lại 1", "Mở lại 12"],
	"okr-khep:caiDat.moLai.daMo": [
		"1 đã về pha chấm điểm.",
		"12 đã về pha chấm điểm.",
	],
	"okr-tai-co-cau:toChuc.okrMo": [
		"OKR: 1 mục tiêu ở kỳ đang mở",
		"OKR: 12 mục tiêu ở kỳ đang mở",
	],
	"okr-tai-co-cau:toChuc.chan.lyDo.phong-ban": [
		"Phòng ban còn 1 mục tiêu ở kỳ đang mở — chuyển OKR hoặc bỏ mục tiêu trước khi lưu trữ.",
		"Phòng ban còn 12 mục tiêu ở kỳ đang mở — chuyển OKR hoặc bỏ mục tiêu trước khi lưu trữ.",
	],
	"okr-tai-co-cau:toChuc.chan.lyDoNguoi": [
		"Còn 1 người có phòng ban chính ở đây — chuyển họ trước.",
		"Còn 12 người có phòng ban chính ở đây — chuyển họ trước.",
	],
	"okr-tai-co-cau:toChuc.chan.lyDo.bo-phan": [
		"Bộ phận còn 1 mục tiêu ở kỳ đang mở — chuyển OKR hoặc bỏ mục tiêu trước khi lưu trữ.",
		"Bộ phận còn 12 mục tiêu ở kỳ đang mở — chuyển OKR hoặc bỏ mục tiêu trước khi lưu trữ.",
	],
	"okr-tai-co-cau:chuyen.danhSach": [
		"Mục tiêu ở kỳ đang mở (1)",
		"Mục tiêu ở kỳ đang mở (12)",
	],
	"okr-tai-co-cau:chuyen.dongMoTa": ["1 KR · A · B", "12 KR · A · B"],
	"okr-tai-co-cau:chuyen.quaTran": [
		"Mỗi lần chuyển tối đa 1 mục tiêu — bỏ chọn bớt rồi chuyển.",
		"Mỗi lần chuyển tối đa 12 mục tiêu — bỏ chọn bớt rồi chuyển.",
	],
	"okr-tai-co-cau:chuyen.nut": ["Chuyển 1 mục tiêu", "Chuyển 12 mục tiêu"],
	"okr-tai-co-cau:chuyen.xong": [
		"Đã chuyển 1 mục tiêu sang A.",
		"Đã chuyển 12 mục tiêu sang A.",
	],
} satisfies Record<string, [string, string]>;

describe("kho chuoi cua vong ③a", () => {
	for (const [ten, lay] of MODULE) {
		it(`${ten}: khoa tieng Viet khop het khoa tieng Anh`, () => {
			const en = phang(lay("en")).map(([k]) => k);
			const vi = phang(lay("vi")).map(([k]) => k);
			expect(vi.sort()).toEqual(en.sort());
		});

		it(`${ten}: moi gia tri tieng Viet mang dau, tru khoa da khai`, () => {
			const xau = phang(lay("vi"))
				.filter(([k]) => !mienDau(k))
				.map(([k, v]) => [k, hienRa(v)] as const)
				.filter(([, s]) => !DAU_TIENG_VIET.test(s));
			expect(xau).toEqual([]);
		});

		it(`${ten}: khong gia tri nao con y het ban tieng Anh`, () => {
			const en = new Map(phang(lay("en")).map(([k, v]) => [k, hienRa(v)]));
			const trung = phang(lay("vi"))
				.filter(([k]) => !mienDau(k))
				.map(([k, v]) => [k, hienRa(v)] as const)
				.filter(([k, s]) => en.get(k) === s);
			expect(trung).toEqual([]);
		});
	}

	it("moi ham ghep bien co khang dinh, va so ham bang so khang dinh", () => {
		const ham: string[] = [];
		for (const [ten, lay] of MODULE) {
			for (const [k, v] of phang(lay("vi"))) {
				if (v instanceof Function) ham.push(`${ten}:${k}`);
			}
		}

		expect(ham.filter((k) => !(k in GHIM)).sort()).toEqual([]);

		for (const [khoa, [mot, nhieu]] of Object.entries(GHIM)) {
			const [ten, duong] = khoa.split(":");
			const lay = MODULE.find(([t]) => t === ten)?.[1];
			if (!lay) throw new Error(`khong co module ${ten}`);
			const f = phang(lay("vi")).find(([k]) => k === duong)?.[1];
			if (!(f instanceof Function)) throw new Error(`${khoa} khong phai ham`);
			expect(f.length).toBeLessThanOrEqual(DOI_SO_GHIM[0].length);
			expect(f(...DOI_SO_GHIM[0].slice(0, f.length))).toBe(mot);
			expect(f(...DOI_SO_GHIM[1].slice(0, f.length))).toBe(nhieu);
		}
	});
});

describe("man Xong cua trang dat mat khau", () => {
	it("nut ve man dang nhap la chuoi rieng, khong dung lai chuoi nut gui", () => {
		const LOCALE: readonly Locale[] = ["en", "vi"];

		for (const locale of LOCALE) {
			const m = authMessages(locale).datMatKhau;
			expect(m.xong.dangNhap).not.toBe(m.gui);
			expect(m.xong.dangNhap.length).toBeGreaterThan(0);
		}

		expect(authMessages("vi").datMatKhau.xong.dangNhap).toBe("Đăng nhập");
		expect(authMessages("vi").datMatKhau.gui).toBe("Đặt mật khẩu");
	});
});

describe("dinh dang theo tieng cua lat Tong quan", () => {
	it('khong cho nao trong lat ghim "en" vao formatCount', () => {
		const THU_MUC = join(import.meta.dir, "..");
		const FILE = [
			"app/(app)/[slug]/dashboard-summary.tsx",
			"app/(app)/[slug]/sales-dashboard.tsx",
			"app/(app)/[slug]/overview-greeting.tsx",
			"app/(app)/[slug]/overview-scope.tsx",
			"components/app-header.tsx",
			"components/app-icon-rail.tsx",
			"components/enrichment-queue.tsx",
			"components/crm/quick-switcher.tsx",
		];
		const ghim = FILE.flatMap((f) => {
			const chu = readFileSync(join(THU_MUC, f), "utf8");
			return [...chu.matchAll(/formatCount\([^)]*"(en|vi)"[^)]*\)/g)].map(
				(m) => `${f}: ${m[0]}`,
			);
		});
		expect(ghim).toEqual([]);
	});
});

describe("khoa chet", () => {
	const song = taoSong(docDuongGoi(join(import.meta.dir, "..")));
	const CHUA_NOI = new Set(CHUA_NOI_KHAI);

	it("chan nay do duoc: mot khoa khong ai goi phai bi goi ten", () => {
		expect(song("khongAiGoiKhoaNay")).toBe(false);
		expect(song("nhomKhongTonTai.khongAiGoiKhoaNay")).toBe(false);
	});

	it("chan nay do duoc: ten la trung mot tu pho thong khong giu khoa song", () => {
		expect(song("deal.person")).toBe(true);
		expect(song("deal.email")).toBe(false);
		expect(song("deal.title")).toBe(false);
		expect(song("company.person")).toBe(false);
		expect(song("contact.stage")).toBe(false);
	});

	it("moi khoa da khai deu co cho goi, tru ban khai CHUA_NOI", () => {
		const chet: string[] = [];
		for (const [ten, lay] of MODULE)
			for (const [duong] of phang(lay("en")))
				if (!song(duong) && !CHUA_NOI.has(`${ten}.${duong}`))
					chet.push(`${ten}.${duong}`);
		expect(chet.sort()).toEqual([]);
	});

	it("ban khai CHUA_NOI khong duoc co dong chet", () => {
		const songLai: string[] = [];
		for (const [ten, lay] of MODULE)
			for (const [duong] of phang(lay("en")))
				if (song(duong) && CHUA_NOI.has(`${ten}.${duong}`))
					songLai.push(`${ten}.${duong}`);
		const khongCoKhoa = [...CHUA_NOI].filter((khoa) => {
			const [ten, ...con] = khoa.split(".");
			const lay = MODULE.find(([t]) => t === ten)?.[1];
			return !lay || !phang(lay("en")).some(([d]) => d === con.join("."));
		});
		expect([...songLai, ...khongCoKhoa].sort()).toEqual([]);
	});
});

describe("bo doc duong goi", () => {
	const VAT_THU = join(import.meta.dir, "vat-thu-duong-goi");

	it("phan giai theo pham vi: hai ham cung dat ten bien m cho hai nhanh khac nhau", () => {
		const song = taoSong(docDuongGoi(VAT_THU));
		expect(song("fields.add")).toBe(true);
		expect(song("standard.company")).toBe(true);
		expect(song("fields.company")).toBe(false);
		expect(song("standard.add")).toBe(false);
	});
});
