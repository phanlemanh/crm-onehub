---
slug: thuoc-tro-ly-okr-khong-lot
at: 2026-10-15T02:35:00Z
verdict: findings
p0: 1
p1: 4
p2: 1
---

# Phản biện context sạch — thuoc-tro-ly-okr-khong-lot

Một tác tử tươi (feature-loop:cham-doc) đọc design doc, contract, evals và sổ; không đọc mã, không chạy lệnh.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | sổ | d-3 ghi một lối cho việc đổi kho của bo-ca-mau-quy-4, lựa chọn ngoài phạm vi đã duyệt; d-2 trích câu chỉ liên quan | Cổng Phạm vi ký lựa chọn của người mà không ai hỏi | Đổi thành câu hỏi, liệt hồ sơ phải ghim | human-gate1: d-8 (Hỏi-2) thay d-2, d-9 (Hỏi-3) thay d-3; bo-ca-mau-quy-4 không khai phien-tro-ly.mjs trong paths nên không phải ghim |
| P1 | evals | E1 chỉ thử hàm, không thử lệnh; eval-gop-y.mjs ngoài paths | Lệnh quên gọi chặn số dư mà E1 vẫn xanh | Chạy thật hai lệnh với máy số dư cục bộ trả số âm | fixed: E1b chạy do-tre và eval-gop-y thật, đòi mã 2, đúng câu, không dựng phiên đo |
| P1 | evals | Khuôn /v1/credits do bên đọc tự dựng | Phản hồi thật khác khuôn, chặn chết lặng | Chép phản hồi thật làm mẫu | fixed: rang/mau/credits-that.json chép từ GET /v1/credits ngày 15/10; ma trận thay số dư vào chính phản hồi đó |
| P1 | contract | Thiếu ô hỏng một phần và đối chứng dương | 19/20 hỏng lọt hay 1 hỏng làm đỏ oan | Ma trận {N, N-1, 1, 0 hỏng} | fixed: laHongHet với ma trận 5 ô, AC-2 ghi rõ chỉ khi mọi lượt hỏng |
| P1 | evals | E4 truyền tên cây tay và dò chuỗi nguồn | Tên cây mặc định trùng giữa các cây mà E4 vẫn xanh | Gọi taoKho thật ở hai cây | fixed: tiến trình con gọi taoKho thật với PHIEN_DO_TEN_CAY khác nhau, bun giả bắt đối số --ten; bản trước vòng ra kho chung |
| P2 | evals | E3 không đòi dòng lỗi model | Đường tới tac-tu.log sai, in «khong co dong loi model» mà vẫn xanh | Đòi dòng lỗi | fixed: E3 đòi 'AI Gateway rejected the provided API key' |
