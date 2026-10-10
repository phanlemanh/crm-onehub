import type { Locale } from "@crm/ui/lib/locale";
import type { LyDoTuChoiNop } from "@crm/validation/okr-cuoc-soan";
import type { MaLyDoHong } from "@/lib/cua-okr-config";
import type { RouterOutputs } from "@/lib/trpc/types";

type Okr = RouterOutputs["okr"];
type LyDoSoan = Extract<Okr["soanSanSang"], { bat: false }>["lyDo"];
type LyDoLuot = Extract<Okr["soanTangLuot"], { ok: false }>["lyDo"];
type LyDoQuyet = Extract<Okr["soanQuyet"], { ok: false }>["lyDo"];
type LyDoDuaVao = Extract<Okr["soanDuaVao"], { ok: false }>["lyDo"];
type TrangThaiCuoc = Okr["soanDanhSach"]["cuoc"]["trangThai"];
type LoaiMucTieu = Extract<
	Okr["soanDanhSach"]["dong"][number],
	{ loai: "muc-tieu-moi" }
>["loaiMucTieu"];

type SoDoSoan = Okr["soanSoDo"];
type HangSoDo = Exclude<keyof SoDoSoan["bat"], "theoMa">;
type MaLoai = SoDoSoan["bat"]["theoMa"][number]["maLoai"];
type TrangThaiDong = Okr["soanAn"]["dong"][number]["trangThai"];
type LoaiDong = Okr["soanAn"]["dong"][number]["loai"];
type BuocCat = NonNullable<Okr["soanAn"]["daCat"]>["buoc"][number];
type Nac = Okr["soanSoDo"]["cuocGanDay"][number]["nac"];

const CAU_QUA_45S =
	"Quá 45 giây không có hồi âm. Bản nháp bên cạnh giữ nguyên.";
const CAU_DUNG_GIUA =
	"Phiên trò chuyện đã dừng giữa chừng. Bản nháp bên cạnh giữ nguyên.";
const CAU_QUA_45S_EN =
	"No reply for 45 seconds. The draft alongside is unchanged.";
const CAU_DUNG_GIUA_EN =
	"The conversation stopped part way. The draft alongside is unchanged.";

type NhanDong = "vua-them" | "vua-sua" | "vua-chuyen" | "da-bo";
type Ket = "accepted" | "dismissed" | "skipped";

const vi = {
	nut: {
		soan: "Soạn OKR cùng Trợ lý",
		tiep: "Tiếp cuộc đang soạn",
		tiepMoTa: (ngay: string, luot: string, dongChuaQuyet: string) =>
			`Mở ${ngay} · ${luot} lượt · ${dongChuaQuyet} dòng chưa quyết`,
		cheDoAn: "chế độ ẩn",
		cheDoAnMoTa:
			"Chỉ quản trị thấy nút này; cuộc soạn tính vào số đo, không tính vào đơn vị.",
		hetCuoc: (tran: string) => `Đã dùng hết ${tran} cuộc soạn kỳ này`,
		tamNghi: (ngay: string) => `Trợ lý OKR tạm nghỉ tới ${ngay}`,
		dsCuoc: (da: string, tran: string) => `${da}/${tran} cuộc`,
		loiMo: "Chưa mở được cuộc soạn",
		chuaCauHinh:
			"Tính năng soạn nháp chưa được bật trên máy chủ này — quản trị viên OneHub cần bật nó.",
		thongTin: "Thông tin cuộc soạn",
	},
	man: {
		luot: (luot: string, tran: string) => `lượt ${luot}/${tran}`,
		tabs: "Màn soạn",
		tabTroChuyen: "Trò chuyện",
		tabBanNhap: (n: string) => `Bản nháp (${n})`,
		banNhap: "Bản nháp",
		soDong: (n: string) => `${n} dòng`,
		dangMo: "Đang mở cuộc soạn…",
		khongMo: "Không mở được cuộc soạn này",
		khongMoMoTa:
			"Cuộc không còn, hoặc bạn không xem được nó. Đóng màn này rồi mở lại từ khung đơn vị.",
	},
	hoiThoai: {
		nhan: "Trò chuyện với Trợ lý OKR",
		moDau: "Trợ lý OKR đang đọc bối cảnh của đơn vị…",
		khongDocLai: "Không đọc lại được các lượt trước",
		khongDocLaiMoTa:
			"Bản nháp bên cạnh vẫn còn đủ; bạn nói tiếp được ở ô bên dưới.",
		dangSoan: "Trợ lý OKR đang soạn…",
		placeholder: "Trả lời, hoặc nói bạn muốn đổi gì trong bản nháp…",
		khoaKhiSoan: "Ô soạn mở lại khi Trợ lý trả lời xong.",
		goiY: (hoi: string) => `Gợi ý trả lời: ${hoi}`,
		loi: "Trợ lý OKR chưa trả lời được",
		loiMoTa: CAU_QUA_45S,
		loiMoTaKhac: CAU_DUNG_GIUA,
		lyDoHong: {
			"khong-noi-duoc": "Không nối được tới Trợ lý OKR.",
			"qua-han": "Trợ lý OKR không trả lời kịp.",
			"tro-ly-tu-choi": "Trợ lý OKR từ chối lượt này.",
			"tro-ly-loi": "Trợ lý OKR đang gặp lỗi.",
			"chua-dem-duoc-luot":
				"Chưa đếm được lượt nên chưa gửi. Thử lại sau ít phút.",
			"chua-mo-duoc-phien": "Chưa mở được phiên trò chuyện.",
			"het-dang-nhap":
				"Phiên đăng nhập đã hết — tải lại trang để đăng nhập lại.",
			"mat-mang": "Mất kết nối mạng. Kiểm tra mạng rồi thử lại.",
			"chua-mo-lai-duoc": "Chưa mở lại được cuộc này. Thử lại sau ít phút.",
			"qua-45s": CAU_QUA_45S,
			"dung-giua-chung": CAU_DUNG_GIUA,
		} satisfies Record<MaLyDoHong, string>,
		khongTinh: "Lượt này không bị tính.",
		daThuLai: (n: string) => `Đã thử lại ${n} lần`,
		chuaGuiLai:
			"Chưa gửi lại được — lượt trước chưa dừng hẳn. Thử lại sau ít phút.",
		hetLuot: (n: string) =>
			`Đã dùng hết ${n} lượt của cuộc này — đưa vào bộ OKR hoặc mở cuộc mới`,
		moCuocMoi: "Mở cuộc mới",
		thieuBoiCanh:
			"Chưa có Hồ sơ công ty và Chiến lược năm — Trợ lý soạn với ít bối cảnh hơn",
		thieuBoiCanhMoTa:
			"Viết hai trang loại «Chiến lược» trong Kho tài liệu rồi duyệt; cuộc sau Trợ lý sẽ đọc.",
		toiKho: "Tới Kho tài liệu",
		cuocDong: "Cuộc này đã kết thúc",
		cuocDongMoTa: "Bản nháp bên cạnh còn để xem lại; không gửi thêm lượt nào.",
	},
	banNhap: {
		rong: "Chưa có dòng nào",
		rongMoTa:
			"Trả lời Trợ lý trong khung trò chuyện; bản nháp sẽ hiện ở đây để bạn nhận, sửa hay bác từng dòng.",
		mucTieu: (stt: string) => `Mục tiêu ${stt}`,
		loai: {
			"cam-ket": "Cam kết",
			"tham-vong": "Tham vọng",
			"hoc-tap": "Học tập",
		} satisfies Record<LoaiMucTieu, string>,
		viSaoLucNay: (chu: string) => `Vì sao lúc này: ${chu}`,
		kr: "KR",
		canChinhNhan: "Căn chỉnh",
		canChinh: (ten: string) => `Góp vào «${ten}»`,
		doBang: (donVi: string) => `đo bằng ${donVi}`,
		goiYKhoiDiem: (so: string) => `khởi điểm gợi ý ${so}`,
		khoiDiem: "Khởi điểm",
		dich: "Đích",
		moc: "Mốc — chỉ đánh dấu xong hay chưa xong, không cần số.",
		nhan: {
			"vua-them": "vừa thêm",
			"vua-sua": "vừa sửa",
			"vua-chuyen": "vừa chuyển",
			"da-bo": "đã bỏ",
		} satisfies Record<NhanDong, string>,
		nut: {
			sua: "Sửa",
			huy: "Huỷ",
		},
		ket: {
			accepted: "Đã nhận",
			dismissed: "Đã bác",
			skipped: "Đã bỏ qua",
		} satisfies Record<Ket, string>,
		bacCon: (n: string) => `${n} dòng con thu gọn`,
		duaVao: (mt: string, kr: string) =>
			`Đưa vào bộ OKR · ${mt} Mục tiêu, ${kr} KR`,
		thieuDich: (n: string) =>
			`Điền khởi điểm và đích cho ${n} KR đã nhận trước khi đưa vào`,
		chuaNhan: "Nhận ít nhất một Mục tiêu để đưa vào bộ OKR",
		duaVaoMoTa: (donVi: string, ky: string) =>
			`Tạo ở trạng thái nháp cho ${donVi}, ${ky}. Dòng đã bác không đưa vào; đích do bạn đặt.`,
		xacNhan: {
			tieuDe: "Đưa vào bộ OKR",
			than: (mt: string, kr: string, donVi: string, ky: string) =>
				`Tạo ${mt} Mục tiêu và ${kr} KR, đích do bạn đặt, ở trạng thái nháp cho ${donVi}, ${ky}?`,
			nut: "Đưa vào",
			thoi: "Huỷ",
		},
		daTao: (n: string) => `Đã tạo ${n} Mục tiêu nháp`,
		daTaoMoTa: (kr: string) =>
			`${kr} KR đi kèm; đích bạn đã điền được giữ. Công bố như mọi OKR ở Theo đơn vị.`,
		xemTheoDonVi: "Xem ở Theo đơn vị",
		loiDuaVao: {
			"thieu-so-kr": "Một KR đã nhận còn thiếu khởi điểm hay đích",
			"vuot-tran-muc-tieu":
				"Vượt trần Mục tiêu mỗi đơn vị — bác bớt rồi đưa vào lại",
			"chu-ky-khong-lap-ke-hoach": "Chu kỳ không còn ở pha lập kế hoạch",
			"cuoc-khong-dang": "Cuộc này đã kết thúc",
			"don-vi-chua-bat": "Đơn vị không còn được bật việc soạn",
			"don-vi-luu-tru": "Đơn vị đã lưu trữ",
			"cha-chua-nhan": "Có dòng con nằm dưới một Mục tiêu chưa nhận",
			"cha-da-bac": "Có dòng con nằm dưới một Mục tiêu đã bác",
			"cha-bi-loai": "Có dòng con nằm dưới một Mục tiêu đã bị loại",
			"khong-co-cha": "Có dòng con không còn Mục tiêu cha",
		} satisfies Record<LyDoDuaVao, string>,
	},
	cuoc: {
		tieuDe: (ky: string) => `Cuộc soạn cùng Trợ lý · ${ky}`,
		dem: (n: string, tran: string) => `${n}/${tran} cuộc`,
		nhan: "Các cuộc soạn của đơn vị",
		nguoiMo: "Người mở:",
		dongNhan: (nhan: string, tong: string) => `${nhan}/${tong} dòng nhận`,
		tiep: "Tiếp",
		xem: "Xem",
		nutCuoc: (viec: string, ngay: string) => `${viec} cuộc ${ngay}`,
		trangThai: {
			dang: "Đang soạn",
			"da-dua-vao": "Đã đưa vào",
			bo: "Bỏ dở",
		} satisfies Record<TrangThaiCuoc, string>,
		rong: "Đơn vị chưa có cuộc soạn nào",
		rongMoTa: (tran: string) =>
			`Mỗi chu kỳ có ${tran} cuộc; cuộc đã đưa vào bộ OKR vẫn xem lại được ở đây.`,
		loi: "Chưa đọc được danh sách cuộc soạn",
	},
	soDo: {
		tieuDe: "Soạn OKR cùng Trợ lý",
		moTa: "Số đo của nấc bật và chế độ ẩn; Mục tiêu còn chờ duyệt chưa tính là công bố. Bấm một cuộc để xem bản nháp cuối.",
		cotSo: "Số đo",
		nacTen: { bat: "Bật", an: "Ẩn" } satisfies Record<Nac, string>,
		hang: {
			cuocMo: "Cuộc mở",
			cuocDuaVao: "Cuộc tới «Đưa vào»",
			donViCoCuoc: "Đơn vị có cuộc",
			donViHoanTat: "Đơn vị đã đưa vào",
			tyLeDonViHoanTat: "Tỷ lệ đơn vị đưa vào",
			daHien: "Dòng đã hiện",
			dongNhan: "Dòng nhận",
			dongSua: "Dòng sửa rồi nhận",
			dongBac: "Dòng bác",
			tyLeDuocNhan: "Tỷ lệ dòng được nhận",
			dongBiLoai: "Dòng bị bộ kiểm loại",
			mucTieuNhap: "Mục tiêu nháp đã tạo",
			mucTieuCongBo14Ngay: "Mục tiêu nháp công bố trong 14 ngày",
			tyLeCongBo14Ngay: "Tỷ lệ công bố trong 14 ngày",
			chiPhiMoiCuocUsd: "Chi phí mỗi cuộc",
			tienUsd: "Tổng chi phí",
			p50Ms: "Độ trễ mỗi lượt p50",
			p90Ms: "Độ trễ mỗi lượt p90",
		} satisfies Record<HangSoDo, string>,
		maLoai: {
			"so-moi": "Có số không có trong dữ liệu",
			"dich-khong-trong": "Máy ghi số đích",
			"noi-ve-nguoi": "Nêu tên một người",
			"tu-cam": "Dùng từ cần tránh",
			"chep-cap-tren": "Chép KR của cấp trên",
			"id-ngoai-goi": "Trỏ tới mục ngoài gói bối cảnh",
			"da-bac": "Trùng dòng đã bác",
			"moc-co-dich-so": "KR mốc mang số đích",
			"khong-don-vi": "KR thiếu đơn vị đo",
			"khoi-diem-la-dich": "Khởi điểm lấy từ số đích",
		} satisfies Record<MaLoai, string>,
		cotDonVi: "Đơn vị",
		cotNac: "Nấc",
		cotLuot: "Lượt",
		cotDong: "Dòng nhận",
		cotChiPhi: "Chi phí",
		nac: { bat: "Bật", an: "Chế độ ẩn" } satisfies Record<Nac, string>,
		luot: (n: string) => `${n} lượt`,
		ghiChu: {
			bat: "Bản nháp cuối của cuộc, kể cả dòng bộ kiểm đã loại.",
			an: "Bản nháp cuối, kể cả dòng bị loại — cuộc ở chế độ ẩn nên không ai trong đơn vị thấy.",
		} satisfies Record<Nac, string>,
		banNhapCuoi: "Bản nháp cuối",
		nganTieuDe: "Cuộc soạn",
		loaiDong: {
			"muc-tieu-moi": "Mục tiêu",
			"kr-moi": "KR",
			"can-chinh-moi": "Căn chỉnh",
		} satisfies Record<LoaiDong, string>,
		trangThai: {
			cho: "Qua bộ kiểm",
			nhan: "Đã nhận",
			sua: "Sửa rồi nhận",
			bac: "Đã bác",
			"het-han": "Hết hạn",
			"da-sua-theo": "Người dùng đã sửa theo",
			"bo-qua": "Đã bỏ qua",
			"bi-loai": "Bị loại",
		} satisfies Record<TrangThaiDong, string>,
		biLoaiMa: (nhan: string) => `Bị loại · ${nhan}`,
		khongDong: "Cuộc này chưa có dòng nháp nào.",
		daCat: {
			tieuDe: "Gói bối cảnh đã cắt",
			cotGiaTri: "Giá trị",
			khong: "Gói nằm trong trần; không lớp nào bị cắt.",
			buoc: "Đã cắt",
			truocToken: "Cỡ gói trước khi cắt (token)",
			sauToken: "Cỡ gói sau khi cắt (token)",
			chienLuocCatKyTu: "Trang chiến lược cắt bớt (ký tự)",
			tenBuoc: {
				"3-tom-gon": "Lớp 3: dòng tóm gọn Cập nhật tuần",
				"3-kr": "Lớp 3: KR chu kỳ trước",
				"ngang-cap": "Mục tiêu ngang cấp",
				"2a-kr": "Lớp 2a: KR của cấp trên",
			} satisfies Record<BuocCat, string>,
		},
		rong: "Chu kỳ này chưa có cuộc soạn nào",
		rongMoTa:
			"Số đo hiện khi trưởng đơn vị mở cuộc đầu tiên, hoặc khi một đơn vị ở chế độ ẩn được soạn thử.",
		loi: "Không tải được số đo",
		loiCuoc: "Không đọc được cuộc này",
		thuLai: "Thử lại",
	},
	trang: {
		tieuDe: "Soạn OKR",
		khongMo: "mở cuộc soạn",
		khongMoMoTa: "Cuộc này không còn, hoặc bạn không xem được nó.",
		chuaCauHinh: "Quản trị cần nối Kara · OKR trong Cài đặt trước khi soạn.",
		hoiDong: {
			tieuDe: "Kara đang soạn. Đóng khung?",
			than: "Lượt này vẫn chạy khi bạn đóng. Mở lại cuộc soạn để xem bản nháp mới.",
			nut: "Đóng",
			thoi: "Ở lại",
		},
	},
	dong: {
		tieuDe: "Bản nháp",
		meta: (n: string, gio: string) => `${n} dòng · sửa lúc ${gio}`,
		dangSoanDau: "Kara đang soạn bản nháp đầu…",
		chiDongCho: "Chỉ dòng chờ",
		moiDong: "Mọi dòng",
		themMucTieu: "Thêm Mục tiêu",
		themKr: "Thêm KR",
		themCanChinh: "Thêm căn chỉnh",
		themBanSua: "Thêm bản đã sửa",
		boQua: "Bỏ qua",
		hoiKara: "Hỏi Kara về dòng này",
		themNhom: (n: string) => `Thêm cả Mục tiêu và ${n} KR đã đủ số`,
		daThemNhom: (stt: string, n: string) =>
			`Đã thêm Mục tiêu ${stt} và ${n} KR`,
		kemKr: (n: string) => ` · hoàn tác kèm ${n} KR`,
		daThem: "Đã thêm",
		daBoQua: "Đã bỏ qua",
		conThieu: "Còn thiếu",
		nguCanh: (loai: string, chu: string) => `${loai} · ${chu}`,
	},
	loiQuyet: {
		dongCu: "Dòng này thuộc bản nháp cũ — Kara đã nộp bản mới hơn.",
		cuocKhongDang: "Cuộc soạn này đã đưa vào bộ OKR hoặc đã bỏ.",
		mang: "Kara chưa ghi được quyết định này. Thử lại.",
	},
	moc: {
		dau: (mt: string, kr: string) => `${mt} Mục tiêu · ${kr} KR`,
		themMucTieu: (n: string) => `+${n} Mục tiêu`,
		themKr: (n: string) => `+${n} KR`,
		sua: (n: string) => `sửa ${n}`,
		chuyen: (n: string) => `chuyển ${n}`,
		bo: (n: string) => `bỏ ${n}`,
		khongDoi: "không đổi dòng nào",
		khongDoc: "Kara nộp bản nháp",
		nopKhongThanh: (lyDo: string | null) =>
			lyDo
				? `Kara nộp bản nháp chưa được — ${lyDo}`
				: "Kara nộp bản nháp chưa được",
		nopKhongDoc: "Kara nộp bản nháp nhưng không đọc được kết quả",
		lyDoTuChoi: {
			cuocKhongThuocPhien: "cuộc soạn này thuộc một cuộc trò chuyện khác",
			cuocKhongDang: "cuộc soạn đã đóng",
			donViChuaBat: "đơn vị chưa bật Kara soạn OKR",
			saiMucDich: "cuộc trò chuyện này không dùng để soạn OKR",
			chuKyKhongLapKeHoach: "chu kỳ đã rời pha «Lập kế hoạch»",
			dongTrungKhoa: "bản nháp có hai dòng trùng nhau",
			phienKhongSong: "cuộc trò chuyện đã hết hạn — mở lại trang soạn",
		} satisfies Record<LyDoTuChoiNop, string>,
	},
	buoc: {
		read_file: "đọc tài liệu của đơn vị",
		grep: "tìm trong tài liệu",
		glob: "liệt kê tài liệu",
		load_skill: "nạp cách soạn OKR",
		web_search: "tìm trên web",
		web_fetch: "đọc một trang web",
		todo: "lập danh sách việc",
		agent: "nhờ một trợ lý phụ",
		bash: "chạy một lệnh",
		write_file: "ghi ghi chú",
		khac: "làm một bước",
	},
	heThong: {
		seGui: (s: string) => `Sẽ gửi kèm lượt sau: ${s}`,
		loai: { "muc-tieu": "Mục tiêu", kr: "KR", "can-chinh": "căn chỉnh" },
		cach: {
			nhan: (loai: string, chu: string) => `Bạn đã thêm ${loai} «${chu}»`,
			sua: (loai: string, chu: string) =>
				`Bạn đã sửa rồi thêm ${loai} «${chu}»`,
			bac: (loai: string, chu: string) => `Bạn đã bỏ qua ${loai} «${chu}»`,
			hoan: (loai: string, chu: string) => `Bạn đã hoàn tác ${loai} «${chu}»`,
		},
	},
	lyDo: {
		"don-vi-luu-tru": "Đơn vị đã lưu trữ",
		"don-vi-chua-bat": "Đơn vị chưa được bật việc soạn",
		"don-vi-che-do-an": "Đơn vị ở chế độ ẩn",
		"het-cuoc-ky": "Đã dùng hết cuộc soạn kỳ này",
		"het-tran-thang": "Trợ lý OKR tạm nghỉ tới đầu tháng sau",
		"con-cuoc-dang": "Đơn vị còn một cuộc đang soạn",
		"cuoc-an-dang-mo":
			"Quản trị đang có một cuộc soạn ở chế độ ẩn trên đơn vị này",
		"chua-co-khoa-mo-hinh": "Chưa có khoá mô hình",
	} satisfies Record<LyDoSoan, string>,
	lyDoLuot: {
		"het-luot-cuoc": "Đã dùng hết lượt của cuộc này",
		"het-tran-thang": "Trợ lý OKR tạm nghỉ tới đầu tháng sau",
		"cuoc-khong-dang": "Cuộc này đã kết thúc",
		"don-vi-chua-bat": "Đơn vị không còn được bật việc soạn",
		"don-vi-luu-tru": "Đơn vị đã lưu trữ",
		"chua-co-khoa-mo-hinh": "Chưa có khoá mô hình — nhờ quản trị cài",
	} satisfies Record<LyDoLuot, string>,
	lyDoQuyet: {
		"don-vi-chua-bat": "Đơn vị không còn được bật việc soạn",
		"don-vi-luu-tru": "Đơn vị đã lưu trữ",
		"cha-da-bac": "Mục tiêu cha đã bị bác",
		"cha-bi-loai": "Mục tiêu cha đã bị loại",
		"khong-co-cha": "Không còn Mục tiêu cha",
		"chua-quyet": "Dòng này đang chờ — không có gì để hoàn tác",
		"kem-sai":
			"Có KR không còn chờ hay không thuộc Mục tiêu này — tải lại bản nháp rồi thử lại",
	} satisfies Record<LyDoQuyet, string>,
};

export type OkrSoanMessages = typeof vi;

const en: OkrSoanMessages = {
	nut: {
		soan: "Draft OKRs with the Assistant",
		tiep: "Continue the open session",
		tiepMoTa: (ngay, luot, dongChuaQuyet) =>
			`Opened ${ngay} · ${luot} turns · ${dongChuaQuyet} lines undecided`,
		cheDoAn: "hidden mode",
		cheDoAnMoTa:
			"Only admins see this button; the session counts in the metrics, not against the unit.",
		hetCuoc: (tran) => `All ${tran} drafting sessions for this cycle are used`,
		tamNghi: (ngay) => `The OKR Assistant is paused until ${ngay}`,
		dsCuoc: (da, tran) => `${da}/${tran} sessions`,
		loiMo: "The drafting session could not be opened",
		chuaCauHinh:
			"Drafting isn't turned on for this server yet — a OneHub admin needs to turn it on.",
		thongTin: "Drafting details",
	},
	man: {
		luot: (luot, tran) => `turn ${luot}/${tran}`,
		tabs: "Drafting screen",
		tabTroChuyen: "Conversation",
		tabBanNhap: (n) => `Draft (${n})`,
		banNhap: "Draft",
		soDong: (n) => `${n} lines`,
		dangMo: "Opening the drafting session…",
		khongMo: "This drafting session could not be opened",
		khongMoMoTa:
			"It no longer exists, or you cannot see it. Close this screen and open it again from the unit.",
	},
	hoiThoai: {
		nhan: "Conversation with the OKR Assistant",
		moDau: "The OKR Assistant is reading the unit's context…",
		khongDocLai: "Earlier turns could not be loaded",
		khongDocLaiMoTa:
			"The draft alongside is complete; you can keep talking in the box below.",
		dangSoan: "The OKR Assistant is drafting…",
		placeholder: "Answer, or say what you want changed in the draft…",
		khoaKhiSoan: "The box reopens when the Assistant finishes.",
		goiY: (hoi) => `Suggested answers: ${hoi}`,
		loi: "The OKR Assistant did not answer",
		loiMoTa: CAU_QUA_45S_EN,
		loiMoTaKhac: CAU_DUNG_GIUA_EN,
		lyDoHong: {
			"khong-noi-duoc": "Could not reach the OKR Assistant.",
			"qua-han": "The OKR Assistant did not respond in time.",
			"tro-ly-tu-choi": "The OKR Assistant refused this turn.",
			"tro-ly-loi": "The OKR Assistant ran into an error.",
			"chua-dem-duoc-luot":
				"Could not count the turn, so nothing was sent. Try again in a few minutes.",
			"chua-mo-duoc-phien": "Could not open the conversation.",
			"het-dang-nhap":
				"Your sign-in has expired — reload the page to sign in again.",
			"mat-mang":
				"Network connection lost. Check your connection and try again.",
			"chua-mo-lai-duoc":
				"Could not reopen this session. Try again in a few minutes.",
			"qua-45s": CAU_QUA_45S_EN,
			"dung-giua-chung": CAU_DUNG_GIUA_EN,
		},
		khongTinh: "This turn was not counted.",
		daThuLai: (n) => `Tried again ${n} times`,
		chuaGuiLai:
			"Could not send again — the previous turn has not fully stopped. Try again in a few minutes.",
		hetLuot: (n) =>
			`All ${n} turns of this session are used — add it to the OKRs or open a new session`,
		moCuocMoi: "Open a new session",
		thieuBoiCanh:
			"No company profile or annual strategy yet — the Assistant drafts with less context",
		thieuBoiCanhMoTa:
			"Write two «Strategy» pages in the Document library and approve them; the next session will read them.",
		toiKho: "Go to the Document library",
		cuocDong: "This session has ended",
		cuocDongMoTa:
			"The draft alongside stays for review; no more turns can be sent.",
	},
	banNhap: {
		rong: "No lines yet",
		rongMoTa:
			"Answer the Assistant in the conversation; the draft appears here so you can accept, edit or reject each line.",
		mucTieu: (stt) => `Objective ${stt}`,
		loai: {
			"cam-ket": "Committed",
			"tham-vong": "Aspirational",
			"hoc-tap": "Learning",
		},
		viSaoLucNay: (chu) => `Why now: ${chu}`,
		kr: "KR",
		canChinhNhan: "Alignment",
		canChinh: (ten) => `Contributes to «${ten}»`,
		doBang: (donVi) => `measured in ${donVi}`,
		goiYKhoiDiem: (so) => `suggested start ${so}`,
		khoiDiem: "Start",
		dich: "Target",
		moc: "Milestone — only marked done or not done, no numbers needed.",
		nhan: {
			"vua-them": "just added",
			"vua-sua": "just edited",
			"vua-chuyen": "just moved",
			"da-bo": "dropped",
		},
		nut: {
			sua: "Edit",
			huy: "Cancel",
		},
		ket: { accepted: "Accepted", dismissed: "Rejected", skipped: "Skipped" },
		bacCon: (n) => `${n} lines below collapsed`,
		duaVao: (mt, kr) => `Add to OKRs · ${mt} Objectives, ${kr} KRs`,
		thieuDich: (n) =>
			`Fill in the start and target for ${n} accepted KRs before adding`,
		chuaNhan: "Accept at least one Objective to add it to the OKRs",
		duaVaoMoTa: (donVi, ky) =>
			`Created as drafts for ${donVi}, ${ky}. Rejected lines are left out; you set the targets.`,
		xacNhan: {
			tieuDe: "Add to OKRs",
			than: (mt, kr, donVi, ky) =>
				`Create ${mt} Objectives and ${kr} KRs, with your targets, as drafts for ${donVi}, ${ky}?`,
			nut: "Add",
			thoi: "Cancel",
		},
		daTao: (n) => `Created ${n} draft Objectives`,
		daTaoMoTa: (kr) =>
			`${kr} KRs come with them; the targets you entered are kept. Publish them like any OKR under By unit.`,
		xemTheoDonVi: "View under By unit",
		loiDuaVao: {
			"thieu-so-kr": "An accepted KR is missing its start or target",
			"vuot-tran-muc-tieu":
				"Over the Objective limit per unit — reject some, then add again",
			"chu-ky-khong-lap-ke-hoach": "The cycle is no longer in planning",
			"cuoc-khong-dang": "This session has ended",
			"don-vi-chua-bat": "Drafting is no longer switched on for the unit",
			"don-vi-luu-tru": "The unit is archived",
			"cha-chua-nhan": "A line sits under an Objective that is not accepted",
			"cha-da-bac": "A line sits under a rejected Objective",
			"cha-bi-loai": "A line sits under a removed Objective",
			"khong-co-cha": "A line no longer has its Objective",
		},
	},
	cuoc: {
		tieuDe: (ky) => `Drafting sessions with the Assistant · ${ky}`,
		dem: (n, tran) => `${n}/${tran} sessions`,
		nhan: "The unit's drafting sessions",
		nguoiMo: "Opened by",
		dongNhan: (nhan, tong) => `${nhan}/${tong} lines accepted`,
		tiep: "Continue",
		xem: "View",
		nutCuoc: (viec, ngay) => `${viec} session of ${ngay}`,
		trangThai: { dang: "Drafting", "da-dua-vao": "Added", bo: "Abandoned" },
		rong: "The unit has no drafting sessions yet",
		rongMoTa: (tran) =>
			`Each cycle has ${tran} sessions; sessions already added to the OKRs can still be reviewed here.`,
		loi: "The drafting sessions could not be loaded",
	},
	soDo: {
		tieuDe: "Drafting OKRs with the Assistant",
		moTa: "Numbers for on and hidden mode; Objectives still awaiting approval do not count as published. Open a session to see its last draft.",
		cotSo: "Measure",
		nacTen: { bat: "On", an: "Hidden" },
		hang: {
			cuocMo: "Sessions opened",
			cuocDuaVao: "Sessions that reached «Add to OKRs»",
			donViCoCuoc: "Units with a session",
			donViHoanTat: "Units that added a draft",
			tyLeDonViHoanTat: "Share of units that added a draft",
			daHien: "Lines shown",
			dongNhan: "Lines accepted",
			dongSua: "Lines edited then accepted",
			dongBac: "Lines rejected",
			tyLeDuocNhan: "Share of lines accepted",
			dongBiLoai: "Lines removed by the checker",
			mucTieuNhap: "Draft Objectives created",
			mucTieuCongBo14Ngay: "Draft Objectives published within 14 days",
			tyLeCongBo14Ngay: "Share published within 14 days",
			chiPhiMoiCuocUsd: "Cost per session",
			tienUsd: "Total cost",
			p50Ms: "Latency per turn p50",
			p90Ms: "Latency per turn p90",
		},
		maLoai: {
			"so-moi": "Has a number not in the data",
			"dich-khong-trong": "The model wrote a target",
			"noi-ve-nguoi": "Names a person",
			"tu-cam": "Uses a word to avoid",
			"chep-cap-tren": "Copies a KR from the level above",
			"id-ngoai-goi": "Points outside the context pack",
			"da-bac": "Repeats a rejected line",
			"moc-co-dich-so": "Milestone KR carries a numeric target",
			"khong-don-vi": "KR has no unit",
			"khoi-diem-la-dich": "Starting value taken from a target",
		},
		cotDonVi: "Unit",
		cotNac: "Mode",
		cotLuot: "Turns",
		cotDong: "Lines accepted",
		cotChiPhi: "Cost",
		nac: { bat: "On", an: "Hidden mode" },
		luot: (n) => `${n} turns`,
		ghiChu: {
			bat: "The session's last draft, including lines the checker removed.",
			an: "The last draft, including removed lines — the session is in hidden mode, so nobody in the unit sees it.",
		},
		banNhapCuoi: "Last draft",
		nganTieuDe: "Drafting session",
		loaiDong: {
			"muc-tieu-moi": "Objective",
			"kr-moi": "KR",
			"can-chinh-moi": "Alignment",
		},
		trangThai: {
			cho: "Passed the checker",
			nhan: "Accepted",
			sua: "Edited then accepted",
			bac: "Rejected",
			"het-han": "Expired",
			"da-sua-theo": "The user made the change",
			"bo-qua": "Skipped",
			"bi-loai": "Removed",
		},
		biLoaiMa: (nhan) => `Removed · ${nhan}`,
		khongDong: "This session has no draft lines yet.",
		daCat: {
			tieuDe: "Context pack cuts",
			cotGiaTri: "Value",
			khong: "The pack fit within its limit; no layer was cut.",
			buoc: "Cut",
			truocToken: "Pack size before cutting (tokens)",
			sauToken: "Pack size after cutting (tokens)",
			chienLuocCatKyTu: "Strategy page trimmed (characters)",
			tenBuoc: {
				"3-tom-gon": "Layer 3: weekly update summaries",
				"3-kr": "Layer 3: last cycle's KRs",
				"ngang-cap": "Peer Objectives",
				"2a-kr": "Layer 2a: KRs of the level above",
			},
		},
		rong: "No drafting sessions in this cycle yet",
		rongMoTa:
			"Numbers appear once a unit head opens the first session, or a unit in hidden mode is tried.",
		loi: "The numbers could not be loaded",
		loiCuoc: "This session could not be read",
		thuLai: "Try again",
	},
	trang: {
		tieuDe: "Draft OKRs",
		khongMo: "open this drafting session",
		khongMoMoTa: "The session is gone, or you can't see it.",
		chuaCauHinh:
			"An admin needs to connect Kara · OKR in Settings before drafting.",
		hoiDong: {
			tieuDe: "Kara is drafting. Close the panel?",
			than: "This turn keeps running when you close. Reopen the session to see the new draft.",
			nut: "Close",
			thoi: "Stay",
		},
	},
	dong: {
		tieuDe: "Draft",
		meta: (n: string, gio: string) => `${n} lines · edited ${gio}`,
		dangSoanDau: "Kara is drafting the first version…",
		chiDongCho: "Only pending",
		moiDong: "All lines",
		themMucTieu: "Add objective",
		themKr: "Add KR",
		themCanChinh: "Add alignment",
		themBanSua: "Add edited version",
		boQua: "Skip",
		hoiKara: "Ask Kara about this line",
		themNhom: (n: string) => `Add the objective and ${n} KR with numbers`,
		daThemNhom: (stt: string, n: string) =>
			`Added objective ${stt} and ${n} KR`,
		kemKr: (n: string) => ` · undo includes ${n} KR`,
		daThem: "Added",
		daBoQua: "Skipped",
		conThieu: "Still missing",
		nguCanh: (loai: string, chu: string) => `${loai} · ${chu}`,
	},
	loiQuyet: {
		dongCu:
			"This line belongs to an older draft — Kara has submitted a newer one.",
		cuocKhongDang: "This session was applied to the OKR set or abandoned.",
		mang: "Kara couldn't save this decision. Try again.",
	},
	moc: {
		dau: (mt: string, kr: string) => `${mt} objectives · ${kr} KR`,
		themMucTieu: (n: string) => `+${n} objectives`,
		themKr: (n: string) => `+${n} KR`,
		sua: (n: string) => `${n} edited`,
		chuyen: (n: string) => `${n} moved`,
		bo: (n: string) => `${n} dropped`,
		khongDoi: "no lines changed",
		khongDoc: "Kara submitted the draft",
		nopKhongThanh: (lyDo: string | null) =>
			lyDo
				? `Kara could not submit the draft — ${lyDo}`
				: "Kara could not submit the draft",
		nopKhongDoc: "Kara submitted the draft but the result could not be read",
		lyDoTuChoi: {
			cuocKhongThuocPhien:
				"this drafting session belongs to another conversation",
			cuocKhongDang: "the drafting session has closed",
			donViChuaBat: "Kara drafting isn't turned on for this unit",
			saiMucDich: "this conversation isn't for drafting OKRs",
			chuKyKhongLapKeHoach: "the cycle has left Planning",
			dongTrungKhoa: "the draft has two duplicate lines",
			phienKhongSong: "the conversation has expired — reopen the drafting page",
		} satisfies Record<LyDoTuChoiNop, string>,
	},
	buoc: {
		read_file: "read the unit's documents",
		grep: "search the documents",
		glob: "list the documents",
		load_skill: "load the OKR drafting guide",
		web_search: "search the web",
		web_fetch: "read a web page",
		todo: "make a task list",
		agent: "ask a helper",
		bash: "run a command",
		write_file: "write notes",
		khac: "take a step",
	},
	heThong: {
		seGui: (s: string) => `Sent with the next turn: ${s}`,
		loai: { "muc-tieu": "objective", kr: "KR", "can-chinh": "alignment" },
		cach: {
			nhan: (loai: string, chu: string) => `You added ${loai} «${chu}»`,
			sua: (loai: string, chu: string) =>
				`You edited and added ${loai} «${chu}»`,
			bac: (loai: string, chu: string) => `You skipped ${loai} «${chu}»`,
			hoan: (loai: string, chu: string) => `You undid ${loai} «${chu}»`,
		},
	},
	lyDo: {
		"don-vi-luu-tru": "The unit is archived",
		"don-vi-chua-bat": "Drafting is not switched on for the unit",
		"don-vi-che-do-an": "The unit is in hidden mode",
		"het-cuoc-ky": "All drafting sessions for this cycle are used",
		"het-tran-thang": "The OKR Assistant is paused until next month",
		"con-cuoc-dang": "The unit still has an open drafting session",
		"cuoc-an-dang-mo":
			"An admin has a hidden-mode drafting session open on this unit",
		"chua-co-khoa-mo-hinh": "No model key yet",
	},
	lyDoLuot: {
		"het-luot-cuoc": "All turns of this session are used",
		"het-tran-thang": "The OKR Assistant is paused until next month",
		"cuoc-khong-dang": "This session has ended",
		"don-vi-chua-bat": "Drafting is no longer switched on for the unit",
		"don-vi-luu-tru": "The unit is archived",
		"chua-co-khoa-mo-hinh": "No model key yet — ask an admin to add one",
	},
	lyDoQuyet: {
		"don-vi-chua-bat": "Drafting is no longer switched on for the unit",
		"don-vi-luu-tru": "The unit is archived",
		"cha-da-bac": "The parent Objective was rejected",
		"cha-bi-loai": "The parent Objective was removed",
		"khong-co-cha": "The parent Objective is gone",
		"chua-quyet": "This line is still pending — there is nothing to undo",
		"kem-sai":
			"A KR is no longer pending or not under this objective — reload the draft and try again",
	},
};

const BANG = { en, vi } satisfies Record<Locale, OkrSoanMessages>;

export function okrSoanMessages(locale: Locale): OkrSoanMessages {
	return BANG[locale];
}
