import { randomUUID } from "node:crypto";
import { db, Prisma } from "@crm/db";
import { dauNgayVN } from "@crm/db/onboarding-nhac";
import { ghiKetQuaHoi } from "@crm/db/tai-lieu-hoi";
import { docNhieuBanDangDung } from "@crm/db/tai-lieu-tim";
import {
	type BanDangDung,
	type BanNop,
	kiemTraLoi,
	type LoiKiem,
	parseGanNhat,
	TAI_LIEU_HOI,
	traLoiDaKiem,
} from "@crm/validation/tai-lieu-hoi";
import { chuThuong } from "@crm/validation/tai-lieu-markdown";
import { type NguCanhKenh, phienGocCua } from "./phien-con";
import { TAI_LIEU_AGENT } from "./tai-lieu-config";
import type { DongTimKho } from "./tai-lieu-kho-doc";
import type { NhanKhoa } from "./tai-lieu-model";
import { chiPhiUsd } from "./tai-lieu-nop";

const HOI = TAI_LIEU_AGENT.hoi;
const KHONG_PHAI_HOI = "This session is not a library question.";
const DA_DONG = "This question is already closed. Stop.";

const cho = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function lap<T>(lam: () => Promise<T | null>): Promise<T | null> {
	for (let lan = 0; lan < HOI.timHoi.soLan; lan += 1) {
		const ra = await lam();
		if (ra) return ra;
		await cho(HOI.timHoi.cachMs);
	}
	return null;
}

async function hangDangHoi(phienGoc: string): Promise<string | null> {
	const hang = await db.taiLieuHoi.findFirst({
		where: { phienId: phienGoc, trangThai: "DANG_HOI" },
		orderBy: { hoiLuc: "desc" },
		select: { id: true },
	});
	return hang?.id ?? null;
}

export async function hoiCuaPhien(ctx: NguCanhKenh): Promise<string> {
	const goc = phienGocCua(ctx);
	if (!goc) throw new Error(KHONG_PHAI_HOI);
	const id = await lap(() => hangDangHoi(goc));
	if (!id) throw new Error(KHONG_PHAI_HOI);
	return id;
}

export async function hangCuaPhien(ctx: NguCanhKenh): Promise<string> {
	const goc = phienGocCua(ctx);
	if (!goc) throw new Error(KHONG_PHAI_HOI);
	const hang = await db.taiLieuHoi.findFirst({
		where: { phienId: goc },
		orderBy: { hoiLuc: "desc" },
		select: { id: true },
	});
	if (!hang) throw new Error(KHONG_PHAI_HOI);
	return hang.id;
}

async function moHoiZalo(goc: string): Promise<string | null> {
	const zalo = await db.zaloHoi.findFirst({
		where: { sessionId: goc, ketQua: "dang-hoi" },
		orderBy: { hoiLuc: "desc" },
		select: { id: true, crmUserId: true },
	});
	if (!zalo) return null;
	const hang = await db.taiLieuHoi.upsert({
		where: { zaloHoiId: zalo.id },
		create: {
			nguoiHoiId: zalo.crmUserId,
			kenh: "ZALO",
			zaloHoiId: zalo.id,
			phienId: goc,
		},
		update: {},
		select: { id: true, trangThai: true },
	});
	return hang.trangThai === "DANG_HOI" ? hang.id : null;
}

export async function ghiSaiCho(ctx: NguCanhKenh): Promise<void> {
	await db.agentEvent.create({
		data: {
			id: randomUUID(),
			sessionId: ctx.session?.id ?? HOI.phienKhongRo,
			type: HOI.saiCho,
			data: { phienGoc: phienGocCua(ctx) },
			emittedAt: new Date(),
		},
	});
}

export async function cauHoiCua(hoiId: string): Promise<string | null> {
	const hang = await db.taiLieuHoi.findUnique({
		where: { id: hoiId },
		select: { cauHoi: true },
	});
	return hang?.cauHoi?.trim() || null;
}

export async function moHoi(ctx: NguCanhKenh): Promise<string> {
	const goc = phienGocCua(ctx);
	if (!goc) throw new Error(KHONG_PHAI_HOI);
	const id = await lap(
		async () => (await hangDangHoi(goc)) ?? (await moHoiZalo(goc)),
	);
	if (!id) throw new Error(KHONG_PHAI_HOI);
	return id;
}

export async function ghiGanNhat(
	hoiId: string,
	dong: readonly DongTimKho[],
): Promise<void> {
	if (dong.length === 0) return;
	const gan = dong
		.slice(0, TAI_LIEU_HOI.ganNhatToiDa)
		.map((d) => ({ slug: d.slug, ten: d.ten }));
	await db.taiLieuHoi.updateMany({
		where: {
			id: hoiId,
			trangThai: "DANG_HOI",
			ganNhat: { equals: Prisma.AnyNull },
		},
		data: { ganNhat: gan },
	});
}

export type VaoNop =
	| { loai: "khong-biet"; cauHoi?: string }
	| { loai: "tra-loi"; cauHoi?: string; cau: BanNop["cau"] };

export type KetQuaNop =
	| { ok: true; ketQua: "TRA_LOI" | "TU_CHOI" }
	| { ok: false; loi: string };

function moTaLoi(loi: readonly LoiKiem[]): string {
	return loi.map((l) => `${l.loai}: ${l.chi}`).join("; ");
}

async function tuChoi(
	hoiId: string,
	lyDo: "khong-co-trang" | "trich-truot",
	cauHoi: string | undefined,
	now: Date,
): Promise<boolean> {
	return db.$transaction(async (tx) => {
		const hang = await tx.taiLieuHoi.findUniqueOrThrow({
			where: { id: hoiId },
			select: { ganNhat: true, cauHoi: true },
		});
		const xong = await ghiKetQuaHoi(
			tx,
			hoiId,
			{ trangThai: "TU_CHOI", lyDo, ganNhat: parseGanNhat(hang.ganNhat ?? []) },
			now,
		);
		if (xong && hang.cauHoi === null && cauHoi?.trim())
			await tx.taiLieuHoi.update({
				where: { id: hoiId },
				data: {
					cauHoi: cauHoi
						.normalize("NFC")
						.trim()
						.slice(0, TAI_LIEU_HOI.cauHoi.toiDa),
				},
			});
		return xong;
	});
}

function banCua(
	b: Awaited<ReturnType<typeof docNhieuBanDangDung>>[number],
): BanDangDung {
	return {
		slug: b.slug,
		ten: b.ten,
		phienBan: b.so,
		duyetLuc: b.duyetLuc.toISOString(),
		noiDung: b.noiDung,
		xacMinhDen: b.xacMinhDen?.toISOString() ?? null,
		chuTrang: b.chuTen,
	};
}

export async function nopTraLoi(
	hoiId: string,
	vao: VaoNop,
	now: Date,
): Promise<KetQuaNop> {
	const hang = await db.taiLieuHoi.findUnique({
		where: { id: hoiId },
		select: { trangThai: true },
	});
	if (hang?.trangThai !== "DANG_HOI") return { ok: false, loi: DA_DONG };
	if (vao.loai === "khong-biet") {
		if (!(await tuChoi(hoiId, "khong-co-trang", vao.cauHoi, now)))
			return { ok: false, loi: DA_DONG };
		return { ok: true, ketQua: "TU_CHOI" };
	}
	const slugs = vao.cau.flatMap((c) => c.trich.map((t) => t.slug));
	const ban = await docNhieuBanDangDung(db, slugs);
	const kq = kiemTraLoi(
		{ cau: vao.cau },
		new Map(ban.map((b) => [b.slug, banCua(b)])),
		dauNgayVN(now),
		chuThuong,
	);
	if (kq.ok) {
		if (
			!(await ghiKetQuaHoi(
				db,
				hoiId,
				{ trangThai: "TRA_LOI", traLoi: traLoiDaKiem.parse(kq.traLoi) },
				now,
			))
		)
			return { ok: false, loi: DA_DONG };
		return { ok: true, ketQua: "TRA_LOI" };
	}
	const bac = await db.taiLieuHoi.update({
		where: { id: hoiId },
		data: { soLanBac: { increment: 1 } },
		select: { soLanBac: true },
	});
	if (bac.soLanBac >= HOI.tranBac) {
		await tuChoi(hoiId, "trich-truot", vao.cauHoi, now);
		return {
			ok: false,
			loi: `Rejected ${bac.soLanBac} times (${moTaLoi(kq.loi)}). The question is closed as unanswered: dừng lại, do not submit again.`,
		};
	}
	return {
		ok: false,
		loi: `Rejected: ${moTaLoi(kq.loi)}. Copy each excerpt verbatim from read_page of the current version and keep every number inside an excerpt of its own sentence, then submit again.`,
	};
}

export async function ghiSoTroLyKho(
	hoiId: string,
	usage: { tokenVao: number; tokenRa: number },
	nhanKhoa: NhanKhoa,
): Promise<void> {
	const tien = chiPhiUsd(HOI.maModel, usage.tokenVao, usage.tokenRa) ?? 0;
	await db.taiLieuHoi.update({
		where: { id: hoiId },
		data: {
			tokenVao: { increment: usage.tokenVao },
			tokenRa: { increment: usage.tokenRa },
			chiPhiUsd: { increment: tien },
			nhanKhoa,
		},
	});
}
