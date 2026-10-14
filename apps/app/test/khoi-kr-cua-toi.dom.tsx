import { afterEach, describe, expect, mock, test } from "bun:test";
import {
	QueryClient,
	QueryClientProvider,
	skipToken,
} from "@tanstack/react-query";
import {
	act,
	type ComponentProps,
	createElement as h,
	type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type ChuKy = RouterOutputs["okr"]["cycles"];
type Khoi = RouterOutputs["okr"]["khoiCuaToi"];
type VaoKhoi = { cycleId: string; userId: string | null };

const KY = {
	id: "ky-1",
	kind: "quy",
	name: "Quý 3/2026",
	parentId: null,
	startsOn: "2026-07-01",
	endsOn: "2026-09-30",
	phase: "dang-chay",
	breakStartsOn: null,
	breakEndsOn: null,
	updateWeekday: 1,
	cuaSoRa: null,
	anLuc: null,
	anLyDo: null,
	quyConHien: 0,
	viec: {
		suaMoiO: false,
		suaTen: false,
		go: false,
		an: false,
		hienLai: false,
	},
} satisfies ChuKy["cycles"][number];
const CO_KY = { cycles: [KY], currentId: "ky-1" } satisfies ChuKy;
const KHONG_KY = { cycles: [], currentId: null } satisfies ChuKy;

const dong = (id: string) =>
	({
		keyResultId: id,
		objectiveId: "mt-1",
		tieuDe: `KR ${id}`,
		mucTieu: "Mở rộng đối tác",
		chuTen: "Trần An",
		progress: 40,
		expected: 50,
		laMoc: false,
		tuTin: "vua",
		nhip: "cham-nhip",
	}) satisfies Khoi["kr"][number];
const HAI_KR = { kr: [dong("kr-1"), dong("kr-2")], tong: 2 } satisfies Khoi;
const MOT_KR = { kr: [dong("kr-9")], tong: 1 } satisfies Khoi;

const hong = (): never => {
	throw new Error("loi gia");
};
const treo = () => new Promise<never>(() => {});

let traChuKy: () => ChuKy | Promise<ChuKy> = () => CO_KY;
let traKhoi: () => Khoi | Promise<Khoi> = () => HAI_KR;
const goi = { cycles: 0, khoi: 0 };
const vaoKhoi: VaoKhoi[] = [];

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			cycles: {
				queryOptions: () => ({
					queryKey: ["okr.cycles"],
					queryFn: async () => {
						goi.cycles += 1;
						return traChuKy();
					},
				}),
			},
			khoiCuaToi: {
				queryOptions: (vao: VaoKhoi | typeof skipToken) =>
					vao === skipToken
						? { queryKey: ["okr.khoiCuaToi", "skip"], queryFn: skipToken }
						: {
								queryKey: ["okr.khoiCuaToi", vao],
								queryFn: async () => {
									goi.khoi += 1;
									vaoKhoi.push(vao);
									return traKhoi();
								},
							},
			},
		},
	}),
}));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("next/link", () => ({
	default: ({
		children,
		...props
	}: ComponentProps<"a"> & { children?: ReactNode }) => h("a", props, children),
}));
mock.module("@/components/crm/record-sheet/dien-bien-kr", () => ({
	useMoDienBien: () => () => {},
}));

const { KhoiKrCuaToi } = await import("@/app/(app)/[slug]/okr/khoi-kr-cua-toi");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");

const CAU_BAN = "Không tải được KR của bạn.";
const CAU_NGUOI = "Không tải được KR của người này.";
const THU_LAI = "Thử lại";

let dangMo: Root[] = [];

async function nhip(): Promise<void> {
	await act(async () => {
		await new Promise((r) => setTimeout(r, 0));
	});
}

async function mo(props: {
	cycleId?: string;
	userId?: string;
}): Promise<QueryClient> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	dangMo.push(root);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">
					<KhoiKrCuaToi {...props} />
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	await nhip();
	return client;
}

async function cho(xong: () => boolean, nhan: string): Promise<void> {
	for (let vong = 0; vong < 40; vong += 1) {
		if (xong()) return;
		await nhip();
	}
	throw new Error(`khong toi: ${nhan} — ${document.body.textContent}`);
}

const khoi = () =>
	document.body.querySelectorAll<HTMLElement>("[data-khoi='okr-cua-toi']");
const trangThai = (ma: string) =>
	document.body.querySelector<HTMLElement>(`[data-trang-thai='${ma}']`);
const hang = () => document.body.querySelectorAll("[data-kr-cua-toi]");

function nutThuLai(o: HTMLElement): HTMLButtonElement {
	const nut = [...o.querySelectorAll<HTMLButtonElement>("button")].find((b) =>
		b.textContent?.includes(THU_LAI),
	);
	if (!nut)
		throw new Error(`khong-thay-nut-thu-lai — ${document.body.textContent}`);
	return nut;
}

async function bam(nut: HTMLButtonElement): Promise<void> {
	await act(async () => {
		nut.click();
	});
	for (let vong = 0; vong < 5; vong += 1) await nhip();
}

function laLoiXem(o: HTMLElement, cau: string) {
	expect(o.getAttribute("data-slot")).toBe("empty");
	expect(o.textContent).toContain(cau);
	const nut = nutThuLai(o);
	expect(nut.getAttribute("data-slot")).toBe("kara-retry");
	expect(o.hasAttribute("data-vung-tai-loi")).toBe(true);
}

afterEach(() => {
	for (const root of dangMo) act(() => root.unmount());
	dangMo = [];
	document.body.innerHTML = "";
	traChuKy = () => CO_KY;
	traKhoi = () => HAI_KR;
	goi.cycles = 0;
	goi.khoi = 0;
	vaoKhoi.length = 0;
});

describe("khoi-kr-cua-toi", () => {
	test("chu-ky-loi: Tong quan van hien the voi cau loi va Thu lai, khong khung cho, khong bang", async () => {
		traChuKy = hong;
		await mo({});
		await cho(
			() => trangThai("ST-tongquan-loi") !== null,
			"khoi-okr-bien-mat-khi-chu-ky-loi",
		);
		expect(khoi().length).toBe(1);
		const o = trangThai("ST-tongquan-loi");
		if (!o) throw new Error("khoi-okr-bien-mat-khi-chu-ky-loi");
		expect(khoi()[0]?.contains(o)).toBe(true);
		laLoiXem(o, CAU_BAN);
		expect(document.body.querySelector("[data-slot='skeleton']")).toBeNull();
		expect(hang().length).toBe(0);
	});

	test("thu-lai: bam khi van loi thi loi o lai; het loi thi goi lai chu ky va bang hien", async () => {
		traChuKy = hong;
		await mo({});
		await cho(
			() => trangThai("ST-tongquan-loi") !== null,
			"khoi-okr-bien-mat-khi-chu-ky-loi",
		);
		const lan0 = goi.cycles;
		const o = trangThai("ST-tongquan-loi");
		if (!o) throw new Error("khong-thay-nut-thu-lai");
		await bam(nutThuLai(o));
		expect(goi.cycles).toBe(lan0 + 1);
		expect(trangThai("ST-tongquan-loi")).not.toBeNull();

		traChuKy = () => CO_KY;
		const o2 = trangThai("ST-tongquan-loi");
		if (!o2) throw new Error("khong-thay-nut-thu-lai");
		await bam(nutThuLai(o2));
		await cho(() => hang().length === 2, "bang-kr-sau-thu-lai");
		expect(goi.cycles).toBe(lan0 + 2);
		expect(trangThai("ST-tongquan-loi")).toBeNull();
		expect(vaoKhoi.at(-1)).toEqual({ cycleId: "ky-1", userId: null });
	});

	const CA_KR_LOI = [
		{
			ten: "tong-quan",
			props: {},
			ma: "ST-tongquan-loi",
			cau: CAU_BAN,
			goiChuKy: true,
		},
		{
			ten: "trang-mot-nguoi",
			props: { cycleId: "ky-1", userId: "u-2" },
			ma: "ST-nguoi-loi",
			cau: CAU_NGUOI,
			goiChuKy: false,
		},
	] as const;

	for (const ca of CA_KR_LOI)
		test(`kr-loi ${ca.ten}: cau loi dung chu ngu, Thu lai goi lai KR`, async () => {
			traKhoi = hong;
			await mo(ca.props);
			await cho(
				() => trangThai(ca.ma) !== null,
				`khoi-kr-loi-khong-co-thu-lai ${ca.ten}`,
			);
			const o = trangThai(ca.ma);
			if (!o) throw new Error(`khoi-kr-loi-khong-co-thu-lai ${ca.ten}`);
			laLoiXem(o, ca.cau);
			const lan0 = goi.khoi;
			traKhoi = () => MOT_KR;
			await bam(nutThuLai(o));
			await cho(() => hang().length === 1, `bang-kr-sau-thu-lai ${ca.ten}`);
			expect(goi.khoi).toBe(lan0 + 1);
			expect(goi.cycles > 0).toBe(ca.goiChuKy);
		});

	test("doi-chung a: chu ky tai xong ma khong co ky hien tai thi khong hien khoi", async () => {
		traChuKy = () => KHONG_KY;
		await mo({});
		await cho(() => goi.cycles >= 1, "goi okr.cycles");
		for (let vong = 0; vong < 5; vong += 1) await nhip();
		if (khoi().length !== 0)
			throw new Error(
				`khong-chu-ky-phai-an-khoi — ${document.body.textContent}`,
			);
		expect(document.body.querySelector("[data-trang-thai$='-loi']")).toBeNull();
	});

	test("doi-chung b: chu ky dang tai thi hien khung cho, khong hien loi", async () => {
		traChuKy = treo;
		await mo({});
		await cho(() => goi.cycles >= 1, "goi okr.cycles");
		expect(khoi().length).toBe(1);
		expect(khoi()[0]?.querySelector("[data-slot='skeleton']")).not.toBeNull();
		expect(document.body.querySelector("[data-trang-thai$='-loi']")).toBeNull();
	});
	test("tai-lai-nen: chu ky tai lai o nen loi thi bang KR cu giu nguyen, khong doi sang cau loi", async () => {
		const client = await mo({});
		await cho(() => hang().length === 2, "bang-kr-lan-dau");
		const lan0 = goi.cycles;
		traChuKy = hong;
		await act(async () => {
			await client.refetchQueries({ queryKey: ["okr.cycles"] });
		});
		for (let vong = 0; vong < 5; vong += 1) await nhip();
		expect(goi.cycles).toBeGreaterThan(lan0);
		if (hang().length !== 2 || trangThai("ST-tongquan-loi") !== null)
			throw new Error(
				`bang-kr-mat-khi-chu-ky-tai-lai-loi — ${document.body.textContent}`,
			);
	});
});
