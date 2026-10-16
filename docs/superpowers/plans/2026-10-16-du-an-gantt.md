# Dự án và Gantt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gom việc của một đợt triển khai vào dự án, xem trong màn «Việc» ở phạm vi một dự án trên Gantt có phụ thuộc xong-rồi-mới-bắt-đầu tự dời theo lịch làm việc, và mốc.

**Architecture:** Luật (ngày làm việc, tự dời, dò vòng, quyền) là hàm tất định trong `@crm/db`, chạy trong cùng giao dịch với lần ghi. API Nest mỏng (`duAn`, `lichLamViec`, mở rộng `viec`) dưới `PhamViDoiTacMiddleware`. Giao diện: một màn «Việc» có ô Phạm vi (`phamVi`), Gantt là `@reui/gantt` bọc trong `GanttDuAn` ở `packages/ui`.

**Tech Stack:** Prisma + Postgres, NestJS + nestjs-trpc, Next.js (apps/app), nuqs, `@reui/gantt`, date-fns, bun test.

**Gate 1.5:** chủ kho duyệt kế hoạch (2026-10-16T23:47:03Z, manh).

**Spec:** `docs/superpowers/specs/2026-10-16-du-an-gantt-design.md` · hợp đồng `_acceptance/du-an-gantt/contract.md` (approved 16/10, manh) · `_acceptance/du-an-gantt/evals.yaml`.

## Global Constraints

- Không chú thích trong mã (luật kho `khong-chu-thich`); trí khôn không ở API (`docs/api.md`); một `.env`.
- Ngày-chỉ-ngày lưu là ngày lịch Việt Nam lúc `00:00Z` (cùng quy ước `hanNgay`), trao đổi API dạng `YYYY-MM-DD`.
- Hằng số chỉnh được ở một module: `DU_AN = { tenToiDa: 120, moTaToiDa: 4000, viecToiDa: 300, mocToiDa: 50, phuThuocToiDa: 600, ngayLeToiDa: 200 } as const` trong `packages/db/src/du-an.ts`.
- Lịch mặc định: `ngayNghiTuan = [6, 7]` (ISO, 1 = Thứ Hai) khi `AppSetting.ngayNghiTuan` trống.
- Lời từ chối ghim nguyên văn theo hợp đồng (AC-1…AC-11), ví dụ «Việc này phải bắt đầu sau khi «A» xong (hạn dd/mm).», «Phụ thuộc này tạo vòng: «B» → «A» → «B».», «Dự án đã đóng.», «Ngày bắt đầu phải trước hay trùng hạn.», «Ngày này đã là ngày lễ.».
- Nguồn vết mới: `gantt`, `tu-doi`; loại vết mới: `doi-bat-dau`, `doi-du-an`, `them-phu-thuoc`, `go-phu-thuoc`. `DuAnVet.loai`: `tao`, `doi-noi-dung`, `them-viec`, `bot-viec`, `them-moc`, `sua-moc`, `xoa-moc`, `dong`, `mo-lai`.
- Màn «Việc» không tham số phải y như DA1–DA2 (mọi bài đo cũ của `viec-chung`, `kanban-viec` giữ xanh).
- Giao diện chỉ từ `packages/ui`; màu trạng thái qua `toneTheoNghia`; dữ liệu người nhập `translate="no"`; nhãn qua `messages`.
- `migration` mới mang mốc sau `20261015234401_ke_hoach_sinh_viec`; trước khi gộp onehub dời mốc nếu onehub có migration mới hơn.
- Luật phối hợp crm: S4, đột biến, phiên đo màn xin làn Điều phối M5; sửa `_acceptance/config.yaml` báo #375 trước.
- Không sửa `apps/app/components/detail-sheet.tsx` và `packages/ui/src/components/status-indicator.tsx`: hồ sơ đã ký
  `bo-cuc-hep-ngan-va-kanban` (#440, onehub `04ddefc4f`) đo hai tệp này ở E1–E6, E8; DA4 chỉ dùng chúng. Cần đổi thì
  báo #375 và Điều phối trước. `apps/app/lib/trpc/cache.ts` (#440 vừa sửa) chỉ được THÊM khoá làm mới ở Task 9.

## Review Focus

1. Dữ liệu phụ thuộc đã có vòng (ghi tay vào DB, hay lỗi đời trước) — `tinhDoi` phải dừng, không lặp vô hạn, và báo lỗi có tên. Test ở Task 2.
2. Việc gắn bước kế hoạch 30 ngày bị tự dời — hạn bước phải đổi theo qua `chieuLenBuoc`, bước không lệch Việc. Test ở Task 4.
3. Việc cha bị đưa ra khỏi dự án khi còn việc con trong dự án — con giữ dự án của nó (gắn sống riêng sau lúc tạo), phụ thuộc của cha được gỡ, con không đổi. Test ở Task 4.
4. Chuỗi tự dời chạm `DU_AN.viecToiDa` hay một việc đã Huỷ ở giữa chuỗi — Huỷ không dời, không chặn; lan tiếp qua nó theo hạn cũ. Test ở Task 2.
5. Đổi phạm vi trên đường dẫn tới một dự án đã xoá hay không tồn tại — màn về «Của tôi» kèm thông báo, không trắng trang. Test ở Task 9.

---

### Task 1: Bảng dữ liệu và migration

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (thêm `DuAn`, `DuAnVet`, `DuAnMoc`, `DuAnMocCho`, `ViecPhuThuoc`, `NgayNghi`; `Viec.duAnId`, `Viec.batDauNgay`, quan hệ `Viec.phaiCho`/`choBoi`; `AppSetting.ngayNghiTuan Int[]`)
- Create: `packages/db/prisma/migrations/20261016120000_du_an_gantt/migration.sql`

**Interfaces:**
- Produces: model như design mục «Bảng dữ liệu»; `Viec.duAnId` khoá ngoại `onDelete: Restrict`, chỉ mục `[duAnId]`; `ViecPhuThuoc @@unique([truocId, sauId])`, xoá `Cascade` theo cả hai đầu; `DuAnMocCho @@unique([mocId, viecId])`, xoá `Cascade`; `NgayNghi.ngay @unique`.
- Eval phục vụ: nền cho mọi E. `independent: false`.

- [ ] Viết schema, `bunx prisma migrate dev --name du_an_gantt --create-only`, đổi tên thư mục theo mốc trên, `bun run db:generate`.
- [ ] Verify: `bun run check-types` xanh; `bun run db:test --reset` chạy migration sạch.
- [ ] Commit.

### Task 2: Lịch làm việc và luật tự dời (hàm thuần)

**Files:**
- Create: `packages/db/src/lich-lam-viec.ts`, `packages/db/src/lich-viec.ts`
- Create: `packages/db/test/lich-lam-viec.spec.ts`, `packages/db/test/lich-viec.spec.ts`
- Modify: `packages/db/package.json` exports `./lich-lam-viec`, `./lich-viec`

**Interfaces:**
- Produces: `type LichLam = { ngayNghiTuan: number[]; ngayLe: string[] }`; `laNgayLam(ngay: string, lich: LichLam): boolean`; `ngayLamKe(ngay: string, lich): string` (ngày làm việc đầu tiên SAU `ngay`); `congNgayLam(ngay: string, n: number, lich): string`; `soNgayLam(tu: string, den: string, lich): number` (đếm cả hai đầu). Ngày dạng `YYYY-MM-DD`.
- Produces: `type NutLich = { id: string; tieuDe: string; batDau: string | null; han: string | null; dong: boolean }`; `type CanhPhuThuoc = { truocId: string; sauId: string }`; `tinhDoi(nut: NutLich[], canh: CanhPhuThuoc[], thayDoi: { id: string; batDau: string; han: string }, lich: LichLam): { id: string; batDau: string; han: string; boi: string }[]` theo thứ tự tô-pô; ném `LoiLich("vong", chuoi)` khi gặp vòng; `timVong(canh, moi: CanhPhuThuoc): string[] | null` trả chuỗi id của vòng nếu thêm cạnh mới.
- Eval phục vụ: E7. `independent: true`.

- [ ] Test trước: ma trận 24 dòng viết tay đúng như `expected` của E7 (lời `llv: <ham> <vao> ra <x> ky vong <ra>`, đếm 24); đồ thị AC-7 cho `tinhDoi` (B → 27/10–28/10, C → 29/10–30/10, D không dời, kéo sớm rỗng, B Xong không dời, đối chứng không lễ → B 26/10); thêm hai ca Review Focus 1 (vòng sẵn trong dữ liệu → `LoiLich` có chuỗi) và 4 (việc Huỷ giữa chuỗi).
- [ ] Chạy `config:executors.test.dg_ngay_lam` → đỏ; viết hàm; chạy lại → xanh. Phá thử: `ngayLamKe` bỏ ngày lễ → thấy lời `llv:`.
- [ ] Commit.

### Task 3: Hằng số, khuôn vết và khuôn lịch dùng chung

**Files:**
- Create: `packages/db/src/du-an.ts` (`DU_AN`, `LOAI_VET_DU_AN`, `vetDuAn` zod, `parseVetDuAn`, `dieuKienXemDuAn`, `coLichSuDuAn(tx, duAnId)`)
- Modify: `packages/db/src/viec.ts` (`NGUON_VIEC` + `gantt`, `tu-doi`; `LOAI_VET_VIEC` + bốn loại mới; nhánh `vetViec` cho `doi-bat-dau` {truoc,sau: string|null}, `doi-du-an` {truoc,sau: {id,ten}|null}, `them-phu-thuoc`/`go-phu-thuoc` {viec: {id,tieuDe}}; `doi-han`/`doi-bat-dau` thêm `boi?: {id,tieuDe}`; `dieuKienXemViec` thêm vế `duAnId: { not: null }`; `CHON_VIEC` thêm `batDauNgay`, `duAnId`)
- Create: `packages/validation/src/du-an-lich.ts` (zod `duAnLich` = khuôn trả của `duAn.lich`; export type `DuAnLich`) + export subpath

**Interfaces:**
- Produces: `DuAnLich = { duAn: {id, ten, moTa, dong: boolean, taoBoiId}; viec: {id, tieuDe, chaId, batDau, han, trangThai, nghia, suaDuoc, phaiCho: string[]}[]; moc: {id, ten, ngay, tre: boolean, treBoi: string[], cho: string[]}[]; lich: LichLam }`.
- Eval phục vụ: E2, E3, E5, E6, E8 (khuôn). `independent: false` (sau Task 1).

- [ ] Test: `parseVetViec` đọc được bốn loại mới và từ chối khuôn sai (thêm ca vào `packages/db/test/viec-vet.spec.ts` có sẵn hay tạo mới); `vetDuAn` chín loại.
- [ ] Commit.

### Task 4: Đường ghi Việc — ngày bắt đầu, đổi lịch, dự án, tự dời

**Files:**
- Modify: `packages/db/src/viec-ghi.ts` (`TaoViecInput.duAnId?`, `SuaViecInput.batDauNgay?`; `taoViec`, `taoViecCon` mang `duAnId`; `kiemNguoiNhanViec` coi việc trong dự án là phạm vi đối tác)
- Create: `packages/db/src/viec-lich-ghi.ts` (`doiLich`, `doiDuAn`, `apDoi` — khoá `DuAn` rồi việc theo `id`, gọi `tinhDoi`, ghi vết, gọi `chieuLenBuoc`)

**Interfaces:**
- Consumes: Task 2 `tinhDoi`, `ngayLamKe`; Task 3 khuôn vết.
- Produces: `doiLich(tx, { viecId, nguoiId, now, nguon: "gantt" | "web", batDauNgay?: Date | null, hanNgay?: Date | null }): Promise<{ daDoi: { id: string; tieuDe: string }[] }>`; `doiDuAn(tx, { viecId, nguoiId, now, nguon, duAnId: string | null }): Promise<void>`; `suaViec` chuyển phần ngày sang `doiLich`.
- Luật: `batDau > han` → `LoiViec("khong-hop-le", "Ngày bắt đầu phải trước hay trùng hạn.")`; đặt bắt đầu sớm hơn `ngayLamKe(han trước)` → lời Hỏi-5; việc trong dự án đã đóng → «Dự án đã đóng.».
- Eval phục vụ: E2, E3, E5, E7b, E10 (một phần). `independent: false`.

- [ ] Test (`apps/api/test/du-an-lich.spec.ts` khung `-t dg-bat-dau`, `-t dg-keo-thanh`, `-t dg-tu-doi` theo đúng `expected`), cộng hai ca Review Focus 2 (bước kế hoạch theo hạn mới) và 3 (cha rời dự án, con giữ).
- [ ] Chạy `dg_bat_dau`, `dg_keo_thanh`, `dg_tu_doi` → đỏ; viết; xanh. Phá thử: `tinhDoi` cho kéo lùi → `dg: keo lui that`.
- [ ] Commit.

### Task 5: Đường ghi Dự án — tạo, sửa, mốc, phụ thuộc, vòng đời

**Files:**
- Create: `packages/db/src/du-an-ghi.ts`

**Interfaces:**
- Produces: `taoDuAn(tx, {nguoiId, ten, moTa?, now}): Promise<{id}>`; `suaDuAn`; `dongDuAn`, `moLaiDuAn` (chỉ người tạo hay quản trị — Hỏi-2); `xoaDuAn` (403 trước 409); `taoMoc(tx, {duAnId, ten, ngay, cho: string[], ...})`, `suaMoc`, `xoaMoc`, `datMocCho`; `taoPhuThuoc(tx, {truocId, sauId, nguoiId, now}): Promise<{daDoi}>` (gọi `timVong`, cùng dự án, đủ ngày, quyền ở việc sau — lời Hỏi theo AC-6; dời ngay qua `apDoi`); `xoaPhuThuoc`; `mocTre(moc, viec): {tre, treBoi}`.
- Eval phục vụ: E1, E6, E8, E11. `independent: false` (sau Task 4).

- [ ] Test API ở Task 6 đo hàm này qua router; ở đây chỉ `bun run check-types`.
- [ ] Commit.

### Task 6: API `duAn`, mở rộng `viec`, `lichLamViec`

**Files:**
- Create: `apps/api/src/du-an/{du-an.module.ts, du-an.router.ts, du-an.service.ts, du-an.contracts.ts}`
- Create: `apps/api/src/lich-lam-viec/{lich-lam-viec.module.ts, lich-lam-viec.router.ts, lich-lam-viec.service.ts, lich-lam-viec.contracts.ts}` (đọc: phạm vi chung; ghi: `canManageSettings`)
- Modify: `apps/api/src/viec/viec.contracts.ts`, `viec.router.ts`, `viec.service.ts`, `viec-bang.service.ts` (`viec.sua.batDauNgay`, `viec.doiLich`, `viec.doiDuAn`, `viec.create.duAnId`, `viec.bang.duAnId`, `viec.cuaToi` trả `duAn: {id, ten} | null` mỗi dòng), `apps/api/src/app.module.ts`, `apps/api/src/generated/server.ts` (`bun run trpc:generate`)
- Test: `apps/api/test/du-an.spec.ts`, `du-an-lich.spec.ts` (từ Task 4), `du-an-quyen.spec.ts`, `lich-lam-viec.spec.ts`

**Interfaces:**
- Produces thủ tục: `duAn.list({trangThai: "mo" | "dong"})` → `{id, ten, soViec, soXong, batDauSom, hanMuon, mocKe: {ten, ngay, tre} | null, taoBoi}[]`; `duAn.get`, `duAn.tao`, `duAn.sua`, `duAn.dong`, `duAn.moLai`, `duAn.xoa`; `duAn.lich({id})` → `DuAnLich`; `duAn.moc.tao|sua|xoa|datCho`; `duAn.phuThuoc.tao|xoa` → `{daDoi}`; `lichLamViec.get|datNgayNghiTuan|themNgayLe|xoaNgayLe`.
- Eval phục vụ: E1, E2, E3, E5, E6, E7b, E8, E9, E10, E11. `independent: false`.

- [ ] Viết test đúng `expected` của từng eval (E10: bảng 65 ô viết tay; trạng thái dựng theo cột).
- [ ] Chạy `dg_tao`, `dg_gom`, `dg_moc`, `dg_vong_doi`, `dg_phu_thuoc`, `dg_lich`, `dg_quyen` → đỏ; viết; xanh. Phá thử mỗi eval một lần theo danh sách đột biến E15.
- [ ] `bun run test -- --filter=api` toàn bộ xanh (DA1–DA3 không đổi). Commit.

### Task 7: Dữ liệu mẫu và thước ngưỡng

**Files:**
- Create: `packages/db/src/du-an-gieo.ts` (`gieoDuAnMau(db, {now})` qua đường ghi thật; từ chối DB không phải local; luỹ đẳng theo tên mẫu)
- Modify: `packages/db/prisma/seed.ts`
- Create: `_acceptance/du-an-gantt/rang/do-nguong.mjs`, `_acceptance/du-an-gantt/rang/dap-an.json`, `apps/api/test/du-an-do-nguong.spec.ts`

**Interfaces:**
- Produces: thước in JSON `{duAnDat, duAnDatDu, nguoiTaoDat, duAnCoPhuThuoc}`, cờ `--tu`, `--den`, chỉ đọc.
- Eval phục vụ: E12. `independent: true` (sau Task 6).

- [ ] Test E12 (P1–P4, đáp án 3 · 1 · 2 · 3) → đỏ; viết; xanh; phá thử ba đột biến (o), (p), (q). Commit.

### Task 8: `GanttDuAn` hoàn thiện ở `packages/ui`

**Files:**
- Modify: `packages/ui/src/components/gantt-du-an.tsx` (chỉ dựng sau hydrat; `treePanel` hẹp dưới `md`; `data-gantt-moc`, `data-tone` trên thanh qua `renderEvent`; nhận `DuAnLich` đã đổi sang props ở trang)
- Modify: `packages/ui/src/components/reui/gantt/gantt-view.tsx` (ô ngày nghỉ mang `data-off-day`; đường phụ thuộc mang `data-gantt-dependency` với `data-tu`/`data-den`; thanh mang `data-gantt-bar`)
- Modify: `packages/ui/src/components/dropdown-menu.tsx` (biến thể bề rộng tối thiểu cho menu chọn — finding Nhóm 2 của design-pass)
- Create: `packages/ui/test/gantt-du-an.dom.tsx`

**Interfaces:**
- Produces: `GanttDuAn` props như hiện có (`GanttDuAnViec`, `GanttDuAnMoc`, `GanttDuAnLich`, `onDoiLich({id, batDau, han, nguon})` với ngày `YYYY-MM-DD`).
- Eval phục vụ: E4, E5b (phía thành phần). `independent: true` (song song Task 2–7).

- [ ] Test E4 đúng `expected` → đỏ; viết; xanh; phá thử (d). `render-diff.spec.tsx` giữ xanh. Commit.

### Task 9: Màn «Việc» một nơi — ô Phạm vi, Tất cả dự án, phạm vi dự án

**Files:**
- Modify: `apps/app/lib/search-param-keys.ts` (`SEARCH_PARAM.viec.phamVi = "phamVi"`), `apps/app/app/(app)/[slug]/viec/page.tsx` (câu mô tả theo phạm vi), `apps/app/app/(app)/[slug]/viec/viec-cua-toi.tsx` (ô Phạm vi, `KIEU_XEM` thêm `gantt` chỉ khi phạm vi dự án)
- Create: `apps/app/components/du-an/{o-pham-vi.tsx, tat-ca-du-an.tsx, dai-du-an.tsx, gantt-cua-du-an.tsx, tao-du-an.tsx, them-moc.tsx}`, `apps/app/lib/messages/du-an.ts`
- Modify: `apps/app/components/viec/bang-viec.tsx`, `bang-cot-viec.tsx` (dòng phụ «Dự án: …»; lọc `duAnId`), `apps/app/lib/trpc/cache.ts` (làm mới)
- Test: `apps/app/test/du-an.dom.tsx`, `apps/app/test/du-an-gantt.dom.tsx`, phần `-t dg-man-dong-phu` trong `apps/app/test/viec-bang.dom.tsx`

**Interfaces:**
- Consumes: Task 6 thủ tục; Task 8 `GanttDuAn`.
- Eval phục vụ: E1b, E2b (dòng phụ), E4b, E5b, E11b. `independent: false`.

- [ ] Test theo `expected` của E1b, E4b, E5b, E11b, cộng ca Review Focus 5 (`?phamVi=<id không tồn tại>` → «Của tôi» + thông báo).
- [ ] Chạy `dg_man_ds`, `dg_man_gantt`, `dg_man_keo`, `dg_man_dong` → đỏ; viết; xanh. Mọi bài `kv_*`, `vc_*` cũ của Việc xanh. Commit.

### Task 10: Khung việc — Bắt đầu, Dự án, Phải chờ

**Files:**
- Modify: `apps/app/components/viec/khung-viec.tsx`, `apps/app/components/viec/lich-su-viec.tsx` (đọc vết `doi-bat-dau`, `doi-du-an`, `them-phu-thuoc`, `go-phu-thuoc`; vết `tu-doi` ghi «Hạn dời từ … sang … vì «<việc trước>» dời»), `apps/app/lib/messages/viec.ts`
- Create: `apps/app/components/viec/muc-phai-cho.tsx`, `apps/app/test/khung-viec-lich.dom.tsx`

**Interfaces:**
- Consumes: `viec.sua`, `viec.doiDuAn`, `duAn.phuThuoc.*`, `duAn.list`.
- Eval phục vụ: E2b, E3b, E6b. `independent: true` (sau Task 6, song song Task 9 — khác tệp).

- [ ] Test E2b, E3b (hai múi giờ), E6b → đỏ; viết; xanh; phá thử (t). Commit.

### Task 11: Cài đặt › Lịch làm việc

**Files:**
- Create: `apps/app/app/(app)/[slug]/settings/lich-lam-viec/{page.tsx, lich-lam-viec.tsx}`, `apps/app/test/lich-lam-viec.dom.tsx`
- Modify: `apps/app/lib/cai-dat-dieu-huong.ts` (nhóm `khongGian`), `apps/app/lib/messages/settings.ts`

**Interfaces:**
- Consumes: `lichLamViec.*`.
- Eval phục vụ: E9b. `independent: true` (sau Task 6).

- [ ] Test E9b → đỏ; viết; xanh. Commit.

### Task 12: Răng đo màn, sàn thiết kế, đột biến, tài liệu

**Files:**
- Create: `_acceptance/du-an-gantt/rang/{man.mjs, san-thiet-ke.mjs, dot-bien.mjs}` (khuôn của `_acceptance/kanban-viec/rang/`)
- Modify: `CONTEXT.md` (mục «Dự án», «Việc của tôi», thêm «Mốc (dự án)», «Phụ thuộc (việc)», «Lịch làm việc»), `docs/api.md` (phần «Dự án» trong mục «Việc»)

**Interfaces:**
- Eval phục vụ: E13, E13b, E14, E15. `independent: false` (cuối cùng).

- [ ] `dg_san_thiet_ke` xanh và phá thử (n) đỏ; `dg_dot_bien` 21/21 đột biến chết (xin làn M5 trước khi chạy). `dg_man` chạy trong phiên đo (xin làn).
- [ ] `bun run test`, `check-types`, `lint`, `lint:slop`, `build` xanh; `node scripts/luat-kho/do-cay.mjs --du-luat` xanh. Đặt hợp đồng `status: implemented`. Commit.
