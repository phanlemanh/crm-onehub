import {
	afterEach,
	describe,
	expect,
	mock,
	setSystemTime,
	spyOn,
	test,
} from "bun:test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";

let soGoiTrpc = 0;
mock.module("@/lib/trpc/client", () => ({
	useTRPC: () =>
		new Proxy(
			{},
			{
				get: () => {
					soGoiTrpc++;
					return new Proxy({}, { get: () => () => ({}) });
				},
			},
		),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/lo-trinh",
}));

const { NoiDungLoTrinh } = await import("@/components/lo-trinh/noi-dung");
const { docTrangLoTrinh } = await import("@/lib/lo-trinh/doc-trang");
const { soNgay, viecTre } = await import("@/lib/lo-trinh/ngay");
const { loTrinhMessages } = await import("@/lib/messages/lo-trinh");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");

type DauVao = ReturnType<typeof docTrangLoTrinh>;
type DuLieu = Extract<DauVao, { kieu: "co-du-lieu" }>["duLieu"];
type Hang = DuLieu["lo_trinh"][number]["hang"][number] & {
	khoa: string;
	loTep: string;
	loTen: string;
	moc: { ngay: string; ten: string } | null;
};

const GOC = path.join(import.meta.dir, "..", "..", "..");
const HTML_MAU = readFileSync(
	path.join(import.meta.dir, "fixtures/lo-trinh/LO-TRINH.mau.html"),
	"utf8",
);
const KHOI =
	/<script type="application\/json" id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/;
const m = loTrinhMessages("vi");
const CHU_CUNG = new Set(["Chưa mở", "Đã giao", "Đang làm"]);
const NHAN = {
	"chua-bat-dau": m.nhom.chuaBatDau,
	"dang-lam": m.nhom.dangLam,
	"da-giao": m.nhom.daGiao,
	khac: m.nhom.khac,
} as const;

function coDuLieu(dv: DauVao): DuLieu {
	if (dv.kieu !== "co-du-lieu") throw new Error(`tep mau hong: ${dv.kieu}`);
	return dv.duLieu;
}

const DV_MAU = docTrangLoTrinh(HTML_MAU);
const DL = coDuLieu(DV_MAU);

function phang(dl: DuLieu): Hang[] {
	return dl.lo_trinh.flatMap((lo) => {
		const theoMoc = new Map<string, { ngay: string; ten: string }>();
		for (const moc of lo.moc)
			for (const ma of moc.hang) if (!theoMoc.has(ma)) theoMoc.set(ma, moc);
		return lo.hang.map((h) => ({
			...h,
			khoa: `${lo.tep}#${h.ma}`,
			loTep: lo.tep,
			loTen: lo.ten ?? lo.tep,
			moc: theoMoc.get(h.ma) ?? null,
		}));
	});
}

const TAT_CA = phang(DL);

type LoTho = {
	hang?: { ma: string | number }[];
	moc?: { ngay: string }[];
	loi: string | null;
	da_bac: { ma: string; ly_do: string }[];
};
type KhoiTho = { khuon: string; phien_ban: number; lo_trinh: LoTho[] };

function doiKhoi(sua: (o: KhoiTho) => void): string {
	const goc = KHOI.exec(HTML_MAU)?.[1];
	if (!goc) throw new Error("tep mau khong co khoi");
	const o: KhoiTho = JSON.parse(goc);
	sua(o);
	const moi = JSON.stringify(o).replace(/</g, "\\u003c");
	return HTML_MAU.replace(
		KHOI,
		`<script type="application/json" id="lo-trinh-du-lieu">${moi}</script>`,
	);
}

let root: Root | null = null;
let url = new URLSearchParams();

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
	setSystemTime();
});

function cay(dv: DauVao, thamSo: string) {
	return (
		<NuqsTestingAdapter
			hasMemory
			onUrlUpdate={(e: UrlUpdateEvent) => {
				url = new URLSearchParams(e.queryString);
			}}
			searchParams={thamSo}
		>
			<LocaleProvider locale="vi">
				<TooltipProvider>
					<NoiDungLoTrinh dauVao={dv} />
				</TooltipProvider>
			</LocaleProvider>
		</NuqsTestingAdapter>
	);
}

async function cho() {
	for (let i = 0; i < 4; i++)
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
}

async function mo(dv: DauVao, thamSo = ""): Promise<void> {
	act(() => root?.unmount());
	document.body.innerHTML = "";
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	url = new URLSearchParams(thamSo);
	await act(async () => root?.render(cay(dv, thamSo)));
	await cho();
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

function dongBang(): Element[] {
	return [...document.body.querySelectorAll("tbody [data-viec-khoa]")];
}

function khoaDong(): string[] {
	return dongBang().map((e) => e.getAttribute("data-viec-khoa") ?? "");
}

const theoKhoa = (ds: Hang[]) => ds.map((h) => h.khoa).sort();
const sapTheoMoc = (ds: Hang[]) =>
	[...ds].sort((a, b) =>
		(a.moc?.ngay ?? "9999").localeCompare(b.moc?.ngay ?? "9999"),
	);
const tham = (o: Record<string, string | string[]>) => {
	const q = new URLSearchParams();
	for (const [k, v] of Object.entries(o))
		for (const g of Array.isArray(v) ? v : [v]) q.append(k, g);
	return q.toString();
};

async function kiemHien(dv: DauVao) {
	const hang = phang(coDuLieu(dv));
	const thay = new Map<string, Element>();
	for (let trang = 1; thay.size < hang.length && trang < 100; trang++) {
		await mo(dv, tham({ vongDoi: "tat-ca", page: String(trang) }));
		const dong = dongBang();
		if (dong.length === 0) break;
		for (const el of dong) {
			const tr = el.closest("tr");
			if (tr)
				thay.set(
					el.getAttribute("data-viec-khoa") ?? "",
					tr.cloneNode(true) as Element,
				);
		}
	}
	expect([...thay.keys()].sort()).toEqual(theoKhoa(hang));
	for (const h of hang) {
		const tr = thay.get(h.khoa);
		if (!tr) throw new Error(`thieu dong ${h.khoa}`);
		const chu = tr.textContent ?? "";
		expect(chu.includes(h.cau_giao), `viec ${h.khoa} thieu cau giao`).toBe(
			true,
		);
		if (h.nhom)
			expect(chu.includes(h.nhom), `viec ${h.khoa} thieu nhom`).toBe(true);
		expect(tr.querySelector("[data-lo-trinh-ten]")?.textContent).toBe(h.loTen);
		const cham = [...tr.querySelectorAll("[data-nhom-trang-thai]")];
		expect(cham.length).toBeGreaterThan(0);
		for (const c of cham) {
			expect(
				c.getAttribute("data-nhom-trang-thai") === h.nhom_trang_thai &&
					c.textContent === NHAN[h.nhom_trang_thai],
				`viec ${h.khoa} lech nhan trang thai`,
			).toBe(true);
		}
		const phu =
			h.trang_thai !== NHAN[h.nhom_trang_thai] && !CHU_CUNG.has(h.trang_thai)
				? h.trang_thai
				: null;
		expect(
			tr.querySelector("[data-lo-trinh-trang-thai-phu]")?.textContent ?? null,
			`viec ${h.khoa} lech nhan trang thai`,
		).toBe(phu);
	}
}

describe("hien", () => {
	test("LO-TRINH.html o goc kho: moi hang mot dong, dung nhan", async () => {
		const dv = docTrangLoTrinh(
			readFileSync(path.join(GOC, "LO-TRINH.html"), "utf8"),
		);
		if (dv.kieu !== "co-du-lieu")
			throw new Error("LO-TRINH.html chưa mang khối — cần kit ≥ 2.26");
		await kiemHien(dv);
	});

	test("doi chung: tep mau cua bo ve qua cung duong", async () => {
		await kiemHien(DV_MAU);
	});
});

describe("vong-doi", () => {
	test("mac dinh Chua xong, thu tu theo moc, moi the dung tap va so dem", async () => {
		await mo(DV_MAU);
		const vd = document.body
			.querySelector("[data-lo-trinh-vong-doi]")
			?.getAttribute("data-lo-trinh-vong-doi");
		expect(vd, "mac dinh khong phai Chua xong").toBe("chua-xong");
		const chuaXong = TAT_CA.filter(
			(h) =>
				h.nhom_trang_thai === "chua-bat-dau" ||
				h.nhom_trang_thai === "dang-lam",
		);
		expect(khoaDong().sort()).toEqual(theoKhoa(chuaXong));
		expect(khoaDong()).toEqual(sapTheoMoc(chuaXong).map((h) => h.khoa));
		const tap = {
			"chua-xong": chuaXong,
			"da-giao": TAT_CA.filter((h) => h.nhom_trang_thai === "da-giao"),
			khac: TAT_CA.filter((h) => h.nhom_trang_thai === "khac"),
			"tat-ca": TAT_CA,
		};
		for (const [the, ds] of Object.entries(tap)) {
			await bam(document.body.querySelector(`[data-vong-doi="${the}"]`));
			expect(khoaDong().sort(), the).toEqual(theoKhoa(ds));
			expect(
				document.body
					.querySelector(`[data-vong-doi="${the}"]`)
					?.getAttribute("data-dem"),
			).toBe(String(ds.length));
			expect(url.get("vongDoi") ?? "chua-xong").toBe(the);
		}
	});
});

describe("loc", () => {
	const HOM_NAY = new Date(2026, 11, 20, 9, 0);
	const treCua = (d: string) =>
		new Set(
			DL.lo_trinh.flatMap((lo) =>
				viecTre(lo, d).map((ma) => `${lo.tep}#${ma}`),
			),
		);
	const giaTri = (h: Hang, chieu: string, tre: Set<string>) =>
		chieu === "loTrinh"
			? [h.loTep]
			: chieu === "nhom"
				? [h.nhom || "__khong-nhom"]
				: [
						h.moc ? `${h.loTep}@${h.moc.ngay}@${h.moc.ten}` : "__khong-moc",
						...(tre.has(h.khoa) ? ["__tre"] : []),
					];

	test("moi gia tri tung chieu, giao hai chieu, URL la bi bo qua, tim", async () => {
		setSystemTime(HOM_NAY);
		const tre = treCua("2026-12-20");
		expect(tre.size).toBeGreaterThan(0);
		const chieuGiaTri = {
			loTrinh: DL.lo_trinh.map((l) => l.tep),
			nhom: [
				...new Set(TAT_CA.map((h) => h.nhom).filter(Boolean)),
				"__khong-nhom",
			],
			moc: [
				"__tre",
				...DL.lo_trinh.flatMap((lo) =>
					lo.moc
						.filter((x) => x.hang.length > 0)
						.map((x) => `${lo.tep}@${x.ngay}@${x.ten}`),
				),
				"__khong-moc",
			],
		};
		let so = 0;
		for (const [chieu, ds] of Object.entries(chieuGiaTri))
			for (const g of ds) {
				await mo(DV_MAU, tham({ vongDoi: "tat-ca", [chieu]: g }));
				const ky = TAT_CA.filter((h) => giaTri(h, chieu, tre).includes(g));
				expect(khoaDong().sort(), `${chieu}=${g}`).toEqual(theoKhoa(ky));
				so++;
			}
		expect(so).toBe(Object.values(chieuGiaTri).flat().length);

		await mo(
			DV_MAU,
			tham({ vongDoi: "tat-ca", nhom: "okr", moc: "__khong-moc" }),
		);
		const giao = TAT_CA.filter((h) => h.nhom === "okr" && h.moc === null);
		expect(giao.length).toBeGreaterThan(0);
		expect(khoaDong().sort(), "loc hai chieu khong la giao").toEqual(
			theoKhoa(giao),
		);

		await mo(DV_MAU, tham({ vongDoi: "tat-ca", nhom: "khong-co-that" }));
		expect(khoaDong().sort()).toEqual(theoKhoa(TAT_CA));

		await mo(DV_MAU, tham({ vongDoi: "tat-ca", q: "okr" }));
		expect(khoaDong().sort()).toEqual(
			theoKhoa(
				TAT_CA.filter(
					(h) =>
						h.cau_giao.toLowerCase().includes("okr") ||
						h.ma.toLowerCase().includes("okr"),
				),
			),
		);
		const mot = TAT_CA[0];
		if (!mot) throw new Error("tep mau rong");
		await mo(DV_MAU, tham({ vongDoi: "tat-ca", q: mot.ma }));
		expect(khoaDong()).toContain(mot.khoa);
	});

	test("dem canh lua chon == do dai tap, dem chieu A loai tru chinh no", async () => {
		const { phangViec, demLoc, hopLoc } = await import(
			"@/components/lo-trinh/viec"
		);
		const viec = phangViec(DL, "2026-12-20");
		const tre = treCua("2026-12-20");
		const rong = { loTrinh: [], nhom: [], moc: [] };
		for (const chieu of ["loTrinh", "nhom", "moc"] as const) {
			const dem = demLoc(viec, rong, chieu);
			for (const [g, n] of Object.entries(dem))
				expect(n, `${chieu}=${g}`).toBe(
					TAT_CA.filter((h) => giaTri(h, chieu, tre).includes(g)).length,
				);
		}
		const chonNhom = { ...rong, nhom: ["okr"] };
		const demMoc = demLoc(viec, chonNhom, "moc");
		for (const [g, n] of Object.entries(demMoc))
			expect(n, `moc=${g} khi nhom=okr`).toBe(
				viec.filter(
					(v) =>
						hopLoc(v, chonNhom) &&
						giaTri(
							TAT_CA.find((h) => h.khoa === v.khoa) as Hang,
							"moc",
							tre,
						).includes(g),
				).length,
			);
	});
});

describe("ngay", () => {
	const ngayCua = (d: Date) =>
		`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

	for (const luc of [
		new Date(2026, 11, 14, 0, 30),
		new Date(2026, 11, 15, 0, 30),
	]) {
		test(`chu duoi ngay va khung viec tre luc ${luc.toISOString()}`, async () => {
			setSystemTime(luc);
			const D = ngayCua(luc);
			await mo(DV_MAU, tham({ vongDoi: "tat-ca" }));
			const tre = new Set(
				DL.lo_trinh.flatMap((lo) =>
					viecTre(lo, D).map((ma) => `${lo.tep}#${ma}`),
				),
			);
			for (const h of TAT_CA) {
				const tr = dongBang()
					.find((e) => e.getAttribute("data-viec-khoa") === h.khoa)
					?.closest("tr");
				const o = tr?.querySelector("[data-lo-trinh-con-ngay]");
				if (!h.moc || h.nhom_trang_thai === "da-giao") {
					expect(o ?? null, `${h.khoa} khong duoc co dong con ngay`).toBeNull();
					continue;
				}
				const n = soNgay(D, h.moc.ngay);
				const mong = tre.has(h.khoa)
					? m.moc.tre(String(Math.abs(n)))
					: n === 0
						? m.moc.homNay
						: m.moc.conNgay(String(n));
				if (h.moc.ngay === D) {
					expect(
						o?.textContent === m.moc.tre(String(Math.abs(n))),
						"dung ngay moc bi tinh la tre",
					).toBe(false);
					expect(o?.textContent, "ngay nguoi xem lech mui gio").toBe(
						m.moc.homNay,
					);
				}
				expect(o?.textContent, `${h.khoa}: dung ngay moc bi tinh la tre`).toBe(
					mong,
				);
			}
			expect(document.body.textContent?.includes("còn -")).toBe(false);

			for (const nhom of [null, "okr"]) {
				const n = TAT_CA.filter(
					(h) => tre.has(h.khoa) && (nhom === null || h.nhom === nhom),
				).length;
				await mo(
					DV_MAU,
					tham(
						nhom ? { vongDoi: "chua-xong", nhom } : { vongDoi: "chua-xong" },
					),
				);
				const khung = document.body.querySelector("[data-lo-trinh-tre]");
				if (n === 0) {
					expect(khung).toBeNull();
					continue;
				}
				expect(khung?.getAttribute("data-lo-trinh-tre")).toBe(String(n));
				await bam(khung?.querySelector("button"));
				expect(url.getAll("moc")).toEqual(["__tre"]);
				expect(url.get("vongDoi")).toBe("tat-ca");
				if (nhom) expect(url.getAll("nhom")).toEqual([nhom]);
				expect(khoaDong().length).toBe(n);
			}
		});
	}

	test("ngay moc khong doc duoc thi khong hien so ngay am hay NaN", async () => {
		setSystemTime(new Date(2026, 11, 20, 0, 30));
		const SAI = ["", "cuối Q4", "2026-10", "2026-10-9"];
		const dv = docTrangLoTrinh(
			doiKhoi((o) => {
				let i = 0;
				for (const lo of o.lo_trinh)
					for (const moc of lo.moc ?? [])
						moc.ngay = SAI[i++ % SAI.length] ?? "";
			}),
		);
		await mo(dv, tham({ vongDoi: "tat-ca" }));
		expect(dv.kieu, "khoi co ngay sai van phai doc duoc").toBe("co-du-lieu");
		expect(khoaDong().length, "bang trong khi ngay moc sai").toBe(
			TAT_CA.length,
		);
		expect(
			document.body.querySelectorAll("[data-lo-trinh-moc-viec]").length,
			"o moc bien mat khi ngay moc sai",
		).toBe(TAT_CA.filter((h) => h.moc !== null).length);
		const chu = document.body.textContent ?? "";
		expect(chu.includes("còn -"), "ngay moc sai hien so ngay am").toBe(false);
		expect(chu.includes("NaN"), "ngay moc sai hien NaN").toBe(false);
		expect(
			document.body.querySelectorAll("[data-lo-trinh-con-ngay]").length,
			"ngay moc sai van hien dong con ngay",
		).toBe(0);
	});

	test("ngay lan lon: chi moc hop le da qua duoc to da qua, ngay la xep cuoi", async () => {
		setSystemTime(new Date(2026, 11, 20, 9, 0));
		const HOM_NAY = "2026-12-20";
		const LA = ["", "2026-10", "cuối Q4"];
		let i = 0;
		const dv = docTrangLoTrinh(
			doiKhoi((o) => {
				for (const lo of o.lo_trinh)
					for (const [k, moc] of (lo.moc ?? []).entries())
						if (k % 2 === 0) moc.ngay = LA[i++ % LA.length] ?? "";
			}),
		);
		const dl = coDuLieu(dv);
		expect(i).toBeGreaterThan(0);
		const hopLe = (ngay: string) => /^\d{4}-\d{2}-\d{2}$/.test(ngay);
		await mo(dv, tham({ xemLoTrinh: "moc", vongDoi: "tat-ca" }));
		const muc = [...document.body.querySelectorAll("[data-lo-trinh-moc]")];
		expect(muc.length).toBeGreaterThan(0);
		let soLa = 0;
		let soQua = 0;
		const thuTu: string[] = [];
		for (const el of muc) {
			const khoa = el.getAttribute("data-lo-trinh-moc") ?? "";
			const ngay = khoa.split("@")[1] ?? "";
			thuTu.push(ngay);
			if (!hopLe(ngay)) soLa++;
			const qua = hopLe(ngay) && ngay < HOM_NAY;
			if (qua) soQua++;
			expect(
				el.hasAttribute("data-completed"),
				`moc da qua danh dau sai: ${khoa}`,
			).toBe(qua);
		}
		expect(soLa, "khong co moc ngay la nao de do").toBeGreaterThan(0);
		expect(soQua, "khong co moc da qua nao de do").toBeGreaterThan(0);
		const dauLa = thuTu.findIndex((n) => !hopLe(n));
		expect(
			thuTu.slice(dauLa).every((n) => !hopLe(n)),
			"moc ngay la khong xep cuoi",
		).toBe(true);

		await mo(dv, tham({ vongDoi: "tat-ca" }));
		const ngayDong = khoaDong().map((k) => {
			const h = phang(dl).find((x) => x.khoa === k);
			return h?.moc ? (hopLe(h.moc.ngay) ? h.moc.ngay : "la") : "khong";
		});
		const nhom = ngayDong.map((n) => (n === "khong" ? 2 : n === "la" ? 1 : 0));
		expect(
			nhom.every((g, k) => k === 0 || (nhom[k - 1] ?? 0) <= g),
			"bang khong xep ngay hop le truoc ngay la",
		).toBe(true);
		const hop = ngayDong.filter((n) => n !== "la" && n !== "khong");
		expect(hop).toEqual([...hop].sort());
	});

	test("ban dung tren may chu khong co chu ngay va khung tre", () => {
		setSystemTime(new Date(2026, 11, 20, 0, 30));
		const html = renderToString(cay(DV_MAU, tham({ vongDoi: "tat-ca" })));
		expect(html.includes("data-lo-trinh-tre")).toBe(false);
		expect(html.includes("Trễ")).toBe(false);
		expect(html.includes("còn ")).toBe(false);
	});
});

describe("chi-doc", () => {
	const lechNut = () =>
		[...document.body.querySelectorAll("button")].filter((b) => {
			if (b.closest("[data-slot=sheet-content]"))
				return !(
					b.hasAttribute("data-viec-khoa") ||
					b.getAttribute("data-slot") === "sheet-close" ||
					b.getAttribute("role") === "tab"
				);
			if (b.closest("tbody")) return true;
			if (b.closest("[data-lo-trinh-xem-moc], [data-lo-trinh-bang-cot]"))
				return !(
					b.hasAttribute("data-viec-khoa") ||
					b.hasAttribute("aria-controls") ||
					b.hasAttribute("aria-expanded")
				);
			return false;
		});

	test("khong o nhap, khong nut la, khong keo tha, khong goi may chu", async () => {
		const goiFetch = spyOn(globalThis, "fetch");
		soGoiTrpc = 0;
		const co = TAT_CA.find((h) => h.dung_tren.length > 0) ?? TAT_CA[0];
		if (!co) throw new Error("tep mau rong");
		const kiem = (nhan: string) => {
			expect(
				document.body.querySelectorAll("input").length,
				nhan,
			).toBeLessThanOrEqual(1);
			expect(document.body.querySelectorAll("textarea").length, nhan).toBe(0);
			expect(
				document.body.querySelectorAll("[contenteditable]").length,
				nhan,
			).toBe(0);
			expect(
				document.body.querySelectorAll("[data-slot=kanban-item-handle]").length,
				nhan,
			).toBe(0);
			const la = lechNut().map((b) => b.textContent);
			expect(la, `nut la tren trang chi doc ${nhan}`).toEqual([]);
		};
		for (const xem of ["bang", "bang-cot", "moc"]) {
			await mo(
				DV_MAU,
				tham({ xemLoTrinh: xem, vongDoi: "tat-ca", viec: co.khoa }),
			);
			expect(
				document.body.querySelector("[data-lo-trinh-chi-tiet-viec]"),
				`ngan ho so chua mo o ${xem}`,
			).not.toBeNull();
			kiem(`${xem} + ngan ho so`);
			await mo(DV_MAU, tham({ xemLoTrinh: xem, vongDoi: "tat-ca" }));
			for (const gap of [
				...document.body.querySelectorAll(
					"[data-lo-trinh-khong-moc] button[aria-expanded=false], [data-lo-trinh-chi-tiet] button[aria-expanded=false]",
				),
			])
				await bam(gap);
			kiem(`${xem} + muc gap`);
		}
		await mo(DV_MAU, tham({ daBac: "true" }));
		kiem("da bac");
		expect(goiFetch).toHaveBeenCalledTimes(0);
		expect(soGoiTrpc).toBe(0);
		goiFetch.mockRestore();
	});
});

describe("cach-xem", () => {
	test("bang cot chia dung chieu, khong keo tha", async () => {
		for (const chia of ["trang-thai", "nhom", "lo-trinh"]) {
			await mo(DV_MAU, tham({ xemLoTrinh: "bang-cot", chiaCot: chia }));
			const gt = (h: Hang) =>
				chia === "trang-thai"
					? h.nhom_trang_thai
					: chia === "nhom"
						? h.nhom || "__khong-nhom"
						: h.loTep;
			const mong = new Map<string, number>();
			for (const h of TAT_CA) mong.set(gt(h), (mong.get(gt(h)) ?? 0) + 1);
			const cot = [...document.body.querySelectorAll("[data-board-column]")];
			expect(
				cot.map((c) => c.getAttribute("data-board-column")).sort(),
				"chia cot sai chieu",
			).toEqual([...mong.keys()].sort());
			for (const c of cot) {
				const id = c.getAttribute("data-board-column") ?? "";
				const so = /(\d+)\s*$/.exec(
					c.firstElementChild?.textContent ?? "",
				)?.[1];
				expect(so, `cot ${id}`).toBe(String(mong.get(id)));
			}
			expect(
				document.body.querySelectorAll("[data-slot=kanban-item-handle]").length,
			).toBe(0);
		}
		const chon = [...document.body.querySelectorAll("[data-chia]")].map((e) =>
			e.getAttribute("data-chia"),
		);
		expect(chon.sort()).toEqual(["lo-trinh", "nhom", "trang-thai"]);
	});

	test("xem theo moc: moc co viec, thu tu ngay, viec duoi moc, da qua, chua hen moc gap", async () => {
		setSystemTime(new Date(2026, 11, 20, 9, 0));
		await mo(DV_MAU, tham({ xemLoTrinh: "moc", vongDoi: "tat-ca" }));
		const mocCoViec = DL.lo_trinh
			.flatMap((lo) =>
				lo.moc.map((x) => ({
					khoa: `${lo.tep}@${x.ngay}@${x.ten}`,
					ngay: x.ngay,
					viec: TAT_CA.filter(
						(h) =>
							h.loTep === lo.tep &&
							h.moc?.ngay === x.ngay &&
							h.moc?.ten === x.ten,
					).map((h) => h.khoa),
				})),
			)
			.filter((x) => x.viec.length > 0)
			.sort((a, b) => a.ngay.localeCompare(b.ngay));
		const thay = [...document.body.querySelectorAll("[data-lo-trinh-moc]")];
		expect(thay.map((e) => e.getAttribute("data-lo-trinh-moc"))).toEqual(
			mocCoViec.map((x) => x.khoa),
		);
		for (const [i, x] of mocCoViec.entries()) {
			const el = thay[i];
			expect(
				[...(el?.querySelectorAll("[data-viec-khoa]") ?? [])]
					.map((e) => e.getAttribute("data-viec-khoa"))
					.sort(),
			).toEqual([...x.viec].sort());
			expect(el?.hasAttribute("data-completed"), x.khoa).toBe(
				x.ngay < "2026-12-20",
			);
		}
		const khongMoc = document.body.querySelector("[data-lo-trinh-khong-moc]");
		expect(khongMoc?.getAttribute("data-state")).toBe("closed");
		expect(khongMoc?.textContent).toContain(
			String(TAT_CA.filter((h) => h.moc === null).length),
		);
	});
});

describe("ho-so", () => {
	const chiTiet = () =>
		document.body.querySelector("[data-lo-trinh-chi-tiet-viec]");

	test("mo tu ba cach xem, bon o, can truoc va dang cho dung chieu, bam viec lien quan", async () => {
		const chon = TAT_CA.filter(
			(h) =>
				h.dung_tren.length > 0 ||
				TAT_CA.some((x) => x.loTep === h.loTep && x.dung_tren.includes(h.ma)),
		);
		for (const dac of [
			TAT_CA.find((h) => h.bat_khi),
			TAT_CA.find((h) => h.theo_loi),
			TAT_CA.find((h) => h.co.length > 0),
		])
			if (dac && !chon.includes(dac)) chon.push(dac);
		expect(chon.length).toBeGreaterThan(2);
		for (const h of chon) {
			await mo(DV_MAU, tham({ vongDoi: "tat-ca", viec: h.khoa }));
			const ngan = chiTiet();
			expect(ngan?.getAttribute("data-lo-trinh-chi-tiet-viec")).toBe(h.ma);
			const chu = ngan?.textContent ?? "";
			expect(chu).toContain(h.loTen);
			expect(chu).toContain(h.nhom || m.loc.khongNhom);
			expect(chu).toContain(h.moc ? h.moc.ten : m.loc.chuaHenMoc);
			expect(chu).toContain(NHAN[h.nhom_trang_thai]);
			if (h.bat_khi) expect(chu).toContain(h.bat_khi);
			else expect(chu.includes(m.hoSo.thanhCongKhi)).toBe(false);
			if (h.vi_sao) expect(chu).toContain(h.vi_sao);
			else expect(chu.includes(m.hoSo.viSao)).toBe(false);
			expect(ngan?.querySelector("[data-lo-trinh-theo-loi]") !== null).toBe(
				h.theo_loi,
			);
			const cungLo = TAT_CA.filter((x) => x.loTep === h.loTep);
			const canTruoc = cungLo
				.filter((x) => h.dung_tren.includes(x.ma))
				.map((x) => x.khoa)
				.sort();
			const dangCho = cungLo
				.filter((x) => x.dung_tren.includes(h.ma))
				.map((x) => x.khoa)
				.sort();
			const lay = (sel: string) =>
				[...(ngan?.querySelectorAll(`${sel} [data-viec-khoa]`) ?? [])]
					.map((e) => e.getAttribute("data-viec-khoa"))
					.sort();
			expect(lay("[data-lo-trinh-can-truoc]")).toEqual(canTruoc);
			expect(
				lay("[data-lo-trinh-dang-cho]"),
				"viec dang cho sai chieu",
			).toEqual(dangCho);
			expect(document.body.textContent?.includes("/feature-loop")).toBe(false);
			const sang = [...canTruoc, ...dangCho][0];
			if (sang) {
				await bam(ngan?.querySelector(`[data-viec-khoa="${sang}"]`));
				expect(chiTiet()?.getAttribute("data-lo-trinh-chi-tiet-viec")).toBe(
					sang.split("#")[1],
				);
			}
		}
		const mot = chon[0];
		if (!mot) throw new Error("khong co viec");
		await mo(DV_MAU, tham({ vongDoi: "tat-ca" }));
		await bam(
			dongBang()
				.find((e) => e.getAttribute("data-viec-khoa") === mot.khoa)
				?.closest("tr"),
		);
		expect(chiTiet()?.getAttribute("data-lo-trinh-chi-tiet-viec")).toBe(mot.ma);
		for (const xem of ["bang-cot", "moc"]) {
			const coMoc = TAT_CA.find((h) => h.moc !== null) ?? mot;
			await mo(DV_MAU, tham({ xemLoTrinh: xem, vongDoi: "tat-ca" }));
			await bam(
				document.body.querySelector(`button[data-viec-khoa="${coMoc.khoa}"]`),
			);
			expect(chiTiet()?.getAttribute("data-lo-trinh-chi-tiet-viec"), xem).toBe(
				coMoc.ma,
			);
		}
	});
});

describe("da-bac", () => {
	test("bat thay du viec da bac moi lo trinh, tat tra lai danh sach cu", async () => {
		await mo(DV_MAU, tham({ vongDoi: "tat-ca", nhom: "okr" }));
		const truoc = khoaDong().sort();
		await bam(document.body.querySelector("[data-lo-trinh-nut-da-bac]"));
		const thay = [...document.body.querySelectorAll("[data-lo-trinh-da-bac]")];
		for (const lo of DL.lo_trinh)
			for (const b of lo.da_bac) {
				const el = thay.find(
					(e) => e.getAttribute("data-lo-trinh-da-bac") === `${lo.tep}#${b.ma}`,
				);
				expect(
					el,
					`thieu viec da bac cua lo trinh ${lo.ten ?? lo.tep}`,
				).toBeDefined();
				expect(el?.textContent).toContain(b.ly_do);
				expect(el?.textContent).toContain(lo.ten ?? lo.tep);
			}
		expect(thay.length).toBe(
			DL.lo_trinh.reduce((n, lo) => n + lo.da_bac.length, 0),
		);
		await bam(document.body.querySelector("[data-lo-trinh-nut-da-bac]"));
		expect(khoaDong().sort()).toEqual(truoc);
	});

	test("doi chung: khoi khong co da_bac hien khung trong", async () => {
		const dv = docTrangLoTrinh(
			doiKhoi((o) => {
				for (const lo of o.lo_trinh) lo.da_bac = [];
			}),
		);
		await mo(dv, tham({ daBac: "true" }));
		expect(
			document.body.querySelector('[data-lo-trinh-trang="khong-da-bac"]'),
		).not.toBeNull();
	});
});

describe("khoan-dung", () => {
	test("tam ca dan tu tep mau: khong vo, dung khung, cau may chi trong chi tiet", async () => {
		const loi = spyOn(console, "error");
		const khongKhoi = HTML_MAU.replace(KHOI, "");
		const khongJson = HTML_MAU.replace(
			KHOI,
			'<script type="application/json" id="lo-trinh-du-lieu">{</script>',
		);
		const CA: {
			ten: string;
			dv: DauVao;
			trang?: string;
			coViec: boolean;
			ghim?: string;
			kiem?: () => void;
		}[] = [
			{
				ten: "tep vang",
				dv: docTrangLoTrinh(null),
				trang: "tep-vang",
				ghim: "trang vo khi tep vang",
				coViec: false,
			},
			{
				ten: "khong khoi",
				dv: docTrangLoTrinh(khongKhoi),
				trang: "chua-co-khoi",
				coViec: false,
			},
			{
				ten: "khong JSON",
				dv: docTrangLoTrinh(khongJson),
				trang: "khoi-hong",
				coViec: false,
			},
			{
				ten: "khuon la",
				dv: docTrangLoTrinh(
					doiKhoi((o) => {
						o.khuon = "khac";
					}),
				),
				trang: "khoi-hong",
				coViec: false,
			},
			{
				ten: "sai kieu",
				dv: docTrangLoTrinh(
					doiKhoi((o) => {
						const viec = o.lo_trinh[0]?.hang?.[0];
						if (viec) viec.ma = 5;
					}),
				),
				trang: "khoi-hong",
				ghim: "sai kieu bi nuot thanh rong",
				coViec: false,
				kiem: () =>
					expect(
						document.body.textContent?.includes("lo_trinh.0.hang"),
						"sai kieu bi nuot thanh rong",
					).toBe(true),
			},
			{
				ten: "phien ban 99",
				dv: docTrangLoTrinh(
					doiKhoi((o) => {
						o.phien_ban = 99;
					}),
				),
				coViec: true,
				kiem: () =>
					expect(
						document.body.querySelector("[data-lo-trinh-canh-bao]"),
					).not.toBeNull(),
			},
			{
				ten: "thieu khoa hang",
				dv: docTrangLoTrinh(
					doiKhoi((o) => {
						delete o.lo_trinh[0]?.hang;
					}),
				),
				coViec: true,
				kiem: () => {
					const dau = DL.lo_trinh[0]?.tep ?? "";
					expect(khoaDong().some((k) => k.startsWith(`${dau}#`))).toBe(false);
					expect(khoaDong().sort()).toEqual(
						theoKhoa(TAT_CA.filter((h) => h.loTep !== dau)),
					);
				},
			},
			{
				ten: "lo trinh co loi",
				dv: docTrangLoTrinh(
					doiKhoi((o) => {
						const lo = o.lo_trinh[1];
						if (lo) lo.loi = "tep ke hoach khong doc duoc";
					}),
				),
				trang: "lo-loi",
				coViec: true,
				kiem: () => expect(khoaDong().sort()).toEqual(theoKhoa(TAT_CA)),
			},
		];
		const ghi: string[] = [];
		for (const ca of CA) {
			try {
				await mo(ca.dv, tham({ vongDoi: "tat-ca" }));
			} catch (e) {
				throw new Error(
					ca.ten === "tep vang" ? "trang vo khi tep vang" : `${ca.ten}: ${e}`,
				);
			}
			if (ca.trang)
				expect(
					document.body.querySelector(`[data-lo-trinh-trang="${ca.trang}"]`),
					ca.ghim ?? ca.ten,
				).not.toBeNull();
			expect(khoaDong().length > 0, ca.ten).toBe(ca.coViec);
			for (const nut of [
				...document.body.querySelectorAll(
					"[data-lo-trinh-chi-tiet] button[aria-expanded=false]",
				),
			])
				await bam(nut);
			const cauMay =
				ca.dv.kieu === "chua-co-khoi" || ca.dv.kieu === "khoi-hong"
					? ca.dv.cauMay
					: "";
			if (cauMay) {
				const ban = document.body.cloneNode(true) as HTMLElement;
				for (const ct of ban.querySelectorAll("[data-lo-trinh-chi-tiet]"))
					ct.remove();
				expect(document.body.textContent).toContain(cauMay);
				expect(ban.textContent?.includes(cauMay), ca.ten).toBe(false);
			}
			ca.kiem?.();
			ghi.push(`## ${ca.ten}\n${document.body.textContent ?? ""}\n`);
		}
		expect(loi).toHaveBeenCalledTimes(0);
		loi.mockRestore();
		const thuMuc = path.join(
			GOC,
			".acceptance-runs",
			"trang-lo-trinh-trong-crm",
		);
		mkdirSync(thuMuc, { recursive: true });
		writeFileSync(path.join(thuMuc, "khoan-dung-chu.txt"), ghi.join("\n"));
	});
});
