import { afterEach, describe, expect, test } from "bun:test";
import { TheDangDung } from "@crm/ui/components/the-dang-dung";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useTheDangDung } from "@/lib/agent-builder-the-dang-dung";
import { troChuyenMessages } from "@/lib/messages/agent-builder-tro-chuyen";

const t = troChuyenMessages("vi");
const BUOC_VAT = [
	null,
	"agent/instructions.md",
	"agent/manifest.json",
	"agent/README.md",
] as const;
const DANG_GHI = "agent/manifest.json";
const GIAY_MS = 1000;
const NUT = "Dừng";

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function The({
	daXong,
	batDauLuc,
}: {
	daXong: number;
	batDauLuc: string | null;
}) {
	const the = useTheDangDung({
		t,
		buocVat: BUOC_VAT,
		daXong,
		dangGhi: DANG_GHI,
		batDauLuc,
	});
	return h(TheDangDung, {
		...the,
		nutDung: h("button", { type: "button" }, NUT),
	});
}

function ve(daXong: number, batDauLuc: string | null = null) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() => root?.render(h(The, { daXong, batDauLuc })));
	return o;
}

function luc(giayTruoc: number) {
	return new Date(Date.now() - giayTruoc * GIAY_MS).toISOString();
}

export function kiemBuoc(khung: Element, daXong: number): string[] {
	const loi: string[] = [];
	const hang = [...khung.querySelectorAll("li")];
	if (hang.length !== t.man.buoc.length) loi.push("so buoc");
	hang.forEach((li, i) => {
		const chu = li.textContent ?? "";
		const vat = BUOC_VAT[i]?.replace("agent/", "") ?? null;
		const dangLam = li.getAttribute("aria-current") === "step";
		if (i < daXong) {
			if (dangLam || !chu.includes(vat ?? t.dung.xong))
				loi.push(`buoc xong ${i}`);
		} else if (i === daXong) {
			if (
				!dangLam ||
				!chu.includes(t.dung.dangLam) ||
				!chu.includes(t.dung.dangGhi(DANG_GHI))
			)
				loi.push(`buoc dang lam ${i}`);
		} else if (dangLam || !chu.includes(t.dung.dangXep)) {
			loi.push(`buoc dang xep ${i}`);
		}
	});
	return loi;
}

describe("TheDangDung — nội dung qua useTheDangDung", () => {
	for (const daXong of [0, 1, 3, 4]) {
		test(`noi-dung daXong=${daXong}`, () => {
			const khung = ve(daXong);
			expect(khung.textContent).toContain(t.dung.dangDung);
			expect(khung.textContent).toContain(t.dung.tienDo(String(daXong)));
			const hang = [...khung.querySelectorAll("li")];
			expect(hang).toHaveLength(4);
			for (const [i, li] of hang.entries()) {
				const chu = li.textContent ?? "";
				const dangLam = li.getAttribute("aria-current") === "step";
				if (i < daXong) {
					expect(dangLam).toBe(false);
					expect(chu).toContain(
						BUOC_VAT[i]?.replace("agent/", "") ?? t.dung.xong,
					);
				} else if (i === daXong) {
					expect(dangLam).toBe(true);
					expect(chu).toContain(t.dung.dangLam);
					expect(chu).toContain(t.dung.dangGhi(DANG_GHI));
				} else {
					expect(dangLam).toBe(false);
					expect(chu).toContain(t.dung.dangXep);
				}
			}
			expect(kiemBuoc(khung, daXong)).toEqual([]);
			const chan = khung.querySelector('[data-slot="card-footer"]');
			expect(chan?.textContent).toContain(t.dung.roiTrang);
			expect(chan?.querySelector("button")?.textContent).toBe(NUT);
		});
	}

	test("noi-dung chieu do: daXong=1 doi chieu nhu daXong=2", () => {
		const loi = kiemBuoc(ve(1), 2);
		expect(loi.some((dong) => dong.startsWith("buoc dang lam"))).toBe(true);
	});

	test("noi-dung dong ho va qua nguong", () => {
		const chua = ve(1, null);
		expect(chua.querySelector('[data-slot="da-troi"]')).toBeNull();
		expect(chua.querySelector('[data-slot="lau-hon"]')).toBeNull();
		act(() => root?.unmount());

		const lau = ve(1, luc(250));
		expect(lau.querySelector('[data-slot="da-troi"]')?.textContent).toBe(
			t.dung.daTroi("4:10"),
		);
		expect(lau.querySelector('[data-slot="lau-hon"]')?.textContent).toBe(
			t.dung.lauHon,
		);
	});
});
