---
slug: lenh-chung-khong-an-cache-doi
at: 2026-09-06T19:20:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Phản biện context sạch

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | evals | AC-3 khai hai loại phụ thuộc ngoài gói — file `_acceptance/**` bộ vẽ ĐỌC lúc chạy, và component NHẬP từ `apps/app/**` — nhưng E3 chỉ nói «đổi một byte trong một file NGOÀI gói», không ghim tên, không ma trận. Hai loại đi qua hai cơ chế KHÁC NHAU của turbo: một vá bằng `inputs`, một vá bằng cạnh phụ thuộc gói | Chân chọn file `_acceptance`, hai chiều đúng, E3 xanh. Cạnh `apps/app` chưa từng đo. Sửa một component ở `apps/app` xong thì `turbo run test --filter=@crm/ui` vẫn FULL TURBO — đúng con bọ vòng này lập ra để giết | Bảng viết trước, tối thiểu hai dòng, mỗi dòng là (tên file thật, loại phụ thuộc, cặp hai chiều riêng). Số dòng chạy bằng số dòng bản khai; lệch là mã 2 | fixed: AC-3 nay có bảng hai dòng ghim tên, mỗi dòng một loại phụ thuộc, mỗi dòng một cặp riêng |
| P1 | evals | E3 không khai bước MỒI cache, không khai thứ tự ba lượt, và ngưỡng là quan hệ trần «cached bằng total» không đòi total > 0 | Cache lạnh (máy mới, CI, vừa xoá `.turbo`, hoặc E6 chạy `--force` xong): chiều đỏ bể cache vì KHÔNG CÓ cache chứ không vì bản khai đúng; chiều dương parse ra 0 bằng 0 rồi thoả một cách rỗng. Cặp hai chiều xanh mà không chứng gì | Ba lượt có thứ tự: mồi → không đổi phải trúng → đã đụng phải bể. Assert total ≥ 1 cả ba lượt, in đủ sáu con số. total = 0 thoát mã 2 | fixed: AC-3 nay khai ba lượt có thứ tự và ngưỡng total ≥ 1 |
| P1 | evals | E4 đo CHỈ DẪN chứ không đo đầu ra — nó tìm chuỗi `turbo.json` trong mã nguồn chân AC-3, trong khi lời hứa của AC-4 là một QUAN HỆ | Chân AC-3 đọc bản khai gián tiếp (ghép chuỗi, glob) thì E4 không thấy chuỗi nên xanh oan. Chiều ngược cũng hỏng: `packages/ui/turbo.json` nằm trong `paths` của E3, chỉ cần chân in tên file ấy trong một thông điệp lỗi là E4 đỏ oan | Bỏ phép tìm chuỗi. E4 tự dựng trạng thái cache, hỏi chân AC-3 con số nó dùng, rồi TỰ chạy turbo độc lập và so hai cặp số — khớp thì chân ấy đang đọc đầu ra thật | fixed: AC-4 nay là phép so số với một lượt turbo độc lập, không còn tìm chuỗi |
| P1 | contract | Trục A khai ba nguồn dối; nguồn thứ ba (trạng thái cơ sở dữ liệu ngoài khoá cache) không AC nào đo. AC-1 chỉ soi `--force`, không bắt ô cắm mới giữ vế `bun run db:test` | Ai đó rút ô cắm còn `bunx turbo run test --force --concurrency=1`. AC-1 xanh vì có `--force`; lượt chấm sau `agent#test` đỏ ở `retireExhausted` vì hàng `AgentTask` sót — đúng bẫy CLAUDE.md đã ghi — và không chân nào chỉ được nguyên nhân | AC-1 thêm điều khoản: ô cắm test của cổng phải chứa CẢ bước dựng lại cơ sở dữ liệu test LẪN cờ `--force`. Chiều đỏ chạy trên bản sao đã xoá vế `db:test` | fixed: AC-1 nay đòi hai vế, E1 kiểm cả hai và gọi tên vế thiếu |
| P2 | evals | Chiều đỏ của E1 là lượt chạy LỊCH SỬ trên cây trước khi sửa, không tái lập được sau khi vòng đóng; và E2 khai một ô cắm KHÁC chứ không gọi chính chân của E1 | Người sửa chân soi làm hỏng vòng lặp (chỉ soi ô đầu, hay thoát sớm). E1 xanh vì cây đã sạch, E2 xanh vì chân của nó là chân khác. Cả hai xanh mà năng lực bắt lỗi đã mất | E2 gọi ĐÚNG chân của E1, trỏ vào bản sao config qua tham số đường dẫn, assert cả mã thoát lẫn tên ô cắm vừa cấy. E1 in số lệnh đã soi, phải bằng số phần tử `suite_keys` | fixed: chân soi nhận `--config <path>`; E2 gọi chính nó trên bản sao |

Không finding nào lật quyết định đã ghi trong `decisions.jsonl`.
