import { afterEach, describe, expect, mock, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
	act,
	isValidElement,
	type ReactElement,
	type ReactNode,
	Suspense,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import ts from "typescript";

mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" }));
mock.module("@/lib/session", () => ({ requireSession: async () => null }));
mock.module("@/lib/trpc/hydrate", () => ({
	HydrateClient: ({ children }: { children: unknown }) => children,
}));
mock.module("server-only", () => ({}));
mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/okr/theo-don-vi",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("@/lib/trpc/server", () => ({
	getServerTrpc: () => ({}),
	getServerQueryClient: () => ({}),
	getServerTrpcClient: () => ({}),
}));

const { default: TheoDonViPage } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/page"
);
const { KhungDangTaiDonVi, HangCongCuDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/hang-cong-cu"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrMessages } = await import("@/lib/messages/okr");

const M = okrMessages("vi");
const THU_MUC = join(
	dirname(fileURLToPath(import.meta.url)),
	"../app/(app)/[slug]/okr/theo-don-vi",
);
const TABBABLE =
	'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function phai(dieu: boolean, thongDiep: string) {
	if (!dieu) throw new Error(thongDiep);
}

function ve(cay: ReactNode): HTMLElement {
	act(() => root?.unmount());
	document.body.innerHTML = "";
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() =>
		root?.render(
			<LocaleProvider locale="vi">
				<TooltipProvider>{cay}</TooltipProvider>
			</LocaleProvider>,
		),
	);
	return o;
}

function timSuspense(nut: ReactNode): ReactElement | null {
	if (Array.isArray(nut)) {
		for (const con of nut) {
			const thay = timSuspense(con);
			if (thay) return thay;
		}
		return null;
	}
	if (!isValidElement(nut)) return null;
	if (nut.type === Suspense) return nut;
	return timSuspense((nut.props as { children?: ReactNode }).children);
}

function fallbackCuaTrang(): ReactElement {
	const cay = TheoDonViPage({ searchParams: Promise.resolve({}) });
	const s = timSuspense(cay);
	phai(s !== null, "SAI AC-5: page.tsx khong co Suspense");
	const fallback = s ? (s.props as { fallback?: ReactNode }).fallback : null;
	phai(
		isValidElement(fallback),
		"SAI AC-5: Suspense cua page.tsx khong co fallback",
	);
	return fallback as ReactElement;
}

const hangThat = (
	<HangCongCuDonVi
		chon={
			<button data-chon-don-vi type="button">
				Phòng Kinh doanh
			</button>
		}
	/>
);

function chuKy(o: HTMLElement) {
	const khung = o.querySelector('[data-khung-xuong="bang-hai-dong"]');
	phai(khung !== null, "SAI AC-5: khung khong phai bang-hai-dong");
	const dong = [...(khung?.querySelectorAll('[data-khung-hang="hang"]') ?? [])];
	return {
		so: dong.length,
		vach: dong.map((d) => d.querySelectorAll("[data-slot=skeleton]").length),
		lopDong: dong.map((d) => d.className),
		lopDauBang:
			khung?.querySelector('[data-khung-hang="dau-bang"]')?.className ?? null,
	};
}

type LoiVeTay = { tep: string; ly_do: string };

function quetVeTay(): LoiVeTay[] {
	const loi: LoiVeTay[] = [];
	for (const ten of readdirSync(THU_MUC, { recursive: true }) as string[]) {
		if (!/\.tsx?$/.test(ten)) continue;
		const duong = join(THU_MUC, ten);
		const nguon = ts.createSourceFile(
			duong,
			readFileSync(duong, "utf8"),
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);
		const tep = relative(THU_MUC, duong);
		const di = (n: ts.Node) => {
			if (ts.isImportDeclaration(n)) {
				const ten = n.importClause?.namedBindings;
				const coSkeleton =
					n.importClause?.name?.text === "Skeleton" ||
					(ten !== undefined &&
						ts.isNamedImports(ten) &&
						ten.elements.some(
							(e) =>
								e.name.text === "Skeleton" ||
								e.propertyName?.text === "Skeleton",
						));
				if (coSkeleton) loi.push({ tep, ly_do: "nhap Skeleton" });
			}
			if (
				(ts.isStringLiteral(n) ||
					ts.isNoSubstitutionTemplateLiteral(n) ||
					ts.isTemplateHead(n) ||
					ts.isTemplateMiddle(n) ||
					ts.isTemplateTail(n) ||
					ts.isJsxText(n)) &&
				n.text.includes("animate-pulse")
			)
				loi.push({ tep, ly_do: "lop animate-pulse" });
			ts.forEachChild(n, di);
		};
		di(nguon);
	}
	return loi;
}

describe("kcd-cau-truc", () => {
	test("fallback cua page.tsx chinh la KhungDangTaiDonVi", () => {
		const fallback = fallbackCuaTrang();
		phai(
			fallback.type === KhungDangTaiDonVi,
			"SAI AC-5: fallback page.tsx khong phai KhungDangTaiDonVi",
		);
	});

	test("ba pha cung mot chu ky than bang", () => {
		const ky = [
			chuKy(ve(fallbackCuaTrang())),
			chuKy(ve(<KhungDangTaiDonVi />)),
			chuKy(ve(<KhungDangTaiDonVi hang={hangThat} />)),
		];
		expect(ky[0]?.so).toBe(5);
		for (const k of ky.slice(1)) expect(k).toEqual(ky[0] as typeof k);
		for (const v of ky[0]?.vach ?? []) expect(v).toBeGreaterThanOrEqual(2);
	});

	test("khong tep nao duoi theo-don-vi tu ve vach", () => {
		const loi = quetVeTay();
		phai(
			loi.length === 0,
			loi.map((l) => `SAI AC-5: ${l.tep} tu ve vach (${l.ly_do})`).join("\n"),
		);
	});
});

describe("kcd-a11y", () => {
	const CA: [string, () => ReactNode][] = [
		["fallback page.tsx", () => fallbackCuaTrang()],
		["khung khong hang", () => <KhungDangTaiDonVi />],
		["khung co hang", () => <KhungDangTaiDonVi hang={hangThat} />],
	];

	for (const [ten, dung] of CA) {
		test(`${ten}: aria-busy, mot dong Dang tai OKR, vach an`, () => {
			const o = ve(dung());
			const trangThai = o.querySelectorAll('[role="status"]');
			phai(
				trangThai.length === 1 && trangThai[0]?.textContent === M.dangTai,
				ten === "fallback page.tsx"
					? "SAI AC-7: fallback page.tsx khong doc Dang tai OKR"
					: `SAI AC-7: ${ten} khong doc dung mot cau Dang tai OKR`,
			);
			const vo = o.querySelector('[data-trang-thai="ST-donvi-dangtai"]');
			phai(vo !== null, `SAI AC-7: ${ten} thieu ST-donvi-dangtai`);
			phai(
				vo?.getAttribute("aria-busy") === "true",
				`SAI AC-7: ${ten} khong aria-busy`,
			);
			for (const vach of o.querySelectorAll("[data-slot=skeleton]"))
				phai(
					vach.closest('[aria-hidden="true"]') !== null,
					`SAI AC-7: ${ten} co vach ngoai phan an`,
				);
			phai(
				o.querySelectorAll(
					TABBABLE.split(", ")
						.map((s) => `[aria-hidden="true"] ${s}`)
						.join(", "),
				).length === 0,
				`SAI AC-7: ${ten} co phan tu nhan tieu diem trong phan an`,
			);
		});
	}

	test("khung co hang: o chon don vi ngoai phan an va nhan tieu diem", () => {
		const o = ve(<KhungDangTaiDonVi hang={hangThat} />);
		const oChon = o.querySelector<HTMLElement>("[data-chon-don-vi]");
		phai(oChon !== null, "SAI AC-7: khung co hang thieu o chon don vi");
		phai(
			oChon?.closest('[aria-hidden="true"]') === null,
			"SAI AC-7: o chon don vi nam trong phan an",
		);
		act(() => oChon?.focus());
		phai(
			document.activeElement === oChon,
			"SAI AC-7: o chon don vi khong nhan tieu diem",
		);
	});
});
