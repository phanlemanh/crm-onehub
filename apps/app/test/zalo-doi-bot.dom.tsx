import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { z } from "zod";
import type {
	zaloLuuBotInput,
	zaloLuuBotOutput,
} from "../../api/src/zalo/zalo.contracts";

type DauVao = z.infer<typeof zaloLuuBotInput>;
type PhanHoiLuu = z.infer<typeof zaloLuuBotOutput>;
type ChonMutation = {
	onSuccess?: (kq: never, v: DauVao) => void;
	onError?: (e: Error) => void;
};

let hang: PhanHoiLuu[] = [];
let goi: DauVao[] = [];

function thuTuc(duong: string) {
	return {
		queryKey: () => [duong],
		pathKey: () => [duong],
		mutationOptions: (chon?: ChonMutation) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (v: DauVao) => {
				goi.push(v);
				return hang.shift() ?? null;
			},
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

const imLang = () => {};

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ zalo: async () => {} }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ refresh: imLang }),
}));
mock.module("sonner", () => ({
	toast: { success: imLang, warning: imLang, error: imLang, info: imLang },
}));

const { OToken } = await import(
	"@/app/(app)/[slug]/settings/connections/zalo/o-token"
);
const { TrangThaiWebhookZalo } = await import(
	"@/app/(app)/[slug]/settings/connections/zalo/trang-thai-webhook"
);
const { nhacQuaZaloMessages } = await import("@/lib/messages/nhac-qua-zalo");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

const t = nhacQuaZaloMessages("vi").ketNoi;
const TEN_MOI = "Bot Mới";
const TOKEN = "222:bot-moi";
const HOI_DOI_BOT = {
	ketQua: "can-xac-nhan-doi-bot",
	soLienKet: 3,
	tenBotMoi: TEN_MOI,
} as const satisfies PhanHoiLuu;

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(man: ReactElement): Promise<HTMLElement> {
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
	return o;
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

const chuTrang = () => document.body.textContent ?? "";
const hopMo = () => chuTrang().includes(t.doiBotTieuDe);

function nutTen(ten: string): HTMLButtonElement[] {
	return [...document.body.querySelectorAll("button")].filter(
		(n) => n.textContent?.trim() === ten,
	);
}

async function bam(ten: string): Promise<void> {
	const [nut] = nutTen(ten);
	if (!nut) throw new Error(`khong thay nut ${ten}`);
	await act(async () => {
		nut.click();
	});
}

async function luuToken(vo: HTMLElement): Promise<void> {
	const o = vo.querySelector<HTMLInputElement>("input");
	const nut = vo.querySelector<HTMLButtonElement>("button[type='submit']");
	if (!o || !nut) throw new Error("khong thay o token hay nut luu");
	await act(async () => {
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			"value",
		)?.set?.call(o, TOKEN);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
	await act(async () => {
		nut.form?.requestSubmit(nut);
	});
}

beforeEach(() => {
	hang = [];
	goi = [];
});

afterEach(async () => {
	for (const { o, root } of dangMo) {
		await act(async () => root.unmount());
		o.remove();
	}
	dangMo = [];
});

describe("doi-bot-dom", () => {
	test("hỏi trước khi đổi bot: Huỷ không gọi gì, đồng ý gửi cờ xác nhận", async () => {
		hang = [
			HOI_DOI_BOT,
			HOI_DOI_BOT,
			{ tenBot: TEN_MOI, webhook: "da-dang-ky" },
		];
		const vo = await mo(<OToken daBat goiToken="cuoi" />);
		await luuToken(vo);
		await cho(hopMo, "hop xac nhan mo");
		expect([chuTrang().includes(TEN_MOI), chuTrang().includes("3")]).toEqual([
			true,
			true,
		]);
		await bam(t.doiBotThoi);
		await cho(() => !hopMo(), "hop xac nhan dong");
		expect(goi.length).toBe(1);

		await luuToken(vo);
		await cho(hopMo, "hop xac nhan mo lan hai");
		const truoc = goi.length;
		await bam(t.doiBotNut);
		await cho(() => goi.length > truoc, "goi sau khi dong y");
		const moi = goi.slice(truoc);
		if (moi.length !== 1 || moi[0]?.xacNhanDoiBot !== true)
			throw new Error("xac nhan khong gui co");
		expect(moi[0]?.token).toBe(TOKEN);
	});
});

describe("canh-bao-khoa", () => {
	test("khoá lệch hiện cảnh báo và một nút Đăng ký lại", async () => {
		hang = [{ tenBot: TEN_MOI, webhook: "da-dang-ky" }];
		await mo(<TrangThaiWebhookZalo trangThai="khoa-lech" canManage />);
		if (!chuTrang().includes(t.khoaLechTieuDe))
			throw new Error("khong co canh bao khoa lech");
		expect(chuTrang().includes(t.khoaLechMoTa)).toBe(true);
		expect(nutTen(t.dangKyLai).length).toBe(1);
		await bam(t.dangKyLai);
		await cho(() => goi.length > 0, "goi dang ky lai");
		expect(goi.length).toBe(1);

		document.body.innerHTML = "";
		dangMo = [];
		await mo(<TrangThaiWebhookZalo trangThai="da-dang-ky" canManage />);
		expect(chuTrang().includes(t.khoaLechTieuDe)).toBe(false);
	});
});
