# Review findings: bo-xuong-kara (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Shared Kara blocks hard-code the OKR-only glossary term «bản nháp», with no way to override it (r1)**
  Người dùng thấy gì: Dòng mốc «Kara sửa bản nháp» và mô tả hội thoại rỗng luôn dùng chữ «bản nháp» của OKR. Khi sau này Chat hoặc Deal dùng chung khối này, người dùng sẽ thấy chữ «bản nháp» ở nơi không phải bản nháp OKR.
  file: `packages/ui/src/components/kara/transcript.tsx`
  severity: medium
  Đề xuất: known-limits

- **Tunable delay KARA_TRE_MS sits at the top of the file that first needs it, not in the Kara config module (r1)**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng: Kara vẫn chờ đúng 1 giây trước khi hiện trạng thái đang làm. Chỉ khiến người chỉnh thời gian chờ sau này khó tìm chỗ sửa hơn.
  file: `packages/ui/src/components/kara/state.tsx`
  severity: low
  Đề xuất: wont-fix

- **phong-mau.mjs deletes and rebuilds one fixed folder on every run, so parallel E11 runs break each other (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng sản phẩm. Khi hai lượt đo chạy cùng lúc, kết quả đo màn hình có thể sai hoặc báo lỗi giả, nên phải chạy tuần tự.
  file: `_acceptance/bo-xuong-kara/rang/phong-mau.mjs`
  severity: medium
  Đề xuất: known-limits

- **The orphan exemption will break at K2: mo-coi cannot see imports that go through components/kara/ (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng hiện tại. Khi bước K2 nối màn thật rồi gỡ miễn trừ, cổng kiểm tệp mồ côi sẽ báo đỏ giả và phải sửa trước khi gộp.
  file: `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): ở k1-artifact và «KaraBusy lồng nhau», kiểm «mọi nút đã khoá» bằng every() trên một tập có thể rỗng (r1)**
  Người dùng thấy gì: Nếu sau này khung bản nháp mất hết đề xuất bên trong, bài kiểm vẫn xanh. Người dùng khó nhận ra ngay rằng việc khoá nút khi Kara đang soạn không còn được kiểm.
  file: `packages/ui/test/bo-xuong-kara.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm chuỗi có mặt thay cho quan hệ): «có hàng nêu đủ sáu tên» bị hạ thành «mỗi tên có ở một hàng nào đó» (r1)**
  Người dùng thấy gì: Tài liệu hướng dẫn có thể bị sửa mất một tên khối khỏi hàng sáu khối mà phép kiểm vẫn báo xanh. Người làm sau có thể đọc bảng thiếu mà không ai cảnh báo.
  file: `_acceptance/bo-xuong-kara/rang/tai-lieu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm chuỗi có mặt thay cho quan hệ): k1-steps kiểm chữ bước bằng includes trên cả khối, không kiểm theo từng bước (r1)**
  Người dùng thấy gì: Danh sách các bước Kara đã làm có thể hiển thị thiếu hoặc sai chữ ở một bước mà phép kiểm vẫn xanh, nên lỗi này có thể lọt tới màn của người dùng.
  file: `packages/ui/test/bo-xuong-kara.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm phần tử có mặt thay cho quan hệ): ở ô off của k1-state, bài chỉ kiểm có field-description mà không kiểm nó chứa lý do (r1)**
  Người dùng thấy gì: Khi Kara bị tắt, màn có thể hiện một dòng mô tả rỗng hoặc sai thay vì lý do tắt, mà phép kiểm vẫn xanh. Người dùng sẽ không biết vì sao Kara không dùng được.
  file: `packages/ui/test/bo-xuong-kara.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): bài quét «karaKhung.thuLai chỉ dùng trong state.tsx» không có đối chứng dương (r1)**
  Người dùng thấy gì: Sau này ai đó có thể dựng một nút Thử lại riêng khác kiểu (khác cỡ, khác kiểu nút) mà phép kiểm không bắt được, khiến các màn Kara có nút Thử lại không đồng nhất.
  file: `packages/ui/test/bo-xuong-kara.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (số khẳng định không bám số phần tử): bộ đếm «so khang dinh» của k1-transcript tự cộng hằng số nên luôn bằng 13 (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng. Bộ đếm số kiểm tra chỉ là con số tự cộng, nên bỏ bớt một kiểm tra thì không ai thấy qua con số đó.
  file: `packages/ui/test/bo-xuong-kara.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
