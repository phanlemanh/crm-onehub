import type { Db, Prisma } from "@crm/db";
import { KET_LUAN_CHON, type KetLuanInput } from "@crm/validation/okr-hoi-y";
import { AgentTriggerService } from "../../src/agent/agent-trigger.service";
import type { DongHo } from "../../src/okr/dong-ho";
import { OkrService } from "../../src/okr/okr.service";
import { OkrAccessService } from "../../src/okr/okr-access.service";
import { OkrHoiYService } from "../../src/okr/okr-hoi-y.service";
import { ToChucService } from "../../src/to-chuc/to-chuc.service";
import { idMau, OKR_MAU } from "./cau-hinh";
import type { BoOkrMau, KetLuanHoiYMau } from "./khuon";

type Tx = Prisma.TransactionClient;

export type DemHoiY = {
	hoiY: number;
	y: number;
	dongY: number;
	chuDe: number;
	yLa: number;
};

const CUA = OKR_MAU.hoiY;
const GIO_MS = OKR_MAU.thoiGian.gioMs;

const nguoiId = (ma: string) => idMau("nguoi", ma);

function dungDichVu(db: Db, dongHo: DongHo): OkrHoiYService {
	const quyen = new OkrAccessService(db, new ToChucService(db));
	const okr = new OkrService(db, quyen, new AgentTriggerService(db));
	return new OkrHoiYService(db, quyen, okr, dongHo);
}

function ketLuanVao(chuDeId: string, kl: KetLuanHoiYMau): KetLuanInput {
	return kl.loai === KET_LUAN_CHON
		? {
				chuDeId,
				ketLuan: kl.loai,
				lyDo: kl.lyDo,
				cauMucTieu: kl.cauMucTieu,
				noiBanTruoc: kl.noi,
			}
		: {
				chuDeId,
				ketLuan: kl.loai,
				lyDo: kl.lyDo,
				cauMucTieu: "",
				noiBanTruoc: null,
			};
}

type Buoc = { luc: Date; chay: () => Promise<unknown> };

export async function napHoiYMau(
	db: Db,
	bo: BoOkrMau,
	{ moc, chuKyId }: { moc: Date; chuKyId: string },
): Promise<DemHoiY> {
	const h = bo.hoiY;
	const moLuc = new Date(moc.getTime() - CUA.moTruocGio * GIO_MS);
	const sauMo = (gio: number) => new Date(moLuc.getTime() + gio * GIO_MS);
	let bayGio = moLuc;
	const dichVu = dungDichVu(db, () => new Date(bayGio.getTime()));
	const chon = nguoiId(h.nguoiChon);

	const { id: hoiYId } = await dichVu.moHoiY(chon, {
		cycleId: chuKyId,
		cauHoi: h.cauHoi,
		loiMo: h.loiMo,
		soLieu: h.soLieu,
		hanLuc: sauMo(CUA.hanSauMoGio).toISOString(),
		nguoiChonUserId: chon,
	});
	bayGio = sauMo(CUA.niemPhongSauMoGio);
	await dichVu.niemPhong(chon, { hoiYId, cau: h.banTruoc });

	const yId = new Map<string, string>();
	const idCua = (ma: string): string => {
		const id = yId.get(ma);
		if (id === undefined) throw new Error(`ý ${ma} chưa được góp`);
		return id;
	};
	const gioCua = new Map(h.y.map((y) => [y.ma, y.gio]));
	const buoc: Buoc[] = [
		...h.y.map((y) => ({
			luc: sauMo(y.gio),
			chay: async () => {
				const { id } = await dichVu.gopY(nguoiId(y.tacGia), {
					hoiYId,
					noiDung: y.noiDung,
					viSao: y.viSao,
					doBangGi: y.doBangGi,
				});
				yId.set(y.ma, id);
			},
		})),
		...h.dongY.map((d) => ({
			luc: sauMo((gioCua.get(d.y) ?? 0) + CUA.dongYSauYGio),
			chay: () =>
				dichVu.dongY(nguoiId(d.nguoi), { yId: idCua(d.y), bat: true }),
		})),
	];
	buoc.sort((a, b) => a.luc.getTime() - b.luc.getTime());
	for (const b of buoc) {
		bayGio = b.luc;
		await b.chay();
	}

	bayGio = sauMo(CUA.hanSauMoGio + CUA.gomSauHanGio);
	const chuDeId = new Map<string, string>();
	for (const c of h.chuDe) {
		const { id } = await dichVu.taoChuDe(chon, { hoiYId, ten: c.ten });
		chuDeId.set(c.ma, id);
		await dichVu.ganY(chon, { yIds: c.y.map(idCua), chuDeId: id });
	}
	for (const ma of h.yLa)
		await dichVu.ganY(chon, { yIds: [idCua(ma)], yLa: true });

	bayGio = sauMo(CUA.hanSauMoGio + CUA.ketLuanSauHanGio);
	for (const c of h.chuDe) {
		const id = chuDeId.get(c.ma);
		if (c.ketLuan && id !== undefined)
			await dichVu.ketLuanChuDe(chon, ketLuanVao(id, c.ketLuan));
	}

	const [soHoiY, soChuDe, soYLa] = await Promise.all([
		db.okrHoiY.count({ where: { cycleId: chuKyId } }),
		db.okrChuDe.count({ where: { hoiYId, loai: "chu-de" } }),
		db.okrChuDe.count({ where: { hoiYId, loai: "y-la" } }),
	]);
	return {
		hoiY: soHoiY,
		y: h.y.length,
		dongY: h.dongY.length,
		chuDe: soChuDe,
		yLa: soYLa,
	};
}

export async function xoaHoiY(
	tx: Tx,
	t: { nguoi: string[]; chuKy: string[] },
): Promise<DemHoiY> {
	const U = { in: t.nguoi };
	const hoiY = await tx.okrHoiY.findMany({
		where: { cycleId: { in: t.chuKy } },
		select: { id: true },
	});
	const H = { in: hoiY.map((x) => x.id) };
	const y = await tx.okrY.findMany({
		where: { OR: [{ hoiYId: H }, { tacGiaUserId: U }] },
		select: { id: true },
	});
	const Y = { in: y.map((x) => x.id) };
	const dongY = await tx.okrYDongY.deleteMany({
		where: { OR: [{ yId: Y }, { userId: U }] },
	});
	await tx.okrHoiYHieu.deleteMany({
		where: { OR: [{ hoiYId: H }, { userId: U }] },
	});
	const yXoa = await tx.okrY.deleteMany({ where: { id: Y } });
	const chuDe = await tx.okrChuDe.deleteMany({
		where: { hoiYId: H, loai: "chu-de" },
	});
	const yLa = await tx.okrChuDe.deleteMany({ where: { hoiYId: H } });
	await tx.okrHoiYBanTruoc.deleteMany({ where: { hoiYId: H } });
	const hoiYXoa = await tx.okrHoiY.deleteMany({ where: { id: H } });
	return {
		hoiY: hoiYXoa.count,
		y: yXoa.count,
		dongY: dongY.count,
		chuDe: chuDe.count,
		yLa: yLa.count,
	};
}
