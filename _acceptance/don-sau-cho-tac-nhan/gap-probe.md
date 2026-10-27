---
slug: don-sau-cho-tac-nhan
at: 2026-10-27T04:25:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ d-4 ghi khoảng mặc định là lối duy nhất, nhưng còn lối bọc một phần tử trong thẻ giữ 12/8 px; chọn «giống K7» hay «giống mọi thẻ khác» là gu nhìn. Sổ d-6 bỏ design-pass trong khi bản mẫu có sẵn [o-tep-dien-thoai#F2] | Cổng Phạm vi duyệt khoảng bằng chữ, chủ kho thấy thẻ khác K7 ở Cổng Bằng chứng rồi bắt làm lại | Một dòng sổ chỉ-người với hai lối và khuyến nghị, kèm ảnh trước/sau ở 1280 và 375 | human-gate1: thành Hỏi-1 (sổ thay d-4); design-pass nấc 1 chụp trước/sau trên bản mẫu (sổ thay d-6) |
| P0 | design | Sổ d-5 bỏ quét độ phủ theo một câu trích chỉ liên quan; bỏ translate="no" và «đổi chữ, luồng, ngưỡng» không có dòng sổ [chi-tiet-cong-ty-hai-cot#F3] | Một nơi gọi thẻ thứ ba bị sót mà không AC nào bắt; người duyệt không thấy việc bỏ translate="no" là lựa chọn đã cân | Ghi lại d-5 bằng nguồn một-lối có kết quả tìm toàn cây; thêm hai dòng descope | fixed: d-5 thay bằng dòng một-lối nêu kết quả tìm (hai nơi gọi); thêm descope translate="no" và «đổi chữ, luồng, ngưỡng» |
| P1 | evals | E5 đòi đối chiếu với K7 nhưng inputs không có ảnh K7 | Người chấm chỉ có ảnh sau; đảo thứ tự hay mất khoảng vẫn qua | Thêm ảnh K7 vào inputs, expected đối chiếu từng cặp | fixed: thêm bốn ảnh tren/duoi-nguong 1280/375 của K7 vào inputs; expected đối chiếu từng cặp, chỉ khoảng theo Hỏi-1 được khác |
| P1 | evals | E4 hứa «không sửa một dòng» mà không đo; artifact không nói bài kiểm K7 vẽ thẻ qua đâu | Phiên thợ sửa lén tệp test cho xanh mà E4 vẫn mã 0 | Bước git diff trên tệp test trước khi chạy | fixed: lệnh dsctn_k7_nguyen chạy git diff --exit-code từ merge-base trước khi chạy test; design và contract ghi bài kiểm vẽ thẻ qua BuildingAgentCard |
| P1 | evals | Ma trận E1 sáu ca thiếu bản mẫu nhập đường cũ, thẻ nhập @crm/auth, định nghĩa thứ hai; chỉ quét theo paths | Bản mẫu giữ bản sao thẻ mà E1 vẫn xanh | Thêm ba ca, quét toàn cây apps/app và packages/ui | fixed: thêm ca (g), (h), (i); quét toàn cây; 9 assert chiều đỏ = 9 phần tử |
