import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
} from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { NavItem, NavStrip } from "../src/components/nav-item";

const KHUNG_RONG = 390;
const THE: readonly (readonly [number, number])[] = [
	[10, 70],
	[450, 110],
	[600, 100],
];

const cuon = new WeakMap<Element, number>();
const rectGoc = Element.prototype.getBoundingClientRect;
const moTaCuon = Object.getOwnPropertyDescriptor(
	Element.prototype,
	"scrollLeft",
);

function hop(left: number, width: number): DOMRect {
	return {
		left,
		right: left + width,
		width,
		top: 0,
		bottom: 30,
		height: 30,
		x: left,
		y: 0,
		toJSON: () => ({}),
	} as DOMRect;
}

beforeAll(() => {
	Object.defineProperty(Element.prototype, "scrollLeft", {
		configurable: true,
		get() {
			return cuon.get(this) ?? 0;
		},
		set(v: number) {
			cuon.set(this, v);
		},
	});
	Element.prototype.getBoundingClientRect = function (this: Element) {
		if (this.getAttribute("data-slot") === "nav-strip")
			return hop(0, KHUNG_RONG);
		const x = this.getAttribute("data-x");
		if (x !== null) {
			const khung = this.closest("[data-slot='nav-strip']");
			const s = khung ? (cuon.get(khung) ?? 0) : 0;
			return hop(Number(x) - s, Number(this.getAttribute("data-w")));
		}
		return hop(0, 0);
	};
});

afterAll(() => {
	Element.prototype.getBoundingClientRect = rectGoc;
	if (moTaCuon)
		Object.defineProperty(Element.prototype, "scrollLeft", moTaCuon);
	else Reflect.deleteProperty(Element.prototype, "scrollLeft");
});

let root: Root | null = null;
let goc: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	goc?.remove();
	root = null;
	goc = null;
});

function Hang({ dangMo }: { dangMo: number | null }) {
	return (
		<NavStrip aria-label="Cài đặt">
			{THE.map(([x, w], i) => (
				<a
					key={x}
					href={`#${i}`}
					data-x={x}
					data-w={w}
					aria-current={i === dangMo ? "page" : undefined}
				>
					{`Thẻ ${i}`}
				</a>
			))}
		</NavStrip>
	);
}

function ve(dangMo: number | null) {
	if (!goc) {
		goc = document.createElement("div");
		document.body.appendChild(goc);
		root = createRoot(goc);
	}
	act(() => root?.render(<Hang dangMo={dangMo} />));
	const khung = goc.querySelector("[data-slot='nav-strip']");
	if (!khung) throw new Error("khong thay [data-slot=nav-strip]");
	return khung;
}

function namTron(khung: Element, i: number) {
	const the = khung.querySelectorAll("a")[i];
	if (!the) throw new Error(`khong thay the ${i}`);
	const r = the.getBoundingClientRect();
	return r.left >= 0 && r.right <= KHUNG_RONG;
}

describe("nav-strip", () => {
	test("ve-dau: the dang mo ngoai khung duoc cuon vao tron", () => {
		const khung = ve(2);
		expect(khung.scrollLeft, "the dang mo van ngoai khung").toBeGreaterThan(0);
		expect(namTron(khung, 2), "the dang mo van ngoai khung").toBe(true);
	});

	test("giu-cho-nguoi: ve lai cung the dang mo khong keo khung ve", () => {
		const khung = ve(2);
		khung.scrollLeft = 0;
		ve(2);
		expect(khung.scrollLeft, "nguoi tu cuon bi keo ve").toBe(0);
	});

	test("the-da-tron: doi sang the da nam tron thi khung dung yen", () => {
		const khung = ve(2);
		khung.scrollLeft = 0;
		ve(0);
		expect(khung.scrollLeft, "khung cuon du the moi da nam tron").toBe(0);
	});

	test("doi-the-ngoai-khung: doi sang the ngoai khung thi canh lai", () => {
		const khung = ve(0);
		expect(khung.scrollLeft).toBe(0);
		ve(1);
		expect(khung.scrollLeft, "doi the ngoai khung khong canh").toBeGreaterThan(
			0,
		);
		expect(namTron(khung, 1), "doi the ngoai khung khong canh").toBe(true);
	});

	test("doi-chung: khong the nao dang mo thi khong cuon, khong nem", () => {
		const khung = ve(null);
		expect(khung.scrollLeft).toBe(0);
		expect(khung.tagName).toBe("NAV");
		expect(khung.getAttribute("aria-label")).toBe("Cài đặt");
	});
});

describe("nav-item size icon", () => {
	test("icon: giữ data-size, aria-current, biến thể secondary, không justify-start", () => {
		const o = document.createElement("div");
		document.body.appendChild(o);
		root = createRoot(o);
		goc = o;
		act(() =>
			root?.render(
				<NavItem active size="icon" orientation="horizontal">
					A
				</NavItem>,
			),
		);
		const nut = o.querySelector('[data-slot="nav-item"]');
		expect(nut?.getAttribute("data-size")).toBe("icon");
		expect(nut?.getAttribute("aria-current")).toBe("page");
		expect(nut?.getAttribute("data-variant")).toBe("secondary");
		expect(nut?.className).not.toContain("justify-start");
	});
	test("sm mặc định: vẫn justify-start", () => {
		const o = document.createElement("div");
		document.body.appendChild(o);
		root = createRoot(o);
		goc = o;
		act(() => root?.render(<NavItem>B</NavItem>));
		const nut = o.querySelector('[data-slot="nav-item"]');
		expect(nut?.getAttribute("data-size")).toBe("sm");
		expect(nut?.className).toContain("justify-start");
	});
});
