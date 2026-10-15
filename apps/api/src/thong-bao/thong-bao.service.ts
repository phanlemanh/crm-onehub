import type { Db } from "@crm/db";
import { parseNoiDungThongBao, THONG_BAO } from "@crm/validation/thong-bao";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import type {
	ChuongThongBaoOutput,
	DanhSachThongBaoOutput,
	DongThongBaoRa,
} from "./thong-bao.contracts";

const CHON = {
	id: true,
	noiDung: true,
	duongDan: true,
	taoLuc: true,
	docLuc: true,
} as const;

const THU_TU = [{ taoLuc: "desc" as const }, { id: "desc" as const }];

type HangThongBao = {
	id: string;
	noiDung: unknown;
	duongDan: string;
	taoLuc: Date;
	docLuc: Date | null;
};

function ra(h: HangThongBao): DongThongBaoRa {
	return {
		id: h.id,
		noiDung: parseNoiDungThongBao(h.noiDung),
		duongDan: h.duongDan,
		taoLuc: h.taoLuc,
		daDoc: h.docLuc !== null,
	};
}

@Injectable()
export class ThongBaoService {
	private readonly logger = new Logger(ThongBaoService.name);

	constructor(@InjectDatabase() private readonly db: Db) {}

	async chuong(userId: string): Promise<ChuongThongBaoOutput> {
		const [soChuaDoc, hang] = await Promise.all([
			this.db.thongBao.count({ where: { nguoiNhanId: userId, docLuc: null } }),
			this.db.thongBao.findMany({
				where: { nguoiNhanId: userId },
				orderBy: THU_TU,
				take: THONG_BAO.soTrenChuong,
				select: CHON,
			}),
		]);
		return { soChuaDoc, dong: hang.map(ra) };
	}

	async danhSach(
		userId: string,
		chiChuaDoc: boolean,
		conTro: string | undefined,
	): Promise<DanhSachThongBaoOutput> {
		const where = chiChuaDoc
			? { nguoiNhanId: userId, docLuc: null }
			: { nguoiNhanId: userId };
		const goc = {
			where,
			orderBy: THU_TU,
			take: THONG_BAO.moiTrang + 1,
			select: CHON,
		};
		const hang = conTro
			? await this.db.thongBao.findMany({
					...goc,
					cursor: { id: conTro },
					skip: 1,
				})
			: await this.db.thongBao.findMany(goc);
		const coThem = hang.length > THONG_BAO.moiTrang;
		const trang = coThem ? hang.slice(0, THONG_BAO.moiTrang) : hang;
		return {
			dong: trang.map(ra),
			conTroSau: coThem ? (trang.at(-1)?.id ?? null) : null,
		};
	}

	async moMot(userId: string, id: string, now: Date): Promise<{ ok: true }> {
		const hang = await this.db.thongBao.findFirst({
			where: { id, nguoiNhanId: userId },
			select: { moLuc: true, docLuc: true },
		});
		if (!hang) throw new NotFoundException(THONG_BAO.loi.khongCo);
		await this.db.thongBao.update({
			where: { id },
			data: { moLuc: hang.moLuc ?? now, docLuc: hang.docLuc ?? now },
		});
		this.logger.log({ message: "thong-bao.mo", userId });
		return { ok: true };
	}

	async docHet(userId: string, now: Date): Promise<{ soDaDoc: number }> {
		const { count } = await this.db.thongBao.updateMany({
			where: { nguoiNhanId: userId, docLuc: null },
			data: { docLuc: now },
		});
		this.logger.log({ message: "thong-bao.doc-het", userId, soDaDoc: count });
		return { soDaDoc: count };
	}
}
