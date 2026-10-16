# Hạt giống — Gợi ý mở kế hoạch (DA3b): thẻ chưa làm mới khi đổi giai đoạn ngay trên sheet deal

Gốc: `_acceptance/goi-y-mo-ke-hoach/` (DA3b, PR #447 gộp 16/10/2026), ký Cổng Bằng chứng 16/10/2026. Mục «mở hợp đồng
mới» do chủ kho chọn: Ngoài-16 trong `review-findings.md` («Đổi giai đoạn ngay trên sheet deal không làm mới query
goiYCuaDeal, nên thẻ gợi ý không hiện sau khi thắng và không ẩn khi deal rời thắng»), dòng sổ `decisions.jsonl` stage
gate2. Hạt giống là SỔ, không phải ô: mở thành hàng khi chủ kho xếp nó vào lộ trình Việc và Dự án.

## Lỗ

Người phụ trách kéo deal sang thắng ngay trên sheet deal (`StageStepper` ở `apps/app/components/crm/stage-stepper.tsx`,
`DealStageMenu` ở `apps/app/components/crm/stage-change.tsx`). Máy chủ sinh gợi ý đúng lúc, nhưng thẻ
`TheGoiYKeHoach` (`apps/app/components/crm/record-sheet/goi-y-ke-hoach.tsx`) đọc `onboarding.goiYCuaDeal` với staleTime
30 giây, còn `cache.deal(id)` (`apps/app/lib/trpc/cache.ts`) mà hai chỗ trên gọi sau khi đổi giai đoạn không làm mới
query đó. Hệ quả: thẻ chưa hiện ngay sau khi thắng, và chưa ẩn ngay khi deal rời thắng — tối đa 30 giây hoặc tới lần
mở lại sheet. Đây là đường chính của người phụ trách, nên nó chạm thẳng ngưỡng (b) «≥ 50 % gợi ý xử lý trong 3 ngày».

## Vì sao chưa làm ở DA3b

Phân loại phạm vi xếp mục này ngoài hợp đồng: AC-5 đo thẻ bằng dữ liệu giả, AC-6 đo màn thật sau khi deal đã thắng
rồi mới mở sheet; không tiêu chí nào nói về đổi giai đoạn trong khi sheet đang mở. Vòng đã chạm trần 3 lượt S4.

## Hướng

Một hàng T2 riêng: cho `useCrmCache().deal(id)` làm mới cả `onboarding.goiYCuaDeal({ dealId: id })` — một chỗ, phủ mọi
đường đổi giai đoạn (sheet, Kanban, hàng loạt) — theo luật «Freshness» của `docs/api.md` (query màn đang đọc phải vào
danh sách làm mới của lệnh ghi tương ứng). Bài DOM theo khuôn `apps/app/test/goi-y-ke-hoach.dom.tsx` (khung
`khung-gop-y`), cặp hai chiều: bản đúng thì thẻ hiện ngay sau lệnh đổi giai đoạn trên sheet; bản bỏ làm mới thì đỏ với
thông điệp ghim. Phiên «Thẻ gợi ý làm mới khi đổi giai đoạn trên sheet» (16/10) đã đọc và khoanh đúng chỗ này, chưa
sửa tệp nào.
