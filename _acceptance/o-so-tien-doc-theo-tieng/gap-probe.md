---
slug: o-so-tien-doc-theo-tieng
at: 2026-09-24T05:25:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
claims_input: ok
---

# Gap probe — o-so-tien-doc-theo-tieng

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Bước «1.5» ở màn thật (E9, E10) kết bằng Esc nên luôn xanh; chiều đỏ của E10 chỉ phủ bước tạo [go-la-cat-quyen-that#F1] | Tấm thoả thuận còn nối lối lưu cũ; gõ 1.5 rồi Enter hay rời ô thì máy chủ lưu 150, E7 và E10 vẫn xanh | Gõ 1.5, Enter, rời ô, đọc deals.byId trước Esc; chiều đỏ trên bản trước vòng | fixed: AC-9 và E9/E10 đọc bản ghi sau Enter + rời ô, trước Esc; thêm chiều đỏ «sua vi «1.5» Enter» |
| P1 | contract, evals | Đồng tiền đọc và đồng tiền gửi là một quan hệ, E6 chỉ chạy VND [keo-tha-thoa-thuan#F1] | Đổi USD sang VND sau khi gõ 1.500,50, Tạo vẫn gửi 150050 kèm VND | Ca đổi đồng tiền trên cùng form tấm tạo | fixed: thêm vế vào AC-6 và ca vào E6, kèm chiều đỏ giữ cents cũ |
| P1 | contract, evals | Ma trận E1 không có ô tooLarge, gộp ba dạng sai, âm không rõ ký tự | Chuỗi 20 chữ số ra ok với cents mất chính xác; 150, hoặc −5 lọt | Mỗi lý do có ô ở mỗi tiếng; tách sai dạng; âm với - và − | fixed: ma trận 12 dạng × 2 × 2 = 48 ô + JPY 24 + 2 đối chứng = 74 khẳng định ghim |
| P1 | contract, evals | Thêm nhanh thiếu nhánh rỗng, focus khi lỗi, khoá nút khi chưa tải thiết lập | Ô rỗng gửi 0 hoặc thiếu currency; gửi trước khi biết đồng tiền báo cáo | Ca rỗng, focus, nút khoá trong E8 | fixed: thêm ba vế vào AC-8 và E8 |
| P2 | contract, evals | translate=no của số trong dòng đọc lại chỉ ghi ở Coverage, không có AC hay eval | Tự dịch của trình duyệt viết lại con số người dựa vào để kiểm | Khẳng định translate ở E4 cả hai tiếng | fixed: thêm vế vào AC-4 và E4, kèm chiều đỏ |
