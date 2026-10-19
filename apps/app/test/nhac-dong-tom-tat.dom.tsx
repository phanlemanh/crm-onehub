import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type ZaloCuaToi,
	zaloCuaToiOutput,
} from "../../api/src/zalo/zalo.contracts";

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
type TuyChonGhi = {
	onSuccess?: (kq: Json, vao: DauVao) => void;
	onError?: (e: Error) => void;
};
type LoiGoi = { duong: string; dauVao: DauVao };
type Lay = (vao: DauVao) => unknown;

let daGoi: LoiGoi[] = [];
const duLieu = new Map<string, Lay>();

function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

function thuTuc(duong: string) {
	const doc = async (vao: DauVao): Promise<unknown> => {
		daGoi.push({ duong, dauVao: vao });
		const lay = duLieu.get(duong);
		return lay ? lay(vao) : null;
	};
	return {
		queryKey: () => [duong],
		pathKey: () => [duong],
		queryOptions: () => ({
			queryKey: [duong],
			queryFn: async () => doc(undefined),
		}),
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => (await doc(vao)) ?? { ok: true },
		}),
	};
}

const trpcGia = new Proxy(
	{},
	{
		get: (_goc, khong: string) =>
			new Proxy({}, { get: (_g, ten: string) => thuTuc(`${khong}.${ten}`) }),
	},
);

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ refresh: () => {} }),
}));

const { KhoiDongTroLyOkr } = await import(
	"@/app/(app)/[slug]/settings/notifications/khoi-kenh"
);
const { nhacQuaZaloMessages } = await import("@/lib/messages/nhac-qua-zalo");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

const t = nhacQuaZaloMessages("vi");

const DUONG_THIET_KE = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"docs",
	"superpowers",
	"specs",
	"2026-09-30-tro-ly-okr-tom-tat-design.md",
);

function idBangTrangThai(): string[] {
	const chu = readFileSync(DUONG_THIET_KE, "utf8");
	const dau = chu.indexOf("<<<UX-STATE-TABLE");
	const cuoi = chu.indexOf("UX-STATE-TABLE>>>");
	if (dau < 0 || cuoi < dau) throw new Error("khong thay bang UX-STATE-TABLE");
	return [...chu.slice(dau, cuoi).matchAll(/^\|\s*(ST-[a-z0-9-]+)\s*\|/gm)]
		.map((k) => k[1] ?? "")
		.filter((id) => id.startsWith("ST-nhac-dong-"));
}

const GOC: ZaloCuaToi = {
	zaloBat: true,
	tenBot: "bot.OneHub",
	lienKet: { loai: "chua-noi" },
	uuTien: "AUTO",
	zaloDuoc: false,
	slackDuoc: false,
	kenhSeDung: null,
	lech: false,
	dongTroLyOkr: true,
	laTruongPhong: true,
	canNoiLai: false,
};

function cuaToi(thay: Partial<ZaloCuaToi>): unknown {
	return JSON.parse(
		JSON.stringify(zaloCuaToiOutput.parse({ ...GOC, ...thay })),
	);
}

let dangMo: { o: HTMLElement; root: Root }[] = [];

beforeEach(() => {
	daGoi = [];
	duLieu.clear();
	dat("zalo.cuaToi", () => cuaToi({}));
	dat("zalo.luuDongTroLyOkr", (vao) => ({ bat: vao?.bat }));
});

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

async function nhip(lan = 1): Promise<void> {
	for (let i = 0; i < lan; i += 1) {
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
}

async function mo(man: ReactElement): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">{man}</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	dangMo.push({ o, root });
	await nhip(5);
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 150; vong += 1) {
		if (xong()) return;
		await nhip();
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 400)}`,
	);
}

function congTac(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>(
		'[data-cong-tac="dong-tom-tat"]',
	);
}

function chu(o: Element | null | undefined): string {
	return o?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function goiCua(duong: string): LoiGoi[] {
	return daGoi.filter((g) => g.duong === duong);
}

async function bamCongTac(): Promise<void> {
	const c = congTac();
	if (!c) throw new Error("khong co cong tac");
	await act(async () => c.click());
	await nhip(5);
}

const CA = {
	"ST-nhac-dong-tomtat": async () => {
		await mo(<KhoiDongTroLyOkr />);
		await cho(() => congTac() !== null, "cong tac");
		const khoi = document.body.querySelector(
			'[data-trang-thai="ST-nhac-dong-tomtat"]',
		);
		const tieuDe = khoi?.querySelector('[data-slot="card-title"]');
		expect(chu(tieuDe)).toBe("Kara · OKR");
		expect(khoi?.getAttribute("aria-labelledby")).toBe(tieuDe?.id ?? "");
		const field = khoi?.querySelector('[data-slot="field"]');
		expect(field?.getAttribute("data-orientation")).toBe("horizontal");
		const nhan = field?.querySelector('[data-slot="field-label"]');
		expect(chu(nhan)).toBe("Dòng Tóm tắt tuần của Kara");
		expect(nhan?.getAttribute("for")).toBe(congTac()?.id ?? "");
		expect(chu(field?.querySelector('[data-slot="field-description"]'))).toBe(
			"Mỗi tuần một dòng, khi phòng bạn có tóm tắt mới",
		);
		expect(congTac()?.getAttribute("role")).toBe("switch");
		expect(congTac()?.getAttribute("aria-checked")).toBe("true");
	},
} satisfies Record<string, () => Promise<void>>;

describe("trang-thai tu bang UX-STATE-TABLE", () => {
	const ids = idBangTrangThai();
	test("bang co trang thai ST-nhac-dong-tomtat", () => {
		expect(ids).toContain("ST-nhac-dong-tomtat");
	});
	for (const id of ids) {
		test(`trang-thai ${id}`, async () => {
			const ca = Object.entries(CA).find(([k]) => k === id)?.[1];
			if (!ca) throw new Error(`trang thai chua do: ${id}`);
			await ca();
		});
	}
});

describe("cong tac dong tom tat", () => {
	test("vang khi khong la truong phong", async () => {
		dat("zalo.cuaToi", () => cuaToi({ laTruongPhong: false }));
		await mo(<KhoiDongTroLyOkr />);
		await nhip(10);
		expect(goiCua("zalo.cuaToi").length).toBeGreaterThan(0);
		expect(congTac()).toBeNull();
		expect(document.body.textContent).not.toContain(t.troLy.dongTomTat);
	});

	test("bam khi dang bat goi mutation voi bat false, roi tat", async () => {
		await mo(<KhoiDongTroLyOkr />);
		await cho(() => congTac() !== null, "cong tac");
		await bamCongTac();
		await cho(() => goiCua("zalo.luuDongTroLyOkr").length === 1, "goi luu");
		expect(goiCua("zalo.luuDongTroLyOkr")[0]?.dauVao).toEqual({ bat: false });
		await cho(
			() => congTac()?.getAttribute("aria-checked") === "false",
			"da tat",
		);
	});

	test("bam khi dang tat goi mutation voi bat true", async () => {
		dat("zalo.cuaToi", () => cuaToi({ dongTroLyOkr: false }));
		await mo(<KhoiDongTroLyOkr />);
		await cho(() => congTac() !== null, "cong tac");
		expect(congTac()?.getAttribute("aria-checked")).toBe("false");
		await bamCongTac();
		await cho(() => goiCua("zalo.luuDongTroLyOkr").length === 1, "goi luu");
		expect(goiCua("zalo.luuDongTroLyOkr")[0]?.dauVao).toEqual({ bat: true });
		await cho(
			() => congTac()?.getAttribute("aria-checked") === "true",
			"da bat",
		);
	});

	test("luu hong thi ve gia tri cu va bao loi", async () => {
		dat("zalo.luuDongTroLyOkr", () => {
			throw new Error("hong");
		});
		await mo(<KhoiDongTroLyOkr />);
		await cho(() => congTac() !== null, "cong tac");
		await bamCongTac();
		await cho(
			() => document.body.querySelector('[role="alert"]') !== null,
			"bao loi",
		);
		expect(chu(document.body.querySelector('[role="alert"]'))).toBe(
			t.kenh.luuLoi,
		);
		expect(congTac()?.getAttribute("aria-checked")).toBe("true");
	});
});
