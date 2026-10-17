---
slug: tra-cuu-thuong-hieu-viet-nam
at: 2026-10-16T05:33:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-5 ghi máy quyết ngôn ngữ mô tả, nhưng câu trích chỉ quyết chỗ đặt hằng số; mô tả tiếng Việt ship tới cả người xem en [neo-thuoc-het-han#F1] | Người xem en bấm Tra cứu lại, mô tả thành tiếng Việt cạnh ô quốc gia tiếng Anh; Cổng Phạm vi không thấy lựa chọn này | Dòng sổ chỉ-người thay d-5, ghi rõ ở Out of scope | human-gate1: d-20261016T053428Z-11 thay d-5 thành câu hỏi; Out of scope ghi người xem en thấy mô tả tiếng Việt |
| P0 | design | Dòng sổ d-10 ghi một-lối khi bỏ dịch tên ngành, nhưng bảng dịch theo mã ngành dựng và đo được ngay [mau-trang-thai-chung#F3] | Dòng phụ hiện «Hoa Kỳ · Technology» nửa Việt nửa Anh; người duyệt tưởng máy không làm được | Dòng sổ chỉ-người có lối khác và giá | human-gate1: d-20261016T053428Z-12 thay d-10 thành câu hỏi; Out of scope nêu hệ quả |
| P1 | evals | Bộ fetch giả không ghim khuôn SDK; schema raw dựng trên khuôn tự dựng; ca raw hỏng nuốt lỗi | Phản hồi thật có null, raw thật không qua schema, AC-7 lặng lẽ không thay gì | Fixture satisfies kiểu SDK, ca mọi trường null, lỗi parse có thông điệp ghim | fixed: E6 khai satisfies BrandRetrieveResponse; E8 thêm ca «mau du truong co null» và ca raw hỏng ghi «brand raw unreadable:» có đối chứng dương |
| P1 | evals | AC-2 hứa cùng câu nhưng E5 đo chứa chuỗi từ tệp thông điệp khác; E11 không đọc câu của ngăn | Câu ngăn viết khác, E5 vẫn xanh, AC-2 sai | E5 so bằng chuỗi của cùng một hàm; E11 đọc thêm tệp ngăn | fixed: AC-2 ghi một hàm thông điệp; E5 so toBe với hàm trong companyMessages; E11 thêm company-sheet.tsx vào inputs và câu hỏi |
| P1 | contract | Out of scope nói công ty từ email là thật, nhưng AC-5 bỏ qua tra mọi tên miền nền tảng kể cả công ty từ email | Người duyệt tin công ty linkedin.com vẫn có logo; thực tế bị bỏ qua | Ghi hệ quả vào Out of scope, ca đo ở E6 | fixed: Out of scope ghi hệ quả; d-20261016T053428Z-13 ghi vì sao (tách nguồn cần migration T3); E6 thêm ca nv@linkedin.com |
