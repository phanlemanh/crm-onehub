import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { ChuKyOutput } from "../../api/src/okr/okr.contracts";

const ky = (
	id: string,
	kind: ChuKyOutput["kind"],
	name: string,
	phase: ChuKyOutput["phase"],
	parentId: string | null,
	startsOn: string,
	endsOn: string,
): ChuKyOutput => ({
	id,
	kind,
	name,
	parentId,
	startsOn,
	endsOn,
	phase,
	breakStartsOn: null,
	breakEndsOn: null,
	updateWeekday: 1,
});

const NAM = ky(
	"nam-26",
	"nam",
	"Năm 2026",
	"dang-chay",
	null,
	"2026-01-01",
	"2026-12-31",
);
const Q4 = ky(
	"q4-26",
	"quy",
	"Quý 4/2026",
	"lap-ke-hoach",
	NAM.id,
	"2026-10-01",
	"2026-12-31",
);
const Q3 = ky(
	"q3-26",
	"quy",
	"Quý 3/2026",
	"da-dong",
	NAM.id,
	"2026-07-01",
	"2026-09-30",
);

let coQuyen: boolean;

const chuongTrinh = () => ({
	objectiveCap: 5,
	krCap: 5,
	capMode: "canh-bao",
	scoreScale: "0-1",
	weightsOn: false,
	personalOn: false,
	version: 3,
	canManage: coQuyen,
});

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
let daGoi: { duong: string; dauVao: DauVao }[] = [];
let daLamMoi = 0;

function thuTuc<TRa>(duong: string, doc: () => TRa = () => null as TRa) {
	return {
		queryKey: () => [duong],
		pathKey: () => [duong],
		queryOptions: () => ({
			queryKey: [duong],
			queryFn: async () => doc(),
		}),
		mutationOptions: (chon?: {
			onSuccess?: (kq: { id: string; canhBao: string | null }) => void;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => {
				daGoi.push({ duong, dauVao: vao });
				return { id: "ok", canhBao: null };
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			cycles: thuTuc("okr.cycles", () => ({
				cycles: [Q4, Q3, NAM],
				currentId: null,
			})),
			program: thuTuc("okr.program", chuongTrinh),
			createCycle: thuTuc("okr.createCycle"),
			setCyclePhase: thuTuc("okr.setCyclePhase"),
			setProgram: thuTuc("okr.setProgram"),
		},
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

const { BangChuKy } = await import(
	"@/app/(app)/[slug]/settings/okr/bang-chu-ky"
);
const { FormCauHinh } = await import(
	"@/app/(app)/[slug]/settings/okr/form-cau-hinh"
);
const { LyDoKhongQuyen, LY_DO_KHONG_QUYEN } = await import(
	"@/app/(app)/[slug]/settings/okr/trang-thai-cai-dat"
);
const { PageShellHeader, PageShellHeading, PageShellTitle } = await import(
	"@/components/page-shell"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrMessages } = await import("@/lib/messages/okr");

const m = okrMessages("vi").caiDat;

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];
let url: string[] = [];

async function mo(thamSo = ""): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter
				hasMemory
				searchParams={thamSo}
				onUrlUpdate={(e: UrlUpdateEvent) => url.push(e.queryString)}
			>
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<TooltipProvider>
							<PageShellHeader>
								<PageShellHeading>
									<PageShellTitle>{m.tieuDe}</PageShellTitle>
									<LyDoKhongQuyen />
								</PageShellHeading>
							</PageShellHeader>
							<BangChuKy />
							<FormCauHinh />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
	await cho(
		() =>
			document.body.querySelector("[data-chu-ky]") !== null &&
			document.body.querySelector("[data-o-tran-muc-tieu]") !== null,
		"trang tai xong",
	);
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 500)}`,
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

const q = (chon: string) => document.body.querySelector(chon);
const tatCa = (chon: string) => [...document.body.querySelectorAll(chon)];
const tat = (o: Element | null) =>
	o instanceof HTMLButtonElement || o instanceof HTMLInputElement
		? o.disabled
		: null;
const nutLuu = () => q('[data-nut="luu-cau-hinh"]');

function dieuKhien() {
	return tatCa(
		'[data-the] input:not([aria-hidden="true"]), [data-the] button[type="submit"], [data-the] [role="switch"], [data-the] [role="combobox"], [data-nut="mo-chu-ky"], [data-menu-chu-ky]',
	);
}

beforeEach(() => {
	coQuyen = true;
	daGoi = [];
	daLamMoi = 0;
	url = [];
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("cai-dat-khong-quyen-khoa-dieu-khien", () => {
	test("cai-dat-khong-quyen-khoa-dieu-khien: thanh vien thuong thay ca hai the, moi dieu khien khoa, mot dong ly do", async () => {
		coQuyen = false;
		await mo();
		const dk = dieuKhien();
		const lyDo = tatCa("[data-ly-do-khong-quyen]");
		expect({
			tieuDeThe: tatCa('[data-slot="card-title"]').map((o) => o.textContent),
			soHangChuKy: tatCa("[data-chu-ky]").length,
			soDieuKhien: dk.length,
			moiCaiKhoa: dk.every((o) => o.hasAttribute("disabled")),
			moiCaiTroLyDo: dk.every((o) =>
				(o.getAttribute("aria-describedby") ?? "")
					.split(" ")
					.includes(LY_DO_KHONG_QUYEN),
			),
			lyDo: lyDo.map((o) => [o.id, o.textContent]),
		}).toEqual({
			tieuDeThe: [m.chuKy.tieuDe, m.cauHinh.tieuDe],
			soHangChuKy: 3,
			soDieuKhien: 11,
			moiCaiKhoa: true,
			moiCaiTroLyDo: true,
			lyDo: [[LY_DO_KHONG_QUYEN, m.khongQuyen]],
		});
	});

	test("cai-dat-khong-quyen-khoa-dieu-khien: doi chung — quan tri khong co dong ly do, dieu khien mo, Luu van tat khi chua sua", async () => {
		await mo();
		expect({
			lyDo: tatCa("[data-ly-do-khong-quyen]").length,
			moChuKy: tat(q('[data-nut="mo-chu-ky"]')),
			tranMucTieu: tat(q("[data-o-tran-muc-tieu]")),
			congTac: tatCa('[role="switch"]').map((o) => o.hasAttribute("disabled")),
			luu: tat(nutLuu()),
			tro: q("[data-o-tran-muc-tieu]")
				?.getAttribute("aria-describedby")
				?.includes(LY_DO_KHONG_QUYEN),
		}).toEqual({
			lyDo: 0,
			moChuKy: false,
			tranMucTieu: false,
			congTac: [false, false],
			luu: true,
			tro: false,
		});
	});
});

describe("cai-dat-luu-bat-khi-sua", () => {
	test("cai-dat-luu-bat-khi-sua: Luu chi bat khi da sua va hop le, gui dung cau hinh", async () => {
		await mo();
		const o = q("[data-o-tran-muc-tieu]");
		const ra: [string, boolean | null][] = [["dau", tat(nutLuu())]];
		await go(o, "7");
		ra.push(["7", tat(nutLuu())]);
		await go(o, "5");
		ra.push(["tra-ve-5", tat(nutLuu())]);
		await go(o, "0");
		ra.push(["0", tat(nutLuu())]);
		await go(o, "51");
		ra.push(["51", tat(nutLuu())]);
		await go(o, "7");
		ra.push(["7-lai", tat(nutLuu())]);
		expect(ra).toEqual([
			["dau", true],
			["7", false],
			["tra-ve-5", true],
			["0", true],
			["51", true],
			["7-lai", false],
		]);

		const luu = nutLuu();
		if (!luu) throw new Error("khong co nut Luu");
		await bam(luu);
		await cho(() => daLamMoi > 0, "lam moi sau khi luu");
		expect(daGoi).toEqual([
			{
				duong: "okr.setProgram",
				dauVao: {
					objectiveCap: 7,
					krCap: 5,
					capMode: "canh-bao",
					scoreScale: "0-1",
					weightsOn: false,
					personalOn: false,
				},
			},
		]);
	});
});

describe("cai-dat-chuyen-pha-hoi-lai", () => {
	test("cai-dat-chuyen-pha-hoi-lai: menu tat o pha cuoi, chuyen pha hoi lai roi goi dung thu tuc", async () => {
		await mo();
		const hang = tatCa("[data-chu-ky]").map((o) => [
			o.getAttribute("data-chu-ky"),
			tat(o.querySelector("[data-menu-chu-ky]")),
		]);
		expect(hang).toEqual([
			[NAM.id, false],
			[Q4.id, false],
			[Q3.id, true],
		]);

		const menu = q(`[data-menu-chu-ky="${Q4.id}"]`);
		if (!menu) throw new Error("khong co menu");
		await bam(menu);
		await cho(() => q('[role="menuitem"]') !== null, "menu mo");
		const muc = tatCa('[role="menuitem"]');
		expect(muc.map((o) => o.textContent)).toEqual([
			m.chuKy.chuyenSang(m.pha["dang-chay"]),
		]);
		const dau = muc[0];
		if (!dau) throw new Error("khong co muc");
		await bam(dau);
		await cho(() => q('[role="alertdialog"]') !== null, "hop hoi");
		expect(daGoi).toEqual([]);
		const xacNhan = [
			...(q('[role="alertdialog"]')?.querySelectorAll("button") ?? []),
		].find((b) => b.textContent === m.chuKy.hoi.action);
		if (!xacNhan) throw new Error("khong co nut xac nhan");
		await bam(xacNhan);
		await cho(() => daLamMoi > 0, "lam moi sau chuyen pha");
		expect(daGoi).toEqual([
			{ duong: "okr.setCyclePhase", dauVao: { id: Q4.id, phase: "dang-chay" } },
		]);
	});

	test("cai-dat-chuyen-pha-hoi-lai: Mo chu ky ghi len URL, sheet mo voi nut gui tat khi chua hop le", async () => {
		await mo();
		const nutMo = q('[data-nut="mo-chu-ky"]');
		if (!nutMo) throw new Error("khong co nut Mo chu ky");
		await bam(nutMo);
		await cho(() => q("[data-sheet-mo-chu-ky]") !== null, "sheet mo");
		const gui = () => q('[data-nut="gui-chu-ky"]');
		const truoc = tat(gui());
		await go(q("[data-sheet-mo-chu-ky] [data-o-ten]"), "Năm 2027");
		expect({
			url: url.at(-1),
			truoc,
			chiCoTen: tat(gui()),
			daGoi,
		}).toEqual({
			url: "?moChuKy=true",
			truoc: true,
			chiCoTen: true,
			daGoi: [],
		});
	});
});
