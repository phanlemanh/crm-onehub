"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import Enterprise from "@carbon/icons-react/es/Enterprise";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { NavItem } from "@crm/ui/components/nav-item";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { useSyncExternalStore } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { type CayDuLieu, KHO_HEP } from "./kieu";
import { type DonChonOkr, khoaDon, parseAsDonOkr } from "./okr-search-params";

export function useKhoHep(): boolean {
	return useSyncExternalStore(
		(bao) => {
			const q = window.matchMedia(KHO_HEP);
			q.addEventListener("change", bao);
			return () => q.removeEventListener("change", bao);
		},
		() => window.matchMedia(KHO_HEP).matches,
		() => false,
	);
}

type PhongBan = CayDuLieu["chuaXep"][number];

export function CayDonVi({
	cay,
	tenGoc,
	dem,
	don,
	chonDon,
}: {
	cay: CayDuLieu;
	tenGoc: string;
	dem: Record<string, string>;
	don: DonChonOkr | null;
	chonDon: (d: DonChonOkr) => void;
}) {
	const m = okrMessages(useLocale());
	const hep = useKhoHep();
	const chon = don === null ? null : khoaDon(don);
	const nguoi =
		don?.loai === "nguoi"
			? (cay.people.find((p) => p.id === don.id) ?? null)
			: null;

	if (hep)
		return (
			<Select
				value={chon ?? "goc"}
				onValueChange={(v) => {
					const d = parseAsDonOkr.parse(v);
					if (d) chonDon(d);
				}}
			>
				<SelectTrigger aria-label={m.donVi} className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="goc">
						<span translate="no">{tenGoc}</span>
					</SelectItem>
					{cay.divisions.map((bp) => (
						<SelectGroup key={bp.id}>
							<SelectSeparator />
							<SelectItem value={`bp:${bp.id}`}>
								<span translate="no">{bp.name}</span>
							</SelectItem>
							{bp.departments.map((pb) => (
								<SelectItem key={pb.id} value={`pb:${pb.id}`}>
									<span translate="no">{pb.name}</span>
								</SelectItem>
							))}
						</SelectGroup>
					))}
					{cay.chuaXep.length > 0 ? (
						<SelectGroup>
							<SelectSeparator />
							<SelectLabel>{m.chuaXep}</SelectLabel>
							{cay.chuaXep.map((pb) => (
								<SelectItem key={pb.id} value={`pb:${pb.id}`}>
									<span translate="no">{pb.name}</span>
								</SelectItem>
							))}
						</SelectGroup>
					) : null}
					{nguoi ? (
						<SelectGroup>
							<SelectSeparator />
							<SelectLabel>{m.cap.nguoi}</SelectLabel>
							<SelectItem value={`nguoi:${nguoi.id}`}>
								<span translate="no">{nguoi.name}</span>
							</SelectItem>
						</SelectGroup>
					) : null}
				</SelectContent>
			</Select>
		);

	const nutPhongBan = (pb: PhongBan) => {
		const k = `pb:${pb.id}`;
		return (
			<NavItem
				key={pb.id}
				level={2}
				active={chon === k}
				data-nut-cay={k}
				onClick={() => chonDon({ loai: "pb", id: pb.id })}
			>
				<span className="min-w-0 truncate" translate="no">
					{pb.name}
				</span>
				<span className="ms-auto text-muted-foreground text-xs tabular-nums">
					{dem[k]}
				</span>
			</NavItem>
		);
	};

	return (
		<nav aria-label={m.donVi} className="flex flex-col gap-1 p-2">
			<NavItem
				active={chon === "goc"}
				data-nut-cay="goc"
				onClick={() => chonDon({ loai: "goc" })}
			>
				<Icon icon={Enterprise} data-icon="inline-start" />
				<span className="min-w-0 truncate" translate="no">
					{tenGoc}
				</span>
				<span className="ms-auto text-muted-foreground text-xs tabular-nums">
					{dem.goc}
				</span>
			</NavItem>
			{cay.divisions.map((bp) => {
				const k = `bp:${bp.id}`;
				return (
					<div key={bp.id} className="flex flex-col gap-1" data-nhanh={bp.id}>
						<NavItem
							level={1}
							active={chon === k}
							data-nut-cay={k}
							onClick={() => chonDon({ loai: "bp", id: bp.id })}
						>
							<Icon icon={ChevronDown} data-icon="inline-start" />
							<span className="min-w-0 truncate" translate="no">
								{bp.name}
							</span>
							<span className="ms-auto text-muted-foreground text-xs tabular-nums">
								{dem[k]}
							</span>
						</NavItem>
						{bp.departments.map(nutPhongBan)}
					</div>
				);
			})}
			{cay.chuaXep.length > 0 ? (
				<div className="flex flex-col gap-1" data-nhom="chua-xep">
					<p className="px-2 pt-2 text-muted-foreground text-xs">{m.chuaXep}</p>
					{cay.chuaXep.map(nutPhongBan)}
				</div>
			) : null}
		</nav>
	);
}
