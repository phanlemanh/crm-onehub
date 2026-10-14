import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DaiLuuTru, KhoaLuuTru } from "../src/components/dai-luu-tru";

let root: Root | null = null;

function don() {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
}

afterEach(don);

function ve(cay: ReactElement): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() => root?.render(cay));
	return o;
}

const TIEU_DE = "Đã lưu trữ ngày 15/09/2026";
const NHAN = "Khôi phục";

function nutKhoiPhuc(o: HTMLElement): HTMLButtonElement {
	const nut = [...o.querySelectorAll("button")].find(
		(b) => b.textContent === NHAN,
	);
	if (!nut) throw new Error("dlt: khong thay nut khoi phuc");
	return nut;
}

function bam(el: HTMLElement) {
	act(() => {
		for (const loai of ["pointerdown", "mousedown", "pointerup", "click"])
			el.dispatchEvent(
				new window.PointerEvent(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				}),
			);
	});
}

describe("dlt-dai", () => {
	test("dải nằm trong khung data-slot, có tiêu đề, bấm gọi đúng một lần", () => {
		let goi = 0;
		const o = ve(
			<DaiLuuTru
				tieuDe={TIEU_DE}
				nhanKhoiPhuc={NHAN}
				onKhoiPhuc={() => {
					goi++;
				}}
			/>,
		);
		const dai = o.querySelectorAll(
			'[data-slot="dai-luu-tru"] [data-dai-luu-tru]',
		);
		if (dai.length !== 1) throw new Error("dlt: dai khong mang data-slot");
		expect((dai[0]?.textContent ?? "").includes(TIEU_DE)).toBe(true);
		const nut = nutKhoiPhuc(o);
		expect(nut.matches(":disabled")).toBe(false);
		bam(nut);
		expect(goi).toBe(1);
	});

	test("đang khôi phục thì nút tắt, bấm không gọi", () => {
		let goi = 0;
		const o = ve(
			<DaiLuuTru
				tieuDe={TIEU_DE}
				nhanKhoiPhuc={NHAN}
				onKhoiPhuc={() => {
					goi++;
				}}
				dangKhoiPhuc
			/>,
		);
		const nut = nutKhoiPhuc(o);
		if (!nut.matches(":disabled"))
			throw new Error("dlt: dang khoi phuc van bam duoc");
		bam(nut);
		expect(goi).toBe(0);
	});
});

const SU_KIEN = ["pointerdown", "mousedown", "click", "keydown"] as const;
type SuKien = (typeof SU_KIEN)[number];
const CHO = ["combobox", "contenteditable"] as const;
type Cho = (typeof CHO)[number];
type Dem = Record<Cho, Record<SuKien, number>>;

function demMoi(): Dem {
	const mot = () => ({ pointerdown: 0, mousedown: 0, click: 0, keydown: 0 });
	return { combobox: mot(), contenteditable: mot() };
}

function boDem(dem: Dem, cho: Cho) {
	return {
		onPointerDown: () => {
			dem[cho].pointerdown++;
		},
		onMouseDown: () => {
			dem[cho].mousedown++;
		},
		onClick: () => {
			dem[cho].click++;
		},
		onKeyDown: () => {
			dem[cho].keydown++;
		},
	};
}

function veKhoa(khoa: boolean, dem: Dem): HTMLElement {
	return ve(
		<KhoaLuuTru khoa={khoa}>
			<input aria-label="o" />
			<button type="button">nut</button>
			<div
				role="combobox"
				aria-controls="ds"
				aria-expanded={false}
				tabIndex={0}
				data-cho="combobox"
				{...boDem(dem, "combobox")}
			>
				chon
			</div>
			<div
				contentEditable
				suppressContentEditableWarning
				data-cho="contenteditable"
				{...boDem(dem, "contenteditable")}
			>
				sua
			</div>
		</KhoaLuuTru>,
	);
}

function ban(o: HTMLElement, cho: Cho, su: SuKien) {
	const el = o.querySelector(`[data-cho="${cho}"]`);
	if (!(el instanceof HTMLElement)) throw new Error(`dlt: thieu cho ${cho}`);
	act(() => {
		const tuy = { bubbles: true, cancelable: true };
		if (su === "keydown")
			el.dispatchEvent(
				new window.KeyboardEvent("keydown", { ...tuy, key: "Enter" }),
			);
		else if (su === "pointerdown")
			el.dispatchEvent(
				new window.PointerEvent("pointerdown", {
					...tuy,
					pointerType: "mouse",
				}),
			);
		else el.dispatchEvent(new window.MouseEvent(su, { ...tuy, button: 0 }));
	});
}

const THONG_DIEP = {
	pointerdown: "dlt: khoa de lot pointerdown",
	mousedown: "dlt: khoa de lot mousedown",
	click: "dlt: khoa de lot click",
	keydown: "dlt: khoa de lot phim",
} satisfies Record<SuKien, string>;

describe("dlt-khoa", () => {
	test("ma trận 2 chỗ × 4 sự kiện × 2 trạng thái", () => {
		const o: string[] = [];
		for (const khoa of [true, false]) {
			for (const cho of CHO) {
				for (const su of SU_KIEN) {
					const dem = demMoi();
					ban(veKhoa(khoa, dem), cho, su);
					const mong = khoa ? 0 : 1;
					if (dem[cho][su] !== mong)
						throw new Error(
							khoa ? THONG_DIEP[su] : `dlt: mo khoa van chan ${su}`,
						);
					o.push(`${khoa}-${cho}-${su}`);
					don();
				}
			}
		}
		expect(o.length).toBe(16);
	});

	test("khoá bật thì ô nhập và nút tắt, khoá tắt thì không", () => {
		const bat = veKhoa(true, demMoi());
		if (!bat.querySelector("input")?.matches(":disabled"))
			throw new Error("dlt: o nhap khong tat khi khoa");
		expect(bat.querySelector("button")?.matches(":disabled")).toBe(true);
		expect(bat.querySelector("[data-khoa-luu-tru]")).not.toBeNull();
		don();
		const tat = veKhoa(false, demMoi());
		expect(tat.querySelector("input")?.matches(":disabled")).toBe(false);
		expect(tat.querySelector("button")?.matches(":disabled")).toBe(false);
		expect(tat.querySelector("[data-khoa-luu-tru]")).toBeNull();
	});
});
