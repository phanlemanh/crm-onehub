# Review findings: tro-ly-okr-bo-final-output (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The `da-nop` outcome now has two definitions, and the app reads it from a schema nothing emits any more**
  Người dùng thấy gì: Chữ báo «Kara đã nộp xong» đang được ghi ở một nơi và đọc từ một nơi khác. Hôm nay hai chỗ khớp nhau, nhưng nếu một bên đổi chữ thì màn góp ý sẽ không nhận ra các việc đã nộp và báo sai tình trạng cho người dùng.
  file: `apps/agent/agent/lib/okr/config.ts`
  severity: medium
  Đề xuất: new-contract

- **The new 'data block missing' line for tóm tắt can never be shown to the model**
  Người dùng thấy gì: Khi bản tóm tắt tuần thiếu dữ liệu đầu vào, Kara không được dặn cách xử lý riêng nên việc bị ghi là hỏng do máy thay vì «thiếu dữ liệu». Người dùng thấy báo lỗi chung chung, không biết nguyên nhân là thiếu dữ liệu.
  file: `apps/agent/agent/lib/okr/chi-dan-tom-tat.ts`
  severity: low
  Đề xuất: known-limits

- **A missing data block now ends as da-nop with no suggestions, so a failed run looks like 'nothing to fix'**
  Người dùng thấy gì: Nếu Kara bắt đầu chạy khi chưa có dữ liệu của Mục tiêu, nó vẫn nộp một danh sách trống và màn hình báo «không có vấn đề gì cần sửa». Người dùng tưởng Mục tiêu đã được xem xét kỹ trong khi Kara chưa hề thấy nó.
  file: `apps/agent/agent/subagents/tro_ly_okr/instructions.md`
  severity: medium
  Đề xuất: new-contract

- **Shape 5 (matrix claims a class, but the cell is a point-case of another class): the 'already submitted' cell actually lands in the 'task already closed' branch**
  Người dùng thấy gì: Hành vi cho người dùng vẫn đúng: nộp lần hai không làm đổi kết quả đã có. Chỉ là bài kiểm tra chưa chứng minh riêng được trường hợp «việc còn mở mà đã nộp rồi», nên nếu sau này nhánh đó hỏng thì có thể không ai thấy ngay.
  file: `apps/agent/test/tro-ly-okr-dong-viec.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture matching the reader): the giu-viec test writes da-nop itself and then asserts da-nop**
  Người dùng thấy gì: Một bài kiểm tra phụ luôn xanh dù tính năng có hỏng hay không, nên nó cho cảm giác an toàn giả. Sản phẩm không bị ảnh hưởng vì phần này đã có bài kiểm tra khác đo thật.
  file: `apps/agent/test/tro-ly-okr-giu-viec.integration.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Shape 2 (hand-written fixture matching the reader): the outputSchema counter's self-check runs only on an injected span, and the real pre-fix trace never has that shape**
  Người dùng thấy gì: Một bước tự kiểm của công cụ đo chỉ chứng minh nó đọc được mẫu giả do người viết tay, chưa chứng minh nó bắt được lỗi thật. Người dùng không bị ảnh hưởng; rủi ro chỉ là công cụ đo có thể bỏ sót một kiểu lỗi cũ nếu nó quay lại.
  file: `_acceptance/tro-ly-okr-bo-final-output/rang/mau-0710/traces/ffffffffffffffffffffffffffffffff/segments/them-output-schema.otlp.json`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/6 lỗi rơi vào file không bộ đo nào phủ (apps/agent/agent/lib/okr/config.ts, apps/agent/test/tro-ly-okr-giu-viec.integration.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
