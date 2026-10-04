---
schema_version: 1
feature: Màn «Đã gửi» của Cập nhật tuần đếm đúng KR còn chờ — không báo nhầm KR đã gửi trong tuần là còn chờ
slug: da-gui-dem-dung-kr-cho
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-04
design_doc: docs/superpowers/specs/2026-10-04-da-gui-dem-dung-kr-cho-design.md
---

# Acceptance Contract: da-gui-dem-dung-kr-cho

## Context

Ngoài-3 của `man-okr-truoc-r1` (chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 04/10). Màn «Đã gửi»
(`DaGui` trong `okr/cap-nhat-tuan/cap-nhat-tuan.tsx`) nhận `chuaGui = tong - daGui.dong.length`, nên KR đã
gửi trước đó trong tuần bị đếm là «còn chờ». Sau «Sửa cập nhật» một KR, hoặc sau khi gửi nốt KR còn thiếu ở
trạng thái gửi một phần, màn ghi «1 KR chưa chọn mức tự tin vẫn chờ lần gửi sau» dù mọi KR đã gửi tuần này.

## Criteria

- AC-1: Given người phụ trách có hai KR đều đã cập nhật tuần này, When người đó bấm «Sửa cập nhật», chọn mức tự tin cho đúng một KR và gửi thành công, Then màn «Đã gửi» ghi «Đã gửi 1 cập nhật…» và không có câu «… vẫn chờ lần gửi sau».
- AC-2: Given người phụ trách có hai KR, một KR đã cập nhật tuần này, When người đó chọn mức cho KR còn lại và gửi thành công, Then màn «Đã gửi» không có câu «… vẫn chờ lần gửi sau».
- AC-3: Given người phụ trách có ba KR, một KR đã cập nhật tuần này, When người đó chọn mức cho đúng một trong hai KR còn lại và gửi thành công, Then màn «Đã gửi» ghi đúng «1 KR chưa chọn mức tự tin vẫn chờ lần gửi sau».
- AC-4: Given người phụ trách có ba KR chưa KR nào cập nhật tuần này, When người đó chọn mức cho hai KR và gửi thành công, Then màn «Đã gửi» ghi «Đã gửi 2 cập nhật…» và «1 KR chưa chọn mức tự tin vẫn chờ lần gửi sau» như trước lượt sửa này; And khi chọn mức cho cả ba KR thì màn ghi «Đã gửi 3 cập nhật…» và không có câu chờ.
- AC-6: Given người phụ trách có ba KR, KR A đã cập nhật tuần này, When người đó chọn mức cho A và cho một KR chưa gửi rồi gửi thành công, Then màn «Đã gửi» ghi «Đã gửi 2 cập nhật…» và đúng «1 KR chưa chọn mức tự tin vẫn chờ lần gửi sau» (KR còn lại).
- AC-5: Given tệp màn Cập nhật tuần sau lượt sửa, When chạy sàn thiết kế tĩnh, Then không có lỗi P0.

## Coverage

Quét theo khuôn test-matrix (cùng phương pháp `morphological-scan` đã chạy cho `man-okr-truoc-r1`).

- Trục «KR đã cập nhật tuần này lúc mở trang»: 0 · một phần · tất cả [thước CE: ba trạng thái `ST-capnhat-dangdien` / `ST-capnhat-motphan` / `ST-capnhat-daxong` của `man-okr-truoc-r1`]
- Trục «lượt gửi»: gửi tất cả KR còn thiếu · gửi một phần KR còn thiếu · gửi lại KR đã gửi (luồng «Sửa cập nhật»)
- Chín ô (3 × 3):
  - 0 × gửi hết còn thiếu → AC-4 (vế And) · 0 × gửi một phần còn thiếu → AC-4 · 0 × gửi lại → Never (chưa có gì để gửi lại).
  - một phần × gửi hết còn thiếu → AC-2 · một phần × gửi một phần còn thiếu → AC-3 · một phần × gửi lại kèm KR còn thiếu → AC-6.
  - tất cả × gửi lại → AC-1 · tất cả × gửi hết còn thiếu và tất cả × gửi một phần còn thiếu → Never (không còn KR nào thiếu).
- Later: không có.

## Out of scope

- Đổi chữ của câu «… vẫn chờ lần gửi sau» hay của màn «Đã gửi».
- Đọc lại danh sách từ máy chủ sau khi gửi; mọi phép đếm dùng dữ liệu lúc mở trang.
- Ngoài-1, Ngoài-2, Ngoài-4, Ngoài-5, Ngoài-6 của `man-okr-truoc-r1` (đã định đoạt ở Cổng Bằng chứng).

## Notes

- Ranh giới phiên P2: chỉ `okr/cap-nhat-tuan/**` và test của nó.
- Một lần mở trang chỉ gửi được một lượt: màn «Đã gửi» thay form và chỉ dẫn về «Của tôi»; lượt gửi kế luôn mở trang lại, nên dữ liệu lúc mở trang không cũ giữa hai lượt (gap-probe P2).
- **Known limits (chủ kho ghi ở Cổng Bằng chứng 2026-10-04):**
  - Ngoài-1 — tại đỉnh lúc chấm, bản đồ sản phẩm và trang lộ trình chưa vẽ lại cho hồ sơ này nên kiểm tra
    nghiệm thu của công ty báo lệch; vẽ lại khi gộp `onehub` trước khi đẩy, theo luật điều phối.
  - Ngoài-2 — cột «Đã gửi N cập nhật» trong ma trận E1 chỉ lặp lại số mà mock trả về (`written` bằng số dòng
    gửi), nên nó không phải bằng chứng độc lập; cột tập KR gửi và cột câu chờ vẫn là hai phép đo thật.
