# Khoá cũ không mở được khoá mới — kế hoạch thực thi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người không còn là thành viên không dùng được khoá API còn bật để tạo, sửa hay bật lại khoá qua `/api/auth/api-key/*`; khoá còn bật của họ được tắt một lần.

**Architecture:** Phép kiểm tư cách `canhKhoaApi` rời `hooks.before` chung của Better Auth, thành một plugin nhỏ đặt ngay sau `apiKey(...)` — nên nó chạy sau khi plugin khoá dựng phiên từ header và hỏi đúng danh tính endpoint thực thi. Một `migration` chỉ-dữ-liệu tắt khoá còn bật của mọi người không có dòng `member`, có chốt khi bảng thành viên rỗng.

**Tech Stack:** Better Auth 1.6.25 + `@better-auth/api-key` 1.6.25, Prisma 7 (PostgreSQL), NestJS, bun test, supertest.

**Spec:** `docs/superpowers/specs/2026-09-23-khoa-cu-khong-mo-khoa-moi-design.md` · hồ sơ `_acceptance/khoa-cu-khong-mo-khoa-moi/`

## Global Constraints

- Không viết chú thích trong mã — mã mới lẫn mã sửa (`AGENTS.md`).
- Thông điệp từ chối là hằng `NOT_A_MEMBER` của `@crm/auth`, không chuỗi mới.
- Lượt dọn TẮT khoá (`enabled = false`), không xoá dòng.
- Bộ chứng từ gốc kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
- Bài đỏ đã có trong `apps/api/test/go-la-cat-quyen.spec.ts` (7 ca mới, 2 ca siết); chạy đỏ 23/09: 6 fail / 10 pass.
- Lệnh xem trước `packages/db/scripts/xem-truoc-luot-don.ts` và bộ đọc `migration` dùng chung `packages/db/scripts/luot-don-sql.ts` đã viết ở S1 (theo phản biện context sạch).

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `packages/auth/src/canh-khoa-api.ts` | phép kiểm + plugin bọc nó |
| `packages/auth/src/auth.ts` | gắn plugin sau `apiKey(...)`, bỏ khỏi móc chung |
| `packages/db/prisma/migrations/20260923150000_tat_khoa_nguoi_ngoai_kho/migration.sql` | lượt dọn một lần |
| `packages/db/scripts/luot-don-sql.ts` | bộ đọc `migration` dùng chung (đã viết ở S1) |
| `packages/db/scripts/xem-truoc-luot-don.ts` | lệnh xem trước chỉ-đọc (đã viết ở S1) |
| `docs/api.md` | luật đọc cho người sau |
| `apps/api/test/go-la-cat-quyen.spec.ts` | đã viết ở S1 |

---

### Task 1: Phép kiểm chạy sau plugin khoá

Phục vụ E1, E2, E3, E4, E8. `independent: false` (Task 3 viết lại tài liệu theo nó).

**Files:**
- Modify: `packages/auth/src/canh-khoa-api.ts`
- Modify: `packages/auth/src/auth.ts:12,129-135,247-260`
- Test: `apps/api/test/go-la-cat-quyen.spec.ts` (đã có)

**Interfaces:**
- Produces: `canhKhoaApiPlugin(): BetterAuthPlugin` với `id: "canh-khoa-api"`; `canhKhoaApi(ctx: CtxTruoc): Promise<void>` giữ chữ ký.

- [ ] **Step 1: Chạy bài đỏ**

Run: `bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts -t header-"`
Expected: 3 fail (`header-tao-khoa`, `header-bat-lai-khoa`, `header-lan-cookie`), 1 pass (`header-doi-chung`).

- [ ] **Step 2: Viết plugin**

`packages/auth/src/canh-khoa-api.ts`:

```ts
import type { BetterAuthPlugin } from "better-auth";
import {
	APIError,
	createAuthMiddleware,
	getSessionFromCtx,
} from "better-auth/api";
import { NOT_A_MEMBER, workspaceRoleOf } from "./organization";
import type { CtxTruoc } from "./slack-connect";

const API_KEY_PATH_PREFIX = "/api-key/";

export async function canhKhoaApi(ctx: CtxTruoc): Promise<void> {
	if (!ctx.path.startsWith(API_KEY_PATH_PREFIX)) return;

	const session = await getSessionFromCtx(ctx, { disableCookieCache: true });
	if (!session) return;

	if (!(await workspaceRoleOf(session.user.id))) {
		throw new APIError("FORBIDDEN", { message: NOT_A_MEMBER });
	}
}

export function canhKhoaApiPlugin() {
	return {
		id: "canh-khoa-api",
		hooks: {
			before: [
				{
					matcher: (ctx) => ctx.path.startsWith(API_KEY_PATH_PREFIX),
					handler: createAuthMiddleware(canhKhoaApi),
				},
			],
		},
	} satisfies BetterAuthPlugin;
}
```

- [ ] **Step 3: Gắn plugin sau `apiKey(...)`**

`packages/auth/src/auth.ts`: import `canhKhoaApiPlugin` thay cho `canhKhoaApi`; bỏ dòng `await canhKhoaApi(ctx);` khỏi `hooks.before`; thêm `canhKhoaApiPlugin(),` là phần tử ngay sau `apiKey({...}),` trong `plugins`.

- [ ] **Step 4: Chạy lại**

Run: `bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts"`
Expected: 13 pass, 3 fail (`don-mot-lan`, `don-bang-rong`, `xem-truoc-dung-so` — Task 2).

- [ ] **Step 5: Phá thử (luật đo hai chiều)**

Trong cây làm việc, tạm đặt `canhKhoaApiPlugin(),` TRƯỚC `apiKey({...}),` → chạy `-t header-` → ba ca header đỏ với thông điệp «chi bang header khoa cua nguoi ngoai kho van qua» / «cookie thanh vien che mat header khoa». Tạm bỏ hẳn plugin → chạy `-t khoa-moi` → đỏ ở hàng `quaAuth`/`batLai`. Hoàn lại, xác nhận `git diff packages/auth` chỉ còn thay đổi của Step 2–3. Ghi mỗi lượt phá thử (thay đổi tạm, lệnh, mã thoát, dòng thông điệp ghim) vào `_acceptance/khoa-cu-khong-mo-khoa-moi/evidence/pha-thu.md` — E1–E3 trỏ tới tệp này.

- [ ] **Step 6: Commit**

```bash
git add packages/auth/src/canh-khoa-api.ts packages/auth/src/auth.ts
git commit -m "fix(auth): phep kiem khoa API hoi dung danh tinh sau khi plugin khoa dung phien"
```

### Task 2: Lượt dọn một lần

Phục vụ E5, E6, E9. `independent: true` (chỉ chạm thư mục migration).

**Files:**
- Create: `packages/db/prisma/migrations/20260923150000_tat_khoa_nguoi_ngoai_kho/migration.sql`

- [ ] **Step 1: Chạy bài đỏ**

Run: `bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts -t don-"`
Expected: 2 fail, «can dung mot migration *_tat_khoa_nguoi_ngoai_kho, thay 0»; cùng lúc `-t xem-truoc-dung-so` fail.

- [ ] **Step 2: Viết migration**

```sql
UPDATE "apikey" SET "enabled" = false, "updatedAt" = NOW()
WHERE "enabled" IS DISTINCT FROM false
  AND EXISTS (SELECT 1 FROM "member" WHERE "organizationId" = 'workspace')
  AND NOT EXISTS (
    SELECT 1 FROM "member" m
    WHERE m."userId" = "apikey"."referenceId" AND m."organizationId" = 'workspace'
  );
```

- [ ] **Step 3: Chạy lại**

Run: `bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts -t 'don-|xem-truoc'"`
Expected: 3 pass (mỗi lượt `bun run test` dựng cơ sở dữ liệu riêng bằng `migrate deploy`, nên migration mới được áp).

- [ ] **Step 4: Phá thử**

Tạm bỏ vế `NOT EXISTS` → `don-mot-lan` đỏ (c1 false). Tạm bỏ vế `EXISTS` → `don-bang-rong` đỏ, «lan ghi danh dau se mat het khoa». Tạm đổi `IS DISTINCT FROM false` thành `= true` → `don-mot-lan` đỏ (b2 null). Tạm cho `menhDeLuotDon` cắt ở dòng đầu của mệnh đề → `xem-truoc-dung-so` đỏ, thông điệp in hai con số lệch. Hoàn lại; ghi các lượt vào `evidence/pha-thu.md`.

- [ ] **Step 5: Kiểm schema không trôi**

Run (cùng lệnh `apps/api/scripts/build-func.mjs` chạy sau `migrate deploy`, trỏ cơ sở dữ liệu dev đã áp migration): `cd packages/db && bunx prisma migrate deploy && bunx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code`
Expected: exit 0 — migration chỉ ghi dữ liệu, không trôi schema.

- [ ] **Step 6: Commit**

```bash
git add packages/db/prisma/migrations/20260923150000_tat_khoa_nguoi_ngoai_kho
git commit -m "feat(db): tat mot lan khoa API con bat cua nguoi khong con la thanh vien"
```

### Task 3: Tài liệu và phá thử hai bài siết

Phục vụ E7, E8. `independent: false`.

**Files:**
- Modify: `docs/api.md:63-65`

- [ ] **Step 1: Sửa dòng về khoá trong `docs/api.md`**

Thay bullet «A non-member cannot create, update or re-enable a key…» bằng:

```md
- **A non-member cannot create, update or re-enable a key** through Better Auth's
  own `/api-key/*` endpoints either. `canhKhoaApiPlugin` sits right after `apiKey()`
  in `plugins`, so its check runs once the key plugin has turned an `x-api-key`
  header into a session: it asks about the identity the endpoint will act as — the
  key's owner when a key is sent, the cookie's otherwise. Moving it before `apiKey()`,
  or back into `hooks.before`, lets a key alone through. A server-side call with no
  session is untouched. Keys a non-member still held when this shipped were disabled
  once by the `tat_khoa_nguoi_ngoai_kho` migration.
```

- [ ] **Step 2: Phá thử E7**

Tạm bỏ lệnh tắt khoá trong `WorkspaceService.removeMember` → chạy `-t go-tat-khoa` → đỏ ở vế `{status, loiKhoa}` (nhận `{403, null}`), thông điệp «tu choi o tang khoa, khong phai o phep kiem tu cach». Hoàn lại.

- [ ] **Step 3: Phá thử E8 — hàng đối chứng mới**

Tạm thêm vào `canhKhoaApi` một nhánh từ chối mọi `/api-key/update` → `-t khoa-moi` đỏ ở «thanh vien khong bat lai duoc khoa cua chinh minh». Hoàn lại.

- [ ] **Step 4: Commit**

```bash
git add docs/api.md
git commit -m "docs(api): phep kiem khoa API la plugin dung sau apiKey()"
```

### Task 4: Bộ chứng đủ năm lệnh

Phục vụ mọi eval (lệnh suite). `independent: false`.

- [ ] **Step 1:** `bun run test` — xanh.
- [ ] **Step 2:** `bun run check-types` — xanh.
- [ ] **Step 3:** `bun run lint` và `bun run lint:slop` — xanh.
- [ ] **Step 4:** `bun run build` — xanh.
- [ ] **Step 5:** Commit bài kiểm và cấu hình nếu còn chưa commit:

```bash
git add apps/api/test/go-la-cat-quyen.spec.ts packages/db/scripts/luot-don-sql.ts packages/db/scripts/xem-truoc-luot-don.ts _acceptance/config.yaml
git commit -m "test(khoa-cu-khong-mo-khoa-moi): bai do cho khoa chi bang header, luot don, siet E6 E7"
```

### Sau S4 — ghim lại hồ sơ nguồn

`packages/auth/src/auth.ts` và `go-la-cat-quyen.spec.ts` nằm trong `paths` của `go-la-cat-quyen-that`, nên bằng chứng của nó trôi. Ghim lại bằng làn máy ở HEAD trước khi mở PR:

```bash
node "$WORKFLOWS_DIR/../scripts/repin-lane.mjs" --root . --slug go-la-cat-quyen-that --reason "auth.ts doi thu tu moc khoa API (khoa-cu-khong-mo-khoa-moi)" --write
```

## Self-review

- Mỗi mục «Đổi gì» của spec có task: plugin (T1), migration (T2), docs (T3), bài kiểm và cấu hình (T4, đã viết ở S1).
- Tên nhất quán: `canhKhoaApiPlugin`, `canhKhoaApi`, `DUOI_LUOT_DON = "_tat_khoa_nguoi_ngoai_kho"`, `kcm_*`.
- Task 2 độc lập nhưng một mình nó — không đủ hai task độc lập để chạy song song; S3 đi tuần tự.
