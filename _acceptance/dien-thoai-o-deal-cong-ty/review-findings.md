# Review findings: dien-thoai-o-deal-cong-ty (round 1)

## Trong hợp đồng

Không có lỗi nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **dung-so-chung.mjs anchors on merge-base, so the AC-7 check breaks once the branch is merged**
  Người dùng thấy gì: Bảng người ở thoả thuận và công ty vẫn hiện số đúng. Chỉ có phép kiểm tự động 'số dùng thành phần chung' sẽ báo đỏ nhầm sau khi tính năng đã lên, và có thể làm người duyệt tưởng có lỗi khi không có.
  file: `_acceptance/dien-thoai-o-deal-cong-ty/rang/dung-so-chung.mjs`
  severity: medium
  Đề xuất: known-limits

- **E1/E2 say the red run fails with the 'thieu phone' message, but dropping phone from the Prisma select fails earlier with a ZodError**
  Người dùng thấy gì: Nếu ai đó lỡ bỏ số điện thoại khỏi dữ liệu trả về, phép kiểm vẫn báo đỏ, chỉ là dòng lỗi hiện ra khác với dòng mô tả trong tài liệu nghiệm thu. Người dùng không bị ảnh hưởng.
  file: `_acceptance/dien-thoai-o-deal-cong-ty/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **do-man.mjs chon-nguoi: a timeout waiting for the option is swallowed and reported as SAI (exit 1) instead of 'cannot measure' (exit 2)**
  Người dùng thấy gì: Khi phép đo màn hình bị trục trặc kỹ thuật lúc mở ô chọn người, nó có thể báo thành 'sản phẩm sai' thay vì 'không đo được'. Người dùng cuối không thấy gì khác, chỉ người duyệt có thể bị nhầm lẫn.
  file: `_acceptance/dien-thoai-o-deal-cong-ty/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **dung-so-chung.mjs measures against merge-base(HEAD, origin/onehub) and goes falsely red once the branch is merged**
  Người dùng thấy gì: Phép kiểm tự động về việc dùng thành phần hiện số chung sẽ báo đỏ nhầm sau khi tính năng đã gộp, dù giao diện vẫn đúng. Không ảnh hưởng người dùng.
  file: `_acceptance/dien-thoai-o-deal-cong-ty/rang/dung-so-chung.mjs`
  severity: low
  Đề xuất: known-limits

- **do-man.mjs: cleanup errors are swallowed silently**
  Người dùng thấy gì: Nếu việc xoá dữ liệu thử sau khi đo màn hình bị lỗi, dữ liệu thử có thể còn sót lại mà không có thông báo. Trong cách chạy chuẩn dùng cơ sở dữ liệu tạm nên hầu như không gây hại.
  file: `_acceptance/dien-thoai-o-deal-cong-ty/rang/do-man.mjs`
  severity: low
  Đề xuất: wont-fix

- **Shape 4 (red side without a pinned message): the CHIEU DO for CONTACT_SELECT and the companies select missing phone never reaches the 'thieu phone' message**
  Người dùng thấy gì: Nếu số điện thoại bị bỏ khỏi dữ liệu thoả thuận hoặc công ty, phép kiểm vẫn bắt được, nhưng bằng một lỗi chung chung thay vì lỗi nói đúng 'thiếu số điện thoại'. Người dùng không bị ảnh hưởng.
  file: `apps/api/test/dien-thoai-o-deal-cong-ty.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims the whole class with only point cases): the 'bo ve trong' matrix has 2x2 cells but the test writes only 3**
  Người dùng thấy gì: Chưa có phép kiểm riêng cho người vừa không có chức danh vừa không có số điện thoại trong ô chọn người. Nếu có lỗi hiển thị thừa dấu chấm giữa, phép kiểm hiện tại sẽ không phát hiện.
  file: `apps/app/test/dien-thoai-o-deal-cong-ty.dom.tsx`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/dien-thoai-o-deal-cong-ty/rang/dung-so-chung.mjs, _acceptance/dien-thoai-o-deal-cong-ty/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
