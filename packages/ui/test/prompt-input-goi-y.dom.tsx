import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	PromptInput,
	PromptInputBody,
	PromptInputFooter,
	PromptInputProvider,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
} from "../src/components/ai-elements/prompt-input";
import {
	Suggestion,
	Suggestions,
} from "../src/components/ai-elements/suggestion";
import { LocaleProvider } from "../src/components/locale-provider";

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function ve(cay: ReactElement, locale: "vi" | "en" = "vi"): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() =>
		root?.render(<LocaleProvider locale={locale}>{cay}</LocaleProvider>),
	);
	return o;
}

function oSoan(
	onSubmit: (m: { text: string }) => void,
	status: "ready" | "streaming" = "ready",
	khoa = false,
) {
	return (
		<PromptInput onSubmit={onSubmit}>
			<PromptInputBody>
				<PromptInputTextarea disabled={khoa} />
			</PromptInputBody>
			<PromptInputFooter>
				<PromptInputTools />
				<PromptInputSubmit status={status} disabled={khoa} />
			</PromptInputFooter>
		</PromptInput>
	);
}

describe("Suggestion", () => {
	test("bấm một gợi ý gọi onClick với đúng chuỗi gợi ý; nhãn là chính chuỗi đó", () => {
		const nhan: string[] = [];
		const goc = ve(
			<Suggestions>
				{["Bán hàng", "Vận hành"].map((g) => (
					<Suggestion key={g} suggestion={g} onClick={(s) => nhan.push(s)} />
				))}
			</Suggestions>,
		);
		const nut = [...goc.querySelectorAll<HTMLButtonElement>("button")];
		expect(nut.map((n) => n.textContent)).toEqual(["Bán hàng", "Vận hành"]);
		act(() => nut[1]?.click());
		expect(nhan).toEqual(["Vận hành"]);
		expect(nut[0]?.getAttribute("data-variant")).toBe("outline");
		expect(nut[0]?.getAttribute("type")).toBe("button");
	});
});

describe("PromptInput", () => {
	test("chữ mặc định đi qua bảng chuỗi: tiếng Việt và tiếng Anh", () => {
		const vi = ve(oSoan(() => {}));
		expect(vi.querySelector("textarea")?.getAttribute("placeholder")).toBe(
			"Bạn muốn biết gì?",
		);
		expect(
			vi.querySelector('button[type="submit"]')?.getAttribute("aria-label"),
		).toBe("Gửi");
		act(() => root?.unmount());
		const en = ve(
			oSoan(() => {}),
			"en",
		);
		expect(en.querySelector("textarea")?.getAttribute("placeholder")).toBe(
			"What would you like to know?",
		);
		expect(
			en.querySelector('button[type="submit"]')?.getAttribute("aria-label"),
		).toBe("Send");
	});

	test("đang trả lời: nút mang nhãn Dừng; khoá: textarea và nút bị vô hiệu", () => {
		const dang = ve(oSoan(() => {}, "streaming"));
		expect(dang.querySelector("button")?.getAttribute("aria-label")).toBe(
			"Dừng",
		);
		act(() => root?.unmount());
		const khoa = ve(oSoan(() => {}, "ready", true));
		expect(khoa.querySelector("textarea")?.disabled).toBe(true);
		expect(
			khoa.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled,
		).toBe(true);
	});

	test("gửi form: onSubmit nhận chữ đang có trong ô soạn", async () => {
		const nhan: string[] = [];
		const goc = ve(
			<PromptInputProvider initialInput="Đặt OKR quý mới">
				{oSoan((m) => nhan.push(m.text))}
			</PromptInputProvider>,
		);
		const form = goc.querySelector("form");
		if (!form) throw new Error("khong thay o soan");
		expect(goc.querySelector("textarea")?.value).toBe("Đặt OKR quý mới");
		await act(async () => {
			form.dispatchEvent(
				new Event("submit", { bubbles: true, cancelable: true }),
			);
		});
		expect(nhan).toEqual(["Đặt OKR quý mới"]);
		expect(goc.querySelector("textarea")?.value).toBe("");
	});
});
