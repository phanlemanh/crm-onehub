# Hình tại điểm quyết định — slack-thieu-quyen-email

| Điểm | Đếm | Hình |
| --- | --- | --- |
| d-3 — xét từng người: không email, không dòng khớp thì không xác định, và lượt bị từ chối | bảy nhánh cho một người, rồi ba nhánh cho cả lượt | `luat-tung-nguoi` |
| d-4 — người ngoài danh bạ và người có email ngoài CRM vẫn không tính | dưới ngưỡng: một nhánh, nằm trong hình trên | — |
| d-5 — tệp kiểm riêng cho lượt này | dưới ngưỡng: một lựa chọn, không nhánh | — |
| d-1, d-2 — bỏ design-pass, bỏ đặc tả UX | dưới ngưỡng: không chạm màn | — |
| [GIẢ ĐỊNH] người ngoài danh bạ là người của tổ chức khác | dưới ngưỡng: một câu | — |
| [GIẢ ĐỊNH] đủ quyền thì mọi thành viên thật đều có email | dưới ngưỡng: một câu | — |

## Đề bài `luat-tung-nguoi`

- Loại hình: sơ đồ luồng quyết định (flowchart), đọc từ trên xuống.
- Phần một, cho từng người ở đích: bot hay đã xoá → không tính · không có trong danh bạ → không tính · dòng khớp hoặc email trỏ tới người vai «chỉ OKR» → **chặn** · dòng khớp tới vai đầy đủ, hoặc có email → cho qua · không email, không dòng khớp → **không xác định** (ô mới của lượt này, tô khác).
- Phần hai, cho cả lượt: có người bị chặn → từ chối «có người không đọc được dữ liệu đối tác» · không ai bị chặn mà có người không xác định → từ chối «không kiểm được người nhận», kèm số người và câu «kết nối lại Slack» · còn lại → đăng.
- Nhãn bằng chữ tiếng Việt thường; AC liên quan: AC-1, AC-3, AC-4, AC-5, AC-6, AC-7.
