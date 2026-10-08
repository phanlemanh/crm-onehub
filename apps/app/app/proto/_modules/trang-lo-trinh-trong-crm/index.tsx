"use client";

import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { dauVaoCuaState, NGAY_MAU, NGAY_TRE, STATE } from "./du-lieu";
import { TrangLoTrinh } from "./trang";

export function TrangLoTrinhMau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			<TrangLoTrinh
				dauVao={dauVaoCuaState(state)}
				homNay={state === STATE.tre ? NGAY_TRE : NGAY_MAU}
				key={state}
				nhomBanDau={state === STATE.loc ? "okr" : undefined}
			/>
		</LocaleProvider>
	);
}
