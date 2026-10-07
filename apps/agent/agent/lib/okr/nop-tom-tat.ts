import { db } from "@crm/db";
import type { LOAI_VIEC_TRO_LY_OKR } from "@crm/db/agent-tasks";
import {
	dungGoiTomTat,
	type GoiTomTat,
	ghiTomTat,
	PhongKhongTomTatDuoc,
	TomTatDaCo,
} from "@crm/db/okr-tom-tat";
import { LUAT_TOM_TAT } from "@crm/validation/okr-kiem-tom-tat";
import {
	type NopTomTat,
	type OkrTroLyViec,
	okrTroLyViec,
} from "@crm/validation/okr-tro-ly";
import type { NguCanhKenh } from "../phien-con";
import { TRO_LY_OKR } from "./config";
import { daCoTomTat } from "./doc";
import { dongViecOkr, maKhongLamDuoc } from "./viec";
import { type ViecCon, viecCuaPhienCon } from "./viec-con";

const LOAI_VIEC =
	"okr-tom-tat-tuan" as const satisfies (typeof LOAI_VIEC_TRO_LY_OKR)[number];

type ViecTomTat = Extract<OkrTroLyViec, { viec: "tom-tat-tuan" }>;

export type KetQuaNopTomTat = {
	ketQua: "da-ghi" | "tu-choi" | "thieu-du-lieu";
	lyDo: string;
	soCau: number;
	soBo: number;
};

const khongGhi = (
	ketQua: "tu-choi" | "thieu-du-lieu",
	lyDo: string,
): KetQuaNopTomTat => ({ ketQua, lyDo, soCau: 0, soBo: 0 });

function viecTomTatCua(hang: ViecCon): ViecTomTat | null {
	if (hang.kind !== LOAI_VIEC) return null;
	const doc = okrTroLyViec.safeParse(hang.payload);
	return doc.success && doc.data.viec === "tom-tat-tuan" ? doc.data : null;
}

function khoaGoiCua(hang: ViecCon, viec: ViecTomTat) {
	return {
		cycleId: viec.cycleId,
		departmentId: viec.departmentId,
		tuan: viec.tuan,
		moc: hang.createdAt,
	};
}

export async function goiTomTatCuaViec(
	hang: ViecCon,
): Promise<GoiTomTat | null> {
	const viec = viecTomTatCua(hang);
	return viec ? dungGoiTomTat(db, khoaGoiCua(hang, viec), LUAT_TOM_TAT) : null;
}

export async function nopTomTatVao(
	input: NopTomTat,
	ctx: NguCanhKenh,
): Promise<KetQuaNopTomTat> {
	const hang = await viecCuaPhienCon(ctx);
	if (!hang) return khongGhi("tu-choi", "not an OKR session");
	if (hang.kind !== LOAI_VIEC || hang.finishedAt) {
		return khongGhi("tu-choi", "task is not a running weekly summary");
	}
	const viec = viecTomTatCua(hang);
	if (!viec) {
		await dongViecOkr(hang.id, maKhongLamDuoc("khuon-hong"));
		return khongGhi("tu-choi", "task payload unreadable");
	}
	if (await daCoTomTat(hang.id)) {
		return khongGhi("tu-choi", "already submitted");
	}
	try {
		const ghi = await ghiTomTat(
			db,
			{
				taskId: hang.id,
				...khoaGoiCua(hang, viec),
				inputHash: viec.inputHash,
				nac: viec.nac,
				cau: input.cau,
			},
			LUAT_TOM_TAT,
		);
		await dongViecOkr(hang.id, TRO_LY_OKR.ketThuc.daNop);
		return {
			ketQua: "da-ghi",
			lyDo: "",
			soCau: input.cau.length - ghi.soCauBo,
			soBo: ghi.soCauBo,
		};
	} catch (loi) {
		if (loi instanceof PhongKhongTomTatDuoc) {
			await dongViecOkr(hang.id, maKhongLamDuoc("thieu-du-lieu"));
			return khongGhi("thieu-du-lieu", "the department is gone or archived");
		}
		if (loi instanceof TomTatDaCo) {
			return khongGhi("tu-choi", "already submitted");
		}
		throw loi;
	}
}
