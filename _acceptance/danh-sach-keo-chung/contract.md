---
schema_version: 1
feature: «Kéo để sắp xếp ở Tổ chức và Giai đoạn chạy giống nhau; giai đoạn thoả thuận lưu trữ và khôi phục được»
slug: danh-sach-keo-chung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-08T05:06:29Z
design_doc: docs/superpowers/specs/2026-10-08-danh-sach-keo-chung-design.md
---

# Acceptance Contract: danh-sach-keo-chung

## Context

Hai danh sách kéo để sắp xếp ở Cài đặt — Tổ chức (bộ phận, phòng ban) và Giai đoạn thoả thuận — là hai bản chép đã
lệch nhau: Giai đoạn giữ thứ tự sai khi lưu lỗi (Ngoài-8 của `giai-doan-thoa-thuan`), Tổ chức không có «Hoàn tác»,
chỉ Tổ chức có dòng hướng dẫn kéo. Vòng này đưa hành vi kéo có lưu vào một thành phần `SortableSaveList` của
`packages/ui` và cho cả hai trang dùng. Cùng vòng, giai đoạn thoả thuận theo nếp lưu trữ của `docs/vong-doi.md`: chữ
«Xoá» thành «Lưu trữ», toast có «Hoàn tác» khi không phải chuyển thoả thuận, và mục gập «Đã lưu trữ (n)» có «Khôi
phục» — máy chủ thêm `giaiDoan.archived` và `giaiDoan.restore` (bảng vòng đời của đợt ghi «máy chủ đã đúng» là sai:
hai thủ tục này chưa có).

Source input: hàng E3 của `docs/plan/lo-trinh-okr.json`; Ngoài-2 của `giai-doan-thoa-thuan` (Cổng Bằng chứng
29/09); bảng vòng đời của đợt sau-14-10; `_acceptance/danh-sach-keo-chung/opportunity.md` (Cổng Đáng `build`
2026-10-07T13:13:50Z, luật 16); thiết kế anh duyệt 08/10 («Đồng ý theo lời khuyên»).

Ba câu vòng đời (`docs/vong-doi.md`): **Dọn thế nào** — Lưu trữ → Khôi phục; Xoá vĩnh viễn hoãn. **«Lịch sử»** —
thoả thuận từng ở giai đoạn đó (dòng chuyển giai đoạn mang mã giai đoạn), nên không có nút Xoá. **Danh sách mặc
định** — giai đoạn sống theo ba nhóm; giai đoạn đã cất tìm lại ở «Đã lưu trữ (n)» cuối trang Giai đoạn.

## Criteria

- AC-1: Given `SortableSaveList` của `packages/ui` với ba mục a, b, c và `onSave` chưa xong, When người dùng dời a xuống một bậc bằng bàn phím, Then danh sách hiện b, a, c ngay, mọi tay kéo bị khoá, và `onSave` nhận đúng một lần `{ ids: [b, a, c], id: a, index: 1 }`; dưới danh sách có dòng hướng dẫn kéo; When danh sách được truyền `disabled`, Then mọi tay kéo bị khoá và kéo bằng bàn phím không gọi `onSave`.
- AC-2: Given như AC-1, When `onSave` báo lỗi với thông điệp «x», Then danh sách trở lại a, b, c ngay, hiện toast lỗi «x», và tay kéo mở lại.
- AC-3: Given như AC-1, When `onSave` xong, Then hiện toast «Đã lưu thứ tự mới» có nút «Hoàn tác»; When bấm «Hoàn tác», Then `onSave` được gọi đúng một lần với `{ ids: [a, b, c], id: a, index: 0 }`, và bấm «Hoàn tác» lần nữa khi lần đầu chưa xong không gọi thêm; When lời gọi hoàn tác xong, Then danh sách hiện a, b, c, tay kéo mở lại và hiện toast «Đã trả thứ tự cũ» không có nút; When lời gọi hoàn tác lỗi, Then danh sách giữ b, a, c và hiện toast lỗi.
- AC-4: Given quản trị viên ở app thật, trang Cài đặt › Giai đoạn và trang Cài đặt › Tổ chức (danh sách bộ phận ở gốc), When dời một mục bằng bàn phím rồi tải lại trang, Then thứ tự mới còn đó; When dời rồi bấm «Hoàn tác» ở toast, Then sau khi tải lại thứ tự cũ còn đó.
- AC-5: Given trang Giai đoạn, trang Tổ chức ở gốc (bộ phận) và trang một bộ phận (phòng ban), When lưu thứ tự mới bị máy chủ từ chối, Then danh sách trở lại thứ tự cũ mà không cần tải lại trang, hiện đúng một toast lỗi và không có toast «Đã lưu thứ tự mới».
- AC-6: Given mã của trang Giai đoạn và Tổ chức sau vòng này, When đọc nguồn, Then không tệp nào dưới `apps/app/app/(app)/[slug]/settings/giai-doan` và `…/settings/organization` nhập `SortableList` hay `SortableItem` trực tiếp mà đều dùng `SortableSaveList`, và `organization/danh-sach-keo.tsx` không còn hộp `rounded-lg border` tự dựng.
- AC-7: Given trang Giai đoạn với một giai đoạn không có thoả thuận, When mở menu của hàng, Then mục ghi «Lưu trữ» (trang không còn chữ «Xoá» cho giai đoạn); When chọn «Lưu trữ», Then giai đoạn được lưu trữ ngay không qua hộp hỏi, hiện toast «Đã lưu trữ «<tên>».» có «Hoàn tác»; When bấm «Hoàn tác», Then giai đoạn trở lại đúng chỗ cũ trong nhóm (`giaiDoan.restore` rồi `giaiDoan.reorder` với thứ tự trước khi lưu trữ); giai đoạn cuối cùng của nhóm thì mục «Lưu trữ» bị khoá kèm lý do và không gọi `giaiDoan.archive`; người không quản trị thì tay kéo, menu hàng bị khoá.
- AC-8: Given giai đoạn còn thoả thuận, When chọn «Lưu trữ», Then hộp thoại tiêu đề «Lưu trữ «<tên>»?» bắt chọn giai đoạn đích cùng nhóm, câu phụ nói giai đoạn lấy lại được ở «Đã lưu trữ» và thoả thuận ở lại giai đoạn mới, nút chính «Chuyển và lưu trữ»; When xác nhận xong, Then toast không có «Hoàn tác».
- AC-9: Given có giai đoạn đã cất, When mở trang Giai đoạn, Then cuối trang có mục gập «Đã lưu trữ (n)» với n đúng số giai đoạn đã cất, mỗi dòng mang tên và nhóm (Đang mở / Chốt được / Không thành) và chỉ một nút «Khôi phục» (không «Xoá vĩnh viễn»); không có giai đoạn đã cất thì không có mục gập; When «Khôi phục» thành công, Then toast «Đã khôi phục «<tên>».»; When máy chủ chặn, Then toast lỗi và danh sách không đổi.
- AC-10: Given máy chủ, When gọi `giaiDoan.restore` cho một giai đoạn đã cất, Then `archivedAt` về rỗng và `position` lớn hơn mọi giai đoạn sống cùng nhóm; When tên trùng một giai đoạn sống (không phân biệt hoa thường, bỏ khoảng trắng hai đầu), hoặc đã đủ 20 giai đoạn sống, hoặc giai đoạn chưa cất, Then trả `BAD_REQUEST` và không đổi gì; mã không có thì `NOT_FOUND`; thành viên thường thì `FORBIDDEN`; When gọi `giaiDoan.archived`, Then chỉ trả giai đoạn đã cất, mới cất trước, mỗi giai đoạn có `id`, `label`, `kind`, `archivedAt`.
- AC-11: Given app thật, khổ 1440 và 375, When quản trị viên lưu trữ một giai đoạn không có thoả thuận rồi mở «Đã lưu trữ (n)» và bấm «Khôi phục», Then giai đoạn hiện lại ở cuối nhóm của nó; When lưu trữ giai đoạn thứ hai của «Đang mở» rồi bấm «Hoàn tác» ở toast, Then sau khi tải lại thứ tự nhóm bằng thứ tự trước khi lưu trữ; ở 375, mục gập và nút «Khôi phục» nằm trọn trong khung nhìn.
- AC-12: (kiểm không hồi quy) Given các bài kiểm sẵn có của Trường tuỳ chỉnh (dùng `SortableList` cũ), cây Tổ chức và báo cáo giai đoạn, When chạy lại sau thay đổi, Then thoát 0 không sửa kỳ vọng.
- AC-13: Given mọi tệp `.tsx` dưới `apps/app` và `packages/ui/src` mà vòng này thêm hay sửa (rút từ `git diff` so với merge-base), When chạy sàn thiết kế của kho, Then không vi phạm P0.

## Coverage

Quét bằng `morphological-scan` preset test-matrix (S1, 08/10).

- Trục A — Kết quả lưu: đang lưu | xong | lỗi | Hoàn tác (đang chạy, bấm lặp) [thước CE: bốn nhánh của một lời gọi lưu có hoàn tác — SUY-TỪ-REPO `giai-doan-settings.tsx` hàm `sapXep`, `chi-tiet-goc.tsx` `ghi`]
- Trục B — Nơi dùng: giai đoạn (gửi cả danh sách) | bộ phận ở gốc (cả danh sách) | phòng ban trong bộ phận (`id` + `index`) [thước CE: `org.reorderDivisions`, `org.moveDepartment`, `giaiDoan.reorder`]
- Trục C — Lưu trữ giai đoạn: không thoả thuận | còn thoả thuận | giai đoạn cuối nhóm (khoá) [thước CE: `GiaiDoanService.archive`]
- Trục D — Khôi phục: được | trùng tên | đủ trần | chưa cất | không có | không quyền [thước CE: bất biến của `docs/api.md` «Deal stages are rows»]
- Trục E — Khổ: 1440 | 375
- Core → AC: bốn nhánh lưu (AC-1, AC-2, AC-3) · thứ tự bền trên app thật cả hai trang (AC-4) · lưu lỗi ở cả ba nơi dùng (AC-5) · giai đoạn cuối nhóm và không quyền (AC-7) · một thành phần (AC-6) · lưu trữ không / có thoả thuận (AC-7, AC-8) · đã lưu trữ và khôi phục (AC-9, AC-10, AC-11) · hồi quy (AC-12) · sàn thiết kế (AC-13).
- Later: phòng ban sắp + Hoàn tác trên app thật (cùng thành phần, khác thủ tục — kiểm ở DOM qua `index`, AC-5); khôi phục bị chặn trên app thật.
- Never: Xoá vĩnh viễn giai đoạn; Hoàn tác đưa thoả thuận về giai đoạn cũ.

## Đường đo

- Thước: người thử làm xong ba việc (sắp lại một bộ phận; sắp lại một giai đoạn rồi Hoàn tác; lưu trữ rồi khôi phục một giai đoạn) không cần hỏi, 0 lần thấy thứ tự khác thứ tự đã lưu · số từ: phiên nghiệm thu (`uat-session`) trên production · bảo đảm bởi: AC-4, AC-7, AC-9, AC-11
- Thước: danh sách trở về thứ tự cũ khi lưu lỗi ở cả hai trang · số từ: bài DOM `sortable-save-list`, `giai-doan-cai-dat` và `sap-luu-loi` · bảo đảm bởi: AC-2, AC-5

## Out of scope

- Xoá vĩnh viễn giai đoạn thoả thuận.
- Hoàn tác đưa thoả thuận đã chuyển về giai đoạn cũ.
- Giai đoạn mặc định cho thoả thuận mới khi giai đoạn đầu bị cất (E4 `giai-doan-mac-dinh`).
- Trường tuỳ chỉnh (`fields-list.tsx`, `field-editor.tsx`) — vẫn dùng `SortableList` cũ.
- Lưu trữ đơn vị tổ chức (đã đúng chuẩn, không đổi).

## Notes

- Không migration (cột `archivedAt` đã có). Thủ tục mới chỉ đọc / ghi, không trí khôn (AGENTS.md).
- Tệp ngoài ranh giới đã được giám sát duyệt: P3-15 (`apps/api/src/giai-doan/*`, hai bài kiểm API, `cache.ts`, `to-chuc.ts`), P3-16 (`packages/ui/src/lib/messages.ts`, `docs/api.md`, tệp thiết kế).
- Đường nền đo xanh trên onehub `4685fbe12` (2026-10-08T04:43:02Z).
- Tệp ngoài ranh giới duyệt thêm: P3-17, P3-18 (`_acceptance/config.yaml` khoá `dsk_`, `apps/app/test/sap-luu-loi.dom.tsx`), P3-20 (xoá 10 khoá chữ chết ở `settings.ts`, `to-chuc.ts`).

Known limits — chấp nhận tại Cổng Bằng chứng 2026-10-08 (Phan Le Manh), từ mục ngoài hợp đồng của S4 round 1–2:

- Ngoài-1: Nếu bấm Hoàn tác sau khi lưu trữ một giai đoạn mà việc khôi phục bị lỗi (ví dụ mất mạng), thông báo biến mất ngay và người dùng chỉ thấy báo lỗi, không bấm Hoàn tác lại được. Giai đoạn vẫn nằm ở mục Đã lưu trữ và khôi phục được từ đó.
- Ngoài-2: Nếu người dùng kéo hai lần liên tiếp rồi bấm Hoàn tác ở thông báo của lần kéo đầu, thứ tự cuối cùng trên máy chủ có thể không khớp với những gì màn hình hiện, hoặc lần kéo thứ hai bị lùi theo.
- Ngoài-4: Nếu giữa lúc lưu trữ và lúc bấm Hoàn tác có người thêm giai đoạn mới cùng nhóm, giai đoạn vẫn được khôi phục nhưng màn hình báo lỗi; nếu người dùng đã tự sắp lại nhóm trước đó, Hoàn tác có thể ghi đè thứ tự mới bằng thứ tự cũ.

Mở hợp đồng mới (Ngoài-3, Ngoài-5 — cùng một lỗi): danh sách «Đã lưu trữ» tải lỗi thì mục gập biến mất, không thông báo, không nút thử lại.

Thước E15 của hồ sơ đã ký `giai-doan-thoa-thuan` còn bấm menu «Xoá» — vòng này cố ý đổi chữ đó (AC-7, AC-8); chưa sửa thước (Treo-2 phê ở Cổng Bằng chứng).
