---
schema_version: 1
feature: "Đổi giai đoạn ngay trên sheet deal thì thẻ gợi ý mở kế hoạch hiện ngay khi sang Chốt được và ẩn ngay khi rời Chốt được"
slug: lam-moi-goi-y-ke-hoach
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-16T15:44:35Z
design_doc: docs/superpowers/specs/2026-10-16-lam-moi-goi-y-ke-hoach-design.md
---

# Acceptance Contract: lam-moi-goi-y-ke-hoach

## Context

Ngoài-16 của `goi-y-mo-ke-hoach` (DA3b, phanlemanh/crm-onehub#447), tách thành hợp đồng riêng ở Cổng Bằng chứng
16/10/2026 (manh, dòng sổ d-20261016T130310Z-38). Hôm nay thẻ gợi ý `TheGoiYKeHoach` trên sheet deal đọc
`onboarding.goiYCuaDeal` với staleTime 30 giây của app, còn `useCrmCache().deal(id)` — lệnh làm mới chung mà
`StageStepper`, `DealStageMenu` (kể cả hộp lý do Không thành), Kanban, thao tác hàng loạt và lưu trữ giai đoạn đều gọi sau
khi đổi giai đoạn — không làm mới query ấy. Lượt này đưa `goiYCuaDeal` của deal vào `cache.deal`, một chỗ phủ mọi
đường đổi giai đoạn, theo luật «A new query a screen reads joins the list its writes refresh» của `docs/api.md`.
Không đổi máy chủ, không đổi hình thẻ: máy chủ đã sinh gợi ý ngay trong giao dịch
đổi giai đoạn (`sinhGoiYKeHoach` trong `DealsService`, `apps/api/src/deals/deals.service.ts`) và `goiYCuaDeal` chỉ
trả gợi ý «chờ» của deal đang ở giai đoạn Chốt được (`OnboardingService.goiYCuaDeal`,
`apps/api/src/onboarding/onboarding.service.ts`) — hai điều này đã ký ở DA3b (E1, E3 của `goi-y-mo-ke-hoach`) và
vòng này chạy lại hai bài kiểm ấy (E8, E9).

Source input: Ngoài-16 trong `_acceptance/goi-y-mo-ke-hoach/review-findings.md` · `opportunity.md` (ngưỡng UAT) ·
design doc của vòng.

## Criteria

- AC-1 (cross-layer): Given sheet deal thật (`DealSheet`) dựng trong bài kiểm giao diện với dữ liệu giả, lệnh làm mới thật (`useCrmCache` của `apps/app/lib/trpc/cache.ts`) và bộ nhớ query giữ kết quả 30 giây như app, deal ở giai đoạn Đang mở và `goiYCuaDeal` trả `null`, When người phụ trách bấm cột Chốt được trên thanh giai đoạn và `deals.setStage` trả thành công, máy chủ giờ trả một gợi ý «chờ», Then thẻ gợi ý hiện trong chính sheet đang mở, cùng phần tử sheet trước lúc bấm, trước khi 30 giây giữ kết quả trôi qua, và `goiYCuaDeal` được đọc lại với đúng `{ dealId }` của deal; và trên API thật, đọc `goiYCuaDeal` ngay sau `setStage` sang Chốt được trả gợi ý «chờ».
- AC-2: Given cùng sheet và dữ liệu của AC-1, When người phụ trách chọn giai đoạn Chốt được ở menu giai đoạn đầu sheet, Then thẻ gợi ý hiện như AC-1.
- AC-3 (cross-layer): Given sheet của deal ở giai đoạn Chốt được có thẻ gợi ý, When người phụ trách đưa deal về giai đoạn Đang mở — một lần qua thanh giai đoạn, một lần qua menu giai đoạn — và máy chủ giờ trả `null`, Then thẻ mất khỏi sheet đang mở ở cả hai đường; và trên API thật, đọc `goiYCuaDeal` sau khi deal rời Chốt được trả `null`.
- AC-4: Given lệnh làm mới thật trên bộ nhớ query có `goiYCuaDeal` của hai deal d-1, d-2 đang được đọc, When gọi `cache.deal("d-1")`, Then `goiYCuaDeal` của d-1 được đọc lại trước khi lời gọi xong, còn của d-2 không; When gọi `cache.deal("d-1", { settle: "record" })`, Then `goiYCuaDeal` của d-1 vẫn được đọc lại trước khi lời gọi xong; When gọi `cache.deal()` không id, Then `goiYCuaDeal` của cả hai được đọc lại; When quét `apps/app`, Then mọi lời gọi `deals.setStage` và `deals.bulkSetStage` nằm trong bảng bốn nơi khai trước (thanh giai đoạn · `useStageMutation` của menu và hộp lý do Không thành · Kanban · hàng loạt) và khối `mutationOptions` của từng nơi gọi `cache.deal`.
- AC-5: Given bản sao kho, When gỡ `goiYCuaDeal` khỏi `cache.deal` trong bản sao, Then bài kiểm của AC-1, AC-3 và AC-4 đỏ với thông điệp ghim của từng ca; When đổi khoá thành khoá chung không theo deal trong bản sao, Then bài kiểm của AC-4 đỏ với thông điệp ghim «làm mới gợi ý deal khác»; trên bản sao lành cả bốn bài kiểm xanh.
- AC-6: Given app và API của chính cây đang chạy trên kho dùng-một-lần, người phụ trách P đăng nhập, deal của một công ty chưa có kế hoạch ở giai đoạn Đang mở, sheet deal mở ở 1280 và không có thẻ, When P bấm cột Chốt được trên thanh giai đoạn, Then thẻ gợi ý hiện trong vòng 5 giây mà không tải lại trang và không dựng lại sheet; When P bấm một cột Đang mở, Then thẻ mất trong vòng 5 giây, sheet vẫn là sheet ban đầu; thước màn phải đỏ khi trang bị chặn mọi lần đọc lại `goiYCuaDeal` sau lần tải đầu.
- AC-7: Given bộ kiểm hiện có của kho, When chạy các suite của `feature_loop.suite_keys` sau lượt này, Then mọi suite thoát 0, không `expect` nào bị xoá hay sửa ở các tệp kiểm đã có, và `check-types` thoát 0.

## Coverage

Quét `morphological-scan.md` (preset entity-feature), ba trục:
- Đường đổi giai đoạn phía app (thanh giai đoạn · menu giai đoạn · hộp lý do Không thành · Kanban · hàng loạt · lưu trữ giai đoạn) — thước: mọi lời gọi `deals.setStage`/`deals.bulkSetStage` trong `apps/app` (E10 quét lại mỗi lượt) → AC-4; hai đường của sheet đo riêng ở AC-1, AC-2, AC-3. Lưu trữ giai đoạn (`giaiDoan.archive` dời deal sang cột khác) gọi `cache.deal()` theo bảng ở design doc mục 2 nhưng chỉ được đọc lúc thiết kế — không eval nào quét lại nó.
- Chiều chuyển (Đang mở→Chốt được · Chốt được→Đang mở · Chốt được→Không thành) — thước: thẻ chỉ có hai trạng thái hiện/ẩn → AC-1, AC-2 (hiện), AC-3 (ẩn); Chốt được→Không thành đi cùng `useStageMutation` với menu → AC-4.
- Phạm vi làm mới (deal này · deal khác · mọi deal) — thước: chữ ký `cache.deal(id?, options?)` → AC-4.

## Đường đo

- «Thẻ hiện trong vòng 2 giây sau khi sang Chốt được, mất trong vòng 2 giây sau khi rời Chốt được» (ngưỡng UAT ở `opportunity.md`): số mili giây từ lúc bấm tới lúc thẻ hiện / mất mà `rang/man.mjs` in ở dòng «E6 …» — AC-6 bảo đảm thước; ngưỡng 5 giây của AC-6 là trần của bàn đo, số đo thật đọc ở phiên nghiệm thu.
- «Không đóng mở lại sheet»: E6 giữ phần tử sheet trước khi bấm và đòi nó còn sau khi thẻ hiện và mất — AC-6.
- «0 lần hỏi»: người dẫn phiên nghiệm thu đếm và ghi vào biên bản phiên (`/acceptance-gate:uat-session`), không phải cổng của việc dựng.

## Out of scope

- Làm mới `goiYCuaDeal` khi tạo kế hoạch cho công ty từ nơi khác (trang Onboarding, sheet công ty) — thẻ đã tự làm mới khi đóng ô tạo kế hoạch của chính nó; các đường khác là việc riêng nếu cần.
- Đẩy thời gian thực (gợi ý sinh bởi người khác hay tác tử khi sheet đang mở) — kho chưa có kênh đẩy; giữ staleTime 30 giây.
- Ngoài-14 của DA3b (đổi công ty của deal sau khi sang Chốt được) — hàng riêng.
- Đổi chữ «Deal … đã thắng» của thẻ (Ngoài-12) — hàng riêng.

## Notes

- Bài kiểm của AC-1–AC-4 sống ở tệp mới `apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx`; `apps/app/test/goi-y-ke-hoach.dom.tsx` của DA3b không đổi.
