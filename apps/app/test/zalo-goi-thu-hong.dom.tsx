import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { z } from "zod";
import type { zaloLuuBotOutput } from "../../api/src/zalo/zalo.contracts";

type DauVao = { token?: string } | undefined;
type ChonMutation = {
	onSuccess?: (kq: never, v: DauVao) => void;
	onError?: (e: Error) => void;
};
type LoaiToast = "success" | "warning" | "error" | "info";
type Toast = { loai: LoaiToast; chu: string };

type PhanHoiLuu = z.infer<typeof zaloLuuBotOutput>;

let phanHoi: PhanHoiLuu | null = null;
let toasts: Toast[] = [];
let soLamMoi = 0;
let soTaiLai = 0;

function thuTuc(duong: string) {
	return {
		queryKey: () => [duong],
		pathKey: () => [duong],
		mutationOptions: (chon?: ChonMutation) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async () => phanHoi,
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

function ghiToast(loai: LoaiToast) {
	return (chu: string) => {
		toasts.push({ loai, chu });
	};
}

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => trpcGia }));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		zalo: async () => {
			soLamMoi += 1;
		},
	}),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({
		refresh: () => {
			soTaiLai += 1;
		},
	}),
}));
mock.module("sonner", () => ({
	toast: {
		success: ghiToast("success"),
		warning: ghiToast("warning"),
		error: ghiToast("error"),
		info: ghiToast("info"),
	},
}));

const { OToken } = await import(
	"@/app/(app)/[slug]/settings/connections/zalo/o-token"
);
const { TrangThaiWebhookZalo } = await import(
	"@/app/(app)/[slug]/settings/connections/zalo/trang-thai-webhook"
);
const { nhacQuaZaloMessages } = await import("@/lib/messages/nhac-qua-zalo");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

type NgonNgu = "vi" | "en";
const NGON_NGU: NgonNgu[] = ["vi", "en"];
const TEN_MOI = "Bot Mới";
const TOKEN_DUNG_DANG = "4242:bot-moi";
const NUT_THEO_AC = { vi: "Đăng ký lại", en: "Sign up again" } satisfies Record<
	NgonNgu,
	string
>;

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(man: ReactElement, ngonNgu: NgonNgu): Promise<HTMLElement> {
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
	return o;
}

async function dong(): Promise<void> {
	for (const { o: vo, root } of dangMo) {
		await act(async () => root.unmount());
		vo.remove();
	}
	dangMo = [];
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

async function nhanNutDangKyLai(ngonNgu: NgonNgu): Promise<string> {
	const vo = await mo(
		<TrangThaiWebhookZalo trangThai="chua-dang-ky" canManage />,
		ngonNgu,
	);
	const nhan = vo.querySelector("button")?.textContent?.trim() ?? "";
	await dong();
	return nhan;
}

async function luuToken(vo: HTMLElement): Promise<void> {
	const o = vo.querySelector<HTMLInputElement>("input");
	const nut = vo.querySelector<HTMLButtonElement>("button[type='submit']");
	if (!o || !nut) throw new Error("khong thay o token hay nut luu");
	await act(async () => {
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			"value",
		)?.set?.call(o, TOKEN_DUNG_DANG);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
	await act(async () => {
		nut.form?.requestSubmit(nut);
	});
	await cho(() => toasts.length > 0 && soTaiLai > 0, "sau khi luu");
}

beforeEach(() => {
	phanHoi = null;
	toasts = [];
	soLamMoi = 0;
	soTaiLai = 0;
});

afterEach(dong);

describe("o-token-canh-bao", () => {
	for (const ngonNgu of NGON_NGU) {
		test(`o-token-canh-bao: (${ngonNgu}) goi thu hong -> mot canh bao goi ten bot va ten nut, o trong, lam moi, tai lai`, async () => {
			const nhanNut = await nhanNutDangKyLai(ngonNgu);
			phanHoi = { ketQua: "da-luu", tenBot: TEN_MOI, webhook: "zalo-tu-choi" };
			const vo = await mo(<OToken daBat goiToken="cuoi" />, ngonNgu);
			await luuToken(vo);
			const canhBao = toasts.filter((x) => x.loai === "warning");
			const cau = canhBao[0]?.chu ?? "";
			expect(
				{
					canhBao: canhBao.length,
					thanhCong: toasts.filter((x) => x.loai === "success").length,
				},
				"goi thu hong la canh bao, khong phai thanh cong",
			).toEqual({ canhBao: 1, thanhCong: 0 });
			expect(
				{
					nhanNutKhacRong: nhanNut.length > 0,
					coTenBot: cau.includes(TEN_MOI),
					coTenNut: cau.includes(nhanNut),
					coChuTheoAc: cau.includes(NUT_THEO_AC[ngonNgu]),
				},
				"cau canh bao phai goi ten nut Dang ky lai",
			).toEqual({
				nhanNutKhacRong: true,
				coTenBot: true,
				coTenNut: true,
				coChuTheoAc: true,
			});
			expect(
				{
					o: vo.querySelector<HTMLInputElement>("input")?.value ?? null,
					lamMoi: soLamMoi,
					taiLai: soTaiLai,
				},
				"luu roi thi o trong, lam moi va tai lai mot lan",
			).toEqual({ o: "", lamMoi: 1, taiLai: 1 });
		});
	}

	test("o-token-canh-bao: doi chung, goi thu duoc -> mot thanh cong Da bat, khong canh bao", async () => {
		phanHoi = { ketQua: "da-luu", tenBot: TEN_MOI, webhook: "da-dang-ky" };
		const vo = await mo(<OToken daBat goiToken="cuoi" />, "vi");
		await luuToken(vo);
		expect(toasts, "goi thu duoc la thanh cong").toEqual([
			{
				loai: "success",
				chu: nhacQuaZaloMessages("vi").ketNoi.daLuu(TEN_MOI),
			},
		]);
	});
});

async function bamDangKyLai(): Promise<void> {
	const vo = await mo(
		<TrangThaiWebhookZalo trangThai="chua-dang-ky" canManage />,
		"vi",
	);
	const nut = vo.querySelector("button");
	if (!nut) throw new Error("khong thay nut Dang ky lai");
	await act(async () => {
		nut.click();
	});
	await cho(() => toasts.length > 0 && soTaiLai > 0, "sau khi dang ky lai");
}

describe("dang-ky-lai-canh-bao", () => {
	const t = nhacQuaZaloMessages("vi").ketNoi;

	test("dang-ky-lai-canh-bao: van goi thu hong -> canh bao, khong bao da dang ky lai, tai lai", async () => {
		phanHoi = { ketQua: "da-luu", tenBot: TEN_MOI, webhook: "zalo-tu-choi" };
		await bamDangKyLai();
		expect(
			{
				canhBao: toasts.filter((x) => x.loai === "warning").length,
				thanhCong: toasts.filter((x) => x.loai === "success").length,
				baoDaDangKy: toasts.some((x) => x.chu === t.daDangKyLai),
				taiLai: soTaiLai,
			},
			"dang ky lai van hong khong bao da dang ky",
		).toEqual({ canhBao: 1, thanhCong: 0, baoDaDangKy: false, taiLai: 1 });
	});

	test("dang-ky-lai-canh-bao: doi chung, goi thu duoc -> Da dang ky nhan tin lai", async () => {
		phanHoi = { ketQua: "da-luu", tenBot: TEN_MOI, webhook: "da-dang-ky" };
		await bamDangKyLai();
		expect(toasts, "dang ky lai duoc thi bao thanh cong").toEqual([
			{ loai: "success", chu: t.daDangKyLai },
		]);
	});
});
