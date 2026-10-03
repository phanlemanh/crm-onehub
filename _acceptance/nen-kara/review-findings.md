# Review findings: nen-kara (round 3)

## Trong hợp đồng

- **Hình dạng 5 (tuyên quét lớp, chỉ có điểm): nk-hai-tieng nói «mọi chữ thành phần tự đặt» nhưng ProposedChange chỉ đo ở trạng thái không có chữ tự đặt nào**
  file: `packages/ui/test/nen-kara.dom.tsx:526`
  severity: low
  AC: AC-8
  detail: AC-8 hứa mọi chữ do thành phần tự đặt đều đổi theo tiếng. Hàm `chuTuDat` (dòng 489-500) chỉ duyệt nút chữ (NodeFilter.SHOW_TEXT), không đọc thuộc tính. Ca ProposedChange (dòng 526-541) dựng ở trạng thái chờ, không pending, không editing, và ghi trước `so: 0`. Trong khi đó chữ tự đặt của ProposedChange đều nằm ở trạng thái khác và đều là thuộc tính: `aria-label={msg.proposedChange.edit}` của ô sửa (proposed-change.tsx:128) và `aria-label={msg.spinner.loading}` của Spinner lúc đang gửi (spinner.tsx:35). Ô ProposedChange của ma trận vì thế không đo được gì: nếu một trong hai nhãn đó bị viết cứng tiếng Việt, bài vẫn xanh với 0 = 0. Phạm vi lớp được tuyên lớn hơn phần được đo.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The «2 góp ý» count on the Kara label is hardcoded and contradicts the pending proposals in most states**
  Người dùng thấy gì: Trên trang mẫu, nhãn Kara luôn ghi «2 góp ý» dù có lúc không còn góp ý nào đang chờ. Chỉ là trang xem thử, màn thật chưa dùng, nhưng con số này không phải mẫu tốt để màn sau chép theo.
  file: `apps/app/app/proto/_modules/nen-kara/index.tsx`
  severity: low
  Đề xuất: known-limits

- **New TEN_RIENG exemption set has no size-pinning test, unlike the other exemption lists in du-lieu.ts**
  Người dùng thấy gì: Danh sách chữ được miễn dịch (hiện chỉ có tên Kara) không có chốt chặn nào. Sau này ai đó có thể thêm một chữ chưa dịch vào đó và bài kiểm tra hai tiếng sẽ bỏ qua, nên người dùng có thể thấy chữ sai tiếng mà không ai hay.
  file: `packages/ui/test/du-lieu.ts`
  severity: low
  Đề xuất: known-limits

- **man-proto.mjs crashes before printing 'thieu so phan tu ghi truoc', so the eval's promised message never appears**
  Người dùng thấy gì: Công cụ đo màn hình có thể sập thay vì báo rõ lý do khi ai đó thêm một trạng thái mới mà quên khai số liệu. Người dùng cuối không bị ảnh hưởng, người làm chỉ mất lời nhắn dễ hiểu.
  file: `_acceptance/nen-kara/rang/man-proto.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên quét lớp nhưng ma trận không viết trước): E10 suy số ô từ bảng của design doc, không ghim 32**
  Người dùng thấy gì: Nếu một trạng thái bị gỡ khỏi cả tài liệu thiết kế lẫn danh mục, phép kiểm tra màn hình vẫn báo xanh dù đo thiếu ô. Hiện chưa có ô nào bị thiếu, nhưng lời hứa «đo đủ 32 ô» chưa có gì giữ chắc.
  file: `_acceptance/nen-kara/rang/man-proto.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định có mặt, trong khi lời hứa là quan hệ): E10 soát ảnh đầu vào E13 bằng existsSync, trong khi ảnh đã commit sẵn**
  Người dùng thấy gì: Phép kiểm tra chỉ xem ảnh chụp có tồn tại, không xem ảnh có do lượt chạy này chụp hay không. Người chấm có thể đang xem ảnh cũ mà không biết.
  file: `_acceptance/nen-kara/rang/man-proto.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định có chuỗi, trong khi lời hứa là quan hệ): E12 mục (c) chỉ grep chữ «card» trong hàng confirmation.tsx**
  Người dùng thấy gì: Phép kiểm tra tài liệu có thể chấp nhận một dòng ghi nhầm ý miễn là có chữ «card». Người đọc tài liệu có thể gặp mô tả sai mà bài kiểm tra vẫn xanh, nhưng tài liệu hiện tại chưa thấy sai.
  file: `_acceptance/nen-kara/rang/tai-lieu.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
