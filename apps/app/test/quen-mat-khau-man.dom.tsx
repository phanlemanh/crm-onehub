import { describe, expect, it } from "bun:test";
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { duongQuenMatKhau } from "@/lib/quen-mat-khau";

const { QuenMatKhauForm } = await import(
	"@/app/(landing)/quen-mat-khau/quen-mat-khau-form"
);
const { PasswordSignIn } = await import(
	"@/app/(landing)/sign-in/password-sign-in"
);
const { authMessages } = await import("@/lib/messages/auth");

const m = authMessages("vi");
const PHUT_THU = 45;
const PHUT_CHO_THU = 15;
const DIA_CHI = "ada@onehub.center";
const HTTP_QUA_LUOT = 429;
const HTTP_LOI_MAY_CHU = 500;

type KetQuaXin = { error: { status?: number } | null };
type Xin = (dau: { email: string }) => Promise<KetQuaXin>;

const chuDangNhap = {
	diaChi: "Địa chỉ email",
	matKhau: "Mật khẩu",
	dangNhap: "Đăng nhập",
	dangGui: "Đang gửi…",
	saiChung: "Sai",
};

function dung(thanh: unknown, props: object): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	act(() => {
		root.render(h(thanh as never, props));
	});
	return o;
}

function propsForm(xin: Xin) {
	const q = m.quenMatKhau;
	return {
		title: q.title,
		description: q.description,
		diaChi: q.diaChi,
		gui: q.gui,
		dangGui: q.dangGui,
		quayLai: q.quayLai,
		loi: q.loi,
		quaLuot: q.quaLuot(PHUT_CHO_THU),
		xong: {
			title: q.xong.title,
			description: q.xong.description(PHUT_THU),
			quayLai: q.xong.quayLai,
		},
		xin,
	};
}

function go(o: HTMLElement, chu: string): void {
	const oNhap = o.querySelector<HTMLInputElement>("input[type=email]");
	if (!oNhap) throw new Error("khong thay o email");
	const dat = Object.getOwnPropertyDescriptor(
		window.HTMLInputElement.prototype,
		"value",
	)?.set;
	act(() => {
		dat?.call(oNhap, chu);
		oNhap.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function gui(o: HTMLElement): Promise<void> {
	const form = o.querySelector("form");
	await act(async () => {
		form?.dispatchEvent(
			new Event("submit", { bubbles: true, cancelable: true }),
		);
	});
}

describe("co-tat", () => {
	it("khong co nhan thi khong co lien ket quen mat khau, co nhan thi co dung mot", () => {
		const tat = dung(PasswordSignIn, { ...chuDangNhap, quenMatKhau: null });
		expect(tat.querySelectorAll('a[href="/quen-mat-khau"]').length).toBe(0);
		expect(tat.textContent).not.toContain(m.signIn.quenMatKhau);
		const bat = dung(PasswordSignIn, {
			...chuDangNhap,
			quenMatKhau: m.signIn.quenMatKhau,
		});
		expect(bat.querySelectorAll('a[href="/quen-mat-khau"]').length).toBe(1);
	});

	it("ham quyet dinh cua trang: tat, bat, doc loi", () => {
		const ra = [
			duongQuenMatKhau({ quenMatKhau: false }),
			duongQuenMatKhau({ quenMatKhau: true }),
			duongQuenMatKhau(null),
		];
		if (ra[0] !== "/sign-in" || ra[2] !== "/sign-in") {
			throw new Error("co tat thi trang phai ve /sign-in");
		}
		expect(ra).toEqual(["/sign-in", "hien", "/sign-in"]);
	});
});

describe("lien-ket", () => {
	it("lien ket nam sau o mat khau, dung href, tab toi duoc", () => {
		const o = dung(PasswordSignIn, {
			...chuDangNhap,
			quenMatKhau: m.signIn.quenMatKhau,
		});
		const matKhau = o.querySelector("input[type=password]");
		const lienKet = o.querySelector<HTMLAnchorElement>(
			'a[href="/quen-mat-khau"]',
		);
		if (!matKhau || !lienKet) throw new Error("thieu o mat khau hoac lien ket");
		expect(
			matKhau.compareDocumentPosition(lienKet) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		expect(lienKet.textContent).toBe(m.signIn.quenMatKhau);
		expect(lienKet.tabIndex).toBe(0);
	});
});

describe("form", () => {
	it("dang-gui: nut tat va ghi Dang gui", async () => {
		const o = dung(
			QuenMatKhauForm,
			propsForm(() => new Promise(() => {})),
		);
		go(o, DIA_CHI);
		await gui(o);
		const nut = o.querySelector<HTMLButtonElement>("button[type=submit]");
		expect(nut?.disabled).toBe(true);
		expect(nut?.textContent).toContain(m.quenMatKhau.dangGui);
	});

	it("bam-hai-lan: chi mot loi goi", async () => {
		let dem = 0;
		const o = dung(
			QuenMatKhauForm,
			propsForm(() => {
				dem += 1;
				return new Promise(() => {});
			}),
		);
		go(o, DIA_CHI);
		await gui(o);
		await gui(o);
		expect(dem).toBe(1);
	});

	it("da-gui: man Kiem tra hop thu mang so phut that, trong vung aria-live", async () => {
		const o = dung(
			QuenMatKhauForm,
			propsForm(async () => ({ error: null })),
		);
		go(o, DIA_CHI);
		await gui(o);
		expect(o.textContent).toContain(m.quenMatKhau.xong.title);
		expect(o.textContent).toContain(`${PHUT_THU} phút`);
		expect(o.textContent).not.toContain("một giờ");
		expect(o.querySelector('[aria-live="polite"]')?.textContent).toContain(
			m.quenMatKhau.xong.title,
		);
	});

	const caLoi: [string, Xin][] = [
		[
			"loi",
			async () => {
				throw new TypeError("fetch failed");
			},
		],
		["loi-may-chu", async () => ({ error: { status: HTTP_LOI_MAY_CHU } })],
	];

	for (const [ten, xin] of caLoi) {
		it(`${ten}: hien cau loi, van o form, chu da go con`, async () => {
			const o = dung(QuenMatKhauForm, propsForm(xin));
			go(o, DIA_CHI);
			await gui(o);
			if (o.textContent?.includes(m.quenMatKhau.xong.title)) {
				throw new Error("loi van hien man da gui");
			}
			expect(o.textContent).toContain(m.quenMatKhau.loi);
			expect(
				o.querySelector<HTMLInputElement>("input[type=email]")?.value,
			).toBe(DIA_CHI);
		});
	}

	it("qua-luot: 429 hien cau qua luot, khong hien man da gui", async () => {
		const o = dung(
			QuenMatKhauForm,
			propsForm(async () => ({ error: { status: HTTP_QUA_LUOT } })),
		);
		go(o, DIA_CHI);
		await gui(o);
		expect(o.textContent).toContain(m.quenMatKhau.quaLuot(PHUT_CHO_THU));
		expect(o.textContent).not.toContain(m.quenMatKhau.xong.title);
	});
});
