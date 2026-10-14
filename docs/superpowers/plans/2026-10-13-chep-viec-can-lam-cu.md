# Chép việc cần làm cũ sang Việc — kế hoạch thi công (DA1b)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native, main loop) to implement
> this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi việc cần làm cũ (`activity` loại `TASK`) thành Việc mà bản gốc giữ nguyên; ba đường còn ghi
`TASK` thôi ghi; việc đã chép thôi hiện.

**Architecture:** Mở rộng → dời → thu hẹp. Hai cột mới trên `viec` (`activityGocId` unique FK, `khoaNguon`);
mọi lần ghi Việc đi qua `packages/db/src/viec-ghi.ts`; vòng lặp đếm/chép/đảo ở `packages/db/src/viec-chep.ts`,
lệnh `bun run viec:chep-cu` chỉ đọc cờ và in JSON. Đọc dòng thời gian và Tổng quan lọc «đã chép».

**Tech Stack:** Prisma 7 + Postgres, NestJS + nestjs-trpc, Next.js (React 19, nuqs), eve (`apps/agent`), Bun
test.

**Spec:** `docs/superpowers/specs/2026-10-13-chep-viec-can-lam-cu-design.md` · hợp đồng
`_acceptance/chep-viec-can-lam-cu/contract.md` (duyệt 13/10, manh) · bộ đo `_acceptance/chep-viec-can-lam-cu/evals.yaml`.

## Global Constraints

- Không chú thích trong mã, kể cả mã sửa (`AGENTS.md`).
- Mọi lệnh ghi Việc qua `@crm/db/viec-ghi`; mỗi thay đổi đúng một dòng `viecVet` (`docs/api.md` mục «Việc»).
- Hằng tinh chỉnh vào `VIEC` của `packages/db/src/viec.ts`, không rải ở chỗ dùng.
- JSON không kiểu (`activity.meta`) phân tích bằng Zod ở biên, một schema một tệp ở `packages/validation/src`.
- Client component không import `@crm/db` / `@crm/auth`.
- Migration mang mốc UTC thật lúc viết, sau `20261013015131`; kiểm `origin/onehub` ngay trước khi đẩy.
- Bằng chứng chạy: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` từ gốc.
- Tên bài kiểm mang mã `cvc-…` đúng như `_acceptance/config.yaml` (`-t cvc-chep-du`, `-t cvc-chep-lai`, …).
- Thông điệp ghim của từng bài kiểm chép NGUYÊN VĂN từ `expected` của eval tương ứng.

## Review Focus

1. Hàng TASK có `subject` chỉ toàn khoảng trắng và `body` nhiều dòng — tiêu đề lấy dòng đầu khác rỗng, không phải
   chuỗi trắng (Task 2, ca thêm trong `cvc-chep-du`).
2. Hàng TASK gắn công ty và thoả thuận của CHÍNH công ty đó — khối «Việc» của công ty hiện bản chép đúng một lần
   (Task 4, `cvc-hien` thêm vế `viec.cuaBanGhi({companyId})`).
3. «Hoạt động gần đây» của Tổng quan (`recentActivity`) không hiện hàng gốc đã chép (Task 4, `cvc-hien`, thông
   điệp `cvc: hoat dong gan day hien ban goc`).
4. Đường dẫn cũ `?tab=done` trong thẻ đã mở ở một tab khác — rơi về «Tất cả», không ném (Task 5, `E5b`).
5. ma-lech khi người cầm trịch đã sang vai «chỉ OKR» — kết quả có tên, không ném làm hỏng nhịp dispatch (Task 7,
   ca `cvc-ma-lech-nguoi-khong-nhan`).

---

### Task 1: Cột mới, nguồn vết mới (packages/db)

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `Viec`, model `Activity`)
- Create: `packages/db/prisma/migrations/<UTC thật>_chep_viec_can_lam/migration.sql`
- Modify: `packages/db/src/viec.ts` (`NGUON_VIEC`, `VIEC`, schema vết «tao»)
- Modify: `packages/validation/src/activity-meta.ts` → thêm tệp `packages/validation/src/viec-can-lam-meta.ts`

**Interfaces — Produces:**
- `Viec.activityGocId: string | null` (unique), quan hệ `Viec.activityGoc`, `Activity.viecChep`.
- `Viec.khoaNguon: string | null` (chỉ mục).
- `NGUON_VIEC` có `"tac-nhan"`, `"chep-cu"`.
- `VIEC.tieuDeViecCanLam = "Việc cần làm"`, `VIEC.khoaMaLech = (ma: string) => \`ma-lech:${ma}\``,
  `VIEC.chepThuTranMs = 10 * 60_000` (viết bằng đơn vị phút có sẵn nếu file có), `VIEC.thongDiep.chiQuanTriChep`,
  `VIEC.thongDiep.khongPhaiBanChep(id)`.
- Vết «tao»: `sau.chep?: { activityGocId: string; trangThai: TrangThaiViec; nguoiTaoGoc: NguoiVet | null }`.
- `parseViecCanLamMeta(value: unknown): { platformBrokerId: string | null }` ở
  `@crm/validation/viec-can-lam-meta`.

- [ ] **Step 1:** Thêm vào `model Viec`:

```prisma
  activityGocId   String?       @unique
  activityGoc     Activity?     @relation("ViecChep", fields: [activityGocId], references: [id], onDelete: SetNull)
  khoaNguon       String?

  @@index([khoaNguon])
```

  và vào `model Activity`: `viecChep        Viec?           @relation("ViecChep")`.

- [ ] **Step 2:** `cd packages/db && bunx prisma migrate dev --create-only --name chep_viec_can_lam` trên kho dev
  cục bộ; kiểm tên thư mục mang mốc UTC lúc tạo và lớn hơn `20261013015131`. SQL chỉ có `ALTER TABLE "viec" ADD
  COLUMN`, `CREATE UNIQUE INDEX`, `CREATE INDEX`, `ADD CONSTRAINT … FOREIGN KEY … ON DELETE SET NULL`. Không câu
  `INSERT`/`UPDATE` nào.
- [ ] **Step 3:** `bun run db:migrate` rồi `bun run --filter=@crm/db db:generate` (tên lệnh theo
  `packages/db/package.json`).
- [ ] **Step 4:** Sửa `viec.ts`: `NGUON_VIEC` thêm `"tac-nhan", "chep-cu"`; `VIEC` thêm các hằng ở Interfaces;
  vết «tao» `sau` thêm `chep: z.object({ activityGocId: z.string(), trangThai: z.enum(TRANG_THAI_VIEC),
  nguoiTaoGoc: nguoiVet.nullable() }).optional()`.
- [ ] **Step 5:** `viec-can-lam-meta.ts`:

```ts
import { z } from "zod";

const viecCanLamMeta = z
	.object({ platformBrokerId: z.string().trim().min(1).optional() })
	.nullable();

export type ViecCanLamMeta = { platformBrokerId: string | null };

export function parseViecCanLamMeta(value: unknown): ViecCanLamMeta {
	const parsed = viecCanLamMeta.parse(value ?? null);
	return { platformBrokerId: parsed?.platformBrokerId ?? null };
}
```

  thêm export subpath trong `packages/validation/package.json` theo nếp các tệp khác.
- [ ] **Step 6:** `bun run check-types` xanh.
- [ ] **Step 7:** Commit `feat(chep-viec-can-lam-cu): cột activityGocId, khoaNguon và nguồn vết tac-nhan, chep-cu`.

**Verify:** `bun run check-types` · **Evals:** nền cho E1–E14 · **independent:** false

---

### Task 2: Chép một việc, chép tất cả, đảo (packages/db)

**Files:**
- Modify: `packages/db/src/viec-ghi.ts` (`TaoViecInput.khoaNguon`, `chepViecCanLam`, `xoaBanChep`)
- Create: `packages/db/src/viec-chep.ts` (`demViecCanLam`, `chepTatCa`, `daoTatCa`)
- Create: `packages/db/test/support/viec-can-lam-cu.ts` (khuôn hàng TASK của ba đường ghi cũ)
- Create: `packages/db/test/viec-chep.spec.ts` (`cvc-chep-du`, `cvc-chep-lai`, `cvc-nguoi-tao`, `cvc-dao`)
- Modify: `packages/db/package.json` (export `./viec-chep`)

**Interfaces — Consumes:** Task 1. **Produces:**

```ts

export async function chepViecCanLam(
	tx: DbGhi,
	input: { activityId: string; nguoiChay: NguoiVet; now: Date },
): Promise<{ id: string } | null>;
export async function xoaBanChep(tx: DbGhi, viecId: string): Promise<void>;

export type SoDemViecCanLam = {
	taskTong: number; taskMo: number; taskXong: number; daChep: number; chuaChep: number;
	banChep: number; banChepDaDoi: number; nguoiTaoKhongNhan: number; taskTaoSau?: number;
};
export type ChepMot = typeof chepViecCanLam;
export async function demViecCanLam(db: Db, input?: { tu?: Date }): Promise<SoDemViecCanLam>;
export async function chepTatCa(db: Db, input: {
	nguoiChayId: string | null; now: Date; thu?: boolean; chepMot?: ChepMot;
}): Promise<{ thu: boolean; truoc: SoDemViecCanLam; chep: number; loi: { id: string; lyDo: string }[]; sau: SoDemViecCanLam }>;
export async function daoTatCa(db: Db, input: { caBanDaDoi: boolean; now: Date }):
	Promise<{ truoc: SoDemViecCanLam; xoa: number; giuLai: string[]; sau: SoDemViecCanLam }>;
```

- [ ] **Step 1: Khuôn hàng cũ.** `test/support/viec-can-lam-cu.ts` xuất `khuonApi`, `khuonTacNhan`, `khuonMaLech`
  — mỗi hàm nhận `{ createdById, subject?, body?, dueAt?, completedAt?, companyId?, contactId?, dealId?, planId?,
  createdAt? }` và gọi `db.activity.create` với ĐÚNG các cột mà đường ghi cũ đặt, chép từ mã ở `85c0e4cc9`:
  `activities.service.ts:152-188` (`occurredAt = createdAt`, `meta` null), `run-runtime.ts:317-338`
  (`meta: { source: "agent", agentId, runId, actionId }`, `occurredAt`), `ma-lech.ts:76-90`
  (`meta: { agent: "onboarding-identify", platformBrokerId }`, `planId`, `companyId`). Ghi sha nguồn trong tên
  hằng `KHUON_TU_SHA = "85c0e4cc9"`.
- [ ] **Step 2: Bài kiểm đỏ.** `viec-chep.spec.ts` theo nếp `viec-gieo.spec.ts` (organization `WORKSPACE_ID`,
  user + member tự dựng, dọn ở `afterAll`). Bốn `describe`:
  - `cvc-chep-du` — bảy ca của E1 cộng ca Review Focus 1 (`subject: "   "`, `body: "\n  Gọi lại\nchi tiết"` →
    tiêu đề `"Gọi lại"`). Mỗi assert ném đúng thông điệp ghim của E1. Bản gốc: `JSON.stringify` của
    `db.activity.findUnique` trước và sau bằng nhau.
  - `cvc-chep-lai` — chạy lại; cấy lỗi bằng `chepMot: (tx, i) => i.activityId === giua ? Promise.reject(new
    Error("cvc-loi-cay")) : chepViecCanLam(tx, i)`; song song `Promise.all([chepTatCa(...), chepTatCa(...)])`;
    `thu: true` với vân tay `count()` của `viec`, `viecVet`, `viecGan`.
  - `cvc-nguoi-tao` — ma trận 18 ô viết trước trong spec (mảng hằng `{ trangThai, gan, nguoiTao, ky vong }`); gỡ
    `cvc-roi` bằng `db.member.delete`; vai okr bằng `member.role = "okr"`.
  - `cvc-dao` — như E4; `activities.timeline` của E4 đo ở Task 4 (spec API), ở đây đo bằng
    `db.activity.findMany({ where: { dealId, type: "TASK", viecChep: null } })` có lại hai hàng.
- [ ] **Step 3:** `bun run test -- "cd packages/db && bun test test/viec-chep.spec.ts"` → đỏ vì chưa có hàm.
- [ ] **Step 4: `taoViec` nhận `khoaNguon?: string | null`** và ghi vào `data.khoaNguon`.
- [ ] **Step 5: `chepViecCanLam`** trong `viec-ghi.ts`:

```ts
const CHON_VIEC_CAN_LAM = {
	id: true, type: true, subject: true, body: true, dueAt: true, completedAt: true,
	createdAt: true, companyId: true, contactId: true, dealId: true, planId: true, meta: true,
	createdBy: { select: { id: true, name: true } },
	viecChep: { select: { id: true } },
} as const satisfies Prisma.ActivitySelect;

function tieuDeCu(subject: string | null, body: string | null): string {
	const tuSubject = subject?.trim();
	if (tuSubject) return tuSubject.slice(0, VIEC.tieuDeToiDa);
	const dong = body?.split("\n").map((d) => d.trim()).find((d) => d.length > 0);
	return dong ? dong.slice(0, VIEC.tieuDeToiDa) : VIEC.tieuDeViecCanLam;
}

function ganCu(goc: { companyId: string | null; contactId: string | null; dealId: string | null; planId: string | null }): BanGhiGan[] {
	const gan: BanGhiGan[] = [];
	if (goc.companyId) gan.push({ loai: "company", id: goc.companyId });
	if (goc.contactId) gan.push({ loai: "contact", id: goc.contactId });
	if (goc.dealId) gan.push({ loai: "deal", id: goc.dealId });
	if (goc.planId) gan.push({ loai: "plan", id: goc.planId });
	return gan;
}

export async function chepViecCanLam(
	tx: DbGhi,
	input: { activityId: string; nguoiChay: NguoiVet; now: Date },
): Promise<{ id: string } | null> {
	await tx.$queryRaw`SELECT id FROM activity WHERE id = ${input.activityId} FOR UPDATE`;
	const goc = await tx.activity.findUnique({ where: { id: input.activityId }, select: CHON_VIEC_CAN_LAM });
	if (goc === null || goc.type !== ActivityType.TASK) {
		throw new LoiViec("khong-thay", VIEC.thongDiep.khongCoViec(input.activityId));
	}
	if (goc.viecChep !== null) return null;
	const tacGia = nguoiCua(goc.createdBy);
	const xong = goc.completedAt !== null;
	let nguoi = tacGia;
	let nguoiTaoGoc: NguoiVet | null = null;
	if (!xong) {
		try {
			await kiemNguoiNhanViec(tx, tacGia.id);
		} catch (loi) {
			if (!(loi instanceof LoiViec) || loi.ma !== "nguoi-nhan") throw loi;
			nguoi = input.nguoiChay;
			nguoiTaoGoc = tacGia;
		}
	}
	const ganDung: BanGhiVet[] = [];
	for (const b of ganCu(goc)) ganDung.push(await docBanGhi(tx, b));
	const { platformBrokerId } = parseViecCanLamMeta(goc.meta);
	const tieuDe = tieuDeCu(goc.subject, goc.body);
	const trangThai = xong ? TrangThaiViec.XONG : TrangThaiViec.CHUA_LAM;
	const viec = await tx.viec.create({
		data: {
			tieuDe,
			moTa: goc.subject?.trim() ? (goc.body?.trim() || null) : null,
			hanNgay: goc.dueAt,
			trangThai,
			khepLuc: goc.completedAt,
			nguoiGiaoId: nguoi.id,
			nguoiThucHienId: nguoi.id,
			taoBoiId: tacGia.id,
			taoLuc: goc.createdAt,
			activityGocId: goc.id,
			khoaNguon: platformBrokerId ? VIEC.khoaMaLech(platformBrokerId) : null,
		},
		select: { id: true },
	});
	for (const b of ganDung) await tx.viecGan.create({ data: { viecId: viec.id, ...cotGan(b) } });
	await ghiVet(
		tx,
		{ viecId: viec.id, nguoiId: tacGia.id, nguon: "chep-cu", luc: goc.createdAt },
		{
			loai: "tao",
			truoc: null,
			sau: {
				tieuDe,
				nguoiThucHien: nguoi,
				hanNgay: goc.dueAt ? ngayHan(goc.dueAt) : null,
				banGhi: ganDung,
				nguoiTheoDoi: [],
				chep: { activityGocId: goc.id, trangThai, nguoiTaoGoc },
			},
		},
	);
	return viec;
}
```

  `xoaBanChep(tx, viecId)`: đọc vết «tao» của việc; `nguon !== "chep-cu"` → `LoiViec("khong-thay",
  VIEC.thongDiep.khongPhaiBanChep(viecId))`; còn lại `tx.viec.delete` (vết, gắn, theo dõi đi theo `Cascade`).
- [ ] **Step 6: `viec-chep.ts`.**
  - `demViecCanLam`: `db.$transaction(async (tx) => { await tx.$executeRaw\`SET TRANSACTION READ ONLY\`; … })`;
    `taskTong/Mo/Xong` = `activity.count` theo `type: TASK` ± `completedAt`; `daChep` = `viecChep: { isNot: null }`;
    `banChep` = `viec.count({ where: { vet: { some: { loai: "tao", nguon: "chep-cu" } } } })`; `banChepDaDoi` thêm
    `AND vet some loai not "tao"`; `nguoiTaoKhongNhan` = số TASK mở chưa chép mà `createdById` không có member của
    `WORKSPACE_ID` hay mọi member không `docDuocDoiTac`; `taskTaoSau` khi có `tu` = `createdAt >= tu`.
  - `chepTatCa`: người chạy vắng, không thấy, hay member không có vai thuộc `VAI_NHAN_BAO_AI` (`owner`, `admin` —
    `packages/db/src/ai-nhac.ts`) → `throw new LoiViec("khong-quyen", VIEC.thongDiep.chiQuanTriChep)` TRƯỚC khi
    đọc việc nào. `truoc = demViecCanLam`. Danh sách `activity.findMany({ where: { type: TASK, viecChep: null },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }], select: { id: true } })`. Chạy thật: mỗi id một
    `db.$transaction((tx) => chepMot(tx, …))`, bắt lỗi thành `{ id, lyDo: message }`. Chạy thử: một
    `db.$transaction(async (tx) => { for … { SAVEPOINT s; try chepMot … catch ROLLBACK TO SAVEPOINT s }; sau =
    đếm trong tx; throw DUNG_THU })`, bắt `DUNG_THU` để trả kết quả; giới hạn thời gian giao dịch đặt ở
    `VIEC.chepThuTranMs`. `sau = demViecCanLam` sau vòng (chạy thật).
  - `daoTatCa`: id bản chép (vết «tao» nguồn `chep-cu`); bản đã đổi (có vết khác «tao») mà không `caBanDaDoi` →
    `giuLai`; còn lại `db.$transaction((tx) => xoaBanChep(tx, id))`.
- [ ] **Step 7:** Chạy lại spec → xanh. Kiểm từng thông điệp ghim bằng cách tạm đổi một dòng (không commit).
- [ ] **Step 8:** Commit `feat(chep-viec-can-lam-cu): chép, đếm, đảo việc cần làm cũ qua viec-ghi`.

**Verify:** `bun run test -- "cd packages/db && bun test test/viec-chep.spec.ts"` · **Evals:** E1, E2, E3, E4 ·
**independent:** false

---

### Task 3: Lệnh `bun run viec:chep-cu`, dữ liệu mẫu

**Files:**
- Create: `packages/db/scripts/chep-viec-can-lam.ts`
- Modify: `packages/db/package.json`, `package.json` (gốc) — script `viec:chep-cu`
- Modify: `packages/db/prisma/seed.ts` (`seedActivities` thôi tạo TASK; bỏ `TASK_SUBJECTS` nếu không còn dùng)
- Create: `packages/db/test/viec-chep-lenh.spec.ts`

**Interfaces — Consumes:** `demViecCanLam`, `chepTatCa`, `daoTatCa`, `laKhoCucBo`, `loiKhoXa`.

- [ ] **Step 1: Bài kiểm đỏ** theo E10: `spawnSync("bun", [lenh, ...co], { env: { ...process.env, DATABASE_URL } })`
  với `lenh = fileURLToPath(new URL("../scripts/chep-viec-can-lam.ts", import.meta.url))`; đáp án viết trước
  (5 TASK, 2 đã chép, 1 bản chép đã đổi, 1 việc mở của người vai okr, 2 TASK có `createdAt` sau mốc M); vân tay
  `count()` bốn bảng. Ca kho xa: `DATABASE_URL = "postgresql://u:p@db.example.com:5432/crm"`. Ca gieo: gọi
  `seedActivities` (xuất từ `seed.ts` nếu chưa) trên kho rỗng tạm — nếu `seed.ts` không tách được hàm, gọi bộ
  phận gieo hoạt động qua `TOI_THIEU=0` trên kho `crm_<id>_test` riêng của lượt (`bun run test` đã cấp).
- [ ] **Step 2: Lệnh.**

```ts
import { parseArgs } from "node:util";
import { laKhoCucBo, loiKhoXa } from "../src/kho-cuc-bo";

const { values } = parseArgs({
	options: {
		chay: { type: "boolean", default: false },
		thu: { type: "boolean", default: false },
		dao: { type: "boolean", default: false },
		"ca-ban-da-doi": { type: "boolean", default: false },
		nguoi: { type: "string" },
		tu: { type: "string" },
	},
});
const url = process.env.DATABASE_URL ?? "";
const ghi = (values.chay && !values.thu) || values.dao;
if (ghi && !laKhoCucBo(url) && process.env.ALLOW_REMOTE_DB !== "1") {
	console.error(loiKhoXa("viec:chep-cu", url, "DATABASE_URL"));
	process.exit(1);
}
const { db } = await import("../src/client");
```

  rồi rẽ: `--dao` → `daoTatCa`; `--chay` → tìm `user` theo `--nguoi` (email), `chepTatCa({ nguoiChayId, thu })`;
  không cờ → `demViecCanLam({ tu })`. In `JSON.stringify(ketQua, null, 2)`. `LoiViec` → `console.error(message)`,
  thoát 1. `import` động để ca kho xa thoát trước khi mở kết nối.
- [ ] **Step 3:** `packages/db/package.json`: `"viec:chep-cu": "bun scripts/chep-viec-can-lam.ts"`; gốc:
  `"viec:chep-cu": "bun packages/db/scripts/chep-viec-can-lam.ts"`.
- [ ] **Step 4:** `seed.ts` bỏ nhánh tạo TASK trong vòng thoả thuận mở; giữ `gieoViecMau`.
- [ ] **Step 5:** Spec xanh; `bun run check-types`.
- [ ] **Step 6:** Commit `feat(chep-viec-can-lam-cu): lệnh viec:chep-cu đếm, chạy thử, chép, đảo; mẫu thôi gieo việc cần làm`.

**Verify:** `bun run test -- "cd packages/db && bun test test/viec-chep-lenh.spec.ts"` · **Evals:** E10 ·
**independent:** false

---

### Task 4: API — activities và Tổng quan

**Files:**
- Modify: `apps/api/src/activities/activities.contracts.ts` (bỏ `TASK` khỏi `COMPOSABLE_TYPES`, refine TASK,
  `completeInput/Output`, `myTasksInput/Output`; `TIMELINE_FILTERS` = `all, notes, email, meetings`;
  `TimelineCounts` bỏ `upcoming`, `done`)
- Modify: `apps/api/src/activities/activities.router.ts` (bỏ `myTasks`, `complete`)
- Modify: `apps/api/src/activities/activities.service.ts` (`timeline` và `timelineCounts` dùng
  `AND: [anchor, filterClause(filter), CHUA_CHEP]`; bỏ `complete`, `myTasks`; `filterClause` bỏ ba nhánh TASK)
- Modify: `apps/api/src/dashboard/dashboard.service.ts` (`viecCanLamQuaHan` thêm `viecChep: null`;
  `recentActivity` thêm `NOT: { type: TASK, viecChep: { isNot: null } }`)
- Modify: `apps/api/src/generated/server.ts` (`bun run --filter=api trpc:generate`)
- Modify: `apps/api/test/go-la-cat-quyen.spec.ts`, `apps/api/test/vai-chi-okr.spec.ts`, `apps/app/test/lam-moi-chuyen-viec.dom.tsx` (bỏ `myTasks`)
- Modify: `apps/api/test/han-viec.spec.ts` (ca gọi `myTasks` thì bỏ, ca dòng thời gian giữ)
- Create: `apps/api/test/viec-can-lam-cu.spec.ts` (`cvc-dong-thoi-gian`, `cvc-api`, `cvc-hien`)

**Interfaces — Consumes:** `chepViecCanLam` (Task 2), khuôn `test/support/viec-can-lam-cu.ts`.
**Produces:** `CHUA_CHEP = { NOT: { type: ActivityType.TASK, viecChep: { isNot: null } } } satisfies Prisma.ActivityWhereInput`
(hằng của `activities.service.ts`).

- [ ] **Step 1: Bài kiểm đỏ** theo E5, E6, E9 và Review Focus 2, 3, dùng `apps/api/test/support/viec-gieo.ts`
  (`batApp`, `goi`, `nguoi`, `thoaThuan`, `donViec`) và khuôn ở Task 2 (import tương đối
  `../../../packages/db/test/support/viec-can-lam-cu`). Ca `cvc-api` đọc `appRouter._def.procedures` qua cách
  `go-la-cat-quyen.spec.ts` đang liệt kê thủ tục.
- [ ] **Step 2:** Chạy → đỏ.
- [ ] **Step 3:** Sửa contracts, router, service, dashboard như Files. `timeline` đổi `where` thành `{ AND: [this.anchor(input),
  filterClause(input.filter), CHUA_CHEP] }`. Xoá `MyTasksInput` khỏi import.
- [ ] **Step 4:** `bun run --filter=api trpc:generate`.
- [ ] **Step 5:** Sửa ba bài kiểm của hồ sơ khác: chỉ gỡ tên `myTasks` (và ca `complete` nếu có) khỏi danh sách thủ
  tục; KHÔNG đổi kỳ vọng khác.
- [ ] **Step 6:** `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-can-lam-cu.spec.ts test/go-la-cat-quyen.spec.ts test/vai-chi-okr.spec.ts test/han-viec.spec.ts"` xanh.
- [ ] **Step 7:** Commit `feat(chep-viec-can-lam-cu): API thôi nhận và tích việc cần làm, ẩn việc đã chép`.

**Verify:** lệnh Step 6 + `bun run check-types` · **Evals:** E5, E6, E9 · **independent:** false

---

### Task 5: Màn — dòng thời gian và Tổng quan

**Files:**
- Modify: `apps/app/components/crm/timeline/timeline-search-params.ts` (`TIMELINE_TABS` bốn giá trị; bỏ
  `historyFilter`)
- Modify: `apps/app/components/crm/timeline/timeline.tsx` (bỏ `pinned`, `pinnedEntries`, nhãn, rỗng, biểu tượng
  của `upcoming`, `done`; `filter: tab`)
- Modify: `apps/app/components/crm/timeline/timeline-entry.tsx` (bỏ `complete`, `Checkbox`; dòng TASK: biểu
  tượng `ActivityIcon type="TASK"`, tiêu đề, nhãn hạn/quá hạn giữ nguyên)
- Modify: `apps/app/app/(app)/[slug]/dashboard-summary.tsx` (bỏ `complete` và ô tích ở dòng `loai: "viec"`)
- Modify: `apps/app/lib/trpc/cache.ts` (bỏ khoá `myTasks`)
- Modify: `apps/app/lib/messages/crm.ts` (bỏ chữ của hai thẻ và hai trạng thái rỗng ở cả `vi` và `en`)
- Modify: `apps/app/test/han-viec.dom.tsx` (fixture TASK không còn ô tích nếu ca đó kiểm ô tích)
- Create: `apps/app/test/dong-thoi-gian-viec-cu.dom.tsx`

- [ ] **Step 1: Bài kiểm đỏ** theo E5b, mock tRPC theo `apps/app/test/viec-o-soan.dom.tsx`; thêm ca Review Focus 4
  (`?tab=done` → «Tất cả»).
- [ ] **Step 2:** Chạy `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/dong-thoi-gian-viec-cu.dom.tsx` → đỏ.
- [ ] **Step 3:** Sửa như Files. Không thêm `className` lên component `@crm/ui`.
- [ ] **Step 4:** Chạy lại → xanh; chạy `./test/han-viec.dom.tsx`, `./test/viec-o-soan.dom.tsx`,
  `./test/giai-doan-timeline.dom.tsx`, `./test/ke-hoach-sheet.dom.tsx`, `./test/messages-guard.spec.ts` → xanh.
- [ ] **Step 5:** Commit `feat(chep-viec-can-lam-cu): dòng thời gian bỏ hai thẻ và ô tích việc cần làm`.

**Verify:** các lệnh Step 4 + `bun run check-types` · **Evals:** E5b, E11 · **independent:** false

---

### Task 6: Tác nhân tự dựng giao Việc

**Files:**
- Modify: `apps/agent/agent/lib/run-runtime.ts` (`createRunActivity`)
- Modify: `apps/agent/agent/subagents/agent_runner/tools/create_crm_activity.ts` (mô tả: TASK giao một Việc cho
  người khởi chạy)
- Modify: `apps/agent/agent/subagents/agent_runner/instructions.md:18`
- Create: `apps/agent/test/tac-nhan-giao-viec.integration.spec.ts` (`cvc-tac-nhan`, `cvc-nhac`)

**Interfaces — Consumes:** `taoViec`, `LoiViec` (`@crm/db/viec-ghi`), `chepViecCanLam` (cho `cvc-nhac`).
**Produces:** `createRunActivity(...)` trả `{ actionId: string; activityId: string | null; viecId: string | null;
replayed: boolean }` — `TASK` có `viecId`, `NOTE` có `activityId`.

- [ ] **Step 1: Bài kiểm đỏ** theo E7, E9b; dựng Tác nhân, phiên bản, lượt chạy theo
  `apps/agent/test/durable-agent-runtime.integration.spec.ts` (tìm hàm dựng gần dòng 780); nhắc theo
  `apps/agent/test/nhac-viec.integration.spec.ts`.
- [ ] **Step 2:** Chạy → đỏ.
- [ ] **Step 3:** Trong giao dịch sau `lockAgentRun`:

```ts
let externalId: string;
if (input.type === "TASK") {
	const viec = await taoViec(tx, {
		nguoiId: run.initiatedById ?? run.agent.createdById,
		tieuDe: (input.subject ?? "").trim(),
		moTa: input.body?.trim() || null,
		hanNgay: dueAt,
		gan: [{ loai: input.targetKind, id: input.targetId }],
		nguon: "tac-nhan",
		now,
	});
	externalId = viec.id;
} else {
	await tx.activity.upsert({ … loại NOTE như cũ … });
	externalId = activityId;
}
```

  Bỏ `ActivityType.TASK` khỏi nhánh ghi; cập nhật `lastActivityAt` chỉ ở nhánh NOTE (khớp đường web của Việc).
  `agentAction.update` dùng `externalId`. Giá trị trả theo Interfaces, kể cả hai nhánh `replayed`.
- [ ] **Step 4:** Sửa mô tả công cụ và `instructions.md`.
- [ ] **Step 5:** Spec mới xanh; `durable-agent-runtime.integration.spec.ts`, `custom-agent-runtime.spec.ts`,
  `khuon-di-dong.spec.ts` xanh.
- [ ] **Step 6:** Commit `feat(chep-viec-can-lam-cu): Tác nhân tự dựng giao Việc thay việc cần làm`.

**Verify:** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/tac-nhan-giao-viec.integration.spec.ts test/durable-agent-runtime.integration.spec.ts"`
· **Evals:** E7, E9b · **independent:** false

---

### Task 7: ma-lech giao Việc

**Files:**
- Modify: `apps/agent/agent/lib/ma-lech.ts`
- Modify: `apps/agent/test/dieu-phoi-va.spec.ts` (ca đọc `activity` TASK đọc `viec`)
- Create: `apps/agent/test/ma-lech-viec.integration.spec.ts`

**Interfaces — Consumes:** `taoViec` có `khoaNguon`, `VIEC.khoaMaLech`, `TRANG_THAI_MO`, `chepViecCanLam`.
**Produces:** `KetQuaMaLech` thêm `"nguoi-cam-trich-khong-nhan"`, `LY_DO_MA_LECH` thêm câu tương ứng.

- [ ] **Step 1: Bài kiểm đỏ** theo E8 cộng ca `cvc-ma-lech-nguoi-khong-nhan` (người cầm trịch vai okr → kết quả
  mới, không Việc, `completeTask` được gọi với lý do mới).
- [ ] **Step 2:** `giaoViec`:

```ts
const khoa = VIEC.khoaMaLech(payload.platformBrokerId);
const viecMo = await tx.viec.findFirst({
	where: { khoaNguon: khoa, trangThai: { in: [...TRANG_THAI_MO] }, gan: { some: { planId: payload.planId } } },
	select: { id: true },
});
const cuChuaChep = await tx.activity.findFirst({
	where: {
		type: ActivityType.TASK, completedAt: null, planId: payload.planId, viecChep: null,
		meta: { path: ["platformBrokerId"], equals: payload.platformBrokerId },
	},
	select: { id: true },
});
if (viecMo !== null || cuChuaChep !== null) return "da-co-viec-mo";
try {
	await taoViec(tx, {
		nguoiId: keHoach.ownerId, tieuDe: tieuDe(payload.platformBrokerId),
		moTa: noiDung(payload.platformBrokerId), hanNgay: dauNgayVN(now),
		gan: [{ loai: "plan", id: payload.planId }], nguon: "tac-nhan", khoaNguon: khoa, now,
	});
} catch (loi) {
	if (loi instanceof LoiViec && loi.ma === "nguoi-nhan") return "nguoi-cam-trich-khong-nhan";
	throw loi;
}
return "da-giao";
```

- [ ] **Step 3:** Sửa `dieu-phoi-va.spec.ts`: ca 159 và 226 đếm `db.viec` gắn kế hoạch với `khoaNguon`, `nguoiGiaoId
  = ownerId`, `hanNgay` trong ngày VN; ca «sau khi xong giao lại» đổi việc sang `XONG` qua `doiTrangThai` thật.
  Giữ tên ca và kết quả chữ như cũ.
- [ ] **Step 4:** Hai spec xanh.
- [ ] **Step 5:** Commit `feat(chep-viec-can-lam-cu): việc mã môi giới lệch giao Việc cho người cầm trịch`.

**Verify:** `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/ma-lech-viec.integration.spec.ts test/dieu-phoi-va.spec.ts"`
· **Evals:** E8 · **independent:** false

---

### Task 8: Răng đo — quét TASK, màn, đột biến

**Files:**
- Create: `_acceptance/chep-viec-can-lam-cu/rang/quet-task.mjs`
- Create: `_acceptance/chep-viec-can-lam-cu/rang/man.mjs` (theo `_acceptance/viec-chung/rang/man.mjs`)
- Create: `_acceptance/chep-viec-can-lam-cu/rang/dot-bien.mjs` (theo `_acceptance/viec-chung/rang/dot-bien.mjs`,
  dùng `../../ca-chap-chon-cach-ly/rang/ban-sao.mjs`)

- [ ] **Step 1:** `quet-task.mjs`: `git grep -n -E 'ActivityType\.TASK|"TASK"' -- apps packages ':!**/test/**'
  ':!**/*.spec.ts' ':!**/*.dom.tsx' ':!**/generated/**'`; ma trận `MA_TRAN` chép bảng «Mọi chỗ còn nói TASK sau
  vòng này» của design; phát hiện ghi bằng cửa sổ 12 dòng trước có `activity.(create|createMany|upsert|update)`;
  ba thông điệp ghim của E14; gốc kho suy từ `import.meta.url`.
- [ ] **Step 2:** `man.mjs`: gieo một TASK quá hạn gắn một thoả thuận bằng khuôn `khuonApi`, gọi `chepTatCa` thật,
  mở `?record=deal:<id>` ở 1280 và 375, kiểm ba điều của E11, chụp hai ảnh vào `$BANG_CHUNG`; cờ `--chieu-do` áp
  đột biến (e) trên bản sao.
- [ ] **Step 3:** `dot-bien.mjs`: 11 cặp (a)–(k) của E13 với chuỗi thay thật lấy từ mã sau Task 2–7; `SO_CAP_KHAI =
  11`.
- [ ] **Step 4:** Chạy `node _acceptance/chep-viec-can-lam-cu/rang/quet-task.mjs` xanh; chạy `dot-bien.mjs` một
  lượt (xin lượt nặng của M5 — nó chạy các bài kiểm 22 lần).
- [ ] **Step 5:** Commit `test(chep-viec-can-lam-cu): răng quét TASK, màn và đột biến`.

**Verify:** `node _acceptance/chep-viec-can-lam-cu/rang/quet-task.mjs` · **Evals:** E11, E13, E14 ·
**independent:** false

---

### Task 9: Tài liệu

**Files:** `CONTEXT.md` (mục «Việc»: việc cần làm đã thay, bản gốc còn; mục nào còn nói «việc cần làm» như một
loại sống), `docs/api.md` (mục «Việc»: chép, nguồn `tac-nhan`, `chep-cu`, `khoaNguon`; activities thôi nhận
`TASK`, bỏ `complete`, `myTasks`), `docs/agent.md` (mục «Team-agent builder and runner»: `crm.activity.create`
loại `TASK` giao Việc; mục việc `onboarding-identify`), `docs/production.md` (mục mới «Chép việc cần làm cũ»: đếm,
chạy thử, chạy, đếm, `ALLOW_REMOTE_DB=1`, `--nguoi` quản trị, đảo kể cả `--ca-ban-da-doi`, hai vế ngưỡng, thứ
tự lên và thứ tự lùi).

- [ ] **Step 1:** Viết đủ sáu điều của E12; không từ ghép tự đúc ngoài `CONTEXT.md`.
- [ ] **Step 2:** `bun run lint:slop` xanh.
- [ ] **Step 3:** Commit `docs(chep-viec-can-lam-cu): việc cần làm cũ thành Việc, cách chép và đảo trên production`.

**Verify:** `bun run lint:slop` · **Evals:** E12 · **independent:** false

---

## Sau cùng

- [ ] Lưới chung (xin lượt M5): `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`,
  `bun run build`.
- [ ] Hợp đồng sang `implemented`, vào S4.

Mọi task `independent: false`: cùng dùng client Prisma sinh ở Task 1 và kho thử của `bun run test`, và Task 4–7
cùng đọc khuôn hàng cũ của Task 2 — chạy tuần tự trong vòng chính.
