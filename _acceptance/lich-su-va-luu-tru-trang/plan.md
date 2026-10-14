# Lịch sử và lưu trữ trang — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (phiên thợ làm tuần tự). Steps dùng `- [ ]`.

**Goal:** Trang Kho có lịch sử phiên bản, quay lại bản cũ qua đề xuất, lưu trữ và khôi phục qua đề xuất; trang đã lưu
trữ vắng ở mọi chỗ đọc; đề xuất đã duyệt hiện ở «Đã xử lý».

**Architecture:** Một cột `archivedAt` trên trang và cột `loai` trên đề xuất; mọi đề xuất mới đi `taoDeXuatTaiLieu` và
hàm `approve` rẽ theo `loai`. Lọc trang đã lưu trữ ở một hàm điều kiện của `packages/db/src/tai-lieu-tim.ts` để API và
trợ lý kho dùng chung. Màn: hai route mới dưới `[trang]/lich-su`, thêm vào màn đọc, màn duyệt, danh sách, Chờ duyệt.

**Tech Stack:** Prisma + Postgres, NestJS tRPC (`nestjs-trpc`), Next.js App Router, `@crm/ui`, `bun:test` + jsdom,
puppeteer-core cho bộ đo màn.

**Spec:** `design.md` · `contract.md` · `evals.yaml` (cùng thư mục).

## Global Constraints

- Không chú thích trong code (AGENTS.md). Hằng số tinh chỉnh trong `apps/api/src/tai-lieu/tai-lieu-config.ts`
  (`LY_DO` 1–500).
- Khuôn đầu vào và payload sự kiện ở `packages/validation/src/tai-lieu.ts`, parse ở biên.
- `migration` mốc giờ UTC thật lúc tạo; gộp sau DA1b/DA2 thì đổi mốc theo Notes của hợp đồng.
- `src/generated/server.ts` sinh bằng `bun run trpc:generate`, không vá tay.
- Tệp chung chỉ thêm dòng: `CONTEXT.md`, `_acceptance/config.yaml`, `apps/app/lib/messages/tai-lieu.ts` (thêm khoá),
  `vai-chi-okr.spec.ts` (thêm mẫu).
- Client component không nhập `@crm/db`, `@crm/auth`; trang server dựng dữ liệu xong mới trao.
- Bậc vẽ tay (`docs/design.md`): `SimpleTable`/`Item`, `StatusIndicator`, `Alert`, `Dialog` + `DialogClose`, `Field`,
  `ToggleGroup`, `DiffTrang`, `VungTaiLoi`, `Empty` — không dựng tay.

## Review Focus

- Trang đã lưu trữ mở bằng đường dẫn cũ, `[[…]]` hay ⌘K đã mở sẵn → màn đọc hiện dải, không 404 (Task 7).
- Hai người cùng duyệt lưu trữ và sửa nội dung một lúc → khoá hàng trang (`FOR UPDATE` như `propose`), một bên thua
  bằng «cũ» (Task 4).
- Phiên bản cũ có ký tự NFD hay khoảng trắng cuối dòng → quay lại so trùng sau NFC, không tạo đề xuất rỗng (Task 3).
- Người vai `okr` gọi thủ tục mới → theo đúng luật của `propose` (Task 4, mẫu ở `vai-chi-okr.spec.ts`).
- Lý do 500 ký tự tiếng Việt có dấu → đếm theo ký tự sau NFC, không theo byte (Task 4).

---

### Task 1: Lược đồ, `migration`, khuôn

independent: false · phục vụ mọi eval

**Files:** `packages/db/prisma/schema.prisma` · `packages/db/prisma/migrations/<UTC>_tai_lieu_luu_tru/migration.sql` ·
`packages/validation/src/tai-lieu.ts` · `packages/validation/test/tai-lieu.spec.ts` (thêm ca)

**Produces:** `TaiLieuTrang.archivedAt DateTime?` + `@@index([archivedAt])`; `TaiLieuDeXuat.loai String
@default("NOI_DUNG")`, `tuPhienBanSo Int?`, `lyDoDeXuat String?`; `LOAI_DE_XUAT = ["NOI_DUNG","LUU_TRU","KHOI_PHUC"]`;
`LOAI_SU_KIEN` thêm `LUU_TRU`, `KHOI_PHUC`, payload `{loai, deXuatId}`; khuôn nhập `lichSuInput {slug}`,
`phienBanInput {slug, so: int ≥ 1}`, `quayLaiInput {slug, so}`, `deXuatLuuTruInput {slug, lyDo 1–500 sau trim+NFC}`.

- [ ] Ca khuôn trước (đỏ): `so` âm, không nguyên, lý do rỗng, 501 ký tự bị từ chối; 500 ký tự có dấu nhận.
- [ ] Sửa schema, `bunx prisma migrate dev --create-only` trên kho test, đọc SQL, `bun run db:generate`.
- [ ] Khuôn và hằng; ca xanh; `bun run check-types`.
- [ ] Commit.

### Task 2: Lọc trang đã lưu trữ một chỗ

independent: false · phục vụ E7, E7a, E6 (một phần)

**Files:** `packages/db/src/tai-lieu-tim.ts` · `apps/api/src/tai-lieu/tai-lieu.service.ts` (`list`, `dangDung`, `get`) ·
`apps/api/src/tai-lieu/tai-lieu-tim.service.ts` (`tim`, `sucKhoe`, `nhacToi`, `boLoc`) · `apps/api/src/tai-lieu/tai-lieu.router.ts`
(`list` nhận `archived`) · `apps/api/test/tai-lieu-luu-tru-loc.spec.ts` · `apps/agent/test/tro-ly-kho-luu-tru.spec.ts`

**Produces:** `export const DIEU_KIEN_DANG_DUNG = { banDangDungId: { not: null }, archivedAt: null } as const` dùng ở
`docBanDangDung`, `docNhieuBanDangDung`, mọi `findMany` đọc trang đang dùng; SQL `timTrangDangDung` thêm
`AND t."archivedAt" IS NULL`; `list({archived})` qua `archivedFilter`; `get` trả `daLuuTru: { luc } | null`.

- [ ] Bài ma trận E7 trước (đỏ): A, B, mười chỗ đọc, hai mốc trước/sau lưu trữ; bài trợ lý E7a.
- [ ] Sửa; bài xanh; chạy lại toàn bộ `tai-lieu-*.spec.ts` có sẵn (không hồi quy).
- [ ] Phá-thử: bỏ điều kiện ở SQL tìm → E7 đỏ đúng dòng «tim»; hoàn lại. Commit trước khi phá.

### Task 3: Lịch sử, phiên bản, quay lại

independent: false · phục vụ E1, E2, E3

**Files:** `apps/api/src/tai-lieu/tai-lieu.service.ts` (`lichSu`, `phienBan`, `quayLai`) · router · `apps/api/test/tai-lieu-lich-su.spec.ts` ·
`packages/db/src/tai-lieu-de-xuat.ts` (`DeXuatMoi` thêm `loai?`, `tuPhienBanSo?`, `lyDoDeXuat?`)

**Produces:** `lichSu(nguoi, slug) → { so, ten, duyetLuc, nguoiDuyet, nguoiDeXuat, dangDung }[]`;
`phienBan(nguoi, slug, so) → { so, ten, noiDung, duyetLuc, laBanDangDung, dangDung: { so, noiDung } }`;
`quayLai(nguoi, slug, so) → { deXuatId }` (khoá hàng trang, từ chối `daLuuTru`, `chuaDoi`). Quyền đọc theo
`dieuKienThay`, `NOT_FOUND` như `get`.

- [ ] Ba bài E1–E3 trước (đỏ), gieo qua `create`/`propose`/`approve` thật.
- [ ] Viết thủ tục; xanh; phá-thử E3 (bỏ so NFC) → đỏ đúng ca; hoàn lại.
- [ ] Commit.

### Task 4: Đề xuất lưu trữ, khôi phục, nhánh duyệt, «Đã xử lý»

independent: false · phục vụ E4, E5, E6, E8

**Files:** `apps/api/src/tai-lieu/tai-lieu.service.ts` (`deXuatLuuTru`, `deXuatKhoiPhuc`, `approve` rẽ `loai`, `propose`
chặn `daLuuTru`, bộ lọc nhóm `da-xu-ly` thêm `DA_DUYET`) · router · `apps/api/src/tai-lieu/tai-lieu-config.ts` ·
`apps/api/test/tai-lieu-luu-tru.spec.ts` · `apps/api/test/vai-chi-okr.spec.ts` (thêm mẫu) · `apps/api/src/generated/server.ts`
(sinh lại)

**Produces:** `approve` với `LUU_TRU`: đặt `archivedAt` nếu đang null, đánh `CU` đề xuất `NOI_DUNG` đang chờ (mỗi đề
xuất một sự kiện `CU`), ghi `LUU_TRU`; `KHOI_PHUC`: `archivedAt = null`, ghi `KHOI_PHUC`; không tạo phiên bản cho hai
loại này.

- [ ] Bài E4, E5, E6, E8 trước (đỏ), ma trận người và ma trận từ chối viết trước.
- [ ] Viết; `bun run trpc:generate`; xanh; phá-thử E5 «giữ ngày đầu» → đỏ ghim; hoàn lại.
- [ ] Commit.

### Task 5: Nhật ký chỉ ghi thêm

independent: false · phục vụ E9

**Files:** `apps/api/test/tai-lieu-chi-ghi-them.spec.ts`

- [ ] Vế quét tĩnh (đối chứng dương chuỗi mẫu bị regex bắt) và vế chạy luồng với bảng sự kiện viết trước.
- [ ] Xanh trên mã Task 1–4; phá-thử: thêm tạm một `taiLieuPhienBan.update` vào một tệp bản sao → đỏ ghim tên tệp.
- [ ] Commit.

### Task 6: Màn Lịch sử và phiên bản cũ

independent: false · phục vụ E10m, E10

**Files:** `apps/app/app/(app)/[slug]/tai-lieu/[trang]/lich-su/page.tsx` · `.../lich-su/bang-lich-su.tsx` ·
`.../lich-su/[so]/page.tsx` · `.../lich-su/[so]/ban-cu.tsx` · `.../[trang]/man-doc.tsx` (nút «Lịch sử») ·
`apps/app/lib/tai-lieu-man.ts` (`duongLichSu`, `duongPhienBan`) · `apps/app/lib/messages/tai-lieu.ts` (khoá `lichSu`) ·
`apps/app/test/tai-lieu-lich-su.dom.tsx`

- [ ] Bài dom E10m trước (đỏ), gồm khẳng định `translate="no"` và chiều đỏ.
- [ ] Trang server gọi tRPC, client chỉ vẽ; so từ bản đang dùng tới bản cũ (`soSanh`), nhãn «Quay lại sẽ thêm/bỏ»
  như bản mẫu đã chốt; nút «Quay lại phiên bản N» gọi `quayLai` rồi `router.push` tới màn duyệt.
- [ ] Xanh; commit.

### Task 7: Màn đọc lưu trữ, hộp đề xuất, màn duyệt theo loại

independent: false · phục vụ E11m, E11

**Files:** `.../[trang]/man-doc.tsx` · `.../[trang]/hop-luu-tru.tsx` (hộp chung cho lưu trữ và khôi phục) ·
`.../de-xuat/[id]/man-duyet.tsx` · `.../de-xuat/[id]/page.tsx` · messages · `apps/app/test/tai-lieu-luu-tru.dom.tsx`

- [ ] Bài dom E11m trước (đỏ).
- [ ] Trình đơn «…», hộp có `Field`/`Textarea`/`DialogClose`, dải `Alert` + `AlertAction placement="below"`, huy hiệu
  chờ; màn duyệt rẽ theo `loai`; làm mới qua `useCrmCache()`.
- [ ] Xanh; commit.

### Task 8: Danh sách «Đã lưu trữ», nhãn «Đã xử lý», từ điển

independent: false · phục vụ E8m, E12, E8u, E13j

**Files:** `.../tai-lieu/danh-sach-trang.tsx` · `.../tai-lieu/tai-lieu-search-params.ts` (`archived`) · `.../tai-lieu/cho-duyet.tsx` ·
messages · `apps/app/test/tai-lieu-da-xu-ly.dom.tsx` · `CONTEXT.md` (mục «Quay lại phiên bản», «Đề xuất lưu trữ», «Đề
xuất khôi phục»)

- [ ] Bài dom E8m trước (đỏ); viết; xanh; commit.

### Task 9: Bộ đo màn và ảnh bằng chứng

independent: false · phục vụ E10, E11, E12, E8u, E13j

**Files:** `_acceptance/lich-su-va-luu-tru-trang/rang/man.mjs` (theo `kho-tai-lieu/rang/man-lib.mjs`, gieo qua đường ghi
thật, `--phan lich-su|luu-tru|da-luu-tru`, `--chieu-do`)

- [ ] Viết, chạy ba phần qua `mot-luot.sh`, chạy ba chiều đỏ.
- [ ] Chép ảnh từ `.acceptance-runs/lich-su-va-luu-tru-trang/evidence/` vào `evidence/` của hồ sơ, commit trước S4 (E13j
  đọc ảnh song song với ui-check).
- [ ] Năm lệnh của kho (`test`, `check-types`, `lint`, `lint:slop`, `build`), soát mã giao diện bằng
  `web-design-guidelines`, rồi hợp đồng sang `implemented`.
