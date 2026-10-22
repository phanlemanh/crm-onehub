# Quét độ phủ — loc-moi-truong (DA18)

Preset `entity-feature` của skill `morphological-scan`, đọc trên onehub `c6a718f3d` và nhánh DA17
`feat/sort-moi-truong` (`a4b1845be`, chỉ đọc).

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub. Người dùng là nhân viên quan hệ đối tác, lọc danh sách Thoả thuận, Công ty, Liên hệ
  và bảng cột thoả thuận; người làm chiến dịch dựng đoạn liên hệ từ bộ lọc đã lưu.
- Chân sản phẩm: đào repo.
  - Luật đích, bảng lọc theo kiểu [SUY-TỪ-REPO: docs/design.md].
  - Mười kiểu trường tự tạo [SUY-TỪ-REPO: packages/db/src/fields-shape.ts].
  - Khuôn bộ lọc đã lưu [SUY-TỪ-REPO: packages/validation/src/saved-view.ts].
  - Chiến dịch đọc bộ lọc đã lưu [SUY-TỪ-REPO: apps/api/src/campaigns/campaigns.service.ts].
  - Hai cách mã hoá trên đường dẫn [SUY-TỪ-REPO: apps/app/components/data-table/list-search-params.ts].
  - Mốc Ngày chốt [SUY-TỪ-REPO: apps/api/src/deals/deals.service.ts].
- Chân ngành: HubSpot CRM lọc thuộc tính tự tạo bằng «chứa», «trong khoảng», «đã biết / chưa biết» và lưu thành
  view; Attio lọc thuộc tính theo kiểu (chữ chứa, số so sánh, ngày tương đối, trống) [NGÀNH: HubSpot CRM, Attio].
  Phần này chỉ để đối chiếu; luật của kho đã đòi bảng lọc theo kiểu.

## Trục

- **Kiểu**: Chữ · Chữ dài · Liên kết · Email · Điện thoại · Số · Ngày · Ô tích · Chọn · Người · Tiền (chỉ trường chuẩn)
  · Tệp (DA19). [thước CE: `FIELD_TYPES` + bảng kiểu của `docs/design.md` mục «Trường»]
- **Cách lọc**: chứa · khoảng · mốc · Có/Không · lựa chọn · trống. [thước CE: cột «Lọc» của bảng kiểu ở
  `docs/design.md`]
- **Mặt**: API danh sách · bảng cột · số đếm · đường dẫn · bộ lọc đã lưu · chiến dịch · Cài đặt › Trường · menu Bộ lọc
  trên màn. [thước CE: câu giao DA18 + ghi chú hàng (SavedView.filters, campaigns-config.ts) + luật 34]
- **Trạng thái dữ liệu**: có giá trị · trống không hàng · trống hàng `null` · giá trị ở đúng biên khoảng / ranh tháng
  · giá trị sai cú pháp · trường đã lưu trữ · trường tắt «Hiện trong bộ lọc» · bộ lọc lưu theo khuôn cũ · đường dẫn cũ
  `?fields=`. [thước CE: hai dạng trống của DA17 (`sort-moi-truong` E1b) + `parseSavedViewFilters`]

## Không gian

Kiểu × cách lọc chỉ có nghĩa theo bảng kiểu (mỗi kiểu một cách lọc chính cộng «trống»): 10 cặp sống cho trường tự tạo.
Mười cặp × ba loại bản ghi × tám mặt = 240 ô; gạch:

- bảng cột chỉ có ở Thoả thuận;
- chiến dịch chỉ đọc bộ lọc Liên hệ;
- Tiền: không có trường tự tạo Tiền; khoảng Tiền của Giá trị cần quyết tiền gốc hay quy đổi;
- Tệp thuộc DA19;
- Ô tích không có «trống» (`no` đã gồm bản ghi chưa có giá trị);
- số đếm cho ô chữ và khoảng số: không có danh sách giá trị để đếm.

Còn lại quét theo lát «mặt».

## Core

1. Chữ «chứa» và trống, ở API → AC-1.
2. Số khoảng, một đầu, biên, trống → AC-2.
3. Ngày theo mốc, Ô tích Có/Không → AC-3.
4. Trống của Chọn, Người, hai dạng trống → AC-4.
5. Công ty, Liên hệ, bảng cột, số đếm, tốc độ → AC-5.
6. Khoá chết, giá trị hỏng, trường tắt «Hiện trong bộ lọc», Cài đặt › Trường mở cho mọi kiểu → AC-6.
7. Bộ lọc đã lưu khuôn cũ và chiến dịch đọc như cũ, không chép đè → AC-7.
8. Một cách mã hoá đường dẫn, đường dẫn cũ còn mở → AC-8.
9. Bộ lọc đã lưu của Thoả thuận ở bảng và bảng cột → AC-9.
10. Mắt người ở 1280 và 375 → AC-10.

## Later

- Bộ lọc chữ, số cho trường chuẩn chưa lọc được (Tên miền, Điện thoại, Chức danh…) — đích của `docs/design.md`, theo
  dõi ở các hàng DA14–DA20.
- Khoảng Tiền của Giá trị — cần quyết tiền gốc hay quy đổi theo `docs/currency.md`.
- Lọc Tệp có / chưa có — DA19.
- Bỏ dấu khi lọc «chứa» — theo Hỏi-3.

## Never

- Bộ lọc «hoặc» giữa hai trường, nhóm điều kiện lồng nhau — kho không có ở mặt lọc chuẩn, `docs/design.md` không đòi.
- Chép lại dòng `SavedView` sang khuôn mới — dữ liệu người dùng, ghi chú hàng cấm chép đè.

## Cross-cutting áp mọi ô Core

- Cô lập dữ liệu thử theo tiền tố tên của ca (kho thử của lượt dùng chung giữa các tệp).
- Bộ lọc mới không đổi kết quả của mặt lọc chuẩn có sẵn khi không dùng trường tự tạo.
