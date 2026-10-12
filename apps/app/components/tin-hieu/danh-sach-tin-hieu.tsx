"use client";

import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableNote,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import type { NghiaTrangThai } from "@crm/ui/lib/status-tone";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";

export type DongTinHieu = {
	id: string;
	ma: string;
	tieuDe: string;
	man: string;
	guiLuc: string;
	coTheXoa: boolean;
	trangThai: { nhan: string; cau: string; nghia: NghiaTrangThai };
};

export type DanhSachTinHieuProps = {
	dong: DongTinHieu[];
	banVeDocDuoc: boolean;
	nutGui: React.ReactNode;
	dangXoa: string | null;
	onXoa: (id: string) => void;
	hoiXoaBanDau?: string;
};

const GIO = new Intl.DateTimeFormat("vi-VN", {
	timeZone: "Asia/Ho_Chi_Minh",
	day: "2-digit",
	month: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
});

function TrangThai({ dong }: { dong: DongTinHieu }) {
	return (
		<div className="flex min-w-0 flex-col gap-0.5">
			<StatusIndicator
				data-nghia={dong.trangThai.nghia}
				label={dong.trangThai.nhan}
				size="sm"
				tone={toneTheoNghia(dong.trangThai.nghia)}
			/>
			<SimpleTableNote
				className="whitespace-normal break-words"
				data-cau-trang-thai=""
			>
				{dong.trangThai.cau}
			</SimpleTableNote>
		</div>
	);
}

export function DanhSachTinHieu({
	dong,
	banVeDocDuoc,
	nutGui,
	dangXoa,
	onXoa,
	hoiXoaBanDau,
}: DanhSachTinHieuProps) {
	const m = tinHieuMessages(useLocale()).trang;
	const [hoiXoa, setHoiXoa] = useState<DongTinHieu | null>(
		() => dong.find((d) => d.id === hoiXoaBanDau) ?? null,
	);

	if (dong.length === 0) {
		return (
			<Empty border="solid" data-tin-hieu-rong="">
				<EmptyHeader>
					<EmptyTitle>{m.rongTieuDe}</EmptyTitle>
					<EmptyDescription>{m.rongMoTa}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>{nutGui}</EmptyContent>
			</Empty>
		);
	}

	const nutXoa = (d: DongTinHieu) =>
		d.coTheXoa ? (
			<Button
				data-xoa-tin-hieu={d.ma}
				onClick={() => setHoiXoa(d)}
				size="sm"
				variant="ghost"
			>
				{m.xoa}
			</Button>
		) : null;

	return (
		<div className="flex flex-col gap-3">
			{banVeDocDuoc ? null : (
				<SimpleTableNote aria-live="polite" data-ban-ve-chua-doc="">
					{m.banVeChuaDoc}
				</SimpleTableNote>
			)}
			<div className="hidden md:block">
				<SimpleTable
					columns={[
						{ id: "ke", header: m.cot.dieuDaKe },
						{ id: "man", header: m.cot.man, width: "w-32" },
						{ id: "luc", header: m.cot.guiLuc, width: "w-32" },
						{ id: "trang-thai", header: m.cot.trangThai, width: "w-[36%]" },
						{ id: "xoa", srLabel: m.xoa, width: "w-20" },
					]}
					surface="page"
				>
					{dong.map((d) => (
						<SimpleTableRow data-tin-hieu={d.ma} key={d.id}>
							<SimpleTableCell className="whitespace-normal">
								<span
									className="line-clamp-2 break-words"
									title={d.tieuDe}
									translate="no"
								>
									{d.tieuDe}
								</span>
							</SimpleTableCell>
							<SimpleTableCell>
								<span className="truncate text-muted-foreground" translate="no">
									{d.man}
								</span>
							</SimpleTableCell>
							<SimpleTableCell numeric>
								{GIO.format(new Date(d.guiLuc))}
							</SimpleTableCell>
							<SimpleTableCell className="whitespace-normal">
								<TrangThai dong={d} />
							</SimpleTableCell>
							<SimpleTableCell align="right">{nutXoa(d)}</SimpleTableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<ItemGroup className="md:hidden">
				{dong.map((d) => (
					<Item data-tin-hieu={d.ma} key={d.id} variant="outline">
						<ItemContent>
							<ItemTitle className="line-clamp-2 break-words" translate="no">
								{d.tieuDe}
							</ItemTitle>
							<ItemDescription>
								<span translate="no">{d.man}</span> ·{" "}
								{GIO.format(new Date(d.guiLuc))}
							</ItemDescription>
							<TrangThai dong={d} />
						</ItemContent>
						<ItemActions>{nutXoa(d)}</ItemActions>
					</Item>
				))}
			</ItemGroup>
			<ConfirmDialog
				nut={m.xoaNut}
				onConfirm={() => {
					if (hoiXoa) onXoa(hoiXoa.id);
					setHoiXoa(null);
				}}
				onOpenChange={(mo) => {
					if (!mo) setHoiXoa(null);
				}}
				open={hoiXoa !== null}
				pending={dangXoa !== null}
				than={m.xoaThan}
				thoi={m.thoi}
				tieuDe={dien(m.xoaTieuDe, { ma: hoiXoa?.ma ?? "" })}
				tone="destructive"
			/>
		</div>
	);
}
