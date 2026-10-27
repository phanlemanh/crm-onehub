import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { PHAM_VI_BO, type PhamViBo } from "@crm/validation/okr-tham-so";
import {
	type ElementType,
	isValidElement,
	type ReactNode,
	Suspense,
} from "react";
import { z } from "zod";
import { canhKrOutput } from "../../api/src/okr/okr-canh-kr.contracts";
import {
	type CapNhatGanDayOutput,
	capNhatGanDayOutput,
	type DongCapNhat,
} from "../../api/src/okr/okr-cap-nhat-gan-day.contracts";
import { dienBienOutput } from "../../api/src/okr/okr-xem.contracts";
import {
	bamChuot,
	chiTietTu,
	cho,
	type DauVao,
	datLai,
	docCua,
	dung,
	goChu,
	goiCua,
	KY,
	kho,
	kr,
	LoiTrpc,
	mucTieu,
	nhip,
	qs,
	qsa,
	thaoHet,
} from "./khung-gop-y-dung-cho";

const duong = { hienTai: "/ws/okr/cap-nhat-gan-day" };
mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => duong.hienTai,
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("@/components/crm/stage-change", () => ({
	CloseReasonDialog: () => null,
	DealStageMenu: () => null,
}));
mock.module("@/components/crm/fields/fields-sheet", () => ({
	FieldsSheetHost: () => null,
}));
mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" }));
mock.module("@/lib/session", () => ({ requireSession: async () => null }));
mock.module("@/lib/trpc/hydrate", () => ({
	HydrateClient: ({ children }: { children: unknown }) => children,
}));
mock.module("server-only", () => ({}));
mock.module("@/components/page-transition", () => ({
	PageTransition: ({ children }: { children: ReactNode }) => children,
}));
const toastLoi: string[] = [];
mock.module("sonner", () => ({
	toast: Object.assign(() => {}, {
		error: (chu: string) => {
			toastLoi.push(chu);
		},
		success: () => {},
	}),
}));
mock.module("@/lib/trpc/server", () => ({
	getServerTrpc: () => ({}),
	getServerQueryClient: () => ({}),
	getServerTrpcClient: () => ({}),
}));

const { CapNhatGanDay } = await import(
	"@/app/(app)/[slug]/okr/cap-nhat-gan-day/cap-nhat-gan-day"
);
const { default: CapNhatGanDayPage } = await import(
	"@/app/(app)/[slug]/okr/cap-nhat-gan-day/page"
);
const { PageShellDescription, PageShellTitle } = await import(
	"@/components/page-shell"
);
const { ThanhBenMucTieu } = await import(
	"@/app/(app)/[slug]/okr/thanh-ben-muc-tieu"
);
const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { okrCapNhatGanDayMessages } = await import(
	"@/lib/messages/okr-cap-nhat-gan-day"
);
const { okrVoKhuMessages } = await import("@/lib/messages/okr-vo-khu");

const t = okrCapNhatGanDayMessages("vi");
const tk = okrVoKhuMessages("vi");
const MT = "mt-cng";

type DongGia = DongCapNhat & { pham: PhamViBo[] };

const dong = (
	id: string,
	doi: Partial<DongCapNhat> = {},
	pham: PhamViBo[] = ["tat-ca"],
): DongGia => ({
	checkInId: id,
	luc: "2026-10-20T05:00:00.000Z",
	nguoi: { id: "u1", name: "Người u1" },
	thayCho: null,
	kr: {
		id: `kr-${id}`,
		tieuDe: `KR ${id}`,
		kieu: "tang-toi",
		donVi: "",
		dich: 100,
	},
	mucTieu: { id: MT, tieuDe: "Mục tiêu A" },
	bo: { khoa: "pb:P1", ten: "Phòng P1" },
	giaTri: 40,
	tuTin: "vua",
	ghiChu: `Ghi chú ${id}`,
	moiNhat: true,
	traLoi: [],
	camXuc: [],
	mentionNguoiCapNhat: "u1",
	...doi,
	pham: ["tat-ca", ...pham.filter((p) => p !== "tat-ca")],
});

const NHIEU = Array.from({ length: 25 }, (_, i) =>
	dong(`c${i}`, {}, i < 5 ? ["toi-dan"] : i < 8 ? ["theo-doi"] : []),
);

const vaoCapNhat = z.object({
	phamVi: z.enum(PHAM_VI_BO).default("tat-ca"),
	trang: z.number().default(1),
});

function traCapNhat(ds: DongGia[], vao: DauVao): CapNhatGanDayOutput {
	const { phamVi, trang } = vaoCapNhat.parse(vao ?? {});
	const co = 20;
	const loc = ds.filter((d) => d.pham.includes(phamVi));
	return capNhatGanDayOutput.parse({
		rows: loc
			.slice((trang - 1) * co, trang * co)
			.map(({ pham: _p, ...d }) => d),
		total: loc.length,
		trang,
		coTrang: co,
		facetCounts: {
			phamVi: PHAM_VI_BO.map((value) => ({
				value,
				count: ds.filter((d) => d.pham.includes(value)).length,
			})),
		},
	});
}

function datCapNhat(ds: DongGia[] = NHIEU) {
	kho.rieng.set("okr.capNhatGanDay", (vao) => traCapNhat(ds, vao));
}

const vaoCuoi = () => docCua("okr.capNhatGanDay").at(-1)?.vao;
const chip = (p: PhamViBo) => qs<HTMLButtonElement>(`[data-pham-vi="${p}"]`);
const dongTin = () => qsa("[data-dong-tin]");

function timTrongCay(
	nut: ReactNode,
	kieu: ElementType,
	trongSuspense: boolean,
): { chu: ReactNode; trongSuspense: boolean }[] {
	if (Array.isArray(nut))
		return nut.flatMap((n) => timTrongCay(n, kieu, trongSuspense));
	if (!isValidElement<{ children?: ReactNode }>(nut)) return [];
	if (nut.type === kieu) return [{ chu: nut.props.children, trongSuspense }];
	return timTrongCay(
		nut.props.children,
		kieu,
		trongSuspense || nut.type === Suspense,
	);
}

beforeEach(() => {
	datLai();
	duong.hienTai = "/ws/okr/cap-nhat-gan-day";
});

afterEach(thaoHet);

describe("cng-thanh-ben", () => {
	test("cng-thanh-ben: bảy mục, Cập nhật gần đây ngay dưới Của tôi, giữ kyOkr, một mục sáng; trang dựng tiêu đề và một câu mô tả", async () => {
		const MA_TRAN = [
			{
				duong: "/ws/okr",
				tham: "",
				href: "/ws/okr/cap-nhat-gan-day",
				sang: "/ws/okr",
			},
			{
				duong: "/ws/okr/cap-nhat-gan-day",
				tham: "",
				href: "/ws/okr/cap-nhat-gan-day",
				sang: "/ws/okr/cap-nhat-gan-day",
			},
			{
				duong: "/ws/okr/cap-nhat-gan-day",
				tham: "?kyOkr=c2",
				href: "/ws/okr/cap-nhat-gan-day?kyOkr=c2",
				sang: "/ws/okr/cap-nhat-gan-day?kyOkr=c2",
			},
			{
				duong: "/ws/okr/moi-kr",
				tham: "",
				href: "/ws/okr/cap-nhat-gan-day",
				sang: "/ws/okr/moi-kr",
			},
		];
		const thay: object[] = [];
		for (const ca of MA_TRAN) {
			datLai();
			duong.hienTai = ca.duong;
			await dung(<ThanhBenMucTieu />, ca.tham);
			await cho(
				() =>
					qsa("aside[data-slot=area-sidebar] [data-slot=nav-item]").length > 0,
				`thanh ben ${ca.duong}`,
			);
			const muc = qsa("aside[data-slot=area-sidebar] [data-slot=nav-item]");
			const sang = muc.filter((a) => a.getAttribute("aria-current") === "page");
			thay.push({
				so: muc.length,
				dau: muc.slice(0, 2).map((a) => a.textContent?.trim()),
				href: muc[1]?.getAttribute("href"),
				sang: sang.map((a) => a.getAttribute("href")),
			});
			await thaoHet();
		}
		expect(thay).toEqual(
			MA_TRAN.map((ca) => ({
				so: 7,
				dau: [tk.muc.cuaToi, tk.muc.capNhatGanDay],
				href: ca.href,
				sang: [ca.sang],
			})),
		);
		const cay = await CapNhatGanDayPage({ searchParams: Promise.resolve({}) });
		expect(timTrongCay(cay, PageShellTitle, false)).toEqual([
			{ chu: t.tieuDe, trongSuspense: false },
		]);
		expect(timTrongCay(cay, PageShellDescription, false)).toEqual([
			{ chu: t.moTa, trongSuspense: false },
		]);
	});
});

describe("cng-duong-dan", () => {
	test("cng-duong-dan: chip và trang trên đường dẫn, đổi chip về trang 1, đổi chu kỳ giữ chip, giá trị hỏng bị bỏ qua", async () => {
		datCapNhat();
		const san = await dung(
			<CapNhatGanDay />,
			"?phamViBo=toi-dan&trangCapNhat=2",
		);
		await cho(() => chip("toi-dan") !== null, "chip");
		expect(vaoCuoi()).toEqual({ cycleId: "q4", phamVi: "toi-dan", trang: 2 });
		expect(chip("toi-dan")?.getAttribute("data-state")).toBe("on");
		const theoDoi = chip("theo-doi");
		if (!theoDoi) throw new Error("khong co chip theo-doi");
		await bamChuot(theoDoi);
		await nhip(5);
		expect({
			pham: san.url().get("phamViBo"),
			trang: san.url().get("trangCapNhat"),
		}).toEqual({ pham: "theo-doi", trang: null });
		await thaoHet();

		datLai();
		datCapNhat();
		const sang = await dung(<CapNhatGanDay />, "");
		await cho(() => dongTin().length > 0, "dong tin");
		expect(vaoCuoi()).toEqual({ cycleId: "q4", phamVi: "tat-ca", trang: 1 });
		expect(chip("tat-ca")?.getAttribute("data-state")).toBe("on");
		const tiep = qsa("button").find((b) => b.textContent?.includes("Tiếp"));
		if (!tiep) throw new Error("khong co nut Tiep");
		await bamChuot(tiep);
		await nhip(5);
		expect(sang.url().get("trangCapNhat")).toBe("2");
		await thaoHet();

		datLai();
		datCapNhat();
		const q3 = { ...KY.cycles[0], id: "q3", name: "Quý 3/2026" };
		kho.rieng.set("okr.cycles", () => ({
			cycles: [...KY.cycles, q3],
			currentId: "q4",
		}));
		const doiKy = await dung(
			<>
				<ThanhBenMucTieu />
				<CapNhatGanDay />
			</>,
			"?kyOkr=q4&phamViBo=toi-dan&trangCapNhat=2",
		);
		await cho(() => chip("toi-dan") !== null, "chip truoc doi ky");
		const oKy = qs("[data-chon-chu-ky]");
		if (!oKy) throw new Error("khong thay o chu ky");
		await bamChuot(oKy);
		await cho(
			() =>
				qsa('[role="option"]').some((o) =>
					o.textContent?.includes("Quý 3/2026"),
				),
			"o chu ky mo",
		);
		const mucQ3 = qsa('[role="option"]').find((o) =>
			o.textContent?.includes("Quý 3/2026"),
		);
		if (!mucQ3) throw new Error("khong co Quý 3/2026");
		await bamChuot(mucQ3);
		await nhip(20);
		expect({
			ky: doiKy.url().get("kyOkr"),
			pham: doiKy.url().get("phamViBo"),
			trang: doiKy.url().get("trangCapNhat"),
		}).toEqual({ ky: "q3", pham: "toi-dan", trang: null });
		await thaoHet();

		datLai();
		datCapNhat();
		await dung(<CapNhatGanDay />, "?phamViBo=xau&trangCapNhat=abc");
		await cho(() => dongTin().length > 0, "dong tin khi tham so hong");
		expect(vaoCuoi()).toEqual({ cycleId: "q4", phamVi: "tat-ca", trang: 1 });
	});
});

describe("cng-tra-loi-man", () => {
	const MOI = dong("moi", { ghiChu: "" });
	const CU = dong("cu", {
		moiNhat: false,
		mentionNguoiCapNhat: null,
		kr: MOI.kr,
		luc: "2026-10-13T05:00:00.000Z",
	});

	test("cng-tra-loi-man: mọi lần có Trả lời (D5), gửi đi qua okr.addComment nhắc người cập nhật, làm mới, lỗi giữ chữ", async () => {
		datCapNhat([MOI, CU]);
		await dung(<CapNhatGanDay />, "");
		await cho(() => dongTin().length === 2, "hai dong");
		const moi = qs('[data-dong-tin="moi"]');
		const cu = qs('[data-dong-tin="cu"]');
		expect({
			nutMoi: moi?.querySelectorAll("[data-mo-tra-loi]").length,
			nutCu: cu?.querySelectorAll("[data-mo-tra-loi]").length,
			coMoiHon: cu?.querySelector("[data-co-moi-hon]")?.textContent,
			ghiChuRong: moi?.querySelectorAll("[data-dong-ghi-chu]").length,
		}).toEqual({
			nutMoi: 1,
			nutCu: 1,
			coMoiHon: t.coMoiHonNhan,
			ghiChuRong: 0,
		});
		const mo = moi?.querySelector("[data-mo-tra-loi]");
		if (!mo) throw new Error("khong co nut Tra loi");
		expect(mo.textContent).toBe(t.traLoi);
		await bamChuot(mo);
		const o = qs<HTMLTextAreaElement>("[data-o-tra-loi] textarea");
		if (!o) throw new Error("khong co o tra loi");
		expect(o.getAttribute("aria-label")).toBe(t.oTraLoi("Người u1"));
		const gui = qs<HTMLButtonElement>("[data-gui-tra-loi]");
		expect(gui?.disabled).toBe(true);
		await goChu(o, "abc");
		expect(gui?.disabled).toBe(false);
		if (gui) await bamChuot(gui);
		await cho(() => goiCua("okr.addComment").length === 1, "da gui");
		expect(goiCua("okr.addComment")[0]?.vao).toEqual({
			objectiveId: MT,
			keyResultId: MOI.kr.id,
			checkInId: "moi",
			body: "abc",
			mentionUserIds: ["u1"],
		});
		await cho(() => qs("[data-o-tra-loi]") === null, "o dong sau khi gui");
		expect(kho.daLamMoi).toContain(MT);
	});

	test("cng-tra-loi-man: không nhắc khi máy chủ không trả người được nhắc; lỗi hiện dưới ô và chữ còn nguyên", async () => {
		datCapNhat([dong("tu", { mentionNguoiCapNhat: null })]);
		kho.ghiRieng.set("okr.addComment", async () => {
			const loi = new LoiTrpc("BAD_REQUEST", "Chu kỳ đã ẩn, không ghi được.");
			Object.assign(loi.data, { httpStatus: 400 });
			throw loi;
		});
		await dung(<CapNhatGanDay />, "");
		await cho(() => dongTin().length === 1, "mot dong");
		const mo = qs("[data-mo-tra-loi]");
		if (!mo) throw new Error("khong co nut Tra loi");
		await bamChuot(mo);
		const o = qs<HTMLTextAreaElement>("[data-o-tra-loi] textarea");
		if (!o) throw new Error("khong co o");
		await goChu(o, "abc");
		const gui = qs("[data-gui-tra-loi]");
		if (gui) await bamChuot(gui);
		await cho(() => qs("[data-loi-tra-loi]") !== null, "cau loi");
		expect({
			vao: goiCua("okr.addComment")[0]?.vao,
			loi: qs("[data-loi-tra-loi]")?.textContent,
			giu: qs<HTMLTextAreaElement>("[data-o-tra-loi] textarea")?.value,
		}).toEqual({
			vao: {
				objectiveId: MT,
				keyResultId: "kr-tu",
				checkInId: "tu",
				body: "abc",
				mentionUserIds: [],
			},
			loi: t.chuaGui("Chu kỳ đã ẩn, không ghi được."),
			giu: "abc",
		});
	});
});

describe("cng-mo-kr", () => {
	test("cng-mo-kr: bấm tên KR hay vùng trống mở chi tiết KR trên trang; bấm trong ô trả lời không mở", async () => {
		const k7 = dong(
			"k7",
			{
				kr: {
					id: "k7",
					tieuDe: "KR k7",
					kieu: "tang-toi",
					donVi: "",
					dich: 100,
				},
			},
			["toi-dan"],
		);
		datCapNhat([k7]);
		const krK7 = kr("k7", MT, { title: "KR k7" });
		kho.chiTiet = () => chiTietTu(mucTieu(MT, [krK7], { canEdit: true }));
		kho.rieng.set("okr.canhKr", (vao) => {
			if (vao?.keyResultId !== "k7") throw new LoiTrpc("NOT_FOUND", "khong");
			return canhKrOutput.parse({
				kr: {
					id: "k7",
					title: "KR k7",
					kind: "tang-toi",
					objectiveId: MT,
					ownerName: "Người u1",
					xong: false,
				},
				dong: [],
				bangChung: [],
				quyen: { suaDuoc: false, ganDuoc: false },
				khoa: false,
				choDuyet: false,
			});
		});
		kho.rieng.set("okr.dienBien", () =>
			dienBienOutput.parse({
				kieu: "tang-toi",
				tieuDe: "KR k7",
				khoi: 0,
				dich: 100,
				donVi: "",
				coCapNhat: false,
				tuanDau: null,
				diem: [],
			}),
		);
		const san = await dung(
			<>
				<CapNhatGanDay />
				<RecordSheetHost />
			</>,
			"?phamViBo=toi-dan",
		);
		await cho(() => dongTin().length === 1, "mot dong");
		const dongNgan = async () => {
			const hop = qs("[role=dialog]");
			const nutDong = [...(hop?.querySelectorAll("button") ?? [])].find(
				(b) => b.getAttribute("data-slot") === "sheet-close",
			);
			if (nutDong) await bamChuot(nutDong);
			else
				document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
			await cho(() => qs("[data-than-ngan-kr]") === null, "ngan dong");
		};
		const ten = qs("[data-mo-kr=k7]");
		if (!ten) throw new Error("khong co ten KR");
		await bamChuot(ten);
		await cho(() => qs("[data-than-ngan-kr]") !== null, "ngan mo tu ten KR");
		expect({
			record: san.url().get("record")?.split(",").at(-1),
			tieuDe: qs("[role=dialog]")?.textContent?.includes("KR k7"),
		}).toEqual({ record: "kr:k7", tieuDe: true });
		await dongNgan();
		const trong = qs("[data-dong-muc-tieu]");
		if (!trong) throw new Error("khong co vung trong");
		await bamChuot(trong);
		await cho(
			() => qs("[data-than-ngan-kr]") !== null,
			"ngan mo tu vung trong",
		);
		await dongNgan();
		expect(san.url().get("phamViBo")).toBe("toi-dan");
		const mo = qs("[data-mo-tra-loi]");
		if (!mo) throw new Error("khong co nut Tra loi");
		await bamChuot(mo);
		const o = qs("[data-o-tra-loi] textarea");
		if (!o) throw new Error("khong co o tra loi");
		await bamChuot(o);
		await goChu(o, "abc");
		const gui = qs("[data-gui-tra-loi]");
		if (!gui) throw new Error("khong co nut Gui");
		await bamChuot(gui);
		await cho(() => goiCua("okr.addComment").length === 1, "da gui tra loi");
		await nhip(5);
		expect({
			ngan: qs("[data-than-ngan-kr]"),
			record: san.url().get("record"),
		}).toEqual({ ngan: null, record: null });
	});
});

describe("cng-trang-thai", () => {
	test("cng-trang-thai: sáu trạng thái hiện đúng mã, tiêu đề luôn ở page.tsx", async () => {
		const MA_TRAN: [string, () => void, string][] = [
			[
				"cho",
				() => kho.rieng.set("okr.capNhatGanDay", () => new Promise(() => {})),
				"",
			],
			[
				"loi",
				() =>
					kho.rieng.set("okr.capNhatGanDay", () => {
						throw new LoiTrpc("INTERNAL_SERVER_ERROR", "hong");
					}),
				"",
			],
			[
				"chuachuky",
				() => {
					kho.rieng.set("okr.cycles", () => ({ cycles: [], currentId: null }));
					datCapNhat();
				},
				"",
			],
			["rong", () => datCapNhat([]), ""],
			["rongloc", () => datCapNhat([dong("chi-tat-ca")]), "?phamViBo=theo-doi"],
			["codulieu", () => datCapNhat(), ""],
		];
		const thay: string[] = [];
		for (const [ten, chuanBi, thamSo] of MA_TRAN) {
			datLai();
			chuanBi();
			const san = await dung(<CapNhatGanDay />, thamSo);
			await cho(
				() => qs(`[data-trang-thai=ST-cng-${ten}]`) !== null,
				`trang thai ${ten}`,
			);
			thay.push(ten);
			if (ten === "loi") {
				const truoc = docCua("okr.capNhatGanDay").length;
				const thuLai = qsa("button").find((b) =>
					b.textContent?.includes("Thử lại"),
				);
				if (!thuLai) throw new Error("loi khong co nut Thu lai");
				await bamChuot(thuLai);
				await nhip(5);
				expect(docCua("okr.capNhatGanDay").length).toBeGreaterThan(truoc);
			}
			if (ten === "rong") expect(qs("[data-ve-tat-ca]")).toBeNull();
			if (ten === "rongloc") {
				const ve = qs("[data-ve-tat-ca]");
				if (!ve) throw new Error("rongloc khong co nut Xem tat ca");
				expect(ve.textContent).toBe(t.rongLoc.nut);
				await bamChuot(ve);
				await nhip(5);
				expect(san.url().get("phamViBo")).toBeNull();
			}
			await thaoHet();
		}
		expect(thay).toEqual([
			"cho",
			"loi",
			"chuachuky",
			"rong",
			"rongloc",
			"codulieu",
		]);
		const cay = await CapNhatGanDayPage({ searchParams: Promise.resolve({}) });
		expect(timTrongCay(cay, PageShellTitle, false)).toEqual([
			{ chu: t.tieuDe, trongSuspense: false },
		]);
	});
});

describe("cx-tra-loi-man", () => {
	const MOI = dong("moi", {
		traLoi: [
			{
				id: "tl-moi",
				nguoi: { id: "u2", name: "Người u2" },
				noiDung: "Trả lời lần mới",
				luc: "2026-10-20T06:00:00.000Z",
			},
		],
	});
	const CU = dong("cu", {
		moiNhat: false,
		mentionNguoiCapNhat: "u3",
		kr: MOI.kr,
		luc: "2026-10-13T05:00:00.000Z",
		traLoi: [
			{
				id: "tl-cu",
				nguoi: { id: "u2", name: "Người u2" },
				noiDung: "Trả lời lần cũ",
				luc: "2026-10-14T06:00:00.000Z",
			},
		],
	});

	test("cx-tra-loi-man: mọi dòng có Trả lời và đúng trả lời của mình; gửi dưới dòng cũ mang checkInId", async () => {
		datCapNhat([MOI, CU]);
		await dung(<CapNhatGanDay />, "");
		await cho(() => dongTin().length === 2, "hai dong");
		const moi = qs('[data-dong-tin="moi"]');
		const cu = qs('[data-dong-tin="cu"]');
		const ids = (d: Element | null) =>
			[...(d?.querySelectorAll("[data-tra-loi]") ?? [])].map((x) =>
				x.getAttribute("data-tra-loi"),
			);
		expect(
			cu?.querySelectorAll("[data-mo-tra-loi]").length,
			"dong cu thieu nut Tra loi",
		).toBe(1);
		expect(moi?.querySelector("[data-mo-tra-loi]")?.textContent).toBe(t.traLoi);
		expect({ moi: ids(moi), cu: ids(cu) }).toEqual({
			moi: ["tl-moi"],
			cu: ["tl-cu"],
		});
		expect(cu?.querySelector("[data-co-moi-hon]")?.textContent).toBe(
			t.coMoiHonNhan,
		);
		const mo = cu?.querySelector("[data-mo-tra-loi]");
		if (!mo) throw new Error("khong co nut Tra loi dong cu");
		await bamChuot(mo);
		const o = qs<HTMLTextAreaElement>(
			'[data-dong-tin="cu"] [data-o-tra-loi] textarea',
		);
		if (!o) throw new Error("khong co o tra loi");
		await goChu(o, "xyz");
		const gui = qs<HTMLButtonElement>(
			'[data-dong-tin="cu"] [data-gui-tra-loi]',
		);
		if (gui) await bamChuot(gui);
		await cho(() => goiCua("okr.addComment").length === 1, "da gui");
		expect(goiCua("okr.addComment")[0]?.vao, "input thieu checkInId").toEqual({
			objectiveId: MT,
			keyResultId: MOI.kr.id,
			checkInId: "cu",
			body: "xyz",
			mentionUserIds: ["u3"],
		});
	});
});

describe("cx-lac-quan", () => {
	type Tom = DongCapNhat["camXuc"];
	const nguoi = (n: number) =>
		Array.from({ length: n }, (_, i) => ({ id: `n${i}`, name: `Người ${i}` }));

	function treo() {
		let giai: (v: Tom) => void = () => {};
		let tuChoi: (e: Error) => void = () => {};
		kho.ghiRieng.set(
			"okr.thaCamXuc",
			() =>
				new Promise((ok, loi) => {
					giai = (v) => ok(v as never);
					tuChoi = loi;
				}),
		);
		return { giai: (v: Tom) => giai(v), tuChoi: (e: Error) => tuChoi(e) };
	}

	const chip = (loai: string) =>
		qs<HTMLButtonElement>(`[data-dong-tin="cx"] [data-cam-xuc="${loai}"]`);
	const trangThai = (loai: string) => {
		const c = chip(loai);
		return c
			? {
					bam: c.getAttribute("aria-pressed"),
					so: c.textContent?.replace(/[^0-9]/g, ""),
					tat: c.disabled,
				}
			: null;
	};

	async function dungVoi(camXuc: Tom) {
		toastLoi.length = 0;
		datCapNhat([dong("cx", { camXuc })]);
		await dung(<CapNhatGanDay />, "");
		await cho(() => dongTin().length === 1, "mot dong");
	}

	test("cx-lac-quan: cham chip doi ngay, khoa khi dang gui, may chu tra thi bat lai", async () => {
		await dungVoi([{ loai: "co-len", so: 2, cuaToi: false, nguoi: nguoi(2) }]);
		const t1 = treo();
		const c = chip("co-len");
		if (!c) throw new Error("khong co chip");
		await bamChuot(c);
		await cho(() => trangThai("co-len")?.so === "3", "so lac quan");
		expect(trangThai("co-len")).toEqual({ bam: "true", so: "3", tat: true });
		t1.giai([{ loai: "co-len", so: 3, cuaToi: true, nguoi: nguoi(3) }]);
		await cho(() => trangThai("co-len")?.tat === false, "bat lai");
		expect(trangThai("co-len")).toEqual({ bam: "true", so: "3", tat: false });
		expect(goiCua("okr.thaCamXuc")[0]?.vao).toEqual({
			checkInId: "cx",
			loai: "co-len",
		});
	});

	test("cx-lac-quan: may chu tu choi thi chip ve dung anh chup truoc va co toast", async () => {
		await dungVoi([{ loai: "co-len", so: 2, cuaToi: false, nguoi: nguoi(2) }]);
		const t1 = treo();
		const c = chip("co-len");
		if (c) await bamChuot(c);
		await cho(() => trangThai("co-len")?.so === "3", "so lac quan");
		t1.tuChoi(
			new LoiTrpc("FORBIDDEN", "Chu kỳ này đã ẩn — không ghi được nữa."),
		);
		await cho(() => trangThai("co-len")?.tat === false, "het gui");
		expect(trangThai("co-len"), "so 3 != 2").toEqual({
			bam: "false",
			so: "2",
			tat: false,
		});
		expect(toastLoi, "thieu toast").toEqual([
			t.chuaTha("Chu kỳ này đã ẩn — không ghi được nữa."),
		]);
	});

	test("cx-lac-quan: go chip cuoi cung thi chip mat, loi thi chip ve lai", async () => {
		await dungVoi([{ loai: "dong-y", so: 1, cuaToi: true, nguoi: nguoi(1) }]);
		const t1 = treo();
		const c = chip("dong-y");
		if (c) await bamChuot(c);
		await cho(() => chip("dong-y") === null, "chip mat");
		t1.tuChoi(new LoiTrpc("BAD_REQUEST", "Mất mạng"));
		await cho(() => chip("dong-y") !== null, "chip ve lai");
		expect(trangThai("dong-y")).toEqual({ bam: "true", so: "1", tat: false });
	});
});
