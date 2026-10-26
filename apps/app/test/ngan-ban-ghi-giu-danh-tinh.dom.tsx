import { afterEach, describe, expect, test } from "bun:test";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import {
	type DehydratedState,
	dehydrate,
	hashKey,
	QueryClient,
	QueryClientProvider,
	useQuery,
} from "@tanstack/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "api/app-router";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { NapSanKhiMoNgan } from "@/components/crm/record-sheet/nap-san-khi-mo-ngan";
import {
	recordKey,
	useRecordStack,
} from "@/components/crm/record-sheet/record-stack";
import { useSauKhiTaiXong } from "@/components/crm/record-sheet/sau-khi-tai-xong";
import {
	chiKhoaNapSan,
	KHOA_NAP_SAN,
	type KhoaNapSan,
	khoaNapSan,
} from "@/lib/ngan-ban-ghi-nap-san";

const DU_LIEU = {
	"okr.access": {
		canManageProgram: true,
		headOf: { divisions: [], departments: [] },
	},
	"users.list": [
		{ id: "u1", name: "Lan", email: "lan@onehub.vn", image: null },
	],
	"giaiDoan.list": { canManage: true, tran: 0, stages: [] },
} as const;

const MINH = { id: "u2", name: "Minh", email: "minh@onehub.vn", image: null };
const KHOA_NGOAI = ["khoa-ngoai-danh-sach"] as const;

type DuLieu =
	| (typeof DU_LIEU)[KhoaNapSan]
	| readonly (typeof MINH | (typeof DU_LIEU)["users.list"][number])[];

const trpc = createTRPCOptionsProxy<AppRouter>({
	client: createTRPCClient<AppRouter>({
		links: [httpLink({ url: "http://khong-goi.test/api/trpc" })],
	}),
	queryClient: new QueryClient(),
});

const khongBaoGioXong = () => new Promise<never>(() => {});

type DieuKhien = ReturnType<typeof useRecordStack>;

type BoDieu = { hien: DieuKhien | null };

const dk: BoDieu = { hien: null };

function dieu(): DieuKhien {
	if (!dk.hien) throw new Error("gdt: chua co bo dieu khien ngan");
	return dk.hien;
}

const dem = { dung: 0, go: 0, taiXong: [] as boolean[] };

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
	dk.hien = null;
	dem.dung = 0;
	dem.go = 0;
	dem.taiXong = [];
	Reflect.deleteProperty(document, "readyState");
});

function trangDaTaiXong() {
	Object.defineProperty(document, "readyState", {
		value: "complete",
		configurable: true,
	});
}

function NguoiDieu() {
	dk.hien = useRecordStack();
	return null;
}

function DauDo() {
	useRecordStack();
	dem.taiXong.push(useSauKhiTaiXong());
	useMountEffect(() => {
		dem.dung += 1;
		return () => {
			dem.go += 1;
		};
	});
	return null;
}

function ChiKhiMo({ children }: { children: ReactNode }) {
	const { stack } = useRecordStack();
	return stack.length > 0 ? children : null;
}

function Doc({
	khoa,
	ghi,
}: {
	khoa: KhoaNapSan;
	ghi: (khoa: KhoaNapSan, data: DuLieu | undefined) => void;
}) {
	const { data } = useQuery<DuLieu>({
		queryKey: KHOA_NAP_SAN[khoa].khoa(trpc),
		queryFn: khongBaoGioXong,
	});
	ghi(khoa, data);
	return null;
}

function trangThaiMayChu(khoa: readonly KhoaNapSan[]): DehydratedState {
	const mayChu = new QueryClient();
	mayChu.setQueryData(trpc.okr.access.queryKey(), {
		...DU_LIEU["okr.access"],
		headOf: { divisions: [], departments: [] },
	});
	mayChu.setQueryData(trpc.users.list.queryKey(), [...DU_LIEU["users.list"]]);
	mayChu.setQueryData(trpc.giaiDoan.list.queryKey(), {
		...DU_LIEU["giaiDoan.list"],
		stages: [],
	});
	mayChu.setQueryData(KHOA_NGOAI, 1);
	return dehydrate(mayChu, {
		shouldDehydrateQuery: chiKhoaNapSan(khoa, trpc),
	});
}

function trinhDuyet(): QueryClient {
	return new QueryClient({
		defaultOptions: { queries: { staleTime: 30_000, retry: false } },
	});
}

async function nhip(ms = 0) {
	await act(async () => {
		await new Promise((xong) => setTimeout(xong, ms));
	});
}

async function lam(ham: (d: DieuKhien) => void) {
	await act(async () => {
		ham(dieu());
	});
	await nhip();
}

async function dung(
	client: QueryClient,
	state: DehydratedState,
	con: ReactNode,
) {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	const r = createRoot(khung);
	root = r;
	await act(async () => {
		r.render(
			<QueryClientProvider client={client}>
				<NuqsTestingAdapter hasMemory searchParams="">
					<NguoiDieu />
					<NapSanKhiMoNgan state={state}>{con}</NapSanKhiMoNgan>
				</NuqsTestingAdapter>
			</QueryClientProvider>,
		);
	});
	await nhip(20);
}

const coKhoa = (client: QueryClient, khoa: readonly unknown[]) =>
	client.getQueryCache().get(hashKey(khoa)) !== undefined;

describe("ngan-ban-ghi-giu-danh-tinh", () => {
	test("gdt-danh-tinh: chu ngan dung mot lan qua nam ham doi ngan", async () => {
		trangDaTaiXong();
		await dung(trinhDuyet(), trangThaiMayChu(khoaNapSan(false)), <DauDo />);
		const buoc: {
			ten: string;
			ham: (d: DieuKhien) => void;
			ky: string[];
		}[] = [
			{
				ten: "open company:a",
				ham: (d) => d.open({ kind: "company", id: "a" }),
				ky: ["company:a"],
			},
			{
				ten: "lotDuoi contact:c",
				ham: (d) => d.lotDuoi({ kind: "contact", id: "c" }),
				ky: ["contact:c", "company:a"],
			},
			{ ten: "close tren", ham: (d) => d.close(), ky: ["contact:c"] },
			{ ten: "close cuoi", ham: (d) => d.close(), ky: [] },
			{
				ten: "open deal:b",
				ham: (d) => d.open({ kind: "deal", id: "b" }),
				ky: ["deal:b"],
			},
			{
				ten: "thayDinh deal:d",
				ham: (d) => d.thayDinh({ kind: "deal", id: "d" }),
				ky: ["deal:d"],
			},
			{ ten: "closeAll", ham: (d) => d.closeAll(), ky: [] },
		];
		const loi: string[] = [];
		let soBuoc = 0;
		for (const b of buoc) {
			await lam(b.ham);
			const thay = dieu().stack.map(recordKey);
			if (JSON.stringify(thay) !== JSON.stringify(b.ky))
				throw new Error(
					`gdt: buoc ${b.ten} khong doi ngan dung: ${JSON.stringify(thay)}`,
				);
			soBuoc += 1;
			if (dem.dung !== 1 || dem.go !== 0)
				loi.push(
					`gdt: chu ngan dung lai khi doi ngan (sau ${b.ten}: dung ${dem.dung}, go ${dem.go})`,
				);
		}
		if (loi.length > 0) throw new Error(loi.join("\n"));
		expect(soBuoc).toBe(7);
	});

	test("gdt-tai-xong: co tai xong giu bat khi mo ngan", async () => {
		trangDaTaiXong();
		await dung(trinhDuyet(), trangThaiMayChu(khoaNapSan(false)), <DauDo />);
		for (let lan = 0; lan < 20 && dem.taiXong.at(-1) !== true; lan += 1)
			await nhip(10);
		if (dem.taiXong.at(-1) !== true)
			throw new Error("gdt: co tai xong khong bat khi ngan rong");
		const tu = dem.taiXong.length;
		await lam((d) => d.open({ kind: "deal", id: "b" }));
		await lam((d) => d.closeAll());
		await lam((d) => d.open({ kind: "deal", id: "b" }));
		await nhip(30);
		const sau = dem.taiXong.slice(tu);
		expect(sau.length).toBeGreaterThan(0);
		if (sau.includes(false))
			throw new Error(
				`gdt: ngan dong mot nhip roi moi mo (${JSON.stringify(sau)})`,
			);
	});

	test("gdt-tai-xong: doi chung, dau do dung moi bat dau tu false", async () => {
		trangDaTaiXong();
		khung = document.createElement("div");
		document.body.appendChild(khung);
		const r = createRoot(khung);
		root = r;
		act(() =>
			r.render(
				<NuqsTestingAdapter searchParams="">
					<DauDo />
				</NuqsTestingAdapter>,
			),
		);
		expect(dem.taiXong[0]).toBe(false);
	});

	test("gdt-nap-vai: ngan rong khong nap, mo ngan nap dung khoa cua vai", async () => {
		const loi: string[] = [];
		let soVai = 0;
		for (const chiOkr of [true, false]) {
			const khoa = khoaNapSan(chiOkr);
			const client = trinhDuyet();
			const dauTien = new Map<KhoaNapSan, DuLieu | undefined>();
			const ghi = (k: KhoaNapSan, data: DuLieu | undefined) => {
				if (!dauTien.has(k)) dauTien.set(k, data);
			};
			await dung(
				client,
				trangThaiMayChu(khoa),
				<ChiKhiMo>
					{khoa.map((k) => (
						<Doc key={k} khoa={k} ghi={ghi} />
					))}
				</ChiKhiMo>,
			);
			for (const k of Object.keys(KHOA_NAP_SAN) as KhoaNapSan[])
				if (coKhoa(client, KHOA_NAP_SAN[k].khoa(trpc)))
					loi.push(`gdt: ngan rong da nap san: ${k} (chiOkr ${chiOkr})`);
			if (coKhoa(client, KHOA_NGOAI))
				loi.push(`gdt: ngan rong da nap san: khoa ngoai (chiOkr ${chiOkr})`);
			await lam((d) => d.open({ kind: "deal", id: "b" }));
			for (const k of khoa) {
				if (JSON.stringify(dauTien.get(k)) !== JSON.stringify(DU_LIEU[k]))
					loi.push(
						`gdt: trang doc rong o luot ve dau sau khi mo: ${k} (chiOkr ${chiOkr})`,
					);
			}
			const tapCo = client
				.getQueryCache()
				.getAll()
				.map((q) => q.queryHash)
				.sort();
			const tapKy = khoa.map((k) => hashKey(KHOA_NAP_SAN[k].khoa(trpc))).sort();
			if (JSON.stringify(tapCo) !== JSON.stringify(tapKy))
				loi.push(
					`gdt: bo dem lech khoa cua vai (chiOkr ${chiOkr}): ${JSON.stringify(tapCo)}`,
				);
			act(() => root?.unmount());
			khung?.remove();
			root = null;
			soVai += 1;
		}
		if (loi.length > 0) throw new Error(loi.join("\n"));
		expect(soVai).toBe(2);
	});

	test("gdt-nap-vai: khoa cu hon ban may chu nhan ban may chu khi mo", async () => {
		const client = trinhDuyet();
		const state = trangThaiMayChu(khoaNapSan(false));
		const khoa = trpc.users.list.queryKey();
		client.setQueryData(khoa, [{ ...MINH }], { updatedAt: 1 });
		await dung(client, state, null);
		await lam((d) => d.open({ kind: "deal", id: "b" }));
		await nhip(10);
		const co = client.getQueryData(khoa);
		if (JSON.stringify(co) !== JSON.stringify(DU_LIEU["users.list"]))
			throw new Error(
				`gdt: khoa cu khong nhan ban may chu moi hon (${JSON.stringify(co)})`,
			);
	});

	test("gdt-khong-de: du lieu moi hon cua trinh duyet khong bi ban may chu de", async () => {
		const client = trinhDuyet();
		const khoa = trpc.users.list.queryKey();
		const doc: (DuLieu | undefined)[] = [];
		await dung(
			client,
			trangThaiMayChu(khoaNapSan(false)),
			<ChiKhiMo>
				<Doc khoa="users.list" ghi={(_, d) => doc.push(d)} />
			</ChiKhiMo>,
		);
		await lam((d) => d.open({ kind: "deal", id: "b" }));
		const moi = [...DU_LIEU["users.list"], MINH];
		act(() => {
			client.setQueryData(khoa, moi, { updatedAt: Date.now() + 60_000 });
		});
		await lam((d) => d.closeAll());
		const tu = doc.length;
		await lam((d) => d.open({ kind: "deal", id: "b" }));
		await nhip(10);
		const luotDau = doc[tu];
		const sauCung = client.getQueryData(khoa);
		if (
			JSON.stringify(luotDau) !== JSON.stringify(moi) ||
			JSON.stringify(sauCung) !== JSON.stringify(moi)
		)
			throw new Error(
				`gdt: du lieu moi bi ban may chu de (luot dau ${JSON.stringify(luotDau)}, sau ${JSON.stringify(sauCung)})`,
			);
	});

	test("gdt-khong-de: doi chung, khoa da go thi nhan ban may chu khi mo lai", async () => {
		const client = trinhDuyet();
		const khoa = trpc.users.list.queryKey();
		await dung(client, trangThaiMayChu(khoaNapSan(false)), null);
		await lam((d) => d.open({ kind: "deal", id: "b" }));
		await lam((d) => d.closeAll());
		client.removeQueries({ queryKey: khoa, exact: true });
		await lam((d) => d.open({ kind: "deal", id: "b" }));
		expect(JSON.stringify(client.getQueryData(khoa))).toBe(
			JSON.stringify(DU_LIEU["users.list"]),
		);
	});
});
