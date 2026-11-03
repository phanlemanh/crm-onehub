"use client";

import Add from "@carbon/icons-react/es/Add";
import Attachment from "@carbon/icons-react/es/Attachment";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
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
import { useLocale } from "@crm/ui/components/locale-provider";
import { formatDay } from "@crm/ui/lib/format";
import type { BangChungVao } from "@crm/validation/okr-canh-kr";
import { useState } from "react";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import { homNayVn } from "@/lib/okr-chu-ky-nhan";
import { DongDinhBangChung } from "./dong-dinh-bang-chung";
import type { CanhKr } from "./kr-viec";
import { dien } from "./plan-copy";

type BangChung = CanhKr["bangChung"][number];

export function tenMien(url: string): string {
	try {
		return new URL(url).hostname || url;
	} catch {
		return url;
	}
}

export function DongBangChung({
	b,
	goDuoc,
	onGo,
}: {
	b: BangChung;
	goDuoc: boolean;
	onGo: () => void;
}) {
	const locale = useLocale();
	const m = okrCanhKrMessages(locale).bangChung;
	const mien = tenMien(b.url);
	return (
		<Item size="sm" variant="outline" data-bang-chung={b.id} role="listitem">
			<ItemMedia variant="icon">
				<Icon icon={Attachment} />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>
					<a
						className="underline-offset-4 hover:underline"
						href={b.url}
						rel="noopener noreferrer"
						target="_blank"
						translate="no"
						data-ten-mien={mien}
					>
						{mien}
					</a>
				</ItemTitle>
				<ItemDescription>
					{b.ghiChu ? (
						<>
							<span translate="no">{b.ghiChu}</span>
							{" · "}
						</>
					) : null}
					<span translate="no">{b.nguoiDinh.name}</span>
					{" · "}
					{formatDay(homNayVn(new Date(b.dinhLuc)), locale)}
				</ItemDescription>
			</ItemContent>
			{goDuoc ? (
				<ItemActions>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								aria-label={dien(m.thaoTac, { ten: mien })}
								data-nut="thao-tac-bang-chung"
								size="icon-sm"
								variant="ghost"
							>
								<Icon icon={OverflowMenuHorizontal} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								data-muc="go-bang-chung"
								variant="destructive"
								onSelect={onGo}
							>
								{m.go}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</ItemActions>
			) : null}
		</Item>
	);
}

export function KrBangChung({
	canh,
	onDinh,
	onGo,
}: {
	canh: CanhKr;
	onDinh: (vao: BangChungVao) => Promise<void>;
	onGo: (id: string) => Promise<void>;
}) {
	const t = okrCanhKrMessages(useLocale());
	const m = t.bangChung;
	const [mo, setMo] = useState(false);
	const [hoiGo, setHoiGo] = useState<BangChung | null>(null);
	const [dangGo, setDangGo] = useState(false);
	const ghiDuoc = canh.quyen.suaDuoc && !canh.khoa && !canh.choDuyet;
	const dinhDuoc = ghiDuoc && canh.kr.xong;

	const nutDinh = ghiDuoc ? (
		<Button
			size="sm"
			variant="outline"
			data-nut="dinh-bang-chung"
			disabled={!dinhDuoc}
			onClick={() => setMo(true)}
		>
			<Icon icon={Add} data-icon="inline-start" />
			{m.dinh}
		</Button>
	) : undefined;

	const go = () => {
		if (!hoiGo || dangGo) return;
		setDangGo(true);
		onGo(hoiGo.id).then(
			() => {
				setDangGo(false);
				setHoiGo(null);
			},
			() => setDangGo(false),
		);
	};

	const dongNhap = mo ? (
		<DongDinhBangChung onDinh={onDinh} dong={() => setMo(false)} />
	) : null;

	return (
		<div
			className="contents"
			data-trang-thai={
				canh.bangChung.length === 0 ? "ST-bangchung-rong" : "ST-bangchung-co"
			}
		>
			<DetailSheetBody>
				{canh.bangChung.length === 0 && !mo ? (
					<DetailSheetEmpty
						icon={Attachment}
						title={m.rong.tieuDe}
						description={canh.kr.xong ? m.rong.moTa : m.rong.moTaChuaXong}
						action={nutDinh}
					/>
				) : (
					<DetailSheetSection>
						<div className="flex flex-col gap-3">
							<ItemGroup>
								{canh.bangChung.map((b) => (
									<DongBangChung
										key={b.id}
										b={b}
										goDuoc={ghiDuoc}
										onGo={() => setHoiGo(b)}
									/>
								))}
								{dongNhap}
							</ItemGroup>
							{nutDinh && !mo ? <div>{nutDinh}</div> : null}
						</div>
					</DetailSheetSection>
				)}
			</DetailSheetBody>
			<ConfirmDialog
				tone="destructive"
				tieuDe={dien(t.hoiGo.bangChung.tieuDe, {
					ten: hoiGo ? tenMien(hoiGo.url) : "",
				})}
				than={t.hoiGo.bangChung.than}
				nut={t.hoiGo.nut}
				thoi={t.hoiGo.thoi}
				open={hoiGo !== null}
				pending={dangGo}
				onOpenChange={(moHoi) => {
					if (!moHoi && !dangGo) setHoiGo(null);
				}}
				onConfirm={go}
			/>
		</div>
	);
}
