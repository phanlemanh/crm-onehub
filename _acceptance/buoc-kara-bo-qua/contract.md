---
schema_version: 1
feature: «Bước Kara bỏ qua việc vô hại hiện "Đã bỏ qua", không báo "chưa lưu được"»
slug: buoc-kara-bo-qua
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-09-buoc-kara-bo-qua-design.md
---

# Acceptance Contract: buoc-kara-bo-qua

## Context

Khi Kara bỏ qua một việc vô hại (cá nhân đã có ảnh, ảnh không đổi), bước đó hiện «Kara chưa lưu được» và danh sách bước tự mở. Anh chọn lối A (2026-10-09): công cụ ảnh tự khai «bỏ qua», danh sách bước hiện «Đã bỏ qua» trung tính và không tự mở; ca hỏng thật giữ nguyên.

Source input: Ngoài-6 của `kara-trang-thai-toan-crm` (K6b), Cổng 2 2026-10-08T07:13:17Z, anh chọn «mở hợp đồng mới» (luật 26); giám sát chuyển hàng K6d sang làn P6; `_acceptance/buoc-kara-bo-qua/opportunity.md`.

## Criteria

- AC-1: (cross-layer) Given một cá nhân đã có ảnh đã lưu bản sao, When công cụ ảnh của Kara chạy không ép thay (cả hai đường `storePortrait` và `runPortrait`), Then kết cục mang `skipped: true` và `stored: false` với lý do «They already have a photo.», bản ghi không đổi; When nguồn ảnh trùng ảnh đang có, Then kết cục «Unchanged.» cũng mang `skipped: true`.
- AC-2: Given kết cục một bước có `skipped: true`, When dựng dòng thời gian Kara, Then màu kết cục là trung tính (không phải cảnh báo) và mục mang `skipped: true`; dữ liệu cũ không có trường `skipped` vẫn đọc được với `skipped: false`.
- AC-3: Given ngăn Kara của bản ghi có một bước bỏ qua và các bước khác xong, When ngăn hiện, Then bước đó hiện «Đã bỏ qua» với chấm trung tính, KHÔNG hiện «Chưa lưu được», danh sách bước KHÔNG tự mở và tiêu đề danh sách bước là «Đã làm N bước».
- AC-4: Given ca hỏng thật (không lấy được ảnh: `stored: false` không kèm `skipped`; hoặc `written: false`), When như AC-2 và AC-3, Then vẫn là cảnh báo, bước «Chưa lưu được» và danh sách tự mở — không hồi quy.
- AC-5: Given khung tạo tác nhân hiển thị một bước có kết cục bỏ qua, When khung hiện, Then không hiện dấu cảnh báo cho bước đó.
- AC-6: Given giao diện tiếng Anh, When như AC-3, Then bước hiện «Skipped».
- AC-7: Given các bài kiểm sẵn có của dòng thời gian Kara và danh sách bước (`agent-transcript.spec.ts`, `kara-trang-thai-ui.dom.tsx`, `bo-xuong-kara.dom.tsx`), When chạy lại, Then xanh; kỳ vọng cũ không bị sửa (chỉ thêm ca).

## Coverage

- bỏ coverage-scan — một công cụ, một cờ, hai mặt hiển thị đã liệt kê đủ; xem dòng sổ quyết định «bỏ coverage-scan».

## Out of scope

- Các công cụ khác của Kara (chưa có công cụ nào khác trả «không lưu» cho việc vô hại).
- Đổi chữ «Chưa lưu được» của ca hỏng thật.
- «No photo on the profile.» (không tìm thấy ảnh) giữ là «Chưa lưu được» — người xem nên biết Kara không tìm được ảnh.

## Notes

- Không migration; trường `skipped` của mục dòng thời gian mặc định `false`.
