---
slug: khung-trang-cai-dat
at: 2026-09-25T01:42:06Z
verdict: findings
p0: 0
p1: 4
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E3 so đỉnh tiêu đề trong từng nhóm trang (mục, con) nhưng không đo quan hệ giữa hai nhóm, mà hướng B hứa trang con thấp hơn đúng một dòng breadcrumb | breadcrumb xuống hai dòng hoặc thêm gap-6, trang con tụt 56px thay vì 20px; hai nhóm vẫn tự trùng nhau nên E3 xanh | E3 thêm hiệu top h1 Google − top h1 Chung = chiều cao hộp breadcrumb + khoảng cách khai sẵn, ở 1440 và 768 | fixed: E3 thêm 2 khẳng định quan hệ, chiều đỏ mb-4 cho ô breadcrumb; AC-3 nói rõ «chiều cao dòng breadcrumb cộng khoảng cách đã khai» |
| P1 | design | `width=full` giữ max-w-7xl mx-auto nên Tổ chức căn giữa khi vùng nội dung rộng hơn 1280px; E3 chỉ đo 1440 và 768 | ở 1920, mép trái h1 của Tổ chức nhảy (vùng − 1280)/2 so với mọi trang khác, đúng lỗi vòng này muốn xoá, E3 vẫn xanh | thêm khổ 1920 vào phép so mép trái | fixed: `full` đổi thành cả vùng nội dung, căn trái; «không truyền width» mới là hành vi cũ; E3 đo mép trái ở 1920, 1440, 768 kèm chiều đỏ «to-chuc 1920» |
| P1 | evals | E3, E4, E6, E11 chung một lần gieo có Slack chưa kết nối, nhưng E4 và Slack › Người cần Slack đã kết nối; E11 cho bỏ ô liên kết Zalo khi Zalo tắt | ma trận viết trước lặng lẽ hụt ô; máy dev tắt Zalo thì mệnh đề ba của AC-8 không còn phép đo nào | hai lần gieo khai trong bước đo, mỗi lần số ô cố định; bỏ lối thoát «tắt thì bỏ ô» | fixed: E3 khai hai lần gieo (Slack chưa/đã kết nối, Zalo bật), trang không vẽ được → mã 2; E4 nói rõ trang nào đo ở lần gieo nào; E11 không tìm thấy liên kết → mã 2 |
| P1 | design | Design chỉ kiểm kê hai lời hứa đã ký bị đổi; chưa tra 11 hồ sơ xem có ghim «Tổng quan», «Cài đặt công ty», «Công ty», `ConnectionPage`, `/settings/notifications` không; E16 bỏ qua eval ui-check | một bài kiểm hay ảnh đã ký ghim chữ cũ thì E16 đỏ hoặc eval nhìn-thấy sai lặng lẽ, không ai đưa vào vòng chấm lại | quét contract và evals của 11 hồ sơ; E16 so tập ui-check bị đụng với danh sách khai | fixed: đã quét 25/09 — «Tổng quan» chỉ trúng hồ sơ màn Tổng quan chính (không phải mục Cài đặt), `ConnectionPage`/`max-w-3xl`/«Cài đặt công ty» 0 lần trong bài kiểm đã ký; trúng thêm `noi-zalo-cho-nguoi-moi` E19 (chụp màn Thông báo của bạn). AC-12 và E16 nay khai tập ui-check bị đụng = {nhac-qua-zalo E17, noi-zalo-cho-nguoi-moi E19}, lệch → đỏ gọi tên |
| P2 | evals | E1 so chuỗi class của khối gốc đọc từ văn bản nguồn cũ, không so DOM do bản cũ dựng ra, và bỏ qua PageShellHeader cũng đổi trong vòng [zalo-qua-webhook#F1] | bọc tiêu đề và hành động trong một div mới làm 23 trang dời đầu trang, khối gốc không đổi nên E1 xanh | dựng cùng cây PageShell + header từ bản hiện tại và bản merge-base, so outerHTML | fixed: E1 nạp page-shell.tsx của merge-base ra thư mục tạm, so outerHTML của cả cây đầu trang; chiều đỏ «bọc div mới» |
