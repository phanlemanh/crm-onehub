"use client";

import { Button } from "@crm/ui/components/button";
import { FieldDescription } from "@crm/ui/components/field";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Progress } from "@crm/ui/components/progress";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import type { LoiBo, MaLuatBo, MucTieuCham } from "@crm/validation/okr-cham-bo";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import type { TruongDenDong } from "./den-dong";
import { usePhuThuocSoan } from "./phu-thuoc";

export type DenDong = (
	mucTieu: number,
	kr: number | null,
	truong: TruongDenDong,
) => void;

const TRUONG_LUAT = {
	"kr-la-viec": "title",
	"thieu-khoi-diem": "startValue",
	"dich-bang-khoi-diem": "targetValue",
	"thieu-doi-trong": "title",
	"it-hon-2-kr": "title",
	"nhieu-hon-5-kr": "title",
	"kr-thieu-nguoi": "nguoi",
} as const satisfies Record<MaLuatBo, TruongDenDong>;

const PHAN_TRAM = 100;

function tenDong(bo: MucTieuCham[], loi: LoiBo, krThu: string): string {
	const mt = bo[loi.mucTieu];
	if (loi.kr === null) return mt?.title.trim() ?? "";
	return mt?.keyResults[loi.kr]?.title.trim() || krThu;
}

const khoaLoi = (loi: LoiBo) => `${loi.ma}:${loi.mucTieu}:${loi.kr ?? "mt"}`;

export function KhoiChatLuong({
	bo,
	denDong,
}: {
	bo: MucTieuCham[];
	denDong: DenDong;
}) {
	const chu = okrSoanBoMessages(useLocale());
	const m = chu.chatLuong;
	const { chamBo } = usePhuThuocSoan();
	const kq = chamBo(bo);
	return (
		<section className="flex flex-col gap-3" data-khoi="chat-luong">
			<SectionHeading level={4}>{m.tieuDe}</SectionHeading>
			{bo.length === 0 ? (
				<FieldDescription data-cham-trong="">{m.chuaCo}</FieldDescription>
			) : (
				<>
					<div className="flex flex-col gap-2">
						<p
							className="font-medium text-sm tabular-nums"
							data-diem={`${kq.dat}/${kq.xet}`}
						>
							{m.dat(String(kq.dat), String(kq.xet))}
						</p>
						<Progress
							value={kq.xet === 0 ? 0 : (kq.dat / kq.xet) * PHAN_TRAM}
							aria-label={m.tieuDe}
						/>
						<FieldDescription>{m.moTa}</FieldDescription>
					</div>
					{kq.loi.length === 0 ? (
						<StatusIndicator tone="success" size="sm" label={m.datHet} />
					) : (
						<ItemGroup>
							{kq.loi.map((loi) => (
								<Item key={khoaLoi(loi)} size="sm" data-diem-con={khoaLoi(loi)}>
									<ItemContent>
										<ItemTitle>
											<StatusIndicator
												tone="warning"
												size="sm"
												label={m.luat[loi.ma]}
											/>
										</ItemTitle>
										<ItemDescription translate="no">
											{tenDong(
												bo,
												loi,
												chu.taiLieu.krThu(String((loi.kr ?? 0) + 1)),
											)}
										</ItemDescription>
									</ItemContent>
									<ItemActions>
										<Button
											variant="ghost"
											size="sm"
											type="button"
											data-nut="den-dong"
											onClick={() =>
												denDong(loi.mucTieu, loi.kr, TRUONG_LUAT[loi.ma])
											}
										>
											{m.denDong}
										</Button>
									</ItemActions>
								</Item>
							))}
						</ItemGroup>
					)}
				</>
			)}
		</section>
	);
}
