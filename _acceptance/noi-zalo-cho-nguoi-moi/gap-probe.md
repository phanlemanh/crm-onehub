---
slug: noi-zalo-cho-nguoi-moi
at: 2026-09-24T03:59:27Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Chỗ nối API ↔ tác tử không eval nào đo: E1 gọi thẳng handler tác tử, E2 dùng máy chủ giả tự ghi `AppSetting` (fixture viết tay theo khuôn bên đọc [zalo-qua-webhook#F1]) và dòng 1 chỉ đo «thân chứa T». AC-2, AC-3, AC-4, AC-6 đi qua `zalo.luuBot` mà thiếu tag cross-layer; không schema cầu nối trong `packages/validation`; không eval đo API dịch `invalid` thành câu «Zalo không nhận token này». | API gửi `{botToken: T}`; tác tử thấy thiếu token nên đăng ký lại bot cũ và trả valid; quản trị thấy lưu thành công mà bot không đổi. E1, E2, E3 vẫn xanh. | Eval backend-effect: caller tRPC thật, cầu nối trỏ vào handler thật chạy bằng `Bun.serve`, Zalo giả; ca 401 khẳng định câu lỗi; schema `zalo-cau-noi.ts`; đột biến đổi tên trường. | fixed: thêm E23 (cầu nối thật, hai ca, đột biến đổi tên trường); design khai `packages/validation/src/zalo-cau-noi.ts`; E2 dòng 1 đổi sang parse theo schema và so trường token; gắn (cross-layer) cho AC-2, AC-3, AC-4, AC-6 |
| P1 | contract | AC-5 và E8 chỉ phủ ba trong sáu chỗ gọi token; E8 tự nhận «3 × 4» nhưng viết 8 ô, thiếu `pollZalo`, `zalo:poll`, `zalo:webhook`. | Quản trị dán token trên màn, `.env` không có token, chạy `zalo:poll` như màn chỉ: lệnh ném thiếu token hoặc poll nhầm bot trong `.env`; không eval nào đỏ. | AC-5 đủ sáu chỗ gọi; ma trận 3 × 6 viết trước, số assert bằng số ô; hai lệnh chạy bằng `bun run`. | fixed: AC-5 thêm (e) `pollZalo`, (f) `zalo:poll`, (g) `zalo:webhook`; E8 thành ma trận 3 × 7 = 21 ô, hai lệnh chạy tiến trình con với Zalo giả `Bun.serve` |
| P1 | contract | Ngoài-4 chỉ đóng ở lớp dữ liệu: không ảnh nào chụp trạng thái chưa đăng ký webhook; «Đăng ký lại» gọi `luuBot({})` mà E3, E6 chỉ gọi có token; design không nói `getWebhookInfo` trả 200 thân lạ thì sao. | Màn vẫn in «Nhận tin qua webhook» khi chưa đăng ký; input API bắt buộc token nên «Đăng ký lại» luôn BadRequest; thân Zalo thật khác mẫu làm cột giữ url cũ mãi. | Thêm trạng thái chua-webhook vào AC-14/E19; ca `luuBot({})`; design chốt hành vi thân lạ và E9 thêm ca (d). | fixed: AC-14 và E19 thêm chua-webhook (cảnh báo, nút «Đăng ký lại», không có «Nhận tin qua webhook»); E3 thêm ca `luuBot({})` không có trường token; design + AC-6 + E9 ca (d): thân 200 lạ ghi null và log khoá cấp đầu |
| P2 | evals | Đối chứng E22 chỉ đòi «ít nhất một điều thiếu» trên onehub; kiểm `connections.md` đo chữ có mặt, có thể đã xanh sẵn nhờ tài liệu vòng 1. | `connections.md` không sửa và vẫn bảo sửa `.env` rồi khởi động lại; E22 xanh nhờ điều ReUI ở `proto.md`. | Đối chứng riêng từng điều; kiểm `connections.md` thành quan hệ. | fixed: E22 đối chứng riêng từng điều (điều nào xanh sẵn trên onehub thì script thoát 2); điều 1 đòi «Kết nối › Zalo» + «dán» cùng đoạn «Bot Token» và cấm câu sửa `.env` làm đường chính; AC-15 viết lại cùng nghĩa |
| P2 | design | Mục 5 không khai variant cho từng nút; không nhắc luật chỉ `primary`/`destructive` tô đầy và cấm `className` ghi đè; E19, E20 không đo hai luật này. | Chép `className` của block settings-8; màn có ba nút tô đầy, «Gỡ» tô `destructive`; E19 chỉ đọc chữ nên xanh. | Design ghi variant từng nút; E19 «nhiều nhất một nút tô đầy»; eval script quét `className` ghi đè. | fixed: design mục 5 thêm dòng «Nút» với variant từng nút; E19 thêm «nhiều nhất một nút tô đầy, Gỡ không tô đỏ»; thêm E24 dùng lại design-gate static (cùng lệnh `nqz_san_thiet_ke`) có đối chứng `rounded-xl` |
