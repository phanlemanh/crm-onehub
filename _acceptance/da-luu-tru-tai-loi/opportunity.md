---
schema_version: 1
slug: da-luu-tru-tai-loi
feature: «Đã lưu trữ» báo lỗi tải và cho thử lại
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-08T06:18:48Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

## Vấn đề & ai gặp

Quản trị viên ở Cài đặt › Giai đoạn thoả thuận. Khi việc tải danh sách giai đoạn đã lưu trữ
(`giaiDoan.archived`) bị lỗi, mục gập «Đã lưu trữ (n)» biến mất (ArchivedList trả `null` khi
danh sách rỗng): không thông báo, không nút thử lại — trông y như không có giai đoạn nào đã cất,
trong khi thông báo lưu trữ và hộp thoại chuyển thoả thuận vẫn bảo người dùng tìm giai đoạn ở đó.
Lệch `docs/settings.md` mục «Trạng thái» (lỗi tải = `Empty` có nút thử lại; không trả rỗng im lặng).

Nguồn: Ngoài-3 và Ngoài-5 (cùng một lỗi) của `danh-sach-keo-chung`, S4 round 1 (2026-10-08);
anh chọn «mở hợp đồng mới» ở Cổng Bằng chứng 2026-10-08 — luật 26 của đợt sau-14-10 tính là
Cổng Đáng `build` (dòng sổ d-20261008T061848Z-12, d-20261008T061848Z-14).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Lỗi tải danh sách đã cất là hiếm nhưng có thật (mạng chập, máy chủ trả 5xx) | việc này thừa | không cần — chuẩn trạng thái của Cài đặt đòi đủ bốn trạng thái | Chấp nhận |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: khi danh sách giai đoạn đã lưu trữ không tải được, quản trị viên có biết đó là lỗi và lấy lại được danh sách mà không phải tải lại cả trang không?
- Kết quả nào là SỐNG: ở phiên nghiệm thu, giả lập lỗi tải danh sách đã cất: người thử thấy thông báo lỗi ở đúng chỗ mục «Đã lưu trữ», bấm thử lại và thấy danh sách hiện ra, 0 lần hỏi.
- Kết quả nào là CHẾT: người thử kết luận «không có giai đoạn nào đã lưu trữ» khi thật ra là lỗi tải, hoặc phải tải lại cả trang mới thấy.
- Timebox: phiên nghiệm thu đầu tiên sau khi lên production, cùng phiên với `danh-sach-keo-chung`, chậm nhất 2026-10-21.
