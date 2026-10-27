---
schema_version: 1
slug: bao-loi-tac-nhan-sau-cau-hoi
feature: Tác nhân hỏng trong lúc dựng thì người dùng nhận đúng một thông báo, kể cả khi đã trả lời một câu hỏi giữa chừng
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-27T00:40:54Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VS11
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Chủ kho gõ ở phiên VS11 lúc 2026-10-27T00:40:54Z: «Cổng Đáng bao-loi-tac-nhan-sau-cau-hoi: làm».

Mở từ hàng VS11 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: chưa gắn — hàng nằm trong backlog «Làn Mac Studio · thứ 21»; chủ kho giao MacBook Pro làm thay ngày 27/10 (crm-onehub#375).

Tác nhân hỏng trong lúc dựng thì người dùng nhận đúng một thông báo, kể cả khi đã trả lời một câu hỏi giữa chừng.

Nguồn: Ngoài-11 của hồ sơ `ve-sinh-do-san-onehub` — chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 17/10 (dòng sổ `d-20261017T085015Z-36`), rồi «thêm» hàng VS11 vào lộ trình (#470).

Người gặp: người dựng tác nhân trong khung trò chuyện với Kara. Khi dựng, thẻ «Đang dựng» hứa «Bạn có thể rời trang. Kara sẽ báo trong hộp thông báo khi xong.». Nếu Kara hỏi một câu giữa chừng, người trả lời, rồi lượt dựng hỏng, hộp thông báo hiện không nhận gì: máy chỉ báo hỏng khi lần gửi cuối là lệnh dựng, còn câu trả lời là một lần gửi khác. Người đã rời trang vì tin lời hứa sẽ không biết việc dựng đã dừng.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: một lượt dựng hỏng — có hay không có câu hỏi giữa chừng — có để lại đúng một thông báo «hỏng» cho người dựng không.
- SỐNG: mọi ca hỏng trong lúc dựng (hỏng ngay, hỏng sau khi trả lời một hay nhiều câu hỏi) cho đúng một thông báo «hỏng»; trò chuyện thường hỏng vẫn không báo; ca đang có cũng không đổi số thông báo.
- CHẾT: còn một ca hỏng trong lúc dựng mà hộp thông báo trống, hoặc một lượt hỏng sinh từ hai thông báo trở lên.
- Timebox: một ngày công; sau gộp, đọc 14 ngày dữ liệu thật: số lượt dựng hỏng so với số thông báo «hỏng».
