"use client";

import ArrowDown from "@carbon/icons-react/es/ArrowDown";
import ArrowUp from "@carbon/icons-react/es/ArrowUp";
import Subtract from "@carbon/icons-react/es/Subtract";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import type { Locale } from "@crm/ui/lib/locale";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { giaTri } from "../bang-kr";
import { chuSo } from "../nguon-so";

export type DongMucDoi = {
	laMoc: boolean;
	donVi: string;
	giaTriMoi: number | null;
	mucDoi: { tu: number; den: number; ngayTruoc: string } | null;
};

export type KhoDong = "duoi-md" | "md-lg" | "tu-lg";

export type ChuMucDoi = {
	huong: "tang" | "giam" | "yen";
	tren: string;
	duoi: string;
};

export function ngayThang(ngay: string): string {
	return `${ngay.slice(8, 10)}/${ngay.slice(5, 7)}`;
}

export function chuMucDoi(d: DongMucDoi, locale: Locale): ChuMucDoi {
	const m = okrToanCanhMessages(locale).hopTuan;
	const kr = {
		kind: d.laMoc ? ("moc" as const) : ("tang-toi" as const),
		unit: d.donVi,
	};
	const so = (n: number) => giaTri(kr, n, locale);
	if (d.giaTriMoi === null)
		return { huong: "yen", tren: m.chuaCapNhat, duoi: m.chuaCoLanNao };
	if (d.mucDoi === null)
		return {
			huong: "yen",
			tren: m.lanDau,
			duoi: `${so(d.giaTriMoi)} · ${m.chuaCoLanTruoc}`,
		};
	const { tu, den, ngayTruoc } = d.mucDoi;
	const soVoi = m.soVoi(ngayThang(ngayTruoc));
	if (tu === den)
		return { huong: "yen", tren: m.chuaDoi, duoi: `${so(den)} · ${soVoi}` };
	const huong = den > tu ? "tang" : "giam";
	if (d.laMoc) return { huong, tren: `${so(tu)} → ${so(den)}`, duoi: soVoi };
	const dau = huong === "tang" ? "+" : "−";
	return {
		huong,
		tren: `${dau}${so(Math.abs(den - tu))}`,
		duoi: `${chuSo(tu, locale)} → ${chuSo(den, locale)} · ${soVoi}`,
	};
}

const ICON = { tang: ArrowUp, giam: ArrowDown, yen: Subtract } as const;

export function OMucDoi({ dong, kho }: { dong: DongMucDoi; kho: KhoDong }) {
	const chu = chuMucDoi(dong, useLocale());
	return (
		<span
			className="flex flex-col gap-0.5"
			data-kho={kho}
			data-muc-doi={chu.huong}
		>
			<span className="flex items-center gap-1 text-sm tabular-nums">
				<Icon icon={ICON[chu.huong]} />
				{chu.tren}
			</span>
			<span className="text-muted-foreground text-xs tabular-nums">
				{chu.duoi}
			</span>
		</span>
	);
}
