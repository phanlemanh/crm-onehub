# Hình tại điểm quyết định — t1-ma-doc

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — khối `apps/**` `packages/**` nguyên, hay glob hẹp theo quy ước eve | 2 nhánh rẽ → cần hình | `phan-loai.html` (nửa trái) |
| Hỏi-2 — pre-push in một dòng khi nặng vì `t1_ma_doc`, hay im | 2 nhánh rẽ → cần hình | `phan-loai.html` (nửa phải) |
| gap-probe P1–P2 | đã sửa trong artifact, không còn là điểm quyết định | — |

## Đề bài `phan-loai`

- Loại hình: flowchart (luồng quyết định), một hình, hai vùng chú thích Hỏi-1 và Hỏi-2.
- Nút: «Tệp của PR / lần đẩy» → «khớp t1_skip_globs?» (không → «nặng: có tệp mã») → «khớp t1_ma_doc?» (không → «nhẹ: bỏ test, build») → «nặng: tệp T1 mà mã đọc».
- Nhánh Hỏi-1 trên nút «khớp t1_ma_doc?»: lối khuyên «apps/** packages/** nguyên khối — 0/465 PR 90 ngày bị ảnh hưởng» · lối kia «chỉ prompt eve + bộ quét — README gói ở lại nhẹ».
- Nhánh Hỏi-2 trên nút «nặng: tệp T1 mà mã đọc» ở đường pre-push: lối khuyên «in một dòng: có tệp T1 mà mã đọc (…) — chạy đủ năm bước» · lối kia «im như lần đẩy có mã».
- Nhãn bằng chữ Việt có dấu, không mã máy làm chủ ngữ; AC liên quan: AC-1, AC-2, AC-3, AC-6.
