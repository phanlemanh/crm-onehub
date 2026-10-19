# Vá Gantt: lịch bảy ngày, dự án 300 việc — kế hoạch

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lịch làm cả tuần lưu và đọc lại đúng ở mọi đường đọc; dự án đủ 300 việc vẫn sửa được mốc, phụ thuộc, ngày.

**Architecture:** Thêm cột `AppSetting.khongNghiTuan` (mặc định `false`), bật khi `datNgayNghiTuan([])`; `docLichLam` đọc cờ trước luật cũ. Tách lời kiểm `docDuAnMo` (chỉ dự án mở) khỏi lời kiểm mới `docDuAnNhanViec` (khoá hàng `duAn`, dự án mở, dưới trần 300) cho ba đường thêm việc.

**Tech Stack:** Prisma 7 + Postgres, NestJS tRPC, React 19, bun test.

**Spec:** `docs/superpowers/specs/2026-10-19-va-gantt-lich-bay-ngay-design.md` · hợp đồng `_acceptance/va-gantt-lich-bay-ngay/contract.md` · evals `_acceptance/va-gantt-lich-bay-ngay/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Tên migration `<date -u +%Y%m%d%H%M%S>_lich_bay_ngay`, giờ UTC thật (luật 1 đợt); chỉ `ADD COLUMN`, không `UPDATE`.
- Không sửa bài đã ký của DA4: `apps/api/test/lich-lam-viec.spec.ts`, `apps/api/test/du-an*.spec.ts`, `packages/db/test/lich-*.spec.ts`, `_acceptance/du-an-gantt/**`.
- Lời từ chối giữ nguyên chữ: `DU_AN.thongDiep.viecToiDa` «Một dự án chứa tối đa 300 việc.», `DU_AN.thongDiep.daDong` «Dự án đã đóng.».
- Mặc định T7, CN chỉ sống ở `LICH_LAM_VIEC.ngayNghiTuanMacDinh`.
- Bài mới ghi `appSetting` thì chụp `ngayNghiTuan` + `khongNghiTuan` trước bài, trả lại ở `afterAll`, rồi tự kiểm sau dọn (lời 'vg: don lich de lai co <json>').
- Dữ liệu thử dựng qua hàm ghi thật (`taoViec`, `taoDuAn`, `taoMoc`, `taoPhuThuoc`), không chèn thẳng bảng `viec`.
- Chữ mặc định của mọi lời ném lấy đúng từ trường `expected` của eval tương ứng.

## Review Focus

- Bài mới chạy trước bài `dg_lich` trong cùng lượt `bun run test` — kho dùng chung; bước dọn phải trả cờ → Task 1 (afterAll + tự kiểm, phá thử Step 10), Task 6 (đột biến g).
- `datNgayNghiTuan([7])` sau khi lịch đang làm cả tuần phải trả cờ về `false` — Task 1 (bảng E4).
- Hai người cùng thêm việc thứ 300 → đúng một người được — Task 3 (ca tranh nhau).
- `doiDuAn` từ dự án A sang dự án B đủ 300 → bị chặn; từ B ra ngoài → được (đường đưa P299 về 299) — Task 3.
- Việc con của việc trong dự án đã đóng → «Dự án đã đóng.» chứ không phải lời trần — Task 3 (dòng PD × viec-con).

---

### Task 1: Lịch làm cả tuần — cột cờ, đọc, ghi

**Files:**
- Modify: `packages/db/prisma/schema.prisma` (model `AppSetting`, dưới `ngayNghiTuan`)
- Create: `packages/db/prisma/migrations/<UTC>_lich_bay_ngay/migration.sql`
- Modify: `packages/db/src/du-an.ts` (`docLichLam`)
- Modify: `apps/api/src/lich-lam-viec/lich-lam-viec.service.ts` (`datNgayNghiTuan`)
- Test: `packages/db/test/lich-bay-ngay.spec.ts` (E2), `apps/api/test/lich-bay-ngay.spec.ts` (E1, E3, E4)
- Modify: `_acceptance/config.yaml` — đã có khoá `vg_lich_api`, `vg_lich_db`

**Phục vụ:** E1, E2, E2b, E3, E4 · **independent:** false (chung lượt `bun run test` và gói `@crm/db` với Task 4)

**Interfaces:**
- Produces: cột `khongNghiTuan Boolean @default(false)`; `docLichLam(tx): Promise<LichLam>` — `khongNghiTuan` true → `ngayNghiTuan: []`, còn lại như cũ.

- [ ] **Step 1: Viết bài DB đỏ** `packages/db/test/lich-bay-ngay.spec.ts`, describe `vg-lich-db`: (1) `information_schema.columns` cho `appSetting.khongNghiTuan` đòi `data_type='boolean'`, `is_nullable='NO'`, `column_default='false'`; (2) bảng năm dòng `{hang, mang, khongNghi, ra}` như E2 qua `db.appSetting.upsert` (dòng «không có hàng» xoá hàng `SETTINGS_ID` sau khi chụp, khôi phục ở afterAll); (3) dữ liệu cũ: `update({data:{ngayNghiTuan: []}})` rồi `[3, 7]` không chạm cờ → `[6, 7]` rồi `[3, 7]`. Đếm dòng đã so, khác 5 ném 'vg: bang doc thieu <n>'.
- [ ] **Step 2: Chạy, xác nhận đỏ** `bun run test -- "cd packages/db && TZ=Asia/Ho_Chi_Minh bun test test/lich-bay-ngay.spec.ts"` → đỏ vì cột chưa có.
- [ ] **Step 3: Schema + migration.** Thêm `khongNghiTuan Boolean @default(false)`; tạo migration bằng `bun run db:migrate` theo `docs/setup.md` (hay `prisma migrate diff`), đổi tên thư mục sang giờ UTC thật `_lich_bay_ngay`; tệp chỉ có một `ALTER TABLE "appSetting" ADD COLUMN "khongNghiTuan" BOOLEAN NOT NULL DEFAULT false;`. `bun run db:generate`.
- [ ] **Step 4: `docLichLam`** chọn thêm `khongNghiTuan`; `cai?.khongNghiTuan` → `ngayNghiTuan: []`.
- [ ] **Step 5: Chạy bài DB → xanh.**
- [ ] **Step 6: Viết bài API đỏ** `apps/api/test/lich-bay-ngay.spec.ts` ba describe `vg-lich-rong` (E1), `vg-tu-doi-bay-ngay` (E3), `vg-hoan-tac` (E4), dùng `batApp`, `goi`, `nguoi`, `duAnThu`, `viecCoLich`, `lichCua` của `test/support`; `beforeAll` chụp hàng `appSetting`, `afterAll` trả lại rồi tự kiểm. E3: phụ thuộc qua `duAn.phuThuoc.tao`, đổi hạn qua `viec.doiLich`, đối chứng lịch `[6, 7]` trong cùng describe.
- [ ] **Step 7: Chạy, xác nhận đỏ** `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/lich-bay-ngay.spec.ts"` → 'vg: get rong thanh [6,7] lan 1'.
- [ ] **Step 8: `datNgayNghiTuan`** ghi `{ ngayNghiTuan: ds, khongNghiTuan: ds.length === 0 }` ở cả `create` và `update`.
- [ ] **Step 9: Chạy bài API, bài DB và bài đã ký trong cùng một lượt → xanh:** `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/lich-bay-ngay.spec.ts test/lich-lam-viec.spec.ts test/du-an-lich.spec.ts"`.
- [ ] **Step 10: Phá thử tay:** bỏ dòng cờ ở `docLichLam` → E1, E3 đỏ đúng lời; bỏ `afterAll` → chạy `lich-bay-ngay` rồi `lich-lam-viec` cùng lượt → 'llv: mac dinh sai []'. Hoàn lại, commit.

### Task 2: Gantt không tô cuối tuần khi lịch làm cả tuần

**Files:**
- Test: `packages/ui/test/gantt-bay-ngay.dom.tsx` (E3b) — không đổi mã `gantt-du-an.tsx`

**Phục vụ:** E3b · **independent:** false (tuần tự, rẻ hơn gộp nhánh)

- [ ] **Step 1:** Mount `GanttDuAn` theo khuôn `packages/ui/test/gantt-du-an.dom.tsx` với hai việc `2026-10-22→2026-10-27`, `lich {ngayNghiTuan: [], ngayLe: []}`: đếm `[data-off-day]` khác 0 ném 'vg gantt: to ngay nghi khi lich rong <n>'; đối chứng `[6, 7]`: 0 ô off-day ở 24/10, 25/10 ném 'vg gantt: doi chung T7 CN khong to'.
- [ ] **Step 2:** `cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --preload ./test/setup-dom.ts ./test/gantt-bay-ngay.dom.tsx` → xanh.
- [ ] **Step 3: Phá thử tay:** `weekendDays: undefined` ở `gantt-du-an.tsx` khi lịch rỗng → đỏ đúng lời. Hoàn lại, commit.

### Task 3: Trần 300 chỉ chặn thêm việc, có khoá

**Files:**
- Modify: `packages/db/src/viec-ghi.ts` (`docDuAnMo` bỏ trần; thêm `docDuAnNhanViec`; `taoViec`, `doiDuAn` gọi nó)
- Test: `apps/api/test/du-an-tran-viec.spec.ts` (E5, E6, E6b), có thể thêm hàm dựng vào `apps/api/test/support/du-an-gieo.ts` (chỉ thêm)

**Phục vụ:** E5, E6, E6b · **independent:** false (chung `@crm/db`, chung lượt test với Task 1)

**Interfaces:**
- Produces: `docDuAnNhanViec(tx: DbGhi, duAnId: string): Promise<{ id: string; ten: string }>` — `SELECT id FROM "duAn" WHERE id = $1 FOR UPDATE`, rồi `docDuAnMo`, rồi đếm `viec` theo `duAnId`, `>= DU_AN.viecToiDa` ném `LoiViec("khong-hop-le", DU_AN.thongDiep.viecToiDa)`.

- [ ] **Step 1: Viết bài đỏ.** Dựng P300, P299, PD (300 việc, một mốc, một phụ thuộc, rồi đóng qua `duAn.dong`) bằng `taoViec` trong giao dịch. `MA_TRAN` 27 dòng `{thaoTac, duAn, ket, loi}` viết tay theo E5; mỗi dòng gọi thủ tục tRPC thật qua `goi` bởi người giao; dòng thêm việc × P299 sau đó `viec.doiDuAn({id, duAnId: null})` và đòi P299 về 299. Ca tranh nhau trên P299 mới: hai `db.$transaction(tx => taoViec(tx, …))` qua `Promise.allSettled`.
- [ ] **Step 2: Chạy, xác nhận đỏ** `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test --timeout 120000 test/du-an-tran-viec.spec.ts"` → 'vg tran: them-moc P300 ra …'.
- [ ] **Step 3: Tách lời kiểm** theo Interfaces; `taoViec` (dòng 248) và `doiDuAn` (dòng 631) gọi `docDuAnNhanViec`.
- [ ] **Step 4: Chạy bài mới và các bài đã ký của DA4 cùng lượt → xanh:** `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test --timeout 120000 test/du-an-tran-viec.spec.ts test/du-an.spec.ts test/du-an-lich.spec.ts test/du-an-quyen.spec.ts"`.
- [ ] **Step 5: Phá thử tay:** trả trần vào `docDuAnMo` → E5 đỏ; bỏ trần ở `docDuAnNhanViec` → 'vg tran: tao-viec P300 ra'; bỏ `FOR UPDATE` → 'vg tran: tranh nhau'. Hoàn lại, commit.

### Task 4: Tài liệu

**Files:** `docs/api.md` (mục «Lịch làm việc», «Vòng đời» của phần Dự án), `CONTEXT.md` (mục «Lịch làm việc», chỉ thêm câu)

**Phục vụ:** E9 · **independent:** false

- [ ] **Step 1:** `docs/api.md`: thay câu «`AppSetting.ngayNghiTuan` rỗng nghĩa là mặc định Thứ Bảy, Chủ nhật.» bằng: chưa đặt thì nghỉ T7, CN; bỏ chọn hết thì `khongNghiTuan` bật, không nghỉ ngày nào. Mục «Vòng đời»: trần 300 việc chỉ chặn thêm việc (tạo, việc con, chuyển vào), khoá hàng dự án; mốc, phụ thuộc, đổi ngày chỉ chặn khi đóng.
- [ ] **Step 2:** `CONTEXT.md` mục «Lịch làm việc» thêm: «Quản trị bỏ chọn hết thì không nghỉ ngày nào trong tuần.» Commit.

### Task 5: Răng màn (ui-check)

**Files:** Create `_acceptance/va-gantt-lich-bay-ngay/rang/man.mjs` theo khuôn `_acceptance/du-an-gantt/rang/man.mjs` (thư viện `_acceptance/kho-tai-lieu/rang/man-lib.mjs`: `moDo`, `d.lam`, `d.chup`)

**Phục vụ:** E8, E8b · **independent:** false

- [ ] **Step 1:** Bước theo `expected` của E8 (0–4) rồi E8b (1–3): dựng dự án có việc 22/10→27/10 qua `d.lam`; đếm `[data-thu][data-state="on"]` trên `/settings/lich-lam-viec`, `[data-off-day]` trên Gantt; bấm ô bằng chuột thật, chờ toast «Đã lưu» (`settingsMessages("vi")`), tải lại; bấm «Hoàn tác» trên toast. Chụp đúng tám ảnh tên trong E8, E8b ở 1280 và 375; đo `document.scrollingElement.scrollWidth`. Thiếu `PHIEN_DO`/`API_URL` thoát 2. Dòng cuối 'va-gantt-lich-bay-ngay man: dat'.
- [ ] **Step 2:** Xin lượt `s4` của đợt (máy chỉ một phiên đo), chạy `BANG_CHUNG=.acceptance-runs/va-gantt-lich-bay-ngay/evidence bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/va-gantt-lich-bay-ngay/rang/man.mjs"` → mã 0; mở ảnh tự soát; nhả lượt. Commit răng (không commit ảnh tạm).

### Task 6: Răng đột biến

**Files:** Create `_acceptance/va-gantt-lich-bay-ngay/rang/dot-bien.mjs` theo khuôn `_acceptance/du-an-gantt/rang/dot-bien.mjs` (`dungBanSao`, `goBanSao`, `thayMotLan` của `_acceptance/ca-chap-chon-cach-ly/rang/ban-sao.mjs`)

**Phục vụ:** E7 · **independent:** false

- [ ] **Step 1:** Bảy đột biến (a) (b) (d) (e) (f) (g) (h) của E7, mỗi cái một `thayMotLan` trên đúng một chuỗi nguồn, chạy đúng lệnh `config:` của eval và đòi đỏ với lời ghim; bản lành chạy cùng các lệnh phải xanh. Chưa đỏ đúng lời → in '<ma> song', thoát 1.
- [ ] **Step 2:** Xin lượt `s4` của đợt, chạy `node _acceptance/va-gantt-lich-bay-ngay/rang/dot-bien.mjs` → mã 0. Nhả lượt. Commit.

### Task 7: Năm lệnh cổng và khép S3

- [ ] **Step 1:** `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run test`, `bun run build` từ gốc kho (chạy nền, có giữ nhịp khi giữ khoá) → cả năm mã 0.
- [ ] **Step 2:** Đặt `status: implemented` trong `contract.md`, commit, sang S4.
