import { spyOn } from "bun:test";
import { db, type TrangThaiViec } from "@crm/db";
import type { NguonViec } from "@crm/db/viec";
import { doiTrangThai, type TaoViecInput, taoViec } from "@crm/db/viec-ghi";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { BackfillService } from "../../src/backfill/backfill.service";
import { createApp } from "../../src/create-app";
import { type DauVao, dangNhap, datMatKhau, goiTrpc } from "../ma-tran-thu";
import {
	dichVu,
	gieoBoPhan,
	gieoCongTy,
	gieoThanhVien,
	token,
} from "./ke-hoach-gieo";

export type KetGoi = {
	status: number;
	code: string | null;
	message: string;
	data: unknown;
};

const cookie = new Map<string, string>();

export async function batApp(): Promise<NestExpressApplication> {
	const app = await createApp();
	spyOn(app.get(BackfillService), "auto").mockResolvedValue({
		started: false,
	});
	return app;
}

export async function cookieCua(userId: string): Promise<string> {
	const co = cookie.get(userId);
	if (co) return co;
	await db.user.update({
		where: { id: userId },
		data: { emailVerified: true },
	});
	const moi = await dangNhap(await datMatKhau(userId));
	cookie.set(userId, moi);
	return moi;
}

export async function goi(
	app: NestExpressApplication,
	ten: string,
	loai: "query" | "mutation",
	input: DauVao,
	userId: string,
): Promise<KetGoi> {
	const res = await goiTrpc(app, ten, loai, input, {
		cookie: await cookieCua(userId),
	});
	return {
		status: res.status,
		code: res.body?.error?.data?.code ?? null,
		message: String(res.body?.error?.message ?? ""),
		data: res.body?.result?.data,
	};
}

export function nguoi(
	ten: string,
	vai: "owner" | "admin" | "member" | "okr" = "member",
) {
	return gieoThanhVien(ten, vai);
}

export async function thoaThuan(
	app: NestExpressApplication,
	chuId: string,
	ten = "VC Cty",
) {
	const congTy = await goi(
		app,
		"companies.create",
		"mutation",
		{ name: `${token()} ${ten}` },
		chuId,
	);
	const congTyId = (congTy.data as { id: string }).id;
	const deal = await goi(
		app,
		"deals.create",
		"mutation",
		{
			name: `${token()} Thoả thuận ${ten}`,
			companyId: congTyId,
			ownerId: chuId,
		},
		chuId,
	);
	return { congTyId, dealId: (deal.data as { id: string }).id };
}

export async function keHoachCua(congTyId: string, chuId: string) {
	const bp = await gieoBoPhan();
	const khuon = await dichVu().createTemplate({
		name: `khuon ${bp.name}`,
		partnerType: null,
		steps: [
			{ label: "Buoc mot", departmentId: bp.id, position: 0, offsetDays: 0 },
		],
	});
	return dichVu().createFromTemplate({
		companyId: congTyId,
		templateId: khuon.id,
		startedAt: new Date("2026-10-12T00:00:00.000Z"),
		ownerId: chuId,
	});
}

export async function congTyRieng() {
	return gieoCongTy();
}

export function taoThu(
	input: Omit<TaoViecInput, "nguon" | "now"> & {
		nguon?: NguonViec;
		now?: Date;
	},
): Promise<{ id: string }> {
	return db.$transaction((tx) =>
		taoViec(tx, {
			...input,
			nguon: input.nguon ?? "web",
			now: input.now ?? new Date(),
		}),
	);
}

export async function doiThu(
	viecId: string,
	nguoiId: string,
	den: TrangThaiViec,
	now = new Date(),
	nguon: NguonViec = "web",
): Promise<void> {
	await db.$transaction((tx) =>
		doiTrangThai(tx, { viecId, nguoiId, den, nguon, now }),
	);
}

export function demVet(viecId: string, loai?: string): Promise<number> {
	return db.viecVet.count({ where: { viecId, loai } });
}

export async function donViec(): Promise<void> {
	await db.viec.deleteMany({
		where: { taoBoi: { email: { endsWith: "@thu.test" } } },
	});
}
