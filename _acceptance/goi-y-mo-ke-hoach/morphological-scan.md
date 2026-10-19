# Quét không gian AC — goi-y-mo-ke-hoach (preset entity-feature)

## Ngữ cảnh
- Sản phẩm: CRM nội bộ OneHub — chân sản phẩm: đào repo (`CONTEXT.md`, `apps/api/src/deals/deals.service.ts`, `apps/api/src/giai-doan/giai-doan.service.ts`, `apps/api/src/onboarding/onboarding.service.ts`, ngưỡng đã ký ở `_acceptance/ke-hoach-sinh-viec/opportunity.md`) · chân ngành: Pipedrive Projects (mở dự án từ deal đã thắng) [NGÀNH: Pipedrive Projects], HubSpot workflow «deal stage = Closed won → tạo ticket/onboarding» [NGÀNH: HubSpot Workflows]. Cả hai là đối chiếu cùng loại: sự kiện «deal thắng» là cò cho việc bàn giao sang khâu sau.

## Trục
- **A — Đường ghi giai đoạn:** `setStage` | `bulkSetStage` | lưu trữ giai đoạn (dời deal sang cột cùng loại) | tạo deal ở giai đoạn thắng   [thước CE: quét mọi chỗ ghi `deal.stage` — chỉ `chuyenGiaiDoanTrongTx` và `DealsService.create`, SUY-TỪ-REPO: `apps/api/src/deals/deals.service.ts`; `run-runtime.ts` của tác tử chỉ ghi `lastActivityAt`]
- **B — Cặp loại giai đoạn đi → đến:** (tạo mới, mở, thắng, thua) × (mở, thắng, thua) = 12 ô   [thước CE: `LoaiGiaiDoan` có đúng ba giá trị, SUY-TỪ-REPO: `packages/db/src/giai-doan.ts`]
- **C — Điều kiện chặn lúc chuyển sang thắng:** không có gì | công ty có kế hoạch mở | deal có gợi ý «chờ» | deal có gợi ý đã xử lý (không chặn)   [thước CE: câu ngưỡng đã ký + ma trận nháp DA3 mục 7]
- **D — Vòng đời gợi ý × người làm:** tạo kế hoạch từ thẻ | tạo kế hoạch bằng đường khác (danh mục, REST) | bỏ qua bởi người nhận | bỏ qua bởi quản trị | bỏ qua bởi người khác (403) | bấm lại gợi ý đã xử lý (400) | deal rời thắng khi gợi ý còn chờ   [thước CE: mục 5 thiết kế + `docs/vong-doi.md` ba câu; `[NGÀNH: Pipedrive Projects]` cho «mở từ deal»]

## Core
1. B: mở→thắng, thua→thắng, tạo mới→thắng sinh; mọi ô còn lại không sinh — ma trận đủ 12 ô viết trước, chạy qua A = `setStage` (AC-1).
2. A: `bulkSetStage` và tạo deal ở thắng sinh như `setStage`; lưu trữ giai đoạn (thắng→thắng) không sinh (AC-1).
3. C: công ty có kế hoạch mở → không sinh; deal có gợi ý chờ → không sinh thêm; thắng → bỏ qua → mở lại → thắng → sinh mới; hai lần chuyển đồng thời → đúng một gợi ý (AC-2).
4. D: tạo kế hoạch bằng mọi đường đóng mọi gợi ý chờ của công ty, cùng giao dịch; tạo hỏng thì không đổi (AC-4).
5. D: bỏ qua theo quyền — người nhận, quản trị được; người khác 403; đã xử lý thì 400 (AC-3).
6. Kênh: thẻ ở sheet deal hiện đúng khi chờ ∧ người nhận ∧ deal đang thắng (AC-5, AC-6).
7. Kênh: dòng nhắc buổi sáng / chuông cho người nhận khi chờ ∧ deal đang thắng (AC-7, theo Hỏi-1).
8. Thước ngưỡng (b) đỏ được ở cả hai vế (AC-8).

## Later
- Mở lại gợi ý đã bỏ qua.
- Danh sách «gợi ý của tôi».
- Đổi người nhận khi deal đổi người phụ trách sau lúc sinh.
- Tự tạo kế hoạch không hỏi (kiểu HubSpot workflow) [NGÀNH: HubSpot Workflows] — ngưỡng đã ký nói «gợi ý … được người xử lý», nên tự tạo đổi nghĩa ngưỡng.

## Never
- Gợi ý khi deal thua — không có khách để onboard.
- Gợi ý cho deal đã thắng trước lượt này (chạy lùi) — ngưỡng đếm từ ngày gộp.
- Thêm trạng thái «hết hiệu lực» khi deal rời thắng — phép đo đếm nó là chưa xử lý (bi quan), không cần trạng thái thứ tư.

## Cross-cutting áp mọi ô Core
- Luật chạy trong cùng giao dịch đổi giai đoạn; không qua tác tử.
- Mẫu số của thước không đọc từ bảng gợi ý.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture (dot-bien).
