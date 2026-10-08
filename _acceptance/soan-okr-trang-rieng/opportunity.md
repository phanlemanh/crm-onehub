---
schema_version: 1
slug: soan-okr-trang-rieng
feature: «Tôi soạn bộ OKR trên một trang riêng, bản nháp rộng bên cạnh cuộc trò chuyện»
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-07T13:13:50Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: K2
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

«Tôi soạn bộ OKR trên một trang riêng, bản nháp rộng bên cạnh cuộc trò chuyện»

Mở từ hàng K2 của «OKR» (`docs/plan/lo-trinh-okr.json`), dãy P1 của đợt `sau-14-10`. Bốn câu khung
chủ kho đã trả lời 04/10 (trang riêng có thanh kéo đổi cỡ, không sheet; khoá dòng chưa quyết khi Kara
đang soạn; có nhận theo nhóm; thứ tự 0 → 1 → 2 → 3). K0 (#240) và K1 (#258) đã gộp; R1h (#251) đã tách
«Kara sập không trừ lượt» và «Thử lại nói rõ vì sao» ra khỏi lượt này.

Nguồn: `.acceptance-runs/dieu-phoi-1410/nguon/lai-thu-prod-0410/de-xuat-kara.html` mục «Mười nguyên tắc
ghép nối cho Soạn OKR» và «Bốn bề mặt hôm nay».

- Màn Soạn OKR hôm nay: hội thoại trái, 11 thẻ viền lồng nhau bên phải, mỗi thẻ một nút xanh «Nhận».
- Kara đang soạn thì bên phải ghi «Chưa có dòng nào» — hai nửa không biết nhau; không có nút Dừng.
- Dòng đã quyết vẫn mở ô số bên dưới; «Đã bác» không có Hoàn tác (trái `docs/ai-ux.md` §6).
- Sửa trên bảng thì Kara không biết; số đã gõ mất sau một lượt chat.
- 375 px: ngăn kéo ~280 px, chip trả lời bị cắt, Kara nói «sang cột bên phải» khi không có cột phải.

**Người gặp:** mọi người đặt OKR quý trong CRM từ R1 (23/10) — trưởng đơn vị soạn bộ Mục tiêu–KR của
đơn vị mình cùng Kara, thường 2–4 Mục tiêu × 2–4 KR.

## Ngưỡng chết / ngưỡng UAT

Chủ kho ký `build` lúc 2026-10-07T13:13:50Z cho cả 16 hàng chưa ký của đợt `sau-14-10` (luật 16 của
`LUAT.md` đợt, chuyển lời qua `tra-loi/P1-1.json`). Ngưỡng dưới đây do máy soạn, giữ nguyên khi ký.


- Câu hỏi phép đo trả lời: một trưởng đơn vị chưa từng thấy màn này soạn xong một bộ OKR
  (≥ 2 Mục tiêu, mỗi Mục tiêu ≥ 2 KR có Khởi điểm/Đích) cùng Kara và đưa vào được, không cần ai chỉ?
- Kết quả nào là SỐNG: ở lái-thử người-lạ, ≥ 2/3 người đưa được bộ OKR vào trong ≤ 15 phút;
  0 lần mất số đã gõ; 0 lần «sửa trên bảng mà Kara không biết»; mọi quyết định (nhận, bác, nhận cả
  nhóm) hoàn tác được ngay trên dòng.
- Kết quả nào là CHẾT: ≥ 2/3 người kẹt ở cùng một chỗ (không tìm ra đưa vào, không hiểu dòng
  nào đã quyết, phải bỏ cuộc soạn làm lại), hoặc có một lần mất số đã gõ.
- Timebox: PR mở trước 16/10/2026; lái-thử trước R1 (23/10).
