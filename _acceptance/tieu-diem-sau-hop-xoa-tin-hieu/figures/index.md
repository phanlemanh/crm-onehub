# Hình tại điểm quyết định — tieu-diem-sau-hop-xoa-tin-hieu

| Điểm | Đếm | Hình |
|---|---|---|
| d-20261024T065710Z-1 đích tiêu điểm khi đóng hộp | 3 nhánh (Giữ lại · Esc · xác nhận) | cần hình → `luong-tieu-diem` |
| d-20261024T065710Z-3 hộp đóng ngay, chờ ở nút ⋮ dòng đang xoá | nối tiếp 3 bước (xác nhận → chờ → kết quả) | cùng hình `luong-tieu-diem` |
| d-20261024T065710Z-4 + d-20261024T070103Z-9 xoá hỏng để yên / xoá xong tới dòng kế khi người dùng đã tự dời | 2 nhánh (hỏng · xong) × 2 (đã dời · chưa dời) | cùng hình `luong-tieu-diem` |
| d-20261024T065710Z-2 trả tiêu điểm tại trang, không sửa hộp chung | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-20261024T065710Z-5 không gắn xuyên lớp | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-20261024T065710Z-7 không sửa ca mất mạng kéo dài | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-20261024T070103Z-8 bỏ bản mẫu thiết kế (Hỏi) | dưới ngưỡng: 2 lối, 0 bước nối | — |

## Đề bài `luong-tieu-diem`

- Loại hình: sơ đồ luồng (flowchart) trái → phải, một màn.
- Nút: «Nút ⋮ của dòng X» → «Hộp hỏi xoá» → ba nhánh: «Giữ lại / Esc» → «Tiêu điểm: nút ⋮ dòng X» (AC-1); «Xác nhận» → «Chờ máy chủ — tiêu điểm: nút ⋮ dòng X» (AC-4) → hai nhánh: «Xoá xong» → «Tiêu điểm: nút ⋮ dòng kế» (AC-5, kể cả khi người dùng đã tự dời); «Xoá hỏng (vừa lấy về / mất mạng)» → «Câu vì sao được đọc; tiêu điểm: nút ⋮ dòng X, hoặc yên chỗ người dùng đã dời» (AC-2, AC-3, AC-4).
- Nhãn bằng chữ tiếng Việt, mã AC nhỏ cạnh nút; tô nổi nhánh mới của vòng này (Giữ lại/Esc, chờ, xoá hỏng), nhánh xoá xong ghi «như TH6 đã ký».
- AC liên quan: AC-1, AC-2, AC-3, AC-4, AC-5.
