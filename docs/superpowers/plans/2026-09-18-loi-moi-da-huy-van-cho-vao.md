# Lời mời đã huỷ vẫn cho vào — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lời mời đã huỷ qua better-auth hoặc bị người được mời từ chối thì không còn cho đăng nhập vào workspace, và màn quản trị thôi hiện chúng như đang chờ.

**Architecture:** Một module từ vựng mới trong `@crm/auth` khai tập trạng thái lời mời và **khẳng định lúc biên dịch** rằng tập ấy bằng đúng `InvitationStatus` mà `better-auth` xuất. Mọi nơi đọc `status` từ cơ sở dữ liệu đi qua một bộ phân tích Zod của module đó thay vì ép kiểu. Quyết định cho vào đổi từ danh sách cấm (`!== "cancelled"`) sang danh sách trắng (`∈ {pending, accepted}`), nên mọi giá trị lạ đều fail-closed.

**Tech Stack:** TypeScript, bun test, Zod 4, Prisma, better-auth 1.6.25 (plugin organization), NestJS (apps/api).

**Spec:** `docs/superpowers/specs/2026-09-18-loi-moi-da-huy-van-cho-vao-design.md`

## Global Constraints

- **Không viết chú thích trong code.** Không thêm vào mã mới, không thêm vào mã sửa.
- **Phân tích tại biên bằng Zod**, không truyền `Record<string, unknown>`, không ép kiểu bằng `as` ở chỗ đọc dữ liệu ngoài.
- Bản `better-auth` là nguồn từ vựng: **1.6.25**, xuất `InvitationStatus = "pending" | "accepted" | "rejected" | "canceled"`.
- Kho từng ghi `"cancelled"` (hai chữ L) — giá trị **ngoài** `InvitationStatus`. Dữ liệu cũ **để nguyên**, chặn ở tầng đọc (quyết định Cổng 1).
- `revokeAllowance` **đổi** sang ghi `"canceled"` (quyết định Cổng 1).
- oxlint anti-slop: cấm `no-runtime-typeof` và `no-known-value-widening`.
- `/packages/ui` là nguồn duy nhất của giao diện — vòng này không chạm giao diện.
- Mỗi phép đo mới chỉ XONG khi có **cặp hai chiều trên cùng cữ liệu**: vật lành → xanh, phá vật thật trong bản sao → đỏ với thông điệp ghim tên ô.

## File Structure

| File | Trách nhiệm |
| --- | --- |
| `packages/auth/src/invitation-status.ts` | **Tạo.** Tập trạng thái, tập còn-hiệu-lực, khẳng định kiểu với gói, bộ phân tích Zod. Một trách nhiệm: từ vựng trạng thái lời mời. |
| `packages/auth/src/allow-list.ts` | **Sửa.** Bỏ ép kiểu ở `readAllowState`; `decideSignIn` đổi sang danh sách trắng. |
| `packages/auth/src/index.ts` | **Sửa.** Xuất từ vựng mới ra ngoài gói. |
| `apps/api/src/workspace/workspace.contracts.ts` | **Sửa.** `ALLOWANCE_STATUSES` mang từ vựng của gói cộng `unknown`. |
| `apps/api/src/workspace/workspace.service.ts` | **Sửa.** `toStatus` thôi mặc định im lặng; `revokeAllowance` ghi `"canceled"`. |
| `packages/auth/test/loi-moi-ket-thuc.spec.ts` | **Tạo.** E1, E2, E3, E4, E6, E8. |
| `packages/auth/test/loi-moi-ket-thuc.integration.spec.ts` | **Tạo.** E9. |
| `apps/api/test/workspace-thanh-vien.spec.ts` | **Sửa.** Thêm khối `trang-thai-that` cho E7. |
| `_acceptance/loi-moi-da-huy-van-cho-vao/rang/tu-vung-goi.mjs` | **Tạo.** E5. |

---

### Task 1: Từ vựng trạng thái lời mời

**Files:**
- Create: `packages/auth/src/invitation-status.ts`
- Create: `packages/auth/test/loi-moi-ket-thuc.spec.ts`
- Modify: `packages/auth/src/index.ts`

**Phục vụ eval:** E3, E6 (một phần), E8 (một phần) · **independent: false** (mọi task sau đều tiêu thụ module này)

**Interfaces — Produces:**
```ts
export const TRANG_THAI_LOI_MOI: readonly ["pending", "accepted", "rejected", "canceled"];
export const CON_HIEU_LUC: readonly ["pending", "accepted"];
export const CANCELLED_CU: "cancelled";
export type TrangThaiLoiMoi = (typeof TRANG_THAI_LOI_MOI)[number];
export type TrangThaiDaDoc = TrangThaiLoiMoi | "unknown";
export function docTrangThai(value: unknown): { trangThai: TrangThaiDaDoc; loi?: string };
export function conHieuLuc(value: TrangThaiDaDoc): boolean;
```

- [ ] **Step 1: Viết bài đo trước — ma trận sáu ô của E8 cộng ô giá trị lạ của E3**

Tạo `packages/auth/test/loi-moi-ket-thuc.spec.ts`:

```ts
import { describe, expect, it } from "bun:test";
import {
	CANCELLED_CU,
	conHieuLuc,
	docTrangThai,
	TRANG_THAI_LOI_MOI,
} from "../src/invitation-status";

const O = {
	pending: TRANG_THAI_LOI_MOI[0],
	accepted: TRANG_THAI_LOI_MOI[1],
	rejected: TRANG_THAI_LOI_MOI[2],
	canceled: TRANG_THAI_LOI_MOI[3],
} as const;

describe("ma-tran-trang-thai", () => {
	it("sau o viet truoc, sau khang dinh", () => {
		expect(O.canceled).not.toBe(CANCELLED_CU);

		const BANG: readonly [string, string, boolean][] = [
			["pending", O.pending, true],
			["accepted", O.accepted, true],
			["canceled", O.canceled, false],
			["rejected", O.rejected, false],
			["cancelled-cu", CANCELLED_CU, false],
			["rac", "khong-phai-trang-thai-nao", false],
		];

		expect(BANG.length).toBe(6);

		for (const [ten, chuoi, mong] of BANG) {
			const doc = docTrangThai(chuoi);
			expect(
				conHieuLuc(doc.trangThai),
				`o "${ten}" chuoi "${chuoi}": mong ${mong ? "CON HIEU LUC" : "HET HIEU LUC"}, nhan ${doc.trangThai}`,
			).toBe(mong);
		}
	});
});

describe("gia-tri-la", () => {
	it("chuoi rac ra unknown co ten, khong mac dinh im lang", () => {
		const doc = docTrangThai("mot-chuoi-chua-tung-thay");
		expect(doc.trangThai, "gia tri la phai ra unknown").toBe("unknown");
		expect(doc.loi ?? "", "loi phai neu ten truong status").toContain("status");
		expect(conHieuLuc(doc.trangThai), "unknown KHONG duoc con hieu luc").toBe(
			false,
		);
	});
});
```

- [ ] **Step 2: Chạy để thấy nó đỏ**

Run: `cd packages/auth && bun test test/loi-moi-ket-thuc.spec.ts`
Expected: FAIL — `Cannot find module '../src/invitation-status'`

- [ ] **Step 3: Viết module từ vựng**

Tạo `packages/auth/src/invitation-status.ts`:

```ts
import type { InvitationStatus } from "better-auth/plugins/organization";
import { z } from "zod";

export const TRANG_THAI_LOI_MOI = [
	"pending",
	"accepted",
	"rejected",
	"canceled",
] as const;

export type TrangThaiLoiMoi = (typeof TRANG_THAI_LOI_MOI)[number];

type BangNhau<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const _KHOP: BangNhau<TrangThaiLoiMoi, InvitationStatus> = true;
void _KHOP;

export const CON_HIEU_LUC = ["pending", "accepted"] as const;

export const CANCELLED_CU = "cancelled";

export type TrangThaiDaDoc = TrangThaiLoiMoi | "unknown";

const schema = z.enum(TRANG_THAI_LOI_MOI);

export function docTrangThai(value: unknown): {
	trangThai: TrangThaiDaDoc;
	loi?: string;
} {
	const ket = schema.safeParse(value);

	if (ket.success) return { trangThai: ket.data };

	return {
		trangThai: "unknown",
		loi: `truong status khong doc duoc: ${JSON.stringify(value)}`,
	};
}

export function conHieuLuc(value: TrangThaiDaDoc): boolean {
	return (CON_HIEU_LUC as readonly string[]).includes(value);
}
```

Dòng `_KHOP` là khẳng định lúc biên dịch: gói đổi `InvitationStatus` thì `check-types` đỏ ngay tại dòng này.

- [ ] **Step 4: Chạy lại, phải xanh**

Run: `cd packages/auth && bun test test/loi-moi-ket-thuc.spec.ts`
Expected: PASS — hai khối `ma-tran-trang-thai` và `gia-tri-la`

- [ ] **Step 5: Chiều đỏ thứ nhất — bỏ `pending` khỏi tập còn hiệu lực**

Sửa tạm `CON_HIEU_LUC` thành `["accepted"] as const`, chạy lại.
Expected: FAIL ở ô `pending` với thông điệp `o "pending" chuoi "pending": mong CON HIEU LUC, nhan pending`. Hoàn nguyên.

- [ ] **Step 6: Chiều đỏ thứ hai — đổi sang danh sách cấm**

Sửa tạm `conHieuLuc` thành `return value !== CANCELLED_CU;`, chạy lại.
Expected: FAIL ở ô `rac` với thông điệp `o "rac" chuoi "khong-phai-trang-thai-nao": mong HET HIEU LUC, nhan unknown`. Hoàn nguyên.

- [ ] **Step 7: Xuất ra ngoài gói**

Thêm vào `packages/auth/src/index.ts`, giữ thứ tự chữ cái của khối export:

```ts
export {
	CANCELLED_CU,
	CON_HIEU_LUC,
	conHieuLuc,
	docTrangThai,
	TRANG_THAI_LOI_MOI,
	type TrangThaiDaDoc,
	type TrangThaiLoiMoi,
} from "./invitation-status";
```

- [ ] **Step 8: Kiểm kiểu và luật chống mã ẩu**

Run: `bun run check-types && bun run lint:slop`
Expected: cả hai exit 0

- [ ] **Step 9: Commit**

```bash
git add packages/auth/src/invitation-status.ts packages/auth/src/index.ts packages/auth/test/loi-moi-ket-thuc.spec.ts
git commit -m "feat(auth): tu vung trang thai loi moi neo vao kieu better-auth xuat ra"
```

---

### Task 2: Thước đối chiếu từ vựng với gói đã cài

**Files:**
- Create: `_acceptance/loi-moi-da-huy-van-cho-vao/rang/tu-vung-goi.mjs`

**Phục vụ eval:** E5 · **independent: true** (chỉ đọc `invitation-status.ts` của Task 1 và `node_modules`; không tiêu thụ Task 3–6)

**Interfaces — Consumes:** `TRANG_THAI_LOI_MOI` từ Task 1.

- [ ] **Step 1: Viết thước**

Tạo `_acceptance/loi-moi-da-huy-van-cho-vao/rang/tu-vung-goi.mjs`:

```js
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(DAY, "..", "..", "..");
const NEO = join(GOC, "packages", "auth", "package.json");

function tuChoi(vi) {
	console.error(`MA 2: ${vi}`);
	process.exit(2);
}

let duongGoi;
let ban;

try {
	const req = createRequire(NEO);
	duongGoi = req.resolve("better-auth/package.json");
	ban = JSON.parse(readFileSync(duongGoi, "utf8")).version;
} catch (loi) {
	tuChoi(`khong giai duoc better-auth tu ${NEO}: ${loi.message}`);
}

const trongCay = join(GOC, "packages", "auth", "node_modules", "better-auth");

if (!duongGoi.startsWith(trongCay)) {
	tuChoi(
		`goi giai duoc nam ngoai cay cua packages/auth — giai: ${duongGoi}, mong duoi: ${trongCay}`,
	);
}

console.log(`goi: ${duongGoi}`);
console.log(`ban: ${ban}`);

const dist = join(dirname(duongGoi), "dist");
let thoGoi;

try {
	thoGoi = execFileSync(
		"grep",
		["-rho", "InvitationStatus = [^;]*", dist],
		{ encoding: "utf8" },
	);
} catch (loi) {
	tuChoi(`khong doc duoc InvitationStatus trong ${dist}: ${loi.message}`);
}

const dong = thoGoi.split("\n").find((d) => d.includes("|"));

if (!dong) tuChoi(`khong tim thay dinh nghia InvitationStatus trong ${dist}`);

const tapGoi = [...dong.matchAll(/"([a-z]+)"/g)].map((m) => m[1]).sort();

const nguon = readFileSync(
	join(GOC, "packages", "auth", "src", "invitation-status.ts"),
	"utf8",
);
const khoi = nguon.match(/TRANG_THAI_LOI_MOI = \[([^\]]*)\]/);

if (!khoi) tuChoi("khong doc duoc TRANG_THAI_LOI_MOI trong invitation-status.ts");

const tapKho = [...khoi[1].matchAll(/"([a-z]+)"/g)].map((m) => m[1]).sort();

console.log(`tap goi: ${JSON.stringify(tapGoi)}`);
console.log(`tap kho: ${JSON.stringify(tapKho)}`);

const thua = tapKho.filter((t) => !tapGoi.includes(t));
const thieu = tapGoi.filter((t) => !tapKho.includes(t));

if (thua.length || thieu.length) {
	console.error(
		`MA 1: hai tap khong bang nhau — kho thua ${JSON.stringify(thua)}, kho thieu ${JSON.stringify(thieu)}`,
	);
	process.exit(1);
}

console.log(`DAT: hai tap bang nhau, ${tapKho.length} trang thai`);
```

- [ ] **Step 2: Chạy, phải xanh**

Run: `node _acceptance/loi-moi-da-huy-van-cho-vao/rang/tu-vung-goi.mjs`
Expected: exit 0, in `ban: 1.6.25` và `DAT: hai tap bang nhau, 4 trang thai`

- [ ] **Step 3: Chiều đỏ thứ nhất — thêm giá trị giả vào tập của kho**

Thêm tạm `"expired",` vào `TRANG_THAI_LOI_MOI` trong `packages/auth/src/invitation-status.ts`, chạy lại.
Expected: exit **1**, in `MA 1: hai tap khong bang nhau — kho thua ["expired"]`. Hoàn nguyên.

- [ ] **Step 4: Chiều đỏ thứ hai — trỏ sang bản 1.4.22**

Sửa tạm hằng `NEO` thành `join(GOC, "node_modules", "@better-auth", "cli", "package.json")`, chạy lại.
Expected: exit **2** với `MA 2: goi giai duoc nam ngoai cay cua packages/auth`. Đây là chiều chứng minh thước từ chối đo bản sai chứ không âm thầm cho qua. Hoàn nguyên.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/loi-moi-da-huy-van-cho-vao/rang/tu-vung-goi.mjs
git commit -m "test(acceptance): thuoc doi chieu tu vung trang thai voi goi da cai"
```

---

### Task 3: Ranh giới đọc thôi ép kiểu

**Files:**
- Modify: `packages/auth/src/allow-list.ts:5-11` (kiểu), `:105` (ép kiểu)
- Modify: `packages/auth/test/loi-moi-ket-thuc.spec.ts` (thêm khối `ranh-gioi-doc`)

**Phục vụ eval:** E6 · **independent: false** (dùng `docTrangThai` của Task 1)

**Interfaces — Consumes:** `docTrangThai`, `TrangThaiDaDoc` từ Task 1.
**Interfaces — Produces:**
```ts
export type AllowanceRow = { email: string; role: string | null; status: TrangThaiDaDoc };
export function docHang(rows: readonly { email: string; role: string | null; status: unknown }[]): { rows: AllowanceRow[]; loi: string[] };
```

- [ ] **Step 1: Viết bài đo trước**

Thêm vào cuối `packages/auth/test/loi-moi-ket-thuc.spec.ts`:

```ts
describe("ranh-gioi-doc", () => {
	it("dong la thanh unknown co ten, dong lanh di qua nguyen ven", () => {
		const { rows, loi } = docHang([
			{ email: "a@x.com", role: "member", status: "pending" },
			{ email: "b@x.com", role: "admin", status: 42 },
		]);

		expect(rows.length, "hai dong vao thi hai dong ra").toBe(2);
		expect(rows[0]?.status, "dong lanh giu nguyen trang thai").toBe("pending");
		expect(rows[1]?.status, "dong la phai thanh unknown").toBe("unknown");
		expect(loi.length, "dong la phai de lai dung mot loi co ten").toBe(1);
		expect(loi[0] ?? "", "loi phai neu ten truong status").toContain("status");
	});
});
```

Thêm `docHang` vào khối import ở đầu file:

```ts
import { docHang } from "../src/allow-list";
```

- [ ] **Step 2: Chạy để thấy nó đỏ**

Run: `cd packages/auth && bun test test/loi-moi-ket-thuc.spec.ts -t ranh-gioi-doc`
Expected: FAIL — `docHang is not a function`

- [ ] **Step 3: Sửa kiểu và thêm `docHang`**

Trong `packages/auth/src/allow-list.ts`, đổi khối kiểu ở đầu file:

```ts
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { conHieuLuc, docTrangThai, type TrangThaiDaDoc } from "./invitation-status";
import { toWorkspaceRole, type WorkspaceRole } from "./roles";

export type AllowanceRow = {
	email: string;
	role: string | null;
	status: TrangThaiDaDoc;
};
```

Xoá hẳn `export type AllowanceStatus = "pending" | "accepted" | "cancelled";`.

Thêm hàm, đặt ngay trên `readAllowState`:

```ts
export function docHang(
	rows: readonly { email: string; role: string | null; status: unknown }[],
): { rows: AllowanceRow[]; loi: string[] } {
	const loi: string[] = [];
	const ra = rows.map((row) => {
		const doc = docTrangThai(row.status);
		if (doc.loi) loi.push(`${row.email}: ${doc.loi}`);
		return { email: row.email, role: row.role, status: doc.trangThai };
	});

	return { rows: ra, loi };
}
```

- [ ] **Step 4: Bỏ ép kiểu trong `readAllowState`**

Thay khối `return` của `readAllowState`:

```ts
	const { rows: allowances, loi } = docHang(rows);

	for (const cau of loi) console.error(`allow-list: ${cau}`);

	return {
		email,
		allowances,
		seedList: process.env.ALLOWED_SIGN_IN ?? "",
		anyUserExists: anyUser > 0,
	};
```

Không còn `rows as AllowanceRow[]` ở bất kỳ đâu trong file.

- [ ] **Step 5: Chạy lại, phải xanh**

Run: `cd packages/auth && bun test test/loi-moi-ket-thuc.spec.ts -t ranh-gioi-doc`
Expected: PASS

- [ ] **Step 6: Chiều đỏ — trả lại câu ép kiểu**

Sửa tạm `docHang` thành `return { rows: rows as AllowanceRow[], loi: [] };`, chạy lại.
Expected: FAIL ở `dong la phai thanh unknown` (nhận `42`) và ở `dong la phai de lai dung mot loi co ten`. Hoàn nguyên.

- [ ] **Step 7: Sửa nơi khác còn tham chiếu kiểu cũ**

Run: `bun run check-types`
Expected: đỏ ở `packages/auth/src/index.ts` (còn xuất `AllowanceStatus`) và `packages/auth/test/ai-duoc-vao.spec.ts`. Xoá dòng `type AllowanceStatus,` khỏi khối export trong `index.ts`. Trong `ai-duoc-vao.spec.ts`, hàm `khue` giữ nguyên chữ ký vì `AllowanceRow["status"]` nay là `TrangThaiDaDoc`; đổi mọi lời gọi `khue("cancelled")` thành `khue("canceled")`. Chạy lại `bun run check-types` cho tới khi exit 0.

- [ ] **Step 8: Commit**

```bash
git add packages/auth/src/allow-list.ts packages/auth/src/index.ts packages/auth/test/loi-moi-ket-thuc.spec.ts packages/auth/test/ai-duoc-vao.spec.ts
git commit -m "fix(auth): ranh gioi doc phan tich trang thai loi moi thay vi ep kieu"
```

---

### Task 4: Quyết định cho vào theo danh sách trắng

**Files:**
- Modify: `packages/auth/src/allow-list.ts` (hàm `decideSignIn`)
- Modify: `packages/auth/test/loi-moi-ket-thuc.spec.ts` (thêm ba khối)

**Phục vụ eval:** E1, E2, E4 · **independent: false** (dùng Task 1 và Task 3)

**Interfaces — Consumes:** `conHieuLuc` từ Task 1, `AllowanceRow` từ Task 3.

- [ ] **Step 1: Viết ba bài đo trước**

Thêm vào `packages/auth/test/loi-moi-ket-thuc.spec.ts`:

```ts
const dungThu = (status: AllowanceRow["status"]) =>
	decideSignIn({
		email: "khue@gmail.com",
		allowances: [{ email: "khue@gmail.com", role: "admin", status }],
		seedList: "",
		anyUserExists: true,
	});

describe("huy-qua-goi", () => {
	it("trang thai canceled mot chu L thi tu choi", () => {
		expect(O.canceled).not.toBe(CANCELLED_CU);
		expect(
			dungThu(O.canceled).allowed,
			`chuoi "${O.canceled}" phai bi tu choi`,
		).toBe(false);
	});
});

describe("tu-choi-loi-moi", () => {
	it("trang thai rejected thi tu choi", () => {
		expect(
			dungThu(O.rejected).allowed,
			`chuoi "${O.rejected}" phai bi tu choi`,
		).toBe(false);
	});
});

describe("du-lieu-cu", () => {
	it("dong cu mang cancelled hai chu L van bi tu choi", () => {
		const doc = docTrangThai(CANCELLED_CU);
		expect(doc.trangThai, "cancelled cu khong nam trong tu vung goi").toBe(
			"unknown",
		);
		expect(
			dungThu(doc.trangThai).allowed,
			`chuoi "${CANCELLED_CU}" phai bi tu choi`,
		).toBe(false);
	});
});
```

Thêm `decideSignIn` và `type AllowanceRow` vào khối import từ `../src/allow-list`.

- [ ] **Step 2: Chạy để thấy hai khối đỏ**

Run: `cd packages/auth && bun test test/loi-moi-ket-thuc.spec.ts`
Expected: `huy-qua-goi` và `tu-choi-loi-moi` FAIL (hiện `allowed: true`); `du-lieu-cu` PASS sẵn.

- [ ] **Step 3: Đổi `decideSignIn` sang danh sách trắng**

Trong `packages/auth/src/allow-list.ts`, thay điều kiện tìm dòng:

```ts
	const row = input.allowances.find(
		(candidate) =>
			normalizeEmail(candidate.email) === email &&
			conHieuLuc(candidate.status),
	);
```

Phần còn lại của hàm giữ nguyên.

- [ ] **Step 4: Chạy lại, cả ba phải xanh**

Run: `cd packages/auth && bun test test/loi-moi-ket-thuc.spec.ts`
Expected: PASS toàn bộ file

- [ ] **Step 5: Chiều đỏ — trả lại danh sách cấm**

Sửa tạm điều kiện thành `candidate.status !== CANCELLED_CU`, chạy lại.
Expected: FAIL ở `huy-qua-goi` với `chuoi "canceled" phai bi tu choi`, và FAIL ở `ma-tran-trang-thai` ô `rac`. Hoàn nguyên.

- [ ] **Step 6: Bài cũ vẫn phải xanh**

Run: `cd packages/auth && bun test`
Expected: PASS, gồm cả `ai-duoc-vao.spec.ts` đã sửa ở Task 3

- [ ] **Step 7: Commit**

```bash
git add packages/auth/src/allow-list.ts packages/auth/test/loi-moi-ket-thuc.spec.ts
git commit -m "fix(auth): cho vao theo danh sach trang thay vi mot chuoi cam"
```

---

### Task 5: Lượt đăng nhập không cấp lại tư cách thành viên

**Files:**
- Create: `packages/auth/test/loi-moi-ket-thuc.integration.spec.ts`

**Phục vụ eval:** E9 · **independent: false** (cần Task 4 xong)

**Interfaces — Consumes:** `ensureWorkspaceMembership` từ `packages/auth/src/organization.ts`, `decideSignInFromDb` từ Task 4.

Đây là vế hai của AC-1 mà phiên phản biện bắt được: quyết định TỪ CHỐI đúng không có nghĩa là lộ trình đăng nhập thôi cấp tư cách thành viên.

- [ ] **Step 1: Đọc khuôn bài tích hợp có sẵn**

Run: `sed -n '1,40p' packages/auth/test/cong-vao.integration.spec.ts`
Dùng đúng cách file đó dựng cơ sở dữ liệu và dọn sau mỗi lượt. Không tự phát minh cách khác.

- [ ] **Step 2: Viết bài đo — hai vế trên cùng cữ liệu**

Tạo `packages/auth/test/loi-moi-ket-thuc.integration.spec.ts`, theo khuôn vừa đọc:

```ts
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { describe, expect, it } from "bun:test";
import { TRANG_THAI_LOI_MOI } from "../src/invitation-status";
import { ensureWorkspaceMembership } from "../src/organization";

async function demThanhVien() {
	return db.member.count({ where: { organizationId: WORKSPACE_ID } });
}

async function chayMotLuot(status: string, email: string) {
	const user = await db.user.create({
		data: { id: crypto.randomUUID(), email, name: email, emailVerified: true },
	});

	await db.invitation.create({
		data: {
			id: crypto.randomUUID(),
			organizationId: WORKSPACE_ID,
			email,
			role: "admin",
			status,
			expiresAt: new Date("9999-12-31T00:00:00.000Z"),
			inviterId: user.id,
		},
	});

	const truoc = await demThanhVien();
	await ensureWorkspaceMembership(user.id, email);
	const sau = await demThanhVien();

	return sau - truoc;
}

describe("khong-sinh-thanh-vien", () => {
	it("canceled khong sinh dong nao, pending sinh dung mot dong", async () => {
		const hieuCanceled = await chayMotLuot(
			TRANG_THAI_LOI_MOI[3],
			`huy-${process.pid}@localhost`,
		);

		expect(
			hieuCanceled,
			`loi moi "${TRANG_THAI_LOI_MOI[3]}" sinh ${hieuCanceled} dong thanh vien, mong 0`,
		).toBe(0);

		const hieuPending = await chayMotLuot(
			TRANG_THAI_LOI_MOI[0],
			`cho-${process.pid}@localhost`,
		);

		expect(
			hieuPending,
			`loi moi "${TRANG_THAI_LOI_MOI[0]}" sinh ${hieuPending} dong thanh vien, mong 1`,
		).toBe(1);
	});
});
```

Vế `pending → 1` là đối chứng dương: không có nó thì một bản sửa chặn tất cả mọi người vẫn xanh.

- [ ] **Step 3: Chạy**

Run: `bun run test -- "cd packages/auth && bun test test/loi-moi-ket-thuc.integration.spec.ts"`
Expected: PASS cả hai vế. Nếu vế `pending` đỏ vì workspace đã có sẵn thành viên và đường vét `enrolled === 0` không chạy, đó là tín hiệu thật — đọc `ensureWorkspaceMembership` rồi sửa cữ liệu cho đúng lộ trình, KHÔNG nới lỏng khẳng định.

- [ ] **Step 4: Chiều đỏ — gỡ phép kiểm khỏi lộ trình**

Trong `packages/auth/src/organization.ts`, sửa tạm dòng `if (!decision.allowed) return workspace.id;` thành `void decision;`, chạy lại.
Expected: FAIL ở vế đầu với `loi moi "canceled" sinh 1 dong thanh vien, mong 0`. Hoàn nguyên.

- [ ] **Step 5: Commit**

```bash
git add packages/auth/test/loi-moi-ket-thuc.integration.spec.ts
git commit -m "test(auth): luot dang nhap cua loi moi da huy khong cap tu cach thanh vien"
```

---

### Task 6: Màn quản trị hiện đúng trạng thái

**Files:**
- Modify: `apps/api/src/workspace/workspace.contracts.ts:24`
- Modify: `apps/api/src/workspace/workspace.service.ts:68-70` (`toStatus`), `:342` và `:409` (`revokeAllowance`)
- Modify: `apps/api/test/workspace-thanh-vien.spec.ts` (thêm khối `trang-thai-that`)

**Phục vụ eval:** E7 · **independent: false** (dùng từ vựng của Task 1)

**Interfaces — Consumes:** `docTrangThai`, `TRANG_THAI_LOI_MOI` từ `@crm/auth` (Task 1).

- [ ] **Step 1: Viết bài đo trước — ma trận bốn ô ghim giá trị RA**

Thêm vào `apps/api/test/workspace-thanh-vien.spec.ts`:

```ts
describe("trang-thai-that", () => {
	it("bon o viet truoc, gia tri ra bang gia tri vao", async () => {
		const BANG = [
			["pending", "pending"],
			["accepted", "accepted"],
			["canceled", "canceled"],
			["rejected", "rejected"],
		] as const;

		expect(BANG.length).toBe(4);

		for (const [vao, ra] of BANG) {
			expect(toStatus(vao), `o "${vao}": vao "${vao}" thi phai ra "${ra}"`).toBe(
				ra,
			);
		}

		expect(
			toStatus("mot-chuoi-la"),
			'gia tri la phai ra "unknown", khong duoc hoa "pending"',
		).toBe("unknown");
	});
});
```

`toStatus` hiện là hàm module riêng tư — xuất nó ra để đo được: đổi `function toStatus` thành `export function toStatus` trong `workspace.service.ts`, và import nó trong bài đo.

- [ ] **Step 2: Chạy để thấy nó đỏ**

Run: `bun run test -- "cd apps/api && bun test test/workspace-thanh-vien.spec.ts -t trang-thai-that"`
Expected: FAIL ở ô `canceled` với `o "canceled": vao "canceled" thi phai ra "canceled"` (hiện ra `pending`)

- [ ] **Step 3: Mở rộng từ vựng của hợp đồng đầu ra**

Trong `apps/api/src/workspace/workspace.contracts.ts`, thay dòng 24:

```ts
export const ALLOWANCE_STATUSES = [
	"pending",
	"accepted",
	"rejected",
	"canceled",
	"unknown",
] as const;
```

Chuỗi `"cancelled"` rời khỏi hợp đồng đầu ra: dòng cũ mang nó sẽ đi qua `docTrangThai` và ra `"unknown"`.

- [ ] **Step 4: Sửa `toStatus`**

Trong `apps/api/src/workspace/workspace.service.ts`, thay ba dòng 68–70:

```ts
export function toStatus(value: string): Allowance["status"] {
	return docTrangThai(value).trangThai;
}
```

Thêm `docTrangThai` vào khối import từ `@crm/auth`.

- [ ] **Step 5: Đổi vế ghi của nút thu hồi**

Trong cùng file, ở cả hai chỗ `data: { status: "cancelled" }` (dòng 342 và 409), thay bằng:

```ts
					data: { status: TRANG_THAI_LOI_MOI[3] },
```

Thêm `TRANG_THAI_LOI_MOI` vào khối import từ `@crm/auth`. Dùng phần tử của hằng thay vì gõ lại chuỗi, để vế ghi không bao giờ rời khỏi từ vựng đã được Task 2 đối chiếu.

- [ ] **Step 6: Chạy lại, phải xanh**

Run: `bun run test -- "cd apps/api && bun test test/workspace-thanh-vien.spec.ts -t trang-thai-that"`
Expected: PASS

- [ ] **Step 7: Chiều đỏ thứ nhất — trả lại mặc định im lặng**

Sửa tạm `toStatus` thành `return value === "accepted" || value === "cancelled" ? value : "pending";`, chạy lại.
Expected: FAIL ở ô `canceled` với `o "canceled": vao "canceled" thi phai ra "canceled"`. Hoàn nguyên.

- [ ] **Step 8: Chiều đỏ thứ hai — cho mọi giá trị hoá `unknown`**

Sửa tạm `toStatus` thành `return "unknown";`, chạy lại.
Expected: FAIL ở ô `pending` với `o "pending": vao "pending" thi phai ra "pending"`. Đây là chiều chứng minh bài đo phân biệt được «chặn đúng» với «hỏng hết». Hoàn nguyên.

- [ ] **Step 9: Bài cũ của màn thành viên vẫn phải xanh**

Run: `bun run test -- "cd apps/api && bun test test/workspace-thanh-vien.spec.ts"`
Expected: PASS. Khối `cho-phep-lai` dựng dòng `cancelled` — đổi nó sang `TRANG_THAI_LOI_MOI[3]` nếu nó khẳng định trạng thái trả về.

- [ ] **Step 10: Commit**

```bash
git add apps/api/src/workspace/workspace.contracts.ts apps/api/src/workspace/workspace.service.ts apps/api/test/workspace-thanh-vien.spec.ts
git commit -m "fix(api): man quan tri hien dung trang thai loi moi, nut thu hoi ghi tu vung cua goi"
```

---

### Task 7: Năm lệnh chứng của kho

**Files:** không tạo file mới.

**Phục vụ eval:** toàn bộ suite của làn · **independent: false** (chạy sau Task 1–6)

- [ ] **Step 1: Chạy trọn năm lệnh**

```bash
bun run test && bun run check-types && bun run lint && bun run lint:slop && bun run build
```
Expected: cả năm exit 0

- [ ] **Step 2: Chạy chín eval của hồ sơ đúng như làn sẽ chạy**

```bash
bun run test -- "cd packages/auth && bun test test/loi-moi-ket-thuc.spec.ts -t huy-qua-goi"
bun run test -- "cd packages/auth && bun test test/loi-moi-ket-thuc.spec.ts -t tu-choi-loi-moi"
bun run test -- "cd packages/auth && bun test test/loi-moi-ket-thuc.spec.ts -t gia-tri-la"
bun run test -- "cd packages/auth && bun test test/loi-moi-ket-thuc.spec.ts -t du-lieu-cu"
bun run test -- "cd packages/auth && bun test test/loi-moi-ket-thuc.spec.ts -t ranh-gioi-doc"
bun run test -- "cd packages/auth && bun test test/loi-moi-ket-thuc.spec.ts -t ma-tran-trang-thai"
bun run test -- "cd packages/auth && bun test test/loi-moi-ket-thuc.integration.spec.ts -t khong-sinh-thanh-vien"
bun run test -- "cd apps/api && bun test test/workspace-thanh-vien.spec.ts -t trang-thai-that"
node _acceptance/loi-moi-da-huy-van-cho-vao/rang/tu-vung-goi.mjs
```
Expected: cả chín exit 0

- [ ] **Step 3: Đặt hợp đồng sang `implemented`**

Sửa `_acceptance/loi-moi-da-huy-van-cho-vao/contract.md` frontmatter: `status: approved` → `status: implemented`.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/loi-moi-da-huy-van-cho-vao/contract.md
git commit -m "chore(acceptance): loi-moi-da-huy-van-cho-vao sang implemented"
```
