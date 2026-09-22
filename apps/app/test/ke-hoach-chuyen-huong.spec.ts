import { describe, expect, test } from "bun:test";
import PlanRedirect from "@/app/(app)/[slug]/onboarding/[planId]/page";
import { recordHref } from "@/lib/record-href";

async function dichDen(slug: string, planId: string): Promise<string> {
	try {
		await PlanRedirect({ params: Promise.resolve({ slug, planId }) });
	} catch (loi) {
		const digest = (loi as { digest?: string }).digest ?? "";
		const [loai, , dich] = digest.split(";");
		if (loai === "NEXT_REDIRECT" && dich !== undefined) return dich;
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
