# Gỡ tín hiệu rác (TH5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chủ và quản trị lưu trữ một tín hiệu chưa lấy về, lượt kéo về bỏ qua nó, mỗi lần lưu trữ/khôi phục có vết người làm, và Hoàn tác/Khôi phục được.

**Architecture:** Hai cột `archivedAt`/`archivedById` trên `tinHieu` + bảng `tinHieuVet`; `TinHieuService` thêm `luuTru`/`khoiPhuc`, lọc `archivedAt: null` ở `keoVe` và `tatCa` mặc định; thẻ «Tất cả» đếm ba ô số ở trình duyệt bằng hàm chung trên truy vấn mặc định, menu dòng và nút «Đã lưu trữ» đã dựng ở S1 (`menu-luu-tru.tsx`, `bang-tat-ca.tsx`).

**Tech Stack:** Prisma 7 (Postgres), NestJS + nestjs-trpc, Zod 4, Next (apps/app), TanStack Query, bun test, puppeteer-core (đo màn).

**Spec:** `docs/superpowers/specs/2026-10-19-go-tin-hieu-rac-design.md`; hợp đồng `_acceptance/go-tin-hieu-rac/contract.md`; eval `_acceptance/go-tin-hieu-rac/evals.yaml` (lệnh ở `_acceptance/config.yaml`, khoá `gtr_*`).

## Global Constraints

- Không chú thích trong mã (AGENTS.md). Không `useEffect` trong mã app.
- Hằng tinh chỉnh ở `TIN_HIEU` (`packages/validation/src/tin-hieu.ts`); khuôn đầu vào mới cũng ở đó.
- Tệp chữ và cấu hình dùng chung chỉ thêm dòng (luật 7 của đợt): `apps/app/lib/messages/tin-hieu.ts`, `_acceptance/config.yaml`, `CONTEXT.md`.
- Chữ lỗi 409: «Đội sản phẩm đã lấy tín hiệu này về — không lưu trữ được nữa.» (`TIN_HIEU.loi.luuTruDaLayVe`).
- Loại vết: `"luu-tru"` | `"khoi-phuc"`; lần gọi không đổi trạng thái không thêm vết; lưu trữ lại không đổi `archivedAt`.
- Hoàn tác dùng `baoDaLuuTru` (10 giây, `LUU_TRU.hoanTacMs`).
- Migration chỉ thêm; tên xếp sau `20261016120000_du_an_gantt`.
- Mã lấy chữ từ `tinHieuMessages(...).tatCa.luuTru.*`, `nhan.daLuuTru`, `trangThai.daLuuTru` (đã thêm ở S1).
- Mọi thao tác ghi đi qua `apps/api`; bài API gieo dữ liệu qua `tinHieu.gui` thật, không chèn bảng.

## Review Focus

1. Tín hiệu bị người gửi xoá sau khi đã lưu trữ — vết phải ở lại (`tinHieuId` SetNull, `so` giữ mã). Task 2 thêm ca.
2. Tài khoản quản trị bị xoá — `nguoiLuuTru` null hiện «Không còn tài khoản», không vỡ dạng «Đã lưu trữ». Task 3 thêm ca dom.
3. REST `GET /tin-hieu/tat-ca` không tham số vẫn trả như TH4 (chỉ tín hiệu đang dùng). Task 2 chạy lại `mth_api`.
4. Khôi phục một tín hiệu vừa bị người gửi xoá → 404 «Không có tín hiệu này.», không ném lỗi 500. Task 2 thêm ca.
5. Bật «Đã lưu trữ» rồi lọc theo phòng ban — số đếm bộ lọc là của dạng đang xem, không lẫn dạng kia. Task 3 (E6).

---

### Task 1: Dữ liệu — cột lưu trữ, bảng vết, migration chỉ thêm

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `TinHieu` ~2998, model `User` ~103)
- Create: `packages/db/prisma/migrations/20261019150000_go_tin_hieu_rac/migration.sql`
- Create: `_acceptance/go-tin-hieu-rac/rang/migration-chi-them.mjs` (bám `_acceptance/may-soan-de-xuat/rang/migration-chi-them.mjs`)

**Interfaces:**
- Produces: `TinHieu.archivedAt DateTime?`, `TinHieu.archivedById String?` (`archivedBy User? @relation("TinHieuLuuTru", onDelete: SetNull)`); model `TinHieuVet { id cuid, tinHieuId String? (SetNull), so Int, luc DateTime @default(now()), nguoiId String? (SetNull, @relation("TinHieuVetNguoi")), loai String, @@index([tinHieuId, luc]), @@map("tinHieuVet") }`; `TinHieu.vet TinHieuVet[]`.

- [ ] Step 1: Viết `rang/migration-chi-them.mjs`: tập bảng được dùng `{"tinHieuVet", "tinHieu"}`, migration của hồ sơ `["20261019150000_go_tin_hieu_rac"]`, in một dòng mỗi câu lệnh, thông điệp đỏ ghim «migration khong chi them»; kiểm luật 2 (mọi bảng/cột trỏ tới có trong migration tên xếp trước hoặc chính nó); chạy `prisma migrate diff --from-migrations <thư mục> --to-schema <schema> --exit-code` trên kho tạm như `migration-tren-ban-sao.mjs`, khác 0 → đỏ «schema troi so voi migration». Có cờ `--tu-thu` chép migration vào thư mục tạm, chèn `UPDATE "tinHieu" SET ...` và `ADD COLUMN ... NOT NULL`, khẳng định mỗi bản đỏ đúng thông điệp.
- [ ] Step 2: `bun _acceptance/go-tin-hieu-rac/rang/migration-chi-them.mjs` → đỏ (migration chưa có).
- [ ] Step 3: Sửa schema, sinh migration bằng `cd packages/db && bunx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script` rồi lưu vào thư mục migration trên; `bun run db:generate`.
- [ ] Step 4: Chạy lại rang (không cờ, rồi `--tu-thu`) → xanh; `bun run check-types` ở `packages/db` xanh.
- [ ] Step 5: Commit `feat(go-tin-hieu-rac): cột lưu trữ và bảng vết tín hiệu`.

Phục vụ: E10 · independent: false

### Task 2: API — lưu trữ, khôi phục, kéo về bỏ qua, danh sách, trang người gửi

**Files:**
- Modify: `packages/validation/src/tin-hieu.ts`, `apps/api/src/tin-hieu/tin-hieu.service.ts`, `tin-hieu.router.ts`, `tin-hieu.contracts.ts`
- Create: `apps/api/test/tin-hieu-luu-tru.spec.ts` (khung gieo bám `tin-hieu-tat-ca.spec.ts`: `gieoThanhVien`, `mintPhien`, `auth.api.createApiKey`; khoá lịch bám `khoa-keo-tin-hieu.spec.ts` hàm `khoaKeo`)
- Regenerate: `apps/api/src/generated` (`cd apps/api && bun run trpc:generate`)

**Interfaces:**
- Produces (validation): `luuTruTinHieuInput = z.object({ id: z.string().min(1) })`, `khoiPhucTinHieuInput` (cùng khuôn), `tatCaTinHieuInput = z.object({ archived: z.boolean().default(false) })` nhận được cả khi thiếu đầu vào (REST cũ), `LOAI_VET_TIN_HIEU = ["luu-tru", "khoi-phuc"] as const`, `TIN_HIEU.loi.luuTruDaLayVe`.
- Produces (service): `luuTru(nguoi, id): Promise<{ ok: true; daLuuTruLuc: string }>`, `khoiPhuc(nguoi, id): Promise<{ ok: true }>`, `tatCa(nguoi, { archived }): Promise<TinHieuTatCaOutput>` — dòng thêm `archivedAt: Date | null`, `nguoiLuuTru: { id; ten } | null`; `cuaToi` dòng thêm `daLuuTru: boolean`.
- Produces (router): `tinHieu.luuTru` (`POST /tin-hieu/{id}/luu-tru`), `tinHieu.khoiPhuc` (`POST /tin-hieu/{id}/khoi-phuc`), `tinHieu.tatCa` nhận `tatCaTinHieuInput`.

- [ ] Step 1: Viết `tin-hieu-luu-tru.spec.ts` đủ bảy describe đúng tên và khẳng định của E1 (`gtr-luu-tru`), E2 (`gtr-keo-ve`, gồm ca `gtr-lenh` gọi `chayKeoVe` qua `app.listen(0)`), E3 (`gtr-da-lay-ve`, hai ca có thứ tự giữ khoá bằng `db.$transaction` + `LOCK TABLE`), E4 (`gtr-quyen`, ma trận 12 ô), E5 (`gtr-khoi-phuc`), E7 (`gtr-ba-so`), E8a (`gtr-cua-toi`); cộng hai ca Review Focus 1 và 4 trong `gtr-khoi-phuc`. Mọi khẳng định lọc theo id đã gieo.
- [ ] Step 2: `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/tin-hieu-luu-tru.spec.ts"` → đỏ (thủ tục chưa có).
- [ ] Step 3: Validation + service: `luuTru` trong giao dịch `LOCK TABLE "tinHieu" IN ROW EXCLUSIVE MODE` (như `xoa`), kiểm vai, 404/409, `updateMany where { id, archivedAt: null, keoVeLuc: null }` rồi `tinHieuVet.create` khi `count === 1`; `khoiPhuc` tương tự với `archivedAt: { not: null }`; `keoVe` thêm `archivedAt: null` ở `updateMany` và `findMany`; `tatCa` lọc `archivedFilter(archived)` (`apps/api/src/trpc/list-input.ts`); `cuaToi` chọn thêm `archivedAt`. Nhật ký `tin-hieu.luu-tru` / `tin-hieu.khoi-phuc` ghi `userId`, `so`.
- [ ] Step 4: Router + contracts; `bun run trpc:generate` (nhập tên khuôn gốc, không `import … as` — memory trpc-generate).
- [ ] Step 5: Chạy lại spec → xanh; chạy `mth_api`, `gth_vai`, `bun test scripts/tin-hieu/test/keo-ve.test.ts` (TH4/LT2 không vỡ) → xanh.
- [ ] Step 6: Phá-thử từng chiều đỏ của E1–E5, E7, E8a trên bản sao đã commit (memory pha-thu-phai-commit-truoc), ghi thông điệp ghim thấy được; hoàn lại.
- [ ] Step 7: Commit `feat(go-tin-hieu-rac): API lưu trữ và khôi phục tín hiệu`.

Phục vụ: E1, E2, E3, E4, E4b, E5, E7, E8a · independent: false (cần Task 1)

### Task 3: Thẻ «Tất cả» — nối dữ liệu, Hoàn tác, ba ô số đổi ngay

**Files:**
- Modify: `apps/app/app/(app)/[slug]/tin-hieu/tat-ca/page.tsx`, `tat-ca-trang.tsx`, `apps/app/lib/tin-hieu/tat-ca.ts`
- Modify (nếu cần): `apps/app/components/tin-hieu/bang-tat-ca.tsx`, `menu-luu-tru.tsx`
- Create: `apps/app/test/tin-hieu-luu-tru.dom.tsx`

**Interfaces:**
- Consumes: Task 2 router; `MenuLuuTru`, `ThaoTacLuuTru`, `BangTatCa({ thaoTac })`, `DongTatCa.daKeoVe/luuTru`, `dongTuHang(... archivedAt, nguoiLuuTru)` (S1).
- Produces: `docNenTatCa({ html, rows, m }): { banVeDocDuoc: boolean; trangThai: Record<string, TrangThaiDu>; coCho: string[] }` và `demBaSo({ rows, coCho, banVeDocDuoc, now }): BaSo` trong `lib/tin-hieu/tat-ca.ts` (thay `ghepTatCa`, giữ `ghepTatCa` gọi hai hàm này để bài TH4 không đổi); `TatCaTrang({ trangThai, coCho, banVeDocDuoc })`.

- [ ] Step 1: Viết `tin-hieu-luu-tru.dom.tsx` với describe `hoan-tac` (E5b), `thanh-cong-cu` (E6, cộng Review Focus 2 và 5), `ba-so-giu` (E7b), `ca-man` (E9); mock tRPC theo nếp `onError` của mock TH6 (memory th6).
- [ ] Step 2: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tin-hieu-luu-tru.dom.tsx` → đỏ.
- [ ] Step 3: Trang máy chủ gọi `tatCa` mặc định, đưa `trangThai`, `coCho`, `banVeDocDuoc` xuống. `TatCaTrang`: `useTableQuery(tatCaListParams)`; truy vấn `tatCa({ archived: input.archived })` cho bảng và `tatCa({ archived: false })` cho `demBaSo`; hai `useMutation` (`luuTru`, `khoiPhuc`) — thành công: `cache.tinHieu()`, `baoDaLuuTru` (lưu trữ) hoặc `toast.success(daKhoiPhuc)`; lỗi 409 (`data.httpStatus`) → `toast.error(vuaLayVe)` + `cache.tinHieu()`; lỗi khác → `luuTruHong`/`khoiPhucHong`; `dangCho` = id đang chờ.
- [ ] Step 4: Chạy lại dom → xanh; chạy `mth_the_con`, `mth_dong`, `mth_thieu`, `mth_loc`, `mth_ba_so`, `mth_ghep` (TH4) → xanh; `bun run check-types` (sau `bunx next typegen` nếu thiếu `PageProps`).
- [ ] Step 5: Phá-thử chiều đỏ E5b, E6, E7b, E9; hoàn lại.
- [ ] Step 6: Commit `feat(go-tin-hieu-rac): thẻ Tất cả lưu trữ, Hoàn tác, Đã lưu trữ`.

Phục vụ: E5b, E6, E7b, E9 · independent: false (cần Task 2)

### Task 4: Trang người gửi và từ điển

**Files:**
- Modify: `apps/app/lib/tin-hieu/trang-thai.ts` (`CuaToiTom` thêm `daLuuTru: boolean`; nhánh đầu của `docTrangThaiDu`: `daLuuTru` → `{ khoa: "da-luu-tru", nhan: m.nhan.daLuuTru, cau: m.trangThai.daLuuTru, nghia: "ketThuc" }`), `apps/app/app/(app)/[slug]/tin-hieu/page.tsx` (truyền `daLuuTru`)
- Modify: `CONTEXT.md` (thêm mục «Lưu trữ tín hiệu» sau mục «Tín hiệu», không sửa mục cũ)
- Test: `apps/app/test/tin-hieu-luu-tru.dom.tsx` describe `nguoi-gui`

- [ ] Step 1: Viết describe `nguoi-gui` đúng E8 → đỏ.
- [ ] Step 2: Sửa `trang-thai.ts` và trang; mục từ điển: lưu trữ tín hiệu là việc của chủ/quản trị, chỉ khi chưa lấy về, có Hoàn tác và Khôi phục, người gửi vẫn thấy nhãn «Đã lưu trữ»; _Avoid_: gỡ (khi ý là lưu trữ), ẩn, xoá.
- [ ] Step 3: Dom xanh; `cd apps/app && bun test ./test/tin-hieu-trang-thai.spec.ts ./test/sua-giao-dien-tin-hieu-cau.spec.ts` (bài cũ) xanh; phá-thử E8.
- [ ] Step 4: Commit `feat(go-tin-hieu-rac): người gửi thấy tín hiệu đã lưu trữ`.

Phục vụ: E8, E11 · independent: false (cần Task 2)

### Task 5: Đo màn thật

**Files:**
- Create: `_acceptance/go-tin-hieu-rac/rang/sinh-mau.mjs`, `rang/do-man.mjs` (bám `_acceptance/moi-tin-hieu-cho-quan-tri/rang/*.mjs`: gieo qua `tinHieu.gui` của ba người, một lượt kéo về thật trước khi gieo X để có dòng Y đã lấy về; mã/tiêu đề rút từ tệp mẫu)

- [ ] Step 1: Viết `do-man.mjs` bốn ca `luu-tru-hoan-tac` (đọc ô «Tín hiệu 30 ngày qua» ở bốn mốc so với `tatCa()` qua fetch cùng cookie), `da-lay-ve` + `tai-lai`, `nguoi-gui`, `375` (cùng đối chứng dương), ảnh vào `BANG_CHUNG`; dòng KET LUAN và mã 0/1/2 như TH4; bấm menu bằng chuột thật (memory do-man-that: tab Radix cần chuột thật).
- [ ] Step 2: Chạy `gtr_do_man` → mã 0; mở từng ảnh.
- [ ] Step 3: Phá-thử: bỏ `cache.tinHieu()` sau lưu trữ → ca `luu-tru-hoan-tac` mã 1 với thông điệp ghim; hoàn lại.
- [ ] Step 4: Commit `test(go-tin-hieu-rac): đo màn lưu trữ trên bản chạy`.

Phục vụ: E5c, E6b, E8b, E9b · independent: false (cần Task 3, 4)

### Task 6: Chốt thiết kế và bộ chứng năm lệnh

- [ ] Step 1: `gtr_thiet_ke` → exit 0; phá-thử `className` đổi màu trên một `Button` → đỏ; hoàn lại.
- [ ] Step 2: Năm lệnh từ gốc: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` (lệnh nặng chạy nền qua `giu-nhip` của gói điều phối khi đang giữ khoá) → xanh.
- [ ] Step 3: Đặt hợp đồng `status: implemented`, commit.

Phục vụ: E12 và toàn bộ · independent: false
