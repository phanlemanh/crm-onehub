import { db } from "@crm/db";
import {
	type GoiKiem,
	type KetQuaKiemDong,
	khoaDong,
	kiemDongDeXuat,
} from "@crm/validation/okr-kiem-de-xuat";
import {
	type DongGopY,
	type NopDeXuat,
	okrTroLyViec,
} from "@crm/validation/okr-tro-ly";
import type { NguCanhKenh } from "../phien-con";
import { TRO_LY_OKR } from "./config";
import { soLanNop } from "./doc";
import { dungGoiDeXuat, goiKiemTu } from "./goi-ngu-canh";
import { dongViecOkr, maKhongLamDuoc } from "./viec";
import { viecCuaPhienCon } from "./viec-con";

export type BoKiem = (dong: DongGopY, goi: GoiKiem) => KetQuaKiemDong;

export type KetQuaNop = {
	ketQua: "da-ghi" | "tu-choi" | "thieu-du-lieu";
	lyDo: string;
	soDong: number;
	biLoai: number;
};

const khongGhi = (
	ketQua: "tu-choi" | "thieu-du-lieu",
	lyDo: string,
): KetQuaNop => ({ ketQua, lyDo, soDong: 0, biLoai: 0 });

function kiemLanLuot(
	dong: readonly DongGopY[],
	goi: GoiKiem,
	kiem: BoKiem,
): { dong: DongGopY; kq: KetQuaKiemDong }[] {
	let dangCho = goi.khoaDangCho;
	return dong.map((d) => {
		const kq = kiem(d, { ...goi, khoaDangCho: dangCho });
		if (kq.qua) dangCho = [...dangCho, { khoa: khoaDong(d), sau: d.sau ?? "" }];
		return { dong: d, kq };
	});
}

export async function nopDeXuatVao(
	input: NopDeXuat,
	ctx: NguCanhKenh,
	kiem: BoKiem = kiemDongDeXuat,
): Promise<KetQuaNop> {
	const hang = await viecCuaPhienCon(ctx);
	if (!hang) return khongGhi("tu-choi", "not an OKR session");
	if (hang.kind !== "okr-de-xuat" || hang.finishedAt) {
		return khongGhi("tu-choi", "task is not running");
	}
	const doc = okrTroLyViec.safeParse(hang.payload);
	if (!doc.success || doc.data.viec !== "de-xuat") {
		await dongViecOkr(hang.id, maKhongLamDuoc("khuon-hong"));
		return khongGhi("tu-choi", "task payload unreadable");
	}
	const viec = doc.data;
	if ((await soLanNop(hang.id)) > 0) {
		return khongGhi("tu-choi", "already submitted");
	}
	const goi = await dungGoiDeXuat(viec.objectiveId, viec.nguoiYeuCau, {
		keyResultId: viec.keyResultId,
		nac: viec.nac,
	});
	if (!goi) {
		await dongViecOkr(hang.id, maKhongLamDuoc("thieu-du-lieu"));
		return khongGhi("thieu-du-lieu", "the Objective or Key Result is gone");
	}
	const daKiem = kiemLanLuot(input.dong, goiKiemTu(goi), kiem);
	await db.okrDeXuat.createMany({
		data: daKiem.map(({ dong: d, kq }) => ({
			taskId: hang.id,
			objectiveId: d.objectiveId,
			keyResultId: d.keyResultId,
			loai: d.loai,
			truong: d.truong,
			truoc: d.truoc,
			sau: d.sau,
			maVanDe: d.maVanDe,
			dich:
				d.targetObjectiveId || d.targetKeyResultId
					? {
							targetObjectiveId: d.targetObjectiveId,
							targetKeyResultId: d.targetKeyResultId,
						}
					: undefined,
			lyDo: d.lyDo,
			noiDung:
				d.loai === "can-chinh" && d.canCu ? { canCu: d.canCu } : undefined,
			inputHash: viec.inputHash,
			nguoiYeuCau: viec.nguoiYeuCau,
			nac: viec.nac,
			trangThai: kq.qua ? "cho" : "bi-loai",
			maLoai: kq.qua ? null : kq.maLoai,
		})),
	});
	await dongViecOkr(hang.id, TRO_LY_OKR.ketThuc.daNop);
	const cho = daKiem.filter(({ kq }) => kq.qua).length;
	return {
		ketQua: "da-ghi",
		lyDo: "",
		soDong: cho,
		biLoai: daKiem.length - cho,
	};
}
