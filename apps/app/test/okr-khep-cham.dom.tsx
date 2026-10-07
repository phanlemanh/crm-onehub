import { afterEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	BangChamOutput,
	KrCham,
	MucTieuCham,
} from "../../api/src/okr/okr-khep.contracts";

mock.module("@/lib/trpc/client", () => ({ useTRPC: () => ({}) }));
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/ws/okr/theo-don-vi",
}));

const { ChamDiemBang, kyKeCua } = await import(
	"@/app/(app)/[slug]/okr/cham-diem"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { TooltipProvider } = await import("@crm/ui/components/tooltip");
const { okrKhepMessages } = await import("@/lib/messages/okr-khep");

const mk = okrKhepMessages("vi");
const GOI_Y = mk.cham.cot.goiY.toLocaleLowerCase("vi");

function kr(id: string, doi: Partial<KrCham>): KrCham {
	return {
		id,
		title: `KR ${id}`,
		kind: "tang-toi",
		ownerName: "Phạm Thu Lan",
		unit: "khách",
		startValue: 10,
		targetValue: 30,
		soChot: 24,
		diemGoiY: 0.7,
		diem: null,
		lyDo: null,
		suaDuoc: true,
		doiDichNgoaiRa: [],
		...doi,
	};
}

function mucTieu(
	id: string,
	krs: KrCham[],
	doi: Partial<MucTieuCham>,
): MucTieuCham {
	return {
		id,
		title: `Mục tiêu ${id}`,
		kind: "cam-ket",
		ownerName: "Phạm Thu Lan",
		suaDuoc: true,
		diem: null,
		cachDoc: null,
		dieuHocDuoc: "",
		mangSangToi: null,
		mangSangTu: null,
		krs,
		...doi,
	};
}

const BANG: BangChamOutput = {
	thang: "0-1",
	conLai: 2,
	chuaCham: [],
	hocTapChuaGhi: [],
	mucTieu: [
		mucTieu(
			"mt-1",
			[
				kr("k1", {
					doiDichNgoaiRa: [
						{
							luc: "2026-08-12T03:00:00.000Z",
							truoc: 25,
							sau: 30,
							lyDo: "Khách lớn đổi kế hoạch",
						},
					],
				}),
				kr("k2", { suaDuoc: false, diem: 0.5, diemGoiY: 0.5 }),
			],
			{},
		),
		mucTieu(
			"mt-2",
			[
				kr("k3", { diemGoiY: 1, soChot: 30 }),
				kr("k4", { soChot: 32 }),
				kr("k5", { soChot: 20, diemGoiY: 0.5 }),
			],
			{ kind: "tham-vong" },
		),
	],
};

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];
let goiCham: { keyResultId: string; diem: number; lyDo?: string }[] = [];

async function mo(man: ReactElement): Promise<San> {
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
						<TooltipProvider>{man}</TooltipProvider>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
	dangMo.push(san);
	return san;
}

function bang(doi: Partial<Parameters<typeof ChamDiemBang>[0]>) {
	return (
		<ChamDiemBang
			bang={BANG}
			daDong={false}
			kyKe="Quý 4/2026"
			tenKy="Quý 3/2026"
			onCham={async (vao) => {
				goiCham.push(vao);
				return true;
			}}
			onGhiHoc={async () => true}
			onMangSang={async () => true}
			{...doi}
		/>
	);
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 600)}`,
	);
}

async function bam(o: Element): Promise<void> {
	await act(async () => {
		for (const loai of [
			"pointerdown",
			"mousedown",
			"pointerup",
			"mouseup",
			"click",
		]) {
			const Kieu = loai.startsWith("pointer") ? PointerEvent : MouseEvent;
			o.dispatchEvent(
				new Kieu(loai, {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: "mouse",
				} as PointerEventInit),
			);
		}
	});
}

async function go(o: HTMLTextAreaElement, chu: string): Promise<void> {
	await act(async () => {
		const dat = Object.getOwnPropertyDescriptor(
			HTMLTextAreaElement.prototype,
			"value",
		)?.set;
		dat?.call(o, chu);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

const KHO = "[data-o-diem='lon']";
const dong = (id: string) =>
	document.body.querySelector<HTMLElement>(`[data-kr-cham='${id}']`);
const trongDong = <T extends Element>(id: string, sel: string) =>
	dong(id)?.querySelector<T>(sel) ?? null;

async function chonDiem(id: string, chu: string): Promise<void> {
	const nut = trongDong(id, `${KHO} [data-slot='select-trigger']`);
	if (!nut) throw new Error(`khong co o diem cua ${id}`);
	await bam(nut);
	await cho(
		() => document.body.querySelector("[role='option']") !== null,
		"mo o diem",
	);
	const muc = [...document.body.querySelectorAll("[role='option']")].find(
		(o) => o.textContent?.trim() === chu,
	);
	if (!muc) throw new Error(`khong co muc ${chu}`);
	await act(async () => {
		muc.dispatchEvent(
			new KeyboardEvent("keydown", {
				key: "Enter",
				bubbles: true,
				cancelable: true,
			}),
		);
	});
	await cho(
		() => document.body.querySelector("[role='option']") === null,
		"dong o diem",
	);
}

afterEach(async () => {
	for (const s of dangMo) {
		await act(async () => s.root.unmount());
		s.o.remove();
	}
	dangMo = [];
	goiCham = [];
	document.body.innerHTML = "";
});

describe("kko_bang_cham_dom", () => {
	test("bang cham: cau khong phai danh gia nhan su, tien do, goi y chon san", async () => {
		await mo(bang({}));
		expect(document.body.textContent).toContain(mk.khongPhaiDanhGia.tieuDe);
		expect(
			document.body.querySelector("[data-tien-do-cham]")?.textContent,
		).toBe(mk.cham.daCham("1", "5"));
		expect(
			trongDong("k1", `${KHO} [data-slot='select-trigger']`)?.textContent,
		).toBe(`0,7 · ${GOI_Y}`);
		expect(
			trongDong("k3", `${KHO} [data-slot='select-trigger']`)?.textContent,
		).toBe(`1 · ${GOI_Y}`);
		expect(trongDong("k1", "[data-o-ly-do]")).toBeNull();
	});

	test("nhan dich sua ngoai ra chi o dung mot dong", async () => {
		await mo(bang({}));
		const coNhan = [...document.body.querySelectorAll("[data-kr-cham]")]
			.filter((d) => d.querySelector("[data-dich-ngoai-ra]") !== null)
			.map((d) => d.getAttribute("data-kr-cham"));
		expect(coNhan).toEqual(["k1"]);
		expect(trongDong("k1", "[data-dich-ngoai-ra]")?.textContent).toContain(
			mk.cham.dichNgoaiRa,
		);
	});

	test("KR khong sua duoc: khong co o chon, co chu diem", async () => {
		await mo(bang({}));
		expect(trongDong("k2", "[data-slot='select-trigger']")).toBeNull();
		expect(trongDong("k2", "[data-diem-doc]")?.textContent).toContain("0,5");
		expect(trongDong("k2", "[data-nut='luu-diem']")).toBeNull();
	});

	test("chon khac goi y, luu khong ly do: FieldError cau ghim, khong goi mutation", async () => {
		await mo(bang({}));
		await chonDiem("k1", "0,5");
		const oLyDo = trongDong<HTMLTextAreaElement>(
			"k1",
			`${KHO} [data-o-ly-do] textarea`,
		);
		expect(oLyDo === null ? "khong co o ly do" : "co o ly do").toBe(
			"co o ly do",
		);
		expect(oLyDo?.getAttribute("translate")).toBe("no");
		const nut = trongDong("k1", `${KHO} [data-nut='luu-diem']`);
		if (!nut) throw new Error("khong co nut luu diem");
		await bam(nut);
		expect(`goi onCham: ${goiCham.length} lan`).toBe("goi onCham: 0 lan");
		expect(
			trongDong("k1", `${KHO} [data-slot='field-error']`)?.textContent,
		).toBe(mk.cham.canLyDo);

		if (oLyDo) await go(oLyDo, "Khách lớn rút lại đơn");
		await bam(nut);
		await cho(() => goiCham.length > 0, "goi onCham sau khi co ly do");
		expect(goiCham).toEqual([
			{ keyResultId: "k1", diem: 0.5, lyDo: "Khách lớn rút lại đơn" },
		]);
	});

	test("luu dung goi y khong can ly do", async () => {
		await mo(bang({}));
		const nut = trongDong("k3", `${KHO} [data-nut='luu-diem']`);
		if (!nut) throw new Error("khong co nut luu diem");
		await bam(nut);
		await cho(() => goiCham.length > 0, "goi onCham");
		expect(goiCham).toEqual([{ keyResultId: "k3", diem: 1 }]);
	});

	test("ky da dong: chi doc, khong o chon, khong o dieu hoc duoc", async () => {
		await mo(bang({ daDong: true }));
		expect(document.body.querySelector("[data-slot='select-trigger']")).toBe(
			null,
		);
		expect(document.body.querySelector("[data-o-hoc] textarea")).toBeNull();
		expect(document.body.querySelector("[data-nut='luu-diem']")).toBeNull();
	});

	test("ky-ke-bo-ky-an: nhan mang sang goi ten quy ke chua an, bo quy da an nhu may chu", () => {
		const quy = (
			id: string,
			name: string,
			startsOn: string,
			endsOn: string,
			phase: "dang-chay" | "lap-ke-hoach" | "cham-diem",
			anLuc: string | null,
		) => ({
			id,
			kind: "quy" as const,
			name,
			parentId: null,
			startsOn,
			endsOn,
			phase,
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: 1,
			cuaSoRa: null,
			anLuc,
			anLyDo: anLuc ? "Tạo nhầm quý, đã có quý đúng" : null,
			quyConHien: 0,
			viec: {
				suaMoiO: false,
				suaTen: false,
				go: false,
				an: false,
				hienLai: false,
			},
		});
		const q3 = quy(
			"q3",
			"Quý 3/2026",
			"2026-07-01",
			"2026-09-30",
			"cham-diem",
			null,
		);
		const q4An = quy(
			"q4-an",
			"Quý 4/2026 tạo nhầm",
			"2026-10-01",
			"2026-12-31",
			"lap-ke-hoach",
			"2026-09-30T03:00:00.000Z",
		);
		const q4 = quy(
			"q4",
			"Quý 4/2026",
			"2026-10-02",
			"2026-12-31",
			"lap-ke-hoach",
			null,
		);
		expect({
			coQuyHien: kyKeCua(q3, [q3, q4An, q4])?.id ?? null,
			chiQuyAn: kyKeCua(q3, [q3, q4An])?.id ?? null,
		}).toEqual({ coQuyHien: "q4", chiQuyAn: null });
	});

	test("hop thoai mang sang noi ky ke, KR chep va KR khong chep", async () => {
		await mo(bang({}));
		const nut = document.body.querySelector(
			"[data-muc-tieu-cham='mt-2'] [data-nut='mang-sang']",
		);
		if (!nut) throw new Error("khong co nut mang sang");
		await bam(nut);
		await cho(
			() => document.body.querySelector("[data-hop-thoai-mang-sang]") !== null,
			"hop thoai mang sang",
		);
		const hop = document.body.querySelector("[data-hop-thoai-mang-sang]");
		expect(hop?.textContent).toContain("Quý 4/2026");
		const chep = [...(hop?.querySelectorAll("[data-kr-chep]") ?? [])].map((e) =>
			e.getAttribute("data-kr-chep"),
		);
		const khong = [
			...(hop?.querySelectorAll("[data-kr-khong-chep]") ?? []),
		].map((e) => e.getAttribute("data-kr-khong-chep"));
		expect({ chep, khong }).toEqual({ chep: ["k5"], khong: ["k3", "k4"] });
	});
});
