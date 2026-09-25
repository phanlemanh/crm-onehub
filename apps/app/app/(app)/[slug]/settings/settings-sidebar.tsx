"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { NavGroup, NavGroupLabel, NavItem } from "@crm/ui/components/nav-item";
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
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

type TrangThaiMuc = { dangMo: (muc: MucCaiDat) => boolean } | null;

function Muc({
	muc,
	nhan,
	trangThai,
	orientation,
}: {
	muc: MucCaiDat;
	nhan: string;
	trangThai: TrangThaiMuc;
	orientation: "vertical" | "horizontal";
}) {
	if (!trangThai) {
		return (
			<NavItem disabled orientation={orientation}>
				{nhan}
			</NavItem>
		);
	}

	const dangMo = trangThai.dangMo(muc);

	return (
		<NavItem asChild active={dangMo} orientation={orientation}>
			<Link href={muc.href} prefetch transitionTypes={["nav-lateral"]}>
				{nhan}
			</Link>
		</NavItem>
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
	const dangTai = trangThai ? undefined : "true";

	return (
		<>
			<aside className="hidden w-56 shrink-0 border-r md:block [view-transition-name:settings-sidebar]">
				<nav
					aria-label={t.thanhBen.nhan}
					aria-busy={dangTai}
					className="flex flex-col gap-4 p-3"
				>
					{nhom.map((n) => (
						<NavGroup key={n.khoa} aria-labelledby={`nhom-cai-dat-${n.khoa}`}>
							<NavGroupLabel id={`nhom-cai-dat-${n.khoa}`}>
								{t.nhomThanhBen[n.khoa]}
							</NavGroupLabel>
							{n.muc.map((muc) => (
								<Muc
									key={muc.href}
									muc={muc}
									nhan={t.thanhBen[muc.khoa]}
									trangThai={trangThai}
									orientation="vertical"
								/>
							))}
						</NavGroup>
					))}
				</nav>
			</aside>

			<nav
				aria-label={t.thanhBen.nhan}
				aria-busy={dangTai}
				className="flex gap-1 overflow-x-auto border-b p-2 md:hidden [view-transition-name:settings-sidebar]"
			>
				{nhom.flatMap((n) =>
					n.muc.map((muc) => (
						<Muc
							key={muc.href}
							muc={muc}
							nhan={t.thanhBen[muc.khoa]}
							trangThai={trangThai}
							orientation="horizontal"
						/>
					)),
				)}
			</nav>
		</>
	);
}

export function SettingsSidebarFallback() {
	return <ThanhBen nhom={NHOM_CAI_DAT} trangThai={null} />;
}

export function SettingsSidebar() {
	const pathname = usePathname();
	const workspaceUrl = useWorkspaceUrl();

	const root = workspaceUrl(GOC_CAI_DAT);
	const nhom = useMemo(
		() =>
			NHOM_CAI_DAT.map((n) => ({
				...n,
				muc: n.muc.map((muc) => ({ ...muc, href: workspaceUrl(muc.href) })),
			})),
		[workspaceUrl],
	);

	return (
		<ThanhBen
			nhom={nhom}
			trangThai={{ dangMo: (muc) => mucCaiDatDangMo(muc.href, root, pathname) }}
		/>
	);
}
