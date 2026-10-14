import { afterEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { HAN_BAI_DOM } from "./han-bai-dom";

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

const { HoSoViec } = await import("@/components/lo-trinh/ho-so-viec");
const { NoiDungLoTrinh } = await import("@/components/lo-trinh/noi-dung");
const { phangViec } = await import("@/components/lo-trinh/viec");
const { choVaiXem } = await import("@/lib/lo-trinh/cho-vai");
const { docTrangLoTrinh } = await import("@/lib/lo-trinh/doc-trang");
const { loTrinhMessages } = await import("@/lib/messages/lo-trinh");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { formatDay } = await import("@crm/ui/lib/format");
const { doiKhoi, hangThoCua, khoiThoCua, NHOM_THO } = await import(
	"./lo-trinh-khoi-tho"
);

type DauVao = ReturnType<typeof docTrangLoTrinh>;
type HangTho = import("./lo-trinh-khoi-tho").HangTho;
type DuLieu = Extract<DauVao, { kieu: "co-du-lieu" }>["duLieu"];

const m = loTrinhMessages("vi");
const TRONG = "—";
const HOM_NAY = "2026-10-12";
const KHOI =
	/<script type="application\/json" id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/;
const THU_MUC = path.join(import.meta.dir, "fixtures/lo-trinh");
const HTML_X2 = readFileSync(path.join(THU_MUC, "x2/LO-TRINH.html"), "utf8");
const HTML_B1 = readFileSync(path.join(THU_MUC, "LO-TRINH.mau.html"), "utf8");
const O = [
	"da_giao",
	"vi_sao",
	"ngay",
	"production",
	"do_gi",
	"ket_qua",
	"chua_lam",
	"ai_quyet",
] as const;
const SO = [
	"tieu_chi",
	"phep_do",
	"luot_cham",
	"token",
	"quyet_dinh_may",
	"quyet_dinh_nguoi",
] as const;
const CUNG_NGHIA = new Set(["Chưa mở", "Đã giao", "Đang làm"]);
const NHAN_NHOM = {
	"chua-bat-dau": m.nhom.chuaBatDau,
	"dang-lam": m.nhom.dangLam,
	"da-giao": m.nhom.daGiao,
	khac: m.nhom.khac,
} satisfies Record<(typeof NHOM_THO)[number], string>;

function coDuLieu(dv: DauVao): DuLieu {
	if (dv.kieu !== "co-du-lieu") throw new Error(`tep mau hong: ${dv.kieu}`);
	return dv.duLieu;
}

const THO = hangThoCua(HTML_X2);
const CO_DAI = THO.filter((h) => h.tom_tat !== null);
const KHONG_DAI = THO.filter((h) => h.tom_tat === null);
const DV_X2 = docTrangLoTrinh(HTML_X2);

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

async function veCay(cay: React.ReactNode) {
	act(() => root?.unmount());
	document.body.innerHTML = "";
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	await act(async () => root?.render(cay));
	await cho();
}

function nhanThe(): string[] {
	return [
		...(document.body
			.querySelector("[data-lo-trinh-chi-tiet-viec]")
			?.querySelectorAll('[role="tab"]') ?? []),
	].map((e) => chuCua(e));
}

async function bam(el: Element | null | undefined): Promise<void> {
	if (!(el instanceof HTMLElement)) throw new Error("khong co phan tu de bam");
	await act(async () => {
		for (const loai of ["pointerdown", "mousedown", "pointerup", "click"])
			el.dispatchEvent(
				new window.PointerEvent(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				}),
			);
	});
	await cho();
}

async function moNgan(
	duLieu: DuLieu,
	khoa: string,
	the?: string,
): Promise<Element> {
	const viec = phangViec(duLieu, HOM_NAY);
	await veCay(
		<LocaleProvider locale="vi">
			<TooltipProvider>
				<HoSoViec dong={() => {}} khoa={khoa} moViec={() => {}} viec={viec} />
			</TooltipProvider>
		</LocaleProvider>,
	);
	if (the !== undefined)
		await bam(
			[
				...document.body.querySelectorAll(
					'[data-lo-trinh-chi-tiet-viec] [role="tab"]',
				),
			].find((e) => chuCua(e) === the),
		);
	const ngan = document.body.querySelector("[data-lo-trinh-chi-tiet-viec]");
	if (!ngan) throw new Error(`khong mo duoc ngan ${khoa}`);
	return ngan.cloneNode(true) as Element;
}

const chuCua = (el: Element | null | undefined) =>
	(el?.textContent ?? "").trim();

function demDai(dl: DuLieu): number {
	return dl.lo_trinh.reduce(
		(n, lo) => n + lo.hang.filter((h) => h.tom_tat !== null).length,
		0,
	);
}

function kiemSoDem(dl: DuLieu): string[] {
	const n = demDai(dl);
	return n === CO_DAI.length
		? []
		: [`tep mau co ${CO_DAI.length} viec co dai, doc duoc ${n}`];
}

function kiemThuTu(ngan: Element, h: HangTho): string[] {
	const phan = [
		...ngan.querySelectorAll(
			"[data-lo-trinh-theo-loi], [data-lo-trinh-lech], [data-lo-trinh-tom-tat], [data-lo-trinh-so-lieu], [data-lo-trinh-chi-tiet], [data-lo-trinh-can-truoc], [data-lo-trinh-dang-cho]",
		),
	];
	const i = phan.findIndex((e) => e.hasAttribute("data-lo-trinh-tom-tat"));
	if (i < 0) return [`viec ${h.khoa} khong co phan tom tat`];
	const truoc = phan
		.slice(0, i)
		.filter(
			(e) =>
				!e.hasAttribute("data-lo-trinh-theo-loi") &&
				!e.hasAttribute("data-lo-trinh-lech"),
		);
	return truoc.length === 0
		? []
		: [`viec ${h.khoa} co phan dung truoc tom tat`];
}

function kiemTomTat(ngan: Element, h: HangTho): string[] {
	const loi = kiemThuTu(ngan, h);
	const tt = h.tom_tat;
	if (!tt) return [...loi, `viec ${h.khoa} khong co dai trong khoi tho`];
	const hang = [...ngan.querySelectorAll("[data-o-tom-tat]")];
	for (const o of O) {
		const el = hang.find((e) => e.getAttribute("data-o-tom-tat") === o);
		if (!el) {
			loi.push(`viec ${h.khoa} thieu hang ${o}`);
			continue;
		}
		const gt = tt.moi_nguoi[o] ?? null;
		const mong = gt === null ? TRONG : o === "ngay" ? formatDay(gt, "vi") : gt;
		if (chuCua(el) !== mong) loi.push(`viec ${h.khoa} lech o tom tat ${o}`);
	}
	const thuTu = hang.map((e) => e.getAttribute("data-o-tom-tat"));
	if (thuTu.join() !== O.join())
		loi.push(`viec ${h.khoa} sai thu tu hang: ${thuTu.join()}`);
	if (tt.moi_nguoi.trang_thai !== h.trang_thai)
		loi.push(`viec ${h.khoa} o trang_thai lech chu trang thai cua viec`);
	const nhom = ngan.querySelector("[data-nhom-trang-thai]");
	if (
		nhom?.getAttribute("data-nhom-trang-thai") !== h.nhom_trang_thai ||
		chuCua(nhom) !== NHAN_NHOM[h.nhom_trang_thai]
	)
		loi.push(`viec ${h.khoa} lech nhan nhom trang thai`);
	const phu = chuCua(ngan.querySelector("[data-lo-trinh-trang-thai-phu]"));
	const phuMong =
		h.trang_thai !== NHAN_NHOM[h.nhom_trang_thai] &&
		!CUNG_NGHIA.has(h.trang_thai)
			? h.trang_thai
			: "";
	if (phu !== phuMong) loi.push(`viec ${h.khoa} lech chu trang thai phu`);
	return loi;
}

describe("tom-tat", () => {
	test("so dem viet truoc tren khoi tho cua tep mau", () => {
		expect(khoiThoCua(HTML_X2).phien_ban).toBe(2);
		expect(CO_DAI.length).toBe(81);
		expect(
			KHONG_DAI.filter((h) => h.nhom_trang_thai === "da-giao").length,
		).toBe(5);
		expect(
			CO_DAI.filter((h) => h.tom_tat?.moi_nguoi.do_gi === null).length,
		).toBe(12);
		expect(
			CO_DAI.filter((h) => h.tom_tat?.chu_kho.luot_cham === null).length,
		).toBe(14);
		expect(kiemSoDem(coDuLieu(DV_X2))).toEqual([]);
	});

	test(
		"ma tran 81 viec: tam hang dung chu, dung thu tu, dung cho",
		async () => {
			const dl = coDuLieu(DV_X2);
			let dem = 0;
			for (const h of CO_DAI) {
				const loi = kiemTomTat(await moNgan(dl, h.khoa), h);
				expect(loi, loi[0]).toEqual([]);
				dem++;
			}
			expect(dem).toBe(81);
		},
		HAN_BAI_DOM.maTranMs,
	);

	test("chieu do: duong doc cat vi_sao, bo hang do_gi, bo dai mot viec", async () => {
		const dl = coDuLieu(DV_X2);
		const cat: DuLieu = {
			...dl,
			lo_trinh: dl.lo_trinh.map((lo) => ({
				...lo,
				hang: lo.hang.map((h) =>
					h.tom_tat?.moi_nguoi.vi_sao
						? {
								...h,
								tom_tat: {
									...h.tom_tat,
									moi_nguoi: {
										...h.tom_tat.moi_nguoi,
										vi_sao: h.tom_tat.moi_nguoi.vi_sao.slice(0, 400),
									},
								},
							}
						: h,
				),
			})),
		};
		const dai = CO_DAI.filter(
			(h) => (h.tom_tat?.moi_nguoi.vi_sao ?? "").length > 400,
		);
		expect(dai.length).toBe(31);
		for (const h of dai)
			expect(kiemTomTat(await moNgan(cat, h.khoa), h)).toContain(
				`viec ${h.khoa} lech o tom tat vi_sao`,
			);
		const mot = CO_DAI[0];
		if (!mot) throw new Error("khong co viec co dai");
		const ngan = await moNgan(dl, mot.khoa);
		ngan.querySelector('[data-o-tom-tat="do_gi"]')?.remove();
		expect(kiemTomTat(ngan, mot)).toContain(
			`viec ${mot.khoa} thieu hang do_gi`,
		);
		const roi: DuLieu = {
			...dl,
			lo_trinh: dl.lo_trinh.map((lo, i) =>
				i === 0
					? {
							...lo,
							hang: lo.hang.map((h) =>
								`${lo.tep}#${h.ma}` === mot.khoa ? { ...h, tom_tat: null } : h,
							),
						}
					: lo,
			),
		};
		expect(kiemSoDem(roi)).toEqual(["tep mau co 81 viec co dai, doc duoc 80"]);
	});
});

describe("o-vang", () => {
	const coVang = CO_DAI.filter((h) =>
		O.some((o) => (h.tom_tat?.moi_nguoi[o] ?? null) === null),
	);

	function kiemVang(ngan: Element, h: HangTho): string[] {
		const loi: string[] = [];
		const hang = [...ngan.querySelectorAll("[data-o-tom-tat]")];
		if (hang.length !== 8) loi.push(`viec ${h.khoa} co ${hang.length} hang`);
		for (const o of O) {
			const el = hang.find((e) => e.getAttribute("data-o-tom-tat") === o);
			const vang = (h.tom_tat?.moi_nguoi[o] ?? null) === null;
			if (!el) {
				if (vang) loi.push(`viec ${h.khoa} bo hang o vang ${o}`);
				continue;
			}
			if (vang && chuCua(el) !== TRONG)
				loi.push(`viec ${h.khoa} tu dien o ${o}`);
			if (vang !== el.hasAttribute("data-o-vang"))
				loi.push(`viec ${h.khoa} sai dau o vang ${o}`);
		}
		return loi;
	}

	test("moi o vang cua moi viec hien Chua co, o co gia tri khong mang dau vang", async () => {
		expect(coVang.length).toBeGreaterThan(0);
		const dl = coDuLieu(DV_X2);
		let dem = 0;
		for (const h of coVang) {
			const ngan = await moNgan(dl, h.khoa);
			const loi = kiemVang(ngan, h);
			expect(loi, loi[0]).toEqual([]);
			dem += O.filter((o) => (h.tom_tat?.moi_nguoi[o] ?? null) === null).length;
		}
		expect(dem).toBe(
			coVang.reduce(
				(n, h) =>
					n +
					O.filter((o) => (h.tom_tat?.moi_nguoi[o] ?? null) === null).length,
				0,
			),
		);
	});

	test("chieu do: bo hang o vang, tu dien o vang", async () => {
		const h = coVang[0];
		if (!h) throw new Error("khong co viec co o vang");
		const o = O.find((k) => (h.tom_tat?.moi_nguoi[k] ?? null) === null);
		const dl = coDuLieu(DV_X2);
		const ngan = await moNgan(dl, h.khoa);
		ngan.querySelector(`[data-o-tom-tat="${o}"]`)?.remove();
		expect(kiemVang(ngan, h)).toContain(`viec ${h.khoa} bo hang o vang ${o}`);
		const dien: DuLieu = {
			...dl,
			lo_trinh: dl.lo_trinh.map((lo) => ({
				...lo,
				hang: lo.hang.map((x) =>
					`${lo.tep}#${x.ma}` === h.khoa && x.tom_tat && o
						? {
								...x,
								tom_tat: {
									...x.tom_tat,
									moi_nguoi: { ...x.tom_tat.moi_nguoi, [o]: x.trang_thai },
								},
							}
						: x,
				),
			})),
		};
		expect(kiemVang(await moNgan(dien, h.khoa), h)).toContain(
			`viec ${h.khoa} tu dien o ${o}`,
		);
	});
});

describe("chua-co", () => {
	function kiemChuaCo(ngan: Element, h: HangTho): string[] {
		const loi: string[] = [];
		const tt = ngan.querySelector("[data-lo-trinh-tom-tat]");
		if (!tt || !chuCua(tt).includes(m.hoSo.chuaCoTomTat))
			loi.push(`viec ${h.khoa} mat cau chua co tom tat`);
		if (ngan.querySelectorAll("[data-o-tom-tat]").length > 0)
			loi.push(`viec ${h.khoa} co hang tom tat`);
		if (
			ngan.querySelector("[data-lo-trinh-so-lieu]") ||
			nhanThe().includes(m.hoSo.theSoLieu)
		)
			loi.push(`viec ${h.khoa} co so lieu lam viec`);
		if (ngan.querySelectorAll("[data-slot=detail-sheet-stats] dt").length !== 4)
			loi.push(`viec ${h.khoa} dai so khong du bon o`);
		return loi;
	}

	test("moi viec khong dai: mot cau, khong hang, khong so lieu, bon o", async () => {
		const dl = choVaiXem(DV_X2, "owner");
		expect(
			KHONG_DAI.filter((h) => h.nhom_trang_thai === "da-giao").length,
		).toBe(5);
		for (const h of KHONG_DAI) {
			const loi = kiemChuaCo(await moNgan(coDuLieu(dl), h.khoa), h);
			expect(loi, loi[0]).toEqual([]);
		}
		const lt1 = CO_DAI.find((h) => h.ma === "LT1");
		if (!lt1) throw new Error("tep mau thieu LT1");
		const ngan = await moNgan(coDuLieu(DV_X2), lt1.khoa);
		expect(ngan.querySelectorAll("[data-o-tom-tat]").length).toBe(8);
		expect(chuCua(ngan).includes(m.hoSo.chuaCoTomTat)).toBe(false);
	});

	test("chieu do: ban sao an phan tom tat khi khong dai", async () => {
		const h = KHONG_DAI[0];
		if (!h) throw new Error("khong co viec khong dai");
		const ngan = await moNgan(coDuLieu(DV_X2), h.khoa);
		ngan.querySelector("[data-lo-trinh-tom-tat]")?.remove();
		expect(kiemChuaCo(ngan, h)).toContain(
			`viec ${h.khoa} mat cau chua co tom tat`,
		);
	});
});

describe("chu-kho", () => {
	const so = new Intl.NumberFormat("vi");
	const tim = (ma: string) =>
		`https://github.com/search?q=${ma}&type=pullrequests`;

	function kiemChuKho(ngan: Element, h: HangTho): string[] {
		const loi: string[] = [];
		const sl = ngan.querySelector("[data-lo-trinh-so-lieu]");
		if (!sl) return [`viec ${h.khoa} khong co so lieu lam viec`];
		const the = [...ngan.querySelectorAll('[role="tab"]')];
		if (
			the.map((e) => chuCua(e)).join("|") !==
				`${m.hoSo.tongQuan}|${m.hoSo.theSoLieu}` ||
			the[1]?.getAttribute("aria-selected") !== "true"
		)
			loi.push(`viec ${h.khoa} so lieu khong o the thu hai`);
		if (!chuCua(sl).includes(m.hoSo.chiChuThay))
			loi.push(`viec ${h.khoa} thieu cau chi chu thay`);
		const ck = h.tom_tat?.chu_kho ?? null;
		const o = [...sl.querySelectorAll("[data-so-lieu]")].map((e) =>
			e.getAttribute("data-so-lieu"),
		);
		if (o.join() !== [...SO, "ma"].join())
			loi.push(`viec ${h.khoa} sai thu tu so lieu: ${o.join()}`);
		for (const k of SO) {
			const el = sl.querySelector(`[data-so-lieu="${k}"]`);
			const gt = ck?.[k] ?? null;
			const mong = gt === null ? TRONG : so.format(gt);
			if (chuCua(el) !== mong)
				loi.push(
					k === "token"
						? `viec ${h.khoa} so token chua dinh dang`
						: `viec ${h.khoa} lech so ${k}`,
				);
		}
		const ma = ck?.ma ?? null;
		const oMa = sl.querySelector('[data-so-lieu="ma"]');
		if (ma === null) {
			if (chuCua(oMa) !== TRONG)
				loi.push(`viec ${h.khoa} ma vang khong hien chua co`);
			return loi;
		}
		const ngan7 = oMa?.querySelector('[translate="no"]');
		if (chuCua(ngan7) !== ma.slice(0, 7))
			loi.push(`viec ${h.khoa} ma commit ngan sai`);
		const nut = oMa?.querySelector("button");
		if (!nut || !chuCua(nut.querySelector(".sr-only")))
			loi.push(`viec ${h.khoa} nut sao chep khong co nhan`);
		const a = oMa?.querySelector("a");
		const href = a?.getAttribute("href") ?? "";
		if (!href.includes(ma)) loi.push(`viec ${h.khoa} lien ket tim PR sai ma`);
		else if (href !== tim(ma))
			loi.push(`viec ${h.khoa} lien ket tim PR khong tro o tim PR`);
		if (
			a?.getAttribute("target") !== "_blank" ||
			!a?.getAttribute("rel")?.includes("noopener")
		)
			loi.push(`viec ${h.khoa} lien ket tim PR khong mo tab moi an toan`);
		if (ngan.querySelectorAll("input, textarea, select").length > 0)
			loi.push(`viec ${h.khoa} ngan co o nhap`);
		const nutLa = [...ngan.querySelectorAll("button")].filter(
			(b) =>
				b !== nut &&
				b.getAttribute("role") !== "tab" &&
				!b.hasAttribute("data-viec-khoa") &&
				chuCua(b.querySelector(".sr-only")) !== "Đóng" &&
				chuCua(b.querySelector(".sr-only")) !== "Close",
		);
		if (nutLa.length > 0) loi.push(`viec ${h.khoa} ngan co nut la`);
		return loi;
	}

	test(
		"vai owner: 81 viec du sau so, ma commit, sao chep, tim PR",
		async () => {
			const dl = coDuLieu(choVaiXem(DV_X2, "owner"));
			let dem = 0;
			for (const h of CO_DAI) {
				const loi = kiemChuKho(await moNgan(dl, h.khoa, m.hoSo.theSoLieu), h);
				expect(loi, loi[0]).toEqual([]);
				dem++;
			}
			expect(dem).toBe(81);
			expect(
				CO_DAI.filter((h) => h.tom_tat?.chu_kho.luot_cham === null).length,
			).toBe(14);
		},
		HAN_BAI_DOM.maTranMs,
	);

	test("chieu do: so chua dinh dang, href thieu ma, mau bo type", async () => {
		const h = CO_DAI.find((x) => (x.tom_tat?.chu_kho.token ?? 0) >= 1000);
		if (!h) throw new Error("khong co viec co token lon");
		const dl = coDuLieu(choVaiXem(DV_X2, "owner"));
		const ma = String(h.tom_tat?.chu_kho.ma);
		const pha = async (sua: (sl: Element) => void) => {
			const ngan = await moNgan(dl, h.khoa, m.hoSo.theSoLieu);
			const sl = ngan.querySelector("[data-lo-trinh-so-lieu]");
			if (sl) sua(sl);
			return kiemChuKho(ngan, h);
		};
		expect(
			await pha((sl) => {
				const el = sl.querySelector('[data-so-lieu="token"]');
				if (el) el.textContent = String(h.tom_tat?.chu_kho.token);
			}),
		).toContain(`viec ${h.khoa} so token chua dinh dang`);
		expect(
			await pha((sl) =>
				sl
					.querySelector("a")
					?.setAttribute("href", tim("").replace("q=", "q=x")),
			),
		).toContain(`viec ${h.khoa} lien ket tim PR sai ma`);
		expect(
			await pha((sl) =>
				sl
					.querySelector("a")
					?.setAttribute("href", `https://github.com/search?q=${ma}`),
			),
		).toContain(`viec ${h.khoa} lien ket tim PR khong tro o tim PR`);
	});
});

describe("khoan-dung", () => {
	async function trang(dv: DauVao) {
		await veCay(
			<NuqsTestingAdapter hasMemory searchParams="vongDoi=tat-ca">
				<LocaleProvider locale="vi">
					<TooltipProvider>
						<NoiDungLoTrinh dauVao={dv} homNayCoDinh={HOM_NAY} />
					</TooltipProvider>
				</LocaleProvider>
			</NuqsTestingAdapter>,
		);
		return document.body;
	}

	function kiemBan1(dv: DauVao, coBang: boolean): string[] {
		const loi: string[] = [];
		if (dv.kieu !== "co-du-lieu") return [`khoi ban 1 doc ra ${dv.kieu}`];
		if (coBang) loi.push("khoi ban 1 hien bang canh bao ca trang");
		return loi;
	}

	test("ban 1 that cua bo ve kit 2.26: khong bang canh bao, moi viec chua co tom tat", async () => {
		expect(khoiThoCua(HTML_B1).phien_ban).toBe(1);
		const dv = docTrangLoTrinh(HTML_B1);
		const body = await trang(dv);
		const coBang = body.querySelector("[data-lo-trinh-canh-bao]") !== null;
		expect(kiemBan1(dv, coBang)).toEqual([]);
		const dl = coDuLieu(dv);
		for (const h of hangThoCua(HTML_B1)) {
			const ngan = await moNgan(dl, h.khoa);
			expect(
				chuCua(ngan.querySelector("[data-lo-trinh-tom-tat]")),
				`viec ${h.khoa}`,
			).toContain(m.hoSo.chuaCoTomTat);
			expect(ngan.querySelectorAll("[data-o-tom-tat]").length).toBe(0);
		}
	});

	test("doi chung duong: ban 2 nguyen khong canh bao, LT1 du tam hang", async () => {
		expect(DV_X2.kieu === "co-du-lieu" && DV_X2.canhBao).toEqual([]);
		const body = await trang(DV_X2);
		expect(body.querySelector("[data-lo-trinh-canh-bao]")).toBeNull();
		const lt1 = CO_DAI.find((h) => h.ma === "LT1");
		if (!lt1) throw new Error("tep mau thieu LT1");
		const ngan = await moNgan(coDuLieu(DV_X2), lt1.khoa);
		expect(ngan.querySelectorAll("[data-o-tom-tat]").length).toBe(8);
	});

	test("ban moi hon: bang canh bao hien, dai van doc phan biet", async () => {
		const dv = docTrangLoTrinh(
			doiKhoi(HTML_X2, (o) => {
				o.phien_ban = 3;
			}),
		);
		const body = await trang(dv);
		expect(body.querySelector("[data-lo-trinh-canh-bao]")).not.toBeNull();
		const lt1 = CO_DAI.find((h) => h.ma === "LT1");
		if (!lt1) throw new Error("tep mau thieu LT1");
		const ngan = await moNgan(coDuLieu(dv), lt1.khoa);
		expect(ngan.querySelectorAll("[data-o-tom-tat]").length).toBe(8);
	});

	test("sai kieu: o cua dai la so -> khoi hong kem duong khoa, khong nuot thanh chua co", async () => {
		let i = -1;
		let j = -1;
		const html = doiKhoi(HTML_X2, (o) => {
			o.lo_trinh.some((lo, a) =>
				lo.hang.some((h, b) => {
					if (!h.tom_tat) return false;
					Object.assign(h.tom_tat.moi_nguoi, { vi_sao: 5 });
					i = a;
					j = b;
					return true;
				}),
			);
		});
		const dv = docTrangLoTrinh(html);
		expect(dv.kieu).toBe("khoi-hong");
		if (dv.kieu === "khoi-hong")
			expect(dv.cauMay).toContain(
				`lo_trinh.${i}.hang.${j}.tom_tat.moi_nguoi.vi_sao`,
			);
		const body = await trang(dv);
		expect(body.querySelectorAll("[data-o-tom-tat]").length).toBe(0);
	});

	test("chieu do: ban sao giu canh bao cua ban 1", () => {
		const dv = docTrangLoTrinh(HTML_B1);
		expect(kiemBan1(dv, true)).toContain(
			"khoi ban 1 hien bang canh bao ca trang",
		);
	});
});
