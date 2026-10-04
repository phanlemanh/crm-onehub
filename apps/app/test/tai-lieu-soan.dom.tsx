import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";

type Editor = {
	getText: () => string;
	chain: () => {
		focus: (vi: "end") => {
			insertContent: (chu: string) => { run: () => boolean };
		};
	};
	commands: { undo: () => boolean };
};
type VaoTao = { ten: string; noiDung: string };
type VaoDeXuat = {
	slug: string;
	ten?: string;
	noiDung: string;
	tuDeXuatId?: string;
};
type TuyChonDotBien<V, R> = {
	onSuccess?: (r: R, v: V) => unknown;
};

type GoiSoan = { tao: VaoTao[]; deXuat: VaoDeXuat[]; den: string[] };

let slugWs = "ws";

const goi: GoiSoan = {
	tao: [],
	deXuat: [],
	den: [],
};

function dotBien<V, R>(ten: string, ghi: V[], tra: (v: V) => R) {
	return {
		mutationOptions: (tuy: TuyChonDotBien<V, R> = {}) => ({
			...tuy,
			mutationKey: [ten],
			mutationFn: async (v: V) => {
				ghi.push(v);
				return tra(v);
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		taiLieu: {
			create: dotBien("taiLieu.create", goi.tao, () => ({
				slug: "quy-dinh-moi",
			})),
			propose: dotBien("taiLieu.propose", goi.deXuat, () => ({
				deXuatId: "dx-1",
			})),
			tim: {
				queryOptions: (v: { q: string }) => ({
					queryKey: ["taiLieu.tim", v],
					queryFn: async () => ({
						rows: [{ slug: "quy-dinh-moi", ten: "Quy định mới" }],
					}),
				}),
			},
		},
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ taiLieu: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: (den: string) => {
			goi.den.push(den);
		},
		replace: () => {},
		refresh: () => {},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: slugWs }),
	usePathname: () => "/ws/tai-lieu",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));

const khoi =
	(the: string) =>
	({ children }: { children?: ReactNode }) =>
		h(the, null, children);
mock.module("@/components/page-shell", () => ({
	PageShellHeader: khoi("header"),
	PageShellHeading: khoi("div"),
	PageShellTitle: khoi("h1"),
	PageShellDescription: khoi("p"),
	PageShellActions: khoi("div"),
	PageShellContent: khoi("div"),
}));

const khoangRong = () => ({
	x: 0,
	y: 0,
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	width: 0,
	height: 0,
	toJSON: () => ({}),
});
Object.defineProperty(window.Range.prototype, "getClientRects", {
	value: () => Object.assign([khoangRong()], { item: () => khoangRong() }),
	configurable: true,
});
Object.defineProperty(window.Range.prototype, "getBoundingClientRect", {
	value: khoangRong,
	configurable: true,
});
Object.defineProperty(document, "elementFromPoint", {
	value: () => null,
	configurable: true,
});

const { ManSoan } = await import("@/app/(app)/[slug]/tai-lieu/man-soan");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

type Vao = ComponentProps<typeof ManSoan>["vao"];

const BAN_GOC = [
	"## Phạm vi",
	"",
	"Đối tác nhận hoa hồng trong 48 giờ.",
	"",
	"- Mục một",
	"- Mục hai",
].join("\n");

const MOI: Vao = {
	kieu: "moi",
	toiId: "u-1",
	chuTrang: [
		{ id: "u-1", ten: "Nguyễn Thu Hà" },
		{ id: "u-2", ten: "Trần An" },
	],
	donVi: [{ id: "pb-1", ten: "Phòng Đối tác" }],
};

const SUA: Vao = {
	kieu: "sua",
	slug: "quy-dinh-hoa-hong",
	ten: "Quy định hoa hồng",
	banGoc: BAN_GOC,
};

const HOI_LAI = "Bỏ những gì vừa nhập?";
const LIEN_KET_RAIL = "/x/okr";

let dangMo: Root[] = [];

afterEach(() => {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
	goi.tao.length = 0;
	goi.deXuat.length = 0;
	goi.den.length = 0;
	slugWs = "ws";
});

async function nhip(): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

async function mo(vao: Vao): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">
					<a
						data-lien-ket-rail=""
						href={LIEN_KET_RAIL}
						onClick={(e) => {
							e.preventDefault();
							goi.den.push(LIEN_KET_RAIL);
						}}
					>
						Mục tiêu
					</a>
					<ManSoan vao={vao} />
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	for (let i = 0; i < 3; i += 1) await nhip();
}

function nut(chu: string): HTMLButtonElement {
	const n = [
		...document.body.querySelectorAll<HTMLButtonElement>("button"),
	].find((b) => b.textContent?.trim() === chu);
	if (!n)
		throw new Error(`khong thay nut ${chu} — ${document.body.textContent}`);
	return n;
}

function oTen(): HTMLInputElement {
	const o = document.body.querySelector<HTMLInputElement>("input[name='ten']");
	if (!o) throw new Error("khong thay o ten");
	return o;
}

function editor(): Editor {
	const o = document.body.querySelector<HTMLElement & { editor?: Editor }>(
		"[role='textbox']",
	);
	if (!o?.editor) throw new Error("khong thay trinh soan");
	return o.editor;
}

async function bam(n: HTMLButtonElement): Promise<void> {
	await act(async () => {
		n.click();
	});
	for (let i = 0; i < 4; i += 1) await nhip();
}

async function goTen(chu: string): Promise<void> {
	const o = oTen();
	await act(async () => {
		o.focus();
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			"value",
		)?.set?.call(o, chu);
		o.dispatchEvent(new InputEvent("input", { bubbles: true }));
	});
	await nhip();
}

async function goNoiDung(chu: string): Promise<void> {
	await act(async () => {
		editor().chain().focus("end").insertContent(chu).run();
	});
	await nhip();
}

async function hoanTac(): Promise<void> {
	await act(async () => {
		editor().commands.undo();
	});
	await nhip();
}

function loiDuoiTen(): string | null {
	const field = oTen().closest("[data-slot='field']");
	return field?.querySelector("[data-slot='field-error']")?.textContent ?? null;
}

const guiDuyet = () => nut("Gửi duyệt");
const chuaDoiHien = () =>
	document.body.textContent?.includes("Chưa có thay đổi") ?? false;

async function bamLienKet(): Promise<boolean> {
	const a = document.body.querySelector<HTMLAnchorElement>(
		"[data-lien-ket-rail]",
	);
	if (!a) throw new Error("khong thay lien ket rail");
	let diTiep = true;
	await act(async () => {
		diTiep = a.dispatchEvent(
			new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }),
		);
	});
	for (let i = 0; i < 4; i += 1) await nhip();
	return diTiep;
}

describe("tai-lieu man soan", () => {
	test("tao-loi: ten trong, bam Gui duyet -> loi duoi o ten, focus o ten, khong goi", async () => {
		await mo(MOI);
		await goNoiDung("Nội dung trang.");
		await bam(guiDuyet());
		expect(loiDuoiTen()).toBe("Nhập tên trang.");
		expect(oTen().getAttribute("aria-invalid")).toBe("true");
		if (document.activeElement !== oTen())
			throw new Error("o loi khong nhan focus");
		expect(goi.tao.length).toBe(0);
	});

	test("tao-loi: ten 161 ky tu -> loi do dai, khong goi", async () => {
		await mo(MOI);
		await goNoiDung("Nội dung trang.");
		await goTen("a".repeat(161));
		await bam(guiDuyet());
		expect(loiDuoiTen()).toBe("Tên trang dài quá 160 ký tự.");
		if (document.activeElement !== oTen())
			throw new Error("o loi khong nhan focus");
		expect(goi.tao.length).toBe(0);
	});

	test("tao-loi doi chung: ten hop le -> goi tao mot lan, khong loi", async () => {
		await mo(MOI);
		await goNoiDung("Nội dung trang.");
		await goTen("Quy định mới");
		await bam(guiDuyet());
		expect(loiDuoiTen()).toBeNull();
		expect(goi.tao.length).toBe(1);
		expect(goi.tao[0]?.ten).toBe("Quy định mới");
		expect(goi.den).toEqual(["/ws/tai-lieu/quy-dinh-moi"]);
	});

	test("chua-doi: man sua mo ban dang dung -> Gui duyet khoa; go mot ky tu -> bat; hoan tac -> khoa lai", async () => {
		await mo(SUA);
		expect(editor().getText()).toContain("Đối tác nhận hoa hồng trong 48 giờ.");
		if (!guiDuyet().disabled) throw new Error("nut gui bat khi chua doi");
		expect(chuaDoiHien()).toBe(true);

		await goNoiDung("x");
		expect(guiDuyet().disabled).toBe(false);
		expect(chuaDoiHien()).toBe(false);

		await hoanTac();
		if (!guiDuyet().disabled) throw new Error("nut gui bat khi chua doi");
		expect(chuaDoiHien()).toBe(true);

		await bam(guiDuyet());
		expect(goi.deXuat.length).toBe(0);
	});

	test("chua-doi: man tao noi dung trong -> Gui duyet khoa voi 'Chua co noi dung'; go noi dung -> bat", async () => {
		await mo(MOI);
		await goTen("Quy định mới");
		if (!guiDuyet().disabled)
			throw new Error("nut gui bat khi chua co noi dung");
		expect(document.body.textContent).toContain("Chưa có nội dung");
		await bam(guiDuyet());
		expect(goi.tao.length).toBe(0);

		await goNoiDung("   ");
		if (!guiDuyet().disabled)
			throw new Error("nut gui bat khi chua co noi dung");

		await goNoiDung("Có chữ.");
		expect(guiDuyet().disabled).toBe(false);
		expect(document.body.textContent?.includes("Chưa có nội dung")).toBe(false);
	});

	test("chua-doi doi chung: sua xong gui -> goi de xuat mot lan voi noi dung moi", async () => {
		await mo(SUA);
		await goNoiDung(" Thêm câu.");
		await bam(guiDuyet());
		expect(goi.deXuat.length).toBe(1);
		expect(goi.deXuat[0]?.slug).toBe("quy-dinh-hoa-hong");
		expect(goi.deXuat[0]?.noiDung).toContain("Thêm câu.");
		expect(goi.deXuat[0]?.tuDeXuatId).toBeUndefined();
	});

	test("sua-ban-may: man sua mo tu ban may soan -> de xuat gui kem tuDeXuatId de giu nguon", async () => {
		await mo({ ...SUA, tuDeXuatId: "dx-may" });
		await goNoiDung(" Thêm câu.");
		await bam(guiDuyet());
		expect(goi.deXuat.map((v) => v.tuDeXuatId)).toEqual(["dx-may"]);
	});

	test("giu-thay-doi: co thay doi chua gui, bam Huy -> hop hoi lai hien, khong roi man", async () => {
		await mo(SUA);
		await goNoiDung("x");
		await bam(nut("Huỷ"));
		if (!document.body.textContent?.includes(HOI_LAI))
			throw new Error("roi man khong hoi lai");
		expect(goi.den).toEqual([]);

		await bam(nut("Bỏ"));
		expect(goi.den).toEqual(["/ws/tai-lieu/quy-dinh-hoa-hong"]);
	});

	test("giu-thay-doi doi chung: khong thay doi, bam Huy -> roi man ngay, khong hoi", async () => {
		await mo(SUA);
		await bam(nut("Huỷ"));
		expect(document.body.textContent?.includes(HOI_LAI)).toBe(false);
		expect(goi.den).toEqual(["/ws/tai-lieu/quy-dinh-hoa-hong"]);
	});

	test("giu-thay-doi: co thay doi, bam lien ket trong app -> hop hoi lai hien, chua dieu huong; Bo thi di toi lien ket", async () => {
		await mo(SUA);
		await goNoiDung("x");
		await bamLienKet();
		if (!document.body.textContent?.includes(HOI_LAI) || goi.den.length > 0)
			throw new Error("roi man qua lien ket khong hoi lai");

		await bam(nut("Bỏ"));
		expect(goi.den).toEqual([LIEN_KET_RAIL]);
	});

	test("giu-thay-doi doi chung: khong thay doi, bam lien ket -> dieu huong thang, khong hoi", async () => {
		await mo(SUA);
		await bamLienKet();
		expect(document.body.textContent?.includes(HOI_LAI)).toBe(false);
		expect(goi.den).toEqual([LIEN_KET_RAIL]);
	});
});

describe("kn-tien-to", () => {
	test("kn-tien-to: lien ket chen qua hop mang tien to workspace that do ManSoan dung", async () => {
		slugWs = "kho-thu";
		await mo(SUA);
		const nutLienKet = document.body.querySelector<HTMLButtonElement>(
			'button[aria-label="Liên kết tới trang"]',
		);
		if (!nutLienKet) throw new Error("kn-tien-to: khong thay nut lien ket");
		await bam(nutLienKet);
		const o = document.body.querySelector<HTMLInputElement>(
			'input[aria-label="Gõ tên trang"]',
		);
		if (!o) throw new Error("kn-tien-to: khong thay o tim trang");
		await act(async () => {
			Object.getOwnPropertyDescriptor(
				HTMLInputElement.prototype,
				"value",
			)?.set?.call(o, "quy");
			o.dispatchEvent(new Event("input", { bubbles: true }));
		});
		for (let i = 0; i < 4; i += 1) await nhip();
		const dong = document.body.querySelector<HTMLElement>(
			'[data-goi-y-trang="quy-dinh-moi"]',
		);
		if (!dong) throw new Error("kn-tien-to: khong thay dong goi y");
		await act(async () => {
			dong.dispatchEvent(
				new window.PointerEvent("pointerdown", { bubbles: true }),
			);
			dong.click();
		});
		for (let i = 0; i < 3; i += 1) await nhip();
		await bam(nut("Gửi duyệt"));
		const md = goi.deXuat.at(-1)?.noiDung ?? "";
		if (!md.includes("(/kho-thu/tai-lieu/quy-dinh-moi)") || md.includes("/ws/")) {
			throw new Error(`kn-tien-to: href thieu tien to /kho-thu/ — ${md}`);
		}
	});
});
