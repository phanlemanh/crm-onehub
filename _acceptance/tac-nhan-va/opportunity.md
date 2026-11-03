---
schema_version: 1
slug: tac-nhan-va
feature: Màn tác nhân đọc được trên điện thoại, trạng thái tiếng Việt, bộ dựng không treo im lặng
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: E5
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng E5 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Màn tác nhân đọc được trên điện thoại, trạng thái tiếng Việt, bộ dựng không treo im lặng

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Người dùng mở màn tác nhân trên điện thoại có đọc được trạng thái và kết quả lượt chạy bằng tiếng Việt, và bộ dựng tác nhân có hỏi lại đúng lúc thay vì đứng im chờ một câu không ai được hỏi không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu với ít nhất 3 người dựng hoặc xem tác nhân ở khổ điện thoại, 0 người gặp chữ máy tiếng Anh hay phải cuộn ngang, và trong 2 tuần sau khi bật truy vấn hội thoại dựng cho 0 hội thoại có phiên con đang chờ trả lời mà pendingQuestion rỗng.
- Kết quả nào là CHẾT: Có ít nhất 1 hội thoại dựng thật treo im lặng vì câu hỏi lượt sau bị bỏ (phiên con chờ mà màn mở ô soạn), hoặc từ 2 người trở lên trong phiên nghiệm thu không đọc được kết quả lượt chạy trên điện thoại.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
