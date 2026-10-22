# Quét không gian tiêu chí — truong-chuan-o-cai-dat

Preset `entity-feature`: thực thể là **bố trí trường** của một loại bản ghi — danh sách các trường ở mục Chi tiết của
phiếu, mỗi trường có một chỗ trong thứ tự, một trạng thái hiện hay ẩn, và một trạng thái bắt buộc.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ của OneHub — chân sản phẩm: đào repo (`CONTEXT.md` mục «Trường», `docs/design.md` mục «Trường»,
  `docs/settings.md`, `apps/app/components/crm/fields/*`, hợp đồng DA14) · chân ngành: HubSpot «Record customization»
  (sắp lại và ẩn thuộc tính mặc định ở thanh bên của bản ghi), Salesforce «Page Layouts» (thứ tự trường, ô bắt buộc trên
  bố cục).

## Trục

| Trục | Giá trị | Thước CE |
|---|---|---|
| A. Loại bản ghi | Thoả thuận · Công ty · Liên hệ | `FIELD_ENTITIES` [SUY-TỪ-REPO: apps/app/components/crm/fields/fields-entity.ts] |
| B. Loại trường | chuẩn · chuẩn bắt buộc theo mô hình dữ liệu · tự tạo | cột không null của `Deal`, `Company`, `Contact` [SUY-TỪ-REPO: packages/db/prisma/schema.prisma] · `FieldDefinition.required` [SUY-TỪ-REPO: packages/db/prisma/schema.prisma] |
| C. Thao tác | xem danh sách · sắp lại · ẩn / hiện lại · bật / tắt Bắt buộc | câu giao DA15 [SUY-TỪ-REPO: docs/plan/lo-trinh-viec-du-an.json] · luật «Cài đặt › Trường» [SUY-TỪ-REPO: docs/design.md] · [NGÀNH: HubSpot Record customization; Salesforce Page Layouts] |
| D. Nơi thấy kết quả | Cài đặt › Trường · mục Chi tiết của phiếu · API (đọc lại) · bảng · form tạo · thẻ Kanban · Kara | sáu mặt [SUY-TỪ-REPO: docs/design.md mục «Một bảng đăng ký theo kiểu»] |

Lớp cắt ngang (áp mọi ô Core, không thành trục): locale vi/en (`LOCALES` [SUY-TỪ-REPO: packages/ui/src/lib/locale.ts]),
quyền quản trị hay không (`fields.access` [SUY-TỪ-REPO: apps/api/src/fields/fields.router.ts]), khổ 1280 và 375.

## Không gian

A × B × C × D = 3 × 3 × 4 × 7 = 252 ô. Gạch: B = chuẩn bắt buộc × C = ẩn (không có nghĩa — ô bắt buộc phải có chỗ nhập),
B = chuẩn × C = Bắt buộc (Hỏi-2), D ∈ {bảng, form tạo, Kanban, Kara} cho mọi C trừ ghi chú dưới. Còn lại quét theo lát
D = phiếu và D = Cài đặt.

## Core (vào hợp đồng)

| Ô | AC |
|---|---|
| A × B ∈ {chuẩn, chuẩn bắt buộc} × xem danh sách × Cài đặt: đúng các hàng mục Chi tiết của phiếu, tên theo locale | AC-1 |
| A × B × sắp lại × {Cài đặt, API, phiếu}: một thứ tự trộn chuẩn với tự tạo | AC-2 |
| A × chuẩn × ẩn / hiện lại × {Cài đặt, API, phiếu}; giá trị còn nguyên | AC-3 |
| chuẩn bắt buộc × ẩn: không cho, có câu vì sao; máy chủ từ chối | AC-4 |
| tự tạo × bật Bắt buộc × {Cài đặt, API, phiếu} | AC-5 |
| tự tạo × Bắt buộc × ẩn: bắt buộc thì phải hiện | AC-6 |
| A × mọi B × chưa sắp lần nào; trường tự tạo mới sinh ra × thứ tự | AC-7 |
| quyền × mọi C × {Cài đặt, API} | AC-8 |
| mắt người: Cài đặt › Trường và phiếu sau khi sắp, ẩn — 1280 và 375 | AC-9 |

## Later (hàng sau của đợt)

- D = form tạo × {thứ tự, ẩn, Bắt buộc} → DA16 (đọc cùng bố trí).
- D = bảng (thứ tự cột theo bố trí), D = thẻ Kanban → DA17.
- D = Kara: Kara đọc bố trí hay «Bắt buộc» khi điền → DA21, DA23 nếu cần.
- B = chuẩn × Bắt buộc (bắt buộc Ngày chốt…) → hàng mới nếu chủ kho chọn lối kia ở Hỏi-2.

## Never (ở hàng này)

- Xoá hay đổi kiểu trường chuẩn: `docs/design.md` mục «Trường» cấm.
- Mô tả và Giai đoạn của thoả thuận trong danh sách sắp được: chúng là mục riêng của phiếu, không phải hàng của mục
  Chi tiết; Giai đoạn có trang Cài đặt riêng.
- Bố trí theo từng người: Cài đặt › Trường là cài đặt của không gian làm việc (`docs/settings.md` mục «Thanh bên»).

## Cross-cutting áp mọi ô Core

- Hai locale vi/en; nhãn trường chuẩn đọc từ đúng messages mà phiếu dùng.
- Người không phải quản trị: điều khiển khoá, một dòng nói vì sao (`docs/settings.md` mục «Trạng thái»).
- Lưu ngay khi đổi (Switch, kéo thả), lỗi thì toast và trả giá trị cũ (`docs/settings.md` mục «Lưu»).
