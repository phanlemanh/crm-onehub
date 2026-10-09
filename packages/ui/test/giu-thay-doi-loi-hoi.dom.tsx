import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement, useLayoutEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { type LoiHoi, useKhaiThayDoi } from "../src/components/giu-thay-doi";
import { LocaleProvider } from "../src/components/locale-provider";
import { messages } from "../src/lib/messages";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTitle,
} from "../src/components/sheet";

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	document.body.removeAttribute("style");
});

function dung(el: ReactElement) {
	const khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(<LocaleProvider locale="vi">{el}</LocaleProvider>));
}

const RIENG: LoiHoi = {
	tieuDe: "Kara đang soạn. Đóng khung?",
	than: "Lượt này vẫn chạy khi bạn đóng.",
	nut: "Đóng",
	thoi: "Ở lại",
};

function Khai({ bat, loiHoi }: { bat: boolean; loiHoi?: LoiHoi }) {
	const khai = useKhaiThayDoi(loiHoi);
	useLayoutEffect(() => khai(bat), [khai, bat]);
	return null;
}

function Khung({ bat, loiHoi }: { bat: boolean; loiHoi?: LoiHoi }) {
	return (
		<Sheet open tuNhanThayDoi={false}>
			<SheetContent showCloseButton={false}>
				<SheetTitle>Soạn OKR</SheetTitle>
				<Khai bat={bat} loiHoi={loiHoi} />
				<SheetClose>dong</SheetClose>
			</SheetContent>
		</Sheet>
	);
}

function bamDong() {
	const nut = [...document.querySelectorAll("button")].find(
		(b) => b.textContent === "dong",
	);
	if (!nut) throw new Error("khong thay nut dong");
	act(() => nut.click());
}

describe("sk-loi-hoi", () => {
	test("khai có câu riêng thì hộp hỏi nói câu riêng", () => {
		dung(<Khung bat loiHoi={RIENG} />);
		bamDong();
		const hop = document.querySelector("[role=alertdialog]");
		expect(hop?.textContent ?? "", "hop hoi khong theo khai").toContain(
			RIENG.tieuDe,
		);
		expect(hop?.textContent ?? "").toContain(RIENG.thoi);
	});

	test("khai không câu riêng thì hộp hỏi giữ câu chung", () => {
		dung(<Khung bat />);
		bamDong();
		const hop = document.querySelector("[role=alertdialog]");
		expect(hop?.textContent ?? "").toContain(
			messages("vi").dialog.boThayDoi.tieuDe,
		);
	});

	test("không khai thì đóng ngay, không hộp", () => {
		dung(<Khung bat={false} loiHoi={RIENG} />);
		bamDong();
		expect(document.querySelector("[role=alertdialog]")).toBeNull();
	});
});
