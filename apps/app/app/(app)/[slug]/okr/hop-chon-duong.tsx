"use client";

import Chat from "@carbon/icons-react/es/Chat";
import DocumentImport from "@carbon/icons-react/es/DocumentImport";
import Edit from "@carbon/icons-react/es/Edit";
import Template from "@carbon/icons-react/es/Template";
import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { KaraMark } from "@crm/ui/components/kara";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";
import type { ReactNode, RefObject } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { type QuyenKhu, useDuongTheoDonVi, useTenDon } from "./hanh-dong-khu";
import { CAP_THEO_DON } from "./hop-thoai-muc-tieu";
import { BoKhoaUrl } from "./ngan-okr-url";
import { useDuongSoan } from "./soan/duong-soan";
import type { TabOkr } from "./tab-okr";
import { locMau } from "./tu-mau";

export type DuongTao = "tu-viet" | "tu-mau" | "bang-tinh" | "soan";

const KHOA_DUONG = {
	"tu-viet": [SEARCH_PARAM.dialog.create],
	"tu-mau": [SEARCH_PARAM.dialog.create, SEARCH_PARAM.okr.tuMau],
	"bang-tinh": [SEARCH_PARAM.okr.nhap],
} as const satisfies Record<Exclude<DuongTao, "soan">, readonly string[]>;

const thamSoHop = {
	[SEARCH_PARAM.okr.chonDuong]: parseAsBoolean,
	[SEARCH_PARAM.dialog.create]: parseAsBoolean,
	[SEARCH_PARAM.okr.tuMau]: parseAsBoolean,
	[SEARCH_PARAM.okr.nhap]: parseAsBoolean,
	[SEARCH_PARAM.okr.dsCuoc]: parseAsString,
};

export function useHopChonDuong() {
	return useQueryStates(thamSoHop, { history: "push" });
}

function useCoMau(q: Extract<QuyenKhu, { kieu: "xong" }>) {
	const trpc = useTRPC();
	const don = q.dich.don;
	const canNguoi = don.loai === "nguoi";
	const cay = useQuery({
		...trpc.org.tree.queryOptions(),
		enabled: canNguoi,
	});
	const loc = locMau(
		CAP_THEO_DON[don.loai],
		don,
		don.loai === "nguoi" ? don.id : "",
		cay.data?.people ?? [],
	);
	const ds = useQuery({
		...trpc.okr.mau.queryOptions(loc ?? {}),
		enabled: loc !== null,
	});
	if (loc === null) return false;
	return (ds.data?.mau.length ?? 0) > 0;
}

function DongDuong({
	duong,
	icon,
	ten,
	moTa,
	khoa,
	phu,
	onChon,
}: {
	duong: DuongTao;
	icon: ReactNode;
	ten: string;
	moTa: string;
	khoa: boolean;
	phu?: ReactNode;
	onChon: () => void;
}) {
	return (
		<Item asChild size="sm" variant="outline">
			<button
				aria-disabled={khoa ? "true" : undefined}
				data-duong={duong}
				onClick={() => {
					if (!khoa) onChon();
				}}
				type="button"
			>
				<ItemMedia variant="icon">{icon}</ItemMedia>
				<ItemContent>
					<ItemTitle>{ten}</ItemTitle>
					<ItemDescription>{moTa}</ItemDescription>
				</ItemContent>
				{phu ? <ItemActions>{phu}</ItemActions> : null}
			</button>
		</Item>
	);
}

function NoiDungHop({
	q,
	tab,
	cauNoi,
}: {
	q: Extract<QuyenKhu, { kieu: "xong" }>;
	tab: TabOkr;
	cauNoi: boolean;
}) {
	const m = okrMessages(useLocale());
	const c = m.chonDuong;
	const router = useRouter();
	const [, dat] = useHopChonDuong();
	const tenDon = useTenDon(q.dich.don);
	const toi = useDuongTheoDonVi(q.cycleId);
	const coMau = useCoMau(q);
	const soan = useDuongSoan({ q, cauNoi });
	const [truoc, sau] = c.moTa.split("{ten}");

	const di = (duong: Exclude<DuongTao, "soan">) => {
		const khoa = KHOA_DUONG[duong];
		if (tab === "theo-don-vi") {
			void dat({
				[SEARCH_PARAM.okr.chonDuong]: null,
				...Object.fromEntries(khoa.map((k) => [k, true])),
			});
			return;
		}
		void dat({ [SEARCH_PARAM.okr.chonDuong]: null });
		router.push(toi(q.dich.don, khoa));
	};

	const sd = soan.duong;
	const soanKhoa = sd.loai === "khoa" || sd.loai === "dang-tai" || soan.dangMo;
	return (
		<>
			<DialogHeader>
				<DialogTitle>{m.themMucTieu}</DialogTitle>
				<DialogDescription>
					{truoc}
					<span translate="no">{tenDon}</span>
					{sau}
				</DialogDescription>
			</DialogHeader>
			<ItemGroup>
				<DongDuong
					duong="tu-viet"
					icon={<Icon icon={Edit} />}
					khoa={false}
					moTa={c.duong.tuViet.moTa}
					onChon={() => di("tu-viet")}
					ten={c.duong.tuViet.ten}
				/>
				<DongDuong
					duong="tu-mau"
					icon={<Icon icon={Template} />}
					khoa={!coMau}
					moTa={coMau ? c.duong.tuMau.moTa : c.khoa.chuaCoMau}
					onChon={() => di("tu-mau")}
					ten={c.duong.tuMau.ten}
				/>
				<DongDuong
					duong="bang-tinh"
					icon={<Icon icon={DocumentImport} />}
					khoa={false}
					moTa={c.duong.bangTinh.moTa}
					onChon={() => di("bang-tinh")}
					ten={c.duong.bangTinh.ten}
				/>
				<DongDuong
					duong="soan"
					icon={<Icon icon={Chat} />}
					khoa={soanKhoa}
					moTa={sd.loai === "khoa" ? sd.lyDo : c.duong.soan.moTa}
					onChon={() => {
						void dat({ [SEARCH_PARAM.okr.chonDuong]: null });
						soan.chon();
					}}
					phu={<KaraMark />}
					ten={sd.loai === "tiep" ? c.tiep : c.duong.soan.ten}
				/>
			</ItemGroup>
			{soan.soCuocDaDung > 0 && soan.donVi ? (
				<div>
					<Button
						data-nut="ds-cuoc"
						onClick={() =>
							void dat({
								[SEARCH_PARAM.okr.chonDuong]: null,
								[SEARCH_PARAM.okr.dsCuoc]: "1",
							})
						}
						size="sm"
						variant="ghost"
					>
						{c.cuocDaSoan(String(soan.soCuocDaDung), String(soan.tranCuoc))}
					</Button>
				</div>
			) : null}
		</>
	);
}

export function HopChonDuong({
	q,
	tab,
	cauNoi,
	nutVe,
}: {
	q: Extract<QuyenKhu, { kieu: "xong" }>;
	tab: TabOkr;
	cauNoi: boolean;
	nutVe: RefObject<HTMLButtonElement | null>;
}) {
	const [thamSo, dat] = useHopChonDuong();
	const mo = thamSo[SEARCH_PARAM.okr.chonDuong] === true;
	const dong = () => void dat({ [SEARCH_PARAM.okr.chonDuong]: null });
	if (mo && !q.duoc) return <BoKhoaUrl bo={dong} />;
	if (!mo) return null;
	return (
		<Dialog
			onOpenChange={(moTiep) => {
				if (!moTiep) dong();
			}}
			open
		>
			<DialogContent
				data-hop-chon-duong=""
				onCloseAutoFocus={(e) => {
					if (!nutVe.current) return;
					e.preventDefault();
					nutVe.current.focus();
				}}
			>
				<NoiDungHop cauNoi={cauNoi} q={q} tab={tab} />
			</DialogContent>
		</Dialog>
	);
}
