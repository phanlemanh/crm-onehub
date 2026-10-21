"use client";

import { Button } from "@crm/ui/components/button";
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
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { TargetLineChart } from "@crm/ui/components/target-line-chart";
import { Textarea } from "@crm/ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useState } from "react";
import type { KrMau, MucTuTin } from "../ban-mau-okr/du-lieu";
import { giaTri } from "../ban-mau-okr/phan-chung";
import { diemDoThi, KY_VONG, tienDoVoi } from "./du-lieu";

type HopCapNhatProps = {
	kr: KrMau;
	giaTriDau?: string;
	onDong: () => void;
	onGui: (giaTri: number, tuTin: MucTuTin) => void;
};

function docSo(chu: string): number | null {
	const sach = chu.trim().replace(",", ".");
	if (sach === "") return null;
	const n = Number(sach);
	return Number.isFinite(n) ? n : null;
}

function XemTruoc({ kr, moi }: { kr: KrMau; moi: number }) {
	const phanTram = tienDoVoi(kr, moi);
	return (
		<div className="flex flex-col gap-2" data-xem-truoc>
			<TargetLineChart
				data={diemDoThi(kr, moi)}
				height={140}
				label={`Xem trước điểm mới của ${kr.ten}`}
				target={kr.dich}
				targetLabel={`Đích ${giaTri(kr, kr.dich)}`}
			/>
			<p className="text-muted-foreground text-xs" data-tien-do-moi>
				Điểm cuối là giá trị đang gõ · tiến độ mới {phanTram}% · lẽ ra {KY_VONG}
				%
			</p>
		</div>
	);
}

export function HopCapNhat({
	kr,
	giaTriDau = "",
	onDong,
	onGui,
}: HopCapNhatProps) {
	const [chu, setChu] = useState(giaTriDau);
	const [moc, setMoc] = useState<string>(kr.hienTai >= 1 ? "xong" : "chua");
	const [tuTin, setTuTin] = useState<string>("");
	const laMoc = kr.kieu === "moc";
	const so = laMoc ? (moc === "xong" ? 1 : 0) : docSo(chu);
	const sai = !laMoc && chu.trim() !== "" && so === null;
	const guiDuoc = so !== null && tuTin !== "";
	return (
		<Dialog onOpenChange={(mo) => (mo ? null : onDong())} open>
			<DialogContent data-hop-cap-nhat-kr>
				<DialogHeader>
					<DialogTitle>Cập nhật KR</DialogTitle>
					<DialogDescription translate="no">{kr.ten}</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					{laMoc ? (
						<Field>
							<FieldLabel>Mốc</FieldLabel>
							<ToggleGroup
								onValueChange={(v) => (v ? setMoc(v) : null)}
								type="single"
								value={moc}
								variant="outline"
							>
								<ToggleGroupItem value="chua">Chưa xong</ToggleGroupItem>
								<ToggleGroupItem value="xong">Xong</ToggleGroupItem>
							</ToggleGroup>
							<FieldDescription>Đích: xong trước 31/12</FieldDescription>
						</Field>
					) : (
						<Field data-invalid={sai || undefined}>
							<FieldLabel htmlFor="gia-tri-moi">Giá trị mới</FieldLabel>
							<Input
								aria-invalid={sai || undefined}
								autoComplete="off"
								autoFocus
								id="gia-tri-moi"
								inputMode="decimal"
								name="gia-tri"
								onChange={(e) => setChu(e.target.value)}
								value={chu}
							/>
							<FieldDescription>
								Lần trước {giaTri(kr)} · đích {giaTri(kr, kr.dich)}
							</FieldDescription>
							{sai ? <FieldError>Nhập một con số, ví dụ 78.</FieldError> : null}
						</Field>
					)}
					{!laMoc && so !== null ? <XemTruoc kr={kr} moi={so} /> : null}
					<Field>
						<FieldLabel>Mức tự tin</FieldLabel>
						<ToggleGroup
							onValueChange={setTuTin}
							type="single"
							value={tuTin}
							variant="outline"
						>
							<ToggleGroupItem value="cao">Cao</ToggleGroupItem>
							<ToggleGroupItem value="vua">Vừa</ToggleGroupItem>
							<ToggleGroupItem value="thap">Thấp</ToggleGroupItem>
						</ToggleGroup>
					</Field>
					<Field>
						<FieldLabel htmlFor="ghi-chu-moi">Ghi chú (tuỳ chọn)</FieldLabel>
						<Textarea id="ghi-chu-moi" maxLength={200} name="ghi-chu" />
					</Field>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button
						data-nut="gui-cap-nhat-kr"
						disabled={!guiDuoc}
						onClick={() => (so !== null ? onGui(so, tuTin as MucTuTin) : null)}
					>
						Gửi cập nhật
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
