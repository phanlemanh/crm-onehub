"use client";

import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { ItemGroup } from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { TablePagination } from "@crm/ui/components/table-pagination";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { PHAM_VI_BO, type PhamViBo } from "@crm/validation/okr-tham-so";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";
import { useMoNganKr } from "@/components/crm/record-sheet/dien-bien-kr";
import { okrCapNhatGanDayMessages } from "@/lib/messages/okr-cap-nhat-gan-day";
import { okrVoKhuMessages } from "@/lib/messages/okr-vo-khu";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useChuKy } from "../chon-chu-ky";
import { ChuaChuKy } from "../trang-thai-okr";
import { DongTin } from "./dong-tin";
import { capNhatGanDayParsers, trangHopLe } from "./tham-so";

type CapNhatGanDayOutput = RouterOutputs["okr"]["capNhatGanDay"];

const P = SEARCH_PARAM.okr;
const KHUNG_CHO = ["mot", "hai", "ba", "bon"] as const;

function DangCho() {
	return (
		<div
			aria-busy="true"
			className="flex flex-col gap-3"
			data-trang-thai="ST-cng-cho"
		>
			{KHUNG_CHO.map((k) => (
				<Skeleton className="h-28 w-full" key={k} />
			))}
		</div>
	);
}

function Loi({ thuLai, dangTai }: { thuLai: () => void; dangTai: boolean }) {
	const m = okrCapNhatGanDayMessages(useLocale());
	return (
		<VungTaiLoi
			dangTai={dangTai}
			data-trang-thai="ST-cng-loi"
			moTa={m.loi.moTa}
			onThuLai={thuLai}
			tieuDe={m.loi.tieuDe}
		/>
	);
}

function ChipPhamVi({
	chon,
	dem,
	doi,
}: {
	chon: PhamViBo;
	dem: CapNhatGanDayOutput["facetCounts"]["phamVi"];
	doi: (v: PhamViBo) => void;
}) {
	const locale = useLocale();
	const m = okrCapNhatGanDayMessages(locale);
	const nhan = okrVoKhuMessages(locale).boOkr.loc;
	const so = (v: PhamViBo) => dem.find((d) => d.value === v)?.count ?? 0;
	return (
		<div className="max-w-full overflow-x-auto" data-loc-pham-vi="">
			<ToggleGroup
				aria-label={m.locPhamVi}
				onValueChange={(v) => {
					const moi = PHAM_VI_BO.find((p) => p === v);
					if (moi) doi(moi);
				}}
				size="sm"
				type="single"
				value={chon}
				variant="outline"
			>
				{PHAM_VI_BO.map((p) => (
					<ToggleGroupItem count={so(p)} data-pham-vi={p} key={p} value={p}>
						{nhan[p]}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);
}

function RongCaChuKy() {
	const m = okrCapNhatGanDayMessages(useLocale());
	return (
		<Empty data-trang-thai="ST-cng-rong">
			<EmptyHeader>
				<EmptyTitle>{m.rong.tieuDe}</EmptyTitle>
				<EmptyDescription>{m.rong.moTa}</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

function RongTheoChip({
	chip,
	veTatCa,
}: {
	chip: PhamViBo;
	veTatCa: () => void;
}) {
	const locale = useLocale();
	const m = okrCapNhatGanDayMessages(locale);
	const nhan = okrVoKhuMessages(locale).boOkr.loc;
	return (
		<Empty data-trang-thai="ST-cng-rongloc">
			<EmptyHeader>
				<EmptyTitle>{m.rongLoc.tieuDe(nhan[chip])}</EmptyTitle>
				<EmptyDescription>{m.rongLoc.moTa}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button data-ve-tat-ca="" onClick={veTatCa} size="sm" variant="outline">
					{m.rongLoc.nut}
				</Button>
			</EmptyContent>
		</Empty>
	);
}

function DongTinChuKy({ cycleId }: { cycleId: string }) {
	const trpc = useTRPC();
	const moNganKr = useMoNganKr();
	const [thamSo, datThamSo] = useQueryStates(capNhatGanDayParsers);
	const phamVi = thamSo[P.phamViBo];
	const trang = trangHopLe(thamSo[P.trangCapNhat]);
	const ds = useQuery({
		...trpc.okr.capNhatGanDay.queryOptions({ cycleId, phamVi, trang }),
		placeholderData: keepPreviousData,
	});
	const doiChip = (v: PhamViBo) =>
		void datThamSo({
			[P.phamViBo]: v === "tat-ca" ? null : v,
			[P.trangCapNhat]: null,
		});
	if (ds.isError)
		return <Loi dangTai={ds.isFetching} thuLai={() => void ds.refetch()} />;
	if (ds.isPending) return <DangCho />;
	const { rows, total, coTrang, facetCounts } = ds.data;
	const tatCa =
		facetCounts.phamVi.find((p) => p.value === "tat-ca")?.count ?? 0;
	if (tatCa === 0) return <RongCaChuKy />;
	return (
		<div
			className="flex min-w-0 flex-col gap-4"
			data-trang-thai={total > 0 ? "ST-cng-codulieu" : undefined}
		>
			<ChipPhamVi chon={phamVi} dem={facetCounts.phamVi} doi={doiChip} />
			{total === 0 ? (
				<RongTheoChip chip={phamVi} veTatCa={() => doiChip("tat-ca")} />
			) : (
				<>
					<ItemGroup data-dong-tin-ds="">
						{rows.map((d) => (
							<DongTin
								dong={d}
								key={d.checkInId}
								onMoKr={(id) => moNganKr(id)}
							/>
						))}
					</ItemGroup>
					<TablePagination
						loading={ds.isFetching}
						onPageChange={(t) =>
							void datThamSo({ [P.trangCapNhat]: t === 1 ? null : t })
						}
						page={trang}
						pageSize={coTrang}
						total={total}
						totalPages={Math.max(1, Math.ceil(total / coTrang))}
					/>
				</>
			)}
		</div>
	);
}

function useVeTrangDauKhiDoiChuKy(currentId: string | null) {
	const [, datThamSo] = useQueryStates(capNhatGanDayParsers);
	const truoc = useRef(currentId);
	useEffect(() => {
		if (truoc.current !== null && truoc.current !== currentId)
			void datThamSo({ [P.trangCapNhat]: null });
		truoc.current = currentId;
	}, [currentId, datThamSo]);
}

export function CapNhatGanDay() {
	const trpc = useTRPC();
	const { cycles, currentId } = useChuKy();
	const access = useQuery(trpc.okr.access.queryOptions());
	useVeTrangDauKhiDoiChuKy(currentId);
	if (access.isError || cycles.isError)
		return (
			<Loi
				dangTai={access.isFetching || cycles.isFetching}
				thuLai={() => {
					if (access.isError) void access.refetch();
					if (cycles.isError) void cycles.refetch();
				}}
			/>
		);
	if (access.isPending || cycles.isPending) return <DangCho />;
	if (currentId === null)
		return (
			<div data-trang-thai="ST-cng-chuachuky">
				<ChuaChuKy quanTri={access.data?.canManageProgram === true} />
			</div>
		);
	return <DongTinChuKy cycleId={currentId} key={currentId} />;
}
