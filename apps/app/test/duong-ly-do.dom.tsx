import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import type { MucTieuOutput } from "../../api/src/okr/okr.contracts";
import {
	chiTietTu,
	cho,
	DetailSheet,
	datLai,
	dung,
	dungSheet,
	kho,
	MT_ID,
	mo,
	mtSheet,
	ObjectiveSheet,
	okrMessages,
	qs,
	qsa,
	thaoHet,
} from "./khung-gop-y-dung-cho";

const { dien } = await import("@/components/crm/record-sheet/plan-copy");

beforeEach(datLai);
afterEach(thaoHet);

type NoiGop = MucTieuOutput["alignments"][number];
type MucTin = NoiGop["mucTin"];

const LY_DO = "Tăng tỷ lệ chốt 18% lên 25% thêm khoảng 9 tỷ";
const CAN_CU = "Mảng X chiếm 30% doanh thu Q3";

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

const CO_SO_LIEU = noiGop("al-1", {
	lyDo: LY_DO,
	canCu: CAN_CU,
	lyDoTuKara: true,
	mucTin: "co-so-lieu",
});

async function moVoi(alignments: NoiGop[], whyNow?: string) {
	const mt = mtSheet(
		whyNow === undefined ? { alignments } : { alignments, whyNow },
	);
	kho.chiTiet = () => chiTietTu(mt);
	await dungSheet();
}

const dongCua = (id: string) => qs(`[data-gop-vao="${id}"]`);
const chu = (e: Element | null | undefined) => e?.textContent ?? null;

function docDong(id: string) {
	const d = dongCua(id);
	if (!d) throw new Error(`khong co dong noi gop ${id}`);
	return {
		tieuDe: chu(d.querySelector("[data-slot=item-title]")),
		moTa: chu(d.querySelector("[data-slot=item-description]")),
		cau: chu(d.querySelector("[data-ly-do-cau]")),
		canCu: chu(d.querySelector("[data-ly-do-can-cu]")),
		nhan: chu(d.querySelector("[data-muc-tin]")),
		tone: d
			.querySelector("[data-muc-tin] [data-slot=indicator-dot]")
			?.getAttribute("data-tone"),
		kara: d.querySelectorAll("[data-slot=kara-trace]").length,
	};
}

type GiaTri = string | number | boolean | null | undefined;

function kiem(
	thucTe: Readonly<Record<string, GiaTri>>,
	mong: Readonly<Record<string, GiaTri>>,
	thongDiep: (truong: string) => string,
) {
	for (const [truong, gt] of Object.entries(mong)) {
		if (thucTe[truong] !== gt)
			throw new Error(
				`${thongDiep(truong)} — thay ${JSON.stringify(thucTe[truong])}, mong ${JSON.stringify(gt)}`,
			);
	}
}

const sau = (a: Element | null, b: Element | null) =>
	a !== null &&
	b !== null &&
	(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

describe("l2-co-so-lieu", () => {
	test("l2-co-so-lieu dong noi qua KR hien cau ly do, can cu, nhan Co so lieu va mot dau Kara", async () => {
		await moVoi([CO_SO_LIEU]);
		const vung = qs("[data-khu=gop-vao]");
		const viSao = qs("[data-khu=vi-sao]");
		const bangKr = qs("[data-kr]")?.closest("table") ?? null;
		kiem(
			{
				tieuDeVung: vung?.textContent?.includes(mo.sheet.khuDuongLyDo) ?? false,
				thuTu: sau(viSao, vung) && sau(vung, bangKr),
				...docDong("al-1"),
			},
			{
				tieuDeVung: true,
				thuTu: true,
				tieuDe: CO_SO_LIEU.objectiveTitle,
				moTa: `OneHub · ${dien(mo.sheet.quaKr, { ten: CO_SO_LIEU.keyResultTitle ?? "" })}`,
				cau: LY_DO,
				canCu: dien(mo.sheet.canCu, { cau: CAN_CU }),
				nhan: mo.sheet.mucTin["co-so-lieu"],
				kara: 1,
			},
			(t) => `l2-co-so-lieu sai ${t === "canCu" ? "can cu" : t}`,
		);
	});
});

describe("l2-ba-muc", () => {
	const MA_TRAN: readonly {
		id: string;
		muc: MucTin;
		doi: Partial<NoiGop>;
		tone: string;
	}[] = [
		{ id: "al-chua", muc: "chua-co-ly-do", doi: {}, tone: "warning" },
		{ id: "al-cuoc", muc: "dat-cuoc", doi: { lyDo: LY_DO }, tone: "neutral" },
		{
			id: "al-so",
			muc: "co-so-lieu",
			doi: { lyDo: LY_DO, canCu: CAN_CU },
			tone: "success",
		},
	];
	test("l2-ba-muc moi muc tin mot nhan va mot tone theo nghia", async () => {
		await moVoi(MA_TRAN.map((c) => noiGop(c.id, { ...c.doi, mucTin: c.muc })));
		const nghia = {
			"chua-co-ly-do": "cho",
			"dat-cuoc": "nhap",
			"co-so-lieu": "xong",
		} as const;
		let soCa = 0;
		for (const c of MA_TRAN) {
			const d = docDong(c.id);
			kiem(
				{ nhan: d.nhan, tone: d.tone, toneNghia: d.tone },
				{
					nhan: mo.sheet.mucTin[c.muc],
					tone: c.tone,
					toneNghia: toneTheoNghia(nghia[c.muc]),
				},
				(t) => `l2-ba-muc ${c.muc} sai ${t}`,
			);
			soCa += 1;
		}
		expect(soCa).toBe(3);
	});

	test("l2-ba-muc nhan doc tu mucTin API, khong tinh lai o man", async () => {
		await moVoi([noiGop("al-api", { lyDo: LY_DO, mucTin: "chua-co-ly-do" })]);
		const d = docDong("al-api");
		if (d.nhan !== mo.sheet.mucTin["chua-co-ly-do"])
			throw new Error(`muc tin tinh lai o man: ${d.nhan}`);
	});
});

describe("l2-vang", () => {
	test("l2-vang chua co ly do chi co nhan, dat cuoc khong co dong can cu, khong can chinh thi khong co vung", async () => {
		let soCa = 0;
		await moVoi([noiGop("al-chua")]);
		kiem(
			{
				...docDong("al-chua"),
				soNhan: qsa("[data-gop-vao=al-chua] [data-muc-tin]").length,
			},
			{ cau: null, canCu: null, kara: 0, soNhan: 1 },
			(t) =>
				t === "canCu" ? "dong can cu rong" : `l2-vang chua-co-ly-do sai ${t}`,
		);
		soCa += 1;
		await thaoHet();
		datLai();
		await moVoi([noiGop("al-cuoc", { lyDo: LY_DO, mucTin: "dat-cuoc" })]);
		const cuoc = docDong("al-cuoc");
		kiem(
			{ coCau: cuoc.cau === LY_DO, canCu: cuoc.canCu },
			{ coCau: true, canCu: null },
			(t) => (t === "canCu" ? "dong can cu rong" : `l2-vang dat-cuoc sai ${t}`),
		);
		soCa += 1;
		await thaoHet();
		datLai();
		await moVoi([]);
		const soVung = qsa("[data-khu=gop-vao]").length;
		if (soVung !== 0) throw new Error(`khung gop vao rong: ${soVung}`);
		soCa += 1;
		await thaoHet();
		datLai();
		await moVoi([CO_SO_LIEU]);
		kiem(
			{ soVung: qsa("[data-khu=gop-vao]").length, ...docDong("al-1") },
			{ soVung: 1, cau: LY_DO, canCu: dien(mo.sheet.canCu, { cau: CAN_CU }) },
			(t) => `l2-vang doi chung duong sai ${t}`,
		);
		expect(soCa).toBe(3);
	});
});

describe("l2-len-muc-tieu", () => {
	test("l2-len-muc-tieu can chinh thang len muc tieu giu mo ta la ten don vi", async () => {
		await moVoi([
			noiGop("al-mt", {
				targetKeyResultId: null,
				keyResultTitle: null,
				lyDo: LY_DO,
				canCu: CAN_CU,
				mucTin: "co-so-lieu",
			}),
		]);
		kiem(
			docDong("al-mt"),
			{
				moTa: "OneHub",
				cau: LY_DO,
				canCu: dien(mo.sheet.canCu, { cau: CAN_CU }),
				nhan: mo.sheet.mucTin["co-so-lieu"],
			},
			(t) => `l2-len-muc-tieu sai ${t}`,
		);
	});
});

describe("l2-dau-kara", () => {
	test("l2-dau-kara chi ly do Kara viet mang dau", async () => {
		await moVoi([noiGop("al-nguoi", { lyDo: LY_DO, mucTin: "dat-cuoc" })]);
		const dau = qsa("[data-khu=gop-vao] [data-slot=kara-trace]").length;
		if (dau !== 0) throw new Error(`dau kara tren ly do cua nguoi: ${dau}`);
		await thaoHet();
		datLai();
		await moVoi([
			noiGop("al-kara", { lyDo: LY_DO, lyDoTuKara: true, mucTin: "dat-cuoc" }),
			noiGop("al-nguoi", { lyDo: LY_DO, mucTin: "dat-cuoc" }),
		]);
		const ds = qsa("[data-khu=gop-vao] [data-slot=kara-trace]");
		kiem(
			{
				so: ds.length,
				cua:
					ds[0]?.closest("[data-gop-vao]")?.getAttribute("data-gop-vao") ??
					null,
			},
			{ so: 1, cua: "al-kara" },
			(t) => `dau kara tren ly do cua nguoi (${t})`,
		);
	});
});

describe("l2-chu", () => {
	test("l2-chu du lieu nguoi nhap khong dich, khoa moi du vi va en", async () => {
		await moVoi([CO_SO_LIEU]);
		const d = dongCua("al-1");
		kiem(
			{
				cau:
					d?.querySelector("[data-ly-do-cau]")?.getAttribute("translate") ??
					null,
				canCu:
					d?.querySelector("[data-ly-do-can-cu] [translate=no]")?.textContent ??
					null,
			},
			{ cau: "no", canCu: CAN_CU },
			(t) => `l2-chu translate sai ${t}`,
		);
		const vi = okrMessages("vi").sheet;
		const en = okrMessages("en").sheet;
		const KHOA: readonly [string, string, string][] = [
			["khuDuongLyDo", vi.khuDuongLyDo, en.khuDuongLyDo],
			["canCu", vi.canCu, en.canCu],
			[
				"mucTin.chua-co-ly-do",
				vi.mucTin["chua-co-ly-do"],
				en.mucTin["chua-co-ly-do"],
			],
			["mucTin.dat-cuoc", vi.mucTin["dat-cuoc"], en.mucTin["dat-cuoc"]],
			["mucTin.co-so-lieu", vi.mucTin["co-so-lieu"], en.mucTin["co-so-lieu"]],
		];
		for (const [ten, a, b] of KHOA) {
			if (!a || !b || a === b)
				throw new Error(`l2-chu khoa ${ten} thieu ban vi/en`);
		}
		expect(KHOA.length).toBe(5);
		await thaoHet();
		datLai();
		kho.chiTiet = () => chiTietTu(mtSheet({ alignments: [CO_SO_LIEU] }));
		await dung(
			<DetailSheet onOpenChange={() => {}} open>
				<ObjectiveSheet objectiveId={MT_ID} />
			</DetailSheet>,
			`?record=objective:${MT_ID}`,
			"en",
		);
		await cho(
			() => qs("[data-gop-vao=al-1] [data-muc-tin]") !== null,
			"sheet en tai xong",
		);
		const nhan = qs("[data-gop-vao=al-1] [data-muc-tin]")?.textContent;
		if (nhan !== en.mucTin["co-so-lieu"])
			throw new Error(`l2-chu nhan en sai: ${nhan}`);
	});
});
