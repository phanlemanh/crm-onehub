---
slug: thu-lai-sau-45-giay
at: 2026-10-04T21:30:00Z
verdict: findings
p0: 1
p1: 5
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E6 đòi khối «hong — Thu lai roi van im» vẫn khẳng định daDung = 1, trái AC-1 bản 2 (cấm stop); khối không giả fetch nên lệnh huỷ hỏng và không có lần gửi lại | Khối đỏ dù mã đúng, hoặc phải giữ stop() để khối xanh | Khối khẳng định daDung = 0, 1 POST huỷ, gửi lại sau khép-vì-huỷ; giu-r1h đòi các khẳng định bắt buộc | fixed: AC-6 và E6 viết lại; giu-r1h kiểm nguyên văn từng khẳng định bắt buộc trong khối |
| P1 | contract, design | onFinish chạy ở mọi lần lượt khép, không riêng lần huỷ; no_active_turn với lượt xếp hàng làm lượt tự xong rồi bị gửi lại | Trả lời hai lần, tính hai lượt | Phân loại sự kiện từ lúc bấm: turn.cancelled rồi session.waiting / khép thường / khép lỗi | fixed: AC-2 thêm ba nhánh; E2 thêm ca khép thường, khép lỗi, chiều đỏ 'gui-lai-khi-khep-thuong' |
| P1 | contract | Luồng chết (nửa mở, lượt kẹt) thì không bao giờ có mốc khép; AC-4 «phiên bận: lại AC-1» lặp vòng huỷ–chờ mãi | Ô soạn khoá tới khi tải lại trang | Lối thoát sau trần | fixed: AC-3 quá trần thì stop (lối thoát duy nhất), bấm tiếp gửi thẳng; E3 chiều đỏ 'khong-loi-thoat'; hệ quả muộn ghi Out of scope |
| P1 | evals | Mã trả giả lệch eve thật (huỷ 202, gửi tiếp 200, mở phiên 202); E5 hai cặp cùng 200 nên cửa ép 200 vẫn xanh | Bản kiểm status === 200 qua hết bài mà hỏng production | Giả đúng mã; E5 ba cặp khác status; khuôn so sessionId | fixed: E2/E4/E5/E7 đổi mã; E5 thêm cặp 500 và chiều đỏ 'status-khong-bang-tro-ly'; E4 thêm ca sessionId lạ |
| P1 | design | Trần 15 giây là đoán, chưa đo thời gian từ huỷ tới turn.cancelled khi một bước mô hình đang chạy | Hầu như mọi lần bấm rơi vào trần | Đo với apps/agent-okr thật | descoped: cần gọi mô hình thật; ghi Out of scope, trần chỉnh ở cau-hinh.ts |
| P1 | evals | giu-r1h chỉ kiểm khối còn tiêu đề, phần ngoài khối không đổi và tệp xanh — khoét rỗng khối vẫn xanh | Lời hứa AC-12c không có máy chấm | Kiểm nguyên văn khẳng định bắt buộc | fixed: E6 + giu-r1h, chiều đỏ xoá khẳng định soanMo |
| P2 | design | turn.started cuối có thể là của lượt trước (initialEvents cộng dồn) | Huỷ no-op, chờ hết trần hay gửi đôi | Chỉ lấy turn.started sau message.received cuối | fixed: AC-1 và E1 (turn.started 'luot-0' cũ, chiều đỏ 'turn-id-cu') |
| P2 | contract | Nhánh «eve ném» của AC-4 hiếm; từ chối HTTP của lần gửi lại đi đường lỗi R1h và mất dòng «Đã thử lại N lần» | Đếm lại từ 1 | — | descoped: Out of scope «Giữ dòng Đã thử lại N lần khi gửi lại bị từ chối bằng mã HTTP» |
| P2 | evals | E7 «luồng không bị cắt» chưa có đối chứng — máy chủ dev không báo đóng thì luôn xanh | Thước xanh oan | Đối chứng dương đóng một luồng qua cửa | fixed: E7 bước đối chứng dương trước màn đầu, không ghi được thì KHONG DO mã 2 |

Phản biện bản 1 (04/10, trên khuôn stop()) giữ ở `gap-probe-ban-1.md`.
