---
schema_version: 1
slug: cua-toi-chi-liet-kr
feature: Người phụ trách KR mở Của tôi hay bấm tin nhắc 08:30, thấy các KR cần cập nhật tuần này, bấm một KR thì ngăn KR mở trong bộ OKR của nó và cập nhật bằng hộp một KR
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: SV1
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng SV1 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: chưa có trang: trang nền, trang đợt okr-sau-vo-khu-2410, mã LB
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Người phụ trách KR mở Của tôi hay bấm tin nhắc 08:30, thấy các KR cần cập nhật tuần này, bấm một KR thì ngăn KR mở trong bộ OKR của nó và cập nhật bằng hộp một KR

Vì sao: Hôm nay có hai đường cập nhật: bảng hàng loạt ở Của tôi (phan-can-cap-nhat.tsx → BangCapNhat, lối nhac · viec-cua-toi · cua-toi trong LOI_VAO) và hộp một KR từ ngăn KR; tin nhắc «N KR chờ» dẫn tới /okr?tu=nhac (nhac-ke-hoach.ts:192-193). Tability không có trang cập nhật riêng: My focus liệt KR, cập nhật trong ngăn KR (README hop-tuan §4, ảnh tab/t09-my-focus.jpg, tab/t03-ngan-kr.jpg).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Của tôi không còn bảng cập nhật hàng loạt; tin nhắc, Của tôi, ngăn KR và dòng bộ OKR đều mở cùng hộp một KR; bấm tin nhắc «N KR chờ» tới KR chứ không tới /okr?tu=nhac» chưa?
- Kết quả nào là SỐNG: [đề xuất] Của tôi không còn bảng cập nhật hàng loạt; tin nhắc, Của tôi, ngăn KR và dòng bộ OKR đều mở cùng hộp một KR; bấm tin nhắc «N KR chờ» tới KR chứ không tới /okr?tu=nhac
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Của tôi không còn bảng cập nhật hàng loạt; tin nhắc, Của tôi, ngăn KR và dòng bộ OKR đều mở cùng hộp một KR; bấm tin nhắc «N KR chờ» tới KR chứ không tới /okr?tu=nhac» khi hết timebox
- Timebox: [đề xuất] 30/10/2026 — ngày của hàng SV1; đo bằng bài kiểm máy trên dữ liệu mẫu `okr:mau`, không chờ người dùng thật (CLAUDE.md «Lộ trình là việc dựng»).
