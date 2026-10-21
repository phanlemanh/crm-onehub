---
schema_version: 1
feature: "Nhân viên quan hệ đối tác xem và sửa một trường tự tạo trên phiếu và trong bảng y như trường có sẵn: số viết kiểu Việt, ô tích có nhãn, liên kết bấm được, lỗi nói tiếng Việt"
slug: truong-mot-cach-cu-xu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: verified
approved_by: manh
approved_at: 2026-10-21T00:36:49Z
design_doc: docs/superpowers/specs/2026-10-21-truong-mot-cach-cu-xu-design.md
---

# Acceptance Contract: truong-mot-cach-cu-xu

## Context

Hàng DA14 của `docs/plan/lo-trinh-viec-du-an.json`, gói `truong-hop-dong` (#511). Chủ kho duyệt Cổng Đáng (build) ngày
20/10/2026. Mốc đợt là 2026-10-22.

Hôm nay trường tự tạo đi đường riêng, nên lệch trường chuẩn:

- Phiếu vẽ nó ở `record-fields.tsx`, bảng ở `field-columns.tsx`.
- Ô Số không nhận «1.234,5», và báo lỗi bằng câu tiếng Anh của máy chủ.
- Ô tích không có nhãn.
- Liên kết, Email, Điện thoại là chữ trơn.
- Có ba tên gọi khác nhau cho cùng một thứ.

Luật đích ở `docs/design.md` mục «Trường»: người dùng không phân biệt được trường chuẩn với trường tự tạo. DA14 dựng
bảng đăng ký theo kiểu (hiển thị, sửa tại chỗ, ô bảng). Ba phiếu và ba bảng vẽ mọi trường có kiểu qua bảng đó, cả trường
chuẩn lẫn tự tạo.

Source input: `opportunity.md` · câu giao DA14 · `docs/design.md` mục «Trường» · `CONTEXT.md` mục «Trường» · design doc.

Mười kiểu theo `FIELD_TYPES` (`packages/db/src/fields-shape.ts`), cộng Tiền:

- Chữ, Chữ dài, Số, Ngày, Ô tích, Chọn, Người;
- Liên kết, Email, Điện thoại;
- Tiền (chỉ trường chuẩn: Giá trị của thoả thuận).

## Criteria

- AC-1: Given ba phiếu (Thoả thuận, Công ty, Liên hệ) và ba bảng cùng loại, When đọc mã vẽ giá trị trường của chúng,
  Then:
  - mọi trường có kiểu, cả chuẩn lẫn tự tạo, đi qua một bảng đăng ký theo kiểu ở
    `apps/app/components/crm/fields/kieu-truong.tsx`, qua `OTruongPhieu`, `OTruongBang` hay `HienThiTruong`;
  - bảng ấy khai đủ ba mặt (hiển thị, sửa tại chỗ, ô bảng) cho mười một kiểu;
  - không tệp nào trong danh sách sáu màn và hai tệp trường cũ còn rẽ nhánh theo kiểu trường, hay tự gọi ô sửa
    (`InlineField`, `InlineDateField`, `InlineSelectField`, `InlineMoneyField`, `InlineTextArea`) hoặc hàm hiện giá
    trị (`formatMoney`, `LocalDay`, `OwnerCell`, `SoDienThoai`, `formatDay`) cho một trường;
  - ngoại trừ có tên: ô Công ty, ô Giai đoạn, và vai trò liên hệ trong thoả thuận.
- AC-2 (cross-layer): Given một trường tự tạo kiểu Số trên phiếu Thoả thuận, When người gõ một chuỗi rồi Enter, Then:
  - ở tiếng Việt: «1.234,5» lưu 1234.5; «1234,5» lưu 1234.5; «-2,75» lưu -2.75; «1.234.567» lưu 1234567;
  - ở tiếng Anh: «1,234.5» lưu 1234.5;
  - lượt lưu gửi một `number` trong `data.fields`;
  - sau khi máy chủ trả, phiếu hiện đúng cách viết của locale («1.234,5» và «1,234.5») với `tabular-nums`;
  - đọc lại bản ghi qua API thì giá trị là 1234.5.
- AC-3 (cross-layer): Given phiếu đang ở tiếng Việt, When người gõ chuỗi sai kiểu rồi Enter, Then ô giữ chế độ sửa, hiện
  ngay dưới ô một câu tiếng Việt theo kiểu, và không gọi lưu:
  - Số «abc», và Số «1234.5» (cách viết tiếng Anh) → «Ô này nhận số, ví dụ 1.234,5»;
  - Email «an@» → câu Email;
  - Liên kết «khong co cham» → câu Liên kết;
  - Điện thoại «12ab» → câu Điện thoại;
  - trường bắt buộc để trống → câu «không được để trống».

  Và When máy chủ từ chối một lượt lưu trường — trường tự tạo (lựa chọn vừa bị lưu trữ, người vừa rời đội) hay trường
  chuẩn (Tên) — Then:
  - toast là «Chưa lưu được <nhãn>.» nối với câu của mã từ chối theo kiểu, đọc từ messages của app:
    `lua-chon` cho Chọn, `nguoi` cho Người, `khac` cho kiểu không có luật riêng;
  - toast không chứa `error.message` của máy chủ;
  - ô về giá trị cũ.
- AC-4: Given một trường tự tạo kiểu Ô tích, When người mở phiếu, Then:
  - ô tích có tên truy cập đúng bằng nhãn trường;
  - bấm vào nhãn thì đổi giá trị và gửi lưu `true`/`false`;
  - ở bảng và đầu phiếu, giá trị hiện «Có» hay «Không».
- AC-5 (theo Hỏi-2, lối máy khuyên): Given trường Liên kết, Email, Điện thoại có giá trị — cả trường chuẩn (Trang web, Email, Điện thoại của công ty)
  lẫn trường tự tạo cùng kiểu — When người mở phiếu hay bảng, Then giá trị là liên kết bấm được:
  - Liên kết: `href` là giá trị, thêm `https://` khi thiếu giao thức, `target="_blank"`, `rel` chứa `noopener`;
  - Email: `mailto:<giá trị>`;
  - Điện thoại: `tel:` với số đã chuẩn hoá qua `docSoDienThoai`.

  Trên phiếu, nút «Sửa <nhãn>» cạnh liên kết mở ô nhập. Giá trị trống thì không có thẻ `<a>`.
- AC-6: Given ba phiếu, When đọc bộ mô tả trường chuẩn mà mỗi phiếu đưa vào bảng đăng ký, Then mỗi trường chuẩn có đúng
  kiểu đã khai ở bảng «Trường chuẩn → kiểu» của design doc:
  - Ngày chốt là Ngày, Người phụ trách là Người, Giá trị là Tiền;
  - Trang web là Liên kết, Điện thoại là Điện thoại;
  - và đủ các dòng còn lại của bảng.

  Và trên phiếu thật (DealOverview, CompanyOverview, ContactOverview vẽ với bản ghi mang trường tự tạo cùng kiểu), với
  mỗi cặp (trường chuẩn, trường tự tạo) cùng kiểu, hai hàng cùng cấu trúc: cùng vai trò truy cập, cùng thẻ, cùng lớp
  của ô giá trị.
- AC-7: Given ba bảng có cột trường chuẩn và cột trường tự tạo bật «Hiện trong bảng», When bảng vẽ một hàng ở tiếng
  Việt, Then ô của mỗi kiểu hiện:
  - Số «1.234,5» với `tabular-nums`; Tiền qua `formatMoney`; Ngày qua `LocalDay`; Người qua `OwnerCell`;
  - Ô tích «Có»/«Không»; Chọn bằng nhãn lựa chọn;
  - Liên kết, Email, Điện thoại bấm được như AC-5;
  - giá trị trống là «—».

  Cột chuẩn và cột tự tạo cùng kiểu cho cùng DOM ô. `header`, `width`, `hideBelow`, `sortable` của từng cột giữ nguyên
  như trên onehub.
- AC-8: Given chuỗi tiếng Việt của app (`apps/app/lib/messages/*.ts`), When quét, Then không chuỗi nào còn «tuỳ chỉnh»,
  «tùy chỉnh» hay «trường động». Hai dòng `crm.ts` `createHint` và `kara-ban-ghi.ts` `set_field_value` gọi đúng
  «trường». Hai dòng này được sửa qua yêu cầu `cham-tep` đã duyệt.
- AC-9: Given mỗi loại một bản ghi, có trường tự tạo cùng kiểu với các trường chuẩn của phiếu ấy, When người mở ba
  phiếu ở khổ 1280 và 375 và ba bảng ở khổ 1280, Then:
  - với mỗi kiểu có cả trường chuẩn lẫn trường tự tạo trên cùng phiếu, che nhãn đi thì người nhìn ảnh không phân biệt
    được hai hàng: cùng thẳng hàng, cùng cỡ chữ, cùng cách hiện theo kiểu;
  - hàng tự tạo nằm trong cùng lưới với hàng chuẩn, sau Người phụ trách, theo thứ tự ở Cài đặt › Trường: không tiêu đề
    nhóm, không nhãn phụ, không đường phân cách (đổi chỗ chung thuộc DA15);
  - không cuộn ngang ở 375.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`), preset `entity-feature`. Năm trục:

- kiểu: Chữ · Chữ dài · Số · Ngày · Ô tích · Chọn · Người · Liên kết · Email · Điện thoại · Tiền · Tệp (Tệp: DA19);
- loại trường: chuẩn · tự tạo;
- mặt: hiển thị (phiếu, đầu phiếu, ô bảng) · sửa tại chỗ · ô form tạo (DA16) · lọc (DA18) · sort (DA17);
- locale: vi · en;
- trạng thái giá trị: trống · có giá trị · nhập sai · máy chủ từ chối · đang lưu.

Thước CE:

- bảng sáu mặt theo kiểu [SUY-TỪ-REPO: docs/design.md mục «Trường»];
- danh sách kiểu [SUY-TỪ-REPO: packages/db/src/fields-shape.ts FIELD_TYPES];
- danh sách trường chuẩn [SUY-TỪ-REPO: apps/app/components/crm/fields/standard-fields.ts];
- cách đọc số theo locale [SUY-TỪ-REPO: packages/ui/src/lib/money-input.ts].

Ánh xạ Core sang AC:

- bảng đăng ký và luật không rẽ nhánh → AC-1;
- Số × vi/en × lưu → AC-2;
- nhập sai × kiểu → AC-3;
- Ô tích → AC-4;
- Liên kết, Email, Điện thoại × chuẩn/tự tạo × phiếu/bảng → AC-5;
- kiểu của trường chuẩn → AC-6;
- ô bảng × kiểu → AC-7;
- tên gọi → AC-8;
- mắt người → AC-9.

Later và Never ở `coverage-scan.md`.

## Đường đo

- Thước: ở phiên nghiệm thu, người dùng thật không chỉ ra được trường nào là tự tạo trên một phiếu và một bảng · số từ: phiên nghiệm thu sau khi lên production (đếm tay số người đoán đúng) · bảo đảm bởi: AC-1, AC-6, AC-9
- Thước: lượt lưu trường bị máy chủ từ chối với câu tiếng Anh · số từ: không còn đường nào in `error.message` ở lượt lưu trường · bảo đảm bởi: AC-3
- Thước: gõ «1.234,5» vào ô Số lưu được ngay lần đầu · số từ: phiên nghiệm thu (đếm tay lượt gõ đầu thành công) · bảo đảm bởi: AC-2

## Out of scope

- Ô trường trong form tạo và ô thêm nhanh (DA16).
- Sort theo trường, ẩn cột theo kiểu ở khổ hẹp, trường tự tạo trên thẻ Kanban (DA17). DA14 giữ `hideBelow` của từng
  cột như nay.
- Lọc theo trường (DA18).
- Cài đặt › Trường: dịch tên trường chuẩn, sắp lại, ẩn, bật «Bắt buộc» (DA15).
- Kiểu Tệp (DA19, DA20).
- Kiểu Tiền cho trường tự tạo: thêm vào `FIELD_TYPES` là đổi schema.
- Câu lỗi tiếng Anh của API cho máy gọi (Kara, khoá API): hợp đồng máy với máy, màn hình không đọc nữa.
- Ô Công ty, ô Giai đoạn, vai trò liên hệ trong thoả thuận: không có dòng trong bảng kiểu (Hỏi-1).
- Đổi chỗ hàng tự tạo xen giữa trường chuẩn: hàng tự tạo đứng sau Người phụ trách tới khi DA15 cho sắp lại trường chuẩn.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Không chạm `packages/ui` (vùng Mac Studio, luật 31). Bảng đăng ký chỉ ghép thành phần có sẵn trong `apps/app`.
- Hai dòng đổi tên đi qua `cham-tep` (luật 7, 33).
- Không chạm `apps/agent` (vùng DA21).
