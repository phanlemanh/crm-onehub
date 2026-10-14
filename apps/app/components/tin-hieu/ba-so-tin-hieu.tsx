"use client";

import { StatGroup } from "@crm/ui/components/dashboard";
import { useLocale } from "@crm/ui/components/locale-provider";
import { StatCard } from "@crm/ui/components/stat-card";
import { TIN_HIEU } from "@crm/validation/tin-hieu";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";

export type BaSo = {
	trongKy: number;
	soPhong: number;
	khongPhong: number;
	quaHan: number;
	chuaCoCho: number | null;
};

export function BaSoTinHieu({ so }: { so: BaSo }) {
	const m = tinHieuMessages(useLocale()).tatCa;
	const ngay = String(TIN_HIEU.ngayDem);
	const han = String(TIN_HIEU.ngayCoCho);
	return (
		<StatGroup data-ba-so-tin-hieu="">
			<StatCard
				data-o-so="trong-ky"
				description={m.gomChuaLayVe}
				label={dien(m.soTrongKy, { ngay })}
				value={so.trongKy}
			/>
			<StatCard
				data-o-so="so-phong"
				description={dien(m.khongPhong, { ngay, so: String(so.khongPhong) })}
				label={m.soPhong}
				value={so.soPhong}
			/>
			<StatCard
				data-o-so="chua-co-cho"
				description={
					so.chuaCoCho === null
						? m.chuaDocCho
						: dien(m.trenQuaHan, { so: String(so.quaHan), han })
				}
				label={dien(m.soChuaCoCho, { han })}
				value={so.chuaCoCho === null ? "—" : so.chuaCoCho}
			/>
		</StatGroup>
	);
}
