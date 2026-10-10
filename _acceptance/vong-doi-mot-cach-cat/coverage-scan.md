# Coverage scan — vong-doi-mot-cach-cat

## Ngữ cảnh
- Sản phẩm: CRM nội bộ OneHub, ba bảng cá nhân · công ty · thoả thuận — chân sản phẩm: đào repo (`docs/vong-doi.md` đợt 2, `CONTEXT.md` mục Lưu trữ / Đã lưu trữ / Xoá vĩnh viễn, `apps/app/components/crm/bulk-actions.tsx`, `*-bulk-actions.tsx`, `record-sheet/record-actions.tsx`, `deals-table.tsx`, `apps/api/src/crm/bulk.ts`) · chân ngành: Nielsen Norman Group «10 Usability Heuristics» (#3 User control and freedom — lối thoát khẩn cấp, hoàn tác), Material Design 3 «Snackbar» (thao tác Undo trên thông báo tạm).
- Preset: `entity-feature`.

## Trục
- Trục A — loại bản ghi: cá nhân | công ty | thoả thuận   [thước CE: ba bảng CRM có `archivedAt` — SUY-TỪ-REPO: `packages/db/prisma/schema.prisma`]
- Trục B — việc vòng đời: lưu trữ (kèm Hoàn tác) | xem «Đã lưu trữ» | mở bản đã cất (dải báo, chỉ đọc) | khôi phục | xoá vĩnh viễn   [thước CE: bảng «Ba cách dọn» và «Danh sách mặc định hiện gì» của `docs/vong-doi.md` — SUY-TỪ-REPO; NGÀNH: NN/g #3, Material 3 Snackbar]
- Trục C — chỗ trên màn: dạng bảng | Kanban | menu thao tác hàng loạt | menu ngăn bản ghi | ngăn bản ghi | danh sách liên quan trong ngăn   [thước CE: SUY-TỪ-REPO — các tệp kể ở chân sản phẩm]
- Trục D — khổ × ngôn ngữ: 1440 vi | 390 vi | en   [thước CE: khổ đo của kho]

## Không gian (B × C, ô có nghĩa; A cắt qua mọi ô)

| Việc \ chỗ | dạng bảng | Kanban | menu hàng loạt | menu ngăn | ngăn bản ghi | danh sách liên quan |
| --- | --- | --- | --- | --- | --- | --- |
| lưu trữ + Hoàn tác | — | — | **Core** AC-1, AC-2 | giữ (K6b) AC-1 | — | Later |
| xem «Đã lưu trữ» | **Core** AC-6 (chữ) | **Core** AC-5 | — | — | — | Later («+n đã lưu trữ») |
| mở bản đã cất | — | — | — | — | **Core** AC-3, AC-4 | — |
| khôi phục | giữ | — | giữ | giữ | **Core** AC-3 (từ dải báo) | — |
| xoá vĩnh viễn | — | — | **Core** AC-6 (chữ, hỏi lại một lần) | **Core** AC-6 (hỏi lại một lần) | — | — |

Trục A: mọi ô Core đo đủ ba loại. Trục D: 1440/390 ở AC-7 (thoả thuận đã cất, Kanban), en ở AC-3 và AC-6.

## Later
- Danh sách liên quan trong ngăn (công ty → cá nhân, thoả thuận; cá nhân → thoả thuận) chỉ hiện bản đang dùng kèm «+n đã lưu trữ» — cần sửa `byId` ở `apps/api/src/{companies,contacts,deals}/*.service.ts`, trùng `deals.service.ts` của E4 (P3); đề xuất hàng riêng.
- Lưu trữ một trường bỏ hộp hỏi lại (lưu trữ không hỏi, có Hoàn tác) — `components/crm/fields/field-editor.tsx` ngoài ranh giới; đề xuất hàng riêng.
- Giai đoạn thoả thuận và tác nhân theo nếp lưu trữ — trang Cài đặt, ngoài ranh giới; đề xuất hàng riêng.
- «Xoá hẳn» ở Cài đặt › Tổ chức (`lib/messages/to-chuc.ts`) — hồ sơ đã ký `to-chuc-danh-sach-chi-tiet` ghim chữ đó; đổi là việc của một hàng có hồ sơ riêng.
- Dòng thời gian, ghi chú, Kara trên bản đã cất — vẫn dùng được (ghi thêm lịch sử không đổi bản ghi).
- Máy chủ từ chối sửa bản đã cất — hôm nay chỉ giao diện khoá; khoá ở API là việc của module T3/T2 riêng.

## Never
- Hỏi lại trước khi lưu trữ — chuẩn vòng đời: lưu trữ không hỏi, có Hoàn tác.
- Chế độ «tất cả» trộn bản đã cất vào danh sách chính.

## Cross-cutting áp mọi ô Core
- Một hành động một chữ (`CONTEXT.md`); trạng thái thô (`archived`) không bao giờ hiện ra màn hình.
- Toast lỗi không in thông điệp lỗi thô của máy chủ ở đường Hoàn tác.
