# Phá-thử — chiều đỏ của sáu eval (S3, 2026-09-25)

Mọi lượt phá chạy sau commit, trên cây tại chỗ, khôi phục bằng `git checkout -- <tệp>`
và kiểm `git status` sạch trước lượt kế. Lệnh test chạy trong `apps/agent`
(`bun run test -- "cd apps/agent && bun test test/zalo-webhook-doc-khuon-that.integration.spec.ts -t <nhóm>"`).

| Eval | Phá gì | Kết quả | Thông điệp |
|---|---|---|---|
| E1 | `docCapNhat` đọc bằng `parseZaloGetUpdates` | ô `that` đỏ, ô `vo` qua | `khuon that phai noi duoc` |
| E2 | tin khuôn có vỏ đổi `message_id` thành `vo:<id>` | cả hai thứ tự đỏ | `chong trung khong phu thuoc vo` |
| E3 (1) | bỏ `khoa_message=` khỏi dòng log | đỏ ở ô a | `a: log in khoa cua message` |
| E3 (2) | nối `JSON.stringify(than)` vào dòng log | đỏ ở ô b | `b: log khong mang noi dung tin` |
| E4 (1) | `thanWebhookCoVo` đổi `event_name` | đỏ | `gia khong rut tu fixture` |
| E4 (2) | như E1, chạy trọn hai spec đã ký | 11 ca đỏ, tập bằng `rang/ca-qua-webhook.json` | tên ca |
| E5 | `docs/` lấy ở `merge-base` (`43ef79bd`) | exit 1 | `docs/agent.md chua noi than that {event_name, message}` (và ba dòng khác) |
| E5 | bản sao xoá dòng 2d | exit 1 | `bang muc 7 khong co dong cho zalo-webhook-doc-khuon-that` |
| E6 | đổi thông điệp một `expect` ở `webhook-noi` | exit 1 | `spec da ky bi sua ngoai ca c` |
| E6 | thêm một dòng trống vào spec người mới | exit 1 | `spec da ky bi sua: noi-zalo-cho-nguoi-moi` |

Đối chứng dương trên cây lành: cả bốn nhóm của spec mới xanh; `tai-lieu.mjs` và
`giu-da-ky.mjs` exit 0.

## Điều lượt phá cho thấy

- **E2 lượt đầu đỏ sai chỗ.** Thông điệp ghim nằm ở khẳng định đếm liên kết,
  nhưng mã chỉ dùng được một lần nên số liên kết luôn là 1. Tin trả lời thứ hai
  mới là dấu xử lý hai lần. Thông điệp ghim chuyển sang cặp (số tin trả lời, số
  hàng đã thấy) ở commit `72f38f5a`.
- **E4 (2) dự đoán thiếu một ca.** `gui-hong: doi chung duong` đo dòng log theo
  `message_id`, nên nó phụ thuộc việc đọc thân. Danh sách tăng từ 10 lên 11 ca;
  lý do ghi trong `decisions.jsonl` (`d-20260924T230824Z-11`).
- **`webhook-trung` của spec đã ký không đo webhook trên khuôn nào.** Bộ đọc
  hỏng thì vòng tay bắt tin thay và ca vẫn xanh. Chống trùng qua webhook nay do
  E2 đo.
- **Lượt phá đầu tiên thoát 1 mà không chạy test nào.** Nguyên nhân là đường dẫn
  tính từ gốc kho được đưa vào sau `cd apps/agent`. Lượt đó không tính; mọi hàng
  ở bảng trên lấy từ lượt chạy lại có dòng `(fail)` và thông điệp.
- **Sau khi sửa theo `lint:slop` (`101e560f`), E1 và E3 được phá lại.** `ghiSaiKhuon` nay
  nhận bản mô tả thân thay cho thân, và bộ gom log tuần tự hoá mọi đối số bằng
  `Bun.inspect`. Lượt phá lại: E1 và E3 (1) đỏ như cũ. Bản phá E3 (2) phải dời sang
  chỗ gọi, nối `JSON.stringify(than)` vào lý do; nó đỏ `b: log khong mang noi dung tin`.
