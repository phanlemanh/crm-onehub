"use client";

import { Card, CardContent } from "@crm/ui/components/card";
import { DataTable, type DataTableColumn } from "@crm/ui/components/data-table";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import type { TableQueryState } from "@crm/ui/lib/table-query";
import type { KrMau, MucTieuMau } from "../ban-mau-okr/du-lieu";
import {
	ChuThichVach,
	giaTri,
	ThanhTienDo,
	TuTin,
	tienDo,
	tinhTrang,
} from "../ban-mau-okr/phan-chung";
import { mucTieuCua, tienDoMucTieu } from "./du-lieu";

const KHONG_LAM = () => {};

const TRUY_VAN_TINH: TableQueryState = {
	sort: "",
	dir: "asc",
	page: 1,
	pageSize: 50,
	tab: "all",
	filters: {},
	toggleSort: KHONG_LAM,
	setSort: KHONG_LAM,
	setDir: KHONG_LAM,
	setPage: async () => {},
	setTab: KHONG_LAM,
	setFilter: KHONG_LAM,
};

export function TienDoO({
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

type DongHop = { k: KrMau; mt: MucTieuMau; viSao: string };

const COT_HOP: DataTableColumn<DongHop>[] = [
	{
		id: "ten",
		header: "KR đáng bàn",
		hideable: false,
		cell: ({ k, mt }) => (
			<span className="flex flex-col gap-0.5 whitespace-normal" data-kr={k.id}>
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
		hideable: false,
		cell: ({ k }) => (
			<TienDoO giaTriChu={giaTri(k)} nhan={k.ten} p={tienDo(k)} />
		),
	},
	{
		id: "tu-tin",
		header: "Tự tin",
		width: "w-28",
		hideable: false,
		cell: ({ k }) => <TuTin coNhan={false} muc={k.tuTin} size="sm" />,
	},
	{
		id: "vi-sao",
		header: "Vì sao lên bàn",
		width: "w-56",
		hideBelow: "lg",
		hideable: false,
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
				k.kieu !== "moc" && tt.tone !== "success"
					? tt.nhan.toLowerCase()
					: null,
				k.imNgay > 7 ? `im ${k.imNgay} ngày` : null,
			].filter((x) => x !== null);
			if (ly.length > 0) ket.push({ k, mt, viSao: ly.join(" · ") });
		}
	}
	return ket;
}

export function HopTuan({ donId }: { donId: string }) {
	const hop = dongHop(mucTieuCua(donId));
	return (
		<div className="flex flex-col gap-3" data-than-cach-xem="hop-tuan">
			<DataTable
				columns={COT_HOP}
				getRowId={(d) => d.k.id}
				layout="content"
				meta={`${hop.length} KR đáng bàn tuần này`}
				query={TRUY_VAN_TINH}
				rows={hop}
				total={hop.length}
			/>
			<ChuThichVach />
		</div>
	);
}

const AN_DUOI_MD = "hidden md:table-cell";

const COT_CHAM = [
	{ id: "kr", header: "KR" },
	{
		id: "so",
		header: "Số cuối kỳ",
		width: "w-32",
		align: "right" as const,
		className: AN_DUOI_MD,
	},
	{
		id: "goi-y",
		header: "Gợi ý",
		width: "w-24",
		align: "right" as const,
		className: AN_DUOI_MD,
	},
	{ id: "diem", header: "Điểm", width: "w-28", align: "right" as const },
];

export function ChamDiem({ donId }: { donId: string }) {
	const kr = mucTieuCua(donId).flatMap((mt) => mt.kr.map((k) => ({ k, mt })));
	return (
		<section className="flex flex-col gap-3" data-than-cach-xem="cham-diem">
			<SectionHeading>Chấm điểm cuối kỳ · Quý 4 · 2026</SectionHeading>
			<Card>
				<CardContent>
					<SimpleTable columns={COT_CHAM} surface="page">
						{kr.map(({ k, mt }) => {
							const goiY = (tienDo(k) / 100).toFixed(1).replace(".", ",");
							return (
								<SimpleTableRow key={k.id}>
									<SimpleTableCell>
										<span className="flex flex-col gap-0.5 whitespace-normal">
											<span translate="no">{k.ten}</span>
											<span
												className="text-muted-foreground text-xs"
												translate="no"
											>
												{mt.ten}
											</span>
										</span>
									</SimpleTableCell>
									<SimpleTableCell className={AN_DUOI_MD} numeric>
										{giaTri(k)}
									</SimpleTableCell>
									<SimpleTableCell className={AN_DUOI_MD} numeric>
										{goiY}
									</SimpleTableCell>
									<SimpleTableCell numeric>
										<span className="text-muted-foreground">Chưa chấm</span>
									</SimpleTableCell>
								</SimpleTableRow>
							);
						})}
					</SimpleTable>
				</CardContent>
			</Card>
		</section>
	);
}

type NutCay = {
	id: string;
	ten: string;
	donVi: string;
	p: number;
	tin: "dat-cuoc" | "chua-co-ly-do" | null;
	con: NutCay[];
};

function nut(mt: MucTieuMau, tin: NutCay["tin"], con: NutCay[] = []): NutCay {
	return {
		id: mt.id,
		ten: mt.ten,
		donVi: mt.donVi,
		p: tienDoMucTieu(mt),
		tin,
		con,
	};
}

function cayMau(donId: string): NutCay[] {
	const [c1, c2, c3] = mucTieuCua(donId);
	const [o1, o2] = mucTieuCua("onehub");
	const [v1] = mucTieuCua("vanhanh");
	if (!c1 || !c2 || !c3 || !o1 || !o2 || !v1) return [];
	return [
		nut(o1, null, [nut(v1, "chua-co-ly-do", [nut(c1, "dat-cuoc")])]),
		nut(o2, null, [nut(c2, "chua-co-ly-do")]),
		nut(c3, null),
	];
}

const NHAN_TIN = {
	"dat-cuoc": { label: "Đặt cược", tone: "warning" },
	"chua-co-ly-do": { label: "Chưa có lý do", tone: "neutral" },
} as const;

function DongCay({ n, cap }: { n: NutCay; cap: number }) {
	const lui = ["", "pl-6", "pl-12"][Math.min(cap, 2)];
	return (
		<>
			<div
				className={`flex items-start gap-4 border-b py-2.5 text-sm last:border-b-0 ${lui}`}
				data-nut-can-chinh={n.id}
			>
				<span className="flex min-w-0 flex-1 flex-col gap-0.5">
					<span
						className={cap === 0 ? "font-medium" : undefined}
						translate="no"
					>
						{n.ten}
					</span>
					<span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
						<span translate="no">{n.donVi}</span>
						{n.tin ? (
							<StatusIndicator
								data-muc-tin={n.tin}
								label={NHAN_TIN[n.tin].label}
								size="sm"
								tone={NHAN_TIN[n.tin].tone}
							/>
						) : null}
					</span>
				</span>
				<span className="hidden w-48 shrink-0 items-center gap-2 sm:flex">
					<ThanhTienDo nhan={n.ten} phanTram={n.p} />
					<span className="w-9 shrink-0 text-right text-xs tabular-nums">
						{n.p}%
					</span>
				</span>
			</div>
			{n.con.map((c) => (
				<DongCay cap={cap + 1} key={c.id} n={c} />
			))}
		</>
	);
}

export function CayCanChinh({ donId }: { donId: string }) {
	const cay = cayMau(donId);
	return (
		<section className="flex flex-col gap-3" data-than-cach-xem="cay">
			<Card>
				<CardContent>
					{cay.map((n) => (
						<DongCay cap={0} key={n.id} n={n} />
					))}
				</CardContent>
			</Card>
			<ChuThichVach />
		</section>
	);
}
