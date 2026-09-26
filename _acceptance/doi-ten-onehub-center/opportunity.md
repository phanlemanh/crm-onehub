---
schema_version: 1
slug: doi-ten-onehub-center
feature: Đổi tên sản phẩm thành OneHub Center trên mọi chữ người đọc, và làm lại cột trái trang đăng nhập
owner: manh.phan@onemount.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-09-26T13:57:51Z
prototype:
  base_commit: d864d529
  disposition: archive
---

> **Ghi bù.** Ô cơ hội này được lập SAU khi vòng đã qua Cổng Phạm vi (26/09 11:07 UTC) và
> đã làm xong S3, theo nhắc của phiên điều phối: một việc T3 chạm 113 tệp mà chưa ai trả
> lời «có đáng làm không». Chủ kho quyết ở Cổng Đáng trước khi ký Cổng Bằng chứng; quyết
> `park` hay `kill` thì nhánh không merge.

## Vấn đề & ai gặp

Sản phẩm chạy ở `onehub.center`, nhưng màn hình, tên tab, thư mật khẩu và tin bot Zalo gọi
nó là «CRM». Người dùng gõ một địa chỉ rồi đọc một tên khác. Chữ «CRM» còn kéo theo nghĩa
bán hàng mà `CONTEXT.md` đang gạt (mục *Nhân viên quan hệ đối tác*: «họ không bán gì cho
ai»), trong khi đợt người mới 26/10 là người ngoài khối kinh doanh vào dùng OKR.

Trang đăng nhập — cửa vào của đúng đợt người mới đó — ở khổ màn thật (1860px) để trống hai
phần ba cột trái: khối «Lần đầu vào?» là một hộp 448px, dòng giới thiệu là chữ nhỏ ở đáy.
Chủ kho thấy trang «đơn điệu, không giống các trang khác» (26/09).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Người dùng nhận ra sản phẩm qua tên miền và tên trên màn, nên hai thứ trùng nhau bớt được một câu hỏi «CRM là gì / vào đâu» | Đổi tên chỉ là chi phí (113 tệp, 3 thước đã ký phải thế tên) mà không ai thấy khác | Hỏi 3 người mới đợt 26/10 sau lần vào đầu: sản phẩm này tên gì | Chưa thử |
| 2 | Cột trái có điểm neo và ba bước nối nhau làm người mới đọc hướng dẫn trước khi bấm Google | Làm lại bố cục không đổi hành vi; chỉ còn giá trị thẩm mỹ | Lái-thử người lạ trên màn rộng: có đọc «Lần đầu vào?» trước khi bấm không | Chưa thử |
| 3 | Không gian đang tên «CRM» ở máy chủ thật hiện «OneHub Center» ở đầu trang là đủ, không cần sửa dữ liệu | Người dùng thấy «CRM» ở Cài đặt và «OneHub Center» ở đầu trang, lại hai tên | Mở Cài đặt › Không gian làm việc trên máy chủ thật sau khi ship | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi đổi, người dùng có gọi sản phẩm bằng một tên, và người mới có tự qua trang đăng nhập không?
- Kết quả nào là SỐNG: Trong 14 ngày từ ngày ship, 0 chữ «CRM» nào người dùng báo thấy trên màn, thư hay tin Zalo; VÀ tỉ lệ người mới phải nhắn quản trị viên hỏi cách vào không tệ hơn ngưỡng sống của hồ sơ `cua-vao-dang-nhap` (≤ 10%).
- Kết quả nào là CHẾT: Người dùng báo hai tên cho một sản phẩm (ví dụ «CRM» ở Cài đặt, «OneHub Center» ở đầu trang) từ 3 lần trở lên; HOẶC tỉ lệ hỏi cách vào tệ hơn trước khi ship.
- Timebox: Vòng này đã tới S4; không mở vòng sửa thứ hai chỉ vì thẩm mỹ.

Căn cứ: cùng thước tin nhắn hỏi quản trị viên của hồ sơ `cua-vao-dang-nhap`, để hai vòng
chạm cùng trang đăng nhập đo trên một mẫu số; phần tên thì đếm lời báo của người dùng,
vì kho không gửi sự kiện trình duyệt nào (`docs/telemetry.md`).
