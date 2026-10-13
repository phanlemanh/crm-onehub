---
schema_version: 1
feature: Lưu trữ một trường thôi hỏi lại và có «Hoàn tác» như mọi chỗ lưu trữ khác
slug: luu-tru-truong-khong-hoi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-13T07:22:18Z
design_doc: docs/superpowers/specs/2026-10-13-luu-tru-truong-khong-hoi-design.md
---

# Acceptance Contract: luu-tru-truong-khong-hoi

## Context

Hàng V2b của `docs/plan/lo-trinh-okr.json`, dãy P3 đợt r2; Cổng Đáng `build` (chủ kho, 2026-10-12T23:58:15Z). Mở từ
OOS-2 của V2 `vong-doi-mot-cach-cat`. `docs/vong-doi.md` dặn lưu trữ không hỏi và toast luôn có «Hoàn tác». Hôm nay
lưu trữ một trường từ menu dòng không có «Hoàn tác», từ trình sửa trường thì hỏi lại bằng một hộp và cũng không có
«Hoàn tác».

## Criteria

- AC-1: Given danh sách trường của một loại bản ghi có trường đang dùng «Nguồn khách», When người quản trị chọn «Lưu trữ» trong menu «…» của dòng đó, Then `fields.archive` được gọi đúng một lần với id của trường, không hộp hỏi lại nào mở, và hiện toast «Đã lưu trữ Nguồn khách.» có nút «Hoàn tác»; danh sách trường được đọc lại.
- AC-2: Given trình sửa của trường «Nguồn khách» đang mở, When người quản trị bấm «Lưu trữ», Then `fields.archive` được gọi đúng một lần với id đó, không hộp hỏi lại nào mở, trình sửa đóng, và hiện cùng toast có «Hoàn tác».
- AC-3: Given toast của AC-1 hoặc AC-2 đang hiện, When bấm «Hoàn tác» (kể cả bấm hai lần), Then `fields.restore` được gọi đúng một lần với đúng id đó, hiện toast «Đã khôi phục Nguồn khách.», và danh sách trường được đọc lại.
- AC-4: Given `fields.restore` trả lỗi, When bấm «Hoàn tác», Then hiện toast «Chưa hoàn tác được. Trường vẫn ở mục Đã lưu trữ.» và lời lỗi thô của máy chủ không hiện ra màn hình.
- AC-5: Given giao diện tiếng Việt và tiếng Anh, When đọc các toast của AC-1…AC-4, Then chữ tiếng Việt như trên và chữ tiếng Anh tương ứng không có ký tự tiếng Việt có dấu; khoá chữ mới có đủ cặp vi/en, và không còn khoá chữ nào không ai gọi.
- AC-6: Given người dùng không có quyền quản trị, When mở danh sách trường ở Cài đặt › Trường và ở ngăn «Quản lý trường», Then nút «…» của dòng vẫn bị khoá và trình sửa trường không mở được như hôm nay, kèm dòng nói vì sao.
- AC-7: Given bản chạy thật của cây này, một trường tự tạo trên thẻ Công ty ở Cài đặt › Trường, When lưu trữ nó từ menu dòng, chụp màn lúc toast hiện, rồi bấm «Hoàn tác», Then lúc toast hiện trường nằm trong nhóm «Đã lưu trữ» và máy chủ báo trường có mốc lưu trữ; sau «Hoàn tác» trường về nhóm đang dùng và máy chủ báo không còn mốc lưu trữ; làm lại từ trình sửa ở khổ 390 cho cùng kết quả (máy chủ báo có mốc rồi hết mốc), toast và «Hoàn tác» nằm trong khung nhìn; làm lại từ menu dòng trong ngăn «Quản lý trường» mở từ bảng Công ty thì bấm «Hoàn tác» không làm đóng ngăn và trường về nhóm đang dùng. (cross-layer)
- AC-8: Given ảnh chụp của AC-7, When một người không làm lượt này nhìn, Then hiểu ngay trường vừa được cất (không phải bị xoá) và lấy lại được bằng «Hoàn tác». (judgment)

## Coverage

- Bỏ quét bằng `morphological-scan`, xem sổ quyết định (bỏ coverage-scan). Trục kê tay:
- Trục A — đường lưu trữ: menu dòng (AC-1) | trình sửa (AC-2) [thước CE: mọi chỗ gọi `fields.archive` trong `apps/app` — SUY-TỪ-REPO: grep 13/10 ra đúng hai tệp `fields-list.tsx`, `field-editor.tsx`]
- Trục B — kết cục «Hoàn tác»: không bấm | bấm (AC-3) | bấm hai lần (AC-3) | lỗi (AC-4)
- Trục C — người dùng: quản trị (AC-1…AC-4) | không đủ quyền (AC-6)
- Trục E — nơi mở: Cài đặt › Trường | ngăn «Quản lý trường» từ bảng (AC-6, AC-7)
- Trục D — khổ × ngôn ngữ: 1440 vi | 390 vi | en — AC-5, AC-7.

## Out of scope

- Nút «Khôi phục» trong nhóm «Đã lưu trữ» của danh sách trường giữ như hôm nay (khôi phục, không toast).
- Xoá vĩnh viễn một trường.
- Gom menu dòng và nhóm «Đã lưu trữ» của danh sách trường về `ArchivedList`.

## Notes

- Vòng đời (luật 14): (1) Dọn thế nào — không đổi: trường đi Lưu trữ → Khôi phục; vòng này chỉ bỏ hỏi lại và thêm «Hoàn tác». (2) «Lịch sử» — không đổi. (3) Danh sách mặc định — không đổi: trường đã cất ở nhóm «Đã lưu trữ» cuối danh sách.
- Máy chủ không đổi: `fields.archive` và `fields.restore` đã có.
- Ranh giới: `apps/app/components/crm/fields/**`, `apps/app/app/(app)/[slug]/settings/fields/fields-settings.tsx` (gắn hook ở trang chủ), `apps/app/lib/messages/crm.ts` (chỉ thêm khoá `fields.*` và bỏ ba khoá chết của hộp hỏi lại — luật 7: gửi `cham-tep` nếu cần), `apps/app/test/messages-guard.spec.ts`, `apps/app/test/vong-doi-mot-cach-cat.dom.tsx` (bỏ một tham chiếu `archiveBody`), tệp kiểm mới, `_acceptance/luu-tru-truong-khong-hoi/**`, thêm khoá vào `_acceptance/config.yaml`.
