# Hình tại điểm quyết định — kara-khong-ghi-de-truong

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 — lối A (xuất xứ) hay lối B (chặn ô có giá trị) | 2 nhánh rẽ, mỗi nhánh 3 bước nối tiếp (phiên → ô → cờ) | cần hình: `hai-loi.html` |
| Hỏi-2 — bỏ hay dựng đường đo sau gộp | 2 nhánh rẽ, không bước nối tiếp | gộp vào chú thích của `hai-loi.html` (một dòng), không vẽ riêng |

## Đề bài `hai-loi`

- Loại hình: cây quyết định hai nhánh, mỗi nhánh một luồng ghi.
- Nút gốc: «Kara gọi set_field_value lên một ô».
- Nhánh B (khuyên): phiên có người hay nền (isAutomated) → ô trống hay có giá trị → có `replace: true` không → ghi / từ chối. Bốn lá: ô trống → ghi; có người + có giá trị + không cờ → từ chối, nói giá trị hiện có; có người + cờ → ghi; nền + có giá trị → luôn từ chối.
- Nhánh A: ô có giá trị → ai đặt (người · Kara · nạp tin đăng) → của người thì từ chối, của Kara thì Kara được làm mới. Nhãn phụ: «cần migration, T3, Cổng 1.5».
- AC liên quan: AC-1 đến AC-6 (nhánh B).
