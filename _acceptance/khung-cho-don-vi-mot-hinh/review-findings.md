# Review findings: khung-cho-don-vi-mot-hinh (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Toolbar layout class strings copy-pasted from apps/app into packages/ui**
  Người dùng thấy gì: Hàng công cụ lúc đang tải và lúc đã tải đang được định dạng từ hai chỗ riêng. Hôm nay hai bên khớp nhau, nhưng sau này ai sửa một bên mà quên bên kia thì khung chờ sẽ lệch khỏi trang thật mà không ai báo.
  Căn cứ: Người dùng chưa thấy gì sai ở hiện tại, chỉ có rủi ro lệch hình về sau, và sửa lúc đó chỉ là chỉnh lại cho khớp nên rẻ.
  file: `packages/ui/src/components/khung-xuong.tsx`
  severity: medium
  Đề xuất: known-limits

- **New acceptance scripts add code comments despite the 'Never add code comments' rule**
  Người dùng thấy gì: Vài tệp kiểm tra nội bộ của đợt này còn lời chú thích mà quy ước kho không cho phép. Người dùng cuối không thấy và không bị ảnh hưởng.
  Căn cứ: Chỉ là chuyện quy ước viết mã trong tệp kiểm tra nội bộ, không ảnh hưởng người dùng, và xoá chú thích bất cứ lúc nào cũng rẻ.
  file: `_acceptance/khung-cho-don-vi-mot-hinh/rang/hai-chieu.mjs`
  severity: low
  Đề xuất: wont-fix

- **Đổi fallback và dùng KhungXuong trong hang-cong-cu.tsx làm đỏ bài khung-man-chung.spec.ts, mà fixture của bài này chưa được cập nhật**
  Người dùng thấy gì: Một bài kiểm tự động có sẵn của kho sẽ báo đỏ vì danh sách khung chờ chưa được cập nhật theo trang Theo đơn vị mới. Người dùng mở trang vẫn thấy đúng, nhưng đội làm sẽ bị chặn khi đẩy mã lên cho đến khi sửa.
  Căn cứ: Không làm hỏng gì cho người dùng, nhưng làm bộ kiểm của kho đỏ và chặn việc gộp mã; sửa nhanh và an toàn vì chỉ chỉnh danh sách khai báo.
  file: `apps/app/test/fixtures/khung-man-chung-hinh.json`
  severity: high
  Đề xuất: new-contract

- **man-khung-cho.mjs cho AC-1, AC-3 và AC-4 đạt khi mọi mẫu chỉ là mẫu «lạ», không có mẫu bang-hai-dong nào**
  Người dùng thấy gì: Phép đo tự động có thể báo đạt dù nó không bắt được khung chờ đúng hình trong một số tình huống hiếm. Trang thật hiện vẫn hiển thị đúng; rủi ro là một lần hỏng sau này lọt qua phép đo.
  Căn cứ: Người dùng không bị ảnh hưởng ngay, chỉ là lưới đo kém chặt trong tình huống hiếm, và sau này siết lại phép đo không làm mất dữ liệu của ai.
  file: `_acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative check with no pinned message): neither of E2's two declared break tests pins an AC-2 message**
  Người dùng thấy gì: Khi bấm sang thẻ Theo đơn vị từ thẻ khác, việc khung chờ đúng hình hiện vẫn đạt, nhưng chưa có bằng chứng bài kiểm sẽ báo đỏ nếu phần này hỏng. Người dùng hôm nay không thấy khác biệt.
  Căn cứ: Chỉ làm giảm độ tin cậy của lưới kiểm cho một đường đi, không ảnh hưởng người dùng hiện tại, và bổ sung bài thử sau này rẻ.
  file: `_acceptance/khung-cho-don-vi-mot-hinh/rang/hai-chieu.mjs`
  severity: high
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped to the reader): the unit picker in the a11y test is a stand-in `<button data-chon-don-vi>`, not the real ChonDonVi**
  Người dùng thấy gì: Bài kiểm tiêu điểm bàn phím dùng một nút giả thay cho ô chọn đơn vị thật, nên chưa chứng minh được người dùng bàn phím vào được ô chọn thật lúc đang tải. Chưa có dấu hiệu ô thật hỏng.
  Căn cứ: Nguy cơ thấp vì chỉ là bằng chứng chưa đầy đủ chứ chưa thấy lỗi thật, người dùng gặp thì tải lại là xong, và đổi sang ô thật khi cần không tốn nhiều.
  file: `apps/app/test/khung-cho-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion with no positive control): the scan's Skeleton-import branch is never shown red, and it matches the import's local name rather than the module path**
  Người dùng thấy gì: Bộ quét chặn việc vẽ khung chờ bằng tay có thể bỏ sót vài cách viết lạ, nên sau này ai đó vẽ lại khung riêng có thể không bị bắt. Trang hiện tại không bị ảnh hưởng.
  Căn cứ: Hôm nay người dùng không gặp gì, chỉ là lưới chặn tái phạm hơi lỏng ở vài kiểu viết hiếm, và siết lại sau cũng rẻ.
  file: `apps/app/test/khung-cho-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/khung-cho-don-vi-mot-hinh/rang/hai-chieu.mjs, apps/app/test/fixtures/khung-man-chung-hinh.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
