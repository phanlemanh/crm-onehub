---
slug: hoan-tac-loat-dung-id
at: 2026-10-09T18:54:30Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-1 và AC-2 gắn cross-layer, nhưng công ty và thoả thuận chưa có eval nào đi qua thủ tục tRPC thật. E1 chỉ gọi `.parse` trên schema có tên, trong khi gốc lỗi là zod cắt trường ở biên [khung-loi-ban-ghi-dung-ly-do#F1] | router thoả thuận khai `output` bằng một hằng khác, nên `changedIds` bị cắt; trình duyệt nhận `undefined` mà E1, E3–E5, E8 vẫn xanh | ma trận 3 loại × {bulkArchive, bulkRestore} gọi qua HTTP tRPC thật, mỗi ô assert body nhận được; chiều đỏ là router thiếu trường | fixed: E1 và E2 gọi qua AppModule + supertest + phiên thật (khuôn `sua-luu-tru.spec.ts`), 6 ô, chiều đỏ «htl: bien cat changedIds»; AC-1 ghi «qua thủ tục tRPC thật» |
| P1 | evals | nhánh `changedIds` rỗng có `message` thô chưa có assert âm tính; E6 không có ca «không đổi» ở bản en | lô toàn id đã bị xoá: nhánh rỗng rơi về đường V2 và in «No contact with id x.», E5 và E6 vẫn xanh | E5 thêm ca `{succeeded 0, failed 3, message …, changedIds []}`, E6 thêm ca đó ở en | fixed: E5 có 4 ca (12 ô) và chiều đỏ «htl: toast khong doi in loi tho»; E6 thêm ca này; AC-4 nói thẳng nhánh rỗng không in thông điệp máy chủ |
| P2 | evals | AC-6 hứa «đúng hai bản quay lại danh sách», nhưng E8 chỉ đối chiếu cơ sở dữ liệu | danh sách không làm mới sau khôi phục, hoặc hiện cả ba bản; db đúng nên E8 vẫn đạt | đếm dòng mang mã gieo sau Hoàn tác = 2, vắng bản thứ ba; trước đó 3 rồi 0 | fixed: E8 đếm 0 dòng sau lưu trữ và đúng 2 dòng sau Hoàn tác, chiều đỏ «man: danh sach khong ve dung 2 dong»; AC-6 sửa lời |
| P2 | evals | ô «về thiếu» của E4 không cấm thêm một toast xanh thuần đi kèm | mã giữ `toast.success` của V2 và thêm `toast.warning`, người dùng thấy cả xanh lẫn vàng | ô «về thiếu» assert 0 toast success và đúng 1 toast warning | fixed: E4 assert đúng như vậy, chiều đỏ «htl: hoan tac thieu van co toast xanh» |
| P2 | design/evals | design ghi «cả Kanban thoả thuận» mà không eval nào đo Kanban | Kanban có đường hàng loạt riêng vẫn gửi `variables.ids` | thêm ô Kanban hoặc ghi rõ Kanban không có đường riêng | fixed: tra `deals-board.tsx`, không có chọn nhiều hay thao tác hàng loạt; design bỏ chữ Kanban, contract thêm mục Out of scope nói rõ |
