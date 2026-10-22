"use client";

import { type CachLocTruong, cachLocTruong } from "@crm/db/fields-shape";
import type { DataTableFacet } from "@crm/ui/components/data-table";
import { useLocale } from "@crm/ui/components/locale-provider";
import type { Locale } from "@crm/ui/lib/locale";
import { GIA_TRI_CO_TEP, GIA_TRI_TRONG } from "@crm/validation/bo-loc-truong";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { TruongLoc } from "@/components/data-table/list-search-params";
import { crmMessages } from "@/lib/messages/crm";
import { useTRPC } from "@/lib/trpc/client";
import { docSoNhap } from "./doc-nhap";
import type { FieldEntity } from "./fields-entity";

type LuaChon = { value: string; label: string };

function luaChonTheoCach(
	cach: CachLocTruong,
	locale: Locale,
	rieng: LuaChon[],
): LuaChon[] {
	const m = crmMessages(locale);
	const trong = (label: string) => ({ value: GIA_TRI_TRONG, label });

	switch (cach) {
		case "luaChon":
			return [...rieng, trong(m.locTruong.khongChon)];
		case "nguoi":
			return [...rieng, trong(m.locTruong.chuaGiao)];
		case "tich":
			return [
				{ value: "yes", label: m.locTruong.co },
				{ value: "no", label: m.locTruong.khong },
			];
		case "moc":
			return [
				{ value: "overdue", label: m.locTruong.daQua },
				{ value: "this-month", label: m.closing.thisMonth },
				{ value: "next-month", label: m.closing.nextMonth },
				{ value: "later", label: m.closing.later },
				trong(m.locTruong.trong),
			];
		case "coTep":
			return [
				{ value: GIA_TRI_CO_TEP, label: m.tepTruong.loc.coTep },
				trong(m.tepTruong.loc.chuaCoTep),
			];
		default:
			return [trong(m.locTruong.trong)];
	}
}

const KIEU_FACET = {
	chua: "chu",
	khoang: "khoang",
} as const satisfies Partial<
	Record<CachLocTruong, NonNullable<DataTableFacet["kieu"]>>
>;

function oNhapTheoCach(
	cach: CachLocTruong,
	locale: Locale,
): Pick<DataTableFacet, "kieu" | "docSo" | "loiSo" | "hienSo"> {
	if (cach === "chua") return { kieu: KIEU_FACET.chua };
	if (cach !== "khoang") return { kieu: "luaChon" };
	const dinhDang = new Intl.NumberFormat(locale, {
		maximumFractionDigits: 20,
	});
	return {
		kieu: KIEU_FACET.khoang,
		docSo: (chu) => {
			const doc = docSoNhap(chu, locale);
			return doc.kind === "ok" ? doc.giaTri : null;
		},
		loiSo: crmMessages(locale).truongKieu.tuChoi.so,
		hienSo: (so) => dinhDang.format(so),
	};
}

export function useTruongLoc(entity: FieldEntity): TruongLoc[] {
	const trpc = useTRPC();
	const fields = useQuery(trpc.fields.filters.queryOptions({ entity }));
	return useMemo(
		() => (fields.data ?? []).map(({ key, type }) => ({ key, type })),
		[fields.data],
	);
}

export function useFieldFacets(entity: FieldEntity): DataTableFacet[] {
	const trpc = useTRPC();
	const locale = useLocale();
	const fields = useQuery(trpc.fields.filters.queryOptions({ entity }));
	const users = useQuery(trpc.users.list.queryOptions());

	return useMemo(() => {
		if (!fields.data) return [];

		return fields.data.map((field) => {
			const cach = cachLocTruong(field.type);
			const rieng =
				cach === "nguoi"
					? (users.data ?? []).map((user) => ({
							value: user.id,
							label: user.name,
						}))
					: field.options.map((option) => ({
							value: option.id,
							label: option.label,
						}));

			return {
				id: `field:${field.key}`,
				label: field.label,
				options: luaChonTheoCach(cach, locale, rieng),
				...oNhapTheoCach(cach, locale),
			};
		});
	}, [fields.data, users.data, locale]);
}
