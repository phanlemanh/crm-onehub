# VK19 bo-okr-chi-don-vi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bộ OKR của một bộ phận chỉ gồm mục tiêu của chính nó ở mọi thẻ con và ở danh sách Bộ OKR; đường sang đơn vị khác là một menu ở mắt xích cuối dòng vị trí.

**Architecture:** Máy chủ đổi một nhánh của `dieuKienDonVi` và đổi nguồn số của `danhSachBo` sang số riêng theo khoá đơn vị; Toàn cảnh giữ `gopToanCanh`. Giao diện thêm `BreadcrumbMenu` ở `packages/ui`, hàm `lanCan` thuần ở `theo-don-vi/lan-can.ts`, gỡ ô chọn đơn vị, lưới trực thuộc, mục gập Đã bỏ; Đã bỏ thành nút trên `DataTable actions` ghi `daBoOkr` bằng `nuqs`.

**Tech Stack:** NestJS + tRPC + Prisma (`apps/api`), Next.js App Router + TanStack Query + nuqs (`apps/app`), `@crm/ui` (shadcn), `bun test`.

**Spec:** `docs/superpowers/specs/2026-10-28-bo-okr-chi-don-vi-design.md`, hợp đồng `_acceptance/bo-okr-chi-don-vi/contract.md`, phép đo `_acceptance/bo-okr-chi-don-vi/evals.yaml` (E1–E9 — tên ca và thông điệp đỏ ở đó là bắt buộc nguyên văn).

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Không đổi lược đồ, không migration.
- `apps/app/lib/messages/*.ts`, `CONTEXT.md`, `_acceptance/config.yaml`: chỉ THÊM dòng (LUAT đợt mục 7).
- Thước của hồ sơ đã ký: chỉ sửa sau khi `yeu-cau cham-tep` được trả lời; mỗi hồ sơ một dòng sổ `fix` `decided_by` chủ kho, đo hai chiều.
- Thành phần mới ở `packages/ui`, không `className` đổi màu/góc/khoảng cách ở chỗ gọi.
- Tên đơn vị mang `translate="no"`.
- Hỏi-1: giữ thứ tự HT1 AC-2 (bộ phận trước). Hỏi-2: ẩn nút Đã bỏ khi n = 0. Hỏi-3: không có sự kiện đo bấm menu.

## Review Focus

- Bộ phận không có phòng con (bp:C): menu không có nhóm Trực thuộc, không nhóm rỗng có nhãn — ca trong E5 (1).
- Phòng ban chưa xếp: Thuộc là OneHub, Cùng cấp là các khối và phòng chưa xếp khác ở cấp gốc? — chốt: Cùng cấp của phòng chưa xếp = các phòng chưa xếp khác (không gồm khối); ca pb:X trong E5 (1) chỉ khẳng định Thuộc [goc].
- `countByUnit` chưa về: mục menu không kèm số, không hiện «0 mục tiêu» — ca thêm trong E5 (2).
- Lọc trạng thái đang bật: nút Đã bỏ không hiện — ca trong E6.
- Chuyển đơn vị qua menu khi `daBoOkr=1`: liên kết menu không mang `daBoOkr` (bộ mới mở ở danh sách đang chạy) — ca thêm trong E5 (2).

---

### Task 1: Máy chủ — bộ chỉ của một đơn vị, danh sách đọc số riêng

**Files:**
- Modify: `apps/api/src/okr/okr-xem.service.ts:168-195` (`dieuKienDonVi`), `:286`, `:444`, `:506`, `:698`, `danhSachBo`
- Modify: `apps/api/src/okr/okr-khep.service.ts:630`
- Modify: `apps/api/src/okr/toan-canh.ts` (thêm `soRiengTheoKhoa`)
- Modify: `apps/api/src/okr/bo-okr.ts` (`DauVaoDanhSachBo.toanCanh` → `soRieng`)
- Test: `apps/api/test/bo-okr-chi-don-vi.spec.ts` (mới)

**Interfaces:**
- Produces: `dieuKienDonVi(unit: DonViChon): Prisma.OkrObjectiveWhereInput` (bỏ `q`); `soRiengTheoKhoa(ds: MucTieuTinh[], nhip: NhipKy): HangToanCanh[]` — một hàng cho mỗi khoá `khoaCuaMucTieu` có mục tiêu, `cap` suy từ `level`; `DauVaoDanhSachBo.soRieng: readonly HangToanCanh[]`.

- [ ] **Step 1: Viết spec ba ca** `bcd-bon-the`, `bcd-so-rieng`, `bcd-toan-canh` theo đúng dữ liệu và ma trận ở E1–E3 (gieo qua `goi(...)` như `okr-danh-sach-bo.spec.ts`, dùng `okr-san`). Mỗi ô lệch ném lỗi mang đúng thông điệp chiều đỏ của evals (vd `bcd-bon-the: bp:B lot phong ban con (danhSach P1a)`). Bộ phận D rỗng có phòng Q một mục tiêu; một KR của P1a cập nhật tự tin thấp.
- [ ] **Step 2: Chạy, thấy đỏ** — `bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/bo-okr-chi-don-vi.spec.ts"`; kỳ vọng `bcd-bon-the` đỏ ở P1a, `bcd-so-rieng` đỏ ở tienDo gộp, `bcd-toan-canh` xanh.
- [ ] **Step 3: Sửa** — nhánh `bp` trả `{ level: "bo-phan", divisionId: unit.id }`; bỏ `q` khỏi chữ ký và năm chỗ gọi; `danhSachBo` lấy `mucTieuTinh(q, userId, cycleId, {})` một lần và truyền `soRiengTheoKhoa(ds, { tuanKy, homNay })` (không gọi `toanCanhTheo`).
- [ ] **Step 4: Chạy lại, thấy xanh**; chạy thêm `okr-danh-sach-bo.spec.ts`, `okr-toan-canh.spec.ts`, `hop-tuan-mo-dung-bo.spec.ts`, ghi lại ca đỏ để Task 5 xử.
- [ ] **Step 5: Commit** `feat(bo-okr-chi-don-vi): bộ của bộ phận chỉ gồm mục tiêu của chính nó`.

### Task 2: Menu dòng vị trí

**Files:**
- Modify: `packages/ui/src/components/breadcrumb.tsx` (thêm `BreadcrumbMenu`)
- Create: `apps/app/app/(app)/[slug]/okr/theo-don-vi/lan-can.ts`
- Modify: `apps/app/app/(app)/[slug]/okr/theo-don-vi/vi-tri-bo.tsx`
- Modify: `apps/app/lib/messages/okr-vo-khu.ts` (thêm khoá `boOkr.menu`: `thuoc`, `cungCap`, `trucThuoc`, `doiBo(ten)`, `demMucTieu(n)`, `chuaCoRieng`)
- Test: `apps/app/test/bo-okr-chi-don-vi.dom.tsx` (mới, ca `bcd-menu`)

**Interfaces:**
- Produces: `BreadcrumbMenu({ label, ariaLabel, children, align? })` — `BreadcrumbItem` chứa `DropdownMenuTrigger` (`data-menu-vi-tri`) bọc `BreadcrumbPage translate="no"` + chevron, nội dung `DropdownMenuContent` bề rộng có trần theo màn; `lanCan(cay: CayDuLieu, don: DonChonOkr): { cha: DonLanCan | null; cungCap: DonLanCan[]; trucThuoc: DonLanCan[] } | null` với `DonLanCan = { don: DonChonOkr; khoa: string; ten: string }`, `null` cho `nguoi`; `ViTriBo({ ky, tenBo, don?, the?, dem? })`.

- [ ] **Step 1: Viết ca `bcd-menu`** — (1) ma trận 6 đơn vị của E5 trên `lanCan`; (2) DOM theo E5 (ba nhãn nhóm theo thứ tự, «2 mục tiêu» ở P1, href giữ `donOkr=pb:P1`, `kyOkr=q4`, `xemOkr=hop-tuan`, Esc trả tiêu điểm, trang `nguoi:` không có `[data-menu-vi-tri]`); thêm hai ô của Review Focus: `dem` undefined → không chữ «mục tiêu», URL có `daBoOkr=1` → href không có `daBoOkr`.
- [ ] **Step 2: Chạy, thấy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-chi-don-vi.dom.tsx -t bcd-menu`.
- [ ] **Step 3: Cài** — `lanCan` đi theo thứ tự `org.tree` (goc → khối rồi phòng chưa xếp; bp → cha goc, cùng cấp các khối khác, trực thuộc phòng; pb trong khối → cha khối, cùng cấp các phòng khác của khối; pb chưa xếp → cha goc, cùng cấp các phòng chưa xếp khác). Liên kết dựng bằng `hrefThe({ goc, soDo, don, ky, the: xem })`. Nhóm rỗng không vẽ.
- [ ] **Step 4: Chạy lại, thấy xanh.**
- [ ] **Step 5: Commit** `feat(bo-okr-chi-don-vi): menu ở mắt xích cuối dòng vị trí`.

### Task 3: Trang một bộ gọn — gỡ hai đường thừa, nút Đã bỏ, câu rỗng bộ phận

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx`, `hang-cong-cu.tsx`, `bang.tsx` (prop `actions`)
- Delete: `theo-don-vi/chon-don-vi.tsx`, `theo-don-vi/don-vi-con.tsx`; xoá `luaChonDonVi`, `luaChonNguoi`, `khopTim`, `conTrucTiep`, `LuaChonDonVi`, `DonViCon` khỏi `bang-don-vi.ts` nếu không còn chỗ dùng
- Create: `theo-don-vi/nut-da-bo.tsx`
- Modify: `apps/app/lib/search-param-keys.ts` (thêm `daBo: "daBoOkr"`), `okr-search-params.ts` (`okrParsers` thêm `parseAsBoolean`)
- Modify: `apps/app/app/(app)/[slug]/okr/trang-thai-okr.tsx` (thêm `RongBoPhan`), `apps/app/lib/messages/okr-vo-khu.ts` (thêm `boOkr.rongBoPhan`)
- Test: `apps/app/test/bo-okr-chi-don-vi.dom.tsx` (ca `bcd-gon`, `bcd-da-bo`, `bcd-rong`)

**Interfaces:**
- Consumes: `ViTriBo` mới của Task 2.
- Produces: `NutDaBo({ n, bat, doi })` (`data-nut-da-bo`, `aria-pressed`, chữ «Đã bỏ (n)»; trả `null` khi `n === 0`); `BangDonVi` nhận `actions?: ReactNode`; `RongBoPhan({ tenDon, tenKy })` (`data-rong-bo-phan`).

- [ ] **Step 1: Viết ba ca** theo E4, E6, E7 (12 ô của `bcd-gon`; nuqs testing adapter cho `bcd-da-bo`; 3 ô rỗng cho `bcd-rong`), tRPC giả parse bằng contracts như `trang-bo-okr.dom.tsx`.
- [ ] **Step 2: Chạy, thấy đỏ** (lệnh như Task 2 với `-t bcd-gon|bcd-da-bo|bcd-rong`).
- [ ] **Step 3: Sửa** — `hang` chỉ còn khi có bộ lọc riêng của thẻ (danh-sach dùng `search` của DataTable như nay, không còn `HangCongCuDonVi chon`); bật `daBoOkr` thì `rows` của bảng = `byUnit.data.daBo`, nút ẩn khi `loc.trangThai.length > 0`; bộ phận rỗng (`don.loai === "bp"`, `rows` và `daBo` rỗng, không lọc) dùng `RongBoPhan`.
- [ ] **Step 4: Chạy lại, thấy xanh**; chạy `okr-theo-don-vi.dom.tsx`, `trang-bo-okr.dom.tsx`, `bo-okr-co-so.dom.tsx`, ghi ca đỏ cho Task 5.
- [ ] **Step 5: Commit** `feat(bo-okr-chi-don-vi): trang một bộ gọn, Đã bỏ thành nút`.

### Task 4: Họp tuần OneHub rỗng

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx` (`ChuaKrCongBo`), `don-vi-co-kr.tsx` (xoá `DonViCoKr`, `donViCoKr`; giữ `XemMoiBo`), `apps/app/lib/messages/okr-hop-tuan-bo.ts` (thêm `rong.chiSangMenu`)
- Test: `apps/app/test/bo-okr-chi-don-vi.dom.tsx` (ca `bcd-hop-tuan-goc`)

- [ ] **Step 1: Viết ca** theo E8 (spy đếm 0 lần gọi `okr.toanCanh`).
- [ ] **Step 2: Chạy, thấy đỏ.**
- [ ] **Step 3: Sửa** — goc: `trong` = câu chỉ sang menu + `XemMoiBo`, `duoi` = null, giống nhánh không-goc cộng câu.
- [ ] **Step 4: Chạy lại, thấy xanh**; chạy `hop-tuan-mo-dung-bo.dom.tsx`, ghi ca đỏ.
- [ ] **Step 5: Commit** `feat(bo-okr-chi-don-vi): Họp tuần OneHub rỗng chỉ sang menu`.

### Task 5: Hồ sơ đã ký đổi luật

- [ ] **Step 1:** Gom danh sách tệp thước đỏ từ Task 1, 3, 4 (dự kiến: `apps/api/test/okr-toan-canh.spec.ts`, `okr-danh-sach-bo.spec.ts`, `hop-tuan-mo-dung-bo.spec.ts`, `apps/app/test/trang-bo-okr.dom.tsx`, `bo-okr-co-so.dom.tsx`, `hop-tuan-mo-dung-bo.dom.tsx`, `okr-theo-don-vi.dom.tsx`, tệp của `gop-y-dung-cho`, `tro-ly-okr-tom-tat`) cùng hồ sơ chủ của từng tệp.
- [ ] **Step 2:** `node <đợt>/loi/dieu-phoi.mjs yeu-cau cham-tep --chan --hang bo-okr-chi-don-vi --tep <danh sách>` kèm nội dung: luật đổi theo Q1 (a), Q7 chủ kho 25/10. Chờ trả lời ở `tra-loi/<mã>.json`.
- [ ] **Step 3:** Được cho → sửa đúng khẳng định đổi luật (không đổi logic thước khác); mỗi hồ sơ một dòng `fix` ở `decisions.jsonl` của chính hồ sơ ấy, `decided_by` chủ kho (trích «Đồng ý hết theo khuyến nghị» 25/10), đo hai chiều (xanh trên cây này, đỏ khi lật lại nhánh `bp`).
- [ ] **Step 4: Commit** `fix(bo-okr-chi-don-vi): thước hồ sơ đã ký theo luật bộ một đơn vị`.

### Task 6: Thước màn E9

**Files:**
- Create: `_acceptance/bo-okr-chi-don-vi/rang/man-bo-okr-chi-don-vi.mjs` (khuôn từ thước màn của `bo-okr-co-so`/`trang-bo-okr`, dùng `rang/canh-cay.mjs`)

- [ ] **Step 1:** Script mở `okr:mau` trên phiên đo, in ĐẾM bốn thẻ × ba khối so `okr.soBo`, ĐẾM QUAN HỆ 9 ô, đi bộ khối → menu → phòng (hai bấm), chụp sáu ảnh khi `BCD_CHEP_ANH=1`; ô lệch thoát 1 với `bcd-man: <khối> <cột> lech`.
- [ ] **Step 2:** Chạy một lần qua `do:man` khi không có lượt S4 (hỏi giám sát nếu khoá s4 đang giữ) để chắc nó chạy; không chép ảnh vào hồ sơ ở S3.
- [ ] **Step 3: Commit** `test(bo-okr-chi-don-vi): thước màn E9`.

### Task 7: Hết S3

- [ ] `CONTEXT.md` mục Bộ OKR thêm một dòng (chỉ thêm).
- [ ] Trả `.claude/launch.json`, dừng máy chủ proto.
- [ ] `bun run lint`, `bun run check-types`, `bun run test`, `bun run build` — đỏ thì sửa.
- [ ] Vẽ bản đồ trên bản sạch, `--check` trên archive mới, commit.
- [ ] Đẩy nhánh, `gh pr create --draft --base onehub -R phanlemanh/crm-onehub`, contract `status: implemented`.
