---
schema_version: 1
slug: agent-test-khong-nhap-app
feature: Test của agent không nhập mã của app; danh sách thoả thuận Kara trả có một schema dùng chung
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

## Vấn đề & ai gặp

Sửa nóng, mốc 2026-10-09. #321 (`deal-va`, commit `6aa266852`) cho `apps/agent/test/giai-doan-agent.integration.spec.ts`
nhập `../../app/lib/agent-transcript` để đi trọn vòng «đầu ra thật của `list_deals` → bộ đọc của app». Luật kho
`cach-ly-hai-agent` (`scripts/luat-kho/do-cay.mjs`) cấm agent nhập mã của app, nên onehub nay đỏ luật kho:
«DO cach-ly-hai-agent: apps/agent/test/giai-doan-agent.integration.spec.ts:4 nhap ../../app/lib/agent-transcript».
Lọt vì bộ luật kho chưa chạy ở CI. Hệ quả: hồ sơ đã ký `soan-okr-cung-tro-ly` và `tro-ly-okr-tom-tat` đỏ ở lượt ghim
lại kế tiếp. Gốc sâu hơn là Ngoài-8 của `deal-va`: hình dạng danh sách thoả thuận Kara trả viết tay ở hai nơi
(`lookup.ts` ghi, `apps/app/lib/agent-transcript.ts` đọc) thay vì một schema ở `packages/validation` như `AGENTS.md`
yêu cầu cho payload một app ghi, app khác đọc. Người gặp: người gộp PR kế tiếp (lưới luật kho đỏ), không có người
dùng cuối.

Nguồn: giám sát đợt sau-14-10 mở hàng E1c (09/10). Cổng Đáng chờ anh ký.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] luật kho có xanh trở lại trên onehub sau khi gộp, mà phép đo đi trọn vòng của `deal-va` vẫn còn?
- Kết quả nào là SỐNG: [đề xuất] `scripts/luat-kho/do-cay.mjs` thoát 0 (6/6 luật áp dụng xanh) trên cây sau gộp; ca kiểm `stage-id` của agent vẫn đọc đầu ra công cụ qua đúng schema mà app dùng.
- Kết quả nào là CHẾT: [đề xuất] luật kho còn đỏ, hoặc phép đo đi trọn vòng bị bỏ.
- Timebox: [đề xuất] lượt CI đầu tiên sau khi gộp; không phiên nghiệm thu.
