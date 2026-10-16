# Điểm quyết định ở Cổng Phạm vi — thu-haiku-tro-ly-okr

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — model kho đo mang sẵn (d-6) | 2 nhánh rẽ (Gemini 3.8 Flash / Haiku 5.5) | cần hình: `hai-cau-hoi` |
| Hỏi-2 — trần token Haiku và lease (d-11 thay d-7) | 2 nhánh rẽ (4 000 + lease 30 s / lease theo model) | cần hình: `hai-cau-hoi` |
| Bỏ khoá suy nghĩ Anthropic (d-10 thay d-3) | 1 lối, dưới ngưỡng | dưới ngưỡng: 1 |
| Không gieo kho test (d-5) | 1 lối, dưới ngưỡng | dưới ngưỡng: 1 |
| Bỏ design-pass, bỏ đặc tả UX (d-8, d-9) | không màn | dưới ngưỡng: 0 |

## Đề bài hình `hai-cau-hoi`

- Loại: cây quyết định hai câu, mỗi câu hai nhánh, mỗi nhánh một hệ quả.
- Nút: «Hỏi-1: kho đo mang model nào?» → «Gemini 3.8 Flash (khuyên)» → «agent chính và Tác nhân trên kho đo chạy đúng model mặc định anh muốn; lượt so đo Tác nhân trên cả hai» · → «Haiku 5.5» → «rẻ hơn, nhưng mọi phép đo khác trên kho đo chạy Tác nhân chưa từng đo trên Haiku».
- Nút: «Hỏi-2: trần Haiku và lease?» → «4 000 token, lease 30 s (khuyên)» → «lượt so cho thấy lease có cắn: hong:het-lease đếm riêng trong bảng» · → «lease theo model, 60 s cho Haiku» → «đụng packages/db và API, phạm vi lớn hơn».
- Nhãn chữ thường, tiếng Việt; AC liên quan: AC-5 (Hỏi-1), AC-2 và AC-7 (Hỏi-2).
