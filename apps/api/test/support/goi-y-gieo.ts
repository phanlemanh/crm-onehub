import { db, type GoiYKeHoachModel } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { dichVu, gieoBoPhan, token } from "./ke-hoach-gieo";
import { goi, type KetGoi } from "./viec-gieo";

export type LoaiO = "tao" | "mo" | "thang" | "thua";

export type GiaiDoanGieo = {
	M1: string;
	M2: string;
	W: string;
	W2: string;
	W3: string;
	W4: string;
	L: string;
	L2: string;
};

const daGieo = { giaiDoan: [] as string[] };

export async function gieoGiaiDoan(): Promise<GiaiDoanGieo> {
	const tao = async (kind: "OPEN" | "WON" | "LOST", i: number) => {
		const g = await db.dealStage.create({
			data: { label: `${token()} ${kind}`, kind, position: 900 + i },
		});
		daGieo.giaiDoan.push(g.id);
		return g.id;
	};
	return {
		M1: await tao("OPEN", 0),
		M2: await tao("OPEN", 1),
		W: await tao("WON", 2),
		W2: await tao("WON", 3),
		W3: await tao("WON", 4),
		W4: await tao("WON", 5),
		L: await tao("LOST", 6),
		L2: await tao("LOST", 7),
	};
}

export async function donGiaiDoan(): Promise<void> {
	await db.deal.deleteMany({ where: { stage: { in: daGieo.giaiDoan } } });
	await db.dealStage.deleteMany({ where: { id: { in: daGieo.giaiDoan } } });
}

export function ok(ket: KetGoi, thongDiep: string): unknown {
	if (ket.status >= 300) {
		throw new Error(`${thongDiep} (${ket.status} ${ket.message})`);
	}
	return ket.data;
}

export async function taoCongTy(
	app: NestExpressApplication,
	nguoiId: string,
): Promise<string> {
	const ket = await goi(
		app,
		"companies.create",
		"mutation",
		{ name: `${token()} Cty gợi ý` },
		nguoiId,
	);
	return (ok(ket, "gy: tao cong ty hong") as { id: string }).id;
}

export async function taoDeal(
	app: NestExpressApplication,
	args: {
		nguoiId: string;
		chuId?: string;
		congTyId?: string;
		stage: string;
	},
): Promise<{ dealId: string; congTyId: string }> {
	const congTyId = args.congTyId ?? (await taoCongTy(app, args.nguoiId));
	const ket = await goi(
		app,
		"deals.create",
		"mutation",
		{
			name: `${token()} Deal gợi ý`,
			companyId: congTyId,
			ownerId: args.chuId ?? args.nguoiId,
			stage: args.stage,
		},
		args.nguoiId,
	);
	return {
		dealId: (ok(ket, "gy: tao deal hong") as { id: string }).id,
		congTyId,
	};
}

export function doiGiaiDoan(
	app: NestExpressApplication,
	nguoiId: string,
	dealId: string,
	stage: string,
	thua = false,
): Promise<KetGoi> {
	return goi(
		app,
		"deals.setStage",
		"mutation",
		thua
			? { id: dealId, stage, closedReason: "khach chon ben khac" }
			: { id: dealId, stage },
		nguoiId,
	);
}

export function goiYCua(dealId: string): Promise<GoiYKeHoachModel[]> {
	return db.goiYKeHoach.findMany({
		where: { dealId },
		orderBy: { sinhLuc: "asc" },
	});
}

export async function khuonMotBuoc(): Promise<string> {
	const bp = await gieoBoPhan();
	const khuon = await dichVu().createTemplate({
		name: `khuon ${bp.name}`,
		partnerType: null,
		steps: [
			{ label: "Buoc mot", departmentId: bp.id, position: 0, offsetDays: 0 },
		],
	});
	return khuon.id;
}
