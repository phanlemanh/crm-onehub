---
slug: keo-tha-thoa-thuan
at: 2026-09-23T10:35:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

# Gap probe — keo-tha-thoa-thuan

Phản biện context sạch: một agent tươi chỉ đọc design doc, contract, evals, sổ quyết định và tệp bài học (claim-scan, 12 dòng).

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract, evals | AC-4 chỉ có E3 gọi thẳng thủ tục; không eval nào đo màn có chuyển bộ lọc vào deals.board, và E3 so tập id gộp chứ không so đếm và tổng từng cột [ke-hoach-la-mot-ban-ghi#F1] | Màn quên gửi bộ lọc owner hoặc phần groupBy mất bộ lọc mà E3 vẫn xanh, đầu cột in số của cả kho | Eval jsdom spy input deals.board theo ma trận 5 bộ lọc; E3 so đếm, tổng, tập id từng cột với deals.list cùng bộ lọc | fixed: AC-4 nói rõ màn gửi bộ lọc và so từng cột; E3 viết lại 84 khẳng định lấy từ deals.list thật; thêm E21 |
| P1 | contract, evals | Số đầu cột và «+N nữa» ở màn không được đo như quan hệ; AC-5 không đòi đầu cột đổi ngay sau khi lưu | Màn đếm bằng số thẻ nên cột 53 hiện 50 không có «+3 nữa»; đầu cột giữ số cũ tới khi tải lại | Eval jsdom dựng từ đầu ra bài kiểm API, 7 cột × đếm, tổng + «+N» + đổi ±1 sau lưu | fixed: AC-3 gắn cross-layer và cột 50 không có dòng «+N»; AC-5 đòi đầu hai cột đổi khi lưu xong; thêm E22 round-trip từ đầu ra E1/E2 |
| P1 | contract, evals | Cột rỗng phải nhận thả nhưng không AC hay eval nào kéo vào cột rỗng thật | Kanban chỉ nhận thả trên thẻ, kéo vào Contract sent rỗng thì bật về; mọi eval vẫn xanh | Bước Chrome kéo vào cột mở đang rỗng + đọc deals.byId, chiều đỏ bỏ vùng thả khung cột | fixed: AC-5 thêm «kể cả cột đang rỗng»; E14 thêm bước kéo vào cột rỗng, KY_MONG 24, chiều đỏ ghim «cot rong khong nhan tha»; design doc ghi khung cột là vùng thả |
| P2 | contract | translate=no, lời báo trình đọc màn hình theo tiếng, chặn bôi chọn không có AC | Tên công ty bị Chrome tự dịch; lời báo tiếng Anh trên màn tiếng Việt | Eval jsdom 2 nút translate + 6 lời báo vi/en | fixed: gộp vào AC-9 (giữ trần 15 AC); thêm E23. Chặn bôi chọn khi kéo để ở design doc, không đo — deferred: hành vi mặc định của dnd-kit |
| P2 | design, evals | Design doc không dẫn docs/design.md cho trạng thái trỏ/mờ; E20 lấy danh sách tệp ghi tay | Tệp giao diện mới dưới deals/ không được quét, cột đang trỏ tô nền màu thứ ba | E20 lấy tệp từ git diff giao paths, rỗng thì mã 2 | fixed: design doc thêm dòng docs/design.md (viền/ring, disabled có sẵn, không className tại chỗ); E20 lấy tệp từ diff, rỗng mã 2, chiều đỏ ghim «board.tsx: mau hex» |
