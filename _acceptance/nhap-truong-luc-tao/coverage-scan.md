# Quét độ phủ — nhap-truong-luc-tao (DA16)

Preset `entity-feature` của skill `morphological-scan`, chạy ở S1 ngày 21/10/2026.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ của OneHub — chân sản phẩm: đào kho (`CONTEXT.md` mục «Trường», `docs/design.md` mục «Trường»,
  ba sheet tạo, `quick-add.tsx`, ba dịch vụ `create`, nhánh DA15 `feat/truong-chuan-o-cai-dat`) · chân ngành:
  HubSpot «Create record form» (thuộc tính bắt buộc và thuộc tính hiện trên form tạo do quản trị chọn), Salesforce
  «Page Layouts» (trường bắt buộc trên bố cục chặn lưu bản ghi mới).

## Trục

- Trục A — loại bản ghi: Công ty · Cá nhân · Thoả thuận
  [thước CE: `FieldEntity` ở `packages/db/prisma/schema.prisma` — SUY-TỪ-REPO]
- Trục B — điểm tạo: sheet «Tạo mới» ở trang danh sách · ô thêm nhanh trong phiếu công ty (Cá nhân, Thoả thuận) ·
  REST và khoá API (`POST /rest/companies|contacts|deals`) · đường máy ghi thẳng Prisma (Gmail/Lịch, form theo dõi,
  tin đăng, công ty tự tạo từ tên miền)
  [thước CE: grep `companies.create`, `contacts.create`, `deals.create`, `tx.company.create`, `tx.contact.create`
  trong `apps/` — SUY-TỪ-REPO: `apps/app/app/(app)/[slug]/*/create-*-sheet.tsx`,
  `apps/app/components/crm/record-sheet/quick-add.tsx`, `apps/api/src/mailbox/mailbox-match.service.ts`,
  `apps/api/src/tracking/tracking-filing.service.ts`, `apps/api/src/listings/listing-ingest.service.ts`,
  `apps/api/src/companies/company-directory.service.ts`]
- Trục C — loại trường: chuẩn bắt buộc theo mô hình · chuẩn đang hiện trên phiếu · chuẩn đã ẩn (DA15) · tự tạo bắt
  buộc · tự tạo đang hiện trên phiếu · tự tạo không hiện · tự tạo đã lưu trữ · tự tạo «Kara điền»
  [thước CE: `FieldDefinition` (`required`, `showOnSheet`, `agentFilled`, `archivedAt`), `REQUIRED_STANDARD_KEYS` và
  `standardFieldLayout.hidden` của DA15 — SUY-TỪ-REPO]
- Trục D — kết cục của lượt tạo: tạo xong có giá trị · để trống trường không bắt buộc · để trống trường bắt buộc ·
  máy chủ từ chối một giá trị · Kara điền sau khi tạo
  [thước CE: `coerceValue` ở `packages/db/src/fields.ts`, `queueBackfillForNewRecord` ở
  `apps/api/src/fields/fields.service.ts` — SUY-TỪ-REPO; NGÀNH: Salesforce «required field on page layout»]

Lớp cắt ngang: locale vi/en · khổ 1280 và 375 · danh sách trường và bố trí đang tải hay tải lỗi · đóng form giữa chừng
(bộ giữ thay đổi) · kiểu của trường (mười một kiểu của bảng đăng ký DA14).

## Không gian

A × B × C × D = 3 × 4 × 8 × 5. Quét theo lát của trục B (điểm tạo), vì mỗi điểm tạo là một mã khác nhau.

- B = sheet «Tạo mới»: mọi ô C × D có nghĩa với cả ba loại.
- B = thêm nhanh: chỉ Cá nhân và Thoả thuận (không có thêm nhanh Công ty); công ty và người phụ trách đã có từ ngữ cảnh.
- B = REST/khoá API: không có form, nên C chỉ còn «bắt buộc» và «giá trị sai»; D chỉ còn tạo xong · từ chối.
- B = đường máy ghi thẳng Prisma: không đi qua dịch vụ `create`, không có người nhập; C × D vô nghĩa với luật form.

## Core

1. Form tạo hiện đúng tập trường «bắt buộc hoặc đang hiện trên phiếu», theo thứ tự bố trí, cả ba loại → AC-1.
2. Ô của mỗi trường trong form đi qua mặt «ô form tạo» của bảng đăng ký DA14, không ô vẽ tay → AC-2.
3. Giá trị nhập ở form lưu cùng lượt tạo, đúng kiểu → AC-3.
4. Bắt buộc bị chặn ở form và ở máy chủ, kể cả khoá API → AC-4.
5. Máy chủ từ chối một giá trị: không lưu nửa bản ghi, câu tiếng Việt theo kiểu → AC-5.
6. Thêm nhanh theo cùng luật → AC-6.
7. Kara chỉ điền trường còn trống sau khi tạo → AC-7.
8. Bản ghi cũ còn trống trường vừa bắt buộc vẫn sửa được ô khác → AC-8.
9. Mắt người: hàng trường tự tạo không phân biệt được với hàng trường chuẩn, 1280 và 375 → AC-9.

## Later

- Bắt buộc cho trường chuẩn không bắt buộc theo mô hình (Ngày chốt, Giá trị…) — DA15 Hỏi-2 đã dời sang hàng riêng.
- Đường máy ghi thẳng Prisma (Gmail/Lịch, form theo dõi, tin đăng) điền trường tự tạo lúc tạo — không có người nhập;
  cần thì là hàng riêng của Kara.
- Phiếu nhắc «còn thiếu trường bắt buộc» trên bản ghi cũ — Hỏi-2.
- Nhập CSV — chưa có đường nhập (`RecordSource.IMPORT` chưa ai dùng).

## Never

- Thêm nhanh Công ty — không có điểm vào nào trong app hôm nay; dựng mới là hàng khác.
- Form tạo riêng cho từng người — Cài đặt › Trường là cài đặt của không gian làm việc.
- Ô Giai đoạn của thoả thuận đi qua bảng đăng ký — DA14 đã khai nó là ngoại lệ có tên, cùng ô Công ty.

## Cross-cutting áp mọi ô Core

- vi/en: nhãn ô trong form đúng bằng nhãn hàng trên phiếu cùng loại.
- 1280/375: không cuộn ngang ở 375.
- Đang tải hay tải lỗi danh sách trường: form vẫn tạo được bằng trường chuẩn; máy chủ vẫn chặn bắt buộc.
- Đóng form khi đã gõ vào ô trường tự tạo: hỏi bỏ thay đổi như với Tên.
