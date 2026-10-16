# Kế hoạch sinh việc — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tạo kế hoạch 30 ngày từ khuôn sinh cho mỗi bước đúng một Việc có người làm theo phòng ban; bước là bản chiếu của Việc.

**Architecture:**
- Bảng bước giữ nguyên và thêm cột `viecId` (duy nhất, cho phép trống).
- Mô-đun mới `packages/db/src/buoc-viec.ts` giữ ba thứ:
  - hàm tạo Việc cho bước;
  - hàm chiếu `chieuLenBuoc` — chép người làm, hạn, tên, xong từ Việc sang bước;
  - các lệnh ghi «phía bước» đi qua Việc bằng quyền của kế hoạch.
- Mọi lệnh ghi Việc trong `viec-ghi.ts` gọi `chieuLenBuoc` ở cuối, trong cùng giao dịch. Ba lệnh bị chặn trên Việc của bước.
- Kế hoạch cũ (bước không có `viecId`) chạy đường cũ nguyên vẹn.

**Tech Stack:** Prisma (Postgres), NestJS + tRPC (`apps/api`), Next.js (`apps/app`), bun test, agent nhắc (`apps/agent`).

**Spec:** `docs/superpowers/specs/2026-10-14-ke-hoach-sinh-viec-design.md` · hợp đồng `_acceptance/ke-hoach-sinh-viec/contract.md` (10 AC) · `evals.yaml` (16 eval).

## Global Constraints

- Hạn của Việc = ngày bắt đầu + `offsetDays`, quy theo ngày giờ Việt Nam. Dùng `ngayVN` của `@crm/db/onboarding-nhac`, giống `han-viec-theo-ngay`.
- Người vai `okr` không bao giờ làm người thực hiện. Mọi chỗ chọn người đi qua `kiemNguoiNhanViec`.
- Việc của một bước có đúng một người thực hiện, nên không có «bỏ giao» trên bước đã nối.
- Ba lệnh bị chặn trên Việc của bước (Huỷ, xoá, gỡ gắn kế hoạch) trả 400 với lời chứa nguyên văn «gỡ bước ở kế hoạch».
- Migration dùng mốc UTC thật lúc tạo, đặt sau `20261014043249_kanban_viec`. Kiểm `origin/onehub` ngay trước khi đẩy; DA1b vào trước thì dời mốc.
- `apps/api/src/generated/server.ts` chỉ sinh lại bằng `cd apps/api && bun run trpc:generate`.
- Chữ giao diện nằm ở `apps/app/lib/messages/onboarding.ts` (vi/en). Không dùng chữ «dự án» cho kế hoạch 30 ngày.
- Không ghi tệp S1 vào cây khi đường nền đang chạy. Đường nền chạy ở worktree riêng `kh-duong-nen`, nên cây này không bị đụng.

## Review Focus

1. **Bỏ giao trên bước đã nối** (`assignStep` với `assigneeId: null`): phải trả 400 «Việc của bước luôn có người làm». Không được để bước có người còn Việc thì không, vì như thế là lệch bản chiếu. Kiểm ở Task 3 (`kh-ban-chieu`, ô `assignStep-null`).
2. **Mở lại kế hoạch khi người làm đã sang vai `okr`**: `traBuocKhongNhan` hôm nay đặt người làm của bước về trống. Với bước đã nối, nó phải BỎ QUA, để Việc giữ nguyên và lời từ chối của Việc lo phần còn lại. Kiểm ở Task 3 (`kh-go-buoc dong-ke-hoach`, ca mở lại).
3. **Người cầm trịch khác người tạo**: người giao của Việc là người tạo kế hoạch. Người cầm trịch vẫn giao, đánh xong, đổi hạn từ thẻ Bước được, vì lệnh phía bước dùng quyền kế hoạch. Kiểm ở Task 3 (ô quyền).
4. **«xong n» của bước đã nối**: tin nhắc chỉ còn liệt Việc (Task 4). Nhưng tin cũ đã gửi trước khi gộp vẫn trỏ `stepId`, nên `datBuocXong` phải đi qua Việc. Kiểm ở Task 3 (ô `datBuocXong`).
5. **Khuôn có phòng ban đã lưu trữ hay bước trùng phòng ban**: khối chọn người gom theo phòng ban duy nhất, giữ thứ tự xuất hiện đầu tiên. Kiểm ở Task 6 (`kh-man-co-phong`, khuôn ba bước hai phòng).

---

## Bản đồ tệp

| Tệp | Việc của nó |
|---|---|
| `packages/db/prisma/schema.prisma` + `migrations/<UTC>_ke_hoach_sinh_viec/migration.sql` | cột `OnboardingStep.viecId` |
| `packages/db/src/viec.ts` | thêm nguồn `khuon`, `ke-hoach`, `dong-ke-hoach`; lời `goBuocOKeHoach` |
| `packages/db/src/buoc-viec.ts` (mới) | tạo Việc cho bước, chiếu, lệnh phía bước |
| `packages/db/src/viec-ghi.ts` | gọi chiếu sau mỗi lệnh ghi; chặn ba lệnh |
| `packages/db/src/onboarding-buoc.ts` | `datBuocXong` đi qua Việc khi bước đã nối |
| `packages/db/src/onboarding-nhac.ts` | bỏ nhắc `buoc-*` cho bước đã nối |
| `apps/api/src/onboarding/{onboarding.service,onboarding-ghi,onboarding.contracts,onboarding.router}.ts` | tạo từ khuôn, thêm bước, bốn lệnh bước, đóng kế hoạch |
| `apps/api/src/viec/viec.service.ts` | đổi `LoiViec` mới thành 400 (đường có sẵn) |
| `apps/api/src/generated/server.ts` | sinh lại |
| `apps/app/app/(app)/[slug]/onboarding/tao-ke-hoach.tsx` | khối người làm theo phòng ban |
| `apps/app/app/(app)/[slug]/onboarding/[planId]/dong-mo-ke-hoach.tsx` | hộp đóng có ô «Huỷ N việc còn mở» |
| `apps/app/components/crm/record-sheet/plan-steps.tsx` | chip trạng thái Việc trên dòng bước |
| `apps/app/lib/messages/onboarding.ts` | chữ vi/en |
| `apps/api/test/ke-hoach-sinh-viec.spec.ts` (mới) | E1, E2, E4–E8 |
| `apps/agent/test/ke-hoach-sinh-viec.integration.spec.ts` (mới) | E8b |
| `apps/app/test/tao-ke-hoach-nguoi.dom.tsx` (mới) | E3 |
| `apps/api/test/ke-hoach-sinh-viec-do-nguong.spec.ts` (mới) + `_acceptance/ke-hoach-sinh-viec/rang/do-nguong.mjs` | E13 |
| `_acceptance/ke-hoach-sinh-viec/rang/{man,dot-bien,e6-xanh,san-thiet-ke}.mjs` | E3b, E16, E7b, E17 |
| `CONTEXT.md`, `docs/api.md`, `docs/plan/lo-trinh-viec-du-an.json` | E14 |

---

### Task 1: Cột nối bước–Việc và nguồn mới

**Phục vụ:** nền cho E1, E4–E8. **independent: false** (mọi task sau dùng cột này).

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `OnboardingStep` ~:1972, model `Viec` ~:2957)
- Create: `packages/db/prisma/migrations/<YYYYMMDDHHMMSS UTC>_ke_hoach_sinh_viec/migration.sql`
- Modify: `packages/db/src/viec.ts` (`NGUON_VIEC`, `VIEC.thongDiep`)

**Interfaces:**
- Produces:
  - `OnboardingStep.viecId: string | null` (unique);
  - quan hệ `OnboardingStep.viec` và `Viec.buoc`;
  - `NguonViec` có thêm `"khuon" | "ke-hoach" | "dong-ke-hoach"`;
  - `VIEC.thongDiep.goBuocOKeHoach: string`;
  - `VIEC.thongDiep.buocLuonCoNguoi: string`.

- [ ] **Step 1: Sửa schema**

```prisma
model OnboardingStep {
  // … giữ nguyên các trường cũ
  viecId String? @unique
  viec   Viec?   @relation("BuocViec", fields: [viecId], references: [id], onDelete: SetNull)
}

model Viec {
  // … giữ nguyên
  buoc OnboardingStep? @relation("BuocViec")
}
```

- [ ] **Step 2: Viết migration bằng tay, mốc UTC thật**

```sql
ALTER TABLE "onboardingStep" ADD COLUMN "viecId" TEXT;
CREATE UNIQUE INDEX "onboardingStep_viecId_key" ON "onboardingStep"("viecId");
ALTER TABLE "onboardingStep" ADD CONSTRAINT "onboardingStep_viecId_fkey" FOREIGN KEY ("viecId") REFERENCES "viec"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

Tên bảng và tên ràng buộc phải đối chiếu với `@@map` của model và với migration `20261014043249_kanban_viec`. Sau đó chạy `cd packages/db && bunx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script`; kết quả phải rỗng.

- [ ] **Step 3: Thêm nguồn và lời**

```ts
export const NGUON_VIEC = ["web","zalo","api","chuyen-viec","bang-keo","bang-menu","khuon","ke-hoach","dong-ke-hoach"] as const;
// trong VIEC.thongDiep:
goBuocOKeHoach: "Việc này là một bước của kế hoạch 30 ngày — gỡ bước ở kế hoạch thay vì huỷ, xoá hay gỡ khỏi kế hoạch.",
buocLuonCoNguoi: "Việc của bước luôn có người làm — chọn người khác thay vì bỏ giao.",
```

- [ ] **Step 4: Verify** — `cd packages/db && bun run db:generate && cd ../.. && bun run check-types` thoát 0.
- [ ] **Step 5: Commit** — `feat(db): cột nối bước–Việc và nguồn khuon/ke-hoach/dong-ke-hoach`

---

### Task 2: Mô-đun bản chiếu `buoc-viec.ts` và móc vào `viec-ghi.ts`

**Phục vụ:** E4, E5 (đo ở Task 3). **independent: false**.

**Files:**
- Create: `packages/db/src/buoc-viec.ts`
- Modify: `packages/db/src/viec-ghi.ts` (`doiTrangThai` :265, `suaViec` :311, `doiNguoiThucHien` :351, `goBanGhi` :406, `xoaViec` :468, `chuyenViecTrongGiaoDich` :483)
- Modify: `packages/db/package.json` (exports `./buoc-viec`), theo cách `viec-ghi` đang khai

**Interfaces:**
- Consumes: `taoViec`, `kiemNguoiNhanViec`, `LoiViec` (viec-ghi); `ngayVN` (onboarding-nhac).
- Produces:

```ts
export async function chieuLenBuoc(tx: DbGhi, viecId: string): Promise<void>;
export async function taoViecChoBuoc(tx: DbGhi, input: {
  stepId: string; planId: string; tieuDe: string; hanNgay: Date;
  nguoiGiaoId: string; nguoiThucHienId: string; nguon: "khuon" | "web"; now: Date;
}): Promise<{ viecId: string }>;
export async function buocCuaViec(tx: DbGhi, viecId: string): Promise<{ id: string } | null>;
export type LenhBuoc =
  | { lenh: "giao"; nguoiThucHienId: string }
  | { lenh: "xong"; done: boolean }
  | { lenh: "han"; hanNgay: Date }
  | { lenh: "huy"; lyDo: string };
export async function ghiTuBuoc(tx: DbGhi, input: {
  viecId: string; nguoiId: string; nguon: NguonViec; now: Date; lenh: LenhBuoc;
}): Promise<void>;
```

- [ ] **Step 1: Viết `chieuLenBuoc`**

```ts
export async function chieuLenBuoc(tx: DbGhi, viecId: string): Promise<void> {
  const buoc = await tx.onboardingStep.findUnique({ where: { viecId }, select: { id: true } });
  if (!buoc) return;
  const v = await tx.viec.findUniqueOrThrow({
    where: { id: viecId },
    select: { tieuDe: true, hanNgay: true, nguoiThucHienId: true, trangThai: true, khepLuc: true },
  });
  await tx.onboardingStep.update({
    where: { id: buoc.id },
    data: {
      label: v.tieuDe,
      assigneeId: v.nguoiThucHienId,
      dueAt: v.hanNgay ?? undefined,
      completedAt: v.trangThai === TrangThaiViec.XONG ? v.khepLuc : null,
    },
  });
}
```

- [ ] **Step 2: Viết `taoViecChoBuoc`.** Gọi `taoViec(tx, { nguoiId: nguoiGiaoId, tieuDe, hanNgay, nguoiThucHienId, gan: [{ loai: "plan", id: planId }], nguon, now })`, rồi `tx.onboardingStep.update({ where: { id: stepId }, data: { viecId } })`, rồi `chieuLenBuoc`.
- [ ] **Step 3: Viết `ghiTuBuoc`.** Đây là lệnh phía bước, dùng quyền kế hoạch, KHÔNG gọi `quyenDoi`. Mỗi nhánh ghi đúng một `viecVet`, rồi gọi `chieuLenBuoc`:
  - **`giao`** — `kiemNguoiNhanViec` cho người mới, cập nhật `nguoiThucHienId`, vết `doi-nguoi-thuc-hien`.
  - **`xong`**:
    - `done = true`: đích là `XONG`. Ghi `khepLuc`. Ghi `roiChuaLamLuc` chỉ khi `nguoiId === nguoiThucHienId` và việc còn `CHUA_LAM` — cùng luật `doiTrangThai`.
    - `done = false`: Việc đang `XONG` thì về `DANG_LAM`, `khepLuc = null`.
    - Vết `doi-trang-thai`.
  - **`han`** — cập nhật `hanNgay`, vết `doi-han` (`ngayHan`).
  - **`huy`** — `trangThai = HUY`, `khepLuc = now`, vết `doi-trang-thai` với `sau: { trangThai: "HUY", lyDo }`.

  Rút luật «`roiChuaLamLuc` chỉ ghi khi người thực hiện rời Chưa làm» ra một hàm chung `roiChuaLamMoi(viec, nguoiId, den)` ở `viec.ts`. `doiTrangThai` và `ghiTuBuoc` cùng gọi hàm này — một nguồn luật, không chép hai lần.
- [ ] **Step 4: Móc vào `viec-ghi.ts`**:
  - Cuối `doiTrangThai`, `suaViec`, `doiNguoiThucHien`, và trong vòng lặp của `chuyenViecTrongGiaoDich`: `await chieuLenBuoc(tx, viec.id)`.
  - Đầu `doiTrangThai` khi `input.den === HUY`, đầu `xoaViec`, và đầu `goBanGhi` khi `input.banGhi.loai === "plan"`: nếu `buocCuaViec(tx, id)` khác null thì `throw new LoiViec("khong-hop-le", VIEC.thongDiep.goBuocOKeHoach)`.
  - `buoc-viec.ts` import từ `viec-ghi.ts`, nên để tránh vòng import: đặt `chieuLenBuoc` và `buocCuaViec` ở một tệp lá `packages/db/src/buoc-viec-chieu.ts` (chỉ import Prisma). `viec-ghi.ts` import tệp lá; `buoc-viec.ts` re-export.
- [ ] **Step 5: Verify** — `bun run check-types` thoát 0. Bộ kiểm cũ của Việc không đổi: `bun run test -- "cd apps/api && bun test test/viec-ghi.spec.ts test/viec-quyen.spec.ts test/viec-bang.spec.ts test/viec-con.spec.ts"` xanh.
- [ ] **Step 6: Commit** — `feat(db): bước là bản chiếu của Việc — chiếu, lệnh phía bước, chặn ba lệnh`

---

### Task 3: API kế hoạch — tạo từ khuôn, thêm bước, lệnh bước, đóng kế hoạch

**Phục vụ:** E1, E2, E4, E5, E6, E7, E8. **independent: false**.

**Files:**
- Modify: `apps/api/src/onboarding/onboarding.contracts.ts` (:78 `planCreateFromTemplateInput`; input đóng kế hoạch; `StepOutput` thêm `viecId`, `viecTrangThai`)
- Modify: `apps/api/src/onboarding/onboarding.service.ts:380-420` (`createFromTemplate`)
- Modify: `apps/api/src/onboarding/onboarding-ghi.ts` (`CHON_BUOC`, `assignStep`, `setStepDone`, `rescheduleStep`, `addStep`, `removeStep`, `datDong`, `traBuocKhongNhan`)
- Modify: `packages/db/src/onboarding-buoc.ts` (`datBuocXong`)
- Modify: `apps/api/src/onboarding/onboarding.router.ts` (closePlan nhận `huyViecMo`)
- Regenerate: `apps/api/src/generated/server.ts`
- Test: `apps/api/test/ke-hoach-sinh-viec.spec.ts`

**Interfaces:**
- Consumes: `taoViecChoBuoc`, `ghiTuBuoc`, `chieuLenBuoc` (Task 2).
- Produces:
  - `planCreateFromTemplateInput` thêm `nguoiTheoPhongBan: z.array(z.object({ departmentId: z.string().min(1), userId: z.string().min(1) })).default([])`;
  - `planCloseInput = z.object({ id, huyViecMo: z.boolean().default(false) })`;
  - `StepOutput` thêm `viecId: string | null`, `viecTrangThai: TrangThaiViec | null`.

- [ ] **Step 1: Viết test đỏ** — `apps/api/test/ke-hoach-sinh-viec.spec.ts`, đủ bảy `describe`. Tên ca phải khớp bộ lọc `-t` của config:
  - `kh-tao`, `kh-chon-nguoi`, `kh-ban-chieu`, `kh-chan`, `kh-go-buoc`, `kh-go-buoc dong-ke-hoach`, `kh-them-buoc`, `kh-ke-hoach-cu`.
  - Fixture dựng bằng `gieoThanhVien`, `gieoBoPhan`, `gieoCongTy` (`test/support/ke-hoach-gieo.ts`), và gọi `goi(app, "onboarding.createFromTemplate", …)` (`test/support/viec-gieo.ts`), để đi đúng đường ghi thật.
  - Mỗi `expect` ném đúng thông điệp ghim của `evals.yaml` (vd `throw new Error("kh: buoc lech viec sau " + lenh + " " + cot)`).
  - Bảng `kh-ban-chieu` là mảng viết trước, 11 dòng: mười lệnh của E4 cộng ô `assignStep-null`. Đầu ca: `if (daChay !== BANG.length) throw new Error("kh: bang chieu thieu o " + daChay)`.

  Mẫu một ô:

```ts
const BANG: Array<{ lenh: string; chay: (ctx: Ctx) => Promise<unknown>; tuChoi?: string }> = [
  { lenh: "assignStep", chay: (c) => goi(app, "onboarding.assignStep", "mutation", { stepId: c.buoc, assigneeId: c.u }, c.chu) },
  { lenh: "assignStep-null", chay: (c) => goi(app, "onboarding.assignStep", "mutation", { stepId: c.buoc, assigneeId: null }, c.chu), tuChoi: VIEC.thongDiep.buocLuonCoNguoi },
  // … setStepDone(true), setStepDone(false), rescheduleStep, datBuocXong (nguồn zalo), transferWork,
  //   viec.doiTrangThai DANG_LAM / CHO_DANH_GIA / XONG / XONG→DANG_LAM, viec.sua, viec.doiNguoiThucHien
];
async function kiemChieu(stepId: string, lenh: string) {
  const b = await db.onboardingStep.findUniqueOrThrow({ where: { id: stepId }, include: { viec: true } });
  const v = b.viec!;
  if (b.assigneeId !== v.nguoiThucHienId) throw new Error(`kh: buoc lech viec sau ${lenh} assignee`);
  if (ngayVN(b.dueAt) !== ngayVN(v.hanNgay!)) throw new Error(`kh: buoc lech viec sau ${lenh} han`);
  if (b.label !== v.tieuDe) throw new Error(`kh: buoc lech viec sau ${lenh} ten`);
  const xong = v.trangThai === "XONG";
  if ((b.completedAt !== null) !== xong || (xong && b.completedAt!.getTime() !== v.khepLuc!.getTime()))
    throw new Error(`kh: buoc lech viec sau ${lenh} xong`);
}
```

- [ ] **Step 2: Chạy, xác nhận đỏ** — `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.spec.ts"`. Kỳ vọng: FAIL, `kh: buoc khong tro dung mot viec` ở `kh-tao`.
- [ ] **Step 3: `createFromTemplate`.** Trong giao dịch có sẵn:
  - Tính người cho từng phòng ban duy nhất của khuôn:
    - lấy `nguoiTheoPhongBan[departmentId]` nếu có;
    - nếu không, lấy `department.headUserId` khi trưởng phòng đọc được dữ liệu đối tác (`docDuocDoiTac`);
    - còn lại là `input.ownerId`.
  - Người do NGƯỜI chọn mà mang vai `okr` → 400. Lời ghép `vaiChiOkr(name)` với tên phòng ban: `ONBOARDING.thongDiep.vaiChiOkrPhong(ten, phong)`.
  - Mỗi bước tạo bằng `tx.onboardingStep.create` (bỏ `createMany`, vì cần id), rồi gọi `taoViecChoBuoc({ nguon: "khuon", nguoiGiaoId: actingUserId, hanNgay: ngày VN của startedAt + offsetDays })`.
  - Router truyền `ctx.user.id` làm `actingUserId`; service đổi chữ ký thành `createFromTemplate(input, actingUserId)`.
- [ ] **Step 4: `addStep`.** Sau khi tạo bước, gọi `taoViecChoBuoc({ nguon: "web", nguoiThucHienId })`. Người làm lấy `input.assigneeId`, nếu không có thì theo cùng luật mặc định của Step 3.
- [ ] **Step 5: Bốn lệnh bước.** Mỗi lệnh đọc `buoc.viecId`:
  - **Khác null** → `ghiTuBuoc`:
    - `assignStep` (null → `BadRequestException(VIEC.thongDiep.buocLuonCoNguoi)`);
    - `rescheduleStep`;
    - `removeStep` → `huy` với `lyDo: "gỡ bước"`, gán `viecId: null`, rồi xoá bước.
  - Vết của kế hoạch (`ghiVet` PLAN_CHANGE) giữ nguyên, để dòng thời gian của kế hoạch không đổi.
  - **`datBuocXong`** (`packages/db/src/onboarding-buoc.ts`): khi bước có `viecId`, gọi `ghiTuBuoc({ lenh: "xong", done, nguon: vet === VET_MAN ? "web" : nguồn từ tham số })` thay vì tự cập nhật `completedAt`, rồi đọc lại `completedAt` cho kết quả `da-doi`. Thêm tham số `nguon: NguonViec` vào `DatBuocXongInput`; agent «xong n» truyền `"zalo"` hay `"slack"`.
- [ ] **Step 6: Đóng / mở lại.** `datDong(id, dong, actingUserId, huyViecMo = false)`:
  - `dong && huyViecMo` → với mỗi bước chưa xong có `viecId` mà Việc chưa khép: `ghiTuBuoc({ lenh: "huy", lyDo: "đóng kế hoạch", nguon: "dong-ke-hoach" })`.
  - Mở lại thì không hồi gì.
  - `traBuocKhongNhan` lọc `viecId === null` (chọn thêm `viecId` ở `buocChuaXong`) — Review Focus 2.
- [ ] **Step 7: Sinh lại server.ts** — `cd apps/api && bun run trpc:generate`.
- [ ] **Step 8: Chạy, xác nhận xanh** — lệnh Step 2 xanh đủ bảy describe. Kèm `bun run test -- "cd apps/api && bun test test/dieu-phoi-va.spec.ts test/moi-phia-ke-hoach.spec.ts test/viec-chuyen.spec.ts"` xanh.
- [ ] **Step 9: Commit** — `feat(api): kế hoạch từ khuôn sinh Việc theo phòng ban; lệnh bước đi qua Việc`

---

### Task 4: Nhắc buổi sáng không nhắc trùng

**Phục vụ:** E8b. **independent: false** (cần Task 1–3).

**Files:**
- Modify: `packages/db/src/onboarding-nhac.ts:321-335` (`guiCua`), cùng select của `docKeHoach` để có `viecId`
- Test: `apps/agent/test/ke-hoach-sinh-viec.integration.spec.ts`

- [ ] **Step 1: Test đỏ** — ca `kh-nhac-buoc` theo khuôn `apps/agent/test/nhac-viec.integration.spec.ts` (`lenLichNhac` rồi `chayNhac`, Zalo giả). Kỳ vọng hiện tại: FAIL với `kh: nhac trung buoc va viec`.
- [ ] **Step 2: Sửa `guiCua`** — `if (s.completedAt !== null || s.assigneeId === null || s.viecId !== null) return [];`
- [ ] **Step 3: Xanh** — `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/ke-hoach-sinh-viec.integration.spec.ts test/nhac-viec.integration.spec.ts"`.
- [ ] **Step 4: Commit** — `fix(nhac): bước đã nối nhắc qua Việc, không nhắc trùng`

---

### Task 5: Giao diện — khối người làm, chip trạng thái, hộp đóng

**Phục vụ:** E3, E3b, E17. **independent: false** (cần hợp đồng API của Task 3).

**Files:**
- Modify: `apps/app/app/(app)/[slug]/onboarding/tao-ke-hoach.tsx`
- Modify: `apps/app/app/(app)/[slug]/onboarding/[planId]/dong-mo-ke-hoach.tsx`
- Modify: `apps/app/components/crm/record-sheet/plan-steps.tsx`
- Modify: `apps/app/lib/messages/onboarding.ts`
- Test: `apps/app/test/tao-ke-hoach-nguoi.dom.tsx`

- [ ] **Step 1: Test đỏ** — ba ca `kh-man-co-phong`, `kh-man-trang-thai`, `kh-man-loi`, mock tRPC theo `apps/app/test/ke-hoach-sheet.dom.tsx`, với thông điệp ghim của E3.
- [ ] **Step 2: Khối «Người làm theo phòng ban».**
  - Rút danh sách phòng ban duy nhất theo thứ tự xuất hiện trong `khuon.steps`.
  - Mỗi hàng có nhãn tên phòng và một `Select` đọc `onboarding.nguoiNhanViec`.
  - Mặc định: `department.headUserId` nếu có trong danh sách nhận được; không có thì người cầm trịch, kèm dòng phụ `t.onboarding.taoKeHoach.phongChuaCoTruong`.
  - Đổi khuôn thì dựng lại khối.
  - Gửi `nguoiTheoPhongBan` = mọi hàng.
  - ≤ 640px thì xếp dọc (`flex-col sm:flex-row`). Không dùng lớp tự đặt kiểu `rounded-[7px]` (E17 canh).
- [ ] **Step 3: Ba trạng thái** chờ / lỗi + «Thử lại» / rỗng (nút Tạo khoá), chữ theo bảng `ST-o-tao-*` của design.
- [ ] **Step 4: Chip trên thẻ Bước.** `viecTrangThai !== null` → dùng `trang-thai-viec.tsx` của Việc; bấm dòng thì mở `?record=viec:<viecId>`. Bước cũ giữ hiển thị như hôm nay.
- [ ] **Step 5: Hộp đóng.** Đếm bước chưa xong có Việc mở. Khi N > 0 thì hiện ô «Huỷ N việc còn mở của kế hoạch?», đánh dấu sẵn, và gửi `huyViecMo`.
- [ ] **Step 6: Xanh** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tao-ke-hoach-nguoi.dom.tsx ./test/ke-hoach-sheet.dom.tsx ./test/dieu-phoi-va.dom.tsx` và `bun run check-types`.
- [ ] **Step 7: Commit** — `feat(app): ô tạo kế hoạch chọn người theo phòng ban; chip Việc trên bước; hộp đóng hỏi huỷ việc dở`

---

### Task 6: Thước ngưỡng (a)

**Phục vụ:** E13. **independent: true** (chỉ đọc `viecVet` nguồn `khuon`, không chạm tệp của Task 5).

**Files:**
- Create: `_acceptance/ke-hoach-sinh-viec/rang/do-nguong.mjs` (khuôn `_acceptance/viec-chung/rang/do-nguong.mjs`)
- Create: `apps/api/test/ke-hoach-sinh-viec-do-nguong.spec.ts`

- [ ] **Step 1: Test đỏ** — gieo đúng bảy Việc của E13 bằng `taoViecChoBuoc` (đường ghi thật), chạy thước bằng `spawnSync("bun", [<đường suy từ vị trí test>, "--tu", …, "--den", …])`, so JSON với đáp án viết trước.
- [ ] **Step 2: Viết thước** — giao dịch `BEGIN TRANSACTION READ ONLY`. Mẫu số: Việc có vết `tao` nguồn `khuon` trong `[--tu, --den]`, `hanNgay ≤ --den`, `trangThai <> 'HUY'`. Tử số: `roiChuaLamLuc ≤ cuối ngày hạn giờ VN`. In `{ viecKhuon: { tong, dungHan, tiLe } }`; thoát 2 khi `tiLe < 0.7`. Đường dẫn suy từ `import.meta.url`.
- [ ] **Step 3: Xanh** — `bun run test -- "cd apps/api && bun test test/ke-hoach-sinh-viec-do-nguong.spec.ts"`.
- [ ] **Step 4: Commit** — `feat(acceptance): thước ngưỡng (a) ke-hoach-sinh-viec`

---

### Task 7: Răng chiều đỏ, màn chụp, E6 còn xanh

**Phục vụ:** E16, E3b, E7b, E17. **independent: false** (đo vật của Task 1–6).

**Files:**
- Create: `_acceptance/ke-hoach-sinh-viec/rang/dot-bien.mjs` (khuôn `viec-chung/rang/dot-bien.mjs`, dùng `ban-sao.mjs` của `ca-chap-chon-cach-ly`)
- Create: `_acceptance/ke-hoach-sinh-viec/rang/man.mjs` (khuôn `viec-chung/rang/man.mjs`; chụp bốn ảnh của E3b vào `BANG_CHUNG`)
- Create: `_acceptance/ke-hoach-sinh-viec/rang/e6-xanh.mjs`:
  - chạy `dpv_them_buoc_dom` và `dpv_bo_phan_hong`, đọc bằng `node scripts/config-get` hoặc parse YAML;
  - đếm ca theo từng tên trong đầu ra bun;
  - thiếu ca thì thoát 1 với `kh: ca e6 bi doi ten <ten>`.
- Create: `_acceptance/ke-hoach-sinh-viec/rang/san-thiet-ke.mjs` (khuôn `viec-chung/rang/san-thiet-ke.mjs`, mẫu tệp: ô tạo, hộp đóng, `plan-steps.tsx`)

- [ ] **Step 1: `dot-bien.mjs`** với chín cặp (a)–(i) của E16. Mỗi cặp gồm chuỗi gốc chính xác trong tệp vật, chuỗi thay, lệnh đo và thông điệp ghim. Thiếu chuỗi gốc thì thoát 2 nêu cặp (bản tiêm phải khác bản gốc).
- [ ] **Step 2: Chạy** `node _acceptance/ke-hoach-sinh-viec/rang/dot-bien.mjs` → thoát 0, chín cặp đều «lành xanh · tiêm đỏ đúng lời».
- [ ] **Step 3: `man.mjs`** — chạy cục bộ khi có lượt; bản thân lệnh đi qua `tien-de.mjs`, tự dựng phiên đo.
- [ ] **Step 4: `e6-xanh.mjs` và `san-thiet-ke.mjs`** chạy thoát 0. Chiều đỏ: thêm `rounded-[7px]` vào bản sao thì `san-thiet-ke` thoát khác 0.
- [ ] **Step 5: Commit** — `test(acceptance): răng đột biến, màn chụp, E6 còn xanh cho ke-hoach-sinh-viec`

---

### Task 8: Tài liệu, lộ trình, hồi quy

**Phục vụ:** E14, E15. **independent: false** (chép tên thủ tục từ Task 3).

**Files:**
- Modify: `CONTEXT.md` (mục bước 30 ngày: «bước của kế hoạch tạo sau DA3 là bản chiếu của một Việc»; mục Việc: ba thao tác bị chặn trên Việc của bước)
- Modify: `docs/api.md` (router onboarding: `nguoiTheoPhongBan`, `huyViecMo`, `viecId`/`viecTrangThai` trong StepOutput)
- Modify: `docs/plan/lo-trinh-viec-du-an.json` (DA3 `trang_thai` → `đang dựng`, `buoc_ke`, `pr` khi có)

- [ ] **Step 1: Viết tài liệu** — không dùng chữ «dự án» cho kế hoạch 30 ngày; đọc `_Avoid_` của `CONTEXT.md` trước khi viết.
- [ ] **Step 2: Hồi quy** — `bun _acceptance/dieu-phoi-va/rang/khong-xoa-expect.mjs --tu-thu && bun _acceptance/dieu-phoi-va/rang/khong-xoa-expect.mjs --moc aac0975b5 && bun run check-types` thoát 0.
- [ ] **Step 3: Vẽ lại bản đồ** — chạy `product-map.mjs --root .`, rồi `git add PRODUCT-MAP.md LO-TRINH.html`.
- [ ] **Step 4: Commit** — `docs: bước là bản chiếu của Việc; DA3 đang dựng`

---

## Thứ tự và đồng bộ ba máy

1. Task 1 → 2 → 3 → 4 → 5 → 7 → 8. Task 6 chen bất kỳ lúc nào sau Task 2.
2. Sau khi DA1b vào onehub (lô 08:00Z): gộp `origin/onehub` vào nhánh. Nếu DA1b có migration mới hơn mốc của Task 1 thì dời mốc. Rồi chạy lại `trpc:generate`.
3. S4 chỉ chạy khi Điều phối M5 «CẤP LƯỢT». `--diff-base` = merge-base với `origin/onehub`.
