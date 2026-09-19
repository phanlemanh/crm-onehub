# Điểm quyết định chờ ký — kê và đếm

Ngưỡng N5: từ **ba bước nối tiếp** hoặc **hai nhánh rẽ** thì cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| `d-…-1` cắm thước vào lệnh cổng, hay ghi giới hạn có tên | 1 nhánh rẽ, 2 lối | dưới ngưỡng: 1 |
| `d-…-2` đổi khối `rang` thành danh sách khối | 1 nhánh rẽ, 3 lối | dưới ngưỡng: 1 |
| `d-…-3` **nhận chi phí ghim-lại cho hồ sơ đã ký** | **chuỗi năm bước nối tiếp: thước sống trong hồ sơ → khai vào `gate-shape.json` → bộ chạy gọi trong `@crm/ui#test` → `pre-push` và CI chặn được → nhưng `gate-shape.json` nằm trong `paths` eval của một hồ sơ ĐÃ KÝ → bằng chứng của hồ sơ đó hoá cũ, phải ghim lại** | **cần hình** → `duong-toi-cong-va-cai-gia` |
| `d-…-4` tách bài kiểm + tu chính AC-7 lần hai | 1 nhánh rẽ, 2 lối | dưới ngưỡng: 1 |
| `d-…-5` bỏ đặc tả UX vì không chạm UI | 1 nhánh rẽ, 2 lối | dưới ngưỡng: 1 |

Không dòng `[GIẢ ĐỊNH]` nào trong `## Coverage`. Không finding gap-probe nào để
lại `human-gate1` — cả năm đã sửa vào artifact.

## Đề bài hình `duong-toi-cong-va-cai-gia`

- **Loại hình**: sơ đồ luồng một chiều trái sang phải, có một nhánh rẽ ở cuối.
- **Nút, đúng năm bước nối tiếp**:
  1. *Thước sống trong thư mục hồ sơ* — `mot-duong.mjs`
  2. *Khai vào bản khai cổng* — `.githooks/gate-shape.json`
  3. *Bộ chạy gọi nó* — `rang-chat.spec.ts` trong `@crm/ui#test`
  4. *Lệnh cổng chặn được* — `bun run test` và `pre-push`
  5. *Chỗ gọi thứ mười không đẩy qua được nữa* — lời hứa AC-6 thành thật
- **Nhánh rẽ ở bước 2**, vẽ rõ là cái giá: `gate-shape.json` nằm trong `paths`
  eval của hồ sơ `nen-chat-ai-elements`, hồ sơ đó **đã ký** tại
  `verified_commit: 6a8c8e99` → sửa tệp làm bằng chứng của nó **hoá cũ** →
  phải chạy **ghim lại** (`repin-lane.mjs`).
- **Nhãn bằng chữ** trên nhánh rẽ: "hồ sơ đã ký · bằng chứng hoá cũ · phải ghim lại".
- **Một ô chú dưới bước 5**: "trước vòng này, bước 2 đến 4 không tồn tại — thước
  chỉ chạy khi có người gõ tay".
- **AC liên quan**: bước 1–5 → AC-3; nhánh rẽ → AC-4 và AC-12.
- Không vẽ kiến trúc, không vẽ cây thư mục. Một hình, một ý: **con đường từ một
  script trong hồ sơ tới một cái cổng chặn được, và cái giá phải trả trên đường**.
