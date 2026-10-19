# Tắt bản Preview của app, api, agent — thiết kế

Ngày: 2026-10-16 · Vòng: `tat-ban-preview` (PV1, nhóm «Vận hành · crm», TRỪ) · Hạng: T2

## Vì sao

- Mỗi lần đẩy một nhánh, ba dự án Vercel `crm-onehub-app`, `crm-onehub-api`, `crm-onehub-agent` dựng một bản
  Preview. Bản Preview đọc biến đích `preview`, mà `docs/setup.md` ghi là cùng giá trị với production: mã chưa
  qua cổng nào chạy được trên dữ liệu thật.
- Đo 16/10 (finding kit `docs/findings/2026-10-16-truy-nguyen-toc-do-m5.md` §9.6, chỉ GET): 7 ngày có 840 bản
  Preview (280 mỗi dự án, 106 nhánh), đều sau SSO của Vercel, 0 request vào hàm trong 24 giờ; đối chứng dương:
  cùng lệnh trên production trả 50 dòng.
- Chủ kho trả lời câu chỉ-người-biết («anh có mở Preview không?»): chỉ làm việc qua Claude Code Desktop, xem
  ảnh chụp ở đó, và bản Local. Không ai dùng Preview → tắt (lối A), không tách DB cho Preview (lối B, C).

## Cách làm

Vercel đọc `git.deploymentEnabled` trong `vercel.json` **ở Root Directory của dự án**, trên chính commit được
đẩy. Luật y hệt `apps/agent-okr/vercel.json` (đã chạy đúng từ 04/10): `{"**": false, "onehub": true}`.

Root Directory đo bằng `vercel api /v9/projects/<tên>` (GET, 16/10):

| Dự án | Root Directory | Tệp Vercel đọc | Hôm nay |
|---|---|---|---|
| `crm-onehub-app` | `apps/app` | `apps/app/vercel.json` | chưa có tệp |
| `crm-onehub-api` | *(trống — gốc kho)* | `vercel.json` ở gốc kho | chưa có tệp |
| `crm-onehub-agent` | `apps/agent` | `apps/agent/vercel.json` | chưa có tệp |
| `agent-okr` | `apps/agent-okr` | `apps/agent-okr/vercel.json` | đã tắt Preview |

Bẫy của api: `apps/api/vercel.json` **không** phải tệp Vercel đọc cho dự án api. Nó chỉ được
`apps/api/scripts/build-func.mjs` đọc để chép năm cron vào `.vercel/output/config.json`. Đặt khoá ở đó thì
không có gì đổi. Khoá phải vào `vercel.json` ở gốc kho — một tệp mới chỉ mang `$schema` và `git`, không mang
`crons` (cron vẫn một nguồn).

Ba tệp mới, mỗi tệp chỉ có `$schema` + `git.deploymentEnabled`. Không đổi biến môi trường, không đổi cài đặt
dự án trên Vercel, không dùng Ignored Build Step (sự cố 04/10: nó huỷ luôn Production — `docs/production.md`).

## Phép đo

1. **Luật cục bộ, chạy ở CI:** một phép thử mới `apps/agent-okr/test/vercel-preview-moi-du-an.spec.ts` đọc bảng
   bốn dự án → tệp ở `apps/agent-okr/test/vercel-du-an.ts`, áp luật Vercel (minimatch, «một `true` là đủ»,
   không mẫu khớp thì deploy) cho `onehub` và một bảng nhánh viết trước. Đặt ở `apps/agent-okr` vì gói này đã
   có `minimatch` và phép thử mẫu; tệp phép thử cũ giữ nguyên để không làm cũ hồ sơ đã ký
   `tat-preview-agent-okr` (E1–E4 của nó ghim đường tệp và tên ca).
2. **Bảng khớp Vercel thật:** rang đọc danh sách dự án Vercel nối kho (GET) và so Root Directory của từng dự án
   với bảng — dự án mới, hay dự án đổi Root Directory, làm rang đỏ.
3. **Phá thử trên bản sao:** mở `"**": true` ở từng tệp, dời khoá của api sang `apps/api/vercel.json`, đổi `**`
   thành `*` — mỗi đột biến đỏ đúng thông điệp ghim.
4. **Vercel thật:** commit đẩy lên của nhánh này có 0 deployment ở ba dự án; sau khi gộp, bản production dựng từ
   git cho sha gộp READY ở cả bốn dự án, và dự án api vẫn có năm cron.

## Sau gộp

Gộp trong giờ chủ kho thức (đổi cấu hình triển khai production). Rồi: bốn bản production READY · đẩy một
nhánh thử ra 0 Preview · đếm lại sau 7 ngày (23/10) phải bằng 0. Bản ghi `DATABASE_URL` của đích preview thôi
quan trọng; gỡ nó là việc tuỳ chọn của chủ kho.
