# Tắt hẳn Preview của dự án Vercel agent-okr — thiết kế

Ngày: 2026-10-04 · Hồ sơ: `_acceptance/tat-preview-agent-okr/`

## Vì sao

Dự án Vercel `agent-okr` (Root `apps/agent-okr`) dựng 04/10 với mọi biến chỉ ở target
Production. Mọi bản Preview vì vậy chết ở postinstall `prisma generate` của `@crm/db`
(`PrismaConfigEnvError: DATABASE_URL`), và check «Vercel – agent-okr» đỏ ở mọi PR. Không gì gọi
bản Preview đó: app chỉ có `OKR_AGENT_URL` và bí mật cầu nối ở Production. Gói đã được
`acceptance.yml` dựng qua `bun run build`.

Cách thử trước: Ignored Build Step `[ "$VERCEL_ENV" != "production" ]` (PR #246). Nó huỷ luôn
cả Production — `readyStateReason` «The deployment was canceled because the Ignored Build Step
command is configured to skip this build.», không có log build — nên
hai merge không lên `agent-okr.vercel.app`. Đã gỡ và ghi lại ở PR #247.

## Cách làm

Tệp mới `apps/agent-okr/vercel.json`, chỉ hai khoá:

```json
{
	"$schema": "https://openapi.vercel.sh/vercel.json",
	"git": {
		"deploymentEnabled": {
			"**": false,
			"onehub": true
		}
	}
}
```

- Vercel đọc `vercel.json` ở Root Directory của dự án, tức `apps/agent-okr`, nên tệp chỉ tác
  động dự án agent-okr. Ba dự án khác không có tệp này ở gốc của chúng.
- Luật khớp tên nhánh bằng minimatch. Mẫu `*` không khớp dấu `/`, mà mọi nhánh làm việc ở kho
  này đều có `/`; vì vậy phải là `**`.
- Một nhánh khớp nhiều mẫu thì deploy khi ít nhất một mẫu khớp mang `true`. `onehub` khớp cả
  `**` lẫn `onehub`, nên Production vẫn deploy.
- Quyết theo tên nhánh, không theo biến môi trường — khác hẳn cách đã hỏng.
- `eve build` đọc `vercel.json` khi tìm tiền tố dịch vụ cùng deploy, và chỉ lấy khoá
  `services`/`experimentalServices*`. Tệp không có khoá đó thì eve đi tiếp như không có tệp.
  JSON hỏng thì `JSON.parse` ném và `eve build` đỏ — đây là rủi ro thật, có thước riêng.

`docs/setup.md` mục «Deploying `apps/agent-okr` to Vercel»: bảng thiết lập trỏ tới tệp này, bỏ
câu «check đỏ là bình thường», giữ lời dặn kiểm bản Production READY sau mỗi lần đổi.

## Cách đo

1. **Luật cục bộ** — `apps/agent-okr/test/vercel-trien-khai.spec.ts`, chạy trong `bun run test`
   của kho (CI giữ nó mãi). Đọc `vercel.json` thật, khớp bằng minimatch theo đúng luật Vercel,
   trên một bảng tên nhánh viết trước: `onehub` deploy; mọi nhánh khác (có `/`, không `/`, tiền
   tố trùng `onehub`) không deploy. Kèm kiểm tệp là JSON hợp lệ và chỉ có `$schema` + `git`.
2. **Phá-thử trong bản sao** — `rang/pha-thu.mjs` chép tệp và test vào `.acceptance-runs/`, đột
   biến từng cách (`**` → `*`, bỏ `onehub: true`, JSON hỏng), chạy test và đòi đỏ với thông điệp
   ghim tên nhánh hoặc tên ca.
3. **Vercel thật, Preview** — `rang/vercel-preview.mjs`: đo trên commit gần nhất chạm
   `apps/agent-okr/` (dự án bật «bỏ dự án không bị ảnh hưởng», nên sha không chạm thư mục đó
   không chứng gì). Đối chứng: GitHub đã nhận status Vercel của các dự án `crm-onehub-*` cho
   sha đó. Rồi đòi agent-okr không có deployment nào và không có status «Vercel – agent-okr»
   failure/error cho sha đó. Chiều đỏ: sha `9333acad` của nhánh #244, nơi agent-okr từng có
   Preview, phải bị thước gọi tên.
4. **Vercel thật, Production** — `rang/vercel-production.mjs`: bản Production của agent-okr do git
   tạo (`source: git`) cho một sha phải READY; bản deploy tay (`source: cli`) không tính. Chiều đỏ chạy được ngay: sha `226231c9` (bản bị huỷ) phải bị gọi tên
   CANCELED. Chiều xanh chỉ chạy được sau merge — làm ở S5, khai `status: not-run` trong S4.

## Không làm

- Không đặt `DATABASE_URL` cho Preview, không sửa `packages/db/prisma.config.ts`.
- Không dùng lại Ignored Build Step.
- Không sửa check đỏ của #231 và #214 — hai nhánh rẽ trước khi có `apps/agent-okr`; tự hết khi
  chúng trộn `onehub`.
- Không kiểm bản deploy tạo qua API có tuân `deploymentEnabled` không; đó là đường lui, không
  phải đường chính.
