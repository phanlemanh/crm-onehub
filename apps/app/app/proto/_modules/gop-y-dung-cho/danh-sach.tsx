"use client";

import { Badge } from "@crm/ui/components/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import Link from "next/link";
import { BangKrMau } from "./bang-kr";
import {
	GOP_Y,
	MUC_TIEU,
	MUC_TIEU_KHAC,
	type MucTieuMau,
	STATE,
} from "./du-lieu";
import { DauKara } from "./kara";

function NhanGopYCho({ so }: { so: number }) {
	return (
		<Link
			href={`?state=${STATE.bChiTiet}`}
			className="underline-offset-2 hover:underline focus-visible:underline"
			data-nhan-gop-y-cho={so}
		>
			<DauKara chu={`Kara · ${so} góp ý`} />
		</Link>
	);
}

function TheMucTieu({
	mucTieu,
	soGopY,
}: {
	mucTieu: MucTieuMau;
	soGopY: number;
}) {
	return (
		<Card data-muc-tieu={mucTieu.id}>
			<CardHeader>
				<CardTitle>
					<Link
						href={`?state=${STATE.bChiTiet}`}
						className="text-start underline-offset-2 hover:underline focus-visible:underline"
						translate="no"
					>
						{mucTieu.ten}
					</Link>
				</CardTitle>
				<CardDescription>
					Phụ trách <span translate="no">{mucTieu.phuTrach}</span>
				</CardDescription>
				<CardAction className="flex items-center gap-1.5">
					{soGopY > 0 ? <NhanGopYCho so={soGopY} /> : null}
					<Badge variant="outline">{mucTieu.loai}</Badge>
					<Badge variant="secondary">{mucTieu.trangThai}</Badge>
				</CardAction>
			</CardHeader>
			<BangKrMau keyResults={mucTieu.kr} lePhanTram={mucTieu.lePhanTram} />
		</Card>
	);
}

export function DanhSachMucTieu({ coNhan }: { coNhan: boolean }) {
	return (
		<div className="flex flex-col gap-3 p-6" data-danh-sach-muc-tieu>
			<TheMucTieu mucTieu={MUC_TIEU} soGopY={coNhan ? GOP_Y.length : 0} />
			<TheMucTieu mucTieu={MUC_TIEU_KHAC} soGopY={0} />
		</div>
	);
}
