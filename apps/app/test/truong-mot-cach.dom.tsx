import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";

type Nguoi = { id: string; name: string; email: string; image: string | null };

const NGUOI: Nguoi[] = [
	{ id: "u-an", name: "An Trần", email: "an@onehub.vn", image: null },
	{ id: "u-binh", name: "Bình Lê", email: "binh@onehub.vn", image: null },
];

type GoiLuu = { thuTuc: string; bien: unknown };
let daLuu: GoiLuu[] = [];
let loiLuu: Error | null = null;
let toastLoi: string[] = [];

function thuTuc<TVao>(ten: string, doc: (dauVao: TVao) => unknown) {
	return {
		queryKey: (dauVao?: TVao) => (dauVao === undefined ? [ten] : [ten, dauVao]),
		pathKey: () => [ten],
		queryOptions: (dauVao: TVao) => ({
			queryKey: dauVao === undefined ? [ten] : [ten, dauVao],
			queryFn: async () => doc(dauVao),
		}),
		mutationOptions: (tuyChon?: Record<string, unknown>) => ({
			...tuyChon,
			mutationKey: [ten],
			mutationFn: async (bien: unknown) => {
				daLuu.push({ thuTuc: ten, bien });
				if (loiLuu) throw loiLuu;
				return {};
			},
		}),
	};
}

const trpcGia = {
	users: { list: thuTuc("users.list", () => NGUOI) },
};

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));
mock.module("sonner", () => ({
	toast: {
		error: (chu: string) => {
			toastLoi.push(chu);
		},
		success: () => {},
	},
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { crmMessages } = await import("@/lib/messages/crm");
const { OTruongPhieu, OTruongBang, HienThiTruong } = await import(
	"@/components/crm/fields/kieu-truong"
);
const { moTaTruongTuTao } = await import(
	"@/components/crm/fields/record-fields"
);

type MoTaTruong = import("@/components/crm/fields/kieu-truong").MoTaTruong;
type GiaTriHienThi =
	import("@/components/crm/fields/kieu-truong").GiaTriHienThi;
type RecordFieldEntry =
	import("@/components/crm/fields/record-fields").RecordFieldEntry;

const mVi = crmMessages("vi");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

afterEach(() => {
	for (const san of dangMo) {
		act(() => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	daLuu = [];
	loiLuu = null;
	toastLoi = [];
});

async function mo(
	man: ReactElement,
	locale: "vi" | "en" = "vi",
): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale={locale}>
					<TooltipProvider>{man}</TooltipProvider>
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	dangMo.push({ o, root });
	return o;
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 120; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi ${moTa}: ${document.body.textContent?.slice(0, 300)}`,
	);
}

async function bam(phanTu: Element): Promise<void> {
	await act(async () => {
		(phanTu as HTMLElement).click();
	});
}

async function go(o: HTMLInputElement, chu: string): Promise<void> {
	const dat = Object.getOwnPropertyDescriptor(
		window.HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function phim(o: HTMLElement, key: string): Promise<void> {
	await act(async () => {
		o.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
	});
}

function hangTheoNhan(goc: ParentNode, nhan: string): HTMLElement | null {
	const label = [...goc.querySelectorAll("label")].find(
		(l) => l.textContent?.trim() === nhan,
	);
	return (label?.parentElement as HTMLElement | null) ?? null;
}

function moTa(goc: Partial<MoTaTruong> & Pick<MoTaTruong, "kieu" | "nhan">): {
	moTa: MoTaTruong;
	daGoi: unknown[];
} {
	const daGoi: unknown[] = [];
	return {
		daGoi,
		moTa: {
			khoa: goc.nhan,
			giaTri: null,
			nguoiDung: NGUOI,
			luu: (giaTri) => {
				daGoi.push(giaTri);
			},
			...goc,
		},
	};
}

async function moSuaVaGo(
	o: HTMLElement,
	nhan: string,
	chu: string,
): Promise<HTMLInputElement> {
	const hang = hangTheoNhan(o, nhan);
	if (!hang) throw new Error(`thieu hang ${nhan}`);
	const nut = hang.querySelector("button");
	if (!nut) throw new Error(`thieu nut ${nhan}`);
	await bam(nut);
	const input = hang.querySelector("input");
	if (!input) throw new Error(`khong mo o nhap ${nhan}`);
	await go(input, chu);
	await phim(input, "Enter");
	return input;
}

describe("tmc-loi-nhap", () => {
	test("go sai kieu: giu o, cau theo kieu, khong luu", async () => {
		const khuonNhan = [
			"so",
			"email",
			"lien-ket",
			"dien-thoai",
			"locale-khac",
		] as const;
		for (const ma of khuonNhan) {
			const cau = mVi.truongKieu.tuChoi[ma];
			if (!cau.startsWith("Ô này nhận") || !cau.includes("ví dụ")) {
				throw new Error(`tmc loi nhap: khuon cau ${ma}`);
			}
		}
		if (!mVi.truongKieu.tuChoi.so.includes("1.234,5")) {
			throw new Error("tmc loi nhap: khuon cau so");
		}
		if (!mVi.truongKieu.trong("Tên tmc").includes("Tên tmc")) {
			throw new Error("tmc loi nhap: khuon cau trong");
		}

		const maTran = [
			{ kieu: "NUMBER", chuoi: "abc", cau: mVi.truongKieu.tuChoi.so },
			{
				kieu: "NUMBER",
				chuoi: "1234.5",
				cau: mVi.truongKieu.tuChoi["locale-khac"],
			},
			{ kieu: "EMAIL", chuoi: "an@", cau: mVi.truongKieu.tuChoi.email },
			{
				kieu: "URL",
				chuoi: "khong co cham",
				cau: mVi.truongKieu.tuChoi["lien-ket"],
			},
			{
				kieu: "PHONE",
				chuoi: "12ab",
				cau: mVi.truongKieu.tuChoi["dien-thoai"],
			},
			{
				kieu: "TEXT",
				chuoi: "",
				cau: mVi.truongKieu.trong("Tên tmc"),
				batBuoc: true,
				giaTri: "Có sẵn",
			},
		] as const;

		let daSo = 0;
		for (const o of maTran) {
			const nhan = o.kieu === "TEXT" ? "Tên tmc" : `Ô ${o.kieu} tmc`;
			const { moTa: mt, daGoi } = moTa({
				kieu: o.kieu,
				nhan,
				batBuoc: "batBuoc" in o ? o.batBuoc : false,
				giaTri: "giaTri" in o ? o.giaTri : null,
			});
			const goc = await mo(<OTruongPhieu moTa={mt} />);
			await moSuaVaGo(goc, nhan, o.chuoi);
			if (daGoi.length > 0) throw new Error(`tmc loi nhap: ${o.kieu} van luu`);
			const input = goc.querySelector("input");
			if (!input) throw new Error(`tmc loi nhap: ${o.kieu} dong o`);
			const loiId = input.getAttribute("aria-describedby");
			const cauLoi = loiId ? document.getElementById(loiId)?.textContent : null;
			if (
				input.getAttribute("aria-invalid") !== "true" ||
				cauLoi?.trim() !== o.cau
			) {
				throw new Error(`tmc loi nhap: ${o.kieu} cau ${cauLoi}`);
			}
			if (/takes|cannot/.test(cauLoi ?? "")) {
				throw new Error(`tmc loi nhap: ${o.kieu} cau may chu`);
			}
			daSo += 1;
		}
		if (daSo !== 6) throw new Error(`tmc loi nhap: thieu o ${daSo}`);

		const { moTa: dc, daGoi: dcGoi } = moTa({
			kieu: "NUMBER",
			nhan: "Đối chứng tmc",
		});
		const gocDc = await mo(<OTruongPhieu moTa={dc} />);
		await moSuaVaGo(gocDc, "Đối chứng tmc", "1.234,5");
		if (JSON.stringify(dcGoi) !== "[1234.5]") {
			throw new Error("tmc loi nhap: doi chung khong luu");
		}
		expect(daSo).toBe(6);
	});

	test("Esc sau khi go sai tra gia tri cu", async () => {
		const { moTa: mt, daGoi } = moTa({
			kieu: "NUMBER",
			nhan: "Esc tmc",
			giaTri: 7,
		});
		const goc = await mo(<OTruongPhieu moTa={mt} />);
		const input = await moSuaVaGo(goc, "Esc tmc", "abc");
		await phim(input, "Escape");
		if (goc.querySelector("input"))
			throw new Error("tmc loi nhap: esc khong dong");
		if (!goc.textContent?.includes("7"))
			throw new Error("tmc loi nhap: esc mat gia tri");
		expect(daGoi.length).toBe(0);
	});
});

describe("tmc-o-tich", () => {
	test("o tich co nhan, bam nhan doi gia tri, bang hien Co/Khong", async () => {
		const { moTa: mt, daGoi } = moTa({
			kieu: "CHECKBOX",
			nhan: "Đã ký tmc",
			giaTri: false,
		});
		const goc = await mo(<OTruongPhieu moTa={mt} />);
		const o = goc.querySelector<HTMLElement>("[role=checkbox]");
		const label = o?.id ? goc.querySelector(`label[for="${o.id}"]`) : null;
		const ten =
			label?.textContent?.trim() ?? o?.getAttribute("aria-label") ?? "";
		if (ten !== "Đã ký tmc") throw new Error(`tmc o tich: ten ${ten}`);
		if (!label) throw new Error("tmc o tich: ten ");
		await bam(label);
		if (JSON.stringify(daGoi) !== "[true]") {
			throw new Error(`tmc o tich: bam nhan ${JSON.stringify(daGoi)}`);
		}

		const maTran: { mat: string; el: ReactElement; chu: string }[] = [
			{
				mat: "bang",
				el: <OTruongBang kieu="CHECKBOX" giaTri={true} />,
				chu: mVi.misc.yes,
			},
			{
				mat: "bang",
				el: <OTruongBang kieu="CHECKBOX" giaTri={false} />,
				chu: mVi.misc.no,
			},
			{
				mat: "dau",
				el: <HienThiTruong kieu="CHECKBOX" giaTri={true} />,
				chu: mVi.misc.yes,
			},
			{
				mat: "dau",
				el: <HienThiTruong kieu="CHECKBOX" giaTri={false} />,
				chu: mVi.misc.no,
			},
		];
		let daSo = 1;
		for (const muc of maTran) {
			const g = await mo(muc.el);
			if (g.textContent?.trim() !== muc.chu) {
				throw new Error(
					`tmc o tich: hien ${muc.mat} ${muc.chu} ${g.textContent}`,
				);
			}
			daSo += 1;
		}
		if (daSo !== 5) throw new Error(`tmc o tich: thieu o ${daSo}`);
		expect(daSo).toBe(5);
	});
});

function moTaTuTao(
	kieu: RecordFieldEntry["type"],
	nhan: string,
	giaTri: RecordFieldEntry["value"],
): MoTaTruong {
	return moTaTruongTuTao(
		{
			id: `f-${nhan}`,
			key: nhan,
			label: nhan,
			type: kieu,
			showOnSheet: true,
			options: [],
			value: giaTri,
		},
		() => {},
		() => false,
		NGUOI,
	);
}

const MA_TRAN_LIEN_KET = [
	{ kieu: "URL", giaTri: "onehub.vn", href: "https://onehub.vn", moi: true },
	{ kieu: "URL", giaTri: "http://a.vn/x", href: "http://a.vn/x", moi: true },
	{
		kieu: "EMAIL",
		giaTri: "an@onehub.vn",
		href: "mailto:an@onehub.vn",
		moi: false,
	},
	{
		kieu: "PHONE",
		giaTri: "0901 234 567",
		href: "tel:+84901234567",
		moi: false,
	},
] as const;

async function kiemLienKet(
	mat: string,
	loai: string,
	el: ReactElement,
	o: (typeof MA_TRAN_LIEN_KET)[number],
): Promise<void> {
	const g = await mo(el);
	const a = g.querySelector("a");
	if (!a) throw new Error(`tmc lien ket: ${mat} ${loai} ${o.kieu} a`);
	if (a.getAttribute("href") !== o.href) {
		throw new Error(
			`tmc lien ket: ${mat} ${loai} ${o.kieu} href ${a.getAttribute("href")}`,
		);
	}
	if (o.moi) {
		if (
			a.getAttribute("target") !== "_blank" ||
			!a.getAttribute("rel")?.includes("noopener")
		) {
			throw new Error(
				`tmc lien ket: ${mat} ${loai} ${o.kieu} rel ${a.getAttribute("rel")}`,
			);
		}
	}
}

describe("tmc-lien-ket", () => {
	test("bang dang ky: tu tao tren phieu va bang", async () => {
		const { docSoDienThoai } = await import("@crm/validation/so-dien-thoai");
		const doc = docSoDienThoai("0901 234 567");
		if (doc.kind !== "ok" || `tel:${doc.so}` !== "tel:+84901234567") {
			throw new Error("tmc lien ket: dap an phone lech");
		}
		let daSo = 0;
		for (const o of MA_TRAN_LIEN_KET) {
			const nhan = `${o.kieu} tmc`;
			await kiemLienKet(
				"phieu",
				"tu-tao",
				<OTruongPhieu moTa={moTaTuTao(o.kieu, nhan, o.giaTri)} />,
				o,
			);
			await kiemLienKet(
				"bang",
				"tu-tao",
				<OTruongBang kieu={o.kieu} giaTri={o.giaTri} />,
				o,
			);
			daSo += 2;
		}
		expect(daSo).toBe(8);
	});

	test("nut Sua mo o nhap, gia tri rong khong co a, giao thuc la khong thanh href", async () => {
		const mt = moTaTuTao("URL", "Trang tmc", "onehub.vn");
		const g = await mo(<OTruongPhieu moTa={mt} />);
		const nut = g.querySelector(
			`button[aria-label="${mVi.truongKieu.sua("Trang tmc")}"]`,
		);
		if (!nut) throw new Error("tmc lien ket: thieu nut sua URL");
		await bam(nut);
		if (!g.querySelector("input"))
			throw new Error("tmc lien ket: nut sua khong mo");

		for (const kieu of ["URL", "EMAIL", "PHONE"] as const) {
			const r = await mo(
				<OTruongPhieu moTa={moTaTuTao(kieu, `${kieu} rong`, null)} />,
			);
			if (r.querySelector("a"))
				throw new Error(`tmc lien ket: rong co a ${kieu}`);
		}
		const xau = await mo(
			<OTruongBang kieu="URL" giaTri="javascript:alert(1)" />,
		);
		if (xau.querySelector("a"))
			throw new Error("tmc lien ket: giao thuc la thanh href");
		expect(true).toBe(true);
	});
});

describe("tmc-o-bang", () => {
	test("ma tran o bang theo kieu", async () => {
		const { formatMoney } = await import("@crm/ui/lib/format");
		const maTran: {
			ten: string;
			gia: GiaTriHienThi;
			kiem: (g: HTMLElement) => boolean;
		}[] = [
			{
				ten: "NUMBER 1234.5",
				gia: { kieu: "NUMBER", giaTri: 1234.5 },
				kiem: (g) =>
					g.querySelector(".tabular-nums")?.textContent === "1.234,5",
			},
			{
				ten: "MONEY 123450 VND",
				gia: { kieu: "MONEY", giaTri: 123450, tienTe: "VND" },
				kiem: (g) => g.textContent === formatMoney(123450, "VND", "vi"),
			},
			{
				ten: "DATE 2026-10-22",
				gia: { kieu: "DATE", giaTri: "2026-10-22" },
				kiem: (g) => (g.textContent ?? "").includes("22"),
			},
			{
				ten: "USER co",
				gia: { kieu: "USER", giaTri: "u-an", nguoiDung: NGUOI },
				kiem: (g) => (g.textContent ?? "").includes("An Trần"),
			},
			{
				ten: "USER roi doi",
				gia: { kieu: "USER", giaTri: "u-cu", nguoiDung: NGUOI },
				kiem: (g) => g.textContent?.trim() === "—",
			},
			{
				ten: "CHECKBOX true",
				gia: { kieu: "CHECKBOX", giaTri: true },
				kiem: (g) => g.textContent === mVi.misc.yes,
			},
			{
				ten: "SELECT",
				gia: {
					kieu: "SELECT",
					giaTri: "o-1",
					luaChon: [{ value: "o-1", label: "Vàng" }],
				},
				kiem: (g) => g.textContent === "Vàng",
			},
			{
				ten: "TEXT",
				gia: { kieu: "TEXT", giaTri: "abc" },
				kiem: (g) => g.textContent === "abc",
			},
			{
				ten: "LONG_TEXT",
				gia: { kieu: "LONG_TEXT", giaTri: "dòng dài ".repeat(40) },
				kiem: (g) => g.querySelector(".truncate") !== null,
			},
			{
				ten: "URL",
				gia: { kieu: "URL", giaTri: "onehub.vn" },
				kiem: (g) => g.querySelector("a[href]") !== null,
			},
			{
				ten: "EMAIL",
				gia: { kieu: "EMAIL", giaTri: "an@onehub.vn" },
				kiem: (g) => g.querySelector("a[href]") !== null,
			},
			{
				ten: "PHONE",
				gia: { kieu: "PHONE", giaTri: "0901234567" },
				kiem: (g) => g.querySelector("a[href]") !== null,
			},
		];
		let daSo = 0;
		for (const o of maTran) {
			const g = await mo(<OTruongBang {...o.gia} />);
			if (!o.kiem(g))
				throw new Error(`tmc o bang: ${o.ten} ra ${g.textContent}`);
			daSo += 1;
		}
		for (const kieu of [
			"TEXT",
			"NUMBER",
			"DATE",
			"SELECT",
			"URL",
			"MONEY",
		] as const) {
			const g = await mo(<OTruongBang kieu={kieu} giaTri={null} />);
			if (g.textContent?.trim() !== "—")
				throw new Error(`tmc o bang: ${kieu} null ra ${g.textContent}`);
		}
		if (daSo !== 12) throw new Error(`tmc o bang: thieu o ${daSo}`);
		expect(daSo).toBe(12);
	});
});
