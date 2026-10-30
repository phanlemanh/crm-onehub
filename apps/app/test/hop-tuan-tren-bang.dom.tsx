import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { act, type ReactNode } from "react";
import type { ObjectiveOutput } from "../../api/src/okr/okr.contracts";
import { canhKrOutput } from "../../api/src/okr/okr-canh-kr.contracts";
import {
	dienBienOutput,
	hopTuanOutput,
	lichSuKrOutput,
} from "../../api/src/okr/okr-xem.contracts";
import {
	chiTietTu,
	cho,
	datLai,
	docCua,
	dung,
	goiCua,
	kho,
	kr,
	LoiTrpc,
	mucTieu,
	nguoiDung,
	nhip,
	qs,
	qsa,
	type San,
	thaoHet,
} from "./khung-gop-y-dung-cho";

type HopTuanOutput = ReturnType<typeof hopTuanOutput.parse>;
type DongVao = Partial<HopTuanOutput["dangBan"][number]> & { id: string };

const dieuHuong = { soLan: 0 };

mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {
			dieuHuong.soLan += 1;
		},
		replace: () => {
			dieuHuong.soLan += 1;
		},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/okr/bo-okr",
	useSearchParams: () => new URLSearchParams(),
}));
mock.module("@/components/crm/stage-change", () => ({
	CloseReasonDialog: () => null,
	DealStageMenu: () => null,
}));
mock.module("@/components/crm/fields/fields-sheet", () => ({
	FieldsSheetHost: () => null,
}));

const { HopTuan } = await import("@/app/(app)/[slug]/okr/hop-tuan");
const { BangDonVi } = await import("@/app/(app)/[slug]/okr/theo-don-vi/bang");
const { useRouter } = await import("next/navigation");
const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { chuMucDoi } = await import("@/app/(app)/[slug]/okr/hop-tuan/muc-doi");
const { okrToanCanhMessages } = await import("@/lib/messages/okr-toan-canh");
const { okrCanhKrMessages } = await import("@/lib/messages/okr-canh-kr");
const { okrMessages } = await import("@/lib/messages/okr");

const mt = okrToanCanhMessages("vi").hopTuan;
const mk = okrCanhKrMessages("vi").khung;
const mo = okrMessages("vi");

const DON = { loai: "bp", id: "bp-1" } as const;
const TRE_HOP_TUAN_MS = 120;
const KHOA_NGUON = "hop~q4~bp:bp-1";

function dongHop(v: DongVao) {
	return {
		keyResultId: v.id,
		objectiveId: v.objectiveId ?? "mt-1",
		tieuDe: v.tieuDe ?? `KR ${v.id}`,
		mucTieu: "Mục tiêu chung",
		chuTen: "Nguyễn Thị Lan",
		progress: v.progress ?? 40,
		expected: 50,
		laMoc: v.laMoc ?? false,
		tuTin: "vua",
		ghiChu: v.ghiChu === undefined ? `ghi chu ${v.id}` : v.ghiChu,
		ghiChuNgay: v.ghiChuNgay === undefined ? "2026-10-20" : v.ghiChuNgay,
		donVi: v.donVi ?? "đại lý",
		giaTriMoi: v.giaTriMoi === undefined ? 12 : v.giaTriMoi,
		mucDoi:
			v.mucDoi === undefined
				? { tu: 9, den: 12, ngayTruoc: "2026-10-13" }
				: v.mucDoi,
		lyDo: [{ loai: "ghi-chu", ngay: "2026-10-20" }],
		checkInId: null,
		camXuc: [],
	};
}

function hop(dangBan: DongVao[], conLai: DongVao[]): HopTuanOutput {
	return hopTuanOutput.parse({
		tuan: "2026-10-19",
		tuanDau: false,
		daCapNhat: 3,
		tongKr: dangBan.length + conLai.length,
		dangBan: dangBan.map(dongHop),
		conLai: conLai.map(dongHop),
	});
}

type MtMau = { id: string; kr: string[]; quyen?: string[] };

const MT_MAU: MtMau[] = [
	{ id: "mt-1", kr: ["A", "C", "D", "E", "J", "K", "Z"] },
	{ id: "mt-2", kr: ["b0", "B", "b2"] },
];

function chiTietCua(id: string, khongQuyen: string[] = []): ObjectiveOutput {
	const m = MT_MAU.find((x) => x.id === id);
	if (!m) throw new LoiTrpc("NOT_FOUND", `khong co ${id}`);
	const ds = m.kr.map((k) =>
		kr(k, id, {
			title: `KR ${k}`,
			hienTaiQuaCapNhat: !khongQuyen.includes(k),
			laCuaToi: true,
		}),
	);
	return chiTietTu(mucTieu(id, ds, { canEdit: true }), {
		canEditKr: ds.filter((k) => !khongQuyen.includes(k.id)).map((k) => k.id),
	});
}

function mtCuaKr(k: string): string {
	return MT_MAU.find((m) => m.kr.includes(k))?.id ?? "mt-1";
}

function datKho(lay: () => HopTuanOutput, khongQuyen: string[] = []): void {
	kho.rieng.set("okr.hopTuan", () => lay());
	kho.rieng.set("okr.objective", (vao) =>
		chiTietCua(String(vao?.id ?? ""), khongQuyen),
	);
	kho.rieng.set("okr.canhKr", (vao) => {
		const id = String(vao?.keyResultId ?? "");
		return canhKrOutput.parse({
			kr: {
				id,
				title: `KR ${id}`,
				kind: "tang-toi",
				objectiveId: mtCuaKr(id),
				ownerName: "Nguyễn Thị Lan",
				xong: false,
			},
			dong: [],
			bangChung: [],
			quyen: { suaDuoc: true, ganDuoc: false },
			khoa: false,
			choDuyet: false,
		});
	});
	kho.rieng.set("okr.dienBien", () =>
		dienBienOutput.parse({
			kieu: "tang-toi",
			tieuDe: "KR",
			khoi: 0,
			dich: 50,
			donVi: "đại lý",
			coCapNhat: false,
			tuanDau: null,
			diem: [],
		}),
	);
	kho.rieng.set("okr.lichSuKr", (vao) =>
		lichSuKrOutput.parse({
			kieu: "tang-toi",
			tieuDe: `KR ${String(vao?.keyResultId ?? "")}`,
			dich: 50,
			donVi: "đại lý",
			coCapNhat: false,
			lan: [],
			chuoi: [],
		}),
	);
}

function datKho375(rong: number): void {
	Object.defineProperty(window, "innerWidth", {
		value: rong,
		configurable: true,
		writable: true,
	});
}

async function dungHop(thamSo = "", locale: "vi" | "en" = "vi"): Promise<San> {
	const san = await dung(
		<>
			<HopTuan cycleId="q4" unit={DON} />
			<RecordSheetHost />
		</>,
		thamSo,
		locale,
	);
	await cho(() => qs("[data-kr-hop]") !== null, "bang hop tuan dung");
	return san;
}

const dongCua = (id: string) => qsa(`[data-kr-hop="${id}"]`);
const demKr = () => qs("[data-dau-ngan-kr] [data-dem-kr]")?.textContent ?? null;
const nganCua = (id: string) => qs(`[data-kr-sheet="${id}"]`) !== null;
const nutNgan = (nut: "kr-truoc" | "kr-ke") =>
	qs<HTMLButtonElement>(`[data-dau-ngan-kr] [data-nut="${nut}"]`);

async function bam(o: Element | null, moTa: string): Promise<void> {
	if (!o) throw new Error(`khong co ${moTa}`);
	await act(async () => {
		await nguoiDung().click(o);
	});
}

async function moConLai(): Promise<void> {
	const nut = qs("[data-con-lai] button");
	if (qs("[data-con-lai]")?.getAttribute("data-con-lai") !== "mo")
		await bam(nut, "nut Con lai");
	await cho(
		() => qs("[data-con-lai]")?.getAttribute("data-con-lai") === "mo",
		"Con lai mo",
	);
}

async function moNganTuBang(id: string): Promise<void> {
	await bam(qs(`[data-kr-hop="${id}"] [data-mo-kr="${id}"]`), `ten ${id}`);
	await cho(() => nganCua(id) && demKr() !== null, `ngan ${id}`);
}

const khoiCua = (id: string) =>
	qs(`[data-kr-sheet="${id}"] [data-khoi-cap-nhat-kr]`);
const trangThaiKhoi = (id: string) =>
	khoiCua(id)?.getAttribute("data-khoi-cap-nhat-kr") ?? null;

async function moKhoi(id: string): Promise<void> {
	await cho(() => khoiCua(id) !== null, `khoi ${id}`);
	if (trangThaiKhoi(id) === "thu")
		await bam(
			qs(`[data-kr-sheet="${id}"] [data-nut="mo-khoi-cap-nhat-kr"]`),
			`dong thu ${id}`,
		);
	await cho(() => trangThaiKhoi(id) === "mo", `khoi ${id} mo`);
}

async function escDongNgan(id: string): Promise<void> {
	await act(async () => {
		await nguoiDung().keyboard("{Escape}");
	});
	await cho(() => !nganCua(id), `ngan ${id} dong`);
}

const tieuDiemTrongNgan = (id: string) =>
	document.activeElement
		?.closest('[data-slot="sheet-content"]')
		?.querySelector(`[data-kr-sheet="${id}"]`) != null;

function dauKhoi(id: string): string | null {
	const k = khoiCua(id);
	if (!k) return null;
	const o = [...k.querySelectorAll("[data-o]")].map((x) =>
		x.getAttribute("data-o"),
	);
	const gui = k.querySelector('[data-nut="gui-cap-nhat-kr"]') !== null;
	return `${k.tagName}|${o.join(",")}|${gui}`;
}

async function guiTuKhoi(
	id: string,
	giaTri: string,
	ghiChu: string,
): Promise<void> {
	const h = qs(`[data-kr-sheet="${id}"] [data-khoi-cap-nhat-kr="mo"]`);
	if (!h) throw new Error("khong co khoi cap nhat");
	const o = h.querySelector<HTMLInputElement>('[data-o="gia-tri"] input');
	if (!o) throw new Error("khong co o gia tri");
	const u = nguoiDung();
	await act(async () => {
		await u.clear(o);
		await u.type(o, giaTri);
	});
	const ghi = h.querySelector<HTMLInputElement>('[data-o="ghi-chu"] input');
	if (ghi && ghiChu !== "")
		await act(async () => {
			await u.type(ghi, ghiChu);
		});
	const muc = [...h.querySelectorAll('[data-o="tu-tin"] button')].find(
		(b) => b.textContent?.trim() === mo.capNhat.mucTuTin.vua,
	);
	if (muc) await bam(muc, "muc tu tin");
	const gui = () =>
		h.querySelector<HTMLButtonElement>('[data-nut="gui-cap-nhat-kr"]');
	await cho(() => gui()?.disabled === false, "nut gui bat");
	await bam(gui(), "nut gui");
	await cho(() => goiCua("okr.guiCapNhat").length > 0, "da gui");
}

beforeEach(() => {
	datLai();
	dieuHuong.soLan = 0;
	datKho375(1440);
});
afterEach(async () => {
	await thaoHet();
	datKho375(1440);
});

const NAM_DONG = (): HopTuanOutput =>
	hop(
		[
			{ id: "A" },
			{ id: "B", objectiveId: "mt-2" },
			{ id: "C", ghiChu: null, ghiChuNgay: null },
		],
		[{ id: "D" }, { id: "E" }],
	);

const LUAT_KHO = {
	"duoi-md": "md:hidden",
	"md-lg": "hidden md:block lg:hidden",
	"tu-lg": "hidden lg:table-cell",
} as const;

type Kho = keyof typeof LUAT_KHO;

function lopTheoKho(o: Element): string {
	let c: Element | null = o;
	while (c) {
		const lop = c.getAttribute("class") ?? "";
		if (/(^|\s)(md|lg):/.test(lop) || /(^|\s)hidden(\s|$)/.test(lop))
			return lop;
		c = c.parentElement;
	}
	return "";
}

function khoCuaDong(id: string, loai: "data-ghi-chu" | "data-muc-doi") {
	return dongCua(id).flatMap((d) =>
		[...d.querySelectorAll(`[${loai}]`)].map((o) => ({
			o,
			kho: o.getAttribute("data-kho") as Kho,
		})),
	);
}

function kiemChuGhiChu(id: string, o: Element): string[] {
	const chu = o.textContent ?? "";
	if (id === "C")
		return chu === mt.chuaCoGhiChu ? [] : [`htb-ghi-chu: C chu «${chu}»`];
	const loi: string[] = [];
	if (!chu.includes(`«ghi chu ${id}»`) || !chu.includes("20/10"))
		loi.push(`htb-ghi-chu: ${id} chu «${chu}»`);
	if (o.querySelector('[translate="no"]') === null)
		loi.push(`htb-ghi-chu: ${id} thieu translate=no`);
	return loi;
}

function kiemO(
	id: string,
	loai: "data-ghi-chu" | "data-muc-doi",
	o: Element,
	k: Kho,
	thay: Map<string, Set<Kho>>,
): string[] {
	const loi: string[] = [];
	const khoa = `${id}|${loai}`;
	const tap = thay.get(khoa) ?? new Set<Kho>();
	if (tap.has(k)) loi.push(`htb-ghi-chu: ${id} ${loai} lap kho ${k}`);
	tap.add(k);
	thay.set(khoa, tap);
	const lop = lopTheoKho(o).split(/\s+/);
	if (!LUAT_KHO[k].split(" ").every((x) => lop.includes(x)))
		loi.push(`htb-ghi-chu: ${id} ${loai} kho ${k} lop «${lop.join(" ")}»`);
	if (loai === "data-ghi-chu") loi.push(...kiemChuGhiChu(id, o));
	return loi;
}

describe("htb-ghi-chu", () => {
	test("htb-ghi-chu: moi dong co ghi chu moi nhat o ba kho, phan kho phu kin khong chong", async () => {
		datKho(NAM_DONG);
		const ID = ["A", "B", "C", "D", "E"];
		const thay = new Map<string, Set<Kho>>();
		const loi: string[] = [];
		for (const rong of [375, 1440]) {
			datKho375(rong);
			await dungHop();
			await moConLai();
			for (const id of ID)
				for (const loai of ["data-ghi-chu", "data-muc-doi"] as const)
					for (const { o, kho: k } of khoCuaDong(id, loai))
						loi.push(...kiemO(id, loai, o, k, thay));
			await thaoHet();
		}
		let dem = 0;
		for (const id of ID)
			for (const loai of ["data-ghi-chu", "data-muc-doi"]) {
				const tap = thay.get(`${id}|${loai}`) ?? new Set();
				if (tap.size !== 3)
					loi.push(
						`htb-ghi-chu: ${id} thieu kho ${["duoi-md", "md-lg", "tu-lg"].filter((k) => !tap.has(k as Kho)).join(",")}`,
					);
				dem += 1;
			}
		console.log(`htb-ghi-chu: ${dem}/10`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(10);
	});
});

const CA_MUC_DOI = [
	{
		ten: "tang-phan-tram",
		d: {
			laMoc: false,
			donVi: "%",
			giaTriMoi: 70,
			mucDoi: { tu: 64, den: 70, ngayTruoc: "2026-10-13" },
		},
		tren: "+6%",
		duoi: "64 → 70 · so với 13/10",
	},
	{
		ten: "giam-ty-dong",
		d: {
			laMoc: false,
			donVi: "tỷ đồng",
			giaTriMoi: 1.08,
			mucDoi: { tu: 1.17, den: 1.08, ngayTruoc: "2026-10-10" },
		},
		tren: "−0,09 tỷ đồng",
		duoi: "1,17 → 1,08 · so với 10/10",
	},
	{
		ten: "tang-dai-ly",
		d: {
			laMoc: false,
			donVi: "đại lý",
			giaTriMoi: 12,
			mucDoi: { tu: 9, den: 12, ngayTruoc: "2026-10-13" },
		},
		tren: "+3 đại lý",
		duoi: "9 → 12 · so với 13/10",
	},
	{
		ten: "khong-doi",
		d: {
			laMoc: false,
			donVi: "đại lý",
			giaTriMoi: 6,
			mucDoi: { tu: 6, den: 6, ngayTruoc: "2026-10-13" },
		},
		tren: mt.chuaDoi,
		duoi: "6 đại lý · so với 13/10",
	},
	{
		ten: "lan-dau",
		d: { laMoc: false, donVi: "đại lý", giaTriMoi: 4, mucDoi: null },
		tren: mt.lanDau,
		duoi: `4 đại lý · ${mt.chuaCoLanTruoc}`,
	},
	{
		ten: "chua-lan-nao",
		d: { laMoc: false, donVi: "đại lý", giaTriMoi: null, mucDoi: null },
		tren: mt.chuaCapNhat,
		duoi: mt.chuaCoLanNao,
	},
	{
		ten: "kr-moc",
		d: {
			laMoc: true,
			donVi: "",
			giaTriMoi: 1,
			mucDoi: { tu: 0, den: 1, ngayTruoc: "2026-10-13" },
		},
		tren: `${mo.moc.chuaXong} → ${mo.moc.xong}`,
		duoi: "so với 13/10",
	},
	{
		ten: "giam-phan-tram",
		d: {
			laMoc: false,
			donVi: "%",
			giaTriMoi: 64,
			mucDoi: { tu: 68, den: 64, ngayTruoc: "2026-10-08" },
		},
		tren: "−4%",
		duoi: "68 → 64 · so với 08/10",
	},
	{
		ten: "hai-lan-tuan-dau",
		d: {
			laMoc: false,
			donVi: "đại lý",
			giaTriMoi: 4,
			mucDoi: { tu: 3, den: 4, ngayTruoc: "2026-10-19" },
		},
		tren: "+1 đại lý",
		duoi: "3 → 4 · so với 19/10",
	},
] as const;

function kiemOMucDoi(
	ca: (typeof CA_MUC_DOI)[number],
	khoO: Kho,
	rong: number,
): string[] {
	const o = qsa(`[data-kr-hop="${ca.ten}"] [data-muc-doi][data-kho="${khoO}"]`);
	const dong = [...(o[0]?.children ?? [])].map(
		(c) => c.textContent?.trim() ?? "",
	);
	const loi: string[] = [];
	if (o.length !== 1 || dong.length !== 2)
		return [
			`htb-muc-doi-chu: @${rong} ${ca.ten} ${o.length} o, ${dong.length} dong`,
		];
	if (dong[0] !== ca.tren)
		loi.push(
			`htb-muc-doi-chu: @${rong} ${ca.ten} tren «${dong[0]}» can «${ca.tren}»`,
		);
	if (dong[1] !== ca.duoi)
		loi.push(
			`htb-muc-doi-chu: @${rong} ${ca.ten} duoi «${dong[1]}» can «${ca.duoi}»`,
		);
	if (dong.join(" ").includes("60%"))
		loi.push(`htb-muc-doi-chu: @${rong} ${ca.ten} co so tien do`);
	return loi;
}

describe("htb-muc-doi-chu", () => {
	test("htb-muc-doi-chu: chin ca, hai dong chu theo don vi KR, khong so tien do", async () => {
		const loi: string[] = [];
		let dem = 0;
		for (const ca of CA_MUC_DOI) {
			const chu = chuMucDoi(ca.d, "vi");
			if (chu.tren !== ca.tren)
				loi.push(`htb-muc-doi-chu: ${ca.ten} tren=${chu.tren} can ${ca.tren}`);
			if (chu.duoi !== ca.duoi)
				loi.push(`htb-muc-doi-chu: ${ca.ten} duoi=${chu.duoi} can ${ca.duoi}`);
			if (/NaN|undefined/.test(`${chu.tren}${chu.duoi}`))
				loi.push(`htb-muc-doi-chu: ${ca.ten} chu hong`);
			if (ca.ten === "hai-lan-tuan-dau" && chu.tren === mt.lanDau)
				loi.push("htb-muc-doi-chu: hai-lan-tuan-dau in Lan dau");
			dem += 1;
		}
		datKho(() =>
			hop(
				CA_MUC_DOI.map((ca) => ({ id: ca.ten, progress: 60, ...ca.d })),
				[],
			),
		);
		const KHO_RONG = [
			[1440, "tu-lg"],
			[375, "duoi-md"],
		] as const;
		for (const [rong, khoO] of KHO_RONG) {
			datKho375(rong);
			await dungHop();
			for (const ca of CA_MUC_DOI) loi.push(...kiemOMucDoi(ca, khoO, rong));
			await thaoHet();
		}
		console.log(`htb-muc-doi-chu: ${dem}/9`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(9);
	});
});

function NutDieuHuongThu() {
	const router = useRouter();
	return (
		<button
			data-nut-dieu-huong-thu=""
			onClick={() => router.push("/ws/okr/khac")}
			type="button"
		>
			di
		</button>
	);
}

describe("htb-cap-nhat", () => {
	test("htb-cap-nhat: nut tren dong theo quyen, mo hop mot KR, gui o lai bang, KR doi phan thi Con lai tu mo", async () => {
		let daGui = false;
		datKho(
			() =>
				daGui
					? hop(
							[{ id: "J" }],
							[{ id: "K", ghiChu: "vua gui", ghiChuNgay: "2026-10-21" }],
						)
					: hop([{ id: "K" }, { id: "J" }], []),
			["J"],
		);
		const san = await dungHop();
		const nutK = () =>
			qs<HTMLButtonElement>('[data-kr-hop="K"] [data-nut="cap-nhat-dong-kr"]');
		await cho(() => nutK() !== null, "nut cap nhat K");
		const loi: string[] = [];
		let dem = 0;

		const nhanK = nutK()?.getAttribute("aria-label");
		if (nhanK !== "Cập nhật KR K")
			loi.push(`htb-cap-nhat: aria-label «${nhanK}»`);
		if (qsa('[data-kr-hop="J"] [data-nut="cap-nhat-dong-kr"]').length !== 0)
			loi.push("htb-cap-nhat: J khong quyen van co nut");
		if (
			qsa(
				"[data-kr-hop] input, [data-kr-hop] textarea, [data-kr-hop] [contenteditable]",
			).length !== 0
		)
			loi.push("htb-cap-nhat: dong co o nhap");
		dem += 1;

		await bam(nutK(), "nut K");
		await cho(() => qs("[data-khoi-cap-nhat-kr]") !== null, "khoi K");
		if (trangThaiKhoi("K") !== "mo")
			loi.push("htb-cap-nhat: khoi khong phai cua K");
		if (
			!(san.url().get("record") ?? "").endsWith("kr:K") ||
			qs('[data-kr-sheet="K"] [data-khoi-cap-nhat-kr="mo"]') === null
		)
			loi.push(
				`htb-cap-nhat: bam dong khong mo ngan K co khoi mo (${san.url().get("record")})`,
			);
		dem += 1;

		const conLaiTruoc =
			qs("[data-con-lai]")?.getAttribute("data-con-lai") ?? null;
		const urlTruoc = san.url().toString();
		const duongTruoc = window.location.pathname;
		const docTruoc = docCua("okr.hopTuan").length;
		daGui = true;
		await guiTuKhoi("K", "15", "vua gui");
		await cho(() => trangThaiKhoi("K") === "thu", "khoi thu");
		const gui = goiCua("okr.guiCapNhat");
		const items = JSON.stringify(gui[0]?.vao ?? {});
		if (gui.length !== 1 || !items.includes('"keyResultId":"K"'))
			loi.push(`htb-cap-nhat: guiCapNhat ${gui.length} lan ${items}`);
		if (dieuHuong.soLan !== 0)
			loi.push(`htb-cap-nhat: router dieu huong ${dieuHuong.soLan} lan`);
		if (san.url().toString() !== urlTruoc)
			loi.push(`htb-cap-nhat: tham so doi «${urlTruoc}» → «${san.url()}»`);
		if (window.location.pathname !== duongTruoc)
			loi.push(`htb-cap-nhat: duong dan doi ${window.location.pathname}`);
		await cho(() => docCua("okr.hopTuan").length > docTruoc, "lam moi hopTuan");
		dem += 1;

		await cho(
			() => qs("[data-con-lai]")?.getAttribute("data-con-lai") === "mo",
			"Con lai tu mo",
		);
		await nhip(3);
		if (!tieuDiemTrongNgan("K"))
			loi.push(
				`htb-cap-nhat: sau gui tieu diem roi ngan, o ${document.activeElement?.outerHTML.slice(0, 80)}`,
			);
		await escDongNgan("K");
		await cho(() => document.activeElement === nutK(), "tieu diem ve nut K");
		if (conLaiTruoc !== null)
			loi.push(
				`htb-cap-nhat: doi chung — truoc khi gui Con lai «${conLaiTruoc}»`,
			);
		const chuK = qs('[data-kr-hop="K"]')?.textContent ?? "";
		if (!chuK.includes("«vua gui»"))
			loi.push("htb-cap-nhat: dong K chua co ghi chu moi");
		if (qs('[data-con-lai] [data-kr-hop="K"]') === null)
			loi.push("htb-cap-nhat: K khong o Con lai");
		dem += 1;

		await thaoHet();
		datLai();
		datKho(() => hop([{ id: "A" }], []));
		await dung(
			<>
				<HopTuan cycleId="q4" unit={DON} />
				<RecordSheetHost />
			</>,
			"?record=objective:mt-1,kr:A",
		);
		await moKhoi("A");
		const slotNgan = dauKhoi("A");
		await thaoHet();
		datLai();
		datKho(() => hop([{ id: "A" }], []));
		await dungHop();
		await bam(
			qs('[data-kr-hop="A"] [data-nut="cap-nhat-dong-kr"]'),
			"nut dong A",
		);
		await cho(() => trangThaiKhoi("A") === "mo", "khoi tu dong");
		const slotDong = dauKhoi("A");
		if (!slotNgan || slotNgan !== slotDong)
			loi.push(`htb-cap-nhat: hai nut mo hai hop ${slotNgan} / ${slotDong}`);
		dem += 1;

		await thaoHet();
		datLai();
		dieuHuong.soLan = 0;
		await dung(<NutDieuHuongThu />);
		await bam(qs("[data-nut-dieu-huong-thu]"), "nut dieu huong thu");
		if (dieuHuong.soLan !== 1)
			loi.push(
				`htb-cap-nhat: doi chung duong — bo dem router ghi ${dieuHuong.soLan}, can 1`,
			);
		await thaoHet();
		datLai();
		datKho(() => hop([{ id: "A" }], []));
		const sanDoi = await dungHop();
		await bam(qs('[data-kr-hop="A"] [data-mo-kr="A"]'), "ten A");
		await cho(() => nganCua("A"), "ngan A");
		if (!(sanDoi.url().get("record") ?? "").includes("kr:A"))
			loi.push("htb-cap-nhat: doi chung duong — url khong ghi lan mo ngan");

		console.log(`htb-cap-nhat: ${dem}/5`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(5);
	});
});

describe("htb-cap-nhat-cham", () => {
	test("htb-cap-nhat: hopTuan tra cham sau khi gui, Con lai van tu mo va tieu diem ve K", async () => {
		let daGui = false;
		datKho(() =>
			daGui
				? (new Promise((xong) =>
						setTimeout(
							() =>
								xong(
									hop(
										[{ id: "J" }],
										[{ id: "K", ghiChu: "vua gui", ghiChuNgay: "2026-10-21" }],
									),
								),
							TRE_HOP_TUAN_MS,
						),
					) as unknown as HopTuanOutput)
				: hop([{ id: "K" }, { id: "J" }], [{ id: "L" }]),
		);
		await dungHop();
		const nutK = () =>
			qs<HTMLButtonElement>('[data-kr-hop="K"] [data-nut="cap-nhat-dong-kr"]');
		await cho(() => nutK() !== null, "nut cap nhat K");
		const loi: string[] = [];
		if (qs("[data-con-lai]")?.getAttribute("data-con-lai") !== "dong")
			loi.push("htb-cap-nhat: doi chung — truoc khi gui Con lai khong gap");
		await bam(nutK(), "nut K");
		await cho(() => trangThaiKhoi("K") === "mo", "khoi K");
		daGui = true;
		await guiTuKhoi("K", "15", "vua gui");
		await cho(() => trangThaiKhoi("K") === "thu", "khoi thu");
		await cho(
			() => qs('[data-con-lai] [data-kr-hop="K"]') !== null,
			"K sang Con lai",
		);
		await nhip(3);
		if (qs("[data-con-lai]")?.getAttribute("data-con-lai") !== "mo")
			loi.push("htb-cap-nhat: hopTuan cham — Con lai khong tu mo");
		if (!tieuDiemTrongNgan("K"))
			loi.push(
				`htb-cap-nhat: hopTuan cham — sau gui tieu diem roi ngan, o ${document.activeElement?.outerHTML.slice(0, 80)}`,
			);
		await escDongNgan("K");
		await nhip(3);
		if (document.activeElement !== nutK())
			loi.push(
				`htb-cap-nhat: hopTuan cham — tieu diem o ${document.activeElement?.outerHTML.slice(0, 80)}`,
			);
		console.log("htb-cap-nhat-cham: 1/1");
		expect(loi.join("\n")).toBe("");
	});
});

describe("htb-sang", () => {
	test("htb-sang: ‹ › theo thu tu bang Dang ban roi Con lai", async () => {
		datKho(NAM_DONG);
		await dungHop();
		const loi: string[] = [];
		let dem = 0;
		const kiem = (ten: string, dung_: boolean) => {
			if (!dung_) loi.push(`htb-sang: ${ten}`);
			dem += 1;
		};
		const ke = (id: string, mong: string) =>
			`${id} ke la ${qs("[data-kr-sheet]")?.getAttribute("data-kr-sheet")} can ${mong}`;

		await moNganTuBang("B");
		kiem(
			`dem ${demKr()} can 2/5 va chu theo thu tu bang`,
			demKr() === "2/5" &&
				qs("[data-dau-ngan-kr] [data-thu-tu-kr]")?.textContent?.includes(
					mk.theoThuTuBang,
				) === true,
		);
		await bam(nutNgan("kr-truoc"), "nut ‹");
		await cho(() => nganCua("A") || nganCua("b0"), "sau ‹ tu B");
		kiem(ke("B ‹", "A"), nganCua("A"));
		await bam(nutNgan("kr-ke"), "nut ›");
		await cho(() => nganCua("B") || nganCua("C") || nganCua("b2"), "ve B");
		await bam(nutNgan("kr-ke"), "nut ›");
		await cho(() => nganCua("C") || nganCua("b2"), "sau › tu B");
		kiem(ke("B", "C"), nganCua("C"));
		await bam(nutNgan("kr-ke"), "nut ›");
		await cho(() => nganCua("D") || nganCua("E"), "sau › tu C");
		kiem(ke("C", "D"), nganCua("D") && demKr() === "4/5");
		await bam(nutNgan("kr-ke"), "nut ›");
		await cho(() => nganCua("E"), "E");
		kiem("o E nut › khong tat", nutNgan("kr-ke")?.disabled === true);
		await thaoHet();

		datLai();
		datKho(NAM_DONG);
		await dungHop();
		await moNganTuBang("A");
		kiem("o A nut ‹ khong tat", nutNgan("kr-truoc")?.disabled === true);
		await thaoHet();

		datLai();
		datKho(NAM_DONG);
		await dungHop();
		await moConLai();
		await moNganTuBang("D");
		kiem(`mo D tu bang dem ${demKr()} can 4/5`, demKr() === "4/5");
		await thaoHet();

		datLai();
		MT_MAU.push({ id: "mt-mot", kr: ["M"] });
		datKho(() => hop([{ id: "M", objectiveId: "mt-mot" }], []));
		await dungHop();
		await moNganTuBang("M").catch(() => {});
		await cho(() => nganCua("M"), "ngan M");
		await nhip(3);
		if (
			qs("[data-dau-ngan-kr] [data-dem-kr]") !== null ||
			nutNgan("kr-ke") !== null
		)
			loi.push("htb-sang: bang mot KR van co dem hay ‹ ›");
		MT_MAU.pop();

		console.log(`htb-sang: ${dem}/7`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(7);
	});
});

const LOC_RONG = { phuTrach: [], loai: [], trangThai: [], tuTin: [], gopY: [] };

function mtMot() {
	return mucTieu(
		"mt-1",
		(MT_MAU[0]?.kr ?? []).map((k) =>
			kr(k, "mt-1", { title: `KR ${k}`, laCuaToi: true }),
		),
		{ canEdit: true },
	);
}

const LOI_THAT = {
	"trang-don-vi": {
		ve: () => (
			<BangDonVi
				boLocMay={() => {}}
				chanBang={null}
				dangTaiLai={false}
				dem={undefined}
				doiLoc={() => {}}
				loc={LOC_RONG}
				rong={null}
				rows={[mtMot()]}
				tenNguoi={new Map()}
			/>
		),
		nut: () =>
			qsa("tr").find(
				(t) =>
					t.className.includes("bg-muted/30") &&
					t.textContent?.includes("KR C") === true,
			) ?? null,
	},
} as const;

async function moCTuLoiThat(mong: string): Promise<string[]> {
	const loi: string[] = [];
	for (const [ten, loiMo] of Object.entries(LOI_THAT)) {
		await thaoHet();
		datLai();
		datKho(NAM_DONG);
		const san = await dung(
			<>
				{loiMo.ve()}
				<RecordSheetHost />
			</>,
		);
		await cho(() => loiMo.nut() !== null, `dong C o ${ten}`);
		await bam(loiMo.nut(), `C o ${ten}`);
		await cho(() => nganCua("C") && demKr() !== null, `ngan C tu ${ten}`);
		if (demKr() !== mong)
			loi.push(`htb-nguon: ${ten} dem ${demKr()} can ${mong}`);
		if (san.url().get("thuTuKr") !== null)
			loi.push(`htb-nguon: ${ten} mang thuTuKr=${san.url().get("thuTuKr")}`);
		if (qs("[data-dau-ngan-kr] [data-thu-tu-kr]") !== null)
			loi.push(`htb-nguon: ${ten} hien «theo thu tu bang»`);
	}
	return loi;
}

describe("htb-nguon", () => {
	test("htb-nguon: nguon thu tu tren duong dan, tai lai giu, cho khac theo muc tieu, KR ngoai bang khong loi", async () => {
		datKho(NAM_DONG);
		const loi: string[] = [];
		let dem = 0;

		const san = await dungHop();
		await moNganTuBang("C");
		const url = san.url().toString();
		await thaoHet();
		datLai();
		datKho(NAM_DONG);
		await dungHop(`?${url}`);
		await cho(() => nganCua("C") && demKr() !== null, "ngan C sau tai lai");
		if (demKr() !== "3/5")
			loi.push(`htb-nguon: tai lai mat thu tu bang (${demKr()})`);
		await bam(nutNgan("kr-ke"), "nut ›");
		await cho(() => nganCua("D") || nganCua("E"), "› sau tai lai");
		if (!nganCua("D")) loi.push("htb-nguon: › sau tai lai khong toi D");
		dem += 1;

		await thaoHet();
		datLai();
		datKho(NAM_DONG);
		const san2 = await dungHop();
		await moNganTuBang("C");
		await act(async () => {
			await nguoiDung().keyboard("{Escape}");
		});
		await cho(() => !nganCua("C"), "dong ngan");
		await nhip(3);
		if (san2.url().get("thuTuKr") !== null)
			loi.push(`htb-nguon: dong ngan con thuTuKr=${san2.url().get("thuTuKr")}`);
		dem += 1;

		await thaoHet();
		datLai();
		datKho(NAM_DONG);
		await dung(<RecordSheetHost />, "?record=objective:mt-1,kr:C");
		await cho(() => nganCua("C") && demKr() !== null, "ngan C tu cho khac");
		const viTri = MT_MAU[0]?.kr.indexOf("C") ?? -1;
		const mong = `${viTri + 1}/${MT_MAU[0]?.kr.length}`;
		if (demKr() !== mong)
			loi.push(`htb-nguon: cho khac dem ${demKr()} can ${mong}`);
		for (const loi_ of await moCTuLoiThat(mong)) loi.push(loi_);
		dem += 1;

		await thaoHet();
		datLai();
		datKho(NAM_DONG);
		await dung(
			<>
				<HopTuan cycleId="q4" unit={DON} />
				<RecordSheetHost />
			</>,
			`?record=objective:mt-1,kr:Z&thuTuKr=${encodeURIComponent(KHOA_NGUON)}`,
		);
		await cho(() => nganCua("Z") && demKr() !== null, "ngan Z");
		const mongZ = `${(MT_MAU[0]?.kr.indexOf("Z") ?? -1) + 1}/${MT_MAU[0]?.kr.length}`;
		if (demKr() !== mongZ)
			loi.push(`htb-nguon: Z ngoai bang dem ${demKr()} can ${mongZ}`);
		dem += 1;

		console.log(`htb-nguon: ${dem}/4`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(4);
	});
});

describe("htb-sau-gui", () => {
	test("htb-sau-gui: gui tu dau ngan, B sang Con lai, ngan giu B va dem theo bang moi", async () => {
		let daGui = false;
		datKho(() =>
			daGui
				? hop(
						[{ id: "A" }, { id: "C" }],
						[{ id: "B", objectiveId: "mt-2" }, { id: "D" }],
					)
				: hop(
						[{ id: "A" }, { id: "B", objectiveId: "mt-2" }, { id: "C" }],
						[{ id: "D" }],
					),
		);
		await dungHop();
		await moConLai();
		const loi: string[] = [];
		let dem = 0;
		if (
			qs('[data-con-lai] [data-kr-hop="D"]') === null ||
			qs('[data-con-lai] [data-kr-hop="B"]') !== null
		)
			loi.push("htb-sau-gui: doi chung truoc gui — Con lai khong chi co D");
		await moNganTuBang("B");
		if (demKr() !== "2/4")
			loi.push(`htb-sau-gui: doi chung truoc gui dem ${demKr()}`);
		dem += 1;
		await moKhoi("B");
		daGui = true;
		await guiTuKhoi("B", "20", "");
		await cho(() => demKr() === "3/4", "dem sau gui");
		if (!nganCua("B")) loi.push("htb-sau-gui: ngan khong con la B");
		if (demKr() !== "3/4") loi.push(`htb-sau-gui: dem ${demKr()} can 3/4`);
		dem += 1;
		await bam(nutNgan("kr-truoc"), "‹");
		await cho(() => nganCua("C") || nganCua("A") || nganCua("b0"), "‹ sau gui");
		if (!nganCua("C")) loi.push("htb-sau-gui: ‹ sau gui khong toi C");
		await bam(nutNgan("kr-ke"), "› ve B");
		await cho(() => nganCua("B"), "ve B");
		await bam(nutNgan("kr-ke"), "› toi D");
		await cho(() => nganCua("D") || nganCua("b2"), "› sau gui");
		if (!nganCua("D")) loi.push("htb-sau-gui: › sau gui khong toi D");
		dem += 1;
		if (qs("[data-con-lai]")?.getAttribute("data-con-lai") !== "mo")
			loi.push(
				`htb-sau-gui: Con lai «${qs("[data-con-lai]")?.getAttribute("data-con-lai")}» sau gui, can mo`,
			);
		if (qs('[data-con-lai] [data-kr-hop="B"]') === null)
			loi.push("htb-sau-gui: bang chua xep B vao Con lai");
		if (
			qsa('[data-kr-hop="B"]').filter(
				(d) => d.closest("[data-con-lai]") === null,
			).length !== 0
		)
			loi.push("htb-sau-gui: B con o Dang ban");
		dem += 1;
		console.log(`htb-sau-gui: ${dem}/4`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(4);
	});
});

const TAM_CHU_VI = [
	mt.cotGhiChu,
	mt.cotMucDoi,
	mt.chuaCoGhiChu,
	mt.chuaDoi,
	mt.lanDau,
	mt.chuaCapNhat,
	"so với",
	mk.theoThuTuBang,
];

describe("htb-chu", () => {
	test("htb-chu: tam nhan hai tieng, tieu diem ve nut sau khi dong hop va sau ›", async () => {
		const loi: string[] = [];
		let dem = 0;
		const en = {
			...okrToanCanhMessages("en").hopTuan,
			theo: okrCanhKrMessages("en").khung.theoThuTuBang,
		};
		const cap = [
			[mt.cotGhiChu, en.cotGhiChu],
			[mt.cotMucDoi, en.cotMucDoi],
			[mt.chuaCoGhiChu, en.chuaCoGhiChu],
			[mt.chuaDoi, en.chuaDoi],
			[mt.lanDau, en.lanDau],
			[mt.chuaCapNhat, en.chuaCapNhat],
			[mt.soVoi, en.soVoi],
			[mk.theoThuTuBang, en.theo],
		];
		for (const [vi, e] of cap)
			if (!vi || !e || vi === e) loi.push(`htb-chu: nhan «${vi}» / «${e}»`);
		for (const locale of ["vi", "en"] as const) {
			datLai();
			datKho(() =>
				hop(
					[
						{ id: "A", ghiChu: null, ghiChuNgay: null },
						{ id: "C", giaTriMoi: null, mucDoi: null },
						{ id: "E", giaTriMoi: 4, mucDoi: null },
					],
					[{ id: "D", mucDoi: { tu: 12, den: 12, ngayTruoc: "2026-10-13" } }],
				),
			);
			await dungHop("", locale);
			await moConLai();
			await moNganTuBang("A");
			const chu = document.body.textContent ?? "";
			for (const vi of TAM_CHU_VI) {
				if (locale === "vi" && !chu.includes(vi))
					loi.push(`htb-chu: doi chung vi thieu nhan tren man: ${vi}`);
				if (locale === "en" && chu.includes(vi))
					loi.push(`htb-chu: chuoi cung o locale en: ${vi}`);
			}
			await thaoHet();
		}
		dem += 1;

		datLai();
		datKho(NAM_DONG);
		await dungHop();
		const nutA = qs<HTMLButtonElement>(
			'[data-kr-hop="A"] [data-nut="cap-nhat-dong-kr"]',
		);
		await cho(
			() => qs('[data-kr-hop="A"] [data-nut="cap-nhat-dong-kr"]') !== null,
			"nut A",
		);
		await bam(qs('[data-kr-hop="A"] [data-nut="cap-nhat-dong-kr"]'), "nut A");
		await cho(() => trangThaiKhoi("A") === "mo", "khoi A");
		await escDongNgan("A");
		await nhip(3);
		const nutSau = qs('[data-kr-hop="A"] [data-nut="cap-nhat-dong-kr"]');
		if (document.activeElement !== nutSau)
			loi.push(
				`htb-chu: tieu diem sau Huy o ${document.activeElement?.outerHTML.slice(0, 80)}`,
			);
		void nutA;
		dem += 1;

		await moNganTuBang("B");
		await bam(nutNgan("kr-ke"), "›");
		await cho(() => nganCua("C"), "C");
		await nhip(3);
		if (document.activeElement !== nutNgan("kr-ke"))
			loi.push("htb-chu: tieu diem sau › khong o nut ›");
		dem += 1;

		console.log(`htb-chu: ${dem}/3`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(3);
	});
});

export type { ReactNode };
