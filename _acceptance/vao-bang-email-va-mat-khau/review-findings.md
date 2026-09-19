# Review findings — vao-bang-email-va-mat-khau

Ghi từ lượt NGHIỆM THU TƯƠI, run_id `vao-bang-email-va-mat-khau-20260919-r1`,
verified_commit `ff84234ee8ac73bc5c6c3bd10b501ab4e85f206e`.

## Trong hợp đồng (đã liệt trong bảng eval của evidence-report.md, chép lại đây để dễ tra)

- **E1 / AC-1**: eval tham chiếu một test tên `phat-chia` không tồn tại trong
  `apps/api/test/mat-khau-lien-ket.spec.ts`. `bun test -t phat-chia` khớp 0 test,
  thoát mã 1. Đây là lỗ hổng phía sinh eval (khuôn AC-1 chưa từng có bài kiểm
  cross-layer độc lập của riêng nó), không phải lỗi sản phẩm — nhưng nghĩa là
  AC-1 hiện KHÔNG có phép đo máy nào phủ nó.
- **E5 / AC-5**: bài kiểm `het-han` xanh (1 pass) nhưng thiếu đúng nửa "mật khẩu
  cũ vẫn dùng được" mà chính `expected` của eval đòi. Fixture `qua-han` là một
  người mới toanh (`gieoNguoiVaChia()`), chưa từng có mật khẩu nào để so.
- **E7 / AC-7**: bài kiểm `chan-tu-dang-ky` xanh (2 pass) nhưng thiếu hẳn "chiều
  dương" mà `expected` đòi: xác nhận đường đặt mật khẩu BẰNG CHIA vẫn thành công
  cho CHÍNH địa chỉ vừa bị chặn tự đăng ký. Không có bước tiếp nối nào trong cả
  hai test của describe đó.
- **E13 / AC-9 (nghiêm trọng nhất vòng này)**: `apps/app/app/(landing)/sign-in/page.tsx`
  chỉ render `<PasswordSignIn>` khi `social.length > 0 || showSso` — tức khi có
  ít nhất một cửa Google/Microsoft/SSO đã cấu hình. Khi cả ba đều trống (đúng
  kịch bản `.env` hiện có của kho: `GOOGLE_CLIENT_ID=""`, không Microsoft,
  không SSO — cũng chính là kịch bản mục tiêu của toàn bộ tính năng này: mạng
  chặn Google), nhánh `!showSso && social.length === 0` trả về màn "Chưa có
  cách nào để vào" và KHÔNG BAO GIỜ chạm tới `<PasswordSignIn>`. Ô email/mật
  khẩu không hiện ra — người dùng bị khoá hoàn toàn, kể cả bằng cửa mới. Đã xác
  nhận bằng ảnh chụp thật (`E13-dangnhap.png`, cả bản tiếng Anh lẫn tiếng Việt)
  và bằng đọc mã nguồn (`configured`/`social`/`showSso` logic).

## Ngoài hợp đồng

- **`apps/api/scripts/dev-session.ts` — va chạm id khi hai email trùng 10 ký tự
  đầu**: script sinh `id: dev-${Buffer.from(email).toString("hex").slice(0,20)}`,
  tức chỉ lấy 10 byte đầu của địa chỉ email làm khoá. Hai email khác nhau nhưng
  cùng tiền tố 10 ký tự (ví dụ `e12-member-1789807881@onehub.center` và
  `e12-member-1789807964659@onehub.center`) sinh CÙNG một `id`, và lần `upsert`
  thứ hai văng `PrismaClientKnownRequestError: Unique constraint failed on the
  fields: (id)`. Gặp thật trong lúc dựng tài khoản demo cho E12. Đây là công cụ
  dev-only (`bun run dev:session`), không phải mã sản phẩm chấm theo hợp đồng,
  nhưng đáng vá vì bất kỳ ai dùng công cụ này với hai địa chỉ thử đặt tên giống
  nhau (rất dễ xảy ra khi test tay) đều dính.

- **Mặc định ngôn ngữ màn đăng nhập/đặt mật khẩu là tiếng Anh khi không có cookie
  `lang` hay header `Accept-Language`**: không phải hồi quy của vòng này (cơ chế
  `resolveLocale` đã có sẵn từ trước và tôn trọng cookie `lang=vi`/header khi có),
  nhưng đáng ghi lại vì nó ảnh hưởng trực tiếp đến cách chụp bằng chứng: chụp lần
  đầu (trước khi tôi đặt cookie `lang=vi`) ra toàn bộ chữ tiếng Anh, không phản
  ánh đúng những gì một nhân viên kinh doanh người Việt sẽ thấy. Đã chụp lại toàn
  bộ ảnh trong `evidence/` với cookie `lang=vi` đặt tay.
