import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { TreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";

type DauVao = { [khoa: string]: string | string[] | null | undefined };
let daGoi: { ten: string; dauVao: DauVao }[] = [];

function thuTuc(ten: string) {
	return {
		queryKey: () => [ten],
		queryOptions: () => ({ queryKey: [ten], queryFn: async () => null }),
		mutationOptions: (
			chon: {
				onSuccess?: () => void;
				onError?: (e: Error) => void;
				onSettled?: () => void;
			} = {},
		) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: async (dauVao: DauVao) => {
				daGoi.push({ ten, dauVao: JSON.parse(JSON.stringify(dauVao)) });
				return { id: "ok" };
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		org: {
			tree: thuTuc("tree"),
			createDivision: thuTuc("createDivision"),
			createDepartment: thuTuc("createDepartment"),
			renameDivision: thuTuc("renameDivision"),
			renameDepartment: thuTuc("renameDepartment"),
			setHead: thuTuc("setHead"),
			moveDepartment: thuTuc("moveDepartment"),
			setPlacement: thuTuc("setPlacement"),
		},
		onboarding: {
			listDepartments: thuTuc("listDepartments"),
			manDanhMuc: thuTuc("manDanhMuc"),
		},
	}),
}));

const { HopThoaiDonVi } = await import(
	"@/app/(app)/[slug]/settings/organization/hop-thoai-don-vi"
);
const { HopThoaiViTri } = await import(
	"@/app/(app)/[slug]/settings/organization/hop-thoai-vi-tri"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { toChucMessages } = await import("@/lib/messages/to-chuc");
const { TO_CHUC_TRAN } = await import("@crm/validation/to-chuc");

const m = toChucMessages("vi");
const LAN = { id: "lan", name: "Nguyễn Thị Lan", email: "lan@onehub.vn" };
const PB = {
	id: "pb-1",
	name: "Kinh doanh vùng 1",
	moTa: "Mô tả cũ.",
	position: 0,
	divisionId: "bp-kd",
	head: null,
	stepCount: 0,
	okrMo: 0,
	people: [],
};
const CAY: TreeOutput = {
	divisions: [
		{
			id: "bp-kd",
			name: "Kinh doanh",
			moTa: "",
			position: 0,
			head: null,
			okrMo: 0,
			departments: [PB],
		},
	],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [
		{
			...LAN,
			primaryDepartmentId: "pb-1",
			secondaryDepartmentIds: [],
			managerOverrideId: null,
			manager: null,
			managerSource: "khong-co",
			chucDanh: "Chuyên viên",
		},
	],
	archived: { divisions: [], departments: [] },
	coverage: { members: 1, withPrimary: 1, departmentsWithoutHead: 1 },
};

let dangMo: { o: HTMLElement; root: Root }[] = [];
async function mo(man: ReactElement) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<QueryClientProvider client={client}>
				<LocaleProvider locale="vi">{man}</LocaleProvider>
			</QueryClientProvider>,
		);
	});
	dangMo.push({ o, root });
}
async function cho(xong: () => boolean, moTa: string) {
	for (let i = 0; i < 60; i += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 400)}`,
	);
}
async function bam(o: Element | null) {
	if (!o) throw new Error("khong co nut");
	await act(async () => {
		o.dispatchEvent(
			new MouseEvent("click", { bubbles: true, cancelable: true }),
		);
	});
}
async function go(o: Element | null, chu: string) {
	if (!(o instanceof HTMLInputElement) && !(o instanceof HTMLTextAreaElement))
		throw new Error("khong phai o nhap");
	const dat = Object.getOwnPropertyDescriptor(
		Object.getPrototypeOf(o),
		"value",
	)?.set;
	await act(async () => {
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}
const q = (s: string) => document.body.querySelector(s);
const nutLuu = () =>
	[...document.body.querySelectorAll('[role="dialog"] button')].find(
		(b) => b.textContent?.trim() === m.donVi.luu,
	) ?? null;
async function guiForm() {
	const form = q('[role="dialog"] form');
	if (!form) throw new Error("khong co form");
	await act(async () => {
		form.dispatchEvent(
			new Event("submit", { bubbles: true, cancelable: true }),
		);
	});
}

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
	daGoi = [];
});

describe("mo-ta-don-vi", () => {
	test("hộp đổi tên phòng ban có ô Mô tả với gợi ý Trợ lý OKR, đếm ký tự, maxLength 500; lưu gửi renameDepartment với moTa", async () => {
		await mo(
			<HopThoaiDonVi
				cay={CAY}
				yeuCau={{
					loai: "doi-ten",
					don: "phong-ban",
					id: "pb-1",
					name: PB.name,
					moTa: PB.moTa,
				}}
				dong={() => {}}
			/>,
		);
		await cho(() => q("[data-o-mo-ta]") !== null, "o mo ta");
		const o = q("[data-o-mo-ta]");
		expect(o?.getAttribute("maxlength"), "khong chan tai man").toBe(
			String(TO_CHUC_TRAN.moTa),
		);
		expect(document.body.textContent).toContain(m.donVi.moTaGoiY);
		expect(m.donVi.moTaGoiY).toBe("Trợ lý OKR đọc mô tả này khi soạn");
		expect(q("[data-dem-mo-ta]")?.textContent).toBe(
			`${PB.moTa.length}/${TO_CHUC_TRAN.moTa}`,
		);
		const moTaMoi = "Phòng bán hàng miền Bắc, phụ trách đối tác bán lẻ.";
		await go(o, moTaMoi);
		expect(q("[data-dem-mo-ta]")?.textContent).toBe(
			`${moTaMoi.length}/${TO_CHUC_TRAN.moTa}`,
		);
		expect(nutLuu()?.hasAttribute("disabled")).toBe(false);
		await guiForm();
		await cho(() => daGoi.length > 0, "goi luu");
		expect(daGoi).toEqual([
			{
				ten: "renameDepartment",
				dauVao: { id: "pb-1", name: PB.name, moTa: moTaMoi },
			},
		]);
	});

	test("quá trần (giá trị đặt qua mã) → lỗi có số, nút Lưu khoá, không gọi thủ tục", async () => {
		await mo(
			<HopThoaiDonVi
				cay={CAY}
				yeuCau={{
					loai: "doi-ten",
					don: "bo-phan",
					id: "bp-kd",
					name: "Kinh doanh",
					moTa: "",
				}}
				dong={() => {}}
			/>,
		);
		await cho(() => q("[data-o-mo-ta]") !== null, "o mo ta");
		await go(q("[data-o-mo-ta]"), "x".repeat(TO_CHUC_TRAN.moTa + 1));
		expect(document.body.textContent).toContain(
			`${TO_CHUC_TRAN.moTa} ký tự (đang ${TO_CHUC_TRAN.moTa + 1})`,
		);
		expect(nutLuu()?.hasAttribute("disabled")).toBe(true);
		await guiForm();
		expect(daGoi).toEqual([]);
	});
});

describe("chuc-danh", () => {
	test("hộp vị trí có ô Chức danh maxLength 80 với giá trị hiện tại; lưu gửi setPlacement kèm chucDanh", async () => {
		const nguoi = CAY.people[0];
		if (!nguoi) throw new Error("fixture rong");
		await mo(<HopThoaiViTri cay={CAY} nguoi={nguoi} dong={() => {}} />);
		await cho(() => q("[data-o-chuc-danh]") !== null, "o chuc danh");
		const o = q("[data-o-chuc-danh]");
		expect(o?.getAttribute("maxlength"), "khong chan tai man").toBe(
			String(TO_CHUC_TRAN.chucDanh),
		);
		expect((o as HTMLInputElement).value).toBe("Chuyên viên");
		await go(o, "Trưởng phòng Kinh doanh vùng 1");
		const luu =
			[...document.body.querySelectorAll('[role="dialog"] button')].find(
				(b) => b.textContent?.trim() === m.viTri.luu,
			) ?? null;
		await bam(luu);
		await cho(() => daGoi.length > 0, "goi luu");
		expect(daGoi[0]?.dauVao).toEqual({
			userId: "lan",
			primaryDepartmentId: "pb-1",
			secondaryDepartmentIds: [],
			managerUserId: null,
			chucDanh: "Trưởng phòng Kinh doanh vùng 1",
		});
	});

	test("chức danh quá 80 (đặt qua mã) → lỗi có số và không gọi thủ tục", async () => {
		const nguoi = CAY.people[0];
		if (!nguoi) throw new Error("fixture rong");
		await mo(<HopThoaiViTri cay={CAY} nguoi={nguoi} dong={() => {}} />);
		await cho(() => q("[data-o-chuc-danh]") !== null, "o chuc danh");
		await go(q("[data-o-chuc-danh]"), "y".repeat(TO_CHUC_TRAN.chucDanh + 1));
		expect(document.body.textContent).toContain(
			`${TO_CHUC_TRAN.chucDanh} ký tự (đang ${TO_CHUC_TRAN.chucDanh + 1})`,
		);
		const luu =
			[...document.body.querySelectorAll('[role="dialog"] button')].find(
				(b) => b.textContent?.trim() === m.viTri.luu,
			) ?? null;
		expect(luu?.hasAttribute("disabled")).toBe(true);
		expect(daGoi).toEqual([]);
	});
});
