"use client";

import { Badge } from "@crm/ui/components/badge";
import { Card, CardContent } from "@crm/ui/components/card";
import { Empty, EmptyDescription } from "@crm/ui/components/empty";
import { KaraTrace } from "@crm/ui/components/kara";
import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { TreeNav, type TreeNavNode } from "@crm/ui/components/tree-nav";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { NGHIA_MUC_TIN } from "@/components/crm/record-sheet/ly-do-noi-gop";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { NhanGioiHan } from "@/components/okr/nhan-gioi-han";
import { okrMessages } from "@/lib/messages/okr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import type { RouterOutputs } from "@/lib/trpc/types";
import {
	LOC_MUC_TIN_CAY,
	type LocMucTinCay,
	parseAsMucTinCay,
} from "./okr-search-params";
import { NhanTinhTrang, ThanhTienDo } from "./tien-do-kr";

export type NutDayDu = RouterOutputs["okr"]["cayCanChinh"]["roots"][number];
export type CanhCay = RouterOutputs["okr"]["cayCanChinh"]["canh"][number];

type DuLieuNut =
	| { loai: "nut"; nut: NutDayDu; canh: CanhCay | null }
	| { loai: "nhom" };

const NHOM_CHUA = "chua-can-chinh";

const khoaCanh = (tu: string, den: string) => `${tu}>${den}`;

function dung(
	ds: NutDayDu[],
	cha: string,
	idCha: string | null,
	canh: ReadonlyMap<string, CanhCay>,
): TreeNavNode<DuLieuNut>[] {
	return ds.map((nut, i) => {
		const id = `${cha}/${nut.id}-${i}`;
		const cuaNut =
			nut.loai === "muc-tieu" && idCha !== null
				? (canh.get(khoaCanh(nut.objectiveId, idCha)) ?? null)
				: null;
		return {
			id,
			name: nut.title,
			data: { loai: "nut", nut, canh: cuaNut },
			children: dung(nut.children, id, nut.id, canh),
		};
	});
}

function cat(
	ds: TreeNavNode<DuLieuNut>[],
	loc: LocMucTinCay,
): TreeNavNode<DuLieuNut>[] {
	return ds.flatMap((n) => {
		const con = cat(n.children ?? [], loc);
		const khop = n.data.loai === "nut" && n.data.canh?.mucTin === loc;
		return khop || con.length > 0 ? [{ ...n, children: con }] : [];
	});
}

function LyDoNut({ canh }: { canh: CanhCay }) {
	if (!canh.lyDo) return null;
	return (
		<span className="whitespace-normal break-words text-xs" data-ly-do-canh>
			<span data-ly-do-cau translate="no">
				{canh.lyDo}
			</span>
			{canh.lyDoTuKara ? (
				<>
					{" "}
					<KaraTrace />
				</>
			) : null}
		</span>
	);
}

function moHet(ds: TreeNavNode<DuLieuNut>[]): string[] {
	return ds.flatMap((n) =>
		(n.children?.length ?? 0) > 0 ? [n.id, ...moHet(n.children ?? [])] : [],
	);
}

function NhanNut({ nut, canh }: { nut: NutDayDu; canh: CanhCay | null }) {
	const m = okrMessages(useLocale());
	const mt = okrToanCanhMessages(useLocale());
	const laKr = nut.loai === "kr";
	return (
		<span
			className="flex w-full min-w-0 items-start gap-4 py-0.5"
			data-nut-can-chinh={nut.id}
		>
			<span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
				<span
					className={
						laKr || nut.lapLai
							? "whitespace-normal text-muted-foreground"
							: "whitespace-normal font-medium"
					}
					translate="no"
				>
					{laKr ? `${m.cot.kr} · ${nut.title}` : nut.title}
				</span>
				{laKr ? null : (
					<span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
						<span translate="no">{nut.unitName}</span>
						{nut.hienThi === "gioi-han" ? (
							<NhanGioiHan
								focusable={false}
								moHop={null}
								soNguoiXem={nut.soNguoiXem}
							/>
						) : null}
						{nut.gop > 1 ? (
							<Badge variant="outline">{m.gopVao(nut.gop)}</Badge>
						) : null}
						{nut.lapLai ? <span>{mt.cay.cungHien}</span> : null}
						{canh ? (
							<StatusIndicator
								data-muc-tin={canh.mucTin}
								label={m.sheet.mucTin[canh.mucTin]}
								size="sm"
								tone={toneTheoNghia(NGHIA_MUC_TIN[canh.mucTin])}
							/>
						) : null}
					</span>
				)}
				{canh ? <LyDoNut canh={canh} /> : null}
			</span>
			<span className="hidden w-48 shrink-0 flex-col gap-1 sm:flex">
				<span className="flex items-center gap-2">
					<ThanhTienDo
						expected={nut.expected}
						progress={nut.progress}
						ten={nut.title}
					/>
					<span className="w-9 shrink-0 text-right text-xs tabular-nums">
						{nut.progress}%
					</span>
				</span>
				{laKr ? null : (
					<NhanTinhTrang
						expected={nut.expected}
						kind={nut.kind}
						progress={nut.progress}
					/>
				)}
			</span>
		</span>
	);
}

export function CayCanChinh({
	roots,
	chuaCanChinh,
	canh,
}: {
	roots: NutDayDu[];
	chuaCanChinh: NutDayDu[];
	canh: CanhCay[];
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const mt = okrToanCanhMessages(locale);
	const openRecord = useOpenRecord();
	const [loc, setLoc] = useQueryState(
		SEARCH_PARAM.okr.mucTinCay,
		parseAsMucTinCay,
	);
	const theoCap = new Map(canh.map((k) => [khoaCanh(k.tu, k.den), k]));
	const day: TreeNavNode<DuLieuNut>[] = [
		...dung(roots, "goc", null, theoCap),
		...(chuaCanChinh.length > 0
			? [
					{
						id: NHOM_CHUA,
						name: mt.cay.chuaCanChinh,
						data: { loai: "nhom" } as const,
						children: dung(chuaCanChinh, NHOM_CHUA, null, theoCap),
					},
				]
			: []),
	];
	const nodes =
		loc === "tat-ca"
			? day
			: cat(
					day.filter((n) => n.id !== NHOM_CHUA),
					loc,
				);
	const soCanh = (muc: LocMucTinCay) =>
		muc === "tat-ca"
			? canh.length
			: canh.filter((k) => k.mucTin === muc).length;
	const nhanLoc = (muc: LocMucTinCay) =>
		muc === "tat-ca" ? mt.cay.locTatCa : m.sheet.mucTin[muc];
	const [mo, setMo] = useState<string[]>(() => moHet(day));
	const theoKhoa = new Map<string, NutDayDu>();
	const ghi = (ds: TreeNavNode<DuLieuNut>[]) => {
		for (const n of ds) {
			if (n.data.loai === "nut") theoKhoa.set(n.id, n.data.nut);
			ghi(n.children ?? []);
		}
	};
	ghi(nodes);

	return (
		<Card>
			<CardContent>
				<div className="flex flex-col gap-3">
					<ToggleGroup
						aria-label={mt.cay.canChinh}
						onValueChange={(v) => {
							const moi = LOC_MUC_TIN_CAY.find((x) => x === v);
							if (moi) void setLoc(moi === "tat-ca" ? null : moi);
						}}
						size="sm"
						type="single"
						value={loc}
						variant="outline"
					>
						{LOC_MUC_TIN_CAY.map((muc) => (
							<ToggleGroupItem data-loc-muc-tin={muc} key={muc} value={muc}>
								<span data-nhan-loc>{nhanLoc(muc)}</span>
								<span
									className="text-muted-foreground tabular-nums"
									data-so-loc
								>
									{soCanh(muc)}
								</span>
							</ToggleGroupItem>
						))}
					</ToggleGroup>
					{nodes.length === 0 ? (
						<Empty data-cay-loc-rong>
							<EmptyDescription>{mt.cay.locRong}</EmptyDescription>
						</Empty>
					) : (
						<TreeNav
							expanded={mo}
							itemAttrs={(n) => ({
								"data-cay-khoa": n.id,
								"data-cap-nut":
									n.data.loai === "nut" ? n.data.nut.loai : "nhom",
							})}
							label={mt.cay.canChinh}
							nodes={nodes}
							onExpandedChange={setMo}
							onSelect={(khoa) => {
								const nut = theoKhoa.get(khoa);
								if (nut) openRecord({ kind: "objective", id: nut.objectiveId });
							}}
							renderLabel={(n) =>
								n.data.loai === "nut" ? (
									<NhanNut canh={n.data.canh} nut={n.data.nut} />
								) : (
									<span className="text-muted-foreground text-xs">
										{n.name}
									</span>
								)
							}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
