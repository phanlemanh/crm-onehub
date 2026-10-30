"use client";

import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { TargetLineChart } from "@crm/ui/components/target-line-chart";
import {
	DetailSheetProse,
	DetailSheetSection,
} from "@/components/detail-sheet";
import {
	chuoiMoiLan,
	dinhDangSo,
	nhanLuc,
} from "../lich-su-moi-lan-cap-nhat/tinh";
import type { KrNgan, LanKr } from "./du-lieu";
import { soVn, xXemTruoc } from "./tinh";

const CHU = {
	tieuDe: "Lịch sử cập nhật",
	chuaCo: "Chưa có lần cập nhật nào",
	bieuDo: (ten: string) => `Diễn biến của ${ten} qua từng lần cập nhật`,
	dich: (so: string) => `Đích ${so}`,
	ghiHo: (ten: string) => `${ten} ghi hộ`,
	vuaGui: "Vừa gửi",
} as const;

const CAO_BIEU_DO = 176;

function DongLan({ kr, lan, moi }: { kr: KrNgan; lan: LanKr; moi: boolean }) {
	return (
		<Item
			data-lan-cap-nhat={lan.checkInId}
			data-lan-moi={moi ? "" : undefined}
			size="sm"
			variant={moi ? "muted" : "outline"}
		>
			<ItemContent>
				<ItemTitle>
					<span className="tabular-nums">{nhanLuc(lan.luc)}</span>
					{lan.giaTri === null ? null : (
						<span className="tabular-nums" data-gia-tri-lan>
							{dinhDangSo(kr, lan.giaTri)}
						</span>
					)}
				</ItemTitle>
				{lan.ghiChu ? (
					<ItemDescription translate="no" unclamped>
						{lan.ghiChu}
					</ItemDescription>
				) : null}
				{lan.ghiHo || moi ? (
					<ItemDescription>
						{[moi ? CHU.vuaGui : null, lan.ghiHo ? CHU.ghiHo(lan.ghiHo) : null]
							.filter((c) => c !== null)
							.join(" · ")}
					</ItemDescription>
				) : null}
			</ItemContent>
			<ItemActions>
				<ConfidenceIndicator level={lan.tuTin} size="sm" />
			</ItemActions>
		</Item>
	);
}

function BieuDo({ kr, xemTruoc }: { kr: KrNgan; xemTruoc: number | null }) {
	if (kr.kieu === "moc" || kr.lan.every((l) => l.giaTri === null)) return null;
	return (
		<TargetLineChart
			data={chuoiMoiLan(kr)}
			formatValue={soVn}
			height={CAO_BIEU_DO}
			label={CHU.bieuDo(kr.tieuDe)}
			nhip="lan"
			previewPoint={
				xemTruoc === null ? undefined : { x: xXemTruoc(kr), value: xemTruoc }
			}
			target={kr.dich}
			targetLabel={CHU.dich(dinhDangSo(kr, kr.dich))}
		/>
	);
}

export function MucLichSu({
	kr,
	xemTruoc,
	lanVuaGui,
}: {
	kr: KrNgan;
	xemTruoc: number | null;
	lanVuaGui: string | null;
}) {
	const ds = [...kr.lan].reverse();
	return (
		<DetailSheetSection
			data-co-diem-xem-truoc={xemTruoc === null ? undefined : String(xemTruoc)}
			data-muc-ngan="lich-su"
			title={CHU.tieuDe}
		>
			<div className="flex flex-col gap-3">
				<BieuDo kr={kr} xemTruoc={xemTruoc} />
				{ds.length === 0 ? (
					<DetailSheetProse>{CHU.chuaCo}</DetailSheetProse>
				) : (
					<ItemGroup data-lich-su-kr>
						{ds.map((l) => (
							<DongLan
								key={l.checkInId}
								kr={kr}
								lan={l}
								moi={l.checkInId === lanVuaGui}
							/>
						))}
					</ItemGroup>
				)}
			</div>
		</DetailSheetSection>
	);
}
