---
schema_version: 1
feature: "Ca kiểm lưu trữ và khôi phục của Kho tài liệu không còn đỏ ngẫu nhiên"
slug: tai-lieu-khoi-phuc-chap-chon
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: implemented
veto_state: mo
veto_opened_at: 2026-10-16T15:37:00Z
design_doc: docs/superpowers/specs/2026-10-16-tai-lieu-khoi-phuc-chap-chon-design.md
---

# Acceptance Contract: tai-lieu-khoi-phuc-chap-chon

## Context

Hàng F33 (mã tạm) của dãy P4, đợt r2; Cổng Đáng ký build 16/10 15:08:22Z. Hai ca của
`apps/api/test/tai-lieu-luu-tru.spec.ts` đếm sự kiện của lần duyệt từ mốc đồng hồ `Date.now() - 1`, trong khi `luc`
của sự kiện do Postgres đặt; sự kiện DE_XUAT cùng mili-giây lọt vào phép đếm và ca đỏ ngẫu nhiên ở pre-push (#413).
Hạng T2: chỉ chạm một tệp kiểm của `apps/api`, không chạm mã sản phẩm, cơ sở dữ liệu hay đường T3.

Source input: câu giao F33 của giám sát · `opportunity.md` · design doc.

## Criteria

- AC-1: Given ca «khoi-phuc: de xuat khoi phuc duoc duyet…», When duyệt đề xuất khôi phục, Then sự kiện của lần duyệt
  được đếm bằng tập id sự kiện chụp trước khi duyệt — ra đúng `{ KHOI_PHUC: 1 }` — không dùng mốc đồng hồ nào.
- AC-2: Given ca «duyet-luu-tru: ma tran nguoi viet truoc…», When mỗi người được phép duyệt đề xuất lưu trữ, Then sự kiện
  của lần duyệt được đếm bằng tập id chụp trước khi duyệt — ra đúng `{ LUU_TRU: 1, CU: 1 }` — không dùng mốc đồng hồ nào.
- AC-3: Given một sự kiện của trang có `luc` ở tương lai, sinh TRƯỚC khi chụp mốc (giả lập trùng mili-giây hay đồng hồ
  Postgres chạy trước), When đếm sự kiện mới bằng hàm của bài kiểm, Then sự kiện đó không được đếm; And trên cùng dữ
  liệu, cách đếm theo mốc `Date.now() - 1` cũ đếm nhầm nó (đối chứng: dữ liệu gieo thật sự kích được lỗi); And một
  sự kiện sinh SAU khi chụp thì được đếm.
- AC-4: Given mã nguồn `tai-lieu-luu-tru.spec.ts`, When quét, Then thân hai ca ở AC-1 và AC-2 chụp tập id trước lệnh
  duyệt rồi đếm bằng id, và trong cả tệp — trừ thân ca đối chứng `tlkp-dem` và ca quét `tlkp-tinh` — không còn mốc
  đồng hồ `Date.now()` theo sau là dấu trừ (bất kể khoảng trắng) hay lời gọi hàm đếm theo mốc; And mỗi mẫu vi phạm (mốc
  không dấu cách, thân ca gọi hàm đếm theo mốc, thân ca chụp id sau lệnh duyệt, dòng đối chứng chép vào thân ca khôi
  phục) thì phép quét bắt và gọi tên ca hay dòng.
- AC-5: Given cả tệp `tai-lieu-luu-tru.spec.ts`, When chạy, Then mọi ca xanh — không ca nào khác hồi quy.

## Coverage

- bỏ coverage-scan — bài toán một chiều (hai ca cùng cơ chế trong một tệp); xem sổ quyết định.

## Out of scope

- Năm tệp kiểm API khác cũng dùng mốc `Date.now() - 1` (`dieu-phoi.spec.ts`, `giai-doan-bao-cao.spec.ts`,
  `moi-phia-ke-hoach.spec.ts`, `slack-connection.spec.ts`, `tai-lieu-hoi-suc-khoe.spec.ts`).
- Mã sản phẩm của Kho tài liệu — hành vi đúng, chỉ phép đếm trong bài kiểm sai.

## Đường đo

- bỏ đường-đo — ô cơ hội không khai ngưỡng (hàng sửa bài kiểm); xem sổ quyết định.

## Notes

- Nhánh `fix/tai-lieu-khoi-phuc-chap-chon`, cắt từ onehub d5e01c5a3.
