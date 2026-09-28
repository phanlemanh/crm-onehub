import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Dialog, DialogContent, DialogTitle } from "../src/components/dialog";
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

function nutTheo(goc: ParentNode, chu: string): HTMLElement | undefined {
	return [...goc.querySelectorAll('button[data-slot="button"]')].find(
		(b) => b.textContent === chu,
	) as HTMLElement | undefined;
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
			than?.querySelector(
				"del, ins, input, textarea, [data-slot=suggestion-decided]",
			),
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
	test("câu cũ gạch (diff-bo), câu mới (diff-them), cả hai đều không dịch", () => {
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
		expect(cu?.parentElement?.tagName).toBe("P");
		expect(cu?.parentElement?.getAttribute("translate")).toBe("no");
		expect(moi?.textContent).toBe("Tăng 20%");
		expect(moi?.className).toContain("decoration-diff-them");
		expect(moi?.className).toContain("bg-diff-them/15");
		expect(moi?.parentElement?.tagName).toBe("P");
		expect(moi?.parentElement?.getAttribute("translate")).toBe("no");
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

	test("có onEdit: ba nút chữ Nhận / Sửa / Bác — đúng động từ CONTEXT.md", () => {
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
		expect(nut).toEqual(["Nhận", "Sửa", "Bác"]);
	});

	test("không có onEdit: chỉ hai nút Nhận / Bác, không có nút Sửa", () => {
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
		expect(nut).toEqual(["Nhận", "Bác"]);
	});

	test("bấm Sửa: ô sửa là Textarea, câu cũ vẫn hiện, câu mới (ins) biến mất, không dịch", () => {
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				onAccept={() => {}}
				onDismiss={() => {}}
				onEdit={() => {}}
			/>,
		);
		expect(goc.querySelector("textarea")).toBeNull();
		click(nutTheo(goc, "Sửa"));
		const o = goc.querySelector("textarea");
		expect(o).not.toBeNull();
		expect(o?.tagName).toBe("TEXTAREA");
		expect((o as HTMLTextAreaElement).value).toBe("b");
		expect(o?.getAttribute("translate")).toBe("no");
		expect(o?.getAttribute("data-slot")).toBe("suggestion-edit");
		expect(goc.querySelector("del")).not.toBeNull();
		expect(goc.querySelector("ins")).toBeNull();
	});

	test("đang sửa: hàng nút đổi thành Nhận bản đã sửa / Huỷ, không còn Nhận câu gốc hay Bác", () => {
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				onAccept={() => {}}
				onDismiss={() => {}}
				onEdit={() => {}}
			/>,
		);
		click(nutTheo(goc, "Sửa"));
		const nut = [...goc.querySelectorAll('button[data-slot="button"]')].map(
			(b) => b.textContent,
		);
		expect(nut).toEqual(["Nhận bản đã sửa", "Huỷ"]);
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
		click(nutTheo(goc, "Sửa"));
		const o = goc.querySelector("textarea");
		expect(o).not.toBeNull();
		expect(document.activeElement).toBe(o);
	});

	test("Nhận bản đã sửa gọi onAcceptEdited với giá trị đang gõ, kể cả khi chưa đổi chữ nào", () => {
		let nhanDuoc: string | null = null;
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				onAccept={() => {}}
				onDismiss={() => {}}
				onEdit={() => {}}
				onAcceptEdited={(chu) => {
					nhanDuoc = chu;
				}}
			/>,
		);
		click(nutTheo(goc, "Sửa"));
		click(nutTheo(goc, "Nhận bản đã sửa"));
		expect(nhanDuoc).toBe("b");
	});

	test("gõ trong ô sửa rồi Nhận bản đã sửa: nhận đúng chữ vừa gõ, onEdit vẫn được gọi (tương thích)", () => {
		let daGoiOnEdit: string | null = null;
		let nhanDuoc: string | null = null;
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				onAccept={() => {}}
				onDismiss={() => {}}
				onEdit={(chu) => {
					daGoiOnEdit = chu;
				}}
				onAcceptEdited={(chu) => {
					nhanDuoc = chu;
				}}
			/>,
		);
		click(nutTheo(goc, "Sửa"));
		const o = goc.querySelector("textarea") as HTMLTextAreaElement;
		const dat = Object.getOwnPropertyDescriptor(
			window.HTMLTextAreaElement.prototype,
			"value",
		)?.set;
		act(() => {
			dat?.call(o, "b sửa lại");
			o.dispatchEvent(new Event("input", { bubbles: true }));
		});
		expect(daGoiOnEdit).toBe("b sửa lại");
		click(nutTheo(goc, "Nhận bản đã sửa"));
		expect(nhanDuoc).toBe("b sửa lại");
	});

	test("Huỷ: đóng ô sửa, trả giá trị về câu mới gốc", () => {
		const goc = ve(
			<Suggestion
				before="a"
				value="b"
				onAccept={() => {}}
				onDismiss={() => {}}
				onEdit={() => {}}
			/>,
		);
		click(nutTheo(goc, "Sửa"));
		const o = goc.querySelector("textarea") as HTMLTextAreaElement;
		const dat = Object.getOwnPropertyDescriptor(
			window.HTMLTextAreaElement.prototype,
			"value",
		)?.set;
		act(() => {
			dat?.call(o, "b sửa lại");
			o.dispatchEvent(new Event("input", { bubbles: true }));
		});
		click(nutTheo(goc, "Huỷ"));
		expect(goc.querySelector("textarea")).toBeNull();
		expect(goc.querySelector("ins")?.textContent).toBe("b");
		click(nutTheo(goc, "Sửa"));
		expect((goc.querySelector("textarea") as HTMLTextAreaElement).value).toBe(
			"b",
		);
	});

	test("Esc trong ô sửa: đóng ô sửa (huỷ), không gọi onDismiss, không lọt ra ngoài khi đứng ngoài Dialog", () => {
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
			click(nutTheo(goc, "Sửa"));
			const o = goc.querySelector("textarea") as HTMLTextAreaElement;
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
			expect(goc.querySelector("textarea")).toBeNull();
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
		expect(goc.querySelector("textarea")).not.toBeNull();
	});

	test("decided=accepted: ẩn nút, hiện trạng thái đã quyết", () => {
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
		const nutNhan = nutTheo(goc, "Nhận") as HTMLButtonElement;
		expect(nutNhan.disabled).toBe(true);
		const idMoTa = nutNhan.getAttribute("aria-describedby");
		expect(idMoTa).toBeTruthy();
		const moTa = goc.querySelector(`#${idMoTa}`);
		expect(moTa?.textContent).toBe("Cần xác nhận thêm trước khi nhận");
	});

	test("bấm Nhận và Bác gọi đúng callback", () => {
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
		click(nutTheo(goc, "Nhận"));
		click(nutTheo(goc, "Bác"));
		expect(nhan).toBe(1);
		expect(boQua).toBe(1);
	});
});

function dialogNoiDung(): HTMLElement | null {
	return document.querySelector('[data-slot="dialog-content"]');
}

function HopMoDong({ children }: { children: ReactNode }) {
	const [mo, datMo] = useState(true);
	return (
		<Dialog open={mo} onOpenChange={datMo}>
			<DialogContent>
				<DialogTitle>Sửa Mục tiêu</DialogTitle>
				{children}
			</DialogContent>
		</Dialog>
	);
}

describe("Suggestion trong Dialog thật — I1 (Esc không lọt ra ngoài)", () => {
	test("Esc trong ô sửa: ô sửa đóng, Dialog vẫn mở", () => {
		ve(
			<HopMoDong>
				<Suggestion
					before="a"
					value="b"
					onAccept={() => {}}
					onDismiss={() => {}}
					onEdit={() => {}}
				/>
			</HopMoDong>,
		);
		const noiDung = dialogNoiDung();
		expect(noiDung).not.toBeNull();
		click(nutTheo(noiDung as HTMLElement, "Sửa"));
		const o = document.querySelector(
			'[data-slot="suggestion-edit"]',
		) as HTMLTextAreaElement;
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
		expect(document.querySelector('[data-slot="suggestion-edit"]')).toBeNull();
		expect(dialogNoiDung()).not.toBeNull();
	});

	test("đối chứng: Esc ngoài ô sửa vẫn đóng Dialog", () => {
		ve(
			<HopMoDong>
				<Suggestion
					before="a"
					value="b"
					onAccept={() => {}}
					onDismiss={() => {}}
					onEdit={() => {}}
				/>
			</HopMoDong>,
		);
		const tieuDe = document.querySelector('[data-slot="dialog-title"]');
		expect(tieuDe).not.toBeNull();
		act(() => {
			(tieuDe as HTMLElement).dispatchEvent(
				new KeyboardEvent("keydown", {
					key: "Escape",
					bubbles: true,
					cancelable: true,
				}),
			);
		});
		expect(dialogNoiDung()).toBeNull();
	});
});
