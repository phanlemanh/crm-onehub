import "reflect-metadata";
import { db } from "@crm/db";
import { boHopDongMau } from "@crm/validation/hop-dong-mau";
import type { INestApplicationContext } from "@nestjs/common";
import { HOP_DONG_MAU, LoiHopDongMau } from "./cau-hinh";
import { type KhoNap, layDichVu, napHopDongMau } from "./nap";

export type PhuThuoc = {
	ungDung?: () => Promise<INestApplicationContext>;
	inRa?: (dong: string) => void;
	db?: KhoNap;
};

async function dungUngDung(): Promise<INestApplicationContext> {
	const { NestFactory } = await import("@nestjs/core");
	const { AppModule } = await import("../../src/app.module");
	return NestFactory.createApplicationContext(AppModule, {
		logger: ["error", "warn"],
	});
}

export async function chayLenh(
	args: string[],
	phu: PhuThuoc = {},
): Promise<number> {
	const inRa = phu.inRa ?? ((dong: string) => console.log(dong));
	let app: INestApplicationContext | null = null;
	try {
		if (args.length > 0) {
			throw new LoiHopDongMau(
				HOP_DONG_MAU.ma.sai,
				HOP_DONG_MAU.thongDiep.coLa(args),
			);
		}
		const bo = boHopDongMau();
		app = await (phu.ungDung ?? dungUngDung)();
		const bao = await napHopDongMau(layDichVu(app, phu.db ?? db), bo.tep, inRa);
		const gan = bao.filter(
			(d) => d.trangThai === HOP_DONG_MAU.trangThai.daGan,
		).length;
		inRa(HOP_DONG_MAU.thongDiep.tomTat(gan, bao.length - gan));
		return 0;
	} catch (loi) {
		if (loi instanceof LoiHopDongMau) {
			console.error(loi.message);
			return loi.ma;
		}
		console.error(loi instanceof Error ? loi.message : String(loi));
		return HOP_DONG_MAU.ma.hong;
	} finally {
		if (app && !phu.ungDung) await app.close();
	}
}
