import { type Db, Prisma } from "@crm/db";
import {
	type CuocSoan,
	cuocTuHang,
	type NAC_CUOC,
} from "@crm/db/okr-cuoc-soan";
import { daNhanDeXuat, NGAY_MS } from "@crm/db/okr-tro-ly-danh-muc";
import { MA_LOAI_BAN_NHAP } from "@crm/validation/okr-kiem-ban-nhap";
import { trangThaiDeXuat } from "@crm/validation/okr-tro-ly";
import { z } from "zod";
import type { SoDoSoanNac } from "./okr.contracts";
import { OKR } from "./okr-config";
import { cuocCuaVet, tienToVetCuoc } from "./soan-vet";
import { chiaTien, lamTronTien, phanVi, tyLe } from "./tro-ly-so-do";

type DbHoacTx = Db | Prisma.TransactionClient;
type NacCuoc = (typeof NAC_CUOC)[number];

const SOAN = OKR.soan;
const HAN_CONG_BO_MS = SOAN.ngayCongBo * NGAY_MS;
const LOAI_SU_KIEN = [SOAN.suKien.nguoiGo, SOAN.suKien.xongBuoc];

const maLoai = z.enum(MA_LOAI_BAN_NHAP);
const gocDong = { cuocSoanId: z.string(), hienLuc: z.date().nullable() };
const dongSoDo = z.discriminatedUnion("trangThai", [
	z.object({ ...gocDong, trangThai: z.literal("bi-loai"), maLoai }),
	z.object({
		...gocDong,
		trangThai: trangThaiDeXuat.exclude(["bi-loai"]),
		maLoai: maLoai.nullable(),
	}),
]);

const suKienPhien = z.object({
	sessionId: z.string(),
	type: z.enum(LOAI_SU_KIEN),
	emittedAt: z.date(),
});

export type DongSoDo = z.infer<typeof dongSoDo>;
type DongBiLoai = Extract<DongSoDo, { trangThai: "bi-loai" }>;
export type SuKienPhien = z.infer<typeof suKienPhien>;

export type MucTieuNhap = {
	id: string;
	cuocSoanId: string;
	createdAt: Date;
	publishedAt: Date | null;
};

export type SoKySoan = {
	cuoc: CuocSoan[];
	dong: DongSoDo[];
	mucTieu: MucTieuNhap[];
	tien: ReadonlyMap<string, Prisma.Decimal>;
	suKien: SuKienPhien[];
};

export const tienCua = (
	tien: ReadonlyMap<string, Prisma.Decimal>,
	cuocSoanId: string,
) => lamTronTien(tien.get(cuocSoanId) ?? new Prisma.Decimal(0));

export async function tienTheoCuoc(
	db: DbHoacTx,
	cuoc: readonly CuocSoan[],
): Promise<Map<string, Prisma.Decimal>> {
	const phien = [...new Set(cuoc.flatMap((c) => c.cacPhien))];
	const chi =
		phien.length === 0
			? []
			: await db.aiChiPhi.findMany({
					where: { sessionId: { in: phien }, tinhNang: SOAN.tinhNang },
					select: { sessionId: true, costUsd: true },
				});
	const theoPhien = new Map<string, Prisma.Decimal>();
	for (const c of chi)
		theoPhien.set(
			c.sessionId,
			(theoPhien.get(c.sessionId) ?? new Prisma.Decimal(0)).plus(
				c.costUsd ?? 0,
			),
		);
	return new Map(
		cuoc.map((c) => [
			c.id,
			c.cacPhien.reduce(
				(s, p) => s.plus(theoPhien.get(p) ?? 0),
				new Prisma.Decimal(0),
			),
		]),
	);
}

async function mucTieuTuNhap(
	db: DbHoacTx,
	ids: readonly string[],
): Promise<MucTieuNhap[]> {
	if (ids.length === 0) return [];
	const vet = await db.okrTrail.findMany({
		where: {
			action: "tao",
			OR: ids.map((id) => ({ note: { startsWith: tienToVetCuoc(id) } })),
		},
		select: { objectiveId: true, note: true },
	});
	const cuocCua = new Map(
		vet.flatMap((v) => {
			const c = cuocCuaVet(v.note);
			return c && v.objectiveId ? [[v.objectiveId, c] as const] : [];
		}),
	);
	if (cuocCua.size === 0) return [];
	const mt = await db.okrObjective.findMany({
		where: { id: { in: [...cuocCua.keys()] } },
		select: { id: true, createdAt: true, publishedAt: true },
	});
	return mt.map((m) => ({ ...m, cuocSoanId: cuocCua.get(m.id) ?? "" }));
}

export async function docKySoan(
	db: DbHoacTx,
	cycleId: string,
): Promise<SoKySoan> {
	const hang = await db.okrCuocSoan.findMany({
		where: { cycleId },
		orderBy: [{ createdAt: "desc" }, { id: "desc" }],
	});
	const cuoc = hang.map(cuocTuHang);
	const ids = cuoc.map((c) => c.id);
	const phien = [...new Set(cuoc.flatMap((c) => c.cacPhien))];
	const [dong, mucTieu, tien, suKien] = await Promise.all([
		db.okrDeXuat.findMany({
			where: { cuocSoanId: { in: ids } },
			select: {
				cuocSoanId: true,
				trangThai: true,
				maLoai: true,
				hienLuc: true,
			},
		}),
		mucTieuTuNhap(db, ids),
		tienTheoCuoc(db, cuoc),
		db.agentEvent.findMany({
			where: { sessionId: { in: phien }, type: { in: LOAI_SU_KIEN } },
			select: { sessionId: true, type: true, emittedAt: true },
		}),
	]);
	return {
		cuoc,
		dong: dong.map((d) => dongSoDo.parse(d)),
		mucTieu,
		tien,
		suKien: suKien.map((e) => suKienPhien.parse(e)),
	};
}

function doTreMoiLuot(suKien: readonly SuKienPhien[]): number[] {
	const xep = [...suKien].sort(
		(a, b) =>
			a.sessionId.localeCompare(b.sessionId) ||
			a.emittedAt.getTime() - b.emittedAt.getTime(),
	);
	const tre: number[] = [];
	let phien: string | null = null;
	let buocSau: number | null = null;
	let i = xep.length - 1;
	while (i >= 0) {
		const dau = xep[i];
		if (!dau) break;
		const luc = dau.emittedAt.getTime();
		if (dau.sessionId !== phien) {
			phien = dau.sessionId;
			buocSau = null;
		}
		let coNhan = false;
		let coBuoc = false;
		for (
			let e = xep[i];
			e && e.sessionId === phien && e.emittedAt.getTime() === luc;
			e = xep[--i]
		) {
			if (e.type === SOAN.suKien.nguoiGo) coNhan = true;
			else coBuoc = true;
		}
		if (coNhan && buocSau !== null) tre.push(buocSau - luc);
		if (coBuoc) buocSau = luc;
	}
	return tre;
}

const khoaDonVi = (c: CuocSoan) =>
	`${c.level}:${c.divisionId ?? "-"}:${c.departmentId ?? "-"}`;

export function soDoSoanCua(so: SoKySoan, nac: NacCuoc): SoDoSoanNac {
	const cuoc = so.cuoc.filter((c) => c.nac === nac);
	const idCuoc = new Set(cuoc.map((c) => c.id));
	const phien = new Set(cuoc.flatMap((c) => c.cacPhien));
	const dong = so.dong.filter((d) => idCuoc.has(d.cuocSoanId));
	const daHien = dong.filter(
		(d) => d.hienLuc !== null && d.trangThai !== "bi-loai",
	);
	const dem = (trangThai: DongSoDo["trangThai"]) =>
		daHien.filter((d) => d.trangThai === trangThai).length;
	const theoMa = new Map<DongBiLoai["maLoai"], number>();
	const biLoai = dong.filter((d): d is DongBiLoai => d.trangThai === "bi-loai");
	for (const { maLoai: ma } of biLoai)
		theoMa.set(ma, (theoMa.get(ma) ?? 0) + 1);
	const donVi = new Set(cuoc.map(khoaDonVi));
	const daDuaVao = cuoc.filter((c) => c.trangThai === "da-dua-vao");
	const donViXong = new Set(daDuaVao.map(khoaDonVi));
	const mucTieu = so.mucTieu.filter((m) => idCuoc.has(m.cuocSoanId));
	const congBo = mucTieu.filter(
		(m) =>
			m.publishedAt !== null &&
			m.publishedAt.getTime() - m.createdAt.getTime() <= HAN_CONG_BO_MS,
	);
	const tien = cuoc.reduce(
		(s, c) => s.plus(so.tien.get(c.id) ?? 0),
		new Prisma.Decimal(0),
	);
	const tre = doTreMoiLuot(so.suKien.filter((e) => phien.has(e.sessionId)));
	return {
		cuocMo: cuoc.length,
		cuocDuaVao: daDuaVao.length,
		donViCoCuoc: donVi.size,
		donViHoanTat: donViXong.size,
		tyLeDonViHoanTat: tyLe(donViXong.size, donVi.size),
		daHien: daHien.length,
		dongNhan: dem("nhan"),
		dongSua: dem("sua"),
		dongBac: dem("bac"),
		tyLeDuocNhan: tyLe(
			daHien.filter((d) => daNhanDeXuat(d.trangThai)).length,
			daHien.length,
		),
		dongBiLoai: biLoai.length,
		theoMa: [...theoMa.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([maLoai, soDong]) => ({ maLoai, so: soDong })),
		mucTieuNhap: mucTieu.length,
		mucTieuCongBo14Ngay: congBo.length,
		tyLeCongBo14Ngay: tyLe(congBo.length, mucTieu.length),
		tienUsd: lamTronTien(tien),
		chiPhiMoiCuocUsd: chiaTien(tien, cuoc.length),
		p50Ms: phanVi(tre, SOAN.phanVi.giua),
		p90Ms: phanVi(tre, SOAN.phanVi.cao),
	};
}
