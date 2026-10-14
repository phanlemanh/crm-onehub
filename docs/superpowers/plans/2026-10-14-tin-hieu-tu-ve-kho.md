# Tín hiệu tự về kho (TH1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một lịch chạy hai lần mỗi ngày kéo tín hiệu về bằng một khoá API chỉ làm được đúng việc đó, đẩy tệp lên nhánh hàng chờ và giữ một PR đứng mở — không bao giờ tự gộp.

**Architecture:** Khoá chỉ-kéo là cấu hình khoá thứ hai (`configId: "keo-tin-hieu"`, `enableSessionForAPIKeys: false`) của `@better-auth/api-key`, nên móc trước của thư viện từ chối nó ở mọi đường đọc phiên. Một router tRPC riêng `tinHieuLich` có middleware riêng xác minh khoá bằng `verifyApiKey` rồi gọi lại `TinHieuService.keoVe` của LT2. `scripts/tin-hieu/lich.ts` dựng nhánh hàng chờ trên đỉnh `onehub` và giữ PR qua `gh`, chạy trong `.github/workflows/tin-hieu-keo-ve.yml`.

**Tech Stack:** Bun, NestJS + nestjs-trpc, better-auth 1.x + `@better-auth/api-key` 1.6.25 (đã vá), Prisma, Next (apps/app), GitHub Actions, `gh`.

**Spec:** `docs/superpowers/specs/2026-10-14-tin-hieu-tu-ve-kho-design.md` · hợp đồng `_acceptance/tin-hieu-tu-ve-kho/contract.md` (đã duyệt) · bộ đo `_acceptance/tin-hieu-tu-ve-kho/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Hằng số tinh chỉnh nằm trong một module theo khu: hằng khoá trong `packages/auth/src/api-keys.ts`, hằng lịch trong `scripts/tin-hieu/lich.ts` một object `LICH` duy nhất.
- Parse ở biên bằng Zod: phản hồi kéo về đọc bằng `docPhanHoiKeoVe`; không `Record<string, unknown>`.
- Một `.env` ở gốc; biến mới `CRM_KHOA_KEO_TIN_HIEU` khai trong `.env.example` có ghi chú.
- `packages/ui` là nguồn giao diện duy nhất; không `className` đổi màu/góc/khoảng cách của component `@crm/ui`.
- Không đổi đường `POST /rest/tin-hieu/keo-ve` và thủ tục `tinHieu.keoVe` của LT2; đầu ra `keoVeOutput` chỉ được THÊM trường tuỳ chọn (bộ đo LT2 dùng `bocPhanHoiKeoVe(tep)` với khuôn cũ).
- Không migration: cột `apikey.configId` (`NOT NULL DEFAULT 'default'`) và `apikey.permissions` đã có.
- `apps/api/src/generated/server.ts` chỉ sinh bằng `cd apps/api && bun run trpc:generate`; router nhập tên khuôn gốc, không `import … as` (bẫy trpc:generate).
- Tệp kit chép vào kho (`scripts/product-map.mjs`, `scripts/lo-trinh.mjs`, `lib/*.cjs`) không sửa.
- Mọi bài chạm DB chạy qua `bun run test -- "<lệnh>"` (kho thử riêng mỗi lượt), không `bun test` trần.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture (xanh trên vật lành, đỏ với thông điệp ghim trên bản sao bị phá) — verify của task phải chạy lượt phá-thử.

## Review Focus

1. Khoá chỉ-kéo gửi tới cầu tác nhân `/eve/...` của app — người chờ: 401/không phiên. Ô 11 của E4 + răng E4c phủ (Task 3, Task 4).
2. Chủ khoá bị hạ vai giữa hai lượt lịch — người chờ: lượt sau 403, không đóng dấu. Ô «đổi vai» của E5 (Task 3).
3. PR hàng chờ bị đóng tay không gộp — người chờ: lượt sau mở PR mới. Ô 5 của E9 (Task 6).
4. Hai lượt lịch chồng nhau (chạy tay đúng lúc lịch) — người chờ: lượt sau chờ, không đẩy đè giữa chừng. `concurrency` với `cancel-in-progress: false`, dòng 4 của E10b (Task 7).
5. Khoá chứa ký tự lạ hay khoảng trắng đầu/cuối trong bí mật — người chờ: lệnh cắt khoảng trắng, không in khoá khi lỗi. Ô «không in khoá» của E7 có thêm biến thể khoá có `\n` cuối (Task 5).

---

## Thứ tự và độc lập

| Task | Phục vụ | independent | Vì sao |
|---|---|---|---|
| 1 Khoá chỉ-kéo ở `packages/auth` | E2–E6 | false | nền của mọi task máy chủ |
| 2 Đầu ra kéo về thêm lúc đóng dấu | E3, E7 | false | Task 3, 5 dùng trường mới |
| 3 Đường kéo theo lịch + tạo khoá có loại | E2, E3, E4, E4b, E5, E6 | false | cần Task 1, 2; sinh `generated/server.ts` cho Task 4, 6 |
| 4 Răng liệt kê đường đọc khoá | E4c | false | đọc bảng ô của Task 3 |
| 5 Lệnh kéo về chọn đường + «chờ lâu nhất» | E7 | false | cần Task 2 |
| 6 Lượt lịch: nhánh hàng chờ + PR | E8, E9, E10 | false | cần Task 5 |
| 7 Tệp lịch chạy, T1, hai răng | E10b, E11 | false | cùng sửa `_acceptance/config.yaml` với Task 6 |
| 8 Trang Khoá API theo vai | E1, E1c | false | cần `generated/server.ts` của Task 3 |
| 9 Răng đo màn | E1b | false | cần Task 8 |
| 10 Tài liệu | E11b | false | viết sau khi mã chốt |

Mọi task `independent: false` — chạy tuần tự trong vòng chính (không fan-out).

---

### Task 1: Khoá chỉ-kéo ở `packages/auth`

**Files:**
- Modify: `packages/auth/src/api-keys.ts`
- Modify: `packages/auth/src/auth.ts:84-97,284`
- Create: `packages/auth/src/khoa-keo-tin-hieu.ts`
- Modify: `packages/auth/src/index.ts` (xuất mới)

**Interfaces — Produces:**
- `KHOA_KEO_TIN_HIEU = { configId: "keo-tin-hieu", quyen: { tinHieu: ["keoVe"] } } as const`
- `LOAI_KHOA_API = ["toan-quyen", "keo-tin-hieu"] as const`, `type LoaiKhoaApi`
- `loaiKhoaTuConfig(configId: string | null): LoaiKhoaApi`
- `taoKhoaKeoTinHieu(o: { userId: string; name: string; expiresIn: number | null }): Promise<{ id; name; start; key; enabled; createdAt; lastRequest; expiresAt }>`
- `xacMinhKhoaKeoTinHieu(key: string): Promise<{ apiKeyId: string; userId: string } | null>`

- [ ] **Step 1:** Thêm vào `api-keys.ts`:

```ts
export const KHOA_KEO_TIN_HIEU = {
	configId: "keo-tin-hieu",
	quyen: { tinHieu: ["keoVe"] },
} as const;

export const LOAI_KHOA_API = ["toan-quyen", "keo-tin-hieu"] as const;

export type LoaiKhoaApi = (typeof LOAI_KHOA_API)[number];

export function loaiKhoaTuConfig(configId: string | null): LoaiKhoaApi {
	return configId === KHOA_KEO_TIN_HIEU.configId ? "keo-tin-hieu" : "toan-quyen";
}
```

- [ ] **Step 2:** `auth.ts`: đổi `apiKey(API_KEY_PLUGIN_OPTIONS)` thành `apiKey([API_KEY_PLUGIN_OPTIONS, API_KEY_KEO_TIN_HIEU_OPTIONS])`, với `API_KEY_PLUGIN_OPTIONS` thêm `configId: "default"` và

```ts
export const API_KEY_KEO_TIN_HIEU_OPTIONS: ApiKeyConfigurationOptions = {
	...API_KEY_PLUGIN_OPTIONS,
	configId: KHOA_KEO_TIN_HIEU.configId,
	enableSessionForAPIKeys: false,
};
```

- [ ] **Step 3:** `khoa-keo-tin-hieu.ts`:

```ts
import { auth } from "./auth";
import { KHOA_KEO_TIN_HIEU } from "./api-keys";

export async function taoKhoaKeoTinHieu(o: { userId: string; name: string; expiresIn: number | null }) {
	return auth.api.createApiKey({
		body: {
			userId: o.userId,
			name: o.name,
			expiresIn: o.expiresIn,
			configId: KHOA_KEO_TIN_HIEU.configId,
			permissions: { tinHieu: [...KHOA_KEO_TIN_HIEU.quyen.tinHieu] },
		},
	});
}

export async function xacMinhKhoaKeoTinHieu(key: string) {
	const kq = await auth.api.verifyApiKey({
		body: {
			key: key.trim(),
			configId: KHOA_KEO_TIN_HIEU.configId,
			permissions: { tinHieu: [...KHOA_KEO_TIN_HIEU.quyen.tinHieu] },
		},
	});
	if (!kq.valid || !kq.key) return null;
	return { apiKeyId: kq.key.id, userId: kq.key.referenceId };
}
```

(Đọc chữ ký thật của `verifyApiKey` trong `dist/index.mjs` dòng ~1954 trước khi viết — trường trả về có thể là `key.userId` thay `referenceId`; dùng đúng tên thư viện.)

- [ ] **Step 4:** Verify: `bun run check-types --filter=@crm/auth` và `bun run test -- "cd packages/auth && bun test test/khoa-api-ghi-thua.spec.ts"` → xanh (bản vá `lastRequestUpdateIntervalMs` còn áp cho cấu hình mặc định).
- [ ] **Step 5:** Commit `feat(tin-hieu-tu-ve-kho): cấu hình khoá chỉ-kéo không mở phiên`.

### Task 2: Đầu ra kéo về thêm lúc đóng dấu

**Files:** Modify `packages/validation/src/tin-hieu.ts:97-111`, `apps/api/src/tin-hieu/tin-hieu.service.ts:116-141`; Test `packages/validation/test/tin-hieu.spec.ts` (thêm ca).

**Interfaces — Produces:** `keoVeOutput` thêm `dongDauLuc?: string | null` (cấp ngoài) và `keoVeLuc?: string` (mỗi mục); `bocPhanHoiKeoVe(tep, dongDauLuc?: string | null)`.

- [ ] **Step 1:** Ca test: `keoVeOutput.parse(bocPhanHoiKeoVe(tep))` vẫn chạy với khuôn cũ (không trường mới); `bocPhanHoiKeoVe(tep, iso)` giữ `dongDauLuc`.
- [ ] **Step 2:** Sửa schema (`.optional()` cho cả hai trường, `z.string().datetime()`), và service: lấy `const luc = new Date()` trước `updateMany`, `const so = await tx.tinHieu.updateMany(...)`, `findMany` chọn thêm `keoVeLuc`; trả `bocPhanHoiKeoVe(rows.map(h => ({ id, tep, phongBan, keoVeLuc: h.keoVeLuc!.toISOString() })), so.count > 0 ? luc.toISOString() : null)`.
- [ ] **Step 3:** Verify: `cd packages/validation && bun test test/tin-hieu.spec.ts` và `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/tin-hieu.spec.ts -t gth-keo-ve"` → xanh (LT2 không đổi).
- [ ] **Step 4:** Commit.

### Task 3: Đường kéo theo lịch và tạo khoá có loại

**Files:**
- Create: `apps/api/src/trpc/middlewares/khoa-keo-tin-hieu.middleware.ts`
- Create: `apps/api/src/tin-hieu/tin-hieu-lich.router.ts`
- Modify: `apps/api/src/tin-hieu/tin-hieu.module.ts`, `apps/api/src/trpc/trpc.module.ts` (khai middleware)
- Modify: `apps/api/src/api-keys/api-keys.contracts.ts`, `api-keys.service.ts`, `api-keys.router.ts`
- Modify: `apps/api/test/vai-chi-okr.spec.ts` (chỉ thêm), `apps/api/src/generated/server.ts` (sinh)
- Create: `apps/api/test/khoa-keo-tin-hieu.spec.ts`

**Interfaces — Consumes:** Task 1, Task 2. **Produces:** REST `POST /rest/tin-hieu/lich/keo-ve`; `apiKeys.create` input `loai?: LoaiKhoaApi`; `apiKeys.list` mỗi hàng `loai: LoaiKhoaApi` và cấp ngoài `taoDuocKeoTinHieu: boolean`.

- [ ] **Step 1: Test trước** — `khoa-keo-tin-hieu.spec.ts` theo khuôn `tin-hieu.spec.ts` (`createApp`, `gieoThanhVien`, `mintPhien`, kho thử của lượt), năm `describe`: `tvk-tao` (12 ô 4 vai × 3 loại), `tvk-lich` (dòng 1–5, 3b của E3), `tvk-duong-khac` (11 đường, ma trận đọc từ `_acceptance/tin-hieu-tu-ve-kho/rang/bang-duong-doc-khoa.json` — tệp Task 4 cũng đọc, để hai bên dùng một danh mục), `tvk-tu-choi` (8 ô), `tvk-khoa-thuong`. Mọi giá trị so sánh rút từ `KHOA_KEO_TIN_HIEU`. Ô 11: `await auth.api.getSession({ headers: new Headers({ [API_KEY_HEADER]: khoa }) })` trong `try` — chấp nhận `null` hoặc `APIError` mã 401, mọi kết quả khác đỏ với thông điệp `"khoa chi keo mo duoc phien"`.
- [ ] **Step 2:** Chạy `bun run test -- "cd apps/api && bun test test/khoa-keo-tin-hieu.spec.ts"` → đỏ vì chưa có đường.
- [ ] **Step 3: Middleware**

```ts
@Injectable()
export class KhoaKeoTinHieuMiddleware implements TRPCMiddleware {
	async use(opts: MiddlewareOptions): Promise<MiddlewareResponse> {
		const ctx = opts.ctx as BaseTrpcContext;
		const tho = ctx.req?.headers[API_KEY_HEADER];
		const key = typeof tho === "string" ? tho : null;
		if (!key) throw new TRPCError({ code: "UNAUTHORIZED" });
		const khoa = await xacMinhKhoaKeoTinHieu(key).catch(() => null);
		if (!khoa) throw new TRPCError({ code: "UNAUTHORIZED" });
		const role = await workspaceRoleOf(khoa.userId);
		if (!laQuanTriWorkspace(role)) throw new TRPCError({ code: "FORBIDDEN" });
		setRequestUserId(khoa.userId);
		return opts.next({ ctx: { ...ctx, khoaKeoTinHieu: { ...khoa, role } } });
	}
}
```

Kiểu ctx mới `KhoaTrpcContext` khai trong `context.types.ts`.
- [ ] **Step 4: Router** `@Router({ alias: "tinHieuLich" }) @UseMiddlewares(KhoaKeoTinHieuMiddleware)`, một `@Mutation({ output: keoVeOutput, meta: restMeta("POST", "/tin-hieu/lich/keo-ve", ["Signals"]) }) keoVe(@Ctx() ctx)` gọi `this.tinHieu.keoVe({ id: ctx.khoaKeoTinHieu.userId, role: ctx.khoaKeoTinHieu.role })` và log `{ message: "tin-hieu.keo-ve-lich", apiKeyId, userId }` (không khoá, không nội dung).
- [ ] **Step 5: apiKeys** — contract `loai: z.enum(LOAI_KHOA_API).optional()`; service `create`: `loai === "keo-tin-hieu"` → `if (!laQuanTriWorkspace(role)) throw new ForbiddenException()` rồi `taoKhoaKeoTinHieu({ userId, name, expiresIn })`; còn lại giữ đường cũ. `list` chọn thêm `configId` → `loai: loaiKhoaTuConfig(row.configId)`, trả `taoDuocKeoTinHieu: laQuanTriWorkspace(role)`. Vai lấy từ `docPhamViYeuCau(ctx).role` ở router.
- [ ] **Step 6:** `vai-chi-okr.spec.ts`: thêm `"tinHieuLich"` vào danh sách router và kỳ vọng riêng «mọi phiên đều 401» cho `tinHieuLich.keoVe`; thêm `"apiKeys.create"` biến thể `loai`. Chạy `cd apps/api && bun run trpc:generate`.
- [ ] **Step 7:** Verify: `bun run test -- "cd apps/api && bun test test/khoa-keo-tin-hieu.spec.ts test/vai-chi-okr.spec.ts test/tin-hieu.spec.ts"` xanh; phá-thử: bản sao đặt `enableSessionForAPIKeys: true` cho cấu hình chỉ-kéo → ô 1, 11 đỏ đúng thông điệp; bản sao gắn `PhamViChungMiddleware` cho router lịch → E4b đỏ. Commit phá-thử TRƯỚC khi `git checkout` (bẫy mất sửa chưa commit).
- [ ] **Step 8:** Commit.

### Task 4: Răng liệt kê đường đọc khoá (E4c)

**Files:** Create `_acceptance/tin-hieu-tu-ve-kho/rang/duong-doc-khoa.mjs`, `_acceptance/tin-hieu-tu-ve-kho/rang/bang-duong-doc-khoa.json`.

- [ ] **Step 1:** `bang-duong-doc-khoa.json`: `{ "duong": [{ "o": 1, "ten": "...", "cho": ["apps/api/src/trpc/trpc.context.ts"] }, …], "mien": [{ "cho": "apps/api/src/trpc/middlewares/khoa-keo-tin-hieu.middleware.ts", "ly_do": "chính cổng của đường lịch" }] }`.
- [ ] **Step 2:** Răng: gốc kho = `resolve(dirname(fileURLToPath(import.meta.url)), "../../..")`; quét `.ts/.tsx/.mjs` dưới `apps/api/src`, `apps/app` (bỏ `node_modules`, `.next*`, `test`, `app/proto`), `apps/agent/agent` (bỏ `.eve`), `packages/auth/src` tìm `getSession(`, `verifyApiKey`, `API_KEY_HEADER`, `"x-api-key"`; đường `/api-key/*` lấy từ `Object.values(apiKey().endpoints).map(e => e.path)` của plugin thật. Mỗi chỗ phải có trong `cho` của một ô hoặc `mien`; in `chỗ → ô`; exit 1 với `duong doc khoa chua co o: <chỗ>` khi thiếu, và khi một `cho` không còn trong mã. `--pha-thu`: chép cây vào tmpdir (`git archive HEAD`), thêm tệp có `"x-api-key"`, chạy lại trên bản sao, đòi exit 1 với đúng thông điệp.
- [ ] **Step 3:** Verify `node _acceptance/tin-hieu-tu-ve-kho/rang/duong-doc-khoa.mjs` exit 0 và `--pha-thu` exit 0 (đã thấy đỏ). Commit.

### Task 5: Lệnh kéo về chọn đường và «chờ lâu nhất» (E7)

**Files:** Modify `scripts/tin-hieu/keo-ve.ts`; Create `scripts/tin-hieu/test/keo-ve-lich.test.ts`.

**Interfaces — Produces:** `chayKeoVe({ root, url, key, khoaLich, now })` — `khoaLich` ưu tiên; đường lịch `/rest/tin-hieu/lich/keo-ve`; `tongKet` thêm dòng `đóng dấu lượt này: n · chờ lâu nhất: x giờ` (n = số tệp có `keoVeLuc === dongDauLuc`, x = làm tròn xuống giờ của max(`dongDauLuc − tep.luc`)); `dongDauLuc` null → `đóng dấu lượt này: 0`. Lỗi thiếu biến: `thiếu biến CRM_KHOA_KEO_TIN_HIEU hoặc CRM_API_KEY`. Khoá `.trim()`; không chuỗi lỗi nào chứa khoá.

- [ ] Step 1 test (4 ô env + tổng kết + biến thể khoá có `\n` cuối, máy chủ giả phát bằng `bocPhanHoiKeoVe` + `keoVeOutput.parse`) → đỏ; Step 2 sửa; Step 3 `bun test scripts/tin-hieu/test/keo-ve-lich.test.ts scripts/tin-hieu/test/keo-ve.test.ts` xanh (LT2 vẫn xanh); phá-thử hai chiều đỏ; Step 4 commit.

### Task 6: Lượt lịch — nhánh hàng chờ và PR (E8, E9, E10)

**Files:** Create `scripts/tin-hieu/lich.ts`, `scripts/tin-hieu/test/lich.test.ts`; Modify `package.json` (`"tin-hieu:lich": "bun scripts/tin-hieu/lich.ts"`).

**Interfaces — Produces:** `LICH = { nhanhChinh: "onehub", nhanhHangCho: "tin-hieu/keo-ve", tieuDePr: "Tín hiệu kéo về", thongDiep: { camMoPr, … } } as const`; `chayLich({ goc, env, gh: string, git: string }): Promise<{ ma: 0 | 1 | 2; dong: string[] }>`.

Luồng: (1) `chayKeoVe` trên cây làm việc của đỉnh `origin/onehub` với `khoaLich = env.CRM_KHOA_KEO_TIN_HIEU`; `ma ≠ 0` → trả ngay, không lệnh git/gh nào. (2) `git status --porcelain tin-hieu/crm` rỗng → không commit; ngược lại `git switch -C tin-hieu/keo-ve origin/onehub`, `git add tin-hieu/crm`, commit tác giả `github-actions[bot]`, chỉ chạm `tin-hieu/crm/**`. (3) So `git rev-parse HEAD^{tree}` với `origin/tin-hieu/keo-ve^{tree}` (nếu có): khác → `git push --force origin HEAD:tin-hieu/keo-ve`. (4) Nhánh hàng chờ trên origin khác cây `origin/onehub` → `gh pr list --head tin-hieu/keo-ve --state open --json number`; rỗng → `gh pr create --base onehub --head tin-hieu/keo-ve --title "TH1 · chore(tin-hieu-keo-ve): Tín hiệu kéo về" --body …`; lỗi chứa `not permitted to create` → ma 1 với `LICH.thongDiep.camMoPr` (gọi tên «Allow GitHub Actions to create and approve pull requests»). Không bao giờ gọi `gh pr merge`.

- [ ] Step 1: `lich.test.ts` — kho git thật trong tmpdir (origin trần + bản sao), `gh` giả là script ghi lệnh vào tệp và trả JSON cấu hình được, máy chủ giả trả MỌI tín hiệu còn lại (cả đã dấu) bằng `bocPhanHoiKeoVe`; ba `describe` `tvk-nhanh` (6 dòng), `tvk-pr` (6 ô), `tvk-hong` (4 ô). Tệp đẩy lên được đọc bằng `kiemYeuCau` của `dieu-phoi/scripts/hinh-dang.mjs` (cùng hàm răng `vong-kit.mjs` của LT2 dùng). → đỏ.
- [ ] Step 2: viết `lich.ts`. Step 3: `bun test scripts/tin-hieu/test/lich.test.ts` xanh; phá-thử bốn chiều đỏ của E8–E10 (commit trước khi phá). Step 4: commit.

### Task 7: Tệp lịch chạy, T1 và hai răng (E10b, E11)

**Files:** Create `.github/workflows/tin-hieu-keo-ve.yml`, `_acceptance/tin-hieu-tu-ve-kho/rang/tep-lich.mjs`, `_acceptance/tin-hieu-tu-ve-kho/rang/t1.mjs`; Modify `_acceptance/config.yaml` (thêm `- "tin-hieu/crm/**"` vào `t1_skip_globs`, chỉ thêm).

```yaml
name: Tín hiệu kéo về
on:
  schedule:
    - cron: "0 21 * * *"
    - cron: "0 9 * * *"
  workflow_dispatch:
permissions:
  contents: write
  pull-requests: write
concurrency:
  group: tin-hieu-keo-ve
  cancel-in-progress: false
jobs:
  keo:
    if: github.repository == 'phanlemanh/crm-onehub'
    runs-on: ubuntu-24.04
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v5
        with:
          ref: onehub
          fetch-depth: 0
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - name: Kéo tín hiệu về nhánh hàng chờ
        env:
          CRM_API_URL: ${{ secrets.CRM_API_URL }}
          CRM_KHOA_KEO_TIN_HIEU: ${{ secrets.CRM_KHOA_KEO_TIN_HIEU }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: bun scripts/tin-hieu/lich.ts
```

(`bun-version` lấy đúng như `ci.yml` đang khai.)

- [ ] `tep-lich.mjs` đọc YAML bằng trình đọc `yaml` của kho, 6 dòng DUNG/SAI, `--pha-thu`. `t1.mjs` dựng `git worktree add` tạm, commit tệp tín hiệu, gọi `quyetDinh`/`docGlobT1`/`tepT1` của `.github/scripts/phan-loai.mjs` và `scripts/pre-merge-check.sh --base`, đối chứng tệp `scripts/tin-hieu/lich.ts`; dọn worktree khi xong. Verify cả hai exit 0 + `--pha-thu`. Commit.

### Task 8: Trang Khoá API theo vai (E1, E1c)

**Files:** Modify `apps/app/app/(app)/[slug]/settings/api-keys/{page.tsx,create-api-key-sheet.tsx,api-keys-table.tsx}`; Create `apps/app/test/khoa-api-loai.dom.tsx`.

- [ ] Trang: bỏ `laQuanTri={false}` tạm của S1; `CreateApiKeySheet` đọc `taoDuocKeoTinHieu` từ `trpc.apiKeys.list` (cùng truy vấn đã prefetch, đặt tờ trong `Suspense` của danh sách), truyền `loai` vào `create.mutate` khi `laQuanTri`; `CreatedApiKeyDialog` nhận `{ ...apiKey, loai }`; bảng: cột tên hiện `NhanLoaiKhoa` (`min-w-0` cho tên, nhãn `shrink-0`). Test DOM 8 ô vai × khổ theo E1 (mock trpc như `tin-hieu.dom.tsx`), chữ đọc từ `khoaApiMessages("vi")` và `("en")`. Verify `bun test …khoa-api-loai.dom.tsx`, `tvk_thiet_ke`, `bunx tsc --noEmit -p apps/app` (bỏ lỗi `PageProps` do typegen). Phá-thử ba chiều. Commit.

### Task 9: Răng đo màn (E1b)

**Files:** Create `_acceptance/tin-hieu-tu-ve-kho/rang/do-man.mjs` theo khuôn `_acceptance/gui-tin-hieu-trong-crm/rang/do-man.mjs` (`tien-de.mjs`, kho đo riêng, `BANG_CHUNG`), 6 ô E1b; owner tạo khoá chỉ-kéo thật qua tờ, đọc lại `apiKeys.list`. Verify chạy `tvk_do_man` qua khoá máy, mã 0. Commit.

### Task 10: Tài liệu (E11b)

**Files:** `docs/api.md` (mục «Tín hiệu» thêm khoá chỉ-kéo, đường lịch, nhánh hàng chờ, giới hạn CI của PR bot; bảng «Internal ingest» thêm một dòng nói vì sao đường lịch đứng ngoài `AuthMiddleware`), `CONTEXT.md` (mục «khoá chỉ kéo tín hiệu», «nhánh hàng chờ»), `.env.example` (`CRM_KHOA_KEO_TIN_HIEU` kèm ghi chú; giữ `CRM_API_KEY` cho lượt tay), ba việc cài một lần. Commit.

## Sau S3

- Ghim lại hồ sơ LT2 `gui-tin-hieu-trong-crm` (vật đổi: `keo-ve.ts`, `tin-hieu.ts` validation, service) bằng làn ghim qua khoá máy, trong cùng PR.
- `contract.status: implemented` → S4.
