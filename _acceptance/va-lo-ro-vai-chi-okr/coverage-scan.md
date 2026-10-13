# Quét độ phủ — va-lo-ro-vai-chi-okr

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub — chân sản phẩm: đào repo (`CONTEXT.md` mục «Vai «chỉ OKR»», `docs/api.md`
  mục «tRPC is the data surface», `docs/agent.md` mục «Nhắc buổi sáng») · chân ngành: OWASP ASVS 4.0 V4
  Access Control (kiểm quyền ở tầng dịch vụ tin cậy, không dựa ô chọn ở màn), NIST SP 800-53 AC-2
  (đổi vai là sự kiện quản lý tài khoản, phải xét lại quyền đang giữ) và AC-6 (đặc quyền tối thiểu).

## Trục

- Đường vào — cách một người vai «chỉ OKR» đi tới chỗ giữ việc đối tác: giao bước | thêm bước có người làm
  | đổi người cầm trịch | tạo kế hoạch từ khuôn | chuyển việc 30 ngày | đổi vai người đang giữ việc | dữ liệu
  cũ trên production | tự theo dõi hay tự nhận. [thước CE: mọi chỗ ghi `assigneeId`, `ownerId`,
  `onboardingWatch` tìm bằng grep trong `apps/api/src`, `apps/agent/agent`, `packages/db/src` — SUY-TỪ-REPO:
  `apps/api/src/onboarding/onboarding-ghi.ts`, `onboarding.service.ts`, `onboarding-theo-doi.ts`,
  `apps/api/src/dashboard/dashboard.service.ts`, `apps/api/src/workspace/workspace.service.ts`]
- Vật: bước | kế hoạch (cầm trịch) | lượt theo dõi. [thước CE: ba bảng `onboardingStep`, `onboardingPlan`,
  `onboardingWatch` của `packages/db/prisma/schema.prisma`; `onboardingEnrollment` không gắn người]
- Kênh lộ tên đối tác: tin nhắc Zalo | tin nhắc Slack | thẻ «Việc của bạn» | Tổng quan | ô chọn người |
  trả lời «xong n» qua Zalo. [thước CE: mọi chỗ gọi `viecCanNhac` — `nhac-ke-hoach.ts`,
  `dashboard.service.ts`, `okr-trao-doi.service.ts` — và `tra-loi-nhac.ts`]

## Core

1. Giao bước, thêm bước × bước — đường ghi chỉ hỏi «là thành viên» → AC-1, AC-2.
2. Đổi cầm trịch, tạo từ khuôn × kế hoạch — tạo từ khuôn không kiểm gì → AC-2, AC-3.
3. Chuyển việc × bước + kế hoạch — đích không kiểm vai; chiều ngược là đường dọn → AC-4.
4. Đổi vai × bước + kế hoạch + theo dõi — NIST AC-2 → AC-5, AC-6.
5. Mọi vật × tin nhắc Zalo, Slack — bộ gom không lọc vai → AC-7, AC-8.
6. Ô chọn người — ASVS V4: ô chọn và lời từ chối không lệch → AC-9.
7. Dữ liệu cũ — đường đo chỉ đọc → AC-10; cách dọn chờ chủ kho.

## Later

- Chủ sở hữu deal, công ty, liên hệ là người vai «chỉ OKR» (cùng lớp, thực thể khác).
- `users.list` liệt kê người đã rời.
- Migration dọn dữ liệu cũ — chờ số đo production.

## Never

- Thẻ «Việc của bạn» — `okr.viecCuaToi` chỉ lấy mục OKR; bộ gom đã lọc ở Core 5.
- Tổng quan — router phạm vi đối tác, vai «chỉ OKR» bị chặn ở cửa.
- Trả lời «xong n» — `tra-loi-nhac.ts` đã từ chối vai `okr`.
- Tự theo dõi, tự nhận bước — router phạm vi đối tác.

## Cross-cutting áp mọi ô Core

- Một hàm `docDuocDoiTac` cho mọi chỗ; không so chuỗi `"okr"`.
- Từ chối trước mọi lệnh ghi: không bước, kế hoạch hay vết nào được ghi khi bị chặn.
