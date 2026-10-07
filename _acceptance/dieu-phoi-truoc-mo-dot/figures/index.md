# Hình tại điểm quyết định — dieu-phoi-truoc-mo-dot (Cổng 1)

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 tệp trả lời hỏng được cách ly, không bỏ qua im lặng | 2 nhánh (đọc được → áp như cũ · hỏng → cách ly + sự kiện, yêu cầu coi như chưa trả lời) và 3 bước nối tiếp (hỏng → giám sát ghi lại → nhịp kế áp) | `tra-loi-hong` |
| d-2 bỏ «=» khỏi tập an toàn của lệnh bọc | 2 nhánh (lệnh thuần → bọc thẳng · còn lại → bash -c) | `lenh-boc` |
| d-3 pre-push tự chuyển sang hook của cây đang đẩy | 3 nhánh (tệp đang chạy là của cây → chạy · cây có hook khác → exec · cây không có hook → chạy tiếp) | `hook-cay` |
| d-4, d-5 hai dòng descope | dưới ngưỡng: mỗi dòng 1 bước | — |
| [GIẢ ĐỊNH] máy có realpath | dưới ngưỡng: 1 bước | — |

## Đề bài

### tra-loi-hong
- Loại: flowchart.
- Nút: «mỗi nhịp: yêu cầu gia-han có tệp trả lời» → «đọc + kiểm hình dạng được?» → có: «áp gia hạn như cũ» / không: «chuyển vào tra-loi/hong/ · một sự kiện tra-loi-hong can_phan» → «yêu cầu coi như chưa trả lời; các khoá khác vẫn cấp/thu hồi trong cùng nhịp» → «giám sát ghi lại tệp đúng» → «nhịp kế áp đúng một lần».
- Nhãn so sánh: «trước: một tệp hỏng làm mọi nhịp ném — không cấp, không thu hồi».
- AC: AC-1, AC-2, AC-3.

### lenh-boc
- Loại: flowchart nhỏ.
- Nút: «hook chặn lệnh nặng chạy nền chưa bọc» → «lệnh chỉ gồm chữ, số, ./:@%+,- và khoảng trắng?» → có: «node giu-nhip.mjs -- <lệnh>» / không (có =, &&, |, nháy, $…): «node giu-nhip.mjs -- bash -c '<lệnh>'» → «thợ chép chạy: cùng stdout và mã thoát như lệnh gốc».
- Nhãn lỗi cũ: «TZ=UTC node … từng đi nhánh thẳng → ENOENT, thoát 127».
- AC: AC-4.

### hook-cay
- Loại: flowchart / sequence.
- Nút: «git push từ worktree» → «git chạy .githooks/pre-push của checkout chính (core.hooksPath)» → «gốc cây đang đẩy có .githooks/pre-push?» → không: «chạy tiếp vòng lệnh này» / có: «realpath giống tệp đang chạy?» → giống: «chạy vòng lệnh» / khác: «exec bash <hook của cây> — giữ argv và stdin (dòng ref)» → «hook của cây tự nhận ra mình → chạy vòng lệnh của cây, khớp gate-shape của cây».
- Nhãn lỗi cũ: «reported no test summary khi hai bản lệch».
- AC: AC-5.
