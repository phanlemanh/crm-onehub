import { afterEach, describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Scrollspy } from "../src/components/reui/scrollspy";

let root: Root | null = null;
let khung: HTMLElement | null = null;
const goiCuon: number[] = [];
const cuCuon = window.scrollTo;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	goiCuon.length = 0;
	window.scrollTo = cuCuon;
	document.body.innerHTML = "";
});

function Mau({ nhan }: { nhan: string }) {
	return (
		<>
			<Scrollspy history={false} onUpdate={() => {}} smooth={false}>
				<button data-scrollspy-anchor="the-a" type="button">
					{nhan}
				</button>
			</Scrollspy>
			<section id="the-a">A</section>
		</>
	);
}

function ve(nhan: string) {
	if (!khung) {
		khung = document.createElement("div");
		document.body.appendChild(khung);
		root = createRoot(khung);
	}
	act(() => root?.render(<Mau nhan={nhan} />));
}

function bam() {
	const nut = document.querySelector<HTMLElement>("[data-scrollspy-anchor]");
	if (!nut) throw new Error("không thấy mục lục");
	act(() => nut.click());
}

describe("scrollspy — gỡ đúng bộ nghe bấm", () => {
	test("vẽ lại ba lần với onUpdate mới vẫn chỉ cuộn một lần mỗi cú bấm", () => {
		window.scrollTo = ((tuyChon: ScrollToOptions) => {
			goiCuon.push(tuyChon.top ?? -1);
		}) as typeof window.scrollTo;
		ve("một");
		ve("hai");
		ve("ba");
		bam();
		expect(goiCuon).toHaveLength(1);
	});

	test("gỡ khỏi cây thì bấm không cuộn nữa", () => {
		window.scrollTo = ((tuyChon: ScrollToOptions) => {
			goiCuon.push(tuyChon.top ?? -1);
		}) as typeof window.scrollTo;
		ve("một");
		const nut = document.querySelector<HTMLElement>("[data-scrollspy-anchor]");
		act(() => root?.unmount());
		root = null;
		if (khung) document.body.appendChild(khung);
		act(() => nut?.click());
		expect(goiCuon).toHaveLength(0);
	});

	test("throttleTime gộp các lần cuộn sát nhau thành một lần tính", async () => {
		khung = document.createElement("div");
		document.body.appendChild(khung);
		root = createRoot(khung);
		act(() =>
			root?.render(
				<>
					<Scrollspy history={false} throttleTime={50}>
						<button data-scrollspy-anchor="the-a" type="button">
							A
						</button>
					</Scrollspy>
					<section id="the-a">A</section>
				</>,
			),
		);
		const cu = document.getElementById.bind(document);
		let dem = 0;
		document.getElementById = (id: string) => {
			if (id === "the-a") dem += 1;
			return cu(id);
		};
		try {
			for (let i = 0; i < 5; i += 1) window.dispatchEvent(new Event("scroll"));
			const ngay = dem;
			await new Promise((r) => setTimeout(r, 80));
			expect({ ngay, sau: dem }).toEqual({ ngay: 1, sau: 2 });
		} finally {
			document.getElementById = cu;
		}
	});
});
