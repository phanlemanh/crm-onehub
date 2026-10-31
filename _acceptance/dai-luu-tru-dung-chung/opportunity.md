---
schema_version: 1
slug: dai-luu-tru-dung-chung
feature: Dải báo «Đã lưu trữ» và vùng khoá chỉ đọc là một mảnh dùng chung trong packages/ui, như docs/vong-doi.md dặn
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: V2e
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng V2e của «OKR» (`docs/plan/lo-trinh-okr.json`).

Dải báo «Đã lưu trữ» và vùng khoá chỉ đọc là một mảnh dùng chung trong packages/ui, như docs/vong-doi.md dặn

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi dải báo và vùng khoá thành mảnh chung, người mở một bản ghi đã lưu trữ có còn nhận ra ngay nó đã cất, không sửa nhầm được, và khôi phục bằng một lần bấm không?
- Kết quả nào là SỐNG: Trong 2 tuần sau bật, không Contact hay Deal nào còn archivedAt mà có updatedAt muộn hơn archivedAt, không có api_error trên route khôi phục của ba loại bản ghi, và trong phiên nghiệm thu ít nhất 2 trên 3 người nhận ra bản ghi đã lưu trữ và khôi phục được ngay lần bấm đầu.
- Kết quả nào là CHẾT: Có bản ghi đang lưu trữ bị ghi đổi sau mốc lưu trữ, hoặc có lần bấm «Khôi phục» gửi hai lệnh hay báo lỗi, hoặc dưới 2 trên 3 người trong phiên nghiệm thu nhận ra bản ghi đã cất.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
