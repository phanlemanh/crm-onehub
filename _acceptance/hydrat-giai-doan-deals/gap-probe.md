---
slug: hydrat-giai-doan-deals
at: 2026-09-30T10:38:30Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | evals | E3 đọc chữ ô sau `act(hydrateRoot)`, mà `act` đã chạy xong effect nạp dữ liệu của `HydrationBoundary` — vế «không qua mã thô» của AC-3 không đo được | Trên bản 6e431a01 ô vẽ mã thô rồi đổi sang nhãn ngay trong `act`; e3 xanh trên bản lỗi, E1d luôn in «LOT: e3» | MutationObserver gắn trước hydrat, ghi mọi giá trị chữ; chuỗi phải toàn nhãn | fixed: E3 đọc chữ ban đầu + ghi mọi giá trị qua MutationObserver trong suốt `act`; chiều đỏ ghim chuỗi bắt đầu bằng QUALIFIED_TO_BUY |
| P1 | evals | E6 có thể xanh trên bảng rỗng: không số ô tối thiểu, nhãn lấy từ đâu cũng tính, không đòi đủ ba loại OPEN/WON/LOST, bộ nghe lỗi Chrome không đối chứng dương [gioi-han-duyet-cay-okr#F1] [khep-ky-okr#F1] | Người mới không thấy deal nào → «mã thô: 0», kiểm sắc trên tập rỗng, «0 hỏng» | Ô = 3 và = số dòng deals.list; mỗi loại một ô; đối chứng dương bộ nghe | fixed: lượt đo tự tạo ba deal (một mỗi loại) qua API và lọc theo mã lượt; ô bảng = 3 = số dòng deals.list; tiêu đề cột Kanban là nhãn; đối chứng dương: một lần tải cố ý đổi chữ ô trước hydrat, bộ nghe phải đếm ≥ 1 |
| P1 | evals | E5 chỉ kiểm tên, số tiền và công ty khi có `companyId`; tiền tệ, ngày chốt và công ty người chọn không kiểm [khep-ky-okr#F1] | Sau tách thân ngăn, tiền tệ cũ hoặc ngày chốt không bị xoá; E5 vẫn xanh | Ma trận sáu assert viết trước | fixed: E5 thành ma trận sáu dòng (tên, số tiền, tiền tệ, ngày chốt, công ty truyền vào, công ty người chọn); chiều đỏ riêng cho tiền tệ |
| P2 | evals | E1d tìm chuỗi ghim trong cả đầu ra, không gắn với từng ca; tệp test nạp tên mới thì mọi ca đỏ vì lỗi nạp [may-soan-de-xuat#F1] | Bốn ca đỏ vì lỗi nạp nhưng đầu ra vẫn có đủ chuỗi → «DO DUNG GHIM» giả | Chạy riêng từng ca; lỗi nạp thoát 2; tên ca không chứa chuỗi ghim | fixed: E1d chạy riêng từng ca, đòi dòng (fail) của đúng ca và chuỗi ghim trong lần chạy đó; lỗi nạp thoát 2; test chỉ nhập CreateDealSheet |
| P2 | evals | E8 chỉ kiểm chuỗi trong lệnh `kto_man_giu`, không chạy nó; E7 chạy lệnh riêng [may-soan-de-xuat#F1] | `kto_man_giu` sai cú pháp mà E7, E8 cùng xanh; lần chấm lại khung-tao-okr-nhu-deal đỏ | E7 dùng chính `kto_man_giu` | fixed: E7 chạy `config:executors.script.kto_man_giu`; bỏ khoá `hgd_man_giu_cho` |
