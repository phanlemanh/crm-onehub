"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { useLocale, useMessages } from "@crm/ui/components/locale-provider";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMoDienBien } from "@/components/crm/record-sheet/dien-bien-kr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { HangCamXuc } from "./cam-xuc/hang-cam-xuc";
import { KhoiTomTat } from "./khoi-tom-tat";
import type { DonChonOkr } from "./okr-search-params";
import { ThanhTienDo } from "./tien-do-kr";
import { LoiXem } from "./toan-canh/toan-canh";
import { DangTai } from "./trang-thai-okr";

type HopTuanDuLieu = RouterOutputs["okr"]["hopTuan"];
type DongHop = HopTuanDuLieu["dangBan"][number];
type LyDo = DongHop["lyDo"][number];

function NhanLyDo({ lyDo }: { lyDo: LyDo }) {
	const mt = okrToanCanhMessages(useLocale());
	const ui = useMessages();
	const tenMuc = {
		cao: ui.okr.tuTinCao.toLocaleLowerCase(),
		vua: ui.okr.tuTinVua.toLocaleLowerCase(),
		thap: ui.okr.tuTinThap.toLocaleLowerCase(),
	};
	switch (lyDo.loai) {
		case "tut":
			return (
				<StatusIndicator
					data-ly-do="tut"
					label={mt.hopTuan.tut(tenMuc[lyDo.tu], tenMuc[lyDo.den])}
					size="sm"
					tone="error"
				/>
			);
		case "im":
			return (
				<StatusIndicator
					data-ly-do="im"
					label={mt.hopTuan.im(String(lyDo.soNgay))}
					size="sm"
					tone="warning"
				/>
			);
		case "ghi-chu":
			return (
				<StatusIndicator
					data-ly-do="ghi-chu"
					label={mt.hopTuan.ghiChuMoi}
					size="sm"
					tone="info"
				/>
			);
	}
}

function TienDoDong({ dong }: { dong: DongHop }) {
	return (
		<div className="flex flex-col gap-1.5">
			<span className="flex items-center gap-3">
				<ThanhTienDo
					expected={dong.expected}
					progress={dong.progress}
					ten={dong.tieuDe}
				/>
				<span className="w-9 shrink-0 text-right text-xs tabular-nums">
					{dong.progress}%
				</span>
			</span>
			{dong.tuTin ? <ConfidenceIndicator level={dong.tuTin} size="sm" /> : null}
		</div>
	);
}

function DongBan({ dong }: { dong: DongHop }) {
	const mt = okrToanCanhMessages(useLocale());
	const moDienBien = useMoDienBien();
	return (
		<SimpleTableRow data-kr-hop={dong.keyResultId}>
			<TableCell className="px-3 py-3 align-top whitespace-normal">
				<div className="flex flex-col gap-1.5">
					<button
						className="text-start text-sm underline-offset-2 hover:underline focus-visible:underline"
						data-mo-kr={dong.keyResultId}
						onClick={() => moDienBien(dong.objectiveId, dong.keyResultId)}
						translate="no"
						type="button"
					>
						{dong.tieuDe}
					</button>
					<span className="text-muted-foreground text-xs">
						<span translate="no">{dong.mucTieu}</span>
						{" · "}
						{mt.hopTuan.phuTrach(dong.chuTen)}
					</span>
					{dong.lyDo.length > 0 ? (
						<span className="flex flex-wrap gap-x-4 gap-y-1">
							{dong.lyDo.map((l) => (
								<NhanLyDo key={l.loai} lyDo={l} />
							))}
						</span>
					) : null}
					<span className="md:hidden">
						<TienDoDong dong={dong} />
					</span>
					{dong.checkInId ? (
						<HangCamXuc
							camXuc={dong.camXuc}
							checkInId={dong.checkInId}
							objectiveId={dong.objectiveId}
						/>
					) : null}
				</div>
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top md:table-cell">
				<TienDoDong dong={dong} />
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top text-sm whitespace-normal lg:table-cell">
				{dong.ghiChu ? (
					<span translate="no">«{dong.ghiChu}»</span>
				) : (
					<span className="text-muted-foreground">—</span>
				)}
			</TableCell>
		</SimpleTableRow>
	);
}

function BangBan({ dong }: { dong: DongHop[] }) {
	const mt = okrToanCanhMessages(useLocale());
	const cot: SimpleTableColumn[] = [
		{ id: "kr", header: mt.hopTuan.cotKr },
		{
			id: "tien-do",
			header: mt.hopTuan.cotTienDo,
			width: "w-[26%]",
			className: "hidden md:table-cell",
		},
		{
			id: "ghi-chu",
			header: mt.hopTuan.cotGhiChu,
			width: "w-[30%]",
			className: "hidden lg:table-cell",
		},
	];
	return (
		<SimpleTable columns={cot} surface="page">
			{dong.map((d) => (
				<DongBan dong={d} key={d.keyResultId} />
			))}
		</SimpleTable>
	);
}

function PhanConLai({ dong }: { dong: DongHop[] }) {
	const mt = okrToanCanhMessages(useLocale());
	if (dong.length === 0) return null;
	return (
		<Collapsible data-con-lai>
			<CollapsibleTrigger asChild>
				<Button className="self-start" size="sm" variant="ghost">
					<Icon icon={ChevronDown} data-icon="inline-start" />
					{mt.hopTuan.conLai(String(dong.length))}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="pt-3">
				<BangBan dong={dong} />
			</CollapsibleContent>
		</Collapsible>
	);
}

export function HopTuan({
	cycleId,
	unit,
}: {
	cycleId: string;
	unit: DonChonOkr;
}) {
	const mt = okrToanCanhMessages(useLocale());
	const trpc = useTRPC();
	const ht = useQuery(trpc.okr.hopTuan.queryOptions({ cycleId, unit }));
	const mo = useMutation(trpc.okr.moHopTuan.mutationOptions());
	useMountEffect(() => {
		mo.mutate({ cycleId, unit });
	});
	const khoi =
		unit.loai === "pb" ? (
			<KhoiTomTat cycleId={cycleId} departmentId={unit.id} />
		) : null;
	const boc = (than: ReactNode) =>
		khoi ? (
			<div className="flex flex-col gap-6">
				{khoi}
				{than}
			</div>
		) : (
			than
		);

	if (ht.isPending) return boc(<DangTai />);
	if (ht.isError)
		return boc(
			<LoiXem
				cau={mt.hopTuan.loi}
				thuLai={() => void ht.refetch()}
				trangThai="ST-hoptuan-loi"
			/>,
		);
	const d = ht.data;
	const dauMuc = (
		<p className="text-muted-foreground text-xs" data-tom-tat-hop>
			{mt.hopTuan.tuan(`${d.tuan.slice(8, 10)}/${d.tuan.slice(5, 7)}`)}
			{" · "}
			{mt.hopTuan.daCapNhat(String(d.daCapNhat), String(d.tongKr))}
		</p>
	);

	if (d.tuanDau)
		return boc(
			<div className="flex flex-col gap-3" data-trang-thai="ST-hoptuan-tuandau">
				{dauMuc}
				<Empty>
					<EmptyHeader>
						<EmptyTitle>{mt.hopTuan.tuanDau}</EmptyTitle>
						<EmptyDescription>{mt.hopTuan.tuanDauMoTa}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>,
		);

	if (d.dangBan.length === 0)
		return boc(
			<div className="flex flex-col gap-3" data-trang-thai="ST-hoptuan-yenang">
				{dauMuc}
				<Empty>
					<EmptyHeader>
						<EmptyTitle>{mt.hopTuan.yenAng}</EmptyTitle>
						<EmptyDescription>{mt.hopTuan.yenAngMoTa}</EmptyDescription>
					</EmptyHeader>
				</Empty>
				<PhanConLai dong={d.conLai} />
			</div>,
		);

	return boc(
		<section
			aria-labelledby="dang-ban"
			className="flex flex-col gap-3"
			data-trang-thai="ST-hoptuan-codulieu"
		>
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<p className="font-medium text-sm" id="dang-ban">
					{mt.hopTuan.dangBan}{" "}
					<Badge variant="secondary">{d.dangBan.length}</Badge>
				</p>
				{dauMuc}
			</div>
			<p className="text-muted-foreground text-xs">{mt.hopTuan.xepTheo}</p>
			<BangBan dong={d.dangBan} />
			<PhanConLai dong={d.conLai} />
		</section>,
	);
}
