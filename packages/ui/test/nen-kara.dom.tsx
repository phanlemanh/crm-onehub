import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
	type DongHien,
	type NutThe,
	propsThe,
} from "../../../apps/app/app/(app)/[slug]/okr/the-gop-y-props";
import { okrGopYMessages } from "../../../apps/app/lib/messages/okr-gop-y";
import { AiFeedback } from "../src/components/ai-feedback";
import { KaraLabel, KaraMark } from "../src/components/kara";
import { LocaleProvider } from "../src/components/locale-provider";
import {
	ProposedChange,
	type ProposedChangeAction,
	type ProposedChangeDecision,
	type ProposedChangeDensity,
	type ProposedChangeProps,
	ProposedChangeReceipt,
} from "../src/components/proposed-change";
import type { Locale } from "../src/lib/locale";
import { TEN_RIENG } from "./du-lieu";

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

function ve(cay: ReactElement, locale: Locale = "vi"): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() =>
		root?.render(<LocaleProvider locale={locale}>{cay}</LocaleProvider>),
	);
	return o;
}

function phim(dich: Element, loai: "keydown" | "keyup", key: string): boolean {
	let khongChan = true;
	act(() => {
		khongChan = dich.dispatchEvent(
			new KeyboardEvent(loai, { key, bubbles: true, cancelable: true }),
		);
	});
	return khongChan;
}

function kichHoatNhuTrinhDuyet(dich: HTMLElement, key: "Enter" | " ") {
	const laNut = dich instanceof HTMLButtonElement;
	const xuong = phim(dich, "keydown", key);
	if (key === "Enter") {
		if (laNut && xuong) act(() => dich.click());
		return;
	}
	const len = phim(dich, "keyup", key);
	if (laNut && xuong && len) act(() => dich.click());
}

function oViSao(): HTMLElement | null {
	return document.body.querySelector<HTMLElement>(
		'[data-slot="popover-content"]',
	);
}

function nutTen(goc: ParentNode, ten: string): HTMLButtonElement {
	const nut = [...goc.querySelectorAll<HTMLButtonElement>("button")].find(
		(b) => b.textContent?.trim() === ten,
	);
	if (!nut) throw new Error(`khong thay nut ${ten}`);
	return nut;
}

const LOP_TO = /^(text|bg)-(primary|brand)/;

describe("nk-dau", () => {
	test("nk-dau: tia sáng ẩn với trình đọc, chữ Kara, màu chữ phụ, không tô", () => {
		for (const [scope, chu] of [
			[undefined, "Kara"],
			["OKR", "Kara · OKR"],
		] as const) {
			const goc = ve(<KaraMark scope={scope} />);
			const dau = goc.querySelector<HTMLElement>('[data-slot="kara-mark"]');
			if (!dau) throw new Error("khong thay dau");
			const svg = dau.querySelectorAll("svg");
			expect(svg.length).toBe(1);
			expect(svg[0]?.getAttribute("aria-hidden")).toBe("true");
			expect(dau.textContent).toBe(chu);
			expect(dau.classList.contains("text-muted-foreground")).toBe(true);
			const to = [dau, ...dau.querySelectorAll("*")].flatMap((el) =>
				[...el.classList].filter((l) => LOP_TO.test(l)),
			);
			if (to.length > 0) throw new Error(`dau to mau: ${to.join(" ")}`);
			act(() => root?.unmount());
			root = null;
			document.body.innerHTML = "";
		}
	});
});

describe("nk-vi-sao", () => {
	function dungHang() {
		const dem = { bam: 0, phim: 0 };
		const goc = ve(
			<table>
				<tbody>
					<tr
						onClick={() => {
							dem.bam += 1;
						}}
						onKeyDown={() => {
							dem.phim += 1;
						}}
					>
						<td>
							<KaraLabel
								scope="OKR"
								text="2 góp ý"
								reason="Ba KR chưa có đích"
								readAt="09:12"
							/>
						</td>
						<td>
							<button type="button">khac</button>
						</td>
					</tr>
				</tbody>
			</table>,
		);
		return { goc, dem };
	}

	test("nk-vi-sao: bấm, Enter, Space mở ô mà không bật hàng; Esc trả focus", async () => {
		const { goc, dem } = dungHang();
		const nut = nutTen(goc, "Vì sao?");
		expect(oViSao()).toBeNull();
		act(() => nut.click());
		const o = oViSao();
		if (!o) throw new Error("o vi sao khong mo khi bam");
		expect(o.textContent).toContain("Kara dựa trên gì");
		expect(o.textContent).toContain("Ba KR chưa có đích");
		expect(o.textContent).toContain("Đọc lúc 09:12");
		if (dem.bam !== 0) throw new Error(`nhan lam mo hang: bam ${dem.bam}`);
		phim(o, "keydown", "Escape");
		expect(oViSao()).toBeNull();
		for (const key of ["Enter", " "] as const) {
			act(() => nut.focus());
			kichHoatNhuTrinhDuyet(nut, key);
			if (!oViSao()) throw new Error(`o vi sao khong mo bang ${key}`);
			phim(oViSao() as HTMLElement, "keydown", "Escape");
			expect(oViSao()).toBeNull();
		}
		if (dem.bam !== 0) throw new Error(`nhan lam mo hang: bam ${dem.bam}`);
		if (dem.phim !== 0) throw new Error(`phim lam mo hang: phim ${dem.phim}`);
		await act(() => new Promise((xong) => setTimeout(xong, 20)));
		expect(document.activeElement).toBe(nut);
	});

	test("nk-vi-sao: đối chứng — Enter trên nút khác trong hàng có tới hàng", () => {
		const { goc, dem } = dungHang();
		const khac = nutTen(goc, "khac");
		act(() => khac.focus());
		phim(khac, "keydown", "Enter");
		expect(dem.phim).toBe(1);
	});
});

const m = okrGopYMessages("vi");

const DONG_VIET_LAI: DongHien = {
	id: "dx-1",
	loai: "viet-lai",
	objectiveId: "mt-1",
	keyResultId: null,
	truong: "title",
	truoc: "Tăng doanh thu",
	sau: "Khách hàng doanh nghiệp chọn OneHub làm nền tảng chính",
	maVanDe: null,
	targetObjectiveId: null,
	targetKeyResultId: null,
	lyDo: "Tên cũ là con số, không nói vì sao khách chọn mình.",
	tenDich: null,
};

const HAI_DO_DAY: readonly ProposedChangeDensity[] = ["inline", "card"];

function hanhDong(nut: NutThe[]): ProposedChangeAction[] {
	return nut.map((n) => ({ ...n, onClick: () => {} }));
}

function goc(o: ParentNode): HTMLElement {
	const g = o.querySelector<HTMLElement>('[data-slot="proposed-change"]');
	if (!g) throw new Error("khong thay de xuat");
	return g;
}

function don() {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
}

function hangNut(g: ParentNode) {
	return [...g.querySelectorAll<HTMLButtonElement>("button")].map((b) => ({
		chu: b.textContent,
		kieu: b.getAttribute("data-variant"),
		khoa: b.disabled,
	}));
}

function thuTuKhoi(g: HTMLElement): string[] {
	return [
		...g.querySelectorAll(
			'[data-slot="proposed-change-label"], del, ins, [data-slot="proposed-change-body"] > p:last-child, [data-slot="proposed-change-actions"]',
		),
	].map((k) => {
		if (k.matches('[data-slot="proposed-change-label"]')) return "nhan";
		if (k.tagName === "DEL") return "cu";
		if (k.tagName === "INS") return "moi";
		if (k.matches('[data-slot="proposed-change-actions"]')) return "nut";
		return "ly-do";
	});
}

describe("nk-inline", () => {
	test("nk-inline: không truyền density và density=inline ra Item, không Alert", () => {
		const p = propsThe(DONG_VIET_LAI, { m });
		for (const density of [undefined, "inline"] as const) {
			const g = goc(
				ve(
					<ProposedChange
						{...p.the}
						density={density}
						actions={hanhDong(p.nut)}
					/>,
				),
			);
			expect(g.getAttribute("data-density")).toBe("inline");
			expect(g.getAttribute("data-variant")).toBe("default");
			expect(g.hasAttribute("data-size")).toBe(true);
			expect(g.classList.contains("group/item")).toBe(true);
			expect(g.getAttribute("role")).not.toBe("alert");
			const hop = [...g.querySelectorAll("*"), g].filter(
				(el) =>
					el.classList.contains("group/alert") ||
					el.getAttribute("data-slot") === "card",
			);
			if (hop.length > 0) throw new Error("inline co alert");
			expect(
				g
					.querySelector("del")
					?.closest("[translate]")
					?.getAttribute("translate"),
			).toBe("no");
			expect(
				g
					.querySelector("ins")
					?.closest("[translate]")
					?.getAttribute("translate"),
			).toBe("no");
			expect(thuTuKhoi(g)).toEqual(["nhan", "cu", "moi", "ly-do", "nut"]);
			expect(g.querySelectorAll('button[data-variant="default"]').length).toBe(
				1,
			);
			don();
		}
	});
});

type TrangThai = {
	ten: string;
	them: Partial<ProposedChangeProps>;
	kiem: (g: HTMLElement, huy: () => number) => void;
};

describe("nk-hai-do-day", () => {
	test("nk-hai-do-day: năm trạng thái × hai độ dày cho cùng nút, khoá, lỗi, ô sửa", () => {
		const p = propsThe(DONG_VIET_LAI, { m });
		const TRANG_THAI: readonly TrangThai[] = [
			{ ten: "cho", them: {}, kiem: () => {} },
			{ ten: "dang-gui", them: { pending: true }, kiem: () => {} },
			{
				ten: "khoa",
				them: { lockedReason: "Lưu thay đổi của KR trước" },
				kiem: (g) => {
					const khoa = [...g.querySelectorAll("button[aria-describedby]")];
					const id = khoa[0]?.getAttribute("aria-describedby");
					const lyDo = id ? document.getElementById(id) : null;
					if (lyDo?.textContent !== "Lưu thay đổi của KR trước") {
						throw new Error(`khoa mat o ${g.getAttribute("data-density")}`);
					}
				},
			},
			{
				ten: "loi",
				them: { error: "Kara chưa ghi được" },
				kiem: (g) => {
					expect(
						g.querySelector('[data-slot="field-error"]')?.textContent,
					).toContain("Kara chưa ghi được");
				},
			},
			{
				ten: "dang-sua",
				them: {},
				kiem: (g, huy) => {
					const o = g.querySelector<HTMLTextAreaElement>(
						'textarea[data-slot="proposed-change-edit"]',
					);
					if (!o) throw new Error("khong thay o sua");
					phim(o, "keydown", "Escape");
					expect(huy()).toBe(1);
				},
			},
		];
		const nutKhoa = p.nut.map((n) =>
			n.tone === "primary" ? { ...n, disabled: true } : n,
		);
		let soO = 0;
		for (const t of TRANG_THAI) {
			const bo: Record<string, ReturnType<typeof hangNut>> = {};
			for (const density of HAI_DO_DAY) {
				let soLanHuy = 0;
				const editing =
					t.ten === "dang-sua"
						? {
								value: "Bản sửa",
								onChange: () => {},
								onCancel: () => {
									soLanHuy += 1;
								},
							}
						: undefined;
				const g = goc(
					ve(
						<ProposedChange
							{...p.the}
							{...t.them}
							density={density}
							editing={editing}
							actions={hanhDong(t.ten === "khoa" ? nutKhoa : p.nut)}
						/>,
					),
				);
				expect(g.getAttribute("data-density")).toBe(density);
				bo[density] = hangNut(g);
				t.kiem(g, () => soLanHuy);
				soO += 1;
				don();
			}
			expect(bo.inline).toEqual(bo.card);
		}
		console.info(`nk-hai-do-day: ${soO} o`);
		expect(soO).toBe(10);
	});
});

describe("nk-bien-nhan", () => {
	test("nk-bien-nhan: ba quyết định × có/không hoàn tác × hai độ dày thu về một dòng", () => {
		const p = propsThe(DONG_VIET_LAI, { m });
		const QUYET: readonly ProposedChangeDecision[] = [
			"accepted",
			"dismissed",
			"skipped",
		];
		let soO = 0;
		for (const decision of QUYET) {
			for (const coHoanTac of [true, false]) {
				for (const density of HAI_DO_DAY) {
					let soLanHoanTac = 0;
					const g = goc(
						ve(
							<ProposedChange
								{...p.the}
								density={density}
								decided={{
									decision,
									text: `Đã quyết ${decision}`,
									onUndo: coHoanTac
										? () => {
												soLanHoanTac += 1;
											}
										: undefined,
								}}
								actions={hanhDong(p.nut)}
							/>,
						),
					);
					expect(
						g.querySelector('[data-slot="proposed-change-actions"]'),
					).toBeNull();
					const dong = g.querySelectorAll(
						'[data-slot="proposed-change-decided"]',
					);
					expect(dong.length).toBe(1);
					expect(dong[0]?.textContent).toBe(`Đã quyết ${decision}`);
					expect(dong[0]?.closest('[role="status"]')).not.toBeNull();
					expect(g.getAttribute("data-decided")).toBe(decision);
					const hoanTac = [...g.querySelectorAll("button")].filter(
						(b) => b.textContent === "Hoàn tác",
					);
					if (coHoanTac) {
						expect(hoanTac.length).toBe(1);
						act(() => hoanTac[0]?.click());
						if (soLanHoanTac !== 1)
							throw new Error(`hoan tac khong goi: ${soLanHoanTac}`);
					} else {
						expect(hoanTac.length).toBe(0);
					}
					if (decision !== "accepted") {
						expect(dong[0]?.classList.contains("text-muted-foreground")).toBe(
							true,
						);
					}
					soO += 1;
					don();
				}
			}
		}
		console.info(`nk-bien-nhan: ${soO} o`);
		expect(soO).toBe(12);
	});
});

describe("nk-phan-hoi", () => {
	function PhanHoiThu({
		ghi,
		pending = false,
		dau = null,
	}: {
		ghi: boolean[];
		pending?: boolean;
		dau?: boolean | null;
	}) {
		const [v, setV] = useState<boolean | null>(dau);
		return (
			<AiFeedback
				value={v}
				pending={pending}
				label="Có hữu ích không"
				thanks="Cảm ơn, đã ghi"
				onChange={(moi) => {
					ghi.push(moi);
					setV(moi);
				}}
			/>
		);
	}

	function nutPhanHoi(o: ParentNode, nhan: string): HTMLElement {
		const nut = [
			...o.querySelectorAll<HTMLElement>('[data-slot="toggle-group-item"]'),
		].find((b) => b.textContent?.trim() === nhan);
		if (!nut) throw new Error(`khong thay nut ${nhan}`);
		return nut;
	}

	test("nk-phan-hoi: chọn lần lượt, trạng thái bật, dòng cảm ơn", () => {
		const ghi: boolean[] = [];
		const o = ve(<PhanHoiThu ghi={ghi} />);
		const g = o.querySelector('[data-slot="ai-feedback"]');
		if (!g) throw new Error("khong thay ai-feedback");
		expect(g.querySelector('[role="status"]')?.textContent).toBe("");
		expect(
			g.querySelector('[data-slot="toggle-group"]')?.getAttribute("aria-label"),
		).toBe("Có hữu ích không");
		act(() => nutPhanHoi(o, "Hữu ích").click());
		act(() => nutPhanHoi(o, "Không hữu ích").click());
		if (ghi.join(",") !== "true,false")
			throw new Error(`phan hoi dao: ${ghi.join(",")}`);
		expect(nutPhanHoi(o, "Không hữu ích").getAttribute("data-state")).toBe(
			"on",
		);
		expect(nutPhanHoi(o, "Hữu ích").getAttribute("data-state")).toBe("off");
		expect(g.querySelector('[role="status"]')?.textContent).toBe(
			"Cảm ơn, đã ghi",
		);
		don();
		const o2 = ve(<PhanHoiThu ghi={[]} pending dau />);
		expect(o2.querySelector('[role="status"]')?.textContent).toBe("");
	});
});

const DAU = /§\d+/g;

function chuTuDat(): string[] {
	const ra: string[] = [];
	const di = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
	for (let n = di.nextNode(); n; n = di.nextNode()) {
		const t = (n.textContent ?? "")
			.replace(DAU, "")
			.replace(/\s+/g, " ")
			.trim();
		if (t && /\p{L}/u.test(t)) ra.push(t);
	}
	return ra;
}

type CaTieng = {
	ten: string;
	so: number;
	ve: () => ReactElement;
	mo?: () => void;
};

describe("nk-hai-tieng", () => {
	test("nk-hai-tieng: mọi chữ thành phần tự đặt đổi theo tiếng, trừ tên Kara", () => {
		const CA: readonly CaTieng[] = [
			{ ten: "KaraMark", so: 1, ve: () => <KaraMark scope="§1" /> },
			{
				ten: "KaraLabel",
				so: 4,
				ve: () => <KaraLabel scope="§1" text="§2" reason="§3" readAt="§4" />,
				mo: () => {
					const nut = document.body.querySelector<HTMLButtonElement>(
						"[data-slot='kara-label'] button",
					);
					if (!nut) throw new Error("khong thay nut vi sao");
					act(() => nut.click());
				},
			},
			{
				ten: "ProposedChange",
				so: 0,
				ve: () => (
					<ProposedChange
						kind="rewrite"
						label="§1"
						before="§2"
						value="§3"
						rationale="§4"
						actions={[
							{ id: "a", label: "§5", tone: "primary", onClick: () => {} },
							{ id: "b", label: "§6", tone: "quiet", onClick: () => {} },
						]}
					/>
				),
			},
			{
				ten: "ProposedChangeReceipt",
				so: 1,
				ve: () => (
					<ProposedChangeReceipt
						decision="accepted"
						text="§1"
						onUndo={() => {}}
					/>
				),
			},
			{
				ten: "AiFeedback",
				so: 2,
				ve: () => (
					<AiFeedback value onChange={() => {}} label="§1" thanks="§2" />
				),
			},
		];
		let soCho = 0;
		for (const ca of CA) {
			const theoTieng = { vi: [] as string[], en: [] as string[] };
			for (const locale of ["vi", "en"] as const) {
				ve(ca.ve(), locale);
				ca.mo?.();
				theoTieng[locale] = chuTuDat();
				don();
				const n = theoTieng[locale].length;
				if (n !== ca.so) {
					throw new Error(`so cho sai: ${ca.ten} ${locale} ${n} != ${ca.so}`);
				}
			}
			theoTieng.vi.forEach((vi, i) => {
				soCho += 1;
				if (TEN_RIENG.has(vi)) return;
				if (vi === theoTieng.en[i]) throw new Error(`chu cung: ${vi}`);
			});
		}
		const can = CA.reduce((tong, ca) => tong + ca.so, 0);
		console.info(`nk-hai-tieng: ${soCho} cho da so / ${can} cho ghi truoc`);
		expect(soCho).toBe(can);
	});
});
