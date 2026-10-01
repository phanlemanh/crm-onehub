"use client";

import Close from "@carbon/icons-react/es/Close";
import Sparkle from "@carbon/icons-react/es/MagicWand";
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
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
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
import { GOP_Y, MUC_TIEU, STATE } from "./du-lieu";

const KHONG_LAM = () => undefined;

function FormMucTieu({ dauForm }: { dauForm: React.ReactNode }) {
	const mt = MUC_TIEU;
	return (
		<form onSubmit={(e) => e.preventDefault()}>
			<FieldGroup>
				{dauForm}
				<div className="grid grid-cols-2 gap-3">
					<Field data-disabled>
						<FieldLabel htmlFor="gy-cap">Cấp</FieldLabel>
						<Select value="toan" disabled>
							<SelectTrigger id="gy-cap">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="toan">Toàn OneHub</SelectItem>
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
					<Select defaultValue="tham-vong">
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
					<Input id="gy-chu" defaultValue={mt.phuTrach} translate="no" />
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
				2 đề xuất. Nhận là ghi ngay, kèm vết «theo đề xuất của Trợ lý OKR».
			</ItemDescription>
			<ItemGroup>
				{GOP_Y.map((g) => (
					<ProposedChange
						key={g.id}
						kind={g.kind}
						label={g.nhan}
						before={g.truoc}
						value={g.sau}
						rationale={g.lyDo}
						actions={
							g.kind === "rewrite"
								? [
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
										{
											id: "bac",
											label: "Bác",
											tone: "quiet",
											onClick: KHONG_LAM,
										},
									]
								: [
										{
											id: "bo-qua",
											label: "Bỏ qua",
											tone: "quiet",
											onClick: KHONG_LAM,
										},
									]
						}
					/>
				))}
			</ItemGroup>
		</section>
	);
}

function DongDanSangMucTieu() {
	return (
		<Item size="sm" variant="outline" data-dan-sang-muc-tieu>
			<ItemMedia variant="icon">
				<Icon icon={Sparkle} />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>2 góp ý của Trợ lý OKR đang chờ</ItemTitle>
				<ItemDescription>
					Quyết ở trang Mục tiêu, nơi có đủ các KR.
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button asChild size="sm" variant="outline">
					<Link href={`?state=${STATE.bChiTiet}`}>Xem góp ý</Link>
				</Button>
			</ItemActions>
		</Item>
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
										2 đề xuất đang chờ
									</Button>
								</div>
							) : (
								<DongDanSangMucTieu />
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
