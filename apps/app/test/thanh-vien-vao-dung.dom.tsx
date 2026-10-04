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
let docWorkspace: () => Promise<unknown> = async () => WORKSPACE;
let choPhep: (vao: { email: string }) => Promise<unknown> = async () => {
	throw new Error("khong cho phep");
};
let docDanhSach: () => Promise<unknown> = async () => ({ rows: [] });
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

type ChonThuTuc = {
	onSuccess?: () => unknown;
	onError?: (error: Error) => unknown;
	onSettled?: () => unknown;
};

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
		mutationOptions: (chon: ChonThuTuc = {}) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: ghi,
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		workspace: {
			get: thuTuc("workspace.get", () => docWorkspace()),
			allowances: thuTuc("workspace.allowances", () => docDanhSach()),
			allowEmail: thuTuc(
				"workspace.allowEmail",
				async () => null,
				(vao: { email: string }) => choPhep(vao),
			),
			revokeAllowance: thuTuc("workspace.revokeAllowance", async () => null),
			issuePasswordLink: thuTuc(
				"workspace.issuePasswordLink",
				async () => null,
			),
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

async function cho(
	xong: () => boolean,
	moTa: string,
	toiDaMs = 0,
): Promise<void> {
	const het = Date.now() + toiDaMs;
	for (let vong = 0; vong < 200 || Date.now() < het; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, vong < 200 ? 0 : 20));
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

const { ChoPhepDiaChi } = await import(
	"@/app/(app)/[slug]/settings/members/cho-phep-dia-chi"
);
const { AllowancesTable } = await import(
	"@/app/(app)/[slug]/settings/members/allowances-table"
);
const { WORKSPACE_CONFIG } = await import(
	"../../api/src/workspace/workspace-config"
);
const { allowanceListOutput } = await import(
	"../../api/src/workspace/workspace.contracts"
);
const { dehydrate, HydrationBoundary } = await import("@tanstack/react-query");
const { readFileSync } = await import("node:fs");
const { join } = await import("node:path");

const KHONG_QUYEN = "Only an owner or an admin can allow an address.";
const THANH_VIEN_THUONG = {
	...WORKSPACE,
	viewerRole: "member",
	canManageMembers: false,
};

function nutChoPhep(): HTMLButtonElement | null {
	return (
		[...document.querySelectorAll<HTMLButtonElement>("button")].find(
			(b) => b.textContent?.trim() === t.duocPhepVao.nutThem,
		) ?? null
	);
}

function hop(): HTMLElement | null {
	return document.querySelector<HTMLElement>("[role=dialog]");
}

async function choPhepQuaHop(email: string): Promise<void> {
	await act(async () => nutChoPhep()?.click());
	await cho(() => hop() !== null, "hop mo");
	const input = hop()?.querySelector<HTMLInputElement>("input[type=email]");
	const dat = Object.getOwnPropertyDescriptor(
		HTMLInputElement.prototype,
		"value",
	)?.set;
	await act(async () => {
		if (input) {
			dat?.call(input, email);
			input.dispatchEvent(new Event("input", { bubbles: true }));
		}
	});
	await act(async () => {
		hop()
			?.querySelector("form")
			?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
	});
}

const nghi = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("nut-dau-trang", () => {
	test("ssr-loi: prefetch may chu loi, trinh duyet doc lai duoc thi nut hien", async () => {
		const mayChu = makeQueryClient();
		await mayChu.prefetchQuery({
			queryKey: ["workspace.get"],
			queryFn: async () => {
				throw new Error("mang chap chon");
			},
		});
		const trangThai = dehydrate(mayChu);
		docWorkspace = async () => WORKSPACE;
		await mo(
			<HydrationBoundary state={trangThai}>
				<ChoPhepDiaChi />
			</HydrationBoundary>,
			makeQueryClient(),
		);
		await cho(() => nutChoPhep() !== null, "nut sau loi ssr");

		const trang = readFileSync(
			join(
				import.meta.dir,
				"..",
				"app",
				"(app)",
				"[slug]",
				"settings",
				"members",
				"page.tsx",
			),
			"utf8",
		);
		const dauTrang = trang.slice(
			trang.indexOf("async function HanhDongDauTrang"),
			trang.indexOf("async function Members({"),
		);

		expect([
			nutChoPhep() !== null,
			dauTrang.includes("quyenQuanTri"),
			dauTrang.includes("<HydrateClient>"),
			"nut sau loi ssr",
		]).toEqual([true, false, true, "nut sau loi ssr"]);
	});

	test("sau-loi: lan doc dau loi mang, lan sau thanh cong thi nut hien", async () => {
		let lan = 0;
		docWorkspace = async () => {
			lan += 1;
			if (lan === 1) throw new Error("mang chap chon");
			return WORKSPACE;
		};
		await mo(<ChoPhepDiaChi />, makeQueryClient());
		await cho(() => nutChoPhep() !== null && lan >= 2, "nut sau loi", 5000);

		expect([lan >= 2, nutChoPhep() !== null, "sau-loi"]).toEqual([
			true,
			true,
			"sau-loi",
		]);
	});

	test("khong-quyen: thanh vien thuong khong thay nut", async () => {
		let daDoc = false;
		docWorkspace = async () => {
			daDoc = true;
			return THANH_VIEN_THUONG;
		};
		await mo(<ChoPhepDiaChi />);
		await cho(() => daDoc, "da doc workspace");
		await act(async () => nghi(20));

		expect([nutChoPhep() === null, "khong-quyen"]).toEqual([
			true,
			"khong-quyen",
		]);
	});

	test("loi-mai: doc loi mai thi nut van hien; bam vao, API chan 403 trong hop", async () => {
		docWorkspace = async () => {
			throw new Error("mang chap chon");
		};
		choPhep = async () => {
			throw new Error(KHONG_QUYEN);
		};
		await mo(<ChoPhepDiaChi />);
		await cho(() => nutChoPhep() !== null, "nut sau loi");
		await choPhepQuaHop("ai@onehub.vn");
		await cho(
			() => hop()?.textContent?.includes(KHONG_QUYEN) === true,
			"thong diep 403",
		);

		expect([hop() !== null, "hop van mo"]).toEqual([true, "hop van mo"]);
	});
});

describe("hop-cho-phep", () => {
	test("da-la-thanh-vien: hop giu mo voi thong diep cua API", async () => {
		docWorkspace = async () => WORKSPACE;
		choPhep = async () => {
			throw new Error(WORKSPACE_CONFIG.messages.alreadyAMember);
		};
		await mo(<ChoPhepDiaChi />);
		await cho(() => nutChoPhep() !== null, "nut");
		await choPhepQuaHop("Lan.Nguyen@OneHub.vn");
		await cho(
			() =>
				hop()?.textContent?.includes(
					WORKSPACE_CONFIG.messages.alreadyAMember,
				) === true,
			"thong diep da la thanh vien",
		);

		expect([hop() !== null, "hop van mo"]).toEqual([true, "hop van mo"]);
	});
});

describe("duoc-phep-vao", () => {
	test("treo-khong-dem: dong da doc thanh accepted khong vao khoi, khong vao so dem", async () => {
		docWorkspace = async () => WORKSPACE;
		const hang = (i: number, status: string) => ({
			id: `al-${i}`,
			email: `dia-chi-${i}@thu.test`,
			role: "member",
			status,
			invitedByName: "Ada Okafor",
			createdAt: "2026-10-04T03:00:00.000Z",
			passwordLinkIssuedAt: null,
			passwordLinkIssuedByName: null,
		});
		docDanhSach = async () =>
			JSON.parse(
				JSON.stringify(
					allowanceListOutput.parse({
						rows: [hang(0, "pending"), hang(1, "pending"), hang(2, "accepted")],
					}),
				),
			);
		const o = await mo(<AllowancesTable />);
		await cho(
			() => o.textContent?.includes("dia-chi-0@thu.test") === true,
			"hang dau",
		);

		expect([
			o.querySelector("section [data-slot=card-title]")?.textContent?.trim(),
			o.textContent?.includes("dia-chi-2@thu.test"),
			"khong tinh dong treo",
		]).toEqual([t.dem(t.duocPhepVao.tieuDe, 2), false, "khong tinh dong treo"]);
	});
});
