import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { ketQuaNopTraLoi } from "@crm/validation/okr-tra-loi";
import {
	ClientError,
	defaultMessageReducer,
	type EveAgentReducerEvent,
} from "eve/client";
import type { EveMessage } from "eve/react";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { z } from "zod";
import {
	KhungHoi,
	type KhungHoiProps,
} from "@/app/(app)/[slug]/okr/hoi/khung-hoi";
import { lyDoKhoaTu } from "@/app/(app)/[slug]/okr/hoi/loi-hoi";
import { okrHoiMessages } from "@/lib/messages/okr-hoi";

const m = okrHoiMessages("vi");
type GiaTriChu = string | readonly string[] | ((...doiSo: string[]) => string);
type NhanhChu = { readonly [khoa: string]: GiaTriChu | NhanhChu };

const ghiLai = z
	.object({
		cauHoi: z.string().min(1),
		suKien: z.array(z.object({ type: z.string() }).passthrough()).min(1),
	})
	.parse(
		JSON.parse(
			readFileSync(
				join(import.meta.dir, "fixtures/okr-hoi-luong.json"),
				"utf8",
			),
		),
	);
const SU_KIEN = ghiLai.suKien as unknown as EveAgentReducerEvent[];
const CAU_HOI = ghiLai.cauHoi;

const laNop = (e: { type: string; data?: unknown }) =>
	JSON.stringify(e.data ?? null).includes('"toolName":"nop_tra_loi"');

const dungTin = (suKien: EveAgentReducerEvent[]): readonly EveMessage[] => {
	const r = defaultMessageReducer();
	let trangThai = r.initial();
	for (const e of suKien) trangThai = r.reduce(trangThai, e);
	return trangThai.messages;
};

const NHAN = z.object({
	type: z.literal("action.result"),
	data: z.object({
		result: z.object({
			toolName: z.literal("nop_tra_loi"),
			output: ketQuaNopTraLoi,
		}),
	}),
});
const traLoiNhan = SU_KIEN.flatMap((e) => {
	const r = NHAN.safeParse(e);
	return r.success && r.data.data.result.output.ok
		? [r.data.data.result.output.traLoi]
		: [];
}).at(-1);
if (!traLoiNhan) throw new Error("ban ghi khong co cau tra loi duoc nhan");
const TRICH = traLoiNhan.cau.flatMap((c) => c.trich);
const CHU_TU_DO = SU_KIEN.flatMap((e) => {
	const r = z
		.object({
			type: z.literal("message.completed"),
			data: z.object({ message: z.string() }),
		})
		.safeParse(e);
	return r.success ? r.data.data.message.split("\n") : [];
})
	.map((d) => d.trim())
	.filter(
		(d) =>
			d.length > 40 &&
			!traLoiNhan.cau.some((c) => c.chu.includes(d) || d.includes(c.chu)),
	);

const LUOT_TRA_LOI = dungTin(SU_KIEN);
const LUOT_KHONG_NOP = dungTin(SU_KIEN.filter((e) => !laNop(e)));

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
	test("hdo-man: moi trich mot nhan, mot phan hoi; chu tu do cua model khong hien", async () => {
		const { props, goi } = dung();
		const k = await mo(<KhungHoi {...props} />);
		const nhan = [...k.querySelectorAll("[data-nhan-trich]")] as HTMLElement[];
		expect(TRICH.length).toBeGreaterThan(0);
		expect(nhan.map((n) => n.textContent)).toEqual(TRICH.map((t) => t.ten));
		expect(k.querySelectorAll('[data-slot="ai-feedback"]').length).toBe(1);
		expect(CHU_TU_DO.length).toBeGreaterThan(0);
		expect(CHU_TU_DO.filter((d) => k.textContent?.includes(d))).toEqual([]);
		expect(k.textContent).toContain(CAU_HOI);
		for (const [i, t] of TRICH.entries()) {
			await act(async () => nhan[i]?.click());
			const mo = [...document.body.querySelectorAll("[data-trich-okr]")].at(
				-1,
			) as HTMLElement | undefined;
			expect(mo).toBeDefined();
			await act(async () => mo?.click());
			expect(goi.moTrich.at(-1)).toEqual({ kind: t.loai, id: t.id });
		}
		expect(goi.moTrich.length).toBe(TRICH.length);
	});

	test("hdo-chu: moi ten Muc tieu va KR trich deu nam trong phan tu translate=no", async () => {
		const { props } = dung();
		const k = await mo(<KhungHoi {...props} />);
		const nhan = [...k.querySelectorAll("[data-nhan-trich]")] as HTMLElement[];
		expect(nhan.map((n) => n.getAttribute("data-nhan-trich"))).toEqual(
			TRICH.map((t) => t.loai),
		);
		const thieu = nhan
			.filter((n) => n.closest('[translate="no"]') === null)
			.map((n) => n.textContent);
		expect(thieu).toEqual([]);
		for (const n of nhan) {
			await act(async () => n.click());
			const the = [...document.body.querySelectorAll("[data-trich-okr]")].at(
				-1,
			) as HTMLElement | undefined;
			const ten = n.textContent ?? "";
			const chua = [...(the?.closest("[role]")?.querySelectorAll("*") ?? [])]
				.filter((e) => e.textContent === ten && e.children.length === 0)
				.filter((e) => e.closest('[translate="no"]') === null);
			expect(chua.map((e) => e.textContent)).toEqual([]);
		}
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
		const loiCua = async (status: number, error: string) => {
			const ra = Response.json({ error }, { status });
			return new ClientError(ra.status, await ra.text(), ra.headers);
		};
		expect(lyDoKhoaTu(await loiCua(500, "het-luot-ngay"))).toBeNull();
		expect(lyDoKhoaTu(undefined)).toBeNull();
		for (const lyDo of ["het-luot-ngay", "het-tran-thang"] as const) {
			const { props } = dung({
				lyDoKhoa: lyDoKhoaTu(await loiCua(429, lyDo)),
			});
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
