---
schema_version: 1
slug: nhap-truong-luc-tao
feature: Nhân viên quan hệ đối tác nhập đủ các trường cần thiết ngay lúc tạo công ty, liên hệ hay thoả thuận, không phải mở lại phiếu
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-21T14:12:29Z # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA16
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA16 của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).
Mốc: 2026-10-22, mốc chung của chín hàng DA14–DA23 trong đợt viec-du-an-kho-tai-lieu (chủ kho 21/10).

Nhân viên quan hệ đối tác nhập đủ các trường cần thiết ngay lúc tạo công ty, liên hệ hay thoả thuận, không phải mở lại phiếu

Vì sao: Form tạo và ô thêm nhanh không có trường tự tạo; API tạo không nhận `fields`. Người dùng tạo xong rồi mở phiếu bấm từng ô. Đứng trên cờ «Bắt buộc» DA15 mở cho người quản trị.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: nhân viên quan hệ đối tác có tạo xong một công ty, liên hệ hay thoả thuận với đủ các trường đội cần trong một lượt, không phải mở lại phiếu để điền tiếp không.
- Kết quả nào là SỐNG: [đề xuất] ở phiên nghiệm thu, giao năm nhân viên ba việc — tạo một thoả thuận có trường tự tạo bắt buộc, thêm nhanh một cá nhân từ phiếu công ty, tạo một công ty có trường tự tạo kiểu Chọn — thì ít nhất bốn trên năm người làm xong cả ba mà không mở lại phiếu để điền trường; và trong 14 ngày đầu sau khi lên production, ít nhất 80% bản ghi người tạo (`source = MANUAL`) có giá trị cho mọi trường tự tạo đang hiện trên phiếu ngay lượt tạo.
- Kết quả nào là CHẾT: [đề xuất] đa số người vẫn tạo xong rồi mở phiếu điền từng ô, hoặc bỏ dở lượt tạo vì form chặn ở một trường họ chưa có giá trị.
- Timebox: [đề xuất] phiên nghiệm thu đầu tiên sau khi DA16 lên production, gộp chung buổi đọc số của gói truong-hop-dong.
