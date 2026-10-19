---
slug: e24-qua-han-khong-phai-ha-tang
at: 2026-10-15T13:05:00Z
verdict: findings
p0: 1
p1: 2
p2: 1
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Ca trộn (có lượt quá hạn, các lượt còn lại hỏng vì model hay tác tử) là lựa chọn chỉ người có, nhưng sổ ghi d-20261015T120624Z-1 nguồn muc-tieu; câu trích chỉ nói ca mọi lượt quá hạn. Cùng lớp với [thuoc-tro-ly-okr-khong-lot#F1] | Gateway chập chờn: 19 lượt lỗi model nhanh, 1 lượt treo; bản nháp ra KHONG DAT mã 1, sự cố hạ tầng thành hồi quy độ trễ, mất dòng lỗi model | Câu Hỏi trên thẻ Cổng Phạm vi, dòng sổ mới thay d-1 | human-gate1: thành Hỏi-1 (d-20261015T120940Z-6 supersedes d-1), soạn theo khuyến nghị — chỉ quá hạn hết mới là trễ; AC-1, AC-2, ma trận E2 sửa theo |
| P1 | evals | Không eval nào đo vế hongMs vào p50/p90 và vế «dòng luot qua không thêm điều kiện trượt» | Thợ cứ có lượt quá hạn là in KHONG DAT mã 1, bỏ qua p50/p90; E1, E2 vẫn xanh | E1 khớp p50/p90 bằng 30000 và mọi dòng SAI chỉ là dòng ngưỡng | fixed: E1 đòi 'p50 30000 ms', 'p90 30000 ms' và mọi dòng 'SAI ' chứa p50 hoặc p90 |
| P1 | evals | Vế Then của AC-2 (mã 2, «khong phai do tre», dòng lỗi model) không có eval mức lệnh trong hồ sơ này | Nối cờ quaHan làm mất dòng lỗi model của đường chặn sớm; E2 vẫn xanh | Một ca chạy thật khoá sai, hạn 180 s | fixed: thêm E3 (qua-han.mjs --khong-qua-han) chạy do-tre thật, đòi mã 2, 'khong phai do tre' và dòng lỗi model |
| P2 | evals | Bản trước vòng chép do-tre của 1be143a82 nhưng nhập phien-tro-ly của cây; thư mục bản sao không nói suy từ đâu | Bản lai đo một phiên bản không có thật | Chép cả hai tệp của cùng sha, thư mục suy từ vị trí script, in băm | fixed: mỗi bản sao kèm phien-tro-ly.mjs của chính sha đó, đặt ở .acceptance-runs/eqh-*/x/ (cùng độ sâu với rang/), gốc kho suy từ import.meta.dirname, in băm git từng tệp |
