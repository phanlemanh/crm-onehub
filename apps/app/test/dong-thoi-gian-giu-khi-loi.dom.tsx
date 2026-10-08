import { afterEach, describe, expect, test } from "bun:test";
import { useQueryClient } from "@tanstack/react-query";
import { act } from "react";
import type { TimelineEntryData } from "@/components/crm/timeline/timeline-entry";
import {
	bam,
	cho,
	type DauVao,
	dat,
	dongHet,
	goiCua,
	mo,
	nhip,
	nut,
	nutCo,
} from "./khung-gop-y";

const { LocaleProvider } = await import("@crm/ui/components/locale-provider");
const { Timeline } = await import("@/components/crm/timeline/timeline");
const { crmMessages } = await import("@/lib/messages/crm");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");

const VI = crmMessages("vi");
const EN = crmMessages("en");
const THU_LAI = uiMessages("vi").karaKhung.thuLai;
const THU_LAI_EN = uiMessages("en").karaKhung.thuLai;
const coDau =
	/[ăâđêôơưàáạảãằắặẳẵầấậẩẫèéẹẻẽềếệểễìíịỉĩòóọỏõồốộổỗờớợởỡùúụủũừứựửữỳýỵỷỹ]/i;

type Trang = { entries: TimelineEntryData[]; nextCursor: string | null };

afterEach(dongHet);

function phai(dieu: boolean, thongDiep: string) {
	if (!dieu) throw new Error(thongDiep);
}

function hoatDong(id: string, ngay: number): TimelineEntryData {
	const luc = `2026-09-${String(ngay).padStart(2, "0")}T09:00:00.000Z`;
	return {
		id,
		type: "NOTE",
		subject: null,
		body: `Ghi chú ${id}`,
		occurredAt: luc,
		dueAt: null,
		completedAt: null,
		meta: null,
		createdAt: luc,
		createdBy: {
			id: "u1",
			name: "Trần Minh Hải",
			email: "hai@onehub.vn",
			image: null,
		},
		company: null,
		contact: null,
		deal: null,
		planId: null,
		emailThread: null,
		calendarEvent: null,
	};
}

const TRANG_DAU = [hoatDong("a1", 20), hoatDong("a2", 19), hoatDong("a3", 18)];
const TRANG_HAI = [hoatDong("b1", 10), hoatDong("b2", 9)];

const lichSu = (vao: DauVao) => vao?.filter !== "upcoming";
const goiLichSu = () =>
	goiCua("activities.timeline").filter((g) => lichSu(g.dauVao));
const cursorCua = (tu: number) =>
	goiLichSu()
		.slice(tu)
		.map((g) => String(g.dauVao?.cursor ?? "-"))
		.join(",");

const chu = (o: Element | null) => (o?.textContent ?? "").trim();
const khung = () => document.querySelector("[data-vung-tai-loi]");
const thongBao = (loai: "xem-cu" | "lam-moi") =>
	document.querySelector<HTMLElement>(`[data-dtg-loi="${loai}"]`);
const dong = () => [...document.querySelectorAll("[data-slot=timeline] > li")];
const idDong = () =>
	dong()
		.map((li) => /Ghi chú ([a-z][0-9])/.exec(li.textContent ?? "")?.[1] ?? "?")
		.join(",");

function datLichSu(theoCursor: (cursor: string | undefined) => unknown) {
	dat("activities.timelineCounts", () => ({}));
	dat("activities.timeline", (vao) => {
		if (!lichSu(vao)) return { entries: [], nextCursor: null };
		const c = vao?.cursor;
		return theoCursor(c === undefined || c === null ? undefined : String(c));
	});
}

let lamMoi: () => Promise<void> = async () => {};

function MoiLai() {
	const qc = useQueryClient();
	lamMoi = () => qc.invalidateQueries();
	return null;
}

async function moXemCuLoi(
	trangKe: () => unknown,
	xemCu = VI.timeline.showOlder,
	locale: "vi" | "en" = "vi",
) {
	datLichSu((c) =>
		c === undefined
			? ({ entries: TRANG_DAU, nextCursor: "c1" } satisfies Trang)
			: trangKe(),
	);
	const man = <Timeline anchor={{ contactId: "ct-1" }} />;
	await mo(
		locale === "en" ? <LocaleProvider locale="en">{man}</LocaleProvider> : man,
	);
	await cho(() => dong().length === 3, "trang dau");
	await bam(nut(xemCu));
	await cho(
		() =>
			thongBao("xem-cu") !== null ||
			khung() !== null ||
			chu(document.body).includes(VI.timeline.empty.allTitle),
		"sau xem cu",
	);
	phai(
		khung() === null && thongBao("xem-cu") !== null,
		"dtg: xem cu loi thay ca danh sach",
	);
	return thongBao("xem-cu") as HTMLElement;
}

describe("dong-thoi-gian-giu-khi-loi", () => {
	test("dtg-xem-cu-loi: giu danh sach, bao cuoi danh sach kem Thu lai", async () => {
		const truoc = "a1,a2,a3";
		const tb = await moXemCuLoi(() => {
			throw new Error("boom-trang-ke");
		});
		expect(dong().length).toBe(3);
		expect(idDong()).toBe(truoc);
		expect(chu(tb)).toContain(VI.timeline.xemCuLoi);
		expect(tb.getAttribute("role")).toBe("alert");
		expect(nutCo(THU_LAI, tb) !== null).toBe(true);
		expect(nutCo(VI.timeline.showOlder) === null).toBe(true);
		expect(chu(document.body).includes("boom-trang-ke")).toBe(false);
		expect(chu(document.body).includes(VI.timeline.empty.allTitle)).toBe(false);
	});

	test("dtg-thu-lai: chi tai trang ke, tat khi dang tai, nut Xem cu hon quay lai", async () => {
		const o: string[] = [];

		let trangKe: () => unknown = () => {
			throw new Error("boom-trang-ke");
		};
		let tb = await moXemCuLoi(() => trangKe());
		let n0 = goiLichSu().length;
		await bam(nut(THU_LAI, tb));
		await cho(() => goiLichSu().length > n0, "thu lai loi lan nua");
		await nhip(10);
		phai(cursorCua(n0) === "c1", "dtg: thu lai tai lai trang dau");
		await cho(
			() =>
				nutCo(THU_LAI, thongBao("xem-cu") ?? document.body)?.disabled === false,
			"thong bao xem cu sau loi lan nua",
		);
		expect(idDong()).toBe("a1,a2,a3");
		o.push("loi-lan-nua");

		trangKe = () => ({ entries: TRANG_HAI, nextCursor: null }) satisfies Trang;
		n0 = goiLichSu().length;
		await bam(nut(THU_LAI, thongBao("xem-cu") as HTMLElement));
		await cho(() => thongBao("xem-cu") === null, "thu lai thanh cong");
		phai(cursorCua(n0) === "c1", "dtg: thu lai tai lai trang dau");
		expect(idDong()).toBe("a1,a2,a3,b1,b2");
		expect(nutCo(VI.timeline.showOlder) === null).toBe(true);
		o.push("thanh-cong-het-trang");
		await dongHet();

		let lan = 0;
		tb = await moXemCuLoi(() => {
			lan += 1;
			if (lan === 1) throw new Error("boom-trang-ke");
			if (lan === 2)
				return { entries: TRANG_HAI, nextCursor: "c2" } satisfies Trang;
			return { entries: [], nextCursor: null } satisfies Trang;
		});
		await bam(nut(THU_LAI, tb));
		await cho(() => thongBao("xem-cu") === null, "thu lai con trang");
		expect(idDong()).toBe("a1,a2,a3,b1,b2");
		phai(nutCo(VI.timeline.showOlder) !== null, "dtg: xem cu khong quay lai");
		n0 = goiLichSu().length;
		await bam(nut(VI.timeline.showOlder));
		await cho(() => goiLichSu().length === n0 + 1, "xem cu trang c2");
		expect(cursorCua(n0)).toBe("c2");
		o.push("thanh-cong-con-trang");
		await dongHet();

		let treo = false;
		tb = await moXemCuLoi(() => {
			if (treo) return new Promise(() => {});
			treo = true;
			throw new Error("boom-trang-ke");
		});
		n0 = goiLichSu().length;
		await bam(nut(THU_LAI, tb));
		await cho(
			() =>
				nutCo(THU_LAI, thongBao("xem-cu") as HTMLElement)?.disabled === true,
			"nut tat khi dang tai",
		);
		const nutDangTai = nut(THU_LAI, thongBao("xem-cu") as HTMLElement);
		await bam(nutDangTai);
		await nhip(5);
		expect(goiLichSu().length).toBe(n0 + 1);
		expect(nutDangTai.disabled).toBe(true);
		o.push("dang-tai");

		expect(o.length).toBe(4);
	});

	test("dtg-lam-moi: lam moi loi giu danh sach hay trang thai rong", async () => {
		const o: string[] = [];
		let hong = false;
		let soMuc = 3;
		datLichSu(() => {
			if (hong) throw new Error("boom-lam-moi");
			return {
				entries: [...TRANG_DAU, hoatDong("a4", 17)].slice(0, soMuc),
				nextCursor: null,
			} satisfies Trang;
		});
		await mo(
			<>
				<Timeline anchor={{ contactId: "ct-1" }} />
				<MoiLai />
			</>,
		);
		await cho(() => dong().length === 3, "trang dau");
		hong = true;
		await act(async () => {
			await lamMoi();
		});
		await cho(
			() => thongBao("lam-moi") !== null || khung() !== null,
			"sau lam moi",
		);
		phai(
			khung() === null && thongBao("lam-moi") !== null,
			"dtg: lam moi loi thay ca danh sach",
		);
		const tb = thongBao("lam-moi") as HTMLElement;
		expect(idDong()).toBe("a1,a2,a3");
		expect(chu(tb)).toContain(VI.timeline.lamMoiLoi);
		expect(tb.getAttribute("role")).toBe("alert");
		expect(chu(document.body).includes("boom-lam-moi")).toBe(false);
		hong = false;
		soMuc = 4;
		const n0 = goiLichSu().length;
		await bam(nut(THU_LAI, tb));
		await cho(() => thongBao("lam-moi") === null, "thu lai lam moi");
		expect(goiLichSu().length > n0).toBe(true);
		expect(idDong()).toBe("a1,a2,a3,a4");
		o.push("danh-sach");
		await dongHet();

		hong = false;
		soMuc = 0;
		await mo(
			<>
				<Timeline anchor={{ contactId: "ct-1" }} />
				<MoiLai />
			</>,
		);
		await cho(
			() => chu(document.body).includes(VI.timeline.empty.allTitle),
			"rong",
		);
		expect(document.querySelector("[data-dtg-loi]") === null).toBe(true);
		hong = true;
		const n1 = goiLichSu().length;
		await act(async () => {
			await lamMoi();
		});
		await cho(() => goiLichSu().length > n1, "da goi lam moi");
		await nhip(10);
		phai(khung() === null, "dtg: lam moi loi thay ca danh sach");
		phai(thongBao("lam-moi") !== null, "dtg: lam moi loi tren rong im lang");
		expect(chu(document.body).includes(VI.timeline.empty.allTitle)).toBe(true);
		o.push("rong");

		expect(o.length).toBe(2);
	});

	test("dtg-en: hai thong bao tieng Anh khong con chu Viet", async () => {
		const tb = await moXemCuLoi(
			() => {
				throw new Error("boom-trang-ke");
			},
			EN.timeline.showOlder,
			"en",
		);
		expect(chu(tb)).toContain(EN.timeline.xemCuLoi);
		expect(nutCo(THU_LAI_EN, tb) !== null).toBe(true);
		phai(!coDau.test(chu(tb)), "dtg: thong bao en con chu Viet");
		await dongHet();

		let hong = false;
		datLichSu(() => {
			if (hong) throw new Error("boom-lam-moi");
			return { entries: TRANG_DAU, nextCursor: null } satisfies Trang;
		});
		await mo(
			<LocaleProvider locale="en">
				<Timeline anchor={{ contactId: "ct-1" }} />
				<MoiLai />
			</LocaleProvider>,
		);
		await cho(() => dong().length === 3, "trang dau en");
		hong = true;
		await act(async () => {
			await lamMoi();
		});
		await cho(() => thongBao("lam-moi") !== null, "lam moi en");
		const lm = thongBao("lam-moi") as HTMLElement;
		expect(chu(lm)).toContain(EN.timeline.lamMoiLoi);
		phai(!coDau.test(chu(lm)), "dtg: thong bao en con chu Viet");
	});
});
