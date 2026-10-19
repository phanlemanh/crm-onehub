import { afterEach, describe, expect, mock, test } from "bun:test";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () =>
		new Proxy({}, { get: () => new Proxy({}, { get: () => () => ({}) }) }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/lo-trinh",
}));

const { NoiDungLoTrinh } = await import("@/components/lo-trinh/noi-dung");
const { BoChonSanPham } = await import(
	"@/components/lo-trinh/bo-chon-san-pham"
);
const { docDauVaoChoVai, ketQuaTuHang } = await import(
	"@/lib/lo-trinh/doc-trang"
);
const { chonSanPham, danhSachChon, docDauVaoSanPham } = await import(
	"@/lib/lo-trinh/san-pham"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { formatNgayGio } = await import("@crm/ui/lib/format");
const { TRANG_THAI_LAY } = await import("@crm/validation/san-pham-lo-trinh");
const { sanPhamMessages } = await import("@/lib/messages/san-pham");
const { loTrinhMessages } = await import("@/lib/messages/lo-trinh");
const { banMot, hangCua, khoiKit, khongMoHinh, LAY_LUC, SHA_KIT, SP_KIT } =
	await import("./lo-trinh-san-pham-mau");

type DauVao = Awaited<ReturnType<typeof docDauVaoSanPham>>;
type Loc = "vi" | "en";

const HOM_NAY = "2026-10-20";
const TAT_CA_MOC = "vongDoi=tat-ca&xemLoTrinh=moc";
let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

async function cho() {
	for (let i = 0; i < 4; i++)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
}

async function ve(nut: ReactNode, thamSo = "", loc: Loc = "vi") {
	act(() => root?.unmount());
	document.body.innerHTML = "";
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	await act(async () =>
		root?.render(
			<NuqsTestingAdapter hasMemory searchParams={thamSo}>
				<LocaleProvider locale={loc}>
					<TooltipProvider>{nut}</TooltipProvider>
				</LocaleProvider>
			</NuqsTestingAdapter>,
		),
	);
	await cho();
}

const mo = (dv: DauVao, thamSo = TAT_CA_MOC, loc: Loc = "vi") =>
	ve(<NoiDungLoTrinh dauVao={dv} homNayCoDinh={HOM_NAY} />, thamSo, loc);

const sanPham = (
	vai: "owner" | "member",
	html?: string,
	sp = SP_KIT,
): Promise<DauVao> =>
	docDauVaoSanPham(sp, vai, async () => ketQuaTuHang(hangCua(html)));

const crmCung = (vai: "owner" | "member", html?: string): Promise<DauVao> =>
	docDauVaoChoVai(vai, {
		docBanChup: async () => ketQuaTuHang(hangCua(html)),
		docBanDung: async () => ({ kieu: "tep-vang" }),
		banDung: { sha: SHA_KIT, dungLuc: "2026-01-01T00:00:00Z", moiTruong: null },
		ghiCanhBao: () => {},
	});

const khoaMoc = () =>
	[...document.body.querySelectorAll("[data-lo-trinh-moc]")].map((e) =>
		e.getAttribute("data-lo-trinh-moc"),
	);
const khoaViec = () =>
	[...document.body.querySelectorAll("[data-viec-khoa]")].map((e) =>
		e.getAttribute("data-viec-khoa"),
	);

const coTheSoLieu = () =>
	[...document.body.querySelectorAll("[role=tab]")].some((e) =>
		(e.textContent ?? "").includes(loTrinhMessages("vi").hoSo.theSoLieu),
	);

function viecCoChuKho(): string {
	const o = khoiKit().json;
	for (const lo of o.lo_trinh)
		for (const h of lo.hang) if (h.tom_tat?.chu_kho) return `${lo.tep}#${h.ma}`;
	throw new Error("mau kit khong co viec mang so lieu chu kho");
}

describe("ltsp-doc-du", () => {
	test("ltsp-doc-du: sản phẩm hiện đủ như cùng khối khi là của CRM", async () => {
		const tepCoViec = khoiKit()
			.json.lo_trinh.filter((l) => l.hang.length > 0)
			.map((l) => l.tep)
			.sort();
		await mo(await crmCung("owner"));
		const mocCrm = khoaMoc();
		const viecCrm = khoaViec();
		await mo(await sanPham("owner"));
		const mocSp = khoaMoc();
		const viecSp = khoaViec();
		console.log(`ltsp-doc-du: ${mocSp.length} moc / ${viecSp.length} viec`);
		expect(mocSp.length).toBeGreaterThan(0);
		expect(viecSp.length).toBeGreaterThan(0);
		expect(mocSp).toEqual(mocCrm);
		expect(viecSp).toEqual(viecCrm);
		const tepTrenMan = [
			...new Set(viecSp.map((k) => (k ?? "").split("#")[0])),
		].sort();
		if (JSON.stringify(tepTrenMan) !== JSON.stringify(tepCoViec))
			throw new Error(
				`trang san pham thieu lo trinh: ${tepCoViec.find((t) => !tepTrenMan.includes(t))}`,
			);
		const dong = document.body.querySelector("[data-lo-trinh-gio-lay]");
		expect(dong?.textContent).toContain(SP_KIT.kho);
		expect(dong?.textContent).toContain(SP_KIT.nhanh);
	});

	test("ltsp-doc-du: ngăn hồ sơ của sản phẩm mở như của CRM", async () => {
		const khoa = viecCoChuKho();
		await mo(
			await sanPham("owner"),
			`vongDoi=tat-ca&q=${encodeURIComponent(khoa.split("#")[1] ?? "")}&viec=${encodeURIComponent(khoa)}`,
		);
		const ngan = document.body.querySelector("[role=dialog][data-state=open]");
		expect(ngan).not.toBeNull();
		expect(
			(
				ngan?.querySelector("[data-slot=sheet-title], h2")?.textContent ?? ""
			).trim(),
		).not.toBe("");
		expect(coTheSoLieu()).toBe(true);
	});
});

describe("ltsp-quyen-trang", () => {
	test("ltsp-quyen-trang: người không được cấp không thấy tên sản phẩm", async () => {
		const dangMo = chonSanPham([], SP_KIT.ma);
		expect(dangMo).toBe("crm");
		await ve(
			<>
				<BoChonSanPham ds={danhSachChon([])} dangMo={dangMo} />
				<NoiDungLoTrinh
					dauVao={await crmCung("member")}
					homNayCoDinh={HOM_NAY}
				/>
			</>,
			TAT_CA_MOC,
		);
		expect(document.body.querySelector("[data-lo-trinh-bo-chon]")).toBeNull();
		expect(document.body.textContent ?? "").not.toContain(SP_KIT.ten);
	});

	test("ltsp-quyen-trang: người được cấp thấy ô chọn mang sản phẩm", async () => {
		await ve(<BoChonSanPham ds={danhSachChon([SP_KIT])} dangMo={SP_KIT.ma} />);
		const nut = document.body.querySelector("[data-lo-trinh-bo-chon]");
		expect(nut?.textContent).toContain(SP_KIT.ten);
	});

	test("ltsp-quyen-trang: thành viên được cấp không thấy số liệu chủ kho", async () => {
		const khoa = viecCoChuKho();
		const tham = `vongDoi=tat-ca&q=${encodeURIComponent(khoa.split("#")[1] ?? "")}&viec=${encodeURIComponent(khoa)}`;
		await mo(await sanPham("owner"), tham);
		expect(coTheSoLieu()).toBe(true);
		await mo(await sanPham("member"), tham);
		if (coTheSoLieu()) throw new Error("thanh vien thay so lieu chu kho: P");
	});
});

describe("ltsp-cau-trang-thai", () => {
	test("ltsp-cau-trang-thai: mỗi trạng thái có câu riêng khi chưa có bản chụp", async () => {
		for (const loc of ["vi", "en"] as const) {
			const tt = sanPhamMessages(loc).trangThai;
			for (const t of TRANG_THAI_LAY) {
				const dv = await docDauVaoSanPham(
					{ ...SP_KIT, trangThaiLay: t },
					"member",
					async () => ({ kieu: "khong" }),
				);
				await mo(dv, "", loc);
				const khung = document.body.querySelector(
					"[data-lo-trinh-san-pham-trong]",
				);
				expect(`${loc}:${t}:${khung?.textContent ?? ""}`).toContain(tt[t]);
			}
		}
	});

	test("ltsp-cau-trang-thai: có bản chụp mà lần lấy gần nhất hỏng thì báo kèm giờ lấy", async () => {
		const mui = Intl.DateTimeFormat().resolvedOptions().timeZone;
		for (const loc of ["vi", "en"] as const) {
			const tt = sanPhamMessages(loc).trangThai;
			const gio = formatNgayGio(LAY_LUC, loc, {
				timeZone: mui,
				phan: "ngay-gio",
			});
			for (const t of TRANG_THAI_LAY) {
				await mo(
					await sanPham("member", undefined, { ...SP_KIT, trangThaiLay: t }),
					TAT_CA_MOC,
					loc,
				);
				expect(
					document.body.querySelector("[data-lo-trinh-moc]"),
				).not.toBeNull();
				expect(
					document.body.querySelector("[data-lo-trinh-gio-lay]")?.textContent,
				).toContain(gio);
				const bao = document.body.querySelector("[data-lo-trinh-lay-hong]");
				if (t === "da-lay" || t === "chua-lay")
					expect(`${t}:${bao}`).toBe(`${t}:null`);
				else
					expect(`${t}:${bao?.textContent ?? ""}`).toContain(
						tt[t].toLocaleLowerCase(loc),
					);
			}
		}
	});
});

describe("ltsp-khuon", () => {
	test("ltsp-khuon: khối cũ và khối mới hơn báo đúng bản, hiện như CRM", async () => {
		const k = khoiKit();
		const ca: [string, string, number, string][] = [
			["k1", k.ghep(JSON.stringify(banMot(k.json))), 1, "luật cũ"],
			[
				"k2",
				k.ghep(JSON.stringify(khongMoHinh(k.json))),
				k.json.phien_ban,
				"luật cũ",
			],
			[
				"k3",
				k.ghep(JSON.stringify({ ...k.json, phien_ban: k.json.phien_ban + 1 })),
				k.json.phien_ban + 1,
				"mới hơn trang",
			],
		];
		for (const [ten, html, phien, chu] of ca) {
			await mo(await crmCung("owner", html));
			const mocCrm = khoaMoc();
			await mo(await sanPham("owner", html));
			const dong = document.body.querySelector("[data-lo-trinh-khuon]");
			if (dong === null)
				throw new Error(`khoi cu khong bao phien ban: ${ten.toUpperCase()}`);
			expect(dong.getAttribute("data-lo-trinh-khuon")).toBe(String(phien));
			expect(dong.textContent).toContain(SP_KIT.ten);
			expect(`${ten}:${dong.textContent}`).toContain(chu);
			expect(khoaMoc()).toEqual(mocCrm);
		}
		await mo(await sanPham("owner"));
		expect(document.body.querySelector("[data-lo-trinh-khuon]")).toBeNull();
	});
});
