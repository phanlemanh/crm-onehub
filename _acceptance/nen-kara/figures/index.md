# Hình tại điểm quyết định — nen-kara (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 Giữ Confirmation cho card, inline trên Item | ba bước nối tiếp (bỏ Confirmation → confirmation.tsx mồ côi → cổng mo-coi đỏ + AC-12 the-gop-y-okr hỏng) + hai nhánh | cần hình: `hai-do-day.html` |
| d-…-2 Mặc định density = inline, hai màn cũ ghi card | hai nhánh (màn mới quên prop / màn cũ) — chung một hình với điểm trên | cần hình: `hai-do-day.html` |
| d-…-3 Bỏ design-pass (hình dạng đã duyệt ở /proto/gop-y-dung-cho) | dưới ngưỡng: 1 bước | — |
| d-…-4 Không đổi màn thật nào | dưới ngưỡng: 1 bước | — |
| [GIẢ ĐỊNH] mặc định inline | trùng d-…-2 | `hai-do-day.html` |
| [GIẢ ĐỊNH] tên thành phần | dưới ngưỡng: 1 bước | — |
| [GIẢ ĐỊNH] Hoàn tác chỉ gọi onUndo | dưới ngưỡng: 1 bước | — |

## Đề bài `hai-do-day`

- Loại hình: kiến trúc thành phần (layer/tree), một trang.
- Nút: `ProposedChange` (packages/ui) rẽ hai nhánh theo `density`: **inline (mặc định)** → thân `Item` (không viền) → dùng bởi: màn mới của `gop-y-dung-cho`, `tu-vung-tac-tu`; **card** → thân `Confirmation` (AI Elements) → `Alert` có viền → dùng bởi: cột góp ý OKR `okr/the-gop-y.tsx`, thông tin liên hệ `crm/facts.tsx` (ghi `density="card"`). Cả hai nhánh khi đã quyết → `ProposedChangeReceipt` «Đã … · Hoàn tác».
- Nhánh phụ đứt nét «nếu bỏ Confirmation»: confirmation.tsx mồ côi → cổng `mo-coi.mjs` đỏ + AC-12 hồ sơ đã ký `the-gop-y-okr` hỏng.
- Nhãn bằng tiếng Việt, tên kỹ thuật giữ nguyên. AC liên quan: AC-1, AC-2, AC-3, AC-4, AC-10.
