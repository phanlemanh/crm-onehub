# Thành viên vào đúng — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quản trị đặt được tên miền nội bộ; cho phép một người đã là thành viên bị từ chối và dòng treo cũ thôi hiện; nút «Cho phép một địa chỉ» không mất sau lỗi; dựng lại thành viên theo luật «có dòng còn hiệu lực thì cho»; một lệnh soi production chỉ đọc.

**Architecture:** Hai thủ tục mới trong router `workspace` ghi cột có sẵn `appSetting.staffEmailDomains`; `allowEmail`/`allowances` trong `WorkspaceService` chặn và đọc lại dòng treo; `ensureWorkspaceMembership` đổi luật một nhánh; nút đầu trang chuyển sang đọc `useQuery(workspace.get)` phía trình duyệt; lệnh soi `apps/api/scripts/soi-thanh-vien.ts` chạy trong giao dịch `READ ONLY`.

**Tech Stack:** NestJS + nestjs-trpc, Prisma (Postgres), Better Auth, Next.js App Router, TanStack Query, `@crm/ui`, bun test, puppeteer-core.

**Spec:** `docs/superpowers/specs/2026-10-04-thanh-vien-vao-dung-design.md` · hợp đồng `_acceptance/thanh-vien-vao-dung/contract.md` · evals `_acceptance/thanh-vien-vao-dung/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã, kể cả mã sửa lại (`AGENTS.md`).
- Bun 1.3.12 (`/opt/homebrew/bin/bun`).
- Ranh giới P3 (`.acceptance-runs/dieu-phoi-1410/LUAT.md`): `apps/api/src/workspace/**`, `settings/members/**`, `packages/auth/**`. Ngoài ranh: chỉ THÊM — `apps/api/src/companies/domain.ts` (một hàm xuất), `apps/app/lib/trpc/cache.ts` (một khoá), `apps/app/lib/messages/settings-thanh-vien.ts` (một nhóm khoá mới ở cuối), `CONTEXT.md`, `_acceptance/config.yaml` (khoá `r1b_`).
- Không migration. Không ghi dữ liệu production.
- Chuỗi giao diện có cả `vi` lẫn `en`; chuỗi `vi` có dấu; khoá hàm mới phải ghim ở `messages-guard.spec.ts` (tránh khoá hàm nếu không cần).
- UI theo `docs/settings.md`: Section = `Card` một hộp; ô gõ chữ → `form` + «Lưu» ở `CardAction`, bật khi đã sửa và hợp lệ, spinner khi lưu; đang tải = khung xương; lỗi tải = `Empty` + «Thử lại»; không đủ quyền = điều khiển khoá + dòng lý do.
- Thông điệp API giữ tiếng Anh (Out of scope Việt hoá).
- Thông điệp ghim: `That person is already a member. Change their role in the members table.` · `Only an owner or an admin can allow an address.` (có sẵn) · lý do lập hồ sơ `One of our own addresses` (có sẵn).
- Cổng dev tay 3330/3331; bàn đo màn qua `mot-luot.sh` (tự lấy cổng).
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: đối chứng dương + phá-thử trong bản sao với thông điệp ghim (MEASURE-BIRTH-CLAUSE). Bản sao đột biến đặt ở `.acceptance-runs/thanh-vien-vao-dung/` (memory «Bản sao đột biến ở thư mục ẩn»), không phá-thử tại chỗ khi chưa commit.

## Review Focus

- Danh sách có dấu phẩy thừa, xuống dòng, khoảng trắng, hoa thường lẫn lộn → lưu bản gọn, không mục rỗng (Task 1, ca `ghi-chuan-hoa`).
- Hơn 20 tên miền → 400, cột không đổi (Task 1, ca `tran-20`).
- Tên miền phụ (`mail.onehub.vn`) → nhận như một mục riêng, không gộp vào tên miền cha (Task 1, ca `ten-mien-phu`).
- Tên miền có dấu (`công-ty.vn`) → lưu đúng dạng `normalizeDomain` trả (punycode), không ném 500 (Task 1, ca `ten-mien-co-dau`).
- Người dùng có hàng `user` nhưng không còn `member` (đã bị gỡ) → cho phép lại vẫn được, không bị chặn nhầm là «đã là thành viên» (Task 2, ca `cho-phep-lai-sau-go`, E12).

---

### Task 1: API tên miền nội bộ

**Phục vụ:** E1, E2, E3, E5, E7 · **independent:** true (so với Task 3, 4) · **verify:** `bun run test -- "cd apps/api && bun test test/thanh-vien-vao-dung.spec.ts -t ten-mien"`

**Files:**
- Modify: `apps/api/src/companies/domain.ts` (THÊM `export function isFreeEmailDomain`)
- Modify: `apps/api/src/workspace/staff-domains.ts` (thêm `writeStaffDomains`, `STAFF_DOMAINS_MAX`)
- Modify: `apps/api/src/workspace/workspace.contracts.ts` (`staffDomainsOutput`, `setStaffDomainsInput`)
- Modify: `apps/api/src/workspace/workspace.service.ts` (`staffDomains`, `setStaffDomains`)
- Modify: `apps/api/src/workspace/workspace.router.ts` (hai thủ tục)
- Create: `apps/api/test/thanh-vien-vao-dung.spec.ts` (describe `ten-mien`)

**Interfaces:**
- Produces: `workspace.staffDomains` → `{ domains: string[]; canEdit: boolean }`; `workspace.setStaffDomains({ domains: string[] })` → cùng hình; `isFreeEmailDomain(domain: string): boolean`; `writeStaffDomains(db: Db, domains: readonly string[]): Promise<void>`.

- [ ] **Step 1: Viết test đỏ** — `apps/api/test/thanh-vien-vao-dung.spec.ts`, dựng như `workspace-thanh-vien.spec.ts` (`new WorkspaceService(db, agent)`, `dungNguoi`, `don`) cho lớp dịch vụ và như `cai-dat-chung-chi-quan-tri.spec.ts` (`createApp`, `mintPhien`, `gieoThanhVien`, `supertest` POST `/api/trpc/workspace.setStaffDomains`, GET `/api/trpc/workspace.staffDomains`) cho ca `ba-vai`. Các ca trong `describe("ten-mien")`:
  - `ghi-chuan-hoa`: trước ghi `staffDomains` trả `[]` và cột null; `setStaffDomains(quan, { domains: ["  @OneHub.Center", "onehub.vn", "onehub.center "] })` → `{ domains: ["onehub.center","onehub.vn"], canEdit: true }`; `db.appSetting.findUnique({ where: { id: APP_SETTING_ID } })` → `staffEmailDomains === "onehub.center,onehub.vn"`; mảng có mục rỗng `["onehub.vn", "", "  "]` → `["onehub.vn"]` (máy khách tách chuỗi trước khi gửi, API nhận mảng).
  - `hai-duong-doc`: kiểm điều kiện trước `db.user.count({ where: { email: { endsWith: "@onehub.vn" } } }) === 0`; với cột null, `nopForm` (chép từ `domain-nha-tach.spec.ts`) cho `khach-<suffix>@onehub.vn` KHÔNG trả `"One of our own addresses"`; sau `setStaffDomains` → trả đúng `"One of our own addresses"` và `(await hopThu.internalIdentity()).domains.has("onehub.vn") === true`.
  - `tu-choi`: ma trận `[["khong phai ten mien"],["ai@onehub.vn"],["gmail.com"]]`; mỗi dòng cột đặt `onehub.center` trước, gọi với `["onehub.vn", muc]`, bắt lỗi `BadRequestException`, `expect(message).toContain(muc)`, cột vẫn `"onehub.center"`. Đối chứng dương `["onehub.vn"]` → qua.
  - `xoa-trang`: cột `onehub.center` → `setStaffDomains(quan, { domains: [] })` → cột `null`, `staffEmailDomains(db)` → `[]`, `nopForm` @onehub.center không còn `"One of our own addresses"`.
  - `tran-20`: 21 mục `t0.vn…t20.vn` → 400 chứa `"20"`, cột không đổi.
  - `ten-mien-phu`: `["onehub.vn","mail.onehub.vn"]` → lưu cả hai.
  - `ten-mien-co-dau`: `["công-ty.vn"]` → không ném 500; lưu đúng `normalizeDomain("công-ty.vn")`.
  - `ba-vai` (qua HTTP thật): owner/admin `canEdit: true`; member đọc được `canEdit: false`, ghi → 403, cột không đổi; người ngoài (user không member) → 403 với `NOT_A_MEMBER` ở cả hai; `okr` (vai chỉ OKR) → ghi nhận kết quả thật của `PhamViChungMiddleware` và ghim vào test (đọc `docDuocPhamVi` trước khi viết kỳ vọng).
  - `afterAll`: trả cột về giá trị trước test.
- [ ] **Step 2: Chạy, thấy đỏ** — `bun run test -- "cd apps/api && bun test test/thanh-vien-vao-dung.spec.ts -t ten-mien"` → FAIL `workspace.setStaffDomains is not a function`.
- [ ] **Step 3: Cài**

```ts
// apps/api/src/companies/domain.ts — thêm, không sửa dòng cũ
export function isFreeEmailDomain(input: string): boolean {
	const domain = normalizeDomain(input);
	return domain !== null && FREE_EMAIL_DOMAINS.has(domain);
}
```

```ts
// apps/api/src/workspace/staff-domains.ts — thêm
export const STAFF_DOMAINS_MAX = 20;

export async function writeStaffDomains(
	db: Db,
	domains: readonly string[],
): Promise<void> {
	const value = domains.length === 0 ? null : domains.join(",");
	await db.appSetting.upsert({
		where: { id: APP_SETTING_ID },
		create: { id: APP_SETTING_ID, staffEmailDomains: value },
		update: { staffEmailDomains: value },
	});
}
```

```ts
// workspace.contracts.ts — thêm
export const staffDomainsOutput = z.object({
	domains: z.array(z.string()),
	canEdit: z.boolean(),
});
export const setStaffDomainsInput = z.object({
	domains: z.array(z.string().max(255)).max(100),
});
export type SetStaffDomainsInput = z.infer<typeof setStaffDomainsInput>;
export type StaffDomains = z.infer<typeof staffDomainsOutput>;
```

```ts
// workspace.service.ts — thêm hai phương thức
async staffDomains(userId: string): Promise<StaffDomains> {
	const role = await workspaceRoleOf(userId);
	return {
		domains: [...(await staffEmailDomains(this.db))],
		canEdit: canManageSettings(role),
	};
}

async setStaffDomains(userId: string, input: SetStaffDomainsInput): Promise<StaffDomains> {
	const role = await workspaceRoleOf(userId);
	if (!canManageSettings(role)) {
		throw new ForbiddenException("Only an owner or an admin can change the staff email domains.");
	}
	const domains = chuanHoaTenMien(input.domains);
	const truoc = await staffEmailDomains(this.db);
	await writeStaffDomains(this.db, domains);
	this.logger.log({ message: "Staff domains changed", userId, from: truoc, to: domains });
	return { domains, canEdit: true };
}
```

`chuanHoaTenMien` là hàm thuần trong `staff-domains.ts`: trim, bỏ `@` đầu, bỏ mục rỗng; mục có `@` ở giữa → `BadRequestException("<mục> is an email address. Enter only the part after @.")`; `normalizeDomain(mục) === null` → `BadRequestException("<mục> is not a domain. Enter one like onehub.vn.")`; `isFreeEmailDomain` → `BadRequestException("<mục> is a public mail domain, not one of ours. Remove it and save again.")`; bỏ trùng giữ thứ tự; quá `STAFF_DOMAINS_MAX` → `BadRequestException("Enter at most 20 domains.")`. Router: `@Query` `staffDomains` (output `staffDomainsOutput`, `restMeta("GET", "/workspace/staff-domains", ["Workspace"])`) và `@Mutation` `setStaffDomains` (`restMeta("PUT", "/workspace/staff-domains", ["Workspace"])`), cả hai `@UseMiddlewares(PhamViChungMiddleware)`.
- [ ] **Step 4: Chạy xanh** cùng lệnh Step 2 → PASS.
- [ ] **Step 5: Phá-thử** trên bản sao ở `.acceptance-runs/thanh-vien-vao-dung/sao-t1/` (symlink `node_modules`): bỏ bước bỏ trùng → `ghi-chuan-hoa` đỏ với `"onehub.center,onehub.vn,onehub.center"`; bỏ kiểm `isFreeEmailDomain` → `tu-choi` đỏ ở `gmail.com`; bỏ kiểm vai → `ba-vai` đỏ ở member; lưu `""` thay `null` → `xoa-trang` đỏ. Ghi bốn dòng vào `.acceptance-runs/thanh-vien-vao-dung/pha-thu.md`.
- [ ] **Step 6: Commit** — `feat: đường ghi tên miền nội bộ trong workspace`.

### Task 2: API cho phép một địa chỉ

**Phục vụ:** E9, E11, E12, E24 · **independent:** false (cùng `workspace.service.ts` với Task 1 — làm sau Task 1) · **verify:** `bun run test -- "cd apps/api && bun test test/thanh-vien-vao-dung.spec.ts -t cho-phep"`

**Files:**
- Modify: `apps/api/src/workspace/workspace.service.ts` (`allowEmail`, `allowances`)
- Test: `apps/api/test/thanh-vien-vao-dung.spec.ts` (describe `cho-phep`)

**Interfaces:**
- Consumes: `normalizeEmail` (`@crm/auth`).
- Produces: hằng `ALREADY_A_MEMBER = "That person is already a member. Change their role in the members table."` xuất từ `workspace.service.ts` để test DOM và bàn đo đọc cùng một chuỗi.

- [ ] **Step 1: Test đỏ** — `describe("cho-phep")`:
  - `da-la-thanh-vien`: gieo user `tvvd-<suffix>@lan-do.onehub.vn` + member; `allowEmail(quan, { email: "  TVVD-<suffix>@Lan-Do.OneHub.vn ", role: "member" })` → `BadRequestException` message đúng `ALREADY_A_MEMBER`; `demDong` trước = sau. Đối chứng dương: địa chỉ chưa là thành viên → tạo 1 dòng `pending`.
  - `treo-khi-doc`: gieo member + `db.invitation.create` `pending` cùng địa chỉ (id tiền tố suffix) + một địa chỉ `pending` không thuộc ai; `allowances(quan)` → dòng treo `status: "accepted"`, dòng kia `"pending"`; đọc lại DB dòng treo vẫn `"pending"`.
  - `cho-phep-lai-sau-go`: gieo thành viên, `removeMember(quan, { memberId })`, `allowEmail(quan, { email, role: "admin" })` → `pending`; `ensureWorkspaceMembership(userId, email)` → member role `admin`, dòng mới `accepted`.
  - `khong-quyen` (HTTP thật như Task 1 `ba-vai`): member POST `/api/trpc/workspace.allowEmail` → 403, message chứa `"Only an owner or an admin can allow an address."`, `demDong` không đổi; admin cùng lời gọi → 1 dòng `pending`.
- [ ] **Step 2: Chạy đỏ** → `da-la-thanh-vien` và `treo-khi-doc` FAIL; `cho-phep-lai-sau-go` và `khong-quyen` PASS sẵn (đối chứng không hồi quy — ghi rõ trong pha-thu.md).
- [ ] **Step 3: Cài**

```ts
export const ALREADY_A_MEMBER =
	"That person is already a member. Change their role in the members table.";

// trong allowEmail, sau khi chuẩn hoá email, trước kiểm `live`
const thanhVien = await this.db.member.findFirst({
	where: {
		organizationId: WORKSPACE_ID,
		user: { email: { equals: email, mode: "insensitive" } },
	},
	select: { id: true },
});
if (thanhVien) throw new BadRequestException(ALREADY_A_MEMBER);
```

```ts
// trong allowances, sau findMany
const thanhVien = new Set(
	(
		await this.db.member.findMany({
			where: { organizationId: WORKSPACE_ID },
			select: { user: { select: { email: true } } },
		})
	)
		.map((m) => normalizeEmail(m.user.email))
		.filter((e): e is string => e !== null),
);
// toAllowance nhận thêm cờ daVao: dòng pending có email thuộc thanhVien → status "accepted"
```

- [ ] **Step 4: Chạy xanh.**
- [ ] **Step 5: Phá-thử** trên bản sao: bỏ kiểm thành viên → `da-la-thanh-vien` đỏ (đếm tăng 1, ghim `already a member`); bỏ đổi trạng thái khi đọc → `treo-khi-doc` đỏ (`expected "accepted"`); kiểm bằng `user` thay vì `member` → `cho-phep-lai-sau-go` đỏ; bỏ kiểm vai → `khong-quyen` đỏ.
- [ ] **Step 6: Commit** — `fix: từ chối cho phép người đã là thành viên, đọc dòng treo thành đã vào`.

### Task 3: Luật dựng lại thành viên

**Phục vụ:** E14 · **independent:** true · **verify:** `bun run test -- "cd apps/api && bun test test/thanh-vien-vao-dung.spec.ts -t dung-lai"`

**Files:**
- Modify: `packages/auth/src/organization.ts:84-100`
- Test: `apps/api/test/thanh-vien-vao-dung.spec.ts` (describe `dung-lai`)

- [ ] **Step 1: Test đỏ** — `describe("dung-lai")`: lưu toàn bộ hàng `member` của workspace vào biến, `db.member.deleteMany({ where: { organizationId: WORKSPACE_ID } })`; gieo user A (invitation `canceled` + `pending`), B (`canceled`), C (không dòng), D (một dòng `status: "bi-hong"`); `spyOn(console, "error")`; `ensureWorkspaceMembership(C.id, C.email)`; kỳ vọng `[A,B,C,D] → [true,false,true,false]`; `decideSignIn({ email: D.email, allowances: docHang([{ email: D.email, role: "member", status: "bi-hong" }]).rows, seedList: "", anyUserExists: true }).allowed === false` (đối chiếu luật đăng nhập); spy nhận đúng một lời gọi có chuỗi `"bi-hong"`. `afterAll`: xoá hàng thử, `createMany` lại hàng member đã lưu, `mockRestore`.
- [ ] **Step 2: Chạy đỏ** → A false, spy 0 lời gọi.
- [ ] **Step 3: Cài**

```ts
const doc = loiMoi.map((dong) => ({
	email: normalizeEmail(dong.email),
	...docTrangThai(dong.status),
}));
for (const dong of doc) {
	if (dong.loi) console.error(`[auth] allow-list: ${dong.loi}`);
}
const conHieuLucSet = new Set(
	doc.filter((d) => d.email && conHieuLuc(d.trangThai)).map((d) => d.email as string),
);
const ketThuc = new Set(
	doc
		.filter((d) => d.email && !conHieuLuc(d.trangThai) && !conHieuLucSet.has(d.email))
		.map((d) => d.email as string),
);
```

(Đọc `docTrangThai` trước để biết tên trường lỗi thật — `loi` theo `docHang` ở `allow-list.ts`.)
- [ ] **Step 4: Chạy xanh.**
- [ ] **Step 5: Phá-thử** trên bản sao: khôi phục luật cũ → A đỏ, ghim `"A"`.
- [ ] **Step 6: Commit** — `fix: dựng lại thành viên theo luật còn lời cho phép hiệu lực`.

### Task 4: Lệnh soi chỉ đọc

**Phục vụ:** E15, E16 · **independent:** true · **verify:** `bun run test -- "cd apps/api && bun test test/soi-thanh-vien.spec.ts"` và `bun _acceptance/thanh-vien-vao-dung/rang/soi-vat.mjs` (sau Task 9)

**Files:**
- Create: `apps/api/scripts/soi-thanh-vien.ts`
- Create: `apps/api/test/soi-thanh-vien.spec.ts`
- Create: `_acceptance/thanh-vien-vao-dung/rang/soi-vat.mjs`

**Interfaces:**
- Produces: `export async function soiThanhVien(client: Pick<Db, "$transaction">, chen?: (tx) => Promise<unknown>): Promise<{ "ten-mien": number; treo: number; "bo-sot": number; "khong-doc-duoc": number }>`; `export function inKetQua(so, mayChu: string): string` (dòng `may-chu <host>`, `giao-dich READ ONLY`, bốn dòng `<khoa> <n>`). Khi chạy trực tiếp (`import.meta.main`): đọc `DATABASE_URL`, in kết quả, `--ra <tệp>` ghi ra tệp.

- [ ] **Step 1: Test đỏ** — gieo: 1 dòng treo (member + pending cùng email), 1 bỏ sót (user không member, `canceled` + `pending`, session `createdAt` sau `pending.createdAt`), 1 cho-phép-lại-chưa-đăng-nhập (`canceled` + `pending`, không session), 1 trạng thái `"bi-hong"`, `staffEmailDomains` có 1 mục; số đếm tương đối (đo trước gieo, trừ). Kỳ vọng `treo 1, bo-sot 1, khong-doc-duoc 1, ten-mien 1`; `inKetQua(...)` không khớp `/@/`; `soiThanhVien(db, (tx) => tx.$executeRaw\`INSERT INTO "appSetting" (id) VALUES ('soi-thu')\`)` ném lỗi chứa `"read-only transaction"`.
- [ ] **Step 2: Chạy đỏ** → module không tồn tại.
- [ ] **Step 3: Cài** — `client.$transaction(async (tx) => { await tx.$executeRaw\`SET TRANSACTION READ ONLY\`; if (chen) await chen(tx); … bốn $queryRaw … })`. SQL:
  - `treo`: `SELECT count(*) FROM invitation i JOIN "user" u ON lower(u.email)=lower(i.email) JOIN member m ON m."userId"=u.id AND m."organizationId"=i."organizationId" WHERE i.status='pending' AND i."organizationId"=${WORKSPACE_ID}`.
  - `bo-sot`: user không có member, có dòng `status IN ('canceled','rejected')` và dòng `status IN ('pending','accepted')` cho cùng email, và có session `createdAt` > `max(createdAt)` của dòng còn hiệu lực.
  - `khong-doc-duoc`: `status NOT IN ('pending','accepted','rejected','canceled','cancelled')` (đọc `TRANG_THAI_LOI_MOI` + `CANCELLED_CU` từ `@crm/validation/invitation-status` để dựng danh sách, không gõ tay).
  - `ten-mien`: `parseStaffDomains(...).length`.
- [ ] **Step 4: Chạy xanh.**
- [ ] **Step 5:** viết `rang/soi-vat.mjs` (đọc `evidence/soi-production.txt`; sáu mục DUNG/SAI; tệp vắng → mã 2 «chua chay tren production»). Phá-thử trên bản sao tệp: chèn một địa chỉ thư → `SAI co dia chi` mã 1; host `localhost` → `SAI may chu la may dev` mã 1; phá `SET TRANSACTION READ ONLY` trong bản sao lệnh → ca chỉ-đọc đỏ ghim `read-only transaction`; bỏ điều kiện session → `bo-sot 2`.
- [ ] **Step 6: Commit** — `feat: lệnh soi thành viên chỉ đọc`.

### Task 5: Thẻ «Tên miền nội bộ»

**Phục vụ:** E4, E6, E8, E25 · **independent:** false (cần router của Task 1) · **verify:** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-vien-vao-dung.dom.tsx -t the-ten-mien`

**Files:**
- Create: `apps/app/app/(app)/[slug]/settings/members/ten-mien-noi-bo.tsx` (client)
- Modify: `apps/app/app/(app)/[slug]/settings/members/page.tsx` (prefetch `workspace.staffDomains`, render `<TenMienNoiBo />` sau `AllowancesTable`)
- Modify: `apps/app/lib/messages/settings-thanh-vien.ts` (nhóm `tenMienNoiBo` ở cuối, `en` + `vi`)
- Modify: `apps/app/lib/trpc/cache.ts` (THÊM `trpc.workspace.staffDomains.queryKey()` vào danh sách của `workspace` — luật Freshness của `docs/api.md`: truy vấn mới của một màn nhập danh sách mà lệnh ghi của nó làm mới; chỉ thêm một dòng)
- Create: `apps/app/test/thanh-vien-vao-dung.dom.tsx`

**Interfaces:**
- Consumes: `trpc.workspace.staffDomains`, `trpc.workspace.setStaffDomains` (Task 1).
- Produces: chuỗi `t.tenMienNoiBo.{tieuDe, moTa, nhan, goiY, huongDan, rong, khoa, luu, daLuu, loiTai, thuLai}`.

Chuỗi `vi` (theo bản mẫu đã duyệt): tieuDe «Tên miền nội bộ» · moTa «Địa chỉ thư thuộc các tên miền này là người của công ty: Theo dõi không lập hồ sơ khách cho họ, hộp thư không coi họ là đối tác.» · nhan «Tên miền» · goiY «onehub.center, onehub.vn» · huongDan «Ngăn bằng dấu phẩy. Không nhận tên miền thư công cộng như gmail.com.» · rong «Chưa có tên miền nội bộ — máy chưa nhận ra người nhà ở Theo dõi và hộp thư.» · khoa «Chỉ chủ sở hữu hoặc quản trị đổi được tên miền nội bộ.» · luu «Lưu» · daLuu «Đã lưu tên miền nội bộ» · loiTai «Không tải được tên miền nội bộ.» · thuLai «Thử lại».

- [ ] **Step 1: Test đỏ** — `thanh-vien-vao-dung.dom.tsx`, mock `@/lib/trpc/client` như `thanh-vien-hai-khoi.dom.tsx`, dữ liệu qua `staffDomainsOutput.parse(...)` của contracts thật; `describe("the-ten-mien")` sáu ca trạng thái (dang-tai ≥3 skeleton; rong; co — «Lưu» disabled; dang-luu — spinner `[data-slot=spinner]`, input disabled; khoa — input + nút disabled + chuỗi `khoa`; loi-tai — `Empty` + «Thử lại» bấm → `queryFn` gọi lần 2), `loi-nhap` (mutation reject `{ message: "gmail.com is a public mail domain…" }` → `[data-slot=field-error]` chứa thông điệp, input giữ chữ gõ), `luu-xong` (gõ chuỗi AC-1, mutation trả `{ domains: ["onehub.center","onehub.vn"], canEdit: true }` → input `"onehub.center, onehub.vn"`, «Lưu» disabled). Hằng đầu ra của `luu-xong` khai MỘT lần trong `apps/api/test/thanh-vien-vao-dung.fixture.ts` và cả test API (Task 1 `ghi-chuan-hoa`) lẫn test DOM nhập nó.
- [ ] **Step 2: Chạy đỏ** → module `ten-mien-noi-bo` không tồn tại.
- [ ] **Step 3: Cài** theo bản mẫu `apps/app/app/proto/_modules/thanh-vien-vao-dung/index.tsx` (cùng component, cùng cây DOM), nối `useQuery(trpc.workspace.staffDomains.queryOptions())` + `useMutation(trpc.workspace.setStaffDomains.mutationOptions({ onSuccess: async () => { await cache.workspace(); setNhap(null); setLoi(null); toast.success(t.tenMienNoiBo.daLuu); }, onError: (e) => setLoi(e.message) }))`; tách chuỗi bằng `/[,\s]+/` trước khi gửi.
- [ ] **Step 4: Chạy xanh;** `bun run check-types`; `bunx biome check --write` các tệp đã chạm.
- [ ] **Step 5: Phá-thử** trên bản sao: thẻ trả `null` khi đang tải → dang-tai đỏ; xoá ô trong `onError` → loi-nhap đỏ «chu da go»; không đặt lại theo đầu ra → luu-xong đỏ «o hien ban chuan hoa».
- [ ] **Step 6: Commit** — `feat: thẻ Tên miền nội bộ ở Cài đặt › Thành viên`.

### Task 6: Nút đầu trang và khối «Được phép vào»

**Phục vụ:** E10, E13, E26 · **independent:** false (cần `ALREADY_A_MEMBER` của Task 2) · **verify:** `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-vien-vao-dung.dom.tsx -t "nut-dau-trang|hop-cho-phep|duoc-phep-vao"`

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/members/cho-phep-dia-chi.tsx`
- Modify: `apps/app/app/(app)/[slug]/settings/members/page.tsx` (`HanhDongDauTrang` prefetch + `HydrateClient`; bỏ `.catch(() => null)` quyết quyền; `Members` prefetch allowances khi không đọc được quyền)
- Test: `apps/app/test/thanh-vien-vao-dung.dom.tsx`

- [ ] **Step 1: Test đỏ** — `describe("nut-dau-trang")`: (a) `ssr-loi`: `const may = makeQueryClient(); await may.prefetchQuery({ queryKey: ["workspace.get"], queryFn: async () => { throw new Error("mang chap chon"); } }); const state = dehydrate(may);` render `<QueryClientProvider client={makeQueryClient()}><HydrationBoundary state={state}><ChoPhepDiaChi /></HydrationBoundary></QueryClientProvider>` với `workspace.get` mock trả admin → chờ `button` tên `t.duocPhepVao.nutThem`; (b) `sau-loi`: queryFn lần 1 ném, lần 2 trả admin; (c) `khong-quyen`: `canManageMembers: false` → không nút sau khi query xong; (d) `loi-mai`: queryFn luôn ném → nút hiện; bấm, mutation `allowEmail` reject `{ message: "Only an owner or an admin can allow an address." }` → hộp `[role=dialog]` còn, chứa thông điệp. `describe("hop-cho-phep")` `da-la-thanh-vien`: reject `{ message: ALREADY_A_MEMBER }` → hộp còn, chứa thông điệp. `describe("duoc-phep-vao")` `treo-khong-dem`: `AllowancesTable` với 2 `pending` + 1 `accepted` (dạng `allowanceListOutput.parse`) → tiêu đề `t.dem(t.duocPhepVao.tieuDe, 2)`, địa chỉ dòng accepted vắng.
- [ ] **Step 2: Chạy đỏ** → (a)(b)(d) FAIL (ChoPhepDiaChi không đọc query).
- [ ] **Step 3: Cài**

```tsx
const workspace = useQuery(trpc.workspace.get.queryOptions());
if (workspace.isPending) return null;
if (workspace.data && !workspace.data.canManageMembers) return null;
```

`page.tsx`: `HanhDongDauTrang` → `await getServerQueryClient().prefetchQuery(trpc.workspace.get.queryOptions())` rồi `<HydrateClient><ChoPhepDiaChi /></HydrateClient>`; xoá `quyenQuanTri` khỏi đầu trang; `Members` dùng `queryClient.fetchQuery(...).then((w) => w.canManageMembers, () => true)` để quyết prefetch allowances.
- [ ] **Step 4: Chạy xanh;** chạy lại `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-vien-hai-khoi.dom.tsx` (đã ký) → xanh.
- [ ] **Step 5: Phá-thử** trên bản sao: giữ `quyenQuanTri()` ở máy chủ → (a) đỏ «nut sau loi ssr»; `if (workspace.isError) return null` → (d) đỏ «nut sau loi»; đóng hộp trong `onSettled` → (d) và `da-la-thanh-vien` đỏ «hop van mo»; đếm trên mảng chưa lọc → `treo-khong-dem` đỏ.
- [ ] **Step 6: Commit** — `fix: nút Cho phép một địa chỉ không mất sau lỗi tải`.

### Task 7: Từ điển, chữ, tài liệu

**Phục vụ:** E22, E23 · **independent:** true (sau Task 5 cho chuỗi) · **verify:** `bun _acceptance/thanh-vien-vao-dung/rang/tu-dien.mjs && cd apps/app && bun test test/messages-guard.spec.ts`

**Files:**
- Modify: `CONTEXT.md` (THÊM mục «Tên miền nội bộ»: định nghĩa, `_Avoid_: domain nhà, domain nội bộ, allowed domains`, «Vì sao»)
- Modify: `docs/api.md` (mục «One organization…»: hai gạch đầu dòng — từ chối người đã là thành viên + đọc dòng treo thành `accepted`; đường ghi `workspace.staffDomains`/`setStaffDomains`)
- Modify: `docs/environment.md:56-59` (câu «It is set on Settings → Members.»)
- Modify: `apps/app/test/messages-guard.spec.ts` chỉ khi có khoá hàm mới
- Create: `_acceptance/thanh-vien-vao-dung/rang/tu-dien.mjs`

- [ ] **Step 1:** viết `tu-dien.mjs` (import `thanhVienMessages` thật; đọc ba tệp tài liệu theo đường suy từ `import.meta.url`); chạy → SAI ở mọi mục (đỏ).
- [ ] **Step 2:** sửa ba tài liệu; chạy → `<n> DUNG, 0 SAI`.
- [ ] **Step 3:** phá-thử bản sao `CONTEXT.md` bỏ dòng `_Avoid_` → SAI ghim `_Avoid_`.
- [ ] **Step 4: Commit** — `docs: tên miền nội bộ trong từ điển và tài liệu API`.

### Task 8: Bàn đo màn và thước đã ký

**Phục vụ:** E17, E18, E19, E20, E21 · **independent:** false (sau Task 5, 6) · **verify:** lệnh của `r1b_do_man`, `r1b_san_thiet_ke`, `tvhk_do_khoi`, `tvhk_ttv_do_bang`, `r1b_khong_hoi_quy_api`

**Files:**
- Create: `_acceptance/thanh-vien-vao-dung/rang/do-man.mjs` (khuôn `do-khoi.mjs`: `canhCay`, `MA_TRAN` viết trước, `kiem(ma, nhan, dat)`, dọn trong `finally`)

`MA_TRAN` (viết trước, 17 mã): `1440-quan-tri-anh`, `375-quan-tri-anh`, `375-quan-tri-tran`, `1440-loi-anh`, `1440-loi-duoi-o`, `1440-thanh-vien-anh`, `375-thanh-vien-anh`, `375-thanh-vien-tran`, `1440-thanh-vien-khoa`, `1440-luu-db`, `1440-luu-o`, `1440-luu-tat`, `1440-hop-da-la-thanh-vien-anh`, `1440-hop-giu-mo`, `1440-hop-thong-diep`, `don-cot`, `don-loi-cho-phep`.

- [ ] **Step 1:** viết `do-man.mjs`: đọc giá trị cột trước lượt; quản trị `ada@trycomp.ai`, thành viên thường `marcus@trycomp.ai` (như `do-khoi.mjs`); gõ chuỗi AC-1, bấm «Lưu», đọc DB; gõ `gmail.com` → lỗi dưới ô; mở hộp, gõ địa chỉ của `marcus@trycomp.ai` (đã là thành viên) → hộp giữ mở + `ALREADY_A_MEMBER`; chụp sáu ảnh vào `BANG_CHUNG`; `finally` trả cột về giá trị cũ, xoá lời cho phép mang tiền tố lượt.
- [ ] **Step 2:** chạy trên giao diện cũ (trước Task 5/6, bằng bản sao ở `.acceptance-runs/thanh-vien-vao-dung/sao-cu/` hoặc commit trước) → SAI ở các mã thẻ (chiều đỏ).
- [ ] **Step 3:** chạy trên cây này → `17 DUNG, 0 SAI`; xem từng ảnh.
- [ ] **Step 4:** chạy `r1b_san_thiet_ke` (mã 0) + phá-thử bản sao `rounded-[7px]` (mã 1); chạy `tvhk_do_khoi` (`46 DUNG, 0 SAI`), `tvhk_ttv_do_bang` (mã 0), `r1b_khong_hoi_quy_api` (0 fail; so số ca với merge-base).
- [ ] **Step 5: Commit** — `test: bàn đo màn thanh-vien-vao-dung`.

### Task 9: Soi production chỉ đọc

**Phục vụ:** E16 · **independent:** false (sau Task 4) · **verify:** `bun _acceptance/thanh-vien-vao-dung/rang/soi-vat.mjs`

- [ ] **Step 1:** `vercel env pull` của dự án API production vào tệp tạm trong scratchpad (ngoài kho), chỉ lấy `DATABASE_URL`.
- [ ] **Step 2:** `DATABASE_URL=<từ tệp tạm> bun apps/api/scripts/soi-thanh-vien.ts --ra _acceptance/thanh-vien-vao-dung/evidence/soi-production.txt`.
- [ ] **Step 3:** xoá tệp tạm; `soi-vat.mjs` → `7 DUNG, 0 SAI`.
- [ ] **Step 4:** ghi bốn số vào `Notes` của hợp đồng (phần máy viết sau Cổng 1, đi kèm dòng sổ `fix`); commit — `docs: số soi production thanh-vien-vao-dung`.

### Task 10: Năm lệnh chứng

- [ ] `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build` — đều xanh trước khi đặt `status: implemented`.
