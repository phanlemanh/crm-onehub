---
slug: chu-man-tieng-viet-khong-tran
at: 2026-10-13T20:52:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ ghi hai lựa chọn chỉ người quyết được là máy đã quyết: bộ tên kiểu ngắn cùng cách cho ô nở theo chữ (căn cứ «một lối» chỉ loại được việc giữ câu dài), và chữ «Vị trí trang» (câu trích CLAUDE.md chỉ buộc dùng chữ thường, không chọn chữ nào). | Thẻ Cổng 1 trình hai mục như việc đã xong nên người duyệt không thấy có gì để chọn; phát hiện muộn ở Cổng Bằng chứng thì sửa AC-3, AC-5, E3, E5, E5j. | Dòng sổ chỉ-người-có kèm khuyến nghị và lối thay, lên thẻ Cổng 1. | human-gate1: thành Hỏi-1 (bảng tên ngắn + ô nở theo chữ, dòng d-…-5 thay d-…-2) và Hỏi-2 («Vị trí trang», dòng d-…-6 thay d-…-1) |
| P1 | contract | AC-5 và E5j đòi thẳng cột ở 1280 trong khi design để ô nở theo chữ; tên dài rộng hơn 72 px nên mép trái lệch. | Hội đồng E5j phải FAIL một bản đúng design hoặc tự nới chữ «thẳng cột». | Viết thẳng cột thành quan hệ: mép phải mọi ô nhãn kiểu bằng nhau trong 1 px; E5m đo trên mọi hàng. | fixed: AC-5, E5, E5m, E5j câu (2) đổi sang mép phải bằng nhau trong 1 px; design doc thêm đoạn «Thẳng cột» |
| P1 | evals | Đo từng ô scrollWidth ≤ clientWidth gần như luôn đúng khi ô nở theo chữ; lời hứa «tên trường cắt trước nhãn kiểu» không eval máy nào đo, bộ gieo không có tên dài. | Nhãn tên thiếu min-w-0 hay truncate thì hàng tràn ngang ở 360 mà E5, E5m vẫn xanh. | Gieo một trường tên ≥ 60 ký tự; đo ô trọn trong hàng, trang không cuộn ngang, tên dài bị cắt, nhãn cùng hàng trọn chữ; chiều đỏ bỏ truncate. | fixed: AC-5, E5, E5m thêm trường tên dài và bốn phép đo quan hệ; chiều đỏ thứ hai «trang cuon ngang» |
| P1 | evals | E5j bảo hội đồng so với bảng tên ngắn của design doc nhưng design doc chưa có bảng; bảng chỉ ở AC-3, mà hợp đồng không nằm trong inputs. | Hội đồng không có gì để so tên trên ảnh; câu (4) thành câu hỏi gu. | Thêm bảng vào design doc hoặc hợp đồng vào inputs; AC-3 trỏ đúng nơi. | fixed: design doc thêm «Bảng tên ngắn» 10×2, AC-3 trỏ bảng đó, E5j thêm contract.md vào inputs |
| P2 | evals | E2 chỉ cấm chuỗi aria-label="breadcrumb"; nửa sau AC-2 (chữ nhãn chỉ sống trong messages.ts) không ai kiểm. | Viết ba ngôi locale cứng trong breadcrumb.tsx thì E1, E2 vẫn xanh. | «Vị trí trang» xuất hiện 0 lần ở mọi tệp .tsx; chiều đỏ bản ba ngôi, ghim thông điệp. | fixed: E2 thêm đếm 0 lần và chiều đỏ ghim «chu nhan breadcrumb viet cung» |
