"use client";

import Add from "@carbon/icons-react/es/Add";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import { skipToken, useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { type ReactNode, type RefObject, useRef } from "react";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { PageShellNote } from "@/components/page-shell-note";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { useChuKy } from "./chon-chu-ky";
import { type DonDich, donDich, giaiDon } from "./don-dich";
import { NutHoiKara } from "./hoi/nut-hoi-kara";
import { HopChonDuong, useHopChonDuong } from "./hop-chon-duong";
import {
	type DonChonOkr,
	khoaDon,
	locOkr,
	okrParsers,
} from "./okr-search-params";
import { DanhSachCuoc } from "./soan/danh-sach-cuoc";
import { donViSoanCua } from "./soan/nut-soan";
import { DUONG, type TabOkr } from "./tab-okr";
import { useTenGoc } from "./ten-goc";

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

export function useTenDon(don: DonChonOkr): string {
	const m = okrMessages(useLocale());
	const trpc = useTRPC();
	const cay = useQuery(trpc.org.tree.queryOptions());
	const tenGoc = useTenGoc();
	return (cay.data && giaiDon(don, cay.data, tenGoc)?.ten) || m.donVi;
}

export function useQuyenKhu(tab: TabOkr): QuyenKhu {
	const m = okrMessages(useLocale());
	const trpc = useTRPC();
	const [url] = useQueryStates(okrParsers);
	const { cycles, currentId } = useChuKy();
	const access = useQuery(trpc.okr.access.queryOptions());
	const dich = donDich(tab, url[SEARCH_PARAM.okr.don], access.data?.headOf);
	const ten = useTenDon(dich.don);
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

export const TAB_TAO = [
	"cua-toi",
	"theo-don-vi",
] as const satisfies readonly TabOkr[];

export const laTabTao = (tab: TabOkr): boolean =>
	(TAB_TAO as readonly TabOkr[]).includes(tab);

export function DongLyDoKhu({ q, tab }: { q: QuyenKhu; tab?: TabOkr }) {
	if (tab !== undefined && !laTabTao(tab)) return null;
	if (q.kieu !== "xong" || q.lyDo === null) return null;
	return (
		<PageShellNote data-ly-do-khu="" id={ID_KHONG_THEM}>
			{q.lyDo}
		</PageShellNote>
	);
}

export function useDuongTheoDonVi(cycleId: string) {
	const url = useWorkspaceUrl();
	const trpc = useTRPC();
	const [thamSo] = useQueryStates(okrParsers);
	const kyChay = useQuery(trpc.okr.cycles.queryOptions()).data?.currentId;
	return (don: DonChonOkr, khoa: readonly string[]) => {
		const q = new URLSearchParams();
		const ky =
			cycleId && cycleId !== kyChay ? cycleId : thamSo[SEARCH_PARAM.okr.ky];
		if (ky) q.set(SEARCH_PARAM.okr.ky, ky);
		q.set(SEARCH_PARAM.okr.don, khoaDon(don));
		for (const k of khoa) q.set(k, "true");
		return `${url(DUONG["theo-don-vi"])}?${q}`;
	};
}

function NutThem({
	q,
	ten,
	nutRef,
}: {
	q: Extract<QuyenKhu, { kieu: "xong" }>;
	ten: string;
	nutRef: RefObject<HTMLButtonElement | null>;
}) {
	const [, dat] = useHopChonDuong();
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
	return (
		<Button
			aria-haspopup="dialog"
			data-nut="them-muc-tieu"
			onClick={() => void dat({ [SEARCH_PARAM.okr.chonDuong]: true })}
			ref={nutRef}
			size="sm"
		>
			{noiDung}
		</Button>
	);
}

function DsCuocTheoUrl({
	q,
	cauNoi,
}: {
	q: Extract<QuyenKhu, { kieu: "xong" }>;
	cauNoi: boolean;
}) {
	const [thamSo, dat] = useHopChonDuong();
	const moBanGhi = useOpenRecord();
	const donVi = donViSoanCua(q.dich.don, q.cycleId);
	if (!thamSo[SEARCH_PARAM.okr.dsCuoc] || !cauNoi || !donVi) return null;
	const dong = () => void dat({ [SEARCH_PARAM.okr.dsCuoc]: null });
	return (
		<DanhSachCuoc
			donVi={donVi}
			dong={dong}
			mo={(id) => {
				dong();
				moBanGhi({ kind: "soan", id });
			}}
		/>
	);
}

export function HanhDongKhu({
	q,
	tab,
	cauNoi,
}: {
	q: QuyenKhu;
	tab: TabOkr;
	chonChuKy?: ReactNode;
	cauNoi: boolean;
}) {
	const m = okrMessages(useLocale());
	const nutRef = useRef<HTMLButtonElement>(null);
	const hoiKara = <NutHoiKara />;
	if (!laTabTao(tab) || q.kieu === "an") return hoiKara;
	if (q.kieu === "cho")
		return (
			<>
				{hoiKara}
				<Skeleton className="h-7 w-36" data-hang-cho="" />
			</>
		);
	return (
		<>
			{hoiKara}
			<NutThem nutRef={nutRef} q={q} ten={m.themMucTieu} />
			<HopChonDuong cauNoi={cauNoi} nutVe={nutRef} q={q} tab={tab} />
			<DsCuocTheoUrl cauNoi={cauNoi} q={q} />
		</>
	);
}
