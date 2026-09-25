# Cập nhật tuần OKR — kế hoạch làm

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người phụ trách KR được nhắc trong tin buổi sáng và thẻ «việc của tôi», cập nhật mọi KR trong một màn, trao đổi trên mục tiêu; số KR đang chạy chỉ đổi qua lần cập nhật; quản trị chuyển OKR của người nghỉ.

**Architecture:** Năm bảng mới liền cuối `schema.prisma`; khuôn Zod ở `packages/validation/src/okr-cap-nhat.ts` và `okr-trao-doi.ts`; logic OKR mới ở hai service riêng trong `apps/api/src/okr` (không phình `okr.service.ts` 1.300 dòng); việc cần nhắc OKR ở `packages/db/src/okr-nhac.ts`, gọi từ trong `viecCanNhac` để agent và API đọc cùng một hàm; giao diện ở khu `okr/`, sheet mục tiêu và màn Thành viên.

**Tech Stack:** Prisma 7 · NestJS + nestjs-trpc · Zod · Next.js (app router) + TanStack Query · eve (agent) · bun test · puppeteer-core cho phép đo màn.

**Spec:** `docs/superpowers/specs/2026-09-25-cap-nhat-tuan-okr-design.md` · hợp đồng `_acceptance/cap-nhat-tuan-okr/contract.md` (16 tiêu chí, duyệt 2026-09-25) · phép đo `_acceptance/cap-nhat-tuan-okr/evals.yaml` (29).

## Global Constraints

- Không chú thích trong code, mã mới hay mã sửa (`AGENTS.md`).
- Trí khôn ở `apps/agent`; API chỉ đọc/ghi hàng. Tính việc cần nhắc là quy tắc dữ liệu thuần, sống ở `packages/db` như `viecCanNhac` hiện có.
- Hằng số tinh chỉnh được vào module config của khu: `OKR_NHAC` (`packages/db/src/okr-nhac.ts`), `OKR` (`apps/api/src/okr/okr-config.ts`). Không số ma thuật tại chỗ.
- Parse ở biên bằng Zod `.strict()` trong `packages/validation/src`; không truyền `Record<string, unknown>`.
- `migration` chỉ `CREATE TABLE`, `CREATE INDEX`, `ADD CONSTRAINT … FOREIGN KEY`; model `Okr*` liền nhau ở cuối `schema.prisma`.
- Mọi thủ tục mới trong router `okr` (khai `PhamViOkrMiddleware`); `src/generated/server.ts` sinh bằng `cd apps/api && bun run trpc:generate` và commit.
- Mỗi thủ tục ghi một dòng `OkrTrail`, không `Activity`. Vết bình luận không chứa nội dung.
- Giao diện: `packages/ui` là nguồn duy nhất; không sửa tệp có sẵn trong `packages/ui` (chỉ thêm `item.tsx` qua `bun run ui:add item --dry-run` trước); không `divide-y`, `<ul>`, `<table>`, `rounded-lg border` tự dựng, `<h1>/<h2>`; dữ liệu người nhập mang `translate="no"`.
- Chuỗi giao diện ở `apps/app/lib/messages/okr.ts` (vi + en), theo từ điển `CONTEXT.md`.
- Máy chủ dev cho phép đo: app 3920, api 3921 của chính cây này; ảnh vào `.acceptance-runs/cap-nhat-tuan-okr/evidence/`.
- Mọi lệnh nền đặt `PATH=/Users/manhphan/.local/share/fnm/node-versions/v24.15.0/installation/bin:$PATH`.
- Không `git add -A`; không `--no-verify`; `PRODUCT-MAP.md` chỉ vẽ bằng `product-map.mjs --root .`.

## Review Focus

- Người chỉ có việc OKR (không kế hoạch 30 ngày) phải có hàng nhắc và nhận tin — `viecCanNhac` hôm nay chỉ duyệt kế hoạch. Test ở Task 3 (E10 người B).
- Đồng hồ phiên phải bắt đầu khi danh sách hiện, không lúc bấm gửi; «Gửi lại» không mở phiên mới. Test ở Task 6 (E7).
- Dọn dữ liệu sàn test: `okr-san.ts` xoá KR và mục tiêu sau mỗi bộ — bảng mới có khoá ngoại `Restrict` tới KR/mục tiêu nên phải xoá trước, nếu không mọi bài OKR cũ đỏ ở `afterAll`. Sửa ở Task 1, chạy lại `okr.spec.ts` trọn.
- Tuần theo giờ Việt Nam ở biên Chủ nhật 23:00 VN (= Chủ nhật 16:00 UTC) và thứ Hai 06:59 VN (= Chủ nhật 23:59 UTC). Test ở Task 3 (E8) và Task 1 (`dauTuanVN`).
- Lời gọi trộn đổi `currentValue` cùng `targetValue` trên KR đang chạy không được ghi dở. Test ở Task 2 (E28 ô trộn).

## Rủi ro — hồ sơ đã ký phải ghim lại

- `dat-okr-trong-crm`: bài `cong-bo` (E5) sửa khẳng định `currentValue` → 400 (Task 2); `expected` E5 và dòng `supersedes` trong sổ của hồ sơ đó (Task 2); `okr-san.ts` đổi phần dọn (Task 1); sheet mục tiêu thêm tab (Task 8).
- `vai-chi-okr`: thủ tục mới dưới alias `okr` — ma trận đọc `generated/server.ts`, danh sách alias không đổi.
- `may-nhac-truoc-nguoi`, `nhac-qua-zalo`, `moi-phia-deu-thay-ke-hoach`: `ViecNhac` thành hợp khuôn, dựng tin đổi (Task 3). Tin chỉ có việc kế hoạch giữ nguyên chữ.
- Tập thật do máy rút ở Task 10 (`ho-so-bi-cham.mjs`, E21); ghim lại bằng `repin-lane.mjs` sau khi lên `onehub`.

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `packages/db/prisma/schema.prisma` (cuối tệp) + `migrations/20260927010000_okr_cap_nhat/` | năm bảng mới |
| `packages/validation/src/okr-cap-nhat.ts` | `MUC_TU_TIN`, `LOI_VAO`, `KENH_CAP_NHAT`, `moCapNhatInput`, `guiCapNhatInput`, `kiemGiaTriTheoKieu` |
| `packages/validation/src/okr-trao-doi.ts` | `addCommentInput`, `followInput`, `commentsInput`, `transferOkrInput` |
| `packages/validation/src/okr-vet.ts` | thêm năm hành động vết |
| `packages/validation/src/nhac-ke-hoach.ts` | `mucNhac` thành hợp khuôn kế hoạch/OKR |
| `packages/db/src/onboarding-nhac.ts` | `dauTuanVN`; `ViecNhac` thành hợp; `viecCanNhac` gọi `viecOkrCanNhac` |
| `packages/db/src/okr-nhac.ts` | `OKR_NHAC`, `LOAI_NHAC_OKR`, `viecOkrCanNhac`, `lienQuanOkr` |
| `apps/api/src/okr/okr-cap-nhat.service.ts` | `capNhatTuan`, `moCapNhat`, `guiCapNhat` |
| `apps/api/src/okr/okr-trao-doi.service.ts` | `comments`, `addComment`, `follow`, `viecCuaToi`, `transferPreview`, `transferWork` |
| `apps/api/src/okr/okr.service.ts` | `updateKeyResult` khoá số hiện tại; `removeKeyResult` chặn KR đã cập nhật; `objective`/`mine` thêm cờ |
| `apps/api/src/okr/okr.contracts.ts`, `okr.router.ts`, `okr.module.ts`, `okr-config.ts` | hợp đồng, thủ tục, câu ghim |
| `apps/agent/agent/lib/tin-nhac.ts`, `nhac-ke-hoach.ts` | dựng tin hợp khuôn, đường mở theo loại |
| `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/{page,cap-nhat-tuan}.tsx` | màn cập nhật tuần |
| `apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx` | thẻ việc OKR |
| `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx` | hộp cập nhật một KR |
| `apps/app/components/crm/record-sheet/objective-trao-doi.tsx` | tab Trao đổi |
| `apps/app/app/(app)/[slug]/settings/members/chuyen-okr-dialog.tsx` | hộp Chuyển OKR |
| `packages/ui/src/components/item.tsx` | shadcn `item` (bậc 2) |
| `_acceptance/cap-nhat-tuan-okr/rang/*` | phép đo script của hồ sơ |

---

### Task 1: Dữ liệu, `migration` chỉ thêm, khuôn Zod, dọn sàn test

Phục vụ: E2, E27 (và mọi eval khác đứng trên nó). **independent: false** (mọi task sau cần nó).

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (thêm năm model sau `OkrTrail`; quan hệ ngược trên `OkrObjective`, `OkrKeyResult`)
- Create: `packages/db/prisma/migrations/20260927010000_okr_cap_nhat/migration.sql` (sinh bằng `prisma migrate dev --create-only --name okr_cap_nhat`, đổi tên thư mục cho đúng dấu thời gian, đọc lại từng câu)
- Create: `packages/validation/src/okr-cap-nhat.ts`, `packages/validation/src/okr-trao-doi.ts`
- Modify: `packages/validation/src/okr-vet.ts`, `packages/validation/package.json` (exports)
- Modify: `packages/db/src/onboarding-nhac.ts` (thêm `dauTuanVN`)
- Modify: `apps/api/test/okr-san.ts` (dọn bảng mới trước KR/mục tiêu)
- Test: `packages/validation/test/okr-cap-nhat.spec.ts`, `packages/db/test/dau-tuan-vn.spec.ts`
- Create: `_acceptance/cap-nhat-tuan-okr/rang/cau-hinh.mjs`, `rang/migration-chi-them.mjs`

**Interfaces — Produces:**
- Prisma: `db.okrCheckInSession`, `db.okrCheckIn`, `db.okrComment`, `db.okrMention`, `db.okrFollow`.
- `@crm/validation/okr-cap-nhat`: `MUC_TU_TIN = ["cao","vua","thap"] as const`, `type MucTuTin`, `LOI_VAO = ["nhac","viec-cua-toi","tab","sheet"] as const`, `KENH_CAP_NHAT = ["web"] as const`, `moCapNhatInput`, `guiCapNhatInput`, `kiemGiaTriTheoKieu(kind: KieuKr, value: number): "moc-chi-0-1" | "phan-tram-ngoai-0-100" | null`, `GHI_CHU_TOI_DA = 200`.
- `@crm/validation/okr-trao-doi`: `commentsInput`, `addCommentInput`, `followInput`, `transferOkrPreviewInput`, `transferOkrInput`, `BINH_LUAN_TOI_DA = 2000`.
- `@crm/db/onboarding-nhac`: `dauTuanVN(now: Date): string` (chuỗi `yyyy-mm-dd` của thứ Hai giờ VN).

- [ ] **Step 1: Năm model**

```prisma
model OkrCheckInSession {
  id          String       @id @default(cuid())
  userId      String
  entry       String
  openedAt    DateTime     @default(now())
  submittedAt DateTime?
  seconds     Int?
  checkIns    OkrCheckIn[]

  @@index([userId, openedAt])
  @@index([submittedAt])
  @@map("okrCheckInSession")
}

model OkrCheckIn {
  id           String            @id @default(cuid())
  keyResultId  String
  keyResult    OkrKeyResult      @relation(fields: [keyResultId], references: [id], onDelete: Restrict)
  sessionId    String
  session      OkrCheckInSession @relation(fields: [sessionId], references: [id], onDelete: Restrict)
  weekStart    DateTime          @db.Date
  value        Decimal           @db.Decimal(18, 4)
  confidence   String
  note         String            @default("")
  authorUserId String
  ownerUserId  String
  onBehalf     Boolean           @default(false)
  channel      String            @default("web")
  createdAt    DateTime          @default(now())

  @@index([keyResultId, createdAt])
  @@index([weekStart])
  @@index([authorUserId])
  @@map("okrCheckIn")
}

model OkrComment {
  id           String        @id @default(cuid())
  objectiveId  String
  objective    OkrObjective  @relation(fields: [objectiveId], references: [id], onDelete: Restrict)
  keyResultId  String?
  keyResult    OkrKeyResult? @relation(fields: [keyResultId], references: [id], onDelete: SetNull)
  body         String
  authorUserId String
  createdAt    DateTime      @default(now())
  mentions     OkrMention[]

  @@index([objectiveId, createdAt])
  @@index([createdAt])
  @@map("okrComment")
}

model OkrMention {
  commentId String
  comment   OkrComment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  userId    String

  @@id([commentId, userId])
  @@index([userId])
  @@map("okrMention")
}

model OkrFollow {
  objectiveId String
  objective   OkrObjective @relation(fields: [objectiveId], references: [id], onDelete: Cascade)
  userId      String
  createdAt   DateTime     @default(now())

  @@id([objectiveId, userId])
  @@index([userId])
  @@map("okrFollow")
}
```

Trên `OkrObjective` thêm `comments OkrComment[]` và `followers OkrFollow[]`; trên `OkrKeyResult` thêm `checkIns OkrCheckIn[]` và `comments OkrComment[]` (trường quan hệ, không cột SQL).

- [ ] **Step 2: Sinh `migration` và đọc lại**

Run: `cd packages/db && bunx prisma migrate dev --create-only --name okr_cap_nhat && bun run db:generate`
Đổi tên thư mục thành `20260927010000_okr_cap_nhat`. Đọc `migration.sql`: chỉ có `CREATE TABLE`, `CREATE INDEX`, `ALTER TABLE "okr…" ADD CONSTRAINT … FOREIGN KEY` trên năm bảng mới. Rồi `bun run db:test --reset` để cơ sở dữ liệu test nhận `migration`.

- [ ] **Step 3: Viết bài khuôn trước (đỏ)**

`packages/validation/test/okr-cap-nhat.spec.ts` — ma trận 12 đầu vào × parse và 6 kiểu × 3 giá trị:

```ts
import { describe, expect, test } from "bun:test";
import { KIEU_KR } from "../src/okr-kr";
import { guiCapNhatInput, kiemGiaTriTheoKieu } from "../src/okr-cap-nhat";
import { addCommentInput, followInput } from "../src/okr-trao-doi";

const muc = { keyResultId: "kr1", value: 3, confidence: "cao", note: "" };
const DAU_VAO = [
	["gui hop le", guiCapNhatInput, { sessionId: "s", items: [muc] }, true],
	["gui ghi chu 200", guiCapNhatInput, { sessionId: "s", items: [{ ...muc, note: "a".repeat(200) }] }, true],
	["gui ba muc", guiCapNhatInput, { sessionId: "s", items: [muc, { ...muc, keyResultId: "k2" }, { ...muc, keyResultId: "k3", confidence: "thap" }] }, true],
	["binh luan hop le", addCommentInput, { objectiveId: "o", body: "x", mentionUserIds: [] }, true],
	["binh luan co kr va nhac", addCommentInput, { objectiveId: "o", keyResultId: "k", body: "x", mentionUserIds: ["u"] }, true],
	["theo doi", followInput, { objectiveId: "o", on: true }, true],
	["tu tin la", guiCapNhatInput, { sessionId: "s", items: [{ ...muc, confidence: "rat-cao" }] }, false],
	["ghi chu 201", guiCapNhatInput, { sessionId: "s", items: [{ ...muc, note: "a".repeat(201) }] }, false],
	["body rong", addCommentInput, { objectiveId: "o", body: " ", mentionUserIds: [] }, false],
	["body 2001", addCommentInput, { objectiveId: "o", body: "a".repeat(2001), mentionUserIds: [] }, false],
	["thua seconds", guiCapNhatInput, { sessionId: "s", items: [muc], seconds: 1 }, false],
	["thua authorUserId", guiCapNhatInput, { sessionId: "s", items: [muc], authorUserId: "x" }, false],
] as const;

describe("okr-cap-nhat khuon", () => {
	test("ma tran 12 dau vao x parse", () => {
		const thuc = DAU_VAO.map(([ten, khuon, vao]) => [ten, khuon.safeParse(vao).success]);
		expect(thuc).toEqual(DAU_VAO.map(([ten, , , mong]) => [ten, mong]));
	});

	test("6 kieu x 3 gia tri", () => {
		const MONG = {
			"tang-toi": [null, null, null],
			"giam-xuong": [null, null, null],
			"giu-tren": [null, null, null],
			"giu-duoi": [null, null, null],
			moc: ["moc-chi-0-1", "moc-chi-0-1", "moc-chi-0-1"],
			"phan-tram": ["phan-tram-ngoai-0-100", null, "phan-tram-ngoai-0-100"],
		} as const;
		for (const kieu of KIEU_KR) {
			expect([-1, 0.5, 101].map((v) => kiemGiaTriTheoKieu(kieu, v)), kieu).toEqual([...MONG[kieu]]);
		}
		expect([kiemGiaTriTheoKieu("moc", 0), kiemGiaTriTheoKieu("moc", 1)]).toEqual([null, null]);
	});
});
```

Run: `cd packages/validation && bun test test/okr-cap-nhat.spec.ts` → FAIL (không có mô-đun).

- [ ] **Step 4: Hai khuôn**

```ts
// packages/validation/src/okr-cap-nhat.ts
import { z } from "zod";
import { type KieuKr, soKr } from "./okr-kr";

export const MUC_TU_TIN = ["cao", "vua", "thap"] as const;
export type MucTuTin = (typeof MUC_TU_TIN)[number];
export const LOI_VAO = ["nhac", "viec-cua-toi", "tab", "sheet"] as const;
export type LoiVao = (typeof LOI_VAO)[number];
export const KENH_CAP_NHAT = ["web"] as const;
export const GHI_CHU_TOI_DA = 200;
const ma = z.string().trim().min(1).max(120);

export const mucCapNhat = z
	.object({
		keyResultId: ma,
		value: soKr,
		confidence: z.enum(MUC_TU_TIN),
		note: z.string().trim().max(GHI_CHU_TOI_DA),
	})
	.strict();
export const moCapNhatInput = z.object({ entry: z.enum(LOI_VAO) }).strict();
export const guiCapNhatInput = z
	.object({ sessionId: ma, items: z.array(mucCapNhat).min(1).max(50) })
	.strict();
export type GuiCapNhatInput = z.infer<typeof guiCapNhatInput>;

export type LoiGiaTri = "moc-chi-0-1" | "phan-tram-ngoai-0-100";
export function kiemGiaTriTheoKieu(kind: KieuKr, value: number): LoiGiaTri | null {
	if (kind === "moc" && value !== 0 && value !== 1) return "moc-chi-0-1";
	if (kind === "phan-tram" && (value < 0 || value > 100)) return "phan-tram-ngoai-0-100";
	return null;
}
```

```ts
// packages/validation/src/okr-trao-doi.ts
import { z } from "zod";

export const BINH_LUAN_TOI_DA = 2000;
const ma = z.string().trim().min(1).max(120);

export const commentsInput = z.object({ objectiveId: ma }).strict();
export const addCommentInput = z
	.object({
		objectiveId: ma,
		keyResultId: ma.optional(),
		body: z.string().trim().min(1).max(BINH_LUAN_TOI_DA),
		mentionUserIds: z.array(ma).max(20),
	})
	.strict();
export const followInput = z.object({ objectiveId: ma, on: z.boolean() }).strict();
export const transferOkrPreviewInput = z.object({ fromUserId: ma }).strict();
export const transferOkrInput = z.object({ fromUserId: ma, toUserId: ma }).strict();
```

`okr-vet.ts`: thêm `"cap-nhat-tuan", "binh-luan", "theo-doi", "bo-theo-doi", "chuyen-viec"` vào `HANH_DONG_VET`. `package.json` của validation: thêm `"./okr-cap-nhat"`, `"./okr-trao-doi"`.

Run: `cd packages/validation && bun test test/okr-cap-nhat.spec.ts` → PASS. Phá thử: bỏ `.strict()` ở `guiCapNhatInput` → ô «thua seconds» đỏ; trả lại.

- [ ] **Step 5: `dauTuanVN`**

Bài trước (`packages/db/test/dau-tuan-vn.spec.ts`): bảng viết trước `[Chủ nhật 2026-11-08T16:59:00Z → "2026-11-02", 2026-11-08T17:00:00Z (thứ Hai 00:00 VN) → "2026-11-09", 2026-11-11T05:00:00Z → "2026-11-09"]`. Rồi:

```ts
export function dauTuanVN(now: Date): string {
	const hom = Date.parse(`${ngayVN(now)}T00:00:00Z`);
	const thu = new Date(hom).getUTCDay();
	const lui = (thu + 6) % 7;
	return new Date(hom - lui * DAY_MS).toISOString().slice(0, 10);
}
```

Run: `cd packages/db && bun test test/dau-tuan-vn.spec.ts` → PASS.

- [ ] **Step 6: Dọn sàn test**

Trong `afterAll` của `apps/api/test/okr-san.ts`, trước khi xoá KR/mục tiêu: xoá `okrMention` (qua bình luận của mục tiêu sàn), `okrComment`, `okrFollow`, `okrCheckIn` theo `keyResult.objectiveId in mucTieu`, rồi `okrCheckInSession` theo `userId startsWith TIEN_TO`.

Run: `bun run test -- "cd apps/api && bun test test/okr.spec.ts test/okr-nhap.spec.ts test/okr-can-chinh.spec.ts"` → PASS (lượt 3 xanh nguyên).

- [ ] **Step 7: Răng `migration`** — `rang/cau-hinh.mjs` (`VONG = { truoc: <merge-base với origin/onehub>, sau: "HEAD" }`, `HO_SO_BI_CHAM = [...]` điền ở Task 10), `rang/migration-chi-them.mjs` chép khuôn `dat-okr-trong-crm/rang/migration-chi-them.mjs`, đổi đường suy gốc và thêm ba tệp giả chiều đỏ (DROP COLUMN; `ADD COLUMN x` trên `okrKeyResult`; model `Okr` xen giữa). Run: `node _acceptance/cap-nhat-tuan-okr/rang/migration-chi-them.mjs` → exit 0; phá thử từng tệp giả → exit 1 đúng thông điệp.

- [ ] **Step 8: Commit** `git add` đúng các tệp trên; `git commit -m "feat(okr): năm bảng cập nhật tuần, khuôn Zod, dauTuanVN"`.

---

### Task 2: API cập nhật tuần, ghi hộ, khoá số hiện tại, chặn xoá KR đã cập nhật

Phục vụ: E1, E3, E5, E20, E28; sửa E5 của `dat-okr-trong-crm`. **independent: false** (cần Task 1).

**Files:**
- Create: `apps/api/src/okr/okr-cap-nhat.service.ts`
- Modify: `okr-config.ts` (câu ghim), `okr.contracts.ts`, `okr.router.ts`, `okr.module.ts`, `okr.service.ts` (`updateKeyResult`, `removeKeyResult`, `docMucTieu` → cờ `hienTaiQuaCapNhat` trên KR), `src/generated/server.ts`
- Modify: `apps/api/test/okr.spec.ts` (bài `cong-bo`), `_acceptance/dat-okr-trong-crm/evals.yaml` (expected E5), `_acceptance/dat-okr-trong-crm/decisions.jsonl` (một dòng supersede theo khối lệnh ba dòng của feature-loop)
- Test: `apps/api/test/okr-cap-nhat.spec.ts` (các `describe`: `gui-lo`, `phien-giay`, `ghi-ho`, `xoa-kr-da-cap-nhat`, `hien-tai-khoa`)

**Interfaces:**
- Consumes: Task 1 (bảng, khuôn, `dauTuanVN`); `OkrAccessService.quyen`, `suaDuocDonVi`; `OkrService.assertKyGhiDuoc`, `vet`.
- Produces:
  - `OkrCapNhatService.capNhatTuan(userId: string, now?: Date): Promise<CapNhatTuanOutput>` — `{ items: { keyResultId, title, objectiveId, objectiveTitle, unitName, kind, unit, targetValue, currentValue, lastConfidence: MucTuTin | null, lastAt: string | null, updatedThisWeek: boolean }[], weekStart: string, dueWeekday: number | null }`.
  - `moCapNhat(userId, input, now?) → { sessionId: string }`.
  - `guiCapNhat(userId, input, now?) → { written: number, seconds: number }`.
  - `OKR.thongDiep.capNhat = { phienKhongCua, phienDaGui, khongPhaiChuHayTruong, mucTieuChuaCongBo, kyKhongChay, tuTinThieu, giaTri: Record<LoiGiaTri, string> }`, `OKR.thongDiep.hienTaiQuaCapNhat = "KR đang chạy — đổi số hiện tại bằng Cập nhật tuần."`, `OKR.thongDiep.krDaCapNhat = "KR đã có lần cập nhật — không xoá được. Hãy bỏ mục tiêu hoặc đổi tên KR."`.
  - `krOutput` thêm `hienTaiQuaCapNhat: boolean`.

- [ ] **Step 1: Bài trước (đỏ)** — `okr-cap-nhat.spec.ts` dùng `dungSan()`, `goi`, `kyDangChay`, `truongMoi`… của `okr-san.ts`. Viết đủ năm `describe` theo `expected` của E1, E3, E5, E20, E28 (ma trận viết trước là hằng trong bài; so mảng kết quả với mảng mong). Mốc giờ: service nhận `now` — bài gọi service qua `ungDung().get(OkrCapNhatService)` khi cần `now` cố định (E3), còn lại qua `goi`.

Run: `bun run test -- "cd apps/api && bun test test/okr-cap-nhat.spec.ts"` → FAIL.

- [ ] **Step 2: `guiCapNhat` — kiểm cả lô rồi mới ghi, một giao dịch**

```ts
async guiCapNhat(userId: string, input: GuiCapNhatInput, now = new Date()) {
	return this.db.$transaction(async (tx) => {
		await tx.$queryRaw`SELECT id FROM "okrCheckInSession" WHERE id = ${input.sessionId} FOR UPDATE`;
		const phien = await tx.okrCheckInSession.findUnique({ where: { id: input.sessionId } });
		if (!phien || phien.userId !== userId) throw new ForbiddenException(T.capNhat.phienKhongCua);
		if (phien.submittedAt) throw new BadRequestException(T.capNhat.phienDaGui);
		const krs = await tx.okrKeyResult.findMany({
			where: { id: { in: input.items.map((i) => i.keyResultId) } },
			include: { objective: { select: { ...chonDonVi, status: true, cycle: { select: { phase: true } } } } },
		});
		const q = await this.quyenOkr.quyen(userId);
		const ke = input.items.map((m) => {
			const kr = krs.find((k) => k.id === m.keyResultId);
			if (!kr) throw new NotFoundException(T.khongCoKr(m.keyResultId));
			if (kr.objective.status !== "cong-bo") throw new BadRequestException(T.capNhat.mucTieuChuaCongBo);
			if (kr.objective.cycle.phase !== "dang-chay") throw new BadRequestException(T.capNhat.kyKhongChay);
			const chu = kr.ownerUserId === userId;
			if (!chu && !this.quyenOkr.suaDuocDonVi(q, userId, donViCua(kr.objective)))
				throw new ForbiddenException(T.capNhat.khongPhaiChuHayTruong);
			const loi = kiemGiaTriTheoKieu(kieuKr.parse(kr.kind), m.value);
			if (loi) throw new BadRequestException(T.capNhat.giaTri[loi]);
			return { kr, m, onBehalf: !chu };
		});
		const tuan = new Date(`${dauTuanVN(now)}T00:00:00Z`);
		for (const { kr, m, onBehalf } of ke) {
			await tx.okrCheckIn.create({ data: { keyResultId: kr.id, sessionId: phien.id, weekStart: tuan, value: m.value, confidence: m.confidence, note: m.note, authorUserId: userId, ownerUserId: kr.ownerUserId, onBehalf } });
			await tx.okrKeyResult.update({ where: { id: kr.id }, data: { currentValue: m.value } });
			await this.okr.vet(tx, userId, "cap-nhat-tuan", { objectiveId: kr.objectiveId, keyResultId: kr.id }, { currentValue: soKrDb(kr.currentValue) }, { currentValue: m.value, confidence: m.confidence, onBehalf });
		}
		const seconds = Math.max(0, Math.floor((now.getTime() - phien.openedAt.getTime()) / GIAY_MS));
		await tx.okrCheckInSession.update({ where: { id: phien.id }, data: { submittedAt: now, seconds } });
		return { written: ke.length, seconds };
	});
}
```

`chonDonVi`, `donViCua` xuất từ `okr-access.service.ts` (nay là hằng/hàm nội bộ — đổi thành `export`). `GIAY_MS` đặt ở `OKR.thoiGian.giayMs` trong `okr-config.ts`. `moCapNhat` ghi `openedAt: now` tường minh (không để `@default(now())` của DB, để bài đặt được giờ).

- [ ] **Step 3: `capNhatTuan`** — đọc KR có `ownerUserId = userId`, mục tiêu `cong-bo`, chu kỳ `dang-chay`; lần gần nhất bằng `okrCheckIn.findMany({ where: { keyResultId: { in } }, orderBy: { createdAt: "desc" }, distinct: ["keyResultId"] })`; `updatedThisWeek` so `weekStart` với `dauTuanVN(now)`.

- [ ] **Step 4: Khoá số hiện tại** — trong `updateKeyResult`, sau khi đọc `kr` và trạng thái, TRƯỚC `ghiKhac`/`update`:

```ts
const dangChay = trangThai === "cong-bo" && (await this.phaCua(tx, kr.objectiveId)) === "dang-chay";
if (dangChay && input.currentValue !== undefined && input.currentValue !== soKr(kr.currentValue))
	throw new BadRequestException(T.hienTaiQuaCapNhat);
```

`docMucTieu` thêm `hienTaiQuaCapNhat: mt.status === "cong-bo" && mt.cycle.phase === "dang-chay"` cho từng KR.

- [ ] **Step 5: Chặn xoá** — `removeKeyResult`: `if (await tx.okrCheckIn.count({ where: { keyResultId: id } }) > 0) throw new BadRequestException(T.krDaCapNhat);` trước câu xoá.

- [ ] **Step 6: Router + module + sinh** — ba thủ tục `capNhatTuan` (Query, `GET /okr/check-ins/mine`), `moCapNhat` (Mutation, `POST /okr/check-in-sessions`), `guiCapNhat` (Mutation, `POST /okr/check-ins`); `OkrCapNhatService` vào `providers`. Run: `cd apps/api && bun run trpc:generate`.

- [ ] **Step 7: Sửa lượt 3** — bài `cong-bo` trong `okr.spec.ts`: lời gọi `{ id: k1, startValue: 10, targetValue: 60, currentValue: 30 }` tách thành `{ id: k1, startValue: 10, targetValue: 60 }` → 200 và `{ id: k1, currentValue: 30 }` → `400 ${T.hienTaiQuaCapNhat}`; khẳng định cuối thành `[10, 60, 20]`. Sửa `expected` E5 của `dat-okr-trong-crm` đúng câu hợp đồng Notes; nối dòng `supersedes` vào sổ của hồ sơ đó.

- [ ] **Step 8: Chạy + phá thử**

Run: `bun run test -- "cd apps/api && bun test test/okr-cap-nhat.spec.ts test/okr.spec.ts"` → PASS. Phá thử từng chiều đỏ của E1, E3, E5, E20, E28 trên bản sao (đổi tạm rồi `git checkout -- <tệp>` SAU khi đã commit phần lành — xem luật «phá-thử phải commit trước»).

- [ ] **Step 9: Commit** `feat(okr): cập nhật tuần qua phiên, ghi hộ, khoá số hiện tại của KR đang chạy`.

---

### Task 3: Việc cần nhắc OKR trong một hàm, một tin

Phục vụ: E8, E9, E10, E11, E15 (a). **independent: false** (cần Task 1; E11 gieo qua service của Task 2 và Task 4 — bài E11 viết ở Task 4 khi service có đủ).

**Files:**
- Create: `packages/db/src/okr-nhac.ts`; Modify: `packages/db/package.json` (`"./okr-nhac"`)
- Modify: `packages/db/src/onboarding-nhac.ts` (`ViecNhac` hợp; `viecCanNhac` gộp; `soSanh` theo thứ tự loại mới)
- Modify: `packages/validation/src/nhac-ke-hoach.ts` (`mucNhac` hợp khuôn)
- Modify: `apps/agent/agent/lib/tin-nhac.ts`, `apps/agent/agent/lib/nhac-ke-hoach.ts` (`maCua`, `duongMo` theo loại)
- Modify: `apps/api/src/dashboard/dashboard.service.ts` chỉ nếu `laNhacKeHoach` cần thu hẹp kiểu (không đổi hành vi)
- Test: `apps/agent/test/okr-nhac.integration.spec.ts` (`nhac-cap-nhat`, `nhac-im`, `mot-tin`, `chua-noi-kenh`), gieo bằng Prisma qua `apps/agent/test/support/okr-gieo.ts` (agent không phụ thuộc `apps/api`; cột gieo đúng cột mà `OkrCapNhatService` ghi — phép đo round-trip qua service thật là E4 ở Task 5)

**Interfaces — Produces:**

```ts
export const OKR_NHAC = { imNgay: 14, imNgayTruong: 21, suKienGio: 24 } as const;
export const LOAI_NHAC_OKR = ["okr-cap-nhat", "okr-kr-im", "okr-duoc-giao", "okr-nhac-ten", "okr-theo-doi"] as const;
export type LoaiNhacOkr = (typeof LOAI_NHAC_OKR)[number];
export type ViecOkr =
	| { loai: "okr-cap-nhat"; krIds: string[]; nhan: string; soKr: number }
	| { loai: "okr-kr-im"; keyResultId: string; objectiveId: string; nhan: string; soNgay: number; chuTen: string | null }
	| { loai: "okr-duoc-giao"; objectiveId: string; keyResultId?: string; nhan: string }
	| { loai: "okr-nhac-ten"; commentId: string; objectiveId: string; nhan: string; nguoiTen: string }
	| { loai: "okr-theo-doi"; objectiveId: string; nhan: string; capNhat: number; binhLuan: number };
export async function viecOkrCanNhac(db: Db, chon: { now: Date; userId?: string }): Promise<Map<string, ViecOkr[]>>;
export async function lienQuanOkr(db: Db, userId: string): Promise<boolean>;
```

Trong `onboarding-nhac.ts`: `export type ViecNhac = ViecKeHoach | ViecOkr` (đổi tên kiểu cũ thành `ViecKeHoach`, giữ trường cũ nguyên); `LOAI_NHAC` giữ bốn loại kế hoạch; thêm `THU_TU_NHAC = ["okr-cap-nhat", ...LOAI_NHAC, "okr-kr-im", "okr-duoc-giao", "okr-nhac-ten", "okr-theo-doi"] as const`; `viecCanNhac` gộp `gom(keHoach…)` với `viecOkrCanNhac` theo `userId`, lọc thành viên đang hoạt động một lần, sắp theo `THU_TU_NHAC`.

- [ ] **Step 1: Bài trước (đỏ)** — bốn `describe` theo `expected` E8, E9, E10, E15(a); giờ đặt bằng `setSystemTime` và truyền `now`. Người B (E10) có `ZaloLink`, không kế hoạch; Zalo giả qua `deps.zaloFetcher`.

Run: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/okr-nhac.integration.spec.ts"` → FAIL.

- [ ] **Step 2: `viecOkrCanNhac`** — một lượt đọc: chu kỳ `dang-chay` (`updateWeekday`), KR của mục tiêu `cong-bo` trong đó (kèm `publishedAt`, người phụ trách, đơn vị và trưởng), lần cập nhật gần nhất mỗi KR, vết `tao-kr`/`sua-kr`/`tao`/`sua`/`chuyen-viec` trong `suKienGio`, bình luận + nhắc tên trong `suKienGio`, theo dõi. Luật từng loại đúng bảng mục 5 thiết kế:
  - `okr-cap-nhat`: `ngayTrongTuan(now) >= updateWeekday` (thứ Hai = 1 … Chủ nhật = 7), KR có `publishedAt` trước `dauNgayVN(now)` và chưa có lần cập nhật `weekStart = dauTuanVN(now)`; một việc mỗi người, `krIds` theo thứ tự KR.
  - `okr-kr-im`: `soNgayVN(moc, now) >= imNgay` với `moc` = lần cập nhật gần nhất hoặc `publishedAt`; người trưởng khi `>= imNgayTruong` — trưởng phòng ban (mục tiêu cấp phòng ban hoặc phòng ban chính của người phụ trách cho cấp cá nhân), không có thì trưởng bộ phận; bỏ nếu trưởng = người phụ trách.
  - `okr-duoc-giao`, `okr-nhac-ten`, `okr-theo-doi`: người làm ≠ người nhận.
- [ ] **Step 3: Gộp vào `viecCanNhac`** và `lenLichNhac` duyệt tập người từ Map gộp (người chỉ có OKR có hàng).
- [ ] **Step 4: Payload** — `mucNhac` thành:

```ts
export const mucNhac = z.union([
	z.object({ loai: z.enum(LOAI_NHAC), planId: ma, stepId: ma.optional() }).strict(),
	z.object({ loai: z.literal("okr-cap-nhat"), krIds: z.array(ma).min(1) }).strict(),
	z.object({ loai: z.enum(["okr-kr-im"]), keyResultId: ma }).strict(),
	z.object({ loai: z.literal("okr-duoc-giao"), objectiveId: ma, keyResultId: ma.optional() }).strict(),
	z.object({ loai: z.literal("okr-nhac-ten"), commentId: ma }).strict(),
	z.object({ loai: z.literal("okr-theo-doi"), objectiveId: ma }).strict(),
]);
```

- [ ] **Step 5: Dựng tin** — `tin-nhac.ts`: tiêu đề nhóm cho năm loại OKR («Cập nhật tuần», «KR im», «Được giao», «Nhắc tên», «Đang theo dõi»); câu chào: không có việc OKR → giữ chuỗi cũ nguyên văn; có → `Chào ${ten}, sáng nay có ${n} việc cần bạn để ý.`; trần `NHAC.tran` và `tranKyTu` áp chung (vòng cắt hiện có). `lienKet` thành `(v: ViecNhac) => string | null`: kế hoạch `?record=plan:<id>`, `okr-cap-nhat` → `/<slug>/okr/cap-nhat-tuan?tu=nhac`, còn lại `/<slug>/okr?record=objective:<id>`.
- [ ] **Step 6: Chạy** agent test mới + `nhac-ke-hoach.integration.spec.ts` + `nhac-qua-zalo.integration.spec.ts` + `noi-zalo-cho-nguoi-moi.integration.spec.ts` + `apps/api/test/han-viec.spec.ts` + `moi-phia-ke-hoach.spec.ts` → PASS. Phá thử các chiều đỏ E8–E10.
- [ ] **Step 7: Commit** `feat(nhac): việc OKR trong một tin buổi sáng`.

---

### Task 4: Trao đổi, theo dõi, việc của tôi, cờ liên quan OKR, chuyển OKR

Phục vụ: E11, E12, E15 (b), E17, E22, E24. **independent: false** (cần Task 1–3).

**Files:**
- Create: `apps/api/src/okr/okr-trao-doi.service.ts`
- Modify: `okr.contracts.ts` (`commentOutput`, `viecCuaToiOutput`, `transferOkrOutput`; `mucTieuOutput` thêm `following`, `followerCount`, `theoDoi`), `okr.router.ts`, `okr.module.ts`, `okr-config.ts`, `okr.service.ts` (`mine` gồm mục tiêu theo dõi, `objective` trả `following`), `generated/server.ts`
- Test: `apps/api/test/okr-cap-nhat.spec.ts` (`trao-doi`, `viec-cua-toi`, `chua-noi-kenh`, `chuyen-okr`, `chi-okr`); `apps/agent/test/okr-nhac.integration.spec.ts` (`su-kien` — gieo sự kiện bằng Prisma đúng cột mà service ghi, kèm một ca round-trip gọi service qua `apps/api` trong bài `viec-cua-toi`)

**Interfaces — Produces:**
- `okr.comments({objectiveId}) → { comments: { id, author: nguoiOkr, keyResultId, keyResultTitle, body, createdAt, mentions: nguoiOkr[] }[] }`
- `okr.addComment → { id }`; `okr.follow → { following: boolean, followerCount: number }`
- `okr.viecCuaToi() → { viec: ViecOkrOutput[], lienQuanOkr: boolean }` — `viec` = phần tử `loai` bắt đầu `okr-` của `viecCanNhac(db,{now,userId}).get(userId)`, cùng thứ tự; `lienQuanOkr` từ `lienQuanOkr(db, userId)` của Task 3.
- `okr.transferPreview({fromUserId}) → { kr: number, mucTieu: number }`; `okr.transferWork({fromUserId,toUserId}) → { kr, mucTieu }` — `yeuCauQuanTri` như `onboarding-ghi.ts`.

`lienQuanOkr` (Task 3 viết, Task 4 dùng):

```ts
export async function lienQuanOkr(db: Db, userId: string): Promise<boolean> {
	const chay = { phase: "dang-chay" };
	const [coChuKy, kr, mt, theo, truong] = await Promise.all([
		db.okrCycle.count({ where: chay }),
		db.okrKeyResult.count({ where: { ownerUserId: userId, objective: { status: { not: "da-bo" }, cycle: chay } } }),
		db.okrObjective.count({ where: { ownerUserId: userId, status: { not: "da-bo" }, cycle: chay } }),
		db.okrFollow.count({ where: { userId, objective: { cycle: chay } } }),
		Promise.all([
			db.department.count({ where: { headUserId: userId, archivedAt: null } }),
			db.division.count({ where: { headUserId: userId, archivedAt: null } }),
		]).then(([a, b]) => a + b),
	]);
	return kr + mt + theo > 0 || (coChuKy > 0 && truong > 0);
}
```

- [ ] **Step 1: Bài trước (đỏ)** theo `expected` E12 (ma trận 12 người), E15(b), E17, E22, E24; `su-kien` (E11) ở agent test.
- [ ] **Step 2: `addComment`** — kiểm mục tiêu tồn tại, `keyResultId` thuộc mục tiêu, mọi `mentionUserIds` là `member` của `WORKSPACE_ID`; một giao dịch ghi bình luận, nhắc tên, vết `binh-luan` với `after: { commentId, keyResultId, mentions: string[] }` (không `body`).
- [ ] **Step 3: `follow`** — `upsert`/`deleteMany`; vết chỉ khi đổi thật.
- [ ] **Step 4: `transferWork`** — một giao dịch: KR `ownerUserId = from` ở chu kỳ `lap-ke-hoach`/`dang-chay`; mục tiêu `ownerUserId = from` và `level != "ca-nhan"` cùng điều kiện pha; `okrParticipant` của `from` xoá; mỗi bản ghi một vết `chuyen-viec` `{ownerUserId: from} → {ownerUserId: to}`; `from === to` → 400; `to` không phải thành viên → 400.
- [ ] **Step 5: Router, module, sinh, chạy** — `bun run test -- "cd apps/api && bun test test/okr-cap-nhat.spec.ts test/vai-chi-okr.spec.ts test/moi-phia-ke-hoach.spec.ts"` và agent `-t su-kien` → PASS; phá thử chiều đỏ.
- [ ] **Step 6: Commit** `feat(okr): trao đổi, theo dõi, việc của tôi, chuyển OKR`.

---

### Task 5: Đường đo — ba câu truy vấn gieo qua service thật

Phục vụ: E4. **independent: true** so với Task 6–9 (chỉ cần Task 2–4).

**Files:** Create `_acceptance/cap-nhat-tuan-okr/rang/duong-do.mjs`, `ty-le-cap-nhat-tuan.sql`, `trung-vi-giay.sql`, `nguoi-noi-kenh-nhan-tin.sql`.

- [ ] **Step 1:** `ty-le-cap-nhat-tuan.sql` — tham số `$1` tuần bắt đầu (`date`); mẫu số: KR mục tiêu `cong-bo`, chu kỳ `dang-chay`, `publishedAt < $1 + 7`; nhóm theo `orgPlacement.primaryDepartmentId` của người phụ trách (null → `chua-xep`); tử số: `COUNT(DISTINCT k.id) FILTER (WHERE EXISTS (SELECT 1 FROM "okrCheckIn" c WHERE c."keyResultId" = k.id AND c."weekStart" = $1))`.
- [ ] **Step 2:** `trung-vi-giay.sql` — `percentile_cont(0.5) WITHIN GROUP (ORDER BY seconds)` trên phiên `submittedAt IS NOT NULL` trong khoảng.
- [ ] **Step 3:** `nguoi-noi-kenh-nhan-tin.sql` — người có KR đang chạy và (`zaloLink` hoặc `slackMemberMatch`), không có `agentTask` `nhac-ke-hoach` ngày đó với `outcome LIKE 'da-gui%'` và `payload->'daGui' @> '[{"loai":"okr-cap-nhat"}]'`.
- [ ] **Step 4:** `duong-do.mjs` — suy gốc từ `import.meta.url`; tạo DB tạm, `prisma migrate deploy`, dựng `AppModule` (như `okr-san.ts`), gieo qua `OkrCapNhatService.guiCapNhat` với `now` đặt tay, gieo hàng nhắc B1/B2 bằng `agentTask.create` (hàng máy ghi, khuôn qua `nhacPayload.parse` trước khi ghi); chạy ba câu, so ma trận viết trước; năm tệp SQL giả trong tmpdir cho chiều đỏ; drop DB. Run: `bun _acceptance/cap-nhat-tuan-okr/rang/duong-do.mjs` → exit 0.
- [ ] **Step 5: Commit** `test(cap-nhat-tuan-okr): ba câu đường đo`.

---

### Task 6: Màn «Cập nhật tuần»

Phục vụ: E6, E7 (và nền cho E13, E14, E16). **independent: false** (cần Task 2; `Item` cài ở đây).

**Files:**
- Create: `packages/ui/src/components/item.tsx` (`cd packages/ui && bun run ui:add item --dry-run`, rồi thật; sửa bốn chỗ theo `docs/reui.md` nếu CLI đổi import; không đè tệp nào)
- Create: `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/page.tsx` (server: `requireSession`, prefetch `okr.capNhatTuan`), `cap-nhat-tuan.tsx` (client)
- Modify: `okr/thanh-tab.tsx` (`TAB` bốn phần tử, `DUONG["cap-nhat-tuan"] = "/okr/cap-nhat-tuan"`), `okr-search-params.ts` (`tu` = `parseAsStringLiteral(LOI_VAO)`), `apps/app/lib/messages/okr.ts`, `apps/app/lib/search-param-keys.ts`

**Hành vi (đúng bảng trạng thái thiết kế):**
- Mở phiên: **server page tạo phiên** (không `useEffect` — skill `no-use-effect` của kho) sau khi prefetch danh sách thành công và danh sách không rỗng: `await caller.okr.moCapNhat({ entry })` → prop `sessionId`. Tải lại trang = phiên mới (đúng: một lần mở màn). «Gửi lại» dùng cùng `sessionId`.
- Ô số: `docSoOkr` của `@crm/validation/okr-kr` (đã có, nhận dấu phẩy); KR mốc `ToggleGroup` hai nút.
- Danh sách: `Item` trong `Card`; thanh gửi dính đáy `aria-live="polite"`; nút «Gửi N cập nhật», spinner khi gửi; lỗi → `Alert` + ô còn nguyên + «Gửi lại N cập nhật»; xong → tóm tắt «Đã gửi N cập nhật lúc HH:MM · mất S giây» (`S` từ phản hồi máy chủ).
- Rỗng/tải/lỗi: `Empty`, `Skeleton`, `Empty` + «Thử lại».

- [ ] **Step 1:** Cài `item`; chạy `bun run check-types`.
- [ ] **Step 2:** Tab và route; màn theo bản mẫu `ban-mau-okr/cap-nhat-tuan.tsx` (đổi `ul divide-y` → `Item`, chữ phụ → `FieldDescription`).
- [ ] **Step 3:** Chạy app/api cây này ở 3920/3921, mở `/okr/cap-nhat-tuan`, tự kiểm tám trạng thái bằng mắt (ảnh vào scratchpad, không vào hồ sơ).
- [ ] **Step 4:** `bun run check-types && bun run lint && bun run lint:slop` → xanh. Commit `feat(okr): màn Cập nhật tuần`.

---

### Task 7: Thẻ việc OKR ở ba chỗ

Phục vụ: E13, E14, E16. **independent: true** so với Task 8, 9 (cần Task 4, 6).

**Files:** Create `apps/app/app/(app)/[slug]/okr/viec-cua-toi.tsx` (client, nhận `hienKhiRong: boolean`, `anKhiLoi: boolean`); Modify `dashboard-summary.tsx` (vai đầy đủ: `hienKhiRong=false`, render chỉ khi `lienQuanOkr`, lỗi → ẩn), `tong-quan-chi-okr.tsx` (server prefetch `okr.viecCuaToi`; thẻ `hienKhiRong`), `okr/cua-toi.tsx` (khối «Việc của tôi» đầu tab), `lib/messages/okr.ts`, `lib/messages/tong-quan.ts`.

- Mỗi dòng: `Item` có biểu tượng theo loại, câu theo loại, nút đích — `okr-cap-nhat` → `Link` `/okr/cap-nhat-tuan?tu=viec-cua-toi`; khác → mở sheet mục tiêu qua cách `RecordLink kind="objective"` của lượt 3. Thẻ mang `data-the-viec-okr`.
- [ ] Steps: dựng → kiểm bằng mắt ba chỗ với người có việc, người vai «chỉ OKR» không việc, người vai đầy đủ không dính → năm lệnh kiểm → commit `feat(okr): thẻ việc OKR`.

---

### Task 8: Sheet mục tiêu — Trao đổi, Theo dõi, cập nhật một KR, ô Hiện tại chỉ đọc

Phục vụ: E18, E19, E29. **independent: true** so với Task 7, 9 (cần Task 2, 4, 6).

**Files:** Create `apps/app/components/crm/record-sheet/objective-trao-doi.tsx`, `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx`; Modify `objective-sheet.tsx` (tab thứ tư «Trao đổi», nút «Theo dõi» ngoài nhánh `ghiDuoc`, mục «Cập nhật» trong `MenuKr` khi `kr.laCuaToi || mt.canEdit`), `okr/hop-thoai-kr.tsx` (ô «Hiện tại» `readOnly` + `data-o-hien-tai` + `FieldDescription` có `Link` «Cập nhật tuần» khi `kr.hienTaiQuaCapNhat`; không gửi `currentValue` khi khoá), `lib/messages/okr.ts`.

- Khung soạn: `Textarea`, `Select` KR (tuỳ chọn), `Combobox` một lựa chọn thêm chip `Badge` có nút gỡ (`aria-label`), nút «Gửi»; lỗi dưới khung, chữ còn nguyên. Mỗi bình luận `Item` với `data-binh-luan`, nội dung `translate="no"`.
- Hộp một KR: gọi `okr.moCapNhat({entry:"sheet"})` khi mở hộp, ba ô như màn tuần; người không phụ trách thấy «Bạn ghi hộ <tên>».
- [ ] Steps: dựng → kiểm bằng mắt cạnh sheet Thoả thuận ở 1440/390 → năm lệnh kiểm → commit `feat(okr): trao đổi, theo dõi, cập nhật một KR trên sheet`.

---

### Task 9: Mục «Chuyển OKR…» ở Thành viên

Phục vụ: E23. **independent: true** so với Task 7, 8 (cần Task 4).

**Files:** Create `apps/app/app/(app)/[slug]/settings/members/chuyen-okr-dialog.tsx` (cùng hình `chuyen-viec-dialog.tsx`, gọi `okr.transferPreview`/`okr.transferWork`); Modify `members-table.tsx` (mục menu ngay dưới «Chuyển việc 30 ngày…», chỉ quản trị), `lib/messages/okr.ts`.

- [ ] Steps: dựng → kiểm «Chuyển việc 30 ngày…» không đổi (`apps/app/test/moi-phia-ke-hoach.dom.tsx` xanh) → commit `feat(okr): chuyển OKR khi người nghỉ`.

---

### Task 10: Răng màn thật, cổng thiết kế, hồ sơ bị chạm, tài liệu, năm lệnh

Phục vụ: E6, E7, E13, E14, E16, E18, E19, E21, E23, E25, E26, E29. **independent: false** (cuối cùng).

**Files:**
- Create: `_acceptance/cap-nhat-tuan-okr/rang/man-cap-nhat.mjs` (khuôn `dat-okr-trong-crm/rang/man-okr.mjs`: cảnh cây trước màn đầu, gieo qua API thật, `dev:session`, puppeteer-core qua `createRequire`, ảnh vào `.acceptance-runs/cap-nhat-tuan-okr/evidence/`, SQL thẳng `DATABASE_URL` của cây cho các eval `backend-effect`, bước và chiều đỏ đúng từng eval)
- Create: `rang/san-thiet-ke.mjs` (khuôn `dat-okr-trong-crm`, thêm `<ul`, `<li` trên dòng mới, khẳng định nhập `Item` ở ba tệp danh sách, chiều đỏ)
- Create: `rang/ho-so-bi-cham.mjs`; điền `HO_SO_BI_CHAM` trong `rang/cau-hinh.mjs` bằng tập máy rút; sửa thiết kế mục 10 cho khớp
- Modify: `docs/api.md` (mục OKR: cập nhật tuần, trao đổi, chuyển OKR, khoá số hiện tại), `docs/agent.md` (mục Nhắc buổi sáng: loại OKR, hợp khuôn payload), `CONTEXT.md` (mục «Theo dõi (mục tiêu)», «Trao đổi (OKR)» — chữ trên tab)

- [ ] **Step 1:** Dựng app/api cây này: `cd apps/api && PORT=3921 bun run dev` và `cd apps/app && PORT=3920 NEXT_PUBLIC_API_URL=http://localhost:3921 bun run dev` (nền, PATH Node 24); đăng nhập `cd apps/api && bun run dev:session phanlemanh@gmail.com`.
- [ ] **Step 2:** Viết `man-cap-nhat.mjs`, chạy `APP_URL=http://localhost:3920 API_URL=http://localhost:3921 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/cap-nhat-tuan-okr/rang/man-cap-nhat.mjs"` → exit 0; phá thử một chiều đỏ mỗi eval ui (commit phần lành trước).
- [ ] **Step 3:** `san-thiet-ke.mjs`, `ho-so-bi-cham.mjs` → exit 0 và chiều đỏ.
- [ ] **Step 4:** Tài liệu và từ điển.
- [ ] **Step 5:** Năm lệnh, tuần tự, PATH Node 24: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` → xanh.
- [ ] **Step 6:** `scripts/pre-merge-check.sh --base origin/onehub` (không `--slug`); vẽ lại `PRODUCT-MAP.md` bằng `product-map.mjs --root .`.
- [ ] **Step 7:** Contract `status: implemented`; commit; sinh `s4-args.json` bằng `s4-args.mjs --diff-base origin/onehub` (KHÔNG chạy S4 — điều phối 2026-09-25).

---

## Self-review

- **Độ phủ spec:** mục 1–3 → Task 1, 2, 4; mục 4 quyền → Task 2 (ghi hộ), Task 4 (bình luận, chuyển); mục 5 một hàm → Task 3, 4, 7; mục 6 → Task 4, 8; mục 6b → Task 2, 8; mục 7 → Task 4, 9; Đặc tả UX → Task 6–9; mục 8 bậc thang → Task 6 (`Item`), Task 10 (E25/E26); mục 10 → Task 2 (sửa lượt 3), Task 10 (tập máy rút). AC-1…AC-16 đều có task.
- **Không chỗ trống:** các task giao diện (6–9) mô tả hành vi và tệp thay vì chép trọn JSX — thành phần và bản mẫu gốc đã nêu tên; mã server và khuôn có đủ.
- **Kiểu nhất quán:** `lienQuanOkr` (Task 3 viết, Task 4 dùng); `hienTaiQuaCapNhat` (câu ghim và cờ KR, Task 2; màn, Task 8); `LOI_VAO` (Task 1; `?tu=` ở Task 6; `entry` ở Task 2).
- **Review Focus:** năm dòng, mỗi dòng có bài ở task sở hữu.
