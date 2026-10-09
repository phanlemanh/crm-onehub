---
schema_version: 1
feature: CI của kho chạy test thành ma trận ba ô song song trên ba máy, và ci.yml do OneHub tự giữ thay vì là tệp cấm sửa của hãng
slug: ci-ma-tran-ba-o
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-09
design_doc: _acceptance/ci-ma-tran-ba-o/design.md
---

# Acceptance Contract: ci-ma-tran-ba-o

## Context

Job `check-types, lint, test` của `.github/workflows/ci.yml` chạy tuần tự trên một máy 2 nhân: đêm 07–08/10, 52 job xanh
trung vị 26,9′, 2 lượt bị dừng (`cancelled`) ở trần 30′. Hàng F20 thử ma trận ba ô trên branch nháp (#323): hai lượt 10,1′ và 11,2′. Ngày
09/10 anh quyết OneHub tự giữ CI, không gửi hãng (luật 47): áp ma trận vào `ci.yml` của kho, và sửa luật trong
CLAUDE.md đang cấm sửa `ci.yml`.

## Criteria

- AC-1: Given `.github/workflows/ci.yml` sau vòng này, When đọc tệp, Then có đúng ba job: `check` (checkout, setup-bun,
  `bun install --frozen-lockfile`, `bun run check-types` với `NODE_OPTIONS=--max-old-space-size=6144`, `bun run lint`,
  `bun run lint:slop`), `test` dạng ma trận ba ô (`api` · `app-ui` · `con-lai`) mỗi ô chạy `bun run test -- <bộ lọc>` sau
  `bun run db:deploy` với dịch vụ Postgres và cùng bộ biến môi trường như job cũ, `fail-fast: false`, và `ci-ok`
  `needs: [check, test]`, `if: always()`; mỗi job có `timeout-minutes` ≤ 20.
- AC-2: Given mọi gói trong workspace có script `test`, When ghép tập gói mà turbo chọn cho ba bộ lọc, Then mỗi gói có
  test nằm ở đúng một ô, không gói nào thiếu, không gói nào hai ô; ô `con-lai` chỉ dùng bộ lọc loại trừ (`--filter=!…`)
  nên gói mới tự rơi vào nó.
- AC-3: Given một ô `test` hay job `check` đỏ, bị dừng (`cancelled`) hoặc bị bỏ qua (`skipped`), When job `ci-ok` chạy, Then `ci-ok` đỏ; chỉ khi cả
  hai đều `success` thì `ci-ok` xanh.
- AC-4: Given bản `ci.yml` của vòng này, When so với bản đã đo trên branch thử `thu/ci-tach-job` (#323, commit
  `341a9d6c1`), Then hai bản giống nhau về job, bước, bộ lọc và biến môi trường — số đo ở #323 (cả lượt 10,1′ và 11,2′,
  job dài nhất 9,8′ và 11,0′) là số đo của chính cấu hình được gộp.
- AC-6: Given hồ sơ, When cần đo ngưỡng 7 ngày, Then có `rang/do-7-ngay.mjs` định nghĩa sẵn lượt xanh (`ci-ok` =
  success), job dài nhất, dừng vì trần (job `cancelled` dài ≥ trần của chính nó − 1′, khác với dừng vì đẩy chồng) và ngưỡng
  mẫu (< 10 lượt xanh → «chưa đủ mẫu»), chạy được trên dữ liệu thật của một branch.
- AC-5: Given CLAUDE.md sau vòng này, When đọc mục «Kho này là bản riêng», Then không còn câu «không bao giờ vào `ci.yml`
  của hãng» và có nguyên văn đoạn ở Notes (`ci.yml` do OneHub giữ; kéo bản mới của hãng về thì giữ bản OneHub ở tệp
  này); CI riêng của công ty vẫn ở `acceptance.yml`.

## Coverage

- Trục A — job: `check` | ô `api` | ô `app-ui` | ô `con-lai` | `ci-ok` [thước CE: #323 và `ci.yml` hiện tại]
- Trục B — kết cục ô: xanh | đỏ | `cancelled` | `skipped` [thước CE: tài liệu GitHub Actions `needs.<job>.result`]
- Trục C — phủ gói: gói có test hiện có | gói mới thêm sau | gói không có test [thước CE: `turbo run test --dry=json`]
- Core → AC: A → AC-1; B → AC-3; C → AC-2; bằng chứng đo → AC-4, AC-6 (CI của chính PR ở Đường đo); luật kho → AC-5.

## Đường đo

- «trung vị job dài nhất ≤ 15′ trên ≥ 10 lượt xanh, 0 lượt dừng vì trần trong 7 ngày» · `node
  _acceptance/ci-ma-tran-ba-o/rang/do-7-ngay.mjs --nhanh onehub` (định nghĩa ở AC-6) · AC-1, AC-4, AC-6. Lượt CI đầu tiên
  của chính PR (ci-ok xanh, job dài nhất ≤ 15′) đo bằng cùng script với `--nhanh feat/ci-ma-tran-ba-o`, ghi vào mô tả PR
  trước khi gộp.
- «mọi gói có test chạy ở đúng một ô» · E2 chạy lại ở mỗi lượt ghim lại · AC-2.

## Out of scope

- Gửi gì lên trycompai/crm (anh quyết 09/10, luật 47).
- Đổi lệnh `bun run test`, `test-run.ts` hay mức song song trong một máy (F16 đã đóng).
- Branch protection: `onehub` hiện không có kiểm tra bắt buộc; `ci-ok` sẵn sàng làm tên duy nhất khi anh bật.
- Tự động giữ bản OneHub khi gộp `release` (driver gộp, `.gitattributes`) — chỉ ghi luật trong CLAUDE.md.
- Đo trước rằng lần kéo `release` kế tiếp không mất sửa đổi đáng giữ của hãng (giả định số 3 của hồ sơ cơ hội): chấp
  nhận không đo ở vòng này; người gộp `release` đọc diff `ci.yml` của hãng bằng tay theo luật mới ở CLAUDE.md.

## Notes

- Đoạn thay cho câu «CI riêng của công ty sống ở `.github/workflows/acceptance.yml`, không bao giờ vào `ci.yml` của hãng.»
  trong CLAUDE.md (anh duyệt nguyên văn ở Cổng 1 này):
  «CI riêng của công ty sống ở `.github/workflows/acceptance.yml`. Riêng `.github/workflows/ci.yml` nay do OneHub giữ
  (luật 47, 09/10): bước test chạy thành ma trận ba ô trên ba máy. Kéo bản mới của hãng về `release` rồi gộp sang
  `onehub` mà đụng tệp này thì giữ bản của OneHub, chỉ chép tay phần hãng đổi mà OneHub cần.»
- Đóng PR nháp #323 khi vòng này gộp.
