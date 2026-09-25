# Quét độ phủ AC — dat-okr-trong-crm

Preset: entity-feature + test-matrix (skill `morphological-scan`, 25/09/2026). Thực thể: bộ OKR của một đơn vị trong một chu kỳ.

## Ngữ cảnh

- Sản phẩm: CRM của OneHub — chân sản phẩm: đào repo (`CONTEXT.md` mục Mục tiêu · KR · Chu kỳ · Căn chỉnh · Người phụ trách · Trưởng đơn vị · Phạm vi dữ liệu; `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 3»; `apps/app/app/proto/_modules/ban-mau-okr/du-lieu.ts`; `apps/api/src/to-chuc/cay.ts`; `packages/validation/src/vai-workspace.ts`) · chân ngành: kiểu KR và pha chu kỳ của công cụ OKR cùng loại [NGÀNH: Perdoo — increase/decrease/stay above/stay below/milestone; Weekdone — cycle, alignment nhiều cấp]; Google re:Work OKR guide (mục tiêu cam kết vs tham vọng) [NGÀNH: Google re:Work].

## Trục

- Trục A — vật: chu kỳ | cấu hình chương trình | mục tiêu | KR | căn chỉnh | vết | lô nhập  [thước CE: bảng mục 2 design doc, 7 bảng/khuôn — mỗi vật một dòng]
  - Vì sao độc lập: đổi vật không ép đổi hành động hay người.
- Trục B — hành động: tạo | sửa | công bố/đổi pha | bỏ | đọc lại | nhập lô  [thước CE: preset entity-feature (CRUD + vòng đời) + bảng thủ tục mục 3 design doc]
- Trục C — người: quản trị | trưởng bộ phận | trưởng phòng ban | người phụ trách KR | thành viên thường | vai «chỉ OKR» (làm trưởng và không làm trưởng)  [thước CE: bảng quyền mục 4 design doc; `WORKSPACE_ROLES`; `Division.headUserId`/`Department.headUserId`]
- Trục D — cấp/chu kỳ: OneHub | bộ phận | phòng ban | cá nhân (bật/tắt) × quý | năm  [thước CE: `CONTEXT.md` mục Bộ phận, Phòng ban (hai cấp cố định); lộ trình mục 5]
- Cross-cutting (không thành trục): khổ 390/1440, vi/en, `translate="no"`, ba trạng thái màn, cổng thiết kế tĩnh, migration chỉ thêm.

Trục «trạng thái dữ liệu» của test-matrix gộp vào B (đọc lại) và các ô biên: rỗng, chưa có chu kỳ, đơn vị không trưởng, pha khoá.

## Không gian (A × B, lát theo C và D ở ô cần)

| Vật \ Hành động | tạo | sửa | công bố / đổi pha | bỏ | đọc lại | nhập lô |
|---|---|---|---|---|---|---|
| chu kỳ | Core AC-1 (quản trị; năm, quý trong năm) | Never — sửa ngày chu kỳ sau khi mở: lượt 7 | Core AC-1 (pha chỉ tới) | Never — xoá chu kỳ | Core AC-1, AC-13 | — |
| cấu hình chương trình | Core AC-2 (dòng phiên bản) | (= tạo dòng mới) | — | — | Core AC-2, AC-13 | — |
| mục tiêu | Core AC-3 (bốn cấp, tham gia, vì sao) | Core AC-3, AC-6 (quyền) | Core AC-5 | Core AC-5 (đã bỏ) | Core AC-3, AC-10, AC-11 | Core AC-9 |
| KR | Core AC-4 (sáu kiểu) | Core AC-4, AC-5 (khởi điểm khoá), AC-6 (phụ trách KR) | (theo mục tiêu) | Core AC-4 (xoá) | Core AC-4, AC-11 | Core AC-9 |
| căn chỉnh | Core AC-7 | — | — | Core AC-7 (gỡ) | Core AC-7 (cây), AC-10 | Later — cột căn chỉnh trong bảng tính (lượt 8 mẫu) |
| vết | (theo mọi ghi) Core AC-8 | Never — sửa vết | — | Never | Core AC-8, AC-11 | Core AC-9 |
| lô nhập | — | — | Core AC-9 (công bố ngay) | — | Core AC-9 (xem trước không ghi) | Core AC-9 |

Lát C (người): AC-6 phủ quản trị · trưởng bộ phận · trưởng phòng ban · người phụ trách KR · thành viên thường · trưởng đơn vị khác; AC-12 phủ vai «chỉ OKR» hai tư thế. Lát D (cấp × chu kỳ): AC-3 phủ bốn cấp; AC-7 phủ quý → năm; AC-2 phủ cá nhân tắt.

## Core (≤ 20 %)

1. Chu kỳ năm/quý với pha và ngày Việt Nam — AC-1.
2. Cấu hình chương trình có phiên bản, trần cảnh báo/chặn — AC-2.
3. Mục tiêu bốn cấp đọc lại từ DB — AC-3.
4. KR sáu kiểu với ràng buộc theo kiểu — AC-4.
5. Công bố khoá khởi điểm, bỏ — AC-5.
6. Quyền theo bản ghi — AC-6.
7. Căn chỉnh nhiều–nhiều lên cấp trên, cây — AC-7.
8. Vết riêng, không qua Activity — AC-8.
9. Nhập lô xem trước rồi ghi — AC-9.
10. Màn Theo đơn vị + điều hướng — AC-10.
11. Sheet mục tiêu + cảnh cạnh Thoả thuận — AC-11.
12. Vai «chỉ OKR» đọc/ghi OKR mình, vẫn chặn đối tác — AC-12.
13. Cài đặt › Chương trình OKR theo `docs/settings.md` — AC-13.
14. Cổng thiết kế tĩnh + dấu hiệu vẽ tay — AC-14.
15. Migration chỉ thêm, khối liền — AC-15.

## Later

- Sửa ngày chu kỳ, mở lại kỳ đã đóng, pha lùi — lượt 7.
- Cột căn chỉnh và cột loại mục tiêu trong bảng tính nhập — khi có mẫu OKR (lượt 8).
- Chuyển mục tiêu/KR khi người nghỉ — lượt 4 (hộp «Chuyển việc 30 ngày»).
- Tab «Toàn cảnh» có nội dung — lượt 5.

## Never

- Xoá hẳn chu kỳ hoặc mục tiêu — vết phải sống; chỉ «bỏ».
- Sửa vết — vết chỉ thêm.
- Nút phân rã KR cấp trên thành mục tiêu cấp dưới — NG-06 đã quyết.
- Cây tổ chức riêng cho OKR — nguyên tắc một cây.

## Cross-cutting áp mọi ô Core

- Mỗi thủ tục ghi có khẳng định đọc lại từ DB và một dòng vết.
- Mỗi màn: rỗng · đang tải · lỗi; 390 và 1440; vi/en; `translate="no"`.
- Cổng thiết kế tĩnh và bảng «Dấu hiệu vẽ tay» trên mọi tệp giao diện chạm.
