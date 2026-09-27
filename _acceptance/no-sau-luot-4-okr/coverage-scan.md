## Ngữ cảnh

- Sản phẩm: CRM OneHub, khu OKR — chân sản phẩm: đào repo (`apps/agent/agent/schedules/dispatch.ts`, `apps/agent/agent/lib/nhac-ke-hoach.ts`, `packages/db/src/okr-nhac.ts`, `packages/db/src/onboarding-nhac.ts`, `apps/api/src/okr/okr-access.service.ts`, `okr-cap-nhat.service.ts`, sổ Gate 2 lượt 4) · chân ngành: Jira «Email Notifications Digest» (Atlassian Marketplace — gom cập nhật và gửi một bản theo lịch; không có cập nhật thì không gửi) và Asana «Daily Summary» (gom thông báo trong ngày thành một bản tóm tắt), tra web 27/09.

## Trục

- A — giờ sự kiện so với mốc nhắc 08:30: trước mốc cùng ngày | đúng mốc | ngay sau mốc | sau mốc hôm trước | cũ hơn một mốc [CE: SUY-TỪ-REPO `dispatch.ts` (nhịp mỗi phút), `NHAC.gio` + NGÀNH Jira digest: mỗi cập nhật vào đúng một bản gom]
- B — trạng thái người nhận ngày D: chưa có tin sáng, không việc khác | đã có tin sáng | hàng tạo sáng, gửi muộn [CE: SUY-TỪ-REPO khoá `user:<id>:<ngày>` + `chayNhac` tính lại lúc gửi]
- C — nơi đọc việc: tin buổi sáng | thẻ «Việc của bạn» | Tổng quan kế hoạch [CE: SUY-TỪ-REPO bốn chỗ gọi `viecCanNhac`]
- D — loại mục nhắc OKR: cập nhật tuần | KR im | được giao | nhắc tên | đang theo dõi [CE: SUY-TỪ-REPO `LOAI_NHAC_OKR`]
- E — người × cấp KR cho quyền cập nhật: chủ | trưởng phòng ban | trưởng bộ phận | quản trị | người khác × phòng ban | bộ phận | cá nhân [CE: SUY-TỪ-REPO `suaDuocDonVi`]

Ba mục nhỏ (Ngoài-3 KR trùng, Ngoài-4 vết hỏng, câu chào theo giờ) là một chiều mỗi mục — quét bằng ma trận trong eval, không dựng trục.

## Không gian

- A × B × C: 5 × 3 × 3 = 45 ô. Gạch: C ∈ {thẻ, Tổng quan} × B (không có khái niệm «tin sáng» ở màn sống) → còn A × B cho tin (15) + A cho thẻ (5).
- A «cũ hơn một mốc» × mọi B: hành vi cũ đã đúng (sự kiện quá 24 giờ không vào tin) — đi chung ô biên của AC-4.
- D × {sinh, mã payload, tin Slack, tin Zalo, API}: 25 ô.
- E: 15 ô.

## Core

1. A «ngay sau mốc» × B «chưa có tin» × C tin → AC-1 (lỗi gốc: tin giữa ngày).
2. Cùng ô, ngày D+1 và D+2 → AC-2 (một lần, không lặp).
3. A «ngay sau mốc» × B «đã có tin» → AC-3.
4. A {trước mốc, đúng mốc, ngay sau mốc, sau mốc hôm trước} → AC-4 (biên cửa sổ).
5. B «gửi muộn» → AC-5.
6. Giờ dựng tin trước/sau 12:00 → AC-6.
7. C thẻ × A «ngay sau mốc» → AC-7 (không hồi quy màn sống).
8. Ngoài-2 → AC-8 (sheet), E → AC-9 (máy chủ một luật).
9. Ngoài-3 → AC-10. Ngoài-4 → AC-11.
10. D × mọi chặng → AC-12; loại lạ → AC-13; một khuôn → AC-14.

## Later

- Hàng nhắc tồn qua đêm (B «gửi sang ngày sau»).
- Sổ «đã gửi» từng sự kiện — chỉ cần nếu có lịch nhắc thứ hai trong ngày.

## Never

- Đóng cửa tạo tin sau 12:00 — hoãn cảnh báo AI của 9a sang hôm sau, người có máy chậm mất tin cả ngày.
- `canCapNhatKr` trường mới — luôn bằng `canEditKr`.

## Cross-cutting

- Không hằng rời mới: mốc trưa vào `NHAC`.
- Mọi lỗi mới có câu nêu tên vật hỏng (mã dòng vết, tên loại).
- Chữ người nhập (tiêu đề KR, tên người) trong tin không đổi cách thoát ký tự.
