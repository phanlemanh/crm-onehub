import { describe, expect, it } from "bun:test";
import { parseListingBatch } from "../src/listing-ingest";

const item = {
	url: "https://nhatot.com/moi-gioi-abc",
	shopName: "BĐS Quận 7",
	personName: "Trịnh Minh Hiếu",
	isCompany: false,
	hasLicense: true,
	districts: ["Quận 7", "Nhà Bè"],
	city: "Tp Hồ Chí Minh",
	listingsTotal: 163,
	listingsNew30d: 164,
	tier: "cao",
	phone: "0901234567",
};

const batch = {
	source: "nhatot",
	crawledAt: "2026-09-04T10:00:00Z",
	items: [item],
};

describe("lô từ sàn", () => {
	it("nhận lô hợp lệ và giữ nguyên giá trị", () => {
		const parsed = parseListingBatch(batch);
		expect(parsed.items[0]?.listingsNew30d).toBe(164);
		expect(parsed.items[0]?.tier).toBe("cao");
	});

	it("mục vắng số điện thoại vẫn hợp lệ", () => {
		const { phone, ...rest } = item;
		const parsed = parseListingBatch({ ...batch, items: [rest] });
		expect(parsed.items[0]?.phone).toBeUndefined();
	});

	it("từ chối mục thiếu số tin và gọi tên trường", () => {
		const { listingsTotal, ...rest } = item;
		expect(() => parseListingBatch({ ...batch, items: [rest] })).toThrow(
			/items\.0\.listingsTotal/,
		);
	});

	it("từ chối mức sản lượng viết hoa", () => {
		expect(() =>
			parseListingBatch({ ...batch, items: [{ ...item, tier: "CAO" }] }),
		).toThrow(/items\.0\.tier/);
	});

	it("từ chối lô rỗng và lô quá 500 mục", () => {
		expect(() => parseListingBatch({ ...batch, items: [] })).toThrow();
		expect(() =>
			parseListingBatch({ ...batch, items: Array(501).fill(item) }),
		).toThrow();
	});
});
