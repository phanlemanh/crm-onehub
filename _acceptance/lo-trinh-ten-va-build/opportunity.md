---
schema_version: 1
slug: lo-trinh-ten-va-build
feature: «Trang lộ trình đúng tên OneHub Center và không làm vỡ bản dựng»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-10T10:36:59Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

Nguồn: giám sát đợt `sau-14-10` mở hàng H6 (ưu tiên 0, ngoại lệ luật 53), anh chọn «H6 ở đây» cho làn P6; hàng này chặn 4 PR cuối của đợt (F10, E6, K3b, K3c). Gốc cả hai lỗi là #329 (LT1 `trang-lo-trinh-trong-crm`).

## Vấn đề & ai gặp

1. Tên: `apps/app/lib/messages/lo-trinh.ts` có bốn câu người dùng đọc mang chữ «CRM» (vi và en) — luật tên OneHub Center (`_acceptance/doi-ten-onehub-center/rang/quet-ten.mjs`) báo SAI 4 chỗ, làm đỏ phép đo của hồ sơ đã ký.
2. Bản dựng: `outputFileTracingIncludes` khai glob `../../LO-TRINH.html` cho trang lộ trình; Turbopack mở rộng glob bằng cách quét cả kho, lần theo symlink. Cây nào có symlink vòng `apps/agent/test/fixtures/eve-mau/node_modules/@mau/agent → apps/agent` (do `_acceptance/tro-ly-okr-nen/rang/mau-chung.mjs` tạo, không dọn) thì `next build` panic «symlink … infinite loop» — CI và `pre-push` của các làn chạy trên cây đó đỏ.

## Ngưỡng chết / ngưỡng UAT

- Không đo bằng người dùng. Phép thử: quét tên 0 SAI; `next build` xanh khi có symlink vòng; bản dựng của trang lộ trình vẫn mang `LO-TRINH.html` và không kéo theo cả kho; bốn PR bị chặn đẩy được.
- Câu hỏi phép đo trả lời: Người đọc trang lộ trình có nhận ra đúng sản phẩm OneHub Center và tìm được hàng của phòng mình mà không phải hỏi lại tên không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu với ít nhất 3 người, ít nhất 2 trên 3 người gọi đúng tên «OneHub Center» khi được hỏi trang nói về sản phẩm nào, không ai gọi là «CRM», và ít nhất 2 trên 3 người tìm ra hàng của phòng mình trong dưới 60 giây.
- Kết quả nào là CHẾT: Trong phiên nghiệm thu, từ 2 trên 3 người trở lên gọi sản phẩm là «CRM» hay hỏi lại trang nói về sản phẩm nào, hoặc từ 2 trên 3 người trở lên không tìm ra hàng của phòng mình trong 60 giây.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)

## Out of scope từ khám phá

- Sửa `_acceptance/tro-ly-okr-nen/rang/mau-chung.mjs` để dọn symlink (hồ sơ đã ký, ngoài ranh) — báo giám sát.
