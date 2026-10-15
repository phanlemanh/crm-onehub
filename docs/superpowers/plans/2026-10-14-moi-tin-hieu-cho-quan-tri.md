# Mọi tín hiệu cho quản trị — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chủ và quản trị CRM mở thẻ «Tất cả» của trang Tín hiệu, thấy mọi tín hiệu (người gửi, phòng ban, màn,
trạng thái), lọc được, và đọc ba con số ngưỡng sống đếm bằng đúng hàm lệnh kéo về dùng.

**Architecture:** Một hàm đếm thuần trong `@crm/validation/tin-hieu` cho cả lệnh kéo về lẫn trang. API thêm query
`tinHieu.tatCa` (chỉ owner/admin, chỉ đọc). Trang `/[slug]/tin-hieu/tat-ca` theo nếp trang «Của tôi» của LT2: tiêu
đề + thanh thẻ ngoài `Suspense`, server tải trước và tính trạng thái + ba số, thẻ khách `useQuery` để có Thử lại,
lọc và chia trang ở trình duyệt (Cổng Phạm vi 14/10 chọn).

**Tech Stack:** Bun test, NestJS + nestjs-trpc, Prisma, Next.js (App Router, cacheComponents), nuqs, `@crm/ui`.

**Spec:** `docs/superpowers/specs/2026-10-14-moi-tin-hieu-cho-quan-tri-design.md` · hợp đồng
`_acceptance/moi-tin-hieu-cho-quan-tri/contract.md` · phép đo `_acceptance/moi-tin-hieu-cho-quan-tri/evals.yaml`.

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Không migration, không chạm `packages/db/prisma`.
- Số 30, 7, 50 chỉ ở `TIN_HIEU` (`ngayDem`, `ngayCoCho`, `coTrangTatCa`).
- Trang tính, thẻ khách vẽ; tệp `"use client"` không nhập `@crm/db`/`@crm/auth`.
- `docTrangThaiTinHieu` giữ nguyên đầu ra `{nhan, cau, nghia}` — bài `tin-hieu-trang-thai.spec.ts` của LT2 so `toEqual`; khoá trạng thái đi đường riêng.
- Dòng tổng kết của lệnh kéo về giữ từng chữ; `scripts/tin-hieu/test/keo-ve.test.ts` không đổi byte.
- Khoá lọc trên đường dẫn: `phongBan`, `trangThaiTinHieu`, `nguoiGui` (`trangThai` đã thuộc màn khác).
- Phản hồi `tatCa` không mang thư điện tử; tệp kéo về không mang tên hay thư.
- Mọi phép đo mới có cặp hai chiều (đối chứng dương + phá-thử đỏ với thông điệp ghim) — khuôn MEASURE-BIRTH.

## Review Focus

1. Hai phòng ban trùng tên → đếm là hai ở cả trang lẫn lệnh (Task 1, 3).
2. Tín hiệu có tài khoản người gửi đã bị xoá (`nguoiGuiId` null) → dòng «Không còn tài khoản», lọc «khong-con» ra đúng dòng (Task 3, 6).
3. Bản vẽ vắng → ô 3 «—», lệnh đếm mọi tín hiệu quá hạn là chưa có chỗ — chênh lệch đã khai, không so bằng (Task 4).
4. Thành viên mở thẳng `/tin-hieu/tat-ca` → server page KHÔNG gọi `tatCa` (Task 6, E3).
5. Đổi lọc ở trang 2 → về trang 1 (Task 6, E6 ô h).

---

### Task 1: Hàm đếm ngưỡng sống dùng chung

**Phục vụ:** E8 · **independent:** false (Task 2–6 dùng)

**Files:**
- Modify: `packages/validation/src/tin-hieu.ts`
- Create: `packages/validation/test/tin-hieu-nguong-song.spec.ts`

**Interfaces — Produces:**
```ts
export type DongDem = { id: string; luc: string; phongBan: { khoa: string; ten: string } | null };
export type NguongSong = { trongKy: number; soPhong: number; theoPhong: [string, number][]; khongPhong: number; quaHan: number; chuaCoCho: number };
export function demNguongSong(ds: DongDem[], now: Date, coCho: ReadonlySet<string>): NguongSong
export function coChoSauGom(kq: KetQuaDuong): Set<string>
export function dongDemTuKeoVe(tep: KeoVeOutput["tep"]): DongDem[]
export function dongDemTuTatCa(rows: { ma: string; guiLuc: Date | string; phongBan: { id: string; ten: string } | null }[]): DongDem[]
```
`keoVeOutput.tep[]` thêm `phongBanId: z.string().nullable().optional()`. `theoPhong` khoá theo tên hiển thị
nhưng gộp theo `khoa`: hai khoá cùng tên ra hai mục cùng tên (lệnh in hai dòng).

- [ ] Viết ma trận E8 (biên 30 ngày ±1 ms, biên 7 ngày ±1 ms, null phòng ban, cùng khoá, khác khoá cùng tên, coCho có/không/rỗng, `coChoSauGom` quét đủ `CHO_TIN_HIEU`, kiểu `khong-co`/`hong` → tập rỗng, `dongDemTuKeoVe` có/vắng `phongBanId`).
- [ ] Chạy: `cd packages/validation && bun test test/tin-hieu-nguong-song.spec.ts` → đỏ (hàm chưa có).
- [ ] Viết hàm; `tuoi = (now - Date.parse(luc)) / MS_NGAY`, `trongKy: tuoi <= ngayDem`, `quaHan: tuoi > ngayCoCho`.
- [ ] Chạy lại → xanh. Phá-thử: đổi `<=` thành `<` → ô biên 30 đỏ với «bien 30 ngay lech dong tong ket»; đếm null vào soPhong → «tin hieu khong phong ban bi dem la mot phong ban». Khôi phục.
- [ ] Commit.

### Task 2: Lệnh kéo về dùng hàm chung, máy chủ trả mã phòng ban

**Phục vụ:** E8c, E2 ô 6 · **independent:** false

**Files:**
- Modify: `scripts/tin-hieu/keo-ve.ts` (`tongKet`, `coChoSauGom` → gọi bản trong validation)
- Modify: `apps/api/src/tin-hieu/tin-hieu.service.ts` (`keoVe` thêm `phongBanId: h.phongBanId`)

- [ ] `tongKet(ds, moi, daCo, now, coCho)` = `demNguongSong(dongDemTuKeoVe(ds), now, coCho)` rồi định dạng đúng năm mẫu dòng cũ; `theoPhong` sắp `localeCompare(…, "vi")`.
- [ ] Chạy: `bun test scripts/tin-hieu/test/keo-ve.test.ts` → xanh, `git diff --stat scripts/tin-hieu/test/keo-ve.test.ts` rỗng.
- [ ] Chạy: `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/tin-hieu.spec.ts -t gth-keo-ve"` → xanh.
- [ ] Commit.

### Task 3: API `tinHieu.tatCa`

**Phục vụ:** E2, E2b, E3b · **independent:** false

**Files:**
- Modify: `apps/api/src/tin-hieu/tin-hieu.contracts.ts` — `dongTinHieuTatCa` = `dongTinHieuCuaToi` + `nguoiGui: {id, ten}|null` + `phongBan: {id, ten}|null`; `tinHieuTatCaOutput = {rows}`.
- Modify: `apps/api/src/tin-hieu/tin-hieu.service.ts` — `tatCa(nguoi)`: `laQuanTriWorkspace` sai → `ForbiddenException`; `findMany({orderBy:{guiLuc:"desc"}, select: {..., nguoiGui:{select:{id,name}}, phongBan:{select:{id,name}}}})`; log `{message:"tin-hieu.tat-ca", userId, so}`.
- Modify: `apps/api/src/tin-hieu/tin-hieu.router.ts` — `@Query({output, meta: restMeta("GET","/tin-hieu/tat-ca",TAG)})`.
- Regenerate: `cd apps/api && bun run trpc:generate` → `src/generated/server.ts`.
- Create: `apps/api/test/tin-hieu-tat-ca.spec.ts` — describe `mth-tat-ca`, `mth-khop-that`, `mth-khong-quyen` (theo `expected` của E2, E3b); gieo bằng `tinHieu.gui` thật; người D bị `db.user.delete` sau khi gửi; hai phòng ban trùng tên ở `mth-khop-that`; dọn theo tiền tố riêng `mth<id>`.

- [ ] Viết spec (ba describe, ma trận bốn vai, đối chứng dương owner, quét chuỗi tên/thư > 0).
- [ ] Chạy `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/tin-hieu-tat-ca.spec.ts"` → đỏ.
- [ ] Viết contracts/service/router, `trpc:generate`.
- [ ] Chạy lại → xanh; `bun run test -- "cd apps/api && bun test test/vai-chi-okr.spec.ts"` → xanh (sửa danh sách nếu spec đòi khai tên thủ tục).
- [ ] Phá-thử: bỏ câu kiểm vai → «thanh vien doc duoc moi tin hieu»; thêm `email` vào select → «phan hoi mang thu dien tu nguoi gui»; bỏ `phongBanId` ở keoVe → «keo ve va danh sach dem phong ban khac nhau». Khôi phục.
- [ ] Commit.

### Task 4: Ghép dữ liệu thẻ Tất cả ở phía trang + ca khớp hai chiều

**Phục vụ:** E4, E8b · **independent:** false

**Files:**
- Modify: `apps/app/lib/tin-hieu/trang-thai.ts` — `docTrangThaiDu(html, ds, m)` trả `{banVe, trangThai: Record<ma, TrangThaiTinHieu & {khoa}>}`; `docTrangThaiTinHieu` gọi nó rồi bỏ `khoa` (đầu ra cũ giữ nguyên).
- Create: `apps/app/lib/tin-hieu/tat-ca.ts` — `ghepTatCa({rows, html, now, m}) → { dong: DongTatCa[]; banVeDocDuoc: boolean; baSo: BaSo }` (thuần, không `fs`); `baSo.chuaCoCho = banVe === "co" ? n : null`.
- Create: `apps/app/test/tin-hieu-tat-ca.spec.ts` — describe `ghep` (E4) trên `test/fixtures/tin-hieu/LO-TRINH.mau.html` + `nguon.json`.
- Create: `scripts/tin-hieu/test/nguong-song-khop.test.ts` — máy chủ giả đúng vỏ REST (`bocPhanHoiKeoVe`), `chayKeoVe` thật trong kho tạm có `LO-TRINH.mau.html`, cùng hàng qua `ghepTatCa`; ba bộ bằng nhau + bộ không bản vẽ khai chênh lệch.

- [ ] Viết hai test → đỏ. Viết mã → xanh: `cd apps/app && bun test ./test/tin-hieu-tat-ca.spec.ts`, `bun test scripts/tin-hieu/test/nguong-song-khop.test.ts`, `cd apps/app && bun test ./test/tin-hieu-trang-thai.spec.ts` (LT2 vẫn xanh).
- [ ] Phá-thử: lệnh bỏ qua `phongBanId` → «trang va lenh keo ve dem khac nhau»; ghép tự suy nhãn bỏ bản vẽ → «trang thai the Tat ca lech the Cua toi». Khôi phục.
- [ ] Commit.

### Task 5: Hai trang và thanh thẻ

**Phục vụ:** E1, E3, E10, AC-11 · **independent:** false

**Files:**
- Create: `apps/app/app/(app)/[slug]/tin-hieu/tat-ca/page.tsx` — `PageShell` + tiêu đề `m.tatCa` + `ThanhTheTinHieu` ngoài `Suspense`; vai từ `getServerTrpcClient().workspace.get.query()`; không quản trị → `KhongQuyenTatCa` (không gọi `tatCa`); quản trị → `Suspense fallback={<KhungChoTatCa/>}` › `NoiDung` (prefetch `tatCa`, `docTepLoTrinh` dưới `"use cache"`, `ghepTatCa`) › `HydrateClient` › `TatCaTrang`.
- Create: `apps/app/app/(app)/[slug]/tin-hieu/tat-ca/tat-ca-trang.tsx` — client: `useQuery(tatCa)`; lỗi → `VungTaiLoi` (Thử lại = `refetch`); có dữ liệu → `BaSoTinHieu` + `BangTatCa` (dòng dựng từ `data.rows` + bản đồ trạng thái từ server).
- Create: `apps/app/app/(app)/[slug]/tin-hieu/tat-ca/khung-cho.tsx` — `KhungChoTatCa` (chuyển từ proto).
- Modify: `apps/app/app/(app)/[slug]/tin-hieu/page.tsx` — đọc vai, thêm `ThanhTheTinHieu the="cua-toi"` dưới đầu trang.
- Modify: `apps/app/lib/trpc/cache.ts` — `tinHieu` làm mới cả `tatCa`.
- Modify: `apps/app/app/proto/_modules/moi-tin-hieu-cho-quan-tri/index.tsx` — dùng `KhungChoTatCa` thật.

- [ ] `cd apps/app && bunx tsc --noEmit -p .` sạch.
- [ ] Commit.

### Task 6: Bài màn (DOM)

**Phục vụ:** E1, E4b, E5, E6, E7, E9, E10 · **independent:** false

**Files:**
- Create: `apps/app/test/tin-hieu-tat-ca.dom.tsx` — describe `the-con`, `dong`, `thieu`, `loc` (`NuqsTestingAdapter` với `searchParams` khởi đầu), `ba-so`, `hop-bao-truoc`, `trang-thai-man`, mock `@/lib/trpc/client` như `tin-hieu.dom.tsx`.

- [ ] Viết, chạy từng describe: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tin-hieu-tat-ca.dom.tsx -t <ten>` → xanh.
- [ ] Phá-thử từng chiều đỏ đã khai trong evals (bỏ điều kiện vai, aria-current kép, bỏ translate=no, null người gửi thành rỗng, bỏ lọc trạng thái, giữ page khi đổi lọc, ba số theo dòng lọc, in 0 khi thiếu bản vẽ, bỏ câu báo trước, null lúc tải). Khôi phục.
- [ ] `gth_hop`, `gth_trang`, `gth_khoan_dung` của LT2 vẫn xanh.
- [ ] Commit.

### Task 7: Lệnh đo, răng màn thật, tài liệu

**Phục vụ:** E3, E10b, E11, E12, E13 · **independent:** false

**Files:**
- Modify: `_acceptance/config.yaml` — `executors.test.mth_*` (the_con, api, dong, thieu, loc, ba_so, dem, hop, trang_thai_man, ghep) và `executors.script.mth_*` (khop, do_man, ban_dung, thiet_ke).
- Create: `_acceptance/moi-tin-hieu-cho-quan-tri/rang/sinh-mau.mjs` (gieo qua `tinHieu.gui` của ba người ở hai phòng ban + một người không phòng ban), `rang/do-man.mjs` (E3 + E10b, chạy qua `_acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh` như LT2), `rang/ban-dung.mjs` (E11, theo khuôn LT2).
- Modify: `docs/api.md` mục Tín hiệu — `tatCa` chỉ owner/admin; ngoại lệ «lọc ở trình duyệt» có tên + điều kiện mở lại; `keoVe` trả thêm `phongBanId`.

- [ ] Chạy từng lệnh `mth_*` qua `config:` (đúng chuỗi trong config) → xanh; `mth_ban_dung` qua khoá máy.
- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop` xanh.
- [ ] Commit; contract `status: implemented`.
