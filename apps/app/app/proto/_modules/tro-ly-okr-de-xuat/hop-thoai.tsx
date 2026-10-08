"use client";

import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import Close from "@carbon/icons-react/es/Close";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldError,
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
import { Shimmer } from "@crm/ui/components/shimmer";
import { Skeleton } from "@crm/ui/components/skeleton";
import { Textarea } from "@crm/ui/components/textarea";
import { DONG, type DongMau, KR, MUC_TIEU } from "./du-lieu";

export type HinhHop =
	| "nut"
	| "nut-khoa-sua"
	| "dang-soan"
	| "co-dong"
	| "sua-dong"
	| "da-quyet"
	| "rong"
	| "loi"
	| "loi-nhan"
	| "het-tran"
	| "het-luot"
	| "dang-cho"
	| "huong-chuyen-man";

const NHAN_LOAI = {
	"viet-lai": "Viết lại",
	hoi: "Câu hỏi",
	"can-chinh": "Căn chỉnh",
} as const;

function DongDeXuat({
	dong,
	sua,
	daQuyet,
	loiNhan,
}: {
	dong: DongMau;
	sua: boolean;
	daQuyet: "nhan" | "bac" | null;
	loiNhan: boolean;
}) {
	if (daQuyet) {
		return (
			<Item size="xs" variant="muted" data-dong={dong.id}>
				<ItemContent>
					<ItemDescription>
						{dong.o} — {daQuyet === "nhan" ? "Đã nhận" : "Đã bác"}
					</ItemDescription>
				</ItemContent>
			</Item>
		);
	}
	return (
		<Item size="sm" variant="outline" data-dong={dong.id}>
			<ItemContent>
				<ItemDescription>
					{NHAN_LOAI[dong.loai]} · {dong.o}
				</ItemDescription>
				{dong.truoc ? (
					<p className="text-muted-foreground line-through" translate="no">
						{dong.truoc}
					</p>
				) : null}
				{sua ? (
					<Field>
						<FieldLabel htmlFor={`sua-${dong.id}`} className="sr-only">
							Sửa câu đề xuất
						</FieldLabel>
						<Textarea
							id={`sua-${dong.id}`}
							defaultValue={dong.sau}
							translate="no"
						/>
					</Field>
				) : (
					<p translate="no">{dong.sau}</p>
				)}
				{dong.loai === "hoi" ? null : (
					<ItemDescription>{dong.lyDo}</ItemDescription>
				)}
				{loiNhan ? (
					<FieldError>
						Chu kỳ đã khoá sửa — không nhận được đề xuất này.
					</FieldError>
				) : null}
				<ItemActions>
					{sua ? (
						<>
							<Button size="sm">Nhận bản đã sửa</Button>
							<Button size="sm" variant="ghost">
								Huỷ
							</Button>
						</>
					) : dong.loai === "hoi" ? (
						<Button size="sm" variant="outline">
							Bỏ qua
						</Button>
					) : (
						<>
							<Button size="sm" variant="outline">
								Nhận
							</Button>
							{dong.loai === "viet-lai" ? (
								<Button size="sm" variant="ghost">
									Sửa
								</Button>
							) : null}
							<Button size="sm" variant="ghost">
								Bác
							</Button>
						</>
					)}
				</ItemActions>
			</ItemContent>
		</Item>
	);
}

function CotGopY({ hinh }: { hinh: HinhHop }) {
	const dau = (
		<div className="flex items-center justify-between gap-2">
			<p className="font-medium">Trợ lý OKR</p>
			<Button size="icon-sm" variant="ghost" aria-label="Đóng cột Trợ lý OKR">
				<Icon icon={Close} />
			</Button>
		</div>
	);
	if (hinh === "dang-soan") {
		return (
			<section aria-label="Trợ lý OKR" aria-busy="true" data-cot-gop-y>
				{dau}
				<Shimmer>Trợ lý OKR đang đọc Mục tiêu này…</Shimmer>
				<div className="mt-3 flex flex-col gap-2">
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-14 w-full" />
				</div>
			</section>
		);
	}
	if (hinh === "rong" || hinh === "loi") {
		return (
			<section aria-label="Trợ lý OKR" data-cot-gop-y>
				{dau}
				<Empty>
					<EmptyHeader>
						<EmptyTitle>
							{hinh === "rong"
								? "Trợ lý OKR không thấy chỗ nào cần sửa"
								: "Trợ lý OKR chưa trả lời được, thử lại sau"}
						</EmptyTitle>
						{hinh === "rong" ? (
							<EmptyDescription>
								Tên, «vì sao lúc này» và các KR đã đọc ổn.
							</EmptyDescription>
						) : null}
					</EmptyHeader>
					{hinh === "loi" ? (
						<EmptyContent>
							<Button size="sm" variant="outline">
								Thử lại
							</Button>
						</EmptyContent>
					) : null}
				</Empty>
			</section>
		);
	}
	return (
		<section aria-label="Trợ lý OKR" data-cot-gop-y>
			{dau}
			<p className="mb-3 text-muted-foreground">
				{hinh === "da-quyet"
					? "Còn 2 đề xuất. Nhận là ghi ngay, kèm vết «theo đề xuất của Trợ lý OKR»."
					: "4 đề xuất. Nhận là ghi ngay, kèm vết «theo đề xuất của Trợ lý OKR»."}
			</p>
			<ItemGroup>
				{DONG.map((d) => (
					<DongDeXuat
						key={d.id}
						dong={d}
						sua={hinh === "sua-dong" && d.id === "d2"}
						daQuyet={
							hinh === "da-quyet" && d.id === "d1"
								? "nhan"
								: hinh === "da-quyet" && d.id === "d4"
									? "bac"
									: null
						}
						loiNhan={hinh === "loi-nhan" && d.id === "d1"}
					/>
				))}
			</ItemGroup>
		</section>
	);
}

function NutGopY({ hinh }: { hinh: HinhHop }) {
	if (hinh === "het-tran" || hinh === "het-luot" || hinh === "nut-khoa-sua") {
		return (
			<Field data-disabled>
				<Button variant="outline" disabled className="w-fit">
					Nhờ Trợ lý OKR góp ý
				</Button>
				<FieldDescription>
					{hinh === "het-tran"
						? "Trợ lý OKR tạm nghỉ tới 01/11 — đã chạm trần tháng."
						: hinh === "het-luot"
							? "Bạn đã dùng hết lượt góp ý hôm nay."
							: "Lưu thay đổi trước khi nhờ góp ý — Trợ lý OKR đọc bản đã lưu."}
				</FieldDescription>
			</Field>
		);
	}
	return (
		<Button variant="outline" className="w-fit" data-nut="gop-y">
			{hinh === "dang-cho" ? "3 đề xuất đang chờ" : "Nhờ Trợ lý OKR góp ý"}
		</Button>
	);
}

function FormMucTieu({ hinh }: { hinh: HinhHop }) {
	const ten =
		hinh === "da-quyet"
			? "Không thoả thuận nào của miền Bắc bị mất dấu"
			: hinh === "nut-khoa-sua"
				? `${MUC_TIEU.ten} năm 2027`
				: MUC_TIEU.ten;
	return (
		<FieldGroup>
			<NutGopY hinh={hinh} />
			<div className="grid grid-cols-2 gap-3">
				<Field data-disabled>
					<FieldLabel htmlFor="mt-cap">Cấp</FieldLabel>
					<Input id="mt-cap" value="Phòng ban" disabled readOnly />
				</Field>
				<Field data-disabled>
					<FieldLabel htmlFor="mt-don-vi">Đơn vị</FieldLabel>
					<Input
						id="mt-don-vi"
						value={MUC_TIEU.donVi}
						disabled
						readOnly
						translate="no"
					/>
				</Field>
			</div>
			<Field>
				<FieldLabel htmlFor="mt-ten">Tên Mục tiêu</FieldLabel>
				<Input id="mt-ten" defaultValue={ten} translate="no" key={ten} />
			</Field>
			<Field>
				<FieldLabel htmlFor="mt-phu-trach">Phụ trách</FieldLabel>
				<Input
					id="mt-phu-trach"
					defaultValue={MUC_TIEU.phuTrach}
					translate="no"
				/>
			</Field>
			<Field>
				<FieldLabel htmlFor="mt-vi-sao">Vì sao lúc này</FieldLabel>
				<Textarea id="mt-vi-sao" defaultValue={MUC_TIEU.viSao} translate="no" />
			</Field>
		</FieldGroup>
	);
}

const CO_COT: HinhHop[] = [
	"dang-soan",
	"co-dong",
	"sua-dong",
	"da-quyet",
	"rong",
	"loi",
	"loi-nhan",
	"dang-cho",
];

export function HopThoaiMucTieu({ hinh }: { hinh: HinhHop }) {
	if (hinh === "huong-chuyen-man") return <HuongChuyenMan />;
	const coCot = CO_COT.includes(hinh);
	return (
		<Sheet open modal={false}>
			<SheetContent side="right" size={coCot ? "assist" : undefined}>
				<SheetHeader>
					<SheetTitle>Sửa mục tiêu</SheetTitle>
				</SheetHeader>
				<SheetBody split={coCot}>
					<FormMucTieu hinh={hinh} />
					{coCot ? <CotGopY hinh={hinh} /> : null}
				</SheetBody>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline">Huỷ</Button>
					</SheetClose>
					<Button disabled={hinh !== "nut-khoa-sua"}>Lưu</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

function HuongChuyenMan() {
	return (
		<Sheet open modal={false}>
			<SheetContent side="right">
				<SheetHeader>
					<SheetTitle>Trợ lý OKR góp ý</SheetTitle>
					<SheetDescription translate="no">{MUC_TIEU.ten}</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<Alert>
						<AlertTitle>
							Hướng «Chuyển màn trong hộp» — máy không khuyên
						</AlertTitle>
						<AlertDescription>
							Động cơ: hộp giữ bề rộng cũ, điện thoại không phải xếp hai cột.
							Đánh đổi: người không thấy ô sắp đổi; nhận xong phải quay lại form
							mới thấy câu mới nằm đâu. Máy khuyên «Cột cạnh form» (các trạng
							thái khác).
						</AlertDescription>
					</Alert>
					<Button variant="ghost" size="sm" className="w-fit">
						<Icon icon={ArrowLeft} />
						Quay lại sửa
					</Button>
					<ItemGroup>
						{DONG.slice(0, 2).map((d) => (
							<DongDeXuat
								key={d.id}
								dong={d}
								sua={false}
								daQuyet={null}
								loiNhan={false}
							/>
						))}
					</ItemGroup>
				</SheetBody>
			</SheetContent>
		</Sheet>
	);
}

export type HinhKr = "cot" | "xu-huong" | "khong-xu-huong";

export function HopThoaiKr({ hinh }: { hinh: HinhKr }) {
	const coCot = hinh === "cot";
	const dong = DONG.filter((d) => d.id === "d2");
	return (
		<Sheet open modal={false}>
			<SheetContent side="right" size={coCot ? "assist" : undefined}>
				<SheetHeader>
					<SheetTitle>Sửa KR</SheetTitle>
					<SheetDescription translate="no">{MUC_TIEU.ten}</SheetDescription>
				</SheetHeader>
				<SheetBody split={coCot}>
					<FieldGroup>
						<Button variant="outline" className="w-fit">
							Nhờ Trợ lý OKR góp ý
						</Button>
						<Field>
							<FieldLabel htmlFor="kr-ten">Tên KR</FieldLabel>
							<Input
								id="kr-ten"
								defaultValue={coCot ? "Gọi 50 cuộc mỗi tuần" : KR.ten}
								translate="no"
							/>
						</Field>
						{coCot ? null : <FieldDescription>{KR.nguon}</FieldDescription>}
						<div className="grid grid-cols-2 gap-3">
							<Field data-disabled>
								<FieldLabel htmlFor="kr-khoi">Khởi điểm</FieldLabel>
								<Input id="kr-khoi" value={KR.khoi} disabled readOnly />
								<FieldDescription>Đã khoá khi công bố.</FieldDescription>
							</Field>
							<Field>
								<FieldLabel htmlFor="kr-dich">Đích</FieldLabel>
								<Input
									id="kr-dich"
									defaultValue={KR.dich}
									inputMode="decimal"
								/>
								{hinh === "xu-huong" ? (
									<FieldDescription data-xu-huong>
										{KR.xuHuong}
									</FieldDescription>
								) : null}
							</Field>
						</div>
					</FieldGroup>
					{coCot ? (
						<section aria-label="Trợ lý OKR" data-cot-gop-y>
							<p className="mb-3 font-medium">Trợ lý OKR · chỉ KR này</p>
							<ItemGroup>
								{dong.map((d) => (
									<DongDeXuat
										key={d.id}
										dong={d}
										sua={false}
										daQuyet={null}
										loiNhan={false}
									/>
								))}
							</ItemGroup>
						</section>
					) : null}
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
