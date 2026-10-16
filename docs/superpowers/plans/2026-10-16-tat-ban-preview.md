# Kế hoạch — tat-ban-preview

Hồ sơ: `_acceptance/tat-ban-preview/` (Cổng Phạm vi duyệt 16/10, manh). Ba việc tuần tự — việc sau dựa trên việc trước.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Có phép thử nói rõ dự án nào còn dựng Preview — đỏ trước khi đổi cấu hình | `apps/agent-okr/test/vercel-du-an.ts`, `apps/agent-okr/test/vercel-preview-moi-du-an.spec.ts`, `_acceptance/tat-ban-preview/rang/*` | AC-1..AC-6 (thước) |
| Đẩy nhánh thôi dựng Preview ở app, api, agent | `vercel.json`, `apps/app/vercel.json`, `apps/agent/vercel.json` | AC-1..AC-5 (vật) |
| Tài liệu vận hành nói đúng Preview đã tắt ở đâu | `docs/production.md`, `docs/setup.md` | AC-7 (tài liệu) |

## Việc 1 — phép thử trước (independent: false)

- Files: hai tệp phép thử + sáu tệp `rang/` (nháp đã chạy thử trên dữ liệu thật 16/10).
- Commit RIÊNG, trước mọi tệp `vercel.json` mới — chiều đỏ nằm trong lịch sử.
- Verify: `cd apps/agent-okr && bun test test/vercel-preview-moi-du-an.spec.ts` → ĐỎ, ca `hop-le` liệt ba dự án
  `crm-onehub-app`, `crm-onehub-api`, `crm-onehub-agent` với lỗi đọc tệp (ENOENT); `agent-okr` không lệch.
- Phục vụ E1–E8, E10.

## Việc 2 — ba tệp cấu hình (independent: false)

- Files: `vercel.json` (gốc kho), `apps/app/vercel.json`, `apps/agent/vercel.json` — mỗi tệp đúng `$schema` + `git.deploymentEnabled {"**": false, "onehub": true}`.
- Verify: phép thử trên XANH 4/4; `bun _acceptance/tat-ban-preview/rang/pha-thu.mjs` mã 0 (chín ca);
  `goc-du-an.mjs xanh` và `do` mã 0; `bunx turbo run build --filter=app --filter=agent` xanh (tệp mới không đổi cách dựng).
- Phục vụ E1–E6.

## Việc 3 — tài liệu (independent: false)

- Files: `docs/production.md` (mục Preview, bảng cron giữ nguyên), `docs/setup.md` (đoạn Preview dùng chung DB, mục agent-okr).
- Verify: đọc lại theo năm câu của E11 — không câu nào còn mô tả Preview ba dự án như đang chạy.
- Phục vụ E11.

## Sau S3

`node scripts/luat-kho/do-cay.mjs --du-luat` · `scripts/pre-merge-check.sh --base origin/onehub` · xin lượt pre-push, đẩy MỘT lần, chờ 5 phút, rồi S4.
