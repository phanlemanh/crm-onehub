import { TrangThaiViec } from "@crm/db";
import { datBuocXong, type VetBuocXong } from "@crm/db/onboarding-buoc";
import {
	banGhiCua,
	CHON_GAN,
	quyenDoi,
	TRANG_THAI_KHEP,
	vaiCua,
} from "@crm/db/viec";
import { doiTrangThai } from "@crm/db/viec-ghi";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { DbGhi } from "@crm/db/zalo-lien-ket";
import { type MucNhac, parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import {
	type OnboardingActivityMeta,
	vet,
	vetCoCongTy,
} from "@crm/validation/onboarding-activity";
import { laVaiChiOkr, toWorkspaceRole } from "@crm/validation/vai-workspace";
import { chuDeNhac, LOAI_VIEC_NHAC } from "./nhac-ke-hoach";
import { TIEU_DE } from "./tin-nhac";
import { gioNhac } from "./zalo-bot-xuong";
import { ZALO } from "./zalo-config";

type LyDoDoi = "khong-co-buoc" | "ke-hoach-dong" | "khong-co-viec";

type MucXong = { so: number; nhan: string; congTy: string | null };

export type KetTraLoi =
	| { loai: "khong-quyen" }
	| { loai: "chua-co-tin" }
	| { loai: "ngoai-dai"; sai: number[]; tran: number }
	| {
			loai: "khong-phai-buoc";
			muc: { so: number; loai: MucNhac["loai"]; url: string | null }[];
	  }
	| { loai: "viec-khong-cua-ban"; muc: number[] }
	| { loai: "buoc-doi"; muc: { so: number; lyDo: LyDoDoi }[] }
	| { loai: "xong"; vua: MucXong[]; truoc: MucXong[] };

export class BuocDoi extends Error {
	constructor(readonly muc: { so: number; lyDo: LyDoDoi }[]) {
		super("buoc trong tin nhac da doi");
	}
}

export const VET_ZALO: VetBuocXong<OnboardingActivityMeta> = {
	xong: (b) => vet.buocXong({ ...b, source: "zalo" }),
	boXong: vet.buocBoXong,
	coCongTy: vetCoCongTy,
};

export type XongTheoTinNhacInput = {
	userId: string;
	so: number[];
	now: Date;
	lienKet: (planId: string) => string | null;
};

async function coQuyen(tx: DbGhi, userId: string): Promise<boolean> {
	const member = await tx.member.findUnique({
		where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId } },
		select: { role: true },
	});
	return member !== null && !laVaiChiOkr(toWorkspaceRole(member.role));
}

async function mucHomNay(tx: DbGhi, userId: string, now: Date) {
	const hang = await tx.agentTask.findFirst({
		where: { kind: LOAI_VIEC_NHAC, subject: chuDeNhac(userId, now) },
		select: { payload: true },
	});
	if (!hang) return [];
	const payload = parseNhacPayload(hang.payload);
	return payload.kenh === "zalo" ? (payload.daGui ?? []) : [];
}

export async function xongTheoTinNhac(
	tx: DbGhi,
	input: XongTheoTinNhacInput,
): Promise<KetTraLoi> {
	if (!(await coQuyen(tx, input.userId))) return { loai: "khong-quyen" };
	const muc = await mucHomNay(tx, input.userId, input.now);
	if (muc.length === 0) return { loai: "chua-co-tin" };
	const sai = input.so.filter((n) => n > muc.length);
	if (sai.length > 0) return { loai: "ngoai-dai", sai, tran: muc.length };
	const chon = input.so.map((so) => ({ so, muc: muc[so - 1] }));
	const laBuoc = (m: MucNhac | undefined) =>
		Boolean(m && "stepId" in m && m.stepId);
	const laViec = (
		m: MucNhac | undefined,
	): m is Extract<MucNhac, { viecId: string }> => Boolean(m && "viecId" in m);
	const khongPhaiBuoc = chon.flatMap(({ so, muc: m }) =>
		m && !laBuoc(m) && !laViec(m)
			? [
					{
						so,
						loai: m.loai,
						url: "planId" in m ? input.lienKet(m.planId) : null,
					},
				]
			: [],
	);
	if (khongPhaiBuoc.length > 0) {
		return { loai: "khong-phai-buoc", muc: khongPhaiBuoc };
	}
	const dsViec = chon.flatMap(({ so, muc: m }) =>
		laViec(m) ? [{ so, muc: m }] : [],
	);
	const hangViec = await tx.viec.findMany({
		where: { id: { in: dsViec.map((d) => d.muc.viecId) } },
		select: {
			id: true,
			tieuDe: true,
			trangThai: true,
			nguoiGiaoId: true,
			nguoiThucHienId: true,
			theoDoi: { select: { userId: true } },
			gan: { select: CHON_GAN, orderBy: { taoLuc: "asc" }, take: 1 },
		},
	});
	const viecTheoId = new Map(hangViec.map((v) => [v.id, v]));
	const dungNguoiNhan = (
		m: Extract<MucNhac, { viecId: string }>,
		v: { nguoiGiaoId: string; nguoiThucHienId: string },
		userId: string,
	) =>
		m.loai === "viec-cho-danh-gia"
			? v.nguoiGiaoId === userId
			: v.nguoiThucHienId === userId;
	const khongCuaBan: number[] = [];
	const doi: { so: number; lyDo: LyDoDoi }[] = [];
	for (const { so, muc: m } of dsViec) {
		const v = viecTheoId.get(m.viecId);
		if (!v) {
			doi.push({ so, lyDo: "khong-co-viec" });
			continue;
		}
		if (!dungNguoiNhan(m, v, input.userId)) {
			khongCuaBan.push(so);
			continue;
		}
		if (
			!TRANG_THAI_KHEP.includes(v.trangThai) &&
			quyenDoi(v.trangThai, TrangThaiViec.XONG, vaiCua(v, input.userId)) !==
				"duoc"
		) {
			khongCuaBan.push(so);
		}
	}
	if (khongCuaBan.length > 0) {
		return { loai: "viec-khong-cua-ban", muc: khongCuaBan };
	}
	if (doi.length > 0) throw new BuocDoi(doi);
	const vua: MucXong[] = [];
	const truoc: MucXong[] = [];
	for (const { so, muc: m } of dsViec) {
		const v = viecTheoId.get(m.viecId);
		if (!v) continue;
		const dong = {
			so,
			nhan: v.tieuDe,
			congTy: v.gan[0] ? banGhiCua(v.gan[0]).ten : null,
		};
		if (TRANG_THAI_KHEP.includes(v.trangThai)) {
			truoc.push(dong);
			continue;
		}
		await doiTrangThai(tx, {
			viecId: v.id,
			nguoiId: input.userId,
			den: TrangThaiViec.XONG,
			nguon: "zalo",
			now: input.now,
		});
		vua.push(dong);
	}
	for (const { so, muc: m } of chon) {
		if (!(m && "stepId" in m && m.stepId)) continue;
		const ket = await datBuocXong(
			tx,
			{ stepId: m.stepId, done: true, nguoiId: input.userId, now: input.now },
			VET_ZALO,
		);
		if (ket.ket === "khong-co-buoc" || ket.ket === "ke-hoach-dong") {
			doi.push({ so, lyDo: ket.ket });
			continue;
		}
		const dong = { so, nhan: ket.buoc.label, congTy: ket.buoc.companyName };
		(ket.ket === "da-doi" ? vua : truoc).push(dong);
	}
	if (doi.length > 0) throw new BuocDoi(doi);
	return { loai: "xong", vua, truoc };
}

function motDong(chu: string): string {
	return chu.replace(/\s*\n\s*/g, " ").slice(0, ZALO.tranKyTu);
}

function lietKe(ds: MucXong[]): string {
	return ds
		.map((m) =>
			m.congTy ? `${m.so} · ${m.nhan} (${m.congTy})` : `${m.so} · ${m.nhan}`,
		)
		.join("; ");
}

function cauXong(vua: MucXong[], truoc: MucXong[]): string {
	const dau =
		vua.length > 0 ? `${ZALO.loi.daXong}${lietKe(vua)}` : ZALO.loi.khongGiMoi;
	const sau =
		truoc.length > 0 ? `${ZALO.loi.mocDaXongTruoc}${lietKe(truoc)}` : "";
	return `${dau}${sau}.`;
}

export function cauTraLoi(ket: KetTraLoi): string {
	const chuaDanhDau = ZALO.loi.chuaDanhDau;
	switch (ket.loai) {
		case "khong-quyen":
			return motDong(ZALO.loi.khongQuyen);
		case "chua-co-tin":
			return motDong(ZALO.loi.chuaCoTin(gioNhac()));
		case "ngoai-dai":
			return motDong(
				`${ZALO.loi.ngoaiDai(ket.sai.join(", "), ket.tran)} ${chuaDanhDau}`,
			);
		case "khong-phai-buoc":
			return motDong(
				`${ket.muc.map((m) => ZALO.loi.khongPhaiBuoc(m.so, TIEU_DE[m.loai], m.url)).join(" ")} ${chuaDanhDau}`,
			);
		case "viec-khong-cua-ban":
			return motDong(
				`${ket.muc.map((so) => ZALO.loi.viecKhongCuaBan(String(so))).join(" ")} ${chuaDanhDau}`,
			);
		case "buoc-doi":
			return motDong(
				`${ket.muc.map((m) => ZALO.loi.buocDoi(m.so, m.lyDo)).join(" ")} ${chuaDanhDau}`,
			);
		case "xong":
			return motDong(cauXong(ket.vua, ket.truoc));
	}
}
