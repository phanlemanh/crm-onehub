"use client";

import Close from "@carbon/icons-react/es/Close";
import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
} from "@crm/ui/components/item";
import { KaraMark } from "@crm/ui/components/kara";
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
	SheetFooter,
	SheetHeader,
	SheetRailHeader,
	SheetRailTitle,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { Textarea } from "@crm/ui/components/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { DONG_HN, GOP_Y, STATE } from "./du-lieu";

const KHONG_LAM = () => undefined;

function DongDanSang({ so, noi }: { so: number; noi: string }) {
	return (
		<Item data-dan-sang size="sm" variant="outline">
			<ItemContent>
				<KaraMark scope={`${so} góp ý chờ`} />
				<ItemDescription>{noi}</ItemDescription>
			</ItemContent>
			<ItemActions>
				<SheetClose asChild>
					<Button asChild size="sm" variant="outline">
						<Link href={`?state=${STATE.bChiTiet}`}>Xem góp ý</Link>
					</Button>
				</SheetClose>
			</ItemActions>
		</Item>
	);
}

function FormMucTieu({ dauForm }: { dauForm: ReactNode }) {
	const mt = DONG_HN;
	return (
		<form onSubmit={(e) => e.preventDefault()}>
			<FieldGroup>
				{dauForm}
				<div className="grid grid-cols-2 gap-3">
					<Field data-disabled>
						<FieldLabel htmlFor="gy-cap">Cấp</FieldLabel>
						<Select value="phong" disabled>
							<SelectTrigger id="gy-cap">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="phong">Phòng ban</SelectItem>
							</SelectContent>
						</Select>
					</Field>
					<Field data-disabled>
						<FieldLabel htmlFor="gy-don-vi">Đơn vị</FieldLabel>
						<Input id="gy-don-vi" value={mt.donVi} disabled translate="no" />
					</Field>
				</div>
				<FieldDescription>
					Đơn vị và cấp không đổi được sau khi tạo.
				</FieldDescription>
				<Field>
					<FieldLabel htmlFor="gy-ten">Tên mục tiêu</FieldLabel>
					<Input id="gy-ten" defaultValue={mt.ten} translate="no" />
				</Field>
				<Field>
					<FieldLabel htmlFor="gy-loai">Loại</FieldLabel>
					<Select defaultValue={mt.loai}>
						<SelectTrigger id="gy-loai">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="tham-vong">Tham vọng</SelectItem>
							<SelectItem value="cam-ket">Cam kết</SelectItem>
						</SelectContent>
					</Select>
				</Field>
				<Field>
					<FieldLabel htmlFor="gy-chu">Phụ trách</FieldLabel>
					<Input id="gy-chu" defaultValue={mt.phuTrach.ten} translate="no" />
				</Field>
				<Field>
					<FieldLabel htmlFor="gy-vi-sao">Vì sao lúc này</FieldLabel>
					<Textarea id="gy-vi-sao" defaultValue={mt.viSao} translate="no" />
					<FieldDescription>Không bắt buộc, tối đa 500 ký tự.</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	);
}

function CotGopYHienTai() {
	return (
		<section aria-label="Trợ lý OKR" data-cot-gop-y>
			<SheetRailHeader>
				<SheetRailTitle>Trợ lý OKR</SheetRailTitle>
				<Button
					type="button"
					size="icon-sm"
					variant="ghost"
					aria-label="Đóng cột Trợ lý OKR"
				>
					<Icon icon={Close} />
				</Button>
			</SheetRailHeader>
			<ItemDescription>
				{GOP_Y.length} đề xuất. Nhận là ghi ngay, kèm vết «theo đề xuất của Trợ
				lý OKR».
			</ItemDescription>
			<ItemGroup>
				{GOP_Y.map((g) =>
					g.loai === "viet-lai" ? (
						<ProposedChange
							key={g.id}
							density="card"
							kind="rewrite"
							label="Viết lại · Tên KR"
							before={g.truoc}
							value={g.sau}
							rationale={g.lyDo}
							actions={[
								{
									id: "nhan",
									label: "Nhận",
									tone: "primary",
									onClick: KHONG_LAM,
								},
								{
									id: "sua",
									label: "Sửa",
									tone: "secondary",
									onClick: KHONG_LAM,
								},
								{ id: "bac", label: "Bác", tone: "quiet", onClick: KHONG_LAM },
							]}
						/>
					) : (
						<ProposedChange
							key={g.id}
							density="card"
							kind="question"
							label="Câu hỏi"
							value={g.cau}
							actions={[
								{
									id: "bo-qua",
									label: "Bỏ qua",
									tone: "quiet",
									onClick: KHONG_LAM,
								},
							]}
						/>
					),
				)}
			</ItemGroup>
		</section>
	);
}

export function HopSuaMucTieu({ kieu }: { kieu: "hien-tai" | "b" }) {
	const coCot = kieu === "hien-tai";
	return (
		<Sheet open modal={false}>
			<SheetContent
				side="right"
				size={coCot ? "assist" : undefined}
				aria-describedby={undefined}
				data-hop-sua={kieu}
			>
				<SheetHeader>
					<SheetTitle>Sửa mục tiêu</SheetTitle>
				</SheetHeader>
				<SheetBody split={coCot}>
					<FormMucTieu
						dauForm={
							coCot ? (
								<div>
									<Button type="button" variant="outline">
										{GOP_Y.length} đề xuất đang chờ
									</Button>
								</div>
							) : (
								<DongDanSang noi="Quyết ngay dưới từng KR." so={GOP_Y.length} />
							)
						}
					/>
					{coCot ? <CotGopYHienTai /> : null}
				</SheetBody>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Huỷ</Button>
					</SheetClose>
					<Button disabled>Lưu</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

export function HopSuaKr({
	kieu,
	onDong,
}: {
	kieu: "sua" | "moi";
	onDong?: () => void;
}) {
	const router = useRouter();
	const kr = DONG_HN.kr[2];
	const laSua = kieu === "sua";
	const soGopY = GOP_Y.filter((g) => g.krId === kr?.id).length;
	return (
		<Sheet
			open
			modal={false}
			onOpenChange={(mo) => {
				if (mo) return;
				if (onDong) onDong();
				else router.push(`?state=${STATE.bChiTiet}`);
			}}
		>
			<SheetContent
				side="right"
				aria-describedby={undefined}
				data-hop-sua-kr={kieu}
			>
				<SheetHeader>
					<SheetTitle>{laSua ? "Sửa KR" : "Thêm KR"}</SheetTitle>
				</SheetHeader>
				<SheetBody>
					<form onSubmit={(e) => e.preventDefault()}>
						<FieldGroup>
							{laSua && soGopY > 0 ? (
								<DongDanSang noi="Quyết ngay dưới KR này." so={soGopY} />
							) : null}
							<Field>
								<FieldLabel htmlFor="kr-ten">Tên KR</FieldLabel>
								<Input
									id="kr-ten"
									defaultValue={laSua ? kr?.ten : ""}
									placeholder={
										laSua
											? undefined
											: "Ví dụ: Đối tác còn giao dịch sau 60 ngày"
									}
									translate="no"
								/>
							</Field>
							<div className="grid grid-cols-2 gap-3">
								<Field>
									<FieldLabel htmlFor="kr-kieu">Kiểu</FieldLabel>
									<Select defaultValue={laSua ? "moc" : "tang-toi"}>
										<SelectTrigger id="kr-kieu">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="tang-toi">Tăng tới</SelectItem>
											<SelectItem value="phan-tram">Phần trăm</SelectItem>
											<SelectItem value="moc">Mốc</SelectItem>
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<FieldLabel htmlFor="kr-chu">Phụ trách</FieldLabel>
									<Input
										id="kr-chu"
										defaultValue={laSua ? kr?.phuTrach.ten : ""}
										translate="no"
									/>
								</Field>
							</div>
						</FieldGroup>
					</form>
				</SheetBody>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Huỷ</Button>
					</SheetClose>
					<Button disabled>{laSua ? "Lưu" : "Thêm KR"}</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
