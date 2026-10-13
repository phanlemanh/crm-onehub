---
schema_version: 1
feature: "Mở lại một kế hoạch đã đóng hay bỏ «xong» một bước không trả việc về người đã sang vai «chỉ OKR»"
slug: mo-lai-khong-tra-viec-chi-okr
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, docs]
status: verified
approved_by: Phan Le Manh
approved_at: 2026-10-13T01:07:29Z
design_doc: docs/superpowers/specs/2026-10-13-mo-lai-khong-tra-viec-chi-okr-design.md
---

# Acceptance Contract: mo-lai-khong-tra-viec-chi-okr

## Context

Hàng DA0b của `docs/plan/lo-trinh-viec-du-an.json`, dãy P0 của đợt r2, đứng trên DA0a (#372). DA0a chặn mọi
đường giao việc kế hoạch 30 ngày cho người không đọc được dữ liệu đối tác, nhưng hai đường biến việc đã khép
thành việc mở — mở lại kế hoạch (`datDong(id, false)`) và bỏ «xong» một bước (`setStepDone` `done:false`) — trả
việc về người đang giữ nó mà không kiểm. Luật quyết hướng: `docs/vong-doi.md` «mở lại không được lách bước
duyệt»; bước duyệt là điều kiện của `kiemNguoiNhanViec` (thành viên, vai `docDuocDoiTac`). «Không nhận được việc»
dưới đây nghĩa đúng là trượt điều kiện đó: vai «chỉ OKR», hoặc không còn hàng `member`.

Source input: hàng DA0b · Ngoài-4 của `_acceptance/va-lo-ro-vai-chi-okr/review-findings.md` · `docs/vong-doi.md` ·
`CONTEXT.md` mục «Người cầm trịch», «Người được giao» · design doc.

## Criteria

- AC-1: Given một kế hoạch do người A (vai `member`) cầm trịch có ba bước — bước 1 chưa xong giao cho A, bước 2 chưa xong giao cho người M vai `member`, bước 3 đã xong do A làm — M theo dõi kế hoạch, rồi kế hoạch được đóng và quản trị đổi A sang vai `okr` qua `workspace.setMemberRole` (thành công: kế hoạch đã đóng không tính là việc đang giữ), When người Q vai `member` gọi `onboarding.reopenPlan`, Then kế hoạch mở, `ownerId` là Q, bước 1 chưa giao, bước 2 vẫn của M, bước 3 vẫn của A và vẫn xong, lượt theo dõi của M còn nguyên; và lịch sử kế hoạch có thêm đúng ba vết (so như tập, không theo thứ tự): mở lại, đổi cầm trịch từ A sang Q, giao bước 1 từ A sang «chưa giao». Given kế hoạch do M cầm trịch có một bước chưa xong giao cho A và A theo dõi kế hoạch, đóng kế hoạch, rồi vai của A đặt thẳng thành `okr` (dữ liệu cũ trước DA0a, lượt theo dõi còn sót), When Q mở lại, Then `ownerId` vẫn là M, bước đó chưa giao, A không còn lượt theo dõi kế hoạch này, và vết mới đúng là tập {mở lại, giao bước từ A sang «chưa giao»}.
- AC-2: Given một kế hoạch đã đóng mà người cầm trịch, người được giao các bước và người theo dõi đều vai `member`, When gọi `onboarding.reopenPlan`, Then chỉ `closedAt` đổi về trống, mọi người giữ nguyên, và lịch sử có thêm đúng một vết mở lại; When gọi `reopenPlan` lần nữa trên kế hoạch đã mở, Then không có vết mới.
- AC-3: Given một kế hoạch đã đóng mà người cầm trịch và người được giao một bước chưa xong đã rời workspace (gỡ qua `WorkspaceService.removeMember`), When người Q vai `member` mở lại, Then `ownerId` là Q và bước đó chưa giao, mỗi đổi người có một vết như AC-1.
- AC-4: Given kế hoạch đóng của AC-1 (người cầm trịch vai `okr`), When gọi `OnboardingGhi.datDong(id, false, X)` với X là người vai `okr` hoặc người không có hàng `member`, Then thủ tục trả 400 với lời của `kiemNguoiNhanViec` cho X (`vaiChiOkr` hoặc `khongPhaiThanhVien`), kế hoạch vẫn đóng, người cầm trịch, người được giao, lượt theo dõi và số vết đều không đổi.
- AC-5: Given một kế hoạch đang chạy do M vai `member` cầm trịch, có một bước đã xong do A làm và một bước đã xong do M làm, rồi quản trị đổi A sang vai `okr` qua `workspace.setMemberRole` (thành công: A không giữ việc mở), When người Q gọi `onboarding.setStepDone` `done:false` cho bước của A, Then bước mở lại (`completedAt` trống) và chưa giao, lịch sử có thêm đúng hai vết (so như tập): bỏ xong, giao từ A sang «chưa giao»; When gọi cho bước của M, Then bước mở lại, vẫn của M, và chỉ có thêm vết bỏ xong. Cùng khuôn với A được gỡ qua `WorkspaceService.removeMember` thay cho đổi vai thì bước của A cũng thành chưa giao.
- AC-6: Given người giữ việc vai `member`, When bỏ «xong» một bước rồi đánh dấu xong lại, đóng rồi mở lại kế hoạch, Then hành vi và vết trùng với trước vòng này (đối chứng: phần sửa chỉ chạm người không nhận được việc).
- AC-7: Given sau từng thao tác của AC-1, AC-3 và AC-5 trên kho thử, When chạy `rang/ro-vai-chi-okr.mjs --trong <mã những người vai okr của ca>` với `DATABASE_URL` của kho đó, Then thoát 0 (không bước mở, kế hoạch mở hay lượt theo dõi kế hoạch mở nào thuộc họ); và Given cùng khuôn AC-1 nhưng đặt `closedAt` về trống bằng lệnh ghi trực tiếp (đường cũ không kiểm), When chạy cùng thước, Then thoát 1 — thước đỏ được trên đúng vật.
- AC-8: Given sáu bản sao phá vật thật — (a) bỏ đổi người cầm trịch khi mở lại, (b) bỏ gỡ người được giao bước chưa xong khi mở lại, (c) bỏ gỡ lượt theo dõi khi mở lại, (d) bỏ gỡ người được giao khi bỏ «xong», (e) cho hàm đọc người nhận coi mọi thành viên là nhận được việc, (f) chỉ gỡ người được giao và lượt theo dõi khi có đổi người cầm trịch — When chạy phép đo tương ứng trên bản sao, Then mỗi phép đo xanh trước khi phá và đỏ sau khi phá với đúng thông điệp ghim của nó, và tệp thật không đổi.
- AC-9 (judgment): Given `docs/api.md` sau vòng này, When người mới đọc mục kế hoạch 30 ngày, Then họ biết: mở lại kế hoạch và bỏ «xong» một bước đi qua cùng điều kiện nhận việc với giao bước; ai không nhận được việc thì mất bước chưa xong (thành chưa giao) và lượt theo dõi, và người cầm trịch bị thay bằng người bấm mở lại; người bấm cũng không nhận được việc thì mở lại bị từ chối.

## Coverage

Quét bằng `morphological-scan` (`coverage-scan.md`). Trục: đường làm việc mở lại (mở lại kế hoạch · bỏ «xong»
bước · Zalo «xong n») × vật trả về tay người (người cầm trịch · bước chưa xong · bước đã xong · lượt theo dõi) ×
người giữ vật (đọc được · «chỉ OKR» · không còn thành viên · người bấm cũng không nhận được việc). Thước CE: grep mọi
lệnh ghi `closedAt`/`completedAt` về null trong `apps/api/src`, `apps/agent/agent`, `packages/db/src` ra đúng hai chỗ
[SUY-TỪ-REPO: apps/api/src/onboarding/onboarding-ghi.ts, packages/db/src/onboarding-buoc.ts]; bên gọi thứ hai của
`datBuocXong` là tin Zalo, luôn `done: true` [SUY-TỪ-REPO: apps/agent/agent/lib/tra-loi-nhac.ts]; vật mở theo
thước đếm của DA0a [SUY-TỪ-REPO: _acceptance/va-lo-ro-vai-chi-okr/rang/ro-vai-chi-okr.mjs]. Chân ngành: OWASP ASVS
4.0 V4 và NIST SP 800-53 AC-2/AC-6 [NGÀNH: OWASP ASVS V4, NIST SP 800-53]. Core → AC-1…AC-5; AC-6 đối chứng;
AC-7 là đường đo; AC-8 giữ phép đo thật.

## Đường đo

- Mở lại kế hoạch hay bỏ «xong» một bước của người vai «chỉ OKR» không tạo việc đang mở nào cho họ, trên bộ dữ liệu
  mẫu: số từ `rang/ro-vai-chi-okr.mjs --trong <ca>` (thước của DA0a, chỉ đọc) chạy trên kho thử dựng qua
  `OnboardingService`/`OnboardingGhi`/`WorkspaceService` thật — thoát 0 · AC-7 bảo đảm thước đo đúng vật,
  AC-1…AC-5 bảo đảm không sinh việc mở.

## Out of scope

- Báo trên màn sau khi mở lại rằng người cầm trịch hay người được giao đã đổi — hôm nay chỉ có vết trong lịch sử.
- Hộp thoại chọn người cầm trịch khi mở lại (lối khác của Hỏi-1).
- Tin Zalo «xong n» — chỉ đánh dấu xong, không mở lại gì.
- Gom ba bản luật vai về một (Ngoài-2 của DA0a).

## Notes

- Luật 14 của đợt (`docs/vong-doi.md`): vòng này không thêm loại bản ghi hay trạng thái kết thúc mới; nó sửa đường
  **mở lại** của một kết cục có sẵn («Đóng · Mở lại» của kế hoạch 30 ngày). Ba câu: (1) dọn bằng kết cục nghiệp vụ
  Đóng, không đổi; (2) «lịch sử» không đổi; (3) danh sách mặc định không đổi. Phần áp vào vòng này là vế «mở lại
  không được lách bước duyệt».
- Không ui-check, không design-pass: không màn nào đổi (sổ, `descope`).
