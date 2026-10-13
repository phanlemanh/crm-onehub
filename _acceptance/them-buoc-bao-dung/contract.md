---
schema_version: 1
feature: "Thêm bước ở kế hoạch báo đúng: danh sách bộ phận không tải được thì nói lý do; số việc quá hạn đếm theo một ngày; bộ phận không có thật trả cùng một lỗi như mọi chỗ khác"
slug: them-buoc-bao-dung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-13T00:47:59Z
design_doc: docs/superpowers/specs/2026-10-13-them-buoc-bao-dung-design.md
---

# Acceptance Contract: them-buoc-bao-dung

## Context

Ba lỗi hành vi E6 (#360) để lại ở review vòng 1 (`_acceptance/dieu-phoi-va/review-findings.md`): `addStep` trả lỗi khác
mọi đường khác khi phòng ban không có thật; danh sách phòng ban tải lỗi thì form thêm bước im lặng; dòng «và N việc quá
hạn nữa» ở Tổng quan trừ số dòng quá hạn tính theo ngày của trình duyệt, trong khi máy chủ đếm theo ngày Việt Nam. Chữ trên
màn dùng «phòng ban» (`CONTEXT.md`); câu giao viết «bộ phận» theo chữ cũ.

Source input: `_acceptance/them-buoc-bao-dung/opportunity.md` (Cổng Đáng `build` 2026-10-12T23:58:15Z, hàng E6b của
`docs/plan/lo-trinh-okr.json`); `docs/superpowers/specs/2026-10-13-them-buoc-bao-dung-design.md`.

## Criteria

- AC-1: Given một mã phòng ban không có trong bảng phòng ban, When gọi `onboarding.addStep` với mã đó, và gọi tạo khuôn (`createTemplate`), sửa khuôn (`updateTemplate`) với một bước mang mã đó, Then cả ba trả `NOT_FOUND` với đúng một câu «Không có phòng ban nào mang mã <mã>.» — bằng từng ký tự câu mà `org.*` trả cho cùng mã (`TO_CHUC.thongDiep.khongCoPhongBan`) — và không ghi bước hay khuôn nào.
- AC-2: Given một phòng ban đã lưu trữ, When gọi `onboarding.addStep`, `createTemplate` và `updateTemplate` với phòng ban đó, Then cả ba trả `BAD_REQUEST` với cùng một câu nêu tên phòng ban (`ONBOARDING.thongDiep.boPhanDaLuuTru`), không ghi gì; với phòng ban đang dùng thì cả ba ghi được (đối chứng).
- AC-3: Given bản ghi một kế hoạch mở chưa có bước và `onboarding.listDepartments` trả lỗi, When người dùng bấm «Thêm bước», Then form hiện vùng lỗi «Không tải được danh sách phòng ban» kèm câu «Kiểm tra kết nối rồi thử lại.» và nút thử lại ở chỗ ô chọn phòng ban, không có ô chọn trống, nút «Thêm» khoá.
- AC-4: Given form ở AC-3 đang hiện vùng lỗi, When người dùng bấm thử lại và lần tải sau thành công, Then vùng lỗi biến mất, ô chọn liệt đủ phòng ban vừa tải, chọn một phòng ban rồi gõ tên thì «Thêm» mở khoá và lưu gửi đúng phòng ban đã chọn.
- AC-5: Given bản ghi một kế hoạch mở đã có bước ở phòng ban A và `onboarding.listDepartments` trả lỗi, When mở bản ghi, Then nút «Thêm bước ở phòng ban khác» vẫn hiện và mở ra cùng vùng lỗi của AC-3; form «Thêm bước» trong nhóm A vẫn lưu được bước vào A.
- AC-6: Given trình duyệt ở múi giờ lùi so với Việt Nam (America/Los_Angeles) vào lúc đã sang ngày D+1 giờ Việt Nam nhưng còn ngày D giờ địa phương, và «Bước của tôi» có một bước hạn D (quá hạn theo máy chủ, `quaHan.buoc` đã đếm nó), When mở Tổng quan, Then dòng bước đó mang dấu quá hạn và thẻ không có dòng «và … nữa» cho nó (N = tổng máy chủ trừ số dòng quá hạn theo ngày Việt Nam đang hiện).
- AC-7: Given trình duyệt ở múi giờ tiến so với Việt Nam (Pacific/Kiritimati) vào lúc đã sang ngày D+1 giờ địa phương nhưng còn ngày D giờ Việt Nam, và «Bước của tôi» có một bước hạn D (chưa quá hạn theo máy chủ) cùng một việc quá hạn nằm ngoài danh sách, When mở Tổng quan, Then dòng bước hạn D không mang dấu quá hạn và thẻ ghi «và 1 việc quá hạn nữa».
- AC-8: (kiểm không hồi quy) Given các bài kiểm sẵn có của ba vùng (`apps/app/test/dieu-phoi-va.dom.tsx`, `han-viec.dom.tsx`, `moi-phia-ke-hoach.dom.tsx`, `may-nhac.dom.tsx`, `ke-hoach-sheet.dom.tsx`, `apps/api/test/dieu-phoi-va.spec.ts`), When chạy lại ở múi giờ Việt Nam, Then thoát 0 mà không khẳng định `expect(` nào bị xoá hay sửa so với mốc `3a2783409`, trừ đúng một khẳng định có tên: `expect(khongCo.getStatus()).toBe(400)` của ca mã lạ trong `bo-phan-hong` (thay bởi AC-1, chờ anh ở Hỏi-1); không ca nào trong sáu tệp thêm `.skip`, `.todo` hay `.only`; phần còn lại của khối `bo-phan-hong` giữ nguyên từng dòng; `bun run check-types` thoát 0.
- AC-9: (cross-layer) Given người dùng được giao một bước hạn hôm qua và một bước hạn hôm nay theo giờ Việt Nam trong kế hoạch mở, When `dashboard.summary` thật trả về ở hai thời điểm (ngay sau và ngay trước nửa đêm Việt Nam) và Tổng quan đọc đúng đầu ra đó ở múi giờ lùi (America/Los_Angeles) và tiến (Pacific/Kiritimati), Then số bước của «Bước của tôi» mà Tổng quan coi là quá hạn bằng `quaHan.buoc` máy chủ đếm, ở cả bốn tổ hợp.

## Coverage

Quét hình thái preset test-matrix, đầy đủ ở design doc mục «Độ phủ». Thước CE: ba mục r1 của
`_acceptance/dieu-phoi-va/review-findings.md` (lịch sử lỗi của khu) và `docs/api.md` mục cây tổ chức.

- Trục A — đường ghi nhận mã phòng ban: `addStep` | tạo khuôn | sửa khuôn | khôi phục khuôn | tạo kế hoạch từ khuôn | `org.*` [thước CE: `onboarding.service.ts`, `to-chuc.service.ts`]
- Trục B — tình trạng mã: đang dùng | không có thật | đã lưu trữ
- Trục C — chỗ mở form thêm bước: kế hoạch rỗng | «ở phòng ban khác» | trong nhóm có sẵn [thước CE: `plan-steps.tsx`]
- Trục D — trạng thái danh sách phòng ban: đang tải | lỗi | rỗng | có
- Trục E — múi giờ trình duyệt so với VN quanh nửa đêm VN: bằng | lùi | tiến
- Core → AC: A{addStep, tạo, sửa khuôn}×B{không có thật} (AC-1) · A{addStep, tạo, sửa khuôn}×B{lưu trữ, đang dùng} (AC-2) · C{rỗng}×D{lỗi} (AC-3) · C{rỗng}×D{lỗi→có} (AC-4) · C{khác, nhóm}×D{lỗi} (AC-5) · E{lùi} (AC-6) · E{tiến} (AC-7) · E{lùi, tiến} trên dữ liệu máy chủ thật (AC-9) · E{bằng} và không hồi quy (AC-8).
- Later: D{đang tải} và D{rỗng} của form thêm bước; `aria-live` cho `VungTaiLoi`.
- Never: ngày theo múi giờ riêng của từng người; API tự tạo phòng ban khi mã lạ; A{khôi phục khuôn, tạo kế hoạch từ khuôn}×B{không có thật} — hai đường không nhận mã từ người gọi mà đọc mã đã lưu trong khuôn, và `org.*` từ chối xoá hẳn phòng ban khi còn khuôn giữ nó (`docs/api.md` mục cây tổ chức), nên mã của khuôn không thể mất.
- Never (ô ngành đã cắt): `[NGÀNH: Salesforce SOQL — biên của date literal theo locale người chạy, không có thì theo locale tổ chức]` — kho đã định nghĩa quá hạn theo đầu ngày giờ Việt Nam cho mọi người (AC-7 của `dieu-phoi-va`, `demQuaHan`), một tổ chức một ngày.

## Đường đo

- bỏ đường-đo — `opportunity.md` không khai ngưỡng nào; vòng sửa ba lỗi đã có tên, không có số để Cổng Giá trị đọc (entry descope «bỏ đường-đo»)

## Out of scope

- Ô chọn phòng ban trong lúc danh sách đang tải, và form khi chưa có phòng ban nào (trục D{đang tải, rỗng}).
- Thêm `aria-live` cho `VungTaiLoi` — thành phần dùng chung của `packages/ui`, sửa ở vòng riêng.
- Máy chủ gửi cờ quá hạn cho từng bước trong `dashboard.summary` — hợp đồng dữ liệu giữ nguyên.
- Năm mục Ngoài-n còn lại của `dieu-phoi-va` (bài kiểm của tác nhân, `rang/man.mjs`, khoá mã đối tác hai nơi).

## Notes

- AC-1 thay vế «`departmentId` không có thật → `BAD_REQUEST`» của AC-6 trong hồ sơ đã ký `dieu-phoi-va` (ký 09/10;
  Cổng Đáng của vòng này ký 12/10). Vế đã lưu trữ của AC-6 đó giữ nguyên và chính là AC-2 ở đây.
- Hồ sơ `dieu-phoi-va` cũ theo `paths` (`onboarding-ghi.ts`, `plan-steps.tsx`, `dashboard-summary.tsx`) — ghim lại ở bước
  ghim lại của vòng.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-13:
  - Ngoài-2: Ảnh Tổng quan đưa người ký không còn chụp tới dòng bước đang đo; dấu quá hạn của dòng đó chỉ được thước kiểm trong trang.
  - Ngoài-3: Quy tắc «hôm nay là ngày nào theo giờ Việt Nam» viết ở hai nơi; sửa một nơi mà quên nơi kia thì số quá hạn trên màn và ở máy chủ lệch nhau.
  - Ngoài-5: Danh sách phòng ban đã tải mà lần làm mới ngầm lỗi thì nút «Thêm» vẫn bấm được và lưu vào phòng ban không còn hiện trên form.
  - Ngoài-6: Phép đo màn sau khi bấm thử lại không dùng việc tràn ngang và việc bị chặn để quyết đạt hay không.
  - Ngoài-7: Bài kiểm Tổng quan không phát hiện được mô tả thẻ ghi sai số việc quá hạn.
  - Ngoài-8: Trạng thái sau khi thử lại thành công không được kiểm tràn ngang trên khổ điện thoại.
