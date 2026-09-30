import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import {
	createKrInput,
	createObjectiveInput,
	type DongHien,
	updateKrInput,
	updateObjectiveInput,
} from "../../api/src/okr/okr.contracts";
import {
	bam,
	cho,
	cot,
	D_KR,
	D_TEN,
	dat,
	datMacDinh,
	dongHet,
	go,
	goiCua,
	HAI,
	hopKr,
	hopMucTieu,
	KR_1,
	MT,
	mo,
	nhip,
	nut,
	nutCo,
	phim,
} from "./khung-gop-y";

const { HopThoaiMucTieu } = await import(
	"@/app/(app)/[slug]/okr/hop-thoai-muc-tieu"
);
const { HopThoaiKr } = await import("@/app/(app)/[slug]/okr/hop-thoai-kr");
const { CreateDealSheet } = await import(
	"@/app/(app)/[slug]/deals/create-deal-sheet"
);
const { okrGopYMessages } = await import("@/lib/messages/okr-gop-y");
const { okrMessages } = await import("@/lib/messages/okr");
const { messages: uiMessages } = await import("@crm/ui/lib/messages");

const mg = okrGopYMessages("vi");
const h = okrMessages("vi").hopThoai;
const tenDong = uiMessages("vi").dialog.close;

afterEach(dongHet);

const ngan = (o: HTMLElement | null): HTMLElement | null =>
	o?.closest<HTMLElement>('[data-slot="sheet-content"]') ?? null;

async function dataSizeNganDeal(): Promise<string> {
	datMacDinh([]);
	dat("giaiDoan.list", () => ({ stages: [] }));
	dat("currency.settings", () => ({ reportingCurrency: "VND" }));
	await mo(<CreateDealSheet />, { searchParams: "new=true" });
	await cho(
		() => document.querySelector('[data-slot="sheet-content"]') !== null,
		"ngan tao deal mo",
	);
	const gia = document
		.querySelector('[data-slot="sheet-content"]')
		?.getAttribute("data-size");
	await dongHet();
	if (!gia) throw new Error("ngan deal thieu data-size");
	return gia;
}

type Ngan = {
	ten: "tao-muc-tieu" | "sua-muc-tieu" | "them-kr" | "sua-kr";
	dung: (dong: () => void) => ReactElement;
	hop: () => HTMLElement | null;
};

const BON_NGAN: readonly [Ngan, Ngan, Ngan, Ngan] = [
	{
		ten: "tao-muc-tieu",
		dung: (dong) => (
			<HopThoaiMucTieu
				yeuCau={{
					loai: "tao",
					cycleId: MT.cycleId,
					don: { loai: "goc" },
					tenDon: "OneHub",
				}}
				dong={dong}
			/>
		),
		hop: hopMucTieu,
	},
	{
		ten: "sua-muc-tieu",
		dung: (dong) => (
			<HopThoaiMucTieu yeuCau={{ loai: "sua", mucTieu: MT }} dong={dong} />
		),
		hop: hopMucTieu,
	},
	{
		ten: "them-kr",
		dung: (dong) => (
			<HopThoaiKr
				objectiveId={MT.id}
				mucTieu={MT}
				kr={null}
				chuMacDinh={HAI.id}
				suaDuocCot
				dong={dong}
			/>
		),
		hop: hopKr,
	},
	{
		ten: "sua-kr",
		dung: (dong) => (
			<HopThoaiKr
				objectiveId={MT.id}
				mucTieu={MT}
				kr={KR_1}
				chuMacDinh={HAI.id}
				suaDuocCot
				dong={dong}
			/>
		),
		hop: hopKr,
	},
];

async function moNgan(
	n: Ngan,
	dong: readonly DongHien[] = [],
): Promise<{ lan: () => number }> {
	datMacDinh([...dong]);
	let lan = 0;
	await mo(
		n.dung(() => {
			lan += 1;
		}),
	);
	await cho(() => n.hop() !== null, `ngan ${n.ten} mo`);
	return { lan: () => lan };
}

function motLan(goi: readonly { dauVao: unknown }[]): unknown {
	const [dau] = goi;
	if (!dau) throw new Error("khong co loi goi");
	return dau.dauVao;
}

const oTen = (hop: HTMLElement | null) =>
	hop?.querySelector<HTMLInputElement>('input[id$="-ten"]') ?? null;

async function bamLopPhu(): Promise<void> {
	const lop = [...document.querySelectorAll('[data-slot="sheet-overlay"]')].at(
		-1,
	);
	if (!lop) throw new Error("khong thay lop phu ngan");
	await act(async () => {
		lop.dispatchEvent(
			new PointerEvent("pointerdown", {
				bubbles: true,
				button: 0,
				pointerType: "mouse",
			}),
		);
		lop.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
		(lop as HTMLElement).click();
	});
	await nhip(5);
}

function nutX(hop: HTMLElement): HTMLButtonElement {
	const x = [
		...(ngan(hop)?.querySelectorAll<HTMLButtonElement>("button") ?? []),
	].find((b) => b.textContent?.trim() === tenDong);
	if (!x) throw new Error("khong thay dau X");
	return x;
}

const DUONG_DONG = ["esc", "lop-phu", "huy", "x"] as const;

async function dongBang(
	duong: (typeof DUONG_DONG)[number],
	hop: HTMLElement,
): Promise<void> {
	if (duong === "esc") await phim(hop, "Escape");
	if (duong === "lop-phu") await bamLopPhu();
	if (duong === "huy") await bam(nut(h.huy, ngan(hop) ?? document.body));
	if (duong === "x") await bam(nutX(hop));
}

describe("khung-tao-okr — cỡ ngăn", () => {
	test("co-ngan: cột đóng cùng cỡ ngăn deal; cột mở thì assist và thân chứa cả form lẫn cột", async () => {
		const coDeal = await dataSizeNganDeal();
		const ca: { ten: string; moNgan: () => Promise<void>; dau: string }[] = [
			{
				ten: "muc tieu",
				moNgan: async () => {
					await moNgan(BON_NGAN[1], [D_TEN]);
				},
				dau: D_TEN.id,
			},
			{
				ten: "kr",
				moNgan: async () => {
					await moNgan(BON_NGAN[3], [D_KR]);
				},
				dau: D_KR.id,
			},
		];
		for (const c of ca) {
			await c.moNgan();
			const hop = c.ten === "kr" ? hopKr : hopMucTieu;
			if (hop()?.getAttribute("data-size") !== coDeal)
				throw new Error(
					`co ngan ${c.ten}: dong cot ${hop()?.getAttribute("data-size")} != ${coDeal}`,
				);
			await cho(() => nutCo(mg.nut.nho) !== null, "nut nho gop y");
			await bam(nut(mg.nut.nho));
			await cho(() => cot() !== null, `cot ${c.ten}`);
			if (hop()?.getAttribute("data-size") !== "assist")
				throw new Error(`co ngan ${c.ten}`);
			const than = hop()?.querySelector('[data-slot="sheet-body"]');
			expect(than?.getAttribute("data-split")).toBe("true");
			expect(than?.querySelector("form")).not.toBeNull();
			expect(than?.querySelector("[data-cot-gop-y]")).not.toBeNull();
			const dongCot = cot()?.querySelector<HTMLButtonElement>(
				`button[aria-label="${mg.cot.dong}"]`,
			);
			if (!dongCot) throw new Error(`khong thay nut dong cot ${c.ten}`);
			await bam(dongCot);
			await cho(() => cot() === null, `dong cot ${c.ten}`);
			if (hop()?.getAttribute("data-size") !== coDeal)
				throw new Error(`co ngan ${c.ten}: ket o assist sau khi dong cot`);
			await dongHet();
		}
	}, 60_000);
});

describe("khung-tao-okr — giữ chữ đang sửa", () => {
	test("giu: bốn ngăn × bốn đường đóng × có hay không có sửa", async () => {
		let soKhang = 0;
		for (const n of BON_NGAN) {
			for (const duong of DUONG_DONG) {
				for (const coSua of [true, false]) {
					const ngn = await moNgan(n);
					const hop = n.hop();
					if (!hop) throw new Error(`khong mo ${n.ten}`);
					if (coSua) await go(oTen(hop), "Một cái tên khác hẳn");
					await dongBang(duong, hop);
					if (coSua) {
						const hoi = document.querySelector('[role="alertdialog"]');
						const canHoi = duong !== "lop-phu";
						if (n.hop() === null || ngn.lan() !== 0)
							throw new Error(
								`dong mat thay doi: ${n.ten.endsWith("kr") ? "kr" : "muc tieu"} (${n.ten}/${duong})`,
							);
						if (canHoi !== (hoi !== null))
							throw new Error(
								`hoi lai sai: ${n.ten}/${duong} (${hoi ? "co" : "khong"} hop hoi)`,
							);
					} else if (ngn.lan() !== 1) {
						throw new Error(
							`khong dong khi khong sua: ${n.ten}/${duong} (${ngn.lan()})`,
						);
					}
					soKhang += 1;
					await dongHet();
				}
			}
		}
		console.log(`so khang dinh: ${soKhang}`);
		expect(soKhang).toBe(32);
	}, 300_000);
});

describe("khung-tao-okr — gửi đúng dữ liệu", () => {
	test("gui-dung: bốn thao tác qua ngăn gọi đúng thủ tục với đúng payload", async () => {
		const tenMoi = "Không thoả thuận nào của miền Bắc bị mất dấu";
		const viSao = "Đầu quý 1 là mùa ký lại hợp đồng năm.";

		await moNgan(BON_NGAN[0]);
		await go(oTen(hopMucTieu()), tenMoi);
		await go(
			hopMucTieu()?.querySelector('textarea[id$="-vi-sao"]') ?? null,
			viSao,
		);
		await bam(nut(h.taoMucTieu));
		const tao = goiCua("okr.createObjective");
		if (tao.length !== 1)
			throw new Error("payload lech: createObjective (so lan)");
		const pTao = createObjectiveInput.parse(motLan(tao));
		const kyTao = {
			cycleId: MT.cycleId,
			unit: { level: "onehub" },
			title: tenMoi,
			kind: "cam-ket",
			ownerUserId: HAI.id,
			participantIds: [],
			whyNow: viSao,
		};
		if (
			JSON.stringify(pTao) !== JSON.stringify(createObjectiveInput.parse(kyTao))
		)
			throw new Error(`payload lech: createObjective ${JSON.stringify(pTao)}`);
		console.log("createObjective", JSON.stringify(pTao));
		await dongHet();

		await moNgan(BON_NGAN[1]);
		await go(oTen(hopMucTieu()), tenMoi);
		await bam(nut(h.luu));
		const sua = goiCua("okr.updateObjective");
		if (sua.length !== 1)
			throw new Error("payload lech: updateObjective (so lan)");
		const pSua = updateObjectiveInput.parse(motLan(sua));
		expect(pSua).toEqual(
			updateObjectiveInput.parse({ id: MT.id, title: tenMoi }),
		);
		console.log("updateObjective", JSON.stringify(pSua));
		await dongHet();

		await moNgan(BON_NGAN[2]);
		await go(oTen(hopKr()), "Khách mới hẹn gặp sau cuộc gọi đầu");
		await go(
			hopKr()?.querySelector<HTMLInputElement>("[data-o-dich]") ?? null,
			"20",
		);
		await bam(nut(h.themKr, ngan(hopKr()) ?? document.body));
		const them = goiCua("okr.createKeyResult");
		if (them.length !== 1)
			throw new Error("payload lech: createKeyResult (so lan)");
		const pThem = createKrInput.parse(motLan(them));
		expect(pThem).toEqual(
			createKrInput.parse({
				objectiveId: MT.id,
				title: "Khách mới hẹn gặp sau cuộc gọi đầu",
				kind: "tang-toi",
				ownerUserId: HAI.id,
				startValue: 0,
				targetValue: 20,
				currentValue: 0,
				unit: "",
				dueOn: null,
				weight: 1,
			}),
		);
		console.log("createKeyResult", JSON.stringify(pThem));
		await dongHet();

		await moNgan(BON_NGAN[3]);
		await go(oTen(hopKr()), "Gọi 60 cuộc mỗi tuần");
		await bam(nut(h.luu));
		const suaKr = goiCua("okr.updateKeyResult");
		if (suaKr.length !== 1)
			throw new Error("payload lech: updateKeyResult (so lan)");
		const pSuaKr = updateKrInput.parse(motLan(suaKr));
		expect(pSuaKr).toEqual(
			updateKrInput.parse({ id: KR_1.id, title: "Gọi 60 cuộc mỗi tuần" }),
		);
		console.log("updateKeyResult", JSON.stringify(pSuaKr));
	}, 120_000);
});
