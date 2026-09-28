"use client";

import Renew from "@carbon/icons-react/es/Renew";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemHeader,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { formatPercent } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { MA_LOAI_DE_XUAT, TRO_LY_OKR_TRAN } from "@crm/validation/okr-tro-ly";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { troLyOkrMessages } from "@/lib/messages/tro-ly-okr";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import {
	parseLuotGopY,
	THAM_SO_LUOT_GOP_Y,
} from "./okr-settings-search-params";

type SoDo = RouterOutputs["okr"]["troLySoDo"];
type SoNac = SoDo["bat"];
type Luot = RouterOutputs["okr"]["troLyAn"]["luot"][number];
type DongLuot = Luot["dong"][number];

const CELL = "px-3 py-2.5 align-middle";
const GIAY_MS = 1_000;
const CHU_SO_TIEN_LE = 3;
const HANG_CHO = ["mot", "hai", "ba", "bon", "nam", "sau"];

function giay(ms: number | null, locale: Locale): ReactNode {
	if (ms === null) return <EmptyCellValue />;
	return new Intl.NumberFormat(locale, {
		style: "unit",
		unit: "second",
		maximumFractionDigits: 1,
	}).format(ms / GIAY_MS);
}

function tienLe(usd: number | null, locale: Locale): ReactNode {
	if (usd === null) return <EmptyCellValue />;
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: CHU_SO_TIEN_LE,
	}).format(usd);
}

function phanTram(tyLe: number | null, locale: Locale): ReactNode {
	return tyLe === null ? <EmptyCellValue /> : formatPercent(tyLe, locale);
}

type HangSo = {
	id: string;
	nhan: ReactNode;
	phu?: boolean;
	bat: ReactNode;
	an: ReactNode;
};

function soTheoMa(n: SoNac, ma: string): number {
	return n.theoMa.find((x) => x.maLoai === ma)?.so ?? 0;
}

function BangSo({ soDo }: { soDo: SoDo }) {
	const locale = useLocale();
	const m = troLyOkrMessages(locale).soDo;
	const { bat, an } = soDo;
	const hang = m.hang;
	const cot = (chon: (n: SoNac) => ReactNode) => ({
		bat: chon(bat),
		an: chon(an),
	});
	const maCo = MA_LOAI_DE_XUAT.filter(
		(ma) => soTheoMa(bat, ma) + soTheoMa(an, ma) > 0,
	);
	const dong: HangSo[] = [
		{ id: "luot", nhan: hang.luot, ...cot((n) => n.soLuot) },
		{
			id: "daHien",
			nhan: hang.daHien,
			...cot((n) => `${n.daHien} / ${n.sinhRa}`),
		},
		{
			id: "nhan",
			nhan: hang.nhan,
			...cot((n) => phanTram(n.tyLeNhan, locale)),
		},
		{ id: "sua", nhan: hang.sua, ...cot((n) => phanTram(n.tyLeSua, locale)) },
		{ id: "bac", nhan: hang.bac, ...cot((n) => phanTram(n.tyLeBac, locale)) },
		{
			id: "boQua",
			nhan: hang.boQua,
			...cot((n) => phanTram(n.tyLeBoQua, locale)),
		},
		{
			id: "hoanTac",
			nhan: hang.hoanTac(String(TRO_LY_OKR_TRAN.hoanTacNgay)),
			...cot((n) => phanTram(n.tyLeHoanTac, locale)),
		},
		{ id: "p50", nhan: hang.p50, ...cot((n) => giay(n.p50Ms, locale)) },
		{ id: "p90", nhan: hang.p90, ...cot((n) => giay(n.p90Ms, locale)) },
		{
			id: "biLoai",
			nhan: hang.biLoai,
			...cot((n) => phanTram(n.tyLeBiLoai, locale)),
		},
		...maCo.map((ma) => ({
			id: `ma-${ma}`,
			nhan: m.maLoai[ma],
			phu: true,
			...cot((n) => soTheoMa(n, ma)),
		})),
		{
			id: "chiPhiMoiNhan",
			nhan: hang.chiPhiMoiNhan,
			bat: tienLe(bat.chiPhiMoiNhanUsd, locale),
			an: <EmptyCellValue />,
		},
		{
			id: "chiPhiMoiLuot",
			nhan: hang.chiPhiMoiLuot,
			bat: <EmptyCellValue />,
			an: tienLe(an.chiPhiMoiLuotUsd, locale),
		},
	];
	return (
		<div data-bang="so-do">
			<SimpleTable
				surface="page"
				columns={[
					{ id: "so", header: m.cotSo },
					{ id: "bat", header: m.nacTen.bat, width: "w-28", align: "right" },
					{ id: "an", header: m.nacTen.an, width: "w-28", align: "right" },
				]}
			>
				{dong.map((h) => (
					<SimpleTableRow key={h.id} sub={h.phu} data-so-do={h.id}>
						<TableCell className={CELL} data-cot="nhan">
							{h.nhan}
						</TableCell>
						<TableCell
							className={`${CELL} text-right tabular-nums`}
							data-cot="bat"
						>
							{h.bat}
						</TableCell>
						<TableCell
							className={`${CELL} text-right tabular-nums`}
							data-cot="an"
						>
							{h.an}
						</TableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
		</div>
	);
}

const soDongQua = (l: Luot) =>
	l.dong.filter((d) => d.trangThai !== "bi-loai").length;
const soDongLoai = (l: Luot) =>
	l.dong.filter((d) => d.trangThai === "bi-loai").length;

function BangLuot({
	luot,
	moLuot,
}: {
	luot: Luot[];
	moLuot: (taskId: string) => void;
}) {
	const locale = useLocale();
	const m = troLyOkrMessages(locale).soDo;
	return (
		<div data-bang="luot">
			<SimpleTable
				surface="page"
				columns={[
					{ id: "muc", header: m.cotMucTieu },
					{ id: "nac", header: m.cotNac, width: "w-28" },
					{ id: "dong", header: m.cotDong, width: "w-32", align: "right" },
					{ id: "tre", header: m.cotTre, width: "w-24", align: "right" },
				]}
			>
				{luot.map((l) => (
					<SimpleTableRow
						key={l.taskId}
						clickable
						data-luot={l.taskId}
						onClick={() => moLuot(l.taskId)}
					>
						<TableCell className={CELL}>
							<Button
								variant="link"
								size="xs-wrap"
								data-nut="mo-luot"
								onClick={(event) => {
									event.stopPropagation();
									moLuot(l.taskId);
								}}
							>
								{l.tenMucTieu ? (
									<span translate="no">{l.tenMucTieu}</span>
								) : (
									<span>{m.mucTieuMat}</span>
								)}
							</Button>
						</TableCell>
						<TableCell className={CELL} data-cot="nac">
							{m.nacTen[l.nac]}
						</TableCell>
						<TableCell
							className={`${CELL} text-right tabular-nums`}
							data-cot="dong"
						>
							{soDongLoai(l) > 0
								? `${soDongQua(l)} ${m.dongBiLoai(String(soDongLoai(l)))}`
								: soDongQua(l)}
						</TableCell>
						<TableCell className={`${CELL} text-right tabular-nums`}>
							{giay(l.doTreMs, locale)}
						</TableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
		</div>
	);
}

function DongNgan({ d }: { d: DongLuot }) {
	const m = troLyOkrMessages(useLocale()).soDo;
	const loai =
		d.loai === "viet-lai" && d.truong !== null
			? m.truong[d.truong]
			: m.loai[d.loai];
	const trangThai =
		d.trangThai === "bi-loai" && d.maLoai !== null
			? m.biLoaiMa(m.maLoai[d.maLoai])
			: m.trangThai[d.trangThai];
	return (
		<Item variant="outline" data-dong={d.id}>
			<ItemHeader>
				<ItemTitle>{loai}</ItemTitle>
				<StatusIndicator
					size="sm"
					tone={d.trangThai === "bi-loai" ? "warning" : "neutral"}
					label={trangThai}
					data-trang-thai-dong
				/>
			</ItemHeader>
			<ItemContent>
				{d.truoc ? (
					<ItemDescription data-truoc translate="no">
						<del>{d.truoc}</del>
					</ItemDescription>
				) : null}
				{d.sau ? (
					<ItemDescription data-sau translate="no">
						<ins>{d.sau}</ins>
					</ItemDescription>
				) : null}
				<ItemDescription>{d.lyDo}</ItemDescription>
			</ItemContent>
		</Item>
	);
}

function NganLuot({ luot, dong }: { luot: Luot | null; dong: () => void }) {
	const locale = useLocale();
	const m = troLyOkrMessages(locale).soDo;
	return (
		<Sheet
			open={luot !== null}
			onOpenChange={(mo) => {
				if (!mo) dong();
			}}
		>
			<SheetContent side="right" size="md" data-ngan-luot={luot?.taskId ?? ""}>
				{luot ? (
					<>
						<SheetHeader>
							{luot.tenMucTieu ? (
								<SheetTitle translate="no">{luot.tenMucTieu}</SheetTitle>
							) : (
								<SheetTitle>{m.mucTieuMat}</SheetTitle>
							)}
							<SheetDescription>
								{m.nacTen[luot.nac]} · {giay(luot.doTreMs, locale)} ·{" "}
								{tienLe(luot.chiPhiUsd, locale)}
							</SheetDescription>
						</SheetHeader>
						<div className="flex-1 overflow-y-auto px-4 pb-4">
							{luot.dong.length === 0 ? (
								<Empty data-trang-thai="luot-rong">
									<EmptyHeader>
										<EmptyTitle>{m.khongDong}</EmptyTitle>
									</EmptyHeader>
								</Empty>
							) : (
								<ItemGroup>
									{luot.dong.map((d) => (
										<DongNgan key={d.id} d={d} />
									))}
								</ItemGroup>
							)}
						</div>
					</>
				) : null}
			</SheetContent>
		</Sheet>
	);
}

export function TheGopYSoDo() {
	const locale = useLocale();
	const m = troLyOkrMessages(locale).soDo;
	const trpc = useTRPC();
	const soDo = useQuery(trpc.okr.troLySoDo.queryOptions({}));
	const luotAn = useQuery(trpc.okr.troLyAn.queryOptions({ nac: "an" }));
	const luotBat = useQuery(trpc.okr.troLyAn.queryOptions({ nac: "bat" }));
	const [moId, setMoId] = useQueryState(THAM_SO_LUOT_GOP_Y, parseLuotGopY);

	const dau = (
		<CardHeader>
			<CardTitle>{m.tieuDe}</CardTitle>
			<CardDescription>{m.moTa}</CardDescription>
		</CardHeader>
	);

	if (soDo.isError || luotAn.isError || luotBat.isError) {
		return (
			<Card data-the="gop-y-so-do">
				{dau}
				<CardContent>
					<Empty data-trang-thai="loi">
						<EmptyHeader>
							<EmptyTitle>{m.loi}</EmptyTitle>
						</EmptyHeader>
						<EmptyContent>
							<Button
								variant="outline"
								size="sm"
								data-nut="thu-lai-so-do"
								onClick={() => {
									void soDo.refetch();
									void luotAn.refetch();
									void luotBat.refetch();
								}}
							>
								<Icon icon={Renew} data-icon="inline-start" />
								{m.thuLai}
							</Button>
						</EmptyContent>
					</Empty>
				</CardContent>
			</Card>
		);
	}

	if (!soDo.data || !luotAn.data || !luotBat.data) {
		return (
			<Card data-the="gop-y-so-do" aria-busy="true">
				{dau}
				<CardContent className="flex flex-col gap-3">
					{HANG_CHO.map((hang) => (
						<Skeleton key={hang} className="h-6 w-full" />
					))}
				</CardContent>
			</Card>
		);
	}

	if (soDo.data.bat.soLuot + soDo.data.an.soLuot === 0) {
		return (
			<Card data-the="gop-y-so-do">
				{dau}
				<CardContent>
					<Empty data-trang-thai="rong">
						<EmptyHeader>
							<EmptyTitle>{m.rong}</EmptyTitle>
							<EmptyDescription>{m.rongMoTa}</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</CardContent>
			</Card>
		);
	}

	const luot = [...luotBat.data.luot, ...luotAn.data.luot].sort((a, b) =>
		b.taoLuc.localeCompare(a.taoLuc),
	);
	const dangMo = luot.find((l) => l.taskId === moId) ?? null;

	return (
		<Card data-the="gop-y-so-do">
			{dau}
			<CardContent className="flex flex-col gap-6">
				<BangSo soDo={soDo.data} />
				{luot.length > 0 ? (
					<BangLuot luot={luot} moLuot={(id) => void setMoId(id)} />
				) : null}
			</CardContent>
			<NganLuot luot={dangMo} dong={() => void setMoId(null)} />
		</Card>
	);
}
