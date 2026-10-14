"use client";

import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import Link from "next/link";
import { KY } from "../ban-mau-okr/du-lieu";
import {
	giaTri,
	ThanhTienDo,
	TinhTrangKr,
	TuTin,
	tienDo,
} from "../ban-mau-okr/phan-chung";
import {
	canCapNhat,
	donVi,
	duongTrang,
	type KrCuaNguoi,
	krCua,
	type NguoiXem,
} from "./du-lieu";

const COT_KR: SimpleTableColumn[] = [
	{ id: "ten", header: "KR" },
	{ id: "tien-do", header: "Tiến độ", width: "w-56" },
	{ id: "tinh-trang", header: "Tình trạng", width: "w-36" },
	{ id: "tu-tin", header: "Tự tin", width: "w-28" },
];

function BangKr({ ds }: { ds: KrCuaNguoi[] }) {
	return (
		<SimpleTable columns={COT_KR} surface="page">
			{ds.map(({ kr, mucTieu }) => {
				const p = tienDo(kr);
				return (
					<SimpleTableRow data-kr={kr.id} key={kr.id}>
						<SimpleTableCell>
							<span className="flex flex-col gap-0.5">
								<span translate="no">{kr.ten}</span>
								<span className="text-muted-foreground text-xs" translate="no">
									{mucTieu.donVi} · {mucTieu.ten}
								</span>
							</span>
						</SimpleTableCell>
						<SimpleTableCell>
							<span className="flex items-center gap-2">
								<ThanhTienDo nhan={kr.ten} phanTram={p} />
								<span className="w-24 shrink-0 text-right text-xs tabular-nums">
									{giaTri(kr)}
								</span>
							</span>
						</SimpleTableCell>
						<SimpleTableCell>
							<TinhTrangKr loai={mucTieu.loai} phanTram={p} size="sm" />
						</SimpleTableCell>
						<SimpleTableCell>
							<TuTin coNhan={false} muc={kr.tuTin} size="sm" />
						</SimpleTableCell>
					</SimpleTableRow>
				);
			})}
		</SimpleTable>
	);
}

function DonViToiDan({ id }: { id: string }) {
	const dv = donVi(id);
	const t = dv.tt;
	return (
		<Card data-don-vi-toi-dan>
			<CardHeader>
				<CardTitle>Đơn vị bạn dẫn</CardTitle>
				<CardDescription translate="no">
					{dv.ten} · {t.mucTieu.length} mục tiêu · {t.soKr} KR · trung bình{" "}
					{t.tienDoTb}%
				</CardDescription>
				<CardAction>
					<Button asChild size="sm" variant="outline">
						<Link href={duongTrang("ST-dh-don-vi", id)}>Mở trang đơn vị</Link>
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<span className="flex flex-wrap items-center gap-x-4 gap-y-1">
					<StatusIndicator
						label={`${t.dem.success} KR đúng nhịp`}
						size="sm"
						tone="success"
					/>
					<StatusIndicator
						label={`${t.dem.warning} KR chậm nhịp`}
						size="sm"
						tone="warning"
					/>
					<StatusIndicator
						label={`${t.dem.error} KR trượt`}
						size="sm"
						tone="error"
					/>
				</span>
			</CardContent>
		</Card>
	);
}

export function CuaToi({ xem }: { xem: NguoiXem }) {
	const can = canCapNhat(xem.nguoi);
	const cua = krCua(xem.nguoi);
	return (
		<>
			<section className="flex flex-col gap-3" data-can-cap-nhat>
				<SectionHeading
					actions={
						can.length > 0 ? (
							<Button size="sm" variant="outline">
								Cập nhật {can.length} KR
							</Button>
						) : null
					}
					level={2}
				>
					Cần cập nhật tuần này
				</SectionHeading>
				<p className="text-muted-foreground text-sm">
					{can.length === 0
						? `Bạn đã cập nhật đủ cho ${KY.tuan}.`
						: `${can.length} KR chưa có số của ${KY.tuan}, hạn ${KY.hanCapNhat}.`}
				</p>
				{can.length > 0 ? <BangKr ds={can} /> : null}
			</section>
			{xem.danId ? <DonViToiDan id={xem.danId} /> : null}
			<section className="flex flex-col gap-3" data-kr-toi-phu-trach>
				<SectionHeading level={2}>KR bạn phụ trách</SectionHeading>
				<p className="text-muted-foreground text-sm">
					{cua.length} KR ở mọi đơn vị trong {KY.ten}.
				</p>
				<BangKr ds={cua} />
			</section>
		</>
	);
}
