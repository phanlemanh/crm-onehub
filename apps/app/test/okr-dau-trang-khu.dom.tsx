// Đầu trang khu Mục tiêu (hồ sơ dieu-huong-khu-muc-tieu, DH1). Mỗi nhóm `dhk-*` là
// một eval; khi lỗi, mỗi nhóm GOM mọi ô sai rồi ném MỘT lỗi liệt kê hết — thông
// điệp ghim của chiều đỏ (rang/hai-chieu.mjs) tìm trong danh sách đó.
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Locale } from "@crm/ui/lib/locale";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	cyclesOutput,
	okrAccessOutput,
	soanSanSangOutput,
} from "../../api/src/okr/okr.contracts";
import { danhSachOutput } from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";
import {
	cho,
	type DauVao,
	dat,
	datLai,
	dinhVi,
	goiCua,
	nhip,
} from "./khung-soan-okr";

let localeMayChu: Locale = "vi";
mock.module("@/lib/locale/server", () => ({
	getLocale: async () => localeMayChu,
}));
mock.module("@/lib/session", () => ({ requireSession: async () => null }));
mock.module("@/lib/trpc/hydrate", () => ({
	HydrateClient: ({ children }: { children: unknown }) => children,
}));
mock.module("server-only", () => ({}));
mock.module("@/lib/trpc/server", () => ({
	getServerTrpc: () => ({}),
	getServerQueryClient: () => ({}),
	getServerTrpcClient: () => ({}),
}));

const { DauTrangOkr } = await import("@/app/(app)/[slug]/okr/thanh-tab");
const { TheoDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi"
);
const { donDich } = await import("@/app/(app)/[slug]/okr/don-dich");
const { ID_KHONG_THEM } = await import("@/app/(app)/[slug]/okr/hanh-dong-khu");
const { TAB } = await import("@/app/(app)/[slug]/okr/tab-okr");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrMessages } = await import("@/lib/messages/okr");
const { okrSoanMessages } = await import("@/lib/messages/okr-soan");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");
const { khungUngDungMessages } = await import("@/lib/messages/khung-ung-dung");
const { dauThangSau, homNayVn } = await import("@/lib/okr-chu-ky-nhan");
const { TRO_LY_OKR_TRAN } = await import("@crm/validation/okr-tro-ly");

const TRANG = {
	"cua-toi": await import("@/app/(app)/[slug]/okr/page"),
	"cap-nhat-tuan": await import("@/app/(app)/[slug]/okr/cap-nhat-tuan/page"),
	"theo-don-vi": await import("@/app/(app)/[slug]/okr/theo-don-vi/page"),
	"toan-canh": await import("@/app/(app)/[slug]/okr/toan-canh/page"),
	"hoi-y": await import("@/app/(app)/[slug]/okr/hoi-y/page"),
} as const;
const TRANG_SUC_KHOE = await import(
	"@/app/(app)/[slug]/okr/toan-canh/suc-khoe/page"
);

type TabOkr = (typeof TAB)[number];
const DUONG_TAB = {
	"cua-toi": "/ws/okr",
	"cap-nhat-tuan": "/ws/okr/cap-nhat-tuan",
	"theo-don-vi": "/ws/okr/theo-don-vi",
	"toan-canh": "/ws/okr/toan-canh",
	"hoi-y": "/ws/okr/hoi-y",
} satisfies Record<TabOkr, string>;
const DUONG_SUC_KHOE = "/ws/okr/toan-canh/suc-khoe";

const GOC_KHO = join(dirname(fileURLToPath(import.meta.url)), "..");

// ---------- dữ liệu mẫu: rút qua schema đầu ra THẬT của máy chủ ----------

const nguoi = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@onehub.vn`,
});
const LAN = nguoi("lan", "Nguyễn Thị Lan");
const HUNG = nguoi("hung", "Trần Văn Hùng");
const MAI = nguoi("mai", "Lê Thanh Mai");
const KHOA = nguoi("khoa", "Đặng Anh Khoa");

const pb = (
	id: string,
	name: string,
	divisionId: string,
	head: typeof LAN | null,
) => ({
	id,
	name,
	moTa: "",
	position: 0,
	divisionId,
	head,
	stepCount: 0,
	okrMo: 0,
	people: head ? [{ ...head, primary: true }] : [],
});

const CAY = orgTreeOutput.parse({
	divisions: [
		{
			id: "B1",
			name: "Kinh doanh",
			moTa: "",
			position: 0,
			head: LAN,
			okrMo: 0,
			departments: [
				pb("P2", "Kinh doanh vùng 1", "B1", HUNG),
				pb("P3", "Kinh doanh vùng 2", "B1", MAI),
			],
		},
		{
			id: "B2",
			name: "Vận hành",
			moTa: "",
			position: 1,
			head: null,
			okrMo: 0,
			departments: [pb("P9", "Kho vận", "B2", KHOA)],
		},
	],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [],
	archived: { divisions: [], departments: [] },
	coverage: { members: 4, withPrimary: 4, departmentsWithoutHead: 0 },
});

type Pha = "lap-ke-hoach" | "dang-chay";
const kyMau = (id: string, kind: "quy" | "nam", pha: Pha) => ({
	id,
	kind,
	name: kind === "nam" ? "Năm 2027" : "Quý 4/2026",
	parentId: null,
	startsOn: kind === "nam" ? "2027-01-01" : "2026-10-01",
	endsOn: kind === "nam" ? "2027-12-31" : "2026-12-31",
	phase: pha,
	breakStartsOn: null,
	breakEndsOn: null,
	updateWeekday: 1,
	cuaSoRa: null,
	anLuc: null,
	anLyDo: null,
	quyConHien: 0,
	viec: { suaMoiO: false, suaTen: false, go: false, an: false, hienLai: false },
});

// Hai chu kỳ: q4 đang chạy (mặc định của Theo đơn vị) và n27 lập kế hoạch
// (mặc định của Hỏi ý) — bộ hai mặc định khác nhau.
const haiChuKy = () =>
	cyclesOutput.parse({
		cycles: [
			kyMau("q4", "quy", "dang-chay"),
			kyMau("n27", "nam", "lap-ke-hoach"),
		],
		currentId: "q4",
	});

const chuKy = (pha: Pha) =>
	cyclesOutput.parse({
		cycles: [
			{
				id: "q4",
				kind: "quy",
				name: "Quý 4/2026",
				parentId: null,
				startsOn: "2026-10-01",
				endsOn: "2026-12-31",
				phase: pha,
				breakStartsOn: null,
				breakEndsOn: null,
				updateWeekday: 1,
				cuaSoRa: null,
				anLuc: null,
				anLyDo: null,
				quyConHien: 0,
				viec: {
					suaMoiO: false,
					suaTen: false,
					go: false,
					an: false,
					hienLai: false,
				},
			},
		],
		currentId: "q4",
	});

type NguoiXem = {
	ten: string;
	quanTri: boolean;
	headOf: { divisions: string[]; departments: string[] };
};
const QT: NguoiXem = {
	ten: "quan tri",
	quanTri: true,
	headOf: { divisions: [], departments: [] },
};
const TB1: NguoiXem = {
	ten: "truong bo phan B1",
	quanTri: false,
	headOf: { divisions: ["B1"], departments: [] },
};
const TP2: NguoiXem = {
	ten: "truong phong ban P2",
	quanTri: false,
	headOf: { divisions: [], departments: ["P2"] },
};
const CA: NguoiXem = {
	ten: "truong ca B1 lan P3",
	quanTri: false,
	headOf: { divisions: ["B1"], departments: ["P3"] },
};
const TV: NguoiXem = {
	ten: "thanh vien khong dan ai",
	quanTri: false,
	headOf: { divisions: [], departments: [] },
};

const BAT = soanSanSangOutput.parse({
	bat: true,
	nac: "bat",
	soCuocDaDung: 0,
	tranCuoc: TRO_LY_OKR_TRAN.soan.cuocMoiDonViMoiKy,
	cuocDang: null,
	thieuBoiCanh: false,
});

type Nen = {
	haiKy?: boolean;
	xem?: NguoiXem;
	pha?: Pha;
	duoc?: boolean;
	cauNoi?: boolean;
	sanSang?: unknown;
	treoQuyen?: boolean;
	loiQuyen?: boolean;
};

function datNen({
	haiKy = false,
	xem = QT,
	pha = "dang-chay",
	duoc = true,
	sanSang = BAT,
	treoQuyen = false,
	loiQuyen = false,
}: Nen) {
	dat("okr.cycles", () => (haiKy ? haiChuKy() : chuKy(pha)));
	dat("okr.access", () => {
		if (treoQuyen) return new Promise(() => {});
		if (loiQuyen) throw new Error("may chu loi");
		return okrAccessOutput.parse({
			canManageProgram: xem.quanTri,
			headOf: xem.headOf,
		});
	});
	dat("org.tree", () => CAY);
	dat("workspace.get", () => ({ name: "OneHub" }));
	dat("okr.countByUnit", () => ({}));
	dat("okr.danhSach", () =>
		danhSachOutput.parse({
			rows: [],
			daBo: [],
			total: 0,
			facetCounts: {
				phuTrach: [],
				loai: [],
				trangThai: [],
				tuTin: [],
				gopY: [],
			},
			canEdit: duoc,
			canCreate: duoc,
		}),
	);
	dat("okr.soanSanSang", () => sanSang);
	dat("okr.soanMo", () => ({ ok: true, cuoc: { id: "cuoc-moi" } }));
	dat("okr.hoiYNhan", () => null);
}

// ---------- dựng ----------

type San = { o: HTMLElement; root: Root; url: () => URLSearchParams };
let dangMo: San[] = [];

beforeEach(() => {
	datLai();
});

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

async function don() {
	for (const s of dangMo) await act(async () => s.root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
	datLai();
}

async function dung(
	man: ReactElement,
	{
		locale = "vi",
		thamSo = "",
		duong,
	}: { locale?: Locale; thamSo?: string; duong: string },
): Promise<San> {
	dinhVi.duong = duong;
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	let url = new URLSearchParams(thamSo);
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					url = new URLSearchParams(e.searchParams);
				}}
				searchParams={thamSo}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root, url: () => url };
	dangMo.push(san);
	await nhip(10);
	return san;
}

const CHON_GIA = <span data-chon-chu-ky-gia="" />;

async function dauTrang(
	tab: TabOkr | "suc-khoe",
	nen: Nen,
	thamSo = "",
	locale: Locale = "vi",
	kemThan = false,
): Promise<San> {
	datNen(nen);
	const duong = tab === "suc-khoe" ? DUONG_SUC_KHOE : DUONG_TAB[tab];
	return dung(
		<>
			<DauTrangOkr cauNoi={nen.cauNoi ?? true} chonChuKy={CHON_GIA} />
			{kemThan ? (
				<div data-than-don-vi="">
					<TheoDonVi />
				</div>
			) : null}
		</>,
		{ locale, thamSo, duong },
	);
}

const q = (chon: string, goc: ParentNode = document) =>
	goc.querySelector<HTMLElement>(chon);
const qa = (chon: string, goc: ParentNode = document) => [
	...goc.querySelectorAll<HTMLElement>(chon),
];
const hang = () => q("[data-slot=page-shell-actions]");
const nutThem = () => q("[data-nut=them-muc-tieu]");

const nguoiDung = () =>
	userEvent.setup({ document, pointerEventsCheck: 0, delay: null });
async function bam(o: Element | null, moTa: string) {
	if (!o) throw new Error(`khong thay: ${moTa}`);
	await act(async () => {
		await nguoiDung().click(o);
	});
	await nhip(6);
}

function soSai() {
	const sai: string[] = [];
	return {
		kiem(dung: boolean, cau: string) {
			if (!dung) sai.push(cau);
		},
		xong(ten: string, soO: number) {
			console.log(`${ten}: ${soO - sai.length}/${soO} o dat`);
			if (sai.length > 0) throw new Error(sai.join("\n"));
		},
	};
}

const khoaDonChu = (d: { loai: string; id?: string }) =>
	d.loai === "goc" ? "goc" : `${d.loai}:${d.id}`;

// ---------- dhk-don-dich (E4) ----------

describe("dhk-don-dich", () => {
	// Ma trận viết trước: 6 nguồn đường dẫn × 5 người xem = 30 ô, kỳ vọng ghi tay
	// theo thứ tự đã chốt ở Cổng Phạm vi: đơn vị mình dẫn → donOkr → cấp công ty.
	const NGUON: {
		ten: string;
		don: { loai: "bp" | "pb" | "nguoi" | "goc"; id?: string } | null;
	}[] = [
		{ ten: "donOkr=bp:B2", don: { loai: "bp", id: "B2" } },
		{ ten: "donOkr=pb:P2", don: { loai: "pb", id: "P2" } },
		{ ten: "donOkr=nguoi:hung", don: { loai: "nguoi", id: "hung" } },
		{ ten: "donOkr=goc", don: { loai: "goc" } },
		{ ten: "donOkr=pb:P9", don: { loai: "pb", id: "P9" } },
		{ ten: "khong donOkr", don: null },
	];
	const KY_VONG = {
		[QT.ten]: ["bp:B2", "pb:P2", "nguoi:hung", "goc", "pb:P9", "goc"],
		[TB1.ten]: ["bp:B1", "bp:B1", "bp:B1", "bp:B1", "bp:B1", "bp:B1"],
		[TP2.ten]: ["pb:P2", "pb:P2", "pb:P2", "pb:P2", "pb:P2", "pb:P2"],
		[CA.ten]: ["bp:B1", "bp:B1", "bp:B1", "bp:B1", "bp:B1", "bp:B1"],
		[TV.ten]: ["bp:B2", "pb:P2", "nguoi:hung", "goc", "pb:P9", "goc"],
	} satisfies Record<string, string[]>;

	test("dhk-don-dich: 30 ô — đơn vị mình dẫn trước, rồi đường dẫn, rồi công ty", () => {
		const s = soSai();
		let soO = 0;
		for (const xem of [QT, TB1, TP2, CA, TV]) {
			NGUON.forEach((n, i) => {
				soO += 1;
				const mong = KY_VONG[xem.ten]?.[i];
				const nhan = khoaDonChu(
					donDich("cua-toi", n.don as never, xem.headOf).don,
				);
				s.kiem(
					nhan === mong,
					`dhk-don-dich: ${n.ten} + ${xem.ten}: mong ${mong}, nhan ${nhan}`,
				);
			});
		}
		// Ở Theo đơn vị luôn là đơn vị đang chọn, kể cả với người dẫn đơn vị khác.
		soO += 2;
		s.kiem(
			khoaDonChu(
				donDich("theo-don-vi", { loai: "pb", id: "P9" }, TP2.headOf).don,
			) === "pb:P9",
			"dhk-don-dich: theo-don-vi donOkr=pb:P9 + truong phong ban P2: mong pb:P9",
		);
		s.kiem(
			khoaDonChu(donDich("theo-don-vi", null, TP2.headOf).don) === "goc",
			"dhk-don-dich: theo-don-vi khong donOkr: mong goc",
		);
		s.xong("dhk-don-dich", soO);
	});

	test("dhk-don-dich: nút ở Của tôi dẫn tới Theo đơn vị của đơn vị đích với ngăn tạo mở; ở Theo đơn vị bấm là mở ngay", async () => {
		await dauTrang("cua-toi", { xem: TP2 }, "?kyOkr=q4&donOkr=pb:P9");
		await cho(
			() => nutThem() !== null && !nutThem()?.hasAttribute("disabled"),
			"nut them",
		);
		const a =
			nutThem()?.closest("a") ??
			(nutThem()?.tagName === "A" ? nutThem() : null);
		const href = a?.getAttribute("href") ?? "";
		const u = new URL(href, "http://x");
		expect(u.pathname).toBe("/ws/okr/theo-don-vi");
		expect(u.searchParams.get("kyOkr")).toBe("q4");
		expect(u.searchParams.get("donOkr")).toBe("pb:P2");
		expect(u.searchParams.get("new")).toBe("true");
		await don();

		// Hỏi ý mặc định chu kỳ lập kế hoạch, Theo đơn vị mặc định chu kỳ đang chạy:
		// liên kết phải mang đúng chu kỳ mà quyền vừa được hỏi.
		for (const [tab, mong] of [
			["hoi-y", "n27"],
			["cua-toi", null],
		] as const) {
			await dauTrang(tab, { xem: TP2, haiKy: true });
			await cho(
				() => nutThem() !== null && !nutThem()?.hasAttribute("disabled"),
				`nut them ${tab}`,
			);
			const ds = goiCua("okr.danhSach").at(-1)?.dauVao as
				| { cycleId?: string }
				| undefined;
			const a =
				nutThem()?.closest("a") ??
				(nutThem()?.tagName === "A" ? nutThem() : null);
			const ky = new URL(
				a?.getAttribute("href") ?? "/",
				"http://x",
			).searchParams.get("kyOkr");
			const chay = ky ?? "q4";
			if (chay !== (ds?.cycleId ?? "?") || ky !== mong)
				throw new Error(
					`dhk-don-dich: ${tab} gui sang Theo don vi ky «${chay}», quyen hoi ky «${ds?.cycleId}», mong kyOkr=${mong ?? "(vang)"}`,
				);
			await don();
		}

		const san = await dauTrang("theo-don-vi", { xem: TP2 }, "?donOkr=pb:P2");
		await cho(
			() => nutThem() !== null && !nutThem()?.hasAttribute("disabled"),
			"nut them",
		);
		await bam(nutThem(), "nut them");
		expect(san.url().get("new")).toBe("true");
		expect(san.url().get("donOkr")).toBe("pb:P2");
	});
});

// ---------- dhk-tieu-de (E1) ----------

describe("dhk-tieu-de", () => {
	test("dhk-tieu-de: h1 = nhãn thanh bên ở 6 trang × 2 ngôn ngữ × 2 pha; mô tả khác nhau; tiêu đề trình duyệt", async () => {
		const s = soSai();
		let soO = 0;
		const TRANG_DO: (TabOkr | "suc-khoe")[] = [
			"cua-toi",
			"cap-nhat-tuan",
			"theo-don-vi",
			"toan-canh",
			"suc-khoe",
			"hoi-y",
		];
		for (const locale of ["vi", "en"] as const) {
			const rail = khungUngDungMessages(locale).rail.okr;
			const moTa = new Map<string, string>();
			for (const t of TRANG_DO) {
				for (const pha of ["dang-tai", "da-dung"] as const) {
					soO += 1;
					await dauTrang(t, { treoQuyen: pha === "dang-tai" }, "", locale);
					const h1 = q("h1")?.textContent ?? "";
					const duong =
						t === "suc-khoe"
							? "/okr/toan-canh/suc-khoe"
							: DUONG_TAB[t].replace("/ws", "");
					s.kiem(
						h1 === rail,
						`dhk-tieu-de: h1 «${h1}» khac nhan thanh ben «${rail}» o ${duong} ${locale}${pha === "dang-tai" ? " (dang tai)" : ""}`,
					);
					if (t !== "suc-khoe" && pha === "da-dung")
						moTa.set(
							t,
							q("[data-slot=page-shell-description]")?.textContent ?? "",
						);
					await don();
				}
			}
			soO += 1;
			s.kiem(
				new Set(moTa.values()).size === 5,
				`dhk-tieu-de: ${locale} chi co ${new Set(moTa.values()).size}/5 cau mo ta khac nhau`,
			);
			localeMayChu = locale;
			const m = okrMessages(locale);
			for (const t of TAB) {
				soO += 1;
				const tieuDe = (await TRANG[t].generateMetadata()).title;
				s.kiem(
					tieuDe === `${m.tab[t]} · ${rail}`,
					`dhk-tieu-de: tieu de trinh duyet ${t} ${locale} «${String(tieuDe)}»`,
				);
			}
			soO += 1;
			const sk = (await TRANG_SUC_KHOE.generateMetadata()).title;
			s.kiem(
				sk === `${okrToanCanhMessages(locale).toanCanh.suKhoe} · ${rail}`,
				`dhk-tieu-de: tieu de trinh duyet suc-khoe ${locale} «${String(sk)}»`,
			);
		}
		localeMayChu = "vi";
		s.xong("dhk-tieu-de", soO);
	});
});

// ---------- dhk-hanh-dong (E3) ----------

function coNutHoiKara(): boolean {
	// Nút «Hỏi Kara» (hàng hoi-dap-okr) có được dựng trong khu Mục tiêu không — rút từ cây, không viết tay.
	const r = spawnSync(
		"git",
		["grep", "-q", "<NutHoiKara", "--", ":(literal)app/(app)/[slug]/okr"],
		{
			cwd: GOC_KHO,
		},
	);
	return r.status === 0;
}

describe("dhk-hanh-dong", () => {
	test("dhk-hanh-dong: hàng hành động ở đầu trang 5 thẻ × 2 pha; thân Theo đơn vị không còn nút tạo", async () => {
		const s = soSai();
		const hoiKara = coNutHoiKara();
		let soO = 0;
		for (const t of TAB) {
			for (const pha of ["lap-ke-hoach", "dang-chay"] as const) {
				soO += 1;
				await dauTrang(t, { pha }, "", "vi", t === "theo-don-vi");
				await cho(() => nutThem() !== null, `nut them ${t}`);
				await nhip(6);
				const h = hang();
				const con = h ? [...h.children] : [];
				const mong = (pha === "lap-ke-hoach" ? 4 : 3) + (hoiKara ? 1 : 0);
				s.kiem(
					con.length === mong,
					`dhk-hanh-dong: ${t} ${pha} co ${con.length} phan tu, mong ${mong}`,
				);
				s.kiem(
					Boolean(h?.contains(nutThem())) &&
						con.at(-1)?.contains(nutThem()) === true,
					`dhk-hanh-dong: ${t} ${pha} nut them-muc-tieu khong la cuoi hang hanh dong`,
				);
				s.kiem(
					Boolean(q("[data-chon-chu-ky-gia]", h ?? document)) &&
						Boolean(q("[data-nut=them-cach]", h ?? document)),
					`dhk-hanh-dong: ${t} ${pha} thieu o chu ky hoac nut «…»`,
				);
				s.kiem(
					(pha === "lap-ke-hoach") ===
						Boolean(q("[data-nhom-soan]", h ?? document)),
					`dhk-hanh-dong: ${t} ${pha} nhom soan ${q("[data-nhom-soan]", h ?? document) ? "co" : "vang"}`,
				);
				const kara = qa("[data-nut=hoi-kara]");
				if (hoiKara)
					s.kiem(
						kara.length > 0 && kara.every((k) => h?.contains(k) === true),
						"dhk-hanh-dong: co NutHoiKara nhung khong nam trong page-shell-actions",
					);
				if (t === "theo-don-vi") {
					await cho(
						() => q("[data-than-don-vi] [data-chon-don-vi]") !== null,
						"than theo don vi dung xong",
					);
					const than = q("[data-than-don-vi]");
					for (const [chon, ten] of [
						["[data-nut=them-muc-tieu]", "them-muc-tieu"],
						["[data-nut=nhap-bang-tinh]", "nhap-bang-tinh"],
						["[data-nhom-soan]", "nhom-soan"],
					] as const) {
						soO += 1;
						s.kiem(
							!than || q(chon, than) === null,
							`dhk-hanh-dong: theo-don-vi con nut ${ten} trong than`,
						);
					}
				}
				await don();
			}
		}
		s.xong("dhk-hanh-dong", soO);
	});
});

// ---------- dhk-menu-soan (E6) ----------

const ms = okrSoanMessages("vi");

describe("dhk-menu-soan", () => {
	test("dhk-menu-soan: «…» chỉ có Nhập; mở hộp nhập cho đơn vị đích; nút soạn và đối số truy vấn theo đơn vị đích", async () => {
		const s = soSai();
		let soO = 0;
		// (a) Theo đơn vị: chọn mục → khoá nhapOkr, hộp nhập mở trong thân.
		const san = await dauTrang(
			"theo-don-vi",
			{ xem: TP2 },
			"?donOkr=pb:P2",
			"vi",
			true,
		);
		await cho(
			() => nutThem() !== null && !nutThem()?.hasAttribute("disabled"),
			"nut them",
		);
		await bam(q("[data-nut=them-cach]"), "nut «…»");
		const muc = qa("[role=menuitem]");
		soO += 1;
		s.kiem(
			muc.length === 1 &&
				muc[0]?.textContent === okrMessages("vi").nhapBangTinh,
			`dhk-menu-soan: menu «…» co ${muc.length} muc`,
		);
		await bam(q("[data-nut=nhap-bang-tinh]"), "muc nhap");
		soO += 1;
		s.kiem(
			san.url().get("nhapOkr") === "true",
			"dhk-menu-soan: chon Nhap khong dat khoa nhapOkr",
		);
		await cho(() => q("[role=dialog]") !== null, "hop nhap");
		await don();

		// (a') Của tôi: mục Nhập là liên kết sang Theo đơn vị của đơn vị đích.
		await dauTrang("cua-toi", { xem: TP2 }, "?kyOkr=q4&donOkr=pb:P9");
		await cho(
			() => nutThem() !== null && !nutThem()?.hasAttribute("disabled"),
			"nut them",
		);
		await bam(q("[data-nut=them-cach]"), "nut «…»");
		const lienKet = q("[data-nut=nhap-bang-tinh]");
		const u = new URL(
			(lienKet?.tagName === "A"
				? lienKet
				: lienKet?.querySelector("a")
			)?.getAttribute("href") ?? "/",
			"http://x",
		);
		const mongNhap = khoaDonChu(
			donDich("cua-toi", { loai: "pb", id: "P9" }, TP2.headOf).don,
		);
		soO += 1;
		s.kiem(
			u.searchParams.get("nhapOkr") === "true" &&
				(u.searchParams.get("donOkr") ?? "goc") === mongNhap,
			`dhk-menu-soan: hop nhap mo cho ${u.searchParams.get("donOkr") ?? "goc"}, mong ${mongNhap}`,
		);
		// (d) đối số truy vấn đầu trang = đơn vị đích do donDich tính.
		const ds = goiCua("okr.danhSach").at(-1)?.dauVao as
			| { unit?: { loai: string; id?: string } }
			| undefined;
		soO += 1;
		s.kiem(
			khoaDonChu(ds?.unit ?? { loai: "?" }) === mongNhap,
			`dhk-menu-soan: dau trang hoi danhSach cho ${khoaDonChu(ds?.unit ?? { loai: "?" })}, mong ${mongNhap}`,
		);
		await don();

		// (b) nút soạn ở đầu trang mở cuộc soạn cho đơn vị đích; soanSanSang hỏi đúng đích.
		await dauTrang(
			"cua-toi",
			{ xem: TP2, pha: "lap-ke-hoach" },
			"?donOkr=pb:P9",
		);
		await cho(() => q("[data-nhom-soan] button") !== null, "nut soan");
		const ss = goiCua("okr.soanSanSang").at(-1)?.dauVao as DauVao;
		soO += 1;
		s.kiem(
			ss?.departmentId === "P2",
			`dhk-menu-soan: soanSanSang hoi ${JSON.stringify(ss)}, mong phong-ban P2`,
		);
		await bam(q("[data-nhom-soan] button"), "nut soan");
		const moi = goiCua("okr.soanMo").at(-1)?.dauVao as DauVao;
		soO += 1;
		s.kiem(
			moi?.departmentId === "P2",
			`dhk-menu-soan: soanMo gui ${JSON.stringify(moi)}`,
		);
		await don();

		// (c) năm dạng khoá của nút soạn — chữ ở popover «i» rút từ messages thật.
		const DANG: { ten: string; nen: Nen; chu: string | null }[] = [
			{
				ten: "chua-cau-hinh",
				nen: { xem: QT, cauNoi: false },
				chu: ms.nut.chuaCauHinh,
			},
			{
				ten: "het-luot",
				nen: {
					sanSang: soanSanSangOutput.parse({ bat: false, lyDo: "het-cuoc-ky" }),
				},
				chu: ms.nut.hetCuoc(String(TRO_LY_OKR_TRAN.soan.cuocMoiDonViMoiKy)),
			},
			{
				ten: "het-tran",
				nen: {
					sanSang: soanSanSangOutput.parse({
						bat: false,
						lyDo: "het-tran-thang",
					}),
				},
				chu: ms.nut.tamNghi(dauThangSau(homNayVn(new Date()))),
			},
			{
				ten: "chua-co-khoa",
				nen: {
					sanSang: soanSanSangOutput.parse({
						bat: false,
						lyDo: "chua-co-khoa-mo-hinh",
					}),
				},
				chu: ms.lyDo["chua-co-khoa-mo-hinh"],
			},
			{ ten: "khong-quyen", nen: { xem: TV, duoc: false }, chu: null },
		];
		for (const d of DANG) {
			soO += 1;
			await dauTrang(
				"theo-don-vi",
				{ pha: "lap-ke-hoach", ...d.nen },
				"?donOkr=pb:P2",
			);
			await cho(
				() => q("[data-nhom-soan] button") !== null,
				`nut soan ${d.ten}`,
			);
			await nhip(6);
			const nut = q("[data-nhom-soan] button") as HTMLButtonElement | null;
			if (d.chu === null) {
				s.kiem(
					nut?.disabled === true &&
						nut.getAttribute("aria-describedby") === ID_KHONG_THEM,
					`dhk-menu-soan: ${d.ten} nut soan khong khoa kem ly do dau trang`,
				);
			} else {
				await bam(q("[data-nut=thong-tin-soan]"), `nut i ${d.ten}`);
				const pop = q("[data-thong-tin-soan]")?.textContent ?? "";
				s.kiem(
					nut?.disabled === true && pop.includes(d.chu),
					`dhk-menu-soan: ${d.ten} popover «${pop.slice(0, 60)}» thieu «${d.chu}»`,
				);
			}
			await don();
		}
		s.xong("dhk-menu-soan", soO);
	});
});

// ---------- dhk-khoa-ly-do (E7) ----------

describe("dhk-khoa-ly-do", () => {
	test("dhk-khoa-ly-do: 12 ô — khoá kèm đúng một dòng lý do, không ẩn; có quyền thì không dòng nào", async () => {
		const s = soSai();
		const m = okrMessages("vi");
		const NGUON = [
			{
				ten: "chon don vi",
				tab: "theo-don-vi" as const,
				xem: TV,
				tham: "?donOkr=pb:P9",
				cau: m.khoaTao.khongSua.replace("{ten}", "Kho vận"),
			},
			{
				ten: "don vi minh dan",
				tab: "cua-toi" as const,
				xem: TP2,
				tham: "",
				cau: m.khoaTao.khongSua.replace("{ten}", "Kinh doanh vùng 1"),
			},
			{
				ten: "khong dan ai",
				tab: "cua-toi" as const,
				xem: TV,
				tham: "",
				cau: m.khoaTao.chuaDan,
			},
		];
		let soO = 0;
		for (const duoc of [true, false]) {
			for (const n of NGUON) {
				for (const pha of ["lap-ke-hoach", "dang-chay"] as const) {
					soO += 1;
					const o = `(${n.ten}, ${pha})`;
					await dauTrang(n.tab, { xem: n.xem, duoc, pha }, n.tham);
					await nhip(10);
					const nut = nutThem() as HTMLButtonElement | null;
					const ghi = qa("[data-slot=page-shell-note]");
					if (!duoc) {
						if (!nut) {
							s.kiem(
								false,
								`dhk-khoa-ly-do: nut them-muc-tieu vang khi canCreate=false ${o}`,
							);
						} else {
							s.kiem(
								nut.disabled &&
									nut.getAttribute("aria-describedby") === ID_KHONG_THEM,
								`dhk-khoa-ly-do: nut them-muc-tieu khong khoa kem ly do ${o}`,
							);
							s.kiem(
								ghi.length === 1 &&
									ghi[0]?.id === ID_KHONG_THEM &&
									ghi[0]?.textContent === n.cau,
								`dhk-khoa-ly-do: dong ly do ${o} «${ghi.map((g) => g.textContent).join(" | ")}», mong «${n.cau}»`,
							);
							if (pha === "lap-ke-hoach") {
								const soan = q(
									"[data-nhom-soan] button",
								) as HTMLButtonElement | null;
								s.kiem(
									soan?.disabled === true &&
										soan.getAttribute("aria-describedby") === ID_KHONG_THEM,
									`dhk-khoa-ly-do: nut soan vang hoac khong khoa ${o}`,
								);
							}
							await bam(q("[data-nut=them-cach]"), "nut «…»");
							const nhap = q("[data-nut=nhap-bang-tinh]");
							s.kiem(
								nhap?.getAttribute("data-disabled") !== null &&
									nhap?.getAttribute("aria-describedby") === ID_KHONG_THEM,
								`dhk-khoa-ly-do: muc Nhap khong khoa cung nut chinh ${o}`,
							);
						}
					} else {
						s.kiem(
							Boolean(nut) && !nut?.disabled && ghi.length === 0,
							`dhk-khoa-ly-do: co quyen ma nut khoa hoac co dong ly do ${o}`,
						);
					}
					await don();
				}
			}
		}
		// Đường dẫn có khoá tạo mà không đủ quyền → ngăn không mở, khoá rời URL.
		soO += 1;
		const san = await dauTrang(
			"theo-don-vi",
			{ xem: TV, duoc: false },
			"?donOkr=pb:P9&new=true",
			"vi",
			true,
		);
		await nhip(10);
		s.kiem(
			san.url().get("new") === null,
			"dhk-khoa-ly-do: khoa tao con tren URL khi khong du quyen",
		);
		s.xong("dhk-khoa-ly-do", soO);
	});
});

// ---------- dhk-giu-don (E8) ----------

describe("dhk-giu-don", () => {
	test("dhk-giu-don: 25 liên kết thẻ mang đúng kyOkr và donOkr đang có; vòng đi-về giữ đơn vị", async () => {
		const s = soSai();
		const DUONG_DAN = [
			"?kyOkr=q4&donOkr=pb:P2",
			"?kyOkr=q4",
			"?donOkr=pb:P2",
			"",
			"?kyOkr=q4&donOkr=pb:P2&xemOkr=hop-tuan&phuTrachOkr=hung&new=true",
		];
		let soO = 0;
		for (const tham of DUONG_DAN) {
			const vao = new URLSearchParams(tham);
			const mong = new URLSearchParams();
			for (const k of ["kyOkr", "donOkr", "xemOkr"]) {
				const v = vao.get(k);
				if (v) mong.set(k, v);
			}
			await dauTrang("theo-don-vi", {}, tham);
			for (const t of TAB) {
				soO += 1;
				const a = qa("[role=tab]").find(
					(x) =>
						x.getAttribute("href")?.startsWith(DUONG_TAB[t]) &&
						new URL(x.getAttribute("href") ?? "", "http://x").pathname ===
							DUONG_TAB[t],
				);
				const ra = new URL(a?.getAttribute("href") ?? "/", "http://x")
					.searchParams;
				const thieu = [...mong].filter(([k, v]) => ra.get(k) !== v);
				const thua = [...ra.keys()].filter((k) => !mong.has(k));
				s.kiem(
					thieu.length === 0 && thua.length === 0,
					`dhk-giu-don: lien ket ${t}${thieu.length ? ` thieu ${thieu.map(([k, v]) => `${k}=${v}`).join(",")}` : ""}${thua.length ? ` thua ${thua.join(",")}` : ""}`,
				);
			}
			await don();
		}
		// Vòng đi-về: Theo đơn vị → bốn thẻ khác lần lượt → Theo đơn vị.
		soO += 1;
		let tham = "?kyOkr=q4&donOkr=pb:P2";
		let dangO: TabOkr = "theo-don-vi";
		for (const t of [
			"cua-toi",
			"cap-nhat-tuan",
			"toan-canh",
			"hoi-y",
			"theo-don-vi",
		] as const) {
			await dauTrang(dangO, {}, tham);
			const a = qa("[role=tab]").find(
				(x) =>
					new URL(x.getAttribute("href") ?? "", "http://x").pathname ===
					DUONG_TAB[t],
			);
			tham = new URL(a?.getAttribute("href") ?? "/", "http://x").search;
			dangO = t;
			await don();
		}
		const cuoi = new URLSearchParams(tham);
		s.kiem(
			cuoi.get("kyOkr") === "q4" && cuoi.get("donOkr") === "pb:P2",
			`dhk-giu-don: di-ve ve Theo don vi voi «${tham}»`,
		);
		s.xong("dhk-giu-don", soO);
	});
});

// ---------- dhk-suc-khoe (E9) ----------

describe("dhk-suc-khoe", () => {
	test("dhk-suc-khoe: tiêu đề khu, thẻ Toàn cảnh, đường dẫn A › B khớp, về giữ ky + đơn vị; en một cách viết", async () => {
		const s = soSai();
		const { SucKhoe } = await import(
			"@/app/(app)/[slug]/okr/toan-canh/suc-khoe/suc-khoe"
		);
		let soO = 0;
		for (const locale of ["vi", "en"] as const) {
			soO += 1;
			// Người không quản trị: thân trang dừng ở «không quyền», không kéo thêm
			// truy vấn nào — ca này chỉ đo đầu trang và đường dẫn A › B.
			datNen({ xem: TV });
			await dung(
				<>
					<DauTrangOkr chonChuKy={CHON_GIA} />
					<SucKhoe />
				</>,
				{ locale, thamSo: "?kyOkr=q4&donOkr=pb:P2", duong: DUONG_SUC_KHOE },
			);
			await cho(
				() => q("nav[aria-label] a, [data-slot=breadcrumb] a") !== null,
				"breadcrumb",
			);
			const rail = khungUngDungMessages(locale).rail.okr;
			const dangChon = qa("[role=tab]").find(
				(x) => x.getAttribute("aria-current") === "page",
			);
			const muc = qa("[data-slot=breadcrumb-item]");
			const dau = muc[0]?.textContent ?? "";
			const cuoi = muc.at(-1)?.textContent ?? "";
			localeMayChu = locale;
			const tieuDe = String((await TRANG_SUC_KHOE.generateMetadata()).title);
			const href =
				q("[data-slot=breadcrumb-item] a")?.getAttribute("href") ?? "";
			const u = new URL(href, "http://x");
			s.kiem(
				q("h1")?.textContent === rail,
				`dhk-suc-khoe: h1 ${locale} «${q("h1")?.textContent}»`,
			);
			s.kiem(
				new URL(dangChon?.getAttribute("href") ?? "/", "http://x").pathname ===
					DUONG_TAB["toan-canh"],
				`dhk-suc-khoe: the dang chon ${locale} khong la Toan canh`,
			);
			s.kiem(
				dau === dangChon?.textContent,
				`dhk-suc-khoe: muc dau «${dau}» khac the «${dangChon?.textContent}»`,
			);
			s.kiem(
				tieuDe.startsWith(`${cuoi} · `),
				`dhk-suc-khoe: muc cuoi «${cuoi}» khac tieu de «${tieuDe}»`,
			);
			s.kiem(
				u.searchParams.get("kyOkr") === "q4",
				"dhk-suc-khoe: lien ket Toan canh thieu kyOkr",
			);
			s.kiem(
				u.searchParams.get("donOkr") === "pb:P2",
				"dhk-suc-khoe: lien ket Toan canh thieu donOkr",
			);
			await don();
		}
		localeMayChu = "vi";
		soO += 1;
		const chu = JSON.stringify(okrToanCanhMessages("en"), (_k, v) =>
			v instanceof Function ? String(v("1", "2", "3")) : v,
		);
		const sai = chu.match(/[^"]*Programme[^"]*/g) ?? [];
		s.kiem(
			sai.length === 0,
			`dhk-suc-khoe: en con «Programme»: ${sai.join(" | ")}`,
		);
		s.xong("dhk-suc-khoe", soO);
	});
});

// ---------- dhk-dang-tai (E10) ----------

describe("dhk-dang-tai", () => {
	test("dhk-dang-tai: đang tải giữ tiêu đề + khung xương hàng nút; lỗi quyền thì nút khoá kèm câu tải lại", async () => {
		const s = soSai();
		const m = okrMessages("vi");
		await dauTrang("cua-toi", { treoQuyen: true });
		s.kiem(
			Boolean(q("h1")) && Boolean(q("[data-slot=page-shell-description]")),
			"dhk-dang-tai: dang tai mat tieu de hoac mo ta",
		);
		s.kiem(
			Boolean(q("[data-hang-cho]", hang() ?? document)),
			"dhk-dang-tai: dang tai thieu khung xuong hang nut",
		);
		s.kiem(
			nutThem() === null,
			"dhk-dang-tai: dang tai da hien nut them-muc-tieu",
		);
		await don();

		await dauTrang("cua-toi", { loiQuyen: true });
		await nhip(10);
		const nut = nutThem() as HTMLButtonElement | null;
		if (!nut)
			s.kiem(false, "dhk-dang-tai: nut them-muc-tieu vang khi quyen loi");
		else {
			const ghi = q(`#${ID_KHONG_THEM}`);
			s.kiem(
				nut.disabled &&
					nut.getAttribute("aria-describedby") === ID_KHONG_THEM &&
					ghi?.textContent === m.khoaTao.loiQuyen,
				`dhk-dang-tai: quyen loi ma nut khong khoa kem «${m.khoaTao.loiQuyen}»`,
			);
		}
		s.xong("dhk-dang-tai", 5);
	});
});
