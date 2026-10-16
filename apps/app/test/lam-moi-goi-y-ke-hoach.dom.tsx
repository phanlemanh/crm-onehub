import { afterEach, describe, expect, mock, test } from "bun:test";
import type { ReactNode } from "react";
import { z } from "zod";

const { useCrmCache: cacheThat } = await import("@/lib/trpc/cache");
const { bam, cho, dat, dongHet, goiCua, mo, nhip, nutCo, trangThai } =
	await import("./khung-gop-y");
mock.module("@/lib/trpc/cache", () => ({ useCrmCache: cacheThat }));

const eveThat = await import("eve/react");
mock.module("eve/react", () => ({
	...eveThat,
	useEveAgent: () => ({
		status: "ready",
		error: undefined,
		data: { messages: [] },
		session: null,
		send: async () => {},
	}),
}));

const phienThat = await import("@/lib/agent-session");
mock.module("@/lib/agent-session", () => ({
	...phienThat,
	loadThread: () => new Promise(() => {}),
}));

globalThis.FormData = window.FormData;

const { act } = await import("react");
const { useQuery, useQueryClient } = await import("@tanstack/react-query");
const { useCrmCache } = await import("@/lib/trpc/cache");
const { useTRPC } = await import("@/lib/trpc/client");
const { DetailSheet } = await import("@/components/detail-sheet");
const { DealSheet } = await import("@/components/crm/record-sheet/deal-sheet");
const { recordSheetMessages } = await import("@/lib/messages/record-sheet");

const M = recordSheetMessages("vi").deal.goiYKeHoach;
const CONG_TY = "Cty Gợi Ý";
const TIEU_DE = M.tieuDe.replace("{congTy}", CONG_TY);
const TEN_DEAL = "Hợp đồng thép quý 4";
const MO = { id: "mo", label: "Đang mở" };
const THANG = { id: "thang", label: "Chốt được" };
const TUOI_MS = 30_000;
const vaoSetStage = z.object({ id: z.literal("d-1"), stage: z.string() });

const GOI_Y = {
	id: "gy-1",
	dealId: "d-1",
	companyId: "co-1",
	companyName: CONG_TY,
	nguoiNhanId: "u-1",
	sinhLuc: "2026-10-16T02:00:00.000Z",
};

const thoaThuanGia = (stage: string) => ({
	id: "d-1",
	name: TEN_DEAL,
	description: null,
	stage,
	currency: "VND",
	closedReason: null,
	company: { id: "co-1", name: CONG_TY, domain: null, iconUrl: null },
	owner: {
		id: "u-1",
		name: "Trần Minh Hải",
		email: "hai@onehub.vn",
		image: null,
	},
	fields: [],
	amountCents: null,
	baseAmountCents: null,
	reportingCurrency: "VND",
	fxRate: null,
	fxRateAt: null,
	stageChangedAt: "2026-10-16T02:00:00.000Z",
	expectedCloseDate: null,
	closedAt: stage === THANG.id ? "2026-10-16T02:00:00.000Z" : null,
	createdAt: "2026-09-01T00:00:00.000Z",
	archivedAt: null,
	contacts: [],
	archivedContacts: [],
});

function datNen(dau: string) {
	trangThai.daGoi = [];
	let stage = dau;
	const coGoiY = (s: string) => (s === THANG.id ? GOI_Y : null);
	dat("deals.byId", () => thoaThuanGia(stage));
	dat("deals.setStage", (vao) => {
		stage = vaoSetStage.parse(vao).stage;
		return { id: "d-1", stage, changed: true };
	});
	dat("onboarding.goiYCuaDeal", () => coGoiY(stage));
	dat("giaiDoan.list", () => ({
		canManage: true,
		tran: 20,
		stages: [
			{ ...MO, kind: "OPEN", position: 0, dealCount: 1 },
			{ ...THANG, kind: "WON", position: 0, dealCount: 0 },
		],
	}));
	dat("users.list", () => []);
	dat("users.me", () => ({ id: "u-1", name: "Trần Minh Hải" }));
	dat("onboarding.listTemplates", () => []);
	dat("onboarding.listDepartments", () => []);
	dat("onboarding.nguoiNhanViec", () => []);
	dat("conversations.list", () => []);
	dat("conversations.events", () => []);
}

function chot(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

function GiuTuoi({ children }: { children: ReactNode }) {
	useQueryClient().setDefaultOptions({
		queries: { retry: false, staleTime: TUOI_MS },
	});
	return children;
}

const the = () => document.querySelector("[data-goi-y-ke-hoach]");
const sheet = () =>
	[...document.querySelectorAll('[role="dialog"]')].find((d) =>
		d.textContent?.includes(TEN_DEAL),
	) ?? null;
const docGoiY = () =>
	goiCua("onboarding.goiYCuaDeal").filter((g) => g.dauVao?.dealId === "d-1")
		.length;
const goiSetStage = () => goiCua("deals.setStage");

async function moSheet() {
	await mo(
		<GiuTuoi>
			<DetailSheet open onOpenChange={() => {}}>
				<DealSheet dealId="d-1" />
			</DetailSheet>
		</GiuTuoi>,
	);
	await cho(
		() => document.body.textContent?.includes(TEN_DEAL) ?? false,
		"sheet deal tải xong",
	);
	await nhip(10);
}

async function bamCotThanh(nhan: string) {
	const thanh = document.querySelector('[data-slot="stage-stepper"]');
	const nut = thanh ? nutCo(nhan, thanh) : null;
	if (!nut) throw new Error(`khong thay cot "${nhan}" tren thanh giai doan`);
	await bam(nut);
}

async function chonTrenMenu(nhanHienTai: string, nhan: string) {
	const nutMenu = [
		...document.querySelectorAll<HTMLElement>('[aria-haspopup="menu"]'),
	].find((b) => b.textContent?.trim() === nhanHienTai);
	if (!nutMenu)
		throw new Error(`khong thay menu giai doan dang "${nhanHienTai}"`);
	await act(async () => {
		nutMenu.focus();
		nutMenu.dispatchEvent(
			new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
		);
	});
	await nhip(3);
	const muc = [
		...document.querySelectorAll<HTMLElement>('[role="menuitemradio"]'),
	].find((m) => m.textContent?.trim() === nhan);
	if (!muc) throw new Error(`khong thay muc "${nhan}" trong menu giai doan`);
	await bam(muc);
}

async function choToi(dk: () => boolean, nhip_ = 40): Promise<boolean> {
	for (let i = 0; i < nhip_; i += 1) {
		if (dk()) return true;
		await nhip();
	}
	return dk();
}

afterEach(async () => {
	await dongHet();
});

describe("gy-lm-stepper", () => {
	test("bấm cột Chốt được trên thanh giai đoạn thì thẻ hiện trong sheet đang mở", async () => {
		datNen(MO.id);
		await moSheet();
		chot(the() === null && sheet() !== null, "gy-lm: the hien truoc khi thang");
		const sheetTruoc = sheet();
		const docTruoc = docGoiY();
		await bamCotThanh(THANG.label);
		const hien = await choToi(
			() => the()?.textContent?.includes(TIEU_DE) === true,
		);
		chot(hien, "gy-lm: the khong hien sau thang stepper");
		const goi = goiSetStage();
		chot(
			goi.length === 1 &&
				JSON.stringify(goi[0]?.dauVao) ===
					JSON.stringify({ id: "d-1", stage: THANG.id }),
			"gy-lm: stepper khong goi setStage",
		);
		chot(docGoiY() > docTruoc, "gy-lm: khong doc lai goi y cua deal");
		chot(sheet() === sheetTruoc, "gy-lm: sheet dung lai");
		expect(the()?.textContent).toContain(TIEU_DE);
	});
});

describe("gy-lm-menu", () => {
	test("chọn Chốt được ở menu giai đoạn đầu sheet thì thẻ hiện", async () => {
		datNen(MO.id);
		await moSheet();
		chot(the() === null, "gy-lm: the hien truoc khi thang");
		await chonTrenMenu(MO.label, THANG.label);
		const hien = await choToi(
			() => the()?.textContent?.includes(TIEU_DE) === true,
		);
		chot(hien, "gy-lm: the khong hien sau thang menu");
		const goi = goiSetStage();
		chot(
			goi.length === 1 &&
				JSON.stringify(goi[0]?.dauVao) ===
					JSON.stringify({ id: "d-1", stage: THANG.id }),
			"gy-lm: menu khong goi setStage",
		);
		expect(the()).not.toBeNull();
	});
});

describe("gy-lm-roi", () => {
	test("đưa deal về Đang mở trên thanh giai đoạn thì thẻ mất", async () => {
		datNen(THANG.id);
		await moSheet();
		const coTruoc = await choToi(() => the() !== null);
		chot(coTruoc, "gy-lm: the khong hien truoc khi roi");
		await bamCotThanh(MO.label);
		const mat = await choToi(() => the() === null);
		chot(mat, "gy-lm: the con sau khi roi thang stepper");
		expect(the()).toBeNull();
	});

	test("đưa deal về Đang mở ở menu giai đoạn thì thẻ mất", async () => {
		datNen(THANG.id);
		await moSheet();
		const coTruoc = await choToi(() => the() !== null);
		chot(coTruoc, "gy-lm: the khong hien truoc khi roi");
		await chonTrenMenu(THANG.label, MO.label);
		const mat = await choToi(() => the() === null);
		chot(mat, "gy-lm: the con sau khi roi thang menu");
		expect(the()).toBeNull();
	});
});

type Goi = {
	ten: string;
	goi: (c: ReturnType<typeof useCrmCache>) => Promise<void>;
	d1: boolean;
	d2: boolean;
};

const MA_TRAN: Goi[] = [
	{ ten: "deal-d1", goi: (c) => c.deal("d-1"), d1: true, d2: false },
	{
		ten: "deal-d1-settle-record",
		goi: (c) => c.deal("d-1", { settle: "record" }),
		d1: true,
		d2: false,
	},
	{ ten: "deal-moi", goi: (c) => c.deal(), d1: true, d2: true },
];

let cacheDangGiu: ReturnType<typeof useCrmCache> | null = null;

function DocHaiDeal() {
	const trpc = useTRPC();
	cacheDangGiu = useCrmCache();
	useQuery({
		...trpc.onboarding.goiYCuaDeal.queryOptions({ dealId: "d-1" }),
		staleTime: TUOI_MS,
	});
	useQuery({
		...trpc.onboarding.goiYCuaDeal.queryOptions({ dealId: "d-2" }),
		staleTime: TUOI_MS,
	});
	return null;
}

const demDoc = (dealId: string) =>
	goiCua("onboarding.goiYCuaDeal").filter((g) => g.dauVao?.dealId === dealId)
		.length;

describe("gy-lm-cache", () => {
	test("cache.deal làm mới gợi ý đúng deal, trước khi lời gọi xong", async () => {
		let daChay = 0;
		for (const o of MA_TRAN) {
			trangThai.daGoi = [];
			dat("onboarding.goiYCuaDeal", () => null);
			await mo(<DocHaiDeal />);
			await cho(
				() => demDoc("d-1") === 1 && demDoc("d-2") === 1,
				"hai gợi ý đọc lần đầu",
			);
			const c = cacheDangGiu;
			if (!c) throw new Error("khong giu duoc useCrmCache");
			const truoc1 = demDoc("d-1");
			const truoc2 = demDoc("d-2");
			await act(async () => {
				await o.goi(c);
			});
			const len1 = demDoc("d-1") > truoc1;
			const len2 = demDoc("d-2") > truoc2;
			if (o.ten === "deal-d1")
				chot(len1, "gy-lm: cache.deal khong lam moi goi y d-1");
			if (o.ten === "deal-d1-settle-record")
				chot(len1, "gy-lm: settle record khong cho goi y");
			if (o.ten === "deal-moi")
				chot(len1 && len2, "gy-lm: cache.deal() khong lam moi moi goi y");
			if (!o.d2) chot(!len2, "gy-lm: lam moi goi y deal khac");
			expect([len1, len2]).toEqual([o.d1, o.d2]);
			daChay += 1;
			await dongHet();
		}
		chot(daChay === MA_TRAN.length, "gy-lm: ma tran thieu o");
		expect(daChay).toBe(3);
	});
});
