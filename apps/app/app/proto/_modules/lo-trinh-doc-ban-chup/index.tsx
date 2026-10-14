"use client";

import { LocaleProvider } from "@crm/ui/components/locale-provider";
import type { Locale } from "@crm/ui/lib/locale";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { NoiDungLoTrinh } from "@/components/lo-trinh/noi-dung";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import type { DauVaoLoTrinh } from "@/lib/lo-trinh/doc-trang";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import {
	dauVaoCuaState,
	NGAY_MAU,
	STATE as STATE_LT1,
} from "../trang-lo-trinh-trong-crm/du-lieu";

const STATE = {
	banChup: "ST-lo-trinh-ban-chup",
	banDung: "ST-lo-trinh-ban-dung",
	banChupEn: "ST-lo-trinh-ban-chup-en",
	banDungEn: "ST-lo-trinh-ban-dung-en",
} as const;

const LUC_BAN_CHUP = "2026-10-09T08:02:00Z";
const LUC_BAN_DUNG = "2026-10-09T07:50:00Z";

function dauVaoMau(banDung: boolean): DauVaoLoTrinh {
	const goc = dauVaoCuaState(STATE_LT1.dayDu);
	if (goc.kieu !== "co-du-lieu") return goc;
	return {
		...goc,
		nguon: banDung
			? { kieu: "ban-dung", layLuc: LUC_BAN_DUNG }
			: { kieu: "ban-chup", layLuc: LUC_BAN_CHUP },
	};
}

export function LoTrinhDocBanChupMau({ state }: { state: string }) {
	const locale: Locale =
		state === STATE.banChupEn || state === STATE.banDungEn ? "en" : "vi";
	const banDung = state === STATE.banDung || state === STATE.banDungEn;
	const m = loTrinhMessages(locale);
	return (
		<LocaleProvider locale={locale}>
			<PageShell>
				<PageShellHeader>
					<PageShellHeading>
						<PageShellTitle>{m.trang.tieuDe}</PageShellTitle>
						<PageShellDescription>{m.trang.moTa}</PageShellDescription>
					</PageShellHeading>
				</PageShellHeader>
				<PageShellContent>
					<NuqsTestingAdapter hasMemory key={state} searchParams="">
						<NoiDungLoTrinh
							dauVao={dauVaoMau(banDung)}
							homNayCoDinh={NGAY_MAU}
						/>
					</NuqsTestingAdapter>
				</PageShellContent>
			</PageShell>
		</LocaleProvider>
	);
}
