import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { companyMessages } from "@/lib/messages/companies";
import { contactMessages } from "@/lib/messages/contacts";
import { crmMessages } from "@/lib/messages/crm";
import { dealMessages } from "@/lib/messages/deals";
import { recordSheetMessages } from "@/lib/messages/record-sheet";

const DAU_TIENG_VIET =
	/[ăâđêôơưĂÂĐÊÔƠƯáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵÁÀẢÃẠẮẰẲẴẶẤẦẨẪẬÉÈẺẼẸẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴ]/;

const MODULE = [
	["companies", companyMessages],
	["contacts", contactMessages],
	["deals", dealMessages],
	["record-sheet", recordSheetMessages],
	["crm", crmMessages],
] as const;

type GiaTri = string | ((...doiSo: string[]) => string);
type Nhanh = { readonly [khoa: string]: GiaTri | Nhanh };

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
]);

function mienDau(khoa: string): boolean {
	const phan = khoa.split(".");
	return KHONG_DAU.has(khoa) || KHONG_DAU.has(phan.slice(-2).join("."));
}

function hienRa(v: GiaTri): string {
	return v instanceof Function ? v("X", "Y", "Z") : v;
}

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
	const NGUON = readdirSync(join(import.meta.dir, ".."), {
		recursive: true,
		withFileTypes: true,
	})
		.filter(
			(muc) =>
				muc.isFile() &&
				/\.tsx?$/.test(muc.name) &&
				!muc.parentPath.includes("/lib/messages") &&
				!muc.parentPath.includes("/test") &&
				!muc.parentPath.includes("/node_modules") &&
				!muc.parentPath.includes("/.next"),
		)
		.map((muc) => readFileSync(join(muc.parentPath, muc.name), "utf8"))
		.join("\n");

	const coTen = (ten: string) =>
		new RegExp(`\\.${ten}\\b|"${ten}"|'${ten}'`).test(NGUON);

	function song(duong: string): boolean {
		const phan = duong.split(".");
		const la = phan[phan.length - 1] ?? "";
		if (!coTen(la)) return false;
		const cha = phan[phan.length - 2];
		if (!cha) return true;
		if (new RegExp(`\\.${cha}\\.${la}\\b`).test(NGUON)) return true;
		return coTen(cha);
	}

	it("chan nay do duoc: mot khoa khong ai goi phai bi goi ten", () => {
		expect(song("khongAiGoiKhoaNay")).toBe(false);
		expect(song("nhomKhongTonTai.khongAiGoiKhoaNay")).toBe(false);
	});

	it("moi khoa da khai deu co it nhat mot cho goi trong apps/app", () => {
		const chet: string[] = [];

		for (const [ten, lay] of MODULE) {
			for (const [duong] of phang(lay("en"))) {
				if (!song(duong)) chet.push(`${ten}.${duong}`);
			}
		}

		expect(chet.sort()).toEqual([]);
	});
});
