"use client";

import Help from "@carbon/icons-react/es/Help";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { Textarea } from "@crm/ui/components/textarea";
import { NGUOI } from "../ban-mau-okr/du-lieu";
import { LoaiMucTieuNhan, TenNguoi } from "../ban-mau-okr/phan-chung";
import { KY_CHAM } from "./du-lieu";

export type HinhDat = "ly-do" | "hoi" | "doi-trong" | "dai-ra";

function DaiRa() {
	return (
		<Alert variant="warning">
			<AlertTitle>Đang rà giữa kỳ tới hết {KY_CHAM.raDen}</AlertTitle>
			<AlertDescription>
				Sửa đích lúc này không cần lý do. Sau {KY_CHAM.raDen}, sửa đích phải ghi
				lý do và KR mang nhãn «đích sửa ngoài rà» tới lúc chấm.
			</AlertDescription>
		</Alert>
	);
}

function HoiDuoiO({ cau }: { cau: string }) {
	return <FieldDescription data-hoi-chat-luong>Hỏi: {cau}</FieldDescription>;
}

function HopThoaiKr({ hinh }: { hinh: "ly-do" | "hoi" }) {
	const laHoi = hinh === "hoi";
	return (
		<Dialog open>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{laHoi ? "Thêm KR" : "Sửa KR"}</DialogTitle>
					<DialogDescription>
						<span translate="no">Đối tác mới được đỡ trọn tháng đầu</span> ·{" "}
						{laHoi ? "nháp" : "đã công bố"}
					</DialogDescription>
				</DialogHeader>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="kr-ten">Tên KR</FieldLabel>
						<Input
							defaultValue={
								laHoi
									? "Gọi điện chào mừng mọi đối tác mới"
									: "Đối tác chấm hài lòng từ 4/5"
							}
							id="kr-ten"
							translate="no"
						/>
						{laHoi ? (
							<HoiDuoiO cau="Câu này đọc như một việc làm. Làm xong thì con số nào đổi?" />
						) : null}
					</Field>
					<Field>
						<FieldLabel htmlFor="kr-kieu">Kiểu</FieldLabel>
						<Select defaultValue="tang-toi">
							<SelectTrigger id="kr-kieu">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="tang-toi">Tăng tới</SelectItem>
								<SelectItem value="giam-xuong">Giảm xuống</SelectItem>
								<SelectItem value="giu-tren">Giữ trên</SelectItem>
								<SelectItem value="giu-duoi">Giữ dưới</SelectItem>
								<SelectItem value="moc">Mốc</SelectItem>
								<SelectItem value="phan-tram">Phần trăm</SelectItem>
							</SelectContent>
						</Select>
					</Field>
					<div className="grid grid-cols-2 gap-4">
						<Field>
							<FieldLabel htmlFor="kr-khoi">Khởi điểm</FieldLabel>
							<Input
								defaultValue={laHoi ? "0" : "60"}
								disabled={!laHoi}
								id="kr-khoi"
								inputMode="decimal"
							/>
							{laHoi ? (
								<HoiDuoiO cau="Khởi điểm 0 là số thật, hay chưa đo?" />
							) : (
								<FieldDescription>Đã khoá khi công bố.</FieldDescription>
							)}
						</Field>
						<Field>
							<FieldLabel htmlFor="kr-dich">Đích</FieldLabel>
							<Input
								defaultValue={laHoi ? "40" : "80"}
								id="kr-dich"
								inputMode="decimal"
							/>
							{laHoi ? null : (
								<FieldDescription>Trước đây: 85</FieldDescription>
							)}
						</Field>
					</div>
					{laHoi ? null : (
						<Field>
							<FieldLabel htmlFor="kr-ly-do-dich">Lý do đổi đích</FieldLabel>
							<Textarea id="kr-ly-do-dich" rows={2} translate="no" />
							<FieldDescription>
								Ngoài rà giữa kỳ ({KY_CHAM.raTu} – {KY_CHAM.raDen}). KR sẽ mang
								nhãn «đích sửa ngoài rà» tới lúc chấm. Từ 10 đến 500 ký tự.
							</FieldDescription>
						</Field>
					)}
				</FieldGroup>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button disabled={!laHoi}>Lưu</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

const COT = [
	{ id: "kr", header: "KR" },
	{ id: "kieu", header: "Kiểu", width: "w-[18%]" },
	{
		id: "so",
		header: "Khởi điểm → đích",
		width: "w-[24%]",
		className: "hidden md:table-cell",
	},
] satisfies SimpleTableColumn[];

const KR_MOT_CHIEU = [
	{ id: "k1", ten: "Thoả thuận mới trong quý", so: "12 → 30" },
	{ id: "k2", ten: "Cuộc gọi chiến dịch hẹn được", so: "40 → 120" },
	{ id: "k3", ten: "Đối tác mới ký hợp tác", so: "5 → 15" },
] as const;

function SheetDoiTrong() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<span translate="no">Mở rộng mạng lưới đối tác khu phía Nam</span>
				</CardTitle>
				<CardDescription className="flex flex-wrap items-center gap-3">
					<LoaiMucTieuNhan loai="tham-vong" />
					<span>
						Kinh doanh 2 · Phụ trách{" "}
						<TenNguoi avatar={false} ten={NGUOI.tuan.ten} /> · nháp
					</span>
				</CardDescription>
				<CardAction>
					<Button size="sm" variant="outline">
						Thêm KR
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<Alert variant="warning">
					<Icon icon={Help} />
					<AlertTitle>Mọi KR đều đẩy một con số lên</AlertTitle>
					<AlertDescription>
						Có KR nào giữ chất lượng không — ví dụ tỷ lệ thoả thuận huỷ giữ dưới
						một mức? Câu hỏi này không chặn công bố.
					</AlertDescription>
				</Alert>
				<SimpleTable columns={COT}>
					{KR_MOT_CHIEU.map((k) => (
						<SimpleTableRow key={k.id}>
							<TableCell className="px-3 py-3 whitespace-normal">
								<span className="text-sm" translate="no">
									{k.ten}
								</span>
							</TableCell>
							<TableCell className="px-3 py-3 text-sm">Tăng tới</TableCell>
							<TableCell className="hidden px-3 py-3 text-sm tabular-nums md:table-cell">
								{k.so}
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</CardContent>
		</Card>
	);
}

export function DatOkr({ hinh }: { hinh: HinhDat }) {
	if (hinh === "doi-trong")
		return (
			<div className="flex flex-col gap-4" data-ban-mau="doi-trong">
				<SheetDoiTrong />
			</div>
		);
	if (hinh === "dai-ra")
		return (
			<div className="flex flex-col gap-4" data-ban-mau="dai-ra">
				<DaiRa />
				<p className="text-muted-foreground text-sm">
					Dải này đứng dưới thanh tab ở mọi tab OKR trong khoảng rà; ngoài
					khoảng rà, dải không hiện.
				</p>
			</div>
		);
	return (
		<div className="flex flex-col gap-4" data-ban-mau={`kr-${hinh}`}>
			<HopThoaiKr hinh={hinh} />
		</div>
	);
}
