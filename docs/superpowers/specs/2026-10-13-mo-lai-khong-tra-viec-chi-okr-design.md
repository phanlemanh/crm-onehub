# Mở lại không trả việc cho người «chỉ OKR» — thiết kế

Hàng DA0b của `docs/plan/lo-trinh-viec-du-an.json`, dãy P0 của đợt r2. Nguồn: Ngoài-4 của hồ sơ DA0a
(`_acceptance/va-lo-ro-vai-chi-okr/`), chủ kho tách thành việc riêng ở Cổng Bằng chứng 12/10.

## Vấn đề

DA0a chặn mọi đường **giao** việc kế hoạch 30 ngày cho người không đọc được dữ liệu đối tác, và chặn đổi vai sang
«chỉ OKR» khi người đó còn giữ việc mở. Nhưng điều kiện «còn giữ việc mở» chỉ đếm kế hoạch đang chạy và bước chưa
xong (`dieuKienChuyen`). Hai đường biến việc đã khép thành việc mở mà không đi qua kiểm nào:

1. **Mở lại kế hoạch** (`onboarding.reopenPlan` → `OnboardingGhi.datDong(id, false)`) chỉ đặt `closedAt = null`.
   Người cầm trịch, người được giao các bước chưa xong và người theo dõi của kế hoạch lúc đóng đều nhận lại việc,
   kể cả khi họ đã sang vai «chỉ OKR» trong lúc kế hoạch đóng.
2. **Bỏ «xong» một bước** (`onboarding.setStepDone` `done:false` → `datBuocXong`) chỉ đặt `completedAt = null`.
   Người được giao lúc xong nhận lại bước, kể cả khi họ đã sang vai «chỉ OKR».

Hệ quả: bước hay kế hoạch nằm trong tay người không nhận nhắc việc kế hoạch (bộ gom nhắc lọc vai từ DA0a), việc trễ
mà không ai được báo, và thước `rang/ro-vai-chi-okr.mjs` của DA0a lại khác 0.

Thước CE của «hai đường»: cả kho chỉ có hai lệnh ghi đưa `closedAt`/`completedAt` về null —
`apps/api/src/onboarding/onboarding-ghi.ts` (`datDong`) và `packages/db/src/onboarding-buoc.ts` (`datBuocXong`).
Bên gọi thứ hai của `datBuocXong` là tin Zalo «xong n» (`apps/agent/agent/lib/tra-loi-nhac.ts`), luôn `done: true`
— không mở lại gì. Quét đủ ở `_acceptance/mo-lai-khong-tra-viec-chi-okr/coverage-scan.md`.

## Luật quyết hướng

`docs/vong-doi.md`, mục «Ba cách dọn», hàng «Kết cục nghiệp vụ»: «Mở lại được khi nghiệp vụ cho phép, và mở lại
không được lách bước duyệt.» Bước duyệt ở đây là điều kiện nhận việc của `kiemNguoiNhanViec`: người nhận phải là
thành viên và mang vai đọc được dữ liệu đối tác. Mở lại là trao lại việc, nên nó đi qua đúng điều kiện đó — không
bản luật thứ tư (Ngoài-2 của DA0a đã đếm ba bản).

## Cách làm

Một hàm đọc chung trong `onboarding-ghi.ts`: `docNguoiNhan(tx, userIds)` trả, với mỗi mã, tên và việc người đó
có nhận được việc không (là thành viên `WORKSPACE_ID` và `docDuocDoiTac(role)`). `kiemNguoiNhanViec` dựng trên
nó, giữ nguyên lời từ chối.

### Mở lại kế hoạch (`datDong` với `dong = false`)

Trong cùng giao dịch, sau khi đặt `closedAt = null` và ghi vết `keHoachMoLai`:

- Người cầm trịch không nhận được việc → người bấm mở lại thành người cầm trịch, qua `kiemNguoiNhanViec(người bấm)`
  (người bấm cũng không nhận được việc thì 400, cả giao dịch lùi, kế hoạch vẫn đóng). Ghi vết `keHoachDoiCamTrich`
  từ người cũ sang người bấm. Đây là lối máy khuyên của **Hỏi-1** (xem dưới).
- Mỗi bước chưa xong mà người được giao không nhận được việc → `assigneeId = null`, ghi vết `buocGiao` từ người đó
  sang «chưa giao». Bước đã xong giữ người làm: đó là lịch sử, không phải việc mở.
- Mọi lượt theo dõi kế hoạch này của người không nhận được việc bị gỡ (không vết, như DA0a gỡ khi đổi vai).
- Người cầm trịch và người được giao vẫn nhận được việc → không đổi gì ngoài `closedAt` và vết `keHoachMoLai`, như
  hôm nay.

Đóng kế hoạch không đổi.

### Bỏ «xong» một bước (`setStepDone` với `done = false`)

`datBuocXong` giữ nguyên (agent dùng chung, chỉ `done: true`). Ở `OnboardingGhi.setStepDone`, khi kết quả là
`da-doi`, `done = false` và bước có người được giao: người đó không nhận được việc → `assigneeId = null` và ghi vết
`buocGiao` sang «chưa giao», trong cùng giao dịch, sau vết `buocBoXong`. Người nhận được việc → như hôm nay.

### Vì sao bước về «chưa giao», không tự giao cho ai

`CONTEXT.md`, mục «Người được giao»: «một bước có thể chưa giao cho ai». Bộ nhắc gợi người cầm trịch «Giao bước «…»»
khi kế hoạch có bước chưa giao (`goiYIm`, `packages/db/src/onboarding-nhac.ts`). Giao là việc người làm có chủ ý;
máy chọn hộ một người là lách đúng bước đó.

### Vì sao không chặn mở lại

Kế hoạch đã đóng không sửa được trước khi mở lại (`ONBOARDING.thongDiep.keHoachDaDong`: «mở lại trước khi sửa»),
và chuyển việc 30 ngày chỉ đếm kế hoạch đang chạy. Chặn mở lại khi người cầm trịch không nhận được việc là ngõ cụt:
không còn đường nào đổi người cầm trịch của một kế hoạch đã đóng.

## Hỏi-1 — ai cầm trịch kế hoạch sau khi mở lại

Người cầm trịch là bắt buộc (`ownerId` không null) và chỉ một người (`CONTEXT.md` «Người cầm trịch»).

- **Máy khuyên:** người bấm Mở lại thành người cầm trịch. Không đổi giao diện; vết «đổi cầm trịch» hiện trong lịch
  sử kế hoạch; người đó đổi lại được ngay bằng ô người cầm trịch có sẵn.
- **Lối khác:** hộp thoại Mở lại bắt chọn người cầm trịch khi người cũ không nhận được việc. Đúng hơn khi người
  bấm không phải người sẽ điều phối, nhưng thêm một màn chọn người (design-pass, ô chọn mới, bài kiểm giao diện) —
  chậm vòng khoảng nửa ngày.

Đã gửi giám sát yêu cầu `P0-1` (`can-nguoi`). Hợp đồng soạn theo lối máy khuyên.

## Đặc tả UX

Không có. Vòng này không đổi màn nào: app đã làm mới chi tiết kế hoạch sau cả hai thao tác (`cache.plan(planId)` ở
`plan-sheet.tsx` và `plan-steps.tsx`; ba khoá truy vấn ở `dong-mo-ke-hoach.tsx`), nên người cầm trịch mới và bước
«chưa giao» hiện ra mà không sửa gì phía khách. Báo trên màn ai vừa thay ai là việc để sau (sổ, `descope`).

## Đường đo

Thước `rang/ro-vai-chi-okr.mjs` của DA0a, chạy `--trong <người trong ca>` trên kho thử sau khi mở lại hay bỏ
«xong» qua đường ghi thật: thoát 0 nghĩa là người vai «chỉ OKR» trong ca không còn bước mở, kế hoạch mở hay lượt
theo dõi kế hoạch mở nào. Dữ liệu mẫu dựng qua `OnboardingService`/`OnboardingGhi` thật, vai «chỉ OKR» đặt sau khi
giao (trạng thái mà DA0a để lại cho dữ liệu cũ). Đo trên production là việc sau gộp, cần chủ kho cho phép riêng.

## Ngoài phạm vi

- Báo trên màn sau khi mở lại rằng người cầm trịch hay người được giao đã đổi.
- Hộp thoại chọn người cầm trịch khi mở lại (lối khác của Hỏi-1).
- Tin Zalo «xong n» — chỉ đánh dấu xong.
- Gom ba bản luật vai (Ngoài-2 của DA0a).
