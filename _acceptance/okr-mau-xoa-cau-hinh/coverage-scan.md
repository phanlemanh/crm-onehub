---
slug: okr-mau-xoa-cau-hinh
preset: test-matrix (tự dựng trục theo B1)
at: 2026-10-11
---

## Ngữ cảnh

- Sản phẩm: lệnh dev `bun run okr:mau` của CRM OneHub — chân sản phẩm: đào repo
  [SUY-TỪ-REPO: apps/api/scripts/okr-mau/nap.ts] [SUY-TỪ-REPO: apps/api/src/okr/okr.service.ts]
  [SUY-TỪ-REPO: packages/db/prisma/schema.prisma] [SUY-TỪ-REPO: docs/setup.md] · chân ngành:
  dữ liệu mẫu gỡ được ngang hàng dữ liệu thật — cận kề [NGÀNH: Rails `db:seed:replant`],
  [NGÀNH: Django `flush`/fixtures]: gỡ dữ liệu mẫu trả bảng về trạng thái trước khi gieo, không
  để hàng trỏ khoá đã xoá.

## Trục

- **A — ai tạo phiên bản cấu hình:** người mẫu còn trong kho | mã người mẫu đã mất (mồ côi từ
  lần `--xoa` trước bản vá) | người ngoài bộ mẫu
  [thước CE: `createdById` là cột duy nhất trỏ người — schema.prisma `OkrProgramConfig`]
- **B — vị trí phiên bản trong chuỗi:** trước phiên mẫu | trong phiên mẫu | sau phiên mẫu (mới nhất)
  [thước CE: mọi bộ đọc lấy bản mới nhất — `okr.service.program`, `docChamVaTran`, `docThangCham`,
  `cauHinhAiLuc`]
- **C — mã trong 8 mảng `*DonVi`:** không có mã | chỉ mã mẫu | mã mẫu lẫn mã ngoài
  [thước CE: 8 trường mảng của `okrProgram` — packages/validation/src/okr-chuong-trinh.ts]
- **D — đường gỡ:** `--xoa` | nạp lại | bị chặn mã 5 (dữ liệu ngoài giữ người mẫu)
  [thước CE: ba lời gọi `xoaTrong` trong `nap.ts`; mã thoát ở docs/setup.md]

## Core

1. A=người mẫu × B=trong phiên × D=`--xoa` → phiên bản bị xoá; cấu hình hiện hành lùi về bản trước
   phiên mẫu (AC-1, AC-3).
2. A=ngoài × B=trước phiên × C=không mã mẫu → giữ nguyên từng cột (AC-3).
3. A=ngoài × B=sau phiên × C=lẫn → giữ hàng, gạt đúng mã mẫu, cột khác nguyên (AC-4).
4. A=mồ côi × D=`--xoa`, kho không còn bộ mẫu → vẫn gỡ, đếm, không báo «không có bộ mẫu» (AC-5).
5. D=nạp lại → phiên bản do người mẫu tạo đi theo (AC-6).
6. D=mã 5 → không phiên bản nào đổi (AC-7).
7. Dòng in đếm hai con số (AC-2).

## Later

- Gạt mã người mẫu nếu sau này cấu hình có mảng chứa mã người (hiện không có).

## Never

- Viết lại `createdById` sang một người thật — chủ kho đã chọn xoá (sổ quyết định).
- Đánh lại số `version` cho liền mạch — `version` là `@unique`, không bộ đọc nào cần số liền.
- Sửa `okrDiemKr.phienBanChuongTrinh` trỏ số bị dùng lại — hàng điểm của KR mẫu đã đi theo `--xoa`;
  hàng thật khép trong lúc có bộ mẫu là ca ngoài bộ mẫu (Out of scope).

## Cross-cutting áp mọi ô Core

- Mọi việc trong một giao dịch: lỗi ở bất kỳ bước nào thì không hàng nào đổi.
- Không còn cột `*Id` hay mảng `text[]` nào của kho chứa mã người, bộ phận hay phòng ban mẫu.
