import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";

type HangTatCa = {
	id: string;
	so: number;
	ma: string;
	tieuDe: string;
	muonLam: string;
	man: string;
	guiLuc: string;
	daKeoVe: boolean;
	nguoiGui: { id: string; ten: string } | null;
	phongBan: { id: string; ten: string } | null;
};

let hangTatCa: HangTatCa[] = [];
let tatCaLoi = false;
let tatCaCho = false;
let soLanTai = 0;

function truyVan<T>(ten: string, ra: () => T) {
	return {
		queryKey: () => [ten],
		pathKey: () => [ten],
		queryOptions: () => ({ queryKey: [ten], queryFn: async () => ra() }),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		tinHieu: {
			tatCa: truyVan("tinHieu.tatCa", async () => {
				soLanTai += 1;
				if (tatCaCho) await new Promise(() => {});
				if (tatCaLoi) throw new Error("hong");
				return { rows: hangTatCa };
			}),
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, refresh: () => {} }),
	useParams: () => ({ slug: "acme" }),
	usePathname: () => "/acme/tin-hieu/tat-ca",
	useSearchParams: () => new URLSearchParams(),
}));

mock.module("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TIN_HIEU } = await import("@crm/validation/tin-hieu");
const { laQuanTriWorkspace } = await import("@crm/validation/vai-workspace");
const { toneTheoNghia } = await import("@crm/ui/lib/status-tone");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");
const { ThanhTheTinHieu } = await import(
	"@/components/tin-hieu/thanh-the-tin-hieu"
);
const { BangTatCa } = await import("@/components/tin-hieu/bang-tat-ca");
const { BaSoTinHieu } = await import("@/components/tin-hieu/ba-so-tin-hieu");
const { HopGuiTinHieu, NutGuiDauTrang } = await import(
	"@/components/tin-hieu/hop-gui-tin-hieu"
);
const { TatCaTrang } = await import(
	"@/app/(app)/[slug]/tin-hieu/tat-ca/tat-ca-trang"
);
const { KhungChoTatCa } = await import(
	"@/app/(app)/[slug]/tin-hieu/tat-ca/khung-cho"
);
const { tinHieuMessages } = await import("@/lib/messages/tin-hieu");
const { ghepTatCa } = await import("@/lib/tin-hieu/tat-ca");
const { dongTuHang, demTheoLoc, giaTriLoc, KHONG_CON, KHONG_PHONG } =
	await import("@/lib/tin-hieu/loc-tat-ca");

const m = tinHieuMessages("vi");
const ui = uiMessages("vi");
let root: Root | null = null;
let duongHienTai = new URLSearchParams();

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	hangTatCa = [];
	tatCaLoi = false;
	tatCaCho = false;
	soLanTai = 0;
});

async function ve(nut: ReactNode, duong = "") {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	duongHienTai = new URLSearchParams(duong);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root?.render(
			<NuqsTestingAdapter
				hasMemory
				onUrlUpdate={(e) => {
					duongHienTai = new URLSearchParams(e.searchParams);
				}}
				searchParams={duong}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">{nut}</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await act(async () => {
		await new Promise((r) => setTimeout(r, 30));
	});
	return o;
}

async function bam(o: Element) {
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		])
			o.dispatchEvent(
				new MouseEvent(loai, { bubbles: true, cancelable: true, button: 0 }),
			);
	});
	await act(async () => {
		await new Promise((r) => setTimeout(r, 30));
	});
}

const PB = {
	kd: { id: "pb-kd", ten: "Kinh doanh" },
	ns: { id: "pb-ns", ten: "Nhân sự" },
};
const NG = {
	lan: { id: "u-lan", ten: "Nguyễn Thị Lan" },
	minh: { id: "u-minh", ten: "Trần Văn Minh" },
	ha: { id: "u-ha", ten: "Lê Thu Hà" },
};

function hang(
	so: number,
	nguoiGui: HangTatCa["nguoiGui"],
	phongBan: HangTatCa["phongBan"],
	daKeoVe: boolean,
	guiLuc = "2026-10-16T02:14:00.000Z",
): HangTatCa {
	return {
		id: `t-${so}`,
		so,
		ma: `crm-${so}`,
		tieuDe: `dieu gap ${so}`,
		muonLam: `muon ${so}`,
		man: `/man/${so}`,
		guiLuc,
		daKeoVe,
		nguoiGui,
		phongBan,
	};
}

const CHIN = [
	hang(1, NG.lan, PB.kd, false),
	hang(2, NG.lan, PB.kd, true),
	hang(3, NG.minh, PB.kd, true),
	hang(4, NG.minh, PB.ns, false),
	hang(5, NG.ha, PB.ns, true),
	hang(6, NG.ha, PB.ns, true),
	hang(7, NG.ha, null, false),
	hang(8, null, null, true),
	hang(9, null, PB.kd, false),
];

function dongCua(rows: HangTatCa[], html: string | null = null) {
	const kq = ghepTatCa({ rows, html, now: new Date("2026-10-20"), m });
	return {
		dong: dongTuHang(rows, kq.trangThai, m),
		baSo: kq.baSo,
		kq,
	};
}

const maHien = (o: Element) =>
	[...o.querySelectorAll("[data-tin-hieu-tat-ca]")].map((x) =>
		x.getAttribute("data-tin-hieu-tat-ca"),
	);

describe("the-con", () => {
	const VAI = ["owner", "admin", "member", "okr"] as const;
	for (const vai of VAI)
		for (const the of ["cua-toi", "tat-ca"] as const)
			test(`the-con: vai ${vai} o the ${the}`, async () => {
				const o = await ve(
					<ThanhTheTinHieu
						hrefCuaToi="/acme/tin-hieu"
						hrefTatCa="/acme/tin-hieu/tat-ca"
						laQuanTri={laQuanTriWorkspace(vai)}
						the={the}
					/>,
				);
				const ds = o.querySelector("[role=tablist]");
				if (vai === "member" || vai === "okr") {
					expect(ds, "thanh the hien voi nguoi khong phai quan tri").toBeNull();
					return;
				}
				expect(ds).not.toBeNull();
				expect(ds?.getAttribute("data-variant")).toBe("line");
				const lk = [
					...o.querySelectorAll<HTMLAnchorElement>("[role=tablist] a"),
				];
				expect(lk.map((a) => a.textContent)).toEqual([
					m.the.cuaToi,
					m.the.tatCa,
				]);
				expect(lk.map((a) => a.getAttribute("href"))).toEqual([
					"/acme/tin-hieu",
					"/acme/tin-hieu/tat-ca",
				]);
				const hienTai = lk.filter(
					(a) => a.getAttribute("aria-current") === "page",
				);
				expect(hienTai.length, "hai the cung la trang hien tai").toBe(1);
				expect(hienTai[0]?.getAttribute("data-the-tin-hieu")).toBe(the);
			});
});

describe("dong", () => {
	test("dong: du cot, gio Viet Nam, trang thai, du lieu nguoi nhap khong dich", async () => {
		const rows = [
			hang(1, NG.lan, PB.kd, false),
			hang(2, NG.minh, PB.ns, true),
			hang(3, NG.ha, PB.kd, false),
		];
		const { dong } = dongCua(rows);
		const o = await ve(<BangTatCa banVeDocDuoc dong={dong} />);
		expect(maHien(o)).toEqual(["crm-1", "crm-2", "crm-3"]);
		for (const d of dong) {
			const tr = o
				.querySelector(`[data-tin-hieu-tat-ca='${d.ma}']`)
				?.closest("tr");
			const chu = tr?.textContent ?? "";
			expect(chu).toContain(d.tieuDe);
			expect(chu).toContain(`Muốn: ${d.muonLam}`);
			expect(chu).toContain(d.nguoiGui?.ten ?? "");
			expect(chu).toContain(d.phongBan?.ten ?? "");
			expect(chu).toContain(d.man);
			expect(chu).toContain("09:14");
			const chi = tr?.querySelector("[data-slot=status-indicator]");
			expect(chi?.getAttribute("data-tone")).toBe(
				toneTheoNghia(d.trangThai.nghia),
			);
			expect(chi?.textContent).toBe(d.trangThai.nhan);
			expect(tr?.querySelector("[data-cau-trang-thai]")?.textContent).toBe(
				d.trangThai.cau,
			);
			const khongDich = [...(tr?.querySelectorAll("[translate=no]") ?? [])].map(
				(x) => x.textContent,
			);
			for (const x of [d.tieuDe, d.nguoiGui?.ten, d.phongBan?.ten, d.man])
				expect(
					khongDich.some((k) => k?.includes(x ?? "\u0000")),
					"du lieu nguoi nhap bi trinh duyet dich",
				).toBe(true);
		}
	});
});

const MAU_BAN_VE = await Bun.file(
	new URL("./fixtures/tin-hieu/LO-TRINH.mau.html", import.meta.url),
).text();

describe("thieu", () => {
	const MAU = MAU_BAN_VE;
	const CA = {
		co: MAU,
		vang: null,
		"khong-khoi": "<html><body>khong khoi</body></html>",
		"khoi-hong": MAU.replace(
			/(<script type="application\/json" id="lo-trinh-du-lieu">)[\s\S]*?(<\/script>)/,
			"$1{hong$2",
		),
		"ban-ghi-sai": MAU.replace(
			'"cho":"chua-gom"',
			'"cho":"khong-co-gia-tri-nay"',
		),
	} as const;
	for (const [ten, html] of Object.entries(CA))
		test(`thieu: ban ve ${ten}`, async () => {
			const rows = [hang(1, null, PB.kd, false), hang(2, NG.lan, null, true)];
			const { dong, kq } = dongCua(rows, html);
			const o = await ve(
				<BangTatCa banVeDocDuoc={kq.banVeDocDuoc} dong={dong} />,
			);
			expect(maHien(o)).toEqual(["crm-1", "crm-2"]);
			const tr1 = o
				.querySelector("[data-tin-hieu-tat-ca='crm-1']")
				?.closest("tr");
			const tr2 = o
				.querySelector("[data-tin-hieu-tat-ca='crm-2']")
				?.closest("tr");
			expect(
				tr1?.querySelector("[data-nguoi-gui]")?.textContent,
				"dong mat nguoi gui khong noi gi",
			).toBe(m.tatCa.khongConTaiKhoan);
			expect(tr2?.textContent).toContain(m.tatCa.chuaCoPhongBan);
			const bao = o.querySelector("[data-ban-ve-chua-doc]");
			if (ten === "co") {
				expect(bao).toBeNull();
				return;
			}
			expect(bao?.textContent).toBe(m.trang.banVeChuaDoc);
			expect(
				tr1?.querySelector("[data-slot=status-indicator]")?.textContent,
			).toBe(m.nhan.choLayVe);
			expect(
				tr2?.querySelector("[data-slot=status-indicator]")?.textContent,
			).toBe(m.nhan.choGom);
		});
});

describe("loc", () => {
	const veLoc = async (duong: string, rows = CHIN) => {
		const { dong } = dongCua(rows);
		const o = await ve(
			<>
				<BaSoTinHieu so={dongCua(rows).baSo} />
				<BangTatCa banVeDocDuoc dong={dong} />
			</>,
			duong,
		);
		return { o, dong };
	};
	const baSoChu = (o: Element) =>
		o.querySelector("[data-ba-so-tin-hieu]")?.textContent;

	test("loc: ma tran a..f va ba o so khong doi theo loc", async () => {
		const goc = await veLoc("");
		expect(maHien(goc.o).length, "a khong loc").toBe(9);
		const soGoc = baSoChu(goc.o);
		act(() => root?.unmount());
		document.body.innerHTML = "";

		const KY = [
			["phongBan=pb-kd", ["crm-1", "crm-2", "crm-3", "crm-9"]],
			[
				"phongBan=pb-kd&phongBan=pb-ns",
				["crm-1", "crm-2", "crm-3", "crm-4", "crm-5", "crm-6", "crm-9"],
			],
			["phongBan=pb-kd&trangThaiTinHieu=cho-lay-ve", ["crm-1", "crm-9"]],
			[`nguoiGui=${KHONG_CON}`, ["crm-8", "crm-9"]],
			[`phongBan=${KHONG_PHONG}`, ["crm-7", "crm-8"]],
		] as const;
		for (const [duong, ky] of KY) {
			const { o } = await veLoc(duong);
			expect(maHien(o).sort(), `loc ${duong}`).toEqual([...ky].sort());
			expect(baSoChu(o), "ba o so doi theo loc").toBe(soGoc);
			act(() => root?.unmount());
			document.body.innerHTML = "";
		}
	});

	test("loc: trang thai cat dong", async () => {
		const { o } = await veLoc("trangThaiTinHieu=cho-gom");
		expect(maHien(o).sort(), "loc trang thai khong cat dong").toEqual(
			["crm-2", "crm-3", "crm-5", "crm-6", "crm-8"].sort(),
		);
	});

	test("loc: ra rong thi bang noi khong khop, bo loc ve du dong", async () => {
		const { o } = await veLoc("phongBan=pb-ns&nguoiGui=u-lan");
		expect(maHien(o)).toEqual([]);
		expect(o.textContent).toContain(ui.table.noMatch);
		const nut = [...o.querySelectorAll("button")].find(
			(b) => b.textContent === ui.table.resetFilters,
		);
		expect(nut).toBeDefined();
		if (nut) await bam(nut);
		expect(maHien(o).length).toBe(9);
	});

	test("loc: doi loc ve trang dau", async () => {
		const nhieu = Array.from({ length: TIN_HIEU.coTrangTatCa + 5 }, (_, i) =>
			hang(i + 1, NG.lan, PB.kd, false),
		);
		const { o } = await veLoc("page=2&phongBan=pb-khong-co", nhieu);
		expect(maHien(o)).toEqual([]);
		const nut = [...o.querySelectorAll("button")].find(
			(b) => b.textContent === ui.table.resetFilters,
		);
		if (nut) await bam(nut);
		expect(duongHienTai.get("page") ?? "1", "doi loc khong ve trang dau").toBe(
			"1",
		);
		expect(maHien(o).length).toBe(TIN_HIEU.coTrangTatCa);
	});

	test("loc: dem tren tung gia tri bang so dong khop", () => {
		const { dong } = dongCua(CHIN);
		const loc = { phongBan: ["pb-kd"], trangThaiTinHieu: [], nguoiGui: [] };
		const dem = demTheoLoc(dong, loc);
		for (const k of ["phongBan", "trangThaiTinHieu", "nguoiGui"] as const) {
			const khop = dong.filter((d) =>
				(Object.keys(loc) as (keyof typeof loc)[]).every(
					(x) =>
						x === k ||
						loc[x].length === 0 ||
						giaTriLoc(d)[x].some((v) => (loc[x] as string[]).includes(v)),
				),
			);
			const ky: Record<string, number> = {};
			for (const d of khop)
				for (const v of giaTriLoc(d)[k]) ky[v] = (ky[v] ?? 0) + 1;
			expect(dem[k], `dem ${k}`).toEqual(ky);
		}
	});
});

describe("ba-so", () => {
	const SO = { trongKy: 7, soPhong: 3, khongPhong: 1, quaHan: 5, chuaCoCho: 2 };
	test("ba-so: ba o, nhan mang so cau hinh, gia tri dung", async () => {
		const o = await ve(<BaSoTinHieu so={SO} />);
		const nhom = o.querySelectorAll("[data-slot=stat-group]");
		expect(nhom.length).toBe(1);
		const the = [...o.querySelectorAll("[data-slot=stat-card]")];
		expect(the.length).toBe(3);
		const chu = the.map((x) => x.textContent ?? "");
		expect(chu[0]).toContain(String(TIN_HIEU.ngayDem));
		expect(chu[0]).toContain(String(SO.trongKy));
		expect(chu[0]).toContain(m.tatCa.gomChuaLayVe);
		expect(chu[1]).toContain(String(SO.soPhong));
		expect(chu[1]).toContain(`: ${SO.khongPhong}`);
		expect(chu[2]).toContain(String(TIN_HIEU.ngayCoCho));
		expect(o.querySelector("[data-o-so=chua-co-cho]")?.textContent).toContain(
			`${SO.chuaCoCho}`,
		);
		expect(chu[2]).toContain(String(SO.quaHan));
	});

	test("ba-so: chua doc duoc ban ve thi o qua han hien gach, khong in so", async () => {
		const o = await ve(<BaSoTinHieu so={{ ...SO, chuaCoCho: null }} />);
		const o3 = o.querySelector("[data-o-so=chua-co-cho]");
		expect(o3?.textContent).toContain("—");
		expect(o3?.textContent).toContain(m.tatCa.chuaDocCho);
		expect(
			/\d{1,}(?!\s*ngày)/.test(
				(o3?.textContent ?? "").replace(/\d+\s*ngày/g, ""),
			),
			"o qua han in so 0 gia khi chua doc duoc ban ve",
		).toBe(false);
	});
});

describe("hop-bao-truoc", () => {
	for (const vai of ["owner", "member", "okr"] as const)
		test(`hop-bao-truoc: vai ${vai} thay cau bao truoc khi soan`, async () => {
			await ve(
				<HopGuiTinHieu
					daXayRa=""
					giaiDoan="soan"
					hrefDaGui="/acme/tin-hieu"
					loi={null}
					ma="crm-1"
					man="/okr"
					muonLam=""
					nut={<NutGuiDauTrang />}
					onDaXayRaChange={() => {}}
					onGui={() => {}}
					onMuonLamChange={() => {}}
					onOpenChange={() => {}}
					open
				/>,
			);
			const moTa = document.querySelector("[data-slot=dialog-description]");
			expect(m.hop.baoTruoc).toBe(
				"Quản trị CRM thấy tên bạn cùng tín hiệu này.",
			);
			expect(
				moTa?.textContent ?? "",
				`hop gui khong bao truoc quan tri thay ten (${vai})`,
			).toContain(m.hop.baoTruoc);
		});
});

describe("trang-thai-man", () => {
	const SO = { ...dongCua([]).baSo, chuaCoCho: 0 };
	test("trang-thai-man: dang tai co khung xuong ba o va cac dong", async () => {
		const o = await ve(<KhungChoTatCa />);
		const k = o.querySelector("[data-tin-hieu-tat-ca-dang-tai]");
		expect(k).not.toBeNull();
		expect(
			k?.querySelectorAll("[data-slot=skeleton]").length,
		).toBeGreaterThanOrEqual(6);
	});

	test("trang-thai-man: the khach dang cho thi hien khung xuong", async () => {
		tatCaCho = true;
		const o = await ve(<TatCaTrang banVeDocDuoc baSo={SO} trangThai={{}} />);
		expect(
			o.querySelector("[data-tin-hieu-tat-ca-dang-tai]"),
			"the Tat ca trang luc dang tai",
		).not.toBeNull();
	});

	test("trang-thai-man: loi thi VungTaiLoi, Thu lai tai lai dung mot lan", async () => {
		tatCaLoi = true;
		const o = await ve(<TatCaTrang banVeDocDuoc baSo={SO} trangThai={{}} />);
		expect(o.textContent).toContain(m.tatCa.taiLoiTieuDe);
		const truoc = soLanTai;
		const nut = [...o.querySelectorAll("button")].find((b) =>
			(b.textContent ?? "").includes("Thử lại"),
		);
		expect(nut).toBeDefined();
		if (nut) await bam(nut);
		expect(soLanTai - truoc).toBe(1);
	});

	test("trang-thai-man: rong thi ba o 0 va cau chua ai gui", async () => {
		hangTatCa = [];
		const o = await ve(<TatCaTrang banVeDocDuoc baSo={SO} trangThai={{}} />);
		expect(o.textContent).toContain(m.tatCa.rongTieuDe);
		const so = [...o.querySelectorAll("[data-slot=stat-card]")].map(
			(x) => x.querySelector(".text-3xl")?.textContent,
		);
		expect(so).toEqual(["0", "0", "0"]);
	});

	test("trang-thai-man: co du lieu thi bang co dong", async () => {
		hangTatCa = [hang(1, NG.lan, PB.kd, false)];
		const o = await ve(<TatCaTrang banVeDocDuoc baSo={SO} trangThai={{}} />);
		expect(maHien(o)).toEqual(["crm-1"]);
	});
});
