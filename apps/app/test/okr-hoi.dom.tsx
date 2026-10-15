import { afterEach, describe, expect, test } from "bun:test";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import type { EveMessage } from "eve/react";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	KhungHoi,
	type KhungHoiProps,
} from "@/app/(app)/[slug]/okr/hoi/khung-hoi";
import { okrHoiMessages } from "@/lib/messages/okr-hoi";

const m = okrHoiMessages("vi");
const CAU_HOI = "KR nào của tôi đang trượt?";

type GiaTriChu =
	| string
	| readonly string[]
	| ((...doiSo: string[]) => string);
type NhanhChu = { readonly [khoa: string]: GiaTriChu | NhanhChu };

const tin = (id: string, role: "user" | "assistant", parts: unknown[]) =>
	({ id, role, parts }) as unknown as EveMessage;

const NOP = {
	type: "dynamic-tool",
	toolName: "nop_tra_loi",
	toolCallId: "call-nop-1",
	state: "output-available",
	input: { loai: "tra-loi", cauHoi: CAU_HOI, cau: [] },
	output: {
		ok: true,
		traLoi: {
			loai: "tra-loi",
			cau: [
				{
					chu: "KR này đạt 42%, đang chậm nhịp.",
					trich: [{ loai: "kr", id: "kr-doanh-thu", ten: "Doanh thu quý 4" }],
				},
				{
					chu: "Mục tiêu chứa nó đang đúng nhịp.",
					trich: [
						{ loai: "objective", id: "mt-kd", ten: "Tăng trưởng Kinh doanh" },
					],
				},
			],
		},
	},
};

const LUOT_TRA_LOI = [
	tin("u1", "user", [{ type: "text", text: CAU_HOI }]),
	tin("a1", "assistant", [
		{ type: "text", text: "CHU-TU-DO-CUA-MODEL" },
		{
			type: "dynamic-tool",
			toolName: "tim_okr",
			toolCallId: "call-tim",
			state: "output-available",
			output: {},
		},
		NOP,
	]),
];

const LUOT_KHONG_NOP = [
	tin("u1", "user", [{ type: "text", text: CAU_HOI }]),
	tin("a1", "assistant", [{ type: "text", text: "CHU-TU-DO-CUA-MODEL" }]),
];

let root: Root | null = null;
let khung: HTMLElement | null = null;

afterEach(() => {
	act(() => root?.unmount());
	khung?.remove();
	root = null;
	khung = null;
});

async function mo(con: ReactNode): Promise<HTMLElement> {
	khung = document.createElement("div");
	document.body.appendChild(khung);
	root = createRoot(khung);
	await act(async () => {
		root?.render(<LocaleProvider locale="vi">{con}</LocaleProvider>);
	});
	return khung;
}

function dung(them: Partial<KhungHoiProps> = {}) {
	const goi = {
		gui: [] as string[],
		thuLai: [] as string[],
		moTrich: [] as { kind: string; id: string }[],
		phanHoi: [] as { maTraLoi: string; huuIch: boolean }[],
	};
	const props: KhungHoiProps = {
		messages: LUOT_TRA_LOI,
		dangChay: false,
		loi: false,
		lyDoKhoa: null,
		daPhanHoi: {},
		onGui: (t) => goi.gui.push(t),
		onThuLai: (t) => goi.thuLai.push(t),
		onMoTrich: (r) => goi.moTrich.push(r),
		onPhanHoi: (maTraLoi, huuIch) => goi.phanHoi.push({ maTraLoi, huuIch }),
		...them,
	};
	return { props, goi };
}

describe("okr hoi dap", () => {
	test("hdo-man: moi cau mot trich, mot phan hoi; chu tu do cua model khong hien", async () => {
		const { props, goi } = dung();
		const k = await mo(<KhungHoi {...props} />);
		const nhan = [...k.querySelectorAll("[data-nhan-trich]")] as HTMLElement[];
		expect(nhan.length).toBe(2);
		expect(k.querySelectorAll('[data-slot="ai-feedback"]').length).toBe(1);
		expect(k.textContent).not.toContain("CHU-TU-DO-CUA-MODEL");
		expect(k.textContent).toContain(CAU_HOI);
		expect(nhan[0]?.getAttribute("translate")).toBe("no");
		expect(nhan[0]?.textContent).toBe("Doanh thu quý 4");
		for (const [i, mong] of [
			[0, { kind: "kr", id: "kr-doanh-thu" }],
			[1, { kind: "objective", id: "mt-kd" }],
		] as const) {
			await act(async () => nhan[i]?.click());
			const mo = [...document.body.querySelectorAll("[data-trich-okr]")].at(
				-1,
			) as HTMLElement | undefined;
			expect(mo).toBeDefined();
			await act(async () => mo?.click());
			expect(goi.moTrich.at(-1)).toEqual(mong);
		}
		expect(goi.moTrich.length).toBe(2);
	});

	test("hdo-man-khong-nop: luot xong ma khong co cau tra loi duoc nhan thi bao loi va thu lai dung cau", async () => {
		const { props, goi } = dung({ messages: LUOT_KHONG_NOP });
		const k = await mo(<KhungHoi {...props} />);
		const thuLai = k.querySelector(
			'[data-slot="kara-retry"]',
		) as HTMLElement | null;
		expect(thuLai).not.toBeNull();
		await act(async () => thuLai?.click());
		expect(goi.thuLai).toEqual([CAU_HOI]);
		expect(k.querySelectorAll("[data-nhan-trich]").length).toBe(0);
	});

	test("hdo-man: dau cot ghi Kara mot lan", async () => {
		const { props } = dung();
		const k = await mo(<KhungHoi {...props} />);
		const dau = k.querySelector("[data-khung='hoi-okr']")?.firstElementChild;
		expect(dau?.textContent?.match(/Kara/g)?.length).toBe(1);
	});

	test("hdo-man: dang chay thi khong bao loi, hien dang doc", async () => {
		const { props } = dung({ messages: LUOT_KHONG_NOP, dangChay: true });
		const k = await mo(<KhungHoi {...props} />);
		expect(k.querySelector('[data-slot="kara-retry"]')).toBeNull();
		expect(k.querySelector('[data-kara-state="working"]')).not.toBeNull();
	});

	test("hdo-khoa: 429 khoa o go va noi khi nao mo lai; 200 thi o go bat", async () => {
		for (const lyDo of ["het-luot-ngay", "het-tran-thang"] as const) {
			const { props } = dung({ lyDoKhoa: lyDo });
			const k = await mo(<KhungHoi {...props} />);
			expect(k.querySelector("textarea")?.disabled).toBe(true);
			expect(k.textContent).toContain(m.khoa[lyDo]);
			act(() => root?.unmount());
			khung?.remove();
		}
		const { props } = dung();
		const k = await mo(<KhungHoi {...props} />);
		expect(k.querySelector("textarea")?.disabled).toBe(false);
	});

	test("hdo-chu: khoa vi bang khoa en", () => {
		const khoa = (o: NhanhChu, tien = ""): string[] =>
			Object.entries(o).flatMap(([k, v]) =>
				v instanceof Function || v instanceof Array || !(v instanceof Object)
					? [`${tien}${k}`]
					: khoa(v, `${tien}${k}.`),
			);
		expect(khoa(okrHoiMessages("vi")).sort()).toEqual(
			khoa(okrHoiMessages("en")).sort(),
		);
	});
});
