import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { type LoaiNhac, NHAC } from "@crm/db/onboarding-nhac";
import { ZALO } from "../agent/lib/zalo-config";
import { donDep } from "./support/nhac-gieo";
import { lucVN, NGAY_NHAC, PHUT_SAU } from "./support/nhac-gui-gieo";
import {
	batBot,
	donTraLoi,
	gieoNhac,
	guiNhac,
	noiZalo,
	phanTu,
} from "./support/tra-loi-gieo";

const GOC = lucVN(NGAY_NHAC, PHUT_SAU);

const TIEU_DE: Record<LoaiNhac, string> = {
	"buoc-qua-han": "Quá hạn",
	"buoc-sap-han": "Sắp hạn",
	"ke-hoach-im": "Kế hoạch im",
	"moc-ngay": "Mốc ngày",
};

const DANH_SO = /^(\d+)\. /;

function dongDanhSo(text: string): string[] {
	return text.split("\n").filter((d) => DANH_SO.test(d));
}

function tieuDeTren(text: string, dong: string): string | undefined {
	const cac = text.split("\n");
	const tieuDe = new Set(Object.values(TIEU_DE));
	return cac
		.slice(0, cac.indexOf(dong))
		.reverse()
		.find((d) => tieuDe.has(d));
}

beforeEach(async () => {
	await donTraLoi();
	await batBot();
});

afterAll(async () => {
	await donTraLoi();
	await donDep();
});

describe("danh-so", () => {
	test("danh-so: dong n cua tin Zalo thuoc daGui[n-1], goi y mot dong, trong tran, Slack khong so", async () => {
		let daChay = 0;

		const { A } = await gieoNhac(GOC, { quaHan: 1, sapHan: 1, im: true, moc: true });
		await noiZalo(A.id, "ZA");
		const bon = await guiNhac(A.id, GOC);
		expect(bon.kenh, "o zalo-bon di qua Zalo").toBe("zalo");
		expect(bon.daGui.map((m) => m.loai), "du bon loai").toEqual([
			"buoc-qua-han",
			"buoc-sap-han",
			"ke-hoach-im",
			"moc-ngay",
		]);
		const dong = dongDanhSo(bon.text);
		expect(dong.length, "so dong danh so = daGui.length").toBe(bon.daGui.length);
		dong.forEach((d, i) => {
			const n = i + 1;
			const muc = phanTu(bon.daGui, n);
			expect(d.startsWith(`${n}. `), `dong ${n} bat dau "${n}. "`).toBe(true);
			expect(
				d.endsWith(`?record=plan:${muc.planId}`),
				`dong n thuoc daGui[n-1]: dong ${n}`,
			).toBe(true);
			expect(tieuDeTren(bon.text, d), `tieu de cua dong ${n}`).toBe(
				TIEU_DE[muc.loai],
			);
		});
		expect(
			bon.text.split("\n").filter((d) => d.includes("xong 2")).length,
			"dung mot dong goi y",
		).toBe(1);
		daChay += 1;

		const { A: M } = await gieoNhac(
			GOC,
			{ quaHan: NHAC.tran + 2, tenDai: true },
			"Minh",
		);
		await noiZalo(M.id, "ZM");
		const dai = await guiNhac(M.id, GOC);
		expect(dai.text.length, "khong vuot tran").toBeLessThanOrEqual(ZALO.tranKyTu);
		expect(dai.daGui.length, "tran thuc su cat bot dong").toBeLessThan(NHAC.tran);
		expect(dongDanhSo(dai.text).length, "so dong danh so = daGui.length").toBe(
			dai.daGui.length,
		);
		daChay += 1;

		const { A: B } = await gieoNhac(
			GOC,
			{ quaHan: 1, sapHan: 1, im: true, moc: true },
			"Binh",
		);
		const slack = await guiNhac(B.id, GOC, { slack: true });
		expect(slack.kenh, "o slack di qua Slack").toBe("slack");
		expect(slack.text.length, "Slack co tin").toBeGreaterThan(0);
		expect(dongDanhSo(slack.text), "Slack khong danh so").toEqual([]);
		expect(slack.text.includes("xong 2"), "Slack khong goi y").toBe(false);
		daChay += 1;

		expect(daChay, "so o thuc chay").toBe(3);
	});
});
