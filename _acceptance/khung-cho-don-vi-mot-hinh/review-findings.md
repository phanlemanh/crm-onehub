# Review findings: khung-cho-don-vi-mot-hinh (round 4)

## Trong hợp đồng

Không có finding nào được map vào AC ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **tep-goc-da-doi chieu do passes with zero assertions on the CI test job, because that checkout is shallow (r3)**
  Người dùng thấy gì: Trang Theo đơn vị vẫn hiện đúng một khung chờ như đã hứa. Nhưng trên máy chạy kiểm tự động, một bài canh giữ hai tệp của trang này bị bỏ qua mà vẫn báo xanh, nên nếu sau này ai làm hỏng khung chờ ở đó thì máy kiểm có thể không bắt được.
  Căn cứ: Người dùng không bị ảnh hưởng ngay hôm nay, chỉ làm giảm khả năng phát hiện lỗi khung chờ trong tương lai; lỗi nếu xảy ra sẽ lộ ở các bài kiểm khác hoặc khi duyệt, và sửa sau vẫn rẻ.
  file: `apps/app/test/khung-man-chung.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (một phép kiểm chỉ có chiều âm, không có đối chứng dương): trên checkout nông, phép kiểm chiều đỏ của tep-goc-da-doi thoát ra mà không kiểm gì (r3)**
  Người dùng thấy gì: Trên máy chạy kiểm tự động, hai phép kiểm xem khung chờ của trang Theo đơn vị có đúng hình không bị bỏ qua mà vẫn báo xanh. Người dùng vẫn thấy khung chờ đúng, nhưng một hỏng hóc về hình khung sau này có thể lọt qua.
  Căn cứ: Không gây hại ngay cho người dùng, chỉ làm lưới an toàn của máy kiểm thưa đi ở một chỗ; hỏng hóc nếu có sẽ thấy khi xem trang và sửa sau không đắt.
  file: `apps/app/test/khung-man-chung.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Ca mới tep-goc-da-doi đỏ trên checkout nông (job test của ci.yml): khi không có commit gốc, kỳ vọng [GHI_CHU_NONG] nhưng hàm không bao giờ trả dòng đó vì goc đã được thay bằng bảng (r2)**
  Người dùng thấy gì: Người dùng không thấy gì trên màn hình. Nhưng khi PR chuyển sang sẵn sàng, bước kiểm tự động trên CI có thể báo đỏ vì một bài kiểm cũ viết sai cho môi trường tải nông, nên việc gộp bị chặn.
  Căn cứ: Không ảnh hưởng người dùng cuối, chỉ có thể làm CI đỏ lúc gộp; tự phát hiện ngay khi chạy và sửa nhỏ nhưng thuộc bài kiểm của hồ sơ khác.
  file: `apps/app/test/khung-man-chung.spec.ts`
  severity: high
  Đề xuất: new-contract

- **man-khung-cho.mjs: E1/E4 vẫn đạt khi cả pha chờ chỉ gồm mẫu «lạ», vì không kiểm khung là bang-hai-dong và Math.max() của mảng rỗng ra -Infinity (r2 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này ai đó đổi khung chờ của trang về hình khác, phép đo trên trình duyệt vẫn có thể báo đạt, nên người dùng có thể lại thấy khung chờ sai hình mà không ai hay.
  Căn cứ: Hiện không làm hỏng gì cho người dùng và còn bài kiểm khác bắt được loại lỗi này; chỉ là lưới an toàn mỏng, sửa sau không mất dữ liệu.
  file: `_acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs`
  severity: medium
  Đề xuất: new-contract

- **trang-khac.mjs --pha-thu: process.exit trong khối try bỏ qua finally, thư mục tạm không bao giờ được xoá (r2)**
  Người dùng thấy gì: Không ảnh hưởng người dùng; mỗi lần chạy thử phá trên máy dev để lại một thư mục tạm chiếm chỗ ổ đĩa.
  Căn cứ: Chỉ tốn chút dung lượng trên máy người làm, tự xoá tay được, kết quả đo vẫn đúng.
  file: `_acceptance/khung-cho-don-vi-mot-hinh/rang/trang-khac.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 — Assertion âm-tính-một-mình: «cay toi da 0» và «vong quay 0» của AC-1 không có đối chứng dương, cũng không ghim thông điệp (r2 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này khung chờ lại hiện cây đơn vị hoặc vòng quay toàn trang, phép đo tự động có thể không phát hiện ra, và người dùng sẽ thấy lại cảnh khung chờ lộn xộn.
  Căn cứ: Không gây hại hiện tại vì khung đang đúng; chỉ giảm khả năng bắt hồi quy sau này, và lỗi nếu xảy ra chỉ là giao diện chờ xấu, tải lại là hết.
  file: `_acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: ô chọn đơn vị trong bài a11y là một <button data-chon-don-vi> giả, không phải ChonDonVi thật (r2)**
  Người dùng thấy gì: Nếu ô chọn đơn vị thật mất khả năng nhận tiêu điểm bàn phím trong lúc tải, bài kiểm vẫn xanh và người dùng bàn phím hay trình đọc màn hình có thể không bấm vào được ô đó.
  Căn cứ: Ô chọn thật hiện chạy đúng và lỗi chỉ xảy ra nếu có người sửa sau; ảnh hưởng nhỏ, tải lại trang là thoát.
  file: `apps/app/test/khung-cho-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Tuyên quét LỚP «nhập Skeleton theo bất kỳ đường nào» nhưng chỉ bắt hai dạng điểm (default hoặc named mang tên Skeleton) (r2)**
  Người dùng thấy gì: Một người sau này có thể tự vẽ vạch chờ bằng cách nhập khác thường mà bài kiểm không bắt, khiến khung chờ trang Theo đơn vị lại lệch hình so với bảng.
  Căn cứ: Chỉ là giao diện chờ lệch hình nếu có người cố tình viết lạ, không mất dữ liệu và không ảnh hưởng chức năng; sửa lại dễ khi bị thấy.
  file: `apps/app/test/khung-cho-don-vi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Toolbar layout class strings copy-pasted from apps/app into packages/ui (r1 · tệp đã đổi)**
  Người dùng thấy gì: Hàng công cụ lúc đang tải và lúc đã tải đang được định dạng từ hai chỗ riêng. Hôm nay hai bên khớp nhau, nhưng sau này ai sửa một bên mà quên bên kia thì khung chờ sẽ lệch khỏi trang thật mà không ai báo.
  Căn cứ: Người dùng chưa thấy gì sai ở hiện tại, chỉ có rủi ro lệch hình về sau, và sửa lúc đó chỉ là chỉnh lại cho khớp nên rẻ.
  file: `packages/ui/src/components/khung-xuong.tsx`
  severity: medium
  Đề xuất: known-limits

- **New acceptance scripts add code comments despite the 'Never add code comments' rule (r1)**
  Người dùng thấy gì: Vài tệp kiểm tra nội bộ của đợt này còn lời chú thích mà quy ước kho không cho phép. Người dùng cuối không thấy và không bị ảnh hưởng.
  Căn cứ: Chỉ là chuyện quy ước viết mã trong tệp kiểm tra nội bộ, không ảnh hưởng người dùng, và xoá chú thích bất cứ lúc nào cũng rẻ.
  file: `_acceptance/khung-cho-don-vi-mot-hinh/rang/hai-chieu.mjs`
  severity: low
  Đề xuất: wont-fix

- **Đổi fallback và dùng KhungXuong trong hang-cong-cu.tsx làm đỏ bài khung-man-chung.spec.ts, mà fixture của bài này chưa được cập nhật (r1)**
  Người dùng thấy gì: Một bài kiểm tự động có sẵn của kho sẽ báo đỏ vì danh sách khung chờ chưa được cập nhật theo trang Theo đơn vị mới. Người dùng mở trang vẫn thấy đúng, nhưng đội làm sẽ bị chặn khi đẩy mã lên cho đến khi sửa.
  Căn cứ: Không làm hỏng gì cho người dùng, nhưng làm bộ kiểm của kho đỏ và chặn việc gộp mã; sửa nhanh và an toàn vì chỉ chỉnh danh sách khai báo.
  file: `apps/app/test/fixtures/khung-man-chung-hinh.json`
  severity: high
  Đề xuất: new-contract

- **man-khung-cho.mjs cho AC-1, AC-3 và AC-4 đạt khi mọi mẫu chỉ là mẫu «lạ», không có mẫu bang-hai-dong nào (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép đo tự động có thể báo đạt dù nó không bắt được khung chờ đúng hình trong một số tình huống hiếm. Trang thật hiện vẫn hiển thị đúng; rủi ro là một lần hỏng sau này lọt qua phép đo.
  Căn cứ: Người dùng không bị ảnh hưởng ngay, chỉ là lưới đo kém chặt trong tình huống hiếm, và sau này siết lại phép đo không làm mất dữ liệu của ai.
  file: `_acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative check with no pinned message): neither of E2's two declared break tests pins an AC-2 message (r1)**
  Người dùng thấy gì: Khi bấm sang thẻ Theo đơn vị từ thẻ khác, việc khung chờ đúng hình hiện vẫn đạt, nhưng chưa có bằng chứng bài kiểm sẽ báo đỏ nếu phần này hỏng. Người dùng hôm nay không thấy khác biệt.
  Căn cứ: Chỉ làm giảm độ tin cậy của lưới kiểm cho một đường đi, không ảnh hưởng người dùng hiện tại, và bổ sung bài thử sau này rẻ.
  file: `_acceptance/khung-cho-don-vi-mot-hinh/rang/hai-chieu.mjs`
  severity: high
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped to the reader): the unit picker in the a11y test is a stand-in `<button data-chon-don-vi>`, not the real ChonDonVi (r1)**
  Người dùng thấy gì: Bài kiểm tiêu điểm bàn phím dùng một nút giả thay cho ô chọn đơn vị thật, nên chưa chứng minh được người dùng bàn phím vào được ô chọn thật lúc đang tải. Chưa có dấu hiệu ô thật hỏng.
  Căn cứ: Nguy cơ thấp vì chỉ là bằng chứng chưa đầy đủ chứ chưa thấy lỗi thật, người dùng gặp thì tải lại là xong, và đổi sang ô thật khi cần không tốn nhiều.
  file: `apps/app/test/khung-cho-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion with no positive control): the scan's Skeleton-import branch is never shown red, and it matches the import's local name rather than the module path (r1)**
  Người dùng thấy gì: Bộ quét chặn việc vẽ khung chờ bằng tay có thể bỏ sót vài cách viết lạ, nên sau này ai đó vẽ lại khung riêng có thể không bị bắt. Trang hiện tại không bị ảnh hưởng.
  Căn cứ: Hôm nay người dùng không gặp gì, chỉ là lưới chặn tái phạm hơi lỏng ở vài kiểu viết hiếm, và siết lại sau cũng rẻ.
  file: `apps/app/test/khung-cho-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
