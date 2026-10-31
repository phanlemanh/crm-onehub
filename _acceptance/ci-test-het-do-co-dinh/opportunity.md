---
schema_version: 1
slug: ci-test-het-do-co-dinh
feature: Một PR chỉ đổi tài liệu ra test (api) và test (app-ui) xanh trên onehub
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-31T11:42:10Z        # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: F37
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng F37 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: `crm-onehub-nguon:wiki/dot/don-dep-3110.md#fc6df9ace5753f6430fb7a75143137c82f826a08` — chưa có trang: trang nền, mã F37
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Một PR chỉ đổi tài liệu ra test (api) và test (app-ui) xanh trên onehub

Vì sao: Từ 28/10 cả 11 lượt CI đủ (mọi loại PR, kể cả PR chỉ đổi tài liệu) đỏ ở cùng bốn ca: dau-hook (e) ở packages/ui/test/pre-push-da-chung.spec.ts:457, móc dọn của apps/api/test/mat-khau-lien-ket.spec.ts:153 (khoá ngoại viec_nguoiGiaoId_fkey), apps/api/test/vai-chi-okr.spec.ts:1175 và dgt-thuoc (apps/api/test/du-an-do-nguong.spec.ts). Nếp «test (api) chập chờn không chặn» đang che một màu đỏ cố định, nên PR nào cũng gộp khi test đỏ và mất tín hiệu thật.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trên đỉnh onehub sau khi gộp, test (api) và test (app-ui) xanh ở một PR chỉ đổi tài liệu; mỗi ca trong bốn ca chạy riêng tệp ba lượt liền đều xanh; ca dgt-thuoc có dòng expect gọi đúng lý do đỏ cũ trong mô tả PR» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trên đỉnh onehub sau khi gộp, test (api) và test (app-ui) xanh ở một PR chỉ đổi tài liệu; mỗi ca trong bốn ca chạy riêng tệp ba lượt liền đều xanh; ca dgt-thuoc có dòng expect gọi đúng lý do đỏ cũ trong mô tả PR
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trên đỉnh onehub sau khi gộp, test (api) và test (app-ui) xanh ở một PR chỉ đổi tài liệu; mỗi ca trong bốn ca chạy riêng tệp ba lượt liền đều xanh; ca dgt-thuoc có dòng expect gọi đúng lý do đỏ cũ trong mô tả PR» khi hết timebox
- Timebox: …
