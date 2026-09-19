import { beforeEach, describe, expect, it, mock } from "bun:test";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";

type KetQuaDat = { error: { code?: string; message?: string } | null };

let traVe: KetQuaDat = { error: null };
let daGoi: { newPassword: string; token: string }[] = [];

mock.module("@crm/auth/client", () => ({
	resetPassword: async (doiSo: { newPassword: string; token: string }) => {
		daGoi.push(doiSo);
		return traVe;
	},
}));

const { DatMatKhauForm } = await import(
	"@/app/(landing)/dat-mat-khau/[token]/dat-mat-khau-form"
);
const { authMessages } = await import("@/lib/messages/auth");

const m = authMessages("vi").datMatKhau;
const TOI_THIEU = 12;
const MAT_KHAU_LO = "matkhaudalobiro";
const CAU_LO =
	"Mật khẩu này đã từng bị lộ trong một vụ rò dữ liệu. Chọn mật khẩu khác.";

const chu = {
	description: m.description(60),
	goLai: m.goLai,
	gui: m.gui,
	loi: {
		khongDungDuoc: m.loi.khongDungDuoc,
		lechNhau: m.loi.lechNhau,
		quaNgan: m.loi.quaNgan(TOI_THIEU),
	},
	matKhauMoi: m.matKhauMoi,
	soKyTuToiThieu: TOI_THIEU,
	title: m.title,
	toiThieu: m.toiThieu(TOI_THIEU),
	token: "chia-thu-nghiem",
	xong: m.xong,
};

type San = { o: HTMLElement; root: Root };

function dungForm(): San {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	act(() => {
		root.render(h(DatMatKhauForm, chu));
	});
	return { o, root };
}

function doOn(san: San, id: string, chuGo: string): void {
	const o = san.o.querySelector<HTMLInputElement>(`#${id}`);
	if (!o) throw new Error(`khong thay o ${id}`);
	const dat = Object.getOwnPropertyDescriptor(
		window.HTMLInputElement.prototype,
		"value",
	)?.set;
	act(() => {
		dat?.call(o, chuGo);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function bamGui(san: San): Promise<void> {
	const form = san.o.querySelector("form");
	if (!form) throw new Error("khong thay form");
	await act(async () => {
		form.dispatchEvent(
			new Event("submit", { bubbles: true, cancelable: true }),
		);
	});
}

type TrangThaiO = { giaTri: string; loi: string | null };

function oVaLoi(san: San, id: string): TrangThaiO {
	const o = san.o.querySelector<HTMLInputElement>(`#${id}`);
	if (!o) throw new Error(`khong thay o ${id}`);
	const truong = o.closest("[data-slot='field']") ?? o.parentElement;
	const loi = truong?.querySelector("[data-slot='field-error']");
	const trangThai: TrangThaiO = {
		giaTri: o.value,
		loi: loi ? loi.textContent : null,
	};
	return trangThai;
}

function don(san: San): void {
	act(() => {
		san.root.unmount();
	});
	san.o.remove();
}

beforeEach(() => {
	traVe = { error: null };
	daGoi = [];
});

describe("mat-khau-yeu-tren-man", () => {
	it("qua ngan: ly do nam canh O MAT KHAU MOI, va chu o o kia khong mat", async () => {
		const san = dungForm();
		doOn(san, "mk-moi", "ngan");
		doOn(san, "mk-lai", "con-nguyen-day");

		await bamGui(san);

		const oMoi = oVaLoi(san, "mk-moi");
		const oLai = oVaLoi(san, "mk-lai");

		expect(oMoi.loi).toBe(chu.loi.quaNgan);
		expect(oLai.loi).toBeNull();
		expect(oLai.giaTri).toBe("con-nguyen-day");
		expect(daGoi).toHaveLength(0);
		don(san);
	});

	it("lech nhau: ly do nam canh O GO LAI, khong canh o mat khau moi", async () => {
		const san = dungForm();
		doOn(san, "mk-moi", "matkhaudumanh2026");
		doOn(san, "mk-lai", "gokhacmatroi2026");

		await bamGui(san);

		expect(oVaLoi(san, "mk-lai").loi).toBe(chu.loi.lechNhau);
		expect(oVaLoi(san, "mk-moi").loi).toBeNull();
		expect(daGoi).toHaveLength(0);
		don(san);
	});

	it("mat khau da lo: ly do rieng canh o mat khau moi, khong lan voi ca qua ngan", async () => {
		traVe = { error: { code: "PASSWORD_COMPROMISED", message: CAU_LO } };
		const san = dungForm();
		doOn(san, "mk-moi", MAT_KHAU_LO);
		doOn(san, "mk-lai", MAT_KHAU_LO);

		await bamGui(san);

		const oMoi = oVaLoi(san, "mk-moi");

		expect(oMoi.loi).toBe(CAU_LO);
		expect(oMoi.loi).not.toBe(chu.loi.quaNgan);
		expect(daGoi).toHaveLength(1);
		don(san);
	});

	it("bi tu choi roi go lai mat khau tot tren CUNG lien ket: dat duoc", async () => {
		traVe = { error: { code: "PASSWORD_COMPROMISED", message: CAU_LO } };
		const san = dungForm();
		doOn(san, "mk-moi", MAT_KHAU_LO);
		doOn(san, "mk-lai", MAT_KHAU_LO);
		await bamGui(san);

		expect(oVaLoi(san, "mk-moi").loi).toBe(CAU_LO);

		traVe = { error: null };
		doOn(san, "mk-moi", "matkhaurieng2026");
		doOn(san, "mk-lai", "matkhaurieng2026");
		await bamGui(san);

		expect(san.o.textContent).toContain(m.xong.title);
		expect(daGoi).toHaveLength(2);
		expect(daGoi.at(1)?.token).toBe(chu.token);
		expect(daGoi.at(1)?.newPassword).toBe("matkhaurieng2026");
		don(san);
	});

	it("lien ket het dung duoc: doi sang man lien ket khong hop le, khong bao canh o", async () => {
		traVe = { error: { code: "INVALID_TOKEN" } };
		const san = dungForm();
		doOn(san, "mk-moi", "matkhaudumanh2026");
		doOn(san, "mk-lai", "matkhaudumanh2026");

		await bamGui(san);

		expect(san.o.textContent).toContain(chu.loi.khongDungDuoc);
		expect(san.o.querySelector("#mk-moi")).toBeNull();
		don(san);
	});
});
