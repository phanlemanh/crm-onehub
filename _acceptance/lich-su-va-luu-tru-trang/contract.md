---
schema_version: 1
feature: Trang của Kho tài liệu có lịch sử phiên bản xem và so được, quay lại một phiên bản cũ bằng một đề xuất qua duyệt, lưu trữ và khôi phục trang bằng đề xuất qua duyệt; trang đã lưu trữ vắng khỏi danh sách, tìm, trợ lý kho và Sức khoẻ, tìm lại ở «Đã lưu trữ»; đề xuất đã duyệt hiện ở nhóm «Đã xử lý»
slug: lich-su-va-luu-tru-trang
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: approved
design_doc: _acceptance/lich-su-va-luu-tru-trang/design.md
approved_by: Phan Le Manh
approved_at: 2026-10-13
---

# Acceptance Contract: lich-su-va-luu-tru-trang

## Context

Hàng `l3b` của `docs/plan/lo-trinh-kho-tai-lieu.json`, tách từ lượt 3 ngày 2026-09-29. T3 vì thêm cột vào
`TaiLieuTrang` và `TaiLieuDeXuat`. Cổng Đáng đã ký `build`. Chủ kho chốt 2026-09-26 mọi thay đổi trong Kho qua duyệt,
nên lưu trữ và khôi phục trang đều là đề xuất (`docs/vong-doi.md`, đoạn «Tài liệu đi lộ trình riêng»).

Source input: lộ trình mục 4 «Lượt 1», «Lượt 4» và dòng 10 · `docs/vong-doi.md` · `CONTEXT.md` mục Trang tài liệu, Bản
đề xuất, Bản đang dùng, Lưu trữ, Đã lưu trữ · `packages/db/prisma/schema.prisma` (`TaiLieu*`) ·
`apps/api/src/tai-lieu/**` · `packages/db/src/tai-lieu-*.ts` · `apps/app/app/(app)/[slug]/tai-lieu/**` ·
`coverage-scan.md`. Ba câu hỏi P6-5, P6-6, P6-8 chốt theo khuyến nghị khi duyệt Cổng Phạm vi 2026-10-13.

## Criteria

- AC-1: Given một trang có ba phiên bản đã duyệt (đề xuất bởi hai người khác nhau, duyệt bởi chủ trang) và một trang chưa từng duyệt, When một thành viên đọc được trang gọi `taiLieu.lichSu`, Then nhận đúng ba dòng, mới nhất trước, mỗi dòng có số, tên, ngày duyệt, tên người duyệt, tên người đề xuất, và đúng một dòng đánh dấu bản đang dùng; And trang chưa từng duyệt trả danh sách rỗng; And người không thấy trang (theo `dieuKienThay`) nhận `NOT_FOUND`, giống `taiLieu.get`.
- AC-2: Given trang ba phiên bản ở AC-1, When gọi `taiLieu.phienBan` với số 1, với số của bản đang dùng, và với số 9, Then số 1 trả tên, nội dung, ngày duyệt của phiên bản 1 cùng nội dung bản đang dùng để so; số bản đang dùng trả cờ «là bản đang dùng»; số 9 và trang không thấy trả `NOT_FOUND`.
- AC-3: Given trang ba phiên bản, When người đề xuất được gọi `taiLieu.quayLai` với số 1, Then có đúng một đề xuất mới loại nội dung, tên và nội dung bằng phiên bản 1 (so byte sau NFC), gốc là bản đang dùng, mang số phiên bản nguồn 1, và một sự kiện đề xuất; And khi chủ trang duyệt nó thì có phiên bản 4 với nội dung bằng phiên bản 1, ba phiên bản cũ không đổi byte nào; And `quayLai` với số của bản đang dùng, hay một phiên bản có nội dung trùng bản đang dùng, bị từ chối «chưa đổi» và không ghi hàng nào; And trang đã lưu trữ bị từ chối. (cross-layer)
- AC-4: Given một trang đang dùng, When người đề xuất được gọi `taiLieu.deXuatLuuTru` kèm lý do, Then có đúng một đề xuất loại lưu trữ mang lý do và một sự kiện đề xuất, trang chưa đổi gì; And trang chưa từng duyệt, trang đã lưu trữ, trang đã có một đề xuất lưu trữ đang chờ, lý do rỗng sau khi bỏ khoảng trắng và lý do quá 500 ký tự đều bị từ chối với câu nêu đúng lý do và không ghi hàng nào.
- AC-5: Given một đề xuất lưu trữ đang chờ và một đề xuất nội dung đang chờ trên cùng trang, When chủ trang hay `owner`/`admin` duyệt đề xuất lưu trữ, Then trang mang ngày lưu trữ, không có phiên bản mới, bản đang dùng giữ nguyên, đề xuất nội dung đang chờ thành «cũ» với một sự kiện «cũ» cho mỗi đề xuất (luật có sẵn khi một bản khác được duyệt trước), có đúng một sự kiện lưu trữ; And thành viên khác và vai `okr` duyệt thì bị `FORBIDDEN`, không hàng nào đổi; And trang đã lưu trữ được lưu trữ lần nữa (qua một đường ghi trực tiếp vào hàm duyệt) giữ nguyên ngày lưu trữ đầu.
- AC-6: Given một trang đã lưu trữ, When người đề xuất được gọi `taiLieu.deXuatKhoiPhuc` kèm lý do rồi chủ trang duyệt, Then trang thôi mang ngày lưu trữ, có một sự kiện khôi phục, và trang trở lại mọi chỗ ở AC-7; And `deXuatKhoiPhuc` trên trang chưa lưu trữ, hay khi trang đã có một đề xuất khôi phục đang chờ, bị từ chối và không ghi hàng nào; And màn đọc của trang đã lưu trữ có đề xuất khôi phục chờ hiện «Có đề xuất khôi phục chờ duyệt» thay cho nút «Đề xuất khôi phục»; And `taiLieu.propose` (sửa nội dung) trên trang đã lưu trữ bị từ chối với câu «trang đã lưu trữ», không ghi hàng nào.
- AC-7: Given ma trận viết trước — trang A đang dùng và trang B đã lưu trữ, cùng chứa một từ khoá, cùng quá hạn xác minh, cùng được một trang C nhắc tới, cùng đơn vị và chủ trang — When gọi `taiLieu.tim`, `taiLieu.dangDung`, `taiLieu.list` mặc định, `taiLieu.boLoc`, `taiLieu.sucKhoe`, `taiLieu.nhacToi` của C, và các hàm đọc của trợ lý kho (`docBanDangDung`, `docNhieuBanDangDung`, `timTrangDangDung`), Then mỗi chỗ ra A và không ra B, số đếm của bộ lọc chỉ đếm A; And `taiLieu.list` với `archived` chỉ ra B kèm ngày lưu trữ; And `taiLieu.get` của B trả trang kèm ngày lưu trữ. (cross-layer)
- AC-8: Given một đề xuất đã duyệt, một đề xuất bị trả lại và một đề xuất cũ, When chủ trang mở nhóm «Đã xử lý» của tab Chờ duyệt, Then thấy cả ba, mỗi dòng mang nhãn trạng thái của nó («Đã duyệt», «Đã trả lại», «Cũ»); And nhóm «Đang chờ» không đổi; ảnh nhóm «Đã xử lý» lưu làm bằng chứng. (cross-layer)
- AC-9: Given mọi thủ tục mới và mọi loại đề xuất mới, When tìm mọi đường ghi vào bảng phiên bản và bảng sự kiện, Then không đường nào sửa hay xoá một phiên bản hay một sự kiện đã ghi; And mỗi thao tác ghi đúng số sự kiện của bảng viết trước ở E9 (đề xuất 1 «đề xuất»; duyệt lưu trữ 1 «lưu trữ» cộng 1 «cũ» cho mỗi đề xuất nội dung đang chờ; duyệt khôi phục 1 «khôi phục»; trả lại 1 «trả lại»), mỗi sự kiện mang người và thời điểm.
- AC-10: Given một trang ba phiên bản trong trình duyệt thật của cây đang xét, When thành viên mở màn đọc → «Lịch sử» → phiên bản 1 → «So với bản đang dùng» rồi «Toàn văn» → «Quay lại phiên bản 1», Then thấy bảng ba phiên bản mới nhất trước với nhãn «Đang dùng»; thấy chữ thêm và bớt tô; thấy toàn văn; và tới màn duyệt của đề xuất mới mang nhãn «Quay lại phiên bản 1»; And ở khổ 390 bảng thành danh sách và không cuộn ngang; ảnh lưu làm bằng chứng.
- AC-11: Given một trang đang dùng, When thành viên mở «…» → «Đề xuất lưu trữ», gõ lý do, gửi; chủ trang mở đề xuất ở tab Chờ duyệt và duyệt; rồi ai đó mở thẳng đường dẫn trang, Then hộp có ô lý do và nút gửi khoá khi rỗng; sau khi gửi màn đọc hiện «Có đề xuất lưu trữ chờ duyệt» và mục trình đơn khoá kèm câu vì sao; màn duyệt hiện «Đề xuất lưu trữ trang» với lý do và nút «Duyệt lưu trữ»; sau duyệt màn đọc hiện dải «Trang đã lưu trữ ngày …» với «Đề xuất khôi phục» và không có «Sửa trang»; And thành viên gửi đề xuất khôi phục, chủ trang duyệt «Duyệt khôi phục», trang có lại ở danh sách trang mặc định; And mọi chỗ hiện tên trang, lý do hay nội dung phiên bản trên các màn mới nằm trong vùng `translate="no"`; ảnh lưu làm bằng chứng.
- AC-12: Given một trang đã lưu trữ và không trang nào khác đã lưu trữ ở workspace thứ hai, When thành viên bấm «Đã lưu trữ» trên thanh công cụ danh sách trang, Then bảng chỉ có trang đã lưu trữ với cột ngày lưu trữ, URL mang tham số `archived`, tải lại giữ nguyên; tắt nút thì về danh sách thường không có trang đó; And ở workspace không có trang lưu trữ nào thấy câu rỗng «Chưa có trang nào đã lưu trữ»; ảnh lưu làm bằng chứng.
- AC-13: Given các màn, hộp và dải mới, When một người đọc chữ trên ảnh của AC-10, AC-11, AC-12, Then chữ theo bộ chữ của `docs/vong-doi.md` và `CONTEXT.md` («Lưu trữ», «Khôi phục», «Đã lưu trữ», không «ẩn», «archive», «xoá»); một chữ một nghĩa trên cùng màn; chữ mới có mục trong `CONTEXT.md`. (judgment)

## Vòng đời (ba câu của `docs/vong-doi.md`)

1. Dọn thế nào: Lưu trữ → Khôi phục, cả hai là đề xuất qua duyệt; không có Xoá vĩnh viễn trang ở lượt này.
2. «Lịch sử» nghĩa là: trang đã có ít nhất một bản được duyệt. Trang chưa từng duyệt không lưu trữ được; nó giữ đường trả
   lại như cũ.
3. Danh sách mặc định: chỉ trang chưa lưu trữ, ở mọi chỗ của AC-7; tìm lại ở nút «Đã lưu trữ» trên thanh công cụ danh
   sách trang; mở thẳng đường dẫn thấy dải «Trang đã lưu trữ».

## Coverage

Quét bằng `morphological-scan` (preset entity-feature), bản đầy đủ ở `coverage-scan.md`.

- Trục A — việc trên trang: xem lịch sử (AC-1, AC-10) · xem và so bản cũ (AC-2, AC-10) · quay lại bản cũ (AC-3, AC-10) ·
  đề xuất lưu trữ (AC-4, AC-11) · duyệt lưu trữ (AC-5, AC-11) · khôi phục trang (AC-6). [thước CE: lộ trình mục 4 «Lượt
  1»; NGÀNH: Confluence Page history và Archive, Notion Page history, MediaWiki View history]
- Trục B — trạng thái trang: chưa từng duyệt · đang dùng · đang dùng có đề xuất chờ · đã lưu trữ · đã lưu trữ có đề xuất
  khôi phục chờ → AC-1, AC-4, AC-5, AC-6, AC-11. [thước CE: schema `banDangDungId`, `TaiLieuDeXuat.trangThai`;
  `docs/vong-doi.md` «Ba cách dọn»]
- Trục C — người: chủ trang · `owner`/`admin` · thành viên khác · vai `okr` → AC-1, AC-5. [thước CE:
  `tai-lieu-quyen.ts`; `vai-chi-okr.spec.ts`]
- Trục D — nơi trang hiện ra: danh sách · «Đã lưu trữ» · ⌘K và tìm · trợ lý kho · Sức khoẻ · «Trang nhắc tới» · bộ lọc ·
  màn đọc mở thẳng · Chờ duyệt → AC-7, AC-8, AC-11, AC-12. [thước CE: `docs/vong-doi.md` «Danh sách mặc định hiện gì»;
  lộ trình «Lượt 4» «không thấy trang lưu trữ»]
- Cross-cutting: nhật ký chỉ ghi thêm (AC-9) · bộ chữ (AC-13) · quyền ở máy chủ (AC-1, AC-5).
- [GIẢ ĐỊNH] Hộp chèn liên kết và ⌘K dùng `taiLieu.tim`, nên lọc ở `timTrangDangDung` là đủ cho cả hai.
- [GIẢ ĐỊNH] Liên kết `[[…]]` tới trang đã lưu trữ vẫn mở được trang; mục «gãy» của Sức khoẻ không đổi.

## Out of scope

- Xoá vĩnh viễn trang đã lưu trữ.
- Lưu trữ nguồn tài liệu (`TaiLieuNguon`).
- Lưu trữ hàng loạt, lưu trữ tự động theo lịch; so hai phiên bản cũ với nhau.
- Mảnh dải báo bản ghi đã lưu trữ dùng chung trong `packages/ui` — hàng V2e `dai-luu-tru-dung-chung`.
- Sửa hay xoá một phiên bản đã duyệt; lưu trữ không qua duyệt.

## Notes

- `migration` lấy mốc giờ UTC thật lúc tạo; ngay trước khi gộp, kiểm `origin/onehub` không có `migration` trùng tên hay mới
  hơn trỏ cùng bảng (luật đợt 1, 2).
- Thủ tục mới đều có đầu vào: `SO_MUTATION_KHONG_DAU_VAO` của `apps/api/test/vai-chi-okr.spec.ts` giữ nguyên; danh sách
  `DAU_VAO_HOP_LE` thêm mẫu cho thủ tục mới.
- `bun run trpc:generate` sau khi thêm thủ tục; `src/generated/server.ts` đi cùng commit, sinh lại chứ không vá tay.
- Thứ tự gộp chốt trên crm #375 (13/10): DA1b và DA2 của máy M5 gộp trước, lượt này gộp sau và chịu phần hoà. `migration`
  lấy mốc UTC thật lúc gộp, sau `20261013092958_kanban_viec`, kiểm `origin/onehub` ngay trước đẩy, chạy `prisma generate`
  và `migrate diff`; `vai-chi-okr.spec.ts` giữ dòng `viec.cuaToi` của DA1b; `config.yaml`, `CONTEXT.md`,
  `proto/catalog.ts`, `proto/registry.ts` chỉ thêm. Lượt này xong trước DA1b/DA2 thì báo giám sát trước khi xin khoá gộp.
