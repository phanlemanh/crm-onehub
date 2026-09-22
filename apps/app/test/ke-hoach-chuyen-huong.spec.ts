import { describe, expect, mock, test } from "bun:test";

class ChuyenHuong extends Error {
	constructor(readonly dich: string) {
		super(`chuyen huong toi ${dich}`);
	}
}

const dieuHuongThat = await import("next/navigation");

mock.module("next/navigation", () => ({
	...dieuHuongThat,
	redirect: (dich: string) => {
		throw new ChuyenHuong(dich);
	},
}));

const { default: PlanRedirect } = await import(
	"@/app/(app)/[slug]/onboarding/[planId]/page"
);
const { recordHref } = await import("@/lib/record-href");

async function dichDen(slug: string, planId: string): Promise<string> {
	try {
		await PlanRedirect({ params: Promise.resolve({ slug, planId }) });
	} catch (loi) {
		if (loi instanceof ChuyenHuong) return loi.dich;
		throw loi;
	}
	throw new Error("khong chuyen huong — trang cu van tra noi dung");
}

describe("ke-hoach-chuyen-huong", () => {
	test("duong cu /onboarding/<id> chuyen ve sheet ke hoach", async () => {
		const dich = await dichDen("onehub", "P");

		expect(dich).toBe(recordHref("onehub", "/onboarding", "plan", "P"));
		expect(dich).toContain("/onboarding?");
		expect(decodeURIComponent(dich)).toContain("record=plan:P");
	});

	test("id khac thi dich khac", async () => {
		const dich = await dichDen("onehub", "Q");

		expect(decodeURIComponent(dich)).toContain("record=plan:Q");
		expect(dich).not.toBe(await dichDen("onehub", "P"));
	});
});
