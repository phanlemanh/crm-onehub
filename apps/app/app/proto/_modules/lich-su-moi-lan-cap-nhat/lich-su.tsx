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
import { type MucCamXuc, ThanhCamXuc } from "@crm/ui/components/thanh-cam-xuc";
import { type ReactNode, useState } from "react";
import { DetailSheetProse } from "@/components/detail-sheet";
import {
	CAM_XUC,
	type CamXucLan,
	type KrMau,
	type LanCapNhat,
} from "./du-lieu";
import {
	chuoiMoiLan,
	chuoiTheoTuan,
	cuoiMoiTuan,
	dinhDangSo,
	ngayVn,
	nhanLuc,
	nhanTuan,
} from "./tinh";

const CHU = {
	chuaCo: "Chưa có lần cập nhật nào",
	bieuDoMoi: (ten: string) => `Diễn biến của ${ten} qua từng lần cập nhật`,
	bieuDoTuan: (ten: string) => `Diễn biến của ${ten} theo tuần`,
	dich: (so: string) => `Đích ${so}`,
} as const;

const CAO_BIEU_DO = 160;

function daoCamXuc(cx: CamXucLan, loai: string): CamXucLan {
	const cu = Object.entries(cx).find(([k]) => k === loai)?.[1] ?? [];
	const moi = cu.includes(CAM_XUC.toi)
		? cu.filter((n) => n !== CAM_XUC.toi)
		: [...cu, CAM_XUC.toi];
	return { ...cx, [loai]: moi };
}

function HangCamXuc({ lan }: { lan: LanCapNhat }) {
	const [cx, setCx] = useState<CamXucLan>(lan.camXuc);
	const muc: MucCamXuc[] = CAM_XUC.bo.flatMap((b) => {
		const nguoi = cx[b.loai] ?? [];
		return nguoi.length === 0
			? []
			: [
					{
						...b,
						so: nguoi.length,
						cuaToi: nguoi.includes(CAM_XUC.toi),
						nguoi,
					},
				];
	});
	return (
		<div className="pt-2" data-hang-cam-xuc={lan.checkInId}>
			<ThanhCamXuc
				bo={[...CAM_XUC.bo]}
				muc={muc}
				onDao={(loai) => setCx((c) => daoCamXuc(c, loai))}
				tenToiDa={CAM_XUC.tenToiDa}
			/>
		</div>
	);
}

function DongLan({
	kr,
	lan,
	nhan,
	dataLan,
	dataNgay,
}: {
	kr: KrMau;
	lan: LanCapNhat;
	nhan: string;
	dataLan: string;
	dataNgay: string;
}) {
	return (
		<Item
			data-lan-cap-nhat={dataLan}
			data-ngay={dataNgay}
			size="sm"
			variant="outline"
		>
			<ItemContent>
				<ItemTitle>
					<span className="tabular-nums">{nhan}</span>
					{lan.giaTri === null ? null : (
						<span data-gia-tri-lan>{dinhDangSo(kr, lan.giaTri)}</span>
					)}
				</ItemTitle>
				{lan.ghiChu ? (
					<ItemDescription translate="no" unclamped>
						{lan.ghiChu}
					</ItemDescription>
				) : null}
				<HangCamXuc lan={lan} />
			</ItemContent>
			<ItemActions>
				<ConfidenceIndicator level={lan.tuTin} size="sm" />
			</ItemActions>
		</Item>
	);
}

function BieuDo({ kr, moiLan }: { kr: KrMau; moiLan: boolean }) {
	if (kr.kieu === "moc" || kr.lan.every((l) => l.giaTri === null)) return null;
	return (
		<TargetLineChart
			data={moiLan ? chuoiMoiLan(kr) : chuoiTheoTuan(kr)}
			height={CAO_BIEU_DO}
			label={moiLan ? CHU.bieuDoMoi(kr.tieuDe) : CHU.bieuDoTuan(kr.tieuDe)}
			target={kr.dich}
			targetLabel={CHU.dich(dinhDangSo(kr, kr.dich))}
		/>
	);
}

function KhungNoiDung({
	kr,
	moiLan,
	children,
}: {
	kr: KrMau;
	moiLan: boolean;
	children: ReactNode;
}) {
	return (
		<div
			className="flex flex-col gap-3"
			data-cach-lich-su={moiLan ? "moi-lan" : "theo-tuan"}
		>
			<BieuDo kr={kr} moiLan={moiLan} />
			{kr.lan.length === 0 ? (
				<DetailSheetProse>{CHU.chuaCo}</DetailSheetProse>
			) : (
				children
			)}
		</div>
	);
}

export function LichSuMoiLan({ kr }: { kr: KrMau }) {
	const ds = [...kr.lan].reverse();
	return (
		<KhungNoiDung kr={kr} moiLan>
			<ItemGroup data-lich-su-kr>
				{ds.map((l) => (
					<DongLan
						dataLan={l.checkInId}
						dataNgay={ngayVn(l.luc)}
						key={l.checkInId}
						kr={kr}
						lan={l}
						nhan={nhanLuc(l.luc)}
					/>
				))}
			</ItemGroup>
		</KhungNoiDung>
	);
}

export function LichSuTheoTuan({ kr }: { kr: KrMau }) {
	const ds = [...cuoiMoiTuan(kr)].reverse();
	return (
		<KhungNoiDung kr={kr} moiLan={false}>
			<ItemGroup data-lich-su-kr>
				{ds.map((d) => (
					<DongLan
						dataLan={d.tuan}
						dataNgay={d.tuan}
						key={d.tuan}
						kr={kr}
						lan={d.lan}
						nhan={nhanTuan(d.tuan)}
					/>
				))}
			</ItemGroup>
		</KhungNoiDung>
	);
}
