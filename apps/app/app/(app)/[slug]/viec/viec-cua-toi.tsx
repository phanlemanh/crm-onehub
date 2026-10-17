"use client";

import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { NHOM_VIEC, type NhomViec, VIEC } from "@crm/validation/viec";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { type ReactNode, useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { DaiDuAn } from "@/components/du-an/dai-du-an";
import { GanttCuaDuAn } from "@/components/du-an/gantt-cua-du-an";
import { OPhamVi } from "@/components/du-an/o-pham-vi";
import {
	type KieuXemViec,
	kieuXemCo,
	type PhamVi,
} from "@/components/du-an/pham-vi";
import { HopDuAn } from "@/components/du-an/tao-du-an";
import { TatCaDuAn } from "@/components/du-an/tat-ca-du-an";
import { usePhamVi } from "@/components/du-an/use-pham-vi";
import { BangCotViec } from "@/components/viec/bang-cot-viec";
import { BangViec } from "@/components/viec/bang-viec";
import { useMoGiaoViec } from "@/components/viec/giao-viec";
import { DongGapViec } from "@/components/viec/khoi-viec";
import { duAnMessages } from "@/lib/messages/du-an";
import { viecMessages } from "@/lib/messages/viec";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";

const DONG_CHO = Array.from({ length: VIEC.soDongCho }, (_, i) => `cho-${i}`);

const nhomParser = parseAsStringLiteral(NHOM_VIEC).withDefault("giao-cho-toi");

function ChoTai() {
	return (
		<div aria-busy="true" className="flex flex-col gap-3" data-viec-cho-tai="">
			<Skeleton className="h-8 w-80" />
			{DONG_CHO.map((khoa) => (
				<Skeleton className="h-10 w-full" key={khoa} />
			))}
		</div>
	);
}

function DanhSach({
	nhom,
	duAnId,
	onMoDuAn,
	hangDau,
}: {
	nhom: NhomViec;
	duAnId?: string;
	onMoDuAn?: (id: string) => void;
	hangDau: (dem: Record<NhomViec, number> | undefined) => ReactNode;
}) {
	const locale = useLocale();
	const m = viecMessages(locale);
	const g = duAnMessages(locale).gantt;
	const trpc = useTRPC();
	const moGiao = useMoGiaoViec();
	const q = useQuery({
		...trpc.viec.cuaToi.queryOptions({ nhom, duAnId }),
		placeholderData: (truoc) => truoc,
	});
	const [nhomDaTai, setNhomDaTai] = useState(nhom);
	if (q.data && !q.isPlaceholderData && nhomDaTai !== nhom) {
		setNhomDaTai(nhom);
	}
	const nhomHienThi = q.isPlaceholderData ? nhomDaTai : nhom;

	if (q.isPending) {
		return (
			<div className="flex flex-col gap-4">
				{duAnId ? hangDau(undefined) : null}
				<ChoTai />
			</div>
		);
	}
	const du = q.data;
	if (!du) {
		return (
			<div className="flex flex-col gap-4">
				{hangDau(undefined)}
				<VungTaiLoi
					dangTai={q.isFetching}
					moTa={m.loi.moTa}
					onThuLai={() => void q.refetch()}
					tieuDe={m.loi.tieuDe}
				/>
			</div>
		);
	}
	const rong = du.mo.length + du.soXong + du.soHuy === 0;
	return (
		<div aria-busy={q.isPlaceholderData} className="flex flex-col gap-4">
			{hangDau(du.demNhom)}
			{rong ? (
				<Empty border="solid">
					<EmptyHeader>
						<EmptyTitle>{duAnId ? g.rong : m.rong[nhomHienThi]}</EmptyTitle>
						<EmptyDescription>
							{duAnId ? g.rongMoTa : m.rong.moTa}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<Button onClick={moGiao} variant="outline">
							{m.trang.giaoViec}
						</Button>
					</EmptyContent>
				</Empty>
			) : (
				<>
					<BangViec
						batDau={Boolean(duAnId)}
						ds={du.mo}
						nhom={nhomHienThi}
						onMoDuAn={onMoDuAn}
					/>
					<div className="flex flex-wrap gap-2">
						<DongGapViec
							ds={du.daXong}
							nhan={dien(m.daXong, { n: du.soXong })}
						/>
						<DongGapViec ds={du.daHuy} nhan={dien(m.daHuy, { n: du.soHuy })} />
					</div>
				</>
			)}
		</div>
	);
}

export function ViecCuaToi() {
	const locale = useLocale();
	const m = viecMessages(locale);
	const d = duAnMessages(locale);
	const trpc = useTRPC();
	const { phamVi: phamViUrl, xem: xemUrl, chonPhamVi, chonXem } = usePhamVi();
	const [nhom, setNhom] = useQueryState(SEARCH_PARAM.viec.nhom, nhomParser);
	const [tao, setTao] = useState(false);
	const duAnId = phamViUrl.loai === "du-an" ? phamViUrl.id : null;
	const duAn = useQuery({
		...trpc.duAn.get.queryOptions({ id: duAnId ?? "" }),
		enabled: duAnId !== null,
		retry: false,
	});
	const maLoi = duAn.error?.data?.code;

	const khongThay = duAnId !== null && maLoi === "NOT_FOUND";
	const phamVi: PhamVi = khongThay ? { loai: "cua-toi" } : phamViUrl;
	const xem = khongThay && xemUrl === "gantt" ? "danh-sach" : xemUrl;

	const moDuAn = (id: string) => chonPhamVi({ loai: "du-an", id });

	const nhanXem = {
		gantt: d.gantt.nhanKieu,
		"danh-sach": m.bang.danhSach,
		bang: m.bang.bang,
	} satisfies Record<KieuXemViec, string>;

	const hangDau = (dem?: Record<NhomViec, number>) => (
		<div className="flex flex-col gap-3">
			{khongThay ? (
				<Alert data-pham-vi-khong-thay="">
					<AlertDescription>{d.phamVi.khongThay}</AlertDescription>
				</Alert>
			) : null}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex min-w-0 flex-wrap items-center gap-2">
					<OPhamVi
						onChon={(p) => chonPhamVi(p)}
						onTao={() => setTao(true)}
						phamVi={phamVi}
					/>
					{phamVi.loai === "cua-toi" ? (
						<ChipNhom dem={dem} nhom={nhom} onChon={(n) => void setNhom(n)} />
					) : null}
				</div>
				<ViewSwitch
					items={kieuXemCo(phamVi).map((k) => ({
						value: k,
						label: nhanXem[k],
					}))}
					label={m.bang.kieuXem}
					onValueChange={(v) => {
						const chon = kieuXemCo(phamVi).find((k) => k === v);
						if (chon) chonXem(chon);
					}}
					value={xem}
				/>
			</div>
		</div>
	);

	const hopTao = (
		<HopDuAn
			onOpenChange={setTao}
			onXong={(id) => {
				setTao(false);
				chonPhamVi({ loai: "du-an", id }, "gantt");
			}}
			open={tao}
		/>
	);

	if (phamVi.loai === "cua-toi") {
		return (
			<>
				{xem === "bang" ? (
					<div className="flex flex-col gap-4">
						<DemNhom hangDau={hangDau} nhom={nhom} />
						<BangCotViec
							nhom={nhom}
							onMoDuAn={moDuAn}
							onXemDanhSach={() => chonXem("danh-sach")}
						/>
					</div>
				) : (
					<DanhSach hangDau={hangDau} nhom={nhom} onMoDuAn={moDuAn} />
				)}
				{hopTao}
			</>
		);
	}

	if (phamVi.loai === "tat-ca") {
		return (
			<div className="flex flex-col gap-4">
				{hangDau()}
				{xem === "bang" ? (
					<BangCotViec
						nhom="toi-giao"
						onMoDuAn={moDuAn}
						onXemDanhSach={() => chonXem("danh-sach")}
						tatCaDuAn
					/>
				) : (
					<TatCaDuAn onChon={moDuAn} onTao={() => setTao(true)} />
				)}
				{hopTao}
			</div>
		);
	}

	const dai = duAn.data ? (
		<DaiDuAn duAn={duAn.data} onDaXoa={() => chonPhamVi({ loai: "tat-ca" })} />
	) : (
		<Skeleton className="h-16 w-full" />
	);

	return (
		<div className="flex flex-col gap-4">
			{xem === "danh-sach" ? null : hangDau()}
			{xem === "danh-sach" ? null : dai}
			{xem === "gantt" ? <GanttCuaDuAn duAnId={phamVi.id} /> : null}
			{xem === "bang" ? (
				<BangCotViec
					duAnId={phamVi.id}
					nhom="toi-giao"
					onXemDanhSach={() => chonXem("danh-sach")}
				/>
			) : null}
			{xem === "danh-sach" ? (
				<DanhSach
					duAnId={phamVi.id}
					hangDau={() => (
						<>
							{hangDau()}
							{dai}
						</>
					)}
					nhom="toi-giao"
				/>
			) : null}
			{hopTao}
		</div>
	);
}

function DemNhom({
	nhom,
	hangDau,
}: {
	nhom: NhomViec;
	hangDau: (dem?: Record<NhomViec, number>) => ReactNode;
}) {
	const trpc = useTRPC();
	const q = useQuery({
		...trpc.viec.cuaToi.queryOptions({ nhom }),
		placeholderData: (truoc) => truoc,
	});
	return hangDau(q.data?.demNhom);
}

function ChipNhom({
	nhom,
	dem,
	onChon,
}: {
	nhom: NhomViec;
	dem: Record<NhomViec, number> | undefined;
	onChon: (nhom: NhomViec) => void;
}) {
	const m = viecMessages(useLocale());
	return (
		<div className="max-w-full overflow-x-auto">
			<ToggleGroup
				onValueChange={(v) => {
					const chon = NHOM_VIEC.find((n) => n === v);
					if (chon) onChon(chon);
				}}
				size="sm"
				type="single"
				value={nhom}
				variant="outline"
			>
				{NHOM_VIEC.map((n) => (
					<ToggleGroupItem
						count={dem ? dem[n] : undefined}
						data-nhom={n}
						key={n}
						value={n}
					>
						{m.nhom[n]}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}
