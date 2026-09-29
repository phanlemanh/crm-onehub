"use client";

import Add from "@carbon/icons-react/es/Add";
import Subtract from "@carbon/icons-react/es/Subtract";
import { Button } from "@crm/ui/components/button";
import { DatePicker } from "@crm/ui/components/date-picker";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
} from "@crm/ui/components/item";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { Textarea } from "@crm/ui/components/textarea";
import { useState } from "react";
import {
	CHU_KY_MO_DUOC,
	HOI_Y,
	NGUOI_CHON_DUOC,
	SO_LIEU,
	type SoLieuMau,
	TRAN,
} from "./du-lieu";
import { TrongHoiY } from "./khung";

const DONG_NHAP: SoLieuMau[] = [
	...SO_LIEU.slice(0, 2),
	{ id: "quay-lai", nhan: "Khách quay lại", giaTri: "", ghiChu: "" },
];

function loiDong(d: SoLieuMau, so: number): string | null {
	if (d.nhan.trim().length < 2) return `Dòng ${so}: nhãn cần ít nhất 2 ký tự.`;
	if (d.giaTri.trim().length < 1) return `Dòng ${so}: điền giá trị.`;
	return null;
}

function SheetMoHoiY({
	mo,
	onMo,
}: {
	mo: boolean;
	onMo: (mo: boolean) => void;
}) {
	const [cauHoi, setCauHoi] = useState<string>(HOI_Y.cauHoi);
	const [dong, setDong] = useState<SoLieuMau[]>(DONG_NHAP);
	const [ngay, setNgay] = useState("2026-12-08");
	const loi = dong.map((d, i) => loiDong(d, i + 1));
	const cauHoiLoi =
		cauHoi.trim().length < 10 ? "Câu hỏi cần ít nhất 10 ký tự." : null;
	const hopLe = cauHoiLoi === null && loi.every((l) => l === null);
	const soMoi = dong.length + 1;

	const doi = (id: string, truong: keyof SoLieuMau, giaTri: string) =>
		setDong((cu) =>
			cu.map((d) => (d.id === id ? { ...d, [truong]: giaTri } : d)),
		);

	return (
		<Sheet onOpenChange={onMo} open={mo}>
			<SheetContent data-khoi="sheet-mo-hoi-y" side="right" size="md">
				<SheetHeader>
					<SheetTitle>Mở hỏi ý</SheetTitle>
					<SheetDescription>
						Cả công ty trả lời một câu trước khi đặt mục tiêu. Mỗi chu kỳ hỏi
						một lần.
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-col gap-6 overflow-y-auto px-4 pb-6">
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="hoi-y-chu-ky">Chu kỳ</FieldLabel>
							<Select defaultValue={CHU_KY_MO_DUOC[0]}>
								<SelectTrigger id="hoi-y-chu-ky">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{CHU_KY_MO_DUOC.map((k) => (
										<SelectItem key={k} value={k}>
											{k}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldDescription>
								Chỉ chu kỳ đang lập kế hoạch và chưa hỏi ý.
							</FieldDescription>
						</Field>
						<Field data-invalid={cauHoiLoi ? true : undefined}>
							<FieldLabel htmlFor="hoi-y-cau-hoi">Câu hỏi</FieldLabel>
							<Textarea
								aria-invalid={cauHoiLoi ? true : undefined}
								id="hoi-y-cau-hoi"
								maxLength={300}
								onChange={(e) => setCauHoi(e.target.value)}
								translate="no"
								value={cauHoi}
							/>
							{cauHoiLoi ? (
								<FieldError>{cauHoiLoi}</FieldError>
							) : (
								<FieldDescription>
									Khoá lại khi đã có ý đầu tiên.
								</FieldDescription>
							)}
						</Field>
						<Field>
							<FieldLabel htmlFor="hoi-y-loi-mo">Lời mở</FieldLabel>
							<Textarea
								defaultValue={HOI_Y.loiMo}
								id="hoi-y-loi-mo"
								maxLength={1000}
								translate="no"
							/>
							<FieldDescription>
								Vài câu của người chọn: vì sao hỏi, muốn nghe điều gì.
							</FieldDescription>
						</Field>
					</FieldGroup>
					<FieldSet>
						<FieldLegend>Con số mở đầu</FieldLegend>
						<FieldDescription>
							{TRAN.soLieu.it}–{TRAN.soLieu.nhieu} con số để mọi người nhìn cùng
							một chỗ trước khi góp.
						</FieldDescription>
						<ItemGroup>
							{dong.map((d, i) => (
								<Item data-dong={i + 1} key={d.id} size="sm" variant="outline">
									<ItemContent>
										<div className="grid gap-2 sm:grid-cols-3">
											<Field
												data-invalid={loi[i] && !d.nhan ? true : undefined}
											>
												<FieldLabel htmlFor={`so-nhan-${d.id}`}>
													Nhãn
												</FieldLabel>
												<Input
													id={`so-nhan-${d.id}`}
													maxLength={60}
													onChange={(e) => doi(d.id, "nhan", e.target.value)}
													translate="no"
													value={d.nhan}
												/>
											</Field>
											<Field
												data-invalid={
													loi[i] && d.nhan && !d.giaTri ? true : undefined
												}
											>
												<FieldLabel htmlFor={`so-gia-tri-${d.id}`}>
													Giá trị
												</FieldLabel>
												<Input
													aria-invalid={
														loi[i] && d.nhan && !d.giaTri ? true : undefined
													}
													id={`so-gia-tri-${d.id}`}
													maxLength={40}
													onChange={(e) => doi(d.id, "giaTri", e.target.value)}
													translate="no"
													value={d.giaTri}
												/>
											</Field>
											<Field>
												<FieldLabel htmlFor={`so-ghi-chu-${d.id}`}>
													Ghi chú
												</FieldLabel>
												<Input
													id={`so-ghi-chu-${d.id}`}
													maxLength={120}
													onChange={(e) => doi(d.id, "ghiChu", e.target.value)}
													translate="no"
													value={d.ghiChu}
												/>
											</Field>
										</div>
										{loi[i] ? <FieldError>{loi[i]}</FieldError> : null}
									</ItemContent>
									<ItemActions>
										<Button
											aria-label={`Bỏ dòng ${i + 1}`}
											disabled={dong.length <= TRAN.soLieu.it}
											onClick={() =>
												setDong((cu) => cu.filter((x) => x.id !== d.id))
											}
											size="icon-sm"
											variant="ghost"
										>
											<Icon icon={Subtract} />
										</Button>
									</ItemActions>
								</Item>
							))}
						</ItemGroup>
						<div>
							<Button
								disabled={dong.length >= TRAN.soLieu.nhieu}
								onClick={() =>
									setDong((cu) => [
										...cu,
										{ id: `moi-${soMoi}`, nhan: "", giaTri: "", ghiChu: "" },
									])
								}
								size="sm"
								variant="ghost"
							>
								<Icon data-icon="inline-start" icon={Add} />
								Thêm dòng
							</Button>
						</div>
					</FieldSet>
					<FieldGroup>
						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="hoi-y-han-ngay">Hạn — ngày</FieldLabel>
								<DatePicker
									id="hoi-y-han-ngay"
									onChange={setNgay}
									value={ngay}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="hoi-y-han-gio">Hạn — giờ</FieldLabel>
								<Input defaultValue="17:00" id="hoi-y-han-gio" type="time" />
							</Field>
						</div>
						<FieldDescription>
							Giờ Việt Nam. Ít nhất 24 giờ, nhiều nhất 7 ngày kể từ lúc mở.
						</FieldDescription>
						<Field>
							<FieldLabel htmlFor="hoi-y-nguoi-chon">Người chọn</FieldLabel>
							<Select defaultValue={NGUOI_CHON_DUOC[0]?.id}>
								<SelectTrigger id="hoi-y-nguoi-chon">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{NGUOI_CHON_DUOC.map((n) => (
										<SelectItem key={n.id} value={n.id}>
											<span translate="no">{n.ten}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldDescription>
								Chỉ quản trị. Người chọn viết trước, kết luận từng chủ đề và
								công bố; người chọn không góp ý.
							</FieldDescription>
						</Field>
					</FieldGroup>
				</div>
				<SheetFooter>
					<div className="flex items-center justify-between gap-2">
						<SheetClose asChild>
							<Button variant="outline">Huỷ</Button>
						</SheetClose>
						<Button disabled={!hopLe}>Mở</Button>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

export function MoHoiYMan() {
	const [mo, setMo] = useState(true);
	return (
		<>
			<TrongHoiY onMo={() => setMo(true)} quanTri />
			<SheetMoHoiY mo={mo} onMo={setMo} />
		</>
	);
}
