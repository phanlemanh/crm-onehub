---
slug: mot-duong-ghi-phong-ban
at: 2026-09-24T10:05:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Tập hồ sơ đã ký bị chạm viết tay sáu slug; E10 chạy kiểm tra trước khi gộp có `--slug` trong khi AC-8 hứa cả kho | Một hồ sơ thứ bảy chạy cùng tệp kiểm bị sửa, lệch ghim; E10 xanh vì chỉ soi sáu, CI toàn kho đỏ lúc gộp | Rút tập bằng máy và so với danh sách viết trước; chạy kiểm tra không `--slug`; chiều đỏ bằng một hồ sơ giả chạy tệp kiểm bị sửa | fixed: máy rút ra BẢY hồ sơ (thêm `test-api-khong-de-viec-vo-chu`, chạy lại `dieu-phoi.spec.ts`); AC-7, AC-8, design và E10 sửa thành bảy; E10 (a) rút tập bằng máy từ lệnh eval + diff và so đúng bằng danh sách, (c) chạy kiểm tra toàn kho không `--slug`, chỉ cho phép vi phạm nhắc chính hồ sơ đang chấm; chiều đỏ thêm hồ sơ giả |
| P1 | contract | AC-7 cấm đổi khẳng định nhưng design ra lệnh đổi khẳng định sắp xếp từ vị trí tuyệt đối sang thứ tự tương đối; gỡ giả lập ở `noi-bon-nut.dom.tsx` không nói khẳng định nào đi theo | E9 chấm đúng chữ AC-7 thì FAIL trên thay đổi design ra lệnh, hoặc châm chước thì lọt tiền lệ nới | Chọn một hướng; E9 liệt kê số khẳng định trước và sau cho từng tệp | fixed: chọn hướng giữ nguyên — bài sắp xếp gieo ba phòng ban trong một bộ phận riêng nên vẫn khẳng định cả thứ tự c,a,b lẫn vị trí 0·1·2; AC-7 liệt kê đích danh các thay đổi được phép (kể cả gỡ giả lập chỉ khi không khẳng định nào đọc nó); E9 nhận thêm bảng đếm khẳng định trước/sau do script sinh |
| P1 | evals | E1: 404 của REST cũ không có đối chứng dương cùng máy khách và tiền tố; tập đường REST không có tập kỳ vọng dương | Bài kiểm dựng sai tiền tố REST, mọi lời gọi 404, tập rút ra rỗng — REST cũ vẫn mở mà E1 xanh | GET `/rest/onboarding/departments` 200 cùng máy khách; tập đường REST của `org.*Department` bằng đúng sáu đường; chiều đỏ REST ghim thông điệp | fixed: E1 thêm đối chứng REST GET 200 chứa phòng ban vừa gieo, tập sáu đường REST viết trước, chiều đỏ «POST /rest/onboarding/departments: HTTP 200 != 404» |
| P1 | evals | Lời từ chối 400 kèm câu nguyên văn chỉ đo qua tRPC; AC-2 hứa cả hai lớp | Lớp REST biến lỗi nghiệp vụ thành 500 hoặc câu chung; E3, E4, E6 vẫn xanh | Chạy ca từ chối trên cả hai lớp; chiều đỏ REST 500 | fixed: E3 chạy ca 1 và ca 3 thêm qua REST (+6), E4 chạy ca 1 và ca 2 thêm qua REST DELETE (+6); chiều đỏ «ca 1 REST: HTTP 500 != 400» |
| P2 | evals | E7 chỉ đo từ chối lưu trữ, bằng câu viết tay; khôi phục và xoá hẳn trong «Đã lưu trữ» không có ca từ chối [noi-zalo-cho-nguoi-moi#F1] [zalo-qua-webhook#F1] | Đổi sang `trpc.org.purgeDepartment` làm hỏng phần hiện lỗi; người quản trị không thấy câu «còn bước kế hoạch», E7 vẫn xanh | Thêm ca từ chối cho xoá hẳn và khôi phục; câu lấy từ nguồn bên viết | fixed: E7 thêm hai ca từ chối trong «Đã lưu trữ» (+4), mọi câu lấy từ `TO_CHUC.thongDiep` của máy chủ thay vì gõ tay; chiều đỏ «xoa han tu choi: toast khac cau may chu» |
