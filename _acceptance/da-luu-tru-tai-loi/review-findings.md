# Review findings — da-luu-tru-tai-loi (round 1)

## Trong hợp đồng

- **Shape 4 (negative assertion with no control): E1 'tayMo' uses every() on a list with no length pinned, so it passes when empty**
  AC: AC-1
  file: `apps/app/test/da-luu-tru-tai-loi.dom.tsx:379`
  severity: medium
  source: measurement
  detail: E1 row 4 promises "drag handles are not locked (admin)". The assertion is `tayMo: tayCam(k).every((b) => !khoa(b))` compared against `true`. `every` on an empty array returns true. So if `tayCam` finds 0 handles (the handles stop rendering, or the `.sr-only` selector stops matching), E1 still passes. Nothing pins the count. The sister test giai-doan-cai-dat.dom.tsx:312 pins `expect(tay).toHaveLength(BAY.length)` before calling `every`. E5 in the same file also pins 7 values with `tayKhoa: BAY.map(() => true)`. E1 alone checks 'no handle is locked' with no positive control that the handles exist.
  rationale: AC-1 hứa rõ «tay kéo mở» khi khối lỗi hiện; phép kiểm này đúng vào vế đó nhưng xanh cả khi không có tay kéo nào, nên bằng chứng cho AC-1 rỗng ở vế này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Shape 5 (claims a class, checks one case): E6 says 'every cell pins 3 cards and no full-page error', but two cells skip that**
  Người dùng thấy gì: Sau khi bấm «Thử lại» trên màn thật, phép đo không kiểm lại rằng ba thẻ nhóm giai đoạn vẫn còn. Nếu «Thử lại» vô tình làm hỏng cả trang, phép đo vẫn có thể báo đạt.
  file: `_acceptance/da-luu-tru-tai-loi/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits
- **Shape 5 (claims a class, checks one case): E3 row 4 promises 'no archived-list at any time' but checks only at the end**
  Người dùng thấy gì: Trong lúc đang thử lại sau lỗi, phép kiểm không xác nhận danh sách đã lưu trữ chưa hiện ra nhầm. Người dùng có thể thoáng thấy danh sách sai mà phép kiểm không bắt được.
  file: `apps/app/test/da-luu-tru-tai-loi.dom.tsx`
  severity: low
  Đề xuất: known-limits
- **Shape 2 (hand-written fixture): the archived fixture and its type are hand-written instead of parsed with giaiDoanArchivedOutput**
  Người dùng thấy gì: Nếu sau này dữ liệu danh sách giai đoạn đã lưu trữ đổi dạng, bài kiểm vẫn xanh dù màn hình đọc sai dữ liệu. Rủi ro chỉ xảy ra khi có người đổi dạng dữ liệu đó, không ảnh hưởng người dùng hiện tại.
  file: `apps/app/test/da-luu-tru-tai-loi.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
