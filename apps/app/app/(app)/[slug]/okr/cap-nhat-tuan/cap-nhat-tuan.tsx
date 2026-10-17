"use client";

import CheckmarkOutline from "@carbon/icons-react/es/CheckmarkOutline";
import Renew from "@carbon/icons-react/es/Renew";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Card, CardContent } from "@crm/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@crm/ui/components/input-group";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemSeparator,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { NGHIA_TU_TIN } from "@crm/ui/components/okr-status";
import { Skeleton } from "@crm/ui/components/skeleton";
import { Spinner } from "@crm/ui/components/spinner";
import {
	IndicatorDot,
	StatusIndicator,
} from "@crm/ui/components/status-indicator";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import type { Locale } from "@crm/ui/lib/locale";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import {
	GHI_CHU_TOI_DA,
	kiemGiaTriTheoKieu,
	type LoiVao,
	MUC_TU_TIN,
	type MucTuTin,
} from "@crm/validation/okr-cap-nhat";
import { docSoOkr } from "@crm/validation/okr-kr";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Fragment, useState } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { type OkrSoMessages, okrSoMessages } from "@/lib/messages/okr-so";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { giaTri } from "../bang-kr";
import { hienSo } from "../hop-thoai-kr";
import type { DuLieuCapNhat, KrCapNhat } from "../kieu";
import { KHOA_DAU } from "../nguon-so";

export const TUAN = { chuNhat: 6, soNgay: 7 } as const;

const VI_DU_SO = 3.5;

const MOC = { chuaXong: "0", xong: "1" } as const;

const DINH_DANG = { vi: "vi-VN", en: "en-GB" } satisfies Record<Locale, string>;

const MUI_GIO = "Asia/Ho_Chi_Minh";

const KHUNG_TAI = ["mot", "hai", "ba"] as const;

export type LanTruoc = "tuan-nay" | "tuan-truoc" | "lan-truoc";

type O = { giaTri: string; tuTin: MucTuTin | null; ghiChu: string };

type LoiSo = "so" | "phan-tram";

type DongDaGui = { kr: KrCapNhat; value: number; confidence: MucTuTin };

type KetQuaGui = {
	soCapNhat: number;
	gio: string;
	giay: number;
	dong: DongDaGui[];
};

export function congNgay(ngay: string, n: number): string {
	const d = new Date(`${ngay}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().slice(0, 10);
}

export function ngayThang(ngay: string): string {
	const [, thang, ngayTrongThang] = ngay.split("-");
	return `${ngayTrongThang}/${thang}`;
}

function ngayVN(luc: string): string {
	return new Date(luc).toLocaleDateString("en-CA", {
		timeZone: "Asia/Ho_Chi_Minh",
	});
}

function lanTruoc(kr: KrCapNhat, weekStart: string): LanTruoc | null {
	if (kr.lastAt === null) return null;
	if (kr.updatedThisWeek) return "tuan-nay";
	return ngayVN(kr.lastAt) >= congNgay(weekStart, -TUAN.soNgay)
		? "tuan-truoc"
		: "lan-truoc";
}

function lucGuiMoiNhat(items: KrCapNhat[]): string | null {
	return items.reduce<string | null>(
		(moiNhat, kr) =>
			kr.lastAt !== null && (moiNhat === null || kr.lastAt > moiNhat)
				? kr.lastAt
				: moiNhat,
		null,
	);
}

function ngayGioVN(luc: string, locale: Locale) {
	return {
		ngay: ngayThang(ngayVN(luc)),
		gio: new Date(luc).toLocaleTimeString(DINH_DANG[locale], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
			timeZone: MUI_GIO,
		}),
	};
}

function laMucTuTin(v: string): MucTuTin | null {
	return MUC_TU_TIN.find((m) => m === v) ?? null;
}

function laKhoaNguon(kr: KrCapNhat): boolean {
	return kr.nguon !== "tay";
}

function giaTriMacDinh(kr: KrCapNhat): number {
	if (laKhoaNguon(kr) || kr.doCanh) return kr.soMay?.giaTri ?? kr.currentValue;
	return kr.currentValue;
}

function nhanNguonMay(
	nguon: NonNullable<KrCapNhat["soMay"]>["nguon"],
	m: OkrSoMessages,
): string {
	return m.dau[KHOA_DAU[nguon]];
}

export function oBanDau(kr: KrCapNhat, locale: Locale): O {
	const macDinh = giaTriMacDinh(kr);
	const giaTriDau =
		kr.kind === "moc"
			? macDinh >= 1
				? MOC.xong
				: MOC.chuaXong
			: hienSo(macDinh, locale);
	return { giaTri: giaTriDau, tuTin: null, ghiChu: "" };
}

export function docGiaTri(kr: KrCapNhat, chu: string): number | null {
	if (kr.kind === "moc") return chu === MOC.xong ? 1 : 0;
	return docSoOkr(chu);
}

export function loiSo(kr: KrCapNhat, so: number | null): LoiSo | null {
	if (so === null) return "so";
	return kiemGiaTriTheoKieu(kr.kind, so) === null ? null : "phan-tram";
}

export function CapNhatTuan({
	entry,
	sessionId,
}: {
	entry: LoiVao;
	sessionId: string | null;
}) {
	const trpc = useTRPC();
	const [phien, setPhien] = useState(sessionId);
	const ds = useQuery({
		...trpc.okr.capNhatTuan.queryOptions(),
		enabled: false,
	});
	const moPhien = useMutation(
		trpc.okr.moCapNhat.mutationOptions({
			onSuccess: (kq) => setPhien(kq.sessionId),
		}),
	);

	const thuLai = async () => {
		const kq = await ds.refetch();
		if (phien === null && kq.data && kq.data.items.length > 0)
			moPhien.mutate({ entry });
	};

	if (ds.isFetching || moPhien.isPending) return <DangTaiCapNhat />;
	if (!ds.data) return <LoiTai thuLai={thuLai} />;
	if (ds.data.items.length === 0) return <Rong />;
	if (phien === null) return <LoiTai thuLai={thuLai} />;
	return <BangCapNhat duLieu={ds.data} key={phien} sessionId={phien} />;
}

export function DangTaiCapNhat() {
	const m = okrMessages(useLocale()).capNhat;
	return (
		<div
			aria-busy="true"
			className="flex flex-col gap-4"
			data-trang-thai="ST-capnhat-dangtai"
		>
			<p className="text-muted-foreground text-sm" role="status">
				{m.dangTai}
			</p>
			<Card>
				<CardContent>
					{KHUNG_TAI.map((id) => (
						<div className="flex flex-col gap-2" key={id}>
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-3 w-1/3" />
							<Skeleton className="h-9 w-full" />
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}

function LoiTai({ thuLai }: { thuLai: () => void }) {
	const m = okrMessages(useLocale()).capNhat;
	return (
		<Empty data-trang-thai="ST-capnhat-loi">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Icon icon={WarningAlt} />
				</EmptyMedia>
				<EmptyTitle>{m.loi.title}</EmptyTitle>
				<EmptyDescription>{m.loi.body}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={thuLai} variant="outline">
					<Icon data-icon="inline-start" icon={Renew} />
					{m.loi.action}
				</Button>
			</EmptyContent>
		</Empty>
	);
}

function VeCuaToi() {
	const m = okrMessages(useLocale()).capNhat;
	const url = useWorkspaceUrl();
	return (
		<Button asChild variant="outline">
			<Link href={url("/okr")}>{m.veCuaToi}</Link>
		</Button>
	);
}

function Rong() {
	const m = okrMessages(useLocale()).capNhat;
	return (
		<Empty data-trang-thai="ST-capnhat-rong">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Icon icon={CheckmarkOutline} />
				</EmptyMedia>
				<EmptyTitle>{m.rong.title}</EmptyTitle>
				<EmptyDescription>{m.rong.body}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<VeCuaToi />
			</EmptyContent>
		</Empty>
	);
}

export function BangCapNhat({
	duLieu,
	sessionId,
	taiCho = false,
	suaNgay = false,
	focusDau = false,
}: {
	duLieu: DuLieuCapNhat;
	sessionId: string;
	taiCho?: boolean;
	suaNgay?: boolean;
	focusDau?: boolean;
}) {
	const locale = useLocale();
	const m = okrMessages(locale).capNhat;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [o, setO] = useState(
		() =>
			new Map(duLieu.items.map((kr) => [kr.keyResultId, oBanDau(kr, locale)])),
	);
	const [daGui, setDaGui] = useState<KetQuaGui | null>(null);
	const [dangSua, setDangSua] = useState(suaNgay);
	const gui = useMutation(trpc.okr.guiCapNhat.mutationOptions());

	const dong = duLieu.items.map((kr) => {
		const oKr = o.get(kr.keyResultId) ?? oBanDau(kr, locale);
		const so = docGiaTri(kr, oKr.giaTri);
		return { kr, o: oKr, so, loi: loiSo(kr, so) };
	});
	const tong = dong.length;
	const soDaGuiTuanNay = duLieu.items.filter((kr) => kr.updatedThisWeek).length;
	const sanSang = dong.filter((d) => d.o.tuTin !== null);
	const soLoi = dong.filter((d) => d.loi !== null).length;
	const khoa = gui.isPending;
	const loiGui = gui.isError && !khoa;

	if (daGui)
		return (
			<DaGui
				chuaGui={
					duLieu.items.filter(
						(kr) =>
							!kr.updatedThisWeek &&
							!daGui.dong.some((d) => d.kr.keyResultId === kr.keyResultId),
					).length
				}
				ketQua={daGui}
				taiCho={taiCho}
				weekStart={duLieu.weekStart}
			/>
		);

	if (!dangSua && tong > 0 && soDaGuiTuanNay === tong)
		return (
			<DaXongTuanNay
				duLieu={duLieu}
				sua={() => setDangSua(true)}
				taiCho={taiCho}
			/>
		);

	const motPhan = soDaGuiTuanNay > 0 && soDaGuiTuanNay < tong;

	const datO = (id: string, moi: O) => setO((cu) => new Map(cu).set(id, moi));

	const guiDi = () => {
		const guiDong = sanSang.flatMap((d) =>
			d.o.tuTin !== null && d.so !== null
				? [{ kr: d.kr, value: d.so, confidence: d.o.tuTin, note: d.o.ghiChu }]
				: [],
		);
		gui.mutate(
			{
				sessionId,
				items: guiDong.map((d) => ({
					keyResultId: d.kr.keyResultId,
					value: d.value,
					confidence: d.confidence,
					note: d.note.trim(),
				})),
			},
			{
				onSuccess: (kq) => {
					setDaGui({
						soCapNhat: kq.written,
						giay: kq.seconds,
						gio: new Date().toLocaleTimeString(DINH_DANG[locale], {
							hour: "2-digit",
							minute: "2-digit",
							hour12: false,
						}),
						dong: guiDong,
					});
					void cache.okr();
				},
			},
		);
	};

	const trangThai = khoa
		? "ST-capnhat-danggui"
		: loiGui
			? "ST-capnhat-loigui"
			: soLoi > 0
				? "ST-capnhat-sokhonghople"
				: motPhan
					? "ST-capnhat-motphan"
					: "ST-capnhat-dangdien";
	const loiMayChu =
		gui.error?.data?.httpStatus !== undefined && gui.error.data.httpStatus < 500
			? gui.error.message
			: m.loiGui.mayChu;

	return (
		<div className="flex flex-col gap-4" data-trang-thai={trangThai}>
			<p className="text-muted-foreground text-sm">
				{m.dauTrang(tong, ngayThang(congNgay(duLieu.weekStart, TUAN.chuNhat)))}
			</p>
			{motPhan ? (
				<p className="font-medium text-sm" data-da-gui-mot-phan>
					{m.daGuiMotPhan(soDaGuiTuanNay, tong)}
				</p>
			) : null}
			{loiGui ? (
				<Alert variant="destructive">
					<Icon icon={WarningAlt} />
					<AlertTitle>{m.loiGui.title}</AlertTitle>
					<AlertDescription>
						{loiMayChu} {m.loiGui.conNguyen}
					</AlertDescription>
				</Alert>
			) : null}
			<Card>
				<CardContent>
					<ItemGroup aria-label={m.danhSach}>
						{dong.map((d, i) => (
							<Fragment key={d.kr.keyResultId}>
								{i > 0 ? <ItemSeparator /> : null}
								<DongCapNhat
									datO={(moi) => datO(d.kr.keyResultId, moi)}
									khoa={khoa}
									kr={d.kr}
									loi={d.loi}
									o={d.o}
									so={d.so}
									tuDongFocus={(dangSua || focusDau) && i === 0}
									weekStart={duLieu.weekStart}
								/>
							</Fragment>
						))}
					</ItemGroup>
				</CardContent>
			</Card>
			<div className="sticky bottom-0 flex flex-col gap-2 border-t bg-background py-3 sm:flex-row sm:items-center">
				<span
					aria-live="polite"
					className="text-muted-foreground text-xs sm:flex-1"
				>
					{soLoi > 0
						? m.thanh.loiSo(soLoi)
						: sanSang.length === tong
							? m.thanh.du(sanSang.length, tong)
							: m.thanh.chon(sanSang.length, tong)}
				</span>
				<Button
					className="w-full sm:w-auto"
					data-nut="gui"
					disabled={khoa || sanSang.length === 0 || soLoi > 0}
					onClick={guiDi}
				>
					{khoa ? <Spinner data-icon="inline-start" /> : null}
					{khoa
						? m.dangGui
						: loiGui
							? m.guiLai(sanSang.length)
							: m.gui(sanSang.length)}
				</Button>
			</div>
		</div>
	);
}

function DongCapNhat({
	kr,
	o,
	so,
	loi,
	datO,
	khoa,
	tuDongFocus,
	weekStart,
}: {
	kr: KrCapNhat;
	o: O;
	so: number | null;
	loi: LoiSo | null;
	datO: (o: O) => void;
	khoa: boolean;
	tuDongFocus: boolean;
	weekStart: string;
}) {
	const m = okrMessages(useLocale()).capNhat;
	const lan = lanTruoc(kr, weekStart);
	return (
		<Item data-kr={kr.keyResultId} data-nguon={kr.nguon} role="listitem">
			<ItemContent>
				<ItemTitle translate="no">{kr.title}</ItemTitle>
				<ItemDescription translate="no">{kr.objectiveTitle}</ItemDescription>
			</ItemContent>
			{kr.updatedThisWeek ? (
				<Badge data-da-gui-tuan-nay variant="outline">
					<Icon data-icon="inline-start" icon={CheckmarkOutline} />
					{m.nhanDaGui}
				</Badge>
			) : null}
			<div className="grid basis-full grid-cols-1 gap-3 md:grid-cols-[minmax(0,12rem)_auto_minmax(0,1fr)] md:items-start md:gap-6">
				<OGiaTri
					datGiaTri={(giaTri) => datO({ ...o, giaTri })}
					khoa={khoa}
					kr={kr}
					lan={lan}
					loi={loi}
					so={so}
					tuDongFocus={tuDongFocus}
					value={o.giaTri}
				/>
				<ChonTuTin
					datTuTin={(tuTin) => datO({ ...o, tuTin })}
					khoa={khoa}
					kr={kr}
					lan={lan}
					value={o.tuTin}
				/>
				<OGhiChu
					datGhiChu={(ghiChu) => datO({ ...o, ghiChu })}
					id={kr.keyResultId}
					khoa={khoa}
					value={o.ghiChu}
				/>
			</div>
		</Item>
	);
}

export function OGiaTri({
	kr,
	value,
	so,
	loi,
	lan,
	datGiaTri,
	khoa,
	tuDongFocus = false,
}: {
	kr: KrCapNhat;
	value: string;
	so: number | null;
	loi: LoiSo | null;
	lan: LanTruoc | null;
	datGiaTri: (v: string) => void;
	khoa: boolean;
	tuDongFocus?: boolean;
}) {
	const locale = useLocale();
	const m = okrMessages(locale).capNhat;
	const soMsg = okrSoMessages(locale);
	const id = `${kr.keyResultId}-gia-tri`;
	const nhanLan = lan === null ? m.hienTai : m.lanTruoc[lan];
	const khoaNguon = laKhoaNguon(kr);

	const moTaSoMay = khoaNguon
		? kr.soMay
			? soMsg.trangThai.capNhat.soTu(
					nhanNguonMay(kr.soMay.nguon, soMsg),
					ngayThang(kr.soMay.ngay),
				)
			: kr.nguon === "api"
				? soMsg.trangThai.bangKr.chuaGhiApi
				: soMsg.trangThai.bangKr.chuaChup
		: kr.doCanh && kr.soMay
			? soMsg.trangThai.capNhat.soMay(
					hienSo(kr.soMay.giaTri, locale),
					ngayThang(kr.soMay.ngay),
				)
			: null;

	if (kr.kind === "moc") {
		return (
			<Field data-o="gia-tri">
				<FieldLabel id={id}>{m.moc}</FieldLabel>
				<ToggleGroup
					aria-labelledby={id}
					className="w-full sm:w-fit"
					data-khoa={khoaNguon || undefined}
					disabled={khoa || khoaNguon}
					onValueChange={(v) => {
						if (v) datGiaTri(v);
					}}
					size="lg"
					spacing={0}
					type="single"
					value={value}
					variant="outline"
				>
					<ToggleGroupItem
						autoFocus={tuDongFocus && value === MOC.chuaXong}
						className="flex-1 sm:flex-none"
						value={MOC.chuaXong}
					>
						{okrMessages(locale).moc.chuaXong}
					</ToggleGroupItem>
					<ToggleGroupItem
						autoFocus={tuDongFocus && value === MOC.xong}
						className="flex-1 sm:flex-none"
						value={MOC.xong}
					>
						{okrMessages(locale).moc.xong}
					</ToggleGroupItem>
				</ToggleGroup>
				<FieldDescription>
					{moTaSoMay ??
						`${nhanLan}: ${giaTri(kr, kr.currentValue, locale).toLowerCase()}`}
				</FieldDescription>
			</Field>
		);
	}

	const doi = so === null || loi !== null ? 0 : so - kr.currentValue;
	const chuDoi =
		doi === 0
			? ""
			: ` · ${m.soVoi(
					`${doi > 0 ? "+" : "−"}${Math.abs(doi).toLocaleString(DINH_DANG[locale])}`,
					nhanLan,
				)}`;

	return (
		<Field data-invalid={loi !== null || undefined} data-o="gia-tri">
			<FieldLabel htmlFor={id}>{m.giaTri}</FieldLabel>
			<InputGroup>
				<InputGroupInput
					aria-invalid={loi !== null || undefined}
					autoFocus={tuDongFocus}
					className="tabular-nums"
					data-khoa={khoaNguon || undefined}
					disabled={khoa || khoaNguon}
					id={id}
					inputMode="decimal"
					onChange={(e) => datGiaTri(e.target.value)}
					value={value}
				/>
				{kr.unit ? (
					<InputGroupAddon align="inline-end">
						<InputGroupText translate="no">{kr.unit}</InputGroupText>
					</InputGroupAddon>
				) : null}
			</InputGroup>
			{loi === "so" ? (
				<FieldError>{m.loiSo(hienSo(VI_DU_SO, locale))}</FieldError>
			) : loi === "phan-tram" ? (
				<FieldError>{m.loiPhanTram}</FieldError>
			) : moTaSoMay ? (
				<FieldDescription className="tabular-nums">
					{moTaSoMay}
				</FieldDescription>
			) : (
				<FieldDescription className="tabular-nums">
					{nhanLan} {giaTri(kr, kr.currentValue, locale)} · {m.dich}{" "}
					{giaTri(kr, kr.targetValue, locale)}
					{chuDoi}
				</FieldDescription>
			)}
		</Field>
	);
}

export function ChonTuTin({
	kr,
	value,
	lan,
	datTuTin,
	khoa,
}: {
	kr: KrCapNhat;
	value: MucTuTin | null;
	lan: LanTruoc | null;
	datTuTin: (v: MucTuTin) => void;
	khoa: boolean;
}) {
	const m = okrMessages(useLocale()).capNhat;
	const id = `${kr.keyResultId}-tu-tin`;
	return (
		<Field data-o="tu-tin">
			<FieldLabel id={id}>{m.tuTin}</FieldLabel>
			<ToggleGroup
				aria-labelledby={id}
				className="w-full sm:w-fit"
				disabled={khoa}
				onValueChange={(v) => {
					const muc = laMucTuTin(v);
					if (muc) datTuTin(muc);
				}}
				size="lg"
				spacing={0}
				type="single"
				value={value ?? ""}
				variant="outline"
			>
				{MUC_TU_TIN.map((muc) => (
					<ToggleGroupItem
						className="flex-1 gap-2 sm:flex-none"
						key={muc}
						value={muc}
					>
						<IndicatorDot
							aria-hidden="true"
							tone={toneTheoNghia(NGHIA_TU_TIN[muc])}
						/>
						{m.mucTuTin[muc]}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
			<FieldDescription>
				{kr.lastConfidence === null || lan === null
					? m.chuaCapNhat
					: `${m.lanTruoc[lan]}: ${m.mucTuTin[kr.lastConfidence].toLowerCase()}`}
			</FieldDescription>
		</Field>
	);
}

export function OGhiChu({
	id,
	value,
	datGhiChu,
	khoa,
}: {
	id: string;
	value: string;
	datGhiChu: (v: string) => void;
	khoa: boolean;
}) {
	const m = okrMessages(useLocale()).capNhat;
	return (
		<Field data-o="ghi-chu">
			<FieldLabel htmlFor={`${id}-ghi-chu`}>{m.ghiChu}</FieldLabel>
			<Input
				disabled={khoa}
				id={`${id}-ghi-chu`}
				maxLength={GHI_CHU_TOI_DA}
				onChange={(e) => datGhiChu(e.target.value)}
				placeholder={m.ghiChuGoiY}
				value={value}
			/>
		</Field>
	);
}

function DaGui({
	ketQua,
	chuaGui,
	weekStart,
	taiCho,
}: {
	ketQua: KetQuaGui;
	chuaGui: number;
	weekStart: string;
	taiCho: boolean;
}) {
	const locale = useLocale();
	const m = okrMessages(locale).capNhat;
	return (
		<div className="flex flex-col gap-4" data-trang-thai="ST-capnhat-dagui">
			<Alert>
				<Icon icon={CheckmarkOutline} />
				<AlertTitle>
					{m.daGui.title(ketQua.soCapNhat, ketQua.gio, ketQua.giay)}
				</AlertTitle>
				<AlertDescription>
					{m.daGui.keTiep(ngayThang(congNgay(weekStart, TUAN.soNgay)))}
					{chuaGui > 0 ? ` ${m.daGui.conCho(chuaGui)}` : ""}
				</AlertDescription>
			</Alert>
			<Card>
				<CardContent>
					<ItemGroup aria-label={m.daGui.danhSach}>
						{ketQua.dong.map((d, i) => (
							<Fragment key={d.kr.keyResultId}>
								{i > 0 ? <ItemSeparator /> : null}
								<Item data-kr={d.kr.keyResultId} role="listitem">
									<ItemContent>
										<ItemTitle translate="no">{d.kr.title}</ItemTitle>
										<ItemDescription translate="no">
											{d.kr.objectiveTitle}
										</ItemDescription>
									</ItemContent>
									<span className="text-sm tabular-nums">
										{giaTri(d.kr, d.value, locale)}
									</span>
									<StatusIndicator
										label={m.tuTinNhan(m.mucTuTin[d.confidence])}
										size="sm"
										tone={toneTheoNghia(NGHIA_TU_TIN[d.confidence])}
									/>
								</Item>
							</Fragment>
						))}
					</ItemGroup>
				</CardContent>
			</Card>
			{taiCho ? null : (
				<div>
					<VeCuaToi />
				</div>
			)}
		</div>
	);
}

function DaXongTuanNay({
	duLieu,
	sua,
	taiCho,
}: {
	duLieu: DuLieuCapNhat;
	sua: () => void;
	taiCho: boolean;
}) {
	const locale = useLocale();
	const m = okrMessages(locale).capNhat;
	const luc = lucGuiMoiNhat(duLieu.items);
	const moc = luc === null ? null : ngayGioVN(luc, locale);
	return (
		<div className="flex flex-col gap-4" data-trang-thai="ST-capnhat-daxong">
			<Alert role="status">
				<Icon icon={CheckmarkOutline} />
				<AlertTitle>{m.daXong.title}</AlertTitle>
				<AlertDescription>
					{moc ? `${m.daXong.luc(moc.ngay, moc.gio)} ` : ""}
					{m.daGui.keTiep(ngayThang(congNgay(duLieu.weekStart, TUAN.soNgay)))}
				</AlertDescription>
			</Alert>
			<Card>
				<CardContent>
					<ItemGroup aria-label={m.daXong.danhSach}>
						{duLieu.items.map((kr, i) => (
							<Fragment key={kr.keyResultId}>
								{i > 0 ? <ItemSeparator /> : null}
								<Item data-kr={kr.keyResultId} role="listitem">
									<ItemContent>
										<ItemTitle translate="no">{kr.title}</ItemTitle>
										<ItemDescription translate="no">
											{kr.objectiveTitle}
										</ItemDescription>
									</ItemContent>
									<span className="text-sm tabular-nums">
										{giaTri(kr, kr.currentValue, locale)}
									</span>
									{kr.lastConfidence ? (
										<StatusIndicator
											label={m.tuTinNhan(m.mucTuTin[kr.lastConfidence])}
											size="sm"
											tone={toneTheoNghia(NGHIA_TU_TIN[kr.lastConfidence])}
										/>
									) : null}
								</Item>
							</Fragment>
						))}
					</ItemGroup>
				</CardContent>
			</Card>
			<div className="flex flex-wrap gap-2">
				<Button data-nut="sua-cap-nhat" onClick={sua} variant="outline">
					{m.daXong.sua}
				</Button>
				{taiCho ? null : <VeCuaToi />}
			</div>
		</div>
	);
}
