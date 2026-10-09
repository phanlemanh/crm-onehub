---
slug: agent-test-khong-nhap-app
at: 2026-10-08T20:41:49Z
verdict: findings
p0: 0
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | AC-5 và E5 chỉ đo `deal-va`; hai hồ sơ có tên trong ô cơ hội (`soan-okr-cung-tro-ly`, `tro-ly-okr-tom-tat`) và mọi hồ sơ khác bị diff làm cũ không có phép đo | Một hồ sơ khác bị cũ, E5 xanh vì chỉ lọc `deal-va`; Cổng 2 ký rồi lưới chặn gộp; hai hồ sơ có tên vẫn đỏ ở lượt ghim kế | 0 dòng «evidence is stale» cho mọi slug; liệt hồ sơ cần ghim, có tên hai hồ sơ kia | fixed: AC-5 mở ra mọi hồ sơ lưới báo cũ cộng `deal-va` và hai hồ sơ có tên; E5 đòi 0 dòng cũ cho mọi slug và dòng ghim của ba hồ sơ nằm trên nhánh này |
| P1 | contract | «App đọc bằng đúng hàm đó» là quan hệ mà E3 đo bằng chuỗi; E4 bỏ qua `dealListResultOf` [soan-okr-khong-lac#F1] | App giữ schema riêng dưới tên khác hoặc có bước tháo lớp bọc; E3, E4 vẫn xanh | Ma trận bốn đầu vào qua `dealListResultOf` phải bằng hệt `parseDealListResult`; chiều đỏ là schema riêng | fixed: AC-3 hứa quan hệ; E3 (A) so bốn cặp kết quả; design ghi `dealListResultOf` không tháo lớp bọc nào hôm nay |
| P1 | contract | Không eval nào khẳng định parse giữ mọi trường bên ghi xuất; fixture E2 rút từ test phía đọc | Schema gói thiếu một trường, Zod lặng lẽ bỏ, thẻ thoả thuận hiện ô trống mà mọi eval xanh | Quan hệ parse(đầu ra thật) giữ nguyên mọi trường | fixed: AC-4 và E4 so từng khoá của `dealListItem.shape` giữa giá trị đã parse và đầu ra thật, chiều đỏ bỏ trường `currency`; fixture E2 giữ tay (gói không có cơ sở dữ liệu) vì E4 đã đi trên bên ghi thật |
| P2 | contract | Timebox đọc ở «lượt CI đầu tiên» trong khi CI chưa chạy luật kho | Gộp xong không lượt nào chạy `do-cay.mjs`, ngưỡng không có số | Chạy tay trên sha gộp, ghi run-log, có hạn | fixed: ô cơ hội và Đường đo đổi thành một lần chạy tay trên sha gộp trong ngày gộp, ghi vào `run-log.jsonl` của hồ sơ |
