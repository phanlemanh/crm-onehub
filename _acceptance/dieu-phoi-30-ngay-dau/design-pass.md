---
slug: dieu-phoi-30-ngay-dau
at: 2026-09-20T09:22:00Z
route: http://localhost:3400/proto/dieu-phoi-30-ngay-dau
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (gửi gói ảnh, người phản ứng lúc rảnh)
options: tra mẫu Mobbin 2026-09-20 — 6 màn danh mục onboarding + 4 màn chi tiết (Remote, Workable, Employment Hero, Todoist, Oyster, Wrike)
divergence: skipped — bề mặt đi theo khuôn danh-sách-chi-tiết kho đã dùng cho Công ty, Cá nhân, Thoả thuận; sáu sản phẩm tra trên Mobbin cũng dùng đúng khuôn đó, nên không có hai hướng khả dĩ để bày
ds_skill: repo-tokens
states: [ST-danhmuc-codulieu, ST-danhmuc-loading, ST-danhmuc-empty, ST-danhmuc-chuacokhuon, ST-danhmuc-loi, ST-hoso-codulieu, ST-hoso-phieurong, ST-hoso-khongkhuon, ST-khuon-empty]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 5
deferred: 5
---
# design-pass — dieu-phoi-30-ngay-dau

## Ma trận capture

36 ô: 9 trạng thái × 2 khổ × 2 chủ đề. Tất cả nằm ở
`evidence/design-pass/<state>--<khổ>--<chủ đề>.png`.

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-danhmuc-codulieu | desktop-1280 | light | evidence/design-pass/ST-danhmuc-codulieu--desktop-1280--light.png |
| ST-danhmuc-codulieu | desktop-1280 | dark | evidence/design-pass/ST-danhmuc-codulieu--desktop-1280--dark.png |
| ST-danhmuc-codulieu | mobile-375 | light | evidence/design-pass/ST-danhmuc-codulieu--mobile-375--light.png |
| ST-danhmuc-codulieu | mobile-375 | dark | evidence/design-pass/ST-danhmuc-codulieu--mobile-375--dark.png |
| ST-danhmuc-loading | desktop-1280 · mobile-375 | light · dark | evidence/design-pass/ST-danhmuc-loading--*.png |
| ST-danhmuc-empty | desktop-1280 · mobile-375 | light · dark | evidence/design-pass/ST-danhmuc-empty--*.png |
| ST-danhmuc-chuacokhuon | desktop-1280 · mobile-375 | light · dark | evidence/design-pass/ST-danhmuc-chuacokhuon--*.png |
| ST-danhmuc-loi | desktop-1280 · mobile-375 | light · dark | evidence/design-pass/ST-danhmuc-loi--*.png |
| ST-hoso-codulieu | desktop-1280 · mobile-375 | light · dark | evidence/design-pass/ST-hoso-codulieu--*.png |
| ST-hoso-phieurong | desktop-1280 · mobile-375 | light · dark | evidence/design-pass/ST-hoso-phieurong--*.png |
| ST-hoso-khongkhuon | desktop-1280 · mobile-375 | light · dark | evidence/design-pass/ST-hoso-khongkhuon--*.png |
| ST-khuon-empty | desktop-1280 · mobile-375 | light · dark | evidence/design-pass/ST-khuon-empty--*.png |

## Cảnh ngữ-cảnh

Không có. Đã khai bỏ có tên trong sổ quyết định: đường proto của kho render bản
mẫu **trần** theo thiết kế (`docs/proto.md`), và luật chống-trôi cấm vẽ lại một
vỏ ứng dụng không tồn tại. Dựng vỏ giả sẽ trông hoàn chỉnh hơn thật — đúng thứ
`ux-ui-craft` gọi là *trôi đeo lớp hoàn chỉnh*.

Người duyệt đọc phần vào–ra bằng chữ ở mục «Luồng» của Đặc tả UX trong design
doc. Mục điều hướng thật sẽ thấy ở S3, khi màn nằm trong vỏ thật.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- **Cột «Đang tắc ở» nằm ngoài màn ở khổ 375.** Màn tồn tại để trả lời *đối tác
  nào đang tắc*, mà đúng cột đó lại phải cuộn ngang mới thấy. Đã đưa «Đang tắc
  ở» và «Im» lên ngay sau «Đối tác», thu bề rộng cắt xuống 11rem, chặn xuống
  dòng ở hai cột số. Ảnh trước–sau: cùng ô `ST-danhmuc-codulieu--mobile-375`.
- **Bước quá hạn trông y hệt bước chưa tới hạn.** Ở `ST-hoso-codulieu`, bước
  «Chuyển dữ liệu tin đăng cũ» hạn 12/09 trong khi kế hoạch đã sang ngày 21 —
  không dấu hiệu nào. Đã thêm huy hiệu «Quá hạn» biến thể `outline` và làm đậm
  ngày hạn. KHÔNG thêm màu mới: luật màu của kho chỉ tô đầy `primary` và
  `destructive`, mà quá hạn không phải việc không đảo được.

- **Danh mục nói thời gian đã trôi, không nói tiến độ** *(từ tra mẫu Mobbin)*. Hàng
  chỉ có «21/30 ngày», nên đối tác ngày 21 đã xong 4/5 bước và đối tác ngày 21 mới
  xong 1/5 trông y hệt nhau — trong khi một cái ổn còn một cái đang cháy. Remote
  hiện `1/3` · `2/3`; Employment Hero hiện phần trăm kèm tên chặng. Đã thêm cột
  **Bước x/y**. Thấy ngay khác biệt: Thành Đạt 1/6 sau 12 ngày vs An Khang 3/5 sau
  21 ngày.
- **Bộ lọc là chip chữ, không có số đếm** *(từ tra mẫu Mobbin)*. Workable dùng rãnh
  trạng thái kèm số làm đường điều hướng chính của danh sách. Đã đổi thành
  «Đang chạy 3 · Đang tắc 2 · Chưa giao 1 · Đã đóng 7». Số lấy từ `facetCounts` mà
  hợp đồng tRPC đã trả sẵn — không phải việc dựng thêm.
- **Bước chưa giao bắt người tự quét mới thấy** *(từ tra mẫu Mobbin)*. Todoist đếm
  thẳng «0 assigned / 25 unassigned». Đã thêm dòng tóm tắt trên thẻ bước:
  «3/5 xong · 1 bước chưa giao cho ai · Kỹ thuật 1, Đào tạo 1 đang dở» — chạm đúng
  cơn đau việc-rơi thay vì để nó nằm rải trong danh sách.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- **Kho khai skill chuẩn giao diện là một skill RÀ SOÁT, không phải chuẩn thiết
  kế.** `design_pass.ds_skill` và `feature_loop.ui_standards_skill` cùng trỏ
  `web-design-guidelines`, nhưng skill đó đọc mã UI đã có rồi chấm — gọi nó ở S1
  khi chưa có dòng mã nào là gọi vào khoảng không. Phiên này rơi xuống nấc 2 của
  thang chuẩn: **từ vựng token của kho**. Người duyệt quyết: nhận nấc đó làm
  chuẩn chính thức, hay đầu tư một skill chuẩn thiết kế riêng. Chỗ đúng của
  `web-design-guidelines` là S3/S4, sau khi có mã để rà.
- **`/packages/ui` chưa có component phễu bậc.** Phễu bốn bậc đang ghép bằng bốn
  thanh `Progress` xếp chồng ở chỗ gọi. Chạy được, nhưng nếu phễu thành thứ dùng
  nhiều (hồ sơ đối tác, báo cáo, vòng sau) thì nó đáng là một component trong
  `/packages/ui` — dựng ở chỗ gọi là đúng thứ `docs/design.md` cấm.
- **Bảng danh mục ở khổ hẹp vẫn phải cuộn ngang** để thấy bộ phận và người cầm
  trịch, và không có dấu hiệu nào cho biết là cuộn được. `Table` của kho đã có
  `overflow-x-auto` nên không vỡ, nhưng nếu nhân viên thật sự mở màn này trên
  điện thoại thì dạng danh sách xếp chồng cho khổ hẹp mới là hình đúng. Cần biết
  người dùng thật có dùng điện thoại không trước khi tiêu công vào đó.
- **Bước nên gom theo bộ phận, không phải một danh sách phẳng** *(từ tra mẫu
  Mobbin)*. Remote gom bước thành thẻ theo nhóm, mỗi nhóm mang trạng thái riêng
  («Initiated on: Not started»); Todoist gom theo mục có số đếm và chỉ mở mục đang
  làm. Gom theo bộ phận sẽ trả lời thẳng câu «đội đào tạo đang giữ mấy việc» thay
  vì bắt đọc cả danh sách. Vòng này chỉ thêm một dòng tóm tắt vì gom lại là đổi bố
  cục thật — người duyệt quyết có đáng làm ngay không.
- **Mỗi bước chưa có nút hành động riêng** *(từ tra mẫu Mobbin)*. Oyster cho từng
  bước một nút đúng việc của nó («Preview contract», «Add payment info») thay vì
  chỉ một nhãn trạng thái. Bản mẫu hiện chỉ đọc. Luật «đóng mọi vòng» của chuẩn
  giao diện đòi chỗ nhập nào cũng phải có chỗ chốt nhìn thấy được — nên giao việc
  và đánh dấu xong phải là nút nằm ngay trên bước, không nằm trong một màn khác.
