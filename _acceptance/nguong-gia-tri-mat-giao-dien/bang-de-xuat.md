# Bảng ngưỡng đề xuất — F39

Máy đề xuất, người chốt. Mỗi ô một dòng: loại · giá trị · nguồn số. Ô không có dòng là chữ cũ giữ nguyên.

- **máy soạn (ô trống)**: ô trước đây trống — chữ mới của máy.
- **máy soạn thay đề xuất kit tự sinh**: 8 hồ sơ có ô do kit sinh theo mẫu «đã đạt «X» chưa?» (X là tiêu chí dựng) — máy soạn lại thành ngưỡng giá trị; chữ cũ ở cột «Chữ cũ».
- **Hỏi-4: đổi timebox**: timebox cũ đã qua hay không ra ngày — đề xuất đổi sang 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7).
- **chuẩn hoá khuôn, giữ chữ**: chữ cũ sai khuôn (nhãn «SỐNG:», dòng thụt, nhãn sau [đề xuất]) — chép nguyên văn vào đúng nhãn, giữ nhãn cũ (ô người đã duyệt vẫn là đã duyệt).

Câu hỏi riêng: loc-don-vi-khong-tu-dong.

## bo-cuc-hep-ngan-va-kanban

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Người dùng mở Bảng cột thoả thuận và ngăn thoả thuận, công ty trên điện thoại có đọc đủ tên, giá trị, giai đoạn và người phụ trách mà không phải xoay ngang hay chuyển sang máy tính không? | — | Quan sát trong phiên nghiệm thu chung với 3 người trên điện thoại; docs/telemetry.md không có sự kiện nào đo bố cục hay cắt chữ. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu với 3 người dùng thật trên điện thoại của họ (khổ 375–390) và dữ liệu thật, ít nhất 2 trên 3 người đọc đúng giai đoạn, giá trị và người phụ trách của 3 thoả thuận do người chủ trì chỉ định, và không ai gặp chữ bị cắt «…» hay thẻ tràn viền. | — | Quan sát trong phiên nghiệm thu chung với 3 người trên điện thoại; docs/telemetry.md không có sự kiện nào đo bố cục hay cắt chữ. |
| CHẾT | máy soạn (ô trống) | Trong phiên nghiệm thu có người gặp nhãn giai đoạn, số liệu đầu ngăn hay thẻ Kanban bị cắt «…» hoặc tràn viền trên dữ liệu thật, hoặc dưới 2 trên 3 người đọc đúng cả 3 thoả thuận. | — | Quan sát trong phiên nghiệm thu chung với 3 người trên điện thoại; docs/telemetry.md không có sự kiện nào đo bố cục hay cắt chữ. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## cap-nhat-trong-ngan-kr

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn thay đề xuất kit tự sinh | Sau khi khối cập nhật nằm ngay trong ngăn KR, người phụ trách KR có mở cập nhật rồi gửi hết thường hơn và nhanh hơn so với hộp thoại cũ không? | đã đạt «Mở một KR đến hạn chưa cập nhật: khối cập nhật mở sẵn trong ngăn, gửi xong ngăn vẫn mở, Lịch sử thêm một dòng ở đầu và biểu đồ thêm một điểm; bấm «Cập nhật» trên dòng Họp tuần mở ngăn KR và cuộn tới khối; không Dialog nào mở trong cả luồng» chưa? | Bảng okrCheckInSession (cột entry, openedAt, submittedAt, seconds; phiên tạo ở moCapNhat, chốt ở guiCapNhat của okr-cap-nhat.service.ts) và bảng okrCheckIn (keyResultId, weekStart, createdAt); docs/telemetry.md không có sự kiện nào cho cập nhật KR. |
| SỐNG | máy soạn thay đề xuất kit tự sinh | Trong 2 tuần sau khi bật, tỉ lệ phiên cập nhật đã mở mà có giờ gửi đạt ít nhất bằng 2 tuần trước khi bật và trung vị số giây của phiên đã gửi không tăng, đồng thời số KR có ít nhất một lần cập nhật mỗi tuần không giảm. | Mở một KR đến hạn chưa cập nhật: khối cập nhật mở sẵn trong ngăn, gửi xong ngăn vẫn mở, Lịch sử thêm một dòng ở đầu và biểu đồ thêm một điểm; bấm «Cập nhật» trên dòng Họp tuần mở ngăn KR và cuộn tới khối; không Dialog nào mở trong cả luồng | Bảng okrCheckInSession (cột entry, openedAt, submittedAt, seconds; phiên tạo ở moCapNhat, chốt ở guiCapNhat của okr-cap-nhat.service.ts) và bảng okrCheckIn (keyResultId, weekStart, createdAt); docs/telemetry.md không có sự kiện nào cho cập nhật KR. |
| CHẾT | máy soạn thay đề xuất kit tự sinh | Trong 2 tuần sau khi bật, tỉ lệ phiên mở mà gửi thấp hơn 2 tuần trước khi bật, hoặc số KR được cập nhật mỗi tuần giảm, hoặc gần như mọi phiên vẫn đến từ một lối duy nhất cho thấy các lối Họp tuần, bảng đơn vị, mục tiêu không được dùng. | chưa đạt «Mở một KR đến hạn chưa cập nhật: khối cập nhật mở sẵn trong ngăn, gửi xong ngăn vẫn mở, Lịch sử thêm một dòng ở đầu và biểu đồ thêm một điểm; bấm «Cập nhật» trên dòng Họp tuần mở ngăn KR và cuộn tới khối; không Dialog nào mở trong cả luồng» khi hết timebox | Bảng okrCheckInSession (cột entry, openedAt, submittedAt, seconds; phiên tạo ở moCapNhat, chốt ở guiCapNhat của okr-cap-nhat.service.ts) và bảng okrCheckIn (keyResultId, weekStart, createdAt); docs/telemetry.md không có sự kiện nào cho cập nhật KR. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## cay-can-chinh-co-ly-do

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Người phụ trách OKR có dùng Cây căn chỉnh và chip «Chưa có lý do» để tìm ra các đường nối còn trống lý do rồi bổ sung chúng không? | — | Truy vấn bảng okrAlignment (lyDo khác null, theo chu kỳ) chụp ngày bật và ngày hạn, cộng quan sát phiên nghiệm thu với 3 người; telemetry không có sự kiện cho cây hay bộ lọc. |
| SỐNG | máy soạn (ô trống) | Đến hạn, tỉ lệ căn chỉnh của chu kỳ hiện hành có lyDo khác null trong bảng okrAlignment tăng ít nhất 10 điểm so với mốc chụp ngày bật, và trong phiên nghiệm thu ít nhất 2 trên 3 người tự tìm được một đường «Chưa có lý do» bằng chip lọc trong vòng 1 phút. | — | Truy vấn bảng okrAlignment (lyDo khác null, theo chu kỳ) chụp ngày bật và ngày hạn, cộng quan sát phiên nghiệm thu với 3 người; telemetry không có sự kiện cho cây hay bộ lọc. |
| CHẾT | máy soạn (ô trống) | Tỉ lệ căn chỉnh có lyDo không tăng so với mốc ngày bật, và trong phiên nghiệm thu dưới 2 trên 3 người tìm được đường «Chưa có lý do» bằng bộ lọc. | — | Truy vấn bảng okrAlignment (lyDo khác null, theo chu kỳ) chụp ngày bật và ngày hạn, cộng quan sát phiên nghiệm thu với 3 người; telemetry không có sự kiện cho cây hay bộ lọc. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## cho-tac-nhan-lau

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Người dựng Tác nhân có rời màn chờ và quay lại đúng lúc nhờ thông báo của Kara, thay vì ngồi nhìn thẻ «Đang dựng» suốt hơn 200 giây không? | — | Truy vấn bảng ThongBao (loại tac-nhan-*, docLuc, duongDan) đối chiếu với AgentConversation của bộ dựng; số lượt nền đọc từ sessions_completed và sessions_failed của install_daily trong docs/telemetry.md. |
| SỐNG | máy soạn (ô trống) | Trong 2 tuần sau bật, với ít nhất 5 lượt dựng, mọi lượt dựng kết thúc (không tự dừng) có đúng một ThongBao loại tac-nhan-xong, tac-nhan-can-tra-loi hay tac-nhan-hong, và ít nhất một nửa số thông báo đó có docLuc khác null. | — | Truy vấn bảng ThongBao (loại tac-nhan-*, docLuc, duongDan) đối chiếu với AgentConversation của bộ dựng; số lượt nền đọc từ sessions_completed và sessions_failed của install_daily trong docs/telemetry.md. |
| CHẾT | máy soạn (ô trống) | Có lượt dựng kết thúc mà không có ThongBao nào hoặc có hai, hoặc dưới một phần tư thông báo Tác nhân được đọc trong 2 tuần, hoặc người dùng trong phiên nghiệm thu nói vẫn không biết lượt dựng đã xong. | — | Truy vấn bảng ThongBao (loại tac-nhan-*, docLuc, duongDan) đối chiếu với AgentConversation của bộ dựng; số lượt nền đọc từ sessions_completed và sessions_failed của install_daily trong docs/telemetry.md. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## chu-man-tieng-viet-khong-tran

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Người dùng trình đọc màn hình có nghe vùng điều hướng bằng tiếng Việt, và người mở Cài đặt › Trường trên điện thoại có đọc được kiểu của từng trường không? | — | Quan sát phiên nghiệm thu với 3 người trên điện thoại cộng một lượt VoiceOver do người chủ trì chạy; telemetry không đo trợ năng hay bố cục. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu, ít nhất 2 trên 3 người mở Cài đặt › Trường trên điện thoại đọc đúng kiểu của 3 trường chỉ định và không thấy nhãn kiểu tràn ô, và một lượt nghe bằng VoiceOver trên giao diện tiếng Việt đọc breadcrumb là «Vị trí trang». | — | Quan sát phiên nghiệm thu với 3 người trên điện thoại cộng một lượt VoiceOver do người chủ trì chạy; telemetry không đo trợ năng hay bố cục. |
| CHẾT | máy soạn (ô trống) | Có người trong phiên nghiệm thu gặp nhãn kiểu tràn ô hay đọc sai kiểu trường trên điện thoại, hoặc VoiceOver vẫn đọc «breadcrumb» tiếng Anh trên giao diện tiếng Việt. | — | Quan sát phiên nghiệm thu với 3 người trên điện thoại cộng một lượt VoiceOver do người chủ trì chạy; telemetry không đo trợ năng hay bố cục. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## dai-luu-tru-dung-chung

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi dải báo và vùng khoá thành mảnh chung, người mở một bản ghi đã lưu trữ có còn nhận ra ngay nó đã cất, không sửa nhầm được, và khôi phục bằng một lần bấm không? | — | Truy vấn cột archivedAt và updatedAt của bảng Contact, Deal (Company tương tự nếu có cột), sự kiện api_error theo route trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |
| SỐNG | máy soạn (ô trống) | Trong 2 tuần sau bật, không Contact hay Deal nào còn archivedAt mà có updatedAt muộn hơn archivedAt, không có api_error trên route khôi phục của ba loại bản ghi, và trong phiên nghiệm thu ít nhất 2 trên 3 người nhận ra bản ghi đã lưu trữ và khôi phục được ngay lần bấm đầu. | — | Truy vấn cột archivedAt và updatedAt của bảng Contact, Deal (Company tương tự nếu có cột), sự kiện api_error theo route trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |
| CHẾT | máy soạn (ô trống) | Có bản ghi đang lưu trữ bị ghi đổi sau mốc lưu trữ, hoặc có lần bấm «Khôi phục» gửi hai lệnh hay báo lỗi, hoặc dưới 2 trên 3 người trong phiên nghiệm thu nhận ra bản ghi đã cất. | — | Truy vấn cột archivedAt và updatedAt của bảng Contact, Deal (Company tương tự nếu có cột), sự kiện api_error theo route trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## dau-trang-okr-cho-nut-hoi-kara

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Người mở khu OKR trên điện thoại có còn thấy trang Toàn cảnh nhảy, hay bấm nhầm, khi dữ liệu tới không? | — | Quan sát phiên nghiệm thu với 3 người trên điện thoại; telemetry không có số đo dịch bố cục (CLS). |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu, 3 trên 3 người mở Toàn cảnh trên điện thoại của họ không bấm nhầm vì nội dung dịch chuyển và không ai nói trang nhảy khi dữ liệu tới. | — | Quan sát phiên nghiệm thu với 3 người trên điện thoại; telemetry không có số đo dịch bố cục (CLS). |
| CHẾT | máy soạn (ô trống) | Có ít nhất một người trong phiên nghiệm thu thấy trang Toàn cảnh nhảy hoặc bấm nhầm vì nội dung tụt xuống khi dữ liệu tới. | — | Quan sát phiên nghiệm thu với 3 người trên điện thoại; telemetry không có số đo dịch bố cục (CLS). |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## duong-ly-do-muc-tieu

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Người xem một mục tiêu có hiểu vì sao nó góp vào mục tiêu cha nhờ khu «Đường lý do», mà không phải đi hỏi người lập không? | — | Quan sát phiên nghiệm thu với 3 người trên dữ liệu thật, cộng truy vấn đếm okrAlignment có lyDo khác null; telemetry không có sự kiện mở sheet. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu trên ít nhất 3 mục tiêu thật có lý do, ít nhất 2 trên 3 người mở sheet nói lại đúng ý lý do và phân biệt đúng «Có số liệu» với «Đặt cược» mà không cần giải thích. | — | Quan sát phiên nghiệm thu với 3 người trên dữ liệu thật, cộng truy vấn đếm okrAlignment có lyDo khác null; telemetry không có sự kiện mở sheet. |
| CHẾT | máy soạn (ô trống) | Dưới 2 trên 3 người nói lại được lý do hay phân biệt được mức tin, hoặc đến hạn chu kỳ thật không có căn chỉnh nào có lyDo trong okrAlignment để hiện. | — | Quan sát phiên nghiệm thu với 3 người trên dữ liệu thật, cộng truy vấn đếm okrAlignment có lyDo khác null; telemetry không có sự kiện mở sheet. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## gan-tay-va-kara-co-ly-do

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Căn chỉnh tạo mới sau khi bật, gắn tay hay nhận từ Kara, có thật sự mang lý do thay vì vẫn trống như trước không? | — | Truy vấn bảng okrAlignment (createdAt, lyDo, lyDoTuKara) đối chiếu OkrDeXuat loại can-chinh ở trạng thái nhan hoặc sua, cùng OkrTrail action sua-ly-do-can-chinh. |
| SỐNG | máy soạn (ô trống) | Trong 2 tuần sau bật, với ít nhất 5 căn chỉnh mới, ít nhất 50% căn chỉnh có createdAt sau ngày bật mang lyDo khác null, và mọi căn chỉnh sinh từ đề xuất can-chinh của Kara đã nhận hay sửa đều có lyDo khác null. | — | Truy vấn bảng okrAlignment (createdAt, lyDo, lyDoTuKara) đối chiếu OkrDeXuat loại can-chinh ở trạng thái nhan hoặc sua, cùng OkrTrail action sua-ly-do-can-chinh. |
| CHẾT | máy soạn (ô trống) | Dưới 20% căn chỉnh mới có lý do, hoặc có căn chỉnh sinh từ đề xuất Kara đã nhận mà lyDo vẫn null. | — | Truy vấn bảng okrAlignment (createdAt, lyDo, lyDoTuKara) đối chiếu OkrDeXuat loại can-chinh ở trạng thái nhan hoặc sua, cùng OkrTrail action sua-ly-do-can-chinh. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## go-tin-hieu-rac

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn thay đề xuất kit tự sinh | Sau khi quản trị lưu trữ được tín hiệu rác, đội sản phẩm có còn nhận tín hiệu thử, trùng hay gửi nhầm trong lượt kéo về không? | đã đạt «Lượt kéo về đầu tiên sau khi giao không mang tín hiệu nào đã lưu trữ; mỗi lần gỡ có vết người gỡ (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa? | Bảng tinHieu (archivedAt, archivedById, keoVeLuc) và tinHieuVet (loai luu-tru hay khoi-phuc, nguoiId, luc), cộng bản gom của lượt gom tín hiệu trong kho; docs/telemetry.md không có sự kiện cho tín hiệu. |
| SỐNG | máy soạn thay đề xuất kit tự sinh | Trong 2 tuần sau khi bật, có ít nhất một tín hiệu được lưu trữ trước khi bị kéo về, và bản gom kế tiếp của đội sản phẩm không xếp tín hiệu nào vào lẻ với lý do thử, trùng hay gửi nhầm. | Lượt kéo về đầu tiên sau khi giao không mang tín hiệu nào đã lưu trữ; mỗi lần gỡ có vết người gỡ (ngưỡng đề xuất — chốt ở Cổng Đáng) | Bảng tinHieu (archivedAt, archivedById, keoVeLuc) và tinHieuVet (loai luu-tru hay khoi-phuc, nguoiId, luc), cộng bản gom của lượt gom tín hiệu trong kho; docs/telemetry.md không có sự kiện cho tín hiệu. |
| CHẾT | máy soạn thay đề xuất kit tự sinh | Trong 2 tuần sau khi bật, bản gom vẫn có tín hiệu lẻ vì thử, trùng hay gửi nhầm mà quản trị đã thấy ở thẻ «Tất cả», hoặc phần lớn lần lưu trữ bị khôi phục lại vì lỡ tay. | chưa đạt «Lượt kéo về đầu tiên sau khi giao không mang tín hiệu nào đã lưu trữ; mỗi lần gỡ có vết người gỡ (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox | Bảng tinHieu (archivedAt, archivedById, keoVeLuc) và tinHieuVet (loai luu-tru hay khoi-phuc, nguoiId, luc), cộng bản gom của lượt gom tín hiệu trong kho; docs/telemetry.md không có sự kiện cho tín hiệu. |
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33) | Lịch đọc số chung của B7 |

## gon-dau-trang-lay-y-kien

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## gop-y-dung-cho

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | góp ý của Kara có được quyết (nhận, sửa, bỏ qua) thay vì nằm im không? | (như cột giá trị) | chữ cũ của hồ sơ |
| SỐNG | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | 30 ngày sau khi lên, ít hơn 30% góp ý còn `cho` quá 7 ngày; tỉ lệ bỏ qua của góp ý về KR không cao hơn góp ý về Mục tiêu quá 15 điểm. | (như cột giá trị) | chữ cũ của hồ sơ |
| CHẾT | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | tỉ lệ góp ý nằm im không giảm so với mốc đo trước lượt. | (như cột giá trị) | chữ cũ của hồ sơ |
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | 30 ngày sau khi lên production. | Lịch đọc số chung của B7 |

## hoan-tac-loat-bao-dung

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Khi lưu trữ hay hoàn tác hàng loạt, người dùng có hiểu đúng toast, không tưởng lỗi máy chủ là bản «bị bỏ qua» và không hoảng vì «chưa hoàn tác được» khi bản đã về, còn người vận hành có lần ra bản ghi lỗi không? | — | Nhật ký production (runtime log) lọc dòng lỗi của runBulk có recordId, sự kiện api_error theo route lưu trữ và khôi phục hàng loạt trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |
| SỐNG | máy soạn (ô trống) | Trong 2 tuần sau bật, mọi lô có errored lớn hơn 0 đều có dòng log lỗi kèm recordId trong nhật ký production, và trong phiên nghiệm thu ít nhất 2 trên 3 người xem toast «3 bản đã được khôi phục từ trước.» hiểu bản ghi vẫn ở danh sách mà không đi tìm lỗi. | — | Nhật ký production (runtime log) lọc dòng lỗi của runBulk có recordId, sự kiện api_error theo route lưu trữ và khôi phục hàng loạt trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |
| CHẾT | máy soạn (ô trống) | Có lô lỗi máy chủ mà nhật ký production không có dòng log kèm recordId, hoặc trong phiên nghiệm thu quá 1 trên 3 người hiểu toast là đã có lỗi. | — | Nhật ký production (runtime log) lọc dòng lỗi của runBulk có recordId, sự kiện api_error theo route lưu trữ và khôi phục hàng loạt trong docs/telemetry.md, và quan sát phiên nghiệm thu với 3 người. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## hoan-tac-loat-dung-id

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | chuẩn hoá khuôn, giữ chữ | sau khi lưu trữ hàng loạt rồi «Hoàn tác», có đúng những bản mình vừa cất quay lại — không hơn, không kém — và toast có nói thật số bản không về được, bằng tiếng của người dùng, không? | (như cột giá trị) | chữ cũ của hồ sơ |
| SỐNG | chuẩn hoá khuôn, giữ chữ | trên máy chủ thật, bản đã cất từ trước không bao giờ bị «Hoàn tác» khôi phục; toast «Hoàn tác» ghi đúng số đã khôi phục và số không khôi phục được; 0 toast lưu trữ hay hoàn tác chứa câu lỗi tiếng Anh thô của máy chủ. | (như cột giá trị) | chữ cũ của hồ sơ |
| CHẾT | chuẩn hoá khuôn, giữ chữ | «Hoàn tác» còn khôi phục một bản người khác đã cất trước; hoặc còn toast xanh khi có bản không khôi phục được; hoặc còn câu lỗi máy chủ thô trên toast. | (như cột giá trị) | chữ cũ của hồ sơ |
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | 1 ngày máy. | Lịch đọc số chung của B7 |

## hoi-dap-okr

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn thay đề xuất kit tự sinh | Người dùng có quay lại hỏi Kara về OKR trên web và thấy câu trả lời hữu ích không? | đã đạt «Eval hỏi đáp trên bộ ca mẫu (M, N1) đạt; phép đo «người vai chỉ OKR chỉ hỏi được OKR» xanh trên production» chưa? | Bảng okrLuotHoi (userId, ngay, cuocHoiId) đếm người và lượt hỏi, okrHoiPhanHoi (huuIch, userId) cho phần hữu ích, okrCuocHoi (nguoiHoiUserId) và aiChiPhi với tinhNang okr.hoi-dap cho chi phí; zalo_questions của docs/telemetry.md thuộc hàng C2 nên không dùng. |
| SỐNG | máy soạn thay đề xuất kit tự sinh | Trong 2 tuần sau khi bật, ít nhất 5 người khác nhau hỏi ít nhất một câu, ít nhất 3 người hỏi ở cả hai tuần, và trong các phản hồi đã bấm thì phần «không hữu ích» dưới 30%. | Eval hỏi đáp trên bộ ca mẫu (M, N1) đạt; phép đo «người vai chỉ OKR chỉ hỏi được OKR» xanh trên production | Bảng okrLuotHoi (userId, ngay, cuocHoiId) đếm người và lượt hỏi, okrHoiPhanHoi (huuIch, userId) cho phần hữu ích, okrCuocHoi (nguoiHoiUserId) và aiChiPhi với tinhNang okr.hoi-dap cho chi phí; zalo_questions của docs/telemetry.md thuộc hàng C2 nên không dùng. |
| CHẾT | máy soạn thay đề xuất kit tự sinh | Trong 2 tuần sau khi bật, không quá 2 người hỏi hay không ai hỏi lại ở tuần thứ hai, hoặc từ 50% phản hồi đã bấm trở lên là «không hữu ích». | chưa đạt «Eval hỏi đáp trên bộ ca mẫu (M, N1) đạt; phép đo «người vai chỉ OKR chỉ hỏi được OKR» xanh trên production» khi hết timebox | Bảng okrLuotHoi (userId, ngay, cuocHoiId) đếm người và lượt hỏi, okrHoiPhanHoi (huuIch, userId) cho phần hữu ích, okrCuocHoi (nguoiHoiUserId) và aiChiPhi với tinhNang okr.hoi-dap cho chi phí; zalo_questions của docs/telemetry.md thuộc hàng C2 nên không dùng. |

## kara-mot-ten

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Người dùng có nhận ra và gọi AI của sản phẩm bằng một tên Kara ở mọi bề mặt, thay vì lẫn «Trợ lý», «tác nhân», «máy soạn» không? | — | Quan sát phiên nghiệm thu với 3 người trên ba bề mặt cộng kết quả luật máy một tên AI trên CI của onehub; telemetry không đo chữ trên màn. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu, ít nhất 2 trên 3 người được hỏi «ai đã làm việc này» ở ba bề mặt (tóm tắt tuần, Soạn OKR, Tài liệu) đều trả lời là Kara, và luật máy «một tên AI» xanh trên onehub suốt timebox. | — | Quan sát phiên nghiệm thu với 3 người trên ba bề mặt cộng kết quả luật máy một tên AI trên CI của onehub; telemetry không đo chữ trên màn. |
| CHẾT | máy soạn (ô trống) | Dưới 2 trên 3 người gọi AI là Kara ở cả ba bề mặt, hoặc người dùng còn gặp một chuỗi gọi AI bằng tên khác trên màn thật. | — | Quan sát phiên nghiệm thu với 3 người trên ba bề mặt cộng kết quả luật máy một tên AI trên CI của onehub; telemetry không đo chữ trên màn. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## khung-cho-don-vi-mot-hinh

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi bật, người mở trang Theo đơn vị có còn thấy màn chờ đổi hình giữa chừng hay bấm trượt ô chọn đơn vị lúc trang đang tải không? | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, vì docs/telemetry.md chỉ gửi sự kiện phía máy chủ và không có sự kiện nào về màn chờ. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu với ít nhất 3 người mở trang Theo đơn vị bằng tải cứng và đổi đơn vị, trên máy tính và điện thoại, 0 người chỉ ra màn chờ nhảy hình hay hỏi «đang tải hay hỏng», và 0 người bấm trượt ô chọn đơn vị vì nó dịch chỗ. | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, vì docs/telemetry.md chỉ gửi sự kiện phía máy chủ và không có sự kiện nào về màn chờ. |
| CHẾT | máy soạn (ô trống) | Từ 2 người trở lên trong phiên nói màn chờ đổi hình hay giật, hoặc có người bấm trượt ô chọn đơn vị lúc đang tải, hoặc có một góp ý cùng nội dung gửi về trong timebox. | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, vì docs/telemetry.md chỉ gửi sự kiện phía máy chủ và không có sự kiện nào về màn chờ. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## khung-man-chung

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi bật, người đang chờ một màn tải hay gặp lỗi tải có luôn biết mình đang ở màn nào và tự gỡ được bằng «Thử lại» mà không phải hỏi ai không? | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, lỗi tải dựng bằng truy vấn bị giữ hay trả lỗi; sự kiện api_error của docs/telemetry.md chỉ đếm lỗi theo route, không đo người có gỡ được hay không. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu với ít nhất 3 người, mỗi người gặp ít nhất một màn đang tải và một lỗi tải dựng sẵn, ít nhất 2 trên 3 người gọi đúng tên màn lúc đang tải và tự bấm «Thử lại» để về nội dung, và 0 người hỏi vì sao một nút đầu trang bị tắt. | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, lỗi tải dựng bằng truy vấn bị giữ hay trả lỗi; sự kiện api_error của docs/telemetry.md chỉ đếm lỗi theo route, không đo người có gỡ được hay không. |
| CHẾT | máy soạn (ô trống) | Quá nửa người trong phiên không gọi được tên màn lúc đang tải hoặc không tìm ra cách thử lại khi lỗi, hoặc có người hỏi vì sao nút chính bị tắt ở Onboarding, Tổ chức hay SSO. | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người, lỗi tải dựng bằng truy vấn bị giữ hay trả lỗi; sự kiện api_error của docs/telemetry.md chỉ đếm lỗi theo route, không đo người có gỡ được hay không. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## khung-soan-chan-lien-ket

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi bật, người soạn OKR trong khung bên phải có còn mất chữ đang gõ hay bản Kara đang soạn vì lỡ bấm một liên kết trong khung không? | — | Góp ý và issue của người dùng trong timebox cộng quan sát phiên nghiệm thu N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |
| SỐNG | máy soạn (ô trống) | Trong timebox có 0 góp ý hay issue báo mất chữ gõ dở khi bấm liên kết trong khung soạn, và trong phiên nghiệm thu với ít nhất 3 người bấm «Tới Kho tài liệu» lúc đang gõ dở thì cả 3 đều thấy hộp hỏi và ai chọn ở lại đều giữ nguyên chữ. | — | Góp ý và issue của người dùng trong timebox cộng quan sát phiên nghiệm thu N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |
| CHẾT | máy soạn (ô trống) | Có ít nhất 1 báo mất chữ hay mất bản soạn do bấm liên kết trong khung, hoặc trong phiên quá nửa người gặp hộp hỏi khi khung không có gì dở và thấy nó cản đường. | — | Góp ý và issue của người dùng trong timebox cộng quan sát phiên nghiệm thu N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## lich-su-va-luu-tru-trang

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi bật, người dùng Kho tài liệu có thật sự quay lại bản cũ và lưu trữ trang không còn dùng qua duyệt, thay vì để trang cũ nằm lẫn trong danh sách không? | — | Truy vấn production bảng TaiLieuDeXuat theo loai và trangThai cùng bảng TaiLieuSuKien loại khôi phục và lưu trữ (mốc luc); docs/telemetry.md không có thuộc tính nào cho Kho tài liệu. |
| SỐNG | máy soạn (ô trống) | Trong timebox, bảng TaiLieuDeXuat có ít nhất 3 đề xuất loại lưu trữ hoặc quay lại phiên bản cũ đã được duyệt, và không quá 1 trang đã lưu trữ bị khôi phục trong vòng 7 ngày vì lưu trữ nhầm. | — | Truy vấn production bảng TaiLieuDeXuat theo loai và trangThai cùng bảng TaiLieuSuKien loại khôi phục và lưu trữ (mốc luc); docs/telemetry.md không có thuộc tính nào cho Kho tài liệu. |
| CHẾT | máy soạn (ô trống) | Hết timebox mà TaiLieuDeXuat có 0 đề xuất lưu trữ và 0 đề xuất quay lại bản cũ được duyệt, hoặc quá nửa số trang đã lưu trữ bị khôi phục trong vòng 7 ngày. | — | Truy vấn production bảng TaiLieuDeXuat theo loai và trangThai cùng bảng TaiLieuSuKien loại khôi phục và lưu trữ (mốc luc); docs/telemetry.md không có thuộc tính nào cho Kho tài liệu. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## lien-quan-loc-ban-da-cat

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi bật, người xem ngăn công ty, cá nhân hay thoả thuận có đọc đúng số bản đang dùng và vẫn tự tìm lại được bản đã lưu trữ từ ngăn không? | — | Nhật ký vấp theo khuôn stranger-drive-template trong phiên nghiệm thu với N ít nhất 3 người, đúng đường đo thứ hai hợp đồng đã khai. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu với ít nhất 3 người, ít nhất 2 trên 3 người tìm lại một thoả thuận đã lưu trữ từ ngăn công ty qua «+n đã lưu trữ» trong 1 phút không cần gợi ý, và 0 người hiểu «+n đã lưu trữ» là nút lưu trữ hay đọc số trên tab mà tính cả bản đã cất. | — | Nhật ký vấp theo khuôn stranger-drive-template trong phiên nghiệm thu với N ít nhất 3 người, đúng đường đo thứ hai hợp đồng đã khai. |
| CHẾT | máy soạn (ô trống) | Quá nửa người không tìm ra bản đã cất từ ngăn hoặc hiểu «+n đã lưu trữ» là nút để lưu trữ, hoặc có báo số trên tab hay số liệu đầu ngăn công ty lệch số bản đang dùng. | — | Nhật ký vấp theo khuôn stranger-drive-template trong phiên nghiệm thu với N ít nhất 3 người, đúng đường đo thứ hai hợp đồng đã khai. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## lo-trinh-nhieu-san-pham

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn thay đề xuất kit tự sinh | Chủ kho có đọc được lộ trình của một sản phẩm thứ hai ngay trên trang Lộ trình, cập nhật theo nhánh chính, mà không phải mở kho GitHub của sản phẩm đó không? | đã đạt «Kho thứ hai (OneHub Platform hoặc kho kit) hiện đủ trên trang trong ngày cài, và người không có quyền với sản phẩm đó không thấy nó (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa? | Bảng SanPhamLoTrinh (caiLuc, taoLuc, layDauLuc, kiemLuc, nguonDoiLuc, trangThaiLay, luuTruLuc) và SanPhamNguoiXem (capLuc), đọc qua lệnh đo của AC-10; docs/telemetry.md không có sự kiện xem trang. |
| SỐNG | máy soạn thay đề xuất kit tự sinh | Trong 2 tuần sau khi bật, ít nhất một sản phẩm ngoài CRM có bản chụp đầu trong vòng một ngày tính từ lúc khai và cài ứng dụng, trạng thái lấy giữ «đã lấy» qua mỗi lần nhánh chính đổi, và có ít nhất một người được cấp quyền xem sản phẩm đó. | Kho thứ hai (OneHub Platform hoặc kho kit) hiện đủ trên trang trong ngày cài, và người không có quyền với sản phẩm đó không thấy nó (ngưỡng đề xuất — chốt ở Cổng Đáng) | Bảng SanPhamLoTrinh (caiLuc, taoLuc, layDauLuc, kiemLuc, nguonDoiLuc, trangThaiLay, luuTruLuc) và SanPhamNguoiXem (capLuc), đọc qua lệnh đo của AC-10; docs/telemetry.md không có sự kiện xem trang. |
| CHẾT | máy soạn thay đề xuất kit tự sinh | Sau 2 tuần chưa sản phẩm nào ngoài CRM có bản chụp, hoặc bản chụp đầu trễ quá một ngày, hoặc sản phẩm đã khai đứng ở trạng thái lấy hỏng từ hai lần kiểm liên tiếp trở lên. | chưa đạt «Kho thứ hai (OneHub Platform hoặc kho kit) hiện đủ trên trang trong ngày cài, và người không có quyền với sản phẩm đó không thấy nó (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox | Bảng SanPhamLoTrinh (caiLuc, taoLuc, layDauLuc, kiemLuc, nguonDoiLuc, trangThaiLay, luuTruLuc) và SanPhamNguoiXem (capLuc), đọc qua lệnh đo của AC-10; docs/telemetry.md không có sự kiện xem trang. |
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33) | Lịch đọc số chung của B7 |

## lo-trinh-ten-va-build

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi gộp, người đọc trang lộ trình có thấy đúng tên OneHub Center và các dãy có còn bị chặn đẩy vì bản dựng panic symlink không? | — | Nhật ký job CI đọc bằng gh run list và gh run view lọc chuỗi «infinite loop», cộng đầu ra của _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs; không có telemetry. |
| SỐNG | máy soạn (ô trống) | Trong timebox có 0 lượt CI hay pre-push trên onehub và trên PR mở đỏ với dòng «symlink … infinite loop» của next build, và phép quét tên OneHub Center giữ 0 SAI ở mọi lượt chạy. | — | Nhật ký job CI đọc bằng gh run list và gh run view lọc chuỗi «infinite loop», cộng đầu ra của _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs; không có telemetry. |
| CHẾT | máy soạn (ô trống) | Có ít nhất 1 lượt CI hay pre-push đỏ với dòng panic «infinite loop» của next build, hoặc trang lộ trình lại hiện chữ «CRM» cho người đọc. | — | Nhật ký job CI đọc bằng gh run list và gh run view lọc chuỗi «infinite loop», cộng đầu ra của _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs; không có telemetry. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## loc-don-vi-khong-tu-dong — HỎI

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi bật, người lọc mục tiêu ở trang Theo đơn vị có chọn liền nhiều giá trị lọc mà không phải mở lại menu hay khung Lọc không? | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; hợp đồng đã bỏ đường đo và telemetry không có sự kiện lọc. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu với ít nhất 3 người, mỗi người lọc theo hai giá trị liên tiếp ở máy tính và ở điện thoại, ít nhất 2 trên 3 người làm xong mà không phải mở lại menu Lọc lần nào, và 0 người nói bảng nháy hay biến mất khi đổi lọc. | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; hợp đồng đã bỏ đường đo và telemetry không có sự kiện lọc. |
| CHẾT | máy soạn (ô trống) | Quá nửa người phải mở lại menu hay khung Lọc sau mỗi lần chọn, hoặc có người nói bảng biến mất hay nháy khi đổi lọc. | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; hợp đồng đã bỏ đường đo và telemetry không có sự kiện lọc. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## loc-moi-truong

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi bật, nhân viên quan hệ đối tác có thật sự lọc theo trường chữ, số, ngày, ô tích hay ô trống và lưu bộ lọc ấy ở Thoả thuận không? | — | Truy vấn production bảng SavedView theo cột entity và nội dung cột filters, cộng quan sát phiên nghiệm thu; docs/telemetry.md không có thuộc tính nào về lọc. |
| SỐNG | máy soạn (ô trống) | Trong timebox, bảng SavedView có ít nhất 2 bộ lọc đã lưu của Thoả thuận, và ít nhất 1 bộ lọc đã lưu ở bất kỳ loại bản ghi nào mang giá trị lọc kiểu mới (has:, gte:, lte:, none, yes, no hay một mốc ngày). | — | Truy vấn production bảng SavedView theo cột entity và nội dung cột filters, cộng quan sát phiên nghiệm thu; docs/telemetry.md không có thuộc tính nào về lọc. |
| CHẾT | máy soạn (ô trống) | Hết timebox mà SavedView có 0 bộ lọc đã lưu của Thoả thuận và 0 bộ lọc mang giá trị kiểu mới, hoặc trong phiên nghiệm thu quá nửa người không đặt được lọc «trống» hay lọc khoảng số. | — | Truy vấn production bảng SavedView theo cột entity và nội dung cột filters, cộng quan sát phiên nghiệm thu; docs/telemetry.md không có thuộc tính nào về lọc. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## loc-va-kieu-xem-chung

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi bật, đường dẫn danh sách có bộ lọc gửi cho đồng nghiệp có mở ra đúng bộ lọc và kiểu xem, và người dùng có lọc được ở danh sách thứ hai mà không phải học lại không? | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu với ít nhất 3 người, mỗi người gửi cho người khác một đường dẫn có bộ lọc ở Thoả thuận, Onboarding hoặc Tài liệu, ít nhất 2 trên 3 đường dẫn mở ra đúng bộ lọc và kiểu xem, và ít nhất 2 trên 3 người lọc được ở màn thứ hai không cần hướng dẫn. | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |
| CHẾT | máy soạn (ô trống) | Có ít nhất 1 đường dẫn gửi đi mở ra sai bộ lọc hay sai kiểu xem, hoặc quá nửa người phải hỏi cách lọc ở màn thứ hai. | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người; telemetry không có sự kiện phía trình duyệt. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## luu-tru-truong-khong-hoi

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi bật, quản trị lưu trữ một trường có hiểu trường chỉ được cất và tự lấy lại được bằng «Hoàn tác» khi lỡ tay, không cần hộp hỏi lại không? | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người cộng góp ý của người dùng trong timebox; telemetry không có sự kiện về trường. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu với ít nhất 3 người quản trị lưu trữ một trường rồi lấy lại, ít nhất 2 trên 3 người tự bấm «Hoàn tác» không cần gợi ý và nói trường được cất chứ không bị xoá, và trong timebox có 0 báo mất trường vì lưu trữ nhầm. | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người cộng góp ý của người dùng trong timebox; telemetry không có sự kiện về trường. |
| CHẾT | máy soạn (ô trống) | Quá nửa người trong phiên nghĩ trường đã bị xoá hoặc không thấy «Hoàn tác», hoặc có ít nhất 1 báo mất trường không lấy lại được. | — | Quan sát trong phiên nghiệm thu với N ít nhất 3 người cộng góp ý của người dùng trong timebox; telemetry không có sự kiện về trường. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## mau-trang-thai-chung

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi bật, người dùng nhìn một chấm trạng thái ở OKR, Kara, lịch họp hay Tài liệu có đoán đúng nghĩa của nó như nhau ở mọi khu không? | — | Chấm kín trong phiên nghiệm thu với N ít nhất 3 người; không có telemetry nào đo cách đọc màu. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu chấm kín với ít nhất 3 người xem 6 chấm trạng thái lấy từ ít nhất 3 khu khác nhau, mỗi người gọi đúng nghĩa ít nhất 5 trên 6 chấm, và không ai đọc chấm «đang chạy» thành lỗi hay rủi ro. | — | Chấm kín trong phiên nghiệm thu với N ít nhất 3 người; không có telemetry nào đo cách đọc màu. |
| CHẾT | máy soạn (ô trống) | Có người gọi đúng dưới 4 trên 6 chấm, hoặc từ 2 người trở lên hiểu cùng một màu thành hai nghĩa khác nhau ở hai khu. | — | Chấm kín trong phiên nghiệm thu với N ít nhất 3 người; không có telemetry nào đo cách đọc màu. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## nen-kara

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi có nền, các lượt AI kế tiếp có dựng đề xuất, dấu và phản hồi của Kara bằng thành phần chung của packages/ui, để người dùng thấy AI cùng một kiểu ở mọi màn không? | — | Đếm bằng git grep trong apps/app chỗ dùng thành phần chung so với chỗ tự dựng, đếm kiểu dấu trên màn thật theo khảo sát mục 1–2, cộng quan sát phiên nghiệm thu N ít nhất 3 người. |
| SỐNG | máy soạn (ô trống) | Tới hết timebox, mọi lượt AI gộp sau nen-kara dựng đề xuất, dấu và phản hồi bằng ProposedChange, KaraMark, KaraLabel, AiFeedback chứ không tự dựng, số kiểu dấu nhận diện AI trên màn thật giảm từ bốn xuống tối đa hai, và trong phiên nghiệm thu ít nhất 2 trên 3 người chỉ đúng nút chính của một đề xuất inline. | — | Đếm bằng git grep trong apps/app chỗ dùng thành phần chung so với chỗ tự dựng, đếm kiểu dấu trên màn thật theo khảo sát mục 1–2, cộng quan sát phiên nghiệm thu N ít nhất 3 người. |
| CHẾT | máy soạn (ô trống) | Có ít nhất 1 lượt AI gộp sau nen-kara tự dựng thẻ đề xuất hay dấu Kara riêng ngoài packages/ui, hoặc số kiểu dấu nhận diện AI trên màn thật vẫn là bốn. | — | Đếm bằng git grep trong apps/app chỗ dùng thành phần chung so với chỗ tự dựng, đếm kiểu dấu trên màn thật theo khảo sát mục 1–2, cộng quan sát phiên nghiệm thu N ít nhất 3 người. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## ngan-ban-ghi-giu-danh-tinh

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Người dùng mở và đóng ngăn bản ghi trong việc hằng ngày có thấy ngăn trượt ra vào liền mạch, không biến mất, không chớp, không trễ, mà dữ liệu trong ngăn vẫn đúng ngay khi mở không? | — | Quan sát trong phiên nghiệm thu với N=5 người (ghi lại lời người thử và số lần ngăn mở trống); telemetry không có sự kiện phía trình duyệt cho ngăn nên không có số máy. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu chung với ít nhất 5 người, mỗi người mở rồi đóng ngăn ít nhất 5 lần trên Thoả thuận và Mục tiêu ở cả máy tính lẫn điện thoại, 0 người nói ngăn «biến mất», «chớp» hay «mở chậm», và 0 lần ngăn vừa mở hiện ô trống hay số cũ phải tải lại mới đúng. | — | Quan sát trong phiên nghiệm thu với N=5 người (ghi lại lời người thử và số lần ngăn mở trống); telemetry không có sự kiện phía trình duyệt cho ngăn nên không có số máy. |
| CHẾT | máy soạn (ô trống) | Có từ 2 trên 5 người trở lên tự nêu ngăn biến mất, chớp hay chậm khi mở đóng, hoặc có ít nhất 1 lần ngăn vừa mở hiện dữ liệu trống hay cũ phải tải lại mới đúng. | — | Quan sát trong phiên nghiệm thu với N=5 người (ghi lại lời người thử và số lần ngăn mở trống); telemetry không có sự kiện phía trình duyệt cho ngăn nên không có số máy. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## nhap-truong-luc-tao

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | phiên nghiệm thu đầu tiên sau khi DA16 lên production, gộp chung buổi đọc số của gói truong-hop-dong. | Lịch đọc số chung của B7 |

## okr-cua-toi-tach-theo-doi

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | người mở «Của tôi» có còn thấy OKR không phải của mình lẫn trong danh sách chính không, và khi cần thì có tìm được mục mình đang theo dõi không? | (như cột giá trị) | chữ cũ của hồ sơ |
| SỐNG | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | ở lái-thử người-lạ, ≥ 4/5 người chỉ đúng đâu là mục tiêu của mình, đâu là mục đang theo dõi; ≥ 4/5 người tự mở được nhóm «Đang theo dõi» khi được hỏi về một mục mình theo dõi; 0 báo cáo «thấy OKR người khác trong Của tôi» trong 2 tuần sau khi giao. | (như cột giá trị) | chữ cũ của hồ sơ |
| CHẾT | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | lại có báo cáo thấy OKR người khác trong danh sách chính; hoặc ≥ 2/5 người không tìm thấy mục mình theo dõi vì nhóm gập sẵn. | (như cột giá trị) | chữ cũ của hồ sơ |
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | một vòng feature-loop T2 (đã giao 07/10). Đo trong 2 tuần sau khi giao. | Lịch đọc số chung của B7 |

## okr-loai-hoc-tap

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | đơn vị có dùng loại «Học tập» đúng chỗ, cho mục tiêu kiểm giả thuyết, và có ghi được điều học được khi đóng kỳ không? | (như cột giá trị) | chữ cũ của hồ sơ |
| SỐNG | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | kỳ OKR kế có ≥ 1 mục tiêu học tập đã công bố; 100% mục tiêu học tập có «Điều học được» khi kỳ đóng; không ai báo nhãn «Trượt» trên mục tiêu học tập. | (như cột giá trị) | chữ cũ của hồ sơ |
| CHẾT | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | sau một kỳ không đơn vị nào dùng loại này; hoặc ≥ 2 trường hợp (Kara hoặc người duyệt bắt được) chọn «Học tập» để né «Trượt» cho một mục tiêu thực chất là cam kết. | (như cột giá trị) | chữ cũ của hồ sơ |
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | một vòng feature-loop T2 (đã giao 08/10). Đo ở kỳ OKR kế. | Lịch đọc số chung của B7 |

## quyet-gop-y-noi-dung-ly-do

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | người quyết một góp ý bị từ chối vì lý do cố định có kể lại đúng lý do không. | (như cột giá trị) | chữ cũ của hồ sơ |
| SỐNG | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | ở lái-thử người-lạ trước R1, nhận một Căn chỉnh tới đích chưa công bố; người thử nói được «đích chưa công bố» và không bấm thử lại quá một lần. | (như cột giá trị) | chữ cũ của hồ sơ |
| CHẾT | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | người thử bấm thử lại nhiều lần hoặc nói «lỗi mạng». | (như cột giá trị) | chữ cũ của hồ sơ |
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | lái-thử người-lạ kế tiếp của dãy Kara OKR. | Lịch đọc số chung của B7 |

## soan-okr-khong-lac

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | lái-thử người-lạ kế tiếp của dãy Kara OKR. | Lịch đọc số chung của B7 |

## sort-moi-truong

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | gộp chung buổi đọc số của gói truong-hop-dong sau khi DA17, DA18 lên production. | Lịch đọc số chung của B7 |

## sua-sau-chay-that

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi bật, người viết và người duyệt Kho tài liệu có hết vấp các hạn chế đã gom (số bản chờ sai, ô chọn rỗng khi tải lỗi, mục lục lỗi ký tự, liên kết http lọt, câu tiếng Việt trên giao diện tiếng Anh) mà trợ lý kho vẫn trả lời đúng không kém trước không? | — | Quan sát trong phiên nghiệm thu với N=3 người đối chiếu bảng G1–G12 của design.md, cộng bảng kết quả do-bo-mau.ts so với _acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu với ít nhất 3 người viết hoặc duyệt trang Kho tài liệu, 0 người vấp lại mục nào trong G1–G12, và đo lại bộ 50 câu hỏi mẫu bằng do-bo-mau.ts trên bản đã bật không có câu đạt nào thành không đạt so với lượt đo đã ký (câu lỗi gọi model tách riêng). | — | Quan sát trong phiên nghiệm thu với N=3 người đối chiếu bảng G1–G12 của design.md, cộng bảng kết quả do-bo-mau.ts so với _acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md. |
| CHẾT | máy soạn (ô trống) | Có từ 2 người trở lên vấp lại cùng một mục trong G1–G12, hoặc bộ 50 câu hỏi mẫu có từ 2 câu trở lên chuyển từ đạt sang không đạt so với lượt đo đã ký (không kể câu lỗi gọi model). | — | Quan sát trong phiên nghiệm thu với N=3 người đối chiếu bảng G1–G12 của design.md, cộng bảng kết quả do-bo-mau.ts so với _acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## tac-nhan-va

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Người dùng mở màn tác nhân trên điện thoại có đọc được trạng thái và kết quả lượt chạy bằng tiếng Việt, và bộ dựng tác nhân có hỏi lại đúng lúc thay vì đứng im chờ một câu không ai được hỏi không? | — | Quan sát trong phiên nghiệm thu với N=3 người ở khổ 375 px, cộng truy vấn bảng hội thoại dựng đối chiếu câu hỏi đang chờ của phiên con với pendingQuestion của conversations.builderById; telemetry chỉ có sessions_failed và agent_error, không tách được ca treo im lặng. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu với ít nhất 3 người dựng hoặc xem tác nhân ở khổ điện thoại, 0 người gặp chữ máy tiếng Anh hay phải cuộn ngang, và trong 2 tuần sau khi bật truy vấn hội thoại dựng cho 0 hội thoại có phiên con đang chờ trả lời mà pendingQuestion rỗng. | — | Quan sát trong phiên nghiệm thu với N=3 người ở khổ 375 px, cộng truy vấn bảng hội thoại dựng đối chiếu câu hỏi đang chờ của phiên con với pendingQuestion của conversations.builderById; telemetry chỉ có sessions_failed và agent_error, không tách được ca treo im lặng. |
| CHẾT | máy soạn (ô trống) | Có ít nhất 1 hội thoại dựng thật treo im lặng vì câu hỏi lượt sau bị bỏ (phiên con chờ mà màn mở ô soạn), hoặc từ 2 người trở lên trong phiên nghiệm thu không đọc được kết quả lượt chạy trên điện thoại. | — | Quan sát trong phiên nghiệm thu với N=3 người ở khổ 375 px, cộng truy vấn bảng hội thoại dựng đối chiếu câu hỏi đang chờ của phiên con với pendingQuestion của conversations.builderById; telemetry chỉ có sessions_failed và agent_error, không tách được ca treo im lặng. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## the-gop-y-okr

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | người lạ có quyết được ba đề xuất mà không lúng túng không? | (như cột giá trị) | chữ cũ của hồ sơ |
| SỐNG | chuẩn hoá khuôn, giữ chữ | người lạ quyết đủ ba đề xuất trong một lượt lái thử mà không hỏi «bấm nút nào», 0 lần hộp đóng ngoài ý. | (như cột giá trị) | chữ cũ của hồ sơ |
| CHẾT | chuẩn hoá khuôn, giữ chữ | người lạ bấm nhầm «Bác» thay «Nhận», hoặc hộp đóng ngoài ý ≥ 1 lần. | (như cột giá trị) | chữ cũ của hồ sơ |
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | lái thử người lạ trong tuần sau khi gộp; đọc số cùng phiên nghiệm thu. | Lịch đọc số chung của B7 |

## them-buoc-bao-dung

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Người lập và theo dõi kế hoạch có biết vì sao không thêm được bước khi danh sách phòng ban tải lỗi, và có tin con số việc quá hạn trên Tổng quan khớp với danh sách bước của mình không? | — | Quan sát trong phiên nghiệm thu với N=3 người, cộng sự kiện api_error (route, status_code) có thật trong docs/telemetry.md để biết ngày danh sách phòng ban tải lỗi, đối chiếu báo cáo người dùng. |
| SỐNG | máy soạn (ô trống) | Trong phiên nghiệm thu với ít nhất 3 người quản lý kế hoạch, cả 3 xác nhận số «việc quá hạn» ở Tổng quan khớp danh sách bước của mình, và trong 2 tuần sau khi bật có 0 báo cáo «form thêm bước trống không biết vì sao» kể cả ngày có sự kiện api_error route /trpc/onboarding.listDepartments. | — | Quan sát trong phiên nghiệm thu với N=3 người, cộng sự kiện api_error (route, status_code) có thật trong docs/telemetry.md để biết ngày danh sách phòng ban tải lỗi, đối chiếu báo cáo người dùng. |
| CHẾT | máy soạn (ô trống) | Có ít nhất 1 người chỉ ra số việc quá hạn ở Tổng quan lệch danh sách bước, hoặc có báo cáo form thêm bước trống không lý do trong ngày có api_error route /trpc/onboarding.listDepartments. | — | Quan sát trong phiên nghiệm thu với N=3 người, cộng sự kiện api_error (route, status_code) có thật trong docs/telemetry.md để biết ngày danh sách phòng ban tải lỗi, đối chiếu báo cáo người dùng. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## thong-bao-mot-nguon-nhieu-kenh

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33) | Lịch đọc số chung của B7 |

## tieu-diem-sau-hop-xoa-tin-hieu

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn thay đề xuất kit tự sinh | Người dùng chỉ bằng bàn phím có huỷ hay gặp lỗi khi xoá tín hiệu rồi làm tiếp ngay ở đúng dòng mà không phải dò lại từ đầu trang không? | đã đạt «Trên production, bấm «Giữ lại» và ca xoá hỏng đều trả tiêu điểm về đúng nút ⋮ của dòng đó, đo bằng bàn phím ở 375 và 1280px (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa? | Quan sát trong phiên nghiệm thu có số người, theo đúng cách đo AC-6; docs/telemetry.md và schema.prisma không có gì ghi tiêu điểm hay thao tác bàn phím. |
| SỐNG | máy soạn thay đề xuất kit tự sinh | Trong một phiên nghiệm thu với ít nhất 2 người dùng thật chỉ dùng bàn phím trên production ở 375 và 1280px, mọi lần bấm «Giữ lại», Esc hay xoá hỏng đều để tiêu điểm ở nút ⋮ của đúng dòng và không ai phải bấm Tab từ đầu trang để quay lại. | Trên production, bấm «Giữ lại» và ca xoá hỏng đều trả tiêu điểm về đúng nút ⋮ của dòng đó, đo bằng bàn phím ở 375 và 1280px (ngưỡng đề xuất — chốt ở Cổng Đáng) | Quan sát trong phiên nghiệm thu có số người, theo đúng cách đo AC-6; docs/telemetry.md và schema.prisma không có gì ghi tiêu điểm hay thao tác bàn phím. |
| CHẾT | máy soạn thay đề xuất kit tự sinh | Trong phiên nghiệm thu có ít nhất một lần tiêu điểm rơi về đầu trang hay sang dòng khác sau «Giữ lại», Esc hay xoá hỏng, hoặc người thử phải dò lại để tìm dòng vừa thao tác. | chưa đạt «Trên production, bấm «Giữ lại» và ca xoá hỏng đều trả tiêu điểm về đúng nút ⋮ của dòng đó, đo bằng bàn phím ở 375 và 1280px (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox | Quan sát trong phiên nghiệm thu có số người, theo đúng cách đo AC-6; docs/telemetry.md và schema.prisma không có gì ghi tiêu điểm hay thao tác bàn phím. |
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33) | Lịch đọc số chung của B7 |

## trang-lo-trinh-mo-hinh-hien-thi

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Người xem trang Lộ trình trong CRM có thấy cùng một bức tranh mốc, việc chưa hẹn mốc và tên việc như LO-TRINH.html, đủ để không phải mở tệp kia ra đối chiếu không? | — | Đối chiếu tay hoặc bằng ca đối chiếu của AC-5 giữa trang production và khối dữ liệu của LO-TRINH.html sau mỗi lần vẽ lại, cộng quan sát trong phiên nghiệm thu với N=3 người. |
| SỐNG | máy soạn (ô trống) | Trong 2 tuần sau khi bật, mỗi lần LO-TRINH.html được vẽ lại sau một lần gộp, đối chiếu kiểu xem «Mốc» trên production cho 0 lệch về tập mốc, việc dưới mốc, tên hiển thị và nhóm «Chưa hẹn mốc», và ít nhất 2 trên 3 người xem trong phiên nghiệm thu trả lời đúng «mốc kế còn bao nhiêu việc» chỉ từ trang CRM. | — | Đối chiếu tay hoặc bằng ca đối chiếu của AC-5 giữa trang production và khối dữ liệu của LO-TRINH.html sau mỗi lần vẽ lại, cộng quan sát trong phiên nghiệm thu với N=3 người. |
| CHẾT | máy soạn (ô trống) | Có ít nhất 1 lần trang CRM và LO-TRINH.html nói khác nhau về mốc hay việc của cùng một lộ trình, hoặc cờ «khối chưa mang mô hình hiển thị» hay hộp «Trang có thể thiếu một phần» còn hiện trên production. | — | Đối chiếu tay hoặc bằng ca đối chiếu của AC-5 giữa trang production và khối dữ liệu của LO-TRINH.html sau mỗi lần vẽ lại, cộng quan sát trong phiên nghiệm thu với N=3 người. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## trang-thai-tin-hieu-song

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn thay đề xuất kit tự sinh | Người gửi tín hiệu có biết trong ngày khi tín hiệu của mình đổi chỗ và mở thông báo ra xem không? | đã đạt «Một tháng sau khi giao, người gửi nhận thông báo cho mọi lần tín hiệu đổi chỗ trong vòng một ngày (ngưỡng đề xuất — chốt ở Cổng Đáng)» chưa? | Bảng ThongBao với nguồn tin-hieu-doi-cho (taoLuc, docLuc, moLuc, nguoiNhanId) so với BanChupLoTrinh (sha, commitLuc), đọc qua lệnh đo của AC-8; docs/telemetry.md không có sự kiện cho thông báo. |
| SỐNG | máy soạn thay đề xuất kit tự sinh | Trong 2 tuần sau khi bật, mọi lần tín hiệu có người nhận hợp lệ đổi chỗ trên nhánh chính đều có thông báo trong vòng một ngày tính từ giờ commit, và ít nhất một nửa số thông báo đổi chỗ được người nhận mở. | Một tháng sau khi giao, người gửi nhận thông báo cho mọi lần tín hiệu đổi chỗ trong vòng một ngày (ngưỡng đề xuất — chốt ở Cổng Đáng) | Bảng ThongBao với nguồn tin-hieu-doi-cho (taoLuc, docLuc, moLuc, nguoiNhanId) so với BanChupLoTrinh (sha, commitLuc), đọc qua lệnh đo của AC-8; docs/telemetry.md không có sự kiện cho thông báo. |
| CHẾT | máy soạn thay đề xuất kit tự sinh | Trong 2 tuần sau khi bật, có lần đổi chỗ thiếu thông báo hay trễ quá một ngày, hoặc dưới một phần tư số thông báo đổi chỗ được mở. | chưa đạt «Một tháng sau khi giao, người gửi nhận thông báo cho mọi lần tín hiệu đổi chỗ trong vòng một ngày (ngưỡng đề xuất — chốt ở Cổng Đáng)» khi hết timebox | Bảng ThongBao với nguồn tin-hieu-doi-cho (taoLuc, docLuc, moLuc, nguoiNhanId) so với BanChupLoTrinh (sha, commitLuc), đọc qua lệnh đo của AC-8; docs/telemetry.md không có sự kiện cho thông báo. |
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | 2026-10-29 (mốc Tín hiệu và trang Lộ trình theo kit 2.33) | Lịch đọc số chung của B7 |

## truong-chuan-o-cai-dat

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | phiên nghiệm thu đầu tiên sau khi DA15 lên production, gộp chung buổi đọc số của gói truong-hop-dong sau DA17, DA18. | Lịch đọc số chung của B7 |

## truong-mot-cach-cu-xu

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | phiên nghiệm thu đầu tiên sau khi DA14 lên production, gộp chung buổi đọc số của gói truong-hop-dong sau DA17, DA18. | Lịch đọc số chung của B7 |

## truong-tep

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Nhân viên quan hệ đối tác có thật sự gắn hợp đồng vào bản ghi CRM và dùng bộ lọc «Chưa có tệp» để tìm bản ghi còn thiếu hợp đồng không? | — | Truy vấn bảng FieldFile (đếm tệp, bản ghi, người tải) và bảng trường theo kiểu FILE trên production, cộng quan sát trong phiên nghiệm thu với N=3 người; telemetry không có sự kiện cho trường Tệp. |
| SỐNG | máy soạn (ô trống) | Trong 2 tuần sau khi quản trị tạo một trường kiểu Tệp, truy vấn bảng FieldFile cho thấy ít nhất 10 tệp gắn vào ít nhất 5 bản ghi thoả thuận, công ty hay cá nhân khác nhau do ít nhất 2 người tải lên, và trong phiên nghiệm thu ít nhất 2 trên 3 người tự lọc ra được bản ghi «Chưa có tệp» mà không cần chỉ. | — | Truy vấn bảng FieldFile (đếm tệp, bản ghi, người tải) và bảng trường theo kiểu FILE trên production, cộng quan sát trong phiên nghiệm thu với N=3 người; telemetry không có sự kiện cho trường Tệp. |
| CHẾT | máy soạn (ô trống) | Hết timebox mà chưa quản trị nào tạo trường kiểu Tệp, hoặc bảng FieldFile có dưới 3 tệp hay chỉ một người tải, hoặc từ 2 trên 3 người trở lên trong phiên nghiệm thu không tìm được bộ lọc «Chưa có tệp». | — | Truy vấn bảng FieldFile (đếm tệp, bản ghi, người tải) và bảng trường theo kiểu FILE trên production, cộng quan sát trong phiên nghiệm thu với N=3 người; telemetry không có sự kiện cho trường Tệp. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## va-lo-ro-vai-chi-okr

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn thay đề xuất kit tự sinh | Sau khi vá, người vai «chỉ OKR» có còn bị giao việc kế hoạch hay nhận tên đối tác trong tin nhắc buổi sáng, trong khi vẫn nhận nhắc về KR của mình không? | đã đạt «Truy vấn production: không bước, kế hoạch hay lượt theo dõi đang mở nào thuộc người vai «chỉ OKR»» chưa? | Bảng member (role okr), OnboardingStep (assigneeId, completedAt), OnboardingPlan (ownerId, closedAt), OnboardingWatch (userId) và AgentTask kind nhac-ke-hoach (payload.daGui), đọc bằng _acceptance/va-lo-ro-vai-chi-okr/rang/ro-vai-chi-okr.mjs; docs/telemetry.md không có sự kiện theo vai. |
| SỐNG | máy soạn thay đề xuất kit tự sinh | Trong 2 tuần sau khi bật, thước ro-vai-chi-okr chạy trên production mỗi tuần đều ra 0 bước, kế hoạch hay lượt theo dõi đang mở thuộc người vai «chỉ OKR», không tin nhắc nào gửi tới họ có mục kế hoạch, và mỗi người vai đó có việc OKR đến hạn vẫn nhận ít nhất một tin nhắc. | Truy vấn production: không bước, kế hoạch hay lượt theo dõi đang mở nào thuộc người vai «chỉ OKR» | Bảng member (role okr), OnboardingStep (assigneeId, completedAt), OnboardingPlan (ownerId, closedAt), OnboardingWatch (userId) và AgentTask kind nhac-ke-hoach (payload.daGui), đọc bằng _acceptance/va-lo-ro-vai-chi-okr/rang/ro-vai-chi-okr.mjs; docs/telemetry.md không có sự kiện theo vai. |
| CHẾT | máy soạn thay đề xuất kit tự sinh | Trong 2 tuần sau khi bật, thước ra từ 1 vật đang mở trở lên thuộc người vai «chỉ OKR», hoặc có tin nhắc tới họ mang mục kế hoạch hay tên công ty, hoặc họ thôi nhận nhắc về KR. | chưa đạt «Truy vấn production: không bước, kế hoạch hay lượt theo dõi đang mở nào thuộc người vai «chỉ OKR»» khi hết timebox | Bảng member (role okr), OnboardingStep (assigneeId, completedAt), OnboardingPlan (ownerId, closedAt), OnboardingWatch (userId) và AgentTask kind nhac-ke-hoach (payload.daGui), đọc bằng _acceptance/va-lo-ro-vai-chi-okr/rang/ro-vai-chi-okr.mjs; docs/telemetry.md không có sự kiện theo vai. |
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | trước 14/10/2026 — ngày mọi phòng ban bắt đầu dùng thật. | Lịch đọc số chung của B7 |

## ve-khung-muc-tieu-dung-kr

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn thay đề xuất kit tự sinh | Trưởng đơn vị đi ‹ › qua KR của nhiều mục tiêu trong buổi Họp tuần có quay về đúng mục tiêu của KR đang xem mà không phải đóng ngăn và mở lại không? | đã đạt «Mở ngăn KR từ bảng Họp tuần, đi › sang KR của mục tiêu khác, bấm «Về khung mục tiêu»: khung mở đúng mục tiêu của KR đang xem» chưa? | Quan sát trong phiên nghiệm thu có số người ở buổi Họp tuần; okrCheckInSession với entry hop-tuan chỉ cho biết có dùng lối Họp tuần, còn docs/telemetry.md và schema.prisma không ghi lần bấm nút về hay khung đang mở. |
| SỐNG | máy soạn thay đề xuất kit tự sinh | Trong buổi Họp tuần thật đầu tiên sau khi bật, quan sát ít nhất 2 trưởng đơn vị đi ‹ › qua KR của từ hai mục tiêu trở lên, mọi lần bấm «Về khung mục tiêu» hay tên mục tiêu ở dòng phụ đề đều mở đúng mục tiêu và không ai phải đóng ngăn mở lại. | Mở ngăn KR từ bảng Họp tuần, đi › sang KR của mục tiêu khác, bấm «Về khung mục tiêu»: khung mở đúng mục tiêu của KR đang xem | Quan sát trong phiên nghiệm thu có số người ở buổi Họp tuần; okrCheckInSession với entry hop-tuan chỉ cho biết có dùng lối Họp tuần, còn docs/telemetry.md và schema.prisma không ghi lần bấm nút về hay khung đang mở. |
| CHẾT | máy soạn thay đề xuất kit tự sinh | Trong buổi Họp tuần quan sát có ít nhất một lần nút về hay tên mục tiêu mở nhầm mục tiêu hoặc chồng thêm khung, hoặc người chủ trì phải đóng ngăn để tìm lại mục tiêu. | chưa đạt «Mở ngăn KR từ bảng Họp tuần, đi › sang KR của mục tiêu khác, bấm «Về khung mục tiêu»: khung mở đúng mục tiêu của KR đang xem» khi hết timebox | Quan sát trong phiên nghiệm thu có số người ở buổi Họp tuần; okrCheckInSession với entry hop-tuan chỉ cho biết có dùng lối Họp tuần, còn docs/telemetry.md và schema.prisma không ghi lần bấm nút về hay khung đang mở. |
| Timebox | máy soạn (ô trống) | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | — | Lịch đọc số chung của B7 |

## viec-rieng-chi-nguoi-trong-cuoc

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | phiên nghiệm thu đầu tiên sau khi bản sửa lên production, gộp chung buổi đọc số ≈30/10 của làn M5. | Lịch đọc số chung của B7 |

## zalo-gui-hong-ghi-ly-do

| Ô | Loại | Giá trị đề xuất | Chữ cũ | Nguồn số |
|---|---|---|---|---|
| Câu hỏi | máy soạn (ô trống) | Sau khi bật, mỗi lần Zalo gửi hỏng hay tin vào bị bỏ qua, người vận hành có đọc được lý do từ đúng một dòng nhật ký để nối lại cho người dùng, và người hỏi qua Zalo có nhận lại được trả lời không? | — | Nhật ký production qua vercel logs -p crm-onehub-agent (dòng [zalo]) và thuộc tính zalo_questions theo kết quả (có khoá gui-hong) của sự kiện install_daily trong docs/telemetry.md. |
| SỐNG | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | lần «Gửi thử» kế tiếp sau khi gộp in một dòng nhật ký có mã HTTP và `description`/`error_code` của Zalo; mỗi tin webhook không sinh phiên in đúng một dòng mã nhánh; sự kiện `webhook-test` không còn ghi «sai khuon». | (như cột giá trị) | chữ cũ của hồ sơ |
| CHẾT | chuẩn hoá khuôn, giữ chữ (đã duyệt, không nhãn) | sau khi gộp còn một lần `sendMessage` hỏng mà nhật ký vẫn không có lý do của Zalo. | (như cột giá trị) | chữ cũ của hồ sơ |
| Timebox | Hỏi-4: đổi timebox | 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7) | hàng sửa nóng, trong ngày 08–09/10. | Lịch đọc số chung của B7 |
