import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LocaleProvider } from "../src/components/locale-provider";
import { Suggestion } from "../src/components/suggestion";

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
});

function ve(cay: ReactElement): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	khung = o;
	root = createRoot(o);
	act(() => root?.render(<LocaleProvider locale="vi">{cay}</LocaleProvider>));
	return o;
}

function click(el: Element | null | undefined) {
	if (!el) throw new Error("không thấy phần tử để bấm");
	act(() => (el as HTMLElement).click());
}

describe("Suggestion — dáng cũ giữ nguyên (facts.tsx)", () => {
	test("chỉ 5 prop cũ: đúng cấu trúc icon-button, không có gì mới", () => {
		const goc = ve(
			<Suggestion
				value="Đã xác minh email"
				rationale="Theo hồ sơ nguồn A"
				pending={false}
				onAccept={() => {}}
				onDismiss={() => {}}
			/>,
		);
		const than = goc.querySelector('[data-slot="suggestion"]');
		expect(than).not.toBeNull();
		expect(than?.getAttribute("data-decided")).toBeNull();
		expect(than?.querySelectorAll(":scope > div").length).toBe(2);
		expect(
			than?.querySelector("p.truncate span.text-foreground")?.textContent,
		).toBe("Đã xác minh email");
		const nut = than?.querySelectorAll('button[data-slot="button"]') ?? [];
		expect(nut.length).toBe(2);
		expect(nut[0]?.getAttribute("aria-label")).toBe("Chấp nhận gợi ý");
		expect(nut[1]?.getAttribute("aria-label")).toBe("Từ chối gợi ý");
		expect(nut[0]?.textContent?.trim()).toBe("");
		expect(nut[1]?.textContent?.trim()).toBe("");
		expect(nut[0]?.querySelector("svg")).not.toBeNull();
		expect(
			than?.querySelector("del, ins, input, [data-slot=suggestion-decided]"),
		).toBeNull();
		expect(than?.querySelector("label")).toBeNull();
	});

	test("pending=true: spinner thay hai nút, không có gì khác đổi", () => {
		const goc = ve(
			<Suggestion
				value="x"
				pending={true}
				onAccept={() => {}}
				onDismiss={() => {}}
			/>,
		);
		const than = goc.querySelector('[data-slot="suggestion"]');
		expect(than?.querySelectorAll("button").length).toBe(0);
		expect(than?.querySelector('[data-slot="spinner"]')).not.toBeNull();
	});

	test("không có rationale thì không render đoạn lý do", () => {
		const goc = ve(
			<Suggestion value="x" onAccept={() => {}} onDismiss={() => {}} />,
		);
		const than = goc.querySelector('[data-slot="suggestion"]');
		expect(than?.querySelectorAll("p").length).toBe(1);
	});
});

describe("Suggestion — dáng mới (Trợ lý OKR)", () => {
	test("câu cũ gạch (diff-bo), câu mới (diff-them), có mũi tên nối", () => {
		const goc = ve(
			<Suggestion
				before="Tăng 10%"
				value="Tăng 20%"
				onAccept={() => {}}
				onDismiss={() => {}}
			/>,
		);
		const than = goc.querySelector('[data-slot="suggestion"]');
		const cu = than?.querySelector("del");
		const moi = than?.querySelector("ins");
		expect(cu?.textContent).toBe("Tăng 10%");
		expect(cu?.className).toContain("line-through");
		expect(cu?.className).toContain("decoration-diff-bo");
		expect(moi?.textContent).toBe("Tăng 20%");
		expect(moi?.className).toContain("decoration-diff-them");
		expect(moi?.className).toContain("bg-diff-them/15");
		expect(than?.textContent).toContain("→");
	});

	test("đoạn câu cũ/câu mới không bị trình duyệt tự dịch", () => {
		const goc = ve(
			<Suggestion
				before="Tăng 10%"
				value="Tăng 20%"
				onAccept={() => {}}
				onDismiss={() => {}}
			/>,
		);
		const doan = goc.querySelector("del")?.parentElement;
		expect(doan?.tagName).toBe("P");
		expect(doan?.getAttribute("translate")).toBe("no");
	});

	test("label hiển thị phía trên dòng đề xuất", () => {
		const goc = ve(
			<Suggestion
				label="Mục tiêu 1"
				before="a"
				value="b"
				onAccept={() => {}}
				onDismiss={() => {}}
			/>,
		);
		expect(goc.querySelector('[data-slot="suggestion"] > p')?.textContent).toBe(
			"Mục tiêu 1",
		);
	});

	test("có onEdit: ba nút chữ Chấp nhận / Sửa / Từ chối", () => {
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				onAccept={() => {}}
				onDismiss={() => {}}
				onEdit={() => {}}
			/>,
		);
		const nut = [...goc.querySelectorAll('button[data-slot="button"]')].map(
			(b) => b.textContent,
		);
		expect(nut).toEqual(["Chấp nhận gợi ý", "Sửa", "Từ chối gợi ý"]);
	});

	test("không có onEdit: chỉ hai nút, không có nút Sửa", () => {
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				onAccept={() => {}}
				onDismiss={() => {}}
			/>,
		);
		const nut = [...goc.querySelectorAll('button[data-slot="button"]')].map(
			(b) => b.textContent,
		);
		expect(nut).toEqual(["Chấp nhận gợi ý", "Từ chối gợi ý"]);
	});

	test("bấm Sửa: mở ô sửa thay cho câu cũ/câu mới", () => {
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				onAccept={() => {}}
				onDismiss={() => {}}
				onEdit={() => {}}
			/>,
		);
		expect(goc.querySelector("input")).toBeNull();
		const nutSua = [...goc.querySelectorAll('button[data-slot="button"]')].find(
			(b) => b.textContent === "Sửa",
		);
		click(nutSua);
		const o = goc.querySelector("input");
		expect(o).not.toBeNull();
		expect((o as HTMLInputElement).value).toBe("b");
		expect(goc.querySelector("del, ins")).toBeNull();
	});

	test("bấm Sửa: con trỏ vào ngay ô sửa (focus)", () => {
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				onAccept={() => {}}
				onDismiss={() => {}}
				onEdit={() => {}}
			/>,
		);
		const nutSua = [...goc.querySelectorAll('button[data-slot="button"]')].find(
			(b) => b.textContent === "Sửa",
		);
		click(nutSua);
		const o = goc.querySelector("input");
		expect(o).not.toBeNull();
		expect(document.activeElement).toBe(o);
	});

	test("Esc trong ô sửa: đóng ô sửa, không gọi onDismiss, không lọt ra Dialog cha", () => {
		let boQua = 0;
		let lotRaCha = 0;
		const nghePhimCha = () => {
			lotRaCha += 1;
		};
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				onAccept={() => {}}
				onDismiss={() => {
					boQua += 1;
				}}
				onEdit={() => {}}
			/>,
		);
		document.addEventListener("keydown", nghePhimCha);
		try {
			const nutSua = [
				...goc.querySelectorAll('button[data-slot="button"]'),
			].find((b) => b.textContent === "Sửa");
			click(nutSua);
			const o = goc.querySelector("input") as HTMLInputElement;
			expect(o).not.toBeNull();
			act(() => {
				o.dispatchEvent(
					new KeyboardEvent("keydown", {
						key: "Escape",
						bubbles: true,
						cancelable: true,
					}),
				);
			});
			expect(goc.querySelector("input")).toBeNull();
			expect(boQua).toBe(0);
			expect(lotRaCha).toBe(0);
		} finally {
			document.removeEventListener("keydown", nghePhimCha);
		}
	});

	test("editing=true truyền sẵn: ô sửa mở ngay không cần bấm", () => {
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				editing={true}
				onAccept={() => {}}
				onDismiss={() => {}}
				onEdit={() => {}}
			/>,
		);
		expect(goc.querySelector("input")).not.toBeNull();
	});

	test("gõ trong ô sửa gọi onEdit với chữ mới", () => {
		let daGoi: string | null = null;
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				editing={true}
				onAccept={() => {}}
				onDismiss={() => {}}
				onEdit={(chu) => {
					daGoi = chu;
				}}
			/>,
		);
		const o = goc.querySelector("input") as HTMLInputElement;
		const dat = Object.getOwnPropertyDescriptor(
			window.HTMLInputElement.prototype,
			"value",
		)?.set;
		act(() => {
			dat?.call(o, "b sửa lại");
			o.dispatchEvent(new Event("input", { bubbles: true }));
		});
		expect(daGoi).toBe("b sửa lại");
	});

	test("decided=accepted: ẩn ba nút, hiện trạng thái đã quyết", () => {
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				decided="accepted"
				onAccept={() => {}}
				onDismiss={() => {}}
			/>,
		);
		const than = goc.querySelector('[data-slot="suggestion"]');
		expect(than?.getAttribute("data-decided")).toBe("accepted");
		expect(than?.querySelectorAll("button").length).toBe(0);
		expect(
			than?.querySelector('[data-slot="suggestion-decided"]')?.textContent,
		).toBe("Đã nhận");
	});

	test("decided=dismissed: nhãn tiếng Việt riêng", () => {
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				decided="dismissed"
				onAccept={() => {}}
				onDismiss={() => {}}
			/>,
		);
		expect(
			goc.querySelector('[data-slot="suggestion-decided"]')?.textContent,
		).toBe("Đã bác");
	});

	test("error hiện dưới dòng với role alert", () => {
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				error="Không lưu được đề xuất này"
				onAccept={() => {}}
				onDismiss={() => {}}
			/>,
		);
		const loi = goc.querySelector('[role="alert"]');
		expect(loi?.textContent).toBe("Không lưu được đề xuất này");
		expect(loi?.className).toContain("text-destructive");
	});

	test("acceptDisabledReason: khoá nút Nhận, hiện lý do, nối bằng aria-describedby", () => {
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				acceptDisabledReason="Cần xác nhận thêm trước khi nhận"
				onAccept={() => {}}
				onDismiss={() => {}}
			/>,
		);
		const nutNhan = [
			...goc.querySelectorAll('button[data-slot="button"]'),
		].find((b) => b.textContent === "Chấp nhận gợi ý") as HTMLButtonElement;
		expect(nutNhan.disabled).toBe(true);
		const idMoTa = nutNhan.getAttribute("aria-describedby");
		expect(idMoTa).toBeTruthy();
		const moTa = goc.querySelector(`#${idMoTa}`);
		expect(moTa?.textContent).toBe("Cần xác nhận thêm trước khi nhận");
	});

	test("bấm Chấp nhận và Từ chối gọi đúng callback", () => {
		let nhan = 0;
		let boQua = 0;
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				onAccept={() => {
					nhan += 1;
				}}
				onDismiss={() => {
					boQua += 1;
				}}
			/>,
		);
		click(
			[...goc.querySelectorAll('button[data-slot="button"]')].find(
				(b) => b.textContent === "Chấp nhận gợi ý",
			),
		);
		click(
			[...goc.querySelectorAll('button[data-slot="button"]')].find(
				(b) => b.textContent === "Từ chối gợi ý",
			),
		);
		expect(nhan).toBe(1);
		expect(boQua).toBe(1);
	});
});
