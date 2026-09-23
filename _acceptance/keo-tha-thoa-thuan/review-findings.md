
# Review Findings: keo-tha-thoa-thuan (round 1)

## Trong hợp đồng

### 1. Board column totals zero out deals that have no exchange rate instead of disclosing them (breaks docs/currency.md)
- file: `apps/app/app/(app)/[slug]/deals/deals-board.tsx:327`
- severity: medium
- AC: AC-3
- nguồn: conventions

docs/currency.md says a missing rate is 'a null, disclosed not zeroed', and that `unconverted` exists 'so the UI can say *3 deals in CHF are not included*'. The deals list and the dashboard both follow this: `DealsService.list` returns `unconverted` from `conversion.unconverted(...)`, and deals-table.tsx shows `m.meta.notCounted(count, currencies)` next to the total. The new `DealsService.board` (apps/api/src/deals/deals.service.ts, around line 217) sums only through `countedWhere(base)` and returns no per-column `unconverted`. Nothing in `dealBoardOutput` can carry it either. The client then does `column.valueCents === null ? formatMoney(0, currency, locale) : ...`. Example: a column whose deals are all in CHF with no rate shows '0 ₫' under a count of 3, and a mixed column shows a smaller total with no note that some deals were left out. Fix: add `unconverted` (count and currencies) to each column in `dealBoardOutput`, fill it with `conversion.unconverted(stageWhere)`, and show it in the column summary the way the list does.

_Vì sao thuộc AC-3:_ AC-2 tự nêu kịch bản hai loại tiền và đòi tổng = Σ baseAmount của đúng tập thoả thuận đã đếm; ở đây tổng loại trừ thoả thuận chưa có tỷ giá còn số đếm thì không, nên hai con số không cùng một tập.

---

### 2. Column totals on the board leave out unconverted deals without saying so, and show 0 when the whole sum is missing
- file: `apps/app/app/(app)/[slug]/deals/deals-board.tsx:86`
- severity: medium
- AC: AC-3
- nguồn: bugs

`deals.board` (apps/api/src/deals/deals.service.ts:219-222) adds up `baseAmount` under `countedWhere(base)`. Deals whose currency has no rate yet, or that were converted against a different base, fall out of that sum. Unlike `deals.list` (which returns `unconverted` and has the table show 'N deals in X are not included'), the board returns no `unconverted` count. The client then turns a null sum into zero: `column.valueCents === null ? formatMoney(0, currency, locale)`. Example: a Qualified column holding 3 deals in CHF with no CHF rate shows '3 · 0 ₫'. A column with some converted deals shows a partial total that looks complete. docs/currency.md requires that a missing rate be 'disclosed not zeroed'. The table view discloses it (deals-table.tsx:346); the board view drops the disclosure and zeroes the null.

_Vì sao thuộc AC-3:_ Cùng lỗi với finding trên (tổng và số đếm không cùng tập thoả thuận), có ví dụ cụ thể '3 · 0 ₫' cho thấy trực tiếp AC-2 thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **The board's 'has data' state id duplicates an onboarding screen's and differs from the proto catalog's id**
    Người dùng thấy gì: Công cụ đo tự động dùng để phân biệt màn có thể nhầm bảng cột với một màn khác, nhưng người dùng bấm và nhìn màn bình thường không thấy khác biệt gì.
    file: `apps/app/app/(app)/[slug]/deals/deals-board.tsx`
    severity: low
    Đề xuất: known-limits

- **While a move is saving, the source column wrongly shows 'N more' and both headers show stale numbers**
    Người dùng thấy gì: Trong khoảnh khắc đang lưu sau khi kéo thẻ, số thẻ và dòng 'còn N thẻ' ở đầu cột có thể tạm sai trước khi tự cập nhật đúng, dễ khiến người dùng nghi ngờ dữ liệu bị mất dù thực ra không mất.
    file: `apps/app/app/(app)/[slug]/deals/use-deal-board-move.ts`
    severity: low
    Đề xuất: known-limits

- **Shape 1 (checks the instructions, not the output): the screen-reader announcements are measured only in the message dictionary**
    Người dùng thấy gì: Chưa có gì bảo đảm trình đọc màn hình thực sự đọc đúng lời thông báo bằng ngôn ngữ của màn khi người dùng khiếm thị nhấc, dời hay thả một thoả thuận, dù các câu dịch tự nó đã đúng.
    file: `apps/app/test/keo-tha-thoa-thuan.dom.tsx`
    severity: high
    Đề xuất: known-limits

- **Shape 3 (checks a string is present when the promise relates two values): the count/total check can pass on the other number**
    Người dùng thấy gì: Số đếm và tổng tiền hiển thị ở đầu mỗi cột có thể hiển thị sai mà không ai phát hiện trước khi phát hành, vì phép kiểm hiện tại có thể xác nhận nhầm là đúng.
    file: `apps/app/test/keo-tha-thoa-thuan.dom.tsx`
    severity: high
    Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped for the reader): amount always equals baseAmount, so the 'sum baseAmount, not amount' rule is never tested**
    Người dùng thấy gì: Trường hợp một cột gồm thoả thuận nhiều loại tiền tệ đã quy đổi có thể tính tổng sai mà không bị phát hiện trước khi phát hành, vì phép kiểm chưa từng thử tình huống có quy đổi tiền tệ thật.
    file: `apps/api/test/deals-board.spec.ts`
    severity: high
    Đề xuất: known-limits

- **Shape 5 (claims to sweep a class but has only point cases): E9 promises 3 cases, the test has 2, and the Esc/cancel case is missing**
    Người dùng thấy gì: Thao tác nhấn Esc để huỷ giữa chừng khi đang kéo thẻ chưa được kiểm chứng, nên nếu thao tác huỷ này thực sự bị lỗi (ví dụ vẫn gửi lệnh đổi giai đoạn), sẽ không ai biết trước khi phát hành.
    file: `apps/app/test/keo-tha-thoa-thuan.dom.tsx`
    severity: medium
    Đề xuất: known-limits

- **Shape 2 (hand-written fake server): the fake setStage moves only the count, never the total, so 'the total changes after saving' (AC-5) cannot be observed**
    Người dùng thấy gì: Lời hứa rằng tổng tiền ở đầu hai cột tự cập nhật đúng sau khi lưu xong việc kéo thả chưa được kiểm chứng thực sự, nên nếu tổng tiền không cập nhật đúng, sẽ không bị phát hiện trước khi phát hành.
    file: `apps/app/test/keo-tha-thoa-thuan.dom.tsx`
    severity: medium
    Đề xuất: known-limits

- **Shape 5 (fake P105 matrix): the counters increment unconditionally, so the 'number of assertions = number of elements' checks can never fail**
    Người dùng thấy gì: Nhiều phép kiểm tự động cho tính năng kéo thả này có thể luôn báo 'đạt' bất kể có thực sự chạy đúng hay không, nên một lỗi thật ở nhiều chỗ khác nhau của tính năng có thể lọt qua mà không ai hay trước khi phát hành.
    file: `apps/api/test/deals-board.spec.ts`
    severity: medium
    Đề xuất: known-limits

- **Shape 4 (negative assertion alone): the 'board input has no stage/status/page' check passes when no input was captured at all**
    Người dùng thấy gì: Phép kiểm rằng bộ lọc giai đoạn/trạng thái không bị gửi nhầm lên máy chủ có thể báo đạt ngay cả khi màn không hề lấy dữ liệu bảng cột, nên một lỗi thật ở đây có thể không bị phát hiện trước khi phát hành.
    file: `apps/app/test/keo-tha-thoa-thuan.dom.tsx`
    severity: medium
    Đề xuất: known-limits

- **Shape 4 (negative assertion alone): the after-save 'unlocked' check and the 'clicking the menu does not open the sheet' check can pass vacuously**
    Người dùng thấy gì: Phép kiểm rằng thẻ có thể kéo lại được sau khi lưu xong, và phép kiểm rằng bấm vào nút mở menu giai đoạn không mở nhầm tấm thoả thuận, đều có thể báo đạt mà không thực sự kiểm tra được điều đó.
    file: `apps/app/test/keo-tha-thoa-thuan.dom.tsx`
    severity: low
    Đề xuất: known-limits

- **Shape 6 (measures another tree instead of this one): E16 reads the server record from API_URL with a localhost:3001 default and no tree guard**
    Người dùng thấy gì: Phần đo xác nhận máy chủ đã ghi đúng giai đoạn mới có thể vô tình đọc từ một bản chạy khác, không phải bản đang xét, nên kết quả kiểm chứng đó có thể không phản ánh đúng đúng bản thực tế đang được duyệt.
    file: `_acceptance/keo-tha-thoa-thuan/rang/man-bang-cot.mjs`
    severity: low
    Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có mục nào ở vòng này.)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
