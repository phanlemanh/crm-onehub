---
slug: man-okr-truoc-r1
at: 2026-10-04T06:52:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | AC-3 bắt form «Sửa cập nhật» chọn sẵn mức tự tin và nút «Gửi 2», AC-5 lại bắt sửa một KR thì CSDL chỉ thêm một `OkrCheckIn` | Cài theo AC-3 thì gửi cả hai KR, E5u đỏ ở bước +1; cài theo AC-5 thì E3 đỏ ở m.gui(2) — không cách cài nào làm cả hai xanh | Chốt một hướng, sửa AC và eval cùng chiều, ghim số `OkrCheckIn` sau khi gửi từ form sửa | fixed: form sửa điền sẵn số, KHÔNG chọn sẵn mức tự tin, nút «Gửi 0 cập nhật» tắt; chỉ KR được chọn mức được gửi (AC-3, E3 có ô gửi một dòng; AC-5 giữ +1). Dòng sổ d-…-6; trình ở Cổng Phạm vi |
| P1 | contract | Trục Cập nhật tuần thiếu người không phụ trách KR nào; «mọi KR đã gửi» đúng chân không với danh sách rỗng | every() trên danh sách rỗng ra «Bạn đã gửi…» với ngày Invalid Date cho phần đông người dùng R1 | Ô y = 0 trong ma trận E4 kèm chiều đỏ | fixed: AC-3 đòi ít nhất một KR, AC-4 thêm vế rỗng giữ `ST-capnhat-rong`; E4 thêm ô y = 0 và chiều đỏ; design thêm dòng trạng thái |
| P1 | evals | Ảnh của E5u, E8u không khai đích; inputs E11 thiếu hai ảnh 390 AC-11 hứa chấm | E11 BLOCKED hoặc chấm trên ảnh cũ của round trước; lỗi 390 ở trạng thái một phần không ai chấm | Cùng đích ảnh, xoá ảnh cũ khi bắt đầu, kiểm đủ ảnh cuối lượt | fixed: E2/E5u/E8u cùng đích; man-r1c.mjs xoá ảnh r1c-* cũ lúc bắt đầu và thoát 1 nếu thiếu một trong 10 ảnh; inputs E11 thêm r1c-hoi-y-mo-390, r1c-cap-nhat-mot-phan-390 |
| P2 | evals | Fixture E3 không phân biệt «lastAt lớn nhất» với «lastAt của KR cuối» | Lấy lastAt phần tử cuối vẫn xanh; dữ liệu thật hiện sai giờ | Ma trận hai thứ tự, chiều đỏ lấy phần tử cuối | fixed: E3 hai ô thứ tự (mới hơn đứng đầu / đứng cuối) và chiều đỏ (b) |
| P2 | contract | `role="status"` và focus sau «Sửa cập nhật» hứa ở design nhưng không AC, không eval | Alert không role status, focus lạc mà mọi eval vẫn xanh | Vế AC-3 + hai khẳng định E3 + chiều đỏ | fixed: AC-3 thêm hai vế; E3 khẳng định role=status và activeElement, chiều đỏ (c) bỏ lệnh focus |
