import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { congTy } from "./okr-mau-san";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	goi,
	goiRest,
	ketThucMau,
	nguoi,
	ok,
} from "./tro-ly-okr-san";
import {
	cookieCua,
	type Duong,
	donTomTat,
	HAI_DUONG,
	thanhVienCua,
	truongCua,
} from "./tro-ly-okr-tom-tat-san";

const PHONG = "kd-bac";

type CuaToi = { dongTroLyOkr: boolean; laTruongPhong: boolean };

let app: NestExpressApplication;
const truong = truongCua(PHONG);
const thanhVien = thanhVienCua(PHONG)[0] ?? "";
const truongBoPhan =
	congTy().boPhan.find(
		(b) => !congTy().phongBan.some((p) => p.truong === b.truong),
	)?.truong ?? "";

async function cuaToi(ma: string, duong: Duong): Promise<CuaToi> {
	const cookie = await cookieCua(ma);
	const tra =
		duong === "trpc"
			? await goi(app, "zalo.cuaToi", "query", undefined, cookie)
			: await goiRest(app, "GET", "/zalo/me", {}, cookie);
	const d = ok<CuaToi>(tra, `cuaToi ${ma} ${duong}`);
	return { dongTroLyOkr: d.dongTroLyOkr, laTruongPhong: d.laTruongPhong };
}

async function luu(
	ma: string,
	duong: Duong,
	vao: { bat: boolean; userId?: string },
) {
	const cookie = await cookieCua(ma);
	return duong === "trpc"
		? goi(app, "zalo.luuDongTroLyOkr", "mutation", vao, cookie)
		: goiRest(app, "PUT", "/zalo/preference/okr-weekly-summary", vao, cookie);
}

const hangKho = async (ma: string) =>
	(
		await db.notificationPreference.findUnique({
			where: { userId: nguoi(ma) },
			select: { dongTroLyOkr: true },
		})
	)?.dongTroLyOkr ?? null;

beforeAll(async () => {
	if (!thanhVien || !truongBoPhan) throw new Error("bo mau thieu nguoi");
	await batDauMau();
	await donTomTat();
	app = await dungUngDung();
}, CHO_DB);

afterAll(async () => {
	await donTomTat();
	await ketThucMau(app);
}, CHO_DB);

describe("tat-dong", () => {
	test(
		"doc: chưa có hàng → dòng bật; laTruongPhong đúng cho trưởng phòng, thành viên thường và trưởng bộ phận không trưởng phòng nào",
		async () => {
			const thuc: string[] = [];
			const muon: string[] = [];
			for (const duong of HAI_DUONG)
				for (const [ma, laTruong] of [
					[truong, true],
					[thanhVien, false],
					[truongBoPhan, false],
				] as const) {
					thuc.push(
						`${ma} ${duong}: ${JSON.stringify(await cuaToi(ma, duong))}`,
					);
					muon.push(
						`${ma} ${duong}: ${JSON.stringify({ dongTroLyOkr: true, laTruongPhong: laTruong })}`,
					);
				}
			expect(thuc).toEqual(muon);
		},
		CHO_DB,
	);

	test(
		"ghi: tắt rồi bật lại đổi đúng hàng của người gọi (đọc lại từ kho), không đổi hàng của người khác dù input mang userId khác",
		async () => {
			ok(await luu(thanhVien, "trpc", { bat: false }), "thanh vien tat");
			expect(await hangKho(thanhVien)).toBe(false);
			const buoc: { duong: Duong; bat: boolean }[] = [
				{ duong: "trpc", bat: false },
				{ duong: "rest", bat: true },
				{ duong: "rest", bat: false },
				{ duong: "trpc", bat: true },
			];
			const lech: string[] = [];
			for (const { duong, bat } of buoc) {
				ok(
					await luu(truong, duong, { bat, userId: nguoi(thanhVien) }),
					`truong ${duong} ${bat}`,
				);
				const kho = {
					truong: await hangKho(truong),
					khac: await hangKho(thanhVien),
				};
				if (kho.truong !== bat || kho.khac !== false)
					lech.push(
						`ghi nham nguoi: ${duong} bat=${bat} truong=${kho.truong} khac=${kho.khac}`,
					);
				const doc = await cuaToi(truong, duong);
				if (doc.dongTroLyOkr !== bat)
					lech.push(
						`doc lai lech: ${duong} bat=${bat} doc=${doc.dongTroLyOkr}`,
					);
			}
			expect(lech[0] ?? "dung nguoi").toBe("dung nguoi");
			expect(await cuaToi(thanhVien, "trpc")).toEqual({
				dongTroLyOkr: false,
				laTruongPhong: false,
			});
		},
		CHO_DB,
	);
});
