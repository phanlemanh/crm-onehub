"use client";

import FaceAdd from "@carbon/icons-react/es/FaceAdd";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemFooter,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import { Progress } from "@crm/ui/components/progress";
import { Toggle } from "@crm/ui/components/toggle";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import { useState } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { TOI } from "../cap-nhat-gan-day/du-lieu";
import {
	BO_CAM_XUC,
	type CamXucMau,
	DONG,
	DONG_HOP,
	type DongCoCamXuc,
	type LoaiCamXuc,
	TEN_TOI_DA,
	TUAN_NGAN,
} from "./du-lieu";

type TenState =
	| "ST-camxuc-cng"
	| "ST-camxuc-nhieu"
	| "ST-camxuc-hop"
	| "ST-camxuc-ngan";

function tenNguoi(ds: string[]): string {
	const ten = ds.slice(0, TEN_TOI_DA).map((n) => (n === TOI.ten ? "Bạn" : n));
	const con = ds.length - ten.length;
	return con > 0 ? `${ten.join(", ")} và ${con} người khác` : ten.join(", ");
}

function ThanhCamXuc({
	dau,
	moTen = false,
}: {
	dau: CamXucMau;
	moTen?: boolean;
}) {
	const [cx, setCx] = useState(dau);
	const [moBang, setMoBang] = useState(false);
	const dao = (loai: LoaiCamXuc) =>
		setCx((c) => ({
			...c,
			[loai]: c[loai].includes(TOI.ten)
				? c[loai].filter((n) => n !== TOI.ten)
				: [...c[loai], TOI.ten],
		}));
	const co = BO_CAM_XUC.filter((b) => cx[b.loai].length > 0);
	return (
		<TooltipProvider>
			<div
				className="flex flex-wrap items-center gap-1 pt-2"
				data-thanh-cam-xuc
			>
				{co.map((b, i) => {
					const cuaToi = cx[b.loai].includes(TOI.ten);
					return (
						<Tooltip defaultOpen={moTen && i === 0} key={b.loai}>
							<TooltipTrigger asChild>
								<Toggle
									aria-label={`${b.emoji} ${b.ten}, ${cx[b.loai].length} người${cuaToi ? ", bạn đã thả" : ""}`}
									data-cam-xuc={b.loai}
									onPressedChange={() => dao(b.loai)}
									pressed={cuaToi}
									size="sm"
									variant="outline"
								>
									<span aria-hidden>{b.emoji}</span>
									<span className="tabular-nums">{cx[b.loai].length}</span>
								</Toggle>
							</TooltipTrigger>
							<TooltipContent>
								<span className="whitespace-nowrap font-medium">{b.ten}</span> ·{" "}
								<span translate="no">{tenNguoi(cx[b.loai])}</span>
							</TooltipContent>
						</Tooltip>
					);
				})}
				{
					<Popover onOpenChange={setMoBang} open={moBang}>
						<PopoverTrigger asChild>
							<Button
								aria-label="Thả cảm xúc"
								data-mo-cam-xuc
								size="icon-sm"
								variant="ghost"
							>
								<Icon icon={FaceAdd} />
							</Button>
						</PopoverTrigger>
						<PopoverContent align="start" className="w-64 p-2">
							<div className="flex gap-1" data-bang-cam-xuc>
								{BO_CAM_XUC.map((b) => (
									<Button
										aria-label={b.ten}
										aria-pressed={cx[b.loai].includes(TOI.ten)}
										key={b.loai}
										onClick={() => {
											dao(b.loai);
											setMoBang(false);
										}}
										size="icon-sm"
										title={b.ten}
										variant="ghost"
									>
										<span aria-hidden>{b.emoji}</span>
									</Button>
								))}
							</div>
							{co.length > 0 ? (
								<dl className="flex flex-col gap-1 border-t pt-2 text-xs">
									{co.map((b) => (
										<div className="flex gap-2" key={b.loai}>
											<dt className="shrink-0">
												<span aria-hidden>{b.emoji}</span>{" "}
												<span className="sr-only">{b.ten}</span>
											</dt>
											<dd className="text-muted-foreground" translate="no">
												{cx[b.loai]
													.map((n) => (n === TOI.ten ? "Bạn" : n))
													.join(", ")}
											</dd>
										</div>
									))}
								</dl>
							) : null}
						</PopoverContent>
					</Popover>
				}
			</div>
		</TooltipProvider>
	);
}

function TraLoiDong({ dong }: { dong: DongCoCamXuc }) {
	return (
		<ItemFooter className="basis-full flex-col items-stretch gap-2">
			{dong.traLoi.map((t) => (
				<div className="flex gap-2" data-tra-loi={t.id} key={t.id}>
					<PersonAvatar name={t.nguoi} size="sm" />
					<div className="flex min-w-0 flex-col gap-0.5">
						<span className="text-muted-foreground text-xs">
							<span className="font-medium text-foreground" translate="no">
								{t.nguoi}
							</span>{" "}
							· {t.luc}
						</span>
						<p className="text-sm" translate="no">
							{t.than}
						</p>
					</div>
				</div>
			))}
			<div>
				<Button data-mo-tra-loi size="sm" variant="ghost">
					Trả lời
				</Button>
			</div>
		</ItemFooter>
	);
}

function DongTinCx({ dong, moTen }: { dong: DongCoCamXuc; moTen: boolean }) {
	return (
		<Item data-dong-tin={dong.id} variant="outline">
			<ItemMedia>
				<PersonAvatar name={dong.nguoi} />
			</ItemMedia>
			<ItemContent className="min-w-0">
				<ItemDescription>
					<span className="font-medium text-foreground" translate="no">
						{dong.nguoi}
					</span>
					{dong.thayCho ? (
						<>
							{" "}
							thay cho <span translate="no">{dong.thayCho}</span>
						</>
					) : null}{" "}
					· {dong.luc}
				</ItemDescription>
				<ItemTitle>
					<span translate="no">{dong.kr}</span>
				</ItemTitle>
				<ItemDescription translate="no">
					{dong.mucTieu} · {dong.bo.ten}
				</ItemDescription>
				<div className="flex flex-wrap items-center gap-3 pt-1">
					<span className="font-medium text-sm tabular-nums">
						{dong.giaTri}
					</span>
					<ConfidenceIndicator level={dong.tuTin} size="sm" />
				</div>
				{dong.ghiChu ? (
					<p className="pt-1 text-sm" translate="no">
						{dong.ghiChu}
					</p>
				) : null}
				<ThanhCamXuc dau={dong.camXuc} moTen={moTen} />
			</ItemContent>
			<TraLoiDong dong={dong} />
		</Item>
	);
}

function CapNhatGanDay({ moTen }: { moTen: boolean }) {
	return (
		<PageShell width="page">
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Cập nhật gần đây</PageShellTitle>
					<PageShellDescription>
						Mọi lần cập nhật KR của chu kỳ, mới nhất trước — thả cảm xúc hay trả
						lời ngay dưới từng lần.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<ItemGroup className="gap-3">
					{DONG.slice(0, 20).map((d, i) => (
						<DongTinCx dong={d} key={d.id} moTen={moTen && i === 0} />
					))}
				</ItemGroup>
			</PageShellContent>
		</PageShell>
	);
}

function HopTuan() {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Phòng Chăm sóc khách hàng · Họp tuần</PageShellTitle>
					<PageShellDescription>
						KR đáng bàn tuần này, kèm cảm xúc trên lần cập nhật mới nhất.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<ItemGroup className="gap-2">
					{DONG_HOP.map((h) => (
						<Item data-hop-kr={h.krId} key={h.krId} variant="outline">
							<ItemContent className="min-w-0">
								<ItemTitle>
									<span translate="no">{h.kr}</span>
								</ItemTitle>
								<ItemDescription translate="no">
									{h.mucTieu} · {h.chu}
								</ItemDescription>
								<div className="flex items-center gap-3 pt-1">
									<Progress className="w-32" value={h.tienDo} />
									<span className="text-sm tabular-nums">{h.tienDo}%</span>
									{h.lan ? (
										<ConfidenceIndicator level={h.lan.tuTin} size="sm" />
									) : (
										<span className="text-muted-foreground text-xs">
											Chưa cập nhật trong chu kỳ
										</span>
									)}
								</div>
								{h.lan?.ghiChu ? (
									<p className="pt-1 text-sm" translate="no">
										{h.lan.ghiChu}
									</p>
								) : null}
								{h.lan ? <ThanhCamXuc dau={h.lan.camXuc} /> : null}
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</PageShellContent>
		</PageShell>
	);
}

function NganKr() {
	const kr = TUAN_NGAN[0];
	return (
		<div className="mx-auto w-full max-w-xl p-4">
			<Card>
				<CardHeader>
					<CardTitle translate="no">{kr?.kr}</CardTitle>
					<CardDescription>Lịch sử cập nhật</CardDescription>
				</CardHeader>
				<CardContent>
					<ItemGroup className="gap-2">
						{TUAN_NGAN.map((t) => (
							<Item data-tuan={t.id} key={t.id} variant="outline">
								<ItemContent className="min-w-0">
									<ItemDescription>
										{t.tuanNhan} · <span translate="no">{t.nguoi}</span>
									</ItemDescription>
									<div className="flex items-center gap-3">
										<span className="font-medium text-sm tabular-nums">
											{t.giaTri}
										</span>
										<ConfidenceIndicator level={t.tuTin} size="sm" />
									</div>
									{t.ghiChu ? (
										<p className="text-sm" translate="no">
											{t.ghiChu}
										</p>
									) : null}
									<ThanhCamXuc dau={t.camXuc} />
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				</CardContent>
			</Card>
		</div>
	);
}

export function CamXucTrenCapNhatMau({ state }: { state: string }) {
	const s = state as TenState;
	return (
		<LocaleProvider locale="vi">
			<div data-proto-state={s}>
				{s === "ST-camxuc-hop" ? (
					<HopTuan />
				) : s === "ST-camxuc-ngan" ? (
					<NganKr />
				) : (
					<CapNhatGanDay moTen={s === "ST-camxuc-nhieu"} />
				)}
			</div>
		</LocaleProvider>
	);
}
