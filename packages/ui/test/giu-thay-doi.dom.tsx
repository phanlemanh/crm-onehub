import { afterEach, describe, expect, test } from "bun:test";
import {
	act,
	type ComponentProps,
	type ReactElement,
	type ReactNode,
	useState,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { Drawer as DrawerVaul } from "vaul";
import { Button } from "../src/components/button";
import { Combobox } from "../src/components/combobox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../src/components/command";
import { DatePicker } from "../src/components/date-picker";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "../src/components/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerTitle,
} from "../src/components/drawer";
import { Input } from "../src/components/input";
import { LocaleProvider } from "../src/components/locale-provider";
import { PickListDialog } from "../src/components/pick-list-dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../src/components/select";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "../src/components/sheet";
import { Textarea } from "../src/components/textarea";

let root: Root | null = null;
let khung: HTMLElement | null = null;
let loiConsole: string[] = [];
const consoleGoc = console.error;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	document.body.innerHTML = "";
	document.body.removeAttribute("style");
	console.error = consoleGoc;
});

function dung(el: ReactElement): HTMLElement {
	loiConsole = [];
	console.error = (...doiSo: unknown[]) => {
		loiConsole.push(doiSo.map(String).join(" "));
	};
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	act(() => root?.render(<LocaleProvider locale="vi">{el}</LocaleProvider>));
	return khung;
}

async function cho() {
	await act(async () => {
		await new Promise((xong) => setTimeout(xong, 0));
	});
}

async function go(o: HTMLInputElement | HTMLTextAreaElement, chu: string) {
	await cho();
	await act(async () => {
		o.focus();
		const dat = Object.getOwnPropertyDescriptor(
			Object.getPrototypeOf(o),
			"value",
		)?.set;
		dat?.call(o, chu);
		o.dispatchEvent(new InputEvent("input", { bubbles: true }));
	});
}

async function bamLopPhu(slot: string) {
	await cho();
	const lop = document.querySelector(`[data-slot='${slot}']`) as HTMLElement;
	if (!lop) throw new Error(`khong thay lop phu ${slot}`);
	await act(async () => {
		lop.dispatchEvent(
			new PointerEvent("pointerdown", {
				bubbles: true,
				button: 0,
				pointerType: "mouse",
			}),
		);
		lop.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
		lop.click();
	});
	await cho();
}

async function esc(el: Element | null) {
	await act(async () => {
		(el ?? document.body).dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		);
	});
	await cho();
}

async function bam(el: Element | null) {
	if (!el) throw new Error("khong thay phan tu de bam");
	await act(async () => {
		(el as HTMLElement).click();
	});
	await cho();
}

async function moBangChuot(el: Element | null) {
	if (!el) throw new Error("khong thay phan tu de mo");
	await act(async () => {
		el.dispatchEvent(
			new PointerEvent("pointerdown", {
				bubbles: true,
				button: 0,
				ctrlKey: false,
				pointerType: "mouse",
			}),
		);
	});
	await cho();
}

function nutCo(chu: string): HTMLButtonElement | null {
	return (
		[...document.body.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === chu,
		) ?? null
	);
}

function noiDung(): HTMLElement | null {
	return document.querySelector("[data-slot='dialog-content']");
}

function hopHoi(): Element[] {
	return [...document.querySelectorAll("[role='alertdialog']")];
}

function oTen(): HTMLInputElement {
	return document.querySelector(
		"[data-slot='dialog-content'] input[aria-label='Tên']",
	) as HTMLInputElement;
}

function khop<T>(thucTe: T, mongDoi: T, thongDiep: string) {
	if (!Bun.deepEquals(thucTe, mongDoi)) {
		throw new Error(
			`${thongDiep}\n  thuc te:  ${JSON.stringify(thucTe)}\n  mong doi: ${JSON.stringify(mongDoi)}`,
		);
	}
	expect(thucTe).toEqual(mongDoi);
}

function Vo({
	ghi,
	coThayDoi,
	giuThayDoi,
	children,
}: {
	ghi: (mo: boolean) => void;
	coThayDoi?: boolean;
	giuThayDoi?: boolean;
	children?: ReactNode;
}) {
	const [mo, datMo] = useState(true);
	return (
		<Dialog
			open={mo}
			onOpenChange={(v) => {
				ghi(v);
				datMo(v);
			}}
			coThayDoi={coThayDoi}
			giuThayDoi={giuThayDoi}
		>
			<DialogContent>
				<DialogTitle>Thêm KR</DialogTitle>
				<DialogDescription>Kết quả then chốt mới</DialogDescription>
				<Input aria-label="Tên" />
				{children}
			</DialogContent>
		</Dialog>
	);
}

function soLieu() {
	const hoi = hopHoi();
	return {
		con: noiDung() !== null,
		hoi: hoi.length,
		tieuDe: hoi[0]?.querySelector("[data-slot='alert-dialog-title']")
			?.textContent,
		tiepTuc: hoi[0] ? nutCo("Tiếp tục sửa") !== null : false,
		bo: hoi[0] ? nutCo("Bỏ") !== null : false,
	};
}

function thongDiepBamNgoai(con: boolean, hoi: number, goi: number): string {
	if (!con) return `bam-ngoai: hop dong du da go (onOpenChange goi ${goi} lan)`;
	if (hoi > 0) {
		return `bam-ngoai: bam ngoai ma hoi lai (hoi=${hoi}, onOpenChange goi ${goi} lan)`;
	}
	return `bam-ngoai: hop con mo, khong hoi, nhung da bao dong len cha (onOpenChange goi ${goi} lan)`;
}

describe("bam-ngoai", () => {
	test("bam-ngoai: da go thi hop dung yen, chu con, khong goi dong", async () => {
		const lich: boolean[] = [];
		dung(<Vo ghi={(v) => lich.push(v)} />);
		const o = oTen();
		await go(o, "Hợp đồng");
		await bamLopPhu("dialog-overlay");
		const con = noiDung() !== null;
		const hoi = hopHoi().length;
		khop(
			{ con, chu: o.value, goi: lich.length, hoi },
			{ con: true, chu: "Hợp đồng", goi: 0, hoi: 0 },
			thongDiepBamNgoai(con, hoi, lich.length),
		);
	});

	test("bam-ngoai: chua go thi bam lop phu dong ngay, goi dung mot lan voi false", async () => {
		const lich: boolean[] = [];
		dung(<Vo ghi={(v) => lich.push(v)} />);
		await bamLopPhu("dialog-overlay");
		khop(
			{ con: noiDung() !== null, lich, hoi: hopHoi().length },
			{ con: false, lich: [false], hoi: 0 },
			"bam-ngoai: chua go ma khong dong",
		);
	});
});

const DUONG = ["esc", "x"] as const;
const TRA_LOI = ["tiep-tuc", "esc-hoi", "bo"] as const;

async function diDuong(duong: (typeof DUONG)[number]) {
	if (duong === "esc") {
		await esc(oTen());
		return;
	}
	await bam(
		document.querySelector(
			"[data-slot='dialog-content'] [data-slot='dialog-close']",
		),
	);
}

describe("hoi-lai", () => {
	for (const duong of DUONG) {
		for (const traLoi of TRA_LOI) {
			test(`hoi-lai: da go · ${duong} · ${traLoi}`, async () => {
				const lich: boolean[] = [];
				dung(<Vo ghi={(v) => lich.push(v)} />);
				const o = oTen();
				await go(o, "Hợp đồng");
				await diDuong(duong);
				khop(
					{ ...soLieu(), goi: lich.length },
					{
						con: true,
						hoi: 1,
						tieuDe: "Bỏ những gì vừa nhập?",
						tiepTuc: true,
						bo: true,
						goi: 0,
					},
					`hoi-lai: dong khong hoi (${duong})`,
				);
				if (traLoi === "tiep-tuc") await bam(nutCo("Tiếp tục sửa"));
				if (traLoi === "esc-hoi") {
					await esc(document.activeElement ?? hopHoi()[0] ?? null);
				}
				if (traLoi === "bo") await bam(nutCo("Bỏ"));
				await cho();
				if (traLoi === "bo") {
					khop(
						{ con: noiDung() !== null, hoi: hopHoi().length, lich },
						{ con: false, hoi: 0, lich: [false] },
						`hoi-lai: bo khong dong dung mot lan (${duong})`,
					);
					return;
				}
				khop(
					{
						con: noiDung() !== null,
						hoi: hopHoi().length,
						chu: o.value,
						focus: document.activeElement === o,
						goi: lich.length,
					},
					{ con: true, hoi: 0, chu: "Hợp đồng", focus: true, goi: 0 },
					`hoi-lai: ${traLoi} khong ve o dang go (${duong})`,
				);
			});
		}
	}

	for (const duong of DUONG) {
		test(`hoi-lai: chua go · ${duong} dong ngay khong hoi`, async () => {
			const lich: boolean[] = [];
			dung(<Vo ghi={(v) => lich.push(v)} />);
			await cho();
			await diDuong(duong);
			khop(
				{ con: noiDung() !== null, hoi: hopHoi().length, lich },
				{ con: false, hoi: 0, lich: [false] },
				`hoi-lai: chua go ma khong dong ngay (${duong})`,
			);
		});
	}
});

function VoLuu({
	ghi,
	dongNgay,
}: {
	ghi: (mo: boolean) => void;
	dongNgay?: boolean;
}) {
	const [mo, datMo] = useState(true);
	return (
		<>
			<Button onClick={() => datMo(true)}>Mở lại</Button>
			<Dialog
				open={mo}
				onOpenChange={(v) => {
					ghi(v);
					datMo(v);
				}}
			>
				<DialogContent>
					<DialogTitle>Thêm KR</DialogTitle>
					<DialogDescription>Kết quả then chốt mới</DialogDescription>
					<Input aria-label="Tên" />
					{dongNgay ? (
						<DialogClose asChild dongNgay>
							<Button>Lưu</Button>
						</DialogClose>
					) : (
						<Button onClick={() => datMo(false)}>Lưu</Button>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

function theoDoiHopHoi() {
	let thay = false;
	const quanSat = new MutationObserver(() => {
		if (document.querySelector("[role='alertdialog']")) thay = true;
	});
	quanSat.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
	});
	return {
		thay: () => {
			quanSat.disconnect();
			return thay;
		},
	};
}

function VoForm({ ghi }: { ghi: (mo: boolean) => void }) {
	const [mo, datMo] = useState(true);
	const [loi, datLoi] = useState("");
	return (
		<Dialog
			open={mo}
			onOpenChange={(v) => {
				ghi(v);
				datMo(v);
			}}
		>
			<DialogContent>
				<DialogTitle>Thêm KR</DialogTitle>
				<DialogDescription>Kết quả then chốt mới</DialogDescription>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						datLoi("Máy chủ từ chối");
					}}
				>
					<Input aria-label="Tên" />
					<p data-loi>{loi}</p>
					<Button type="submit">Lưu</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}

type DongMaTran = {
	ca: string;
	con: boolean;
	hoi: number;
	lich: boolean[];
	sauBo?: { con: boolean; hoi: number; lich: boolean[] };
};

function VoKhongKiemSoat({ ghi }: { ghi: (mo: boolean) => void }) {
	return (
		<Dialog onOpenChange={ghi}>
			<DialogTrigger asChild>
				<Button>Mở hộp</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>Thêm KR</DialogTitle>
				<DialogDescription>Kết quả then chốt mới</DialogDescription>
				<Input aria-label="Tên" />
				<DialogClose asChild>
					<Button>Huỷ</Button>
				</DialogClose>
				<DialogClose asChild dongNgay>
					<Button>Lưu</Button>
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
}

describe("may-dong", () => {
	test("may-dong: da go roi bam Luu (cha dat open=false) thi dong, khong hoi lan nao", async () => {
		const lich: boolean[] = [];
		dung(<VoLuu ghi={(v) => lich.push(v)} />);
		await go(oTen(), "Hợp đồng");
		const theoDoi = theoDoiHopHoi();
		await bam(nutCo("Lưu"));
		khop(
			{ con: noiDung() !== null, tungHoi: theoDoi.thay(), goi: lich.length },
			{ con: false, tungHoi: false, goi: 0 },
			"may-dong: luu xong ma van hoi hoac khong dong",
		);
	});

	test("may-dong: mo lai sau khi luu la sach, bam lop phu dong ngay", async () => {
		const lich: boolean[] = [];
		dung(<VoLuu ghi={(v) => lich.push(v)} />);
		await go(oTen(), "Hợp đồng");
		await bam(nutCo("Lưu"));
		await bam(nutCo("Mở lại"));
		const moLai = noiDung() !== null;
		await bamLopPhu("dialog-overlay");
		khop(
			{ moLai, con: noiDung() !== null, lich, hoi: hopHoi().length },
			{ moLai: true, con: false, lich: [false], hoi: 0 },
			"may-dong: mo lai van ban",
		);
	});

	test("may-dong: bo roi mo lai ngay la sach, hop hoi khong loe len", async () => {
		const lich: boolean[] = [];
		dung(<VoLuu ghi={(v) => lich.push(v)} />);
		await go(oTen(), "Hợp đồng");
		await esc(oTen());
		await bam(nutCo("Bỏ"));
		const theoDoi = theoDoiHopHoi();
		await bam(nutCo("Mở lại"));
		const moLai = noiDung() !== null;
		await bamLopPhu("dialog-overlay");
		khop(
			{ moLai, con: noiDung() !== null, lich, tungHoi: theoDoi.thay() },
			{ moLai: true, con: false, lich: [false, false], tungHoi: false },
			"may-dong: mo lai van ban",
		);
	});

	test("may-dong: go Dialog khoi cay khi da go thi khong hoi, khong loi console", async () => {
		const lich: boolean[] = [];
		dung(<VoLuu ghi={(v) => lich.push(v)} />);
		await go(oTen(), "Hợp đồng");
		const theoDoi = theoDoiHopHoi();
		await act(async () => {
			root?.render(
				<LocaleProvider locale="vi">
					<p>Trang khác</p>
				</LocaleProvider>,
			);
		});
		await cho();
		khop(
			{
				con: noiDung() !== null,
				tungHoi: theoDoi.thay(),
				goi: lich.length,
				loi: loiConsole,
			},
			{ con: false, tungHoi: false, goi: 0, loi: [] },
			"may-dong: go khoi cay ma hoi hoac loi",
		);
	});

	test("may-dong: nut Luu boc DialogClose dongNgay thi dong khong hoi", async () => {
		const lich: boolean[] = [];
		dung(<VoLuu ghi={(v) => lich.push(v)} dongNgay />);
		await go(oTen(), "Hợp đồng");
		const theoDoi = theoDoiHopHoi();
		await bam(nutCo("Lưu"));
		khop(
			{ con: noiDung() !== null, tungHoi: theoDoi.thay(), lich },
			{ con: false, tungHoi: false, lich: [false] },
			"may-dong: dongNgay van hoi",
		);
	});

	test("may-dong: gui form khong xoa co thay doi, bam ngoai van giu", async () => {
		const lich: boolean[] = [];
		dung(<VoForm ghi={(v) => lich.push(v)} />);
		const o = oTen();
		await go(o, "Hợp đồng");
		await bam(nutCo("Lưu"));
		const loi = document.querySelector("[data-loi]")?.textContent;
		await bamLopPhu("dialog-overlay");
		const giu = noiDung() !== null;
		await esc(o);
		khop(
			{ loi, giu, chu: o.value, hoi: hopHoi().length, goi: lich.length },
			{ loi: "Máy chủ từ chối", giu: true, chu: "Hợp đồng", hoi: 1, goi: 0 },
			"may-dong: gui form lam mat co thay doi",
		);
	});

	test("may-dong: hop khong kiem soat, ma tran 4 ca viet truoc", async () => {
		const MONG_DOI: DongMaTran[] = [
			{ ca: "lop-phu", con: true, hoi: 0, lich: [true] },
			{
				ca: "esc",
				con: true,
				hoi: 1,
				lich: [true],
				sauBo: { con: false, hoi: 0, lich: [true, false] },
			},
			{ ca: "huy", con: true, hoi: 1, lich: [true] },
			{ ca: "luu-dongNgay", con: false, hoi: 0, lich: [true, false] },
		];
		const thucTe: DongMaTran[] = [];
		for (const ca of ["lop-phu", "esc", "huy", "luu-dongNgay"] as const) {
			const lich: boolean[] = [];
			dung(<VoKhongKiemSoat ghi={(v) => lich.push(v)} />);
			await bam(nutCo("Mở hộp"));
			await go(oTen(), "Hợp đồng");
			if (ca === "lop-phu") await bamLopPhu("dialog-overlay");
			if (ca === "esc") await esc(oTen());
			if (ca === "huy") await bam(nutCo("Huỷ"));
			if (ca === "luu-dongNgay") await bam(nutCo("Lưu"));
			const dong: DongMaTran = {
				ca,
				con: noiDung() !== null,
				hoi: hopHoi().length,
				lich: [...lich],
			};
			if (ca === "esc") {
				await bam(nutCo("Bỏ"));
				dong.sauBo = {
					con: noiDung() !== null,
					hoi: hopHoi().length,
					lich: [...lich],
				};
			}
			thucTe.push(dong);
			act(() => root?.unmount());
			root = null;
			document.body.innerHTML = "";
			document.body.removeAttribute("style");
		}
		khop(thucTe, MONG_DOI, "may-dong: hop khong kiem soat lech ma tran");
	});
});

const LUA_CHON = [
	{ value: "ban", label: "Bán hàng" },
	{ value: "kho", label: "Kho vận" },
];

function LopCon({ loai }: { loai: "select" | "combobox" | "date" }) {
	const [chon, datChon] = useState("");
	if (loai === "select") {
		return (
			<Select value={chon} onValueChange={datChon}>
				<SelectTrigger aria-label="Kiểu">
					<SelectValue placeholder="Chọn kiểu" />
				</SelectTrigger>
				<SelectContent>
					{LUA_CHON.map((l) => (
						<SelectItem key={l.value} value={l.value}>
							{l.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	}
	if (loai === "combobox") {
		return (
			<Combobox
				aria-label="Phòng ban"
				options={LUA_CHON}
				value={chon}
				onValueChange={datChon}
			/>
		);
	}
	return <DatePicker value={chon} onChange={datChon} />;
}

async function moLopCon(loai: "select" | "combobox" | "date") {
	if (loai === "select") {
		await moBangChuot(document.querySelector("[data-slot='select-trigger']"));
		return;
	}
	if (loai === "combobox") {
		await bam(document.querySelector("[data-slot='combobox-trigger']"));
		return;
	}
	await bam(document.querySelector("[data-slot='date-picker-trigger']"));
}

function lopConMo(loai: "select" | "combobox" | "date"): boolean {
	if (loai === "select") {
		return document.querySelector("[role='listbox']") !== null;
	}
	return document.querySelector("[data-slot='popover-content']") !== null;
}

describe("lop-con", () => {
	for (const loai of ["select", "combobox", "date"] as const) {
		test(`lop-con: ${loai} mo, Esc chi dong o con, Esc lan hai moi hoi`, async () => {
			const lich: boolean[] = [];
			dung(
				<Vo ghi={(v) => lich.push(v)}>
					<LopCon loai={loai} />
				</Vo>,
			);
			await go(oTen(), "Hợp đồng");
			await moLopCon(loai);
			const daMo = lopConMo(loai);
			await esc(document.activeElement);
			const sauMot = {
				daMo,
				conMo: lopConMo(loai),
				con: noiDung() !== null,
				hoi: hopHoi().length,
				goi: lich.length,
			};
			khop(
				sauMot,
				{ daMo: true, conMo: false, con: true, hoi: 0, goi: 0 },
				`lop-con: esc dong ca hop (${loai})`,
			);
			await esc(document.activeElement);
			khop(
				{ con: noiDung() !== null, hoi: hopHoi().length, goi: lich.length },
				{ con: true, hoi: 1, goi: 0 },
				`lop-con: bo giu chet sau khi o con dong (${loai})`,
			);
		});
	}
});

describe("tu-khai", () => {
	test("tu-khai: coThayDoi=true chua go thi bam ngoai khong dong, Esc hoi", async () => {
		const lich: boolean[] = [];
		dung(<Vo ghi={(v) => lich.push(v)} coThayDoi />);
		await bamLopPhu("dialog-overlay");
		const sauLopPhu = { con: noiDung() !== null, goi: lich.length };
		await esc(oTen());
		khop(
			{ sauLopPhu, hoi: hopHoi().length, goi: lich.length },
			{ sauLopPhu: { con: true, goi: 0 }, hoi: 1, goi: 0 },
			"tu-khai: bo qua coThayDoi=true",
		);
	});

	test("tu-khai: coThayDoi=false chua go thi dong ngay", async () => {
		const lich: boolean[] = [];
		dung(<Vo ghi={(v) => lich.push(v)} coThayDoi={false} />);
		await bamLopPhu("dialog-overlay");
		khop(
			{ con: noiDung() !== null, lich },
			{ con: false, lich: [false] },
			"tu-khai: coThayDoi=false chua go ma khong dong",
		);
	});

	test("tu-khai: coThayDoi=false nhung da go thi van giu", async () => {
		const lich: boolean[] = [];
		dung(<Vo ghi={(v) => lich.push(v)} coThayDoi={false} />);
		await go(oTen(), "Hợp đồng");
		await bamLopPhu("dialog-overlay");
		khop(
			{ con: noiDung() !== null, goi: lich.length },
			{ con: true, goi: 0 },
			"tu-khai: coThayDoi=false de len tu nhan",
		);
	});
});

async function goCombobox() {
	await bam(document.querySelector("[data-slot='combobox-trigger']"));
	const loc = document.querySelector(
		"[data-slot='popover-content'] input[role='combobox']",
	) as HTMLInputElement;
	if (!loc) throw new Error("khong thay o loc cua Combobox");
	await go(loc, "kho");
	await esc(document.activeElement);
}

describe("o-loc", () => {
	test("o-loc: (1) chi go vao input[type=search] thi bam ngoai dong", async () => {
		const lich: boolean[] = [];
		dung(
			<Vo ghi={(v) => lich.push(v)}>
				<Input type="search" aria-label="Tìm" />
			</Vo>,
		);
		await go(
			document.querySelector("input[type='search']") as HTMLInputElement,
			"hợp",
		);
		await bamLopPhu("dialog-overlay");
		khop(
			{ con: noiDung() !== null, lich },
			{ con: false, lich: [false] },
			"o-loc: giu vi o tim (search)",
		);
	});

	test("o-loc: (2) chi go vao o loc cua Combobox (role=combobox, trong portal) thi dong", async () => {
		const lich: boolean[] = [];
		dung(
			<Vo ghi={(v) => lich.push(v)}>
				<LopCon loai="combobox" />
			</Vo>,
		);
		await goCombobox();
		await bamLopPhu("dialog-overlay");
		khop(
			{ con: noiDung() !== null, lich, loi: loiConsole },
			{ con: false, lich: [false], loi: [] },
			"o-loc: giu vi o loc (combobox)",
		);
	});

	test("o-loc: (3) chi go vao CommandInput cua Command thi dong", async () => {
		const lich: boolean[] = [];
		dung(
			<Vo ghi={(v) => lich.push(v)}>
				<Command>
					<CommandInput placeholder="Tìm lệnh" />
					<CommandList>
						<CommandEmpty>Không khớp</CommandEmpty>
						<CommandGroup>
							<CommandItem>Tạo KR</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</Vo>,
		);
		await go(
			document.querySelector("[data-slot='command-input']") as HTMLInputElement,
			"tạo",
		);
		await bamLopPhu("dialog-overlay");
		khop(
			{ con: noiDung() !== null, lich },
			{ con: false, lich: [false] },
			"o-loc: giu vi o loc (command)",
		);
	});

	test("o-loc: (4) giuThayDoi={false} thi go vao Input thuong van dong", async () => {
		const lich: boolean[] = [];
		dung(<Vo ghi={(v) => lich.push(v)} giuThayDoi={false} />);
		await go(oTen(), "Hợp đồng");
		await bamLopPhu("dialog-overlay");
		khop(
			{ con: noiDung() !== null, lich },
			{ con: false, lich: [false] },
			"o-loc: giu du giuThayDoi=false",
		);
	});

	test("o-loc: o nam trong [data-khong-giu] thi dong", async () => {
		const lich: boolean[] = [];
		dung(
			<Vo ghi={(v) => lich.push(v)}>
				<div data-khong-giu>
					<Input aria-label="Ghi chú tạm" />
				</div>
			</Vo>,
		);
		await go(
			document.querySelector(
				"input[aria-label='Ghi chú tạm']",
			) as HTMLInputElement,
			"nháp",
		);
		await bamLopPhu("dialog-overlay");
		khop(
			{ con: noiDung() !== null, lich },
			{ con: false, lich: [false] },
			"o-loc: giu du o nam trong data-khong-giu",
		);
	});

	test("o-loc: (4) Sheet giuThayDoi={false} thi go vao Input thuong van dong", async () => {
		const lich: boolean[] = [];
		dung(<VoSheet ghi={(v) => lich.push(v)} giuThayDoi={false} />);
		await go(oTrong("sheet-content", "Tên"), "Hợp đồng");
		await bamLopPhu("sheet-overlay");
		khop(
			{ con: co("sheet-content"), lich },
			{ con: false, lich: [false] },
			"o-loc: giu du giuThayDoi=false (sheet)",
		);
	});

	test("o-loc: (4) Drawer giuThayDoi={false} thi go vao Input thuong van dong", async () => {
		const lich: boolean[] = [];
		dung(<VoDrawer ghi={(v) => lich.push(v)} giuThayDoi={false} />);
		await go(oTrong("drawer-content", "Tên"), "Hợp đồng");
		const dismissible = propGocVaul().dismissible;
		await bamLopPhu("drawer-overlay");
		khop(
			{ dismissible, con: co("drawer-content"), lich },
			{ dismissible: undefined, con: false, lich: [false] },
			"o-loc: giu du giuThayDoi=false (drawer)",
		);
	});

	test("o-loc: (5) PickListDialog that, go vao o tim thi bam ngoai dong", async () => {
		const lich: boolean[] = [];
		dung(<VoPickList ghi={(v) => lich.push(v)} />);
		await go(
			document.querySelector(
				"[data-slot='pick-list-dialog'] input[aria-label='Tìm theo tên']",
			) as HTMLInputElement,
			"bình",
		);
		await bamLopPhu("dialog-overlay");
		khop(
			{
				con: document.querySelector("[data-slot='pick-list-dialog']") !== null,
				lich,
			},
			{ con: false, lich: [false] },
			"o-loc: (5) PickListDialog giu vi o tim",
		);
	});

	test("o-loc: lat thang trong o ngay (select goc cua lich) thi bam ngoai van dong", async () => {
		const lich: boolean[] = [];
		dung(
			<Vo ghi={(v) => lich.push(v)}>
				<LopCon loai="date" />
			</Vo>,
		);
		await moLopCon("date");
		const thang = document.querySelector(
			"[data-slot='popover-content'] select[aria-label='Chọn tháng']",
		) as HTMLSelectElement | null;
		if (!thang) throw new Error("khong thay o chon thang trong lich");
		const thangDau = thang.value;
		await act(async () => {
			thang.focus();
			thang.value = String((Number(thangDau) + 1) % 12);
			thang.dispatchEvent(new Event("input", { bubbles: true }));
			thang.dispatchEvent(new Event("change", { bubbles: true }));
		});
		await cho();
		const daLat = thang.value !== thangDau;
		await esc(document.activeElement);
		const lichDong = !lopConMo("date");
		await bamLopPhu("dialog-overlay");
		khop(
			{ daLat, lichDong, con: noiDung() !== null, lich },
			{ daLat: true, lichDong: true, con: false, lich: [false] },
			"o-loc: lat thang trong o ngay danh dau hop",
		);
	});

	test("o-loc: doi chung — go vao Input thuong, giuThayDoi mac dinh thi giu", async () => {
		const lich: boolean[] = [];
		dung(
			<Vo ghi={(v) => lich.push(v)}>
				<Input type="search" aria-label="Tìm" />
			</Vo>,
		);
		await go(oTen(), "Hợp đồng");
		await bamLopPhu("dialog-overlay");
		khop(
			{ con: noiDung() !== null, goi: lich.length },
			{ con: true, goi: 0 },
			"o-loc: doi chung khong giu",
		);
	});
});

function VoPickList({ ghi }: { ghi: (mo: boolean) => void }) {
	const [mo, datMo] = useState(true);
	const [chon, datChon] = useState<string[]>([]);
	return (
		<PickListDialog
			open={mo}
			onOpenChange={(v) => {
				ghi(v);
				datMo(v);
			}}
			title="Thêm người"
			description="Chọn người vào phòng ban"
			searchPlaceholder="Tìm theo tên"
			items={[
				{ id: "a", label: "An" },
				{ id: "b", label: "Bình" },
			]}
			selected={chon}
			onSelectedChange={datChon}
			confirmLabel={(n) => `Thêm ${n} người`}
			cancelLabel="Huỷ"
			emptyLabel="Không còn ai để thêm"
			onConfirm={() => {}}
		/>
	);
}

function oTrong(slot: string, nhan: string): HTMLInputElement {
	const o = document.querySelector(
		`[data-slot='${slot}'] [aria-label='${nhan}']`,
	) as HTMLInputElement | null;
	if (!o) throw new Error(`khong thay o ${nhan} trong ${slot}`);
	return o;
}

function co(slot: string): boolean {
	return document.querySelector(`[data-slot='${slot}']`) !== null;
}

function nutX(slot: string): HTMLButtonElement | null {
	return (
		[
			...document.querySelectorAll<HTMLButtonElement>(
				`[data-slot='${slot}'] button`,
			),
		].find((b) => b.querySelector(".sr-only")?.textContent === "Đóng") ?? null
	);
}

function goKhoiCay() {
	act(() => root?.unmount());
	root = null;
	khung?.remove();
	khung = null;
	document.body.innerHTML = "";
	document.body.removeAttribute("style");
}

function VoSheet({
	ghi,
	giuThayDoi,
}: {
	ghi: (mo: boolean) => void;
	giuThayDoi?: boolean;
}) {
	const [mo, datMo] = useState(true);
	return (
		<Sheet
			open={mo}
			onOpenChange={(v) => {
				ghi(v);
				datMo(v);
			}}
			giuThayDoi={giuThayDoi}
		>
			<SheetContent>
				<SheetTitle>Tạo thoả thuận</SheetTitle>
				<SheetDescription>Thoả thuận mới</SheetDescription>
				<Input aria-label="Tên" />
				<SheetClose asChild>
					<Button>Huỷ</Button>
				</SheetClose>
			</SheetContent>
		</Sheet>
	);
}

const DUONG_SHEET = ["lop-phu", "esc", "x", "nut-sheet-close"] as const;

type DongSheet = {
	duong: (typeof DUONG_SHEET)[number];
	trangThai: "da-go" | "chua-go";
	mo: boolean;
	hoi: boolean;
	goi: number;
};

const BANG_SHEET: DongSheet[] = [
	{ duong: "lop-phu", trangThai: "da-go", mo: true, hoi: false, goi: 0 },
	{ duong: "esc", trangThai: "da-go", mo: true, hoi: true, goi: 0 },
	{ duong: "x", trangThai: "da-go", mo: true, hoi: true, goi: 0 },
	{ duong: "nut-sheet-close", trangThai: "da-go", mo: true, hoi: true, goi: 0 },
	{ duong: "lop-phu", trangThai: "chua-go", mo: false, hoi: false, goi: 1 },
	{ duong: "esc", trangThai: "chua-go", mo: false, hoi: false, goi: 1 },
	{ duong: "x", trangThai: "chua-go", mo: false, hoi: false, goi: 1 },
	{
		duong: "nut-sheet-close",
		trangThai: "chua-go",
		mo: false,
		hoi: false,
		goi: 1,
	},
];

async function diDuongSheet(duong: (typeof DUONG_SHEET)[number]) {
	if (duong === "lop-phu") {
		await bamLopPhu("sheet-overlay");
		return;
	}
	if (duong === "esc") {
		await esc(oTrong("sheet-content", "Tên"));
		return;
	}
	if (duong === "x") {
		await bam(nutX("sheet-content"));
		return;
	}
	await bam(nutCo("Huỷ"));
}

describe("sheet-ma-tran", () => {
	test("sheet-ma-tran: 4 duong x 2 trang thai khop bang viet truoc", async () => {
		const thucTe: DongSheet[] = [];
		for (const trangThai of ["da-go", "chua-go"] as const) {
			for (const duong of DUONG_SHEET) {
				const lich: boolean[] = [];
				dung(<VoSheet ghi={(v) => lich.push(v)} />);
				if (trangThai === "da-go") {
					await go(oTrong("sheet-content", "Tên"), "Hợp đồng");
				} else {
					await cho();
				}
				await diDuongSheet(duong);
				thucTe.push({
					duong,
					trangThai,
					mo: co("sheet-content"),
					hoi: hopHoi().length > 0,
					goi: lich.length,
				});
				goKhoiCay();
			}
		}
		const lech = thucTe
			.filter((d, i) => !Bun.deepEquals(d, BANG_SHEET[i]))
			.map((d) => `${d.duong} · ${d.trangThai}`);
		khop(
			thucTe,
			BANG_SHEET,
			`sheet-ma-tran: lech bang viet truoc o ${lech.join(", ")}`,
		);
	});
});

describe("sheet-dong-ngay", () => {
	test("sheet-dong-ngay: da go, nut Luu boc SheetClose dongNgay thi dong khong hoi", async () => {
		const lich: boolean[] = [];
		dung(
			<Sheet
				defaultOpen
				onOpenChange={(v) => {
					lich.push(v);
				}}
			>
				<SheetContent>
					<SheetTitle>Tạo thoả thuận</SheetTitle>
					<SheetDescription>Thoả thuận mới</SheetDescription>
					<Input aria-label="Tên" />
					<SheetClose asChild dongNgay>
						<Button>Lưu</Button>
					</SheetClose>
				</SheetContent>
			</Sheet>,
		);
		await go(oTrong("sheet-content", "Tên"), "Hợp đồng");
		const theoDoi = theoDoiHopHoi();
		await bam(nutCo("Lưu"));
		khop(
			{ mo: co("sheet-content"), tungHoi: theoDoi.thay(), lich },
			{ mo: false, tungHoi: false, lich: [false] },
			"sheet-dong-ngay: dongNgay van hoi",
		);
	});
});

function SheetCoHop({
	ghiNgan,
	ghiHop,
}: {
	ghiNgan: (mo: boolean) => void;
	ghiHop: (mo: boolean) => void;
}) {
	const [moNgan, datMoNgan] = useState(true);
	const [moHop, datMoHop] = useState(false);
	return (
		<Sheet
			open={moNgan}
			onOpenChange={(v) => {
				ghiNgan(v);
				datMoNgan(v);
			}}
		>
			<SheetContent>
				<SheetTitle>Mục tiêu</SheetTitle>
				<SheetDescription>Ngăn bản ghi</SheetDescription>
				<Button onClick={() => datMoHop(true)}>Mở hộp KR</Button>
				<Dialog
					open={moHop}
					onOpenChange={(v) => {
						ghiHop(v);
						datMoHop(v);
					}}
				>
					<DialogContent>
						<DialogTitle>Thêm KR</DialogTitle>
						<DialogDescription>Kết quả then chốt mới</DialogDescription>
						<Input aria-label="Tên" />
					</DialogContent>
				</Dialog>
			</SheetContent>
		</Sheet>
	);
}

describe("long-nhau", () => {
	test("long-nhau: Dialog trong Sheet — Esc chi hoi cho Dialog, Sheet van sach", async () => {
		const ngan: boolean[] = [];
		const hop: boolean[] = [];
		dung(
			<SheetCoHop ghiNgan={(v) => ngan.push(v)} ghiHop={(v) => hop.push(v)} />,
		);
		await bam(nutCo("Mở hộp KR"));
		await go(oTen(), "Hợp đồng");
		await esc(oTen());
		khop(
			{
				hoi: hopHoi().length,
				hopCon: noiDung() !== null,
				nganCon: co("sheet-content"),
				ngan: [...ngan],
				hop: [...hop],
			},
			{ hoi: 1, hopCon: true, nganCon: true, ngan: [], hop: [] },
			"long-nhau: esc trong hop con khong chi hoi cho hop con",
		);
		await bam(nutCo("Bỏ"));
		const sauBo = {
			hoi: hopHoi().length,
			hopCon: noiDung() !== null,
			nganCon: co("sheet-content"),
			hop: [...hop],
		};
		await bamLopPhu("sheet-overlay");
		khop(
			{ sauBo, nganCon: co("sheet-content"), ngan },
			{
				sauBo: { hoi: 0, hopCon: false, nganCon: true, hop: [false] },
				nganCon: false,
				ngan: [false],
			},
			"long-nhau: go trong hop con danh dau ca ngan cha",
		);
	});
});

function VoDrawer({
	ghi,
	giuThayDoi,
	children,
}: {
	ghi: (mo: boolean) => void;
	giuThayDoi?: boolean;
	children?: ReactNode;
}) {
	const [mo, datMo] = useState(true);
	return (
		<Drawer
			open={mo}
			onOpenChange={(v) => {
				ghi(v);
				datMo(v);
			}}
			giuThayDoi={giuThayDoi}
		>
			<DrawerContent>
				<DrawerTitle>Trao đổi</DrawerTitle>
				<DrawerDescription>Ghi chú của bản ghi</DrawerDescription>
				<Textarea aria-label="Trao đổi" />
				<Input aria-label="Tên" />
				<DrawerClose asChild>
					<Button>Huỷ</Button>
				</DrawerClose>
				<DrawerClose asChild dongNgay>
					<Button>Lưu</Button>
				</DrawerClose>
				{children}
			</DrawerContent>
		</Drawer>
	);
}

type GocVaul = ComponentProps<typeof DrawerVaul.Root>;

type SoiFiber = {
	type: object | string | null;
	child: SoiFiber | null;
	sibling: SoiFiber | null;
	stateNode: { current?: SoiFiber } | null;
	memoizedProps: GocVaul;
};

function propGocVaul(): GocVaul {
	if (!khung) throw new Error("chua dung cay React");
	const khoa = Object.keys(khung).find((k) =>
		k.startsWith("__reactContainer$"),
	);
	const goc: SoiFiber | null = khoa ? Reflect.get(khung, khoa) : null;
	const ngan: SoiFiber[] = goc?.stateNode?.current
		? [goc.stateNode.current]
		: [];
	for (let f = ngan.pop(); f; f = ngan.pop()) {
		if (f.type === DrawerVaul.Root) return f.memoizedProps;
		if (f.sibling) ngan.push(f.sibling);
		if (f.child) ngan.push(f.child);
	}
	throw new Error("khong thay goc vaul trong cay React hien tai");
}

function suKienKeo(): Parameters<NonNullable<GocVaul["onDrag"]>>[0] {
	return new PointerEvent("pointermove", {
		bubbles: true,
	}) as unknown as Parameters<NonNullable<GocVaul["onDrag"]>>[0];
}

async function keoQuaGoc(tiLe: number) {
	const goc = propGocVaul();
	await act(async () => {
		goc.onDrag?.(suKienKeo(), tiLe / 2);
		goc.onDrag?.(suKienKeo(), tiLe);
		goc.onRelease?.(suKienKeo(), false);
	});
	await cho();
}

const CHO_VAUL_MO_MS = 550;

async function choVaulMo() {
	await act(async () => {
		await new Promise((xong) => setTimeout(xong, CHO_VAUL_MO_MS));
	});
}

const CAO_DRAWER_PX = 600;

async function keoThat(buoc: [number, number][], tay?: Element | null) {
	const noi = document.querySelector(
		"[data-slot='drawer-content']",
	) as HTMLElement | null;
	if (!noi) throw new Error("khong thay noi dung drawer");
	const dich = tay ?? noi.firstElementChild ?? noi;
	const suKien = (loai: string, [dx, dy]: [number, number]) =>
		new PointerEvent(loai, {
			bubbles: true,
			button: 0,
			pointerId: 1,
			pointerType: "mouse",
			clientX: 100 + dx,
			clientY: 100 + dy,
		});
	const goc = window.getComputedStyle;
	window.getComputedStyle = (el, gia) =>
		new Proxy(goc.call(window, el, gia), {
			get: (kieu, khoa) => {
				if (khoa === "transform") return maTran(kieu.transform);
				const v = Reflect.get(kieu, khoa);
				return v instanceof Function ? v.bind(kieu) : v;
			},
		});
	noi.getBoundingClientRect = () => new DOMRect(0, 0, 390, CAO_DRAWER_PX);
	const cuoi = buoc.at(-1) ?? [0, 0];
	const chuoi: [string, [number, number]][] = [
		["pointerdown", [0, 0]],
		...buoc.map((b): [string, [number, number]] => ["pointermove", b]),
		["pointerup", cuoi],
	];
	try {
		for (const [loai, diem] of chuoi) {
			await act(async () => {
				dich.dispatchEvent(suKien(loai, diem));
			});
		}
	} finally {
		window.getComputedStyle = goc;
		Reflect.deleteProperty(noi, "getBoundingClientRect");
	}
	await cho();
}

const KEO_300: [number, number][] = [
	[0, 150],
	[0, 300],
];

function maTran(bien: string): string {
	const m = bien.match(
		/^translate3d\((-?[\d.]+)(?:px)?, (-?[\d.]+)(?:px)?, -?[\d.]+(?:px)?\)$/,
	);
	return m ? `matrix(1, 0, 0, 1, ${m[1]}, ${m[2]})` : bien;
}

function soDrawer(lich: boolean[]) {
	return {
		mo: co("drawer-content"),
		chu: document.querySelector<HTMLTextAreaElement>(
			"[data-slot='drawer-content'] [aria-label='Trao đổi']",
		)?.value,
		hoi: hopHoi().length,
		goi: lich.length,
	};
}

describe("drawer", () => {
	test("drawer: da go · bam lop phu thi giu, chu con, khong hoi", async () => {
		const lich: boolean[] = [];
		dung(<VoDrawer ghi={(v) => lich.push(v)} />);
		await go(oTrong("drawer-content", "Trao đổi"), "Gọi lại thứ Hai");
		await bamLopPhu("drawer-overlay");
		khop(
			soDrawer(lich),
			{ mo: true, chu: "Gọi lại thứ Hai", hoi: 0, goi: 0 },
			"drawer: bam lop phu da go ma khong giu",
		);
	});

	test("drawer: da go · Esc thi hoi, khong goi dong", async () => {
		const lich: boolean[] = [];
		dung(<VoDrawer ghi={(v) => lich.push(v)} />);
		const o = oTrong("drawer-content", "Trao đổi");
		await go(o, "Gọi lại thứ Hai");
		await esc(o);
		khop(
			soDrawer(lich),
			{ mo: true, chu: "Gọi lại thứ Hai", hoi: 1, goi: 0 },
			"drawer: esc da go khong hoi",
		);
	});

	test("drawer: da go · goc vaul nhan dismissible=false, onRelease qua nguong (qua onDrag) thi hoi", async () => {
		const lich: boolean[] = [];
		dung(<VoDrawer ghi={(v) => lich.push(v)} />);
		await cho();
		const truoc = propGocVaul().dismissible;
		await go(oTrong("drawer-content", "Trao đổi"), "Gọi lại thứ Hai");
		const sau = propGocVaul().dismissible;
		await keoQuaGoc(0.4);
		khop(
			{ truoc, sau, ...soDrawer(lich) },
			{
				truoc: undefined,
				sau: false,
				mo: true,
				chu: "Gọi lại thứ Hai",
				hoi: 1,
				goi: 0,
			},
			"drawer: onRelease qua nguong ma khong hoi",
		);
	});

	test("drawer: da go · onRelease duoi nguong thi khong hoi", async () => {
		const lich: boolean[] = [];
		dung(<VoDrawer ghi={(v) => lich.push(v)} />);
		await go(oTrong("drawer-content", "Trao đổi"), "Gọi lại thứ Hai");
		await keoQuaGoc(0.1);
		khop(
			soDrawer(lich),
			{ mo: true, chu: "Gọi lại thứ Hai", hoi: 0, goi: 0 },
			"drawer: keo duoi nguong ma hoi",
		);
	});

	test("drawer: da go · keo that qua nguong thi hoi, drawer con, Tiep tuc sua ve cho cu", async () => {
		const lich: boolean[] = [];
		dung(<VoDrawer ghi={(v) => lich.push(v)} />);
		await choVaulMo();
		await go(oTrong("drawer-content", "Trao đổi"), "Gọi lại thứ Hai");
		await keoThat(KEO_300);
		const sauKeo = soDrawer(lich);
		khop(
			sauKeo,
			{ mo: true, chu: "Gọi lại thứ Hai", hoi: 1, goi: 0 },
			sauKeo.mo
				? "drawer: vuot qua nguong ma khong hoi (keo that)"
				: "drawer: dong khi vuot da go",
		);
		await bam(nutCo("Tiếp tục sửa"));
		khop(
			soDrawer(lich),
			{ mo: true, chu: "Gọi lại thứ Hai", hoi: 0, goi: 0 },
			"drawer: tiep tuc sua sau khi vuot lam mat drawer",
		);
	});

	test("drawer: da go · keo that khong du nguong hoac sai huong thi khong hoi", async () => {
		const CA: { ca: string; buoc: [number, number][] }[] = [
			{
				ca: "xuong-100",
				buoc: [
					[0, 50],
					[0, 100],
				],
			},
			{
				ca: "ngang-300",
				buoc: [
					[150, 0],
					[300, 0],
				],
			},
			{
				ca: "len-300",
				buoc: [
					[0, -150],
					[0, -300],
				],
			},
			{
				ca: "len-roi-xuong-300",
				buoc: [
					[0, -20],
					[0, 150],
					[0, 300],
				],
			},
			{ ca: "bam-nut-thuong", buoc: [] },
		];
		const thucTe: { ca: string; mo: boolean; hoi: number; goi: number }[] = [];
		for (const { ca, buoc } of CA) {
			const lich: boolean[] = [];
			dung(
				<VoDrawer ghi={(v) => lich.push(v)}>
					<Button>Đính kèm</Button>
				</VoDrawer>,
			);
			await choVaulMo();
			await go(oTrong("drawer-content", "Trao đổi"), "Gọi lại thứ Hai");
			if (ca === "bam-nut-thuong") {
				const nut = nutCo("Đính kèm");
				await keoThat(buoc, nut);
				await bam(nut);
			} else {
				await keoThat(buoc);
			}
			thucTe.push({
				ca,
				mo: co("drawer-content"),
				hoi: hopHoi().length,
				goi: lich.length,
			});
			goKhoiCay();
		}
		const lech = thucTe.filter((d) => d.hoi !== 0 || !d.mo).map((d) => d.ca);
		khop(
			thucTe,
			CA.map(({ ca }) => ({ ca, mo: true, hoi: 0, goi: 0 })),
			`drawer: keo that khong qua nguong ma hoi (${lech.join(", ")})`,
		);
	});

	test("drawer: da go · keo trong hop con mo tu drawer thi drawer khong hoi", async () => {
		const lich: boolean[] = [];
		const hop: boolean[] = [];
		dung(
			<VoDrawer ghi={(v) => lich.push(v)}>
				<Dialog defaultOpen onOpenChange={(v) => hop.push(v)}>
					<DialogContent>
						<DialogTitle>Thêm KR</DialogTitle>
						<DialogDescription>Kết quả then chốt mới</DialogDescription>
						<p data-vung-keo>Kéo ở đây</p>
					</DialogContent>
				</Dialog>
			</VoDrawer>,
		);
		await choVaulMo();
		await go(oTrong("drawer-content", "Trao đổi"), "Gọi lại thứ Hai");
		await keoThat(KEO_300, document.querySelector("[data-vung-keo]"));
		khop(
			{
				hoi: hopHoi().length,
				hopCon: noiDung() !== null,
				drawerCon: co("drawer-content"),
				lich,
				hop,
			},
			{ hoi: 0, hopCon: true, drawerCon: true, lich: [], hop: [] },
			"drawer: keo trong hop con lam drawer hoi",
		);
	});

	test("drawer: da go · DrawerClose khong dongNgay thi hoi, co dongNgay thi dong", async () => {
		const thucTe: { nut: string; mo: boolean; hoi: number; lich: boolean[] }[] =
			[];
		for (const nut of ["Huỷ", "Lưu"]) {
			const lich: boolean[] = [];
			dung(<VoDrawer ghi={(v) => lich.push(v)} />);
			await go(oTrong("drawer-content", "Trao đổi"), "Gọi lại thứ Hai");
			await bam(nutCo(nut));
			thucTe.push({
				nut,
				mo: co("drawer-content"),
				hoi: hopHoi().length,
				lich: [...lich],
			});
			goKhoiCay();
		}
		khop(
			thucTe,
			[
				{ nut: "Huỷ", mo: true, hoi: 1, lich: [] },
				{ nut: "Lưu", mo: false, hoi: 0, lich: [false] },
			],
			"drawer: DrawerClose lech ma tran",
		);
	});

	test("drawer: chua go · lop phu, Esc, keo that deu dong, moi duong goi mot lan", async () => {
		const thucTe: {
			duong: string;
			mo: boolean;
			hoi: number;
			lich: boolean[];
		}[] = [];
		for (const duong of ["lop-phu", "esc", "vuot"] as const) {
			const lich: boolean[] = [];
			dung(<VoDrawer ghi={(v) => lich.push(v)} />);
			if (duong === "vuot") await choVaulMo();
			else await cho();
			if (duong === "lop-phu") await bamLopPhu("drawer-overlay");
			if (duong === "esc") await esc(oTrong("drawer-content", "Trao đổi"));
			if (duong === "vuot") await keoThat(KEO_300);
			thucTe.push({
				duong,
				mo: co("drawer-content"),
				hoi: hopHoi().length,
				lich: [...lich],
			});
			goKhoiCay();
		}
		khop(
			thucTe,
			[
				{ duong: "lop-phu", mo: false, hoi: 0, lich: [false] },
				{ duong: "esc", mo: false, hoi: 0, lich: [false] },
				{ duong: "vuot", mo: false, hoi: 0, lich: [false] },
			],
			"drawer: chua go ma khong dong",
		);
	});
});
