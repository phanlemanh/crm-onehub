import { randomUUID } from "node:crypto";
import { db } from "@crm/db";
import {
	type CuocSoan,
	capNhatPhien,
	type DonViCuocSoan,
	docCuoc,
	moCuoc,
} from "@crm/db/okr-cuoc-soan";
import { LOAI_TRANG_CHIEN_LUOC } from "@crm/db/tai-lieu-chien-luoc";
import { OKR_PROGRAM_MAC_DINH } from "@crm/validation/okr-chuong-trinh";
import { PHIEN_CHO_EVE } from "@crm/validation/okr-cuoc-soan";
import { khoaDong } from "@crm/validation/okr-kiem-de-xuat";
import { type DongSoan, dongSoanTuHang } from "@crm/validation/okr-tro-ly";
import { Client, type MessageResult } from "eve/client";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "../../agent/lib/config";
import { mintOkr, yeuSach } from "./the";
import {
	type DongChiPhi,
	nhomLanNop,
	type TongChiPhi,
	tongChiPhi,
} from "./tinh";

const DG = TRO_LY_OKR_SOAN.danhGia;

export const KICH_BAN = {
	moDau:
		"Soạn bộ OKR quý này cho đơn vị: nói điều bạn đã biết rồi hỏi tôi hai tới bốn câu.",
	traLoi:
		"Ưu tiên giữ chân đối tác lớn và đúng hạn giao; ràng buộc: không thêm người, ngân sách như quý trước.",
	duaNhap:
		"Đưa bản nháp: 2–4 Mục tiêu, mỗi Mục tiêu 2–4 KR, có kiểu và đơn vị đo, khởi điểm chỉ khi có số trong dữ liệu, đích để trống.",
	sua: (v: { bo: string; giu: string; kr: string }) =>
		`Bỏ Mục tiêu «${v.bo}»; giữ Mục tiêu «${v.giu}», nhưng KR «${v.kr}» đang đo việc chứ không đo kết quả, đổi.`,
	suaDoTre:
		"Bỏ Mục tiêu 2; KR đầu của Mục tiêu 1 đang đo việc chứ không đo kết quả, đổi.",
} as const;

function bien(ten: string): string {
	const v = process.env[ten]?.trim();
	if (!v) throw new Error(`thieu ${ten}`);
	return v;
}

export const urlApp = () => bien(TRO_LY_OKR_SOAN.env.url);
export const biMat = () => bien(TRO_LY_OKR_SOAN.env.biMat);

function tranUsd(): number {
	const so = Number(process.env[DG.env.tranUsd]);
	return Number.isFinite(so) && so > 0 ? so : DG.tranUsdMacDinh;
}

async function dongChiPhi(sessionIds?: readonly string[]) {
	const hang = await db.aiChiPhi.findMany({
		where: sessionIds ? { sessionId: { in: [...sessionIds] } } : undefined,
		orderBy: [{ at: "asc" }, { id: "asc" }],
		select: { tinhNang: true, costUsd: true },
	});
	return hang.map((h) => ({
		tinhNang: h.tinhNang,
		costUsd: h.costUsd?.toNumber() ?? null,
	}));
}

export async function lyDoBoQua(): Promise<string | null> {
	if (!DG.khoDo.test(process.env.DATABASE_URL ?? ""))
		return "chi chay tren kho do crm_<cay>_do";
	if (!TRO_LY_OKR_SOAN.khoaMoHinh.some((k) => process.env[k]?.trim()))
		return "thieu khoa mo hinh";
	const chi = tongChiPhi(await dongChiPhi());
	if (chi.thieu > 0)
		return `chi phi khong do duoc: ${chi.thieu} dong AiChiPhi costUsd null`;
	if (chi.usd >= tranUsd())
		return `tran usd ${tranUsd()} da cham: so chi phi ${chi.usd.toFixed(6)}`;
	return null;
}

async function nenCauHinh() {
	const cuoi = await db.okrProgramConfig.findFirst({
		orderBy: { version: "desc" },
	});
	if (!cuoi) return { version: 0, giu: OKR_PROGRAM_MAC_DINH };
	const {
		id: _id,
		createdAt: _luc,
		createdById: _nguoi,
		version,
		...giu
	} = cuoi;
	return { version, giu };
}

let cauHinh: Promise<void> | null = null;

export function datCauHinhSoan(nguoiTao: string): Promise<void> {
	cauHinh ??= (async () => {
		const { version, giu } = await nenCauHinh();
		await db.okrProgramConfig.create({
			data: {
				...giu,
				version: version + 1,
				aiOn: true,
				aiSoanPhamVi: "toan-cong-ty",
				aiSoanDonVi: [],
				createdById: nguoiTao,
			},
		});
	})();
	return cauHinh;
}

let kyDo: Promise<string> | null = null;

export function chuKyDo(): Promise<string> {
	kyDo ??= (async () => {
		const mau = await db.okrCycle.findUnique({
			where: { id: DG.kyDo.chuKyMau },
			select: { startsOn: true, endsOn: true, updateWeekday: true },
		});
		const nam = await db.okrCycle.findUnique({
			where: { id: DG.chuKyNam },
			select: { id: true },
		});
		if (!mau || !nam)
			throw new Error("chua nap bo OKR mau: thieu chu ky nam hoac quy 4");
		const ky = await db.okrCycle.create({
			data: {
				kind: "quy",
				name: `${DG.kyDo.ten} ${randomUUID().slice(0, 8)}`,
				parentId: nam.id,
				startsOn: mau.startsOn,
				endsOn: mau.endsOn,
				updateWeekday: mau.updateWeekday,
				phase: "lap-ke-hoach",
			},
			select: { id: true },
		});
		return ky.id;
	})();
	return kyDo;
}

export type Luot = { kq: MessageResult; ms: number };

export type CuocMo = {
	cuoc: CuocSoan;
	luot: (m: string) => Promise<Luot>;
	phienEve: () => string | null;
};

export async function moCuocVaPhien(
	v: DonViCuocSoan & { cycleId: string; nguoiMoUserId: string },
): Promise<CuocMo> {
	const choGiu = `${PHIEN_CHO_EVE}${randomUUID()}`;
	const cuoc = await moCuoc(db, { ...v, sessionId: choGiu, nac: "bat" });
	const han = DG.hanTheGiay;
	const client = new Client({
		host: urlApp(),
		auth: {
			bearer: () => {
				const bayGio = Math.floor(Date.now() / 1000);
				return mintOkr(
					yeuSach({
						sub: v.nguoiMoUserId,
						cuocSoanId: cuoc.id,
						exp: bayGio + han,
					}),
					biMat(),
				);
			},
		},
		redirect: "manual",
	});
	const phien = client.session();
	let eve: string | null = null;
	const luot = async (m: string): Promise<Luot> => {
		const batDau = performance.now();
		const kq = await (await phien.send(m)).result();
		const ms = performance.now() - batDau;
		if (eve === null) {
			eve = kq.sessionId;
			const { doi } = await capNhatPhien(db, cuoc.id, eve, choGiu);
			if (!doi) throw new Error(`khong gan duoc phien eve vao cuoc ${cuoc.id}`);
		}
		return { kq, ms };
	};
	return { cuoc, luot, phienEve: () => eve };
}

export type DongDoc = {
	id: string;
	dong: DongSoan;
	khoa: string;
	trangThai: string;
	maLoai: string | null;
	dichTrong: boolean;
};

export async function docLanNop(cuocSoanId: string): Promise<DongDoc[][]> {
	const hang = await db.okrDeXuat.findMany({
		where: { cuocSoanId },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		select: {
			id: true,
			loai: true,
			cuocSoanId: true,
			sau: true,
			lyDo: true,
			noiDung: true,
			trangThai: true,
			maLoai: true,
			dich: true,
			inputHash: true,
			createdAt: true,
		},
	});
	return nhomLanNop(hang).map((nhom) =>
		nhom.map((h) => {
			const dong = dongSoanTuHang(h);
			return {
				id: h.id,
				dong,
				khoa: khoaDong(dong),
				trangThai: h.trangThai,
				maLoai: h.maLoai,
				dichTrong: h.dich === null,
			};
		}),
	);
}

export async function datTrangThai(
	id: string,
	trangThai: "nhan" | "bac",
): Promise<void> {
	await db.okrDeXuat.update({ where: { id }, data: { trangThai } });
}

export async function trangThaiCua(id: string): Promise<string | null> {
	return (
		(
			await db.okrDeXuat.findUnique({
				where: { id },
				select: { trangThai: true },
			})
		)?.trangThai ?? null
	);
}

export async function chiPhiCuoc(
	cuocSoanId: string,
): Promise<TongChiPhi & { dong: DongChiPhi[] }> {
	const cuoc = await docCuoc(db, cuocSoanId);
	const dong = cuoc ? await dongChiPhi([cuoc.sessionId, ...cuoc.cacPhien]) : [];
	return { ...tongChiPhi(dong), dong };
}

export async function soChiPhiPhien(
	sessionId: string,
	toiThieu: number,
): Promise<{ tinhNang: string; costUsd: number | null }[]> {
	const het = Date.now() + DG.choChiPhi.ms;
	for (;;) {
		const dong = await dongChiPhi([sessionId]);
		if (dong.length >= toiThieu || Date.now() >= het) return dong;
		await new Promise((r) => setTimeout(r, DG.choChiPhi.nhipMs));
	}
}

const goiCongCu = z.object({
	actions: z.array(
		z.object({
			kind: z.string(),
			callId: z.string(),
			toolName: z.string().optional(),
		}),
	),
});

export function congCuDaGoi(luot: readonly Luot[]): string[] {
	const goi = new Map(
		luot
			.flatMap((l) => l.kq.events)
			.filter((e) => e.type === "actions.requested")
			.flatMap((e) => goiCongCu.parse(e.data).actions)
			.filter((a) => a.kind === "tool-call")
			.map((a) => [a.callId, a.toolName ?? a.kind]),
	);
	return [...goi.values()];
}

export function soBuoc(luot: readonly Luot[]): number {
	return luot
		.flatMap((l) => l.kq.events)
		.filter((e) => e.type === "step.completed").length;
}

export async function doiLoaiTrangChienLuoc(): Promise<() => Promise<void>> {
	const trang = await db.taiLieuTrang.findMany({
		where: { loai: LOAI_TRANG_CHIEN_LUOC },
		select: { id: true },
	});
	const ids = trang.map((t) => t.id);
	await db.taiLieuTrang.updateMany({
		where: { id: { in: ids } },
		data: { loai: DG.boiCanh.loaiTam },
	});
	return async () => {
		await db.taiLieuTrang.updateMany({
			where: { id: { in: ids } },
			data: { loai: LOAI_TRANG_CHIEN_LUOC },
		});
	};
}

export async function chenCauVaoTrang(): Promise<() => Promise<void>> {
	const trang = await db.taiLieuTrang.findFirst({
		where: { loai: LOAI_TRANG_CHIEN_LUOC, banDangDungId: { not: null } },
		orderBy: { id: "asc" },
		select: { banDangDung: { select: { id: true, noiDung: true } } },
	});
	const ban = trang?.banDangDung;
	if (!ban)
		throw new Error("chua nap bo OKR mau: khong co trang chien luoc dang dung");
	await db.taiLieuPhienBan.update({
		where: { id: ban.id },
		data: { noiDung: `${ban.noiDung}\n\n${DG.cauChen}.` },
	});
	return async () => {
		await db.taiLieuPhienBan.update({
			where: { id: ban.id },
			data: { noiDung: ban.noiDung },
		});
	};
}
