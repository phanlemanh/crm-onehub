# Vào bằng email và mật khẩu — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nhân viên kinh doanh vào được CRM bằng email và mật khẩu, kể cả khi đứng trong mạng chặn Google.

**Architecture:** Mượn nguyên bộ đặt-lại-mật-khẩu của better-auth để TIÊU THỤ chìa (token một lần ở bảng `verification`, tiền tố `reset-password:`, băm mật khẩu, huỷ phiên cũ). Chỉ đổi ĐƯỜNG GIAO: thủ tục tRPC của quản trị tự đúc token rồi trả liên kết đồng bộ, thay vì gửi thư. Cửa Google giữ nguyên.

**Tech Stack:** better-auth 1.6.25 (đã cài) · Prisma · NestJS + nestjs-trpc · Next.js 16 App Router · `@crm/ui` (shadcn)

**Spec:** `docs/superpowers/specs/2026-09-19-vao-bang-email-va-mat-khau-design.md`
**Hợp đồng:** `_acceptance/vao-bang-email-va-mat-khau/contract.md` (13 tiêu chí, T3, duyệt 2026-09-19)
**Bộ đo:** `_acceptance/vao-bang-email-va-mat-khau/evals.yaml` (17 phép)

## Global Constraints

- **Không viết chú thích trong code.** Không cho code mới, không cho code sửa. (`AGENTS.md`)
- **Một `.env` duy nhất ở gốc kho.** Vòng này KHÔNG thêm biến môi trường nào.
- **`/packages/ui` là nguồn duy nhất của giao diện.** Cần biến thể mới thì làm ở đó, không override bằng `className` tại chỗ gọi. (`docs/design.md`)
- **Client component không được nhập package máy chủ.** `@crm/auth` và `@crm/db` là package máy chủ. Trang server tính, client chỉ nhận dữ liệu phẳng. (`AGENTS.md`)
- **Chỉ nhập `@crm/ui` theo subpath** (`@crm/ui/components/<tên>`).
- **Quyền phải có tên**, sống ở `@crm/auth`, service dùng nó VÀ giao diện dùng nó để tắt nút. (`docs/api.md`)
- **Bán kính góc chỉ lấy từ thang:** `rounded-sm` / `rounded-md` / `rounded-lg`. Không bán kính tự đặt.
- **Ba khoá cấu hình không thương lượng:** `enabled: true` · `disableSignUp: true` · `revokeSessionsOnPasswordReset: true`.
- **Độ dài mật khẩu tối thiểu: 12.** Không bắt chữ hoa, không bắt ký tự đặc biệt, KHÔNG bắt đổi định kỳ (NIST SP 800-63B Rev 4 cấm).
- **Hạn của chìa: 1 giờ** (`resetPasswordTokenExpiresIn: 3600`).
- **Nhãn tiếng Việt** theo luật nhãn của `CONTEXT.md`; dữ liệu người nhập không dịch.

---

## Cấu trúc file

| File | Trách nhiệm |
|---|---|
| `packages/auth/src/auth.ts` | bật cửa mật khẩu, chặn tự đăng ký, nối bộ sàng mật khẩu đã lộ |
| `packages/auth/src/organization.ts` | thêm vị từ `canIssuePasswordLink` |
| `packages/auth/src/chia-mat-khau.ts` | **mới** — đúc chìa: sinh token, ghi hàng `verification`, dựng URL |
| `packages/db/prisma/schema.prisma` | **mới** — model `PasswordLinkIssue`, bảng ghi vết append-only |
| `apps/api/src/workspace/workspace.contracts.ts` | schema vào/ra của thủ tục phát chìa |
| `apps/api/src/workspace/workspace.service.ts` | thủ tục phát chìa: quyền, tạo người nếu chưa có, đúc chìa, ghi vết |
| `apps/api/src/workspace/workspace.router.ts` | mở thủ tục ra tRPC |
| `apps/app/proxy.ts` | thêm đường đặt mật khẩu vào danh sách ngoài cổng |
| `apps/app/app/(landing)/dat-mat-khau/[token]/page.tsx` | **mới** — trang server, không cần đăng nhập |
| `apps/app/app/(landing)/dat-mat-khau/[token]/dat-mat-khau-form.tsx` | **mới** — client, hai ô mật khẩu |
| `apps/app/app/(landing)/sign-in/password-sign-in.tsx` | **mới** — client, ô email + mật khẩu |
| `apps/app/app/(app)/[slug]/settings/members/phat-chia-dialog.tsx` | **mới** — client, hộp thoại hiện liên kết |
| `apps/app/lib/messages/auth.ts` | chuỗi cho hai màn ngoài cổng |
| `apps/app/lib/messages/settings-thanh-vien.ts` | chuỗi cho nút và hộp thoại |

---

### Task 1: Bật cửa mật khẩu, chặn tự đăng ký, vị từ quyền có tên

Nền của mọi task sau. `independent: false`.

**Phục vụ:** E7 (chặn tự đăng ký) · E8 (mật khẩu yếu hoặc đã lộ) · E9 (cửa Google còn sống)

**Files:**
- Modify: `packages/auth/src/auth.ts` (khối `emailAndPassword` ở dòng 81, khối `plugins`)
- Modify: `packages/auth/src/organization.ts` (thêm vị từ cạnh `canChangeRole` dòng 19)
- Modify: `packages/auth/src/index.ts` (xuất vị từ mới, khối export dòng 33)
- Create: `packages/auth/test/chia-mat-khau.integration.spec.ts`

**Interfaces:**
- Produces: `canIssuePasswordLink(role: WorkspaceRole | null): boolean`
- Produces: cấu hình `auth` có `emailAndPassword.enabled === true`, `disableSignUp === true`

- [ ] **Step 1: Viết bài kiểm chặn tự đăng ký — chiều âm HAI địa chỉ**

Tạo `packages/auth/test/chia-mat-khau.integration.spec.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { auth } from "../src/auth";

describe("chan-tu-dang-ky", () => {
	test("dia chi TRONG danh sach duoc vao van khong tu dang ky duoc", async () => {
		const email = `trong-ds-${Date.now()}@onehub.center`;
		await db.invitation.create({
			data: {
				id: `inv-${Date.now()}`,
				organizationId: "workspace",
				email,
				role: "member",
				status: "pending",
				expiresAt: new Date("9999-12-31T00:00:00.000Z"),
				inviterId: null,
			},
		});

		const truoc = await db.user.count({ where: { email } });
		expect(truoc).toBe(0);

		await expect(
			auth.api.signUpEmail({
				body: { email, password: "mot-mat-khau-du-dai-12", name: "Ke la" },
			}),
		).rejects.toThrow();

		const sau = await db.user.count({ where: { email } });
		expect(sau).toBe(0);
	});

	test("dia chi NGOAI danh sach cung khong tu dang ky duoc", async () => {
		const email = `ngoai-ds-${Date.now()}@example.com`;

		await expect(
			auth.api.signUpEmail({
				body: { email, password: "mot-mat-khau-du-dai-12", name: "Ke la" },
			}),
		).rejects.toThrow();

		expect(await db.user.count({ where: { email } })).toBe(0);
	});
});
```

- [ ] **Step 2: Chạy để chắc nó ĐỎ**

Run: `bun run test -- "cd packages/auth && bun test test/chia-mat-khau.integration.spec.ts -t chan-tu-dang-ky"`
Expected: FAIL — `signUpEmail` hiện đang tắt hẳn (`emailAndPassword.enabled: false`) nên nó nem loi khac, hoặc ca đầu tạo được hàng người dùng. Đọc kỹ thông điệp: nếu nó đỏ vì «cửa tắt» thì đó CHƯA phải cái ta muốn chứng.

- [ ] **Step 3: Bật cửa mật khẩu với đủ ba khoá**

Trong `packages/auth/src/auth.ts`, thay khối `emailAndPassword` hiện tại:

```ts
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
		revokeSessionsOnPasswordReset: true,
		minPasswordLength: PASSWORD.minLength,
		resetPasswordTokenExpiresIn: PASSWORD.tokenTtlSeconds,
	},
```

Thêm vào đầu file, cạnh các import hiện có:

```ts
import { PASSWORD } from "./chia-mat-khau";
```

- [ ] **Step 4: Tạo file cấu hình hằng cho mật khẩu**

Hằng sống một chỗ theo luật `AGENTS.md`, không rải ở đầu file nào cần trước. Tạo `packages/auth/src/chia-mat-khau.ts` với PHẦN HẰNG trước (phần đúc chìa là Task 2):

```ts
const SECOND_MS = 1000;
const HOUR_SECONDS = 60 * 60;

export const PASSWORD = {
	minLength: 12,
	tokenTtlSeconds: HOUR_SECONDS,
	tokenBytes: 24,
	verificationPrefix: "reset-password:",
} as const;

export const CHIA = {
	ttlMs: PASSWORD.tokenTtlSeconds * SECOND_MS,
} as const;
```

- [ ] **Step 5: Chạy lại — phải XANH cả hai ca**

Run: `bun run test -- "cd packages/auth && bun test test/chia-mat-khau.integration.spec.ts -t chan-tu-dang-ky"`
Expected: PASS

- [ ] **Step 6: Đột biến chứng minh — gỡ khoá chặn phải làm ca thứ nhất ĐỎ**

Tạm đổi `disableSignUp: true` thành `false`, chạy lại.
Expected: ca «dia chi TRONG danh sach» phải ĐỎ ở dòng `expect(sau).toBe(0)`.
Rồi trả lại `true` và chạy lại cho xanh. Không commit trạng thái `false`.

- [ ] **Step 7: Viết bài kiểm mật khẩu yếu — BA dòng, có đối chứng dương**

Thêm vào cùng file:

```ts
describe("mat-khau-yeu", () => {
	test("ngan hon muc toi thieu, da lo, va mot mat khau sach", async () => {
		const ket = await gieoNguoiVaChia();

		const ngan = await thuDatMatKhau(ket.token, "ngan123");
		expect(ngan.ok).toBe(false);
		expect(ngan.message).toContain("12");

		const daLo = await thuDatMatKhau(ket.token, "password123456");
		expect(daLo.ok).toBe(false);
		expect(daLo.message).not.toContain("12");
		expect(daLo.message).toMatch(/lo|compromis|pwned/i);

		const sach = await thuDatMatKhau(ket.token, `Chia-${Date.now()}-onehub`);
		expect(sach.ok).toBe(true);
	});
});
```

Hai hàm trợ giúp `gieoNguoiVaChia()` và `thuDatMatKhau()` viết ở Task 2 Step 1 — task này để nguyên bài kiểm ở trạng thái đỏ-vì-chưa-có-hàm và sẽ xanh sau Task 2. Ghi rõ điều đó vào commit message.

- [ ] **Step 8: Nối bộ sàng mật khẩu đã lộ**

Trong `packages/auth/src/auth.ts`, thêm vào mảng `plugins`:

```ts
		haveIBeenPwned({
			customPasswordCompromisedMessage:
				"Mật khẩu này đã từng bị lộ trong một vụ rò dữ liệu. Chọn mật khẩu khác.",
		}),
```

Và import:

```ts
import { haveIBeenPwned } from "better-auth/plugins/haveibeenpwned";
```

- [ ] **Step 9: Thêm vị từ quyền có tên**

Trong `packages/auth/src/organization.ts`, cạnh `canChangeRole`:

```ts
export function canIssuePasswordLink(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}
```

Trong `packages/auth/src/index.ts`, thêm `canIssuePasswordLink,` vào khối export đang có (giữ thứ tự chữ cái: nó đứng sau `canConfigureSso`).

- [ ] **Step 10: Bài kiểm cửa Google còn sống**

```ts
describe("cua-google-con-song", () => {
	test("bat cua mat khau khong tat cau hinh google", () => {
		expect(auth.options.socialProviders?.google).toBeDefined();
		expect(auth.options.emailAndPassword?.enabled).toBe(true);
	});

	test("mot dia chi di ca hai cua van la MOT hang nguoi dung", async () => {
		const ket = await gieoNguoiVaChia();
		const dat = await thuDatMatKhau(ket.token, `Ca-hai-${Date.now()}-cua`);
		expect(dat.ok).toBe(true);

		expect(await db.user.count({ where: { email: ket.email } })).toBe(1);
		const soTaiKhoan = await db.account.count({ where: { userId: ket.userId } });
		expect(soTaiKhoan).toBeGreaterThanOrEqual(1);
	});
});
```

- [ ] **Step 11: Chạy kiểm kiểu và lint**

Run: `bun run check-types && bun run lint && bun run lint:slop`
Expected: cả ba xanh

- [ ] **Step 12: Commit**

```bash
git add packages/auth/src/auth.ts packages/auth/src/organization.ts packages/auth/src/index.ts packages/auth/src/chia-mat-khau.ts packages/auth/test/chia-mat-khau.integration.spec.ts
git commit -m "feat(auth): bat cua mat khau, chan tu dang ky, vi tu quyen phat chia"
```

---

### Task 2: Đúc và tiêu thụ chìa — vòng tròn

Phép đo xương sống của cả vòng. `independent: false` (cần Task 1).

**Phục vụ:** E3 (vòng tròn) · E4 (dùng lần hai) · E5 (hết hạn) · E16 (phát lại khi quên)

**Files:**
- Modify: `packages/auth/src/chia-mat-khau.ts` (thêm phần đúc chìa vào file hằng của Task 1)
- Modify: `packages/auth/src/index.ts`
- Modify: `packages/auth/test/chia-mat-khau.integration.spec.ts`

**Interfaces:**
- Consumes: `PASSWORD`, `CHIA` (Task 1)
- Produces: `async function ducChia(input: { userId: string; appUrl: string }): Promise<{ url: string; expiresAt: Date }>`
- Produces: `async function donChiaCu(userId: string): Promise<number>`

- [ ] **Step 1: Viết hai hàm trợ giúp cho bài kiểm**

Thêm vào đầu `packages/auth/test/chia-mat-khau.integration.spec.ts`:

```ts
import { ducChia, PASSWORD } from "../src/chia-mat-khau";

async function gieoNguoiVaChia() {
	const email = `chia-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@onehub.center`;
	const userId = `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

	await db.user.create({
		data: { id: userId, name: "Nguoi thu", email, emailVerified: true },
	});

	const chia = await ducChia({ userId, appUrl: "http://localhost:3000" });
	const token = chia.url.split("/").at(-1) ?? "";

	return { email, userId, token, url: chia.url, expiresAt: chia.expiresAt };
}

async function thuDatMatKhau(token: string, newPassword: string) {
	try {
		await auth.api.resetPassword({ body: { token, newPassword } });
		return { ok: true as const, message: "" };
	} catch (loi) {
		return { ok: false as const, message: String((loi as Error)?.message ?? loi) };
	}
}

async function thuDangNhap(email: string, password: string) {
	try {
		const ket = await auth.api.signInEmail({ body: { email, password } });
		return { ok: true as const, userId: ket?.user?.id ?? null };
	} catch {
		return { ok: false as const, userId: null };
	}
}
```

- [ ] **Step 2: Viết bài kiểm VÒNG TRÒN — bốn chặng**

```ts
describe("vong-tron", () => {
	test("duc, tieu thu, mat khau luu that, dang nhap duoc", async () => {
		const ket = await gieoNguoiVaChia();
		const matKhau = `Vong-tron-${Date.now()}`;

		const hang = await db.verification.findFirst({
			where: { identifier: `${PASSWORD.verificationPrefix}${ket.token}` },
		});
		expect(hang).not.toBeNull();
		expect(hang?.value).toBe(ket.userId);

		const dat = await thuDatMatKhau(ket.token, matKhau);
		expect(dat.ok).toBe(true);

		const taiKhoan = await db.account.findFirst({
			where: { userId: ket.userId, providerId: "credential" },
			select: { password: true },
		});
		expect(taiKhoan?.password).toBeTruthy();

		const vao = await thuDangNhap(ket.email, matKhau);
		expect(vao.ok).toBe(true);
		expect(vao.userId).toBe(ket.userId);
	});
});
```

- [ ] **Step 3: Chạy — phải ĐỎ vì chưa có `ducChia`**

Run: `bun run test -- "cd packages/auth && bun test test/chia-mat-khau.integration.spec.ts -t vong-tron"`
Expected: FAIL — `ducChia is not a function` hoặc lỗi nhập module

- [ ] **Step 4: Viết `ducChia` và `donChiaCu`**

Thêm vào `packages/auth/src/chia-mat-khau.ts`:

```ts
import { randomBytes } from "node:crypto";
import { db } from "@crm/db";

export async function donChiaCu(userId: string): Promise<number> {
	const ket = await db.verification.deleteMany({
		where: { value: userId, identifier: { startsWith: PASSWORD.verificationPrefix } },
	});

	return ket.count;
}

export async function ducChia(input: {
	userId: string;
	appUrl: string;
}): Promise<{ url: string; expiresAt: Date }> {
	await donChiaCu(input.userId);

	const token = randomBytes(PASSWORD.tokenBytes).toString("base64url");
	const expiresAt = new Date(Date.now() + CHIA.ttlMs);

	await db.verification.create({
		data: {
			id: randomBytes(16).toString("hex"),
			identifier: `${PASSWORD.verificationPrefix}${token}`,
			value: input.userId,
			expiresAt,
		},
	});

	return {
		url: new URL(`/dat-mat-khau/${token}`, input.appUrl).toString(),
		expiresAt,
	};
}
```

Xuất từ `packages/auth/src/index.ts`: `export { CHIA, donChiaCu, ducChia, PASSWORD } from "./chia-mat-khau";`

- [ ] **Step 5: Chạy lại — vòng tròn phải XANH**

Run: `bun run test -- "cd packages/auth && bun test test/chia-mat-khau.integration.spec.ts -t vong-tron"`
Expected: PASS

- [ ] **Step 6: CHIỀU ĐỎ BẮT BUỘC — phá tiền tố định danh**

Đây là chỗ canh rủi ro kiến trúc của cả vòng. Tạm đổi trong `chia-mat-khau.ts`:

```ts
	verificationPrefix: "dat-mat-khau:",
```

Run lại lệnh Step 5.
Expected: FAIL ở `expect(dat.ok).toBe(true)` — thư viện không tìm được token.
**Nếu nó vẫn XANH thì phép đo này vô dụng và phải viết lại trước khi đi tiếp.**
Rồi trả lại `"reset-password:"`.

- [ ] **Step 7: Bài kiểm dùng lần hai và hết hạn**

```ts
describe("dung-lan-hai", () => {
	test("chia da dung thi lan hai bi tu choi, mat khau lan mot van song", async () => {
		const ket = await gieoNguoiVaChia();
		const mot = `Lan-mot-${Date.now()}`;
		const hai = `Lan-hai-${Date.now()}`;

		expect((await thuDatMatKhau(ket.token, mot)).ok).toBe(true);
		expect((await thuDatMatKhau(ket.token, hai)).ok).toBe(false);

		expect((await thuDangNhap(ket.email, mot)).ok).toBe(true);
		expect((await thuDangNhap(ket.email, hai)).ok).toBe(false);
	});
});

describe("het-han", () => {
	test("con han thi dat duoc, qua han thi khong", async () => {
		const con = await gieoNguoiVaChia();
		expect((await thuDatMatKhau(con.token, `Con-han-${Date.now()}`)).ok).toBe(true);

		const qua = await gieoNguoiVaChia();
		await db.verification.updateMany({
			where: { identifier: `${PASSWORD.verificationPrefix}${qua.token}` },
			data: { expiresAt: new Date(Date.now() - 60_000) },
		});

		const matKhau = `Qua-han-${Date.now()}`;
		expect((await thuDatMatKhau(qua.token, matKhau)).ok).toBe(false);
		expect((await thuDangNhap(qua.email, matKhau)).ok).toBe(false);
	});
});
```

- [ ] **Step 8: Bài kiểm PHÁT LẠI khi quên — bốn khẳng định**

```ts
describe("phat-lai", () => {
	test("chia thu hai song thi chia thu nhat chet, khong con token treo", async () => {
		const ket = await gieoNguoiVaChia();
		const m1 = `Mat-khau-mot-${Date.now()}`;
		expect((await thuDatMatKhau(ket.token, m1)).ok).toBe(true);

		const chia2 = await ducChia({ userId: ket.userId, appUrl: "http://localhost:3000" });
		const token2 = chia2.url.split("/").at(-1) ?? "";
		const m2 = `Mat-khau-hai-${Date.now()}`;
		expect((await thuDatMatKhau(token2, m2)).ok).toBe(true);

		expect((await thuDangNhap(ket.email, m2)).ok).toBe(true);
		expect((await thuDangNhap(ket.email, m1)).ok).toBe(false);
		expect((await thuDatMatKhau(ket.token, `Lai-nua-${Date.now()}`)).ok).toBe(false);

		const treo = await db.verification.count({
			where: { value: ket.userId, identifier: { startsWith: PASSWORD.verificationPrefix } },
		});
		expect(treo).toBe(0);
	});
});
```

- [ ] **Step 9: Đột biến chứng minh cho `phat-lai`**

Tạm bỏ dòng `await donChiaCu(input.userId);` trong `ducChia`, chạy:
`bun run test -- "cd packages/auth && bun test test/chia-mat-khau.integration.spec.ts -t phat-lai"`
Expected: FAIL ở `expect(treo).toBe(0)` — số hàng treo là 1.
Rồi trả lại dòng đó.

- [ ] **Step 10: Chạy trọn file + kiểm kiểu**

Run: `bun run test -- "cd packages/auth && bun test test/chia-mat-khau.integration.spec.ts"` rồi `bun run check-types`
Expected: cả hai xanh, và các ca `mat-khau-yeu` của Task 1 nay cũng xanh

- [ ] **Step 11: Commit**

```bash
git add packages/auth/src/chia-mat-khau.ts packages/auth/src/index.ts packages/auth/test/chia-mat-khau.integration.spec.ts
git commit -m "feat(auth): duc va tieu thu chia dat mat khau, vong tron hai chieu"
```

---

### Task 3: Bảng ghi vết ai phát chìa cho ai

`independent: true` — chạy song song được với Task 2.

**Phục vụ:** E11 (ghi vết)

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/<timestamp>_password_link_issue/migration.sql` (Prisma sinh)

**Interfaces:**
- Produces: model `PasswordLinkIssue { id, email, issuedById, issuedByName, issuedAt }`

**Vì sao cần bảng mới:** token nằm ở bảng `verification` và bị XOÁ khi tiêu thụ, nên không truy được «ai phát, lúc nào». Chuẩn OWASP ASVS đòi để lại dấu vết; bảng này là phần làm được của đòi hỏi đó (phần báo cho người dùng thì kho không gửi được thư, đã khai giới hạn ở hợp đồng).

- [ ] **Step 1: Thêm model vào schema**

Trong `packages/db/prisma/schema.prisma`, sau model `Verification`:

```prisma
model PasswordLinkIssue {
  id           String   @id
  email        String
  issuedById   String
  issuedByName String
  issuedAt     DateTime @default(now())

  @@index([email, issuedAt])
  @@map("password_link_issue")
}
```

- [ ] **Step 2: Sinh migration và áp**

```bash
cd packages/db && bunx prisma migrate dev --name password_link_issue
```
Expected: sinh một file migration, áp vào cơ sở dữ liệu phát triển, và `prisma generate` chạy theo

- [ ] **Step 3: Kiểm kiểu — client Prisma phải biết model mới**

Run: `bun run check-types`
Expected: xanh. Nếu đỏ vì thiếu kiểu thì chạy `bun run db:generate` rồi kiểm lại.

- [ ] **Step 4: Commit**

```bash
git add packages/db/prisma/schema.prisma packages/db/prisma/migrations
git commit -m "feat(db): bang ghi vet ai phat chia dat mat khau cho ai"
```

---

### Task 4: Thủ tục phát chìa ở API

`independent: false` — cần Task 1, 2, 3.

**Phục vụ:** E1 (phát chìa) · E2 (tạo người trước) · E6 (quyền hai vế) · E11 (ghi vết)

**Files:**
- Modify: `apps/api/src/workspace/workspace.contracts.ts`
- Modify: `apps/api/src/workspace/workspace.service.ts`
- Modify: `apps/api/src/workspace/workspace.router.ts`
- Create: `apps/api/test/mat-khau-lien-ket.spec.ts`

**Interfaces:**
- Consumes: `ducChia` (Task 2), `canIssuePasswordLink` (Task 1), `PasswordLinkIssue` (Task 3)
- Produces: `WorkspaceService.issuePasswordLink(userId: string, input: { email: string }, quyen?: (role: WorkspaceRole | null) => boolean): Promise<{ url: string; expiresAt: string }>`

Tham số `quyen` là chỗ TIÊM cho E6 vế hai — mặc định là `canIssuePasswordLink`.

- [ ] **Step 1: Thêm schema vào contracts**

```ts
export const issuePasswordLinkInput = z.object({
	email: z.string().trim().min(1).max(255),
});

export const passwordLinkOutput = z.object({
	url: z.string(),
	expiresAt: z.string(),
});

export type IssuePasswordLinkInput = z.infer<typeof issuePasswordLinkInput>;
```

Và thêm hai trường vào `allowanceOutput` đang có, để màn Thành viên đọc được vết:

```ts
	passwordLinkIssuedAt: z.string().nullable(),
	passwordLinkIssuedByName: z.string().nullable(),
```

- [ ] **Step 2: Viết bài kiểm quyền hai vế TRƯỚC — có tiêm hai chiều**

Tạo `apps/api/test/mat-khau-lien-ket.spec.ts`:

```ts
describe("quyen-hai-ve", () => {
	test("member bi tu choi, admin va owner duoc, va ket qua di qua vi tu", async () => {
		const { service, db } = await dungService();
		const member = await gieoNguoi("member");
		const admin = await gieoNguoi("admin");
		const owner = await gieoNguoi("owner");
		const nhan = await gieoNguoi("member");

		const truoc = await db.verification.count();
		await expect(service.issuePasswordLink(member.id, { email: nhan.email })).rejects.toThrow();
		expect(await db.verification.count()).toBe(truoc);

		expect((await service.issuePasswordLink(admin.id, { email: nhan.email })).url).toContain("/dat-mat-khau/");
		expect((await service.issuePasswordLink(owner.id, { email: nhan.email })).url).toContain("/dat-mat-khau/");

		await expect(
			service.issuePasswordLink(owner.id, { email: nhan.email }, () => false),
		).rejects.toThrow();

		expect(
			(await service.issuePasswordLink(member.id, { email: nhan.email }, () => true)).url,
		).toContain("/dat-mat-khau/");
	});
});
```

- [ ] **Step 3: Chạy — phải ĐỎ vì chưa có thủ tục**

Run: `bun run test -- "cd apps/api && bun test test/mat-khau-lien-ket.spec.ts -t quyen-hai-ve"`
Expected: FAIL — `service.issuePasswordLink is not a function`

- [ ] **Step 4: Viết thủ tục trong service**

```ts
	async issuePasswordLink(
		userId: string,
		input: IssuePasswordLinkInput,
		quyen: (role: WorkspaceRole | null) => boolean = canIssuePasswordLink,
	): Promise<{ url: string; expiresAt: string }> {
		const role = await workspaceRoleOf(userId);

		if (!quyen(role)) {
			throw new ForbiddenException(
				"Chỉ chủ và quản trị phát được liên kết đặt mật khẩu.",
			);
		}

		const email = normalizeEmail(input.email);

		if (!email) {
			throw new BadRequestException(
				"Đó không phải địa chỉ email. Nhập dạng ten@congty.com.",
			);
		}

		const duocVao = await decideSignInFromDb(email);

		if (!duocVao.allowed) {
			throw new BadRequestException(
				"Địa chỉ này không nằm trong danh sách được vào.",
			);
		}

		const nguoi = await this.db.user.findFirst({ where: { email } });

		const nhan = nguoi ?? (await this.taoNguoiDaDuocVao(email));

		const chia = await ducChia({ userId: nhan.id, appUrl: env.appUrl });

		const nguoiPhat = await this.db.user.findUniqueOrThrow({
			where: { id: userId },
			select: { name: true },
		});

		await this.db.passwordLinkIssue.create({
			data: {
				id: randomUUID(),
				email,
				issuedById: userId,
				issuedByName: nguoiPhat.name,
			},
		});

		return { url: chia.url, expiresAt: chia.expiresAt.toISOString() };
	}
```

**ĐỪNG tìm `auth.api.createUser`:** nó chỉ có khi bật plugin `admin`, mà vòng này đã loại plugin đó (sổ quyết định `d-20260919T013843Z-3`). Hàm `taoNguoiDaDuocVao` viết ở Step 5.

- [ ] **Step 5: Tạo hàng người dùng — sau khi ĐÃ tự hỏi cổng, không đi vòng qua nó**

Đã đo, đừng đoán lại: khoá `disableSignUp` nằm TRONG THÂN điểm cuối
`/sign-up/email` (`better-auth/dist/api/routes/sign-up.mjs` dòng 144), nên
`auth.api.signUpEmail` gọi từ máy chủ **cũng bị chặn**. Không có đường nào của
thư viện tạo được người khi cửa tự đăng ký đóng, trừ plugin `admin` đã loại.

Nên thủ tục tạo hàng người dùng bằng Prisma — NHƯNG chỉ sau khi đã tự hỏi đúng
cái cổng mà hook của thư viện hỏi. Service ở Step 4 đã gọi `decideSignInFromDb(email)`
và ném lỗi khi không được vào; hàng tạo ra ở đây nằm SAU cái chặn đó. Đây là
việc áp cổng tường minh, không phải đi vòng qua cổng — khác nhau ở chỗ có hay
không có lời gọi `decideSignInFromDb` phía trên.

```ts
	private async taoNguoiDaDuocVao(email: string) {
		return this.db.user.create({
			data: {
				id: randomUUID(),
				email,
				name: email.split("@")[0],
				emailVerified: true,
			},
		});
	}
```

**Cờ `emailVerified: true`, và đây là bản SỬA sau khi soi Task 2.** Bản kế hoạch
đầu viết `false` với lý luận «không ai xác minh thì đừng khai là đã xác minh».
Lý luận đó sai ở chỗ nó bỏ qua nhánh nối tài khoản: người soi đọc mã nối tài
khoản của thư viện và thấy nhánh nối đòi `emailVerified === true`. Tạo user với
`false` thì chính người đó MẤT cửa Google, tức phá AC-9. Và danh sách được vào
do quản trị soạn chính là bước xác minh của sản phẩm này; hai đường tạo user đã
có trong kho đều dùng `true`.

Bài kiểm của task này PHẢI khẳng định hàng vừa tạo có `emailVerified === true` —
không có khẳng định đó thì một lần sửa về `false` sẽ đi qua im lặng.

**Bất biến người thi công phải giữ:** lời gọi `decideSignInFromDb` ở Step 4 và
lời gọi `db.user.create` ở đây phải nằm trong CÙNG một thủ tục, cái trước ném
lỗi thì cái sau không chạy. Tách chúng ra hai chỗ là dựng lại đúng cửa sau mà
chiều âm của E2 tồn tại để bắt.

- [ ] **Step 6: Bài kiểm tạo-người-trước, với chiều âm là ca quan trọng nhất**

```ts
describe("tao-nguoi-truoc", () => {
	test("dia chi trong danh sach chua co tai khoan thi tao truoc roi duc chia", async () => {
		const { service, db } = await dungService();
		const admin = await gieoNguoi("admin");
		const email = `chua-co-${Date.now()}@onehub.center`;
		await gieoHangDuocVao(email, "member");

		expect(await db.user.count({ where: { email } })).toBe(0);

		const ket = await service.issuePasswordLink(admin.id, { email });
		expect(ket.url).toContain("/dat-mat-khau/");
		expect(await db.user.count({ where: { email } })).toBe(1);

		const nguoi = await db.user.findFirstOrThrow({ where: { email } });
		const hang = await db.verification.findFirst({ where: { value: nguoi.id } });
		expect(hang).not.toBeNull();
	});

	test("dia chi NGOAI danh sach thi khong tao duoc nguoi, khong duc duoc chia", async () => {
		const { service, db } = await dungService();
		const admin = await gieoNguoi("admin");
		const email = `ngoai-${Date.now()}@example.com`;

		const truocChia = await db.verification.count();
		await expect(service.issuePasswordLink(admin.id, { email })).rejects.toThrow();

		expect(await db.user.count({ where: { email } })).toBe(0);
		expect(await db.verification.count()).toBe(truocChia);
	});
});
```

- [ ] **Step 7: Bài kiểm ghi vết, đọc qua ĐƯỜNG THẬT**

```ts
describe("ghi-vet", () => {
	test("hai lan phat khac nguoi khong de len nhau, doc qua truy van cua man", async () => {
		const { service, db } = await dungService();
		const a = await gieoNguoi("admin");
		const b = await gieoNguoi("owner");
		const x = await gieoNguoi("member");
		const y = await gieoNguoi("member");

		const batDau = new Date();
		await service.issuePasswordLink(a.id, { email: x.email });
		await service.issuePasswordLink(b.id, { email: y.email });

		const rows = (await service.allowances(a.id)).rows;
		const cuaX = rows.find((r) => r.email === x.email);
		const cuaY = rows.find((r) => r.email === y.email);

		expect(cuaX?.passwordLinkIssuedByName).toBe(a.name);
		expect(cuaY?.passwordLinkIssuedByName).toBe(b.name);
		expect(new Date(cuaX?.passwordLinkIssuedAt ?? 0).getTime()).toBeGreaterThanOrEqual(batDau.getTime());
	});
});
```

- [ ] **Step 8: Nối vết vào `allowances()`**

Trong `workspace.service.ts`, hàm `allowances` đọc thêm lần phát gần nhất cho mỗi địa chỉ:

```ts
		const vet = await this.db.passwordLinkIssue.findMany({
			where: { email: { in: rows.map((r) => r.email) } },
			orderBy: { issuedAt: "desc" },
		});

		const moiNhat = new Map<string, (typeof vet)[number]>();
		for (const v of vet) if (!moiNhat.has(v.email)) moiNhat.set(v.email, v);
```

rồi map vào từng hàng trả về.

- [ ] **Step 9: Mở thủ tục ra tRPC**

Trong `workspace.router.ts`, theo đúng khuôn của `allowEmail` đang có:

```ts
	@Mutation({
		input: issuePasswordLinkInput,
		output: passwordLinkOutput,
		meta: restMeta("POST", "/workspace/password-link", ["Workspace"]),
	})
	async issuePasswordLink(
		@Ctx() ctx: AuthedTrpcContext,
		@Input() input: z.infer<typeof issuePasswordLinkInput>,
	) {
		return this.workspace.issuePasswordLink(ctx.user.id, input);
	}
```

- [ ] **Step 10: Đột biến chứng minh cho quyền hai vế**

Tạm thay `if (!quyen(role))` bằng `if (role === "member")`, chạy:
`bun run test -- "cd apps/api && bun test test/mat-khau-lien-ket.spec.ts -t quyen-hai-ve"`
Expected: FAIL ở hai dòng tiêm — `() => false` không còn chặn được owner.
Rồi trả lại.

- [ ] **Step 11: Đột biến chứng minh cho ghi vết**

Tạm bỏ khối `passwordLinkIssue.create`, chạy ca `ghi-vet`.
Expected: FAIL ở `expect(cuaX?.passwordLinkIssuedByName).toBe(a.name)`.

- [ ] **Step 12: Chạy trọn bộ và commit**

```bash
bun run test && bun run check-types && bun run lint && bun run lint:slop && bun run build
git add apps/api/src/workspace apps/api/test/mat-khau-lien-ket.spec.ts
git commit -m "feat(api): thu tuc phat chia dat mat khau, quyen co ten, ghi vet"
```

---

### Task 5: Trang đặt mật khẩu, nằm ngoài cổng

`independent: true` với Task 6 và 7.

**Phục vụ:** E10 (đường ngoài cổng) · E17 (hai khung hình mật khẩu yếu)

**Files:**
- Modify: `apps/app/proxy.ts` (hằng `UNGATED` dòng 21)
- Create: `apps/app/app/(landing)/dat-mat-khau/[token]/page.tsx`
- Create: `apps/app/app/(landing)/dat-mat-khau/[token]/dat-mat-khau-form.tsx`
- Modify: `apps/app/lib/messages/auth.ts`
- Create: `apps/app/test/proxy-duong-mo.spec.ts`

**Interfaces:**
- Consumes: điểm cuối `resetPassword` của `@crm/auth/client`
- Produces: đường `/dat-mat-khau/<token>`

- [ ] **Step 1: Viết bài kiểm đường ngoài cổng — GHIM tập bốn phần tử**

Tạo `apps/app/test/proxy-duong-mo.spec.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { UNGATED } from "../proxy";

const PHAI_CO = ["/grant-access", "/eve", "/het-quyen", "/dat-mat-khau"] as const;

describe("duong-mo", () => {
	test("tap duong ngoai cong bang DUNG bon phan tu da ghim", () => {
		const thuc = new Set(UNGATED);
		const ghim = new Set<string>(PHAI_CO);

		const thua = [...thuc].filter((p) => !ghim.has(p));
		const thieu = [...ghim].filter((p) => !thuc.has(p));

		expect({ thua, thieu }).toEqual({ thua: [], thieu: [] });
		expect(thuc.size).toBe(PHAI_CO.length);
	});
});
```

`proxy.ts` phải xuất `UNGATED` để bài kiểm đọc được chính hằng nó dùng, không chép tay.

- [ ] **Step 2: Chạy — ĐỎ vì `/dat-mat-khau` chưa có và `UNGATED` chưa xuất**

Run: `cd apps/app && bun test test/proxy-duong-mo.spec.ts`
Expected: FAIL

- [ ] **Step 3: Thêm đường và xuất hằng**

Trong `apps/app/proxy.ts`:

```ts
const SET_PASSWORD_PATH = "/dat-mat-khau";

export const UNGATED = [
	"/grant-access",
	"/eve",
	NO_WORKSPACE_PATH,
	SET_PASSWORD_PATH,
];
```

- [ ] **Step 4: Chạy lại — XANH**

Run: `cd apps/app && bun test test/proxy-duong-mo.spec.ts`
Expected: PASS

- [ ] **Step 5: HAI chiều đỏ, chạy cả hai**

(a) Bỏ `SET_PASSWORD_PATH` khỏi mảng → phải ĐỎ và in `thieu: ["/dat-mat-khau"]`.
(b) Thêm `"/mot-duong-gia"` vào mảng → phải ĐỎ và in `thua: ["/mot-duong-gia"]`.
Trả lại nguyên trạng sau mỗi lượt.

- [ ] **Step 6: Thêm chuỗi tiếng Việt cho trang**

Trong `apps/app/lib/messages/auth.ts`, thêm khối `datMatKhau` vào CẢ `en` và bản tiếng Việt, theo đúng khuôn hai ngôn ngữ đang có:

```ts
	datMatKhau: {
		title: "Đặt mật khẩu",
		description: (phut: number) =>
			`Liên kết này dùng được một lần, còn hạn ${phut} phút.`,
		matKhauMoi: "Mật khẩu mới",
		goLai: "Gõ lại mật khẩu",
		toiThieu: (n: number) =>
			`Ít nhất ${n} ký tự. Không cần chữ hoa hay ký tự đặc biệt.`,
		gui: "Đặt mật khẩu",
		xong: {
			title: "Xong",
			description:
				"Mật khẩu đã đặt. Từ giờ bạn vào CRM được bằng địa chỉ email và mật khẩu này, kể cả khi mạng không vào được Google.",
		},
		loi: {
			hetHan: "Liên kết này hết hạn rồi. Nhắn người quản trị phát cho bạn một liên kết mới.",
			daDung: "Liên kết này đã dùng rồi. Nhắn người quản trị phát cho bạn một liên kết mới.",
			khongCo: "Liên kết này không đúng. Nhắn người quản trị phát cho bạn một liên kết mới.",
			lechNhau: "Hai ô mật khẩu chưa giống nhau.",
		},
	},
```

Ba câu lỗi PHẢI khác nhau về chữ — E14 (hội đồng người) và E17 (khung hình) đều chấm đúng điều đó.

- [ ] **Step 7: Viết trang server và form client**

`page.tsx` là server component, chỉ lấy chuỗi và truyền xuống — không `await` bí mật nào, không nhập `@crm/auth` hay `@crm/db`:

```tsx
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { getLocale } from "@/lib/locale/server";
import { authMessages } from "@/lib/messages/auth";
import { DatMatKhauForm } from "./dat-mat-khau-form";

export async function generateMetadata(): Promise<Metadata> {
	return { title: authMessages(await getLocale()).datMatKhau.title };
}

export default async function DatMatKhauPage({ params }: PageProps<"/dat-mat-khau/[token]">) {
	const { token } = await params;
	const m = authMessages(await getLocale()).datMatKhau;

	return (
		<AuthShell>
			<DatMatKhauForm chu={m} token={token} />
		</AuthShell>
	);
}
```

Form client gọi `resetPassword` của `@crm/auth/client`, giữ nguyên chữ ở ô xác nhận khi báo lỗi (E17 chấm đúng điều đó), và đặt câu lỗi CẠNH ô gây lỗi bằng `FieldError`.

- [ ] **Step 8: Kiểm bằng mắt trên máy tại chỗ**

Chạy `PROTO_ROUTE=1 bun run dev` ở `apps/app`, đúc một chìa bằng `bun run dev:session` + thủ tục phát chìa, mở liên kết, thử ba ca lỗi.
Expected: ba câu lỗi khác nhau, câu nằm cạnh ô, chữ ở ô xác nhận còn nguyên.

- [ ] **Step 9: Commit**

```bash
git add apps/app/proxy.ts apps/app/app/\(landing\)/dat-mat-khau apps/app/lib/messages/auth.ts apps/app/test/proxy-duong-mo.spec.ts
git commit -m "feat(app): trang dat mat khau ngoai cong, ba cau loi phan biet duoc"
```

---

### Task 6: Ô email và mật khẩu trên màn đăng nhập

`independent: true` với Task 5 và 7.

**Phục vụ:** E13 (khung hình màn đăng nhập) · E15 (sàn thiết kế)

**Files:**
- Create: `apps/app/app/(landing)/sign-in/password-sign-in.tsx`
- Modify: `apps/app/app/(landing)/sign-in/page.tsx`
- Modify: `apps/app/lib/messages/auth.ts`

- [ ] **Step 1: Thêm chuỗi**

Trong khối `signIn` của `apps/app/lib/messages/auth.ts`, cả hai ngôn ngữ:

```ts
		hoac: "hoặc",
		diaChi: "Địa chỉ email",
		matKhau: "Mật khẩu",
		dangNhap: "Đăng nhập",
		saiChung: "Địa chỉ hoặc mật khẩu không đúng.",
```

`saiChung` là MỘT câu chung, cố ý không nói sai ô nào — chống dò danh sách người dùng.

- [ ] **Step 2: Viết component client**

`password-sign-in.tsx` — `"use client"`, nhận chuỗi qua props, gọi `signIn.email` của `@crm/auth/client`, báo lỗi bằng `saiChung`.

- [ ] **Step 3: Ghép vào màn đăng nhập**

Trong `page.tsx`, dưới khối `social.map(...)` đang có, thêm dải phân cách và `<PasswordSignIn …/>`. Ô mật khẩu hiện **cùng màn** với nút Google, KHÔNG nằm sau một nút «cách khác» — người trong mạng chặn Google phải thấy cửa thứ hai ngay.

- [ ] **Step 4: Kiểm bằng mắt hai khổ**

Mở `/sign-in` ở 375 và 1280.
Expected: nút Google và hai ô cùng trên màn, không tràn.

- [ ] **Step 5: Sàn thiết kế**

Run: `bun run test -- "cd apps/app && bun test"` rồi chạy executor sàn thiết kế trên ba tệp mới:
`node "$(node scripts/resolve-plugin.mjs --plugin acceptance-gate --require scripts/design-gate.mjs)"/scripts/design-gate.mjs --target "apps/app/app/(landing)/sign-in/password-sign-in.tsx" --mode static`
Expected: exit 0

- [ ] **Step 6: Commit**

```bash
git add apps/app/app/\(landing\)/sign-in apps/app/lib/messages/auth.ts
git commit -m "feat(app): o email va mat khau cung man voi nut Google"
```

---

### Task 7: Nút phát liên kết và hộp thoại trên màn Thành viên

`independent: false` — cần thủ tục của Task 4.

**Phục vụ:** E12 (nút tắt + khung hình ghi vết) · E15 (sàn thiết kế)

**Files:**
- Create: `apps/app/app/(app)/[slug]/settings/members/phat-chia-dialog.tsx`
- Modify: `apps/app/app/(app)/[slug]/settings/members/allowances-table.tsx`
- Modify: `apps/app/app/(app)/[slug]/settings/members/page.tsx`
- Modify: `apps/app/lib/messages/settings-thanh-vien.ts`

- [ ] **Step 1: Thêm chuỗi**

```ts
	phatChia: {
		nut: "Phát liên kết",
		dangPhat: "Đang phát",
		canQuyen: "Cần quyền quản trị mới phát được",
		tieuDe: "Liên kết đặt mật khẩu",
		moTa: (ten: string) =>
			`Gửi cho ${ten}. Liên kết dùng được một lần, hết hạn sau một giờ.`,
		nhanLienKet: "Liên kết",
		giaiThich:
			"Người nhận mở liên kết rồi tự đặt mật khẩu. Bạn không thấy mật khẩu của họ.",
		chep: "Chép liên kết",
		daChep: (ten: string) => `Đã chép. Dán vào Zalo gửi cho ${ten}.`,
		dong: "Đóng",
		loi: "Chưa phát được liên kết. Thử lại sau ít phút.",
		vet: (ten: string, luc: string) => `${ten} đã phát liên kết · ${luc}`,
	},
```

- [ ] **Step 2: Viết hộp thoại client**

`phat-chia-dialog.tsx` — `"use client"`, dùng `Dialog` của `@crm/ui/components/dialog`, gọi mutation `workspace.issuePasswordLink`, hiện liên kết trong `Input` chỉ-đọc, nút chép dùng lại nếp của `copy-value.tsx` đang có, và có trạng thái «đã chép».

- [ ] **Step 3: Nối nút vào bảng, tắt bằng ĐÚNG vị từ**

Trang server tính quyền rồi truyền xuống cờ phẳng — client KHÔNG nhập `@crm/auth`:

```tsx
const coQuyenPhatChia = canIssuePasswordLink(role);
```

rồi `<AllowancesTable … coQuyenPhatChia={coQuyenPhatChia} />`. Nút `disabled={!coQuyenPhatChia}` kèm `title` là câu `canQuyen`. Nút **có mặt nhưng tắt**, không ẩn — E12 chấm đúng điều đó.

- [ ] **Step 4: Hiện vết trên hàng**

Hàng nào có `passwordLinkIssuedByName` thì hiện dòng phụ `vet(ten, luc)` dưới tên.

- [ ] **Step 5: Kiểm bằng mắt hai vai**

Tạo phiên cho vai `member` rồi vai `admin` bằng `cd apps/api && bun run dev:session <email>`, mở `/<slug>/settings/members`.
Expected: bản `member` có nút nhưng tắt và có lý do; bản `admin` bấm được; sau khi phát, hàng người nhận hiện tên người phát và mốc thời gian.

- [ ] **Step 6: Chạy trọn năm cổng**

```bash
bun run test && bun run check-types && bun run lint && bun run lint:slop && bun run build
```
Expected: cả năm xanh

- [ ] **Step 7: Commit và đặt hợp đồng sang `implemented`**

```bash
git add apps/app/app/\(app\)/\[slug\]/settings/members apps/app/lib/messages/settings-thanh-vien.ts
git commit -m "feat(app): nut phat lien ket va hop thoai tren man Thanh vien"
```

Rồi sửa `_acceptance/vao-bang-email-va-mat-khau/contract.md` frontmatter sang `status: implemented` — đây là việc CUỐI của người thi công, và nó mở đường cho S4.

---

## Rủi ro đã biết, ghi ra để người thi công không tự phát minh lại

1. **Tạo hàng người dùng đi bằng Prisma, và đó là quyết định có chủ ý.** Đã đo: `disableSignUp` chặn cả lời gọi máy chủ nội bộ, nên không đường nào của thư viện tạo được người khi cửa tự đăng ký đóng. Cái giữ cho nó không thành cửa sau là lời gọi `decideSignInFromDb` đứng ngay trên, trong cùng thủ tục. Chiều âm của E2 canh đúng chỗ đó: bỏ lời gọi ấy thì địa chỉ ngoài danh sách tạo được người và phép đo phải đỏ. Ai thi công mà tách hai lời gọi ra hai chỗ là dựng lại đúng cái lỗ này.
2. **Tiền tố `reset-password:`** là chi tiết bên trong thư viện. Chiều đỏ ở Task 2 Step 6 là chỗ canh duy nhất; nếu nó không đỏ thì đừng đi tiếp.
3. **Bộ sàng mật khẩu đã lộ gọi ra mạng.** Ca không-với-tới-mạng phải báo BỎ QUA CÓ TÊN, không được lặng lẽ tính là đạt.
4. **Màn đăng nhập không tối được ở tông sáng** — lỗi có sẵn của kho, đã khai ở `design-pass.md` Nhóm 2 và hình `figures/token-dark.png`. KHÔNG sửa trong vòng này.
