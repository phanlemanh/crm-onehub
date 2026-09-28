# Điểm quyết định tại Cổng Phạm vi — tro-ly-okr-nen

| Điểm | Đếm | Hình |
|---|---|---|
| Việc của Trợ lý OKR đi qua hai lớp kiểm trần rồi đóng theo mã (sổ: một đường chạy trọn ở 9a; lease 30 giây, đóng trong 90 giây) | 5 bước nối tiếp, 4 nhánh rẽ (sẵn sàng / không; thành công / lỗi con / lượt hỏng / chết im) | `luong-viec-okr` |
| Sổ chi phí suy việc theo kênh, rồi mục đích phiên, rồi thư mục subagent (sổ: hook con dùng hằng thư mục; thêm hook vào hai subagent của hãng) | 3 bước nối tiếp, 10 nhánh | `suy-viec` |
| Phạm vi theo từng việc thay cho việc × đơn vị | dưới ngưỡng: 1 bước, 0 nhánh — bảng trong thẻ là đủ | — |
| Hai khối chỉ quản trị thấy | dưới ngưỡng: 1 bước, 1 nhánh | — |
| Đối soát lọc theo khoá; OIDC thì «không đối soát được» | dưới ngưỡng: 1 bước, 1 nhánh | — |
| Model `google/gemini-3.8-flash` | dưới ngưỡng: 0 bước | — |
| Bỏ `nop_tom_tat` sang 9c | dưới ngưỡng: 0 bước | — |
| Chạy design-pass | dưới ngưỡng: 0 bước | — |
| Ba dòng giả định trong Coverage (ai là quản trị; tháng VN cho trần, UTC cho đối soát; trần 0 là không chạy) | dưới ngưỡng: mỗi dòng 1 nhánh | — |

## Đề bài `luong-viec-okr`

- Loại hình: flowchart ngang, hai làn (Máy chủ dữ liệu · Tác tử), khổ vừa một màn.
- Nút: «Xếp việc — kiểm sẵn sàng + trần» → «Hàng việc» → «Nhịp dispatch — kiểm lại» → «Agent gốc chuyển tiếp một lần» → «Trợ lý OKR nộp đề xuất» → «Đóng việc theo mã».
- Nhánh: không sẵn sàng ở bước 1 → «Không ghi hàng»; hết trần ở bước 3 → «Đóng: không chạy, không mở phiên»; lỗi phiên con / lượt hỏng → «Đóng ngay: hỏng + mã»; chết im → «Dọn việc treo sau 30 giây → đóng: hết lease».
- Nhãn bằng chữ tiếng Việt, không tên hàm; chú thích nhỏ «tối đa 90 giây» ở nhánh chết im.
- AC liên quan: AC-3, AC-4, AC-5, AC-6.

## Đề bài `suy-viec`

- Loại hình: cây quyết định dọc.
- Gốc: «Một bước gọi model». Tầng 1: «Phiên con?» có → theo thư mục (Trợ lý OKR → Trợ lý OKR · Chạy Tác nhân → Tác nhân · Dựng Tác nhân → Tác nhân). Không → «Kênh?» hội thoại trong CRM → Trợ lý AI · Zalo → Hỏi CRM qua Zalo · hàng việc → «Mục đích phiên?» nghiên cứu → Nghiên cứu danh bạ · OKR → Trợ lý OKR (chuyển tiếp) · dựng/chạy Tác nhân → Tác nhân · không khớp → Chưa gán việc.
- Lá tô theo năm nhóm trên màn cộng «Chưa gán việc» xám.
- AC liên quan: AC-1, AC-10.
