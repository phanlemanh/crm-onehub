# Kế hoạch — viec-cha-khong-lo-tieu-de (DA2b)

Hợp đồng: `_acceptance/viec-cha-khong-lo-tieu-de/contract.md` (duyệt 14/10) · thiết kế:
`docs/superpowers/specs/2026-10-14-viec-cha-khong-lo-tieu-de-design.md`. Ba việc nối tiếp, làm tuần tự; chiều
đỏ nằm trong lịch sử: commit bài kiểm đứng trước commit sửa.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| (chưa khác — bài kiểm đỏ trên mã hiện tại, ghi chiều đỏ) | `apps/api/test/viec-cha-an.spec.ts` | E1–E6 (sáu bài kiểm của AC-1…AC-6) |
| Người làm việc con không còn thấy tên việc cha riêng; số việc con trên thẻ chỉ đếm việc thấy được | `apps/api/src/viec/viec-bang.service.ts` | AC-1…AC-6 |
| Tài liệu API nói đúng luật mới của bảng và khung việc con | `docs/api.md` | — (tài liệu đi kèm) |

## Task 1 — bài kiểm trước (đỏ)

- Files: `apps/api/test/viec-cha-an.spec.ts` (mới), `_acceptance/config.yaml` (sáu khoá `vca_*`, đã thêm ở S1).
- Phục vụ: E1, E2, E3, E4, E5, E6. `independent: false`.
- Verify: `bun run test -- "cd apps/api && bun test test/viec-cha-an.spec.ts"` trên mã chưa sửa → đỏ với thông
  điệp ghim của từng eval (`vca: cha lo vca-mt-c`, `vca: bang lo cha`, `vca: dem con lo …`,
  `vca: bang lech khung vca-kk-a`, `vca: quet lo viec.con`); `vca-tinh-luc-doc` dừng ở `vca: fixture cha chua an`.
  Ghi kết quả vào sổ (S3) rồi commit riêng.

## Task 2 — sửa câu đọc (xanh)

- Files: `apps/api/src/viec/viec-bang.service.ts`.
- Phục vụ: E1–E6. `independent: false` (sau Task 1).
- Cách làm: `con` trong `chonBang()` thêm `where: dieuKienXemViec(userId)`; hàm `chaThay()` đọc một lần các mã cha
  thấy được qua `dieuKienXemViec`, `chaRa()` trả `null` cho cha ngoài tập — dùng ở `bang()` và `con()`.
- Verify: cùng lệnh Task 1 → xanh cả sáu; `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test
  test/viec-con.spec.ts test/viec-bang.spec.ts"` vẫn xanh (DA2 không lùi); `bunx tsc -p apps/api --noEmit`.
  Đột biến tay cho vế gắn-lại của E5 (giới hạn đã khai): tạm lưu trạng thái ẩn → E5 đỏ `vca: gan lai khong hien
  cha`, rồi hoàn lại; ghi kết quả vào sổ.

## Task 3 — tài liệu

- Files: `docs/api.md` (đoạn «Bảng và việc con»).
- Phục vụ: không eval (tài liệu đi kèm). `independent: false`.
- Verify: đọc lại đoạn văn; không lệnh.
