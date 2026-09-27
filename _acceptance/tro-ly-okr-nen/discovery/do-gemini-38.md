# Đo lại trên Gemini 3.8 Flash trước Cổng Phạm vi

Đo 2026-09-27 trên máy local, khoá `onehub-crm-local`, chỉ dữ liệu giả (cùng câu và
cùng gói giả của N0). Kịch bản: `do-38.ts` (chép từ `apps/agent/n0/do-mo-hinh.ts` của
nhánh nháp N0, đổi model). Số thô: `do-38.jsonl`, 15 lời gọi, tổng $0,054.

Lý do đo lại: production đặt Gemini 3.8 Flash (báo cáo `tac-nhan-hien-nay.md`), còn
N0 đo trên 3.7.

| Phép đo | 3.7 (N0) | 3.8 (hôm nay) | Đọc |
|---|---|---|---|
| ZDR | Đạt, chỉ Vertex | **Đạt, chỉ Vertex**; Google AI Studio bị bỏ vì `zdr_not_supported` | Giữ luật «chỉ gửi khi có ZDR»; không có đường rơi sang nhà cung cấp không ZDR |
| Giá mỗi 1M token | $0,75 vào · $0,075 đọc cache · $3,75 ra | **Như cũ**: $0,75 · $0,075 · $3,75 (tính từ `inputInferenceCost`, `outputInferenceCost` của Gateway) | Ước lượng tiền §4.10 không đổi vì giá |
| Cache trên đường ZDR, prefix 7.297 token | Đọc 4.077 (56%) ở 2/2 lần lặp | Đọc **4.077 (56%)** khi trúng; trúng **3/5** lần lặp | Cache ngầm không chắc chắn trên 3.8; ước lượng nên dùng «56% × tỷ lệ trúng», không dùng 60% |
| Suy nghĩ, câu ngắn (117 token vào) | Mặc định 662 · `thinkingLevel: "low"` 209 | Mặc định **689** (657–751) · `low` **0** (4/4 lần) | Tiền mỗi lời gọi giảm 82% (từ $0,0031 xuống $0,0005) |
| Suy nghĩ, câu dài (7.297 token vào) | Chưa đo | Mặc định **634** (568–707) · `low` **394** (225–595) | Tiền mỗi lời gọi giảm 26% (từ $0,0071 xuống $0,0053). Gói thật của Trợ lý OKR gần câu dài hơn câu ngắn |
| Thời gian một lời gọi | — | Câu ngắn: mặc định 5,8–7,6 s · `low` 2,2–3,4 s | `low` nhanh gấp đôi; có ích cho ngưỡng p50 ≤ 8 s của 9b |

**Hệ quả cho 9a**

- Chốt 2 đứng nguyên trên 3.8: model, cờ ZDR và `thinkingLevel: "low"` đặt cố định ở
  subagent `tro_ly_okr`; cờ phải khai cho cả `google` lẫn `vertex`.
- Chọn **`google/gemini-3.8-flash`** cho `tro_ly_okr` (cùng model production, cùng giá, cùng
  ZDR). Đổi model sau này là sửa một hằng và chạy lại eval cách ly.
- Ước lượng tháng đặt OKR của N0 ($10,48 khi gốc là Gemini) vẫn là số nên dùng: giá không
  đổi; phần subagent rẻ hơn một chút nhờ `low`, phần cache kém chắc hơn. Trần $9 vẫn cần
  dùng lại kết quả theo `inputHash` ở 9b.
- Báo cáo chi tiêu của Gateway (`GET /v1/report`, `gateway.getSpendReport`) gọi được bằng
  khoá local, lọc `api_key_id=self`: đối soát sổ chi phí với Gateway làm được bằng mã.
