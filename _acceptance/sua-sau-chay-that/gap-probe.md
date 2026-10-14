---
slug: sua-sau-chay-that
at: 2026-10-14T05:30:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ d-20261014T045425Z-5 ghi một-lối cho việc bỏ liên kết http khi dán, trong khi lối «bỏ nhưng báo cho người viết» vẫn sống [cay-can-chinh-co-ly-do#F2] | Dán tài liệu cũ có 20 liên kết http: chữ còn, liên kết mất, không ai báo — hạn chế gốc G6 chỉ chuyển từ lúc đọc sang lúc dán; E6 vẫn xanh | AC-6 thêm vế dòng báo số liên kết đã bỏ; E6 thêm ca dán 2 liên kết http có dòng báo chứa số 2 và đối chứng chỉ https không có dòng báo | fixed: dòng sổ mới supersedes d-5 với căn cứ mục-tiêu (trích Ngoài-11 của kho-tai-lieu: «không cảnh báo»); AC-6, design G6, E6 đã thêm dòng báo và đối chứng |
| P1 | evals | E13 không gắn bằng chứng với mã trợ lý: paths thiếu mã trợ lý, expected chỉ khớp băm bộ câu | Đo ở S3 trước khi xong G9; evidence cũ vẫn khớp băm bộ câu nên E13 xanh trên trợ lý chưa sửa, và lượt ghim không chạy lại nó | Thêm mã trợ lý vào paths; expected đối chiếu băm mã trợ lý với HEAD; chiều đỏ sửa một byte tệp trợ lý thì exit 1 ghim tên tệp | fixed: E13 thêm paths mã trợ lý, vế băm mã trợ lý và chiều đỏ; kế hoạch chạy do-bo-mau ở task cuối của S3 |
| P1 | evals | Ngăn lỗi gọi model của E13 không có trần | Một bản sửa làm đường trả lời ném lỗi, 30 câu thành lỗi model, danh sách lùi rỗng nên E13 xanh | Trần số câu lỗi model không vượt số của lượt đã ký; chiều đỏ ba câu đạt thành lỗi model thì exit 1 ghim ba mã | fixed: E13 thêm trần bằng số câu lỗi của lượt đã ký và chiều đỏ ba câu |
| P1 | evals | Bỏ design-pass dựa vào E14 nhưng E14 chỉ chụp 3 trên 10 trạng thái UX | Dòng báo lỗi mới qua bài dom nhưng bị che hay lệch trên màn thật, Cổng Bằng chứng không có ảnh | Thêm bước ui-check cho các trạng thái còn lại | fixed: E14 thêm ST-soan-http và ST-tai-sai-loai (5 bước); deferred: năm trạng thái lỗi tải đo bằng bài dom, dòng revisit trong sổ nêu giá |
| P1 | evals | AC-9 đi qua máy chủ nhưng chỉ có bài dom với dữ liệu dựng tay | Bên ghi lưu sẵn câu tiếng Việt vào hàng thì màn tiếng Anh vẫn hiện tiếng Việt mà E9 xanh | Gắn cross-layer cho AC-9; thêm eval backend-effect đọc qua thủ tục API khẳng định trả mã chứ không trả câu chữ | fixed: AC-9 gắn (cross-layer) và thêm vế máy chủ trả mã; thêm E9b backend-effect, E9 dựng dữ liệu từ đầu ra của E9b |
