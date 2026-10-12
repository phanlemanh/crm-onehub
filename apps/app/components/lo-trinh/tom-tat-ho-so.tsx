"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { formatDay } from "@crm/ui/lib/format";
import {
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetProse,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";

export const O_TOM_TAT = [
	"da_giao",
	"vi_sao",
	"ngay",
	"production",
	"do_gi",
	"ket_qua",
	"chua_lam",
	"ai_quyet",
] as const;

export type OTomTat = (typeof O_TOM_TAT)[number];

export type TomTatMoiNguoi = Record<OTomTat, string | null>;

export function TomTatHoSo({ moiNguoi }: { moiNguoi: TomTatMoiNguoi | null }) {
	const locale = useLocale();
	const m = loTrinhMessages(locale);
	return (
		<DetailSheetSection data-lo-trinh-tom-tat="" title={m.hoSo.tomTat}>
			{moiNguoi ? (
				<DetailSheetProperties columns={1}>
					{O_TOM_TAT.map((o) => {
						const gt = moiNguoi[o];
						return (
							<DetailSheetProperty key={o} label={m.hoSo.oTomTat[o]}>
								{gt === null ? (
									<span
										className="text-muted-foreground"
										data-o-tom-tat={o}
										data-o-vang=""
									>
										{m.hoSo.chuaCo}
									</span>
								) : (
									<span data-o-tom-tat={o} translate="no">
										{o === "ngay" ? formatDay(gt, locale) : gt}
									</span>
								)}
							</DetailSheetProperty>
						);
					})}
				</DetailSheetProperties>
			) : (
				<DetailSheetProse>{m.hoSo.chuaCoTomTat}</DetailSheetProse>
			)}
		</DetailSheetSection>
	);
}
