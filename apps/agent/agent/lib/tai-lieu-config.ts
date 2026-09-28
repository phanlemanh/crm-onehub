const MINUTE_MS = 60_000;

export const TAI_LIEU_AGENT = {
	docChu: {
		toiThieuKyTuMoiTrang: 40,
		tiLeKyTuHongToiDa: 0.02,
		toiDaKyTu: 120_000,
	},
	soan: {
		maModel: "zai/glm-5.2-fast",
		tranBuoc: 6,
		thoiGianMs: 4 * MINUTE_MS,
		slugQuyTacViet: "quy-tac-viet",
		bienKhoaRieng: "KHO_TAI_LIEU_AI_GATEWAY_API_KEY",
	},
	lyDo: {
		banQuet: (trang: number, tong: number) =>
			`Cần gõ tay — ${trang}/${tong} trang là bản quét, máy không đọc được chữ.`,
		chuHong: "Cần gõ tay — lớp chữ của tệp bị lỗi mã, máy không đọc đúng chữ.",
		tepHong: "Chưa soạn được — tệp hỏng, không mở được.",
		matKhau: "Chưa soạn được — tệp có mật khẩu.",
		bamLech: "Chưa soạn được — tệp nguồn không khớp mã băm đã lưu.",
		khongTai: "Chưa soạn được — không tải được tệp nguồn từ kho lưu.",
		quaDai: "Chưa soạn được — nguồn quá dài để máy soạn một lần.",
		rong: "Chưa soạn được — tệp không có chữ nào.",
	},
} as const;
