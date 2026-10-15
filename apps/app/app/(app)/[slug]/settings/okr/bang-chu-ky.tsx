"use client";

import Add from "@carbon/icons-react/es/Add";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { CardTableEmpty } from "@crm/ui/components/card-table";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { formatDay } from "@crm/ui/lib/format";
import { type PhaChuKy, phaSau } from "@crm/validation/okr-chu-ky";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { CELL, type ChuKy } from "@/app/(app)/[slug]/okr/kieu";
import { okrMessages } from "@/lib/messages/okr";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { type GoiYChuKy, ngayVnTuIso } from "@/lib/okr-chu-ky-nhan";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { HoiGoChuKy, HoiHienLaiChuKy } from "./hoi-chu-ky";
import { HopThoaiAnChuKy } from "./hop-thoai-an-chu-ky";
import { HopThoaiDongKy } from "./hop-thoai-dong-ky";
import { HopThoaiMoLai } from "./hop-thoai-mo-lai";
import {
	parseMoChuKy,
	parseMoRa,
	parseSuaChuKy,
	THAM_SO_MO_CHU_KY,
	THAM_SO_MO_RA,
	THAM_SO_SUA_CHU_KY,
} from "./okr-settings-search-params";
import { SheetMoChuKy } from "./sheet-mo-chu-ky";
import { SheetMoRa } from "./sheet-mo-ra";
import { SheetSuaChuKy } from "./sheet-sua-chu-ky";
import { DangTaiThe, LoiThe, useQuyenChuongTrinh } from "./trang-thai-cai-dat";

const TONE_PHA = {
	"lap-ke-hoach": "info",
	"dang-chay": "success",
	"cham-diem": "warning",
	"da-dong": "neutral",
} as const satisfies Record<PhaChuKy, StatusTone>;

type Hoi = "chuyen" | "dong" | "mo-lai" | "go" | "an" | "hien-lai" | null;

const daAn = (ky: ChuKy) => ky.anLuc !== null;

function theoNam(cycles: ChuKy[]): ChuKy[] {
	const nam = cycles.filter((c) => c.kind === "nam");
	const coCha = new Set(nam.map((c) => c.id));
	return [
		...nam.flatMap((n) => [n, ...cycles.filter((c) => c.parentId === n.id)]),
		...cycles.filter(
			(c) =>
				c.kind !== "nam" && (c.parentId === null || !coCha.has(c.parentId)),
		),
	];
}

export function BangChuKy({
	goiY,
	homNay,
}: {
	goiY: GoiYChuKy;
	homNay: string;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const k = okrKhepMessages(locale).caiDat;
	const c = m.caiDat;
	const trpc = useTRPC();
	const cycles = useQuery(trpc.okr.cycles.queryOptions());
	const { canManage, lyDo } = useQuyenChuongTrinh();
	const [, setMo] = useQueryState(THAM_SO_MO_CHU_KY, parseMoChuKy);

	const cot: SimpleTableColumn[] = [
		{ id: "ten", header: c.chuKy.cot.ten },
		{ id: "loai", header: c.chuKy.cot.loai, width: "w-24" },
		{ id: "tu", header: c.chuKy.cot.tu, width: "w-32" },
		{ id: "den", header: c.chuKy.cot.den, width: "w-32" },
		{ id: "pha", header: c.chuKy.cot.pha, width: "w-36" },
		{ id: "hanhDong", srLabel: c.chuKy.menu, width: "w-12" },
	];

	const ds = cycles.data
		? [
				...theoNam(cycles.data.cycles.filter((ky) => !daAn(ky))),
				...theoNam(cycles.data.cycles.filter(daAn)),
			]
		: [];

	return (
		<Card data-the="chu-ky">
			<CardHeader>
				<CardTitle>{c.chuKy.tieuDe}</CardTitle>
				<CardDescription>{c.chuKy.moTa}</CardDescription>
				<CardAction>
					<Button
						disabled={!canManage}
						aria-describedby={lyDo}
						data-nut="mo-chu-ky"
						onClick={() => void setMo(true)}
					>
						<Icon icon={Add} data-icon="inline-start" />
						{c.chuKy.moChuKy}
					</Button>
				</CardAction>
			</CardHeader>

			{cycles.isError ? (
				<LoiThe thuLai={() => void cycles.refetch()} />
			) : !cycles.data ? (
				<DangTaiThe />
			) : ds.length === 0 ? (
				<CardTableEmpty>{c.chuKy.rong}</CardTableEmpty>
			) : (
				<SimpleTable columns={cot}>
					{ds.map((ky) => (
						<SimpleTableRow key={ky.id} data-chu-ky={ky.id}>
							<TableCell className={`${CELL} whitespace-normal`}>
								<span className="flex flex-col gap-0.5">
									<span
										translate="no"
										className={daAn(ky) ? "text-muted-foreground" : undefined}
									>
										{ky.name}
									</span>
									{ky.anLuc !== null ? (
										<span
											className="text-muted-foreground text-xs"
											data-dong-an={ky.id}
										>
											{c.chuKy.dongAn(
												formatDay(ngayVnTuIso(ky.anLuc), locale),
												c.pha[ky.phase],
											)}
											{ky.anLyDo ? (
												<>
													{" · "}
													<span translate="no">{ky.anLyDo}</span>
												</>
											) : null}
										</span>
									) : null}
									{ky.cuaSoRa ? (
										<span
											className="text-muted-foreground text-xs tabular-nums"
											data-dong-ra={ky.cuaSoRa.id}
										>
											{k.dongPhu(
												formatDay(ky.cuaSoRa.tuNgay, locale),
												formatDay(ky.cuaSoRa.denNgay, locale),
											)}
										</span>
									) : null}
								</span>
							</TableCell>
							<TableCell className={`${CELL} text-muted-foreground`}>
								{m.loaiChuKy[ky.kind]}
							</TableCell>
							<TableCell className={`${CELL} tabular-nums`}>
								{formatDay(ky.startsOn, locale)}
							</TableCell>
							<TableCell className={`${CELL} tabular-nums`}>
								{formatDay(ky.endsOn, locale)}
							</TableCell>
							<TableCell className={CELL}>
								{daAn(ky) ? (
									<StatusIndicator
										size="sm"
										tone="neutral"
										label={c.chuKy.daAn}
									/>
								) : (
									<StatusIndicator
										size="sm"
										tone={TONE_PHA[ky.phase]}
										label={c.pha[ky.phase]}
									/>
								)}
							</TableCell>
							<TableCell className={`${CELL} text-right`}>
								<MenuChuKy ky={ky} canManage={canManage} lyDo={lyDo} />
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			)}

			<SheetMoChuKy
				canManage={canManage}
				cacNam={ds.filter((ky) => ky.kind === "nam" && !daAn(ky))}
				goiY={goiY}
			/>
			<SheetSuaChuKy canManage={canManage} cycles={ds} />
			<SheetMoRa canManage={canManage} cycles={ds} homNay={homNay} />
		</Card>
	);
}

function MenuChuKy({
	ky,
	canManage,
	lyDo,
}: {
	ky: ChuKy;
	canManage: boolean;
	lyDo: string | undefined;
}) {
	const m = okrMessages(useLocale());
	const c = m.caiDat;
	const k = okrKhepMessages(useLocale()).caiDat;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [hoi, setHoi] = useState<Hoi>(null);
	const [, setMoRa] = useQueryState(THAM_SO_MO_RA, parseMoRa);
	const [, setSua] = useQueryState(THAM_SO_SUA_CHU_KY, parseSuaChuKy);
	const ke = phaSau(ky.phase);
	const dong = () => setHoi(null);
	const v = c.chuKy.viec;

	const chuyen = useMutation(
		trpc.okr.setCyclePhase.mutationOptions({
			onSuccess: async () => {
				await cache.okr();
				if (ke === "cham-diem") toast.success(k.sangCham.daSang(ky.name));
				else if (ke) toast.success(c.chuKy.daChuyen(ky.name, c.pha[ke]));
				setHoi(null);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const dongRa = useMutation(
		trpc.okr.dongRa.mutationOptions({
			onSuccess: async () => {
				await cache.okr();
				toast.success(k.daDongRa(ky.name));
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const muc = (ten: string, viec: string, chon: () => void) => (
		<DropdownMenuItem
			key={viec}
			disabled={!canManage}
			data-viec-chu-ky={viec}
			onSelect={chon}
		>
			{ten}
		</DropdownMenuItem>
	);

	const mucMoi = daAn(ky)
		? [muc(v.hienLai, "hien-lai", () => setHoi("hien-lai"))]
		: [
				...(ky.viec.suaMoiO || ky.viec.suaTen
					? [muc(v.sua, "sua", () => void setSua(ky.id))]
					: []),
				...(ky.viec.go ? [muc(v.go, "go", () => setHoi("go"))] : []),
				...(ky.viec.an
					? [muc(v.an, "an", () => setHoi("an"))]
					: ky.quyConHien > 0
						? [
								<DropdownMenuItem key="an" disabled data-viec-chu-ky="an">
									<span className="flex flex-col gap-0.5">
										<span>{v.an}</span>
										<span className="text-muted-foreground text-xs">
											{c.chuKy.anKhoa(String(ky.quyConHien))}
										</span>
									</span>
								</DropdownMenuItem>,
							]
						: []),
			];

	const mucCu = daAn(ky)
		? []
		: ky.phase === "lap-ke-hoach"
			? [
					muc(c.chuKy.chuyenSang(c.pha["dang-chay"]), "chay", () =>
						setHoi("chuyen"),
					),
				]
			: ky.phase === "dang-chay"
				? [
						ky.cuaSoRa === null
							? muc(k.menu.moRa, "mo-ra", () => void setMoRa(ky.id))
							: muc(k.menu.dongRa, "dong-ra", () => {
									if (ky.cuaSoRa && !dongRa.isPending)
										dongRa.mutate({ id: ky.cuaSoRa.id });
								}),
						muc(k.menu.sangCham, "sang-cham", () => setHoi("chuyen")),
					]
				: ky.phase === "cham-diem"
					? [muc(k.menu.dongKy, "dong-ky", () => setHoi("dong"))]
					: [muc(k.menu.moLai, "mo-lai", () => setHoi("mo-lai"))];

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						aria-label={c.chuKy.menu}
						aria-describedby={lyDo}
						size="icon-sm"
						variant="ghost"
						disabled={!canManage}
						data-menu-chu-ky={ky.id}
					>
						<Icon icon={OverflowMenuHorizontal} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-64">
					{mucMoi}
					{mucMoi.length > 0 && mucCu.length > 0 ? (
						<DropdownMenuSeparator />
					) : null}
					{mucCu}
				</DropdownMenuContent>
			</DropdownMenu>
			{ke === "dang-chay" || ke === "cham-diem" ? (
				<ConfirmDialog
					tone="default"
					tieuDe={
						ke === "cham-diem"
							? k.sangCham.tieuDe(ky.name)
							: c.chuKy.hoi.title(ky.name, c.pha[ke])
					}
					than={ke === "cham-diem" ? k.sangCham.than : c.chuKy.hoi.body}
					nut={ke === "cham-diem" ? k.sangCham.nut : c.chuKy.hoi.action}
					thoi={ke === "cham-diem" ? k.sangCham.huy : c.chuKy.hoi.cancel}
					open={hoi === "chuyen"}
					pending={chuyen.isPending}
					onOpenChange={(mo) => {
						if (!mo && !chuyen.isPending) dong();
					}}
					onConfirm={() => {
						if (!chuyen.isPending) chuyen.mutate({ id: ky.id, phase: ke });
					}}
				/>
			) : null}
			{ky.phase === "cham-diem" ? (
				<HopThoaiDongKy
					ky={ky}
					open={hoi === "dong"}
					onOpenChange={(mo) => {
						if (!mo) dong();
					}}
				/>
			) : null}
			{ky.viec.go ? (
				<HoiGoChuKy ky={ky} open={hoi === "go"} dong={dong} />
			) : null}
			{ky.viec.an ? (
				<HopThoaiAnChuKy
					ky={ky}
					open={hoi === "an"}
					onOpenChange={(mo) => {
						if (!mo) dong();
					}}
				/>
			) : null}
			{ky.viec.hienLai ? (
				<HoiHienLaiChuKy ky={ky} open={hoi === "hien-lai"} dong={dong} />
			) : null}
			{ky.phase === "da-dong" ? (
				<HopThoaiMoLai
					ky={ky}
					open={hoi === "mo-lai"}
					onOpenChange={(mo) => {
						if (!mo) dong();
					}}
				/>
			) : null}
		</>
	);
}
