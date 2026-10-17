---
schema_version: 1
slug: tac-nhan-glm-5-3-cham
feature: Tìm nguyên nhân Tác nhân bộ dựng chạy quá trần trên GLM 5.3 mà qua trên GLM 5.2 Fast
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-16T05:33:48Z
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Chủ kho muốn chuyển các hoạt động thông thường sang model rẻ hơn. P0 đo Tác nhân bộ dựng (`eve eval agent-builder`,
3 lượt mỗi model, 15/10 21:56–22:16Z): GLM 5.2 Fast 3/3 (86–96 s), GLM 5.3 1/3 (hai lượt hỏng «The operation was aborted
due to timeout», trần 3 phút của eval; lượt qua 138 s), GLM 5.3 Flash 3/3. Chủ kho nghi «có điều gì ràng buộc bên dưới,
không phải thông lệ thông thường».

Căn cứ Cổng Đáng: chủ kho gõ ở phiên P6 lúc 2026-10-16T05:33:48Z, nguyên văn «MH3 build; MH4 build; K7 build», sau khi
duyệt kế hoạch («kế hoạch: đồng ý»). Giám sát xếp hàng MH3 cho dãy P6 lúc 05:34Z.

Câu giao: Tìm nguyên nhân cốt lõi vì sao Tác nhân bộ dựng qua 3/3 trên GLM 5.2 Fast mà GLM 5.3 hỏng 2/3 vì quá trần
3 phút; kiểm các giả thuyết hạng Fast, mức suy luận mặc định, ZDR, trần của bài đo; đầu ra là nguyên nhân kèm số và
dòng nhật ký làm bằng.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: GLM 5.3 chậm vì chính nó, hay vì một cấu hình bên dưới (hạng phục vụ, mức suy luận) mà đổi được?
- Kết quả nào là SỐNG: một biến thể cấu hình đưa GLM 5.3 về dưới trần 3 phút ở cả 3 lượt, và giải thích được bằng số bước, token, giây của phiên con.
- Kết quả nào là CHẾT: không biến thể nào đổi được kết quả — kết luận GLM 5.3 chậm thật cho Tác nhân, đặt số cạnh GLM 5.2 Fast và GLM 5.3 Flash.
- Timebox: trong ngày 16/10.

## Cổng 0

- **decision = build.** Căn cứ: chủ kho gõ «MH3 build; MH4 build; K7 build» lúc 2026-10-16T05:33:48Z.

## Out of scope từ khám phá

- Đổi model mặc định hay model theo vai — hàng MH4 `model-theo-vai-do-lai`.
- Trải nghiệm chờ Tác nhân lâu — hàng K7 `cho-tac-nhan-lau`.
