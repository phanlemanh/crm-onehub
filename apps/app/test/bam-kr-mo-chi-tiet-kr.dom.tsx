import { afterEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { within } from "@testing-library/dom";
import { act } from "react";
import { mineOutput, viecCuaToiOutput } from "../../api/src/okr/okr.contracts";
import { cayCanChinhOutput } from "../../api/src/okr/okr-xem.contracts";
import {
	bamChuot,
	bamPhim,
	cho,
	datLai,
	dung,
	kho,
	kr,
	mucTieu,
	nguoiDung,
	nhip,
	qs,
	qsa,
	type San,
	thaoHet,
} from "./khung-gop-y-dung-cho";

const { PhanKrPhuTrach } = await import(
	"@/app/(app)/[slug]/okr/phan-kr-phu-trach"
);
const { CayCanChinh } = await import("@/app/(app)/[slug]/okr/cay-can-chinh");
const { ViecOkrCuaToi } = await import("@/app/(app)/[slug]/okr/viec-cua-toi");
const { BangKr } = await import("@/app/(app)/[slug]/okr/bang-kr");
const { useRecordStack } = await import(
	"@/components/crm/record-sheet/record-stack"
);
const { okrMessages } = await import("@/lib/messages/okr");
const { SEARCH_PARAM } = await import("@/lib/search-param-keys");

const mv = okrMessages("vi").viecCuaToi;
const SO_TAB_TOI_DA = 20;

const record = (san: San) => san.url().get(SEARCH_PARAM.record.stack) ?? "";
const chong = (...ds: string[]) => ds.join(",");

afterEach(async () => {
	await thaoHet();
	datLai();
});

describe("bkr-kr-phu-trach", () => {
	const MA_TRAN = [
		{ k: "K1", o: "O1", ten: "Gia hạn 30 hợp đồng lớn" },
		{ k: "K2", o: "O2", ten: "Giữ 95% khách hàng chủ chốt" },
	] as const;
	const mine = mineOutput.parse({
		dangTheoDoi: [],
		daBo: [],
		objectives: MA_TRAN.map((c) =>
			mucTieu(c.o, [kr(c.k, c.o, { title: c.ten, laCuaToi: true })]),
		),
	});
	const ve = () =>
		dung(<PhanKrPhuTrach ds={mine.objectives} tenKy="Quý 4/2026" />);

	test("bkr-kr-phu-trach: bam ten KR mo chi tiet KR, khong mo muc tieu", async () => {
		const goc = await ve();
		await nhip(2);
		expect(qsa("[data-mo-kr]").length).toBe(MA_TRAN.length);
		expect(record(goc), "bkr-kr-phu-trach: chua bam da co record").toBe("");
		await thaoHet();

		let soO = 0;
		for (const c of MA_TRAN) {
			const san = await ve();
			const nut = qs(`[data-mo-kr="${c.k}"]`);
			if (!nut) throw new Error(`bkr-kr-phu-trach: khong co nut ${c.k}`);
			await bamChuot(nut);
			const thuc = record(san);
			const loi = `bkr-kr-phu-trach: ${c.k} mo ${thuc}, can kr:${c.k}`;
			expect(thuc, loi).toBe(`kr:${c.k}`);
			expect(thuc.includes("objective:"), loi).toBe(false);
			soO += 1;
			await thaoHet();
		}
		expect(soO).toBe(2);
	});
});

describe("bkr-cay", () => {
	const cay = cayCanChinhOutput.parse(
		JSON.parse(
			readFileSync(join(import.meta.dir, "fixtures/bkr-cay.json"), "utf8"),
		),
	);
	const goc = cay.roots.find(
		(n) => n.loai === "muc-tieu" && n.children.some((c) => c.loai === "kr"),
	);
	const con = goc?.children.find((c) => c.loai === "kr");
	if (!goc || !con)
		throw new Error("bkr-cay: fixture khong co muc tieu co con KR");

	test("bkr-cay: chon nut KR mo chi tiet KR, chon nut muc tieu mo muc tieu", async () => {
		expect(con.objectiveId).toBe(goc.objectiveId);
		const MA_TRAN = [
			{
				id: con.id,
				loai: "kr",
				mong: `kr:${con.id}`,
			},
			{
				id: goc.id,
				loai: "muc-tieu",
				mong: `objective:${goc.objectiveId}`,
			},
		] as const;
		let soO = 0;
		for (const c of MA_TRAN) {
			const san = await dung(
				<CayCanChinh
					canh={cay.canh}
					chuaCanChinh={cay.chuaCanChinh}
					roots={cay.roots}
				/>,
			);
			const nhan = qs(`[data-nut-can-chinh="${c.id}"]`);
			if (!nhan) throw new Error(`bkr-cay: khong co nhan nut ${c.id}`);
			expect(record(san), "bkr-cay: chua chon da co record").toBe("");
			await bamChuot(nhan);
			const thuc = record(san);
			expect(
				thuc,
				`bkr-cay: nut ${c.loai} ${c.id} mo ${thuc}, can ${c.mong}`,
			).toBe(c.mong);
			soO += 1;
			await thaoHet();
		}
		expect(soO).toBe(2);
	});
});

describe("bkr-viec", () => {
	const K = "K";
	const O_KR = "O";
	const O = "O2";
	const DU = viecCuaToiOutput.parse({
		lienQuanOkr: true,
		viec: [
			{
				loai: "okr-duoc-giao",
				objectiveId: O_KR,
				keyResultId: K,
				nhan: "Gia hạn 30 hợp đồng lớn",
			},
			{
				loai: "okr-duoc-giao",
				objectiveId: O,
				nhan: "Mở rộng miền Trung",
			},
		],
	});

	test("bkr-viec: viec gan KR mo chi tiet KR, viec khong KR mo muc tieu", async () => {
		const MA_TRAN = [
			{
				o: 0,
				chu: mv.moKr,
				mong: `kr:${K}`,
				loi: (t: string) => `bkr-viec: viec gan KR mo ${t}, can kr:${K}`,
			},
			{
				o: 1,
				chu: mv.moMucTieu,
				mong: `objective:${O}`,
				loi: (t: string) =>
					`bkr-viec: viec khong KR mo ${t}, can objective:${O}`,
			},
		] as const;
		let soO = 0;
		for (const c of MA_TRAN) {
			kho.rieng.set("okr.viecCuaToi", () => DU);
			const san = await dung(
				<ViecOkrCuaToi anKhiLoi={false} khiHien="luon" noi="cua-toi" />,
			);
			await cho(() => qsa("[data-viec-okr]").length === 2, "hai dong viec");
			const dong = qsa("[data-viec-okr]")[c.o];
			if (!dong) throw new Error(`bkr-viec: khong co dong ${c.o}`);
			const nutTrongDong = qsa("button", dong);
			expect(nutTrongDong.length).toBe(1);
			const [nut] = nutTrongDong;
			if (!nut) throw new Error(`bkr-viec: dong ${c.o} khong co nut`);
			await bamChuot(nut);
			const thuc = record(san);
			expect(thuc, c.loi(thuc)).toBe(c.mong);
			expect(
				within(dong).queryByRole("button", { name: c.chu }),
				`bkr-viec: dong ${c.o} khong co nut «${c.chu}» — co «${nut.textContent}»`,
			).not.toBeNull();
			soO += 1;
			await thaoHet();
			datLai();
		}
		expect(soO).toBe(2);
		expect(mv.moKr).not.toBe(mv.moMucTieu);
	});
});

describe("bkr-bang-kr", () => {
	const O = "mt-bkr-bang";
	const MA_TRAN = [
		{ k: "kr-bkr-1", ten: "Tăng doanh thu gia hạn lên 30%" },
		{ k: "kr-bkr-2", ten: "Giảm thời gian phản hồi còn 2 giờ" },
	] as const;
	const mt = mucTieu(
		O,
		MA_TRAN.map((c) => kr(c.k, O, { title: c.ten })),
	);
	type TayDong = { dong: (() => void) | null };
	const tay: TayDong = { dong: null };
	function GiuDong() {
		tay.dong = useRecordStack().close;
		return null;
	}
	const ve = () =>
		dung(
			<>
				<BangKr
					danhDauCuaToi={false}
					expected={mt.expected}
					keyResults={mt.keyResults}
					kind={mt.kind}
				/>
				<GiuDong />
			</>,
			`?${SEARCH_PARAM.record.stack}=objective:${O}`,
		);
	const nutTen = (ten: string) =>
		within(document.body).queryByRole("button", { name: ten });

	test("bkr-bang-kr: ten KR la nut, Tab toi duoc, bam mo KR tren muc tieu", async () => {
		let soO = 0;
		for (const [i, c] of MA_TRAN.entries()) {
			const san = await ve();
			await nhip(2);
			expect(record(san)).toBe(`objective:${O}`);
			const nut = nutTen(c.ten);
			expect(nut !== null, `bkr-bang-kr: ten K${i + 1} khong phai nut`).toBe(
				true,
			);
			if (!nut) return;
			const u = nguoiDung();
			let soTab = 0;
			await act(async () => {
				while (document.activeElement !== nut && soTab < SO_TAB_TOI_DA) {
					await u.tab();
					soTab += 1;
				}
			});
			expect(
				document.activeElement === nut,
				`bkr-bang-kr: ten K${i + 1} khong toi duoc bang Tab sau ${soTab} lan`,
			).toBe(true);
			await bamChuot(nut);
			const thuc = record(san);
			expect(
				thuc,
				`bkr-bang-kr: bam K${i + 1} cho ${thuc}, can ${chong(`objective:${O}`, `kr:${c.k}`)}`,
			).toBe(chong(`objective:${O}`, `kr:${c.k}`));
			soO += 1;
			await thaoHet();
		}
		expect(soO).toBe(2);
	});

	test("bkr-bang-kr: doi chung Enter tren K2 cung ket qua, dong ngan ve muc tieu", async () => {
		const c = MA_TRAN[1];
		const san = await ve();
		await nhip(2);
		const nut = nutTen(c.ten);
		expect(nut !== null, "bkr-bang-kr: ten K2 khong phai nut").toBe(true);
		if (!nut) return;
		await bamPhim(nut, "{Enter}");
		const thuc = record(san);
		expect(
			thuc,
			`bkr-bang-kr: Enter K2 cho ${thuc}, can ${chong(`objective:${O}`, `kr:${c.k}`)}`,
		).toBe(chong(`objective:${O}`, `kr:${c.k}`));
		const dong = tay.dong;
		if (!dong) throw new Error("bkr-bang-kr: khong giu duoc close");
		await act(async () => dong());
		await nhip(2);
		expect(record(san), "bkr-bang-kr: dong ngan khong ve muc tieu").toBe(
			`objective:${O}`,
		);
	});
});
