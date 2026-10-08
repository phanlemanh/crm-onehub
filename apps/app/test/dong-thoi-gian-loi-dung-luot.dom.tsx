import {
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
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

const { Timeline } = await import("@/components/crm/timeline/timeline");
const { crmMessages } = await import("@/lib/messages/crm");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");

const VI = crmMessages("vi");
const THU_LAI = uiMessages("vi").karaKhung.thuLai;

type Trang = { entries: TimelineEntryData[]; nextCursor: string | null };
type Hoan = {
	p: Promise<Trang>;
	giai: (v: Trang) => void;
	tuChoi: (e: Error) => void;
};

beforeEach(() => {
	setSystemTime();
});
afterEach(dongHet);

function phai(dieu: boolean, thongDiep: string) {
	if (!dieu) throw new Error(thongDiep);
}

function hoan(): Hoan {
	let giai: (v: Trang) => void = () => {};
	let tuChoi: (e: Error) => void = () => {};
	const p = new Promise<Trang>((a, b) => {
		giai = a;
		tuChoi = b;
	});
	return { p, giai, tuChoi };
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
const GHI_CHU = [hoatDong("n1", 15), hoatDong("n2", 14)];

const lichSu = (vao: DauVao) => vao?.filter !== "upcoming";
const goiLichSu = () =>
	goiCua("activities.timeline").filter((g) => lichSu(g.dauVao));
const goiCursor = (c: string) =>
	goiLichSu().filter((g) => g.dauVao?.cursor === c).length;
const goiKhongCursor = () =>
	goiLichSu().filter((g) => g.dauVao?.cursor === undefined).length;

const thongBao = (loai: "xem-cu" | "lam-moi") =>
	document.querySelector<HTMLElement>(`[data-dtg-loi="${loai}"]`);
const dong = () => [...document.querySelectorAll("[data-slot=timeline] > li")];

function demChen(sel: string) {
	let n = 0;
	const ob = new MutationObserver((ds) => {
		for (const d of ds)
			for (const nd of d.addedNodes)
				if (
					nd instanceof Element &&
					(nd.matches(sel) || nd.querySelector(sel) !== null)
				)
					n += 1;
	});
	ob.observe(document.body, { childList: true, subtree: true });
	return {
		dem: () => n,
		dung: () => ob.disconnect(),
	};
}

type CachDoc = {
	dau: () => Trang | Promise<Trang>;
	c1: () => Trang | Promise<Trang>;
	ghiChu?: () => Trang | Promise<Trang>;
};

function datLichSu(cach: CachDoc) {
	dat("activities.timelineCounts", () => ({}));
	dat("activities.timeline", (vao) => {
		if (!lichSu(vao)) return { entries: [], nextCursor: null };
		if (vao?.filter === "notes" && cach.ghiChu) return cach.ghiChu();
		if (vao?.cursor === "c1") return cach.c1();
		return cach.dau();
	});
}

let lamMoi: () => Promise<void> = async () => {};
let datStale: (ms: number) => void = () => {};

function MoiLai() {
	const qc = useQueryClient();
	lamMoi = () => qc.invalidateQueries();
	datStale = (ms) =>
		qc.setDefaultOptions({
			queries: { ...qc.getDefaultOptions().queries, staleTime: ms },
		});
	return null;
}

async function moTimeline() {
	await mo(
		<>
			<Timeline anchor={{ contactId: "ct-1" }} />
			<MoiLai />
		</>,
	);
	await cho(() => dong().length === 3, "trang dau");
}

async function goiLamMoi() {
	await act(async () => {
		await lamMoi();
	});
}

async function gayLoiLamMoi(cach: CachDoc) {
	await moTimeline();
	cach.dau = () => {
		throw new Error("boom-lam-moi");
	};
	await goiLamMoi();
	await cho(() => thongBao("lam-moi") !== null, "thong bao lam moi");
}

async function gayLoiXemCu() {
	await moTimeline();
	await bam(nut(VI.timeline.showOlder));
	await cho(() => thongBao("xem-cu") !== null, "thong bao xem cu");
}

const truocLuot = {
	dau: (): Trang => ({ entries: TRANG_DAU, nextCursor: "c1" }),
};

describe("dong-thoi-gian-loi-dung-luot", () => {
	test("dtl-lam-moi-roi-xem-cu: khong bao xem cu khi dang tai, giu canh bao lam moi", async () => {
		const o: string[] = [];
		for (const ketCuc of ["dang-tai", "duoc", "loi"] as const) {
			const h = hoan();
			const cach: CachDoc = { dau: truocLuot.dau, c1: () => h.p };
			datLichSu(cach);
			await gayLoiLamMoi(cach);
			const c1Truoc = goiCursor("c1");
			const dem = demChen('[data-dtg-loi="xem-cu"]');
			await bam(nut(VI.timeline.showOlder));
			await cho(() => goiCursor("c1") === c1Truoc + 1, "goi trang c1");
			await nhip(10);
			phai(
				thongBao("xem-cu") === null,
				"dtl: thong bao xem cu hien khi dang tai",
			);
			expect(thongBao("lam-moi") !== null).toBe(true);
			const nutXemCu = nutCo(VI.timeline.showOlder);
			expect(nutXemCu !== null).toBe(true);
			expect(nutXemCu?.disabled).toBe(true);
			if (nutXemCu) await bam(nutXemCu);
			expect(goiCursor("c1")).toBe(c1Truoc + 1);
			dem.dung();
			phai(dem.dem() === 0, "dtl: thong bao xem cu hien khi dang tai");
			if (ketCuc === "duoc") {
				await act(async () => {
					h.giai({ entries: TRANG_HAI, nextCursor: null });
				});
				await cho(() => dong().length === 5, "trang ke noi vao");
				await nhip(10);
				phai(
					thongBao("lam-moi") !== null,
					"dtl: canh bao lam moi tat sau xem cu",
				);
				expect(thongBao("xem-cu") === null).toBe(true);
			}
			if (ketCuc === "loi") {
				await act(async () => {
					h.tuChoi(new Error("boom-trang-ke"));
				});
				await cho(() => thongBao("xem-cu") !== null, "xem cu loi");
				expect(thongBao("lam-moi") !== null).toBe(true);
				expect(dong().length).toBe(3);
			}
			o.push(ketCuc);
			await dongHet();
		}
		expect(o.length).toBe(3);
	});

	test("dtl-xem-cu-roi-lam-moi: khong bao lam moi khi dang chay, giu xem cu", async () => {
		const o: string[] = [];
		for (const ketCuc of ["dang-tai", "duoc", "loi"] as const) {
			const h = hoan();
			const cach: CachDoc = {
				dau: truocLuot.dau,
				c1: () => {
					throw new Error("boom-trang-ke");
				},
			};
			datLichSu(cach);
			await gayLoiXemCu();
			cach.dau = () => h.p;
			const truoc = goiKhongCursor();
			const dem = demChen('[data-dtg-loi="lam-moi"]');
			await act(async () => {
				void lamMoi();
			});
			await cho(() => goiKhongCursor() > truoc, "goi lam moi");
			await nhip(10);
			phai(
				thongBao("lam-moi") === null,
				"dtl: canh bao lam moi hien khi dang tai",
			);
			expect(thongBao("xem-cu") !== null).toBe(true);
			dem.dung();
			phai(dem.dem() === 0, "dtl: canh bao lam moi hien khi dang tai");
			if (ketCuc === "duoc") {
				await act(async () => {
					h.giai({ entries: TRANG_DAU, nextCursor: "c1" });
				});
				await cho(
					() => thongBao("xem-cu") === null && thongBao("lam-moi") === null,
					"het ca hai",
				);
				expect(nutCo(VI.timeline.showOlder) !== null).toBe(true);
			}
			if (ketCuc === "loi") {
				await act(async () => {
					h.tuChoi(new Error("boom-lam-moi"));
				});
				await cho(() => thongBao("lam-moi") !== null, "lam moi loi");
				expect(thongBao("xem-cu") !== null).toBe(true);
			}
			o.push(ketCuc);
			await dongHet();
		}
		expect(o.length).toBe(3);
	});

	test("dtl-thu-lai-lam-moi: chi luot lam moi thanh cong moi tat canh bao", async () => {
		const o: string[] = [];
		const h = hoan();
		const cach: CachDoc = { dau: truocLuot.dau, c1: () => h.p };
		datLichSu(cach);
		await gayLoiLamMoi(cach);
		const treo = hoan();
		cach.dau = () => treo.p;
		const truoc = goiKhongCursor();
		await bam(nut(THU_LAI, thongBao("lam-moi") as HTMLElement));
		await cho(
			() =>
				nutCo(THU_LAI, thongBao("lam-moi") ?? document.body)?.disabled === true,
			"nut lam moi tat",
		);
		const nutTat = nut(THU_LAI, thongBao("lam-moi") as HTMLElement);
		await bam(nutTat);
		await nhip(5);
		expect(goiKhongCursor() - truoc).toBe(1);
		expect(thongBao("lam-moi") !== null).toBe(true);
		await act(async () => {
			treo.giai({ entries: TRANG_DAU, nextCursor: "c1" });
		});
		await cho(() => thongBao("lam-moi") === null, "lam moi thanh cong");
		o.push("thu-lai");
		await dongHet();

		const cach2: CachDoc = {
			dau: truocLuot.dau,
			c1: () => ({ entries: TRANG_HAI, nextCursor: null }),
		};
		datLichSu(cach2);
		await gayLoiLamMoi(cach2);
		await bam(nut(VI.timeline.showOlder));
		await cho(() => dong().length === 5, "xem cu thanh cong");
		await nhip(10);
		phai(thongBao("lam-moi") !== null, "dtl: canh bao lam moi tat sau xem cu");
		o.push("xem-cu-khong-tat");
		expect(o.length).toBe(2);
	});

	test("dtl-doi-tab: thong bao khong theo sang tab moi, quay lai tab loi tai lai", async () => {
		const o: string[] = [];
		const nutTab = (nhan: string) =>
			[...document.querySelectorAll<HTMLElement>("button")]
				.filter((b) => (b.textContent ?? "").trim().startsWith(nhan))
				.at(-1) ?? null;

		const cach: CachDoc = {
			dau: truocLuot.dau,
			c1: () => {
				throw new Error("boom-trang-ke");
			},
			ghiChu: () => ({ entries: GHI_CHU, nextCursor: null }),
		};
		datLichSu(cach);
		await gayLoiXemCu();
		await bam(nutTab(VI.timeline.tabs.notes) as HTMLElement);
		await cho(() => dong().length === 2, "tab ghi chu");
		await nhip(10);
		phai(
			document.querySelector("[data-dtg-loi]") === null,
			"dtl: thong bao theo sang tab moi",
		);
		o.push("sang-tab");

		cach.ghiChu = () => {
			throw new Error("boom-ghi-chu");
		};
		await goiLamMoi();
		await cho(() => thongBao("lam-moi") !== null, "lam moi loi o ghi chu");
		o.push("doi-chung");
		await dongHet();

		const treo = hoan();
		const cach2: CachDoc = {
			dau: truocLuot.dau,
			c1: () => {
				throw new Error("boom-trang-ke");
			},
			ghiChu: () => ({ entries: GHI_CHU, nextCursor: null }),
		};
		datLichSu(cach2);
		await moTimeline();
		await act(async () => datStale(30_000));
		await bam(nut(VI.timeline.showOlder));
		await cho(() => thongBao("xem-cu") !== null, "xem cu loi");
		await bam(nutTab(VI.timeline.tabs.notes) as HTMLElement);
		await cho(() => dong().length === 2, "sang ghi chu");
		cach2.dau = () => treo.p;
		const truoc = goiKhongCursor();
		const dem = demChen("[data-dtg-loi]");
		await bam(nutTab(VI.timeline.tabs.all) as HTMLElement);
		await cho(
			() => goiKhongCursor() === truoc + 1,
			"quay lai tai lai trang dau",
		);
		await nhip(10);
		dem.dung();
		phai(
			dem.dem() === 0 && document.querySelector("[data-dtg-loi]") === null,
			"dtl: thong bao theo sang tab moi",
		);
		await act(async () => {
			treo.giai({ entries: TRANG_DAU, nextCursor: "c1" });
		});
		await cho(() => dong().length === 3, "quay lai tat ca");
		await nhip(10);
		expect(document.querySelector("[data-dtg-loi]") === null).toBe(true);
		expect(nutCo(VI.timeline.showOlder) !== null).toBe(true);
		o.push("quay-lai");
		expect(o.length).toBe(3);
	});
});
