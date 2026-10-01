"use client";

import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { DangTai, KhungUngDung } from "../ban-mau-okr/phan-chung";
import { BangMucTieu } from "./bang-muc-tieu";
import { ChamDiemMau } from "./cham";
import { ChiTietMucTieu } from "./chi-tiet";
import { CSKH_NHAP, CUA_TOI, STATE, THEO_DON_VI } from "./du-lieu";
import { DanhSachHienTai } from "./hien-tai";

function NoiDung({ state }: { state: string }) {
	if (state === STATE.hienTai) return <DanhSachHienTai />;
	if (state === STATE.dangTai) return <DangTai dong={3} />;
	if (state === STATE.cham) return <ChamDiemMau />;
	if (state === STATE.theoDonVi)
		return <BangMucTieu ds={THEO_DON_VI} moSan="dau-tien" />;
	if (state === STATE.chuaCoKr)
		return <BangMucTieu ds={[...CUA_TOI, CSKH_NHAP]} moSan="tat-ca" />;
	return <BangMucTieu ds={CUA_TOI} moSan="tat-ca" />;
}

export function MucTieuVaKrMau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			<KhungUngDung
				key={state}
				trang={state === STATE.theoDonVi ? "theo-don-vi" : "cua-toi"}
				vai="day-du"
			>
				<NoiDung state={state} />
				{state === STATE.chiTiet ? <ChiTietMucTieu /> : null}
			</KhungUngDung>
		</LocaleProvider>
	);
}
