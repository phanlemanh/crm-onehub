"use client";

import { Combobox } from "@crm/ui/components/combobox";
import {
	DataTable,
	type DataTableColumn,
	type DataTableTabs,
} from "@crm/ui/components/data-table";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import type { TableQueryState } from "@crm/ui/lib/table-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import type { KrMau, MucTieuMau } from "../ban-mau-okr/du-lieu";
import {
	giaTri,
	LoaiMucTieuNhan,
	TenNguoi,
	ThanhTienDo,
	TinhTrangKr,
	TuTin,
	tienDo,
	tinhTrang,
} from "../ban-mau-okr/phan-chung";
import {
	DON_VI,
	type DonViPhang,
	donVi,
	duongTrang,
	mucTieuCua,
	tienDoMucTieu,
} from "./du-lieu";

export type CachXem = "danh-sach" | "hop-tuan";

const CACH_XEM = [
	{ value: "danh-sach", label: "Danh sách" },
	{ value: "hop-tuan", label: "Họp tuần" },
];

function canBan(mt: MucTieuMau): boolean {
	return mt.kr.some(
		(k) =>
			k.tuTin === "thap" || tinhTrang(tienDo(k), mt.loai).tone !== "success",
	);
}

function chuaGop(dv: DonViPhang, mt: MucTieuMau): boolean {
	return dv.chaId !== null && mt.gopVao.length === 0;
}

function ChonDonVi({ dv, moSan }: { dv: DonViPhang; moSan: boolean }) {
	const router = useRouter();
	const daMo = useRef(false);
	const moMotLan = useCallback(
		(el: HTMLButtonElement | null) => {
			if (!moSan || !el || daMo.current) return;
			daMo.current = true;
			el.click();
		},
		[moSan],
	);
	return (
		<Combobox
			aria-label="Đơn vị"
			className="w-full sm:w-72"
			data-chon-don-vi
			empty="Không có đơn vị nào khớp."
			onValueChange={(id) => router.replace(duongTrang("ST-dh-don-vi", id))}
			options={DON_VI.map((d) => ({
				value: d.id,
				label: d.ten,
				hint: [
					d.duong.length > 0 ? d.duong.join(" › ") : "cả công ty",
					d.tt.mucTieu.length === 0 ? "chưa đặt" : null,
				]
					.filter((x) => x !== null)
					.join(" · "),
				keywords: d.duong,
			}))}
			ref={moMotLan}
			searchPlaceholder="Tìm đơn vị…"
			translate="no"
			value={dv.id}
		/>
	);
}

function DongDonVi({ dv }: { dv: DonViPhang }) {
	const t = dv.tt;
	return (
		<div
			className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm"
			data-dong-don-vi
		>
			{dv.truong ? (
				<span className="flex items-center gap-1.5">
					<span className="text-muted-foreground">Trưởng</span>
					<PersonAvatar name={dv.truong.ten} size="sm" />
					<span translate="no">{dv.truong.ten}</span>
				</span>
			) : (
				<StatusIndicator label="Chưa có trưởng" size="sm" tone="warning" />
			)}
			<span className="text-muted-foreground tabular-nums">
				{t.mucTieu.length} mục tiêu · {t.soKr} KR
				{t.tienDoTb === null ? "" : ` · trung bình ${t.tienDoTb}%`}
			</span>
			{dv.duong.length > 0 ? (
				<span className="text-muted-foreground" translate="no">
					Thuộc {dv.duong.join(" › ")}
				</span>
			) : null}
		</div>
	);
}

const TAB_LOC: DataTableTabs = {
	id: "loc",
	allLabel: "Tất cả",
	options: [
		{ value: "can-ban", label: "Cần bàn" },
		{ value: "chua-gop", label: "Chưa góp vào đâu" },
	],
};

const KHONG_LAM = () => {};

function useTruyVan(): TableQueryState {
	const [tab, setTab] = useState("all");
	return {
		sort: "",
		dir: "asc",
		page: 1,
		pageSize: 50,
		tab,
		tabId: TAB_LOC.id,
		filters: {},
		toggleSort: KHONG_LAM,
		setSort: KHONG_LAM,
		setDir: KHONG_LAM,
		setPage: async () => {},
		setTab,
		setFilter: KHONG_LAM,
	};
}

function TienDoO({
	nhan,
	p,
	giaTriChu,
}: {
	nhan: string;
	p: number;
	giaTriChu: string;
}) {
	return (
		<span className="flex items-center gap-2">
			<ThanhTienDo nhan={nhan} phanTram={p} />
			<span className="w-24 shrink-0 text-right text-xs tabular-nums">
				{giaTriChu}
			</span>
		</span>
	);
}

function gopVaoChu(dv: DonViPhang, mt: MucTieuMau): string {
	if (mt.gopVao.length > 0) {
		return `Góp vào ${mt.gopVao
			.map((g) => (g.kr ? `${g.donVi} › ${g.kr}` : `${g.donVi} › ${g.mucTieu}`))
			.join(" · ")}`;
	}
	return chuaGop(dv, mt) ? "Chưa góp vào mục tiêu nào" : "Mục tiêu cấp công ty";
}

function cotMucTieu(dv: DonViPhang): DataTableColumn<MucTieuMau>[] {
	return [
		{
			id: "ten",
			header: "Mục tiêu",
			cell: (mt) => (
				<span className="flex min-w-0 flex-col gap-1" data-muc-tieu={mt.id}>
					<span className="flex flex-wrap items-center gap-2">
						<span className="font-medium" translate="no">
							{mt.ten}
						</span>
						<LoaiMucTieuNhan loai={mt.loai} />
						<span className="text-muted-foreground text-xs tabular-nums">
							{mt.kr.length} KR
						</span>
					</span>
					<span
						className="truncate text-muted-foreground text-xs"
						translate="no"
					>
						{gopVaoChu(dv, mt)}
					</span>
				</span>
			),
		},
		{
			id: "tien-do",
			header: "Tiến độ",
			width: "w-64",
			hideBelow: "md",
			cell: (mt) => {
				const p = tienDoMucTieu(mt);
				return <TienDoO giaTriChu={`${p}%`} nhan={mt.ten} p={p} />;
			},
		},
		{
			id: "tinh-trang",
			header: "Tình trạng",
			width: "w-36",
			cell: (mt) => (
				<TinhTrangKr loai={mt.loai} phanTram={tienDoMucTieu(mt)} size="sm" />
			),
		},
		{
			id: "phu-trach",
			header: "Phụ trách",
			width: "w-48",
			hideBelow: "lg",
			cell: (mt) => <TenNguoi ten={mt.phuTrach.ten} />,
		},
	];
}

function oKr(k: KrMau, cot: string, mt: MucTieuMau) {
	const p = tienDo(k);
	switch (cot) {
		case "ten":
			return (
				<span className="pl-4" data-kr={k.id} translate="no">
					KR · {k.ten}
				</span>
			);
		case "tien-do":
			return <TienDoO giaTriChu={giaTri(k)} nhan={k.ten} p={p} />;
		case "tinh-trang":
			return (
				<TinhTrangKr
					laMoc={k.kieu === "moc"}
					loai={mt.loai}
					phanTram={p}
					size="sm"
				/>
			);
		case "phu-trach":
			return <TenNguoi avatar={false} ten={k.phuTrach.ten} />;
		default:
			return null;
	}
}

type DongHop = { k: KrMau; mt: MucTieuMau; viSao: string };

const COT_HOP: DataTableColumn<DongHop>[] = [
	{
		id: "ten",
		header: "KR đáng bàn",
		cell: ({ k, mt }) => (
			<span className="flex flex-col gap-0.5" data-kr={k.id}>
				<span translate="no">{k.ten}</span>
				<span className="text-muted-foreground text-xs" translate="no">
					{mt.ten} · {k.phuTrach.ten}
				</span>
			</span>
		),
	},
	{
		id: "tien-do",
		header: "Tiến độ",
		width: "w-64",
		hideBelow: "md",
		cell: ({ k }) => (
			<TienDoO giaTriChu={giaTri(k)} nhan={k.ten} p={tienDo(k)} />
		),
	},
	{
		id: "tu-tin",
		header: "Tự tin",
		width: "w-28",
		cell: ({ k }) => <TuTin coNhan={false} muc={k.tuTin} size="sm" />,
	},
	{
		id: "vi-sao",
		header: "Vì sao lên bàn",
		width: "w-56",
		hideBelow: "lg",
		cell: ({ viSao }) => (
			<span className="text-muted-foreground text-xs">{viSao}</span>
		),
	},
];

function dongHop(ds: MucTieuMau[]): DongHop[] {
	const ket: DongHop[] = [];
	for (const mt of ds) {
		for (const k of mt.kr) {
			const tt = tinhTrang(tienDo(k), mt.loai);
			const ly = [
				k.tuTin === "thap" ? "tự tin thấp" : null,
				tt.tone !== "success" ? tt.nhan.toLowerCase() : null,
				k.imNgay > 7 ? `im ${k.imNgay} ngày` : null,
			].filter((x) => x !== null);
			if (ly.length > 0) ket.push({ k, mt, viSao: ly.join(" · ") });
		}
	}
	return ket;
}

function DonViCon({ dv }: { dv: DonViPhang }) {
	if (dv.con.length === 0) return null;
	return (
		<section className="flex flex-col gap-3" data-don-vi-con>
			<SectionHeading>Đơn vị trực thuộc</SectionHeading>
			<div className="grid gap-2 md:grid-cols-2">
				{dv.con.map((id) => {
					const c = donVi(id);
					return (
						<Item asChild key={id} size="sm" variant="outline">
							<Link href={duongTrang("ST-dh-don-vi", id)}>
								<ItemContent>
									<ItemTitle translate="no">{c.ten}</ItemTitle>
									<ItemDescription>
										{c.tt.mucTieu.length === 0
											? "Chưa đặt OKR"
											: `${c.tt.mucTieu.length} mục tiêu · ${c.tt.soKr} KR · ${c.tt.tienDoTb}%`}
									</ItemDescription>
								</ItemContent>
								<ItemActions>
									{c.truong ? null : (
										<StatusIndicator
											label="Chưa có trưởng"
											size="sm"
											tone="warning"
										/>
									)}
								</ItemActions>
							</Link>
						</Item>
					);
				})}
			</div>
		</section>
	);
}

export function TrangDonVi({
	donViId,
	cachXem,
	moChon,
}: {
	donViId: string;
	cachXem: CachXem;
	moChon: boolean;
}) {
	const router = useRouter();
	const dv = donVi(donViId);
	const ds = mucTieuCua(dv.id);
	const query = useTruyVan();
	const loc = query.tab;
	const hien = ds.filter((mt) =>
		loc === "can-ban"
			? canBan(mt)
			: loc === "chua-gop"
				? chuaGop(dv, mt)
				: true,
	);
	const dem = {
		loc: {
			"can-ban": ds.filter(canBan).length,
			"chua-gop": ds.filter((mt) => chuaGop(dv, mt)).length,
		},
	};
	const cot = useMemo(() => cotMucTieu(dv), [dv]);
	const hop = dongHop(hien);
	const chung = {
		query,
		search: <ChonDonVi dv={dv} moSan={moChon} />,
		tabs: TAB_LOC,
		facetCounts: dem,
		leadingActions: (
			<ViewSwitch
				items={CACH_XEM}
				label="Cách xem"
				onValueChange={(v) =>
					router.replace(
						duongTrang(
							v === "hop-tuan" ? "ST-dh-hop-tuan" : "ST-dh-don-vi",
							dv.id,
						),
					)
				}
				value={cachXem}
			/>
		),
		meta: <DongDonVi dv={dv} />,
		empty: (
			<Empty data-don-vi-trong>
				<EmptyHeader>
					<EmptyTitle>
						{ds.length === 0
							? `${dv.ten} chưa đặt OKR cho Quý 4 · 2026`
							: "Không có mục tiêu nào khớp bộ lọc"}
					</EmptyTitle>
					<EmptyDescription>
						{ds.length > 0
							? "Chọn «Tất cả» để xem lại mọi mục tiêu của đơn vị."
							: dv.truong
								? `${dv.truong.ten} là trưởng đơn vị và đặt được mục tiêu bằng nút «Thêm mục tiêu» ở đầu trang.`
								: "Đơn vị chưa có trưởng nên chưa ai được giao đặt mục tiêu. Gán trưởng ở Cài đặt › Tổ chức, hoặc để đơn vị cấp trên đặt hộ."}
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		),
	};

	return (
		<>
			{cachXem === "hop-tuan" ? (
				<DataTable
					{...chung}
					columns={COT_HOP}
					getRowId={(d) => d.k.id}
					layout="content"
					rows={hop}
					total={hop.length}
				/>
			) : (
				<DataTable
					{...chung}
					columns={cot}
					expandable={{
						isExpandable: (mt) => mt.kr.length > 0,
						getSubRows: (mt) => mt.kr,
						getSubRowId: (k) => k.id,
						renderSubCell: (k, c, mt) => oKr(k, c, mt),
					}}
					getRowId={(mt) => mt.id}
					layout="content"
					rows={hien}
					total={hien.length}
				/>
			)}
			<DonViCon dv={dv} />
		</>
	);
}
