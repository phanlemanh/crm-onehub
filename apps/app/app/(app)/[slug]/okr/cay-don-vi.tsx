"use client";

import Enterprise from "@carbon/icons-react/es/Enterprise";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
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
import { TreeNav, type TreeNavNode } from "@crm/ui/components/tree-nav";
import { useState, useSyncExternalStore } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
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

	return (
		<CayRong
			cay={cay}
			chon={chon}
			chonDon={chonDon}
			dem={dem}
			nhanChuaXep={m.chuaXep}
			tenGoc={tenGoc}
		/>
	);
}

type LoaiNut = "goc" | "bp" | "pb" | "nhom";

function CayRong({
	cay,
	tenGoc,
	dem,
	chon,
	chonDon,
	nhanChuaXep,
}: {
	cay: CayDuLieu;
	tenGoc: string;
	dem: Record<string, string>;
	chon: string | null;
	chonDon: (d: DonChonOkr) => void;
	nhanChuaXep: string;
}) {
	const mt = okrToanCanhMessages(useLocale());
	const la = (pb: PhongBan): TreeNavNode<LoaiNut> => ({
		id: `pb:${pb.id}`,
		name: pb.name,
		data: "pb",
	});
	const nhomChuaXep: TreeNavNode<LoaiNut>[] =
		cay.chuaXep.length > 0
			? [
					{
						id: "chua-xep",
						name: nhanChuaXep,
						data: "nhom",
						children: cay.chuaXep.map(la),
					},
				]
			: [];
	const nodes: TreeNavNode<LoaiNut>[] = [
		{ id: "goc", name: tenGoc, data: "goc" },
		...cay.divisions.map(
			(bp): TreeNavNode<LoaiNut> => ({
				id: `bp:${bp.id}`,
				name: bp.name,
				data: "bp",
				children: bp.departments.map(la),
			}),
		),
		...nhomChuaXep,
	];
	const [mo, setMo] = useState<string[]>(() =>
		nodes.filter((n) => (n.children?.length ?? 0) > 0).map((n) => n.id),
	);
	return (
		<TreeNav
			expanded={mo}
			itemAttrs={(n) =>
				n.data === "nhom"
					? { "data-nhom": "chua-xep" }
					: { "data-nut-cay": n.id }
			}
			label={mt.cay.donVi}
			nodes={nodes}
			onExpandedChange={setMo}
			onSelect={(khoa) => {
				const d = parseAsDonOkr.parse(khoa);
				if (d) chonDon(d);
			}}
			renderLabel={(n) => (
				<span className="flex w-full min-w-0 items-center gap-2">
					{n.data === "goc" ? <Icon icon={Enterprise} /> : null}
					<span
						className={
							n.data === "nhom"
								? "min-w-0 truncate text-muted-foreground text-xs"
								: "min-w-0 truncate"
						}
						translate="no"
					>
						{n.name}
					</span>
					<span className="ms-auto text-muted-foreground text-xs tabular-nums">
						{dem[n.id]}
					</span>
				</span>
			)}
			selectedId={chon}
		/>
	);
}
