---
slug: rang-khung-trang-mo
at: 2026-10-31T11:59:41Z
verdict: findings
p0: 1
p1: 1
p2: 2
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Thu «hình theo màn» của câu giao về «đầu trang» là việc chỉ người có (phải ký lại AC-3, AC-17 của khung-man-chung), mà sổ ghi máy quyết | Cổng Phạm vi duyệt chữ «mọi page.tsx», vòng xong, năm trang mới vẫn tự dựng khung chờ KhungCho… mà không ai chọn điều đó | Dòng sổ chỉ-người kèm khuyến nghị và lối khác; trường feature giữ câu giao nguyên văn | human-gate1: d-2 thay bằng câu hỏi Hỏi-1 (dòng supersedes d-20261031T115536Z-2); feature trả về câu giao; Out of scope ghi chờ Hỏi-1 |
| P1 | evals | Không eval nào chứng bài chạy trong bun run test; E7 suy từ vị trí tệp | Turbo hay script lọc mất tệp, răng không chạy ở CI và pre-push mà E1–E8 vẫn xanh | Chạy lệnh suite của gói app và đòi dòng ktm trong đầu ra | fixed: thêm E9 (cmd suite_app_ui, đòi dòng «ktm: n trang …» trong đầu ra, thiếu là FAIL) |
| P2 | evals | paths của E2, E3, E5, E8 thiếu apps/app/app/**/*.tsx dù ca đọc trang thật | PR sau đổi tai-lieu/page.tsx, E3 không bị coi là cũ | Khai bao đóng: lối quét chỉ đi theo nhập dưới apps/app/app (nhapCucBo), nên apps/app/app/**/*.tsx là đủ | fixed: thêm apps/app/app/**/*.tsx vào bốn eval |
| P2 | design | Vùng tệp lệch lời Bối cảnh của ô cơ hội | Dãy khác tạo tệp ở test/support hay fixtures, hai PR giẫm nhau | Khai vùng qua lệnh của đợt, ghi một dòng sổ | fixed: hang vung đã khai ba tệp mới (lệnh báo không chồng); dòng sổ approach ghi chỗ lệch chữ |
