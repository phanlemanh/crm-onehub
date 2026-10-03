"use client";

import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { KhungUngDung } from "../ban-mau-okr/phan-chung";
import { ChiTietMucTieu } from "./chi-tiet";
import { DanhSachMucTieu } from "./danh-sach";
import { karaCuaState, STATE } from "./du-lieu";
import { HopSuaKr, HopSuaMucTieu } from "./hop-sua";

function LopTren({ state }: { state: string }) {
	if (state === STATE.hienTai) return <HopSuaMucTieu kieu="hien-tai" />;
	if (state === STATE.bHopSua) return <HopSuaMucTieu kieu="b" />;
	if (state === STATE.bHopSuaKr) return <HopSuaKr kieu="sua" />;
	const kara = karaCuaState(state);
	return kara ? <ChiTietMucTieu trangThai={kara} /> : null;
}

export function GopYDungChoMau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			<KhungUngDung key={state} trang="theo-don-vi" vai="day-du">
				<DanhSachMucTieu
					hienTai={state === STATE.hienTai}
					loc={state === STATE.aLoc}
				/>
				<LopTren state={state} />
			</KhungUngDung>
		</LocaleProvider>
	);
}
