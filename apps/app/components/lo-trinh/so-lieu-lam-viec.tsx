"use client";

import { CopyValue } from "@crm/ui/components/copy-value";
import { Link } from "@crm/ui/components/link";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetProse,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { LO_TRINH } from "@/lib/lo-trinh/cau-hinh";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";

export const SO_LIEU = [
	"tieu_chi",
	"phep_do",
	"luot_cham",
	"token",
	"quyet_dinh_may",
	"quyet_dinh_nguoi",
] as const;

export type SoLieu = (typeof SO_LIEU)[number];

export type TomTatChuKho = Record<SoLieu, number | null> & {
	ma: string | null;
};

export function SoLieuLamViec({ chuKho }: { chuKho: TomTatChuKho }) {
	const locale = useLocale();
	const m = loTrinhMessages(locale);
	const so = new Intl.NumberFormat(locale);
	return (
		<DetailSheetSection data-lo-trinh-so-lieu="" title={m.hoSo.soLieu}>
			<DetailSheetProse>{m.hoSo.chiChuThay}</DetailSheetProse>
			<DetailSheetProperties>
				{SO_LIEU.map((k) => {
					const gt = chuKho[k];
					return (
						<DetailSheetProperty key={k} label={m.hoSo.oSoLieu[k]}>
							{gt === null ? (
								<span
									className="text-muted-foreground"
									data-o-vang=""
									data-so-lieu={k}
								>
									{m.hoSo.chuaCo}
								</span>
							) : (
								<span className="tabular-nums" data-so-lieu={k}>
									{so.format(gt)}
								</span>
							)}
						</DetailSheetProperty>
					);
				})}
				<DetailSheetProperty label={m.hoSo.commit} wide>
					{chuKho.ma === null ? (
						<span
							className="text-muted-foreground"
							data-o-vang=""
							data-so-lieu="ma"
						>
							{m.hoSo.chuaCo}
						</span>
					) : (
						<span className="flex items-center gap-2" data-so-lieu="ma">
							<span className="font-mono tabular-nums" translate="no">
								{chuKho.ma.slice(0, LO_TRINH.maNgan)}
							</span>
							<CopyValue label={m.hoSo.maCommit} value={chuKho.ma} />
							<Link
								href={LO_TRINH.timPr(chuKho.ma)}
								rel="noreferrer noopener"
								target="_blank"
							>
								{m.hoSo.timPr}
							</Link>
						</span>
					)}
				</DetailSheetProperty>
			</DetailSheetProperties>
		</DetailSheetSection>
	);
}
