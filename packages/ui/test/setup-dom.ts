import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
	pretendToBeVisual: true,
	url: "http://localhost/",
});

const DE_LEN = new Set([
	"Event",
	"CustomEvent",
	"UIEvent",
	"MouseEvent",
	"PointerEvent",
	"KeyboardEvent",
	"FocusEvent",
	"InputEvent",
	"TouchEvent",
	"WheelEvent",
	"EventTarget",
	"Node",
	"Element",
	"HTMLElement",
	"DOMRect",
]);

type GiaTriToanCuc =
	| Window
	| Document
	| Navigator
	| ((...doi_so: never[]) => unknown)
	| (new () => object)
	| boolean;

function dat(ten: string, gia_tri: GiaTriToanCuc): void {
	const cu = Object.getOwnPropertyDescriptor(globalThis, ten);
	if (cu && !cu.configurable && !cu.writable) return;
	Object.defineProperty(globalThis, ten, {
		value: gia_tri,
		writable: true,
		configurable: cu?.configurable ?? true,
	});
}

for (const ten of Object.getOwnPropertyNames(dom.window)) {
	if (ten in globalThis && !DE_LEN.has(ten)) continue;
	const mo = Object.getOwnPropertyDescriptor(dom.window, ten);
	if (mo) Object.defineProperty(globalThis, ten, mo);
}

dat("window", dom.window);
dat("document", dom.window.document);
dat("navigator", dom.window.navigator);
dat("getComputedStyle", dom.window.getComputedStyle.bind(dom.window));
dat("requestAnimationFrame", (cb: (t: number) => void) =>
	setTimeout(() => cb(0), 0),
);
dat("cancelAnimationFrame", (id: number) => clearTimeout(id));
dat("IS_REACT_ACT_ENVIRONMENT", true);

const khop_media = (query: string) => ({
	matches: false,
	media: query,
	onchange: null,
	addListener: () => {},
	removeListener: () => {},
	addEventListener: () => {},
	removeEventListener: () => {},
	dispatchEvent: () => false,
});
dat("matchMedia", khop_media);
Object.defineProperty(dom.window, "matchMedia", {
	value: khop_media,
	writable: true,
	configurable: true,
});

class QuanSatRong {
	observe() {}
	unobserve() {}
	disconnect() {}
	takeRecords() {
		return [];
	}
}

if (!("ResizeObserver" in globalThis)) dat("ResizeObserver", QuanSatRong);
if (!("IntersectionObserver" in globalThis)) {
	dat("IntersectionObserver", QuanSatRong);
}
if (!("DOMRectReadOnly" in globalThis)) {
	dat("DOMRectReadOnly", dom.window.DOMRect);
}

dom.window.HTMLElement.prototype.scrollIntoView = () => {};
dom.window.HTMLElement.prototype.releasePointerCapture = () => {};
dom.window.HTMLElement.prototype.hasPointerCapture = () => false;
dom.window.HTMLElement.prototype.setPointerCapture = () => {};
