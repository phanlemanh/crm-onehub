# Cây tổ chức có người — lượt 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CRM có cây tổ chức hai cấp (bộ phận chứa phòng ban) có người, có trưởng, quản lý trực tiếp suy được, dựng ở Cài đặt › Tổ chức bằng tay hoặc nhập từ bảng tính; Điều phối 30 ngày đổi nhãn và lọc theo bộ phận.

**Architecture:** Một `migration` chỉ thêm (bảng `division`, `orgPlacement`, `orgSecondaryDepartment`; hai cột mới trên `department`). Mô-đun API mới `apps/api/src/to-chuc` (router `org`) giữ ba lõi thuần có thể kiểm riêng — dựng cây và độ phủ (`cay.ts`), suy quản lý (`quan-ly.ts`), phân tích lô nhập (`nhap.ts`) — và một dịch vụ đọc/ghi Prisma. Màn Next mới ở `settings/organization` đọc `org.tree` và gọi `org.*` cùng các thủ tục lưu trữ phòng ban sẵn có của `onboarding.*`.

**Tech Stack:** Bun, Turbo, NestJS + nestjs-trpc, Prisma (Postgres), zod, Next.js (App Router), React Query, nuqs, `@crm/ui` (shadcn), bun:test + JSDOM, puppeteer-core.

**Spec:** `docs/superpowers/specs/2026-09-24-cau-truc-to-chuc-design.md` · hợp đồng `_acceptance/cau-truc-to-chuc/contract.md` · phép đo `_acceptance/cau-truc-to-chuc/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Không sửa `packages/ui`; chỉ dùng thành phần có sẵn, nhập theo subpath `@crm/ui/components/<tên>`.
- Client component không nhập `@crm/db`, `@crm/auth`.
- Hằng số chỉnh được ở `apps/api/src/to-chuc/to-chuc-config.ts` (một object `TO_CHUC`, `as const`).
- `migration` chỉ thêm: không `UPDATE`/`DELETE`/`DROP`/`ALTER COLUMN`/`RENAME`, không `NOT NULL` không `DEFAULT` trên bảng đã có, không ràng buộc hay chỉ mục duy nhất trên bảng đã có.
- Tên đơn vị: cắt khoảng trắng, 1–80 ký tự; trùng tên cùng cấp (không phân biệt hoa thường, chỉ đơn vị chưa lưu trữ) bị từ chối — áp ở thủ tục `org.*`.
- Nhập: tối đa 1000 dòng, dán (tab) hoặc `.csv` (dấu phẩy); lỗi cặp đánh hỏng MỌI dòng trong cặp; ghi gửi lại chữ gốc; ghi dòng hợp lệ trong một `transaction`.
- Quản lý trực tiếp: chọn tay (còn hiệu lực, khác mình) → trưởng phòng ban chính (khác mình) → trưởng bộ phận của phòng ban chính (khác mình) → không có.
- Người đã rời workspace: lọc ở phép đọc theo hàng `member`; không sửa `workspace.removeMember`.
- Chữ trên màn theo `CONTEXT.md`: «bộ phận» = cấp trên, «phòng ban» = cấp dưới; ô «Mục tiêu» của sheet kế hoạch → «Thời lượng» / «Duration».
- Tên người, tên đơn vị, email mang `translate="no"`.
- Mọi phép đo ghi trong `evals.yaml` gọi qua khoá `config:` đã có trong `_acceptance/config.yaml` (khoá `ttc_*`); tên `describe`/`test` phải khớp chuỗi `-t` của khoá đó.
- Năm lệnh chứng xanh trước khi đẩy: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

## Review Focus

- Danh sách nhân sự thật dán từ Google Sheets có dòng trống giữa, khoảng trắng thừa, email viết hoa: dòng trống bị bỏ, email so không phân biệt hoa thường, ô được cắt khoảng trắng (Task 5 test `nhap-khoang-trang`).
- Phòng ban cũ trùng tên nhau trên production (một đã lưu trữ): nhập khớp phòng ban chưa lưu trữ, không chọn nhầm cái đã lưu trữ (Task 5 test `nhap-trung-ten-cu`).
- Trưởng một phòng ban bị gỡ khỏi phòng ban đó (đổi phòng ban chính sang chỗ khác): phòng ban phải hiện «Chưa có trưởng» chứ không giữ trưởng ngoài phòng ban (Task 3 test `truong-roi-phong-ban`).
- Ô CSV có dấu phẩy trong tên (`"Kinh doanh, vùng 1"`): phải đọc thành một ô (Task 5 test `nhap-csv-ngoac-kep`).
- Quản trị tự gỡ phòng ban chính của chính mình khi đang làm trưởng bộ phận: quản lý của người khác không đổi sai (Task 3 test `quan-ly` bảng bảy dòng đã phủ nhánh trưởng bộ phận).

## Rủi ro chính — hai hồ sơ đã ký phải ghim lại

Hợp đồng đã duyệt (AC-12, quyết định d-…-3) dời danh sách phòng ban khỏi Cài đặt › Điều phối 30 ngày. Hai hồ sơ đã ký đo đúng danh sách đó bằng bài kiểm DOM có tên cố định trong `_acceptance/config.yaml`:

| Hồ sơ | Khoá | Bài kiểm (`-t`) |
|---|---|---|
| `sua-luu-tru-dieu-phoi` | `slt_doi_ten_bo_phan` · `slt_sap_bo_phan` · `slt_luu_tru_bo_phan` · `slt_bi_chan_luu_tru` · `slt_xoa_vinh_vien` · `slt_khoa_theo_quyen` | `apps/app/test/sua-luu-tru.dom.tsx` |
| `noi-bon-nut-dieu-phoi` | `nbn_them_bo_phan` · `nbn_chua_co_bo_phan` | `apps/app/test/noi-bon-nut.dom.tsx` |

Task 10 giữ nguyên TÊN `describe`/`test` và lời hứa hành vi, đổi chỗ gắn sang màn Tổ chức, rồi ghim lại hai hồ sơ bằng làn máy (`repin-lane.mjs`) với lý do «hành vi dời sang Cài đặt › Tổ chức (cau-truc-to-chuc AC-12)». Nếu một bài kiểm không còn giữ được lời hứa cũ, dừng và báo — không nới bài kiểm.

## File Structure

| Tệp | Trách nhiệm |
|---|---|
| `packages/db/prisma/schema.prisma` | Model `Division`, `OrgPlacement`, `OrgSecondaryDepartment`; cột `divisionId`, `headUserId` trên `Department`; quan hệ ngược trên `User` |
| `packages/db/prisma/migrations/20260925010000_cay_to_chuc/migration.sql` | SQL chỉ thêm |
| `packages/auth/src/organization.ts`, `index.ts` | `canManageOrganization` |
| `apps/api/src/to-chuc/to-chuc-config.ts` | `TO_CHUC` — giới hạn và câu lỗi ghim |
| `apps/api/src/to-chuc/to-chuc.contracts.ts` | zod đầu vào/đầu ra của `org.*` |
| `apps/api/src/to-chuc/quan-ly.ts` | Hàm thuần `quanLyTrucTiep` |
| `apps/api/src/to-chuc/cay.ts` | Hàm thuần `dungCay` (cây, người, độ phủ, lưu trữ) |
| `apps/api/src/to-chuc/nhap.ts` | Hàm thuần `phanTichLo` (tách dòng, tách ô, kiểm, lỗi cặp, tóm tắt) |
| `apps/api/src/to-chuc/to-chuc.service.ts` | Đọc ảnh chụp từ Prisma, ghi, kiểm quyền |
| `apps/api/src/to-chuc/to-chuc.router.ts`, `to-chuc.module.ts` | Router `org`, đăng ký Nest |
| `apps/api/src/onboarding/*` | Chặn lưu trữ/xoá hẳn phòng ban còn người; bộ lọc bộ phận của danh mục; chữ «phòng ban» trong câu lỗi |
| `apps/app/app/(app)/[slug]/settings/organization/*` | Màn Tổ chức |
| `apps/app/lib/messages/to-chuc.ts` | Chữ vi/en của màn Tổ chức |
| `apps/app/lib/messages/onboarding.ts`, `settings.ts`, `lib/cai-dat-dieu-huong.ts` | Đổi nhãn, mục thanh bên |
| `apps/app/app/(app)/[slug]/onboarding/*` | Bộ lọc «Bộ phận» |
| `apps/app/app/(app)/[slug]/settings/onboarding/*` | Bỏ danh sách phòng ban, trỏ sang Tổ chức |
| `apps/api/test/to-chuc*.spec.ts`, `apps/app/test/to-chuc.dom.tsx`, `apps/app/test/doi-nhan-phong-ban.dom.tsx` | Bài kiểm mới |
| `_acceptance/cau-truc-to-chuc/rang/*.mjs` | Bốn phép đo kịch bản |

Thứ tự: Task 1 → 2 → 3 → 4 → 5 → 6 phụ thuộc nhau (cùng dịch vụ). Task 7 (đổi nhãn) `independent: true`. Task 8, 9 cần Task 2–6. Task 10 cần Task 8. Task 11 cần tất cả.

---

### Task 1: Dữ liệu, `migration` chỉ thêm, vị từ quyền

Phục vụ E1 (dữ liệu cũ sau `migration`), E2 (`migration` chỉ thêm). `independent: false`.

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `User` ~dòng 50–66, `Department` ~1698–1711)
- Create: `packages/db/prisma/migrations/20260925010000_cay_to_chuc/migration.sql`
- Modify: `packages/auth/src/organization.ts:39-45`, `packages/auth/src/index.ts:35-49`
- Create: `_acceptance/cau-truc-to-chuc/rang/migration-chi-them.mjs`
- Create: `_acceptance/cau-truc-to-chuc/rang/migration-tren-du-lieu-cu.mjs`

**Interfaces:**
- Produces: Prisma models `division`, `orgPlacement`, `orgSecondaryDepartment`; `department.divisionId`, `department.headUserId`; `canManageOrganization(role: WorkspaceRole | null): boolean` từ `@crm/auth`.

- [ ] **Step 1: Viết phép đo `migration-chi-them.mjs` (đỏ trước)**

```js
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const THU_MUC = join(GOC, "packages/db/prisma/migrations");
const git = (...d) => execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();

const moc = git("merge-base", "HEAD", "origin/onehub");
const cu = new Set(
	git("ls-tree", "--name-only", `${moc}:packages/db/prisma/migrations`).split("\n"),
);
const BANG_CU = new Set(
	git("show", `${moc}:packages/db/prisma/schema.prisma`)
		.split("\n")
		.map((d) => d.match(/@@map\("([^"]+)"\)/)?.[1])
		.filter(Boolean),
);

function cauLenh(sql) {
	return sql
		.split("\n")
		.filter((d) => !d.trim().startsWith("--"))
		.join("\n")
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.split(";")
		.map((c) => c.replace(/\s+/g, " ").trim())
		.filter((c) => c !== "");
}

function bang(c) {
	return c.match(/(?:TABLE|ON)\s+"([^"]+)"/i)?.[1] ?? "";
}

export function viPham(c, bangCu) {
	const hoa = c.toUpperCase();
	if (/^(UPDATE|DELETE|DROP)\b/.test(hoa) || /\bDROP\b/.test(hoa)) return "DROP/UPDATE/DELETE";
	if (/ALTER COLUMN|RENAME/.test(hoa)) return "ALTER COLUMN/RENAME";
	const cu = bangCu.has(bang(c));
	if (cu && /ADD COLUMN/.test(hoa) && /NOT NULL/.test(hoa) && !/DEFAULT/.test(hoa)) return "ADD COLUMN NOT NULL";
	if (cu && /ADD CONSTRAINT/.test(hoa) && /\b(UNIQUE|CHECK)\b/.test(hoa)) return "ADD CONSTRAINT UNIQUE/CHECK";
	if (cu && /^CREATE UNIQUE INDEX/.test(hoa)) return "CREATE UNIQUE INDEX";
	const hopLe = [
		/^CREATE TABLE/,
		/^CREATE INDEX/,
		/^CREATE UNIQUE INDEX/,
		/^ALTER TABLE .* ADD COLUMN/,
		/^ALTER TABLE .* ADD CONSTRAINT .* FOREIGN KEY/,
	];
	return hopLe.some((m) => m.test(hoa)) ? null : `lenh la: ${c.slice(0, 40)}`;
}

function soi(thuMuc) {
	const moi = readdirSync(thuMuc).filter((t) => !cu.has(t) && t !== "migration_lock.toml");
	let dem = 0;
	const hong = [];
	for (const t of moi) {
		for (const c of cauLenh(readFileSync(join(thuMuc, t, "migration.sql"), "utf8"))) {
			dem += 1;
			const v = viPham(c, BANG_CU);
			if (v) hong.push(`migration khong chi them: ${v} (${t})`);
		}
	}
	return { moi, dem, hong };
}

if (process.argv[2] === "--chieu-do") {
	for (const [nhan, sql] of [
		["DROP COLUMN", 'ALTER TABLE "department" DROP COLUMN "name";'],
		["ADD COLUMN NOT NULL", 'ALTER TABLE "department" ADD COLUMN "x" TEXT NOT NULL;'],
		["UNIQUE", 'ALTER TABLE "department" ADD CONSTRAINT "u" UNIQUE ("name");'],
	]) {
		const tam = mkdtempSync(join(tmpdir(), "ttc-mig-"));
		const hop = cauLenh(sql).map((c) => viPham(c, BANG_CU));
		console.log(`${nhan}: ${hop.filter(Boolean).join(" | ") || "KHONG BAT"}`);
		writeFileSync(join(tam, "ghi-chu"), nhan);
	}
	process.exit(0);
}

const { moi, dem, hong } = soi(THU_MUC);
console.log(`migration moi: ${moi.join(", ") || "(khong co)"} · so cau lenh: ${dem}`);
if (moi.length === 0 || dem === 0) {
	console.log("KHONG DO DUOC: khong co migration moi nao so voi base");
	process.exit(2);
}
for (const h of hong) console.log(h);
process.exit(hong.length === 0 ? 0 : 1);
```

- [ ] **Step 2: Chạy, thấy «không đo được» (chưa có `migration`)**

Run: `node _acceptance/cau-truc-to-chuc/rang/migration-chi-them.mjs; echo $?`
Expected: dòng `KHONG DO DUOC …`, mã 2. Rồi `node _acceptance/cau-truc-to-chuc/rang/migration-chi-them.mjs --chieu-do` in ba dòng, dòng nào cũng có `migration khong chi them` hoặc tên vi phạm (không có `KHONG BAT`).

- [ ] **Step 3: Sửa `schema.prisma`**

Thêm vào cuối danh sách quan hệ của `model User` (trước `@@unique([email])`):

```prisma
  divisionsHeaded         Division[]               @relation("DivisionHead")
  departmentsHeaded       Department[]             @relation("DepartmentHead")
  orgPlacement            OrgPlacement?            @relation("OrgPlacement")
  managedPlacements       OrgPlacement[]           @relation("OrgManager")
  orgSecondaryDepartments OrgSecondaryDepartment[]
```

Thay `model Department` bằng:

```prisma
model Department {
  id       String @id @default(cuid())
  name     String
  position Int

  divisionId String?
  division   Division? @relation(fields: [divisionId], references: [id], onDelete: Restrict)
  headUserId String?
  head       User?     @relation("DepartmentHead", fields: [headUserId], references: [id], onDelete: SetNull)

  archivedAt       DateTime?
  steps            OnboardingStep[]
  primaryOf        OrgPlacement[]           @relation("PrimaryDepartment")
  secondaryMembers OrgSecondaryDepartment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([position])
  @@index([divisionId])
  @@map("department")
}

model Division {
  id       String @id @default(cuid())
  name     String
  position Int

  headUserId String?
  head       User?   @relation("DivisionHead", fields: [headUserId], references: [id], onDelete: SetNull)

  archivedAt  DateTime?
  departments Department[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([position])
  @@map("division")
}

model OrgPlacement {
  userId String @id
  user   User   @relation("OrgPlacement", fields: [userId], references: [id], onDelete: Cascade)

  primaryDepartmentId String?
  primaryDepartment   Department? @relation("PrimaryDepartment", fields: [primaryDepartmentId], references: [id], onDelete: Restrict)
  managerUserId       String?
  manager             User?       @relation("OrgManager", fields: [managerUserId], references: [id], onDelete: SetNull)

  updatedAt DateTime @updatedAt

  @@index([primaryDepartmentId])
  @@index([managerUserId])
  @@map("orgPlacement")
}

model OrgSecondaryDepartment {
  userId       String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now())

  @@id([userId, departmentId])
  @@index([departmentId])
  @@map("orgSecondaryDepartment")
}
```

- [ ] **Step 4: Sinh `migration`, đổi tên thư mục cho khớp tên cố định**

Run: `cd packages/db && bunx prisma migrate dev --create-only --name cay_to_chuc && cd ../..`
Rồi đổi tên thư mục vừa sinh thành `20260925010000_cay_to_chuc` (`mv packages/db/prisma/migrations/*_cay_to_chuc packages/db/prisma/migrations/20260925010000_cay_to_chuc`).
Expected: `migration.sql` chỉ gồm `CREATE TABLE` cho `division`, `orgPlacement`, `orgSecondaryDepartment`; `ALTER TABLE "department" ADD COLUMN "divisionId" TEXT, ADD COLUMN "headUserId" TEXT;`; `CREATE INDEX`; `ALTER TABLE … ADD CONSTRAINT … FOREIGN KEY`. Nếu Prisma sinh câu nào khác, dừng và báo.

- [ ] **Step 5: Chạy phép đo, xanh**

Run: `bun run db:generate --filter=@crm/db 2>/dev/null || (cd packages/db && bunx prisma generate); node _acceptance/cau-truc-to-chuc/rang/migration-chi-them.mjs; echo $?`
Expected: `migration moi: 20260925010000_cay_to_chuc · so cau lenh: N` (N > 0), mã 0.

- [ ] **Step 6: Viết `migration-tren-du-lieu-cu.mjs` (E1)**

```js
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DB_GOI = join(GOC, "packages/db");
const git = (...d) => execFileSync("git", ["-C", GOC, ...d], { encoding: "utf8" }).trim();

function coSo() {
	if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
	const dong = readFileSync(join(GOC, ".env"), "utf8").split("\n").find((d) => d.startsWith("TEST_DATABASE_URL="));
	return dong?.split("=").slice(1).join("=").replace(/"/g, "") ?? "";
}

const goc = coSo();
if (!goc) {
	console.log("KHONG DO DUOC: khong doc duoc TEST_DATABASE_URL");
	process.exit(2);
}
const ten = `crm_ttc_mig_${process.pid}_test`;
const url = goc.replace(/\/[A-Za-z0-9_]+(\?|$)/, `/${ten}$1`);
const quanTri = goc.replace(/\/[A-Za-z0-9_]+(\?|$)/, "/postgres$1");

function migrate(thuMucMigration) {
	const tam = mkdtempSync(join(tmpdir(), "ttc-prisma-"));
	cpSync(join(DB_GOI, "prisma/schema.prisma"), join(tam, "schema.prisma"));
	cpSync(thuMucMigration, join(tam, "migrations"), { recursive: true });
	const r = spawnSync("bunx", ["prisma", "migrate", "deploy", "--schema", join(tam, "schema.prisma")], {
		cwd: DB_GOI,
		env: { ...process.env, DATABASE_URL: url },
		encoding: "utf8",
	});
	rmSync(tam, { recursive: true, force: true });
	return r;
}

const chieuDo = process.argv[2] === "--chieu-do";
const moc = git("merge-base", "HEAD", "origin/onehub");
const cu = mkdtempSync(join(tmpdir(), "ttc-mig-cu-"));
execFileSync("sh", ["-c", `git -C "${GOC}" archive ${moc} packages/db/prisma/migrations | tar -x -C "${cu}"`]);
const thuMucCu = join(cu, "packages/db/prisma/migrations");
const moi = mkdtempSync(join(tmpdir(), "ttc-mig-moi-"));
cpSync(join(DB_GOI, "prisma/migrations"), moi, { recursive: true });
if (chieuDo) {
	execFileSync("sh", ["-c", `mkdir -p "${moi}/29990101000000_do" && printf 'ALTER TABLE "department" ADD COLUMN "x" TEXT NOT NULL;' > "${moi}/29990101000000_do/migration.sql"`]);
}

const qt = new pg.Client({ connectionString: quanTri });
await qt.connect();
await qt.query(`DROP DATABASE IF EXISTS "${ten}"`);
await qt.query(`CREATE DATABASE "${ten}"`);
let ma = 1;
try {
	const r1 = migrate(thuMucCu);
	if (r1.status !== 0) {
		console.log(`KHONG DO DUOC: migrate luoc do cu hong\n${r1.stdout}${r1.stderr}`);
		ma = 2;
	} else {
		const c = new pg.Client({ connectionString: url });
		await c.connect();
		await c.query(`INSERT INTO "company" ("id","name","createdAt","updatedAt") VALUES ('ttc-cty','ttc cty',now(),now())`);
		await c.query(`INSERT INTO "user" ("id","name","email","emailVerified","createdAt","updatedAt") VALUES ('ttc-u','ttc','ttc@thu.test',true,now(),now())`);
		const pb = [["pb0", "Kinh doanh", 0, null], ["pb1", "Kinh doanh", 3, "now()"], ["pb2", "Van hanh", 7, null], ["pb3", "Ke toan", 8, null], ["pb4", "Phap che", 12, null]];
		for (const [id, n, p, a] of pb) {
			await c.query(`INSERT INTO "department" ("id","name","position","archivedAt","createdAt","updatedAt") VALUES ($1,$2,$3,${a ?? "NULL"},now(),now())`, [id, n, p]);
		}
		await c.query(`INSERT INTO "onboardingPlan" ("id","companyId","startedAt","targetDays","ownerId","createdAt","updatedAt") VALUES ('kh1','ttc-cty',now(),30,'ttc-u',now(),now()),('kh2','ttc-cty',now(),30,'ttc-u',now(),now())`);
		const buoc = [["b1", "kh1", "pb0"], ["b2", "kh1", "pb0"], ["b3", "kh1", "pb2"], ["b4", "kh2", "pb1"], ["b5", "kh2", "pb3"], ["b6", "kh2", "pb3"]];
		for (const [i, [id, kh, pbId]] of buoc.entries()) {
			await c.query(`INSERT INTO "onboardingStep" ("id","planId","label","departmentId","dueAt","position","createdAt","updatedAt") VALUES ($1,$2,'buoc',$3,now(),$4,now(),now())`, [id, kh, pbId, i]);
		}
		const anh = async () => (await c.query(`SELECT d.id, d.name, d.position, d."archivedAt" IS NOT NULL AS luu, (SELECT count(*)::int FROM "onboardingStep" s WHERE s."departmentId"=d.id) AS buoc FROM "department" d ORDER BY d.id`)).rows;
		const truoc = await anh();
		await c.end();
		const r2 = migrate(moi);
		if (r2.status !== 0) {
			console.log(`migration do tren du lieu cu\n${r2.stdout}${r2.stderr}`.slice(0, 2000));
			ma = 1;
		} else {
			const c2 = new pg.Client({ connectionString: url });
			await c2.connect();
			const sau = (await c2.query(`SELECT d.id, d.name, d.position, d."archivedAt" IS NOT NULL AS luu, (SELECT count(*)::int FROM "onboardingStep" s WHERE s."departmentId"=d.id) AS buoc, d."divisionId", d."headUserId" FROM "department" d ORDER BY d.id`)).rows;
			const soPlacement = (await c2.query(`SELECT count(*)::int AS n FROM "orgPlacement"`)).rows[0].n;
			await c2.end();
			const hong = [];
			let khang = 0;
			for (const t of truoc) {
				const s = sau.find((x) => x.id === t.id);
				for (const k of ["name", "position", "luu", "buoc"]) {
					khang += 1;
					if (String(s?.[k]) !== String(t[k])) hong.push(`${t.id}.${k}: ${s?.[k]} != ${t[k]}`);
				}
			}
			khang += 3;
			if (sau.some((s) => s.divisionId !== null)) hong.push("co phong ban cu mang divisionId");
			if (sau.some((s) => s.headUserId !== null)) hong.push("co phong ban cu mang headUserId");
			if (soPlacement !== 0) hong.push(`orgPlacement ${soPlacement} != 0`);
			console.log(`khang-dinh=${khang}/23`);
			for (const h of hong) console.log(`HONG ${h}`);
			ma = khang === 23 && hong.length === 0 ? 0 : 1;
		}
	}
} finally {
	await qt.query(`DROP DATABASE IF EXISTS "${ten}"`);
	await qt.end();
	rmSync(cu, { recursive: true, force: true });
	rmSync(moi, { recursive: true, force: true });
}
process.exit(ma);
```

Nếu `INSERT` vào `company`, `user`, `onboardingPlan` hay `onboardingStep` thiếu cột `NOT NULL` của lược đồ ở `base_commit`, đọc `git show <base>:packages/db/prisma/schema.prisma` và thêm đúng cột đó — không đổi số khẳng định.

- [ ] **Step 7: Chạy E1 hai chiều**

Run: `bun _acceptance/cau-truc-to-chuc/rang/migration-tren-du-lieu-cu.mjs; echo $?` → `khang-dinh=23/23`, mã 0.
Run: `bun _acceptance/cau-truc-to-chuc/rang/migration-tren-du-lieu-cu.mjs --chieu-do; echo $?` → dòng `migration do tren du lieu cu`, mã 1.

- [ ] **Step 8: Thêm `canManageOrganization`**

Trong `packages/auth/src/organization.ts`, sau `canManageFields`:

```ts
export function canManageOrganization(role: WorkspaceRole | null): boolean {
	return isWorkspaceAdmin(role);
}
```

Trong `packages/auth/src/index.ts`, thêm `canManageOrganization,` vào khối export từ `"./organization"` (theo thứ tự chữ cái, sau `canManageOnboarding`).

- [ ] **Step 9: Kiểm kiểu và commit**

Run: `bun run check-types --filter=@crm/db --filter=@crm/auth`
Expected: không lỗi.

```bash
git add packages/db/prisma/schema.prisma packages/db/prisma/migrations/20260925010000_cay_to_chuc packages/auth/src/organization.ts packages/auth/src/index.ts _acceptance/cau-truc-to-chuc/rang/migration-chi-them.mjs _acceptance/cau-truc-to-chuc/rang/migration-tren-du-lieu-cu.mjs
git commit -m "feat(db): cây tổ chức — bộ phận, vị trí một người, phòng ban phụ; migration chỉ thêm"
```

---

### Task 2: Mô-đun `org` — cây, bộ phận, phòng ban, độ phủ

Phục vụ E1b, E3, E4 (phần bộ phận), E14. `independent: false`.

**Files:**
- Create: `apps/api/src/to-chuc/to-chuc-config.ts`, `to-chuc.contracts.ts`, `quan-ly.ts`, `cay.ts`, `to-chuc.service.ts`, `to-chuc.router.ts`, `to-chuc.module.ts`
- Modify: `apps/api/src/app.module.ts:31,89` (import + đăng ký `ToChucModule`)
- Modify: `apps/api/src/generated/server.ts` (sinh lại)
- Test: `apps/api/test/to-chuc.spec.ts`

**Interfaces:**
- Consumes: Task 1 models, `canManageOrganization`.
- Produces (router `org`): `access` → `{ canManage }`; `tree` → `TreeOutput`; `createDivision({name})`, `renameDivision({id,name})`, `reorderDivisions({ids})`, `archiveDivision({id})`, `restoreDivision({id})`, `purgeDivision({id})`, `createDepartment({name, divisionId})`, `renameDepartment({id,name})`, `moveDepartment({id, divisionId, index})`. Hàm thuần `dungCay(tho: CayTho): TreeOutput`, `quanLyTrucTiep(userId, ngCanh): QuanLy`.

- [ ] **Step 1: `to-chuc-config.ts`**

```ts
export const TO_CHUC = {
	ten: { toiDa: 80 },
	nhap: { toiDaDong: 1000, toiDaKyTu: 200_000 },
	thongDiep: {
		canQuyenQuanTri: "Cần quyền quản trị để sửa cây tổ chức.",
		tenTrong: "Tên không được để trống.",
		tenDai: (n: number) => `Tên dài quá ${n} ký tự.`,
		tenTrung: (ten: string) => `Đã có «${ten}» ở cấp này.`,
		khongCoBoPhan: (id: string) => `Không có bộ phận nào mang mã ${id}.`,
		khongCoPhongBan: (id: string) => `Không có phòng ban nào mang mã ${id}.`,
		boPhanDaLuuTru: "Bộ phận này đã lưu trữ — khôi phục trước.",
		phongBanDaLuuTru: "Phòng ban này đã lưu trữ — khôi phục trước.",
		boPhanConPhongBan: (n: number) =>
			`Bộ phận còn ${n} phòng ban — chuyển hoặc lưu trữ chúng trước.`,
		phongBanConNguoi: (n: number) =>
			`Còn ${n} người có phòng ban chính ở đây — chuyển họ trước.`,
		chuaLuuTru: "Chỉ xoá hẳn được đơn vị đã lưu trữ.",
		boPhanConTro: "Bộ phận còn phòng ban trỏ tới nên không xoá hẳn được.",
		phongBanConNguoiXoa: "Phòng ban còn người trỏ tới nên không xoá hẳn được.",
		khongPhaiThanhVien: (id: string) =>
			`Người ${id} không phải thành viên đang hoạt động.`,
		truongNgoaiPhongBan: "Trưởng phòng ban phải là người của phòng ban đó.",
		phuTrungChinh: "Phòng ban phụ không được trùng phòng ban chính.",
		quanLyLaChinhMinh: "Quản lý trực tiếp phải là người khác.",
		loQuaDai: (n: number) => `Lô có quá ${n} dòng — chia nhỏ rồi nhập lại.`,
		loRong: "Không có dòng nào để nhập.",
		khongDongHopLe: "Không có dòng hợp lệ nào để ghi.",
		nhap: {
			emailKhongPhaiThanhVien: "Email này chưa là thành viên CRM",
			emailLap: "Email này xuất hiện nhiều lần trong lô",
			thieuCot: "Thiếu email, phòng ban, hoặc bộ phận của trưởng bộ phận",
			phongBanBoPhanKhac: (pb: string, bp: string) =>
				`Phòng ban «${pb}» đang thuộc bộ phận «${bp}»`,
			phongBanHaiBoPhan: (pb: string) =>
				`Phòng ban «${pb}» mang hai bộ phận khác nhau trong lô`,
			truongLa: "Cột trưởng chỉ nhận «phòng ban», «bộ phận» hoặc để trống",
			haiTruong: (don: string) => `Hai người cùng làm trưởng «${don}» trong lô`,
		},
	},
} as const;
```

- [ ] **Step 2: `to-chuc.contracts.ts`**

```ts
import { z } from "zod";
import { TO_CHUC } from "./to-chuc-config";

const ma = z.string().trim().min(1).max(120);
const tenTho = z.string().max(500);

export const idInput = z.object({ id: ma });
export const divisionCreateInput = z.object({ name: tenTho });
export const renameInput = z.object({ id: ma, name: tenTho });
export const reorderInput = z.object({ ids: z.array(ma).min(1).max(200) });
export const departmentCreateInput = z.object({
	name: tenTho,
	divisionId: ma.nullable(),
});
export const departmentMoveInput = z.object({
	id: ma,
	divisionId: ma.nullable(),
	index: z.int().min(0).max(500),
});
export const headInput = z.object({
	kind: z.enum(["division", "department"]),
	id: ma,
	userId: ma.nullable(),
});
export const placementInput = z.object({
	userId: ma,
	primaryDepartmentId: ma.nullable(),
	secondaryDepartmentIds: z.array(ma).max(50),
	managerUserId: ma.nullable(),
});
export const importInput = z.object({
	text: z.string().max(TO_CHUC.nhap.toiDaKyTu),
});

export const nguoiOutput = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
});
export const nguoiTrongPhongBan = nguoiOutput.extend({ primary: z.boolean() });
export const phongBanNode = z.object({
	id: z.string(),
	name: z.string(),
	position: z.number(),
	divisionId: z.string().nullable(),
	head: nguoiOutput.nullable(),
	stepCount: z.number(),
	people: z.array(nguoiTrongPhongBan),
});
export const boPhanNode = z.object({
	id: z.string(),
	name: z.string(),
	position: z.number(),
	head: nguoiOutput.nullable(),
	departments: z.array(phongBanNode),
});
export const nguonQuanLy = z.enum([
	"chon-tay",
	"truong-phong-ban",
	"truong-bo-phan",
	"khong-co",
]);
export const viTriNguoi = nguoiOutput.extend({
	primaryDepartmentId: z.string().nullable(),
	secondaryDepartmentIds: z.array(z.string()),
	managerOverrideId: z.string().nullable(),
	manager: nguoiOutput.nullable(),
	managerSource: nguonQuanLy,
});
export const donViLuuTru = z.object({
	id: z.string(),
	name: z.string(),
	purgeable: z.boolean(),
});
export const treeOutput = z.object({
	divisions: z.array(boPhanNode),
	chuaXep: z.array(phongBanNode),
	chuaCoPhongBan: z.array(nguoiOutput),
	people: z.array(viTriNguoi),
	archived: z.object({
		divisions: z.array(donViLuuTru),
		departments: z.array(donViLuuTru),
	}),
	coverage: z.object({
		members: z.number(),
		withPrimary: z.number(),
		departmentsWithoutHead: z.number(),
	}),
});
export const accessOutput = z.object({ canManage: z.boolean() });
export const okOutput = z.object({ id: z.string() });
export const dongNhapOutput = z.object({
	line: z.number(),
	email: z.string(),
	department: z.string(),
	division: z.string(),
	head: z.string(),
	error: z.string().nullable(),
});
export const importPreviewOutput = z.object({
	rows: z.array(dongNhapOutput),
	summary: z.object({
		valid: z.number(),
		invalid: z.number(),
		newDepartments: z.number(),
		newDivisions: z.number(),
	}),
});
export const importApplyOutput = z.object({
	written: z.number(),
	newDepartments: z.number(),
	newDivisions: z.number(),
});

export type TreeOutput = z.infer<typeof treeOutput>;
export type NguoiOutput = z.infer<typeof nguoiOutput>;
export type NguonQuanLy = z.infer<typeof nguonQuanLy>;
export type PlacementInput = z.infer<typeof placementInput>;
export type HeadInput = z.infer<typeof headInput>;
export type DepartmentMoveInput = z.infer<typeof departmentMoveInput>;
export type DepartmentCreateInput = z.infer<typeof departmentCreateInput>;
export type ImportPreviewOutput = z.infer<typeof importPreviewOutput>;
export type ImportApplyOutput = z.infer<typeof importApplyOutput>;
```

- [ ] **Step 3: `quan-ly.ts` (hàm thuần)**

```ts
import type { NguonQuanLy } from "./to-chuc.contracts";

export type NgCanhQuanLy = {
	hieuLuc: ReadonlySet<string>;
	chonTay: ReadonlyMap<string, string>;
	phongBanChinh: ReadonlyMap<string, string>;
	truongPhongBan: ReadonlyMap<string, string>;
	boPhanCuaPhongBan: ReadonlyMap<string, string>;
	truongBoPhan: ReadonlyMap<string, string>;
};

export type QuanLy = { managerId: string | null; source: NguonQuanLy };

export function quanLyTrucTiep(userId: string, ng: NgCanhQuanLy): QuanLy {
	const hop = (id: string | undefined): id is string =>
		id !== undefined && id !== userId && ng.hieuLuc.has(id);
	const tay = ng.chonTay.get(userId);
	if (hop(tay)) return { managerId: tay, source: "chon-tay" };
	const pb = ng.phongBanChinh.get(userId);
	if (pb === undefined) return { managerId: null, source: "khong-co" };
	const truongPb = ng.truongPhongBan.get(pb);
	if (hop(truongPb)) return { managerId: truongPb, source: "truong-phong-ban" };
	const bp = ng.boPhanCuaPhongBan.get(pb);
	const truongBp = bp === undefined ? undefined : ng.truongBoPhan.get(bp);
	if (hop(truongBp)) return { managerId: truongBp, source: "truong-bo-phan" };
	return { managerId: null, source: "khong-co" };
}
```

- [ ] **Step 4: `cay.ts` (hàm thuần dựng cây và độ phủ)**

```ts
import { quanLyTrucTiep } from "./quan-ly";
import type { NguoiOutput, TreeOutput } from "./to-chuc.contracts";

export type CayTho = {
	members: NguoiOutput[];
	divisions: {
		id: string;
		name: string;
		position: number;
		headUserId: string | null;
		archivedAt: Date | null;
		departmentCount: number;
	}[];
	departments: {
		id: string;
		name: string;
		position: number;
		divisionId: string | null;
		headUserId: string | null;
		archivedAt: Date | null;
		stepCount: number;
	}[];
	placements: {
		userId: string;
		primaryDepartmentId: string | null;
		managerUserId: string | null;
	}[];
	secondaries: { userId: string; departmentId: string }[];
	departmentsInTemplates: ReadonlySet<string>;
};

const theoTen = (a: NguoiOutput, b: NguoiOutput) =>
	a.name.localeCompare(b.name, "vi");

export function dungCay(tho: CayTho): TreeOutput {
	const nguoi = new Map(tho.members.map((m) => [m.id, m]));
	const hieuLuc = new Set(nguoi.keys());
	const pbSong = tho.departments.filter((d) => d.archivedAt === null);
	const bpSong = tho.divisions.filter((d) => d.archivedAt === null);
	const pbSongIds = new Set(pbSong.map((d) => d.id));
	const bpSongIds = new Set(bpSong.map((d) => d.id));

	const chinh = new Map(
		tho.placements
			.filter((p) => hieuLuc.has(p.userId) && p.primaryDepartmentId !== null)
			.map((p) => [p.userId, p.primaryDepartmentId as string]),
	);
	const phu = tho.secondaries.filter(
		(s) => hieuLuc.has(s.userId) && pbSongIds.has(s.departmentId),
	);
	const thuocPb = (userId: string, pbId: string) =>
		chinh.get(userId) === pbId ||
		phu.some((s) => s.userId === userId && s.departmentId === pbId);
	const truongHop = (pbId: string, headUserId: string | null) =>
		headUserId !== null &&
		hieuLuc.has(headUserId) &&
		thuocPb(headUserId, pbId);

	const truongPb = new Map(
		pbSong
			.filter((d) => truongHop(d.id, d.headUserId))
			.map((d) => [d.id, d.headUserId as string]),
	);
	const truongBp = new Map(
		bpSong
			.filter((d) => d.headUserId !== null && hieuLuc.has(d.headUserId))
			.map((d) => [d.id, d.headUserId as string]),
	);
	const ngCanh = {
		hieuLuc,
		chonTay: new Map(
			tho.placements
				.filter((p) => p.managerUserId !== null)
				.map((p) => [p.userId, p.managerUserId as string]),
		),
		phongBanChinh: new Map(
			[...chinh].filter(([, pb]) => pbSongIds.has(pb)),
		),
		truongPhongBan: truongPb,
		boPhanCuaPhongBan: new Map(
			pbSong
				.filter((d) => d.divisionId !== null && bpSongIds.has(d.divisionId))
				.map((d) => [d.id, d.divisionId as string]),
		),
		truongBoPhan: truongBp,
	};

	const nodePb = (d: CayTho["departments"][number]) => ({
		id: d.id,
		name: d.name,
		position: d.position,
		divisionId: d.divisionId !== null && bpSongIds.has(d.divisionId) ? d.divisionId : null,
		head: nguoi.get(truongPb.get(d.id) ?? "") ?? null,
		stepCount: d.stepCount,
		people: [
			...[...chinh]
				.filter(([, pb]) => pb === d.id)
				.flatMap(([u]) => {
					const n = nguoi.get(u);
					return n ? [{ ...n, primary: true }] : [];
				})
				.sort(theoTen),
			...phu
				.filter((s) => s.departmentId === d.id)
				.flatMap((s) => {
					const n = nguoi.get(s.userId);
					return n ? [{ ...n, primary: false }] : [];
				})
				.sort(theoTen),
		],
	});
	const theoViTri = <T extends { position: number; name: string }>(a: T, b: T) =>
		a.position - b.position || a.name.localeCompare(b.name, "vi");

	const divisions = [...bpSong].sort(theoViTri).map((b) => ({
		id: b.id,
		name: b.name,
		position: b.position,
		head: nguoi.get(truongBp.get(b.id) ?? "") ?? null,
		departments: pbSong
			.filter((d) => d.divisionId === b.id)
			.sort(theoViTri)
			.map(nodePb),
	}));
	const chuaXep = pbSong
		.filter((d) => d.divisionId === null || !bpSongIds.has(d.divisionId))
		.sort(theoViTri)
		.map(nodePb);
	const coChinhSong = (u: string) => {
		const pb = chinh.get(u);
		return pb !== undefined && pbSongIds.has(pb);
	};
	const people = [...tho.members].sort(theoTen).map((m) => {
		const ql = quanLyTrucTiep(m.id, ngCanh);
		const tay = tho.placements.find((p) => p.userId === m.id)?.managerUserId ?? null;
		return {
			...m,
			primaryDepartmentId: coChinhSong(m.id) ? (chinh.get(m.id) as string) : null,
			secondaryDepartmentIds: phu.filter((s) => s.userId === m.id).map((s) => s.departmentId),
			managerOverrideId: tay !== null && hieuLuc.has(tay) && tay !== m.id ? tay : null,
			manager: ql.managerId === null ? null : (nguoi.get(ql.managerId) ?? null),
			managerSource: ql.source,
		};
	});
	const primaryRefs = new Set(tho.placements.map((p) => p.primaryDepartmentId));
	return {
		divisions,
		chuaXep,
		chuaCoPhongBan: [...tho.members].filter((m) => !coChinhSong(m.id)).sort(theoTen),
		people,
		archived: {
			divisions: tho.divisions
				.filter((d) => d.archivedAt !== null)
				.map((d) => ({ id: d.id, name: d.name, purgeable: d.departmentCount === 0 })),
			departments: tho.departments
				.filter((d) => d.archivedAt !== null)
				.map((d) => ({
					id: d.id,
					name: d.name,
					purgeable:
						d.stepCount === 0 &&
						!primaryRefs.has(d.id) &&
						!tho.departmentsInTemplates.has(d.id),
				})),
		},
		coverage: {
			members: tho.members.length,
			withPrimary: tho.members.filter((m) => coChinhSong(m.id)).length,
			departmentsWithoutHead: pbSong.filter((d) => !truongPb.has(d.id)).length,
		},
	};
}
```

- [ ] **Step 5: `to-chuc.service.ts` — đọc, bộ phận, phòng ban**

```ts
import { canManageOrganization, WORKSPACE_ID, workspaceRoleOf } from "@crm/auth";
import type { Db } from "@crm/db";
import { parseOnboardingTemplateSteps } from "@crm/validation/onboarding-template";
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { type CayTho, dungCay } from "./cay";
import { TO_CHUC } from "./to-chuc-config";
import type {
	DepartmentCreateInput,
	DepartmentMoveInput,
	TreeOutput,
} from "./to-chuc.contracts";

const T = TO_CHUC.thongDiep;

export function kiemTen(ten: string): string {
	const sach = ten.trim();
	if (sach === "") throw new BadRequestException(T.tenTrong);
	if (sach.length > TO_CHUC.ten.toiDa) throw new BadRequestException(T.tenDai(TO_CHUC.ten.toiDa));
	return sach;
}

@Injectable()
export class ToChucService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	async access(userId: string) {
		return { canManage: canManageOrganization(await workspaceRoleOf(userId)) };
	}

	async yeuCauQuanTri(userId: string): Promise<void> {
		if (!canManageOrganization(await workspaceRoleOf(userId))) {
			throw new ForbiddenException(T.canQuyenQuanTri);
		}
	}

	async anhCay(): Promise<CayTho> {
		const [members, divisions, departments, placements, secondaries, khuon] = await Promise.all([
			this.db.member.findMany({
				where: { organizationId: WORKSPACE_ID },
				select: { user: { select: { id: true, name: true, email: true } } },
			}),
			this.db.division.findMany({
				select: { id: true, name: true, position: true, headUserId: true, archivedAt: true, _count: { select: { departments: true } } },
			}),
			this.db.department.findMany({
				select: { id: true, name: true, position: true, divisionId: true, headUserId: true, archivedAt: true, _count: { select: { steps: true } } },
			}),
			this.db.orgPlacement.findMany({
				select: { userId: true, primaryDepartmentId: true, managerUserId: true },
			}),
			this.db.orgSecondaryDepartment.findMany({ select: { userId: true, departmentId: true } }),
			this.db.onboardingTemplate.findMany({ select: { steps: true } }),
		]);
		return {
			members: members.map((m) => m.user),
			divisions: divisions.map(({ _count, ...d }) => ({ ...d, departmentCount: _count.departments })),
			departments: departments.map(({ _count, ...d }) => ({ ...d, stepCount: _count.steps })),
			placements,
			secondaries,
			departmentsInTemplates: new Set(
				khuon.flatMap((k) => parseOnboardingTemplateSteps(k.steps).map((b) => b.departmentId)),
			),
		};
	}

	async tree(): Promise<TreeOutput> {
		return dungCay(await this.anhCay());
	}

	private async tenKhongTrung(
		bang: "division" | "department",
		ten: string,
		boQua: string | null,
	): Promise<void> {
		const where = {
			archivedAt: null,
			name: { equals: ten, mode: "insensitive" as const },
			...(boQua ? { NOT: { id: boQua } } : {}),
		};
		const trung =
			bang === "division"
				? await this.db.division.findFirst({ where, select: { id: true } })
				: await this.db.department.findFirst({ where, select: { id: true } });
		if (trung) throw new BadRequestException(T.tenTrung(ten));
	}

	private async boPhanSong(id: string) {
		const d = await this.db.division.findUnique({ where: { id }, select: { id: true, archivedAt: true } });
		if (!d) throw new NotFoundException(T.khongCoBoPhan(id));
		return d;
	}

	private async phongBanCo(id: string) {
		const d = await this.db.department.findUnique({ where: { id }, select: { id: true, archivedAt: true, divisionId: true } });
		if (!d) throw new NotFoundException(T.khongCoPhongBan(id));
		return d;
	}

	async createDivision(input: { name: string }) {
		const ten = kiemTen(input.name);
		await this.tenKhongTrung("division", ten, null);
		const cuoi = await this.db.division.findFirst({ orderBy: { position: "desc" }, select: { position: true } });
		return this.db.division.create({
			data: { name: ten, position: (cuoi?.position ?? -1) + 1 },
			select: { id: true },
		});
	}

	async renameDivision(input: { id: string; name: string }) {
		const ten = kiemTen(input.name);
		await this.boPhanSong(input.id);
		await this.tenKhongTrung("division", ten, input.id);
		return this.db.division.update({ where: { id: input.id }, data: { name: ten }, select: { id: true } });
	}

	async reorderDivisions(input: { ids: string[] }) {
		await this.db.$transaction(
			input.ids.map((id, viTri) => this.db.division.update({ where: { id }, data: { position: viTri } })),
		);
		return { id: input.ids[0] as string };
	}

	async archiveDivision(input: { id: string }) {
		await this.boPhanSong(input.id);
		const con = await this.db.department.count({ where: { divisionId: input.id, archivedAt: null } });
		if (con > 0) throw new BadRequestException(T.boPhanConPhongBan(con));
		return this.db.division.update({ where: { id: input.id }, data: { archivedAt: new Date() }, select: { id: true } });
	}

	async restoreDivision(input: { id: string }) {
		await this.boPhanSong(input.id);
		return this.db.division.update({ where: { id: input.id }, data: { archivedAt: null }, select: { id: true } });
	}

	async purgeDivision(input: { id: string }) {
		const d = await this.boPhanSong(input.id);
		if (d.archivedAt === null) throw new BadRequestException(T.chuaLuuTru);
		const con = await this.db.department.count({ where: { divisionId: input.id } });
		if (con > 0) throw new BadRequestException(T.boPhanConTro);
		return this.db.division.delete({ where: { id: input.id }, select: { id: true } });
	}

	async createDepartment(input: DepartmentCreateInput) {
		const ten = kiemTen(input.name);
		if (input.divisionId !== null) {
			const bp = await this.boPhanSong(input.divisionId);
			if (bp.archivedAt !== null) throw new BadRequestException(T.boPhanDaLuuTru);
		}
		await this.tenKhongTrung("department", ten, null);
		const cuoi = await this.db.department.findFirst({ orderBy: { position: "desc" }, select: { position: true } });
		return this.db.department.create({
			data: { name: ten, position: (cuoi?.position ?? -1) + 1, divisionId: input.divisionId },
			select: { id: true },
		});
	}

	async renameDepartment(input: { id: string; name: string }) {
		const ten = kiemTen(input.name);
		await this.phongBanCo(input.id);
		await this.tenKhongTrung("department", ten, input.id);
		return this.db.department.update({ where: { id: input.id }, data: { name: ten }, select: { id: true } });
	}

	async moveDepartment(input: DepartmentMoveInput) {
		const pb = await this.phongBanCo(input.id);
		if (pb.archivedAt !== null) throw new BadRequestException(T.phongBanDaLuuTru);
		if (input.divisionId !== null) {
			const bp = await this.boPhanSong(input.divisionId);
			if (bp.archivedAt !== null) throw new BadRequestException(T.boPhanDaLuuTru);
		}
		const cung = await this.db.department.findMany({
			where: { divisionId: input.divisionId, archivedAt: null, NOT: { id: input.id } },
			orderBy: [{ position: "asc" }, { name: "asc" }],
			select: { id: true },
		});
		const thuTu = cung.map((d) => d.id);
		thuTu.splice(Math.min(input.index, thuTu.length), 0, input.id);
		await this.db.$transaction([
			this.db.department.update({ where: { id: input.id }, data: { divisionId: input.divisionId } }),
			...thuTu.map((id, viTri) => this.db.department.update({ where: { id }, data: { position: viTri } })),
		]);
		return { id: input.id };
	}
}
```

- [ ] **Step 6: Router, module, đăng ký**

`to-chuc.router.ts`:

```ts
import { Inject } from "@nestjs/common";
import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from "nestjs-trpc";
import type { z } from "zod";
import type { AuthedTrpcContext } from "../trpc/context.types";
import { AuthMiddleware } from "../trpc/middlewares/auth.middleware";
import { restMeta } from "../trpc/openapi";
import {
	accessOutput,
	departmentCreateInput,
	departmentMoveInput,
	divisionCreateInput,
	idInput,
	okOutput,
	renameInput,
	reorderInput,
	treeOutput,
} from "./to-chuc.contracts";
import { ToChucService } from "./to-chuc.service";

const TAG = ["Organization"];

@Router({ alias: "org" })
@UseMiddlewares(AuthMiddleware)
export class ToChucRouter {
	constructor(@Inject(ToChucService) private readonly toChuc: ToChucService) {}

	@Query({ output: accessOutput, meta: restMeta("GET", "/org/access", TAG) })
	access(@Ctx() ctx: AuthedTrpcContext) {
		return this.toChuc.access(ctx.user.id);
	}

	@Query({ output: treeOutput, meta: restMeta("GET", "/org/tree", TAG) })
	tree() {
		return this.toChuc.tree();
	}

	@Mutation({ input: divisionCreateInput, output: okOutput, meta: restMeta("POST", "/org/divisions", TAG) })
	async createDivision(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof divisionCreateInput>) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.createDivision(input);
	}

	@Mutation({ input: renameInput, output: okOutput, meta: restMeta("PATCH", "/org/divisions/{id}", TAG) })
	async renameDivision(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof renameInput>) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.renameDivision(input);
	}

	@Mutation({ input: reorderInput, output: okOutput, meta: restMeta("POST", "/org/divisions/reorder", TAG) })
	async reorderDivisions(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof reorderInput>) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.reorderDivisions(input);
	}

	@Mutation({ input: idInput, output: okOutput, meta: restMeta("POST", "/org/divisions/{id}/archive", TAG) })
	async archiveDivision(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof idInput>) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.archiveDivision(input);
	}

	@Mutation({ input: idInput, output: okOutput, meta: restMeta("POST", "/org/divisions/{id}/restore", TAG) })
	async restoreDivision(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof idInput>) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.restoreDivision(input);
	}

	@Mutation({ input: idInput, output: okOutput, meta: restMeta("DELETE", "/org/divisions/{id}", TAG) })
	async purgeDivision(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof idInput>) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.purgeDivision(input);
	}

	@Mutation({ input: departmentCreateInput, output: okOutput, meta: restMeta("POST", "/org/departments", TAG) })
	async createDepartment(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof departmentCreateInput>) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.createDepartment(input);
	}

	@Mutation({ input: renameInput, output: okOutput, meta: restMeta("PATCH", "/org/departments/{id}", TAG) })
	async renameDepartment(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof renameInput>) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.renameDepartment(input);
	}

	@Mutation({ input: departmentMoveInput, output: okOutput, meta: restMeta("POST", "/org/departments/{id}/move", TAG) })
	async moveDepartment(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof departmentMoveInput>) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.moveDepartment(input);
	}
}
```

`to-chuc.module.ts`:

```ts
import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { ToChucRouter } from "./to-chuc.router";
import { ToChucService } from "./to-chuc.service";

@Module({
	imports: [TrpcModule],
	providers: [ToChucService, ToChucRouter],
	exports: [ToChucService],
})
export class ToChucModule {}
```

Trong `apps/api/src/app.module.ts` thêm `import { ToChucModule } from "./to-chuc/to-chuc.module";` và `ToChucModule,` ngay sau `OnboardingModule,`.

Run: `cd apps/api && bun run trpc:generate && cd ../..`
Expected: `apps/api/src/generated/server.ts` có khối `org: t.router({ … })`.

- [ ] **Step 7: Viết bài kiểm `to-chuc.spec.ts` — khung và E1b, E3, E14**

Khung chung (đầu tệp), theo khuôn `khuon-mat-bo-phan.spec.ts` (Nest thật, supertest, `gieoThanhVien`):

```ts
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `ttc${process.env.TEST_RUN_ID ?? ""}`.slice(0, 24);
let dem = 0;
const ma = (phan: string) => `${TIEN_TO}-${phan}-${Date.now().toString(36)}-${++dem}`;

type TraLoi = { status: number; data: unknown; loi: string };
type Phien = { nguoi: string; cookie: string; token: string };
let app: INestApplication;
const phien: Record<"quan" | "thuong" | "chu", Phien> = {
	quan: { nguoi: "", cookie: "", token: "" },
	thuong: { nguoi: "", cookie: "", token: "" },
	chu: { nguoi: "", cookie: "", token: "" },
};

async function goi(thuTuc: string, vao: unknown, ai: keyof typeof phien = "quan"): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc}`)
		.set("cookie", phien[ai].cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify(vao));
	return { status: res.status, data: res.body?.result?.data, loi: String(res.body?.error?.message ?? "") };
}

async function doc<T>(thuTuc: string, ai: keyof typeof phien = "quan"): Promise<T> {
	const res = await request(app.getHttpServer()).get(`/api/trpc/${thuTuc}`).set("cookie", phien[ai].cookie);
	expect(`${thuTuc}: HTTP ${res.status}`).toBe(`${thuTuc}: HTTP 200`);
	return res.body.result.data as T;
}

function ok<T>(tra: TraLoi, nhan: string): T {
	expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(`${nhan}: HTTP 200 `);
	return tra.data as T;
}

async function nguoiMoi(vai: "member" | "admin" | "owner", ten: string): Promise<string> {
	const id = ma(ten);
	await gieoThanhVien(id, vai);
	return id;
}

type Cay = import("../src/to-chuc/to-chuc.contracts").TreeOutput;
const cay = () => doc<Cay>("org.tree");

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");
	const modul: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
	app = modul.createNestApplication({ bodyParser: false });
	await app.init();
	for (const [khoa, vai] of [["quan", "admin"], ["thuong", "member"], ["chu", "owner"]] as const) {
		const id = ma(khoa);
		await gieoThanhVien(id, vai);
		const moi = await mintPhien(id);
		phien[khoa] = { nguoi: id, cookie: moi.cookie, token: moi.token };
	}
});

afterAll(async () => {
	await app.close();
	await db.orgSecondaryDepartment.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.orgPlacement.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.department.updateMany({ where: { name: { startsWith: TIEN_TO } }, data: { headUserId: null, divisionId: null } });
	await db.onboardingStep.deleteMany({ where: { department: { name: { startsWith: TIEN_TO } } } });
	await db.onboardingPlan.deleteMany({ where: { company: { name: { startsWith: TIEN_TO } } } });
	await db.company.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.department.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.division.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
});
```

Mỗi `describe` tự dọn thứ nó tạo trong khoảng tên `TIEN_TO` — hàng của các `describe` khác vẫn còn, nên mọi khẳng định trên cây chỉ nhìn các đơn vị và người do chính `describe` đó tạo (lọc theo id đã lưu), trừ E14 (xem dưới).

E1b:

```ts
describe("du-lieu-cu", () => {
	test("du-lieu-cu: phong ban khong divisionId nam o chuaXep theo position, da luu tru chi o archived", async () => {
		const ids: string[] = [];
		for (const ten of ["D", "A", "C", "B"]) {
			ids.push(ok<{ id: string }>(await goi("onboarding.createDepartment", { name: ma(ten) }), `tao ${ten}`).id);
		}
		const luu = ok<{ id: string }>(await goi("onboarding.createDepartment", { name: ma("luu") }), "tao luu").id;
		ok(await goi("onboarding.archiveDepartment", { id: luu }), "luu tru");
		const c1 = await cay();
		const thuTu = c1.chuaXep.map((d) => d.id).filter((id) => ids.includes(id));
		expect(`chuaXep: ${thuTu.length} phong ban`).toBe("chuaXep: 4 phong ban");
		expect(thuTu).toEqual(ids);
		expect(c1.chuaXep.some((d) => d.id === luu)).toBe(false);
		expect(c1.archived.departments.some((d) => d.id === luu)).toBe(true);
		const bp = ok<{ id: string }>(await goi("org.createDivision", { name: ma("bp") }), "tao bp").id;
		ok(await goi("org.moveDepartment", { id: ids[0], divisionId: bp, index: 0 }), "chuyen");
		const c2 = await cay();
		expect(c2.chuaXep.map((d) => d.id).filter((id) => ids.includes(id)).length).toBe(3);
	});
});
```

E3 (`vong-doi-don-vi`): tạo `A`, `B` bằng `org.createDivision`; đổi tên `A` thành `A2`; `org.reorderDivisions({ids:[B,A]})`; tạo `P1,P2,P3` trong `A` bằng `org.createDepartment`; `moveDepartment(P2 → B, 0)`; `moveDepartment(P3 → null, 0)`. Sau mỗi bước đọc `org.tree` và so với cây kỳ vọng do hàm `kyVong(buoc)` trong tệp dựng từ danh sách thao tác (không chép cây tay): `divisions` lọc theo id `A,B` → `[{id, name, departments: ids}]`, `chuaXep` lọc theo `P3`. Ma trận từ chối viết trước:

```ts
const TU_CHOI = [
	["org.createDivision", () => ({ name: "   " }), "Tên không được để trống."],
	["org.createDivision", () => ({ name: "x".repeat(81) }), "Tên dài quá 80 ký tự."],
	["org.createDivision", () => ({ name: tenA.toUpperCase() }), `Đã có «${tenA.toUpperCase()}» ở cấp này.`],
	["org.createDepartment", () => ({ name: "   ", divisionId: null }), "Tên không được để trống."],
	["org.createDepartment", () => ({ name: "x".repeat(81), divisionId: null }), "Tên dài quá 80 ký tự."],
	["org.createDepartment", () => ({ name: tenP1.toUpperCase(), divisionId: null }), `Đã có «${tenP1.toUpperCase()}» ở cấp này.`],
] as const;
```

Mỗi ca: `HTTP 400` và `loi === câu ghim`, và `org.tree` trước = sau (so JSON của `divisions`+`chuaXep` lọc theo id của `describe`). Đối chứng dương: tên 80 ký tự (tiền tố `TIEN_TO` + đệm) được; tạo `P1` rồi lưu trữ nó (`onboarding.archiveDepartment`) → tạo lại cùng tên được.

E14 (`do-phu`): chạy trong CƠ SỞ DỮ LIỆU RIÊNG của lượt `bun run test`, nhưng các tệp khác cũng gieo thành viên — nên phép đếm độc lập phải đọc toàn bảng. Gieo: 10 người bằng `nguoiMoi` (7 có phòng ban chính còn sống, 1 chỉ phòng ban phụ, 1 có phòng ban chính đã lưu trữ, 1 không gì), 1 người đã rời (gieo rồi `db.member.delete`), gán qua `org.setPlacement` (Task 3 — nên E14 viết ở Task 3 Step 6, không ở đây). Ở Task 2 chỉ viết `describe("do-phu")` với ca «phòng ban chưa có trưởng»: 2 phòng ban mới không trưởng → `coverage.departmentsWithoutHead` tăng đúng 2 so với trước khi tạo (đếm trước bằng SQL độc lập: `SELECT count(*) FROM department WHERE "archivedAt" IS NULL AND ("headUserId" IS NULL OR "headUserId" NOT IN (SELECT "userId" FROM member))`). Phần còn lại của E14 thêm ở Task 3.

- [ ] **Step 8: Chạy — đỏ trước khi có dịch vụ, xanh sau**

Run: `bun run test -- "cd apps/api && bun test test/to-chuc.spec.ts -t du-lieu-cu"` → PASS.
Run: `bun run test -- "cd apps/api && bun test test/to-chuc.spec.ts -t vong-doi-don-vi"` → PASS.
Chiều đỏ E3: tạm đổi `mode: "insensitive"` thành bỏ trong `tenKhongTrung`, chạy lại → FAIL có chuỗi `trung ten`; hoàn lại.

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/to-chuc apps/api/src/app.module.ts apps/api/src/generated/server.ts apps/api/test/to-chuc.spec.ts
git commit -m "feat(api): router org — cây, bộ phận, phòng ban, độ phủ"
```

---

### Task 3: Người trong cây — vị trí, trưởng, quản lý, người đã rời, độ phủ

Phục vụ E5, E6, E7, E10, E14. `independent: false`.

**Files:**
- Modify: `apps/api/src/to-chuc/to-chuc.service.ts`, `to-chuc.router.ts`, `apps/api/src/generated/server.ts`
- Test: `apps/api/test/to-chuc.spec.ts`

**Interfaces:**
- Produces: `org.setHead({kind,id,userId})`, `org.setPlacement({userId, primaryDepartmentId, secondaryDepartmentIds, managerUserId})` → `{ id }`.

- [ ] **Step 1: Thêm vào dịch vụ**

```ts
	private async thanhVienHieuLuc(userId: string): Promise<void> {
		const m = await this.db.member.findUnique({
			where: { organizationId_userId: { organizationId: WORKSPACE_ID, userId } },
			select: { id: true },
		});
		if (!m) throw new BadRequestException(T.khongPhaiThanhVien(userId));
	}

	async setHead(input: HeadInput) {
		if (input.kind === "division") {
			const bp = await this.boPhanSong(input.id);
			if (bp.archivedAt !== null) throw new BadRequestException(T.boPhanDaLuuTru);
			if (input.userId !== null) await this.thanhVienHieuLuc(input.userId);
			return this.db.division.update({ where: { id: input.id }, data: { headUserId: input.userId }, select: { id: true } });
		}
		const pb = await this.phongBanCo(input.id);
		if (pb.archivedAt !== null) throw new BadRequestException(T.phongBanDaLuuTru);
		if (input.userId !== null) {
			await this.thanhVienHieuLuc(input.userId);
			const [chinh, phu] = await Promise.all([
				this.db.orgPlacement.findFirst({ where: { userId: input.userId, primaryDepartmentId: input.id }, select: { userId: true } }),
				this.db.orgSecondaryDepartment.findFirst({ where: { userId: input.userId, departmentId: input.id }, select: { userId: true } }),
			]);
			if (!chinh && !phu) throw new BadRequestException(T.truongNgoaiPhongBan);
		}
		return this.db.department.update({ where: { id: input.id }, data: { headUserId: input.userId }, select: { id: true } });
	}

	async setPlacement(input: PlacementInput) {
		await this.thanhVienHieuLuc(input.userId);
		const phu = [...new Set(input.secondaryDepartmentIds)];
		if (input.primaryDepartmentId !== null && phu.includes(input.primaryDepartmentId)) {
			throw new BadRequestException(T.phuTrungChinh);
		}
		for (const id of [input.primaryDepartmentId, ...phu].filter((x): x is string => x !== null)) {
			const pb = await this.phongBanCo(id);
			if (pb.archivedAt !== null) throw new BadRequestException(T.phongBanDaLuuTru);
		}
		if (input.managerUserId !== null) {
			if (input.managerUserId === input.userId) throw new BadRequestException(T.quanLyLaChinhMinh);
			await this.thanhVienHieuLuc(input.managerUserId);
		}
		await this.db.$transaction([
			this.db.orgPlacement.upsert({
				where: { userId: input.userId },
				create: { userId: input.userId, primaryDepartmentId: input.primaryDepartmentId, managerUserId: input.managerUserId },
				update: { primaryDepartmentId: input.primaryDepartmentId, managerUserId: input.managerUserId },
			}),
			this.db.orgSecondaryDepartment.deleteMany({ where: { userId: input.userId } }),
			this.db.orgSecondaryDepartment.createMany({ data: phu.map((departmentId) => ({ userId: input.userId, departmentId })) }),
		]);
		return { id: input.userId };
	}
```

(Nhập `HeadInput`, `PlacementInput` từ `./to-chuc.contracts`.) Router thêm hai thủ tục `setHead` (`POST /org/heads`) và `setPlacement` (`POST /org/placements`), cùng khuôn `yeuCauQuanTri` như Task 2. Sinh lại `server.ts`.

- [ ] **Step 2: E5 `vi-tri`** — theo đúng chuỗi trong `evals.yaml`: A chính P1; A chính P2 (thay); A phụ P3, P1; A phụ gồm P2 → `HTTP 400` + `Phòng ban phụ không được trùng phòng ban chính.`; bỏ phụ P3. Sau mỗi bước: `people.find(A)` có `primaryDepartmentId` và tập `secondaryDepartmentIds` đúng kỳ vọng, và `db.orgPlacement.count({where:{userId:A}}) === 1`. Người B chỉ có phụ → nằm trong `chuaCoPhongBan`. Cây: A dưới P2 `primary:true`, dưới P1 `primary:false`.

- [ ] **Step 3: E6 `truong`** — ma trận năm ca viết trước: `[phòng ban, người trong phòng ban] → 200`, `[phòng ban, người ngoài] → 400 «Trưởng phòng ban phải là người của phòng ban đó.»`, `[phòng ban, null] → 200 và head null`, `[bộ phận, thành viên bất kỳ] → 200`, `[phòng ban, người đã rời] → 400 «Người … không phải thành viên đang hoạt động.»`. Đặt trưởng mới thay trưởng cũ: `head.id` đổi. Cặp hai chiều: người `thuong` được đặt làm trưởng một phòng ban (ghi bằng phiên `quan`), rồi dùng phiên `thuong` gọi `org.setHead`, `org.createDivision`, `org.setPlacement`, `org.applyImport` (thủ tục thứ tư có ở Task 5 — ca đó thêm vào Task 5 Step 7) → mỗi cái `HTTP 403`; phiên `quan` gọi ba cái đầu với input hợp lệ → 200.

Thêm ca Review Focus `truong-roi-phong-ban`: trưởng P1 đổi phòng ban chính sang P2 (bằng `setPlacement`) → cây: P1 `head === null`, `coverage.departmentsWithoutHead` tăng 1.

- [ ] **Step 4: E7 `quan-ly`** — bảng bảy dòng viết trước trong tệp:

```ts
const BANG_QUAN_LY = [
	["thuong", "truongPb", "truong-phong-ban"],
	["truongPb", "truongBp", "truong-bo-phan"],
	["truongBp", null, "khong-co"],
	["oPbKhongTruong", "truongBp", "truong-bo-phan"],
	["coChonTay", "chonTayToi", "chon-tay"],
	["khongPhongBan", null, "khong-co"],
	["chonTayDaRoi", "truongPb", "truong-phong-ban"],
] as const;
```

Dựng: bộ phận BP (trưởng `truongBp`, người có phòng ban chính PB0 trong BP), PB1 trong BP (trưởng `truongPb`), PB2 trong BP không trưởng. Mỗi dòng: `people.find(ten).manager?.id ?? null` và `managerSource` khớp. Ca ghi đè trỏ chính mình: `setPlacement({… managerUserId: chinhMinh})` → 400 «Quản lý trực tiếp phải là người khác.». Rồi đổi trưởng PB1 sang người khác trong PB1 → `thuong` có quản lý mới, `coChonTay` giữ nguyên. Xoá ghi đè (`managerUserId: null`) → về phép suy. Chiều đỏ: tạm bỏ nấc `truongBoPhan` trong `quan-ly.ts` → FAIL `truongPb: quan ly null != …`.

- [ ] **Step 5: E10 `nguoi-roi`** — R chính P1, trưởng P1, là ghi đè của S; T ở P1. Gỡ R bằng `new WorkspaceService(db, agent).removeMember(phien.quan.nguoi, { memberId })` (khuôn `workspace-thanh-vien.spec.ts`, `agent = { workspaceChanged: async () => undefined }`). Khẳng định viết trước: R vắng mọi nhóm và `people`; P1 `head === null`; `coverage.members` giảm 1 và `departmentsWithoutHead` tăng 1; S `managerSource !== "chon-tay"` và `manager?.id !== R`; T `manager?.id !== R`. Đối chứng: trước khi gỡ, cả năm điều ngược lại đúng.

- [ ] **Step 6: E14 `do-phu` phần người** — dùng phép đếm SQL độc lập trên toàn bảng (không gọi hàm dịch vụ):

```ts
async function demDocLap() {
	const [x] = await db.$queryRaw<{ m: bigint; x: bigint; k: bigint }[]>`
		SELECT
			(SELECT count(*) FROM member WHERE "organizationId" = 'workspace') AS m,
			(SELECT count(*) FROM member mb JOIN "orgPlacement" p ON p."userId" = mb."userId"
				JOIN department d ON d.id = p."primaryDepartmentId"
				WHERE mb."organizationId" = 'workspace' AND d."archivedAt" IS NULL) AS x,
			(SELECT count(*) FROM department d WHERE d."archivedAt" IS NULL AND NOT EXISTS (
				SELECT 1 FROM member mb WHERE mb."userId" = d."headUserId" AND mb."organizationId" = 'workspace'
				AND (EXISTS (SELECT 1 FROM "orgPlacement" p WHERE p."userId" = d."headUserId" AND p."primaryDepartmentId" = d.id)
					OR EXISTS (SELECT 1 FROM "orgSecondaryDepartment" s WHERE s."userId" = d."headUserId" AND s."departmentId" = d.id)))) AS k`;
	return { members: Number(x.m), withPrimary: Number(x.x), departmentsWithoutHead: Number(x.k) };
}
```

Gieo đúng fixture của E14 (10 người, 1 đã rời, 5 phòng ban như `evals.yaml`), rồi `expect((await cay()).coverage).toEqual(await demDocLap())`, và độ chênh so với lúc trước khi gieo đúng `members +10`, `withPrimary +7`, `departmentsWithoutHead +2`. Cặp hai chiều: gán phòng ban chính cho người «không gì» → `withPrimary` tăng 1. Chiều đỏ: tạm đếm `tho.members` gồm cả người không còn hàng `member` → FAIL `M: … != …`.

- [ ] **Step 7: Chạy và commit**

Run lần lượt: `bun run test -- "cd apps/api && bun test test/to-chuc.spec.ts -t vi-tri"`, `-t truong`, `-t quan-ly`, `-t nguoi-roi`, `-t do-phu` → PASS.

```bash
git add apps/api/src/to-chuc apps/api/src/generated/server.ts apps/api/test/to-chuc.spec.ts
git commit -m "feat(api): vị trí một người, trưởng đơn vị, quản lý trực tiếp, độ phủ"
```

---

### Task 4: Lưu trữ và quyền — chặn phòng ban còn người, ma trận quyền

Phục vụ E4, E8. `independent: false`.

**Files:**
- Modify: `apps/api/src/onboarding/onboarding.service.ts:256-312`, `apps/api/src/onboarding/onboarding-config.ts`
- Test: `apps/api/test/to-chuc.spec.ts`

- [ ] **Step 1: Chặn trong `archiveDepartment` và `purgeDepartment`**

Trong `onboarding-config.ts` `thongDiep` thêm:

```ts
		phongBanConNguoi: (n: number) =>
			`Còn ${n} người có phòng ban chính ở đây — chuyển họ trước.`,
		phongBanConNguoiXoa: "Phòng ban còn người trỏ tới nên không xoá hẳn được.",
```

Trong `archiveDepartment`, sau khối kiểm khuôn:

```ts
		const conNguoi = await this.db.orgPlacement.count({
			where: {
				primaryDepartmentId: input.id,
				user: { members: { some: { organizationId: WORKSPACE_ID } } },
			},
		});
		if (conNguoi > 0) {
			throw new BadRequestException(ONBOARDING.thongDiep.phongBanConNguoi(conNguoi));
		}
```

Trong `purgeDepartment`, sau kiểm `_count.steps`:

```ts
		const tro = await this.db.orgPlacement.count({ where: { primaryDepartmentId: input.id } });
		if (tro > 0) throw new BadRequestException(ONBOARDING.thongDiep.phongBanConNguoiXoa);
```

Nhập `WORKSPACE_ID` từ `@crm/auth` (cùng dòng nhập `canManageOnboarding`). `boPhanRa` thêm vế `purgeable` không đổi (danh sách lưu trữ của màn Tổ chức dùng `org.tree.archived`).

- [ ] **Step 2: E4 `luu-tru`** — mười ca viết trước trong `evals.yaml`, mỗi ca một dòng bảng `[mô tả, thao tác, kỳ vọng]`. Ca từ chối: `HTTP 400` và câu chứa số đếm (`Còn 2 người…`, `Bộ phận còn 1 phòng ban…`, `Chỉ xoá hẳn được đơn vị đã lưu trữ.`), `org.tree` lọc theo id trước = sau. Khôi phục: `divisionId` và `position` như trước khi lưu trữ. Đơn vị đã lưu trữ vắng `divisions` nhưng có trong `archived`. Ca xoá hẳn phòng ban chưa lưu trữ dùng `onboarding.purgeDepartment` (câu `Chỉ xoá vĩnh viễn được thứ đã lưu trữ.` sẵn có); ca xoá hẳn bộ phận chưa lưu trữ dùng `org.purgeDivision` (câu `Chỉ xoá hẳn được đơn vị đã lưu trữ.`).

- [ ] **Step 3: E8 `quyen`**

```ts
describe("quyen", () => {
	test("quyen: moi thu tuc ghi rut tu router — thuong FORBIDDEN, quan tri va chu khong", async () => {
		const { appRouter } = await import("../src/generated/server");
		const thuTuc = Object.entries(appRouter._def.procedures as Record<string, { _def: { type: string } }>)
			.filter(([ten, p]) => p._def.type === "mutation" && (ten.startsWith("org.") || /^onboarding\.\w*Department/.test(ten)))
			.map(([ten]) => ten)
			.sort();
		console.log(`thu tuc ghi: ${thuTuc.length} — ${thuTuc.join(", ")}`);
		expect(thuTuc.length).toBeGreaterThan(10);
		const vao = await dungDauVaoHopLe();
		const thieu = thuTuc.filter((t) => !(t in vao));
		expect(`thieu input hop le cho ${thieu.join(", ")}`).toBe("thieu input hop le cho ");
		let daGui = 0;
		for (const t of thuTuc) {
			const thuong = await goi(t, await vao[t](), "thuong");
			expect(`${t}: thuong HTTP ${thuong.status}`).toBe(`${t}: thuong HTTP 403`);
			for (const ai of ["quan", "chu"] as const) {
				const r = await goi(t, await vao[t](), ai);
				expect(`${t}: ${ai} HTTP ${r.status}`).not.toMatch(/HTTP (400|403)$/);
			}
			daGui += 1;
		}
		console.log(`da gui input hop le: ${daGui}/${thuTuc.length}`);
		const a = await doc<{ canManage: boolean }>("org.access", "thuong");
		expect(a.canManage).toBe(false);
		await doc("org.tree", "thuong");
	});
});
```

`dungDauVaoHopLe()` trả `Record<string, () => Promise<unknown>>`: mỗi hàm gieo đúng thứ thủ tục cần rồi trả input hợp lệ (vd. `"org.archiveDivision": async () => ({ id: (await goi("org.createDivision", { name: ma("bpx") }, "quan")).data.id })`; `"onboarding.purgeDepartment"`: tạo, lưu trữ rồi trả id; `"org.applyImport"` (sau Task 5): chữ một dòng hợp lệ). Mỗi lần gọi tạo đồ mới để hai vai không đụng nhau. Chiều đỏ: (a) tạm bỏ `yeuCauQuanTri` ở `moveDepartment` → FAIL `org.moveDepartment: thuong HTTP 200`; (b) tạm cho `canManageOrganization` trả `role === "admin"` → FAIL `org.setHead: chu HTTP 403`.

- [ ] **Step 4: Chạy, commit**

Run: `-t luu-tru`, `-t quyen` → PASS. Run toàn tệp cũ để chắc không vỡ: `bun run test -- "cd apps/api && bun test test/sua-luu-tru.spec.ts test/khuon-mat-bo-phan.spec.ts test/dieu-phoi.spec.ts"` → PASS.

```bash
git add apps/api/src/onboarding apps/api/test/to-chuc.spec.ts
git commit -m "feat(api): chặn lưu trữ và xoá hẳn phòng ban còn người; ma trận quyền cây tổ chức"
```

---

### Task 5: Nhập hàng loạt — phân tích, xem trước, ghi

Phục vụ E11, E12. `independent: false`.

**Files:**
- Create: `apps/api/src/to-chuc/nhap.ts`
- Modify: `to-chuc.service.ts`, `to-chuc.router.ts`, `generated/server.ts`
- Test: `apps/api/test/to-chuc-nhap.spec.ts`

**Interfaces:**
- Produces: `phanTichLo(chu: string, snap: SnapNhap): KetQuaNhap`; `org.previewImport({text})` → `ImportPreviewOutput`; `org.applyImport({text})` → `ImportApplyOutput`.

- [ ] **Step 1: `nhap.ts`**

```ts
import { TO_CHUC } from "./to-chuc-config";

const N = TO_CHUC.thongDiep.nhap;

export type SnapNhap = {
	members: { id: string; email: string }[];
	departments: { id: string; name: string; divisionId: string | null }[];
	divisions: { id: string; name: string }[];
};

export type LoaiTruong = "phong-ban" | "bo-phan" | null;

export type DongHopLe = {
	line: number;
	userId: string;
	departmentName: string;
	departmentId: string | null;
	divisionName: string | null;
	divisionId: string | null;
	head: LoaiTruong;
};

export type DongNhap = {
	line: number;
	email: string;
	department: string;
	division: string;
	head: string;
	error: string | null;
};

export type KetQuaNhap = {
	rows: DongNhap[];
	hopLe: DongHopLe[];
	summary: { valid: number; invalid: number; newDepartments: number; newDivisions: number };
};

export const khoa = (s: string) => s.trim().toLocaleLowerCase("vi");

export function boDau(s: string): string {
	return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
}

export function tachO(dong: string): string[] {
	if (dong.includes("\t")) return dong.split("\t").map((o) => o.trim());
	const o: string[] = [];
	let hienTai = "";
	let trongNgoac = false;
	for (let i = 0; i < dong.length; i += 1) {
		const k = dong[i];
		if (k === '"') {
			if (trongNgoac && dong[i + 1] === '"') {
				hienTai += '"';
				i += 1;
			} else trongNgoac = !trongNgoac;
		} else if (k === "," && !trongNgoac) {
			o.push(hienTai.trim());
			hienTai = "";
		} else hienTai += k;
	}
	o.push(hienTai.trim());
	return o;
}

export function tachDong(chu: string): { line: number; o: string[] }[] {
	const dong = chu
		.split(/\r?\n/)
		.map((d, i) => ({ line: i + 1, d }))
		.filter((x) => x.d.trim() !== "")
		.map((x) => ({ line: x.line, o: tachO(x.d) }));
	if (dong.length > 0 && !(dong[0]?.o[0] ?? "").includes("@")) return dong.slice(1);
	return dong;
}

function loaiTruong(o: string): LoaiTruong | "la" {
	const b = boDau(o);
	if (b === "") return null;
	if (b === "phong ban") return "phong-ban";
	if (b === "bo phan") return "bo-phan";
	return "la";
}

export function phanTichLo(chu: string, snap: SnapNhap): KetQuaNhap {
	const nguoi = new Map(snap.members.map((m) => [khoa(m.email), m.id]));
	const pbTheoTen = new Map<string, SnapNhap["departments"][number]>();
	for (const d of snap.departments) if (!pbTheoTen.has(khoa(d.name))) pbTheoTen.set(khoa(d.name), d);
	const bpTheoTen = new Map<string, SnapNhap["divisions"][number]>();
	for (const d of snap.divisions) if (!bpTheoTen.has(khoa(d.name))) bpTheoTen.set(khoa(d.name), d);
	const bpTheoId = new Map(snap.divisions.map((d) => [d.id, d]));

	const tho = tachDong(chu).map(({ line, o }) => {
		const [email = "", department = "", division = "", head = ""] = o;
		return { line, email, department, division, head, error: null as string | null };
	});

	const bpHieuLuc = (r: (typeof tho)[number]) => {
		if (r.division !== "") return khoa(r.division);
		const pb = pbTheoTen.get(khoa(r.department));
		const bp = pb?.divisionId ? bpTheoId.get(pb.divisionId) : undefined;
		return bp ? khoa(bp.name) : "";
	};

	for (const r of tho) {
		const lt = loaiTruong(r.head);
		if (r.email === "" || r.department === "" || (lt === "bo-phan" && bpHieuLuc(r) === "")) r.error = N.thieuCot;
		else if (!nguoi.has(khoa(r.email))) r.error = N.emailKhongPhaiThanhVien;
		else if (lt === "la") r.error = N.truongLa;
		else {
			const pb = pbTheoTen.get(khoa(r.department));
			const bp = pb?.divisionId ? bpTheoId.get(pb.divisionId) : undefined;
			if (bp && r.division !== "" && khoa(bp.name) !== khoa(r.division)) {
				r.error = N.phongBanBoPhanKhac(pb?.name ?? r.department, bp.name);
			}
		}
	}

	const nhom = <K>(chon: (r: (typeof tho)[number]) => K | null) => {
		const m = new Map<K, (typeof tho)[number][]>();
		for (const r of tho) {
			const k = chon(r);
			if (k === null) continue;
			m.set(k, [...(m.get(k) ?? []), r]);
		}
		return m;
	};
	const danhCap = (m: Map<unknown, (typeof tho)[number][]>, loi: (r: (typeof tho)[number]) => string, hong: (ds: (typeof tho)[number][]) => boolean) => {
		for (const ds of m.values()) if (hong(ds)) for (const r of ds) if (r.error === null) r.error = loi(r);
	};

	danhCap(nhom((r) => (r.email === "" ? null : khoa(r.email))), () => N.emailLap, (ds) => ds.length > 1);
	danhCap(
		nhom((r) => (r.department === "" || r.division === "" ? null : khoa(r.department))),
		(r) => N.phongBanHaiBoPhan(r.department),
		(ds) => new Set(ds.map((r) => khoa(r.division))).size > 1,
	);
	danhCap(
		nhom((r) => {
			const lt = loaiTruong(r.head);
			if (lt === "phong-ban") return `pb:${khoa(r.department)}`;
			if (lt === "bo-phan") return `bp:${bpHieuLuc(r)}`;
			return null;
		}),
		(r) => N.haiTruong(loaiTruong(r.head) === "bo-phan" ? r.division || bpHieuLuc(r) : r.department),
		(ds) => ds.length > 1,
	);

	const hopLe: DongHopLe[] = tho
		.filter((r) => r.error === null)
		.map((r) => {
			const pb = pbTheoTen.get(khoa(r.department));
			const tenBp = r.division !== "" ? r.division : null;
			const bp = tenBp ? bpTheoTen.get(khoa(tenBp)) : undefined;
			const lt = loaiTruong(r.head);
			return {
				line: r.line,
				userId: nguoi.get(khoa(r.email)) as string,
				departmentName: pb?.name ?? r.department,
				departmentId: pb?.id ?? null,
				divisionName: bp?.name ?? tenBp,
				divisionId: bp?.id ?? (pb?.divisionId ?? null),
				head: lt === "la" ? null : lt,
			};
		});

	return {
		rows: tho,
		hopLe,
		summary: {
			valid: hopLe.length,
			invalid: tho.length - hopLe.length,
			newDepartments: new Set(hopLe.filter((h) => h.departmentId === null).map((h) => khoa(h.departmentName))).size,
			newDivisions: new Set(hopLe.filter((h) => h.divisionName !== null && !bpTheoTen.has(khoa(h.divisionName))).map((h) => khoa(h.divisionName as string))).size,
		},
	};
}
```

- [ ] **Step 2: Dịch vụ `previewImport` / `applyImport`**

```ts
	private async snapNhap(tx: Pick<Db, "member" | "department" | "division"> = this.db): Promise<SnapNhap> {
		const [members, departments, divisions] = await Promise.all([
			tx.member.findMany({ where: { organizationId: WORKSPACE_ID }, select: { user: { select: { id: true, email: true } } } }),
			tx.department.findMany({ where: { archivedAt: null }, orderBy: { position: "asc" }, select: { id: true, name: true, divisionId: true } }),
			tx.division.findMany({ where: { archivedAt: null }, orderBy: { position: "asc" }, select: { id: true, name: true } }),
		]);
		return { members: members.map((m) => m.user), departments, divisions };
	}

	private kiemLo(chu: string) {
		const soDong = tachDong(chu).length;
		if (soDong === 0) throw new BadRequestException(T.loRong);
		if (soDong > TO_CHUC.nhap.toiDaDong) throw new BadRequestException(T.loQuaDai(TO_CHUC.nhap.toiDaDong));
	}

	async previewImport(input: { text: string }): Promise<ImportPreviewOutput> {
		this.kiemLo(input.text);
		const kq = phanTichLo(input.text, await this.snapNhap());
		return { rows: kq.rows, summary: kq.summary };
	}

	async applyImport(input: { text: string }): Promise<ImportApplyOutput> {
		this.kiemLo(input.text);
		return this.db.$transaction(async (tx) => {
			const kq = phanTichLo(input.text, await this.snapNhap(tx));
			if (kq.hopLe.length === 0) throw new BadRequestException(T.khongDongHopLe);
			const bpId = new Map<string, string>();
			let viTriBp = ((await tx.division.findFirst({ orderBy: { position: "desc" }, select: { position: true } }))?.position ?? -1) + 1;
			let bpMoi = 0;
			for (const h of kq.hopLe) {
				if (h.divisionName === null) continue;
				const k = khoa(h.divisionName);
				if (bpId.has(k)) continue;
				if (h.divisionId !== null) {
					bpId.set(k, h.divisionId);
					continue;
				}
				bpMoi += 1;
				bpId.set(k, (await tx.division.create({ data: { name: h.divisionName.trim(), position: viTriBp++ }, select: { id: true } })).id);
			}
			const pbId = new Map<string, string>();
			let viTriPb = ((await tx.department.findFirst({ orderBy: { position: "desc" }, select: { position: true } }))?.position ?? -1) + 1;
			let pbMoi = 0;
			for (const h of kq.hopLe) {
				const k = khoa(h.departmentName);
				const bp = h.divisionName === null ? null : (bpId.get(khoa(h.divisionName)) ?? null);
				if (pbId.has(k)) continue;
				if (h.departmentId !== null) {
					pbId.set(k, h.departmentId);
					if (bp !== null) await tx.department.updateMany({ where: { id: h.departmentId, divisionId: null }, data: { divisionId: bp } });
					continue;
				}
				pbMoi += 1;
				pbId.set(k, (await tx.department.create({ data: { name: h.departmentName.trim(), position: viTriPb++, divisionId: bp }, select: { id: true } })).id);
			}
			for (const h of kq.hopLe) {
				const pb = pbId.get(khoa(h.departmentName)) as string;
				await tx.orgPlacement.upsert({
					where: { userId: h.userId },
					create: { userId: h.userId, primaryDepartmentId: pb },
					update: { primaryDepartmentId: pb },
				});
				await tx.orgSecondaryDepartment.deleteMany({ where: { userId: h.userId, departmentId: pb } });
				if (h.head === "phong-ban") await tx.department.update({ where: { id: pb }, data: { headUserId: h.userId } });
				if (h.head === "bo-phan") {
					const bp = (await tx.department.findUnique({ where: { id: pb }, select: { divisionId: true } }))?.divisionId;
					if (bp) await tx.division.update({ where: { id: bp }, data: { headUserId: h.userId } });
				}
			}
			return { written: kq.hopLe.length, newDepartments: pbMoi, newDivisions: bpMoi };
		});
	}
```

`h.divisionId` khác null khi ô bộ phận khớp một bộ phận chưa lưu trữ (hoặc ô trống và phòng ban đã có bộ phận) — `phanTichLo` đã chặn mọi ca mâu thuẫn, nên vòng ghi không kiểm lại. Router thêm `previewImport` (`POST /org/import/preview`) và `applyImport` (`POST /org/import`), cả hai `yeuCauQuanTri` trước (xem trước cũng cần quyền quản trị vì nó lộ ai là thành viên). Sinh lại `server.ts`.

- [ ] **Step 3: `to-chuc-nhap.spec.ts` — E11 `xem-truoc`**

Dựng lô 15 dòng (1 tiêu đề + 14 dữ liệu) bằng hàm trong tệp từ fixture đã gieo, không viết chuỗi tay cho email. Bảng kỳ vọng viết trước theo từng dòng:

```ts
const KY_VONG = [
	["hopLe-taoPhongBan", null],
	["hopLe-taoBoPhan", null],
	["hopLe-truongPhongBan", null],
	["hopLe-truongBoPhan", null],
	["khongThanhVien", N.emailKhongPhaiThanhVien],
	["thieuPhongBan", N.thieuCot],
	["pbBoPhanKhac", N.phongBanBoPhanKhac(tenPbCo, tenBpCo)],
	["truongLa", N.truongLa],
	["emailLap-1", N.emailLap],
	["emailLap-2", N.emailLap],
	["haiBoPhan-1", N.phongBanHaiBoPhan(tenPbHai)],
	["haiBoPhan-2", N.phongBanHaiBoPhan(tenPbHai)],
	["haiTruong-1", N.haiTruong(tenPbTruong)],
	["haiTruong-2", N.haiTruong(tenPbTruong)],
] as const;
```

Khẳng định: 14 × [hỏng/hợp lệ, câu lỗi] = 28; `summary` = `{ valid: 4, invalid: 10, newDepartments: 1, newDivisions: 1 }` (4). Chạy hai lần: tab và `.csv` (ô chứa dấu phẩy bọc ngoặc kép) — cùng bảng. Lô 1001 dòng → 400 `Lô có quá 1000 dòng…`; 1000 dòng → 200. Đếm `division`, `department`, `orgPlacement`, `orgSecondaryDepartment` trước = sau xem trước (4). Ba ca Review Focus trong cùng `describe`: `nhap-khoang-trang` (dòng trống giữa, email viết hoa, khoảng trắng hai đầu → vẫn khớp), `nhap-trung-ten-cu` (một phòng ban cùng tên đã lưu trữ → khớp cái chưa lưu trữ), `nhap-csv-ngoac-kep`. Chiều đỏ: tạm chỉ đánh hỏng dòng sau của cặp «hai trưởng» → FAIL `dong 12 (cap hai truong): hop le != hong`.

Đặt tên: `describe("xem-truoc")`, `test("xem-truoc: …")`, ba ca Review Focus là `test("xem-truoc: nhap-khoang-trang …")` v.v.

- [ ] **Step 4: E12 `ghi`**

`ghi: …` dùng cùng lô. Kỳ vọng rút từ `previewImport` thật: với mỗi dòng hợp lệ của kết quả xem trước, người đó có phòng ban chính tên đúng ô phòng ban, đúng bộ phận, đúng trưởng; mỗi dòng hỏng không để lại gì (người của dòng hỏng không có `orgPlacement` mới). Ghi lần hai: đếm `division`/`department` không đổi và `org.tree` (lọc id) bằng lần một. Lô toàn dòng hỏng → 400 `Không có dòng hợp lệ nào để ghi.`. Ca tiêm lỗi: gọi thẳng `new ToChucService(db)` với một `db` bọc (`Proxy`) ném lỗi ở lần `orgPlacement.upsert` thứ ba bên trong `$transaction` → sau đó 0 hàng `orgPlacement` của lô. Chiều đỏ: tạm bỏ `$transaction` (ghi tuần tự trên `this.db`) → FAIL `tiem loi dong 3: 2 dong da ghi != 0`.

Bổ sung ca thứ tư của E6: phiên `thuong` gọi `org.applyImport` → 403.

- [ ] **Step 5: Chạy, commit**

Run: `bun run test -- "cd apps/api && bun test test/to-chuc-nhap.spec.ts -t xem-truoc"`, `-t ghi`, và `bun run test -- "cd apps/api && bun test test/to-chuc.spec.ts -t truong"` → PASS.

```bash
git add apps/api/src/to-chuc apps/api/src/generated/server.ts apps/api/test/to-chuc-nhap.spec.ts apps/api/test/to-chuc.spec.ts
git commit -m "feat(api): nhập cây tổ chức từ bảng tính — xem trước, lỗi cặp, ghi một lần"
```

---

### Task 6: Điều phối — bộ lọc bộ phận ở máy chủ

Phục vụ E15. `independent: false`.

**Files:**
- Modify: `apps/api/src/onboarding/onboarding.contracts.ts:252-280`, `onboarding-danh-muc.ts:31-225,463-471`
- Test: `apps/api/test/to-chuc-dieu-phoi.spec.ts`

- [ ] **Step 1: Hợp đồng và lọc**

`planListInput` thêm `division: danhSachMa.default([]),`. `planRow` thêm `boPhanCapTrenId: z.string().nullable(),` ngay sau `boPhanTacId`.

`onboarding-danh-muc.ts`:
- `CHON_KE_HOACH_DANH_MUC.steps.select.department.select` thêm `divisionId: true`.
- `BuocTho.department` thêm `divisionId: string | null`.
- `dungHang` thêm `boPhanCapTrenId: dang?.department.divisionId ?? null,`.
- `LocDanhMuc` thêm `"division"` vào `Pick`; `DemBoLoc` thêm `division: FacetCount`.
- Hàm mới:

```ts
function khopDivision(hang: HangDanhMuc, loc: LocDanhMuc): boolean {
	return (
		loc.division.length === 0 ||
		(hang.boPhanCapTrenId !== null && loc.division.includes(hang.boPhanCapTrenId))
	);
}
```

- `locHang` thêm `&& khopDivision(h, loc)`; mảng trong `demBoLoc` thêm `khopDivision`; kết quả thêm `division: demTheo(tru(khopDivision), (h) => h.boPhanCapTrenId),`.
- `dangLoc` thêm `input.division.length > 0 ||`.

Mọi chỗ khác dựng `LocDanhMuc`/`PlanListInput` bằng tay (grep `nguoiGiao: \[\]` trong `apps/api/src` và `apps/api/test`) thêm `division: []`. Chạy `bun run check-types --filter=api` để trình biên dịch chỉ ra từng chỗ.

- [ ] **Step 2: E15 `loc-bo-phan`**

Gieo 6 kế hoạch (công ty tiền tố `TIEN_TO`), phòng ban đang cầm rải trên bộ phận A (3), B (2), chưa xếp (1); lọc `q: TIEN_TO` để cô lập. Hàm kỳ vọng độc lập trong tệp tính tập `planId` theo bộ phận từ fixture. Ma trận: `[A], [B], [A,B]` × [tập id trả về, `facetCounts.division[A]`/`[B]`] = 6; `division:[A]` + `boPhan:[phòng ban X của A]` = giao (1); không chọn = 6 kế hoạch (1). Gọi qua HTTP `onboarding.manDanhMuc`. Chiều đỏ: tạm lọc `hang.boPhanTacId` thay `boPhanCapTrenId` → FAIL `loc bo phan A: 0 ke hoach != 3`.

- [ ] **Step 3: Chạy cả các tệp danh mục cũ, commit**

Run: `bun run test -- "cd apps/api && bun test test/to-chuc-dieu-phoi.spec.ts test/quan-ly-danh-muc.spec.ts test/dieu-phoi.spec.ts"` → PASS. Nếu một bài kiểm cũ so `facetCounts` bằng `toEqual` trên cả object, thêm khoá `division: {}` vào đúng giá trị kỳ vọng đó — không đổi phần còn lại.

```bash
git add apps/api/src/onboarding apps/api/test/to-chuc-dieu-phoi.spec.ts
git commit -m "feat(api): danh mục điều phối lọc theo bộ phận của phòng ban đang cầm"
```

---
### Task 7: Đổi nhãn theo từ điển — Điều phối và sheet kế hoạch

Phục vụ E16 (phần chữ), E17. `independent: true` (chỉ chạm tệp chữ và một bài kiểm mới).

**Files:**
- Modify: `apps/app/lib/messages/onboarding.ts` (type ~269–433, `en` ~1–267, `vi` ~506–771)
- Modify: `apps/api/src/onboarding/onboarding-config.ts` (câu lỗi còn chữ «Bộ phận»), `apps/api/src/onboarding/onboarding.service.ts:293,794` (`NotFoundException` «Không có bộ phận nào…»)
- Test: `apps/app/test/doi-nhan-phong-ban.dom.tsx`

- [ ] **Step 1: Viết bài kiểm trước (đỏ)**

```tsx
import { describe, expect, test } from "bun:test";

const { onboardingMessages } = await import("@/lib/messages/onboarding");

function moiChuoi(o: unknown, duong = ""): [string, string][] {
	if (typeof o === "string") return [[duong, o]];
	if (o && typeof o === "object") {
		return Object.entries(o).flatMap(([k, v]) => moiChuoi(v, duong ? `${duong}.${k}` : k));
	}
	return [];
}

describe("nhan-dieu-phoi", () => {
	test("nhan-dieu-phoi: chu cap duoi la phong ban, bo loc cap tren la Bo phan", () => {
		const m = onboardingMessages("vi");
		expect([m.columns.department, m.facets.department, m.chia["bo-phan"], m.tao.khuon.stepDepartment]).toEqual([
			"Phòng ban",
			"Phòng ban đang cầm",
			"Phòng ban",
			"Phòng ban",
		]);
		expect(m.facets.division).toBe("Bộ phận");
		const viPham = moiChuoi(m)
			.filter(([duong]) => duong !== "facets.division")
			.filter(([, chu]) => /bộ phận/i.test(chu));
		expect(viPham.map(([d]) => d)).toEqual([]);
	});
});

describe("thoi-luong", () => {
	test("thoi-luong: o so ngay mang nhan Thoi luong / Duration", () => {
		expect(onboardingMessages("vi").sheet.fields.target).toBe("Thời lượng");
		expect(onboardingMessages("en").sheet.fields.target).toBe("Duration");
	});
});
```

Phần DOM của hai `describe` (dựng `PlanSteps` và ba màn Điều phối thật) thêm ở Task 10 Step 5 — sau khi màn Cài đặt Điều phối đổi xong.

Run: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/doi-nhan-phong-ban.dom.tsx; cd ../..` → FAIL (còn «Bộ phận», còn «Mục tiêu»).

- [ ] **Step 2: Sửa chữ**

Kiểu `OnboardingMessages`: `facets` thêm `"division"`; `settings` thêm `departmentsMoved: string; departmentsLink: string;`.

`vi` (chỉ các dòng đổi):

```ts
		department: "Phòng ban",
		department: "Phòng ban đang cầm",
		division: "Bộ phận",
		"bo-phan": "Phòng ban",
		boPhan: { title: "Thêm phòng ban", name: "Tên phòng ban" },
			stepDepartment: "Phòng ban",
			noDepartment:
				"Chưa có phòng ban nào. Thêm phòng ban ở Cài đặt › Tổ chức rồi mới soạn khuôn.",
		suaBoPhan: "Đổi tên phòng ban",
		departments: "Phòng ban",
		newDepartment: "Thêm phòng ban",
		noDepartment:
			"Chưa có phòng ban nào. Bước nào cũng thuộc một phòng ban, kể cả khi chưa ai nhận.",
		departmentsMoved: "Phòng ban nay dựng và sắp ở Cài đặt › Tổ chức, cùng bộ phận và người.",
		departmentsLink: "Mở Cài đặt › Tổ chức",
			target: "Thời lượng",
			body: "Thêm bước đầu tiên và chọn phòng ban giữ nó.",
```

`en`: `facets.division: "Division"`, `settings.departmentsMoved: "Departments now live in Settings › Organization, with divisions and people."`, `settings.departmentsLink: "Open Settings › Organization"`, `sheet.fields.target: "Duration"`.

Chữ ở máy chủ (`onboarding-config.ts`, `onboarding.service.ts`): mọi «Bộ phận»/«bộ phận» đang chỉ cấp phòng ban đổi thành «Phòng ban»/«phòng ban» (`boPhanTrongKhuon`, `boPhanConTrongKhuon`, `boPhanDaLuuTru`, hai `NotFoundException`). Tên khoá giữ nguyên.

- [ ] **Step 3: Chạy bài kiểm mới và bài kiểm cũ có đọc các chuỗi này**

Run: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/doi-nhan-phong-ban.dom.tsx && cd ../..` → PASS.
Run: `grep -rln "Bộ phận\|bộ phận" apps/api/test apps/app/test` — với mỗi tệp khớp, chạy nó; nếu nó so chuỗi câu lỗi cũ bằng chữ cứng, đổi đúng chuỗi đó theo câu mới (không đổi điều được khẳng định).

- [ ] **Step 4: Commit**

```bash
git add apps/app/lib/messages/onboarding.ts apps/api/src/onboarding/onboarding-config.ts apps/api/src/onboarding/onboarding.service.ts apps/app/test/doi-nhan-phong-ban.dom.tsx
git commit -m "feat(app): Điều phối gọi cấp dưới là phòng ban; ô Mục tiêu thành Thời lượng"
```

---

### Task 8: Màn Cài đặt › Tổ chức

Phục vụ E9, E18, E19, E24 (và E20/E22 ở Task 11). `independent: false` (cần `org.*` Task 2–5).

**Files:**
- Create: `apps/app/lib/messages/to-chuc.ts`
- Create: `apps/app/app/(app)/[slug]/settings/organization/page.tsx`, `to-chuc.tsx`, `cay-to-chuc.tsx`, `hop-thoai-don-vi.tsx`, `hop-thoai-vi-tri.tsx`, `da-luu-tru-to-chuc.tsx`, `lam-moi.ts`
- Modify: `apps/app/lib/cai-dat-dieu-huong.ts:14-25`, `apps/app/lib/messages/settings.ts:4-16,135-147`
- Test: `apps/app/test/to-chuc.dom.tsx`

**Interfaces:**
- Consumes: `trpc.org.tree`, `org.access`, `org.createDivision`, `org.renameDivision`, `org.reorderDivisions`, `org.archiveDivision`, `org.restoreDivision`, `org.purgeDivision`, `org.createDepartment`, `org.renameDepartment`, `org.moveDepartment`, `org.setHead`, `org.setPlacement`; `trpc.onboarding.archiveDepartment`, `restoreDepartment`, `purgeDepartment`.
- Produces: `export function ToChuc()` (client), `export type CayDuLieu = RouterOutputs["org"]["tree"]`, `export function useLamMoiToChuc(): () => Promise<void>`.

- [ ] **Step 1: Chữ `to-chuc.ts`**

```ts
import type { Locale } from "@crm/ui/lib/locale";

const vi = {
	title: "Tổ chức",
	loading: "Đang tải…",
	loi: { title: "Không tải được cây tổ chức.", action: "Thử lại" },
	rong: {
		title: "Chưa có bộ phận nào",
		body: "Thêm bộ phận đầu tiên, rồi thêm phòng ban vào nó.",
	},
	doPhu: "{x}/{m} thành viên có phòng ban chính · {k} phòng ban chưa có trưởng",
	chiDoc: "Chỉ quản trị sửa được cây tổ chức.",
	tim: "Tìm người, bộ phận hoặc phòng ban",
	cay: "Cây tổ chức",
	themBoPhan: "Thêm bộ phận",
	themPhongBan: "Thêm phòng ban",
	nhap: "Nhập từ bảng tính",
	chuaXep: "Chưa xếp vào bộ phận",
	chuaCoPhongBan: "Chưa có phòng ban · {n} người",
	soPhongBan: "{n} phòng ban",
	soNguoi: "{n} người",
	chuaCoTruong: "Chưa có trưởng",
	chuaCoTruongBoPhan: "Chưa có trưởng bộ phận",
	truongPhongBan: "Trưởng phòng ban",
	truongBoPhan: "Trưởng bộ phận",
	phu: "phụ",
	menu: "Thao tác với {ten}",
	doiTen: "Đổi tên",
	datTruong: "Đặt trưởng",
	chuyen: "Chuyển sang bộ phận khác",
	luuTru: "Lưu trữ",
	khoiPhuc: "Khôi phục",
	xoaHan: "Xoá hẳn",
	daLuuTru: "Đã lưu trữ · {n}",
	hoanTac: "Hoàn tác",
	daLuuTruTen: "Đã lưu trữ {ten}",
	xacNhanLuuTru: { tieuDe: "Lưu trữ {ten}?", than: "Nó rời cây. Khôi phục lúc nào cũng được ở mục Đã lưu trữ.", giu: "Giữ lại" },
	xacNhanXoa: { tieuDe: "Xoá hẳn {ten}?", than: "Không còn gì trỏ tới nó. Xoá rồi không lấy lại được.", giu: "Giữ lại" },
	donVi: {
		tenBoPhan: "Tên bộ phận",
		tenPhongBan: "Tên phòng ban",
		taoBoPhan: "Thêm bộ phận",
		taoPhongBan: "Thêm phòng ban vào {bp}",
		doiTenBoPhan: "Đổi tên bộ phận",
		doiTenPhongBan: "Đổi tên phòng ban",
		truongCua: "Trưởng của {ten}",
		khongAi: "Chưa có trưởng",
		chuyenDi: "Chuyển {ten} sang",
		luu: "Lưu",
		huy: "Huỷ",
	},
	viTri: {
		tieuDe: "Vị trí trong tổ chức — {ten}",
		chinh: "Phòng ban chính",
		chuaChon: "Chưa chọn",
		phu: "Phòng ban phụ",
		themPhu: "Thêm phòng ban phụ",
		boPhu: "Bỏ phòng ban phụ {ten}",
		quanLy: "Quản lý trực tiếp",
		khongCo: "Chưa có quản lý",
		theoTruongPb: "Theo trưởng phòng ban chính. Đổi trưởng phòng ban thì quản lý đổi theo.",
		theoTruongBp: "Theo trưởng bộ phận của phòng ban chính.",
		chonTay: "Đã chọn tay. Trưởng phòng ban chính là {ten}.",
		chonTayKhongTruong: "Đã chọn tay.",
		chonKhac: "Chọn người khác",
		veTheoTruong: "Về theo trưởng phòng ban",
		luu: "Lưu",
		huy: "Huỷ",
	},
};

type ToChucMessages = typeof vi;

const en: ToChucMessages = {
	title: "Organization",
	loading: "Loading…",
	loi: { title: "Couldn't load the organization tree.", action: "Try again" },
	rong: { title: "No division yet", body: "Add the first division, then add departments to it." },
	doPhu: "{x}/{m} members have a primary department · {k} departments without a head",
	chiDoc: "Only admins can change the organization tree.",
	tim: "Search people, divisions or departments",
	cay: "Organization tree",
	themBoPhan: "Add division",
	themPhongBan: "Add department",
	nhap: "Import from spreadsheet",
	chuaXep: "Not in a division",
	chuaCoPhongBan: "No department · {n} people",
	soPhongBan: "{n} departments",
	soNguoi: "{n} people",
	chuaCoTruong: "No head",
	chuaCoTruongBoPhan: "No division head",
	truongPhongBan: "Department head",
	truongBoPhan: "Division head",
	phu: "secondary",
	menu: "Actions for {ten}",
	doiTen: "Rename",
	datTruong: "Set head",
	chuyen: "Move to another division",
	luuTru: "Archive",
	khoiPhuc: "Restore",
	xoaHan: "Delete forever",
	daLuuTru: "Archived · {n}",
	hoanTac: "Undo",
	daLuuTruTen: "Archived {ten}",
	xacNhanLuuTru: { tieuDe: "Archive {ten}?", than: "It leaves the tree. Restore it any time from Archived.", giu: "Keep" },
	xacNhanXoa: { tieuDe: "Delete {ten} forever?", than: "Nothing points to it. This cannot be undone.", giu: "Keep" },
	donVi: {
		tenBoPhan: "Division name",
		tenPhongBan: "Department name",
		taoBoPhan: "Add division",
		taoPhongBan: "Add department to {bp}",
		doiTenBoPhan: "Rename division",
		doiTenPhongBan: "Rename department",
		truongCua: "Head of {ten}",
		khongAi: "No head",
		chuyenDi: "Move {ten} to",
		luu: "Save",
		huy: "Cancel",
	},
	viTri: {
		tieuDe: "Place in organization — {ten}",
		chinh: "Primary department",
		chuaChon: "Not set",
		phu: "Secondary departments",
		themPhu: "Add secondary department",
		boPhu: "Remove secondary department {ten}",
		quanLy: "Direct manager",
		khongCo: "No manager",
		theoTruongPb: "From the primary department's head. Changes when the head changes.",
		theoTruongBp: "From the division head of the primary department.",
		chonTay: "Chosen by hand. The primary department's head is {ten}.",
		chonTayKhongTruong: "Chosen by hand.",
		chonKhac: "Choose someone else",
		veTheoTruong: "Back to the department head",
		luu: "Save",
		huy: "Cancel",
	},
};

const BANG = { en, vi } satisfies Record<Locale, ToChucMessages>;

export function toChucMessages(locale: Locale): ToChucMessages {
	return BANG[locale];
}

export function dien(mau: string, gia: Record<string, string | number>): string {
	return mau.replace(/\{(\w+)\}/g, (_, k: string) => String(gia[k] ?? ""));
}
```

`settings.ts`: `thanhBen` thêm `toChuc: "Organization"` (en) và `toChuc: "Tổ chức"` (vi). `cai-dat-dieu-huong.ts`: thêm `{ khoa: "toChuc", href: \`${GOC_CAI_DAT}/organization\` },` ngay trước mục `dieuPhoi`.

- [ ] **Step 2: Bài kiểm DOM `to-chuc.dom.tsx` (đỏ trước)**

Khuôn theo `sua-luu-tru.dom.tsx`: `mock.module("@/lib/trpc/client", …)` với `thuTuc(ten, doc, viet?)`, `ghi(ten, apDung)` ghi vào `daGoi`, `NuqsTestingAdapter`, `QueryClientProvider`, `LocaleProvider locale="vi"`, `TooltipProvider`, `<Toaster />`, `cho(...)`, `bam(...)` năm sự kiện chuột. Fixture `CAY` là object đúng kiểu `RouterOutputs["org"]["tree"]`: bộ phận `bp-kd` «Kinh doanh» (trưởng Lan), `bp-vh` «Vận hành» (không trưởng); phòng ban `pb-1` «Kinh doanh vùng 1» (trưởng Hùng; người Hùng chính, Mai chính), `pb-cskh` «Chăm sóc khách hàng» (người Thảo chính, Mai phụ), `pb-kho` «Kho vận» (không trưởng, Tuấn chính); `chuaXep` gồm `pb-pc` «Pháp chế»; `chuaCoPhongBan` gồm Quân; `archived.departments` gồm `{id:"pb-cu", name:"Marketing (cũ)", purgeable:true}`; `people` đủ mọi người với `managerSource` đúng; `coverage {members: 7, withPrimary: 5, departmentsWithoutHead: 2}`. `access` trả `{ canManage: quyen }` với biến `quyen` đổi theo ca.

```tsx
describe("chi-doc", () => {
	test("chi-doc: thanh vien thuong thay cay va do phu, khong co nut sua nao", async () => {
		quyen = false;
		const s = await mo(<ToChuc />);
		expect(s.o.textContent).toContain("5/7 thành viên có phòng ban chính · 2 phòng ban chưa có trưởng");
		for (const ten of ["Kinh doanh", "Vận hành", "Kinh doanh vùng 1", "Chăm sóc khách hàng", "Pháp chế"]) {
			expect(s.o.textContent).toContain(ten);
		}
		expect([
			nutCo(s.o, "Thêm bộ phận"),
			nutCo(s.o, "Nhập từ bảng tính"),
			s.o.querySelectorAll('[aria-label^="Thao tác với"]').length > 0,
			s.o.querySelectorAll('[aria-haspopup="dialog"][data-nguoi]').length > 0,
		]).toEqual([false, false, false, false]);
	});
	test("chi-doc: doi chung — quan tri thay du bon loai nut", async () => {
		quyen = true;
		const s = await mo(<ToChuc />);
		expect([
			nutCo(s.o, "Thêm bộ phận"),
			nutCo(s.o, "Nhập từ bảng tính"),
			s.o.querySelectorAll('[aria-label^="Thao tác với"]').length > 0,
			s.o.querySelectorAll('[aria-haspopup="dialog"][data-nguoi]').length > 0,
		]).toEqual([true, true, true, true]);
	});
});
```

`cay-man`: năm khẳng định của E18 (Mai dưới `pb-1` không «phụ», dưới `pb-cskh` có «phụ»; Quân trong `[data-nhom="chua-co-phong-ban"]`; «Pháp chế» trong `[data-nhom="chua-xep"]`; huy hiệu «Trưởng phòng ban» cạnh Hùng, «Trưởng bộ phận» cạnh Lan) + `translate="no"`: số phần tử có `data-ten` bằng số phần tử có `data-ten` VÀ `translate="no"`.

`vi-tri-man`: bấm Mai (quản lý theo trưởng phòng ban) → hộp thoại chứa «Theo trưởng phòng ban chính», không có nút «Về theo trưởng phòng ban»; đóng; bấm Thảo (fixture: `managerSource: "chon-tay"`, `managerOverrideId: "lan"`) → chứa «Đã chọn tay», có nút; bấm nút rồi «Lưu» → `daGoi` có `setPlacement` với `managerUserId: null`.

`luu-tru-man`: mở «Đã lưu trữ · 1» → «Marketing (cũ)» có «Khôi phục» và «Xoá hẳn»; không phòng ban chưa lưu trữ nào có nút «Xoá hẳn» (đếm nút trong `[data-phong-ban]`); hộp thoại vị trí của Mai: ô chọn phòng ban chính không có «Marketing (cũ)»; `archiveDepartment` ở chế độ `"loi"` trả `Còn 2 người có phòng ban chính ở đây — chuyển họ trước.` → sau khi bấm «Lưu trữ» trên «Kinh doanh vùng 1» và xác nhận, thông báo hiện đúng câu đó và «Kinh doanh vùng 1» vẫn trong cây.

Run: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/to-chuc.dom.tsx; cd ../..` → FAIL (chưa có `ToChuc`).

- [ ] **Step 3: `lam-moi.ts` và `page.tsx`**

```ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

export function useLamMoiToChuc(): () => Promise<void> {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	return async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: trpc.org.tree.queryKey() }),
			queryClient.invalidateQueries({ queryKey: trpc.onboarding.listDepartments.queryKey() }),
			queryClient.invalidateQueries({ queryKey: trpc.onboarding.manDanhMuc.queryKey() }),
		]);
	};
}
```

`page.tsx` chép khuôn `settings/onboarding/page.tsx`: tiêu đề `toChucMessages(await getLocale()).title`, `generateMetadata` cùng chữ, `CaiDat` prefetch `trpc.org.tree.queryOptions()` và `trpc.org.access.queryOptions()`, render `<HydrateClient><ToChuc /></HydrateClient>`.

- [ ] **Step 4: `to-chuc.tsx`**

```tsx
"use client";

import Add from "@carbon/icons-react/es/Add";
import Search from "@carbon/icons-react/es/Search";
import Upload from "@carbon/icons-react/es/Upload";
import { Button } from "@crm/ui/components/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@crm/ui/components/input-group";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { dien, toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { CayToChuc } from "./cay-to-chuc";
import { DaLuuTruToChuc } from "./da-luu-tru-to-chuc";
import { HopThoaiDonVi, type YeuCauDonVi } from "./hop-thoai-don-vi";
import { HopThoaiNhap } from "./hop-thoai-nhap";
import { HopThoaiViTri } from "./hop-thoai-vi-tri";

export type CayDuLieu = RouterOutputs["org"]["tree"];

export function ToChuc() {
	const m = toChucMessages(useLocale());
	const trpc = useTRPC();
	const cay = useQuery(trpc.org.tree.queryOptions());
	const quyen = useQuery(trpc.org.access.queryOptions());
	const [tim, setTim] = useState("");
	const [nguoiMo, setNguoiMo] = useState<string | null>(null);
	const [donVi, setDonVi] = useState<YeuCauDonVi | null>(null);
	const [moNhap, setMoNhap] = useState(false);

	if (cay.isPending || quyen.isPending) {
		return (
			<div aria-live="polite" className="flex flex-col gap-2" data-trang-thai="ST-tochuc-dangtai">
				<span className="text-muted-foreground text-sm">{m.loading}</span>
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}
	if (cay.isError || !cay.data) {
		return (
			<Empty data-trang-thai="ST-tochuc-loi">
				<EmptyHeader>
					<EmptyTitle>{m.loi.title}</EmptyTitle>
				</EmptyHeader>
				<EmptyContent>
					<Button variant="outline" onClick={() => void cay.refetch()}>
						{m.loi.action}
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	const d = cay.data;
	const sua = quyen.data?.canManage === true;
	const rong = d.divisions.length === 0 && d.chuaXep.length === 0;
	const nguoi = nguoiMo ? d.people.find((p) => p.id === nguoiMo) : undefined;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-sm" aria-live="polite" data-do-phu>
					{dien(m.doPhu, { x: d.coverage.withPrimary, m: d.coverage.members, k: d.coverage.departmentsWithoutHead })}
				</p>
				{sua ? (
					<span className="flex flex-wrap gap-2">
						<Button variant="outline" onClick={() => setMoNhap(true)}>
							<Icon icon={Upload} data-icon="inline-start" />
							{m.nhap}
						</Button>
						<Button onClick={() => setDonVi({ loai: "tao-bo-phan" })}>
							<Icon icon={Add} data-icon="inline-start" />
							{m.themBoPhan}
						</Button>
					</span>
				) : (
					<span className="text-muted-foreground text-sm" data-trang-thai="ST-tochuc-chidoc">
						{m.chiDoc}
					</span>
				)}
			</div>
			{rong ? (
				<Empty data-trang-thai="ST-tochuc-rong">
					<EmptyHeader>
						<EmptyTitle>{m.rong.title}</EmptyTitle>
						<EmptyDescription>{m.rong.body}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : (
				<>
					<InputGroup>
						<InputGroupAddon>
							<Icon icon={Search} />
						</InputGroupAddon>
						<InputGroupInput aria-label={m.tim} placeholder={m.tim} value={tim} onChange={(e) => setTim(e.target.value)} />
					</InputGroup>
					<CayToChuc cay={d} sua={sua} tim={tim} moNguoi={setNguoiMo} moDonVi={setDonVi} />
				</>
			)}
			{sua ? <DaLuuTruToChuc cay={d} /> : null}
			{nguoi ? <HopThoaiViTri key={nguoi.id} cay={d} nguoi={nguoi} dong={() => setNguoiMo(null)} /> : null}
			{donVi ? <HopThoaiDonVi key={JSON.stringify(donVi)} cay={d} yeuCau={donVi} dong={() => setDonVi(null)} /> : null}
			{moNhap ? <HopThoaiNhap dong={() => setMoNhap(false)} /> : null}
		</div>
	);
}
```

(`HopThoaiNhap` là Task 9; ở Task 8 tạo tệp `hop-thoai-nhap.tsx` với `export function HopThoaiNhap({ dong }: { dong: () => void }) { return null; }` để biên dịch được, Task 9 viết thật.)

- [ ] **Step 5: `cay-to-chuc.tsx`**

Khuôn hình theo bản mẫu `apps/app/app/proto/_modules/cau-truc-to-chuc/man-to-chuc.tsx` (các hàm `MenuDonVi`, `Nguoi`, `PhongBan`, `BoPhan`, `ManToChuc`) — đem sang và nối dữ liệu thật:
- `Nguoi` nhận `{ nguoi: {id,name,email}, nhan: string | null, sua, mo }`; khi `sua` là `<Button variant="ghost" size="xs" aria-haspopup="dialog" data-nguoi={id} onClick={() => mo(id)}>`, tên trong `<span translate="no" data-ten>`.
- `PhongBan` hiện `people` của node; người `primary:false` mang nhãn `m.phu`; trưởng mang `m.truongPhongBan`; không trưởng hiện `m.chuaCoTruong`. Menu (`aria-label={dien(m.menu,{ten})}`) có `doiTen` → `moDonVi({loai:"doi-ten", don:"phong-ban", id, name})`, `datTruong` → `{loai:"truong", don:"phong-ban", id, name}`, `chuyen` → `{loai:"chuyen", id, name, divisionId}`, `luuTru` → mở `ConfirmDialog` (từ `@/app/(app)/[slug]/settings/members/confirm-dialog`) rồi `onboarding.archiveDepartment`; thành công → `useLamMoiToChuc()` + `toast(dien(m.daLuuTruTen,{ten}), { action: { label: m.hoanTac, onClick: () => restoreDepartment } })`; lỗi → `toast.error(error.message)`.
- `BoPhan` là `Collapsible defaultOpen asChild`; hàng đầu là `CollapsibleTrigger` (nút `ghost`, có `aria-expanded` do Radix) + menu (`doiTen`, `datTruong`, `themPhongBan` → `{loai:"tao-phong-ban", divisionId, name}`, `luuTru` → `org.archiveDivision` cùng khuôn xác nhận/hoàn tác với `org.restoreDivision`). Phòng ban trong bộ phận bọc `SortableList ids=[…] onReorder={(moi) => moveDepartment({ id: moiDuocDoi, divisionId, index })}` — id được dời là phần tử ở vị trí mới khác vị trí cũ đầu tiên; `SortableItem disabled={!sua}`.
- Danh sách bộ phận bọc `SortableList` gọi `org.reorderDivisions({ ids })`.
- Hai nhóm cuối `data-nhom="chua-xep"` và `data-nhom="chua-co-phong-ban"`.
- Tìm: `khop(chu, tim)` so `toLocaleLowerCase("vi")`; bộ phận còn nếu tên nó hoặc một phòng ban/người trong nó khớp; khi `tim !== ""` mọi `Collapsible` `open`.
- `data-bo-phan={id}`, `data-phong-ban={id}` trên `<li>`.

Kiểu nhận vào khai trong chính tệp: `import type { CayDuLieu } from "./to-chuc"`, `import type { YeuCauDonVi } from "./hop-thoai-don-vi"`.

- [ ] **Step 6: `hop-thoai-don-vi.tsx`**

```tsx
export type YeuCauDonVi =
	| { loai: "tao-bo-phan" }
	| { loai: "tao-phong-ban"; divisionId: string | null; name: string }
	| { loai: "doi-ten"; don: "bo-phan" | "phong-ban"; id: string; name: string }
	| { loai: "truong"; don: "bo-phan" | "phong-ban"; id: string; name: string }
	| { loai: "chuyen"; id: string; name: string; divisionId: string | null };
```

Một `Dialog` (khuôn `phat-chia-dialog.tsx`): `tao-*`/`doi-ten` → một `Field` + `Input translate="no" maxLength={80}`, lỗi máy chủ hiện trong `FieldError role="alert"` dưới ô và chữ đã gõ giữ nguyên; `truong` → `Select` các ứng viên (phòng ban: người của `people` node đó; bộ phận: mọi `cay.people`) + mục `m.donVi.khongAi` giá trị `"__none"` → gửi `userId: null`; `chuyen` → `Select` bộ phận + mục `m.chuaXep` (`"__none"` → `divisionId: null`), gửi `org.moveDepartment({ id, divisionId, index: 0 })`. Nút lưu `disabled` khi đang gửi hoặc ô tên trống; một lần gửi (khuôn `dangGui` ref của `khung-tao.tsx`). Thành công → `useLamMoiToChuc()` rồi `dong()`.

- [ ] **Step 7: `hop-thoai-vi-tri.tsx`**

Khuôn hình từ `HopThoaiViTri` của bản mẫu. Trạng thái cục bộ `chinh`, `phu[]`, `quanLyTay` khởi từ `nguoi`. `Select` phòng ban chính gom theo bộ phận (`SelectGroup` + `SelectLabel translate="no"`) + nhóm `m.chuaXep`, chỉ phòng ban chưa lưu trữ (lấy từ `cay.divisions[].departments` và `cay.chuaXep`), mục `"__none"` = `m.viTri.chuaChon`. Phòng ban phụ: `Badge variant="secondary"` + `Button variant="ghost" size="icon-xs" aria-label={dien(m.viTri.boPhu,{ten})}`; `Select` «Thêm phòng ban phụ» loại phòng ban chính và phòng ban đã chọn. Quản lý: dòng người (`PersonAvatar`, tên `translate="no"`) + `FieldDescription`:
- `managerSource === "chon-tay"` → `dien(m.viTri.chonTay, {ten: tên trưởng phòng ban chính})` (hoặc `chonTayKhongTruong`), kèm nút `m.viTri.veTheoTruong` → `quanLyTay = null`.
- `"truong-phong-ban"` → `m.viTri.theoTruongPb`; `"truong-bo-phan"` → `m.viTri.theoTruongBp`; `"khong-co"` → `m.viTri.khongCo`.
- Nút `m.viTri.chonKhac` mở `Select` mọi người trừ chính mình → `quanLyTay = id`.
«Lưu» → `org.setPlacement({ userId, primaryDepartmentId: chinh, secondaryDepartmentIds: phu, managerUserId: quanLyTay })`; lỗi hiện `Alert variant="destructive"` trong hộp thoại, dữ liệu giữ nguyên.

- [ ] **Step 8: `da-luu-tru-to-chuc.tsx`**

Khuôn `settings/onboarding/da-luu-tru.tsx`, nguồn là `cay.archived.divisions` + `cay.archived.departments` (không gọi truy vấn riêng). «Khôi phục» → `org.restoreDivision` / `onboarding.restoreDepartment`; «Xoá hẳn» chỉ khi `purgeable`, qua `ConfirmDialog` với `m.xacNhanXoa`, gọi `org.purgeDivision` / `onboarding.purgeDepartment`. Nhãn nút mở: `dien(m.daLuuTru, { n })`. Không có mục nào → `null`.

- [ ] **Step 9: Chạy, sửa tới xanh, commit**

Run: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/to-chuc.dom.tsx; cd ../..` → PASS (`chi-doc`, `cay-man`, `vi-tri-man`, `luu-tru-man`).
Chiều đỏ E9: tạm bỏ điều kiện `sua ?` quanh nút nhập → FAIL `chi doc: nut Nhap tu bang tinh co mat`; hoàn lại.
Run: `bun run check-types --filter=app` → không lỗi.

```bash
git add apps/app/lib/messages/to-chuc.ts apps/app/lib/messages/settings.ts apps/app/lib/cai-dat-dieu-huong.ts "apps/app/app/(app)/[slug]/settings/organization" apps/app/test/to-chuc.dom.tsx
git commit -m "feat(app): màn Cài đặt › Tổ chức — cây, người, trưởng, quản lý, lưu trữ"
```

---

### Task 9: Hộp thoại nhập từ bảng tính

Phục vụ E13. `independent: false`.

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/organization/hop-thoai-nhap.tsx`, `apps/app/lib/messages/to-chuc.ts`
- Test: `apps/app/test/to-chuc.dom.tsx` (`describe("nhap-man")`)

- [ ] **Step 1: Chữ** — thêm vào `vi` (và bản `en` tương ứng):

```ts
	nhapHop: {
		tieuDe: "Nhập từ bảng tính",
		moTa: "Bốn cột theo thứ tự: email · phòng ban · bộ phận · trưởng. Cột trưởng để trống, hoặc ghi «phòng ban» hay «bộ phận».",
		o: "Dán các dòng từ bảng tính",
		goiY: "Hoặc chọn tệp .csv — tối đa 1000 dòng.",
		chonTep: "Chọn tệp .csv",
		xemTruoc: "Xem trước",
		dangXem: "Đang xem trước…",
		tomTat: "{v} dòng hợp lệ · {h} dòng hỏng",
		tomTatTao: " · sẽ tạo {pb} phòng ban, {bp} bộ phận",
		ghi: "Ghi {v} dòng · bỏ {h} dòng hỏng",
		ghiHet: "Ghi {v} dòng",
		khongGhi: "Không có dòng nào để ghi",
		dangGhi: "Đang ghi…",
		daGhi: "Đã ghi {n} dòng",
		dong: "Dòng {n}: {loi}",
		cot: { dong: "Dòng", email: "Email", phongBan: "Phòng ban", boPhan: "Bộ phận", truong: "Trưởng", ketQua: "Kết quả" },
		hopLe: "Hợp lệ",
		hong: "Hỏng",
		huy: "Huỷ",
	},
```

- [ ] **Step 2: Bài kiểm `nhap-man` (đỏ)**

Mock `org.previewImport` trả kết quả gia lập 4 hợp lệ + 3 hỏng (câu lỗi thật từ `TO_CHUC` chép thành chuỗi trong fixture); `org.applyImport` ghi `dauVao` vào `daGoi`. Dán chữ `CHU_GOC` (bảy dòng tab) vào ô, bấm «Xem trước», chờ bảng. Khẳng định: nút ghi đọc `Ghi 4 dòng · bỏ 3 dòng hỏng`; bảng có 7 `tbody tr`; danh sách `[aria-label="Dòng hỏng"] li` có 3 mục, mỗi mục chứa đúng câu lỗi; bấm ghi → `dauVaoCuoi("applyImport")` là `{ text: CHU_GOC }` (so bằng `toEqual`). Ca hỏng hết: gia lập 0 hợp lệ → nút `disabled` và đọc `Không có dòng nào để ghi`. Chiều đỏ: tạm gửi `{ rows }` thay `{ text }` → FAIL `applyImport nhan mang dong, khong phai chu`.

- [ ] **Step 3: `hop-thoai-nhap.tsx`**

`Dialog open onOpenChange={(mo) => { if (!mo && !dangGhi) dong(); }}`, `DialogContent className="sm:max-w-(--container-sheet)"` (khuôn đang dùng trong app). `Field` + `Textarea` (trạng thái `chu`), `<input type="file" accept=".csv,text/csv" className="sr-only">` do nút «Chọn tệp .csv» kích; tệp đọc bằng `await file.text()` rồi `setChu`. «Xem trước» → `org.previewImport({ text: chu })` (`useMutation`), kết quả lưu vào state cùng `chuDaXem = chu`; sửa ô sau khi xem trước thì xoá kết quả (người phải xem lại). Hiện tóm tắt (`aria-live="polite"`), danh sách lỗi `<ul aria-label="Dòng hỏng" className="flex flex-col gap-1 text-destructive text-sm">` với `dien(m.nhapHop.dong,{n: line, loi: error})`, rồi bảng (`Table`, cột `Kết quả` chỉ «Hợp lệ»/«Hỏng») trong `div className="max-h-80 overflow-auto rounded-lg border"`. Nút ghi: `disabled={valid === 0 || dangGhi}`; nhãn theo ba trường hợp; bấm → `org.applyImport({ text: chuDaXem })`; thành công → `useLamMoiToChuc()`, `toast(dien(m.nhapHop.daGhi,{n: written}))`, `dong()`; lỗi → `Alert variant="destructive"` trong hộp thoại. Email, tên đơn vị trong bảng `translate="no"`.

- [ ] **Step 4: Chạy, commit**

Run: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/to-chuc.dom.tsx -t nhap-man; cd ../..` → PASS.

```bash
git add "apps/app/app/(app)/[slug]/settings/organization/hop-thoai-nhap.tsx" apps/app/lib/messages/to-chuc.ts apps/app/test/to-chuc.dom.tsx
git commit -m "feat(app): nhập cây tổ chức từ bảng tính — xem trước, dòng hỏng, ghi chữ gốc"
```

---

### Task 10: Điều phối trỏ sang Tổ chức, bộ lọc bộ phận trên màn, dời bài kiểm hai hồ sơ cũ

Phục vụ E16, E17 (phần DOM), E23; giữ xanh `slt_*`, `nbn_*`. `independent: false`.

**Files:**
- Modify: `apps/app/app/(app)/[slug]/settings/onboarding/cai-dat-dieu-phoi.tsx`, `da-luu-tru.tsx`
- Delete: `apps/app/app/(app)/[slug]/settings/onboarding/danh-sach-bo-phan.tsx`, `them-bo-phan.tsx` (sau khi `grep -rn "danh-sach-bo-phan\|them-bo-phan" apps/app` chỉ còn hai tệp này và bài kiểm sắp sửa)
- Modify: `apps/app/app/(app)/[slug]/onboarding/onboarding-search-params.ts:26-85`, `danh-muc-table.tsx:186-277`, `danh-muc-cong-cu.tsx:27-41`, `page.tsx:71-83`
- Modify: `apps/app/test/sua-luu-tru.dom.tsx`, `apps/app/test/noi-bon-nut.dom.tsx`, `apps/app/test/doi-nhan-phong-ban.dom.tsx`

- [ ] **Step 1: Cài đặt › Điều phối 30 ngày**

`cai-dat-dieu-phoi.tsx`: bỏ nhập `DanhSachBoPhan`, `ThemBoPhan`; thẻ «Phòng ban» thay nội dung bằng:

```tsx
			<Card>
				<CardHeader>
					<CardTitle>{m.settings.departments}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3" data-trang-thai="ST-caidat-phongban-doi-cho">
					<p className="text-muted-foreground text-sm">{m.settings.departmentsMoved}</p>
					<div>
						<Button asChild variant="outline">
							<Link href={`/${slug}/settings/organization`}>{m.settings.departmentsLink}</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
```

(`slug` từ `useParams<{ slug: string }>()` của `next/navigation`; `Link` từ `next/link`.) `da-luu-tru.tsx`: bỏ phần phòng ban (truy vấn `listDepartments({archived:true})`, hai mutation phòng ban, loại `"boPhan"`), chỉ còn khuôn.

- [ ] **Step 2: Bộ lọc «Bộ phận» trên màn Điều phối**

`onboarding-search-params.ts`: `DANH_MUC_BO_LOC = ["division", "boPhan", "nguoiCam", "nguoiGiao"] as const`; `DanhMucInput` thêm `division: string[]`; `danhMucInput` thêm `division: list.division,`. `danh-muc-cong-cu.tsx` `useBoLoc`: thêm `division: null`. `page.tsx`: prefetch thêm `trpc.org.tree.queryOptions()`. `danh-muc-table.tsx`: `const cay = useQuery(trpc.org.tree.queryOptions());` và facet đứng đầu mảng:

```tsx
		{
			id: "division",
			label: m.facets.division,
			options: tuyChonCoDem(cay.data?.divisions ?? [], facetCounts?.division, list.division),
		},
```

- [ ] **Step 3: Dời bài kiểm của hai hồ sơ cũ — giữ tên, đổi chỗ gắn**

Trong `sua-luu-tru.dom.tsx` và `noi-bon-nut.dom.tsx`, các `describe` sau đổi từ gắn `<CaiDatDieuPhoi />` sang gắn `<ToChuc />` (nhập từ `@/app/(app)/[slug]/settings/organization/to-chuc`), mock thêm `org.tree` (fixture một bộ phận chứa ba phòng ban A, B, C như danh sách phẳng cũ của tệp, cộng `org.access`), và đổi thủ tục được khẳng định như bảng — lời hứa hành vi giữ nguyên:

| `describe` | Trước | Sau |
|---|---|---|
| `doi-ten-bo-phan` | menu «Đổi tên» → `updateDepartment` 1 lần, `createDepartment` 0 | menu «Đổi tên» trên phòng ban → `org.renameDepartment` 1 lần qua `renameInput` thật, `org.createDepartment` 0; đối chứng tên rỗng giữ nguyên; ca «hồ sơ kế hoạch hiện departmentName» không đổi (không gắn cài đặt) |
| `sap-bo-phan` | kéo C lên đầu → `reorderDepartments({ids:[C,A,B]})` | kéo C lên đầu trong bộ phận → `org.moveDepartment({id:C, divisionId, index:0})` |
| `luu-tru-bo-phan` | xác nhận → `archiveDepartment`, hiện ở Đã lưu trữ, Hoàn tác → `restoreDepartment` | giữ nguyên thủ tục; «Đã lưu trữ» là mục của màn Tổ chức (fixture `archived.departments` cập nhật sau lưu trữ) |
| `bi-chan-luu-tru` | máy chủ từ chối → phòng ban ở lại, thông điệp hiện | giữ nguyên |
| `xoa-vinh-vien` (bốn ca) | nút chỉ có khi chưa từng dùng | hai ca phòng ban dời sang màn Tổ chức (dựa `purgeable` của `archived.departments`); hai ca khuôn giữ ở `CaiDatDieuPhoi` |
| `khoa-theo-quyen` | mọi nút cấu hình khoá khi không đủ quyền | phần phòng ban: màn Tổ chức với `canManage:false` không có nút sửa; phần khuôn giữ ở `CaiDatDieuPhoi` |
| `them-bo-phan` | «Thêm bộ phận» → `createDepartment` 1 lần qua `departmentCreateInput` | «Thêm phòng ban» trong menu bộ phận → `org.createDepartment` 1 lần qua `departmentCreateInput` của `to-chuc.contracts` (`divisionId` là bộ phận đó), danh sách hiện tên mới; đối chứng tên rỗng giữ nguyên |
| `chua-co-bo-phan` | không phòng ban thì nói thêm phòng ban trước | giữ ở `CaiDatDieuPhoi`/`SoanKhuon`; chữ nay trỏ sang Cài đặt › Tổ chức — khẳng định chứa `m.tao.khuon.noDepartment` mới |

Nếu một ca không giữ được lời hứa cũ sau khi đổi chỗ gắn, DỪNG và báo — không nới khẳng định.

- [ ] **Step 4: Chạy hai tệp cũ và các khoá của chúng**

Run: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/sua-luu-tru.dom.tsx && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/noi-bon-nut.dom.tsx; cd ../..` → PASS.
Run mọi khoá `slt_*`, `nbn_*` trong `_acceptance/config.yaml` (đọc lệnh từ file, chạy từng lệnh) → mọi lệnh mã 0.

- [ ] **Step 5: Phần DOM của E16, E17, E23 trong `doi-nhan-phong-ban.dom.tsx`**

- `nhan-dieu-phoi` thêm: dựng `DanhMucTable` (khuôn `danh-muc-quan-ly.dom.tsx`) → tiêu đề cột và nút bộ lọc «Phòng ban đang cầm» có mặt, nút «Bộ phận» có mặt; dựng `CaiDatDieuPhoi` → không còn `[data-bo-phan]`, có liên kết `href` kết thúc bằng `/settings/organization`.
- `thoi-luong` thêm: dựng `PlanSteps` với `plan.targetDays = 30`, vi và en → nhãn «Thời lượng»/«Duration» cạnh «30 ngày»/«30 days», không còn «Mục tiêu»/«Target» trong vùng chi tiết (4 khẳng định).
- `loc-bo-phan-man` (E23): mock `manDanhMuc` ghi lại input; mở với `?division=bp-a` → input cuối có `division: ["bp-a"]` (1); các dòng trên bảng đúng tập `rows` phản hồi gia lập (1); nhãn lựa chọn «Kinh doanh» có mặt khi `facetCounts.division["bp-a"] > 0` (1); `NuqsTestingAdapter onUrlUpdate` thấy `division=bp-a` giữ sau khi tải lại bằng cùng đường dẫn (1); bấm «Bỏ lọc» → input cuối `division: []` (1). Chiều đỏ: tạm bỏ `division: list.division` trong `danhMucInput` → FAIL `truy van danh muc: thieu ma bo phan A`.

Run: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/doi-nhan-phong-ban.dom.tsx; cd ../..` → PASS.

- [ ] **Step 6: Commit, rồi ghim lại hai hồ sơ cũ**

```bash
git add "apps/app/app/(app)/[slug]/settings/onboarding" "apps/app/app/(app)/[slug]/onboarding" apps/app/test/sua-luu-tru.dom.tsx apps/app/test/noi-bon-nut.dom.tsx apps/app/test/doi-nhan-phong-ban.dom.tsx
git commit -m "feat(app): Cài đặt Điều phối trỏ sang Tổ chức; lọc theo bộ phận; dời bài kiểm phòng ban sang màn Tổ chức"
```

Ghim lại (cây sạch ngoài `_acceptance/`):

```bash
FL=$(node scripts/resolve-plugin.mjs --plugin feature-loop --require scripts/repin-lane.mjs)
node "$FL/scripts/repin-lane.mjs" --root . --slug sua-luu-tru-dieu-phoi --slug noi-bon-nut-dieu-phoi --reason "hành vi phòng ban dời sang Cài đặt › Tổ chức (cau-truc-to-chuc AC-12)" --write
git add _acceptance/sua-luu-tru-dieu-phoi _acceptance/noi-bon-nut-dieu-phoi
git commit -m "repin(sua-luu-tru-dieu-phoi, noi-bon-nut-dieu-phoi): phòng ban dời sang Cài đặt › Tổ chức"
```

Làn đỏ ở hồ sơ nào → DỪNG, không ghim, báo dòng đỏ.

---

### Task 11: Phép đo trên trình duyệt thật, sàn thiết kế, tài liệu, năm lệnh chứng

Phục vụ E20, E21, E22. `independent: false`.

**Files:**
- Create: `_acceptance/cau-truc-to-chuc/rang/man-to-chuc.mjs`, `_acceptance/cau-truc-to-chuc/rang/san-thiet-ke.mjs`
- Modify: `docs/api.md` (mục mới «The organization tree»), `CONTEXT.md` (đoạn «Màn hình đổi nhãn ở lượt 1…» của mục Bộ phận và Phòng ban → thì quá khứ, đã đổi)

- [ ] **Step 1: `san-thiet-ke.mjs` (E21)**

Chép `_acceptance/keo-tha-thoa-thuan/rang/san-thiet-ke.mjs` nguyên khuôn, đổi `VUNG` thành:

```js
const VUNG = [
	/^apps\/app\/app\/\(app\)\/\[slug\]\/settings\/organization\/.+\.tsx$/,
	/^apps\/app\/app\/\(app\)\/\[slug\]\/settings\/onboarding\/.+\.tsx$/,
	/^apps\/app\/app\/\(app\)\/\[slug\]\/onboarding\/.+\.tsx$/,
];
```

và thêm, trước `process.exit`, kiểm `packages/ui` không đổi:

```js
const ui = git("diff", "--name-only", `${moc}...HEAD`, "--", "packages/ui").split("\n").filter(Boolean);
if (ui.length > 0) {
	hong += 1;
	console.log(`HONG packages/ui bi sua: ${ui.join(", ")}`);
}
```

Chiều đỏ: chép một tệp giao diện sang thư mục tạm trong `os.tmpdir()`, chèn `className="rounded-[7px]"`, chạy `design-gate.mjs --target <tệp tạm> --mode static` → mã khác 0 nhắc bán kính.

Run: `bun _acceptance/cau-truc-to-chuc/rang/san-thiet-ke.mjs; echo $?` → in số tệp > 0, mã 0.

- [ ] **Step 2: `man-to-chuc.mjs` (E20, E22)**

Khuôn `_acceptance/keo-tha-thoa-thuan/rang/man-bang-cot.mjs` (nhập `canhCay`, `APP`, `CHO_TAI`, `CHROME`, `datTrinhDuyet`, `goiApiTao`, `ket`, `khongDo`, `mu`, `phien`, `suySlug` từ `../../man-cai-dat-noi-tieng-viet/rang/*`). Hằng: `KHO = [320, 375, 768, 1024, 1440]`, `TIENG = ["vi","en"]`, `O_MONG = 10`, `KY_MONG = 50`, `MA = \`ttc${Date.now().toString(36)}\``.
- Cảnh cây trước tiên; lệch → mã 2.
- Gieo qua API bằng phiên `dev:session` (quản trị): 3 bộ phận, 6 phòng ban (1 chưa xếp), 12 người (`gieo` thành viên bằng `workspace.allowEmail` + `dev:session <email>` cho từng người, hoặc đọc 12 thành viên có sẵn nếu đủ — nếu không đủ, `KHONG DO DUOC` mã 2), 1 người không phòng ban; trưởng cho 4 phòng ban. Dọn ở `finally` (lưu trữ rồi xoá hẳn đơn vị có tiền tố `MA`; xoá vị trí đã gán).
- Mỗi ô (khổ × tiếng): mở `${APP}/${slug}/settings/organization`, chờ `[data-do-phu]`, chờ mạng yên + 1 giây hydrate; khẳng định `scrollWidth <= innerWidth`, `[data-do-phu]` thấy, ba tên bộ phận `MA…` thấy, ít nhất một huy hiệu trưởng thấy (4 × 10 = 40); chụp `evidence/to-chuc-<kho>-<tieng>.png`; ghi lỗi hydrate.
- 1440/vi và 375/vi: bấm một người → hộp thoại không tràn; mở «Nhập từ bảng tính», dán lô 5 dòng có 2 dòng hỏng, «Xem trước» → không tràn, 2 mục `[aria-label="Dòng hỏng"] li` (3 × 2 = 6); chụp `vi-tri-<kho>.png`, `nhap-xem-truoc-<kho>.png`.
- 1440/vi bàn phím: `Tab` tới nút bộ phận đầu, `Enter` đóng/mở (`aria-expanded` đổi), `Tab` tới một người, `Enter` → hộp thoại mở (2); chụp `ban-phim.png`.
- 1440/vi E22: «Thêm bộ phận», gõ tên `${MA} moi`, «Lưu» → tên xuất hiện; mở lại, gõ cùng tên viết hoa → câu `Đã có «…» ở cấp này.` dưới ô và số `[data-bo-phan]` không đổi (2); chụp `ten-trung.png`.
- Tổng 40 + 6 + 2 + 2 = 50 = `KY_MONG`; lệch → mã 2. `HONG …` → mã 1.

Run (máy chủ dev của CHÍNH cây này: app ở cổng riêng, `APP_URL`/`API_URL` đặt tay): `APP_URL=http://localhost:3710 API_URL=http://localhost:3711 bun _acceptance/cau-truc-to-chuc/rang/man-to-chuc.mjs; echo $?` → `o=10/10 khang-dinh=50/50`, mã 0. Sửa `expected` của E20 trong `evals.yaml` nếu số khẳng định thật khác 48 đã khai (ghi một dòng sổ `fix` stage S3 nói vì sao) — không đổi số âm thầm.

- [ ] **Step 3: Tài liệu**

`docs/api.md` thêm mục (tiếng Anh như phần còn lại):

```markdown
## The organization tree

`apps/api/src/to-chuc` owns divisions, department placement, heads and the direct
manager. Departments are still the `onboarding` table the 30-day plan assigns steps to.

- **Two fixed levels.** `Division` above `Department`; `divisionId` null means not
  placed yet. There is no third level.
- **One primary department per person is a primary key.** `OrgPlacement` is one row
  per user; secondaries live in `OrgSecondaryDepartment`.
- **A head is a column, not a role.** `canManageOrganization` gates every write; a head
  gets no extra permission.
- **Direct manager is derived on read** (`quan-ly.ts`): hand-picked → primary
  department head → its division head → none. Nothing stores the result.
- **People who left are filtered on read** by the `member` row; removing a member does
  not touch the tree.
- **Import** parses text on the server (`nhap.ts`), previews without writing, and
  writes only valid rows in one transaction from the original text, never from the
  preview.
```

`CONTEXT.md`: trong mục **Bộ phận**, đoạn «Màn hình đổi nhãn ở lượt 1 (`cay-to-chuc-co-nguoi`). Tới lúc đó …» thay bằng «Màn hình đã đổi nhãn ở lượt 1 (2026-10): Điều phối 30 ngày gọi danh sách đó là phòng ban.»; mục **Mục tiêu** đoạn nói ô sheet kế hoạch sẽ đổi → «đã đổi thành «Thời lượng»». Không sửa §10 của `docs/plan/lo-trinh-okr.md`.

- [ ] **Step 4: Năm lệnh chứng**

Run lần lượt (từ gốc kho, mỗi lệnh ghi log vào scratchpad):
`bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build` → cả năm mã 0.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/cau-truc-to-chuc/rang/man-to-chuc.mjs _acceptance/cau-truc-to-chuc/rang/san-thiet-ke.mjs docs/api.md CONTEXT.md
git commit -m "test(cau-truc-to-chuc): đo màn Tổ chức trên Chrome thật, sàn thiết kế; tài liệu cây tổ chức"
```

---

## Bảng phủ phép đo

| Phép đo | Task |
|---|---|
| E1, E2 | 1 |
| E1b, E3, E14 (phòng ban) | 2 |
| E5, E6, E7, E10, E14 (người) | 3 |
| E4, E8 | 4 |
| E11, E12 | 5 |
| E15 | 6 |
| E16 (chữ), E17 (chữ) | 7 |
| E9, E18, E19, E24 | 8 |
| E13 | 9 |
| E16, E17 (DOM), E23; giữ `slt_*`, `nbn_*` | 10 |
| E20, E21, E22 | 11 |
