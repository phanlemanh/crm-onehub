import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { act } from "react";
import type { ObjectiveOutput } from "../../api/src/okr/okr.contracts";
import { canhKrOutput } from "../../api/src/okr/okr-canh-kr.contracts";
import {
	dienBienOutput,
	hopTuanOutput,
} from "../../api/src/okr/okr-xem.contracts";
import {
	chiTietTu,
	cho,
	datLai,
	dung,
	kho,
	kr,
	LoiTrpc,
	mucTieu,
	nguoiDung,
	qs,
	qsa,
	type San,
	thaoHet,
} from "./khung-gop-y-dung-cho";

type HopTuanOutput = ReturnType<typeof hopTuanOutput.parse>;
type DongVao = { id: string; objectiveId?: string };

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
mock.module("@/components/crm/stage-change", () => ({
	CloseReasonDialog: () => null,
	DealStageMenu: () => null,
}));
mock.module("@/components/crm/fields/fields-sheet", () => ({
	FieldsSheetHost: () => null,
}));

const { HopTuan } = await import("@/app/(app)/[slug]/okr/hop-tuan");
const { RecordSheetHost } = await import(
	"@/components/crm/record-sheet/record-sheet-host"
);
const { khoaThuTuHop } = await import(
	"@/components/crm/record-sheet/thu-tu-hop-tuan"
);
const { crmMessages } = await import("@/lib/messages/crm");
const { okrCanhKrMessages } = await import("@/lib/messages/okr-canh-kr");

const DON = { loai: "bp", id: "bp-1" } as const;
const KHOA_BANG = khoaThuTuHop("q4", DON);
const QUAY_LAI = crmMessages("vi").sheet.back;
const VE_MUC_TIEU = okrCanhKrMessages("vi").khung.khongCo.veMucTieu;

const MT_MAU = [
	{ id: "mt-1", kr: ["A", "C", "D", "E"] },
	{ id: "mt-2", kr: ["B"] },
];

function dongHop(v: DongVao) {
	return {
		keyResultId: v.id,
		objectiveId: v.objectiveId ?? "mt-1",
		tieuDe: `KR ${v.id}`,
		mucTieu: "Mục tiêu chung",
		chuTen: "Nguyễn Thị Lan",
		progress: 40,
		expected: 50,
		laMoc: false,
		tuTin: "vua",
		ghiChu: `ghi chu ${v.id}`,
		ghiChuNgay: "2026-10-20",
		donVi: "đại lý",
		giaTriMoi: 12,
		mucDoi: { tu: 9, den: 12, ngayTruoc: "2026-10-13" },
		lyDo: [{ loai: "ghi-chu", ngay: "2026-10-20" }],
		checkInId: null,
		camXuc: [],
	};
}

const BANG = (): HopTuanOutput =>
	hopTuanOutput.parse({
		tuan: "2026-10-19",
		tuanDau: false,
		daCapNhat: 3,
		tongKr: 5,
		dangBan: [{ id: "A" }, { id: "B", objectiveId: "mt-2" }, { id: "C" }].map(
			dongHop,
		),
		conLai: [{ id: "D" }, { id: "E" }].map(dongHop),
	});

function chiTietCua(id: string): ObjectiveOutput {
	const m = MT_MAU.find((x) => x.id === id);
	if (!m) throw new LoiTrpc("NOT_FOUND", `khong co ${id}`);
	const ds = m.kr.map((k) =>
		kr(k, id, { title: `KR ${k}`, hienTaiQuaCapNhat: true, laCuaToi: true }),
	);
	return chiTietTu(mucTieu(id, ds, { canEdit: true }), {
		canEditKr: ds.map((k) => k.id),
	});
}

function mtCuaKr(k: string): string {
	return MT_MAU.find((m) => m.kr.includes(k))?.id ?? "mt-1";
}

function datKho(khongThay: string[] = []): void {
	kho.rieng.set("okr.hopTuan", () => BANG());
	kho.rieng.set("okr.objective", (vao) => chiTietCua(String(vao?.id ?? "")));
	kho.rieng.set("okr.canhKr", (vao) => {
		const id = String(vao?.keyResultId ?? "");
		if (khongThay.includes(id))
			throw new LoiTrpc("NOT_FOUND", `khong co ${id}`);
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
}

async function dungHop(thamSo = ""): Promise<San> {
	const san = await dung(
		<>
			<HopTuan cycleId="q4" unit={DON} />
			<RecordSheetHost />
		</>,
		thamSo,
	);
	await cho(() => qs("[data-kr-hop]") !== null, "bang hop tuan dung");
	return san;
}

const record = (san: San) => san.url().get("record");
const demKr = () => qs("[data-dau-ngan-kr] [data-dem-kr]")?.textContent ?? null;
const nganCua = (id: string) => qs(`[data-kr-sheet="${id}"]`) !== null;
const khungMo = () => qs("[data-okr-sheet]")?.getAttribute("data-okr-sheet");
const nutNgan = (nut: "kr-truoc" | "kr-ke") =>
	qs<HTMLButtonElement>(`[data-dau-ngan-kr] [data-nut="${nut}"]`);
const nutQuayLai = () =>
	qsa("[data-kr-sheet] button").find(
		(b) => b.textContent?.trim() === QUAY_LAI,
	) ?? null;

async function bam(o: Element | null, moTa: string): Promise<void> {
	if (!o) throw new Error(`khong co ${moTa}`);
	await act(async () => {
		await nguoiDung().click(o);
	});
}

async function moNganTuBang(san: San, id: string): Promise<void> {
	await bam(qs(`[data-kr-hop="${id}"] [data-mo-kr="${id}"]`), `ten ${id}`);
	await cho(() => nganCua(id) && demKr() !== null, `ngan ${id}`);
	await cho(
		() => record(san)?.startsWith("objective:") === true,
		`lot muc tieu duoi ${id}`,
	);
}

async function sang(
	san: San,
	huong: "kr-truoc" | "kr-ke",
	id: string,
): Promise<string | null> {
	await bam(nutNgan(huong), huong);
	await cho(() => nganCua(id) && demKr() !== null, `ngan ${id}`);
	return record(san);
}

async function quayLai(): Promise<string | null | undefined> {
	await bam(nutQuayLai(), "nut quay lai");
	await cho(() => khungMo() != null, "khung muc tieu");
	return khungMo();
}

beforeEach(() => {
	datLai();
	datKho();
});
afterEach(async () => {
	await thaoHet();
});

describe("vkm-qua-muc-tieu", () => {
	test("vkm-qua-muc-tieu: › sang KR cua muc tieu khac, quay lai mo muc tieu cua KR dang xem", async () => {
		const loi: string[] = [];
		let dem = 0;
		const san = await dungHop();
		await moNganTuBang(san, "A");
		const thuTu = san.url().get("thuTuKr");
		if (record(san) !== "objective:mt-1,kr:A" || demKr() !== "1/5" || !thuTu)
			loi.push(
				`vkm-qua-muc-tieu: doi chung truoc › record ${record(san)} dem ${demKr()} thuTuKr ${thuTu}`,
			);
		const sau = await sang(san, "kr-ke", "B");
		if (sau !== "objective:mt-2,kr:B")
			loi.push(`vkm-qua-muc-tieu: record sau › ${sau} can objective:mt-2,kr:B`);
		dem += 1;
		if (san.url().get("thuTuKr") !== thuTu || demKr() !== "2/5")
			loi.push(
				`vkm-qua-muc-tieu: thuTuKr ${san.url().get("thuTuKr")} dem ${demKr()} sau ›`,
			);
		dem += 1;
		const khung = await quayLai();
		if (khung !== "mt-2" || record(san) !== "objective:mt-2")
			loi.push(
				`vkm-qua-muc-tieu: quay lai mo ${khung} record ${record(san)} can mt-2`,
			);
		dem += 1;
		console.log(`vkm-qua-muc-tieu: ${dem}/3`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(3);
	});
});

describe("vkm-lui", () => {
	test("vkm-lui: ‹ ve KR muc tieu cu, nhieu buoc giu tang duoi dung", async () => {
		const loi: string[] = [];
		let dem = 0;
		const san = await dungHop();
		await moNganTuBang(san, "A");
		const sangB = await sang(san, "kr-ke", "B");
		if (sangB !== "objective:mt-2,kr:B")
			loi.push(`vkm-lui: doi chung sau › ${sangB}`);
		const ve = await sang(san, "kr-truoc", "A");
		if (ve !== "objective:mt-1,kr:A")
			loi.push(`vkm-lui: record sau ‹ ${ve} can objective:mt-1,kr:A`);
		dem += 1;
		await sang(san, "kr-ke", "B");
		const toiC = await sang(san, "kr-ke", "C");
		if (toiC !== "objective:mt-1,kr:C")
			loi.push(`vkm-lui: record sau › › ${toiC} can objective:mt-1,kr:C`);
		dem += 1;
		const khung = await quayLai();
		if (khung !== "mt-1" || record(san) !== "objective:mt-1")
			loi.push(`vkm-lui: quay lai tu C mo ${khung} record ${record(san)}`);
		dem += 1;
		console.log(`vkm-lui: ${dem}/3`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(3);
	});
});

describe("vkm-lien-ket", () => {
	test("vkm-lien-ket: lien ket ten muc tieu va nut Ve khung muc tieu sau › ve muc tieu cua KR dang xem", async () => {
		const loi: string[] = [];
		let dem = 0;
		const san = await dungHop();
		await moNganTuBang(san, "A");
		await sang(san, "kr-ke", "B");
		await cho(
			() => qs('[data-lien-ket-muc-tieu="mt-2"]') !== null,
			"lien ket muc tieu mt-2",
		).catch(() => {});
		const lienKet = qs("[data-lien-ket-muc-tieu]");
		if (lienKet?.getAttribute("data-lien-ket-muc-tieu") !== "mt-2")
			loi.push(
				`vkm-lien-ket: lien ket tro ${lienKet?.getAttribute("data-lien-ket-muc-tieu")} can mt-2`,
			);
		dem += 1;
		await bam(lienKet, "lien ket muc tieu");
		await cho(() => khungMo() != null, "khung sau lien ket");
		if (khungMo() !== "mt-2" || record(san) !== "objective:mt-2")
			loi.push(
				`vkm-lien-ket: record sau lien ket ${record(san)} can objective:mt-2 (khung ${khungMo()})`,
			);
		dem += 1;
		await thaoHet();

		datLai();
		datKho(["B"]);
		const san2 = await dungHop();
		await moNganTuBang(san2, "A");
		await bam(nutNgan("kr-ke"), "kr-ke");
		const nutVe = () => qs<HTMLButtonElement>('[data-nut="ve-muc-tieu"]');
		await cho(() => nutVe() !== null, "nut Ve khung muc tieu");
		if (nutVe()?.textContent?.trim() !== VE_MUC_TIEU)
			loi.push(
				`vkm-lien-ket: doi chung nut khong thay KR chu «${nutVe()?.textContent?.trim()}»`,
			);
		await bam(nutVe(), "nut Ve khung muc tieu");
		await cho(() => khungMo() != null, "khung sau Ve khung muc tieu");
		if (khungMo() !== "mt-2" || record(san2) !== "objective:mt-2")
			loi.push(
				`vkm-lien-ket: ve muc tieu khi khong tai mo ${khungMo()} record ${record(san2)}`,
			);
		dem += 1;
		console.log(`vkm-lien-ket: ${dem}/3`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(3);
	});
});

describe("vkm-cung-muc-tieu", () => {
	test("vkm-cung-muc-tieu: › trong cung muc tieu giu tang duoi", async () => {
		const loi: string[] = [];
		let dem = 0;
		const san = await dungHop();
		await moNganTuBang(san, "C");
		if (record(san) !== "objective:mt-1,kr:C")
			loi.push(`vkm-cung-muc-tieu: doi chung record ${record(san)}`);
		const toiD = await sang(san, "kr-ke", "D");
		if (toiD !== "objective:mt-1,kr:D")
			loi.push(
				`vkm-cung-muc-tieu: record sau › ${toiD} can objective:mt-1,kr:D`,
			);
		dem += 1;
		const khung = await quayLai();
		if (khung !== "mt-1" || record(san) !== "objective:mt-1")
			loi.push(`vkm-cung-muc-tieu: quay lai mo ${khung} record ${record(san)}`);
		dem += 1;
		console.log(`vkm-cung-muc-tieu: ${dem}/2`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(2);
	});
});

describe("vkm-ngu-canh", () => {
	test("vkm-ngu-canh: tang duoi theo KR dich khi di theo bang, ngoai bang khong doi", async () => {
		const loi: string[] = [];
		let dem = 0;
		const san = await dungHop(
			`?record=objective:mt-2,kr:C&thuTuKr=${encodeURIComponent(KHOA_BANG)}`,
		);
		await cho(() => nganCua("C") && demKr() !== null, "ngan C chep tay");
		if (
			qs("[data-dau-ngan-kr] [data-thu-tu-kr]") === null ||
			demKr() !== "3/5" ||
			record(san) !== "objective:mt-2,kr:C"
		)
			loi.push(
				`vkm-ngu-canh: doi chung chep tay dem ${demKr()} record ${record(san)}`,
			);
		const toiD = await sang(san, "kr-ke", "D");
		if (toiD !== "objective:mt-1,kr:D")
			loi.push(
				`vkm-ngu-canh: record sau › toi D ${toiD} can objective:mt-1,kr:D`,
			);
		dem += 1;
		await thaoHet();

		datLai();
		datKho();
		const san2 = await dung(<RecordSheetHost />, "?record=objective:mt-1,kr:A");
		await cho(() => nganCua("A") && demKr() !== null, "ngan A ngoai bang");
		if (qs("[data-dau-ngan-kr] [data-thu-tu-kr]") !== null || demKr() !== "1/4")
			loi.push(`vkm-ngu-canh: doi chung ngoai bang dem ${demKr()}`);
		const toiC = await sang(san2, "kr-ke", "C");
		if (toiC !== "objective:mt-1,kr:C")
			loi.push(
				`vkm-ngu-canh: ngoai bang record sau › ${toiC} can objective:mt-1,kr:C`,
			);
		dem += 1;
		const khung = await quayLai();
		if (khung !== "mt-1")
			loi.push(`vkm-ngu-canh: ngoai bang quay lai mo ${khung} can mt-1`);
		dem += 1;
		console.log(`vkm-ngu-canh: ${dem}/3`);
		expect(loi.join("\n")).toBe("");
		expect(dem).toBe(3);
	});
});
