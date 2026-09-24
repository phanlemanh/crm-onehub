## Trong hợp đồng

- **Nhật ký nhiễm chéo giữa các thủ tục trong cùng một lô (batch) — phép đếm ngưỡng có thể báo động giả hoặc bỏ sót** (r1)
  AC: AC-11
  file: `apps/api/src/trpc/pham-vi-yeu-cau.ts`, `apps/api/src/trpc/middlewares/logging.middleware.ts`
  severity: medium
  Lỗi: trình duyệt và máy chủ ứng dụng gửi nhiều thủ tục trong một lô, tRPC tạo một `req` cho cả lô; vai/phạm vi ghim theo `req` nên thủ tục ghi sau thắng cả lô — dòng của một thủ tục chung có thể in `phamVi: doi-tac` với `outcome: ok`, đúng mẫu ngưỡng đang đếm.
  Đã sửa (vòng 2, commit d7de59de): lớp ghi nhật ký cấp một ô riêng cho từng lời gọi qua ctx; lớp kiểm ghi vào ô đó; phép đo `nhat-ky` thêm ca lô ba thủ tục khác phạm vi.

- **`workspace.get` in `role: null` dù người gọi là thành viên** (r1)
  AC: AC-11
  file: `apps/api/src/workspace/workspace.router.ts`
  severity: low
  Lỗi: thủ tục đi lớp «chỉ có phiên» nên không ghi vai; chữ AC-11 «bất kỳ lời gọi tRPC nào của một thành viên» không giữ ở thủ tục này.
  Đã sửa (vòng 2): router ghi vai từ chính câu trả lời của `workspace.get` (không thêm lần đọc). `sso.signInOptions` là thủ tục công khai không hỏi phiên nên vẫn `role: null` — ghi ở Known limits.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Thành viên thường và người vai chỉ OKR kẹt ở cổng «nhập khoá research» khi khoá chưa có — trước đây tự gỡ được, nay không**
  Người dùng thấy gì: Khi kho chưa có (hoặc vừa xoá) khoá Context, mọi đường dẫn của một thành viên thường hay người chỉ OKR đều bị đưa về màn nhập khoá; bấm Lưu thì nhận «Only an owner or an admin can change workspace settings» và không có lối nào khác — đến khi một quản trị nhập khoá hộ. Trước lượt này ai cũng nhập được nên tự thoát. Trên production khoá đang có nên hôm nay không ai kẹt; kẹt chỉ xảy ra khi khoá bị xoá.
  file: `apps/app/proxy.ts`, `apps/app/app/(landing)/onboarding/research/research-form.tsx`, `apps/api/src/settings/settings.service.ts`
  severity: medium
  Đề xuất: new-contract

- **Thanh điều hướng và thanh bên Cài đặt thành khung mờ nếu câu hỏi «tôi là ai trong kho» lỗi — với mọi vai**
  Người dùng thấy gì: Một thành viên thường mở ứng dụng đúng lúc API trả lỗi cho riêng `workspace.get` thì rail và thanh bên Cài đặt chỉ là các nút mờ không bấm được, dù nội dung trang có thể vẫn hiện; trước lượt này hai thanh đó là tĩnh, luôn có.
  file: `apps/app/components/app-icon-rail.tsx`, `apps/app/app/(app)/[slug]/settings/settings-sidebar.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — dưới ngưỡng cụm).
