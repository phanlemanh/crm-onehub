import { tuanTuHoa } from "@crm/validation/tai-lieu-markdown";
import type { Editor } from "@tiptap/react";
import { act, createElement as h, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TrinhSoan } from "../src/components/trinh-soan";

export const NHAN_NUT = {
	tieuDe2: "Tiêu đề 2",
	tieuDe3: "Tiêu đề 3",
	dam: "Đậm",
	nghieng: "Nghiêng",
	danhSachSo: "Danh sách số",
	danhSachCham: "Danh sách chấm",
	bang: "Bảng",
	lienKet: "Liên kết",
	hoanTac: "Hoàn tác",
	lamLai: "Làm lại",
};

export const NHAN_O = "Nội dung trang";
export const GOI_Y = "Viết nội dung trang, hoặc dán từ Word.";

type ORieng = HTMLElement & { editor?: Editor };

const khoangRong = () => ({
	x: 0,
	y: 0,
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	width: 0,
	height: 0,
	toJSON: () => ({}),
});

const danhSachRong = () => {
	const ds = [khoangRong()];
	return Object.assign(ds, { item: (i: number) => ds[i] ?? null });
};

Object.defineProperty(window.Range.prototype, "getClientRects", {
	value: danhSachRong,
	configurable: true,
});
Object.defineProperty(window.Range.prototype, "getBoundingClientRect", {
	value: khoangRong,
	configurable: true,
});
Object.defineProperty(document, "elementFromPoint", {
	value: () => null,
	configurable: true,
});

export type Dung = {
	khung: HTMLElement;
	phat: string[];
	o: () => ORieng;
	editor: () => Editor;
	thanh: () => HTMLElement;
	nut: (k: keyof typeof NHAN_NUT) => HTMLElement;
	md: () => string;
	go: (chu: string) => void;
	chon: (tu: number, den: number) => void;
	bam: (el: HTMLElement) => void;
	dan: (html: string, chu?: string) => void;
	goBo: () => void;
};

let dangMo: { root: Root; khung: HTMLElement }[] = [];

function Vo({ dau, phat }: { dau: string; phat: string[] }) {
	const [giaTri, setGiaTri] = useState(dau);
	return h(TrinhSoan, {
		giaTri,
		onDoi: (md: string) => {
			phat.push(md);
			setGiaTri(md);
		},
		nhan: NHAN_O,
		goiY: GOI_Y,
		nhanNut: NHAN_NUT,
	});
}

export function dung(dau: string): Dung {
	const khung = document.createElement("div");
	document.body.appendChild(khung);
	const root = createRoot(khung);
	const phat: string[] = [];
	act(() => {
		root.render(h(Vo, { dau, phat }));
	});
	dangMo.push({ root, khung });

	const o = (): ORieng => {
		const el = khung.querySelector<ORieng>('[role="textbox"]');
		if (!el) throw new Error("khong thay o soan");
		return el;
	};
	const editor = (): Editor => {
		const e = o().editor;
		if (!e) throw new Error("o soan chua gan editor");
		return e;
	};
	const thanh = (): HTMLElement => {
		const el = khung.querySelector<HTMLElement>('[role="toolbar"]');
		if (!el) throw new Error("khong thay thanh cong cu");
		return el;
	};

	return {
		khung,
		phat,
		o,
		editor,
		thanh,
		nut: (k) => {
			const el = thanh().querySelector<HTMLElement>(`[data-nut="${k}"]`);
			if (!el) throw new Error(`khong thay nut: ${k}`);
			return el;
		},
		md: () => tuanTuHoa(editor().getJSON()),
		go: (chu) => {
			const view = editor().view;
			for (const kyTu of chu) {
				act(() => {
					const { from, to } = view.state.selection;
					const xong = view.someProp("handleTextInput", (f) =>
						f(view, from, to, kyTu, () =>
							view.state.tr.insertText(kyTu, from, to),
						),
					);
					if (!xong) view.dispatch(view.state.tr.insertText(kyTu, from, to));
				});
			}
		},
		chon: (tu, den) => {
			act(() => {
				editor().commands.setTextSelection({ from: tu, to: den });
			});
		},
		bam: (el) => {
			act(() => {
				el.dispatchEvent(
					new window.PointerEvent("pointerdown", { bubbles: true }),
				);
				el.dispatchEvent(new window.MouseEvent("mousedown", { bubbles: true }));
				el.dispatchEvent(new window.MouseEvent("mouseup", { bubbles: true }));
				el.click();
			});
		},
		dan: (html, chu = "") => {
			const su = new window.Event("paste", { bubbles: true, cancelable: true });
			Object.defineProperty(su, "clipboardData", {
				value: {
					types: ["text/html", "text/plain"],
					files: [],
					items: [],
					getData: (loai: string) =>
						loai === "text/html" ? html : loai.startsWith("text") ? chu : "",
				},
			});
			act(() => {
				o().dispatchEvent(su);
			});
		},
		goBo: () => {
			act(() => {
				root.unmount();
			});
			khung.remove();
			dangMo = dangMo.filter((m) => m.root !== root);
		},
	};
}

export function donDep(): void {
	for (const { root, khung } of dangMo) {
		act(() => {
			root.unmount();
		});
		khung.remove();
	}
	dangMo = [];
	for (const el of Array.from(document.body.children)) el.remove();
}
