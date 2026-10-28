import { afterEach, describe, expect, test } from "bun:test";
import {
	LOAI_CAM_XUC,
	type LoaiCamXuc,
	OKR_CAM_XUC,
} from "@crm/validation/okr-cam-xuc";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { LocaleProvider } from "../src/components/locale-provider";
import {
	type MucCamXuc,
	ThanhCamXuc,
	type ThanhCamXucProps,
} from "../src/components/thanh-cam-xuc";
import { messages } from "../src/lib/messages";

const msg = messages("vi");
const TEN_TOI_DA = OKR_CAM_XUC.tenToiDa;

const EMOJI = {
	"dong-y": "👍",
	"chuc-mung": "🎉",
	"co-len": "💪",
	"da-xem": "👀",
} satisfies Record<LoaiCamXuc, string>;

const BO = LOAI_CAM_XUC.map((loai) => ({
	loai,
	emoji: EMOJI[loai],
	ten: msg.camXuc.loai[loai],
}));

const NGUOI = ["Lan", "Minh", "Hà", "Quân", "Vy", "Tú", "Nga"];

function muc(loai: LoaiCamXuc, nguoi: string[], cuaToi = false): MucCamXuc {
	return {
		loai,
		emoji: EMOJI[loai],
		ten: msg.camXuc.loai[loai],
		so: nguoi.length,
		cuaToi,
		nguoi,
	};
}

let root: Root | null = null;

afterEach(() => {
	act(() => root?.unmount());
	root = null;
	document.body.innerHTML = "";
});

type Goi = { loai: string[] };

function ve(props: Partial<ThanhCamXucProps> & { muc: MucCamXuc[] }) {
	const goi: Goi = { loai: [] };
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	const cay: ReactElement = (
		<LocaleProvider locale="vi">
			<ThanhCamXuc
				bo={BO}
				onDao={(loai) => goi.loai.push(loai)}
				tenToiDa={TEN_TOI_DA}
				{...props}
			/>
		</LocaleProvider>
	);
	act(() => root?.render(cay));
	return { goc: o, goi };
}

function thanh(goc: HTMLElement): HTMLElement {
	const t = goc.querySelector<HTMLElement>("[data-thanh-cam-xuc]");
	if (!t) throw new Error("khong thay data-thanh-cam-xuc");
	return t;
}

function chips(goc: HTMLElement): HTMLButtonElement[] {
	return [...thanh(goc).querySelectorAll<HTMLButtonElement>("[data-cam-xuc]")];
}

function chip(goc: HTMLElement, loai: LoaiCamXuc): HTMLButtonElement {
	const c = thanh(goc).querySelector<HTMLButtonElement>(
		`[data-cam-xuc="${loai}"]`,
	);
	if (!c) throw new Error(`khong thay chip ${loai}`);
	return c;
}

function nutMo(goc: HTMLElement): HTMLButtonElement {
	const n = thanh(goc).querySelector<HTMLButtonElement>("[data-mo-cam-xuc]");
	if (!n) throw new Error("khong thay nut data-mo-cam-xuc");
	return n;
}

function bang(): HTMLElement | null {
	return document.querySelector<HTMLElement>("[data-bang-cam-xuc]");
}

function nutBang(): HTMLButtonElement[] {
	return [
		...(bang()?.querySelectorAll<HTMLButtonElement>("[data-chon-cam-xuc]") ??
			[]),
	];
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

function dauTab(goc: HTMLElement): HTMLElement | undefined {
	return [...goc.querySelectorAll<HTMLElement>("button, [tabindex]")].find(
		(e) =>
			e.tabIndex >= 0 &&
			!(e instanceof HTMLButtonElement && e.disabled) &&
			e.getAttribute("aria-hidden") !== "true",
	);
}

function dangFocus(): string {
	const e = document.activeElement;
	if (!e) return "khong";
	const chon = e.getAttribute("data-chon-cam-xuc");
	if (chon) return `chon:${chon}`;
	if (e.hasAttribute("data-mo-cam-xuc")) return "nut-mo";
	const camXuc = e.getAttribute("data-cam-xuc");
	if (camXuc) return `chip:${camXuc}`;
	return e.tagName.toLowerCase();
}

async function cho(ms: number) {
	await act(() => new Promise((r) => setTimeout(r, ms)));
}

describe("cx-thanh", () => {
	test("rỗng: chỉ nút Thả cảm xúc, không chip", () => {
		const { goc } = ve({ muc: [] });
		expect(chips(goc)).toHaveLength(0);
		expect(nutMo(goc).getAttribute("aria-label")).toBe(msg.camXuc.thaCamXuc);
	});

	test("một loại của tôi: chip sáng, nhãn có tên loại, số và «bạn đã thả»", () => {
		const { goc } = ve({ muc: [muc("dong-y", ["Lan"], true)] });
		expect(chips(goc)).toHaveLength(1);
		const c = chip(goc, "dong-y");
		if (c.getAttribute("aria-pressed") !== "true") {
			throw new Error(
				`chip cua toi khong aria-pressed=true (nhan ${c.getAttribute("aria-pressed")})`,
			);
		}
		const nhan = c.getAttribute("aria-label") ?? "";
		expect(nhan).toContain(msg.camXuc.loai["dong-y"]);
		expect(nhan).toContain("1");
		expect(nhan).toContain(msg.camXuc.banDaTha);
		expect(c.textContent).toContain("1");
	});

	test("hai loại không của tôi: hai chip theo thứ tự LOAI_CAM_XUC, không sáng", () => {
		const { goc } = ve({
			muc: [muc("da-xem", ["Minh"]), muc("dong-y", ["Lan", "Hà"])],
		});
		const thuTu = LOAI_CAM_XUC.filter((l) => l === "dong-y" || l === "da-xem");
		expect(chips(goc).map((c) => c.getAttribute("data-cam-xuc"))).toEqual([
			...thuTu,
		]);
		for (const c of chips(goc)) {
			expect(c.getAttribute("aria-pressed")).toBe("false");
			expect(c.getAttribute("aria-label")).not.toContain(msg.camXuc.banDaTha);
		}
	});

	test("tenToiDa+2 người: tooltip cắt ở tenToiDa tên rồi «và 2 người khác»", async () => {
		const ds = NGUOI.slice(0, TEN_TOI_DA + 2);
		const { goc } = ve({ muc: [muc("chuc-mung", ds)] });
		act(() => {
			chip(goc, "chuc-mung").dispatchEvent(
				new PointerEvent("pointermove", {
					bubbles: true,
					pointerType: "mouse",
				}),
			);
		});
		await cho(10);
		const ten = document.querySelector("[data-ten-nguoi]");
		if (!ten) throw new Error("di chuot chip khong mo tooltip");
		const mong = `${ds.slice(0, TEN_TOI_DA).join(", ")} ${msg.camXuc.vaNguoiKhac(String(ds.length - TEN_TOI_DA))}`;
		if (ten.textContent !== mong) {
			throw new Error(
				`tooltip ${JSON.stringify(ten.textContent)} khac chuoi mong cho ${JSON.stringify(mong)}`,
			);
		}
	});

	test("đang gửi: chip bị tắt", () => {
		const { goc, goi } = ve({
			dangGui: true,
			muc: [muc("co-len", ["Lan"], true)],
		});
		const c = chip(goc, "co-len");
		expect(c.disabled).toBe(true);
		act(() => c.click());
		expect(goi.loai).toEqual([]);
	});

	test("bảng: bốn nút, đủ tên từng loại, mở bảng không gọi onDao", async () => {
		const ds = NGUOI.slice(0, TEN_TOI_DA + 2);
		const { goc, goi } = ve({
			muc: [muc("dong-y", ds), muc("da-xem", ["Vy"], true)],
		});
		expect(bang()).toBeNull();
		act(() => nutMo(goc).click());
		await cho(10);
		if (!bang()) throw new Error("bam nut Tha cam xuc khong mo bang");
		expect(goi.loai).toEqual([]);
		expect(nutBang().map((n) => n.getAttribute("data-chon-cam-xuc"))).toEqual([
			...LOAI_CAM_XUC,
		]);
		const dong = [
			...(bang()?.querySelectorAll<HTMLElement>("[data-ten-loai]") ?? []),
		];
		expect(dong.map((d) => d.getAttribute("data-ten-loai"))).toEqual([
			"dong-y",
			"da-xem",
		]);
		expect(dong[0]?.querySelector("dd")?.textContent).toBe(ds.join(", "));
		expect(dong[1]?.querySelector("dd")?.textContent).toBe("Vy");
		expect(dong[0]?.querySelector("dt")?.textContent).toContain(
			msg.camXuc.loai["dong-y"],
		);
	});

	test("bàn phím: Tab tới chip đầu, Enter rồi Space đảo đúng loại", () => {
		const { goc, goi } = ve({
			muc: [muc("chuc-mung", ["Lan"]), muc("da-xem", ["Minh"])],
		});
		const dau = dauTab(goc);
		expect(dau?.getAttribute("data-cam-xuc")).toBe("chuc-mung");
		act(() => dau?.focus());
		expect(dangFocus()).toBe("chip:chuc-mung");
		kichHoatNhuTrinhDuyet(chip(goc, "chuc-mung"), "Enter");
		expect(goi.loai).toEqual(["chuc-mung"]);
		kichHoatNhuTrinhDuyet(chip(goc, "chuc-mung"), " ");
		expect(goi.loai).toEqual(["chuc-mung", "chuc-mung"]);
	});

	test("bàn phím: Enter mở bảng, mũi tên phải tới loại thứ hai, Esc đóng và về nút", async () => {
		const { goc, goi } = ve({ muc: [muc("dong-y", ["Lan"])] });
		act(() => nutMo(goc).focus());
		kichHoatNhuTrinhDuyet(nutMo(goc), "Enter");
		await cho(10);
		if (!bang()) throw new Error("Enter tren nut khong mo bang");
		expect(goi.loai).toEqual([]);
		const [mot] = nutBang();
		if (!mot) throw new Error("bang khong co nut");
		expect(dangFocus()).toBe(`chon:${LOAI_CAM_XUC[0]}`);
		phim(mot, "keydown", "ArrowRight");
		await cho(10);
		expect(dangFocus()).toBe(`chon:${LOAI_CAM_XUC[1]}`);
		phim(document.activeElement ?? document.body, "keydown", "Escape");
		await cho(10);
		expect(bang()).toBeNull();
		expect(dangFocus()).toBe("nut-mo");
		expect(goi.loai).toEqual([]);
	});
});
