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
const { docDauVaoChoVai, docTrangLoTrinh, ketQuaTuHang } = await import(
	"@/lib/lo-trinh/doc-trang"
);
const { docDuLieu } = await import("@/lib/lo-trinh/doc-du-lieu.js");
const { loTrinhMessages } = await import("@/lib/messages/lo-trinh");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { formatDay, formatDayShort, formatDecimal } = await import(
	"@crm/ui/lib/format"
);
const { BAN_CHUP_LO_TRINH, banChupVao } = await import(
	"@crm/validation/ban-chup-lo-trinh"
);
const {
	boGioMay,
	chuaGiao,
	datDuKien,
	gioMay,
	HTML_THAT,
	khoaMocTho,
	khoaViecTho,
	khoiTho,
	mocDangChay,
	suaKhoi,
	timMoc,
	viecCuaMoc,
} = await import("./lo-trinh-du-kien-mau");

type DauVao = ReturnType<typeof docTrangLoTrinh>;
type Loc = "vi" | "en";
type KhoiTho = ReturnType<typeof khoiTho>;

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

async function mo(
	dv: DauVao,
	thamSo: string,
	homNay: string,
	loc: Loc = "vi",
): Promise<void> {
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
						<NoiDungLoTrinh dauVao={dv} homNayCoDinh={homNay} />
					</TooltipProvider>
				</LocaleProvider>
			</NuqsTestingAdapter>,
		),
	);
	await cho();
}

const theoThuoc = (ten: string, gt: string, goc: ParentNode = document.body) =>
	[...goc.querySelectorAll(`[${ten}]`)].filter(
		(e) => e.getAttribute(ten) === gt,
	);

const coCua = (el: Element) =>
	[...el.querySelectorAll("[data-lo-trinh-du-kien-co]")]
		.map(
			(e) =>
				`${e.getAttribute("data-lo-trinh-du-kien-co")}:${e.getAttribute("data-tone") ?? ""}`,
		)
		.sort();

const XEM_MOC = "xemLoTrinh=moc&vongDoi=tat-ca";
const HOM_NAY = "2026-10-17";

function mocDau(o: KhoiTho) {
	const x = mocDangChay(o)[0];
	if (!x) throw new Error("khoi that khong co moc dang chay");
	return x;
}

function dongMoc(khoa: string): Element {
	const el = theoThuoc("data-lo-trinh-du-kien-moc", khoa)[0];
	if (!el) throw new Error(`khong thay dong du kien cua moc ${khoa}`);
	return el;
}

describe("co-ngay", () => {
	const goc = khoiTho();
	const M = mocDau(goc);
	const khoa = khoaMocTho(M.lo, M.moc);
	const html = suaKhoi((k) =>
		datDuKien(timMoc(k, khoa).moc, "2026-10-30", "2026-10-15", null),
	);
	const het = goc.lo_trinh
		.flatMap((lo) => lo.moc.map((m) => ({ lo, m })))
		.filter((x) => !x.m.con_viec && viecCuaMoc(x.lo, x.m).length > 0)
		.map((x) => khoaMocTho(x.lo, x.m));

	function kiem(loc: Loc): void {
		const dk = loTrinhMessages(loc).duKien;
		const chu = dongMoc(khoa).textContent ?? "";
		if (
			!chu.includes(dk.ngay(formatDay("2026-10-30", loc))) ||
			!chu.includes(dk.cachTinh(formatDay("2026-10-15", loc))) ||
			chu.includes(formatDay(M.moc.ngay, loc))
		)
			throw new Error("ngay du kien cua moc M sai");
		for (const k of het) {
			if (theoThuoc("data-lo-trinh-moc", k).length !== 1)
				throw new Error(`khong thay moc het viec tren man: ${k}`);
			if (theoThuoc("data-lo-trinh-du-kien-moc", k).length > 0)
				throw new Error("moc het viec van co ngay du kien");
		}
	}

	test("co-ngay: dong moc hien ngay hoan tat va cau cach tinh, vi va en", async () => {
		expect(het.length).toBeGreaterThan(0);
		for (const loc of ["vi", "en"] as const) {
			await mo(docTrangLoTrinh(html), XEM_MOC, HOM_NAY, loc);
			expect(() => kiem(loc)).not.toThrow();
		}
	});

	test("co-ngay: pha-thu — dong moc mang ngay muc tieu hoac moc het viec co dong thi do", async () => {
		await mo(docTrangLoTrinh(html), XEM_MOC, HOM_NAY);
		const el = dongMoc(khoa);
		const ngay = el.querySelector("[data-lo-trinh-du-kien=co-ngay] span span");
		const cu = ngay?.textContent ?? "";
		if (ngay)
			ngay.textContent = loTrinhMessages("vi").duKien.ngay(
				formatDay(M.moc.ngay, "vi"),
			);
		expect(() => kiem("vi")).toThrow("ngay du kien cua moc M sai");
		if (ngay) ngay.textContent = cu;
		const sao = el.cloneNode(true);
		if (sao instanceof HTMLElement && het[0]) {
			sao.setAttribute("data-lo-trinh-du-kien-moc", het[0]);
			document.body.appendChild(sao);
		}
		expect(() => kiem("vi")).toThrow("moc het viec van co ngay du kien");
	});
});

describe("so-do", () => {
	const M = mocDau(khoiTho());
	const khoa = khoaMocTho(M.lo, M.moc);
	const dk = loTrinhMessages("vi").duKien;
	const voi = (luat: boolean) =>
		suaKhoi((k) => {
			const x = timMoc(k, khoa);
			datDuKien(x.moc, "2026-10-30", "2026-10-15", null);
			const mo = chuaGiao(x.lo, x.moc);
			for (const h of mo) h.gio_may = gioMay("khai");
			const dau = mo[0];
			if (luat && dau) dau.gio_may = gioMay("luat");
		});

	function kiem(coCo: boolean): void {
		const el = dongMoc(khoa);
		const co = theoThuoc("data-lo-trinh-du-kien-co", "chua-du-so-do", el);
		if (coCo) {
			if (
				co.length !== 1 ||
				co[0]?.textContent !== dk.chuaDuSoDo ||
				!(el.textContent ?? "").includes(dk.chuaDuSoDoMoTa)
			)
				throw new Error("ngay tinh tren so do chua du ma khong co");
		} else if (co.length !== 0)
			throw new Error("co so do bat khi moi viec da co so do");
	}

	test("so-do: viec may uoc co co, moi viec khai thi khong", async () => {
		await mo(docTrangLoTrinh(voi(true)), XEM_MOC, HOM_NAY);
		expect(() => kiem(true)).not.toThrow();
		await mo(docTrangLoTrinh(voi(false)), XEM_MOC, HOM_NAY);
		expect(() => kiem(false)).not.toThrow();
	});

	test("so-do: pha-thu — go co khoi o may uoc thi do", async () => {
		await mo(docTrangLoTrinh(voi(true)), XEM_MOC, HOM_NAY);
		for (const e of theoThuoc("data-lo-trinh-du-kien-co", "chua-du-so-do"))
			e.remove();
		expect(() => kiem(true)).toThrow(
			"ngay tinh tren so do chua du ma khong co",
		);
	});
});

describe("qua-tai", () => {
	const M = mocDau(khoiTho());
	const khoa = khoaMocTho(M.lo, M.moc);
	const dk = loTrinhMessages("vi").duKien;
	const html = suaKhoi((k) =>
		datDuKien(
			timMoc(k, khoa).moc,
			"2026-10-20",
			"2026-10-15",
			"mốc quá tải: dự kiến 20/10, mục tiêu 18/10",
		),
	);

	function kiem(): void {
		const el = dongMoc(khoa);
		const qt = theoThuoc("data-lo-trinh-du-kien-co", "qua-tai", el)[0];
		const dq = theoThuoc("data-lo-trinh-du-kien-co", "da-qua", el)[0];
		if (!qt || !dq) throw new Error("thieu co qua tai hoac da qua");
		if (el.querySelector("[data-tone=success], [data-tone=error]"))
			throw new Error("co du kien dung mau hong");
		if (
			qt.getAttribute("data-tone") !== "warning" ||
			dq.getAttribute("data-tone") !== "warning"
		)
			throw new Error("co du kien khong dung mau cho");
		if (
			!(qt.textContent ?? "").includes(dk.quaTai) ||
			!(dq.textContent ?? "").includes(dk.daQua)
		)
			throw new Error("chu co du kien sai");
	}

	test("qua-tai: hai co mang mau cho, khong mau xong hay hong", async () => {
		await mo(docTrangLoTrinh(html), XEM_MOC, "2026-10-21");
		expect(() => kiem()).not.toThrow();
	});

	test("qua-tai: pha-thu — co qua tai to mau hong thi do", async () => {
		await mo(docTrangLoTrinh(html), XEM_MOC, "2026-10-21");
		theoThuoc("data-lo-trinh-du-kien-co", "qua-tai")[0]?.setAttribute(
			"data-tone",
			"error",
		);
		expect(() => kiem()).toThrow("co du kien dung mau hong");
	});
});

describe("chua-co", () => {
	const M = mocDau(khoiTho());
	const khoa = khoaMocTho(M.lo, M.moc);
	const dk = loTrinhMessages("vi").duKien;
	const ca = {
		"chua-mo-viec": suaKhoi((k) => {
			const x = timMoc(k, khoa).moc;
			x.gio_may = {
				thap: 1,
				cao: 2,
				chu: "~1–2 giờ máy",
				phan_tram_tuan: null,
				phan_tram_chu: null,
			};
			x.du_kien = null;
		}),
		"ban-cu": suaKhoi((k) => {
			const x = timMoc(k, khoa).moc;
			delete x.gio_may;
			delete x.du_kien;
		}),
		"khong-doc-duoc": suaKhoi((k) =>
			datDuKien(timMoc(k, khoa).moc, "30/10", "2026-10-15", null),
		),
	} as const;

	function kiem(lyDo: keyof typeof ca): void {
		const el = dongMoc(khoa);
		const chu = el.textContent ?? "";
		if (
			chu.includes(formatDay(M.moc.ngay, "vi")) ||
			/\d{4}-\d{2}-\d{2}/.test(chu)
		)
			throw new Error("ngay muc tieu bi trinh nhu ngay du kien");
		if (!chu.includes(dk.chuaCo)) throw new Error("thieu co chua co ngay");
		const co = (Object.keys(ca) as (keyof typeof ca)[]).filter((k) =>
			chu.includes(dk.lyDo[k]),
		);
		if (co.length !== 1 || co[0] !== lyDo)
			throw new Error(`ly do chua co ngay sai: ${lyDo}`);
	}

	test("chua-co: ba ly do, moi o dung mot cau, khong ngay nao", async () => {
		for (const lyDo of Object.keys(ca) as (keyof typeof ca)[]) {
			await mo(docTrangLoTrinh(ca[lyDo]), XEM_MOC, HOM_NAY);
			expect(() => kiem(lyDo)).not.toThrow();
		}
	});

	test("chua-co: pha-thu — chen ngay muc tieu vao dong thi do", async () => {
		await mo(docTrangLoTrinh(ca["chua-mo-viec"]), XEM_MOC, HOM_NAY);
		const el = dongMoc(khoa);
		el.appendChild(document.createTextNode(formatDay(M.moc.ngay, "vi")));
		expect(() => kiem("chua-mo-viec")).toThrow(
			"ngay muc tieu bi trinh nhu ngay du kien",
		);
	});
});

describe("viec", () => {
	const goc = khoiTho();
	const dangChay = mocDangChay(goc);
	const [M1, M2, M3, M4] = dangChay;
	if (!M1 || !M2 || !M3 || !M4)
		throw new Error("khoi that can >= 4 moc dang chay");
	const k = [M1, M2, M3, M4].map((x) => khoaMocTho(x.lo, x.moc));
	const HOM = "2026-10-21";
	const html = suaKhoi((o) => {
		const [k1, k2, k3, k4] = k as [string, string, string, string];
		const x1 = timMoc(o, k1);
		datDuKien(x1.moc, "2026-10-30", "2026-10-15", null);
		const mo1 = chuaGiao(x1.lo, x1.moc);
		for (const h of mo1) h.gio_may = gioMay("do");
		if (mo1[0]) mo1[0].gio_may = gioMay("luat");
		const x2 = timMoc(o, k2);
		datDuKien(
			x2.moc,
			"2026-10-20",
			"2026-10-15",
			"mốc quá tải: dự kiến 20/10, mục tiêu 18/10",
		);
		for (const h of chuaGiao(x2.lo, x2.moc)) h.gio_may = gioMay("do");
		const x3 = timMoc(o, k3);
		datDuKien(x3.moc, "2026-10-30", "2026-10-15", null);
		for (const h of chuaGiao(x3.lo, x3.moc)) h.gio_may = gioMay("do");
		const x4 = timMoc(o, k4);
		delete x4.moc.gio_may;
		delete x4.moc.du_kien;
		for (const h of chuaGiao(x4.lo, x4.moc)) delete h.gio_may;
	});
	const sau = khoiTho(html);
	const viec = [M1, M2, M3, M4].map((_x, i) => {
		const t = timMoc(sau, k[i] ?? "");
		const v = chuaGiao(t.lo, t.moc)[0];
		if (!v) throw new Error("moc khong co viec mo");
		return {
			moc: t.moc,
			khoa: khoaViecTho(t.lo, v),
			ma: v.ma,
			gio: v.gio_may ?? null,
		};
	});
	const dk = loTrinhMessages("vi").duKien;

	type Mau = { kieu: string; co: string[]; lyDo: string | null };
	const mauCua = (el: Element): Mau => {
		const o = el.matches("[data-lo-trinh-du-kien]")
			? el
			: el.querySelector("[data-lo-trinh-du-kien]");
		return {
			kieu: o?.getAttribute("data-lo-trinh-du-kien") ?? "khong",
			co: coCua(el),
			lyDo: o?.getAttribute("data-ly-do") ?? null,
		};
	};

	async function mauMoc(): Promise<Mau[]> {
		await mo(docTrangLoTrinh(html), XEM_MOC, HOM);
		return k.map((x) => mauCua(dongMoc(x)));
	}

	function kiemO(
		cho: string,
		i: number,
		el: Element | undefined,
		mau: Mau,
	): void {
		const v = viec[i];
		if (!el || !v) throw new Error(`khong thay ${cho} cua viec ${v?.ma}`);
		const thay = mauCua(el);
		if (
			thay.kieu !== mau.kieu ||
			thay.lyDo !== mau.lyDo ||
			JSON.stringify(thay.co) !== JSON.stringify(mau.co)
		)
			throw new Error(`bang thieu co cua moc: ${v.ma}`);
		const hoan = v.moc.du_kien?.hoan_tat;
		const chu = el.textContent ?? "";
		if (
			cho !== "ngan" &&
			mau.kieu === "co-ngay" &&
			hoan &&
			!chu.includes(dk.ngayGon(formatDayShort(hoan, "vi")))
		)
			throw new Error(`ngay gon sai: ${v.ma}`);
		if (
			cho === "ngan" &&
			mau.kieu === "co-ngay" &&
			hoan &&
			!chu.includes(dk.ngay(formatDay(hoan, "vi")))
		)
			throw new Error(`ngay du sai: ${v.ma}`);
	}

	const oViec = (cho: string, khoa: string): Element | undefined => {
		if (cho === "ngan")
			return (
				document.body
					.querySelector("[data-lo-trinh-chi-tiet-viec]")
					?.querySelector("[data-lo-trinh-du-kien]")?.parentElement ?? undefined
			);
		const neo = theoThuoc("data-viec-khoa", khoa)[0];
		return cho === "bang"
			? (neo?.closest("tr") ?? undefined)
			: (neo ?? undefined);
	};

	const THAM = {
		bang: (v: { ma: string; khoa: string }) =>
			`vongDoi=tat-ca&q=${encodeURIComponent(v.ma)}`,
		"bang-cot": (v: { ma: string; khoa: string }) =>
			`xemLoTrinh=bang-cot&vongDoi=tat-ca&q=${encodeURIComponent(v.ma)}`,
		ngan: (v: { ma: string; khoa: string }) =>
			`vongDoi=tat-ca&viec=${encodeURIComponent(v.khoa)}`,
	} as const;

	test("viec: ma tran 3 cho hien x 4 moc so voi dong moc", async () => {
		const mau = await mauMoc();
		expect(mau.map((x) => x.kieu)).toEqual([
			"co-ngay",
			"co-ngay",
			"co-ngay",
			"chua-co",
		]);
		let so = 0;
		for (const cho of ["bang", "bang-cot", "ngan"] as const)
			for (let i = 0; i < 4; i++) {
				const v = viec[i];
				const m = mau[i];
				if (!v || !m) continue;
				await mo(docTrangLoTrinh(html), THAM[cho](v), HOM);
				expect(() => kiemO(cho, i, oViec(cho, v.khoa), m)).not.toThrow();
				so++;
			}
		expect(so).toBe(12);
	});

	function kiemUocLuong(v: (typeof viec)[number]): void {
		const ngan = document.body.querySelector("[data-lo-trinh-chi-tiet-viec]");
		if (!ngan) throw new Error(`khong thay ngan cua viec ${v.ma}`);
		const ul = ngan.querySelector("[data-lo-trinh-uoc-luong]");
		if ((ngan.textContent ?? "").includes("NaN"))
			throw new Error("uoc luong hong khi thieu gio may");
		if (v.gio === null) {
			if (ul) throw new Error("uoc luong hong khi thieu gio may");
			return;
		}
		const khoang = `${formatDecimal(v.gio.thap ?? 0, "vi")}–${formatDecimal(v.gio.cao ?? 0, "vi")}`;
		if (!(ul?.textContent ?? "").includes(dk.gio(khoang)))
			throw new Error(`uoc luong sai: ${v.ma}`);
		if (
			(ul?.querySelector("[data-lo-trinh-du-kien-co=chua-du-so-do]") !==
				null) !==
			(v.gio.co !== null)
		)
			throw new Error(`co uoc luong sai: ${v.ma}`);
	}

	test("viec: ngan ho so co uoc luong khi co gio may, khong vo khi thieu", async () => {
		expect(viec.some((v) => v.gio === null)).toBe(true);
		for (const v of viec) {
			await mo(docTrangLoTrinh(html), THAM.ngan(v), HOM);
			expect(() => kiemUocLuong(v)).not.toThrow();
		}
	});

	test("viec: pha-thu — ngan hien NaN khi thieu gio may thi do", async () => {
		const v = viec.find((x) => x.gio === null);
		if (!v) throw new Error("khong co viec thieu gio may");
		await mo(docTrangLoTrinh(html), THAM.ngan(v), HOM);
		document.body
			.querySelector("[data-lo-trinh-chi-tiet-viec]")
			?.appendChild(document.createTextNode("NaN–NaN"));
		expect(() => kiemUocLuong(v)).toThrow("uoc luong hong khi thieu gio may");
	});

	function chonKhongNgay() {
		const loM1 = timMoc(sau, k[0] ?? "").lo;
		const daGiao =
			loM1.hang.find(
				(h) => h.nhom_trang_thai === "da-giao" && M1?.moc.hang.includes(h.ma),
			) ?? loM1.hang.find((h) => h.nhom_trang_thai === "da-giao");
		const coMoc = new Set(
			sau.lo_trinh.flatMap((lo) =>
				lo.moc.flatMap((m) => m.hang.map((ma) => `${lo.tep}#${ma}`)),
			),
		);
		const khongMoc = sau.lo_trinh
			.flatMap((lo) => lo.hang.map((h) => ({ lo, h })))
			.find((x) => !coMoc.has(khoaViecTho(x.lo, x.h)));
		if (!daGiao || !khongMoc)
			throw new Error("khoi that thieu viec da giao hay viec chua hen moc");
		return [
			{ ma: daGiao.ma, khoa: khoaViecTho(loM1, daGiao) },
			{ ma: khongMoc.h.ma, khoa: khoaViecTho(khongMoc.lo, khongMoc.h) },
		];
	}

	function kiemKhongNgay(
		cho: "bang" | "ngan",
		v: { ma: string; khoa: string },
	): void {
		const vung =
			cho === "ngan"
				? document.body.querySelector("[data-lo-trinh-chi-tiet-viec]")
				: oViec(cho, v.khoa);
		if (!vung) throw new Error(`khong thay ${cho} cua viec ${v.ma}`);
		if (
			cho === "ngan" &&
			vung.getAttribute("data-lo-trinh-chi-tiet-viec") !== v.ma
		)
			throw new Error(`ngan mo nham viec: ${v.ma}`);
		if (vung.querySelector("[data-lo-trinh-du-kien]"))
			throw new Error("viec da giao co ngay du kien");
	}

	test("viec: viec da giao va viec chua hen moc khong co ngay du kien", async () => {
		let so = 0;
		for (const v of chonKhongNgay())
			for (const cho of ["bang", "ngan"] as const) {
				await mo(docTrangLoTrinh(html), THAM[cho](v), HOM);
				expect(() => kiemKhongNgay(cho, v)).not.toThrow();
				so++;
			}
		expect(so).toBe(4);
	});

	test("viec: pha-thu — viec da giao bi gan ngay du kien thi do", async () => {
		const v = chonKhongNgay()[0];
		if (!v) throw new Error("thieu viec da giao");
		await mo(docTrangLoTrinh(html), THAM.bang(v), HOM);
		const gia = document.createElement("span");
		gia.setAttribute("data-lo-trinh-du-kien", "co-ngay");
		oViec("bang", v.khoa)?.appendChild(gia);
		expect(() => kiemKhongNgay("bang", v)).toThrow(
			"viec da giao co ngay du kien",
		);
	});

	test("viec: pha-thu — dang gon bi go co thi do", async () => {
		const mau = await mauMoc();
		const v = viec[0];
		const m = mau[0];
		if (!v || !m) throw new Error("thieu o");
		await mo(docTrangLoTrinh(html), THAM.bang(v), HOM);
		const el = oViec("bang", v.khoa);
		for (const c of el?.querySelectorAll("[data-lo-trinh-du-kien-co]") ?? [])
			c.remove();
		expect(() => kiemO("bang", 0, el, m)).toThrow(
			`bang thieu co cua moc: ${v.ma}`,
		);
	});
});

describe("ban-cu", () => {
	const HTML_BAN_CU = suaKhoi(boGioMay);
	const soMocMo = mocDangChay(khoiTho(HTML_BAN_CU)).length;
	const SHA = "d".repeat(40);

	function hangTuDay(html: string) {
		const { duLieu, canhBao } = docDuLieu(html);
		const vao = banChupVao.parse({
			nguon: BAN_CHUP_LO_TRINH.nguonCrm,
			sha: SHA,
			commitLuc: "2026-10-17T08:00:00.000Z",
			duLieu,
			canhBao,
		});
		return {
			sha: vao.sha,
			commitLuc: new Date(vao.commitLuc),
			layLuc: new Date("2026-10-17T08:05:00.000Z"),
			duLieu: vao.duLieu,
			canhBao: vao.canhBao,
		};
	}

	const quaBanChup = (html: string) =>
		docDauVaoChoVai("owner", {
			docBanChup: async () => ketQuaTuHang(hangTuDay(html)),
			docBanDung: async () => docTrangLoTrinh(HTML_THAT),
			banDung: {
				sha: SHA,
				dungLuc: "2026-10-17T08:00:00.000Z",
				moiTruong: "production",
			},
			ghiCanhBao: () => {},
		});

	function kiemBanCu(): void {
		if (document.body.querySelector("[data-lo-trinh-canh-bao]"))
			throw new Error("hop canh bao khuon bat vi thieu gio may");
		const banCu = theoThuoc("data-ly-do", "ban-cu").filter((e) =>
			e.closest("[data-lo-trinh-du-kien-moc]"),
		);
		if (banCu.length !== soMocMo)
			throw new Error(`so moc ban-cu lech: ${banCu.length}/${soMocMo}`);
	}

	test("ban-cu: trang doi truoc khong hop canh bao, moi moc dang chay co co ban-cu", async () => {
		expect(soMocMo).toBeGreaterThan(0);
		await mo(docTrangLoTrinh(HTML_BAN_CU), XEM_MOC, HOM_NAY);
		expect(() => kiemBanCu()).not.toThrow();
	});

	test("ban-cu: ban chup doi truoc qua duong ban chup cung vay", async () => {
		await mo(await quaBanChup(HTML_BAN_CU), XEM_MOC, HOM_NAY);
		expect(() => kiemBanCu()).not.toThrow();
	});

	test("ban-cu: ban chup moi hien cung dong moc nhu ban dong goi", async () => {
		const M = mocDau(khoiTho());
		const khoa = khoaMocTho(M.lo, M.moc);
		const html = suaKhoi((o) =>
			datDuKien(timMoc(o, khoa).moc, "2026-10-29", "2026-10-16", null),
		);
		await mo(docTrangLoTrinh(html), XEM_MOC, HOM_NAY);
		const dongGoi = dongMoc(khoa).textContent;
		await mo(await quaBanChup(html), XEM_MOC, HOM_NAY);
		expect(
			document.body.querySelector("[data-slot=gio-lay-lo-trinh]"),
		).not.toBeNull();
		expect(dongMoc(khoa).textContent).toBe(dongGoi);
		expect(dongGoi ?? "").toContain(
			loTrinhMessages("vi").duKien.ngay(formatDay("2026-10-29", "vi")),
		);
	});

	test("ban-cu: pha-thu — hop canh bao hien thi do", async () => {
		await mo(docTrangLoTrinh(HTML_BAN_CU), XEM_MOC, HOM_NAY);
		const gia = document.createElement("div");
		gia.setAttribute("data-lo-trinh-canh-bao", "");
		document.body.appendChild(gia);
		expect(() => kiemBanCu()).toThrow(
			"hop canh bao khuon bat vi thieu gio may",
		);
	});
});
