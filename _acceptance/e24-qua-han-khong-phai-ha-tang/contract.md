---
schema_version: 1
feature: "E24 của Trợ lý OKR: lượt quá hạn là trễ, không phải «không đo được»"
slug: e24-qua-han-khong-phai-ha-tang
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-15
design_doc: docs/superpowers/specs/2026-10-15-e24-qua-han-khong-phai-ha-tang-design.md
---

# Acceptance Contract: e24-qua-han-khong-phai-ha-tang

## Context

Ngoài-4 của `thuoc-tro-ly-okr-khong-lot`: sau #422, khi mọi lượt E24 quá 180 s chưa đóng, `do-tre.mjs` chặn sớm «không đo
được — không phải do trễ» (mã 2), trong khi đó chính là trễ và phải ra KHONG DAT (mã 1). Chủ kho chọn «mở hợp đồng mới» ở
Cổng Bằng chứng 15/10; giám sát r2 duyệt hàng P0-8. Chỉ đổi thước của hồ sơ đã ký `tro-ly-okr-de-xuat`.

Source input: sổ quyết định `thuoc-tro-ly-okr-khong-lot` dòng `d-20261015T050911Z-17` · review-findings của hồ sơ đó (S4 r2) ·
design doc.

## Criteria

- AC-1: Given mọi lượt E24 đều hỏng và MỌI lượt hỏng đều vì chờ quá hạn chưa đóng, When `do-tre.mjs` đọc xong số, Then nó
  KHÔNG chặn sớm: lượt quá hạn tính `hongMs` (30 000 ms) vào p50/p90, đầu ra có dòng «<k>/<n> luot qua <s> s chua dong — tinh la
  do tre», các dòng `SAI` chỉ là các dòng ngưỡng p50/p90, và lệnh thoát 1 «KHONG DAT», không thoát 2, không có câu «khong phai
  do tre». Chạy thật `--lan 2` với hạn chờ ép 1 ms trên bản sao và khoá Gateway sai: bản sửa thoát 1 «KHONG DAT» với p50 và p90
  bằng 30 000; bản trước vòng (`1be143a82`) cùng chỗ vá thoát 2 «khong phai do tre».
- AC-2: Given mọi lượt E24 hỏng và có ít nhất một lượt hỏng KHÔNG vì quá hạn (tác tử nộp hỏng, lỗi model, không mở được lượt),
  When `do-tre.mjs` đọc xong số, Then hành vi giữ nguyên như AC-2 của `thuoc-tro-ly-okr-khong-lot`: chặn sớm, mã 2, câu «khong
  phai do tre» kèm dòng lỗi model nguyên văn — chạy thật `--lan 2` với hạn chờ 180 s và khoá Gateway sai; và ma trận viết trước
  {20 hỏng không quá hạn, 10 quá hạn + 10 hỏng, 1 quá hạn + 19 hỏng: chặn; 20 quá hạn, 19 hỏng + 1 lành, 0 lượt: không chặn}.

## Coverage

Quét tay một trục — kiểu hỏng của 20 lượt: {không hỏng · hỏng một phần · hỏng hết không quá hạn · hỏng hết trộn quá hạn với lỗi
khác · quá hạn hết} → AC-1 (quá hạn hết), AC-2 (các ô còn lại). Ca trộn là Hỏi-1 (`d-20261015T120940Z-6`), soạn theo khuyến
nghị. Bản sửa × bản trước vòng → AC-1. `[CE chưa kiểm chứng]`

## Out of scope

- Đổi hạn chờ 180 s, `hongMs`, ngưỡng p50/p90, hay `do-tre.sql` của `tro-ly-okr-de-xuat`.
- Bắt một lượt quá hạn lẻ (1/20) thành trượt khi p50/p90 vẫn dưới ngưỡng — ngưỡng quyết như cũ.
- Sửa lời khai `expected` của E24 trong `tro-ly-okr-de-xuat/evals.yaml` — hồ sơ đã ký.

## Notes

- `do-tre.mjs` nằm trong `paths` của `tro-ly-okr-de-xuat` (E24 gọi model thật, khoảng 35 phút, khoảng 1 USD) và
  `thuoc-tro-ly-okr-khong-lot` (E2, E3) — PR ghim lại cả hai.
