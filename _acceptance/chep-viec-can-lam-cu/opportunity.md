---
schema_version: 1
slug: chep-viec-can-lam-cu
feature: Việc cần làm cũ trên dòng thời gian thành Việc; Tác nhân giao việc bằng Việc
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-13T08:28:58Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA1b
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA1b của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).

Việc cần làm cũ trên dòng thời gian thành Việc; Tác nhân giao việc bằng Việc

Vì sao: Chủ kho tách khỏi DA1 ở Cổng Phạm vi 13/10 (Hỏi-4): chép dữ liệu production cần cổng riêng, và DA1 gộp kịp sau DA0b.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi chép và đổi đường ghi, còn việc cần làm nào sống ngoài Việc trên production không — cả việc cũ lẫn việc mới do người hay Tác nhân tạo?
- Kết quả nào là SỐNG: (1) Lần chép trên production: số Việc mang dấu «chép từ việc cần làm cũ» bằng đúng số Activity loại TASK đếm ngay trước lúc chép (lệch 0), và số Activity loại TASK sau lúc chép vẫn bằng số trước (bản gốc còn nguyên để đảo). (2) Trong 14 ngày sau gộp: 0 Activity loại TASK mới được tạo trên production, dù bởi người hay bởi Tác nhân.
- Kết quả nào là CHẾT: Lệch dù chỉ 1 ở lần chép, mất dù chỉ 1 bản gốc, hoặc có dù chỉ 1 Activity loại TASK mới trong 14 ngày.
- Timebox: Chép chạy một lần ngay sau khi gộp vào onehub (chủ kho bấm, có số đếm trước/sau); vế (2) đọc sau 14 ngày kể từ ngày gộp.

Bản ở hàng DA1b của lộ trình không khai ngưỡng (`bat_khi` vắng). Máy đề xuất ngưỡng trên vì việc của hàng là dời một loại dữ liệu và một đường ghi: đo được bằng hai phép đếm, mỗi phép đỏ được khi lệch 1.

## Bối cảnh máy đọc ở S0

- Có 30 tệp mã đọc hay ghi Activity loại TASK (API `activities.*`, `dashboard.service.ts`, Tác nhân `run-runtime.ts` · `ma-lech.ts` · `accounts.ts` · `builder-runtime.ts`, manifest `packages/validation/src/agent-manifest.ts`, ô soạn và dòng thời gian của app, `seed.ts`) và nhiều bài kiểm của hồ sơ đã ký (`han-viec`, `viec-cua-toi`, `vai-chi-okr`, `viec-o-soan`, `dieu-phoi-va`, `go-la-cat-quyen`…). Bỏ đường TASK là mở lại các tiêu chí đó — phạm vi chốt ở Cổng Phạm vi.
- Phiên máy không có đường đọc cơ sở dữ liệu production (`docs/production.md`: chỉ đọc, không kéo biến). Số đếm trước/sau do chủ kho chạy, hoặc qua một lệnh chỉ-đếm do vòng này dựng.
- #375: M5 đã hỏi Mac Studio dãy r2 nào chạm `run-runtime.ts` / `ma-lech.ts` — tới 13/10 chưa có trả lời.

## Nguồn quyết định Cổng Đáng

Chủ kho gõ ở phiên thợ DA1b (máy M5) ngày 13/10/2026: «Cổng Đáng chep-viec-can-lam-cu: build · ngưỡng: theo đề
xuất máy». `decided_at` là giờ phiên thợ ghi lại lời đó. Timebox giữ như máy đề xuất (chép ngay sau gộp, vế sau
đọc 14 ngày từ ngày gộp).
