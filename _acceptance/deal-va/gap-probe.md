---
slug: deal-va
at: 2026-10-08T15:50:54Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Không eval nào nối đầu ra thật của `list_deals` với bộ đọc của app; đầu vào E5, E6 viết tay theo khuôn bên đọc; E4 không nói gọi qua công cụ đã đăng ký [d-20261008T111629Z-11] | Đầu ra công cụ đi qua lớp bọc và mất `stageId`; E4 gọi thẳng hàm nên xanh, E5 E6 tự dựng đầu vào nên xanh; bản ghi thật không có `stageId`, Ngoài-7 còn nguyên | Gọi `list_deals` qua đường công cụ, đưa đầu ra qua `dealListResultOf`, khẳng định `stageId` còn; chiều đỏ ở lớp bọc công cụ | fixed: AC-4 hứa đầu ra thật của công cụ (`execute` và `toModelOutput`) đọc qua `dealListResultOf` của app vẫn giữ `stageId`; E4 thêm round-trip qua default export của `tools/list_deals.ts` và chiều đỏ ở `toModelOutput` |
| P1 | contract | Ngưỡng CHẾT «màu ở danh sách khác màu cùng giai đoạn trên Kanban» không có đường đo; AC-6 chỉ ghim tone tuyệt đối | Kanban tô theo bảng màu khác; E6 xanh vì đúng `info`; phiên nghiệm thu thấy hai màu khác nhau cho cùng giai đoạn | AC hứa quan hệ cùng tone với Kanban; so `data-tone` từng cặp, đối chứng ba tone khác nhau | fixed: AC-6 thêm quan hệ với chip `DealStageMenu` của thẻ Kanban; E6 dòng 8 so ba cặp `data-tone`, đối chứng ba tone đôi một khác nhau; Đường đo thêm dòng cho ngưỡng CHẾT |
| P2 | evals | Có lời hứa nhìn bằng mắt nhưng không eval `ui-check`; E6 chạy jsdom | Chấm có trong DOM nhưng không hiện ở màn chat (cỡ 0, bị cắt) hoặc màn chat không chọn bảng này; Cổng 2 chỉ có bằng chứng lớp mã | `ui-check` trên phiên đo, hỏi Kara, đọc `getComputedStyle` từng chấm, chụp 375 và 1440 | deferred: lớp nhìn thấy đo ở phiên nghiệm thu (Đường đo dòng 1); một `ui-check` cần cuộc gọi Kara thật hoặc gieo bản ghi eve, giá lớn hơn rủi ro vì chấm dùng lại nguyên `StatusIndicator` mà thẻ Kanban đang hiện trên production |
| P2 | evals | E2 dòng 4 so tổng với `db.deal.count()` không neo vào cách đếm của rollup; fixture không có thoả thuận ở giai đoạn tự tạo đã lưu trữ | Fixture dùng chung có thoả thuận rollup vốn loại → dòng 4 đỏ dù đúng; hoặc người cài lọc `archivedAt: null` làm rơi thoả thuận ở giai đoạn lưu trữ mà E2 không thấy | Dòng 4 thành quan hệ với cách đếm cũ trên cùng fixture; thêm thoả thuận ở giai đoạn WON tự tạo đã lưu trữ | fixed: dòng 4 so với tổng `deal.groupBy({ by: ["stage"] })` cùng lượt; rejected phần thoả thuận ở giai đoạn đã lưu trữ — trạng thái không tồn tại: lưu trữ một giai đoạn còn thoả thuận bắt chuyển hết sang giai đoạn sống (AC-8 của `danh-sach-keo-chung`) |
| P2 | evals | E7 hứa không đổi kỳ vọng nhưng chỉ đo thoát 0 | Người cài nới hay xoá một khẳng định cũ để AC-5 xanh, E7 vẫn thoát 0, E13 E14 của hồ sơ đã ký mất bảo vệ | Ghim không có dòng `expect(` nào bị xoá trong bốn tệp kiểm trừ khối được thay | fixed: AC-7 hứa thêm điều đó; E7 chạy `rang/khong-xoa-expect.mjs` trước bộ kiểm — chỉ cho xoá hai dòng của ca `deals_by_stage` cũ, có `--tu-thu` |
