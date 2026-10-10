---
schema_version: 1
feature: «Một cách cất, một bộ chữ» — lưu trữ hàng loạt ở ba bảng CRM có Hoàn tác, bản ghi đã cất mở ra có dải báo «Đã lưu trữ ngày … · Khôi phục» và chỉ đọc, Kanban thoả thuận có nút «Đã lưu trữ», chữ nút xem và hộp xoá vĩnh viễn đúng bộ chữ
slug: vong-doi-mot-cach-cat
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
design_doc: docs/superpowers/specs/2026-10-09-vong-doi-mot-cach-cat-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-09
---

# Acceptance Contract: vong-doi-mot-cach-cat

## Context

Hàng V2 của đợt `sau-14-10`, dãy P2, sau K6b (#314) và E7 (#303) — đợt 2 «Một cách cất, một bộ chữ» của
`docs/vong-doi.md`. Anh ký `build` 2026-10-07T13:13:50Z (luật 16). Hôm nay lưu trữ hàng loạt ở ba bảng không có
«Hoàn tác», bản ghi đã cất mở ra trông như bản đang dùng và vẫn sửa được, Kanban thoả thuận không có chỗ xem thứ đã
cất, nút xem ghi «Lưu trữ» trần, hộp xoá vĩnh viễn hàng loạt ghi «Xoá» trần. Không đổi API: máy chủ đã có
`bulkRestore`, `restore`, `archivedAt`.

## Criteria

- AC-1: Given đã chọn một hay nhiều bản ghi đang dùng ở bảng cá nhân, công ty hay thoả thuận, When bấm «Lưu trữ» trong menu thao tác hàng loạt và máy chủ lưu trữ được ít nhất một bản, Then toast báo số bản đã lưu trữ kèm nút «Hoàn tác» trong 10 giây (có bản không lưu trữ được thì toast nói thêm số bản bị bỏ qua, vẫn kèm «Hoàn tác»); bấm «Hoàn tác» gọi khôi phục hàng loạt đúng một lần với đúng danh sách id vừa gửi đi lưu trữ — bấm lần hai không gọi thêm — rồi báo «Đã khôi phục …» và các bản ghi hiện lại ở danh sách mặc định; máy chủ thật: lưu trữ hàng loạt rồi khôi phục hàng loạt cùng danh sách id thì mọi bản về `archivedAt` rỗng và có mặt ở danh sách mặc định, ở cả ba loại; lưu trữ một bản từ menu ngăn vẫn có «Hoàn tác» như hôm nay. (cross-layer)
- AC-2: Given toast lưu trữ hàng loạt của AC-1, When bấm «Hoàn tác» và lời gọi khôi phục hàng loạt thất bại, Then toast lỗi nói «Chưa hoàn tác được. Các bản ghi vẫn ở mục Đã lưu trữ.» (bản tiếng Anh tương ứng), không in thông điệp lỗi thô của máy chủ; các bản vẫn tìm thấy và khôi phục được từ «Đã lưu trữ».
- AC-3: Given một cá nhân, công ty hay thoả thuận đã lưu trữ, When mở ngăn của nó, Then đầu thân ngăn có dải báo «Đã lưu trữ ngày <ngày lưu trữ>» kèm nút «Khôi phục»; bấm «Khôi phục» gọi khôi phục đúng bản ghi đó đúng một lần, rồi dải báo biến mất và các ô sửa được lại; bản ghi đang dùng không có dải báo; giao diện tiếng Anh thì dải báo dùng chữ tiếng Anh, không ký tự tiếng Việt có dấu.
- AC-4: Given ngăn của một bản ghi đã lưu trữ (ba loại), When người dùng nhìn tab chi tiết, Then mọi nút và ô trong nội dung tab chi tiết — các trường (trường chuẩn và trường tạo thêm), mô tả, các mục con — đều tắt, trừ nút «Khôi phục» của dải báo; menu giai đoạn trên đầu ngăn thoả thuận cũng tắt; bấm vào một ô không mở được chỗ sửa và không gọi lệnh cập nhật nào; menu «…» của ngăn vẫn có «Khôi phục» và «Xoá vĩnh viễn» bấm được; bản ghi đang dùng không bị tắt chỗ nào.
- AC-5: Given bảng thoả thuận ở dạng Kanban, When nhìn thanh công cụ, Then có nút «Đã lưu trữ» như ở dạng bảng; bấm nó thì màn chuyển sang danh sách thoả thuận đã lưu trữ và nút hiện là đang chọn; bấm lại thì quay về Kanban (dạng xem Kanban được giữ trên URL).
- AC-6: Given ba bảng cá nhân, công ty, thoả thuận và ngăn bản ghi, When đọc chữ của các việc vòng đời, Then nút xem thứ đã cất ghi «Đã lưu trữ» (tiếng Anh «Archived»), không còn «Lưu trữ» trần; hộp hỏi lại xoá vĩnh viễn — hàng loạt và từ menu ngăn — có nút xác nhận ghi «Xoá vĩnh viễn» (tiếng Anh «Delete forever»), nêu hậu quả, và nút tắt trong lúc đang xoá nên bấm hai lần chỉ gọi xoá vĩnh viễn một lần; chữ mô tả việc lưu trữ một trường không dùng chữ mà `CONTEXT.md` mục Lưu trữ đã loại (tiếng Anh không dùng «hidden»).
- AC-7: Given bản chạy thật của cây này, một thoả thuận đã lưu trữ, When mở ngăn của nó và mở Kanban thoả thuận ở khổ 1440 và 390, Then ngăn có dải báo «Đã lưu trữ ngày …» kèm «Khôi phục» và các ô trông là không sửa được, Kanban có nút «Đã lưu trữ» trên thanh công cụ; ở 390 không có gì tràn ngang; một người không làm lượt này đọc ảnh hiểu ngay bản ghi đã được cất và lấy lại ở đâu. (judgment)

## Coverage

- Quét bằng `morphological-scan` (`_acceptance/vong-doi-mot-cach-cat/coverage-scan.md`), preset `entity-feature`.
- Trục A — loại bản ghi: cá nhân | công ty | thoả thuận [thước CE: ba bảng có `archivedAt` — SUY-TỪ-REPO: `packages/db/prisma/schema.prisma`] — mọi tiêu chí AC-1 đến AC-4 và AC-6 đo đủ ba loại.
- Trục B — việc vòng đời: lưu trữ kèm Hoàn tác (AC-1, AC-2) | xem «Đã lưu trữ» (AC-5, AC-6) | mở bản đã cất (AC-3, AC-4) | khôi phục (AC-3) | xoá vĩnh viễn (AC-6) [thước CE: «Ba cách dọn» của `docs/vong-doi.md` — SUY-TỪ-REPO; NGÀNH: NN/g heuristic #3 User control and freedom, Material Design 3 Snackbar có thao tác Undo]
- Trục C — chỗ trên màn: dạng bảng | Kanban | menu hàng loạt | menu ngăn | ngăn bản ghi | danh sách liên quan — danh sách liên quan để sau (Out of scope).
- Trục D — khổ × ngôn ngữ: 1440 vi | 390 vi | en — 1440/390 ở AC-7, en ở AC-2, AC-3, AC-6.

## Đường đo

- Thước: số chỗ gọi lưu trữ cá nhân, công ty, thoả thuận trong `apps/app` có «Hoàn tác» / số chỗ gọi tìm thấy (hôm nay 4 chỗ phủ 6 đường: menu ngăn × 3 loại, hàng loạt × 3 loại) · số từ: script `rang/duong-luu-tru.mjs` (E15), bài DOM `apps/app/test/vong-doi-mot-cach-cat.dom.tsx` và bài đã ký `kara-trang-thai-luu-tru.dom.tsx` · bảo đảm bởi: AC-1
- Thước: 0 chỗ sửa còn bật trong tab chi tiết của bản đã cất ở ba ngăn · số từ: bài DOM `apps/app/test/vong-doi-mot-cach-cat.dom.tsx` · bảo đảm bởi: AC-4
- Thước: lái thử người lạ lấy lại bản lưu trữ nhầm mà không phải mở «Đã lưu trữ» · số từ: nhật ký vấp (khuôn `stranger-drive-template.md`) · bảo đảm bởi: đã có sẵn — nghi thức lái-thử của `/acceptance-gate:uat-session` §0
- Thước: số lần người lạ cố sửa một ô của thoả thuận đã cất khi mở nó từ đường dẫn (mong 0), và khôi phục được từ dải báo · số từ: nhật ký vấp của cùng lượt lái thử · bảo đảm bởi: đã có sẵn — nghi thức lái-thử của `/acceptance-gate:uat-session` §0

## Out of scope

- Danh sách liên quan trong ngăn (công ty → cá nhân, thoả thuận; cá nhân → thoả thuận) lọc bản đã cất kèm «+n đã lưu trữ» — cần sửa `byId` ở ba `*.service.ts` của API, trùng `deals.service.ts` mà E4 (P3) đang sửa; đề nghị mở hàng riêng.
- Lưu trữ một trường thôi hỏi lại và có «Hoàn tác» — `components/crm/fields/field-editor.tsx` ngoài ranh giới V2; V2 chỉ đổi chữ mô tả. Đề nghị mở hàng riêng.
- Giai đoạn thoả thuận và tác nhân theo nếp lưu trữ — trang Cài đặt, ngoài ranh giới; đề nghị mở hàng riêng.
- «Xoá hẳn» ở Cài đặt › Tổ chức — hồ sơ đã ký `to-chuc-danh-sach-chi-tiet` ghim chữ đó; đổi trong một hàng có hồ sơ riêng.
- Luật kho thứ bảy «vòng đời» và chạy nó ở CI — hàng V2L (P4).
- Máy chủ từ chối cập nhật bản đã cất — V2 chỉ khoá trên giao diện.
- Dòng thời gian, ghi chú, tab Kara của bản đã cất vẫn dùng được như hôm nay.
- Nút «Đã lưu trữ» thành một mảnh dùng chung ở `packages/ui` — V2 chỉ thêm nút vào Kanban thoả thuận; gom ba bảng về một mảnh là việc sau.

## Notes

- Vòng đời (luật 14): (1) Dọn thế nào — không đổi: cá nhân, công ty, thoả thuận đi Lưu trữ → Khôi phục → Xoá vĩnh viễn; V2 thêm «Hoàn tác» cho đường hàng loạt. (2) «Lịch sử» — không đổi (ba loại không có Xoá trần). (3) Danh sách mặc định — không đổi: chỉ bản đang dùng; thứ đã cất tìm lại ở nút «Đã lưu trữ», nay có ở cả Kanban thoả thuận.
- Hoàn tác gửi lại đúng danh sách id đã gửi đi lưu trữ (`variables.ids`), vì kết quả hàng loạt của API chỉ đếm, không trả id nào thành công. Khôi phục một bản chưa lưu trữ là không-đổi ở máy chủ (`restore` đặt `archivedAt: null`), nên id bị bỏ qua lúc lưu trữ không hỏng gì. Hạn chế đã biết: một bản có người khác lưu trữ giữa lúc tải danh sách và lúc bấm sẽ bị Hoàn tác khôi phục theo.
- Ranh giới: `deals-table.tsx` vào ranh giới theo P2-36 (giám sát duyệt — chỉ thêm nút «Đã lưu trữ» ở nhánh Kanban). Ba tệp ngăn bản ghi trùng K4b (`khung-loi-ban-ghi-dung-ly-do`); K4b gộp trước, V2 tự gỡ xung đột (P2-37).
- **Known limits (chủ kho ghi ở Cổng Bằng chứng 2026-10-09):**
  - Ngoài-4 — răng màn E12 bước 1 đọc `updatedAt` của thoả thuận đã cất một lần sau khoảng 600 ms, trong khi đối chứng dương chờ tới 6 giây; một lần ghi chậm có thể lọt. Ô mô tả chưa có đối chứng dương.
  - Ngoài-6 — trên bản ghi đã lưu trữ, nút «Thử lại» của vùng con tải lỗi và các nút mở bản ghi liên quan (người trong «Đang tới đâu», kế hoạch) cũng tắt theo vùng khoá.
  - Ngoài-8 — chưa phép kiểm nào ghim nút «Đã lưu trữ» nằm cùng chỗ ở dạng bảng và Kanban; chỉ kiểm có mặt.
- Chấp nhận, không sửa (Cổng Bằng chứng 2026-10-09): Ngoài-5 — kiểm «thoả thuận đã cất vắng trên Kanban trước khi bấm» không có đối chứng dương rằng Kanban đã tải xong.
- Hợp đồng mới (Cổng Bằng chứng 2026-10-09):
  - Ngoài-1, Ngoài-2, Ngoài-3 — cùng gốc: lưu trữ hàng loạt chỉ trả số đếm, không trả id thật sự đã cất. Hoàn tác báo xanh che lỗi khôi phục thật và có thể đếm dư; khôi phục cả bản người khác vừa cất; lưu trữ một phần in câu lỗi tiếng Anh thô của máy chủ.
  - Ngoài-7 — dải báo «Đã lưu trữ» và vùng khoá chỉ đọc nằm trong `apps/app`, chưa thành mảnh dùng chung ở `packages/ui` như `docs/vong-doi.md` dặn.
