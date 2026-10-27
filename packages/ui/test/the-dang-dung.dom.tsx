import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	Card,
	CardAction,
	CardFooter,
	CardHeader,
} from "../src/components/card";
import { TheDangDung } from "../src/components/the-dang-dung";

let roots: Root[] = [];

afterEach(() => {
	act(() => {
		for (const root of roots) root.unmount();
	});
	roots = [];
	document.body.innerHTML = "";
});

function ve(cay: ReactElement) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	roots.push(root);
	act(() => root.render(cay));
	return o;
}

const CHU = {
	tieuDe: "Đang dựng tác nhân",
	nhanTienDo: "Tiến độ dựng tác nhân",
	tienDo: "1 trên 4",
	xong: "Xong",
	dangLam: "Đang làm",
	dangXep: "Đang xếp",
	roiTrang: "Anh có thể rời trang này.",
	daTroi: "Đã 0:42",
	lauHon: null,
	dangGhi: null,
};

const BUOC = [
	{ nhan: "Hiểu yêu cầu", vat: null },
	{ nhan: "Viết hướng dẫn", vat: "instructions.md" },
];

export function lechLop(the: Element, mau: Element): string[] {
	const loi: string[] = [];
	const lop = (goc: Element, slot: string) =>
		goc.querySelector(`[data-slot="${slot}"]`)?.className ?? null;
	if (lop(the, "card-action") !== lop(mau, "card-action"))
		loi.push("CardAction lech lop mac dinh");
	if (lop(the, "card-footer") !== lop(mau, "card-footer"))
		loi.push("CardFooter lech lop mac dinh");
	return loi;
}

function mauKhongThamSo(lopAction?: string) {
	return ve(
		<Card>
			<CardHeader>
				<CardAction className={lopAction} />
			</CardHeader>
			<CardFooter />
		</Card>,
	);
}

describe("TheDangDung — CardAction, CardFooter giữ lớp mặc định", () => {
	test("lop-mac-dinh", () => {
		const the = ve(
			<TheDangDung
				buoc={BUOC}
				daXong={1}
				chu={CHU}
				nutDung={<button type="button">Dừng</button>}
			/>,
		);
		const mau = mauKhongThamSo();
		expect(the.querySelector('[data-slot="the-dang-dung"]')).not.toBeNull();
		expect(the.querySelector('[data-slot="card-action"]')).not.toBeNull();
		expect(the.querySelector('[data-slot="card-footer"]')).not.toBeNull();
		expect(lechLop(the, mau)).toEqual([]);

		const lech = mauKhongThamSo("gap-3");
		expect(lechLop(lech, mau)).toContain("CardAction lech lop mac dinh");
	});
});
