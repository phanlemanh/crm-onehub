"use client";

import Add from "@carbon/icons-react/es/Add";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldDescription } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { NavItem } from "@crm/ui/components/nav-item";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import type { ReactNode } from "react";
import { TenNguoi } from "../ban-mau-okr/phan-chung";
import {
	CUOC,
	type CuocSoan,
	DON_VI,
	DON_VI_CHON,
	dinhDang,
	KY_SOAN,
	NHAN_TRANG_THAI_CUOC,
	TRAN,
} from "./du-lieu";

export type HinhNut =
	| "nut"
	| "nut-tiep"
	| "nut-an"
	| "nut-het-cuoc"
	| "nut-het-tran";

const CELL = "px-3 py-2.5 align-middle";

function DanhSachDonVi() {
	return (
		<nav
			aria-label="Đơn vị"
			className="hidden w-56 shrink-0 flex-col gap-1 md:flex"
		>
			{DON_VI_CHON.map((d) => {
				const chon = d.id === "kd-bac";
				return (
					<NavItem active={chon} key={d.id} translate="no">
						{d.ten}
					</NavItem>
				);
			})}
		</nav>
	);
}

function NutSoan({ hinh }: { hinh: HinhNut }) {
	if (hinh === "nut-het-cuoc" || hinh === "nut-het-tran") {
		return (
			<Field data-disabled data-nut-soan={hinh}>
				<Button variant="outline" disabled className="w-fit">
					Soạn OKR cùng Trợ lý
				</Button>
				<FieldDescription>
					{hinh === "nut-het-cuoc"
						? `Đã dùng hết ${TRAN.cuocMoiKy} cuộc soạn kỳ này`
						: `Trợ lý OKR tạm nghỉ tới ${TRAN.nghiToi}`}
				</FieldDescription>
			</Field>
		);
	}
	if (hinh === "nut-tiep") {
		const cuocDang = CUOC.find((c) => c.trangThai === "dang");
		return (
			<Field data-nut-soan={hinh}>
				<Button variant="outline" className="w-fit">
					Tiếp cuộc đang soạn
				</Button>
				<FieldDescription>
					{cuocDang
						? `Mở ${dinhDang.ngayNgan(cuocDang.ngay)} · ${dinhDang.so(2)} lượt · ${dinhDang.so(cuocDang.dongTong)} dòng chưa quyết`
						: null}
				</FieldDescription>
			</Field>
		);
	}
	if (hinh === "nut-an") {
		return (
			<Field data-nut-soan={hinh}>
				<span className="flex items-center gap-2">
					<Button variant="outline" className="w-fit">
						Soạn OKR cùng Trợ lý
					</Button>
					<Badge variant="outline">chế độ ẩn</Badge>
				</span>
				<FieldDescription>
					Chỉ quản trị thấy nút này; cuộc soạn tính vào số đo, không tính vào
					đơn vị.
				</FieldDescription>
			</Field>
		);
	}
	return (
		<Button variant="outline" className="w-fit" data-nut-soan={hinh}>
			Soạn OKR cùng Trợ lý
		</Button>
	);
}

function DauDonVi({ nut }: { nut: HinhNut | null }) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div className="flex min-w-0 flex-col gap-1">
				<h3 className="font-medium text-base tracking-tight" translate="no">
					{DON_VI.ten}
				</h3>
				<p className="flex flex-wrap items-center gap-x-2 text-muted-foreground text-xs">
					<span>{DON_VI.cap}</span>
					<span aria-hidden="true">·</span>
					<span>Trưởng</span>
					<TenNguoi avatar={false} ten={DON_VI.truong} />
					<span aria-hidden="true">·</span>
					<span>{KY_SOAN.pha}</span>
					<span aria-hidden="true">·</span>
					<span className="tabular-nums">0 mục tiêu · 0 KR</span>
				</p>
			</div>
			<div className="flex flex-wrap items-end gap-2">
				{nut ? <NutSoan hinh={nut} /> : null}
				<Button size="sm">
					<Icon icon={Add} data-icon="inline-start" />
					Thêm mục tiêu
				</Button>
			</div>
		</div>
	);
}

function ChuaCoOkr() {
	return (
		<Empty border="solid">
			<EmptyHeader>
				<EmptyTitle>
					<span translate="no">{DON_VI.ten}</span> chưa đặt OKR cho{" "}
					{KY_SOAN.ten}
				</EmptyTitle>
				<EmptyDescription>
					Chu kỳ đang lập kế hoạch tới 15/12. Thêm mục tiêu tay, hoặc soạn cùng
					Trợ lý rồi nhận từng dòng.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

export function KhungDonVi({
	nut,
	children,
}: {
	nut: HinhNut | null;
	children?: ReactNode;
}) {
	return (
		<div className="flex gap-6">
			<DanhSachDonVi />
			<div className="flex min-w-0 flex-1 flex-col gap-4">
				<DauDonVi nut={nut} />
				{children ?? <ChuaCoOkr />}
			</div>
		</div>
	);
}

const TONE_CUOC = {
	dang: "warning",
	"da-dua-vao": "success",
	"bo-do": "neutral",
} as const satisfies Record<CuocSoan["trangThai"], StatusTone>;

export function DanhSachCuoc({ rong }: { rong: boolean }) {
	if (rong) {
		return (
			<Empty border="solid" data-cuoc="rong">
				<EmptyHeader>
					<EmptyTitle>Đơn vị chưa có cuộc soạn nào</EmptyTitle>
					<EmptyDescription>
						Mỗi chu kỳ có {TRAN.cuocMoiKy} cuộc; cuộc đã đưa vào bộ OKR vẫn xem
						lại được ở đây.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button size="sm" variant="outline">
						Soạn OKR cùng Trợ lý
					</Button>
				</EmptyContent>
			</Empty>
		);
	}
	return (
		<section
			aria-label="Cuộc soạn cùng Trợ lý"
			className="flex flex-col gap-3"
			data-cuoc="danh-sach"
		>
			<SectionHeading
				level={4}
				actions={
					<p className="text-muted-foreground tabular-nums">
						{dinhDang.so(CUOC.length)}/{dinhDang.so(TRAN.cuocMoiKy)} cuộc
					</p>
				}
			>
				Cuộc soạn cùng Trợ lý · {KY_SOAN.ten}
			</SectionHeading>
			<SimpleTable
				surface="page"
				columns={[
					{ id: "ngay", header: "Ngày", width: "w-28" },
					{ id: "nguoi", header: "Người mở" },
					{ id: "dong", header: "Dòng nhận", width: "w-28", align: "right" },
					{ id: "tt", header: "Trạng thái", width: "w-32" },
					{ id: "mo", srLabel: "Mở", width: "w-20" },
				]}
			>
				{CUOC.map((c) => (
					<SimpleTableRow key={c.id}>
						<TableCell className={`${CELL} tabular-nums`}>
							{dinhDang.ngayDayDu(c.ngay)}
						</TableCell>
						<TableCell className={CELL}>
							<TenNguoi ten={c.nguoiMo} />
						</TableCell>
						<TableCell className={`${CELL} text-right tabular-nums`}>
							{dinhDang.so(c.dongNhan)}/{dinhDang.so(c.dongTong)}
						</TableCell>
						<TableCell className={CELL}>
							<StatusIndicator
								size="sm"
								tone={TONE_CUOC[c.trangThai]}
								label={NHAN_TRANG_THAI_CUOC[c.trangThai]}
							/>
						</TableCell>
						<TableCell className={`${CELL} text-right`}>
							<Button
								size="sm"
								variant="outline"
								aria-label={`${c.trangThai === "dang" ? "Tiếp" : "Xem"} cuộc ${dinhDang.ngayDayDu(c.ngay)}`}
							>
								{c.trangThai === "dang" ? "Tiếp" : "Xem"}
							</Button>
						</TableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
		</section>
	);
}
