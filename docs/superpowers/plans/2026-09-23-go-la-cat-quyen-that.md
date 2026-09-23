# Gỡ là cắt quyền thật — kế hoạch làm

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người đã bị gỡ khỏi workspace không còn đọc hay ghi dữ liệu CRM qua thủ tục của API, cầu REST, khoá API hay đường nối trợ lý.

**Architecture:** `AuthMiddleware` của tRPC đổi nghĩa thành «có phiên VÀ là thành viên», đọc dòng `member` tươi mỗi lời gọi; một `SignedInMiddleware` có tên chừa riêng `workspace.get` cho proxy. Lượt gỡ tắt khoá API trong cùng giao dịch; một móc `hooks.before` của Better Auth chặn `/api-key/*` cho người ngoài; route cầu nối trợ lý hỏi tư cách trước khi đúc token.

**Tech Stack:** NestJS + nestjs-trpc 2.13 (tRPC 11.18), Better Auth 1.6.25 + `@better-auth/api-key`, Prisma, Next.js route handler, bun test + supertest.

**Spec:** `docs/superpowers/specs/2026-09-23-go-la-cat-quyen-that-design.md` · hợp đồng `_acceptance/go-la-cat-quyen-that/contract.md` · evals `_acceptance/go-la-cat-quyen-that/evals.yaml`

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Không `console.log` trong `apps/api`; logger một object.
- Thông điệp từ chối tư cách là MỘT hằng: `NOT_A_MEMBER = "You are not a member of this workspace."` xuất từ `packages/auth/src/organization.ts` qua barrel `@crm/auth`. Không gõ lại chuỗi ở đâu khác, kể cả trong bài kiểm.
- Thứ tự trong chuỗi tRPC: middleware gắn bằng `@UseMiddlewares` chạy TRƯỚC `.input()` (nestjs-trpc `procedure.factory.js:61` trước `:93`), và trước mọi kiểm vai nằm trong service. Lời từ chối tư cách vì vậy đến trước lỗi đầu vào và trước 403 theo vai.
- Tập ngoại lệ không đòi tư cách: đúng `["sso.signInOptions", "workspace.get"]`.
- Lệnh chạy bài kiểm luôn qua `bun run test -- "<lệnh>"` từ gốc kho (mỗi lượt một cơ sở dữ liệu riêng).
- Cây này cần `.env` nối từ kho chính và `prisma generate` đã chạy (đã làm ở S1).

## File Structure

| File | Trách nhiệm |
|---|---|
| `packages/auth/src/organization.ts` | + hằng `NOT_A_MEMBER` |
| `packages/auth/src/index.ts` | xuất `NOT_A_MEMBER` |
| `packages/auth/src/canh-khoa-api.ts` (mới) | móc chặn `/api-key/*` cho người có phiên mà không là thành viên |
| `packages/auth/src/auth.ts` | gọi móc mới trong `hooks.before` |
| `apps/api/src/trpc/middlewares/auth.middleware.ts` | có phiên + là thành viên |
| `apps/api/src/trpc/middlewares/signed-in.middleware.ts` (mới) | chỉ có phiên — đường đọc tư cách |
| `apps/api/src/trpc/trpc.module.ts` | đăng ký + xuất `SignedInMiddleware` |
| `apps/api/src/workspace/workspace.router.ts` | middleware xuống mức thủ tục; `get` dùng `SignedInMiddleware` |
| `apps/api/src/workspace/workspace.service.ts` | `removeMember` tắt khoá trong giao dịch |
| `apps/app/app/eve/v1/[...path]/route.ts` | hỏi tư cách trước khi đúc token |
| `apps/api/test/go-la-cat-quyen.spec.ts` | E1–E7, E9, E10 |
| `apps/app/test/eve-cau-noi-thanh-vien.spec.ts` | E8 (đã viết, đã đỏ ở S1) |
| `docs/api.md` | luật mới của `AuthMiddleware`, `SignedInMiddleware`, khoá khi gỡ |

---

### Task 1: Lớp kiểm tư cách chặn-mặc-định + đường đọc tư cách

**independent: false** (mọi task sau dựa vào hằng và middleware của task này) · **phục vụ E1, E2, E3, E4, E5, E10**

**Files:**
- Modify: `packages/auth/src/organization.ts`, `packages/auth/src/index.ts`
- Modify: `apps/api/src/trpc/middlewares/auth.middleware.ts`
- Create: `apps/api/src/trpc/middlewares/signed-in.middleware.ts`
- Modify: `apps/api/src/trpc/trpc.module.ts`, `apps/api/src/workspace/workspace.router.ts`
- Test: `apps/api/test/go-la-cat-quyen.spec.ts` (viết lại toàn bộ từ bản xác nhận S1)

**Interfaces:**
- Produces: `NOT_A_MEMBER: string` từ `@crm/auth`; `SignedInMiddleware` (Nest injectable, `TRPCMiddleware`); trong bài kiểm: `maTranTrpc(dau: Record<string,string>): Promise<HangMaTran[]>`, `maTranRest(dau): Promise<HangMaTran[]>`, `NGOAI_LE`, `dangNhap(email): Promise<string>`, `gieoNguoiCoMatKhau(phan, vai)`.

- [ ] **Step 1: Viết bài kiểm đỏ — bộ ma trận rút từ sổ router**

Bộ dựng dùng chung trong `go-la-cat-quyen.spec.ts`:

```ts
import { NOT_A_MEMBER } from "@crm/auth";
import { AppRouterHost } from "nestjs-trpc";

const NGOAI_LE = ["sso.signInOptions", "workspace.get"] as const;
const SAN_THU_TUC = 50;
const SAN_DUONG_REST = 30;

type HangMaTran = { ten: string; status: number; message: string };

function soThuTuc(): Array<{ ten: string; loai: "query" | "mutation" }> {
	const { appRouter } = app.get(AppRouterHost);
	const procs = appRouter._def.procedures as Record<string, { _def: { type: string } }>;
	return Object.entries(procs)
		.filter(([, p]) => p._def.type === "query" || p._def.type === "mutation")
		.map(([ten, p]) => ({ ten, loai: p._def.type as "query" | "mutation" }))
		.sort((a, b) => a.ten.localeCompare(b.ten));
}

async function maTranTrpc(dau: Record<string, string>): Promise<HangMaTran[]> {
	const hang: HangMaTran[] = [];
	for (const { ten, loai } of soThuTuc()) {
		let req = loai === "query"
			? request(app.getHttpServer()).get(`/api/trpc/${ten}`)
			: request(app.getHttpServer()).post(`/api/trpc/${ten}`).set("content-type", "application/json").send("{}");
		for (const [k, v] of Object.entries(dau)) req = req.set(k, v);
		const res = await req;
		hang.push({ ten, status: res.status, message: String(res.body?.error?.message ?? "") });
	}
	return hang;
}

function biChanVeTuCach(h: HangMaTran): boolean {
	return h.status === 403 && h.message === NOT_A_MEMBER;
}
```

Ma trận REST: `GET /openapi.json`, lấy mọi đường bắt đầu `/rest`, mỗi phương thức khai; thay `{id}` bằng `khong-co`; gọi với body `{}` cho POST/PATCH/PUT; `message` đọc từ `res.body.message`. Ngoại lệ REST là các đường có `operationId` trỏ vào thủ tục trong `NGOAI_LE` (in ra để soát ở lượt đầu).

Các ca, đặt tên chứa đúng khoá `-t` của config:
- `ma-tran-dang-nhap-lai` (E1): gỡ bằng `workspace.removeMember` thật → `dangNhap` → `maTranTrpc({cookie})`; `expect(soThuTuc().length).toBeGreaterThanOrEqual(SAN_THU_TUC)`; mọi hàng ngoài `NGOAI_LE` thoả `biChanVeTuCach`, thông điệp khẳng định in `${ten} ${status} ${message}`.
- `ngoai-le-dung-tap-khai` (E2): `hang.filter(h => !biChanVeTuCach(h)).map(h => h.ten).sort()` `toEqual([...NGOAI_LE])`; `workspace.get` 200 và `viewerRole` null.
- `doi-chung-thanh-vien` (E3): thành viên đăng nhập → không hàng nào `biChanVeTuCach`; sáu thủ tục mẫu 200.
- `tab-dang-mo` (E4): `dangNhap` trước lượt gỡ, `expect(cookie).toContain("session_data")`, contacts.list 200, gỡ, không chờ, mọi hàng ngoài ngoại lệ `biChanVeTuCach`.
- `khoa-con-bat` (E5): khoá bằng `auth.api.createApiKey({ body: { name, userId } })`; 200 qua tRPC và `POST /rest/contacts/search`; `db.member.delete` trực tiếp; `expect((await db.apikey.findUniqueOrThrow({where:{id}})).enabled).toBe(true)`; `maTranTrpc({[API_KEY_HEADER]: key})` và `maTranRest(...)` — mọi hàng ngoài ngoại lệ `biChanVeTuCach`; `expect(duongRest.length).toBeGreaterThanOrEqual(SAN_DUONG_REST)`.
- `proxy-het-quyen` (E10): `const server = await app.listen(0)`; cổng từ `server.address().port`; chạy `Bun.spawn(["bun", "-e", KICH_BAN_PROXY], { cwd: <gốc kho>/apps/app, env: { ...process.env, NEXT_PUBLIC_API_URL: "http://127.0.0.1:<cổng>", COOKIE: cookie } })`, trong đó kịch bản import `./proxy` và in `res.headers.get("location")` cho `new NextRequest("http://localhost:3000/contacts", { headers: { cookie: process.env.COOKIE } })`. Gốc kho suy từ `import.meta.dir`, không hardcode. Người bị gỡ → location kết thúc `/het-quyen`; thành viên → không.

- [ ] **Step 2: Chạy, xác nhận đỏ đúng chỗ**

Run: `bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts"`
Expected: E1, E2, E4, E5 đỏ (200 thay vì 403 kèm thông điệp); E3 và E10 xanh (đối chứng và lưới hồi quy).

- [ ] **Step 3: Hằng thông điệp**

`packages/auth/src/organization.ts`:
```ts
export const NOT_A_MEMBER = "You are not a member of this workspace.";
```
Thêm `NOT_A_MEMBER` vào khối `export { … } from "./organization"` của `packages/auth/src/index.ts`.

- [ ] **Step 4: `AuthMiddleware` đòi tư cách**

```ts
import { NOT_A_MEMBER, workspaceRoleOf } from "@crm/auth";
import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import type { MiddlewareOptions, MiddlewareResponse, TRPCMiddleware } from "nestjs-trpc";
import { setRequestUserId } from "../../logging/request-context";
import type { AuthedTrpcContext, BaseTrpcContext } from "../context.types";

@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
	async use(opts: MiddlewareOptions): Promise<MiddlewareResponse> {
		const ctx = opts.ctx as BaseTrpcContext;
		const user = ctx.session?.user;

		if (!user) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		setRequestUserId(user.id);

		if (!(await workspaceRoleOf(user.id))) {
			throw new TRPCError({ code: "FORBIDDEN", message: NOT_A_MEMBER });
		}

		const nextCtx: AuthedTrpcContext = { ...ctx, user };
		return opts.next({ ctx: nextCtx });
	}
}
```

- [ ] **Step 5: `SignedInMiddleware`**

`apps/api/src/trpc/middlewares/signed-in.middleware.ts` — thân giống bản cũ của `AuthMiddleware` (có phiên, `setRequestUserId`, không hỏi tư cách), tên lớp `SignedInMiddleware`. Đăng ký trong `providers` và `exports` của `trpc.module.ts` cạnh `AuthMiddleware`.

- [ ] **Step 6: Router workspace**

Bỏ `@UseMiddlewares(AuthMiddleware)` ở mức lớp. Thêm `@UseMiddlewares(SignedInMiddleware)` trên `get`, `@UseMiddlewares(AuthMiddleware)` trên tám thủ tục còn lại (`members`, `update`, `setMemberRole`, `allowances`, `allowEmail`, `issuePasswordLink`, `revokeAllowance`, `removeMember`), đặt sau khối `@Query`/`@Mutation` như `sso.router.ts`.

- [ ] **Step 7: Chạy lại, xanh; rồi lượt phá-thử (luật measure-birth)**

Run: `bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts"` → E1–E5, E10 xanh.
Phá-thử trên bản sao đang làm, hoàn lại ngay sau mỗi lượt:
1. Gắn `AuthMiddleware` cho `workspace.get` → E2 đỏ (tập thiếu `workspace.get`) và E10 đỏ (location không phải `/het-quyen`).
2. Xoá khối kiểm tư cách trong `AuthMiddleware` → E1, E4, E5 đỏ, thông điệp ghim tên thủ tục.
3. Cho `AuthMiddleware` ném FORBIDDEN với mọi người → E3 đỏ.
Ghi đầu ra ba lượt vào ghi chú task.

- [ ] **Step 8: Soát lan truyền**

Run: `bun run test` (toàn bộ). Bài kiểm nào đang dựng người dùng không có dòng `member` rồi gọi tRPC sẽ đỏ vì luật mới — sửa bài kiểm đó cho gieo thành viên (qua `gieoThanhVien`), không nới middleware. Liệt kê từng bài đã sửa trong commit.

- [ ] **Step 9: Commit** — `feat(api): AuthMiddleware doi tu cach thanh vien, chua workspace.get cho proxy`

---

### Task 2: Lượt gỡ tắt khoá API

**independent: false** (dùng bài kiểm của Task 1) · **phục vụ E6, E9**

**Files:** Modify `apps/api/src/workspace/workspace.service.ts` (giao dịch trong `removeMember`); Test `apps/api/test/go-la-cat-quyen.spec.ts`

- [ ] **Step 1: Bài đỏ** — ca `go-tat-khoa` (E6) và `cho-phep-lai` (E9) theo `expected` của evals.yaml. E9 cho phép lại bằng `workspace.allowEmail(chu, { email, role: "member" })` (đọc chữ ký thật của `AllowEmailInput` trước khi viết).
- [ ] **Step 2: Chạy** `-t "go-tat-khoa|cho-phep-lai"` → E6 đỏ (`enabled` vẫn true), E9 đỏ ở vế khoá.
- [ ] **Step 3: Sửa** — trong `this.db.$transaction` của `removeMember`, ngay sau `tx.session.deleteMany`:
```ts
await tx.apikey.updateMany({
	where: { referenceId: target.userId },
	data: { enabled: false },
});
```
Thêm `disabledKeys` (số dòng) vào object log «Member removed».
- [ ] **Step 4: Xanh; phá-thử** — bỏ lệnh trên → E6 đỏ ghim id khoá còn bật; đổi thành `deleteMany` → E6 đỏ ở vế số dòng.
- [ ] **Step 5: Commit** — `feat(api): go thanh vien tat luon khoa API cua ho`

---

### Task 3: Móc chặn `/api-key/*` cho người ngoài

**independent: false** · **phục vụ E7**

**Files:** Create `packages/auth/src/canh-khoa-api.ts`; Modify `packages/auth/src/auth.ts`; Test `apps/api/test/go-la-cat-quyen.spec.ts`

- [ ] **Step 1: Bài đỏ** — ca `khoa-moi` (E7) đủ ba lời gọi của người bị gỡ và ba đối chứng dương theo evals.yaml. Lời gọi bật lại: `POST /api/auth/api-key/update` body `{ keyId, enabled: true }`.
- [ ] **Step 2: Chạy** `-t khoa-moi` → đỏ ở `/api-key/create` và `/api-key/update`.
- [ ] **Step 3: Móc**
```ts
import { APIError, getSessionFromCtx } from "better-auth/api";
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
```
Trong `auth.ts`, `hooks.before` thêm `await canhKhoaApi(ctx);` sau hai móc sẵn có.
- [ ] **Step 4: Xanh; phá-thử** — bỏ dòng gọi móc → hai hàng Better Auth đỏ; đổi `if (!session) return` thành ném → đối chứng phía máy chủ đỏ.
- [ ] **Step 5: Commit** — `feat(auth): nguoi ngoai kho khong tao hay bat lai khoa API`

---

### Task 4: Đường nối trợ lý hỏi tư cách

**independent: false** · **phục vụ E8**

**Files:** Modify `apps/app/app/eve/v1/[...path]/route.ts`; Test `apps/app/test/eve-cau-noi-thanh-vien.spec.ts` (đã đỏ ở S1)

- [ ] **Step 1: Chạy** `bun run test -- "cd apps/app && bun test test/eve-cau-noi-thanh-vien.spec.ts"` → đỏ `{status: 200, soLanToiAgent: 1}`.
- [ ] **Step 2: Sửa** — ngay sau khối `if (!session)`:
```ts
if (!(await workspaceRoleOf(session.user.id))) {
	return Response.json({ error: NOT_A_MEMBER }, { status: 403 });
}
```
import `{ NOT_A_MEMBER, workspaceRoleOf } from "@crm/auth"` (route máy chủ, đã import `@crm/db`).
- [ ] **Step 3: Xanh; phá-thử** — bỏ khối trên → đỏ lại đúng `{200, 1}`.
- [ ] **Step 4: Commit** — `feat(app): cau noi tro ly chi cho thanh vien`

---

### Task 5: Tài liệu luật

**independent: false** · **phục vụ không eval nào — luật cho người đến sau**

**Files:** Modify `docs/api.md` (mục «tRPC is the data surface» và «One organization»)

- [ ] **Step 1:** Thay câu «No `AuthMiddleware` means public — there is no other guard» bằng: `AuthMiddleware` nghĩa là có phiên VÀ là thành viên, đọc tươi mỗi lời gọi; `SignedInMiddleware` là ngoại lệ có tên, hiện chỉ `workspace.get` (câu hỏi tư cách của proxy — proxy coi lỗi là «không biết» và cho qua); không middleware nào nghĩa là công khai.
- [ ] **Step 2:** Mục «Removing a member»: thêm vế tắt khoá API (tắt, không xoá) và móc `/api-key/*`.
- [ ] **Step 3: Chạy bộ chứng năm lệnh** từ gốc kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
- [ ] **Step 4: Commit** — `docs(api): AuthMiddleware nay doi tu cach thanh vien`

---

## Tự soát

- Phủ spec: bốn cửa → Task 1 (cửa 1, 3, 2a qua middleware), Task 2 (2a tận gốc), Task 3 (2b), Task 4 (4); đường đọc tư cách → Task 1 bước 6 + E10.
- Không chỗ trống: mọi bước sửa code có mã; các ca kiểm theo `expected` nguyên văn của evals.yaml.
- Tên nhất quán: `NOT_A_MEMBER`, `SignedInMiddleware`, `canhKhoaApi`, `NGOAI_LE`, `biChanVeTuCach` dùng cùng tên ở mọi task.
- Rủi ro đã biết: Step 8 của Task 1 có thể lộ bài kiểm cũ dựng người không có dòng `member`; sửa bài kiểm, không nới luật.
