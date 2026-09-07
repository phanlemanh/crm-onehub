---
slug: hd-theo-danh-sach
at: 2026-09-07T15:30:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract + design | Không tiêu chí nào đo cái ĐỔI THẬT khi bỏ `hd`: ai đi tới được callback. Trước, Google chặn người lạ trước khi CRM chạy dòng nào; sau, mọi tài khoản Google trên internet vào tới callback. Hồ sơ không đo trạng thái cơ sở dữ liệu sau một lượt bị từ chối. Câu «phân quyền không yếu đi» là LỜI KHAI, bằng chứng duy nhất là hai file không đổi byte | Người lạ bấm đăng nhập bằng gmail bất kỳ. better-auth tạo `user` + `account` rồi hook mới ném FORBIDDEN. Bảng `user` tích rác từ người ngoài, và đường tạo tài khoản nay mở cho cả internet. Cả bảy eval đều xanh | AC đo đầu-cuối một lượt callback bị từ chối: đếm `user`, `account`, `session`, `verification` trước và sau, khẳng định bằng nhau, ghim vị trí phép kiểm trong vòng đời better-auth | fixed: thêm **AC-8 (cross-layer)** + E8 `layer: backend-effect`, kèm **đối chứng dương** — một địa chỉ TRONG danh sách phải tạo đúng một hàng `user`, không thì mã 2. Đo được: hook là `databaseHooks.user.create.**before**` |
| P0 | contract AC-1 + Coverage trục A | Luật «chỉ đặt `hd` khi không có địa chỉ lẻ» chỉ khoá một chiều. Danh sách NHIỀU DOMAIN vẫn rơi vào «không có địa chỉ lẻ» nên vẫn đặt `hd` bằng domain ĐẦU TIÊN | `ALLOWED_SIGN_IN="onemount.com,partner.com"` → `hd="onemount.com"`, Google chặn mọi tài khoản `partner.com` — **cùng lớp lỗi vòng này tuyên là đã sửa, chỉ đổi hình dạng đầu vào.** Bảy eval xanh, lỗi sống nguyên | Thêm dòng cho nhiều domain vào bảng viết trước; trục A phải đếm đủ năm giá trị | fixed: luật đổi thành «ĐÚNG MỘT domain và không địa chỉ lẻ»; bảng AC-1 có dòng 4; trục A nay năm giá trị |
| P1 | contract AC-1, AC-5 + evals | Trục A khai giá trị «rỗng» nhưng bảng viết trước ba dòng, không dòng nào là danh sách rỗng hay biến chưa đặt. Ma trận không phủ hết chính trục nó khai — cùng lớp `[thuoc-cache-het-doi-tuong#F1]` | Ai đó xoá `ALLOWED_SIGN_IN` khi triển khai. Không tiêu chí nào nói `isWorkspaceEmail` khi ấy từ chối hay cho qua. Nếu rỗng nghĩa là cho qua thì cửa mở toang, bảy eval vẫn xanh | Thêm dòng cho biến chưa đặt và chuỗi rỗng, mỗi dòng ghim CẢ `hd` LẪN kết quả `isWorkspaceEmail` | fixed: bảng AC-1 nay sáu dòng, hai dòng cuối là ca fail-closed, mỗi dòng khai cả hai cột |
| P1 | evals E3 | AC-3 hứa hai điều nhưng E3 chỉ so byte, không chạy test. Mốc là «gốc nhánh» — mốc DI ĐỘNG, sau khi merge hoá thành HEAD nên diff rỗng vô điều kiện. Và so byte thân hàm không đo hành vi: vòng này thêm một hàm đọc CÙNG danh sách vào CÙNG file | Người sửa hàm tách chuỗi dùng chung, `isWorkspaceEmail` nhận thêm một hình dạng — E3 xanh vì hai khối byte không đổi. Sau merge, tiêu chí quan trọng nhất của vòng xanh vĩnh viễn dưới `recheck: strict` | Chạy bộ test thật và in số ca xanh; ghim mốc bằng SHA cố định; thêm đối chứng hành vi chạy lại chính bộ ca cũ | fixed: E3 nay ba phần — diff với SHA cố định `5ac85ef`, chạy thật in số ca, và đối chứng hành vi |
| P1 | evals E4 | E4 đo CHUỖI CÓ MẶT trong `auth.ts`, trong khi AC-4 hứa một QUAN HỆ: ca nào nhận câu nào. Cùng lớp `[d-20260907T131000Z-9907]` | Nhánh chọn câu bị đảo hoặc thành mã chết. Cả hai chuỗi vẫn nằm nguyên, E4 xanh. `phanlemanh@gmail.com` — chính người vòng này mở đường cho — nhận «Sign in with your @onemount.com account», một chỉ dẫn sai | Gọi thật đường từ chối với hai hình dạng danh sách, khẳng định thông điệp khớp bảng hai dòng ghim trước | fixed: AC-4 và E4 nay đo quan hệ, có bảng hai dòng |

Không finding nào lật quyết định đã ghi trong `decisions.jsonl`.
