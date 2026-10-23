# Hình tại điểm quyết định — trang-ve-gop-va-dau-cay

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Sổ 1, 2, 3, 12, 13 — gộp giữ bản mình rồi vẽ lại ở đâu, lúc nào | 4 bước nối tiếp (gộp → driver giữ bản mình → hook gộp → cây tạm vẽ → viết lại commit) + 2 nhánh (tự động / dừng vì xung đột) | `b-luong-gop.html` |
| Sổ 4, 5, 7, 10 (Hỏi-1), 11 — lần đẩy biết bước nào đã xanh | 3 nguồn rẽ nhánh + 4 bước (phân loại → phiếu → hook bỏ bước → bộ kiểm hình ghi dấu) | `e-luong-day.html` |
| Sổ 8 — bỏ đặc tả UX | dưới ngưỡng: 1 bước, 0 nhánh | — |
| Sổ 9 — không xử config.yaml | dưới ngưỡng: 1 bước, 0 nhánh | — |

## Đề bài `b-luong-gop`

Loại: flowchart. Nút: «git merge (máy, app đồng bộ, git pull)» → «driver trang-ve: giữ bản của nhánh, không xung đột ở
PRODUCT-MAP.md, LO-TRINH.html» → rẽ hai nhánh: (1) «gộp tự động → post-merge» → «cây tạm từ commit gộp → bộ vẽ
product-map.mjs» → «viết lại commit gộp: cùng cha, lời, tác giả; trang mới»; (2) «dừng vì xung đột ở tệp khác (hay
--no-commit) → người giải, git commit → pre-commit» → «cây tạm từ chỉ mục → bộ vẽ» → «git add hai trang vào commit gộp».
Hai nhánh hợp về «CI: product-map.mjs --check không đổi». Nút phụ xám: «GitHub vẫn báo xung đột tới khi đẩy (ngoài phạm
vi)». AC: 2, 3, 4, 5.

## Đề bài `e-luong-day`

Loại: flowchart. Nút: «git push → .githooks/pre-push (không đổi)» → «pre-push-t1.mjs: luật T1 như cũ + pre-push-da-chung.mjs»
→ ba nguồn song song: «dấu hook (bước đã chạy, vân tay, 14 ngày)», «sổ chạy S4 / ghim lại», «CI check-run — Hỏi-1:
merge-ref?» → «cùng cây mã? (diff chỉ T1 thường)» → «dòng bỏ qua = T1 ∪ đã chứng + phiếu» → «hook chạy phần còn lại» →
«verify-gate-shape: đọc phiếu, kiểm, ghi dấu cho bước đã chạy». AC: 6, 7, 8, 9, 10.
