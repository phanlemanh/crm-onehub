import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
	ChuKyOutput,
	OkrDongNhapOutput,
} from "../../api/src/okr/okr.contracts";

const QUY: ChuKyOutput = {
	id: "q4",
	kind: "quy",
	name: "Quý 4/2026",
	parentId: "n26",
	startsOn: "2026-10-01",
	endsOn: "2026-12-31",
	phase: "dang-chay",
	breakStartsOn: null,
	breakEndsOn: null,
	updateWeekday: 1,
};

type Json =
	| string
	| number
	| boolean
	| null
	| readonly Json[]
	| { readonly [khoa: string]: Json | undefined };
type DauVao = { readonly [khoa: string]: Json | undefined } | undefined;
type LoiGoi = { duong: string; dauVao: DauVao };

let xemTruoc: {
	rows: OkrDongNhapOutput[];
	summary: { valid: number; invalid: number; objectives: number };
} | null = null;
type ApDung = { written: number; objectives: number; keyResults: number };
let apDung = { written: 0, objectives: 0, keyResults: 0 } satisfies ApDung;
let daGoi: LoiGoi[] = [];

function thuTuc<TRa>(
	duong: string,
	doc: (vao: DauVao) => TRa = () => null as TRa,
) {
	return {
		queryKey: (vao?: DauVao) => [duong, vao ?? null],
		pathKey: () => [duong],
		queryOptions: (vao?: DauVao) => ({
			queryKey: [duong, vao ?? null],
			queryFn: async () => doc(vao),
		}),
		mutationOptions: (chon?: {
			onSuccess?: (kq: TRa, vao: DauVao) => void;
			onError?: (e: Error) => void;
		}) => ({
			...chon,
			mutationKey: [duong],
			mutationFn: async (vao: DauVao) => {
				daGoi.push({ duong, dauVao: vao });
				return doc(vao);
			},
		}),
	};
}

mock.module("@/lib/trpc/client", () => ({
	useTRPC: () => ({
		okr: {
			cycles: thuTuc("okr.cycles", () => ({
				cycles: [QUY],
				currentId: QUY.id,
			})),
			previewImport: thuTuc("okr.previewImport", () => xemTruoc),
			applyImport: thuTuc("okr.applyImport", () => apDung),
		},
	}),
}));

mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => ({
		okr: async () => {},
	}),
}));

const { HopThoaiNhapOkr } = await import(
	"@/app/(app)/[slug]/okr/hop-thoai-nhap"
);
const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { okrMessages } = await import("@/lib/messages/okr");

const m = okrMessages("vi").nhap;

type San = { o: HTMLElement; root: Root };
let dangMo: San[] = [];

async function mo(): Promise<San> {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	await act(async () => {
		root.render(
			<NuqsTestingAdapter hasMemory searchParams="">
				<QueryClientProvider client={client}>
					<LocaleProvider locale="vi">
						<HopThoaiNhapOkr
							cycleId="q4"
							unit={{ loai: "pb", id: "pb-1" }}
							tenDonVi="Kinh doanh vùng 1"
							dong={() => {}}
						/>
					</LocaleProvider>
				</QueryClientProvider>
			</NuqsTestingAdapter>,
		);
	});
	const san = { o, root };
	dangMo.push(san);
	await cho(
		() => document.body.querySelector("[data-hop-thoai-nhap-okr]") !== null,
		"hop tai",
	);
	return san;
}

async function cho(xong: () => boolean, moTa: string): Promise<void> {
	for (let vong = 0; vong < 80; vong += 1) {
		if (xong()) return;
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
	}
	throw new Error(
		`khong toi: ${moTa} — ${document.body.textContent?.slice(0, 500)}`,
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
			const Ev =
				loai.startsWith("pointer") && "PointerEvent" in globalThis
					? PointerEvent
					: MouseEvent;
			o.dispatchEvent(
				new Ev(loai, { bubbles: true, cancelable: true, button: 0 }),
			);
		}
	});
}

async function dan(chu: string): Promise<void> {
	const textarea = document.body.querySelector(
		"textarea",
	) as HTMLTextAreaElement;
	await act(async () => {
		const dat = Object.getOwnPropertyDescriptor(
			HTMLTextAreaElement.prototype,
			"value",
		)?.set;
		dat?.call(textarea, chu);
		textarea.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

const CHU_MAU = "bat ky\tKR\ttang toi\t0\t10\tkhach\tlan@onehub.vn";

async function xemTruocLen(): Promise<void> {
	await dan(CHU_MAU);
	await bam(
		document.body.querySelector('[data-nut="xem-truoc"]') as HTMLElement,
	);
	await cho(
		() => document.body.querySelector("[data-tom-tat]") !== null,
		"buoc 2",
	);
}

const dongHong = (line: number, loi: string): OkrDongNhapOutput => ({
	line,
	objective: "",
	keyResult: "",
	kind: "la",
	start: "",
	target: "",
	unit: "",
	email: "khong-phai@onehub.vn",
	error: loi,
});

const dongHopLe = (line: number, ten: string): OkrDongNhapOutput => ({
	line,
	objective: ten,
	keyResult: `KR ${line}`,
	kind: "tăng tới",
	start: "0",
	target: "10",
	unit: "khách",
	email: "lan@onehub.vn",
	error: null,
});

beforeEach(() => {
	xemTruoc = null;
	apDung = { written: 0, objectives: 0, keyResults: 0 };
	daGoi = [];
});

afterEach(async () => {
	for (const san of dangMo) {
		await act(async () => san.root.unmount());
		san.o.remove();
	}
	dangMo = [];
	document.body.innerHTML = "";
});

describe("hop-thoai-nhap-okr", () => {
	test("nhap-nut-ghi-khoa-khi-0-hop-le: 0 dong hop le thi nut Ghi khoa voi nhan khong co dong nao", async () => {
		xemTruoc = {
			rows: [
				dongHong(1, "Kiểu lạ"),
				dongHong(2, "Email này chưa là thành viên CRM"),
			],
			summary: { valid: 0, invalid: 2, objectives: 0 },
		};
		await mo();
		await xemTruocLen();
		const nutGhi = document.body.querySelector(
			'[data-nut="ghi-lo"]',
		) as HTMLButtonElement;
		expect({
			nhan: nutGhi.textContent?.trim(),
			khoa: nutGhi.disabled,
		}).toEqual({ nhan: m.khongGhi, khoa: true });
	});

	test("nhap-tom-tat-dong-hong: tom tat dung so, hai li dong hong, nhan nut ghi dung", async () => {
		xemTruoc = {
			rows: [
				dongHopLe(1, "Mục tiêu A"),
				dongHopLe(2, "Mục tiêu A"),
				dongHopLe(3, "Mục tiêu B"),
				dongHong(4, "Kiểu lạ"),
				dongHong(5, "Email này chưa là thành viên CRM"),
			],
			summary: { valid: 3, invalid: 2, objectives: 2 },
		};
		await mo();
		await xemTruocLen();
		const tomTat = document.body.querySelector("[data-tom-tat]");
		const dongHongLi = [...document.body.querySelectorAll("[data-dong-hong]")];
		const nutGhi = document.body.querySelector(
			'[data-nut="ghi-lo"]',
		) as HTMLButtonElement;
		expect({
			tomTat: tomTat?.textContent,
			soDongHong: dongHongLi.length,
			cauDongHong: dongHongLi.map((l) => l.textContent),
			nhanNutGhi: nutGhi.textContent?.trim(),
			khoa: nutGhi.disabled,
		}).toEqual({
			tomTat: "3 dòng hợp lệ · 2 dòng hỏng · 2 mục tiêu",
			soDongHong: 2,
			cauDongHong: [
				"Dòng 4: Kiểu lạ",
				"Dòng 5: Email này chưa là thành viên CRM",
			],
			nhanNutGhi: "Ghi 3 dòng · bỏ 2 dòng hỏng",
			khoa: false,
		});
	});

	test("nhap-gui-cong-bo: bat cong bo ngay roi ghi thi applyImport nhan congBo true", async () => {
		xemTruoc = {
			rows: [dongHopLe(1, "Mục tiêu A")],
			summary: { valid: 1, invalid: 0, objectives: 1 },
		};
		apDung = { written: 1, objectives: 1, keyResults: 1 };
		await mo();
		await xemTruocLen();
		const congTac = document.body.querySelector(
			"[data-cong-bo-ngay]",
		) as HTMLElement;
		await bam(congTac);
		const nutGhi = document.body.querySelector(
			'[data-nut="ghi-lo"]',
		) as HTMLElement;
		await bam(nutGhi);
		await cho(
			() => daGoi.some((g) => g.duong === "okr.applyImport"),
			"goi applyImport",
		);
		const goi = daGoi.find((g) => g.duong === "okr.applyImport");
		expect(goi?.dauVao).toEqual({
			cycleId: "q4",
			unit: { loai: "pb", id: "pb-1" },
			text: "bat ky\tKR\ttang toi\t0\t10\tkhach\tlan@onehub.vn",
			congBo: true,
		});
	});
});
