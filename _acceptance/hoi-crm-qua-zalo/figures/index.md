# Hình tại điểm quyết định — hoi-crm-qua-zalo (Cổng Phạm vi, T3)

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Đường đi của một câu hỏi: webhook → giao dịch DB → `send()` eve → `message.completed` → lọc → Zalo, với ba cửa từ chối (vai, trần, đang bận) và hai cửa lỗi (turn.failed, quá hạn) | 6 bước nối tiếp, 5 nhánh rẽ → cần hình | `duong-cau-hoi` |
| Chặn ghi bằng công cụ động ghi đè theo tên (approach d-…-2): purpose zalo → map công cụ ghi → bản từ chối; purpose khác → null; bánh cóc danh sách | 2 nhánh rẽ, 3 bước → cần hình | `cong-cu-chi-doc` |
| Trần ba mức tính theo giờ xưởng, hàng từ chối không tính (approach d-…-4) | 3 nhánh nối tiếp → cần hình | gộp vào `duong-cau-hoi` (cửa «trần») |
| Webhook đáp 200 trước khi hỏi tác tử (approach d-…-3) | 2 bước → dưới ngưỡng: 2 | — |
| Tách khỏi lượt 10 OKR (approach d-…-1) | 1 quyết định, 0 nhánh kỹ thuật → dưới ngưỡng: 1 | — |
| Ba `[GIẢ ĐỊNH]` trong Coverage (send trên phiên bận; usage có token; ZaloLink mất khi rời) | mỗi dòng một khẳng định → dưới ngưỡng: 1 | — |

## Đề bài từng hình

### duong-cau-hoi — sơ đồ luồng (flowchart)

Nút theo thứ tự: «Zalo gửi webhook» → «Khoá đúng?» (không → 403) → «Trùng message_id?» (có → bỏ) → «Mã 6 số / xong n / mới?» (có → luật cũ hoặc reset) → «Còn là thành viên vai kinh doanh?» (không → hàng `tu-choi-vai`, câu không quyền) → «Dưới trần phút/ngày/tháng?» (không → hàng `tu-choi-tran-*`, câu hết trần) → «Phiên đang bận?» (có → `dang-ban`, câu đang trả lời) → «Ghi hàng `dang-hoi`, đáp 200» → «send() eve, sendChatAction» → «message.completed» → «locTraLoi: che SĐT/email, cắt ≤ 2.000» → «sendMessage, hàng `da-tra-loi` + token + độ trễ». Nhánh lỗi: «turn.failed» hoặc «quá 5 phút (tick)» → hàng `loi`, câu «không trả lời được». Nhãn bằng chữ thường; AC liên quan ghi ở góc mỗi cửa: AC-3, AC-5, AC-6, AC-1, AC-8, AC-10.

### cong-cu-chi-doc — sơ đồ khối (block/decision)

Ba khối: «Phiên eve bắt đầu» → «purpose = zalo?» → (có) «Bộ giải động trả map: tên công cụ ghi → bản từ chối {ok:false}» / (không) «null, công cụ thật». Khối bên: «Bánh cóc: tệp trong tools/ = doc ∪ ghi, rời nhau; tệp lạ → test đỏ nêu tên». Ghi AC-7, AC-9.
