import type { Prisma } from "@crm/db";
import type { LoaiViecKr } from "@crm/validation/okr-canh-kr";
import { idMau, ngayDb, OKR_MAU } from "./cau-hinh";
import type { LanMau, LichMau } from "./dien-bien";
import type { BoOkrMau } from "./khuon";

type Tx = Prisma.TransactionClient;

export type DemCanhKr = {
	viec: number;
	bangChung: number;
	ghiNhan: number;
	mau: number;
	tuMau: number;
};

type NguCanh = {
	lich: LichMau;
	lanCua: ReadonlyMap<string, { quy: "quy3" | "quy4"; lan: LanMau[] }>;
	bayGio: Date;
};

const VIEC: LoaiViecKr = "viec";

const nguoiId = (ma: string) => idMau("nguoi", ma);

export async function napCanhKr(
	tx: Tx,
	bo: BoOkrMau,
	{ lich, lanCua, bayGio }: NguCanh,
): Promise<DemCanhKr> {
	const ck = bo.canhKr;
	const krTheoMa = new Map(
		bo.mucTieu.flatMap((m) => m.krs.map((k) => [k.ma, k] as const)),
	);
	const chuKr = (ma: string) => nguoiId(krTheoMa.get(ma)?.chu ?? "");
	const dauQuy = lich.lucCapNhat("quy4", 1);
	const lucXong = (ma: string) => {
		const muc = lanCua.get(ma);
		const dich = krTheoMa.get(ma)?.dich;
		const lan = muc?.lan.find((l) => l.giaTri === dich) ?? muc?.lan.at(-1);
		return muc && lan ? lich.lucCapNhat(muc.quy, lan.tuan) : dauQuy;
	};

	const viTri = ck.viec.map(
		(v, i) => ck.viec.slice(0, i).filter((truoc) => truoc.kr === v.kr).length,
	);
	await tx.okrViecKr.createMany({
		data: ck.viec.map((v, i) => ({
			id: idMau("viec", v.ma),
			keyResultId: idMau("kr", v.kr),
			loai: VIEC,
			tieuDe: v.tieuDe,
			nguoiLamUserId: nguoiId(v.nguoiLam),
			hanNgay:
				v.hanTuan === undefined ? null : ngayDb(lich.ngay("quy4", v.hanTuan)),
			xongLuc:
				v.xongTuan === undefined ? null : lich.lucCapNhat("quy4", v.xongTuan),
			taoBoiUserId: chuKr(v.kr),
			position: viTri[i] ?? 0,
			createdAt: dauQuy,
		})),
	});

	await tx.okrBangChung.createMany({
		data: ck.bangChung.map((b) => ({
			id: idMau("bc", b.ma),
			keyResultId: idMau("kr", b.kr),
			url: b.url,
			ghiChu: b.ghiChu,
			tacGiaUserId: chuKr(b.kr),
			createdAt: lucXong(b.kr),
		})),
	});

	await tx.okrGhiNhan.createMany({
		data: ck.ghiNhan.map((g) => ({
			id: idMau("gn", g.ma),
			objectiveId: idMau("mt", g.mucTieu),
			keyResultId: g.kr ? idMau("kr", g.kr) : null,
			loiNhan: g.loiNhan,
			tacGiaUserId: nguoiId(g.tacGia),
			createdAt: lich.lucCapNhat("quy4", g.tuan),
		})),
	});
	await tx.okrGhiNhanNhan.createMany({
		data: ck.ghiNhan.flatMap((g) =>
			g.nhan.map((n) => ({ ghiNhanId: idMau("gn", g.ma), userId: nguoiId(n) })),
		),
	});

	const quanTri = bo.nguoi.find((n) => n.vai === "admin");
	await tx.okrMau.createMany({
		data: ck.mau.map((m) => ({
			id: idMau("mau", m.ma),
			ten: m.ten,
			cap: m.cap,
			donViIds: m.donVi.map((dv) =>
				idMau(m.cap === "bo-phan" ? "bp" : "pb", dv),
			),
			noiDung: m.noiDung,
			taoBoiUserId: nguoiId(quanTri?.ma ?? ""),
			createdAt: bayGio,
			updatedAt: bayGio,
		})),
	});
	await tx.okrMucTieuTuMau.createMany({
		data: ck.tuMau.map((t) => ({
			id: idMau("tu-mau", t.mucTieu),
			objectiveId: idMau("mt", t.mucTieu),
			mauId: idMau("mau", t.mau),
			createdAt: bayGio,
		})),
	});

	return {
		viec: ck.viec.length,
		bangChung: ck.bangChung.length,
		ghiNhan: ck.ghiNhan.length,
		mau: ck.mau.length,
		tuMau: ck.tuMau.length,
	};
}

export async function xoaCanhKr(
	tx: Tx,
	t: { nguoi: string[]; mucTieu: string[]; kr: string[] },
): Promise<DemCanhKr> {
	const tien = { startsWith: OKR_MAU.tienTo };
	const U = { in: t.nguoi };
	const O = { in: t.mucTieu };
	const K = { in: t.kr };
	const gn = await tx.okrGhiNhan.findMany({
		where: {
			OR: [
				{ id: tien },
				{ objectiveId: O },
				{ keyResultId: K },
				{ tacGiaUserId: U },
			],
		},
		select: { id: true },
	});
	const G = { in: gn.map((g) => g.id) };
	await tx.okrGhiNhanNhan.deleteMany({
		where: { OR: [{ ghiNhanId: G }, { userId: U }] },
	});
	const ghiNhan = await tx.okrGhiNhan.deleteMany({ where: { id: G } });
	const bangChung = await tx.okrBangChung.deleteMany({
		where: { OR: [{ id: tien }, { keyResultId: K }, { tacGiaUserId: U }] },
	});
	const viec = await tx.okrViecKr.deleteMany({
		where: {
			OR: [
				{ id: tien },
				{ keyResultId: K },
				{ nguoiLamUserId: U },
				{ taoBoiUserId: U },
			],
		},
	});
	const mauCo = await tx.okrMau.findMany({
		where: { OR: [{ id: tien }, { taoBoiUserId: U }] },
		select: { id: true },
	});
	const M = { in: mauCo.map((m) => m.id) };
	const tuMau = await tx.okrMucTieuTuMau.deleteMany({
		where: { OR: [{ id: tien }, { objectiveId: O }, { mauId: M }] },
	});
	const mau = await tx.okrMau.deleteMany({ where: { id: M } });
	return {
		viec: viec.count,
		bangChung: bangChung.count,
		ghiNhan: ghiNhan.count,
		mau: mau.count,
		tuMau: tuMau.count,
	};
}
