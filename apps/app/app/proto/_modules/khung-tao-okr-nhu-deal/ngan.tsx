"use client";

import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { ItemDescription, ItemGroup } from "@crm/ui/components/item";
import { ProposedChange } from "@crm/ui/components/proposed-change";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	Sheet,
	SheetBody,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { Textarea } from "@crm/ui/components/textarea";
import type { ReactNode } from "react";
import { DONG, KR, MUC_TIEU } from "../tro-ly-okr-de-xuat/du-lieu";

const khong = () => undefined;

function Chan({ chinh, tat }: { chinh: string; tat: boolean }) {
	return (
		<SheetFooter>
			<SheetClose asChild>
				<Button variant="outline">Huỷ</Button>
			</SheetClose>
			<Button disabled={tat}>{chinh}</Button>
		</SheetFooter>
	);
}

function Than({ cot, children }: { cot?: ReactNode; children: ReactNode }) {
	return (
		<SheetBody split={cot !== undefined} data-cuon-hop>
			{children}
			{cot}
		</SheetBody>
	);
}

export function Ngan({
	tieuDe,
	moTa,
	chinh,
	tat,
	cot,
	dauVet,
	children,
}: {
	tieuDe: string;
	moTa?: string;
	chinh: string;
	tat: boolean;
	cot?: ReactNode;
	dauVet: Record<string, string>;
	children: ReactNode;
}) {
	return (
		<Sheet open modal={false}>
			<SheetContent side="right" size={cot ? "assist" : undefined} {...dauVet}>
				<SheetHeader>
					<SheetTitle>{tieuDe}</SheetTitle>
					{moTa ? (
						<SheetDescription translate="no">{moTa}</SheetDescription>
					) : null}
				</SheetHeader>
				<Than cot={cot}>{children}</Than>
				<Chan chinh={chinh} tat={tat} />
			</SheetContent>
		</Sheet>
	);
}

export function KhungMucTieuNen() {
	return (
		<Sheet open modal={false}>
			<SheetContent side="right" size="lg" showCloseButton={false}>
				<SheetHeader>
					<SheetTitle translate="no">{MUC_TIEU.ten}</SheetTitle>
					<SheetDescription>
						Khung chi tiết Mục tiêu · {MUC_TIEU.donVi} · {MUC_TIEU.phuTrach}
					</SheetDescription>
				</SheetHeader>
				<div className="flex-1 px-4">
					<ItemDescription>
						Tab KR · Căn chỉnh · Vết · Trao đổi · Diễn biến
					</ItemDescription>
				</div>
			</SheetContent>
		</Sheet>
	);
}

export function FormDeal() {
	return (
		<FieldGroup>
			<Field>
				<FieldLabel htmlFor="deal-ten">Tên</FieldLabel>
				<Input id="deal-ten" placeholder="Đất Xanh — OneHub" />
			</Field>
			<Field>
				<FieldLabel htmlFor="deal-cong-ty">Công ty</FieldLabel>
				<Input id="deal-cong-ty" placeholder="Chọn công ty" />
			</Field>
			<Field>
				<FieldLabel htmlFor="deal-chu">Phụ trách</FieldLabel>
				<Input id="deal-chu" defaultValue={MUC_TIEU.phuTrach} translate="no" />
			</Field>
			<Field>
				<FieldLabel htmlFor="deal-giai-doan">Giai đoạn</FieldLabel>
				<Input id="deal-giai-doan" defaultValue="Đã hẹn demo" />
				<FieldDescription>
					Thoả thuận mới là thoả thuận đang mở — chốt nó khi đã có kết quả để
					ghi lại.
				</FieldDescription>
			</Field>
			<Field>
				<FieldLabel htmlFor="deal-gia-tri">Giá trị</FieldLabel>
				<Input id="deal-gia-tri" inputMode="decimal" placeholder="0" />
			</Field>
			<Field>
				<FieldLabel htmlFor="deal-ngay">Ngày dự kiến chốt</FieldLabel>
				<Input id="deal-ngay" placeholder="Chưa có ngày" />
			</Field>
		</FieldGroup>
	);
}

function ChonMot({
	id,
	nhan,
	gia,
	khoa,
}: {
	id: string;
	nhan: string;
	gia: string;
	khoa?: boolean;
}) {
	return (
		<Field data-disabled={khoa}>
			<FieldLabel htmlFor={id}>{nhan}</FieldLabel>
			<Select value={gia} disabled={khoa}>
				<SelectTrigger id={id}>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={gia}>{gia}</SelectItem>
				</SelectContent>
			</Select>
		</Field>
	);
}

export function FormMucTieu({
	moi,
	nutGopY,
}: {
	moi: boolean;
	nutGopY: boolean;
}) {
	return (
		<FieldGroup>
			{nutGopY ? (
				<Button variant="outline" className="w-fit">
					Nhờ Trợ lý OKR góp ý
				</Button>
			) : null}
			<div className="grid grid-cols-2 gap-3">
				<ChonMot id="mt-cap" nhan="Cấp" gia="Phòng ban" khoa />
				<Field data-disabled>
					<FieldLabel htmlFor="mt-don-vi">Đơn vị</FieldLabel>
					<Input id="mt-don-vi" value={MUC_TIEU.donVi} disabled readOnly />
				</Field>
			</div>
			{moi ? null : (
				<FieldDescription>Không đổi được đơn vị của Mục tiêu.</FieldDescription>
			)}
			<Field>
				<FieldLabel htmlFor="mt-ten">Tên mục tiêu</FieldLabel>
				<Input
					id="mt-ten"
					defaultValue={moi ? "" : MUC_TIEU.ten}
					translate="no"
				/>
			</Field>
			<ChonMot id="mt-loai" nhan="Loại" gia={MUC_TIEU.loai} />
			<Field>
				<FieldLabel htmlFor="mt-chu">Phụ trách</FieldLabel>
				<Input id="mt-chu" defaultValue={MUC_TIEU.phuTrach} translate="no" />
			</Field>
			<Field>
				<FieldLabel htmlFor="mt-tham-gia">Người tham gia</FieldLabel>
				<Input id="mt-tham-gia" placeholder="Thêm người" />
			</Field>
			<Field>
				<FieldLabel htmlFor="mt-vi-sao">Vì sao lúc này</FieldLabel>
				<Textarea
					id="mt-vi-sao"
					defaultValue={moi ? "" : MUC_TIEU.viSao}
					translate="no"
				/>
				<FieldDescription>
					Một hai câu: điều gì đổi nếu đạt Mục tiêu này trong kỳ.
				</FieldDescription>
			</Field>
		</FieldGroup>
	);
}

export function FormKr({ moi, nutGopY }: { moi: boolean; nutGopY: boolean }) {
	return (
		<FieldGroup>
			{nutGopY ? (
				<Button variant="outline" className="w-fit">
					Nhờ Trợ lý OKR góp ý
				</Button>
			) : null}
			<Field>
				<FieldLabel htmlFor="kr-ten">Tên KR</FieldLabel>
				<Input id="kr-ten" defaultValue={moi ? "" : KR.ten} translate="no" />
			</Field>
			<ChonMot id="kr-kieu" nhan="Kiểu KR" gia="Tăng tới" />
			<div className="grid items-start gap-3 sm:grid-cols-3">
				<Field>
					<FieldLabel htmlFor="kr-khoi">Khởi điểm</FieldLabel>
					<Input id="kr-khoi" defaultValue={moi ? "0" : KR.khoi} />
				</Field>
				<Field>
					<FieldLabel htmlFor="kr-dich">Đích</FieldLabel>
					<Input id="kr-dich" defaultValue={moi ? "" : KR.dich} />
					{moi ? null : (
						<FieldDescription data-xu-huong>{KR.xuHuong}</FieldDescription>
					)}
				</Field>
				<Field>
					<FieldLabel htmlFor="kr-hien">Hiện tại</FieldLabel>
					<Input id="kr-hien" placeholder={moi ? "0" : KR.khoi} />
				</Field>
			</div>
			<FieldDescription>
				Số viết như 1.250,5 — dấu chấm ngăn nghìn, dấu phẩy thập phân.
			</FieldDescription>
			<ChonMot
				id="kr-nguon"
				nhan="Nguồn số"
				gia={moi ? "Nhập tay" : KR.nguon}
			/>
			<div className="grid items-start gap-3 sm:grid-cols-2">
				<Field>
					<FieldLabel htmlFor="kr-don-vi">Đơn vị đo</FieldLabel>
					<Input id="kr-don-vi" defaultValue="thoả thuận" translate="no" />
				</Field>
				<Field>
					<FieldLabel htmlFor="kr-chu">Phụ trách</FieldLabel>
					<Input id="kr-chu" defaultValue={MUC_TIEU.phuTrach} translate="no" />
				</Field>
			</div>
			<Field>
				<FieldLabel htmlFor="kr-han">Hạn</FieldLabel>
				<Input id="kr-han" placeholder="Chưa có ngày" />
			</Field>
		</FieldGroup>
	);
}

export function CotMau({ chiKr }: { chiKr: boolean }) {
	const dong = chiKr
		? DONG.filter((d) => d.id === "d2")
		: DONG.filter((d) => d.id !== "d2");
	return (
		<section
			aria-label="Góp ý của Trợ lý OKR"
			className="flex flex-col gap-3 pb-4"
			data-cot-gop-y
		>
			<ItemDescription>
				{chiKr
					? "Trợ lý OKR · chỉ KR này · 1 đề xuất chờ"
					: `Trợ lý OKR · ${dong.length} đề xuất chờ`}
			</ItemDescription>
			<ItemGroup>
				{dong.map((d) =>
					d.loai === "hoi" ? (
						<ProposedChange
							key={d.id}
							density="card"
							kind="question"
							label={`Câu hỏi · ${d.o}`}
							value={<span translate="no">{d.sau}</span>}
							actions={[
								{
									id: "mo-kr",
									label: "Mở KR này",
									tone: "secondary",
									onClick: khong,
								},
								{
									id: "bo-qua",
									label: "Bỏ qua",
									tone: "quiet",
									onClick: khong,
								},
							]}
						/>
					) : (
						<ProposedChange
							key={d.id}
							density="card"
							kind="rewrite"
							label={`${d.loai === "can-chinh" ? "Căn chỉnh" : "Viết lại"} · ${d.o}`}
							before={
								d.truoc ? <span translate="no">{d.truoc}</span> : undefined
							}
							value={<span translate="no">{d.sau}</span>}
							rationale={d.lyDo}
							actions={[
								{
									id: "nhan",
									label: d.loai === "can-chinh" ? "Căn chỉnh" : "Nhận",
									tone: "primary",
									onClick: khong,
								},
								...(d.loai === "can-chinh"
									? []
									: [
											{
												id: "sua",
												label: "Sửa",
												tone: "secondary" as const,
												onClick: khong,
											},
										]),
								{ id: "bac", label: "Bác", tone: "quiet", onClick: khong },
							]}
						/>
					),
				)}
			</ItemGroup>
		</section>
	);
}

export function HoiLai() {
	return (
		<ConfirmDialog
			tieuDe="Bỏ những gì vừa nhập?"
			than="Những gì bạn vừa nhập trong hộp này sẽ mất."
			nut="Bỏ"
			thoi="Tiếp tục sửa"
			open
			onOpenChange={khong}
			onConfirm={khong}
			pending={false}
		/>
	);
}
