"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import Enterprise from "@carbon/icons-react/es/Enterprise";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { NavItem } from "@crm/ui/components/nav-item";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { ListSearch } from "@/components/data-table/list-search";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { type CayDuLieu, khopTim, type PhongBanDuLieu } from "./kieu";
import type { DonChon } from "./to-chuc-search-params";

export function CayDieuHuong({
	cay,
	tenGoc,
	chon,
	loc,
	tim,
	chonDon,
}: {
	cay: CayDuLieu;
	tenGoc: string;
	chon: DonChon | null;
	loc: "chua-truong" | null;
	tim: string;
	chonDon: (d: DonChon) => void;
}) {
	const m = toChucMessages(useLocale());
	const dangTim = tim.trim() !== "";
	const la = (d: DonChon) =>
		chon !== null &&
		chon.loai === d.loai &&
		(d.loai === "goc" ||
			d.loai === "chua-co" ||
			("id" in chon && chon.id === d.id));

	const pbKhop = (pb: PhongBanDuLieu, tenBp: string) =>
		(loc !== "chua-truong" || pb.head === null) &&
		(!dangTim ||
			khopTim(pb.name, tim) ||
			khopTim(tenBp, tim) ||
			pb.people.some((n) => khopTim(n.name, tim) || khopTim(n.email, tim)));

	const boPhan = cay.divisions
		.map((bp) => ({
			bp,
			ds: bp.departments.filter((pb) => pbKhop(pb, bp.name)),
		}))
		.filter(
			({ bp, ds }) =>
				ds.length > 0 || (loc === null && (!dangTim || khopTim(bp.name, tim))),
		);
	const chuaXep = cay.chuaXep.filter((pb) => pbKhop(pb, ""));
	const chuaCo = cay.chuaCoPhongBan.filter(
		(n) => !dangTim || khopTim(n.name, tim) || khopTim(n.email, tim),
	);

	const nutPhongBan = (pb: PhongBanDuLieu) => (
		<NavItem
			key={pb.id}
			level={2}
			active={la({ loai: "pb", id: pb.id })}
			data-nut-cay={`pb:${pb.id}`}
			onClick={() => chonDon({ loai: "pb", id: pb.id })}
		>
			<span className="min-w-0 truncate" translate="no" data-ten>
				{pb.name}
			</span>
			<span className="ms-auto text-muted-foreground text-xs tabular-nums">
				{pb.head ? pb.people.length : m.chuaCoTruong}
			</span>
		</NavItem>
	);

	return (
		<nav aria-label={m.cay} className="flex flex-col gap-1 p-2">
			<ListSearch placeholder={m.tim} />
			<NavItem
				active={la({ loai: "goc" })}
				data-nut-cay="goc"
				onClick={() => chonDon({ loai: "goc" })}
			>
				<Icon icon={Enterprise} data-icon="inline-start" />
				<span className="min-w-0 truncate" translate="no">
					{tenGoc}
				</span>
			</NavItem>
			{boPhan.map(({ bp, ds }) => (
				<div key={bp.id} className="flex flex-col gap-1" data-nhanh={bp.id}>
					<NavItem
						level={1}
						active={la({ loai: "bp", id: bp.id })}
						data-nut-cay={`bp:${bp.id}`}
						onClick={() => chonDon({ loai: "bp", id: bp.id })}
					>
						<Icon icon={ChevronDown} data-icon="inline-start" />
						<span className="min-w-0 truncate" translate="no" data-ten>
							{bp.name}
						</span>
						<span className="ms-auto text-muted-foreground text-xs tabular-nums">
							{dien(m.soPhongBan, { n: bp.departments.length })}
						</span>
					</NavItem>
					{ds.map(nutPhongBan)}
				</div>
			))}
			{chuaXep.length > 0 ? (
				<div className="flex flex-col gap-1" data-nhom="chua-xep">
					<p className="px-2 pt-2 text-muted-foreground text-xs">{m.chuaXep}</p>
					{chuaXep.map(nutPhongBan)}
				</div>
			) : null}
			{loc === null && (!dangTim || chuaCo.length > 0) ? (
				<NavItem
					active={la({ loai: "chua-co" })}
					data-nut-cay="chua-co"
					onClick={() => chonDon({ loai: "chua-co" })}
				>
					<Icon icon={UserMultiple} data-icon="inline-start" />
					{m.chuaCoPhongBan}
					<span className="ms-auto text-muted-foreground text-xs tabular-nums">
						{cay.chuaCoPhongBan.length}
					</span>
				</NavItem>
			) : null}
		</nav>
	);
}
