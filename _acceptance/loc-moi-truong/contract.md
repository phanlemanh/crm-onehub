---
schema_version: 1
feature: "Nhân viên quan hệ đối tác lọc danh sách theo trường chữ, số, ngày, ô tích hay ô trống, và lưu bộ lọc ấy cho cả Thoả thuận"
slug: loc-moi-truong
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: verified
approved_by: manh
approved_at: 2026-10-21T09:34:22Z
design_doc: docs/superpowers/specs/2026-10-21-loc-moi-truong-design.md
---

# Acceptance Contract: loc-moi-truong

## Context

Hàng DA18 của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511), mã phạm vi L3, L4, L5. Chủ kho
duyệt Cổng Đáng (build) ngày 20/10/2026 («Tôi duyệt Cổng Đáng build cho cả 9 hàng»). Mốc đợt là 2026-10-22.

Soạn trên giấy theo luật 43 của đợt: mã chỉ viết sau khi DA17 `sort-moi-truong` (#521) gộp onehub, rồi hàng này gộp
onehub vào nhánh. DA17 và DA18 cùng chạm `*.service.ts` của ba loại bản ghi và `list-search-params.ts` (luật 34).

Hôm nay trên onehub `c6a718f3d`:

- Lọc trường tự tạo chỉ có kiểu Chọn và Người (`filterableFieldsFor`), không có «trống».
- Trường tự tạo và mặt lọc chuẩn mã hoá trên đường dẫn hai cách: khoá lặp (`?stage=a`) và một khoá JSON
  (`?fields={…}`).
- Bộ lọc đã lưu (`SavedView.filters`) giữ trường tự tạo dưới khoá `field:<khoá>`; chiến dịch đọc đúng khuôn ấy.
- Tắt «Hiện trong bộ lọc» của một trường làm bộ lọc đã lưu mang trường ấy lặng lẽ thôi lọc (Hỏi-5 quyết giữ hay gỡ).
- Thoả thuận không có bộ lọc đã lưu.

Bảng lọc theo kiểu (design doc mục 1, theo `docs/design.md` mục «Trường»):

| Kiểu | Lọc | Giá trị |
|---|---|---|
| Chữ, Chữ dài, Liên kết, Email, Điện thoại | chứa, không phân biệt hoa thường | `has:<chữ>` |
| Số | khoảng gồm hai đầu, một đầu được | `gte:<số>`, `lte:<số>` |
| Ngày | mốc như Ngày chốt | `overdue`, `this-month`, `next-month`, `later` |
| Ô tích | Có / Không | `yes`, `no` |
| Chọn, Người | nhiều giá trị | id, như hôm nay |
| mọi kiểu trừ Ô tích | trống | `none` |

Source input: `opportunity.md` · câu giao DA18 · `docs/plan/pham-vi-truong-hop-dong.md` (L3–L5) · `docs/design.md`
mục «Trường» · hợp đồng và sổ DA17 · LUAT.md của đợt (luật 31, 34, 43) · design doc.

## Criteria

- AC-1 (cross-layer): Given Thoả thuận có trường tự tạo kiểu Chữ, Chữ dài, Liên kết, Email, Điện thoại, với bản ghi
  chứa chuỗi tìm ở đầu, giữa, cuối, khác hoa thường, bản ghi không chứa, và bản ghi trống, When gọi `deals.list` với
  `fields: {<khoá>: ["has:<chữ>"]}`, `["none"]` và `["has:<chữ>", "none"]`, Then:
  - `has:` trả đúng các bản ghi chứa chuỗi, không phân biệt hoa thường;
  - `none` trả đúng các bản ghi trống;
  - hai giá trị cùng nhau là «hoặc»;
  - `total` bằng số bản ghi khớp, và mặt lọc chuẩn (`q`, người phụ trách, giai đoạn, lưu trữ) vẫn áp cùng lúc như «và».
- AC-2 (cross-layer): Given Thoả thuận có trường Số với giá trị âm, 0, thập phân, đúng hai biên, ngoài khoảng và trống,
  When gọi `deals.list` với `["gte:<a>", "lte:<b>"]`, chỉ `gte`, chỉ `lte`, và `["gte:<a>", "none"]`, Then:
  - khoảng gồm cả hai biên;
  - khoảng một đầu chỉ chặn một phía;
  - `none` cộng khoảng là «hoặc»;
  - thứ tự và `total` như AC-1.
- AC-3 (cross-layer): Given Thoả thuận có trường Ngày với ngày hôm qua, đầu và cuối tháng này, đầu tháng sau, sau đó và
  trống, cùng trường Ô tích đánh dấu, bỏ dấu và chưa có giá trị, When lọc Ngày theo từng mốc, theo hai mốc cùng lúc,
  theo `none`, và lọc Ô tích theo `yes`, `no`, Then:
  - mỗi mốc trả đúng bản ghi trong ranh tháng tính như `closingFilter` của Ngày chốt, theo giờ máy chủ;
  - `overdue` của trường Ngày tự tạo là trước hôm nay, không xét giai đoạn;
  - hai mốc là «hoặc»;
  - `no` gồm cả bản ghi bỏ dấu lẫn bản ghi chưa có giá trị.
- AC-4 (cross-layer): Given trường Chọn và trường Người có bản ghi có giá trị, bản ghi không có hàng giá trị, và bản ghi
  có hàng giá trị mà cột lưu là `null` vì lựa chọn hay người đã bị xoá (`SetNull`), When lọc `["none"]`, `["none",
  <id>]`, và mỗi kiểu của AC-1 đến AC-3 với `["none"]`, Then:
  - «trống» gồm cả hai dạng trống ở mọi kiểu;
  - `none` cộng một id là «hoặc»;
  - lọc theo id như hôm nay vẫn cho đúng kết quả cũ.
- AC-5 (cross-layer): Given Công ty và Liên hệ có trường Chữ, Số, Ngày, Ô tích, và bảng cột Thoả thuận, When gọi
  `companies.list`, `contacts.list` và `deals.board` với các bộ lọc của AC-1 đến AC-4, Then:
  - cùng luật cho kết quả như ở `deals.list`;
  - `deals.board` lọc thẻ trong mỗi cột giai đoạn, và đếm, tổng tiền của cột chỉ tính thẻ khớp;
  - `facetCounts` của ba danh sách có số đếm cho `yes`/`no`, bốn mốc Ngày và `none` của mọi trường bật «Hiện trong bộ
    lọc», mỗi số bằng `total` khi lọc riêng giá trị ấy cùng các bộ lọc khác;
  - trên kho thử 5.000 thoả thuận với sáu trường bật «Hiện trong bộ lọc», trung vị năm lượt `deals.list` có ba bộ lọc
    trường không quá 1 giây (cùng trần chủ kho đã duyệt cho sort ở AC-8 của DA17).
- AC-6 (cross-layer): Given bộ lọc mang khoá không có, trường đã lưu trữ, trường của loại bản ghi khác, trường tắt «Hiện trong bộ
  lọc», và giá trị sai cú pháp với kiểu của trường (`gte:abc` cho Số, `has:x` cho Ngày, `maybe` cho Ô tích), When gọi
  `list` của ba loại bản ghi, `deals.board`, và mở Cài đặt › Trường, Then:
  - khoá không có, trường đã lưu trữ, trường khác loại: bộ lọc ấy bị bỏ qua, không lỗi, kết quả bằng khi không có nó;
  - trường tắt «Hiện trong bộ lọc» theo Hỏi-5: khuyến nghị — không lọc, kết quả bằng khi không có nó, như hôm nay;
  - giá trị sai cú pháp trên trường còn sống: `BAD_REQUEST` nêu tên trường;
  - `fields.filters` trả mọi trường còn sống bật «Hiện trong bộ lọc», mọi kiểu trong `FIELD_TYPES`;
  - ở Cài đặt › Trường, ô «Hiện trong bộ lọc» có mặt khi sửa trường của mọi kiểu ấy, và bật nó thì lượt lưu mang
    `showOnFilter: true`;
  - quyết định kiểu nào lọc thế nào đọc từ một bảng dùng chung cho API, app và bộ phân tích giá trị.
- AC-7 (cross-layer): Given bộ lọc đã lưu do bên ghi của onehub `c6a718f3d` (`currentView`) sinh rồi lưu qua
  `savedViews.create` (Chọn và Người dưới `field:<khoá>`, `owner` với `unassigned`, thẻ trạng thái), một chiến dịch dùng bộ lọc Liên hệ ấy làm đoạn, và
  một bộ lọc Liên hệ mới mang `has:`, `gte:`, mốc và `none`, When đọc danh sách theo từng bộ lọc đã lưu và đọc thành
  viên, số thành viên của chiến dịch, Then:
  - bộ lọc khuôn cũ cho đúng các bản ghi mà cùng bộ lọc cho trên onehub `c6a718f3d` với cùng dữ liệu;
  - `memberCount` và trang thành viên của chiến dịch dùng bộ lọc khuôn cũ bằng đáp án ấy, kể cả bộ lọc mang một trường
    Chọn đã tắt «Hiện trong bộ lọc» (theo Hỏi-5);
  - chiến dịch dùng bộ lọc mới có số thành viên bằng `total` của `contacts.list` cùng bộ lọc;
  - không dòng `SavedView` nào bị ghi lại (`filters` và `updatedAt` của mọi dòng không đổi sau khi đọc).
- AC-8: Given ba danh sách ở `apps/app`, When người đổi bộ lọc trường tự tạo, mở đường dẫn mới, mở đường dẫn cũ mang
  `?fields={…}`, và lưu rồi áp một bộ lọc, Then:
  - bộ lọc trường tự tạo ghi lên đường dẫn thành khoá lặp `field:<khoá>=<giá trị>`, không còn tham số `fields`;
  - mặt lọc chuẩn giữ khoá và cách ghi như hôm nay;
  - dán đường dẫn mới vào phiên mới thì lượt tải danh sách mang đúng `fields` ấy, ở máy chủ và máy khách như nhau;
  - đường dẫn cũ `?fields={…}` cho cùng đầu vào và được ghi lại theo cách mới;
  - giá trị hỏng trên đường dẫn bị bỏ trước khi gọi API;
  - `currentView` rồi `applyView` giữ nguyên mọi kiểu giá trị của bảng lọc, và khuôn lưu vẫn là `SavedViewFilters`.
- AC-9: Given danh sách Thoả thuận ở bảng và bảng cột, When người lưu bộ lọc đang có (thẻ trạng thái, người phụ trách,
  mốc Ngày chốt, hai bộ lọc trường tự tạo, sort), chia sẻ, áp lại ở phiên khác, và xoá nó, Then:
  - menu Bộ lọc đã lưu có ở cả bảng lẫn bảng cột, như ở Liên hệ và Công ty;
  - áp bộ lọc đặt lại đúng đường dẫn và lượt tải mang đúng đầu vào ở cả hai kiểu xem;
  - bộ lọc lưu với `entity: DEAL`, không có số bản ghi, và không có trong danh sách chọn đoạn của chiến dịch;
  - kiểu xem theo Hỏi-2.
- AC-10: Given mỗi danh sách có một trường tự tạo mỗi kiểu bật «Hiện trong bộ lọc», When người mở menu Bộ lọc của Thoả
  thuận ở 1280 và 375, lọc theo trường Chữ, Số (gõ «1.234,5»), Ngày, Ô tích, chọn «Trống», rồi lưu bộ lọc, Then:
  - trường Chữ có ô «Chứa…», trường Số có ô «Từ», «Đến», trường Ngày có năm mốc theo Hỏi-1, Ô tích có Có/Không, mỗi lựa
    chọn có số đếm;
  - gõ «abc» vào «Từ» thì ô báo «Ô này nhận số, ví dụ 1.234,5», đường dẫn không đổi;
  - nút Bộ lọc hiện số bộ lọc đang bật, bảng chỉ còn hàng khớp;
  - bộ lọc đã lưu có trong menu và áp lại được;
  - không cuộn ngang ở 375.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`), preset `entity-feature`. Bốn trục:

- kiểu: Chữ · Chữ dài · Liên kết · Email · Điện thoại · Số · Ngày · Ô tích · Chọn · Người · Tiền (chỉ trường chuẩn) ·
  Tệp (DA19);
- cách lọc: chứa · khoảng · mốc · Có/Không · lựa chọn · trống;
- mặt: API danh sách · bảng cột · số đếm · đường dẫn · bộ lọc đã lưu · chiến dịch · Cài đặt › Trường · menu Bộ lọc;
- trạng thái dữ liệu: có giá trị · hai dạng trống · biên khoảng và ranh tháng · giá trị hỏng · trường đã lưu trữ ·
  trường tắt «Hiện trong bộ lọc» · khuôn lưu cũ · đường dẫn cũ.

Thước CE:

- bảng lọc theo kiểu [SUY-TỪ-REPO: docs/design.md mục «Trường»];
- danh sách kiểu [SUY-TỪ-REPO: packages/db/src/fields-shape.ts FIELD_TYPES];
- khuôn bộ lọc đã lưu [SUY-TỪ-REPO: packages/validation/src/saved-view.ts];
- chiến dịch đọc bộ lọc [SUY-TỪ-REPO: apps/api/src/campaigns/campaigns.service.ts contactListFor];
- mốc Ngày chốt [SUY-TỪ-REPO: apps/api/src/deals/deals.service.ts closingFilter];
- hai dạng trống [SUY-TỪ-REPO: _acceptance/sort-moi-truong trên nhánh feat/sort-moi-truong, E1b];
- lọc thuộc tính tự tạo theo kiểu và lưu view [NGÀNH: HubSpot CRM, Attio].

Ánh xạ Core sang AC:

- Chữ → AC-1; Số → AC-2; Ngày, Ô tích → AC-3; trống và hai dạng trống → AC-4;
- Công ty, Liên hệ, bảng cột, số đếm, tốc độ → AC-5;
- khoá chết, giá trị hỏng, Cài đặt › Trường, một bảng dùng chung → AC-6;
- bộ lọc đã lưu và chiến dịch → AC-7;
- đường dẫn → AC-8;
- bộ lọc đã lưu của Thoả thuận → AC-9;
- mắt người → AC-10.

Later và Never ở `coverage-scan.md`.

## Đường đo

Ô Cổng Đáng để trống ngưỡng; máy đề xuất (Hỏi-4 của design doc):

- Thước: ở phiên nghiệm thu, ít nhất bốn trên năm người lọc được thoả thuận theo một trường Số trong khoảng và lưu thành
  bộ lọc mà không hỏi · số từ: phiên nghiệm thu sau khi lên production (đếm tay) · bảo đảm bởi: AC-2, AC-9, AC-10
- Thước: lọc được bản ghi còn trống một trường để đi bổ sung · số từ: phiên nghiệm thu (đếm tay) · bảo đảm bởi: AC-4,
  AC-10
- Thước: không chiến dịch nào đổi số thành viên vì hàng này (dấu CHẾT) · số từ: trên cùng một bản chụp dữ liệu
  production, tập thành viên mỗi chiến dịch theo logic onehub `c6a718f3d` so với logic mới; khác 0 là CHẾT · bảo đảm bởi:
  AC-7

## Out of scope

- Bộ lọc chữ, số cho trường chuẩn chưa lọc được hôm nay (Tên miền, Điện thoại, Chức danh, Giá trị…).
- Khoảng Tiền của Giá trị.
- Lọc Tệp có / chưa có (DA19).
- Bỏ dấu khi lọc «chứa» (Hỏi-3).
- Bộ lọc «hoặc» giữa hai trường, nhóm điều kiện lồng nhau.
- Đổi khuôn `SavedView.filters`, chép lại dòng đã lưu, migration.
- Số đếm cho ô chữ và khoảng số.
- Chiến dịch nhận bộ lọc của Thoả thuận hay Công ty làm đoạn.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Không chạm schema Prisma, không migration.
- `packages/ui/src/components/data-table.tsx` (dạng ô chữ và khoảng số của menu Bộ lọc) là vùng Mac Studio: gửi
  `cham-tep` (luật 31) trước S3.
- Hàng không thêm loại bản ghi hay trạng thái kết thúc; ba câu của `docs/vong-doi.md` không áp. Xoá bộ lọc đã lưu dùng
  đường có sẵn của `SavedViewsMenu`, gồm chặn xoá khi chiến dịch đang dùng.
- Né `apps/app/components/crm/record-sheet/**` và `apps/app/(app)/[slug]/okr/**` tới khi #525 gộp.
