"use client";

import Launch from "@carbon/icons-react/es/Launch";
import {
	AreaSidebar,
	AreaSidebarGroup,
	AreaSidebarItem,
} from "@crm/ui/components/area-sidebar";
import { Badge } from "@crm/ui/components/badge";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { skipToken, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrMoiKrMessages } from "@/lib/messages/okr-moi-kr";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { ChonChuKy, useKyHoiY } from "./chon-chu-ky";
import { nhanTuHoiYNhan } from "./hoi-y/man-hoi-y";
import { okrParsers } from "./okr-search-params";
import {
	DUONG_MUC,
	type MucThanhBen,
	mucDangMo,
	NHOM_THANH_BEN,
} from "./tab-okr";
import { tieuDeKhu } from "./tieu-de-khu";

const DUONG_CHUONG_TRINH = "/settings/okr";

type TrangThaiMuc = {
	href: (muc: MucThanhBen) => string;
	dangMo: (muc: MucThanhBen) => boolean;
	soYKien: ReactNode;
} | null;

function useNhan() {
	const t = okrVoKhuMessages(useLocale());
	const nhom = {
		dau: undefined,
		okr: t.nhom.okr,
		"bao-cao": t.nhom.baoCao,
	} satisfies Record<
		(typeof NHOM_THANH_BEN)[number]["khoa"],
		string | undefined
	>;
	const muc = {
		"cua-toi": t.muc.cuaToi,
		"bo-okr": t.muc.boOkr,
		"lay-y-kien": t.muc.layYKien,
		"suc-khoe": t.muc.sucKhoe,
		"moi-kr": okrMoiKrMessages(useLocale()).muc,
		"so-do": t.muc.soDo,
	} satisfies Record<MucThanhBen, string>;
	return { nhom, muc, chuongTrinh: t.chuongTrinh };
}

function Muc({
	muc,
	nhan,
	trangThai,
}: {
	muc: MucThanhBen;
	nhan: string;
	trangThai: TrangThaiMuc;
}) {
	if (!trangThai) return <AreaSidebarItem disabled>{nhan}</AreaSidebarItem>;
	return (
		<AreaSidebarItem asChild active={trangThai.dangMo(muc)}>
			<Link
				href={trangThai.href(muc)}
				prefetch
				transitionTypes={["nav-lateral"]}
			>
				{nhan}
				{muc === "lay-y-kien" ? trangThai.soYKien : null}
			</Link>
		</AreaSidebarItem>
	);
}

function ThanhBen({
	header,
	footer,
	trangThai,
}: {
	header: ReactNode;
	footer?: ReactNode;
	trangThai: TrangThaiMuc;
}) {
	const locale = useLocale();
	const nhan = useNhan();
	return (
		<AreaSidebar
			busy={trangThai === null}
			footer={footer}
			header={header}
			label={tieuDeKhu(locale)}
		>
			{NHOM_THANH_BEN.map((n) => (
				<AreaSidebarGroup key={n.khoa} label={nhan.nhom[n.khoa]}>
					{n.muc.map((muc) => (
						<Muc
							key={muc}
							muc={muc}
							nhan={nhan.muc[muc]}
							trangThai={trangThai}
						/>
					))}
				</AreaSidebarGroup>
			))}
		</AreaSidebar>
	);
}

export function ThanhBenMucTieuCho() {
	return (
		<ThanhBen header={<Skeleton className="h-7 w-full" />} trangThai={null} />
	);
}

function SoYKien() {
	const m = okrMessages(useLocale());
	const trpc = useTRPC();
	const { cycleId } = useKyHoiY();
	const nhan = useQuery(
		trpc.okr.hoiYNhan.queryOptions(cycleId === null ? skipToken : { cycleId }),
	);
	const so = nhanTuHoiYNhan(nhan.data);
	if (so === null) return null;
	return <Badge variant="secondary">{so === "moi" ? m.nhanHoiYMoi : so}</Badge>;
}

function ChanThanhBen() {
	const nhan = useNhan();
	const url = useWorkspaceUrl();
	return (
		<AreaSidebarItem asChild>
			<Link href={url(DUONG_CHUONG_TRINH)} prefetch>
				{nhan.chuongTrinh}
				<Icon data-icon="inline-end" icon={Launch} />
			</Link>
		</AreaSidebarItem>
	);
}

export function ThanhBenMucTieu() {
	const url = useWorkspaceUrl();
	const duong = usePathname() ?? "";
	const [thamSo] = useQueryStates(okrParsers);
	const trpc = useTRPC();
	const access = useQuery(trpc.okr.access.queryOptions());
	const ky = thamSo[SEARCH_PARAM.okr.ky];
	const goc = url(DUONG_MUC["cua-toi"]);
	const duoi = ky
		? `?${new URLSearchParams({ [SEARCH_PARAM.okr.ky]: ky })}`
		: "";
	return (
		<ThanhBen
			footer={access.data?.canManageProgram === true ? <ChanThanhBen /> : null}
			header={<ChonChuKy />}
			trangThai={{
				href: (muc) => `${url(DUONG_MUC[muc])}${duoi}`,
				dangMo: (muc) => mucDangMo(url(DUONG_MUC[muc]), goc, duong),
				soYKien: <SoYKien />,
			}}
		/>
	);
}
