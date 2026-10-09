---
schema_version: 1
feature: "Bàn gieo góp ý dùng chung chạy lại được sau khi công cụ nộp của Trợ lý OKR tự đóng việc, để ba bàn đo màn OKR đo được lại"
slug: ban-gieo-gop-y-sau-nop
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: draft
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
- AC-2: Given ma trận viết trước bốn ca kết quả nộp — ghi được và việc đóng bằng `da-nop`; bị từ chối; ghi được nhưng việc chưa đóng; ghi được nhưng việc đóng bằng kết cục khác `da-nop` — When bàn gieo kiểm «nộp xong», Then chỉ ca đầu qua, ba ca còn lại ném lỗi gọi tên đúng lý do, không ca nào gieo xanh trên một lần nộp hỏng.
- AC-3: Given bốn lệnh bàn đo màn của ba hồ sơ dùng bàn gieo chung (`gop-y-dung-cho`, `khung-okr-truoc-r1` hai phần, `okr-to-chuc-va`), When chạy từng lệnh trên cây này, Then không lệnh nào dừng ở bước gieo, và kết luận của từng bàn (đúng hay đỏ ở bước đo) được ghi lại để trình ở Cổng 2.
- AC-4: Given diff của vòng này, When đối chiếu ranh giới hàng K3b, Then chỉ `_acceptance/gop-y-dung-cho/rang/san-gop-y.mjs`, thư mục hồ sơ `ban-gieo-gop-y-sau-nop`, `_acceptance/config.yaml` (chỉ thêm dòng) và các tệp do máy vẽ (bản đồ sản phẩm, trang lộ trình), design doc, kế hoạch đổi; không tệp mã sản phẩm nào đổi.
- AC-5: Given hai bản sao phá vật thật — (a) đặt lại lời gọi `completeTask` bắt buộc sau khi nộp, (b) bỏ phần kiểm kết cục của việc — When chạy lại phép đo của AC-1 và AC-2, Then (a) làm phép đo AC-1 đỏ với «da dong truoc khi nop xong», (b) làm phép đo AC-2 đỏ ở đúng ca kết cục khác `da-nop`, và tệp thật trả lại nguyên sau mỗi vết.

## Coverage

Bỏ quét không gian AC (entry `descope` «bỏ coverage-scan» trong sổ quyết định). Không gian đã liệt kê đủ bằng tay:
một đường gieo thật (AC-1), bốn ca kết quả nộp (AC-2), bốn lệnh bàn đo của ba hồ sơ dùng bàn gieo (AC-3). AC-4
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
