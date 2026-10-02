import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type DongHien,
	type NutThe,
	propsThe,
} from "../../../apps/app/app/(app)/[slug]/okr/the-gop-y-props";
import { okrGopYMessages } from "../../../apps/app/lib/messages/okr-gop-y";
import { LocaleProvider } from "../src/components/locale-provider";
import {
	ProposedChange,
	type ProposedChangeAction,
} from "../src/components/proposed-change";

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function ve(cay: ReactElement): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() => root?.render(<LocaleProvider locale="vi">{cay}</LocaleProvider>));
	return o;
}

const m = okrGopYMessages("vi");

const DONG_VIET_LAI: DongHien = {
	id: "dx-1",
	loai: "viet-lai",
	objectiveId: "mt-1",
	keyResultId: null,
	truong: "title",
	truoc: "Tăng doanh thu",
	sau: "Khách hàng doanh nghiệp chọn OneHub làm nền tảng chính",
	maVanDe: null,
	targetObjectiveId: null,
	targetKeyResultId: null,
	lyDo: "Tên cũ là con số, không nói vì sao khách chọn mình.",
	tenDich: null,
};

function hanhDong(nut: NutThe[]): ProposedChangeAction[] {
	return nut.map((n) => ({ ...n, onClick: () => {} }));
}

function dungThe(nut: NutThe[]): HTMLElement {
	const p = propsThe(DONG_VIET_LAI, { m });
	const goc = ve(<ProposedChange {...p.the} actions={hanhDong(nut)} />);
	const the = goc.querySelector<HTMLElement>('[data-slot="proposed-change"]');
	if (!the) throw new Error("khong thay the");
	return the;
}

function kiemNutChinh(the: HTMLElement): HTMLButtonElement {
	const chinh = [
		...the.querySelectorAll<HTMLButtonElement>(
			'button[data-variant="default"]',
		),
	];
	if (chinh.length !== 1) throw new Error(`nut chinh: ${chinh.length} != 1`);
	const [nut] = chinh;
	if (!nut) throw new Error("nut chinh: 0 != 1");
	return nut;
}

function thuTuKhoi(the: HTMLElement): string[] {
	const khoi = [
		...the.querySelectorAll(
			'[data-slot="proposed-change-label"], del, ins, [data-slot="proposed-change-body"] > p:last-child, [data-slot="proposed-change-actions"]',
		),
	];
	return khoi.map((k) => {
		if (k.matches('[data-slot="proposed-change-label"]')) return "nhan";
		if (k.tagName === "DEL") return "cu";
		if (k.tagName === "INS") return "moi";
		if (k.matches('[data-slot="proposed-change-actions"]')) return "nut";
		return "ly-do";
	});
}

describe("ProposedChange — thẻ viết lại ba tầng", () => {
	test("ba-tang: thứ tự khối, hàng nút ở chân, một nút chính", () => {
		const p = propsThe(DONG_VIET_LAI, { m });
		const the = dungThe(p.nut);

		expect(thuTuKhoi(the)).toEqual(["nhan", "cu", "moi", "ly-do", "nut"]);

		const than = the.querySelector('[data-slot="proposed-change-body"]');
		const hang = the.querySelector('[data-slot="proposed-change-actions"]');
		expect(than?.parentElement).toBe(hang?.parentElement ?? null);
		expect(than?.contains(hang ?? null)).toBe(false);
		expect(
			than?.compareDocumentPosition(hang as Node) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();

		const chinh = kiemNutChinh(the);
		expect(chinh.textContent).toBe("Nhận");

		const nut = [...(hang?.querySelectorAll("button") ?? [])];
		const sua = nut.find((b) => b.textContent === "Sửa");
		expect(sua?.getAttribute("data-variant")).toBe("outline");
		const cuoi = nut.at(-1);
		expect(cuoi?.textContent).toBe("Bác");
		expect(cuoi?.getAttribute("data-variant")).toBe("ghost");
		expect(the.getAttribute("role")).toBe("group");
	});

	test("ba-tang: thước bắt thẻ có hai nút chính (chiều đỏ trên cùng dữ liệu)", () => {
		const p = propsThe(DONG_VIET_LAI, { m });
		const hong = p.nut.map((n) =>
			n.id === "sua" ? { ...n, tone: "primary" as const } : n,
		);
		const the = dungThe(hong);
		expect(() => kiemNutChinh(the)).toThrow("nut chinh: 2 != 1");
	});

	test("ba-tang: câu mới dài không dấu cách được bẻ, câu cũ và câu mới không dịch", () => {
		const dai = `https://onehub.vn/${"a".repeat(300)}`;
		const p = propsThe({ ...DONG_VIET_LAI, sau: dai }, { m });
		const goc = ve(<ProposedChange {...p.the} actions={hanhDong(p.nut)} />);
		const giaTri = goc.querySelector('[data-slot="proposed-change-value"]');
		expect(giaTri?.className).toContain("wrap-anywhere");
		expect(giaTri?.getAttribute("translate")).toBe("no");
		expect(
			goc
				.querySelector("del")
				?.closest("[translate]")
				?.getAttribute("translate"),
		).toBe("no");
	});
});

describe("ProposedChange — biến thể lồng (fields · tag)", () => {
	test("fields: khối đặt trong thân thẻ, sau lý do, trước hàng nút; ẩn khi đã quyết", () => {
		const p = propsThe(DONG_VIET_LAI, { m });
		const goc = ve(
			<ProposedChange
				{...p.the}
				actions={hanhDong(p.nut)}
				tag="vừa sửa"
				fields={<input aria-label="Đích" data-o="dich" />}
			/>,
		);
		const the = goc.querySelector('[data-slot="proposed-change"]');
		const than = the?.querySelector('[data-slot="proposed-change-body"]');
		const o = than?.querySelector(
			'[data-slot="proposed-change-fields"] [data-o="dich"]',
		);
		expect(o).not.toBeNull();
		const thuTu = [...(than?.children ?? [])].map((k) =>
			k.getAttribute("data-slot"),
		);
		expect(thuTu.at(-1)).toBe("proposed-change-fields");
		expect(
			the?.querySelector('[data-slot="proposed-change-tag"]')?.textContent,
		).toBe("vừa sửa");
		const nhan = the?.querySelector('[data-slot="proposed-change-label"]');
		const tag = the?.querySelector('[data-slot="proposed-change-tag"]');
		expect(tag && nhan?.contains(tag)).toBe(true);
	});
	test("fields: không render khi decided", () => {
		const p = propsThe(DONG_VIET_LAI, { m, ket: "accepted" });
		const goc = ve(
			<ProposedChange
				{...p.the}
				actions={[]}
				fields={<input data-o="dich" />}
			/>,
		);
		expect(
			goc.querySelector('[data-slot="proposed-change-fields"]'),
		).toBeNull();
	});
});
