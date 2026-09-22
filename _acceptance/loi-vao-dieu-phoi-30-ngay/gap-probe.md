---
slug: loi-vao-dieu-phoi-30-ngay
at: 2026-09-21T08:40:00Z
verdict: findings
p0: 0
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-2 và vế đánh dấu của AC-3 chỉ đo trên hàm thuần; không phép đo nào thấy thanh chính và thanh bên thật sự dùng hai hàm đó, và E5 chỉ nhìn một ca đánh dấu | Một thành phần tự so khớp đường dẫn theo cách riêng: ở hồ sơ kế hoạch mục 30 ngày đầu tắt, hoặc ở Cài đặt › Điều phối đánh dấu sai mục; E2, E3 vẫn xanh | Thêm vào E5 khung hồ sơ kế hoạch và khung Cài đặt › Điều phối, mỗi khung một dòng expected về mục nào được đánh dấu | fixed: E5 thêm E5-ho-so và E5-cai-dat-dieu-phoi (dòng 3, 4 của expected); E2 thêm thanh biểu tượng vào paths |
| P1 | evals | AC-4 hứa quan hệ «nhãn khớp tiêu đề màn đích» nhưng E4 so với chuỗi hằng viết tay | Một vòng sau đổi tiêu đề màn đích, E4 vẫn xanh trong khi chữ trên thanh và trên màn lệch nhau | So nhãn với khoá tiêu đề mà trang đích dùng, cả vi và en, kèm chiều đỏ ghim tên màn | fixed: E4 so với onboardingMessages(locale).title và .settings.title; đổi tiêu đề trang cài đặt thì đỏ với «nhan vi cua muc dieu phoi lech tieu de man cai dat» |
| P2 | design | Design hứa điều hướng di động có mục mới nhưng không tiêu chí nào đo | Điều hướng di động giữ danh sách riêng, trên điện thoại không có lối vào | Tiêu chí và một khung E5 ở khổ 375 | fixed: AC-5 nêu điều hướng di động; E5 thêm E5-di-dong-375; mã đã xác nhận di động dựng từ cùng MUC_RAIL |
| P2 | evals | E5 nhận nhãn ở một trong hai ngôn ngữ, nhãn tiếng Việt dài hơn mới dễ bị cắt | Phiên mặc định tiếng Anh, «Onboarding» vừa khít, nhãn tiếng Việt bị cắt ở 768 mà không ai thấy | Buộc khung 768 chụp giao diện tiếng Việt | fixed: E5-cai-dat-768-vi đổi giao diện sang tiếng Việt trước khi chụp |
