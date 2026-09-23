# Ca «chủ cuối cùng» nói tường minh tiền đề của nó — design

Ngày: 2026-09-23 · Hồ sơ: `_acceptance/chu-cuoi-cung-tien-de/` · Hạng T2 (`apps/api/test/**`)

## Vấn đề

Ca `apps/api/test/workspace-thanh-vien.spec.ts` › `chu-cuoi-cung > chu cuoi cung khong
go duoc, hai chu thi go duoc` đỏ chập chờn trên CI: run 35446347260 (19/09),
35697196924 (22/09), và 2/2 lượt trên PR #88. Kết quả nhận được là `["", 26, …]` thay
cho `["The workspace needs an owner. Make someone else an owner first.", 27, …]`:
lượt gỡ chủ cuối cùng đã lọt qua.

Ca ngầm giả định workspace không có chủ nào ngoài `chu` của nó. `don()` chỉ dọn các
hàng mang tiền tố của chính tệp, còn guard trong `WorkspaceService.removeMember` đếm
MỌI chủ của `WORKSPACE_ID`. Chỉ cần một chủ còn sót từ tệp khác hoặc gói khác cùng cơ
sở dữ liệu của lượt chạy, lượt gỡ sẽ hợp lệ. Đã tái hiện chắc chắn bằng cách cài một
chủ lạ trước ca: ca đỏ đúng như trên CI.

Nguồn cụ thể của chủ lạ trên CI chưa xác định. Máy dev không tái hiện được bằng thứ
tự gói `@crm/auth → api`, cả với bản test auth có đối chứng dương.

## Thiết kế

Trong ca `chu-cuoi-cung`, trước khi gỡ:

1. Ghi lại mọi member `owner` của `WORKSPACE_ID` không phải `chu` của ca.
2. Hạ họ xuống `member`, để tiền đề «chu là chủ duy nhất» thành sự thật trong ca.
3. Chạy hai vế của ca như cũ: gỡ chủ cuối bị từ chối, có hai chủ thì gỡ được một.
4. Trong `finally`, trả lại vai `owner` cho đúng những member đã hạ.

Phương án bị loại:
- Xoá chủ lạ: phá dữ liệu của tệp khác trong cùng cơ sở dữ liệu.
- Chỉ khẳng định tiền đề rồi đỏ có tên: dễ đọc hơn nhưng ca vẫn chập chờn.
- Cho mỗi gói test một cơ sở dữ liệu riêng: chạm `packages/db` (T3). Nó không sửa được
  chủ lạ đến từ chính các tệp của `apps/api`, và nguồn chủ lạ trên CI chưa xác định.

Không đổi mã sản phẩm. Không có bề mặt người nhìn.

## Cách đo

Răng `_acceptance/chu-cuoi-cung-tien-de/rang/chu-la.mjs` chạy mọi phép đo trên bản sao
`apps/api` ở `.acceptance-runs/chu-cuoi-cung-tien-de/sao-*` (symlink `node_modules`),
qua `bun run test --` để có cơ sở dữ liệu riêng cho lượt. Một tệp dò cài chủ lạ trong
`beforeAll` rồi import tệp kiểm, và một `afterAll` ở cuối tệp dò kiểm lại vai của chủ lạ.
Bản gốc lấy từ git ở `058bb75f`.
