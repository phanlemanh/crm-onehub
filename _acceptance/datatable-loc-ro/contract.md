---
schema_version: 1
feature: «Bảng rỗng vì đang lọc thì nói rõ, nút bỏ lọc đúng tên, lựa chọn có số 0 vẫn hiện»
slug: datatable-loc-ro
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-07-datatable-loc-ro-design.md
---

# Acceptance Contract: datatable-loc-ro

## Context

Mọi phòng ban lên CRM sau 14/10 lọc danh sách thoả thuận, cá nhân, công ty và thành viên. Ba chỗ hở:
bảng rỗng vì lọc nói giống bảng chưa có dữ liệu và không có đường ra tại chỗ; nút trong menu con
một tiêu chí ghi «Bỏ hết tiêu chí» mà chỉ bỏ tiêu chí đó; lựa chọn đếm 0 bị giấu, kể cả lựa chọn đang
chọn. Vòng này đưa bốn bảng về mẫu màn OKR đã dùng, làm ở `DataTable` dùng chung.

Source input: `docs/plan/lo-trinh-okr.json` hàng E7; `_acceptance/datatable-loc-ro/opportunity.md`
(Cổng Đáng `build`, luật 16 đợt sau-14-10); thiết kế anh duyệt 07/10 (phương án A cho lựa chọn số 0).

## Criteria

- AC-1: Given `DataTable` không đang tải và không có dòng nào, When nguồn lọc là một trong năm ca — một tiêu chí thường có giá trị, một tiêu chí trường tuỳ chỉnh (`field:…`) có giá trị, bộ lọc trạng thái khác «Tất cả», `searchActive`, hoặc trộn cả bốn — Then ô bảng hiện `Empty` với tiêu đề «Không có kết quả nào khớp bộ lọc» và mô tả của khoá `table.noMatchDescription`, không hiện câu `empty` của màn; When không có nguồn lọc nào (kể cả khi `filters` chỉ chứa khoá bộ lọc trạng thái với giá trị «all»), Then hiện câu `empty` của màn như cũ; When đang tải, Then hiện `Spinner`, không hiện câu nào.
- AC-2: Given ô rỗng vì lọc ở AC-1, When màn có truyền `onClearFilters`, Then có đúng một nút «Bỏ lọc» trong ô rỗng và bấm nó gọi `onClearFilters` đúng một lần; When màn không truyền `onClearFilters`, Then ô rỗng vẫn hiện tiêu đề và mô tả nhưng không có nút.
- AC-3: Given bảng cá nhân, công ty, thoả thuận hoặc thành viên đang có từ khoá tìm, ít nhất một tiêu chí thường, một tiêu chí trường tuỳ chỉnh (trừ thành viên), bộ lọc trạng thái «Đóng» (thoả thuận), chế độ «Đã lưu trữ» (trừ thành viên) và một cột sắp xếp, When kết quả rỗng và người bấm «Bỏ lọc» một lần, Then URL sau lần bấm đó có `q` rỗng, mọi tiêu chí rỗng, `fields` rỗng kể cả khi có hai trường tuỳ chỉnh cùng đang chọn, trạng thái «all», trang 1, còn `archived`, `sort`, `dir` giữ nguyên; truy vấn danh sách kế tiếp mang đúng đầu vào đó.
- AC-4: Given menu con của một tiêu chí, When tiêu chí có ít nhất một lựa chọn đang chọn, Then đầu menu con có mục «Bỏ chọn» (en «Clear») ở cả menu thường lẫn menu có ô tìm, và bấm nó chỉ làm rỗng tiêu chí đó, các tiêu chí khác giữ nguyên, menu con vẫn mở; When tiêu chí chưa chọn gì, Then không có mục đó; và chuỗi «Bỏ hết tiêu chí» không còn trong bộ chữ của `packages/ui`.
- AC-5: Given `DataTable` nhận `facetCounts` có mục cho một tiêu chí, When mở menu con của tiêu chí đó, Then mỗi lựa chọn in số đếm của nó (giá trị không có trong mục = 0), lựa chọn số 0 vẫn hiện và tick được; When `facetCounts` không có mục cho tiêu chí, Then lựa chọn không in số; và bộ lọc trạng thái hiện mọi lựa chọn kể cả lựa chọn đếm 0, kèm số khi có đếm.
- AC-6: Given bốn bảng nhận từ API đếm trong đó một số lựa chọn bằng 0, When mở menu lọc, Then ma trận viết trước bảng × tiêu chí — cá nhân {người phụ trách, công ty, hoạt động, trường tuỳ chỉnh}, công ty {người phụ trách, làm giàu, hoạt động, trường tuỳ chỉnh}, thoả thuận {người phụ trách, giai đoạn, thời hạn chốt, trường tuỳ chỉnh}, thành viên {vai trò} — mỗi ô hiện đủ mọi lựa chọn nguồn, lựa chọn đếm 0 mang số 0; tiêu chí giá trị tự do rút từ đếm — chức danh, cấp bậc, chân dung của cá nhân và ngành của công ty — giữ lựa chọn đang chọn dù đếm không còn nó, kèm số 0; và menu lọc của Kanban thoả thuận cũng in số.
- AC-7: Given thoả thuận, cá nhân hoặc công ty không có bản ghi và không lọc gì, When mở danh sách (không ở «Đã lưu trữ»), Then câu rỗng là «Chưa có thoả thuận nào.», «Chưa có cá nhân nào.», «Chưa có công ty nào.» (en «No deals yet.», «No contacts yet.», «No companies yet.»), không chứa «bộ lọc»; ở «Đã lưu trữ» câu cũ giữ nguyên.
- AC-8: Given người đăng nhập trên app thật ở khổ 1440, When ở danh sách thoả thuận chọn trong menu Giai đoạn một giai đoạn đếm 0 (menu in «0» cạnh tên giai đoạn), Then bảng hiện «Không có kết quả nào khớp bộ lọc» và nút «Bỏ lọc» trong khung nhìn, không tràn ngang; When bấm «Bỏ lọc», Then bảng có dòng trở lại và địa chỉ không còn tham số tiêu chí, trường tuỳ chỉnh hay tìm kiếm; And ở danh sách cá nhân, menu con của một trường tuỳ chỉnh dạng lựa chọn có một lựa chọn chưa ai dùng thì lựa chọn đó hiện kèm «0». Given khổ 375 và địa chỉ danh sách thoả thuận đã lọc sẵn theo giai đoạn đếm 0, When mở trang, Then câu và nút «Bỏ lọc» nằm trong khung nhìn, không tràn ngang; When bấm «Bỏ lọc», Then bảng có dòng trở lại và địa chỉ không còn tham số giai đoạn.
- AC-9: Given các khoá chữ mới và đổi của vòng (`table.clearFilters`, `table.noMatch`, `table.noMatchDescription`, `table.resetFilters`, ba câu `empty`), When soát bằng `messages-guard` và bài chữ của bảng, Then đủ bản vi và en, bản vi có dấu, không chữ nào để trống, mỗi khoá có bản en khác bản vi và không chứa chữ có dấu tiếng Việt, và bảng ở `en` (ô rỗng vì lọc, menu con có lựa chọn) không lọt chữ tiếng Việt nào của vòng.
- AC-10: Given màn OKR dùng `DataTableFacetMenu` không truyền đếm và các nơi gọi `DataTable` khác (khoá API, SSO, chiến dịch, danh mục), When chạy bài kiểm sẵn có của bộ lọc OKR và của `DataTable` (`loc-okr-ten`, `loc-okr-tai-truoc`, `render-diff`, `lai-ra-man`, `data-table-locale`), Then cả năm thoát 0 không sửa kỳ vọng của bài OKR.
- AC-11: Given các tệp giao diện sửa của vòng (`data-table.tsx`, bốn bảng, `field-facets.tsx`), When chạy sàn thiết kế của kho, Then không vi phạm P0, và trong bốn bảng không phần tử nào nhập từ `@crm/ui` mang `className` có lớp màu, góc hay khoảng cách (mọi biến thể `p*`, `m*`, `gap*`, `space-*`) mới so với merge-base với `onehub`.

## Coverage

Quét bằng `morphological-scan` preset test-matrix (S1, 07/10).

- Trục A — Rỗng vì đâu: không lọc | tiêu chí thường | trường tuỳ chỉnh | bộ lọc trạng thái | tìm kiếm | trộn | đang tải | đang xem «Đã lưu trữ» [thước CE: các nguồn trạng thái của `useTableQuery` — `q`, `tabId`, `facetIds`, `fields`, `archived` — SUY-TỪ-REPO `apps/app/components/data-table/use-table-query.ts`]
- Trục B — Chỗ hiện: `DataTable` dùng chung | cá nhân | công ty | thoả thuận bảng | thoả thuận Kanban | thành viên | OKR (hồi quy) [thước CE: mọi nơi nhập `@crm/ui/components/data-table` — grep 07/10]
- Trục C — Kiểu tiêu chí: liệt kê cố định | danh sách người | giá trị tự do rút từ đếm | có ô tìm | trường tuỳ chỉnh [thước CE: khối facet của bốn bảng + `field-facets.tsx`]
- Trục D — Khổ: 375 | 1440 [thước CE: luật kho đo hai khổ cho mặt người nhìn]
- Chân ngành: Linear (câu không khớp + xoá bộ lọc ngay tại danh sách rỗng); NN/g «empty states» (nói lý do rỗng, chỉ đường ra) [NGÀNH: Linear; NN/g]
- Core → AC: ô rỗng theo ma trận nguồn (AC-1) · nút bỏ lọc (AC-2, AC-3) · «Bỏ chọn» (AC-4) · số đếm và lựa chọn 0 (AC-5, AC-6) · câu không lọc (AC-7) · màn thật (AC-8) · chữ (AC-9) · hồi quy OKR (AC-10) · sàn thiết kế (AC-11).
- Later: nút «Bỏ lọc» thường trực trên thanh công cụ; giữ lựa chọn đang chọn của tiêu chí Công ty khi nó ngoài kết quả tìm; đếm theo các tiêu chí còn lại.
- Never: tự bỏ lọc khi bảng rỗng; giấu lựa chọn 0 sau một công tắc.

## Đường đo

- Thước: ≥ 4/5 người gặp bảng rỗng vì lọc tự bỏ lọc trong ≤ 1 thao tác · số từ: nhật ký vấp của lái-thử người-lạ trên production (nghi thức `uat-session` §0), cảnh «chọn giai đoạn không có thoả thuận» · bảo đảm bởi: AC-1, AC-2, AC-8
- Thước: 0 lần kẹt một lựa chọn đang chọn không thấy trong menu · số từ: cùng nhật ký vấp, cảnh «chọn người phụ trách rồi gõ tìm kiếm» · bảo đảm bởi: AC-5, AC-6
- Thước: < 2/5 người đọc bảng rỗng là «chưa có dữ liệu» · số từ: câu hỏi sau cảnh lái-thử «bảng đang nói gì?» · bảo đảm bởi: AC-1, AC-7

## Out of scope

- Đổi cách API đếm (đếm theo các tiêu chí còn lại) — `apps/api` ngoài ranh giới.
- Nút «Bỏ lọc» thường trực trên thanh công cụ của bảng.
- Lựa chọn đang chọn của tiêu chí Công ty (có ô tìm) khi nó nằm ngoài kết quả tìm của menu.
- Bảng không dùng `useTableQuery` hay không có tiêu chí (khoá API, SSO, chiến dịch, danh mục): không đổi hành vi, chỉ phải không hồi quy (AC-10).
- Chữ rỗng của bảng thành viên (`settings-thanh-vien.ts`): ca không lọc mà rỗng không xảy ra.
- Menu con của tiêu chí lọc mở ra ngoài màn hình ở khổ điện thoại (đo 07/10: hộp ở x=359, rộng 208, khung 375) — lỗi có từ trước, tách thành hàng sửa riêng; vòng này không đo đường chọn qua menu ở 375.

## Notes

- Không migration, không đổi API.
- Tệp ngoài ranh giới đã được giám sát duyệt: `packages/ui/src/lib/messages.ts` và ba tệp chữ app (P3-2); hai tệp kiểm DOM mới và khoá `dlr_` trong `_acceptance/config.yaml` (P3-4, đang chờ trả lời).
- Đường nền dùng lại của `so-moi-khong-chap-chon` (P4), cùng sha 0426cc9d0, giám sát duyệt P3-3.
