---
schema_version: 1
feature: "Quản trị mở Cài đặt › Trường, thấy trường chuẩn bằng tiếng Việt khớp đúng phiếu, sắp lại và ẩn được chúng, và bật «Bắt buộc» cho một trường"
slug: truong-chuan-o-cai-dat
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: verified
approved_by: manh
approved_at: 2026-10-21T01:20:58Z
design_doc: docs/superpowers/specs/2026-10-21-truong-chuan-o-cai-dat-design.md
---

# Acceptance Contract: truong-chuan-o-cai-dat

## Context

Hàng DA15 của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511). Chủ kho duyệt Cổng Đáng (build) ngày
20/10/2026. Mốc đợt là 2026-10-22. Hàng đứng trên DA14 (`truong-mot-cach-cu-xu`): phiếu vẽ trường qua bảng đăng ký kiểu
của DA14.

Hôm nay Cài đặt › Trường hứa «chỉ sắp lại thứ tự và ẩn» trường chuẩn, nhưng:

- danh sách trường chuẩn chỉ đọc, viết cứng tiếng Anh (`standard-fields.ts`), lệch phiếu (Liên hệ thiếu X, Thoả thuận
  có «Stage»);
- không có chỗ lưu thứ tự hay ẩn của trường chuẩn, nên trường tự tạo luôn đứng sau trường chuẩn;
- ô «Bắt buộc» có trong mô hình và máy chủ đã chặn để trống, nhưng giao diện không có công tắc và lượt tạo luôn gửi
  `false`.

Luật đích ở `docs/design.md` mục «Trường»: «Phiếu: mục DETAILS theo thứ tự ở Cài đặt › Trường» và «Trường chuẩn sắp
lại và ẩn được; không xoá, không đổi kiểu. Danh sách trường chuẩn dịch theo locale và khớp đúng các trường trên phiếu.»

Lưu bố trí cần một bảng mới (migration ở `packages/db/prisma`), nên hạng là T3 (Hỏi-1).

Source input: `opportunity.md` · câu giao DA15 · `docs/design.md` mục «Trường» · `docs/settings.md` · hợp đồng DA14 ·
design doc.

Danh mục trường chuẩn (thứ tự mặc định, bắt buộc theo cột không null của mô hình, in đậm):

- Thoả thuận: **name** · amount · **currency** · expectedCloseDate · **company** · **owner**
- Công ty: **name** · domain · website · phone · email · city · country · owner
- Liên hệ: **firstName** · lastName · title · email · phone · linkedin · x · github · company · owner

## Criteria

- AC-1: Given quản trị mở Cài đặt › Trường, When xem từng thẻ Thoả thuận, Công ty, Liên hệ, Then:
  - danh sách có đúng các trường chuẩn của mục Chi tiết trên phiếu cùng loại — 6, 8 và 10 trường như danh mục ở trên;
    không có Mô tả, Giai đoạn hay hàng Quy đổi;
  - nhãn mỗi trường chuẩn đúng bằng nhãn của hàng ấy trên phiếu, ở cả tiếng Việt lẫn tiếng Anh;
  - không chuỗi nào của danh sách đến từ một bảng tên viết cứng: `standard-fields.ts` đã gỡ, Cài đặt và phiếu đọc một
    danh mục.
- AC-2 (cross-layer): Given loại Thoả thuận có trường tự tạo «Hạng đối tác», When quản trị kéo nó lên trên «Ngày chốt»
  (bằng chuột hay bằng bàn phím), Then:
  - lượt lưu gửi một danh sách trộn trường chuẩn với trường tự tạo, phủ mỗi trường đúng một lần;
  - đọc lại `fields.layout` qua API thì «Hạng đối tác» đứng ngay trên `expectedCloseDate`;
  - phiếu Thoả thuận vẽ «Hạng đối tác» ngay trên «Ngày chốt» trong mục Chi tiết;
  - máy chủ từ chối (`BAD_REQUEST`) danh sách thiếu, thừa hay lặp một mục; thứ tự đã lưu không đổi;
  - lượt lưu lỗi thì danh sách về thứ tự trước khi kéo và toast «Chưa lưu được thứ tự.», không chứa câu của máy chủ.
- AC-3 (cross-layer): Given trường chuẩn «Thành phố» của Công ty, When quản trị tắt «Hiện trên phiếu» rồi bật lại, Then:
  - lúc tắt: lưu ngay, phiếu Công ty không còn hàng «Thành phố»; `companies.get` vẫn trả giá trị `city` cũ; bảng Công ty
    vẫn có cột Thành phố;
  - lúc bật lại: hàng «Thành phố» quay về đúng chỗ cũ trong thứ tự;
  - lượt lưu lỗi thì công tắc về giá trị cũ và toast «Chưa lưu được Thành phố.», không chứa câu của máy chủ.
- AC-4 (cross-layer): Given một trường chuẩn bắt buộc theo danh mục (Tên của Thoả thuận, Công ty; Tên của Liên hệ; Tiền tệ, Công ty,
  Người phụ trách của Thoả thuận), When quản trị xem hàng ấy, Then:
  - công tắc «Hiện trên phiếu» bật và bị khoá, tên truy cập nói «Trường bắt buộc luôn hiện trên phiếu»;
  - dòng phụ có «bắt buộc»;
  - gọi thẳng API ẩn khoá ấy thì bị từ chối `BAD_REQUEST`, bố trí không đổi.
- AC-5 (cross-layer): Given ô sửa một trường tự tạo kiểu Chữ, When quản trị bật «Bắt buộc» rồi Lưu, Then:
  - lượt lưu gửi `required: true` (cả lượt tạo trường mới lẫn lượt sửa trường có sẵn);
  - đọc lại `fields.list` thì `required` là `true`;
  - trên phiếu, xoá trống ô ấy rồi Enter thì ô hiện câu «không được để trống» của DA14 và không gọi lưu;
  - tắt «Bắt buộc» thì lượt lưu gửi `required: false` và để trống lưu được.
- AC-6 (cross-layer): Given một trường tự tạo, When quản trị bật «Bắt buộc», Then:
  - ô «Hiện trên phiếu» trong ô sửa bật và bị khoá, ở danh sách công tắc của hàng ấy cũng vậy;
  - trường đang tắt «Hiện trên phiếu» mà bật «Bắt buộc» thì sau khi lưu nó hiện trên phiếu;
  - API từ chối `required: true` đi cùng `showOnSheet: false` (`BAD_REQUEST`) ở cả `fields.create` lẫn `fields.update`.
- AC-7 (cross-layer): Given một loại bản ghi chưa ai sắp lần nào, When phiếu và Cài đặt đọc bố trí, Then:
  - thứ tự là trường chuẩn theo danh mục rồi trường tự tạo theo thứ tự đã lưu, đúng như phiếu trên onehub trước vòng;
  - không trường chuẩn nào ẩn;
  - và When quản trị tạo trường tự tạo mới sau một lần sắp, Then trường mới đứng cuối danh sách trộn;
  - và When `fields.layout` chưa tải xong hay tải lỗi, Then mục Chi tiết của phiếu vẫn vẽ đủ trường theo thứ tự mặc định.
- AC-8 (cross-layer): Given người không phải quản trị mở Cài đặt › Trường, When xem danh sách, Then:
  - mọi tay kéo, công tắc «Hiện trên phiếu» và nút đều bị khoá, dòng «Cần quyền quản trị để đổi trường của cả đội.» hiện
    ở đầu;
  - gọi thẳng API sắp lại hay ẩn thì bị từ chối `FORBIDDEN`, bố trí không đổi;
  - người ấy vẫn đọc được `fields.layout` (phiếu cần nó).
- AC-9: Given bố trí đã sắp lại và ẩn một trường, When người mở Cài đặt › Trường và phiếu cùng loại ở khổ 1280
  và 375, Then:
  - Cài đặt là một danh sách: hàng trường chuẩn và hàng trường tự tạo cùng khuôn (tay kéo, nhãn, huy hiệu kiểu, dòng
    phụ, công tắc), không tiêu đề nhóm hay khối gập nào tách hai loại;
  - phiếu theo đúng thứ tự trên danh sách, không có hàng đã ẩn;
  - không cuộn ngang ở 375.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`), preset `entity-feature`. Bốn trục:

- loại bản ghi: Thoả thuận · Công ty · Liên hệ;
- loại trường: chuẩn · chuẩn bắt buộc theo mô hình · tự tạo;
- thao tác: xem danh sách · sắp lại · ẩn và hiện lại · bật và tắt Bắt buộc;
- nơi thấy kết quả: Cài đặt › Trường · mục Chi tiết của phiếu · API · bảng · form tạo · thẻ Kanban · Kara.

Lớp cắt ngang: locale vi/en, quyền quản trị hay không, khổ 1280 và 375.

Thước CE:

- luật đích [SUY-TỪ-REPO: docs/design.md mục «Trường»];
- danh sách hàng mục Chi tiết [SUY-TỪ-REPO: apps/app/components/crm/record-sheet/{deal,company,contact}-sheet.tsx];
- trường bắt buộc theo mô hình [SUY-TỪ-REPO: packages/db/prisma/schema.prisma];
- cách lưu ở Cài đặt [SUY-TỪ-REPO: docs/settings.md mục «Lưu», «Trạng thái»];
- [NGÀNH: HubSpot «Record customization»; Salesforce «Page Layouts»] — sắp lại, ẩn thuộc tính mặc định, bắt buộc trên
  bố cục.

Ánh xạ Core sang AC:

- danh sách khớp phiếu, tên theo locale → AC-1;
- sắp lại × Cài đặt, API, phiếu → AC-2;
- ẩn và hiện lại trường chuẩn → AC-3;
- trường chuẩn bắt buộc × ẩn → AC-4;
- Bắt buộc cho trường tự tạo → AC-5;
- Bắt buộc × ẩn → AC-6;
- chưa sắp lần nào, trường mới, bố trí chưa tải → AC-7;
- quyền → AC-8;
- mắt người → AC-9.

Later và Never ở `coverage-scan.md`.

## Đường đo

- Thước: quản trị tự làm xong ba việc (đưa một trường tự tạo lên trên Ngày chốt, ẩn một trường chuẩn, bắt buộc một
  trường) không cần trợ giúp · số từ: phiên nghiệm thu sau khi lên production (đếm tay số người làm xong cả ba) · bảo
  đảm bởi: AC-2, AC-3, AC-5, AC-9
- Thước: phiếu hiện đúng thứ tự đã đặt ở Cài đặt · số từ: phiên nghiệm thu (người so phiếu với Cài đặt) và bài kiểm
  đọc thứ tự trên phiếu thật · bảo đảm bởi: AC-2, AC-7
- Thước: danh sách ở Cài đặt khớp phiếu · số từ: bài kiểm so nhãn Cài đặt với nhãn phiếu ở hai locale · bảo đảm bởi:
  AC-1

## Out of scope

- Form tạo và ô thêm nhanh đọc thứ tự, ẩn, bắt buộc (DA16).
- Thứ tự cột trên bảng, thẻ Kanban (DA17). Ẩn khỏi phiếu không ẩn cột của bảng.
- Ô đầu phiếu (`DetailSheetStat`): giữ như nay; ẩn chỉ áp cho mục Chi tiết (Hỏi-6).
- «Bắt buộc» cho trường chuẩn (Hỏi-2).
- Ẩn trường bắt buộc khỏi phiếu (Hỏi-4).
- Mô tả và Giai đoạn của thoả thuận: mục riêng của phiếu, không phải hàng của mục Chi tiết (Hỏi-5).
- Bố trí riêng từng người: Cài đặt › Trường là cài đặt của không gian làm việc.
- Kara đọc bố trí: Kara vẫn đọc và ghi trường đã ẩn (Hỏi-6).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Migration theo luật 1–2 của đợt: tên lấy giờ UTC thật, chỉ thêm bảng, không đổi bảng có sẵn.
- Không chạm `packages/ui` (vùng Mac Studio, luật 31) và `apps/agent` (vùng DA21).
- `apps/app/lib/messages/*.ts` chỉ thêm dòng; các dòng cũ không còn dùng để nguyên (luật 7).
- Tên hàm DA14 (`OTruongPhieu`, hàm khai trường chuẩn của phiếu) đọc lại sau khi DA14 gộp; khác thì sửa kế hoạch.
