# Khoá lô giữ trần — thiết kế

## Lỗi

`claimDue` và `retireExhausted` (`apps/agent/agent/lib/tasks.ts`) khoá một lô
hàng `agentTask` bằng `LIMIT n FOR UPDATE SKIP LOCKED` rồi cập nhật lô đó.
Hai hàm dùng hai khuôn: `retireExhausted` đặt truy vấn con trong `IN (…)`,
`claimDue` đặt trong `FROM (…) AS due`. Cả hai đều vượt trần: lượt CI
33950074116 đỏ với `LIMIT 2` mà trả 3 hàng, chạy lại thì xanh.

## Nguyên nhân, đã tái lập tất định

Khi thống kê của bộ lập kế hoạch nói bảng chỉ có 0 hoặc 1 hàng (autoanalyze
tình cờ chạy giữa hai bài kiểm, lúc bảng đang 1 hàng), Postgres 17 đặt bảng
đích ở phía ngoài của Nested Loop và không bọc `Materialize` quanh truy vấn
con. `EXPLAIN ANALYZE` cho thấy `Subquery Scan … loops=3` và `LockRows …
loops=3`: truy vấn con chạy lại mỗi hàng ngoài. `LockRows` bỏ qua hàng mà
chính lệnh này vừa cập nhật (`TM_SelfModified`), nên mỗi lượt chạy lại trả
một lô mới, và `UPDATE` đi hết bảng: 3 hàng với 3, 6 hàng với 6.

Bộ dựng tái lập: xoá sạch `agentTask`, chèn 1 hàng, `ANALYZE`, chèn thêm 2
hàng với `dueAt` tăng theo thứ tự chèn (để thứ tự quét ngoài trùng thứ tự
`ORDER BY`). Trên bộ dựng này cả khuôn `IN` lẫn khuôn `FROM` trả 3 hàng; chỉ
`ARRAY(…)` (InitPlan) và `WITH … AS MATERIALIZED` giữ trần.

Đồng thời không phải nguyên nhân: 8 lượt gọi song song khuôn cũ với thống kê
mới, mỗi lượt đúng 2 hàng.

## Sửa

Cả hai hàm đưa truy vấn con khoá lô vào `WITH <tên> AS MATERIALIZED (…)` rồi
`UPDATE … FROM <tên> WHERE t.id = <tên>.id`. `MATERIALIZED` là cam kết có tài
liệu của Postgres rằng CTE được tính đúng một lần; `ARRAY(…)` chỉ là chi tiết
thực thi (InitPlan). Sửa cả `claimDue` dù đề bài chỉ nêu `retireExhausted`,
vì cùng bộ dựng chứng minh `claimDue(2)` cũng trả 3.

Không đổi giao diện hàm, không đổi thứ tự trả về (`claimDue` vẫn tự sắp trong
JS), không đổi schema.

## Phép đo

Trong `apps/agent/test/tasks.integration.spec.ts`, bốn bài trên CÙNG bộ dựng:

- hai bài "the fixture bites": truy vấn thăm dò khuôn `FROM` phải trả đủ 3
  hàng dù `LIMIT 2`. Postgres đời sau lập kế hoạch khác thì bài này đỏ to
  tiếng, không để chiều đỏ lặng lẽ biến mất;
- hai bài trần: `retireExhausted(2)` và `claimDue(2)` trả đúng 2.

Bộ dựng tự canh mình: sau `ANALYZE` và hai lượt chèn, nó đọc
`pg_class.reltuples` của `agentTask` và ném lỗi ghim `statistics drifted` nếu
giá trị vượt 1. Nhờ đó bài "bites" đỏ vì thống kê trôi (autoanalyze chen vào)
mang thông điệp khác với đỏ vì Postgres đổi kế hoạch.

Chiều đỏ của bộ đo: nạp bản `tasks.ts` trước sửa từ git (sha `746d3ef8`) vào
một tệp tạm, chạy chính bốn bài "planner re-runs" trên module đó: hai bài
trần đỏ với thông điệp ghim `Expected length: 2 / Received length: 3`, hai
bài "bites" vẫn xanh. Đột biến từ khoá `AS NOT MATERIALIZED` KHÔNG lật kết
luận (đo 06/09, 4 pass), nên không dùng nó làm chiều đỏ.

Đồng thời có chiều đỏ riêng: bản sao `tasks.ts` bỏ `FOR UPDATE SKIP LOCKED`
khỏi CTE, 8 lượt `retireExhausted(2)` song song trên 40 hàng trả 16 id mà chỉ
6, 2, 4 id khác nhau ở ba lượt đo (06/09); bản sửa trả 16 id khác nhau cả ba
lượt.

Cơ chế đo trực tiếp: `EXPLAIN (ANALYZE)` đúng câu SQL mà hàm gửi (bắt từ sự
kiện query của Prisma, không chép tay) trên bộ dựng thống kê cũ: `LockRows`
chạy `loops=1` với bản sửa, `loops=3` với bản trước sửa.

## Răng nghiệm thu

Tệp răng: `apps/agent/rang/khoa-lo-giu-tran.rang.ts`. Nó phải nằm trong
`apps/agent` vì `@crm/db` chỉ được nối vào `apps/agent/node_modules`, và tên
`.rang.ts` nằm ngoài khuôn `*.spec.ts` của bun nên `bun run test` không nạp
nó (đo 06/09: chạy bằng `bun test ./rang/<tệp>` thì được, gọi trần thì bun
báo không phải tệp kiểm). Bộ chân: `_acceptance/khoa-lo-giu-tran/rang.sh
--chan <tên>`.

Bản trước sửa và các đột biến chỉ sống trong `apps/agent/rang/.tmp/` (bị
gitignore, tên có PID), sinh lúc chạy bằng `git show 746d3ef8:…` rồi xoá.
Không chân nào ghi vào `apps/agent/agent/lib/tasks.ts`; mỗi chân kết bằng
`git status --porcelain` trên tệp đó phải rỗng. Sha không có trong clone thì
chân thoát mã 2, không phải 0.

Mỗi chân chạy trên cơ sở dữ liệu riêng (`crm_khoa_lo_<chân>_test`, dựng bằng
`bun run db:test`) vì bộ dựng xoá sạch `agentTask`; suite chung không bị đụng
khi S4 chạy song song.

Bằng chứng cho câu "không bài kiểm cũ nào bị nới": S3 ghi
`_acceptance/khoa-lo-giu-tran/evidence/spec-diff.patch` = `git diff 746d3ef8
-- apps/agent/test/tasks.integration.spec.ts`; chân `toan-tep` so tệp đó với
diff sống, lệch là đỏ.

## Tài liệu

`docs/agent.md`, mục Two lanes, thêm luật cạnh "claimDue sorts what it
claims": truy vấn con khoá lô là CTE `MATERIALIZED`, không bao giờ là
`FROM` subquery hay `IN (…)`, kèm cơ chế và con số.
