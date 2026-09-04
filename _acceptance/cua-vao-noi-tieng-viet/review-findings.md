## Trong hợp đồng

- **khong-dich eval silently skips a whole screen on redirect and can still exit 0**
  AC: AC-6
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs:543`
  severity: high
  In the `khong-dich` chapter the loop does `if (!p.url().endsWith(d)) { await p.close(); continue; }` — a screen that redirects away (stale session cookie, onboarding already completed, API down) is dropped with no record. The chapter then only fails if a pinned value was seen on NO screen at all (`thieu`, line 577). Failure scenario: the session cookie from phien() no longer satisfies requireMailboxAccess, /onboarding and /onboarding/research both redirect to /, only /sign-in is observed; every pinned value that also appears on /sign-in still resolves, the chapter prints `ket qua: …deu nguyen van va deu mang dau` and exits 0 — a green with two of three screens never loaded. The sibling `be-rong` chapter handles the identical condition correctly at line 381 by calling tuChoi() (exit 2, "KHONG DO DUOC"). Fix: replace the `continue` with tuChoi(), matching be-rong, or count observed screens and refuse when the count is short.

- **Hình dạng 4 — khẳng định âm tính một mình: chân chân-trang không có đối chứng dương**
  AC: AC-13
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs:269`
  severity: medium
  Chân chan-trang (E13) chỉ có hai khẳng định âm tính trên thân trang: /Made with love/i không xuất hiện (dòng 276) và /trycomp\.ai/i không xuất hiện (dòng 280). Không có một khẳng định dương nào rằng trang đã dựng được và vùng chân trang thật sự nằm trong chuỗi HTML đọc về. Hàm trang() (dòng 27-47) chỉ từ chối khi máy chủ trả 3xx; một luợt trả 500 hay một thân trang rỗng đi lọt qua cả hai regex và chân báo đạt "6 luot dung khong con dong chan nha lam goc". Ngoài ra E13 còn hứa thêm một vế "khang dinh rang file LICENSE o goc kho khong doi so voi ban da ghim" — trong chân không có dòng nào đọc LICENSE.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Contract widened to a fourth screen; every browser check still enumerates three**
  Người dùng thấy gì: Màn xin quyền truy cập không nằm trong bất kỳ phép kiểm tra tự động nào, nên lỗi tiếng Việt hoặc lỗi hiển thị ở màn đó có thể lọt qua mà không ai phát hiện.
  file: `_acceptance/cua-vao-noi-tieng-viet/contract.md`
  severity: high
  Đề xuất: new-contract

- **Localized string split on the literal "Context" drops the tail of the sentence silently**
  Người dùng thấy gì: Nếu sau này có người đổi câu tiếng Việt về khoá API và bỏ chữ 'Context' đi, nhãn trên màn khai báo khoá nghiên cứu có thể hiển thị sai hoặc bị cắt chữ mà không có cảnh báo nào báo trước.
  file: `apps/app/app/(landing)/onboarding/research/research-form.tsx`
  severity: high
  Đề xuất: known-limits

- **translate="no" wraps the whole localized button label, not just the provider name**
  Người dùng thấy gì: Khi trình duyệt của người dùng tự dịch trang, toàn bộ câu trên nút đăng nhập bị chặn dịch, kể cả phần không phải tên thương hiệu — không riêng tên Google hay Microsoft.
  file: `apps/app/app/(landing)/sign-in/social-sign-in.tsx`
  severity: medium
  Đề xuất: known-limits

- **Root layout still inlines the locale boundary the diff just extracted**
  Người dùng thấy gì: Nếu sau này có người sửa cách máy chọn ngôn ngữ, phần khung ngoài cùng của trang có thể bị sửa sót, khiến tiêu đề trang và nội dung bên trong hiển thị lệch tiếng với nhau.
  file: `apps/app/app/layout.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hardcoded-string exemptions match by content across the whole slice, not by file**
  Người dùng thấy gì: Một câu tiếng Anh được cho phép bỏ qua kiểm tra ở một chỗ có thể vô tình khiến một câu tiếng Anh khác, ở một màn hoàn toàn khác, cũng bị bỏ qua và không được dịch.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/chu-cung-lat.mjs`
  severity: low
  Đề xuất: known-limits

- **signOutAndRedirect swallows the sign-out error, so the new localized message is dead and users see hardcoded English**
  Người dùng thấy gì: Khi một người dùng tiếng Việt bấm đăng xuất ở màn xin quyền truy cập và thao tác đó thất bại, họ có thể thấy một dòng thông báo lỗi bằng tiếng Anh giữa một màn hoàn toàn tiếng Việt.
  file: `apps/app/lib/sign-out.ts`
  severity: high
  Đề xuất: new-contract

- **/grant-access is in no runtime eval chapter — its translations and translate="no" marks are unverified**
  Người dùng thấy gì: Các câu tiếng Việt và các đánh dấu 'không dịch' trên màn xin quyền truy cập chưa từng được máy tự kiểm tra, nên lỗi ở màn này có thể không bị phát hiện.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: high
  Đề xuất: new-contract

- **Whole button label wrapped in translate="no" blocks browser translation of the translated verb too**
  Người dùng thấy gì: Khi trình duyệt của người dùng tự dịch trang, toàn bộ câu trên nút đăng nhập bị chặn dịch, kể cả phần không phải tên thương hiệu — không riêng tên Google hay Microsoft.
  file: `apps/app/app/(landing)/sign-in/social-sign-in.tsx`
  severity: medium
  Đề xuất: known-limits

- **Splitting the message on the literal "Context" silently garbles the label if a translation drops the token**
  Người dùng thấy gì: Nếu sau này có người đổi câu tiếng Việt về khoá API và bỏ chữ 'Context' đi, nhãn trên màn khai báo khoá nghiên cứu có thể hiển thị sai hoặc bị cắt chữ mà không có cảnh báo nào báo trước.
  file: `apps/app/app/(landing)/onboarding/research/research-form.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — assert một giá trị đơn trong khi lời hứa là QUAN HỆ ưu tiên (cookie thắng header)**
  Người dùng thấy gì: Một bài kiểm tra tự động có thể báo đạt ngay cả khi máy chọn sai thứ tự ưu tiên giữa cookie và cài đặt trình duyệt, nên một lỗi chọn sai tiếng ở đây có thể không bị phát hiện.
  file: `apps/app/test/locale-resolve.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — khẳng định một chiều: sổ khai sinh không chạy chiều đỏ, không ghim thông điệp nào**
  Người dùng thấy gì: Bộ kiểm định các câu cảnh báo lỗi có thể luôn báo 'đạt' ngay cả khi câu cảnh báo không hoạt động đúng, vì nó chưa thử tình huống lỗi thật để kiểm chứng.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/khai-sinh.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét đủ N ô nhưng không ghim số phần tử; dân số đến từ JSON sửa được**
  Người dùng thấy gì: Nếu một dòng dữ liệu cần kiểm tra bị xoá nhầm khỏi danh sách, phép đo vẫn tự báo đạt với số lượng ít hơn, không cảnh báo rằng có phần bị thiếu.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: medium
  Đề xuất: known-limits

- **Khoảng diff được giao là RỖNG — đã đo trên khoảng thật của vòng**
  Người dùng thấy gì: Đây chỉ là một lưu ý về phạm vi so sánh được xem xét trong vòng này, không phải một lỗi ảnh hưởng tới người dùng.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/khai-sinh.mjs`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/15 lỗi rơi vào file không bộ đo nào phủ (_acceptance/cua-vao-noi-tieng-viet/contract.md, apps/app/lib/sign-out.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.