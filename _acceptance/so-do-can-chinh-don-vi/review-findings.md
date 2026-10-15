# Review findings: so-do-can-chinh-don-vi (round 2)

## Trong hợp đồng

(không có finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Răng E14 (giu-ho-so.mjs) tha mọi eval đỏ trên vật thành «DO SAN» khi bản nền đỏ vì BẤT KỲ lý do gì, không so cùng mã như hợp đồng hứa**
  Người dùng thấy gì: Bước kiểm tra xem vòng này có làm hỏng các hồ sơ đã ký trước đó có thể bỏ sót một lỗi thật: nó coi mọi trường hợp bản gốc cũng lỗi là «lỗi sẵn có», kể cả khi bản gốc lỗi vì lý do khác. Người dùng cuối không bị ảnh hưởng ngay, nhưng báo cáo «giữ hồ sơ đã ký đạt» có thể xanh trong khi một hồ sơ đã ký thực ra bị hỏng.
  file: `_acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs`
  severity: medium
  Đề xuất: known-limits

- **giu-ho-so.mjs: an eval that fails on the base for any reason, with any exit code, is labelled 'DO SAN' and is not counted against the round**
  Người dùng thấy gì: Bước kiểm tra hồ sơ cũ có thể nhầm một lỗi thật thành «đã lỗi từ trước» chỉ vì bản đối chiếu cũng chạy lỗi vì lý do không liên quan. Khi đó một tính năng đã được ký nhận có thể hỏng mà báo cáo vẫn hiện xanh.
  file: `_acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs`
  severity: high
  Đề xuất: known-limits

- **giu-ho-so.mjs banNen: symlinking node_modules back to GOC makes @crm/* imports resolve to the changed packages, not the base**
  Người dùng thấy gì: Phép so sánh với «bản trước khi sửa» thực ra vẫn dùng một phần mã mới, nên có thể che đi việc vòng này làm hỏng một tính năng cũ ở các màn dùng chung. Người dùng có thể gặp lỗi mà báo cáo kiểm tra không cảnh báo.
  file: `_acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs`
  severity: high
  Đề xuất: known-limits

- **FlowMap's node description tells users that Enter/Space opens the card, but on the node wrapper Enter only selects the node**
  Người dùng thấy gì: Người dùng trình đọc màn hình có thể nghe «nhấn Enter để mở thẻ» ở một điểm dừng mà bấm Enter chỉ chọn thẻ chứ không mở ra. Họ phải chuyển sang nút bên trong thẻ mới mở được.
  file: `packages/ui/src/components/flow-map.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình: nhánh «DO SAN» coi mọi lần bản nền không xanh là «đỏ sẵn», không đối chứng dương cho bản nền, không ghim mã/thông điệp**
  Người dùng thấy gì: Phép kiểm tra hồ sơ cũ có thể báo «lỗi sẵn có» cả khi bản đối chiếu hỏng vì lý do khác, mà không có bước xác nhận bản đối chiếu chạy được. Kết quả là một lỗi thật có thể bị bỏ sót và báo cáo vẫn hiện đạt.
  file: `_acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs`
  severity: medium
  Đề xuất: known-limits

- **Lệnh nạp `ca-so-do.ts --nap` ghi vào DB mà không qua chặn production `kiemDuocNap` (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu ai đó chạy tay lệnh nạp dữ liệu mẫu của sơ đồ khi máy đang trỏ vào hệ thống thật, dữ liệu mẫu sẽ chui vào dữ liệu thật của công ty, vì lối này không bị chặn như lối nạp mẫu cũ.
  file: `apps/api/scripts/okr-mau/ca-so-do.ts`
  severity: medium
  Đề xuất: new-contract

- **Sơ đồ đếm theo từng người xem, trái với luật tổng hợp của docs/api.md; ở cùng một thẻ thì Bảng và Sơ đồ ra hai con số khác nhau (r1 · tệp đã đổi)**
  Người dùng thấy gì: Quản trị viên chuyển từ Bảng sang Sơ đồ có thể thấy số mục tiêu và tiến độ của một đơn vị khác với con số ở Bảng, và hai người xem khác quyền có thể thấy hai con số khác nhau.
  file: `apps/api/src/okr/okr-xem.service.ts`
  severity: medium
  Đề xuất: known-limits

- **`so-do-don-vi.ts` viết lại `khoaCuaMucTieu` và `trungBinh` đã có ở `toan-canh.ts`, và lệch ngữ nghĩa (r1 · tệp đã đổi)**
  Người dùng thấy gì: Tiến độ trung bình của một đơn vị có thể lệch vài điểm phần trăm giữa Bảng và Sơ đồ do làm tròn khác nhau, và sau này sửa một chỗ dễ quên chỗ kia.
  file: `apps/api/src/okr/so-do-don-vi.ts`
  severity: low
  Đề xuất: known-limits

- **`TheDonVi` vẽ tay hộp thẻ ở chỗ gọi, trong khi chính diff thêm `FlowMapCard` vào packages/ui mà không dùng (r1)**
  Người dùng thấy gì: Người dùng thấy thẻ đơn vị bình thường, nhưng giao diện được dựng lệch quy ước chung nên sau này chỉnh kiểu thẻ phải sửa ở hai nơi và có một thành phần thừa không ai dùng.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/the-don-vi.tsx`
  severity: low
  Đề xuất: known-limits

- **Số tinh chỉnh viết thẳng trong flow-map.tsx, dù vùng này đã có config `FLOW_LAYOUT` (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng không thấy khác biệt; chỉ là khi muốn chỉnh độ mờ hay kiểu nét đứt của sơ đồ thì phải tìm trong mã thay vì một nơi cấu hình chung.
  file: `packages/ui/src/components/flow-map.tsx`
  severity: low
  Đề xuất: wont-fix

- **Chuỗi giao diện và prop thêm mà không dùng (r1)**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng; trong mã còn vài câu chữ và tuỳ chọn không được dùng đến, có thể gây rối khi bảo trì.
  file: `apps/app/lib/messages/okr-toan-canh.ts`
  severity: low
  Đề xuất: wont-fix

- **Mục tiêu giới hạn (không căn chỉnh được) bị gắn cờ «Có mục tiêu chưa góp vào đâu» / «Chưa nối lên» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Quản trị viên có thể thấy một đơn vị bị đánh dấu «Cần chú ý» hoặc «Chưa nối lên» chỉ vì có mục tiêu hạn chế mà hệ thống không cho nối, tức là cảnh báo về việc không ai sửa được, còn người xem hẹp quyền thì không thấy cảnh báo ấy.
  file: `apps/api/src/okr/so-do-don-vi.ts`
  severity: medium
  Đề xuất: new-contract

- **Căn chỉnh tới đích ngoài tập nút: tắt «Chưa nối lên» mà không vẽ dây; đích không có trong mts thì bị bỏ im lặng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi một mục tiêu nối tới đơn vị đã bị đổi hoặc gỡ khỏi cây, thẻ có thể không hiện đường đi lên mà cũng không có nhãn «Chưa nối lên», và dòng trong thẻ mở ra có thể ghi «Chưa góp vào đâu» trong khi số đếm nói khác.
  file: `apps/api/src/okr/so-do-don-vi.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên ma trận nhưng số đếm tự suy): soCap === canh.length là phép đếm tự đúng, không có ma trận viết trước (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một bài kiểm tra đối chiếu mức tin và lý do giữa sơ đồ và cây căn chỉnh có thể báo xanh dù sơ đồ dư thêm một dòng góp; người dùng chưa thấy lỗi nhưng độ tin của bài kiểm giảm.
  file: `apps/api/test/okr-so-do-don-vi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là QUAN HỆ bằng nhau, assert chỉ kiểm một chiều bao hàm): tập id sơ đồ ⊆ tập id cây (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tra chưa bắt được trường hợp sơ đồ bỏ sót một mục tiêu mà người xem lẽ ra thấy, nên nếu có lỗi kiểu đó, người dùng sẽ thấy thiếu mục tiêu mà không ai báo trước.
  file: `apps/api/test/okr-so-do-don-vi.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): dh4-the không có đối chứng dương rằng có dây hiện (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tra có thể báo xanh dù sơ đồ không vẽ đường nối nào, nên nếu đường nối biến mất sau này thì không có bài nào kêu.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4/5 (bỏ qua phần tử trong ma trận, đối chứng «Mọi đơn vị» chỉ âm tính): dh4-loc `if (!the) continue` (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tra bộ lọc «Cần chú ý» có thể vẫn xanh nếu bộ lọc xoá hẳn các thẻ thay vì làm mờ, nên lỗi kiểu này có thể lọt tới người dùng.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): ca xemToanCanh=la chỉ kiểm vắng [data-so-do], bảng SimpleTable không bao giờ được assert (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tra chưa chắc chắn rằng Bảng vẫn hiện ra khi đường dẫn mang giá trị lạ, nên nếu trang trống trong ca đó thì không bài nào báo.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo mã nguồn/hàm phụ thay vì đầu ra dựng ra): aria-label ba nút điều khiển và duration lia khung (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tra chưa chứng minh ba nút thu phóng có nhãn đọc được và chuyển động đã tắt thật khi người dùng chọn giảm chuyển động; nếu hỏng, người dùng đọc màn hình hoặc nhạy chuyển động sẽ gặp trước.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo hằng cấu hình thay vì đầu ra): «chú giải có ba dòng» đo CHU_GIAI_SO_DO.length (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tra chỉ đếm danh sách chú giải chứ không đếm chú giải hiện trên màn, nên nếu chú giải bị mất khỏi sơ đồ thì bài kiểm vẫn xanh.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc, không round-trip): mọi bài DOM ăn dauVaoThuan(), một bản chiếu tay của bộ gieo CSDL (r1 · tệp đã đổi)**
  Người dùng thấy gì: Các bài kiểm tra giao diện dùng dữ liệu dựng tay chứ không phải dữ liệu thật từ máy chủ, nên nếu hình dạng dữ liệu thật đổi, sơ đồ có thể sai trên màn mà bài kiểm vẫn xanh.
  file: `apps/api/scripts/okr-mau/ca-so-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (chép tay thay vì rút từ nguồn khai): danh sách phụ thuộc được phép của package.json gán cứng trong ranh-gioi.mjs (r1)**
  Người dùng thấy gì: Nếu chủ kho đổi danh sách gói được phép thêm thì phép kiểm ranh giới sẽ không tự theo, có thể cho phép hoặc chặn nhầm một gói; người dùng không thấy tác động trực tiếp.
  file: `_acceptance/so-do-can-chinh-don-vi/rang/ranh-gioi.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
