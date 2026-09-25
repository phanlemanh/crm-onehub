import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import {
	allowanceListOutput,
	workspaceOutput,
} from "../../api/src/workspace/workspace.contracts";

type DanhSach = RouterOutputs["workspace"]["allowances"];
type TrangThai = DanhSach["rows"][number]["status"];

const TREO = Symbol("treo");

type ChonThuTuc = {
	onSuccess?: () => void;
	onError?: (error: { message: string }) => void;
};

let docDanhSach: () => DanhSach | typeof TREO = () => TREO;

function quaJson<T>(giaTri: T): T {
	return JSON.parse(JSON.stringify(giaTri));
}

function khongGioTra<T>(): Promise<T> {
	return new Promise<T>(() => {});
}

const khongDoc = () => {
	throw new Error("khong doc thu tuc nay");
};

function thuTuc(ten: string, doc: () => unknown) {
	return {
		queryKey: () => [ten],
		pathKey: () => [ten],
		queryOptions: () => ({
			queryKey: [ten],
			queryFn: async () => doc(),
		}),
		mutationOptions: (chon: ChonThuTuc = {}) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: async () => khongDoc(),
		}),
	};
}

const WORKSPACE = quaJson(
	workspaceOutput.parse({
		id: "ws",
		slug: "ws",
		name: "OneHub",
		website: null,
		onboarded: true,
		viewerRole: "admin",
		canRename: true,
		canChangeRoles: true,
		canManageMembers: true,
		canIssuePasswordLink: true,
		canManageSettings: true,
	}),
) satisfies RouterOutputs["workspace"]["get"];

function danhSach(trangThai: TrangThai[]): DanhSach {
	return quaJson(
		allowanceListOutput.parse({
			rows: trangThai.map((status, i) => ({
				id: `al-${i}`,
				email: `dia-chi-${i}@thu.test`,
				role: "member",
				status,
				invitedByName: "Ada Okafor",
				createdAt: "2026-09-20T03:00:00.000Z",
				passwordLinkIssuedAt: null,
				passwordLinkIssuedByName: null,
			})),
		}),
	) satisfies DanhSach;
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		workspace: {
			get: thuTuc("workspace.get", () => WORKSPACE),
			allowances: {
				...thuTuc("workspace.allowances", khongDoc),
				queryOptions: () => ({
					queryKey: ["workspace.allowances"],
					queryFn: async () => {
						const ket = docDanhSach();
						return ket === TREO ? khongGioTra<DanhSach>() : ket;
					},
				}),
			},
			allowEmail: thuTuc("workspace.allowEmail", khongDoc),
			revokeAllowance: thuTuc("workspace.revokeAllowance", khongDoc),
			issuePasswordLink: thuTuc("workspace.issuePasswordLink", khongDoc),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({ workspace: async () => {} }),
}));

const { AllowancesTable } = await import(
	"@/app/(app)/[slug]/settings/members/allowances-table"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { thanhVienMessages } = await import(
	"@/lib/messages/settings-thanh-vien"
);

const t = thanhVienMessages("vi");

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

afterEach(() => {
	for (const { o, root } of dangMo) {
		act(() => root.unmount());
		o.remove();
	}
	dangMo = [];
});

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 120; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi trang thai ${moTa} — noi dung: ${document.body.textContent?.slice(0, 400)}`,
	);
}

async function mo(): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	client.setQueryData(["workspace.get"], WORKSPACE);
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">
					<AllowancesTable />
				</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	dangMo.push({ o, root });
	return o;
}

function tieuDe(o: HTMLElement): string {
	return (
		o.querySelector("section [data-slot=card-title]")?.textContent?.trim() ??
		"(khong co card-title trong section)"
	);
}

describe("khoi Duoc phep vao", () => {
	test("dang-tai: the co tieu de va khung xuong, khong in cau rong", async () => {
		docDanhSach = () => TREO;
		const o = await mo();
		await cho(
			() => o.textContent?.includes(t.duocPhepVao.tieuDe) === true,
			"tieu de khoi",
		);

		expect(
			tieuDe(o).startsWith(t.duocPhepVao.tieuDe),
			"tieu de khi dang tai",
		).toBe(true);
		expect(
			o.querySelectorAll("section [data-slot=skeleton]").length >= 3,
			`khung xuong: ${o.querySelectorAll("[data-slot=skeleton]").length} >= 3`,
		).toBe(true);
		expect(
			o.textContent?.includes(t.duocPhepVao.trong),
			"cau rong hien khi dang tai",
		).toBe(false);
	});

	test("dang-tai doi chung: co du lieu thi het khung xuong", async () => {
		docDanhSach = () => danhSach(["pending"]);
		const o = await mo();
		await cho(
			() => o.textContent?.includes("dia-chi-0@thu.test") === true,
			"hang dia-chi-0",
		);

		expect(o.querySelectorAll("[data-slot=skeleton]").length).toBe(0);
	});

	test("rong: tieu de dem 0 va cau rong trong CardTableEmpty, khong co bang", async () => {
		docDanhSach = () => danhSach([]);
		const o = await mo();
		await cho(
			() => o.textContent?.includes(t.duocPhepVao.trong) === true,
			"cau rong",
		);

		expect(tieuDe(o)).toBe(t.dem(t.duocPhepVao.tieuDe, 0));
		const rong = o.querySelector("section [data-slot=card-table-empty]");
		expect(rong?.textContent?.trim(), "khong co card-table-empty").toBe(
			t.duocPhepVao.trong,
		);
		expect(o.querySelectorAll("section table").length).toBe(0);
	});

	test("rong: chi co loi cho phep da rut thi van la rong", async () => {
		docDanhSach = () => danhSach(["canceled"]);
		const o = await mo();
		await cho(
			() => o.textContent?.includes(t.duocPhepVao.trong) === true,
			"cau rong",
		);

		expect(tieuDe(o)).toBe(t.dem(t.duocPhepVao.tieuDe, 0));
		expect(
			o.querySelector("section [data-slot=card-table-empty]"),
		).not.toBeNull();
		expect(o.textContent?.includes("dia-chi-0@thu.test")).toBe(false);
	});

	test("rong doi chung: mot loi cho phep dang cho thi co bang, khong CardTableEmpty", async () => {
		docDanhSach = () => danhSach(["pending", "canceled"]);
		const o = await mo();
		await cho(
			() => o.textContent?.includes("dia-chi-0@thu.test") === true,
			"hang dia-chi-0",
		);

		expect(tieuDe(o)).toBe(t.dem(t.duocPhepVao.tieuDe, 1));
		expect(o.querySelectorAll("section table").length).toBe(1);
		expect(o.querySelector("[data-slot=card-table-empty]")).toBeNull();
	});
});
