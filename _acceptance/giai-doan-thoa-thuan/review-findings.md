# Review findings — giai-doan-thoa-thuan (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **deals_by_stage telemetry now has an open set of keys with no permitted* constraint**
  Người dùng thấy gì: Số liệu ẩn danh gửi về hãng nay có thêm một cột cho mỗi giai đoạn do quản trị viên tự tạo, gồm cả giai đoạn đã xoá, với mã ngẫu nhiên. Số cột tăng dần và không so sánh được giữa các bản cài.
  file: `apps/api/src/telemetry/rollup.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Settings stage list copies organization/danh-sach-keo.tsx instead of moving it to packages/ui or using Item**
  Người dùng thấy gì: Danh sách giai đoạn kéo thả trong Cài đặt là bản chép của một danh sách khác trong Cài đặt tổ chức. Người dùng thấy đúng, nhưng sau này sửa một nơi dễ làm hai nơi lệch nhau.
  file: `apps/app/app/(app)/[slug]/settings/giai-doan/giai-doan-settings.tsx`
  severity: medium
  Đề xuất: new-contract

- **Stage constants and the kind type are defined again instead of imported from @crm/db/giai-doan**
  Người dùng thấy gì: Giới hạn độ dài tên giai đoạn và danh sách ba loại được viết lại ở vài nơi. Hiện đang khớp, nhưng nếu đổi giới hạn ở một nơi mà quên nơi kia thì ô nhập và máy chủ sẽ báo khác nhau.
  file: `apps/app/app/(app)/[slug]/settings/giai-doan/hop-thoai-giai-doan.tsx`
  severity: low
  Đề xuất: known-limits

- **Timeline client fallback builds stage labels from raw meta and shows stage ids as labels**
  Người dùng thấy gì: Nếu vì lý do nào đó dòng lịch sử thiếu thông tin nhãn, màn hình sẽ hiện mã giai đoạn thay vì tên. Trong dữ liệu hiện tại điều này không xảy ra.
  file: `apps/app/components/crm/timeline/timeline-entry.tsx`
  severity: low
  Đề xuất: known-limits

- **parseStageChangeMeta turns a parse failure into null**
  Người dùng thấy gì: Một dòng lịch sử đổi giai đoạn có dữ liệu hỏng sẽ lặng lẽ bị coi như không phải lần đổi giai đoạn, thay vì báo lỗi rõ ràng.
  file: `packages/validation/src/giai-doan.ts`
  severity: low
  Đề xuất: known-limits

- **Schema and migration default deal.stage to an original stage id that admins can archive**
  Người dùng thấy gì: Nếu sau này có chỗ tạo thoả thuận mà không chọn giai đoạn, thoả thuận có thể rơi vào giai đoạn Demo đã bị quản trị viên xoá. Hiện mọi đường tạo thoả thuận đều chọn giai đoạn đúng.
  file: `packages/db/prisma/schema.prisma`
  severity: low
  Đề xuất: new-contract

- **Agent deal list never shows the stage indicator: list_deals now returns the stage label, but the UI looks it up as an id**
  Người dùng thấy gì: Trong danh sách thoả thuận mà trợ lý agent trả về, cột giai đoạn không còn hiện chấm màu mà chỉ hiện chữ. Thông tin vẫn đúng, chỉ mất phần trực quan.
  file: `apps/app/components/agent-builder/deal-list-result.tsx`
  severity: medium
  Đề xuất: new-contract

- **Failed reorder keeps the dragged order on screen (optimistic order is never rolled back)**
  Người dùng thấy gì: Khi kéo thả đổi thứ tự giai đoạn mà bị lỗi, thẻ vẫn hiện thứ tự vừa kéo dù thứ tự thật không đổi, cho tới khi người dùng tải lại trang.
  file: `apps/app/app/(app)/[slug]/settings/giai-doan/giai-doan-settings.tsx`
  severity: medium
  Đề xuất: known-limits

- **Deleting a stage with 0 cached deals can get stuck: server says deals exist, but the dialog cannot pick a target**
  Người dùng thấy gì: Nếu có người vừa thêm thoả thuận vào một giai đoạn trong lúc quản trị viên đang mở trang, nút Xoá vẫn coi giai đoạn là trống và báo lỗi mãi cho tới khi tải lại trang.
  file: `apps/app/app/(app)/[slug]/settings/giai-doan/hop-thoai-giai-doan.tsx`
  severity: low
  Đề xuất: known-limits

- **Lock-order inversion between stage delete and a concurrent deal stage change can deadlock**
  Người dùng thấy gì: Hiếm khi, nếu quản trị viên xoá giai đoạn đúng lúc có người kéo một thoả thuận của giai đoạn đó sang bước khác, một trong hai thao tác có thể thất bại với lỗi khó hiểu. Dữ liệu không bị hỏng, thử lại là được.
  file: `apps/api/src/giai-doan/giai-doan.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): E8 ca «nhãn rỗng» và «nhãn 41 ký tự» chỉ đòi có lỗi bất kỳ**
  Người dùng thấy gì: Bài kiểm tra chưa chứng minh chặt rằng lời báo khi đặt tên giai đoạn rỗng hoặc quá dài là lời báo đúng lý do. Người dùng vẫn bị chặn, nhưng bài kiểm có thể xanh dù lời báo sai.
  file: `apps/api/test/giai-doan.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): E7 bốn ca đích sai chỉ kiểm `not.toBe("")`**
  Người dùng thấy gì: Bài kiểm tra việc xoá giai đoạn sang đích sai chưa xác nhận lời báo có nêu đúng lý do. Dữ liệu vẫn được xác nhận là không đổi.
  file: `apps/api/test/giai-doan.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert có mặt thay vì quan hệ): E2 chỉ kiểm cột board «có chứa» id, không kiểm chỉ số cột, và vị trí đo trên CSDL chứ không trên list**
  Người dùng thấy gì: Bài kiểm tra việc thêm giai đoạn mới chỉ xác nhận giai đoạn có mặt trên bảng cột, chưa xác nhận nó đứng đúng vị trí. Nếu cột nằm sai chỗ thì bài kiểm vẫn xanh.
  file: `apps/api/test/giai-doan.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert có mặt thay vì quan hệ): E13 deals_by_stage chỉ kiểm `> 0`, không so với số đếm**
  Người dùng thấy gì: Bài kiểm tra số liệu thoả thuận theo giai đoạn gửi về hãng chỉ xác nhận có số lớn hơn không, chưa so với số thoả thuận thật. Một lỗi đếm sai vẫn có thể lọt qua bài kiểm.
  file: `apps/api/test/giai-doan-bao-cao.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, đối chứng rỗng): E16/E10 dùng `.every(khoa)` / `.some(khoa)` trên tập nút Thêm có thể rỗng**
  Người dùng thấy gì: Bài kiểm tra các nút bị khoá khi đạt trần 20 giai đoạn có thể vẫn xanh nếu các nút Thêm biến mất hẳn. Trang thật chưa được chứng minh sai.
  file: `apps/app/test/giai-doan-cai-dat.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận khai trước thiếu phần tử): E4 khai 3 khẳng định nhưng bài kiểm chỉ có 2 (thiếu board)**
  Người dùng thấy gì: Bài kiểm tra việc đổi tên giai đoạn chưa xác nhận tên mới hiện trên bảng cột của màn Thoả thuận, chỉ xác nhận ở danh sách giai đoạn và lịch sử.
  file: `apps/api/test/giai-doan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận khai trước thiếu phần tử): E7 không kiểm stageChangedAt; E5 ca «kind WON» không kiểm list không đổi**
  Người dùng thấy gì: Bài kiểm tra chưa xác nhận đầy đủ hai điều nhỏ: ngày đổi giai đoạn của thoả thuận khi xoá giai đoạn, và danh sách không đổi sau một yêu cầu bị từ chối.
  file: `apps/api/test/giai-doan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): khẳng định thông điệp forbidden đọc hằng cấu hình, không đọc phản hồi**
  Người dùng thấy gì: Bài kiểm tra chưa xác nhận câu chữ lời từ chối mà thành viên thường thật sự nhìn thấy. Việc họ bị từ chối vẫn được kiểm đúng.
  file: `apps/api/test/giai-doan-quyen.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): dòng STAGE_CHANGE của E14 tự viết meta {from,to} thay vì sinh qua bên ghi**
  Người dùng thấy gì: Bài kiểm tra lịch sử trong phần agent dùng dữ liệu viết tay thay vì dữ liệu do hệ thống ghi ra. Rủi ro thấp vì khuôn dữ liệu đã được kiểm ở chỗ khác.
  file: `apps/agent/test/giai-doan-agent.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
