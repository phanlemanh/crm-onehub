"use client";

import { LocaleProvider } from "@crm/ui/components/locale-provider";
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
import { dauVaoCuaState, NGAY_MAU, thamSoCuaState } from "./du-lieu";

export function NganHoSoMau({ state }: { state: string }) {
	const m = loTrinhMessages("vi");
	return (
		<LocaleProvider locale="vi">
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
							homNayCoDinh={NGAY_MAU}
						/>
					</NuqsTestingAdapter>
				</PageShellContent>
			</PageShell>
		</LocaleProvider>
	);
}
