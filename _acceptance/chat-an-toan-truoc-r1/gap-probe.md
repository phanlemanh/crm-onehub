---
slug: chat-an-toan-truoc-r1
at: 2026-10-05T06:00:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Bộ đọc danh mục Gateway của agent chỉ được kiểm bằng thân giả do chính người viết bài kiểm dựng theo schema của bộ đọc | Schema đặt sai lớp bọc ngoài, mọi lần đọc thật thành «không đọc được», nhánh (c) giữ model đã gỡ nên chat vẫn hỏng, mà E6/E7 vẫn xanh và màn Cài đặt (bộ đọc API) vẫn báo đúng | Một schema dùng chung ở @crm/validation cho agent và API; ô (d) đọc thân phản hồi thật đã ghi lại (có ngày, nguồn); chiều đỏ đổi khoá bọc ngoài | fixed: AC-6 thêm ô (d) và schema chung `@crm/validation/gateway-danh-muc`; E6 thêm fixture `gateway-models-2026-10-05.json` và chiều đỏ ghim |
| P1 | design | Chỉ kiểm danh mục trước lượt, cache 30 phút; lượt hỏng trong cửa sổ cache không được cứu và không để lại dấu | Gateway gỡ model một phút sau lần đọc danh mục; mọi lượt tới khi cache hết hạn đều turn.failed — đúng ngưỡng chết — trong khi người duyệt tưởng «0 phiên hỏng» | Khai cửa sổ cache là ngoại lệ có tên ở Cổng 1, hoặc thêm thử lại trong lượt | human-gate1: hạ TTL xuống 5 phút, khai ngoại lệ có tên trong Notes, thêm AC-11 ghi `model.khong-tim-thay` khi lượt vẫn hỏng; chủ kho quyết ở Cổng Phạm vi có cần thử lại trong lượt không |
| P1 | contract | Hai dòng Đường đo không đọc được trên production ngày 10/11 (biến cơ sở dữ liệu sensitive; log Vercel giữ ngắn hơn hai tuần) | Ngày 10/11 không ai chạy được bộ đếm, hoặc chạy nhầm trên kho dev ra 0 và ghi SỐNG | Nêu ai chạy bộ đọc và bằng kết nối nào; thay log bằng sự kiện bền | fixed: Đường đo ghi chủ kho chạy `rang/dem-doi-truong.ts` với kết nối production chỉ đọc; thay log bằng `AgentEvent` `model.khong-tim-thay` (AC-11), bộ đếm đọc cả hai loại sự kiện model |
| P1 | evals | E5(b) chỉ gieo một hàng chết (member); vai okr, không-thành-viên, tự-động chưa có; nhãn vai cho người ngoài chưa ghim | Bộ đếm chỉ đếm member vẫn ra chet 1 bằng kỳ vọng, chiều đỏ không thể đỏ; một hồi quy để vai okr đổi trường bị bỏ sót | Ma trận viết trước bốn vai chết qua hàm ghi thật, chet 4 | fixed: AC-5 ghim sáu nhãn vai; E5(b) ma trận bốn ô chết, expect(chet.length).toBe(4) |
| P2 | contract | Trục D có thành viên thường nhưng AC-8/AC-9 và E9u chỉ đo quản trị | Hộp báo chỉ hiện khi canManage; thành viên thường thấy chat đổi model mà không lời giải thích, mọi eval vẫn xanh | Ô thành viên thường ở AC-8, AC-9, E9u | fixed: AC-8 chạy cho owner và member; AC-9 + E9u bước 3 đăng nhập member, thấy hộp báo, không có ô chọn hay nút lưu |
