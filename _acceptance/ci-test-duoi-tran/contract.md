---
schema_version: 1
feature: Bộ kiểm các gói chạy theo bốn nhóm song song, mỗi nhóm một CSDL riêng — job «check-types, lint, test» xong dưới 22 phút thay vì sát trần 30
slug: ci-test-duoi-tran
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: []
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-07T23:41:36Z
design_doc: _acceptance/ci-test-duoi-tran/design.md
---

# Acceptance Contract: ci-test-duoi-tran

## Context

Đo 07/10 trên 10 lượt CI xanh gần nhất: job «check-types, lint, test» 19.3–29.0 phút (7/10 ≥ 26.9; trần 30), bước
`bun run test` 16.0–24.8 phút. `bun run test` gọi `packages/db/scripts/test-run.ts`, chạy `turbo run test
--concurrency=1` trên MỘT CSDL của lượt — các gói chạy nối tiếp. Cộng thời gian theo gói từ log CI: api 7.1 · app 4.6 ·
agent 2.5 · db 2.0 · ui 1.0 · năm gói còn lại < 1 phút. Kho đã có bốn nhóm suite (`suite_api`, `suite_app_ui`,
`suite_agent_db`, `suite_okr_goi`) mà làn ghim lại chạy song song, mỗi nhóm qua `test-run.ts` riêng nên CSDL riêng.

## Criteria

- AC-1: Given lệnh `bun run test` không đối số trên máy có N nhân, When chạy, Then nó chạy bốn nhóm, tối đa min(N, 4) nhóm cùng lúc, nhóm dài trước (api → app+ui → agent+db → nhóm OKR); mỗi nhóm một lượt `test-run.ts` với `--filter` của nhóm (CSDL `crm_<id>_test` riêng); in tên CSDL, mã thoát và số giây của từng nhóm.
- AC-2: Given danh sách gói trong workspace có task `test`, When trình chạy dựng bốn nhóm, Then mỗi gói (trừ miễn trừ của `.githooks/gate-shape.json`) nằm trong ĐÚNG một nhóm; gói thiếu hay trùng thì tiến trình trình chạy thoát khác 0, gọi tên gói đó, và không khởi một nhóm nào.
- AC-3: Given một nhóm thoát khác 0 hay không khởi được, When các nhóm xong, Then TIẾN TRÌNH trình chạy thoát khác 0 và gọi tên nhóm đó — không nhóm nào được nuốt lỗi; mọi nhóm xanh thì tiến trình thoát 0.
- AC-4: Given `bun run test -- <đối số>`, When chạy, Then trình chạy chuyển nguyên đối số sang `test-run.ts`: argv mà `test-run.ts` nhận trùng từng byte với lời gọi thẳng `bun packages/db/scripts/test-run.ts <cùng đối số>`, kể cả đối số có dấu cách và dấu nháy (dạng `bun run test -- "<lệnh>"` của `_acceptance/config.yaml`).
- AC-5: Given `pre-push`, When chạy hết cổng, Then `verify-gate-shape.mjs` vẫn thấy mọi gói chạy task `test` (gộp các bản tóm tắt turbo của bốn nhóm) và thoát 0.
- AC-6: Given CI của chính PR này, When job «check-types, lint, test» xong, Then nó xanh và dài dưới 22 phút; bước `bun run test` dưới 16 phút (máy CI của kho private: 2 vCPU theo bảng máy chuẩn của GitHub — đường găng lý tưởng ≈ 10.4 phút).

## Coverage

- Trục A — gói có task test: 11 gói của workspace (api, app, @crm/ui, agent, @crm/auth, @crm/db, agent-okr, @crm/env, @crm/ai-okr, @crm/telemetry, @crm/validation) [thước CE: workspace globs của package.json gốc + `.githooks/gate-shape.json`]
- Trục B — kết cục của một nhóm: xanh | đỏ | không chạy được [thước CE: mã thoát của tiến trình con]
- Trục C — cách gọi: không đối số (bốn nhóm) | có đối số (chuyển thẳng `test-run.ts`) | trong `pre-push` | trong CI
- Core → AC: A → AC-2; B → AC-3; C → AC-1, AC-4, AC-5, AC-6.

## Out of scope

- Nâng `timeout-minutes` hay sửa `ci.yml` của hãng.
- Làm nhanh từng gói (api 7.1 phút là đường găng sau khi song song) — hồ sơ riêng nếu cần dưới 10 phút.
- Chuyển bài kiểm riêng của công ty sang `acceptance.yml`.

## Notes

- AC-6 đo trên CI của PR (lượt CI hoàn tất gần nhất có `scripts/ci`, `package.json`, `test-run.ts` trùng HEAD): mở PR nháp (`--draft --base onehub`) sau S3 để CI chạy, eval đọc thời gian job bằng `gh`.
