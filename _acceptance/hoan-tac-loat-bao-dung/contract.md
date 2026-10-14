---
schema_version: 1
feature: Lưu trữ và hoàn tác hàng loạt báo đúng — lỗi máy chủ không hiện thành «bị bỏ qua», hoàn tác khi mọi bản đã về không báo lỗi, lỗi từng bản ghi có dòng log
slug: hoan-tac-loat-bao-dung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: verified
approved_by: Phan Le Manh
approved_at: 2026-10-14T03:12:53Z
design_doc: docs/superpowers/specs/2026-10-14-hoan-tac-loat-bao-dung-design.md
---

# Acceptance Contract: hoan-tac-loat-bao-dung

## Context

Hàng V2f của `docs/plan/lo-trinh-okr.json`, dãy P3 đợt r2; Cổng Đáng `build` (chủ kho, 2026-10-12T23:58:15Z). Ba mục
Known limits loại hành vi của V2d `hoan-tac-loat-dung-id` (#354): Ngoài-3 (lỗi máy chủ hiện thành «bị bỏ qua»), Ngoài-4
(hoàn tác khi mọi bản đã về báo «Chưa hoàn tác được») và Ngoài-7 (`runBulk` không ghi log lỗi từng bản).

## Criteria

- AC-1: Given `runBulk` nhận bốn id mà thao tác lần lượt trả bản ghi, trả `null`, ném `NotFoundException` và ném một lỗi thường, When chạy, Then kết quả là `requested 4, succeeded 1, skipped 1, failed 2, errored 1`, `changedIds` chỉ có id đầu; `Logger.error` được gọi đúng một lần với `recordId` của id ném lỗi thường và đối số thứ hai đúng là stack của lỗi đó; `Logger.warn` được gọi đúng một lần với `recordId` của id không còn.
- AC-2: Given lô gồm bản đang dùng, bản đã lưu trữ từ trước và id không tồn tại, của cá nhân, công ty hay thoả thuận, When gọi lưu trữ rồi khôi phục hàng loạt qua tRPC thật trên máy chủ thật, Then thân kết quả có `errored` bằng 0 và các số `succeeded`, `skipped`, `failed`, `changedIds` đúng như luật đã ký của V2d (id không tồn tại vẫn tính vào `failed`). (cross-layer)
- AC-3: Given lưu trữ hàng loạt trả `succeeded 2, skipped 1, failed 2, errored 1`, When toast hiện, Then toast nói 2 bản đã lưu trữ, 2 bản bị bỏ qua (`skipped + failed − errored`) và 1 bản chưa lưu trữ được vì máy chủ gặp lỗi, có «Hoàn tác», và không chứa lời lỗi thô; Given `succeeded 0, failed 3, errored 3`, Then là toast lỗi «3 bản chưa lưu trữ được…», không có chữ «bị bỏ qua», không có «Hoàn tác»; Given `succeeded 0, skipped 1, failed 2, errored 1`, Then là toast lỗi nói 2 bản bị bỏ qua và 1 bản chưa lưu trữ được, không có «Hoàn tác».
- AC-4: Given «Hoàn tác» sau lưu trữ hàng loạt trả `succeeded 0, skipped 3, failed 0`, When toast hiện, Then là toast thành công «3 bản đã được khôi phục từ trước.» và không có «Chưa hoàn tác được»; Given `succeeded 0, failed 3`, Then vẫn là toast «Chưa hoàn tác được…» như V2d.
- AC-5: Given kết quả thiếu trường `errored` (máy chủ cũ, dữ liệu của bài V2d), When toast lưu trữ hay hoàn tác hiện, Then hành xử đúng như V2d, và các bài đã ký của V2d (`htl-luu-tru`, `htl-hoan-tac` phía máy chủ; `htl-hoan-tac-dung-id`, `htl-hoan-tac-thieu`, `htl-luu-tru-bo-qua`, `htl-en` phía app) chạy lại không sửa.
- AC-6: Given giao diện tiếng Việt và tiếng Anh, When đọc các toast mới ở AC-3, AC-4, Then chữ vi như trên, chữ en không có ký tự tiếng Việt có dấu; khoá chữ mới có đủ cặp vi/en.
- AC-7: Given bản chạy thật của cây này, ba cá nhân đang dùng trong bảng, When chọn cả ba, lưu trữ hàng loạt, rồi trước khi bấm «Hoàn tác» cả ba được khôi phục ở máy chủ (như người khác vừa làm), rồi bấm «Hoàn tác» ở khổ 1440, Then toast nói «3 bản đã được khôi phục từ trước.», không có «Chưa hoàn tác được», cả ba dòng có trong bảng và máy chủ báo cả ba không còn mốc lưu trữ. (cross-layer)
- AC-8: Given ảnh chụp của AC-7, When một người không làm lượt này nhìn, Then hiểu ngay các bản ghi đã ở lại danh sách, không phải có lỗi. (judgment)
- AC-9: Given `docs/api.md` mục «Deleting a record is archive first, purge later», When đọc, Then có đoạn nói nghĩa của `changedIds`, `skipped`, `failed`, `errored` trong kết quả hàng loạt và nói mỗi lỗi từng bản được ghi một dòng log kèm `recordId`.

## Coverage

- Bỏ quét bằng `morphological-scan`, xem sổ quyết định (bỏ coverage-scan). Trục kê tay:
- Trục A — lớp: hàm `runBulk` (AC-1) | thủ tục tRPC thật (AC-2) | toast app (AC-3, AC-4, AC-5) | bản chạy thật (AC-7, AC-8) | tài liệu (AC-9)
- Trục B — kết cục từng bản: đổi | đã như ý (`skipped`) | không còn (`failed`) | lỗi thật (`errored`) — AC-1, AC-2, AC-3
- Trục C — thao tác: lưu trữ (AC-3) | hoàn tác (AC-4, AC-7)
- Trục D — loại bản ghi: cá nhân | công ty | thoả thuận [thước CE: mọi chỗ gọi `baoLuuTruLoat`/`baoHoanTacLoat` — SUY-TỪ-REPO: grep 14/10 ra đúng ba tệp `*-bulk-actions.tsx`]
- Trục E — ngôn ngữ: vi | en (AC-6)

## Out of scope

- Ngoài-1 của V2d: kiểu `BulkResult` phía app suy từ đầu ra router.
- Ngoài-2 của V2d: gộp `archiveIfActive`/`restoreIfArchived` của ba service.
- Đổi luật đếm `failed` đã ký ở AC-1 của V2d.
- Tự thử lại khi máy chủ lỗi.

## Notes

- Vòng đời (luật 14): (1) Dọn thế nào — không đổi: Lưu trữ → Khôi phục → Xoá vĩnh viễn. (2) «Lịch sử» — không đổi. (3) Danh sách mặc định — không đổi; vòng này chỉ đổi lời báo và log.
- Lỗi thật của máy chủ (Ngoài-3) không dựng được trên bản chạy thật mà không chen mã vào đường ghi; nó được đo ở lớp hàm (AC-1) và lớp DOM (AC-3), không có ảnh.
- Ranh giới: `apps/api/src/crm/bulk.ts`, `docs/api.md` (một đoạn), `apps/app/components/crm/bulk-actions.tsx`, `apps/app/lib/messages/crm.ts` (chỉ thêm khoá `bulk.chuaLuuTru`, `bulk.daVeTruoc`), `apps/app/test/messages-guard.spec.ts` (thêm GHIM), tệp kiểm mới `apps/api/test/hoan-tac-loat-bao-dung.spec.ts`, `apps/app/test/hoan-tac-loat-bao-dung.dom.tsx`, `_acceptance/hoan-tac-loat-bao-dung/**`, thêm khoá vào `_acceptance/config.yaml`.
