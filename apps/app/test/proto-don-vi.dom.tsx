import { afterEach, describe, expect, mock, test } from "bun:test";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";

/* Bản mẫu /proto/trang-don-vi-mot-bang (AC-11, E13): mỗi state của sổ bản mẫu
   dựng bằng chính hàm của sổ (TrangDonViMotBangMau) ra một cây DOM khác nhau.
   rang/proto-don-vi.mjs chạy nhóm này và đọc dòng «PROTO-DOM: …». */

const SLUG = "trang-don-vi-mot-bang";

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({}),
	usePathname: () => `/proto/${SLUG}`,
	useSearchParams: () => new URLSearchParams(),
	notFound: () => {
		throw new Error("notFound");
	},
}));
mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));

const { PROTO_CATALOG } = await import("@/app/proto/catalog");
// Hàm của sổ bản mẫu cho slug này (registry.ts ghép slug → TrangDonViMotBangMau);
// nhập thẳng mô-đun để khỏi nạp mọi bản mẫu khác của sổ.
const { TrangDonViMotBangMau } = await import(
	"@/app/proto/_modules/trang-don-vi-mot-bang"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");

afterEach(() => {
	document.body.innerHTML = "";
});

/** Bỏ id do React/Radix sinh để hai lần dựng cùng state cho cùng một chuỗi. */
const chuan = (html: string) =>
	html
		.replace(
			/(id|for|aria-[a-z]+|data-radix-[a-z-]+)="[^"]*(«|:r|radix-)[^"]*"/g,
			'$1=""',
		)
		.replace(/«[^»]*»/g, "");

async function dung(state: string): Promise<string> {
	const Proto = TrangDonViMotBangMau;
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory>
				<LocaleProvider locale="vi">
					<TooltipProvider>
						<Proto state={state} />
					</TooltipProvider>
				</LocaleProvider>
			</NuqsTestingAdapter>,
		);
	});
	for (let i = 0; i < 10; i += 1)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	const html = chuan(document.body.innerHTML);
	await act(async () => root.unmount());
	o.remove();
	document.body.innerHTML = "";
	return html;
}

describe("dvb-proto", () => {
	test("moi state cua so ban mau dung ra mot cay DOM khac nhau", async () => {
		const muc = PROTO_CATALOG.find((m) => m.slug === SLUG);
		if (!muc) throw new Error(`dvb-proto: PROTO_CATALOG khong co ${SLUG}`);
		const theoDom = new Map<string, string[]>();
		for (const s of muc.states) {
			const html = await dung(s.id);
			if (html.trim() === "")
				throw new Error(`dvb-proto: ${s.id} dung ra DOM rong`);
			theoDom.set(html, [...(theoDom.get(html) ?? []), s.id]);
		}
		const trung = [...theoDom.values()].filter((ids) => ids.length > 1);
		console.log(
			`PROTO-DOM: ${theoDom.size}/${muc.states.length} DOM khac nhau${trung.length ? ` · trung ${trung.map((x) => x.join("=")).join(", ")}` : ""}`,
		);
		expect(trung).toEqual([]);
	});
});
