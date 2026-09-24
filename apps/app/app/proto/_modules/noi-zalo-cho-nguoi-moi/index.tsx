"use client";

import { KhungCaiDat } from "../nhac-qua-zalo/khung-cai-dat";
import { ketNoiCua, thongBaoCua } from "./du-lieu";
import { TrangKetNoiMoi } from "./ket-noi";
import { TrangThongBaoMoi } from "./thong-bao";

export function NoiZaloChoNguoiMoiMau({ state }: { state: string }) {
	const ketNoi = ketNoiCua(state);
	if (ketNoi) {
		return (
			<KhungCaiDat key={state} dangMo="Kết nối">
				<TrangKetNoiMoi du={ketNoi} />
			</KhungCaiDat>
		);
	}
	const thongBao = thongBaoCua(state) ?? thongBaoCua("ST-thong-bao-chua-noi");
	return (
		<KhungCaiDat key={state} dangMo="Thông báo của bạn">
			{thongBao ? <TrangThongBaoMoi du={thongBao} /> : null}
		</KhungCaiDat>
	);
}
