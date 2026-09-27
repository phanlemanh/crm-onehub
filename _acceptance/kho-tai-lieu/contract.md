---
schema_version: 1
feature: Kho tài liệu lượt 1 — nhân viên viết trang bằng trình soạn kiểu Word, gửi chủ trang duyệt trên diff kiểu Track Changes, cả công ty đọc bản đang dùng
slug: kho-tai-lieu
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: draft
design_doc: docs/superpowers/specs/2026-09-27-kho-tai-lieu-design.md
approved_by:
approved_at:
---

# Acceptance Contract: kho-tai-lieu

## Context

Quy định, chính sách, quy trình và biểu mẫu nội bộ của OneHub đang nằm rải trong Word và
nhóm Zalo. Lượt 1 của `docs/plan/lo-trinh-kho-tai-lieu.md` cho nhân viên — dân văn phòng quen
Word và Google Docs — viết trang ngay trong CRM bằng trình soạn không cú pháp, gửi chủ trang
duyệt trên diff kiểu Track Changes, và cả công ty đọc bản đang dùng. Mọi thay đổi qua duyệt
(chốt 2026-09-26). Kho lưu markdown qua một bộ tuần tự hoá duy nhất để lượt 2 (máy soạn),
lượt 3 (tìm) và lượt 4 (trợ lý AI) dùng lại.

Source input: câu người dùng và phạm vi lượt 1 ở `docs/plan/lo-trinh-kho-tai-lieu.md` mục 3–4
(chốt 2026-09-27), quyết định trình soạn giàu và diff Track Changes của chủ kho trong phiên
2026-09-27, bản mẫu `/proto/kho-tai-lieu`, nghiên cứu `docs/plan/kho-tai-lieu-nghien-cuu.md`
mục 4 và 5.3, từ điển `CONTEXT.md` (tám mục Kho tài liệu, chốt tại Cổng 1 này).

## Criteria

- AC-1: Given cơ sở dữ liệu với dữ liệu hiện có, When chạy `migration` của lượt này, Then mọi câu lệnh chỉ tạo bảng, chỉ mục, khoá ngoại mới hoặc extension (`unaccent`, `pg_trgm`), không lệnh nào sửa hay xoá bảng đã có; And áp được trên kho test mới tinh và trên bản sao có dữ liệu.
- AC-2: Given một thành viên bất kỳ (kể cả vai `okr`), When tạo trang với tên, loại trang, đơn vị tuỳ chọn, chủ trang và nội dung, Then trang tồn tại với slug sinh từ tên (bỏ dấu, `đ` thành `d`, chữ thường, gạch nối, hậu tố `-2` khi trùng) và chưa có bản đang dùng; And một bản đề xuất chờ duyệt mang đúng nội dung đã chuẩn NFC; And tên trống hoặc dài quá 160 ký tự bị từ chối với câu lỗi dưới ô, không ghi gì. (cross-layer)
- AC-3: Given ma trận viết trước gồm sáu người (người tạo, chủ trang, `owner`, `admin`, thành viên khác, vai `okr`) × năm trạng thái trang (chưa từng duyệt có bản chờ · chưa từng duyệt có bản bị trả lại · đang dùng · đang dùng có bản chờ · đang dùng có bản bị trả lại), When mỗi người gọi `list`, `get`, `proposals`, `proposal`, Then chỉ người tạo và người duyệt được thấy bản đề xuất và trang chưa từng duyệt; And với mọi người khác, `get` và `proposal` trả `NOT_FOUND` giống hệt slug hay id không tồn tại, `list` và số đếm không nhắc tới; And bản đang dùng đọc được với mọi người trong workspace. (cross-layer)
- AC-4: Given một bản đề xuất chờ duyệt, When người duyệt được bấm «Duyệt» với `diffHash` khớp, Then trong cùng một lần ghi: một phiên bản bất biến mới được tạo với số tăng 1, con trỏ bản đang dùng trỏ tới nó, đề xuất thành «đã duyệt», một sự kiện được ghi; And mọi thành viên đọc được nội dung mới với dòng «Phiên bản N · duyệt dd/mm/yyyy»; And không có thủ tục nào sửa hay gỡ phiên bản hay sự kiện. (cross-layer)
- AC-5: Given một bản đề xuất, When từng người gọi `approve`, Then chủ trang (kể cả với bản do chính mình tạo), `owner` và `admin` duyệt được; And người tạo không phải chủ trang, thành viên khác và vai `okr` nhận `FORBIDDEN` và không có gì đổi; And màn duyệt của người không duyệt được không có nút «Duyệt». (cross-layer)
- AC-6: Given một bản đề xuất đang mở trên màn duyệt, When bản đang dùng đã đổi sau khi đề xuất được tạo, hoặc `diffHash` gửi lên khác diff máy chủ tính lại, Then `approve` bị từ chối và không phiên bản nào được tạo; And đề xuất có bản gốc khác bản đang dùng hiện «Bản đề xuất này đã cũ» với nút «Duyệt» khoá; And khi một đề xuất được duyệt, mọi đề xuất chờ khác cùng bản gốc chuyển «cũ» trong cùng lần ghi đó. (cross-layer)
- AC-7: Given một bản đề xuất chờ duyệt, When người duyệt được bấm «Trả lại», Then lý do 1–500 ký tự là bắt buộc (trống → câu lỗi dưới ô, không ghi gì); And đề xuất thành «trả lại» kèm lý do mà người tạo đọc được; And bản đang dùng không đổi và không phiên bản nào được tạo. (cross-layer)
- AC-8: Given một trang đang dùng, When một thành viên bấm «Sửa trang», sửa và «Gửi duyệt», Then trình soạn mở sẵn đúng bản đang dùng; And một đề xuất mới có bản gốc là bản đang dùng; And bản đang dùng không đổi tới khi được duyệt; And người thấy đề xuất đó thấy nhãn «Có 1 bản chờ duyệt» trên trang, người khác không thấy. (cross-layer)
- AC-9: Given màn soạn, When người dùng dùng thanh công cụ và phím tắt, Then tạo được tiêu đề cấp 2 và 3, đậm, nghiêng, danh sách có số và không số, bảng, liên kết mà không gõ ký tự cú pháp nào; And gõ «1. » hay «- » đầu dòng ra danh sách; And không nút nào tạo được ảnh, màu hay cỡ chữ; And rời màn khi có thay đổi chưa gửi thì được hỏi lại; And mọi nút biểu tượng có nhãn cho trình đọc màn hình.
- AC-10: Given ma trận viết trước các văn bản mẫu phủ mọi loại nút cho phép (tiêu đề, đoạn, đậm, nghiêng, hai loại danh sách, danh sách lồng, bảng, liên kết, chữ có dấu tổ hợp NFD), When nạp vào trình soạn rồi tuần tự hoá ra markdown, và lặp lại lần hai, Then lần hai y hệt lần một từng byte cho mọi mẫu; And mở một trang rồi không sửa gì thì nút «Gửi duyệt» khoá với chữ «Chưa có thay đổi» và máy chủ từ chối một đề xuất có nội dung trùng bản gốc. (cross-layer)
- AC-11: Given HTML clipboard thật chép từ Word và từ Google Docs (tệp mẫu lưu trong hồ sơ, mỗi nguồn có tiêu đề, danh sách hai cấp, bảng, chữ đậm, liên kết, chữ màu và font riêng), When dán vào trình soạn và lưu, Then markdown giữ tiêu đề, danh sách, bảng, đậm, liên kết; And không còn màu, font, lớp `Mso*`, thẻ `o:p` hay style nào.
- AC-12: Given Chrome thật với bộ gõ tiếng Việt kiểu Telex mô phỏng bằng sự kiện composition, When gõ «Quy định về hoa hồng đối tác», nhấn Enter khi đang gõ dở một từ, rồi gõ tiếp một danh sách, Then văn bản trong trình soạn và markdown lưu ra đúng từng ký tự (không mất, không nhân đôi dấu), chuẩn NFC.
- AC-13: Given một đề xuất sửa một trang đang dùng (thêm một câu, bỏ một câu, đổi «48 giờ» thành «24 giờ»), When người duyệt mở màn duyệt, Then trang hiện ở dạng đã trình bày (không ký hiệu `+`/`−`, không chữ đơn cách), chữ thêm nằm trong `ins` có nền, chữ bỏ nằm trong `del` gạch ngang, mỗi đoạn có nhãn cho trình đọc màn hình «Thêm:»/«Bỏ:»; And dải «Con số và ngày bị đổi» liệt kê «48 giờ → 24 giờ»; And `diffHash` client tính trên cùng hai bản bằng đúng giá trị máy chủ tính. (cross-layer)
- AC-14: Given thành viên đăng nhập, When mở mục «Tài liệu» trên thanh biểu tượng, Then thấy danh sách trang lọc theo bốn loại trang có số đếm, trạng thái kho rỗng có nút «Viết trang đầu tiên», và tab «Chờ duyệt» với số đếm đúng bằng số đề xuất người đó duyệt được; And màn đọc có mục lục, chủ trang, «Phiên bản N · duyệt dd/mm/yyyy»; And bố cục dùng được ở khổ 390 và 1440. (judgment)
- AC-15: Given một đề xuất vừa được duyệt có liên kết tới trang khác, When lần ghi của thao tác duyệt xong, Then bảng liên kết của trang được thay trọn bằng liên kết rút từ bản vừa duyệt; And cột tìm kiếm của trang chứa từ của tên và nội dung ở dạng bỏ dấu; And một đề xuất bị trả lại hay đang chờ không để lại liên kết hay từ tìm kiếm nào. (cross-layer)

## Coverage

Quét bằng `morphological-scan` ở phiên 2026-09-27 (bản ghi ở `docs/plan/lo-trinh-kho-tai-lieu.md`
mục 4–7), cắt về lượt 1.

- Trục A — vòng đời trang: tạo (AC-2) · đề xuất sửa (AC-8) · duyệt (AC-4, AC-6) · trả lại (AC-7) · đọc (AC-3, AC-14) · lưu trữ, lịch sử, khôi phục (dời lượt 3) · xác minh định kỳ (để sau). [thước CE: 15 trạng thái bản mẫu `apps/app/app/proto/catalog.ts` và mục 4–8 của `kho-tai-lieu-nghien-cuu.md`]
- Trục B — người: người tạo · chủ trang · quản trị (`owner`, `admin`) · thành viên khác · vai `okr` (ma trận AC-3, AC-5). [thước CE: `packages/validation/src/vai-workspace.ts`]
- Trục C — bề mặt người dùng quen: gõ như Word (AC-9) · dán từ Word/Google Docs (AC-11) · bộ gõ tiếng Việt (AC-12) · duyệt như Track Changes (AC-13). [thước CE: Word, Google Docs, Notion — thói quen người dùng do chủ kho nêu 2026-09-27; nghiên cứu mục 5.3 về khứ hồi và bộ gõ]
- Trục D — tính toàn vẹn của bản ghi: không rò (AC-3) · so-và-đặt (AC-6) · khứ hồi ổn định (AC-10) · bất biến và chỉ ghi thêm (AC-4) · dữ liệu cho lượt sau (AC-15) · `migration` chỉ thêm (AC-1).
- [GIẢ ĐỊNH] Sự kiện composition mô phỏng trong Chrome đủ đại diện cho Unikey/EVKey thật; phép đo AC-12 không chạy bộ gõ thật của hệ điều hành. Người duyệt gõ thử một lần bằng Unikey ở Cổng Bằng chứng.

## Đường đo

- Thước: trung vị thời gian từ đề xuất tới duyệt · số từ: `TaiLieuDeXuat.taoLuc` và `xuLyLuc` · bảo đảm bởi: AC-4
- Thước: trang đã duyệt theo đơn vị · số từ: `TaiLieuTrang.banDangDungId`, `departmentId` · bảo đảm bởi: AC-2, AC-4
- Thước: câu hỏi được trả lời có trích · số từ: nhật ký hỏi của lượt 4 · bảo đảm bởi: chưa có — lượt 4

## Out of scope

- Lịch sử phiên bản, khôi phục, lưu trữ trang — dời lượt 3 (van của lộ trình mục 2).
- Tìm kiếm, ⌘K, backlink, chèn liên kết tới trang trong trình soạn — lượt 3; lượt này chỉ ghi sẵn cột tìm và bảng liên kết.
- Phạm vi xem theo trang, phó chủ trang, thang leo, bậc 2 — lượt `chu-trang-va-pham-vi`.
- Nhắc duyệt (Slack, Zalo, email) — lượt 3 lấy dòng nhắc sáng.
- Ảnh, màu, cỡ chữ, hộp ghi chú, wikilink trong trang; xuất Markdown hay PDF.
- Đổi chủ trang sau khi tạo; đổi loại trang hay đơn vị của trang đang dùng.
- Mọi AI: nạp nguồn và máy soạn (lượt 2), trợ lý đọc kho (lượt 4).
- Trang «quy tắc viết» và nội dung thật của kho — việc của chủ kho.

## Notes

- Trình soạn Tiptap 3 và `prosemirror-changeset`, đều MIT, là phụ thuộc mới của `packages/ui`; tra ReUI trước khi thêm theo `docs/design.md`.
- Router `taiLieu` ở phạm vi chung: danh sách thủ tục ghim của `apps/api/test/vai-chi-okr.spec.ts` sửa có ý thức.
- Nền hạ tầng đỏ lúc mở vòng (`duong-nen.md`): 4 test `apps/api` đỏ sẵn trên `onehub`, không phải lỗi của vòng; sửa trong nhánh trước S3.
- Ngưỡng Cổng Đáng của cả sản phẩm (đo lúc chạy thật, `lo-trinh-kho-tai-lieu.md` mục 5): mỗi phòng ban tham gia ≥ 10 trang đã duyệt; ≥ 70% câu hỏi được trả lời có trích; trung vị thời gian duyệt ≤ 5 ngày làm việc.
- Từ điển: «loại trang» (Quy định · Chính sách · Quy trình · Biểu mẫu) thay cho «nhóm», vì «nhóm» là chữ tránh của Bộ phận; «quản trị» thay cho «admin» ở lời, mã vai giữ `owner`, `admin`. «Chờ duyệt» dùng theo nghĩa của mục Bản đề xuất («chờ chủ trang duyệt»), không phải nghĩa lời mời vào workspace — cảnh báo W6 của lint cho chữ này và cho «trạng thái» là trùng chữ khác nghĩa, giữ nguyên.
