---
slug: zalo-webhook-doc-khuon-that
at: 2026-09-24T22:45:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Sau quyết định (A), thước khoá `nzm_giu_da_ky` đỏ sẵn trên nhánh nên không còn gì đo lời hứa «chỉ gỡ ca c, không sửa ca nào khác» của hai spec đã ký | Người làm nới một khẳng định ở `webhook-noi` hay gỡ thêm một ca bỏ-qua cho bộ đọc mới qua; AC-4 «hai spec xanh» vẫn xanh, thước duy nhất bắt được thì đang đỏ sẵn | Eval script so `merge-base` với HEAD: spec người mới không đổi; spec webhook bằng đúng biến đổi có tên của bản cũ; chiều đỏ sửa một `expect` ở `webhook-noi` | fixed: AC-4 thêm vế so `merge-base`; thêm E6 `zwk_giu_da_ky` (`rang/giu-da-ky.mjs`) với biến đổi có tên, chiều đỏ ghim «spec da ky bi sua ngoai ca c» |
| P1 | evals | Zalo giả vẫn tự dựng khuôn bên đọc mong — đúng lớp lỗi gốc; E4 so khoá với danh sách gõ tay và so hai đầu ra của cùng Zalo giả, không round-trip về vật thật [zalo-qua-webhook#F1] | `thanWebhook` gõ `event_name` hay trường cấp đầu theo điều bộ đọc lọc, khác giá trị Zalo gửi; mọi test xanh, production vẫn bỏ tin | So `thanWebhookCoVo(x).result` với fixture `getUpdates` thật sau khi thay trường định danh; khoá cấp đầu tách từ dòng log production lưu thành fixture; chiều đỏ đổi `event_name` | fixed: AC-4 và E4 bước 1 rút từ `zalo-tin-that.json` và `fixtures/zalo-webhook-log-that.txt`; chiều đỏ (1) ghim «gia khong rut tu fixture» |
| P1 | evals | Chiều đỏ của E4 chỉ ghim một ca (`webhook-noi`) trong khi AC-4 hứa mọi luật đã ký đi qua webhook chạy trên khuôn thật | Một nhóm (luật mã, trùng) dựng thân bằng literal có vỏ; đưa bộ đọc về `parseZaloGetUpdates` nhóm đó vẫn xanh; AC-4 ký «đo lại trên khuôn production» mà luật cũ chưa từng chạy qua khuôn thật | Danh sách ca phụ thuộc thân webhook viết trước; chiều đỏ so tập ca đỏ bằng danh sách | fixed: E4 chiều đỏ (2) — commit `rang/ca-qua-webhook.json` (số ca tường minh) TRƯỚC lượt phá-thử, rồi so tập ca đỏ toEqual danh sách |
| P2 | contract | Out of scope có năm mục mà sổ chỉ có một entry `descope`; mục «chụp thân webhook thật» nêu lý do «cần URL công khai» trong khi production đang nhận thân thật ở URL công khai | Cổng 1 duyệt mà không thấy cả vòng đứng trên `[GIẢ ĐỊNH]` các trường của `message`, kiểm được ở lượt thử production đầu tiên | Mỗi mục có entry `descope` với `impact`/`revisit`; mục chụp thân ghi `revisit` là lượt thử production sau merge | fixed: thêm bốn entry `descope` (d-…-6…9); entry chụp thân nêu lý do thật (phải trỏ webhook bot thật sang chỗ khác — chủ kho chưa cho phép) và `revisit` là lượt thử sau merge đọc `khoa_message` |
| P2 | evals | E5 đo chuỗi có mặt; mục webhook cũ của `docs/agent.md` có thể đã chứa `{event_name, message}`, `ok`, `result` nên tài liệu không sửa vẫn qua | Tài liệu vẫn tả thân có vỏ là khuôn chính mà E5 xanh; chiều đỏ không đỏ | Chạy E5 trên `docs/` ở `merge-base` phải exit 1; một câu chứa cả `{event_name, message}` và «không có vỏ»; `ok`/`result` so theo token có backtick | fixed: AC-5 và E5 đòi câu đồng xuất hiện, token có backtick, chiều đỏ chạy trên `docs/` ở `merge-base` |
