---
slug: truong-mot-cach-cu-xu
at: 2026-10-21T00:00:30Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Đối chứng của E3b đòi lỗi máy chủ ở trường chuẩn Tên vẫn in câu máy chủ, trái luật một trường một cách cư xử; mã từ chối cho Chọn và Người chưa có | Máy chủ từ chối khi sửa Tên chuẩn thì toast tiếng Anh, trường tự tạo cùng kiểu tiếng Việt, nên người dùng phân biệt được hai loại; E3b vẫn xanh | E3b: lượt lưu Tên bị từ chối ra «Chưa lưu được Tên.» + câu mã khac; mã lua-chon, nguoi; so đúng chuỗi ghép; ô về giá trị cũ | fixed: AC-3 mở cho cả trường chuẩn, design thêm mã lua-chon, nguoi, khac, E3b ba ca so đúng chuỗi ghép và giá trị cũ; sổ d-…-13 thay d-…-4 |
| P0 | design | Dòng sổ thẻ a + nút Sửa ghi mot-loi trong khi lối hàng là đích sửa + nút Mở vẫn sống | Chủ kho chọn lối kia sau khi dựng thì AC-5, E5 và ST-phieu-doc phải viết lại | Dòng chi-nguoi Hỏi-2 nêu hai lối kèm giá | human-gate1: Hỏi-2 (d-…-14 thay d-…-5); AC-5 viết theo lối máy khuyên |
| P0 | design | Trần 6 chữ số thập phân ghi mot-loi và mâu thuẫn câu không làm tròn | Giá trị 0,0000001 hiện 0 trên phiếu và bảng; E2 vẫn xanh | Bỏ trần thấp; E2 thêm hienThiSo(0.0000001) | fixed: maximumFractionDigits 20 ở design, E2 thêm ô 0,0000001; sổ d-…-15 thay d-…-6 |
| P1 | evals | E6 vẽ cả hai bộ mô tả bằng chính OTruongPhieu nên DOM trùng theo định nghĩa; E1 chỉ đo vắng mặt danh sách tên | Phiếu gọi hàm khai nhưng vẫn vẽ Trang web bằng chữ trơn ở DetailSheetProperty; E1, E6, E7 xanh | E6 dựng ba Overview thật, tìm hàng theo nhãn trên DOM phiếu; E1 vế dương AST tập khoá chuẩn qua bảng | fixed: E6 so trên DealOverview, CompanyOverview, ContactOverview thật kèm đối chứng thước mù; E1 thêm vế 'truong chuan khong qua bang' |
| P1 | contract | AC-9 không phán được: kiểu chỉ có ở trường tự tạo lộ ngay; vị trí hàng tự tạo chưa nói | Người chấm E9 theo chữ thì REJECT vì hàng ô tích lộ; lỏng ra thì phán bập bênh | AC-9 theo cặp kiểu; khai vị trí; do-man kiểm cùng cha, không tiêu đề hay phân cách | fixed: AC-9 viết lại theo cặp và khai vị trí sau Người phụ trách; E9 thêm kiểm 'khoi rieng'; sổ d-…-16 descope xen giữa chờ DA15 |

Ngoài trần 5 (agent nêu thêm, đã xử lý):

- Ngưỡng «gõ 1.234,5 lưu được ngay lần đầu» chưa có thước → fixed: thêm dòng ở «Đường đo» trỏ AC-2.
- E3 đọc câu từ chính crmMessages nên không ghim khuôn → fixed: E3 ghim «Ô này nhận» + «ví dụ» cho năm mã, nhãn cho mã trong.
- Dòng sổ d-…-3 (đọc số ở ô) ghi mot-loi trong khi lối gửi kèm locale vẫn sống → rejected: quyết định không đổi, căn cứ đúng là luật «Parse at the boundary» của AGENTS.md; không làm Cổng Phạm vi ký sai.
