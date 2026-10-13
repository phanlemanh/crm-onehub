import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { TooltipProvider } from "@crm/ui/components/tooltip";
import type { Locale } from "@crm/ui/lib/locale";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type CanhCay,
	CayCanChinh,
	type NutDayDu,
} from "@/app/(app)/[slug]/okr/cay-can-chinh";
import { NGHIA_MUC_TIN } from "@/components/crm/record-sheet/ly-do-noi-gop";
import { okrMessages } from "@/lib/messages/okr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { cayCanChinhOutput } from "../../api/src/okr/okr-xem.contracts";

type MucTin = CanhCay["mucTin"];
type GiaTri = string | number | boolean | null | undefined;

const mo = okrMessages("vi");
const mt = okrToanCanhMessages("vi");
const THAM_SO = SEARCH_PARAM.okr.mucTinCay;

function nut(
	id: string,
	loai: NutDayDu["loai"],
	children: NutDayDu[],
	doi: Partial<NutDayDu> = {},
): NutDayDu {
	return {
		id,
		loai,
		objectiveId: id,
		unitName: `Đơn vị ${id}`,
		title: `Nút ${id}`,
		progress: 30,
		status: "cong-bo",
		kind: "cam-ket",
		gop: 1,
		lapLai: false,
		hienThi: "cong-khai",
		soNguoiXem: 0,
		expected: 25,
		children,
		...doi,
	};
}

function canh(
	tu: string,
	den: string,
	muc: MucTin,
	doi: Partial<CanhCay> = {},
): CanhCay {
	return {
		tu,
		den,
		lyDo: muc === "chua-co-ly-do" ? null : `Lý do ${tu} góp vào ${den}`,
		canCu: muc === "co-so-lieu" ? `Căn cứ ${tu}` : null,
		lyDoTuKara: false,
		mucTin: muc,
		...doi,
	};
}

type San = { root: Root; o: HTMLElement; url: () => URLSearchParams };
let dangMo: San[] = [];

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
});

async function dung(
	duLieu: { roots: NutDayDu[]; chuaCanChinh: NutDayDu[]; canh: CanhCay[] },
	thamSo = "",
	locale: Locale = "vi",
): Promise<San> {
	const d = cayCanChinhOutput.parse(duLieu);
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
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
				<LocaleProvider locale={locale}>
					<TooltipProvider>
						<CayCanChinh
							canh={d.canh}
							chuaCanChinh={d.chuaCanChinh}
							roots={d.roots}
						/>
					</TooltipProvider>
				</LocaleProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { root, o, url: () => url };
	dangMo.push(san);
	return san;
}

const qs = (s: string, goc: ParentNode = document) => goc.querySelector(s);
const qsa = (s: string, goc: ParentNode = document) => [
	...goc.querySelectorAll(s),
];
const dongNut = (khoa: string) =>
	qsa("[data-cay-khoa]").find((e) =>
		e.getAttribute("data-cay-khoa")?.endsWith(khoa),
	) ?? null;
const nutTheoId = (id: string) => qsa(`[data-nut-can-chinh="${id}"]`);
const idHien = () =>
	new Set(
		qsa("[data-nut-can-chinh]").map(
			(e) => e.getAttribute("data-nut-can-chinh") ?? "",
		),
	);

function kiem(
	thuc: Readonly<Record<string, GiaTri>>,
	mong: Readonly<Record<string, GiaTri>>,
	thongDiep: (t: string) => string,
) {
	for (const [t, v] of Object.entries(mong))
		if (thuc[t] !== v)
			throw new Error(
				`${thongDiep(t)} — thay ${JSON.stringify(thuc[t])}, mong ${JSON.stringify(v)}`,
			);
}

function docNut(id: string, i = 0) {
	const n = nutTheoId(id)[i];
	if (!n) throw new Error(`khong co nut ${id}`);
	return {
		nhan: qs("[data-muc-tin]", n)?.textContent ?? null,
		tone:
			qs("[data-muc-tin] [data-slot=indicator-dot]", n)?.getAttribute(
				"data-tone",
			) ?? null,
		cau: qs("[data-ly-do-cau]", n)?.textContent ?? null,
		dongLyDo: qsa("[data-ly-do-canh]", n).length,
		kara: qsa("[data-slot=kara-trace]", n).length,
	};
}

describe("l3-nut", () => {
	test("l3-nut nut con duoi KR mang nhan, dong ly do va dau Kara; goc va KR khong co", async () => {
		const ly = canh("P", "K", "co-so-lieu", { lyDoTuKara: true });
		await dung({
			roots: [
				nut("O", "muc-tieu", [nut("K", "kr", [nut("P", "muc-tieu", [])])]),
			],
			chuaCanChinh: [],
			canh: [ly],
		});
		const p = docNut("P");
		if (p.cau !== ly.lyDo) throw new Error(`ly do sai cha: ${p.cau}`);
		kiem(
			{ ...p, lyDoO: docNut("O").dongLyDo, lyDoK: docNut("K").dongLyDo },
			{
				nhan: mo.sheet.mucTin["co-so-lieu"],
				tone: toneTheoNghia(NGHIA_MUC_TIN["co-so-lieu"]),
				kara: 1,
				lyDoO: 0,
				lyDoK: 0,
			},
			(t) => `l3-nut sai ${t}`,
		);
	});
});

describe("l3-ba-muc", () => {
	const MA_TRAN: readonly { id: string; muc: MucTin; tone: string }[] = [
		{ id: "P1", muc: "chua-co-ly-do", tone: "warning" },
		{ id: "P2", muc: "dat-cuoc", tone: "neutral" },
		{ id: "P3", muc: "co-so-lieu", tone: "success" },
	];
	test("l3-ba-muc moi muc mot nhan va tone theo bang chung; chua co ly do chi co nhan", async () => {
		await dung({
			roots: [
				nut(
					"O",
					"muc-tieu",
					MA_TRAN.map((c) => nut(c.id, "muc-tieu", [])),
				),
			],
			chuaCanChinh: [],
			canh: MA_TRAN.map((c) =>
				canh(c.id, "O", c.muc, { lyDoTuKara: c.muc !== "dat-cuoc" }),
			),
		});
		let soCa = 0;
		for (const c of MA_TRAN) {
			const d = docNut(c.id);
			kiem(
				{ nhan: d.nhan, tone: d.tone, toneBang: d.tone },
				{
					nhan: mo.sheet.mucTin[c.muc],
					tone: c.tone,
					toneBang: toneTheoNghia(NGHIA_MUC_TIN[c.muc]),
				},
				(t) => `l3-ba-muc ${c.muc} sai ${t}`,
			);
			soCa += 1;
		}
		expect(soCa).toBe(3);
		kiem(
			{
				dong: docNut("P1").dongLyDo,
				kara: docNut("P1").kara,
				dongDoiChung: docNut("P2").dongLyDo,
				karaDoiChung: docNut("P3").kara,
			},
			{ dong: 0, kara: 0, dongDoiChung: 1, karaDoiChung: 1 },
			(t) => `l3-ba-muc chua-co-ly-do sai ${t}`,
		);
		const nguon = readFileSync(
			join(import.meta.dir, "../app/(app)/[slug]/okr/cay-can-chinh.tsx"),
			"utf8",
		);
		const bang =
			/["']chua-co-ly-do["']\s*:\s*["'](cho|nhap|xong|warning|neutral|success)["']/g;
		const soBang = (nguon.match(bang) ?? []).length;
		if (soBang !== 0) throw new Error(`bang muc tin thu hai: ${soBang}`);
		const goc = readFileSync(
			join(import.meta.dir, "../components/crm/record-sheet/ly-do-noi-gop.tsx"),
			"utf8",
		);
		expect((goc.match(bang) ?? []).length).toBe(1);
	});
});

describe("l3-lap-lai", () => {
	test("l3-lap-lai muc tieu gop hai cho, moi lan hien ly do cua cho noi do", async () => {
		await dung({
			roots: [
				nut("O", "muc-tieu", [
					nut("K", "kr", [nut("P", "muc-tieu", [])]),
					nut("B", "muc-tieu", [nut("P", "muc-tieu", [], { lapLai: true })]),
				]),
			],
			chuaCanChinh: [],
			canh: [
				canh("P", "K", "dat-cuoc", { lyDo: "lý do K" }),
				canh("P", "B", "dat-cuoc", { lyDo: "lý do B" }),
				canh("B", "O", "chua-co-ly-do"),
			],
		});
		const duoiK = dongNut("/K-0/P-0");
		const duoiB = dongNut("/B-1/P-0");
		const cauK = duoiK ? qs("[data-ly-do-cau]", duoiK)?.textContent : null;
		const cauB = duoiB ? qs("[data-ly-do-cau]", duoiB)?.textContent : null;
		if (cauK !== "lý do K" || cauB !== "lý do B")
			throw new Error(`ly do sai cha: duoi K ${cauK}, duoi B ${cauB}`);
	});
});

const CAY_LOC = {
	roots: [
		nut("O", "muc-tieu", [
			nut("K1", "kr", [nut("P1", "muc-tieu", []), nut("P2", "muc-tieu", [])]),
			nut("K2", "kr", [nut("P3", "muc-tieu", [nut("P4", "muc-tieu", [])])]),
		]),
	],
	chuaCanChinh: [nut("Q", "muc-tieu", [])],
	canh: [
		canh("P1", "K1", "chua-co-ly-do"),
		canh("P2", "K1", "dat-cuoc"),
		canh("P3", "K2", "co-so-lieu"),
		canh("P4", "P3", "chua-co-ly-do"),
	],
};

describe("l3-loc", () => {
	const MA_TRAN: readonly { loc: string; mong: string[] }[] = [
		{ loc: "chua-co-ly-do", mong: ["O", "K1", "P1", "K2", "P3", "P4"] },
		{ loc: "dat-cuoc", mong: ["O", "K1", "P2"] },
		{ loc: "tat-ca", mong: ["O", "K1", "P1", "P2", "K2", "P3", "P4", "Q"] },
	];
	test("l3-loc bam chip giu nut khop va to tien, an nhom chua can chinh, ghi duong dan", async () => {
		let soCa = 0;
		for (const c of MA_TRAN) {
			const san = await dung(CAY_LOC);
			const chip = qs(`[data-loc-muc-tin="${c.loc}"]`) as HTMLElement | null;
			if (!chip) throw new Error(`khong co chip ${c.loc}`);
			if (c.loc !== "tat-ca") {
				await act(async () => chip.click());
				expect(san.url().get(THAM_SO)).toBe(c.loc);
			}
			const hien = idHien();
			const thieu = c.mong.filter((id) => !hien.has(id));
			const thua = [...hien].filter((id) => !c.mong.includes(id));
			if (thieu.length || thua.length)
				throw new Error(
					`l3-loc ${c.loc} thieu: ${thieu.join(", ")} · thua: ${thua.join(", ")}`,
				);
			soCa += 1;
			for (const s of dangMo) {
				await act(async () => s.root.unmount());
				s.o.remove();
			}
			dangMo = [];
		}
		expect(soCa).toBe(3);
	});
});

describe("l3-dem", () => {
	test("l3-dem so tren chip, loc rong co cau, gia tri la doc nhu tat ca", async () => {
		await dung(CAY_LOC);
		const so = (loc: string) =>
			Number(
				qs(`[data-loc-muc-tin="${loc}"] [data-so-loc]`)?.textContent ?? "-1",
			);
		const dem = (muc: MucTin | "tat-ca") =>
			muc === "tat-ca"
				? CAY_LOC.canh.length
				: CAY_LOC.canh.filter((k) => k.mucTin === muc).length;
		for (const loc of ["tat-ca", "chua-co-ly-do", "dat-cuoc"] as const)
			if (so(loc) !== dem(loc))
				throw new Error(`so tren chip sai: ${loc} ${so(loc)} khac ${dem(loc)}`);
		for (const s of dangMo) {
			await act(async () => s.root.unmount());
			s.o.remove();
		}
		dangMo = [];
		await dung(
			{ ...CAY_LOC, canh: CAY_LOC.canh.filter((k) => k.mucTin !== "dat-cuoc") },
			`?${THAM_SO}=dat-cuoc`,
		);
		const chip = qs('[data-loc-muc-tin="dat-cuoc"]');
		kiem(
			{
				rong: qs("[data-cay-loc-rong]")?.textContent ?? null,
				soNut: qsa("[data-nut-can-chinh]").length,
				khoa: chip?.hasAttribute("disabled") ?? null,
			},
			{ rong: mt.cay.locRong, soNut: 0, khoa: false },
			(t) => `l3-dem loc rong sai ${t}`,
		);
		for (const s of dangMo) {
			await act(async () => s.root.unmount());
			s.o.remove();
		}
		dangMo = [];
		await dung(CAY_LOC, `?${THAM_SO}=zzz`);
		const tatCa = qs('[data-loc-muc-tin="tat-ca"]');
		const chon =
			tatCa?.getAttribute("data-state") === "on" ||
			tatCa?.getAttribute("aria-checked") === "true";
		kiem(
			{ chon, soNut: idHien().size },
			{ chon: true, soNut: 8 },
			(t) => `l3-dem gia tri la sai ${t}`,
		);
	});
});

describe("l3-chu", () => {
	test("l3-chu ly do khong dich, khoa moi du vi va en, chip dung nhan muc tin", async () => {
		await dung(CAY_LOC);
		expect(qs("[data-ly-do-cau]")?.getAttribute("translate")).toBe("no");
		const vi = okrToanCanhMessages("vi").cay;
		const en = okrToanCanhMessages("en").cay;
		const KHOA: readonly [string, string, string][] = [
			["locTatCa", vi.locTatCa, en.locTatCa],
			["locRong", vi.locRong, en.locRong],
		];
		for (const [ten, a, b] of KHOA)
			if (!a || !b || a === b)
				throw new Error(`l3-chu khoa ${ten} thieu ban vi/en`);
		expect(KHOA.length).toBe(2);
		for (const muc of ["chua-co-ly-do", "dat-cuoc"] as const)
			expect(
				qs(`[data-loc-muc-tin="${muc}"] [data-nhan-loc]`)?.textContent,
			).toBe(mo.sheet.mucTin[muc]);
		for (const s of dangMo) {
			await act(async () => s.root.unmount());
			s.o.remove();
		}
		dangMo = [];
		await dung(CAY_LOC, "", "en");
		expect(
			qs('[data-loc-muc-tin="chua-co-ly-do"] [data-nhan-loc]')?.textContent,
		).toBe(okrMessages("en").sheet.mucTin["chua-co-ly-do"]);
	});
});
