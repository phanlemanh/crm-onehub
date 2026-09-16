# Cho phép ai vào, quyết ở màn hình — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người quản cho một đồng nghiệp vào CRM ngay trên màn Members, thay vì sửa biến môi trường trên Vercel rồi chờ dựng lại.

**Architecture:** Danh sách ai-được-vào sống trong bảng `invitation` đã có sẵn. Quyết định "người này vào được không, vai gì, theo nguồn nào" tách thành một hàm **thuần** nhận trạng thái đã đọc sẵn; một lớp mỏng đọc cơ sở dữ liệu rồi gọi hàm ấy. Biến `ALLOWED_SIGN_IN` tụt xuống vai mồi cho lần cài đầu. Domain nhà tách sang một cột riêng của `appSetting`.

**Tech Stack:** Bun · TypeScript · Prisma (PostgreSQL) · Better Auth (organization plugin) · NestJS + nestjs-trpc · Next.js App Router · `@crm/ui` (shadcn)

**Spec:** `docs/superpowers/specs/2026-09-16-cho-phep-ai-vao-o-man-hinh-design.md`
**Contract:** `_acceptance/cho-phep-ai-vao-o-man-hinh/contract.md` (14 AC)
**Evals:** `_acceptance/cho-phep-ai-vao-o-man-hinh/evals.yaml` (16 thước)

## Global Constraints

- **Không viết chú thích trong code.** Không cho mã mới, không cho mã sửa. (`AGENTS.md`)
- **Trí khôn sống ở `apps/agent`, không bao giờ ở API.** Vòng này không thêm việc gì cho agent.
- **Một `.env` duy nhất ở gốc.** Biến mới phải khai ở `.env.example` kèm một dòng nói nó làm gì, và khai ở `apps/api/src/config/env.validation.ts` nếu API đọc nó. Vòng này **không thêm biến nào**.
- **`/packages/ui` là nguồn duy nhất của giao diện.** Biến thể mới làm ở đó, không đè `className` tại chỗ gọi.
- **Bán kính bo góc chỉ lấy từ thang:** `rounded-md` cho nút và ô nhập, `rounded-lg` cho hộp thoại. Không bao giờ một giá trị literal tại chỗ gọi.
- **Chỉ hai thứ được tô nền:** `primary` cho việc muốn người ta làm, `destructive` cho việc không hoàn lại được. Nút gỡ và nút rút dùng `destructive`.
- **Một trang máy chủ tính, một component client vẽ.** Component `"use client"` không bao giờ nhập `@crm/auth` hay `@crm/db` — chuỗi nhập kéo tới `dns` và `bun run build` đỏ.
- **Phân tích ở biên**, không truyền `Record<string, unknown>` đi vòng quanh.
- **`WORKSPACE_ID` là hằng, không bao giờ là tham số.** Hàm nào nhận `organizationId` là đã biến plugin tổ chức thành đường ống nhiều khách.
- **Hook `session.create.before` suy giảm, không bao giờ ném lỗi.** Một lượt throw ở đó khoá mọi người ngoài cửa.
- **Chữ trên màn lấy từ `apps/app/lib/messages/settings-thanh-vien.ts`**, cả hai thứ tiếng. Không chuỗi trần trong component.
- **Hai việc không hoàn lại được — gỡ và rút — phải đi qua hộp thoại xác nhận**, không được làm ngay lập tức.
- **Mỗi phép đo mới phải có cặp hai chiều trên cùng một fixture**: vật lành → xanh, phá vật thật trong bản sao → đỏ với thông điệp ghim. Thiếu cặp thì task CHƯA XONG.
- Năm lệnh chứng minh, chạy từ gốc kho: `bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build`.

---

## File Structure

**Tạo mới**

| Đường | Trách nhiệm |
|---|---|
| `packages/auth/src/allow-list.ts` | Hàm thuần quyết ai vào được + lớp mỏng đọc cơ sở dữ liệu |
| `packages/auth/test/ai-duoc-vao.spec.ts` | Bảng mười một dòng cho hàm thuần |
| `packages/auth/test/cong-vao.integration.spec.ts` | Sáu lượt đo hệ quả thật ở tầng cổng vào |
| `apps/api/test/workspace-thanh-vien.spec.ts` | Bốn thủ tục mới + hai bất biến |
| `apps/api/test/domain-nha-tach.spec.ts` | Domain nhà tách khỏi danh sách người |
| `apps/app/app/(app)/[slug]/settings/members/allowances-table.tsx` | Khối *Được phép vào* |
| `apps/app/app/(app)/[slug]/settings/members/allow-dialog.tsx` | Hộp thoại cho phép một địa chỉ |
| `apps/app/app/(app)/[slug]/settings/members/confirm-dialog.tsx` | Hộp thoại xác nhận dùng chung cho gỡ và rút |
| `apps/app/app/(app)/(no-workspace)/het-quyen/page.tsx` | Màn hết quyền |

**Sửa**

| Đường | Đổi gì |
|---|---|
| `packages/db/prisma/schema.prisma` | Thêm cột domain nhà vào `AppSetting` |
| `packages/auth/src/workspace.ts` | `workspaceDomains()` thôi đọc `ALLOWED_SIGN_IN` |
| `packages/auth/src/auth.ts` | Hook tạo người dùng đọc bảng; hook tạo phiên thôi tự thêm |
| `packages/auth/src/organization.ts` | `ensureWorkspaceMembership` nhận cờ được-phép |
| `packages/auth/src/index.ts` | Xuất mặt mới |
| `apps/api/src/workspace/workspace.contracts.ts` | Bốn khuôn vào/ra mới |
| `apps/api/src/workspace/workspace.service.ts` | Bốn thủ tục + cờ quyền cho mặt người |
| `apps/api/src/workspace/workspace.router.ts` | Bốn thủ tục mới |
| `apps/api/src/mailbox/mailbox-match.service.ts` | Đọc domain nhà từ cài đặt |
| `apps/api/src/tracking/tracking-filing.service.ts` | Đọc domain nhà từ cài đặt |
| `apps/app/app/(app)/[slug]/settings/members/page.tsx` | Nạp sẵn hai khối |
| `apps/app/app/(app)/[slug]/settings/members/members-table.tsx` | Thêm nút gỡ |
| `apps/app/lib/messages/settings-thanh-vien.ts` | Chữ cho hai khối, ba hộp thoại, màn hết quyền |
| `apps/app/proxy.ts` | Chặn người không còn thành viên |
| `docs/api.md` · `.env.example` · `docs/environment.md` | Sửa luật đã lật |

**Thứ tự phụ thuộc**

```
Task 1 (hàm thuần) ─┐
                    ├─→ Task 3 (cổng vào) ─→ Task 4 (tư cách thành viên) ─→ Task 6 (gỡ)
Task 2 (lược đồ) ───┘                                    │
     └──────────────→ Task 7 (domain nhà)                └─→ Task 5 (cho phép / rút)
                                                              └─→ Task 8 (quyền) ─→ Task 9 (màn hình) ─→ Task 10 (màn hết quyền)
Task 11 (tài liệu) — độc lập, chạy lúc nào cũng được
```

`independent: true` — **Task 1**, **Task 2**, **Task 11**. Ba task này không đọc kết quả của nhau và đụng ba vùng tệp rời nhau. Mọi task còn lại `independent: false`.

---

### Task 1: Hàm thuần quyết ai vào được

`independent: true` · phục vụ AC-1 (bảng mười một dòng) và E1

**Files:**
- Create: `packages/auth/src/allow-list.ts`
- Create: `packages/auth/test/ai-duoc-vao.spec.ts`
- Modify: `packages/auth/src/index.ts`

**Interfaces:**
- Consumes: `WorkspaceRole` và `toWorkspaceRole` — **nhưng KHÔNG từ `./organization`.** Task 3 sẽ bắt `organization.ts` gọi ngược vào `allow-list.ts`, nên nhập thẳng từ `./organization` ở đây dựng một vòng nhập và bó nhập sẽ vỡ ở thời điểm chạy. **Bước 0 của task này:** cắt `WORKSPACE_ROLES`, `WorkspaceRole`, `isWorkspaceRole`, `toWorkspaceRole` khỏi `organization.ts` sang một tệp mới `packages/auth/src/roles.ts`, rồi cho `organization.ts` xuất lại chúng từ đó để mọi chỗ gọi hiện có không phải đổi. Cả `allow-list.ts` lẫn `organization.ts` cùng nhập từ `roles.ts` — một chiều, không vòng.
- Produces:
  ```ts
  export type AllowanceRow = {
    email: string;
    role: string | null;
    status: "pending" | "accepted" | "cancelled";
  };

  export type AllowInput = {
    email: string;
    allowances: readonly AllowanceRow[];
    seedList: string;
    anyUserExists: boolean;
  };

  export type AllowDecision =
    | { allowed: true; role: WorkspaceRole; source: "table" | "seed" }
    | { allowed: false };

  export function decideSignIn(input: AllowInput): AllowDecision;
  export function normalizeEmail(value: string): string | null;
  ```

- [ ] **Step 1: Viết bài kiểm trước — bảng mười một dòng**

`packages/auth/test/ai-duoc-vao.spec.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { type AllowanceRow, decideSignIn } from "../src/allow-list";

const khue = (status: AllowanceRow["status"], role: string | null = "member"): AllowanceRow[] => [
  { email: "khue@gmail.com", role, status },
];

const BANG = [
  { n: 1, allowances: [], seedList: "onemount.com", anyUserExists: false, email: "ai@onemount.com", want: { allowed: true, role: "member", source: "seed" } },
  { n: 2, allowances: [], seedList: "onemount.com", anyUserExists: true, email: "ai@onemount.com", want: { allowed: false } },
  { n: 3, allowances: [], seedList: "", anyUserExists: false, email: "ai@onemount.com", want: { allowed: false } },
  { n: 4, allowances: [], seedList: "onemount.com", anyUserExists: false, email: "nguoi@gmail.com", want: { allowed: false } },
  { n: 5, allowances: [], seedList: "khue@gmail.com", anyUserExists: false, email: "khue@gmail.com", want: { allowed: true, role: "member", source: "seed" } },
  { n: 6, allowances: [], seedList: "khue@gmail.com", anyUserExists: false, email: "khac@gmail.com", want: { allowed: false } },
  { n: 7, allowances: khue("pending"), seedList: "onemount.com", anyUserExists: true, email: "khue@gmail.com", want: { allowed: true, role: "member", source: "table" } },
  { n: 8, allowances: khue("pending", "admin"), seedList: "", anyUserExists: true, email: "khue@gmail.com", want: { allowed: true, role: "admin", source: "table" } },
  { n: 9, allowances: khue("cancelled"), seedList: "", anyUserExists: true, email: "khue@gmail.com", want: { allowed: false } },
  { n: 10, allowances: khue("accepted"), seedList: "", anyUserExists: true, email: "khue@gmail.com", want: { allowed: true, role: "member", source: "table" } },
  { n: 11, allowances: khue("pending"), seedList: "onemount.com", anyUserExists: true, email: "ai@onemount.com", want: { allowed: false } },
] as const;

describe("decideSignIn", () => {
  it("chạy đủ mười một dòng của bảng viết trước", () => {
    expect(BANG.length).toBe(11);
  });

  for (const dong of BANG) {
    it(`dòng ${dong.n} — ${dong.email}`, () => {
      const got = decideSignIn({
        email: dong.email,
        allowances: dong.allowances,
        seedList: dong.seedList,
        anyUserExists: dong.anyUserExists,
      });

      expect({ dong: dong.n, got }).toEqual({ dong: dong.n, got: dong.want as never });
    });
  }
});
```

- [ ] **Step 2: Chạy để chắc nó đỏ**

Chạy: `cd packages/auth && bun test test/ai-duoc-vao.spec.ts`
Mong đợi: FAIL — `Cannot find module '../src/allow-list'`

- [ ] **Step 3: Viết bản cài tối thiểu**

`packages/auth/src/allow-list.ts`:

```ts
import { type WorkspaceRole, toWorkspaceRole } from "./organization";

export type AllowanceRow = {
  email: string;
  role: string | null;
  status: "pending" | "accepted" | "cancelled";
};

export type AllowInput = {
  email: string;
  allowances: readonly AllowanceRow[];
  seedList: string;
  anyUserExists: boolean;
};

export type AllowDecision =
  | { allowed: true; role: WorkspaceRole; source: "table" | "seed" }
  | { allowed: false };

const DENY: AllowDecision = { allowed: false };

export function normalizeEmail(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  const parts = trimmed.split("@");
  if (parts.length !== 2) return null;
  const [local, host] = parts;
  if (!local || !host) return null;
  return trimmed;
}

function seedAllows(email: string, seedList: string): boolean {
  const domains: string[] = [];
  const addresses: string[] = [];

  for (const raw of seedList.split(",")) {
    const entry = raw.trim().toLowerCase().replace(/^@/, "");
    if (!entry) continue;
    (entry.includes("@") ? addresses : domains).push(entry);
  }

  if (addresses.includes(email)) return true;

  const host = email.split("@")[1];
  if (!host) return false;

  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

export function decideSignIn(input: AllowInput): AllowDecision {
  const email = normalizeEmail(input.email);
  if (!email) return DENY;

  const row = input.allowances.find(
    (candidate) => normalizeEmail(candidate.email) === email && candidate.status !== "cancelled",
  );

  if (row) return { allowed: true, role: toWorkspaceRole(row.role ?? "member"), source: "table" };

  if (input.allowances.length > 0) return DENY;
  if (input.anyUserExists) return DENY;
  if (!seedAllows(email, input.seedList)) return DENY;

  return { allowed: true, role: "member", source: "seed" };
}
```

- [ ] **Step 4: Chạy để chắc nó xanh**

Chạy: `cd packages/auth && bun test test/ai-duoc-vao.spec.ts`
Mong đợi: PASS — mười hai ca (mười một dòng + ca đếm số dòng)

- [ ] **Step 5: Phá vật thật để chắc thước có răng**

Đây là **chiều đỏ bắt buộc** của E1. Trong một bản sao tạm, thay thân `decideSignIn` bằng đường tắt mà bảng phải bắt được:

```bash
cp packages/auth/src/allow-list.ts /tmp/allow-list.bak
python3 - <<'PY'
import re
p = 'packages/auth/src/allow-list.ts'
s = open(p).read()
s = s.replace('  if (!seedAllows(email, input.seedList)) return DENY;\n', '  if (input.seedList.length === 0) return DENY;\n')
open(p, 'w').write(s)
PY
cd packages/auth && bun test test/ai-duoc-vao.spec.ts
```

Mong đợi: FAIL ở **dòng 4** và **dòng 6**, và thông điệp nêu đúng số dòng. Xanh ở bước này nghĩa là bảng không có răng — dừng lại, sửa bảng trước khi đi tiếp.

Rồi trả lại:

```bash
cp /tmp/allow-list.bak packages/auth/src/allow-list.ts && rm /tmp/allow-list.bak
cd packages/auth && bun test test/ai-duoc-vao.spec.ts
```

Mong đợi: PASS trở lại.

- [ ] **Step 6: Xuất mặt mới**

Trong `packages/auth/src/index.ts`, thêm vào khối xuất đang có:

```ts
export {
  type AllowanceRow,
  type AllowDecision,
  type AllowInput,
  decideSignIn,
  normalizeEmail,
} from "./allow-list";
```

- [ ] **Step 7: Commit**

```bash
git add packages/auth/src/allow-list.ts packages/auth/test/ai-duoc-vao.spec.ts packages/auth/src/index.ts
git commit -m "feat(auth): ham thuan quyet ai vao duoc, bang muoi mot dong"
```

---

### Task 2: Cột domain nhà trong cài đặt

`independent: true` · phục vụ AC-10 (phần dữ liệu)

**Files:**
- Modify: `packages/db/prisma/schema.prisma:1378-1406`

**Interfaces:**
- Produces: cột `AppSetting.staffEmailDomains: String?` — danh sách domain ngăn bởi dấu phẩy, `null` nghĩa là chưa đặt

- [ ] **Step 1: Thêm cột**

Trong `model AppSetting`, ngay dưới `reportingCurrency`:

```prisma
  staffEmailDomains String?
```

- [ ] **Step 2: Sinh bản chuyển lược đồ**

Chạy: `bun run db:migrate --name staff-email-domains`
Mong đợi: một thư mục mới dưới `packages/db/prisma/migrations/`, bên trong đúng một câu `ALTER TABLE "appSetting" ADD COLUMN "staffEmailDomains" TEXT;`

- [ ] **Step 3: Đọc lại câu lệnh vừa sinh**

Mở tệp `.sql` vừa tạo. Có bất kỳ câu `DROP` nào thì dừng — lược đồ đã lệch với cơ sở dữ liệu và việc đó phải xử lý riêng trước.

- [ ] **Step 4: Chắc kiểu còn dựng được**

Chạy: `bun run check-types`
Mong đợi: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/db/prisma/schema.prisma packages/db/prisma/migrations
git commit -m "feat(db): cot domain nha trong appSetting"
```

---

### Task 3: Cổng vào đọc bảng, biến môi trường tụt xuống vai mồi

`independent: false` — cần Task 1 · phục vụ AC-3, AC-9 và E3, E6

**Files:**
- Modify: `packages/auth/src/allow-list.ts`
- Modify: `packages/auth/src/auth.ts:260-280`
- Create: `packages/auth/test/cong-vao.integration.spec.ts`

**Interfaces:**
- Consumes: `decideSignIn`, `AllowanceRow` (Task 1)
- Produces:
  ```ts
  export async function readAllowState(email: string): Promise<AllowInput>;
  export async function decideSignInFromDb(email: string): Promise<AllowDecision>;
  ```

- [ ] **Step 1: Viết hai bài kiểm trước**

**Khuôn đã có trong kho, dùng lại chứ đừng dựng mới:** `packages/auth/test/tu-choi-khong-de-lai-hang.integration.spec.ts` làm đúng việc mà cả Task 3, 4 và 6 cần. Đọc nó trước và mượn ba thứ:

- `hookTruocTao()` — rút hàm hook **thật** ra khỏi `auth.options`, và ném lỗi có chữ nếu phép kiểm không còn nằm trước khi ghi. Đây chính là khẳng định "ghim rằng phép kiểm nằm ở `databaseHooks.user.create.BEFORE`" mà E6 đòi; đừng viết lại bằng cách tìm chuỗi trong tệp.
- `packages/auth/test/moi-truong.ts` — dựng và dọn môi trường.
- Nếp `const suffix = process.env.TEST_RUN_ID ?? "<ten-spec>"` — mỗi lượt chạy có dữ liệu riêng, không giẫm lên lượt khác.

Khung dưới đây là **bản đồ khối**, không phải mã hoàn chỉnh: tên khối `describe` là thứ `-t` của mỗi lệnh đo bắt, nên chúng phải khớp từng chữ. Thân mỗi ca viết theo khuôn vừa mượn.

`packages/auth/test/cong-vao.integration.spec.ts` — hai khối `describe`, tên khối là thứ `-t` bắt:

```ts
import { describe, expect, it } from "bun:test";

describe("duong-moi", () => {
  it("bảng rỗng và chưa ai đăng nhập thì mồi có tiếng nói", async () => {
    // dựng cơ sở dữ liệu rỗng, đặt ALLOWED_SIGN_IN, đi trọn đường callback
    // mong đợi: đúng một hàng user sinh ra
  });

  it("bảng rỗng nhưng đã có người thì mồi câm", async () => {
    // mong đợi: bốn bảng user/account/session/verification đếm trước bằng đếm sau
  });

  it("hai trạng thái không được cho cùng kết quả", () => {
    // chân đếm: hai ca trên khác kết quả, bằng nhau thì ném để chân trả mã 2
  });

  it("phép kiểm nằm ở hook trước khi ghi", () => {
    // đọc vị trí thật trong cấu hình auth, không tìm chuỗi trong tệp
  });
});

describe("rut-chan-chua-vao", () => {
  it("địa chỉ vừa bị rút không tạo được hàng nào", async () => {
    // cho phép rồi rút, cả hai qua CHÍNH thủ tục thật
    // mong đợi: bốn cặp đếm bằng nhau
  });

  it("đối chứng dương — địa chỉ còn được phép tạo đúng một hàng user", async () => {
    // không có ca này thì phép đo không phân biệt chặn-đúng với callback-không-chạy
  });
});
```

Bốn ca đầu tiên của mỗi khối phải thành mã chạy được trước khi qua bước sau; khối rỗng là một bài kiểm giả.

- [ ] **Step 2: Chạy để chắc nó đỏ**

Chạy: `cd packages/auth && bun test test/cong-vao.integration.spec.ts -t duong-moi`
Mong đợi: FAIL

- [ ] **Step 3: Viết lớp mỏng đọc cơ sở dữ liệu**

Thêm vào `packages/auth/src/allow-list.ts`:

```ts
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";

export async function readAllowState(email: string): Promise<AllowInput> {
  const normalized = normalizeEmail(email);

  const [rows, anyUser] = await Promise.all([
    normalized
      ? db.invitation.findMany({
          where: { organizationId: WORKSPACE_ID, email: normalized },
          select: { email: true, role: true, status: true },
        })
      : Promise.resolve([]),
    db.user.count({ take: 1 }),
  ]);

  return {
    email,
    allowances: rows as AllowanceRow[],
    seedList: process.env.ALLOWED_SIGN_IN ?? "",
    anyUserExists: anyUser > 0,
  };
}

export async function decideSignInFromDb(email: string): Promise<AllowDecision> {
  return decideSignIn(await readAllowState(email));
}
```

- [ ] **Step 4: Nối vào hook tạo người dùng**

Trong `packages/auth/src/auth.ts`, thay thân `databaseHooks.user.create.before`:

```ts
before: async (user) => {
  const decision = await decideSignInFromDb(user.email);

  if (!decision.allowed) {
    throw new APIError("FORBIDDEN", {
      message: "This CRM is private. Ask an owner or an admin to allow your address.",
    });
  }

  return { data: user };
},
```

Bỏ `hasSignInAllowList` và `isWorkspaceEmail` khỏi khối nhập của tệp này; giữ nguyên `googleHostedDomain` ở dòng 49 — tham số `hd` tiếp tục đọc biến môi trường, đó là quyết định đã ghi trong sổ.

- [ ] **Step 5: Chạy để chắc nó xanh**

Chạy: `cd packages/auth && bun test test/cong-vao.integration.spec.ts -t duong-moi`
rồi `cd packages/auth && bun test test/cong-vao.integration.spec.ts -t rut-chan-chua-vao`
Mong đợi: PASS cả hai

- [ ] **Step 6: Phá vật thật**

Trong bản sao, bỏ vế `anyUserExists` khỏi `decideSignIn` (dòng `if (input.anyUserExists) return DENY;`). Chạy lại `-t duong-moi`.
Mong đợi: FAIL ở ca "bảng rỗng nhưng đã có người thì mồi câm". Trả lại rồi chạy lại cho xanh.

- [ ] **Step 7: Commit**

```bash
git add packages/auth/src/allow-list.ts packages/auth/src/auth.ts packages/auth/test/cong-vao.integration.spec.ts
git commit -m "feat(auth): cong vao doc bang, bien moi truong xuong vai moi"
```

---

### Task 4: Tư cách thành viên thôi tự cấp lại

`independent: false` — cần Task 3 · phục vụ AC-2, AC-4, AC-12 và E2, E4, E7

**Files:**
- Modify: `packages/auth/src/organization.ts:41-110`
- Modify: `packages/auth/src/auth.ts:284-292`
- Modify: `packages/auth/test/cong-vao.integration.spec.ts`

**Interfaces:**
- Consumes: `decideSignInFromDb` (Task 3)
- Produces: `ensureWorkspaceMembership(userId: string, email: string): Promise<string | undefined>` — chữ ký đổi, thêm tham số thứ hai

- [ ] **Step 1: Viết bốn khối kiểm trước**

Thêm vào `packages/auth/test/cong-vao.integration.spec.ts` bốn khối `describe`: `vai-dinh-truoc`, `rut-khong-dung-da-vao`, `doc-hong`, và mở rộng khối đã có.

Khối `vai-dinh-truoc` phải: gọi **chính thủ tục cho phép** để tạo dòng (không cắm Prisma), đọc lại hàng vừa ghi và in ra, rồi đi đường callback, rồi khẳng định `member.role === "admin"` và `invitation.status === "accepted"`. Kèm đối chứng: cùng đường với vai `member` cho ra `member`.

Khối `doc-hong` phải ép lớp đọc ném lỗi rồi khẳng định ba điều: lượt tạo phiên không throw, phiên vẫn tạo được, hàng `member` sẵn có còn nguyên.

- [ ] **Step 2: Chạy để chắc nó đỏ**

Chạy: `cd packages/auth && bun test test/cong-vao.integration.spec.ts -t vai-dinh-truoc`
Mong đợi: FAIL

- [ ] **Step 3: Đổi `ensureWorkspaceMembership`**

Trong `packages/auth/src/organization.ts`, thay khối `tx.member.upsert` ở cuối giao dịch:

```ts
const existing = await tx.member.findUnique({
  where: { organizationId_userId: { organizationId: workspace.id, userId } },
  select: { id: true },
});

if (!existing) {
  const decision = await decideSignInFromDb(email);

  if (!decision.allowed) return workspace.id;

  await tx.member.create({
    data: {
      id: crypto.randomUUID(),
      organizationId: workspace.id,
      userId,
      role: decision.role,
      createdAt: new Date(),
    },
  });

  await tx.invitation.updateMany({
    where: {
      organizationId: workspace.id,
      email: normalizeEmail(email) ?? email,
      status: "pending",
    },
    data: { status: "accepted" },
  });
}

return workspace.id;
```

Khối `try`/`catch` bọc ngoài giữ **nguyên** — đó là thứ giữ lời hứa suy giảm-không-ném.

- [ ] **Step 4: Truyền địa chỉ vào hook**

Trong `packages/auth/src/auth.ts`, hook `session.create.before` hiện chỉ có `session.userId`. Đọc địa chỉ trước khi gọi:

```ts
before: async (session) => {
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { email: true },
  });

  const workspaceId = await ensureWorkspaceMembership(session.userId, user?.email ?? "");

  return { data: { ...session, activeOrganizationId: workspaceId ?? null } };
},
```

- [ ] **Step 5: Chạy bốn khối**

Chạy lần lượt `-t vai-dinh-truoc`, `-t rut-khong-dung-da-vao`, `-t doc-hong`
Mong đợi: PASS cả ba

- [ ] **Step 6: Phá vật thật — hai lượt**

Lượt một: bỏ `try` bọc ngoài `ensureWorkspaceMembership`, ép lớp đọc ném lỗi, chạy `-t doc-hong`. Mong đợi FAIL với thông điệp nêu lỗi đã thoát ra ngoài.
Lượt hai: đổi `role: decision.role` thành `role: "member"`, chạy `-t vai-dinh-truoc`. Mong đợi FAIL nêu vai mong đợi và vai nhận được.
Trả lại cả hai, chạy lại cho xanh.

- [ ] **Step 7: Commit**

```bash
git add packages/auth/src/organization.ts packages/auth/src/auth.ts packages/auth/test/cong-vao.integration.spec.ts
git commit -m "feat(auth): tu cach thanh vien thoi tu cap lai cho nguoi khong con duoc phep"
```

---

### Task 5: Ba thủ tục — danh sách, cho phép, rút

`independent: false` — cần Task 4 · phục vụ AC-11, AC-14 và E10, E16

**Files:**
- Modify: `apps/api/src/workspace/workspace.contracts.ts`
- Modify: `apps/api/src/workspace/workspace.service.ts`
- Modify: `apps/api/src/workspace/workspace.router.ts`
- Create: `apps/api/test/workspace-thanh-vien.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  export const allowanceOutput = z.object({
    id: z.string(),
    email: z.string(),
    role: z.enum(WORKSPACE_ROLES),
    status: z.enum(["pending", "accepted", "cancelled"]),
    invitedByName: z.string().nullable(),
    createdAt: z.string(),
  });

  export const allowEmailInput = z.object({
    email: z.string().trim().min(1).max(255),
    role: z.enum(WORKSPACE_ROLES),
  });

  export const revokeAllowanceInput = z.object({ allowanceId: z.string().min(1) });
  ```
- `WorkspaceService.allowances(userId)` · `.allowEmail(userId, input)` · `.revokeAllowance(userId, input)`

- [ ] **Step 1: Viết bài kiểm trước — hai khối**

`apps/api/test/workspace-thanh-vien.spec.ts`, khối `chuan-hoa` mang bảng năm dòng của E10, khối `cho-phep-lai` mang ba ca của E16 kèm phép đếm dòng trước-sau (1 rồi 2).

Ba dòng cuối của bảng `chuan-hoa` phải khẳng định **không lượt truy vấn nào** chạm cơ sở dữ liệu — đếm truy vấn, phải bằng không.

- [ ] **Step 2: Chạy để chắc nó đỏ**

Chạy: `cd apps/api && bun test test/workspace-thanh-vien.spec.ts -t chuan-hoa`
Mong đợi: FAIL

- [ ] **Step 3: Thêm hằng hạn và ba thủ tục**

Trong `packages/auth/src/allow-list.ts`:

```ts
export const ALLOWANCE_WITHOUT_EXPIRY = new Date("9999-12-31T00:00:00.000Z");
```

Trong `WorkspaceService`:

```ts
async allowEmail(userId: string, input: AllowEmailInput): Promise<Allowance> {
  const role = await workspaceRoleOf(userId);

  if (!isWorkspaceAdmin(role)) {
    throw new ForbiddenException("Only an owner or an admin can allow an address.");
  }

  const email = normalizeEmail(input.email);

  if (!email) {
    throw new BadRequestException("That is not an email address.");
  }

  const live = await this.db.invitation.findFirst({
    where: { organizationId: WORKSPACE_ID, email, status: { in: ["pending", "accepted"] } },
    select: { id: true },
  });

  if (live) {
    throw new BadRequestException("That address is already on the list.");
  }

  const created = await this.db.invitation.create({
    data: {
      id: crypto.randomUUID(),
      organizationId: WORKSPACE_ID,
      email,
      role: input.role,
      status: "pending",
      expiresAt: ALLOWANCE_WITHOUT_EXPIRY,
      inviterId: userId,
    },
    select: ALLOWANCE_SELECT,
  });

  this.logger.log({ message: "Address allowed", userId, allowanceId: created.id });

  return this.toAllowance(created);
}
```

`revokeAllowance` đặt `status: "cancelled"` trên đúng một dòng; `allowances` đọc mọi dòng của workspace kèm tên người đã cho phép.

- [ ] **Step 4: Nối ba thủ tục vào router**

Trong `workspace.router.ts`, thêm ba phương thức theo đúng khuôn bốn cái đang có: `@Query` cho `allowances`, `@Mutation` cho `allowEmail` và `revokeAllowance`, mỗi cái kèm `restMeta`.

- [ ] **Step 5: Chạy hai khối**

Chạy: `cd apps/api && bun test test/workspace-thanh-vien.spec.ts -t chuan-hoa` rồi `-t cho-phep-lai`
Mong đợi: PASS cả hai

- [ ] **Step 6: Phá vật thật**

Đổi bên ghi thành quay dòng cũ về `pending` thay vì tạo dòng mới, chạy `-t cho-phep-lai`.
Mong đợi: FAIL ở phép đếm, nêu hai con số. Trả lại.

- [ ] **Step 7: Sinh lại mặt tRPC và commit**

```bash
bun run check-types
git add apps/api/src/workspace apps/api/test/workspace-thanh-vien.spec.ts apps/api/src/generated/server.ts packages/auth/src/allow-list.ts
git commit -m "feat(api): ba thu tuc danh sach cho phep, them va rut"
```

---

### Task 6: Gỡ một thành viên, trọn vẹn trong một giao dịch

`independent: false` — cần Task 5 · phục vụ AC-5, AC-7 và E5, E8

**Files:**
- Modify: `apps/api/src/workspace/workspace.service.ts`
- Modify: `apps/api/src/workspace/workspace.router.ts`
- Modify: `apps/api/test/workspace-thanh-vien.spec.ts`
- Modify: `packages/auth/test/cong-vao.integration.spec.ts`

**Interfaces:**
- Produces: `WorkspaceService.removeMember(userId, { memberId })`

- [ ] **Step 1: Viết bài kiểm trước**

Khối `go-tron-ven` trong bài kiểm của `packages/auth` mang ba khẳng định của E5 — trong đó khẳng định thứ ba ép lệnh ghi thứ hai hỏng và đòi **cả hai** cùng không xảy ra.

Khối `chu-cuoi-cung` trong bài kiểm của `apps/api` mang hai khẳng định của E8 cộng đối chứng dương: khi có hai chủ, gỡ một người phải thành công.

- [ ] **Step 2: Chạy để chắc nó đỏ**

Chạy: `cd apps/api && bun test test/workspace-thanh-vien.spec.ts -t chu-cuoi-cung`
Mong đợi: FAIL

- [ ] **Step 3: Viết bản cài**

```ts
async removeMember(userId: string, input: RemoveMemberInput): Promise<void> {
  const role = await workspaceRoleOf(userId);

  if (!isWorkspaceAdmin(role)) {
    throw new ForbiddenException("Only an owner or an admin can remove a member.");
  }

  await this.db.$transaction(async (tx) => {
    const target = await tx.member.findFirst({
      where: { id: input.memberId, organizationId: WORKSPACE_ID },
      select: { id: true, role: true, user: { select: { email: true } } },
    });

    if (!target) {
      throw new NotFoundException("That person is not in this workspace.");
    }

    if (target.role === "owner") {
      const owners = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "member"
        WHERE "organizationId" = ${WORKSPACE_ID} AND role = 'owner'
        FOR UPDATE
      `;

      if (owners.length <= 1) {
        throw new ForbiddenException(
          "The workspace needs an owner. Make someone else an owner first.",
        );
      }
    }

    await tx.member.delete({ where: { id: target.id } });

    await tx.invitation.updateMany({
      where: {
        organizationId: WORKSPACE_ID,
        email: target.user.email,
        status: { in: ["pending", "accepted"] },
      },
      data: { status: "cancelled" },
    });
  });

  this.logger.log({ message: "Member removed", userId, memberId: input.memberId });
}
```

- [ ] **Step 4: Chạy hai khối**

Chạy: `cd apps/api && bun test test/workspace-thanh-vien.spec.ts -t chu-cuoi-cung`
rồi `cd packages/auth && bun test test/cong-vao.integration.spec.ts -t go-tron-ven`
Mong đợi: PASS cả hai

- [ ] **Step 5: Phá vật thật — tách hai lệnh ghi ra khỏi giao dịch**

Đổi `this.db.$transaction(async (tx) => {...})` thành hai lệnh rời chạy trên `this.db`, rồi ép lệnh thứ hai hỏng. Chạy `-t go-tron-ven`.
Mong đợi: FAIL ở khẳng định nguyên tử — hàng `member` đã mất mà lời cho phép vẫn `accepted`. Trả lại.

- [ ] **Step 6: Commit**

```bash
bun run check-types
git add apps/api/src/workspace apps/api/test packages/auth/test/cong-vao.integration.spec.ts apps/api/src/generated/server.ts
git commit -m "feat(api): go mot thanh vien la mot viec tron ven"
```

---

### Task 7: Domain nhà rời khỏi danh sách người

`independent: false` — cần Task 2 · phục vụ AC-10 và E11

**Files:**
- Modify: `packages/auth/src/workspace.ts:31-33`
- Modify: `apps/api/src/mailbox/mailbox-match.service.ts:1,60`
- Modify: `apps/api/src/tracking/tracking-filing.service.ts:1,82`
- Create: `apps/api/test/domain-nha-tach.spec.ts`

**Interfaces:**
- Produces: `staffEmailDomains(): Promise<readonly string[]>` đọc từ `appSetting`; `workspaceDomains()` bị gỡ khỏi `@crm/auth`

- [ ] **Step 1: Viết bài kiểm trước**

`apps/api/test/domain-nha-tach.spec.ts` mang bốn khẳng định của E11, gọi **thật** hai đường đọc chứ không tìm chuỗi.

- [ ] **Step 2: Chạy để chắc nó đỏ**

Chạy: `cd apps/api && bun test test/domain-nha-tach.spec.ts`
Mong đợi: FAIL

- [ ] **Step 3: Viết đường đọc mới và đổi hai chỗ tiêu thụ**

Hàm mới đọc `appSetting.staffEmailDomains`, tách theo dấu phẩy, cắt khoảng trắng, hạ chữ thường. Hai dịch vụ đổi từ `workspaceDomains()` sang hàm mới. Gỡ `workspaceDomains` khỏi `packages/auth/src/workspace.ts` và khỏi `index.ts` — để trống nó lại là mời người sau đọc ké lần nữa.

- [ ] **Step 4: Chạy để chắc nó xanh**

Chạy: `cd apps/api && bun test test/domain-nha-tach.spec.ts`
Mong đợi: PASS

- [ ] **Step 5: Phá vật thật**

Cấy lại `workspaceDomains()` cũ vào một trong hai đường đọc. Chạy lại.
Mong đợi: FAIL nêu đúng đường nào. Trả lại.

- [ ] **Step 6: Commit**

```bash
git add packages/auth/src apps/api/src/mailbox apps/api/src/tracking apps/api/test/domain-nha-tach.spec.ts
git commit -m "feat: domain nha roi khoi danh sach nguoi"
```

---

### Task 8: Quyền, hai vế cùng một nguồn

`independent: false` — cần Task 6 · phục vụ AC-8 và E9

**Files:**
- Modify: `apps/api/src/workspace/workspace.contracts.ts`
- Modify: `apps/api/src/workspace/workspace.service.ts:76-88`
- Modify: `apps/api/test/workspace-thanh-vien.spec.ts`

**Interfaces:**
- Produces: `workspaceOutput` thêm `canManageMembers: boolean`, tính bằng `isWorkspaceAdmin(role)` ngay trong `WorkspaceService.get`

- [ ] **Step 1: Viết bài kiểm trước**

Khối `quyen-hai-ve` mang ba khẳng định AST của E9 cộng phép gọi thật bốn thủ tục với vai `member`.

Khẳng định thứ ba — tệp `"use client"` của màn Members không nhập `@crm/auth` — chạy bằng cách đọc cây cú pháp của mọi tệp dưới `apps/app/app/(app)/[slug]/settings/members/`.

- [ ] **Step 2: Chạy để chắc nó đỏ**

Chạy: `cd apps/api && bun test test/workspace-thanh-vien.spec.ts -t quyen-hai-ve`
Mong đợi: FAIL

- [ ] **Step 3: Thêm cờ vào đầu ra của workspace**

```ts
canManageMembers: isWorkspaceAdmin(role),
```

Đây là **chỗ duy nhất** tính cờ ấy. Màn hình nhận nó qua `workspace.get`, không tự so vai.

- [ ] **Step 4: Chạy để chắc nó xanh**

Chạy: `cd apps/api && bun test test/workspace-thanh-vien.spec.ts -t quyen-hai-ve`
Mong đợi: PASS

- [ ] **Step 5: Phá vật thật**

Đổi dòng trên thành `role === "admin"`. Chạy lại.
Mong đợi: FAIL ở khẳng định 1 và 2. Trả lại.

- [ ] **Step 6: Commit**

```bash
bun run check-types
git add apps/api/src/workspace apps/api/test/workspace-thanh-vien.spec.ts apps/api/src/generated/server.ts
git commit -m "feat(api): mot nguon duy nhat cho quyen quan thanh vien"
```

---

### Task 9: Màn Members thành hai khối

`independent: false` — cần Task 8 · phục vụ AC-13 và E12, E13, E15

**Files:**
- Create: `apps/app/app/(app)/[slug]/settings/members/allowances-table.tsx`
- Create: `apps/app/app/(app)/[slug]/settings/members/allow-dialog.tsx`
- Create: `apps/app/app/(app)/[slug]/settings/members/confirm-dialog.tsx`
- Modify: `apps/app/app/(app)/[slug]/settings/members/page.tsx`
- Modify: `apps/app/app/(app)/[slug]/settings/members/members-table.tsx`
- Modify: `apps/app/lib/messages/settings-thanh-vien.ts`

**Interfaces:**
- Consumes: `workspace.allowances`, `workspace.allowEmail`, `workspace.revokeAllowance`, `workspace.removeMember`, cờ `canManageMembers`

- [ ] **Step 1: Thêm chữ cho cả hai thứ tiếng**

Trong `settings-thanh-vien.ts`, thêm vào `en` rồi `vi` khối `duocPhepVao` (tiêu đề khối, tên bốn cột, trạng thái rỗng, nút cho phép), khối `hopThoaiChoPhep`, và khối `xacNhan` với **hai** câu tách bạch:

```ts
xacNhan: {
  go: {
    tieuDe: "Remove this person?",
    than: "They lose access now. Signing in again will not bring them back.",
    nut: "Remove",
  },
  rut: {
    tieuDe: "Withdraw this allowance?",
    than: "This only stops someone who has not signed in yet. Anyone already in stays in.",
    nut: "Withdraw",
  },
},
```

Hai câu `than` là thứ người quản đọc để phân biệt hai việc — đây chính là mục Mạnh sẽ chấm ở cổng sau.

- [ ] **Step 2: Trang máy chủ nạp sẵn cả hai khối**

Trong `page.tsx`, thêm một lượt `prefetchQuery` cho `trpc.workspace.allowances`.

- [ ] **Step 3: Viết khối *Được phép vào***

`allowances-table.tsx` là `"use client"`, dùng `DataTable` của `@crm/ui` đúng như `members-table.tsx` đang dùng. **Không nhập `@crm/auth`.** Bốn cột: địa chỉ, vai sẽ nhận, ai cho phép, lúc nào. Nút rút chỉ hiện khi `canManageMembers`.

- [ ] **Step 4: Viết hộp thoại**

`allow-dialog.tsx` — ô nhập `type="email"` có nhãn bấm được và `autocomplete="email"`, một ô chọn vai, nút gửi giữ nguyên chữ tới khi lượt gọi bắt đầu. Lỗi hiện **cạnh ô nhập**, con trỏ về ô đó.

`confirm-dialog.tsx` — dùng chung cho gỡ và rút, nhận tiêu đề, thân và nhãn nút từ khối chữ. Nút xác nhận dùng biến thể `destructive`.

- [ ] **Step 5: Thêm nút gỡ vào khối thành viên**

Trong `members-table.tsx`, thêm một mục vào `DropdownMenu` đang có, mở `confirm-dialog` với bộ chữ `xacNhan.go`.

- [ ] **Step 6: Dựng và soi thật**

```bash
bun run build
```

Mong đợi: PASS. Đỏ ở `Module not found: Can't resolve 'dns'` nghĩa là một tệp `"use client"` đã nhập gói máy chủ — đọc dấu vết nhập từ dưới lên, dòng áp chót là component làm rò.

Rồi chạy ứng dụng và tự soi hai khối, ba hộp thoại ở hai khổ màn.

- [ ] **Step 7: Commit**

```bash
git add "apps/app/app/(app)/[slug]/settings/members" apps/app/lib/messages/settings-thanh-vien.ts
git commit -m "feat(app): man Members thanh hai khoi tach bach"
```

---

### Task 10: Màn hết quyền

`independent: false` — cần Task 9 · phục vụ AC-6 và E12

**Files:**
- Create: `apps/app/app/(app)/(no-workspace)/het-quyen/page.tsx`
- Modify: `apps/app/proxy.ts`
- Modify: `apps/app/lib/messages/settings-thanh-vien.ts`

- [ ] **Step 1: Viết màn**

Một trang máy chủ, một câu nói tài khoản này không còn trong không gian làm việc, và một nút đăng xuất. Không nút nào khác — người ở đây không còn việc gì làm trong CRM.

- [ ] **Step 2: Chặn ở proxy**

Trong `proxy.ts`, cạnh hai cổng đang có, thêm một lượt đọc: có phiên nhưng `activeOrganizationId` rỗng thì chuyển tới `/het-quyen`. Đường `/het-quyen` tự nó không bị gác, cùng nhóm với `/sign-in` và `/grant-access` — gác nó là dựng một vòng chuyển hướng.

Giữ nguyên luật **API không với tới được thì mở**: một lượt đọc hỏng không được đẩy người đang làm việc ra màn hết quyền.

- [ ] **Step 3: Soi thật**

Dựng cây đang xét, tạo phiên cho một tài khoản đã bị gỡ, mở một trang bất kỳ.
Mong đợi: dừng ở màn hết quyền, không vòng chuyển hướng, không màn trắng.

- [ ] **Step 4: Chụp khung hình làm bằng chứng**

Đặt `APP_URL` và `API_URL` **tay** theo cổng của chính cây đang xét. Chụp vào `_acceptance/cho-phep-ai-vao-o-man-hinh/evidence/`:
- màn hết quyền
- màn Members nhìn bằng mắt vai `member`
- màn Members nhìn bằng mắt vai `admin`

Trước khi tin khung hình nào: nhìn xem bản dựng ấy **có** khối *Được phép vào* không. Không có nghĩa là đang chụp bản cũ ở checkout khác.

- [ ] **Step 5: Commit**

```bash
git add "apps/app/app/(app)/(no-workspace)" apps/app/proxy.ts apps/app/lib/messages/settings-thanh-vien.ts _acceptance/cho-phep-ai-vao-o-man-hinh/evidence
git commit -m "feat(app): man het quyen cho nguoi khong con la thanh vien"
```

---

### Task 11: Sửa những luật vòng này lật

`independent: true` · không phục vụ AC nào — đây là nợ tài liệu của chính vòng

**Files:**
- Modify: `docs/api.md:44-52`
- Modify: `.env.example:28-35`
- Modify: `docs/environment.md`

- [ ] **Step 1: Sửa `docs/api.md`**

Bỏ câu *"Signing in is the join; no invite flow"* và câu *"The plugin's `invitation` table is unused"*. Thay bằng: tư cách thành viên cấp cho người có địa chỉ trong bảng lời cho phép; bảng `invitation` là danh sách ấy; hook vẫn suy giảm chứ không ném lỗi.

Sửa luôn dòng *"`ALLOWED_SIGN_IN` still decides who gets an account"* ở mục SSO — nay nó chỉ còn là mồi cho lần cài đầu.

- [ ] **Step 2: Sửa `.env.example` và `docs/environment.md`**

`ALLOWED_SIGN_IN` đổi lời thành mồi-lần-đầu: chỉ có tiếng nói khi bảng rỗng **và** chưa ai đăng nhập bao giờ. Nói rõ nó **thôi** nuôi domain nhà, và domain nhà nay là một ô trong cài đặt.

- [ ] **Step 3: Kiểm**

Chạy: `bun run lint:slop`
Mong đợi: PASS

- [ ] **Step 4: Commit**

```bash
git add docs/api.md .env.example docs/environment.md
git commit -m "docs: sua luat cho-phep-ai-vao va vai moi cua ALLOWED_SIGN_IN"
```

---

## Chạy trọn bộ cổng trước khi giao

```bash
bun run test
bun run check-types
bun run lint
bun run lint:slop
bun run build
```

Cả năm phải xanh. `bun run build` là lệnh thứ năm vì bốn lệnh đầu không dựng ứng dụng — một hồi quy làm `next build` đỏ đã từng đi qua bốn vòng đã ký mà không cổng nào thấy.
