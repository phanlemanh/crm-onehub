---
slug: so-do-can-chinh-don-vi
at: 2026-10-15T02:39:21Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

# Phản biện context sạch — so-do-can-chinh-don-vi

Một tác tử tươi (feature-loop:cham-doc) đọc đúng sáu tệp: design doc, contract.md, evals.yaml, decisions.jsonl,
bản quét bài học (claim-scan) và opportunity.md. Không đọc mã kho.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Thu gọn chỉ tự mở nhánh khi bật lọc, thẻ bộ phận không báo đơn vị chưa nối bên trong; dòng gọi tên cờ rơi khỏi AC-5; moDonVi trỏ phòng ban đang gộp không mở nhánh | Hơn 12 đơn vị, mọi đơn vị chưa nối là phòng ban bị gộp khuất ở màn mặc định — lãnh đạo không chỉ ra được trong 5 giây (điều kiện CHẾT) | Ma trận 13 đơn vị có phòng ban chưa nối không dính cờ khác phải đỏ; dòng cờ trên thẻ; ca moDonVi trong nhánh gộp | fixed: AC-8 mở sẵn nhánh có đơn vị chưa nối ở màn mặc định, E8 thêm ca thứ tư; AC-5 và E5 thêm dòng gọi tên cờ; AC-7 và E7 thêm ca moDonVi trong nhánh gộp; Đường đo sửa theo |
| P1 | contract | Chưa định nghĩa góp chéo nhánh, góp nội bộ, góp cả hai; E1 không có ca | Phòng ban góp sang bộ phận khác mang nhãn chưa nối mà không dính cờ — người dự chỉ sai đơn vị | Thêm ô vào trục A, AC-1 ghi kết quả từng ô, ma trận E1 có ba ca mới | fixed: Context định nghĩa góp ra ngoài và góp nội bộ; AC-1 đường dut cho bỏ cấp và chéo nhánh, góp nội bộ không vẽ; cờ chưa nối lên thành cờ thứ năm (AC-2); trục A và B thêm ô; E1 thêm A2, A3, B2 |
| P1 | evals | E1 không assert tiến độ, ba số tình trạng, bốn cờ trên CSDL thật; E2 đầu vào viết tay; E12 lấy tập kỳ vọng từ chính API | Service đọc thiếu loại mục tiêu — cờ trượt sai mà E1, E2, E12 vẫn xanh | E1 gieo KR cam kết trượt và KR tham vọng dưới ngưỡng; E2 round-trip; E12 lấy tập từ writer bộ mẫu | fixed: E1 assert tienDo, ba số, năm cờ và số mục tiêu trên đường; E2 chạy trên đầu vào do hàm đọc thật rút từ CSDL kiểm; E12 lấy tập từ hằng DON_VI_CHUA_NOI, DON_VI_CAN_CHU_Y của tệp mẫu |
| P1 | evals | AC-7 đi qua backend mà không tag cross-layer, không eval backend đo lý do theo cặp; đột biến (e) chỉ ở front-end | gopSoDoDonVi gán lý do theo mục tiêu — hai dòng góp cùng một câu, B5 ký trên bằng chứng sai | Tag cross-layer, eval backend so với canhCuaCay, đột biến ở so-do-don-vi.ts | fixed: AC-7 (cross-layer); thêm E17 backend-effect so từng cặp với cạnh của cayCanChinh; E15 thêm đột biến (g); E7 ghi dữ liệu sinh qua gopSoDoDonVi |
| P2 | evals | E4 đo chuỗi import trực tiếp thay vì quan hệ đồ thị import | Import tĩnh gián tiếp qua the-don-vi.tsx kéo 78 KB vào trang Bảng mà E4 vẫn xanh | Duyệt đồ thị import tĩnh bắc cầu, đối chứng gián tiếp phải đỏ | fixed: E4 duyệt đồ thị import tĩnh bắc cầu với đối chứng dương và đối chứng gián tiếp đỏ đúng thông điệp |
