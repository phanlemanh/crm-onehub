---
slug: khung-loi-ban-ghi-dung-ly-do
at: 2026-10-08T21:10:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | AC-2 FORBIDDEN đi qua máy chủ nhưng chỉ đo bằng lỗi viết tay trong bài DOM, không gắn cross-layer [soan-okr-khong-lac#F1] | Máy chủ thật trả mã khác (403 ngoài tRPC, hay NOT_FOUND do lọc theo workspace), lyDoLoi rơi về mất kết nối mà E2 vẫn xanh | Eval script trên phiên đo thật đọc data.code cho người không thuộc workspace | fixed: AC-1, AC-2 gắn cross-layer; thêm E9/E10 (script, backend-effect) trên phiên tien-de đọc error.data.code thật — người bị xoá dòng member gọi contacts.byId phải ra FORBIDDEN; auth.middleware.ts là middleware tRPC ném TRPCError FORBIDDEN |
| P1 | design | «Máy chủ đã trả đúng mã» mới có căn cứ ở contacts.service.ts; công ty, thoả thuận, kế hoạch, kế hoạch của công ty chưa kiểm | Service khác gói NotFoundException thành INTERNAL_SERVER_ERROR hay trả null, ba ngăn vẫn bảo kiểm tra kết nối mà E1 xanh | Script đọc data.code thật cho mỗi byId với id đã xoá | fixed: E9 đo contacts.byId, companies.byId, deals.byId, onboarding.planById (NOT_FOUND) và ghi mã thật của onboarding.plansOfCompany; design ghi căn cứ |
| P1 | evals | Lời hứa «về ngăn trước khi chồng ngăn» chỉ đo bằng số lần gọi close giả | close xoá cả chồng, mất ngăn công ty, E1 vẫn xanh | Bài DOM với chồng record=company:A,contact:B, so tham số record sau Đóng | fixed: E1 thêm ô chồng ngăn đo tham số record === "company:A" và đối chứng một ngăn; chiều đỏ ghim «klg: dong xoa ca chong» |
| P2 | contract | AC-4 bắt mục «Kế hoạch» hiện «Đóng» mà không nói đóng gì khi ngăn công ty vẫn sống | «Đóng» đóng cả ngăn công ty hay không làm gì, E4 vẫn xanh | Chốt việc của nút trong mục con | fixed: AC-4 ghi hai lý do đầu ở mục con KHÔNG có nút nào; design thêm coDong={false}; E4 đo không nút |
| P2 | evals | «Không in lỗi thô» chỉ đo âm tính, chiều đỏ không ghim | Khung in error.message ở chỗ khác chuỗi so, phép đo vẫn xanh | Bản sao in error.message, thông điệp ghim | fixed: chiều đỏ E1 ghim «klg: in loi tho» bằng bản sao in error.message trong khung |
