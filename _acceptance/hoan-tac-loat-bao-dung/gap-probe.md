---
slug: hoan-tac-loat-bao-dung
at: 2026-10-14T03:10:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-4 ghi nguồn mot-loi để máy chọn toast thành công cho hoàn tác không đổi gì; lối toast trung tính vẫn dùng được, và chọn dấu xanh hay báo trung tính là nghĩa sản phẩm `[khung-man-chung#F1]` `[khung-man-chung#F2]`. | Người duyệt đọc AC-4 như chỉ có một lối; chủ kho muốn trung tính thì chỉ phát hiện ở Cổng Bằng chứng sau khi E4, E15, E16 đã ghim. | Dòng sổ S1 mới thay d-4: câu hỏi chi-nguoi kèm khuyến nghị và lối khác. | human-gate1: dòng d-20261014T025528Z-8 thay d-4, thành câu Hỏi trên thẻ Cổng Phạm vi (khuyến nghị toast thành công) |
| P1 | evals | E1 đo «kèm stack» bằng chuỗi có mặt "hong-that" thay vì quan hệ đối số hai là err.stack; không có chiều đỏ truyền message thay stack. | Bản cài truyền err.message; đối số hai vẫn chứa "hong-that" nên E1 xanh mà log mất stack. | Khẳng định toBe(loi.stack); chiều đỏ truyền err.message thì đỏ "hlb: log khong co stack". | fixed: E1 khẳng định đối số hai === loi.stack của đúng lỗi đã ném, thêm chiều đỏ "hlb: log khong co stack"; AC-1 nói rõ đối số hai đúng là stack |
| P1 | contract | AC-5 bắt bài máy chủ đã ký của V2d chạy lại không sửa trong khi thêm khoá errored; sổ chưa xác nhận bài đó không so cả thân kết quả `[them-buoc-bao-dung#F1]`. | Bài V2d dùng toEqual thì thêm errored làm E9, E10 đỏ, sửa bài thì E11 đỏ. | Grep toEqual/toStrictEqual trong apps/api/test/hoan-tac-loat-dung-id.spec.ts. | fixed: grep 14/10 không thấy toEqual, toStrictEqual, toMatchObject — bài so từng số qua chuỗi ghép; ghi dòng sổ d-20261014T025528Z-9 làm căn cứ |
| P2 | contract | AC-3 và ma trận E3 chỉ đo ca toàn lỗi thật, không đo ca succeeded 0 có cả bỏ qua lẫn lỗi thật. | Bản cài rẽ theo errored === requested; lô {0,1,2,1} ra toast cảnh báo thay toast lỗi, E3 vẫn xanh. | Thêm ca {succeeded 0, skipped 1, failed 2, errored 1} vào AC-3 và E3 kèm chiều đỏ. | fixed: AC-3 thêm ca trộn; E3 thành ma trận 3 loại × 3 ca = 9 với chiều đỏ "hlb: lo tron khong co loi bao canh bao" |
| P2 | contract (opportunity.md) | Bốn ô ngưỡng của ô cơ hội còn «…», không ngưỡng nào có đường đo. | Cổng Giá trị không có tiêu chí cho dòng log Ngoài-7 sau gộp. | Điền câu hỏi phép đo và ngưỡng SỐNG đo sau gộp. | rejected: ô cơ hội đã ký ở Cổng Đáng (12/10) và lộ trình chỉ chứa việc dựng (CLAUDE.md, mục «Lộ trình là việc dựng»); đo trên dữ liệu thật là việc sau gộp, không phải cổng của việc dựng |
