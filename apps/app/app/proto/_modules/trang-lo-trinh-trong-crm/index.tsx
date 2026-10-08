"use client";

import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { dauVaoCuaState, NGAY_MAU, NGAY_TRE, STATE } from "./du-lieu";
import { BAN_DAU_MAC_DINH, type BanDau, TrangLoTrinh } from "./trang";

function banDauCuaState(state: string): BanDau {
	if (state === STATE.loc) return { ...BAN_DAU_MAC_DINH, nhom: "okr" };
	if (state === STATE.bangCot) return { ...BAN_DAU_MAC_DINH, kieu: "bang-cot" };
	if (state === STATE.chiTiet) return { ...BAN_DAU_MAC_DINH, chon: "LT2" };
	if (state === STATE.theoMoc) return { ...BAN_DAU_MAC_DINH, xem: "theo-moc" };
	if (state === STATE.toanCanh)
		return { ...BAN_DAU_MAC_DINH, xem: "toan-canh" };
	return BAN_DAU_MAC_DINH;
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
