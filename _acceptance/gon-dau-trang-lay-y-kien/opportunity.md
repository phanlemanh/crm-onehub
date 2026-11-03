---
schema_version: 1
slug: gon-dau-trang-lay-y-kien
feature: Trên điện thoại 390×812, người góp ý mở Lấy ý kiến và thấy nút Gửi ngay trong màn đầu, không phải cuộn
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-20T07:47:01Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VK13
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VK13 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Trên điện thoại 390×812, người góp ý mở Lấy ý kiến và thấy nút Gửi ngay trong màn đầu, không phải cuộn

Vì sao: Nút «Gửi» của Lấy ý kiến ở 390×812 nằm 927px trên onehub (941px sau VK2) — quá màn đầu 812px; hồ sơ đã ký dot-hoi-y-tuong-okr E12 bước 5 đỏ sẵn trên nền. Chủ kho chọn (a) cho V1-4 ngày 20/10: ghi đỏ sẵn trên thẻ VK2 và tách việc riêng.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Ở 390×812 nút «Gửi» của Lấy ý kiến nằm trọn trong màn đầu; dot-hoi-y-tuong-okr E12 bước 5 xanh lại mà không đổi hình đã ký của hồ sơ khác» chưa?
- Kết quả nào là SỐNG: Ở 390×812 nút «Gửi» của Lấy ý kiến nằm trọn trong màn đầu; dot-hoi-y-tuong-okr E12 bước 5 xanh lại mà không đổi hình đã ký của hồ sơ khác
- Kết quả nào là CHẾT: chưa đạt «Ở 390×812 nút «Gửi» của Lấy ý kiến nằm trọn trong màn đầu; dot-hoi-y-tuong-okr E12 bước 5 xanh lại mà không đổi hình đã ký của hồ sơ khác» khi hết timebox
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
