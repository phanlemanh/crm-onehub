import { afterEach, beforeEach, describe, mock, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { cho, dat, datLai, dinhVi, nhip } from "./khung-soan-okr";

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
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");
const { khungUngDungMessages } = await import("@/lib/messages/khung-ung-dung");
const { TRO_LY_OKR_TRAN } = await import("@crm/validation/okr-tro-ly");

const TRANG = {
	"cua-toi": await import("@/app/(app)/[slug]/okr/page"),
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
	"theo-don-vi": "/ws/okr/theo-don-vi",
	"toan-canh": "/ws/okr/toan-canh",
	"hoi-y": "/ws/okr/hoi-y",
} satisfies Record<TabOkr, string>;
const DUONG_SUC_KHOE = "/ws/okr/toan-canh/suc-khoe";

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

describe("dhk-don-dich", () => {
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
});

describe("dhk-tieu-de", () => {
	test("dhk-tieu-de: h1 = nhãn thanh bên ở 5 trang × 2 ngôn ngữ × 2 pha; mô tả khác nhau; tiêu đề trình duyệt", async () => {
		const s = soSai();
		let soO = 0;
		const TRANG_DO: (TabOkr | "suc-khoe")[] = [
			"cua-toi",
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
				new Set(moTa.values()).size === 4,
				`dhk-tieu-de: ${locale} chi co ${new Set(moTa.values()).size}/4 cau mo ta khac nhau`,
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

describe("dhk-suc-khoe", () => {
	test("dhk-suc-khoe: tiêu đề khu, thẻ Toàn cảnh, đường dẫn A › B khớp, về giữ ky + đơn vị; en một cách viết", async () => {
		const s = soSai();
		const { SucKhoe } = await import(
			"@/app/(app)/[slug]/okr/toan-canh/suc-khoe/suc-khoe"
		);
		let soO = 0;
		for (const locale of ["vi", "en"] as const) {
			soO += 1;
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
			const muc = qa("[data-slot=breadcrumb-item]");
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
