"use client";

import { KET_NOI, THONG_BAO } from "./du-lieu";
import { TrangKetNoiZalo } from "./ket-noi-zalo";
import { KhungCaiDat } from "./khung-cai-dat";
import { TrangThongBao } from "./thong-bao";

export function NhacQuaZaloMau({ state }: { state: string }) {
	const ketNoi = KET_NOI[state];
	if (ketNoi) {
		return (
			<KhungCaiDat key={state} dangMo="Kết nối">
				<TrangKetNoiZalo du={ketNoi} />
			</KhungCaiDat>
		);
	}
	const thongBao =
		state === "ST-thong-bao-dang-tai"
			? "dang-tai"
			: (THONG_BAO[state] ?? THONG_BAO["ST-thong-bao-chua-noi"]);
	return (
		<KhungCaiDat key={state} dangMo="Thông báo của bạn">
			<TrangThongBao du={thongBao ?? "dang-tai"} />
		</KhungCaiDat>
	);
}
