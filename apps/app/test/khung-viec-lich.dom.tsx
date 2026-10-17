import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	mock,
	setSystemTime,
	test,
} from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, TRPCClientError, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { z } from "zod";

type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [khoa: string]: Json | undefined };
type DauVao = Json | undefined;

const traLoi = new Map<string, (input: DauVao) => Json | Promise<Json>>();
const daGoi: { path: string; input: DauVao }[] = [];

const linkGia: TRPCLink<AppRouter> =
	() =>
	({ op }) =>
		observable((nguoiXem) => {
			const vao: DauVao = JSON.parse(JSON.stringify(op.input ?? null));
			daGoi.push({ path: op.path, input: vao });
			const lay = traLoi.get(op.path);
			Promise.resolve()
				.then(() => (lay ? lay(vao) : null))
				.then(
					(data) => {
						nguoiXem.next({ result: { type: "data", data } });
						nguoiXem.complete();
					},
					(loi: Error) => nguoiXem.error(loi as never),
				);
			return () => {};
		});

const trpcClient = createTRPCClient<AppRouter>({ links: [linkGia] });
let queryClient = new QueryClient();
mock.module("@/lib/trpc/client", () => ({
	useTRPC: () =>
		createTRPCOptionsProxy<AppRouter>({ client: trpcClient, queryClient }),
}));
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () =>
		new Proxy({}, { get: () => async () => queryClient.invalidateQueries() }),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/viec",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("sonner", () => ({
	toast: { error: () => {}, success: () => {} },
}));

const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { viecMessages } = await import("@/lib/messages/viec");
const { dien } = await import("@/components/crm/record-sheet/plan-copy");
const { formatDay } = await import("@crm/ui/lib/format");

const V = viecMessages("vi");
const TZ = process.env.TZ ?? "local";
let san: { o: HTMLElement; root: Root } | null = null;

const vaoGoi = z.object({
	id: z.string().optional(),
	batDauNgay: z.string().nullable().optional(),
	duAnId: z.string().nullable().optional(),
	truocId: z.string().optional(),
	sauId: z.string().optional(),
});
const docVao = (vao: DauVao) => {
	const kq = vaoGoi.safeParse(vao);
	return kq.success ? kq.data : {};
};

beforeAll(() => {
	setSystemTime(new Date("2026-10-16T03:00:00.000Z"));
});

afterAll(() => {
	setSystemTime();
});

afterEach(async () => {
	if (san) {
		const { o, root } = san;
		await act(async () => root.unmount());
		o.remove();
	}
	san = null;
	traLoi.clear();
	daGoi.length = 0;
	document.body.innerHTML = "";
});

async function nhip(ms = 0) {
	await act(async () => {
		await new Promise((r) => setTimeout(r, ms));
	});
}

async function cho(dk: () => boolean, moTa: string) {
	for (let i = 0; i < 200; i += 1) {
		if (dk()) return;
		await nhip();
	}
	throw new Error(`het gio cho ${moTa}`);
}

async function bam(el: Element | null | undefined) {
	if (!el) throw new Error("khong co phan tu de bam");
	await act(async () => {
		el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
		el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
		(el as HTMLElement).click();
	});
	await nhip();
}

const chuCua = (el: Element | null | undefined) =>
	(el?.textContent ?? "").trim();

const nguoi = (id: string, name: string) => ({ id, name, image: null });

type Mau = {
	id?: string;
	tieuDe?: string;
	han?: string | null;
	batDau?: string | null;
	duAn?: { id: string; ten: string } | null;
	banGhi?: { loai: string; id: string; ten: string }[];
	phaiCho?: {
		id: string;
		tieuDe: string;
		batDauNgay: string;
		hanNgay: string;
	}[];
};

const chiTiet = (p: Mau) => ({
	id: p.id ?? "v1",
	tieuDe: p.tieuDe ?? "Chuẩn bị dữ liệu khách hàng",
	trangThai: "CHUA_LAM",
	hanNgay: p.han === undefined ? "2026-10-23" : p.han,
	batDauNgay: p.batDau ?? null,
	duAn: p.duAn ?? null,
	quaHan: false,
	nguoiGiao: nguoi("u-a", "Lê Quang Vinh"),
	nguoiThucHien: nguoi("u-b", "Phạm Thu Hà"),
	banGhi: p.banGhi ?? [],
	moTa: null,
	nguoiTheoDoi: [],
	phaiCho: p.phaiCho ?? [],
	coLichSu: true,
	quyen: {
		trangThai: ["DANG_LAM"],
		sua: true,
		doiNguoi: false,
		gan: true,
		theoDoiKhac: false,
		dangTheoDoi: false,
		xoa: false,
	},
});

const P = { id: "p1", ten: "Triển khai Ngân hàng A" };

const duAnDong = {
	...P,
	moTa: null,
	soViec: 3,
	soXong: 0,
	batDauSom: "2026-10-19",
	hanMuon: "2026-10-28",
	mocKe: null,
	taoBoi: { id: "u-a", name: "Lê Quang Vinh" },
	dong: false,
	coLichSu: true,
	quyen: { dong: true, xoa: false },
};

const thanh = (id: string, tieuDe: string) => ({
	id,
	tieuDe,
	chaId: null,
	batDau: "2026-10-19",
	han: "2026-10-21",
	nghia: "nhap",
	suaDuoc: true,
	phaiCho: [],
});

async function moKhung(du: () => Json, id = "v1") {
	traLoi.set("viec.get", du);
	traLoi.set("viec.lichSu", () => []);
	traLoi.set("viec.con", () => ({ conMo: 0, con: [] }));
	traLoi.set("onboarding.nguoiNhanViec", () => []);
	traLoi.set("users.me", () => nguoi("u-b", "Phạm Thu Hà"));
	traLoi.set("duAn.list", () => [duAnDong]);
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	san = { o, root };
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams={`?record=viec:${id}`}>
				<QueryClientProvider client={queryClient}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							<RecordSheetHost />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	await cho(
		() => document.querySelector("[data-o-bat-dau]") !== null,
		"khung viec",
	);
}

async function chonNgay(trigger: Element | null, ngay: string) {
	let o: Element | null = null;
	for (let lan = 0; lan < 5 && o === null; lan += 1) {
		await bam(trigger);
		for (let k = 0; k < 20 && o === null; k += 1) {
			await nhip(1);
			o = document.body.querySelector(`button[data-day="${ngay}"]`);
		}
	}
	await bam(o);
	await nhip(5);
}

const oBatDau = () =>
	document.querySelector('[data-o-bat-dau] [data-slot="date-picker-trigger"]');

const goiSua = () => daGoi.filter((g) => g.path === "viec.sua");

async function chonTrongCombobox(nhan: string, chon: string) {
	await bam(document.querySelector(`[aria-label="${nhan}"]`));
	await cho(
		() => document.querySelectorAll('[role="option"]').length > 0,
		`mo ${nhan}`,
	);
	const o = [...document.querySelectorAll('[role="option"]')].find((x) =>
		chuCua(x).includes(chon),
	);
	await bam(o);
}

const loiTrpc = (msg: string) =>
	new TRPCClientError(msg, {
		result: {
			error: {
				code: -32600,
				message: msg,
				data: { code: "BAD_REQUEST", httpStatus: 400 },
			},
		},
	});

describe("dg-man-ngay", () => {
	test("dg-man-ngay: ô Bắt đầu gửi ngày lịch, chặn sau hạn, hiện lại dd/mm, bằng hạn được", async () => {
		let du = chiTiet({});
		traLoi.set("viec.sua", (vao) => {
			du = chiTiet({ batDau: docVao(vao).batDauNgay ?? null });
			return du;
		});
		await moKhung(() => du);
		await chonNgay(oBatDau(), "2026-10-20");
		await cho(() => goiSua().length > 0, "goi sua");
		const gui = docVao(goiSua()[0]?.input).batDauNgay;
		if (gui !== "2026-10-20") throw new Error(`dg: ngay gui lech ${TZ} ${gui}`);
		await cho(
			() => chuCua(oBatDau()) === formatDay("2026-10-20", "vi"),
			"hien lai",
		);
		if (!chuCua(oBatDau()) === formatDay("2026-10-20", "vi")) {
			throw new Error(`dg: hien ngay lech ${TZ}`);
		}

		const truoc = goiSua().length;
		await chonNgay(oBatDau(), "2026-10-24");
		await nhip(10);
		const loi = chuCua(
			document.querySelector('[data-o-bat-dau] [data-slot="field-error"]'),
		);
		if (loi !== V.khung.batDauSauHan || goiSua().length !== truoc) {
			throw new Error("dg: bat dau sau han khong chan o man");
		}

		await chonNgay(oBatDau(), "2026-10-23");
		await cho(() => goiSua().length > truoc, "goi bang han");
		const coLoi = document.querySelector(
			'[data-o-bat-dau] [data-slot="field-error"]',
		);
		if (
			coLoi !== null ||
			docVao(goiSua().at(-1)?.input).batDauNgay !== "2026-10-23"
		) {
			throw new Error("dg: doi chung bang han man hong");
		}
		expect(goiSua().length).toBe(truoc + 1);
	});
});

describe("dg-man-khung", () => {
	test("dg-man-khung: ô Dự án, nói trước khi công khai việc riêng, đưa vào đúng một lần", async () => {
		traLoi.set("viec.doiDuAn", () => ({ ok: true }));
		await moKhung(() => chiTiet({}));
		const oDuAn = document.querySelector(`[aria-label="${V.khung.duAn}"]`);
		if (!oDuAn) throw new Error("dg: thieu o du an");
		await bam(oDuAn);
		await cho(
			() => document.querySelectorAll('[role="option"]').length > 0,
			"mo du an",
		);
		if (
			![...document.querySelectorAll('[role="option"]')].some((x) =>
				chuCua(x).includes(P.ten),
			)
		) {
			throw new Error("dg: thieu o du an");
		}
		const o = [...document.querySelectorAll('[role="option"]')].find((x) =>
			chuCua(x).includes(P.ten),
		);
		await bam(o);
		await cho(
			() =>
				document.querySelector('[role="alertdialog"]') !== null ||
				daGoi.some((g) => g.path === "viec.doiDuAn"),
			"hoi cong khai",
		);
		const hoi = chuCua(document.querySelector('[role="alertdialog"]'));
		if (
			!hoi.includes(V.khung.congKhaiThan) ||
			daGoi.some((g) => g.path === "viec.doiDuAn")
		) {
			throw new Error("dg: khong noi truoc khi cong khai");
		}
		await bam(
			[...document.querySelectorAll('[role="alertdialog"] button')].find(
				(b) => chuCua(b) === V.khung.congKhaiNut,
			),
		);
		await cho(
			() => daGoi.some((g) => g.path === "viec.doiDuAn"),
			"goi doi du an",
		);
		await nhip(10);
		const goi = daGoi.filter((g) => g.path === "viec.doiDuAn");
		if (
			goi.length !== 1 ||
			JSON.stringify(goi[0]?.input) !==
				JSON.stringify({ id: "v1", duAnId: "p1" })
		) {
			throw new Error("dg: doi du an goi sai");
		}
	});

	test("dg-man-khung: việc đã gắn thoả thuận không hỏi; mục Phải chờ chỉ ở việc trong dự án", async () => {
		traLoi.set("viec.doiDuAn", () => ({ ok: true }));
		await moKhung(() =>
			chiTiet({
				banGhi: [{ loai: "deal", id: "d1", ten: "Thoả thuận An Phát" }],
			}),
		);
		if (document.querySelector("[data-muc-phai-cho]") !== null) {
			throw new Error("dg: muc phai cho sai cho");
		}
		await chonTrongCombobox(V.khung.duAn, P.ten);
		await cho(() => daGoi.some((g) => g.path === "viec.doiDuAn"), "goi thang");
		if (document.querySelector('[role="alertdialog"]') !== null) {
			throw new Error("dg: noi truoc thua");
		}
	});

	test("dg-man-khung: việc trong dự án có mục Phải chờ", async () => {
		traLoi.set("duAn.lich", () => ({
			duAn: { ...P, moTa: null, dong: false, taoBoiId: "u-a" },
			viec: [thanh("v1", "Chuẩn bị dữ liệu khách hàng")],
			moc: [],
			lich: { ngayNghiTuan: [6, 7], ngayLe: [] },
		}));
		await moKhung(() => chiTiet({ duAn: P }));
		await cho(
			() => document.querySelector("[data-muc-phai-cho]") !== null,
			"muc phai cho",
		);
		if (document.querySelector("[data-muc-phai-cho]") === null) {
			throw new Error("dg: muc phai cho sai cho");
		}
	});
});

describe("dg-man-phai-cho", () => {
	const LICH = {
		duAn: { ...P, moTa: null, dong: false, taoBoiId: "u-a" },
		viec: [thanh("a", "A"), thanh("b", "B"), thanh("c", "C")],
		moc: [],
		lich: { ngayNghiTuan: [6, 7], ngayLe: [] },
	};

	test("dg-man-phai-cho: chọn đúng việc cùng dự án, tạo một lần, mục cập nhật, lỗi vòng hiện dưới ô", async () => {
		let daCho = false;
		const B = () =>
			chiTiet({
				id: "b",
				tieuDe: "B",
				duAn: P,
				phaiCho: daCho
					? [
							{
								id: "a",
								tieuDe: "A",
								batDauNgay: "2026-10-19",
								hanNgay: "2026-10-21",
							},
						]
					: [],
			});
		traLoi.set("duAn.lich", () => LICH);
		traLoi.set("duAn.phuThuocTao", () => {
			daCho = true;
			return { daDoi: [] };
		});
		await moKhung(B, "b");
		await cho(
			() => document.querySelector("[data-muc-phai-cho]") !== null,
			"muc",
		);
		await bam(document.querySelector(`[aria-label="${V.khung.themPhaiCho}"]`));
		await cho(
			() => document.querySelectorAll('[role="option"]').length > 0,
			"mo chon",
		);
		const chon = [...document.querySelectorAll('[role="option"]')].map((x) =>
			chuCua(x),
		);
		if (JSON.stringify(chon) !== JSON.stringify(["A", "C"])) {
			throw new Error(`dg: chon phai cho sai ${JSON.stringify(chon)}`);
		}
		await bam(
			[...document.querySelectorAll('[role="option"]')].find(
				(x) => chuCua(x) === "A",
			),
		);
		await cho(
			() => daGoi.some((g) => g.path === "duAn.phuThuocTao"),
			"goi tao",
		);
		await nhip(10);
		const goi = daGoi.filter((g) => g.path === "duAn.phuThuocTao");
		if (
			goi.length !== 1 ||
			JSON.stringify(goi[0]?.input) !==
				JSON.stringify({ truocId: "a", sauId: "b" })
		) {
			throw new Error("dg: them phai cho goi sai");
		}
		await cho(
			() => document.querySelector('[data-phai-cho="a"]') !== null,
			"muc cap nhat",
		);
		const tieuDe = chuCua(document.querySelector("[data-muc-phai-cho]"));
		if (!tieuDe.includes(dien(V.khung.phaiCho, { n: 1 }))) {
			throw new Error("dg: muc phai cho khong cap nhat");
		}
		if (
			document.querySelector(
				'[data-muc-phai-cho] [data-slot="field-error"]',
			) !== null
		) {
			throw new Error("dg: doi chung phai cho hong");
		}
	});

	test("dg-man-phai-cho: máy chủ báo vòng thì lời hiện dưới ô chọn", async () => {
		const LOI = "Phụ thuộc này tạo vòng: «B» → «A» → «B».";
		traLoi.set("duAn.lich", () => LICH);
		traLoi.set("duAn.phuThuocTao", () => {
			throw loiTrpc(LOI);
		});
		await moKhung(() => chiTiet({ id: "b", tieuDe: "B", duAn: P }), "b");
		await cho(
			() => document.querySelector("[data-muc-phai-cho]") !== null,
			"muc",
		);
		await chonTrongCombobox(V.khung.themPhaiCho, "A");
		await cho(
			() =>
				document.querySelector(
					'[data-muc-phai-cho] [data-slot="field-error"]',
				) !== null,
			"loi vong",
		);
		const loi = chuCua(
			document.querySelector('[data-muc-phai-cho] [data-slot="field-error"]'),
		);
		if (loi !== LOI) throw new Error("dg: loi vong khong hien");
	});
});
