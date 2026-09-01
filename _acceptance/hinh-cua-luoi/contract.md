---
schema_version: 1
feature: Lưới tự đối chiếu với bản khai hình của nó, thay vì chờ người nghĩ ra đòn tấn công kế tiếp
slug: hinh-cua-luoi
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [cli]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-09-01
veto_state: mo
veto_opened_at: 2026-09-01T08:46:50Z
---

# Acceptance Contract: hinh-cua-luoi

## Context

Vòng `luoi-day-do-that` đã ký hôm nay sửa một lưới không đo gì. Ba vòng chấm sau
đó, mỗi vòng một người chấm mới tìm ra **cùng một loại lỗ, cao hơn một nấc**:

- Vòng 1: chân đo nhận "ít nhất ba dòng tổng kết". Xoá một tác vụ khỏi lưới vẫn
  còn ba dòng.
- Vòng 2: chân đo đòi đủ bốn dòng thông báo. Dòng thông báo in TRƯỚC lệnh, nên
  `[ "$task" = "lint:slop" ] || bun run "$task"` giữ đủ bốn tiếng rao mà không
  chạy tác vụ nào.
- Vòng 3: chân đo đòi đúng ba dòng tổng kết, tất cả `0 cached`. Không chân nào
  đọc mỗi dòng tổng kết PHỦ BAO NHIÊU. Đổi kịch bản `test` gốc thành
  `turbo run test --concurrency=1 --filter=@crm/env` thì chín trên mười gói rời
  khỏi lưới và mọi chân vẫn xanh.
- Còn mở: không gì kiểm `core.hooksPath` có trỏ vào `.githooks` không. Hook chưa
  cài thì mọi lần đẩy xanh mà không có gì chạy.

Mỗi lần vá đều đúng, và đều thấp hơn một nấc. **Cái khung mới là vấn đề**: bộ
răng khẳng định những hành vi tác giả nghĩ ra được, còn lỗ kế tiếp luôn là lỗ
tác giả không nghĩ ra.

Vòng này đổi khung. Lưới khai HÌNH của nó ở một chỗ, rồi **tự đối chiếu mình với
bản khai đó ngay trong lượt đẩy**. Mọi cách làm rỗng lưới — kể cả cách chưa ai
nghĩ ra — hiện ra như một chỗ lệch, không cần thêm một chân đo cho từng đòn.

Source input: prompt

## Criteria

- AC-1: Given cây làm việc sạch và bản khai hình, When lưới trước khi đẩy chạy, Then chính lưới đối chiếu sổ thật của nó với tập kỳ vọng SUY RA từ cây lúc chạy, và lượt đẩy chỉ đi tiếp khi mọi cặp gói–tác-vụ không được miễn đều chạy tươi và thoát 0.
- AC-2: Given bản khai hình, When ai đó rút một tác vụ khỏi lưới, bỏ qua một tác vụ trong thân vòng lặp, hoặc thu hẹp một kịch bản gốc bằng bộ lọc, Then lưới đỏ ngay lượt đẩy đó và gọi tên đúng thứ bị thiếu — không chân đo nào được viết riêng cho từng đòn.
- AC-3: Given một gói mất kịch bản đã khai, một gói mới không có kịch bản nào, hoặc cả một GỐC làm việc mới mà bản khai không kể tên, When lưới chạy, Then lưới đỏ. Bản khai chỉ liệt kê NGOẠI LỆ và một sàn gốc, nên thêm gói lành mạnh không phải sửa bản khai, còn bớt việc kiểm thì phải khai ra bằng một dòng có lý do.
- AC-4: Given một kho đã chạy cài đặt và một kho chưa chạy, When chân `noi-day` soi từng kho, Then nó xanh ở kho thứ nhất và đỏ ở kho thứ hai, gọi đúng tên tệp hook rỗng. Lưới đang chạy không tự chứng minh được điều này.
- AC-5: Given tác vụ soi-mã-thừa không đi qua bộ dựng nên không có sổ, When lưới chạy, Then tác vụ tự báo số tệp và số luật nó đã đọc, và lưới so con số đó với một phép đo tham chiếu chạy ngay sau đó.
- AC-6: Given một cây làm việc mà `core.hooksPath` trỏ tới một tệp lưới KHÁC tệp lưới của cây, When chân `noi-day` soi cây đó, Then nó đỏ và nói rõ lưới đang sửa không phải lưới sẽ chạy.

## Coverage

Hai trục. Không quét hình thái: không gian là một tệp lưới, một bản khai và bốn
tác vụ, đã đếm hết được.

- Trục chiều đo: chiều dương — lưới xanh phải kèm sổ đầy đủ (AC-1, AC-5) | chiều đỏ — bốn đòn làm rỗng lưới phải làm lưới đỏ (AC-2, AC-3) | chiều ngoài — lưới có được gọi không, và có phải lưới này không (AC-4, AC-6) [thước CE: mỗi đòn một thông điệp lệch riêng]
- Trục nơi lỗ mở ra: thân vòng lặp của lưới (AC-2) | kịch bản gốc mà lưới gọi (AC-2) | manifest của gói (AC-3) | cấu hình git (AC-4) [thước CE: bốn tệp khác nhau, một chân đo duy nhất bắt cả bốn]

## Out of scope

- Không đổi danh sách bốn tác vụ của lưới. Vòng này làm lưới tự khai, không thêm bớt việc.
- Không xoá chân `ep-chay` của hồ sơ đã ký `luoi-day-do-that`. Nó nay thừa, không sai. Bốn chân còn lại của hồ sơ đó vẫn chạy.
- Không sửa `.oxlintrc.json`. Ai nới `ignorePatterns` thì cả lưới lẫn phép tham chiếu cùng co lại — đây là giới hạn đã khai, không phải việc của vòng này.
- Không thêm kịch bản `test` cho `@crm/ui`. Vòng này chỉ làm chỗ thiếu HIỆN RA thành một dòng miễn có lý do.
- Không đụng lưới của máy chủ tích hợp.
- Không sửa hai commit mang đuôi đồng-tác-giả.

## Notes

Hợp đồng viết TRƯỚC khi sửa mã.

**Bản khai viết ở thể phủ định.** Đây là câu trả lời cho cảnh báo "bản khai phải
sửa tay mỗi lần thêm gói sẽ mục". Bản khai KHÔNG liệt kê gói. Nó liệt kê ngoại
lệ. Tập kỳ vọng suy ra lúc chạy: mọi thư mục dưới `apps/` và `packages/` có
`package.json` đều phải chạy mọi tác vụ đã khai, trừ những gói có một dòng miễn
kèm lý do. Thêm một gói lành mạnh: bản khai không đổi, và mức đòi hỏi tự dâng
lên. Thêm một gói không kiểm gì: lưới đỏ cho tới khi có người viết ra lý do.

Danh sách gốc trong bản khai cũng chỉ là một SÀN. Mọi mẫu `workspaces` của
manifest gốc đều được tính thêm, nên một gốc làm việc mới cũng tự vào tầm ngắm.
Thứ duy nhất còn phải sửa tay là tên bốn tác vụ — và thêm một tác vụ vào lưới mà
quên khai thì lưới cũng đỏ, kèm câu chỉ đúng dòng phải thêm.

**Lưới tự đối chiếu, không đợi bộ răng.** Phép so chạy ở cuối mỗi lượt đẩy, nên
lượt đẩy làm rỗng lưới chính là lượt đẩy bị chặn. Nếu phép so chỉ sống trong bộ
răng thì lưới vẫn rỗng được suốt thời gian giữa hai lần chạy nghiệm thu.

Sổ thật là bản tổng kết lượt chạy của bộ dựng — `TURBO_RUN_SUMMARY`. Nó ghi
từng cặp gói–tác-vụ, trạng thái đệm và mã thoát. Nó là thứ bộ dựng ĐÃ LÀM, không
phải thứ lưới nói là sẽ làm. Một tiếng rao không sinh ra được một dòng sổ.

Bốn đòn của bộ hồi quy được chân `tan-cong` chạy lại thật trên cây này, mỗi đòn
một lần, rồi hoàn nguyên. Chân này gây đột biến vào tệp thật nên nó lưu bản gốc
và phục hồi trong bẫy thoát.

Chi phí đo được, không đoán: phép tự đối chiếu tốn dưới một giây trên lượt đẩy
33 giây.

**Cây làm việc phụ trỏ về kho gốc.** Trên kho này `core.hooksPath` là một đường
dẫn TUYỆT ĐỐI vào `.githooks` của bản làm việc chính. Một lần đẩy từ cây phụ chạy
tệp lưới của bản chính, không phải tệp lưới của nhánh đang sửa. AC-6 làm điều đó
thành một chỗ lệch nói ra được, thay vì một điều bất ngờ.
