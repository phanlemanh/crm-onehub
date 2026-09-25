"use client";

import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
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
import { Icon } from "@crm/ui/components/icon";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { KhoiMucTieu } from "../ban-mau-okr/cua-toi";
import { KY, MT_CSKH_1, MT_ONEHUB_1, NGUOI, TOI } from "../ban-mau-okr/du-lieu";
import {
	ChuThichVach,
	giaTri,
	TinhTrangKr,
	ThanhTienDo,
	TuTin,
	tienDo,
} from "../ban-mau-okr/phan-chung";
import { KR_CUA_TOI_TONG_QUAN } from "./du-lieu";

export type HinhTongQuan = "khoi" | "rong" | "chi-okr";

const COT = [
	{ id: "kr", header: "KR bạn phụ trách" },
	{ id: "tien-do", header: "Tiến độ", width: "w-[34%]" },
	{
		id: "tu-tin",
		header: "Mức tự tin",
		width: "w-[16%]",
		className: "hidden sm:table-cell",
	},
] satisfies SimpleTableColumn[];

function BangKrCuaToi() {
	return (
		<SimpleTable columns={COT}>
			{KR_CUA_TOI_TONG_QUAN.map(({ kr, mucTieu }) => {
				const p = tienDo(kr);
				const laMoc = kr.kieu === "moc";
				return (
					<SimpleTableRow clickable data-kr={kr.id} key={kr.id}>
						<TableCell className="px-3 py-2.5 align-top whitespace-normal">
							<span className="block text-sm" translate="no">
								{kr.ten}
							</span>
							<span
								className="block text-muted-foreground text-xs"
								translate="no"
							>
								{mucTieu.ten}
							</span>
						</TableCell>
						<TableCell className="px-3 py-2.5 align-top">
							<span className="flex flex-col gap-1.5">
								<ThanhTienDo
									kyVong={laMoc ? null : undefined}
									nhan={kr.ten}
									phanTram={p}
								/>
								<span className="flex items-center justify-between gap-2 text-xs">
									<TinhTrangKr
										laMoc={laMoc}
										loai={mucTieu.loai}
										phanTram={p}
										size="sm"
									/>
									<span className="text-muted-foreground tabular-nums">
										{giaTri(kr)}
									</span>
								</span>
							</span>
						</TableCell>
						<TableCell className="hidden px-3 py-2.5 align-top sm:table-cell">
							<TuTin coNhan={false} muc={kr.tuTin} size="sm" />
						</TableCell>
					</SimpleTableRow>
				);
			})}
		</SimpleTable>
	);
}

export function KhoiOkrTongQuan({ rong = false }: { rong?: boolean }) {
	return (
		<Card data-khoi="okr-tong-quan">
			<CardHeader>
				<CardTitle>OKR của bạn · {KY.ten}</CardTitle>
				<CardDescription>
					{rong
						? "Bạn chưa phụ trách KR nào trong kỳ này."
						: "Bốn KR bạn phụ trách, KR đáng lo lên đầu."}
				</CardDescription>
				<CardAction>
					<Button size="sm" variant="outline">
						Mở OKR
						<Icon icon={ArrowRight} data-icon="inline-end" />
					</Button>
				</CardAction>
			</CardHeader>
			{rong ? (
				<CardContent>
					<p className="text-sm">
						Mục tiêu OneHub kỳ này:{" "}
						<span translate="no">{MT_ONEHUB_1.ten}</span> — tiến độ và mức tự
						tin của mọi đơn vị ở Toàn cảnh.
					</p>
				</CardContent>
			) : (
				<BangKrCuaToi />
			)}
			{rong ? null : (
				<CardFooter>
					<ChuThichVach />
				</CardFooter>
			)}
		</Card>
	);
}

function KhoiHienCo() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Các khối Tổng quan đang có</CardTitle>
				<CardDescription>
					Chốt được tháng này, thoả thuận lớn, việc của tôi — giữ nguyên.
				</CardDescription>
			</CardHeader>
		</Card>
	);
}

export function TongQuan({ hinh }: { hinh: HinhTongQuan }) {
	return (
		<div
			className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-6"
			data-ban-mau={`tong-quan-${hinh}`}
		>
			<p className="font-medium text-2xl tracking-tight">
				Chào buổi sáng, <span translate="no">{TOI.ten}</span>
			</p>
			{hinh === "chi-okr" ? (
				<>
					<p className="text-muted-foreground text-sm">
						Vai «chỉ OKR»: Tổng quan chỉ có khối OKR, thẻ việc cập nhật tuần
						(lượt 4) và lối vào khu OKR.
					</p>
					<KhoiOkrTongQuan />
				</>
			) : (
				<>
					<KhoiOkrTongQuan rong={hinh === "rong"} />
					<KhoiHienCo />
				</>
			)}
		</div>
	);
}

export function TrangNguoi() {
	return (
		<div className="flex flex-col gap-6" data-ban-mau="trang-nguoi">
			<Card>
				<CardHeader>
					<CardTitle>
						<span className="flex items-center gap-3">
							<PersonAvatar name={NGUOI.nga.ten} />
							<span translate="no">{NGUOI.nga.ten}</span>
						</span>
					</CardTitle>
					<CardDescription>
						Phòng ban chính <span translate="no">Chăm sóc khách hàng</span> ·
						Quản lý trực tiếp <span translate="no">{NGUOI.thao.ten}</span> · 4
						KR phụ trách · tham gia 1 mục tiêu
					</CardDescription>
				</CardHeader>
			</Card>
			<p className="text-muted-foreground text-sm">
				Trang OKR của một người — «Theo đơn vị» chọn một người (bấm tên ở bất kỳ
				đâu trong khu OKR). Đây là «trang cá nhân» của XEM-07; CRM chưa có trang
				hồ sơ nhân viên nào khác.
			</p>
			<KhoiOkrTongQuan />
			<section aria-label="Mục tiêu tham gia" className="flex flex-col gap-3">
				<KhoiMucTieu danhDauCuaToi mucTieu={MT_CSKH_1} />
			</section>
		</div>
	);
}

export function TongQuanRongCuaNguoi() {
	return (
		<Empty className="rounded-lg border">
			<EmptyHeader>
				<EmptyTitle>
					<span translate="no">{NGUOI.tuan.ten}</span> chưa phụ trách KR nào
				</EmptyTitle>
				<EmptyDescription>Trong {KY.ten}.</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button size="sm" variant="outline">
					Xem OKR của phòng ban
				</Button>
			</EmptyContent>
		</Empty>
	);
}
