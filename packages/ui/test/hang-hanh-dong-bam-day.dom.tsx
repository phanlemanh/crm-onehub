import { afterEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Button } from "../src/components/button";
import { Field, FieldGroup } from "../src/components/field";
import { HangHanhDongBamDay } from "../src/components/hang-hanh-dong-bam-day";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

function ve(node: React.ReactNode) {
	khung = document.createElement("div");
	document.body.append(khung);
	root = createRoot(khung);
	act(() => root?.render(node));
	return khung;
}

describe("hhd-bam-day", () => {
	test("hhd-bam-day: hàng ngang mang data-slot riêng, chứa nút, đứng sau các Field anh em", () => {
		const k = ve(
			<FieldGroup>
				<Field>ô một</Field>
				<Field>ô hai</Field>
				<HangHanhDongBamDay>
					<Button type="submit">Gửi</Button>
				</HangHanhDongBamDay>
			</FieldGroup>,
		);
		const hang = k.querySelectorAll("[data-slot=hang-hanh-dong-bam-day]");
		expect(
			hang.length,
			"hhd-bam-day: thieu data-slot hang-hanh-dong-bam-day",
		).toBe(1);
		const h = hang[0] as HTMLElement;
		expect(h.getAttribute("data-orientation")).toBe("horizontal");
		expect(h.getAttribute("role")).toBe("group");
		expect(h.querySelector("button")?.textContent).toBe("Gửi");
		const truoc = [...k.querySelectorAll("[data-slot=field]")];
		expect(truoc.length).toBe(2);
		expect(
			truoc.every(
				(f) => f.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING,
			),
		).toBe(true);
		for (const lop of [
			"max-md:sticky",
			"max-md:bottom-0",
			"max-md:border-t",
			"max-md:bg-background",
		])
			expect(h.className.split(" "), `hhd-bam-day: thieu lop ${lop}`).toContain(
				lop,
			);
		expect(
			h.className.split(" ").some((l) => /^(md:|lg:)?sticky$/.test(l)),
			"hhd-bam-day: bam o may tinh",
		).toBe(false);
	});
});
