# Gỡ một thành viên thì phải giữ được — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ba chỗ chưa ai canh sau lượt gỡ một thành viên đều có phép đo, và cánh cửa duy nhất còn hở — đường kết nạp mồi — được khoá.

**Architecture:** Hai trong ba tiêu chí chỉ cần PHÉP ĐO, vì mã sản phẩm đã đúng: thủ tục quản trị đã đi qua `isWorkspaceAdmin`, và phiên đã bị xoá trong cùng giao dịch với lượt gỡ. Tiêu chí thứ ba cần một bản sửa nhỏ: nhánh kết nạp mồi của `ensureWorkspaceMembership` kết nạp MỌI người dùng khi bảng thành viên rỗng, không hỏi bảng lời mời; nó phải loại người mang lời mời ở trạng thái kết thúc.

**Tech Stack:** TypeScript, bun test, Prisma, better-auth 1.6.25, NestJS (apps/api), Zod.

**Spec:** `docs/superpowers/specs/2026-09-18-go-thanh-vien-phai-giu-duoc-design.md`

## Global Constraints

- **Không viết chú thích trong code.** Không thêm vào mã mới, không thêm vào mã sửa.
- **Phân tích tại biên bằng Zod**, không truyền `Record<string, unknown>`, không ép kiểu bằng `as` ở chỗ đọc dữ liệu ngoài.
- oxlint anti-slop: cấm `no-runtime-typeof` và `no-known-value-widening`.
- **KHÔNG chạy `bun run format` toàn kho.** Chỉ `bunx biome check --write <đường dẫn tương đối>` chạy TỪ TRONG gói.
- `bun test` trần trong một gói dùng cơ sở dữ liệu DÙNG CHUNG. Mọi lượt đo phải đi qua `bun run test -- "cd <gói> && bun test …"` để có cơ sở dữ liệu riêng cho lượt.
- Bản vá `dev:session` (`ensureWorkspaceMembership(user.id, email)`) đã cherry-pick sẵn vào nhánh này. Không sửa lại nó.

**Luật đo của hồ sơ — áp cho CẢ BA eval, rút từ bốn lượt sửa cùng một lớp lỗi ở vòng trước:**

1. Mỗi eval gọi **hàm hoặc lộ trình mà tiêu chí hứa** — không đo hàm trợ giúp, không đo mã chết.
2. **Cữ liệu đến từ nơi giá trị thật sinh ra** hoặc đi qua lộ trình thật. Không gõ tay chuỗi trạng thái.
3. **Chiều đỏ phải chạy được bằng CHÍNH dòng lệnh mà eval khai** — không bằng một lệnh gần giống nó.

## File Structure

| File | Trách nhiệm |
| --- | --- |
| `apps/api/test/go-thanh-vien.spec.ts` | **Tạo.** Ba khối đo: `bi-go-thi-bi-tu-choi`, `phien-mat-quyen`, `duong-moi-khong-cap-lai`. Một trách nhiệm: đo điều còn lại sau lượt gỡ. |
| `packages/auth/src/organization.ts` | **Sửa.** Nhánh kết nạp mồi loại người có lời mời ở trạng thái kết thúc. |
| `_acceptance/go-thanh-vien-phai-giu-duoc/contract.md` | **Sửa ở task cuối.** `status: approved` → `implemented`. |

Ba executor đã khai sẵn trong `_acceptance/config.yaml` — **kiểm lại, đừng khai trùng**:
`gt_bi_go_thi_bi_tu_choi`, `gt_phien_mat_quyen`, `gt_duong_moi_khong_cap_lai`.

---

### Task 1: Khung bài đo và ma trận sáu thủ tục quản trị

**Files:**
- Create: `apps/api/test/go-thanh-vien.spec.ts`

**Phục vụ eval:** E1 · **independent: false** (hai task sau dùng lại khung dựng cữ liệu của task này)

**Interfaces — Produces:**
```ts
const workspace: WorkspaceService;
const id: (phan: string) => string;
async function dungKho(): Promise<void>;
async function dungNguoi(phan: string, vai: string): Promise<string>;
async function don(): Promise<void>;
```

- [ ] **Step 1: Đọc khuôn dựng cữ liệu của bài đo anh em**

Run: `sed -n '1,84p' apps/api/test/workspace-thanh-vien.spec.ts`

Dùng ĐÚNG cách file đó dựng `WorkspaceService`, dựng người, và dọn sau mỗi lượt. Không tự phát minh cách khác — `don()` của nó xoá theo tiền tố `suffix`, và `suffix` lấy từ `process.env.TEST_RUN_ID` nên hai lượt chạy song song không giẫm nhau.

- [ ] **Step 2: Viết bài đo trước — ma trận sáu thủ tục**

Tạo `apps/api/test/go-thanh-vien.spec.ts`:

```ts
import { beforeEach, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { WorkspaceService } from "../src/workspace/workspace.service";

const suffix = process.env.TEST_RUN_ID ?? "go-thanh-vien";

const agent = {
	workspaceChanged: async () => undefined,
} as unknown as AgentTriggerService;

const workspace = new WorkspaceService(db, agent);

const id = (phan: string) => `${suffix}-${phan}`;

async function dungKho() {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: {
			id: WORKSPACE_ID,
			name: "CRM",
			slug: "crm",
			createdAt: new Date(),
		},
		update: {},
	});
}

async function dungNguoi(phan: string, vai: string) {
	const now = new Date();
	const userId = id(phan);

	await db.user.upsert({
		where: { id: userId },
		create: {
			id: userId,
			name: phan,
			email: `${userId}@onemount.com`,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		},
		update: {},
	});

	await db.member.upsert({
		where: {
			organizationId_userId: { organizationId: WORKSPACE_ID, userId },
		},
		create: {
			id: id(`member-${phan}`),
			organizationId: WORKSPACE_ID,
			userId,
			role: vai,
			createdAt: now,
		},
		update: { role: vai },
	});

	return userId;
}

async function don() {
	await db.invitation.deleteMany({
		where: {
			OR: [
				{ id: { startsWith: `${suffix}-` } },
				{ email: { contains: `${suffix}` } },
			],
		},
	});
	await db.session.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.member.deleteMany({
		where: { userId: { startsWith: `${suffix}-` } },
	});
	await db.user.deleteMany({ where: { id: { startsWith: `${suffix}-` } } });
}

async function nem(chay: () => Promise<unknown>) {
	try {
		await chay();
		return null;
	} catch (loi) {
		return loi instanceof Error ? loi.constructor.name : "khong-phai-Error";
	}
}

describe("bi-go-thi-bi-tu-choi", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("sau thu tuc quan tri, sau hang viet truoc, muoi hai khang dinh", async () => {
		const bi = await dungNguoi("bi-go", "admin");
		const chu = await dungNguoi("chu", "owner");

		const loi = await workspace.allowEmail(chu, {
			email: `${id("khach")}@onemount.com`,
			role: "member",
		});

		const khach = await dungNguoi("khach", "member");
		const khachMember = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: khach },
			},
			select: { id: true },
		});

		const BANG: readonly [string, () => Promise<unknown>][] = [
			["update", () => workspace.update(bi, { name: "CRM", website: "x.com" })],
			[
				"setMemberRole",
				() =>
					workspace.setMemberRole(bi, {
						memberId: khachMember?.id ?? "",
						role: "member",
					}),
			],
			["allowances", () => workspace.allowances(bi)],
			[
				"allowEmail",
				() =>
					workspace.allowEmail(bi, {
						email: `${id("moi")}@onemount.com`,
						role: "member",
					}),
			],
			["revokeAllowance", () => workspace.revokeAllowance(bi, { allowanceId: loi.id })],
			[
				"removeMember",
				() =>
					workspace.removeMember(bi, { memberId: khachMember?.id ?? "" }),
			],
		];

		expect(BANG.length).toBe(6);

		for (const [ten, chay] of BANG) {
			const truoc = await nem(chay);
			expect(
				truoc,
				`thu tuc "${ten}": nguoi CON la quan tri goi thi KHONG duoc nem, nhan ${truoc}`,
			).toBe(null);
		}

		const biMember = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: bi },
			},
			select: { id: true },
		});

		await workspace.removeMember(chu, { memberId: biMember?.id ?? "" });

		for (const [ten, chay] of BANG) {
			const sau = await nem(chay);
			expect(
				sau,
				`thu tuc "${ten}": nguoi DA BI GO goi thi phai nem ForbiddenException, nhan ${sau}`,
			).toBe("ForbiddenException");
		}
	});
});
```

Vòng thứ nhất là **đối chứng dương**: thiếu nó thì một bản sửa từ chối tất cả mọi người vẫn xanh.

- [ ] **Step 3: Chạy để thấy nó xanh hay đỏ, và hiểu vì sao**

Run: `bun run test -- "cd apps/api && bun test test/go-thanh-vien.spec.ts -t bi-go-thi-bi-tu-choi"`

Expected: PASS. Mã sản phẩm đã đúng ở tiêu chí này — bài đo là thứ đang thiếu, không phải bản sửa.

Đỏ ở vòng ĐẦU (người còn là quản trị mà thủ tục vẫn ném) nghĩa là cữ liệu dựng sai, không phải sản phẩm sai: đọc thông điệp ghim tên thủ tục rồi sửa cữ liệu. Ví dụ `removeMember` ở vòng đầu gỡ mất `khach`, nên `setMemberRole` ở vòng SAU sẽ không tìm thấy dòng ấy — nếu gặp, đổi thứ tự để `removeMember` đứng cuối bảng, đúng như bảng trên đã xếp.

- [ ] **Step 4: Chiều đỏ — bỏ lưới quyền khỏi MỘT thủ tục**

Trong `apps/api/src/workspace/workspace.service.ts`, ở `allowances` (dòng 253), sửa tạm `if (!isWorkspaceAdmin(role))` thành `if (false)`.

Run: `bun run test -- "cd apps/api && bun test test/go-thanh-vien.spec.ts -t bi-go-thi-bi-tu-choi"`
Expected: FAIL với `thu tuc "allowances": nguoi DA BI GO goi thi phai nem ForbiddenException, nhan null`. Hoàn nguyên.

- [ ] **Step 5: Định dạng và commit**

```bash
cd apps/api && bunx biome check --write test/go-thanh-vien.spec.ts && cd ../..
git add apps/api/test/go-thanh-vien.spec.ts
git commit -m "test(api): ma tran sau thu tuc quan tri tu choi nguoi da bi go"
```

---

### Task 2: Phiên đang mở mất quyền, đo ở đúng cửa ứng dụng hỏi

**Files:**
- Modify: `apps/api/test/go-thanh-vien.spec.ts` (thêm khối `phien-mat-quyen`)

**Phục vụ eval:** E2 · **independent: false** (dùng khung của Task 1)

**Interfaces — Consumes:** `dungNguoi`, `don`, `dungKho`, `id` từ Task 1.

Đây là ô mà phiên phản biện chấm P0. Phép đo **không** được đếm số dòng bảng `session`: xoá một dòng và mất quyền là hai mệnh đề khác nhau, và mọi lớp đệm nằm giữa đều làm chúng tách ra.

- [ ] **Step 1: Viết bài đo trước**

Thêm vào `apps/api/test/go-thanh-vien.spec.ts`:

```ts
import { AUTH_COOKIE_PREFIX, auth } from "@crm/auth";

const COOKIE_NAME = `${AUTH_COOKIE_PREFIX}.session_token`;

async function kyCookie(value: string) {
	const secret = process.env.BETTER_AUTH_SECRET;

	if (!secret) throw new Error("BETTER_AUTH_SECRET chua dat");

	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(value),
	);
	const base64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

	return encodeURIComponent(`${value}.${base64}`);
}

async function mintPhien(userId: string) {
	const token = `dev-session-${userId}`;

	await db.session.upsert({
		where: { token },
		create: {
			id: token,
			token,
			userId,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			updatedAt: new Date(),
			activeOrganizationId: WORKSPACE_ID,
		},
		update: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
	});

	return new Headers({ cookie: `${COOKIE_NAME}=${await kyCookie(token)}` });
}

describe("phien-mat-quyen", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("phien dang mo mat quyen ngay khi luot go tra ve, 0 giay", async () => {
		const bi = await dungNguoi("phien-bi", "member");
		const chu = await dungNguoi("phien-chu", "owner");

		const cuaBi = await mintPhien(bi);
		const cuaChu = await mintPhien(chu);

		const truoc = await auth.api.getSession({ headers: cuaBi });

		expect(
			truoc?.user?.id,
			`TRUOC luot go, cua that phai nhan phien cua ${bi}, nhan ${truoc?.user?.id}`,
		).toBe(bi);

		const biMember = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: bi },
			},
			select: { id: true },
		});

		await workspace.removeMember(chu, { memberId: biMember?.id ?? "" });

		const sau = await auth.api.getSession({ headers: cuaBi });

		expect(
			sau?.user?.id ?? null,
			`NGAY SAU luot go, cua that KHONG duoc nhan phien nao cho ${bi}, nhan ${sau?.user?.id}`,
		).toBe(null);

		const nguoiKhac = await auth.api.getSession({ headers: cuaChu });

		expect(
			nguoiKhac?.user?.id,
			`phien cua nguoi KHAC khong duoc bi dung cham, mong ${chu}, nhan ${nguoiKhac?.user?.id}`,
		).toBe(chu);
	});
});
```

Khẳng định thứ ba là đối chứng dương thứ hai: nó phân biệt «xoá đúng phiên của người bị gỡ» với «xoá sạch bảng phiên».

- [ ] **Step 2: Chạy**

Run: `bun run test -- "cd apps/api && bun test test/go-thanh-vien.spec.ts -t phien-mat-quyen"`
Expected: PASS.

Đỏ ở khẳng định ĐẦU (cửa thật không nhận phiên vừa mint) nghĩa là cách mint chưa khớp cách better-auth đọc cookie — KHÔNG nới lỏng khẳng định. Đối chiếu lại `apps/api/scripts/dev-session.ts` dòng 22–44 và `packages/auth/src/cookies.ts`; hai chỗ đó là nguồn duy nhất của khuôn token và tên cookie.

- [ ] **Step 3: Chiều đỏ — gỡ việc xoá phiên khỏi giao dịch**

Trong `apps/api/src/workspace/workspace.service.ts` dòng 398, sửa tạm
`await tx.session.deleteMany({ where: { userId: target.userId } });`
thành `void target.userId;`

Run: `bun run test -- "cd apps/api && bun test test/go-thanh-vien.spec.ts -t phien-mat-quyen"`
Expected: FAIL với `NGAY SAU luot go, cua that KHONG duoc nhan phien nao cho …, nhan <userId>`. Hoàn nguyên.

- [ ] **Step 4: Định dạng và commit**

```bash
cd apps/api && bunx biome check --write test/go-thanh-vien.spec.ts && cd ../..
git add apps/api/test/go-thanh-vien.spec.ts
git commit -m "test(api): phien dang mo mat quyen ngay khi luot go tra ve"
```

---

### Task 3: Đường kết nạp mồi thôi cấp lại quyền

**Files:**
- Modify: `packages/auth/src/organization.ts:62-82`
- Modify: `apps/api/test/go-thanh-vien.spec.ts` (thêm khối `duong-moi-khong-cap-lai`)

**Phục vụ eval:** E3 · **independent: false** (dùng khung của Task 1)

**Interfaces — Consumes:** `CON_HIEU_LUC`, `TRANG_THAI_LOI_MOI`, `conHieuLuc` từ `@crm/validation/invitation-status`.

- [ ] **Step 1: Viết bài đo trước**

Thêm vào `apps/api/test/go-thanh-vien.spec.ts`:

```ts
import {
	conHieuLuc,
	TRANG_THAI_LOI_MOI,
	type TrangThaiLoiMoi,
} from "@crm/validation/invitation-status";
import { ensureWorkspaceMembership } from "@crm/auth";

const KET_THUC = TRANG_THAI_LOI_MOI.filter(
	(t): t is TrangThaiLoiMoi => !conHieuLuc(t),
);

async function gieoLoiMoi(email: string, status: string, inviterId: string) {
	await db.invitation.create({
		data: {
			id: id(`inv-${status}`),
			organizationId: WORKSPACE_ID,
			email,
			role: "admin",
			status,
			expiresAt: new Date("9999-12-31T00:00:00.000Z"),
			inviterId,
		},
	});
}

describe("duong-moi-khong-cap-lai", () => {
	beforeEach(async () => {
		await don();
		await dungKho();
	});

	it("bang thanh vien rong: nguoi co loi moi ket thuc KHONG duoc ket nap", async () => {
		expect(KET_THUC.length).toBeGreaterThan(0);

		const chu = await dungNguoi("moi-chu", "owner");
		const bi = await dungNguoi("moi-bi", "admin");

		const biMember = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: bi },
			},
			select: { id: true },
		});

		await workspace.allowEmail(chu, {
			email: `${bi}@onemount.com`,
			role: "admin",
		});
		await workspace.removeMember(chu, { memberId: biMember?.id ?? "" });

		const daGhi = await db.invitation.findFirst({
			where: { organizationId: WORKSPACE_ID, email: `${bi}@onemount.com` },
			select: { status: true },
		});

		expect(
			daGhi?.status,
			"luot go that phai ghi mot trang thai KET THUC vao cot status",
		).toBeDefined();
		expect(
			conHieuLuc(daGhi?.status as TrangThaiLoiMoi),
			`trang thai luot go ghi ra la "${daGhi?.status}" — no phai la trang thai KET THUC`,
		).toBe(false);

		const chuaTungMoi = await dungNguoi("moi-la", "member");

		await db.member.deleteMany({ where: { organizationId: WORKSPACE_ID } });

		await ensureWorkspaceMembership(bi, `${bi}@onemount.com`);

		const laiBi = await db.member.findUnique({
			where: {
				organizationId_userId: { organizationId: WORKSPACE_ID, userId: bi },
			},
			select: { role: true },
		});

		expect(
			laiBi?.role ?? null,
			`nguoi mang loi moi "${daGhi?.status}" KHONG duoc duong moi ket nap, nhan vai ${laiBi?.role}`,
		).toBe(null);

		await db.member.deleteMany({ where: { organizationId: WORKSPACE_ID } });

		await ensureWorkspaceMembership(chuaTungMoi, `${chuaTungMoi}@onemount.com`);

		const laiLa = await db.member.findUnique({
			where: {
				organizationId_userId: {
					organizationId: WORKSPACE_ID,
					userId: chuaTungMoi,
				},
			},
			select: { role: true },
		});

		expect(
			laiLa?.role ?? null,
			"nguoi CHUA TUNG co loi moi van phai duoc duong moi ket nap nhu cu",
		).not.toBe(null);
	});

	it("moi trang thai ket thuc deu bi loai, so khang dinh bang so trang thai", async () => {
		const chu = await dungNguoi("mt-chu", "owner");

		for (const tt of KET_THUC) {
			await don();
			await dungKho();
			const nguoi = await dungNguoi(`mt-${tt}`, "member");
			await gieoLoiMoi(`${nguoi}@onemount.com`, tt, chu);
			await db.member.deleteMany({ where: { organizationId: WORKSPACE_ID } });

			await ensureWorkspaceMembership(nguoi, `${nguoi}@onemount.com`);

			const lai = await db.member.findUnique({
				where: {
					organizationId_userId: {
						organizationId: WORKSPACE_ID,
						userId: nguoi,
					},
				},
				select: { role: true },
			});

			expect(
				lai?.role ?? null,
				`trang thai ket thuc "${tt}": duong moi KHONG duoc ket nap, nhan vai ${lai?.role}`,
			).toBe(null);
		}
	});
});
```

Ô `canceled` lấy cữ liệu bằng cách cho người đó đi qua `removeMember` THẬT rồi **đọc lại** giá trị đã ghi — không gõ tay. Bước tay duy nhất không tránh được là xoá các dòng thành viên còn lại để dựng cảnh bảng rỗng; bài khai rõ bằng một lời gọi `deleteMany` đứng riêng.

- [ ] **Step 2: Chạy để thấy nó đỏ**

Run: `bun run test -- "cd apps/api && bun test test/go-thanh-vien.spec.ts -t duong-moi-khong-cap-lai"`
Expected: FAIL với `nguoi mang loi moi "canceled" KHONG duoc duong moi ket nap, nhan vai owner` — đường mồi hiện tại trao vai owner cho người cũ nhất.

- [ ] **Step 3: Sửa nhánh kết nạp mồi**

Trong `packages/auth/src/organization.ts`, thay khối dòng 62–82:

```ts
			const enrolled = await tx.member.count({
				where: { organizationId: workspace.id },
			});

			if (enrolled === 0) {
				const existing = await tx.user.findMany({
					select: { id: true, email: true },
					orderBy: [{ createdAt: "asc" }, { id: "asc" }],
				});

				const loiMoi = await tx.invitation.findMany({
					where: { organizationId: workspace.id },
					select: { email: true, status: true },
				});

				const ketThuc = new Set(
					loiMoi
						.filter((dong) => !conHieuLuc(docTrangThai(dong.status).trangThai))
						.map((dong) => normalizeEmail(dong.email))
						.filter((dia): dia is string => dia !== null),
				);

				const duocMoi = existing.filter((user) => {
					const dia = normalizeEmail(user.email);
					return dia === null || !ketThuc.has(dia);
				});

				await tx.member.createMany({
					data: duocMoi.map((user, index) => ({
						id: crypto.randomUUID(),
						organizationId: workspace.id,
						userId: user.id,
						role: index === 0 ? "owner" : "member",
						createdAt: new Date(),
					})),
					skipDuplicates: true,
				});
			}
```

`normalizeEmail` đã có sẵn trong khối import của file. `conHieuLuc` và `docTrangThai`
thì CHƯA — thêm chúng vào đầu file, ĐỨNG TRƯỚC khối `./allow-list` để giữ thứ tự
biome muốn:

```ts
import {
	conHieuLuc,
	docTrangThai,
} from "@crm/validation/invitation-status";
```

`packages/auth/package.json` đã khai `@crm/validation` là phụ thuộc, nên không
phải thêm gì vào đó.

- [ ] **Step 4: Chạy lại, phải xanh**

Run: `bun run test -- "cd apps/api && bun test test/go-thanh-vien.spec.ts -t duong-moi-khong-cap-lai"`
Expected: PASS cả hai bài.

- [ ] **Step 5: Chiều đỏ — trả nhánh mồi về bản cũ**

Sửa tạm `const duocMoi = existing.filter(...)` thành `const duocMoi = existing;`, chạy lại.
Expected: FAIL với `nguoi mang loi moi "canceled" KHONG duoc duong moi ket nap, nhan vai owner`. Hoàn nguyên.

- [ ] **Step 6: Bài cũ của gói auth phải còn xanh**

Run: `bun run test -- "cd packages/auth && bun test"`
Expected: PASS. Nhánh mồi là đường khởi tạo của nhiều bài tích hợp — đỏ ở đây nghĩa là bản sửa chạm một cảnh khác, đọc tên bài rồi xem cữ liệu của nó có lời mời kết thúc nào không.

- [ ] **Step 7: Định dạng và commit**

```bash
cd packages/auth && bunx biome check --write src/organization.ts && cd ../..
cd apps/api && bunx biome check --write test/go-thanh-vien.spec.ts && cd ../..
git add packages/auth/src/organization.ts apps/api/test/go-thanh-vien.spec.ts
git commit -m "fix(auth): duong ket nap moi thoi cap lai quyen cho nguoi co loi moi ket thuc"
```

---

### Task 4: Năm lệnh chứng và chốt hồ sơ

**Files:**
- Modify: `_acceptance/go-thanh-vien-phai-giu-duoc/contract.md` (frontmatter)

**Phục vụ eval:** toàn bộ suite của làn · **independent: false**

- [ ] **Step 1: Chạy ba eval đúng như làn sẽ chạy**

```bash
bun run test -- "cd apps/api && bun test test/go-thanh-vien.spec.ts -t bi-go-thi-bi-tu-choi"
bun run test -- "cd apps/api && bun test test/go-thanh-vien.spec.ts -t phien-mat-quyen"
bun run test -- "cd apps/api && bun test test/go-thanh-vien.spec.ts -t duong-moi-khong-cap-lai"
```
Expected: cả ba exit 0

- [ ] **Step 2: Chạy trọn năm lệnh chứng**

```bash
bun run test && bun run check-types && bun run lint && bun run lint:slop && bun run build
```
Expected: cả năm exit 0. `lint` đỏ vì định dạng → chạy `bunx biome check --write` TỪ TRONG gói được nêu, không chạy `bun run format`.

- [ ] **Step 3: Đặt hợp đồng sang `implemented`**

Sửa `_acceptance/go-thanh-vien-phai-giu-duoc/contract.md`: `status: approved` → `status: implemented`.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/go-thanh-vien-phai-giu-duoc/contract.md
git commit -m "chore(acceptance): go-thanh-vien-phai-giu-duoc sang implemented"
```
