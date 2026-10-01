import { auth } from "@crm/auth";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { AnyProcedure } from "@trpc/server";
import { hashPassword } from "better-auth/crypto";
import { AppRouterHost } from "nestjs-trpc";
import request from "supertest";
import { z } from "zod";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";

export const MAT_KHAU = "mat-khau-thu-du-dai-1";

export type Loai = "query" | "mutation";
export type ThuTuc = {
	ten: string;
	loai: Loai;
	restKey: string | null;
	coDauVao: boolean;
};
export type HangMaTran = { ten: string; status: number; message: string };
export type Dau = Record<string, string>;
export type GiaTriDauVao =
	| string
	| number
	| boolean
	| null
	| readonly GiaTriDauVao[]
	| { readonly [khoa: string]: GiaTriDauVao };
export type DauVaoHopLe = Readonly<Record<string, GiaTriDauVao>>;
export type DauVao = DauVaoHopLe | undefined;

const khaiRest = z
	.object({ openapi: z.object({ method: z.string(), path: z.string() }) })
	.transform((m) => m.openapi);

export function soThuTuc(app: INestApplication): ThuTuc[] {
	const { appRouter } = app.get(AppRouterHost);
	const procs = appRouter._def.procedures as Record<string, AnyProcedure>;
	return Object.entries(procs)
		.flatMap(([ten, p]) => {
			const type = p._def.type;
			if (type !== "query" && type !== "mutation") return [];
			const rest = khaiRest.safeParse(p._def.meta);
			return [
				{
					ten,
					loai: type,
					restKey: rest.success
						? `${rest.data.method.toUpperCase()} ${REST_BRIDGE_PATH}${rest.data.path}`
						: null,
					coDauVao: (p._def.inputs as unknown[]).length > 0,
				},
			];
		})
		.sort((a, b) =>
			a.loai === b.loai
				? a.ten.localeCompare(b.ten)
				: a.loai === "query"
					? -1
					: 1,
		);
}

export function gan(req: request.Test, dau: Dau): request.Test {
	let r = req;
	for (const [k, v] of Object.entries(dau)) r = r.set(k, v);
	return r;
}

export async function goiTrpc(
	app: NestExpressApplication,
	ten: string,
	loai: Loai,
	input: DauVao,
	dau: Dau,
): Promise<request.Response> {
	const server = app.getHttpServer();
	if (loai === "query") {
		const duong =
			input === undefined
				? `/api/trpc/${ten}`
				: `/api/trpc/${ten}?input=${encodeURIComponent(JSON.stringify(input))}`;
		return gan(request(server).get(duong), dau);
	}
	return gan(
		request(server)
			.post(`/api/trpc/${ten}`)
			.set("content-type", "application/json")
			.send(JSON.stringify(input ?? {})),
		dau,
	);
}

export async function maTranTrpc(
	app: NestExpressApplication,
	dau: Dau,
): Promise<HangMaTran[]> {
	const hang: HangMaTran[] = [];
	for (const { ten, loai } of soThuTuc(app)) {
		const res = await goiTrpc(app, ten, loai, undefined, dau);
		hang.push({
			ten,
			status: res.status,
			message: String(res.body?.error?.message ?? ""),
		});
	}
	return hang;
}

export async function maTranRest(
	app: NestExpressApplication,
	dau: Dau,
): Promise<HangMaTran[]> {
	const hang: HangMaTran[] = [];
	const server = app.getHttpServer();
	for (const { restKey } of soThuTuc(app)) {
		if (!restKey) continue;
		const [method, path] = restKey.split(" ") as [string, string];
		const url = path.replace(/\{[^}]+\}/g, "khong-co");
		const verb = method.toLowerCase() as
			| "get"
			| "post"
			| "patch"
			| "put"
			| "delete";
		let req = request(server)[verb](url);
		if (verb !== "get" && verb !== "delete") {
			req = req.set("content-type", "application/json").send("{}");
		}
		const res = await gan(req, dau);
		hang.push({
			ten: restKey,
			status: res.status,
			message: String(res.body?.message ?? ""),
		});
	}
	return hang;
}

export async function datMatKhau(userId: string): Promise<string> {
	const now = new Date();
	await db.account.upsert({
		where: { id: `acc-${userId}` },
		create: {
			id: `acc-${userId}`,
			accountId: userId,
			providerId: "credential",
			userId,
			password: await hashPassword(MAT_KHAU),
			createdAt: now,
			updatedAt: now,
		},
		update: {},
	});
	return `${userId}@thu.test`;
}

export async function dangNhap(email: string): Promise<string> {
	const { headers } = await auth.api.signInEmail({
		body: { email, password: MAT_KHAU },
		returnHeaders: true,
	});
	return headers
		.getSetCookie()
		.map((c) => c.split(";")[0])
		.join("; ");
}
