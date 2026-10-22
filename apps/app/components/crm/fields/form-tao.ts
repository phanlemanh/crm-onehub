"use client";

import { isRequiredStandardKey } from "@crm/db/fields-chuan";
import { useLocale } from "@crm/ui/components/locale-provider";
import { docLoiTruong } from "@crm/validation/loi-truong";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { Owner } from "@/components/crm/owner-cell";
import { crmMessages } from "@/lib/messages/crm";
import { useTRPC } from "@/lib/trpc/client";
import type { FieldEntity } from "./fields-entity";
import {
	cauLoiMayChuTao,
	docGiaTriTao,
	type GiaTriNhap,
	idOTao,
	type MoTaTao,
} from "./kieu-truong";
import {
	kieuTruongChuan,
	type MucFormTao,
	mucFormTao,
	nhanTruongChuan,
	type TruongTao,
} from "./truong-chuan";
import { useBoTriTruong } from "./use-bo-tri-truong";

export type KetQuaKiem =
	| { hopLe: true; fields: Record<string, string | number | boolean> }
	| { hopLe: false };

export type LoiMayChuTao = { toast: string };

export type LoiTrpcCoData = { data?: object | null };

const TIEN_TO_CHUAN = "chuan.";

const khoaChuan = (key: string) => `${TIEN_TO_CHUAN}${key}`;

function coChu(giaTri: GiaTriNhap | undefined): boolean {
	return (giaTri ?? "").trim() !== "";
}

export function useFormTao(entity: FieldEntity, mo = true) {
	const trpc = useTRPC();
	const locale = useLocale();
	const ds = useQuery({
		...trpc.fields.list.queryOptions({ entity }),
		enabled: mo,
	});

	const tuTao = useMemo<TruongTao[]>(
		() =>
			(ds.data ?? []).map((field) => ({
				id: field.id,
				key: field.key,
				label: field.label,
				type: field.type,
				showOnSheet: field.showOnSheet,
				required: field.required,
				options: field.options.map((option) => ({
					id: option.id,
					label: option.label,
				})),
			})),
		[ds.data],
	);

	const boTri = useBoTriTruong(entity, tuTao);
	const muc = useMemo<MucFormTao[]>(
		() => mucFormTao(boTri.muc, tuTao),
		[boTri.muc, tuTao],
	);

	const [giaTri, datGiaTri] = useState<Record<string, GiaTriNhap>>({});
	const [loi, datLoiO] = useState<Record<string, string>>({});

	const doi = (khoa: string, moi: GiaTriNhap) => {
		datGiaTri((cu) => ({ ...cu, [khoa]: moi }));
		datLoiO((cu) => {
			if (!(khoa in cu)) return cu;
			const { [khoa]: _bo, ...con } = cu;
			return con;
		});
	};

	const moTaTuTao = (field: TruongTao, nguoiDung?: Owner[]): MoTaTao => ({
		khoa: field.key,
		nhan: field.label,
		kieu: field.type,
		giaTri: giaTri[field.key] ?? "",
		doi: (moi) => doi(field.key, moi),
		loi: loi[field.key] ?? null,
		batBuoc: field.required,
		luaChon: field.options.map((option) => ({
			value: option.id,
			label: option.label,
		})),
		nguoiDung,
	});

	const moTaChuan = (key: string, them: Partial<MoTaTao> = {}): MoTaTao => {
		const khoa = khoaChuan(key);
		const kieu = kieuTruongChuan(entity, key);
		return {
			khoa,
			nhan: nhanTruongChuan(entity, key, locale),
			kieu: kieu === undefined || kieu === "COMPANY" ? "TEXT" : kieu,
			giaTri: giaTri[khoa] ?? "",
			doi: (moi) => doi(khoa, moi),
			loi: loi[khoa] ?? null,
			batBuoc: isRequiredStandardKey(entity, key),
			...them,
		};
	};

	const chuan = (key: string): GiaTriNhap | undefined => giaTri[khoaChuan(key)];

	const chuoiChuan = (key: string): string => {
		return (chuan(key) ?? "").trim();
	};

	const datLoi = (khoa: string, cau: string) => {
		datLoiO((cu) => ({ ...cu, [khoa]: cau }));
		document.getElementById(idOTao(khoa))?.focus();
	};

	const kiem = (dsMoTa: readonly MoTaTao[]): KetQuaKiem => {
		const fields: Record<string, string | number | boolean> = {};
		const loiMoi: Record<string, string> = {};
		for (const moTa of dsMoTa) {
			const doc = docGiaTriTao(moTa, locale);
			if (doc.kind === "loi") loiMoi[moTa.khoa] = doc.cau;
			if (doc.kind === "ok" && !moTa.khoa.startsWith(TIEN_TO_CHUAN))
				fields[moTa.khoa] = doc.giaTri;
		}
		const dau = dsMoTa.find((moTa) => moTa.khoa in loiMoi);
		datLoiO(loiMoi);
		if (dau) {
			document.getElementById(idOTao(dau.khoa))?.focus();
			return { hopLe: false };
		}
		return { hopLe: true, fields };
	};

	const docLoi = (
		error: LoiTrpcCoData,
		dsMoTa: readonly MoTaTao[],
	): LoiMayChuTao | null => {
		const loiTruong = docLoiTruong(error.data);
		if (!loiTruong) return null;
		const moTa = dsMoTa.find((m) => m.khoa === loiTruong.khoa);
		const cau = cauLoiMayChuTao(
			{ kieu: moTa?.kieu ?? "TEXT", nhan: moTa?.nhan ?? loiTruong.nhan },
			loiTruong,
			locale,
		);
		if (moTa) datLoiO((cu) => ({ ...cu, [loiTruong.khoa]: cau }));
		return {
			toast: `${crmMessages(locale).truongKieu.chuaTao[entity]} ${cau}`,
		};
	};

	return {
		muc,
		dangTai: mo && ds.isPending,
		moTaTuTao,
		moTaChuan,
		chuan,
		chuoiChuan,
		khoaChuan,
		datLoi,
		kiem,
		docLoi,
		ban: Object.entries(giaTri).some(
			([khoa, v]) => !khoa.startsWith(TIEN_TO_CHUAN) && coChu(v),
		),
		banTatCa: Object.values(giaTri).some(coChu),
		xoa: () => {
			datGiaTri({});
			datLoiO({});
		},
	};
}
