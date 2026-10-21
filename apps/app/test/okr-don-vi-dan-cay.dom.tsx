import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { okrAccessOutput } from "../../api/src/okr/okr.contracts";
import { danhSachOutput } from "../../api/src/okr/okr-xem.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";
import { cho, dat, datLai, goiCua, nhip } from "./khung-soan-okr";

const { PhanDonViDan } = await import("@/app/(app)/[slug]/okr/phan-don-vi-dan");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { okrMessages } = await import("@/lib/messages/okr");

const m = okrMessages("vi").baPhan;

const nguoi = (id: string, name: string) => ({
	id,
	name,
	email: `${id}@onehub.vn`,
});
const LAN = nguoi("lan", "Nguyễn Thị Lan");
const HUNG = nguoi("hung", "Trần Văn Hùng");

const pb = (id: string, name: string, divisionId: string) => ({
	id,
	name,
	moTa: "",
	position: 0,
	divisionId,
	head: HUNG,
	stepCount: 0,
	okrMo: 0,
	people: [{ ...HUNG, primary: true }],
});

const CAY = orgTreeOutput.parse({
	divisions: [
		{
			id: "B1",
			name: "Kinh doanh",
			moTa: "",
			position: 0,
			head: LAN,
			okrMo: 0,
			departments: [
				pb("P2", "Kinh doanh vùng 1", "B1"),
				pb("P3", "Kinh doanh vùng 2", "B1"),
			],
		},
	],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [],
	archived: { divisions: [], departments: [] },
	coverage: { members: 2, withPrimary: 2, departmentsWithoutHead: 0 },
});

type OCay = "dang-tai" | "loi" | "co";

function datNen(o: OCay) {
	dat("okr.access", () =>
		okrAccessOutput.parse({
			canManageProgram: false,
			headOf: { divisions: ["B1"], departments: ["P3", "P2"] },
		}),
	);
	dat("org.tree", () => {
		if (o === "dang-tai") return new Promise(() => {});
		if (o === "loi") throw new Error("cay to chuc loi");
		return CAY;
	});
	dat("okr.danhSach", () =>
		danhSachOutput.parse({
			rows: [],
			daBo: [],
			total: 0,
			facetCounts: {
				phuTrach: [],
				loai: [],
				trangThai: [],
				tuTin: [],
				gopY: [],
			},
			canEdit: true,
			canCreate: true,
		}),
	);
}

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

beforeEach(() => {
	datLai();
});

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

async function dung(): Promise<HTMLElement> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter searchParams="">
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<PhanDonViDan cycleId="q4" ky={null} tenKy="Quý 4/2026" />
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	dangMo.push({ o, root });
	await nhip(10);
	return o;
}

const q = (chon: string, goc: ParentNode = document) =>
	goc.querySelector<HTMLElement>(chon);
const qa = (chon: string, goc: ParentNode = document) => [
	...goc.querySelectorAll<HTMLElement>(chon),
];

function tieuDeThe(): string[] {
	return qa("[data-don-vi-dan] [data-slot=card-title]").map(
		(t) => t.textContent ?? "",
	);
}

function kiemKhongTieuDeRong(o: OCay) {
	const rong = tieuDeThe().filter((t) => t.trim() === "");
	if (rong.length > 0)
		throw new Error(
			`vkm-don-vi-dan: ${o} — the don vi tieu de rong (${rong.length})`,
		);
}

describe("vkm-don-vi-dan", () => {
	test("vkm-don-vi-dan: cay dang tai — khung cho, khong the tieu de rong", async () => {
		datNen("dang-tai");
		await dung();
		await cho(() => q("[data-phan=don-vi-dan]") !== null, "phan don vi dan");
		kiemKhongTieuDeRong("dang-tai");
		const khung = qa("[data-phan=don-vi-dan] [data-khung-xuong]");
		if (khung.length === 0)
			throw new Error("vkm-don-vi-dan: dang-tai — khong co khung cho");
		expect(tieuDeThe()).toEqual([]);
	});

	test("vkm-don-vi-dan: cay loi — LoiPhan co Thu lai, bam thi tai lai cay dung mot lan", async () => {
		datNen("loi");
		await dung();
		await cho(() => q("[data-phan=don-vi-dan]") !== null, "phan don vi dan");
		kiemKhongTieuDeRong("loi");
		const nut = q("[data-phan=don-vi-dan] [data-nut=thu-lai-phan]");
		if (!nut)
			throw new Error("vkm-don-vi-dan: loi — khong co LoiPhan voi nut Thu lai");
		const truoc = goiCua("org.tree").length;
		await act(async () => {
			nut.click();
		});
		await nhip(10);
		const sau = goiCua("org.tree").length;
		if (sau - truoc !== 1)
			throw new Error(
				`vkm-don-vi-dan: Thu lai goi org.tree ${sau - truoc} lan, mong 1`,
			);
		expect(nut.textContent).toBe(m.thuLai);
	});

	test("vkm-don-vi-dan: cay co du lieu — the don vi co ten theo thu tu cay", async () => {
		datNen("co");
		await dung();
		await cho(() => tieuDeThe().length === 3, "ba the don vi");
		kiemKhongTieuDeRong("co");
		expect(tieuDeThe()).toEqual([
			"Kinh doanh",
			"Kinh doanh vùng 1",
			"Kinh doanh vùng 2",
		]);
	});
});
