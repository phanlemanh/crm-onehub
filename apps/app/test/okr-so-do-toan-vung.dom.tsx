import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act, type ReactElement, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	dauVaoThuan,
	KHOA_CA,
	mtSoDo,
} from "../../api/scripts/okr-mau/ca-so-do";
import { cyclesOutput, okrAccessOutput } from "../../api/src/okr/okr.contracts";
import { hoiYNhanOutput } from "../../api/src/okr/okr-hoi-y.contracts";
import {
	type QuanhMucTieuOutput,
	quanhMucTieuOutput,
	type SoDoDonViOutput,
	soDoDonViOutput,
} from "../../api/src/okr/okr-xem.contracts";
import { gopQuanhMucTieu } from "../../api/src/okr/quanh-muc-tieu";
import { gopSoDoDonVi } from "../../api/src/okr/so-do-don-vi";
import { cho, dat, datLai, dinhVi, goiCua, nhip } from "./khung-soan-okr";

const GOC_KHO = resolve(import.meta.dir, "../../..");

const moBanGhi: { kind: string; id: string }[] = [];
const banGhiThat = {
	...(await import("@/components/crm/record-sheet/record-stack")),
};
mock.module("@/components/crm/record-sheet/record-stack", () => ({
	...banGhiThat,
	useOpenRecord: () => (r: { kind: string; id: string }) => moBanGhi.push(r),
}));
mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" }));
mock.module("@/lib/session", () => ({ requireSession: async () => null }));
mock.module("@/lib/trpc/hydrate", () => ({
	HydrateClient: ({ children }: { children: ReactNode }) => children,
}));
mock.module("server-only", () => ({}));
const thuTucMayChu = new Proxy(
	{},
	{ get: () => new Proxy({}, { get: () => ({ queryOptions: () => ({}) }) }) },
);
mock.module("@/lib/trpc/server", () => ({
	getServerTrpc: () => thuTucMayChu,
	getServerQueryClient: () => ({
		fetchQuery: async () => {
			throw new Error("may chu gia khong tra du lieu");
		},
		prefetchQuery: async () => {},
	}),
}));

const { ThanhBenMucTieu } = await import(
	"@/app/(app)/[slug]/okr/thanh-ben-muc-tieu"
);
const { ToanManHinhProvider } = await import(
	"@/app/(app)/[slug]/okr/toan-man-hinh"
);
const { lopDangMo } = await import("@/app/(app)/[slug]/okr/toan-man-hinh-luat");
const { KhungTrangOkr } = await import(
	"@/app/(app)/[slug]/okr/soan/khung-trang-okr"
);
const { ManSoDo } = await import("@/app/(app)/[slug]/okr/so-do/man-so-do");
const TrangQuanh = (
	await import("@/app/(app)/[slug]/okr/quanh-muc-tieu/[objectiveId]/page")
).default;
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { Dialog, DialogContent, DialogTitle } = await import(
	"@crm/ui/components/dialog"
);
const { Sheet, SheetContent, SheetTitle } = await import(
	"@crm/ui/components/sheet"
);
const {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} = await import("@crm/ui/components/dropdown-menu");
const { TU_XU_LY_ESC } = await import("@crm/ui/lib/tu-xu-ly-esc");
const { okrVoKhuMessages } = await import("@/lib/messages/okr-vo-khu");
const { okrQuanhMessages } = await import("@/lib/messages/okr-quanh");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");

const t = okrVoKhuMessages("vi");
const mq = okrQuanhMessages("vi");
const mtc = okrToanCanhMessages("vi").soDo;

const kyMau = {
	id: "q4",
	kind: "quy",
	name: "Quý 4/2026",
	parentId: null,
	startsOn: "2026-10-01",
	endsOn: "2026-12-31",
	phase: "dang-chay",
	breakStartsOn: null,
	breakEndsOn: null,
	updateWeekday: 1,
	cuaSoRa: null,
	anLuc: null,
	anLyDo: null,
	quyConHien: 0,
	viec: { suaMoiO: false, suaTen: false, go: false, an: false, hienLai: false },
};
const CHU_KY = cyclesOutput.parse({ cycles: [kyMau], currentId: "q4" });

const VAO = dauVaoThuan();
const soDo = (): SoDoDonViOutput => soDoDonViOutput.parse(gopSoDoDonVi(VAO));
const TAM = mtSoDo("sd-a1-1");
const quanh = (tam: string): QuanhMucTieuOutput => {
	const q = gopQuanhMucTieu(VAO.mts, tam);
	if (!q) throw new Error(`tam khong co: ${tam}`);
	return quanhMucTieuOutput.parse(q);
};

class LoiTrpc extends Error {
	data: { code: string };
	constructor(code: string) {
		super(code);
		this.data = { code };
	}
}

type CheDo = "co" | "cho" | "loi" | "khong-thay" | "rong";
let cheDo: CheDo = "co";

function datNen() {
	dat("okr.cycles", () => CHU_KY);
	dat("okr.access", () =>
		okrAccessOutput.parse({
			canManageProgram: false,
			headOf: { divisions: [], departments: [] },
		}),
	);
	dat("okr.hoiYNhan", () =>
		hoiYNhanOutput.parse({
			coHoiY: false,
			trangThai: null,
			canGop: false,
			soChuDeChuaKetLuan: 0,
		}),
	);
	dat("okr.soDoDonVi", () => {
		if (cheDo === "cho") return new Promise(() => {});
		if (cheDo === "loi") throw new Error("hong");
		const s = soDo();
		if (cheDo === "rong")
			return { ...s, nut: s.nut.map((n) => ({ ...n, soMucTieu: 0 })) };
		return s;
	});
	dat("okr.quanhMucTieu", (vao) => {
		if (cheDo === "cho") return new Promise(() => {});
		if (cheDo === "loi") throw new Error("hong");
		if (cheDo === "khong-thay") throw new LoiTrpc("NOT_FOUND");
		return quanh(String(vao?.objectiveId));
	});
}

type San = { o: HTMLElement; root: Root; doi: (nut: ReactElement) => void };
let dangMo: San[] = [];
let urlGhi: string[] = [];
const ngheMedia = new Set<() => void>();

beforeEach(() => {
	datLai();
	datNen();
	cheDo = "co";
	urlGhi = [];
	moBanGhi.length = 0;
	window.innerWidth = 1440;
	ngheMedia.clear();
	window.matchMedia = ((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: (_: string, f: () => void) => ngheMedia.add(f),
		removeEventListener: (_: string, f: () => void) => ngheMedia.delete(f),
		dispatchEvent: () => false,
	})) as unknown as typeof window.matchMedia;
});

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

function Vo({ children }: { children: ReactNode }) {
	return (
		<ToanManHinhProvider>
			<div className="flex">
				<ThanhBenMucTieu />
				<KhungTrangOkr>{children}</KhungTrangOkr>
			</div>
		</ToanManHinhProvider>
	);
}

async function dung(man: ReactElement, duongDayDu: string): Promise<San> {
	const [duong = "", tham = ""] = duongDayDu.split("?");
	dinhVi.duong = duong;
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const ve = (nut: ReactElement) => (
		<NuqsTestingAdapter
			hasMemory
			onUrlUpdate={(e: UrlUpdateEvent) => urlGhi.push(e.queryString)}
			searchParams={tham ? `?${tham}` : ""}
		>
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">
					<TooltipProvider>{nut}</TooltipProvider>
				</LocaleProvider>
			</QueryClientProvider>
		</NuqsTestingAdapter>
	);
	await act(async () => root.render(ve(man)));
	const san: San = { o, root, doi: (nut) => root.render(ve(nut)) };
	dangMo.push(san);
	await nhip(20);
	return san;
}

const q = (chon: string, goc: ParentNode = document) =>
	goc.querySelector<HTMLElement>(chon);
const qa = (chon: string, goc: ParentNode = document) => [
	...goc.querySelectorAll<HTMLElement>(chon),
];
const thanhBen = () => q("[data-slot=area-sidebar]");
const nutToanMan = () => q("[data-nut=toan-man-hinh]");

async function bam(el: Element | null, moTa: string) {
	if (!el) throw new Error(`khong thay ${moTa}`);
	await act(async () => (el as HTMLElement).click());
	await nhip(5);
}

async function esc(tu: Element = document.activeElement ?? document.body) {
	await act(async () => {
		tu.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
		);
	});
	await nhip(5);
}

const daiCongCu = () => q("[data-dai-cong-cu]");

describe("vk6-khung", () => {
	test("vk6-khung: Sơ đồ toàn vùng, không bề rộng tối đa, một dải công cụ ba phần", async () => {
		await dung(
			<Vo>
				<ManSoDo tam={null} />
			</Vo>,
			"/ws/okr/so-do",
		);
		await cho(() => q("[data-flow-map]") !== null, "khung ve");
		const sai: string[] = [];
		const toiDa = qa("[class*=max-w-]").filter((e) =>
			/max-w-7xl|max-w-\(--container/.test(e.className),
		);
		if (toiDa.length > 0) sai.push("khung con be rong toi da");
		const khung = q("[data-flow-map]");
		const boc = khung?.parentElement;
		if (
			!boc?.className.includes("flex-1") ||
			!boc.className.includes("min-h-0")
		)
			sai.push("khung ve khong nam trong vung co gian");
		for (let e = boc; e && e !== document.body; e = e.parentElement)
			if (e.style.height) sai.push(`khung ve cao co dinh: ${e.style.height}`);
		if (q("[data-slot=page-shell-description]"))
			sai.push("con cau mo ta trang");
		const dai = daiCongCu();
		if (!dai) sai.push("thieu dai cong cu");
		else {
			const trang = q("[data-slot=breadcrumb-page]", dai)?.textContent;
			if (trang !== t.soDo.soDoGopVao) sai.push(`duong manh «${trang}»`);
			if (qa("[data-loc-so-do]", dai).length !== 2) sai.push("loc khong o dai");
			if (nutToanMan()?.textContent !== t.soDo.toanManHinh)
				sai.push("thieu nut toan man hinh");
		}
		const thietKe = readFileSync(join(GOC_KHO, "docs/design.md"), "utf8");
		const khungTrang =
			thietKe.split("### Khung trang")[1]?.split("###")[0] ?? "";
		if (!khungTrang.includes("màn toàn vùng"))
			sai.push("docs/design.md thieu ngoai le man toan vung");
		expect(sai).toEqual([]);
	});
});

function LopThu({ lop }: { lop: string }) {
	const [mo, datMo] = useState(false);
	return (
		<>
			<button data-mo-lop={lop} onClick={() => datMo(true)} type="button">
				mo {lop}
			</button>
			{lop === "dialog" ? (
				<Dialog onOpenChange={datMo} open={mo}>
					<DialogContent>
						<DialogTitle>hop thoai</DialogTitle>
					</DialogContent>
				</Dialog>
			) : null}
			{lop === "sheet" ? (
				<Sheet onOpenChange={datMo} open={mo}>
					<SheetContent>
						<SheetTitle>ngan</SheetTitle>
					</SheetContent>
				</Sheet>
			) : null}
			{lop === "menu" ? (
				<DropdownMenu onOpenChange={datMo} open={mo}>
					<DropdownMenuTrigger>menu</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem>muc</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : null}
		</>
	);
}

describe("vk6-toan-man", () => {
	test("vk6-toan-man: bật, đổi kiểu xem, Esc theo tầng, thoát", async () => {
		const sai: string[] = [];
		const san = await dung(
			<Vo>
				<ManSoDo tam={null} />
			</Vo>,
			"/ws/okr/so-do",
		);
		await cho(() => nutToanMan() !== null, "nut toan man hinh");
		const buoc: string[] = [];
		if (!thanhBen()) sai.push("buoc 1: khung thuong thieu thanh ben");
		buoc.push("1");
		nutToanMan()?.focus();
		await bam(nutToanMan(), "nut toan man hinh");
		if (thanhBen()) sai.push("buoc 2: thanh ben con");
		if (nutToanMan()?.textContent !== t.soDo.thoatToanManHinh)
			sai.push("buoc 2: chu nut");
		if (nutToanMan()?.getAttribute("aria-pressed") !== "true")
			sai.push("buoc 2: aria-pressed");
		if (document.activeElement !== nutToanMan()) sai.push("buoc 2: tieu diem");
		buoc.push("2");
		dinhVi.duong = `/ws/okr/so-do/muc-tieu/${TAM}`;
		await act(async () =>
			san.doi(
				<Vo>
					<ManSoDo tam={TAM} />
				</Vo>,
			),
		);
		await nhip(10);
		if (thanhBen()) sai.push("buoc 3: doi kieu xem mat toan man hinh");
		if (urlGhi.some((u) => /toanMan/i.test(u)))
			sai.push("buoc 3: len duong dan");
		buoc.push("3");
		await esc();
		if (!thanhBen()) sai.push("buoc 4: esc khong thoat");
		buoc.push("4");
		const lop: string[] = [];
		for (const ten of ["sheet", "dialog", "menu"]) {
			await act(async () =>
				san.doi(
					<Vo>
						<ManSoDo tam={null} />
						<LopThu lop={ten} />
					</Vo>,
				),
			);
			dinhVi.duong = "/ws/okr/so-do";
			await nhip(5);
			await bam(nutToanMan(), "nut toan man hinh");
			await bam(q(`[data-mo-lop=${ten}]`), `mo ${ten}`);
			if (!lopDangMo(document)) sai.push(`doi chung duong: ${ten} khong mo`);
			await esc();
			if (lopDangMo(document)) sai.push(`${ten} khong dong`);
			if (thanhBen()) sai.push(`esc nuot toan man hinh: ${ten}`);
			await esc();
			if (!thanhBen()) sai.push(`esc lan hai khong thoat: ${ten}`);
			lop.push(ten);
		}
		await act(async () =>
			san.doi(
				<Vo>
					<ManSoDo tam={null} />
				</Vo>,
			),
		);
		await bam(nutToanMan(), "nut toan man hinh");
		await bam(q("[data-so-do-the] [data-mo-the]"), "mo the don vi");
		if (
			!q(
				"[data-so-do-the][data-dang-mo=true], [data-so-do-the][data-dang-mo]:not([data-dang-mo=false])",
			)
		)
			sai.push("doi chung duong: the don vi khong mo");
		await esc(document.body);
		if (thanhBen()) sai.push("esc nuot toan man hinh: the-don-vi");
		lop.push("the-don-vi");
		buoc.push("5");
		await esc(document.body);
		if (!thanhBen()) sai.push("buoc 6: esc lan hai khong thoat");
		buoc.push("6");
		expect(sai).toEqual([]);
		expect(buoc).toHaveLength(6);
		expect(lop).toHaveLength(4);
	});

	test("vk6-toan-man: Esc trong ô tự xử Esc không thoát", async () => {
		await dung(
			<Vo>
				<ManSoDo tam={null} />
				<input {...TU_XU_LY_ESC} data-o-sua />
			</Vo>,
			"/ws/okr/so-do",
		);
		await cho(() => nutToanMan() !== null, "nut");
		await bam(nutToanMan(), "nut");
		const o = q("[data-o-sua]");
		if (!o) throw new Error("thieu o sua");
		await esc(o);
		expect(thanhBen()).toBeNull();
		await esc(document.body);
		expect(thanhBen()).not.toBeNull();
	});

	test("vk6-toan-man: rời Sơ đồ hay thu xuống dưới md thì thanh bên trở lại", async () => {
		const san = await dung(
			<Vo>
				<ManSoDo tam={null} />
			</Vo>,
			"/ws/okr/so-do",
		);
		await cho(() => nutToanMan() !== null, "nut");
		await bam(nutToanMan(), "nut");
		expect(thanhBen()).toBeNull();
		dinhVi.duong = "/ws/okr/bo-okr";
		await act(async () => san.doi(<Vo>{null}</Vo>));
		await nhip(5);
		expect(thanhBen()).not.toBeNull();
		dinhVi.duong = "/ws/okr/so-do";
		await act(async () =>
			san.doi(
				<Vo>
					<ManSoDo tam={null} />
				</Vo>,
			),
		);
		await nhip(5);
		expect(thanhBen()).not.toBeNull();
		await bam(nutToanMan(), "nut");
		expect(thanhBen()).toBeNull();
		window.innerWidth = 390;
		await act(async () => {
			for (const f of ngheMedia) f();
		});
		await nhip(5);
		expect(q("[data-slot=area-sidebar-strip]")).not.toBeNull();
	});
});

describe("vk6-hai-kieu", () => {
	const soThe = () =>
		qa("[data-flow-map] [data-quanh-the], [data-flow-map] [data-so-do-the]")
			.length;

	test("vk6-hai-kieu: tâm qua trang đích rewrite, cả công ty, đổi qua lại", async () => {
		const sai: string[] = [];
		const kq = quanh(TAM);
		const trang = await TrangQuanh({
			params: Promise.resolve({ slug: "ws", objectiveId: TAM }),
		});
		const ra = await giaiMayChu(trang);
		await dung(<Vo>{ra}</Vo>, `/ws/okr/so-do/muc-tieu/${TAM}`);
		await cho(() => q("[data-flow-map]") !== null, "khung quanh");
		if (goiCua("okr.soDoDonVi").length > 0)
			sai.push("goi nham thu tuc soDoDonVi");
		if (!goiCua("okr.quanhMucTieu").every((g) => g.dauVao?.objectiveId === TAM))
			sai.push("goi quanhMucTieu sai tam");
		if (soThe() !== kq.nut.length)
			sai.push(`so the ${soThe()} ≠ ${kq.nut.length}`);
		if (!q(`[data-quanh-the][data-active=true]`))
			sai.push("the tam khong chon");
		const tenTam = kq.nut.find((n) => n.id === kq.tamId)?.tieuDe ?? "";
		if (!q("[data-slot=breadcrumb-page]")?.textContent?.includes(tenTam))
			sai.push("duong manh thieu ten tam");
		if (q("[data-dai-cong-cu] [data-loc-so-do]"))
			sai.push("loc don vi con o tam");
		if (q("[data-slot=page-shell-header]"))
			sai.push("trang cu DH5 con dau trang");
		if (q("[data-nut=ve-ca-cong-ty]")?.getAttribute("href") !== "/ws/okr/so-do")
			sai.push("lien ket ve ca cong ty");
		if (!q("[data-gop-len-cong-ty]")) sai.push("thieu dong gop len cong ty");
		if (!document.body.textContent?.includes(mq.dangXemQuanh))
			sai.push("thieu dang xem quanh");
		await bam(q("[data-quanh-the]:not([data-active=true])"), "the khac");
		if (moBanGhi.length !== 1 || moBanGhi[0]?.kind === undefined)
			sai.push("bam the khong mo ngan");
		expect(sai).toEqual([]);
	});

	test("vk6-hai-kieu: cả công ty và lọc Cần chú ý", async () => {
		const s = soDo();
		await dung(
			<Vo>
				<ManSoDo tam={null} />
			</Vo>,
			"/ws/okr/so-do",
		);
		await cho(() => q("[data-flow-map]") !== null, "khung ca cong ty");
		expect(goiCua("okr.quanhMucTieu")).toHaveLength(0);
		const moi = soThe();
		expect(moi).toBe(s.nut.length);
		const sang = () =>
			qa("[data-flow-map] [data-so-do-the]:not([data-chim])").length;
		expect(sang()).toBe(moi);
		await bam(q("[data-loc-so-do=chu-y]"), "loc chu y");
		await nhip(10);
		const soCoCo = s.nut.filter((n) => n.canChuY).length;
		expect(urlGhi.at(-1)).toContain("locSoDo=chu-y");
		expect(sang()).toBe(soCoCo);
		expect(sang()).not.toBe(moi);
	});

	test("vk6-hai-kieu: moDonVi mở thẻ đơn vị có lý do góp vào", async () => {
		await dung(
			<Vo>
				<ManSoDo tam={null} />
			</Vo>,
			`/ws/okr/so-do?moDonVi=${encodeURIComponent(KHOA_CA.A1)}`,
		);
		await cho(() => q(`[data-so-do-the="${KHOA_CA.A1}"]`) !== null, "the A1");
		const the = q(`[data-so-do-the="${KHOA_CA.A1}"]`);
		expect(the?.getAttribute("data-dang-mo")).not.toBe("false");
		expect(the?.textContent?.length ?? 0).toBeGreaterThan(0);
	});
});

describe("vk6-hep", () => {
	test("vk6-hep: dưới md không khung vẽ, không nút toàn màn hình", async () => {
		const sai: string[] = [];
		window.innerWidth = 390;
		await dung(
			<Vo>
				<ManSoDo tam={null} />
			</Vo>,
			"/ws/okr/so-do",
		);
		await cho(() => q("[data-so-do-danh-sach]") !== null, "danh sach");
		if (q("[data-flow-map]")) sai.push("ca cong ty con khung ve");
		if (nutToanMan()) sai.push("con nut toan man hinh");
		if (qa("[data-so-do-danh-sach] [data-cap]").length !== soDo().nut.length)
			sai.push("so dong danh sach");
		await act(async () => dangMo[0]?.root.unmount());
		await dung(
			<Vo>
				<ManSoDo tam={TAM} />
			</Vo>,
			`/ws/okr/so-do/muc-tieu/${TAM}`,
		);
		await cho(() => q("[data-quanh-danh-sach]") !== null, "danh sach quanh");
		const nhom = qa("[data-quanh-danh-sach] [data-nhom]").map((e) =>
			e.getAttribute("data-nhom"),
		);
		const mong = ["gop-vao", "tam", "kr", "gop-vao-no"].filter((k) =>
			nhom.includes(k),
		);
		if (nhom.join() !== mong.join()) sai.push(`thu tu nhom ${nhom.join()}`);
		if (q("[data-flow-map]")) sai.push("tam con khung ve");
		expect(sai).toEqual([]);
		window.innerWidth = 1440;
		await dung(
			<Vo>
				<ManSoDo tam={null} />
			</Vo>,
			"/ws/okr/so-do",
		);
		await cho(() => q("[data-flow-map]") !== null, "doi chung duong khung ve");
	});
});

describe("vk6-trang-thai", () => {
	const ca: { che: CheDo; tam: string | null; kiem: () => string | null }[] = [
		{
			che: "cho",
			tam: null,
			kiem: () =>
				q("[aria-busy=true]") &&
				document.body.textContent?.includes(mtc.dangTai)
					? null
					: "dang chay thieu khung xuong",
		},
		{
			che: "loi",
			tam: null,
			kiem: () =>
				document.body.textContent?.includes(mtc.loiTieuDe)
					? null
					: "loi thieu VungTaiLoi",
		},
		{
			che: "khong-thay",
			tam: TAM,
			kiem: () =>
				document.body.textContent?.includes(mq.khongThay) &&
				qa("a").some((a) => a.textContent === t.soDo.veCaCongTy) &&
				!document.body.textContent?.includes(mq.loiTieuDe)
					? null
					: "khong thay sai",
		},
		{
			che: "rong",
			tam: null,
			kiem: () => (q("[data-ky-rong]") ? null : "ky rong thieu cau"),
		},
	];

	test("vk6-trang-thai: bốn trạng thái, dải công cụ luôn hiện", async () => {
		expect(ca).toHaveLength(4);
		const sai: string[] = [];
		for (const c of ca) {
			cheDo = c.che;
			datNen();
			const san = await dung(
				<Vo>
					<ManSoDo tam={c.tam} />
				</Vo>,
				c.tam ? `/ws/okr/so-do/muc-tieu/${c.tam}` : "/ws/okr/so-do",
			);
			await nhip(20);
			if (!daiCongCu() || !q("[data-slot=breadcrumb]"))
				sai.push(`${c.che}: thieu dai cong cu`);
			if (c.che === "cho" && q("[data-flow-map]")) sai.push("cho: co khung ve");
			const loi = c.kiem();
			if (loi) sai.push(`${c.che}: ${loi}`);
			if (c.che === "loi") {
				const truoc = goiCua("okr.soDoDonVi").length;
				await bam(
					qa("button").find((b) => b.textContent?.match(/thử lại/i)) ?? null,
					"nut thu lai",
				);
				if (goiCua("okr.soDoDonVi").length !== truoc + 1)
					sai.push("loi: thu lai khong goi lai dung mot lan");
			}
			await act(async () => san.root.unmount());
			document.body.innerHTML = "";
			dangMo = dangMo.filter((d) => d !== san);
		}
		expect(sai).toEqual([]);
	});
});

type NutMayChu = ReactElement<{ children?: ReactNode }>;
const HAM_BAT_DONG_BO = (async () => null).constructor;

async function giaiMayChu(nut: ReactNode): Promise<ReactNode> {
	const { isValidElement, cloneElement, Suspense } = await import("react");
	if (Array.isArray(nut)) return Promise.all(nut.map(giaiMayChu));
	if (!isValidElement(nut)) return nut;
	const { type, props } = nut as NutMayChu;
	if (type === Suspense) return giaiMayChu(props.children);
	if (type instanceof HAM_BAT_DONG_BO)
		return giaiMayChu(
			await (type as (p: NutMayChu["props"]) => Promise<ReactNode>)(props),
		);
	if (props.children === undefined) return nut;
	return cloneElement(nut, undefined, await giaiMayChu(props.children));
}
