# Lộ trình nhiều sản phẩm Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chủ kho chọn một sản phẩm trên trang Lộ trình và đọc lộ trình của nó như CRM; quản trị khai sản phẩm và người xem ở Cài đặt › Sản phẩm; tác nhân lấy `LO-TRINH.html` của từng kho bằng ứng dụng GitHub chỉ đọc.

**Architecture:** Bảng `SanPhamLoTrinh` + `SanPhamNguoiXem`; bản chụp dùng chung `BanChupLoTrinh` (`nguon = ma`). API (`apps/api/src/lo-trinh`) chỉ giữ danh bạ và quyền; tác nhân (`apps/agent`) gọi GitHub trên nhịp điều phối mỗi phút, mỗi sản phẩm mỗi 5 phút. Trang Lộ trình đọc danh bạ và bản chụp thẳng từ `@crm/db` qua một hàm quyền duy nhất.

**Tech Stack:** Bun, Prisma 7, Nest + nestjs-trpc, eve (agent), Next (cacheComponents), nuqs, Zod, `@crm/ui`.

**Spec:** `docs/superpowers/specs/2026-10-20-lo-trinh-nhieu-san-pham-design.md` · hợp đồng `_acceptance/lo-trinh-nhieu-san-pham/contract.md` · bộ đo `_acceptance/lo-trinh-nhieu-san-pham/evals.yaml` (mọi `describe` và thông điệp ghim lấy nguyên văn từ đó).

## Global Constraints

- Không chú thích trong code (`AGENTS.md`). Không `Record<string, unknown>` — phân tích ở biên bằng Zod, kiểu bằng `z.infer`.
- Hằng tinh chỉnh được ở MỘT chỗ: `LO_TRINH_SAN_PHAM` trong `packages/validation/src/san-pham-lo-trinh.ts` — `nhipKiemMs: 5 * MINUTE_MS`, `toiDaMoiNhip: 10`, `tranTepByte: BAN_CHUP_LO_TRINH.tranThanByte` (2 MB), `hanNhipMs: 40_000`, `tranGoiMs: 10_000`, `jwtSongGiay: 540`, `nguonCrm: "crm"`.
- Trạng thái lấy (danh sách đóng): `chua-lay` · `da-lay` · `chua-cau-hinh` · `chua-cai` · `khong-thay-kho` · `khong-thay-tep` · `khoi-hong` · `qua-tran` · `loi-github`; nghĩa màu qua `toneTheoNghia` (`da-lay` xong · `chua-lay` dangChay · `chua-cau-hinh`, `chua-cai` cho · còn lại hong).
- Biến mới chỉ tác nhân đọc: `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`; `GITHUB_API_URL` chỉ ghi đè khi `NODE_ENV !== "production"`. Khai ở `.env.example`. Thiếu biến → `chua-cau-hinh`, không ném.
- Token cài đặt xin đúng `{ repositories: [<tên kho>], permissions: { contents: "read", metadata: "read" } }`; JWT `exp - iat <= 600`.
- Quyết định đã chốt ở Cổng Phạm vi (sổ `d-20261019T223100Z-17`): quyền xem theo danh sách người, chủ và quản trị luôn thấy · Xoá khi `layDauLuc` null, còn lại Lưu trữ → Khôi phục → Xoá vĩnh viễn · sửa nguồn đặt `nguonDoiLuc`, giữ bản cũ, lần lấy đầu sau đó thay hẳn · CRM giữ đường Actions.
- UI chỉ dùng `@crm/ui` (subpath), không `className` đổi màu/góc; chữ ở `apps/app/lib/messages/*`; dữ liệu người nhập mang `translate="no"`.
- Năm lệnh chứng ở gốc: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`. Bài chạm DB đi qua `bun run test -- "<lệnh>"`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture (xanh trên vật lành, đỏ với thông điệp ghim khi phá bản sao) — thiếu cặp thì task chưa xong.

## Review Focus

1. Tên kho có chữ hoa hay khoảng trắng thừa (`Phanlemanh/Acceptance-Gate-Kit `) — máy cắt khoảng trắng và giữ hoa thường như GitHub trả; hai sản phẩm trỏ cùng kho vẫn hợp lệ (mã khác nhau). Bài ở Task 1.
2. Tên sản phẩm sinh mã trùng (`Kit nghiệm thu` lần hai) hay sinh mã rỗng (`!!!`) — từ chối với lời ở ô Tên. Bài ở Task 2.
3. Người được cấp rời không gian làm việc — dòng `SanPhamNguoiXem` xoá theo (`onDelete: Cascade` từ `User`), hàm quyền không trả sản phẩm cho người không còn là thành viên. Bài ở Task 2.
4. Hai nhịp chạy chồng (hai lượt cron cùng phút) — cùng sha thì `trung`, không ghi hai lần, không đổi `layDauLuc`. Bài ở Task 3.
5. Đường dẫn `?san-pham=` lặp tham số hay viết hoa (`KIT`) — rơi về CRM, không màn lỗi. Bài ở Task 4.

---

### Task 1: Khuôn, bảng và lớp dữ liệu sản phẩm

Phục vụ: nền của E1–E18. `independent: false` (mọi task sau dùng).

**Files:**
- Create: `packages/validation/src/san-pham-lo-trinh.ts`, `packages/validation/src/doc-du-lieu-lo-trinh.js`, `packages/validation/test/san-pham-lo-trinh.spec.ts`
- Modify: `packages/validation/package.json` (exports `./san-pham-lo-trinh`, `./doc-du-lieu-lo-trinh`), `apps/app/lib/lo-trinh/doc-du-lieu.js` (chỉ còn `export { docDuLieu } from "@crm/validation/doc-du-lieu-lo-trinh"`), `scripts/ban-chup-lo-trinh/day.ts` (import tương đối `../../packages/validation/src/doc-du-lieu-lo-trinh.js`)
- Create: `packages/db/prisma/migrations/20261020090000_san_pham_lo_trinh/migration.sql`, `packages/db/src/san-pham-lo-trinh.ts`
- Modify: `packages/db/prisma/schema.prisma`, `packages/db/package.json` (export `./san-pham-lo-trinh`), `packages/db/src/ban-chup-lo-trinh.ts`

**Interfaces — Produces:**
- `LO_TRINH_SAN_PHAM` (Global Constraints), `TRANG_THAI_LAY` (tuple), `type TrangThaiLay`, `NGHIA_TRANG_THAI_LAY: Record<TrangThaiLay, NghiaTrangThai>` (`as const satisfies`), `sanPhamKhai = z.object({ ten, kho, nhanh, duongTep })` (luật ô ở design «Hành vi»), `maTuTen(ten: string): string` (bỏ dấu, kebab, ≤40, rỗng → `""`), `docDuLieu(html)` và `PHIEN_BAN_DOC = 2` xuất từ `doc-du-lieu-lo-trinh.js`.
- Prisma: `SanPhamLoTrinh { ma @id, ten, kho, nhanh, duongTep, trangThaiLay String @default("chua-lay"), chiTietLay String?, kiemLuc DateTime?, layDauLuc DateTime?, caiLuc DateTime?, nguonDoiLuc DateTime?, phienBanKhuon Int?, luuTruLuc DateTime?, taoBoiId → User, taoLuc, doiLuc @updatedAt, nguoiXem SanPhamNguoiXem[] }`, `SanPhamNguoiXem { sanPhamMa → SanPhamLoTrinh (Cascade), userId → User (Cascade), @@id([sanPhamMa, userId]) }`. Migration xếp sau `20261016120000_du_an_gantt`.
- `@crm/db/san-pham-lo-trinh`: `taoSanPham(db, vao: SanPhamKhai & { taoBoiId }) → SanPhamLoTrinh`, `suaSanPham(db, ma, vao: Partial<SanPhamKhai>) → { nguonDoi: boolean }` (đổi kho/nhánh/tệp → `nguonDoiLuc = now`, `trangThaiLay = "chua-lay"`), `datNguoiXem(db, ma, userIds: string[])`, `sanPhamXemDuoc(db, { userId, vai }) → { ma, ten, kho, nhanh }[]` (chưa lưu trữ; owner/admin → tất cả; member/okr → chỉ có dòng người xem và còn là thành viên), `luuTruSanPham`, `khoiPhucSanPham`, `xoaSanPham` (chỉ khi `layDauLuc` null, trong `$transaction`), `xoaVinhVienSanPham` (chỉ khi `luuTruLuc` khác null; xoá cả `BanChupLoTrinh` `nguon = ma`), `sanPhamDenHan(db, now) → SanPhamLoTrinh[]` (chưa lưu trữ, `kiemLuc` null hoặc cũ hơn `nhipKiemMs`, `take: toiDaMoiNhip`, `orderBy kiemLuc asc nulls first`), `ghiKetQuaLay(db, ma, kq: { trangThai, chiTiet?, kiemLuc, caiLuc?, phienBanKhuon?, layLuc? })` (đặt `layDauLuc` khi null và `trangThai = "da-lay"`).
- `ghiBanChupLoTrinh(db, vao, now, { thayHan?: boolean })`: `thayHan` ghi đè không điều kiện (upsert) — dùng đúng một lần sau `nguonDoiLuc`.

- [ ] **Step 1:** Viết `packages/validation/test/san-pham-lo-trinh.spec.ts`: ma trận khai sai của E8 dòng 2 (kho `khong-co-gach`, `a/b/c`; nhánh `""`, `co khoang`; tệp `../x.html`, `/x.html`; tên `""`, 61 ký tự) → `safeParse` hỏng với `path` đúng ô; `maTuTen("Kit nghiệm thu") === "kit-nghiem-thu"`, `maTuTen("!!!") === ""`; khoảng trắng hai đầu kho bị cắt (Review Focus 1); `NGHIA_TRANG_THAI_LAY` có đủ mọi phần tử `TRANG_THAI_LAY` (đếm bằng nhau); `docDuLieu` từ đường mới cho cùng kết quả với fixture `apps/app/test` hiện có.
- [ ] **Step 2:** Chạy `cd packages/validation && bun test test/san-pham-lo-trinh.spec.ts` → FAIL (module chưa có).
- [ ] **Step 3:** Viết khuôn, dời `doc-du-lieu.js` (nội dung y nguyên, thêm `export const PHIEN_BAN_DOC = 2` và dùng nó), re-export ở đường cũ, sửa import của `day.ts`.
- [ ] **Step 4:** Thêm hai model + migration tay (`bunx prisma migrate dev --create-only --name san_pham_lo_trinh` rồi đổi tên thư mục đúng mốc), `cd packages/db && bun run db:generate`; viết `san-pham-lo-trinh.ts` và tham số `thayHan`.
- [ ] **Step 5:** `cd packages/validation && bun test` PASS; `bun test scripts/ban-chup-lo-trinh/test` PASS (đường đẩy CRM không đổi); `bun run check-types` PASS.
- [ ] **Step 6:** Commit `LT3 · khuôn và bảng sản phẩm lộ trình`.

### Task 2: Thủ tục danh bạ sản phẩm ở API

Phục vụ: E6 (`ltsp-quyen`), E8 (`ltsp-danh-ba`), E10 phần API (`ltsp-vong-doi`). `independent: true` (sau Task 1; khác tệp với Task 3, 4).

**Files:**
- Create: `apps/api/src/lo-trinh/san-pham.contracts.ts`, `san-pham.service.ts`, `san-pham.router.ts`, `apps/api/test/san-pham-lo-trinh.spec.ts`
- Modify: `apps/api/src/lo-trinh/lo-trinh.module.ts` (providers), `apps/api/src/generated/server.ts` (qua `bun run trpc:generate` trong `apps/api`), `docs/api.md` (mục «Bản chụp lộ trình» thêm «Danh bạ sản phẩm»)

**Interfaces:**
- Consumes: Task 1 `@crm/db/san-pham-lo-trinh`, `sanPhamKhai`.
- Produces: router `@Router({ alias: "sanPhamLoTrinh" })`, session `AuthedTrpcContext`. Query `danhSach() → { quanTri: boolean, sanPham: SanPhamHang[] }` (quản trị thấy mọi hàng chưa lưu trữ kèm trạng thái; người khác chỉ hàng `sanPhamXemDuoc`); Query `daLuuTru() → SanPhamHang[]` (chỉ quản trị); Query `nguoiXem({ ma }) → { userId, ten, vai, chon }[]`; Mutation `tao(SanPhamKhai) → { ma }`, `sua({ ma, ...Partial<SanPhamKhai> })`, `datNguoiXem({ ma, userIds })`, `luuTru({ ma })`, `khoiPhuc({ ma })`, `xoa({ ma })`, `xoaVinhVien({ ma })`. `SanPhamHang = { ma, ten, kho, nhanh, duongTep, trangThaiLay, chiTietLay, layLuc, phienBanKhuon, coLichSu }` (Zod output ở contracts). Quyền: `canManageSettings(await workspaceRoleOf(userId))`, sai → `ForbiddenException`; `ma === "crm"` hay mã sinh rỗng/trùng → `BadRequestException` với `path` ô `ten`.

- [ ] **Step 1:** Viết `apps/api/test/san-pham-lo-trinh.spec.ts` theo khuôn `giai-doan-quyen.spec.ts` (`gieoThanhVien`, `mintPhien`, tiền tố `ltsp-${TEST_RUN_ID}`): `describe("ltsp-quyen")` = E6 dòng 1–3 + đối chứng bỏ cấp + người rời không gian (Review Focus 3); `describe("ltsp-danh-ba")` = E8 dòng 1–4 + mã trùng/rỗng (Review Focus 2); `describe("ltsp-vong-doi")` = E10 dòng 1–3. Thông điệp ghim chiều đỏ lấy nguyên văn E6, E8, E10.
- [ ] **Step 2:** `bun run test -- "cd apps/api && bun test test/san-pham-lo-trinh.spec.ts"` → FAIL.
- [ ] **Step 3:** Viết contracts, service, router; đăng ký ở module; `cd apps/api && bun run trpc:generate`.
- [ ] **Step 4:** Lệnh Step 2 → PASS. Phá-thử trên bản sao (thư mục tạm): ba ca chiều đỏ của E6, E8, E10 đỏ đúng thông điệp.
- [ ] **Step 5:** Commit `LT3 · thủ tục danh bạ sản phẩm`.

### Task 3: Tác nhân lấy lộ trình bằng ứng dụng GitHub

Phục vụ: E1, E3, E4, E10 phần tác nhân, E12 phần tác nhân, E16. `independent: true` (sau Task 1).

**Files:**
- Create: `scripts/lo-trinh-san-pham/github-gia.ts`, `apps/agent/agent/lib/lo-trinh-github.ts`, `apps/agent/agent/lib/lo-trinh-san-pham.ts`, `apps/agent/test/lo-trinh-san-pham.spec.ts`, `apps/agent/test/mau/lo-trinh-kit.html` (chép từ `~/dev/acceptance-gate-kit/LO-TRINH.html` lúc viết bài)
- Modify: `apps/agent/agent/schedules/dispatch.ts` (thêm `layLoTrinhSanPham()` vào `Promise.all`), `apps/agent/agent/lib/capabilities.ts` (năng lực `GITHUB_APP_ID + GITHUB_APP_PRIVATE_KEY`, nhãn "Product roadmaps"), `.env.example` (khối sau `CRM_KHOA_DAY_LO_TRINH`, theo khuôn khối Google Sheets), `docs/agent.md` (mục «Lấy lộ trình sản phẩm» cạnh «Chụp số OKR mỗi ngày»)

**Interfaces:**
- Consumes: Task 1 `sanPhamDenHan`, `ghiKetQuaLay`, `ghiBanChupLoTrinh(…, { thayHan })`, `docBanChupLoTrinh`, `docDuLieu`, `phanTichLoTrinh`, `LO_TRINH_SAN_PHAM`.
- Produces:
  - `githubGia(opts: { html: (sha) => string | null, dauNhanh: { sha, commitLuc }, caiLuc, khoaCongKhai, loi?: Partial<Record<"installation"|"branches"|"contents"|"access_tokens", number>>, gioiHan?: boolean }) → { url, goi: { duong, than, xacThuc }[], dung() }` — năm đường REST thật: `GET /repos/{o}/{r}/installation` (`{ id, created_at }`, 404 khi chưa cài), `POST /app/installations/{id}/access_tokens` (`{ token, expires_at }`, kiểm JWT RS256 bằng khoá công khai), `GET /repos/{o}/{r}/branches/{b}` (`{ commit: { sha, commit: { committer: { date } } } }`), `GET /repos/{o}/{r}/contents/{p}?ref=` với `Accept: application/vnd.github.raw`; 403 + `x-ratelimit-remaining: 0` khi `gioiHan`.
  - `cauHinhGithubApp() → { appId, khoa, apiUrl } | null`; `kyJwtUngDung(cauHinh, now) → string`; `layLoTrinhTuGithub(cauHinh, sp, banChupSha, now, f = fetch) → KetQuaLay` với `KetQuaLay = { trangThai: TrangThaiLay, chiTiet?: string, caiLuc?: Date, banChup?: GhiBanChup, phienBan?: number }`.
  - `layLoTrinhSanPham(now = new Date(), phuThuoc: { f?: typeof fetch, dongHo?: () => number } = {}) → { lay: number, hong: number, boQua: number }` — lỗi một sản phẩm bắt trong vòng, ghi `[lo-trinh-san-pham] <ma> <trangThai>` (không token, không khoá); vượt `hanNhipMs` thì `boQua`.

- [ ] **Step 1:** Viết `apps/agent/test/lo-trinh-san-pham.spec.ts` dùng `githubGia` + cặp khoá sinh trong bài (`generateKeyPairSync("rsa")`), env đặt/khôi phục quanh mỗi bài như `datBienSheets`: `describe("ltsp-lay-dau")` E1; `describe("ltsp-nhip")` E3 + hai nhịp chồng cùng sha (Review Focus 4); `describe("ltsp-hong")` E4 (9 ô); `describe("ltsp-vong-doi")` E10 dòng 4; `describe("ltsp-khuon")` E12 phần tác nhân; `describe("ltsp-khoa")` E16; thêm ca Hỏi-3: nguồn đổi + commit mới cũ hơn → thay hẳn, nhịp sau lại một chiều (E8 dòng 3 phần tác nhân).
- [ ] **Step 2:** `bun run test -- "cd apps/agent && bun test test/lo-trinh-san-pham.spec.ts"` → FAIL.
- [ ] **Step 3:** Viết `github-gia.ts`, `lo-trinh-github.ts` (JWT ký bằng `node:crypto` `createSign("RSA-SHA256")` — khoá GitHub là PKCS#1), `lo-trinh-san-pham.ts`; nối `dispatch.ts`, `capabilities.ts`, `.env.example`.
- [ ] **Step 4:** Lệnh Step 2 → PASS; phá-thử sáu chiều đỏ (E1, E3, E4, E10, E12, E16) đỏ đúng thông điệp ghim.
- [ ] **Step 5:** Commit `LT3 · tác nhân lấy lộ trình qua ứng dụng GitHub`.

### Task 4: Trang Lộ trình đọc theo sản phẩm

Phục vụ: E2, E5 dòng 2–3, E7, E12 phần trang. `independent: true` (sau Task 1).

**Files:**
- Create: `apps/app/lib/lo-trinh/san-pham.ts`, `apps/app/app/(app)/[slug]/lo-trinh/lo-trinh-search-params.ts`, `apps/app/components/lo-trinh/bo-chon-san-pham.tsx`, `apps/app/components/lo-trinh/dong-nguon-san-pham.tsx`, `apps/app/test/lo-trinh-san-pham.spec.ts`, `apps/app/test/lo-trinh-san-pham.dom.tsx`, `apps/app/test/lo-trinh-san-pham-mau.ts`
- Modify: `apps/app/app/(app)/[slug]/lo-trinh/page.tsx` (nhận `searchParams`, `createLoader`), `apps/app/lib/search-param-keys.ts` (`SEARCH_PARAM.loTrinh.sanPham = "sanPham"`), `apps/app/lib/lo-trinh/doc-trang.ts`, `apps/app/lib/lo-trinh/cau-hinh.ts` (`timPr(ma, kho?)` thêm `repo:<kho>`), `apps/app/components/lo-trinh/noi-dung.tsx`, `apps/app/components/lo-trinh/so-lieu-lam-viec.tsx`, `apps/app/lib/messages/lo-trinh.ts` (khối `sanPham`: `chon`, `layTu(kho, nhanh, gio)`, `layHong(lyDo)`, `nguonDoi`, `khuonCu(ten, n)`, `khuonMoi(ten, n)`, `chuaCoTieuDe(ten)`, `moCaiDat`, `trangThai: Record<TrangThaiLay, string>` — chữ đúng bản mẫu `apps/app/app/proto/_modules/lo-trinh-nhieu-san-pham/index.tsx`)

**Interfaces:**
- Consumes: Task 1 `sanPhamXemDuoc`, `docBanChupLoTrinh`, `NGHIA_TRANG_THAI_LAY`, `PHIEN_BAN_DOC`.
- Produces: `chonSanPham(thayDuoc: { ma: string }[], thamSo: string | null) → string` (`"crm"` khi vắng, sai, không thấy, chữ hoa); `docDauVaoSanPham(sp: SanPhamDoc, vai, deps) → DauVaoSanPham` với `DauVaoSanPham = { kieu: "chua-co", trangThai, quanTri } | (DauVaoLoTrinh & { sanPham: { ten, kho, nhanh }, layHong: TrangThaiLay | null, nguonDoi: boolean, khuon: { phienBan: number, cu: boolean } | null })`; đi qua `choVaiXem` như CRM. `data-*` trên màn: `data-lo-trinh-bo-chon`, `data-lo-trinh-gio-lay`, `data-lo-trinh-lay-hong`, `data-lo-trinh-nguon-doi`, `data-lo-trinh-khuon`, `data-lo-trinh-san-pham-trong`.

- [ ] **Step 1:** Viết `lo-trinh-san-pham.spec.ts` (`describe("ltsp-quyen-trang")` E7 phần hàm + Review Focus 5) và `lo-trinh-san-pham.dom.tsx` (`ltsp-doc-du` E2, `ltsp-quyen-trang` E7 dòng 2, `ltsp-khuon` E12 phần trang, và E5 dòng 2–3 với `describe("ltsp-cau-trang-thai")` phần trang). Khối mẫu rút bằng code từ `apps/agent/test/mau/lo-trinh-kit.html` (`lo-trinh-san-pham-mau.ts`), không viết tay.
- [ ] **Step 2:** Chạy hai lệnh `ltsp_doc_du`, `ltsp_quyen_trang` của `_acceptance/config.yaml` → FAIL.
- [ ] **Step 3:** Viết `san-pham.ts`, search params, bộ chọn (`Select` trong `PageShellActions`, chỉ khi `thayDuoc.length >= 2`, đổi giá trị ghi `sanPham` bằng `useQueryState`, bỏ `viec`/lọc mốc), dòng nguồn; sửa `page.tsx` (danh bạ đọc trong `NoiDung` sau `requireSession`, không `"use cache"` cho phần phụ thuộc người xem).
- [ ] **Step 4:** Lệnh Step 2 PASS; bộ cũ `ltc_*`, `ltmh_*`, `ldbc_*` của config vẫn PASS (CRM không đổi); phá-thử chiều đỏ E2, E7, E12.
- [ ] **Step 5:** Commit `LT3 · trang Lộ trình chọn sản phẩm`.

### Task 5: Cài đặt › Sản phẩm

Phục vụ: E5 dòng 1, E9, E11, E12 phần Cài đặt. `independent: false` (cần kiểu tRPC của Task 2).

**Files:**
- Create: `apps/app/app/(app)/[slug]/settings/san-pham/page.tsx`, `san-pham-settings.tsx`, `sheet-san-pham.tsx`, `sheet-nguoi-xem.tsx`, `san-pham-search-params.ts`, `apps/app/lib/messages/san-pham.ts`, `apps/app/test/san-pham-lo-trinh.dom.tsx`
- Modify: `apps/app/lib/cai-dat-dieu-huong.ts` (`{ khoa: "sanPham", href: "/settings/san-pham" }` cuối nhóm `ketNoiDuLieu`), `apps/app/lib/messages/settings.ts` (`thanhBen.sanPham`, `tieuDeTab.sanPham` en+vi), thư viện `ten-man` (tên màn), `apps/app/lib/trpc/cache.ts` (`sanPhamLoTrinh()`), `apps/app/lib/search-param-keys.ts` (`SEARCH_PARAM.sanPham = { sua: "suaSanPham", nguoiXem: "nguoiXemSanPham" }`), `docs/settings.md` (bảng nhóm thanh bên)

**Interfaces:**
- Consumes: Task 2 `trpc.sanPhamLoTrinh.*`; Task 1 `sanPhamKhai`, `NGHIA_TRANG_THAI_LAY`, `TRANG_THAI_LAY`.
- Produces: màn theo bản mẫu đã duyệt — `PageShell width="page"`, nút chính «Thêm sản phẩm», `PageShellNote id="san-pham-chi-doc"` khi không quản trị, `Card` + `Item` (CRM đứng đầu, nhãn «khai trong mã», không menu), `StatusIndicator` `data-san-pham-trang-thai`, ô `data-san-pham-khuon`, menu «…» (Sửa · Người xem · Xoá hoặc Lưu trữ theo `coLichSu`), `ArchivedList` `purgeable: true` với `ConfirmDialog` nêu bản chụp mất theo, toast Lưu trữ có «Hoàn tác» (khuôn `giai-doan-settings.tsx`), Sheet bốn ô kiểm bằng `sanPhamKhai` (Lưu tắt tới khi hợp lệ, `FieldError` dưới ô), Sheet người xem (chủ, quản trị khoá «luôn thấy»).

- [ ] **Step 1:** Viết `san-pham-lo-trinh.dom.tsx`: `ltsp-cau-trang-thai` (E5 dòng 1), `ltsp-danh-ba-trang` (E9 dòng 1–4), `ltsp-vong-doi-trang` (E11), `ltsp-khuon` (E12 phần Cài đặt) — tRPC giả ở biên client.
- [ ] **Step 2:** Lệnh `ltsp_danh_ba_trang`, `ltsp_vong_doi_trang`, `ltsp_cau_trang_thai` → FAIL.
- [ ] **Step 3:** Viết trang và hai Sheet; nối thanh bên, tên màn, cache, chữ.
- [ ] **Step 4:** Ba lệnh Step 2 PASS; `cd apps/app && bun test test/cai-dat-dieu-huong.spec.ts test/ten-man.spec.ts test/pham-vi-man.spec.ts` PASS (người chỉ OKR vẫn chỉ thấy Khoá API); phá-thử chiều đỏ E5, E9, E11.
- [ ] **Step 5:** Commit `LT3 · Cài đặt › Sản phẩm`.

### Task 6: Đường đo, quét khoá, đo màn thật, tài liệu

Phục vụ: E13, E14, E15, E17, E18. `independent: false` (đo trên Task 3–5).

**Files:**
- Create: `scripts/lo-trinh-san-pham/do.ts`, `scripts/lo-trinh-san-pham/test/do.spec.ts`, `scripts/lo-trinh-san-pham/github-gia-chay.ts` (bật GitHub giả trên cổng tự do cho dev và đo màn, in `GITHUB_API_URL`), `_acceptance/lo-trinh-nhieu-san-pham/rang/quet-khoa.mjs`, `_acceptance/lo-trinh-nhieu-san-pham/rang/do-man.mjs`
- Modify: `package.json` gốc (`"lo-trinh:do-san-pham": "bun scripts/lo-trinh-san-pham/do.ts"`), `CONTEXT.md` (thêm mục **Sản phẩm** — chỉ thêm dòng, luật 7 của đợt), `docs/production.md` (mục «Ra khỏi kho»: tạo ứng dụng GitHub quyền `contents: read` + `metadata: read`, không webhook; đặt hai biến trên `crm-onehub-agent`; cài vào kho kit; khai sản phẩm), `docs/api.md`

**Interfaces:**
- Consumes: Task 1 `@crm/db/san-pham-lo-trinh`; Task 3 `githubGia`, `layLoTrinhSanPham`; màn của Task 4, 5.
- Produces: `do.ts` in mỗi sản phẩm `ma · khai <ISO> · cai <ISO|-> · ban-chup-dau <ISO|-> · do-tre <phút|-> [qua-mot-ngay] [chua-co-ban-chup]` và dòng `KET LUAN: dat|khong dat`; DB không đọc được → exit 2, không in «dat». `do-man.mjs` theo khuôn `_acceptance/trang-lo-trinh-mo-hinh-hien-thi/rang/do-man.mjs` (tien-de.mjs, kho `_do` riêng), tự bật GitHub giả, khai «kit» bằng bấm thật ở Cài đặt, gọi một nhịp `layLoTrinhSanPham` thật, chạy ma trận 8 ô × 2 màn của E13 và các dòng `[AC-1]` của E14.

- [ ] **Step 1:** Viết `do.spec.ts` (`describe("ltsp-do")` E18 dòng 1–3) → `bun run test -- "bun test scripts/lo-trinh-san-pham/test/do.spec.ts"` FAIL.
- [ ] **Step 2:** Viết `do.ts`, thêm script gốc → PASS; phá-thử chiều đỏ E18.
- [ ] **Step 3:** Viết `quet-khoa.mjs` → `bun _acceptance/lo-trinh-nhieu-san-pham/rang/quet-khoa.mjs` exit 0; bản sao tiêm `apps/api/src/x.ts` → exit 1 đúng thông điệp E17.
- [ ] **Step 4:** Viết `github-gia-chay.ts`, `do-man.mjs`; chạy `ltsp_do_man` → KET LUAN mã 0, 16 ảnh; chạy `ltsp_thiet_ke` → exit 0.
- [ ] **Step 5:** Tài liệu (`CONTEXT.md`, `docs/production.md`, `docs/api.md`); năm lệnh chứng ở gốc xanh; commit `LT3 · đường đo, quét khoá, đo màn`.

---

## Thứ tự

Task 1 → (Task 2 ∥ Task 3 ∥ Task 4) → Task 5 → Task 6 → đặt hợp đồng `implemented` → S4.
