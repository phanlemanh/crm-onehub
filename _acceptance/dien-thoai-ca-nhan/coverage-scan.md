# Quét độ phủ — dien-thoai-ca-nhan (preset entity-feature)

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub (bản rẽ của `trycompai/crm`), sale VN dùng hằng ngày.
- Chân sản phẩm: kho chưa có mục `## Product Context` → đào kho:
  `[SUY-TỪ-REPO: packages/db/prisma/schema.prisma]` (`Contact.phone String?`, không ràng buộc duy nhất),
  `[SUY-TỪ-REPO: apps/api/src/contacts/contacts.service.ts]` (chống trùng theo email),
  `[SUY-TỪ-REPO: apps/api/src/listings/listing-ingest.service.ts]` (người nạp từ listing chỉ có số, lưu thô),
  `[SUY-TỪ-REPO: apps/agent/agent/skills/data-boundaries.md]` (số điện thoại không ra khỏi CRM qua kênh ngoài).
- Chân ngành: `[NGÀNH: ITU-T E.164]` (dạng số quốc tế `+<mã nước><số quốc nội>` — dạng lưu chuẩn);
  `[NGÀNH: Google libphonenumber]` (thư viện chuẩn hoá/định dạng số mà các CRM lớn dùng — tách «dạng lưu»
  khỏi «dạng hiện»); `[NGÀNH: quy hoạch kho số VN — di động 10 chữ số từ 2018, cố định mã vùng 02x từ 2017]`
  (⏱ verify-current: chỉ dùng để chọn độ dài số quốc nội 9–10 chữ số sau số 0 đầu).

## Trục

- **Thao tác**: tạo · sửa · hiện · tìm · chống trùng   [thước CE: vòng đời entity của preset — nhập/sửa/trùng/tìm; xuất không có ở kho này]
- **Mặt**: form thêm ở tab Cá nhân của công ty · sheet «Cá nhân mới» · ngăn chi tiết cá nhân · bảng Cá nhân · ⌘K · Kara trong app · ô chọn môi giới   [thước CE: grep mọi chỗ gọi `contacts.create`/`contacts.list`/tìm cá nhân trong `apps/` — `[SUY-TỪ-REPO]`, soát 09/10]
- **Dạng số đầu vào**: `0` + 9–10 chữ số · `+84…` · `84…` không dấu cộng · có ngăn cách (cách, chấm, gạch, ngoặc) · số nước ngoài `+<mã>` · sai (chữ, quá ngắn, quá dài) · rỗng · dữ liệu cũ lưu thô   [thước CE: `[NGÀNH: E.164]` + quy hoạch số VN]

## Core

1. Tạo × (form tab công ty, sheet Cá nhân mới) × mọi dạng → lưu dạng chuẩn `+84…`, sai thì chặn tại chỗ, rỗng vẫn tạo được.
2. Sửa × ngăn chi tiết × mọi dạng → chuẩn hoá như lúc tạo.
3. Chống trùng × (tạo, sửa) × hai dạng của cùng một số, kể cả số cũ lưu thô → chặn; người đã lưu trữ và chính mình không tính.
4. Hiện × (bảng Cá nhân — cột mới, ngăn chi tiết) → dạng quốc nội `0901 234 567`; số nước ngoài giữ `+`.
5. Tìm × (bảng Cá nhân, ⌘K, Kara trong app, ô chọn môi giới) × (`0…`, `+84…`, mảnh số, số cũ lưu thô) → ra đúng người.
6. Kara trong app tìm được theo số nhưng không trả số trong kết quả (biên dữ liệu).

## Later

- Số ở thoả thuận và tab Cá nhân của công ty — hàng DT2 `dien-thoai-o-deal-cong-ty` (trùng tệp với K4b, V2, E4).
- Form web chỉ có số điện thoại thành cá nhân — đường T3 tracking, hàng riêng.
- Gộp những người đã trùng số trong dữ liệu hiện có — bẫy «merge duplicate» của preset; vòng này chỉ chặn trùng MỚI.
- Nhiều số cho một người (di động / bàn) `[NGÀNH: libphonenumber phân loại số]` — chưa có nhu cầu đo được.
- Chuẩn hoá số khi nạp từ listing — tìm và chống trùng đã đọc được số thô nên không cần cho vòng này.
- Thông điệp lỗi trùng bằng tiếng Việt — API của kho trả câu tiếng Anh cho mọi lỗi (trùng email cũng vậy); cần một cơ chế chung.

## Never

- Bắt buộc nhập số — người đến từ hộp thư/tra cứu chỉ có email, bắt buộc là chặn họ.
- Kara qua Zalo/Slack nói số điện thoại — luật dữ liệu cố ý.
- Ràng buộc duy nhất ở cơ sở dữ liệu — cần migration (đường T3) và đụng dữ liệu cũ đã trùng; chặn ở tầng ứng dụng.

## Cross-cutting áp mọi ô Core

- Dữ liệu cá nhân: không thêm trường mới, chỉ dùng `Contact.phone` có sẵn; không lộ số qua kênh ngoài.
- Trạng thái rỗng (không số → ô trống chuẩn), lỗi (số sai hiện ngay cạnh ô).
- Dữ liệu người nhập không dịch (`translate="no"` trên số hiển thị).
