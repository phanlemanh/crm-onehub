---
schema_version: 1
slug: gia-co-gom-tin-hieu
feature: Một tín hiệu cài lời dặn không lấy được khoá nào của lịch gom và không đẩy được gì ngoài PR đề xuất
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-21T14:19:34Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: TH2b
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng TH2b của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Tín hiệu và trang Lộ trình theo kit 2.33 — 29/10/2026.

Một tín hiệu cài lời dặn không lấy được khoá nào của lịch gom và không đẩy được gì ngoài PR đề xuất

Vì sao: Lịch gom (TH2) đưa nội dung tín hiệu người ngoài nhập vào lời dặn của phiên gom, trong khi phiên đó được chạy lệnh tuỳ ý và biến môi trường của nó có token ghi kho cùng khoá mô hình; bước hậu kiểm chỉ soi tệp bị đổi nên không thấy kiểu lạm dụng này.

## Ngưỡng chết / ngưỡng UAT

- Không đo được — thước, CI hay công cụ nội bộ của kho (ci); không có người dùng cuối để mở phiên nghiệm thu, phép thử là bài kiểm và lượt CI của chính hồ sơ.
