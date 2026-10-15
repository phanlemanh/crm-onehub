---
schema_version: 1
feature: "Cùng một nghĩa — xong, chờ, hỏng, nháp, đang chạy — mang cùng một màu ở OKR, Kara, lịch họp và Tài liệu"
slug: mau-trang-thai-chung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: docs/superpowers/specs/2026-10-16-mau-trang-thai-chung-design.md
---

# Acceptance Contract: mau-trang-thai-chung

## Context

Hàng NM3 của `docs/plan/lo-trinh-okr.json`, dãy P4 của đợt r2; Cổng Đáng ký build 12/10. LT1 đã đặt bảng nghĩa → màu
(`packages/ui/src/lib/status-tone.ts`, mục «Màu trạng thái» của `docs/design.md`); vòng này dời mọi khu còn tự khai
màu trạng thái về bảng đó. Hạng T2: chạm `packages/ui` và `apps/app`, không chạm API, cơ sở dữ liệu hay đường T3.

Source input: hàng NM3 (`cau_giao`, `ghi_chu`) · `opportunity.md` · `docs/design.md` mục «Màu trạng thái» · design doc.

## Criteria

- AC-1: Given bảng nghĩa → màu của `packages/ui`, When đọc bảng, Then có đúng sáu nghĩa — xong, chờ, hỏng, nháp, đang
  chạy, đã kết thúc — và «đã kết thúc» mang `neutral`; And mục «Màu trạng thái» của `docs/design.md` có đúng sáu dòng
  khớp từng nghĩa và màu.
- AC-2: Given mã nguồn `apps/app` và `packages/ui/src` (trừ bản mẫu `/proto`, bài kiểm, `status-tone.ts` và
  `status-indicator.tsx`), When quét mọi tệp `.ts` và `.tsx`, Then không tệp nào khai một bảng hay hàm ánh xạ trạng thái
  sang `StatusTone` (`Record<…, StatusTone>`, thuộc tính `tone: "<màu>"` trong một bảng); When một tệp như vậy được
  thêm, Then bài quét đỏ và gọi tên tệp.
- AC-3: Given 13 khu ở bảng «Hiện trạng» của design doc, When đọc bảng nghĩa mà mỗi khu khai, Then mọi trạng thái của
  khu mang đúng nghĩa ở bảng ánh xạ của design doc, và màu hiển thị bằng `toneTheoNghia(nghĩa)`.
- AC-4: Given các thành phần vẽ chấm trạng thái — độ tự tin và nhịp OKR, các bước của Kara, danh sách người dự họp,
  bảng nguồn của Tài liệu — When dựng mỗi thành phần với từng trạng thái của nó, Then chấm trên trang mang `data-tone`
  bằng màu của nghĩa ở bảng ánh xạ.
- AC-5: Given mục «Màu trạng thái» của `docs/design.md`, When đọc mục, Then không còn câu «Năm khu cũ còn tự khai» và có
  câu nói bài quét ở AC-2 giữ luật một bảng.

## Coverage

Quét theo khuôn test-matrix của `morphological-scan`.

- Trục khu: 13 khu ở bảng «Hiện trạng» [thước CE: `git grep` các mẫu `Record<…, StatusTone>` và `tone: "<màu>"` trên
  f46c0bbda, trừ `/proto` và bài kiểm]
- Trục nghĩa: xong | chờ | hỏng | nháp | đang chạy | đã kết thúc [thước CE: mục «Màu trạng thái» của `docs/design.md`
  cộng nghĩa mới của Hỏi-2]
- Trục lớp đo: bảng nghĩa của khu (AC-3) | chấm trên DOM (AC-4) | luật một bảng trên mã nguồn (AC-2) | luật trên tài
  liệu (AC-1, AC-5)
- Core: mọi trạng thái × 13 khu (AC-3); năm thành phần vẽ chấm × mọi trạng thái của nó (AC-4); quét mã nguồn (AC-2).
- Later: màu chọn tại chỗ trong JSX theo điều kiện; biến thể `Badge` của nhãn trạng thái.

## Out of scope

- Bản mẫu dưới `/proto` — vật thiết kế, không lên màn thật.
- Màu chọn tại chỗ trong JSX theo một điều kiện (`dong-buoc.tsx`, `hop-tuan.tsx`, `cham-diem.tsx`…).
- Biến thể `Badge` của nhãn trạng thái (`BIEN_THE_TRANG_THAI` ở `tien-do-kr.tsx`).

## Đường đo

- bỏ đường-đo — ô cơ hội không khai ngưỡng (hàng dựng); xem sổ quyết định.

## Notes

- Nhánh `feat/mau-trang-thai-chung`, cắt từ onehub f46c0bbda.
