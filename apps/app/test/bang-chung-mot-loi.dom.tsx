import {
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	setSystemTime,
	test,
} from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { OKR_CANH_KR } from "@crm/validation/okr-canh-kr";
import { useQueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { useState } from "react";
import { chuoiMoiLan } from "../../api/src/okr/dien-bien";
import {
	type BangChungDong,
	canhKrOutput,
} from "../../api/src/okr/okr-canh-kr.contracts";
import {
	dienBienOutput,
	lichSuKrOutput,
} from "../../api/src/okr/okr-xem.contracts";
import {
	bamChuot,
	bamPhim,
	chiTietTu,
	cho,
	datLai,
	dung,
	goChu,
	goiCua,
	HUNG,
	kho,
	kr,
	LoiTrpc,
	mucTieu,
	nhip,
	qs,
	qsa,
	type San,
	thaoHet,
	ui,
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
const { DongDinhBangChung } = await import(
	"@/components/crm/record-sheet/dong-dinh-bang-chung"
);
const { okrCanhKrMessages } = await import("@/lib/messages/okr-canh-kr");

const M = okrCanhKrMessages("vi");
const MB = M.bangChung;
const HOI_BO = ui.dialog.boThayDoi;
const URL_DUNG = "https://drive.google.com/bb";
const URL_SAI = "drive.google.com/bb";
const MIEN = "drive.google.com";
const KR_MOC = "kr-moc";
const KR_KE = "kr-ke";
const THU_NAM = new Date("2026-10-29T03:00:00.000Z");
const TUAN_KY = [
	"2026-09-28",
	"2026-10-05",
	"2026-10-12",
	"2026-10-19",
	"2026-10-26",
	"2026-11-02",
	"2026-11-09",
];

type LoiDinh = "may-chu" | "mat-mang" | null;
type TrangKho = {
	xong: boolean;
	suaDuoc: boolean;
	khoa: boolean;
	choDuyet: boolean;
	bangChung: BangChungDong[];
	lamMoi: boolean;
	loi: LoiDinh;
};
type VaoDinh = { keyResultId: string; url: string; ghiChu: string };
type MucGui = { value: number; bangChung?: { url: string; ghiChu: string } };

const bcCu = (): BangChungDong => ({
	id: "bc-cu",
	url: "https://docs.example.test/bien-ban",
	ghiChu: "",
	nguoiDinh: { id: HUNG.id, name: HUNG.name },
	dinhLuc: "2026-10-20T03:00:00.000Z",
});

const trangMoi = (): TrangKho => ({
	xong: true,
	suaDuoc: true,
	khoa: false,
	choDuyet: false,
	bangChung: [],
	lamMoi: true,
	loi: null,
});
let trang: TrangKho = trangMoi();

function chiTiet() {
	const ds = [
		kr(KR_MOC, "mt-1", {
			title: "Ký hợp đồng khung",
			kind: "moc",
			unit: "",
			startValue: 0,
			targetValue: 1,
			currentValue: trang.xong ? 1 : 0,
			hienTaiQuaCapNhat: true,
			laCuaToi: true,
		}),
		kr(KR_KE, "mt-1", { title: "KR kế", laCuaToi: true }),
	];
	return chiTietTu(mucTieu("mt-1", ds, { canEdit: true }), {
		canEditKr: ds.map((k) => k.id),
		kyGhiDuoc: true,
	});
}

function lichSu(id: string) {
	const laMoc = id === KR_MOC;
	const kieu = laMoc ? "moc" : "tang-toi";
	return lichSuKrOutput.parse({
		kieu,
		tieuDe: id,
		dich: laMoc ? 1 : 50,
		donVi: laMoc ? "" : "khách",
		coCapNhat: false,
		lan: [],
		chuoi: chuoiMoiLan(
			{
				id,
				thuTu: 0,
				khoaLuc: null,
				kieu,
				khoi: 0,
				dich: laMoc ? 1 : 50,
				lan: [],
			},
			TUAN_KY,
			new Date(),
			() => null,
		),
	});
}

function canh(id: string) {
	const laMoc = id === KR_MOC;
	return canhKrOutput.parse({
		kr: {
			id,
			title: laMoc ? "Ký hợp đồng khung" : "KR kế",
			kind: laMoc ? "moc" : "tang-toi",
			objectiveId: "mt-1",
			ownerName: HUNG.name,
			xong: laMoc ? trang.xong : false,
		},
		dong: [],
		bangChung: laMoc ? trang.bangChung : [],
		quyen: { suaDuoc: trang.suaDuoc, ganDuoc: false },
		khoa: trang.khoa,
		choDuyet: trang.choDuyet,
	});
}

function loiMayChu() {
	return new TRPCClientError("SERVER_MSG_XYZ", {
		result: {
			error: {
				code: -32600,
				message: "SERVER_MSG_XYZ",
				data: { code: "BAD_REQUEST", httpStatus: 400 },
			},
		},
	});
}

function datKho(): void {
	kho.rieng.set("okr.objective", () => chiTiet());
	kho.rieng.set("okr.lichSuKr", (vao) => lichSu(String(vao?.keyResultId)));
	kho.rieng.set("okr.canhKr", (vao) => {
		const id = String(vao?.keyResultId ?? "");
		if (id !== KR_MOC && id !== KR_KE)
			throw new LoiTrpc("NOT_FOUND", `khong co ${id}`);
		return canh(id);
	});
	kho.rieng.set("okr.dienBien", () =>
		dienBienOutput.parse({
			kieu: "tang-toi",
			tieuDe: "KR",
			khoi: 0,
			dich: 50,
			donVi: "khách",
			coCapNhat: false,
			tuanDau: null,
			diem: [],
		}),
	);
	kho.ghiRieng.set("okr.themBangChung", async (vao) => {
		if (trang.loi === "may-chu") throw loiMayChu();
		if (trang.loi === "mat-mang") throw new TypeError("Failed to fetch");
		if (trang.lamMoi)
			trang.bangChung = [
				...trang.bangChung,
				{
					id: `bc-${trang.bangChung.length + 1}`,
					url: String(vao?.url),
					ghiChu: String(vao?.ghiChu ?? ""),
					nguoiDinh: { id: HUNG.id, name: HUNG.name },
					dinhLuc: new Date().toISOString(),
				},
			];
		return { ok: true };
	});
	kho.ghiRieng.set("okr.guiCapNhat", async () => ({ ok: true }));
}

const HOP = "[data-hop-dinh-bang-chung]";
const KHOI = "[data-khoi-cap-nhat-kr]";
const O_BC = "[data-o-duong-dan-bang-chung]";
const hop = () => qs(HOP);
const oUrl = () => qs<HTMLInputElement>(`${HOP} input[type="url"]`);
const oGhiChu = () => qs<HTMLTextAreaElement>(`${HOP} textarea`);
const nutDinh = () => qs<HTMLButtonElement>(`${HOP} [data-nut="dinh"]`);
const nutMo = () => qs<HTMLButtonElement>('[data-nut="dinh-bang-chung"]');
const nutHuy = () =>
	qsa(`${HOP} button`).find((b) => b.textContent?.trim() === MB.hop.huy) ??
	null;
const nganCua = (id: string) => qs(`[data-kr-sheet="${id}"]`) !== null;
const soLop = () => qsa('[role="dialog"]').length;
const hopHoi = () =>
	qsa("[role=alertdialog]").find((h) =>
		h.textContent?.includes(HOI_BO.tieuDe),
	) ?? null;
const coMoi = () => qs(`[data-bang-chung] [data-ten-mien="${MIEN}"]`) !== null;
const loiDuoi = (goc: string) =>
	qs(`${goc} [data-slot="field-error"]`)?.textContent ?? null;
const vaoDinh = () =>
	goiCua("okr.themBangChung").map((g) => g.vao as VaoDinh | undefined);
const mucGuiDi = () =>
	goiCua("okr.guiCapNhat").map(
		(g) => (g.vao?.items as MucGui[] | undefined)?.[0],
	);
const nutTrong = (sel: string, chu: string) =>
	qsa(`${sel} button`).find((b) => b.textContent?.trim() === chu) ?? null;

async function bam(o: Element | null, moTa: string): Promise<void> {
	if (!o) throw new Error(`khong co ${moTa}`);
	await bamChuot(o);
}

async function moNgan(id = KR_MOC, tab = "&tab=bang-chung"): Promise<San> {
	const san = await dung(
		<RecordSheetHost />,
		`?record=objective:mt-1,kr:${id}${tab}`,
	);
	await cho(() => nganCua(id), `ngan ${id}`);
	await cho(() => qs(KHOI) !== null, `khoi ${id}`);
	if (id === KR_MOC && tab !== "")
		await cho(
			() => qs("[data-trang-thai^='ST-bangchung']") !== null,
			"phan bang chung",
		);
	return san;
}

async function moDong(): Promise<void> {
	await bam(nutMo(), "nut dinh bang chung");
	await cho(() => hop() !== null && oUrl() !== null, "dong nhap");
}

async function goUrl(chu: string): Promise<void> {
	const o = oUrl();
	if (!o) throw new Error("khong co o duong dan");
	await goChu(o, chu, true);
}

beforeEach(() => {
	datLai();
	trang = trangMoi();
	setSystemTime(THU_NAM);
	datKho();
});
afterEach(async () => {
	await thaoHet();
	setSystemTime();
});

async function doMoDong(): Promise<string[]> {
	await moNgan();
	const truoc = soLop();
	await moDong();
	const phan = qs("[data-trang-thai^='ST-bangchung']");
	return [
		(phan?.contains(hop()) ?? false) || "dong nhap khong nam trong Bang chung",
		document.activeElement === oUrl() ||
			`tieu diem o ${document.activeElement?.tagName}`,
		soLop() === truoc || `lop chong ${truoc} -> ${soLop()}`,
	].filter((x): x is string => x !== true);
}

function BanSaoHopThoai() {
	const [mo, setMo] = useState(false);
	return (
		<>
			<Button data-nut="dinh-bang-chung" onClick={() => setMo(true)}>
				{MB.dinh}
			</Button>
			<Dialog open={mo} onOpenChange={setMo}>
				<DialogContent>
					<DialogTitle>{MB.dinh}</DialogTitle>
					<DialogDescription>{MB.rong.moTa}</DialogDescription>
					<DongDinhBangChung
						onDinh={async () => {}}
						dong={() => setMo(false)}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}

describe("E1 mo-dong-nhap", () => {
	test("mo-dong-nhap: co bang chung, dong nhap cuoi danh sach, tieu diem o duong dan, khong them lop chong", async () => {
		trang.bangChung = [bcCu()];
		const loi = await doMoDong();
		const ds = qsa("[data-bang-chung]");
		const cuoi = ds.at(-1);
		if (
			!cuoi ||
			(cuoi.compareDocumentPosition(hop() as Node) &
				Node.DOCUMENT_POSITION_FOLLOWING) ===
				0
		)
			loi.push("dong nhap khong o cuoi danh sach");
		expect(loi.join("\n")).toBe("");
	});

	test("mo-dong-nhap-rong: chua co bang chung, dong nhap thay khoi rong", async () => {
		const loi = await doMoDong();
		if (qs("[data-slot='empty']") !== null && qs(HOP) === null)
			loi.push("khoi rong con");
		expect(loi.join("\n")).toBe("");
	});

	test("mo-dong-nhap doi-chung: ban sao dung lai HopThoaiDinh bang Dialog thi lop chong +1", async () => {
		await dung(<BanSaoHopThoai />);
		const truoc = soLop();
		await bam(nutMo(), "nut ban sao");
		await cho(() => hop() !== null, "dong nhap trong hop thoai");
		const tang = soLop() - truoc;
		console.log(`lop chong +${tang}`);
		expect(tang).toBe(1);
	});
});

type CachKet = "enter" | "nut" | "ctrl-enter";

async function ketDongNhap(cach: CachKet, ghiChu: string): Promise<string[]> {
	await moNgan();
	await moDong();
	await goUrl(URL_DUNG);
	const oGc = oGhiChu();
	if (ghiChu !== "" && oGc) await goChu(oGc, ghiChu);
	if (cach === "enter") await bamPhim(oUrl() as HTMLElement, "{Enter}");
	else if (cach === "nut") await bam(nutDinh(), "nut dinh");
	else if (oGc) await bamPhim(oGc, "{Control>}{Enter}{/Control}");
	await cho(() => hop() === null, "dong nhap dong").catch(() => {});
	await cho(coMoi, "bang chung moi").catch(() => {});
	const goi = vaoDinh();
	const mong: VaoDinh[] = [{ keyResultId: KR_MOC, url: URL_DUNG, ghiChu }];
	return [
		JSON.stringify(goi) === JSON.stringify(mong) ||
			`goi ${JSON.stringify(goi)}`,
		hop() === null || "dong nhap con mo",
		nganCua(KR_MOC) || "ngan dong",
		coMoi() || "khong hien bang chung moi",
	].filter((x): x is string => x !== true);
}

describe("E2 dinh", () => {
	test("dinh-enter: Enter o o duong dan dinh, dong nhap dong, bang chung moi hien", async () => {
		expect((await ketDongNhap("enter", "")).join("\n")).toBe("");
	});
	test("dinh-nut: bam Dinh gui ca ghi chu", async () => {
		expect((await ketDongNhap("nut", "biên bản ký 30/10")).join("\n")).toBe("");
	});
	test("dinh-ctrl-enter: Ctrl+Enter o o ghi chu dinh", async () => {
		expect((await ketDongNhap("ctrl-enter", "hợp đồng đã ký")).join("\n")).toBe(
			"",
		);
	});
	test("dinh doi-chung: may chu gia khong lam moi okr.canhKr thi khong hien bang chung moi", async () => {
		trang.lamMoi = false;
		const loi = await ketDongNhap("enter", "");
		console.log(`dinh doi-chung: ${loi.join(", ")}`);
		expect(loi).toEqual(["khong hien bang chung moi"]);
	});
});

async function huyDongNhap(cach: "esc" | "nut"): Promise<string[]> {
	await moNgan();
	await moDong();
	await goUrl(URL_DUNG);
	if (cach === "esc") await bamPhim(oUrl() as HTMLElement, "{Escape}");
	else await bam(nutHuy(), "nut huy");
	await cho(() => hop() === null, "dong nhap dong").catch(() => {});
	await nhip(2);
	return [
		vaoDinh().length === 0 || `goi ${vaoDinh().length}`,
		hop() === null || "dong nhap con",
		nganCua(KR_MOC) || "ngan dong",
		hopHoi() === null || "co cau hoi bo nhap",
	].filter((x): x is string => x !== true);
}

const nutDong = () => qs('[data-slot="sheet-close"]');
const nutKe = () => qs('[data-dau-ngan-kr] [data-nut="kr-ke"]');

describe("E3 huy va giu nhap", () => {
	test("huy-esc: Esc dong dong nhap, khong goi, khong hoi", async () => {
		expect((await huyDongNhap("esc")).join("\n")).toBe("");
	});
	test("huy-nut: bam Huy dong dong nhap, khong goi, khong hoi", async () => {
		expect((await huyDongNhap("nut")).join("\n")).toBe("");
	});
	test("giu-nhap: go do roi dong ngan thi hoi bo nhap, ngan chua dong", async () => {
		await moNgan();
		await moDong();
		await goUrl("https://drive.google");
		await bam(nutDong(), "nut dong ngan");
		await cho(() => hopHoi() !== null, "hoi bo nhap").catch(() => {});
		expect(hopHoi() !== null).toBe(true);
		expect(nganCua(KR_MOC)).toBe(true);
	});
	test("giu-nhap-chuyen-kr: go do roi bam KR ke thi hoi, KR dang mo chua doi", async () => {
		const san = await moNgan();
		await moDong();
		await goUrl("https://drive.google");
		await bam(nutKe(), "nut KR ke");
		await cho(() => hopHoi() !== null, "hoi bo nhap").catch(() => {});
		expect(hopHoi() !== null).toBe(true);
		expect(nganCua(KR_MOC)).toBe(true);
		expect(san.url().get("record")?.endsWith(`kr:${KR_MOC}`)).toBe(true);
	});
	test("giu-nhap doi-chung: dong nhap chua go thi dong ngan va bam KR ke deu khong hoi", async () => {
		await moNgan();
		await moDong();
		await bam(nutDong(), "nut dong ngan");
		await cho(() => !nganCua(KR_MOC), "ngan dong").catch(() => {});
		const dongDuoc = !nganCua(KR_MOC) && hopHoi() === null;
		await thaoHet();

		datLai();
		datKho();
		await moNgan();
		await moDong();
		await bam(nutKe(), "nut KR ke");
		await cho(() => nganCua(KR_KE), "ngan KR ke").catch(() => {});
		const sangDuoc = nganCua(KR_KE) && hopHoi() === null;
		expect({ dongDuoc, sangDuoc }).toEqual({ dongDuoc: true, sangDuoc: true });
	});
});

describe("E4 loi", () => {
	test("url-sai: duong dan khong http thi bao loi, Dinh khoa, Enter khong goi", async () => {
		await moNgan();
		await moDong();
		await goUrl(URL_SAI);
		await bamPhim(oUrl() as HTMLElement, "{Enter}");
		expect({
			loi: loiDuoi(`${HOP} ${O_BC}`),
			khoa: nutDinh()?.disabled,
			goi: vaoDinh().length,
		}).toEqual({ loi: MB.loiDuongDan, khoa: true, goi: 0 });
	});

	test("ghi-chu-dai: ghi chu max+1 ky tu thi bao loiGhiChu, khong goi", async () => {
		await moNgan();
		await moDong();
		await goUrl(URL_DUNG);
		const oGc = oGhiChu();
		if (!oGc) throw new Error("khong co o ghi chu");
		await goChu(oGc, "a".repeat(OKR_CANH_KR.ghiChu.max + 1));
		await bamPhim(oGc, "{Control>}{Enter}{/Control}");
		await bam(nutDinh(), "nut dinh");
		const field = oGc.closest('[data-slot="field"]');
		expect({
			loi: field?.querySelector('[data-slot="field-error"]')?.textContent,
			goi: vaoDinh().length,
		}).toEqual({
			loi: MB.loiGhiChu.replace("{max}", String(OKR_CANH_KR.ghiChu.max)),
			goi: 0,
		});
	});

	for (const [ten, loai] of [
		["may-chu-tu-choi", "may-chu"],
		["mat-mang", "mat-mang"],
	] as const) {
		test(`${ten}: bao loiDinh duoi o duong dan, giu nhap, khong lo cau may chu`, async () => {
			trang.loi = loai;
			await moNgan();
			await moDong();
			await goUrl(URL_DUNG);
			await bam(nutDinh(), "nut dinh");
			await cho(() => loiDuoi(`${HOP} ${O_BC}`) !== null, "bao loi").catch(
				() => {},
			);
			expect({
				goi: vaoDinh().length,
				loi: loiDuoi(`${HOP} ${O_BC}`),
				mo: hop() !== null,
				giaTri: oUrl()?.value,
				lo: document.body.textContent?.includes("SERVER_MSG_XYZ"),
			}).toEqual({
				goi: 1,
				loi: "Chưa đính được bằng chứng. Thử lại sau một lát.",
				mo: true,
				giaTri: URL_DUNG,
				lo: false,
			});
		});
	}
});

async function chonXong(): Promise<void> {
	await bam(nutTrong(`${KHOI} [data-o="gia-tri"]`, "Xong"), "Xong");
	await cho(() => qs(`${KHOI} ${O_BC}`) !== null, "o bang chung khoi");
}

async function chonTuTin(): Promise<void> {
	await bam(nutTrong(`${KHOI} [data-o="tu-tin"]`, "Cao"), "tu tin Cao");
}

const oUrlKhoi = () => qs<HTMLInputElement>(`${KHOI} ${O_BC} input`);
const nutGui = () =>
	qs<HTMLButtonElement>(`${KHOI} [data-nut="gui-cap-nhat-kr"]`);

function tepCoDau(goc: string): string[] {
	return readdirSync(goc, { recursive: true })
		.map(String)
		.filter((p) => p.endsWith(".tsx"))
		.filter((p) =>
			readFileSync(join(goc, p), "utf8").includes(
				"data-o-duong-dan-bang-chung",
			),
		)
		.map((p) => join(goc, p));
}

describe("E5 cung o", () => {
	test("cung-o: khoi cap nhat KR moc chon Xong dung chinh ODuongDanBangChung cua dong nhap", async () => {
		await moNgan();
		await moDong();
		await chonXong();
		const trongKhoi = qsa(`${KHOI} ${O_BC}`);
		const chu = (goc: string) => ({
			nhan: qs(`${goc} ${O_BC} label`)?.textContent,
			goiY: qs(`${goc} ${O_BC} [data-slot="field-description"]`)?.textContent,
		});
		const truocKhoi = chu(KHOI);
		const truocDong = chu(HOP);
		const oK = oUrlKhoi();
		if (!oK) throw new Error("khong co o khoi");
		await goChu(oK, URL_SAI);
		await goUrl(URL_SAI);
		const goc = join(import.meta.dir, "..");
		const tep = [
			...tepCoDau(join(goc, "components")),
			...tepCoDau(join(goc, "app")),
		].map((p) => p.slice(goc.length + 1));
		expect({
			soO: trongKhoi.length,
			nhan: truocKhoi.nhan,
			goiY: truocKhoi.goiY,
			loi: loiDuoi(`${KHOI} ${O_BC}`),
			tep,
		}).toEqual({
			soO: 1,
			nhan: truocDong.nhan,
			goiY: truocDong.goiY,
			loi: loiDuoi(`${HOP} ${O_BC}`),
			tep: ["components/crm/record-sheet/o-duong-dan-bang-chung.tsx"],
		});
		expect(truocKhoi.nhan).toBe(M.capNhat.bangChung);
		expect(truocKhoi.goiY).toBe(M.capNhat.goiY);
		expect(loiDuoi(`${KHOI} ${O_BC}`)).toBe(MB.loiDuongDan);
	});

	test("gui-kem-bang-chung: gui cap nhat moc kem duong dan hop le; duong dan sai thi khong gui", async () => {
		await moNgan(KR_MOC, "");
		await chonXong();
		const oK = oUrlKhoi();
		if (!oK) throw new Error("khong co o khoi");
		await goChu(oK, URL_SAI);
		await chonTuTin();
		const khoaKhiSai = nutGui()?.disabled;
		await bamPhim(oK, "{Control>}{Enter}{/Control}");
		const goiKhiSai = mucGuiDi().length;
		await goChu(oK, URL_DUNG, true);
		await bam(nutGui(), "nut gui");
		await cho(() => mucGuiDi().length > 0, "goi gui").catch(() => {});
		expect({ khoaKhiSai, goiKhiSai, muc: mucGuiDi() }).toEqual({
			khoaKhiSai: true,
			goiKhiSai: 0,
			muc: [
				expect.objectContaining({
					value: 1,
					bangChung: { url: URL_DUNG, ghiChu: "" },
				}),
			],
		});
	});
});

describe("E6 quyen", () => {
	for (const [ten, doi] of [
		["khong-quyen", { suaDuoc: false }],
		["khoa", { khoa: true }],
		["cho-duyet", { choDuyet: true }],
	] as const) {
		test(`${ten}: khong co nut Dinh bang chung, khong co dong nhap`, async () => {
			trang = { ...trang, ...doi };
			await moNgan();
			expect({ nut: nutMo() !== null, hop: hop() !== null }).toEqual({
				nut: false,
				hop: false,
			});
		});
	}

	test("chua-xong: moc chua xong thi nut co mat nhung khoa, cau vi sao hien", async () => {
		trang.xong = false;
		await moNgan();
		expect({
			nut: nutMo() !== null,
			khoa: nutMo()?.disabled,
			cau: document.body.textContent?.includes(MB.rong.moTaChuaXong),
		}).toEqual({ nut: true, khoa: true, cau: true });
	});

	test("quyen doi-chung: sua duoc, moc xong thi nut bat", async () => {
		await moNgan();
		expect({ nut: nutMo() !== null, khoa: nutMo()?.disabled }).toEqual({
			nut: true,
			khoa: false,
		});
	});
});

async function ketCapNhat(o: string): Promise<void> {
	await moNgan(KR_MOC, "");
	await chonXong();
	const oK = oUrlKhoi();
	if (!oK) throw new Error("khong co o khoi");
	await goChu(oK, o === "gui-url-sai" ? URL_SAI : URL_DUNG);
	await chonTuTin();
	if (o === "bo-xong")
		await bam(nutTrong(`${KHOI} [data-o="gia-tri"]`, "Chưa xong"), "Chua xong");
	if (o === "esc-dong-khoi") {
		await bamPhim(oK, "{Escape}");
		const thu = qs(`${KHOI} button[aria-label="${M.khoiCapNhat.thu}"]`);
		if (thu) await bam(thu, "nut thu khoi");
		await nhip(4);
		return;
	}
	const nut = nutGui();
	if (nut && !nut.disabled) await bam(nut, "nut gui");
	else await bamPhim(oK, "{Control>}{Enter}{/Control}");
	await cho(() => mucGuiDi().length > 0, "goi gui").catch(() => {});
}

const KET_DONG: [string, "enter" | "nut" | "ctrl-enter" | "esc" | "huy"][] = [
	["dong-nhap-enter", "enter"],
	["dong-nhap-nut", "nut"],
	["dong-nhap-ctrl-enter", "ctrl-enter"],
	["dong-nhap-esc", "esc"],
	["dong-nhap-huy", "huy"],
];

describe("E12 ma tran ket", () => {
	for (const [ten, cach] of KET_DONG) {
		test(`ket: ${ten}`, async () => {
			if (cach === "esc" || cach === "huy")
				await huyDongNhap(cach === "esc" ? "esc" : "nut");
			else await ketDongNhap(cach, "");
			const mong =
				cach === "esc" || cach === "huy"
					? []
					: [{ keyResultId: KR_MOC, url: URL_DUNG, ghiChu: "" }];
			expect({ them: vaoDinh(), gui: mucGuiDi() }).toEqual({
				them: mong,
				gui: [],
			});
		});
	}

	test("ket: cap-nhat-moc-gui", async () => {
		await ketCapNhat("gui");
		expect({ them: vaoDinh(), gui: mucGuiDi() }).toEqual({
			them: [],
			gui: [
				expect.objectContaining({
					value: 1,
					bangChung: { url: URL_DUNG, ghiChu: "" },
				}),
			],
		});
	});

	test("ket: cap-nhat-moc-gui-url-sai", async () => {
		await ketCapNhat("gui-url-sai");
		expect({ them: vaoDinh(), gui: mucGuiDi() }).toEqual({ them: [], gui: [] });
	});

	test("ket: cap-nhat-moc-bo-xong", async () => {
		await ketCapNhat("bo-xong");
		const gui = mucGuiDi();
		expect({
			them: vaoDinh(),
			so: gui.length,
			value: gui[0]?.value,
			bangChung: gui[0]?.bangChung,
		}).toEqual({ them: [], so: 1, value: 0, bangChung: undefined });
	});

	test("ket: cap-nhat-moc-esc-dong-khoi", async () => {
		await ketCapNhat("esc-dong-khoi");
		expect({ them: vaoDinh(), gui: mucGuiDi() }).toEqual({ them: [], gui: [] });
	});
});
