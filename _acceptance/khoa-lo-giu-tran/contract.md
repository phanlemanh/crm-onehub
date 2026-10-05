---
schema_version: 1
feature: Khoá lô hàng agentTask trong CTE MATERIALIZED để LIMIT giữ đúng trần dưới thống kê cũ
slug: khoa-lo-giu-tran
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api]
status: signed-off
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-06T08:08:42Z
design_doc: docs/superpowers/specs/2026-09-06-khoa-lo-giu-tran-design.md
---

# Acceptance Contract: khoa-lo-giu-tran

## Context

`claimDue` và `retireExhausted` trong `apps/agent/agent/lib/tasks.ts` khoá một
lô hàng bằng `LIMIT n FOR UPDATE SKIP LOCKED` trong truy vấn con rồi cập nhật lô
đó. Khi thống kê của bộ lập kế hoạch nói bảng chỉ có 0 hoặc 1 hàng, Postgres chạy
lại truy vấn con mỗi hàng ngoài, `LockRows` bỏ qua hàng vừa cập nhật, và
`UPDATE` đi hết bảng. Lượt CI 33950074116 đỏ với `LIMIT 2` mà trả 3 hàng. Sửa
bằng `WITH … AS MATERIALIZED`, cam kết có tài liệu của Postgres rằng CTE được tính
đúng một lần. Thiết kế đầy đủ: `docs/superpowers/specs/2026-09-06-khoa-lo-giu-tran-design.md`.

Source input: prompt

## Criteria

- AC-1: Given bảng `agentTask` được `ANALYZE` lúc chỉ có 1 hàng rồi thêm 2 hàng, cả 3 đều cạn lượt và `dueAt` tăng theo thứ tự chèn, When gọi `retireExhausted(2)`, Then hàm trả đúng 2 hàng và còn đúng 1 hàng cạn lượt chưa nghỉ hưu.
- AC-2: Given cùng bộ dựng nhưng 3 hàng đến hạn với 0 lượt thử, When gọi `claimDue(2, { except: DIRECT_KINDS })`, Then hàm trả đúng 2 hàng và còn đúng 1 hàng chưa được thuê.
- AC-3: Given cùng bộ dựng, và `pg_class.reltuples` của `agentTask` đọc ngay trước khi thăm dò không vượt 1 (vượt thì ném lỗi ghim `statistics drifted`), When chạy truy vấn thăm dò khuôn `UPDATE … FROM (SELECT … LIMIT 2 FOR UPDATE SKIP LOCKED)`, Then nó cập nhật đủ 3 hàng — bộ dựng chứng minh nó cắn; Postgres đổi cách lập kế hoạch thì phép đo này đỏ với thông điệp độ dài, không xanh lặng.
- AC-4: Given bản `tasks.ts` trước sửa (git sha 746d3ef8) nạp vào tệp tạm trong `apps/agent/rang/.tmp/`, không ghi vào cây làm việc, When chạy chính bốn bài "planner re-runs it per row" trên module đó, Then đúng hai bài trần đỏ với thông điệp ghim `Expected length: 2` và `Received length: 3`, hai bài "the fixture bites" xanh, và `git status --porcelain apps/agent/agent/lib/tasks.ts` rỗng sau khi chạy; sha không có trong clone thì chân thoát mã 2.
- AC-5: Given bộ dựng thống kê cũ, When `EXPLAIN (ANALYZE)` đúng câu SQL mà `retireExhausted` gửi, bắt từ sự kiện query của Prisma, Then nút `LockRows` chạy `loops=1` và kế hoạch có `CTE Scan`; cùng bộ dựng với bản trước sửa, `LockRows` chạy `loops=3`.
- AC-6: Given 40 hàng cạn lượt và thống kê mới, When 8 lượt `retireExhausted(2)` chạy đồng thời, Then mỗi lượt trả tối đa 2 hàng, tổng đúng 16, không id nào xuất hiện hai lần; cùng bộ dựng với bản sao `tasks.ts` bỏ `FOR UPDATE SKIP LOCKED` khỏi CTE, số id khác nhau nhỏ hơn 16 với thông điệp ghim về id trùng.
- AC-7: Given tệp `apps/agent/test/tasks.integration.spec.ts`, When chạy trọn tệp, Then 20 pass và 0 fail — thứ tự ưu tiên, thuê, đếm lượt của `claimDue` không đổi; và `_acceptance/khoa-lo-giu-tran/evidence/spec-diff.patch` bằng đúng `git diff 746d3ef8 -- apps/agent/test/tasks.integration.spec.ts` tại HEAD.
- AC-8: Given toàn cây tại HEAD, When chạy suite (`bun run db:test && bun run test`), kiểm kiểu, lint và lint:slop không dùng bộ nhớ đệm, Then cả bốn thoát 0.
- AC-9: Given `docs/agent.md`, When đọc mục Two lanes, Then có một đoạn nêu tên cả `claimDue` lẫn `retireExhausted` và từ `MATERIALIZED`, đứng ngay sau luật "claimDue sorts what it claims".
- AC-10: Given mã sửa, bài kiểm, thiết kế và diff của tệp kiểm so với bản trước sửa, When người đọc soi, Then sửa dựa trên cam kết có tài liệu của Postgres chứ không phải may rủi của bộ lập kế hoạch, phép đo đo đúng cơ chế (số hàng dưới thống kê thù địch, số lượt `LockRows`) chứ không đo triệu chứng, và không bài kiểm cũ nào bị nới để xanh. (judgment)

## Coverage

Bỏ coverage-scan — không gian là 2 hàm × 2 trạng thái thống kê × 2 cách gọi, kê tay đủ (entry descope trong decisions.jsonl). Ba trục kê tay:

- Trục hàm: `retireExhausted` (AC-1, AC-4, AC-5, AC-6) | `claimDue` (AC-2, AC-4, AC-7) [thước CE: hai hàm duy nhất trong `tasks.ts` có `FOR UPDATE SKIP LOCKED`, đếm bằng grep]
- Trục thống kê: cũ, ≤1 hàng (AC-1, AC-2, AC-3, AC-4, AC-5) | mới, đúng cỡ bảng (AC-6, AC-7) [thước CE: `pg_class.reltuples` sau `ANALYZE` trong bộ dựng]
- Trục chiều đo: dương, trần đúng (AC-1, AC-2, AC-6, AC-7, AC-8) | âm, bản hỏng đỏ có thông điệp ghim (AC-3, AC-4, AC-5, AC-6) [thước CE: số tiêu chí có chiều đỏ ghim thông điệp = 4, đếm trong bảng eval]

## Out of scope

- Không đổi `deleteMany({})` trong bộ dựng thành xoá theo kind: thống kê phải thấy đúng 1 hàng. Chỉ chạy trên cơ sở dữ liệu `_test`.
- Không sửa cách suite chung chạy nhiều tệp trên cùng một cơ sở dữ liệu; răng nghiệm thu của hồ sơ này chạy trên cơ sở dữ liệu riêng từng chân.
- Không dùng khuôn `ARRAY(…)` InitPlan dù cũng giữ trần: InitPlan là chi tiết thực thi, `MATERIALIZED` là cam kết có tài liệu.
- Không gửi vá lên hãng trong vòng này; mã `apps/agent` giống hệt hãng nên đây là ứng viên gửi lên sau.
- Không chạm lớp điều phối gọi hai hàm này (`schedules/dispatch.ts`).

## Notes

Hợp đồng này viết SAU khi mã đã sửa và đã đo, cùng phản mẫu mà hồ sơ
`sua-test-do-thu-tu-nap` đã nêu: tiêu chí có thể uốn theo thứ đã dựng. Giảm nhẹ
bằng ba tiêu chí chiều âm (AC-3, AC-4, AC-5) đo sự đỏ của bản hỏng trên cùng bộ
dựng, thứ mà mã đã dựng không tự làm xanh được.

Đột biến từ khoá `AS NOT MATERIALIZED` KHÔNG lật kết luận (đo 06/09: 4 pass).
Chiều đỏ vì thế dùng bản `tasks.ts` trước sửa lấy từ git tại sha 746d3ef8, sha
nằm trên `origin/onehub` nên không mất.

Không có bề mặt web. Không sinh eval thiết kế.

Răng nghiệm thu nằm ở `apps/agent/rang/khoa-lo-giu-tran.rang.ts` (ngoài khuôn tệp
kiểm của bun, chạy bằng đường dẫn tường minh) và `_acceptance/khoa-lo-giu-tran/rang.sh`.
Bản trước sửa và đột biến chỉ sống trong `apps/agent/rang/.tmp/` (gitignore, tên có
PID). Mỗi chân dùng cơ sở dữ liệu riêng `crm_khoa_lo_<chân>_test`.

### Known limits

- **Tệp răng sống trong cây app** (`apps/agent/rang/khoa-lo-giu-tran.rang.ts`), không trong hồ sơ như 14 tiền lệ, vì `@crm/db` chỉ nối trong `apps/agent`. `tsconfig`, `knip`, `oxlint` của app không khai thư mục này. Tái lập: `grep -n include apps/agent/tsconfig.json`.
- **Bộ dựng và răng xoá toàn bảng `agentTask`** để thống kê thấy đúng một hàng. Suite chạy tuần tự nên chưa đỏ; chạy răng tay ngoài `rang.sh` thì xoá hàng của gói khác trên cơ sở dữ liệu thử chung. Tái lập: `grep -n "deleteMany({})" apps/agent/test/tasks.integration.spec.ts apps/agent/rang/khoa-lo-giu-tran.rang.ts`.
- **Hai bài "the fixture bites" chốt lựa chọn của bộ lập kế hoạch Postgres 17.** Đổi bản Postgres có thể đỏ với `Expected length: 3` dù bản sửa vẫn đúng. Khi đỏ: `bash _acceptance/khoa-lo-giu-tran/rang.sh --chan giai-thich` xem `EXPLAIN` trước khi sửa mã.
- **Hai bài "bites" đo cùng một điểm**: truy vấn thăm dò không đọc cột `attempts`, nên lớp {cạn lượt, đến hạn} chỉ có một điểm đo thật. Tái lập: `grep -n "function probe" -A14 apps/agent/test/tasks.integration.spec.ts`.
- **Hai ô thống-kê-cũ × đồng-thời không có phép đo.** Câu "kê tay đủ" ở Coverage đúng theo lề, không đúng theo ô.
- **Trong hợp đồng, máy khai chứ không sửa vì đã hết ba vòng chấm:** chân `can` (AC-3) chưa có chiều đỏ tự chạy; chiều đỏ `statistics drifted` chứng bằng tay ngày 06/09. Tái lập: chép `tasks.integration.spec.ts` sang `apps/agent/rang/.tmp/drift.rang.ts`, chèn `ANALYZE "agentTask"` sau vòng chèn của `staleStatistics`, chạy `bun test ./rang/.tmp/drift.rang.ts -t "the fixture bites"` → `statistics drifted: reltuples=3`.
- **Từ vòng chấm 1, máy khai:** biến `KHOA_LO_RANG` chưa có mục ở `.env.example`; tám key `khoa_lo_*` trong `_acceptance/config.yaml` không đặt ngoặc kép như các key khác; `prepare_db` trong `rang.sh` rơi về cơ sở dữ liệu chung nếu tên cơ sở dữ liệu có ký tự ngoài `[A-Za-z0-9_]`. Tái lập: `TEST_DATABASE_URL=postgresql://u:p@localhost:5432/crm-test bash _acceptance/khoa-lo-giu-tran/rang.sh --chan can` sẽ không tách tên.
