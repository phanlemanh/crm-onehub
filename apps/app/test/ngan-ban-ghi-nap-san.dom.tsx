import { afterEach, describe, expect, test } from "bun:test";
import {
	type DehydratedState,
	dehydrate,
	HydrationBoundary,
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
	chiKhoaNapSan,
	KHOA_NAP_SAN,
	type KhoaNapSan,
	khoaNapSan,
} from "@/lib/ngan-ban-ghi-nap-san";

const MA_TRAN: readonly KhoaNapSan[] = [
	"okr.access",
	"users.list",
	"giaiDoan.list",
];

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

const trpc = createTRPCOptionsProxy<AppRouter>({
	client: createTRPCClient<AppRouter>({
		links: [httpLink({ url: "http://khong-goi.test/api/trpc" })],
	}),
	queryClient: new QueryClient(),
});

const khongBaoGioXong = () => new Promise<never>(() => {});

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
});

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
	return dehydrate(mayChu, {
		shouldDehydrateQuery: chiKhoaNapSan(khoa, trpc),
	});
}

function trinhDuyet(): QueryClient {
	return new QueryClient({
		defaultOptions: { queries: { staleTime: 30_000, retry: false } },
	});
}

function Doc({
	khoa,
	ghi,
}: {
	khoa: KhoaNapSan;
	ghi?: (data: unknown) => void;
}) {
	const { data } = useQuery({
		queryKey: KHOA_NAP_SAN[khoa].khoa(trpc),
		queryFn: khongBaoGioXong,
	});
	ghi?.(data);
	return null;
}

function Khung({
	client,
	record,
	children,
}: {
	client: QueryClient;
	record: string;
	children: ReactNode;
}) {
	return (
		<QueryClientProvider client={client}>
			<NuqsTestingAdapter searchParams={record ? `?record=${record}` : ""}>
				{children}
			</NuqsTestingAdapter>
		</QueryClientProvider>
	);
}

function moRoot(): Root {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	return root;
}

function lanDauCuaTrang(
	khoa: KhoaNapSan,
	trangThai: DehydratedState,
	nganNapSan: boolean,
): unknown {
	const client = trinhDuyet();
	const r = moRoot();
	const ngan = nganNapSan ? (
		<NapSanKhiMoNgan state={trangThai}>
			<Doc khoa={khoa} />
		</NapSanKhiMoNgan>
	) : (
		<Doc khoa={khoa} />
	);
	act(() =>
		r.render(
			<Khung client={client} record="deal:x">
				{ngan}
			</Khung>,
		),
	);
	const doc: unknown[] = [];
	act(() =>
		r.render(
			<Khung client={client} record="deal:x">
				{ngan}
				<HydrationBoundary state={trangThai}>
					<Doc khoa={khoa} ghi={(d) => doc.push(d)} />
				</HydrationBoundary>
			</Khung>,
		),
	);
	return doc[0];
}

describe("ngan-ban-ghi-nap-san", () => {
	test("khoa nap san theo vai: chi-OKR chi okr.access, vai khac du ba khoa", () => {
		expect(khoaNapSan(true)).toEqual(["okr.access"]);
		expect(khoaNapSan(false)).toEqual([...MA_TRAN]);
	});

	test("khoa loc trung khoa ma prefetch va ngan ghi vao bo dem", () => {
		const khoaThat = {
			"okr.access": trpc.okr.access.queryOptions().queryKey,
			"users.list": trpc.users.list.queryOptions().queryKey,
			"giaiDoan.list": trpc.giaiDoan.list.queryOptions().queryKey,
		} satisfies Record<KhoaNapSan, readonly unknown[]>;
		const lech = MA_TRAN.filter(
			(k) => hashKey(KHOA_NAP_SAN[k].khoa(trpc)) !== hashKey(khoaThat[k]),
		);
		if (lech.length > 0)
			throw new Error(
				lech.map((k) => `khoa loc lech khoa that: ${k}`).join("\n"),
			);
	});

	test("ngan nap san truoc: trang doc du lieu ngay lan render dau voi moi khoa", () => {
		const trangThai = trangThaiMayChu(khoaNapSan(false));
		const rong: string[] = [];
		for (const k of MA_TRAN) {
			const dau = lanDauCuaTrang(k, trangThai, true);
			act(() => root?.unmount());
			if (dau === undefined) rong.push(`trang doc rong luc hydrate: ${k}`);
			else expect(dau).toEqual(DU_LIEU[k]);
		}
		if (rong.length > 0) throw new Error(rong.join("\n"));
	});

	test("doi chung: ngan khong nap san tao khoa rong thi trang doc rong o lan render dau", () => {
		const trangThai = trangThaiMayChu(khoaNapSan(false));
		for (const k of MA_TRAN) {
			const dau = lanDauCuaTrang(k, trangThai, false);
			act(() => root?.unmount());
			expect(dau).toBeUndefined();
		}
	});

	test("ngan rong khong nap: khong record= thi bo dem khong co khoa nap san nao", () => {
		const trangThai = trangThaiMayChu(khoaNapSan(false));
		const coMat = (record: string) => {
			const client = trinhDuyet();
			const r = moRoot();
			act(() =>
				r.render(
					<Khung client={client} record={record}>
						<NapSanKhiMoNgan state={trangThai}>
							<span />
						</NapSanKhiMoNgan>
					</Khung>,
				),
			);
			act(() => r.unmount());
			return MA_TRAN.filter(
				(k) =>
					client.getQueryCache().find({
						queryKey: KHOA_NAP_SAN[k].khoa(trpc),
						exact: true,
					}) !== undefined,
			);
		};
		const khiRong = coMat("");
		if (khiRong.length > 0)
			throw new Error(
				khiRong.map((k) => `nap san khi ngan rong: ${k}`).join("\n"),
			);
		expect(coMat("deal:x")).toEqual([...MA_TRAN]);
	});
});
