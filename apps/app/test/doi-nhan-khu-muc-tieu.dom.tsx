import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useQuery } from "@tanstack/react-query";
import { hoiYDoPhuOutput } from "../../api/src/okr/okr-hoi-y.contracts";
import { orgTreeOutput } from "../../api/src/to-chuc/to-chuc.contracts";
import { workspaceOutput } from "../../api/src/workspace/workspace.contracts";
import { cho, dung, kho } from "./okr-don-san";

const { BangDoPhu } = await import("@/app/(app)/[slug]/okr/hoi-y/khoi-do-phu");
const { ChonDonVi } = await import(
	"@/app/(app)/[slug]/okr/theo-don-vi/chon-don-vi"
);
const { useTenGoc } = await import("@/app/(app)/[slug]/okr/ten-goc");
const { useTRPC } = await import("@/lib/trpc/client");

const TEN = "Kho Thử Nghiệm";
const CAM = ["Toàn công ty", "Toàn OneHub", "Whole company", "All of OneHub"];
const OKR = join(import.meta.dir, "..", "app", "(app)", "[slug]", "okr");
const MAN_DUNG_HOOK = [
	"theo-don-vi/theo-don-vi.tsx",
	"hanh-dong-khu.tsx",
	"hoi-y/khoi-do-phu.tsx",
];

const datTen = (name: string) =>
	kho.doc.set("workspace.get", () =>
		workspaceOutput.parse({
			id: "ws-1",
			slug: "ws",
			name,
			website: null,
			onboarded: true,
			viewerRole: "member",
			canRename: false,
			canChangeRoles: false,
			canManageMembers: false,
			canIssuePasswordLink: false,
			canManageSettings: false,
		}),
	);

const DO_PHU = hoiYDoPhuOutput.parse({
	cot: [{ ngay: "2026-10-13", nhan: "13/10" }],
	hang: [
		{ id: "goc", nhan: "OneHub", loai: "goc", cha: null, giaTri: [0.4] },
		{
			id: "pb-1",
			nhan: "Kinh doanh",
			loai: "phong-ban",
			cha: "goc",
			giaTri: [0.5],
		},
	],
});

const CAY = orgTreeOutput.parse({
	divisions: [],
	chuaXep: [],
	chuaCoPhongBan: [],
	people: [],
	archived: { divisions: [], departments: [] },
	coverage: { members: 0, withPrimary: 0, departmentsWithoutHead: 0 },
});

function nhanGoc(o: HTMLElement): HTMLElement | null {
	return o.querySelector("tbody tr th, tbody tr td");
}

const choCo = (o: HTMLElement, chu: string) =>
	cho(() => (o.textContent ?? "").includes(chu), `dnk: cho «${chu}»`);

function DauDo() {
	const w = useQuery(useTRPC().workspace.get.queryOptions());
	return <i data-ws-xong={w.isSuccess ? "1" : "0"} />;
}

const choDaTai = (o: HTMLElement) =>
	cho(
		() => o.querySelector('[data-ws-xong="1"]') !== null,
		"dnk: cho workspace.get tra ve",
	);

function GocChon() {
	return (
		<ChonDonVi
			cay={CAY}
			chonDon={() => {}}
			dem={{}}
			don={{ loai: "goc" }}
			tenGoc={useTenGoc()}
		/>
	);
}

export function tuTinhTenGoc(nguon: string): boolean {
	return /workspace\.data\?\.name\s*\|\|\s*m\.goc/.test(nguon);
}

describe("dnk-goc-man", () => {
	test("dnk-goc-man: do phu goc mang ten khong gian lam viec trong translate=no", async () => {
		datTen(TEN);
		const s = await dung(<BangDoPhu dangMo={false} doPhu={DO_PHU} />);
		await choCo(s.o, TEN);
		const goc = [...s.o.querySelectorAll('[translate="no"]')].find(
			(e) => e.textContent === TEN,
		);
		if (!goc)
			throw new Error(
				`dnk: do phu goc ${nhanGoc(s.o)?.textContent ?? "(rong)"}`,
			);
		expect(CAM.filter((c) => (s.o.textContent ?? "").includes(c))).toEqual([]);
	});

	for (const [locale, mong] of [
		["vi", "Công ty"],
		["en", "Company"],
	] as const)
		test(`dnk-goc-man: do phu du phong ${locale} khi chua co ten`, async () => {
			datTen("");
			const s = await dung(
				<>
					<DauDo />
					<BangDoPhu dangMo={false} doPhu={DO_PHU} />
				</>,
				"",
				locale,
			);
			await choDaTai(s.o);
			await choCo(s.o, "Kinh doanh");
			const goc = [...s.o.querySelectorAll('[translate="no"]')].map(
				(e) => e.textContent,
			);
			if (!goc.includes(mong))
				throw new Error(`dnk: do phu du phong ${locale} ${goc.join("|")}`);
			expect(CAM.filter((c) => (s.o.textContent ?? "").includes(c))).toEqual(
				[],
			);
		});

	test("dnk-goc-man: o chon don vi lay ten goc tu useTenGoc", async () => {
		datTen(TEN);
		const s = await dung(<GocChon />);
		await choCo(s.o, TEN);
		const o = s.o.querySelector('[translate="no"]');
		if (!o?.textContent?.includes(TEN))
			throw new Error(`dnk: o chon goc ${o?.textContent ?? "(rong)"}`);
		datTen("");
		const r = await dung(
			<>
				<DauDo />
				<GocChon />
			</>,
		);
		await choDaTai(r.o);
		const oRong = r.o.querySelector('[translate="no"]');
		if (!oRong?.textContent?.includes("Công ty"))
			throw new Error(
				`dnk: du phong o chon vi ${oRong?.textContent ?? "(rong)"}`,
			);
	});

	test("dnk-goc-man: ba man goi useTenGoc, khong tu tinh ten goc", () => {
		expect(tuTinhTenGoc("const t = workspace.data?.name || m.goc;")).toBe(true);
		const loi = MAN_DUNG_HOOK.flatMap((tep) => {
			const nguon = readFileSync(join(OKR, tep), "utf8");
			return tuTinhTenGoc(nguon) || !nguon.includes("useTenGoc(")
				? [`dnk: man tu tinh ten goc ${tep}`]
				: [];
		});
		expect(loi).toEqual([]);
	});
});
