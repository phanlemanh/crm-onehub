---
schema_version: 1
feature: Bài test claimDue chỉ thấy dòng AgentTask của chính nó — hết đỏ khi lượt test api để lại việc nghiên cứu đến hạn
slug: claimdue-chi-thay-dong-cua-minh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-24-claimdue-chi-thay-dong-cua-minh-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-24T01:16:41Z
---

# Acceptance Contract: claimdue-chi-thay-dong-cua-minh

## Context

Lượt CI đầu của PR #98 (run 35879017470, commit `175e61fd`, chỉ đổi tài liệu) đỏ ở
ba bài `claimDue` của `apps/agent/test/tasks.integration.spec.ts`. Chạy lại thì xanh.
Log lần đỏ cho thấy lượt quét ngầm sau đăng nhập của API (`BackfillService.auto`,
gọi từ `go-la-cat-quyen.spec.ts`) đã xếp 22 dòng `identify` đến hạn, ưu tiên 50, vào
cơ sở dữ liệu dùng chung của lượt. Bài test gọi `claimDue(n, { except: DIRECT_KINDS })`
nên nhận mọi dòng nghiên cứu đến hạn trong bảng, và dòng lạ ưu tiên cao hơn thì được
chia trước. Vòng này sửa bài test để nó chỉ thấy dòng của chính nó, bằng cấu trúc.

Source input: prompt

## Criteria

- AC-1: Given trước MỖI bài của `tasks.integration.spec.ts` có dòng lạ được chèn mới — 22 dòng `identify` đến hạn đúng hình CI, dòng loại hiển thị đến hạn, dòng nghiên cứu chưa đến hạn, tất cả ưu tiên cao hơn mọi dòng của bài — When chạy file đó, Then mọi bài xanh, số bài chạy bằng số bài khai trong file và không bài nào bị bỏ qua.
- AC-2: Given cùng dòng lạ của AC-1, When các bài trong ba khối `claimDue` · `retireExhausted` · `completeTask` chạy xong, Then sau mỗi bài, mọi dòng lạ còn đủ và y nguyên trên mọi cột so với ảnh chụp ngay trước bài — không dòng nào bị cho thuê, đổi cột, hay biến mất.
- AC-3: Given một bản sao của file trong thư mục tạm, trong đó mọi lời gọi `claimDue` của ba khối trên lọc lại bằng `RESEARCH` như cũ, When chạy bản sao với cùng dòng lạ của AC-1, Then lượt đỏ và danh sách bài hỏng chứa đủ ba tên của CI: `claims due work and leases it`, `does not hand the same row to two dispatchers`, `leaves work that is not due yet`; và bộ dò dòng lạ báo `HANG-XOM-BI-DUNG` ở ít nhất một trong ba bài đó — bộ dò của AC-2 biết kêu.
- AC-4: Given một cơ sở dữ liệu của lượt đã gieo 22 dòng `identify` hình CI, When chạy `tasks.integration.spec.ts` cùng chín file agent ghi `AgentTask` theo ba thứ tự (tasks đầu, giữa, cuối) lặp năm lần, cộng một lượt chung một tiến trình, Then file tasks 0 hỏng và đủ số bài ở cả 16 lượt; ở 15 lượt có thứ tự, ngay trước file tasks còn ít nhất 22 dòng lạ đến hạn chưa bị thuê. Chín file kia được báo kết quả nhưng không chấm — chúng nằm ngoài phạm vi.
- AC-5: Given bản sao phá của AC-3 thay cho file thật, When chạy bộ lượt của AC-4, Then lượt đầu của cả ba thứ tự đều đỏ ở file bản sao — thước AC-4 cắn được ở mọi thứ tự.
- AC-6: Given `tasks.integration.spec.ts` và `lanes.integration.spec.ts` chạy trên mã thật và trên bản gương trong thư mục tạm có `tasks.ts` đột biến — nhánh `except` bỏ qua bộ lọc — When chạy cả hai bản, Then mã thật xanh cả hai file và bản đột biến đỏ ở bài `claimDue > leaves a visible kind to the visible lane`: một bài kín trong khối `claimDue` đặt một dòng nghiên cứu và một dòng `brand` của chính nó ở ưu tiên tối đa, gọi `claimDue(1, RESEARCH)` và đòi nhận đúng dòng nghiên cứu.
- AC-7: Given cây làm việc sau khi sửa, When chạy kiểm kiểu, lint, lint:slop, build và toàn bộ `bun run test`, Then tất cả xanh.
- AC-8: Given file sau khi sửa, When đọc từng bài trong ba khối đã đổi lọc, Then mỗi bài vẫn đo đúng điều tên nó hứa — đổi nhánh lọc không làm khẳng định rỗng hay tự đúng. (judgment)
- AC-9: Given một bản sao giữ `{ only: [kind] }` nhưng thêm `beforeEach` xoá cả bảng `AgentTask` — phương án đã bị loại — When chạy với dòng lạ của AC-1, Then bộ dò báo `HANG-XOM-MAT` và lượt được tính là đỏ.

## Coverage

Không chạy skill quét hình thái — xem entry `descope` «bỏ coverage-scan» trong
`decisions.jsonl`. Ba trục viết tay từ đường rò đã chứng:

- Trục hình dạng dòng lạ: nghiên cứu đến hạn, ưu tiên cao (AC-1, AC-2, AC-4) | loại hiển thị đến hạn (AC-1, AC-2) | nghiên cứu chưa đến hạn (AC-1, AC-2) | cạn lượt, hết hạn thuê — Ngoài phạm vi [thước CE: danh sách cột mà `claimDue` và `retireExhausted` đọc trong `apps/agent/agent/lib/tasks.ts`]
- Trục thời điểm dòng lạ xuất hiện: trước cả lượt (AC-4) | trước mỗi bài (AC-1, AC-2) | có mặt suốt bài, bị động giữa chừng (AC-2, AC-9) [thước CE chưa kiểm chứng]
- Trục nguồn ghi: tiến trình khác trong cùng lượt, như `api:test` (AC-4 gieo thay) | file agent khác trong cùng tiến trình hoặc tiến trình kế (AC-4) [thước CE: `grep` người ghi `agentTask` trong `apps/agent/test`]
- Trục chiều đo: lành → xanh (AC-1, AC-2, AC-4, AC-6) | phá → đỏ có tên (AC-3, AC-5, AC-6, AC-9)

## Đường đo

Không có `opportunity.md` — vòng không đi từ Cổng Đáng, không có ngưỡng.

## Out of scope

- Không chặn lượt quét ngầm sau đăng nhập trong test api (`go-la-cat-quyen.spec.ts` → `BackfillService.auto`). Đó là đường rò; nó thành một việc riêng.
- Không làm `retireExhausted` chỉ thấy dòng của bài. Hàm không nhận bộ lọc, và hiện không nguồn ghi nào để lại dòng lạ đã cạn lượt.
- Không đổi khối `a limited lock subquery…`: nó tự xoá cả bảng trong bài và đo đúng câu lệnh nhánh `except`.
- Không đổi mã sản phẩm. `apps/agent/agent/lib/tasks.ts` giữ nguyên.
- Không gửi bản vá lên hãng (trycompai/crm#195) trong vòng này.

## Notes

Không có bề mặt web. Không eval thiết kế, không `ui-check`.

**AC-6 đổi sau Cổng 1, giữa S3 (entry `fix` trong sổ, chờ phê ở Cổng 2).**
Bản gốc đòi `lanes.integration.spec.ts` đỏ khi nhánh `except` bỏ qua bộ lọc. Đo
thật thì lanes vẫn xanh trên bản đột biến: nó luôn gọi làn hiển thị trước, nên
dòng `brand` đã bị thuê trước khi làn nghiên cứu nhìn tới. Việc làn nghiên cứu
chừa loại hiển thị ra chưa từng có bài nào canh — cả trước vòng này, vì
`tasks.integration.spec.ts` cũ chỉ tạo dòng `test-lease`. Vòng này thêm một bài
canh điều đó thay vì hạ lời hứa của AC-6 xuống.

Known limits — chấp nhận tại Cổng Bằng chứng 2026-09-24 (Manh Phan), từ mục ngoài hợp đồng của S4:

- Ngoài-1: danh sách chín file ghi `AgentTask` trong `rang/chung-luot.sh` là danh sách viết tay, không suy từ lớp. Thêm một file mới ghi việc nghiên cứu thì phép đo cùng lượt không tự thấy nó, và báo cáo vẫn in như đã quét đủ.
