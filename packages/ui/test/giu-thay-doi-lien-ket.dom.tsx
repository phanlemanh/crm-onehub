import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement, useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	useChanLienKetTrongHop,
	useKhaiThayDoi,
} from "../src/components/giu-thay-doi";
import { Input } from "../src/components/input";
import { LocaleProvider } from "../src/components/locale-provider";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "../src/components/sheet";
import { messages } from "../src/lib/messages";

const mui = messages("vi");
const DICH = "/dich";

let root: Root | null = null;
let khung: HTMLElement | null = null;
const daDi: string[] = [];
const daDong: boolean[] = [];
const dieuKhien: { datMo: ((v: boolean) => void) | null } = { datMo: null };

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	daDi.length = 0;
	daDong.length = 0;
	document.body.innerHTML = "";
	document.body.removeAttribute("style");
});

function ThanHop({ chan }: { chan: boolean }) {
	const [chu, setChu] = useState("");
	const khai = useKhaiThayDoi();
	useEffect(() => {
		khai(chu !== "");
	}, [khai, chu]);
	return (
		<>
			<Input
				aria-label="Tên"
				value={chu}
				onChange={(e) => setChu(e.currentTarget.value)}
			/>
			<a href={DICH} data-lien-ket="">
				Tới đích
			</a>
			{chan ? <BatChan /> : null}
		</>
	);
}

function BatChan() {
	useChanLienKetTrongHop(ghiDi);
	return null;
}

function ghiDi(href: string) {
	daDi.push(href);
}

function NgoaiHop() {
	useChanLienKetTrongHop(ghiDi);
	return (
		<a href={DICH} data-lien-ket="">
			Tới đích
		</a>
	);
}

function VoSheet({ chan = true }: { chan?: boolean }) {
	const [mo, setMo] = useState(true);
	dieuKhien.datMo = setMo;
	return (
		<Sheet
			open={mo}
			onOpenChange={(v) => {
				daDong.push(v);
				setMo(v);
			}}
			tuNhanThayDoi={false}
		>
			<SheetContent>
				<SheetTitle>Khung</SheetTitle>
				<SheetDescription>Khung có liên kết</SheetDescription>
				<ThanHop chan={chan} />
			</SheetContent>
		</Sheet>
	);
}

function dung(el: ReactElement) {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(<LocaleProvider locale="vi">{el}</LocaleProvider>));
}

async function cho() {
	await act(async () => {
		await new Promise((xong) => setTimeout(xong, 0));
	});
}

async function go(chu: string) {
	await cho();
	const o = oTen();
	await act(async () => {
		o.focus();
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			"value",
		)?.set?.call(o, chu);
		o.dispatchEvent(new InputEvent("input", { bubbles: true }));
	});
	await cho();
}

function oTen(): HTMLInputElement {
	const o = document.querySelector("input[aria-label='Tên']");
	if (!(o instanceof HTMLInputElement)) throw new Error("khong thay o Ten");
	return o;
}

function lienKet(): HTMLAnchorElement {
	const a = document.querySelector("a[data-lien-ket]");
	if (!(a instanceof HTMLAnchorElement)) throw new Error("khong thay lien ket");
	return a;
}

type KetBam = { chan: boolean };

async function bamLienKet(
	thuocTinh: MouseEventInit = {},
	a: HTMLAnchorElement = lienKet(),
): Promise<KetBam> {
	await cho();
	let toiCuoi = false;
	const cuoi = (e: Event) => {
		toiCuoi = !e.defaultPrevented;
		e.preventDefault();
	};
	window.addEventListener("click", cuoi);
	await act(async () => {
		a.dispatchEvent(
			new MouseEvent("click", {
				bubbles: true,
				cancelable: true,
				button: 0,
				...thuocTinh,
			}),
		);
	});
	window.removeEventListener("click", cuoi);
	await cho();
	return { chan: !toiCuoi };
}

function hop(): Element | null {
	return document.querySelector("[role='alertdialog']");
}

function coSheet(): boolean {
	return document.querySelector("[data-slot='sheet-content']") !== null;
}

function nutTrongHop(chu: string): HTMLButtonElement {
	const nut = [...(hop()?.querySelectorAll("button") ?? [])].find(
		(b) => b.textContent?.trim() === chu,
	);
	if (!(nut instanceof HTMLButtonElement))
		throw new Error(`khong thay nut ${chu}`);
	return nut;
}

async function bam(nut: HTMLElement) {
	await act(async () => {
		nut.click();
	});
	await cho();
}

async function esc() {
	await act(async () => {
		(hop() ?? document.body).dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		);
	});
	await cho();
}

function laHopBo(): boolean {
	return hop()?.textContent?.includes(mui.dialog.boThayDoi.tieuDe) === true;
}

describe("kcl-hop", () => {
	let soO = 0;
	afterEach(() => {
		soO += 1;
	});

	test("h1 co do, chuot trai: hop hien, bi chan, chua di", async () => {
		dung(<VoSheet />);
		await go("Hợp đồng");
		const ket = await bamLienKet();
		expect(`kcl-hop h1: chan ${ket.chan}`).toBe("kcl-hop h1: chan true");
		expect(`kcl-hop h1: co hop hoi ${laHopBo()}`).toBe(
			"kcl-hop h1: co hop hoi true",
		);
		expect(`kcl-hop h1: chua di ${daDi.length}`).toBe("kcl-hop h1: chua di 0");
	});

	test("h2 o lai bang nut: khung mo, chu con, chua di", async () => {
		dung(<VoSheet />);
		await go("Hợp đồng");
		await bamLienKet();
		await bam(nutTrongHop(mui.dialog.boThayDoi.tiepTuc));
		expect(`kcl-hop h2: hop dong ${hop() === null}`).toBe(
			"kcl-hop h2: hop dong true",
		);
		expect(`kcl-hop h2: khung con ${coSheet()}`).toBe(
			"kcl-hop h2: khung con true",
		);
		expect(`kcl-hop h2: chu ${oTen().value}`).toBe("kcl-hop h2: chu Hợp đồng");
		expect(`kcl-hop h2: chua di ${daDi.length}`).toBe("kcl-hop h2: chua di 0");
		expect(daDong).toEqual([]);
	});

	test("h3 o lai bang Esc: nhu h2", async () => {
		dung(<VoSheet />);
		await go("Hợp đồng");
		await bamLienKet();
		await esc();
		expect(`kcl-hop h3: hop dong ${hop() === null}`).toBe(
			"kcl-hop h3: hop dong true",
		);
		expect(`kcl-hop h3: khung con ${coSheet()}`).toBe(
			"kcl-hop h3: khung con true",
		);
		expect(`kcl-hop h3: chu ${oTen().value}`).toBe("kcl-hop h3: chu Hợp đồng");
		expect(`kcl-hop h3: chua di ${daDi.length}`).toBe("kcl-hop h3: chua di 0");
	});

	test("h4 roi: dieu huong dung mot lan toi dich, hop dong", async () => {
		dung(<VoSheet />);
		await go("Hợp đồng");
		await bamLienKet();
		await bam(nutTrongHop(mui.dialog.boThayDoi.bo));
		expect(`kcl-hop h4: dieu huong 1 lan ${JSON.stringify(daDi)}`).toBe(
			`kcl-hop h4: dieu huong 1 lan ${JSON.stringify([DICH])}`,
		);
		expect(`kcl-hop h4: hop dong ${hop() === null}`).toBe(
			"kcl-hop h4: hop dong true",
		);
	});

	test("h5 sau khi roi van con do: bam lai thi hoi lai, khong di them", async () => {
		dung(<VoSheet />);
		await go("Hợp đồng");
		await bamLienKet();
		await bam(nutTrongHop(mui.dialog.boThayDoi.bo));
		const ket = await bamLienKet();
		expect(`kcl-hop h5: chan ${ket.chan}`).toBe("kcl-hop h5: chan true");
		expect(`kcl-hop h5: hoi lai ${laHopBo()}`).toBe("kcl-hop h5: hoi lai true");
		expect(`kcl-hop h5: van 1 lan ${daDi.length}`).toBe(
			"kcl-hop h5: van 1 lan 1",
		);
		await esc();
		expect(`kcl-hop h5: o lai khong di ${daDi.length}`).toBe(
			"kcl-hop h5: o lai khong di 1",
		);
	});

	test("đếm ô kcl-hop", () => {
		expect(soO).toBe(5);
	});
});

describe("kcl-hop-sach", () => {
	let soO = 0;
	afterEach(() => {
		soO += 1;
	});

	test("d1 khong do: chuot trai di thang, khong hop", async () => {
		dung(<VoSheet />);
		const ket = await bamLienKet();
		expect(`kcl-hop-sach d1: khong hop ${hop() === null}`).toBe(
			"kcl-hop-sach d1: khong hop true",
		);
		expect(`kcl-hop-sach d1: khong chan ${!ket.chan}`).toBe(
			"kcl-hop-sach d1: khong chan true",
		);
		expect(daDi).toEqual([]);
	});

	test("d3 goi ngoai moi hop: dung khong loi, bam khong chan", async () => {
		dung(<NgoaiHop />);
		const ket = await bamLienKet();
		expect(`kcl-hop-sach d3: khong chan ${!ket.chan}`).toBe(
			"kcl-hop-sach d3: khong chan true",
		);
		expect(hop()).toBeNull();
		expect(daDi).toEqual([]);
	});

	test("đếm ô kcl-hop-sach", () => {
		expect(soO).toBe(2);
	});
});

describe("kcl-khong-chan", () => {
	let soO = 0;
	afterEach(() => {
		soO += 1;
	});

	const MA_TRAN: {
		o: string;
		bam?: MouseEventInit;
		sua?: (a: HTMLAnchorElement) => void;
	}[] = [
		{ o: "n1 meta", bam: { metaKey: true } },
		{ o: "n2 ctrl", bam: { ctrlKey: true } },
		{ o: "n3 shift", bam: { shiftKey: true } },
		{ o: "n4 alt", bam: { altKey: true } },
		{ o: "n5 chuot giua", bam: { button: 1 } },
		{ o: "n6 the moi", sua: (a) => a.setAttribute("target", "_blank") },
		{
			o: "n7 mien khac",
			sua: (a) => a.setAttribute("href", "https://example.com/x"),
		},
		{ o: "n8 tai xuong", sua: (a) => a.setAttribute("download", "") },
		{
			o: "n9 cung dia chi",
			sua: (a) =>
				a.setAttribute(
					"href",
					`${window.location.pathname}${window.location.search}`,
				),
		},
	];

	for (const ca of MA_TRAN) {
		test(`${ca.o}: co do van khong chan`, async () => {
			dung(<VoSheet />);
			await go("Hợp đồng");
			const a = lienKet();
			ca.sua?.(a);
			const ket = await bamLienKet(ca.bam ?? {}, a);
			const ten = ca.o.split(" ")[0];
			expect(`kcl-khong-chan ${ten}: khong chan ${!ket.chan}`).toBe(
				`kcl-khong-chan ${ten}: khong chan true`,
			);
			expect(`kcl-khong-chan ${ten}: khong hop ${hop() === null}`).toBe(
				`kcl-khong-chan ${ten}: khong hop true`,
			);
			expect(daDi).toEqual([]);
		});
	}

	test("đếm ô kcl-khong-chan", () => {
		expect(soO).toBe(9);
	});
});

describe("kcl-ngoai", () => {
	test("Sheet da go do ma khong goi phan chan: lien ket khong bi hoi", async () => {
		dung(<VoSheet chan={false} />);
		await go("Hợp đồng");
		const ket = await bamLienKet();
		expect(`kcl-ngoai: khong hop ${hop() === null}`).toBe(
			"kcl-ngoai: khong hop true",
		);
		expect(`kcl-ngoai: khong chan ${!ket.chan}`).toBe(
			"kcl-ngoai: khong chan true",
		);
	});
});

describe("kcl-hop-sot", () => {
	test("khung dong tu ngoai luc dang hoi roi: lan dong sau khong di nham", async () => {
		dung(<VoSheet />);
		await go("Hợp đồng");
		await bamLienKet();
		await act(async () => dieuKhien.datMo?.(false));
		await cho();
		await act(async () => dieuKhien.datMo?.(true));
		await cho();
		await go("Hợp đồng mới");
		await act(async () => {
			document
				.querySelector("[data-slot='sheet-content']")
				?.dispatchEvent(
					new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
				);
		});
		await cho();
		const coHop = laHopBo();
		if (coHop) await bam(nutTrongHop(mui.dialog.boThayDoi.bo));
		expect(`kcl-hop-sot: co hop dong ${coHop}`).toBe(
			"kcl-hop-sot: co hop dong true",
		);
		expect(`kcl-hop-sot: khong di nham ${daDi.length}`).toBe(
			"kcl-hop-sot: khong di nham 0",
		);
	});
});
