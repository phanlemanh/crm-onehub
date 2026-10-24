---
schema_version: 1
slug: bam-kr-mo-chi-tiet-kr
feature: Người dùng bấm một KR ở Của tôi, Cây căn chỉnh, Việc OKR hay trong chi tiết mục tiêu thì mở chi tiết KR, không mở chi tiết mục tiêu; chữ «Cập nhật tuần» dùng như danh từ thành «Cập nhật»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-24T05:20:00Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: SV6
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Hàng SV6 của «OKR» (`docs/plan/lo-trinh-okr.json`, thêm qua #557).

Người dùng bấm một KR ở Của tôi, Cây căn chỉnh, Việc OKR hay trong chi tiết mục tiêu thì mở chi tiết KR, không mở chi tiết
mục tiêu; chữ «Cập nhật tuần» dùng như danh từ thành «Cập nhật».

Vì sao: chủ kho 24/10 — «Đối với Tablility: Click vào Objective -> Chi tiết Objective. Click vào KR -> Chi tiết KR. Đối với
OneHyb CRM: Click vào Objective -> Chi tiết Objective. Click vào KR -> Chi tiết Objectvie. Điều này dẫn đến cả ux check in
tuần không rõ ràng đáng lẽ nên: Click vào KR -> Chi tiết -> Click vào Checkin -> Chi tiết form checkin.» Bốn chỗ trên onehub
`09d7d1dcf` bấm KR mà mở mục tiêu, hoặc tên KR không bấm được (ghi chú `SV6-luat-bam-kr.md` của giám sát). Chữ: «nếu mang
ý nghĩa cập nhật (check-in) thỉ bỏ từ "tuần". vì có thể checkin bất cứ lúc nào».

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: bấm KR ở bốn chỗ đã nêu có mở chi tiết KR (`?record=…kr:<id>`) chưa, và còn chuỗi «Cập nhật tuần» dùng như danh từ nào trên màn hay trong tin nhắc không?
- Kết quả nào là SỐNG: cả bốn chỗ mở chi tiết KR; không còn «Cập nhật tuần» dùng như danh từ trong tệp chữ app và tin nhắc agent; cụm «… tuần này» giữ nguyên
- Kết quả nào là CHẾT: còn một chỗ bấm KR mở chi tiết mục tiêu khi hết timebox
- Timebox: 2026-10-26 (mốc Họp tuần của đợt okr-hop-tuan-2210)

Cổng Đáng: chủ kho 24/10, nguyên văn «Đồng ý hết theo khuyến nghị», giám sát vk chuyển lời cho dãy V2 cùng ngày (việc A:
«Làm ngay SV6 `bam-kr-mo-chi-tiet-kr`»).
