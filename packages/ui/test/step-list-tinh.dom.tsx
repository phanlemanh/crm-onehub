import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { StepList, StepListItem } from "../src/components/step-list";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

function dung(el: ReactElement): HTMLElement {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(el));
	return khung;
}

const BUOC = [
	"Nhờ quản trị viên cho phép",
	"Đăng nhập bằng Google",
	"Xin liên kết",
];

function danhSach(tinh: boolean): HTMLElement {
	return dung(
		<StepList activeStep={1} label="Lần đầu vào?" markCompleted tinh={tinh}>
			{BUOC.map((tieuDe, i) => (
				<StepListItem
					activeStep={1}
					description={`mô tả ${i + 1}`}
					key={tieuDe}
					step={i + 1}
					title={tieuDe}
				/>
			))}
		</StepList>,
	);
}

function trangThaiChiBao(o: HTMLElement): (string | null)[] {
	return [...o.querySelectorAll("[data-slot=stepper-indicator]")].map((e) =>
		e.getAttribute("data-state"),
	);
}

function tieuDeMo(o: HTMLElement): string[] {
	return [...o.querySelectorAll("[data-slot=stepper-item]")]
		.filter((muc) =>
			muc
				.querySelector("[data-slot=stepper-title]")
				?.className.includes("text-muted-foreground"),
		)
		.map((muc) => muc.textContent ?? "");
}

describe("StepList tinh", () => {
	test("khong buoc nao la buoc hien tai", () => {
		const o = danhSach(true);
		expect(o.querySelectorAll("[aria-current]")).toHaveLength(0);
	});

	test("moi chi bao cung mot trang thai va van hien so buoc", () => {
		const o = danhSach(true);
		expect(trangThaiChiBao(o)).toHaveLength(BUOC.length);
		expect(new Set(trangThaiChiBao(o)).size).toBe(1);
		const so = [...o.querySelectorAll("[data-slot=stepper-indicator]")].map(
			(e) => e.textContent?.trim(),
		);
		expect(so).toEqual(["1", "2", "3"]);
		expect(
			o.querySelectorAll("[data-slot=stepper-indicator] svg"),
		).toHaveLength(0);
	});

	test("khong tieu de nao bi lam mo", () => {
		const o = danhSach(true);
		expect(tieuDeMo(o)).toEqual([]);
	});

	test("van la mot danh sach co ten cho trinh doc man hinh", () => {
		const o = danhSach(true);
		expect(o.querySelector("[role=list]")?.getAttribute("aria-label")).toBe(
			"Lần đầu vào?",
		);
		expect(o.querySelectorAll("[role=listitem]")).toHaveLength(BUOC.length);
	});
});

describe("StepList tien do — doi chung, hanh vi cu giu nguyen", () => {
	test("buoc 1 la buoc hien tai, hai buoc sau mo", () => {
		const o = danhSach(false);
		expect(o.querySelectorAll("[aria-current=step]")).toHaveLength(1);
		expect(new Set(trangThaiChiBao(o))).toEqual(
			new Set(["active", "inactive"]),
		);
		expect(tieuDeMo(o)).toHaveLength(2);
	});
});
