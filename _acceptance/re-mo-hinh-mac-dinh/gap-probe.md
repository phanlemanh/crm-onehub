---
slug: re-mo-hinh-mac-dinh
at: 2026-10-21T07:40:00Z
verdict: findings
p0: 4
p1: 1
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Nửa «rẻ hơn» của câu giao không có AC hay eval; opportunity.md để trống ngưỡng sống/chết mà hợp đồng tự thay bằng ngưỡng MH4. Cùng dạng [kara-khong-ghi-de-truong#F1] | Chọn DeepSeek cho kho, tiền thật gấp 4 giá niêm yết, bản lên đắt hơn mà E1–E7 xanh | AC so tiền Gateway thật với mốc model cũ; dòng sổ chỉ-người cho ngưỡng Cổng Giá trị | human-gate1: Hỏi-6 (d-20261021T072237Z-12) đề xuất ngưỡng và mốc; thêm AC-8 và E8 (in «re hon / khong re hon <vai>», ghi ngưỡng vào ô cơ hội, giữ bốn trường quyết định) |
| P0 | contract | AC-5 ghim câu lỗi ≤ 2 trong khi lối khác của Hỏi-3 (Gemini, 3 câu lỗi) là lựa chọn chủ kho nêu; lối khác của Hỏi-4 làm AC-4..6 không thoả | Chủ kho chọn Gemini, AC-5 đỏ do chính lựa chọn được mời | Ngưỡng câu lỗi đọc từ ke-hoach.json theo lối; mỗi Hỏi ghi hệ quả với hợp đồng | human-gate1: Hỏi-3 (d-20261021T072237Z-9) kèm ngưỡng theo lối, Hỏi-4 (d-20261021T072237Z-10) ghi lối khác phải cắt AC-4, AC-5, AC-6, AC-8; AC-5 và E5 đọc ngưỡng từ ke-hoach.json, có đối chứng 2 và 3 |
| P0 | contract | d-5 ghi một-lối cho giá bangGia nhưng lối «giá Gateway tính thật» còn sống; bangGia ghi chi phí người dùng thật (khó đảo); E6 có thể đo trần trên sổ ghi thấp. Cùng dạng [okr-mau-xoa-du#F1] | DeepSeek với giá niêm yết: sổ chi phí kho production ghi 1/4 tiền thật | Dòng chỉ-người cho giá; E6 tính từ costUsd Gateway | human-gate1: Hỏi-5 (d-20261021T072237Z-11, kho_dao true) thay d-5; AC-3 đọc giá đã chọn từ ke-hoach.json; AC-6 và E6 dùng costUsd Gateway trả, không dùng bangGia |
| P0 | contract | Ghi đè ô Cài đặt của workspace production là lựa chọn chỉ người có, không có dòng sổ; design khẳng định workspace nhận mặc định mới mà không tra production | Ô production đã chọn glm-5.2-fast, bản lên không đổi gì cho người dùng thật | Dòng chỉ-người, chủ kho tra ô trên Neon | human-gate1: Hỏi-7 (d-20261021T072237Z-13, kho_dao true) — khuyên không ghi đè, chủ kho chạy SELECT trước khi gộp; Out of scope trỏ Hỏi-7 |
| P1 | evals | Lý do bỏ coverage-scan vòng tròn; nơi tiêu thụ DEFAULT_AGENT_MODEL ngoài bốn đường chưa kê (phiên research); E2 chỉ ghim exit 0; E7 so chữ nguồn judge | Phiên nghiên cứu đổi model sau gộp mà không lượt đo nào phủ | Răng liệt kê nơi tiêu thụ; E2 ghim số test và skip 0 | fixed: d-20261021T072237Z-14 thay d-7, thêm E9 (răng tiêu thụ so danh sách trong design.md) và phiên research vào AC-2; E2 ghim số test chạy > 0, skip 0. Phần E7 đọc giá trị lúc chạy ở origin/onehub: deferred — judge và Soạn OKR khai bằng hằng chữ, không dẫn xuất từ DEFAULT_AGENT_MODEL (design.md bảng vai) |
