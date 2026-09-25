"use client";

import { Badge } from "@crm/ui/components/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { useLocale } from "@crm/ui/components/locale-provider";
import { okrMessages } from "@/lib/messages/okr";
import { BangKr } from "./bang-kr";
import type { MucTieu } from "./kieu";
import { NhanTrangThai } from "./tien-do-kr";

export function KhoiMucTieu({
	mucTieu,
	hienDonVi,
	danhDauCuaToi,
}: {
	mucTieu: MucTieu;
	hienDonVi: boolean;
	danhDauCuaToi: boolean;
}) {
	const m = okrMessages(useLocale());
	return (
		<Card data-muc-tieu={mucTieu.id}>
			<CardHeader>
				<CardTitle>
					<span translate="no">{mucTieu.title}</span>
				</CardTitle>
				<CardDescription>
					{hienDonVi ? (
						<>
							<span translate="no">{mucTieu.unitName}</span>
							{" · "}
						</>
					) : null}
					{m.phuTrach} <span translate="no">{mucTieu.owner.name}</span>
					{mucTieu.alignments.length > 0
						? ` · ${m.gopVao(mucTieu.alignments.length)}`
						: null}
				</CardDescription>
				<CardAction>
					<Badge variant="outline">{m.loai[mucTieu.kind]}</Badge>
					<NhanTrangThai status={mucTieu.status} />
				</CardAction>
			</CardHeader>
			<BangKr
				keyResults={mucTieu.keyResults}
				kind={mucTieu.kind}
				expected={mucTieu.expected}
				danhDauCuaToi={danhDauCuaToi}
			/>
		</Card>
	);
}
