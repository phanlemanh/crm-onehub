"use client";

import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { dauVaoCuaState, NGAY_MAU, NGAY_TRE, STATE } from "./du-lieu";
import { BAN_DAU_MAC_DINH, type BanDau, TrangLoTrinh } from "./trang";

function banDauCuaState(state: string): BanDau {
	const md = BAN_DAU_MAC_DINH;
	if (state === STATE.loc) return { ...md, loc: { nhom: ["okr"] } };
	if (state === STATE.tre) return md;
	if (state === STATE.tab) return { ...md, tab: "da-giao" };
	if (state === STATE.bangCot) return { ...md, xem: "bang-cot" };
	if (state === STATE.chiaMoc) return { ...md, xem: "dong-thoi-gian" };
	if (state === STATE.daBac) return { ...md, daBac: true };
	if (state === STATE.chiTiet)
		return { ...md, chon: "docs/plan/lo-trinh-okr.json#LT2" };
	return md;
}

export function TrangLoTrinhMau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			<TrangLoTrinh
				banDau={banDauCuaState(state)}
				dauVao={dauVaoCuaState(state)}
				homNay={state === STATE.tre ? NGAY_TRE : NGAY_MAU}
				key={state}
			/>
		</LocaleProvider>
	);
}
