## Tóm tắt

Mở ô cơ hội cho hàng **LT1 · Trang Lộ trình trong CRM** trên lộ trình OKR: «Trưởng phòng ban mở trang Lộ
trình trong CRM, thấy việc của nhóm mình đang ở đâu mà không phải hỏi». Chủ kho đã ký Cổng Đáng `build`
ngày 08/10. PR này chỉ có hồ sơ, không có mã: vòng làm chưa bắt đầu.

## Đã chốt ở Cổng Đáng

- **Ngưỡng nghiệm thu đo ở trưởng phòng ban:** ít nhất 3 người trả lời đúng «việc này đang ở đâu, bao giờ
  xong» từ trang trong một phút. Ngưỡng của hàng (tin hỏi tiến độ của chủ kho dưới nửa nền 23/48) còn lại
  làm vế phụ, đếm cùng cách.
- **«Nhóm» là luồng việc** như tệp kế hoạch đang ghi (chung CRM, OKR, Trợ lý, dọn dẹp, Zalo). Lọc theo phòng
  ban thật để sau, cần bộ kit thêm một trường riêng.

## Thứ tự gộp

Gộp **sau** phanlemanh/crm-onehub#313 — PR đó thêm hàng LT1 vào tệp kế hoạch. Gộp trước thì trang lộ trình
báo «hồ sơ ghi việc LT1 — kế hoạch không có việc LT1» cho tới khi #313 vào. Gộp xong #313 thì vẽ lại bản đồ
trên nhánh này trước khi gộp.

## Vòng chạy khi nào

Chưa xếp đợt. Vòng chỉ bắt đầu khi chủ kho xếp nó vào một đợt sau 14/10 và crm đã nhận bộ kit ≥ 2.26 (bản
mang khối dữ liệu lộ trình, phanlemanh/acceptance-gate-kit#285).

## Đã đổi

- `_acceptance/trang-lo-trinh-trong-crm/opportunity.md` — ô cơ hội, máy dựng từ hàng rồi điền phân tích;
  mang chữ ký Cổng Đáng.
- `PRODUCT-MAP.md`, `LO-TRINH.html` — máy vẽ lại.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
