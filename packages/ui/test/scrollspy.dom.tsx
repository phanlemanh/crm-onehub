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

function Mau({ nhan, them = false }: { nhan: string; them?: boolean }) {
	return (
		<>
			<Scrollspy history={false} onUpdate={() => {}} smooth={false}>
				<button data-scrollspy-anchor="the-a" type="button">
					{nhan}
				</button>
				{them ? (
					<button data-scrollspy-anchor="the-b" type="button">
						B
					</button>
				) : null}
			</Scrollspy>
			<section id="the-a">A</section>
			<section id="the-b">B</section>
		</>
	);
}

function ve(nhan: string, them = false) {
	if (!khung) {
		khung = document.createElement("div");
		document.body.appendChild(khung);
		root = createRoot(khung);
	}
	act(() => root?.render(<Mau nhan={nhan} them={them} />));
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

	test("mục mới thêm sau khi gắn vẫn bấm được; hash chỉ cuộn một lần dù danh sách đổi", async () => {
		window.scrollTo = ((tuyChon: ScrollToOptions) => {
			goiCuon.push(tuyChon.top ?? -1);
		}) as typeof window.scrollTo;
		window.history.replaceState(null, "", "#the-a");
		try {
			ve("một");
			await new Promise((r) => setTimeout(r, 150));
			const sauGan = goiCuon.length;
			ve("một", true);
			ve("hai", true);
			await new Promise((r) => setTimeout(r, 150));
			const sauDoi = goiCuon.length;
			const moi = document.querySelector<HTMLElement>(
				'[data-scrollspy-anchor="the-b"]',
			);
			act(() => moi?.click());
			expect({ sauGan, sauDoi, sauBam: goiCuon.length }).toEqual({
				sauGan: 1,
				sauDoi: 1,
				sauBam: 2,
			});
		} finally {
			window.history.replaceState(null, "", "/");
		}
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
