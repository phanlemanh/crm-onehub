import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { act } from "react";
import {
	BAN_NHAP,
	bam,
	CUOC,
	cho,
	daDung,
	dat,
	datAgent,
	datDanhSach,
	datLai,
	diTrang,
	don,
	go,
	m,
	mo,
	nhip,
	nut,
	q,
	urlDoi,
} from "./khung-soan-okr";

const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { messages: uiMessages } = await import("@crm/ui/lib/messages");

const mui = uiMessages("vi");
const KHO = "/ws/tai-lieu";
const CHU = "Ưu tiên giữ khách";
const SO = "42";

beforeEach(datLai);
afterEach(don);

async function moKhung(
	{ daDuaVao = false }: { daDuaVao?: boolean } = {},
): Promise<void> {
	dat("okr.access", () => ({
		canManageProgram: true,
		headOf: { divisions: [], departments: [] },
	}));
	datDanhSach({
		thieuBoiCanh: true,
		dong: BAN_NHAP,
		...(daDuaVao ? { cuoc: { ...CUOC, trangThai: "da-dua-vao" } } : {}),
	});
	await mo(<RecordSheetHost cauNoiOkr />, "record=soan:cuoc-1");
	await nhip(10);
	await cho(
		() =>
			q("[data-trang-soan]:not([data-trang-soan='dang-mo'])") !== null,
		"khung soan mo xong",
	);
}

function lienKet(chon: string): HTMLAnchorElement {
	const a = q(chon);
	if (!(a instanceof HTMLAnchorElement))
		throw new Error(`khong thay lien ket ${chon}`);
	return a;
}

const toiKho = () => lienKet(`[data-slot=sheet-content] a[href="${KHO}"]`);
const xemTheoDonVi = () => lienKet('[data-nut="xem-theo-don-vi"]');

async function bamLienKet(a: HTMLAnchorElement): Promise<{ chan: boolean }> {
	let toiCuoi = false;
	const cuoi = (e: Event) => {
		toiCuoi = !e.defaultPrevented;
		e.preventDefault();
	};
	window.addEventListener("click", cuoi);
	await act(async () => {
		a.dispatchEvent(
			new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }),
		);
	});
	window.removeEventListener("click", cuoi);
	await nhip(5);
	return { chan: !toiCuoi };
}

const hop = () => q("[role=alertdialog]");
const coKhung = () => q("[data-slot=sheet-content]") !== null;
const oChu = () => q("[data-o=hoi-thoai] textarea") as HTMLTextAreaElement;
const oSo = () => q("[data-o-so] input") as HTMLInputElement;

function banGhi(): string | null {
	const chuoi = urlDoi.at(-1);
	return chuoi === undefined
		? "soan:cuoc-1"
		: new URLSearchParams(chuoi).get("record");
}

type Do = "dang-soan" | "go-chu" | "go-so";

async function lamDo(dang: Do): Promise<void> {
	if (dang === "dang-soan") await datAgent({ status: "streaming" });
	if (dang === "go-chu") await go(oChu(), CHU);
	if (dang === "go-so") await go(oSo(), SO);
	await nhip(5);
}

function loiHoi(dang: Do) {
	return dang === "dang-soan"
		? {
				tieuDe: m.trang.hoiDong.tieuDe,
				than: m.trang.hoiDong.than,
				roi: m.trang.hoiDong.nut,
				oLai: m.trang.hoiDong.thoi,
			}
		: {
				tieuDe: mui.dialog.boThayDoi.tieuDe,
				than: mui.dialog.boThayDoi.than,
				roi: mui.dialog.boThayDoi.bo,
				oLai: mui.dialog.boThayDoi.tiepTuc,
			};
}

async function esc(): Promise<void> {
	await act(async () => {
		(hop() ?? document.body).dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		);
	});
	await nhip(5);
}

async function oLai(
	nhan: string,
	dang: Do,
	cach: "o-lai-nut" | "o-lai-esc",
): Promise<void> {
	const loi = loiHoi(dang);
	const ket = await bamLienKet(toiKho());
	expect(`${nhan}: co hop hoi ${hop() !== null}`).toBe(
		`${nhan}: co hop hoi true`,
	);
	expect(`${nhan}: chan ${ket.chan}`).toBe(`${nhan}: chan true`);
	expect(hop()?.textContent).toContain(loi.tieuDe);
	expect(hop()?.textContent).toContain(loi.than);
	nut(loi.roi, hop() ?? document.body);
	const nutOLai = nut(loi.oLai, hop() ?? document.body);
	expect(diTrang).toEqual([]);
	if (cach === "o-lai-nut") await bam(nutOLai);
	else await esc();
	expect(`${nhan}: hop dong ${hop() === null}`).toBe(`${nhan}: hop dong true`);
	expect(`${nhan}: khung con ${coKhung()}`).toBe(`${nhan}: khung con true`);
	expect(`${nhan}: record ${banGhi()}`).toBe(`${nhan}: record soan:cuoc-1`);
	expect(`${nhan}: chua di ${JSON.stringify(diTrang)}`).toBe(
		`${nhan}: chua di []`,
	);
}

describe("kcl-soan", () => {
	let soO = 0;
	afterEach(() => {
		soO += 1;
	});

	for (const cach of ["o-lai-nut", "o-lai-esc"] as const) {
		test(`Kara đang soạn × ${cach}`, async () => {
			await moKhung();
			await lamDo("dang-soan");
			await oLai(`kcl-soan ${cach}`, "dang-soan", cach);
		});
	}

	test("đếm ô kcl-soan", () => {
		expect(soO).toBe(2);
	});
});

describe("kcl-go-do", () => {
	let soO = 0;
	afterEach(() => {
		soO += 1;
	});

	for (const dang of ["go-chu", "go-so"] as const) {
		for (const cach of ["o-lai-nut", "o-lai-esc"] as const) {
			test(`${dang} × ${cach}`, async () => {
				await moKhung();
				await lamDo(dang);
				const nhan = `kcl-go-do ${dang}·${cach}`;
				await oLai(nhan, dang, cach);
				const conLai = dang === "go-chu" ? oChu().value : oSo().value;
				expect(`${nhan}: chu con ${conLai}`).toBe(
					`${nhan}: chu con ${dang === "go-chu" ? CHU : SO}`,
				);
			});
		}
	}

	test("đếm ô kcl-go-do", () => {
		expect(soO).toBe(4);
	});
});

describe("kcl-roi", () => {
	let soO = 0;
	afterEach(() => {
		soO += 1;
	});

	for (const dang of ["dang-soan", "go-chu", "go-so"] as const) {
		test(`${dang} × rời`, async () => {
			await moKhung();
			await lamDo(dang);
			const nhan = `kcl-roi ${dang}`;
			await bamLienKet(toiKho());
			await bam(nut(loiHoi(dang).roi, hop() ?? document.body));
			expect(`${nhan}: di ${JSON.stringify(diTrang)}`).toBe(
				`${nhan}: di ${JSON.stringify([{ kieu: "push", duong: KHO }])}`,
			);
			expect(`${nhan}: hop dong ${hop() === null}`).toBe(
				`${nhan}: hop dong true`,
			);
			expect(`${nhan}: khong dung luot ${daDung}`).toBe(
				`${nhan}: khong dung luot 0`,
			);
		});
	}

	test("đếm ô kcl-roi", () => {
		expect(soO).toBe(3);
	});
});

describe("kcl-khong-do", () => {
	let soO = 0;
	afterEach(() => {
		soO += 1;
	});

	test("không gì dở × Tới Kho tài liệu", async () => {
		await moKhung();
		const ket = await bamLienKet(toiKho());
		expect(`kcl-khong-do toi-kho: khong hop ${hop() === null}`).toBe(
			"kcl-khong-do toi-kho: khong hop true",
		);
		expect(`kcl-khong-do toi-kho: khong chan ${!ket.chan}`).toBe(
			"kcl-khong-do toi-kho: khong chan true",
		);
		expect(diTrang).toEqual([]);
	});

	test("không gì dở × Xem theo đơn vị", async () => {
		await moKhung({ daDuaVao: true });
		const ket = await bamLienKet(xemTheoDonVi());
		expect(`kcl-khong-do xem-theo-don-vi: khong hop ${hop() === null}`).toBe(
			"kcl-khong-do xem-theo-don-vi: khong hop true",
		);
		expect(`kcl-khong-do xem-theo-don-vi: khong chan ${!ket.chan}`).toBe(
			"kcl-khong-do xem-theo-don-vi: khong chan true",
		);
		expect(diTrang).toEqual([]);
	});

	test("đếm ô kcl-khong-do", () => {
		expect(soO).toBe(2);
	});
});
