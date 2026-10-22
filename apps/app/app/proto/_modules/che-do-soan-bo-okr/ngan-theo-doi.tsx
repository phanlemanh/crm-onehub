"use client";

import { Button } from "@crm/ui/components/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { KaraMark } from "@crm/ui/components/kara";
import { KaraProposal } from "@crm/ui/components/kara/proposal";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@crm/ui/components/popover";
import { Progress } from "@crm/ui/components/progress";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { DetailSheet, DetailSheetHeader } from "@/components/detail-sheet";
import { BO, GOP_Y, MT_MOI_DA_NHAN } from "./du-lieu";

const CHU = {
	trangThai: "Đã công bố",
	chip: (n: number) => `${n} góp ý`,
	chipMoTa: "Bấm chip mở chế độ Soạn ở đúng mục tiêu này; góp ý nằm ở cột bên.",
	loiKhuyen:
		"Phương án khác — máy không khuyên. Máy khuyên chip mở chế độ Soạn (trạng thái «Ngăn theo dõi — một chip»): góp ý và chỗ sửa nằm cùng một màn, ngăn theo dõi chỉ còn việc theo dõi. Phương án này giữ người ở ngăn nhưng đưa lại khối góp ý vào chỗ theo dõi — đúng cái vòng này gỡ.",
	tienDo: (p: number) => `${p}% tới đích`,
} as const;

const TIEN_DO = [34, 50, 27];

function DanhSachKr() {
	return (
		<ItemGroup>
			{MT_MOI_DA_NHAN.kr.map((kr, i) => (
				<Item key={kr.id} size="sm" variant="outline" data-kr-theo-doi={kr.id}>
					<ItemContent>
						<ItemTitle>
							<span translate="no">{kr.ten}</span>
						</ItemTitle>
						<ItemDescription>
							{kr.khoiDiem} → {kr.dich} {kr.donViDo} ·{" "}
							{CHU.tienDo(TIEN_DO[i] ?? 0)}
						</ItemDescription>
						<Progress value={TIEN_DO[i] ?? 0} aria-label={kr.ten} />
					</ItemContent>
				</Item>
			))}
		</ItemGroup>
	);
}

export function NganTheoDoi({ moTaiCho }: { moTaiCho: boolean }) {
	const chip = (
		<Button variant="outline" size="sm" type="button" data-chip-gop-y="">
			<KaraMark scope={CHU.chip(GOP_Y.length)} />
		</Button>
	);
	return (
		<DetailSheet open onOpenChange={() => {}}>
			<DetailSheetHeader
				title={<span translate="no">{MT_MOI_DA_NHAN.ten}</span>}
				description={
					<>
						<span translate="no">{BO.donVi}</span> · {BO.chuKy}
					</>
				}
				actions={
					moTaiCho ? (
						<Popover open>
							<PopoverAnchor asChild>{chip}</PopoverAnchor>
							<PopoverContent align="end">
								<div className="flex flex-col gap-3">
									{GOP_Y.map((g) => (
										<KaraProposal
											key={g.id}
											kind="compact"
											label={g.nhan}
											value={<span translate="no">{g.sau}</span>}
											actions={[
												{
													id: "nhan",
													label: g.nut,
													tone: "primary",
													onClick: () => {},
												},
												{
													id: "bo",
													label: "Bỏ qua",
													tone: "quiet",
													onClick: () => {},
												},
											]}
										/>
									))}
								</div>
							</PopoverContent>
						</Popover>
					) : (
						chip
					)
				}
			/>
			<div className="flex flex-col gap-4 p-4" data-ngan-theo-doi="">
				<StatusIndicator tone="success" size="sm" label={CHU.trangThai} />
				{moTaiCho ? (
					<p className="text-muted-foreground text-sm" data-loi-khuyen="">
						{CHU.loiKhuyen}
					</p>
				) : (
					<p className="text-muted-foreground text-xs">{CHU.chipMoTa}</p>
				)}
				<DanhSachKr />
			</div>
		</DetailSheet>
	);
}
