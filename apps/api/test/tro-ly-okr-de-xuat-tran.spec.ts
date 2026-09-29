import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import { okrTroLyViec } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import {
	batDauMau,
	CHO_DB,
	datDongHo,
	dungUngDung,
	ghiCauHinh,
	gieoChiPhi,
	goi,
	ketThucMau,
	mt,
	NAC_CAU_HINH,
	nguoi,
	nopThat,
	ok,
	phienMau,
	tienDongHo,
} from "./tro-ly-okr-san";

type XepRa =
	| { bat: true; taskId: string; dungLai: boolean }
	| { bat: false; lyDo: string };

const MT_A = mt("q4-kd-bac-1");
const MT_B = mt("q4-kd-bac-2");
const TRUONG = "nguyen-thi-lan";

let app: NestExpressApplication;
let cookieTruong = "";
let cookieQuanTri = "";
let dem = 0;

const soHang = () => db.agentTask.count({ where: { kind: "okr-de-xuat" } });

async function bam(objectiveId: string): Promise<XepRa> {
	tienDongHo();
	return ok<XepRa>(
		await goi(
			app,
			"okr.troLyDeXuat",
			"mutation",
			{ objectiveId },
			cookieTruong,
		),
		`troLyDeXuat ${objectiveId}`,
	);
}

async function doiTen(objectiveId: string): Promise<void> {
	dem += 1;
	tienDongHo();
	ok(
		await goi(
			app,
			"okr.updateObjective",
			"mutation",
			{
				id: objectiveId,
				title: `Giữ đà bán lẻ miền Bắc, bản ${"x".repeat(dem)}`,
			},
			cookieTruong,
		),
		"doi ten",
	);
}

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	cookieTruong = await phienMau(TRUONG);
	cookieQuanTri = await phienMau("le-hai-dang");
	await ghiCauHinh(app, cookieQuanTri, NAC_CAU_HINH.bat);
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

describe("dung-lai-tran", () => {
	let taskDau = "";

	test(
		"(a) lần đầu ghi đúng một hàng nấc bật mang người gọi",
		async () => {
			const truoc = await soHang();
			const ra = await bam(MT_A);
			if (!ra.bat) throw new Error(`khong xep: ${ra.lyDo}`);
			expect(await soHang()).toBe(truoc + 1);
			const hang = await db.agentTask.findUniqueOrThrow({
				where: { id: ra.taskId },
			});
			const viec = okrTroLyViec.parse(hang.payload);
			expect(viec).toMatchObject({
				viec: "de-xuat",
				objectiveId: MT_A,
				nac: "bat",
				nguoiYeuCau: nguoi(TRUONG),
			});
			taskDau = ra.taskId;
		},
		CHO_DB,
	);

	test(
		"(b) bấm lại khi hàng trước đã đóng 'da-nop' với 0 dòng → cùng taskId, không thêm hàng",
		async () => {
			const kq = await nopThat(taskDau, []);
			expect(kq.soDong).toBe(0);
			const hang = await db.agentTask.findUniqueOrThrow({
				where: { id: taskDau },
				select: { outcome: true },
			});
			expect(hang.outcome).toBe("da-nop");
			const truoc = await soHang();
			const ra = await bam(MT_A);
			expect(ra).toEqual({ bat: true, taskId: taskDau, dungLai: true });
			expect(await soHang()).toBe(truoc);
		},
		CHO_DB,
	);

	test(
		"(c) đổi tên qua okr.updateObjective rồi bấm → hàng mới",
		async () => {
			await doiTen(MT_A);
			const truoc = await soHang();
			const ra = await bam(MT_A);
			if (!ra.bat) throw new Error(`khong xep: ${ra.lyDo}`);
			expect(ra.taskId).not.toBe(taskDau);
			expect(ra.dungLai).toBe(false);
			expect(await soHang()).toBe(truoc + 1);
		},
		CHO_DB,
	);

	test(
		"(d) lượt trần+1 với đầu vào mới → het-tran-ngay; bấm lại đầu vào cũ vẫn trả việc cũ; sang ngày mới lại được",
		async () => {
			const tran = TRO_LY_OKR_TRAN.troLyNgayMoiNguoi;
			let cuoi = "";
			for (;;) {
				const daDung = await db.agentTask.count({
					where: {
						kind: "okr-de-xuat",
						AND: [
							{ payload: { path: ["nguoiYeuCau"], equals: nguoi(TRUONG) } },
							{ payload: { path: ["nac"], equals: "bat" } },
						],
					},
				});
				if (daDung >= tran) break;
				await doiTen(MT_A);
				const ra = await bam(MT_A);
				if (!ra.bat || ra.dungLai)
					throw new Error(`luot ${daDung + 1} khong ghi hang moi`);
				cuoi = ra.taskId;
			}
			const truoc = await soHang();
			const qua = await bam(MT_B);
			expect(qua).toEqual({ bat: false, lyDo: "het-tran-ngay" });
			expect(await soHang()).toBe(truoc);
			const lai = await bam(MT_A);
			expect(lai, "dung lai bi tinh vao tran ngay").toEqual({
				bat: true,
				taskId: cuoi,
				dungLai: true,
			});
			expect(await soHang()).toBe(truoc);
			datDongHo(new Date("2026-11-13T00:30:00+07:00"));
			const moi = await bam(MT_B);
			expect(moi.bat).toBe(true);
			expect(await soHang()).toBe(truoc + 1);
		},
		CHO_DB,
	);

	test(
		"(e) sổ chi phí chạm đúng trần tháng → het-tran-thang",
		async () => {
			const ct = ok<{ aiTranThangUsd: number }>(
				await goi(app, "okr.program", "query", undefined, cookieQuanTri),
				"program",
			);
			await gieoChiPhi({
				id: "cham-tran",
				taskId: null,
				usd: String(ct.aiTranThangUsd),
			});
			await doiTen(MT_B);
			const truoc = await soHang();
			expect(await bam(MT_B)).toEqual({ bat: false, lyDo: "het-tran-thang" });
			expect(await soHang()).toBe(truoc);
			const sanSang = ok<{ bat: boolean; lyDo?: string }>(
				await goi(
					app,
					"okr.troLySanSang",
					"query",
					{ objectiveId: MT_B },
					cookieTruong,
				),
				"san sang",
			);
			expect(sanSang).toEqual({ bat: false, lyDo: "het-tran-thang" });
		},
		CHO_DB,
	);
});
