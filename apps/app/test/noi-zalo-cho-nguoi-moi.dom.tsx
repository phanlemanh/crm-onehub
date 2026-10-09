import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type ZaloCuaToi,
	zaloCuaToiOutput,
} from "../../api/src/zalo/zalo.contracts";

type DauVao = { token?: string; channel?: string } | undefined;
type LoiGoi = { duong: string; dauVao: DauVao };
type Lay = (v: DauVao) => unknown;
type ChonMutation = {
	onSuccess?: (kq: never, v: DauVao) => void;
	onError?: (e: Error) => void;
};

let daGoi: LoiGoi[] = [];
const duLieu = new Map<string, Lay>();

function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

function thuTuc(duong: string) {
	const doc = async (v: DauVao): Promise<unknown> => {
		daGoi.push({ duong, dauVao: v });
		const lay = duLieu.get(duong);
		return lay ? lay(v) : null;
	};
	return {
		queryKey: () => [duong],
		pathKey: () => [duong],
		queryOptions: () => ({
			queryKey: [duong],
			queryFn: async () => doc(undefined),
		}),
		mutationOptions: (chon?: ChonMutation) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (v: DauVao) => (await doc(v)) ?? { ok: true },
		}),
	};
}

const trpcGia = new Proxy(
	{},
	{
		get: (_goc, khongGian: string) =>
			new Proxy(
				{},
				{ get: (_g, ten: string) => thuTuc(`${khongGian}.${ten}`) },
			),
	},
);

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => new Proxy({}, { get: () => async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ refresh: () => {} }),
}));
mock.module("next/link", () => ({
	default: ({ href, children }: { href: string; children: ReactNode }) => (
		<a href={href}>{children}</a>
	),
}));

const { OToken } = await import(
	"@/app/(app)/[slug]/settings/connections/zalo/o-token"
);
const { KetNoiZaloThan } = await import(
	"@/app/(app)/[slug]/settings/connections/zalo/ket-noi-zalo-than"
);
const { KhoiKenh } = await import(
	"@/app/(app)/[slug]/settings/notifications/khoi-kenh"
);
const { nhacQuaZaloMessages } = await import("@/lib/messages/nhac-qua-zalo");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

type NgonNgu = "vi" | "en";
type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(man: ReactElement, ngonNgu: NgonNgu = "vi"): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale={ngonNgu}>{man}</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	dangMo.push({ o, root });
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 200; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(`khong toi trang thai ${moTa}`);
}

function o(): HTMLInputElement {
	const tim = document.body.querySelector<HTMLInputElement>("input");
	if (!tim) throw new Error("khong thay o token");
	return tim;
}

function nutGui(): HTMLButtonElement {
	const tim = document.body.querySelector<HTMLButtonElement>(
		"button[type='submit']",
	);
	if (!tim) throw new Error("khong thay nut luu");
	return tim;
}

async function go(chu: string): Promise<void> {
	await act(async () => {
		const dauVao = o();
		const setter = Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			"value",
		)?.set;
		setter?.call(dauVao, chu);
		dauVao.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function gui(): Promise<void> {
	await act(async () => {
		nutGui().form?.requestSubmit(nutGui());
	});
}

function vungLoi(): string {
	return document.body.querySelector("[aria-live='polite']")?.textContent ?? "";
}

function soGoi(duong: string): number {
	return daGoi.filter((g) => g.duong === duong).length;
}

beforeEach(() => {
	daGoi = [];
	duLieu.clear();
});

afterEach(async () => {
	for (const { o: vo, root } of dangMo) {
		await act(async () => root.unmount());
		vo.remove();
	}
	dangMo = [];
});

const tVi = nhacQuaZaloMessages("vi").ketNoi;

describe("o-token", () => {
	test("o-token: 1 sai dang -> khong goi, loi trong aria-live, focus ve o, o giu chu", async () => {
		await mo(<OToken daBat={false} goiToken={null} />);
		await go("abc");
		await gui();
		expect(soGoi("zalo.luuBot"), "sai dang khong gui yeu cau").toBe(0);
		expect(vungLoi(), "loi trong vung aria-live").toContain(tVi.saiDang);
		expect(document.activeElement, "focus ve o").toBe(o());
		expect(o().value, "o giu chu").toBe("abc");
	});

	test("o-token: 2 dung dang ma API tu choi -> mot yeu cau, loi cua API, o giu chu", async () => {
		dat("zalo.luuBot", () => {
			throw new Error("Zalo không nhận token này.");
		});
		await mo(<OToken daBat={false} goiToken={null} />);
		await go("12345:abc");
		await gui();
		await cho(() => vungLoi() !== "", "hien loi API");
		expect(soGoi("zalo.luuBot")).toBe(1);
		expect(vungLoi()).toContain("Zalo không nhận token này.");
		expect(o().value).toBe("12345:abc");
		expect(document.activeElement, "focus ve o").toBe(o());
	});

	test("o-token: 3 trong luc cho -> nut Dang kiem va bi khoa", async () => {
		let xong: (v: { tenBot: string; webhook: string }) => void = () => {};
		dat(
			"zalo.luuBot",
			() =>
				new Promise((r) => {
					xong = r;
				}),
		);
		await mo(<OToken daBat={false} goiToken={null} />);
		await go("12345:abc");
		await gui();
		await cho(() => nutGui().disabled, "nut bi khoa");
		expect(nutGui().textContent).toContain(tVi.dangKiem);
		await act(async () =>
			xong({ tenBot: "Bot OneHub", webhook: "da-dang-ky" }),
		);
	});

	test("o-token: 4 o la mat khau, khong tu dien", async () => {
		await mo(<OToken daBat={false} goiToken={null} />);
		expect({
			type: o().getAttribute("type"),
			autocomplete: o().getAttribute("autocomplete"),
		}).toEqual({ type: "password", autocomplete: "off" });
	});

	test("o-token: doi chung, dung dang va API nhan -> khong loi", async () => {
		dat("zalo.luuBot", () => ({ tenBot: "Bot OneHub", webhook: "da-dang-ky" }));
		await mo(<OToken daBat={false} goiToken={null} />);
		await go("12345:abc");
		await gui();
		await cho(() => soGoi("zalo.luuBot") === 1, "da gui");
		expect(vungLoi()).toBe("");
		expect(daGoi[0]?.dauVao).toEqual({ token: "12345:abc" });
	});
});

const NGUOI = [
	{ id: "1", ten: "An", tenZalo: "An Zalo" },
	{ id: "2", ten: "Dung", tenZalo: null },
];

function duKetNoi(bat: boolean) {
	return {
		bat,
		tenBot: "Bot OneHub",
		pollCuoi: null,
		im: false,
		daNoi: 1,
		tong: 2,
		nguoi: NGUOI,
		canManage: true,
		nguonToken: bat ? ("man-hinh" as const) : null,
		goiToken: bat ? "wxyz" : null,
		webhook: "da-dang-ky" as const,
	};
}

describe("chu-man", () => {
	test("chu-man: trang ket noi, nhan trang thai khong bi co be rong co dinh", async () => {
		await mo(
			<KetNoiZaloThan
				locale="vi"
				hrefThongBao="/ws/settings/notifications"
				du={duKetNoi(true)}
			/>,
		);
		expect(
			document.body.querySelectorAll(".w-20").length,
			"nhan trang thai khong bi cat",
		).toBe(0);
	});

	for (const ngonNgu of ["vi", "en"] as const) {
		test(`chu-man: huong dan tao bot (${ngonNgu}) khong chi .env hay bot.zaloplatforms.com`, async () => {
			await mo(
				<KetNoiZaloThan
					locale={ngonNgu}
					hrefThongBao="/ws/settings/notifications"
					du={duKetNoi(false)}
				/>,
				ngonNgu,
			);
			const chu = document.body.textContent ?? "";
			expect(chu).toContain("Zalo Bot Manager");
			expect(chu.includes(".env"), "khong chi .env").toBe(false);
			expect(chu.includes("bot.zaloplatforms.com")).toBe(false);
		});
	}

	const GOC: ZaloCuaToi = {
		zaloBat: true,
		tenBot: "Bot OneHub",
		lienKet: { loai: "chua-noi" },
		uuTien: "AUTO",
		zaloDuoc: false,
		slackDuoc: false,
		kenhSeDung: null,
		lech: false,
		dongTroLyOkr: true,
		laTruongPhong: false,
		canNoiLai: false,
	};

	const LY_DO: [string, Partial<ZaloCuaToi>][] = [
		["zalo-tat", { zaloBat: false }],
		["zalo-chua-noi", {}],
		[
			"slack-chua-khop",
			{ zaloDuoc: true, lienKet: { loai: "da-noi", tenZalo: "Z" } },
		],
	];

	test("chu-man: khoi kenh, 2 ngon ngu x 3 ly do, dong ly do khong lap ten kenh", async () => {
		const thucTe: Record<string, string> = {};
		for (const ngonNgu of ["vi", "en"] as const) {
			for (const [ten, thay] of LY_DO) {
				dat("zalo.cuaToi", () =>
					JSON.parse(
						JSON.stringify(zaloCuaToiOutput.parse({ ...GOC, ...thay })),
					),
				);
				await mo(<KhoiKenh />, ngonNgu);
				await cho(
					() => document.body.querySelectorAll("li").length > 0,
					`ly do ${ten}`,
				);
				const dong = [...document.body.querySelectorAll("li")]
					.map((li) => li.textContent ?? "")
					.find((d) =>
						ten.startsWith("slack")
							? d.startsWith("Slack")
							: d.startsWith("Zalo"),
					);
				thucTe[`${ngonNgu}/${ten}`] = dong ?? "(khong co dong)";
				for (const { o: vo, root } of dangMo) {
					await act(async () => root.unmount());
					vo.remove();
				}
				dangMo = [];
			}
		}
		console.table(thucTe);
		const lap = Object.entries(thucTe).filter(([, d]) =>
			/^(Zalo|Slack): \1/.test(d),
		);
		expect(Object.keys(thucTe).length, "du 6 o").toBe(6);
		expect(lap, "khong lap ten kenh").toEqual([]);
	});
});
