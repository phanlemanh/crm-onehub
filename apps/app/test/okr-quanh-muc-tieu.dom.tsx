import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, isValidElement, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { mucTieuThuan } from "../../api/scripts/okr-mau/ca-so-do";
import {
	type QuanhMucTieuOutput,
	quanhMucTieuOutput,
} from "../../api/src/okr/okr-xem.contracts";
import { gopQuanhMucTieu } from "../../api/src/okr/quanh-muc-tieu";

const MTS = [
	mucTieuThuan({
		id: "n1",
		level: "onehub",
		unitId: null,
		title: "Đối tác được chọn đầu tiên",
		krs: [
			{ id: "n1-k1", kind: "tang-toi", progress: 40 },
			{ id: "n1-k2", kind: "tang-toi", progress: 20 },
		],
	}),
	mucTieuThuan({
		id: "sd-a-1",
		level: "bo-phan",
		unitId: "Khối A",
		krs: [{ id: "sd-a-1-k1", kind: "tang-toi", progress: 50 }],
		gop: [{ dichMucTieu: "n1", dichKr: "n1-k1" }],
	}),
	mucTieuThuan({
		id: "sd-a1-1",
		level: "phong-ban",
		unitId: "A1",
		krs: [
			{ id: "sd-a1-1-k1", kind: "tang-toi", progress: 0 },
			{ id: "sd-a1-1-k2", kind: "tang-toi", progress: 100 },
		],
		gop: [{ dichMucTieu: "sd-a-1" }],
	}),
	mucTieuThuan({
		id: "sd-a3-1",
		level: "phong-ban",
		unitId: "A3",
		krs: [{ id: "sd-a3-1-k1", kind: "tang-toi", progress: 30 }],
		gop: [{ dichMucTieu: "sd-a-1" }, { dichMucTieu: "n1" }],
	}),
	mucTieuThuan({
		id: "sd-b-1",
		level: "bo-phan",
		unitId: "Khối B",
		krs: [{ id: "sd-b-1-k1", kind: "tang-toi", progress: 10 }],
	}),
	mucTieuThuan({
		id: "sd-x-1",
		level: "phong-ban",
		unitId: "X",
		krs: [{ id: "sd-x-1-k1", kind: "tang-toi", progress: 10 }],
		gop: [{ dichMucTieu: "n1", dichKr: "n1-k2" }],
	}),
];

const quanh = (tam: string): QuanhMucTieuOutput => {
	const q = gopQuanhMucTieu(MTS, tam);
	if (!q) throw new Error(`tam khong co: ${tam}`);
	return quanhMucTieuOutput.parse(q);
};

let hienTai: QuanhMucTieuOutput = quanh("sd-a1-1");
let loi: Error | null = null;
let choMai = false;
let goiLai = 0;
const moBanGhi: { kind: string; id: string }[] = [];
let propsKhung: { centerId?: string | null; focusId?: string | null } = {};

class LoiTrpc extends Error {
	data: { code: string };
	constructor(code: string) {
		super(code);
		this.data = { code };
	}
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			quanhMucTieu: {
				queryOptions: (vao: { objectiveId: string }) => ({
					queryKey: ["okr.quanhMucTieu", vao.objectiveId],
					queryFn: async () => {
						goiLai += 1;
						if (choMai) return new Promise(() => {});
						if (loi) throw loi;
						return hienTai;
					},
				}),
			},
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr/quanh-muc-tieu/x",
}));

mock.module("@/components/crm/record-sheet/record-stack", () => ({
	useOpenRecord: () => (r: { kind: string; id: string }) => moBanGhi.push(r),
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: { href: string; children: ReactNode } & Record<string, unknown>) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}));
mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));
mock.module("server-only", () => ({}));
mock.module("@/lib/trpc/hydrate", () => ({
	HydrateClient: ({ children }: { children: ReactNode }) => children,
}));
mock.module("@/lib/trpc/server", () => ({
	getServerTrpc: () => ({}),
	getServerQueryClient: () => ({}),
}));
mock.module("@/lib/session", () => ({ requireSession: async () => ({}) }));
mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" }));

const khungThat = { ...(await import("@crm/ui/components/flow-map")) };
const FlowMapThat = khungThat.FlowMap;
mock.module("@crm/ui/components/flow-map", () => ({
	...khungThat,
	FlowMap: (p: Parameters<typeof FlowMapThat>[0]) => {
		propsKhung = { centerId: p.centerId, focusId: p.focusId };
		return <FlowMapThat {...p} />;
	},
}));

const { QuanhMucTieuNoiDung } = await import(
	"@/app/(app)/[slug]/okr/quanh-muc-tieu/quanh-muc-tieu"
);
const TrangQuanh = (
	await import("@/app/(app)/[slug]/okr/quanh-muc-tieu/[objectiveId]/page")
).default;
const { PageShellTitle } = await import("@/components/page-shell");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrQuanhMessages } = await import("@/lib/messages/okr-quanh");
const { pathAround } = await import("@crm/ui/lib/flow-layout");

const vi = okrQuanhMessages("vi");
let dangMo: Root[] = [];

afterEach(() => {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
	hienTai = quanh("sd-a1-1");
	loi = null;
	choMai = false;
	goiLai = 0;
	moBanGhi.length = 0;
	propsKhung = {};
	window.innerWidth = 1440;
});

async function nhip(lan = 30) {
	for (let i = 0; i < lan; i += 1)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 5));
		});
}

async function dung(tam: string, locale: "vi" | "en" = "vi") {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale={locale}>
					<TooltipProvider>
						<QuanhMucTieuNoiDung objectiveId={tam} />
					</TooltipProvider>
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	await nhip();
}

const the = (id: string) =>
	document.body.querySelector<HTMLElement>(`[data-quanh-the="${id}"]`);
const tatCaThe = () => [
	...document.body.querySelectorAll<HTMLElement>("[data-quanh-the]"),
];
const khungNut = (id: string) =>
	document.body.querySelector<HTMLElement>(
		`.react-flow__node[data-id="${id}"]`,
	);

describe("dh5-so-do", () => {
	test("mỗi nút một thẻ, nhãn Công ty đúng ma trận, tâm đang chọn và là chỗ khung lia tới", async () => {
		hienTai = quanh("sd-a1-1");
		await dung("sd-a1-1");
		expect(tatCaThe().length).toBe(hienTai.nut.length);
		let soAssert = 0;
		for (const n of hienTai.nut) {
			const t = the(n.id);
			if (!t) throw new Error(`thieu the: ${n.id}`);
			const coNhan = t.querySelector("[data-cong-ty]") !== null;
			const laCongTy =
				MTS.find((m) => m.id === n.mucTieuId)?.level === "onehub";
			if (laCongTy && !coNhan) throw new Error(`thieu nhan cong ty: ${n.id}`);
			if (!laCongTy && coNhan) throw new Error(`nhan cong ty thua: ${n.id}`);
			soAssert += 1;
		}
		expect(soAssert).toBe(hienTai.nut.length);
		expect(the("sd-a1-1")?.hasAttribute("data-active")).toBe(true);
		expect(propsKhung.centerId).toBe("sd-a1-1");
		expect(propsKhung.focusId).toBe("sd-a1-1");
	});

	test("dòng góp lên công ty có bốn biến thể và bằng đúng tập gopLenCongTy", async () => {
		const tapDong = () =>
			new Set(
				[
					...document.body.querySelectorAll<HTMLElement>("[data-gop-len-muc]"),
				].map((e) => `${e.dataset.kr ?? ""}|${e.dataset.mucTieu ?? ""}`),
			);
		for (const tam of ["sd-a1-1", "sd-a3-1"]) {
			hienTai = quanh(tam);
			await dung(tam);
			const dong = document.body.querySelector("[data-gop-len-cong-ty]");
			if (!dong) throw new Error("thieu dong gop len cong ty");
			if (dong.textContent?.includes("n1-k2"))
				throw new Error("kr cong ty thua: n1-k2");
			const mong = [
				...new Set(
					hienTai.gopLenCongTy.map((g) => `${g.kr?.id ?? ""}|${g.mucTieu.id}`),
				),
			].sort();
			const thay = [...tapDong()].sort();
			if (JSON.stringify(thay) !== JSON.stringify(mong))
				throw new Error(
					`dong gop len lech: thay ${thay.join(",")} mong ${mong.join(",")}`,
				);
			for (const g of hienTai.gopLenCongTy)
				if (g.kr && !dong.textContent?.includes(g.kr.tieuDe))
					throw new Error(`thieu ten kr: ${g.kr.id}`);
			for (const r of dangMo) act(() => r.unmount());
			dangMo = [];
			document.body.innerHTML = "";
		}
		expect(quanh("sd-a3-1").gopLenCongTy.some((g) => g.kr === null)).toBe(true);

		hienTai = quanh("n1");
		await dung("n1");
		expect(
			document.body.querySelector("[data-gop-len-cong-ty]")?.textContent,
		).toBe(vi.laCongTy);
		for (const r of dangMo) act(() => r.unmount());
		dangMo = [];
		document.body.innerHTML = "";

		hienTai = quanh("sd-b-1");
		await dung("sd-b-1");
		expect(
			document.body.querySelector("[data-gop-len-cong-ty]")?.textContent,
		).toBe(vi.chuaLenCongTy);
	});
});

describe("dh5-ro-chuot", () => {
	test("rê chuột lên một thẻ thì thẻ ngoài đường đi mờ, rời chuột thì về đường quanh tâm", async () => {
		hienTai = quanh("n1");
		await dung("n1");
		const sangDau = pathAround(
			hienTai.canh.map((c) => ({
				id: `${c.tu}->${c.den}`,
				source: c.tu,
				target: c.den,
			})),
			"n1",
		);
		const mo = (id: string) => khungNut(id)?.style.opacity === "0.35";
		for (const n of hienTai.nut) expect(mo(n.id)).toBe(!sangDau.has(n.id));

		const nut = khungNut("n1-k2");
		if (!nut) throw new Error("khung chua dung nut n1-k2");
		await act(async () => {
			nut.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
			nut.dispatchEvent(new MouseEvent("mouseenter", { bubbles: false }));
		});
		await nhip(5);
		const sang = pathAround(
			hienTai.canh.map((c) => ({
				id: `${c.tu}->${c.den}`,
				source: c.tu,
				target: c.den,
			})),
			"n1-k2",
		);
		let soMo = 0;
		for (const n of hienTai.nut) {
			expect(mo(n.id)).toBe(!sang.has(n.id));
			if (mo(n.id)) soMo += 1;
		}
		if (soMo === 0)
			throw new Error("doi chung duong: re chuot khong lam mo the nao");

		await act(async () => {
			nut.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
			nut.dispatchEvent(new MouseEvent("mouseleave", { bubbles: false }));
		});
		await nhip(5);
		for (const n of hienTai.nut) expect(mo(n.id)).toBe(!sangDau.has(n.id));
	});
});

describe("dh5-bam", () => {
	test("bấm, Enter, Space trên thẻ mục tiêu và thẻ KR mở đúng ngăn", async () => {
		hienTai = quanh("sd-a1-1");
		await dung("sd-a1-1");
		const MA_TRAN = [
			{ id: "sd-a-1", kind: "objective" },
			{ id: "n1-k1", kind: "kr" },
		] as const;
		let soAssert = 0;
		for (const { id, kind } of MA_TRAN) {
			const t = the(id);
			if (!t) throw new Error(`thieu the: ${id}`);
			for (const cach of ["bam", "Enter", " "] as const) {
				moBanGhi.length = 0;
				await act(async () => {
					if (cach === "bam") t.click();
					else
						t.dispatchEvent(
							new KeyboardEvent("keydown", { key: cach, bubbles: true }),
						);
				});
				expect(moBanGhi).toEqual([{ kind, id }]);
				soAssert += 1;
			}
		}
		expect(soAssert).toBe(6);
	});
});

describe("dh5-hep", () => {
	test("dưới md là danh sách bốn nhóm đúng thứ tự, không khung vẽ", async () => {
		window.innerWidth = 390;
		hienTai = quanh("sd-a1-1");
		await dung("sd-a1-1");
		expect(document.body.querySelector("[data-flow-map]")).toBeNull();
		const ds = document.body.querySelector("[data-quanh-danh-sach]");
		if (!ds) throw new Error("thieu danh sach hep");
		const nhom = [...ds.querySelectorAll<HTMLElement>("[data-nhom]")];
		expect(nhom.map((n) => n.dataset.nhom)).toEqual(
			["gop-vao", "tam", "kr", "gop-vao-no"].filter(
				(k) =>
					k !== "gop-vao-no" ||
					hienTai.nut.some((n) => n.phia === "duoi" && n.loai === "muc-tieu"),
			),
		);
		const dem = (k: string) =>
			ds.querySelectorAll(`[data-nhom="${k}"] [data-quanh-the]`).length;
		expect(dem("gop-vao")).toBe(
			hienTai.nut.filter((n) => n.phia === "tren").length,
		);
		expect(dem("kr")).toBe(
			hienTai.nut.filter((n) => n.phia === "duoi" && n.loai === "kr").length,
		);
		const dau = ds.querySelector<HTMLElement>(
			'[data-nhom="gop-vao"] [data-quanh-the]',
		);
		expect(dau?.dataset.quanhThe).toBe("n1");
		expect(
			document.body.querySelector("[data-gop-len-cong-ty]"),
		).not.toBeNull();
		await act(async () => the("sd-a-1")?.click());
		expect(moBanGhi).toEqual([{ kind: "objective", id: "sd-a-1" }]);

		for (const r of dangMo) act(() => r.unmount());
		dangMo = [];
		document.body.innerHTML = "";
		hienTai = quanh("sd-b-1");
		await dung("sd-b-1");
		expect(document.body.querySelector('[data-nhom="gop-vao"]')).toBeNull();
	});
});

const timTieuDe = (nut: ReactNode): string | null => {
	if (!isValidElement(nut)) return null;
	const el = nut as ReactElement<{ children?: ReactNode }>;
	if (el.type === PageShellTitle) return String(el.props.children);
	const con = el.props.children;
	for (const c of Array.isArray(con) ? con : [con]) {
		const t = timTieuDe(c);
		if (t) return t;
	}
	return null;
};

describe("dh5-trang-thai", () => {
	test("đang tải, lỗi thường, không tìm thấy; trang luôn có tiêu đề", async () => {
		choMai = true;
		await dung("sd-a1-1");
		const cho = document.body.querySelector("[aria-busy=true]");
		expect(cho?.querySelector(".sr-only")?.textContent).toBe(vi.dangTai);
		expect(vi.dangTai.endsWith("…")).toBe(true);
		expect(document.body.querySelector("[data-flow-map]")).toBeNull();
		for (const r of dangMo) act(() => r.unmount());
		dangMo = [];
		document.body.innerHTML = "";

		choMai = false;
		loi = new Error("hong");
		await dung("sd-a1-1");
		expect(document.body.textContent).toContain(vi.loiTieuDe);
		const truoc = goiLai;
		const nutThuLai = [...document.body.querySelectorAll("button")].find(
			(b) => b.textContent?.trim().length,
		);
		await act(async () => nutThuLai?.click());
		await nhip(10);
		expect(goiLai).toBe(truoc + 1);
		for (const r of dangMo) act(() => r.unmount());
		dangMo = [];
		document.body.innerHTML = "";

		loi = new LoiTrpc("NOT_FOUND");
		await dung("khong-co");
		expect(document.body.textContent).toContain(vi.khongThay);
		expect(document.body.textContent).not.toContain(vi.loiTieuDe);
		const lk = document.body.querySelector("[data-quanh-khong-thay] a");
		expect(lk?.getAttribute("href")).toBe("/ws/okr/toan-canh");

		const jsx = await TrangQuanh({
			params: Promise.resolve({ slug: "ws", objectiveId: "x" }),
		});
		expect(timTieuDe(jsx)).toBe(vi.tieuDe);
	});
});

describe("dh5-chu", () => {
	test("đủ vi và en khác nhau; tên không dịch; thẻ bấm được bằng phím có vòng tiêu điểm", async () => {
		const khoa = (o: object, tien = ""): string[] =>
			Object.entries(o).flatMap(([k, v]) =>
				v && typeof v === "object" ? khoa(v, `${tien}${k}.`) : [`${tien}${k}`],
			);
		const en = okrQuanhMessages("en");
		expect(khoa(en)).toEqual(khoa(vi));
		const lay = (o: object, k: string) =>
			k
				.split(".")
				.reduce<unknown>((x, p) => (x as Record<string, unknown>)[p], o);
		for (const k of khoa(vi)) {
			const a = lay(vi, k);
			const b = lay(en, k);
			if (typeof a === "function") continue;
			if (a === b && k !== "kr") throw new Error(`chu en trung vi: ${k}`);
		}

		hienTai = quanh("sd-a1-1");
		await dung("sd-a1-1");
		for (const t of tatCaThe()) {
			const ten = t.querySelector("[data-ten]");
			expect(ten?.getAttribute("translate")).toBe("no");
			expect(t.tagName).toBe("BUTTON");
			expect(t.className).toContain("focus-visible:");
		}
	});
});
