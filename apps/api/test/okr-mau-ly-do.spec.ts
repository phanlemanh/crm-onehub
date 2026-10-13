import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { z } from "zod";
import { docBoOkrMau } from "../scripts/okr-mau/khuon";
import { idMau } from "../scripts/okr-mau/nap";
import { OkrService } from "../src/okr/okr.service";
import { congTy, congTyChu, nguoiMau } from "./okr-mau-san";
import { batDauMau, CHO_DB, dungUngDung, ketThucMau } from "./tro-ly-okr-san";

const MUC_TIN = ["chua-co-ly-do", "dat-cuoc", "co-so-lieu"] as const;

const caMan = z
	.object({
		nguoiXem: z.string(),
		ca: z
			.array(
				z.object({
					ma: z.string(),
					mucTin: z.enum(MUC_TIN),
					kara: z.boolean(),
					dai: z.boolean().optional(),
				}),
			)
			.length(3),
	})
	.parse(
		JSON.parse(
			readFileSync(
				join(
					import.meta.dir,
					"../../../_acceptance/duong-ly-do-muc-tieu/rang/ca-man.json",
				),
				"utf8",
			),
		),
	);

let app: NestExpressApplication;

beforeAll(async () => {
	app = await dungUngDung();
	await batDauMau();
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

const doc = (ma: string) =>
	app.get(OkrService).objective(nguoiMau(caMan.nguoiXem), idMau("mt", ma));

describe("ly-do-mau", () => {
	test(
		"ly-do-mau bo mau gieo du ba muc tin va doc lai dung qua OkrService",
		async () => {
			const coCanChinh = congTy().mucTieu.filter((m) => m.canChinh);
			const gap = new Set<string>();
			let soKara = 0;
			for (const m of coCanChinh) {
				const ct = await doc(m.ma);
				const dau = ct.alignments[0];
				if (!dau)
					throw new Error(`ly do mau khong vao csdl: ${m.ma} mat can chinh`);
				gap.add(dau.mucTin);
				if (dau.lyDoTuKara) soKara += 1;
				const khai = m.canChinh;
				const thuc = { lyDo: dau.lyDo, canCu: dau.canCu, kara: dau.lyDoTuKara };
				const mong = {
					lyDo: khai?.lyDo ?? null,
					canCu: khai?.canCu ?? null,
					kara: khai?.lyDoTuKara ?? false,
				};
				if (JSON.stringify(thuc) !== JSON.stringify(mong))
					throw new Error(
						`ly do mau khong vao csdl: ${m.ma} ${JSON.stringify(thuc)} khac ${JSON.stringify(mong)}`,
					);
			}
			expect([...gap].sort()).toEqual([...MUC_TIN].sort());
			expect(soKara).toBeGreaterThanOrEqual(1);
		},
		CHO_DB,
	);

	test("ly-do-mau can cu khong kem ly do bi tu choi, bo can cu thi doc duoc", () => {
		const banSao = JSON.parse(congTyChu());
		const ca = banSao.mucTieu.find(
			(m: { ma: string }) => m.ma === "q4-kd-nam-2",
		);
		ca.canChinh = { ...ca.canChinh, canCu: "Có số liệu nhưng không có lý do" };
		let loi = "";
		try {
			docBoOkrMau(JSON.stringify(banSao));
		} catch (e) {
			loi = e instanceof Error ? e.message : String(e);
		}
		if (!(loi.includes("canChinh") && loi.includes("canCu")))
			throw new Error(`khuon nhan can cu khong ly do: '${loi}'`);
		expect(loi).toContain("căn cứ cần đi kèm lý do");
		delete ca.canChinh.canCu;
		expect(docBoOkrMau(JSON.stringify(banSao)).mucTieu.length).toBe(
			congTy().mucTieu.length,
		);
	});
});

describe("man-doc-lai", () => {
	test(
		"man-doc-lai ba ma tren man doc tu csdl dung muc tin da khai",
		async () => {
			let soCa = 0;
			for (const c of caMan.ca) {
				const ct = await doc(c.ma);
				const dau = ct.alignments[0];
				if (dau?.mucTin !== c.mucTin || dau.lyDoTuKara !== c.kara)
					throw new Error(
						`man doc lai lech: ${c.ma} ${dau?.mucTin}/${dau?.lyDoTuKara} khac ${c.mucTin}/${c.kara}`,
					);
				soCa += 1;
			}
			expect(soCa).toBe(3);
		},
		CHO_DB,
	);
});
