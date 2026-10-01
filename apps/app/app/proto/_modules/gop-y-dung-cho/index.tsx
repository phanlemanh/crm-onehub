"use client";

import { KhungUngDung } from "../ban-mau-okr/phan-chung";
import { ChiTietMucTieu } from "./chi-tiet";
import { DanhSachMucTieu } from "./danh-sach";
import { STATE } from "./du-lieu";
import { HopSuaMucTieu } from "./hop-sua";

function LopTren({ state }: { state: string }) {
	if (state === STATE.hienTai) return <HopSuaMucTieu kieu="hien-tai" />;
	if (state === STATE.bChiTiet) return <ChiTietMucTieu />;
	if (state === STATE.bHopSua) return <HopSuaMucTieu kieu="b" />;
	return null;
}

export function GopYDungChoMau({ state }: { state: string }) {
	return (
		<KhungUngDung key={state} trang="theo-don-vi" vai="day-du">
			<DanhSachMucTieu coNhan={state !== STATE.hienTai} />
			<LopTren state={state} />
		</KhungUngDung>
	);
}
