# Bảng ngưỡng đề xuất — F39

Máy đề xuất, người chốt. Ô «máy soạn» là chữ mới; ô «đã có» là chữ cũ của hồ sơ, chỉ chờ bỏ nhãn [đề xuất] khi chốt.

Timebox chung: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7).

Viết lại khuôn (chữ cũ sai khuôn, đã gộp lại — soi kỹ): gop-y-dung-cho, hoan-tac-loat-dung-id, lo-trinh-ten-va-build, nen-kara, okr-cua-toi-tach-theo-doi, okr-loai-hoc-tap, quyet-gop-y-noi-dung-ly-do, the-gop-y-okr, zalo-gui-hong-ghi-ly-do.

Câu hỏi riêng: loc-don-vi-khong-tu-dong.

## bo-cuc-hep-ngan-va-kanban

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Người dùng mở Bảng cột thoả thuận và ngăn thoả thuận, công ty trên điện thoại có đọc đủ tên, giá trị, giai đoạn và người phụ trách mà không phải xoay ngang hay chuyển sang máy tính không? | Quan sát trong phiên nghiệm thu chung với 3 người trên điện thoại; docs/telemetry.md không có sự kiện nào đo bố cục hay cắt chữ. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu với 3 người dùng thật trên điện thoại của họ (khổ 375–390) và dữ liệu thật, ít nhất 2 trên 3 người đọc đúng giai đoạn, giá trị và người phụ trách của 3 thoả thuận do người chủ trì chỉ định, và không ai gặp chữ bị cắt «…» hay thẻ tràn viền. | Quan sát trong phiên nghiệm thu chung với 3 người trên điện thoại; docs/telemetry.md không có sự kiện nào đo bố cục hay cắt chữ. |
| CHẾT | **máy soạn:** Trong phiên nghiệm thu có người gặp nhãn giai đoạn, số liệu đầu ngăn hay thẻ Kanban bị cắt «…» hoặc tràn viền trên dữ liệu thật, hoặc dưới 2 trên 3 người đọc đúng cả 3 thoả thuận. | Quan sát trong phiên nghiệm thu chung với 3 người trên điện thoại; docs/telemetry.md không có sự kiện nào đo bố cục hay cắt chữ. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát trong phiên nghiệm thu chung với 3 người trên điện thoại; docs/telemetry.md không có sự kiện nào đo bố cục hay cắt chữ. |

Căn cứ: AC-1, AC-2, AC-3 và AC-6 hứa thẻ và ngăn ở khổ 375 hiện đủ chữ, không cắt «…», không cuộn ngang.

## cap-nhat-trong-ngan-kr

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: [đề xuất] đã đạt «Mở một KR đến hạn chưa cập nhật: khối cập nhật mở sẵn trong ngăn, gửi xong ngăn vẫn mở, Lịch sử thêm một dòng ở đầu và biểu đồ thêm một điểm; bấm «Cập nhật» trên dòng Họp tuần mở ngăn KR và cuộn tới khối; không Dialog nào mở trong cả luồng» chưa? | — |
| SỐNG | đã có: [đề xuất] Mở một KR đến hạn chưa cập nhật: khối cập nhật mở sẵn trong ngăn, gửi xong ngăn vẫn mở, Lịch sử thêm một dòng ở đầu và biểu đồ thêm một điểm; bấm «Cập nhật» trên dòng Họp tuần mở ngăn KR và cuộn tới khối; không Dialog nào mở trong cả luồng | — |
| CHẾT | đã có: [đề xuất] chưa đạt «Mở một KR đến hạn chưa cập nhật: khối cập nhật mở sẵn trong ngăn, gửi xong ngăn vẫn mở, Lịch sử thêm một dòng ở đầu và biểu đồ thêm một điểm; bấm «Cập nhật» trên dòng Họp tuần mở ngăn KR và cuộn tới khối; không Dialog nào mở trong cả luồng» khi hết timebox | — |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Lịch đọc số chung của đợt dọn dẹp |

Căn cứ: B7 (chủ kho đồng ý 31/10): một phiên nghiệm thu chung sau khi BK và SV gộp

## cay-can-chinh-co-ly-do

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Người phụ trách OKR có dùng Cây căn chỉnh và chip «Chưa có lý do» để tìm ra các đường nối còn trống lý do rồi bổ sung chúng không? | Truy vấn bảng okrAlignment (lyDo khác null, theo chu kỳ) chụp ngày bật và ngày hạn, cộng quan sát phiên nghiệm thu với 3 người; telemetry không có sự kiện cho cây hay bộ lọc. |
| SỐNG | **máy soạn:** Đến hạn, tỉ lệ căn chỉnh của chu kỳ hiện hành có lyDo khác null trong bảng okrAlignment tăng ít nhất 10 điểm so với mốc chụp ngày bật, và trong phiên nghiệm thu ít nhất 2 trên 3 người tự tìm được một đường «Chưa có lý do» bằng chip lọc trong vòng 1 phút. | Truy vấn bảng okrAlignment (lyDo khác null, theo chu kỳ) chụp ngày bật và ngày hạn, cộng quan sát phiên nghiệm thu với 3 người; telemetry không có sự kiện cho cây hay bộ lọc. |
| CHẾT | **máy soạn:** Tỉ lệ căn chỉnh có lyDo không tăng so với mốc ngày bật, và trong phiên nghiệm thu dưới 2 trên 3 người tìm được đường «Chưa có lý do» bằng bộ lọc. | Truy vấn bảng okrAlignment (lyDo khác null, theo chu kỳ) chụp ngày bật và ngày hạn, cộng quan sát phiên nghiệm thu với 3 người; telemetry không có sự kiện cho cây hay bộ lọc. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Truy vấn bảng okrAlignment (lyDo khác null, theo chu kỳ) chụp ngày bật và ngày hạn, cộng quan sát phiên nghiệm thu với 3 người; telemetry không có sự kiện cho cây hay bộ lọc. |

Căn cứ: AC-6 và AC-7 (chip «Chưa có lý do» lọc cây và mang số cạnh) cùng câu hàng L3 «lọc được các đường Chưa có lý do».

## cho-tac-nhan-lau

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Người dựng Tác nhân có rời màn chờ và quay lại đúng lúc nhờ thông báo của Kara, thay vì ngồi nhìn thẻ «Đang dựng» suốt hơn 200 giây không? | Truy vấn bảng ThongBao (loại tac-nhan-*, docLuc, duongDan) đối chiếu với AgentConversation của bộ dựng; số lượt nền đọc từ sessions_completed và sessions_failed của install_daily trong docs/telemetry.md. |
| SỐNG | **máy soạn:** Trong 2 tuần sau bật, với ít nhất 5 lượt dựng, mọi lượt dựng kết thúc (không tự dừng) có đúng một ThongBao loại tac-nhan-xong, tac-nhan-can-tra-loi hay tac-nhan-hong, và ít nhất một nửa số thông báo đó có docLuc khác null. | Truy vấn bảng ThongBao (loại tac-nhan-*, docLuc, duongDan) đối chiếu với AgentConversation của bộ dựng; số lượt nền đọc từ sessions_completed và sessions_failed của install_daily trong docs/telemetry.md. |
| CHẾT | **máy soạn:** Có lượt dựng kết thúc mà không có ThongBao nào hoặc có hai, hoặc dưới một phần tư thông báo Tác nhân được đọc trong 2 tuần, hoặc người dùng trong phiên nghiệm thu nói vẫn không biết lượt dựng đã xong. | Truy vấn bảng ThongBao (loại tac-nhan-*, docLuc, duongDan) đối chiếu với AgentConversation của bộ dựng; số lượt nền đọc từ sessions_completed và sessions_failed của install_daily trong docs/telemetry.md. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Truy vấn bảng ThongBao (loại tac-nhan-*, docLuc, duongDan) đối chiếu với AgentConversation của bộ dựng; số lượt nền đọc từ sessions_completed và sessions_failed của install_daily trong docs/telemetry.md. |

Căn cứ: AC-2, AC-4 và AC-6 (rời trang được, đúng một thông báo mỗi lượt, mở cuộc trò chuyện thì đã đọc) cùng câu giao «trải nghiệm lớn hơn 200s cần được thay đổi ux».

## chu-man-tieng-viet-khong-tran

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Người dùng trình đọc màn hình có nghe vùng điều hướng bằng tiếng Việt, và người mở Cài đặt › Trường trên điện thoại có đọc được kiểu của từng trường không? | Quan sát phiên nghiệm thu với 3 người trên điện thoại cộng một lượt VoiceOver do người chủ trì chạy; telemetry không đo trợ năng hay bố cục. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu, ít nhất 2 trên 3 người mở Cài đặt › Trường trên điện thoại đọc đúng kiểu của 3 trường chỉ định và không thấy nhãn kiểu tràn ô, và một lượt nghe bằng VoiceOver trên giao diện tiếng Việt đọc breadcrumb là «Vị trí trang». | Quan sát phiên nghiệm thu với 3 người trên điện thoại cộng một lượt VoiceOver do người chủ trì chạy; telemetry không đo trợ năng hay bố cục. |
| CHẾT | **máy soạn:** Có người trong phiên nghiệm thu gặp nhãn kiểu tràn ô hay đọc sai kiểu trường trên điện thoại, hoặc VoiceOver vẫn đọc «breadcrumb» tiếng Anh trên giao diện tiếng Việt. | Quan sát phiên nghiệm thu với 3 người trên điện thoại cộng một lượt VoiceOver do người chủ trì chạy; telemetry không đo trợ năng hay bố cục. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát phiên nghiệm thu với 3 người trên điện thoại cộng một lượt VoiceOver do người chủ trì chạy; telemetry không đo trợ năng hay bố cục. |

Căn cứ: AC-1 (nhãn «Vị trí trang» ở vi), AC-3 (tên ngắn của kiểu) và AC-5 (nhãn kiểu trọn chữ ở khổ 360).

## dai-luu-tru-dung-chung

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi dải báo và vùng khoá thành mảnh chung, người mở một bản ghi đã lưu trữ có còn nhận ra ngay nó đã cất, không sửa nhầm được, và khôi phục bằng một lần bấm không? | Truy vấn cột archivedAt và updatedAt của bảng Contact, Deal (Company tương tự nếu có cột), sự kiện api_error theo route trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |
| SỐNG | **máy soạn:** Trong 2 tuần sau bật, không Contact hay Deal nào còn archivedAt mà có updatedAt muộn hơn archivedAt, không có api_error trên route khôi phục của ba loại bản ghi, và trong phiên nghiệm thu ít nhất 2 trên 3 người nhận ra bản ghi đã lưu trữ và khôi phục được ngay lần bấm đầu. | Truy vấn cột archivedAt và updatedAt của bảng Contact, Deal (Company tương tự nếu có cột), sự kiện api_error theo route trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |
| CHẾT | **máy soạn:** Có bản ghi đang lưu trữ bị ghi đổi sau mốc lưu trữ, hoặc có lần bấm «Khôi phục» gửi hai lệnh hay báo lỗi, hoặc dưới 2 trên 3 người trong phiên nghiệm thu nhận ra bản ghi đã cất. | Truy vấn cột archivedAt và updatedAt của bảng Contact, Deal (Company tương tự nếu có cột), sự kiện api_error theo route trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Truy vấn cột archivedAt và updatedAt của bảng Contact, Deal (Company tương tự nếu có cột), sự kiện api_error theo route trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |

Căn cứ: AC-3 và AC-6 (vùng chỉ đọc, máy chủ không ghi khi bấm vào ô, bấm hai lần chỉ gửi một lần khôi phục) và AC-7 (trông như bản đã ký của V2).

## dau-trang-okr-cho-nut-hoi-kara

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Người mở khu OKR trên điện thoại có còn thấy trang Toàn cảnh nhảy, hay bấm nhầm, khi dữ liệu tới không? | Quan sát phiên nghiệm thu với 3 người trên điện thoại; telemetry không có số đo dịch bố cục (CLS). |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu, 3 trên 3 người mở Toàn cảnh trên điện thoại của họ không bấm nhầm vì nội dung dịch chuyển và không ai nói trang nhảy khi dữ liệu tới. | Quan sát phiên nghiệm thu với 3 người trên điện thoại; telemetry không có số đo dịch bố cục (CLS). |
| CHẾT | **máy soạn:** Có ít nhất một người trong phiên nghiệm thu thấy trang Toàn cảnh nhảy hoặc bấm nhầm vì nội dung tụt xuống khi dữ liệu tới. | Quan sát phiên nghiệm thu với 3 người trên điện thoại; telemetry không có số đo dịch bố cục (CLS). |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát phiên nghiệm thu với 3 người trên điện thoại; telemetry không có số đo dịch bố cục (CLS). |

Căn cứ: AC-1 (vùng nội dung lệch không quá 8 px ở khổ 375) và câu cơ hội «mọi người mở khu OKR trên điện thoại — trang nhảy khi dữ liệu tới».

## duong-ly-do-muc-tieu

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Người xem một mục tiêu có hiểu vì sao nó góp vào mục tiêu cha nhờ khu «Đường lý do», mà không phải đi hỏi người lập không? | Quan sát phiên nghiệm thu với 3 người trên dữ liệu thật, cộng truy vấn đếm okrAlignment có lyDo khác null; telemetry không có sự kiện mở sheet. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu trên ít nhất 3 mục tiêu thật có lý do, ít nhất 2 trên 3 người mở sheet nói lại đúng ý lý do và phân biệt đúng «Có số liệu» với «Đặt cược» mà không cần giải thích. | Quan sát phiên nghiệm thu với 3 người trên dữ liệu thật, cộng truy vấn đếm okrAlignment có lyDo khác null; telemetry không có sự kiện mở sheet. |
| CHẾT | **máy soạn:** Dưới 2 trên 3 người nói lại được lý do hay phân biệt được mức tin, hoặc đến hạn chu kỳ thật không có căn chỉnh nào có lyDo trong okrAlignment để hiện. | Quan sát phiên nghiệm thu với 3 người trên dữ liệu thật, cộng truy vấn đếm okrAlignment có lyDo khác null; telemetry không có sự kiện mở sheet. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát phiên nghiệm thu với 3 người trên dữ liệu thật, cộng truy vấn đếm okrAlignment có lyDo khác null; telemetry không có sự kiện mở sheet. |

Căn cứ: AC-1, AC-2 và AC-3 (lý do, căn cứ và ba nhãn mức tin hiện trên sheet mục tiêu).

## gan-tay-va-kara-co-ly-do

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Căn chỉnh tạo mới sau khi bật, gắn tay hay nhận từ Kara, có thật sự mang lý do thay vì vẫn trống như trước không? | Truy vấn bảng okrAlignment (createdAt, lyDo, lyDoTuKara) đối chiếu OkrDeXuat loại can-chinh ở trạng thái nhan hoặc sua, cùng OkrTrail action sua-ly-do-can-chinh. |
| SỐNG | **máy soạn:** Trong 2 tuần sau bật, với ít nhất 5 căn chỉnh mới, ít nhất 50% căn chỉnh có createdAt sau ngày bật mang lyDo khác null, và mọi căn chỉnh sinh từ đề xuất can-chinh của Kara đã nhận hay sửa đều có lyDo khác null. | Truy vấn bảng okrAlignment (createdAt, lyDo, lyDoTuKara) đối chiếu OkrDeXuat loại can-chinh ở trạng thái nhan hoặc sua, cùng OkrTrail action sua-ly-do-can-chinh. |
| CHẾT | **máy soạn:** Dưới 20% căn chỉnh mới có lý do, hoặc có căn chỉnh sinh từ đề xuất Kara đã nhận mà lyDo vẫn null. | Truy vấn bảng okrAlignment (createdAt, lyDo, lyDoTuKara) đối chiếu OkrDeXuat loại can-chinh ở trạng thái nhan hoặc sua, cùng OkrTrail action sua-ly-do-can-chinh. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Truy vấn bảng okrAlignment (createdAt, lyDo, lyDoTuKara) đối chiếu OkrDeXuat loại can-chinh ở trạng thái nhan hoặc sua, cùng OkrTrail action sua-ly-do-can-chinh. |

Căn cứ: Câu Context «hai đường sinh căn chỉnh hằng ngày vẫn ghi căn chỉnh trống lý do» cùng AC-2 và AC-6 (gắn tay và nhận đề xuất đều ghi lyDo).

## go-tin-hieu-rac

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: [đề xuất] đã đạt «Lượt kéo về đầu tiên sau khi giao không mang tín hiệu nào đã lưu trữ; mỗi lần gỡ có vết người gỡ (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa? | — |
| SỐNG | đã có: [đề xuất] Lượt kéo về đầu tiên sau khi giao không mang tín hiệu nào đã lưu trữ; mỗi lần gỡ có vết người gỡ (ngưỡng đề xuất — chốt ở Cổng Đáng) | — |
| CHẾT | đã có: [đề xuất] chưa đạt «Lượt kéo về đầu tiên sau khi giao không mang tín hiệu nào đã lưu trữ; mỗi lần gỡ có vết người gỡ (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox | — |
| Timebox | đã có: [đề xuất] 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33) | — |

## gon-dau-trang-lay-y-kien

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: đã đạt «Ở 390×812 nút «Gửi» của Lấy ý kiến nằm trọn trong màn đầu; dot-hoi-y-tuong-okr E12 bước 5 xanh lại mà không đổi hình đã ký của hồ sơ khác» chưa? | — |
| SỐNG | đã có: Ở 390×812 nút «Gửi» của Lấy ý kiến nằm trọn trong màn đầu; dot-hoi-y-tuong-okr E12 bước 5 xanh lại mà không đổi hình đã ký của hồ sơ khác | — |
| CHẾT | đã có: chưa đạt «Ở 390×812 nút «Gửi» của Lấy ý kiến nằm trọn trong màn đầu; dot-hoi-y-tuong-okr E12 bước 5 xanh lại mà không đổi hình đã ký của hồ sơ khác» khi hết timebox | — |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Lịch đọc số chung của đợt dọn dẹp |

Căn cứ: B7 (chủ kho đồng ý 31/10): một phiên nghiệm thu chung sau khi BK và SV gộp

## gop-y-dung-cho — viết lại khuôn

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: góp ý của Kara có được quyết (nhận, sửa, bỏ qua) thay vì nằm im không? | — |
| SỐNG | **máy soạn:** 30 ngày sau khi lên production, dưới 30% dòng OkrDeXuat của các đơn vị bật Kara còn trangThai cho quá 7 ngày, và tỉ lệ bo-qua của góp ý gắn KR không cao hơn tỉ lệ đó của góp ý về mục tiêu quá 15 điểm. | Truy vấn bảng OkrDeXuat (trangThai, keyResultId, nac, ngày tạo, quyetLuc) chụp ngày lên production và ngày hết timebox; telemetry không có sự kiện cho góp ý. |
| CHẾT | **máy soạn:** Tỉ lệ dòng OkrDeXuat còn cho quá 7 ngày không giảm so với mốc chụp ngày lên production. | Truy vấn bảng OkrDeXuat (trangThai, keyResultId, nac, ngày tạo, quyetLuc) chụp ngày lên production và ngày hết timebox; telemetry không có sự kiện cho góp ý. |
| Timebox | đã có: 30 ngày sau khi lên production. | — |

Căn cứ: Chép lại đúng ý hai dòng «SỐNG:», «CHẾT:» chủ kho đã viết trong opportunity.md dưới nhãn rút gọn, nêu rõ bảng đọc số; khớp câu hỏi «góp ý của Kara có được quyết thay vì nằm im».

## hoan-tac-loat-bao-dung

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Khi lưu trữ hay hoàn tác hàng loạt, người dùng có hiểu đúng toast, không tưởng lỗi máy chủ là bản «bị bỏ qua» và không hoảng vì «chưa hoàn tác được» khi bản đã về, còn người vận hành có lần ra bản ghi lỗi không? | Nhật ký production (runtime log) lọc dòng lỗi của runBulk có recordId, sự kiện api_error theo route lưu trữ và khôi phục hàng loạt trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |
| SỐNG | **máy soạn:** Trong 2 tuần sau bật, mọi lô có errored lớn hơn 0 đều có dòng log lỗi kèm recordId trong nhật ký production, và trong phiên nghiệm thu ít nhất 2 trên 3 người xem toast «3 bản đã được khôi phục từ trước.» hiểu bản ghi vẫn ở danh sách mà không đi tìm lỗi. | Nhật ký production (runtime log) lọc dòng lỗi của runBulk có recordId, sự kiện api_error theo route lưu trữ và khôi phục hàng loạt trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |
| CHẾT | **máy soạn:** Có lô lỗi máy chủ mà nhật ký production không có dòng log kèm recordId, hoặc trong phiên nghiệm thu quá 1 trên 3 người hiểu toast là đã có lỗi. | Nhật ký production (runtime log) lọc dòng lỗi của runBulk có recordId, sự kiện api_error theo route lưu trữ và khôi phục hàng loạt trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Nhật ký production (runtime log) lọc dòng lỗi của runBulk có recordId, sự kiện api_error theo route lưu trữ và khôi phục hàng loạt trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |

Căn cứ: AC-1 (Logger.error kèm recordId), AC-3, AC-4 (toast tách lỗi máy chủ khỏi bị bỏ qua, «đã được khôi phục từ trước») và AC-8.

## hoan-tac-loat-dung-id — viết lại khuôn

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi lưu trữ hàng loạt rồi bấm «Hoàn tác», người dùng có nhận lại đúng những bản mình vừa cất, không đảo việc của người khác, và toast có nói thật số bản không về được bằng tiếng của họ không? | Quan sát phiên nghiệm thu với 3 người chạy ca của AC-6, đối chiếu cột archivedAt của Contact, Company, Deal, cộng phản ánh người dùng trong 2 tuần; telemetry chỉ có api_error theo route, không đo nội dung toast. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu, 3 người chạy ca có một bản người khác đã cất trước, và cả 3 lần bản đó vẫn ở «Đã lưu trữ» sau «Hoàn tác» (đối chiếu archivedAt) với toast nói đúng số đã lưu trữ và bị bỏ qua bằng chữ sản phẩm, và trong 2 tuần sau bật không có phản ánh nào về toast chứa câu lỗi máy chủ tiếng Anh. | Quan sát phiên nghiệm thu với 3 người chạy ca của AC-6, đối chiếu cột archivedAt của Contact, Company, Deal, cộng phản ánh người dùng trong 2 tuần; telemetry chỉ có api_error theo route, không đo nội dung toast. |
| CHẾT | **máy soạn:** Có một lần «Hoàn tác» khôi phục bản người khác đã cất, hoặc có toast xanh khi có bản không về được, hoặc có toast chứa câu lỗi máy chủ thô, trong phiên nghiệm thu hay qua phản ánh người dùng. | Quan sát phiên nghiệm thu với 3 người chạy ca của AC-6, đối chiếu cột archivedAt của Contact, Company, Deal, cộng phản ánh người dùng trong 2 tuần; telemetry chỉ có api_error theo route, không đo nội dung toast. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát phiên nghiệm thu với 3 người chạy ca của AC-6, đối chiếu cột archivedAt của Contact, Company, Deal, cộng phản ánh người dùng trong 2 tuần; telemetry chỉ có api_error theo route, không đo nội dung toast. |

Căn cứ: Bốn ô [đề xuất] sẵn có trong opportunity.md (giữ ý, thay timebox «1 ngày máy» bằng timebox chung) cùng AC-2, AC-3, AC-4 và AC-6.

## hoi-dap-okr

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: [đề xuất] đã đạt «Eval hỏi đáp trên bộ ca mẫu (M, N1) đạt; phép đo «người vai chỉ OKR chỉ hỏi được OKR» xanh trên production» chưa? | — |
| SỐNG | đã có: [đề xuất] Eval hỏi đáp trên bộ ca mẫu (M, N1) đạt; phép đo «người vai chỉ OKR chỉ hỏi được OKR» xanh trên production | — |
| CHẾT | đã có: [đề xuất] chưa đạt «Eval hỏi đáp trên bộ ca mẫu (M, N1) đạt; phép đo «người vai chỉ OKR chỉ hỏi được OKR» xanh trên production» khi hết timebox | — |
| Timebox | đã có: [đề xuất] 2026-10-31 (mốc R2 lên production (tạm — chốt lại bằng số đo sau ba ngày đầu của đợt r2; trước đó 20/11)) | — |

## kara-mot-ten

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Người dùng có nhận ra và gọi AI của sản phẩm bằng một tên Kara ở mọi bề mặt, thay vì lẫn «Trợ lý», «tác nhân», «máy soạn» không? | Quan sát phiên nghiệm thu với 3 người trên ba bề mặt cộng kết quả luật máy một tên AI trên CI của onehub; telemetry không đo chữ trên màn. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu, ít nhất 2 trên 3 người được hỏi «ai đã làm việc này» ở ba bề mặt (tóm tắt tuần, Soạn OKR, Tài liệu) đều trả lời là Kara, và luật máy «một tên AI» xanh trên onehub suốt timebox. | Quan sát phiên nghiệm thu với 3 người trên ba bề mặt cộng kết quả luật máy một tên AI trên CI của onehub; telemetry không đo chữ trên màn. |
| CHẾT | **máy soạn:** Dưới 2 trên 3 người gọi AI là Kara ở cả ba bề mặt, hoặc người dùng còn gặp một chuỗi gọi AI bằng tên khác trên màn thật. | Quan sát phiên nghiệm thu với 3 người trên ba bề mặt cộng kết quả luật máy một tên AI trên CI của onehub; telemetry không đo chữ trên màn. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát phiên nghiệm thu với 3 người trên ba bề mặt cộng kết quả luật máy một tên AI trên CI của onehub; telemetry không đo chữ trên màn. |

Căn cứ: AC-1 đến AC-5 (mọi bề mặt gọi AI là Kara) và AC-7 (luật máy giữ một tên).

## khung-cho-don-vi-mot-hinh

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi bật, người mở trang Theo đơn vị có còn thấy màn chờ đổi hình giữa chừng hay bấm trượt ô chọn đơn vị lúc trang đang tải không? | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, vì docs/telemetry.md chỉ gửi sự kiện phía máy chủ và không có sự kiện nào về màn chờ. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu với ít nhất 3 người mở trang Theo đơn vị bằng tải cứng và đổi đơn vị, trên máy tính và điện thoại, 0 người chỉ ra màn chờ nhảy hình hay hỏi «đang tải hay hỏng», và 0 người bấm trượt ô chọn đơn vị vì nó dịch chỗ. | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, vì docs/telemetry.md chỉ gửi sự kiện phía máy chủ và không có sự kiện nào về màn chờ. |
| CHẾT | **máy soạn:** Từ 2 người trở lên trong phiên nói màn chờ đổi hình hay giật, hoặc có người bấm trượt ô chọn đơn vị lúc đang tải, hoặc có một góp ý cùng nội dung gửi về trong timebox. | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, vì docs/telemetry.md chỉ gửi sự kiện phía máy chủ và không có sự kiện nào về màn chờ. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, vì docs/telemetry.md chỉ gửi sự kiện phía máy chủ và không có sự kiện nào về màn chờ. |

Căn cứ: AC-1 (mọi lúc tải chỉ một chữ ký khung) và AC-3 (đỉnh ô chọn đơn vị không đổi quá 1 px giữa lúc tải và lúc bảng dựng).

## khung-man-chung

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi bật, người đang chờ một màn tải hay gặp lỗi tải có luôn biết mình đang ở màn nào và tự gỡ được bằng «Thử lại» mà không phải hỏi ai không? | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, lỗi tải dựng bằng truy vấn bị giữ hay trả lỗi; sự kiện api_error của docs/telemetry.md chỉ đếm lỗi theo route, không đo người có gỡ được hay không. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu với ít nhất 3 người, mỗi người gặp ít nhất một màn đang tải và một lỗi tải dựng sẵn, ít nhất 2 trên 3 người gọi đúng tên màn lúc đang tải và tự bấm «Thử lại» để về nội dung, và 0 người hỏi vì sao một nút đầu trang bị tắt. | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, lỗi tải dựng bằng truy vấn bị giữ hay trả lỗi; sự kiện api_error của docs/telemetry.md chỉ đếm lỗi theo route, không đo người có gỡ được hay không. |
| CHẾT | **máy soạn:** Quá nửa người trong phiên không gọi được tên màn lúc đang tải hoặc không tìm ra cách thử lại khi lỗi, hoặc có người hỏi vì sao nút chính bị tắt ở Onboarding, Tổ chức hay SSO. | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, lỗi tải dựng bằng truy vấn bị giữ hay trả lỗi; sự kiện api_error của docs/telemetry.md chỉ đếm lỗi theo route, không đo người có gỡ được hay không. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, lỗi tải dựng bằng truy vấn bị giữ hay trả lỗi; sự kiện api_error của docs/telemetry.md chỉ đếm lỗi theo route, không đo người có gỡ được hay không. |

Căn cứ: Câu vấn đề «màn nào đang tải cũng giữ tiêu đề, lỗi tải một hình có nút thử lại, nút chính tắt phải nói vì sao» cùng AC-4, AC-6, AC-8, AC-9.

## khung-soan-chan-lien-ket

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi bật, người soạn OKR trong khung bên phải có còn mất chữ đang gõ hay bản Kara đang soạn vì lỡ bấm một liên kết trong khung không? | Góp ý và issue của người dùng trong timebox cộng quan sát phiên nghiệm thu N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |
| SỐNG | **máy soạn:** Trong timebox có 0 góp ý hay issue báo mất chữ gõ dở khi bấm liên kết trong khung soạn, và trong phiên nghiệm thu với ít nhất 3 người bấm «Tới Kho tài liệu» lúc đang gõ dở thì cả 3 đều thấy hộp hỏi và ai chọn ở lại đều giữ nguyên chữ. | Góp ý và issue của người dùng trong timebox cộng quan sát phiên nghiệm thu N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |
| CHẾT | **máy soạn:** Có ít nhất 1 báo mất chữ hay mất bản soạn do bấm liên kết trong khung, hoặc trong phiên quá nửa người gặp hộp hỏi khi khung không có gì dở và thấy nó cản đường. | Góp ý và issue của người dùng trong timebox cộng quan sát phiên nghiệm thu N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Góp ý và issue của người dùng trong timebox cộng quan sát phiên nghiệm thu N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |

Căn cứ: AC-1 và AC-2 (bấm liên kết khi có thứ dở thì hỏi, ở lại giữ chữ) và AC-4 (không có gì dở thì đi ngay, không hỏi).

## lich-su-va-luu-tru-trang

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi bật, người dùng Kho tài liệu có thật sự quay lại bản cũ và lưu trữ trang không còn dùng qua duyệt, thay vì để trang cũ nằm lẫn trong danh sách không? | Truy vấn production bảng TaiLieuDeXuat theo loai và trangThai cùng bảng TaiLieuSuKien loại khôi phục và lưu trữ (mốc luc); docs/telemetry.md không có thuộc tính nào cho Kho tài liệu. |
| SỐNG | **máy soạn:** Trong timebox, bảng TaiLieuDeXuat có ít nhất 3 đề xuất loại lưu trữ hoặc quay lại phiên bản cũ đã được duyệt, và không quá 1 trang đã lưu trữ bị khôi phục trong vòng 7 ngày vì lưu trữ nhầm. | Truy vấn production bảng TaiLieuDeXuat theo loai và trangThai cùng bảng TaiLieuSuKien loại khôi phục và lưu trữ (mốc luc); docs/telemetry.md không có thuộc tính nào cho Kho tài liệu. |
| CHẾT | **máy soạn:** Hết timebox mà TaiLieuDeXuat có 0 đề xuất lưu trữ và 0 đề xuất quay lại bản cũ được duyệt, hoặc quá nửa số trang đã lưu trữ bị khôi phục trong vòng 7 ngày. | Truy vấn production bảng TaiLieuDeXuat theo loai và trangThai cùng bảng TaiLieuSuKien loại khôi phục và lưu trữ (mốc luc); docs/telemetry.md không có thuộc tính nào cho Kho tài liệu. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Truy vấn production bảng TaiLieuDeXuat theo loai và trangThai cùng bảng TaiLieuSuKien loại khôi phục và lưu trữ (mốc luc); docs/telemetry.md không có thuộc tính nào cho Kho tài liệu. |

Căn cứ: Ô cơ hội «xem phiên bản cũ, khôi phục bản cũ qua duyệt, lưu trữ trang không còn dùng» cùng AC-3, AC-4, AC-5, AC-6.

## lien-quan-loc-ban-da-cat

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi bật, người xem ngăn công ty, cá nhân hay thoả thuận có đọc đúng số bản đang dùng và vẫn tự tìm lại được bản đã lưu trữ từ ngăn không? | Nhật ký vấp theo khuôn stranger-drive-template trong phiên nghiệm thu với N ít nhất 3 người, đúng đường đo thứ hai hợp đồng đã khai. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu với ít nhất 3 người, ít nhất 2 trên 3 người tìm lại một thoả thuận đã lưu trữ từ ngăn công ty qua «+n đã lưu trữ» trong 1 phút không cần gợi ý, và 0 người hiểu «+n đã lưu trữ» là nút lưu trữ hay đọc số trên tab mà tính cả bản đã cất. | Nhật ký vấp theo khuôn stranger-drive-template trong phiên nghiệm thu với N ít nhất 3 người, đúng đường đo thứ hai hợp đồng đã khai. |
| CHẾT | **máy soạn:** Quá nửa người không tìm ra bản đã cất từ ngăn hoặc hiểu «+n đã lưu trữ» là nút để lưu trữ, hoặc có báo số trên tab hay số liệu đầu ngăn công ty lệch số bản đang dùng. | Nhật ký vấp theo khuôn stranger-drive-template trong phiên nghiệm thu với N ít nhất 3 người, đúng đường đo thứ hai hợp đồng đã khai. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Nhật ký vấp theo khuôn stranger-drive-template trong phiên nghiệm thu với N ít nhất 3 người, đúng đường đo thứ hai hợp đồng đã khai. |

Căn cứ: Mục Đường đo «người lạ tìm lại một thoả thuận đã cất từ ngăn công ty» cùng AC-5, AC-7 và AC-13.

## lo-trinh-nhieu-san-pham

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: [đề xuất] đã đạt «Kho thứ hai (OneHub Platform hoặc kho kit) hiện đủ trên trang trong ngày cài, và người không có quyền với sản phẩm đó không thấy nó (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa? | — |
| SỐNG | đã có: [đề xuất] Kho thứ hai (OneHub Platform hoặc kho kit) hiện đủ trên trang trong ngày cài, và người không có quyền với sản phẩm đó không thấy nó (ngưỡng đề xuất — chốt ở Cổng Đáng) | — |
| CHẾT | đã có: [đề xuất] chưa đạt «Kho thứ hai (OneHub Platform hoặc kho kit) hiện đủ trên trang trong ngày cài, và người không có quyền với sản phẩm đó không thấy nó (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox | — |
| Timebox | đã có: [đề xuất] 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33) | — |

## lo-trinh-ten-va-build — viết lại khuôn

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi gộp, người đọc trang lộ trình có thấy đúng tên OneHub Center và các dãy có còn bị chặn đẩy vì bản dựng panic symlink không? | Nhật ký job CI đọc bằng gh run list và gh run view lọc chuỗi «infinite loop», cộng đầu ra của _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs; không có telemetry. |
| SỐNG | **máy soạn:** Trong timebox có 0 lượt CI hay pre-push trên onehub và trên PR mở đỏ với dòng «symlink … infinite loop» của next build, và phép quét tên OneHub Center giữ 0 SAI ở mọi lượt chạy. | Nhật ký job CI đọc bằng gh run list và gh run view lọc chuỗi «infinite loop», cộng đầu ra của _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs; không có telemetry. |
| CHẾT | **máy soạn:** Có ít nhất 1 lượt CI hay pre-push đỏ với dòng panic «infinite loop» của next build, hoặc trang lộ trình lại hiện chữ «CRM» cho người đọc. | Nhật ký job CI đọc bằng gh run list và gh run view lọc chuỗi «infinite loop», cộng đầu ra của _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs; không có telemetry. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Nhật ký job CI đọc bằng gh run list và gh run view lọc chuỗi «infinite loop», cộng đầu ra của _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs; không có telemetry. |

Căn cứ: AC-1 (quét tên 0 SAI), AC-2 (bản dựng xanh khi có symlink vòng) và dòng ngưỡng sẵn có «bốn PR bị chặn đẩy được».

## loc-don-vi-khong-tu-dong — HỎI

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi bật, người lọc mục tiêu ở trang Theo đơn vị có chọn liền nhiều giá trị lọc mà không phải mở lại menu hay khung Lọc không? | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; hợp đồng đã bỏ đường đo và telemetry không có sự kiện lọc. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu với ít nhất 3 người, mỗi người lọc theo hai giá trị liên tiếp ở máy tính và ở điện thoại, ít nhất 2 trên 3 người làm xong mà không phải mở lại menu Lọc lần nào, và 0 người nói bảng nháy hay biến mất khi đổi lọc. | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; hợp đồng đã bỏ đường đo và telemetry không có sự kiện lọc. |
| CHẾT | **máy soạn:** Quá nửa người phải mở lại menu hay khung Lọc sau mỗi lần chọn, hoặc có người nói bảng biến mất hay nháy khi đổi lọc. | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; hợp đồng đã bỏ đường đo và telemetry không có sự kiện lọc. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; hợp đồng đã bỏ đường đo và telemetry không có sự kiện lọc. |

Căn cứ: AC-1 và AC-2 (menu và khung Lọc không đóng từ lúc tích tới khi dòng mới hiện) cùng AC-3 (bảng không bị gỡ khi đổi lọc).

## loc-moi-truong

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi bật, nhân viên quan hệ đối tác có thật sự lọc theo trường chữ, số, ngày, ô tích hay ô trống và lưu bộ lọc ấy ở Thoả thuận không? | Truy vấn production bảng SavedView theo cột entity và nội dung cột filters, cộng quan sát phiên nghiệm thu; docs/telemetry.md không có thuộc tính nào về lọc. |
| SỐNG | **máy soạn:** Trong timebox, bảng SavedView có ít nhất 2 bộ lọc đã lưu của Thoả thuận, và ít nhất 1 bộ lọc đã lưu ở bất kỳ loại bản ghi nào mang giá trị lọc kiểu mới (has:, gte:, lte:, none, yes, no hay một mốc ngày). | Truy vấn production bảng SavedView theo cột entity và nội dung cột filters, cộng quan sát phiên nghiệm thu; docs/telemetry.md không có thuộc tính nào về lọc. |
| CHẾT | **máy soạn:** Hết timebox mà SavedView có 0 bộ lọc đã lưu của Thoả thuận và 0 bộ lọc mang giá trị kiểu mới, hoặc trong phiên nghiệm thu quá nửa người không đặt được lọc «trống» hay lọc khoảng số. | Truy vấn production bảng SavedView theo cột entity và nội dung cột filters, cộng quan sát phiên nghiệm thu; docs/telemetry.md không có thuộc tính nào về lọc. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Truy vấn production bảng SavedView theo cột entity và nội dung cột filters, cộng quan sát phiên nghiệm thu; docs/telemetry.md không có thuộc tính nào về lọc. |

Căn cứ: Câu vấn đề «lọc theo trường chữ, số, ngày, ô tích hay ô trống, và lưu bộ lọc ấy cho cả Thoả thuận» cùng AC-1, AC-2, AC-3.

## loc-va-kieu-xem-chung

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi bật, đường dẫn danh sách có bộ lọc gửi cho đồng nghiệp có mở ra đúng bộ lọc và kiểu xem, và người dùng có lọc được ở danh sách thứ hai mà không phải học lại không? | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu với ít nhất 3 người, mỗi người gửi cho người khác một đường dẫn có bộ lọc ở Thoả thuận, Onboarding hoặc Tài liệu, ít nhất 2 trên 3 đường dẫn mở ra đúng bộ lọc và kiểu xem, và ít nhất 2 trên 3 người lọc được ở màn thứ hai không cần hướng dẫn. | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |
| CHẾT | **máy soạn:** Có ít nhất 1 đường dẫn gửi đi mở ra sai bộ lọc hay sai kiểu xem, hoặc quá nửa người phải hỏi cách lọc ở màn thứ hai. | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |

Căn cứ: Câu vấn đề «lọc và chuyển kiểu xem ở mọi danh sách như nhau, gửi đường dẫn là giữ nguyên bộ lọc» cùng AC-6 và AC-7.

## luu-tru-truong-khong-hoi

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi bật, quản trị lưu trữ một trường có hiểu trường chỉ được cất và tự lấy lại được bằng «Hoàn tác» khi lỡ tay, không cần hộp hỏi lại không? | Quan sát trong phiên nghiệm thu với N ít nhất 3 người cộng góp ý của người dùng trong timebox; telemetry không có sự kiện về trường. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu với ít nhất 3 người quản trị lưu trữ một trường rồi lấy lại, ít nhất 2 trên 3 người tự bấm «Hoàn tác» không cần gợi ý và nói trường được cất chứ không bị xoá, và trong timebox có 0 báo mất trường vì lưu trữ nhầm. | Quan sát trong phiên nghiệm thu với N ít nhất 3 người cộng góp ý của người dùng trong timebox; telemetry không có sự kiện về trường. |
| CHẾT | **máy soạn:** Quá nửa người trong phiên nghĩ trường đã bị xoá hoặc không thấy «Hoàn tác», hoặc có ít nhất 1 báo mất trường không lấy lại được. | Quan sát trong phiên nghiệm thu với N ít nhất 3 người cộng góp ý của người dùng trong timebox; telemetry không có sự kiện về trường. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát trong phiên nghiệm thu với N ít nhất 3 người cộng góp ý của người dùng trong timebox; telemetry không có sự kiện về trường. |

Căn cứ: Ô cơ hội «lưu trữ một trường thôi hỏi lại và có Hoàn tác» cùng AC-1, AC-3 và AC-8.

## mau-trang-thai-chung

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi bật, người dùng nhìn một chấm trạng thái ở OKR, Kara, lịch họp hay Tài liệu có đoán đúng nghĩa của nó như nhau ở mọi khu không? | Chấm kín trong phiên nghiệm thu với N ít nhất 3 người; không có telemetry nào đo cách đọc màu. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu chấm kín với ít nhất 3 người xem 6 chấm trạng thái lấy từ ít nhất 3 khu khác nhau, mỗi người gọi đúng nghĩa ít nhất 5 trên 6 chấm, và không ai đọc chấm «đang chạy» thành lỗi hay rủi ro. | Chấm kín trong phiên nghiệm thu với N ít nhất 3 người; không có telemetry nào đo cách đọc màu. |
| CHẾT | **máy soạn:** Có người gọi đúng dưới 4 trên 6 chấm, hoặc từ 2 người trở lên hiểu cùng một màu thành hai nghĩa khác nhau ở hai khu. | Chấm kín trong phiên nghiệm thu với N ít nhất 3 người; không có telemetry nào đo cách đọc màu. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Chấm kín trong phiên nghiệm thu với N ít nhất 3 người; không có telemetry nào đo cách đọc màu. |

Căn cứ: Câu vấn đề «cùng một nghĩa mang cùng một màu ở OKR, Kara, lịch họp và Tài liệu» cùng AC-3 và AC-6.

## nen-kara — viết lại khuôn

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi có nền, các lượt AI kế tiếp có dựng đề xuất, dấu và phản hồi của Kara bằng thành phần chung của packages/ui, để người dùng thấy AI cùng một kiểu ở mọi màn không? | Đếm bằng git grep trong apps/app chỗ dùng thành phần chung so với chỗ tự dựng, đếm kiểu dấu trên màn thật theo khảo sát mục 1–2, cộng quan sát phiên nghiệm thu N ít nhất 3 người. |
| SỐNG | **máy soạn:** Tới hết timebox, mọi lượt AI gộp sau nen-kara dựng đề xuất, dấu và phản hồi bằng ProposedChange, KaraMark, KaraLabel, AiFeedback chứ không tự dựng, số kiểu dấu nhận diện AI trên màn thật giảm từ bốn xuống tối đa hai, và trong phiên nghiệm thu ít nhất 2 trên 3 người chỉ đúng nút chính của một đề xuất inline. | Đếm bằng git grep trong apps/app chỗ dùng thành phần chung so với chỗ tự dựng, đếm kiểu dấu trên màn thật theo khảo sát mục 1–2, cộng quan sát phiên nghiệm thu N ít nhất 3 người. |
| CHẾT | **máy soạn:** Có ít nhất 1 lượt AI gộp sau nen-kara tự dựng thẻ đề xuất hay dấu Kara riêng ngoài packages/ui, hoặc số kiểu dấu nhận diện AI trên màn thật vẫn là bốn. | Đếm bằng git grep trong apps/app chỗ dùng thành phần chung so với chỗ tự dựng, đếm kiểu dấu trên màn thật theo khảo sát mục 1–2, cộng quan sát phiên nghiệm thu N ít nhất 3 người. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Đếm bằng git grep trong apps/app chỗ dùng thành phần chung so với chỗ tự dựng, đếm kiểu dấu trên màn thật theo khảo sát mục 1–2, cộng quan sát phiên nghiệm thu N ít nhất 3 người. |

Căn cứ: Vấn đề «12 bề mặt AI, bảy tên, bốn dấu nhận diện; mỗi lượt AI mới tự dựng một kiểu vì packages/ui chưa có thứ để dùng» cùng AC-1, AC-5 và AC-12.

## ngan-ban-ghi-giu-danh-tinh

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Người dùng mở và đóng ngăn bản ghi trong việc hằng ngày có thấy ngăn trượt ra vào liền mạch, không biến mất, không chớp, không trễ, mà dữ liệu trong ngăn vẫn đúng ngay khi mở không? | Quan sát trong phiên nghiệm thu với N=5 người (ghi lại lời người thử và số lần ngăn mở trống); telemetry không có sự kiện phía trình duyệt cho ngăn nên không có số máy. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu chung với ít nhất 5 người, mỗi người mở rồi đóng ngăn ít nhất 5 lần trên Thoả thuận và Mục tiêu ở cả máy tính lẫn điện thoại, 0 người nói ngăn «biến mất», «chớp» hay «mở chậm», và 0 lần ngăn vừa mở hiện ô trống hay số cũ phải tải lại mới đúng. | Quan sát trong phiên nghiệm thu với N=5 người (ghi lại lời người thử và số lần ngăn mở trống); telemetry không có sự kiện phía trình duyệt cho ngăn nên không có số máy. |
| CHẾT | **máy soạn:** Có từ 2 trên 5 người trở lên tự nêu ngăn biến mất, chớp hay chậm khi mở đóng, hoặc có ít nhất 1 lần ngăn vừa mở hiện dữ liệu trống hay cũ phải tải lại mới đúng. | Quan sát trong phiên nghiệm thu với N=5 người (ghi lại lời người thử và số lần ngăn mở trống); telemetry không có sự kiện phía trình duyệt cho ngăn nên không có số máy. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát trong phiên nghiệm thu với N=5 người (ghi lại lời người thử và số lần ngăn mở trống); telemetry không có sự kiện phía trình duyệt cho ngăn nên không có số máy. |

Căn cứ: AC-3, AC-4 (ngăn trượt ra vào, vào trong 150 ms, không bị gỡ) và AC-6, AC-7 (đọc được dữ liệu ngay lượt vẽ đầu, không bị bản cũ đè).

## nhap-truong-luc-tao

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: nhân viên quan hệ đối tác có tạo xong một công ty, cá nhân hay thoả thuận với đủ các trường đội cần trong một lượt, không phải mở lại phiếu để điền tiếp không. | — |
| SỐNG | đã có: [đề xuất] ở phiên nghiệm thu, giao năm nhân viên ba việc — tạo một thoả thuận có trường tự tạo bắt buộc, thêm nhanh một cá nhân từ phiếu công ty, tạo một công ty có trường tự tạo kiểu Chọn — thì ít nhất bốn trên năm người làm xong cả ba mà không mở lại phiếu để điền trường; và trong 14 ngày đầu sau khi lên production, ít nhất 80% bản ghi người tạo (`source = MANUAL`) có giá trị cho mọi trường tự tạo đang hiện trên phiếu ngay lượt tạo. | — |
| CHẾT | đã có: [đề xuất] đa số người vẫn tạo xong rồi mở phiếu điền từng ô, hoặc bỏ dở lượt tạo vì form chặn ở một trường họ chưa có giá trị. | — |
| Timebox | đã có: [đề xuất] phiên nghiệm thu đầu tiên sau khi DA16 lên production, gộp chung buổi đọc số của gói truong-hop-dong. | — |

## okr-cua-toi-tach-theo-doi — viết lại khuôn

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: người mở «Của tôi» có còn thấy OKR không phải của mình lẫn trong danh sách chính không, và khi cần thì có tìm được mục mình đang theo dõi không? | — |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu với 5 người dùng OKR có theo dõi mục tiêu của đơn vị khác, ít nhất 4 trên 5 người chỉ đúng đâu là mục tiêu của mình và tự tìm được mục đang theo dõi qua «Đang theo dõi» khi được hỏi, và có 0 báo cáo «thấy OKR người khác trong Của tôi» trong 2 tuần sau khi bật. | Quan sát trong phiên nghiệm thu với N=5 người cộng số báo cáo người dùng gửi trong 2 tuần sau khi bật; telemetry không có sự kiện cho tab Của tôi. |
| CHẾT | **máy soạn:** Có ít nhất 1 báo cáo thấy OKR không phải của mình lẫn trong danh sách chính của «Của tôi», hoặc từ 2 trên 5 người trở lên không tìm được mục mình đang theo dõi trong phiên nghiệm thu. | Quan sát trong phiên nghiệm thu với N=5 người cộng số báo cáo người dùng gửi trong 2 tuần sau khi bật; telemetry không có sự kiện cho tab Của tôi. |
| Timebox | đã có: một vòng feature-loop T2 (đã giao 07/10). Đo trong 2 tuần sau khi giao. | — |

Căn cứ: Gộp lại ba gạch SỐNG và hai gạch CHẾT anh đã duyệt 08/10 trong opportunity.md thành một câu mỗi ô, dựa trên AC-5 (bảng chính chỉ có mục tiêu của U, «Đang theo dõi (n)» tách riêng).

## okr-loai-hoc-tap — viết lại khuôn

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: đơn vị có dùng loại «Học tập» đúng chỗ, cho mục tiêu kiểm giả thuyết, và có ghi được điều học được khi đóng kỳ không? | — |
| SỐNG | **máy soạn:** Khi kỳ OKR kế đóng, truy vấn bảng mục tiêu cho thấy có ít nhất 1 mục tiêu loại hoc-tap đã công bố, 100% mục tiêu học tập đã công bố có «Điều học được», và có 0 báo cáo nhãn «Trượt» trên mục tiêu học tập. | Truy vấn bảng mục tiêu theo loại hoc-tap và ô Điều học được lúc kỳ kế đóng, cộng báo cáo của người duyệt và câu hỏi Kara bắt được; telemetry không có sự kiện cho loại mục tiêu. |
| CHẾT | **máy soạn:** Hết kỳ OKR kế mà truy vấn bảng mục tiêu ra 0 mục tiêu học tập đã công bố, hoặc người duyệt hay Kara ghi nhận ít nhất 2 mục tiêu chọn «Học tập» để né «Trượt» cho một việc thực chất là cam kết. | Truy vấn bảng mục tiêu theo loại hoc-tap và ô Điều học được lúc kỳ kế đóng, cộng báo cáo của người duyệt và câu hỏi Kara bắt được; telemetry không có sự kiện cho loại mục tiêu. |
| Timebox | đã có: một vòng feature-loop T2 (đã giao 08/10). Đo ở kỳ OKR kế. | — |

Căn cứ: Gộp ba gạch SỐNG và hai gạch CHẾT anh đã duyệt 08/10 thành một câu mỗi ô, dựa trên AC-2 (giữa kỳ đọc như tham vọng, không Trượt) và AC-4, AC-5 (không đóng kỳ khi còn mục tiêu học tập đã công bố chưa ghi điều học được).

## quyet-gop-y-noi-dung-ly-do — viết lại khuôn

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: người quyết một góp ý bị từ chối vì lý do cố định có kể lại đúng lý do không. | — |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu với ít nhất 3 người, mỗi người quyết một Căn chỉnh tới đích chưa công bố, cả 3 người tự nói được lý do «đích chưa công bố» và không ai bấm thử lại quá một lần. | Quan sát trong phiên nghiệm thu với N=3 người (đếm số lần bấm thử lại và ghi nguyên lời người thử kể lý do); telemetry không có sự kiện cho việc quyết góp ý. |
| CHẾT | **máy soạn:** Có ít nhất 1 người trong phiên nghiệm thu bấm thử lại từ hai lần trở lên hoặc gọi lỗi đó là «lỗi mạng» hay «thử lại sau». | Quan sát trong phiên nghiệm thu với N=3 người (đếm số lần bấm thử lại và ghi nguyên lời người thử kể lý do); telemetry không có sự kiện cho việc quyết góp ý. |
| Timebox | đã có: lái-thử người-lạ kế tiếp của dãy Kara OKR. | — |

Căn cứ: Câu SỐNG và CHẾT sẵn có trong opportunity.md (nhãn «SỐNG:» và «CHẾT:» chưa đúng khuôn), thêm số người, dựa trên AC-3 (dòng lỗi dưới góp ý là câu lý do của mã) và Thước đo thành công «mỗi lý do cố định hiện đúng câu lý do».

## soan-okr-khong-lac

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: [đề xuất] trưởng phòng soạn OKR có còn bị lạc chỗ (nhảy tab, tưởng đã hoàn tác, tưởng Kara đã nộp) không. | — |
| SỐNG | đã có: [đề xuất] ở lái-thử người-lạ trước R1, kịch bản chủ động gây đủ ba điều kiện (mở/đóng bản ghi ở 390 px, tắt mạng trước khi hoàn tác nhóm, một cuộc mà lần nộp kế bị từ chối); 0 lần vấp «nhảy tab», «tưởng đã hoàn tác» hay «mốc không có thật». Loại nào không gây được điều kiện thì không tính. | — |
| CHẾT | đã có: [đề xuất] ≥ 1 lần vấp cùng loại ở cả hai người thử. Một người vấp một lần là vùng giữa — iterate. | — |
| Timebox | đã có: [đề xuất] lái-thử người-lạ kế tiếp của dãy Kara OKR. | — |

## sort-moi-truong

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: người dùng thật có sắp được danh sách theo một trường tự tạo khi cần, và có còn thấy trường tự tạo biến mất ở khổ hẹp hay trên thẻ Kanban không. | — |
| SỐNG | đã có: [đề xuất] ở phiên nghiệm thu, giao «sắp thoả thuận theo một trường tự tạo kiểu Ngày» và «tìm giá trị trường tự tạo trên thẻ Kanban»: ít nhất bốn trên năm người làm được không cần hỏi; trên điện thoại cột trường tự tạo hiện như cột chuẩn cùng kiểu. | — |
| CHẾT | đã có: [đề xuất] đa số người không tìm ra cách sắp theo trường tự tạo, hoặc bấm sắp mà thứ tự không đổi. | — |
| Timebox | đã có: [đề xuất] gộp chung buổi đọc số của gói truong-hop-dong sau khi DA17, DA18 lên production. | — |

## sua-sau-chay-that

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi bật, người viết và người duyệt Kho tài liệu có hết vấp các hạn chế đã gom (số bản chờ sai, ô chọn rỗng khi tải lỗi, mục lục lỗi ký tự, liên kết http lọt, câu tiếng Việt trên giao diện tiếng Anh) mà trợ lý kho vẫn trả lời đúng không kém trước không? | Quan sát trong phiên nghiệm thu với N=3 người đối chiếu bảng G1–G12 của design.md, cộng bảng kết quả do-bo-mau.ts so với _acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu với ít nhất 3 người viết hoặc duyệt trang Kho tài liệu, 0 người vấp lại mục nào trong G1–G12, và đo lại bộ 50 câu hỏi mẫu bằng do-bo-mau.ts trên bản đã bật không có câu đạt nào thành không đạt so với lượt đo đã ký (câu lỗi gọi model tách riêng). | Quan sát trong phiên nghiệm thu với N=3 người đối chiếu bảng G1–G12 của design.md, cộng bảng kết quả do-bo-mau.ts so với _acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md. |
| CHẾT | **máy soạn:** Có từ 2 người trở lên vấp lại cùng một mục trong G1–G12, hoặc bộ 50 câu hỏi mẫu có từ 2 câu trở lên chuyển từ đạt sang không đạt so với lượt đo đã ký (không kể câu lỗi gọi model). | Quan sát trong phiên nghiệm thu với N=3 người đối chiếu bảng G1–G12 của design.md, cộng bảng kết quả do-bo-mau.ts so với _acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát trong phiên nghiệm thu với N=3 người đối chiếu bảng G1–G12 của design.md, cộng bảng kết quả do-bo-mau.ts so với _acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md. |

Căn cứ: Context (danh sách góp ý là các hạn chế còn mở của tám hồ sơ Kho, đo lại trên bộ câu hỏi mẫu sau khi sửa) và AC-2, AC-3, AC-5, AC-6, AC-7, AC-9, AC-13.

## tac-nhan-va

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Người dùng mở màn tác nhân trên điện thoại có đọc được trạng thái và kết quả lượt chạy bằng tiếng Việt, và bộ dựng tác nhân có hỏi lại đúng lúc thay vì đứng im chờ một câu không ai được hỏi không? | Quan sát trong phiên nghiệm thu với N=3 người ở khổ 375 px, cộng truy vấn bảng hội thoại dựng đối chiếu câu hỏi đang chờ của phiên con với pendingQuestion của conversations.builderById; telemetry chỉ có sessions_failed và agent_error, không tách được ca treo im lặng. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu với ít nhất 3 người dựng hoặc xem tác nhân ở khổ điện thoại, 0 người gặp chữ máy tiếng Anh hay phải cuộn ngang, và trong 2 tuần sau khi bật truy vấn hội thoại dựng cho 0 hội thoại có phiên con đang chờ trả lời mà pendingQuestion rỗng. | Quan sát trong phiên nghiệm thu với N=3 người ở khổ 375 px, cộng truy vấn bảng hội thoại dựng đối chiếu câu hỏi đang chờ của phiên con với pendingQuestion của conversations.builderById; telemetry chỉ có sessions_failed và agent_error, không tách được ca treo im lặng. |
| CHẾT | **máy soạn:** Có ít nhất 1 hội thoại dựng thật treo im lặng vì câu hỏi lượt sau bị bỏ (phiên con chờ mà màn mở ô soạn), hoặc từ 2 người trở lên trong phiên nghiệm thu không đọc được kết quả lượt chạy trên điện thoại. | Quan sát trong phiên nghiệm thu với N=3 người ở khổ 375 px, cộng truy vấn bảng hội thoại dựng đối chiếu câu hỏi đang chờ của phiên con với pendingQuestion của conversations.builderById; telemetry chỉ có sessions_failed và agent_error, không tách được ca treo im lặng. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát trong phiên nghiệm thu với N=3 người ở khổ 375 px, cộng truy vấn bảng hội thoại dựng đối chiếu câu hỏi đang chờ của phiên con với pendingQuestion của conversations.builderById; telemetry chỉ có sessions_failed và agent_error, không tách được ca treo im lặng. |

Căn cứ: Câu giao của hàng E5 trong Context («đọc được trên điện thoại, trạng thái tiếng Việt, bộ dựng không treo im lặng») cùng AC-1, AC-2, AC-4 và AC-5, AC-9.

## the-gop-y-okr — viết lại khuôn

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: người lạ có quyết được ba đề xuất mà không lúng túng không? | — |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu với ít nhất 3 người chưa làm vòng này, mỗi người quyết đủ ba đề xuất của Kara trong hộp sửa mục tiêu và KR trong một lượt mà không hỏi «bấm nút nào», và hộp đóng ngoài ý 0 lần. | Quan sát trong phiên nghiệm thu với N=3 người lạ (đếm lần hỏi nút, lần bấm nhầm, lần hộp đóng ngoài ý); telemetry không có sự kiện cho thẻ góp ý. |
| CHẾT | **máy soạn:** Có ít nhất 1 người bấm nhầm «Bác» thay «Nhận», hoặc hộp đóng ngoài ý ít nhất 1 lần, hoặc từ 2 trên 3 người trở lên phải hỏi nút nào là nút chính. | Quan sát trong phiên nghiệm thu với N=3 người lạ (đếm lần hỏi nút, lần bấm nhầm, lần hộp đóng ngoài ý); telemetry không có sự kiện cho thẻ góp ý. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát trong phiên nghiệm thu với N=3 người lạ (đếm lần hỏi nút, lần bấm nhầm, lần hộp đóng ngoài ý); telemetry không có sự kiện cho thẻ góp ý. |

Căn cứ: Câu hỏi đã có trong opportunity.md cùng ba gạch «[đề xuất]» SỐNG, CHẾT, Timebox của nó, dựa trên AC-5 (một nút tô màu duy nhất), AC-8 (bấm trong cột không đóng hộp) và AC-14 (người không làm lượt chỉ ra ngay nút chính).

## them-buoc-bao-dung

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Người lập và theo dõi kế hoạch có biết vì sao không thêm được bước khi danh sách phòng ban tải lỗi, và có tin con số việc quá hạn trên Tổng quan khớp với danh sách bước của mình không? | Quan sát trong phiên nghiệm thu với N=3 người, cộng sự kiện api_error (route, status_code) có thật trong docs/telemetry.md để biết ngày danh sách phòng ban tải lỗi, đối chiếu báo cáo người dùng. |
| SỐNG | **máy soạn:** Trong phiên nghiệm thu với ít nhất 3 người quản lý kế hoạch, cả 3 xác nhận số «việc quá hạn» ở Tổng quan khớp danh sách bước của mình, và trong 2 tuần sau khi bật có 0 báo cáo «form thêm bước trống không biết vì sao» kể cả ngày có sự kiện api_error route /trpc/onboarding.listDepartments. | Quan sát trong phiên nghiệm thu với N=3 người, cộng sự kiện api_error (route, status_code) có thật trong docs/telemetry.md để biết ngày danh sách phòng ban tải lỗi, đối chiếu báo cáo người dùng. |
| CHẾT | **máy soạn:** Có ít nhất 1 người chỉ ra số việc quá hạn ở Tổng quan lệch danh sách bước, hoặc có báo cáo form thêm bước trống không lý do trong ngày có api_error route /trpc/onboarding.listDepartments. | Quan sát trong phiên nghiệm thu với N=3 người, cộng sự kiện api_error (route, status_code) có thật trong docs/telemetry.md để biết ngày danh sách phòng ban tải lỗi, đối chiếu báo cáo người dùng. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Quan sát trong phiên nghiệm thu với N=3 người, cộng sự kiện api_error (route, status_code) có thật trong docs/telemetry.md để biết ngày danh sách phòng ban tải lỗi, đối chiếu báo cáo người dùng. |

Căn cứ: AC-3, AC-4 (vùng lỗi kèm thử lại thay ô chọn trống) và AC-6, AC-7, AC-9 (số quá hạn trên Tổng quan đếm theo ngày Việt Nam như máy chủ).

## thong-bao-mot-nguon-nhieu-kenh

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: đã đạt «Mọi thông báo đi qua Zalo trong hai tuần đều có bản tương ứng trong chuông; hành vi Zalo hiện có không đổi» chưa? (chốt bởi Manh Phan 2026-10-24) | — |
| SỐNG | đã có: Mọi thông báo đi qua Zalo trong hai tuần đều có bản tương ứng trong chuông; hành vi Zalo hiện có không đổi | — |
| CHẾT | đã có: chưa đạt «Mọi thông báo đi qua Zalo trong hai tuần đều có bản tương ứng trong chuông; hành vi Zalo hiện có không đổi» khi hết timebox | — |
| Timebox | đã có: [đề xuất] 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33) | — |

## tieu-diem-sau-hop-xoa-tin-hieu

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: [đề xuất] đã đạt «Trên production, bấm «Giữ lại» và ca xoá hỏng đều trả tiêu điểm về đúng nút ⋮ của dòng đó, đo bằng bàn phím ở 375 và 1280px (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa? | — |
| SỐNG | đã có: [đề xuất] Trên production, bấm «Giữ lại» và ca xoá hỏng đều trả tiêu điểm về đúng nút ⋮ của dòng đó, đo bằng bàn phím ở 375 và 1280px (ngưỡng đề xuất — chốt ở Cổng Đáng) | — |
| CHẾT | đã có: [đề xuất] chưa đạt «Trên production, bấm «Giữ lại» và ca xoá hỏng đều trả tiêu điểm về đúng nút ⋮ của dòng đó, đo bằng bàn phím ở 375 và 1280px (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox | — |
| Timebox | đã có: [đề xuất] 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33) | — |

## trang-lo-trinh-mo-hinh-hien-thi

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Người xem trang Lộ trình trong CRM có thấy cùng một bức tranh mốc, việc chưa hẹn mốc và tên việc như LO-TRINH.html, đủ để không phải mở tệp kia ra đối chiếu không? | Đối chiếu tay hoặc bằng ca đối chiếu của AC-5 giữa trang production và khối dữ liệu của LO-TRINH.html sau mỗi lần vẽ lại, cộng quan sát trong phiên nghiệm thu với N=3 người. |
| SỐNG | **máy soạn:** Trong 2 tuần sau khi bật, mỗi lần LO-TRINH.html được vẽ lại sau một lần gộp, đối chiếu kiểu xem «Mốc» trên production cho 0 lệch về tập mốc, việc dưới mốc, tên hiển thị và nhóm «Chưa hẹn mốc», và ít nhất 2 trên 3 người xem trong phiên nghiệm thu trả lời đúng «mốc kế còn bao nhiêu việc» chỉ từ trang CRM. | Đối chiếu tay hoặc bằng ca đối chiếu của AC-5 giữa trang production và khối dữ liệu của LO-TRINH.html sau mỗi lần vẽ lại, cộng quan sát trong phiên nghiệm thu với N=3 người. |
| CHẾT | **máy soạn:** Có ít nhất 1 lần trang CRM và LO-TRINH.html nói khác nhau về mốc hay việc của cùng một lộ trình, hoặc cờ «khối chưa mang mô hình hiển thị» hay hộp «Trang có thể thiếu một phần» còn hiện trên production. | Đối chiếu tay hoặc bằng ca đối chiếu của AC-5 giữa trang production và khối dữ liệu của LO-TRINH.html sau mỗi lần vẽ lại, cộng quan sát trong phiên nghiệm thu với N=3 người. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Đối chiếu tay hoặc bằng ca đối chiếu của AC-5 giữa trang production và khối dữ liệu của LO-TRINH.html sau mỗi lần vẽ lại, cộng quan sát trong phiên nghiệm thu với N=3 người. |

Căn cứ: Context («để trang CRM và LO-TRINH.html không bao giờ nói hai điều khác nhau về cùng một lộ trình») và AC-2, AC-5 (dòng số và tập hiển thị khớp khối thật, không hộp «Trang có thể thiếu một phần»).

## trang-thai-tin-hieu-song

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: [đề xuất] đã đạt «Một tháng sau khi giao, người gửi nhận thông báo cho mọi lần tín hiệu đổi chỗ trong vòng một ngày (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa? | — |
| SỐNG | đã có: [đề xuất] Một tháng sau khi giao, người gửi nhận thông báo cho mọi lần tín hiệu đổi chỗ trong vòng một ngày (ngưỡng đề xuất — chốt ở Cổng Đáng) | — |
| CHẾT | đã có: [đề xuất] chưa đạt «Một tháng sau khi giao, người gửi nhận thông báo cho mọi lần tín hiệu đổi chỗ trong vòng một ngày (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox | — |
| Timebox | đã có: [đề xuất] 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33) | — |

## truong-chuan-o-cai-dat

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: quản trị có tự sắp được phiếu theo cách đội mình đọc (đổi chỗ, ẩn trường chuẩn, bắt buộc một trường) mà không phải hỏi người dựng không, và danh sách ở Cài đặt có khớp đúng phiếu không. | — |
| SỐNG | đã có: [đề xuất] ở phiên nghiệm thu, giao quản trị ba việc — đưa một trường tự tạo lên trên Ngày chốt, ẩn một trường chuẩn, bắt buộc một trường — thì ít nhất bốn trên năm người làm xong cả ba không cần trợ giúp, và mở phiếu thấy đúng thứ tự vừa đặt. | — |
| CHẾT | đã có: [đề xuất] đa số người không tìm ra cách đổi chỗ hay ẩn trường chuẩn, hoặc phiếu hiện khác thứ tự đã đặt ở Cài đặt. | — |
| Timebox | đã có: [đề xuất] phiên nghiệm thu đầu tiên sau khi DA15 lên production, gộp chung buổi đọc số của gói truong-hop-dong sau DA17, DA18. | — |

## truong-mot-cach-cu-xu

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: người dùng thật có phân biệt được trường chuẩn với trường tự tạo trên phiếu và bảng không, và có còn gặp câu lỗi tiếng Anh khi lưu trường không. | — |
| SỐNG | đã có: [đề xuất] ở phiên nghiệm thu, che chữ «tự tạo» ở Cài đặt › Trường rồi cho người dùng xem một phiếu và một bảng: không quá một trên năm người chỉ đúng trường nào là tự tạo; gõ «1.234,5» vào ô Số lưu được ngay lần đầu. | — |
| CHẾT | đã có: [đề xuất] đa số người chỉ ra được trường tự tạo nhờ cách hiện khác, hoặc còn một đường lưu trường in câu tiếng Anh của máy chủ. | — |
| Timebox | đã có: [đề xuất] phiên nghiệm thu đầu tiên sau khi DA14 lên production, gộp chung buổi đọc số của gói truong-hop-dong sau DA17, DA18. | — |

## truong-tep

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Nhân viên quan hệ đối tác có thật sự gắn hợp đồng vào bản ghi CRM và dùng bộ lọc «Chưa có tệp» để tìm bản ghi còn thiếu hợp đồng không? | Truy vấn bảng FieldFile (đếm tệp, bản ghi, người tải) và bảng trường theo kiểu FILE trên production, cộng quan sát trong phiên nghiệm thu với N=3 người; telemetry không có sự kiện cho trường Tệp. |
| SỐNG | **máy soạn:** Trong 2 tuần sau khi quản trị tạo một trường kiểu Tệp, truy vấn bảng FieldFile cho thấy ít nhất 10 tệp gắn vào ít nhất 5 bản ghi thoả thuận, công ty hay cá nhân khác nhau do ít nhất 2 người tải lên, và trong phiên nghiệm thu ít nhất 2 trên 3 người tự lọc ra được bản ghi «Chưa có tệp» mà không cần chỉ. | Truy vấn bảng FieldFile (đếm tệp, bản ghi, người tải) và bảng trường theo kiểu FILE trên production, cộng quan sát trong phiên nghiệm thu với N=3 người; telemetry không có sự kiện cho trường Tệp. |
| CHẾT | **máy soạn:** Hết timebox mà chưa quản trị nào tạo trường kiểu Tệp, hoặc bảng FieldFile có dưới 3 tệp hay chỉ một người tải, hoặc từ 2 trên 3 người trở lên trong phiên nghiệm thu không tìm được bộ lọc «Chưa có tệp». | Truy vấn bảng FieldFile (đếm tệp, bản ghi, người tải) và bảng trường theo kiểu FILE trên production, cộng quan sát trong phiên nghiệm thu với N=3 người; telemetry không có sự kiện cho trường Tệp. |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Truy vấn bảng FieldFile (đếm tệp, bản ghi, người tải) và bảng trường theo kiểu FILE trên production, cộng quan sát trong phiên nghiệm thu với N=3 người; telemetry không có sự kiện cho trường Tệp. |

Căn cứ: Câu giao DA19 trong opportunity.md («gắn tệp hợp đồng… và lọc được bản ghi nào chưa có») cùng AC-2 (mỗi tệp thành một hàng FieldFile) và AC-5, AC-10 (lọc some, none và «Chưa có tệp (n)»).

## va-lo-ro-vai-chi-okr

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: [đề xuất] đã đạt «Truy vấn production: không bước, kế hoạch hay lượt theo dõi đang mở nào thuộc người vai «chỉ OKR»» chưa? | — |
| SỐNG | đã có: [đề xuất] Truy vấn production: không bước, kế hoạch hay lượt theo dõi đang mở nào thuộc người vai «chỉ OKR» | — |
| CHẾT | đã có: [đề xuất] chưa đạt «Truy vấn production: không bước, kế hoạch hay lượt theo dõi đang mở nào thuộc người vai «chỉ OKR»» khi hết timebox | — |
| Timebox | đã có: trước 14/10/2026 — ngày mọi phòng ban bắt đầu dùng thật. | — |

## ve-khung-muc-tieu-dung-kr

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: [đề xuất] đã đạt «Mở ngăn KR từ bảng Họp tuần, đi › sang KR của mục tiêu khác, bấm «Về khung mục tiêu»: khung mở đúng mục tiêu của KR đang xem» chưa? | — |
| SỐNG | đã có: [đề xuất] Mở ngăn KR từ bảng Họp tuần, đi › sang KR của mục tiêu khác, bấm «Về khung mục tiêu»: khung mở đúng mục tiêu của KR đang xem | — |
| CHẾT | đã có: [đề xuất] chưa đạt «Mở ngăn KR từ bảng Họp tuần, đi › sang KR của mục tiêu khác, bấm «Về khung mục tiêu»: khung mở đúng mục tiêu của KR đang xem» khi hết timebox | — |
| Timebox | **máy soạn:** 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | Lịch đọc số chung của đợt dọn dẹp |

Căn cứ: B7 (chủ kho đồng ý 31/10): một phiên nghiệm thu chung sau khi BK và SV gộp

## viec-rieng-chi-nguoi-trong-cuoc

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | đã có: người không trong cuộc có còn thấy được việc mà khung việc hứa là chỉ người trong cuộc thấy không, ở bất kỳ màn nào. | — |
| SỐNG | đã có: [đề xuất] ở phiên nghiệm thu, một thành viên không trong cuộc đi hết Của tôi · Tất cả dự án · Danh sách · Bảng · Gantt của một dự án, và mọi việc khung ghi «chỉ người trong cuộc thấy» không hiện tiêu đề, số đếm hay ngày với người đó; mọi việc người đó thấy thì khung nói đúng ai thấy nó. | — |
| CHẾT | đã có: [đề xuất] còn một màn hay một con số (tiêu đề, số việc, khoảng ngày, mốc chờ) cho người không trong cuộc biết về một việc mà khung hứa là riêng. | — |
| Timebox | đã có: [đề xuất] phiên nghiệm thu đầu tiên sau khi bản sửa lên production, gộp chung buổi đọc số ≈30/10 của làn M5. | — |

## zalo-gui-hong-ghi-ly-do — viết lại khuôn

| Ô | Giá trị | Nguồn |
|---|---|---|
| Câu hỏi | **máy soạn:** Sau khi bật, mỗi lần Zalo gửi hỏng hay tin vào bị bỏ qua, người vận hành có đọc được lý do từ đúng một dòng nhật ký để nối lại cho người dùng, và người hỏi qua Zalo có nhận lại được trả lời không? | Nhật ký production qua vercel logs -p crm-onehub-agent (dòng [zalo]) và thuộc tính zalo_questions theo kết quả (có khoá gui-hong) của sự kiện install_daily trong docs/telemetry.md. |
| SỐNG | **máy soạn:** Mọi dòng [zalo] sendMessage hỏng trên nhật ký production của crm-onehub-agent sau khi gộp đều mang mã HTTP cùng description hay error_code của Zalo, và khoá gui-hong của zalo_questions trong install_daily chiếm không quá 10% số câu hỏi Zalo của mỗi tuần. | Nhật ký production qua vercel logs -p crm-onehub-agent (dòng [zalo]) và thuộc tính zalo_questions theo kết quả (có khoá gui-hong) của sự kiện install_daily trong docs/telemetry.md. |
| CHẾT | **máy soạn:** Còn ít nhất 1 dòng sendMessage hỏng trên nhật ký production sau khi gộp mà không có lý do của Zalo, hoặc khoá gui-hong của zalo_questions vượt 10% câu hỏi trong một tuần mà nhật ký không chỉ ra được vì sao. | Nhật ký production qua vercel logs -p crm-onehub-agent (dòng [zalo]) và thuộc tính zalo_questions theo kết quả (có khoá gui-hong) của sự kiện install_daily trong docs/telemetry.md. |
| Timebox | đã có: hàng sửa nóng, trong ngày 08–09/10. | — |

Căn cứ: Câu SỐNG và CHẾT sẵn có trong opportunity.md (nhãn chưa đúng khuôn) cùng AC-1, AC-3 (dòng [zalo] mang lý do của Zalo) và AC-4 (tin bị bỏ qua có đúng một dòng ly_do).
