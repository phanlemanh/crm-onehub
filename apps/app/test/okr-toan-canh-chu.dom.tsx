import { afterEach, describe, expect, mock, test } from "bun:test";
import { viecChuKy } from "@crm/validation/okr-chu-ky";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { ChuKyOutput } from "../../api/src/okr/okr.contracts";
import {
	type ToanCanhOutput,
	toanCanhOutput,
} from "../../api/src/okr/okr-xem.contracts";

const QUY: ChuKyOutput = {
	id: "q4-26",
	kind: "quy",
	name: "Quý 4/2026",
	parentId: null,
	startsOn: "2026-10-01",
	endsOn: "2026-12-31",
	phase: "dang-chay",
	breakStartsOn: null,
	breakEndsOn: null,
	updateWeekday: 1,
	cuaSoRa: null,
	anLuc: null,
	anLyDo: null,
	quyConHien: 0,
	viec: viecChuKy({
		phase: "dang-chay",
		kind: "quy",
		trong: false,
		daAn: false,
		quyConHien: 0,
	}),
};

function hang(
	key: string,
	ten: string,
	cap: "goc" | "bo-phan" | "phong-ban",
	soMucTieu: number,
): ToanCanhOutput["hang"][number] {
	return {
		key,
		ten,
		cap,
		tienDo: soMucTieu === 0 ? null : 50,
		kyVong: null,
		soMucTieu,
		soKr: soMucTieu * 2,
		tuTin: { cao: soMucTieu, vua: 0, thap: 0 },
		daCapNhat: 0,
		dangBan: null,
		theoTuan: [null],
	};
}

function duLieu(donViChuaDat: string[]): ToanCanhOutput {
	return toanCanhOutput.parse({
		tongQuan: {
			tienDo: 50,
			kyVong: null,
			donViCongBo: 3 - donViChuaDat.length,
			tongDonVi: 3,
			donViChuaDat,
			tongKr: 12,
			daCapNhat: 0,
			daCapNhatTruoc: 0,
			tuTinThap: 0,
			tuTinThapTruoc: 0,
		},
		tuan: ["2026-09-28"],
		tuanNay: "2026-09-28",
		hang: [
			hang("goc", "OneHub", "goc", 0),
			hang("bp:ho-tro", "Khối Hỗ trợ", "bo-phan", 6),
			hang("pb:tai-chinh", "Tài chính", "phong-ban", 3),
			hang("pb:nhan-su", "Nhân sự", "phong-ban", 3),
		],
	});
}

let hienTai: ToanCanhOutput = duLieu([]);

const thuTuc = <T,>(duong: string, doc: () => T) => ({
	queryKey: () => [duong],
	pathKey: () => [duong],
	queryOptions: () => ({ queryKey: [duong], queryFn: async () => doc() }),
});

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			cycles: thuTuc("okr.cycles", () => ({
				cycles: [QUY],
				currentId: QUY.id,
			})),
			access: thuTuc("okr.access", () => ({
				canManageProgram: true,
				headOf: { divisions: [], departments: [] },
			})),
			toanCanh: {
				queryOptions: () => ({
					queryKey: ["okr.toanCanh"],
					queryFn: async () => hienTai,
				}),
			},
			xuatKy: thuTuc("okr.xuatKy", () => null),
		},
	}),
}));

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr/toan-canh",
}));

const { ToanCanh } = await import("@/app/(app)/[slug]/okr/toan-canh/toan-canh");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");

let dangMo: Root[] = [];

afterEach(() => {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
});

async function mo(locale: "vi" | "en"): Promise<void> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams="">
				<QueryClientProvider client={client}>
					<LocaleProvider locale={locale}>
						<TooltipProvider>
							<ToanCanh />
						</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	for (let i = 0; i < 50; i += 1) {
		if (document.body.querySelector('[data-trang-thai="ST-toancanh-codulieu"]'))
			return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 10));
		});
	}
	throw new Error("toan canh khong dung xong");
}

function moTaThe(nhan: string): Element | null {
	const the = [
		...document.body.querySelectorAll('[data-slot="stat-card"]'),
	].find((c) => c.textContent?.includes(nhan));
	return the ?? null;
}

const CAU = {
	vi: {
		thieu: "Khối Hỗ trợ chưa có mục tiêu riêng",
		du: "Mọi đơn vị đã có mục tiêu công bố",
		gop: "một bộ phận chưa có mục tiêu riêng vẫn có số ở đây",
	},
	en: {
		thieu: "Khối Hỗ trợ has no objectives of its own",
		du: "Every unit has published objectives",
		gop: "a division with no objectives of its own still shows numbers here",
	},
} as const;

describe("toan-canh chu the don vi", () => {
	test("toan-canh: ma tran vi x en x {co don vi chua dat, moi don vi da dat} — the noi mục tiêu riêng, ten khong dich, mo ta bang noi gop", async () => {
		const thuc: Record<string, boolean | string | null> = {};
		const mong: Record<string, boolean | string | null> = {};
		for (const locale of ["vi", "en"] as const) {
			const mt = okrToanCanhMessages(locale).toanCanh;
			for (const chuaDat of [["Khối Hỗ trợ"], []]) {
				hienTai = duLieu(chuaDat);
				await mo(locale);
				const ca = chuaDat.length === 0 ? "du" : "thieu";
				const o = `${locale}.${ca}`;
				const the = moTaThe(mt.donViCongBo);
				const khongDich = the?.querySelector('[translate="no"]');
				const moTa =
					ca === "du"
						? (the?.textContent ?? "")
						: (the?.querySelector("[data-chua-dat]")?.textContent ?? "");
				thuc[`${o}.the`] = moTa
					.replace(/\s+/g, " ")
					.trim()
					.endsWith(CAU[locale][ca]);
				thuc[`${o}.ten`] =
					ca === "du" ? null : (khongDich?.textContent ?? null);
				thuc[`${o}.moTa`] =
					document.body.textContent?.includes(CAU[locale].gop) ?? false;
				mong[`${o}.the`] = true;
				mong[`${o}.ten`] = ca === "du" ? null : "Khối Hỗ trợ";
				mong[`${o}.moTa`] = true;
				for (const root of dangMo) act(() => root.unmount());
				dangMo = [];
				document.body.innerHTML = "";
			}
		}
		console.log(`toan-canh: ${Object.keys(mong).length} khang dinh`);
		expect(Object.keys(thuc).length).toBe(12);
		expect(thuc).toEqual(mong);
	});
});
