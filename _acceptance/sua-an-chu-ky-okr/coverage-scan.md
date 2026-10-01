# Quét độ phủ — sua-an-chu-ky-okr

Preset: `entity-feature` (thực thể «chu kỳ OKR»), chạy 2026-09-30 sau khi chủ kho duyệt cách A.

## Ngữ cảnh

- Sản phẩm: CRM OneHub, khu OKR — chân sản phẩm: đào repo [SUY-TỪ-REPO: CONTEXT.md mục «Chu kỳ»; apps/api/src/okr/okr.service.ts `createCycle`, `setCyclePhase`; apps/api/src/okr/okr-khep.service.ts `moLaiKy`, `mangSang`; packages/db/src/okr-tien-do.ts `chonChuKyHienTai`; _acceptance/dat-okr-trong-crm/decisions.jsonl d-20260925T033813Z-12]
- Chân ngành: Perdoo — Configure › Cadences có «Edit cadence», «Archive cadence», «Delete cadence» (xoá cadence xoá luôn mọi timeframe cùng OKR trong đó, bắt gõ «delete forever») [NGÀNH: Perdoo, support.perdoo.com/en/articles/4515060-cadences-and-timeframes]; Profit.co cho tạo kỳ tuỳ chỉnh ở Settings › Periods và lưu trữ OKR thay vì xoá [NGÀNH: Profit.co, profit.co/answers/okrs/how-to-create-customize-okr-periods-under-settings-in-profit-co]. Rút ra: sửa, lưu trữ, xoá là ba việc riêng ở công cụ cùng loại; xoá kéo theo dữ liệu là chỗ OneHub cố ý không theo (vết phải sống).

## Trục

- **Trục A — việc:** sửa mọi ô · sửa tên · gỡ · ẩn · hiện lại  [thước CE: năm việc của thiết kế đã duyệt 30/09; NGÀNH: Perdoo edit/archive/delete]
- **Trục B — tình trạng chu kỳ:** trống ở «Lập kế hoạch» · trống ở pha khác · có dữ liệu (mục tiêu, lần hỏi ý, quý con, đợt rà, điểm, mang sang) · «Đã đóng» · đã ẩn  [thước CE: sáu quan hệ trỏ tới `OkrCycle` trong schema.prisma + `PHA_CHU_KY`]
- **Trục C — người gọi:** quản trị · thành viên thường · vai «chỉ OKR»  [thước CE: `assertQuanTri`, `vai-chi-okr.spec.ts`]
- **Trục D — nơi đọc chu kỳ (chu kỳ ẩn phải vắng):** ô chọn kỳ và kỳ mặc định · kỳ mặc định tab Hỏi ý · kiểm quý chồng · đích mang sang · nhắc buổi sáng (cập nhật tuần, chờ duyệt, Hỏi ý, «liên quan OKR») · cập nhật tuần của tôi · chụp số hằng ngày · chuyển việc khi người rời · ghi mới  [thước CE: rang/noi-doc-chu-ky.json — 15 chỗ lọc, 6 chỗ miễn, quét năm mẫu ngày 30/09 sau phản biện]

## Không gian (A × B, vai gộp ở C)

| | trống, lập kế hoạch | trống, pha khác | có dữ liệu | đã đóng | đã ẩn |
|---|---|---|---|---|---|
| sửa mọi ô | Core | Never | Never | Never | Never |
| sửa tên | Core | Core | Core | Never | Never |
| gỡ | Core | Core | Never | Never (trống mà đã đóng không có) | Never |
| ẩn | — (trống thì gỡ) | — | Core | Core | — |
| hiện lại | — | — | — | — | Core |

## Core

1. Sửa mọi ô khi trống ở «Lập kế hoạch» — lấp lỗ 1, 2, 3 (ngày, khoảng nghỉ, thứ cập nhật sai).
2. Sửa tên ở mọi pha trừ «Đã đóng» — lấp lỗ 6 kể cả khi đã có dữ liệu.
3. Gỡ chu kỳ trống ở mọi pha chưa đóng — lấp ca tạo nhầm chưa ai dùng; vết «tạo» và «gỡ» còn.
4. Ẩn chu kỳ có dữ liệu hoặc đã đóng, bắt lý do — lấp lỗ 4 và 5.
5. Hiện lại chu kỳ đã ẩn — đảo được; kiểm lại quý chồng.
6. Trục D: chu kỳ ẩn vắng ở mọi nơi đọc bằng MỘT điều kiện dùng chung — đây là lõi của «ẩn».
7. Trục C: chỉ quản trị làm được bốn việc; thành viên và «chỉ OKR» bị từ chối.

## Later

- Ẩn năm kéo theo các quý của nó (hôm nay chặn, nói số quý còn hiện).
- Chuyển mục tiêu từ chu kỳ nhầm sang chu kỳ đúng.
- Bộ lọc «hiện chu kỳ đã ẩn» ở ô chọn kỳ cho người muốn tra lại.

## Never

- Sửa ngày khi đã có dữ liệu — kỳ vọng theo ngày, bản chụp số và điểm đã tính theo ngày cũ.
- Xoá chu kỳ có dữ liệu (kiểu Perdoo xoá kéo theo) — vết phải sống, quyết định d-20260925T033813Z-12.
- Lùi pha — lượt 7 đã chốt chỉ có «Mở lại kỳ».
- Sửa chu kỳ đã ẩn — hiện lại trước rồi sửa, để một chu kỳ không đổi khi không ai thấy.

## Cross-cutting áp mọi ô Core

- Mỗi việc để đúng một dòng vết mang trước/sau; gỡ không xoá dòng vết cũ (`okrTrail.cycleId` không khoá ngoại).
- Khoá hàng chu kỳ `FOR UPDATE` và kiểm lại dưới khoá (như `setCyclePhase`).
- Máy chủ tính sẵn chu kỳ nào sửa, gỡ, ẩn được; màn chỉ vẽ.
- Chữ mới vi và en khác nhau; tên chu kỳ mang `translate="no"`.
- Migration chỉ thêm cột có mặc định rỗng.
