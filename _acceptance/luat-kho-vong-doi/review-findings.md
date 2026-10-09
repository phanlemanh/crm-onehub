# Review findings: luat-kho-vong-doi (round 1)

## Trong hợp đồng

- **New luat-kho CI job runs bun install without DATABASE_URL; @crm/db's postinstall `prisma generate` fails, so the job goes red before the rule runs**
  file: `.github/workflows/acceptance.yml:68`
  severity: high
  AC: AC-8
  source: conventions
  detail: The new `luat-kho` job runs `bun install --frozen-lockfile` but sets no `env:`. The workflow has no top-level env, and CI has no `.env`, so `@crm/env/load` loads nothing. `packages/db/package.json` has `"postinstall": "prisma generate"`, and `packages/db/prisma.config.ts` declares `datasource.url: env("DATABASE_URL")`. Every other job in acceptance.yml and ci.yml that runs `bun install` (build, agent-okr-node24, ci.yml check/test) sets DATABASE_URL at job level. Reproduced locally with Prisma 7.9.1, the version installed here: a copy of the schema plus the same config, run with DATABASE_URL unset, makes `prisma generate` exit 1 with `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL.` Bun stops `bun install` with a non-zero exit when a workspace lifecycle script fails (stated from known Bun behaviour, not run here). Result: on every pull_request and on push to onehub/release, the job fails at the install step and never reaches `node scripts/luat-kho/do-cay.mjs --du-luat`. AC-8 needs a job that actually runs the rule, so this misses it. Once the job is required it also blocks every PR. E3 (`rang/ci.mjs`) only checks that the steps are present and in order in the YAML, so it passes and misses this. No Acceptance run exists yet for this branch to confirm on CI. Fix: follow the existing pattern and give the job the CI-only `DATABASE_URL` at job level, as `build` does. Or, since do-cay.mjs only needs `typescript`, install without lifecycle scripts.
  rationale: AC-8 đòi một job cài phụ thuộc rồi chạy đúng lệnh thước; nếu bước cài đã đỏ thì job không bao giờ chạy tới lệnh đó.

- **New luat-kho CI job runs `bun install` without DATABASE_URL, so `prisma generate` fails and the job is red before the rule ever runs**
  file: `.github/workflows/acceptance.yml:68`
  severity: high
  AC: AC-8
  source: bugs
  detail: The new `luat-kho` job sets no `env`. `bun install --frozen-lockfile` runs `prisma generate`, the postinstall of @crm/db (packages/db/package.json:84). That command loads packages/db/prisma.config.ts, which calls `env("DATABASE_URL")` from prisma/config. `.env` is not tracked by git, so `@crm/env/load` finds nothing on the runner. I checked each step here: with DATABASE_URL unset, prisma 7.9.1 `env("DATABASE_URL")` throws `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`; the prisma CLI given such a config prints `Failed to load config file ... PrismaConfigEnvError` and exits 1; Bun 1.3.12 `bun install` exits 1 when a workspace postinstall exits non-zero (`error: postinstall script from "a" exited with 1`). Every other `bun install` step, in this workflow and in ci.yml, sets DATABASE_URL in its job env. This job does not. Result: the job fails on every PR at the install step, an infra failure unrelated to the seven rules, and `node scripts/luat-kho/do-cay.mjs --du-luat` never runs. E3 (rang/ci.mjs) does not catch this because it only checks the YAML step shape, not the environment the steps need. Fix: add `DATABASE_URL` to the job env, the same placeholder the `build` job uses.
  rationale: Cùng nguyên nhân với phát hiện trên: bước cài phụ thuộc đỏ nên AC-8 (job cài rồi chạy thước) không đạt.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **card-plain.json holds the HTML card instead of the JSON plain-language overlay, so it is silently dropped**
  Người dùng thấy gì: Thẻ duyệt ở Cổng 2 của tính năng này sẽ hiện các câu bị cắt dở thay vì bản diễn giải dễ hiểu, nên người quyết phải đọc nguyên văn tiêu chí. Không ảnh hưởng tới việc máy bắt lỗi vòng đời.
  file: `_acceptance/luat-kho-vong-doi/card-plain.json`
  severity: medium
  Đề xuất: known-limits

- **thoi-gian.mjs calls process.exit(2) inside try/finally, so the archive temp dir is never removed**
  Người dùng thấy gì: Mỗi lần phép đo thời gian chạy hỏng sẽ để lại một thư mục tạm chiếm chỗ trên máy người chạy. Chỉ tốn dung lượng, không làm sai kết quả nào.
  file: `_acceptance/luat-kho-vong-doi/rang/thoi-gian.mjs`
  severity: low
  Đề xuất: wont-fix

- **Shape 5 (claims a full matrix but the total is computed from itself): pha.mjs prints soO/soO**
  Người dùng thấy gì: Nếu sau này ai đó lỡ xoá bớt một ca phá thử, bộ kiểm vẫn báo đủ và xanh, nên một lỗ hổng trong kiểm tra có thể lọt mà không ai thấy.
  file: `_acceptance/luat-kho-vong-doi/rang/pha.mjs`
  severity: high
  Đề xuất: known-limits

- **Shape 5 (claims a full matrix but the total is computed from itself): do-cay prints bat/PHA.length, and N = 32 + 7 is never checked**
  Người dùng thấy gì: Nếu một ca tự kiểm của máy bị xoá nhầm sau này, máy vẫn báo toàn bộ đạt và người dùng không biết mình đã mất một lớp bảo vệ.
  file: `scripts/luat-kho/do-cay.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion with no positive control): khongDo does not check that the vong-doi rule actually ran**
  Người dùng thấy gì: Một số ca phá thử có thể báo xanh dù luật vòng đời không thực sự chạy, nên phép kiểm có thể tin quá mức ở vài tình huống hiếm.
  file: `_acceptance/luat-kho-vong-doi/rang/pha.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (no positive control): h1/h2 never run the unmutated copy and do not pin which case goes SAI**
  Người dùng thấy gì: Phép thử giả lập máy hỏng có thể báo đạt vì một lý do khác với lý do dự kiến, nên khó biết chính xác điều gì đã được kiểm.
  file: `_acceptance/luat-kho-vong-doi/rang/pha.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion with no positive control): only 3 of ci.mjs's checks are ever exercised in the failing direction**
  Người dùng thấy gì: Một vài kiểm tra về cấu hình chạy tự động chưa từng được thử ở chiều báo lỗi, nên nếu chúng viết sai thì có thể không ai phát hiện.
  file: `_acceptance/luat-kho-vong-doi/rang/ci.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 4 (negative assertion with no positive control): thoi-gian only asserts the limit was not exceeded, and the declared reverse check is not in cmd**
  Người dùng thấy gì: Phép đo thời gian chỉ chứng minh được lúc này chưa vượt trần; nó chưa tự chứng minh được rằng mình sẽ báo đỏ khi thước chậm quá mức.
  file: `_acceptance/luat-kho-vong-doi/rang/thoi-gian.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
