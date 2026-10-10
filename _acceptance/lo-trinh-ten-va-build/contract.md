---
schema_version: 1
feature: «Trang lộ trình đúng tên OneHub Center và không làm vỡ bản dựng»
slug: lo-trinh-ten-va-build
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
approved_by: Phan Le Manh
approved_at: 2026-10-10T10:36:59Z
---

# Acceptance Contract: lo-trinh-ten-va-build

## Context

Trang lộ trình (LT1, #329) gây hai lỗi chặn đợt: bốn chuỗi mang «CRM» làm phép quét tên OneHub Center đỏ; và glob `outputFileTracingIncludes: ["../../LO-TRINH.html"]` khiến Turbopack quét cả kho khi dựng trang, nên cây nào có symlink vòng `apps/agent/test/fixtures/eve-mau/node_modules/@mau/agent` thì `next build` panic. Đã đo ở S3: bỏ glob thì build xanh dù có symlink; viết đường đọc mặc định trong `doc-tep.ts` bằng `process.cwd()` cộng chữ «LO-TRINH.html» thì Turbopack tự dò ra đúng một tệp (bản dựng 331 tệp); dùng hằng `LO_TRINH.tep` ở chỗ đó thì Turbopack kéo 11 854 tệp — nên chỗ đó giữ chữ thật, có bài kiểm ghim nó bằng `LO_TRINH.tep`.

Source input: giám sát mở H6 2026-10-10, anh chọn «H6 ở đây».

## Criteria

- AC-1: Given các tệp giao diện của kho, When chạy phép quét tên OneHub Center (`_acceptance/doi-ten-onehub-center/rang/quet-ten.mjs`), Then 0 SAI — bốn câu của trang lộ trình nói «OneHub Center» (vi và en) thay vì «CRM», không thêm ngoại lệ mới.
- AC-2: Given một cây có symlink vòng `apps/agent/test/fixtures/eve-mau/node_modules/@mau/agent → apps/agent`, When dựng `app` (`turbo run build --force --filter=app`), Then bản dựng xanh; và bản trước sửa trên cùng điều kiện thì panic «infinite loop».
- AC-3: Given bản dựng của AC-2, When đọc `.nft.json` của trang lộ trình, Then nó mang `LO-TRINH.html`, không mang tệp nào dưới `apps/agent/`, và không quá 2 000 tệp.
- AC-4: Given trang lộ trình đọc tệp, When gọi `duongTepLoTrinh()` không đối số và `docTepLoTrinh(goc)` có đối số, Then đường mặc định có tên đúng bằng `LO_TRINH.tep`, tệp ở gốc app được đọc trước gốc kho, vắng tệp thì `null`; phép đo bản dựng của LT1 (`ltc_ban_dung`) và các bài kiểm lộ trình sẵn có vẫn xanh.

## Coverage

- bỏ coverage-scan — hai lỗi có tên, nguyên nhân đã đo; xem dòng sổ quyết định «bỏ coverage-scan».

## Out of scope

- Sửa `_acceptance/tro-ly-okr-nen/rang/mau-chung.mjs` để không để lại symlink vòng (hồ sơ đã ký, ngoài ranh H6) — báo giám sát; sau bản sửa này symlink không còn làm vỡ bản dựng.
- Các trang khác dùng `outputFileTracingIncludes` (không có).

## Notes

- Không migration. Không đổi API.
