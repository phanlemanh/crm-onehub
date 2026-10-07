import type { TinhNang } from "@crm/db/ai-chi-phi-danh-muc";
import type { LyDoLichSu } from "@crm/db/okr-muc-tieu-lich-su";
import { MINUTE_MS } from "@crm/db/okr-tro-ly-danh-muc";
import {
	LOI_KHUON_CAP_NHAT,
	type LoiGiaTri,
} from "@crm/validation/okr-cap-nhat";
import { OKR_HOI_Y } from "@crm/validation/okr-hoi-y";
import { OKR_KHEP } from "@crm/validation/okr-khep";
import { SO_KR_MOC } from "@crm/validation/okr-kr";
import { OKR_MAU } from "@crm/validation/okr-mau";
import { TIEN_TO_VET_KARA } from "@crm/validation/okr-theo-kara";
import type { MaThieu } from "./hoi-y";

export const OKR = {
	tenGoc: "OneHub",
	thoiGian: { giayMs: 1000, gioMs: 60 * MINUTE_MS },
	ten: {
		toiThieu: 3,
		mucTieuToiDa: 200,
		krToiDa: 200,
		donViDo: 24,
		viSao: 500,
	},
	lo: { toiDaDong: 1000, toiDaKyTu: 200_000 },
	troLy: { soLuotGanDay: 50, ghiChuVet: TIEN_TO_VET_KARA },
	soan: {
		ghiChuVet: "soan-okr:",
		soCuocGanDay: 50,
		ngayCongBo: 14,
		tinhNang: "okr.soan" satisfies TinhNang,
		suKien: { nguoiGo: "message.received", xongBuoc: "step.completed" },
		phanVi: { giua: 0.5, cao: 0.9 },
	},
	mau: { moc: SO_KR_MOC, trongSoKr: 1 },
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
		krKhacGiaoDich: (objectiveId: string, dangGhi: string) =>
			`KR nhắm mục tiêu ${objectiveId} nhưng giao dịch đang ghi mục tiêu ${dangGhi}.`,
		khongThayMucTieu:
			"Không thấy mục tiêu này — có thể nó không còn, hoặc bạn không được xem.",
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
			nhacKhongXemDuoc: (ten: string) =>
				`${ten} không xem được mục tiêu này — bỏ nhắc tên, hoặc thêm vào người xem của mục tiêu.`,
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
			nguoiNhanKhongXemDuoc: (ten: string) =>
				`${ten} không xem được mục tiêu này — không gửi ghi nhận tới người không xem được.`,
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
			khongCoCuoc:
				"Không thấy cuộc soạn này — có thể nó không còn, hoặc bạn không được xem.",
			cuocKhongDang: "Cuộc soạn này đã đưa vào bộ OKR hoặc đã bỏ.",
			khongPhaiNguoiMo:
				"Chỉ người mở cuộc soạn này hoặc quản trị mới thử lại hay gửi tiếp được.",
			cuocKhacDonVi: "Cuộc soạn này thuộc đơn vị hay chu kỳ khác.",
			khongBoDuocCuoc:
				"Cuộc này không phải cuộc đang soạn của đơn vị, hoặc chỉ người mở nó và quản trị bỏ được.",
			thuLaiHayBo:
				"Chọn một: thử lại cuộc đang soạn, hoặc bỏ nó để mở cuộc mới.",
			khongCoDong: (id: string) => `Không có dòng nháp nào mang mã ${id}.`,
			dongCu: "Dòng này thuộc bản nháp cũ — Trợ lý đã nộp bản mới hơn.",
			chaDaBac: (ten: string) =>
				`Mục tiêu cha «${ten}» đã bị bác — không nhận dòng dưới nó.`,
			chaBiLoai: (ten: string) =>
				`Mục tiêu cha «${ten}» không qua kiểm — không nhận dòng dưới nó.`,
			khongCoCha: (khoa: string) =>
				`Không có Mục tiêu cha «${khoa}» trong cuộc soạn này.`,
			chaChuaNhan: (ten: string) =>
				`Mục tiêu cha «${ten}» chưa được nhận — nhận nó, hoặc bác dòng dưới nó.`,
			canGiaTri: "Sửa cần một giá trị mới.",
			tenSuaKhongHop: (tran: number) =>
				`Tên sau khi sửa quá ngắn hoặc dài quá ${tran} ký tự.`,
			cachKhongHop: "Cách quyết không hợp với loại dòng.",
			kyKhongLapKeHoach: "Chu kỳ không còn ở pha lập kế hoạch.",
			khongCoDongNhan: "Chưa có Mục tiêu nào được nhận để đưa vào.",
			thieuSoKr: (ten: string) =>
				`Điền khởi điểm và đích cho KR «${ten}» trước khi đưa vào.`,
			soKrLa: (id: string) => `Dòng ${id} không phải KR đã nhận của cuộc này.`,
			mocKhongNhanSo: (ten: string) =>
				`KR «${ten}» là mốc — không nhận khởi điểm và đích.`,
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
		chuKy: {
			chiSuaTen:
				"Chu kỳ này đã có dữ liệu hoặc đã rời «Lập kế hoạch» — chỉ sửa được tên.",
			daDongKhongSua: "Chu kỳ đã đóng — không sửa được nữa.",
			daAnKhongSua: "Chu kỳ đang ẩn — hiện lại rồi mới sửa được.",
			khongTrong:
				"Chu kỳ đã có dữ liệu — không gỡ được. Ẩn chu kỳ nếu nó tạo nhầm.",
			trongThiGo: "Chu kỳ chưa có dữ liệu — gỡ nó thay vì ẩn.",
			daAn: "Chu kỳ này đã ẩn rồi.",
			chuaAn: "Chu kỳ này đang hiện — không có gì để hiện lại.",
			conQuyHien: (n: number) =>
				`Năm này còn ${n} quý đang hiện — ẩn hoặc gỡ các quý đó trước.`,
			namChaDaAn: "Năm cha đang ẩn — hiện lại năm trước.",
			hienLaiChong: (ten: string) =>
				`Chồng ngày với quý «${ten}» đang hiện — ẩn hoặc sửa quý đó trước.`,
			kyDaAn: "Chu kỳ này đã ẩn — không ghi được nữa. Hiện lại để ghi tiếp.",
		},
		hoiY: {
			chiQuanTri: "Chỉ quản trị mới mở hay sửa được lần hỏi ý mục tiêu.",
			nguoiChonPhaiQuanTri:
				"Người chọn phải là quản trị (owner hoặc admin) của không gian làm việc.",
			nguoiChonDaGop:
				"Người này đã góp ý trong lần hỏi ý — người chọn không góp ý, hãy chọn người khác.",
			kyKhongLapKeHoach:
				"Chỉ mở hỏi ý mục tiêu khi chu kỳ đang ở pha lập kế hoạch.",
			daCoHoiY: "Chu kỳ này đã có một lần hỏi ý mục tiêu.",
			hanNgoaiKhoang: `Hạn phải cách lúc mở từ ${OKR_HOI_Y.hanGio.min} tới ${OKR_HOI_Y.hanGio.max} giờ.`,
			hanSuaNgoaiKhoang: `Hạn mới phải từ bây giờ tới ${OKR_HOI_Y.hanGio.max} giờ sau lúc mở — đặt bằng bây giờ là đóng sớm.`,
			cauHoiDaKhoa:
				"Đã có người góp ý — câu hỏi đã khoá, chỉ sửa được lời mở, con số và hạn.",
			daNiemPhong:
				"Người chọn đã niêm phong bản viết trước và vẫn là quản trị — không đổi người chọn được.",
			chiKhiDangMo:
				"Lần hỏi ý đã qua hạn — lời mở, con số, câu hỏi và hạn chỉ sửa được khi còn mở.",
			daCongBo: "Lần hỏi ý này đã công bố.",
			khongCoHoiY: (id: string) => `Không có lần hỏi ý nào mang mã ${id}.`,
			hetHan:
				"Lần hỏi ý đã qua hạn — không góp, sửa, gỡ ý hay bấm «Tôi cũng nghĩ vậy» được nữa.",
			quaBaY: `Mỗi người góp tối đa ${OKR_HOI_Y.yMoiNguoi} ý — sửa hoặc gỡ một ý cũ để góp ý mới.`,
			nguoiChonKhongGop: "Người chọn không góp ý trong lần hỏi ý mà mình chọn.",
			chiYCuaMinh: "Chỉ người góp mới sửa hay gỡ được ý này.",
			yCuaMinh: "Không bấm «Tôi cũng nghĩ vậy» cho ý của chính mình.",
			nguoiChonKhongDongY:
				"Người chọn không bấm «Tôi cũng nghĩ vậy» — số người cũng nghĩ vậy là bằng chứng người chọn đọc khi kết luận.",
			khongCoY: (id: string) => `Không có ý nào mang mã ${id}.`,
			chiNguoiChon:
				"Chỉ người chọn của lần hỏi ý này mới niêm phong, khai không viết trước, kết luận hay công bố được.",
			daCoBanTruoc:
				"Bản viết trước đã niêm phong hoặc đã khai không viết trước — không làm lại, không sửa được.",
			chiGom: "Chỉ quản trị hoặc người chọn mới gom ý thành chủ đề được.",
			chuaHetHan:
				"Lần hỏi ý còn mở — chưa gom được, chờ tới hạn hoặc dời hạn về bây giờ.",
			nguoiChonChuaNiemPhong:
				"Người chọn cần niêm phong bản viết trước (hoặc khai không viết trước) rồi mới gom hay kết luận được.",
			khongCoChuDe: (id: string) => `Không có chủ đề nào mang mã ${id}.`,
			chuDeConY:
				"Chủ đề còn ý — chuyển hết ý sang chủ đề khác rồi mới gỡ được.",
			yKhacHoiY: "Ý này không thuộc lần hỏi ý của chủ đề.",
			chuDeYLa:
				"Chủ đề ý lạ chỉ chứa đúng một ý — gắn ý vào một chủ đề thường.",
			yLaKhongDoiTen:
				"Chủ đề ý lạ mang tên của ý — không đổi tên, hãy sửa ý hoặc chuyển ý sang chủ đề thường.",
			noiBanTruocKhongCo: (soCau: number) =>
				`Bản viết trước chỉ có ${soCau} câu — nối tới câu có thật hoặc chọn «mới».`,
			noiBanTruocBoQua:
				"Người chọn đã khai không viết trước — chủ đề chỉ nối được «mới».",
			congBoChuaHetHan:
				"Lần hỏi ý còn mở — chưa công bố được, chờ tới hạn hoặc dời hạn về bây giờ.",
			congBoKyKhongLapKeHoach:
				"Chỉ công bố được khi chu kỳ đang ở pha lập kế hoạch.",
			congBoThieu: {
				"chua-niem-phong":
					"Người chọn cần niêm phong bản viết trước (hoặc khai không viết trước) rồi mới công bố được.",
				"y-chua-gom": "Còn ý chưa gắn vào chủ đề — gắn hết ý rồi mới công bố.",
				"chu-de-rong":
					"Còn chủ đề rỗng — chuyển ý vào hoặc gỡ chủ đề rồi mới công bố.",
				"thieu-ket-luan":
					"Còn chủ đề chưa có kết luận — kết luận hết rồi mới công bố.",
				"thieu-ly-do": `Mỗi chủ đề cần lý do dài ${OKR_HOI_Y.lyDo.min}–${OKR_HOI_Y.lyDo.max} ký tự (chủ đề chọn tối đa ${OKR_HOI_Y.ketLuan.lyDoChonMax}).`,
				"thieu-cau-muc-tieu":
					"Còn chủ đề chọn thiếu câu mục tiêu hợp khuôn tên mục tiêu.",
				"thieu-noi-ban-truoc":
					"Còn chủ đề chọn chưa khai nối với câu viết trước nào — hoặc «mới».",
				"khong-chon":
					"Cần ít nhất một chủ đề kết luận «chọn» mới công bố được.",
			} satisfies Record<Exclude<MaThieu, "vuot-tran">, string>,
			congBoVuotTran: (tran: number, sau: number) =>
				`Công bố sẽ đưa cấp OneHub lên ${sau} mục tiêu — vượt trần ${tran} của chương trình.`,
			conHoiYChuaCongBo: (ten: string) =>
				`Chu kỳ «${ten}» còn một lần hỏi ý mục tiêu chưa công bố — người chọn công bố rồi mới rời lập kế hoạch được. Lần hỏi ý không có ý nào vẫn công bố được: người chọn niêm phong hoặc khai không viết trước, rồi công bố không tạo mục tiêu nào. Người chọn đã hết quyền quản trị thì quản trị đổi người chọn trước.`,
			chuaCongBo: "Lần hỏi ý chưa công bố — chưa bấm «Tôi hiểu vì sao» được.",
			chuaGop: "Chỉ người đã góp ý mới bấm «Tôi hiểu vì sao» được.",
		},
		dangChoDuyet: "Mục tiêu đang chờ duyệt — rút lại để sửa.",
		duyet: {
			canDuyet: "Chương trình cần duyệt trước khi công bố — bấm «Gửi duyệt».",
			khongCanDuyet:
				"Mục tiêu này không cần duyệt — chương trình chưa bật bước duyệt, hoặc mục tiêu cấp OneHub. Bấm «Công bố».",
			chiGuiTuNhap: "Chỉ gửi duyệt được mục tiêu nháp.",
			guiCanKr: "Cần ít nhất một KR trước khi gửi duyệt.",
			khongDuyetDuoc:
				"Chỉ người duyệt của mục tiêu này mới duyệt hay trả lại được.",
			khongPhaiNguoiGui: "Chỉ người đã gửi duyệt mới rút lại được.",
			khongConChoDuyet:
				"Mục tiêu này không còn chờ duyệt — tải lại để xem trạng thái mới.",
		},
		taiCoCau: {
			canQuanTri:
				"Cần quyền quản trị để chuyển OKR giữa các đơn vị hay xem OKR mồ côi.",
			khacCap: (ten: string) =>
				`Mục tiêu «${ten}» không cùng cấp với đơn vị nhận — mục tiêu phòng ban chỉ sang phòng ban, mục tiêu bộ phận chỉ sang bộ phận.`,
			daBo: (ten: string) => `Mục tiêu «${ten}» đã bỏ — không chuyển nữa.`,
			kyDaDong: (ten: string) =>
				`Mục tiêu «${ten}» thuộc chu kỳ đã đóng — OKR đã đóng giữ ở đơn vị cũ.`,
			khongDonVi: "Không gắn đơn vị",
			donViNhanLuuTru:
				"Đơn vị nhận đã lưu trữ — khôi phục đơn vị đó hoặc chọn đơn vị khác.",
			vuotTran: (n: number, tran: number) =>
				`Đã chuyển. Đơn vị nhận giờ có ${n} mục tiêu trong một chu kỳ — vượt trần ${tran} của chương trình.`,
		},
		hienThi: {
			nguoiXemKhongConThanhVien:
				"Người xem có tên phải là thành viên còn trong không gian làm việc.",
			conCanChinh: (n: number) =>
				`Mục tiêu còn ${n} căn chỉnh — gỡ hết căn chỉnh (góp vào và nhận góp) rồi mới đặt mức giới hạn.`,
		},
		troLy: {
			daQuyet: "Đề xuất này đã được quyết",
			khongCoDeXuat: (id: string) => `Không có đề xuất nào mang mã ${id}.`,
			cachKhongHop: "Dòng này không nhận cách quyết đó.",
			canGiaTri: "Sửa rồi nhận cần giá trị mới.",
			daCu: "Ô này đã đổi từ lúc Trợ lý OKR đề xuất — tải lại danh sách góp ý.",
			krKhacMucTieu: "KR này không thuộc Mục tiêu đang hỏi.",
			khongCoTomTat: (id: string) =>
				`Không có bản tóm tắt tuần nào mang mã ${id}.`,
		},
		daCongBo: "Mục tiêu này đã công bố.",
		daBo: "Mục tiêu này đã bỏ.",
		xoa: {
			dangChoDuyet: "Mục tiêu đang chờ duyệt — rút về Nháp rồi mới xoá được.",
			coLichSu: (lyDo: string) =>
				`Mục tiêu ${lyDo} — không xoá được. Hãy bỏ mục tiêu.`,
			lyDo: {
				"da-cong-bo": "đã từng công bố",
				"muc-tieu.alignedBy": "đang có mục tiêu khác góp vào",
				"muc-tieu.comments": "đã có bình luận",
				"muc-tieu.nhinLai": "đã có nhìn lại cuối kỳ",
				"muc-tieu.mangSangDi": "đã được mang sang kỳ sau",
				"muc-tieu.mangSangTu": "được mang sang từ kỳ trước",
				"muc-tieu.ghiNhan": "đã có ghi nhận",
				"muc-tieu.chuDeHoiY": "sinh ra từ một lần hỏi ý",
				"kr.alignedBy": "có KR đang được mục tiêu khác góp vào",
				"kr.checkIns": "có KR đã có cập nhật tuần",
				"kr.comments": "có KR đã có bình luận",
				"kr.soChup": "có KR đã có số chụp",
				"kr.doiDich": "có KR đã đổi đích",
				"kr.diemKr": "có KR đã chấm điểm",
				"kr.bangChung": "có KR đã có bằng chứng",
				"kr.ghiNhan": "có KR đã có ghi nhận",
			} satisfies Record<LyDoLichSu, string>,
		},
		dungLai: {
			chuaBo: "Chỉ dùng lại được mục tiêu đã bỏ.",
		},
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
			gioiHanKhongCanChinh:
				"Mục tiêu ở mức giới hạn không căn chỉnh được: không góp vào mục tiêu khác, cũng không nhận mục tiêu nào góp vào.",
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
