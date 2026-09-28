import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { type KieuKr, xuHuongKr } from "@crm/db/okr-xu-huong";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { COOKIE_NAME, kyCookie } from "./phien-thu";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	ghiCauHinh,
	goi,
	goiRest,
	ketThucMau,
	kr,
	NAC_CAU_HINH,
	ok,
	phienMau,
	TIEN_TO_TLO,
} from "./tro-ly-okr-san";

const KR_CRM = kr("q4-kd-bac-1-k1");
const KR_MANG_SANG = kr("q4-kd-bac-2-k1");
const KR_TAY = kr("q4-kd-bac-1-k2");
const NGAY_MS = 24 * 60 * 60 * 1000;
const NGOAI = `${TIEN_TO_TLO}nguoi-ngoai`;

type XuHuong = { moiTuan: number; uocCuoiKy: number } | null;

let app: NestExpressApplication;
let cookieTruong = "";
let cookieQuanTri = "";
let cookieNgoai = "";

const dauTuan = (ngay: Date) =>
	new Date(ngay.getTime() - ((ngay.getUTCDay() + 6) % 7) * NGAY_MS);

async function kyVongCrm(): Promise<XuHuong> {
	const k = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: KR_CRM },
		select: { kind: true, objective: { select: { cycle: true } } },
	});
	const chup = await db.okrSoChup.findMany({
		where: { keyResultId: KR_CRM, nguon: "crm" },
		orderBy: [{ ngay: "asc" }, { chupLuc: "asc" }],
	});
	expect(chup.length).toBeGreaterThanOrEqual(3);
	return xuHuongKr(
		chup.map((c) => ({ tuan: dauTuan(c.ngay), giaTri: c.giaTri.toNumber() })),
		k.objective.cycle.endsOn,
		k.kind as KieuKr,
	);
}

async function kyVongMangSang(): Promise<XuHuong> {
	const k = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: KR_MANG_SANG },
		select: {
			title: true,
			kind: true,
			objective: {
				select: {
					cycle: { select: { endsOn: true } },
					mangSangTu: { select: { tuObjectiveId: true } },
				},
			},
		},
	});
	const tu = k.objective.mangSangTu?.tuObjectiveId ?? "";
	const cu = await db.okrKeyResult.findFirstOrThrow({
		where: { objectiveId: tu, title: k.title },
	});
	const lan = await db.okrCheckIn.findMany({
		where: { keyResultId: cu.id },
		orderBy: [{ weekStart: "asc" }, { createdAt: "asc" }],
	});
	expect(lan.length).toBeGreaterThanOrEqual(3);
	return xuHuongKr(
		lan.map((l) => ({ tuan: l.weekStart, giaTri: l.value.toNumber() })),
		k.objective.cycle.endsOn,
		k.kind as KieuKr,
	);
}

async function xuHuong(keyResultId: string, cookie = cookieTruong) {
	return goi(app, "okr.xuHuongKr", "query", { keyResultId }, cookie);
}

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	cookieTruong = await phienMau("nguyen-thi-lan");
	cookieQuanTri = await phienMau("le-hai-dang");
	const now = new Date();
	await db.user.create({
		data: {
			id: NGOAI,
			name: "Người ngoài",
			email: `${NGOAI}@thu.test`,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		},
	});
	const token = `dev-session-${NGOAI}`;
	await db.session.create({
		data: {
			id: token,
			token,
			userId: NGOAI,
			expiresAt: new Date(now.getTime() + NGAY_MS),
			updatedAt: now,
		},
	});
	cookieNgoai = `${COOKIE_NAME}=${await kyCookie(token)}`;
	await ghiCauHinh(app, cookieQuanTri, NAC_CAU_HINH.bat);
}, CHO_DB);

afterAll(async () => {
	await db.session.deleteMany({ where: { userId: NGOAI } });
	await db.user.deleteMany({ where: { id: NGOAI } });
	await ketThucMau(app);
}, CHO_DB);

describe("xu-huong-api", () => {
	test(
		"KR nguồn CRM và KR mang sang: đúng số hàm tính trên dữ liệu đọc lại; qua REST bằng tRPC",
		async () => {
			const crm = await kyVongCrm();
			expect(crm).not.toBeNull();
			expect(ok<XuHuong>(await xuHuong(KR_CRM), "crm")).toEqual(crm);
			const rest = await goiRest(
				app,
				"GET",
				"/okr/key-results/{keyResultId}/trend",
				{ keyResultId: KR_CRM },
				cookieTruong,
			);
			expect(ok<XuHuong>(rest, "crm rest")).toEqual(crm);
			const mangSang = await kyVongMangSang();
			expect(mangSang).not.toBeNull();
			expect(ok<XuHuong>(await xuHuong(KR_MANG_SANG), "mang sang")).toEqual(
				mangSang,
			);
		},
		CHO_DB,
	);

	test(
		"KR tay không mang sang → null",
		async () => {
			expect(ok<XuHuong>(await xuHuong(KR_TAY), "tay")).toBeNull();
		},
		CHO_DB,
	);

	test(
		"đơn vị không ở nấc bật → null",
		async () => {
			for (const nac of ["an", "tat"] as const) {
				await ghiCauHinh(app, cookieQuanTri, NAC_CAU_HINH[nac]);
				expect(
					ok<XuHuong>(await xuHuong(KR_CRM), `nac ${nac}`),
					"xu huong khi chua bat",
				).toBeNull();
			}
			await ghiCauHinh(app, cookieQuanTri, NAC_CAU_HINH.bat);
		},
		CHO_DB,
	);

	test(
		"người không đọc được KR → 403",
		async () => {
			expect((await xuHuong(KR_CRM, cookieNgoai)).status).toBe(403);
		},
		CHO_DB,
	);
});
