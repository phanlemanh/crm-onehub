# Review findings — khung-tao-okr-nhu-deal (round 5)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E17 says its failure path is pinned, but nothing in the repo exercises it**
  Người dùng thấy gì: Bản ghi nói rằng phép kiểm cho lỗi màn Deals đã được thử cả khi có lỗi lạ, nhưng thực tế chưa ai chạy thử trường hợp đó. Nếu phép kiểm này hỏng thì sẽ không ai biết, và bằng chứng vẫn trông như đã kiểm.
  file: `_acceptance/khung-tao-okr-nhu-deal/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **The known-limit wrapper for E17 passes a run where a step crashed after printing «dat»**
  Người dùng thấy gì: Nếu một bước trong kịch bản kiểm hộp giữ chỗ bị đứng giữa chừng sau khi đã báo đạt, phép kiểm vẫn báo đạt. Một lỗi thật ở màn đăng nhập có thể lọt qua mà không ai thấy.
  file: `_acceptance/khung-tao-okr-nhu-deal/rang/giu-cho-han-che.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — lời hứa về quan hệ (lỗi này chính là lỗi có sẵn trên onehub) nhưng chỉ khớp tiền tố chuỗi**
  Người dùng thấy gì: Phép kiểm nhận lỗi màn Deals chỉ qua câu mở đầu chung của lỗi, nên một lỗi hiển thị mới do lượt này gây ra trên màn Deals cũng bị coi là lỗi cũ có sẵn và được bỏ qua.
  file: `_acceptance/khung-tao-okr-nhu-deal/rang/giu-cho-han-che.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — chiều đỏ ghi trong expected nhưng không có tệp đầu ra mẫu, cũng không lệnh nào chạy**
  Người dùng thấy gì: Cách phép kiểm bỏ qua lỗi cũ của màn Deals chưa hề được thử với một lỗi lạ, và bản ghi kết quả đang xem là bản cũ chưa có lần chạy nào có lỗi này. Nên lời hứa phép kiểm sẽ bắt lỗi lạ chưa có gì chứng minh.
  file: `_acceptance/khung-tao-okr-nhu-deal/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **The new URL parser for OKR sheets lives inside a client component instead of a *-search-params module (r4)**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào: các ngăn OKR mở, đóng và tải lại đúng như đã hứa. Chỉ là chỗ đặt mã đọc địa chỉ trang lệch thói quen của kho, nên người sửa sau này khó tìm hơn.
  file: `apps/app/app/(app)/[slug]/okr/ngan-okr-url.tsx`
  severity: medium
  Đề xuất: known-limits

- **record-stack registers hopOkr with parseAsString while useHopOkr uses parseAsHopOkr, two parsers on one key (r4)**
  Người dùng thấy gì: Hôm nay việc mở và đóng ngăn OKR không bị ảnh hưởng. Nếu sau này có người cho khung bản ghi ghi thêm vào địa chỉ trang này, hai chỗ đọc có thể hiểu khác nhau và làm ngăn mở sai.
  file: `apps/app/components/crm/record-sheet/record-stack.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — đòi QUAN HỆ (hai tập class bằng nhau) nhưng chỉ kiểm từng class của DialogFooter có mặt bên SheetFooter (r4)**
  Người dùng thấy gì: Hôm nay chân các ngăn vẫn xếp đúng: nút Huỷ bên trái, nút chính bên phải. Nhưng phép kiểm chưa bắt được trường hợp về sau có người thêm kiểu xếp khác vào chân ngăn mà vẫn báo xanh.
  file: `_acceptance/khung-tao-okr-nhu-deal/rang/chan-ngan.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — khẳng định âm một mình: «đóng khung xoá hopOkr» vẫn xanh khi không có lần ghi URL nào (r4)**
  Người dùng thấy gì: Hôm nay đóng khung Mục tiêu thì ngăn OKR rời địa chỉ trang như đã hứa. Nhưng bài kiểm có thể báo xanh dù việc xoá đó không xảy ra, nên nếu sau này hỏng thì có thể không ai hay.
  file: `apps/app/test/khung-tao-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

⚠ Cụm ngoài vùng phủ: 2/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/khung-tao-okr-nhu-deal/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
