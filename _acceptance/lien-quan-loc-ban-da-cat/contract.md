---
schema_version: 1
feature: Danh sách liên quan trong ngăn bản ghi không lẫn bản đã lưu trữ, kèm «+n đã lưu trữ» để mở xem
slug: lien-quan-loc-ban-da-cat
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-13T02:39:27Z
design_doc: docs/superpowers/specs/2026-10-13-lien-quan-loc-ban-da-cat-design.md
---

# Acceptance Contract: lien-quan-loc-ban-da-cat

## Context

Hàng V2a của `docs/plan/lo-trinh-okr.json`, dãy P3 đợt r2; Cổng Đáng `build` (chủ kho, 2026-10-12T23:58:15Z). Mở từ
OOS-1 của V2 `vong-doi-mot-cach-cat`. `docs/vong-doi.md` dặn danh sách liên quan trong ngăn chỉ hiện bản đang dùng,
kèm «+n đã lưu trữ», và số đếm trên màn chỉ đếm bản đang dùng. Hôm nay `byId` của công ty, cá nhân, thoả thuận trả
quan hệ không lọc `archivedAt`, nên bản đã cất lẫn vào bảng liên quan, số trên tab và số liệu đầu ngăn.

## Criteria

- AC-1: Given một công ty có 2 cá nhân đang dùng, 1 cá nhân đã lưu trữ, 2 thoả thuận đang dùng và 2 thoả thuận đã lưu trữ (lưu trữ ở hai ngày khác nhau), When gọi `companies.byId` của nó qua router, Then `contacts` có đúng 2 cá nhân đang dùng và `deals` đúng 2 thoả thuận đang dùng; `archivedContacts` có đúng cá nhân đã cất và `archivedDeals` đúng 2 thoả thuận đã cất, mỗi mục mang `archivedAt`, xếp ngày cất mới nhất trước; hai mảng mới còn nguyên sau `companyDetailOutput`; công ty không có bản đã cất thì hai mảng mới rỗng. (cross-layer)
- AC-2: Given một cá nhân gắn với 1 thoả thuận đang dùng và 1 thoả thuận đã lưu trữ, When gọi `contacts.byId` qua router, Then `deals` chỉ có thoả thuận đang dùng (vẫn mang vai trò) và `archivedDeals` có thoả thuận đã cất với `archivedAt`, còn nguyên sau `contactByIdOutput`. (cross-layer)
- AC-3: Given một thoả thuận gắn 1 cá nhân đang dùng và 1 cá nhân đã lưu trữ, When gọi `deals.byId` qua router, Then `contacts` chỉ có cá nhân đang dùng (vẫn mang vai trò) và `archivedContacts` có cá nhân đã cất với `archivedAt`, còn nguyên sau `dealDetailOutput`. (cross-layer)
- AC-4: Given công ty có một cá nhân đang dùng và một cá nhân đã lưu trữ, cả hai chưa gắn vào một thoả thuận của công ty, When gọi `deals.contactOptions` của thoả thuận đó, hoặc gọi `contacts.byId` của một đồng nghiệp đang dùng cùng công ty, Then cá nhân đã cất không có trong danh sách gợi ý «Thêm người» và không có trong `relationship.colleagues`; cá nhân đang dùng vẫn có ở cả hai.
- AC-5: Given ngăn công ty (tab Cá nhân, tab Thoả thuận), ngăn cá nhân (tab Thoả thuận) và ngăn thoả thuận (tab Cá nhân) nhận `byId` có cả bản đang dùng lẫn bản đã cất, When mở tab đó, Then bảng chỉ có dòng của bản đang dùng; cuối bảng có một nút «+n đã lưu trữ» (n = số bản đã cất) đang đóng; bấm nút thì hiện n dòng, mỗi dòng có tên bản ghi và «Đã lưu trữ ngày dd/mm/yyyy», không có menu giai đoạn, sao liên hệ chính, ô vai trò hay nút gỡ; bấm lại thì các dòng gập lại; `byId` không có bản đã cất thì không có nút đó.
- AC-6: Given dòng gập của AC-5 đang mở, When bấm tên một bản đã cất, Then ngăn của đúng bản ghi đó mở chồng lên (đường dẫn có `<loại>:<id>` của nó), và ngăn ấy có dải «Đã lưu trữ ngày … · Khôi phục» của V2.
- AC-7: Given ngăn công ty có 1 thoả thuận đang mở đang dùng và 1 thoả thuận đang mở đã lưu trữ có giá trị và ngày chốt sớm hơn, và ngăn thoả thuận có 1 cá nhân đang dùng và 1 cá nhân đã cất, When nhìn số trên tab, hàng số liệu đầu ngăn công ty và mục «Người tham gia» của ngăn thoả thuận, Then số trên tab Cá nhân và Thoả thuận đếm bản đang dùng; số thoả thuận đang mở, giá trị đang mở và ngày chốt gần nhất chỉ tính thoả thuận đang dùng; «Người tham gia» chỉ có cá nhân đang dùng.
- AC-8: Given một bảng liên quan không có bản đang dùng nhưng có bản đã cất, When mở tab đó, Then ô trống của tab vẫn hiện như hôm nay, kèm nút «+n đã lưu trữ» ngay dưới; bấm thì hiện các dòng đã cất như AC-5.
- AC-9: Given một công ty đã lưu trữ có 1 thoả thuận đang dùng, 1 thoả thuận đã cất, 1 cá nhân đang dùng và 1 cá nhân đã cất, và một thoả thuận đã lưu trữ có 1 cá nhân đang dùng và 1 cá nhân đã cất, When chọn «Xoá vĩnh viễn» trong menu ngăn của từng bản, Then hộp hỏi lại của công ty nói 2 thoả thuận mất theo và 2 cá nhân ở lại, và lời báo của thoả thuận dùng chữ số nhiều cho người ở lại («people» ở tiếng Anh) — lời báo xoá vĩnh viễn đếm cả bản đã cất, vì nó nói về thứ mất đi và thứ ở lại chứ không về thứ đang thấy.
- AC-10: Given giao diện tiếng Việt và tiếng Anh, When đọc nút gập và dòng đã cất, Then tiếng Việt ghi «+n đã lưu trữ» và «Đã lưu trữ ngày …»; tiếng Anh ghi «+n archived» và «Archived on …», không ký tự tiếng Việt có dấu; khoá chữ mới có đủ cặp vi/en.
- AC-11: Given dòng gập của AC-5, When đi bằng bàn phím, Then nút gập là một `button` có `aria-expanded` đổi theo trạng thái; tên mỗi dòng đã cất là một `button` tới được bằng Tab, Enter mở ngăn như AC-6; tệp giao diện chạm tới qua được bộ quét thiết kế tĩnh của kho.
- AC-12: Given bản chạy thật của cây này, một công ty có thoả thuận và cá nhân đã lưu trữ, When mở ngăn công ty ở khổ 1440 và 390, bấm «+n đã lưu trữ» rồi bấm tên một thoả thuận đã cất, Then thấy được dòng gập và dòng mờ có ngày cất, ngăn thoả thuận đã cất mở ra với dải báo; lưu trữ một thoả thuận đang dùng từ ngăn của nó rồi quay lại ngăn công ty thì thoả thuận đó đã sang dòng gập; ở 390 nút gập và các dòng đã cất không lòi ra khỏi mép phải của ngăn.
- AC-13: Given ảnh chụp của AC-12, When một người không làm lượt này nhìn, Then hiểu ngay danh sách chỉ có bản đang dùng, «+n đã lưu trữ» là chỗ xem bản đã cất (không phải nút lưu trữ), và dòng mờ là bản đã cất có thể mở ra. (judgment)

## Coverage

- Quét bằng `morphological-scan` (`_acceptance/lien-quan-loc-ban-da-cat/coverage-scan.md`), preset `entity-feature`.
- Trục A — quan hệ trong ngăn: công ty → cá nhân | công ty → thoả thuận | cá nhân → thoả thuận | thoả thuận → cá nhân (AC-1…AC-3, AC-5) | đồng nghiệp | bộ chọn «Thêm người» (AC-4) | tham chiếu đơn (Later) [thước CE: quan hệ của `Company`, `Contact`, `Deal`, `DealContact` — SUY-TỪ-REPO: `packages/db/prisma/schema.prisma`]
- Trục B — hỗn hợp con: không có gì | chỉ đang dùng | cả hai | chỉ đã cất — AC-1 (cả hai, không có), AC-5 (cả hai, chỉ đang dùng), AC-8 (chỉ đã cất) [thước CE: bốn tổ hợp của hai tập rời nhau]
- Trục C — chỗ đọc mảng: bảng liên quan (AC-5) | số trên tab, số liệu đầu ngăn, «Người tham gia» (AC-7) | hộp xoá vĩnh viễn của công ty và của thoả thuận (AC-9) | hợp đồng đầu ra của router (AC-1…AC-3) [thước CE: mọi chỗ đọc `company.deals`, `company.contacts`, `contact.deals`, `deal.contacts` — SUY-TỪ-REPO: ba tệp `record-sheet/*-sheet.tsx`, đếm 13/10]
- Trục D — khổ × ngôn ngữ × cách đi: 1440 vi | 390 vi | en | bàn phím — AC-10, AC-11, AC-12.
- [NGÀNH: HubSpot «Restore deleted records»] bản ghi đã xoá rời khỏi thẻ liên kết của bản ghi khác cho tới khi khôi phục — ở đây không giấu hẳn mà gập lại sau «+n đã lưu trữ», vì `docs/vong-doi.md` dặn vậy.

## Đường đo

- Thước: số chỗ đọc trong ba ngăn còn đếm hay hiện bản đã cất ở danh sách đang dùng (mong 0) · số từ: bài DOM `apps/app/test/lien-quan-loc-ban-da-cat.dom.tsx` (E5, E7) · bảo đảm bởi: AC-5, AC-7
- Thước: người lạ tìm lại một thoả thuận đã cất từ ngăn công ty mà không phải mở «Đã lưu trữ» của bảng Thoả thuận · số từ: nhật ký vấp (khuôn `stranger-drive-template.md`) · bảo đảm bởi: đã có sẵn — nghi thức lái-thử của `/acceptance-gate:uat-session` §0

## Out of scope

- Số đếm ở bảng danh sách công ty (`_count` cá nhân, thoả thuận đang mở; sắp xếp theo số) — màn danh sách, không phải ngăn.
- Tham chiếu đơn — công ty của thoả thuận hay cá nhân, liên hệ chính của công ty — khi bản đó đã cất: vẫn hiện như hôm nay; mở ra đã có dải báo.
- Khôi phục ngay trên dòng gập — khôi phục đi qua dải báo của ngăn bản ghi (chờ chủ kho chốt ở Cổng Phạm vi, Hỏi trong sổ quyết định).
- Giữ trạng thái mở của dòng gập trên đường dẫn (chờ chủ kho chốt ở Cổng Phạm vi).
- Dải báo và dòng gập thành mảnh dùng chung ở `packages/ui`.
- Thanh tab của khung ngăn dùng chung (`apps/app/components/detail-sheet.tsx`) tràn ngang 2px ở khổ 390 trên ngăn công ty — có từ trước, chuyển cho NM1b (chủ kho chọn 13/10, sổ d-20261013T015212Z-13).

## Notes

- Known limits: ở khổ 390 ngăn công ty cuộn ngang 2px do thanh tab của khung dùng chung — đo ở S3 (yêu cầu P3-2), tràn y hệt khi dòng «+n đã lưu trữ» còn gập; sửa ở NM1b.

- Vòng đời (luật 14): (1) Dọn thế nào — không đổi: cá nhân, công ty, thoả thuận đi Lưu trữ → Khôi phục → Xoá vĩnh viễn. (2) «Lịch sử» — không đổi. (3) Danh sách mặc định — bảng liên quan trong ngăn nay chỉ hiện bản đang dùng; bản đã cất tìm lại ở «+n đã lưu trữ» cuối bảng, mở ra ngăn có dải báo và «Khôi phục».
- Đầu REST bridge `/rest` (sinh từ mọi thủ tục tRPC, khoá API đọc được — `docs/api.md` mục «The OpenAPI document is built at runtime») đổi theo vì dùng chung `byId`: mảng cũ thôi có bản đã cất, thêm hai mảng mới. Đã tra `apps/agent` (grep `companies.byId`, `contacts.byId`, `deals.byId`, `/companies/`, `/contacts/`, `/deals/`: 0 người gọi); tích hợp ngoài kho dùng khoá API không tra được từ kho — chủ kho chốt ở Cổng Phạm vi (Hỏi trong sổ quyết định, d-20261013T003730Z-8).
- Ranh giới: `apps/api/src/{companies,contacts,deals}/**`, `apps/api/src/crm/**`, `apps/app/components/crm/record-sheet/**`, `apps/app/lib/messages/record-sheet.ts`, `docs/api.md`, `docs/vong-doi.md`, tệp kiểm mới, `_acceptance/lien-quan-loc-ban-da-cat/**`, và thêm khoá vào `_acceptance/config.yaml` (luật 7: chỉ thêm dòng).
