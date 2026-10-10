"use client";

import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { KhungCho } from "@/components/lo-trinh/khung-cho";
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
	NGAY_TRE,
	STATE,
	thamSoCuaState,
} from "./du-lieu";

export function TrangLoTrinhMau({ state }: { state: string }) {
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
						{state === STATE.dangTai ? (
							<KhungCho />
						) : (
							<NoiDungLoTrinh
								dauVao={dauVaoCuaState(state)}
								homNayCoDinh={state === STATE.tre ? NGAY_TRE : NGAY_MAU}
							/>
						)}
					</NuqsTestingAdapter>
				</PageShellContent>
			</PageShell>
		</LocaleProvider>
	);
}
