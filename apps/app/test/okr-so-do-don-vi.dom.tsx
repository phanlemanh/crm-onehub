import { afterEach, describe, expect, mock, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act, lazy, Suspense } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	dauVaoThuan,
	KHOA_CA,
	LY_DO_SO_DO,
	mtSoDo,
	mucTieuThuan,
} from "../../api/scripts/okr-mau/ca-so-do";
import {
	type SoDoDonViOutput,
	soDoDonViOutput,
	toanCanhOutput,
} from "../../api/src/okr/okr-xem.contracts";
import { type DauVaoSoDo, gopSoDoDonVi } from "../../api/src/okr/so-do-don-vi";

const GOC_APP = resolve(import.meta.dir, "..");
const GOC_KHO = resolve(GOC_APP, "../..");
const TEP_TOAN_CANH = join(
	GOC_APP,
	"app/(app)/[slug]/okr/toan-canh/toan-canh.tsx",
);
const TEP_SO_DO = join(
	GOC_APP,
	"app/(app)/[slug]/okr/toan-canh/so-do-don-vi.tsx",
);

const QUY = "mau-okr-chu-ky-quy4";
const soDoThuan = (): SoDoDonViOutput =>
	soDoDonViOutput.parse(gopSoDoDonVi(dauVaoThuan()));

let hienTai: SoDoDonViOutput = soDoThuan();
let loiSoDo = false;
let choMai = false;
let goiLai = 0;
let tcDuLieu: unknown = null;
const moBanGhi: { kind: string; id: string }[] = [];

const thuTuc = <T,>(duong: string, doc: () => T) => ({
	queryKey: () => [duong],
	pathKey: () => [duong],
	queryOptions: () => ({ queryKey: [duong], queryFn: async () => doc() }),
});

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			cycles: thuTuc("okr.cycles", () => ({ cycles: [], currentId: QUY })),
			access: thuTuc("okr.access", () => ({
				canManageProgram: false,
				headOf: { divisions: [], departments: [] },
			})),
			toanCanh: thuTuc("okr.toanCanh", () => tcDuLieu),
			xuatKy: thuTuc("okr.xuatKy", () => null),
			soDoDonVi: {
				queryOptions: () => ({
					queryKey: ["okr.soDoDonVi"],
					queryFn: async () => {
						goiLai += 1;
						if (choMai) return new Promise(() => {});
						if (loiSoDo) throw new Error("hong");
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
	usePathname: () => "/ws/okr/toan-canh",
}));

mock.module("next/dynamic", () => ({
	default: (nap: () => Promise<{ default: React.ComponentType<object> }>) => {
		const Luoi = lazy(nap);
		return (p: object) => (
			<Suspense fallback={null}>
				<Luoi {...p} />
			</Suspense>
		);
	},
}));

mock.module("@/components/crm/record-sheet/record-stack", () => ({
	useOpenRecord: () => (r: { kind: string; id: string }) => moBanGhi.push(r),
}));

const SoDo = await import("@/app/(app)/[slug]/okr/toan-canh/so-do-don-vi");
const { TheDonVi } = await import(
	"@/app/(app)/[slug]/okr/toan-canh/the-don-vi"
);
const { SO_DO } = await import("@/app/(app)/[slug]/okr/toan-canh/so-do-config");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");
const { okrMessages } = await import("@/lib/messages/okr");
const { NGHIA_MUC_TIN } = await import(
	"@/components/crm/record-sheet/ly-do-noi-gop"
);
const { toneTheoNghia } = await import("@crm/ui/lib/status-tone");
const { thoiGianChuyenDong } = await import("@crm/ui/lib/flow-layout");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");

const vi = okrToanCanhMessages("vi").soDo;

let dangMo: Root[] = [];
let capNhat: UrlUpdateEvent[] = [];

afterEach(() => {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	capNhat = [];
	document.body.innerHTML = "";
	hienTai = soDoThuan();
	loiSoDo = false;
	choMai = false;
	goiLai = 0;
	moBanGhi.length = 0;
	window.innerWidth = 1440;
});

async function dung(
	nut: React.ReactNode,
	thamSo = "",
	locale: "vi" | "en" = "vi",
) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => capNhat.push(e)}
				searchParams={thamSo}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>
						<TooltipProvider>{nut}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	for (let i = 0; i < 30; i += 1)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 5));
		});
}

const theCua = (khoa: string) =>
	document.body.querySelector(`[data-so-do-the="${khoa}"]`);

async function bam(el: Element | null) {
	if (!el) throw new Error("khong thay phan tu de bam");
	await act(async () => {
		(el as HTMLElement).click();
	});
}

function nutCua(s: SoDoDonViOutput, khoa: string) {
	const n = s.nut.find((x) => x.khoa === khoa);
	if (!n) throw new Error(`thieu nut ${khoa}`);
	return n;
}

const TT0 = { loc: "moi" as const, moDonVi: null, moNhanh: [] as string[] };

function toChuc(
	soPhongBan: number,
	chuaNoiO: string | null,
	truotO: string | null,
): DauVaoSoDo {
	const pb = Array.from({ length: soPhongBan }, (_, i) => `pb-${i}`);
	const chia = (i: number) => (i % 2 === 0 ? "bp-a" : "bp-b");
	const mts = [
		mucTieuThuan({ id: "goc-1", level: "onehub", unitId: null, krs: [] }),
		mucTieuThuan({
			id: "a-1",
			level: "bo-phan",
			unitId: "bp-a",
			gop: [{ dichMucTieu: "goc-1" }],
		}),
		mucTieuThuan({
			id: "b-1",
			level: "bo-phan",
			unitId: "bp-b",
			gop: [{ dichMucTieu: "goc-1" }],
		}),
		...pb.map((p, i) =>
			mucTieuThuan({
				id: `${p}-1`,
				level: "phong-ban",
				unitId: p,
				krs: [
					{ id: `${p}-k`, kind: "tang-toi", progress: p === truotO ? 0 : 100 },
				],
				gop:
					p === chuaNoiO
						? []
						: [{ dichMucTieu: chia(i) === "bp-a" ? "a-1" : "b-1" }],
			}),
		),
	];
	const head = { id: "u", name: "U" };
	return {
		cay: {
			divisions: ["bp-a", "bp-b"].map((b) => ({
				id: b,
				name: b,
				head,
				departments: pb
					.filter((_, i) => chia(i) === b)
					.map((p) => ({ id: p, name: p, head })),
			})),
			chuaXep: [],
		},
		tenGoc: "OneHub",
		truongGoc: null,
		cycleId: mts[0]?.cycleId ?? "",
		mts,
	};
}

function nhapTinh(tep: string): string[] {
	const ma = readFileSync(tep, "utf8");
	const ra: string[] = [];
	const re =
		/^\s*(?:import|export)\s(?!type\s)[^;]*?from\s+["']([^"']+)["']/gms;
	for (const m of ma.matchAll(re)) if (m[1]) ra.push(m[1]);
	return ra;
}

function giai(
	tu: string,
	dich: string,
	gocApp: string,
	gocUi: string,
): string | null {
	const goc = dich.startsWith("@/")
		? join(gocApp, dich.slice(2))
		: dich.startsWith("@crm/ui/")
			? join(gocUi, dich.slice("@crm/ui/".length))
			: dich.startsWith(".")
				? resolve(dirname(tu), dich)
				: null;
	if (!goc) return null;
	for (const duoi of ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]) {
		try {
			readFileSync(goc + duoi);
			return goc + duoi;
		} catch {}
	}
	return null;
}

function cham(tepDau: string, gocApp: string, gocUi: string): string[] | null {
	const da = new Set<string>();
	const hang: { tep: string; duong: string[] }[] = [
		{ tep: tepDau, duong: [tepDau] },
	];
	while (hang.length > 0) {
		const { tep, duong } = hang.shift() as { tep: string; duong: string[] };
		if (da.has(tep)) continue;
		da.add(tep);
		for (const d of nhapTinh(tep)) {
			if (
				d === "@xyflow/react" ||
				d.startsWith("@xyflow/") ||
				d === "@dagrejs/dagre"
			)
				return [...duong, d];
			const t = giai(tep, d, gocApp, gocUi);
			if (t) hang.push({ tep: t, duong: [...duong, t] });
		}
	}
	return null;
}

const GOC_UI = join(GOC_KHO, "packages/ui/src");

describe("dh4-cach-xem", () => {
	test("thẻ Theo đơn vị có Bảng · Sơ đồ, mặc định Bảng, khung vẽ chỉ nạp động", async () => {
		const { ToanCanh } = await import(
			"@/app/(app)/[slug]/okr/toan-canh/toan-canh"
		);
		const tc = toanCanhOutput.parse({
			tongQuan: {
				tienDo: 50,
				kyVong: null,
				donViCongBo: 1,
				tongDonVi: 1,
				donViChuaDat: [],
				tongKr: 1,
				daCapNhat: 0,
				daCapNhatTruoc: 0,
				tuTinThap: 0,
				tuTinThapTruoc: 0,
			},
			tuan: ["2026-09-28"],
			tuanNay: "2026-09-28",
			hang: [
				{
					key: "goc",
					ten: "OneHub",
					cap: "goc",
					tienDo: 50,
					kyVong: null,
					soMucTieu: 1,
					soKr: 1,
					tuTin: { cao: 1, vua: 0, thap: 0 },
					daCapNhat: 0,
					dangBan: null,
					theoTuan: [null],
				},
			],
		});
		tcDuLieu = tc;
		await dung(<ToanCanh />);
		const nhom = document.body.querySelector("[data-cach-xem-toan-canh]");
		const muc = [...(nhom?.querySelectorAll("[data-value]") ?? [])].map((e) =>
			e.getAttribute("data-value"),
		);
		expect(muc).toEqual(["bang", "so-do"]);
		expect(document.body.querySelector("[data-so-do]")).toBeNull();
		for (const ts of ["xemToanCanh=so-do", "xemToanCanh=la"]) {
			for (const r of dangMo) act(() => r.unmount());
			dangMo = [];
			document.body.innerHTML = "";
			await dung(<ToanCanh />, ts);
			const coSoDo = document.body.querySelector("[data-so-do]") !== null;
			expect({ ts, coSoDo }).toEqual({ ts, coSoDo: ts.endsWith("so-do") });
		}

		expect(cham(TEP_TOAN_CANH, GOC_APP, GOC_UI)).toBeNull();
		expect(cham(TEP_SO_DO, GOC_APP, GOC_UI)).not.toBeNull();
		expect(readFileSync(TEP_TOAN_CANH, "utf8")).toMatch(
			/dynamic\(\s*\(\)\s*=>\s*import\(["']\.\/so-do-don-vi["']\)/,
		);
		const tam = mkdtempSync(join(tmpdir(), "dh4-cach-xem-"));
		const appTam = join(tam, "app");
		const uiTam = join(tam, "ui");
		mkdirSync(join(appTam, "x"), { recursive: true });
		mkdirSync(join(uiTam, "components"), { recursive: true });
		writeFileSync(
			join(uiTam, "components/flow-map.tsx"),
			'import { ReactFlow } from "@xyflow/react";\nexport const F = ReactFlow;\n',
		);
		writeFileSync(
			join(appTam, "x/the-don-vi.tsx"),
			'import { F } from "@crm/ui/components/flow-map";\nexport const HANG = 1;\nexport const G = F;\n',
		);
		writeFileSync(
			join(appTam, "x/toan-canh.tsx"),
			'import { HANG } from "./the-don-vi";\nexport const T = HANG;\n',
		);
		const duong = cham(join(appTam, "x/toan-canh.tsx"), appTam, uiTam);
		if (duong === null) throw new Error("doi chung do khong do");
		const thongDiep = `flow-map nap tinh: ${duong.map((d) => d.split("/").pop()).join(" -> ")}`;
		expect(thongDiep).toBe(
			"flow-map nap tinh: toan-canh.tsx -> the-don-vi.tsx -> flow-map.tsx -> @xyflow/react",
		);
	});
});

describe("dh4-the", () => {
	test("mỗi đơn vị một nút; dây liền/đứt đúng loại; đơn vị chưa nối không là nguồn dây hiện; thẻ đủ chữ", async () => {
		const s = hienTai;
		const ve = SoDo.dungSoDo(s, TT0);
		const hien = ve.day.filter((d) => d.data?.kind !== "an");
		expect(ve.nut.length).toBe(s.nut.length);
		for (const d of hien) {
			const goc = s.duong.find((x) => x.tu === d.source && x.den === d.target);
			if (!goc) throw new Error(`day la: ${d.source}->${d.target}`);
			expect(d.data?.kind).toBe(goc.loai);
		}
		for (const n of s.nut.filter((x) => x.co.includes("chua-noi"))) {
			if (hien.some((d) => d.target === n.khoa))
				throw new Error("duong ve cho don vi chua noi");
		}
		const tenDai = "Đ".repeat(120);
		const nutDai = { ...nutCua(s, KHOA_CA.B2), ten: tenDai };
		await dung(
			<div>
				{[...s.nut.filter((n) => n.khoa !== KHOA_CA.B2), nutDai].map((n) => (
					<TheDonVi
						bien="khung"
						chim={false}
						dangMo={false}
						gop={null}
						key={n.khoa}
						nut={n}
						onDong={() => {}}
						onMo={() => {}}
					/>
				))}
			</div>,
		);
		const b2 = theCua(KHOA_CA.B2);
		expect(b2?.querySelector("[data-chua-noi]")?.textContent).toBe(
			vi.chuaNoiLen,
		);
		expect(b2?.textContent).toContain(vi.chuaCoTruong);
		const ten = b2?.querySelector("[data-ten-don-vi]");
		expect(ten?.getAttribute("title")).toBe(tenDai);
		expect(ten?.className).toContain("truncate");
		const coB2 = [
			...(b2?.querySelectorAll("[data-co] [data-co-ten]") ?? []),
		].map((e) => e.textContent);
		expect(coB2.sort()).toEqual(
			nutCua(s, KHOA_CA.B2)
				.co.map((c) => vi.co[c])
				.sort(),
		);
		for (const c of [
			"chua-truong",
			"chua-okr",
			"chua-noi",
			"muc-tieu-chua-gop",
			"kr-truot",
		] as const) {
			const coNut = s.nut.find((n) => n.co.includes(c));
			if (!coNut) throw new Error(`bo du lieu thieu co ${c}`);
			const tenCo = [
				...(theCua(coNut.khoa)?.querySelectorAll("[data-co-ten]") ?? []),
			].map((e) => e.textContent);
			expect(tenCo).toContain(vi.co[c]);
		}
		const a1 = theCua(KHOA_CA.A1);
		expect(a1?.querySelector("[data-chua-noi]")).toBeNull();
		expect(a1?.querySelectorAll("[data-tinh-trang]").length).toBe(3);
		const chuGiai = SoDo.CHU_GIAI_SO_DO.length;
		expect(chuGiai).toBe(3);
	});
});

describe("dh4-loc", () => {
	test("hai chip có số; Cần chú ý làm mờ thẻ khác; giá trị lên đường dẫn; lọc rỗng có câu", async () => {
		window.innerWidth = 390;
		await dung(<SoDo.default cycleId={QUY} />);
		const chip = (g: string) =>
			document.body.querySelector(`[data-loc-so-do="${g}"]`);
		const soChuY = hienTai.nut.filter((n) => n.canChuY).length;
		expect(chip("moi")?.textContent).toContain(String(hienTai.nut.length));
		expect(chip("chu-y")?.textContent).toContain(String(soChuY));
		await bam(chip("chu-y"));
		expect(capNhat.at(-1)?.searchParams.get("locSoDo")).toBe("chu-y");
		for (const n of hienTai.nut) {
			const the = theCua(n.khoa);
			if (!the) continue;
			expect({ khoa: n.khoa, chim: the.hasAttribute("data-chim") }).toEqual({
				khoa: n.khoa,
				chim: !n.canChuY,
			});
			if (!n.canChuY) expect(the.getAttribute("aria-disabled")).toBe("true");
		}
		await bam(chip("moi"));
		expect(document.body.querySelectorAll("[data-chim]").length).toBe(0);

		for (const r of dangMo) act(() => r.unmount());
		dangMo = [];
		document.body.innerHTML = "";
		hienTai = {
			...hienTai,
			nut: hienTai.nut.map((n) => ({ ...n, co: [], canChuY: false })),
		};
		await dung(<SoDo.default cycleId={QUY} />, "locSoDo=chu-y");
		expect(document.body.querySelector("[data-khong-chu-y]")?.textContent).toBe(
			vi.khongChuY,
		);
		expect(document.body.querySelectorAll("[data-so-do-the]").length).toBe(0);
	});
});

describe("dh4-mo-the", () => {
	test("mở thẻ liệt kê mục tiêu, góp vào đâu, mức tin và lý do theo từng chỗ nối", async () => {
		window.innerWidth = 390;
		const m = okrMessages("vi").sheet;
		await dung(<SoDo.default cycleId={QUY} />);
		await bam(theCua(KHOA_CA.A3)?.querySelector("[data-mo-the]") ?? null);
		expect(capNhat.at(-1)?.searchParams.get("moDonVi")).toBe(KHOA_CA.A3);
		const the = theCua(KHOA_CA.A3);
		const dong = [...(the?.querySelectorAll("[data-dong-gop]") ?? [])];
		expect(dong.length).toBe(2);
		const lyDo = dong
			.map((d) => d.querySelector("[data-ly-do-cau]")?.textContent ?? null)
			.sort();
		expect(lyDo).toEqual([LY_DO_SO_DO.coSoLieu, LY_DO_SO_DO.datCuoc].sort());
		const goc = hienTai.nut
			.flatMap((n) => n.mucTieu)
			.find((x) => x.id === mtSoDo("sd-a3-1"));
		for (const d of dong) {
			const cau = d.querySelector("[data-ly-do-cau]")?.textContent;
			const g = goc?.gop.find((x) => x.lyDo === cau);
			if (!g) throw new Error("ly do sai cho noi");
			const nhan = d.querySelector("[data-muc-tin]");
			expect(nhan?.textContent).toBe(m.mucTin[g.mucTin]);
			expect(d.querySelector("[data-tone]")?.getAttribute("data-tone")).toBe(
				toneTheoNghia(NGHIA_MUC_TIN[g.mucTin]),
			);
			expect(d.querySelectorAll('[data-slot="kara-trace"]').length).toBe(
				g.lyDoTuKara ? 1 : 0,
			);
			expect(d.textContent).toContain(g.tenDich);
		}
		expect(
			readFileSync(
				join(GOC_APP, "app/(app)/[slug]/okr/toan-canh/the-don-vi.tsx"),
				"utf8",
			),
		).toContain("@/components/crm/record-sheet/ly-do-noi-gop");
		await bam(the?.querySelector("[data-ten-muc-tieu]") ?? null);
		expect(moBanGhi.at(-1)).toEqual({
			kind: "objective",
			id: mtSoDo("sd-a3-1"),
		});
		await act(async () => {
			the?.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
		});
		expect(capNhat.at(-1)?.searchParams.get("moDonVi")).toBeNull();

		for (const r of dangMo) act(() => r.unmount());
		dangMo = [];
		document.body.innerHTML = "";
		await dung(<SoDo.default cycleId={QUY} />, `moDonVi=${KHOA_CA.A1}`);
		expect(theCua(KHOA_CA.A1)?.hasAttribute("data-dang-mo")).toBe(true);
		const nutThe = theCua(KHOA_CA.B1)?.querySelector("[data-mo-the]");
		await act(async () => {
			nutThe?.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
			);
		});
		expect(capNhat.at(-1)?.searchParams.get("moDonVi")).toBe(KHOA_CA.B1);

		const lon = soDoDonViOutput.parse(gopSoDoDonVi(toChuc(11, null, null)));
		const pbB = lon.nut.find((n) => n.cha === "bp:bp-b");
		if (!pbB) throw new Error("thieu phong ban cua B");
		const ve = SoDo.dungSoDo(lon, { ...TT0, moDonVi: pbB.khoa });
		if (!ve.nut.some((n) => n.id === pbB.khoa))
			throw new Error("mo the trong nhanh gop");
	});
});

describe("dh4-thu-gon", () => {
	test("hơn ngưỡng thì gộp phòng ban, trừ nhánh có đơn vị chưa nối; lọc thì mở nhánh cần chú ý", () => {
		const n = SO_DO.thuGonKhiHon;
		const ca = [
			{ ten: "bang-nguong", vao: toChuc(n - 3, null, null), gop: false },
			{ ten: "vuot-nguong", vao: toChuc(n - 2, null, null), gop: true },
			{ ten: "vuot-truot", vao: toChuc(n - 2, null, "pb-0"), gop: true },
			{ ten: "vuot-chua-noi", vao: toChuc(n - 2, "pb-1", null), gop: true },
		];
		for (const c of ca) {
			const s = soDoDonViOutput.parse(gopSoDoDonVi(c.vao));
			const ve = SoDo.dungSoDo(s, TT0);
			const coPb = (pb: string) => ve.nut.some((x) => x.id === `pb:${pb}`);
			if (c.ten === "bang-nguong") expect(ve.nut.length).toBe(s.nut.length);
			if (c.ten === "vuot-nguong") {
				expect(ve.nut.length).toBe(3);
				const a = ve.nut.find((x) => x.id === "bp:bp-a");
				expect(a?.data.gop?.soPhongBan).toBe(
					s.nut.filter((x) => x.cha === "bp:bp-a").length,
				);
			}
			if (c.ten === "vuot-truot") {
				expect(coPb("pb-0")).toBe(false);
				expect(ve.nut.find((x) => x.id === "bp:bp-a")?.data.gop?.soChuY).toBe(
					1,
				);
				const loc = SoDo.dungSoDo(s, { ...TT0, loc: "chu-y" });
				if (!loc.nut.some((x) => x.id === "pb:pb-0"))
					throw new Error("thu gon giau don vi can chu y");
			}
			if (c.ten === "vuot-chua-noi" && !coPb("pb-1"))
				throw new Error("thu gon giau don vi chua noi");
			const moA = SoDo.dungSoDo(s, { ...TT0, moNhanh: ["bp:bp-a"] });
			if (c.gop) expect(moA.nut.some((x) => x.id === "pb:pb-0")).toBe(true);
		}
	});
});

describe("dh4-hep", () => {
	test("dưới md không có khung vẽ; danh sách thụt theo cấp, mang nhãn như thẻ", async () => {
		window.innerWidth = 390;
		await dung(<SoDo.default cycleId={QUY} />);
		expect(document.body.querySelector("[data-flow-map]")).toBeNull();
		const ds = document.body.querySelector("[data-so-do-danh-sach]");
		const dong = [...(ds?.querySelectorAll("[data-so-do-the]") ?? [])];
		expect(dong.length).toBe(hienTai.nut.length);
		const lui = (khoa: string) =>
			Number.parseInt(
				(
					dong
						.find((d) => d.getAttribute("data-so-do-the") === khoa)
						?.closest("[data-cap]") as HTMLElement | null
				)?.style.paddingInlineStart ?? "-1",
				10,
			);
		expect(lui("goc")).toBeLessThan(lui(KHOA_CA.A));
		expect(lui(KHOA_CA.A)).toBeLessThan(lui(KHOA_CA.A1));
		expect(
			theCua(KHOA_CA.B2)?.querySelector("[data-chua-noi]")?.textContent,
		).toBe(vi.chuaNoiLen);
		expect(
			theCua(KHOA_CA.A1)?.querySelector("[data-can-chu-y]"),
		).not.toBeNull();
		await bam(document.body.querySelector('[data-loc-so-do="chu-y"]'));
		const conRo = [
			...document.body.querySelectorAll("[data-so-do-the]:not([data-chim])"),
		].map((e) => e.getAttribute("data-so-do-the"));
		expect(conRo.sort()).toEqual(
			hienTai.nut
				.filter((n) => n.canChuY)
				.map((n) => n.khoa)
				.sort(),
		);
	});
});

describe("dh4-trang-thai", () => {
	test("đang tải, lỗi có thử lại, kỳ rỗng", async () => {
		choMai = true;
		await dung(<SoDo.default cycleId={QUY} />);
		const tai = document.body.querySelector("[aria-busy='true']");
		expect(tai?.textContent).toBe(vi.dangTai);
		expect(vi.dangTai.endsWith("…")).toBe(true);
		expect(document.body.querySelector("[data-flow-map]")).toBeNull();

		for (const r of dangMo) act(() => r.unmount());
		dangMo = [];
		document.body.innerHTML = "";
		choMai = false;
		loiSoDo = true;
		await dung(<SoDo.default cycleId={QUY} />);
		expect(document.body.textContent).toContain(vi.loiTieuDe);
		const truoc = goiLai;
		loiSoDo = false;
		await bam(
			document.body.querySelector("[data-thu-lai]") ??
				document.body.querySelector("button"),
		);
		await act(async () => {
			await new Promise((r) => setTimeout(r, 20));
		});
		expect(goiLai - truoc).toBe(1);

		for (const r of dangMo) act(() => r.unmount());
		dangMo = [];
		document.body.innerHTML = "";
		hienTai = soDoDonViOutput.parse(
			gopSoDoDonVi({
				...dauVaoThuan(),
				cay: { divisions: [], chuaXep: [] },
				mts: [],
			}),
		);
		await dung(<SoDo.default cycleId={QUY} />);
		expect(document.body.querySelector("[data-ky-rong]")?.textContent).toBe(
			vi.kyRong,
		);
		expect(document.body.querySelectorAll("[data-so-do-the]").length).toBe(1);
	});
});

describe("dh4-chu", () => {
	test("chữ đủ vi/en khác nhau; dữ liệu người không dịch; phím và tiêu điểm; giảm chuyển động", async () => {
		const en = okrToanCanhMessages("en").soDo;
		const khoa = (o: object) => Object.keys(o).sort();
		expect(khoa(vi)).toEqual(khoa(en));
		for (const k of khoa(vi) as (keyof typeof vi)[]) {
			const a = vi[k];
			const b = en[k];
			const sa =
				typeof a === "function"
					? (a as (...x: number[]) => string)(1, 2)
					: JSON.stringify(a);
			const sb =
				typeof b === "function"
					? (b as (...x: number[]) => string)(1, 2)
					: JSON.stringify(b);
			expect({ k, khac: sa !== sb }).toEqual({ k, khac: true });
		}
		const uiVi = uiMessages("vi").soDo;
		const uiEn = uiMessages("en").soDo;
		expect(khoa(uiVi)).toEqual(khoa(uiEn));
		expect(uiVi.thuNho).not.toBe(uiEn.thuNho);

		window.innerWidth = 390;
		await dung(<SoDo.default cycleId={QUY} />, `moDonVi=${KHOA_CA.A3}`);
		const the = theCua(KHOA_CA.A3);
		for (const sel of [
			"[data-ten-don-vi]",
			"[data-ten-muc-tieu]",
			"[data-ly-do-cau]",
		]) {
			const el = the?.querySelector(sel);
			expect({ sel, no: el?.closest("[translate='no']") !== null }).toEqual({
				sel,
				no: true,
			});
		}
		const nut = the?.querySelector("[data-mo-the]");
		expect(nut?.tagName).toBe("BUTTON");
		expect(nut?.className).toContain("focus-visible:");

		const ma = readFileSync(
			join(GOC_KHO, "packages/ui/src/components/flow-map.tsx"),
			"utf8",
		);
		for (const k of ["thuNho", "phongTo", "vuaKhung"])
			expect(ma).toContain(`nhan: msg.${k}`);
		expect(ma).toContain("aria-label={n.nhan}");
		const goc = window.matchMedia;
		window.matchMedia = ((q: string) => ({
			matches: q.includes("reduce"),
			media: q,
		})) as unknown as typeof window.matchMedia;
		expect(thoiGianChuyenDong()).toBe(0);
		window.matchMedia = ((q: string) => ({
			matches: false,
			media: q,
		})) as unknown as typeof window.matchMedia;
		expect(thoiGianChuyenDong()).toBeGreaterThan(0);
		window.matchMedia = goc;
	});
});
