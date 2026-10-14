# Quét phủ — lich-su-va-luu-tru-trang

Preset `entity-feature`, 2026-10-13, kit 2.28. Thực thể: trang của Kho tài liệu (`TaiLieuTrang`).

## Ngữ cảnh

- Sản phẩm: Kho tài liệu của CRM OneHub — trang có phiên bản bất biến, mọi thay đổi qua đề xuất và duyệt.
- Chân sản phẩm (đào repo): `docs/plan/lo-trinh-kho-tai-lieu.md` mục 4 «Lượt 1» và dòng 10 (lượt 3b) ·
  `docs/vong-doi.md` (chuẩn xoá/lưu trữ, đoạn «Tài liệu đi lộ trình riêng») · `packages/db/prisma/schema.prisma`
  (`TaiLieuTrang`, `TaiLieuPhienBan`, `TaiLieuDeXuat`, `TaiLieuSuKien`) · `apps/api/src/tai-lieu/tai-lieu.service.ts`
  (`propose`, `approve`, `reject`, nhóm `da-xu-ly`) · `packages/db/src/tai-lieu-tim.ts` (tìm, đọc bản đang dùng —
  dùng chung với trợ lý kho) · `apps/app/app/(app)/[slug]/tai-lieu/**`.
- Chân ngành: Confluence (Page history: xem bản cũ, so sánh, «Restore this version» tạo bản mới; Archive trang ẩn khỏi
  cây và tìm kiếm mặc định) · Notion (Page history, Restore; trang lưu trữ/Trash) · MediaWiki (lịch sử bản sửa, «undo»
  là một bản sửa mới).

## Trục

- Trục A — việc trên trang: xem lịch sử · xem một bản cũ · so bản cũ với bản đang dùng · đề xuất khôi phục bản cũ ·
  đề xuất lưu trữ · đề xuất khôi phục trang đã lưu trữ · duyệt / trả lại mỗi loại đề xuất. [thước CE: lộ trình mục 4
  «Lượt 1» dòng «Lịch sử phiên bản; khôi phục là một đề xuất từ bản cũ; lưu trữ qua duyệt»; NGÀNH: Confluence, Notion]
- Trục B — trạng thái trang: chưa từng duyệt · đang dùng · đang dùng có đề xuất chờ · đã lưu trữ · đã lưu trữ có đề
  xuất khôi phục chờ. [thước CE: schema `banDangDungId`, `TaiLieuDeXuat.trangThai`; `docs/vong-doi.md` mục «Ba cách
  dọn»]
- Trục C — người: chủ trang · `owner`/`admin` · thành viên khác · vai `okr`. [thước CE: `tai-lieu-quyen.ts`
  (`dieuKienThay`, `duyetDuocTrang`); `vai-chi-okr.spec.ts`]
- Trục D — nơi trang hiện ra: danh sách trang · «Đã lưu trữ» · ⌘K và tìm trong trang · trợ lý kho (tab «Hỏi», Zalo)
  · tab Sức khoẻ · «Trang nhắc tới» · hộp chèn liên kết · màn đọc mở thẳng bằng đường dẫn · hàng «Chờ duyệt» và
  «Đã xử lý». [thước CE: `docs/vong-doi.md` mục «Danh sách mặc định hiện gì»; lộ trình mục 4 «Lượt 4» «không thấy
  trang lưu trữ»; SUY-TỪ-REPO `quick-switcher.tsx`, `tai-lieu-tim.service.ts`]

## Ô và cắt

A × B: «xem lịch sử», «xem bản cũ», «so sánh» có nghĩa ở mọi trạng thái đã từng duyệt; ô «chưa từng duyệt» không có
lịch sử (gạch). «Đề xuất khôi phục bản cũ» và «đề xuất lưu trữ» chỉ ở trang đang dùng; «đề xuất khôi phục trang» chỉ ở
trang đã lưu trữ. A × C: ai đọc được trang thì xem được lịch sử; ai đề xuất sửa được thì đề xuất được ba loại mới; chỉ
chủ trang và quản trị duyệt. B × D: trang đã lưu trữ vắng ở mọi nơi trên trục D trừ «Đã lưu trữ», màn đọc mở thẳng,
và hàng duyệt của chính đề xuất.

## Core

1. Lịch sử phiên bản trên màn đọc, xem bản cũ, so với bản đang dùng.
2. Khôi phục bản cũ là một đề xuất nội dung từ bản cũ, đi duyệt như mọi đề xuất.
3. Lưu trữ trang và khôi phục trang là hai loại đề xuất, đi duyệt.
4. Trang đã lưu trữ vắng ở mọi nơi trên trục D (máy chủ lọc một chỗ).
5. Nút «Đã lưu trữ» và dải báo trên màn đọc của trang đã lưu trữ.
6. Đề xuất đã duyệt hiện ở nhóm «Đã xử lý».
7. Quyền theo trục C ở mọi thủ tục mới.

## Later

- Xoá vĩnh viễn trang đã lưu trữ (chờ người chốt; mặc định không làm — bản phiên bản và sự kiện là nhật ký chỉ ghi thêm).
- Lưu trữ nguồn tài liệu (`TaiLieuNguon`) — chờ người chốt; khuyến tách hàng riêng.
- Lưu trữ hàng loạt; lưu trữ theo lịch khi lâu không xác minh.
- So sánh hai bản cũ bất kỳ với nhau (lượt này so bản cũ với bản đang dùng).

## Never

- Sửa hay xoá một bản phiên bản đã duyệt — bất biến của lượt 1 (`tai-lieu.spec.ts` «khong duong sua hay go phien ban»).
- Lưu trữ không qua duyệt — chủ kho chốt 2026-09-26 mọi thay đổi trong Kho qua duyệt.

## Cross-cutting

- Mọi thay đổi trạng thái ghi một dòng `TaiLieuSuKien`.
- Chữ theo bộ chữ của `docs/vong-doi.md`: «Lưu trữ», «Khôi phục», «Đã lưu trữ»; không «ẩn», «archive».
- Máy chủ lọc trang đã lưu trữ ở một hàm dùng chung, không rải điều kiện.
