const MINUTE_MS = 60_000;
const NGHIN = 1_000;
export const MOT_TRIEU = 1_000_000;

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
		gateway: { zeroDataRetention: true },
		gioiHan: {
			maxInputTokensPerSession: 400 * NGHIN,
			maxOutputTokensPerSession: 60 * NGHIN,
			sessionTimeoutMs: 4 * MINUTE_MS,
		},
	},
	hoi: {
		maModel: "zai/glm-5.2-fast",
		bienKhoaRieng: "KHO_TAI_LIEU_AI_GATEWAY_API_KEY",
		gateway: { zeroDataRetention: true },
		soKetQua: 8,
		docToiDa: 24 * NGHIN,
		tranBac: 3,
		hanTraLoiMs: 3 * MINUTE_MS,
		gioiHan: {
			maxInputTokensPerSession: 200 * NGHIN,
			maxOutputTokensPerSession: 8 * NGHIN,
			sessionTimeoutMs: 3 * MINUTE_MS,
		},
		timHoi: { soLan: 8, cachMs: 250 },
		loGui: 6,
		dauTrang: { mo: "<<<TRANG-BAT-DAU>>>", dong: "<<<TRANG-HET>>>" },
		dauCauHoi: { mo: "<<<CAU-HOI-BAT-DAU>>>", dong: "<<<CAU-HOI-HET>>>" },
		tinGoc: (hoiId: string) => `Câu hỏi kho ${hoiId}.`,
		saiCho: "tro-ly-kho.sai-cho",
		phienKhongRo: "khong-ro",
	},
	bangGia: {
		"zai/glm-5.2-fast": { vaoMoiTrieu: 2.8, raMoiTrieu: 8.8 },
	} satisfies Record<string, { vaoMoiTrieu: number; raMoiTrieu: number }>,
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
		thieuQuyTac: "Chưa soạn được — chưa có trang Quy tắc viết đã duyệt.",
		loiModel: (chi: string) => `Chưa soạn được — máy soạn báo lỗi: ${chi}`,
		loiGui: "Chưa soạn được — không mở được phiên máy soạn.",
		hetGio: "Chưa soạn được — máy soạn chạy quá thời gian cho phép.",
		khongNop: "Chưa soạn được — máy soạn dừng mà không nộp bản nào.",
		biBac: (chi: string) =>
			`Chưa soạn được — bản nộp bị bác khi kiểm số: ${chi}`,
		saiKhuon: (chi: string) => `Chưa soạn được — bản nộp sai khuôn: ${chi}`,
		daSoan: "Đã soạn bản đề xuất.",
		choSoan: "Đã đọc chữ, chờ máy soạn.",
	},
	phien: { lo: 6, chiToiDa: 200, timNguon: { soLan: 8, cachMs: 250 } },
} as const;

export const KHONG_GOI_TRO_LY_KHO =
	"Never call tro_ly_kho in this session. It only works inside a document-library question session or a Zalo chat; anywhere else it refuses at once and wastes the turn.";
