"use client";

import { type NhipOkr, PaceIndicator } from "@crm/ui/components/okr-status";
import { Progress } from "@crm/ui/components/progress";
import { type KrMau, KY } from "../ban-mau-okr/du-lieu";
import { giaTri, tienDo } from "../ban-mau-okr/phan-chung";
import { kieuKr, nhipCua } from "./du-lieu";

export function OTienDo({
	ten,
	phanTram,
	nhip,
	dong,
	coVach,
	nhan,
}: {
	ten: string;
	phanTram: number;
	nhip: NhipOkr;
	dong: string;
	coVach: boolean;
	nhan?: boolean;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-1.5" data-o-tien-do>
			<div className="flex items-baseline justify-between gap-3 text-xs">
				<span
					className={nhan ? "text-muted-foreground" : "truncate tabular-nums"}
					translate={nhan ? undefined : "no"}
				>
					{dong}
				</span>
				<span
					className={nhan ? "font-medium text-sm tabular-nums" : "tabular-nums"}
				>
					{phanTram}%
				</span>
			</div>
			<Progress
				expected={coVach ? KY.kyVong : null}
				label={ten}
				value={phanTram}
				variant="neutral"
			/>
			<PaceIndicator pace={nhip} size="sm" />
		</div>
	);
}

export function dongSoKr(kr: KrMau): string {
	if (kr.kieu === "moc") return giaTri(kr);
	return `${giaTri(kr)} / ${giaTri(kr, kr.dich)}`;
}

export function moTaKr(kr: KrMau): string {
	const kieu = kieuKr(kr);
	if (kr.kieu === "moc" || kr.khoiDiem === 0) return kieu;
	return `${kieu} · từ ${giaTri(kr, kr.khoiDiem)}`;
}

export function TienDoKrMau({
	kr,
	loai,
}: {
	kr: KrMau;
	loai: "cam-ket" | "tham-vong";
}) {
	const laMoc = kr.kieu === "moc";
	const phanTram = tienDo(kr);
	return (
		<OTienDo
			coVach={!laMoc}
			dong={dongSoKr(kr)}
			nhip={nhipCua(phanTram, loai, laMoc)}
			phanTram={phanTram}
			ten={kr.ten}
		/>
	);
}
