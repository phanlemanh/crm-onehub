"use client";

import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import { formatNgayGio } from "@crm/ui/lib/format";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import { sanPhamMessages } from "@/lib/messages/san-pham";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

type TrangThai = keyof ReturnType<typeof sanPhamMessages>["trangThai"];

export type NguonSanPhamHien = {
	ten: string;
	kho: string;
	nhanh: string;
	layLuc: string;
	layHong: TrangThai | null;
	nguonDoi: boolean;
	khuon: { phienBan: number; moiHon: boolean } | null;
};

const khongDoi = () => () => {};
const muiGioTrinhDuyet = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export function DongNguonSanPham({ sp }: { sp: NguonSanPhamHien }) {
	const locale = useLocale();
	const m = loTrinhMessages(locale).sanPham;
	const tt = sanPhamMessages(locale).trangThai;
	const mui = useSyncExternalStore(khongDoi, muiGioTrinhDuyet, () => null);
	if (mui === null) return null;
	const gio = formatNgayGio(sp.layLuc, locale, {
		timeZone: mui,
		phan: "ngay-gio",
	});
	return (
		<div className="flex flex-col gap-1">
			<p className="text-muted-foreground text-sm" data-lo-trinh-gio-lay="">
				{m.layTu}{" "}
				<span translate="no">
					{sp.kho} · {sp.nhanh}
				</span>{" "}
				{m.luc(gio)}
			</p>
			{sp.nguonDoi ? (
				<p className="text-sm" data-lo-trinh-nguon-doi="">
					{m.nguonDoi}
				</p>
			) : null}
			{sp.layHong ? (
				<p className="text-sm" data-lo-trinh-lay-hong="">
					{m.layHong(tt[sp.layHong].toLocaleLowerCase(locale))}
				</p>
			) : null}
			{sp.khuon ? (
				<p className="text-sm" data-lo-trinh-khuon={sp.khuon.phienBan}>
					{(sp.khuon.moiHon ? m.khuonMoi : m.khuonCu)(
						sp.ten,
						sp.khuon.phienBan,
					)}
				</p>
			) : null}
		</div>
	);
}

export function SanPhamChuaCo({
	ten,
	trangThai,
	quanTri,
}: {
	ten: string;
	trangThai: TrangThai;
	quanTri: boolean;
}) {
	const locale = useLocale();
	const m = loTrinhMessages(locale).sanPham;
	const tt = sanPhamMessages(locale).trangThai;
	const url = useWorkspaceUrl();
	return (
		<Empty data-lo-trinh-san-pham-trong={trangThai}>
			<EmptyHeader>
				<EmptyTitle>
					<span translate="no">{m.chuaCoTieuDe(ten)}</span>
				</EmptyTitle>
				<EmptyDescription>{tt[trangThai]}.</EmptyDescription>
			</EmptyHeader>
			{quanTri ? (
				<EmptyContent>
					<Button asChild size="sm" variant="outline">
						<Link href={url("/settings/san-pham")}>{m.moCaiDat}</Link>
					</Button>
				</EmptyContent>
			) : null}
		</Empty>
	);
}
