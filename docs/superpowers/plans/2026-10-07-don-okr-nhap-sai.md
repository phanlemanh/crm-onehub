# Dọn được OKR nhập sai — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người phụ trách xoá được mục tiêu OKR chưa có lịch sử, lấy lại được mục tiêu bỏ nhầm, danh sách mặc định cất mục tiêu đã bỏ vào dòng gập; bản ghi bán hàng chỉ xoá vĩnh viễn được sau lưu trữ.

**Architecture:** Một module `@crm/db/okr-muc-tieu-lich-su` giữ định nghĩa «có lịch sử» (danh sách quan hệ + hàm đếm), cả thủ tục `okr.xoaMucTieu` lẫn cờ `quyen.xoa` của `okr.objective` gọi nó. `okr.danhSach` và `okr.mine` tách mục tiêu đã bỏ ra mảng `daBo`; màn chỉ vẽ. Bán hàng sửa ba service ở `purge` và `archive`.

**Tech Stack:** NestJS + nestjs-trpc (`apps/api`), Prisma 7 (`@crm/db`), Zod (`@crm/validation`), Next.js + nuqs + TanStack Query (`apps/app`), `packages/ui` (shadcn), bun test, puppeteer-core cho thước màn.

**Spec:** `docs/superpowers/specs/2026-10-07-don-okr-nhap-sai-design.md` · hợp đồng `_acceptance/don-okr-nhap-sai/contract.md` · evals `_acceptance/don-okr-nhap-sai/evals.yaml`

## Global Constraints

- Không chú thích mã, ở tệp mới lẫn tệp sửa (`AGENTS.md`).
- Không `useEffect(` trong `apps/app` (skill `no-use-effect`).
- Đầu vào mới của router parse bằng Zod ở biên; không `Record<string, unknown>`, không `as unknown as`.
- Hằng số chỉnh được ở module cấu hình của khu (`okr-config.ts`, `archive/archive-config.ts`).
- UI chỉ từ `@crm/ui/components/<tên>`; không className đè style thành phần.
- Mọi chữ mới có bản vi và en khác nhau; tên mục tiêu trên màn mang `translate="no"`.
- Câu toast «Dùng lại» nguyên văn: «Mục tiêu đã về Nháp. Gửi duyệt lại khi sẵn sàng.» / «Mục tiêu đã về Nháp. Công bố lại khi sẵn sàng.».
- Thông điệp chặn xoá vĩnh viễn: «Chỉ xoá vĩnh viễn được bản ghi đã lưu trữ.».
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: vật lành xanh, phá vật thật trong bản sao thì đỏ với thông điệp ghim.
- Lệnh chứng của kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

## Review Focus

1. Mục tiêu hạn chế (`hienThi: gioi-han`) có người xem: xoá phải mang theo `okrNguoiXem`, và `daBo` không lộ mục tiêu hạn chế cho người không xem được — thêm ca vào E1 (người xem) và E7 (đã có).
2. Lưu trữ theo lô trên tập lẫn bản đã lưu trữ và chưa lưu trữ: chỉ bản chưa lưu trữ nhận ngày mới — ca `bulkArchive` hỗn hợp vào Task 4.
3. «Dùng lại» trong chu kỳ đã ẩn: phải trả câu `kyDaAn` — đã ở E5 qua bảng `GHI_VAO_KY_AN`.
4. Mục tiêu mà một KR của mục tiêu khác góp vào (đích là KR): `alignedBy` của KR là lịch sử — ca có sẵn trong bảng E2.
5. Danh sách «Đã bỏ (n)» khi bộ lọc phụ trách đang bật mà không mục tiêu đã bỏ nào khớp: không hiện dòng gập — ca thêm vào E8 (b').

---

### Task 1: Module «có lịch sử»

**Files:**
- Create: `packages/db/src/okr-muc-tieu-lich-su.ts`
- Modify: `packages/db/package.json` (khối `exports`: thêm `"./okr-muc-tieu-lich-su"` theo đúng dạng các mục `okr-*` khác)
- Test: `apps/api/test/okr-xoa-muc-tieu.spec.ts` (`describe("quan-he-du")`)

**Interfaces:**
- Produces:
  - `QUAN_HE_LICH_SU_MUC_TIEU = ["alignedBy","comments","nhinLai","mangSangDi","mangSangTu","ghiNhan","chuDeHoiY"] as const`
  - `QUAN_HE_DI_THEO_MUC_TIEU = ["participants","keyResults","alignments","followers","nguoiXem","mucTieuTuMau"] as const`
  - `QUAN_HE_LICH_SU_KR = ["alignedBy","checkIns","comments","soChup","doiDich","diemKr","bangChung","ghiNhan"] as const`
  - `QUAN_HE_DI_THEO_KR = ["nguonMay","viecKr"] as const`
  - `type LyDoLichSu = "da-cong-bo" | \`muc-tieu.${(typeof QUAN_HE_LICH_SU_MUC_TIEU)[number]}\` | \`kr.${(typeof QUAN_HE_LICH_SU_KR)[number]}\``
  - `lichSuMucTieu(tx: DbHoacTx, ids: string[]): Promise<Map<string, LyDoLichSu | null>>` — một `findMany` có `_count` cho quan hệ nhiều và `select` cho quan hệ một (`nhinLai`, `mangSangTu`, `chuDeHoiY`, `diemKr`), như `tinhTrangGiu` ở `okr-chu-ky-hien.ts`. Lý do trả về theo thứ tự: `da-cong-bo` trước, rồi quan hệ mục tiêu, rồi quan hệ KR.
- Phục vụ: E3 (AC-3); dùng bởi Task 2. `independent: false` (Task 2 cần).

- [ ] **Step 1:** Viết `describe("quan-he-du")`: đọc `db._runtimeDataModel` (parse bằng Zod như `okr-sua-an-chu-ky.spec.ts` dòng ~550), lấy trường `kind: "object"` của `OkrObjective`, `OkrKeyResult`, bỏ quan hệ cha (`cycle`, `division`, `department`, `person`, `owner`, `objective`); `expect` tập bằng hợp hai danh sách, giao bằng rỗng; in hai tập.
- [ ] **Step 2:** Chạy `bun run test -- "cd apps/api && bun test test/okr-xoa-muc-tieu.spec.ts -t quan-he-du"` → đỏ vì module chưa có.
- [ ] **Step 3:** Viết module theo Interfaces.
- [ ] **Step 4:** Chạy lại → xanh. Phá thử trong bản sao: bỏ `comments` khỏi `QUAN_HE_LICH_SU_KR` → đỏ in `OkrKeyResult.comments`; trả lại.
- [ ] **Step 5:** Commit `feat(okr): một nguồn cho «mục tiêu có lịch sử»`.

### Task 2: Xoá và dùng lại mục tiêu ở máy chủ

**Files:**
- Modify: `packages/db/src/okr-vet.ts` (thêm `"xoa-muc-tieu"`, `"dung-lai"` vào `HANH_DONG_VET`)
- Modify: `apps/api/src/okr/okr-config.ts` (`thongDiep.xoa = { dangChoDuyet, coLichSu(lyDo) }`, `thongDiep.dungLai = { chuaBo }`, nhãn lý do)
- Modify: `apps/api/src/okr/okr.service.ts` (`xoaMucTieu`, `dungLaiMucTieu`, `quyen.xoa`, `quyen.dungLai`)
- Modify: `apps/api/src/okr/okr.router.ts`, `apps/api/src/okr/okr.contracts.ts` (input `{ id }` dùng lại schema của `dropObjective`; output `dungLaiMucTieu` = `{ id, canhBao, canGuiDuyet }`; `quyen` thêm hai cờ)
- Modify: `apps/app/lib/messages/okr.ts` (nhãn tab Vết cho hai hành động mới, nếu có `Record<HanhDongVet, …>`)
- Modify: `apps/api/test/vai-chi-okr.spec.ts` (ma trận vai: hai thủ tục mới), `apps/api/test/okr-sua-an-chu-ky.spec.ts` (`GHI_VAO_KY_AN`: hai dòng)
- Test: `apps/api/test/okr-xoa-muc-tieu.spec.ts` (`xoa-sach`, `tu-choi-lich-su`, `dong-thoi`, `mot-nguon`, `quyen-pha`, `dung-lai`)

**Interfaces:**
- Consumes: `lichSuMucTieu`, các danh sách của Task 1.
- Produces: `okr.xoaMucTieu({ id }) → { id, canhBao: null }`; `okr.dungLaiMucTieu({ id }) → { id, canhBao: string | null, canGuiDuyet: boolean }`; `ObjectiveOutput.quyen.xoa`, `.dungLai: boolean`.
- Phục vụ: E1, E2, E19 (AC-1, AC-2), E4 (AC-4), E5 (AC-5), E6 (AC-6). `independent: false`.

`xoaMucTieu` (trong `$transaction`):
1. `assertSuaMucTieu` (ngoài giao dịch, như `dropObjective`), `assertKyGhiDuoc(tx, cycleId)`.
2. `SELECT id FROM "okrObjective" WHERE id = $1 FOR UPDATE`; `SELECT id FROM "okrKeyResult" WHERE "objectiveId" = $1 ORDER BY id FOR UPDATE`.
3. Đọc trạng thái; `cho-duyet` → 400 `T.xoa.dangChoDuyet`.
4. `lichSuMucTieu(tx, [id])`; khác null → 400 `T.xoa.coLichSu(lyDo)`.
5. Đọc `title, level, đơn vị, status, soKr` cho vết; xoá `okrViecKr`, `okrNguonKr` theo KR; xoá `okrMucTieuTuMau`; `okrObjective.delete`.
6. `vet(tx, userId, "xoa-muc-tieu", { cycleId, objectiveId }, before, null)`.

`dungLaiMucTieu`: `assertSuaMucTieu`; giao dịch: `assertKyGhiDuoc`, khoá hàng, trạng thái khác `da-bo` → 400 `T.dungLai.chuaBo`; `kiemTranMucTieu(tx, cycleId, dv, 1)`; `update { status: "nhap", droppedAt: null }`; vết `dung-lai`; `canGuiDuyet` từ `congBoHayGuiDuyet` cho người gọi.

`quyen.xoa = ghiDuoc && mt.canEdit && (status nhap || da-bo) && lichSu === null`; `quyen.dungLai = ghiDuoc && mt.canEdit && status === "da-bo"`. `ghiDuoc` là biến sẵn có trong hàm dựng `objective`; `lichSu` lấy bằng một lời gọi `lichSuMucTieu(this.db, [mt.id])` khi trạng thái là nhap hoặc da-bo.

- [ ] **Step 1:** Viết sáu `describe` theo `expected` của E1, E2, E19, E4, E5, E6 trong `evals.yaml` (bảng ca viết trước, gieo qua `goi(...)` của `okr-san.ts`, `gieoKyQuy`/`gieoMucTieuCongBo` của `okr-khep-san.ts`, `mucTieuNhap` của `okr-canh-kr-san.ts`). E19 dùng client `pg` riêng cho giao dịch thô và đọc `pg_stat_activity`.
- [ ] **Step 2:** Chạy `bun run test -- "cd apps/api && bun test test/okr-xoa-muc-tieu.spec.ts"` → đỏ (thủ tục chưa có).
- [ ] **Step 3:** Thêm hành động vết, thông điệp, contracts, service, router.
- [ ] **Step 4:** Thêm hai dòng vào `GHI_VAO_KY_AN` và ma trận `vai-chi-okr`.
- [ ] **Step 5:** Chạy lại cả tệp cùng `-t ma-tran` và `-t an-vang` → xanh. Phá thử từng chiều đỏ ghi ở `expected` (bỏ `checkIns` khỏi lichSu; bỏ khoá FOR UPDATE KR; bỏ điều kiện pha ở `quyen.xoa`; bỏ kiểm trần) → đỏ đúng thông điệp; trả lại.
- [ ] **Step 6:** Commit `feat(okr): xoá mục tiêu chưa có lịch sử, dùng lại mục tiêu đã bỏ`.

### Task 3: Mục tiêu đã bỏ tách khỏi danh sách

**Files:**
- Modify: `apps/api/src/okr/okr-xem.service.ts` (`danhSach`), `apps/api/src/okr/okr-xem.contracts.ts` (`danhSachOutput.daBo`)
- Modify: `apps/api/src/okr/okr.service.ts` (`mine`), `apps/api/src/okr/okr.contracts.ts` (`mineOutput.daBo`)
- Test: `apps/api/test/okr-xoa-muc-tieu.spec.ts` (`danh-sach-da-bo`)

**Interfaces:**
- Produces: `DanhSachOutput.daBo: MucTieuOutput[]`, `MineOutput.daBo: MucTieuOutput[]`.
- `danhSach`: khi `input.loc.trangThai.length === 0`, gọi `docMucTieu` một lần với lọc hiện có, rồi chia: `rows` là phần `status !== "da-bo"`, `daBo` phần còn lại (cùng thứ tự sắp `HANG_CAP`); `total = rows.length`. Có lọc trạng thái thì `daBo: []`.
- `mine`: chia y như vậy.
- Phục vụ: E7 (AC-7). `independent: false` (Task 5 cần khuôn).

- [ ] **Step 1:** Viết `describe("danh-sach-da-bo")` theo E7.
- [ ] **Step 2:** Chạy → đỏ (thiếu `daBo`).
- [ ] **Step 3:** Sửa contracts và hai service.
- [ ] **Step 4:** Chạy lại → xanh; phá thử: tính `daBo` bỏ `dieuKienXemMucTieu` → đỏ in id lọt; trả lại. Chạy thêm `bun run test -- --filter=api` để chắc người gọi `danhSach` khác (tác nhân, bài cũ) không vỡ.
- [ ] **Step 5:** Commit `feat(okr): danhSach và mine tách mục tiêu đã bỏ`.

### Task 4: Xoá vĩnh viễn chỉ sau lưu trữ, lưu trữ giữ ngày đầu

**Files:**
- Modify: `apps/api/src/archive/archive-config.ts` (`ARCHIVE.thongDiep.chuaLuuTru`)
- Modify: `apps/api/src/deals/deals.service.ts`, `apps/api/src/contacts/contacts.service.ts`, `apps/api/src/companies/companies.service.ts` (`purge` không `guard` mà `archivedAt` null → `BadRequestException(ARCHIVE.thongDiep.chuaLuuTru)`; `archive` → `updateMany({ where: { id, archivedAt: null }, data: { archivedAt: new Date() } })` rồi đọc tên, không có hàng → `NotFoundException` như cũ)
- Modify: `apps/api/test/record-delete.spec.ts` và bài nào khác `purge` bản chưa lưu trữ (lưu trữ trước khi purge — fixture phải là dữ liệu có thể tồn tại)
- Modify: `docs/api.md` mục «Deleting a record is archive first, purge later» (một gạch đầu dòng mới)
- Test: `apps/api/test/luu-tru-chat.spec.ts` (`purge-chua-luu-tru`, `luu-tru-giu-ngay`)

**Interfaces:**
- Produces: `ARCHIVE.thongDiep.chuaLuuTru = "Chỉ xoá vĩnh viễn được bản ghi đã lưu trữ."`
- Phục vụ: E14 (AC-12), E15 (AC-13). `independent: true`.

- [ ] **Step 1:** Viết hai `describe` theo E14, E15; REST gọi bằng `supertest` trên ứng dụng Nest thật (như `ma-tran-thu.ts`), đường `DELETE /api/deals/{id}`… (đọc `restMeta` của từng router để lấy tiền tố đúng). Thêm ca `bulkArchive` hỗn hợp (Review Focus 2).
- [ ] **Step 2:** Chạy → đỏ.
- [ ] **Step 3:** Sửa ba service và cấu hình.
- [ ] **Step 4:** `grep -rn "purge" apps/api/test` → sửa mọi bài purge bản chưa lưu trữ cho lưu trữ trước; chạy `bun run test -- --filter=api` → xanh. Phá thử: bản sao `deals.purge` bỏ kiểm → ca deals-trpc đỏ; trả lại.
- [ ] **Step 5:** Commit `fix(ban-hang): xoá vĩnh viễn chỉ sau lưu trữ, lưu trữ lại giữ ngày đầu`.

### Task 5: Danh sách OKR cất mục tiêu đã bỏ

**Files:**
- Create: `apps/app/app/(app)/[slug]/okr/nhom-da-bo.tsx` (client; `Collapsible` + `Button variant="ghost" size="sm"` như `ArchivedList`; nhận `ds: MucTieu[]`, `hienDonVi`, `danhDauCuaToi`; vẽ `BangMucTieu`)
- Modify: `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx` (dùng `byUnit.data.daBo`; trạng thái rỗng vẫn kèm nhóm), `apps/app/app/(app)/[slug]/okr/cua-toi.tsx` (dùng `mine.data.daBo`; Empty vẫn kèm nhóm)
- Modify: `apps/app/app/(app)/[slug]/okr/khoi-muc-tieu.tsx` (mục tiêu `da-bo`: `SimpleTableRow sub`, bỏ nhãn loại, không vẽ `TienDoMucTieu`/`TienDoMucTieuGon`, thay bằng chữ «Không tính tiến độ»; `data-da-bo`), `apps/app/app/(app)/[slug]/okr/tien-do-kr.tsx` (`NhanTrangThai`: `da-bo` → `variant="ghost"`)
- Modify: `apps/app/lib/messages/okr.ts` (`nhomDaBo: (n) => …`, `khongTinhTienDo`, vi/en)
- Test: `apps/app/test/okr-da-bo.dom.tsx` (`theo-don-vi`, `cua-toi`, `nhin-khac`)

**Interfaces:**
- Consumes: `DanhSachOutput.daBo`, `MineOutput.daBo` (Task 3).
- Phục vụ: E8 (AC-8), E9 (AC-9), E10 (AC-10). `independent: false`.

- [ ] **Step 1:** Viết `okr-da-bo.dom.tsx` theo E8, E9, E10, dựng tRPC giả theo nếp `muc-tieu-va-kr.dom.tsx` (`mock.module("@/lib/trpc/client")`, `NuqsTestingAdapter`, dữ liệu qua `danhSachOutput.parse` / `mineOutput.parse`). Thêm ca (b') của Review Focus 5.
- [ ] **Step 2:** Chạy `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-da-bo.dom.tsx` → đỏ.
- [ ] **Step 3:** Viết `nhom-da-bo.tsx`, sửa hai màn, khối, nhãn, chữ.
- [ ] **Step 4:** Chạy lại → xanh; chạy `muc-tieu-va-kr.dom.tsx` để chắc không vỡ. Phá thử: bỏ đóng mặc định → ca (a) đỏ; `NhanTrangThai` cùng biến thể → E10 đỏ; trả lại.
- [ ] **Step 5:** Commit `feat(okr): cất mục tiêu đã bỏ vào dòng gập ở Theo đơn vị và Của tôi`.

### Task 6: Ngăn chi tiết — Xoá mục tiêu và Dùng lại

**Files:**
- Modify: `apps/app/components/crm/record-sheet/objective-sheet.tsx` (`HanhDongMucTieu`: nháp `quyen.xoa` → mục «Xoá mục tiêu», ẩn «Bỏ mục tiêu»; thêm nhánh `da-bo` không bị `ghiDuoc(mt)` chặn: nút «Dùng lại» + mục «Xoá mục tiêu» khi `quyen.xoa`; `ConfirmDialog` xoá; xoá xong đóng ngăn bằng đường đóng ngăn sẵn có, làm mới danh sách; lỗi → toast thông điệp, làm mới `okr.objective`)
- Modify: `apps/app/lib/messages/okr.ts` (`sheet.xoa`, `sheet.hoiXoa{title,body,action,cancel}`, `sheet.daXoa`, `sheet.dungLai`, `sheet.daDungLai{guiDuyet,congBo}`, vi/en)
- Test: `apps/app/test/okr-xoa-muc-tieu.dom.tsx`

**Interfaces:**
- Consumes: `quyen.xoa`, `quyen.dungLai`, `okr.xoaMucTieu`, `okr.dungLaiMucTieu` (Task 2).
- Phục vụ: E11 (AC-11). `independent: false`.

- [ ] **Step 1:** Viết bài theo E11 (năm ca menu, ca xoá, ca lỗi, ca dùng lại hai nhánh), harness như `okr-sheet.dom.tsx`.
- [ ] **Step 2:** Chạy → đỏ.
- [ ] **Step 3:** Sửa ngăn và chữ.
- [ ] **Step 4:** Chạy lại → xanh; chạy `okr-sheet.dom.tsx` để chắc không vỡ. Phá thử: hiện «Bỏ mục tiêu» khi `quyen.xoa` → ca 1 đỏ; trả lại.
- [ ] **Step 5:** Commit `feat(okr): ngăn mục tiêu có Xoá cho nháp sạch và Dùng lại cho mục tiêu đã bỏ`.

### Task 7: Từ điển và tài liệu máy chủ

**Files:**
- Modify: `CONTEXT.md` (bốn mục **Xoá**, **Đã lưu trữ**, **Xoá vĩnh viễn**, **Bỏ · Dùng lại**, đặt cạnh **Lưu trữ**; mỗi mục có _Avoid_ và Vì sao theo nếp file)
- Modify: `docs/api.md` mục «OKR» (gạch đầu dòng `xoaMucTieu`, `dungLaiMucTieu`, `daBo`, module lịch sử và bài DMMF)
- Phục vụ: E16 (AC-14). `independent: true`.

- [ ] **Step 1:** Viết bốn mục từ điển và các đoạn `docs/api.md`.
- [ ] **Step 2:** Commit `docs: bộ chữ vòng đời vào từ điển, xoá và dùng lại mục tiêu vào docs/api`.

### Task 8: Thước của hồ sơ

**Files:**
- Create: `_acceptance/don-okr-nhap-sai/rang/soi-ma.mjs` (`--ca chu`, `--ca thiet-ke`, `--chieu-do`; suy gốc kho từ vị trí tệp; khuôn theo `_acceptance/sua-an-chu-ky-okr/rang/soi-ma.mjs`)
- Create: `_acceptance/don-okr-nhap-sai/rang/man-don-okr.mjs` (puppeteer-core qua `createRequire`; `canhCay` từ `_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs`; gieo qua API thật, `dev:session`, chụp mười ảnh E12, kiểm DB cho E13, E20, E21, dọn theo id; chạy qua `scripts/lan-do/tien-de.mjs --chay` như `sac_man_chrome`)
- Phục vụ: E12, E13, E20, E21 (AC-8, AC-9, AC-11), E16 (AC-14), E17 (AC-15). `independent: false` (cần mọi task trước).

- [ ] **Step 1:** Viết `soi-ma.mjs`; chạy `--ca chu`, `--ca thiet-ke` → xanh; `--chieu-do` → đỏ đúng hai vi phạm có tên.
- [ ] **Step 2:** Viết `man-don-okr.mjs`; dựng api 3811 và app 3810 của cây này; chạy `EVAL=E12 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/don-okr-nhap-sai/rang/man-don-okr.mjs"` → mười ảnh, ba kiểm DB xanh; phá thử nút «Dùng lại» gọi `dropObjective` trong bản sao → E13 đỏ; trả lại.
- [ ] **Step 3:** Chạy năm lệnh chứng của kho.
- [ ] **Step 4:** Commit `test(don-okr-nhap-sai): thước chữ, sàn thiết kế và thước màn`.
