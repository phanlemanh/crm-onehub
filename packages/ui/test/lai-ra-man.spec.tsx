import { expect, test } from "bun:test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createElement, type ReactElement } from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { LocaleProvider } from "../src/components/locale-provider";
import { TooltipProvider } from "../src/components/tooltip";
import type { Locale } from "../src/lib/locale";

const GOC_KHO = join(import.meta.dir, "..", "..", "..");
const HO_SO = join(GOC_KHO, "_acceptance", "chan-lai-component-ra-man");
const BANG_CU = join(
	GOC_KHO,
	"_acceptance",
	"chu-mac-dinh-thu-vien-ngoai",
	"rang",
	"gioi-han-bam-moi-hien.json",
);

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
	'[aria-haspopup]',
];

async function laiMoRa() {
	const thay = new Set<Element>();
	for (const chon of NUT_LAI)
		for (const n of Array.from(document.body.querySelectorAll(chon))) thay.add(n);
	for (const n of Array.from(thay)) {
		if (n instanceof HTMLElement === false) continue;
		try {
			await act(async () => {
				n.click();
			});
		} catch {}
	}
}

async function ve(
	nut: ReactElement,
	tieng: Locale = "en",
): Promise<{ chu: Set<string>; loi: string | null }> {
	document.body.innerHTML = "";
	const hop = document.createElement("div");
	document.body.appendChild(hop);
	const goc = createRoot(hop);
	const im = console.error;
	console.error = () => {};
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
		const chu = chuNguoiDoc();
		await laiMoRa();
		for (const c of chuNguoiDoc()) chu.add(c);
		await act(async () => {
			goc.unmount();
		});
		return { chu, loi: null };
	} catch (e) {
		return { chu: new Set(), loi: (e as Error).message.slice(0, 200) };
	} finally {
		console.error = im;
	}
}

const CA_RIENG: Record<string, Record<string, unknown>[]> = {
	"packages/ui/src/components/combobox.tsx": [
		{
			options: [{ value: "a", label: "MUC" }],
			value: "",
			onValueChange: () => {},
		},
		{ options: [], value: "", onValueChange: () => {} },
	],
	"packages/ui/src/components/toggle-group.tsx": [{ type: "single" }],
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
};

const KHONG_PHAI_COMPONENT = [
	"apps/app/components/data-table/list-search-params.ts",
	"apps/app/lib/trpc/cache.ts",
];

type BanVe = {
	xuat: string;
	dong: string[];
	mo: string[];
	loi_dong: string | null;
	loi_mo: string | null;
};

async function laiMotFile(duongUi: string): Promise<BanVe[]> {
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
	let mod: Record<string, unknown>;
	try {
		mod = (await import(join(GOC_KHO, duongUi))) as Record<string, unknown>;
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
		const bo = CA_RIENG[duongUi] ?? [{}];
		const chuDong = new Set<string>();
		const chuMo = new Set<string>();
		let loiDong: string | null = null;
		let loiMo: string | null = null;
		for (const rieng of bo) {
			const dong = await ve(createElement(gt as never, rieng as never));
			const mo = await ve(
				createElement(gt as never, {
					...rieng,
					open: true,
					defaultOpen: true,
				} as never),
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

function ghi(ten: string, gt: unknown) {
	const duong = join(HO_SO, "evidence", ten);
	mkdirSync(dirname(duong), { recursive: true });
	writeFileSync(duong, `${JSON.stringify(gt, null, "\t")}\n`);
}

test("lai tung component ra man, doc chu ban ve that su ve", async () => {
	const macDinh = JSON.parse(
		readFileSync(join(HO_SO, "evidence", "mac-dinh.json"), "utf8"),
	) as { file: string }[];
	const file = [...new Set(macDinh.map((m) => m.file))].sort();
	expect(file.length).toBeGreaterThan(0);

	const banVe: Record<string, BanVe[]> = {};
	for (const f of file) banVe[f] = await laiMotFile(f);
	ghi("ve-that.json", banVe);

	const veDuoc = Object.values(banVe).flat().filter((b) => b.loi_dong === null);
	expect(veDuoc.length).toBeGreaterThan(0);
});

test("mo tung nguyen ban cua bang gioi han vong truoc", async () => {
	const bang = JSON.parse(readFileSync(BANG_CU, "utf8")) as {
		dong: { component: string; nguyen_ban: string[] }[];
	};
	const ra: Record<string, { chu: string[]; loi: string | null }> = {};
	for (const d of bang.dong) {
		const duong = `packages/ui/src/components/${d.component}`;
		const ban = await laiMotFile(duong);
		const chu = new Set<string>();
		let loi: string | null = ban.length === 0 ? "khong co xuat nao ve duoc" : null;
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
});
