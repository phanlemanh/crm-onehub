import {
	LOI_KHUON_CAP_NHAT,
	type LoiGiaTri,
} from "@crm/validation/okr-cap-nhat";
import { OKR_KHEP } from "@crm/validation/okr-khep";
import { OKR_MAU } from "@crm/validation/okr-mau";

export const OKR = {
	tenGoc: "OneHub",
	thoiGian: { giayMs: 1000 },
	ten: {
		toiThieu: 3,
		mucTieuToiDa: 200,
		krToiDa: 200,
		donViDo: 24,
		viSao: 500,
	},
	lo: { toiDaDong: 1000, toiDaKyTu: 200_000 },
	troLy: { soLuotGanDay: 50, ghiChuVet: "tro-ly-okr:" },
	soan: { ghiChuVet: "soan-okr:", soCuocGanDay: 50, ngayCongBo: 14 },
	mau: { moc: { startValue: 0, targetValue: 1 }, trongSoKr: 1 },
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
		khongCoDonVi: (id: string) => `Không có đơn vị nào mang mã ${id}.`,
		krDangLaDich:
			"KR này đang có mục tiêu góp vào — gỡ căn chỉnh trước khi xoá.",
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
		hienTaiQuaCapNhat: "KR đang chạy — đổi số hiện tại bằng Cập nhật tuần.",
		krDaCapNhat:
			"KR đã có lần cập nhật — không xoá được. Hãy bỏ mục tiêu hoặc đổi tên KR.",
		capNhat: {
			phienKhongCua: "Phiên cập nhật này không phải của bạn.",
			phienDaGui:
				"Phiên cập nhật này đã gửi xong — mở lại Cập nhật tuần để gửi lần mới.",
			khongPhaiChuHayTruong:
				"Chỉ người phụ trách KR hoặc người sửa được mục tiêu mới cập nhật được KR này.",
			mucTieuChuaCongBo: "Chỉ cập nhật được KR của mục tiêu đã công bố.",
			kyKhongChay: "Chỉ cập nhật được KR trong chu kỳ đang chạy.",
			tuTinThieu: LOI_KHUON_CAP_NHAT.tuTin,
			giaTriKhongPhaiSo: LOI_KHUON_CAP_NHAT.giaTri,
			ghiChuQuaDai: LOI_KHUON_CAP_NHAT.ghiChu,
			giaTri: {
				"moc-chi-0-1": "KR kiểu «mốc» chỉ nhận 0 (chưa xong) hoặc 1 (xong).",
				"phan-tram-ngoai-0-100":
					"KR kiểu «phần trăm» chỉ nhận giá trị trong 0–100.",
			} satisfies Record<LoiGiaTri, string>,
		},
		traoDoi: {
			krKhacMucTieu: "KR này không thuộc mục tiêu đang bình luận.",
			nguoiKhongCon: "Người không còn trong OneHub Center",
			nhacKhongConThanhVien: "Người được nhắc không còn là thành viên.",
		},
		canhKr: {
			mucTieuDaBo: "Mục tiêu này đã bỏ — việc cạnh KR chỉ đọc.",
			khongSuaDuoc:
				"Chỉ người phụ trách KR hoặc người sửa được mục tiêu mới đổi việc của KR này.",
			khongCoViec: (id: string) => `Không có việc nào mang mã ${id}.`,
			chiViecTuGo:
				"Chỉ sửa hay đánh dấu được việc tự gõ — sáng kiến gắn sẵn thì gỡ.",
			nguoiLamKhongPhaiThanhVien:
				"Người làm phải là thành viên còn trong không gian làm việc.",
			khongGanDuoc:
				"Gắn sáng kiến cần quyền đọc dữ liệu đối tác — vai «chỉ OKR» không gắn được.",
			daGan: "Sáng kiến này đã gắn vào KR rồi.",
			khongCoChienDich: (id: string) =>
				`Không có chiến dịch nào mang mã ${id}.`,
			khongCoKeHoach: (id: string) =>
				`Không có kế hoạch 30 ngày nào mang mã ${id}.`,
			chiMocXongDinhDuoc:
				"Chỉ đính được bằng chứng cho KR kiểu «mốc» đã đánh dấu xong.",
			khongCoBangChung: (id: string) =>
				`Không có bằng chứng nào mang mã ${id}.`,
			ghiNhanChiCongBo: "Chỉ ghi nhận được trên mục tiêu đã công bố.",
			tuGhiNhan: "Không tự ghi nhận chính mình — chọn người khác.",
			nguoiNhanKhongConThanhVien:
				"Người nhận phải là thành viên còn trong không gian làm việc.",
			khongCoGhiNhan: (id: string) => `Không có ghi nhận nào mang mã ${id}.`,
			khongGoDuocGhiNhan:
				"Chỉ người gửi hoặc quản trị mới gỡ được ghi nhận này.",
			krCoBangChung:
				"KR đã có bằng chứng — gỡ bằng chứng trước rồi mới xoá được.",
			krCoGhiNhan: "KR đã có ghi nhận gắn vào — không xoá được.",
		},
		mau: {
			canQuanTri:
				"Cần quyền quản trị chương trình OKR để soạn, lưu trữ hay khôi phục mẫu.",
			khongCoMau: (id: string) => `Không có mẫu OKR nào mang mã ${id}.`,
			daLuuTru: "Mẫu này đã lưu trữ — quản trị khôi phục thì mới dùng được.",
			khacCap: "Mẫu này dành cho cấp đơn vị khác.",
			khongApDung: "Mẫu này không áp dụng cho đơn vị này.",
			donViDaLuuTru: (ten: string) =>
				`Đơn vị «${ten}» đã lưu trữ — bỏ khỏi mẫu trước khi lưu.`,
			soKrMau: `Mẫu cần từ 1 tới ${OKR_MAU.krToiDa} KR.`,
			krMau: (thu: number, cau: string) => `KR mẫu thứ ${thu}: ${cau}`,
			soKrKhac: (n: number) => `Mẫu này có ${n} KR — gửi số cho đúng ${n} KR.`,
			thieuSo: (thu: number, ten: string, o: "khởi điểm" | "đích") =>
				`KR thứ ${thu} «${ten}»: thiếu ${o}.`,
			krHong: (thu: number, ten: string, cau: string) =>
				`KR thứ ${thu} «${ten}»: ${cau}`,
			mucTieuHong: (cau: string) => `Mục tiêu từ mẫu: ${cau}`,
		},
		soan: {
			khongCoCuoc: (id: string) => `Không có cuộc soạn nào mang mã ${id}.`,
			cuocAn: "Cuộc soạn này mở ở chế độ ẩn — chỉ quản trị xem và quyết được.",
			cuocKhongDang: "Cuộc soạn này đã đưa vào bộ OKR hoặc đã bỏ.",
			cuocKhacDonVi: "Cuộc soạn này thuộc đơn vị hay chu kỳ khác.",
			khongCoDong: (id: string) => `Không có dòng nháp nào mang mã ${id}.`,
			dongCu: "Dòng này thuộc bản nháp cũ — Trợ lý đã nộp bản mới hơn.",
			chaDaBac: (ten: string) =>
				`Mục tiêu cha «${ten}» đã bị bác — không nhận dòng dưới nó.`,
			chaBiLoai: (ten: string) =>
				`Mục tiêu cha «${ten}» không qua kiểm — không nhận dòng dưới nó.`,
			khongCoCha: (khoa: string) =>
				`Không có Mục tiêu cha «${khoa}» trong cuộc soạn này.`,
			canGiaTri: "Sửa cần một giá trị mới.",
			tenSuaKhongHop: (tran: number) =>
				`Tên sau khi sửa quá ngắn hoặc dài quá ${tran} ký tự.`,
			cachKhongHop: "Cách quyết không hợp với loại dòng.",
			kyKhongLapKeHoach: "Chu kỳ không còn ở pha lập kế hoạch.",
			khongCoDongNhan: "Chưa có Mục tiêu nào được nhận để đưa vào.",
			thieuSoKr: (ten: string) =>
				`Điền khởi điểm và đích cho KR «${ten}» trước khi đưa vào.`,
			soKrLa: (id: string) => `Dòng ${id} không phải KR đã nhận của cuộc này.`,
			vuotTranMucTieu: (tran: number) =>
				`Vượt trần ${tran} Mục tiêu mỗi đơn vị.`,
			duaVaoHaiLan: "Cuộc này đã được đưa vào bộ OKR.",
			donViThieuId: "Bộ phận cần divisionId, phòng ban cần departmentId.",
			chuaCoKhoaMoHinh: "Chưa có khoá model cho Trợ lý OKR.",
		},
		chuyen: {
			canQuanTri: "Cần quyền quản trị để chuyển OKR của một thành viên.",
			choChinhMinh: "Người nhận phải khác người đang phụ trách.",
		},
		so: {
			nguonDaKhoa:
				"Nguồn đã khoá khi công bố — thêm số đo cạnh cho KR nhập tay, hoặc đặt KR mới ở kỳ sau.",
			hienTaiCuaMay:
				"Số hiện tại của KR này do máy ghi — đổi nguồn khi mục tiêu còn nháp.",
			krDaCoSoChup: "KR đã có lịch sử số — sửa được, không xoá được.",
			donViKhongCo: "Đơn vị không có hoặc đã lưu trữ.",
			khongPhaiThanhVien:
				"Người này không phải thành viên của không gian làm việc.",
			sheetsTat: "Quản trị chưa cắm khoá Google Sheets.",
			khongNhanApi: "KR này không nhận số qua khoá API.",
			kyDaQua: "Chu kỳ đã qua ngày cuối — không ghi số nữa.",
			kyChuaToi: "Chu kỳ chưa tới ngày đầu — chưa ghi số được.",
			crmKhongHopKieu:
				"Chỉ số CRM là số đếm — KR mốc hay phần trăm không lấy số từ đây.",
			danhSachDoiTac:
				"Danh sách bản ghi thuộc dữ liệu đối tác — vai «chỉ OKR» chỉ xem được con số.",
			ghiChuDoCanh: "đo cạnh",
		},
		khep: {
			raChiKhiDangChay: "Chỉ mở rà giữa kỳ khi chu kỳ đang chạy.",
			raNgoaiKy: "Khoảng rà phải nằm trong ngày đầu và ngày cuối của chu kỳ.",
			raChong: "Khoảng rà chồng ngày với một cửa sổ rà đang mở của chu kỳ này.",
			raDaDong: "Cửa sổ rà này đã đóng.",
			lyDoDoiDich: "Đổi đích ngoài rà giữa kỳ cần lý do.",
			khongCoCuaSoRa: (id: string) => `Không có cửa sổ rà nào mang mã ${id}.`,
			phaTungBuoc:
				"Pha đi từng bước: lập kế hoạch, đang chạy, chấm điểm, đã đóng.",
			chamTuNgaySau: "Sang chấm điểm từ ngày sau ngày cuối của chu kỳ.",
			thieuSoNgayCuoi: (n: number) =>
				`Còn ${n} KR nguồn CRM chưa có số ngày cuối — chờ nhịp chụp số rồi thử lại.`,
			conKrChuaCham: (n: number) => `Còn ${n} KR chưa chấm.`,
			krCoDoiDich: "KR đã có lần đổi đích — sửa được, không xoá được.",
			krCoDiem: "KR đã có điểm cuối kỳ — không xoá được.",
			chiChamKhiChamDiem: "Chỉ chấm KR khi chu kỳ ở pha chấm điểm.",
			khongCoDiemKr:
				"KR này không có dòng điểm cuối kỳ — chỉ KR của mục tiêu đã công bố lúc sang chấm được chấm.",
			ngoaiLuoi: (buoc: string, cuoi: string) =>
				`Điểm ngoài lưới — chọn bội của ${buoc} từ 0 tới ${cuoi}.`,
			canLyDoCham: `Điểm khác gợi ý cần lý do ${OKR_KHEP.lyDo.toiThieu}–${OKR_KHEP.lyDo.toiDa} ký tự.`,
			nhinLaiChiKhi: "Điều học được ghi ở pha đang chạy hoặc chấm điểm.",
			bangChamChuaCo: "Bảng chấm có từ pha chấm điểm.",
			kyDaDong:
				"Chu kỳ đã đóng — quản trị mở lại kỳ thì mới sửa được điểm hay điều học được.",
			chiMoLaiKhiDong: "Chỉ mở lại được chu kỳ đã đóng.",
			chuaCoKyKe: "Chưa có chu kỳ kế để mang sang — quản trị mở chu kỳ trước.",
			daMangSang: "Mục tiêu này đã mang sang chu kỳ kế rồi.",
			mangSangChiCongBo: "Chỉ mang sang được mục tiêu đã công bố.",
			mangSangChiKhi: "Mang sang từ chu kỳ ở pha chấm điểm hoặc đã đóng.",
			xuatChiKhiDong: "Chỉ xuất được chu kỳ đã đóng.",
		},
		troLy: {
			daQuyet: "Đề xuất này đã được quyết",
			khongCoDeXuat: (id: string) => `Không có đề xuất nào mang mã ${id}.`,
			cachKhongHop: "Dòng này không nhận cách quyết đó.",
			canGiaTri: "Sửa rồi nhận cần giá trị mới.",
			daCu: "Ô này đã đổi từ lúc Trợ lý OKR đề xuất — tải lại danh sách góp ý.",
			krKhacMucTieu: "KR này không thuộc Mục tiêu đang hỏi.",
		},
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
			khongCo: (id: string) => `Không có căn chỉnh nào mang mã ${id}.`,
		},
		nhap: {
			thieuMucTieu: "Thiếu mục tiêu",
			thieuKr: "Thiếu KR",
			doDai:
				"Tên mục tiêu, tên KR phải dài 3–200 ký tự; đơn vị đo tối đa 24 ký tự",
			kieuLa:
				"Cột kiểu chỉ nhận: tăng tới, giảm xuống, giữ trên, giữ dưới, mốc, phần trăm",
			emailLa: "Email này chưa là thành viên OneHub Center",
			thieuDich: "Thiếu đích",
			soLa: "Khởi điểm hoặc đích không phải số",
			daCo: "Mục tiêu này đã có trong OneHub Center cho đơn vị và chu kỳ này",
			loQuaDai: (n: number) => `Lô có quá ${n} dòng — chia nhỏ rồi nhập lại.`,
			loRong: "Không có dòng nào để nhập.",
			khongDongHopLe: "Không có dòng hợp lệ nào để ghi.",
			vuotTran: (n: number) =>
				`Lô làm đơn vị vượt trần ${n} mục tiêu của chương trình.`,
		},
	},
} as const;
