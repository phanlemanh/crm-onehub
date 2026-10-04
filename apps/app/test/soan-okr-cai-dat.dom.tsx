import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { OkrProgramSua } from "@crm/validation/okr-chuong-trinh";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	AiChiTieuOutput,
	SoDoNac,
	TroLySoDoOutput,
} from "../../api/src/okr/okr.contracts";

let coQuyen: boolean;
let aiOn: boolean;
let choSo: Promise<void>;
let loiSo: boolean;
let chuaGan: number;
let rong: boolean;
let sanSang: AiChiTieuOutput["sanSang"];
let doiSoat: AiChiTieuOutput["doiSoat"];
let cauHinh: OkrProgramSua;

const chuongTrinh = () => ({
	objectiveCap: 5,
	krCap: 5,
	capMode: "canh-bao",
	scoreScale: "0-1",
	weightsOn: false,
	personalOn: false,
	aiOn,
	aiDeXuatPhamVi: "tat",
	aiDeXuatDonVi: [],
	aiTomTatPhamVi: "tat",
	aiTomTatDonVi: [],
	aiDeXuatAnPhamVi: "tat",
	aiDeXuatAnDonVi: [],
	aiTomTatAnPhamVi: "tat",
	aiTomTatAnDonVi: [],
	aiSoanPhamVi: "tat",
	aiSoanDonVi: [],
	aiSoanAnPhamVi: "tat",
	aiSoanAnDonVi: [],
	aiTranThangUsd: 9,
	aiTranThangDatOkrUsd: null,
	...cauHinh,
	version: 4,
	canManage: coQuyen,
});

const nacRong = (): SoDoNac => ({
	soLuot: 0,
	sinhRa: 0,
	daHien: 0,
	nhan: 0,
	sua: 0,
	bac: 0,
	boQua: 0,
	tyLeNhan: null,
	tyLeSua: null,
	tyLeBac: null,
	tyLeBoQua: null,
	tyLeDuocNhan: null,
	daNhan: 0,
	hoanTac: 0,
	tyLeHoanTac: null,
	soLuotDo: 0,
	p50Ms: null,
	p90Ms: null,
	tongCau: 0,
	biLoai: 0,
	tyLeBiLoai: null,
	theoMa: [],
	tienUsd: 0,
	chiPhiMoiNhanUsd: null,
	chiPhiMoiLuotUsd: null,
});

const soDo = (): TroLySoDoOutput => ({
	thang: "2026-09",
	bat: nacRong(),
	an: nacRong(),
});

const NHOM = [
	["nghien-cuu-danh-ba", 5.84],
	["tro-ly-ai", 1.93],
	["hoi-crm-zalo", 2.71],
	["tac-nhan", 0.64],
	["tro-ly-okr", 2.42],
] as const;

const chiTieu = (): AiChiTieuOutput => {
	if (loiSo) throw new Error("so hong");
	const theoNhom = [
		...NHOM.map(([nhom, usd]) => ({
			nhom,
			soBuoc: rong ? 0 : 10,
			usd: rong ? 0 : usd,
		})),
		{ nhom: "chua-gan" as const, soBuoc: chuaGan > 0 ? 1 : 0, usd: chuaGan },
	];
	return {
		thang: "2026-09",
		theoNhom,
		tongUsd: theoNhom.reduce((s, n) => s + n.usd, 0),
		troLyOkr: { chiUsd: rong ? 0 : 2.42, tranUsd: 9, phanTram: rong ? 0 : 27 },
		sanSang,
		nguonKhoa: null,
		dangKiem: false,
		doiSoat,
	};
};

const CAY = {
	divisions: [
		{
			id: "bp-kd",
			name: "Khối Kinh doanh",
			position: 0,
			head: null,
			departments: [
				{ id: "pb-mk", name: "Phòng Marketing", position: 0, head: null },
			],
		},
	],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [],
	archived: { divisions: [], departments: [] },
	coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
};

type DauVao = OkrProgramSua | undefined;
let daGoi: { duong: string; dauVao: DauVao }[] = [];
let daDoc: string[] = [];
let daLamMoi = 0;

function thuTuc<TRa>(duong: string, doc: () => TRa = () => null as TRa) {
	return {
		queryKey: () => [duong],
		pathKey: () => [duong],
		queryOptions: () => ({
			queryKey: [duong],
			queryFn: async () => {
				daDoc.push(duong);
				if (duong === "okr.aiChiTieu") await choSo;
				return doc();
			},
		}),
		mutationOptions: (chon?: {
			onSuccess?: () => void;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => {
				daGoi.push({ duong, dauVao: vao });
				return { ok: true };
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			program: thuTuc("okr.program", chuongTrinh),
			aiChiTieu: thuTuc("okr.aiChiTieu", chiTieu),
			setProgram: thuTuc("okr.setProgram"),
			troLySoDo: thuTuc("okr.troLySoDo", soDo),
			troLyAn: thuTuc("okr.troLyAn", () => ({ thang: "2026-09", luot: [] })),
			cycles: thuTuc("okr.cycles", () => ({ cycles: [], currentId: null })),
			soanSoDo: thuTuc("okr.soanSoDo"),
			soanAn: thuTuc("okr.soanAn"),
		},
		org: { tree: thuTuc("org.tree", () => CAY) },
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		okr: async () => {
			daLamMoi += 1;
		},
	}),
}));

mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/settings/okr",
}));

const { KhoiTroLyOkr } = await import(
	"@/app/(app)/[slug]/settings/okr/khoi-tro-ly-okr"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { troLyOkrMessages } = await import("@/lib/messages/tro-ly-okr");

const m = troLyOkrMessages("vi");

type San = { o: HTMLElement; root: Root; client: QueryClient };
let dangMo: San[] = [];

async function mo(): Promise<QueryClient> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							<KhoiTroLyOkr />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root, client });
	return client;
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 600)}`,
	);
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

async function go(o: Element | null, chu: string): Promise<void> {
	if (!(o instanceof HTMLInputElement)) throw new Error("khong phai o nhap");
	const dat = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function chonLuaChon(trigger: Element, chu: string): Promise<void> {
	await bam(trigger);
	await cho(
		() => document.body.querySelectorAll('[role="option"]').length > 0,
		`mo o chon ${chu}`,
	);
	const lua = [...document.body.querySelectorAll('[role="option"]')].find(
		(o) => o.textContent?.trim() === chu,
	);
	if (!lua) throw new Error(`khong co lua chon ${chu}`);
	await act(async () => {
		lua.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
				cancelable: true,
			}),
		);
	});
}

const q = (chon: string) => document.body.querySelector(chon);
const tatCa = (chon: string) => [...document.body.querySelectorAll(chon)];
const chuCua = (chon: string) => q(chon)?.textContent?.trim() ?? "";
const daTaiXong = () =>
	q('[data-the="tro-ly-okr"]:not([aria-busy])') !== null &&
	q('[data-the="so-chi-phi"]:not([aria-busy])') !== null;

beforeEach(() => {
	coQuyen = true;
	aiOn = false;
	choSo = Promise.resolve();
	loiSo = false;
	chuaGan = 0;
	rong = false;
	sanSang = { bat: true, conLaiUsd: 6.58 };
	doiSoat = null;
	cauHinh = {};
	daGoi = [];
	daDoc = [];
	daLamMoi = 0;
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("soan-cai-dat", () => {
	test("việc «Soạn OKR» có hai dòng Bật cho · Chế độ ẩn cho; ô Trần tháng đặt OKR có mô tả «trống = bằng trần thường»", async () => {
		aiOn = true;
		await mo();
		await cho(daTaiXong, "tai xong");
		expect(
			tatCa('[data-viec="soan"] [data-nac] [data-slot="field-label"]').map(
				(o) => o.textContent?.trim(),
			),
		).toEqual([m.troLy.nac.bat, m.troLy.nac.an]);
		expect(chuCua('[data-viec="soan"] [data-slot="field-legend"]')).toBe(
			"Soạn OKR",
		);
		expect(q('[data-pham-vi="soan"]')).not.toBeNull();
		expect(q('[data-pham-vi-an="soan"]')).not.toBeNull();
		const o = q("[data-o-tran-dat-okr]");
		expect(o).not.toBeNull();
		expect((o as HTMLInputElement).value).toBe("");
		const moTa =
			o
				?.closest('[data-slot="field"]')
				?.querySelector('[data-slot="field-description"]')?.textContent ?? "";
		expect(moTa.toLowerCase()).toContain("trống = bằng trần thường");
	});

	test("bật, chọn Bật cho «Soạn OKR» = toàn công ty, trần đặt 15 → setProgram đúng một lần với đủ năm trường soạn", async () => {
		await mo();
		await cho(daTaiXong, "tai xong");
		const congTac = q('[data-cong-tac="tro-ly-okr"]');
		if (!congTac) throw new Error("khong co cong tac");
		await bam(congTac);
		await cho(
			() => congTac.getAttribute("aria-checked") === "true",
			"cong tac bat",
		);
		const phamVi = q('[data-pham-vi="soan"]');
		if (!phamVi) throw new Error("khong co o pham vi soan");
		await chonLuaChon(phamVi, m.troLy.phamVi["toan-cong-ty"]);
		await cho(
			() => chuCua('[data-pham-vi="soan"]') === m.troLy.phamVi["toan-cong-ty"],
			"soan toan cong ty",
		);
		expect(
			q('[data-pham-vi-an="soan"]')?.hasAttribute("disabled"),
			"an khong khoa khi bat toan",
		).toBe(true);
		await go(q("[data-o-tran-dat-okr]"), "15");
		const luu = q('[data-nut="luu-tro-ly"]');
		if (!luu) throw new Error("khong co nut luu");
		expect(luu.hasAttribute("disabled")).toBe(false);
		await bam(luu);
		await cho(() => daLamMoi > 0, "lam moi sau khi luu");
		expect(daGoi, "thieu truong khi luu").toEqual([
			{
				duong: "okr.setProgram",
				dauVao: {
					aiOn: true,
					aiDeXuatPhamVi: "tat",
					aiDeXuatDonVi: [],
					aiTomTatPhamVi: "tat",
					aiTomTatDonVi: [],
					aiDeXuatAnPhamVi: "tat",
					aiDeXuatAnDonVi: [],
					aiTomTatAnPhamVi: "tat",
					aiTomTatAnDonVi: [],
					aiSoanPhamVi: "toan-cong-ty",
					aiSoanDonVi: [],
					aiSoanAnPhamVi: "tat",
					aiSoanAnDonVi: [],
					aiTranThangUsd: 9,
					aiTranThangDatOkrUsd: 15,
				},
			},
		]);
	});

	test("chế độ ẩn danh sách cho «Soạn OKR» → lưu gửi aiSoanAnPhamVi danh-sach và aiSoanAnDonVi đã chọn", async () => {
		aiOn = true;
		await mo();
		await cho(daTaiXong, "tai xong");
		const an = q('[data-pham-vi-an="soan"]');
		if (!an) throw new Error("khong co o an soan");
		await chonLuaChon(an, m.troLy.phamVi["danh-sach"]);
		await cho(
			() => q('[data-nut="chon-don-vi-an-soan"]') !== null,
			"nut chon don vi an soan",
		);
		const nut = q('[data-nut="chon-don-vi-an-soan"]');
		if (!nut) throw new Error("khong co nut");
		await bam(nut);
		await cho(
			() => q('[data-slot="pick-list-item"][data-id="pb-mk"]') !== null,
			"hop chon",
		);
		const hop = q('[data-slot="pick-list-item"][data-id="pb-mk"] button');
		if (!hop) throw new Error("khong co o phong ban");
		await bam(hop);
		const xacNhan = tatCa('[role="dialog"] button').find(
			(o) => o.textContent?.trim() === m.troLy.hop.xacNhan(1),
		);
		if (!xacNhan) throw new Error("khong co nut xac nhan");
		await bam(xacNhan);
		await cho(() => q('[role="dialog"]') === null, "dong hop");
		const luu = q('[data-nut="luu-tro-ly"]');
		if (!luu) throw new Error("khong co nut luu");
		await bam(luu);
		await cho(() => daLamMoi > 0, "lam moi sau khi luu");
		const vao = daGoi[0]?.dauVao;
		expect(
			{
				an: vao?.aiSoanAnPhamVi,
				anDonVi: vao?.aiSoanAnDonVi,
				tran: vao?.aiTranThangDatOkrUsd,
			},
			"thieu truong khi luu",
		).toEqual({
			an: "danh-sach",
			anDonVi: ["pb-mk"],
			tran: null,
		});
	});

	test("trần đặt OKR sai (abc, -1) khoá Lưu và hiện lỗi; xoá trống lại mở", async () => {
		await mo();
		await cho(daTaiXong, "tai xong");
		await go(q("[data-o-tran-dat-okr]"), "abc");
		expect(q('[data-nut="luu-tro-ly"]')?.hasAttribute("disabled")).toBe(true);
		expect(document.body.textContent).toContain(m.troLy.tranDatOkrHong);
		await go(q("[data-o-tran-dat-okr]"), "-1");
		expect(q('[data-nut="luu-tro-ly"]')?.hasAttribute("disabled")).toBe(true);
		await go(q("[data-o-tran-dat-okr]"), "");
		expect(document.body.textContent).not.toContain(m.troLy.tranDatOkrHong);
	});

	test("thành viên / vai okr không render thẻ", async () => {
		coQuyen = false;
		await mo();
		await cho(() => daDoc.includes("okr.program"), "doc chuong trinh");
		for (let i = 0; i < 5; i += 1)
			await act(async () => {
				await new Promise((r) => setTimeout(r, 0));
			});
		expect(tatCa("[data-the]").length, "lo the cho thanh vien").toBe(0);
	});
});
