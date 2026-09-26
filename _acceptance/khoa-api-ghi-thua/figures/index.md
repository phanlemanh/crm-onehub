# Hình tại điểm quyết định — khoa-api-ghi-thua

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 vá trong kho bằng bun patch (luồng xác minh khoá trước/sau bản vá) | ba bước nối tiếp (evaluateRateLimit → consumeRateLimit → claimUsageInDatabase) + hai nhánh rẽ (tuỳ chọn có/vắng; lastRequest mới/cũ) | luong-xac-minh-khoa |
| d-…-2 ngưỡng là tuỳ chọn ở phía kho | dưới ngưỡng: 1 bước | — |
| d-…-3 ngưỡng 1 phút | dưới ngưỡng: 1 lựa chọn | — |
| d-…-4 bỏ đóng dấu updatedAt | dưới ngưỡng: 1 bước | — |
| d-…-5 UPDATE thường qua ngưỡng | dưới ngưỡng: 1 bước | — |
| [GIẢ ĐỊNH] Vercel cài bằng bun theo bun.lock | dưới ngưỡng: 1 điều kiện | — |

## Đề bài hình `luong-xac-minh-khoa`

- Loại hình: flowchart hai làn so sánh «Bản gốc 1.6.25» và «Có bản vá (tuỳ chọn 1 phút)».
- Nút: Yêu cầu có `x-api-key` → đọc hàng `apikey` (SELECT) → kiểm bật/hết hạn → `evaluateRateLimit` (rate-limit tắt) → [bản gốc] UPDATE lastRequest → UPDATE updatedAt → phiên; [bản vá] rẽ: lastRequest null hoặc cũ ≥ 1 phút → UPDATE lastRequest → phiên; lastRequest mới < 1 phút → không ghi → phiên.
- Nhãn: «2 lần ghi mỗi lượt» ở làn gốc; «0 lần ghi trong 1 phút, 1 lần khi quá» ở làn vá; khoá tắt/hết hạn → 401 ở cả hai làn.
- AC liên quan: AC-1, AC-2, AC-3, AC-5.
