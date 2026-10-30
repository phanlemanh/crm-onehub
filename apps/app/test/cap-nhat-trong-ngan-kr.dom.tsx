import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	setSystemTime,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useQueryClient } from "@tanstack/react-query";
import { chuoiMoiLan } from "../../api/src/okr/dien-bien";
import { canhKrOutput } from "../../api/src/okr/okr-canh-kr.contracts";
import {
	dienBienOutput,
	hopTuanOutput,
	type LichSuKrOutput,
	lichSuKrOutput,
} from "../../api/src/okr/okr-xem.contracts";
import {
	bamChuot,
	bamPhim,
	chiTietTu,
	cho,
	danhSachTu,
	datLai,
	dung,
	goChu,
	goiCua,
	kho,
	kr,
	LoiTrpc,
	mucTieu,
	nhip,
	qs,
	qsa,
	type San,
	TheoDonVi,
	thaoHet,
} from "./khung-gop-y-dung-cho";

mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: () => {},
		replace: () => {},
		prefetch: () => {},
	}),
	useParams: () => ({ slug: "ws" }),
	usePathname: () => "/ws/okr/bo-okr",
	useSearchParams: () => new URLSearchParams(),
}));
const NGUON_CACHE = readFileSync(
	join(import.meta.dir, "..", "lib", "trpc", "cache.ts"),
	"utf8",
);
const KHOA_CACHE_OKR = new Set(
	[...NGUON_CACHE.matchAll(/trpc\.okr\.([A-Za-z]+)\.queryKey\(\)/g)].map(
		(m) => `okr.${m[1]}`,
	),
);
mock.module("@/lib/trpc/cache", () => ({
	useCrmCache: () => {
		const qc = useQueryClient();
		return {
			okr: async (id?: string) => {
				kho.daLamMoi.push(id ?? "");
				await qc.invalidateQueries({
					predicate: (q) => KHOA_CACHE_OKR.has(String(q.queryKey[0])),
				});
			},
		};
	},
}));
mock.module("@/components/crm/stage-change", () => ({
	CloseReasonDialog: () => null,
	DealStageMenu: () => null,
}));
mock.module("@/components/crm/fields/fields-sheet", () => ({
	FieldsSheetHost: () => null,
}));

const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { okrCanhKrMessages } = await import("@/lib/messages/okr-canh-kr");
const { HopTuan } = await import("@/app/(app)/[slug]/okr/hop-tuan");

const HOI_BO = okrCanhKrMessages("vi").khoiCapNhat.hoiBo;

type KieuKr = "tang-toi" | "giam-xuong" | "moc";
type MucDaGui = {
	keyResultId: string;
	value: number;
	confidence: string;
	note: string;
};
type Lan = { id: string; luc: string; tuan: string; giaTri: number };
type KrMau = {
	id: string;
	kieu: KieuKr;
	donVi: string;
	khoi: number;
	dich: number;
	hienTai: number;
	lan: Lan[];
	laCuaToi?: boolean;
};

const TUAN_KY = [
	"2026-09-28",
	"2026-10-05",
	"2026-10-12",
	"2026-10-19",
	"2026-10-26",
	"2026-11-02",
	"2026-11-09",
];
const THU_NAM = new Date("2026-10-29T03:00:00.000Z");
const lan = (id: string, luc: string, tuan: string, giaTri: number): Lan => ({
	id,
	luc,
	tuan,
	giaTri,
});

type TrangKho = {
	kr: KrMau[];
	mt: { kyGhiDuoc: boolean; status: "cong-bo" | "da-bo"; suaDuoc: boolean };
	bay: number;
};

const trang: TrangKho = {
	kr: [],
	mt: { kyGhiDuoc: true, status: "cong-bo", suaDuoc: true },
	bay: 0,
};

function krMacDinh(): KrMau[] {
	return [
		{
			id: "A",
			kieu: "tang-toi",
			donVi: "đại lý",
			khoi: 0,
			dich: 24,
			hienTai: 12,
			lan: [
				lan("A1", "2026-10-13T03:00:00.000Z", "2026-10-12", 11),
				lan("A2", "2026-10-20T03:00:00.000Z", "2026-10-19", 12),
			],
		},
		{
			id: "B",
			kieu: "giam-xuong",
			donVi: "tỷ đồng",
			khoi: 1.5,
			dich: 0.8,
			hienTai: 1.17,
			lan: [lan("B1", "2026-10-20T03:00:00.000Z", "2026-10-19", 1.17)],
		},
		{
			id: "C",
			kieu: "moc",
			donVi: "",
			khoi: 0,
			dich: 1,
			hienTai: 0,
			lan: [],
		},
		{
			id: "D",
			kieu: "tang-toi",
			donVi: "đại lý",
			khoi: 0,
			dich: 40,
			hienTai: 20,
			lan: [lan("D1", "2026-10-27T03:00:00.000Z", "2026-10-26", 20)],
		},
	];
}

const krCua = (id: string) => {
	const k = trang.kr.find((x) => x.id === id);
	if (!k) throw new LoiTrpc("NOT_FOUND", `khong co ${id}`);
	return k;
};

function lichSuCua(k: KrMau, homNay: Date): LichSuKrOutput {
	const laMoc = k.kieu === "moc";
	return lichSuKrOutput.parse({
		kieu: k.kieu,
		tieuDe: `KR ${k.id}`,
		dich: k.dich,
		donVi: k.donVi,
		coCapNhat: k.lan.length > 0,
		lan: k.lan.map((l) => ({
			checkInId: l.id,
			luc: l.luc,
			ngay: l.luc.slice(0, 10),
			tuan: l.tuan,
			giaTri: laMoc ? null : l.giaTri,
			tuTin: "vua",
			ghiChu: `ghi chu ${l.id}`,
			camXuc: [],
		})),
		chuoi: chuoiMoiLan(
			{
				id: k.id,
				thuTu: 0,
				khoaLuc: null,
				kieu: k.kieu,
				khoi: k.khoi,
				dich: k.dich,
				lan: k.lan.map((l) => ({
					id: l.id,
					tuan: l.tuan,
					luc: new Date(l.luc),
					tuTin: "vua",
					ghiChu: "",
					giaTri: l.giaTri,
				})),
			},
			TUAN_KY,
			homNay,
			() => null,
		),
	});
}

function chiTiet() {
	const ds = trang.kr.map((k) =>
		kr(k.id, "mt-1", {
			title: `KR ${k.id}`,
			kind: k.kieu,
			unit: k.donVi,
			startValue: k.khoi,
			targetValue: k.dich,
			currentValue: k.hienTai,
			hienTaiQuaCapNhat: true,
			laCuaToi: k.laCuaToi ?? true,
		}),
	);
	return chiTietTu(
		mucTieu("mt-1", ds, { canEdit: true, status: trang.mt.status }),
		{
			canEditKr: trang.mt.suaDuoc ? ds.map((k) => k.id) : [],
			kyGhiDuoc: trang.mt.kyGhiDuoc,
		},
	);
}

function datKho(): void {
	kho.rieng.set("okr.objective", () => chiTiet());
	kho.rieng.set("okr.lichSuKr", (vao) =>
		lichSuCua(krCua(String(vao?.keyResultId ?? "")), new Date()),
	);
	kho.rieng.set("okr.canhKr", (vao) => {
		const k = krCua(String(vao?.keyResultId ?? ""));
		return canhKrOutput.parse({
			kr: {
				id: k.id,
				title: `KR ${k.id}`,
				kind: k.kieu,
				objectiveId: "mt-1",
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
			dich: 24,
			donVi: "đại lý",
			coCapNhat: false,
			tuanDau: null,
			diem: [],
		}),
	);
	kho.ghiRieng.set("okr.guiCapNhat", async (vao) => {
		if (trang.bay > 0) {
			trang.bay -= 1;
			throw loiYeuCau("Ghi chú quá dài");
		}
		const items = (vao?.items ?? []) as {
			keyResultId: string;
			value: number;
		}[];
		for (const muc of items) {
			const k = krCua(muc.keyResultId);
			const luc = new Date().toISOString();
			k.lan = [...k.lan, lan(`${k.id}-moi`, luc, "2026-10-26", muc.value)];
			k.hienTai = muc.value;
		}
		return { ok: true };
	});
}

function loiYeuCau(thongDiep: string): LoiTrpc {
	const e = new LoiTrpc("BAD_REQUEST", thongDiep);
	Object.assign(e.data, { httpStatus: 400 });
	return e;
}

const roCu = globalThis.ResizeObserver;
const rectCu = HTMLElement.prototype.getBoundingClientRect;
class QuanSatCoCo {
	constructor(private cb: ResizeObserverCallback) {}
	observe(el: Element) {
		this.cb(
			[
				{
					target: el,
					contentRect: { width: 640, height: 160 } as DOMRectReadOnly,
				} as ResizeObserverEntry,
			],
			this as unknown as ResizeObserver,
		);
	}
	unobserve() {}
	disconnect() {}
}
function coKhungDoThi(): void {
	globalThis.ResizeObserver = QuanSatCoCo as unknown as typeof ResizeObserver;
	HTMLElement.prototype.getBoundingClientRect = () =>
		({
			width: 640,
			height: 160,
			top: 0,
			left: 0,
			right: 640,
			bottom: 160,
			x: 0,
			y: 0,
			toJSON: () => ({}),
		}) as DOMRect;
}

const KHOI = "[data-khoi-cap-nhat-kr]";
const LICH_SU = '[data-muc-ngan="lich-su"]';
const trangThaiKhoi = () => qs(KHOI)?.getAttribute("data-khoi-cap-nhat-kr");
const oGiaTri = () => qs<HTMLInputElement>(`${KHOI} [data-o="gia-tri"] input`);
const oGhiChu = () => qs<HTMLInputElement>(`${KHOI} [data-o="ghi-chu"] input`);
const mucDoi = () =>
	qs(`${KHOI} [data-xem-truoc-cap-nhat]`)?.textContent ?? null;
const chamXemTruoc = () => qsa(`${LICH_SU} [data-diem-moi]`).length;
const chamLien = () =>
	qsa(`${LICH_SU} .recharts-line-dots circle:not([data-diem-moi])`).length;
const nganCua = (id: string) => qs(`[data-kr-sheet="${id}"]`) !== null;
const dongDau = () => qs(`${LICH_SU} [data-lan-cap-nhat]`);
const nutTrong = (sel: string, chu: string) =>
	qsa(`${sel} button`).find((b) => b.textContent?.includes(chu)) ?? null;
const nutDau = (nut: "kr-truoc" | "kr-ke") =>
	qs<HTMLButtonElement>(`[data-dau-ngan-kr] [data-nut="${nut}"]`);
const hopHoi = () =>
	qsa("[role=alertdialog]").find((h) =>
		h.textContent?.includes(HOI_BO.tieuDe),
	) ?? null;

async function moNgan(id: string, thamSo = ""): Promise<San> {
	const san = await dung(
		<RecordSheetHost />,
		`?record=objective:mt-1,kr:${id}${thamSo}`,
	);
	await cho(() => nganCua(id), `ngan ${id}`);
	await cho(
		() =>
			qs(LICH_SU) !== null && qs(`${LICH_SU} [data-slot="skeleton"]`) === null,
		`lich su ${id}`,
	);
	await cho(
		() =>
			qs(KHOI) !== null ||
			qs("[data-than-ngan-kr]")?.getAttribute("data-trang-thai") ===
				"ST-ngan-kr-chi-doc",
		`khoi ${id}`,
	);
	return san;
}

async function bam(o: Element | null, moTa: string): Promise<void> {
	if (!o) throw new Error(`khong co ${moTa}`);
	await bamChuot(o);
}

async function chonTuTin(chu: string): Promise<void> {
	await bam(nutTrong(`${KHOI} [data-o="tu-tin"]`, chu), `tu tin ${chu}`);
}

async function goGiaTri(chu: string): Promise<void> {
	const o = oGiaTri();
	if (!o) throw new Error("khong co o gia tri");
	await goChu(o, chu, true);
}

beforeEach(() => {
	datLai();
	trang.kr = krMacDinh();
	trang.mt = { kyGhiDuoc: true, status: "cong-bo", suaDuoc: true };
	trang.bay = 0;
	setSystemTime(THU_NAM);
	coKhungDoThi();
	datKho();
});
afterEach(async () => {
	await thaoHet();
	setSystemTime();
	globalThis.ResizeObserver = roCu;
	HTMLElement.prototype.getBoundingClientRect = rectCu;
});

describe("cnk-mo-thu", () => {
	test("cnk-mo-thu: khoi mo san khi den han, thu mot dong khi da cap nhat tuan nay", async () => {
		const loi: string[] = [];
		let dem = 0;

		await moNgan("A");
		const khoi = qs(KHOI);
		const so = qs('[data-muc-ngan="so"]');
		const lichSu = qs("[data-lich-su-kr]");
		const truocSau = (a: Element | null, b: Element | null) =>
			a !== null &&
			b !== null &&
			(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
		const nutChinh = qsa(`${KHOI} button[data-variant="default"]`);
		if (
			trangThaiKhoi() !== "mo" ||
			!truocSau(so, khoi) ||
			!truocSau(khoi, lichSu) ||
			oGiaTri() === null ||
			oGhiChu() === null ||
			qsa(`${KHOI} [data-o="tu-tin"] button`).length !== 3 ||
			nutChinh.length !== 1 ||
			nutChinh[0]?.getAttribute("data-nut") !== "gui-cap-nhat-kr"
		)
			loi.push(
				`cnk-mo-thu: (a) khoi ${trangThaiKhoi()} can mo, thu tu ${truocSau(so, khoi)}/${truocSau(khoi, lichSu)} nut chinh ${nutChinh.length}`,
			);
		else dem += 1;
		if (qs("[data-ghi-ho]") !== null)
			loi.push("cnk-mo-thu: (a) chinh chu ma co [data-ghi-ho]");
		await thaoHet();

		datLai();
		datKho();
		await moNgan("D");
		const dong = qs(`${KHOI} [data-nut="mo-khoi-cap-nhat-kr"]`);
		if (
			trangThaiKhoi() !== "thu" ||
			!dong?.textContent?.includes("27/10") ||
			!dong.textContent.includes("20 đại lý")
		)
			loi.push(
				`cnk-mo-thu: (b) khoi ${trangThaiKhoi()} dong «${dong?.textContent}»`,
			);
		await bam(dong, "dong thu");
		await cho(() => trangThaiKhoi() === "mo", "khoi D mo");
		await nhip(2);
		if (document.activeElement !== oGiaTri())
			loi.push("cnk-mo-thu: (b) bam dong thu, con tro khong o o gia tri");
		else dem += 1;
		await thaoHet();

		datLai();
		trang.kr = krMacDinh();
		krCua("A").lan = [
			...krCua("A").lan,
			lan("A3", "2026-10-25T17:30:00.000Z", "2026-10-26", 13),
		];
		datKho();
		await moNgan("A");
		if (trangThaiKhoi() !== "thu")
			loi.push(`cnk-mo-thu: (c) bien tuan VN khoi ${trangThaiKhoi()} can thu`);
		else dem += 1;
		await thaoHet();

		datLai();
		trang.kr = krMacDinh();
		setSystemTime(new Date("2026-10-26T03:00:00.000Z"));
		datKho();
		await moNgan("A");
		if (trangThaiKhoi() !== "mo")
			loi.push(`cnk-mo-thu: (d) thu Hai chua cap nhat khoi ${trangThaiKhoi()}`);
		else dem += 1;
		await thaoHet();
		setSystemTime(THU_NAM);

		datLai();
		trang.kr = krMacDinh();
		krCua("A").laCuaToi = false;
		datKho();
		await moNgan("A");
		const ghiHo = qs(`${KHOI} [data-ghi-ho]`);
		if (!ghiHo?.textContent?.includes("Trần Văn Hùng"))
			loi.push(`cnk-mo-thu: (e) ghi ho «${ghiHo?.textContent}»`);
		else dem += 1;

		console.log(`cnk-mo-thu: ${dem}/5`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(5);
	});
});

describe("cnk-chi-doc", () => {
	test("cnk-chi-doc: khong quyen, ky khoa, muc tieu bo thi khong co khoi", async () => {
		const loi: string[] = [];
		let dem = 0;
		const O = [
			{
				ten: "sua-duoc",
				mt: { kyGhiDuoc: true, status: "cong-bo", suaDuoc: true },
				coKhoi: true,
			},
			{
				ten: "khong-sua",
				mt: { kyGhiDuoc: true, status: "cong-bo", suaDuoc: false },
				coKhoi: false,
			},
			{
				ten: "ky-cham-diem",
				mt: { kyGhiDuoc: false, status: "cong-bo", suaDuoc: true },
				coKhoi: false,
			},
			{
				ten: "da-bo",
				mt: { kyGhiDuoc: true, status: "da-bo", suaDuoc: true },
				coKhoi: false,
			},
		] as const;
		for (const o of O) {
			datLai();
			trang.kr = krMacDinh();
			trang.mt = { ...o.mt };
			datKho();
			await moNgan("A");
			const coKhoi = qs(KHOI) !== null;
			const tt = qs("[data-than-ngan-kr]")?.getAttribute("data-trang-thai");
			if (o.coKhoi ? !coKhoi : coKhoi || tt !== "ST-ngan-kr-chi-doc")
				loi.push(`cnk-chi-doc: ${o.ten} con khoi ${coKhoi} trang thai ${tt}`);
			else dem += 1;
			await thaoHet();
		}
		console.log(`cnk-chi-doc: ${dem}/4`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(4);
	});
});

describe("cnk-xem-truoc", () => {
	test("cnk-xem-truoc: go gia tri thi Lich su co cham net dut va khoi co dong muc doi", async () => {
		const loi: string[] = [];
		let dem = 0;
		const O = [
			{
				id: "A",
				ten: "tang-toi",
				go: "14",
				mong: "12 → 14 (+2 đại lý)",
				cham: 1,
			},
			{
				id: "B",
				ten: "ty-dong",
				go: "1,08",
				mong: "1,17 → 1,08 (−0,09 tỷ đồng)",
				cham: 1,
			},
			{ id: "C", ten: "moc", go: "Xong", mong: "Chưa xong → Xong", cham: 0 },
		];
		for (const o of O) {
			datLai();
			trang.kr = krMacDinh();
			datKho();
			await moNgan(o.id);
			if (o.id !== "C")
				await cho(() => chamLien() > 0, `bieu do ${o.id}`).catch(() => {});
			if (mucDoi() !== null || chamXemTruoc() !== 0) {
				loi.push(`cnk-xem-truoc: ${o.id} doi chung truoc go co xem truoc`);
				await thaoHet();
				continue;
			}
			if (o.id === "C")
				await bam(nutTrong(`${KHOI} [data-o="gia-tri"]`, o.go), "Xong");
			else await goGiaTri(o.go);
			await cho(() => mucDoi() !== null, `muc doi ${o.id}`).catch(() => {});
			const coDu =
				mucDoi() === o.mong &&
				chamXemTruoc() === o.cham &&
				qs(`${KHOI} svg.recharts-surface`) === null &&
				qs(`${KHOI} [data-khoi-lan-truoc]`) === null;
			if (!coDu)
				loi.push(
					`cnk-xem-truoc: ${o.ten} muc doi ${mucDoi()} can ${o.mong} (cham ${chamXemTruoc()} can ${o.cham})`,
				);
			if (o.id !== "C") {
				const ov = oGiaTri();
				if (ov) await goChu(ov, "{Backspace>8/}", false);
				await nhip(2);
				if (mucDoi() !== null || chamXemTruoc() !== 0)
					loi.push(`cnk-xem-truoc: ${o.id} xoa gia tri van con xem truoc`);
				else if (coDu) dem += 1;
			} else if (coDu) dem += 1;
			await thaoHet();
		}
		console.log(`cnk-xem-truoc: ${dem}/3`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(3);
	});
});

async function dienVaGui(cach: "nut" | "phim", ghiChu: string): Promise<void> {
	await goGiaTri("14");
	await chonTuTin("Cao");
	const o = oGhiChu();
	if (!o) throw new Error("khong co o ghi chu");
	await goChu(o, ghiChu);
	await cho(
		() =>
			qs<HTMLButtonElement>(`${KHOI} [data-nut="gui-cap-nhat-kr"]`)
				?.disabled === false,
		"nut gui san sang",
	);
	if (cach === "nut")
		await bam(qs(`${KHOI} [data-nut="gui-cap-nhat-kr"]`), "nut gui");
	else await bamPhim(o, "{Control>}{Enter}{/Control}");
}

describe("cnk-gui", () => {
	test("cnk-gui: gui bang nut hay Ctrl+Enter, ngan van mo, Lich su them diem va dong", async () => {
		const loi: string[] = [];
		let dem = 0;
		for (const cach of ["nut", "phim"] as const) {
			datLai();
			trang.kr = krMacDinh();
			datKho();
			await moNgan("A");
			await cho(() => chamLien() > 0, "bieu do A");
			const n = chamLien();
			const ghiChu = `them hai dai ly ${cach}`;
			await dienVaGui(cach, ghiChu);
			await cho(() => goiCua("okr.guiCapNhat").length > 0, "goi gui");
			await cho(() => trangThaiKhoi() === "thu", "khoi thu sau gui").catch(
				() => {},
			);
			await cho(() => chamLien() === n + 1, "them diem").catch(() => {});
			const g = goiCua("okr.guiCapNhat");
			const muc = (g[0]?.vao?.items as MucDaGui[] | undefined)?.[0];
			const sau = [
				g.length === 1 || `goi gui ${g.length}`,
				g[0]?.vao?.sessionId === "phien-1" || "sessionId",
				muc?.keyResultId === "A" || "keyResultId",
				muc?.value === 14 || `value ${muc?.value}`,
				muc?.confidence === "cao" || "confidence",
				muc?.note === ghiChu || "note",
				nganCua("A") || "ngan K dong sau gui",
				chamLien() === n + 1 || `bieu do ${chamLien()} diem can ${n + 1}`,
				chamXemTruoc() === 0 || "con cham xem truoc",
				(dongDau()?.textContent?.includes("14") &&
					dongDau()?.textContent?.includes("ghi chu A-moi")) ||
					`dong dau «${dongDau()?.textContent}»`,
				qs('[data-o-so="hien-tai"]')?.textContent?.includes("14") ||
					"o hien tai",
				trangThaiKhoi() === "thu" || `khoi ${trangThaiKhoi()}`,
			].filter((x) => x !== true);
			if (sau.length > 0) loi.push(`cnk-gui: ${cach} ${sau.join(", ")}`);
			else dem += 1;
			await thaoHet();
		}

		datLai();
		trang.kr = krMacDinh();
		datKho();
		await moNgan("C");
		await bam(nutTrong(`${KHOI} [data-o="gia-tri"]`, "Xong"), "Xong");
		const bc = () =>
			qs<HTMLInputElement>(`${KHOI} [data-o="bang-chung"] input`);
		await cho(() => bc() !== null, "o bang chung").catch(() => {});
		const oBc = bc();
		if (!oBc) loi.push("cnk-gui: moc thieu bang chung");
		else {
			await goChu(oBc, "https://example.test/hop-dong");
			await chonTuTin("Cao");
			await bam(qs(`${KHOI} [data-nut="gui-cap-nhat-kr"]`), "nut gui moc");
			await cho(() => goiCua("okr.guiCapNhat").length > 0, "goi gui moc");
			const muc = (
				goiCua("okr.guiCapNhat")[0]?.vao?.items as
					| { value: number; bangChung?: { url: string } }[]
					| undefined
			)?.[0];
			if (
				muc?.value !== 1 ||
				muc.bangChung?.url !== "https://example.test/hop-dong"
			)
				loi.push(`cnk-gui: moc gui ${JSON.stringify(muc)}`);
			else dem += 1;
		}
		console.log(`cnk-gui: ${dem}/3`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(3);
	});
});

describe("cnk-loi", () => {
	test("cnk-loi: may chu tu choi thi bao trong khoi va giu nhap", async () => {
		const loi: string[] = [];
		let dem = 0;
		trang.bay = 1;
		await moNgan("A");
		const truoc = qsa(`${LICH_SU} [data-lan-cap-nhat]`).length;
		await dienVaGui("nut", "ghi chu se loi");
		await cho(() => qs(`${KHOI} [data-loi-gui]`) !== null, "bao loi").catch(
			() => {},
		);
		const bao = qs(`${KHOI} [data-loi-gui]`)?.textContent ?? "";
		const sai = [
			(bao.includes("Ghi chú quá dài") &&
				!bao.includes("TRPCClientError") &&
				!bao.includes("BAD_REQUEST")) ||
				`bao «${bao}»`,
			oGiaTri()?.value === "14" || "nhap mat sau loi",
			oGhiChu()?.value === "ghi chu se loi" || "nhap mat sau loi",
			trangThaiKhoi() === "mo" || `khoi ${trangThaiKhoi()}`,
			nganCua("A") || "ngan dong",
			qsa(`${LICH_SU} [data-lan-cap-nhat]`).length === truoc ||
				"lich su them dong",
		].filter((x) => x !== true);
		if (sai.length > 0) loi.push(`cnk-loi: ${sai.join(", ")}`);
		else dem += 1;
		console.log(`cnk-loi: ${dem}/1`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(1);
	});
});

type HanhDong = "esc" | "ke" | "truoc";
const KY_HIEU = { esc: "Esc", ke: "›", truoc: "‹" } as const satisfies Record<
	HanhDong,
	string
>;

async function lamHanhDong(h: HanhDong): Promise<void> {
	if (h === "esc") {
		const o = oGiaTri() ?? qs<HTMLElement>("[data-kr-sheet]");
		if (o) await bamPhim(o, "{Escape}");
		return;
	}
	await bam(nutDau(h === "ke" ? "kr-ke" : "kr-truoc"), h);
}

const daThucThi = (h: HanhDong, san: San) =>
	h === "esc"
		? !nganCua("B")
		: h === "ke"
			? nganCua("C")
			: nganCua("A") && san.url().get("record")?.endsWith("kr:A") === true;

describe("cnk-giu-nhap", () => {
	test("cnk-giu-nhap: con nhap thi hoi truoc khi dong hay sang KR khac", async () => {
		const loi: string[] = [];
		let dem = 0;
		for (const h of ["esc", "ke", "truoc"] as const) {
			datLai();
			trang.kr = krMacDinh();
			datKho();
			const san = await moNgan("B");
			await lamHanhDong(h);
			await cho(() => daThucThi(h, san), `${h} khong nhap`).catch(() => {});
			if (!daThucThi(h, san) || hopHoi() !== null)
				loi.push(
					`cnk-giu-nhap: ${KY_HIEU[h]} khong nhap van hoi hay khong chay`,
				);
			else dem += 1;
			await thaoHet();

			datLai();
			trang.kr = krMacDinh();
			datKho();
			const san2 = await moNgan("B");
			await goGiaTri("1,1");
			await lamHanhDong(h);
			await cho(() => hopHoi() !== null, `${h} hoi`).catch(() => {});
			if (hopHoi() === null) {
				loi.push(`cnk-giu-nhap: ${KY_HIEU[h]} co nhap khong hoi`);
				await thaoHet();
				continue;
			}
			await bam(nutTrong("[role=alertdialog]", HOI_BO.thoi), "o lai");
			await cho(() => hopHoi() === null, "dong hop hoi");
			const oLai = nganCua("B") && oGiaTri()?.value === "1,1";
			await lamHanhDong(h);
			await cho(() => hopHoi() !== null, `${h} hoi lan hai`).catch(() => {});
			await bam(nutTrong("[role=alertdialog]", HOI_BO.nut), "bo");
			await cho(() => daThucThi(h, san2), `${h} sau khi bo`).catch(() => {});
			if (!oLai || !daThucThi(h, san2))
				loi.push(
					`cnk-giu-nhap: ${KY_HIEU[h]} o lai giu ${oLai}, bo thi chay ${daThucThi(h, san2)}`,
				);
			else dem += 1;
			await thaoHet();
		}
		console.log(`cnk-giu-nhap: ${dem}/6`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(6);
	});
});

describe("cnk-dau-ngan", () => {
	test("cnk-dau-ngan: dau ngan khong nut chinh, KR ke khong mang nhap cua K", async () => {
		const loi: string[] = [];
		let dem = 0;
		const san = await moNgan("A");
		if (
			qsa('[data-dau-ngan-kr] button[data-variant="default"]').length !== 0 ||
			qs('[data-nut="cap-nhat-ngan-kr"]') !== null ||
			!nutDau("kr-ke") ||
			!nutDau("kr-truoc") ||
			qs("[data-dau-ngan-kr] [data-dem-kr]") === null
		)
			loi.push("cnk-dau-ngan: dau ngan con nut chinh hay thieu ‹ › dem");
		else dem += 1;

		await dienVaGui("nut", "lan cua A");
		await cho(() => trangThaiKhoi() === "thu", "A thu sau gui");
		await bam(nutDau("kr-ke"), "›");
		await cho(() => nganCua("B"), "ngan B");
		await cho(() => trangThaiKhoi() !== undefined, "khoi B");
		if (
			trangThaiKhoi() !== "mo" ||
			oGiaTri()?.value !== "1,17" ||
			mucDoi() !== null
		)
			loi.push(
				`cnk-dau-ngan: K2 mang nhap cua K (khoi ${trangThaiKhoi()} gia tri ${oGiaTri()?.value} muc doi ${mucDoi()})`,
			);
		else dem += 1;
		await thaoHet();

		datLai();
		trang.kr = krMacDinh();
		datKho();
		await moNgan("C");
		await bam(nutDau("kr-ke"), "›");
		await cho(() => nganCua("D"), "ngan D");
		await cho(() => trangThaiKhoi() !== undefined, "khoi D");
		if (trangThaiKhoi() !== "thu")
			loi.push(`cnk-dau-ngan: K2 da cap nhat khoi ${trangThaiKhoi()}`);
		else dem += 1;
		await thaoHet();

		datLai();
		trang.kr = krMacDinh();
		datKho();
		const san3 = await moNgan("C", "&tab=cap-nhat&thuTuKr=bang-1");
		await bam(nutTrong(`${KHOI} [data-o="gia-tri"]`, "Xong"), "Xong");
		await chonTuTin("Cao");
		await bam(qs(`${KHOI} [data-nut="gui-cap-nhat-kr"]`), "gui C");
		await cho(() => trangThaiKhoi() === "thu", "C thu sau gui");
		await bam(nutDau("kr-ke"), "›");
		await cho(() => nganCua("D"), "ngan D tu hop tuan");
		await cho(() => trangThaiKhoi() !== undefined, "khoi D tu hop tuan");
		if (
			trangThaiKhoi() !== "thu" ||
			san3.url().get("tab") !== null ||
			san3.url().get("thuTuKr") !== "bang-1"
		)
			loi.push(
				`cnk-dau-ngan: K2 mo do tab=cap-nhat (khoi ${trangThaiKhoi()} tab ${san3.url().get("tab")} thuTuKr ${san3.url().get("thuTuKr")})`,
			);
		else dem += 1;
		void san;
		console.log(`cnk-dau-ngan: ${dem}/4`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(4);
	});
});

function dongHop(id: string) {
	return {
		keyResultId: id,
		objectiveId: "mt-1",
		tieuDe: `KR ${id}`,
		mucTieu: "Mục tiêu mt-1",
		chuTen: "Nguyễn Thị Lan",
		progress: 40,
		expected: 50,
		laMoc: false,
		tuTin: "vua",
		ghiChu: `ghi chu ${id}`,
		ghiChuNgay: "2026-10-20",
		donVi: "đại lý",
		giaTriMoi: 12,
		mucDoi: { tu: 9, den: 12, ngayTruoc: "2026-10-13" },
		lyDo: [{ loai: "ghi-chu", ngay: "2026-10-20" }],
		checkInId: null,
		camXuc: [],
	};
}

type Loi = "hop-tuan" | "bang-don-vi" | "muc-tieu";

async function dungLoi(loiVao: Loi): Promise<San> {
	if (loiVao === "hop-tuan") {
		kho.rieng.set("okr.hopTuan", () =>
			hopTuanOutput.parse({
				tuan: "2026-10-26",
				tuanDau: false,
				daCapNhat: 1,
				tongKr: 3,
				dangBan: ["A", "B"].map(dongHop),
				conLai: ["C"].map(dongHop),
			}),
		);
		const san = await dung(
			<>
				<HopTuan cycleId="q4" unit={{ loai: "bp", id: "bp-1" }} />
				<RecordSheetHost />
			</>,
		);
		await cho(() => qs('[data-kr-hop="A"]') !== null, "bang hop tuan");
		return san;
	}
	if (loiVao === "bang-don-vi") {
		const ct = chiTiet();
		kho.danhSach = () =>
			danhSachTu([mucTieu("mt-1", ct.keyResults, { canEdit: true })]);
		const san = await dung(
			<>
				<TheoDonVi />
				<RecordSheetHost />
			</>,
		);
		await cho(() => qs('[data-kr="A"]') !== null, "bang theo don vi");
		return san;
	}
	const san = await dung(<RecordSheetHost />, "?record=objective:mt-1");
	await cho(() => qs("[data-okr-sheet]") !== null, "ngan muc tieu");
	return san;
}

async function bamLoi(loiVao: Loi): Promise<void> {
	if (loiVao === "hop-tuan") {
		await cho(
			() => qs('[data-kr-hop="A"] [data-nut="cap-nhat-dong-kr"]') !== null,
			"nut dong hop tuan",
		);
		await bam(
			qs('[data-kr-hop="A"] [data-nut="cap-nhat-dong-kr"]'),
			"nut hop tuan",
		);
		return;
	}
	if (loiVao === "bang-don-vi") {
		await cho(
			() => qs('[data-kr="A"] [data-nut="cap-nhat-dong-kr"]') !== null,
			"nut dong bang",
		);
		await bam(qs('[data-kr="A"] [data-nut="cap-nhat-dong-kr"]'), "nut bang");
		return;
	}
	const MENU = '[aria-label="Thao tác với KR A"]';
	await cho(() => qs(MENU) !== null, "nut menu KR A");
	const menu = qs(MENU);
	await bam(menu ?? null, "menu KR A");
	await cho(() => qs('[data-muc="cap-nhat-kr"]') !== null, "muc cap nhat");
	await bam(qs('[data-muc="cap-nhat-kr"]'), "muc cap nhat KR");
}

const daCuon: Element[] = [];
const cuonCu = HTMLElement.prototype.scrollIntoView;

describe("cnk-loi-vao", () => {
	test("cnk-loi-vao: ba loi Cap nhat mo ngan KR, cuon toi khoi va ghi entry rieng", async () => {
		const loi: string[] = [];
		let dem = 0;
		HTMLElement.prototype.scrollIntoView = function (this: HTMLElement) {
			daCuon.push(this);
		};
		try {
			for (const loiVao of ["hop-tuan", "bang-don-vi", "muc-tieu"] as const) {
				datLai();
				trang.kr = krMacDinh();
				datKho();
				daCuon.length = 0;
				const san = await dungLoi(loiVao);
				try {
					await bamLoi(loiVao);
				} catch (e) {
					loi.push(`cnk-loi-vao: ${loiVao} vap ${String(e).slice(0, 120)}`);
				}
				await cho(() => nganCua("A"), `${loiVao} ngan A`).catch(() => {});
				await cho(() => trangThaiKhoi() === "mo", `${loiVao} khoi mo`).catch(
					() => {},
				);
				await cho(
					() => goiCua("okr.moCapNhat").length > 0,
					`${loiVao} mo phien`,
				).catch(() => {});
				await nhip(3);
				const hopLa = qsa("[role=dialog]").filter(
					(h) => h.querySelector("[data-kr-sheet], [data-okr-sheet]") === null,
				);
				const khoi = qs(KHOI);
				const sai = [
					hopLa.length === 0 || "mo dialog",
					nganCua("A") || "ngan A khong mo",
					trangThaiKhoi() === "mo" || `khoi ${trangThaiKhoi()}`,
					(document.activeElement !== null &&
						document.activeElement === oGiaTri()) ||
						"con tro khong o o gia tri",
					daCuon.some((e) => khoi !== null && e.contains(khoi)) ||
						"khong cuon toi khoi",
					goiCua("okr.moCapNhat")[0]?.vao?.entry === loiVao ||
						`entry ${goiCua("okr.moCapNhat")[0]?.vao?.entry}`,
					loiVao !== "hop-tuan" ||
						(san.url().get("thuTuKr") !== null &&
							qs("[data-dau-ngan-kr] [data-thu-tu-kr]") !== null) ||
						"hop tuan mat thu tu bang",
				].filter((x) => x !== true);
				if (sai.length > 0) {
					const dong = `cnk-loi-vao: ${loiVao} ${sai.join(", ")}`;
					console.log(dong);
					loi.push(dong);
				} else dem += 1;
				await thaoHet();
			}
		} finally {
			HTMLElement.prototype.scrollIntoView = cuonCu;
		}
		console.log(`cnk-loi-vao: ${dem}/3`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(3);
	});
});
