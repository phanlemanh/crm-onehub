---
slug: okr-cua-toi-tach-theo-doi
at: 2026-10-07T10:36:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

# Gap probe — okr-cua-toi-tach-theo-doi

Phản biện context sạch: một tác tử tươi chỉ đọc design doc, contract, evals, sổ quyết định và gói bài học xuyên feature (claim-scan, 12 dòng).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Đột biến E3 «xét following trước idsCuaToi» không có chỗ bám trên chữ ký chiaCuaToi(ds, idsCuaToi) đã chốt | S3 phải lệch design hoặc viết đột biến tuỳ ý, E15 thoát 1, AC-2 mất chiều đỏ thật | Đột biến theo chữ ký đã chốt: dangTheoDoi từ okrFollow riêng không trừ idsCuaToi → T1 ở cả hai | fixed: E3 viết lại đột biến (d) đúng như đề xuất; E15 ánh xạ lại |
| P1 | contract | Không nêu hồ sơ đã ký nào hứa hành vi gom theo dõi vào okr.mine | Eval đã ký đỏ ở recheck strict, merge bị chặn mà Cổng 1 không biết | grep _acceptance tìm eval đã ký đọc okr.mine, ghi hướng xử lý từng cái | fixed: Notes nêu cap-nhat-tuan-okr AC-9/E17 (test đọc objectives) — đổi một khẳng định sang dangTheoDoi + ghim lại hồ sơ đó; bốn hồ sơ khác đã tra, chỉ sửa fixture; dòng sổ approach |
| P2 | evals | E1 chỉ quét cong-bo/da-bo trong khi Trục B khai bốn trạng thái | status === cong-bo lọt qua, mục tiêu nháp của U biến khỏi bảng chính | E1 thành 2 × 4 = 8 dòng + đột biến === cong-bo có thông điệp riêng | fixed: E1 8 dòng, so tập status với TRANG_THAI_MUC_TIEU; E2 gieo M1 ở nháp; đột biến (b) |
| P2 | contract | Vế «không KR nào trong nhóm mang dấu của tôi» của AC-5 đúng theo định nghĩa, khẳng định âm không đối chứng [tro-ly-kho-dung-phien#F1] | Xanh cả khi danhDauCuaToi bị bỏ qua; hoặc phải dựng dữ liệu không tồn tại | Bỏ vế, hoặc ghim bộ chọn kèm đối chứng dương | fixed: bỏ vế khỏi AC-5 và E7 |
| P2 | evals | Chiều đỏ của E4 mượn đột biến E1 nhưng E15 không chạy lệnh ctt_da_bo trên bản đột biến | Lệnh E4 có thể không bao giờ đỏ mà evidence vẫn ghi có chiều đỏ | E15 ánh xạ đột biến → mọi lệnh nó phải làm đỏ, đếm cặp | fixed: E15 bảng ánh xạ 8 cặp, đột biến (a) chạy cả ctt_chia lẫn ctt_da_bo |
