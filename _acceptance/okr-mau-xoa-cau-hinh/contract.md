---
schema_version: 1
feature: "Gỡ bộ OKR mẫu (`bun run okr:mau --xoa`, và nạp lại) xoá các phiên bản cấu hình chương trình OKR do người mẫu tạo, gỡ mã đơn vị mẫu khỏi các phiên bản còn lại, và đếm cả hai vào dòng in"
slug: okr-mau-xoa-cau-hinh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli, db]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-10T23:18:17Z
design_doc: docs/superpowers/specs/2026-10-11-okr-mau-xoa-cau-hinh-design.md
---

# Acceptance Contract: okr-mau-xoa-cau-hinh

## Context

Known limit của hồ sơ `okr-mau-xoa-cuoc-soan` (dòng `descope` d-20261010T224654Z-5): sau `--xoa`, phiên
bản `okrProgramConfig` do `le-hai-dang` ghi khi bật Soạn OKR vẫn còn, `createdById` trỏ người đã xoá,
`aiSoanDonVi` còn `mau-okr-pb-kd-bac`. Chủ kho chọn ngày 11/10: xoá các phiên bản do người mẫu tạo và
gạt mã đơn vị mẫu khỏi các phiên bản còn lại; cấu hình hiện hành lùi về bản trước phiên mẫu.

Source input: lời giao trong phiên 2026-10-11 · câu trả lời của chủ kho cùng phiên · design doc ·
`docs/setup.md` «Bộ OKR mẫu».

## Criteria

- AC-1 (cross-layer): Given kho và các bước dựng của ca `omx-xoa` (bộ mẫu nạp, `le-hai-dang` bật soạn cho `mau-okr-pb-kd-bac` qua `okr.setProgram` thật, các cuộc soạn), When chạy `bun run okr:mau --xoa`, Then quét mọi cột `id`/`*Id` của kho tìm mã người, bộ phận, phòng ban, chu kỳ, Mục tiêu và KR mẫu ra rỗng, KHÔNG trừ khoá nào — khoá `okrProgramConfig.createdById` phải có trong phép quét trước khi xoá và mất sau khi xoá; và quét mọi cột mảng `text[]` của kho tìm cùng tập mã ra rỗng (trước khi xoá phép quét này thấy `okrProgramConfig.aiSoanDonVi`).
- AC-2: Given kho của AC-4, When `--xoa` chạy xong, Then dòng in bắt đầu «Đã xoá bộ OKR mẫu:» và chứa đúng «1 phiên bản cấu hình chương trình OKR do người mẫu tạo» và «gỡ mã đơn vị mẫu khỏi 1 phiên bản khác».
- AC-3: Given kho chỉ có hai phiên bản cấu hình — bản trước ghi bởi người ngoài bộ mẫu (không mã mẫu) và bản sau ghi bởi `le-hai-dang` qua `okr.setProgram` với mã phòng mẫu trong cả 6 mảng `*DonVi` — When chạy `--xoa`, Then bản của `le-hai-dang` không còn, bản trước còn nguyên từng cột, và bộ đọc cấu hình thật (`cauHinhAiLuc`) trả số phiên bản của bản trước; và Given kho chỉ có bản của `le-hai-dang`, When `--xoa`, Then bảng không còn hàng nào và bộ đọc trả phiên bản 0 (mặc định).
- AC-4: Given kho của AC-3 có thêm bản thứ ba mới nhất ghi bởi người ngoài bộ mẫu, mỗi mảng `*DonVi` chứa cả mã phòng mẫu lẫn một mã ngoài bộ mẫu, When chạy `--xoa`, Then bản thứ ba còn, mỗi mảng chỉ còn mã ngoài bộ mẫu, mọi cột khác (gồm `version`, `createdById`, `createdAt`) không đổi, nó vẫn là bản bộ đọc trả; bản trước còn nguyên từng cột. Given thay bản thứ ba bằng bản ngoài bộ mẫu mà mỗi mảng chỉ có mã phòng mẫu và mọi `*PhamVi` là `danh-sach`, When `--xoa`, Then mảng thành rỗng và ba bộ đọc thật mà `apps/api` gọi được — `OkrService.program`, `docChamVaTran`, `cauHinhAiLuc` — đọc được bản đó không ném lỗi.
- AC-5: Given kho không còn bộ mẫu nhưng còn một phiên bản cấu hình có `createdById = 'mau-okr-nguoi-le-hai-dang'` và `aiSoanDonVi = ['mau-okr-pb-kd-bac']` (đúng hàng `okr.setProgram` đã ghi, chèn lại sau khi bộ mẫu bị gỡ — trạng thái kho của ai đã chạy `--xoa` trước bản vá), When chạy `--xoa`, Then lệnh thoát 0, hàng không còn, dòng in là «Đã xoá bộ OKR mẫu:» có «1 phiên bản cấu hình chương trình OKR do người mẫu tạo» — không phải «không có bộ mẫu».
- AC-6: Given bộ mẫu đã nạp và `le-hai-dang` đã ghi một phiên bản cấu hình, When nạp lại (`bun run okr:mau` không cờ), Then lệnh thoát 0 và không còn phiên bản nào có `createdById` bắt đầu `mau-okr-`.
- AC-7: Given bộ mẫu có phiên bản cấu hình do `le-hai-dang` ghi và một bản ngoài bộ mẫu chứa mã phòng mẫu, cùng một thoả thuận ngoài bộ mẫu do người mẫu làm chủ, When chạy `--xoa`, Then lệnh thoát 5 và mọi bảng của kho giống hệt trước, kể cả `okrProgramConfig`.
- AC-8 (judgment): Given `docs/setup.md` mục «Bộ OKR mẫu», When người mới đọc, Then họ biết `--xoa` và nạp lại xoá phiên bản cấu hình chương trình OKR do người mẫu tạo (cả bản sót từ lần xoá trước) và gỡ mã đơn vị mẫu khỏi các phiên bản khác, biết hệ quả là cấu hình đang dùng lùi về bản trước phiên mẫu (hoặc về mặc định), và câu cũ «hiện vẫn còn sau `--xoa`» không còn; mục không tự đúc từ ghép tiếng Việt cho thuật ngữ kỹ thuật mà `CONTEXT.md` không có.
- AC-9: Given tám bản sao phá vật thật — (a) bỏ lệnh xoá phiên bản do người mẫu tạo, (b) bỏ bước gỡ mã đơn vị mẫu, (c) gỡ trắng cả mảng thay vì chỉ mã mẫu, (d) chọn phiên bản chỉ theo người mẫu đang có (bỏ vế tiền tố), (e) xoá mọi phiên bản thay vì chỉ bản do người mẫu tạo, (f) bỏ hai con số cấu hình khỏi dòng in, (g) không tính hai tập cấu hình vào tổng, (h) như (a) nhưng đo bằng ca `omx-xoa` — When chạy phép đo tương ứng trên bản sao, Then mỗi phép đo xanh trước khi phá và đỏ sau khi phá với đúng thông điệp ghim của nó, và tệp thật không đổi.
- AC-10: Given cây của vòng này, When chạy phép đo đột biến của hồ sơ `okr-mau-xoa-cuoc-soan`, Then nó vẫn thoát 0 với 7/7 cặp đạt — vòng này không làm gãy chuỗi neo nào của hồ sơ anh em.
- AC-11: Given spec `okr-mau-cau-hinh.spec.ts` chạy trong một lượt `bun run test` chung CSDL với các spec khác, When spec chạy xong, Then bảng `okrProgramConfig` giống hệt lúc spec bắt đầu.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`). Trục: ai tạo phiên bản (người mẫu · mã người mẫu
mồ côi · người ngoài) × vị trí trong chuỗi (trước · trong · sau phiên mẫu) × mã trong 6 mảng `*DonVi`
(không · chỉ mẫu · lẫn) × đường gỡ (`--xoa` · nạp lại · mã 5). Thước CE: cột `createdById` và 6 mảng
của `OkrProgramConfig` (schema.prisma, `okrProgram`), bốn bộ đọc lấy bản mới nhất, ba lời gọi
`xoaTrong`. Core → AC-1…AC-7; AC-10, AC-11 giữ lượt đo sạch (hồ sơ anh em, spec chung CSDL). Chân ngành cận kề: Rails `db:seed:replant`, Django `flush`.

## Đường đo

Bỏ — không có `opportunity.md` (việc sửa lỗi kho, không đi từ Cổng Đáng).

## Out of scope

- Viết lại `createdById` sang một người thật, hay giữ cài đặt người mẫu bật lúc demo — chủ kho chọn xoá.
- Đánh lại số `version` cho liền; số của bản bị xoá được dùng lại ở lần `setProgram` kế (`version` là `@unique`, không bộ đọc nào cần số liền).
- `okrDiemKr.phienBanChuongTrinh` của một kỳ OKR thật khép điểm trong lúc bộ mẫu còn trong kho: nó giữ số của bản bị xoá, số đó có thể được dùng lại. Không bộ đọc nào tra cấu hình theo số này (`bangCham` đọc trên chính hàng điểm).
- Sửa văn bản hồ sơ `okr-mau-xoa-cuoc-soan` (E1 của nó còn nhắc khoá đã bỏ); hồ sơ đó giữ nguyên, phép đo đột biến của nó chạy lại ở AC-10.

## Notes

- Không ui-check: hồ sơ không có mặt người nhìn (`surfaces: [cli, db]`).
- Danh sách 6 mảng rút từ `OKR_PROGRAM_MAC_DINH`, không chép tay; spec ghim tập cột `text[]` của `okrProgramConfig` để một cột mới làm phép đo đỏ thay vì lặng lẽ không được gỡ.
- Known limits:
