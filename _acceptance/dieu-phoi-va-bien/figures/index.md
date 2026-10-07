# Hình tại điểm quyết định — dieu-phoi-va-bien (Cổng 1)

| Điểm | Đếm | Hình |
|---|---|---|
| d-1 hook chặn S4 nhận S4 theo danh tính workflow | 3 nhánh rẽ (meta trong tệp/script · name · tên tệp khi không đọc được) | `nhan-dien-s4` |
| d-2 kiểm hình dạng tay, đóng với khoá lạ | dưới ngưỡng: 1 bước (đọc → kiểm → ném) | — |
| d-3 lệnh bọc giu-nhip + hook ép dùng | 4 bước nối tiếp (xin nền → hook xét → lệnh bọc chạm nhịp → nhịp gia hạn) + 1 nhánh | `giu-nhip` |
| d-4 gia hạn theo yêu cầu áp ở mỗi nhịp | 4 bước nối tiếp + 3 nhánh chặn (đã áp · trước cap_luc · khoá sang tay) | `gia-han` |
| d-5…d-8 bốn dòng descope | dưới ngưỡng: mỗi dòng 1 bước | — |
| [GIẢ ĐỊNH] hook PostToolUse chạy cho agent con của Workflow S4 | dưới ngưỡng: 1 bước — hiện như nhãn trên hình `giu-nhip` | — |

## Đề bài

### nhan-dien-s4
- Loại: flowchart quyết định.
- Nút: «Lời gọi Workflow tới hook» → «có `script` nội tuyến?» → «meta.name = acceptance-verify?» ; «có `name`?» → «= acceptance-verify?» ; «có `scriptPath`?» → «đọc 64 KiB đầu được?» → có: «meta.name = acceptance-verify?» / không: «tên tệp khớp acceptance-verify*.js?» → kết: «S4 → xét khoá s4» hoặc «không phải S4 → thoát 0».
- Nhãn đặc biệt: đánh dấu đường bản chép `.acceptance-runs/wf/acceptance-verify-<slug>-r<N>.js` (lỗ cũ, nay bắt được bằng meta).
- AC: AC-1, AC-2.

### giu-nhip
- Loại: sequence (bốn cột: Phiên thợ · hook chặn S4 · lệnh bọc giu-nhip · bộ phát lịch).
- Bước: thợ gọi Bash nền lệnh nặng → hook: đang giữ khoá + nền + chưa bọc → thoát 2 kèm dòng lệnh bọc → thợ gọi lại qua lệnh bọc → hook 0 → lệnh bọc chạm `khoa/<tn>/nhip` mỗi 1′ khi lệnh con chạy → bộ phát lịch: hết hạn + nhịp mới → gia hạn (không thu hồi) → lệnh con thoát → lệnh bọc trả mã thoát.
- Nhãn [GIẢ ĐỊNH]: Workflow S4 không đi qua lệnh bọc; dựa vào hook PostToolUse của agent con.
- AC: AC-9, AC-10.

### gia-han
- Loại: flowchart.
- Nút: yêu cầu gia-han → máy xét (giữ đúng một khoá khớp? ước ≤ trần?) → duyệt (máy) / can_phan → giám sát ghi tra-loi duyệt → mỗi nhịp: tra-loi duyệt? → khoá còn do phiên này giữ? → luc ≥ cap_luc? → id chưa trong gia_han_theo? → có số phút dương? → han_moi = max(hạn cũ, bây giờ) + phút, ghi gia_han_theo, sự kiện gia-han; mỗi nhánh «không» → không đổi hạn (+ can_phan một lần khi thiếu phút / khoá sang tay).
- AC: AC-11, AC-12.
