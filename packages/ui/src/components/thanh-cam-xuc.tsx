"use client";

import FaceAdd from "@carbon/icons-react/es/FaceAdd";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useMessages } from "@crm/ui/components/locale-provider";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import { Toggle } from "@crm/ui/components/toggle";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import type { Messages } from "@crm/ui/lib/messages";
import { useState } from "react";

export type MucCamXuc = {
	loai: string;
	emoji: string;
	ten: string;
	so: number;
	cuaToi: boolean;
	nguoi: string[];
};

export type LoaiTrongBo = { loai: string; emoji: string; ten: string };

export type ThanhCamXucProps = {
	bo: LoaiTrongBo[];
	muc: MucCamXuc[];
	tenToiDa: number;
	dangGui?: boolean;
	onDao: (loai: string) => void;
};

type ChuCamXuc = Messages["camXuc"];

function tenRutGon(m: MucCamXuc, tenToiDa: number, chu: ChuCamXuc): string {
	const hien = m.nguoi.slice(0, tenToiDa);
	const con = m.so - hien.length;
	const ds = hien.join(", ");
	return con > 0 ? `${ds} ${chu.vaNguoiKhac(String(con))}` : ds;
}

function nhanChip(m: MucCamXuc, chu: ChuCamXuc): string {
	const phan = [m.ten, chu.soNguoi(String(m.so))];
	return (m.cuaToi ? [...phan, chu.banDaTha] : phan).join(", ");
}

function ChipCamXuc({
	m,
	tenToiDa,
	dangGui,
	onDao,
	chu,
}: {
	m: MucCamXuc;
	tenToiDa: number;
	dangGui: boolean;
	onDao: (loai: string) => void;
	chu: ChuCamXuc;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Toggle
					aria-label={nhanChip(m, chu)}
					data-cam-xuc={m.loai}
					disabled={dangGui}
					onPressedChange={() => onDao(m.loai)}
					pressed={m.cuaToi}
					size="sm"
					variant="outline"
				>
					<span aria-hidden>{m.emoji}</span>
					<span className="tabular-nums">{m.so}</span>
				</Toggle>
			</TooltipTrigger>
			<TooltipContent>
				<span className="whitespace-nowrap font-medium">{m.ten}</span>
				<span aria-hidden>·</span>
				<span data-ten-nguoi translate="no">
					{tenRutGon(m, tenToiDa, chu)}
				</span>
			</TooltipContent>
		</Tooltip>
	);
}

function BangCamXuc({
	bo,
	co,
	dangGui,
	onChon,
	chu,
}: {
	bo: LoaiTrongBo[];
	co: MucCamXuc[];
	dangGui: boolean;
	onChon: (loai: string) => void;
	chu: ChuCamXuc;
}) {
	const daTha = co.filter((m) => m.cuaToi).map((m) => m.loai);
	return (
		<PopoverContent align="start" data-bang-cam-xuc>
			<ToggleGroup aria-label={chu.thaCamXuc} type="multiple" value={daTha}>
				{bo.map((b) => (
					<ToggleGroupItem
						aria-label={b.ten}
						data-chon-cam-xuc={b.loai}
						disabled={dangGui}
						key={b.loai}
						onClick={() => onChon(b.loai)}
						size="sm"
						title={b.ten}
						value={b.loai}
					>
						<span aria-hidden>{b.emoji}</span>
					</ToggleGroupItem>
				))}
			</ToggleGroup>
			{co.length > 0 ? (
				<dl className="flex flex-col gap-1 border-t pt-2">
					{co.map((m) => (
						<div className="flex gap-2" data-ten-loai={m.loai} key={m.loai}>
							<dt className="shrink-0">
								<span aria-hidden>{m.emoji}</span>
								<span className="sr-only">{m.ten}</span>
							</dt>
							<dd className="text-muted-foreground" translate="no">
								{m.nguoi.join(", ")}
							</dd>
						</div>
					))}
				</dl>
			) : null}
		</PopoverContent>
	);
}

export function ThanhCamXuc({
	bo,
	muc,
	tenToiDa,
	dangGui = false,
	onDao,
}: ThanhCamXucProps) {
	const chu = useMessages().camXuc;
	const [moBang, setMoBang] = useState(false);
	const co = bo.flatMap((b) => {
		const m = muc.find((x) => x.loai === b.loai && x.so > 0);
		return m ? [m] : [];
	});
	const chon = (loai: string) => {
		onDao(loai);
		setMoBang(false);
	};
	return (
		<TooltipProvider>
			<div className="flex flex-wrap items-center gap-1" data-thanh-cam-xuc>
				{co.map((m) => (
					<ChipCamXuc
						chu={chu}
						dangGui={dangGui}
						key={m.loai}
						m={m}
						onDao={onDao}
						tenToiDa={tenToiDa}
					/>
				))}
				<Popover onOpenChange={setMoBang} open={moBang}>
					<PopoverTrigger asChild>
						<Button
							aria-label={chu.thaCamXuc}
							data-mo-cam-xuc
							size="icon-sm"
							variant="ghost"
						>
							<Icon icon={FaceAdd} />
						</Button>
					</PopoverTrigger>
					<BangCamXuc
						bo={bo}
						chu={chu}
						co={co}
						dangGui={dangGui}
						onChon={chon}
					/>
				</Popover>
			</div>
		</TooltipProvider>
	);
}
