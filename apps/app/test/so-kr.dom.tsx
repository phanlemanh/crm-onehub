import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { KrOutput } from "../../api/src/okr/okr.contracts";
import type { BanGhiChiSoOutput } from "../../api/src/okr/okr-so.contracts";

const HUNG = { id: "hung", name: "Trần Văn Hùng", email: "hung@onehub.vn" };

function kr(id: string, doi: Partial<KrOutput>): KrOutput {
	return {
		id,
		objectiveId: "mt-1",
		title: `KR ${id}`,
		kind: "tang-toi",
		owner: HUNG,
		startValue: 0,
		targetValue: 40,
		currentValue: 12,
		unit: "thoả thuận",
		dueOn: null,
		weight: 1,
		source: "tay",
		doCanh: false,
		soMay: null,
		nguonMay: null,
		startLocked: true,
		progress: 30,
		laCuaToi: false,
		hienTaiQuaCapNhat: true,
		...doi,
	};
}

function nguonMay(loai: "crm" | "api" | "bang-tinh"): KrOutput["nguonMay"] {
	return {
		loai,
		chiSo: loai === "crm" ? "thoa-thuan-chot-duoc" : null,
		phamVi: loai === "crm" ? { kieu: "phong-ban", id: "pb-1" } : null,
		bac: null,
		sheetId: loai === "bang-tinh" ? "1AbC" : null,
		sheetO: loai === "bang-tinh" ? "Tổng!B2" : null,
		docLuc: null,
		docGiaTri: null,
		docLoi: null,
	};
}

const CAC_KR: KrOutput[] = [
	kr("kr-tay", {}),
	kr("kr-crm", {
		source: "crm",
		currentValue: 15,
		soMay: { giaTri: 15, ngay: "2026-10-25", nguon: "crm" },
		nguonMay: nguonMay("crm"),
	}),
	kr("kr-do-canh", {
		doCanh: true,
		soMay: { giaTri: 15, ngay: "2026-10-25", nguon: "crm" },
		nguonMay: nguonMay("crm"),
	}),
	kr("kr-chua-chup", { source: "crm", nguonMay: nguonMay("crm") }),
];

const KR_CHUA_CO_SO: KrOutput[] = [
	kr("kr-do-canh-api", { doCanh: true, nguonMay: nguonMay("api") }),
	kr("kr-api", { source: "api", nguonMay: nguonMay("api") }),
	kr("kr-do-canh-sheets", { doCanh: true, nguonMay: nguonMay("bang-tinh") }),
];

function banGhi(doi: Partial<BanGhiChiSoOutput>): BanGhiChiSoOutput {
	return {
		tenKr: "Thoả thuận chốt được của Vùng 1",
		loai: "crm",
		dinhNghia: {
			chiSo: "thoa-thuan-chot-duoc",
			phamVi: { kieu: "phong-ban", id: "pb-1" },
		},
		tu: "2026-10-01",
		den: "2026-10-25",
		ngay: "2026-10-25",
		soDaChup: 15,
		soTinhLai: 15,
		lech: false,
		tong: 2,
		dong: [
			{
				loai: "deal",
				id: "d-1",
				ten: "Hợp đồng Minh Long",
				ngay: "2026-10-03",
				moRef: { kind: "deal", id: "d-1" },
			},
			{
				loai: "deal",
				id: "d-2",
				ten: "Hợp đồng An Phát",
				ngay: "2026-10-09",
				moRef: { kind: "deal", id: "d-2" },
			},
		],
		lanGhi: [],
		...doi,
	};
}

type DauVao =
	| {
			readonly keyResultId?: string;
			readonly ngay?: string;
			readonly trang?: number;
	  }
	| undefined;

let vai: "member" | "okr" | "cho" = "member";
let docBanGhi: (vao: DauVao) => BanGhiChiSoOutput = () => banGhi({});
let loiBanGhi = false;
let loiTrang: number | null = null;
let goiBanGhi: DauVao[] = [];

function thuTuc<T>(duong: string, doc: (vao: DauVao) => T | Promise<T>) {
	return {
		queryKey: (vao?: DauVao) => [duong, vao ?? null],
		queryOptions: (vao?: DauVao) => ({
			queryKey: [duong, vao ?? null],
			queryFn: async () => doc(vao),
		}),
	};
}

const khongBaoGio = new Promise<never>(() => {});

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		workspace: {
			get: thuTuc("workspace.get", () =>
				vai === "cho" ? khongBaoGio : { viewerRole: vai },
			),
		},
		org: {
			tree: thuTuc("org.tree", () => ({
				divisions: [
					{
						id: "bp-1",
						name: "Khối kinh doanh",
						position: 0,
						head: null,
						departments: [
							{
								id: "pb-1",
								name: "Kinh doanh vùng 1",
								position: 0,
								divisionId: "bp-1",
								head: null,
								stepCount: 0,
								people: [],
							},
						],
					},
				],
				chuaXep: [],
				chuaCoPhongBan: [],
				people: [],
				archived: { divisions: [], departments: [] },
				coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
			})),
		},
		okr: {
			banGhiChiSo: thuTuc("okr.banGhiChiSo", (vao) => {
				goiBanGhi.push(vao);
				if (loiBanGhi) throw new Error("Máy chủ không trả lời");
				if (loiTrang !== null && vao?.trang === loiTrang)
					throw new Error("Trang sau không tải được");
				return docBanGhi(vao);
			}),
			lichSuSo: thuTuc("okr.lichSuSo", () => ({
				dong: [
					{ ngay: "2026-10-25", giaTri: 15, nguon: "crm", tacGia: null },
					{ ngay: "2026-10-24", giaTri: 14, nguon: "crm", tacGia: null },
					{ ngay: "2026-10-23", giaTri: 12, nguon: "crm", tacGia: null },
				],
			})),
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr",
}));

let dungDeal: (p: { dealId: string }) => ReactElement = () => <div />;
const trong = () => null;

mock.module("@/components/crm/record-sheet/deal-sheet", () => ({
	DealSheet: (p: { dealId: string }) => dungDeal(p),
}));
mock.module("@/components/crm/record-sheet/company-sheet", () => ({
	CompanySheet: trong,
}));
mock.module("@/components/crm/record-sheet/contact-sheet", () => ({
	ContactSheet: trong,
}));
mock.module("@/components/crm/record-sheet/plan-sheet", () => ({
	PlanSheet: trong,
}));
mock.module("@/components/crm/record-sheet/objective-sheet", () => ({
	ObjectiveSheet: trong,
}));
mock.module("@/components/crm/fields/fields-sheet", () => ({
	FieldsSheetHost: trong,
}));
mock.module("@/components/crm/stage-change", () => ({
	CloseReasonDialog: trong,
	DealStageMenu: trong,
}));

const { BangKr } = await import("@/app/(app)/[slug]/okr/bang-kr");
const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { useRecordStack } = await import(
	"@/components/crm/record-sheet/record-stack"
);

function DealGia({ dealId }: { dealId: string }) {
	const { close } = useRecordStack();
	return (
		<div data-deal-gia={dealId}>
			<button type="button" data-nut="quay-lai-gia" onClick={close}>
				back
			</button>
		</div>
	);
}
dungDeal = (p) => <DealGia dealId={p.dealId} />;
const { SoKrSheet } = await import("@/components/crm/record-sheet/so-kr-sheet");
const { DetailSheet } = await import("@/components/detail-sheet");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrSoMessages } = await import("@/lib/messages/okr-so");

const s = okrSoMessages("vi");

type San = { o: HTMLElement; root: Root; url: () => URLSearchParams };
let dangMo: San[] = [];

async function mo(man: ReactElement, duong = ""): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	let hienTai = new URLSearchParams(duong);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(su) => {
					hienTai = new URLSearchParams(su.queryString);
				}}
				searchParams={duong}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root, url: () => hienTai };
	dangMo.push(san);
	return san;
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 600)}`,
	);
}

async function bam(o: Element): Promise<void> {
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		]) {
			const Kieu = loai.startsWith("pointer") ? PointerEvent : MouseEvent;
			o.dispatchEvent(
				new Kieu(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				} as PointerEventInit),
			);
		}
	});
}

const bang = (
	<BangKr
		keyResults={CAC_KR}
		kind="cam-ket"
		expected={30}
		danhDauCuaToi={false}
	/>
);

const ngan = (
	<DetailSheet onOpenChange={() => {}} open>
		<SoKrSheet keyResultId="kr-crm" />
	</DetailSheet>
);

const oSo = (id: string) =>
	document.body.querySelector(`[data-kr-hang="${id}"] [data-nguon]`);

const trangThaiNgan = () =>
	document.body
		.querySelector("[data-so-kr-sheet]")
		?.getAttribute("data-trang-thai");

beforeEach(() => {
	vai = "member";
	docBanGhi = () => banGhi({});
	loiBanGhi = false;
	loiTrang = null;
	goiBanGhi = [];
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("bang-kr-nguon", () => {
	test("bang-kr-nguon: thanh vien thay dau nguon, so may la nut mo ngan so-kr", async () => {
		const san = await mo(bang);
		await cho(
			() => document.body.querySelectorAll("[data-so-kr]").length === 3,
			"ba nut so",
		);
		const hang = CAC_KR.map((k) => ({
			id: k.id,
			nguon: oSo(k.id)?.getAttribute("data-nguon"),
			doCanh: oSo(k.id)?.hasAttribute("data-do-canh"),
			dau: oSo(k.id)?.querySelector("[data-dau-nguon]")?.textContent ?? null,
			nut: oSo(k.id)?.querySelector("button[data-so-kr]") !== null,
			chuaChup: oSo(k.id)?.querySelector("[data-chua-chup]")?.textContent,
		}));
		expect(hang).toEqual([
			{
				id: "kr-tay",
				nguon: "tay",
				doCanh: false,
				dau: null,
				nut: false,
				chuaChup: undefined,
			},
			{
				id: "kr-crm",
				nguon: "crm",
				doCanh: false,
				dau: s.dau.crm,
				nut: true,
				chuaChup: undefined,
			},
			{
				id: "kr-do-canh",
				nguon: "tay",
				doCanh: true,
				dau: s.dau.crm,
				nut: true,
				chuaChup: undefined,
			},
			{
				id: "kr-chua-chup",
				nguon: "crm",
				doCanh: false,
				dau: s.dau.crm,
				nut: true,
				chuaChup: s.trangThai.bangKr.chuaChup,
			},
		]);
		expect(
			oSo("kr-do-canh")?.querySelector("button[data-so-kr]")?.textContent,
		).toBe("12 tay · 15 máy");

		const nut = oSo("kr-crm")?.querySelector("button[data-so-kr]");
		if (!nut) throw new Error("khong thay nut so cua KR crm");
		await bam(nut);
		await cho(() => san.url().get("record") !== null, "url co record");
		expect(san.url().get("record")).toBe("kr:kr-crm");
	});

	test("bang-kr-nguon: vai chi OKR thay so tran, khong nut, khong href", async () => {
		vai = "okr";
		await mo(bang);
		await cho(
			() => document.body.querySelectorAll("[data-so-kr-tran]").length === 3,
			"ba so tran",
		);
		const oMay = ["kr-crm", "kr-do-canh", "kr-chua-chup"].map((id) => ({
			id,
			nut: oSo(id)?.querySelectorAll("button, [role=button], a[href]").length,
			dau: oSo(id)?.querySelector("[data-dau-nguon]") !== null,
		}));
		expect(oMay).toEqual([
			{ id: "kr-crm", nut: 0, dau: true },
			{ id: "kr-do-canh", nut: 0, dau: true },
			{ id: "kr-chua-chup", nut: 0, dau: true },
		]);
		expect(document.body.querySelectorAll("[data-so-kr]").length).toBe(0);
		const hang =
			oSo("kr-crm")?.querySelector("[data-so-kr-tran]")?.parentElement;
		expect({
			chu: hang?.textContent,
			flex: (hang?.className ?? "")
				.split(/\s+/)
				.filter((c) => c === "flex" || c === "inline-flex"),
		}).toEqual({ chu: "15 thoả thuận / 40 thoả thuận", flex: [] });
	});
});

describe("bang-kr-nguon-cau-hinh", () => {
	test("bang-kr-nguon-cau-hinh: KR chua co so may van co dau theo nguon dang cau hinh; nguon API chua ghi khong hen sang mai", async () => {
		await mo(
			<BangKr
				keyResults={KR_CHUA_CO_SO}
				kind="cam-ket"
				expected={30}
				danhDauCuaToi={false}
			/>,
		);
		await cho(
			() => document.body.querySelectorAll("[data-so-kr]").length === 3,
			"ba nut so",
		);
		expect(
			KR_CHUA_CO_SO.map((k) => ({
				id: k.id,
				dau: oSo(k.id)?.querySelector("[data-dau-nguon]")?.textContent ?? null,
				chuThich: oSo(k.id)?.querySelector("[data-chua-chup]")?.textContent,
			})),
		).toEqual([
			{
				id: "kr-do-canh-api",
				dau: s.dau.api,
				chuThich: s.trangThai.bangKr.chuaGhiApi,
			},
			{
				id: "kr-api",
				dau: s.dau.api,
				chuThich: s.trangThai.bangKr.chuaGhiApi,
			},
			{
				id: "kr-do-canh-sheets",
				dau: s.dau.bangTinh,
				chuThich: s.trangThai.bangKr.chuaChup,
			},
		]);
	});
});

describe("bang-kr-nguon-cho-vai", () => {
	test("bang-kr-nguon-cho-vai: chua biet vai thi so khong nut, khong chu thich", async () => {
		vai = "cho";
		await mo(bang);
		await cho(
			() => document.body.querySelectorAll("[data-so-kr-cho]").length === 3,
			"ba so cho vai",
		);
		expect({
			nut: document.body.querySelectorAll("[data-so-kr]").length,
			tran: document.body.querySelectorAll("[data-so-kr-tran]").length,
			nutTrongO: ["kr-crm", "kr-do-canh", "kr-chua-chup"].map(
				(id) => oSo(id)?.querySelectorAll("button, a[href]").length,
			),
			chu: oSo("kr-crm")?.querySelector("[data-so-kr-cho]")?.textContent,
		}).toEqual({ nut: 0, tran: 0, nutTrongO: [0, 0, 0], chu: "15 thoả thuận" });
	});
});

describe("ngan-so-kr", () => {
	test("ngan-so-kr: dau ngan, so da chup, ban ghi va lich su ba ngay", async () => {
		await mo(ngan, "?record=objective:mt-1,so-kr:kr-crm");
		await cho(() => trangThaiNgan() === "ST-so-co", "ngan co du lieu");
		await cho(
			() =>
				document.body
					.querySelector("[data-pham-vi]")
					?.textContent?.includes("Kinh doanh vùng 1") === true,
			"ten phong ban",
		);
		const dinhNghia = document.body.querySelector("[data-dinh-nghia]");
		expect({
			tieuDe: document.body.querySelector('[data-slot="sheet-title"]')
				?.textContent,
			chiSo: dinhNghia?.querySelector('[data-ten-chi-so][translate="no"]')
				?.textContent,
			phamVi: dinhNghia?.querySelector("[data-pham-vi]")?.textContent,
			khoang: dinhNghia?.querySelector("[data-khoang]")?.textContent,
			soDaChup: document.body
				.querySelector("[data-so-da-chup]")
				?.getAttribute("data-so-da-chup"),
			banGhi: [
				...document.body.querySelectorAll('[data-ban-ghi] [translate="no"]'),
			].map((e) => e.textContent),
			lichSu: [...document.body.querySelectorAll("[data-lich-su-ngay]")].map(
				(e) => e.getAttribute("data-lich-su-ngay"),
			),
			chon: document.body
				.querySelector("[data-lich-su-ngay][data-chon]")
				?.getAttribute("data-lich-su-ngay"),
			lech: document.body.querySelector('[data-trang-thai="ST-so-lech"]'),
		}).toEqual({
			tieuDe: "Thoả thuận chốt được của Vùng 1",
			chiSo: s.chiSo["thoa-thuan-chot-duoc"].nhan,
			phamVi: "Phòng ban Kinh doanh vùng 1",
			khoang: s.trangThai.so.khoang("1 thg 10, 2026", "25 thg 10, 2026"),
			soDaChup: "15",
			banGhi: ["Hợp đồng Minh Long", "Hợp đồng An Phát"],
			lichSu: ["2026-10-25", "2026-10-24", "2026-10-23"],
			chon: "2026-10-25",
			lech: null,
		});
	});

	test("ngan-so-kr: lech hien cau co hai so; doi chung khong lech thi khong co cau", async () => {
		docBanGhi = () => banGhi({ soTinhLai: 14, lech: true });
		await mo(ngan);
		await cho(() => trangThaiNgan() === "ST-so-co", "ngan co du lieu");
		const lech = document.body.querySelector('[data-trang-thai="ST-so-lech"]');
		expect(lech?.textContent).toBe(s.trangThai.so.lech("15", "14"));
		expect(lech?.getAttribute("data-so-tinh-lai")).toBe("14");
	});

	test("ngan-so-kr: chon ngay dat ngaySo va hoi lai ban ghi dung ngay", async () => {
		docBanGhi = (vao) =>
			vao?.ngay === "2026-10-23"
				? banGhi({ ngay: "2026-10-23", soDaChup: 12, tong: 1 })
				: banGhi({});
		const san = await mo(ngan);
		await cho(() => trangThaiNgan() === "ST-so-co", "ngan co du lieu");
		const nut = document.body.querySelector('[data-chon-ngay="2026-10-23"]');
		if (!nut) throw new Error("khong thay ngay cu nhat");
		await bam(nut);
		await cho(
			() =>
				document.body
					.querySelector("[data-so-da-chup]")
					?.getAttribute("data-so-da-chup") === "12",
			"so da chup cua ngay cu",
		);
		expect(san.url().get("ngaySo")).toBe("2026-10-23");
		const danhDau = [
			...document.body.querySelectorAll("[data-lich-su-ngay]"),
		].map((e) => [
			e.getAttribute("data-lich-su-ngay"),
			e.getAttribute("data-state"),
			e.getAttribute("aria-current"),
			e.hasAttribute("data-chon"),
		]);
		expect(danhDau).toEqual([
			["2026-10-25", null, null, false],
			["2026-10-24", null, null, false],
			["2026-10-23", "selected", "date", true],
		]);
		expect(goiBanGhi.at(-1)).toEqual({
			keyResultId: "kr-crm",
			ngay: "2026-10-23",
			trang: 1,
		});
	});

	test("ngan-so-kr: rong theo chi so", async () => {
		docBanGhi = () => banGhi({ tong: 0, dong: [], soDaChup: 0, soTinhLai: 0 });
		await mo(ngan);
		await cho(() => trangThaiNgan() === "ST-so-co", "ngan co du lieu");
		const rong = document.body.querySelector('[data-trang-thai="ST-so-rong"]');
		expect(rong?.textContent).toContain(s.chiSo["thoa-thuan-chot-duoc"].rong);
		const khoi = rong?.querySelector('[data-slot="empty"]');
		expect({
			size: khoi?.getAttribute("data-size"),
			gian: khoi?.className.split(/\s+/).includes("flex-1"),
			lichSu: document.body.querySelectorAll("[data-lich-su-ngay]").length,
		}).toEqual({ size: "compact", gian: false, lichSu: 3 });
	});

	test("ngan-so-kr: loi hien Thu lai, bam thi tai lai va co du lieu", async () => {
		loiBanGhi = true;
		await mo(ngan);
		await cho(() => trangThaiNgan() === "ST-so-loi", "ngan loi");
		const thuLai = document.body.querySelector('[data-nut="thu-lai"]');
		expect(thuLai?.textContent).toBe(s.thuLai);
		loiBanGhi = false;
		if (!thuLai) throw new Error("khong co nut thu lai");
		await bam(thuLai);
		await cho(() => trangThaiNgan() === "ST-so-co", "co du lieu sau thu lai");
		expect(document.body.querySelectorAll("[data-ban-ghi]").length).toBe(2);
	});

	test("ngan-so-kr: nguon api chi co bang cac lan ghi", async () => {
		docBanGhi = () =>
			banGhi({
				loai: "api",
				dinhNghia: null,
				tu: null,
				den: null,
				soTinhLai: null,
				tong: 2,
				dong: [],
				lanGhi: [
					{ ngay: "2026-10-25", giaTri: 15, nguoi: "Trần Văn Hùng" },
					{ ngay: "2026-10-25", giaTri: 15, nguoi: "Trần Văn Hùng" },
				],
			});
		await mo(ngan);
		await cho(() => trangThaiNgan() === "ST-so-api", "ngan api");
		expect({
			lanGhi: document.body.querySelectorAll("[data-lan-ghi]").length,
			banGhi: document.body.querySelectorAll("[data-ban-ghi]").length,
			lichSu: document.body.querySelectorAll("[data-lich-su-ngay]").length,
		}).toEqual({ lanGhi: 2, banGhi: 0, lichSu: 0 });
	});

	test("ngan-so-kr: bam ten ban ghi day moRef len chong ngan", async () => {
		const san = await mo(ngan, "?record=objective:mt-1,so-kr:kr-crm");
		await cho(() => trangThaiNgan() === "ST-so-co", "ngan co du lieu");
		const nut = document.body.querySelector('[data-mo-ban-ghi="deal:d-2"]');
		if (!nut) throw new Error("khong thay nut ban ghi d-2");
		await bam(nut);
		await cho(
			() => san.url().get("record")?.endsWith("deal:d-2") === true,
			"url co deal",
		);
		expect(san.url().get("record")).toBe(
			"objective:mt-1,so-kr:kr-crm,deal:d-2",
		);
	});

	test("ngan-so-kr: Xem them goi trang 2 va noi dong", async () => {
		docBanGhi = (vao) =>
			vao?.trang === 2
				? banGhi({
						tong: 3,
						dong: [
							{
								loai: "deal",
								id: "d-3",
								ten: "Hợp đồng Hải Nam",
								ngay: "2026-10-12",
								moRef: { kind: "deal", id: "d-3" },
							},
						],
					})
				: banGhi({ tong: 3 });
		await mo(ngan);
		await cho(() => trangThaiNgan() === "ST-so-co", "ngan co du lieu");
		const xemThem = document.body.querySelector('[data-nut="xem-them"]');
		if (!xemThem) throw new Error("khong co nut xem them");
		await bam(xemThem);
		await cho(
			() => document.body.querySelectorAll("[data-ban-ghi]").length === 3,
			"ba dong sau xem them",
		);
		expect(goiBanGhi.map((v) => v?.trang)).toContain(2);
		expect(
			[...document.body.querySelectorAll("[data-ban-ghi]")].map((e) =>
				e.getAttribute("data-ban-ghi"),
			),
		).toEqual(["d-1", "d-2", "d-3"]);
		expect(document.body.querySelector('[data-nut="xem-them"]')).toBeNull();
	});

	test("ngan-so-kr: trang 2 loi hien Thu lai canh danh sach, bam thi goi lai trang 2", async () => {
		docBanGhi = (vao) =>
			vao?.trang === 2
				? banGhi({
						tong: 3,
						dong: [
							{
								loai: "deal",
								id: "d-3",
								ten: "Hợp đồng Hải Nam",
								ngay: "2026-10-12",
								moRef: { kind: "deal", id: "d-3" },
							},
						],
					})
				: banGhi({ tong: 3 });
		loiTrang = 2;
		await mo(ngan);
		await cho(() => trangThaiNgan() === "ST-so-co", "ngan co du lieu");
		const xemThem = document.body.querySelector('[data-nut="xem-them"]');
		if (!xemThem) throw new Error("khong co nut xem them");
		await bam(xemThem);
		await cho(
			() => document.body.querySelector('[data-nut="thu-lai-trang"]') !== null,
			"nut thu lai trang",
		);
		expect({
			trangThai: trangThaiNgan(),
			dong: document.body.querySelectorAll("[data-ban-ghi]").length,
			chu: document.body.querySelector('[data-nut="thu-lai-trang"]')
				?.textContent,
		}).toEqual({ trangThai: "ST-so-co", dong: 2, chu: s.thuLai });
		loiTrang = null;
		const truoc = goiBanGhi.filter((v) => v?.trang === 2).length;
		const thuLai = document.body.querySelector('[data-nut="thu-lai-trang"]');
		if (!thuLai) throw new Error("mat nut thu lai trang");
		await bam(thuLai);
		await cho(
			() => document.body.querySelectorAll("[data-ban-ghi]").length === 3,
			"ba dong sau thu lai",
		);
		expect(goiBanGhi.filter((v) => v?.trang === 2).length).toBe(truoc + 1);
		expect(
			document.body.querySelector('[data-nut="thu-lai-trang"]'),
		).toBeNull();
	});
});

describe("ngay-so-qua-chong-ngan", () => {
	test("ngay-so-qua-chong-ngan: chon ngay, mo ban ghi, Quay lai thi con ngaySo va ngan hoi dung ngay", async () => {
		docBanGhi = (vao) =>
			vao?.ngay === "2026-10-23"
				? banGhi({ ngay: "2026-10-23", soDaChup: 12, tong: 2 })
				: banGhi({});
		const san = await mo(
			<RecordSheetHost />,
			"?record=objective:mt-1,so-kr:kr-crm",
		);
		await cho(() => trangThaiNgan() === "ST-so-co", "ngan co du lieu");
		const ngay = document.body.querySelector('[data-chon-ngay="2026-10-23"]');
		if (!ngay) throw new Error("khong thay ngay cu nhat");
		await bam(ngay);
		await cho(() => san.url().get("ngaySo") === "2026-10-23", "url co ngaySo");
		await cho(
			() =>
				document.body
					.querySelector("[data-so-da-chup]")
					?.getAttribute("data-so-da-chup") === "12",
			"so cua ngay cu",
		);
		const moDeal = document.body.querySelector('[data-mo-ban-ghi="deal:d-1"]');
		if (!moDeal) throw new Error("khong thay nut ban ghi d-1");
		await bam(moDeal);
		await cho(
			() =>
				document.body.querySelector('[data-deal-gia="d-1"]') !== null &&
				san.url().get("record")?.endsWith("deal:d-1") === true,
			"sheet thoa thuan",
		);
		expect({
			record: san.url().get("record"),
			ngaySo: san.url().get("ngaySo"),
		}).toEqual({
			record: "objective:mt-1,so-kr:kr-crm,deal:d-1",
			ngaySo: "2026-10-23",
		});
		const moc = goiBanGhi.length;
		const quayLai = document.body.querySelector('[data-nut="quay-lai-gia"]');
		if (!quayLai) throw new Error("khong co nut quay lai");
		await bam(quayLai);
		await cho(() => trangThaiNgan() === "ST-so-co", "ngan so hien lai");
		await cho(() => goiBanGhi.length > moc, "ngan hoi lai ban ghi");
		await cho(
			() => san.url().get("record") === "objective:mt-1,so-kr:kr-crm",
			"url bo deal",
		);
		expect({
			record: san.url().get("record"),
			ngaySo: san.url().get("ngaySo"),
			hoi: goiBanGhi.slice(moc),
			soDaChup: document.body
				.querySelector("[data-so-da-chup]")
				?.getAttribute("data-so-da-chup"),
		}).toEqual({
			record: "objective:mt-1,so-kr:kr-crm",
			ngaySo: "2026-10-23",
			hoi: [{ keyResultId: "kr-crm", ngay: "2026-10-23", trang: 1 }],
			soDaChup: "12",
		});
	});

	test("ngay-so-qua-chong-ngan: dong ngan so thi xoa ngaySo", async () => {
		const san = await mo(
			<RecordSheetHost />,
			"?record=objective:mt-1,so-kr:kr-crm&ngaySo=2026-10-23",
		);
		await cho(() => trangThaiNgan() === "ST-so-co", "ngan co du lieu");
		const quayLai = [...document.body.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === "Quay lại",
		);
		if (!quayLai) throw new Error("khong co nut Quay lai cua ngan so");
		await bam(quayLai);
		await cho(
			() => san.url().get("record") === "objective:mt-1",
			"ve muc tieu",
		);
		expect(san.url().get("ngaySo")).toBeNull();
	});
});
