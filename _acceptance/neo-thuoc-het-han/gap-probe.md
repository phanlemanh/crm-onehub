---
slug: neo-thuoc-het-han
at: 2026-10-15T02:02:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-20261015T020031Z-1 ghi nguồn muc-tieu nhưng câu trích chỉ kể một ca ở hồ sơ khác, không quyết luật neo cặp gộp và không chọn cặp f2acca7f1 hay 100847e8a | Một PR sau mang thêm phần của vòng so-okr thì cặp f2acca7f1 bỏ sót, E23/E25 xanh trên tập thiếu mà người duyệt không thấy đó là lựa chọn | Thay câu trích bằng câu luật neo của thuoc-khong-tu-het-han; thêm dòng mot-loi chứng PR #162 và #145 là toàn bộ vòng | fixed: dòng d-20261015T020328Z-6 thay dòng 1, trích AC-6 của thuoc-khong-tu-het-han («mốc cố định (sha PR) thay cho origin/onehub»); dòng d-20261015T020328Z-7 (mot-loi) ghi git log --first-parent chỉ ra một commit gộp mỗi hồ sơ |
| P1 | evals | E5 so evals.yaml, config.yaml và cap-nhat-tuan-okr từ mốc nền tới HEAD, không lọc theo commit vòng — tự mắc lỗi neo trôi | Gộp onehub có commit ghim cap-nhat-tuan-okr hay đổi khoá config thì E5 đỏ dù vòng không chạm | So từng commit của vòng với cha; đối chứng cây tạm có commit ngoài vòng cho đầu ra giống hệt; đồng bộ danh sách cho phép với AC-6 | fixed: AC-6 và E5 so C^..C của từng commit vòng, thêm đối chứng bất biến, PRODUCT-MAP.md và LO-TRINH.html vào AC-6 |
| P1 | contract | AC-7 đòi mọi suite đạt kỳ vọng mà ca app-rieng của agent-okr đỏ sẵn ở đường nền | Lượt ghim ghi repin-do, E6 in GHIM DO, vòng kẹt S4 mà Cổng 1 không biết | Khai phụ thuộc cho người duyệt thấy | fixed: dòng sổ d-20261015T020328Z-8 (revisit) khai lượt ghim chạy cả bảy suite, chạy lại một lần, đỏ hai lần thì chờ tran-cho-app-rieng của r2·P0 |
| P1 | evals | Vế đọc nội dung ở f2acca7f1 bằng git show không có chiều đỏ; commit giả của E2 chỉ sửa đại một dòng | Răng đọc cây làm việc vẫn xanh E2, sau đó PR sau thêm vi phạm thật vào tệp okr thì E23 trôi | Commit giả chèn vi phạm vào tệp thuộc cặp và sửa SQL migration thuộc cặp; đối chứng bản sao đọc cây làm việc phải lệch | fixed: AC-1, AC-2 và E2 đổi commit giả; E2 thêm đối chứng 2 (bản sao readFileSync phải lệch) |
| P2 | evals | Vế «ref cặp gộp không giải được thì KHONG DO DUOC mã 2» của AC-3 không có eval | Clone nông thì script ném stack trace mã 1, Ngoài-2 tuyên gỡ mà chưa đo | Ca sha không tồn tại: mã 2, KHONG DO DUOC, không stack trace | fixed: AC-5 và E4 thêm đột biến ref-thieu |
