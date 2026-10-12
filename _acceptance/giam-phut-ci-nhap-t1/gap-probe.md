---
slug: giam-phut-ci-nhap-t1
at: 2026-10-11T01:50:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E6 so đa tập lệnh gồm cả bước `ci-ok` (bước này buộc phải đổi), và E4 kỳ vọng 9 ô xanh trong khi công thức của chính nó cho 7. Cùng lớp với [giam-phut-acceptance#F1]. | Mã đúng thiết kế, E6 báo «thừa/mất lệnh ci-ok» ở push và PR, E4 đếm 7 khác 9 — S4 REJECT dù mã đúng. | E6 bỏ bước `ci-ok` khỏi đa tập (E4 đo nó), chỉ đòi `ci-ok` chạy; thêm chiều đỏ «echo la» vào `check`; E4 kỳ vọng 7, liệt kê sẵn. | fixed: AC-6 và E6 loại bước `ci-ok` khỏi đa tập, thêm chiều đỏ «thừa lệnh»; E4 kỳ vọng 7 ô liệt kê sẵn |
| P0 | contract | AC-11/E11 đòi «ba ô `test`» bị bỏ qua trên lượt thật; GitHub xét `if` cấp job trước khi bung ma trận nên chỉ hiện MỘT job `test (${{ matrix… }})`. | Lượt nháp đúng, E11 không thấy ba ô theo tên, thoát 1 — S4 REJECT dù mã đúng. | Đòi mọi job tên bắt đầu `test` đều skipped và có ít nhất một; đối chứng dương cách khớp tên trên lượt PR sẵn sàng thật trước vòng (ra ba ô). | fixed: AC-11 và E11 sửa theo thước đề xuất, đối chứng dương trên lượt ci.yml của PR #366 |
| P1 | evals | Mô phỏng E6 thiếu luật `success()` ngầm cho `if` không có hàm trạng thái, và thiếu ngữ cảnh `ready_for_review`. | Bỏ `!cancelled()` khỏi `build` thì GitHub bỏ qua `build` khi push `onehub`, E6 vẫn xanh; bỏ `ready_for_review` khỏi `types` thì `gh pr ready` sau lần đẩy cuối không chạy job nặng, PR gộp khi `check`/`test` chưa từng chạy. | Viết luật `success()` ngầm vào E6; thêm ngữ cảnh thứ tám `ready_for_review`; hai chiều đỏ tương ứng. | fixed: AC-6 nêu luật và tám ngữ cảnh; E6 thêm hai chiều đỏ; Notes sửa cho khớp |
| P1 | evals | Chuỗi thay bởi chỉ đo có mặt, không round-trip qua luật của kit. | Kit không nhận khuôn con trỏ → ghim lại hai hồ sơ cũ đỏ sau Cổng Bằng chứng, E8 vẫn xanh. | Gọi chính luật của kit trên cây thật và trên bản sao đặt hồ sơ này `signed-off`; đối chứng dương với tiền lệ `ci-ma-tran-ba-o/E5`. | fixed: AC-8 và E8 gọi `chungThayBoi` của `lib/evidence-core.cjs` (khuôn `<hồ sơ>#AC-<n>` đúng regex của kit); cây thật chưa ký → lý do duy nhất `ho-so-thay-chua-ky`; bản sao đã ký → qua mọi điều kiện trước `ac-thay-khong-con-eval` |
| P1 | contract | Đường đo: ngưỡng «lượt T1 ≤ 8» không có dòng in; ngưỡng ≤ 42 là tổng hai workflow nhưng E9 tính từng workflow; «E5» trỏ sai (đúng là E6). Lớp [thuoc-7-ngay-loc-pr#F1]. | Bảy ngày sau gộp ci 25′ + Acceptance 20′ = 45 (giữa), dòng ngưỡng so 25 với 42 in SỐNG; lượt T1 9′ không dòng nào in. | Dòng ngưỡng trên tổng hai workflow gộp theo nhánh; dòng T1 theo `ly_do=chi-t1`; đối chứng dương ≈ 58 trên 02–08/10; chiều đỏ 25+20 không ra SỐNG, T1 9′ ra CHẾT. | fixed: AC-9 và E9 sửa theo thước đề xuất; Đường đo sửa E5 → E6 |
