---
schema_version: 1
slug: ghim-thuoc-soi-xem-okr
feature: «Thước "mọi lời đọc OKR có điều kiện xem" xanh lại và chạy ở CI trên từng PR»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-15T21:30:04Z
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Chủ kho gõ ở phiên giám sát đợt r2 lúc 2026-10-15T21:30:04Z: «Cổng Đáng ghim-thuoc-soi-xem-okr: build»; giám sát chuyển hàng cho dãy P0 (nhật ký `LUAT.md` của đợt, 21:30:26Z).

- Thước E23 của hồ sơ `gioi-han-duyet-cay-okr` (`bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem`) đỏ trên onehub với 8 lỗi. Phân loại từng lỗi (phiên chẩn 15/10, `onehub 8f819cf6a`): 7 lời đọc mới đều nằm sau cổng xem — **lộ thật 0, chưa rõ 0** — và 1 dòng miễn thừa vì `removeAlignment` đã dời lời đọc vào hàm chung `congSuaCanChinh`. Bốn PR gốc: #290, #300, #342, #395 (07–14/10).
- Nguyên nhân: E23 chỉ chạy khi ghim lại hồ sơ, không chạy ở CI theo PR. Luật chữ «ai gộp sau chạy lại `soi-ma --ca xem`» ở Notes của hợp đồng đã để lọt bốn PR liên tiếp.
- Người gặp: người viết mã OKR (thước đỏ sẵn nên lời đọc lộ thật mới sẽ lẫn vào tám dòng cũ), và người dùng có mục tiêu giới hạn nếu một lời đọc lộ thật lọt qua lúc thước đã đỏ sẵn.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau khi giao, một PR thêm lời đọc bảng OKR không có điều kiện xem và không có dòng miễn có còn gộp được không.
- SỐNG: `soi-ma --ca xem` xanh trên onehub ngay sau gộp; CI của PR đỏ khi thước đỏ; trong 14 ngày sau gộp, 0 lần thước đỏ trên onehub mà CI của PR gốc xanh.
- CHẾT: có một PR gộp vào onehub làm thước đỏ mà CI của PR đó không đỏ.
- Timebox: nửa ngày công; đọc số 14 ngày sau gộp.
