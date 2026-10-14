"use client";

import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { formatNgayGio } from "@crm/ui/lib/format";
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

const CHU = {
	vi: {
		capNhat: (luc: string) => `Cập nhật lúc ${luc}`,
		banDung: "(bản dựng)",
	},
	en: {
		capNhat: (luc: string) => `Updated ${luc}`,
		banDung: "(build)",
	},
} as const;

function DongGioLay({
	locale,
	luc,
	banDung,
}: {
	locale: Locale;
	luc: string;
	banDung: boolean;
}) {
	const chu = CHU[locale];
	const gio = formatNgayGio(luc, locale, {
		timeZone: "Asia/Ho_Chi_Minh",
		phan: "ngay-gio",
	});
	return (
		<p className="text-muted-foreground text-sm" data-slot="gio-lay-lo-trinh">
			{chu.capNhat(gio)}
			{banDung ? ` ${chu.banDung}` : null}
		</p>
	);
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
						<div className="flex flex-col gap-3">
							<DongGioLay
								banDung={banDung}
								locale={locale}
								luc={banDung ? LUC_BAN_DUNG : LUC_BAN_CHUP}
							/>
							<NoiDungLoTrinh
								dauVao={dauVaoCuaState(STATE_LT1.dayDu)}
								homNayCoDinh={NGAY_MAU}
							/>
						</div>
					</NuqsTestingAdapter>
				</PageShellContent>
			</PageShell>
		</LocaleProvider>
	);
}
