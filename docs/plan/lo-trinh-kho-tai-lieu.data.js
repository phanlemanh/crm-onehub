window.LO_TRINH_KHO_TAI_LIEU = {
	chup_luc: "2026-10-01T11:30:00+07:00",
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
			that: "2026-09-29",
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
			pr: [194, 195, 196, 197, 198, 200],
			cau_giao:
				"«Tôi tải tệp quy định đang có lên, máy soạn thành trang, tôi sửa và duyệt»",
			buoc_ke:
				"Anh thử tải một tệp Word thật trên production, rồi chạy phiên nghiệm thu",
			cho_anh: true,
			chan_boi: [],
			ghi_chu:
				"Merge 8b76152a ngày 28/09, sớm tám ngày so với đề xuất. Chấm năm vòng: round 2 BLOCKED ở E2t vì thiếu Blob thật; Cổng Bằng chứng mở lại Cổng Phạm vi thêm AC-16 (thủ tục nhận nguồn có thể xoá tệp của nguồn đã có); round 3 REJECT chạm trần ba vòng; round 5 đạt, E2t chạy trên kho Blob riêng tư thật kho-tai-lieu-nguon (sin1, chưa gắn dự án). Bốn hạn chế đã biết ở Notes của hợp đồng. migration 20261003010000_may_soan_de_xuat. Sau merge: #195 vùng kéo-thả dựng trên móc ReUI; #196 sửa câu gợi ý; #197 kho nguồn đọc khoá riêng KHO_TAI_LIEU_BLOB_TOKEN (đặt tay trên Production của api và agent, kho không gắn dự án); #198 diff bỏ vòng Myers mức khối, hết sát trần CI; #200 thước màn chữ theo khoá mới. Hộp «Tải nguồn lên» đã mở trên production, chưa tải tệp thật nào.",
		},
		{
			id: "l3",
			dong: 2,
			ten: "Lượt 3",
			slug: "tim-va-dieu-huong-kho",
			hang: "T2",
			trang_thai: "đã lên onehub",
			ngay: "2026-09-29",
			pr: [205],
			cau_giao:
				"«Tôi gõ ⌘K có dấu hay không dấu là ra trang; thấy trang nào nhắc tới trang này; sáng ra biết có mấy bản chờ tôi duyệt»",
			buoc_ke: "Phiên nghiệm thu lượt 3; Cổng Giá trị đóng ở đợt chạy thật",
			chan_boi: [],
			ghi_chu:
				"Nhận thêm hai hạn chế của lượt 1 (dấu | trong ô bảng, trần 25 dòng), dòng nhắc sáng «chờ duyệt», lọc theo đơn vị, loại, chủ. 2026-09-29: S1 xong trên nhánh feat/tim-va-dieu-huong-kho — hợp đồng 12 AC, 25 eval, gap-probe 1 P0 + 3 P1 + 1 P2 đã sửa, design-pass 6 ảnh, ba hình quyết định. Chủ kho chốt: dòng nhắc sáng đếm bằng số tab «Chờ duyệt»; nhận chèn liên kết tới trang. Máy đề xuất tách lịch sử, khôi phục, lưu trữ sang 3b (T3) vì chưa có trạng thái lưu trữ; lượt 3 giữ T2, không migration. Anh duyệt Cổng Phạm vi 29/09, nhận tách 3b; ký Cổng Đáng build, ngưỡng giữ như đề xuất. 29/09: S3 xong, năm lệnh xanh. S4 round 1 BLOCKED kèm một phát hiện trong hợp đồng (nhắc sáng tự tính lại luật duyệt) và hội đồng ảnh thấy tiêu đề bị nút đè ở 390; đã sửa, kể cả đầu trang dùng chung. Round 2 PENDING-JUDGMENT: 25 eval và bốn suite xanh, hội đồng ảnh UNCERTAIN, bảy mục ngoài hợp đồng. Anh ký Cổng Bằng chứng 29/09 (E12j Đạt); gộp onehub, ghim lại xanh, mở PR #205. CI xanh, merge vào onehub 29/09, lên production.",
			cho_anh: true,
		},
		{
			id: "l3b",
			dong: 10,
			ten: "Lượt 3b",
			slug: "lich-su-va-luu-tru-trang",
			hang: "T3",
			trang_thai: "chưa mở",
			ngay: "2026-09-29",
			pr: [],
			cau_giao:
				"«Tôi xem được các phiên bản cũ của trang, khôi phục một bản cũ qua duyệt, và lưu trữ trang không còn dùng»",
			buoc_ke: "Mở được ngay: lượt 3 đã lên",
			chan_boi: [],
			ghi_chu:
				"Tách từ lượt 3 ngày 29/09, anh nhận ở Cổng Phạm vi. T3 vì cần cột trạng thái lưu trữ trên TaiLieuTrang. Gồm cả «trang lưu trữ không ra kết quả» của tìm kiếm.",
		},
		{
			id: "l4",
			dong: 4,
			ten: "Lượt 4",
			slug: "tro-ly-doc-kho",
			hang: "T3",
			trang_thai: "đang dựng",
			ngay: "2026-10-01",
			pr: [],
			cau_giao:
				"«Tôi hỏi bằng lời thường, trong CRM hay qua Zalo, được trả lời có trích trang và phiên bản; không biết thì nói không biết»",
			buoc_ke: "Máy thi công 12 task rồi chấm S4; anh ký Cổng Đáng khi tiện",
			chan_boi: ["cb"],
			cho_anh: true,
			ghi_chu:
				"Evals là script chấm 50 câu hỏi thật cộng 10–15 judgment; dùng khoá AI thứ hai của lượt 2. 01/10: vòng mở trên nhánh feat/tro-ly-doc-kho; lên T3 vì cần hai bảng mới (nhật ký hỏi, việc «báo sai») — kho chưa có bảng việc nào dùng được. Anh chốt: hỏi ở tab «Hỏi» của Kho; Zalo do trợ lý AI tự nhận ra; thêm ô đặt «Xác minh đến ngày» (cột này chưa có đường ghi nào); chỉ lưu chữ câu từ chối và câu bị báo sai. S1 xong: 15 AC, 22 eval, gap-probe 1 P0 + 4 P1 đã sửa, design-pass 6 ảnh, hai hình quyết định. Chỉ AC-15 chờ bộ câu đo. 01/10: anh duyệt Cổng Phạm vi, bộ câu đo theo ngả máy khuyên (bộ «tạm» cho vòng chấm, 50 câu thật gom song song, chạy tuần đầu chạy thật); Cổng Đáng chưa ký; vào S2. Kế hoạch 12 task chờ Cổng 1.5. Anh duyệt kế hoạch, thi công tuần tự; vào S3.",
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
			viec: "Phiên nghiệm thu lượt 3: /acceptance-gate:uat-session tim-va-dieu-huong-kho",
			hang_muc: "l3",
		},
		{
			viec: "Mở lượt 3b lich-su-va-luu-tru-trang (T3)",
			hang_muc: "l3b",
		},
		{
			viec: "Thử tải một tệp Word quy định thật lên production: lần ghi vào kho riêng tư đầu tiên chưa được đo ở production",
			hang_muc: "l2",
		},
		{
			viec: "Chạy phiên nghiệm thu máy soạn (uat-session may-soan-de-xuat)",
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
		{
			viec: "Lượt 4: ký Cổng Đáng (ba trường trong opportunity.md); gom 50 câu hỏi thật, giữ ngoài kho",
			hang_muc: "l4",
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
		{
			ngay: "2026-09-28",
			viec: "Kho nguồn dùng khoá Blob riêng, không lùi về khoá logo; không gắn kho riêng tư vào dự án",
		},
		{
			ngay: "2026-09-29",
			viec: "Tách lịch sử, khôi phục, lưu trữ sang lượt 3b (T3); lượt 3 giữ T2, không migration",
		},
		{
			ngay: "2026-10-01",
			viec: "Lượt 4: hỏi ở tab «Hỏi» của Kho; Zalo do trợ lý AI tự nhận ra; thêm ô đặt «Xác minh đến ngày»; chỉ lưu chữ câu từ chối và câu bị báo sai",
		},
	],
	nhat_ky: [
		{
			ngay: "2026-10-01",
			viec: "Lượt 4: anh duyệt kế hoạch ở Cổng 1.5; vào S3",
		},
		{
			ngay: "2026-10-01",
			viec: "Lượt 4: kế hoạch 12 task chờ Cổng 1.5",
		},
		{
			ngay: "2026-10-01",
			viec: "Lượt 4: anh duyệt Cổng Phạm vi, bộ câu đo theo ngả máy khuyên; vào S2",
		},
		{
			ngay: "2026-10-01",
			viec: "Lượt 4 mở (T3): S1 xong, 15 AC, 22 eval; chờ Cổng Đáng, bộ câu đo và Cổng Phạm vi",
		},
		{
			ngay: "2026-09-29",
			viec: "Lượt 3 lên onehub (PR #205): ⌘K tìm kho, trang nhắc tới, lọc, tab Sức khoẻ, dòng nhắc sáng",
		},
		{
			ngay: "2026-09-29",
			viec: "Lượt 3: anh ký Cổng Bằng chứng; mở PR #205 vào onehub",
		},
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
			viec: "#200: thước màn chữ của hộp kéo-thả theo khoá kho nguồn mới",
		},
		{
			ngay: "2026-09-28",
			viec: "#198: diff bỏ vòng Myers mức khối vô ích, ca tat-dinh hết sát trần CI",
		},
		{
			ngay: "2026-09-28",
			viec: "#197: kho nguồn dùng khoá riêng KHO_TAI_LIEU_BLOB_TOKEN; đặt trên Production api và agent, hộp tải nguồn mở",
		},
		{
			ngay: "2026-09-28",
			viec: "#195, #196: vùng kéo-thả tệp nguồn dựng trên móc ReUI; sửa câu gợi ý",
		},
		{
			ngay: "2026-09-28",
			viec: "#193: trang theo dõi lộ trình trong kho; vẽ lại PRODUCT-MAP.md đang lệch",
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
