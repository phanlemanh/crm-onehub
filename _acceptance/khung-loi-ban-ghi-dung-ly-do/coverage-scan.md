# Coverage scan — khung-loi-ban-ghi-dung-ly-do

## Ngữ cảnh
- Sản phẩm: CRM nội bộ OneHub, ngăn bản ghi — chân sản phẩm: đào repo (`apps/app/components/crm/record-sheet/*`, `apps/api/src/contacts/contacts.service.ts` NotFoundException, `apps/api/src/trpc/middlewares/auth.middleware.ts` FORBIDDEN NOT_A_MEMBER, tiền lệ `objective-sheet.tsx`) · chân ngành: Nielsen Norman Group «Error-Message Guidelines».
- Preset: `test-matrix`.

## Trục
- Trục A — ngăn: cá nhân | công ty | thoả thuận | kế hoạch | mục «Kế hoạch» của công ty   [thước CE: các tệp dùng `RecordSheetFrame`/`KhungTaiLoi` — SUY-TỪ-REPO]
- Trục B — mã lỗi: NOT_FOUND | FORBIDDEN | khác   [thước CE: SUY-TỪ-REPO (service + middleware); NGÀNH: NN/g — nói đúng nguyên nhân, chỉ việc làm được]
- Trục C — khổ × ngôn ngữ: 1440 vi | 390 vi | en   [thước CE: khổ đo của kho]

## Không gian (A × B, 15 ô)

| Ngăn \ mã | NOT_FOUND | FORBIDDEN | khác |
| --- | --- | --- | --- |
| cá nhân | **Core** AC-1 | **Core** AC-2 | giữ (K4) AC-3 |
| công ty | **Core** AC-1 | **Core** AC-2 | giữ (K4) AC-3 |
| thoả thuận | **Core** AC-1 | **Core** AC-2 | giữ (K4) AC-3 |
| kế hoạch | **Core** AC-1 | **Core** AC-2 | **Core** AC-3 (thêm «Thử lại») |
| «Kế hoạch» của công ty | **Core** AC-4 | **Core** AC-4 | giữ (K4) AC-4 |

Trục C cắt qua: 1440/390 ở AC-6 (cá nhân · NOT_FOUND, lỗi thật của máy chủ), en ở AC-5.

## Later
- UNAUTHORIZED (phiên hết hạn) — đường đăng nhập lại đã có (#184).
- Bản ghi lưu trữ — V2.

## Never
- «Thử lại» cho NOT_FOUND/FORBIDDEN — thử lại không đổi được kết quả.

## Cross-cutting áp mọi ô Core
- Không in lỗi thô; một việc làm tiếp duy nhất mỗi khung.
