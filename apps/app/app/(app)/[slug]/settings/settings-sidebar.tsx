"use client";

import {
	AreaSidebar,
	AreaSidebarGroup,
	AreaSidebarItem,
} from "@crm/ui/components/area-sidebar";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
	GOC_CAI_DAT,
	type MucCaiDat,
	mucCaiDatDangMo,
	NHOM_CAI_DAT,
	type NhomCaiDat,
} from "@/lib/cai-dat-dieu-huong";
import { settingsMessages } from "@/lib/messages/settings";
import { nhomCaiDatChoVai } from "@/lib/pham-vi-man";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

type TrangThaiMuc = { dangMo: (muc: MucCaiDat) => boolean } | null;

function Muc({
	muc,
	nhan,
	trangThai,
}: {
	muc: MucCaiDat;
	nhan: string;
	trangThai: TrangThaiMuc;
}) {
	if (!trangThai) return <AreaSidebarItem disabled>{nhan}</AreaSidebarItem>;

	return (
		<AreaSidebarItem asChild active={trangThai.dangMo(muc)}>
			<Link href={muc.href} prefetch transitionTypes={["nav-lateral"]}>
				{nhan}
			</Link>
		</AreaSidebarItem>
	);
}

function ThanhBen({
	nhom,
	trangThai,
}: {
	nhom: readonly NhomCaiDat[];
	trangThai: TrangThaiMuc;
}) {
	const t = settingsMessages(useLocale());

	return (
		<AreaSidebar label={t.thanhBen.nhan} busy={trangThai === null}>
			{nhom.map((n) => (
				<AreaSidebarGroup key={n.khoa} label={t.nhomThanhBen[n.khoa]}>
					{n.muc.map((muc) => (
						<Muc
							key={muc.href}
							muc={muc}
							nhan={t.thanhBen[muc.khoa]}
							trangThai={trangThai}
						/>
					))}
				</AreaSidebarGroup>
			))}
		</AreaSidebar>
	);
}

export function SettingsSidebarFallback() {
	return <ThanhBen nhom={NHOM_CAI_DAT} trangThai={null} />;
}

export function SettingsSidebar() {
	const pathname = usePathname();
	const workspaceUrl = useWorkspaceUrl();
	const trpc = useTRPC();
	const workspace = useQuery(trpc.workspace.get.queryOptions());
	const viewerRole = workspace.data?.viewerRole ?? null;
	const daBiet = workspace.data !== undefined;

	const root = workspaceUrl(GOC_CAI_DAT);
	const nhom = useMemo(
		() =>
			nhomCaiDatChoVai(viewerRole).map((n) => ({
				...n,
				muc: n.muc.map((muc) => ({ ...muc, href: workspaceUrl(muc.href) })),
			})),
		[workspaceUrl, viewerRole],
	);

	if (!daBiet) return <SettingsSidebarFallback />;

	return (
		<ThanhBen
			nhom={nhom}
			trangThai={{ dangMo: (muc) => mucCaiDatDangMo(muc.href, root, pathname) }}
		/>
	);
}
