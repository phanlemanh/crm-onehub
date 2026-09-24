# Vai «chỉ OKR» — kế hoạch làm

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm vai workspace thứ tư `okr`: người mang vai đăng nhập được, thấy Tổng quan rút gọn và Cài đặt cá nhân, nhưng không đọc được dữ liệu đối tác qua màn, tRPC, cầu REST, khoá API hay trợ lý AI; không bị đòi quyền hộp thư; nhật ký đếm được lượt đọc theo vai và phạm vi.

**Architecture:** Luật vai → phạm vi dữ liệu sống ở `packages/validation/src/vai-workspace.ts` (API, ứng dụng, trợ lý AI cùng đọc). `AuthMiddleware` thành lớp nền «có phiên · còn là thành viên · vai đọc được phạm vi mà router khai»; bốn lớp con khai bốn phạm vi; lớp nền trần = chưa khai = vai `okr` bị chặn. Màn lọc bằng ba hàm thuần trong `apps/app/lib/pham-vi-man.ts` mà proxy, rail và thanh bên Cài đặt cùng gọi. Trợ lý AI khoá hai ổ (đường nối + kênh). Tường hộp thư nhận vai.

**Tech Stack:** NestJS + nestjs-trpc 2.13 (tRPC 11), Better Auth 1.6 + `@better-auth/api-key`, Prisma, Next.js 15 (proxy ở rìa, server/client component), eve (`apps/agent`), bun test + supertest, puppeteer-core cho ui-check.

**Spec:** `docs/superpowers/specs/2026-09-24-vai-chi-okr-design.md` · hợp đồng `_acceptance/vai-chi-okr/contract.md` (approved 2026-09-24) · evals `_acceptance/vai-chi-okr/evals.yaml`

**Duyệt kế hoạch (Cổng 1.5, T3):** chờ phiên điều phối (uỷ quyền Manh Phan 2026-09-24).

## Global Constraints

- Không chú thích trong code (AGENTS.md). Không `console.log` trong `apps/api`; logger nhận một object.
- Client component không import `@crm/auth` hay `@crm/db`; `@crm/validation/vai-workspace` KHÔNG import zod hay gói máy chủ nào — nó là file hằng + hàm thuần, client import được.
- Thông điệp từ chối phạm vi là MỘT hằng `KHONG_TRONG_PHAM_VI = "Your role does not include this part of the CRM."` xuất từ `@crm/validation/vai-workspace`; không gõ lại chuỗi ở đâu khác, kể cả trong bài kiểm. `NOT_A_MEMBER` giữ nguyên ở `@crm/auth`.
- Giá trị vai lưu trong cột `member.role` là chuỗi `okr`. `WORKSPACE_ROLES = ["owner", "admin", "member", "okr"]`.
- Bốn phạm vi: `doi-tac` · `to-chuc` · `okr` · `chung`. Vai `okr` đọc `okr`, `chung`, `to-chuc`; vai khác đọc mọi phạm vi kể cả chưa khai (`null`); vai `null` không đọc gì.
- Thứ tự tRPC: middleware chạy TRƯỚC `.input()` — lời từ chối phạm vi đến trước lỗi đầu vào và trước 403 theo vai quản trị trong service.
- Chuỗi giao diện hai tiếng trong `apps/app/lib/messages/*`; nhãn màn đúng từ điển `CONTEXT.md` («Phạm vi dữ liệu», «Trợ lý AI», «Vai «chỉ OKR»»). Component từ `@crm/ui`, không `className` đè kiểu.
- Hai vòng khác đang chạy trên `apps/api/src/to-chuc`, `apps/api/src/onboarding`, màn `settings/organization`: ở hai router đó CHỈ đổi dòng `@UseMiddlewares` và import.
- Lệnh chạy bài kiểm luôn qua `bun run test -- "<lệnh>"` từ gốc kho (mỗi lượt một cơ sở dữ liệu riêng). Build cần Node 24: `PATH="/Users/manhphan/.local/share/fnm/node-versions/v24.15.0/installation/bin:$PATH"` (xem `duong-nen.md`).
- Mọi phép đo mới đi kèm cặp hai chiều trên cùng dựng cảnh (khuôn measure-birth): xanh với vật lành, đỏ có thông điệp ghim khi phá vật trong bản sao.

## Review Focus

1. Vai `okr` ghi vào cột `member.role` TRƯỚC khi bản này lên (hôm nay không có dòng nào) — `toWorkspaceRole` hạ về `member` và lớp nền cho qua: Task 1 ghim `toWorkspaceRole("okr") === "okr"`, không cần migration.
2. Người `okr` mở khung bản ghi bằng `?sheet=<id>` gõ tay — API trả 403 phạm vi, khung phải hiện trạng thái lỗi sẵn có chứ không trắng: Task 7 (ui-check) thêm một khẳng định «gõ `/<slug>?sheet=contact:abc` không có lỗi console không bắt».
3. Người `okr` có cookie bộ đệm phiên (`session_data`) từ trước khi được đổi vai — lớp nền đọc dòng `member` tươi nên đổi vai có hiệu lực ngay: Task 2 thêm ca «đổi vai member → okr, cookie cũ gọi lại contacts.list → 403 phạm vi ngay lời gọi kế».
4. Proxy nhận `viewerRole` lạ (API cũ chưa lên bản, hoặc chuỗi bất kỳ) — `dieuHuongTheoVai` chỉ chặn khi vai đúng bằng `okr`, mọi chuỗi khác đi tiếp: Task 4 ghim ca `dieuHuongTheoVai("khach", "/contacts") === "ok"`.
5. Quản trị tự hạ mình thành `okr` rồi mất luôn màn Thành viên — `setMemberRole` hiện không cấm tự hạ vai trừ chủ sở hữu cuối; hành vi giữ nguyên (đã có bất biến chủ sở hữu), Task 3 ghim ca «admin tự đổi thành okr được, rồi gọi `workspace.members` → 200 (phạm vi chung) nhưng `setMemberRole` → 403 theo vai» để hệ quả là có chủ ý.

## File Structure

| File | Trách nhiệm |
|---|---|
| `packages/validation/src/vai-workspace.ts` (mới) + `package.json` exports | vai, phạm vi, `docDuocPhamVi`, `KHONG_TRONG_PHAM_VI` |
| `packages/validation/test/vai-workspace.spec.ts` (mới) | bài kiểm luật |
| `packages/auth/src/roles.ts` | xuất lại từ validation; `isWorkspaceAdmin` giữ |
| `packages/auth/src/organization.ts`, `index.ts` | + `canManageSettings` |
| `packages/auth/src/scopes.ts` + `test/mailbox-grant-vai.spec.ts` (mới) | tường hộp thư nhận vai (E9) |
| `apps/api/src/logging/request-context.ts` | + `role`, `phamVi`, `setRequestScope` |
| `apps/api/src/trpc/middlewares/auth.middleware.ts` | lớp nền có câu hỏi phạm vi |
| `apps/api/src/trpc/middlewares/pham-vi-du-lieu.middleware.ts` (mới) | bốn lớp con |
| `apps/api/src/trpc/middlewares/logging.middleware.ts` | in `role`, `phamVi` |
| `apps/api/src/trpc/trpc.module.ts` | đăng ký + xuất bốn lớp |
| `apps/api/src/*/*.router.ts` (24 file) | đổi decorator sang lớp phạm vi |
| `apps/api/src/settings/settings.router.ts`, `settings.service.ts` | ba thủ tục ghi đòi quản trị |
| `apps/api/src/workspace/workspace.contracts.ts`, `workspace.service.ts` | + `canManageSettings` trong `workspace.get` |
| `apps/api/test/ma-tran-thu.ts` (mới) | bộ dựng ma trận dùng chung (chép từ `go-la-cat-quyen.spec.ts`, không sửa file đã ký) |
| `apps/api/test/vai-chi-okr.spec.ts` (mới) | E1–E5, E8, E14, E15, E16 |
| `apps/app/lib/messages/settings-thanh-vien.ts` | `vaiTro.okr` |
| `apps/app/app/(app)/[slug]/settings/{agent-model,research-key,archive-retention}.tsx` | khoá ô theo `canManageSettings` |
| `apps/app/lib/pham-vi-man.ts` (mới) + `test/pham-vi-man.spec.ts` (mới) | ba hàm thuần (E10) |
| `apps/app/lib/khung-dieu-huong.ts`, `lib/cai-dat-dieu-huong.ts` | không đổi hình; `pham-vi-man.ts` đọc từ đây |
| `apps/app/lib/onboarding.ts`, `apps/app/proxy.ts` | `viewerRole` chảy vào proxy; `dieuHuongTheoVai` |
| `apps/app/components/app-icon-rail.tsx`, `app/(app)/[slug]/layout.tsx` | rail theo vai, hydrate `workspace.get`, tìm nhanh theo vai |
| `apps/app/app/(app)/[slug]/settings/settings-sidebar.tsx`, `settings/layout.tsx` | thanh bên theo vai |
| `apps/app/app/(app)/[slug]/page.tsx`, `tong-quan-chi-okr.tsx` (mới), `lib/messages/tong-quan.ts` | Tổng quan rút gọn |
| `apps/app/app/(app)/[slug]/ngoai-pham-vi/page.tsx` (mới), `lib/messages/ngoai-pham-vi.ts` (mới) | trang «ngoài phạm vi» |
| `apps/app/lib/session.ts` + `test/tuong-hop-thu.spec.ts` (mới) | `hopThuCanCap(userId)` (E9b) |
| `apps/app/app/eve/v1/[...path]/route.ts` + `test/eve-cau-noi-chi-okr.spec.ts` (mới) | ổ khoá 1 của trợ lý AI (E6) |
| `apps/agent/agent/channels/eve.ts` + `test/kenh-chi-okr.spec.ts` (mới) | ổ khoá 2 (E7) |
| `_acceptance/vai-chi-okr/rang/man-chi-okr.mjs` (mới) | ui-check E11–E13 |
| `docs/api.md`, `docs/agent.md` | luật mới |

---

### Task 1: Luật vai → phạm vi, một chỗ; tường hộp thư nhận vai

**independent: false** (mọi task sau import từ đây) · **phục vụ E1–E4, E6–E10, E15**

**Files:**
- Create: `packages/validation/src/vai-workspace.ts`, `packages/validation/test/vai-workspace.spec.ts`, `packages/auth/test/mailbox-grant-vai.spec.ts`
- Modify: `packages/validation/package.json` (exports), `packages/auth/src/roles.ts`, `packages/auth/src/organization.ts`, `packages/auth/src/index.ts`, `packages/auth/src/scopes.ts`

**Interfaces:**
- Produces (`@crm/validation/vai-workspace`): `WORKSPACE_ROLES`, `type WorkspaceRole`, `VAI_CHI_OKR = "okr"`, `PHAM_VI_DU_LIEU`, `type PhamViDuLieu`, `KHONG_TRONG_PHAM_VI: string`, `isWorkspaceRole(v: string): v is WorkspaceRole`, `toWorkspaceRole(v: string): WorkspaceRole`, `laVaiChiOkr(role: WorkspaceRole | null): boolean`, `docDuocPhamVi(role: WorkspaceRole | null, phamVi: PhamViDuLieu | null): boolean`.
- Produces (`@crm/auth`): re-export tất cả trên + `canManageSettings(role): boolean` (= `isWorkspaceAdmin`); `needsMailboxGrant(accounts, role: WorkspaceRole | null = null)`, `mailboxGrantsNeeded(accounts, role = null)`.

- [ ] **Step 1: Bài kiểm đỏ cho luật**

`packages/validation/test/vai-workspace.spec.ts`:

```ts
import { describe, expect, test } from "bun:test";
import {
	docDuocPhamVi,
	KHONG_TRONG_PHAM_VI,
	laVaiChiOkr,
	PHAM_VI_DU_LIEU,
	toWorkspaceRole,
	WORKSPACE_ROLES,
} from "../src/vai-workspace";

describe("vai-workspace", () => {
	test("okr la vai thu tu, khong bi ha ve member", () => {
		expect(WORKSPACE_ROLES).toEqual(["owner", "admin", "member", "okr"]);
		expect(toWorkspaceRole("okr")).toBe("okr");
		expect(toWorkspaceRole("la")).toBe("member");
		expect(laVaiChiOkr("okr")).toBe(true);
		expect(laVaiChiOkr("member")).toBe(false);
		expect(laVaiChiOkr(null)).toBe(false);
	});

	test("bang doc: okr doc okr/chung/to-chuc, khong doc doi-tac va chua khai", () => {
		expect(PHAM_VI_DU_LIEU).toEqual(["doi-tac", "to-chuc", "okr", "chung"]);
		expect(docDuocPhamVi("okr", "okr")).toBe(true);
		expect(docDuocPhamVi("okr", "chung")).toBe(true);
		expect(docDuocPhamVi("okr", "to-chuc")).toBe(true);
		expect(docDuocPhamVi("okr", "doi-tac")).toBe(false);
		expect(docDuocPhamVi("okr", null)).toBe(false);
		for (const vai of ["owner", "admin", "member"] as const) {
			for (const pv of [...PHAM_VI_DU_LIEU, null]) {
				expect(docDuocPhamVi(vai, pv), `${vai} ${pv}`).toBe(true);
			}
		}
		for (const pv of [...PHAM_VI_DU_LIEU, null]) {
			expect(docDuocPhamVi(null, pv)).toBe(false);
		}
	});

	test("thong diep tu choi la mot hang co ten", () => {
		expect(KHONG_TRONG_PHAM_VI).toMatch(/role/);
	});
});
```

- [ ] **Step 2: Chạy, thấy đỏ** — `cd packages/validation && bun test test/vai-workspace.spec.ts` → FAIL "Cannot find module".

- [ ] **Step 3: Viết luật**

`packages/validation/src/vai-workspace.ts`:

```ts
export const WORKSPACE_ROLES = ["owner", "admin", "member", "okr"] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const VAI_CHI_OKR = "okr" as const;

export const PHAM_VI_DU_LIEU = ["doi-tac", "to-chuc", "okr", "chung"] as const;

export type PhamViDuLieu = (typeof PHAM_VI_DU_LIEU)[number];

export const KHONG_TRONG_PHAM_VI =
	"Your role does not include this part of the CRM.";

const PHAM_VI_CUA_CHI_OKR: readonly PhamViDuLieu[] = ["okr", "chung", "to-chuc"];

export function isWorkspaceRole(value: string): value is WorkspaceRole {
	return (WORKSPACE_ROLES as readonly string[]).includes(value);
}

export function toWorkspaceRole(value: string): WorkspaceRole {
	return isWorkspaceRole(value) ? value : "member";
}

export function laVaiChiOkr(role: WorkspaceRole | null): boolean {
	return role === VAI_CHI_OKR;
}

export function docDuocPhamVi(
	role: WorkspaceRole | null,
	phamVi: PhamViDuLieu | null,
): boolean {
	if (role === null) return false;
	if (!laVaiChiOkr(role)) return true;
	return phamVi !== null && PHAM_VI_CUA_CHI_OKR.includes(phamVi);
}
```

Thêm vào `packages/validation/package.json` `exports`: `"./vai-workspace": "./src/vai-workspace.ts"` (giữ thứ tự chữ cái, sau `./saved-view`).

- [ ] **Step 4: Xuất lại từ `@crm/auth`**

`packages/auth/src/roles.ts` thành:

```ts
import {
	isWorkspaceRole,
	toWorkspaceRole,
	WORKSPACE_ROLES,
	type WorkspaceRole,
} from "@crm/validation/vai-workspace";

export {
	docDuocPhamVi,
	isWorkspaceRole,
	KHONG_TRONG_PHAM_VI,
	laVaiChiOkr,
	PHAM_VI_DU_LIEU,
	type PhamViDuLieu,
	toWorkspaceRole,
	VAI_CHI_OKR,
	WORKSPACE_ROLES,
	type WorkspaceRole,
} from "@crm/validation/vai-workspace";

export function isWorkspaceAdmin(role: WorkspaceRole | null): boolean {
	return role === "owner" || role === "admin";
}
```

(Xoá hai dòng import dư nếu biome báo; `isWorkspaceRole`/`toWorkspaceRole`/`WORKSPACE_ROLES` chỉ cần ở khối `export … from`.) Trong `packages/auth/src/organization.ts` thêm sau `canManageOrganization`:

```ts
export function canManageSettings(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}
```

và trong `packages/auth/src/index.ts` thêm `canManageSettings` vào khối export của `./organization`, cộng các tên mới của `./roles` (`docDuocPhamVi`, `KHONG_TRONG_PHAM_VI`, `laVaiChiOkr`, `PHAM_VI_DU_LIEU`, `PhamViDuLieu`, `VAI_CHI_OKR`).

- [ ] **Step 5: Bài kiểm đỏ cho tường hộp thư** — `packages/auth/test/mailbox-grant-vai.spec.ts`:

```ts
import { describe, expect, test } from "bun:test";
import {
	mailboxGrantsNeeded,
	needsMailboxGrant,
	SYNC_SCOPES,
} from "../src/scopes";

const GOOGLE_KHONG_HOP_THU = [{ providerId: "google", scope: "openid email profile" }];
const GOOGLE_DA_CAP = [{ providerId: "google", scope: SYNC_SCOPES.join(",") }];

describe("tuong hop thu theo vai", () => {
	test("vai okr khong bao gio can cap hop thu", () => {
		expect(mailboxGrantsNeeded(GOOGLE_KHONG_HOP_THU, "okr")).toEqual([]);
		expect(needsMailboxGrant(GOOGLE_KHONG_HOP_THU, "okr")).toBe(false);
	});

	test("member va admin van bi tuong nhu cu", () => {
		expect(mailboxGrantsNeeded(GOOGLE_KHONG_HOP_THU, "member")).toEqual(["google"]);
		expect(needsMailboxGrant(GOOGLE_KHONG_HOP_THU, "member")).toBe(true);
		expect(needsMailboxGrant(GOOGLE_KHONG_HOP_THU, "admin")).toBe(true);
		expect(needsMailboxGrant(GOOGLE_KHONG_HOP_THU)).toBe(true);
	});

	test("da cap thi khong tuong, bat ke vai", () => {
		expect(needsMailboxGrant(GOOGLE_DA_CAP, "member")).toBe(false);
		expect(needsMailboxGrant(GOOGLE_DA_CAP, "okr")).toBe(false);
	});
});
```

- [ ] **Step 6: Sửa `scopes.ts`** — thêm `import { laVaiChiOkr, type WorkspaceRole } from "./roles";` và:

```ts
export function mailboxGrantsNeeded(
	accounts: readonly SignInAccount[],
	role: WorkspaceRole | null = null,
): MailboxProviderId[] {
	if (laVaiChiOkr(role)) return [];
	…(thân cũ giữ nguyên)
}

export function needsMailboxGrant(
	accounts: readonly SignInAccount[],
	role: WorkspaceRole | null = null,
): boolean {
	return mailboxGrantsNeeded(accounts, role).length > 0;
}
```

- [ ] **Step 7: Chạy xanh + chiều đỏ** — `cd packages/validation && bun test test/vai-workspace.spec.ts` PASS; `cd packages/auth && bun test test/mailbox-grant-vai.spec.ts test/mailbox-grant.spec.ts` PASS. Chiều đỏ: tạm đổi `PHAM_VI_CUA_CHI_OKR` bỏ `"chung"` → bài 2 đỏ tại `okr chung`; hoàn lại. `bun run check-types` từ gốc xanh (ba gói).

- [ ] **Step 8: Commit** — `git add packages/validation packages/auth && git commit -m "vai-chi-okr: luật vai → phạm vi dữ liệu ở @crm/validation, tường hộp thư nhận vai"`.

---

### Task 2: Lớp nền hỏi phạm vi, bốn lớp con, 24 router khai, nhật ký mang vai; ma trận

**independent: false** · **phục vụ E1, E2, E3, E4, E14, E15, E16** (E5 ở Task 4)

**Files:**
- Create: `apps/api/src/trpc/middlewares/pham-vi-du-lieu.middleware.ts`, `apps/api/test/ma-tran-thu.ts`, `apps/api/test/vai-chi-okr.spec.ts`
- Modify: `apps/api/src/logging/request-context.ts`, `apps/api/src/trpc/middlewares/auth.middleware.ts`, `apps/api/src/trpc/middlewares/logging.middleware.ts`, `apps/api/src/trpc/trpc.module.ts`, 24 file `apps/api/src/*/*.router.ts`, `apps/api/src/settings/settings.router.ts`, `apps/api/src/settings/settings.service.ts`, `apps/api/src/workspace/workspace.contracts.ts`, `apps/api/src/workspace/workspace.service.ts`

**Interfaces:**
- Consumes: Task 1.
- Produces: `PhamViDoiTacMiddleware`, `PhamViToChucMiddleware`, `PhamViOkrMiddleware`, `PhamViChungMiddleware` (Nest injectable, kế thừa `AuthMiddleware`); `AuthMiddleware.phamVi: PhamViDuLieu | null` (protected); `setRequestScope(role, phamVi)` và `RequestContext.role/phamVi`; `workspaceOutput.canManageSettings: boolean`; `SettingsService.setAgentModel(userId, modelId)`, `.setResearchKey(userId, apiKey)`, `.setArchiveRetention(userId, days)`; trong bài kiểm: `soThuTuc()`, `maTranTrpc(dau)`, `maTranRest(dau)`, `goiTrpc(ten, loai, input, dau)`, `dangNhap(email)`, `datMatKhau(userId)`, `gieoNguoi(phan, vai)`.

- [ ] **Step 1: Bộ dựng ma trận dùng chung** — `apps/api/test/ma-tran-thu.ts` (chép từ `go-la-cat-quyen.spec.ts`, đổi thành module nhận `app`):

```ts
import { auth } from "@crm/auth";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { AnyProcedure } from "@trpc/server";
import { hashPassword } from "better-auth/crypto";
import { AppRouterHost } from "nestjs-trpc";
import request from "supertest";
import { z } from "zod";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";

export const MAT_KHAU = "mat-khau-thu-du-dai-1";
export type Loai = "query" | "mutation";
export type ThuTuc = { ten: string; loai: Loai; restKey: string | null; coDauVao: boolean };
export type HangMaTran = { ten: string; status: number; message: string };
export type Dau = Record<string, string>;
export type DauVao = Record<string, unknown> | undefined;

const khaiRest = z
	.object({ openapi: z.object({ method: z.string(), path: z.string() }) })
	.transform((m) => m.openapi);

export function soThuTuc(app: NestExpressApplication): ThuTuc[] {
	const { appRouter } = app.get(AppRouterHost);
	const procs = appRouter._def.procedures as Record<string, AnyProcedure>;
	return Object.entries(procs)
		.flatMap(([ten, p]) => {
			const type = p._def.type;
			if (type !== "query" && type !== "mutation") return [];
			const rest = khaiRest.safeParse(p._def.meta);
			return [{
				ten,
				loai: type,
				restKey: rest.success
					? `${rest.data.method.toUpperCase()} ${REST_BRIDGE_PATH}${rest.data.path}`
					: null,
				coDauVao: (p._def.inputs as unknown[]).length > 0,
			}];
		})
		.sort((a, b) => (a.loai === b.loai ? a.ten.localeCompare(b.ten) : a.loai === "query" ? -1 : 1));
}

export function gan(req: request.Test, dau: Dau): request.Test {
	let r = req;
	for (const [k, v] of Object.entries(dau)) r = r.set(k, v);
	return r;
}

export async function goiTrpc(app: NestExpressApplication, ten: string, loai: Loai, input: DauVao, dau: Dau) {
	const server = app.getHttpServer();
	if (loai === "query") {
		const duong = input === undefined
			? `/api/trpc/${ten}`
			: `/api/trpc/${ten}?input=${encodeURIComponent(JSON.stringify(input))}`;
		return gan(request(server).get(duong), dau);
	}
	return gan(
		request(server).post(`/api/trpc/${ten}`).set("content-type", "application/json").send(JSON.stringify(input ?? {})),
		dau,
	);
}

export async function maTranTrpc(app: NestExpressApplication, dau: Dau): Promise<HangMaTran[]> {
	const hang: HangMaTran[] = [];
	for (const { ten, loai } of soThuTuc(app)) {
		const res = await goiTrpc(app, ten, loai, undefined, dau);
		hang.push({ ten, status: res.status, message: String(res.body?.error?.message ?? "") });
	}
	return hang;
}

export async function maTranRest(app: NestExpressApplication, dau: Dau): Promise<HangMaTran[]> {
	const hang: HangMaTran[] = [];
	const server = app.getHttpServer();
	for (const { restKey } of soThuTuc(app)) {
		if (!restKey) continue;
		const [method, path] = restKey.split(" ");
		const url = path.replace(/\{[^}]+\}/g, "khong-co");
		const verb = method.toLowerCase() as "get" | "post" | "patch" | "put" | "delete";
		let req = request(server)[verb](url);
		if (verb !== "get" && verb !== "delete") req = req.set("content-type", "application/json").send("{}");
		const res = await gan(req, dau);
		hang.push({ ten: restKey, status: res.status, message: String(res.body?.message ?? "") });
	}
	return hang;
}

export async function datMatKhau(userId: string): Promise<string> {
	const now = new Date();
	await db.account.upsert({
		where: { id: `acc-${userId}` },
		create: { id: `acc-${userId}`, accountId: userId, providerId: "credential", userId, password: await hashPassword(MAT_KHAU), createdAt: now, updatedAt: now },
		update: {},
	});
	return `${userId}@thu.test`;
}

export async function dangNhap(email: string): Promise<string> {
	const { headers } = await auth.api.signInEmail({ body: { email, password: MAT_KHAU }, returnHeaders: true });
	return headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
}
```

`gieoNguoi(phan, vai)` = `gieoThanhVien` của `phien-thu.ts` (đã nhận `WorkspaceRole`, nay có `okr`) rồi `datMatKhau`.

- [ ] **Step 2: Bài kiểm đỏ ma trận** — `apps/api/test/vai-chi-okr.spec.ts`, khung + bốn bài đầu:

```ts
import { afterAll, beforeAll, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { KHONG_TRONG_PHAM_VI, NOT_A_MEMBER } from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { dangNhap, datMatKhau, goiTrpc, maTranRest, maTranTrpc, soThuTuc } from "./ma-tran-thu";
import { gieoThanhVien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "vai-chi-okr";
const id = (phan: string) => `${suffix}-${phan}`;
const ALIAS_CHO_PHEP = ["users", "settings", "currency", "zalo", "apiKeys", "sso", "workspace", "org"] as const;
const NGOAI_LE = ["workspace.get", "sso.signInOptions"] as const;
const SAN_THU_TUC = 50;
const SAN_DUONG_REST = 30;
const SO_MUTATION_KHONG_DAU_VAO = 12;
const THU_TUC_MAU = [
	{ ten: "contacts.list", input: {} }, { ten: "companies.list", input: {} }, { ten: "deals.list", input: {} },
	{ ten: "activities.myTasks", input: {} }, { ten: "search.quick", input: { q: "a" } }, { ten: "campaigns.list", input: undefined },
] as const;

let app: NestExpressApplication;

function choPhep(): string[] {
	return soThuTuc(app)
		.filter((t) => (ALIAS_CHO_PHEP as readonly string[]).includes(t.ten.split(".")[0]) || (NGOAI_LE as readonly string[]).includes(t.ten))
		.map((t) => t.ten).sort();
}
const biChanPhamVi = (h: { status: number; message: string }) => h.status === 403 && h.message === KHONG_TRONG_PHAM_VI;

async function gieoNguoi(phan: string, vai: "owner" | "admin" | "member" | "okr") {
	const userId = id(phan);
	await gieoThanhVien(userId, vai);
	return { userId, email: await datMatKhau(userId) };
}

async function vaiVanLa(dau: Record<string, string>, vai: string) {
	const res = await goiTrpc(app, "workspace.get", "query", undefined, dau);
	expect(res.status, "workspace.get sau ma tran").toBe(200);
	expect(res.body.result.data.viewerRole, "tu cach doi giua ma tran").toBe(vai);
}

async function don() {
	const users = { startsWith: `${suffix}-` };
	await db.apikey.deleteMany({ where: { referenceId: users } });
	await db.session.deleteMany({ where: { userId: users } });
	await db.account.deleteMany({ where: { userId: users } });
	await db.member.deleteMany({ where: { userId: users } });
	await db.invitation.deleteMany({ where: { email: { contains: suffix } } });
	await db.user.deleteMany({ where: { id: users } });
}

beforeAll(async () => {
	app = await createApp();
	spyOn(app.get(BackfillService), "auto").mockResolvedValue({ started: false });
});
afterAll(async () => { await don(); await app.close(); });
beforeEach(don);

describe("vai-chi-okr", () => {
	test("ma-tran-trpc: okr goi duoc dung tap khai, moi thu tuc doi tac bi tu choi ve pham vi", async () => {
		const { email } = await gieoNguoi("okr", "okr");
		const cookie = await dangNhap(email);
		const tatCa = soThuTuc(app);
		expect(tatCa.length).toBeGreaterThanOrEqual(SAN_THU_TUC);
		const khongDauVao = tatCa.filter((t) => t.loai === "mutation" && !t.coDauVao).map((t) => t.ten);
		expect(khongDauVao, `mutation khong dau vao: ${khongDauVao.join(", ")}`).toHaveLength(SO_MUTATION_KHONG_DAU_VAO);
		const hang = await maTranTrpc(app, { cookie });
		const khongChan = hang.filter((h) => !biChanPhamVi(h)).map((h) => h.ten).sort();
		expect(khongChan, "tap cho phep lech tap khai").toEqual(choPhep());
		for (const h of hang.filter((x) => /^(contacts|companies|deals|campaigns|onboarding)\./.test(x.ten))) {
			expect(biChanPhamVi(h), `${h.ten} ${h.status} ${h.message}`).toBe(true);
		}
		expect(hang.some((h) => h.message === NOT_A_MEMBER), "okr bi coi la nguoi ngoai").toBe(false);
		await vaiVanLa({ cookie }, "okr");
	});
	…
});
```

Chỉnh `SO_MUTATION_KHONG_DAU_VAO` theo số bài in ra ở lần chạy đầu (đếm thật, ghim lại; đổi số là quyết định có tên).

Bài `ma-tran-khoa-rest`: người okr `POST /api/trpc/apiKeys.create` body `{ name: "thu", expiresInDays: null }` bằng cookie → 200, lấy `key` từ `result.data.key`; `maTranTrpc(app, { "x-api-key": key })` tập không bị chặn `toEqual(choPhep())`; `maTranRest(app, { "x-api-key": key })`: không hàng nào 404; tập không bị chặn `toEqual(choPhep().map(restKey))` (chiếu qua `soThuTuc`); số hàng ≥ `SAN_DUONG_REST`; `vaiVanLa({ "x-api-key": key }, "okr")`.

Bài `doi-chung`: gieo `member` và `admin`; với mỗi người: sáu `THU_TUC_MAU` → 200 (gọi TRƯỚC ma trận), rồi `maTranTrpc` không hàng nào `biChanPhamVi`, rồi `vaiVanLa` đúng vai.

Bài `khong-khai-nhom`: 

```ts
test("khong-khai-nhom: lop nen tran chan okr, cho member qua", async () => {
	const { AuthMiddleware } = await import("../src/trpc/middlewares/auth.middleware");
	const { PhamViChungMiddleware } = await import("../src/trpc/middlewares/pham-vi-du-lieu.middleware");
	const okr = await gieoNguoi("okr", "okr");
	const member = await gieoNguoi("member", "member");
	const goi = async (lop: AuthMiddleware, userId: string) => {
		let next = 0;
		const user = { id: userId, email: `${userId}@thu.test`, name: userId };
		try {
			await lop.use({
				ctx: { session: { user } }, path: "router-moi.list", type: "query", input: undefined,
				getRawInput: async () => undefined, meta: undefined, signal: undefined,
				next: async () => { next += 1; return { ok: true, data: null, marker: "middlewareMarker" } as never; },
			} as never);
			return { next, loi: null as string | null };
		} catch (e) { return { next, loi: (e as Error).message }; }
	};
	expect(await goi(app.get(AuthMiddleware), okr.userId)).toEqual({ next: 0, loi: KHONG_TRONG_PHAM_VI });
	expect(await goi(app.get(AuthMiddleware), member.userId)).toEqual({ next: 1, loi: null });
	expect(await goi(app.get(PhamViChungMiddleware), okr.userId)).toEqual({ next: 1, loi: null });
});
```

- [ ] **Step 3: Chạy, thấy đỏ** — `bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts -t ma-tran-trpc"` → FAIL (okr đọc được `contacts.list` 200 vì lớp nền chưa hỏi phạm vi; hoặc lỗi import lớp mới).

- [ ] **Step 4: Ngữ cảnh yêu cầu mang vai và phạm vi** — `apps/api/src/logging/request-context.ts`:

```ts
import type { PhamViDuLieu, WorkspaceRole } from "@crm/auth";

export interface RequestContext {
	requestId: string;
	method: string;
	path: string;
	userId?: string;
	role?: WorkspaceRole | null;
	phamVi?: PhamViDuLieu | null;
}

export function setRequestScope(role: WorkspaceRole | null, phamVi: PhamViDuLieu | null): void {
	const context = storage.getStore();
	if (context) {
		context.role = role;
		context.phamVi = phamVi;
	}
}
```

- [ ] **Step 5: Lớp nền** — `auth.middleware.ts`:

```ts
import { docDuocPhamVi, KHONG_TRONG_PHAM_VI, NOT_A_MEMBER, type PhamViDuLieu, workspaceRoleOf } from "@crm/auth";
…
import { setRequestScope, setRequestUserId } from "../../logging/request-context";

@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
	protected readonly phamVi: PhamViDuLieu | null = null;

	async use(opts: MiddlewareOptions): Promise<MiddlewareResponse> {
		const ctx = opts.ctx as BaseTrpcContext;
		const user = ctx.session?.user;
		if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
		setRequestUserId(user.id);
		const role = await workspaceRoleOf(user.id);
		if (!role) throw new TRPCError({ code: "FORBIDDEN", message: NOT_A_MEMBER });
		setRequestScope(role, this.phamVi);
		if (!docDuocPhamVi(role, this.phamVi)) {
			throw new TRPCError({ code: "FORBIDDEN", message: KHONG_TRONG_PHAM_VI });
		}
		const nextCtx: AuthedTrpcContext = { ...ctx, user };
		return opts.next({ ctx: nextCtx });
	}
}
```

`pham-vi-du-lieu.middleware.ts`:

```ts
import { Injectable } from "@nestjs/common";
import { AuthMiddleware } from "./auth.middleware";

@Injectable()
export class PhamViDoiTacMiddleware extends AuthMiddleware {
	protected override readonly phamVi = "doi-tac" as const;
}

@Injectable()
export class PhamViToChucMiddleware extends AuthMiddleware {
	protected override readonly phamVi = "to-chuc" as const;
}

@Injectable()
export class PhamViOkrMiddleware extends AuthMiddleware {
	protected override readonly phamVi = "okr" as const;
}

@Injectable()
export class PhamViChungMiddleware extends AuthMiddleware {
	protected override readonly phamVi = "chung" as const;
}
```

`trpc.module.ts`: import bốn lớp, thêm vào `providers` và `exports`.

`logging.middleware.ts`: sau `opts.next()` đọc `const scope = getRequestContext();` và thêm vào object log `role: scope?.role ?? null, phamVi: scope?.phamVi ?? null` (import `getRequestContext` từ `../../logging/request-context`). Lớp nền ghi scope trước khi từ chối, nên dòng `err` vẫn mang `role`/`phamVi` (E14).

- [ ] **Step 6: 24 router khai phạm vi** — thay import `AuthMiddleware` và decorator:

| Lớp | Router (file) |
|---|---|
| `PhamViDoiTacMiddleware` | activities, campaigns, companies, contacts, conversations, dashboard, deals, enrichment, fields, google, microsoft, onboarding, saved-views, search, slack, tracking, agent (`agents.router.ts`) |
| `PhamViToChucMiddleware` | to-chuc |
| `PhamViChungMiddleware` | users, settings, currency, zalo, api-keys (`@UseMiddlewares(PhamViChungMiddleware, SessionOnlyMiddleware)`), sso (bốn chỗ `@UseMiddlewares(AuthMiddleware)` ở mức thủ tục), workspace (tám chỗ ở mức thủ tục; `get` giữ `SignedInMiddleware`) |

Ở `onboarding.router.ts` và `to-chuc.router.ts` chỉ đổi đúng dòng import và dòng decorator.

- [ ] **Step 7: Ba thủ tục ghi của cài đặt chung đòi quản trị** — `settings.service.ts`: import `canManageSettings, workspaceRoleOf` từ `@crm/auth`, `ForbiddenException` từ Nest; thêm

```ts
	private async yeuCauQuanTri(userId: string): Promise<void> {
		if (!canManageSettings(await workspaceRoleOf(userId))) {
			throw new ForbiddenException("Only an owner or an admin can change workspace settings.");
		}
	}
```

và ba chữ ký `setAgentModel(userId: string, modelId)`, `setResearchKey(userId: string, apiKey)`, `setArchiveRetention(userId: string, days)` gọi `await this.yeuCauQuanTri(userId)` đầu thân. `settings.router.ts`: ba mutation nhận `@Ctx() ctx: AuthedTrpcContext` và truyền `ctx.user.id`. `workspace.contracts.ts`: `workspaceOutput` thêm `canManageSettings: z.boolean()`; `workspace.service.ts#get` trả `canManageSettings: canManageSettings(role)`.

- [ ] **Step 8: Bài `ghi-chung` (E15) và `duong-ngoai-router` (E16), `nhat-ky` (E14)** — thêm vào spec:

```ts
const DAU_VAO_HOP_LE: Record<string, Record<string, unknown>> = {
	"apiKeys.create": { name: "thu", expiresInDays: null },
	"apiKeys.revoke": { id: "khong-co" },
	"zalo.taoMa": {}, "zalo.go": {}, "zalo.guiThu": {},
	"zalo.luuUuTien": { channel: "ZALO" },
	"zalo.luuBot": { token: "thu" },
	"settings.setAgentModel": { modelId: null },
	"settings.setResearchKey": { apiKey: "ctx_thu_khong_that" },
	"settings.setArchiveRetention": { days: 30 },
	"currency.setReportingCurrency": { currency: "USD" },
	"currency.setManualRate": { currency: "USD", rate: 1 },
	"currency.removeManualRate": { currency: "USD" },
	"currency.refreshRates": {},
	"sso.registerProvider": { providerId: "thu", issuer: "https://thu.test", domain: "thu.test", clientId: "a", clientSecret: "b" },
	"sso.deleteProvider": { providerId: "thu" },
	"workspace.update": { name: "CRM", website: "https://thu.test" },
	"workspace.setMemberRole": { memberId: "khong-co", role: "member" },
	"workspace.allowEmail": { email: "moi@thu.test", role: "member" },
	"workspace.issuePasswordLink": { email: "moi@thu.test" },
	"workspace.revokeAllowance": { allowanceId: "khong-co" },
	"workspace.removeMember": { memberId: "khong-co" },
	"org.createDivision": { name: "Bo phan thu" },
	"org.createDepartment": { name: "Phong thu", divisionId: null },
	"org.rename": { id: "khong-co", name: "x" },
	"org.reorder": { ids: ["khong-co"] },
	"org.moveDepartment": { id: "khong-co", divisionId: null, index: 0 },
	"org.setHead": { kind: "division", id: "khong-co", userId: null },
	"org.setPlacement": { userId: "khong-co", primaryDepartmentId: null, secondaryDepartmentIds: [] },
	"org.previewImport": { text: "" }, "org.applyImport": { text: "" },
	"org.archive": { id: "khong-co" }, "org.restore": { id: "khong-co" }, "org.purge": { id: "khong-co" },
};
const TU_PHUC_VU = ["apiKeys.create", "apiKeys.revoke", "zalo.taoMa", "zalo.go", "zalo.luuUuTien", "zalo.guiThu"];
```

Tên mutation của `org.*` và `sso.*` lấy lại từ `soThuTuc(app)` ở lần chạy đầu (bài in danh sách mutation của các alias `chung`/`to-chuc`; mutation nào không có trong `DAU_VAO_HOP_LE` → `expect.fail("thieu dau vao hop le cho <ten>")`). Với người okr: gọi từng mutation với đầu vào đó; tập KHÔNG bị 403 `toEqual(TU_PHUC_VU.sort())`; các hàng 403 phải mang thông điệp KHÁC `KHONG_TRONG_PHAM_VI` và KHÁC `NOT_A_MEMBER`. Thêm: member gọi ba `settings.set*` → 403; admin gọi `settings.setArchiveRetention {days: 30}` → 200. Số mutation ≥ 15.

`duong-ngoai-router`:

```ts
test("duong-ngoai-router: tap duong HTTP ngoai tRPC/REST tra 2xx cho okr bang dung tap khai", async () => {
	const { auth } = await import("@crm/auth");
	const { email } = await gieoNguoi("okr", "okr");
	const cookie = await dangNhap(email);
	const express = app.getHttpAdapter().getInstance() as { router: { stack: Array<{ route?: { path: string; methods: Record<string, boolean> } }> } };
	const cuaNest = express.router.stack.flatMap((l) => l.route ? Object.keys(l.route.methods).map((m) => ({ method: m.toUpperCase(), path: l.route!.path })) : []);
	const cuaAuth = Object.values(auth.api as Record<string, { path?: string; options?: { method?: string | string[] } }>)
		.flatMap((e) => e.path && e.options?.method ? [e.options.method].flat().map((m) => ({ method: m, path: `/api/auth${e.path}` })) : []);
	const duong = [...cuaNest, ...cuaAuth].filter((d) => !d.path.startsWith("/api/trpc") && !d.path.startsWith("/rest"));
	expect(duong.length, "danh sach duong qua ngan").toBeGreaterThanOrEqual(20);
	const KHAI_2XX = ["GET /health", "GET /auth/me", "GET /auth/session", "GET /openapi.json", "GET /", "GET /api/auth/ok", "GET /api/auth/get-session", "GET /api/auth/list-sessions", "GET /api/auth/list-accounts", "GET /api/auth/api-key/list", "GET /api/auth/organization/list", "GET /api/auth/organization/get-full-organization", "GET /api/auth/organization/get-active-member"];
	const hai = [];
	for (const d of duong) {
		const url = d.path.replace(/:[a-zA-Z]+/g, "khong-co").replace(/\*.*$/, "");
		const verb = d.method.toLowerCase() as "get" | "post" | "patch" | "put" | "delete";
		if (!(verb in request(app.getHttpServer()))) continue;
		const res = await gan(request(app.getHttpServer())[verb](url).set("content-type", "application/json"), { cookie });
		if (res.status < 300) hai.push(`${d.method} ${d.path}`);
	}
	expect([...new Set(hai)].sort(), "duong tra 2xx ngoai tap khai").toEqual([...KHAI_2XX].sort());
});
```

`KHAI_2XX` chốt theo lần chạy đầu: đường nào trả 2xx mà KHÔNG nằm trong danh sách trên thì đọc code của đường đó — chỉ được thêm vào danh sách khi nó trả dữ liệu của chính người gọi hoặc dữ liệu công khai; đường trả bản ghi đối tác là lỗi thật, không thêm.

`nhat-ky`: `spyOn(process.stdout, "write")` như `logging.spec.ts`, gọi `contacts.list` bằng cookie okr rồi `users.me`; parse các dòng JSON, tìm dòng có `path === "contacts.list"` → `{ outcome: "err", role: "okr", phamVi: "doi-tac" }`; `users.me` → `{ outcome: "ok", role: "member", phamVi: "chung" }` (người member); và không dòng nào có `role === "okr" && phamVi === "doi-tac" && outcome === "ok"`. (Nếu `NODE_ENV` test in dạng chữ thay vì JSON, dùng `withNodeEnv("production", …)` của `logging.spec.ts`.)

- [ ] **Step 9: Ca cookie cũ (Review Focus 3)** — trong bài `ma-tran-trpc` hoặc bài riêng `doi-vai-hieu-luc-ngay`: gieo member, đăng nhập, `contacts.list` → 200; `db.member.update({ role: "okr" })`; cùng cookie `contacts.list` → 403 `KHONG_TRONG_PHAM_VI` (không chờ).

- [ ] **Step 10: Chạy xanh + chiều đỏ + suite** — từng bài qua `bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts -t <ten>"` PASS; chiều đỏ tạm: đổi `PhamViChungMiddleware` của `users.router.ts` sang `PhamViDoiTacMiddleware` → `ma-tran-trpc` đỏ in hai tập; hoàn lại. `bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts test/workspace.spec.ts test/sso.spec.ts"` vẫn xanh. `cd apps/api && bun run trpc:generate` (sinh lại `src/generated/server.ts` — `canManageSettings` mới, commit cùng). `bun run check-types`, `bun run lint`.

- [ ] **Step 11: Commit** — `git add apps/api && git commit -m "vai-chi-okr: lớp kiểm chung hỏi phạm vi dữ liệu, 24 router khai, nhật ký mang vai"`.

---

### Task 3: Gán vai ở màn Thành viên; ô cài đặt chung khoá theo quyền

**independent: true** (sau Task 1–2) · **phục vụ E8, E12, E13**

**Files:**
- Modify: `apps/app/lib/messages/settings-thanh-vien.ts`, `apps/app/app/(app)/[slug]/settings/agent-model.tsx`, `research-key.tsx`, `archive-retention.tsx`
- Test: `apps/api/test/vai-chi-okr.spec.ts` (bài `gan-vai`)

**Interfaces:** Consumes `WorkspaceService.setMemberRole/allowEmail`, `workspace.get.canManageSettings` (Task 2).

- [ ] **Step 1: Bài đỏ `gan-vai`** — thêm vào spec (dùng `WorkspaceService` như `go-la-cat-quyen.spec.ts`: `new WorkspaceService(db, { workspaceChanged: async () => undefined } as unknown as AgentTriggerService)`):

```ts
test("gan-vai: admin gan okr qua doi vai va loi moi; member khong gan duoc; chu so huu cuoi khong bi ha", async () => {
	const chu = await gieoNguoi("chu", "owner");
	const admin = await gieoNguoi("admin", "admin");
	const nguoi = await gieoNguoi("nguoi", "member");
	const memberId = async (userId: string) => (await db.member.findFirstOrThrow({ where: { organizationId: WORKSPACE_ID, userId }, select: { id: true } })).id;
	await workspace.setMemberRole(admin.userId, { memberId: await memberId(nguoi.userId), role: "okr" });
	expect((await db.member.findFirstOrThrow({ where: { userId: nguoi.userId }, select: { role: true } })).role).toBe("okr");
	const emailMoi = `${id("moi")}@thu.test`;
	await workspace.allowEmail(admin.userId, { email: emailMoi, role: "okr" });
	expect((await db.invitation.findFirstOrThrow({ where: { email: emailMoi }, select: { role: true } })).role).toBe("okr");
	await db.user.create({ data: { id: id("moi"), name: "moi", email: emailMoi, emailVerified: true, createdAt: new Date(), updatedAt: new Date() } });
	await datMatKhau(id("moi"));
	await dangNhap(emailMoi);
	expect((await db.member.findFirstOrThrow({ where: { userId: id("moi") }, select: { role: true } })).role).toBe("okr");
	await expect(workspace.setMemberRole(nguoi.userId, { memberId: await memberId(admin.userId), role: "okr" })).rejects.toThrow(/owner or an admin/);
	await expect(workspace.setMemberRole(chu.userId, { memberId: await memberId(chu.userId), role: "okr" })).rejects.toThrow(/needs an owner/);
	expect((await db.member.findFirstOrThrow({ where: { userId: chu.userId }, select: { role: true } })).role).toBe("owner");
	await workspace.setMemberRole(admin.userId, { memberId: await memberId(admin.userId), role: "okr" });
	const cookieAdmin = await dangNhap(admin.email);
	expect((await goiTrpc(app, "workspace.members", "query", {}, { cookie: cookieAdmin })).status).toBe(200);
	await expect(workspace.setMemberRole(admin.userId, { memberId: await memberId(nguoi.userId), role: "member" })).rejects.toThrow(/owner or an admin/);
});
```

- [ ] **Step 2: Chạy đỏ** — đỏ ở `allowEmail`/`setMemberRole` chỉ khi Task 1 chưa gộp; sau Task 1 phần lớn xanh — vẫn chạy để xác nhận cả ca chủ sở hữu cuối.

- [ ] **Step 3: Nhãn vai** — `settings-thanh-vien.ts`: trong `vaiTro` của `en` thêm `okr: "OKR only"`, của `vi` thêm `okr: "Chỉ OKR"` (sau `member`). Menu vai, hộp thoại cho phép và bộ lọc theo vai tự có mục mới (`Object.keys(t.vaiTro)`).

- [ ] **Step 4: Ba ô cài đặt chung khoá theo quyền** — ở `agent-model.tsx`, `research-key.tsx`, `archive-retention.tsx`: thêm `const workspace = useQuery(trpc.workspace.get.queryOptions()); const coQuyen = workspace.data?.canManageSettings ?? false;` và đặt `disabled={!coQuyen || …}` cho ô nhập và nút lưu, đúng cách `workspace-form.tsx` dùng `canRename`. Không đổi kiểu, không thêm className.

- [ ] **Step 5: Kiểm** — `bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts -t gan-vai"` PASS; `cd apps/app && bun test test/messages-guard.spec.ts` PASS (chuỗi hai tiếng); `bun run check-types`.

- [ ] **Step 6: Commit** — `git commit -m "vai-chi-okr: gán vai «Chỉ OKR» ở màn Thành viên, ô cài đặt chung khoá theo quyền"`.

---

### Task 4: Màn — ba hàm thuần, proxy, rail, thanh bên Cài đặt, Tổng quan rút gọn, trang «ngoài phạm vi»

**independent: true** (sau Task 1–2) · **phục vụ E5, E10, E11**

**Files:**
- Create: `apps/app/lib/pham-vi-man.ts`, `apps/app/test/pham-vi-man.spec.ts`, `apps/app/app/(app)/[slug]/ngoai-pham-vi/page.tsx`, `apps/app/lib/messages/ngoai-pham-vi.ts`, `apps/app/app/(app)/[slug]/tong-quan-chi-okr.tsx`
- Modify: `apps/app/lib/onboarding.ts`, `apps/app/proxy.ts`, `apps/app/components/app-icon-rail.tsx`, `apps/app/app/(app)/[slug]/layout.tsx`, `apps/app/app/(app)/[slug]/settings/settings-sidebar.tsx`, `apps/app/app/(app)/[slug]/settings/layout.tsx`, `apps/app/app/(app)/[slug]/page.tsx`, `apps/app/lib/messages/tong-quan.ts`, `apps/app/lib/messages/khung-ung-dung.ts` (không đổi khoá), `apps/api/test/vai-chi-okr.spec.ts` (bài `proxy-ngoai-pham-vi`)

**Interfaces:**
- Produces (`@/lib/pham-vi-man`): `KHU_DOI_TAC: readonly string[]`, `DUONG_NGOAI_PHAM_VI = "/ngoai-pham-vi"`, `CAI_DAT_MAC_DINH_CHI_OKR = "/settings/notifications"`, `mucRailChoVai(role: string | null): readonly MucRail[]`, `mucCaiDatChoVai(role: string | null): readonly MucCaiDat[]`, `dieuHuongTheoVai(role: string | null, pathname: string): { toi: string } | "ok"`.
- `WorkspaceGate.viewerRole: string | null` (`@/lib/onboarding`).

- [ ] **Step 1: Bài đỏ hàm thuần** — `apps/app/test/pham-vi-man.spec.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { MUC_CAI_DAT } from "@/lib/cai-dat-dieu-huong";
import { MUC_RAIL } from "@/lib/khung-dieu-huong";
import { dieuHuongTheoVai, mucCaiDatChoVai, mucRailChoVai } from "@/lib/pham-vi-man";

describe("pham vi man theo vai", () => {
	it("rail: okr hai muc, settings tro thang thong bao cua ban; vai khac du tam muc", () => {
		const okr = mucRailChoVai("okr");
		expect(okr.map((m) => m.key)).toEqual(["overview", "settings"]);
		expect(okr[1]?.href).toBe("/settings/notifications");
		expect(okr[1]?.related).toContain("/settings");
		expect(mucRailChoVai("member")).toBe(MUC_RAIL);
		expect(mucRailChoVai(null)).toBe(MUC_RAIL);
	});
	it("cai dat: okr hai muc ca nhan", () => {
		expect(mucCaiDatChoVai("okr").map((m) => m.khoa)).toEqual(["thongBaoCuaBan", "khoaApi"]);
		expect(mucCaiDatChoVai("admin")).toBe(MUC_CAI_DAT);
	});
	it("dieu huong: okr bi dua ve ngoai pham vi o khu doi tac va cai dat quan tri", () => {
		for (const p of ["/contacts", "/deals/abc", "/companies", "/campaigns/x", "/onboarding", "/chat/1", "/agents", "/settings/members", "/settings/organization", "/settings/tracking", "/settings"]) {
			const kq = dieuHuongTheoVai("okr", p);
			expect(kq, p).not.toBe("ok");
		}
		expect(dieuHuongTheoVai("okr", "/contacts")).toEqual({ toi: "/ngoai-pham-vi" });
		expect(dieuHuongTheoVai("okr", "/settings")).toEqual({ toi: "/settings/notifications" });
		for (const p of ["/", "/settings/notifications", "/settings/api-keys", "/ngoai-pham-vi"]) {
			expect(dieuHuongTheoVai("okr", p), p).toBe("ok");
		}
		expect(dieuHuongTheoVai("member", "/contacts")).toBe("ok");
		expect(dieuHuongTheoVai(null, "/contacts")).toBe("ok");
		expect(dieuHuongTheoVai("khach", "/contacts")).toBe("ok");
	});
});
```

- [ ] **Step 2: Chạy đỏ** — `cd apps/app && bun test test/pham-vi-man.spec.ts` → FAIL module.

- [ ] **Step 3: Hàm thuần** — `apps/app/lib/pham-vi-man.ts`:

```ts
import { laVaiChiOkr, toWorkspaceRole } from "@crm/validation/vai-workspace";
import { GOC_CAI_DAT, MUC_CAI_DAT, type MucCaiDat } from "@/lib/cai-dat-dieu-huong";
import { MUC_RAIL, type MucRail } from "@/lib/khung-dieu-huong";
import { isUnder } from "@/lib/proxy-paths";

export const KHU_DOI_TAC = ["/companies", "/contacts", "/deals", "/campaigns", "/onboarding", "/chat", "/agents"] as const;
export const DUONG_NGOAI_PHAM_VI = "/ngoai-pham-vi";
export const CAI_DAT_MAC_DINH_CHI_OKR = `${GOC_CAI_DAT}/notifications`;
const MUC_CAI_DAT_CHI_OKR: readonly MucCaiDat["khoa"][] = ["thongBaoCuaBan", "khoaApi"];

function chiOkr(role: string | null): boolean {
	return role !== null && laVaiChiOkr(toWorkspaceRole(role));
}

const RAIL_CHI_OKR: readonly MucRail[] = MUC_RAIL.flatMap((muc) => {
	if (muc.key === "overview") return [muc];
	if (muc.key === "settings") return [{ ...muc, href: CAI_DAT_MAC_DINH_CHI_OKR, related: [GOC_CAI_DAT] }];
	return [];
});

const CAI_DAT_CHI_OKR: readonly MucCaiDat[] = MUC_CAI_DAT.filter((m) => MUC_CAI_DAT_CHI_OKR.includes(m.khoa));

export function mucRailChoVai(role: string | null): readonly MucRail[] {
	return chiOkr(role) ? RAIL_CHI_OKR : MUC_RAIL;
}

export function mucCaiDatChoVai(role: string | null): readonly MucCaiDat[] {
	return chiOkr(role) ? CAI_DAT_CHI_OKR : MUC_CAI_DAT;
}

export function dieuHuongTheoVai(role: string | null, pathname: string): { toi: string } | "ok" {
	if (!chiOkr(role)) return "ok";
	if (KHU_DOI_TAC.some((khu) => isUnder(pathname, khu))) return { toi: DUONG_NGOAI_PHAM_VI };
	if (pathname === GOC_CAI_DAT) return { toi: CAI_DAT_MAC_DINH_CHI_OKR };
	if (isUnder(pathname, GOC_CAI_DAT) && !CAI_DAT_CHI_OKR.some((m) => isUnder(pathname, m.href))) {
		return { toi: DUONG_NGOAI_PHAM_VI };
	}
	return "ok";
}
```

(`isUnder` của `@/lib/proxy-paths` là hàm thuần đã có; kiểm nó khớp `/settings` với `/settings/x` nhưng không với `/settingsx` — nếu không, viết `duoi(p, goc) = p === goc || p.startsWith(goc + "/")` tại chỗ.) `toWorkspaceRole("khach")` → `member` → không chặn (Review Focus 4).

- [ ] **Step 4: Proxy** — `apps/app/lib/onboarding.ts`: `WorkspaceGate` thêm `viewerRole: string | null`; `readWorkspaceGate` trả `viewerRole: workspace.viewerRole ?? null` (cả nhánh `unknown`). `apps/app/proxy.ts`: sau `if (workspace.inWorkspace === false) …` và hai cổng onboarding/research, trước `settled`:

```ts
	if (workspace.slug) {
		const duong = dieuHuongTheoVai(workspace.viewerRole, boSlug(pathname, workspace.slug));
		if (duong !== "ok") return sendTo(workspaceUrl(workspace.slug, duong.toi), request);
	}
```

với `function boSlug(pathname: string, slug: string): string { const [first, ...rest] = pathname.slice(1).split("/"); return first === slug ? `/${rest.join("/")}` : pathname; }` và import `dieuHuongTheoVai` từ `@/lib/pham-vi-man` (file thuần, chạy được ở rìa). Kiểm tra `workspaceUrl(slug, "/ngoai-pham-vi")` trả `/<slug>/ngoai-pham-vi` (đọc `lib/workspace-url.ts`).

- [ ] **Step 5: Bài `proxy-ngoai-pham-vi` (E5)** — trong `vai-chi-okr.spec.ts`, chép `locationQuaProxy(cookie, apiUrl, duong)` từ `go-la-cat-quyen.spec.ts` (thêm tham số đường thay `/contacts`), mở API thật trên cổng tạm như bài E10 cũ (`app.listen(0)` rồi đọc `AddressInfo`):

```ts
test("proxy-ngoai-pham-vi: okr bi dua ve trang ngoai pham vi, member khong; proxy van doc tu cach", async () => {
	const okr = await gieoNguoi("okr", "okr"); const member = await gieoNguoi("member", "member");
	const cookieOkr = await dangNhap(okr.email); const cookieMember = await dangNhap(member.email);
	const server = app.getHttpServer(); await new Promise<void>((r) => server.listen(0, r));
	const apiUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
	for (const p of ["/contacts", "/deals", "/onboarding", "/chat", "/settings/members"]) {
		expect(await locationQuaProxy(cookieOkr, apiUrl, p), p).toMatch(/\/ngoai-pham-vi$/);
	}
	for (const p of ["/", "/settings/notifications"]) {
		expect(await locationQuaProxy(cookieOkr, apiUrl, p) ?? "", p).not.toContain("ngoai-pham-vi");
	}
	expect(await locationQuaProxy(cookieOkr, apiUrl, "/settings")).toMatch(/\/settings\/notifications$/);
	expect(await locationQuaProxy(cookieMember, apiUrl, "/contacts") ?? "").not.toContain("ngoai-pham-vi");
	const res = await goiTrpc(app, "workspace.get", "query", undefined, { cookie: cookieOkr });
	expect(res.status).toBe(200); expect(res.body.result.data.viewerRole).toBe("okr");
});
```

- [ ] **Step 6: Rail và tìm nhanh theo vai** — `app-icon-rail.tsx`: `const workspace = useQuery(trpc.workspace.get.queryOptions())` (import `useQuery`, `useTRPC`); `const mucs = mucRailChoVai(workspace.data?.viewerRole ?? null)`; `items` dựng từ `mucs` thay `MUC_RAIL`; khi `!workspace.data` trả `<AppIconRailFallback />`. `[slug]/layout.tsx`: thay `<AppIconRail />` bằng server component `RailTheoVai` (await `loadWorkspace()` — đã có — rồi `<HydrateClient><AppIconRail /></HydrateClient>`), và `QuickSwitcher` chỉ dựng khi `!laVaiChiOkr(workspace?.viewerRole)` (layout là server component, import `laVaiChiOkr` từ `@crm/validation/vai-workspace`).

- [ ] **Step 7: Thanh bên Cài đặt theo vai** — `settings/layout.tsx`: server component `ThanhBenTheoVai` prefetch `workspace.get` qua `getServerQueryClient().prefetchQuery(getServerTrpc().workspace.get.queryOptions())` rồi `<HydrateClient><SettingsSidebar /></HydrateClient>`; `settings-sidebar.tsx`: `useQuery(trpc.workspace.get…)`, `items` từ `mucCaiDatChoVai(role)`; chưa có data → `<SettingsSidebarFallback />`.

- [ ] **Step 8: Tổng quan rút gọn** — `lib/messages/tong-quan.ts` thêm `chiOkr: { moTa: "The OKR area opens in a later release. Until then you can connect your reminder channel.", noiKenh: "Open your notifications" }` / vi `{ moTa: "Khu OKR mở ở lượt sau. Trong lúc chờ, bạn có thể nối kênh nhắc.", noiKenh: "Mở Thông báo của bạn" }`. `tong-quan-chi-okr.tsx` (server component): `PageShellTitle` lời chào (`greeting.title`), `PageShellDescription` `chiOkr.moTa`, `<Button asChild variant="outline"><Link href={workspaceUrl(slug, "/settings/notifications")}>{chiOkr.noiKenh}</Link></Button>`. `[slug]/page.tsx`: `OverviewPage` thành async, `const workspace = await getServerTrpcClient().workspace.get.query()`; nếu `laVaiChiOkr(toWorkspaceRole(workspace.viewerRole ?? "member"))` → trả `PageShell` với `TongQuanChiOkr` (không `OverviewScopeToggle`, không `Summary`), ngược lại như cũ.

- [ ] **Step 9: Trang «ngoài phạm vi»** — `lib/messages/ngoai-pham-vi.ts`:

```ts
import type { Locale } from "@crm/ui/lib/locale";
const en = { tieuDe: "This part is not in your role", than: "The OKR-only role does not read partner data. Ask an admin if you need another role.", veTongQuan: "Back to Overview" };
const vi: typeof en = { tieuDe: "Phần này không thuộc vai của bạn", than: "Vai chỉ OKR không đọc dữ liệu đối tác. Hỏi quản trị nếu bạn cần vai khác.", veTongQuan: "Về Tổng quan" };
export function ngoaiPhamViMessages(locale: Locale) { return locale === "vi" ? vi : en; }
```

`ngoai-pham-vi/page.tsx`: `PageShell` + `PageShellHeader` (`PageShellTitle` = tieuDe, `PageShellDescription` = than) + `PageShellContent` với `<Button asChild variant="outline"><Link href={workspaceUrl(slug, "/")}>{veTongQuan}</Link></Button>`; `generateMetadata` trả tiêu đề. Slug từ `params`.

- [ ] **Step 10: Kiểm** — `cd apps/app && bun test test/pham-vi-man.spec.ts test/khung-dieu-huong.spec.ts test/cai-dat-dieu-huong.spec.ts test/messages-guard.spec.ts` PASS; `bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts -t proxy-ngoai-pham-vi"` PASS; chiều đỏ: bỏ dòng gọi `dieuHuongTheoVai` khỏi proxy → bài đỏ in location; hoàn lại. `bun run check-types`, `bun run lint`, build với PATH Node 24.

- [ ] **Step 11: Commit** — `git commit -m "vai-chi-okr: màn theo vai — rail, Cài đặt, Tổng quan rút gọn, trang ngoài phạm vi, proxy"`.

---

### Task 5: Trợ lý AI — hai ổ khoá

**independent: true** (sau Task 1) · **phục vụ E6, E7**

**Files:**
- Create: `apps/app/test/eve-cau-noi-chi-okr.spec.ts`, `apps/agent/test/kenh-chi-okr.spec.ts`
- Modify: `apps/app/app/eve/v1/[...path]/route.ts`, `apps/agent/agent/channels/eve.ts`

- [ ] **Step 1: Bài đỏ đường nối** — chép `eve-cau-noi-thanh-vien.spec.ts` thành `eve-cau-noi-chi-okr.spec.ts` (suffix `-okr`), `gieoNguoi(userId, vai: "member" | "okr")` ghi `role: vai`; hai ca: member → 200 và `daChuyenToiAgent.length === 1`; okr → 403, `body.error === KHONG_TRONG_PHAM_VI` (import từ `@crm/validation/vai-workspace`), `daChuyenToiAgent` không tăng.

- [ ] **Step 2: Bài đỏ kênh** — `apps/agent/test/kenh-chi-okr.spec.ts`: chép `mint`, `request`, `claims` từ `channel-auth.spec.ts`; gieo hai người thật (`db.user.upsert` + `db.member.upsert` với `role: "okr"` / `"member"`, workspace `WORKSPACE_ID` như `phien-thu.ts`) với id mang suffix `${process.env.TEST_RUN_ID ?? "kenh-chi-okr"}`; `auth(request(await mint(claims({ sub: idOkr }))))` → `null`; `sub: idMember` → `toMatchObject({ principalId: idMember, principalType: "user" })`; `sub: "khong-co"` → `null`; `afterAll` dọn.

- [ ] **Step 3: Chạy đỏ** — `bun run test -- "cd apps/app && bun test test/eve-cau-noi-chi-okr.spec.ts"` FAIL (okr được chuyển); `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/kenh-chi-okr.spec.ts"` FAIL (okr thành principal).

- [ ] **Step 4: Ổ khoá 1** — `route.ts`: import `docDuocPhamVi, KHONG_TRONG_PHAM_VI, NOT_A_MEMBER, workspaceRoleOf` từ `@crm/auth`; thay khối tư cách:

```ts
	const role = await workspaceRoleOf(session.user.id);
	if (!role) return Response.json({ error: NOT_A_MEMBER }, { status: 403 });
	if (!docDuocPhamVi(role, "doi-tac")) {
		return Response.json({ error: KHONG_TRONG_PHAM_VI }, { status: 403 });
	}
```

- [ ] **Step 5: Ổ khoá 2** — `channels/eve.ts`: import `db` từ `@crm/db`, `WORKSPACE_ID` từ `@crm/db/workspace`, `laVaiChiOkr, toWorkspaceRole` từ `@crm/validation/vai-workspace`; sau `if (!userId) return null;`:

```ts
			const member = await db.member.findUnique({
				where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId } },
				select: { role: true },
			});
			if (!member || laVaiChiOkr(toWorkspaceRole(member.role))) return null;
```

Kiểm `channel-auth.spec.ts` cũ: nó dùng `sub: "user_123"` không có dòng member → nay trả `null` → bài cũ đỏ. Sửa bài cũ bằng cách gieo `user_123` làm member trong `beforeAll` (và dọn trong `afterAll`) — đây là sửa đúng nghĩa: kênh nay đòi tư cách; ghi một dòng vào `docs/agent.md` mục «The bridge».

- [ ] **Step 6: Kiểm** — hai bài xanh; `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/channel-auth.spec.ts"` xanh; chiều đỏ: bỏ lần đọc member → `kenh-chi-okr` đỏ in principal; hoàn lại.

- [ ] **Step 7: Commit** — `git commit -m "vai-chi-okr: trợ lý AI từ chối vai chỉ OKR ở đường nối và ở kênh"`.

---

### Task 6: Tường hộp thư đọc vai ở chỗ nối

**independent: true** (sau Task 1) · **phục vụ E9b**

**Files:**
- Create: `apps/app/test/tuong-hop-thu.spec.ts`
- Modify: `apps/app/lib/session.ts`, `apps/app/app/(landing)/grant-access/page.tsx`

**Interfaces:** Produces `hopThuCanCap(userId: string): Promise<MailboxProviderId[]>` (`@/lib/session`).

- [ ] **Step 1: Bài đỏ** — gieo hai người thật (user + member `okr`/`member` + `db.account` `{ providerId: "google", scope: "openid email profile", accountId, userId }`); `expect(await hopThuCanCap(idOkr)).toEqual([])`; `expect(await hopThuCanCap(idMember)).toEqual(["google"])`; thêm account `credential` cho okr → vẫn `[]`. `mock.module("next/headers", …)` không cần vì hàm nhận `userId`.

- [ ] **Step 2: Sửa `session.ts`**:

```ts
import { auth, mailboxGrantsNeeded, type MailboxProviderId, type Session, workspaceRoleOf } from "@crm/auth";

export async function hopThuCanCap(userId: string): Promise<MailboxProviderId[]> {
	const [accounts, role] = await Promise.all([signInAccounts(userId), workspaceRoleOf(userId)]);
	return mailboxGrantsNeeded(accounts, role);
}

export async function requireMailboxAccess(): Promise<Session> {
	const session = await requireSession();
	if ((await hopThuCanCap(session.user.id)).length > 0) redirect("/grant-access");
	return session;
}
```

(`MailboxProviderId` phải được xuất từ `@crm/auth` — kiểm `index.ts`, thêm nếu thiếu.) `apps/app/app/(landing)/grant-access/page.tsx` dòng 19 gọi `mailboxGrantsNeeded(await signInAccounts(user.id))` — đổi thành `await hopThuCanCap(user.id)` để hai chỗ cùng một câu trả lời.

- [ ] **Step 3: Kiểm + commit** — `bun run test -- "cd apps/app && bun test test/tuong-hop-thu.spec.ts"` PASS; chiều đỏ: gọi `mailboxGrantsNeeded(accounts)` không vai → đỏ. `git commit -m "vai-chi-okr: tường xin quyền hộp thư không áp cho vai chỉ OKR"`.

---

### Task 7: Ui-check bằng Chrome, tài liệu, khép vòng

**independent: false** (sau mọi task) · **phục vụ E11, E12, E13**

**Files:**
- Create: `_acceptance/vai-chi-okr/rang/man-chi-okr.mjs`
- Modify: `docs/api.md` (mục tRPC: luật phạm vi, bốn lớp, lớp nền trần = chặn okr; `canManageSettings`), `docs/agent.md` (kênh đòi tư cách và từ chối okr)

- [ ] **Step 1: Script** — theo khuôn `_acceptance/cau-truc-to-chuc/rang/man-to-chuc.mjs` (import `canhCay`, `man-that-lib.mjs`, `puppeteer-core`, `db`): `canhCay()` trước; `dev:session` cho hai địa chỉ (`<MA>-okr@thu.test`, `<MA>-admin@thu.test`), ghi `db.member.role` tương ứng; với người okr: mở `/<slug>` ở 375 và 1440 × vi/en → chụp `evidence/tong-quan-okr-<kho>-<tieng>.png`, đếm `a` trong `nav[aria-label]` của rail = 2, `document.body.innerText` không chứa các nhãn đối tác (`khungUngDungMessages(locale).rail` trừ overview/settings), có `a[href$="/settings/notifications"]`; mở `/<slug>/settings/notifications` → thanh bên có đúng 2 mục → chụp; gõ `/<slug>/contacts` → URL cuối kết thúc `/ngoai-pham-vi`, `h1` = tieuDe, có liên kết về `/<slug>` → chụp, bấm → về `/<slug>`; trên ba màn bật `page.on("request")` đếm request tới `/api/trpc/` có alias thuộc `doi-tac` = 0 và không response 403; `?sheet=contact:abc` không lỗi console ngoài 403 mong đợi (Review Focus 2); người admin: `/<slug>` rail 8 link → chụp; `/<slug>/settings/members` mở menu vai của người okr-gieo-sẵn-là-member → 4 mục, có «Chỉ OKR» → chụp; chọn → ô đổi «Chỉ OKR» → chụp; đọc `db.member.role === "okr"` (E13); mở hộp thoại cho phép → ô vai có «Chỉ OKR» → chụp. Mọi ô: `scrollWidth <= innerWidth`, không lỗi hydrat. Mã thoát ≠ 0 kèm thông điệp ghim khi lệch.

- [ ] **Step 2: Chạy** — dựng app+api của cây này ở cổng 3710/3711 (`.claude/launch.json` `app-cay-nay`/`api-cay-nay` chỉnh cổng hoặc `PORT=3711 bun run dev` ở `apps/api`, `PORT=3710 … apps/app`), rồi `bun run test -- "APP_URL=http://localhost:3710 API_URL=http://localhost:3711 bun scripts/lan-do/tien-de.mjs --chay 'bun _acceptance/vai-chi-okr/rang/man-chi-okr.mjs'"` (chính lệnh `vco_man_chrome`). Chiều đỏ: bỏ bộ lọc `mucRailChoVai` khỏi rail → script đỏ in danh sách nhãn; hoàn lại.

- [ ] **Step 3: Tài liệu** — `docs/api.md` mục «tRPC is the data surface»: thay đoạn `AuthMiddleware means signed in AND a member` bằng luật mới (ba câu hỏi; bốn lớp; bảng khai; lớp nền trần = router chưa khai = vai okr bị chặn; thông điệp `KHONG_TRONG_PHAM_VI` từ `@crm/validation/vai-workspace`; `workspace.get` vẫn `SignedInMiddleware`); mục Permissions thêm `canManageSettings`. `docs/agent.md` mục «The bridge»: kênh `repFromCrm` đọc dòng thành viên, từ chối vai `okr` và người không có dòng.

- [ ] **Step 4: Bộ chứng năm lệnh** — `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `PATH="/Users/manhphan/.local/share/fnm/node-versions/v24.15.0/installation/bin:$PATH" bun run build` xanh. Đặt contract `status: implemented`. Commit: `git commit -m "vai-chi-okr: ui-check màn theo vai, tài liệu API và trợ lý AI"`.

---

## Self-review

- Spec coverage: mục 1 → Task 1; mục 2 → Task 2; mục 3 (nhật ký) → Task 2 bước 5/8; mục 4 (màn) → Task 4; mục 5 (gán vai) → Task 3; mục 6 (trợ lý AI) → Task 5; mục 7 (hộp thư) → Task 1 + 6; AC-12/AC-13 (gap-probe) → Task 2 bước 7/8; ui-check → Task 7.
- Tên nhất quán: `docDuocPhamVi`, `laVaiChiOkr`, `KHONG_TRONG_PHAM_VI`, `PhamVi*Middleware`, `setRequestScope`, `canManageSettings`, `hopThuCanCap`, `mucRailChoVai`, `mucCaiDatChoVai`, `dieuHuongTheoVai`, `DUONG_NGOAI_PHAM_VI` dùng cùng tên ở mọi task và khớp `evals.yaml`.
- Review Focus: 1 → Task 1 bước 1; 2 → Task 7; 3 → Task 2 bước 9; 4 → Task 4 bước 1; 5 → Task 3 bước 1.
