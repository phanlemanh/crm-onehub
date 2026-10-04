import { afterEach, describe, expect, mock, test } from "bun:test";
import {
	type QueryClient,
	QueryClientProvider,
	useQueryClient,
} from "@tanstack/react-query";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { makeQueryClient } from "@/lib/trpc/query-client";
import {
	staffDomainsOutput,
	workspaceOutput,
} from "../../api/src/workspace/workspace.contracts";
import {
	TEN_MIEN_DA_LUU_AC1,
	TEN_MIEN_GO_AC1,
} from "../../api/test/thanh-vien-vao-dung.fixture";

type TenMien = ReturnType<typeof staffDomainsOutput.parse>;

const KHOA_LAM_MOI_WORKSPACE = [
	"workspace.get",
	"workspace.members",
	"workspace.allowances",
	"workspace.staffDomains",
];

let docTenMien: () => Promise<TenMien> = async () => taoTenMien([], true);
let luuTenMien: (vao: { domains: string[] }) => Promise<TenMien> = async () =>
	taoTenMien([], true);
let soLanDoc = 0;
let daGui: { domains: string[] }[] = [];

function taoTenMien(domains: string[], canEdit: boolean): TenMien {
	return JSON.parse(
		JSON.stringify(staffDomainsOutput.parse({ domains, canEdit })),
	);
}

const WORKSPACE = JSON.parse(
	JSON.stringify(
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
	),
);

function thuTuc(
	ten: string,
	doc: () => Promise<unknown>,
	ghi: (vao: never) => Promise<unknown> = async () => {
		throw new Error(`khong ghi ${ten}`);
	},
) {
	return {
		queryKey: () => [ten],
		pathKey: () => [ten],
		queryOptions: () => ({ queryKey: [ten], queryFn: doc }),
		mutationOptions: (chon: Record<string, unknown> = {}) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: ghi,
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		workspace: {
			get: thuTuc("workspace.get", async () => WORKSPACE),
			staffDomains: thuTuc("workspace.staffDomains", async () => {
				soLanDoc += 1;
				return docTenMien();
			}),
			setStaffDomains: thuTuc(
				"workspace.setStaffDomains",
				async () => taoTenMien([], true),
				async (vao: { domains: string[] }) => {
					daGui = [...daGui, vao];
					return luuTenMien(vao);
				},
			),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => {
		const client = useQueryClient();
		return {
			workspace: async () => {
				await Promise.all(
					KHOA_LAM_MOI_WORKSPACE.map((khoa) =>
						client.invalidateQueries({ queryKey: [khoa] }),
					),
				);
			},
		};
	},
}));

const { TenMienNoiBo } = await import(
	"@/app/(app)/[slug]/settings/members/ten-mien-noi-bo"
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
	soLanDoc = 0;
	daGui = [];
});

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

function khachHang(): QueryClient {
	const client = makeQueryClient();
	client.setDefaultOptions({ queries: { retry: false, staleTime: 0 } });
	return client;
}

async function mo(con: ReactNode, client = khachHang()): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">{con}</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	dangMo.push({ o, root });
	return o;
}

function oNhap(o: HTMLElement): HTMLInputElement | null {
	return o.querySelector<HTMLInputElement>("form input");
}

function nutLuu(o: HTMLElement): HTMLButtonElement | null {
	return (
		[...o.querySelectorAll<HTMLButtonElement>("button")].find(
			(b) => b.textContent?.trim() === t.tenMienNoiBo.luu,
		) ?? null
	);
}

async function go(o: HTMLElement, chu: string): Promise<void> {
	const input = oNhap(o);
	if (!input) throw new Error("khong thay o nhap ten mien");
	const dat = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		dat?.call(input, chu);
		input.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

async function bamLuu(o: HTMLElement): Promise<void> {
	const form = o.querySelector("form");
	if (!form) throw new Error("khong thay form");
	await act(async () => {
		form.dispatchEvent(
			new Event("submit", { bubbles: true, cancelable: true }),
		);
	});
}

const khongBaoGio = <T,>() => new Promise<T>(() => {});

describe("the-ten-mien", () => {
	test("dang-tai: khung xuong, khong o nhap", async () => {
		docTenMien = khongBaoGio;
		const o = await mo(<TenMienNoiBo />);
		await cho(
			() => o.textContent?.includes(t.tenMienNoiBo.tieuDe) === true,
			"tieu de",
		);

		expect([
			o.querySelectorAll("[data-slot=skeleton]").length >= 3,
			oNhap(o) === null,
			"dang-tai",
		]).toEqual([true, true, "dang-tai"]);
	});

	test("rong: cau rong, o trong", async () => {
		docTenMien = async () => taoTenMien([], true);
		const o = await mo(<TenMienNoiBo />);
		await cho(() => oNhap(o) !== null, "o nhap");

		expect([
			oNhap(o)?.value,
			o.textContent?.includes(t.tenMienNoiBo.rong),
			"rong",
		]).toEqual(["", true, "rong"]);
	});

	test("co: hien danh sach, Luu tat khi chua sua", async () => {
		docTenMien = async () => taoTenMien(["onehub.center", "onehub.vn"], true);
		const o = await mo(<TenMienNoiBo />);
		await cho(
			() => oNhap(o)?.value !== undefined && oNhap(o)?.value !== "",
			"o co gia tri",
		);

		expect([oNhap(o)?.value, nutLuu(o)?.disabled, "co"]).toEqual([
			"onehub.center, onehub.vn",
			true,
			"co",
		]);
	});

	test("dang-luu: spinner, o khoa", async () => {
		docTenMien = async () => taoTenMien(["onehub.center"], true);
		luuTenMien = khongBaoGio;
		const o = await mo(<TenMienNoiBo />);
		await cho(() => oNhap(o)?.value === "onehub.center", "o co gia tri");
		await go(o, "onehub.center, onehub.vn");
		await bamLuu(o);
		await cho(() => o.querySelector("[data-slot=spinner]") !== null, "spinner");

		expect([oNhap(o)?.disabled, nutLuu(o)?.disabled, "dang-luu"]).toEqual([
			true,
			true,
			"dang-luu",
		]);
	});

	test("khoa: thanh vien thuong thay o va Luu bi khoa cung dong ly do", async () => {
		docTenMien = async () => taoTenMien(["onehub.center"], false);
		const o = await mo(<TenMienNoiBo />);
		await cho(() => oNhap(o) !== null, "o nhap");

		expect([
			oNhap(o)?.disabled,
			nutLuu(o)?.disabled,
			o.textContent?.includes(t.tenMienNoiBo.khoa),
			"khoa",
		]).toEqual([true, true, true, "khoa"]);
	});

	test("khoa doi chung: quan tri khong bi khoa, khong co dong ly do", async () => {
		docTenMien = async () => taoTenMien(["onehub.center"], true);
		const o = await mo(<TenMienNoiBo />);
		await cho(() => oNhap(o) !== null, "o nhap");

		expect([
			oNhap(o)?.disabled,
			o.textContent?.includes(t.tenMienNoiBo.khoa),
			"khoa doi chung",
		]).toEqual([false, false, "khoa doi chung"]);
	});

	test("loi-tai: Empty co Thu lai, bam thi doc lai", async () => {
		let lan = 0;
		docTenMien = async () => {
			lan += 1;
			if (lan === 1) throw new Error("mang chap chon");
			return taoTenMien(["onehub.vn"], true);
		};
		const o = await mo(<TenMienNoiBo />);
		await cho(
			() => o.textContent?.includes(t.tenMienNoiBo.loiTai) === true,
			"cau loi tai",
		);
		const thuLai = [...o.querySelectorAll("button")].find(
			(b) => b.textContent?.trim() === t.tenMienNoiBo.thuLai,
		);
		const coEmpty = o.querySelector("[data-slot=empty]") !== null;
		await act(async () => thuLai?.click());
		await cho(() => oNhap(o)?.value === "onehub.vn", "o sau khi thu lai");

		expect([coEmpty, thuLai !== undefined, soLanDoc, "loi-tai"]).toEqual([
			true,
			true,
			2,
			"loi-tai",
		]);
	});

	test("loi-nhap: loi cua API nam duoi o, chu da go con nguyen", async () => {
		docTenMien = async () => taoTenMien(["onehub.center"], true);
		const LOI =
			"gmail.com is a public mail domain, not one of ours. Remove it and save again.";
		luuTenMien = async () => {
			throw new Error(LOI);
		};
		const o = await mo(<TenMienNoiBo />);
		await cho(() => oNhap(o)?.value === "onehub.center", "o co gia tri");
		await go(o, "onehub.center, gmail.com");
		await bamLuu(o);
		await cho(
			() => o.querySelector("[data-slot=field-error]") !== null,
			"loi duoi o",
		);

		expect([
			o.querySelector("[data-slot=field-error]")?.textContent?.includes(LOI),
			oNhap(o)?.value,
			"chu da go",
		]).toEqual([true, "onehub.center, gmail.com", "chu da go"]);
	});

	test("luu-xong: gui mang da tach, o hien ban chuan hoa, Luu tat lai", async () => {
		let daLuu: TenMien = taoTenMien([], true);
		docTenMien = async () => daLuu;
		luuTenMien = async () => {
			daLuu = taoTenMien(
				TEN_MIEN_DA_LUU_AC1.domains,
				TEN_MIEN_DA_LUU_AC1.canEdit,
			);
			return daLuu;
		};
		const o = await mo(<TenMienNoiBo />);
		await cho(() => oNhap(o) !== null, "o nhap");
		await go(o, TEN_MIEN_GO_AC1);
		await bamLuu(o);
		await cho(
			() => oNhap(o)?.value === "onehub.center, onehub.vn",
			"o hien ban chuan hoa",
		);

		expect([daGui, nutLuu(o)?.disabled, "o hien ban chuan hoa"]).toEqual([
			[{ domains: ["@OneHub.Center", "onehub.vn", "onehub.center"] }],
			true,
			"o hien ban chuan hoa",
		]);
	});
});
