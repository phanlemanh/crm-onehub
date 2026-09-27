import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
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
import { Input } from "../src/components/input";
import { LocaleProvider } from "../src/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../src/components/select";

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
			con
				? `bam-ngoai: bam ngoai ma hoi lai (hoi=${hoi}, onOpenChange goi ${lich.length} lan)`
				: `bam-ngoai: hop dong du da go (onOpenChange goi ${lich.length} lan)`,
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
	sauBo?: { con: boolean; hoi: number };
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
			{ ca: "lop-phu", con: true, hoi: 0 },
			{ ca: "esc", con: true, hoi: 1, sauBo: { con: false, hoi: 0 } },
			{ ca: "huy", con: true, hoi: 1 },
			{ ca: "luu-dongNgay", con: false, hoi: 0 },
		];
		const thucTe: DongMaTran[] = [];
		for (const ca of ["lop-phu", "esc", "huy", "luu-dongNgay"] as const) {
			dung(<VoKhongKiemSoat ghi={() => {}} />);
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
			};
			if (ca === "esc") {
				await bam(nutCo("Bỏ"));
				dong.sauBo = { con: noiDung() !== null, hoi: hopHoi().length };
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
