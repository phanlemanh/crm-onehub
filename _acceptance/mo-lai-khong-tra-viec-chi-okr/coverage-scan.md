# Quét độ phủ — mo-lai-khong-tra-viec-chi-okr

Preset: `entity-feature` (thực thể: kế hoạch 30 ngày và bước của nó), trộn `risk-premortem` cho trục người giữ việc.

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub — chân sản phẩm: đào repo (`CONTEXT.md` mục «Người cầm trịch», «Người được giao»,
  «Chuyển việc 30 ngày»; `docs/vong-doi.md` mục «Ba cách dọn»; hồ sơ DA0a `_acceptance/va-lo-ro-vai-chi-okr/`)
  · chân ngành: OWASP ASVS 4.0 V4 (kiểm quyền ở tầng dịch vụ tin cậy, mọi đường ghi), NIST SP 800-53 AC-2/AC-6
  (đổi vai phải xét lại quyền đang giữ; đặc quyền tối thiểu) — cùng chân ngành hồ sơ DA0a đã dùng.

## Trục

- Trục A — đường làm việc mở lại: mở lại kế hoạch (`reopenPlan` → `datDong(false)`) | bỏ «xong» một bước qua màn
  hay REST (`setStepDone` `done:false` → `datBuocXong`) | đánh dấu xong qua tin Zalo «xong n» (`datBuocXong`
  `done:true` cố định) [thước CE: grep mọi lệnh ghi `closedAt`/`completedAt` về null trong `apps/api/src`,
  `apps/agent/agent`, `packages/db/src` — ra đúng hai chỗ, `apps/api/src/onboarding/onboarding-ghi.ts:425` và
  `packages/db/src/onboarding-buoc.ts:66`; chỗ sau có hai bên gọi, `onboarding-ghi.ts` (`done` theo người dùng) và
  `apps/agent/agent/lib/tra-loi-nhac.ts` (`done: true`) — SUY-TỪ-REPO]
- Trục B — vật trả về tay người: người cầm trịch kế hoạch (bắt buộc, `ownerId` không null) | người được giao bước
  chưa xong (có thể null) | người được giao bước đã xong (lịch sử) | lượt theo dõi kế hoạch [thước CE:
  `packages/db/prisma/schema.prisma` model `OnboardingPlan`, `OnboardingStep`, `OnboardingWatch`; thước đếm
  `rang/ro-vai-chi-okr.mjs` của DA0a đếm đúng ba vật mở `buocMo`, `keHoachMo`, `theoDoiMo` — SUY-TỪ-REPO]
- Trục C — người giữ vật lúc mở lại: thành viên đọc được dữ liệu đối tác | thành viên vai «chỉ OKR» | người không
  còn là thành viên | người bấm mở lại tự mang vai «chỉ OKR» hay không là thành viên (gọi thẳng dịch vụ, đi vòng
  middleware) [thước CE: điều kiện của `kiemNguoiNhanViec` ở `apps/api/src/onboarding/onboarding-ghi.ts` — thành
  viên `WORKSPACE_ID` và `docDuocDoiTac(role)`; NGÀNH: NIST SP 800-53 AC-6]

## Không gian (A × B × C, ô có nghĩa)

| A | B | C | Có nghĩa? |
| --- | --- | --- | --- |
| mở lại kế hoạch | người cầm trịch | đọc được | có — không đổi gì (đối chứng) |
| mở lại kế hoạch | người cầm trịch | chỉ OKR | có — lỗ chính |
| mở lại kế hoạch | người cầm trịch | không còn thành viên | có — cùng điều kiện nhận việc |
| mở lại kế hoạch | bước chưa xong | đọc được | có — giữ nguyên (đối chứng) |
| mở lại kế hoạch | bước chưa xong | chỉ OKR | có — lỗ chính |
| mở lại kế hoạch | bước chưa xong | không còn thành viên | có |
| mở lại kế hoạch | bước đã xong | chỉ OKR | có — giữ nguyên, đó là lịch sử, không phải việc mở |
| mở lại kế hoạch | lượt theo dõi | chỉ OKR | có — lượt theo dõi mở lại thành nhắc mốc ngày |
| mở lại kế hoạch | lượt theo dõi | đọc được | có — giữ nguyên (đối chứng) |
| mở lại kế hoạch | người cầm trịch | người bấm cũng không nhận được việc | có — không được tạo chủ mới không hợp lệ |
| bỏ «xong» bước | bước | chỉ OKR | có — lỗ chính |
| bỏ «xong» bước | bước | không còn thành viên | có |
| bỏ «xong» bước | bước | đọc được | có — giữ nguyên (đối chứng) |
| bỏ «xong» bước | người cầm trịch | — | gạch — bỏ xong một bước không đổi người cầm trịch |
| bỏ «xong» bước | lượt theo dõi | — | gạch — không chạm lượt theo dõi |
| Zalo «xong n» | mọi vật | mọi người | gạch — chỉ đánh dấu xong, không mở lại gì |

## Core

1. Mở lại kế hoạch có người cầm trịch không nhận được việc → người bấm mở lại cầm trịch, có vết — lỗ chính, lối
   máy khuyên (Hỏi-1 ở Cổng Phạm vi).
2. Mở lại kế hoạch → bước chưa xong của người không nhận được việc thành chưa giao, có vết — lỗ chính.
3. Mở lại kế hoạch → lượt theo dõi của người không nhận được việc bị gỡ.
4. Bỏ «xong» bước của người không nhận được việc → bước mở lại ở dạng chưa giao, có vết — lỗ chính.
5. Người bấm mở lại cũng không nhận được việc → từ chối, kế hoạch vẫn đóng.
6. Đối chứng: người đọc được giữ nguyên mọi thứ; bước đã xong giữ người làm.

## Later

- Báo trên màn sau khi mở lại rằng người cầm trịch hay người được giao đã đổi — hôm nay chỉ có vết trong lịch sử
  kế hoạch.
- Cho người mở lại chọn người cầm trịch trong hộp thoại Mở lại — lối khác của Hỏi-1.

## Never

- Zalo «xong n» — chỉ đặt xong, không có đường bỏ xong; không mở lại gì.
- Chặn hẳn việc mở lại khi người cầm trịch không nhận được việc — kế hoạch đã đóng không sửa được trước khi mở lại
  (`ONBOARDING.thongDiep.keHoachDaDong`), nên chặn là ngõ cụt: không còn đường nào đổi người cầm trịch.
- Tự giao bước mở lại cho người cầm trịch — giao là việc người làm có chủ ý (`CONTEXT.md` «Người được giao»: một
  bước có thể chưa giao cho ai); bộ nhắc đã gợi người cầm trịch «Giao bước …» khi có bước chưa giao.

## Cross-cutting áp mọi ô Core

- Một điều kiện «nhận được việc» duy nhất, chung với `kiemNguoiNhanViec` — không thêm bản thứ tư của luật vai
  (Ngoài-2 của DA0a).
- Mọi đổi người ghi vết bằng khuôn vết có sẵn (`keHoachDoiCamTrich`, `buocGiao`), trong cùng giao dịch với lần mở lại.
- Thước đếm `rang/ro-vai-chi-okr.mjs` với `--trong` về 0 cho người trong ca sau mỗi lần mở lại.
