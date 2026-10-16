import { db as dbMacDinh } from "@crm/db";
import { attribute, type PurposeContext } from "./session-purpose";
import { TAI_LIEU_AGENT } from "./tai-lieu-config";
import { PURPOSE_KHO } from "./tai-lieu-hoi-phien";
import { ZALO } from "./zalo-config";
import { DANG_HOI } from "./zalo-hoi";

const LK = TAI_LIEU_AGENT.hoi.lienKet;

type DbLienKet = Pick<typeof dbMacDinh, "zaloHoi" | "taiLieuHoi">;

export type NguCanhLienKet = PurposeContext & {
	readonly session: { readonly id: string };
};

export type PhuThuocLienKet = { readonly db?: DbLienKet };

type GhiLienKet = (
	d: DbLienKet,
	hoiId: string,
	phien: string,
) => Promise<boolean>;

const lienKetZalo: GhiLienKet = async (d, hoiId, phien) => {
	await d.zaloHoi.updateMany({
		where: { id: hoiId, ketQua: DANG_HOI, sessionId: null },
		data: { sessionId: phien },
	});
	const hang = await d.zaloHoi.findUnique({
		where: { id: hoiId },
		select: { sessionId: true },
	});
	return hang?.sessionId === phien;
};

const lienKetKho: GhiLienKet = async (d, hoiId, phien) => {
	await d.taiLieuHoi.updateMany({
		where: { id: hoiId, phienId: LK.dauCho(hoiId), trangThai: "DANG_HOI" },
		data: { phienId: phien },
	});
	const hang = await d.taiLieuHoi.findUnique({
		where: { id: hoiId },
		select: { phienId: true },
	});
	return hang?.phienId === phien;
};

function ghiCho(purpose: string | null): GhiLienKet | null {
	if (purpose === ZALO.hoi.purpose) return lienKetZalo;
	if (purpose === PURPOSE_KHO) return lienKetKho;
	return null;
}

export async function lienKetPhienGoc(
	ctx: NguCanhLienKet,
	deps: PhuThuocLienKet = {},
): Promise<void> {
	const purpose = attribute(ctx, "purpose");
	const hoiId = attribute(ctx, "hoiId");
	const ghi = ghiCho(purpose);
	if (!ghi || !hoiId) return;
	const phien = ctx.session.id;
	try {
		if (await ghi(deps.db ?? dbMacDinh, hoiId, phien)) {
			console.info(`${LK.dong} ${purpose} ${hoiId} -> ${phien}`);
		}
	} catch (loi) {
		console.warn(LK.canhBao, {
			purpose,
			hoiId,
			reason: loi instanceof Error ? loi.message : "khong-ro",
		});
	}
}
