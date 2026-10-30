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
import { Field, FieldDescription, FieldGroup } from "@crm/ui/components/field";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { NGHIA_TU_TIN } from "@crm/ui/components/okr-status";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TargetLineChart } from "@crm/ui/components/target-line-chart";
import { formatDayShort } from "@crm/ui/lib/format";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { useState } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrLanTruocMessages } from "@/lib/messages/okr-lan-truoc";
import { KY } from "../lich-su-moi-lan-cap-nhat/du-lieu";
import {
	chuoiTheoTuan,
	dinhDangSo,
	moiNhat,
	nhanLuc,
	tuanCua,
} from "../lich-su-moi-lan-cap-nhat/tinh";
import type { KrNgan } from "./du-lieu";
import { ChonTuTin, OGhiChu, OGiaTri } from "./o-nhap";
import {
	docGiaTri,
	kemDonVi,
	type Nhap,
	nhapBanDau,
	sanSang,
	soVn,
} from "./tinh";

const T = okrMessages("vi");
const TL = okrLanTruocMessages("vi");

const CAO_XEM_TRUOC = 144;

function KhoiLanTruoc({ kr }: { kr: KrNgan }) {
	const lan = moiNhat(kr);
	if (!lan) return null;
	return (
		<Item data-lan-truoc size="sm" variant="outline">
			<ItemContent>
				<ItemTitle>
					{TL.tieuDe} · {nhanLuc(lan.luc)}
				</ItemTitle>
				<ItemDescription className="flex flex-wrap items-center gap-x-2">
					{lan.giaTri === null ? null : (
						<span className="tabular-nums">{dinhDangSo(kr, lan.giaTri)}</span>
					)}
					<StatusIndicator
						label={T.capNhat.mucTuTin[lan.tuTin]}
						tone={toneTheoNghia(NGHIA_TU_TIN[lan.tuTin])}
					/>
				</ItemDescription>
				{lan.ghiChu ? (
					<ItemDescription translate="no" unclamped>
						{lan.ghiChu}
					</ItemDescription>
				) : null}
			</ItemContent>
		</Item>
	);
}

function XemTruoc({ kr, so }: { kr: KrNgan; so: number | null }) {
	if (kr.kieu === "moc") return null;
	return (
		<Field data-o="xem-truoc">
			<TargetLineChart
				data={chuoiTheoTuan(kr)}
				formatValue={soVn}
				height={CAO_XEM_TRUOC}
				label={T.capNhat.xemTruoc}
				previewPoint={
					so === null
						? undefined
						: { x: formatDayShort(tuanCua(KY.homNay), "vi"), value: so }
				}
				target={kr.dich}
				targetLabel={`Đích ${dinhDangSo(kr, kr.dich)}`}
			/>
		</Field>
	);
}

export function HopThoaiCu({
	kr,
	onDong,
	onGui,
}: {
	kr: KrNgan;
	onDong: () => void;
	onGui: (nhap: Nhap) => void;
}) {
	const [nhap, setNhap] = useState<Nhap>(() => nhapBanDau(kr));
	const so = docGiaTri(kr, nhap.giaTri);
	const lan = moiNhat(kr);
	const duoc = sanSang(kr, nhap);
	return (
		<Dialog
			onOpenChange={(mo) => {
				if (!mo) onDong();
			}}
			open
		>
			<DialogContent data-hop-thoai-cu="">
				<DialogHeader>
					<DialogTitle>{T.hopCapNhat.tieuDe}</DialogTitle>
					<DialogDescription translate="no">{kr.tieuDe}</DialogDescription>
				</DialogHeader>
				<KhoiLanTruoc kr={kr} />
				<form
					id="hop-thoai-cu-form"
					onSubmit={(e) => {
						e.preventDefault();
						if (duoc) onGui(nhap);
					}}
				>
					<FieldGroup>
						<OGiaTri
							datGiaTri={(giaTri) => setNhap({ ...nhap, giaTri })}
							khoa={false}
							kr={kr}
							loi={so === null}
							moTa={
								<FieldDescription className="tabular-nums">
									{T.capNhat.lanTruoc["lan-truoc"]}{" "}
									{lan?.giaTri == null ? "—" : kemDonVi(kr, soVn(lan.giaTri))} ·{" "}
									{T.capNhat.dich} {kemDonVi(kr, soVn(kr.dich))}
								</FieldDescription>
							}
							value={nhap.giaTri}
						/>
						<XemTruoc kr={kr} so={so} />
						<ChonTuTin
							datTuTin={(tuTin) => setNhap({ ...nhap, tuTin })}
							id={`${kr.id}-cu`}
							khoa={false}
							lanTruoc={lan?.tuTin ?? null}
							value={nhap.tuTin}
						/>
						<OGhiChu
							datGhiChu={(ghiChu) => setNhap({ ...nhap, ghiChu })}
							id={`${kr.id}-cu`}
							khoa={false}
							value={nhap.ghiChu}
						/>
					</FieldGroup>
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{T.hopCapNhat.huy}</Button>
					</DialogClose>
					<Button
						data-nut="gui-cap-nhat-kr-cu"
						disabled={!duoc}
						form="hop-thoai-cu-form"
						type="submit"
					>
						{T.hopCapNhat.gui}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
