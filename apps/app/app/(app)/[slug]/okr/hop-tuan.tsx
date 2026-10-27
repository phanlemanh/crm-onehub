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
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatCard } from "@crm/ui/components/stat-card";
import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { type ReactNode, useEffect, useState } from "react";
import { useMoDienBien } from "@/components/crm/record-sheet/dien-bien-kr";
import { okrHopTuanBoMessages } from "@/lib/messages/okr-hop-tuan-bo";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useCapNhatKr } from "./cap-nhat-kr";
import { giaiDon } from "./don-dich";
import { DonViCoKr, XemMoiBo } from "./don-vi-co-kr";
import { ghep } from "./hoi-y/chu";
import {
	BangHop,
	type DongHop,
	type HanhDongDong,
	TenDong,
} from "./hop-tuan/dong-hop";
import { KhoiTomTat } from "./khoi-tom-tat";
import { lyDoRong } from "./ly-do-rong";
import { NutCapNhatDong } from "./nut-cap-nhat-dong";
import { type OSo, oSoHop } from "./o-so-hop";
import { type DonChonOkr, okrParsers } from "./okr-search-params";
import { useTenGoc } from "./ten-goc";
import { LoiXem } from "./toan-canh/toan-canh";
import { DangTai } from "./trang-thai-okr";

type HopTuanDuLieu = RouterOutputs["okr"]["hopTuan"];

function DongBan({ dong }: { dong: DongHop }) {
	const moDienBien = useMoDienBien();
	return (
		<TenDong
			dong={dong}
			moKr={() => moDienBien(dong.objectiveId, dong.keyResultId)}
		/>
	);
}

function useBangHop(): {
	hanhDong: HanhDongDong;
	hop: ReactNode;
	vuaGui: string | null;
	xongGui: () => void;
} {
	const [vuaGui, setVuaGui] = useState<string | null>(null);
	const capNhat = useCapNhatKr({ onDaGui: setVuaGui });
	return {
		hanhDong: {
			tenKr: (d) => <DongBan dong={d} />,
			nutCapNhat: (d) => (
				<NutCapNhatDong
					keyResultId={d.keyResultId}
					mo={capNhat.mo}
					objectiveId={d.objectiveId}
					ten={d.tieuDe}
				/>
			),
		},
		hop: capNhat.hop,
		vuaGui,
		xongGui: () => setVuaGui(null),
	};
}

function PhanConLai({
	dong,
	hanhDong,
	mo,
	onDoi,
}: {
	dong: DongHop[];
	hanhDong: HanhDongDong;
	mo: boolean;
	onDoi: (mo: boolean) => void;
}) {
	const mt = okrToanCanhMessages(useLocale());
	if (dong.length === 0) return null;
	return (
		<Collapsible
			data-con-lai={mo ? "mo" : "dong"}
			onOpenChange={onDoi}
			open={mo}
		>
			<CollapsibleTrigger asChild>
				<Button className="self-start" size="sm" variant="ghost">
					<Icon icon={ChevronDown} data-icon="inline-start" />
					{mt.hopTuan.conLai(String(dong.length))}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="pt-3">
				<BangHop dong={dong} hanhDong={hanhDong} />
			</CollapsibleContent>
		</Collapsible>
	);
}

function BangCoDuLieu({
	d,
	bang,
	dau,
}: {
	d: HopTuanDuLieu;
	bang: ReturnType<typeof useBangHop>;
	dau: ReactNode;
}) {
	const [moConLai, setMoConLai] = useState(false);
	const { vuaGui, xongGui } = bang;
	const trongConLai =
		vuaGui !== null && d.conLai.some((x) => x.keyResultId === vuaGui);
	const coDong =
		vuaGui !== null &&
		(trongConLai || d.dangBan.some((x) => x.keyResultId === vuaGui));
	const canMo = trongConLai && !moConLai;
	useEffect(() => {
		if (canMo) {
			setMoConLai(true);
			return;
		}
		if (!coDong || vuaGui === null) return;
		const nut = document.querySelector<HTMLElement>(
			`[data-kr-hop="${vuaGui}"] [data-nut="cap-nhat-dong-kr"]`,
		);
		nut?.focus();
		xongGui();
	}, [canMo, coDong, vuaGui, xongGui]);
	return (
		<>
			{dau}
			<PhanConLai
				dong={d.conLai}
				hanhDong={bang.hanhDong}
				mo={moConLai}
				onDoi={setMoConLai}
			/>
		</>
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
	const bang = useBangHop();
	useMountEffect(() => {
		mo.mutate({ cycleId, unit });
	});
	const khoi =
		unit.loai === "pb" ? (
			<KhoiTomTat cycleId={cycleId} departmentId={unit.id} />
		) : null;
	const boc = (than: ReactNode, dau?: ReactNode) => (
		<>
			{khoi || dau ? (
				<div className="flex flex-col gap-6">
					{dau}
					{khoi}
					{than}
				</div>
			) : (
				than
			)}
			{bang.hop}
		</>
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
				<BangCoDuLieu bang={bang} d={d} dau={null} />
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
			<BangCoDuLieu
				bang={bang}
				d={d}
				dau={<BangHop dong={d.dangBan} hanhDong={bang.hanhDong} />}
			/>
		</section>,
		hangSo,
	);
}
