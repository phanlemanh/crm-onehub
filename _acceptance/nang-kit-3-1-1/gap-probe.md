---
slug: nang-kit-3-1-1
at: 2026-11-24T14:46:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ d-5 ghi nguồn muc-tieu bằng câu trích của hồ sơ khác (chuyen-cho-delivery-loop-3-0); câu ấy quyết cho vòng kia, không quyết vòng này chép lớp cùng PR hay tách PR [sua-bom-gio-test-api#F1] | Người ký tưởng đã có lời chọn sẵn, không xét lối tách PR | Dòng mới supersedes d-5, nguồn mot-loi với loi_chet nêu được | fixed: dòng d-20261124T144716Z-8 supersedes d-5, nguồn mot-loi — tách PR để kho chạy hai bản luật giữa hai lần gộp và tốn thêm một vòng |
| P1 | contract | AC-4 không miễn chính hồ sơ này và LO-TRINH.html, mà hồ sơ này chứa chữ v3.0.0 | E4 đỏ trên vật thật; muốn xanh phải nới bộ lọc sau Cổng 1 | Miễn mọi _acceptance/<slug>/ và hai view máy vẽ; thêm đối chứng thấy chữ trong contract của vòng mà không báo | fixed: AC-4 miễn mọi thư mục hồ sơ, PRODUCT-MAP.md và LO-TRINH.html; E4 thêm đối chứng ấy |
| P1 | evals | E5b miễn mọi VIOLATION [PR]; không eval nào chạy lưới chế độ PR như acceptance.yml, nên lời «gộp được ngay» của Hỏi-1 chưa có bằng chứng | Lưới PR báo hồ sơ chuyen-cho mà E5/E5b vẫn xanh | Bỏ miễn [PR]; thêm eval chạy pre-merge-check chế độ PR trên HEAD | fixed: AC-5 thêm vế lưới chế độ PR; E5b bỏ miễn [PR] và thêm ca đỏ cho hồ sơ khác vòng; thêm E5c (rang/luoi-pr.mjs) |
| P1 | evals | Vế suite của AC-7 không có eval đo | Suite đỏ vì lớp chép mà AC-7 vẫn đạt | Thêm eval so ca đỏ suite tip với nhánh chính | fixed: bỏ vế suite khỏi AC-7 — lượt chấm S4 tự chạy feature_loop.suite_keys mỗi lượt và verdict theo đó; Coverage ghi rõ |
| P2 | contract | Bốn mục Out of scope không có dòng descope | Cổng 1 duyệt mục cắt không có lý do và giá | Mỗi mục một dòng descope | fixed: bốn dòng d-20261124T144716Z-9 tới -12 |
