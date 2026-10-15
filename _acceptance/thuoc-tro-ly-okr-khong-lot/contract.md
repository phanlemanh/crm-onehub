---
schema_version: 1
feature: "Thước E22/E24 của Trợ lý OKR không lọt lượt rỗng, không chia kho giữa các cây"
slug: thuoc-tro-ly-okr-khong-lot
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-15
design_doc: docs/superpowers/specs/2026-10-15-thuoc-tro-ly-okr-khong-lot-design.md
---

# Acceptance Contract: thuoc-tro-ly-okr-khong-lot

## Context

Việc (a) chủ kho duyệt 14/10 sau phiên chẩn đoán E24: lượt E24 hỏng 20/20 vì AI Gateway 402 vẫn lọt làn ghim (mã 1 trùng giới
hạn đã khai), và kho `crm_tdx_e22_do` dùng chung làm hỏng E22 của hai cây chạy cùng lúc. Chỉ đổi thước của hồ sơ đã ký
`tro-ly-okr-de-xuat`.

Source input: nhật ký 14/10 (tác tử 402, lượt E22 mất kho) · design doc.

## Criteria

- AC-1: Given số dư AI Gateway đọc được là -0,0099 hoặc 0, When chạy `do-tre.mjs` hay `eval-gop-y.mjs`, Then lệnh thoát 2 với câu «so du AI Gateway <số> USD» trước khi gọi model nào; số dư dương thì đo tiếp; không đọc được số dư (HTTP lỗi, balance không phải số) thì in một dòng cảnh báo và đo tiếp; thiếu khoá thì không gọi mạng.
- AC-2: Given mọi lượt (và chỉ khi mọi lượt — 19/20, 1/20, 0/20 không bị chặn) `troLyDeXuat` của E24 đều hỏng, When `do-tre.mjs` đọc xong số, Then nó thoát 2 với câu «N/N luot hong (<kết cục> <số>) — khong phai do tre; <dòng lỗi model nguyên văn>» lấy từ nhật ký tác tử, không thoát 1; chạy thật với khoá Gateway sai: bản sửa thoát 2, bản trước vòng (38300b3c8) thoát 1 «KHONG DAT».
- AC-3: Given hai cây khác nhau, When mỗi cây gọi `taoKho("tdx-e22")`, Then hai kho đo có tên khác nhau và khác kho chung cũ `crm_tdx_e22_do`, đo bằng chính tên `taoKho` truyền cho `db:do`; bản trước vòng truyền cùng một tên chung ở cả hai cây.

## Coverage

Quét tay ba trục: số dư {âm, 0, dương, không đọc được, thiếu khoá} → AC-1; kết cục lượt E24 {hỏng hết} × {bản sửa, bản cũ} → AC-2;
tên kho × {cây A, cây B, tên cũ} → AC-3. `[CE chưa kiểm chứng]`

## Out of scope

- Đổi `do-tre.sql` và số đo độ trễ trên màn số đo — Hỏi-1, chờ chủ kho; khuyến nghị tách hàng riêng.
- Khai lại `expected` của E24 trong `tro-ly-okr-de-xuat/evals.yaml` — hồ sơ đã ký; mã 2 mới vẫn là «không đo được», không phải đạt.

## Notes

- Ghim lại hồ sơ `tro-ly-okr-de-xuat` trong cùng PR (cham-tep P0-6); làn ghim gọi model thật ở E22, E24.
- `bo-ca-mau-quy-4` cũng dùng `taoKho` — kho của nó cũng theo cây sau vòng này.
