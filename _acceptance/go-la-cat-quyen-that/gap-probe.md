---
slug: go-la-cat-quyen-that
at: 2026-09-23T13:40:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---

# Gap-probe — go-la-cat-quyen-that

Phản biện context sạch: một agent tươi đọc design doc, contract, evals, sổ quyết định và tệp bài học từ hồ sơ trước. Không đọc hội thoại, không đọc code.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | E5 cũ đo khoá cũ bằng một khoá ĐÃ TẮT, nên Better Auth từ chối trước khi tới lớp kiểm tư cách; không eval nào cho khoá CÒN BẬT của người ngoài đi qua lớp kiểm tư cách, và cầu REST chỉ có một mẫu không ghim thông điệp | Người bị gỡ TRƯỚC ngày triển khai vẫn giữ khoá bật vì bản vá chỉ tắt khoá ở các lượt gỡ về sau; nếu lớp kiểm tư cách bỏ sót phiên sinh từ khoá hoặc cầu REST, cửa khoá vẫn mở cho đúng những người đã bị gỡ thật trong khi E5 và E6 xanh | Dựng người ngoài giữ khoá bật, chạy toàn ma trận tRPC và ma trận REST rút từ sổ router qua khoá, đòi 403 kèm đúng thông điệp; đối chứng dương cùng khoá khi còn là thành viên | fixed: AC-5 viết lại cho khoá còn bật; E5 mới xoá dòng member trực tiếp, khẳng định khoá vẫn bật, chạy ma trận tRPC và ma trận REST rút từ /openapi.json lúc chạy, sàn 30 đường; vế khoá đã tắt chuyển vào AC-6 và E6 |
| P1 | evals | E7 thiếu đối chứng dương cho lối tạo khoá qua thủ tục của API (màn cài đặt dùng) và cho lời gọi phía máy chủ không mang phiên | Móc hooks.before coi không có phiên là người ngoài: thành viên hết tạo được khoá ở màn cài đặt, hệ thống tự tạo khoá gãy, mà E3 và E7 vẫn xanh | Thêm hai hàng đối chứng: thành viên gọi apiKeys.create hợp lệ và createApiKey phía máy chủ không header, mỗi hàng đòi đúng một dòng mới | fixed: AC-7 và E7 có ba đối chứng dương, mỗi hàng đòi 2xx và đúng một dòng mới, kèm chiều đỏ cho móc chặn nhầm lời gọi không phiên |
| P1 | contract | Vế proxy của AC-2 chỉ được đo gián tiếp qua câu trả lời của workspace.get, không đo quyết định của proxy [go-thanh-vien-phai-giu-duoc#F1]; AC-2 xuyên từ app sang API mà thiếu thẻ cross-layer | Proxy hỏi thêm một thủ tục nay bị chặn, coi lỗi là không biết rồi cho qua; người bị gỡ vào một ứng dụng trống toàn lỗi thay vì màn hết quyền, trong khi E2 vẫn xanh | Eval backend-effect chạy hàm proxy thật với API thật và cookie thật, đòi chuyển hướng tới màn hết quyền; đối chứng thành viên | fixed: AC-2 gắn (cross-layer); thêm E10 layer backend-effect — API thật nghe trên cổng tạm, proxy thật chạy trong tiến trình con ở apps/app, hai chiều trên cùng dựng cảnh |
| P2 | contract | Dòng feature hứa bất kỳ cửa nào, nhưng ma trận chỉ phủ tRPC; controller REST riêng của Nest chỉ được soát tay | Một controller Nest chỉ kiểm có phiên cho người bị gỡ đọc dữ liệu mà E1 tới E10 vẫn xanh; người duyệt tưởng mọi cửa đã có số đo | Viết lại lời hứa cho khớp phạm vi thật, hoặc thêm ma trận route Nest | fixed: dòng feature nói đúng bốn lối được đo; Trục B kê từng controller Nest đã soát tay và ghi rõ không controller nào được đo trong hồ sơ này |
| P2 | contract | Notes nói kế hoạch duyệt cùng lượt Cổng 1 nhưng không đính kế hoạch nào | Người ký tin kế hoạch đã được duyệt, kế hoạch viết sau đi thẳng vào code không qua cổng T3 | Đính kế hoạch trước Cổng 1, nêu thứ tự lớp kiểm tư cách trước kiểm vai và trước kiểm đầu vào | fixed: kế hoạch viết xong và đính kèm trước Cổng 1; Notes trỏ đường dẫn kế hoạch |
