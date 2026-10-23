# Quét không gian tiêu chí — chi-tiet-cong-ty-hai-cot

## Ngữ cảnh
- Sản phẩm: CRM nội bộ OneHub — chân sản phẩm: đào repo [SUY-TỪ-REPO: apps/app/components/crm/record-sheet/company-sheet.tsx,
  apps/app/components/crm/fields/o-tep.tsx, docs/design.md] · chân ngành: [NGÀNH: Salesforce Lightning — trang bản ghi,
  thẻ Details hai cột tràn ngang] · [NGÀNH: HubSpot — trang bản ghi ba cột, tệp đính kèm là một thẻ danh sách ở cột phải,
  không phải một trường có cột nhãn]

## Trục
- Trục phiếu: Công ty | Liên hệ | Thoả thuận   [thước CE: `git grep nguCanhTep` — ba nơi gắn ô Tệp]
- Trục khổ: 375 | 768 | 1440   [thước CE: ngưỡng `sm` (hai cột Chi tiết), `md` (ngăn kéo ↔ ngăn bên), `lg` (cột phải cũ)]
- Trục vùng: Giới thiệu | Chi tiết | ô Tệp | dòng Kara chờ | Hoạt động web   [thước CE: các mục tab Tổng quan dựng]
- Trục dữ liệu: có mô tả | không mô tả; tên tệp ngắn | dài 60 ký tự   [thước CE: ảnh chủ kho 23/10]

3 × 3 × 5 × 2 = 90 ô thô; ô có nghĩa sau khi gạch (Giới thiệu chỉ ở Công ty; Kara chờ chỉ khi không đủ trường; Liên hệ,
Thoả thuận không đổi khung) ≈ 30.

## Core (6 ô ≈ 20%)
1. Công ty × 1440, 768 × Giới thiệu/Chi tiết × có mô tả — gốc của lỗi (AC-1)
2. Công ty × 1440 × ô Tệp × tên dài — đúng ảnh chủ kho gửi (AC-2)
3. Ba phiếu × 375 × vùng kéo thả — lỗi thành phần dùng chung (AC-3)
4. Công ty × 375 × toàn ngăn — không tràn ngang (AC-4)
5. Liên hệ, Thoả thuận × 1440 × ô Tệp — hồi quy của sửa thành phần (AC-5)
6. Công ty × 1440 × không mô tả × Kara chờ — ca biên của thứ tự mục (AC-6)

## Later
- Ô Tệp đầy 10 tệp — dòng tệp cùng thành phần, không đổi.
- Liên hệ, Thoả thuận × 768 — khung không đổi.
- Hộp thoại Tài liệu › tải nguồn — nhánh rộng của vùng kéo thả, AC-5 đã đo nhánh này.

## Never
- Phiếu Kế hoạch, KR — không có ô Tệp.
- Đặt tệp thành thẻ riêng ở cột phải kiểu HubSpot [NGÀNH] — trái luật «một trường, một cách cư xử» của `docs/design.md`.

## Cross-cutting áp mọi ô Core
- Không vẽ tay: chỉ khối của `detail-sheet.tsx` và `packages/ui`.
- Không chữ mới; không đổi dữ liệu, quyền, API.
