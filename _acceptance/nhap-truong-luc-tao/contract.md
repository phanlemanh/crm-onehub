---
schema_version: 1
feature: "Nhân viên quan hệ đối tác nhập đủ các trường cần thiết ngay lúc tạo công ty, liên hệ hay thoả thuận, không phải mở lại phiếu"
slug: nhap-truong-luc-tao
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: implemented
approved_by: manh
approved_at: 2026-10-21T14:46:29Z
design_doc: docs/superpowers/specs/2026-10-21-nhap-truong-luc-tao-design.md
---

# Acceptance Contract: nhap-truong-luc-tao

## Context

Hàng DA16 của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511). Chủ kho duyệt Cổng Đáng (build) ngày
20/10/2026. Mốc là 2026-10-22. Hàng đứng trên DA15 (`truong-chuan-o-cai-dat`): form đọc bố trí trường (thứ tự, ẩn, bắt
buộc) mà DA15 dựng, và ô của mỗi trường đi qua bảng đăng ký kiểu của DA14 (`KIEU_TRUONG`).

Hôm nay ba sheet «Tạo mới» và hai ô thêm nhanh trong phiếu công ty không có trường tự tạo; `companies.create`,
`contacts.create`, `deals.create` không nhận `fields`; trường tự tạo «Bắt buộc» chỉ chặn việc xoá trống một giá trị đã
ghi. Người tạo xong phải mở phiếu bấm từng ô.

Luật đích ở `docs/design.md` mục «Trường»: «Form tạo và ô thêm nhanh: trường bắt buộc và trường đang hiện trên phiếu»,
và mỗi kiểu trường khai một lần mặt «ô trong form tạo».

Hồ sơ soạn trên giấy theo luật 44 của đợt: mã viết sau khi DA15 gộp. Tên hàm của DA15 đọc từ nhánh
`feat/truong-chuan-o-cai-dat` (2efcd9bfa).

Source input: `opportunity.md` · câu giao DA16 · `docs/design.md` mục «Trường» · hợp đồng DA14, DA15 · design doc.

«Trường của form» của một loại, dùng trong mọi tiêu chí dưới đây, là: các trường chuẩn không ẩn của danh mục DA15, cộng
các trường tự tạo chưa lưu trữ có «Bắt buộc» hoặc «Hiện trên phiếu», theo thứ tự của `fields.layout`. Ngoại lệ có tên
như DA14: ô Giai đoạn của thoả thuận đứng ngay sau Công ty.

## Criteria

- AC-1: Given mỗi loại (Thoả thuận, Công ty, Cá nhân) có bốn trường tự tạo — một bắt buộc, một hiện trên phiếu, một
  không hiện, một đã lưu trữ — và bố trí đã đưa một trường tự tạo lên trên một trường chuẩn và ẩn một trường chuẩn không
  bắt buộc, When người mở sheet «Tạo mới» của loại ấy ở tiếng Việt và tiếng Anh, Then:
  - form có đúng «trường của form», đúng thứ tự: có trường bắt buộc và trường hiện trên phiếu; không có trường không
    hiện, trường đã lưu trữ hay trường chuẩn đã ẩn;
  - nhãn mỗi ô đúng bằng nhãn hàng cùng khoá trên phiếu cùng loại;
  - ô bắt buộc mang dấu bắt buộc như ô Tên;
  - luật sẵn có của ô chuẩn còn nguyên: chặn tên miền nền tảng ở Công ty, chuẩn hoá số điện thoại ở Cá nhân, giai đoạn mở
    đầu và tiền tệ báo cáo mặc định ở Thoả thuận;
  - và When `fields.list` đang tải, Then form có trường chuẩn theo thứ tự mặc định và nút Tạo khoá; When `fields.list`
    lỗi, Then form có trường chuẩn và nút Tạo mở.
- AC-2: Given mã của năm form (ba sheet «Tạo mới», `QuickAddContact`, `QuickAddDeal`), When quét, Then:
  - `KIEU_TRUONG` khai mặt «ô form tạo» cho đủ mười một kiểu;
  - mọi ô trường của năm form, chuẩn lẫn tự tạo, vẽ qua mặt ấy;
  - không form nào tự gọi `Input`, `Checkbox`, `Select`, `DatePicker`, `MoneyInput` cho một trường hay rẽ nhánh theo
    kiểu trường;
  - ngoại trừ có tên: ô Công ty và ô Giai đoạn.
- AC-3 (cross-layer): Given loại Thoả thuận có một trường tự tạo cho mỗi kiểu trong mười kiểu (Chữ, Chữ dài, Số, Ngày,
  Ô tích, Chọn, Liên kết, Email, Điện thoại, Người), đều hiện trên phiếu, When người điền cả mười trong sheet «Tạo
  thoả thuận» ở tiếng Việt (Số gõ «1.234,5») rồi bấm Tạo, Then:
  - đúng một lượt `deals.create` mang `fields` có mười giá trị đúng kiểu (Số là `1234.5`);
  - không có lượt `deals.update` nào;
  - đọc lại `deals.get` qua API thì đủ mười giá trị;
  - phiếu thoả thuận mở ra hiện đủ mười giá trị;
  - một trường không bắt buộc để trống thì không có khoá trong `fields`; ô tích không ai tích là để trống (Hỏi-4).

  Và When cùng cách với một trường tự tạo ở sheet «Tạo công ty» và «Tạo cá nhân», Then `companies.get`, `contacts.get`
  đọc lại đúng giá trị.
- AC-4 (cross-layer): Given loại Thoả thuận có trường tự tạo kiểu Chữ «Mã hồ sơ» và kiểu Chọn «Hạng đối tác», cả hai bắt
  buộc, When người để trống cả hai rồi bấm Tạo, Then:
  - không gọi `deals.create`;
  - dưới mỗi ô hiện «<nhãn> không được để trống.» theo câu của DA14;
  - con trỏ về «Mã hồ sơ»;
  - ô Chọn bắt buộc không có lựa chọn «Không có».

  Và When gọi thẳng `deals.create`, `companies.create`, `contacts.create` qua API (cả tRPC lẫn `POST /rest/…` bằng khoá
  API) mà thiếu khoá của một trường tự tạo bắt buộc, hay gửi khoá ấy rỗng, Then:
  - lượt ấy bị từ chối `BAD_REQUEST`;
  - không có bản ghi nào được tạo;
  - gửi đủ thì tạo được;
  - trường bắt buộc đã lưu trữ không chặn lượt tạo nào.

  Trường bắt buộc mà cũng bật «Kara điền» vẫn bắt buộc lúc tạo (Hỏi-1). Ô tích bắt buộc nghĩa là phải tích (Hỏi-4).
- AC-5 (cross-layer): Given sheet «Tạo thoả thuận» đã điền đủ, có trường kiểu Chọn «Hạng đối tác», When lựa chọn vừa chọn
  bị lưu trữ trước khi bấm Tạo và máy chủ từ chối, Then:
  - không có thoả thuận nào được tạo (cả giao dịch lùi);
  - toast là «Chưa tạo được thoả thuận.» nối câu `lua-chon` của DA14, đọc từ messages của app;
  - toast không chứa câu của máy chủ;
  - dưới ô «Hạng đối tác» hiện câu ấy;
  - form giữ nguyên mọi giá trị đã điền.

  Lỗi máy chủ trả về app nói được khoá trường bị từ chối, ở một chỗ cố định của dữ liệu lỗi mà app đọc.

  Và When `fields.list` lỗi nên form không có ô trường tự tạo, và máy chủ từ chối vì thiếu trường bắt buộc «Mã hồ sơ»,
  Then toast là «Chưa tạo được thoả thuận.» nối câu «Mã hồ sơ không được để trống.», không chứa câu của máy chủ.
- AC-6: Given phiếu công ty đang mở, loại Cá nhân và loại Thoả thuận mỗi loại có một trường tự tạo bắt buộc và một trường
  tự tạo hiện trên phiếu, When người mở ô thêm nhanh cá nhân, rồi ô thêm nhanh thoả thuận, Then:
  - mỗi ô thêm nhanh có «trường của form» của loại ấy, trừ Công ty (là công ty đang mở);
  - Người phụ trách điền sẵn như nay;
  - để trống trường bắt buộc thì chặn như AC-4;
  - điền đủ rồi bấm Thêm thì đúng một lượt `contacts.create` (hay `deals.create`) mang `fields` và `companyId` của công
    ty đang mở;
  - đóng ô khi đã gõ vào một trường tự tạo thì hộp hỏi bỏ thay đổi hiện, như khi đã gõ Tên.
- AC-7: Given loại Công ty có hai trường tự tạo bật «Kara điền», When tạo một công ty có giá trị cho trường
  thứ nhất và để trống trường thứ hai, Then:
  - hàng chờ Kara điền của công ty mới có trường thứ hai;
  - hàng chờ ấy không có trường thứ nhất;
  - giá trị người nhập ở trường thứ nhất không đổi.
- AC-8 (cross-layer): Given một thoả thuận tạo trước khi «Mã hồ sơ» thành bắt buộc và còn trống ô ấy, When người sửa Tên
  của nó trên phiếu, Then:
  - lượt lưu thành công;
  - Tên mới đọc lại được qua API;
  - xoá trống một trường bắt buộc đang có giá trị vẫn bị chặn như DA15 (Hỏi-2).
- AC-9: Given mỗi loại có trường tự tạo cùng kiểu với các trường chuẩn của form (Chữ, Ngày, Người, Liên kết, Số), When
  người mở ba sheet «Tạo mới» và hai ô thêm nhanh ở khổ 1280 và 375, Then:
  - che nhãn đi thì người nhìn ảnh không phân biệt được hàng trường tự tạo với hàng trường chuẩn cùng kiểu: cùng thẳng
    hàng, cùng cỡ chữ, cùng ô;
  - không có tiêu đề nhóm, nhãn phụ hay đường phân cách tách trường tự tạo;
  - câu lỗi nằm ngay dưới ô của nó;
  - không cuộn ngang ở 375.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`), preset `entity-feature`. Bốn trục:

- loại bản ghi: Thoả thuận · Công ty · Cá nhân;
- điểm tạo: sheet «Tạo mới» · ô thêm nhanh trong phiếu công ty · REST và khoá API · đường máy ghi thẳng Prisma;
- loại trường: chuẩn bắt buộc · chuẩn đang hiện · chuẩn đã ẩn · tự tạo bắt buộc · tự tạo đang hiện · tự tạo không hiện ·
  tự tạo đã lưu trữ · tự tạo «Kara điền»;
- kết cục: tạo xong có giá trị · để trống không bắt buộc · để trống bắt buộc · máy chủ từ chối · Kara điền sau khi tạo.

Lớp cắt ngang: locale vi/en · khổ 1280 và 375 · danh sách trường đang tải hay lỗi · bộ giữ thay đổi · mười một kiểu
trường.

Thước CE:

- luật đích [SUY-TỪ-REPO: docs/design.md mục «Trường»];
- năm điểm tạo trong app [SUY-TỪ-REPO: apps/app/app/(app)/[slug]/{companies,contacts,deals}/create-*-sheet.tsx,
  apps/app/components/crm/record-sheet/quick-add.tsx];
- đường máy ghi thẳng [SUY-TỪ-REPO: apps/api/src/mailbox/mailbox-match.service.ts,
  apps/api/src/tracking/tracking-filing.service.ts, apps/api/src/listings/listing-ingest.service.ts,
  apps/api/src/companies/company-directory.service.ts];
- cờ của trường [SUY-TỪ-REPO: packages/db/prisma/schema.prisma `FieldDefinition`];
- bố trí, ẩn, bắt buộc trường chuẩn [SUY-TỪ-REPO: nhánh feat/truong-chuan-o-cai-dat, packages/db/src/fields-chuan.ts];
- [NGÀNH: HubSpot «Create record form»; Salesforce «Page Layouts»] — form tạo theo thuộc tính quản trị chọn, trường bắt
  buộc chặn lưu bản ghi mới.

Ánh xạ Core sang AC:

- tập trường và thứ tự của form → AC-1;
- ô qua bảng đăng ký → AC-2;
- lưu cùng lượt tạo → AC-3;
- bắt buộc ở form và máy chủ → AC-4;
- máy chủ từ chối → AC-5;
- thêm nhanh → AC-6;
- Kara điền sau tạo → AC-7;
- bản ghi cũ → AC-8;
- mắt người → AC-9.

Later và Never ở `coverage-scan.md`.

## Đường đo

- Thước: nhân viên tạo xong ba việc (thoả thuận có trường bắt buộc, thêm nhanh cá nhân, công ty có trường Chọn) không mở
  lại phiếu · số từ: phiên nghiệm thu sau khi lên production (đếm tay) · bảo đảm bởi: AC-3, AC-4, AC-6, AC-9
- Thước: tỉ lệ bản ghi người tạo (`source = MANUAL`) có giá trị cho mọi trường tự tạo đang hiện trên phiếu ngay lượt tạo,
  14 ngày đầu · số từ: truy vấn chỉ đọc trên `fieldValue` so với `createdAt` của bản ghi, mẫu số chỉ bản ghi `MANUAL`
  (bản ghi do đường máy tạo nằm ngoài phạm vi) · bảo đảm bởi: AC-3, AC-6

## Out of scope

- Bắt buộc cho trường chuẩn không bắt buộc theo mô hình (Ngày chốt, Giá trị…) — DA15 Hỏi-2.
- Đường máy ghi thẳng Prisma (Gmail/Lịch, form theo dõi, tin đăng, công ty tự tạo từ tên miền) điền hay kiểm trường tự
  tạo lúc tạo.
- Nhắc trên phiếu «còn thiếu trường bắt buộc» cho bản ghi cũ (Hỏi-2).
- Lỗi lượt tạo không thuộc trường (trùng email hay điện thoại của cá nhân): giữ cách báo như nay.
- Thêm nhanh Công ty; nhập CSV.
- Thứ tự cột bảng, thẻ Kanban (DA17); lọc (DA18); kiểu Tệp (DA19).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Không chạm `packages/ui` (vùng Mac Studio, luật 31): ô form dựng bằng thành phần đã có.
- `apps/app/lib/messages/*.ts` chỉ thêm dòng (luật 7).
- Thủ tục `create` đổi đầu vào nên `apps/api/src/generated/server.ts` sinh lại bằng `bun run trpc:generate`.
- Tên hàm DA15 (`useBoTriTruong`, `mucChiTiet`, `nhanTruongChuan`, `fields.layout`) đọc lại sau khi DA15 gộp; khác thì
  sửa kế hoạch.
- Đường nền hạ tầng chưa chạy (luật 44 cấm xin `duong-nen` trước khi DA15 gộp); chạy ngay sau khi gộp onehub, trước S3.
