# Quét độ phủ — tin-hieu-tu-ve-kho (TH1)

## Ngữ cảnh

- Sản phẩm: CRM của OneHub — chân sản phẩm: đào repo (`docs/api.md` mục «Tín hiệu», `apps/api/src/tin-hieu/**`,
  `scripts/tin-hieu/keo-ve.ts`, `apps/app/app/(app)/[slug]/settings/api-keys/**`, `_acceptance/gui-tin-hieu-trong-crm/`)
  · chân ngành: [NGÀNH: Stripe restricted API keys] và [NGÀNH: GitHub fine-grained personal access tokens] (khoá
  hẹp quyền, chọn quyền lúc tạo, danh sách khoá ghi rõ phạm vi); [NGÀNH: Renovate] / [NGÀNH: Dependabot] (bot chạy
  theo lịch giữ MỘT PR đứng mở, tự dựng lại nhánh trên nhánh gốc mỗi lượt, không tự gộp mặc định).

## Trục

- Trục A — Vòng đời khoá chỉ-kéo: tạo | dùng đúng việc | dùng việc khác (thủ tục tRPC khác, trang web, cầu tác
  nhân, tạo khoá mới qua thư viện xác thực) | chủ khoá mất quyền quản trị hay rời | thu hồi | hết hạn
  [thước CE: luật phiên-từ-khoá của `@better-auth/api-key` 1.6.25 (`enableSessionForAPIKeys`, `configId`); bảng
  phạm vi router `docs/api.md`; [NGÀNH: Stripe restricted keys]]
- Trục B — Người tạo khoá: owner | admin | member | okr [thước CE: `WORKSPACE_ROLES`, `laQuanTriWorkspace`]
- Trục C — Một lượt chạy theo lịch: có tín hiệu mới | không có gì mới | thiếu bí mật | CRM từ chối khoá / không
  tới được | tệp lệch byte | nhánh hàng chờ đã có | PR hàng chờ đã gộp hay đóng | kho cấm tác vụ mở PR | chạy tay
  [thước CE: AC-8 của LT2; nếp [NGÀNH: Renovate] một PR đứng, dựng lại trên nhánh gốc]
- Trục D — Ai thấy gì: người gửi (chữ đổi) | quản trị (trang khoá API) | chủ kho (PR, lượt đỏ) | điều phối (gộp
  theo lô) [thước CE: câu giao của hàng TH1, luật cửa sổ gộp #375]

## Core

1. A·tạo × B·owner/admin — quản trị tạo khoá chỉ-kéo ở Cài đặt → Khoá API; trang nói rõ khoá làm được gì.
2. A·tạo × B·member/okr — không thấy lựa chọn; gọi thẳng máy chủ bị từ chối.
3. A·dùng đúng việc — khoá chỉ-kéo gọi thủ tục kéo về theo lịch: được, đóng dấu như lượt tay.
4. A·dùng việc khác — mọi đường đọc phiên (tRPC, trang web, cầu tác nhân, thư viện xác thực) đều coi khoá chỉ-kéo
   như không có phiên.
5. A·chủ khoá mất quyền quản trị — khoá còn đó nhưng kéo về bị từ chối, không đóng dấu.
6. A·khoá thường cũ — chạy y như trước (lượt tay LT2 giữ nguyên).
7. C·có mới / không mới — lượt dựng nhánh hàng chờ từ nhánh chính, chỉ đẩy khi có tệp chưa có ở nhánh chính.
8. C·hỏng (thiếu bí mật, CRM từ chối, tệp lệch) — lượt đỏ, không đẩy gì, nhật ký gọi tên.
9. C·PR đã gộp hay chưa có — lượt mở lại PR hàng chờ; kho cấm thì lượt đỏ gọi tên quyền thiếu.
10. D·chủ kho/ngưỡng — dòng tổng kết in tuổi lớn nhất của tín hiệu vừa đóng dấu.

## Later

- Khoá nhiều phạm vi tuỳ chọn (kiểu GitHub fine-grained) — vòng này chỉ một kiểu hẹp. [NGÀNH: GitHub fine-grained PAT]
- Trang Cài đặt hiện «lượt kéo gần nhất» của lịch chạy — TH3/TB1.
- Báo tin cho người gửi khi chữ đổi — S2/TB1.
- Bot tự gộp PR hàng chờ — lối B, Cổng Đáng 14/10 không chọn.

## Never

- Khoá chỉ-kéo mở được phiên rồi chặn từng thủ tục — đường hở (trang web, cầu tác nhân, thư viện xác thực không
  qua tRPC).
- Ứng dụng tự ghi git — Cổng Đáng LT2 chọn lối 1.
- Lịch chạy trên máy cá nhân — máy không bật suốt đêm.
- Bot tự gộp PR theo [NGÀNH: Renovate automerge] — trái luật cửa sổ gộp 13/10.

## Cross-cutting áp mọi ô Core

- Khoá không bao giờ in ra nhật ký hay tệp; tệp vẫn không mang danh tính người gửi (luật LT2).
- Lỗi là thật, có tên — không im lặng ra xanh.
- Hai khổ màn và tiếng Việt/Anh cho phần Cài đặt chạm tới.
