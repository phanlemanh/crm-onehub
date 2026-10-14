import { afterEach, describe, expect, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { toast } from "sonner";

const { Toaster } = await import("@crm/ui/components/sonner");
const { formatCount } = await import("@crm/ui/lib/format");
const { crmMessages } = await import("@/lib/messages/crm");
const { contactMessages } = await import("@/lib/messages/contacts");
const { companyMessages } = await import("@/lib/messages/companies");
const { dealMessages } = await import("@/lib/messages/deals");
const { baoLuuTruLoat, baoHoanTacLoat } = await import(
	"@/components/crm/bulk-actions"
);

type Loai = "contact" | "company" | "deal";
const LOAI: Loai[] = ["contact", "company", "deal"];
const LOI_THO = "loi-tho-may-chu";
const VI = crmMessages("vi");

type KetQua = {
	requested: number;
	succeeded: number;
	skipped: number;
	failed: number;
	errored: number;
	message: string | null;
	changedIds: string[];
};

let root: Root | null = null;

function ve(): void {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() => root?.render(<Toaster />));
}

async function don(): Promise<void> {
	act(() => {
		toast.dismiss();
	});
	await nhip(3);
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
}

afterEach(don);

async function nhip(lan = 5): Promise<void> {
	for (let i = 0; i < lan; i += 1)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
}

async function cho(dieu: () => boolean, moTa: string): Promise<void> {
	for (let i = 0; i < 150; i += 1) {
		if (dieu()) return;
		await nhip(1);
	}
	throw new Error(`khong toi: ${moTa} — ${vungToast().slice(0, 300)}`);
}

function chot(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

const vungToast = () =>
	document.querySelector("[data-sonner-toaster]")?.textContent ?? "";

const toastKieu = (kieu: string) => [
	...document.querySelectorAll(
		`[data-sonner-toast][data-type=${kieu}]:not([data-removed="true"])`,
	),
];

const coNutHoanTac = () =>
	[...document.querySelectorAll("[data-sonner-toast] button")].some(
		(b) => (b.textContent ?? "").trim() === VI.sheet.hoanTac,
	);

function dem(loai: Loai, n: number, locale: Locale): string {
	if (loai === "contact")
		return formatCount(n, contactMessages(locale).noun, locale);
	if (loai === "company") {
		const m = companyMessages(locale);
		return formatCount(n, m.noun, locale, m.nounPlural);
	}
	return formatCount(n, dealMessages(locale).noun, locale);
}

const chuLuuTru = (loai: Loai, n: number, l: Locale) =>
	loai === "contact"
		? contactMessages(l).bulk.archived(dem(loai, n, l))
		: loai === "company"
			? companyMessages(l).bulk.archived(dem(loai, n, l))
			: dealMessages(l).bulk.archived(dem(loai, n, l));

const chuKhoiPhuc = (loai: Loai, n: number, l: Locale) =>
	loai === "contact"
		? contactMessages(l).bulk.restored(dem(loai, n, l))
		: loai === "company"
			? companyMessages(l).bulk.restored(dem(loai, n, l))
			: dealMessages(l).bulk.restored(dem(loai, n, l));

function ketQua(phan: Partial<KetQua>): KetQua {
	return {
		requested: 0,
		succeeded: 0,
		skipped: 0,
		failed: 0,
		errored: 0,
		message: null,
		changedIds: [],
		...phan,
	};
}

function luuTru(loai: Loai, kq: KetQua | Omit<KetQua, "errored">): void {
	act(() =>
		baoLuuTruLoat({
			result: kq as KetQua,
			done: (n) => chuLuuTru(loai, n, "vi"),
			locale: "vi",
			onHoanTac: () => {},
		}),
	);
}

function hoanTac(loai: Loai, kq: KetQua | Omit<KetQua, "errored">): void {
	act(() =>
		baoHoanTacLoat({
			result: kq as KetQua,
			restored: (n) => chuKhoiPhuc(loai, n, "vi"),
			locale: "vi",
		}),
	);
}

describe("hlb-luu-tru-loi", () => {
	test("hlb-luu-tru-loi: ma tran 3 loai x 3 ca — loi may chu khong hien thanh bi bo qua", async () => {
		const o: string[] = [];
		for (const loai of LOAI) {
			ve();
			luuTru(
				loai,
				ketQua({
					requested: 5,
					succeeded: 2,
					skipped: 1,
					failed: 2,
					errored: 1,
					message: LOI_THO,
					changedIds: ["a", "b"],
				}),
			);
			await cho(
				() => vungToast().includes(chuLuuTru(loai, 2, "vi")),
				`${loai}/le`,
			);
			chot(
				vungToast().includes(VI.bulk.boQua("2")),
				"hlb: loi may chu hien thanh bi bo qua",
			);
			chot(
				vungToast().includes(VI.bulk.chuaLuuTru("1")),
				"hlb: thieu chu chua luu tru",
			);
			chot(!vungToast().includes(LOI_THO), "hlb: toast in loi tho");
			expect(`${loai}/le:${coNutHoanTac()}`).toBe(`${loai}/le:true`);
			o.push(`${loai}/le`);
			await don();

			ve();
			luuTru(
				loai,
				ketQua({
					requested: 3,
					failed: 3,
					errored: 3,
					message: LOI_THO,
				}),
			);
			await cho(() => toastKieu("error").length > 0, `${loai}/het`);
			const chuLoi = toastKieu("error")[0]?.textContent ?? "";
			chot(
				chuLoi.includes(VI.bulk.chuaLuuTru("3")),
				"hlb: thieu chu chua luu tru",
			);
			chot(
				!vungToast().includes("bị bỏ qua"),
				"hlb: loi may chu hien thanh bi bo qua",
			);
			chot(!vungToast().includes(LOI_THO), "hlb: toast in loi tho");
			expect(`${loai}/het:${coNutHoanTac()}`).toBe(`${loai}/het:false`);
			o.push(`${loai}/het`);
			await don();

			ve();
			luuTru(loai, ketQua({ requested: 3, skipped: 1, failed: 2, errored: 1 }));
			await cho(
				() => toastKieu("error").length > 0 || toastKieu("warning").length > 0,
				`${loai}/tron`,
			);
			chot(
				toastKieu("error").length > 0,
				"hlb: lo tron khong co loi bao canh bao",
			);
			const chuTron = toastKieu("error")[0]?.textContent ?? "";
			expect(
				`${loai}/tron:${chuTron.includes(VI.bulk.boQua("2"))}:${chuTron.includes(VI.bulk.chuaLuuTru("1"))}:${coNutHoanTac()}`,
			).toBe(`${loai}/tron:true:true:false`);
			o.push(`${loai}/tron`);
			await don();
		}
		expect(o.length).toBe(9);
	});
});

describe("hlb-hoan-tac-da-ve", () => {
	test("hlb-hoan-tac-da-ve: ma tran 3 loai x 2 ca — moi ban da ve thi bao da khoi phuc tu truoc", async () => {
		const o: string[] = [];
		for (const loai of LOAI) {
			ve();
			hoanTac(loai, ketQua({ requested: 3, skipped: 3 }));
			await cho(() => vungToast().length > 0, `${loai}/da-ve`);
			chot(
				!vungToast().includes(VI.bulk.hoanTacLoi),
				"hlb: hoan tac da ve van bao chua hoan tac duoc",
			);
			const xanh = toastKieu("success")[0]?.textContent ?? "";
			expect(`${loai}/da-ve:${xanh.includes(VI.bulk.daVeTruoc("3"))}`).toBe(
				`${loai}/da-ve:true`,
			);
			o.push(`${loai}/da-ve`);
			await don();

			ve();
			hoanTac(loai, ketQua({ requested: 3, failed: 3, errored: 3 }));
			await cho(() => vungToast().length > 0, `${loai}/loi`);
			expect(`${loai}/loi:${vungToast().includes(VI.bulk.hoanTacLoi)}`).toBe(
				`${loai}/loi:true`,
			);
			o.push(`${loai}/loi`);
			await don();
		}
		expect(o.length).toBe(6);
	});
});

describe("hlb-thieu-truong", () => {
	test("hlb-thieu-truong: ket qua khong co errored hanh xu nhu V2d", async () => {
		const o: string[] = [];
		for (const loai of LOAI) {
			ve();
			luuTru(loai, {
				requested: 4,
				succeeded: 2,
				skipped: 1,
				failed: 1,
				message: null,
				changedIds: ["a", "b"],
			});
			await cho(
				() => vungToast().includes(chuLuuTru(loai, 2, "vi")),
				`${loai}/cat`,
			);
			chot(!vungToast().includes("NaN"), "hlb: thieu errored ra NaN");
			expect(
				`${loai}/cat:${vungToast().includes(VI.bulk.boQua("2"))}:${vungToast().includes("chưa lưu trữ được")}`,
			).toBe(`${loai}/cat:true:false`);
			o.push(`${loai}/cat`);
			await don();

			ve();
			hoanTac(loai, {
				requested: 3,
				succeeded: 0,
				skipped: 0,
				failed: 3,
				message: null,
				changedIds: [],
			});
			await cho(() => vungToast().length > 0, `${loai}/ve`);
			expect(`${loai}/ve:${vungToast().includes(VI.bulk.hoanTacLoi)}`).toBe(
				`${loai}/ve:true`,
			);
			o.push(`${loai}/ve`);
			await don();
		}
		expect(o.length).toBe(6);
	});
});

describe("hlb-chu", () => {
	test("hlb-chu: hai khoa moi dung chu vi, ban en khong co dau Viet", () => {
		expect(VI.bulk.chuaLuuTru("3")).toBe(
			"3 bản chưa lưu trữ được vì máy chủ gặp lỗi — thử lại sau.",
		);
		expect(VI.bulk.daVeTruoc("3")).toBe("3 bản đã được khôi phục từ trước.");
		const EN = crmMessages("en");
		const viet = /[À-ỹ]/;
		chot(
			!viet.test(EN.bulk.chuaLuuTru("3")) && !viet.test(EN.bulk.daVeTruoc("3")),
			"hlb: chu en co dau Viet",
		);
	});
});
