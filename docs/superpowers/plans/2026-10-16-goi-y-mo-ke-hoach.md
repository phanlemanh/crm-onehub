# Gợi ý mở kế hoạch khi deal thắng — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deal sang giai đoạn thắng thì máy chủ sinh một Gợi ý mở kế hoạch cho người phụ trách; người đó mở kế hoạch hay bỏ qua ngay trên sheet deal, và thấy gợi ý trong nhắc buổi sáng.

**Architecture:** Một bảng `GoiYKeHoach` và một mô-đun luật `packages/db/src/goi-y-ke-hoach.ts`, gọi trong cùng giao dịch ở hai chỗ ghi giai đoạn (`chuyenGiaiDoanTrongTx`, `DealsService.create`) và ở `createFromTemplate`. Router onboarding thêm hai thủ tục; sheet deal thêm một thẻ; bộ gom nhắc thêm một nguồn. Thước ngưỡng đọc lịch sử giai đoạn, không đọc bảng gợi ý.

**Tech Stack:** Prisma + Postgres, NestJS + nestjs-trpc, Next.js + `@crm/ui`, bun test, tác tử eve (`apps/agent`).

**Gate 1.5:** duyệt — manh, 2026-10-16T08:52Z («Gate 1.5 goi-y-mo-ke-hoach: duyệt kế hoạch»).

**Spec:** `docs/superpowers/specs/2026-10-16-goi-y-mo-ke-hoach-design.md` · hợp đồng `_acceptance/goi-y-mo-ke-hoach/contract.md` · evals `_acceptance/goi-y-mo-ke-hoach/evals.yaml` (Cổng Phạm vi ký 16/10, bốn câu theo khuyến nghị).

## Global Constraints

- Không chú thích trong code (luật kho `khong-chu-thich`: `node scripts/luat-kho/do-cay.mjs --du-luat`).
- Luật sinh tất định ở máy chủ, trong cùng giao dịch; không qua `apps/agent`.
- Hình dữ liệu qua ranh giới gói sống ở `packages/validation/src/goi-y-ke-hoach.ts`, nhập bằng subpath `@crm/validation/goi-y-ke-hoach`; `z.infer`, không viết interface tay.
- Hằng số chỉnh được (chữ thông báo lỗi, số ngày của thước) gom một đối tượng `as const` mỗi khu.
- Giao diện chỉ từ `@crm/ui`; chữ màn qua `apps/app/lib/messages/record-sheet.ts` (en + vi có dấu, `messages-guard` bắt).
- Migration mang mốc UTC sau migration mới nhất trên onehub lúc commit (hôm nay `20261015234401_ke_hoach_sinh_viec`); kiểm lại sau mỗi lần gộp onehub.
- Lời lỗi: «Gợi ý này đã được xử lý.» (400) — nguyên văn.
- Chữ thẻ: «Deal đã thắng — mở kế hoạch 30 ngày cho <công ty>?», nút «Mở kế hoạch» · «Bỏ qua».
- Biome `--write` chỉ trên tệp của vòng.

## Review Focus

1. Deal đã lưu trữ còn gợi ý chờ → không thẻ, không dòng nhắc (`goiYCuaDeal` trả `null`) — Task 3, Task 5.
2. Người nhận rời workspace → dòng nhắc không gửi (bộ gom đã lọc thành viên); quản trị vẫn bỏ qua được — Task 5.
3. Tạo kế hoạch và «Bỏ qua» cùng lúc trên một gợi ý → đúng một bên thắng; bên sau nhận 400 hay không đổi gì — Task 3.
4. Tên công ty rất dài → thẻ xuống dòng, không đẩy nút ra ngoài — Task 7 (`man.mjs` gieo tên dài ở khổ 375).
5. Deal sang thắng khi người phụ trách là người vai «chỉ OKR» → vẫn sinh gợi ý (người nhận là `ownerId`), dòng nhắc vẫn tới — Task 2.

---

### Task 1: Bảng, migration và mô-đun luật

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (thêm `enum TrangThaiGoiY { CHO DA_MO BO_QUA }`, `model GoiYKeHoach` theo design mục 3, quan hệ ngược ở `Deal`, `Company`, `User` ×2, `OnboardingPlan`)
- Create: `packages/db/prisma/migrations/<UTC>_goi_y_mo_ke_hoach/migration.sql` (Prisma sinh + thêm tay `CREATE UNIQUE INDEX "goiYKeHoach_dealId_cho_key" ON "goiYKeHoach"("dealId") WHERE "trangThai" = 'CHO';`)
- Create: `packages/db/src/goi-y-ke-hoach.ts`; Modify: `packages/db/package.json` (export `./goi-y-ke-hoach`)
- Create: `packages/validation/src/goi-y-ke-hoach.ts`; Modify: `packages/validation/package.json`

**Interfaces — Produces:**
- `GOI_Y = { thongDiep: { daXuLy: "Gợi ý này đã được xử lý." } } as const`
- `sinhGoiYKeHoach(tx, { dealId: string; tuLoai: LoaiGiaiDoan | null; denLoai: LoaiGiaiDoan; now: Date }): Promise<{ id: string } | null>` — điều kiện design mục 4; đọc `deal.ownerId`, `companyId`; kiểm kế hoạch `closedAt: null` của công ty và gợi ý `CHO` của deal.
- `dongGoiYCuaCongTy(tx, { companyId: string; planId: string; nguoiId: string; now: Date }): Promise<number>` — `updateMany` `CHO → DA_MO`.
- `boQuaGoiYTrongTx(tx, { id: string; nguoiId: string; now: Date }): Promise<void>` — `updateMany where { id, trangThai: CHO }`; 0 hàng → ném lỗi mang `GOI_Y.thongDiep.daXuLy`.
- validation: `goiYKeHoachRa` (zod: `id, dealId, companyId, companyName, nguoiNhanId, trangThai, sinhLuc`), `goiYCuaDealInput { dealId }`, `boQuaGoiYInput { id }`.

- [ ] Sửa schema, chạy `bun run db:generate` rồi `cd packages/db && bunx prisma migrate dev --create-only --name goi_y_mo_ke_hoach`, thêm dòng chỉ mục một phần, đổi tên thư mục cho đúng mốc UTC.
- [ ] Viết `goi-y-ke-hoach.ts` và module validation.
- [ ] Verify: `bun run db:test --reset && bun run check-types` thoát 0.
- [ ] Commit.

Evals phục vụ: nền của E1–E4, E7, E8. `independent: false`.

### Task 2: Móc vào đổi giai đoạn và tạo deal

**Files:**
- Modify: `apps/api/src/deals/deals.service.ts` (`chuyenGiaiDoanTrongTx` sau `activity.create`: `sinhGoiYKeHoach(tx, { dealId, tuLoai: tu.kind, denLoai: den.kind, now })`; `create` sau `tx.deal.create`: `tuLoai: null`)
- Create: `apps/api/test/goi-y-mo-ke-hoach.spec.ts`, `apps/api/test/support/goi-y-gieo.ts` (dùng lại `gieoThanhVien`, `gieoCongTy`, `batApp`, `goi` của `support/ke-hoach-gieo.ts`, `support/viec-gieo.ts`; gieo giai đoạn M1, M2, W, W2, L qua `giaiDoan` service thật)
- Modify: `_acceptance/config.yaml` không đổi (khoá `gymk_*` đã có).

**Interfaces — Consumes:** `sinhGoiYKeHoach` (Task 1).

- [ ] Viết `describe("gy-sinh")` theo E1: bảng 12 ô `const MA_TRAN = [{ tu: "tao"|"mo"|"thang"|"thua", den: "mo"|"thang"|"thua", sinh: boolean }]` viết trước; ô đi từ thắng bỏ qua gợi ý dựng bằng `onboarding.boQuaGoiY` trước khi đo (cần Task 3 — viết ca này cùng lúc nhưng chạy sau Task 3; tới đó dùng `boQuaGoiYTrongTx` trực tiếp trong bước dựng là KHÔNG được — dựng phải qua đường ghi thật); bulkSetStage; lưu trữ W→W2; người phụ trách vai `okr` vẫn nhận gợi ý (Review Focus 5). Thông điệp ghim đúng chữ của E1.
- [ ] Viết `describe("gy-chan")` theo E2, gồm `Promise.all` hai `setStage` và kiểm `pg_indexes` có `goiYKeHoach_dealId_cho_key`.
- [ ] Chạy `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.spec.ts -t gy-sinh"` → đỏ (chưa móc); móc; chạy lại → xanh. Cùng cho `-t gy-chan`.
- [ ] Phá thử tay: bỏ lời gọi ở `chuyenGiaiDoanTrongTx` → `gy: o sinh sai mo→thang`; bỏ điều kiện chờ → `gy: chan cho khong chan`; hoàn lại.
- [ ] Commit.

Evals phục vụ: E1, E2. `independent: false`.

### Task 3: Thủ tục onboarding và đóng gợi ý khi tạo kế hoạch

**Files:**
- Modify: `apps/api/src/onboarding/onboarding.router.ts` (hai thủ tục), `onboarding.service.ts` (`goiYCuaDeal`, `boQuaGoiY`, gọi `dongGoiYCuaCongTy` trong giao dịch `createFromTemplate` sau khi tạo bước), `apps/api/src/onboarding/onboarding.contracts.ts` hay nơi khai input hiện có
- Modify: `apps/api/test/goi-y-mo-ke-hoach.spec.ts`

**Interfaces — Produces:**
- `onboarding.goiYCuaDeal({ dealId }) → GoiYKeHoachRa | null` (query, REST `GET /onboarding/deals/{dealId}/goi-y`): trả gợi ý `CHO` khi người gọi là người nhận hay `canManageOnboarding`, deal không lưu trữ và giai đoạn hiện tại là `WON`; ngược lại `null`.
- `onboarding.boQuaGoiY({ id }) → { id, trangThai }` (mutation, REST `POST /onboarding/goi-y/{id}/bo-qua`): người khác → `ForbiddenException`; đã xử lý → `BadRequestException(GOI_Y.thongDiep.daXuLy)`.

- [ ] Viết `describe("gy-xu-ly")` theo E3 (bảng bốn người × hai thủ tục) cộng ca deal lưu trữ → `null` (Review Focus 1) và ca `Promise.all([createFromTemplate, boQuaGoiY])` → đúng một kết cục, gợi ý không ở hai trạng thái (Review Focus 3).
- [ ] Viết `describe("gy-dong")` theo E4 (tRPC, REST qua `supertest`, khuôn lưu trữ).
- [ ] Chạy đỏ → cài → xanh cho `-t gy-xu-ly`, `-t gy-dong`; rồi chạy lại `-t gy-sinh` (ô đi từ thắng nay dùng `boQuaGoiY` thật).
- [ ] Phá thử tay: bỏ kiểm quyền → `gy: nguoi khac bo qua duoc`; bỏ `dongGoiYCuaCongTy` → `gy: tao ke hoach khong dong goi y`.
- [ ] Commit.

Evals phục vụ: E3, E4 (và E1 ô từ thắng). `independent: false`.

### Task 4: Thẻ trên sheet deal

**Files:**
- Create: `apps/app/components/crm/record-sheet/goi-y-ke-hoach.tsx` (`"use client"`, `TheGoiYKeHoach({ dealId }: { dealId: string })`: `useQuery(trpc.onboarding.goiYCuaDeal…)`, `Alert` + `AlertTitle` + `AlertDescription` + hai `Button`, `data-goi-y-ke-hoach`, tên công ty `translate="no"` `break-words`; «Mở kế hoạch» bật `TaoKeHoach` với `congTyCoDinh`, `mo`, `doiMo` như `company-plans.tsx`; «Bỏ qua» lạc quan qua `setQueryData(null)`, lỗi thì khôi phục và `toast.error(<lời máy chủ> + " Tải lại sheet để xem.")`)
- Modify: `apps/app/components/crm/record-sheet/deal-sheet.tsx` (đặt thẻ trong `stats` sau `DaiLuuTruBanGhi`), `apps/app/lib/messages/record-sheet.ts` (`deal.goiYKeHoach: { tieuDe(congTy), mo, boQua, taiLai }` en + vi)
- Create: `apps/app/test/goi-y-ke-hoach.dom.tsx`; Create: `_acceptance/goi-y-mo-ke-hoach/rang/san-thiet-ke.mjs` (chép khuôn `ke-hoach-sinh-viec/rang/san-thiet-ke.mjs`, glob theo E5b, danh sách rỗng → thoát 1 `gy: san thiet ke khong co tep`)


- [ ] Viết bốn ca `gy-the-hien`, `gy-the-an`, `gy-the-mo`, `gy-the-bo-qua` theo E5, mock tRPC theo `ke-hoach-sheet.dom.tsx`.
- [ ] Đỏ → cài → xanh: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/goi-y-ke-hoach.dom.tsx`.
- [ ] `node _acceptance/goi-y-mo-ke-hoach/rang/san-thiet-ke.mjs` thoát 0; bản sao có `rounded-[7px]` thoát khác 0.
- [ ] Commit.

Evals phục vụ: E5, E5b. `independent: true` (sau Task 3).

### Task 5: Dòng nhắc buổi sáng và thông báo

**Files:**
- Create: `packages/db/src/goi-y-nhac.ts` (`LOAI_NHAC_GOI_Y = ["goi-y-ke-hoach"] as const`, `type ViecGoiY = { loai: "goi-y-ke-hoach"; goiYId; dealId; dealName; companyName }`, `viecGoiYCanNhac(db, { userId? }): Promise<Map<string, ViecGoiY[]>>` — gợi ý `CHO`, deal không lưu trữ, giai đoạn `WON`)
- Modify: `packages/db/src/onboarding-nhac.ts` (`ViecNhac`, `THU_TU_NHAC` đặt sau `LOAI_NHAC`, `gop`, `viecCanNhac`), `packages/validation/src/nhac-ke-hoach.ts` (`mucNhac`), `packages/validation/src/thong-bao.ts` (`LOAI_THONG_BAO`, `noiDungThongBao`, `khoaThongBao`), `apps/agent/agent/lib/nhac-ke-hoach.ts` (`maViec`, `duongTrongApp` → sheet deal), `apps/agent/agent/lib/tin-nhac.ts` (`TIEU_DE`, `dong`), chỗ app vẽ một thông báo theo `loai` (tìm theo `LOAI_THONG_BAO` trong `apps/app`), `apps/api/src/dashboard/dashboard.service.ts` nếu `switch` trên `loai` đòi đủ ca
- Create: `apps/agent/test/goi-y-mo-ke-hoach.integration.spec.ts`

- [ ] Viết `describe("gy-nhac")` theo E7: kiểm G2/G3 vắng TRƯỚC kiểm đếm; ca người nhận rời workspace → không dòng (Review Focus 2).
- [ ] Đỏ → cài → xanh: `bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.integration.spec.ts -t gy-nhac"`.
- [ ] `bun run check-types` thoát 0 (mọi `switch` theo `loai` đủ ca).
- [ ] Commit.

Evals phục vụ: E7. `independent: true` (sau Task 1; khác tệp Task 4).

### Task 6: Thước ngưỡng

**Files:**
- Create: `_acceptance/goi-y-mo-ke-hoach/rang/do-nguong.mjs` (khuôn `ke-hoach-sinh-viec/rang/do-nguong.mjs`: `GOC` suy từ vị trí tệp, `pg` qua `createRequire` của `packages/db`, `default_transaction_read_only=on`; hằng `NGUONG = 0.5`, `KIP_NGAY = 3`, `MA_DUOI_NGUONG = 2`, `MA_KHONG_DO = 3`; SQL theo design mục 7; JSON `{ lanChuyen, dealThangThieuGoiY, goiYPhan, xuLyKip, tiLe, chiDoc }`)
- Create: `apps/api/test/goi-y-mo-ke-hoach-do-nguong.spec.ts`

- [ ] Viết spec theo E8 với đáp án viết trước `{lanChuyen 3, dealThangThieuGoiY 0, goiYPhan 2, xuLyKip 1, tiLe 0.5}` và năm ca đỏ (thiếu gợi ý, dưới ngưỡng, mẫu số độc lập, ba ca mã 3).
- [ ] Đỏ → viết thước → xanh: `bun run test -- "cd apps/api && bun test test/goi-y-mo-ke-hoach-do-nguong.spec.ts"`.
- [ ] Commit.

Evals phục vụ: E8. `independent: true` (sau Task 3).

### Task 7: Răng của hồ sơ — màn thật, phá thử, không xoá expect

**Files:**
- Create: `_acceptance/goi-y-mo-ke-hoach/rang/man.mjs` (khuôn `ke-hoach-sinh-viec/rang/man.mjs` + `kho-tai-lieu/rang/man-lib.mjs`; cảnh cây trước màn đầu; gieo qua API thật với tên công ty dài; ba lượt `--tu-thu` của E6 chạy trước lượt thật; ảnh ra `.acceptance-runs/goi-y-mo-ke-hoach/evidence/E6-*.png`)
- Create: `_acceptance/goi-y-mo-ke-hoach/rang/dot-bien.mjs` (khuôn `ke-hoach-sinh-viec/rang/dot-bien.mjs` + `ca-chap-chon-cach-ly` `ban-sao.mjs`; mười cặp (a)–(j) của E11)
- Create: `_acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs` (chép `ke-hoach-sinh-viec/rang/khong-xoa-expect.mjs`, danh sách cho-phép rỗng)

- [ ] Chạy từng cặp đột biến tay trên bản sao, chép thông điệp ra trước thật vào bảng cặp.
- [ ] `node _acceptance/goi-y-mo-ke-hoach/rang/dot-bien.mjs` thoát 0 (làn nặng — xin làn Điều phối M5).
- [ ] `node _acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs --tu-thu` thoát 0.
- [ ] `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/goi-y-mo-ke-hoach/rang/man.mjs"` — mọi dòng «E6 …» đạt, ba dòng tự thử in KHONG DAT (phiên đo màn — xin làn).
- [ ] Commit.

Evals phục vụ: E6, E10, E11. `independent: false` (đọc mọi task trước).

### Task 8: Tài liệu và lộ trình

**Files:**
- Modify: `CONTEXT.md` (mục mới «Gợi ý mở kế hoạch» cạnh «Gợi ý»; mục «Gợi ý» thêm một câu phân biệt; mục «Nhắc buổi sáng» thêm gợi ý mở kế hoạch), `docs/api.md` (router onboarding: `goiYCuaDeal`, `boQuaGoiY`, đóng gợi ý trong `createFromTemplate`), `docs/plan/lo-trinh-viec-du-an.json` (DA3b `trang_thai: "đang dựng"`, `buoc_ke`)
- Sau sửa lộ trình: `node scripts/product-map.mjs --root .` (bản của KHO).

- [ ] Viết đủ sáu điều của E9, không dùng chữ «dự án» cho kế hoạch 30 ngày.
- [ ] `node scripts/product-map.mjs --root . --check` thoát 0.
- [ ] Commit.

Evals phục vụ: E9. `independent: true`.

### Kết S3

- [ ] `bun run check-types && bun run lint && bun run lint:slop && node scripts/luat-kho/do-cay.mjs --du-luat` thoát 0.
- [ ] Contract `status: implemented` → S4.
