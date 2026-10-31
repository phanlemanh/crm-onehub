---
schema_version: 1
feature: "Một màn đặt lọc ngoài hàng công cụ duy nhất — chip trong Card, nhóm gập dưới bảng, ToggleGroup spacing={0} — làm bài kiểm đỏ và gọi tên tệp"
slug: rang-hang-cong-cu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-31T13:59:19Z
design_doc: docs/superpowers/specs/2026-10-31-rang-hang-cong-cu-design.md
---

# Acceptance Contract: rang-hang-cong-cu

## Context

Hàng BK6 của `docs/plan/lo-trinh-okr.json`, đợt `ban-do-khuon-3010`, dãy L, đứng sau BK3. Ô cơ hội ký `build` ngày
31/10. Luật «Thứ tự một màn» và «Hàng công cụ» của `docs/design.md` (chủ kho 25/10) chưa có răng: đo trên cây có bảy
chỗ lọc lệch luật mà không bài nào đỏ. Vòng này thêm một bài kiểm đọc mọi tệp giao diện của app, kèm bảng ngoại lệ có
lý do. Hạng T2: chỉ thêm tệp kiểm dưới `apps/app/test`.

Source input: hàng BK6 (`cau_giao`, `bat_khi`, `ghi_chu`) · `opportunity.md` · `docs/design.md` · trang tri thức
`ban-do-khuon.md` mục «Khoảng hở 2» · design doc.

Thuật ngữ: **tệp giao diện** = tệp `.tsx` dưới `apps/app/app/` hay `apps/app/components/`, trừ `apps/app/app/proto/`.
**Chip lọc** = một `ToggleGroup` không nằm trong `Field`, `FieldSet` hay `FieldGroup` (Hỏi-1).
**Bài** = `apps/app/test/hang-cong-cu.spec.ts`. **Bảng** = `apps/app/test/fixtures/hang-cong-cu-ngoai-le.json`.

## Criteria

- AC-1: Given cây kho ở đỉnh đang xét, When chạy bài, Then bài đọc mọi tệp giao diện mà `git ls-files` liệt (kể cả
  tệp chưa theo dõi), có tệp dưới `apps/app/components/`, không tệp nào dưới `apps/app/app/proto/`, và in số tệp cùng
  số chỗ đã khai.
- AC-2: Given một tệp giao diện mới có chip lọc mang `spacing={0}`, When chạy bài, Then bài đỏ với một dòng gọi
  `<tệp>:<dòng>` và «chip lọc dính thanh».
- AC-3: Given một tệp giao diện mới đặt chip lọc trong `Card`, `CardHeader` hay `CardContent`, When chạy bài, Then bài
  đỏ với một dòng gọi `<tệp>:<dòng>` và «chip lọc trong thẻ».
- AC-4: Given một tệp giao diện mới có nhóm gập mà phần mở chứa một bảng (`Bang…`, `DataTable`, `SimpleTable`,
  `Table`), When chạy bài, Then bài đỏ với một dòng gọi `<tệp>:<dòng>` và «nhóm gập chứa bảng».
- AC-5: Given một `ToggleGroup` có `spacing={0}` nằm trong `Field`, `FieldSet` hay `FieldGroup` (kể cả trong `Card`), When
  chạy bài, Then nó không bị đếm; And When thay vật bọc bằng `div`, Then bài đỏ như AC-2 và AC-3; And một chip có
  `aria-labelledby` trong `CardContent` vẫn đỏ. Given chip lọc đúng khuôn và nhóm gập không chứa bảng, Then bài im.
- AC-6: Given bảng, When một dòng trỏ tệp không có trong tập tệp, trùng cặp tệp và dấu hiệu, mang dấu hiệu hay loại
  ngoài tập, hoặc `ly_do` rỗng, Then bài đỏ gọi tên tệp và lỗi của dòng; When số chỗ thật của tệp vượt `so`, Then chỗ dư
  đỏ như chỗ mới; When số chỗ thật thấp hơn `so`, Then bài đỏ «ngoại lệ thừa» kèm số khai và số còn.
- AC-7: Given cây ở đỉnh đang xét, When chạy bài, Then không dòng đỏ nào; bảng có 10 dòng, bảy dòng `no` là đúng tập
  {lọc tình trạng KR, phạm vi Tổng quan, thẻ dòng thời gian, Lộ trình, Họp tuần, nhóm Đã bỏ, dự án Đã đóng}, mỗi dòng
  `no` ghi đích sửa; và bài chạy trong `bun run test` của `apps/app`.
- AC-8: Given tệp có chip dính thanh nằm ngoài tệp giao diện (dưới `docs/`, `_acceptance/`, `packages/`, hay
  `apps/app/app/proto/`), When quét, Then không dòng đỏ nào.

## Coverage

Quét ba dấu hiệu luật nêu tên (chip dính thanh · chip trong thẻ · nhóm gập dưới bảng) × hai lớp chip (ô nhập · lọc) ×
hai trạng thái bảng (khai đúng · khai lệch: thiếu, thừa, sai khuôn). Thước CE: mục «Hàng công cụ» và bảng «Dấu hiệu vẽ
tay» của `docs/design.md` [SUY-TỪ-REPO: docs/design.md]; số chỗ đo trên cây ở design doc mục «Vấn đề, đo trên cây». Lọc
bằng nút tự ghép, ô chọn đơn vị trên hàng công cụ và lưới thẻ dưới bảng là Later (không có dấu hiệu cú pháp đủ chắc).

## Đường đo

- Ngưỡng SỐNG của ô cơ hội («thêm chip lọc trong CardContent, nhóm gập Đã bỏ (n) dưới bảng hay ToggleGroup spacing={0}
  thì bài đỏ và nêu tệp; lệch hiện có nằm trong bảng có lý do; chỉ sửa docs/ thì im»): số đến từ đầu ra của chính bài
  — mảng dòng đỏ. AC-2, AC-3, AC-4 bảo đảm chiều đỏ; AC-7 bảo đảm bảng; AC-8 bảo đảm chiều im.

## Out of scope

- Chip lọc trần trong một tệp mà tệp khác đặt vào `Card` (quan hệ giữa hai tệp) — chờ chủ kho chốt ở Hỏi-2.
- Nhóm gập dưới bảng mà phần mở là danh sách `Item` thay vì bảng — chờ chủ kho chốt ở Hỏi-3.

- Sửa bảy chỗ nợ: bảng chặn nợ mới, không dọn nợ cũ (luật 40 của đợt).
- Bọc ba ô nhập chưa có `Field` (ngày nghỉ tuần, kênh thông báo, loại ghi chú).
- Lọc bằng nút tự ghép, ô chọn đơn vị trên hàng công cụ, lưới thẻ dưới bảng.
- Thứ tự tầng của một màn.

## Notes

- Quét theo tệp chứ không theo trang của BK3: hàng công cụ thường nằm trong thành phần khách ngoài `page.tsx`.
