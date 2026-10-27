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
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { Textarea } from "@crm/ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useState } from "react";
import {
	BO_OKR,
	HOP,
	type KrHop,
	type LanCapNhat,
	type TuTin,
} from "./du-lieu";
import { OMucDoi } from "./o-dong";
import { dinhDangSo, docSo, soSanh, soTran } from "./tinh";

const MUC_TU_TIN: TuTin[] = ["cao", "vua", "thap"];

function LanTruoc({ kr }: { kr: KrHop }) {
	const [truoc] = kr.lan;
	return (
		<Item data-lan-truoc="" variant="muted">
			<ItemContent>
				<ItemTitle>Lần cập nhật trước · {truoc.ngay}</ItemTitle>
				<ItemDescription unclamped>
					{dinhDangSo(truoc.giaTri, kr.donViDo)}
					{truoc.ghiChu ? (
						<>
							{" · "}
							<span translate="no">«{truoc.ghiChu}»</span>
						</>
					) : null}
				</ItemDescription>
			</ItemContent>
			<ConfidenceIndicator level={truoc.tuTin} size="sm" />
		</Item>
	);
}

export function HopCapNhatKr({
	kr,
	onDong,
	onGui,
}: {
	kr: KrHop;
	onDong: () => void;
	onGui: (lan: LanCapNhat) => void;
}) {
	const [truoc] = kr.lan;
	const [chu, setChu] = useState(soTran(truoc.giaTri));
	const [tuTin, setTuTin] = useState<TuTin>(truoc.tuTin);
	const [ghiChu, setGhiChu] = useState("");
	const so = docSo(chu);
	const doi =
		so === null ? null : soSanh(so, kr.lan[0].giaTri, kr.donViDo, truoc.ngay);

	const gui = () => {
		if (so === null) return;
		const ghi = ghiChu.trim();
		onGui({
			ngay: BO_OKR.vuaGui,
			giaTri: so,
			tuTin,
			ghiChu: ghi === "" ? null : ghi,
		});
	};

	return (
		<Dialog open onOpenChange={(mo) => (mo ? null : onDong())}>
			<DialogContent data-hop-cap-nhat-kr={kr.id}>
				<DialogHeader>
					<DialogTitle>Cập nhật</DialogTitle>
					<DialogDescription translate="no">{kr.tieuDe}</DialogDescription>
				</DialogHeader>
				<LanTruoc kr={kr} />
				<Field data-invalid={so === null ? "" : undefined}>
					<FieldLabel htmlFor="ht2-gia-tri">Giá trị ({kr.donViDo})</FieldLabel>
					<Input
						aria-invalid={so === null}
						id="ht2-gia-tri"
						inputMode="decimal"
						onChange={(e) => setChu(e.target.value)}
						value={chu}
					/>
					{so === null ? (
						<FieldError>Ô này nhận số, ví dụ 1.234,5</FieldError>
					) : (
						<FieldDescription>
							Đích {dinhDangSo(kr.dich, kr.donViDo)}
						</FieldDescription>
					)}
				</Field>
				{doi ? (
					<div className="flex flex-col gap-1" data-muc-doi-xem-truoc="">
						<span className="text-muted-foreground text-xs">
							Mức đổi trên bảng sau khi gửi
						</span>
						<OMucDoi doi={doi} />
					</div>
				) : null}
				<Field>
					<FieldLabel>Mức tự tin</FieldLabel>
					<ToggleGroup
						onValueChange={(v) => {
							const chon = MUC_TU_TIN.find((m) => m === v);
							if (chon) setTuTin(chon);
						}}
						size="sm"
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
					<FieldLabel htmlFor="ht2-ghi-chu">Ghi chú</FieldLabel>
					<Textarea
						id="ht2-ghi-chu"
						maxLength={HOP.ghiChuToiDa}
						onChange={(e) => setGhiChu(e.target.value)}
						placeholder="Điều gì đổi, cần ai giúp"
						value={ghiChu}
					/>
					<FieldDescription>
						Hiện ngay ở cột Ghi chú mới nhất của bảng Họp tuần.
					</FieldDescription>
				</Field>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Huỷ</Button>
					</DialogClose>
					<Button disabled={so === null} onClick={gui}>
						Gửi cập nhật
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
