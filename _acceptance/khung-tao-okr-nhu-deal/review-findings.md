# Review findings: khung-tao-okr-nhu-deal (round 4)

## Trong hợp đồng

- **PR description has no build-tier line for SheetRailHeader and SheetRailTitle**
  file: `_acceptance/khung-tao-okr-nhu-deal/mo-ta-pr.md:16`
  severity: medium
  AC: AC-13
  source: conventions
  detail: docs/design.md, section «Vẽ tay là bậc cuối», requires one line in the PR description for every new UI block: which tier it stopped at, plus what was searched in the tiers above (item names, ReUI queries). The diff adds two new components to packages/ui/src/components/sheet.tsx, SheetRailHeader and SheetRailTitle (commit c66f68c4), and uses them in okr/cot-gop-y.tsx in place of the old Item size="xs" header. The table in mo-ta-pr.md covers only three blocks: the footer, size="assist" and SheetBody. It has no line for SheetRailHeader or SheetRailTitle, and no search record for tiers 1-4 (for example whether Item or CardHeader/CardTitle could have been reused). The S5 step opens the PR with --body-file from this file, so the gap will reach the real PR.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The new URL parser for OKR sheets lives inside a client component instead of a *-search-params module**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào: các ngăn OKR mở, đóng và tải lại đúng như đã hứa. Chỉ là chỗ đặt mã đọc địa chỉ trang lệch thói quen của kho, nên người sửa sau này khó tìm hơn.
  file: `apps/app/app/(app)/[slug]/okr/ngan-okr-url.tsx`
  severity: medium
  Đề xuất: known-limits

- **record-stack registers hopOkr with parseAsString while useHopOkr uses parseAsHopOkr, two parsers on one key**
  Người dùng thấy gì: Hôm nay việc mở và đóng ngăn OKR không bị ảnh hưởng. Nếu sau này có người cho khung bản ghi ghi thêm vào địa chỉ trang này, hai chỗ đọc có thể hiểu khác nhau và làm ngăn mở sai.
  file: `apps/app/components/crm/record-sheet/record-stack.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — đòi QUAN HỆ (hai tập class bằng nhau) nhưng chỉ kiểm từng class của DialogFooter có mặt bên SheetFooter**
  Người dùng thấy gì: Hôm nay chân các ngăn vẫn xếp đúng: nút Huỷ bên trái, nút chính bên phải. Nhưng phép kiểm chưa bắt được trường hợp về sau có người thêm kiểu xếp khác vào chân ngăn mà vẫn báo xanh.
  file: `_acceptance/khung-tao-okr-nhu-deal/rang/chan-ngan.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — khẳng định âm một mình: «đóng khung xoá hopOkr» vẫn xanh khi không có lần ghi URL nào**
  Người dùng thấy gì: Hôm nay đóng khung Mục tiêu thì ngăn OKR rời địa chỉ trang như đã hứa. Nhưng bài kiểm có thể báo xanh dù việc xoá đó không xảy ra, nên nếu sau này hỏng thì có thể không ai hay.
  file: `apps/app/test/khung-tao-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
