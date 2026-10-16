---
schema_version: 1
slug: goi-y-mo-ke-hoach
feature: Deal thắng thì máy gợi ý mở kế hoạch onboard; người phụ trách mở hay bỏ qua ngay trên deal
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA3b
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA3b của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).

Deal thắng thì máy gợi ý mở kế hoạch onboard; người phụ trách mở hay bỏ qua ngay trên deal

Vì sao: Tách khỏi DA3 ngày 14/10 theo luật cỡ hợp đồng (15 tiêu chí); ngưỡng (b) chủ kho đã ký ở Cổng Đáng của DA3 đi theo hàng này.

## Ngưỡng chết / ngưỡng UAT

Ngưỡng dưới đây là vế (b) chủ kho ĐÃ KÝ ở Cổng Đáng của DA3 (`_acceptance/ke-hoach-sinh-viec/opportunity.md`, `decided_by: manh`, 14/10), đi theo hàng này khi tách (sổ `d-20261014T061219Z-15` của hồ sơ đó). Chép nguyên nghĩa, không đề xuất lại.

- Câu hỏi phép đo trả lời: Sau hai tuần dùng thật, deal thắng có dẫn tới một gợi ý mở kế hoạch, và người phụ trách có xử lý gợi ý đó kịp không?
- Kết quả nào là SỐNG: Trong 14 ngày đầu dùng thật, mọi deal chuyển sang giai đoạn thắng của công ty chưa có kế hoạch mở đều sinh một gợi ý, và ít nhất 50% gợi ý đó được người xử lý (mở kế hoạch hoặc bỏ qua) trong 3 ngày.
- Kết quả nào là CHẾT: Có deal thắng đủ điều kiện mà không có gợi ý, hoặc dưới 50% gợi ý được xử lý trong 3 ngày (gợi ý thành tiếng ồn).
- Timebox: Đọc số sau 14 ngày dùng thật kể từ ngày DA3b gộp vào onehub. (Máy sinh ô ghi «2026-10-24» theo ngày mốc m-1024; câu đã ký nói «đọc sau 14 ngày dùng thật», nên mốc phát hành 24/10 là hạn giao, không phải ngày đọc số.)

Mốc so hôm nay (đọc mã `origin/onehub` 7ebcb0242, sau khi DA3 gộp): chưa có bản ghi gợi ý nào — không bảng, không móc ở `chuyenGiaiDoanTrongTx` (`apps/api/src/deals/deals.service.ts:638`) khi deal sang giai đoạn thắng; kế hoạch onboard tạo từ khuôn đã có (`onboarding.service.ts:386` `createFromTemplate`). Tỉ lệ «deal thắng có gợi ý» hôm nay là 0. Đơn vị đếm là **lần chuyển sang thắng** (thiết kế nháp `docs/superpowers/specs/2026-10-14-ke-hoach-sinh-viec-design.md` mục 7, ma trận giai đoạn 3×3), vì câu đã ký nói «mọi deal chuyển sang giai đoạn thắng».

Luật sinh gợi ý là tất định ở máy chủ, không qua tác tử — nên vế «mọi deal thắng đều có gợi ý» đỏ được bằng một lần chuyển bị sót, và đo được bằng đối chiếu dòng hoạt động `STAGE_CHANGE` với bảng gợi ý.

## Ước lượng

DA3b: bắt đầu ~16/10 · ~10 giờ máy · hoàn tất dự kiến 19/10 · mục tiêu 20/10

Căn cứ: DA3 (cùng hạng T3, 10 tiêu chí) đi từ Cổng Đáng 14/10 tới gộp 16/10, gồm hai lượt S4 REJECT. DA3b nhỏ hơn (một bảng, một móc trong giao dịch, hai thủ tục, một thẻ trên sheet deal, một dòng nhắc buổi sáng, thước đo ngưỡng) nhưng vẫn qua đủ Cổng Phạm vi + Gate 1.5 + Cổng Bằng chứng và cửa sổ gộp giờ chẵn của Điều phối M5. Rủi ro trễ: lượt làn nặng trên M5 xếp hàng, và thước màn của thẻ trên sheet deal (bài học DA3: thước phải đỏ được trên vật hỏng trước khi tin xanh).

## Nguồn quyết định Cổng Đáng

(chờ chủ kho ký ở phiên thợ DA3b, máy M5)
