"use client";

import { EmptyCellValue } from "@crm/ui/components/empty-cell";
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

const O_RONG: ReadonlySet<OTomTat> = new Set([
	"da_giao",
	"vi_sao",
	"do_gi",
	"ai_quyet",
]);

export function TomTatHoSo({ moiNguoi }: { moiNguoi: TomTatMoiNguoi | null }) {
	const locale = useLocale();
	const m = loTrinhMessages(locale);
	return (
		<DetailSheetSection data-lo-trinh-tom-tat="" title={m.hoSo.tomTat}>
			{moiNguoi ? (
				<DetailSheetProperties>
					{O_TOM_TAT.map((o) => {
						const gt = moiNguoi[o];
						return (
							<DetailSheetProperty
								key={o}
								label={m.hoSo.oTomTat[o]}
								wide={O_RONG.has(o)}
							>
								{gt === null ? (
									<span data-o-tom-tat={o} data-o-vang="">
										<EmptyCellValue />
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
