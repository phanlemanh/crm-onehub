# Hình tại điểm quyết định — giam-phut-ci-nhap-t1

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 bỏ TURBO_FORCE khỏi vòng | dưới ngưỡng: 1 bước, không rẽ | — |
| d-2 job phân loại riêng ở mỗi workflow | cần hình: 4 nhánh rẽ (push · nháp · chỉ T1 · sẵn sàng) × 3 bước nối (phân loại → job nặng → ci-ok) | luong-job |
| d-3 khai năm eval cũ thay bởi | dưới ngưỡng: ánh xạ 5 → 4, không bước nối, không rẽ (bảng ở design.md) | — |
| d-4 giữ acceptance gate ở nháp | gộp vào hình luong-job (nhánh «nháp») | luong-job |
| d-5 bỏ đặc tả UX | dưới ngưỡng: 0 bước | — |
| [GIẢ ĐỊNH] +1 phút phân loại mỗi workflow | gộp vào hình luong-job (ghi phút trên nút phân loại) | luong-job |

## Đề bài: luong-job

- Loại hình: flowchart / swimlane hai làn (ci.yml · acceptance.yml).
- Nút: sự kiện (push onehub/release/main · PR nháp · PR sẵn sàng chỉ T1 · PR sẵn sàng khác, gồm ready_for_review) → «phân loại PR» (bỏ qua khi push; ~1 phút) → nhánh nặng/nhẹ → job nặng (ci: check + test 3 ô; acceptance: lệnh dựng + agent-okr chỉ PR) → ci-ok (chỉ ci.yml); «acceptance gate» chạy ở MỌI ngữ cảnh.
- Nhãn bằng chữ: «nặng» / «nhẹ», «bỏ qua (0 phút)», «hỏng → chạy đủ, ci-ok đỏ».
- Phút ước mỗi lần đẩy: PR nặng ≈ 47 (45 + 2 phân loại); PR nháp/T1 ≈ 6 (ci: phân loại 1 + ci-ok 1; acceptance: gate ~3 + phân loại 1); push onehub không đổi.
- AC liên quan: AC-1, AC-3, AC-4, AC-5, AC-6.
