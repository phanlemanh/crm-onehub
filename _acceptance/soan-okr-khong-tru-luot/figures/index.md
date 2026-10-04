# Hình tại điểm quyết định — soan-okr-khong-tru-luot (Cổng 1)

| Điểm | Đếm | Hình |
|---|---|---|
| Giữ chỗ rồi hoàn lượt ở cửa (sổ d-1, d-2, d-7, d-8) | 4 bước nối tiếp + 5 nhánh rẽ | cua-hoan-luot |
| Phạm vi: lượt đã tới Trợ lý rồi mới hỏng (`turn.failed`, sổ d-3, gap-probe F2) | 3 bước nối tiếp (POST nhận → luồng → turn.failed) | cua-hoan-luot (cùng hình, nhánh ngoài phạm vi tô khác) |
| Bỏ design-pass (d-4) | dưới ngưỡng: 1 bước | — |
| Giữ chữ «Trợ lý OKR» (d-5) | dưới ngưỡng: 0 nhánh | — |
| Tệp kiểm mới (d-6) | dưới ngưỡng: 0 nhánh | — |

## Đề bài: cua-hoan-luot

- Loại: flowchart (luồng quyết định), dọc.
- Nút: «Người gửi lượt» → «Cửa: tính lượt (giữ chỗ, soLuot +1)» → «Cửa: chuyển tới Trợ lý (chờ tối đa choTroLyMs)» → rẽ: (a) Trợ lý nhận (2xx, dùng được) → «Lượt tính» ; (b) không nối được / quá hạn / 4xx / 5xx / 2xx không dùng được → «Cửa hoàn 1 lượt → màn: lý do + «Lượt này không bị tính»» ; (c) người dùng tự huỷ → «Không hoàn» ; từ (a) nhánh nét đứt «Trợ lý hỏng trong luồng (turn.failed)» → «Vẫn tính — NGOÀI lượt này, Cổng 1 quyết».
- Nhãn bằng chữ tiếng Việt; AC liên quan: AC-1, AC-2, AC-3, AC-4; nhánh ngoài phạm vi ghi «Out of scope».
