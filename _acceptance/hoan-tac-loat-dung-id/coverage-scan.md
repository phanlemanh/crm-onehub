# Coverage scan — hoan-tac-loat-dung-id

## Ngữ cảnh
- Sản phẩm: CRM nội bộ OneHub, ba bảng cá nhân · công ty · thoả thuận — chân sản phẩm: đào repo (`apps/api/src/crm/bulk.ts`, `apps/api/src/{contacts,companies,deals}/*.service.ts` hàm `archive`/`restore`/`bulkArchive`/`bulkRestore`, ba `*.contracts.ts` schema kết quả hàng loạt, `apps/app/components/crm/bulk-actions.tsx` của V2 `baoLuuTruLoat`/`baoHoanTacLoat`, `CONTEXT.md` mục Lưu trữ / Đã lưu trữ) · chân ngành: Nielsen Norman Group «10 Usability Heuristics» #9 (thông báo lỗi bằng ngôn ngữ người dùng, nói đúng vấn đề) và #3 (hoàn tác là lối thoát khẩn cấp — thoát đúng chỗ mình vào, không kéo theo việc của người khác); Material Design 3 «Snackbar» (Undo đảo đúng thao tác vừa làm).
- Preset: `test-matrix`.

## Trục
- Trục A — loại bản ghi: cá nhân | công ty | thoả thuận   [thước CE: ba service có `bulkArchive`/`bulkRestore` — SUY-TỪ-REPO: `apps/api/src/{contacts,companies,deals}/*.service.ts`]
- Trục B — trạng thái từng id trong lô: đang dùng | đã lưu trữ từ trước | không tồn tại   [thước CE: nhánh của `archive`/`restore` (`updateMany` có điều kiện, `findUniqueOrThrow` → P2025) và `runBulk` — SUY-TỪ-REPO: `apps/api/src/crm/bulk.ts`]
- Trục C — kết cục Hoàn tác: về đủ | về thiếu | lỗi hẳn   [thước CE: kết quả `bulkRestore` và `onError` của mutation — SUY-TỪ-REPO; NGÀNH: NN/g #9]
- Trục D — ngôn ngữ × khổ: vi | en | 1440   [thước CE: khổ đo của kho; cặp en/vi do messages-guard giữ]

## Không gian (B × kết cục, A cắt qua mọi ô)

| Lô \ việc | lưu trữ: số đếm + changedIds | toast lưu trữ | Hoàn tác gửi gì | toast Hoàn tác |
| --- | --- | --- | --- | --- |
| toàn bản đang dùng | **Core** AC-1 | **Core** AC-4 (không bỏ qua) | **Core** AC-2 | **Core** AC-3 (về đủ) |
| có bản đã lưu trữ từ trước | **Core** AC-1 (skipped, giữ ngày cũ) | **Core** AC-4, AC-6 | **Core** AC-2, AC-6 (không mang bản đó) | — |
| có id không tồn tại | **Core** AC-1 (failed) | **Core** AC-4 (không in câu thô) | **Core** AC-2 (không mang id hỏng) | — |
| không bản nào đổi | **Core** AC-1 (changedIds rỗng) | **Core** AC-4 (không nút Hoàn tác) | — | — |
| Hoàn tác về thiếu (bản bị xoá vĩnh viễn giữa chừng) | — | — | — | **Core** AC-3 (vàng, có số, không câu thô) |
| Hoàn tác lỗi hẳn | — | — | — | **Core** AC-3 (giữ câu V2) |

Trục A: AC-1, AC-2 đo đủ ba loại ở máy chủ thật; AC-3, AC-4 đo đủ ba bảng ở DOM. Trục D: en ở AC-5, 1440 ở AC-6.

## Later
- Câu báo thao tác hàng loạt khác (xoá vĩnh viễn, đổi người phụ trách, đổi giai đoạn) vẫn nối thông điệp máy chủ qua `bulkMenu.leftAlone` — cùng lỗi Ngoài-3 nhưng không có Hoàn tác; đề xuất gộp vào một hàng chữ sau.
- Hoàn tác khi lô vượt `MAX_BULK_IDS` — hôm nay chọn tối đa 100, `changedIds` không vượt lô gửi đi.
- Hai người bấm Hoàn tác cùng lúc trên cùng lô — `restoreIfArchived` có điều kiện nên lần sau tự thành skipped; không cần ô riêng.

## Never
- Hoàn tác khôi phục theo ngày lưu trữ («mọi bản cất trong 10 giây qua») — kéo theo việc của người khác, đúng lỗi đang sửa.
- Giữ `variables.ids` làm dự phòng khi thiếu `changedIds` — schema bắt buộc trường, thiếu là lỗi phân tích ở biên.

## Cross-cutting áp mọi ô Core
- Toast lưu trữ và Hoàn tác không in `result.message` của máy chủ (NN/g #9).
- `archive`/`restore` đơn lẻ (K6b, ngăn bản ghi) không đổi hành vi.
