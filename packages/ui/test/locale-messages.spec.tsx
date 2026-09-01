import { describe, expect, test } from "bun:test";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AttendeeList } from "../src/components/attendee-list";
import { LocaleProvider } from "../src/components/locale-provider";
import { Spinner } from "../src/components/spinner";
import { TablePagination } from "../src/components/table-pagination";
import { ThreadMessage } from "../src/components/thread-message";
import { TooltipProvider } from "../src/components/tooltip";
import type { Locale } from "../src/lib/locale";
import { type Messages, messages } from "../src/lib/messages";

function ve(node: ReactElement, locale?: Locale): string {
	const than = <TooltipProvider>{node}</TooltipProvider>;
	if (locale === undefined) return renderToStaticMarkup(than);
	return renderToStaticMarkup(
		<LocaleProvider locale={locale}>{than}</LocaleProvider>,
	);
}

const phanTrang = (
	<TablePagination
		page={1}
		totalPages={3}
		pageSize={20}
		total={1234}
		onPageChange={() => {}}
	/>
);

describe("bảng dịch", () => {
	test("hai bản có cùng bộ khoá", () => {
		const khoa = (bang: Messages): string[] =>
			Object.entries(bang)
				.flatMap(([nhom, muc]) =>
					Object.keys(muc).map((ten) => `${nhom}.${ten}`),
				)
				.sort();
		expect(khoa(messages("vi"))).toEqual(khoa(messages("en")));
	});

	test("không khoá nào của bản tiếng Việt còn nguyên chuỗi tiếng Anh", () => {
		expect(messages("vi").table.filters).not.toBe(messages("en").table.filters);
		expect(messages("vi").pagination.next).not.toBe(
			messages("en").pagination.next,
		);
	});
});

describe("component đọc ngôn ngữ từ nhà cung cấp", () => {
	test("phân trang hiện tiếng Việt", () => {
		const ra = ve(phanTrang, "vi");
		expect(ra).toContain("Trước");
		expect(ra).toContain("Tiếp");
		expect(ra).toContain("trong");
		expect(ra).not.toContain("Previous");
		expect(ra).not.toContain("Showing");
	});

	test("con quay chờ đặt nhãn tiếng Việt cho trình đọc màn hình", () => {
		expect(ve(<Spinner />, "vi")).toContain('aria-label="Đang tải"');
	});

	test("thư rỗng nói bằng tiếng Việt", () => {
		const ra = ve(<ThreadMessage author="Lan" />, "vi");
		expect(ra).toContain("Thư không có nội dung.");
		expect(ra).not.toContain("No message body.");
	});

	test("trạng thái người dự có nhãn cho đúng bốn giá trị lịch trả về", () => {
		const vi = messages("vi").attendee;
		for (const trang_thai of [
			"accepted",
			"declined",
			"tentative",
			"needsAction",
		] as const) {
			expect(vi[trang_thai]).toBeString();
			expect(vi[trang_thai]).not.toBe(messages("en").attendee[trang_thai]);
		}
	});

	test("danh sách người dự không rò chữ tiếng Anh ra thân trang", () => {
		const ra = ve(
			<AttendeeList
				attendees={[{ email: "lan@onemount.com", responseStatus: "declined" }]}
			/>,
			"vi",
		);
		expect(ra).not.toContain("Declined");
		expect(ra).not.toContain("No reply");
	});
});

describe("AC-3 — dựng NGOÀI nhà cung cấp", () => {
	test("không nổ, và rơi về tiếng Anh", () => {
		const ra = ve(phanTrang);
		expect(ra).toContain("Previous");
		expect(ra).toContain("Showing");
	});

	test("mọi component vòng này chạm đều dựng được khi thiếu nhà cung cấp", () => {
		expect(() => ve(<Spinner />)).not.toThrow();
		expect(() => ve(<ThreadMessage author="Lan" />)).not.toThrow();
		expect(() => ve(<AttendeeList attendees={[]} />)).not.toThrow();
	});
});

describe("AC-9 — đổi nhà cung cấp thì chữ đổi, không cần tải lại", () => {
	test("cùng một component, hai giá trị nhà cung cấp, hai kết quả", () => {
		const vi = ve(phanTrang, "vi");
		const en = ve(phanTrang, "en");
		expect(vi).not.toBe(en);
		expect(vi).toContain("Trước");
		expect(en).toContain("Previous");
	});
});

describe("AC-8 — số theo quy ước tiếng Việt, một kết quả cho cả hai phía", () => {
	test("phân trang in số theo vùng người đọc", () => {
		expect(ve(phanTrang, "vi")).toContain("1.234");
		expect(ve(phanTrang, "en")).toContain("1,234");
	});

	test("không chỗ nào trong gói khai Intl ở tầng module", async () => {
		const { readdirSync, readFileSync } = await import("node:fs");
		const goc = `${import.meta.dir}/../src/components`;
		const pham: string[] = [];
		for (const ten of readdirSync(goc)) {
			if (!ten.endsWith(".tsx")) continue;
			const nguon = readFileSync(`${goc}/${ten}`, "utf8");
			for (const [i, dong] of nguon.split("\n").entries()) {
				if (/^const .*new Intl\.(NumberFormat|DateTimeFormat)/.test(dong)) {
					pham.push(`${ten}:${i + 1}`);
				}
			}
		}
		expect(pham).toEqual([]);
	});
});
