window.LO_TRINH_KHO_TAI_LIEU = {
	chup_luc: "2026-09-29T08:30:00+07:00",
	nguon: "docs/plan/lo-trinh-kho-tai-lieu.md mục 8",
	moc: [
		{
			ten: "Kho cho người",
			nghia:
				"Nhân viên viết trang, chủ trang duyệt, cả công ty đọc bản đang dùng",
			de_xuat: "2026-10-01",
			that: "2026-09-28",
			hang_muc: "l1",
		},
		{
			ten: "Nội dung vào nhanh",
			nghia:
				"Phòng ban tải tệp đang có lên, máy soạn thành trang, chủ trang duyệt",
			de_xuat: "2026-10-06",
			that: "2026-09-28",
			hang_muc: "l2",
		},
		{
			ten: "Tìm được",
			nghia: "⌘K có dấu hay không dấu, backlink, tab Sức khoẻ",
			de_xuat: "2026-10-08",
			that: "",
			hang_muc: "l3",
		},
		{
			ten: "Hỏi được",
			nghia: "Hỏi trong CRM hay qua Zalo, trả lời có trích trang và phiên bản",
			de_xuat: "2026-10-13",
			that: "",
			hang_muc: "l4",
		},
		{
			ten: "Chạy thật",
			nghia: "Mọi phòng ban tự nạp tài liệu và dùng hai tuần; đo bốn số",
			de_xuat: "2026-10-14",
			den: "2026-10-28",
			that: "",
			hang_muc: "ct",
		},
		{
			ten: "Sửa một đợt",
			nghia: "Góp ý đã gom được sửa trong một lượt",
			de_xuat: "2026-11-04",
			that: "",
			hang_muc: "l5",
		},
	],
	hang_muc: [
		{
			id: "l0",
			dong: 0,
			ten: "Lượt 0 — nền",
			slug: "",
			hang: "",
			trang_thai: "xong",
			ngay: "2026-09-27",
			pr: [],
			cau_giao: "Nghiên cứu nền, bản mẫu bấm được, trình đọc markdown",
			buoc_ke: "",
			chan_boi: [],
			ghi_chu:
				"18 luồng nghiên cứu, 546 nguồn; bản mẫu /proto/kho-tai-lieu 15 trạng thái; chốt duyệt mọi thay đổi.",
		},
		{
			id: "l1",
			dong: 1,
			ten: "Lượt 1",
			slug: "kho-tai-lieu",
			hang: "T3",
			trang_thai: "đã lên onehub",
			ngay: "2026-09-28",
			pr: [180, 181],
			cau_giao:
				"«Tôi viết được một trang, gửi chủ trang duyệt, cả công ty đọc được bản đang dùng»",
			buoc_ke: "Cổng Giá trị đóng ở đợt chạy thật",
			chan_boi: [],
			ghi_chu:
				"Merge c1e37b73 ngày 28/09, sớm ba ngày so với đề xuất. 17 hạn chế đã biết; hai mục người dùng gặp trước (dấu | trong ô bảng mất dữ liệu, danh sách đề xuất trần 25 dòng) vào đầu lượt 3. migration dời thành 20261001010000_kho_tai_lieu.",
		},
		{
			id: "l2",
			dong: 5,
			ten: "Lượt 2",
			slug: "may-soan-de-xuat",
			hang: "T3",
			trang_thai: "đã lên onehub",
			ngay: "2026-09-28",
			pr: [194],
			cau_giao:
				"«Tôi tải tệp quy định đang có lên, máy soạn thành trang, tôi sửa và duyệt»",
			buoc_ke: "Cổng Giá trị đóng ở đợt chạy thật",
			cho_anh: false,
			chan_boi: [],
			ghi_chu:
				"Merge 8b76152a ngày 28/09, sớm tám ngày so với đề xuất. Chấm năm vòng: round 2 BLOCKED ở E2t vì thiếu Blob thật; Cổng Bằng chứng mở lại Cổng Phạm vi thêm AC-16 (thủ tục nhận nguồn có thể xoá tệp của nguồn đã có); round 3 REJECT chạm trần ba vòng; round 5 đạt, E2t chạy trên kho Blob riêng tư thật kho-tai-lieu-nguon (sin1, chưa gắn dự án). Bốn hạn chế đã biết ở Notes của hợp đồng. migration 20261003010000_may_soan_de_xuat.",
		},
		{
			id: "l3",
			dong: 2,
			ten: "Lượt 3",
			slug: "tim-va-dieu-huong-kho",
			hang: "T2",
			trang_thai: "Cổng Bằng chứng",
			ngay: "2026-09-29",
			pr: [],
			cau_giao:
				"«Tôi gõ ⌘K có dấu hay không dấu là ra trang; thấy trang nào nhắc tới trang này; sáng ra biết có mấy bản chờ tôi duyệt»",
			buoc_ke:
				"Anh ký Cổng Bằng chứng: quyết E12j và bảy mục ngoài hợp đồng, nặng nhất là màn chi tiết agent lệch bố cục trên điện thoại",
			chan_boi: [],
			ghi_chu:
				"Nhận thêm hai hạn chế của lượt 1 (dấu | trong ô bảng, trần 25 dòng), dòng nhắc sáng «chờ duyệt», lọc theo đơn vị, loại, chủ. 2026-09-29: S1 xong trên nhánh feat/tim-va-dieu-huong-kho — hợp đồng 12 AC, 25 eval, gap-probe 1 P0 + 3 P1 + 1 P2 đã sửa, design-pass 6 ảnh, ba hình quyết định. Chủ kho chốt: dòng nhắc sáng đếm bằng số tab «Chờ duyệt»; nhận chèn liên kết tới trang. Máy đề xuất tách lịch sử, khôi phục, lưu trữ sang 3b (T3) vì chưa có trạng thái lưu trữ; lượt 3 giữ T2, không migration. Anh duyệt Cổng Phạm vi 29/09, nhận tách 3b; ký Cổng Đáng build, ngưỡng giữ như đề xuất. 29/09: S3 xong, năm lệnh xanh. S4 round 1 BLOCKED kèm một phát hiện trong hợp đồng (nhắc sáng tự tính lại luật duyệt) và hội đồng ảnh thấy tiêu đề bị nút đè ở 390; đã sửa, kể cả đầu trang dùng chung. Round 2 PENDING-JUDGMENT: 25 eval và bốn suite xanh, hội đồng ảnh UNCERTAIN, bảy mục ngoài hợp đồng.",
			cho_anh: true,
		},
		{
			id: "l4",
			dong: 4,
			ten: "Lượt 4",
			slug: "tro-ly-doc-kho",
			hang: "T2",
			trang_thai: "chưa mở",
			ngay: "",
			pr: [],
			cau_giao:
				"«Tôi hỏi bằng lời thường, trong CRM hay qua Zalo, được trả lời có trích trang và phiên bản; không biết thì nói không biết»",
			buoc_ke: "Chờ lượt 3 lên và 50 câu hỏi thật",
			chan_boi: ["l3", "cb"],
			ghi_chu:
				"Evals là script chấm 50 câu hỏi thật cộng 10–15 judgment; dùng khoá AI thứ hai của lượt 2.",
		},
		{
			id: "ct",
			dong: 3,
			ten: "Chạy thật — mọi phòng ban",
			slug: "",
			hang: "",
			trang_thai: "chưa mở",
			ngay: "",
			pr: [],
			cau_giao:
				"Mọi phòng ban tự nạp 10–20 tệp, dùng hai tuần; góp ý gom một chỗ",
			buoc_ke: "Chờ lượt 4 lên",
			chan_boi: ["l4"],
			ghi_chu:
				"Bốn số: trang đã duyệt theo đơn vị ≥ 10, câu hỏi có trích ≥ 70%, trung vị đề xuất tới duyệt ≤ 5 ngày làm việc, số lần «báo sai».",
		},
		{
			id: "cb",
			dong: 7,
			ten: "Chuẩn bị chạy thật",
			slug: "",
			hang: "",
			trang_thai: "đang dựng",
			ngay: "2026-09-28",
			pr: [],
			cau_giao: "Việc của chủ kho chạy song song với các lượt",
			buoc_ke: "Gom 50 câu hỏi thật trước lượt 4",
			cho_anh: true,
			chan_boi: [],
			ghi_chu:
				"«Quy tắc viết» v0: máy soạn từ ba văn bản mẫu thật (cách C), anh nhận làm quy tắc và sửa dần khi vận hành. Kiểm kê và gom tệp Zalo là việc phòng ban làm trong đợt chạy thật.",
		},
		{
			id: "l5",
			dong: 8,
			ten: "Lượt 5",
			slug: "sua-sau-chay-that",
			hang: "T2",
			trang_thai: "chưa mở",
			ngay: "",
			pr: [],
			cau_giao: "Danh sách góp ý đã gom được sửa trong một lượt",
			buoc_ke: "Chờ chạy thật xong",
			chan_boi: ["ct"],
			ghi_chu: "",
		},
		{
			id: "d9",
			dong: 9,
			ten: "Để sau",
			slug: "chu-trang-va-pham-vi",
			hang: "T3",
			trang_thai: "để sau",
			ngay: "",
			pr: [],
			cau_giao:
				"Phó, thang leo, nhắc hạn xác minh, phạm vi xem theo trang, bậc 2",
			buoc_ke: "Mở ngay sau chạy thật nếu trung vị duyệt vượt 5 ngày",
			chan_boi: ["ct"],
			ghi_chu: "",
		},
		{
			id: "d6",
			dong: 6,
			ten: "Để sau",
			slug: "bao-tri-trang-luat",
			hang: "T3",
			trang_thai: "để sau",
			ngay: "",
			pr: [],
			cau_giao:
				"Soát định kỳ, cờ cũ theo hash nguồn, thẻ căn cứ pháp lý, thẻ mâu thuẫn, đồ thị",
			buoc_ke: "Quyết bằng số đo chạy thật",
			chan_boi: ["ct"],
			ghi_chu: "",
		},
	],
	cho_anh: [
		{
			viec: "Kiểm production có BLOB_READ_WRITE_TOKEN chưa: kho kho-tai-lieu-nguon chưa gắn dự án nào; thiếu token thì nút «Tải nguồn lên» khoá",
			hang_muc: "l2",
		},
		{
			viec: "Kiểm production đã chạy migration 20261001010000 và 20261003010000",
			hang_muc: "l2",
		},
		{
			viec: "Đọc lại «Quy tắc viết» v0 máy soạn, sửa những chỗ chưa đúng ý",
			hang_muc: "cb",
		},
		{
			viec: "Gom 50 câu hỏi thật theo kho-tai-lieu-bo-vang.md trước lượt 4",
			hang_muc: "cb",
		},
	],
	da_chot: [
		{
			ngay: "2026-09-26",
			viec: "Theo mẫu LLM Wiki: máy soạn bản đề xuất, chủ trang duyệt, trợ lý AI chỉ đọc bản đang dùng",
		},
		{
			ngay: "2026-09-26",
			viec: "Duyệt mọi thay đổi, kể cả sửa chính tả và liên kết; không có bậc tự áp dụng",
		},
		{
			ngay: "2026-09-27",
			viec: "Lộ trình theo output: năm lượt, chạy thật mọi phòng ban hai tuần, một lượt sửa",
		},
		{
			ngay: "2026-09-27",
			viec: "Bỏ hạng mục pháp lý khỏi lộ trình",
		},
		{
			ngay: "2026-09-28",
			viec: "Lượt 2: khoá nút Duyệt tới khi tick hết từng con số mới",
		},
		{
			ngay: "2026-09-28",
			viec: "«Quy tắc viết»: cách C — máy soạn v0 từ ba văn bản mẫu, chủ kho nhận và sửa dần",
		},
		{
			ngay: "2026-09-28",
			viec: "Lượt 2: sửa ngay lỗi nhận nguồn xoá nhầm tệp (thêm AC-16) thay vì để lượt sau, vì merge là lên production",
		},
	],
	nhat_ky: [
		{
			ngay: "2026-09-29",
			viec: "Lượt 3: S4 round 2 PENDING-JUDGMENT, 25 eval và bốn suite xanh; chờ anh ký Cổng Bằng chứng",
		},
		{
			ngay: "2026-09-29",
			viec: "Lượt 3: Cổng Đáng ký build, ngưỡng giữ như đề xuất",
		},
		{
			ngay: "2026-09-29",
			viec: "Lượt 3: Cổng Phạm vi duyệt, nhận tách lịch sử, khôi phục, lưu trữ sang 3b; vào S2",
		},
		{
			ngay: "2026-09-29",
			viec: "Lượt 3 mở: S1 xong, 12 AC, 25 eval, chờ Cổng Đáng và Cổng Phạm vi",
		},
		{
			ngay: "2026-09-28",
			viec: "#194 merge 8b76152a: lượt 2 lên onehub và production",
		},
		{
			ngay: "2026-09-28",
			viec: "Lượt 2: anh ký Cổng Bằng chứng round 5; E2t đạt trên kho Blob riêng tư thật",
		},
		{
			ngay: "2026-09-28",
			viec: "Lượt 2: mở lại Cổng Phạm vi thêm AC-16; round 3 REJECT chạm trần ba vòng",
		},
		{
			ngay: "2026-09-28",
			viec: "Lượt 2 qua Cổng Đáng, Cổng Phạm vi (hai lần), Cổng 1.5; dựng đủ 12 task",
		},
		{
			ngay: "2026-09-28",
			viec: "#181: sổ theo dõi dòng 1 sang «đã lên onehub»",
		},
		{
			ngay: "2026-09-28",
			viec: "#180 merge c1e37b73: lượt 1 lên onehub và production, sau hai lần CI đỏ vì test đo giờ trên máy GitHub",
		},
		{
			ngay: "2026-09-28",
			viec: "Lượt 1: anh ký Cổng Bằng chứng sau ba vòng chấm (28/28 phép đo)",
		},
		{
			ngay: "2026-09-27",
			viec: "Lượt 1 qua Cổng Phạm vi và Cổng 1.5; dựng năm màn, trình soạn Tiptap, màn duyệt Track Changes",
		},
		{
			ngay: "2026-09-27",
			viec: "Lượt 0 xong: nghiên cứu nền, bản mẫu, trình đọc markdown",
		},
	],
};
