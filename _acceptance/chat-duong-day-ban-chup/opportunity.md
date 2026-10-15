---
schema_version: 1
slug: chat-duong-day-ban-chup
feature: Chỉ onehub đẩy được bản chụp lộ trình lên CRM; đường REST khác giữ trần thân 100 KB
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: LT1d
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng LT1d của «OKR» (`docs/plan/lo-trinh-okr.json`).

Chỉ onehub đẩy được bản chụp lộ trình lên CRM; đường REST khác giữ trần thân 100 KB

Câu giao trên hàng (bản của điều phối): «Máy chủ chỉ nhận thân yêu cầu lớn ở đúng đường nhận bản chụp lộ trình, và một lượt chạy tay từ nhánh chưa gộp không đổi được lộ trình trên trang».

Vì sao: Gốc: _acceptance/lo-trinh-doc-ban-chup/ — Ngoài-8 (trần thân 2 MB áp cho mọi đường REST, kể cả người chưa đăng nhập) và Ngoài-11 (chạy tay từ nhánh chưa gộp làm trang hiện lộ trình chưa duyệt) ở Cổng Bằng chứng LT1c 15/10; chủ kho chọn «mở hợp đồng mới», mở luôn.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] sau khi lên production, lộ trình trên trang có luôn là lộ trình của nhánh chính, và có đường nhận dữ liệu nào ngoài đường bản chụp còn nhận yêu cầu lớn không?
- Kết quả nào là SỐNG: [đề xuất] trong 14 ngày đầu: mọi bản chụp CRM đang giữ mang mã commit nằm trên onehub; không lượt «Bản chụp lộ trình» nào chạy từ nhánh khác mà đẩy được; một yêu cầu thử 150 KB không khoá tới một đường REST khác của production nhận 413.
- Kết quả nào là CHẾT: [đề xuất] có một bản chụp mang commit không nằm trên onehub, hoặc một đường REST khác nhận yêu cầu quá 100 KB.
- Timebox: [đề xuất] 14 ngày kể từ ngày gộp vào onehub; đọc số bằng một lệnh so mã commit của bản chụp với onehub và nhật ký Actions của workflow.

**Máy khuyến nghị:** `build`, ngưỡng như trên. Hạng T2 (không chạm khoá API, xác thực hay CSDL). Ước 6–7 tiêu chí. Dựng sau khi LT1c gộp onehub.

## Thước đo thành công → ứng viên criterion

1. Đường nhận bản chụp vẫn nhận khối lộ trình thật (~216 KB) và thân tới 2 MB; quá 2 MB bị từ chối 413 như hôm nay.
2. Mọi đường REST khác từ chối thân quá 100 KB bằng 413 — kể cả khi người gửi chưa đăng nhập; thân dưới 100 KB đi tiếp như trước.
3. Lỗi 413 ở hai loại đường cùng một dạng, để kịch bản đẩy đọc được như hôm nay.
4. Hai con số trần sống ở cấu hình, không rải trong mã.
5. Lượt Actions chạy từ nhánh khác onehub: kịch bản đẩy từ chối TRƯỚC khi gọi CRM, lượt đỏ, câu báo nêu nhánh đã chạy và vì sao; CRM không nhận lời gọi nào.
6. Lượt từ onehub — tự chạy khi gộp hay bấm tay — đẩy như hôm nay.
7. `docs/api.md` ghi hai luật mới ở mục «Bản chụp lộ trình».

## Out of scope từ khám phá

- Đường bản chụp vẫn đọc thân tới 2 MB trước khi kiểm khoá — chỉ một đường, đúng cỡ của khối lộ trình; chặn sớm hơn là một việc riêng.
- Lượt trả «cũ hơn» vẫn xanh — sau khi chặn nhánh, «cũ hơn» chỉ còn do hai lượt onehub đua nhau, và hàng đợi của workflow đã xếp chúng nối tiếp.
- Chạy kịch bản đẩy bằng tay trên máy người với khoá thật — ngoài Actions, không chặn.
- Trần thân của các đường nhận `/internal/*` (đã có trần riêng) và của tRPC thường.
