import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	createElement as h,
	type ReactElement,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	fieldAccessOutput,
	fieldListOutput,
} from "../../api/src/fields/fields.contracts";

type CheDoQuyen = "co" | "khong" | "treo";

const TRUONG = [
	{ id: "f-1", key: "cqt_nguon", label: "Nguồn khách", archived: false },
	{ id: "f-2", key: "cqt_vung", label: "Vùng", archived: false },
	{ id: "f-3", key: "cqt_cu", label: "Trường cũ", archived: true },
];

let cheDoQuyen: CheDoQuyen = "co";
let daGoi: string[] = [];

function quaJson<T>(giaTri: T): unknown {
	return JSON.parse(JSON.stringify(giaTri));
}

function dsTruong() {
	return quaJson(
		fieldListOutput.parse(
			TRUONG.map((t, viTri) => ({
				id: t.id,
				entity: "COMPANY",
				key: t.key,
				label: t.label,
				type: "TEXT",
				agentFilled: false,
				agentBrief: null,
				required: false,
				showOnSheet: true,
				showOnTable: false,
				showOnFilter: false,
				position: viTri,
				archived: t.archived,
				options: [],
			})),
		),
	);
}

function thuTuc<TVao>(ten: string, doc: (dauVao: TVao) => unknown) {
	return {
		queryKey: (dauVao?: TVao) => (dauVao === undefined ? [ten] : [ten, dauVao]),
		pathKey: () => [ten],
		queryOptions: (dauVao: TVao) => ({
			queryKey: dauVao === undefined ? [ten] : [ten, dauVao],
			queryFn: async () => doc(dauVao),
		}),
		mutationOptions: () => ({
			mutationKey: [ten],
			mutationFn: async () => {
				daGoi.push(ten);
				return {};
			},
		}),
	};
}

const khongDoc = () => {
	throw new Error("khong doc thu tuc nay");
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		fields: {
			access: thuTuc("fields.access", () => {
				if (cheDoQuyen === "treo") return new Promise(() => {});
				return quaJson(
					fieldAccessOutput.parse({ canManage: cheDoQuyen === "co" }),
				);
			}),
			list: thuTuc("fields.list", dsTruong),
			layout: thuTuc("fields.layout", () => new Promise(() => {})),
			setStandardHidden: thuTuc("fields.setStandardHidden", khongDoc),
			coverage: thuTuc("fields.coverage", () => ({ filled: 0, total: 0 })),
			create: thuTuc("fields.create", khongDoc),
			update: thuTuc("fields.update", khongDoc),
			reorder: thuTuc("fields.reorder", khongDoc),
			archive: thuTuc("fields.archive", khongDoc),
			restore: thuTuc("fields.restore", khongDoc),
			backfill: thuTuc("fields.backfill", khongDoc),
		},
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ fields: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/settings/fields",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({ href, children }: { href: string; children: ReactNode }) =>
		h("a", { href }, children),
}));

const { FieldsSettings } = await import(
	"@/app/(app)/[slug]/settings/fields/fields-settings"
);
const { FieldsSheetHost } = await import(
	"@/components/crm/fields/fields-sheet"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { crmMessages } = await import("@/lib/messages/crm");

const m = crmMessages("vi");
const KHOA = "[data-trang-thai=ST-truong-khong-quyen]";

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 120; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi trang thai ${moTa} — noi dung: ${document.body.textContent?.slice(0, 400)}`,
	);
}

async function mo(man: ReactElement, searchParams: string): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter searchParams={searchParams} hasMemory>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
	dangMo.push(san);
	return san;
}

function nutTheoChu(chu: string): HTMLButtonElement[] {
	return [...document.querySelectorAll<HTMLButtonElement>("button")].filter(
		(b) => b.textContent?.trim() === chu,
	);
}

function nutTheoNhanAn(nhan: string): HTMLButtonElement[] {
	return [...document.querySelectorAll<HTMLButtonElement>("button")].filter(
		(b) => b.querySelector(".sr-only")?.textContent?.trim() === nhan,
	);
}

function nutDong(label: string): HTMLButtonElement | undefined {
	return [...document.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.startsWith(label) && b.textContent !== label,
	);
}

function coOSua(): boolean {
	return document.querySelector("input") !== null;
}

function trangThaiNut(): string[] {
	const moi = nutTheoChu(m.fields.newField);
	const them = nutTheoChu(m.fields.add);
	const keo = nutTheoNhanAn("Đổi thứ tự Nguồn khách");
	const menu = nutTheoNhanAn(m.fields.moreFor("Nguồn khách"));
	const khoiPhuc = nutTheoChu(m.fields.restore);
	const dong = nutDong("Nguồn khách");
	return [
		`Truong moi ${moi.length > 0 && moi.every((b) => b.disabled)}`,
		`Them ${them.length > 0 && them.every((b) => b.disabled)}`,
		`keo ${keo.length > 0 && keo.every((b) => b.disabled)}`,
		`menu dong ${menu.length > 0 && menu.every((b) => b.disabled)}`,
		`Khoi phuc ${khoiPhuc.length > 0 && khoiPhuc.every((b) => b.disabled)}`,
		`dong ${dong?.disabled === true}`,
	];
}

async function moKhoiPhuc(): Promise<void> {
	const hang = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.includes(m.fields.archivedRow),
	);
	if (!hang) throw new Error("khong thay hang Da luu tru");
	await act(async () => {
		hang.click();
	});
}

async function moGoiY(): Promise<void> {
	const hang = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.includes(m.fields.suggestedRow),
	);
	if (!hang) throw new Error("khong thay hang Goi y");
	await act(async () => {
		hang.click();
	});
}

async function kiemMan(
	man: () => ReactElement,
	thamSo: string,
	nhanMan: string,
): Promise<void> {
	cheDoQuyen = "khong";
	await mo(man(), thamSo);
	await cho(() => coChu("Nguồn khách"), `${nhanMan} member tai danh sach`);
	await moKhoiPhuc();
	await moGoiY();
	await cho(
		() => document.querySelector(KHOA) !== null,
		`${nhanMan} dong khoa`,
	);
	expect(
		`${nhanMan} dong khoa: ${document.querySelector(KHOA)?.textContent}`,
	).toBe(`${nhanMan} dong khoa: ${m.fields.canQuyen}`);
	expect(trangThaiNut().map((x) => `${nhanMan} member ${x}`)).toEqual(
		[
			"Truong moi true",
			"Them true",
			"keo true",
			"menu dong true",
			"Khoi phuc true",
			"dong true",
		].map((x) => `${nhanMan} member ${x}`),
	);
	await act(async () => {
		nutDong("Nguồn khách")?.click();
	});
	expect(`${nhanMan} member bam dong mo o sua ${coOSua()}`).toBe(
		`${nhanMan} member bam dong mo o sua false`,
	);
	for (const san of dangMo) act(() => san.root.unmount());
	dangMo = [];
	document.body.innerHTML = "";

	cheDoQuyen = "co";
	await mo(man(), thamSo);
	await cho(() => coChu("Nguồn khách"), `${nhanMan} admin tai danh sach`);
	await moKhoiPhuc();
	await moGoiY();
	await cho(
		() => trangThaiNut()[0] === "Truong moi false",
		`${nhanMan} admin nut sang`,
	);
	expect(
		`${nhanMan} admin dong khoa ${document.querySelector(KHOA) !== null}`,
	).toBe(`${nhanMan} admin dong khoa false`);
	expect(trangThaiNut().map((x) => `${nhanMan} admin ${x}`)).toEqual(
		[
			"Truong moi false",
			"Them false",
			"keo false",
			"menu dong false",
			"Khoi phuc false",
			"dong false",
		].map((x) => `${nhanMan} admin ${x}`),
	);
	await act(async () => {
		nutDong("Nguồn khách")?.click();
	});
	await cho(() => coOSua(), `${nhanMan} admin bam dong mo o sua`);
}

function coChu(chu: string): boolean {
	return document.body.textContent?.includes(chu) === true;
}

beforeEach(() => {
	cheDoQuyen = "co";
	daGoi = [];
});

afterEach(() => {
	for (const san of dangMo) act(() => san.root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
});

describe("cqt-man-khoa", () => {
	test("cqt-man-khoa: Cai dat › Truong khoa cho thanh vien, sang cho quan tri", async () => {
		await kiemMan(() => <FieldsSettings kindBanDau="company" />, "", "cai dat");
		expect(`khong loi goi doi nao ${daGoi.join(",")}`).toBe(
			"khong loi goi doi nao ",
		);
	});

	test("cqt-man-khoa: duong ?truong= khong mo o sua cho thanh vien", async () => {
		for (const thamSo of ["?truong=new", "?truong=cqt_nguon"]) {
			cheDoQuyen = "khong";
			await mo(<FieldsSettings kindBanDau="company" />, thamSo);
			await cho(() => coChu("Nguồn khách"), `member ${thamSo}`);
			expect(`member ${thamSo} o sua ${coOSua()}`).toBe(
				`member ${thamSo} o sua false`,
			);
			for (const san of dangMo) act(() => san.root.unmount());
			dangMo = [];
			document.body.innerHTML = "";

			cheDoQuyen = "co";
			await mo(<FieldsSettings kindBanDau="company" />, thamSo);
			await cho(() => coOSua(), `admin ${thamSo} o sua`);
			for (const san of dangMo) act(() => san.root.unmount());
			dangMo = [];
			document.body.innerHTML = "";
		}
	});

	test("cqt-man-khoa: quyen dang tai thi tinh la khoa", async () => {
		cheDoQuyen = "treo";
		await mo(<FieldsSettings kindBanDau="company" />, "");
		await cho(() => coChu("Nguồn khách"), "dang tai quyen");
		const moi = nutTheoChu(m.fields.newField);
		expect(
			`dang tai: dong khoa ${document.querySelector(KHOA) !== null} Truong moi ${moi.length > 0 && moi.every((b) => b.disabled)}`,
		).toBe("dang tai: dong khoa true Truong moi true");
	});
});

describe("cqt-sheet-khoa", () => {
	test("cqt-sheet-khoa: bang Truong tu ho so khoa cho thanh vien, sang cho quan tri", async () => {
		await kiemMan(() => <FieldsSheetHost />, "?manageFields=company", "sheet");
		expect(`khong loi goi doi nao ${daGoi.join(",")}`).toBe(
			"khong loi goi doi nao ",
		);
	});
});
