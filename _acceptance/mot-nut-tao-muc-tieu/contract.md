---
schema_version: 1
feature: "Trưởng đơn vị bấm Thêm mục tiêu và chọn một đường trong một hộp: tự viết, từ mẫu, từ bảng tính hay soạn cùng Kara; ở Báo cáo không có nút tạo nào"
slug: mot-nut-tao-muc-tieu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
approved_by: Phan Le Manh
approved_at: 2026-10-21T07:42:33Z
design_doc: docs/superpowers/specs/2026-10-21-mot-nut-tao-muc-tieu-design.md
---

# Acceptance Contract: mot-nut-tao-muc-tieu

## Context

Sau VK2, đầu trang của Của tôi, Bộ OKR, Lấy ý kiến và Sức khoẻ cùng dựng một hàng nút: «Hỏi Kara» · «…» (chỉ
chứa «Nhập từ bảng tính») · nhóm «Soạn OKR cùng Kara» (pha lập kế hoạch) · «Thêm mục tiêu» (nút chính); thêm
«Bắt đầu từ mẫu» nằm trong ngăn tạo mục tiêu. Nút chính hiện cả trên hai màn chỉ đọc. Vòng này gom bốn đường tạo
vào một hộp mở từ một nút «Thêm mục tiêu», và chỉ Của tôi và Bộ OKR có nút đó. Không đổi API.

«Đơn vị đích» là đơn vị nút nhắm tới: đơn vị Bộ OKR đang xem; ở Của tôi là đơn vị `donDich`
(`okr/don-dich.ts`) chọn, như hôm nay. «Máy tính» là khổ từ 768px. Đo màn trên phiên đo riêng của cây, dữ liệu
mẫu (`bun run db:seed`, bộ OKR mẫu khi cần), tiếng Việt, 1280×800 và 375×812.

## Criteria

- AC-1: Given người sửa được đơn vị đích mở Của tôi hoặc Bộ OKR ở máy tính, ở bất kỳ pha nào của chu kỳ, When đầu trang dựng xong, Then hàng nút đầu trang (`[data-hang-hanh-dong]`) chứa đúng một nút chính — «Thêm mục tiêu» (`data-nut="them-muc-tieu"`), đứng cuối hàng — và ngoài nó chỉ còn «Hỏi Kara» khi màn có nút đó; không còn nút «…» (`data-nut="them-cach"`), mục «Nhập từ bảng tính», nhóm Soạn (`[data-nhom-soan]`) hay nút «i» của Soạn. Trong lúc quyền còn tải, chỗ của «Thêm mục tiêu» là khung chờ, không phải nút bấm được.
- AC-2: Given bất kỳ vai nào mở Lấy ý kiến, Sức khoẻ, Sơ đồ hoặc sơ đồ quanh một mục tiêu, When đầu trang dựng xong, Then đầu trang không có nút chính nào và không có nút tạo nào (`them-muc-tieu`, `them-cach`, `nhap-bang-tinh`, `[data-nhom-soan]`), kể cả trong lúc quyền còn tải (không khung chờ ở chỗ nút chính cũ); nút trong thân trang (mở lượt Lấy ý kiến, Xuất kỳ) giữ nguyên.
- AC-3: Given người sửa được đơn vị đích ở Của tôi hoặc Bộ OKR, When bấm «Thêm mục tiêu», Then một hộp thoại mở với tiêu đề «Thêm mục tiêu» và một câu gọi tên đơn vị đích, liệt đúng bốn đường theo thứ tự Tự viết · Từ mẫu · Từ bảng tính · Soạn cùng Kara, mỗi đường là một nút trọn dòng có tiêu đề và một câu mô tả, dòng Soạn cùng Kara mang dấu Kara; hộp mở ghi trên đường dẫn nên tải lại vẫn mở; Esc hay nút đóng đóng hộp, gỡ tham số và đưa focus về «Thêm mục tiêu»; mọi chữ mới có ở cả tiếng Việt và tiếng Anh.
- AC-4 (cross-layer): Given hộp đang mở, When chọn «Tự viết», Then hộp chọn đóng và ngăn tạo mục tiêu mở cho đúng đơn vị đích (từ Của tôi: sang Bộ OKR của đơn vị đó với ngăn mở); ngăn không còn nút «Bắt đầu từ mẫu»; điền tên và lưu thì `okr.createObjective` được gọi với đơn vị và chu kỳ đích, và sau khi tải lại mục tiêu mới nằm trong Bộ OKR của đơn vị đó.
- AC-5 (cross-layer): Given hộp đang mở và cấp của đơn vị đích có mẫu OKR, When chọn «Từ mẫu», Then ngăn mở thẳng ở bước chọn mẫu của cấp đó (từ Của tôi: sang Bộ OKR của đơn vị đó với ngăn ở bước chọn mẫu); chọn một mẫu rồi lưu thì `okr.taoTuMau` được gọi với đơn vị và chu kỳ đích; bước mẫu chỉ còn lối quay lại «Chọn mẫu khác» (không còn «Viết mục tiêu tay»). Khi cấp của đơn vị đích chưa có mẫu, dòng «Từ mẫu» khoá (`aria-disabled`) và câu mô tả của nó nói chưa có mẫu cho cấp này.
- AC-6 (cross-layer): Given hộp đang mở, When chọn «Từ bảng tính», Then hộp chọn đóng và hộp nhập OKR mở với chu kỳ và đơn vị đích điền sẵn (từ Của tôi: sang Bộ OKR của đơn vị đó với hộp nhập mở); dán lô rồi xem trước gọi `okr.previewImport`, ghi gọi `okr.applyImport`, như hôm nay.
- AC-7 (cross-layer): Given hộp đang mở ở pha lập kế hoạch và Kara mở được cho đơn vị đích, When chọn «Soạn cùng Kara», Then `okr.soanMo` được gọi và cuộc soạn mở trong khung bản ghi; khi đơn vị đã có cuộc đang mở, dòng đọc «Tiếp cuộc đang soạn» và chọn nó mở lại đúng cuộc đó, không mở cuộc mới. Khi chu kỳ không ở pha lập kế hoạch, hoặc hết cuộc, hết trần tháng, Kara chưa bật cho đơn vị, chưa cấu hình, hay người không có quyền soạn, dòng khoá (`aria-disabled`) và câu mô tả là câu lý do của khoá đó.
- AC-8: Given người không sửa được đơn vị đích (thành viên thường, người không dẫn đơn vị nào), When mở Của tôi hoặc Bộ OKR, Then «Thêm mục tiêu» khoá kèm dòng lý do như hôm nay; mở thẳng đường dẫn có tham số hộp chọn hay tham số của một đường thì không hộp nào mở, tham số bị gỡ khỏi đường dẫn và không thủ tục ghi nào được gọi.
- AC-9: Given điện thoại 375×812 và máy tính 1280×800, When trưởng đơn vị bấm «Thêm mục tiêu» ở Của tôi và ở Bộ OKR, Then hộp vừa màn, bốn dòng đọc trọn không bị cắt chữ, mỗi dòng bấm được ở mọi điểm trên dòng, trang không tràn ngang; đầu trang Sức khoẻ không có nút chính; kèm ảnh cho người xem.

## Coverage

Quét bằng morphological-scan (preset entity-feature, thực thể «lối tạo mục tiêu»), bốn trục:

- Trục màn: Của tôi | Bộ OKR | Lấy ý kiến | Sức khoẻ | Sơ đồ (gồm sơ đồ quanh một mục tiêu) [thước CE: `DUONG_MUC` của `okr/tab-okr.ts` — SUY-TỪ-REPO]
- Trục đường tạo: tự viết | từ mẫu | từ bảng tính | soạn cùng Kara | mang sang (pha chấm điểm) [thước CE: kiểm kê mọi lối gọi `okr.createObjective`, `okr.taoTuMau`, `okr.applyImport`, `okr.soanMo`, `okr.mangSang` trong `apps/app` — SUY-TỪ-REPO; chân ngành: Tability, một nút mở hộp chọn đường — NGÀNH: Tability, ghi ở `vi_sao` hàng VK9 `docs/plan/lo-trinh-okr.json`]
- Trục trạng thái của người và đường: được | khoá vì quyền | khoá vì điều kiện đường (chưa có mẫu; ngoài pha, hết cuộc, hết trần, chưa bật, chưa cấu hình) | đang có cuộc soạn | quyền đang tải [thước CE: `useQuyenKhu` (`okr/hanh-dong-khu.tsx`) và các dạng khoá của `NutSoan` (`okr/soan/nut-soan.tsx`) — SUY-TỪ-REPO]
- Trục khổ: máy tính ≥768 | điện thoại <768 [thước CE: luật khổ của `docs/design.md` — SUY-TỪ-REPO]
- Cắt ngang: đường dẫn giữ hộp (AC-3), chữ hai thứ tiếng (AC-3), không đổi API (AC-4–AC-7 bám thủ tục sẵn có).

Core: đầu trang hai màn tạo (AC-1) · đầu trang màn chỉ đọc (AC-2) · hộp chọn (AC-3) · bốn đường (AC-4–AC-7, gồm ca khoá của từ mẫu và soạn) · quyền (AC-8) · khổ (AC-9).

Later: nút trên trang riêng của từng bộ OKR (VK3) · chế độ Soạn cả bộ thay đường Soạn cùng Kara (VK10) · thêm KR từ hộp.

Never: menu xổ thay hộp — câu giao nói «trong một hộp» · mang sang trong hộp — đó là việc của pha chấm điểm, không phải lối tạo đầu kỳ · nút tạo ở Báo cáo.

## Đường đo

Ngưỡng của `opportunity.md`: «Đầu trang khu chỉ còn một nút chính, chỉ ở Của tôi và Bộ OKR».

- Số nút chính ở đầu trang từng màn: bài DOM dựng đầu trang của năm màn và đếm (AC-1, AC-2); bàn đo màn đếm lại trên bản chạy, mỗi màn một dòng `NUT CHINH <màn> <số>` — AC-2, AC-9.

## Out of scope

- Trang riêng cho từng bộ OKR và thẻ con của nó (VK3); khi có, trang bộ mang nút như Bộ OKR hôm nay.
- Chế độ Soạn cả bộ OKR (VK10); vòng này đường «Soạn cùng Kara» mở cuộc soạn hiện có.
- «Mang sang» ở màn chấm điểm giữ nguyên chỗ.
- Nút trong thân trang (mở lượt Lấy ý kiến, Xuất kỳ, «Mở cuộc mới» trong khung soạn) không đổi.
- Không thủ tục API nào đổi; không thêm KR từ hộp.

## Notes

- 11 hồ sơ đã ký có thước đọc hàng nút cũ hay bấm đường cũ (danh sách ở design doc, mục «Rủi ro đã thấy»); cách xử lý là câu Hỏi-1 ở Cổng Phạm vi.
- AC-5 và AC-7 viết theo khuyến nghị của Hỏi-3 (đường không đi được hiện khoá kèm lý do). Chủ kho chọn ẩn thì câu «dòng khoá…» của hai AC đổi thành «dòng không hiện», E9 ô (b) và E13 ô (3)–(8) đổi theo, trước khi duyệt.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-22:
  - Ngoài-1: khi người không có quyền mở thẳng đường dẫn tạo mục tiêu, bài kiểm chỉ chứng minh hộp không mở, chưa bắt được nếu sau này có lần ghi dữ liệu lọt qua.
  - Ngoài-2: nếu sau này có nút tạo lọt lại vào đầu trang Sơ đồ hay sơ đồ quanh mục tiêu qua một thành phần dựng ở trình duyệt, bài kiểm có thể không phát hiện.
  - Ngoài-4: trong mã còn nút Soạn cũ không hiện ở màn nào, nên hai bản logic soạn có thể lệch nhau về sau.
  - Ngoài-5: mở liên kết cũ dẫn thẳng vào bước chọn mẫu cho đơn vị chưa có mẫu thì thấy hộp trống và chỉ còn cách đóng lại.
  - Ngoài-6: lúc danh sách mẫu còn đang tải hoặc tải lỗi, dòng «Từ mẫu» có thể báo sai là chưa có mẫu cho cấp này.
  - Ngoài-7: người chỉ được xem có thể mở liên kết để thấy danh sách cuộc soạn của đơn vị dù không có quyền soạn.
  - Ngoài-8: dòng bị khoá trong hộp «Thêm mục tiêu» bị làm mờ nên câu lý do khoá hơi khó đọc, nhất là với người nhìn kém.
  - Ngoài-10: hiếm khi, bấm «Soạn cùng Kara» đúng lúc vừa hết lượt thì hộp đóng mà không báo vì sao.
  - Ngoài-11: mở lại liên kết đang ở bước chọn mẫu khi đơn vị không còn mẫu thì ngăn chỉ còn danh sách trống và nút Huỷ.
  - Ngoài-12: dòng bị khoá trong hộp có thể vẫn đổi nền khi rê chuột như bấm được, và bài kiểm hiện tại không bắt lỗi này.
  - Ngoài-13: bàn đo màn không phát hiện nếu một lần bấm lưu sinh ra hai mục tiêu trùng tên.
