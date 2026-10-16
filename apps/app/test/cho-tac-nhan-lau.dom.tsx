import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TheDangDung } from "@/components/agent-builder/the-dang-dung";
import { CHO_TAC_NHAN } from "@/lib/agent-builder-cho";
import { troChuyenMessages } from "@/lib/messages/agent-builder-tro-chuyen";

const GIAY_MS = 1000;
const BAT_DAU = "2026-10-16T03:00:00.000Z";
const GOC = Date.parse(BAT_DAU);
const BUOC_VAT = [
	null,
	"agent/instructions.md",
	"agent/manifest.json",
	"agent/README.md",
];

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	setSystemTime();
});

function veThe(
	locale: "vi" | "en",
	daTroiMs: number,
	onDung: () => void = () => {},
): HTMLElement {
	setSystemTime(new Date(GOC + daTroiMs));
	const t = troChuyenMessages(locale);
	khung = document.createElement("div");
	document.body.append(khung);
	root = createRoot(khung);
	act(() =>
		root?.render(
			<TheDangDung
				buoc={t.man.buoc.map((nhan: string, i: number) => ({
					nhan,
					vat: BUOC_VAT[i] ?? null,
				}))}
				daXong={1}
				dangGhi="agent/instructions.md"
				batDauLuc={BAT_DAU}
				t={t}
				nutDung={
					<button type="button" onClick={onDung}>
						{t.dung.dungLai}
					</button>
				}
			/>,
		),
	);
	return khung;
}

const daTroi = (k: HTMLElement) =>
	k.querySelector('[data-slot="da-troi"]')?.textContent ?? null;
const lauHon = (k: HTMLElement) =>
	k.querySelector('[data-slot="lau-hon"]')?.textContent ?? null;

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
			act(() => root?.unmount());
			k.remove();
			root = null;
		}
		console.log(`thoi-gian: ${MA_TRAN.length}/${MA_TRAN.length} o`);
	});

	test("thoi-gian: tang dong ho 1 giay thi chu tang dung 1 giay", async () => {
		const t = troChuyenMessages("vi");
		const k = veThe("vi", 65 * GIAY_MS);
		expect(daTroi(k)).toBe(t.dung.daTroi("1:05"));
		setSystemTime(new Date(GOC + 66 * GIAY_MS));
		await act(
			() => new Promise((xong) => setTimeout(xong, CHO_TAC_NHAN.nhipMs + 200)),
		);
		expect(daTroi(k), "thoi gian da troi sau mot nhip").toBe(
			t.dung.daTroi("1:06"),
		);
	});

	test("gan-muon: gan the luc da qua 250 giay van dem tu luc gui", () => {
		const t = troChuyenMessages("vi");
		const k = veThe("vi", 250 * GIAY_MS);
		expect(daTroi(k), "dem tu luc gui").toBe(t.dung.daTroi("4:10"));
		expect(lauHon(k), "dem tu luc gui — qua nguong").toBe(t.dung.lauHon);
	});

	test("loi-hua: chan the noi roi trang duoc, nut dung con va goi duoc", () => {
		let daBam = 0;
		for (const locale of ["vi", "en"] as const) {
			const t = troChuyenMessages(locale);
			const k = veThe(locale, 10 * GIAY_MS, () => {
				daBam += 1;
			});
			const chu = k.textContent ?? "";
			expect(chu, `loi hua chan the ${locale}`).toContain(t.dung.roiTrang);
			const nut = [...k.querySelectorAll("button")].find(
				(b) => b.textContent === t.dung.dungLai,
			);
			expect(nut, `nut dung ${locale}`).toBeDefined();
			act(() => nut?.click());
			act(() => root?.unmount());
			k.remove();
			root = null;
		}
		expect(daBam).toBe(2);
	});

	test("qua-nguong: nguong doc tu cau hinh, khong tu dung", () => {
		const t = troChuyenMessages("vi");
		const N = CHO_TAC_NHAN.nguongLauMs;
		const MA_TRAN: Array<[number, boolean]> = [
			[N - GIAY_MS, false],
			[N, true],
			[N + 300 * GIAY_MS, true],
		];
		for (const [ms, coDong] of MA_TRAN) {
			let daBam = 0;
			const k = veThe("vi", ms, () => {
				daBam += 1;
			});
			expect(lauHon(k), `qua nguong o ${ms} ms`).toBe(
				coDong ? t.dung.lauHon : null,
			);
			expect(
				[...k.querySelectorAll("button")].some(
					(b) => b.textContent === t.dung.dungLai,
				),
				`qua nguong — nut dung con o ${ms} ms`,
			).toBe(true);
			expect(daBam, "qua nguong — khong tu dung").toBe(0);
			act(() => root?.unmount());
			k.remove();
			root = null;
		}
	});

	test("hai-ngon-ngu: moi khoa moi co vi va en, khac nhau va khong rong", () => {
		const vi = troChuyenMessages("vi").dung;
		const en = troChuyenMessages("en").dung;
		for (const [ten, a, b] of [
			["roiTrang", vi.roiTrang, en.roiTrang],
			["lauHon", vi.lauHon, en.lauHon],
			["daTroi", vi.daTroi("1:05"), en.daTroi("1:05")],
		] as const) {
			expect(a.length, `hai ngon ngu ${ten} vi`).toBeGreaterThan(0);
			expect(b.length, `hai ngon ngu ${ten} en`).toBeGreaterThan(0);
			expect(a, `hai ngon ngu ${ten} khac nhau`).not.toBe(b);
		}
		const k = veThe("en", 250 * GIAY_MS);
		const chu = k.textContent ?? "";
		for (const cau of [vi.roiTrang, vi.lauHon, vi.daTroi("4:10")])
			expect(chu, "hai ngon ngu — ban en khong lan chu vi").not.toContain(cau);
	});
});
