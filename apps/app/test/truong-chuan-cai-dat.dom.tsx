import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, createElement as h, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { fieldListOutput } from "../../api/src/fields/fields.contracts";

type CheDo = "tra" | "treo" | "loi";

type TruongGia = {
	id: string;
	key: string;
	label: string;
	type?: string;
	required?: boolean;
	showOnSheet?: boolean;
	archived?: boolean;
};

const kho = {
	cheDoBoTri: "tra" as CheDo,
	boTri: [] as unknown[],
	truong: [] as TruongGia[],
	quyen: true,
	daGoi: [] as { ten: string; bien: unknown }[],
	loiGhi: new Map<string, string>(),
};

const toastLoi: string[] = [];
const toastDung: string[] = [];
const sonnerThat = await import("sonner");
const toastGia = Object.assign(
	(thongDiep: string) => {
		toastDung.push(thongDiep);
		return "ok";
	},
	sonnerThat.toast,
	{
		success: (thongDiep: string) => {
			toastDung.push(thongDiep);
			return "ok";
		},
		error: (thongDiep: string) => {
			toastLoi.push(thongDiep);
			return "loi";
		},
	},
);
mock.module("sonner", () => ({ ...sonnerThat, toast: toastGia }));

function quaJson<T>(giaTri: T): unknown {
	return JSON.parse(JSON.stringify(giaTri));
}

function dsTruong(entity: string) {
	return quaJson(
		fieldListOutput.parse(
			kho.truong.map((t, viTri) => ({
				id: t.id,
				entity,
				key: t.key,
				label: t.label,
				type: t.type ?? "TEXT",
				agentFilled: false,
				agentBrief: null,
				required: t.required ?? false,
				showOnSheet: t.showOnSheet ?? true,
				showOnTable: false,
				showOnFilter: false,
				position: viTri,
				archived: t.archived ?? false,
				options: [],
			})),
		),
	);
}

class LoiGia extends Error {}

function thuTuc<TVao>(ten: string, doc: (dauVao: TVao) => unknown) {
	return {
		queryKey: (dauVao?: TVao) => (dauVao === undefined ? [ten] : [ten, dauVao]),
		pathKey: () => [ten],
		queryOptions: (dauVao: TVao) => ({
			queryKey: dauVao === undefined ? [ten] : [ten, dauVao],
			queryFn: async () => doc(dauVao),
			retry: false,
		}),
		mutationOptions: (tuyChon: Record<string, unknown> = {}) => ({
			...tuyChon,
			mutationKey: [ten],
			mutationFn: async (bien: unknown) => {
				kho.daGoi.push({ ten, bien });
				const loi = kho.loiGhi.get(ten);
				if (loi) throw new LoiGia(loi);
				return ten === "fields.setStandardHidden" ? kho.boTri : [];
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		fields: {
			access: thuTuc("fields.access", () => ({ canManage: kho.quyen })),
			list: thuTuc("fields.list", (vao: { entity: string }) =>
				dsTruong(vao.entity),
			),
			layout: thuTuc("fields.layout", () => {
				if (kho.cheDoBoTri === "treo") return new Promise(() => {});
				if (kho.cheDoBoTri === "loi") throw new LoiGia("layout failed");
				return kho.boTri;
			}),
			coverage: thuTuc("fields.coverage", () => ({ filled: 0, total: 0 })),
			create: thuTuc("fields.create", () => ({})),
			update: thuTuc("fields.update", () => ({})),
			reorder: thuTuc("fields.reorder", () => []),
			setStandardHidden: thuTuc("fields.setStandardHidden", () => []),
			archive: thuTuc("fields.archive", () => ({})),
			restore: thuTuc("fields.restore", () => ({})),
			backfill: thuTuc("fields.backfill", () => ({})),
		},
		users: { list: thuTuc("users.list", () => []) },
	}),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ fields: async () => {} }),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { STANDARD_FIELD_KEYS } = await import("@crm/db/fields-chuan");
const { useBoTriTruong } = await import(
	"@/components/crm/fields/use-bo-tri-truong"
);
const { nhanTruongChuan } = await import(
	"@/components/crm/fields/truong-chuan"
);

const goc: { root: Root | null; el: HTMLElement | null } = {
	root: null,
	el: null,
};

async function ve(phan: ReactElement, locale: "vi" | "en" = "vi") {
	const el = document.createElement("div");
	document.body.appendChild(el);
	const qc = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const root = createRoot(el);
	await act(async () => {
		root.render(
			h(
				QueryClientProvider,
				{ client: qc },
				h(LocaleProvider, { locale }, phan),
			),
		);
	});
	goc.root = root;
	goc.el = el;
	return el;
}

async function cho(ms = 20) {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

afterEach(async () => {
	await act(async () => {
		goc.root?.unmount();
	});
	goc.el?.remove();
	kho.cheDoBoTri = "tra";
	kho.boTri = [];
	kho.truong = [];
	kho.quyen = true;
	kho.daGoi = [];
	kho.loiGhi.clear();
	toastLoi.length = 0;
	toastDung.length = 0;
});

function InBoTri({ entity }: { entity: "DEAL" | "COMPANY" | "CONTACT" }) {
	const { muc } = useBoTriTruong(entity);
	return h("ol", null, ...muc.map((m) => h("li", { key: m.key }, m.key)));
}

const TIENG_ANH_CU = [
	"Name",
	"Amount",
	"Currency",
	"Close date",
	"Owner",
	"First name",
	"Last name",
	"Stage",
];

describe("tcc-moc-bo-tri", () => {
	test("bo tri treo hay loi thi ve thu tu mac dinh cua danh muc", async () => {
		for (const cheDo of ["treo", "loi"] as const) {
			for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
				kho.cheDoBoTri = cheDo;
				const el = await ve(h(InBoTri, { entity }));
				await cho();
				const khoa = [...el.querySelectorAll("li")].map((li) => li.textContent);
				if (
					JSON.stringify(khoa) !== JSON.stringify(STANDARD_FIELD_KEYS[entity])
				) {
					throw new Error(
						`tcc moc bo tri: ${cheDo} ${entity} ${JSON.stringify(khoa)}`,
					);
				}
				await act(async () => {
					goc.root?.unmount();
				});
				el.remove();
			}
		}
		expect(true).toBe(true);
	});

	test("nhan truong chuan theo locale, khong con tieng Anh o vi", () => {
		let so = 0;
		for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
			const vi = STANDARD_FIELD_KEYS[entity].map((k) =>
				nhanTruongChuan(entity, k, "vi"),
			);
			const en = STANDARD_FIELD_KEYS[entity].map((k) =>
				nhanTruongChuan(entity, k, "en"),
			);
			for (const [i, nhan] of vi.entries()) {
				if (!nhan || nhan === STANDARD_FIELD_KEYS[entity][i])
					throw new Error(`tcc moc bo tri: thieu nhan ${entity} ${i}`);
				if (TIENG_ANH_CU.includes(nhan))
					throw new Error(`tcc moc bo tri: con tieng anh ${nhan}`);
				so += 1;
			}
			if (new Set(vi).size !== vi.length || new Set(en).size !== en.length)
				throw new Error(`tcc moc bo tri: nhan trung ${entity}`);
		}
		if (so !== 24) throw new Error(`tcc moc bo tri: thieu ${so}`);
		expect(so).toBe(24);
	});
});
