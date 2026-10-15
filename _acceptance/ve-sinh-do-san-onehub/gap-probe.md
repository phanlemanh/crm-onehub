---
slug: ve-sinh-do-san-onehub
at: 2026-10-15T21:40:59Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ d-20261015T213611Z-3 ghi nguồn muc-tieu nhưng câu trích chỉ phân biệt thuộc tính JSX với khoá object, không quyết miễn hinh theo tên toàn lát hay theo thành phần KhungXuong — nới thước đã ký man-cai-dat-noi-tieng-viet mà sổ ghi máy quyết [neo-thuoc-het-han#F1] | Cổng Phạm vi ký AC-6 tưởng cách nới có căn cứ; sau gộp mọi prop hinh trong lát cài đặt thoát quét mà người ký hồ sơ gốc chưa đồng ý | Ghi lại dòng sổ thành câu Hỏi cho chủ kho trên thẻ Cổng Phạm vi; AC-6 ghi chờ Hỏi | human-gate1: dòng d-...-11 (Hỏi-1, supersedes d-...-3), AC-6 mang nhãn chờ Hỏi-1, thiết kế mục 3 nêu hai lối |
| P1 | evals | E2 chỉ đòi ≥1 lỗi trên cả ma trận, không theo từng ô, không ngưỡng lực; E3 tự đặt cùng dataUpdatedAt nên giả định điều cần chứng | Merge-base chỉ lỗi ở D1 1–2/40 nên E2 đạt; bản vá ánh xạ sai khoá cho D3/D4 vẫn ra 0/40 ở E1 do may | E2 đếm theo ô, ngưỡng tái hiện ≥3/10; so queryKey thật | fixed: AC-2 và E2 đếm từng ô với nhãn tái hiện/tái hiện yếu/không tái hiện, AC-1 chỉ là bằng chứng sửa cho ô tái hiện. rejected phần so queryKey thật: ba khoá đều không có input (queryOptions() rỗng) nên khoá nạp sẵn và khoá ngăn trùng theo cấu tạo; sai khoá sẽ hiện thành lỗi ở ô tái hiện của E1 |
| P1 | contract | Nạp sẵn ba khoá trên MỌI trang mà không AC nào đo hồi quy trên trang không record= | Trang không prefetch users.list nhưng thành phần khách đọc nó: sau sửa trình duyệt có dữ liệu ở render đầu, HTML máy chủ rỗng — hydration ngược chiều trên trang đang xanh | Thêm AC và eval ma trận viết trước cho trang không record= | fixed: thiết kế đổi sang chỉ đổ trạng thái nạp sẵn khi ngăn có bản ghi (dòng sổ d-...-12); AC-12 + E19 (tám trang, 1440/390, 2 lượt) + E20 (bài DOM: ngăn rỗng không nạp) |
| P2 | evals | E2 đo cây không đổi bằng git status --porcelain; E4/E6/E10 không nói đo cách nào | Răng ghi đè config.yaml đang M hay tệp trong thư mục hồ sơ chưa theo dõi mà porcelain vẫn y hệt | porcelain -uall cộng hash-object mọi tệp đang sửa hay chưa theo dõi, có tự kiểm | fixed: E2/E4/E6/E10 dùng chung phép so porcelain -uall + hash-object, tự kiểm --tu-thu-cay |
| P2 | evals | Dòng descope bỏ ui-observed hứa ảnh cuối mỗi ô nhưng E1 không đòi ảnh | Cổng Bằng chứng chỉ có số đếm, người ký không thấy ngăn mở đúng ở 390 | E1 đòi đúng 8 ảnh, thiếu ảnh thì đỏ | fixed: E1 đòi 8 ảnh D1–D4 × 1440/390 vào .acceptance-runs/ve-sinh-do-san-onehub/evidence, evidence_required thêm screenshots |
