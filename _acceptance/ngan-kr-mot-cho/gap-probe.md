---
slug: ngan-kr-mot-cho
at: 2026-10-20T03:10:00Z
verdict: findings
p0: 0
p1: 5
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Hai nửa của AC-7 (cross-layer) không nối: E8 chỉ đếm một item, E7 tự viết tay đầu vào, E12 không đọc lại mức tự tin | Nút trên dòng gán sẵn mức tự tin hay lấy keyResultId của dòng kế mà ba eval vẫn xanh | E8 so trọn item; E7 dựng đầu vào bằng hàm thật của hộp; E12 đọc lại mức tự tin | fixed: E8 `toEqual {keyResultId, value, confidence, note}` kèm đối chứng đỏ «lech tu tin»; E7 dựng item bằng chính hàm dựng payload của hộp; E12 đọc lại cả giá trị và mức tự tin |
| P1 | contract | Ngưỡng 3 bấm chỉ đo trên KR số; KR mốc cần bấm «Xong» nên thành 4 bấm | Cổng Phạm vi ký «3 bấm cho một KR» trong khi KR mốc của bộ mẫu không đạt | Ma trận theo kiểu KR trong E8; câu hỏi lên thẻ nếu mốc là 4 | fixed: E8 ma trận ba kiểu KR (số 3, mốc 4); Hỏi-3 lên thẻ, AC-7 mang vế KR mốc «chờ Hỏi-3» |
| P1 | evals | E5 tự làm mới dữ liệu nên không đo việc ngăn tự làm mới lịch sử sau gửi; E12 không nhìn lịch sử | Gửi từ ngăn KR, ô Hiện tại đổi mà lịch sử và đồ thị vẫn cũ tới khi tải lại | trpc giả trả dữ liệu mới sau mutation, bài không tự làm mới; đếm lần gọi lại | fixed: E5 đếm lần gọi lại canhKr và lịch sử ≥ 1, đối chứng đỏ «khong lam moi: lich-su»; E12 đếm dòng lịch sử tăng 1 |
| P1 | contract | Ngưỡng ký «từ trang bộ OKR» mà hợp đồng đo trên trang đơn vị thay thế, sổ không ghi, không ràng buộc cho VK3 | VK3 dựng lại bảng không mang nút trên dòng, ngưỡng thành 6 bấm trên trang bộ OKR | Dòng sổ chỉ người có; ràng buộc cho VK3; paths phủ trang | fixed: Hỏi-4 lên thẻ; Notes ghi ràng buộc chuyển cho VK3 và paths `okr/**` của E8, E12 |
| P1 | evals | «Mọi lối» dựa trên bảy lối kê tay; quét tĩnh chỉ tìm chuỗi `so-kr`, không tìm `useMoDienBien`, không có đối chứng dương | Còn lối thứ tám gọi useMoDienBien, hay gọi so-kr qua hằng — E1 vẫn xanh | Quét mọi lời gọi mở ngăn có tham số KR, số lối === số ô ma trận; thư mục mồi làm đối chứng dương | fixed: E1 quét bằng phân tích cú pháp mọi chỗ gọi openRecord, thayDinh, useMoDienBien và hàm bọc; số lối quét === số ô; thư mục mồi phải ra đúng hai dòng |
