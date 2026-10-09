import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type ZaloCuaToi,
	zaloCuaToiOutput,
} from "../../api/src/zalo/zalo.contracts";

type DauVao = undefined;
type Lay = () => unknown;
type ChonMutation = {
	onMutate?: (v: DauVao) => void;
	onSuccess?: (kq: never, v: DauVao) => void;
	onError?: (e: Error) => void;
};

let daGoi: string[] = [];
const duLieu = new Map<string, Lay>();

function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

function thuTuc(duong: string) {
	const doc = async (): Promise<unknown> => {
		daGoi.push(duong);
		const lay = duLieu.get(duong);
		return lay ? lay() : null;
	};
	return {
		queryKey: () => [duong],
		pathKey: () => [duong],
		queryOptions: () => ({ queryKey: [duong], queryFn: async () => doc() }),
		mutationOptions: (chon?: ChonMutation) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async () => (await doc()) ?? { ok: true },
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

const { KhoiZalo } = await import(
	"@/app/(app)/[slug]/settings/notifications/khoi-zalo"
);
const { nhacQuaZaloMessages } = await import("@/lib/messages/nhac-qua-zalo");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

type NgonNgu = "vi" | "en";

const DA_NOI: ZaloCuaToi = {
	zaloBat: true,
	tenBot: "bot.OneHub",
	lienKet: { loai: "da-noi", tenZalo: "Manh Zalo" },
	uuTien: "ZALO",
	zaloDuoc: true,
	slackDuoc: false,
	kenhSeDung: "zalo",
	lech: false,
	dongTroLyOkr: true,
	laTruongPhong: false,
	canNoiLai: false,
};

const CAU_API = "Zalo chưa nhận tin thử. Thử lại sau ít phút.";

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(man: ReactElement, ngonNgu: NgonNgu): Promise<void> {
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

async function bam(chu: string): Promise<void> {
	const nut = [...document.body.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
	if (!nut) throw new Error(`khong thay nut "${chu}"`);
	await act(async () => {
		nut.click();
	});
}

function canhBao(): string[] {
	return [...document.body.querySelectorAll("[role='alert']")].map(
		(p) => p.textContent ?? "",
	);
}

async function moDaNoi(ngonNgu: NgonNgu): Promise<void> {
	dat("zalo.cuaToi", () =>
		JSON.parse(JSON.stringify(zaloCuaToiOutput.parse(DA_NOI))),
	);
	await mo(<KhoiZalo />, ngonNgu);
	const t = nhacQuaZaloMessages(ngonNgu).khoiZalo;
	await cho(
		() => document.body.textContent?.includes(t.guiThu) ?? false,
		"nut gui thu",
	);
}

beforeEach(() => {
	daGoi = [];
	duLieu.clear();
});

afterEach(async () => {
	for (const { o, root } of dangMo) {
		await act(async () => root.unmount());
		o.remove();
	}
	dangMo = [];
});

describe("man-gui-thu-loi", () => {
	test("man-gui-thu-loi: 1 loi co cau -> alert hien dung cau API", async () => {
		await moDaNoi("vi");
		dat("zalo.guiThu", () => {
			throw new Error(CAU_API);
		});
		await bam(nhacQuaZaloMessages("vi").khoiZalo.guiThu);
		await cho(() => canhBao().length > 0, "alert");
		expect(canhBao(), "man hien cau nguyen nhan cua API").toEqual([CAU_API]);
	});

	test("man-gui-thu-loi: 2 loi rong o vi -> alert hien cau cu tieng Viet", async () => {
		await moDaNoi("vi");
		dat("zalo.guiThu", () => {
			throw new Error("");
		});
		await bam(nhacQuaZaloMessages("vi").khoiZalo.guiThu);
		await cho(() => canhBao().length > 0, "alert");
		expect(canhBao(), "rong -> cau cu vi").toEqual([
			nhacQuaZaloMessages("vi").khoiZalo.guiThuLoi,
		]);
	});

	test("man-gui-thu-loi: 3 loi rong o en -> alert hien cau cu tieng Anh", async () => {
		await moDaNoi("en");
		dat("zalo.guiThu", () => {
			throw new Error("");
		});
		await bam(nhacQuaZaloMessages("en").khoiZalo.guiThu);
		await cho(() => canhBao().length > 0, "alert");
		expect(canhBao(), "rong -> cau cu en").toEqual([
			nhacQuaZaloMessages("en").khoiZalo.guiThuLoi,
		]);
	});

	test("man-gui-thu-loi: 4 bam lai va gui duoc -> het alert", async () => {
		await moDaNoi("vi");
		dat("zalo.guiThu", () => {
			throw new Error(CAU_API);
		});
		const t = nhacQuaZaloMessages("vi").khoiZalo;
		await bam(t.guiThu);
		await cho(() => canhBao().length > 0, "alert");
		dat("zalo.guiThu", () => ({ kenh: "zalo" }));
		await bam(t.guiThu);
		await cho(
			() => daGoi.filter((d) => d === "zalo.guiThu").length === 2,
			"lan goi thu hai",
		);
		await cho(() => canhBao().length === 0, "het alert");
		expect(canhBao(), "gui duoc -> het alert").toEqual([]);
	});
});
