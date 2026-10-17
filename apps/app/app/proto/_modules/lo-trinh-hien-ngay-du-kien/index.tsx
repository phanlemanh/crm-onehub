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
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import {
	dauVaoCuaState,
	NGAY_DA_QUA,
	NGAY_MAU,
	STATE,
	thamSoCuaState,
} from "./du-lieu";

export function LoTrinhHienNgayDuKienMau({ state }: { state: string }) {
	const locale: Locale = state === STATE.mocEn ? "en" : "vi";
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
					<NuqsTestingAdapter
						hasMemory
						key={state}
						searchParams={thamSoCuaState(state)}
					>
						<NoiDungLoTrinh
							dauVao={dauVaoCuaState(state)}
							homNayCoDinh={state === STATE.daQua ? NGAY_DA_QUA : NGAY_MAU}
						/>
					</NuqsTestingAdapter>
				</PageShellContent>
			</PageShell>
		</LocaleProvider>
	);
}
