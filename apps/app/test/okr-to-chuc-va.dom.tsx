import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Locale } from "@crm/ui/lib/locale";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type KrOutput,
	krOutput,
	type MucTieuOutput,
	mucTieuOutput,
} from "../../api/src/okr/okr.contracts";
import { cho, dat, datLai, nhip } from "./khung-soan-okr";

const { BangMucTieu } = await import("@/app/(app)/[slug]/okr/bang-muc-tieu");
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");

const HUNG = { id: "hung", name: "Trần Văn Hùng", email: "h@onehub.vn" };

type San = { o: HTMLElement; root: Root; url: () => URLSearchParams };
let dangMo: San[] = [];

beforeEach(() => {
	datLai();
	dat("workspace.get", () => ({ name: "OneHub", viewerRole: "member" }));
	dat("users.me", () => HUNG);
	dat("users.list", () => [{ ...HUNG, image: null }]);
	dat("okr.access", () => ({
		canManageProgram: false,
		headOf: { divisions: [], departments: [] },
	}));
	dat("okr.program", () => ({
		objectiveCap: 5,
		krCap: 5,
		capMode: "canh-bao",
		scoreScale: "0-1",
		weightsOn: false,
		personalOn: false,
		version: 1,
	}));
});

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

async function dung(
	man: ReactElement,
	{ locale = "vi", thamSo = "" }: { locale?: Locale; thamSo?: string } = {},
): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	let url = new URLSearchParams(thamSo);
	const ve = (m: ReactElement) => (
		<NuqsTestingAdapter
			hasMemory
			onUrlUpdate={(e) => {
				url = new URLSearchParams(e.searchParams);
			}}
			searchParams={thamSo}
		>
			<QueryClientProvider client={client}>
				<LocaleProvider locale={locale}>
					<TooltipProvider>{m}</TooltipProvider>
				</LocaleProvider>
			</QueryClientProvider>
		</NuqsTestingAdapter>
	);
	await act(async () => {
		root.render(ve(man));
	});
	const san = { o, root, url: () => url };
	dangMo.push(san);
	await nhip(6);
	return san;
}

const nguoiDung = () =>
	userEvent.setup({ document, pointerEventsCheck: 0, delay: null });

async function bam(o: Element | null, moTa: string): Promise<void> {
	if (!o) throw new Error(`khong thay: ${moTa}`);
	await act(async () => {
		await nguoiDung().click(o);
	});
	await nhip(4);
}

const q = (chon: string, goc: ParentNode = document) =>
	goc.querySelector<HTMLElement>(chon);

function kr(id: string, objectiveId: string, doi: Partial<KrOutput> = {}) {
	return krOutput.parse({
		id,
		objectiveId,
		title: `KR ${id}`,
		kind: "tang-toi",
		owner: HUNG,
		startValue: 0,
		targetValue: 50,
		currentValue: 20,
		unit: "khách",
		dueOn: null,
		weight: 1,
		source: "tay",
		doCanh: false,
		soMay: null,
		nguonMay: null,
		startLocked: true,
		progress: 40,
		laCuaToi: false,
		hienTaiQuaCapNhat: false,
		...doi,
	});
}

function mucTieu(id: string, doi: Partial<MucTieuOutput> = {}): MucTieuOutput {
	return mucTieuOutput.parse({
		id,
		cycleId: "q4",
		level: "phong-ban",
		unitId: "pb-1",
		unitName: "Kinh doanh vùng 1",
		title: `Mục tiêu ${id}`,
		kind: "cam-ket",
		status: "cong-bo",
		owner: HUNG,
		participants: [],
		whyNow: "",
		publishedAt: "2026-10-02T00:00:00.000Z",
		droppedAt: null,
		progress: 40,
		expected: 47,
		keyResults: [kr(`${id}-kr1`, id)],
		alignments: [],
		canEdit: false,
		following: false,
		followerCount: 0,
		theoDoi: false,
		hienThi: "cong-khai",
		soNguoiXem: 0,
		soGopYCho: 0,
		...doi,
	});
}

describe("thu-gon", () => {
	const A = mucTieu("mt-a");
	const B = mucTieu("mt-b");
	const C = mucTieu("mt-c");
	const CACH = [
		{ ten: "loc", khuat: [B] },
		{ ten: "doi-don-vi", khuat: [C] },
	] as const;

	const nutThu = (id: string, goc: ParentNode) =>
		q(`[data-hang-muc-tieu="${id}"] [aria-expanded]`, goc) ??
		q(`[data-muc-tieu="${id}"] [aria-expanded]`, goc);

	test("thu-gon: id cua muc tieu dang khuat giu nguyen khi thu muc tieu khac", async () => {
		expect.assertions(CACH.length * 4);
		for (const cach of CACH) {
			const o = document.createElement("div");
			document.body.appendChild(o);
			const root = createRoot(o);
			const client = new QueryClient({
				defaultOptions: { queries: { retry: false } },
			});
			let url = new URLSearchParams(`thuMucTieu=${A.id}`);
			const ve = (ds: MucTieuOutput[]) => (
				<NuqsTestingAdapter
					hasMemory
					onUrlUpdate={(e) => {
						url = new URLSearchParams(e.searchParams);
					}}
					searchParams={`thuMucTieu=${A.id}`}
				>
					<QueryClientProvider client={client}>
						<LocaleProvider locale="vi">
							<TooltipProvider>
								<BangMucTieu danhDauCuaToi={false} ds={ds} hienDonVi />
							</TooltipProvider>
						</LocaleProvider>
					</QueryClientProvider>
				</NuqsTestingAdapter>
			);
			dangMo.push({ o, root, url: () => url });
			await act(async () => root.render(ve([A, B])));
			await nhip(6);
			await act(async () => root.render(ve([...cach.khuat])));
			await nhip(4);
			const id = cach.khuat[0].id;
			await bam(nutThu(id, o), `nut thu ${id}`);
			await cho(
				() => (url.getAll("thuMucTieu").join(",").includes(id) ? true : false),
				`url ghi ${id}`,
			);
			const sauThu = url.getAll("thuMucTieu").join(",");
			expect(sauThu.includes(A.id), `mat id khuat: ${cach.ten}`).toBe(true);
			await act(async () => root.render(ve([A, B, C])));
			await nhip(4);
			expect(
				nutThu(A.id, o)?.getAttribute("aria-expanded"),
				`A mo lai: ${cach.ten}`,
			).toBe("false");
			expect(
				nutThu(id, o)?.getAttribute("aria-expanded"),
				`${id} khong thu: ${cach.ten}`,
			).toBe("false");
			await bam(nutThu(id, o), `mo lai ${id}`);
			await nhip(4);
			expect(
				url.getAll("thuMucTieu").join(",").includes(A.id),
				`mo ${id} lam mat A: ${cach.ten}`,
			).toBe(true);
		}
		console.log(`so ca: ${CACH.length}`);
	});
});
