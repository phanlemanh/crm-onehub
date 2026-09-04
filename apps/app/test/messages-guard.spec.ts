import { describe, expect, it } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { Locale } from "@crm/ui/lib/locale";
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
			: v instanceof Object
				? phang(v, `${tien}${k}.`)
				: [[`${tien}${k}`, v]],
	);
}

const KHONG_DAU = new Set([
	"headers.email",
	"tabs.emails",
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
	"ten.microsoft",
	"ten.microsoft365",
	"ten.outlook",
	"ten.stripe",
	"ten.docusign",
]);

function mienDau(khoa: string): boolean {
	const phan = khoa.split(".");
	return KHONG_DAU.has(khoa) || KHONG_DAU.has(phan.slice(-2).join("."));
}

function hienRa(v: GiaTri): string {
	return v instanceof Function ? v("X", "Y", "Z") : v;
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
];

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
		const GHIM = {
			"auth:signIn.continueWith": ["Tiếp tục với 1", "Tiếp tục với 12"],
			"auth:grantAccess.grant": ["Cấp quyền 1", "Cấp quyền 12"],
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
			"deals:bulk.closeLost": [
				"Chốt 1 là không thành",
				"Chốt 12 là không thành",
			],
			"deals:bulk.markUnqualified": [
				"Đánh dấu 1 là chưa phù hợp",
				"Đánh dấu 12 là chưa phù hợp",
			],
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
				"1 làm việc ở đó vẫn ở lại CRM, nhưng không thuộc công ty nào.",
				"12 làm việc ở đó vẫn ở lại CRM, nhưng không thuộc công ty nào.",
			],
			"record-sheet:company.archived": ["Đã lưu trữ 1.", "Đã lưu trữ 12."],
			"record-sheet:company.restored": ["Đã khôi phục 1.", "Đã khôi phục 12."],
			"record-sheet:company.purged": [
				"Đã xoá vĩnh viễn 1.",
				"Đã xoá vĩnh viễn 12.",
			],
			"record-sheet:contact.primaryAt": [
				"Đầu mối chính ở 1",
				"Đầu mối chính ở 12",
			],
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
			"record-sheet:deal.onDeal": [
				"1 đã vào thoả thuận.",
				"12 đã vào thoả thuận.",
			],
			"record-sheet:deal.everybodyOn": [
				"Mọi người ở 1 đã ở trong rồi",
				"Mọi người ở 12 đã ở trong rồi",
			],
			"record-sheet:deal.created": ["Đã tạo 1.", "Đã tạo 12."],
			"record-sheet:deal.deleteWarning": [
				"Lịch sử giai đoạn, ghi chú và hội thoại với tác nhân đều mất theo. 1 và A trong đó vẫn ở lại CRM.",
				"Lịch sử giai đoạn, ghi chú và hội thoại với tác nhân đều mất theo. 12 và A trong đó vẫn ở lại CRM.",
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
			"crm:fields.filledOn": [
				"Đã điền cho 1 trên A B",
				"Đã điền cho 12 trên A B",
			],
			"crm:sheet.restore": ["Khôi phục 1", "Khôi phục 12"],
			"crm:sheet.archive": ["Lưu trữ 1", "Lưu trữ 12"],
			"crm:sheet.deleteForever": ["Xoá vĩnh viễn 1", "Xoá vĩnh viễn 12"],
			"crm:sheet.fallbackName": ["1 này", "12 này"],
			"crm:sheet.archived": ["Đã lưu trữ 1.", "Đã lưu trữ 12."],
			"crm:sheet.restored": ["Đã khôi phục 1.", "Đã khôi phục 12."],
			"crm:sheet.deletedForever": [
				"Đã xoá vĩnh viễn 1.",
				"Đã xoá vĩnh viễn 12.",
			],
			"crm:web.views": ["1 lượt xem", "12 lượt xem"],
			"crm:fields.removeOption": ["Bỏ 1", "Bỏ 12"],
			"crm:fields.moreFor": ["Thêm hành động cho 1", "Thêm hành động cho 12"],
			"crm:fields.archiveTitle": ["Lưu trữ 1?", "Lưu trữ 12?"],
			"crm:fields.filledOf": ["1 · đã điền A/B", "12 · đã điền A/B"],
			"record-sheet:company.unconverted": [
				"+1 chưa quy đổi",
				"+12 chưa quy đổi",
			],
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
			"settings:chep.xong": ["Đã chép 1.", "Đã chép 12."],
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
			"settings-ket-noi:them.daCamRoi": ["1 đã cắm rồi.", "12 đã cắm rồi."],
			"settings-ket-noi:google.dongBoHong": [
				"Đồng bộ hỏng: 1",
				"Đồng bộ hỏng: 12",
			],
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
			"settings-ket-noi:nguoi.demKhop": [
				"Đã khớp 1 trên A",
				"Đã khớp 12 trên A",
			],
			"settings-khoa-api:thuHoi.choKhoa": ["Thu hồi 1", "Thu hồi 12"],
			"settings-sso:bang.maClient": [" · mã client …1", " · mã client …12"],
			"settings-sso:go.choNha": ["Gỡ 1", "Gỡ 12"],
			"settings-sso:them.daLuu": ["Đã lưu 1.", "Đã lưu 12."],
			"settings-thanh-vien:bang.doiVaiTro": [
				"Đổi vai trò của 1",
				"Đổi vai trò của 12",
			],
		} satisfies Record<string, [string, string]>;

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
			expect(f("1", "A", "B")).toBe(mot);
			expect(f("12", "A", "B")).toBe(nhieu);
		}
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
