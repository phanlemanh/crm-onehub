"use client";

import Add from "@carbon/icons-react/es/Add";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import { skipToken, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { parseAsBoolean, useQueryState, useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import { PageShellNote } from "@/components/page-shell-note";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { useChuKy } from "./chon-chu-ky";
import { type DonDich, donDich, giaiDon } from "./don-dich";
import { NutHoiKara } from "./hoi/nut-hoi-kara";
import {
	type DonChonOkr,
	khoaDon,
	locOkr,
	okrParsers,
} from "./okr-search-params";
import { NutSoan } from "./soan/nut-soan";
import { DUONG, type TabOkr } from "./tab-okr";

export const ID_KHONG_THEM = "okr-khong-them-duoc";

export type QuyenKhu =
	| { kieu: "an" }
	| { kieu: "cho" }
	| {
			kieu: "xong";
			dich: DonDich;
			duoc: boolean;
			lyDo: string | null;
			cycleId: string;
			phaKy: PhaChuKy | null;
			quanTri: boolean;
			canEdit: boolean;
	  };

/**
 * Quyền của ba hành động đầu trang trên đơn vị đích. Quyền lấy từ `canCreate`
 * máy chủ trả cho đúng đơn vị đích (`nhapDuoc` — máy chủ dùng cùng phép kiểm cho
 * tạo và nhập); cùng khoá truy vấn với trang Theo đơn vị nên ở đó không tải thêm.
 */
export function useQuyenKhu(tab: TabOkr): QuyenKhu {
	const m = okrMessages(useLocale());
	const trpc = useTRPC();
	const [url] = useQueryStates(okrParsers);
	const { cycles, currentId } = useChuKy();
	const access = useQuery(trpc.okr.access.queryOptions());
	const cay = useQuery(trpc.org.tree.queryOptions());
	const workspace = useQuery(trpc.workspace.get.queryOptions());
	const dich = donDich(tab, url[SEARCH_PARAM.okr.don], access.data?.headOf);
	const hoiDuoc = currentId !== null && access.data !== undefined;
	const ds = useQuery(
		trpc.okr.danhSach.queryOptions(
			hoiDuoc
				? { cycleId: currentId, unit: dich.don, loc: locOkr(url) }
				: skipToken,
		),
	);
	if (cycles.data && currentId === null) return { kieu: "an" };
	const quanTri = access.data?.canManageProgram === true;
	const phaKy =
		cycles.data?.cycles.find((c) => c.id === currentId)?.phase ?? null;
	if (access.isError || ds.isError || cycles.isError)
		return {
			kieu: "xong",
			dich,
			duoc: false,
			lyDo: m.khoaTao.loiQuyen,
			cycleId: currentId ?? "",
			phaKy,
			quanTri,
			canEdit: false,
		};
	if (currentId === null || !ds.data) return { kieu: "cho" };
	const duoc = ds.data.canCreate === true;
	const ten =
		(cay.data &&
			giaiDon(dich.don, cay.data, workspace.data?.name || m.goc)?.ten) ||
		m.donVi;
	const lyDo = duoc
		? null
		: dich.nguon === "goc"
			? m.khoaTao.chuaDan
			: m.khoaTao.khongSua.replace("{ten}", ten);
	return {
		kieu: "xong",
		dich,
		duoc,
		lyDo,
		cycleId: currentId,
		phaKy,
		quanTri,
		canEdit: ds.data.canEdit === true,
	};
}

export function DongLyDoKhu({ q }: { q: QuyenKhu }) {
	if (q.kieu !== "xong" || q.lyDo === null) return null;
	return (
		<PageShellNote data-ly-do-khu="" id={ID_KHONG_THEM}>
			{q.lyDo}
		</PageShellNote>
	);
}

function useDuongTheoDonVi(cycleId: string) {
	const url = useWorkspaceUrl();
	const trpc = useTRPC();
	const [thamSo] = useQueryStates(okrParsers);
	const kyChay = useQuery(trpc.okr.cycles.queryOptions()).data?.currentId;
	return (don: DonChonOkr, khoa: string) => {
		const q = new URLSearchParams();
		const ky =
			cycleId && cycleId !== kyChay ? cycleId : thamSo[SEARCH_PARAM.okr.ky];
		if (ky) q.set(SEARCH_PARAM.okr.ky, ky);
		if (don.loai !== "goc") q.set(SEARCH_PARAM.okr.don, khoaDon(don));
		q.set(khoa, "true");
		return `${url(DUONG["theo-don-vi"])}?${q}`;
	};
}

function NutThem({
	q,
	tab,
	duong,
	ten,
}: {
	q: Extract<QuyenKhu, { kieu: "xong" }>;
	tab: TabOkr;
	duong: string;
	ten: string;
}) {
	const [, datTao] = useQueryState(
		SEARCH_PARAM.dialog.create,
		parseAsBoolean.withDefault(false),
	);
	const noiDung = (
		<>
			<Icon data-icon="inline-start" icon={Add} />
			{ten}
		</>
	);
	if (!q.duoc)
		return (
			<Button
				aria-describedby={ID_KHONG_THEM}
				data-nut="them-muc-tieu"
				disabled
				size="sm"
			>
				{noiDung}
			</Button>
		);
	if (tab === "theo-don-vi")
		return (
			<Button
				aria-haspopup="dialog"
				data-nut="them-muc-tieu"
				onClick={() => void datTao(true)}
				size="sm"
			>
				{noiDung}
			</Button>
		);
	return (
		<Button asChild data-nut="them-muc-tieu" size="sm">
			<Link href={duong}>{noiDung}</Link>
		</Button>
	);
}

function MenuThem({
	q,
	tab,
	duong,
}: {
	q: Extract<QuyenKhu, { kieu: "xong" }>;
	tab: TabOkr;
	duong: string;
}) {
	const m = okrMessages(useLocale());
	const [, datNhap] = useQueryState(
		SEARCH_PARAM.okr.nhap,
		parseAsBoolean.withDefault(false),
	);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label={m.khoaTao.themCach}
					data-nut="them-cach"
					size="icon-sm"
					variant="outline"
				>
					<Icon icon={OverflowMenuHorizontal} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{!q.duoc ? (
					<DropdownMenuItem
						aria-describedby={ID_KHONG_THEM}
						data-nut="nhap-bang-tinh"
						disabled
					>
						{m.nhapBangTinh}
					</DropdownMenuItem>
				) : tab === "theo-don-vi" ? (
					<DropdownMenuItem
						data-nut="nhap-bang-tinh"
						onSelect={() => void datNhap(true)}
					>
						{m.nhapBangTinh}
					</DropdownMenuItem>
				) : (
					<DropdownMenuItem asChild data-nut="nhap-bang-tinh">
						<Link href={duong}>{m.nhapBangTinh}</Link>
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** Hàng hành động đầu trang khu: «Hỏi Kara» · ô chu kỳ · «…» · nút soạn · «Thêm mục tiêu». */
export function HanhDongKhu({
	q,
	tab,
	chonChuKy,
	cauNoi,
}: {
	q: QuyenKhu;
	tab: TabOkr;
	chonChuKy: ReactNode;
	cauNoi: boolean;
}) {
	const m = okrMessages(useLocale());
	const toi = useDuongTheoDonVi(q.kieu === "xong" ? q.cycleId : "");
	const hoiKara = <NutHoiKara />;
	if (q.kieu === "an")
		return (
			<>
				{hoiKara}
				{chonChuKy}
			</>
		);
	if (q.kieu === "cho")
		return (
			<>
				{hoiKara}
				{chonChuKy}
				<Skeleton className="h-7 w-56" data-hang-cho="" />
			</>
		);
	return (
		<>
			{hoiKara}
			{chonChuKy}
			<MenuThem
				duong={toi(q.dich.don, SEARCH_PARAM.okr.nhap)}
				q={q}
				tab={tab}
			/>
			<NutSoan
				canEdit={q.canEdit}
				cauNoi={cauNoi}
				cycleId={q.cycleId}
				don={q.dich.don}
				khoaVi={q.duoc ? undefined : ID_KHONG_THEM}
				phaKy={q.phaKy}
				quanTri={q.quanTri}
			/>
			<NutThem
				duong={toi(q.dich.don, SEARCH_PARAM.dialog.create)}
				q={q}
				tab={tab}
				ten={m.themMucTieu}
			/>
		</>
	);
}
