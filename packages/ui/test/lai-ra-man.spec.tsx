import { afterAll, afterEach, beforeEach, expect, test } from "bun:test";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { act, createElement, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { LocaleProvider } from "../src/components/locale-provider";
import { TooltipProvider } from "../src/components/tooltip";
import type { Locale } from "../src/lib/locale";
import { messages } from "../src/lib/messages";

const GOC_KHO = join(import.meta.dir, "..", "..", "..");
const HO_SO = join(GOC_KHO, "_acceptance", "chan-lai-component-ra-man");
const BANG_CU = join(
	GOC_KHO,
	"_acceptance",
	"chu-mac-dinh-thu-vien-ngoai",
	"rang",
	"gioi-han-bam-moi-hien.json",
);

const LUOT_CHAY = (await import(join(HO_SO, "rang", "luot-chay.mjs"))) as {
	duongLuot: (ten: string) => string;
};
const MOI_MAC_DINH = (await import(
	join(HO_SO, "rang", "moi-mac-dinh.mjs")
)) as {
	docMacDinh: (goc: string) => { file: string }[];
};

const NEO_NGAY = "2026-09-08T12:00:00+07:00";
const TRAN_LAI_MS = 30_000;
const LUOT_HET = "vong lai da het luot — ca cua no da ket thuc";

let luot = new AbortController();

beforeEach(() => {
	luot.abort();
	luot = new AbortController();
});

afterEach(() => {
	luot.abort();
});

function conLuot(tin: AbortSignal) {
	if (tin.aborted) throw new Error(LUOT_HET);
}

const DateThat = Date;
const MOC = DateThat.parse(NEO_NGAY);

class DateNeo extends DateThat {
	constructor(...doi_so: unknown[]) {
		if (doi_so.length === 0) super(MOC);
		else super(...(doi_so as [number]));
	}
	static now(): number {
		return MOC;
	}
}

Object.defineProperty(globalThis, "Date", {
	value: DateNeo,
	writable: true,
	configurable: true,
});

afterAll(() => {
	Object.defineProperty(globalThis, "Date", {
		value: DateThat,
		writable: true,
		configurable: true,
	});
});

const DOC_NGHE_DUOC = [
	"title",
	"aria-label",
	"aria-description",
	"aria-placeholder",
	"aria-roledescription",
	"aria-valuetext",
	"aria-keyshortcuts",
	"placeholder",
	"alt",
];

function chuNguoiDoc(): Set<string> {
	const ra = new Set<string>();
	const them = (s: string) => {
		const t = s.replace(/\s+/g, " ").trim();
		if (t && /\p{L}/u.test(t)) ra.add(t);
	};
	for (const n of Array.from(document.body.querySelectorAll("*"))) {
		for (const a of Array.from(n.attributes)) {
			if (DOC_NGHE_DUOC.includes(a.name)) them(a.value);
		}
		for (const c of Array.from(n.childNodes)) {
			if (c.nodeType === 3) them(c.textContent ?? "");
		}
	}
	return ra;
}

const NUT_LAI = [
	'[data-slot$="trigger"]',
	'[role="combobox"]',
	"button",
	"[aria-haspopup]",
];

async function laiMoRa(tin: AbortSignal) {
	const thay = new Set<Element>();
	for (const chon of NUT_LAI)
		for (const n of Array.from(document.body.querySelectorAll(chon)))
			thay.add(n);
	for (const n of Array.from(thay)) {
		if (n instanceof HTMLElement === false) continue;
		conLuot(tin);
		try {
			await act(async () => {
				n.click();
			});
		} catch {}
	}
}

async function ve(
	nut: ReactElement,
	tieng: Locale,
	tin: AbortSignal,
): Promise<{ chu: Set<string>; loi: string | null }> {
	conLuot(tin);
	document.body.innerHTML = "";
	const hop = document.createElement("div");
	document.body.appendChild(hop);
	const goc = createRoot(hop);
	const im = console.error;
	console.error = () => {};
	let daThao = false;
	try {
		await act(async () => {
			goc.render(
				createElement(
					LocaleProvider,
					{ locale: tieng },
					createElement(TooltipProvider, null, nut),
				),
			);
		});
		conLuot(tin);
		const chu = chuNguoiDoc();
		await laiMoRa(tin);
		conLuot(tin);
		for (const c of chuNguoiDoc()) chu.add(c);
		await act(async () => {
			goc.unmount();
		});
		daThao = true;
		return { chu, loi: null };
	} catch (e) {
		if (tin.aborted) throw e;
		return { chu: new Set(), loi: (e as Error).message.slice(0, 200) };
	} finally {
		if (!daThao) {
			try {
				goc.unmount();
			} catch {}
		}
		console.error = im;
	}
}

const CA_RIENG = {
	"packages/ui/src/components/combobox.tsx": [
		{
			options: [{ value: "a", label: "MUC" }],
			value: "",
			onValueChange: () => {},
		},
		{ options: [], value: "", onValueChange: () => {} },
	],
	"packages/ui/src/components/toggle-group.tsx": [{ type: "single" }],
	"packages/ui/src/components/ai-elements/conversation.tsx": [{ messages: [] }],
	"packages/ui/src/components/dashboard-chart.tsx": [
		{ config: { a: { label: "MUC" } }, series: [{ a: 1 }] },
	],
	"apps/app/components/agent-builder/chat-chips.tsx": [
		{
			attachment: { name: "TEP", type: "text/plain", size: 10 },
			resource: { kind: "company", id: "a", label: "MUC" },
			label: "MUC",
		},
	],
} satisfies Record<string, object[]>;

const KHONG_PHAI_COMPONENT = [
	"apps/app/components/data-table/list-search-params.ts",
	"apps/app/lib/trpc/cache.ts",
];

type XuatCuaModule = Record<string, ((...doi_so: never[]) => unknown) | string>;

type MoNguyenBan = Record<string, { chu: string[]; loi: string | null }>;

type BanVe = {
	xuat: string;
	dong: string[];
	mo: string[];
	loi_dong: string | null;
	loi_mo: string | null;
};

async function laiMotFile(
	duongUi: string,
	tieng: Locale,
	tin: AbortSignal,
): Promise<BanVe[]> {
	conLuot(tin);
	if (KHONG_PHAI_COMPONENT.includes(duongUi)) {
		return [
			{
				xuat: "*",
				dong: [],
				mo: [],
				loi_dong: "khong phai component — file nay khong ve gi ra man",
				loi_mo: "khong phai component — file nay khong ve gi ra man",
			},
		];
	}
	const ra: BanVe[] = [];
	let mod: XuatCuaModule;
	try {
		mod = (await import(join(GOC_KHO, duongUi))) as XuatCuaModule;
	} catch (e) {
		return [
			{
				xuat: "*",
				dong: [],
				mo: [],
				loi_dong: `khong nap duoc module: ${(e as Error).message.slice(0, 160)}`,
				loi_mo: null,
			},
		];
	}
	for (const [ten, gt] of Object.entries(mod)) {
		if (gt instanceof Function === false) continue;
		if (!/^[A-Z]/.test(ten)) continue;
		const bo = Object.hasOwn(CA_RIENG, duongUi)
			? CA_RIENG[duongUi as keyof typeof CA_RIENG]
			: [{}];
		const chuDong = new Set<string>();
		const chuMo = new Set<string>();
		let loiDong: string | null = null;
		let loiMo: string | null = null;
		for (const rieng of bo) {
			const dong = await ve(
				createElement(gt as never, rieng as never),
				tieng,
				tin,
			);
			const mo = await ve(
				createElement(
					gt as never,
					{ ...rieng, open: true, defaultOpen: true } as never,
				),
				tieng,
				tin,
			);
			for (const c of dong.chu) chuDong.add(c);
			for (const c of mo.chu) chuMo.add(c);
			if (dong.loi === null) loiDong = null;
			else loiDong = loiDong ?? dong.loi;
			if (mo.loi === null) loiMo = null;
			else loiMo = loiMo ?? mo.loi;
		}
		ra.push({
			xuat: ten,
			dong: [...chuDong],
			mo: [...chuMo],
			loi_dong: loiDong,
			loi_mo: loiMo,
		});
	}
	return ra;
}

function ghi(ten: string, gt: Record<string, BanVe[]> | MoNguyenBan) {
	writeFileSync(
		LUOT_CHAY.duongLuot(ten),
		`${JSON.stringify(gt, null, "\t")}\n`,
	);
}

test(
	"lai tung component ra man, doc chu ban ve that su ve",
	async () => {
		const tin = luot.signal;
		const macDinh = MOI_MAC_DINH.docMacDinh(GOC_KHO);
		const file = [...new Set(macDinh.map((m) => m.file))].sort();
		expect(file.length).toBeGreaterThan(0);

		const banVe: Record<string, BanVe[]> = {};
		for (const f of file) banVe[f] = await laiMotFile(f, "en", tin);
		ghi("ve-that.json", banVe);

		const veDuoc = Object.values(banVe)
			.flat()
			.filter((b) => b.loi_dong === null);
		expect(veDuoc.length).toBeGreaterThan(0);
	},
	TRAN_LAI_MS,
);

test(
	"mo tung nguyen ban cua bang gioi han vong truoc",
	async () => {
		const tin = luot.signal;
		const bang = JSON.parse(readFileSync(BANG_CU, "utf8")) as {
			dong: { component: string; nguyen_ban: string[] }[];
		};
		const ra: MoNguyenBan = {};
		for (const d of bang.dong) {
			const duong = `packages/ui/src/components/${d.component}`;
			const ban = await laiMotFile(duong, "en", tin);
			const chu = new Set<string>();
			let loi: string | null =
				ban.length === 0 ? "khong co xuat nao ve duoc" : null;
			for (const b of ban) {
				for (const c of b.mo) chu.add(c);
				for (const c of b.dong) chu.add(c);
			}
			if (ban.every((b) => b.loi_dong !== null && b.loi_mo !== null)) {
				loi = ban[0]?.loi_dong ?? "khong ve duoc";
			}
			ra[d.component] = { chu: [...chu], loi };
		}
		ghi("mo-nguyen-ban.json", ra);
		expect(Object.keys(ra).length).toBe(bang.dong.length);
	},
	TRAN_LAI_MS,
);

test(
	"chuoi da va den man bang tieng Viet, va so ca bang so dong da va",
	async () => {
		const tin = luot.signal;
		const bang = JSON.parse(
			readFileSync(join(HO_SO, "rang", "da-tim-thay.json"), "utf8"),
		) as { dong: { file: string; khoa: string; dinh_doat: string }[] };
		const daVa = bang.dong.filter((d) => d.dinh_doat === "da va");
		expect(daVa.length).toBeGreaterThan(0);

		const file = [...new Set(daVa.map((d) => d.file))];
		let soCa = 0;
		for (const d of daVa) {
			const [nhom, ten] = d.khoa.split(".") as [
				keyof ReturnType<typeof messages>,
				string,
			];
			const chuVi = (messages("vi")[nhom] as Record<string, string>)[ten];
			const chuEn = (messages("en")[nhom] as Record<string, string>)[ten];
			expect(chuVi).toBeString();
			expect(chuVi).not.toBe(chuEn);

			const banVi = await laiMotFile(d.file, "vi", tin);
			const banEn = await laiMotFile(d.file, "en", tin);
			const gom = (b: BanVe[]) => {
				const ra = new Set<string>();
				for (const x of b) {
					for (const c of x.dong) ra.add(c);
					for (const c of x.mo) ra.add(c);
				}
				return ra;
			};
			expect([d.khoa, [...gom(banVi)].includes(chuVi)]).toEqual([d.khoa, true]);
			expect([d.khoa, [...gom(banEn)].includes(chuEn)]).toEqual([d.khoa, true]);
			soCa += 1;
		}
		expect(soCa).toBe(daVa.length);
		expect(file.length).toBeGreaterThan(0);
	},
	TRAN_LAI_MS,
);
