import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	mock,
	setSystemTime,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	DongHien,
	KrOutput,
	MucTieuOutput,
} from "../../api/src/okr/okr.contracts";

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
type LoiGoi = { duong: string; dauVao: DauVao };
type Lay = (vao: DauVao) => unknown;
type TuyChonGhi = {
	onSuccess?: (kq: Json) => void;
	onError?: (e: Error) => void;
};

let daGoi: LoiGoi[] = [];
const duLieu = new Map<string, Lay>();

function dat(duong: string, lay: Lay): void {
	duLieu.set(duong, lay);
}

function thuTuc(duong: string) {
	const doc = (vao: DauVao): unknown => {
		daGoi.push({ duong, dauVao: vao });
		const lay = duLieu.get(duong);
		return lay ? lay(vao) : null;
	};
	return {
		queryKey: (vao?: DauVao) => (vao === undefined ? [duong] : [duong, vao]),
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao) => ({
			queryKey: [duong, vao ?? null],
			queryFn: async () => doc(vao),
		}),
		mutationOptions: (chon?: TuyChonGhi) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) =>
				doc(vao) ?? { id: "ok", canhBao: null },
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
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr/theo-don-vi",
}));

const { HopThoaiMucTieu } = await import(
	"@/app/(app)/[slug]/okr/hop-thoai-muc-tieu"
);
const { HopThoaiKr } = await import("@/app/(app)/[slug]/okr/hop-thoai-kr");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { Toaster } = await import("@crm/ui/components/sonner");
const { okrGopYMessages } = await import("@/lib/messages/okr-gop-y");
const { LY_DO_KHONG_SAN_SANG } = await import("@crm/validation/okr-tro-ly");

const m = okrGopYMessages("vi");

const DUONG_THIET_KE = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"docs",
	"superpowers",
	"specs",
	"2026-09-28-tro-ly-okr-de-xuat-design.md",
);

function idBangTrangThai(): string[] {
	const chu = readFileSync(DUONG_THIET_KE, "utf8");
	const dau = chu.indexOf("<<<UX-STATE-TABLE");
	const cuoi = chu.indexOf("UX-STATE-TABLE>>>");
	if (dau < 0 || cuoi < dau) throw new Error("khong thay bang UX-STATE-TABLE");
	return [...chu.slice(dau, cuoi).matchAll(/^\|\s*(ST-[a-z0-9-]+)\s*\|/gm)]
		.map((k) => k[1] ?? "")
		.filter((id) => id.startsWith("ST-muctieu-") || id.startsWith("ST-kr-"));
}

const HAI = { id: "hai", name: "Trần Minh Hải", email: "hai@onehub.vn" };

const KR_1: KrOutput = {
	id: "kr-1",
	objectiveId: "mt-1",
	title: "Gọi 50 cuộc mỗi tuần",
	kind: "tang-toi",
	owner: HAI,
	startValue: 0,
	targetValue: 50,
	currentValue: 20,
	unit: "cuộc",
	dueOn: null,
	weight: 1,
	source: "tay",
	doCanh: false,
	soMay: null,
	nguonMay: null,
	startLocked: false,
	progress: 40,
	laCuaToi: true,
	hienTaiQuaCapNhat: false,
};

const MT: MucTieuOutput = {
	id: "mt-1",
	cycleId: "q4",
	level: "phong-ban",
	unitId: "pb-1",
	unitName: "KD miền Bắc",
	title: "Triển khai CRM mới cho Kinh doanh miền Bắc",
	kind: "cam-ket",
	status: "nhap",
	owner: HAI,
	participants: [],
	whyNow: "Quý 3 mất dấu 9 thoả thuận vì mỗi người ghi một nơi.",
	publishedAt: null,
	droppedAt: null,
	progress: 40,
	expected: null,
	keyResults: [KR_1],
	alignments: [],
	canEdit: true,
	following: false,
	followerCount: 0,
	theoDoi: false,
};

const RONG_DONG = {
	keyResultId: null,
	truong: null,
	truoc: null,
	sau: null,
	maVanDe: null,
	targetObjectiveId: null,
	targetKeyResultId: null,
	tenDich: null,
} as const;

const D_TEN: DongHien = {
	...RONG_DONG,
	id: "d-ten",
	loai: "viet-lai",
	objectiveId: MT.id,
	truong: "title",
	truoc: MT.title,
	sau: "Không thoả thuận nào của miền Bắc bị mất dấu",
	lyDo: "Tên đang nói việc làm; câu mới nói kết quả.",
};
const D_KR: DongHien = {
	...RONG_DONG,
	id: "d-kr",
	loai: "viet-lai",
	objectiveId: MT.id,
	keyResultId: KR_1.id,
	truong: "kr.title",
	truoc: KR_1.title,
	sau: "Khách mới hẹn gặp được sau cuộc gọi đầu",
	lyDo: "KR đang đếm việc làm.",
};
const D_HOI: DongHien = {
	...RONG_DONG,
	id: "d-hoi",
	loai: "hoi",
	objectiveId: MT.id,
	keyResultId: KR_1.id,
	maVanDe: "kr-la-viec",
	sau: "Gọi xong 50 cuộc thì con số nào đổi?",
	lyDo: "KR là việc làm",
};
const D_CAN: DongHien = {
	...RONG_DONG,
	id: "d-can",
	loai: "can-chinh",
	objectiveId: MT.id,
	targetKeyResultId: "kr-onehub",
	tenDich: "KR OneHub · Thoả thuận mới cả năm",
	lyDo: "Mục tiêu này góp thẳng vào số thoả thuận mới.",
};
const D_VI_SAO: DongHien = {
	...RONG_DONG,
	id: "d-vi-sao",
	loai: "viet-lai",
	objectiveId: MT.id,
	truong: "whyNow",
	truoc: MT.whyNow,
	sau: "Quý 3 mất dấu 9 thoả thuận; đầu quý 1 là mùa ký lại.",
	lyDo: "Nói rõ vì sao là lúc này.",
};

type DanhSach = {
	dong: DongHien[];
	dangSoan: boolean;
	maKetThuc: string | null;
	lyDo: null;
};

const xong = (dong: DongHien[]): DanhSach => ({
	dong,
	dangSoan: false,
	maKetThuc: "da-nop",
	lyDo: null,
});
const chuaCo: DanhSach = {
	dong: [],
	dangSoan: false,
	maKetThuc: null,
	lyDo: null,
};
const dangSoan: DanhSach = {
	dong: [],
	dangSoan: true,
	maKetThuc: null,
	lyDo: null,
};

let truocKhiBam: DanhSach = chuaCo;
let sauKhiBam: DanhSach = xong([D_TEN, D_KR, D_HOI, D_CAN]);
let daBam = false;

function datMacDinh(): void {
	daBam = false;
	truocKhiBam = chuaCo;
	sauKhiBam = xong([D_TEN, D_KR, D_HOI, D_CAN]);
	dat("okr.troLySanSang", () => ({ bat: true, conLaiUsd: 5 }));
	dat("okr.troLyDanhSach", (vao) => {
		const ds = daBam ? sauKhiBam : truocKhiBam;
		return vao?.keyResultId
			? {
					...ds,
					dong: ds.dong.filter((d) => d.keyResultId === vao.keyResultId),
				}
			: ds;
	});
	dat("okr.troLyDeXuat", () => {
		daBam = true;
		return { bat: true, taskId: "t-1", dungLai: false };
	});
	dat("okr.troLyQuyet", () => ({ ok: true }));
	dat("okr.xuHuongKr", () => null);
	dat("okr.updateObjective", (vao) => ({ id: vao?.id, canhBao: null }));
	dat("okr.updateKeyResult", (vao) => ({ id: vao?.id, canhBao: null }));
	dat("okr.objective", () => ({
		...MT,
		cycleName: "Quý 4/2026",
		mangSangToi: null,
		mangSangTu: null,
		trail: [],
		canEditKr: [KR_1.id],
	}));
	dat("okr.program", () => ({ weightsOn: false, personalOn: false }));
	dat("okr.cycles", () => ({ cycles: [], currentId: null }));
	dat("users.list", () => [{ ...HAI, image: null }]);
	dat("users.me", () => HAI);
}

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];
let dongHoGia = false;

async function mo(man: ReactElement): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams="">
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							{man}
							<Toaster />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
	await nhip(20);
}

async function troi(ms: number): Promise<void> {
	const BUOC = 50;
	for (let t = 0; t < ms; t += BUOC) {
		await act(async () => {
			jest.advanceTimersByTime(Math.min(BUOC, ms - t));
		});
		await act(async () => {
			await Promise.resolve();
		});
	}
}

async function nhip(lan = 1): Promise<void> {
	for (let i = 0; i < lan; i += 1) {
		if (dongHoGia) {
			await troi(10);
		} else {
			await act(async () => {
				await new Promise((r) => setTimeout(r, 0));
			});
		}
	}
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 120; vong += 1) {
		if (xong()) return;
		await nhip();
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 600)}`,
	);
}

async function bam(o: Element): Promise<void> {
	await act(async () => {
		(o as HTMLElement).click();
	});
	await nhip(3);
}

async function go(o: Element | null, chu: string): Promise<void> {
	if (!(o instanceof HTMLInputElement || o instanceof HTMLTextAreaElement))
		throw new Error("khong phai o nhap");
	const goc =
		o instanceof HTMLInputElement
			? HTMLInputElement.prototype
			: HTMLTextAreaElement.prototype;
	const datGia = Object.getOwnPropertyDescriptor(goc, "value")?.set;
	await act(async () => {
		datGia?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
	await nhip(2);
}

function nutCo(chu: string, goc: ParentNode = document.body) {
	return (
		[...goc.querySelectorAll<HTMLButtonElement>("button")].find(
			(b) => b.textContent?.trim() === chu,
		) ?? null
	);
}

function nutNhan(nhan: string, goc: ParentNode = document.body) {
	const tim = goc.querySelector<HTMLButtonElement>(
		`button[aria-label="${nhan}"]`,
	);
	if (!tim) throw new Error(`khong thay nut co nhan "${nhan}"`);
	return tim;
}

function nut(chu: string, goc: ParentNode = document.body): HTMLButtonElement {
	const tim = nutCo(chu, goc);
	if (!tim)
		throw new Error(
			`khong thay nut "${chu}" — ${[...goc.querySelectorAll("button")].map((b) => b.textContent?.trim()).join(" | ")}`,
		);
	return tim;
}

const hopMucTieu = () =>
	document.body.querySelector<HTMLElement>("[data-hop-thoai-muc-tieu]");
const hopKr = () =>
	document.body.querySelector<HTMLElement>("[data-hop-thoai-kr]");
const cot = () => document.body.querySelector<HTMLElement>("[data-cot-gop-y]");
const dongCua = (id: string) =>
	document.body.querySelector<HTMLElement>(`[data-dong="${id}"]`);
const goiCua = (duong: string) => daGoi.filter((g) => g.duong === duong);

async function moHopMucTieu(): Promise<void> {
	await mo(
		<HopThoaiMucTieu yeuCau={{ loai: "sua", mucTieu: MT }} dong={() => {}} />,
	);
	await cho(() => hopMucTieu() !== null, "hop Muc tieu mo");
}

async function moHopKr(): Promise<void> {
	await mo(
		<HopThoaiKr
			objectiveId={MT.id}
			mucTieu={MT}
			kr={KR_1}
			chuMacDinh={HAI.id}
			suaDuocCot
			dong={() => {}}
		/>,
	);
	await cho(() => hopKr() !== null, "hop KR mo");
}

async function bamNho(): Promise<void> {
	await cho(() => nutCo(m.nut.nho) !== null, "nut nho gop y");
	await bam(nut(m.nut.nho));
}

async function moCotCoDong(): Promise<void> {
	await moHopMucTieu();
	await bamNho();
	await cho(() => dongCua(D_TEN.id) !== null, "cot co dong");
}

const oTenMucTieu = () =>
	hopMucTieu()?.querySelector<HTMLInputElement>('input[id$="-ten"]') ?? null;

const nutLuuMucTieu = () =>
	document.body.querySelector<HTMLButtonElement>('[data-nut="gui-muc-tieu"]');

function chu(o: Element | null): string {
	return o?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

beforeEach(() => {
	daGoi = [];
	duLieu.clear();
	datMacDinh();
});

afterEach(async () => {
	if (dongHoGia) {
		jest.useRealTimers();
		dongHoGia = false;
	}
	setSystemTime();
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

const BIEN_HEN_GIO_MS = 200;

type KyVongNut = "co" | "vang" | "khoa";

const KY_VONG_LY_DO = {
	tat: "vang",
	"viec-tat": "vang",
	"don-vi-chua-bat": "vang",
	"chua-co-khoa-mo-hinh": "vang",
	"chua-noi-tac-tu": "vang",
	"het-tran-gateway": "vang",
	"het-tran-thang": "khoa",
	"het-tran-ngay": "khoa",
} satisfies Record<string, KyVongNut>;

function kyVong(ma: string): KyVongNut {
	const kv = Object.entries(KY_VONG_LY_DO).find(([k]) => k === ma)?.[1];
	if (!kv) throw new Error(`thieu dong ly do: ${ma}`);
	return kv;
}

async function kiemNut(
	moHop: () => Promise<void>,
	kv: KyVongNut,
	nhan: string,
): Promise<void> {
	await moHop();
	await nhip(10);
	const b = nutCo(m.nut.nho);
	if (kv === "vang") {
		expect({ nhan, coNut: b !== null }).toEqual({ nhan, coNut: false });
		return;
	}
	await cho(() => nutCo(m.nut.nho) !== null, `nut ${nhan}`);
	expect({ nhan, tat: nut(m.nut.nho).disabled }).toEqual({
		nhan,
		tat: kv === "khoa",
	});
	if (kv === "khoa") {
		const id = nut(m.nut.nho).getAttribute("aria-describedby");
		expect(id).toBeTruthy();
		expect(chu(document.getElementById(id ?? ""))).not.toBe("");
	}
}

describe("nut theo ly do san sang", () => {
	test("nut: bang ky vong phu du moi ma cua LY_DO_KHONG_SAN_SANG", () => {
		for (const ma of LY_DO_KHONG_SAN_SANG) kyVong(ma);
	});

	for (const [ten, moHop] of [
		["Muc tieu", moHopMucTieu],
		["KR", moHopKr],
	] as const) {
		test(`nut: hop ${ten} — bat thi co nut bam duoc`, async () => {
			await kiemNut(moHop, "co", `${ten} bat`);
		});

		test(`nut: hop ${ten} — che do an (API tra don-vi-chua-bat) thi vang`, async () => {
			dat("okr.troLySanSang", () => ({
				bat: false,
				lyDo: "don-vi-chua-bat",
			}));
			await kiemNut(moHop, "vang", `${ten} che do an`);
		});

		test(`nut: hop ${ten} — nguoi khong sua duoc (403) thi vang`, async () => {
			dat("okr.troLySanSang", () => {
				throw new Error("Bạn không sửa được Mục tiêu này");
			});
			await kiemNut(moHop, "vang", `${ten} 403`);
		});

		for (const ma of LY_DO_KHONG_SAN_SANG) {
			test(`nut: hop ${ten} — ly do ${ma}`, async () => {
				const kv = kyVong(ma);
				dat("okr.troLySanSang", () => ({ bat: false, lyDo: ma }));
				await kiemNut(moHop, kv, `${ten} ${ma}`);
			});
		}
	}
});

const CA = {
	"ST-muctieu-nut": async () => {
		await moHopMucTieu();
		await cho(() => nutCo(m.nut.nho) !== null, "nut");
		const b = nut(m.nut.nho);
		expect(b.textContent?.trim()).toBe("Nhờ Trợ lý OKR góp ý");
		expect(b.disabled).toBe(false);
		const form = hopMucTieu()?.querySelector("form");
		expect(form?.querySelector("button")).toBe(b);
		expect(cot()).toBeNull();
		expect(hopMucTieu()?.getAttribute("data-size")).toBe("default");
	},

	"ST-muctieu-nut-khoa-sua": async () => {
		await moHopMucTieu();
		await cho(() => nutCo(m.nut.nho) !== null, "nut");
		await go(oTenMucTieu(), `${MT.title} năm 2027`);
		const b = nut(m.nut.nho);
		expect(b.disabled).toBe(true);
		const moTa = document.getElementById(
			b.getAttribute("aria-describedby") ?? "",
		);
		expect(chu(moTa)).toBe("Lưu thay đổi trước khi nhờ góp ý");
		expect(goiCua("okr.troLyDeXuat")).toHaveLength(0);
	},

	"ST-muctieu-dang-soan": async () => {
		sauKhiBam = dangSoan;
		await moHopMucTieu();
		await bamNho();
		await cho(() => cot() !== null, "cot mo");
		expect(goiCua("okr.troLyDeXuat").map((g) => g.dauVao)).toEqual([
			{ objectiveId: MT.id },
		]);
		expect(chu(cot())).toContain("Trợ lý OKR đang đọc Mục tiêu này…");
		expect(cot()?.getAttribute("aria-busy")).toBe("true");
		expect(cot()?.querySelectorAll("[data-khung-dong]")).toHaveLength(3);
		expect(hopMucTieu()?.getAttribute("data-size")).toBe("wide");
		expect(
			cot()?.querySelector(`button[aria-label="${m.cot.dong}"]`),
		).not.toBeNull();
	},

	"ST-muctieu-co-dong": async () => {
		await moCotCoDong();
		const thuTu = [...(cot()?.querySelectorAll("[data-dong]") ?? [])].map((d) =>
			d.getAttribute("data-dong"),
		);
		expect(thuTu).toEqual([D_TEN.id, D_KR.id, D_HOI.id, D_CAN.id]);
		expect(chu(cot())).toContain(
			"4 đề xuất. Nhận là ghi ngay, kèm vết «theo đề xuất của Trợ lý OKR».",
		);
		const ten = dongCua(D_TEN.id);
		expect(chu(ten?.querySelector("del") ?? null)).toBe(D_TEN.truoc ?? "");
		expect(chu(ten?.querySelector("ins") ?? null)).toBe(D_TEN.sau ?? "");
		expect(
			ten?.querySelector("del")?.parentElement?.getAttribute("translate"),
		).toBe("no");
		expect(chu(ten)).toContain(D_TEN.lyDo);
		expect(
			[...(ten?.querySelectorAll("button") ?? [])].map((b) =>
				b.textContent?.trim(),
			),
		).toEqual(["Chấp nhận gợi ý", "Sửa", "Từ chối gợi ý"]);
		const hoi = dongCua(D_HOI.id);
		expect(
			[...(hoi?.querySelectorAll("button") ?? [])].map((b) =>
				b.textContent?.trim(),
			),
		).toEqual(["Bỏ qua"]);
		expect(hoi?.querySelector('[translate="no"]')?.textContent).toBe(
			D_HOI.sau ?? "",
		);
		const can = dongCua(D_CAN.id);
		expect(
			[...(can?.querySelectorAll("button") ?? [])].map((b) =>
				b.textContent?.trim(),
			),
		).toEqual(["Chấp nhận gợi ý", "Từ chối gợi ý"]);
		expect(chu(can)).toContain(D_CAN.tenDich ?? "");
		expect(hopMucTieu()?.getAttribute("data-size")).toBe("wide");
	},

	"ST-muctieu-sua-dong": async () => {
		await moCotCoDong();
		const ten = dongCua(D_TEN.id);
		if (!ten) throw new Error("khong thay dong ten");
		await bam(nut("Sửa", ten));
		const o = ten.querySelector("input");
		expect(o?.value).toBe(D_TEN.sau ?? "");
		expect(document.activeElement).toBe(o);
		await go(o, "Không thoả thuận nào của miền Bắc bị bỏ sót");
		expect(nutCo(m.dong.nhanBanSua, ten)).not.toBeNull();
		expect(nutCo(m.dong.huySua, ten)).not.toBeNull();
		await bam(nut(m.dong.nhanBanSua, ten));
		await cho(() => goiCua("okr.troLyQuyet").length === 1, "quyet sua");
		expect(goiCua("okr.troLyQuyet")[0]?.dauVao).toEqual({
			deXuatId: D_TEN.id,
			cach: "sua",
			giaTri: "Không thoả thuận nào của miền Bắc bị bỏ sót",
		});
		await cho(
			() =>
				oTenMucTieu()?.value === "Không thoả thuận nào của miền Bắc bị bỏ sót",
			"o ten lay ban da sua",
		);
		expect(nutLuuMucTieu()?.disabled).toBe(true);
	},

	"ST-muctieu-da-quyet": async () => {
		await moCotCoDong();
		const ten = dongCua(D_TEN.id);
		if (!ten) throw new Error("khong thay dong ten");
		await bam(nut("Chấp nhận gợi ý", ten));
		await cho(
			() => chu(dongCua(D_TEN.id)).includes("Đã nhận"),
			"dong ten da nhan",
		);
		expect(goiCua("okr.troLyQuyet")[0]?.dauVao).toEqual({
			deXuatId: D_TEN.id,
			cach: "nhan",
		});
		expect(oTenMucTieu()?.value).toBe(D_TEN.sau ?? "");
		expect(nutLuuMucTieu()?.disabled).toBe(true);
		expect(dongCua(D_TEN.id)?.querySelectorAll("button")).toHaveLength(0);
		const can = dongCua(D_CAN.id);
		if (!can) throw new Error("khong thay dong can chinh");
		await bam(nut("Từ chối gợi ý", can));
		await cho(() => chu(dongCua(D_CAN.id)).includes("Đã bác"), "da bac");
		expect(goiCua("okr.troLyQuyet")[1]?.dauVao).toEqual({
			deXuatId: D_CAN.id,
			cach: "bac",
		});
	},

	"ST-muctieu-rong": async () => {
		sauKhiBam = xong([]);
		await moHopMucTieu();
		await bamNho();
		await cho(
			() => chu(cot()).includes("Trợ lý OKR không thấy chỗ nào cần sửa"),
			"cot rong",
		);
		expect(nutCo(m.cot.thuLai)).toBeNull();
	},

	"ST-muctieu-loi": async () => {
		sauKhiBam = { ...xong([]), maKetThuc: "hong:turn-failed" };
		await moHopMucTieu();
		await bamNho();
		await cho(
			() => chu(cot()).includes("Trợ lý OKR chưa trả lời được, thử lại sau"),
			"cot loi",
		);
		await bam(nut("Thử lại"));
		await cho(() => goiCua("okr.troLyDeXuat").length === 2, "thu lai goi lai");
	},

	"ST-muctieu-loi-nhan": async () => {
		dat("okr.troLyQuyet", () => {
			throw new Error("Chu kỳ đã khoá sửa");
		});
		await moCotCoDong();
		const ten = dongCua(D_TEN.id);
		if (!ten) throw new Error("khong thay dong ten");
		await bam(nut("Chấp nhận gợi ý", ten));
		await cho(
			() => dongCua(D_TEN.id)?.querySelector('[role="alert"]') !== null,
			"loi duoi dong",
		);
		expect(
			chu(dongCua(D_TEN.id)?.querySelector('[role="alert"]') ?? null),
		).toBe("Chu kỳ đã khoá sửa");
		expect(
			nutCo("Chấp nhận gợi ý", dongCua(D_TEN.id) ?? document),
		).not.toBeNull();
		expect(oTenMucTieu()?.value).toBe(MT.title);
	},

	"ST-muctieu-het-tran": async () => {
		setSystemTime(new Date("2026-12-15T03:00:00.000Z"));
		dat("okr.troLySanSang", () => ({ bat: false, lyDo: "het-tran-thang" }));
		await moHopMucTieu();
		await cho(() => nutCo(m.nut.nho) !== null, "nut mo");
		const b = nut(m.nut.nho);
		expect(b.disabled).toBe(true);
		expect(
			chu(document.getElementById(b.getAttribute("aria-describedby") ?? "")),
		).toBe("Trợ lý OKR tạm nghỉ tới 01/01");
	},

	"ST-muctieu-het-luot": async () => {
		dat("okr.troLySanSang", () => ({ bat: false, lyDo: "het-tran-ngay" }));
		await moHopMucTieu();
		await cho(() => nutCo(m.nut.nho) !== null, "nut mo");
		const b = nut(m.nut.nho);
		expect(b.disabled).toBe(true);
		expect(
			chu(document.getElementById(b.getAttribute("aria-describedby") ?? "")),
		).toBe("Bạn đã dùng hết lượt góp ý hôm nay");
	},

	"ST-muctieu-dang-cho": async () => {
		truocKhiBam = xong([D_TEN, D_HOI, D_CAN]);
		await moHopMucTieu();
		await cho(() => nutCo("3 đề xuất đang chờ") !== null, "nut dang cho");
		await cho(() => dongCua(D_TEN.id) !== null, "cot da hien khi mo hop");
		expect(hopMucTieu()?.getAttribute("data-size")).toBe("wide");
		expect(goiCua("okr.troLyDeXuat")).toHaveLength(0);
		await bam(
			nutNhan(
				m.cot.dong,
				document.body.querySelector("[data-cot-gop-y]") ?? document,
			),
		);
		await cho(() => cot() === null, "dong cot");
		await bam(nut("3 đề xuất đang chờ"));
		await cho(() => cot() !== null, "mo lai cot");
		expect(goiCua("okr.troLyDeXuat")).toHaveLength(0);
	},

	"ST-kr-cot": async () => {
		await moHopKr();
		await bamNho();
		await cho(() => dongCua(D_KR.id) !== null, "cot KR co dong");
		expect(goiCua("okr.troLyDeXuat").map((g) => g.dauVao)).toEqual([
			{ objectiveId: MT.id, keyResultId: KR_1.id },
		]);
		expect(
			goiCua("okr.troLyDanhSach").every(
				(g) => g.dauVao?.keyResultId === KR_1.id,
			),
		).toBe(true);
		expect(chu(cot())).toContain("Trợ lý OKR · chỉ KR này");
		expect(
			[...(cot()?.querySelectorAll("[data-dong]") ?? [])].map((d) =>
				d.getAttribute("data-dong"),
			),
		).toEqual([D_KR.id, D_HOI.id]);
		expect(hopKr()?.getAttribute("data-size")).toBe("wide");
	},

	"ST-kr-xu-huong": async () => {
		dat("okr.xuHuongKr", () => ({ moiTuan: 12, uocCuoiKy: 180 }));
		await moHopKr();
		await cho(
			() => document.body.querySelector("[data-xu-huong]") !== null,
			"dong xu huong",
		);
		const dong = document.body.querySelector("[data-xu-huong]");
		expect(chu(dong)).toBe(
			"Theo các lần cập nhật gần nhất (+12/tuần), cuối kỳ ước khoảng 180",
		);
		expect(dong?.getAttribute("data-variant")).toBe("hoi");
		const oDich = hopKr()?.querySelector("[data-o-dich]");
		expect(oDich?.closest('[data-slot="field"]')?.contains(dong ?? null)).toBe(
			true,
		);
		expect(goiCua("okr.xuHuongKr")[0]?.dauVao).toEqual({
			keyResultId: KR_1.id,
		});
	},

	"ST-kr-khong-xu-huong": async () => {
		dat("okr.xuHuongKr", () => null);
		await moHopKr();
		await cho(() => goiCua("okr.xuHuongKr").length > 0, "da hoi xu huong");
		await nhip(5);
		expect(document.body.querySelector("[data-xu-huong]")).toBeNull();
	},
} satisfies Record<string, () => Promise<void>>;

describe("trang-thai theo bang cua thiet ke", () => {
	const ID = idBangTrangThai();

	test("trang-thai: bang co du dong cua hop Muc tieu va hop KR", () => {
		expect(ID.filter((id) => id.startsWith("ST-muctieu-")).length).toBe(12);
		expect(ID.filter((id) => id.startsWith("ST-kr-")).length).toBe(3);
	});

	for (const id of ID) {
		test(`trang-thai ${id}`, async () => {
			const ca = Object.entries(CA).find(([k]) => k === id)?.[1];
			if (!ca) throw new Error(`trang thai chua do: ${id}`);
			await ca();
		});
	}
});

describe("trang-thai hoi lai, tran cho, hoan tac, o dang sua", () => {
	test("trang-thai hoi-lai: moi 1500 ms, qua 30 000 ms thanh loi co Thu lai, roi ngung hoi", async () => {
		jest.useFakeTimers();
		dongHoGia = true;
		sauKhiBam = dangSoan;
		await moHopMucTieu();
		await bamNho();
		await cho(() => cot() !== null, "cot mo");
		const luc0 = goiCua("okr.troLyDanhSach").length;
		await troi(1500);
		expect(goiCua("okr.troLyDanhSach").length - luc0).toBe(1);
		await troi(1500);
		expect(goiCua("okr.troLyDanhSach").length - luc0).toBe(2);
		await troi(27_000 + BIEN_HEN_GIO_MS);
		const soLan = goiCua("okr.troLyDanhSach").length - luc0;
		if (!nutCo("Thử lại"))
			throw new Error(
				`qua han: sau 30000 ms chua co Thu lai — da hoi ${soLan} lan`,
			);
		expect(chu(cot())).toContain("Trợ lý OKR chưa trả lời được, thử lại sau");
		expect(soLan).toBe(20);
		await troi(6000);
		expect(goiCua("okr.troLyDanhSach").length - luc0).toBe(soLan);
	});

	test("trang-thai dong-cot: dong cot thi so lan hoi troLyDanhSach ngung tang", async () => {
		jest.useFakeTimers();
		dongHoGia = true;
		sauKhiBam = dangSoan;
		await moHopMucTieu();
		await bamNho();
		await cho(() => cot() !== null, "cot mo");
		await troi(3000);
		const cot0 = cot();
		if (!cot0) throw new Error("mat cot");
		await bam(nutNhan(m.cot.dong, cot0));
		await cho(() => cot() === null, "cot dong");
		const sauDong = goiCua("okr.troLyDanhSach").length;
		await troi(9000);
		expect(goiCua("okr.troLyDanhSach").length).toBe(sauDong);
		expect(hopMucTieu()?.getAttribute("data-size")).toBe("default");
	});

	test("trang-thai hoan-tac: Hoan tac tren toast gui dung mot updateObjective voi title = truoc", async () => {
		await moCotCoDong();
		const ten = dongCua(D_TEN.id);
		if (!ten) throw new Error("khong thay dong ten");
		await bam(nut("Chấp nhận gợi ý", ten));
		await cho(() => nutCo(m.toast.hoanTac) !== null, "toast hoan tac");
		expect(chu(document.body)).toContain(m.toast.daNhan);
		await bam(nut(m.toast.hoanTac));
		await cho(
			() => goiCua("okr.updateObjective").length > 0,
			"hoan tac da gui",
		);
		await nhip(5);
		const gui = goiCua("okr.updateObjective");
		expect(gui).toHaveLength(1);
		if (gui[0]?.dauVao?.title === D_TEN.sau)
			throw new Error(`hoan tac gui sau: ${String(gui[0]?.dauVao?.title)}`);
		expect(gui[0]?.dauVao).toEqual({ id: MT.id, title: D_TEN.truoc ?? "" });
		await cho(() => oTenMucTieu()?.value === MT.title, "o ten ve truoc");
		expect(nutLuuMucTieu()?.disabled).toBe(true);
	});

	test("trang-thai hoan-tac KR: Hoan tac cua dong ten KR gui updateKeyResult voi title = truoc", async () => {
		await moCotCoDong();
		const kr = dongCua(D_KR.id);
		if (!kr) throw new Error("khong thay dong KR");
		await bam(nut("Chấp nhận gợi ý", kr));
		await cho(() => nutCo(m.toast.hoanTac) !== null, "toast hoan tac");
		await bam(nut(m.toast.hoanTac));
		await cho(() => goiCua("okr.updateKeyResult").length > 0, "gui KR");
		expect(goiCua("okr.updateKeyResult").map((g) => g.dauVao)).toEqual([
			{ id: KR_1.id, title: KR_1.title },
		]);
		expect(goiCua("okr.updateObjective")).toHaveLength(0);
	});

	test("trang-thai o-dang-sua: o co sua chua luu thi khoa Nhan cua dong do, dong khac van nhan duoc", async () => {
		sauKhiBam = xong([D_TEN, D_VI_SAO, D_KR]);
		await moCotCoDong();
		await go(oTenMucTieu(), `${MT.title} (bản nháp)`);
		const ten = dongCua(D_TEN.id);
		const nhanTen = nut("Chấp nhận gợi ý", ten ?? document);
		expect(nhanTen.disabled).toBe(true);
		expect(
			chu(
				document.getElementById(nhanTen.getAttribute("aria-describedby") ?? ""),
			),
		).toBe("Lưu hoặc hoàn lại ô này trước");
		expect(
			nut("Chấp nhận gợi ý", dongCua(D_VI_SAO.id) ?? document).disabled,
		).toBe(false);
		expect(nut("Chấp nhận gợi ý", dongCua(D_KR.id) ?? document).disabled).toBe(
			false,
		);
		await bam(nhanTen);
		expect(goiCua("okr.troLyQuyet")).toHaveLength(0);
	});
});
