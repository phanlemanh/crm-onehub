---
schema_version: 1
feature: "Bàn gieo góp ý dùng chung chạy lại được sau khi công cụ nộp của Trợ lý OKR tự đóng việc, để ba bàn đo màn OKR đo được lại"
slug: ban-gieo-gop-y-sau-nop
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: signed-off
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-09T16:05:00Z
design_doc: docs/superpowers/specs/2026-10-09-ban-gieo-gop-y-sau-nop-design.md
---

# Acceptance Contract: ban-gieo-gop-y-sau-nop

## Context

Hàng K3b của dãy P1, đợt `sau-14-10`. Cổng Đáng `build` ngày 2026-10-09 (Phan Le Manh).

`_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs` là bàn gieo dùng chung của ba bàn đo màn OKR. Từ `871c9b17`
(07/10), công cụ nộp của Trợ lý OKR tự đóng việc với kết cục `da-nop`, còn hàm `nop()` của bàn gieo vẫn đòi
`completeTask` đóng được việc, nên `gieoGopY` luôn ném «viec … da dong truoc khi nop xong». Ba bàn đo dừng ở bước
chuẩn bị từ đó.

Source input: `opportunity.md` · design doc · sổ quyết định của `kara-gop-y-luot-2` (Treo-3 ở Cổng 2 của K3).

## Criteria

- AC-1: Given một phiên đo riêng với bộ OKR mẫu vừa nạp, When gọi `gieoGopY` của bàn gieo dùng chung, Then hàm chạy hết không ném, Mục tiêu A có đúng ba góp ý ở trạng thái `cho`, Mục tiêu B không có góp ý nào, và cả hai việc `okr-de-xuat` đã đóng với kết cục `da-nop`.
- AC-2: Given ma trận viết trước bốn ca kết quả nộp — ghi được và việc đóng bằng `da-nop`; bị từ chối; ghi được nhưng việc chưa đóng; ghi được nhưng việc đóng bằng kết cục khác `da-nop` — When bàn gieo kiểm «nộp xong», Then chỉ ca đầu qua, ba ca còn lại ném lỗi gọi tên đúng lý do, không ca nào gieo xanh trên một lần nộp hỏng. Ca bị từ chối được lấy cả từ một lần nộp thật vào việc đã đóng, không chỉ từ dữ liệu viết tay.
- AC-3: Given ba lệnh bàn đo màn gọi bàn gieo chung (`gy_man_that` của `gop-y-dung-cho`, `r1a_man_chip` của `khung-okr-truoc-r1`, `r1d_man_okr` của `okr-to-chuc-va`), When chạy từng lệnh trên cây này, Then mỗi lệnh có dấu hiệu dương đã gieo xong (dòng `gieo-gop-y: xong` do bàn gieo in) — thiếu dấu hiệu thì tính là dừng ở bước gieo dù lệnh in gì — và kết luận của từng bàn (mã thoát cùng dòng kết quả cuối: `KET LUAN`, `KHONG DO DUOC` hay `so o: <n>`) hiện trong đầu ra của phép đo và trong `evidence/ba-ban-do.txt` của hồ sơ, để trình ở Cổng 2; ảnh bằng chứng của ba hồ sơ kia không bị đổi sau lượt.
- AC-4: Given diff của vòng này, When đối chiếu ranh giới hàng K3b, Then chỉ `_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs`, thư mục hồ sơ `ban-gieo-gop-y-sau-nop`, `_acceptance/config.yaml` (chỉ thêm dòng) và các tệp do máy vẽ (bản đồ sản phẩm, trang lộ trình), design doc, kế hoạch đổi; không tệp mã sản phẩm nào đổi.
- AC-5: Given ba bản sao phá bàn gieo, đặt cạnh tệp thật — (a) đặt lại lời gọi `completeTask` bắt buộc sau khi nộp, (b) bỏ phần kiểm kết cục của việc, (c) hàm kiểm «nộp xong» luôn ném một lỗi lạ — When chạy phép đo của AC-1, AC-2 và bộ phân loại của AC-3 trên bản sao, Then (a) làm phép đo AC-1 đỏ với «da dong truoc khi nop xong», (b) làm phép đo AC-2 đỏ ở đúng ca kết cục khác `da-nop`, (c) làm phép đo AC-1 đỏ với lỗi lạ đó và bộ phân loại của AC-3 xếp đầu ra ấy vào «không qua bước gieo»; tệp bàn gieo thật không đổi một byte trong suốt lượt.

## Coverage

Bỏ quét không gian AC (entry `descope` «bỏ coverage-scan» trong sổ quyết định). Không gian đã liệt kê đủ bằng tay:
một đường gieo thật (AC-1), bốn ca kết quả nộp (AC-2), ba lệnh bàn đo gọi bàn gieo (AC-3). AC-4
ranh giới, AC-5 chiều đỏ trên vật thật.

## Đường đo

Ngưỡng ở `opportunity.md`: «SỐNG» khi cả ba bàn đo qua bước chuẩn bị; bàn đỏ ở bước đo thành mục cho người quyết.
AC-3 đo đúng ngưỡng đó; dòng kết luận từng bàn ghi ở `.acceptance-runs/ban-gieo-gop-y-sau-nop/ba-ban-do.txt`.

## Out of scope

- Sửa mã sản phẩm, hay nội dung đo của ba bàn đo khi chúng đỏ ở bước đo — mỗi chỗ đỏ là một mục cho người quyết.
- Chuyển `kara-gop-y-luot-2` về dùng bàn gieo chung (K3 đang có PR riêng).
- Đưa eval `ui-check` vào làn ghim lại — việc của bộ kit nghiệm thu.

## Notes

- Không chạm giao diện: không nghi thức design-pass (entry `descope` «bỏ design-pass» trong sổ quyết định).
- Known limits (Ngoài-2, Cổng 2): Trong một tình huống hiếm (thư mục bằng chứng có tệp lạ bị lệnh đo xoá), phép đo có thể báo là đo đỏ thay vì báo là không đo được. Người đọc kết quả có thể hiểu nhầm mức độ sự cố, nhưng việc này không làm sai kết quả đo bình thường.
- Known limits (Ngoài-3, Cổng 2): Nếu sau này có ảnh bằng chứng đặt tên có dấu hoặc dấu cách, ảnh bị phép đo ghi đè có thể không được trả lại nguyên trạng mà không ai biết. Hiện chưa xảy ra vì mọi tên tệp đều không dấu.
- Known limits (Ngoài-4, Cổng 2): Nếu một lượt đo bị dừng đột ngột giữa chừng, lượt chạy kế tiếp có thể coi ảnh bằng chứng đã bị ghi đè là bình thường và báo xanh. Cách tránh: sau khi ngắt lượt đo, kiểm lại ảnh bằng chứng của ba hồ sơ kia trước khi tin kết quả.
- Known limits (Ngoài-5, Cổng 2): Khi một trong ba bàn đo màn dừng giữa chừng ở bước đo và in ra một câu báo không đo được theo kiểu riêng, bản tổng hợp sẽ không nhận ra câu đó và báo thiếu kết luận. Người đọc vẫn thấy bàn đó đỏ, nhưng lý do thật của nó bị che trong bản tổng hợp.
- Known limits (Ngoài-6, Cổng 2): Nếu hai lượt phá thử chạy cùng lúc trên một cây, lượt này có thể xoá bản sao đang dùng của lượt kia. Kết quả là báo «không đo được» hoặc báo nhầm vết lọt. Chạy lại từng lượt một thì hết.
- Known limits (Ngoài-7, Cổng 2): Một ca thử dùng giá trị kết cục mà hệ thống thật không bao giờ ghi ra. Phép thử vẫn chặn đúng việc đóng sai, nhưng nếu tên kết cục thật đổi thì ca này không báo kịp.
- Known limits (Ngoài-8, Cổng 2): Nếu bộ phân loại hỏng theo kiểu luôn báo «không qua bước gieo», phép thử phá này vẫn xanh. Lỗi đó chỉ lộ ra ở một phép đo khác chứ không ở chính phép thử này.
