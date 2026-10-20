import { afterEach, describe, expect, mock, test } from "bun:test";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
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
const { tuyChonLoc, phangViec } = await import("@/components/lo-trinh/viec");
const { docDauVaoChoVai, docTrangLoTrinh, ketQuaTuHang } = await import(
	"@/lib/lo-trinh/doc-trang"
);
const { docDuLieu } = await import("@/lib/lo-trinh/doc-du-lieu.js");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { BAN_CHUP_LO_TRINH, banChupVao } = await import(
	"@crm/validation/ban-chup-lo-trinh"
);
const {
	datBaMoc,
	datLech,
	datTen,
	dongSoHtml,
	HTML_KHOI_CU,
	HTML_THAT,
	htmlTuKhoi,
	khoaMocTho,
	khoaViecTho,
	khoiTho,
	mocDauLuatCu,
} = await import("./lo-trinh-mo-hinh-mau");

type DauVao = ReturnType<typeof docTrangLoTrinh>;
type Loc = "vi" | "en";
type KhoiTho = ReturnType<typeof khoiTho>;

const HOM_NAY = "2026-10-19";
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

async function mo(dv: DauVao, thamSo: string, loc: Loc = "vi") {
	act(() => root?.unmount());
	document.body.innerHTML = "";
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	await act(async () =>
		root?.render(
			<NuqsTestingAdapter hasMemory searchParams={thamSo}>
				<LocaleProvider locale={loc}>
					<TooltipProvider>
						<NoiDungLoTrinh dauVao={dv} homNayCoDinh={HOM_NAY} />
					</TooltipProvider>
				</LocaleProvider>
			</NuqsTestingAdapter>,
		),
	);
	await cho();
}

async function bam(el: Element | null | undefined) {
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

const tham = (o: Record<string, string>) => new URLSearchParams(o).toString();
const dv = (html: string) => docTrangLoTrinh(html);
const tatCa = (them: Record<string, string> = {}) =>
	tham({ vongDoi: "tat-ca", ...them });

function mocTrenMan(): Map<string, Element> {
	return new Map(
		[...document.body.querySelectorAll("[data-lo-trinh-moc]")].map((e) => [
			e.getAttribute("data-lo-trinh-moc") ?? "",
			e,
		]),
	);
}

const khoaTrong = (el: Element | null | undefined) =>
	[...(el?.querySelectorAll("[data-viec-khoa]") ?? [])].map(
		(e) => e.getAttribute("data-viec-khoa") ?? "",
	);

async function moNhomChuaHen() {
	const nhom = document.body.querySelector("[data-lo-trinh-khong-moc]");
	if (!nhom) return null;
	if (nhom.getAttribute("data-state") !== "open")
		await bam(nhom.querySelector("button"));
	return document.body.querySelector("[data-lo-trinh-khong-moc]");
}

const demText = (khoa: string) =>
	[...document.body.querySelectorAll("[data-lo-trinh-moc-dem]")]
		.find((e) => e.getAttribute("data-lo-trinh-moc-dem") === khoa)
		?.textContent?.trim() ?? null;

async function khoaDongBang(thamSo: string): Promise<string[]> {
	const ra: string[] = [];
	for (let trang = 1; trang < 50; trang++) {
		await mo(dv(HTML_THAT_CUA), `${thamSo}&page=${trang}`);
		const ds = [
			...document.body.querySelectorAll("tbody [data-viec-khoa]"),
		].map((e) => e.getAttribute("data-viec-khoa") ?? "");
		if (ds.length === 0 || ds.every((k) => ra.includes(k))) break;
		ra.push(...ds);
	}
	return ra;
}

let HTML_THAT_CUA = HTML_THAT;

describe("ltmh-viec-moc", () => {
	test("ltmh-viec-moc: bang, ngan ho so va bo loc chua hen moc theo khoa", async () => {
		const o = khoiTho();
		const lech = datLech(o);
		const html = htmlTuKhoi(o);
		const kx = khoaViecTho(
			{ tep: lech.tep } as KhoiTho["lo_trinh"][number],
			lech.x,
		);
		const ky = khoaViecTho(
			{ tep: lech.tep } as KhoiTho["lo_trinh"][number],
			lech.y,
		);
		await mo(dv(html), tatCa({ q: lech.x }));
		const dong = [...document.body.querySelectorAll("tbody tr")].find(
			(r) => r.querySelector(`[data-viec-khoa="${kx}"]`) !== null,
		);
		expect(
			dong
				?.querySelector("[data-lo-trinh-moc-viec]")
				?.getAttribute("data-lo-trinh-moc-viec"),
			`viec theo luat cu, khong theo viec_hien: ${lech.x}`,
		).toBe(lech.b.ngay);
		await mo(dv(html), tatCa({ q: lech.x, viec: kx }));
		const ngan = document.body.querySelector("[data-lo-trinh-chi-tiet-viec]");
		expect(ngan?.textContent ?? "").toContain(lech.b.ten);
		HTML_THAT_CUA = html;
		const chuaHen = await khoaDongBang(
			tatCa({ q: lech.y, moc: "__khong-moc" }),
		);
		HTML_THAT_CUA = HTML_THAT;
		expect(chuaHen).toContain(ky);
	});
});

describe("ltmh-moc-hien", () => {
	for (const loc of ["vi", "en"] as const)
		test(`ltmh-moc-hien: moc hien, dong so theo con_lai (${loc})`, async () => {
			const o = khoiTho();
			const ba = datBaMoc(o);
			const html = htmlTuKhoi(o);
			const lo = { tep: ba.tep } as KhoiTho["lo_trinh"][number];
			const kc = khoaMocTho(lo, ba.c);
			const kd = khoaMocTho(lo, ba.d);
			const ke = khoaMocTho(lo, ba.e);
			const d = dv(html);
			if (d.kieu !== "co-du-lieu") throw new Error(d.kieu);
			expect(
				tuyChonLoc(d.duLieu, phangViec(d.duLieu, HOM_NAY)).moc,
				`moc hien false van hien: ${ba.c.ten}`,
			).not.toContain(kc);
			await mo(d, tatCa({ xemLoTrinh: "moc" }), loc);
			const man = mocTrenMan();
			expect(man.has(kc), `moc hien false van hien: ${ba.c.ten}`).toBe(false);
			const kyHien = o.lo_trinh.flatMap((x) =>
				x.moc.filter((m) => m.hien).map((m) => khoaMocTho(x, m)),
			);
			expect([...man.keys()].sort()).toEqual([...kyHien].sort());
			const m = (ba.d.viec_hien ?? []).length;
			const n = (ba.e.viec_hien ?? []).length;
			const kyD =
				loc === "vi"
					? `còn 1/${m} việc · ${m - 1} đã giao`
					: `1 of ${m} left · ${m - 1} delivered`;
			const kyE = loc === "vi" ? `đã giao đủ ${n} việc` : `All ${n} delivered`;
			expect(demText(kd), `dong so moc khong theo con_lai: ${ba.d.ten}`).toBe(
				kyD,
			);
			expect(demText(ke), `dong so moc khong theo con_lai: ${ba.e.ten}`).toBe(
				kyE,
			);
			const viecD = o.lo_trinh
				.find((x) => x.tep === ba.tep)
				?.hang.find((h) => (ba.d.viec_hien ?? []).includes(h.ma));
			if (!viecD?.nhom) throw new Error("viec cua D khong co nhom");
			await mo(d, tatCa({ xemLoTrinh: "moc", nhom: viecD.nhom }), loc);
			expect(demText(kd), `dong so moc khong theo con_lai: ${ba.d.ten}`).toBe(
				kyD,
			);
		});
});

describe("ltmh-chua-hen", () => {
	test("ltmh-chua-hen: nhom chua hen moc va bo loc bang theo chua_hen_moc", async () => {
		const o = khoiTho();
		const lech = datLech(o);
		const html = htmlTuKhoi(o);
		const ky = o.lo_trinh.flatMap((lo) =>
			(lo.chua_hen_moc ?? []).map((ma) => khoaViecTho(lo, ma)),
		);
		await mo(dv(html), tatCa({ xemLoTrinh: "moc" }));
		const nhom = await moNhomChuaHen();
		const thay = khoaTrong(nhom);
		expect(
			[...thay].sort(),
			`nhom chua hen moc lech chua_hen_moc: thieu ${lech.y}`,
		).toEqual([...ky].sort());
		const dem = nhom
			?.querySelector(
				"[data-slot=section-heading] .tabular-nums, .tabular-nums",
			)
			?.textContent?.trim();
		expect(dem).toBe(String(thay.length));
		HTML_THAT_CUA = html;
		const bang = await khoaDongBang(tatCa({ moc: "__khong-moc" }));
		HTML_THAT_CUA = HTML_THAT;
		expect([...bang].sort()).toEqual([...ky].sort());
		await mo(dv(html), tham({ xemLoTrinh: "moc", vongDoi: "chua-xong" }));
		const mo2 = khoaTrong(await moNhomChuaHen());
		const kyMo = o.lo_trinh.flatMap((lo) =>
			(lo.chua_hen_moc ?? [])
				.filter((ma) =>
					["chua-bat-dau", "dang-lam"].includes(
						lo.hang.find((h) => h.ma === ma)?.nhom_trang_thai ?? "",
					),
				)
				.map((ma) => khoaViecTho(lo, ma)),
		);
		expect([...mo2].sort()).toEqual([...kyMo].sort());
	});
});

describe("ltmh-ten", () => {
	test("ltmh-ten: ten hien thi o bon cho hien va o tim kiem", async () => {
		const o = khoiTho();
		const z = datTen(o);
		const html = htmlTuKhoi(o);
		const kz = khoaViecTho({ tep: z.tep } as KhoiTho["lo_trinh"][number], z.ma);
		const o4: [string, string, () => Element | null][] = [
			[
				"bang",
				tatCa({ q: z.ma }),
				() =>
					document.body
						.querySelector(`tbody [data-viec-khoa="${kz}"]`)
						?.closest("td") ?? null,
			],
			[
				"bang cot",
				tatCa({ xemLoTrinh: "bang-cot", q: z.ma }),
				() =>
					document.body.querySelector(
						`[data-lo-trinh-bang-cot] [data-viec-khoa="${kz}"]`,
					),
			],
			[
				"kieu xem moc",
				tatCa({ xemLoTrinh: "moc" }),
				() => document.body.querySelector(`[data-viec-khoa="${kz}"]`),
			],
			[
				"ngan ho so",
				tatCa({ q: z.ma, viec: kz }),
				() =>
					document.body
						.querySelector("[data-lo-trinh-chi-tiet-viec]")
						?.querySelector("[data-slot=sheet-title], h2") ?? null,
			],
		];
		for (const [cho2, thamSo, lay] of o4) {
			await mo(dv(html), thamSo);
			expect(
				lay()?.textContent ?? "",
				`ten viec khong theo ten_hien_thi: ${cho2}`,
			).toContain(z.ten);
			const rong = [
				...document.body.querySelectorAll(
					"[data-slot=item-title], tbody td .font-medium",
				),
			].filter((e) => (e.textContent ?? "").trim() === "");
			expect(rong.length, `ten rong: ${cho2}`).toBe(0);
		}
		await mo(dv(html), tatCa({ q: "Ten ngan LT1f" }));
		expect(
			[...document.body.querySelectorAll("tbody [data-viec-khoa]")].map((e) =>
				e.getAttribute("data-viec-khoa"),
			),
			"tim khong ra theo ten hien thi",
		).toEqual([kz]);
	});
});

function kiemDoiChieu(html: string): [number, number, number] {
	const o = khoiTho(html);
	const man = mocTrenMan();
	let soMoc = 0;
	let soViec = 0;
	for (const [i, lo] of o.lo_trinh.entries()) {
		const dongSo = dongSoHtml(html, i);
		const ten = new Map(lo.hang.map((h) => [h.ma, h.ten_hien_thi ?? ""]));
		const hien = lo.moc.filter((m) => m.hien);
		const tren = [...man.keys()].filter((k) => k.startsWith(`${lo.tep}@`));
		expect(tren.sort(), `trang lech khoi o lo trinh ${lo.tep}`).toEqual(
			hien.map((m) => khoaMocTho(lo, m)).sort(),
		);
		for (const m of hien) {
			const ds = khoaTrong(man.get(khoaMocTho(lo, m)));
			const ky = (m.viec_hien ?? []).map((ma) => khoaViecTho(lo, ma));
			if (JSON.stringify([...ds].sort()) !== JSON.stringify([...ky].sort()))
				throw new Error(
					`trang lech khoi o moc ${m.ten}: ${[...ds.filter((k) => !ky.includes(k)), ...ky.filter((k) => !ds.includes(k))].join(",")}`,
				);
		}
		for (const m of hien) {
			const el = man.get(khoaMocTho(lo, m));
			for (const e of el?.querySelectorAll("[data-viec-khoa]") ?? []) {
				const ma = (e.getAttribute("data-viec-khoa") ?? "").split("#")[1] ?? "";
				expect((e.textContent ?? "").trim()).toContain(ten.get(ma) ?? "?");
				soViec++;
			}
			expect(
				demText(khoaMocTho(lo, m)),
				`dong so lech LO-TRINH.html: ${m.ten}`,
			).toBe(dongSo.get(`${m.ngay}@${m.ten}`) ?? null);
			soMoc++;
		}
	}
	return [soMoc, soViec, 0];
}

describe("ltmh-doi-chieu", () => {
	test("ltmh-doi-chieu: trang khop tap hien thi cua khoi that", async () => {
		await mo(dv(HTML_THAT), tatCa({ xemLoTrinh: "moc" }));
		expect(document.body.querySelector("[data-lo-trinh-canh-bao]")).toBeNull();
		const nhom = await moNhomChuaHen();
		const [soMoc, soViec] = kiemDoiChieu(HTML_THAT);
		const o = khoiTho();
		const kyChua = o.lo_trinh.flatMap((lo) =>
			(lo.chua_hen_moc ?? []).map((ma) => khoaViecTho(lo, ma)),
		);
		expect([...khoaTrong(nhom)].sort()).toEqual([...kyChua].sort());
		console.log(`doi-chieu: ${soMoc}/${soViec}/${kyChua.length} khop`);
		expect(soMoc * soViec * kyChua.length).toBeGreaterThan(0);
	});
	test("ltmh-doi-chieu: pha-thu — trang giu luat cu tren khoi da doi moc thi do", async () => {
		const o = khoiTho();
		const lech = datLech(o);
		const sua = htmlTuKhoi(o);
		const trangCu = docTrangLoTrinh(
			htmlTuKhoi(
				(() => {
					const x = khoiTho(sua);
					for (const lo of x.lo_trinh)
						for (const m of lo.moc) {
							m.hien = null;
							m.con_lai = null;
						}
					return x;
				})(),
			),
		);
		await mo(trangCu, tatCa({ xemLoTrinh: "moc" }));
		expect(() => kiemDoiChieu(sua)).toThrow(`trang lech khoi`);
		expect(lech.x).not.toBe("");
	});
});

function hangLuu(html: string) {
	const { duLieu, canhBao } = docDuLieu(html);
	const vao = banChupVao.parse({
		nguon: BAN_CHUP_LO_TRINH.nguonCrm,
		sha: "f".repeat(40),
		commitLuc: "2026-10-19T08:00:00.000Z",
		duLieu,
		canhBao,
	});
	const luu = JSON.parse(
		JSON.stringify({ duLieu: vao.duLieu, canhBao: vao.canhBao }),
	);
	return {
		sha: vao.sha,
		commitLuc: new Date(vao.commitLuc),
		layLuc: new Date("2026-10-19T08:05:00.000Z"),
		duLieu: luu.duLieu,
		canhBao: luu.canhBao,
	};
}

const quaBanChup = (html: string) =>
	docDauVaoChoVai("owner", {
		docBanChup: async () => ketQuaTuHang(hangLuu(html)),
		docBanDung: async () => docTrangLoTrinh(HTML_THAT),
		banDung: {
			sha: "f".repeat(40),
			dungLuc: "2026-10-19T08:00:00.000Z",
			moiTruong: "production",
		},
		ghiCanhBao: () => {},
	});

function anhMoc() {
	const man = mocTrenMan();
	return [...man.entries()].map(([k, e]) => ({
		k,
		viec: khoaTrong(e),
		dem: demText(k),
	}));
}

describe("ltmh-khoi-cu", () => {
	test("ltmh-khoi-cu: trang doi truoc khong canh bao, khong dong so, giu luat cu", async () => {
		await mo(dv(HTML_KHOI_CU), tatCa({ xemLoTrinh: "moc" }));
		expect(document.body.querySelector("[data-lo-trinh-canh-bao]")).toBeNull();
		expect(document.body.querySelector("[data-lo-trinh-moc-dem]")).toBeNull();
		const o = khoiTho(HTML_KHOI_CU);
		const ky = o.lo_trinh.flatMap((lo) => {
			const co = new Set(
				lo.hang
					.map((h) => mocDauLuatCu(lo, h.ma))
					.filter((m) => m !== null)
					.map((m) => khoaMocTho(lo, m)),
			);
			return [...co];
		});
		const cu = anhMoc();
		expect(cu.map((x) => x.k).sort()).toEqual(ky.sort());
		const banChupCu = await quaBanChup(HTML_KHOI_CU);
		await mo(banChupCu, tatCa({ xemLoTrinh: "moc" }));
		expect(document.body.querySelector("[data-lo-trinh-canh-bao]")).toBeNull();
		expect(document.body.querySelector("[data-lo-trinh-moc-dem]")).toBeNull();
		expect(anhMoc()).toEqual(cu);
	});
	test("ltmh-khoi-cu: ban chup moi hien y nhu tep dong goi", async () => {
		await mo(dv(HTML_THAT), tatCa({ xemLoTrinh: "moc" }));
		const dongGoi = anhMoc();
		await mo(await quaBanChup(HTML_THAT), tatCa({ xemLoTrinh: "moc" }));
		expect(anhMoc()).toEqual(dongGoi);
		expect(dongGoi.every((x) => x.dem !== null)).toBe(true);
	});
});
