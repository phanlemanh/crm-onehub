---
schema_version: 1
feature: Lưới chặn trước khi đẩy phải chạy thật, và hồ sơ đã ký phải trỏ đúng chân răng
slug: luoi-day-do-that
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-01T02:52:00Z
---

# Acceptance Contract: luoi-day-do-that

## Context

Trước khi đẩy mã lên, kho chạy một lưới bốn tác vụ: kiểm kiểu, soi mã, soi mã
thừa, và bộ kiểm. Sáu lần đẩy trong ngày 2026-09-01 đều báo xanh — và cả sáu
lần **không tiến trình kiểm nào thật sự chạy**. Bộ dựng đọc kết quả cũ từ bộ nhớ
đệm và in `FULL TURBO`. Một cái lưới cho qua mà không đo gì thì không phải lưới.

Cùng lượt dọn dẹp, sửa một chỗ trỏ sai: hồ sơ `sua-test-do-thu-tu-nap` đã ký hôm
nay trỏ tới chân răng `--chan o-cam`, nhưng chân đó đã tách làm ba và cái tên cũ
nay là bí danh gộp, không phải chân chấm tiêu chí.

Source input: prompt

## Criteria

- AC-1: Given cây làm việc sạch, When lưới trước khi đẩy chạy, Then đủ bốn tác vụ được gọi, và ba tác vụ đi qua bộ dựng đều báo `0 cached` — không tác vụ nào lấy kết quả cũ.
- AC-2: Given một bài kiểm THẬT đang đỏ trong kho, When lưới chạy, Then nó thoát khác 0 và gọi đúng tên tác vụ hỏng.
- AC-3: Given người cần đẩy gấp và đặt biến thoát khẩn cấp, When lưới chạy, Then nó NÓI RA rằng không có gì được kiểm, ra ngay, không chạy tác vụ nào, và không tốn quá 3 giây.
- AC-4: Given hợp đồng đã ký của `sua-test-do-thu-tu-nap`, When đọc chỗ nó trỏ tới bộ răng, Then tên chân là chân chấm thật, không phải bí danh gộp, và chân đó chạy được.
- AC-5: Given cây làm việc, When chạy tác vụ soi mã và tác vụ kiểm kiểu, Then cả hai xanh.

## Coverage

Hai trục. Không quét hình thái: không gian là một tệp lưới bốn tác vụ và một
dòng trỏ, đã đếm hết được.

- Trục chiều đo: chiều dương — lưới phải chạy thật (AC-1) | chiều đỏ — tác vụ hỏng thì lưới phải chặn (AC-2) | chiều bỏ qua — lối thoát khẩn cấp phải còn đi được (AC-3) [thước CE: ba chân của bộ răng, mỗi chân một mã thoát riêng]
- Trục vật bị sửa: tệp lưới (AC-1, AC-2, AC-3) | dòng trỏ trong hồ sơ đã ký (AC-4) | cả cây (AC-5) [thước CE: hai file trong diff]

## Out of scope

- Không đổi danh sách bốn tác vụ của lưới. Vòng này làm chúng chạy thật, không thêm bớt việc.
- Không sửa văn bản tiêu chí nào trong hồ sơ đã ký. Chỉ sửa một tên chân trong khối ghi chú, kèm ngày.
- Không đụng lưới của máy chủ tích hợp. Nó chạy trên máy sạch nên không có đệm để mà đọc.
- Không quét cả kho tìm chỗ trỏ sai khác. Một vòng một chỗ.
- Không sửa hai commit mang đuôi đồng-tác-giả. Vẫn là việc của người.

## Notes

Hợp đồng viết TRƯỚC khi sửa mã.

Chi phí đã đo, không đoán: ép chạy thật tốn khoảng 24 giây một lần đẩy — kiểm
kiểu 6 giây, soi mã dưới một giây, soi mã thừa 1 giây, bộ kiểm 17 giây. Đổi lại
là một lưới nói thật.

Cách sửa là một biến môi trường duy nhất đặt ở đầu vòng lặp, nên nó phủ cả bốn
tác vụ cùng lúc thay vì vá từng lệnh.

Chân đo chiều đỏ sinh đột biến từ chính tệp lưới bằng một phép thay, và từ chối
chạy nếu số dòng lệch khác 2 — cùng nếp với bộ răng của vòng
`khang-dinh-microsoft-co-rang`.

**Vòng chấm 1 bắt được bốn chỗ; ba đã sửa, một thành giới hạn đã khai.**

- Biến ép chạy KHÔNG phủ cả bốn tác vụ. Tác vụ soi-mã-thừa chạy `oxlint` trực
  tiếp, không qua bộ dựng. AC-1 nay nói đúng ba-trên-bốn, và thông điệp commit
  cũng đã sửa theo.
- **Giới hạn còn lại:** `oxlint` 1.78 không có tuỳ chọn bộ nhớ đệm nào, và khi
  sạch nó không in gì. Nên độ tươi của nó là tính chất theo cấu tạo — không có
  đệm để mà đọc lại — chứ không phải thứ đo được từng lượt. Bộ răng chỉ khẳng
  định nó ĐƯỢC GỌI.
- Chân đo cũ nhận "ít nhất 3 dòng tổng kết". Người chấm chứng minh lỗ: xoá hẳn
  tác vụ soi-mã-thừa khỏi lưới thì vẫn đủ 3 dòng và chân vẫn xanh. Nay chân đối
  chiếu nguyên văn danh sách bốn tác vụ và đòi đúng 3 dòng tổng kết.
- Chiều đỏ cũ trỏ lưới vào một tác vụ KHÔNG TỒN TẠI, nên nó chỉ chứng minh lưới
  chặn được tác vụ thiếu, không phải tác vụ hỏng. Nay nó cài một bài kiểm thật
  đang đỏ vào kho, chạy lưới thật, rồi dọn.
- Lối thoát khẩn cấp trước đây im lặng tuyệt đối, nên một biến sót trong hồ sơ
  shell sẽ tắt lưới ở mọi lần đẩy mà không ai biết. Nay nó in một dòng nói thẳng
  là không có gì được kiểm.
