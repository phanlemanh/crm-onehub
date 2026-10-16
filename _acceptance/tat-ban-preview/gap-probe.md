---
slug: tat-ban-preview
at: 2026-10-16T01:40:00Z
verdict: findings
p0: 3
p1: 1
p2: 1
---

# Gap probe — tat-ban-preview

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | AC-5/E7 cần nhánh đã đẩy nhưng hợp đồng không khai đẩy lúc nào | S4 chạy trước khi đẩy, E7 trả mã 2 CHUA-DAY, S4 BLOCKED hoặc tự đẩy giữa chừng thành lượt chấm ngoài kế hoạch | Notes khai thứ tự đẩy nhánh, chờ 5 phút, rồi S4 | fixed: Notes của hợp đồng thêm dòng «Thứ tự S3 → S4» — đẩy MỘT lần sau S3, chờ 5 phút rồi mới sinh args S4 |
| P0 | contract | AC-5 lấy S là commit gần nhất chạm ba tệp, trong khi Vercel chỉ dựng commit ĐẦU của mỗi lần đẩy; E8 không có chiều đỏ cho đường tra lần đẩy | Nhánh đẩy một lần kèm commit hồ sơ sau S, không sự kiện push nào có after = S, E7 mã 2 mãi; hoặc đo trên S ra 0 deployment theo cấu tạo — xanh rỗng | Đo mọi commit đầu của lần đẩy có cây chứa ba tệp; E8 chạy cùng đường tra lần đẩy trên lần đẩy mốc 1723dca25 | fixed: AC-5, E7, E8 viết lại — E7 đo từng commit đầu (after) của các lần đẩy có cây chứa ba tệp; E8 dùng CÙNG timLanDay + trienKhaiCho trên lần đẩy 2026-10-16T00:58:49Z e12f6e6b3 → 1723dca25 (đã kiểm activity API trả lần đẩy này) |
| P0 | contract | Dòng sổ d-3 (lối A) ghi mot-loi trong khi câu hỏi hai máy kia ở #375 còn mở — lựa chọn chỉ người có ghi thành máy quyết | Cổng Phạm vi ký lối A không thấy câu #375; máy khác đang xem Preview mất chỗ xem trước sau gộp mà không ai được hỏi | Dòng sổ mới supersedes d-3, nguồn chi-nguoi, lên thẻ thành câu Hỏi | fixed: dòng sổ d-20261016T013339Z-7 supersedes d-3, nguồn chi-nguoi, khuyến nghị lối A; câu trả lời #375 ghi lên thẻ |
| P1 | evals | E11 hỏi vế (4) Ignored Build Step và vế (5) DATABASE_URL tuỳ chọn không có trong Then của AC-7; vế (5) ngược Out of scope | Docs đúng hợp đồng không nhắc DATABASE_URL, hội đồng FAIL vế (5) | Mỗi vế E11 trỏ về một mệnh đề AC-7 | fixed: AC-7 thêm mệnh đề «không câu nào khuyên Ignored Build Step theo VERCEL_ENV»; bỏ vế (5) khỏi question và expected của E11 |
| P2 | contract | AC-1 đòi đúng hai khoá đỉnh cho cả apps/agent-okr/vercel.json mà Out of scope cấm sửa tệp này | Nếu tệp agent-okr có khoá khác, E1 đỏ và vòng kẹt | Đọc tệp trước Cổng Phạm vi | rejected: đọc origin/onehub 16/10 — apps/agent-okr/vercel.json chỉ có $schema và git.deploymentEnabled, và phép thử cũ của nó đã đòi đúng hai khoá này (.strict()) |
