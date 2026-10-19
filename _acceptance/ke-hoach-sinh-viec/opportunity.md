---
schema_version: 1
slug: ke-hoach-sinh-viec
feature: Tạo kế hoạch onboard từ khuôn là có sẵn việc cho từng phòng ban; deal thắng thì máy gợi ý mở kế hoạch
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-14T05:44:32Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA3
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA3 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).

Tạo kế hoạch onboard từ khuôn là có sẵn việc cho từng phòng ban; deal thắng thì máy gợi ý mở kế hoạch

Vì sao: Odoo, Salesforce, Pipedrive đều để kế hoạch mẫu sinh việc thường; bước 30 ngày là loại việc thứ hai cần gỡ.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau hai tuần dùng thật, kế hoạch onboard tạo từ khuôn có chạy bằng việc có người làm ngay từ lúc tạo, và deal thắng có dẫn tới một kế hoạch được mở kịp không?
- Kết quả nào là SỐNG: Trong 14 ngày đầu dùng thật: (a) ít nhất 70% việc sinh từ khuôn ở các kế hoạch tạo trong cửa sổ được người thực hiện chuyển khỏi «Chưa làm» trước hoặc trong ngày hạn; và (b) mọi deal chuyển sang giai đoạn thắng của công ty chưa có kế hoạch mở đều sinh một gợi ý, và ít nhất 50% gợi ý đó được người xử lý (mở kế hoạch hoặc bỏ qua) trong 3 ngày.
- Kết quả nào là CHẾT: Dưới 70% ở vế (a), hoặc có deal thắng đủ điều kiện mà không có gợi ý, hoặc dưới 50% gợi ý được xử lý trong 3 ngày (gợi ý thành tiếng ồn).
- Timebox: Đọc số sau 14 ngày dùng thật kể từ ngày DA3 gộp vào onehub.

Hàng DA3 của lộ trình không khai `bat_khi`; ngưỡng trên do máy đề xuất. Mốc so hôm nay (đọc mã `origin/onehub` c4b46acd6): bước sinh từ khuôn có 0 người nhận lúc tạo (`onboarding.service.ts:413`, mọi bước `assigneeId = null`), kế hoạch không gắn deal, và chưa có móc nào khi deal thắng (`deals.service.ts:638`). Vế (a) đo người nhận có xử lý việc chứ không đo «việc có người thực hiện», vì mục từ điển «Việc» bắt buộc đúng một người thực hiện nên số đó luôn là 100% và không đỏ được (cùng lý do đã đổi ngưỡng DA1). Vế (b) đòi gợi ý là một bản ghi có trạng thái, để đếm được.

Tách 14/10 (luật cỡ hợp đồng): hồ sơ này đo vế (a). Vế (b) đo ở hồ sơ `goi-y-mo-ke-hoach` (hàng DA3b), cùng ngưỡng đã ký ở đây (sổ d-20261014T061219Z-15).

## Nguồn quyết định Cổng Đáng

Chủ kho gõ ở phiên thợ DA3 (máy M5) ngày 14/10/2026: «Cổng Đáng ke-hoach-sinh-viec: build · ngưỡng: theo đề xuất máy (a ≥70%, b mọi deal thắng có gợi ý + ≥50% xử lý trong 3 ngày) · đo 14 ngày từ ngày gộp». `decided_at` là giờ phiên thợ ghi lại lời đó.
