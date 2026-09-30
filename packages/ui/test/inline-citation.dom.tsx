import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
} from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	InlineCitation,
	InlineCitationCard,
	InlineCitationCardBody,
	InlineCitationCardTrigger,
	InlineCitationCarousel,
	InlineCitationCarouselContent,
	InlineCitationCarouselHeader,
	InlineCitationCarouselIndex,
	InlineCitationCarouselItem,
	InlineCitationCarouselNext,
	InlineCitationCarouselPrev,
	InlineCitationQuote,
	InlineCitationSource,
	InlineCitationText,
} from "../src/components/ai-elements/inline-citation";
import { LocaleProvider } from "../src/components/locale-provider";
import { messages } from "../src/lib/messages";

const RONG = 320;
const msg = messages("vi");

const moTaGoc = {
	offsetWidth: Object.getOwnPropertyDescriptor(
		HTMLElement.prototype,
		"offsetWidth",
	),
	offsetHeight: Object.getOwnPropertyDescriptor(
		HTMLElement.prototype,
		"offsetHeight",
	),
	offsetLeft: Object.getOwnPropertyDescriptor(
		HTMLElement.prototype,
		"offsetLeft",
	),
};

function viTriTrong(el: HTMLElement): number {
	if (el.dataset.slot !== "carousel-item" || !el.parentElement) return 0;
	return [...el.parentElement.children].indexOf(el) * RONG;
}

beforeAll(() => {
	Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
		configurable: true,
		get: () => RONG,
	});
	Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
		configurable: true,
		get: () => 40,
	});
	Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
		configurable: true,
		get(this: HTMLElement) {
			return viTriTrong(this);
		},
	});
});

afterAll(() => {
	for (const [ten, mo] of Object.entries(moTaGoc)) {
		if (mo) Object.defineProperty(HTMLElement.prototype, ten, mo);
	}
});

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

const NGUON = [
	{ tieuDe: "KR doanh thu quý", trich: "Đạt 62% mục tiêu" },
	{ tieuDe: "KR khách hàng mới", trich: "Thêm 14 khách" },
	{ tieuDe: "KR giữ chân", trich: "Tỷ lệ rời 3%" },
];

function TrichDan() {
	return (
		<p>
			<InlineCitation>
				<InlineCitationText>Doanh thu tăng 12%</InlineCitationText>
				<InlineCitationCard>
					<InlineCitationCardTrigger nhan="Doanh thu +2" />
					<InlineCitationCardBody>
						<InlineCitationCarousel>
							<InlineCitationCarouselHeader>
								<InlineCitationCarouselPrev />
								<InlineCitationCarouselNext />
								<InlineCitationCarouselIndex />
							</InlineCitationCarouselHeader>
							<InlineCitationCarouselContent>
								{NGUON.map((n) => (
									<InlineCitationCarouselItem key={n.tieuDe}>
										<InlineCitationSource title={n.tieuDe} />
										<InlineCitationQuote>{n.trich}</InlineCitationQuote>
									</InlineCitationCarouselItem>
								))}
							</InlineCitationCarouselContent>
						</InlineCitationCarousel>
					</InlineCitationCardBody>
				</InlineCitationCard>
			</InlineCitation>
		</p>
	);
}

function nutMo(goc: HTMLElement): HTMLElement {
	const nut = goc.querySelector<HTMLElement>('button[aria-haspopup="dialog"]');
	if (!nut) throw new Error("khong thay nut trich dan");
	return nut;
}

function the(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>(
		'[data-slot="popover-content"]',
	);
}

function canMo(loi: string): HTMLElement {
	const t = the();
	if (!t) throw new Error(loi);
	return t;
}

function phim(dich: Element, loai: "keydown" | "keyup", key: string): boolean {
	let khongChan = true;
	act(() => {
		khongChan = dich.dispatchEvent(
			new KeyboardEvent(loai, { key, bubbles: true, cancelable: true }),
		);
	});
	return khongChan;
}

function kichHoatNhuTrinhDuyet(dich: HTMLElement, key: "Enter" | " ") {
	const laNut = dich instanceof HTMLButtonElement;
	const xuong = phim(dich, "keydown", key);
	if (key === "Enter") {
		if (laNut && xuong) act(() => dich.click());
		return;
	}
	const len = phim(dich, "keyup", key);
	if (laNut && xuong && len) act(() => dich.click());
}

function diChuot(
	dich: Element,
	loai: "pointerover" | "pointerout",
	kieu: string,
) {
	act(() => {
		dich.dispatchEvent(
			new PointerEvent(loai, { bubbles: true, pointerType: kieu }),
		);
	});
}

async function cho(ms: number) {
	await act(() => new Promise((r) => setTimeout(r, ms)));
}

function chiSo(t: HTMLElement): string {
	const o = [...t.querySelectorAll("div")].find(
		(d) => d.children.length === 0 && /^\d+\/\d+$/.test(d.textContent ?? ""),
	);
	return o?.textContent ?? "";
}

describe("InlineCitation mở bằng bấm", () => {
	test("nút hiện nhãn truyền vào, không suy tên miền", () => {
		const goc = ve(<TrichDan />);
		expect(nutMo(goc).textContent).toBe("Doanh thu +2");
		expect(nutMo(goc).tagName).toBe("BUTTON");
	});

	test("bấm mở thẻ", () => {
		const goc = ve(<TrichDan />);
		expect(the()).toBeNull();
		act(() => nutMo(goc).click());
		const t = canMo("trich dan khong bam duoc");
		expect(t.getAttribute("role")).toBe("dialog");
		if (t.getAttribute("aria-label") !== msg.inlineCitation.sources) {
			throw new Error("hop trich dan khong co ten truy cap");
		}
	});

	test("Enter mở thẻ", () => {
		const goc = ve(<TrichDan />);
		nutMo(goc).focus();
		kichHoatNhuTrinhDuyet(nutMo(goc), "Enter");
		canMo("trich dan khong mo bang Enter");
	});

	test("Space mở thẻ", () => {
		const goc = ve(<TrichDan />);
		nutMo(goc).focus();
		kichHoatNhuTrinhDuyet(nutMo(goc), " ");
		canMo("trich dan khong mo bang Space");
	});

	test("Esc đóng thẻ", () => {
		const goc = ve(<TrichDan />);
		act(() => nutMo(goc).click());
		const t = canMo("trich dan khong bam duoc");
		phim(t, "keydown", "Escape");
		if (the()) throw new Error("Esc khong dong trich dan");
	});

	test("bấm lần nữa đóng thẻ", () => {
		const goc = ve(<TrichDan />);
		act(() => nutMo(goc).click());
		canMo("trich dan khong bam duoc");
		act(() => nutMo(goc).click());
		if (the()) throw new Error("bam lan hai khong dong trich dan");
	});

	test("di chuột mở, rời chuột đóng", async () => {
		const goc = ve(<TrichDan />);
		diChuot(nutMo(goc), "pointerover", "mouse");
		canMo("di chuot khong mo trich dan");
		diChuot(nutMo(goc), "pointerout", "mouse");
		await cho(400);
		if (the()) throw new Error("roi chuot khong dong trich dan");
	});

	test("chạm không mở theo đường di chuột", () => {
		const goc = ve(<TrichDan />);
		diChuot(nutMo(goc), "pointerover", "touch");
		if (the()) throw new Error("cham mo trich dan theo duong di chuot");
	});

	test("di chuột mở rồi bấm thì ghim, rời chuột không đóng", async () => {
		const goc = ve(<TrichDan />);
		diChuot(nutMo(goc), "pointerover", "mouse");
		act(() => nutMo(goc).click());
		canMo("bam sau di chuot dong mat trich dan");
		diChuot(nutMo(goc), "pointerout", "mouse");
		await cho(400);
		canMo("trich dan da ghim van dong khi roi chuot");
	});

	test("lật nguồn: 1/3 → 2/3 → 1/3", async () => {
		const goc = ve(<TrichDan />);
		act(() => nutMo(goc).click());
		await cho(20);
		const t = canMo("trich dan khong bam duoc");
		expect(chiSo(t)).toBe("1/3");
		const sau = t.querySelector<HTMLButtonElement>(
			`button[aria-label="${msg.inlineCitation.nextSource}"]`,
		);
		const truoc = t.querySelector<HTMLButtonElement>(
			`button[aria-label="${msg.inlineCitation.previousSource}"]`,
		);
		if (!sau || !truoc) throw new Error("khong thay nut lat nguon");
		act(() => sau.click());
		await cho(20);
		expect(chiSo(t)).toBe("2/3");
		act(() => truoc.click());
		await cho(20);
		expect(chiSo(t)).toBe("1/3");
	});
});

describe("InlineCitationSource", () => {
	test("tên nguồn dài xuống dòng, đọc đủ chữ", () => {
		const ten =
			"Tỷ lệ khách hàng doanh nghiệp vùng Đồng bằng sông Cửu Long gia hạn hợp đồng dịch vụ kho lạnh trước hạn ít nhất ba mươi ngày trong quý bốn";
		const goc = ve(<InlineCitationSource title={ten} />);
		const h = goc.querySelector("h4");
		if (!h) throw new Error("khong thay tieu de nguon");
		expect(h.textContent).toBe(ten);
		const cat = [...h.classList].filter((c) =>
			/^(truncate|line-clamp-|text-ellipsis|overflow-hidden|whitespace-nowrap)/.test(
				c,
			),
		);
		expect(
			cat.length > 0 ? `ten nguon bi cat: ${cat.join(" ")}` : "doc du",
		).toBe("doc du");
	});
});
