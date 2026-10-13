"use client";

import Add from "@carbon/icons-react/es/Add";
import Search from "@carbon/icons-react/es/Search";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageShellNote } from "@/components/page-shell";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { duongDanhSach, duongTrangMoi, TAI_LIEU_MAN } from "@/lib/tai-lieu-man";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { type Loc, moTimNhanh, thamSo } from "./danh-sach-loc";
import { type LuaChonTai, NutTaiNguon } from "./hop-tai-nguon";

export function HanhDongTaiLieu({
	tab,
	loai,
	donVi = null,
	chu = null,
	nhom = "cho",
	page,
	luaChon,
}: Pick<Loc, "tab" | "loai" | "page"> &
	Partial<Pick<Loc, "donVi" | "chu" | "nhom">> & {
		luaChon: LuaChonTai;
	}) {
	const m = taiLieuMessages(useLocale());
	const url = useWorkspaceUrl();
	const lienKetTim = moTimNhanh(
		`${url(duongDanhSach())}${thamSo({ tab, loai, donVi, chu, nhom, page })}`,
	);

	return (
		<>
			<Button asChild variant="outline">
				<Link
					aria-keyshortcuts="Meta+K Control+K"
					data-nut-tim-nhanh=""
					href={lienKetTim}
					scroll={false}
				>
					<Icon icon={Search} />
					{m.timNhanh}
					<span aria-hidden className="text-muted-foreground text-xs">
						⌘K
					</span>
				</Link>
			</Button>
			<NutTaiNguon luaChon={luaChon} />
			<Button asChild>
				<Link href={url(duongTrangMoi())}>
					<Icon icon={Add} />
					{m.trangMoi}
				</Link>
			</Button>
		</>
	);
}

export function DongNguonTat() {
	const m = taiLieuMessages(useLocale()).nguon;
	const trpc = useTRPC();
	const trangThai = useQuery(trpc.taiLieuNguon.trangThai.queryOptions());
	if (trangThai.data?.bat === false) {
		return (
			<PageShellNote data-nguon-tat="" id={TAI_LIEU_MAN.idNguonTat}>
				{m.tat}
			</PageShellNote>
		);
	}
	if (trangThai.isError) {
		return (
			<PageShellNote data-nguon-khong-doc="" id={TAI_LIEU_MAN.idNguonTat}>
				{m.khongDocDuoc}
			</PageShellNote>
		);
	}
	return null;
}
