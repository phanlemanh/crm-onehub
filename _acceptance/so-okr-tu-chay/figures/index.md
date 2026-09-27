# Hình tại điểm quyết định — Cổng Phạm vi so-okr-tu-chay

| Điểm | Đếm | Hình |
|---|---|---|
| Nguồn khoá khi công bố; sau công bố chỉ thêm số đo cạnh; đo cạnh điền sẵn vào cập nhật tuần (sổ d-…-5, giả định 6, gap-probe P1 #1) | hai nhánh rẽ (nháp / đã công bố) × ba bước (đặt nguồn → chụp → cập nhật tuần) | `vong-doi-nguon` |
| Chụp mỗi ngày trên nhịp dispatch, một dòng mỗi KR mỗi ngày, trần mỗi nhịp (sổ d-…-2, giả định 4, gap-probe P1 #4) | ba bước nối tiếp (nhịp → chọn KR chưa chụp → đếm/đọc → ghi dòng + currentValue) | `nhip-chup` |
| Bấm vào số tính lại theo định nghĩa trong dòng chụp (sổ d-…-3, giả định 7) | dưới ngưỡng: 2 bước | — |
| Google Sheets bằng tài khoản dịch vụ (sổ d-…-4, giả định 8) | dưới ngưỡng: 1 lựa chọn, 3 phương án — bảng chữ đủ | — |
| Bỏ design-pass (sổ d-…-6) | dưới ngưỡng: 1 bước | — |
| Kỳ đo = chu kỳ (sổ d-…-7, giả định 2) | dưới ngưỡng: 1 bước | — |
| Quy công theo phòng ban chính lúc đếm (giả định 3) | dưới ngưỡng: 1 bước | — |

## Đề bài `vong-doi-nguon`

- Loại hình: sơ đồ luồng có nhánh (flowchart), ngang.
- Nút: «KR mới» → rẽ «Mục tiêu còn nháp» / «Mục tiêu đã công bố». Nhánh nháp: «Đặt nguồn: tay · CRM · API · Sheets» → «Nguồn hiệu lực = nguồn đã chọn» → «Số máy lái tiến độ; cập nhật tuần khoá ô số». Nhánh đã công bố: «Nguồn khoá» → rẽ «KR tay» → «Thêm số đo cạnh» → «Số máy hiện cạnh số tay tới hết kỳ; cập nhật tuần điền sẵn số máy, người sửa được» / «KR nguồn máy» → «Đổi hay gỡ nguồn: từ chối».
- Nhãn bằng chữ tiếng Việt, không mũi tên chữ.
- AC liên quan: AC-3, AC-7, AC-11.

## Đề bài `nhip-chup`

- Loại hình: luồng tuần tự (process), dọc.
- Nút: «Nhịp dispatch mỗi phút» → «Ngày = hôm qua (giờ VN)» → «Chọn KR nguồn CRM/Sheets, chu kỳ đang ghi được, chưa có dòng của ngày» → rẽ «CRM: đếm từ đầu kỳ tới hết ngày» / «Sheets: đọc ô (trần mỗi nhịp; lỗi ghi nguyên nhân, thử lại sau)» → «Ghi một dòng lịch sử (chỉ thêm)» → «KR có nguồn hiệu lực máy: cập nhật số hiện tại · KR đo cạnh: không đụng». Chú thích: «Nhịp sau cùng ngày: không còn KR nào → một câu truy vấn».
- AC liên quan: AC-4, AC-5, AC-10.
