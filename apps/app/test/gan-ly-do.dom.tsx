import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { act } from "react";
import type { MucTieuOutput } from "../../api/src/okr/okr.contracts";
import {
	bamChuot,
	chiTietTu,
	cho,
	D_CAN,
	datLai,
	deXuat,
	dong,
	dung,
	dungSheet,
	dungSheetCoGopY,
	goiCua,
	kho,
	MT_ID,
	m,
	mo,
	mtSheet,
	nut,
	okrGopYMessages,
	okrMessages,
	qs,
	qsa,
	thaoHet,
} from "./khung-gop-y-dung-cho";

const { HopThoaiCanChinh } = await import(
	"@/app/(app)/[slug]/okr/hop-thoai-can-chinh"
);
const { NGHIA_MUC_TIN } = await import(
	"@/components/crm/record-sheet/ly-do-noi-gop"
);

beforeEach(datLai);
afterEach(thaoHet);

type NoiGop = MucTieuOutput["alignments"][number];
type MucTin = NoiGop["mucTin"];

const LY_DO = "Tăng tỷ lệ chốt 18% lên 25% thêm khoảng 9 tỷ";
const CAN_CU = "Mảng X chiếm 30% doanh thu Q3";
const h = mo.hopThoai;

function datGiaTri(o: Element | null, giaTri: string): Promise<void> {
	if (!(o instanceof HTMLTextAreaElement)) throw new Error("khong thay o nhap");
	const dat = Object.getOwnPropertyDescriptor(
		HTMLTextAreaElement.prototype,
		"value",
	)?.set;
	return act(async () => {
		dat?.call(o, giaTri);
		o.dispatchEvent(new Event("input", { bubbles: true }));
	});
}

const oLyDo = () => qs("[data-hop-thoai-can-chinh] [data-o=vi-sao]");
const oCanCu = () => qs("[data-hop-thoai-can-chinh] [data-o=can-cu]");
const nutGui = () =>
	qs<HTMLButtonElement>("[data-hop-thoai-can-chinh] [data-nut=gui-can-chinh]");

function mucTinHien() {
	const o = qs("[data-hop-thoai-can-chinh] [data-muc-tin]");
	return {
		nhan: o?.textContent ?? null,
		muc: o?.getAttribute("data-muc-tin") ?? null,
		tone:
			o
				?.querySelector("[data-slot=indicator-dot]")
				?.getAttribute("data-tone") ?? null,
	};
}

function noiGop(id: string, doi: Partial<NoiGop> = {}): NoiGop {
	return {
		alignmentId: id,
		targetObjectiveId: `mt-cha-${id}`,
		targetKeyResultId: `kr-cha-${id}`,
		unitName: "OneHub",
		objectiveTitle: `Tăng trưởng doanh thu bền vững ${id}`,
		keyResultTitle: `Doanh thu Q4 đạt 120 tỷ ${id}`,
		lyDo: null,
		canCu: null,
		lyDoTuKara: false,
		mucTin: "chua-co-ly-do",
		...doi,
	};
}

const DICH = {
	objectiveId: "mt-cha",
	keyResultId: "kr-cha",
	label: "KR cha · Doanh thu Q4 đạt 120 tỷ",
	unitName: "OneHub",
};

async function moGan() {
	kho.rieng.set("okr.alignmentTargets", () => ({ targets: [DICH] }));
	await dung(
		<HopThoaiCanChinh objectiveId={MT_ID} daGop={[]} dong={() => {}} />,
	);
	await cho(() => oLyDo() !== null, "hop thoai gan");
}

describe("l4-hop-thoai", () => {
	test("l4-hop-thoai: mức tin đổi theo chữ đã cắt — năm ca viết trước", async () => {
		await moGan();
		const CA: [string, string, string, MucTin][] = [
			["trong", "", "", "chua-co-ly-do"],
			["ly do khoang trang", "   ", "", "chua-co-ly-do"],
			["chi ly do", LY_DO, "", "dat-cuoc"],
			["can cu khoang trang", LY_DO, " \n ", "dat-cuoc"],
			["ca hai", LY_DO, CAN_CU, "co-so-lieu"],
		];
		let chay = 0;
		for (const [ten, lyDo, canCu, muc] of CA) {
			await datGiaTri(oLyDo(), lyDo);
			await datGiaTri(oCanCu(), canCu);
			const hien = mucTinHien();
			const mong = {
				nhan: mo.sheet.mucTin[muc],
				muc,
				tone: toneTheoNghia(NGHIA_MUC_TIN[muc]),
			};
			if (JSON.stringify(hien) !== JSON.stringify(mong))
				throw new Error(
					`muc tin hop thoai sai (${ten}): ${JSON.stringify(hien)}`,
				);
			chay++;
		}
		expect(chay).toBe(5);
	});

	test("l4-hop-thoai: căn cứ thiếu lý do thì có lỗi và khoá nút", async () => {
		await moGan();
		await datGiaTri(oLyDo(), "");
		await datGiaTri(oCanCu(), CAN_CU);
		expect(qs("[data-loi-can-cu]")?.textContent).toBe(h.loiCanCuCanChinh);
		expect(oCanCu()?.getAttribute("aria-invalid")).toBe("true");
		expect(nutGui()?.disabled).toBe(true);
		await datGiaTri(oLyDo(), LY_DO);
		expect(qs("[data-loi-can-cu]")).toBeNull();
		expect(oCanCu()?.getAttribute("aria-invalid")).toBeNull();
	});

	test("l4-hop-thoai: tab Căn chỉnh — nút Sửa lý do chỉ cho người sửa được, mở chế độ sửa, Lưu gọi suaLyDoCanChinh", async () => {
		const ds = [
			noiGop("al-1", {
				lyDo: LY_DO,
				canCu: CAN_CU,
				lyDoTuKara: true,
				mucTin: "co-so-lieu",
			}),
			noiGop("al-2"),
		];
		kho.chiTiet = () => chiTietTu(mtSheet({ alignments: ds, canEdit: false }));
		await dungSheet({ thamSo: `?record=objective:${MT_ID}&tab=can-chinh` });
		await cho(() => qs("[data-noi-gop]") !== null, "bang can chinh");
		expect(qsa("[data-nut=sua-ly-do]").length).toBe(0);
		await thaoHet();
		datLai();
		kho.chiTiet = () => chiTietTu(mtSheet({ alignments: ds, canEdit: true }));
		await dungSheet({ thamSo: `?record=objective:${MT_ID}&tab=can-chinh` });
		await cho(() => qs("[data-noi-gop]") !== null, "bang can chinh");
		const nutSua = qsa("[data-nut=sua-ly-do]");
		expect(nutSua.length).toBe(ds.length);
		await bamChuot(nutSua[0] as HTMLElement);
		await cho(
			() =>
				qs("[data-hop-thoai-can-chinh]")?.getAttribute("data-che-do") === "sua",
			"che do sua",
		);
		expect(qs("[data-hop-thoai-can-chinh] [role=combobox]")).toBeNull();
		expect(qs("[data-dich-khoa]")?.textContent).toBe(
			ds[0]?.keyResultTitle ?? "",
		);
		expect((oLyDo() as HTMLTextAreaElement).value).toBe(LY_DO);
		expect((oCanCu() as HTMLTextAreaElement).value).toBe(CAN_CU);
		await datGiaTri(oCanCu(), "");
		await bamChuot(
			nut(h.luu, qs("[data-hop-thoai-can-chinh]") ?? document.body),
		);
		await cho(() => goiCua("okr.suaLyDoCanChinh").length === 1, "gui sua");
		expect(goiCua("okr.suaLyDoCanChinh")[0]?.vao).toEqual({
			id: "al-1",
			lyDo: LY_DO,
			canCu: null,
		});
	});
});

const D_CO_CAN_CU = dong("d-can-co", {
	loai: "can-chinh",
	targetKeyResultId: "kr-goc",
	tenDich: "KR OneHub · Thoả thuận mới cả năm",
	lyDo: LY_DO,
	canCu: CAN_CU,
});

describe("l4-de-xuat", () => {
	test("l4-de-xuat: đề xuất căn chỉnh hiện mức tin, vì sao, căn cứ và ba nút", async () => {
		await dungSheetCoGopY([D_CO_CAN_CU, D_CAN]);
		const co = deXuat(D_CO_CAN_CU.id);
		const khong = deXuat(D_CAN.id);
		if (!co || !khong) throw new Error("khong co de xuat can chinh");
		const doc = (o: Element) => ({
			muc: o.querySelector("[data-muc-tin]")?.getAttribute("data-muc-tin"),
			nhan: o.querySelector("[data-muc-tin]")?.textContent,
			tone: o
				.querySelector("[data-muc-tin] [data-slot=indicator-dot]")
				?.getAttribute("data-tone"),
			lyDo: o.querySelector("[data-de-xuat-ly-do] [translate=no]")?.textContent,
			canCu:
				o.querySelector("[data-de-xuat-can-cu] [translate=no]")?.textContent ??
				null,
			soCanCu: o.querySelectorAll("[data-de-xuat-can-cu]").length,
			nut: [...o.querySelectorAll("[data-hanh-dong]")].map((b) => [
				b.getAttribute("data-hanh-dong"),
				b.textContent?.trim(),
			]),
		});
		const a = doc(co);
		if (a.soCanCu !== 1) throw new Error("thieu dong can cu");
		expect(a).toEqual({
			muc: "co-so-lieu",
			nhan: mo.sheet.mucTin["co-so-lieu"],
			tone: toneTheoNghia(NGHIA_MUC_TIN["co-so-lieu"]),
			lyDo: LY_DO,
			canCu: CAN_CU,
			soCanCu: 1,
			nut: [
				["can-chinh", m.dong.canChinh],
				["sua-ly-do", m.dong.suaLyDo],
				["bo-qua", m.de.boQua],
			],
		});
		const b = doc(khong);
		expect([b.muc, b.soCanCu, b.canCu]).toEqual(["dat-cuoc", 0, null]);
	});

	test("l4-de-xuat: Sửa lý do mở hộp thoại điền sẵn chữ Kara, gửi troLyQuyet cách sua", async () => {
		await dungSheetCoGopY([D_CO_CAN_CU]);
		const co = deXuat(D_CO_CAN_CU.id);
		if (!co) throw new Error("khong co de xuat");
		await bamChuot(nut(m.dong.suaLyDo, co));
		await cho(
			() =>
				qs("[data-hop-thoai-can-chinh]")?.getAttribute("data-che-do") ===
				"nhan",
			"hop thoai nhan",
		);
		expect((oLyDo() as HTMLTextAreaElement).value).toBe(LY_DO);
		expect((oCanCu() as HTMLTextAreaElement).value).toBe(CAN_CU);
		await datGiaTri(oLyDo(), "Lý do người duyệt");
		const gui = nutGui();
		if (!gui) throw new Error("khong thay nut gui");
		await bamChuot(gui);
		await cho(() => goiCua("okr.troLyQuyet").length === 1, "gui quyet");
		expect(goiCua("okr.troLyQuyet")[0]?.vao).toEqual({
			deXuatId: D_CO_CAN_CU.id,
			cach: "sua",
			giaTri: "Lý do người duyệt",
			canCu: CAN_CU,
		});
	});
});

describe("l4-chu", () => {
	test("l4-chu: chữ khung mới có đủ vi và en khác nhau; nhãn mức tin dùng bảng L2", async () => {
		const vi = okrMessages("vi");
		const en = okrMessages("en");
		const gvi = okrGopYMessages("vi");
		const gen = okrGopYMessages("en");
		const KHOA: [string, string, string][] = [
			...(
				[
					"lyDoCanChinh",
					"lyDoCanChinhMoTa",
					"canCuCanChinh",
					"canCuCanChinhMoTa",
					"mucTinCanChinh",
					"loiCanCuCanChinh",
					"suaLyDoCanChinh",
					"moTaSuaLyDo",
					"moTaNhanDeXuat",
					"daSuaLyDo",
				] as const
			).map((k): [string, string, string] => [
				`hopThoai.${k}`,
				vi.hopThoai[k],
				en.hopThoai[k],
			]),
			["sheet.suaLyDo", vi.sheet.suaLyDo, en.sheet.suaLyDo],
			["dong.canChinh", gvi.dong.canChinh, gen.dong.canChinh],
			["dong.suaLyDo", gvi.dong.suaLyDo, gen.dong.suaLyDo],
			["dong.viSao", gvi.dong.viSao, gen.dong.viSao],
			["dong.canCu", gvi.dong.canCu, gen.dong.canCu],
		];
		for (const [ten, a, b] of KHOA) {
			if (!a.trim() || !b.trim()) throw new Error(`chu rong: ${ten}`);
			if (a === b) throw new Error(`vi trung en: ${ten}`);
		}
		expect(KHOA).toHaveLength(15);
		kho.rieng.set("okr.alignmentTargets", () => ({ targets: [DICH] }));
		await dung(
			<HopThoaiCanChinh objectiveId={MT_ID} daGop={[]} dong={() => {}} />,
			"",
			"en",
		);
		await cho(() => oLyDo() !== null, "hop thoai en");
		expect(mucTinHien().nhan).toBe(en.sheet.mucTin["chua-co-ly-do"]);
		expect(oLyDo()?.getAttribute("translate")).toBe("no");
		expect(oCanCu()?.getAttribute("translate")).toBe("no");
	});
});
