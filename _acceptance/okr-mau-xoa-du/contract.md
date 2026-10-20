---
schema_version: 1
feature: Lệnh xoá bộ OKR mẫu dọn sạch cả dữ liệu người mẫu ghi vào các bảng mới (việc chung, tín hiệu), gọi đúng tên bảng khi phải dừng, và có lưới bắt bảng mới chưa khai
slug: okr-mau-xoa-du
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-20
design_doc: docs/superpowers/specs/2026-10-20-okr-mau-xoa-du-design.md
---

# Acceptance Contract: okr-mau-xoa-du

## Context

Việc phụ V3-8 của đợt `vo-khu-muc-tieu`, chủ kho chọn lối A ở Hỏi-6 (20/10): VK7 `ngan-kr-mot-cho` chờ việc này gộp rồi
ghim lại `canh-kr-okr`. Lệnh `okr:mau --xoa` (`apps/api/scripts/okr-mau/nap.ts`, `xoaTrong`) thoát 5 sau một lượt đo màn
`canh-kr-okr` E12 vì bảng `viec` còn 2 hàng do người mẫu tạo; thông điệp chỉ nói «(User)». Đo 20/10 trên `e6c0296a4`.

Từ ngữ: «người mẫu» = người có `id` mang tiền tố `mau-okr-` hoặc email đuôi `@mau.onehub.test` (`tapMau`). «Khoá chặn» =
khoá ngoại vào bảng người dùng có `onDelete` là `Restrict`, `NoAction` hoặc để mặc định. «Sổ khoá» = bảng tra viết trước
trong `apps/api/scripts/okr-mau/` khai mỗi khoá chặn là `don` hay `chan`.

## Criteria

- AC-1 (cross-layer): Given bộ mẫu đã nạp và một người mẫu tạo việc chung qua đường ghi thật của API (`viec.create`),
  When chạy `okr:mau --xoa`, Then lệnh thoát 0, mọi hàng `viec` do người mẫu tạo cùng các hàng con của chúng không còn,
  không còn hàng nào trỏ vào người mẫu, và nạp lại bộ mẫu thoát 0.
- AC-2: Given một tín hiệu do người mẫu gửi và một tín hiệu do người ngoài gửi, When chạy `okr:mau --xoa`, Then tín
  hiệu của người mẫu không còn, tín hiệu của người ngoài còn nguyên (trừ cột trỏ vào người mẫu về rỗng theo khoá).
- AC-3: Given một việc chung do người NGOÀI bộ mẫu tạo nhưng giao cho người mẫu thực hiện, When chạy `okr:mau --xoa`,
  Then lệnh dừng mã 5, thông điệp nêu `viec.nguoiThucHienId`, và không hàng nào trong kho đổi; And Given một việc do
  người mẫu tạo có một việc con hay một phụ thuộc do người ngoài tạo, Then lệnh cũng dừng mã 5, nêu tên khoá, không đổi
  gì.
- AC-4: Given sau mọi bước dọn vẫn còn khoá chặn giữ người mẫu (kể cả khoá đã khai `don` mà thiếu bước xoá), When
  lệnh dừng mã 5, Then thông điệp liệt đúng tập `<bảng>.<cột> (<số hàng>)` đang giữ — không thừa, không thiếu — và không
  in «(User)» trần.
- AC-5: Given lược đồ Prisma của kho, Then mọi khoá chặn vào `User` có đúng một dòng trong sổ khoá; một khoá chặn không
  khai làm bài kiểm đỏ với thông điệp gọi tên `<model>.<trường>`; một dòng sổ trỏ khoá không còn tồn tại cũng đỏ.
- AC-6 (cross-layer): Given một lượt đo màn `canh-kr-okr` E12, E15, E17 trọn trong phiên đo riêng, When phép đo dọn bộ
  mẫu, Then `okr:mau --xoa` thoát 0 và lượt đo không còn dòng hỏng nào.
- AC-7: Given các ca đã ký của khối `xoa-mau` (dùng rồi mới xoá; dữ liệu ngoài đang giữ dừng mã 5 không đổi gì; kho
  không có bộ mẫu), Then cả ba vẫn xanh.

## Coverage

Bỏ quét morphological: không gian khoá ngoại đã liệt kê bằng máy từ lược đồ (AC-5), quét tay thêm không thêm ô — xem dòng
sổ `bỏ coverage-scan`.

## Out of scope

- Dọn dữ liệu CRM và tác nhân trỏ vào người mẫu (`deal`, `campaign`, `activity`, `agent*`): khai `chan` — dữ liệu
  nghiệp vụ ngoài bộ mẫu, gặp thì dừng có tên.
- Sửa thước của các hồ sơ đo màn khác (việc của từng hàng ghim lại sau khi việc này gộp).
- Chạy trên production: lệnh vẫn từ chối như cũ.

## Notes

- Ranh giới: `apps/api/scripts/okr-mau/**`, `apps/api/test/okr-mau*.spec.ts`, `_acceptance/config.yaml` (chỉ thêm),
  `_acceptance/okr-mau-xoa-du/**`.
- Hạng T2: không chạm đường T3 nào.
