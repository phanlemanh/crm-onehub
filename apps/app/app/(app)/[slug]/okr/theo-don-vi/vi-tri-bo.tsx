"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbMenu,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@crm/ui/components/breadcrumb";
import {
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@crm/ui/components/dropdown-menu";
import { useLocale } from "@crm/ui/components/locale-provider";
import Link from "next/link";
import { Fragment } from "react";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import type { CayDuLieu } from "../kieu";
import type { DonChonOkr } from "../okr-search-params";
import { DUONG_SO_DO } from "../tab-okr";
import { type DonLanCan, lanCan } from "./lan-can";
import { hrefThe, type TheBo, useGocBoOkr } from "./the-con";

export function useHrefDanhSachBo(ky: string | null): string {
	const url = useWorkspaceUrl();
	const q = new URLSearchParams();
	if (ky) q.set(SEARCH_PARAM.okr.ky, ky);
	return `${url("/okr/bo-okr")}${q.size > 0 ? `?${q}` : ""}`;
}

export type MenuViTri = {
	cay: CayDuLieu;
	don: DonChonOkr;
	the: TheBo;
	dem: Readonly<Record<string, number>> | undefined;
	tenGoc: string;
};

function MenuBo({
	ky,
	tenBo,
	menu,
}: {
	ky: string | null;
	tenBo: string;
	menu: MenuViTri;
}) {
	const m = okrVoKhuMessages(useLocale()).boOkr.menu;
	const goc = useGocBoOkr();
	const soDo = useWorkspaceUrl()(DUONG_SO_DO);
	const lc = lanCan(menu.cay, menu.don, menu.tenGoc);
	const ten = <span translate="no">{tenBo}</span>;
	if (lc === null) return <BreadcrumbPage>{ten}</BreadcrumbPage>;
	const nhom = [
		{ nhan: m.thuoc, ds: lc.cha ? [lc.cha] : [] },
		{ nhan: m.cungCap, ds: lc.cungCap },
		{ nhan: m.trucThuoc, ds: lc.trucThuoc },
	].filter((n) => n.ds.length > 0);
	if (nhom.length === 0) return <BreadcrumbPage>{ten}</BreadcrumbPage>;
	const dem = (d: DonLanCan) => {
		if (menu.dem === undefined) return null;
		const n = menu.dem[d.khoa] ?? 0;
		return n === 0 ? m.chuaCoRieng : m.demMucTieu(n);
	};
	return (
		<BreadcrumbMenu aria-label={m.doiBo(tenBo)} data-menu-vi-tri="" label={ten}>
			{nhom.map((n, i) => (
				<Fragment key={n.nhan}>
					{i > 0 ? <DropdownMenuSeparator /> : null}
					<DropdownMenuGroup data-nhom-menu={n.nhan}>
						<DropdownMenuLabel>{n.nhan}</DropdownMenuLabel>
						{n.ds.map((d) => (
							<DropdownMenuItem asChild key={d.khoa}>
								<Link
									data-menu-don={d.khoa}
									href={hrefThe({ goc, soDo, don: d.don, ky, the: menu.the })}
								>
									<span className="flex min-w-0 flex-col">
										<span className="wrap-anywhere" translate="no">
											{d.ten}
										</span>
										{dem(d) === null ? null : (
											<span className="text-muted-foreground text-xs tabular-nums">
												{dem(d)}
											</span>
										)}
									</span>
								</Link>
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
				</Fragment>
			))}
		</BreadcrumbMenu>
	);
}

export function ViTriBo({
	ky,
	tenBo,
	menu,
}: {
	ky: string | null;
	tenBo?: string | null;
	menu?: MenuViTri;
}) {
	const nhan = okrVoKhuMessages(useLocale()).boOkr.viTri;
	const veDanhSach = useHrefDanhSachBo(ky);
	if (tenBo === undefined)
		return (
			<Breadcrumb data-vi-tri-bo="danh-sach">
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>{nhan}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		);
	return (
		<Breadcrumb data-vi-tri-bo="mot-bo">
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link data-ve-bo-okr="" href={veDanhSach}>
							{nhan}
						</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>
				{tenBo ? (
					<>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							{menu ? (
								<MenuBo ky={ky} menu={menu} tenBo={tenBo} />
							) : (
								<BreadcrumbPage translate="no">{tenBo}</BreadcrumbPage>
							)}
						</BreadcrumbItem>
					</>
				) : null}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
