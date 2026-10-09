---
schema_version: 1
slug: khung-khong-con-dung-chu
feature: «Khung "Bản ghi này không còn" không nói chắc nguyên nhân»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-09T05:25:03Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

Nguồn: Ngoài-2 của `khung-loi-ban-ghi-dung-ly-do` (K4b), Cổng 2 2026-10-09T05:25:03Z — anh chọn «mở hợp đồng mới» (luật 26 của đợt `sau-14-10`). Hàng K4c, chuyển sang làn P6, ưu tiên 0.5.

## Vấn đề & ai gặp

Khung «Bản ghi này không còn» trong ngăn bản ghi (cá nhân, công ty, thoả thuận, kế hoạch) có câu mô tả nói chắc «Đã có người xoá vĩnh viễn bản ghi này nên không mở lại được.» Nhưng máy chủ trả NOT_FOUND cả khi bản ghi bị Xoá (bản ghi chưa có lịch sử) và khi đường dẫn gõ sai hay bị cắt cụt (Ngoài-4 của K4b, cùng gốc). Người mở một liên kết hỏng đọc thấy một lời buộc đồng nghiệp đã xoá vĩnh viễn — sai sự thật và gây hoảng.

## Ngưỡng chết / ngưỡng UAT

- Không đo được — đổi một câu chữ trong khung lỗi; không có hành vi người dùng nào đếm được trong hai tuần, phép thử là câu chữ không còn khẳng định nguyên nhân.

## Out of scope từ khám phá

- Tiêu đề «Bản ghi này không còn» giữ nguyên (ngoài phạm vi Ngoài-2).
- Phân biệt các nguyên nhân NOT_FOUND ở máy chủ (đã xoá hay đường dẫn sai) — cần đổi API.
