"use client";

import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import Information from "@carbon/icons-react/es/Information";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	MarkdownReader,
	ReaderToc,
	readerHeadings,
} from "@crm/ui/components/markdown-reader";
import { Separator } from "@crm/ui/components/separator";
import type { DangCho, LoaiTrang } from "@crm/validation/tai-lieu";
import Link from "next/link";
import { useMemo } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import {
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { taiLieuLichSuMessages } from "@/lib/messages/tai-lieu-lich-su";
import {
	duongDanhSach,
	duongDeXuat,
	duongLichSu,
	duongNguon,
	duongSuaTrang,
	ngayTaiLieu,
} from "@/lib/tai-lieu-man";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { DatXacMinh } from "./dat-xac-minh";
import {
	DaiDaLuuTru,
	HuyHieuLuuTruCho,
	type LuuTruTrang,
	MenuTrang,
} from "./luu-tru-trang";
import { type NguonCuaTrang, NguonTrang } from "./nguon-trang";
import { NhacToi } from "./nhac-toi";

export type NguonCho = { id: string; tenTep: string; lyDo: string | null };

export type ChoLanDau = { dangCho: DangCho; nguon: NguonCho | null };

const CO_VIET_TAY = {
	duyet: false,
	"may-soan": false,
	"go-tay": true,
	loi: true,
	"tra-lai": true,
	"chua-co-ban": true,
} satisfies Record<DangCho, boolean>;

const CO_XEM_NGUON = {
	duyet: false,
	"may-soan": true,
	"go-tay": true,
	loi: true,
	"tra-lai": false,
	"chua-co-ban": false,
} satisfies Record<DangCho, boolean>;

export type TrangDoc = {
	slug: string;
	ten: string;
	loai: LoaiTrang;
	chuTrang: string;
	donVi: string | null;
	phienBan: { so: number; duyetLuc: string } | null;
	noiDung: string;
	choLanDau: ChoLanDau | null;
	soBanCho: number;
	deXuatChoId: string | null;
	nguon: NguonCuaTrang | null;
	xacMinh?: XacMinhTrang;
	luuTru?: LuuTruTrang;
};

const CHUA_LUU_TRU: LuuTruTrang = {
	daLuuTru: null,
	coLuuTruCho: false,
	coKhoiPhucCho: false,
};

export type XacMinhTrang = {
	den: string | null;
	quaHan: boolean;
	coQuyen: boolean;
};

export function ManDoc({ trang }: { trang: TrangDoc }) {
	const locale = useLocale();
	const m = taiLieuMessages(locale);
	const d = m.doc;
	const url = useWorkspaceUrl();
	const mucLuc = useMemo(() => readerHeadings(trang.noiDung), [trang.noiDung]);
	const nutLichSu = taiLieuLichSuMessages(locale).lichSu.nut;
	const luuTru = trang.luuTru ?? CHUA_LUU_TRU;
	const daLuuTru = luuTru.daLuuTru !== null;

	return (
		<>
			<PageShellHeader
				breadcrumb={
					<div>
						<Button asChild size="sm" variant="ghost">
							<Link href={url(duongDanhSach())}>
								<Icon icon={ArrowLeft} />
								{d.veDanhSach}
							</Link>
						</Button>
					</div>
				}
			>
				<PageShellHeading>
					<PageShellTitle translate="no">{trang.ten}</PageShellTitle>
					<PageShellDescription>
						{m.loai[trang.loai]} ·{" "}
						<span data-phien-ban="">
							{trang.phienBan
								? dien(d.phienBan, {
										so: trang.phienBan.so,
										ngay: ngayTaiLieu(trang.phienBan.duyetLuc, locale),
									})
								: d.chuaCoPhienBan}
						</span>
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<div
					className="flex min-w-0 flex-col gap-6 xl:flex-row"
					data-man-doc={trang.slug}
				>
					<article className="flex min-w-0 max-w-3xl flex-1 flex-col gap-4">
						{trang.choLanDau ? (
							<KhungCho cho={trang.choLanDau} chuTrang={trang.chuTrang} />
						) : null}
						<DaiDaLuuTru luuTru={luuTru} slug={trang.slug} />
						<div className="flex flex-wrap items-center gap-2">
							<HuyHieuLuuTruCho luuTru={luuTru} />
							{trang.soBanCho > 0 ? (
								<Badge data-co-ban-cho="" variant="outline">
									{dien(d.coBanCho, { so: trang.soBanCho })}
								</Badge>
							) : null}
							{trang.choLanDau || daLuuTru ? null : (
								<Button asChild size="sm" variant="outline">
									<Link href={url(duongSuaTrang(trang.slug))}>
										{d.suaTrang}
									</Link>
								</Button>
							)}
							{trang.phienBan ? (
								<Button asChild size="sm" variant="outline">
									<Link data-nut-lich-su="" href={url(duongLichSu(trang.slug))}>
										{nutLichSu}
									</Link>
								</Button>
							) : null}
							{trang.phienBan ? (
								<MenuTrang luuTru={luuTru} slug={trang.slug} />
							) : null}
							{trang.choLanDau && CO_VIET_TAY[trang.choLanDau.dangCho] ? (
								<Button asChild size="sm" variant="outline">
									<Link href={url(duongSuaTrang(trang.slug))}>{d.vietTay}</Link>
								</Button>
							) : null}
							{trang.choLanDau?.nguon &&
							CO_XEM_NGUON[trang.choLanDau.dangCho] ? (
								<Button asChild size="sm" variant="ghost">
									<Link href={url(duongNguon(trang.choLanDau.nguon.id))}>
										{d.xemNguon}
									</Link>
								</Button>
							) : null}
							{trang.xacMinh ? (
								<DongXacMinh slug={trang.slug} xacMinh={trang.xacMinh} />
							) : null}
							{trang.deXuatChoId ? (
								<Button asChild size="sm" variant="ghost">
									<Link href={url(duongDeXuat(trang.deXuatChoId))}>
										{d.xemBanCho}
									</Link>
								</Button>
							) : null}
						</div>
						{trang.choLanDau ? null : (
							<>
								<Separator />
								<div translate="no">
									<MarkdownReader
										calloutLabels={{
											note: d.ghiChu.note,
											tip: d.ghiChu.tip,
											important: d.ghiChu.important,
											warning: d.ghiChu.warning,
											caution: d.ghiChu.caution,
										}}
										missingLabel={d.chuaCoTrang}
										sourceBackLabel={d.veChoTrich}
										sourcesLabel={d.nguon}
									>
										{trang.noiDung}
									</MarkdownReader>
								</div>
							</>
						)}
						{trang.choLanDau ? null : <NhacToi slug={trang.slug} />}
					</article>
					<aside className="flex w-full shrink-0 flex-col gap-5 xl:sticky xl:top-4 xl:w-72 xl:self-start">
						<ReaderToc headings={mucLuc} label={d.mucLuc} />
						<section className="flex flex-col gap-1" data-chu-trang="">
							<p className="font-medium text-sm">{d.chuTrang}</p>
							<p className="text-sm" translate="no">
								{trang.chuTrang}
							</p>
							{trang.donVi ? (
								<p className="text-muted-foreground text-xs" translate="no">
									{trang.donVi}
								</p>
							) : null}
							<p className="text-muted-foreground text-xs">{d.chuTrangMoTa}</p>
						</section>
						{trang.nguon ? <NguonTrang nguon={trang.nguon} /> : null}
					</aside>
				</div>
			</PageShellContent>
		</>
	);
}

function DongXacMinh({
	slug,
	xacMinh,
}: {
	slug: string;
	xacMinh: XacMinhTrang;
}) {
	const locale = useLocale();
	const m = taiLieuMessages(locale).doc.xacMinh;
	return (
		<>
			{xacMinh.quaHan ? (
				<Badge data-xac-minh="qua-han" variant="outline">
					{m.quaHan}
				</Badge>
			) : xacMinh.den ? (
				<Badge data-xac-minh="den" variant="outline">
					{dien(m.den, { ngay: ngayTaiLieu(xacMinh.den, locale) })}
				</Badge>
			) : null}
			{xacMinh.coQuyen ? <DatXacMinh den={xacMinh.den} slug={slug} /> : null}
		</>
	);
}

function KhungCho({ cho, chuTrang }: { cho: ChoLanDau; chuTrang: string }) {
	const d = taiLieuMessages(useLocale()).doc;
	const loi = cho.dangCho === "loi" ? cho.nguon?.lyDo : null;
	return (
		<Alert data-cho-lan-dau={cho.dangCho} role="status">
			<Icon icon={Information} />
			<AlertTitle>{d.cho[cho.dangCho].tieuDe}</AlertTitle>
			<AlertDescription>
				<p translate="no">{dien(d.cho[cho.dangCho].than, { ten: chuTrang })}</p>
				{cho.nguon && CO_XEM_NGUON[cho.dangCho] ? (
					<p className="wrap-anywhere" translate="no">
						{loi
							? dien(d.nguonLyDo, { tep: cho.nguon.tenTep, lyDo: loi })
							: dien(d.nguonTep, { tep: cho.nguon.tenTep })}
					</p>
				) : null}
			</AlertDescription>
		</Alert>
	);
}
