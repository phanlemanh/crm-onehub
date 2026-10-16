import {
	afterEach,
	describe,
	expect,
	mock,
	setSystemTime,
	test,
} from "bun:test";
import { parseNoiDungThongBao } from "@crm/validation/thong-bao";
import { act, createElement as h, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import MAU_NOI_DUNG from "../../agent/test/fixtures/cho-tac-nhan-lau-noi-dung.json";
import MAU_LUOT_GUI from "./fixtures/cho-tac-nhan-lau-luot-gui.json";

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/chat/hoi-thoai",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({ href, children }: { href: string; children: ReactNode }) =>
		h("a", { href }, children),
}));
mock.module("@/lib/trpc/client", () => ({ useTRPC: () => ({}) }));

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { BuildingAgentCard, builderSubmissions } = await import(
	"@/components/agent-builder/agent-builder-chat"
);
const { DanhSachNhomThongBao } = await import(
	"@/components/thong-bao/dong-thong-bao"
);
const { CHO_TAC_NHAN } = await import("@/lib/agent-builder-cho");
const { troChuyenMessages } = await import(
	"@/lib/messages/agent-builder-tro-chuyen"
);
const { thongBaoMessages } = await import("@/lib/messages/thong-bao");
const { dongTuRa } = await import("@/lib/thong-bao/dong");

const GIAY_MS = 1000;
const SESSION = "ses-cho";
const GOC = Date.parse(MAU_LUOT_GUI.createdAt);
const LUOT = builderSubmissions.parse([MAU_LUOT_GUI]);
const DUONG_HUY = `/eve/v1/session/${SESSION}/cancel`;
const LOAI_CHUONG = [
	"tac-nhan-xong",
	"tac-nhan-can-tra-loi",
	"tac-nhan-hong",
] as const;

let root: Root | null = null;
let khung: HTMLElement | null = null;
let goiFetch: string[] = [];
const fetchGoc = globalThis.fetch;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	setSystemTime();
	globalThis.fetch = fetchGoc;
	goiFetch = [];
});

function batFetch(): void {
	goiFetch = [];
	globalThis.fetch = Object.assign(
		async (dich: string | URL | Request) => {
			goiFetch.push(String(dich instanceof Request ? dich.url : dich));
			return new Response(null, { status: 204 });
		},
		{ preconnect: fetchGoc.preconnect },
	);
}

function gan(locale: "vi" | "en", man: ReactNode): HTMLElement {
	khung = document.createElement("div");
	document.body.append(khung);
	root = createRoot(khung);
	act(() =>
		root?.render(<LocaleProvider locale={locale}>{man}</LocaleProvider>),
	);
	return khung;
}

function go(): void {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
}

function veThe(locale: "vi" | "en", daTroiMs: number): HTMLElement {
	setSystemTime(new Date(GOC + daTroiMs));
	return gan(
		locale,
		<BuildingAgentCard
			conversationId="hoi-thoai"
			sessionId={SESSION}
			artifacts={[]}
			submissions={LUOT}
		/>,
	);
}

function veChuong(locale: "vi" | "en"): HTMLElement {
	const now = new Date(GOC);
	const dong = LOAI_CHUONG.map((loai, i) =>
		dongTuRa(
			{
				id: `tb-${i}`,
				noiDung: parseNoiDungThongBao(MAU_NOI_DUNG[loai]),
				duongDan: `/chat/${MAU_NOI_DUNG[loai].conversationId}`,
				taoLuc: now,
				daDoc: false,
			},
			{ locale, slug: "ws", now },
			"gio",
		),
	);
	return gan(
		locale,
		<DanhSachNhomThongBao
			nhom={[{ nhan: thongBaoMessages(locale).chuong.homNay, dong }]}
			nhanChuaDoc="chua doc"
			onMo={() => {}}
		/>,
	);
}

async function choMotNhip(): Promise<void> {
	await act(
		() => new Promise((xong) => setTimeout(xong, CHO_TAC_NHAN.nhipMs + 200)),
	);
}

const daTroi = (k: HTMLElement) =>
	k.querySelector('[data-slot="da-troi"]')?.textContent ?? null;
const lauHon = (k: HTMLElement) =>
	k.querySelector('[data-slot="lau-hon"]')?.textContent ?? null;
const nutDung = (k: HTMLElement, chu: string) =>
	[...k.querySelectorAll("button")].find((b) => b.textContent?.includes(chu));

type GiaTri = string | ((...doiSo: string[]) => string);
type Nhanh = { readonly [khoa: string]: GiaTri | Nhanh };

function phang(o: Nhanh, tien: string): Array<[string, GiaTri]> {
	return Object.entries(o).flatMap(([k, v]): Array<[string, GiaTri]> =>
		v instanceof Function
			? [[`${tien}.${k}`, v]]
			: v instanceof Object
				? phang(v, `${tien}.${k}`)
				: [[`${tien}.${k}`, v]],
	);
}

const hienRa = (v: GiaTri): string =>
	v instanceof Function ? v(...["1:05", "1:05", "1:05"].slice(0, v.length)) : v;

function khoaVong(locale: "vi" | "en"): Array<[string, GiaTri]> {
	const tc = troChuyenMessages(locale);
	const tb = thongBaoMessages(locale);
	return [
		...phang(tc.dung, "dung"),
		...phang(tb.chuong, "chuong"),
		...LOAI_CHUONG.map((l): [string, GiaTri] => [`cau.${l}`, tb.cau[l]]),
	];
}

describe("cho-tac-nhan-lau", () => {
	test("thoi-gian: ma tran viet truoc, dem tu luc gui", () => {
		const t = troChuyenMessages("vi");
		const MA_TRAN: Array<[number, string | null]> = [
			[0, null],
			[400, null],
			[1 * GIAY_MS, t.dung.daTroi("0:01")],
			[65 * GIAY_MS, t.dung.daTroi("1:05")],
			[3599 * GIAY_MS, t.dung.daTroi("59:59")],
		];
		for (const [ms, kyVong] of MA_TRAN) {
			const k = veThe("vi", ms);
			expect(daTroi(k), `thoi gian da troi o ${ms} ms`).toBe(kyVong);
			go();
		}
		console.log(`thoi-gian: ${MA_TRAN.length}/${MA_TRAN.length} o`);
	});

	test("thoi-gian: tang dong ho 1 giay thi chu tang dung 1 giay", async () => {
		const t = troChuyenMessages("vi");
		const k = veThe("vi", 65 * GIAY_MS);
		expect(daTroi(k)).toBe(t.dung.daTroi("1:05"));
		setSystemTime(new Date(GOC + 66 * GIAY_MS));
		await choMotNhip();
		expect(daTroi(k), "thoi gian da troi sau mot nhip").toBe(
			t.dung.daTroi("1:06"),
		);
	});

	test("gan-muon: gan the luc da qua 250 giay van dem tu luc gui cua hang gui that", () => {
		const t = troChuyenMessages("vi");
		const k = veThe("vi", 250 * GIAY_MS);
		expect(daTroi(k), "dem tu luc gui").toBe(t.dung.daTroi("4:10"));
		expect(lauHon(k), "dem tu luc gui — qua nguong").toBe(t.dung.lauHon);
	});

	test("loi-hua: chan the noi roi trang duoc, nut dung con va goi huy", async () => {
		const CU = { vi: "Chạy ngầm", en: "Runs in the background" } as const;
		for (const locale of ["vi", "en"] as const) {
			batFetch();
			const t = troChuyenMessages(locale);
			const k = veThe(locale, 10 * GIAY_MS);
			const chu = k.textContent ?? "";
			expect(chu, `loi hua chan the ${locale}`).toContain(t.dung.roiTrang);
			expect(chu, `loi hua chan the ${locale}`).not.toContain(CU[locale]);
			const nut = nutDung(k, t.dung.dungLai);
			expect(nut, `nut dung ${locale}`).toBeDefined();
			await act(async () => nut?.click());
			expect(goiFetch, `loi hua chan the — bam dung goi huy ${locale}`).toEqual(
				[DUONG_HUY],
			);
			go();
		}
	});

	test("qua-nguong: nguong doc tu cau hinh, nut dung con, khong tu dung", async () => {
		const t = troChuyenMessages("vi");
		const N = CHO_TAC_NHAN.nguongLauMs;
		const MA_TRAN: Array<[number, boolean]> = [
			[N - GIAY_MS, false],
			[N, true],
			[N + 300 * GIAY_MS, true],
		];
		for (const [ms, coDong] of MA_TRAN) {
			const k = veThe("vi", ms);
			expect(lauHon(k), `qua nguong o ${ms} ms`).toBe(
				coDong ? t.dung.lauHon : null,
			);
			expect(
				nutDung(k, t.dung.dungLai),
				`qua nguong — nut dung con o ${ms} ms`,
			).toBeDefined();
			go();
		}

		batFetch();
		const k = veThe("vi", N - GIAY_MS);
		expect(lauHon(k)).toBeNull();
		for (const buoc of [N, N + 300 * GIAY_MS]) {
			setSystemTime(new Date(GOC + buoc));
			await choMotNhip();
		}
		expect(lauHon(k), "qua nguong — sau khi dong ho chay qua nguong").toBe(
			t.dung.lauHon,
		);
		expect(goiFetch, "qua nguong — khong tu dung").toEqual([]);
		await act(async () => nutDung(k, t.dung.dungLai)?.click());
		expect(goiFetch, "doi chung: bam dung thi thay lenh huy").toEqual([
			DUONG_HUY,
		]);
	});

	test("hai-ngon-ngu: moi khoa vong nay co vi va en cung kieu, khac nhau, khong lan", () => {
		const vi = new Map(khoaVong("vi"));
		const en = new Map(khoaVong("en"));
		expect([...vi.keys()].sort(), "hai ngon ngu cung bo khoa").toEqual(
			[...en.keys()].sort(),
		);
		for (const [khoa, a] of vi) {
			const b = en.get(khoa);
			if (b === undefined) throw new Error(`thieu en ${khoa}`);
			expect(a instanceof Function, `hai ngon ngu cung kieu ${khoa}`).toBe(
				b instanceof Function,
			);
			if (a instanceof Function && b instanceof Function)
				expect(a.length, `hai ngon ngu cung so doi ${khoa}`).toBe(b.length);
			expect(hienRa(a).trim().length, `hai ngon ngu ${khoa} vi`).toBeGreaterThan(0);
			expect(hienRa(b).trim().length, `hai ngon ngu ${khoa} en`).toBeGreaterThan(0);
			expect(hienRa(a), `hai ngon ngu ${khoa} khac nhau`).not.toBe(hienRa(b));
		}

		const cauCua = (locale: "vi" | "en") =>
			[...khoaVong(locale)].map(([k, v]) => [k, hienRa(v)] as const);
		for (const [locale, khac] of [
			["en", "vi"],
			["vi", "en"],
		] as const) {
			const the = veThe(locale, 250 * GIAY_MS).textContent ?? "";
			go();
			const chuong = veChuong(locale).textContent ?? "";
			go();
			for (const [k, cau] of cauCua(khac)) {
				const mau = cau.split("{ten}")[0] ?? cau;
				expect(the, `hai ngon ngu — the ${locale} khong lan ${k}`).not.toContain(
					mau,
				);
				expect(
					chuong,
					`hai ngon ngu — chuong ${locale} khong lan ${k}`,
				).not.toContain(mau);
			}
		}
	});
});
