export const OKR = {
	ten: { mucTieuToiDa: 200, krToiDa: 200, donViDo: 24, viSao: 500 },
	lo: { toiDaDong: 1000, toiDaKyTu: 200_000 },
	nhap: {
		tenCotDau: ["muc tieu", "objective"],
		kieu: {
			"tang toi": "tang-toi",
			"giam xuong": "giam-xuong",
			"giu tren": "giu-tren",
			"giu duoi": "giu-duoi",
			moc: "moc",
			"phan tram": "phan-tram",
		},
	},
	thongDiep: {
		canQuyenQuanTri:
			"Cần quyền quản trị để mở chu kỳ hay đổi cấu hình chương trình.",
		khongSuaDuocDonVi:
			"Bạn không sửa được OKR của đơn vị này — chỉ trưởng đơn vị (hoặc trưởng bộ phận chứa nó) sửa được.",
		khongSuaDuocKr:
			"Chỉ người phụ trách KR hoặc người sửa được mục tiêu mới sửa KR này.",
		khongCoChuKy: (id: string) => `Không có chu kỳ nào mang mã ${id}.`,
		khongCoMucTieu: (id: string) => `Không có mục tiêu nào mang mã ${id}.`,
		khongCoKr: (id: string) => `Không có KR nào mang mã ${id}.`,
		quyNgoaiNam: "Quý phải nằm trọn trong năm cha.",
		quyChong: (ten: string) => `Chồng ngày với chu kỳ «${ten}».`,
		namKhongCoCha: "Chu kỳ năm không có cha; chu kỳ quý phải có năm cha.",
		phaChiDiToi: "Pha chu kỳ chỉ đi tới, không lùi.",
		phaCuoi: "Chu kỳ đã đóng.",
		kyDaKhoa: "Chu kỳ này ở pha chấm điểm hoặc đã đóng — không ghi được nữa.",
		vuotTranMucTieu: (n: number) =>
			`Đơn vị này đã có ${n} mục tiêu — vượt trần chương trình.`,
		vuotTranKr: (n: number) =>
			`Mục tiêu này đã có ${n} KR — vượt trần chương trình.`,
		caNhanTat: "Chương trình chưa bật OKR cá nhân.",
		khongPhaiThanhVien: (id: string) =>
			`Người ${id} không phải thành viên đang hoạt động.`,
		khoiDiemDaKhoa:
			"Khởi điểm đã khoá khi công bố — chỉ sửa được đích và giá trị hiện tại.",
		congBoCanKr: "Cần ít nhất một KR trước khi công bố.",
		daCongBo: "Mục tiêu này đã công bố.",
		daBo: "Mục tiêu này đã bỏ.",
		soTheoKieu: {
			"dich-phai-lon-hon-khoi-diem":
				"Kiểu «tăng tới» cần đích lớn hơn khởi điểm.",
			"dich-phai-nho-hon-khoi-diem":
				"Kiểu «giảm xuống» cần đích nhỏ hơn khởi điểm.",
			"phan-tram-ngoai-0-100": "Kiểu «phần trăm» cần đích trong 0–100.",
		},
		canChinh: {
			cungCap: "Chỉ căn chỉnh được vào mục tiêu hoặc KR ở cấp cao hơn.",
			chinhNo: "Không căn chỉnh vào chính mình.",
			chuaCongBo: "Đích căn chỉnh phải đã công bố.",
			khacChuKy: "Đích phải cùng chu kỳ hoặc thuộc chu kỳ năm cha.",
			daGan: "Đã gắn vào chỗ này rồi.",
			khongCoDich: "Cần đúng một đích: mục tiêu hoặc KR.",
		},
		nhap: {
			thieuMucTieu: "Thiếu mục tiêu",
			thieuKr: "Thiếu KR",
			kieuLa:
				"Cột kiểu chỉ nhận: tăng tới, giảm xuống, giữ trên, giữ dưới, mốc, phần trăm",
			emailLa: "Email này chưa là thành viên CRM",
			thieuDich: "Thiếu đích",
			soLa: "Khởi điểm hoặc đích không phải số",
			daCo: "Mục tiêu này đã có trong CRM cho đơn vị và chu kỳ này",
			loQuaDai: (n: number) => `Lô có quá ${n} dòng — chia nhỏ rồi nhập lại.`,
			loRong: "Không có dòng nào để nhập.",
			khongDongHopLe: "Không có dòng hợp lệ nào để ghi.",
			vuotTran: (n: number) =>
				`Lô làm đơn vị vượt trần ${n} mục tiêu của chương trình.`,
		},
	},
} as const;
