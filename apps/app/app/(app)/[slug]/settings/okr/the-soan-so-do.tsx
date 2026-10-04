"use client";

import Renew from "@carbon/icons-react/es/Renew";
import { Badge } from "@crm/ui/components/badge";
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
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { Spinner } from "@crm/ui/components/spinner";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { formatPercent } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { skipToken, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { type OkrSoanMessages, okrSoanMessages } from "@/lib/messages/okr-soan";
import { ngayThangVn } from "@/lib/okr-chu-ky-nhan";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { kySoDoSoan } from "../../okr/okr-search-params";
import { SOAN_UI } from "../../okr/soan/cau-hinh";
import { parseCuocSoan, THAM_SO_CUOC_SOAN } from "./okr-settings-search-params";

type SoDo = RouterOutputs["okr"]["soanSoDo"];
type SoNac = SoDo["bat"];
type HangId = Exclude<keyof SoNac, "theoMa">;
type CuocGanDay = SoDo["cuocGanDay"][number];
type An = RouterOutputs["okr"]["soanAn"];
type DongAn = An["dong"][number];
type DaCat = NonNullable<An["daCat"]>;
type ChuKy = RouterOutputs["okr"]["cycles"]["cycles"][number];
type MaLoai = SoNac["theoMa"][number]["maLoai"];

const HANG_CHO = ["mot", "hai", "ba", "bon", "nam", "sau"];

type DinhDang = (n: SoNac, locale: Locale) => ReactNode;

const so =
	(chon: (n: SoNac) => number): DinhDang =>
	(n, locale) =>
		new Intl.NumberFormat(locale).format(chon(n));

const phanTram =
	(chon: (n: SoNac) => number | null): DinhDang =>
	(n, locale) => {
		const tyLe = chon(n);
		return tyLe === null ? <EmptyCellValue /> : formatPercent(tyLe, locale);
	};

const giay =
	(chon: (n: SoNac) => number | null): DinhDang =>
	(n, locale) => {
		const ms = chon(n);
		return ms === null ? <EmptyCellValue /> : dinhDangGiay(ms, locale);
	};

const tien =
	(chon: (n: SoNac) => number | null): DinhDang =>
	(n, locale) => {
		const usd = chon(n);
		return usd === null ? <EmptyCellValue /> : dinhDangTien(usd, locale);
	};

function dinhDangGiay(ms: number, locale: Locale): string {
	return new Intl.NumberFormat(locale, {
		style: "unit",
		unit: "second",
		maximumFractionDigits: 1,
	}).format(ms / SOAN_UI.soDo.giayMs);
}

function dinhDangTien(usd: number, locale: Locale): string {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: SOAN_UI.soDo.chuSoTienLe,
	}).format(usd);
}

const DINH_DANG = {
	cuocMo: so((n) => n.cuocMo),
	cuocDuaVao: so((n) => n.cuocDuaVao),
	donViCoCuoc: so((n) => n.donViCoCuoc),
	donViHoanTat: so((n) => n.donViHoanTat),
	tyLeDonViHoanTat: phanTram((n) => n.tyLeDonViHoanTat),
	daHien: so((n) => n.daHien),
	dongNhan: so((n) => n.dongNhan),
	dongSua: so((n) => n.dongSua),
	dongBac: so((n) => n.dongBac),
	tyLeDuocNhan: phanTram((n) => n.tyLeDuocNhan),
	dongBiLoai: so((n) => n.dongBiLoai),
	mucTieuNhap: so((n) => n.mucTieuNhap),
	mucTieuCongBo14Ngay: so((n) => n.mucTieuCongBo14Ngay),
	tyLeCongBo14Ngay: phanTram((n) => n.tyLeCongBo14Ngay),
	chiPhiMoiCuocUsd: tien((n) => n.chiPhiMoiCuocUsd),
	tienUsd: tien((n) => n.tienUsd),
	p50Ms: giay((n) => n.p50Ms),
	p90Ms: giay((n) => n.p90Ms),
} satisfies Record<HangId, DinhDang>;

const HANG_SAU_MA: HangId = "dongBiLoai";

type HangSo = { id: string; nhan: string; phu: boolean; dinhDang: DinhDang };

function soTheoMa(n: SoNac, ma: MaLoai): number {
	return n.theoMa.find((x) => x.maLoai === ma)?.so ?? 0;
}

function hangCua(soDo: SoDo, m: OkrSoanMessages): HangSo[] {
	const maCo = (Object.keys(m.soDo.maLoai) as MaLoai[]).filter(
		(ma) => soTheoMa(soDo.bat, ma) + soTheoMa(soDo.an, ma) > 0,
	);
	return (Object.keys(DINH_DANG) as HangId[]).flatMap((id) => [
		{ id, nhan: m.soDo.hang[id], phu: false, dinhDang: DINH_DANG[id] },
		...(id === HANG_SAU_MA
			? maCo.map((ma) => ({
					id: `ma-${ma}`,
					nhan: m.soDo.maLoai[ma],
					phu: true,
					dinhDang: so((n) => soTheoMa(n, ma)),
				}))
			: []),
	]);
}

function BangSo({ soDo, m }: { soDo: SoDo; m: OkrSoanMessages }) {
	const locale = useLocale();
	return (
		<div data-bang="so-do-soan">
			<SimpleTable
				surface="page"
				columns={[
					{ id: "so", header: m.soDo.cotSo },
					{
						id: "bat",
						header: m.soDo.nacTen.bat,
						width: "w-28",
						align: "right",
					},
					{ id: "an", header: m.soDo.nacTen.an, width: "w-28", align: "right" },
				]}
			>
				{hangCua(soDo, m).map((h) => (
					<SimpleTableRow key={h.id} sub={h.phu} data-so-do={h.id}>
						<SimpleTableCell data-cot="nhan">{h.nhan}</SimpleTableCell>
						<SimpleTableCell numeric data-cot="bat">
							{h.dinhDang(soDo.bat, locale)}
						</SimpleTableCell>
						<SimpleTableCell numeric data-cot="an">
							{h.dinhDang(soDo.an, locale)}
						</SimpleTableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
		</div>
	);
}

function BangCuoc({
	cuoc,
	m,
	moCuoc,
}: {
	cuoc: CuocGanDay[];
	m: OkrSoanMessages;
	moCuoc: (id: string) => void;
}) {
	const locale = useLocale();
	const dem = new Intl.NumberFormat(locale);
	return (
		<div data-bang="cuoc-soan">
			<SimpleTable
				surface="page"
				columns={[
					{ id: "don-vi", header: m.soDo.cotDonVi },
					{ id: "nac", header: m.soDo.cotNac, width: "w-28" },
					{ id: "luot", header: m.soDo.cotLuot, width: "w-16", align: "right" },
					{ id: "dong", header: m.soDo.cotDong, width: "w-24", align: "right" },
					{
						id: "chi-phi",
						header: m.soDo.cotChiPhi,
						width: "w-24",
						align: "right",
					},
				]}
			>
				{cuoc.map((c) => (
					<SimpleTableRow
						key={c.id}
						clickable
						data-cuoc-soan={c.id}
						onClick={() => moCuoc(c.id)}
					>
						<SimpleTableCell>
							<Button
								variant="link"
								size="xs-wrap"
								data-nut="mo-cuoc"
								onClick={(event) => {
									event.stopPropagation();
									moCuoc(c.id);
								}}
							>
								<span translate="no">{c.tenDonVi}</span>
							</Button>
							<span
								className="block text-muted-foreground tabular-nums"
								data-ngay
							>
								{ngayThangVn(new Date(c.moLuc))}
							</span>
						</SimpleTableCell>
						<SimpleTableCell data-cot="nac">
							{m.soDo.nac[c.nac]}
						</SimpleTableCell>
						<SimpleTableCell numeric data-cot="luot">
							{dem.format(c.soLuot)}
						</SimpleTableCell>
						<SimpleTableCell numeric data-cot="dong">
							{dem.format(c.soDongNhan)}/{dem.format(c.soDongTong)}
						</SimpleTableCell>
						<SimpleTableCell numeric data-cot="chi-phi">
							{dinhDangTien(c.chiPhiUsd, locale)}
						</SimpleTableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
		</div>
	);
}

function chuDong(d: DongAn): string {
	if (d.loai === "can-chinh-moi") return d.tenDich;
	return d.giaTriCuoi ?? d.ten;
}

function DongNgan({ d, m }: { d: DongAn; m: OkrSoanMessages }) {
	const maBiLoai = d.trangThai === "bi-loai" ? d.maLoai : null;
	return (
		<Item size="sm" variant="outline" data-dong={d.id}>
			<ItemContent>
				<ItemDescription>{m.soDo.loaiDong[d.loai]}</ItemDescription>
				<ItemTitle translate="no">{chuDong(d)}</ItemTitle>
				<span className="flex items-center gap-2">
					<StatusIndicator
						size="sm"
						tone={maBiLoai ? "warning" : "neutral"}
						label={
							maBiLoai
								? m.soDo.biLoaiMa(m.soDo.maLoai[maBiLoai])
								: m.soDo.trangThai[d.trangThai]
						}
						data-trang-thai-dong
					/>
					{d.maLoai ? (
						<Badge variant="mono" translate="no" data-ma-loai>
							{d.maLoai}
						</Badge>
					) : null}
				</span>
			</ItemContent>
		</Item>
	);
}

function BangDaCat({ daCat, m }: { daCat: DaCat | null; m: OkrSoanMessages }) {
	const locale = useLocale();
	const dem = new Intl.NumberFormat(locale);
	const hang: { id: keyof DaCat; nhan: string; giaTri: string }[] = daCat
		? [
				{
					id: "buoc",
					nhan: m.soDo.daCat.buoc,
					giaTri: daCat.buoc.map((b) => m.soDo.daCat.tenBuoc[b]).join(" · "),
				},
				{
					id: "truocToken",
					nhan: m.soDo.daCat.truocToken,
					giaTri: dem.format(daCat.truocToken),
				},
				{
					id: "sauToken",
					nhan: m.soDo.daCat.sauToken,
					giaTri: dem.format(daCat.sauToken),
				},
				{
					id: "chienLuocCatKyTu",
					nhan: m.soDo.daCat.chienLuocCatKyTu,
					giaTri: dem.format(daCat.chienLuocCatKyTu),
				},
			]
		: [];
	return (
		<section className="flex flex-col gap-2" aria-label={m.soDo.daCat.tieuDe}>
			<SectionHeading level={4}>{m.soDo.daCat.tieuDe}</SectionHeading>
			{daCat ? (
				<div data-bang="da-cat">
					<SimpleTable
						surface="page"
						columns={[
							{ id: "nhan", header: m.soDo.cotSo },
							{ id: "gia-tri", header: m.soDo.daCat.cotGiaTri, align: "right" },
						]}
					>
						{hang.map((h) => (
							<SimpleTableRow key={h.id} data-da-cat={h.id}>
								<SimpleTableCell>{h.nhan}</SimpleTableCell>
								<SimpleTableCell numeric data-cot="gia-tri">
									{h.giaTri}
								</SimpleTableCell>
							</SimpleTableRow>
						))}
					</SimpleTable>
				</div>
			) : (
				<p className="text-muted-foreground" data-da-cat="khong">
					{m.soDo.daCat.khong}
				</p>
			)}
		</section>
	);
}

function NganCuoc({
	cuocSoanId,
	m,
	dong,
}: {
	cuocSoanId: string | null;
	m: OkrSoanMessages;
	dong: () => void;
}) {
	const locale = useLocale();
	const trpc = useTRPC();
	const an = useQuery(
		trpc.okr.soanAn.queryOptions(cuocSoanId ? { cuocSoanId } : skipToken),
	);
	const du = an.data;
	return (
		<Sheet
			open={cuocSoanId !== null}
			onOpenChange={(mo) => {
				if (!mo) dong();
			}}
		>
			<SheetContent side="right" size="md" data-ngan-cuoc={cuocSoanId ?? ""}>
				<SheetHeader>
					{du ? (
						<SheetTitle translate="no">{du.cuoc.tenDonVi}</SheetTitle>
					) : (
						<SheetTitle>{m.soDo.nganTieuDe}</SheetTitle>
					)}
					<SheetDescription>
						{du
							? `${m.soDo.nac[du.cuoc.nac]} · ${m.soDo.luot(String(du.cuoc.soLuot))} · ${dinhDangTien(du.cuoc.chiPhiUsd, locale)} · ${ngayThangVn(new Date(du.cuoc.moLuc))}`
							: null}
					</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<div className="flex flex-col gap-4 pb-4">
						{an.isError ? (
							<Empty data-trang-thai="loi">
								<EmptyHeader>
									<EmptyTitle>{m.soDo.loiCuoc}</EmptyTitle>
								</EmptyHeader>
								<EmptyContent>
									<Button
										variant="outline"
										size="sm"
										data-nut="thu-lai"
										onClick={() => void an.refetch()}
									>
										<Icon icon={Renew} data-icon="inline-start" />
										{m.soDo.thuLai}
									</Button>
								</EmptyContent>
							</Empty>
						) : !du ? (
							<div role="status" aria-busy="true">
								<Spinner />
							</div>
						) : (
							<>
								<p className="text-muted-foreground" data-ghi-chu>
									{m.soDo.ghiChu[du.cuoc.nac]}
								</p>
								{du.dong.length === 0 ? (
									<Empty data-trang-thai="cuoc-rong">
										<EmptyHeader>
											<EmptyTitle>{m.soDo.khongDong}</EmptyTitle>
										</EmptyHeader>
									</Empty>
								) : (
									<ItemGroup aria-label={m.soDo.banNhapCuoi}>
										{du.dong.map((d) => (
											<DongNgan key={d.id} d={d} m={m} />
										))}
									</ItemGroup>
								)}
								<BangDaCat daCat={du.daCat} m={m} />
							</>
						)}
					</div>
				</SheetBody>
			</SheetContent>
		</Sheet>
	);
}

function TheKhung({
	m,
	ky,
	busy,
	children,
}: {
	m: OkrSoanMessages;
	ky: ChuKy | null;
	busy?: boolean;
	children: ReactNode;
}) {
	return (
		<Card data-the="soan-so-do" aria-busy={busy || undefined}>
			<CardHeader>
				<CardTitle>
					{m.soDo.tieuDe}
					{ky ? (
						<>
							{" — "}
							<span translate="no">{ky.name}</span>
						</>
					) : null}
				</CardTitle>
				<CardDescription>{m.soDo.moTa}</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">{children}</CardContent>
		</Card>
	);
}

function TheRong({ m }: { m: OkrSoanMessages }) {
	return (
		<Empty data-trang-thai="rong">
			<EmptyHeader>
				<EmptyTitle>{m.soDo.rong}</EmptyTitle>
				<EmptyDescription>{m.soDo.rongMoTa}</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

export function TheSoanSoDo() {
	const m = okrSoanMessages(useLocale());
	const trpc = useTRPC();
	const cycles = useQuery(trpc.okr.cycles.queryOptions());
	const ky = kySoDoSoan(cycles.data);
	const soDo = useQuery(
		trpc.okr.soanSoDo.queryOptions(ky ? { cycleId: ky.id } : skipToken),
	);
	const [moId, setMoId] = useQueryState(THAM_SO_CUOC_SOAN, parseCuocSoan);
	const ngan = (
		<NganCuoc cuocSoanId={moId} m={m} dong={() => void setMoId(null)} />
	);

	if (cycles.isError || soDo.isError) {
		return (
			<TheKhung m={m} ky={ky}>
				<Empty data-trang-thai="loi">
					<EmptyHeader>
						<EmptyTitle>{m.soDo.loi}</EmptyTitle>
					</EmptyHeader>
					<EmptyContent>
						<Button
							variant="outline"
							size="sm"
							data-nut="thu-lai"
							onClick={() => {
								if (cycles.isError) void cycles.refetch();
								if (ky) void soDo.refetch();
							}}
						>
							<Icon icon={Renew} data-icon="inline-start" />
							{m.soDo.thuLai}
						</Button>
					</EmptyContent>
				</Empty>
			</TheKhung>
		);
	}

	if (cycles.data && !ky) {
		return (
			<TheKhung m={m} ky={null}>
				<TheRong m={m} />
			</TheKhung>
		);
	}

	if (!soDo.data) {
		return (
			<TheKhung m={m} ky={ky} busy>
				{HANG_CHO.map((hang) => (
					<Skeleton key={hang} className="h-6 w-full" />
				))}
			</TheKhung>
		);
	}

	if (soDo.data.bat.cuocMo + soDo.data.an.cuocMo === 0) {
		return (
			<TheKhung m={m} ky={ky}>
				<TheRong m={m} />
			</TheKhung>
		);
	}

	return (
		<>
			<TheKhung m={m} ky={ky}>
				<BangSo soDo={soDo.data} m={m} />
				{soDo.data.cuocGanDay.length > 0 ? (
					<BangCuoc
						cuoc={soDo.data.cuocGanDay}
						m={m}
						moCuoc={(id) => void setMoId(id)}
					/>
				) : null}
			</TheKhung>
			{ngan}
		</>
	);
}
