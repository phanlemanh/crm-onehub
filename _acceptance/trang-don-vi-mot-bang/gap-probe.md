---
slug: trang-don-vi-mot-bang
at: 2026-10-15T04:08:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

# Phản biện context sạch — trang-don-vi-mot-bang

Một tác tử tươi (`feature-loop:cham-doc`) chỉ đọc design doc, `contract.md`, `evals.yaml`, `decisions.jsonl`,
`opportunity.md` và tệp bài học từ feature trước (claim-scan, 12 dòng). Một lượt, không phản biện lại sau khi sửa.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ «mặc định thu» ghi máy quyết một-lối, viện lý do «mở sẵn phải sửa packages/ui» chưa chứng minh; lựa chọn này lật lời hứa mở sẵn đã ký của muc-tieu-va-kr AC-3 và thêm một lần bấm cho đúng việc ngưỡng Cổng Đáng đo; dòng Hỏi-3 định giá lối khác trên cùng lý do sai [hoan-tac-loat-bao-dung#F1] | Thẻ Cổng Phạm vi trình «mặc định thu» như việc đã quyết; người chọn Hỏi-3 trên giá sai | Dòng sổ thay: căn cứ kiểm được hoặc thành câu hỏi; Hỏi-3 định giá lại | fixed: dòng sổ mới thay d-6 lấy căn cứ là câu giao đã ký ở Cổng Đáng «mở từng mục tiêu ra KR» (nguồn mục tiêu); dòng mới thay Hỏi-3 bỏ giá «sửa packages/ui», lối khác nay là «hoãn sửa năm hồ sơ» |
| P1 | contract+evals | AC-10 hứa «chỉ đổi điều khẳng định» nhưng E12 chỉ đo mã thoát | Lượt xoá hoặc `.skip` ca kiểm cũ, E12 vẫn đạt | Đếm dòng it/test/expect bị xoá ngoài dấu cũ = 0 và `.skip/.todo/.only` mới = 0, có phá thử | fixed: AC-10 thêm vế không xoá/không skip; E12 thêm hai dòng đếm + lượt phá thử `xoa-ca` + đối chứng dương |
| P1 | design+evals | Mọi con số đơn vị chỉ đo trên fixture giả lập; «M KR» của đơn vị con không có nguồn; AC-7 thiếu (cross-layer) | Khoá đếm lệch dạng hoặc thủ tục không trả số KR → ô trực thuộc hiện «Chưa đặt OKR» trên máy thật mà E1, E10 vẫn xanh | So số trên trang với Prisma trong kho đo; gắn (cross-layer) cho AC-7; ghi nguồn M KR | fixed: ô trực thuộc chỉ ghi số mục tiêu theo `okr.countByUnit` (thủ tục không trả số KR, không đổi API); AC-7 gắn (cross-layer); E5 so số trong ô chọn, E17 mới so số ô trực thuộc và chân bảng với Prisma, có phá thử `khoa-dem-sai` |
| P1 | evals | Ma trận tìm của E1 dùng tên không dấu nên phép lọc không gấp dấu vẫn xanh | Người gõ «phong ke toan» không ra «Phòng Kế toán», UAT hụt mốc 10 giây | Chuỗi tìm khớp tên có dấu + phá thử bỏ gấp dấu | fixed: AC-1 ghi ví dụ gấp dấu; E1 ma trận 6 chuỗi trên tên có dấu + phá thử `bo-go-dau` |
| P1 | contract+evals | AC-13 nới lời hứa AC-6 đã ký Cổng Phạm vi của DH1 mà không để dấu ở hồ sơ DH1 | DH1 tới Cổng Bằng chứng sau DH2: hợp đồng ghi «không khoá nào khác» còn vật mang xemOkr | Dòng Notes ở hợp đồng DH1 + kiểm trong eval | fixed: AC-13 đòi dòng Notes trong hợp đồng dieu-huong-khu-muc-tieu; E15 kiểm dòng đó, phá thử `bo-notes-dh1`; sửa hợp đồng DH1 chỉ làm sau khi DH1 gộp và báo Điều phối M5 trước |
