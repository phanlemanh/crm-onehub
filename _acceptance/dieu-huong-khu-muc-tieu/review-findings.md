# Review findings: dieu-huong-khu-muc-tieu (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đối chứng dương chạy trên cây thật, còn đột biến chạy trên worktree tạm: bản sao nguyên vẹn chưa từng được chạy xanh**
  Người dùng thấy gì: Phép kiểm tự thử của vòng này có thể báo nhầm lỗi do môi trường thử chứ không do tính năng. Tính năng điều hướng khu Mục tiêu người dùng thấy không bị ảnh hưởng.
  file: `_acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs`
  severity: low
  Đề xuất: known-limits

- **Thêm chú thích mới vào mã test, trái luật «Never add code comments» của AGENTS.md**
  Người dùng thấy gì: Hai dòng ghi chú thừa nằm trong mã kiểm thử, trái quy ước của kho. Người dùng không thấy gì khác đi.
  file: `apps/app/test/okr-dau-trang-khu.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **E11 (ho-so-da-ky.mjs) vẫn tiêm `throw` TẠI CHỖ vào tệp kiem .dom.tsx của cây đang chấm — cùng lớp lỗi S4 vòng 1 đã sửa ở hai-chieu.mjs nhưng chưa sửa ở đây**
  Người dùng thấy gì: Khi chạy thử kiểm tra hồ sơ đã ký, một dòng lỗi cố ý có thể làm các bài kiểm chạy song song đỏ oan, hoặc bị kẹt lại nếu tiến trình bị giết giữa chừng. Việc này chỉ gây nhiễu cho người chấm, người dùng cuối không bị ảnh hưởng.
  file: `_acceptance/dieu-huong-khu-muc-tieu/rang/ho-so-da-ky.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình, vế a): đối chứng dương chạy trên cây thật, còn đột biến chạy trên một worktree tạm chưa bao giờ được chứng minh là xanh**
  Người dùng thấy gì: Phép kiểm tự thử của vòng này chưa chứng minh được bản sao thử là sạch trước khi cố ý làm hỏng, nên một số kết luận đỏ có thể không đáng tin hoàn toàn. Tính năng người dùng thấy không đổi.
  file: `_acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình, vế b): chiều đỏ của AC-9 chỉ so mã thoát, không ghim thông điệp «dhk-pha-ho-so»**
  Người dùng thấy gì: Phép kiểm tự thử cho hồ sơ đã ký có thể coi một lệnh chết vì lý do khác là đã bắt đúng lỗi cố ý. Chỉ giảm độ tin của bằng chứng, người dùng cuối không bị ảnh hưởng.
  file: `_acceptance/dieu-huong-khu-muc-tieu/rang/ho-so-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **Thêm chú thích vào mã, trái luật «Never add code comments» của AGENTS.md (r1 · tệp đã đổi)**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng cuối. Đây chỉ là chú thích thừa trong mã, trái quy ước của kho, và có thể dọn sau.
  file: `apps/app/app/(app)/[slug]/okr/hanh-dong-khu.tsx`
  severity: medium
  Đề xuất: known-limits

- **Tên đơn vị (dữ liệu người nhập) ghép vào câu lý do bằng .replace, không đánh dấu translate="no" (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng bật dịch tự động của trình duyệt có thể thấy tên bộ phận hoặc phòng ban trong dòng «bạn không thêm mục tiêu được» bị dịch sai. Các chỗ khác trong khu Mục tiêu đã giữ nguyên tên.
  file: `apps/app/app/(app)/[slug]/okr/hanh-dong-khu.tsx`
  severity: medium
  Đề xuất: known-limits

- **tieuDeTrinhDuyet nới kiểu thành `TabOkr | string` rồi ép lại `as TabOkr` (r1)**
  Người dùng thấy gì: Hiện người dùng không thấy lỗi nào. Nếu sau này thêm một trang có tên trùng tên thẻ, tiêu đề tab trình duyệt có thể hiện sai mà không ai được báo.
  file: `apps/app/app/(app)/[slug]/okr/tieu-de-khu.ts`
  severity: low
  Đề xuất: known-limits

- **NutThemMucTieu thành mã chết sau khi nút rời khỏi thân Theo đơn vị (r1)**
  Người dùng thấy gì: Người dùng không thấy khác biệt. Trong mã còn một nút «Thêm mục tiêu» cũ không còn chạy thật, và một bài kiểm vẫn đo bản cũ đó thay vì bản đang dùng.
  file: `apps/app/app/(app)/[slug]/okr/ngan-okr-url.tsx`
  severity: low
  Đề xuất: known-limits

- **Probe AC-5 «server rejects a member creating an objective» is always green: the input is wrong for the schema, so 400 is counted as a refusal (r1)**
  Người dùng thấy gì: Phép thử «máy chủ từ chối thành viên tạo mục tiêu» luôn báo xanh dù máy chủ có chặn thật hay không. Do đó chưa có bằng chứng thật rằng thành viên không đủ quyền bị chặn ở phía máy chủ.
  file: `_acceptance/dieu-huong-khu-muc-tieu/rang/man-dau-trang.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình) + 2 (fixture viết tay): E15 «máy chủ từ chối» xanh với bất kỳ lỗi 400 nào, payload không qua được schema thật (r1)**
  Người dùng thấy gì: Phép thử xác nhận máy chủ từ chối người không đủ quyền xanh cả khi lời gọi sai khuôn, nên chưa chứng minh được người không đủ quyền thật sự bị chặn khi tạo mục tiêu.
  file: `_acceptance/dieu-huong-khu-muc-tieu/rang/man-dau-trang.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ) + 4 (thông điệp ghim không rút từ đầu ra): E16 đọc đơn vị của previewImport (r1)**
  Người dùng thấy gì: Phép thử kiểm hộp nhập bảng tính có gửi đúng đơn vị còn lỏng, nên một lỗi làm xem trước nhập gửi nhầm đơn vị có thể lọt qua mà không bị báo.
  file: `_acceptance/dieu-huong-khu-muc-tieu/rang/man-dau-trang.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): dhk-don-dich chỉ kiểm khoá URL, không kiểm ngăn tạo mở cũng như thủ tục được gửi (r1)**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận đường dẫn đúng, chưa xác nhận ngăn thêm mục tiêu mở ra cho đúng đơn vị. Một lỗi ở bước mở ngăn có thể không bị phát hiện.
  file: `Users/manhphan/dev/crm-onehub/apps/app/test/okr-dau-trang-khu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (thước không gắn vật): trục «đang tải = khung chờ Suspense» của dhk-tieu-de / dhk-dang-tai không bao giờ dựng khung chờ Suspense (r1)**
  Người dùng thấy gì: Bài kiểm tiêu đề lúc đang tải không chạm khung chờ thật của trang. Nếu ai đổi tiêu đề ở khung chờ đó, người dùng có thể thấy tiêu đề nhảy khi tải mà bài kiểm vẫn xanh.
  file: `Users/manhphan/dev/crm-onehub/apps/app/test/okr-dau-trang-khu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình): chiều đỏ của ho-so-da-ky chỉ so mã thoát, không ghim thông điệp tiêm (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép thử «hồ sơ đã ký phát hiện được lỗi» có thể báo đỏ vì lý do khác lỗi đã cố ý tiêm, nên màu đỏ đó chưa chắc chứng minh đúng điều nó khẳng định.
  file: `_acceptance/dieu-huong-khu-muc-tieu/rang/ho-so-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm-tính-một-mình): theo-don-vi-truong-thay-nut giờ chỉ assert vắng mặt ở cả hai vai (r1)**
  Người dùng thấy gì: Bài kiểm xác nhận thân trang Theo đơn vị không còn nút tạo, nhưng không chắc trang đã dựng xong, nên một lần dựng hỏng cũng vẫn báo xanh.
  file: `Users/manhphan/dev/crm-onehub/apps/app/test/okr-theo-don-vi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): soan-okr-song-lai đo dây cờ cauNoi bằng regex trên mã nguồn (r1)**
  Người dùng thấy gì: Bài kiểm đọc chữ trong mã thay vì chạy thật, nên có thể không phát hiện nút «Soạn OKR cùng Kara» nhận sai trạng thái cấu hình. Chưa thấy sự cố nào thực tế.
  file: `Users/manhphan/dev/crm-onehub/apps/app/test/soan-okr-song-lai.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (số ô khai không bằng số assert): dhk-dang-tai in «x/5 o dat» trong khi chỉ có 4 phép kiểm (r1)**
  Người dùng thấy gì: Báo cáo kiểm thử ghi «5/5 ô đạt» trong khi thực tế chỉ có 4 phép kiểm. Người dùng sản phẩm không bị ảnh hưởng, chỉ con số báo cáo bị lệch.
  file: `Users/manhphan/dev/crm-onehub/apps/app/test/okr-dau-trang-khu.dom.tsx`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Không có.

⚠ Cụm ngoài vùng phủ: 2/5 lỗi rơi vào file không bộ đo nào phủ (_acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
