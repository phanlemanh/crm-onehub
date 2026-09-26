"use client";

import ChartLine from "@carbon/icons-react/es/ChartLine";
import Renew from "@carbon/icons-react/es/Renew";
import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { TableCell } from "@crm/ui/components/table";
import { formatDay } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { CHI_SO_OKR, type DinhNghiaChiSo } from "@crm/validation/okr-chi-so";
import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CELL } from "@/app/(app)/[slug]/okr/kieu";
import { chuSo, hienPhamVi, KHOA_NGUON } from "@/app/(app)/[slug]/okr/nguon-so";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetHeader,
	DetailSheetSection,
	DetailSheetStat,
	DetailSheetStats,
} from "@/components/detail-sheet";
import { type OkrSoMessages, okrSoMessages } from "@/lib/messages/okr-so";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useNgaySo, useRecordStack } from "./record-stack";

type BanGhi = RouterOutputs["okr"]["banGhiChiSo"];
type LichSu = RouterOutputs["okr"]["lichSuSo"]["dong"];

const NGAY = /^\d{4}-\d{2}-\d{2}$/;

const KHUNG_TAI = ["mot", "hai", "ba"] as const;

function soCoDonVi(
	so: number,
	dn: DinhNghiaChiSo | null,
	s: OkrSoMessages,
	locale: Locale,
): string {
	const chu = chuSo(so, locale);
	return dn ? s.donVi[CHI_SO_OKR[dn.chiSo].donVi](chu) : chu;
}

function coKhoa(lanGhi: BanGhi["lanGhi"]) {
	const dem = new Map<string, number>();
	return lanGhi.map((l) => {
		const goc = `${l.ngay}:${l.giaTri}:${l.nguoi ?? ""}`;
		const lan = (dem.get(goc) ?? 0) + 1;
		dem.set(goc, lan);
		return { khoa: `${goc}:${lan}`, l };
	});
}

function ngayHien(ngay: string | null, locale: Locale) {
	return ngay ? formatDay(ngay, locale) : null;
}

function DinhNghia({ dl }: { dl: BanGhi }) {
	const locale = useLocale();
	const s = okrSoMessages(locale);
	const trpc = useTRPC();
	const cay = useQuery(trpc.org.tree.queryOptions());
	const dn = dl.dinhNghia;
	const khoang =
		dl.tu && dl.den
			? s.trangThai.so.khoang(
					formatDay(dl.tu, locale),
					formatDay(dl.den, locale),
				)
			: null;
	if (!dn)
		return (
			<>
				{s.nguon[KHOA_NGUON[dl.loai]].nhan}
				{khoang ? ` · ${khoang}` : null}
			</>
		);
	const pv = hienPhamVi(dn.phamVi, cay.data, s);
	return (
		<span data-dinh-nghia>
			<span translate="no" data-ten-chi-so={dn.chiSo}>
				{s.chiSo[dn.chiSo].nhan}
				{dn.bac ? ` · ${s.bac[dn.bac].nhan}` : null}
			</span>
			{" · "}
			<span data-pham-vi={dn.phamVi.kieu}>
				{pv.nhan}
				{pv.ten ? (
					<>
						{" "}
						<span translate="no">{pv.ten}</span>
					</>
				) : null}
			</span>
			{khoang ? (
				<>
					{" · "}
					<span data-khoang>{khoang}</span>
				</>
			) : null}
		</span>
	);
}

function SoDaChup({ dl }: { dl: BanGhi }) {
	const locale = useLocale();
	const s = okrSoMessages(locale);
	return (
		<DetailSheetStats>
			<DetailSheetStat label={s.nguon[KHOA_NGUON[dl.loai]].nhan}>
				{dl.soDaChup !== null && dl.ngay ? (
					<span
						className="tabular-nums"
						data-so-da-chup={dl.soDaChup}
						data-ngay-chup={dl.ngay}
					>
						{s.trangThai.so.daChup(
							soCoDonVi(dl.soDaChup, dl.dinhNghia, s, locale),
							formatDay(dl.ngay, locale),
						)}
					</span>
				) : (
					<EmptyCellValue />
				)}
			</DetailSheetStat>
		</DetailSheetStats>
	);
}

function BangBanGhi({
	dl,
	dong,
	con,
	dangTai,
	xemThem,
}: {
	dl: BanGhi;
	dong: BanGhi["dong"];
	con: boolean;
	dangTai: boolean;
	xemThem: () => void;
}) {
	const locale = useLocale();
	const s = okrSoMessages(locale);
	const t = s.trangThai.so;
	const { open } = useRecordStack();
	const dn = dl.dinhNghia;

	if (dn && dong.length === 0)
		return (
			<div className="contents" data-trang-thai="ST-so-rong">
				<DetailSheetEmpty
					icon={ChartLine}
					title={s.chiSo[dn.chiSo].rong}
					description={s.chiSo[dn.chiSo].dinhNghia}
				/>
			</div>
		);

	const cot: SimpleTableColumn[] = [
		{ id: "banGhi", header: t.cotBanGhi },
		{ id: "ngay", header: t.cotNgay, width: "w-36" },
	];

	return (
		<DetailSheetSection title={t.banGhi}>
			<SimpleTable columns={cot}>
				{dong.map((d) => (
					<SimpleTableRow
						key={`${d.loai}:${d.id}`}
						data-ban-ghi={d.id}
						data-loai-ban-ghi={d.loai}
					>
						<TableCell className={CELL}>
							{d.moRef ? (
								<Button
									variant="link"
									size="xs"
									data-mo-ban-ghi={`${d.moRef.kind}:${d.moRef.id}`}
									onClick={() => {
										if (d.moRef) open(d.moRef);
									}}
								>
									<span className="truncate" translate="no">
										{d.ten}
									</span>
								</Button>
							) : (
								<span className="whitespace-normal" translate="no">
									{d.ten}
								</span>
							)}
						</TableCell>
						<TableCell className={`${CELL} tabular-nums`}>
							{ngayHien(d.ngay, locale) ?? <EmptyCellValue />}
						</TableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
			{con ? (
				<Button
					variant="outline"
					size="sm"
					data-nut="xem-them"
					disabled={dangTai}
					onClick={xemThem}
				>
					{t.xemThem}
				</Button>
			) : null}
		</DetailSheetSection>
	);
}

function BangLanGhi({
	lanGhi,
	con,
	dangTai,
	xemThem,
}: {
	lanGhi: BanGhi["lanGhi"];
	con: boolean;
	dangTai: boolean;
	xemThem: () => void;
}) {
	const locale = useLocale();
	const t = okrSoMessages(locale).trangThai.so;

	if (lanGhi.length === 0)
		return (
			<DetailSheetEmpty
				icon={ChartLine}
				title={t.chuaGhi}
				description={t.lanGhi}
			/>
		);

	const cot: SimpleTableColumn[] = [
		{ id: "ngay", header: t.cotNgay, width: "w-36" },
		{ id: "so", header: t.cotSo, width: "w-32", align: "right" },
		{ id: "nguoi", header: t.cotNguoiCamKhoa },
	];

	return (
		<DetailSheetSection title={t.lanGhi}>
			<SimpleTable columns={cot}>
				{coKhoa(lanGhi).map(({ khoa, l }) => (
					<SimpleTableRow key={khoa} data-lan-ghi={l.ngay}>
						<TableCell className={`${CELL} tabular-nums`}>
							{formatDay(l.ngay, locale)}
						</TableCell>
						<TableCell className={`${CELL} text-right tabular-nums`}>
							{chuSo(l.giaTri, locale)}
						</TableCell>
						<TableCell className={CELL}>
							{l.nguoi ? (
								<span translate="no">{l.nguoi}</span>
							) : (
								<EmptyCellValue />
							)}
						</TableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
			{con ? (
				<Button
					variant="outline"
					size="sm"
					data-nut="xem-them"
					disabled={dangTai}
					onClick={xemThem}
				>
					{t.xemThem}
				</Button>
			) : null}
		</DetailSheetSection>
	);
}

function BangLichSu({
	dong,
	dangChon,
	chon,
	dn,
}: {
	dong: LichSu;
	dangChon: string | null;
	chon: (ngay: string) => void;
	dn: DinhNghiaChiSo | null;
}) {
	const locale = useLocale();
	const s = okrSoMessages(locale);
	const t = s.trangThai.so;
	const moiNgay = dong.filter(
		(d, i) => dong.findIndex((x) => x.ngay === d.ngay) === i,
	);
	if (moiNgay.length === 0) return null;

	const cot: SimpleTableColumn[] = [
		{ id: "ngay", header: t.cotNgay, width: "w-40" },
		{ id: "so", header: t.cotSo, align: "right" },
	];

	return (
		<DetailSheetSection title={t.lichSu}>
			<SimpleTable columns={cot}>
				{moiNgay.map((d) => {
					const la = d.ngay === dangChon;
					return (
						<SimpleTableRow
							key={d.ngay}
							data-lich-su-ngay={d.ngay}
							data-chon={la ? "" : undefined}
						>
							<TableCell className={CELL}>
								<Button
									variant="link"
									size="xs"
									aria-pressed={la}
									data-chon-ngay={d.ngay}
									onClick={() => chon(d.ngay)}
								>
									{formatDay(d.ngay, locale)}
								</Button>
							</TableCell>
							<TableCell className={`${CELL} text-right tabular-nums`}>
								{soCoDonVi(d.giaTri, dn, s, locale)}
							</TableCell>
						</SimpleTableRow>
					);
				})}
			</SimpleTable>
		</DetailSheetSection>
	);
}

export function SoKrSheet({ keyResultId }: { keyResultId: string }) {
	const locale = useLocale();
	const s = okrSoMessages(locale);
	const t = s.trangThai.so;
	const trpc = useTRPC();
	const { stack, close, closeAll } = useRecordStack();
	const { ngay: ngayUrl, chon } = useNgaySo();
	const ngay = ngayUrl && NGAY.test(ngayUrl) ? ngayUrl : undefined;
	const [trang, setTrang] = useState({ ngay, so: 1 });
	const soTrang = trang.ngay === ngay ? trang.so : 1;

	const trangs = useQueries({
		queries: Array.from({ length: soTrang }, (_, i) => ({
			...trpc.okr.banGhiChiSo.queryOptions({
				keyResultId,
				ngay,
				trang: i + 1,
			}),
			placeholderData: keepPreviousData,
		})),
	});
	const lichSu = useQuery(trpc.okr.lichSuSo.queryOptions({ keyResultId }));

	const dau = trangs[0];
	const dl = dau?.data;
	const loi = dau?.error ?? lichSu.error;
	const dangTai = trangs.some((q) => q.isFetching);
	const dong = trangs.flatMap((q) => q.data?.dong ?? []);
	const lanGhi = trangs.flatMap((q) => q.data?.lanGhi ?? []);
	const xemThem = () => setTrang({ ngay, so: soTrang + 1 });
	const thuLai = () => {
		for (const q of trangs) if (q.isError) void q.refetch();
		if (lichSu.isError) void lichSu.refetch();
	};

	const trangThai = loi
		? "ST-so-loi"
		: !dl || lichSu.isPending
			? "ST-so-dangtai"
			: dl.loai === "api"
				? "ST-so-api"
				: "ST-so-co";

	return (
		<div
			className="contents"
			data-so-kr-sheet={keyResultId}
			data-trang-thai={trangThai}
			data-ngay-so={ngay}
			data-dang-tai={dangTai ? "" : undefined}
		>
			<DetailSheetHeader
				title={dl ? <span translate="no">{dl.tenKr}</span> : t.tieuDe}
				description={dl ? <DinhNghia dl={dl} /> : undefined}
				onBack={stack.length > 1 ? close : undefined}
				onClose={closeAll}
			/>
			{loi ? (
				<DetailSheetEmpty
					icon={ChartLine}
					title={t.loi}
					description={loi.message}
					action={
						<Button variant="outline" data-nut="thu-lai" onClick={thuLai}>
							<Icon data-icon="inline-start" icon={Renew} />
							{s.thuLai}
						</Button>
					}
				/>
			) : !dl || lichSu.isPending ? (
				<DetailSheetBody>
					<DetailSheetSection>
						<div aria-busy="true" className="flex flex-col gap-3">
							<span className="sr-only" role="status">
								{t.dangTai}
							</span>
							{KHUNG_TAI.map((id) => (
								<div className="flex flex-col gap-2" key={id}>
									<Skeleton className="h-4 w-1/3" />
									<Skeleton className="h-8 w-full" />
								</div>
							))}
						</div>
					</DetailSheetSection>
				</DetailSheetBody>
			) : (
				<>
					<SoDaChup dl={dl} />
					<DetailSheetBody>
						{dl.lech && dl.soDaChup !== null && dl.soTinhLai !== null ? (
							<DetailSheetSection>
								<Alert
									variant="warning"
									data-trang-thai="ST-so-lech"
									data-so-tinh-lai={dl.soTinhLai}
								>
									<AlertDescription>
										{t.lech(
											chuSo(dl.soDaChup, locale),
											chuSo(dl.soTinhLai, locale),
										)}
									</AlertDescription>
								</Alert>
							</DetailSheetSection>
						) : null}
						{dl.loai === "api" ? (
							<BangLanGhi
								lanGhi={lanGhi}
								con={lanGhi.length < dl.tong}
								dangTai={dangTai}
								xemThem={xemThem}
							/>
						) : (
							<>
								{dl.dinhNghia ? (
									<BangBanGhi
										dl={dl}
										dong={dong}
										con={dong.length < dl.tong}
										dangTai={dangTai}
										xemThem={xemThem}
									/>
								) : null}
								<BangLichSu
									dong={lichSu.data?.dong ?? []}
									dangChon={ngay ?? dl.ngay}
									chon={chon}
									dn={dl.dinhNghia}
								/>
							</>
						)}
					</DetailSheetBody>
				</>
			)}
		</div>
	);
}
