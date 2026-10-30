# Hình tại điểm quyết định — cham-bo-do-chiu-cau-loi

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 · trần câu lỗi 5% số câu của lượt, tối thiểu 1 (d-…-3) | 3 nhánh rẽ (không lỗi · dưới trần · vượt trần) | `luot-cham.html` |
| Hỏi-2 · đổi lời AC-1, AC-6, AC-7, AC-12 của F12 (d-…-4) | dưới ngưỡng: 1 bước, không rẽ | — |
| Gap-probe xử lý `human-gate1` | 0 | — |

## Đề bài `luot-cham`

- Loại: flowchart (luồng quyết định) một trang.
- Nút: «Tệp chấm từng câu của lượt» → «Đủ mã? (không trùng, không thiếu)» — không → «Mã 2: KHONG DO DUOC trung/thieu ma» · có → «Đếm câu lỗi n, trần t = max(1, floor(N×5/100))» → «n > t?» — có → «Mã 2: KHONG DO DUOC n cau loi vuot tran t; không hỏi lại» · không → «Chấm 4 chỉ số trên câu còn lại + dòng "cau loi model: n/N … tran t"» → «Vùng xám? → hỏi lại một lần» → «Mã 0 đạt / 1 không đạt; ghi bản ghi».
- Nhãn bằng chữ tiếng Việt như trên; ví dụ số ở góc: N = 96 → t = 4; bộ tạm N = 70 → t = 3.
- Đánh dấu nhánh mới của vòng (trước đây mọi n ≥ 1 đều ra mã 2).
- AC liên quan: AC-1, AC-2, AC-3, AC-4, AC-5.
