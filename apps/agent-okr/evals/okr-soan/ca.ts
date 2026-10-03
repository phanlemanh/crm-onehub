import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { CAP_CUOC, type DonViCuocSoan } from "@crm/db/okr-cuoc-soan";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "../../agent/lib/config";
import CA_MAU from "./ca/mau.json";

const DG = TRO_LY_OKR_SOAN.danhGia;

export const caSoan = z.object({
	id: z.string().trim().min(1),
	cap: z.enum(CAP_CUOC),
	ma: z.string().trim().min(1).nullable(),
	chen: z.boolean().default(false),
});

export type CaSoan = z.infer<typeof caSoan>;

function docThuMuc(thuMuc: string): CaSoan[] {
	return readdirSync(thuMuc)
		.filter((t) => t.endsWith(".json"))
		.sort()
		.flatMap((t) =>
			z.array(caSoan).parse(JSON.parse(readFileSync(join(thuMuc, t), "utf8"))),
		);
}

export function boCa(): CaSoan[] {
	const them = process.env[DG.env.thuMucThem]?.trim();
	const ca = [
		...z.array(caSoan).parse(CA_MAU),
		...(them ? docThuMuc(them) : []),
	];
	if (ca.length < DG.soCaToiThieu)
		throw new Error(`bo ca soan ${ca.length} < ${DG.soCaToiThieu}`);
	return ca;
}

export type CapAB = { ca: CaSoan; vong: number; khoa: string; traLoi: string };

export function soCapAB(): number {
	const so = Number(process.env[DG.env.soCapAB]);
	return Number.isInteger(so) && so > 0 ? so : DG.boiCanh.soCapMacDinh;
}

export function danhSachCap(ca: readonly CaSoan[], soCap: number): CapAB[] {
	const traLoi = DG.boiCanh.traLoiTheoVong;
	return Array.from({ length: soCap }, (_, i) => i).flatMap((i) => {
		const c = ca[i % ca.length];
		const vong = Math.floor(i / ca.length);
		const tl = traLoi[vong % traLoi.length];
		return c && tl
			? [{ ca: c, vong, khoa: `${c.id}#v${vong + 1}`, traLoi: tl }]
			: [];
	});
}

const vaiPhien = z.enum(TRO_LY_OKR_SOAN.vaiDuocVao);

export type DonViCa = Omit<DonViCuocSoan, "cycleId"> & {
	ten: string;
	nguoiMo: string;
	vai: z.infer<typeof vaiPhien>;
};

const idMau = (loai: string, ma: string) => `${DG.tienToMau}${loai}-${ma}`;

async function nguoiQuanTriMau(): Promise<string> {
	const ds = await db.member.findMany({
		where: {
			organizationId: WORKSPACE_ID,
			role: { in: ["owner", "admin"] },
			user: { email: { endsWith: DG.mienMau } },
		},
		orderBy: { userId: "asc" },
		select: { userId: true },
	});
	const dau = ds[0]?.userId;
	if (!dau)
		throw new Error("chua nap bo OKR mau: khong co quan tri @mau.onehub.test");
	return dau;
}

async function vaiCua(userId: string) {
	const m = await db.member.findUnique({
		where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId } },
		select: { role: true },
	});
	return vaiPhien.parse(m?.role);
}

async function donViGoc(ca: CaSoan) {
	if (ca.cap === "onehub")
		return {
			donVi: { level: ca.cap, divisionId: null, departmentId: null },
			ten: "OneHub",
			truong: await nguoiQuanTriMau(),
		};
	const ma = ca.ma ?? "";
	if (ca.cap === "bo-phan") {
		const bp = await db.division.findFirst({
			where: { id: idMau("bp", ma), archivedAt: null },
			select: { id: true, name: true, headUserId: true },
		});
		if (!bp) throw new Error(`chua nap bo OKR mau: bo phan ${ma}`);
		return {
			donVi: { level: ca.cap, divisionId: bp.id, departmentId: null },
			ten: bp.name,
			truong: bp.headUserId ?? (await nguoiQuanTriMau()),
		};
	}
	const pb = await db.department.findFirst({
		where: { id: idMau("pb", ma), archivedAt: null },
		select: { id: true, name: true, headUserId: true, divisionId: true },
	});
	if (!pb) throw new Error(`chua nap bo OKR mau: phong ban ${ma}`);
	return {
		donVi: { level: ca.cap, divisionId: pb.divisionId, departmentId: pb.id },
		ten: pb.name,
		truong: pb.headUserId ?? (await nguoiQuanTriMau()),
	};
}

export async function donViCua(ca: CaSoan): Promise<DonViCa> {
	const g = await donViGoc(ca);
	return {
		...g.donVi,
		ten: g.ten,
		nguoiMo: g.truong,
		vai: await vaiCua(g.truong),
	};
}

export async function donViTrong(ca: CaSoan, goc: DonViCa) {
	const pb = await db.department.create({
		data: {
			id: `${idMau("pb", `trong-${ca.id}`)}-${randomUUID().slice(0, 8)}`,
			name: `${goc.ten}${DG.boiCanh.hauToTrong}`,
			position: 0,
			moTa: "",
			divisionId: null,
			headUserId: null,
		},
		select: { id: true, name: true },
	});
	const donVi: DonViCa = {
		level: "phong-ban",
		divisionId: null,
		departmentId: pb.id,
		ten: pb.name,
		nguoiMo: goc.nguoiMo,
		vai: goc.vai,
	};
	return {
		donVi,
		luuTru: async () => {
			await db.department.update({
				where: { id: pb.id },
				data: { archivedAt: new Date() },
			});
		},
	};
}
