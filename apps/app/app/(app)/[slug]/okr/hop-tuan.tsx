"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { StatGroup } from "@crm/ui/components/dashboard";
import {
	Empty,
	EmptyContent,
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
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatCard } from "@crm/ui/components/stat-card";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import { useMoDienBien } from "@/components/crm/record-sheet/dien-bien-kr";
import { okrHopTuanBoMessages } from "@/lib/messages/okr-hop-tuan-bo";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { giaiDon } from "./don-dich";
import { DonViCoKr, XemMoiBo } from "./don-vi-co-kr";
import { ghep } from "./hoi-y/chu";
import { KhoiTomTat } from "./khoi-tom-tat";
import { lyDoRong } from "./ly-do-rong";
import { type OSo, oSoHop } from "./o-so-hop";
import { type DonChonOkr, okrParsers } from "./okr-search-params";
import { useTenGoc } from "./ten-goc";
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

const O_KHUNG = ["da-cap-nhat", "dang-ban", "tu-tin-thap", "ngay-con"] as const;

const KY_CHUA_RO = { phase: "dang-chay", startsOn: "" } as const;

type ChuHopTuanBo = ReturnType<typeof okrHopTuanBoMessages>;

function ngayThang(ngay: string): string {
	return `${ngay.slice(8, 10)}/${ngay.slice(5, 7)}`;
}

function moTaO(moTa: OSo["moTa"], m: ChuHopTuanBo): string {
	const ngay = moTa.ngay ?? "";
	switch (moTa.loai) {
		case "tuan":
			return m.moTa.tuan(ngay);
		case "can-ban":
			return m.moTa.canBan;
		case "moi-nhat":
			return m.moTa.moiNhat;
		case "ket-thuc":
			return m.moTa.ketThuc(ngay);
		case "bat-dau":
			return m.moTa.batDau(ngay);
		case "da-ket-thuc":
			return m.moTa.daKetThuc(ngay);
	}
}

function HangSoHop({ o }: { o: OSo[] }) {
	const m = okrHopTuanBoMessages(useLocale());
	const nhan = {
		"da-cap-nhat": m.hangSo.daCapNhat,
		"dang-ban": m.hangSo.dangBan,
		"tu-tin-thap": m.hangSo.tuTinThap,
		"ngay-con": m.hangSo.ngayCon,
	} satisfies Record<OSo["khoa"], string>;
	return (
		<StatGroup data-hang-so-hop="">
			{o.map((x) => (
				<StatCard
					data-o-so={x.khoa}
					description={moTaO(x.moTa, m)}
					key={x.khoa}
					label={nhan[x.khoa]}
					value={x.giaTri}
				/>
			))}
		</StatGroup>
	);
}

function HangSoCho() {
	return (
		<StatGroup aria-busy="true" data-hang-so-hop="">
			{O_KHUNG.map((k) => (
				<StatCard key={k} value={<Skeleton className="h-8 w-16" />} />
			))}
		</StatGroup>
	);
}

function TenKhongDich({ children }: { children: string }) {
	return <span translate="no">{children}</span>;
}

function ManLyDo({
	trangThai,
	tieuDe,
	trong,
	duoi,
}: {
	trangThai: string;
	tieuDe: ReactNode;
	trong?: ReactNode;
	duoi?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-4" data-trang-thai={trangThai}>
			<Empty border="solid">
				<EmptyHeader>
					<EmptyTitle data-cau-ly-do="">{tieuDe}</EmptyTitle>
				</EmptyHeader>
				{trong ? <EmptyContent>{trong}</EmptyContent> : null}
			</Empty>
			{duoi}
		</div>
	);
}

function useTenBo(unit: DonChonOkr): string | null {
	const trpc = useTRPC();
	const cay = useQuery(trpc.org.tree.queryOptions());
	const tenGoc = useTenGoc();
	if (unit.loai === "goc") return tenGoc;
	return cay.data ? (giaiDon(unit, cay.data, tenGoc)?.ten ?? null) : null;
}

function ChuaKrCongBo({
	cycleId,
	unit,
	tenKy,
	ky,
}: {
	cycleId: string;
	unit: DonChonOkr;
	tenKy: string;
	ky: string | null;
}) {
	const m = okrHopTuanBoMessages(useLocale());
	const tenBo = useTenBo(unit) ?? "";
	const laGoc = unit.loai === "goc";
	return (
		<ManLyDo
			duoi={laGoc ? <DonViCoKr cycleId={cycleId} ky={ky} /> : null}
			tieuDe={ghep(m.rong.chuaKr("{bo}", "{chuKy}"), {
				bo: <TenKhongDich>{tenBo}</TenKhongDich>,
				chuKy: <TenKhongDich>{tenKy}</TenKhongDich>,
			})}
			trangThai="ST-hoptuan-chua-kr"
			trong={laGoc ? null : <XemMoiBo ky={ky} />}
		/>
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
	const m = okrHopTuanBoMessages(useLocale());
	const trpc = useTRPC();
	const ht = useQuery(trpc.okr.hopTuan.queryOptions({ cycleId, unit }));
	const cycles = useQuery(trpc.okr.cycles.queryOptions());
	const [url] = useQueryStates(okrParsers);
	const ky = url[SEARCH_PARAM.okr.ky];
	const mo = useMutation(trpc.okr.moHopTuan.mutationOptions());
	useMountEffect(() => {
		mo.mutate({ cycleId, unit });
	});
	const khoi =
		unit.loai === "pb" ? (
			<KhoiTomTat cycleId={cycleId} departmentId={unit.id} />
		) : null;
	const boc = (than: ReactNode, dau?: ReactNode) =>
		khoi || dau ? (
			<div className="flex flex-col gap-6">
				{dau}
				{khoi}
				{than}
			</div>
		) : (
			than
		);

	if (ht.isPending || cycles.isPending) return boc(<DangTai />, <HangSoCho />);
	if (ht.isError)
		return boc(
			<LoiXem
				cau={mt.hopTuan.loi}
				thuLai={() => void ht.refetch()}
				trangThai="ST-hoptuan-loi"
			/>,
		);
	const d = ht.data;
	const chuKy = cycles.data?.cycles.find((c) => c.id === cycleId) ?? null;
	const homNay = new Date();
	const ly = lyDoRong({ hop: d, chuKy: chuKy ?? KY_CHUA_RO, homNay });

	if (ly === "chu-ky-chua-chay" && chuKy)
		return boc(
			<ManLyDo
				tieuDe={ghep(m.rong.chuKyChuaChay("{ten}", "{ngay}"), {
					ten: <TenKhongDich>{chuKy.name}</TenKhongDich>,
					ngay: ngayThang(chuKy.startsOn),
				})}
				trangThai="ST-hoptuan-chuky-chua-chay"
			/>,
		);

	if (ly === "chua-kr-cong-bo")
		return boc(
			<ChuaKrCongBo
				cycleId={cycleId}
				ky={ky}
				tenKy={chuKy?.name ?? ""}
				unit={unit}
			/>,
		);

	const hangSo = chuKy ? <HangSoHop o={oSoHop(d, chuKy, homNay)} /> : null;

	if (ly === "chua-ai-cap-nhat")
		return boc(
			<div className="flex flex-col gap-3" data-trang-thai="ST-hoptuan-tuandau">
				<Empty border="solid">
					<EmptyHeader>
						<EmptyTitle>{mt.hopTuan.tuanDau}</EmptyTitle>
						<EmptyDescription>{mt.hopTuan.tuanDauMoTa}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</div>,
			hangSo,
		);

	if (d.dangBan.length === 0)
		return boc(
			<div className="flex flex-col gap-3" data-trang-thai="ST-hoptuan-yenang">
				<Empty>
					<EmptyHeader>
						<EmptyTitle>{mt.hopTuan.yenAng}</EmptyTitle>
						<EmptyDescription>{mt.hopTuan.yenAngMoTa}</EmptyDescription>
					</EmptyHeader>
				</Empty>
				<PhanConLai dong={d.conLai} />
			</div>,
			hangSo,
		);

	return boc(
		<section
			aria-labelledby="dang-ban"
			className="flex flex-col gap-3"
			data-trang-thai="ST-hoptuan-codulieu"
		>
			<p className="font-medium text-sm" id="dang-ban">
				{mt.hopTuan.dangBan}{" "}
				<Badge variant="secondary">{d.dangBan.length}</Badge>
			</p>
			<p className="text-muted-foreground text-xs">{mt.hopTuan.xepTheo}</p>
			<BangBan dong={d.dangBan} />
			<PhanConLai dong={d.conLai} />
		</section>,
		hangSo,
	);
}
