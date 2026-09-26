import { afterEach, describe, expect, it, mock } from "bun:test";
import { PASSWORD } from "@crm/auth";
import {
	Children,
	cloneElement,
	isValidElement,
	type ReactElement,
	type ReactNode,
	Suspense,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { SignInOptions } from "@/lib/cua-vao/chon-cua";
import {
	quaCallback,
	rutCauHook,
} from "../../../_acceptance/cua-vao-dang-nhap/rang/ma-loi-that.mjs";

type Tieng = "vi" | "en";
type NutGhi = { loai: "social"; ten: string } | { loai: "sso"; ten: string };

let tieng: Tieng = "vi";
let tuyChon: SignInOptions | Error = {
	google: true,
	microsoft: false,
	quenMatKhau: false,
	providers: [],
};
let phien: { user: { id: string } } | null = null;
let nutDaVe: NutGhi[] = [];
let chuyenToi: string[] = [];

const TEN_HANG = { google: "Google", microsoft: "Microsoft" } as const;

mock.module("@/app/(landing)/sign-in/password-sign-in", () => ({
	PasswordSignIn: () => <button type="submit">o-mat-khau</button>,
}));
mock.module("@/app/(landing)/sign-in/social-sign-in", () => ({
	SocialSignIn: ({ provider }: { provider: keyof typeof TEN_HANG }) => {
		nutDaVe.push({ loai: "social", ten: TEN_HANG[provider] });
		return <button type="button">{TEN_HANG[provider]}</button>;
	},
}));
mock.module("@/app/(landing)/sign-in/sso-sign-in", () => ({
	SsoSignIn: ({ providers }: { providers: { name: string }[] }) => {
		for (const p of providers) nutDaVe.push({ loai: "sso", ten: p.name });
		return <button type="button">sso</button>;
	},
}));
mock.module("@/lib/session", () => ({
	getSession: async () => phien,
}));
mock.module("@/lib/trpc/server", () => ({
	getServerQueryClient: () => ({
		fetchQuery: async () => {
			if (tuyChon instanceof Error) throw tuyChon;
			return tuyChon;
		},
	}),
	getServerTrpc: () => ({
		sso: { signInOptions: { queryOptions: () => ({}) } },
	}),
}));
mock.module("@/lib/locale/server", () => ({
	getLocale: async () => tieng,
}));
mock.module("next/navigation", () => ({
	redirect: (dich: string) => {
		chuyenToi.push(dich);
		throw new Error(`CHUYEN:${dich}`);
	},
	unstable_rethrow: (loi: Error) => {
		if (loi.message.startsWith("CHUYEN:")) throw loi;
	},
}));

const { default: SignInPage } = await import("@/app/(landing)/sign-in/page");
const { authMessages } = await import("@/lib/messages/auth");
const { cuaVaoMessages } = await import("@/lib/messages/cua-vao");
const { settingsMessages } = await import("@/lib/messages/settings");
const { thanhVienMessages } = await import(
	"@/lib/messages/settings-thanh-vien"
);

const GOOGLE: SignInOptions = {
	google: true,
	microsoft: false,
	quenMatKhau: false,
	providers: [],
};

const HAM_ASYNC = (async () => undefined).constructor;

type ThanhPhanAsync = (props: never) => Promise<ReactNode>;

function laHamAsync(
	t: ReactElement["type"],
): t is ReactElement["type"] & ThanhPhanAsync {
	return t instanceof HAM_ASYNC;
}

async function giai(nut: ReactNode): Promise<ReactNode> {
	if (Array.isArray(nut)) return Promise.all(nut.map(giai));
	if (!isValidElement<{ children?: ReactNode }>(nut)) return nut;
	if (nut.type === Suspense) return giai(nut.props.children);
	if (laHamAsync(nut.type)) return giai(await nut.type(nut.props as never));
	const propsDaGiai: { [khoa: string]: ReactNode } = {};
	for (const [k, v] of Object.entries(nut.props)) {
		if (k !== "children" && isValidElement(v)) propsDaGiai[k] = await giai(v);
	}
	const con = nut.props.children;
	if (con === undefined) return cloneElement(nut, propsDaGiai);
	const conDaGiai = await giai(con);
	return cloneElement(
		nut as ReactElement,
		propsDaGiai,
		...(Array.isArray(conDaGiai) ? conDaGiai : [conDaGiai]),
	);
}

async function veTrang(
	params: Record<string, string | string[]> = {},
): Promise<{ html: string; o: HTMLElement }> {
	nutDaVe = [];
	const cay = await SignInPage({
		params: Promise.resolve({}),
		searchParams: Promise.resolve(params),
	} as PageProps<"/sign-in">);
	const html = renderToStaticMarkup(<>{Children.toArray(await giai(cay))}</>);
	const o = document.createElement("div");
	o.innerHTML = html;
	document.body.appendChild(o);
	return { html, o };
}

function buocHienRa(o: HTMLElement): { tieuDe: string; moTa: string }[] {
	return [...o.querySelectorAll("[data-khoi-huong-dan] [role=listitem]")].map(
		(li) => ({
			tieuDe: li.querySelector("[data-slot=stepper-title]")?.textContent ?? "",
			moTa:
				li.querySelector("[data-slot=stepper-description]")?.textContent ?? "",
		}),
	);
}

afterEach(() => {
	tieng = "vi";
	tuyChon = GOOGLE;
	phien = null;
	chuyenToi = [];
	document.body.innerHTML = "";
});

describe("ba-buoc-google", () => {
	it("khoi Lan dau vao co ba buoc dung thu tu va dong la gi", async () => {
		const cv = cuaVaoMessages("vi");
		const tv = thanhVienMessages("vi");
		const caiDat = settingsMessages("vi").thanhBen.nhan;
		const phut = Math.round(PASSWORD.tokenTtlSeconds / 60);
		const { o } = await veTrang();
		const khoi = o.querySelector("[data-khoi-huong-dan]");
		if (!khoi) throw new Error("sign-in: khong thay khoi «Lần đầu vào?»");
		expect(khoi.textContent).toContain(cv.lanDau.tieuDe);
		const buoc = buocHienRa(o);
		expect(buoc.map((b) => b.tieuDe)).toEqual([
			cv.buoc.choPhep.tieuDe,
			cv.buoc.nutNgoai.tieuDe("Google"),
			cv.buoc.matKhauPhu.tieuDe,
		]);
		expect(buoc[0]?.moTa).toContain(caiDat);
		expect(buoc[0]?.moTa).toContain(tv.trang.tieuDe);
		expect(buoc[0]?.moTa).toContain(tv.duocPhepVao.nutThem);
		expect(buoc[2]?.moTa).toContain(`${phut} phút`);
		expect(khoi.textContent).toContain(authMessages("vi").shell.headline);
		expect(authMessages("vi").shell.headline).toBe(
			"CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR.",
		);
	});

	it("tieu de trang la h1 duy nhat", async () => {
		const { o } = await veTrang();
		const h1 = [...o.querySelectorAll("h1")];
		expect(h1.map((h) => h.textContent)).toEqual([
			authMessages("vi").signIn.title,
		]);
	});
});

describe("ma-tran-cua", () => {
	const MA_TRAN: {
		ca: string;
		tuyChon: SignInOptions | Error;
		params?: Record<string, string>;
	}[] = [
		{ ca: "google-bat", tuyChon: GOOGLE },
		{ ca: "chi-mat-khau", tuyChon: { ...GOOGLE, google: false } },
		{ ca: "microsoft-bat", tuyChon: { ...GOOGLE, microsoft: true } },
		{
			ca: "co-sso",
			tuyChon: {
				...GOOGLE,
				providers: [{ providerId: "okta", name: "Okta" }],
			},
		},
		{
			ca: "method-google",
			tuyChon: { ...GOOGLE, microsoft: true },
			params: { method: "google" },
		},
		{ ca: "options-loi", tuyChon: new Error("api chet") },
	];

	for (const { ca, tuyChon: tc, params } of MA_TRAN) {
		it(`${ca}: buoc 2 goi dung tap ten tren nut ngoai`, async () => {
			const cv = cuaVaoMessages("vi");
			tuyChon = tc;
			const { o } = await veTrang(params);
			const tenNut = nutDaVe.map((n) => n.ten);
			const buoc = buocHienRa(o).map((b) => b.tieuDe);
			if (tenNut.length === 0) {
				expect(buoc).toEqual([
					cv.buoc.choPhep.tieuDe,
					cv.buoc.matKhauChinh.tieuDe,
				]);
				return;
			}
			const can = cv.buoc.nutNgoai.tieuDe(tenNut.join(", "));
			if (buoc[1] !== can) {
				throw new Error(
					`${ca}: buoc 2 goi «${buoc[1]}» nhung nut hien {${tenNut.join(", ")}}`,
				);
			}
		});
	}

	it("options-loi ve giong het google-bat", async () => {
		const { html: goc } = await veTrang();
		const nutGoc = nutDaVe;
		tuyChon = new Error("api chet");
		const { html: loi } = await veTrang();
		expect(nutDaVe).toEqual(nutGoc);
		expect(loi).toBe(goc);
	});
});

describe("o-loi", () => {
	const cau = rutCauHook();
	const giaTriThat = (ten: string) => {
		const c = cau.find((x: { ten: string }) => x.ten === ten);
		if (!c) throw new Error(`khong rut duoc cau ${ten} tu auth.ts`);
		return quaCallback(c.cau) as string;
	};

	function oLoi(o: HTMLElement) {
		return [...o.querySelectorAll("[role=alert]")];
	}

	function kyVongOLoi(
		o: HTMLElement,
		loai: "chuaChoPhep" | "daHuy" | "chung",
	): void {
		const cv = cuaVaoMessages("vi").loi[loai];
		const [alert, ...thua] = oLoi(o);
		if (!alert) throw new Error("khong co role=alert");
		expect(thua).toHaveLength(0);
		expect(alert.querySelector("[data-slot=alert-title]")?.textContent).toBe(
			cv.tieuDe,
		);
		expect(
			alert.querySelector("[data-slot=alert-description]")?.textContent,
		).toBe(cv.moTa);
	}

	function chuaGiaTri(html: string, giaTri: string): string | null {
		const thoatHtml = giaTri
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#x27;");
		if (html.includes(giaTri)) return "tho";
		if (html.includes(thoatHtml)) return "thoat HTML";
		if (html.includes(encodeURIComponent(giaTri))) return "ma hoa URL";
		return null;
	}

	it("chua-cho-phep: gia tri that tu hook, co mien va khong mien", async () => {
		for (const ten of ["co-mien", "khong-mien"]) {
			const { o } = await veTrang({ error: giaTriThat(ten) });
			kyVongOLoi(o, "chuaChoPhep");
			document.body.innerHTML = "";
		}
	});

	it("access_denied: dung giua chung; co khoang trang thi la cau chung", async () => {
		const { o } = await veTrang({ error: "access_denied" });
		kyVongOLoi(o, "daHuy");
		document.body.innerHTML = "";
		const { o: o2 } = await veTrang({ error: "access_denied " });
		kyVongOLoi(o2, "chung");
	});

	const LA = [
		["no-one-can", () => giaTriThat("chua-khai")],
		["invalid_code", () => "invalid_code"],
		["state_mismatch", () => "state_mismatch"],
		["script", () => "<script>alert(1)</script>"],
		["img", () => '"><img src=x onerror=alert(1)>'],
		["dai", () => "x".repeat(2000)],
	] as const;

	for (const [ca, lay] of LA) {
		it(`${ca}: cau chung, HTML khong mang gia tri`, async () => {
			const giaTri = lay();
			const { o, html } = await veTrang({ error: giaTri });
			kyVongOLoi(o, "chung");
			const dang = chuaGiaTri(html, giaTri);
			if (dang) throw new Error(`${ca}: HTML chua gia tri URL (${dang})`);
		});
	}

	it("doi chung: bo do ba dang bat duoc gia tri bi in ra", () => {
		const g = '"><img src=x onerror=alert(1)>';
		expect(chuaGiaTri(renderToStaticMarkup(<p data-ma={g}>x</p>), g)).toBe(
			"thoat HTML",
		);
		expect(chuaGiaTri(`<a href="/?e=${encodeURIComponent(g)}">`, g)).toBe(
			"ma hoa URL",
		);
		expect(chuaGiaTri("<p>invalid_code</p>", "invalid_code")).toBe("tho");
	});

	it("vang va rong: khong co o loi", async () => {
		const { o } = await veTrang();
		expect(oLoi(o)).toHaveLength(0);
		document.body.innerHTML = "";
		const { o: o2 } = await veTrang({ error: "" });
		expect(oLoi(o2)).toHaveLength(0);
	});

	it("lap: xet gia tri dau", async () => {
		const { o } = await veTrang({
			error: ["access_denied", "invalid_code"],
		});
		kyVongOLoi(o, "daHuy");
	});

	it("o loi dung truoc nut dang nhap dau tien, khong lay tieu diem", async () => {
		const { o } = await veTrang({ error: "invalid_code" });
		const [alert] = oLoi(o);
		const nutDau = o.querySelector("button");
		if (!alert || !nutDau) throw new Error("thieu o loi hoac nut");
		if (
			!(
				alert.compareDocumentPosition(nutDau) & Node.DOCUMENT_POSITION_FOLLOWING
			)
		) {
			throw new Error("o loi dung sau nut dang nhap");
		}
		expect(alert.hasAttribute("tabindex")).toBe(false);
		expect(alert.hasAttribute("autofocus")).toBe(false);
	});

	it("da dang nhap: chuyen ve / truoc khi hien o loi", async () => {
		phien = { user: { id: "u" } };
		await veTrang({ error: "access_denied" }).catch(() => undefined);
		expect(chuyenToi).toEqual(["/"]);
	});
});

describe("chu", () => {
	it("tieu de moi o ca hai tieng, khong con loi chao quay lai", () => {
		expect(authMessages("vi").signIn.title).toBe("Đăng nhập vào CRM");
		expect(authMessages("en").signIn.title).toBe("Sign in to the CRM");
		for (const t of ["vi", "en"] as const) {
			const chuoi = JSON.stringify([authMessages(t), cuaVaoMessages(t)]);
			expect(chuoi).not.toContain('"Mừng bạn quay lại"');
			expect(chuoi).not.toContain('"Welcome back"');
		}
	});

	it("trang tieng Anh ve chu tieng Anh", async () => {
		tieng = "en";
		const { o } = await veTrang();
		expect(o.querySelector("h1")?.textContent).toBe("Sign in to the CRM");
		expect(o.textContent).toContain(cuaVaoMessages("en").lanDau.tieuDe);
	});
});
