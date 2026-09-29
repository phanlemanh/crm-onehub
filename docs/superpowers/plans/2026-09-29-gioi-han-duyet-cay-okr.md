# Mức hiển thị, bước duyệt nhẹ, tái cơ cấu không mồ côi — kế hoạch thi công (lượt 8c)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mục tiêu đặt được mức «giới hạn» mà mọi đường đọc OKR tôn trọng, Chương trình OKR có bước duyệt nhẹ tuỳ chọn, và cây tổ chức không còn để OKR mồ côi khi lưu trữ, dời, gộp, tách đơn vị giữa kỳ — dựng và đo trên bộ OKR mẫu.

**Architecture:** Một luật xem ở hai dạng cùng nghĩa: hàm thuần `xemDuocMucTieu` (`@crm/validation/okr-hien-thi`) và điều kiện Prisma `dieuKienXemMucTieu` (`@crm/db/okr-hien-thi`), cùng nhận `NguCanhXem`. API dựng ngữ cảnh từ `OkrAccessService.quyen` (cây của `ToChucService`); nhắc buổi sáng và tác tử dựng bằng `nguCanhXemOkr(db, userIds)` ở `packages/db`, một bài kiểm giữ hai bên trùng tập trưởng. Bước duyệt là giá trị `cho-duyet` của cột `status` và bốn thủ tục mới; người duyệt suy lúc đọc (`nguoiDuyet`). Tái cơ cấu: `to-chuc` hỏi `demOkrCuaDonVi` (`@crm/db/okr-don-vi`) trước khi lưu trữ, xoá hẳn; `okr.chuyenDonVi`, `okr.moCoi` cho quản trị.

**Tech Stack:** Bun, Turborepo, NestJS + nestjs-trpc, Prisma 7 (Postgres), Zod, Next.js (bản trong kho — đọc `apps/app/node_modules/next/dist/docs/` trước khi đụng API Next), React Query + tRPC, nuqs, shadcn trong `packages/ui`.

**Spec:** `docs/superpowers/specs/2026-09-29-gioi-han-duyet-cay-okr-design.md` · hợp đồng `_acceptance/gioi-han-duyet-cay-okr/contract.md` (duyệt 2026-09-29, Manh Phan) · phép đo `_acceptance/gioi-han-duyet-cay-okr/evals.yaml` · bản mẫu `/proto/gioi-han-duyet-cay-okr` (`design-pass.md`).

## Điều kiện trước S3

1. `git fetch origin && git merge origin/onehub` (nhánh gốc hôm nay `1a39db24`).
2. `bun install`, rồi `cd packages/db && bun run db:generate`.
3. Soát lại: mốc `migration` mới nhất (hôm nay `20261004010000_okr_canh_kr` → lượt này `20261006010000_okr_hien_thi_duyet`; có mốc mới hơn thì lấy mốc sau nó), model cuối `schema.prisma` (hôm nay khối 8a, `OkrMucTieuTuMau`), dòng của `docMucTieu` (L1187), `publishObjective` (L657), `applyImport` (L1370), `setProgram` (L429), `vet` (L472). Lệch ghi `decisions.jsonl` (`type: "fix"`, `stage: "S3"`). Nếu 9b đã gộp (trợ lý đọc OKR theo người yêu cầu) thì Task 5 mở rộng tới các chỗ đọc mới của nó.
4. Hạng vẫn T3.

## Global Constraints

- Không viết chú thích trong mã (mới hay sửa).
- Trần và câu chữ máy chủ ở `OKR.hienThi`, `OKR.duyet`, `OKR.taiCoCau` và `OKR.thongDiep.*` (`apps/api/src/okr/okr-config.ts`); trần khuôn ở `OKR_HIEN_THI` (`packages/validation/src/okr-hien-thi.ts`): `nguoiXemToiDa: 20`, `lyDoTraLai: { toiThieu: 10, toiDa: 500 }`, `chuyenToiDa: 50`. Không số 20, 10, 500, 50 ở tệp khác.
- Parse ở biên bằng Zod; không `Record<string, unknown>`; kiểu suy bằng `z.infer`.
- `migration` chỉ: `CREATE TABLE "okrNguoiXem"`, chỉ mục, khoá ngoại của bảng mới, đúng hai `ALTER TABLE … ADD COLUMN … DEFAULT` (`okrObjective.hienThi` mặc định `'cong-khai'`, `okrProgramConfig.duyetCongBo` mặc định `false`). `OkrNguoiXem` là model cuối `schema.prisma`; khoá ngoại tới `okrObjective` CASCADE, tới `user` RESTRICT.
- Luật xem chỉ ở `xemDuocMucTieu` và `dieuKienXemMucTieu`; mọi đọc `okrObjective` và bảy bảng con (`okrKeyResult`, `okrViecKr`, `okrGhiNhan`, `okrComment`, `okrCheckIn`, `okrTrail`, `okrSoChup`) có điều kiện xem (trực tiếp hay lồng qua `objective`) hoặc dòng trong `MIEN_XEM` của `soi-ma.mjs` kèm lý do. Số gộp dùng `boGioiHan` (bỏ giới hạn với mọi người), không lọc theo người.
- Đọc theo mã không xem được: `NotFoundException(OKR.thongDiep.khongThayMucTieu)` — đúng câu của mã không tồn tại.
- `to-chuc` không nhập từ `../okr`; hỏi OKR qua `@crm/db/okr-don-vi`.
- Mọi ghi mới để đúng một dòng `okrTrail` qua `OkrService.vet`; sáu hành động mới cuối `HANH_DONG_VET` (`packages/db/src/okr-vet.ts`) đúng thứ tự: `doi-hien-thi`, `gui-duyet`, `duyet`, `tra-lai`, `rut-duyet`, `chuyen-don-vi`. `cau-hinh` của `setProgram` mang `duyetCongBo` trong before/after khi ô đổi.
- Khoá pha: `datHienThi`, `guiDuyet`, `duyetMucTieu`, `traLaiMucTieu`, `rutDuyet` gọi `assertKyGhiDuoc`; `chuyenDonVi` nhận `lap-ke-hoach`, `dang-chay`, `cham-diem` (`PHA_CHUYEN_DUOC` trong `okr-chu-ky.ts`).
- Màn chỉ dùng thành phần `@crm/ui` (bậc 1); không `className` đổi màu, góc, khoảng cách; «Huỷ» bọc `DialogClose`. Chữ mới ở `apps/app/lib/messages/okr-gioi-han.ts` (khung mục tiêu, duyệt) và `apps/app/lib/messages/okr-tai-co-cau.ts` (cài đặt, tổ chức, mồ côi), vi và en khác nhau, hàm ghép chữ nhận đối số vô hướng. Chữ người nhập mang `translate="no"`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture; phá-thử làm SAU commit. Bài chạm DB khai `timeout` ≥ 30 000 ms.

## Review Focus

- Người vừa bị bỏ khỏi danh sách người xem đang mở khung mục tiêu: lần tải lại kế trả 404, không còn dữ liệu cũ trong phản hồi — Task 3 thêm ca.
- Người duyệt bấm «Duyệt» đúng lúc người gửi bấm «Rút lại»: một bên thắng, bên kia 400 câu ghim, không mục tiêu nào vừa công bố vừa về nháp — Task 6 khoá hàng `FOR UPDATE`, thêm ca hai lời gọi song song.
- Chuyển OKR sang đơn vị đã có mục tiêu cùng tiêu đề trong cùng chu kỳ: vẫn chuyển, không đổi tiêu đề — Task 7 thêm ca.
- Mục tiêu cá nhân giới hạn khi người đó đổi phòng ban chính giữa kỳ: trưởng phòng ban mới thấy, trưởng cũ không — Task 3 thêm ca.
- Người xem có tên bị gỡ khỏi không gian làm việc rồi được cho vào lại: vẫn trong danh sách người xem và thấy lại mục tiêu — Task 4 thêm ca.

---

## Bản đồ tệp

| Tệp | Việc |
|---|---|
| `packages/validation/src/okr-hien-thi.ts` (mới) | `MUC_HIEN_THI`, `OKR_HIEN_THI`, `NguCanhXem`, `MucTieuDeXem`, `xemDuocMucTieu`, khuôn `datHienThiInput`, `traLaiInput`, `chuyenDonViInput` |
| `packages/validation/src/okr-muc-tieu.ts` | `TRANG_THAI_MUC_TIEU` thêm `cho-duyet`; `mucTieuInput` thêm `hienThi` |
| `packages/validation/src/okr-chuong-trinh.ts` | `duyetCongBo` |
| `packages/validation/src/okr-chu-ky.ts` | `PHA_CHUYEN_DUOC` |
| `packages/db/src/okr-vet.ts` | sáu hành động mới |
| `packages/db/prisma/schema.prisma`, `migrations/20261006010000_okr_hien_thi_duyet/` | hai cột, bảng `OkrNguoiXem` |
| `packages/db/src/okr-hien-thi.ts` (mới) | `dieuKienXemMucTieu`, `boGioiHan`, `nguCanhXemOkr` |
| `packages/db/src/okr-don-vi.ts` (mới) | `demOkrCuaDonVi` |
| `apps/api/src/okr/okr-access.service.ts` | `nguCanhXem(q, userId)`, `assertXemMucTieu`, `nguoiDuyet`, `duyetDuoc` |
| `apps/api/src/okr/hien-thi.ts` (mới) | `vetChoNguoiXem` (che đích căn chỉnh, mang sang) |
| `apps/api/src/okr/okr-hien-thi.service.ts` (mới) | `datHienThi` |
| `apps/api/src/okr/okr-duyet.service.ts` (mới) | `guiDuyet`, `duyetMucTieu`, `traLaiMucTieu`, `rutDuyet`, `congBoTrongGiaoDich` |
| `apps/api/src/okr/okr-tai-co-cau.service.ts` (mới) | `chuyenDonVi`, `moCoi` |
| `apps/api/src/okr/okr.service.ts`, `okr-xem.service.ts`, `okr-khep.service.ts`, `okr-canh-kr.service.ts`, `okr-trao-doi.service.ts`, `okr-so.service.ts`, `okr-cap-nhat.service.ts`, `okr-mau.service.ts` | gắn điều kiện xem, khoá chờ duyệt, cổng công bố |
| `apps/api/src/okr/okr.router.ts`, `okr.contracts.ts`, `okr-config.ts`, `okr.module.ts` | bảy thủ tục, khuôn ra, câu chữ |
| `apps/api/src/to-chuc/to-chuc.service.ts`, `xoa-phong-ban.ts`, `cay.ts`, `to-chuc.contracts.ts` | chặn lưu trữ, xoá hẳn; `okrMo` |
| `packages/db/src/okr-nhac.ts`, `onboarding-nhac.ts`, `packages/validation/src/nhac-ke-hoach.ts`, `packages/db/src/okr-tro-ly.ts` | lọc nhắc, `okr-cho-duyet`, `okr-tra-lai`, chặn xếp việc |
| `apps/agent/agent/lib/okr/doc.ts`, `apps/agent/agent/lib/tin-nhac.ts` | đọc lại quyền, chữ hai loại nhắc mới |
| `apps/app/components/crm/record-sheet/objective-sheet.tsx`, `objective-hien-thi.tsx` (mới), `objective-duyet.tsx` (mới) | nhãn, hộp mức, dải duyệt, hộp trả lại |
| `apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx`, `viec-cua-toi.tsx` | ô mức khi tạo; hai loại mục |
| `apps/app/app/(app)/[slug]/settings/okr/form-cau-hinh.tsx` | công tắc «Công bố cần duyệt» |
| `apps/app/app/(app)/[slug]/settings/organization/chi-tiet-phong-ban.tsx`, `chi-tiet-bo-phan.tsx`, `xac-nhan-luu-tru.tsx`, `hop-chuyen-okr.tsx` (mới) | dòng OKR mở, hộp lưu trữ, hộp chuyển |
| `apps/app/app/(app)/[slug]/okr/suc-khoe/…` khối `okr-mo-coi.tsx` (mới) | khối OKR mồ côi |
| `apps/api/scripts/okr-mau/cong-ty.json`, `nap.ts` | bốn ca mẫu |
| `_acceptance/gioi-han-duyet-cay-okr/rang/*` | `soi-ma.mjs`, `duong-doc-okr.json`, `migration-chi-them.mjs`, `okr-mo-coi.sql`, `mo-coi.mjs`, `ty-le-gioi-han-duyet.sql`, `ty-le.mjs`, `man-gioi-han-duyet.mjs` |
| Bài kiểm | `packages/validation/test/okr-hien-thi.spec.ts`, `apps/api/test/okr-hien-thi.spec.ts`, `okr-hien-thi-san.ts`, `okr-duyet.spec.ts`, `okr-tai-co-cau.spec.ts`, `vai-chi-okr.spec.ts`, `okr-mau.spec.ts`, `apps/agent/test/okr-nhac.integration.spec.ts`, `okr-hien-thi.integration.spec.ts`, `apps/app/test/okr-gioi-han-duyet.dom.tsx` |
| `CONTEXT.md`, `docs/api.md`, `docs/agent.md` | bốn mục từ điển; luật mới |

## Thứ tự và độc lập

Task 1 → 2 → 3 → 4 → 5 → 6 → 7 tuần tự (cùng chạm `okr.service.ts`, `okr-access.service.ts`, `okr.router.ts`). Sau Task 7: Task 8, 9, 10 `independent: true` (tệp rời nhau, mỗi việc một tệp chữ riêng) — chạy song song. Task 11 cuối, sau 8–10.

---

### Task 1: Khuôn, hằng, vết và `migration`

`independent: false` · phục vụ E2 (phần thuần), E22.

**Files:** tạo `packages/validation/src/okr-hien-thi.ts`, `packages/validation/test/okr-hien-thi.spec.ts`, `packages/db/prisma/migrations/20261006010000_okr_hien_thi_duyet/migration.sql`, `_acceptance/gioi-han-duyet-cay-okr/rang/migration-chi-them.mjs`; sửa `okr-muc-tieu.ts`, `okr-chuong-trinh.ts`, `okr-chu-ky.ts`, `packages/db/src/okr-vet.ts`, `schema.prisma`, `packages/validation/package.json` (subpath `./okr-hien-thi`).

**Interfaces — Produces:**

```ts
export const MUC_HIEN_THI = ["cong-khai", "gioi-han"] as const;
export type MucHienThi = (typeof MUC_HIEN_THI)[number];
export const OKR_HIEN_THI = { nguoiXemToiDa: 20, lyDoTraLai: { toiThieu: 10, toiDa: 500 }, chuyenToiDa: 50 } as const;
export type NguCanhXem = {
  userId: string;
  quanTri: boolean;
  boPhanTruong: string[];
  phongBanTruong: string[];
  phongBanDuoiBoPhanTruong: string[];
  nguoiDuoiQuyen: string[];
};
export type MucTieuDeXem = {
  hienThi: MucHienThi;
  level: CapMucTieu;
  divisionId: string | null;
  departmentId: string | null;
  personUserId: string | null;
  ownerUserId: string;
  thamGia: string[];
  phuTrachKr: string[];
  nguoiLamViec: string[];
  nguoiXem: string[];
};
export function xemDuocMucTieu(nc: NguCanhXem, mt: MucTieuDeXem): boolean;
export const datHienThiInput: z.ZodObject<{ objectiveId; hienThi; nguoiXem: z.ZodArray<z.ZodString> }>;
export const traLaiInput: z.ZodObject<{ objectiveId; lyDo }>;
export const chuyenDonViInput: z.ZodObject<{ objectiveIds; denDonVi: { level: "bo-phan" | "phong-ban"; id } }>;
```

`nguoiDuoiQuyen` = người có phòng ban chính mà người xem làm trưởng, hay thuộc bộ phận người xem làm trưởng — đúng vế `ca-nhan` của `suaDuocDonVi`.

- [ ] **Bước 1:** viết `packages/validation/test/okr-hien-thi.spec.ts` — MA TRẬN VIẾT TRƯỚC 11 người × 3 mục tiêu (hằng `KY_VONG` 33 ô, bài đếm và in số ô) như E2; ca khuôn: 21 người xem, lý do 9 và 501 ký tự, lô chuyển 51 mã, `level: "ca-nhan"` ở `denDonVi` đều từ chối.
- [ ] **Bước 2:** chạy `cd packages/validation && bun test test/okr-hien-thi.spec.ts` — đỏ vì thiếu mô-đun.
- [ ] **Bước 3:** viết `okr-hien-thi.ts`; `xemDuocMucTieu` trả `true` khi `hienThi === "cong-khai"`, hoặc `quanTri`, hoặc người xem thuộc `ownerUserId`/`personUserId`/`thamGia`/`phuTrachKr`/`nguoiLamViec`/`nguoiXem`, hoặc vế đơn vị: `bo-phan` → `divisionId ∈ boPhanTruong`; `phong-ban` → `departmentId ∈ phongBanTruong ∪ phongBanDuoiBoPhanTruong`; `ca-nhan` → `personUserId ∈ nguoiDuoiQuyen`; `onehub` → chỉ các vế người.
- [ ] **Bước 4:** `TRANG_THAI_MUC_TIEU` thêm `"cho-duyet"` sau `"nhap"`; `mucTieuInput` thêm `hienThi: z.enum(MUC_HIEN_THI).default("cong-khai")`; `okrProgram` thêm `duyetCongBo: z.boolean()`, `OKR_PROGRAM_MAC_DINH.duyetCongBo = false`; `PHA_CHUYEN_DUOC = ["lap-ke-hoach","dang-chay","cham-diem"]`; sáu hành động vết cuối `HANH_DONG_VET`. Chạy `rg -n "TRANG_THAI_MUC_TIEU|z.enum\(TRANG" apps packages` và sửa mọi `switch` thiếu ca (`check-types` bắt).
- [ ] **Bước 5:** schema: `hienThi String @default("cong-khai")` trên `OkrObjective` kèm `@@index([cycleId, hienThi])`, `nguoiXem OkrNguoiXem[]`; `duyetCongBo Boolean @default(false)` trên `OkrProgramConfig`; model cuối `OkrNguoiXem { objectiveId, userId, createdById, createdAt, @@id([objectiveId, userId]), @@index([userId]), @@map("okrNguoiXem") }`. Sinh migration bằng `cd packages/db && bunx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script`, đặt vào thư mục mốc mới; đọc lại: chỉ các câu cho phép.
- [ ] **Bước 6:** `rang/migration-chi-them.mjs` chép khuôn `_acceptance/canh-kr-okr/rang/migration-chi-them.mjs`, đổi tập câu cho phép thành tập của Global Constraints; `--chieu-do` chạy trên bản sao có thêm `UPDATE "okrObjective"` → đỏ in câu.
- [ ] **Bước 7:** `bun test` của bước 1 xanh; `bun _acceptance/gioi-han-duyet-cay-okr/rang/migration-chi-them.mjs` xanh; `bun run check-types` xanh. Commit. Phá-thử sau commit: bỏ vế `nguoiLamViec` → ô ghim đỏ; `migration-chi-them --chieu-do` đỏ.

### Task 2: Điều kiện xem ở `packages/db`, ngữ cảnh, hàm đếm đơn vị

`independent: false` · phục vụ E2, E11 (hàm đếm).

**Files:** tạo `packages/db/src/okr-hien-thi.ts`, `packages/db/src/okr-don-vi.ts`, `apps/api/test/okr-hien-thi-san.ts` (sàn gieo dùng chung của lượt), `apps/api/test/okr-hien-thi.spec.ts` (ca `ma-tran-xem`); sửa `packages/db/package.json` (subpath `./okr-hien-thi`, `./okr-don-vi`), `apps/api/src/okr/okr-access.service.ts`.

**Interfaces — Produces:**

```ts
export function dieuKienXemMucTieu(nc: NguCanhXem): Prisma.OkrObjectiveWhereInput;
export const boGioiHan: Prisma.OkrObjectiveWhereInput;
export async function nguCanhXemOkr(db: Db | Tx, userIds: string[]): Promise<Map<string, NguCanhXem>>;
export async function demOkrCuaDonVi(db: Db | Tx, dv: { departmentId?: string; divisionId?: string }): Promise<{ mo: number; lichSu: number }>;
```

`OkrAccessService.nguCanhXem(q: Quyen, userId: string): NguCanhXem` dựng từ `q` (không truy vấn thêm).

- [ ] **Bước 1:** sàn gieo `okr-hien-thi-san.ts`: tạo qua thủ tục thật cây B1 (trưởng H) › P1 (trưởng T), P2; 11 người của E2; sáu mục tiêu. Mọi hàng qua dịch vụ, không `create` tay trừ người và cây (như `okr-canh-kr-san.ts`).
- [ ] **Bước 2:** ca `ma-tran-xem`: với từng người, `findMany({ where: dieuKienXemMucTieu(nc) })` so tập với lọc `xemDuocMucTieu` (11 so sánh); nạp bộ OKR mẫu vào kho thử (`apps/api/test/okr-mau-san.ts`) và so tập trưởng `nguCanhXemOkr` với `quyen()` cho mọi người mẫu. Chạy — đỏ.
- [ ] **Bước 3:** viết `dieuKienXemMucTieu`: `quanTri` → `{}`; còn lại `{ OR: [ { hienThi: "cong-khai" }, { ownerUserId }, { personUserId }, { participants: { some: { userId } } }, { keyResults: { some: { ownerUserId } } }, { keyResults: { some: { viec: { some: { nguoiLamUserId: userId } } } } }, { nguoiXem: { some: { userId } } }, { level: "bo-phan", divisionId: { in } }, { level: "phong-ban", departmentId: { in: [...phongBanTruong, ...phongBanDuoiBoPhanTruong] } }, { level: "ca-nhan", personUserId: { in: nguoiDuoiQuyen } } ] }`. `boGioiHan = { hienThi: "cong-khai" }`.
- [ ] **Bước 4:** `nguCanhXemOkr` đọc `member` (vai), `division` và `department` chưa lưu trữ có `headUserId`, `orgPlacement` + `orgSecondaryDepartment`; luật trưởng hiệu lực như `apps/api/src/to-chuc/cay.ts` `truongHop` (trưởng phòng ban còn là thành viên và thuộc phòng ban chính hay phụ; trưởng bộ phận còn là thành viên).
- [ ] **Bước 5:** `demOkrCuaDonVi`: `mo` = mục tiêu `status != "da-bo"` ở chu kỳ `phase ∈ PHA_CHUYEN_DUOC`; `lichSu` = mọi mục tiêu.
- [ ] **Bước 6:** ca xanh; `check-types` xanh; commit. Phá-thử: bỏ vế `nguoiXem` khỏi điều kiện → so sánh tập của X đỏ in id thiếu.

### Task 3: Mọi đường đọc tôn trọng mức hiển thị

`independent: false` · phục vụ E3, E4, E23.

**Files:** sửa `okr.service.ts` (`docMucTieu`, `byUnit`, `mine`, `objective`, `alignmentTree`, `mucTieuCuaCay`, `alignmentTargets`, `countByUnit`, `addAlignment`), `okr-xem.service.ts` (`danhSach`, `toanCanh`, `cayCanChinh`, `hopTuan`, `khoiCuaToi`, `dienBien`, `sucKhoe`), `okr-khep.service.ts` (`bangCham`, `xuatKy`), `okr-canh-kr.service.ts` (`canhKr`), `okr-trao-doi.service.ts` (`comments`), `okr-so.service.ts` (`lichSuSo`, `banGhiChiSo`), `okr-cap-nhat.service.ts` (`capNhatTuan`), `okr-config.ts` (`khongThayMucTieu`, `gioiHanKhongCanChinh`); tạo `apps/api/src/okr/hien-thi.ts`, `_acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs` (ca `xem`), `rang/duong-doc-okr.json`; bài `apps/api/test/okr-hien-thi.spec.ts` (ca `so-gop`), `apps/api/test/vai-chi-okr.spec.ts` (ca `hien-thi-an`).

**Interfaces — Consumes:** Task 2. **Produces:** `vetChoNguoiXem(dong, xemDuoc: (objectiveId: string) => boolean)` — before/after có `objectiveId`/`targetObjectiveId` người đọc không xem được thành `{ gioiHan: true }`.

- [ ] **Bước 1:** `duong-doc-okr.json` — danh sách thủ tục đọc ngoài router `okr` chạm bảng OKR (đọc `rg -n "okr(Objective|KeyResult|ViecKr|GhiNhan|Comment|CheckIn|Trail|SoChup)\." apps/api/src --glob '!**/okr/**'`); rỗng thì ghi `[]` kèm lý do trong `soi-ma.mjs`.
- [ ] **Bước 2:** ca `hien-thi-an` trong `vai-chi-okr.spec.ts`: ma trận `THU_TU_DOC_OKR` như E3 (mỗi dòng một thủ tục, đầu vào cố định, cột kỳ vọng cho K; 3 đường × 3 người; mã trạng thái so toEqual; đếm chuỗi lộ). Ca `so-gop` trong `okr-hien-thi.spec.ts` như E4. Thêm ca Review Focus: bỏ X khỏi người xem rồi `objective(G)` bởi X → 404; mục tiêu cá nhân giới hạn của N, N đổi phòng ban chính → trưởng mới thấy, trưởng cũ 404. Chạy — đỏ.
- [ ] **Bước 3:** trong mỗi dịch vụ, dựng `nc = this.access.nguCanhXem(q, userId)` một lần mỗi lời gọi; danh sách: `where: { AND: [whereCu, dieuKienXemMucTieu(nc)] }`; bảng con: `objective: dieuKienXemMucTieu(nc)` lồng; số gộp (`toanCanh`, `hopTuan`, `sucKhoe`, `countByUnit`): thêm `boGioiHan`; theo mã: `findFirst` với điều kiện, không thấy → `NotFoundException(OKR.thongDiep.khongThayMucTieu)` — cùng câu với chỗ `mucTieuCo` hôm nay.
- [ ] **Bước 4:** căn chỉnh: `alignmentTargets` và `addAlignment` thêm `boGioiHan` cho đích và nguồn; nguồn hay đích giới hạn → 400 `gioiHanKhongCanChinh`.
- [ ] **Bước 5:** vết (`objective`, `dienBien`): đi qua `vetChoNguoiXem`, tập id xem được lấy bằng một `findMany({ where: { id: { in }, ...dieuKienXemMucTieu(nc) }, select: { id: true } })`.
- [ ] **Bước 6:** `soi-ma.mjs --ca xem` (suy gốc kho từ `import.meta.url`): quét bảng okrObjective và bảy bảng con trên `apps/api/src`, `packages/db/src`, `apps/agent/agent/lib` (bỏ `test`); `MIEN_XEM` viết trước (các chỗ ghi, `kiemTranMucTieu`, `moCoi`, `demOkrCuaDonVi`, bộ đếm SQL); tệp ngoài okr phải có mặt trong `duong-doc-okr.json`; `--chieu-do` như E23.
- [ ] **Bước 7:** chạy `ghd_hien_thi_bon_duong`, `ghd_hien_thi_so_gop`, `ghd_soi_xem` (lệnh ở `_acceptance/config.yaml`), `okr-toan-canh-hieu-nang.spec.ts` — xanh. Commit. Phá-thử: bỏ điều kiện ở `danhSach` → ô ghim đỏ; bỏ `vetChoNguoiXem` → ô vết C1 đỏ.

### Task 4: Đặt mức hiển thị, mang sang, ghi dựa trên mục tiêu

`independent: false` · phục vụ E1, E5.

**Files:** tạo `apps/api/src/okr/okr-hien-thi.service.ts`; sửa `okr.service.ts` (`createObjective` ghi `hienThi`), `okr-khep.service.ts` (`mangSang` chép mức và người xem còn là thành viên), `okr-trao-doi.service.ts` (`follow`, `addComment` — nhắc tên phải xem được), `okr-canh-kr.service.ts` (`guiGhiNhan` — người gửi và người nhận phải xem được), `okr-so.service.ts` (`ghiSoKr`), `packages/db/src/okr-tro-ly.ts` (`xepViecTroLy` nhận `nguCanh` và từ chối), `okr.router.ts` (`datHienThi`), `okr.contracts.ts`, `okr.module.ts`; bài `okr-hien-thi.spec.ts` (ca `hien-thi-ghi`, `ghi-ke`).

**Interfaces — Produces:** `okr.datHienThi` (mutation, `datHienThiInput`) → `{ id, hienThi, nguoiXem: string[] }`; `okr.objective` thêm `hienThi`, `nguoiXem: { id, name }[]`, `quyen.datHienThi: boolean`.

- [ ] **Bước 1:** ca `hien-thi-ghi` (E1, kể cả mangSang và Review Focus «người xem rời rồi vào lại»), ca `ghi-ke` (E5). Chạy — đỏ.
- [ ] **Bước 2:** `datHienThi`: một giao dịch; `assertSuaMucTieu`; `assertKyGhiDuoc`; `status === "cho-duyet"` → 400 `dangChoDuyet`; mọi người xem là thành viên (`assertThanhVien`); sang `gioi-han` mà `okrAlignment.count({ OR: [{ sourceObjectiveId: id }, { targetObjectiveId: id }, { targetKeyResult: { objectiveId: id } }] }) > 0` → 400 nêu số; ghi cột và thay tập `okrNguoiXem`; `vet("doi-hien-thi", before {hienThi, nguoiXem}, after {…})`.
- [ ] **Bước 3:** ghi dựa trên mục tiêu: đầu mỗi thủ tục gọi `assertXemMucTieu(userId, objectiveId)` (404 như Task 3); nhắc tên, người nhận ghi nhận: người không xem được → 400 nêu tên.
- [ ] **Bước 4:** ca xanh; commit; phá-thử theo chiều đỏ của E1, E5.

### Task 5: Nhắc buổi sáng, việc của tôi và tác tử theo mức hiển thị

`independent: false` · phục vụ E6.

**Files:** sửa `packages/db/src/okr-nhac.ts` (lọc mục có `objectiveId` bằng `xemDuocMucTieu` với ngữ cảnh từ `nguCanhXemOkr` cho tập người nhận của lô — một truy vấn mục tiêu cho cả lô), `apps/agent/agent/lib/okr/doc.ts` (trước `docMucTieu`, đọc lại quyền người yêu cầu; không xem được → kết thúc việc với lý do `khongXemDuoc`, không đọc); bài `apps/agent/test/okr-nhac.integration.spec.ts` (ca `hien-thi`), `apps/agent/test/okr-hien-thi.integration.spec.ts`.

- [ ] **Bước 1:** hai ca như E6 — đỏ.
- [ ] **Bước 2:** cài; ca xanh; `bun run test` của `apps/agent` xanh; commit; phá-thử: bỏ lọc → ca F đỏ in mục lộ.

### Task 6: Bước duyệt

`independent: false` · phục vụ E7, E8, E9, E10.

**Files:** tạo `apps/api/src/okr/okr-duyet.service.ts`, bài `apps/api/test/okr-duyet.spec.ts`; sửa `okr-access.service.ts` (`nguoiDuyet(q, mt): { loai: "nguoi"; userId } | { loai: "quan-tri" }`, `duyetDuoc(q, userId, mt): boolean`), `okr.service.ts` (`program`/`setProgram` ô `duyetCongBo`, vết `cau-hinh` mang ô đổi; `publishObjective` và `applyImport` qua `congBoHayGuiDuyet`; `updateObjective`, `createKeyResult`, `updateKeyResult`, `removeKeyResult`, `addAlignment`, `removeAlignment`, `addParticipant`, `removeParticipant` từ chối `cho-duyet`), `okr.router.ts` (`guiDuyet`, `duyetMucTieu`, `traLaiMucTieu`, `rutDuyet`), `okr.contracts.ts` (`objective` thêm `choDuyet: { nguoiGui, guiLuc, nguoiDuyet: { ten } | "quan-tri" } | null`, `traLaiGanNhat: { lyDo, nguoi, luc } | null`, `quyen.guiDuyet/duyet/rutDuyet`), `packages/db/src/okr-nhac.ts` (`okr-cho-duyet` theo trạng thái, `okr-tra-lai` theo vết trong cửa sổ), `onboarding-nhac.ts` (`THU_TU_NHAC`), `packages/validation/src/nhac-ke-hoach.ts` (`mucNhac`), `apps/agent/agent/lib/tin-nhac.ts` (`TIEU_DE`, chữ hai loại).

**Interfaces — Produces:** `congBoTrongGiaoDich(tx, userId, mt, { tuDuyet: boolean })` — thân công bố hôm nay (status, `publishedAt`, khoá khởi điểm KR, vết) dùng chung cho `publishObjective` và `duyetMucTieu`.

- [ ] **Bước 1:** bốn ca E7–E10 và ca Review Focus hai lời gọi song song (duyệt ↔ rút lại). Chạy — đỏ.
- [ ] **Bước 2:** `nguoiDuyet` theo bảng AC-7 (dùng `q.boPhanCua`, `q.phongBanChinh`, trưởng lấy từ `q.cay`); `duyetDuoc` = người duyệt là chính người gọi, hoặc người duyệt là `quan-tri` và `q.quanTri`.
- [ ] **Bước 3:** bốn thủ tục; mỗi thủ tục khoá hàng mục tiêu `SELECT … FOR UPDATE` rồi đọc lại `status` trong giao dịch; `traLaiMucTieu` parse `traLaiInput`, vết `tra-lai` với `note = lyDo`.
- [ ] **Bước 4:** `publishObjective`: `program.duyetCongBo && level !== "onehub" && status === "nhap" && !duyetDuoc` → 400 `canDuyet`; `status === "cho-duyet"` công bố được khi ô tắt (người sửa được) hay khi `duyetDuoc`. `applyImport`: mục tiêu `congBo` mà người nhập không duyệt được → `cho-duyet` + vết `gui-duyet`.
- [ ] **Bước 5:** nhắc: `viecChoDuyet(db, userId)` — mục tiêu `cho-duyet` ở chu kỳ ghi được mà `nguoiDuyet` là người đó (hay `quan-tri` và người đó là quản trị); `viecTraLai` từ vết `tra-lai` trong cửa sổ, gửi người của dòng `gui-duyet` gần nhất trước nó.
- [ ] **Bước 6:** ca xanh; `okr-nhac.integration.spec.ts -t duyet` xanh; commit; phá-thử theo chiều đỏ E7–E10.

### Task 7: Tái cơ cấu — chặn lưu trữ, chuyển OKR, OKR mồ côi

`independent: false` · phục vụ E11, E12, E13, E14.

**Files:** tạo `apps/api/src/okr/okr-tai-co-cau.service.ts`, bài `apps/api/test/okr-tai-co-cau.spec.ts`, `_acceptance/gioi-han-duyet-cay-okr/rang/okr-mo-coi.sql`, `rang/mo-coi.mjs`; sửa `apps/api/src/to-chuc/to-chuc.service.ts` (`archiveDepartment`, `archiveDivision`, `purgeDepartment`, `purgeDivision` gọi `demOkrCuaDonVi` trong giao dịch), `xoa-phong-ban.ts` (`lyDoKhongXoaPhongBan` nhận `okrLichSu`), `cay.ts` và `to-chuc.contracts.ts` (`okrMo` mỗi đơn vị, `purgeable` tính cả OKR), `to-chuc-config.ts` (câu chữ), `okr.router.ts` (`chuyenDonVi`, `moCoi`).

**Interfaces — Produces:** `okr.chuyenDonVi` → `{ daChuyen: number, canhBao: string | null }`; `okr.moCoi({ cycleId? })` → `{ objectiveId, tieuDe, donVi: { level, id, ten }, lyDo: ("don-vi-luu-tru" | "khong-ai-sua" | "phu-trach-roi" | "kr-phu-trach-roi")[] }[]`; `org.tree` mỗi đơn vị thêm `okrMo: number`.

- [ ] **Bước 1:** ba ca `luu-tru-chan`, `chuyen-don-vi`, `mo-coi` như E11–E13, thêm ca Review Focus trùng tiêu đề. Chạy — đỏ.
- [ ] **Bước 2:** `to-chuc`: lưu trữ đơn vị có `mo > 0` → 400 câu nêu số và lối ra; xoá hẳn có `lichSu > 0` → 400 (không để Prisma P2003 thành 500). `org.tree` đếm `okrMo` bằng một `groupBy` cho cả cây (giữ số truy vấn cố định).
- [ ] **Bước 3:** `chuyenDonVi`: quản trị (`assertQuanTri`); parse `chuyenDonViInput`; một giao dịch; mọi mục tiêu tồn tại, cùng cấp với `denDonVi.level`, chu kỳ `PHA_CHUYEN_DUOC`, không `da-bo`; đơn vị nhận còn sống; một hỏng → 400 cả lô; ghi `departmentId`/`divisionId`, vết `chuyen-don-vi`; trần: đếm sau khi chuyển, vượt → `canhBao`.
- [ ] **Bước 4:** `moCoi` (quản trị): mục tiêu không bỏ ở chu kỳ chưa đóng; lý do tính từ cây của `quyen` (đơn vị lưu trữ; không trưởng hiệu lực cả hai cấp; người của mục tiêu cá nhân không còn là thành viên) và `member` (người phụ trách mục tiêu hay KR đã rời). `okr-mo-coi.sql` đếm cùng bốn lớp, trả cặp (`objectiveId`, `lop`), không cột tuổi; `mo-coi.mjs` chạy trong phiên đo, gieo qua API thật, so với `okr.moCoi`, `--chieu-do` như E14.
- [ ] **Bước 5:** ca xanh; `ghd_mo_coi_sql` xanh; commit; phá-thử theo chiều đỏ E11–E14.

### Task 8: Màn — khung mục tiêu, hộp mức, duyệt, việc của tôi

`independent: true` · phục vụ E15, E16, E17.

**Files:** tạo `apps/app/components/crm/record-sheet/objective-hien-thi.tsx`, `objective-duyet.tsx`, `apps/app/lib/messages/okr-gioi-han.ts`, `apps/app/test/okr-gioi-han-duyet.dom.tsx`; sửa `objective-sheet.tsx` (nhãn «Giới hạn», «Chờ duyệt», menu «Mức hiển thị…», nút «Gửi duyệt» thay «Công bố» khi `quyen.guiDuyet`, trạng thái lỗi 404 dùng câu «Không tìm thấy mục tiêu này»), `apps/app/app/(app)/[slug]/okr/hop-thoai-muc-tieu.tsx` (ô mức), `viec-cua-toi.tsx` (hai loại mục), `tien-do-kr.tsx` (`NhanTrangThai` thêm `cho-duyet`).

- [ ] **Bước 1:** bài DOM ma trận 6 × 6 như E17 — đỏ.
- [ ] **Bước 2:** dựng theo bản mẫu `/proto/gioi-han-duyet-cay-okr` (`_modules/gioi-han-duyet-cay-okr/khung-muc-tieu.tsx` là bản vẽ); màn chỉ đọc cờ `quyen.*` từ API.
- [ ] **Bước 3:** bài xanh; `bun run check-types`, `bun run lint`, `bun run lint:slop` xanh; commit.

### Task 9: Màn — Cài đặt, Tổ chức, Sức khoẻ

`independent: true` · phục vụ E18, E19.

**Files:** tạo `apps/app/lib/messages/okr-tai-co-cau.ts`, `apps/app/app/(app)/[slug]/settings/organization/hop-chuyen-okr.tsx`, khối `okr-mo-coi.tsx` cạnh màn Sức khoẻ; sửa `settings/okr/form-cau-hinh.tsx` (dòng `Field` ngang + `Switch` trong form có sẵn), `settings/organization/chi-tiet-phong-ban.tsx`, `chi-tiet-bo-phan.tsx` (dòng «OKR: N mục tiêu ở kỳ đang mở» + «Chuyển OKR…» cho quản trị), `xac-nhan-luu-tru.tsx` (đọc `okrMo`: khoá nút, nêu lý do, mở hộp chuyển).

- [ ] **Bước 1:** bài DOM nhỏ trong `okr-gioi-han-duyet.dom.tsx` cho hộp lưu trữ đọc `okrMo` (ca `luu-tru-chan`) — đỏ.
- [ ] **Bước 2:** dựng theo `_modules/gioi-han-duyet-cay-okr/cai-dat.tsx`, `mo-coi.tsx`; hộp chuyển gửi đúng tập ô đã chọn.
- [ ] **Bước 3:** xanh; ba lệnh kiểm xanh; commit.

### Task 10: Bộ OKR mẫu

`independent: true` · phục vụ E20.

**Files:** sửa `apps/api/scripts/okr-mau/cong-ty.json`, `nap.ts` (ghi `hienThi`, `okrNguoiXem`, mục tiêu `cho-duyet`, vết `tra-lai`, phòng ban lưu trữ chỉ còn mục tiêu quý 3 đã khép; `xoaTrong` xoá `okrNguoiXem` trước mục tiêu), `apps/api/test/okr-mau.spec.ts` (ca `gioi-han-duyet`).

- [ ] **Bước 1:** ca như E20 — đỏ. **Bước 2:** cài; xanh; ca cũ của `okr-mau.spec.ts` xanh; commit; phá-thử theo chiều đỏ E20.

### Task 11: Đường đo, phép đo màn, soi thiết kế, tài liệu

`independent: false` · phục vụ E15, E16, E18, E19, E21, E24, E25.

**Files:** tạo `rang/ty-le-gioi-han-duyet.sql`, `rang/ty-le.mjs`, `rang/man-gioi-han-duyet.mjs`; mở rộng `rang/soi-ma.mjs` ca `thiet-ke` (ghi `evidence/diff-luot.txt`); sửa `CONTEXT.md` (Mức hiển thị (mục tiêu), Chờ duyệt / Người duyệt (OKR), Chuyển OKR, OKR mồ côi — nghĩa, _Avoid_, Vì sao), `docs/api.md` (mục OKR: luật xem, bước duyệt, chuyển, mồ côi; mục cây tổ chức: luật lưu trữ, xoá hẳn), `docs/agent.md` (hai loại nhắc), `_acceptance/gioi-han-duyet-cay-okr/mo-ta-pr.md`.

- [ ] **Bước 1:** `ty-le-gioi-han-duyet.sql` + `ty-le.mjs` theo E21 (ghép cặp gửi ↔ xử lý kế tiếp, rút lại không tính, cặp mở không vào trung vị, `tatTrongHaiTuan` từ vết `cau-hinh`); chạy qua `tien-de.mjs`.
- [ ] **Bước 2:** `man-gioi-han-duyet.mjs` theo E15, E16, E18, E19 — khuôn `_acceptance/canh-kr-okr/rang/man-canh-kr.mjs` (cảnh cây, phiên đo, CDP ghi phản hồi, chặn truy vấn ở trình duyệt, 390, `--chieu-do`). Nhớ: tab Radix cần chuột thật; mở khung bằng bấm, không bằng `?record=` (bài học «thước màn»).
- [ ] **Bước 3:** `soi-ma.mjs --ca thiet-ke` như E24; tài liệu và từ điển.
- [ ] **Bước 4:** năm lệnh chứng của kho (`bun run test`, `check-types`, `lint`, `lint:slop`, `build`) xanh; commit; phá-thử theo chiều đỏ E21, E24.
