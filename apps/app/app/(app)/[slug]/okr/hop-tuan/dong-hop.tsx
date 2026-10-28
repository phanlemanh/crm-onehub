"use client";

import {
	Item,
	ItemContent,
	ItemFooter,
	ItemGroup,
} from "@crm/ui/components/item";
import { useLocale, useMessages } from "@crm/ui/components/locale-provider";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { useKhoMan } from "@crm/ui/hooks/use-kho-man";
import type { ReactNode } from "react";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import type { RouterOutputs } from "@/lib/trpc/types";
import { ThanhTienDo } from "../tien-do-kr";
import { type KhoDong, ngayThang, OMucDoi } from "./muc-doi";

export type DongHop = RouterOutputs["okr"]["hopTuan"]["dangBan"][number];

type LyDo = DongHop["lyDo"][number];

export type HanhDongDong = {
	tenKr: (dong: DongHop) => ReactNode;
	nutCapNhat: (dong: DongHop) => ReactNode;
};

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

function GhiChuDong({ dong, kho }: { dong: DongHop; kho: KhoDong }) {
	const m = okrToanCanhMessages(useLocale()).hopTuan;
	if (!dong.ghiChu)
		return (
			<span
				className="text-muted-foreground text-sm"
				data-ghi-chu="trong"
				data-kho={kho}
			>
				{m.chuaCoGhiChu}
			</span>
		);
	return (
		<span className="flex flex-col gap-0.5" data-ghi-chu="co" data-kho={kho}>
			<span className="wrap-anywhere text-sm" translate="no">
				«{dong.ghiChu}»
			</span>
			{dong.ghiChuNgay ? (
				<span className="text-muted-foreground text-xs">
					{ngayThang(dong.ghiChuNgay)}
				</span>
			) : null}
		</span>
	);
}

function GhiChuVaDoi({ dong, kho }: { dong: DongHop; kho: KhoDong }) {
	const m = okrToanCanhMessages(useLocale()).hopTuan;
	return (
		<span className="flex flex-col gap-3">
			<span className="flex flex-col gap-1">
				<span className="text-muted-foreground text-xs">{m.cotGhiChu}</span>
				<GhiChuDong dong={dong} kho={kho} />
			</span>
			<span className="flex flex-col gap-1">
				<span className="text-muted-foreground text-xs">{m.cotMucDoi}</span>
				<OMucDoi dong={dong} kho={kho} />
			</span>
		</span>
	);
}

export function TenDong({ dong, moKr }: { dong: DongHop; moKr: () => void }) {
	const mt = okrToanCanhMessages(useLocale());
	return (
		<div className="flex flex-col gap-1.5">
			<button
				className="text-start text-sm underline-offset-2 hover:underline focus-visible:underline"
				data-mo-kr={dong.keyResultId}
				onClick={moKr}
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
		</div>
	);
}

function BangRong({
	dong,
	hanhDong,
}: {
	dong: DongHop[];
	hanhDong: HanhDongDong;
}) {
	const m = okrToanCanhMessages(useLocale()).hopTuan;
	const cot: SimpleTableColumn[] = [
		{ id: "kr", header: m.cotKr },
		{
			id: "tien-do",
			header: m.cotTienDo,
			width: "w-[26%]",
			className: "hidden md:table-cell",
		},
		{
			id: "ghi-chu",
			header: m.cotGhiChu,
			width: "w-[26%]",
			className: "hidden lg:table-cell",
		},
		{
			id: "muc-doi",
			header: m.cotMucDoi,
			width: "w-[16%]",
			className: "hidden lg:table-cell",
		},
		{ id: "cap-nhat", srLabel: m.cotCapNhat, align: "right" },
	];
	return (
		<SimpleTable columns={cot} surface="page">
			{dong.map((d) => (
				<SimpleTableRow data-kr-hop={d.keyResultId} key={d.keyResultId}>
					<SimpleTableCell className="align-top whitespace-normal">
						<div className="flex flex-col gap-3">
							{hanhDong.tenKr(d)}
							<span className="md:hidden">
								<TienDoDong dong={d} />
							</span>
							<div className="hidden md:block lg:hidden">
								<GhiChuVaDoi dong={d} kho="md-lg" />
							</div>
						</div>
					</SimpleTableCell>
					<SimpleTableCell className="hidden align-top md:table-cell">
						<TienDoDong dong={d} />
					</SimpleTableCell>
					<SimpleTableCell className="hidden align-top whitespace-normal lg:table-cell">
						<GhiChuDong dong={d} kho="tu-lg" />
					</SimpleTableCell>
					<SimpleTableCell className="hidden align-top whitespace-normal lg:table-cell">
						<OMucDoi dong={d} kho="tu-lg" />
					</SimpleTableCell>
					<SimpleTableCell align="right" className="align-top">
						{hanhDong.nutCapNhat(d)}
					</SimpleTableCell>
				</SimpleTableRow>
			))}
		</SimpleTable>
	);
}

function DanhSachHep({
	dong,
	hanhDong,
}: {
	dong: DongHop[];
	hanhDong: HanhDongDong;
}) {
	return (
		<ItemGroup className="gap-2">
			{dong.map((d) => (
				<Item data-kr-hop={d.keyResultId} key={d.keyResultId} variant="outline">
					<ItemContent>
						<div className="flex flex-col gap-3">
							{hanhDong.tenKr(d)}
							<TienDoDong dong={d} />
							<div className="md:hidden">
								<GhiChuVaDoi dong={d} kho="duoi-md" />
							</div>
						</div>
					</ItemContent>
					<ItemFooter>{hanhDong.nutCapNhat(d)}</ItemFooter>
				</Item>
			))}
		</ItemGroup>
	);
}

export function BangHop({
	dong,
	hanhDong,
}: {
	dong: DongHop[];
	hanhDong: HanhDongDong;
}) {
	return useKhoMan() === "dien-thoai" ? (
		<DanhSachHep dong={dong} hanhDong={hanhDong} />
	) : (
		<BangRong dong={dong} hanhDong={hanhDong} />
	);
}
