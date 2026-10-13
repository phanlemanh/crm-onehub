# Coverage scan — lien-quan-loc-ban-da-cat

## Ngữ cảnh
- Sản phẩm: CRM nội bộ OneHub, ngăn bản ghi của công ty · cá nhân · thoả thuận — chân sản phẩm: đào repo (`docs/vong-doi.md` mục «Danh sách mặc định hiện gì», `apps/api/src/{companies,contacts,deals}/*.service.ts` hàm `byId`, `apps/app/components/crm/record-sheet/{company,contact,deal}-sheet.tsx`, `packages/db/prisma/schema.prisma`) · chân ngành: HubSpot — bản ghi đã xoá vào thùng rác 90 ngày, khỏi các thẻ liên kết của bản ghi khác cho tới khi khôi phục [NGÀNH: HubSpot «Restore deleted records»].
- Preset: `entity-feature`.

## Trục
- Trục A — quan hệ trong ngăn: công ty → cá nhân | công ty → thoả thuận | cá nhân → thoả thuận | thoả thuận → cá nhân | cá nhân → đồng nghiệp | bộ chọn «Thêm người» của thoả thuận | tham chiếu đơn (công ty của thoả thuận, công ty của cá nhân, liên hệ chính)   [thước CE: quan hệ của `Company`, `Contact`, `Deal`, `DealContact` — SUY-TỪ-REPO: `packages/db/prisma/schema.prisma`]
- Trục B — hỗn hợp con: không có gì | chỉ đang dùng | cả hai | chỉ đã cất   [thước CE: bốn tổ hợp của hai tập rời nhau — đủ theo định nghĩa]
- Trục C — chỗ đọc mảng: bảng liên quan | số trên tab | số liệu đầu ngăn | «Người tham gia» | hộp xoá vĩnh viễn | hợp đồng đầu ra của router   [thước CE: mọi chỗ đọc `company.deals`, `company.contacts`, `contact.deals`, `deal.contacts` — SUY-TỪ-REPO: grep ba tệp ngăn, đếm 13/10]
- Trục D — khổ × ngôn ngữ × cách đi: 1440 vi | 390 vi | en | bàn phím   [thước CE: khổ đo của kho]

## Core
1. Bốn bảng liên quan (A1–A4) × bốn hỗn hợp (B) — lọc ở máy chủ, dòng gập «+n đã lưu trữ», mở ngăn bản đã cất — AC-1…AC-3, AC-5, AC-6, AC-8.
2. Đồng nghiệp và bộ chọn (A5, A6) — lọc thẳng — AC-4.
3. Số trên tab, số liệu đầu ngăn, «Người tham gia» (C2, C3) — đếm bản đang dùng — AC-7.
4. Hộp xoá vĩnh viễn công ty (C4) — đếm cả bản đã cất, vì nó nói thứ mất đi — AC-9.
5. Chữ vi/en, bàn phím và khổ 1440/390 (D) — AC-10…AC-13.

## Later
- Số đếm ở bảng danh sách công ty (`_count` cá nhân, thoả thuận mở; sắp xếp theo số) — màn danh sách, không phải ngăn.
- Tham chiếu đơn (A7) — một liên kết; mở ra đã có dải báo của V2.

## Never
- Chế độ «tất cả» trong bảng liên quan — `docs/vong-doi.md` cấm chế độ thứ ba.
- Khôi phục ngay trên dòng gập — khôi phục đi một đường, qua dải báo của ngăn.

## Cross-cutting áp mọi ô Core
- Làm mới sau lưu trữ/khôi phục đi qua `cache.ts` có sẵn.
- Bản ghi cha đã cất: cùng luật.
