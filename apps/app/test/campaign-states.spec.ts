import { describe, expect, it } from "bun:test";
import {
	createState,
	listState,
} from "@/app/(app)/[slug]/campaigns/campaign-state";
import { campaignMessages } from "@/lib/messages/campaigns";

const DAU =
	/[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

describe("trạng thái hai màn chiến dịch", () => {
	it("không có dòng nào thì là rỗng, có dòng thì là danh sách", () => {
		expect(listState([], false)).toBe("empty");
		expect(listState([{ id: "a" }], false)).toBe("rows");
		expect(listState([], true)).toBe("loading");
	});

	it("chưa có góc nhìn cá nhân dùng chung thì hộp tạo nói thẳng", () => {
		expect(createState([])).toBe("no-views");
		expect(createState([{ id: "v1" }])).toBe("ready");
	});

	it("hai câu rỗng toàn cục có trong kho chuỗi và mang dấu", () => {
		const m = campaignMessages("vi");
		expect(m.empty.list).toMatch(DAU);
		expect(m.empty.noViews).toMatch(DAU);
	});
});
