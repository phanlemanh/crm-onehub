---
slug: tra-loi-tin-nhac
at: 2026-09-25T08:09:35Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | evals | Các eval cần tin nhắc hôm nay không nói hàng `AgentTask` được dựng thế nào, dễ thành fixture viết tay theo khuôn bên đọc; design không khai schema dùng chung cho `payload` [zalo-qua-webhook#F1] | `chayNhac` lưu khoá khác tên, test tự gieo đúng khuôn lớp 3 mong nên xanh, còn trên sản phẩm mọi «xong 2» trả «chưa có tin nhắc» | Mọi eval dựng hàng bằng `lenLichNhac` + `chayNhac` thật, cấm insert tay; bên đọc parse bằng schema dùng chung | fixed: câu chung trong Context của contract và dòng «Tiền đề chung» ở mười eval; schema dùng chung đã có sẵn (`parseNhacPayload` của `@crm/validation/nhac-ke-hoach`, bên ghi `chayNhac` đã dùng), nêu trong contract và design |
| P1 | contract | AC-9 và AC-11 liệt tay bảy spec; không máy nào rút tập hồ sơ đã ký có `paths` giao với `diff` [mot-duong-ghi-phong-ban#F1] | Một hồ sơ đã ký khác trỏ vào `onboarding-ghi.ts` hay `tin-nhac.ts` đỏ hoặc lệch ghim, E11 vẫn xanh, CI đỏ lúc merge | Máy rút tập từ `_acceptance/*/evals.yaml` giao `diff`, chạy làn ghim lại trên cả tập | fixed: AC-9 và E11 đổi sang `rang/ho-so-cham.mjs` — rút tập bằng máy (đo trước ở S1: 27 hồ sơ), chạy `repin-lane.mjs` không `--write` trên cả tập, kèm đối chứng dương và chiều đỏ |
| P1 | evals | E7 chỉ đo chuỗi có mặt trong khi AC-6(a) hứa quan hệ số ↔ phần câu; E2, E3 không đo số nào đi với bước nào | Code đảo hai danh sách, DB đúng, câu đủ chuỗi, E7 xanh, người nhận hiểu ngược | Tách câu theo mốc, so tập số từng phần; E2, E3 kiểm cặp «n · nhãn» | fixed: AC-2, AC-3, AC-6 và E2, E3, E7 đổi sang quan hệ; E7 thêm chiều đỏ đảo hai danh sách |
| P1 | contract | Không AC nào gắn (cross-layer); dấu vết có khoá `source` mới không được đọc qua bên đọc hiện có [noi-zalo-cho-nguoi-moi#F1] | Bên đọc dòng thời gian từ chối hoặc bỏ mục có khoá lạ; E2 xanh vì đọc `meta` thô | Gắn (cross-layer) cho AC-2; đọc dấu vết qua thủ tục liệt kê hoạt động của API và `onboardingActivityMeta.safeParse` | fixed: AC-2 gắn (cross-layer) và thêm vế đọc qua API; E2 thêm khẳng định cross-layer |
| P2 | evals | E9(d) và E15 là khẳng định phủ định thiếu đối chứng dương; E15 bỏ sót `ZaloLinkAttempt` | Webhook trả 401 nên không gửi gì, E9(d) xanh vô nghĩa; logger khác hay bảng khác giữ chuỗi, E15 xanh | E9(d) kiểm 200 và hàng `ZaloUpdateSeen`; E15 kiểm bộ bắt log thu được dòng và quét thêm bảng | fixed: AC-8(d), AC-12, E9, E15 thêm đối chứng dương; E15 quét `ZaloLink`, `ZaloLinkAttempt` |
