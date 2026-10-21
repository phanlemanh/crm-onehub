---
schema_version: 1
feature: "Nhân viên quan hệ đối tác sắp danh sách theo bất kỳ trường nào và thấy cột trường tự tạo ở khổ hẹp như cột có sẵn, cả trên thẻ Kanban"
slug: sort-moi-truong
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: implemented
approved_by: manh
approved_at: 2026-10-21T01:22:12Z
design_doc: docs/superpowers/specs/2026-10-21-sort-moi-truong-design.md
---

# Acceptance Contract: sort-moi-truong

## Context

Hàng DA17 của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511). Chủ kho duyệt Cổng Đáng (build)
ngày 20/10/2026. Mốc đợt là 2026-10-22.

DA17 đứng trên DA14 `truong-mot-cach-cu-xu`. DA14 dựng bảng đăng ký theo kiểu ở
`apps/app/components/crm/fields/kieu-truong.tsx` (`OTruongBang`, `HienThiTruong`). Hợp đồng DA14 đã duyệt 21/10,
chưa gộp. Phần app của DA17 (AC-5, AC-6, AC-7 vế thẻ, AC-9) viết sau khi DA14 gộp. Phần API (AC-1 đến AC-4, AC-7 vế
API, AC-8) không phụ thuộc DA14.

Hôm nay trên onehub `03d4842f1`:

- `SORTABLE` của ba service chỉ có cột chuẩn. Một `sort` lạ lặng lẽ về thứ tự mặc định.
- Cột trường tự tạo không sort được, và luôn ẩn dưới `lg`.
- Cột Điện thoại của Liên hệ không sort được.
- Thẻ Kanban bỏ giá trị trường.

Luật đích ở `docs/design.md` mục «Trường»: một bảng kiểu khai sort và cách ẩn theo khổ cho mọi trường, chuẩn hay tự
tạo. Bảng kiểu sort ở đây:

| Kiểu | Sort theo |
|---|---|
| Chữ, Chữ dài, Liên kết, Email, Điện thoại | chữ, A→Z |
| Số | số |
| Ngày | ngày |
| Chọn | thứ tự lựa chọn ở Cài đặt › Trường |
| Người | tên người |
| Ô tích | không sort |

Source input: `opportunity.md` · câu giao DA17 · `docs/design.md` mục «Trường» · hợp đồng và thiết kế DA14 · design
doc.

## Criteria

- AC-1 (cross-layer): Given một danh sách Thoả thuận có trường tự tạo của mỗi kiểu sort được (Chữ, Chữ dài, Số,
  Ngày, Chọn, Người, Liên kết, Email, Điện thoại), có bản ghi trống và bản ghi hoà giá trị, When gọi `deals.list` với
  `sort=field:<khoá>` theo cả hai chiều, Then:
  - bản ghi có giá trị theo đúng thứ tự của kiểu (Chọn theo thứ tự lựa chọn, Người theo tên);
  - bản ghi trống đứng cuối ở cả hai chiều, gồm cả hai dạng trống: không có hàng giá trị, và hàng giá trị mà cột lưu
    là `null` (khoá ngoại `SetNull` để lại);
  - hoà giá trị thì theo tên bản ghi A→Z rồi `id`, như sort chuẩn;
  - đi hết mọi trang với `pageSize` nhỏ, kể cả trang vắt qua ranh có giá trị/trống: không bản ghi nào trùng hay
    sót, và `total` bằng số bản ghi khớp;
  - bộ lọc đang có (`q`, người phụ trách, giai đoạn, lưu trữ) vẫn áp như khi sort cột chuẩn.
- AC-2 (cross-layer): Given Công ty và Liên hệ có trường tự tạo, When gọi `companies.list` và `contacts.list` với
  `sort=field:<khoá>`, Then cùng luật như AC-1, đo trên ít nhất ba kiểu mỗi loại bản ghi (Chữ, Số, Ngày). Và
  `contacts.list` với `sort=phone` sắp theo Điện thoại A→Z, trống cuối, hoà theo `lastName`; một trường Điện thoại tự
  tạo mang cùng giá trị trên cùng các liên hệ cho đúng thứ tự ấy.
- AC-3: Given `sort` dạng `field:<khoá>` mà khoá không có, trường đã lưu trữ, trường thuộc loại bản ghi khác, kiểu
  Ô tích, hay chuỗi rác, When gọi `list` của ba loại bản ghi và `deals.board`, Then:
  - không ném lỗi;
  - thứ tự bằng đúng thứ tự khi `sort` rỗng;
  - một view đã lưu mang `sort` của trường vừa lưu trữ vẫn mở được, với thứ tự mặc định và không dòng báo nào (theo
    Hỏi-4, lối máy khuyên).
  - đối chứng: cùng khoá khi trường còn sống thì cho thứ tự khác thứ tự mặc định.
- AC-4 (cross-layer): Given bảng Kanban thoả thuận, When gọi `deals.board` với `sort=field:<khoá>` của trường Số và
  của trường Ngày, Then thẻ trong mỗi cột giai đoạn theo cùng luật thứ tự và trống cuối như AC-1, trần thẻ mỗi cột vẫn
  là `DEAL_BOARD.cardsPerColumn`, và đếm, tổng tiền của cột không đổi so với không sort.
- AC-5: Given ba bảng ở `apps/app`, When vẽ cột, Then:
  - mọi cột trường tự tạo có kiểu sort được khai `sortable: true`; cột Ô tích thì không;
  - mọi cột trường chuẩn có kiểu sort được khai `sortable: true`, gồm Điện thoại của Liên hệ;
  - bấm tiêu đề cột trường tự tạo đặt `sort=field:<khoá>` và `dir` trên đường dẫn, và lượt tải bảng kế mang đúng
    `sort`, `dir` ấy;
  - menu sort của bảng (lối sort trên điện thoại) liệt cột trường tự tạo sort được.

  Quyết định cột nào sort được đọc từ một bảng theo kiểu dùng chung với API, không khai riêng ở màn.
- AC-6: Given bảng đăng ký kiểu của DA14, When đọc `hideBelow` của mọi cột ba bảng, Then:
  - mỗi kiểu khai `hideBelow` một lần ở bảng đăng ký, theo bảng «Ẩn cột theo kiểu» của design doc;
  - cột trường tự tạo lấy `hideBelow` theo kiểu của nó, không còn `lg` cho mọi kiểu;
  - cột trường chuẩn có kiểu cũng lấy từ bảng ấy, và giá trị bằng đúng giá trị trên onehub `03d4842f1`;
  - ngoại trừ có tên: cột chính Tên, và cột không có dòng trong bảng «Trường chuẩn → kiểu» của DA14.
- AC-7 (cross-layer): Given ba trường tự tạo đã bật «Hiện trong bảng» theo thứ tự ở Cài đặt › Trường, một trường đã
  lưu trữ đứng đầu, When mở bảng Kanban, Then:
  - `deals.board` trả `fields` cho mỗi thẻ, chỉ mang hai trường chưa lưu trữ đầu tiên;
  - thẻ hiện mỗi trường có giá trị thành một dòng nhãn và giá trị, giá trị vẽ qua `HienThiTruong` (Số kiểu Việt
    với `tabular-nums`, Ngày, Người như ở bảng);
  - trường trống thì thẻ không có dòng đó (theo Hỏi-2);
  - trường thứ ba không hiện.
- AC-8: Given kho thử của lượt với 5.000 thoả thuận mẫu tạo qua đường ghi thật, mỗi bản ghi có một trường Số tự tạo
  và một phần mười trống, When gọi `deals.list` năm lượt sắp theo trường Số ở trang đầu và ở trang vắt qua ranh trống,
  Then trung vị không quá ba lần trung vị cùng lượt sắp theo Giá trị (`sort=amount`), và không quá 1 giây (theo
  Hỏi-3). Bài đo dọn hết bản ghi và trường nó tạo.
- AC-9: Given mỗi bảng có một trường tự tạo mỗi kiểu bật «Hiện trong bảng», và bảng Kanban có thẻ mang hai trường tự
  tạo, When người mở bảng Thoả thuận ở 1280 sắp theo một trường tự tạo, cùng bảng ở 768 và 375, và bảng Kanban ở
  1280 và 375, Then:
  - ở 1280: mũi tên sort ở cột trường tự tạo đang sắp, thứ tự hàng nhìn thấy đúng;
  - ở 768: cột trường tự tạo kiểu Người, Liên kết, Email, Điện thoại, Số hiện như cột chuẩn cùng kiểu; cột kiểu Chữ,
    Ngày, Chọn, Ô tích ẩn như Ngày chốt;
  - ở 375: menu sort của bảng có mục cho chín kiểu sort được, không có Ô tích; chọn trường Ngày thì đường dẫn mang
    `sort=field:<khoá>` và thứ tự hàng đúng;
  - trên thẻ Kanban: hai dòng trường tự tạo thẳng hàng với các dòng có sẵn, không vỡ chữ;
  - không cuộn ngang ở 375.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`), preset `entity-feature`. Bốn trục:

- kiểu: Chữ · Chữ dài · Số · Ngày · Ô tích · Chọn · Người · Liên kết · Email · Điện thoại · Tiền · Tệp (Tệp: DA19);
- loại bản ghi: Thoả thuận · Công ty · Liên hệ;
- mặt: sort ở bảng · sort trên Kanban · ẩn cột theo khổ · giá trị trên thẻ Kanban;
- trạng thái giá trị và trang: có giá trị · trống · hoà · trang vắt qua ranh · khoá sort không còn.

Thước CE:

- bảng sort theo kiểu [SUY-TỪ-REPO: docs/design.md mục «Trường»];
- danh sách kiểu [SUY-TỪ-REPO: packages/db/src/fields-shape.ts FIELD_TYPES];
- luật trống cuối của sort chuẩn [SUY-TỪ-REPO: apps/api/src/deals/deals.service.ts SORTABLE];
- `hideBelow` của cột chuẩn [SUY-TỪ-REPO: apps/app/app/(app)/[slug]/*/*-table.tsx];
- view đã lưu mang `sort` [SUY-TỪ-REPO: packages/validation/src/saved-view.ts];
- sort theo thuộc tính tự tạo [NGÀNH: HubSpot CRM, Attio].

Ánh xạ Core sang AC:

- kiểu × Thoả thuận × sort bảng, trống, hoà, trang → AC-1;
- Công ty, Liên hệ × sort bảng, Điện thoại chuẩn → AC-2;
- khoá sort không còn → AC-3;
- sort trên Kanban → AC-4;
- cột sort được ở app → AC-5;
- ẩn theo khổ → AC-6;
- giá trị trên thẻ Kanban → AC-7;
- tốc độ → AC-8;
- mắt người → AC-9.

Later và Never ở `coverage-scan.md`.

## Đường đo

- Thước: ở phiên nghiệm thu, ít nhất bốn trên năm người sắp được thoả thuận theo một trường tự tạo kiểu Ngày không
  cần hỏi · số từ: phiên nghiệm thu sau khi lên production (đếm tay) · bảo đảm bởi: AC-1, AC-5, AC-9
- Thước: trên điện thoại, sắp được theo trường tự tạo qua menu sort · số từ: phiên nghiệm thu (đếm tay) · bảo đảm bởi:
  AC-5, AC-9
- Thước: tìm được giá trị trường tự tạo trên thẻ Kanban · số từ: phiên nghiệm thu (đếm tay) · bảo đảm bởi: AC-7, AC-9
- Thước: bấm sắp mà thứ tự không đổi (dấu CHẾT) · số từ: không còn `sort` của trường lặng lẽ về mặc định khi trường
  còn sống và sort được · bảo đảm bởi: AC-1, AC-2, AC-3

## Out of scope

- Lọc theo trường và cách mã hoá bộ lọc trên đường dẫn (DA18).
- Sort theo Tệp (DA19).
- Sort nhiều cột một lúc.
- Đổi `DataTable`, menu sort hay mũi tên sort (`packages/ui`, vùng Mac Studio, luật 31).
- Đổi chỗ, bề rộng hay `hideBelow` của cột chuẩn: cột chuẩn chỉ đổi nguồn của `hideBelow`, giá trị giữ nguyên.
- Thẻ Kanban sắp lại thứ tự trường riêng cho thẻ, hay chọn trường nào lên thẻ.
- Sort trường tự tạo ở danh sách khác ba bảng (chọn bản ghi, tìm nhanh, chiến dịch).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Không chạm `packages/ui` và `DataTable` (luật 31). Không chạm schema Prisma.
- `*.service.ts` của ba loại bản ghi và `list-search-params.ts` dùng chung với DA18 (luật 34): DA17 gộp trước.
- AC-5, AC-6, AC-7 vế thẻ, AC-9 chỉ viết mã sau khi DA14 gộp onehub.
