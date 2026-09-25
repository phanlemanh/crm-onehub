import { beforeEach, describe, expect, it, mock } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";

type GhiDanh = {
	id: string;
	planId: string;
	contactId: string;
	accountAt: Date | null;
	courseAt: Date | null;
	activeAt: Date | null;
	dealAt: Date | null;
	source: string;
};

type Buoc = {
	id: string;
	planId: string;
	label: string;
	departmentId: string;
	assigneeId: string | null;
	dueAt: Date;
	completedAt: Date | null;
	position: number;
};

type BoPhan = {
	id: string;
	name: string;
	position: number;
	archivedAt: Date | null;
};

type KeHoach = { id: string; companyName: string; closedAt: string | null };

type KetQuaTruyVan =
	| { rows: Buoc[]; total: number }
	| GhiDanh[]
	| BoPhan[]
	| KeHoach;

type DauVaoMan =
	| { planId: string }
	| { id: string }
	| { planId: string; contactId: string }
	| { planId: string; contactId: string; source: string }
	| undefined;

type KetQuaGhi = { id: string };

type LoiGoi = { duong: string; dauVao: DauVaoMan };

const KE_HOACH = "kh-1";
const NGUOI = "ca-1";

const BUOC: Buoc[] = [
	{
		id: "b-1",
		planId: KE_HOACH,
		label: "Ky phu luc dao tao",
		departmentId: "bp-1",
		assigneeId: null,
		dueAt: new Date("2026-09-10T00:00:00.000Z"),
		completedAt: null,
		position: 0,
	},
];

const BO_PHAN: BoPhan[] = [
	{ id: "bp-1", name: "Dao tao", position: 0, archivedAt: null },
];

let daGoi: LoiGoi[] = [];
let dsGhiDanh: GhiDanh[] = [];

function ghiDanhMau(): GhiDanh {
	return {
		id: "gd-1",
		planId: KE_HOACH,
		contactId: NGUOI,
		accountAt: new Date("2026-09-01T00:00:00.000Z"),
		courseAt: null,
		activeAt: null,
		dealAt: null,
		source: "nen-tang",
	};
}

function ketQuaTruyVan(ten: string): KetQuaTruyVan {
	if (ten === "listSteps") return { rows: BUOC, total: BUOC.length };
	if (ten === "listEnrollments") return dsGhiDanh;
	if (ten === "listDepartments") return BO_PHAN;
	if (ten === "planById")
		return { id: KE_HOACH, companyName: "Alpha", closedAt: null };
	throw new Error(`man goi mot truy van khong co ban gia: ${ten}`);
}

function thuTuc(ten: string) {
	return {
		queryKey: (dauVao: DauVaoMan) => [ten, dauVao],
		queryOptions: (dauVao: DauVaoMan) => ({
			queryKey: [ten, dauVao],
			queryFn: async () => ketQuaTruyVan(ten),
		}),
		mutationOptions: (chon?: { onSuccess?: (kq: KetQuaGhi) => void }) => ({
			...chon,
			mutationKey: [ten],
			mutationFn: async (dauVao: DauVaoMan): Promise<KetQuaGhi> => {
				daGoi.push({ duong: `onboarding.${ten}`, dauVao });
				return { id: "gd-1" };
			},
		}),
	};
}

const BAN_GIA = {
	listDepartments: thuTuc("listDepartments"),
	listTemplates: thuTuc("listTemplates"),
	createTemplate: thuTuc("createTemplate"),
	updateTemplate: thuTuc("updateTemplate"),
	archiveTemplate: thuTuc("archiveTemplate"),
	listPlans: thuTuc("listPlans"),
	createFromTemplate: thuTuc("createFromTemplate"),
	closePlan: thuTuc("closePlan"),
	listSteps: thuTuc("listSteps"),
	listEnrollments: thuTuc("listEnrollments"),
	upsertEnrollment: thuTuc("upsertEnrollment"),
	removeEnrollment: thuTuc("removeEnrollment"),
	markEnrollmentStage: thuTuc("markEnrollmentStage"),
	manDanhMuc: thuTuc("manDanhMuc"),
	planById: thuTuc("planById"),
	reopenPlan: thuTuc("reopenPlan"),
};

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({ onboarding: BAN_GIA }),
}));

const { HoSoKeHoach } = await import(
	"@/app/(app)/[slug]/onboarding/[planId]/ho-so-ke-hoach"
);
const { onboardingMessages } = await import("@/lib/messages/onboarding");

const m = onboardingMessages("vi");

type San = { o: HTMLElement; root: Root };

async function dungMan(): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			h(QueryClientProvider, { client }, h(HoSoKeHoach, { planId: KE_HOACH })),
		);
	});
	const san = { o, root };
	await choTaiXong(san);
	return san;
}

async function choTaiXong(san: San): Promise<void> {
	for (let vong = 0; vong < 20; vong += 1) {
		if (san.o.querySelector("button") !== null) return;
		await act(async () => {
			await new Promise((xong) => setTimeout(xong, 0));
		});
	}
	throw new Error(
		`man khong dung ra nut nao sau khi tai — noi dung: ${san.o.textContent}`,
	);
}

function nut(goc: ParentNode, chu: string): HTMLButtonElement {
	const tim = [...goc.querySelectorAll("button")].find(
		(b) => b.textContent?.trim() === chu,
	);
	if (!tim) {
		throw new Error(
			`khong thay nut "${chu}" — cac nut dang co: ${[...goc.querySelectorAll("button")].map((b) => b.textContent?.trim()).join(" | ")}`,
		);
	}
	return tim as HTMLButtonElement;
}

function hopThoai(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>('[role="alertdialog"]');
}

async function bam(o: HTMLElement): Promise<void> {
	await act(async () => {
		o.dispatchEvent(
			new MouseEvent("click", { bubbles: true, cancelable: true }),
		);
	});
}

async function don(san: San): Promise<void> {
	await act(async () => {
		san.root.unmount();
	});
	san.o.remove();
}

beforeEach(() => {
	daGoi = [];
	dsGhiDanh = [ghiDanhMau()];
	document.body.innerHTML = "";
});

describe("xoa-co-xac-nhan-tren-man", () => {
	it("cu bam dau tien chi mo buoc xac nhan, chua goi thu tuc nao", async () => {
		const san = await dungMan();

		await bam(nut(san.o, m.hoSo.remove));

		const hoi = hopThoai();
		expect(hoi).not.toBeNull();
		expect(hoi?.textContent).toContain(m.hoSo.confirmTitle);
		expect(daGoi).toEqual([]);

		await don(san);
	});

	it("xac nhan roi thi man goi DUNG thu tuc xoa, dung mot lan", async () => {
		const san = await dungMan();

		await bam(nut(san.o, m.hoSo.remove));
		const hoi = hopThoai();
		if (hoi === null) throw new Error("khong co buoc xac nhan nao hien ra");
		await bam(nut(hoi, m.hoSo.confirmAction));

		expect(daGoi).toHaveLength(1);
		expect(daGoi.at(0)?.duong).toBe("onboarding.removeEnrollment");
		expect(daGoi.at(0)?.dauVao).toEqual({
			planId: KE_HOACH,
			contactId: NGUOI,
		});

		await don(san);
	});

	it("nut Go khong duoc di qua mot phep GHI — khong thu tuc upsert nao bi goi", async () => {
		const san = await dungMan();

		await bam(nut(san.o, m.hoSo.remove));
		const hoi = hopThoai();
		if (hoi === null) throw new Error("khong co buoc xac nhan nao hien ra");
		await bam(nut(hoi, m.hoSo.confirmAction));

		const ghi = daGoi.filter((g) => g.duong.includes("upsert"));
		expect(ghi).toEqual([]);

		await don(san);
	});

	it("bam giu lai thi khong thu tuc nao duoc goi, va hop thoai dong", async () => {
		const san = await dungMan();

		await bam(nut(san.o, m.hoSo.remove));
		const hoi = hopThoai();
		if (hoi === null) throw new Error("khong co buoc xac nhan nao hien ra");
		await bam(nut(hoi, m.hoSo.confirmCancel));

		expect(hopThoai()).toBeNull();
		expect(daGoi).toEqual([]);

		await don(san);
	});
});
