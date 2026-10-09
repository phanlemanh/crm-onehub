import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, type ReactElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type ZaloCuaToi,
	zaloCuaToiOutput,
} from "../../api/src/zalo/zalo.contracts";

type DauVao = { channel?: string } | undefined;
type LoiGoi = { duong: string; dauVao: DauVao };
type Lay = (v: DauVao) => unknown;
type ChonMutation = {
	onMutate?: (v: DauVao) => void;
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
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}));

const { KhoiKenh } = await import(
	"@/app/(app)/[slug]/settings/notifications/khoi-kenh"
);
const { KhoiZalo } = await import(
	"@/app/(app)/[slug]/settings/notifications/khoi-zalo"
);
const { KetNoiZaloThan } = await import(
	"@/app/(app)/[slug]/settings/connections/zalo/ket-noi-zalo-than"
);
const { nhacQuaZaloMessages } = await import("@/lib/messages/nhac-qua-zalo");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

const t = nhacQuaZaloMessages("vi");

function quaJson(giaTri: ZaloCuaToi): unknown {
	return JSON.parse(JSON.stringify(giaTri));
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
	laTruongPhong: false,
	canNoiLai: false,
};

function cuaToi(thay: Partial<ZaloCuaToi>): unknown {
	return quaJson(zaloCuaToiOutput.parse({ ...GOC, ...thay }));
}

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

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
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 200; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi trang thai ${moTa} — noi dung: ${document.body.textContent?.slice(0, 400)}`,
	);
}

async function nghi(ms: number): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function bam(o: Element): Promise<void> {
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		]) {
			const Kieu = loai.startsWith("pointer") ? PointerEvent : MouseEvent;
			o.dispatchEvent(
				new Kieu(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				} as PointerEventInit),
			);
		}
	});
}

function nut(chu: string): HTMLElement {
	const tim = [
		...document.body.querySelectorAll<HTMLElement>("button, [role='radio']"),
	].find((b) => b.textContent?.trim() === chu);
	if (!tim) {
		throw new Error(
			`khong thay nut "${chu}" — cac nut: ${[...document.body.querySelectorAll("button, [role='radio']")].map((b) => b.textContent?.trim()).join(" | ")}`,
		);
	}
	return tim;
}

function coChu(chu: string): boolean {
	return document.body.textContent?.includes(chu) ?? false;
}

function soGoi(duong: string): number {
	return daGoi.filter((g) => g.duong === duong).length;
}

function dangChon(chu: string): boolean {
	const n = nut(chu);
	return (
		n.getAttribute("aria-checked") === "true" ||
		n.getAttribute("data-state") === "on"
	);
}

beforeEach(() => {
	daGoi = [];
	duLieu.clear();
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => {
			san.root.unmount();
		});
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("chon-kenh-man", () => {
	test("chon-kenh-man: truoc khi noi, Zalo va Slack khoa co ly do", async () => {
		dat("zalo.cuaToi", () => cuaToi({}));
		await mo(<KhoiKenh />);
		await cho(() => coChu(t.kenh.tieuDe) || coChu(t.kenh.auto), "khoi kenh");
		for (const ten of [t.kenh.zalo, t.kenh.slack]) {
			const n = nut(ten);
			expect(
				n.getAttribute("aria-disabled") === "true" ||
					n.hasAttribute("disabled"),
				`${ten} khoa`,
			).toBe(true);
			const lyDo = document.getElementById(
				n.getAttribute("aria-describedby") ?? "",
			);
			expect(lyDo?.textContent ?? "", `${ten} co ly do`).not.toBe("");
		}
	});

	test("chon-kenh-man: bam Tu dong gui dung mot loi goi mang AUTO", async () => {
		dat("zalo.cuaToi", () =>
			cuaToi({
				uuTien: "ZALO",
				zaloBat: false,
				slackDuoc: true,
				kenhSeDung: "slack",
				lech: true,
			}),
		);
		dat("zalo.luuUuTien", (v) => ({ channel: v?.channel }));
		await mo(<KhoiKenh />);
		await cho(() => coChu(t.kenh.auto), "khoi kenh");
		await bam(nut(t.kenh.auto));
		await cho(() => soGoi("zalo.luuUuTien") > 0, "loi goi luu");
		expect(
			daGoi.filter((g) => g.duong === "zalo.luuUuTien").map((g) => g.dauVao),
			"dung mot loi goi mang AUTO",
		).toEqual([{ channel: "AUTO" }]);
	});

	test("chon-kenh-man: mutation loi thi ve gia tri cu va hien loi", async () => {
		dat("zalo.cuaToi", () =>
			cuaToi({
				uuTien: "ZALO",
				zaloBat: false,
				slackDuoc: true,
				kenhSeDung: "slack",
				lech: true,
			}),
		);
		dat("zalo.luuUuTien", () => {
			throw new Error("mat ket noi");
		});
		await mo(<KhoiKenh />);
		await cho(() => coChu(t.kenh.auto), "khoi kenh");
		await bam(nut(t.kenh.auto));
		await cho(() => coChu(t.kenh.luuLoi), "dong loi");
		expect(dangChon(t.kenh.zalo), "loi thi ve gia tri cu").toBe(true);
		expect(dangChon(t.kenh.auto)).toBe(false);
	});

	test("chon-kenh-man: doi chung, mutation thanh cong thi khong co dong loi", async () => {
		let uuTien = "ZALO";
		dat("zalo.cuaToi", () =>
			cuaToi({
				uuTien: uuTien === "AUTO" ? "AUTO" : "ZALO",
				zaloBat: false,
				slackDuoc: true,
				kenhSeDung: "slack",
				lech: uuTien !== "AUTO",
			}),
		);
		dat("zalo.luuUuTien", (v) => {
			uuTien = v?.channel ?? uuTien;
			return { channel: uuTien };
		});
		await mo(<KhoiKenh />);
		await cho(() => coChu(t.kenh.auto), "khoi kenh");
		await bam(nut(t.kenh.auto));
		await cho(() => soGoi("zalo.luuUuTien") > 0, "loi goi luu");
		await nghi(20);
		expect(coChu(t.kenh.luuLoi)).toBe(false);
		expect(dangChon(t.kenh.auto)).toBe(true);
	});
});

describe("trang-thai-man", () => {
	const NGUOI = [
		{ id: "1", ten: "An", tenZalo: "An Zalo" },
		{ id: "2", ten: "Binh", tenZalo: "Binh Zalo" },
		{ id: "3", ten: "Chi", tenZalo: "Chi Zalo" },
		{ id: "4", ten: "Dung", tenZalo: null },
		{ id: "5", ten: "Em", tenZalo: null },
		{ id: "6", ten: "Giang", tenZalo: null },
		{ id: "7", ten: "Hoa", tenZalo: null },
	];

	async function ketNoi(im: boolean) {
		await mo(
			<KetNoiZaloThan
				locale="vi"
				hrefThongBao="/ws/settings/notifications"
				du={{
					bat: true,
					tenBot: "bot.OneHub",
					pollCuoi: "23/09 09:14",
					im,
					daNoi: 3,
					tong: 7,
					nguoi: NGUOI,
					canManage: false,
					nguonToken: "env",
					goiToken: null,
					webhook: "da-dang-ky",
				}}
			/>,
		);
	}

	test("trang-thai-man: trang ket noi hien 3/7, ten bot, canh bao im", async () => {
		await ketNoi(true);
		expect(coChu(t.ketNoi.daNoiSo("3", "7")), "hien 3/7").toBe(true);
		expect(coChu("bot.OneHub"), "hien ten bot").toBe(true);
		expect(
			coChu(t.ketNoi.imTieuDe("23/09 09:14")),
			"bot im phai hien canh bao",
		).toBe(true);
	});

	test("trang-thai-man: doi chung, bot khong im thi khong canh bao", async () => {
		await ketNoi(false);
		expect(coChu(t.ketNoi.imTieuDe("23/09 09:14"))).toBe(false);
	});

	test("trang-thai-man: trang ca nhan hien canh bao lech khi lech", async () => {
		dat("zalo.cuaToi", () =>
			cuaToi({
				lienKet: { loai: "da-noi", tenZalo: "Manh Zalo" },
				uuTien: "SLACK",
				zaloDuoc: true,
				kenhSeDung: "zalo",
				lech: true,
			}),
		);
		await mo(<KhoiKenh />);
		await cho(() => coChu(t.kenh.auto), "khoi kenh");
		expect(coChu(t.kenh.lechQuaZalo), "lech thi canh bao").toBe(true);
	});

	test("trang-thai-man: doi chung, khong lech thi khong canh bao", async () => {
		dat("zalo.cuaToi", () =>
			cuaToi({
				lienKet: { loai: "da-noi", tenZalo: "Manh Zalo" },
				zaloDuoc: true,
				kenhSeDung: "zalo",
			}),
		);
		await mo(<KhoiKenh />);
		await cho(() => coChu(t.kenh.auto), "khoi kenh");
		expect(coChu(t.kenh.lechQuaZalo)).toBe(false);
		expect(coChu(t.kenh.lechQuaSlack)).toBe(false);
	});

	test("trang-thai-man: ten Zalo nam trong phan tu translate=no", async () => {
		dat("zalo.cuaToi", () =>
			cuaToi({
				lienKet: { loai: "da-noi", tenZalo: "Manh Zalo" },
				zaloDuoc: true,
				kenhSeDung: "zalo",
			}),
		);
		await mo(<KhoiZalo />);
		await cho(() => coChu("Manh Zalo"), "ten Zalo");
		const phanTu = [...document.body.querySelectorAll("[translate='no']")];
		expect(phanTu.some((p) => p.textContent === "Manh Zalo")).toBe(true);
	});
});

describe("nut-noi", () => {
	test("nut-noi: bam Nối Zalo goi tao ma dung mot lan", async () => {
		dat("zalo.cuaToi", () => cuaToi({}));
		dat("zalo.taoMa", () => ({
			ma: "482913",
			expiresAt: new Date().toISOString(),
		}));
		await mo(<KhoiZalo />);
		await cho(() => coChu(t.khoiZalo.noi), "nut noi");
		await bam(nut(t.khoiZalo.noi));
		await cho(() => soGoi("zalo.taoMa") > 0, "loi goi tao ma");
		expect(
			{ taoMa: soGoi("zalo.taoMa"), go: soGoi("zalo.go") },
			"Nối Zalo goi tao ma",
		).toEqual({ taoMa: 1, go: 0 });
	});

	test("nut-noi: ma het han, bam Tạo mã mới goi tao ma dung mot lan", async () => {
		dat("zalo.cuaToi", () => cuaToi({ lienKet: { loai: "ma-het-han" } }));
		dat("zalo.taoMa", () => ({
			ma: "482913",
			expiresAt: new Date().toISOString(),
		}));
		await mo(<KhoiZalo />);
		await cho(() => coChu(t.khoiZalo.taoMaMoi), "nut tao ma moi");
		await bam(nut(t.khoiZalo.taoMaMoi));
		await cho(() => soGoi("zalo.taoMa") > 0, "loi goi tao ma");
		expect(soGoi("zalo.taoMa")).toBe(1);
	});

	test("nut-noi: doi chung, khong bam thi khong goi", async () => {
		dat("zalo.cuaToi", () => cuaToi({}));
		await mo(<KhoiZalo />);
		await cho(() => coChu(t.khoiZalo.noi), "nut noi");
		await nghi(20);
		expect(soGoi("zalo.taoMa")).toBe(0);
	});
});

describe("go-xac-nhan", () => {
	async function moDaNoi(uuTien: "ZALO" | "SLACK") {
		dat("zalo.cuaToi", () =>
			cuaToi({
				lienKet: { loai: "da-noi", tenZalo: "Manh Zalo" },
				uuTien,
				zaloDuoc: true,
				slackDuoc: true,
				kenhSeDung: uuTien === "ZALO" ? "zalo" : "slack",
			}),
		);
		dat("zalo.go", () => ({ ok: true }));
		await mo(<KhoiZalo />);
		await cho(() => coChu(t.khoiZalo.go), "nut go");
		await bam(nut(t.khoiZalo.go));
		await cho(() => coChu(t.khoiZalo.goTieuDe), "hop xac nhan");
	}

	test("go-xac-nhan: dong hop khong xac nhan thi khong goi go", async () => {
		await moDaNoi("ZALO");
		await bam(nut(t.khoiZalo.goGiu));
		await nghi(20);
		expect(soGoi("zalo.go"), "go phai qua xac nhan").toBe(0);
	});

	test("go-xac-nhan: xac nhan thi goi go dung mot lan", async () => {
		await moDaNoi("ZALO");
		await bam(nut(t.khoiZalo.goXacNhan));
		await cho(() => soGoi("zalo.go") > 0, "loi goi go");
		expect(soGoi("zalo.go")).toBe(1);
	});

	test("go-xac-nhan: uu tien ZALO thi hop noi tin se ve Slack", async () => {
		await moDaNoi("ZALO");
		expect(coChu(t.khoiZalo.goVeSlack)).toBe(true);
	});

	test("go-xac-nhan: doi chung, uu tien SLACK thi hop khong noi ve Slack", async () => {
		await moDaNoi("SLACK");
		expect(coChu(t.khoiZalo.goVeSlack)).toBe(false);
		expect(coChu(t.khoiZalo.goThuong)).toBe(true);
	});
});

describe("lam-moi", () => {
	const HET_HAN = new Date(Date.now() + 60_000).toISOString();

	test("lam-moi: ma cho thi lam moi, da noi thi thoi", async () => {
		let lan = 0;
		dat("zalo.cuaToi", () => {
			lan += 1;
			return cuaToi(
				lan < 3
					? { lienKet: { loai: "ma-cho", expiresAt: new Date(HET_HAN) } }
					: {
							lienKet: { loai: "da-noi", tenZalo: "Manh Zalo" },
							zaloDuoc: true,
						},
			);
		});
		await mo(<KhoiZalo khoangLamMoiMs={15} />);
		await cho(() => coChu(t.khoiZalo.daNoi), "da noi sau khi lam moi");
		const khiNoi = soGoi("zalo.cuaToi");
		expect(khiNoi, "da lam moi it nhat hai lan").toBeGreaterThanOrEqual(3);
		await nghi(80);
		expect(soGoi("zalo.cuaToi"), "da noi thi thoi lam moi").toBe(khiNoi);
	});

	test("lam-moi: doi chung, da noi tu dau thi khong lam moi", async () => {
		dat("zalo.cuaToi", () =>
			cuaToi({
				lienKet: { loai: "da-noi", tenZalo: "Manh Zalo" },
				zaloDuoc: true,
			}),
		);
		await mo(<KhoiZalo khoangLamMoiMs={15} />);
		await cho(() => coChu(t.khoiZalo.daNoi), "da noi");
		await nghi(80);
		expect(soGoi("zalo.cuaToi")).toBe(1);
	});
});
